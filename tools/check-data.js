#!/usr/bin/env node
/*
 * Validates the editable data files. Run:  node tools/check-data.js
 *  - dictionary: unique hanzi, one pinyinNum syllable per character, related targets exist
 *  - characters: every character used in the dictionary has an entry
 *  - dialogue/menu/world text: every Chinese character can be found in the dictionary
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
['data/dictionary.js', 'data/characters.js', 'data/world.js', 'data/menu.js', 'data/quests.js', 'data/ui-text.js', 'data/writing.js', 'data/strokes.js', 'data/chat.js', 'js/core/pattern.js', 'js/core/util.js', 'js/core/dictionary.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const MSC = ctx.window.MSC;
const errors = [];
const warn = [];

// ── dictionary ──
const seen = new Set();
MSC.data.dictionary.forEach((e) => {
  if (seen.has(e.hanzi)) errors.push(`duplicate dictionary entry: ${e.hanzi}`);
  seen.add(e.hanzi);
  ['pinyin', 'pinyinNum', 'english', 'pos', 'category'].forEach((k) => { if (!e[k]) errors.push(`${e.hanzi}: missing ${k}`); });
  const syl = (e.pinyinNum || '').split(/\s+/).filter(Boolean);
  if (syl.length !== [...e.hanzi].length) errors.push(`${e.hanzi}: pinyinNum has ${syl.length} syllables for ${[...e.hanzi].length} characters (${e.pinyinNum})`);
  syl.forEach((s) => { if (!/^[a-z]+[0-5]$/.test(s)) errors.push(`${e.hanzi}: bad syllable "${s}"`); });
  (e.related || []).forEach((r) => { if (!seen.has(r) && !MSC.data.dictionary.some((x) => x.hanzi === r)) errors.push(`${e.hanzi}: related word "${r}" is not in the dictionary`); });
});

// ── related / exclude hygiene ──
MSC.data.dictionary.forEach((e) => {
  const rel = e.related || [], exc = e.exclude || [];
  if (rel.includes(e.hanzi)) errors.push(`${e.hanzi}: lists itself as related`);
  if (new Set(rel).size !== rel.length) errors.push(`${e.hanzi}: related has duplicates`);
  rel.filter((r) => exc.includes(r)).forEach((r) => errors.push(`${e.hanzi}: "${r}" is both related and excluded`));
  exc.forEach((x) => { if (!MSC.dict.get(x)) errors.push(`${e.hanzi}: excluded word "${x}" is not in the dictionary`); });
  if (rel.length > 6) warn.push(`${e.hanzi}: ${rel.length} curated related words — keep only the ones genuinely used together`);
  rel.forEach((r) => {                                  // a link should usually work both ways (or be found automatically)
    const other = MSC.dict.get(r);
    if (!other) return;
    const back = MSC.dict.related(other, 99).some((g) => g.items.some((i) => i.hanzi === e.hanzi));
    if (!back) warn.push(`${e.hanzi} → ${r} is one-way (${r} doesn't list ${e.hanzi}); fine if intended`);
  });
});

// ── characters ──
const used = new Set();
MSC.data.dictionary.forEach((e) => [...e.hanzi].forEach((c) => used.add(c)));
used.forEach((c) => { if (!MSC.data.characters[c]) warn.push(`no component info for character ${c}`); });
Object.keys(MSC.data.characters).forEach((c) => { if (!used.has(c)) warn.push(`characters.js has unused entry ${c}`); });

// ── writing (Master Wang) ──
(function checkWriting() {
  const W = MSC.data.writing;
  const strokes = MSC.data.strokes || {};
  const ruleIds = new Set(W.rules.map((r) => r.id));
  const all = [...W.tutorial.map((c) => ({ ...c, tutorial: true })), ...W.pool];
  const chars = new Set();
  all.forEach((c) => {
    const id = `writing ${c.char}`;
    if (chars.has(c.char)) errors.push(`${id}: listed twice`);
    chars.add(c.char);
    ['pinyin', 'meaning', 'word'].forEach((k) => { if (!c[k]) errors.push(`${id}: missing ${k}`); });
    if (!c.mnemonic || !c.mnemonic.trim()) errors.push(`${id}: missing mnemonic`);
    if (!c.tutorial && ![1, 2, 3].includes(c.tier)) errors.push(`${id}: tier must be 1, 2 or 3 (got ${c.tier})`);
    const sd = strokes[c.char];
    if (!sd || !sd.strokes || !sd.strokes.length || sd.strokes.length !== (sd.medians || []).length) {
      errors.push(`${id}: no stroke-order data in data/strokes.js (run tools/build-strokes.js)`);
    }
    const word = MSC.dict.get(c.word);
    if (!word) errors.push(`${id}: linked word "${c.word}" is not in the dictionary`);
    else if (!c.word.includes(c.char)) errors.push(`${id}: linked word "${c.word}" is not spelled with ${c.char}`);
    (c.rules || []).forEach((r) => { if (!ruleIds.has(r)) errors.push(`${id}: unknown stroke rule "${r}"`); });
    Object.keys(c.tips || {}).forEach((k) => {
      const n = sd ? sd.strokes.length : 0;
      if (!(Number(k) >= 0 && Number(k) < n)) errors.push(`${id}: stroke tip points to stroke ${Number(k) + 1}, but ${c.char} has ${n} strokes`);
    });
    (c.confusable || []).forEach((o) => { if (!all.some((x) => x.char === o) && !MSC.dict.get(o)) errors.push(`${id}: confusable "${o}" is unknown`); });
  });
  [1, 2, 3].forEach((t) => {
    const n = W.pool.filter((c) => c.tier === t).length;
    if (n < W.lessonSize) errors.push(`writing tier ${t} has ${n} characters; it needs at least ${W.lessonSize} to fill a lesson`);
  });
  Object.keys(strokes).forEach((c) => { if (!chars.has(c)) warn.push(`strokes.js has data for ${c}, which is not in data/writing.js`); });
  W.rules.forEach((r) => { if (!r.title || !r.tip) errors.push(`writing rule ${r.id}: needs title and tip`); });
})();

// ── HSK 1–2 target: 200 words, and every character of them can be learned at Master Wang's ──
(function checkHsk() {
  const hsk = MSC.data.dictionary.filter((e) => e.hsk);
  hsk.forEach((e) => { if (![1, 2].includes(e.hsk)) errors.push(`${e.hanzi}: hsk must be 1 or 2`); });
  if (hsk.length < 200) errors.push(`only ${hsk.length} HSK 1–2 words; the target is 200`);
  const taught = new Set([...MSC.data.writing.tutorial, ...MSC.data.writing.pool].map((c) => c.char));
  hsk.forEach((e) => [...e.hanzi].forEach((c) => { if (!taught.has(c)) errors.push(`HSK word ${e.hanzi}: character ${c} cannot be learned at Master Wang (add it to data/writing.js)`); }));
  console.log(`HSK 1–2: ${hsk.length} words (${hsk.filter((e) => e.hsk === 1).length} at level 1, ${hsk.filter((e) => e.hsk === 2).length} at level 2)`);
})();

// ── chat (Xiao Li) ──
const chatCoverage = (function checkChat() {
  const C = MSC.data.chat, PT = MSC.pattern, D = MSC.dict;
  const hasZh = (t) => /[㐀-鿿]/.test(t || '');
  const covered = new Set();
  const seg = (where, text) => {
    D.segment(text).forEach((t) => {
      if (t.kind === 'unknown') errors.push(`chat ${where}: "${t.hanzi}" is not in the dictionary (in "${text}")`);
      else if (t.kind === 'word') covered.add(t.hanzi);
      else if (t.kind === 'number') t.parts.forEach((p) => covered.add(p));
    });
  };
  if (!C.dialogues || C.dialogues.length < 5) errors.push(`chat needs at least 5 dialogues (has ${C.dialogues ? C.dialogues.length : 0})`);
  const syls = (text) => D.syllables(text);
  C.dialogues.forEach((d) => {
    const id = `chat ${d.id}`;
    const nodes = d.nodes || {};
    if (!nodes[d.start]) { errors.push(`${id}: start node "${d.start}" does not exist`); return; }
    // graph: next ids exist, everything reachable, everything can reach an ending, and the dialogue really branches
    let branching = 0, ends = 0;
    Object.entries(nodes).forEach(([nid, n]) => {
      const w = `${id}.${nid}`;
      if (n.end) {
        ends++;
        if (!n.npc) errors.push(`${w}: an ending needs Xiao Li's closing line (npc)`);
        if (n.replies && n.replies.length) errors.push(`${w}: an ending must not have replies`);
        return;
      }
      if (!n.goal || hasZh(n.goal)) errors.push(`${w}: goal is required and must be English only`);
      if (!n.tip) errors.push(`${w}: tip is required (it is the first Hint)`);
      if (!n.replies || !n.replies.length) { errors.push(`${w}: needs at least one reply`); return; }
      if (n.replies.length > 1) branching++;
      if (nid !== d.start && !n.npc) errors.push(`${w}: only the start node may leave out Xiao Li's line`);
      n.replies.forEach((r, i) => {
        if (!nodes[r.next]) errors.push(`${w}.replies[${i}]: next "${r.next}" does not exist`);
        if (!r.say || !r.say.length) errors.push(`${w}.replies[${i}]: no accepted answers (say)`);
        if (!r.en) errors.push(`${w}.replies[${i}]: en (the English meaning) is required`);
        if (n.replies.length > 1 && !r.label) errors.push(`${w}.replies[${i}]: a branch needs a label`);
      });
    });
    if (!branching) errors.push(`${id}: never branches (no node with two or more replies)`);
    if (!ends) errors.push(`${id}: has no ending`);
    const reach = new Set([d.start]);
    for (let grow = true; grow;) { grow = false; [...reach].forEach((nid) => ((nodes[nid] || {}).replies || []).forEach((r) => { if (nodes[r.next] && !reach.has(r.next)) { reach.add(r.next); grow = true; } })); }
    Object.keys(nodes).forEach((nid) => { if (!reach.has(nid)) errors.push(`${id}.${nid}: unreachable`); });
    const canEnd = (nid, seen = new Set()) => { const n = nodes[nid]; if (!n || seen.has(nid)) return false; if (n.end) return true; seen.add(nid); return (n.replies || []).some((r) => canEnd(r.next, seen)); };
    Object.keys(nodes).forEach((nid) => { if (!canEnd(nid)) errors.push(`${id}.${nid}: cannot reach an ending`); });

    // every random slot combination must produce valid, segmentable, unambiguous text
    const names = Object.keys(d.slots || {});
    let combos = [{}];
    names.forEach((nm) => { combos = combos.flatMap((c) => d.slots[nm].map((v) => ({ ...c, [nm]: v.hanzi, [`${nm}.en`]: v.en }))); });
    combos.forEach((vars) => {
      Object.entries(nodes).forEach(([nid, n]) => {
        const w = `${id}.${nid}`;
        const left = (t) => PT.fill(t, vars).match(/\{[\w.]+\}/);
        if (n.npc) { const z = PT.fill(n.npc.hanzi, vars); if (left(n.npc.hanzi)) errors.push(`${w}: unknown placeholder in npc line`); seg(`${w} npc`, z); if (!n.npc.english) errors.push(`${w}: npc.english is required`); }
        if (n.end) return;
        const seen = new Map();
        (n.replies || []).forEach((r, ri) => (r.say || []).forEach((pat) => {
          const filled = PT.fill(pat, vars);
          if (/\{[\w.]+\}/.test(filled)) errors.push(`${w}: unknown placeholder in "${pat}"`);
          PT.expand(filled).forEach((v) => {
            seg(`${w} reply`, v);
            const key = (syls(v) || []).join(' ');
            if (!key) errors.push(`${w}: "${v}" has no Chinese`);
            else if (seen.has(key) && seen.get(key) !== ri) errors.push(`${w}: "${v}" is accepted by two different branches`);
            seen.set(key, ri);
          });
        }));
        if (/\{[\w.]+\}/.test(PT.fill(n.goal || '', vars))) errors.push(`${w}: unknown placeholder in goal`);
      });
    });
  });
  const hsk = MSC.data.dictionary.filter((e) => e.hsk);
  const hit = hsk.filter((e) => covered.has(e.hanzi));
  console.log(`Chat: ${C.dialogues.length} dialogues use ${hit.length} of ${hsk.length} HSK words (${Math.round((100 * hit.length) / hsk.length)}%)`);
  if (process.env.SHOW_UNCOVERED) console.log('uncovered HSK words: ' + hsk.filter((e) => !covered.has(e.hanzi)).map((e) => e.hanzi).join(' '));
  return { hit: hit.length, total: hsk.length, missing: hsk.filter((e) => !covered.has(e.hanzi)).map((e) => e.hanzi) };
})();

// ── all Chinese text in the other data files must be segmentable ──
function walk(node, trail, out) {
  if (typeof node === 'string') { if (/[㐀-鿿]/.test(node)) out.push([trail, node]); }
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${trail}[${i}]`, out));
  else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => {
    if (k === 'english' || k === 'text') return;
    // Wang's mnemonics, tips and meanings are plain text (never run through the word-tapping renderer): only his dialogue lines are checked
    if (trail.startsWith('writing') && ['mnemonic', 'tips', 'tip', 'meaning', 'example', 'char', 'confusable', 'word'].includes(k)) return;
    walk(v, `${trail}.${k}`, out);
  });
}
const writingChars = new Set([...MSC.data.writing.tutorial, ...MSC.data.writing.pool].map((c) => c.char));  // characters Wang teaches may appear on their own in his text
const texts = [];
['quests', 'menu', 'world', 'ui', 'writing'].forEach((n) => walk(MSC.data[n], n, texts));
texts.forEach(([where, text]) => {
  const clean = text.replace(/\{[A-Za-z]+\}/g, '');   // placeholders are filled at run time
  MSC.dict.segment(clean).forEach((t) => { if (t.kind === 'unknown' && !(where.startsWith('writing') && writingChars.has(t.hanzi))) errors.push(`${where}: "${t.hanzi}" is not in the dictionary  (in "${text}")`); });
});
// Objectives must be English only.
['gateObjective', 'brokeObjective', 'roundDone'].forEach((k) => {
  if (/[㐀-鿿]/.test(MSC.data.quests.barista[k])) errors.push(`barista.${k} must not contain Chinese`);
});
MSC.data.ui.quest.forEach((q) => { if (/[㐀-鿿]/.test(q.text)) errors.push(`quest step "${q.text}" must not contain Chinese`); });

warn.forEach((w) => console.log(`warning: ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`ERROR: ${e}`)); process.exit(1); }
console.log(`OK — ${MSC.data.dictionary.length} words, ${Object.keys(MSC.data.characters).length} characters, ${texts.length} Chinese strings checked.`);

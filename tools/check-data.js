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
require('./data-files.js').all()
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

// ── HSK: every word of the official list (data/hsk.js) exists, and every character of it can be learned at Master Wang's ──
(function checkHsk() {
  const H = MSC.data.hsk, D = MSC.dict;
  if (!H || !H.levels) { errors.push('data/hsk.js is missing'); return; }
  const taught = new Set([...MSC.data.writing.tutorial, ...MSC.data.writing.pool].map((c) => c.char));
  Object.entries(H.levels).forEach(([l, words]) => {
    words.forEach((w) => {
      if (!D.get(w)) errors.push(`HSK ${l} word ${w} is missing from the dictionary (add it to data/vocab/hsk${l}.js)`);
      [...w].forEach((c) => {
        if (!taught.has(c)) errors.push(`HSK word ${w}: character ${c} cannot be learned at Master Wang (add it to data/writing.js)`);
        if (!MSC.data.characters[c]) errors.push(`HSK word ${w}: character ${c} has no characters.js entry`);
      });
    });
  });
  console.log(`${H.standard}: ${Object.entries(H.levels).map(([l, w]) => `HSK ${l} ${w.length} words`).join(', ')}`);
})();

// ── chats (Xiao Li, the market shopkeeper … — every set in MSC.data.chats) ──
function checkChat(C, who) {
  const PT = MSC.pattern, D = MSC.dict;
  const hasZh = (t) => /[㐀-鿿]/.test(t || '');
  const covered = new Set();
  const seg = (where, text) => {
    D.segment(text).forEach((t) => {
      if (t.kind === 'unknown') errors.push(`${who} chat ${where}: "${t.hanzi}" is not in the dictionary (in "${text}")`);
      else if (t.kind === 'word') covered.add(t.hanzi);
      else if (t.kind === 'number') t.parts.forEach((p) => covered.add(p));
    });
  };
  const minD = C.family || C.school ? 2 : 5;                                          // a family member at Xiao Ming's home only needs a couple
  if (!C.dialogues || C.dialogues.length < minD) errors.push(`${who}: chat needs at least ${minD} dialogues (has ${C.dialogues ? C.dialogues.length : 0})`);
  const syls = (text) => D.syllables(text);
  C.dialogues.forEach((d) => {
    const id = `${who} chat ${d.id}`;
    const nodes = d.nodes || {};
    if (!nodes[d.start]) { errors.push(`${id}: start node "${d.start}" does not exist`); return; }
    // graph: next ids exist, everything reachable, everything can reach an ending, and the dialogue really branches
    let branching = 0, ends = 0;
    Object.entries(nodes).forEach(([nid, n]) => {
      const w = `${id}.${nid}`;
      if (n.end) {
        ends++;
        if (!n.npc) errors.push(`${w}: an ending needs the NPC's closing line (npc)`);
        if (n.replies && n.replies.length) errors.push(`${w}: an ending must not have replies`);
        return;
      }
      if (!n.goal || hasZh(n.goal)) errors.push(`${w}: goal is required and must be English only`);
      if (!n.tip) errors.push(`${w}: tip is required (it is the first Hint)`);
      if (!n.replies || !n.replies.length) { errors.push(`${w}: needs at least one reply`); return; }
      if (n.replies.length > 1) branching++;
      if (nid !== d.start && !n.npc) errors.push(`${w}: only the start node may leave out the NPC's line`);
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
  console.log(`${who}: ${C.dialogues.length} dialogues use ${hit.length} of ${hsk.length} HSK words (${Math.round((100 * hit.length) / hsk.length)}%)`);
  if (process.env.SHOW_UNCOVERED) console.log('uncovered HSK words: ' + hsk.filter((e) => !covered.has(e.hanzi)).map((e) => e.hanzi).join(' '));
  return { hit: hit.length, total: hsk.length, missing: hsk.filter((e) => !covered.has(e.hanzi)).map((e) => e.hanzi) };
}
const chatCoverage = checkChat(MSC.data.chat, 'Xiao Li');
Object.entries(MSC.data.chats || {}).forEach(([id, set]) => { if (set !== MSC.data.chat) checkChat(set, id); });

// ── phrases (data/phrases.js) ──
(function checkPhrases() {
  const P = MSC.data.phrases, D = MSC.dict;
  if (!P) { errors.push('data/phrases.js is missing'); return; }
  const chapters = new Set(P.chapters.map((c) => c.id)), ids = new Set();
  let withExtras = 0;
  const per = {};
  P.chapters.forEach((c) => { if (!c.id || !c.title) errors.push(`phrase chapter ${c.id}: id and title are required`); });
  P.list.forEach((p) => {
    const w = `phrase ${p.id}`;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errors.push(`${w}: id must be lowercase-with-dashes`);
    if (ids.has(p.id)) errors.push(`${w}: duplicate id`); ids.add(p.id);
    if (!p.hanzi || !p.english) errors.push(`${w}: hanzi and english are required`);
    if (!chapters.has(p.chapter)) errors.push(`${w}: unknown chapter "${p.chapter}"`);
    if (/[㐀-鿿]/.test(p.english || '')) errors.push(`${w}: english must not contain Chinese`);
    const toks = D.segment(p.hanzi || '');
    toks.forEach((t) => { if (t.kind === 'unknown') errors.push(`${w}: "${t.hanzi}" is not in the dictionary (in "${p.hanzi}")`); });
    const ws = toks.filter((t) => t.kind === 'word').map((t) => t.hanzi);
    if (!ws.length) errors.push(`${w}: has no words`);
    if (ws.some((x) => !D.level(x) && !/^[，。？！、]$/.test(x))) withExtras++;
    if (p.note) D.segment(p.note).forEach((t) => { if (t.kind === 'unknown') errors.push(`${w}.note: "${t.hanzi}" is not in the dictionary`); });
    const lvl = Math.max(0, ...ws.map((x) => D.level(x)));
    per[lvl] = (per[lvl] || 0) + 1;
  });
  if (P.list.length && withExtras > P.list.length * 0.2) warn.push(`phrases: ${withExtras} of ${P.list.length} use non-HSK words (target ≤ 20%)`);
  console.log(`phrases: ${P.list.length} in ${P.chapters.length} chapters (${Object.entries(per).map(([l, n]) => `${l === '0' ? 'no HSK word' : `HSK ${l}`} ${n}`).join(', ')}; ${withExtras} use extra words)`);
})();

// ── coverage: where can each HSK word be met (seen) and used (said by the player), counting only content of that level
//    or below (data/levels.js rules)? — a report, not an error. SHOW_COVERAGE=1 lists the gaps.
(function coverage() {
  const D = MSC.dict, PT = MSC.pattern;
  const wordsOf = (text) => D.segment(text || '').filter((t) => t.kind === 'word').map((t) => t.hanzi);
  const top = (texts) => Math.max(1, ...texts.flatMap(wordsOf).map((w) => D.level(w)));
  const items = [];             // { level, where, seen: [texts], used: [texts] }
  Object.entries(MSC.data.chats || {}).forEach(([npc, set]) => set.dialogues.forEach((d) => {
    const nodes = Object.entries(d.nodes), all = [];
    nodes.forEach(([, n]) => { if (n.npc) all.push(n.npc.hanzi.replace(/\{[\w.]+\}/g, '')); (n.replies || []).forEach((r) => (r.say || []).forEach((pat) => PT.expand(pat.replace(/\{[\w.]+\}/g, '')).forEach((v) => all.push(v)))); });
    const level = d.level || top(all);
    nodes.forEach(([nid, n]) => {
      const used = []; (n.replies || []).forEach((r) => (r.say || []).forEach((pat) => PT.expand(pat.replace(/\{[\w.]+\}/g, '')).forEach((v) => used.push(v))));
      items.push({ level, where: `${npc}:${d.id}`, seen: [n.npc ? n.npc.hanzi : '', ...used], used });
    });
  }));
  Object.values(MSC.data.world.stages).forEach((st) => (st.objects || []).forEach((o) => items.push({ level: o.level || D.level(o.hanzi) || 2, where: st.id, seen: [o.hanzi, ...(o.text || []).map((l) => l.hanzi)], used: [] })));
  [...(MSC.data.menu.drinks || []), ...(MSC.data.menu.foods || [])].forEach((m) => items.push({ level: m.level || 1, where: 'cafe', seen: [m.hanzi], used: [m.hanzi] }));
  (MSC.data.phrases ? MSC.data.phrases.list : []).forEach((p) => items.push({ level: top([p.hanzi]), where: 'phrase-book', seen: [p.hanzi], used: [p.hanzi] }));
  Object.entries(MSC.data.hsk.levels).forEach(([l, ws]) => {
    const seen = new Map(), used = new Map(), extras = new Set(), all = new Set();
    items.filter((it) => it.level <= Number(l)).forEach((it) => {
      it.seen.forEach((t) => wordsOf(t).forEach((w) => { all.add(w); if (!D.level(w)) extras.add(w); if (!seen.has(w)) seen.set(w, new Set()); seen.get(w).add(it.where); }));
      it.used.forEach((t) => wordsOf(t).forEach((w) => { if (!used.has(w)) used.set(w, new Set()); used.get(w).add(it.where); }));
    });
    const n0 = ws.filter((w) => !seen.has(w)), u0 = ws.filter((w) => !used.has(w)), u3 = ws.filter((w) => (used.get(w) || new Set()).size >= 3);
    console.log(`coverage at level ${l}: ${ws.length - n0.length}/${ws.length} HSK ${l} words appear, ${ws.length - u0.length} can be used by the player, ${u3.length} in 3+ places · extras ${Math.round((100 * extras.size) / Math.max(1, all.size))}% of the words met (target ≤ 20%)`);
    if (process.env.SHOW_COVERAGE) {
      console.log(`  never met at level ${l}: ${n0.join(' ')}`);
      console.log(`  met but never used: ${u0.filter((w) => seen.has(w)).join(' ')}`);
      console.log(`  used in only 1–2 places: ${ws.filter((w) => used.has(w) && used.get(w).size < 3).join(' ')}`);
      console.log(`  extras met at level ${l}: ${[...extras].join(' ')}`);
    }
  });
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
// ── art (data/art/*.js) ──
(function checkArt() {
  const A = MSC.art, used = new Set();
  Object.values(MSC.data.world.stages || {}).forEach((st) => {
    (st.objects || []).concat(st.entities).forEach((t) => used.add(t.sprite || t.id));
    (st.scenery || []).forEach((s) => s.className && used.add(s.className));
  });
  used.add('player'); used.add('bubble'); used.add('compass');
  A.order.forEach((k) => {
    const d = A.defs[k];
    if (d.w !== 16 || ![16, 24].includes(d.h)) errors.push(`art ${k}: ${d.w}×${d.h} — sprites are 16 wide and 16 or 24 tall`);
    if (d.meta.rowsOk === false) errors.push(`art ${k}: ASCII rows are not all the same length`);
    if (!d.p.some(Boolean)) errors.push(`art ${k}: is empty`);
    if (!used.has(k)) warn.push(`art ${k}: not used by any stage thing`);
  });
  Object.entries(A.tiles).forEach(([k, vs]) => vs.forEach((v, i) => { if (!v.p.every(Boolean)) errors.push(`tile ${k}#${i}: ground tiles must be fully painted (no transparent pixels)`); }));
  const people = ['player', 'barista', 'wang', 'friend', 'passerby', 'grocer'];
  people.forEach((k) => { if (!A.has(k)) errors.push(`art: person "${k}" is missing`); });
  console.log(`art: ${A.order.length} sprites, ${Object.keys(A.tiles).length} ground tiles`);
})();

// ── stages (data/stages/*.js) ──
(function checkStages() {
  const Wd = MSC.data.world, D = MSC.dict;
  const stages = Object.values(Wd.stages || {});
  if (!Wd.stages || !Wd.stages[Wd.start]) { errors.push(`world.start "${Wd.start}" is not a stage`); return; }
  const ids = new Map();
  const claim = (id, where) => { if (ids.has(id)) errors.push(`${where}: id "${id}" is also used in ${ids.get(id)} (ids must be unique across all stages)`); ids.set(id, where); };
  stages.forEach((st) => {
    const w = `stage ${st.id}`;
    if (!st.map || st.map.length !== st.rows) errors.push(`${w}: map has ${st.map ? st.map.length : 0} rows, rows says ${st.rows}`);
    (st.map || []).forEach((row, y) => { if (row.length !== st.cols) errors.push(`${w}: map row ${y} has ${row.length} columns, cols says ${st.cols}`); });
    const blockedT = [...Wd.blockedTiles, ...(st.blockedTiles || [])];
    new Set((st.map || []).join('')).forEach((ch) => { if (!MSC.art.tileFor(st.id, ch)) errors.push(`${w}: tile letter "${ch}" has no ground art (A.tile in data/art)`); });
    if (!st.name || !st.hanzi) errors.push(`${w}: name and hanzi are required`);
    if (!['street', 'shop', 'market', 'cafe', 'home', 'school'].includes(st.sound)) errors.push(`${w}: sound must be street | shop | market | cafe | home | school`);
    const inMap = (x, y) => x >= 0 && y >= 0 && x < st.cols && y < st.rows && (st.map[y] || '')[x] !== undefined;
    const tileOk = (x, y) => inMap(x, y) && !blockedT.includes(st.map[y][x]);
    const solid = new Map();
    const place = (t, kind) => {
      claim(t.id, `${w} ${kind}`);
      if (t.emoji) errors.push(`${w} ${kind} ${t.id}: remove \`emoji\` — things are pixel art now (draw it in data/art/${st.id}.js as "${t.sprite || t.id}")`);
      if (!MSC.art.has(t.sprite || t.id)) errors.push(`${w} ${kind} ${t.id}: no art called "${t.sprite || t.id}" (draw it in data/art/${st.id}.js)`);
      if (!inMap(t.x, t.y)) { errors.push(`${w} ${kind} ${t.id}: (${t.x},${t.y}) is outside the map`); return; }
      if (!tileOk(t.x, t.y) && kind !== 'object') errors.push(`${w} ${kind} ${t.id}: stands on a blocked tile (${st.map[t.y][t.x]})`);
      const k = `${t.x},${t.y}`;
      if (solid.has(k)) errors.push(`${w}: ${t.id} and ${solid.get(k)} are on the same tile (${k})`);
      solid.set(k, t.id);
    };
    (st.objects || []).forEach((o) => {
      place(o, 'object');
      if (!o.hanzi || !D.get(o.hanzi)) errors.push(`${w} object ${o.id}: hanzi "${o.hanzi}" must be a dictionary word`);
      (o.text || []).forEach((l, i) => {
        if (!l.hanzi || !l.english) errors.push(`${w} object ${o.id}.text[${i}]: hanzi and english are required`);
        D.segment(l.hanzi || '').forEach((t) => { if (t.kind === 'unknown') errors.push(`${w} object ${o.id}.text[${i}]: "${t.hanzi}" is not in the dictionary`); });
      });
      if (o.note) D.segment(o.note).forEach((t) => { if (t.kind === 'unknown') errors.push(`${w} object ${o.id}.note: "${t.hanzi}" is not in the dictionary`); });
      (o.listen || []).forEach((t) => { if (!D.syllables(t)) errors.push(`${w} object ${o.id}.listen: "${t}" has characters that are not in the dictionary`); });
      if (o.level !== undefined && ![1, 2].includes(o.level)) errors.push(`${w} object ${o.id}: level must be 1 or 2`);
    });
    (st.scenery || []).forEach((sc, i) => {
      if (/\p{Extended_Pictographic}/u.test(sc.text || '')) errors.push(`${w} scenery[${i}]: no emoji in the game any more — sign text is Chinese only ("${sc.text}")`);
      if (sc.text && !['scenery-sign', 'scenery-banner'].includes(sc.className)) errors.push(`${w} scenery[${i}]: only signs (className scenery-sign) may carry text`);
      if (!sc.text && !['road-dash', 'zebra', 'shelter'].includes(sc.className)) errors.push(`${w} scenery[${i}]: texture must be road-dash, zebra or shelter — anything else is a thing: make it an object`);
      const zhPart = (sc.text || '').replace(/[^㐀-鿿]/g, '');
      if (zhPart) D.segment(zhPart).forEach((t) => { if (t.kind === 'unknown') errors.push(`${w} scenery[${i}]: "${t.hanzi}" is not in the dictionary`); });
    });
    const doorsHere = [];
    st.entities.forEach((e) => {
      const door = e.kind === 'door';
      place(e, door ? 'door' : 'person');
      ['name', 'hanzi', 'badge', 'pill'].forEach((k) => { if (!e[k]) errors.push(`${w} ${e.id}: ${k} is required`); });
      if (door) {
        doorsHere.push(e);
        if (!Wd.stages[e.to]) errors.push(`${w} door ${e.id}: leads to unknown stage "${e.to}"`);
        else {
          const to = Wd.stages[e.to], a = e.arrive;
          if (!a) {                                   // arrive left out: a free tile beside the door that leads back must exist
            const back = (to.entities || []).find((t) => t.kind === 'door' && t.to === st.id);
            const blockedTo = [...Wd.blockedTiles, ...(to.blockedTiles || [])];
            const free = (x, y) => x >= 0 && y >= 0 && x < to.cols && y < to.rows && !blockedTo.includes(to.map[y][x]) && ![...(to.entities || []), ...(to.objects || [])].some((t) => t.x === x && t.y === y);
            if (!back) errors.push(`${w} door ${e.id}: ${e.to} has no door back to ${st.id}`);
            else if (![[0, 1], [0, -1], [-1, 0], [1, 0]].some(([dx, dy]) => free(back.x + dx, back.y + dy))) errors.push(`${w} door ${e.id}: no free tile beside ${back.id} in ${e.to} to arrive on`);
          } else {
            const blockedTo = [...Wd.blockedTiles, ...(to.blockedTiles || [])];
            if (a.x < 0 || a.y < 0 || a.x >= to.cols || a.y >= to.rows || blockedTo.includes(to.map[a.y][a.x])) errors.push(`${w} door ${e.id}: arrive (${a.x},${a.y}) is not walkable in ${e.to}`);
            else if ([...(to.entities || []), ...(to.objects || [])].some((t) => t.x === a.x && t.y === a.y)) errors.push(`${w} door ${e.id}: arrive (${a.x},${a.y}) is occupied in ${e.to}`);
            else if ((to.entities || []).some((t) => t.kind === 'door' && t.x === a.x && t.y === a.y)) errors.push(`${w} door ${e.id}: arrive (${a.x},${a.y}) is on a door in ${e.to} (you would bounce straight back)`);
          }
        }
      } else if (!e.stand) errors.push(`${w} ${e.id}: stand {x,y} is required for people`);
      else if (!tileOk(e.stand.x, e.stand.y)) errors.push(`${w} ${e.id}: stand (${e.stand.x},${e.stand.y}) is not walkable`);
    });
    // doors: every stage leads back to the street; the street leads to every other stage
    if (st.id !== Wd.start && !doorsHere.some((d) => d.to === Wd.start)) errors.push(`${w}: needs a door back to ${Wd.start}`);
    if (st.id === Wd.start) stages.filter((o) => o.id !== st.id).forEach((o) => { if (!doorsHere.some((d) => d.to === o.id)) errors.push(`${w}: needs a door to ${o.id}`); });
    // everything must be reachable from where the player starts (doors are only entered, never crossed)
    const seen = new Set([`${st.playerStart.x},${st.playerStart.y}`]), queue = [[st.playerStart.x, st.playerStart.y]];
    if (!tileOk(st.playerStart.x, st.playerStart.y)) errors.push(`${w}: playerStart is not walkable`);
    const isDoorAt = (x, y) => doorsHere.some((d) => d.x === x && d.y === y);
    while (queue.length) {
      const [cx, cy] = queue.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy, k = `${nx},${ny}`;
        if (!tileOk(nx, ny) || seen.has(k)) return;
        const s2 = solid.get(k);
        if (s2 && !isDoorAt(nx, ny)) return;
        seen.add(k);
        if (!isDoorAt(nx, ny)) queue.push([nx, ny]);
      });
    }
    doorsHere.forEach((d) => { if (!seen.has(`${d.x},${d.y}`)) errors.push(`${w}: door ${d.id} cannot be reached`); });
    st.entities.filter((e) => e.kind !== 'door' && e.stand).forEach((e) => { if (!seen.has(`${e.stand.x},${e.stand.y}`)) errors.push(`${w}: ${e.id} cannot be reached (stand ${e.stand.x},${e.stand.y})`); });
    (st.objects || []).forEach((o) => { if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${o.x + dx},${o.y + dy}`))) errors.push(`${w}: object ${o.id} cannot be reached`); });
    // not too cramped: at most 35% of the walkable tiles may hold something
    let free = 0; (st.map || []).forEach((row, y) => [...row].forEach((ch, x) => { if (tileOk(x, y)) free++; }));
    const onFloor = [...solid.keys()].filter((k) => { const [x, y] = k.split(',').map(Number); return tileOk(x, y); }).length;   // things on stall tables don't use floor
    if (onFloor > free * 0.35) warn.push(`${w}: ${onFloor} things on ${free} walkable tiles — may feel cramped`);
    console.log(`${w}: ${st.cols}×${st.rows}, ${(st.objects || []).length} objects, ${st.entities.filter((e) => e.kind !== 'door').length} people, ${doorsHere.length} doors`);
  });
  // destinations on the quest screen must exist
  (MSC.data.ui.destinations || []).forEach((d) => { if (!ids.has(d.id)) errors.push(`ui.destinations: "${d.id}" is not on any stage`); });
  // every chat NPC and quiz id used by the game must stand somewhere
  Object.keys(MSC.data.chats || {}).forEach((id) => { if (!ids.has(id)) errors.push(`chat set "${id}" has no person with that id on any stage`); });
})();

// Objectives must be English only.
['gateObjective', 'brokeObjective', 'roundDone'].forEach((k) => {
  if (/[㐀-鿿]/.test(MSC.data.quests.barista[k])) errors.push(`barista.${k} must not contain Chinese`);
});
MSC.data.ui.quest.forEach((q) => { if (/[㐀-鿿]/.test(q.text)) errors.push(`quest step "${q.text}" must not contain Chinese`); });

warn.forEach((w) => console.log(`warning: ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`ERROR: ${e}`)); process.exit(1); }
console.log(`OK — ${MSC.data.dictionary.length} words, ${Object.keys(MSC.data.characters).length} characters, ${texts.length} Chinese strings checked.`);

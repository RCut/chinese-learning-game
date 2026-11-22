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
['data/dictionary.js', 'data/characters.js', 'data/world.js', 'data/menu.js', 'data/quests.js', 'data/ui-text.js', 'data/writing.js', 'data/strokes.js', 'js/core/util.js', 'js/core/dictionary.js']
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

// ── all Chinese text in the other data files must be segmentable ──
function walk(node, trail, out) {
  if (typeof node === 'string') { if (/[㐀-鿿]/.test(node)) out.push([trail, node]); }
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${trail}[${i}]`, out));
  else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => { if (k !== 'english' && k !== 'text') walk(v, `${trail}.${k}`, out); });
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

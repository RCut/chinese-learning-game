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
['data/dictionary.js', 'data/characters.js', 'data/world.js', 'data/menu.js', 'data/quests.js', 'data/ui-text.js', 'js/core/util.js', 'js/core/dictionary.js']
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

// ── characters ──
const used = new Set();
MSC.data.dictionary.forEach((e) => [...e.hanzi].forEach((c) => used.add(c)));
used.forEach((c) => { if (!MSC.data.characters[c]) warn.push(`no component info for character ${c}`); });
Object.keys(MSC.data.characters).forEach((c) => { if (!used.has(c)) warn.push(`characters.js has unused entry ${c}`); });

// ── all Chinese text in the other data files must be segmentable ──
function walk(node, trail, out) {
  if (typeof node === 'string') { if (/[㐀-鿿]/.test(node)) out.push([trail, node]); }
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${trail}[${i}]`, out));
  else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => { if (k !== 'english' && k !== 'text') walk(v, `${trail}.${k}`, out); });
}
const texts = [];
['quests', 'menu', 'world', 'ui'].forEach((n) => walk(MSC.data[n], n, texts));
texts.forEach(([where, text]) => {
  const clean = text.replace(/\{[A-Za-z]+\}/g, '');   // placeholders are filled at run time
  MSC.dict.segment(clean).forEach((t) => { if (t.kind === 'unknown') errors.push(`${where}: "${t.hanzi}" is not in the dictionary  (in "${text}")`); });
});
// Objectives must be English only.
['gateObjective', 'brokeObjective', 'roundDone'].forEach((k) => {
  if (/[㐀-鿿]/.test(MSC.data.quests.barista[k])) errors.push(`barista.${k} must not contain Chinese`);
});
MSC.data.ui.quest.forEach((q) => { if (/[㐀-鿿]/.test(q.text)) errors.push(`quest step "${q.text}" must not contain Chinese`); });

warn.forEach((w) => console.log(`warning: ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`ERROR: ${e}`)); process.exit(1); }
console.log(`OK — ${MSC.data.dictionary.length} words, ${Object.keys(MSC.data.characters).length} characters, ${texts.length} Chinese strings checked.`);

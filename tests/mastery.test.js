// node tests/mastery.test.js — how well a word is known: scoring rules (js/core/mastery.js) and crediting words + phrases.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
[...require('../tools/data-files.js').all(), 'js/core/pinyin.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const MSC = ctx.window.MSC;
MSC.on = () => {}; MSC.emit = () => {};
vm.runInContext(fs.readFileSync(path.join(root, 'js/core/state.js'), 'utf8'), ctx);
['js/core/mastery.js', 'js/core/phrases.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const M = MSC.mastery, S = MSC.state, PH = MSC.phrases;
MSC.progress = { save() {} }; MSC.log = { say() {}, html() {} };
let fails = 0;
const ok = (n, c, x = '') => { if (!c) { fails++; console.log('FAIL', n, x); } };
const reset = () => { S.mastery = {}; S.phraseSet = new Set(); };

reset();
ok('unknown = 0', M.score('猫') === 0);
M.seen('猫'); ok('seen, never used = 10', M.score('猫') === 10);
M.record(['猫'], 1, 'street'); ok('1 perfect use is capped at 30', M.score('猫') === 30, M.score('猫'));
M.record(['猫'], 1, 'street'); ok('2 uses ≤ 50', M.score('猫') === 50);
M.record(['猫'], 1, 'street'); M.record(['猫'], 1, 'street');
ok('4 perfect uses in ONE place stay below learned', M.score('猫') === M.LEARNED - 1 && !M.learned('猫'), M.score('猫'));
M.record(['猫'], 1, 'home'); ok('…a use in a second place makes it learned', M.learned('猫') && M.score('猫') === 100, M.score('猫'));

reset();
['a', 'b', 'c', 'd'].forEach((pl) => M.record(['狗'], M.quality({ hint: 1 }), pl));
ok('always needing the first hint stays below learned (≈70%)', M.score('狗') === 70, M.score('狗'));
reset();
['a', 'b', 'c', 'd'].forEach((pl) => M.record(['书'], M.quality({ tiles: true }), pl));
ok('tiles only: 85% — just learned', M.score('书') === 85, M.score('书'));
reset();
['a', 'b', 'c', 'd'].forEach((pl) => M.record(['茶'], M.quality({ recognition: true }), pl));
ok('recognition alone never makes a word learned', !M.learned('茶'), M.score('茶'));
reset();
['a', 'b', 'c', 'd'].forEach((pl) => M.record(['水'], 1, pl));
M.record(['水'], 0, 'e'); ok('a revealed answer lowers a learned word', !M.learned('水'), M.score('水'));
M.record(['水'], 1, 'e'); M.record(['水'], 1, 'e'); ok('…and good uses bring it back', M.learned('水'), M.score('水'));
ok('quality: mistakes ×0.6', Math.abs(M.quality({ mistakes: 1 }) - 0.6) < 1e-9);
ok('quality: answer revealed = 0', M.quality({ hint: 3 }) === 0);

// useText credits every word and every phrase inside what was said
reset();
const p = PH.all().find((x) => x.words.length >= 2);
if (p) {
  M.useText(p.hanzi, {}, 'cafe');
  ok('saying a phrase discovers it', PH.has(p.id));
  ok('…credits the phrase', M.uses(p.key) === 1);
  ok('…and each of its words', p.words.every((w) => M.uses(w) >= 1), p.words.join());
  ok('phrase level = highest HSK level of its words', p.level === Math.max(0, ...p.words.map((w) => MSC.dict.level(w))));
  ok('a word lists the phrases that use it', PH.withWord(p.words[0]).includes(p));
} else console.log('(no phrases yet — phrase checks skipped)');

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('mastery: all checks passed');

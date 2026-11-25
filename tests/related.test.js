// node tests/related.test.js — the "related words" panel only shows genuinely related words.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
[...require('../tools/data-files.js').vocab(), 'js/core/util.js', 'js/core/dictionary.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx));
const D = ctx.window.MSC.dict;
let fails = 0;
const ok = (name, cond, extra = '') => { if (!cond) { fails++; console.log('FAIL', name, extra); } };
const flat = (h) => D.related(D.get(h), 99).flatMap((g) => g.items.map((i) => i.hanzi));
const groups = (h) => D.related(D.get(h)).map((g) => g.title);

// 看 / 看看 are two entries and point at each other (the 看看 problem)
ok('看 → 看看', flat('看').includes('看看'));
ok('看看 → 看', flat('看看').includes('看'));
ok('看看 is one word, not two characters', D.segment('看看').length === 1 && D.segment('看看')[0].hanzi === '看看');

// meaning-lost compounds are not offered
[['在', '现在'], ['是', '还是'], ['是', '但是'], ['水', '水果'], ['火', '火车'], ['不', '不过'], ['好', '不好意思'], ['一', '一样']]
  .forEach(([a, b]) => ok(`${a} does not list ${b}`, !flat(a).includes(b)));

// phrases first, then curated, then built-from, then part-of
const order = ['Phrases', 'Used with', 'Built from', 'Part of'];
D.all().forEach((e) => {
  const t = groups(e.hanzi).map((x) => order.indexOf(x));
  ok(`${e.hanzi}: groups in order`, t.every((v, i) => i === 0 || v > t[i - 1]), t.join());
  ok(`${e.hanzi}: not related to itself`, !flat(e.hanzi).includes(e.hanzi));
  ok(`${e.hanzi}: no duplicates`, new Set(flat(e.hanzi)).size === flat(e.hanzi).length);
  ok(`${e.hanzi}: at most 8 related words`, D.related(e).reduce((n, g) => n + g.items.length, 0) <= 8);
});
ok('好: phrases listed first', D.related(D.get('好'))[0].title === 'Phrases' && flat('好').slice(0, 3).join() === '你好,好的,太好了');
ok('compound lists its parts (火车站 → 火车)', flat('火车站').includes('火车'));
ok('opposites / pairs: 热↔冰, 二↔两, 左边↔右边', flat('热').includes('冰') && flat('冰').includes('热') && flat('二').includes('两') && flat('两').includes('二') && flat('左边').includes('右边'));
ok('collocation: 喝 → 咖啡 and 咖啡 → 喝', flat('喝').includes('咖啡') && flat('咖啡').includes('喝'));
ok('topic-only links are gone (我 ↛ 他, 想 ↛ 喜欢)', !flat('我').includes('他') && !flat('想').includes('喜欢'));

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('related: all checks passed');

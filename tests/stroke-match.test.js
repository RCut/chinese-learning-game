// node tests/stroke-match.test.js — checks the stroke matcher against the real stroke data.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
['data/writing.js', 'data/strokes.js', 'js/core/stroke-match.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx));
const MSC = ctx.window.MSC, SM = MSC.strokes, data = MSC.data.strokes;

let fails = 0;
const check = (name, ok, extra = '') => { if (!ok) { fails++; console.log('FAIL', name, extra); } };

// A repeatable "shaky finger": every point is nudged by up to ±`amp` board units and the path is slightly wobbly.
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
const finger = (pts, amp) => {
  const dense = SM.resample(pts, 30);
  const ox = rnd() * amp * 2, oy = rnd() * amp * 2;                      // the whole stroke drifts a little
  return dense.map((p, i) => [p[0] + ox + rnd() * amp, p[1] + oy + rnd() * amp + Math.sin(i / 4) * amp * 0.6]);
};

let strokesTotal = 0, okCount = 0;
for (const ch of Object.keys(data)) {
  const med = SM.screenMedians(data[ch]);
  for (let i = 0; i < med.length; i++) {
    strokesTotal++;
    // 1. a clean and a shaky copy of the right stroke must be accepted
    const clean = SM.classify(med[i], med, i), shaky = SM.classify(finger(med[i], 45), med, i);
    check(`${ch} stroke ${i + 1} clean`, clean.kind === 'ok', JSON.stringify(clean));
    check(`${ch} stroke ${i + 1} shaky`, shaky.kind === 'ok', JSON.stringify(shaky));
    if (clean.kind === 'ok' && shaky.kind === 'ok') okCount++;
    // 2. the same stroke drawn backwards must be refused with 'direction' (skip dots: they are judged by position)
    if (SM.length(med[i]) > 300) {
      const back = SM.classify(med[i].slice().reverse(), med, i);
      check(`${ch} stroke ${i + 1} reversed`, back.kind === 'direction' || back.kind === 'order', JSON.stringify(back));
    }
  }
}
console.log(`${okCount}/${strokesTotal} strokes accepted when clean AND shaky`);

// 3. wrong order: drawing stroke 2 of 十 first
{ const med = SM.screenMedians(data['十']); const r = SM.classify(med[1], med, 0); check('十 vertical-first is "order"', r.kind === 'order' && r.index === 1, JSON.stringify(r)); }
// 4. 右 now starts with the slanted stroke; drawing the horizontal first is "order"
{ const med = SM.screenMedians(data['右']); const r = SM.classify(med[1], med, 0); check('右 horizontal-first is "order"', r.kind === 'order', JSON.stringify(r)); }
// 5. random scribble is "shape"; a stray tap is ignored
{ const med = SM.screenMedians(data['人']); check('scribble', SM.classify([[100, 100], [900, 120], [120, 900]], med, 0).kind === 'shape');
  check('tap', SM.classify([[500, 500], [502, 503]], med, 0).kind === 'ignore'); }
// 6. 三: drawing the middle line while the top one is expected must NOT be accepted
{ const med = SM.screenMedians(data['三']); const r = SM.classify(finger(med[1], 30), med, 0); check('三 middle-for-top', r.kind !== 'ok', JSON.stringify(r)); }
// 7. a short dot: 丶 of 下 is accepted from a small tap near the right place
{ const med = SM.screenMedians(data['下']); const dot = med[2]; const tap = [dot[0], [dot[0][0] + 8, dot[0][1] + 6]];
  check('dot: accidental tap ignored', SM.classify(tap, med, 2).kind === 'ignore');
  const flick = SM.resample([dot[0], [dot[0][0] + 45, dot[0][1] + 30], [dot[0][0] + 80, dot[0][1] + 52]], 8);   // a short flick in the right direction
  const r = SM.classify(flick, med, 2); check('dot: short flick accepted', r.kind === 'ok', JSON.stringify(r)); }

if (fails) { console.log(`${fails} failure(s)`); process.exit(1); }
console.log('stroke-match: all checks passed');

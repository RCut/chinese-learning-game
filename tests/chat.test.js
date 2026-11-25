// node tests/chat.test.js — the chat engine: patterns, matching, branching, tiles, randomness. No browser needed.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
require('../tools/data-files.js').chat()
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const MSC = ctx.window.MSC;
MSC.state = {}; MSC.on = () => {}; MSC.emit = () => {};
vm.runInContext(fs.readFileSync(path.join(root, 'js/game/chat.js'), 'utf8'), ctx, { filename: 'chat.js' });
const CH = MSC.chat, D = MSC.dict, S = MSC.state, C = MSC.data.chat, PT = MSC.pattern;

let fails = 0;
const ok = (name, cond, extra = '') => { if (!cond) { fails++; console.log('FAIL', name, extra); } };

// ── patterns ──
ok('optional', PT.expand('(是，)我是学生').join() === '是，我是学生,我是学生');
ok('alternatives', PT.expand('我[想|要]喝茶').join() === '我想喝茶,我要喝茶');
ok('fullest first', PT.expand('(请问，)现在几点(了)')[0] === '请问，现在几点了');
ok('slots', PT.fill('我叫{n}', { n: '小王' }) === '我叫小王');

// ── structure ──
ok('at least 5 dialogues', C.dialogues.length >= 5, String(C.dialogues.length));
C.dialogues.forEach((d) => ok(`${d.id} branches`, Object.values(d.nodes).some((n) => (n.replies || []).length > 1)));
ok('some start with the player, some with Xiao Li', C.dialogues.some((d) => !d.nodes[d.start].npc) && C.dialogues.some((d) => d.nodes[d.start].npc));

// ── randomness: never the same conversation twice in a row, and every conversation comes up ──
const seen = new Set(); let repeats = 0, prev = null;
for (let i = 0; i < 600; i++) { CH.begin(); if (S.chat.dlg.id === prev) repeats++; prev = S.chat.dlg.id; seen.add(prev); }
ok('never repeats back to back', repeats === 0, String(repeats));
ok('every conversation appears', seen.size === C.dialogues.length, `${seen.size}/${C.dialogues.length}`);
const slotVals = new Set(); for (let i = 0; i < 300; i++) { CH.start(C.dialogues.find((d) => d.id === 'hobbies'), (() => { const v = {}; const s = C.dialogues.find((d) => d.id === 'hobbies').slots.hobby; const x = s[Math.floor(Math.random() * s.length)]; v.hobby = x.hanzi; v['hobby.en'] = x.en; return v; })()); slotVals.add(S.chat.vars.hobby); }
ok('slots vary', slotVals.size > 1);

// ── play EVERY path of EVERY dialogue, for every slot combination, saying every accepted phrasing ──
let paths = 0, phrasings = 0;
const tilesCover = (cur, v) => {
  const have = {}, need = {};
  cur.tiles.forEach((t) => { have[t] = (have[t] || 0) + 1; });
  D.segment(v).filter((t) => t.kind === 'word' || t.kind === 'number').forEach((t) => { need[t.hanzi] = (need[t.hanzi] || 0) + 1; });
  return Object.keys(need).every((h) => (have[h] || 0) >= need[h]);
};
function exhaust(d) {
  let combos = [{}];
  Object.keys(d.slots || {}).forEach((nm) => { combos = combos.flatMap((c) => d.slots[nm].map((v) => ({ ...c, [nm]: v.hanzi, [`${nm}.en`]: v.en }))); });
  combos.forEach((vars) => {
    const stack = [[]];
    while (stack.length) {
      const trail = stack.pop();
      CH.start(d, vars);
      for (const [ri, vi] of trail) {
        const cur = S.chat.cur, r = cur.replies[ri], v = r.variants[vi];
        const m = CH.match(cur, D.syllables(v).map(MSC.pinyin.fromNum));
        ok(`${d.id}: "${v}" leads where its branch says`, m.reply === r);
        CH.advance(m);
      }
      const cur = S.chat.cur;
      if (cur.end) { ok(`${d.id}: ending has Xiao Li's closing line`, !!cur.npc && S.chat.finished); paths++; continue; }
      ok(`${d.id}.${cur.id}: tile bank can build every accepted phrasing`, cur.replies.every((r) => r.variants.every((v) => tilesCover(cur, v))), cur.tiles.join(''));
      ok(`${d.id}.${cur.id}: bank is not enormous`, cur.tiles.length <= 16, String(cur.tiles.length));
      cur.replies.forEach((r, ri) => r.variants.forEach((v, vi) => { phrasings++; stack.push([...trail, [ri, vi]]); }));
    }
  });
}
C.dialogues.forEach(exhaust);
console.log(`played ${paths} complete paths through ${C.dialogues.length} conversations (${phrasings} accepted phrasings)`);

// ── wrong answers ──
CH.begin();
{ const cur = S.chat.cur;
  ok('nonsense is not accepted', !CH.match(cur, MSC.pinyin.parse('我 要 水果 水果 水果')).reply);
  CH.miss(cur, false); ok('a miss opens the first hint', cur.st.attempts === 1 && cur.st.hint === 1);
  CH.miss(cur, false); ok('a second miss opens the word clue', cur.st.hint === 2);
  CH.miss(cur, false); ok('a failure never opens the answer by itself', cur.st.hint === 2); }

// ── tones: right words, wrong tones → flagged, not accepted ──
{ const d = C.dialogues.find((x) => x.id === 'hobbies');
  CH.start(d, { hobby: '唱歌', 'hobby.en': 'sing' });
  const cur = S.chat.cur;
  const wrong = D.syllables(cur.replies[0].variants[0]).map((s) => s.replace(/[0-5]$/, '1')).map(MSC.pinyin.fromNum);
  const m = CH.match(cur, wrong);
  ok('wrong tones: not accepted but flagged', !m.reply && m.tonesOff === true, JSON.stringify(m)); }

// ── typing works: tone marks, tone numbers, no spaces ──
{ const d = C.dialogues.find((x) => x.id === 'meet');
  CH.start(d, { myname: '小王', 'myname.en': 'Xiao Wang', job: '老师', 'job.en': 'teacher' });
  const cur = S.chat.cur;
  ok('tone-marked pinyin is accepted', !!CH.match(cur, MSC.pinyin.parse('nǐhǎo nǐ jiào shénme míngzi')).reply);
  ok('tone numbers are accepted', !!CH.match(cur, MSC.pinyin.parse('ni3 jiao4 shen2me5 ming2zi5')).reply);
  ok('hanzi are accepted', !!CH.match(cur, MSC.pinyin.parse('你好，你叫什么名字')).reply); }

// ── branching really changes what happens next ──
{ const d = C.dialogues.find((x) => x.id === 'meet');
  const run = (pick) => { CH.start(d, { myname: '小王', 'myname.en': 'Xiao Wang', job: '老师', 'job.en': 'teacher' });
    const say = (ri) => { const cur = S.chat.cur; CH.advance({ reply: cur.replies[ri], variant: cur.replies[ri].variants[0] }); };
    say(0); say(0); say(pick); return S.chat.cur.npc.hanzi; };
  ok('yes → "where do you study?", no → "what work do you do?"', run(0) !== run(1) && /学习/.test(run(0)) && /工作/.test(run(1))); }

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('chat engine: all checks passed');

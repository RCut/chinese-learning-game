// node tests/e2e-practice.js — notebook (Words / Phrases tabs, HSK-only, mastery, word ↔ phrase links) and Practice mode.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };

/** answer the current practice exercise correctly (or pick a wrong option first when `wrongFirst`) */
const answer = (p, wrongFirst) => p.evaluate((wf) => {
  const e = MSC.practice.current(); if (!e) return null;
  const A = MSC.actions;
  if (e.type === 'listen') { const i = e.options.findIndex((o) => (wf ? !o.ok : o.ok)); A['pr-pick'](i); return e.type; }
  if (e.type === 'meaning' || e.type === 'gap') { if (wf) A['pr-pick'](e.options.findIndex((h) => h !== e.word)); A['pr-pick'](e.options.indexOf(e.word)); return e.type; }
  if (e.type === 'build') { const want = e.word ? [...e.word] : e.target; const used = new Set(); want.forEach((t) => { const i = e.tiles.findIndex((x, k) => x === t && !used.has(k)); used.add(i); A['pr-tile'](i); }); A['pr-check'](); return e.type; }
  if (e.type === 'type') { e.st.typed = MSC.dict.syllables(e.phrase.hanzi).join(' '); const inp = document.getElementById('pr-input'); if (inp) inp.value = e.st.typed; A['pr-check'](); return e.type; }
  return e.type;
}, wrongFirst);

async function run(p, label) {
  console.log(`— ${label}: notebook`);
  await p.evaluate(() => { ['猫', '狗', '茶', '学生', '老师', '咖啡', '菜单', '路人', '你', '好', '谢谢'].forEach((w) => MSC.vocab.discover(w)); MSC.actions.tab('notebook'); });
  await p.waitForTimeout(250);
  ok('two tabs: Words and Phrases', (await p.$$('[data-click="nb-tab"]')).length === 2);
  ok('progress per HSK level (learned / met)', /HSK 1[\s\S]*learned[\s\S]*met[\s\S]*HSK 2/.test(await p.$eval('#hsk-progress', (e) => e.innerText)));
  ok('cards show an HSK badge or "extra", and a mastery bar', await p.$$eval('.vcard', (c) => c.length > 5 && c.every((x) => x.querySelector('.tag.hsk, .tag.extra') && x.querySelector('.mbar'))));
  const extras0 = await p.$$eval('.vcard .tag.extra', (e) => e.length);
  ok('extra (non-HSK) words are in the list by default', extras0 > 0);
  await p.click('#hsk-only'); await p.waitForTimeout(150);
  ok('"HSK only" hides every non-HSK word', (await p.$$eval('.vcard .tag.extra', (e) => e.length)) === 0 && (await p.$$('.vcard')).length > 3);
  await p.click('#hsk-only');
  await p.click('.vcard:has-text("teacher")');
  ok('a word pane shows mastery', /Mastery/.test(await p.$eval('#word-pane', (e) => e.innerText)));

  console.log(`— ${label}: phrases`);
  const ph = await p.evaluate(() => { const x = MSC.phrases.all().find((q) => q.level === 1 && q.words.length >= 2); MSC.mastery.useText(x.hanzi, {}, 'cafe'); return { id: x.id, hanzi: x.hanzi, word: x.words.find((w) => MSC.dict.get(w)) }; });
  ok('saying a phrase adds it to the phrase book', await p.evaluate((id) => MSC.phrases.has(id), ph.id));
  await p.click('[data-click="nb-tab"][data-arg="phrases"]'); await p.waitForTimeout(150);
  ok('the Phrases tab is organised in chapters', (await p.$$('.chapter')).length >= 5);
  ok('the phrase is listed with level and mastery', await p.$eval(`.pcard[data-arg="${ph.id}"]`, (e) => !!e.querySelector('.tag') && !!e.querySelector('.mbar')).catch(() => false));
  ok('chapters show how many are met; unmet ones are locked', /met/.test(await p.$eval('.chapter', (e) => e.innerText)) && (await p.$$('.chapter .locked')).length > 0);
  await p.click(`.pcard[data-arg="${ph.id}"]`);
  ok('a phrase pane links to its words', (await p.$$('#word-pane .rel')).length >= 2);
  await p.evaluate((w) => MSC.actions['open-word'](w), ph.word); await p.waitForTimeout(150);
  ok('…and the word pane lists the phrase', await p.$eval('#word-pane', (e, id) => !!e.querySelector(`[data-click="open-phrase"][data-arg="${id}"]`), ph.id));

  console.log(`— ${label}: practice`);
  await p.click('[data-click="nb-tab"][data-arg="words"]');
  await p.click('[data-click="practice"]'); await p.waitForTimeout(300);
  ok('Practice opens with a session', await p.evaluate(() => MSC.practice.isOpen() && !!MSC.practice.current()));
  const before = await p.evaluate(() => JSON.stringify(MSC.state.mastery));
  const types = new Set();
  let listenedNoScore = true;
  for (let i = 0; i < 10; i++) {
    const cur = await p.evaluate(() => { const e = MSC.practice.current(); return e && { type: e.type, key: e.key }; });
    if (!cur) break;
    const m0 = await p.evaluate((k) => MSC.mastery.uses(k), cur.key);
    await answer(p, i % 3 === 0);
    types.add(cur.type);
    const m1 = await p.evaluate((k) => MSC.mastery.uses(k), cur.key);
    if (cur.type === 'listen' && m1 !== m0) listenedNoScore = false;
    if (cur.type !== 'listen') ok(`${cur.type}: the answer is scored`, m1 === m0 + 1, `${m0}→${m1}`);
    await p.evaluate(() => MSC.actions['pr-next']());
  }
  ok('several exercise types', types.size >= 3, [...types].join());
  ok('listening never changes mastery', listenedNoScore);
  ok('mastery changed', (await p.evaluate(() => JSON.stringify(MSC.state.mastery))) !== before);
  ok('the session ends with a summary', /Done/.test(await p.$eval('#practice', (e) => e.innerText)));
  await p.click('#practice [data-click="pr-close"] >> nth=0');
  ok('practice closes and logs the result', !(await p.evaluate(() => MSC.practice.isOpen())) && /Practice:/.test(await p.$eval('#log-latest', (e) => e.innerText)));

  console.log(`— ${label}: listening options sound alike`);
  const opts = await p.evaluate(() => { MSC.actions.practice('words'); for (let i = 0; i < 8; i++) { const e = MSC.practice.current(); if (e && e.type === 'listen') return e.options.map((o) => o.py); MSC.actions['pr-hint'](); MSC.actions['pr-hint'](); MSC.actions['pr-hint'](); MSC.actions['pr-next'](); } return null; });
  if (opts) ok('2–4 pinyin options, all with the same number of syllables', opts.length >= 2 && opts.length <= 4 && new Set(opts.map((o) => o.split(' ').length)).size === 1, opts.join(' | '));
  await p.evaluate(() => MSC.practice.isOpen() && MSC.actions['pr-close']());
  ok('progress survives a reload', await p.evaluate(() => { MSC.progress.save(); const s = JSON.parse(localStorage.getItem('mandarin_street_corner_v5')); return !!s.mastery && Array.isArray(s.phrases) && s.phrases.length >= 1; }));
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await run(p, 'desktop');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await run(m, 'phone');
  const geo = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok('phone: no horizontal overflow', geo.sw <= geo.cw, JSON.stringify(geo));
  await m.evaluate(() => MSC.actions.practice('words')); await m.waitForTimeout(300);
  await m.screenshot({ path: 'practice_phone.png' });
  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

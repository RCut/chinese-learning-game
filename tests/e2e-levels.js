// node tests/e2e-levels.js — the journey: level 1 shows only HSK 1 content, the phrase screen, and levelling up to HSK 2.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };

async function run(p, label) {
  console.log(`— ${label}: level 1 = HSK 1`);
  ok('a new player starts at level 1 (header chip)', await p.evaluate(() => MSC.state.level === 1 && document.getElementById('level-chip').textContent === 'Lv 1'));
  const lv = await p.evaluate(() => {
    const L = MSC.levels, out = { hiddenAbove: true, objs: 0 };
    Object.values(MSC.data.world.stages).forEach((st) => {
      const vis = MSC.stage.visibleStage(st).objects;
      out.objs += vis.length;
      if (vis.some((o) => L.of(o, 'object') > 1)) out.hiddenAbove = false;
    });
    out.wang = MSC.writing.offer().chars.every((c) => L.of(MSC.writing.info(c), 'char') === 1);
    out.menu = MSC.economy.menu().every((m) => (m.level || 1) === 1);
    const lvls = []; for (let i = 0; i < 20; i++) { MSC.chat.begin('friend'); lvls.push(L.of(MSC.state.chat.dlg, 'dialogue')); }
    out.chats = lvls.every((x) => x === 1);
    return out;
  });
  ok('places show only level-1 things (HSK 1 words)', lv.hiddenAbove && lv.objs > 0, JSON.stringify(lv));
  ok('Master Wang offers only HSK 1 characters', lv.wang);
  ok('the café sells only level-1 items', lv.menu);
  ok('Xiao Li only starts level-1 conversations', lv.chats);
  ok('the quest screen shows the journey: words learned and tasks', await p.evaluate(() => { MSC.state.active = null; MSC.panel.render(true); return /Level 1 · HSK 1[\s\S]*words learned[\s\S]*Order lunch/.test(document.getElementById('panel').innerText); }));

  console.log(`— ${label}: the phrase screen`);
  const id = await p.evaluate(() => { const x = MSC.phrases.all().find((q) => q.level === 1 && q.words.length >= 2 && !MSC.phrases.has(q.id)); MSC.panel.render(false); document.getElementById('panel').insertAdjacentHTML('beforeend', MSC.ui.sentence({ hanzi: x.hanzi, english: x.english })); return x.id; });
  ok('a phrase met in a line is queued, not added yet', await p.evaluate((i) => MSC.phrases.queued(i) && !MSC.phrases.has(i), id));
  ok('…and highlighted under the line with "learn it"', !!(await p.$(`.new-phrase[data-arg="${id}"]`)));
  ok('…and announced in the log', /New phrase/.test(await p.$eval('#log-latest', (e) => e.innerText)));
  await p.click(`.new-phrase[data-arg="${id}"]`); await p.waitForTimeout(200);
  ok('tapping it opens the phrase screen (listen & see)', await p.evaluate(() => MSC.teach.isOpen() && MSC.teach.current().step === 0));
  await p.click('#teach [data-click="tc-later"] >> nth=0');
  ok('"Practise later" keeps it waiting', await p.evaluate((i) => !MSC.teach.isOpen() && MSC.phrases.queued(i), id));
  ok('the Phrases tab lists it under "To learn"', await p.evaluate((i) => { MSC.actions.tab('notebook'); MSC.actions['nb-tab']('phrases'); return !!document.querySelector(`.to-learn [data-arg="${i}"]`); }, id));
  await p.evaluate((i) => { MSC.actions.tab('stage'); MSC.actions['teach-open'](i); }, id);
  await p.click('#teach [data-click="tc-next"]');
  await p.evaluate(() => { const c = MSC.teach.current(); MSC.actions['tc-tile'](c.tiles.findIndex((t) => !c.target.includes(t))); MSC.actions['tc-check'](); });
  ok('a wrong build is not accepted', await p.evaluate(() => MSC.teach.current().step === 1));
  await p.evaluate(() => { const c = MSC.teach.current(); const used = new Set(); c.target.forEach((t) => { const i = c.tiles.findIndex((x, k) => x === t && !used.has(k)); used.add(i); MSC.actions['tc-tile'](i); }); MSC.actions['tc-check'](); });
  ok('building it moves on to "from memory"', await p.evaluate(() => MSC.teach.current().step === 2));
  await p.fill('#tc-input', await p.evaluate((i) => MSC.dict.syllables(MSC.phrases.get(i).hanzi).join(' '), id));
  await p.click('#teach [data-click="tc-check"]');
  const after = await p.evaluate((i) => ({ has: MSC.phrases.has(i), queued: MSC.phrases.queued(i), score: MSC.mastery.score(`p:${i}`) }), id);
  ok('typing it from memory adds it to the phrase book with a first score', after.has && !after.queued && after.score > 10 && after.score < 85, JSON.stringify(after));
  await p.click('#teach [data-click="tc-close"]');

  console.log(`— ${label}: levelling up`);
  ok('words learned alone are not enough: the tasks count too', await p.evaluate(() => {
    MSC.dict.hskWords(1).forEach((w) => ['a', 'b', 'c', 'd'].forEach((pl) => MSC.mastery.record([w], 1, pl)));
    return MSC.state.level === 1 && !MSC.levels.progress().ready;
  }));
  await p.evaluate(() => { MSC.levels.flag('ordered'); MSC.levels.flag('chatted'); });
  ok('…still level 1 with one task left', await p.evaluate(() => MSC.state.level === 1));
  await p.evaluate(() => MSC.levels.flag('wrote')); await p.waitForTimeout(200);
  ok('80% learned + all tasks → level 2', await p.evaluate(() => MSC.state.level === 2 && document.getElementById('level-chip').textContent === 'Lv 2'));
  ok('a pop-up announces it, with what is new', await p.evaluate(() => document.getElementById('levelup').classList.contains('show') && /Level 2 unlocked/.test(document.getElementById('levelup').innerText) && document.querySelectorAll('#levelup-new span').length >= 2));
  ok('…and the log too', /Level 2 unlocked/.test(await p.$eval('#log-list', (e) => e.innerText)));
  await p.click('[data-click="levelup-ok"]');
  ok('the places fill up with HSK 2 things', await p.evaluate(() => Object.values(MSC.data.world.stages).some((st) => MSC.stage.visibleStage(st).objects.some((o) => MSC.levels.of(o, 'object') === 2))));
  ok('the level is saved', await p.evaluate(() => { MSC.progress.save(); return JSON.parse(localStorage.getItem('mandarin_street_corner_v5')).level === 2; }));
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await run(p, 'desktop');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await run(m, 'phone');
  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

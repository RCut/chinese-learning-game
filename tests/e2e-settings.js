// node tests/e2e-settings.js — the ⚙️ settings tab: Pinyin/Hybrid/Hanzi and the voice live there (not in the top bar), and are remembered.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };
const view = (p) => p.evaluate(() => ['stage', 'notebook', 'settings'].find((v) => !document.getElementById(`view-${v}`).classList.contains('hidden')));

async function run(p, label) {
  console.log(`— ${label}: the top bar`);
  ok('the display options and the voice are gone from the top bar', await p.evaluate(() => !document.querySelector('.app-header #tier-seg') && !document.querySelector('.app-header #voice-select') && !document.querySelector('.app-header #rate-btn')));
  ok('a ⚙️ settings button sits to the right of the Stage / Words toggle', await p.evaluate(() => { const nav = document.querySelector('.seg.dark').getBoundingClientRect(), g = document.getElementById('tab-settings').getBoundingClientRect(); return g.left >= nav.right - 1 && Math.abs((g.top + g.height / 2) - (nav.top + nav.height / 2)) < 8; }));
  ok('the header is compact (one or two rows)', await p.evaluate(() => document.querySelector('.app-header').offsetHeight < 140));

  console.log(`— ${label}: the settings tab`);
  await p.click('#tab-settings');
  ok('⚙️ opens the settings view', (await view(p)) === 'settings' && await p.$eval('#tab-settings', (e) => e.classList.contains('on')));
  ok('it has the three display options, the voice, the speed and a sound switch', await p.evaluate(() => document.querySelectorAll('#view-settings #tier-seg button').length === 3 && !!document.querySelector('#view-settings #voice-select') && document.querySelectorAll('#view-settings #rate-seg button').length === 3 && !!document.getElementById('sfx-on')));
  ok('Hybrid is selected by default', await p.$eval('#tier-seg [data-arg="2"]', (e) => e.classList.contains('on')));
  await p.click('#tier-seg [data-arg="3"]');
  ok('choosing Hanzi switches the whole game (name tags lose their pinyin)', await p.evaluate(() => MSC.state.displayMode === 3 && ![...document.querySelectorAll('.entity-label')].some((l) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(l.textContent))));
  await p.click('#tier-seg [data-arg="1"]');
  ok('…and Pinyin shows pinyin only', await p.evaluate(() => MSC.state.displayMode === 1 && [...document.querySelectorAll('.entity-label')].every((l) => !/[一-鿿]/.test(l.textContent))));
  await p.click('#tier-seg [data-arg="2"]');
  await p.click('#rate-seg [data-arg="0.65"]');
  ok('the speed buttons set the voice speed', await p.evaluate(() => MSC.state.rate === 0.65) && await p.$eval('#rate-seg [data-arg="0.65"]', (e) => e.classList.contains('on')));
  await p.click('#rate-seg [data-arg="0.85"]');
  await p.click('#sfx-on');
  ok('the sound switch mutes the door sounds', await p.evaluate(() => MSC.sfx.muted === true));

  console.log(`— ${label}: remembered`);
  await p.click('#tier-seg [data-arg="3"]'); await p.click('#rate-seg [data-arg="1"]');
  await p.reload(); await p.waitForTimeout(500);
  ok('display mode, speed and sound survive a reload', await p.evaluate(() => MSC.state.displayMode === 3 && MSC.state.rate === 1 && MSC.sfx.muted === true && document.querySelector('#tier-seg [data-arg="3"]').classList.contains('on') && document.getElementById('sfx-on').checked === false));
  await p.evaluate(() => { MSC.actions.tier(2); MSC.state.rate = 0.85; MSC.sfx.muted = false; MSC.progress.save(); });

  console.log(`— ${label}: coming back`);
  await p.evaluate(() => MSC.actions.tab('notebook'));
  await p.click('#tab-settings');
  await p.click('#view-settings [data-click="settings"]');
  ok('Done returns to the tab you came from (the notebook)', (await view(p)) === 'notebook');
  await p.click('#tab-settings'); await p.click('#tab-settings');
  ok('pressing ⚙️ again also goes back', (await view(p)) === 'notebook');
  await p.click('#tab-settings'); await p.click('#tab-stage');
  ok('the Stage tab leaves settings too', (await view(p)) === 'stage');
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await run(p, 'desktop');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await run(m, 'phone');
  const geo = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok('phone: no horizontal overflow in settings', geo.sw <= geo.cw, JSON.stringify(geo));
  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

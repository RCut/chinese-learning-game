// node tests/e2e-scroll.js — phones: the dialogue pane is part of the page (no fixed height, no inner scrolling), so a swipe anywhere
// scrolls the page; tapping someone brings their dialogue into view, and 🗺️ goes back to the map. Wide screens keep the side pane.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };

(async () => {
  const b = await chromium.launch();
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await m.waitForTimeout(500);
  const cdp = await m.context().newCDPSession(m);
  const swipe = async (x, y, dy) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + (dy * i) / 10 }] }); await m.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await m.waitForTimeout(300);
  };

  console.log('— phone');
  const pane = await m.$eval('#panel', (e) => { const c = getComputedStyle(e); return { overflowY: c.overflowY, h: e.getBoundingClientRect().height, scrolls: e.scrollHeight > e.clientHeight + 1 }; });
  ok('the dialogue pane has no inner scrolling and no fixed height', pane.overflowY === 'visible' && !pane.scrolls, JSON.stringify(pane));
  await m.evaluate(() => { MSC.levels.set(2); MSC.state.active = null; MSC.panel.render(true); });
  await m.evaluate(() => window.scrollTo(0, 0));
  const y0 = await m.evaluate(() => { const r = document.getElementById('panel').getBoundingClientRect(); return r.top + scrollY; });
  await m.evaluate((y) => window.scrollTo(0, y - 150), y0);                 // the pane is on screen
  await m.waitForTimeout(150);
  const before = await m.evaluate(() => scrollY);
  await swipe(200, 500, -150);                                                // a swipe that starts INSIDE the dialogue frame
  ok('a swipe inside the dialogue frame scrolls the page', (await m.evaluate(() => scrollY)) > before + 40, `${before} → ${await m.evaluate(() => scrollY)}`);
  const boardTop = await m.evaluate(() => { const r = document.querySelector('#board').getBoundingClientRect(); return r.top + scrollY; });
  await m.evaluate((y) => window.scrollTo(0, y - 250), boardTop);
  await m.waitForTimeout(150);
  const b1 = await m.evaluate(() => scrollY);
  const bb = await m.$eval('#board', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width * 0.5, y: r.y + r.height * 0.5 }; });
  await swipe(bb.x, bb.y, -150);                                              // …and one that starts on the stage frame
  ok('a swipe on the stage frame scrolls the page too', (await m.evaluate(() => scrollY)) > b1 + 40, `${b1}`);

  console.log('— moving between the map and the dialogue');
  await m.evaluate(() => window.scrollTo(0, 0));
  await m.evaluate(() => MSC.stage.walkTo(MSC.data.world.stages.street.entities.find((e) => e.id === 'friend').x, MSC.data.world.stages.street.entities.find((e) => e.id === 'friend').y));
  await m.waitForFunction(() => MSC.state.active === 'friend', null, { timeout: 15000 });
  await m.waitForTimeout(900);
  const top = await m.evaluate(() => { const r = document.getElementById('panel').getBoundingClientRect(), h = document.querySelector('.app-header').getBoundingClientRect().bottom; return { panelTop: r.top, headerBottom: h }; });
  ok('tapping someone scrolls their dialogue into view, just under the header', top.panelTop >= top.headerBottom - 2 && top.panelTop < top.headerBottom + 60, JSON.stringify(top));
  ok('the pane has a 🗺️ Map button', !!(await m.$('#panel [data-click="to-map"]')));
  await m.click('#panel [data-click="to-map"]'); await m.waitForTimeout(900);
  const back = await m.evaluate(() => { const r = document.getElementById('view-stage').getBoundingClientRect(), h = document.querySelector('.app-header').getBoundingClientRect().bottom; return { stageTop: r.top, headerBottom: h }; });
  ok('🗺️ scrolls back to the map', back.stageTop >= back.headerBottom - 30 && back.stageTop < back.headerBottom + 40, JSON.stringify(back));
  const bx = await m.evaluate(() => { const o = MSC.data.world.stages.street.objects.find((x) => MSC.levels.visible(x, 'object')); return { id: o.id }; });
  await m.evaluate((id) => { const f = MSC.stage.find(id); MSC.stage.activate(f.ent.id, false); }, bx.id);
  const noJump = await m.evaluate(() => scrollY);
  await m.waitForTimeout(500);
  ok('walking past an object does not yank the page', (await m.evaluate(() => scrollY)) === noJump);

  console.log('— wide screen');
  const d = await H.open(b, { context: { viewport: { width: 1280, height: 900 } } });
  const dp = await d.$eval('#panel', (e) => { const c = getComputedStyle(e); return { overflowY: c.overflowY, h: e.getBoundingClientRect().height }; });
  ok('the side pane keeps its own scrolling beside the stage', dp.overflowY === 'auto' && dp.h >= 480 && dp.h <= 700, JSON.stringify(dp));
  ok('…and has no Map button (the stage is right there)', await d.$eval('#panel', (e) => { MSC.state.active = 'friend'; MSC.panel.render(true); const b = e.querySelector('[data-click="to-map"]'); return !b || getComputedStyle(b).display === 'none'; }));

  for (const pg of [m, d]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

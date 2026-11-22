// node tests/e2e-popups.js — every popup can be dismissed (✕ or swipe), on desktop and on a phone.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? '  ok  ' : '  FAIL', name, cond ? '' : extra); if (!cond) fails++; };
const count = (p) => p.$$eval('#toasts .toast', (e) => e.length);
const show = (p, text, ms = 60000) => p.evaluate(([t, m]) => MSC.toast.show(t, m), [text, ms]);

async function drag(p, sel, dx, steps = 8) {
  const b = await (await p.$(sel)).boundingBox();
  const x = b.x + 10, y = b.y + b.height / 2;          // grab the left part (the right edge holds the ✕ button)
  await p.mouse.move(x, y); await p.mouse.down();
  await p.mouse.move(x + dx, y, { steps }); await p.mouse.up();
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);

  console.log('— desktop toasts');
  await show(p, 'first'); await show(p, 'second'); await show(p, 'third');
  ok('3 toasts shown, each with a ✕', (await count(p)) === 3 && (await p.$$('#toasts .toast .toast-x')).length === 3);
  ok('"Clear all" appears when 2+ are stacked', await p.$eval('#toasts-clear', (e) => e.classList.contains('show') && getComputedStyle(e).display !== 'none'));
  await p.click('#toasts .toast >> nth=0 >> .toast-x');
  ok('✕ removes just that toast', (await count(p)) === 2 && !(await p.$$eval('#toasts .toast', (e) => e.map((x) => x.textContent))).some((t) => /first/.test(t)));
  await drag(p, '#toasts .toast >> nth=0', 30);
  ok('a short drag snaps back (not dismissed)', (await count(p)) === 2 && (await p.$eval('#toasts .toast >> nth=0', (e) => e.style.transform)) === '');
  await drag(p, '#toasts .toast >> nth=0', 160);
  await p.waitForTimeout(350);
  ok('a long swipe right dismisses it', (await count(p)) === 1);
  await show(p, 'fourth');
  await drag(p, '#toasts .toast >> nth=-1', -170);
  await p.waitForTimeout(350);
  ok('a long swipe left dismisses it too', (await count(p)) === 1);
  ok('"Clear all" hides again below 2 toasts', await p.$eval('#toasts-clear', (e) => !e.classList.contains('show')));
  await show(p, 'a'); await show(p, 'b'); await show(p, 'c'); await show(p, 'd');
  ok('never more than 3 at once', (await count(p)) === 3);
  await p.click('#toasts-clear'); await p.waitForTimeout(100);
  ok('Clear all removes everything', (await count(p)) === 0);

  console.log('— reading time');
  await show(p, 'hold me', 1200);
  const bb = await (await p.$('#toasts .toast')).boundingBox();
  await p.mouse.move(bb.x + 20, bb.y + 12); await p.mouse.down();
  await p.waitForTimeout(2200);
  ok('a toast being held is not auto-dismissed', (await count(p)) === 1);
  await p.mouse.up();
  await p.waitForTimeout(3000);
  ok('…and goes away shortly after release', (await count(p)) === 0);

  console.log('— toasts with buttons close when used');
  await p.evaluate(() => { MSC.state.vocab.includes('大') || MSC.vocab.discover('大'); MSC.toast.html('<button type="button" class="toast-chip" data-click="open-notebook-word" data-arg="大">大</button>', 'act', 60000); });
  await p.click('#toasts .toast-chip'); await p.waitForTimeout(300);
  ok('tapping a character in a toast opens the word and closes that toast', (await p.evaluate(() => MSC.state.selectedWord)) === '大' && (await p.$$('#toasts .toast-chip')).length === 0);

  console.log('— first-time tip');
  await p.evaluate(() => { MSC.actions.tab('stage'); MSC.state.tipSeen = false; MSC.toast.onboarding(); });
  ok('tip visible', await p.$eval('#onboard', (e) => e.classList.contains('show')));
  await drag(p, '#onboard', 180);
  await p.waitForTimeout(350);
  ok('swiping the tip away closes it and remembers it', !(await p.$eval('#onboard', (e) => e.classList.contains('show'))) && (await p.evaluate(() => MSC.state.tipSeen)));
  await p.evaluate(() => { MSC.state.tipSeen = false; MSC.toast.onboarding(); });
  await p.click('#onboard [data-click="close-onboard"]');
  ok('the tip’s ✕ still works', !(await p.$eval('#onboard', (e) => e.classList.contains('show'))));
  ok('the tip comes back clean after being swiped (no stale offset)', await (async () => { await p.evaluate(() => { MSC.state.tipSeen = false; MSC.toast.onboarding(); }); return (await p.$eval('#onboard', (e) => e.style.transform + e.style.opacity)) === ''; })());
  await p.click('#onboard [data-click="close-onboard"]');

  console.log('— toasts wait while writing');
  await p.evaluate(() => MSC.toast.clearAll());
  await p.evaluate(() => { const S = MSC.state.writing; S.tutorialDone = true; S.mastered['十'] = { last: 1 }; MSC.writer.begin(MSC.writing.practiceSession('十')); });
  await show(p, 'while writing');
  ok('no toast covers the board while the tray is open', (await count(p)) === 0);
  await p.evaluate(() => MSC.writer.close()); await p.waitForTimeout(200);
  ok('it appears when the tray closes', (await count(p)) === 1);
  await p.click('#toasts-clear').catch(() => {}); await p.click('#toasts .toast-x').catch(() => {});

  console.log('— phone');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  for (let i = 0; i < 7; i++) await show(m, `Popup number ${i} with a fairly long line so it wraps on a small screen`);
  const h = await m.evaluate(() => { const r = document.getElementById('toasts').getBoundingClientRect(); return { h: r.height, vh: innerHeight, w: r.width, vw: innerWidth }; });
  ok('a stack of 7 popups is capped at 3 and stays small', (await count(m)) === 3 && h.h < h.vh * 0.33 && h.w <= h.vw - 16, JSON.stringify(h));
  const cdp = await m.context().newCDPSession(m);
  const swipe = async (sel, dx) => {
    const bx = await (await m.$(sel)).boundingBox(); const x = bx.x + bx.width / 2, y = bx.y + bx.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await m.waitForTimeout(400);
  };
  await swipe('#toasts .toast >> nth=0', 170);
  ok('finger swipe dismisses a popup', (await count(m)) === 2);
  await m.waitForTimeout(1500);                       // a tap right after a fast flick is swallowed by Chromium as "stop scrolling"
  await m.tap('#toasts .toast >> nth=0 >> .toast-x');
  await m.waitForTimeout(300);
  ok('tapping ✕ with a finger dismisses a popup', (await count(m)) === 1);
  await m.tap('#toasts .toast .toast-x').catch(() => {});

  await m.evaluate(() => { MSC.actions.tab('notebook'); MSC.actions['open-word']('我'); });
  await m.waitForTimeout(500);
  ok('word details open as a bottom sheet', await m.$eval('#word-pane', (e) => e.classList.contains('open')));
  const sheet = await m.$eval('#word-pane', (e) => { const r = e.getBoundingClientRect(); return r.height / innerHeight; });
  ok('the sheet never takes more than ~72% of the screen', sheet <= 0.73, String(sheet));
  const hb = await (await m.$('#word-pane .pane-handle')).boundingBox();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hb.x + hb.width / 2, y: hb.y + 8 }] });
  for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: hb.x + hb.width / 2, y: hb.y + 8 + i * 25 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await m.waitForTimeout(500);
  ok('swiping the sheet down closes it', !(await m.$eval('#word-pane', (e) => e.classList.contains('open'))) && (await m.evaluate(() => MSC.state.selectedWord)) === null);
  await m.evaluate(() => MSC.actions['open-word']('我')); await m.waitForTimeout(400);
  await m.tap('#word-pane .pane-close'); await m.waitForTimeout(300);
  ok('the sheet’s ✕ still closes it', !(await m.$eval('#word-pane', (e) => e.classList.contains('open'))));

  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

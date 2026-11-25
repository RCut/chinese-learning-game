// node tests/e2e-log.js — the notification log: one collapsible frame replaces every popup; words and characters in it open the notebook.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? '  ok  ' : '  FAIL', name, cond ? '' : extra); if (!cond) fails++; };
const box = (p, sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const isOpen = (p) => p.evaluate(() => MSC.log.isOpen());

async function run(p, label) {
  console.log(`— ${label}: the old popup system is gone`);
  ok('no popup layer, no first-time-tip card, no toast API', !(await p.$('#toasts, #onboard, .toast')) && (await p.evaluate(() => typeof MSC.toast)) === 'undefined');

  console.log(`— ${label}: collapsed = one row with the latest message`);
  ok('the log frame exists, collapsed, with a toggle', !(await isOpen(p)) && !!(await p.$('#log #log-toggle')));
  const h0 = (await box(p, '#log .log-bar')).h;
  ok('collapsed it is a single compact row', h0 < 50, String(h0));
  await p.evaluate(() => { MSC.log.say('first message'); MSC.log.say('second message'); MSC.log.say('latest message'); });
  ok('the row shows the latest message', /latest message/.test(await p.$eval('#log-latest', (e) => e.textContent)));
  const count = Number(await p.$eval('#log-n', (e) => e.textContent));
  ok('a counter shows how many there are', count >= 3, String(count));
  const page0 = await p.evaluate(() => document.documentElement.scrollHeight);

  console.log(`— ${label}: expanded = a scrollable list, newest first`);
  await p.click('#log-toggle');
  ok('✔ expands', await isOpen(p));
  const rows = await p.$$eval('#log-list .log-item', (e) => e.map((x) => x.textContent));
  ok('all messages are listed, newest first', rows.length === count && /latest message/.test(rows[0]) && /first message/.test(rows[2]), rows.join('|'));
  await p.evaluate(() => { for (let i = 0; i < 25; i++) MSC.log.say(`filler ${i}`); });
  const list = await p.$eval('#log-list', (e) => ({ sh: e.scrollHeight, ch: e.clientHeight, ov: getComputedStyle(e).overflowY }));
  const row1 = (await box(p, '#log-list .log-item')).h;
  ok('the list scrolls and shows about 5–10 rows', list.sh > list.ch && list.ov === 'auto' && list.ch / row1 >= 5 && list.ch / row1 <= 11, JSON.stringify({ ...list, rows: list.ch / row1 }));
  ok('expanding does not shift the page layout', (await p.evaluate(() => document.documentElement.scrollHeight)) === page0);
  const pop = await box(p, '#log .log-pop'), vw = await p.evaluate(() => innerWidth);
  ok('the list stays on screen', pop.x >= 0 && pop.x + pop.w <= vw + 1, JSON.stringify(pop));
  await p.press('body', 'Escape');
  ok('Esc folds it away', !(await isOpen(p)));
  await p.click('#log .log-latest');
  ok('tapping the message row opens it too', await isOpen(p));
  await p.mouse.click(5, 600);
  ok('tapping outside folds it away', !(await isOpen(p)));
  await p.click('#log-toggle'); await p.click('[data-click="log-clear"]');
  ok('Clear log empties it and folds it', !(await isOpen(p)) && (await p.evaluate(() => MSC.log.count())) === 0);

  console.log(`— ${label}: new words go to the log and are clickable`);
  await p.evaluate(() => { MSC.state.tipSeen = true; MSC.vocab.discover('大'); MSC.vocab.discover('小'); });
  await p.waitForTimeout(350);
  const wordMsg = await p.$eval('#log-latest', (e) => e.textContent);
  ok('one message for the new words, with pinyin and English', /New words/.test(wordMsg) && /dà|big/i.test(wordMsg), wordMsg);
  await p.click('#log-latest .log-zh >> nth=0');
  await p.waitForTimeout(150);
  ok('tapping a new word (even with the log collapsed) opens it in the notebook', await p.evaluate(() => !document.getElementById('view-notebook').classList.contains('hidden') && ['大', '小'].includes(MSC.state.selectedWord)));
  await p.evaluate(() => MSC.actions.tab('stage'));

  console.log(`— ${label}: Chinese in any message and single characters are clickable`);
  await p.waitForTimeout(400);                                            // the notebook pane may log words it shows
  await p.evaluate(() => MSC.log.say('Paid for 咖啡 and 王'));
  const links = await p.$$eval('#log-latest .log-zh', (b) => b.map((x) => x.textContent));
  ok('words and characters in plain messages are buttons', links.includes('咖啡') && links.includes('王'), links.join(','));
  await p.click('#log-latest .log-zh >> nth=1'); await p.waitForTimeout(150);
  ok('a character opens a word that contains it', await p.evaluate(() => !document.getElementById('view-notebook').classList.contains('hidden') && MSC.state.selectedWord && MSC.state.selectedWord.includes('王')));
  await p.evaluate(() => MSC.actions.tab('stage'));

  console.log(`— ${label}: the first-time tip lives in the log`);
  await p.waitForTimeout(400);                                            // let any word the notebook pane just logged arrive first
  await p.evaluate(() => { MSC.state.tipSeen = false; MSC.log.tip(); });
  ok('the tip is a log message and the log opens once', (await isOpen(p)) && /Quick tip/.test(await p.$eval('#log-list .log-item', (e) => e.textContent)));
  await p.evaluate(() => MSC.log.tip());
  ok('it is only shown once', (await p.$$eval('#log-list .log-item.tip', (e) => e.length)) === 1);
  await p.press('body', 'Escape');

  console.log(`— ${label}: real game events end up in the log`);
  await p.evaluate(() => MSC.log.clear());
  await H.goTo(p, 'friend');
  await p.evaluate(() => MSC.addXP(8, 'a test'));
  ok('XP messages are in the log', /\+8 XP/.test(await p.$eval('#log-latest', (e) => e.textContent)));
  ok('…and nothing floats over the board', !(await p.$('.toast, #toasts')));
  ok('the stage is not covered while the log is collapsed', !(await isOpen(p)));
  const geo = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok('no horizontal overflow', geo.sw <= geo.cw, JSON.stringify(geo));
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await run(p, 'desktop');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await run(m, 'phone');
  await m.evaluate(() => { MSC.log.say('Voice speed: 0.85×'); MSC.log.say('Paid ¥3 for two coffees. You have ¥29 left.'); });
  await m.click('#log-toggle');
  await m.screenshot({ path: 'log_phone.png' });
  await p.evaluate(() => { MSC.actions.tab('stage'); MSC.log.say('Hello'); });
  await p.click('#log-toggle');
  await p.screenshot({ path: 'log_desktop.png' });
  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

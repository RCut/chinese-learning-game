// node tests/e2e-board.js — the Phaser board: every place is drawn from the pixel art (no emoji, no missing-art "?"), looks the same everywhere.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };
const EMOJI = /\p{Extended_Pictographic}/u;

/** read the Phaser canvas: how many magenta "missing art" pixels, how many distinct colours, and the colour at a few tiles */
const scan = (p) => p.evaluate(() => {
  const cv = MSC.board.canvas(), ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  const d = ctx.getImageData(0, 0, w, h).data;
  let magenta = 0; const colours = new Set();
  for (let i = 0; i < d.length; i += 4) { if (d[i] > 240 && d[i + 1] < 20 && d[i + 2] > 240) magenta++; colours.add((d[i] >> 4) * 256 + (d[i + 1] >> 4) * 16 + (d[i + 2] >> 4)); }
  return { w, h, magenta, colours: colours.size };
});

async function run(p, label) {
  console.log(`— ${label}: Phaser draws every place`);
  ok('Phaser is loaded and the board is a canvas', await p.evaluate(() => !!window.Phaser && MSC.board.ready() && !!MSC.board.canvas()));
  await p.evaluate(() => MSC.levels.set(2));                          // every place (the school only opens at level 2)
  const stages = await p.evaluate(() => Object.keys(MSC.data.world.stages));
  for (const id of stages) {
    await p.evaluate((s) => MSC.stage.show(s), id);
    await p.waitForTimeout(500);
    const st = await p.evaluate((s) => { const x = MSC.data.world.stages[s]; return { cols: x.cols, rows: x.rows }; }, id);
    const r = await scan(p);
    ok(`${id}: canvas is ${st.cols}×${st.rows} tiles of 48px`, r.w === st.cols * 48 && r.h === st.rows * 48, JSON.stringify(r));
    ok(`${id}: no missing-art placeholders (magenta ?) on the board`, r.magenta === 0, `${r.magenta} px`);
    ok(`${id}: it is a real picture (many colours)`, r.colours > 60, String(r.colours));
    const text = await p.$eval('#board-dom', (e) => e.textContent);
    ok(`${id}: no emoji in the board's signs and name tags`, !EMOJI.test(text), text);
    ok(`${id}: the buttons above the board carry pixel portraits, not emoji`, await p.$$eval('#pills .pill', (b) => b.length > 0 && b.every((x) => x.querySelector('img.px') && !/\p{Extended_Pictographic}/u.test(x.textContent))));
  }

  console.log(`— ${label}: no emoji standing in for pictures in the panels`);
  await p.evaluate(() => MSC.stage.show('street'));
  const heads = [];
  for (const id of ['friend', 'signpost', 'passerby']) {
    await p.evaluate((x) => MSC.stage.activate(x, false), id);
    heads.push(await p.$eval('#panel .avatar', (e) => ({ img: !!e.querySelector('img.px'), emoji: /\p{Extended_Pictographic}/u.test(e.textContent) })));
  }
  ok('person and sign panels show pixel portraits', heads.every((h) => h.img && !h.emoji), JSON.stringify(heads));
  await p.evaluate(() => { MSC.state.active = null; MSC.panel.render(true); });
  ok('the quest screen shows pixel portraits for every destination', await p.$$eval('#panel .dest-ic', (d) => d.length >= 5 && d.every((x) => x.querySelector('img.px'))));
  const objId = await p.evaluate(() => MSC.data.world.stages.street.objects[0].id);
  await p.evaluate((x) => MSC.stage.activate(x, false), objId);
  ok('an object card shows its pixel picture', await p.$eval('#panel .avatar', (e) => !!e.querySelector('img.px')));

  console.log(`— ${label}: the player moves on the canvas`);
  await p.evaluate(() => { MSC.stage.show('street'); });
  await p.waitForTimeout(400);
  await p.evaluate(() => MSC.stage.walkTo(2, 4));
  await p.waitForTimeout(1200);
  const pos = await p.evaluate(() => ({ x: MSC.state.player.x, y: MSC.state.player.y }));
  ok('the player walked to the tapped tile', pos.x === 2 && pos.y === 4, JSON.stringify(pos));
}

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await run(p, 'desktop');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await m.waitForTimeout(500);
  const geo = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, board: document.getElementById('board').getBoundingClientRect().width }));
  ok('phone: the board fits the screen', geo.sw <= geo.cw && geo.board <= geo.cw, JSON.stringify(geo));
  // the narrowest common phone (360 px): nothing may be wider than the screen, wrap awkwardly or sit under the header
  const n = await H.open(b, { context: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
  await n.evaluate(() => { MSC.state.xp = 123456; MSC.state.money = 9999; MSC.emit('stats'); ['你', '好', '猫', '学生'].forEach((w) => MSC.vocab.discover(w)); });
  const wide = () => n.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  const fits = async (what) => { const g = await wide(); ok(`360px: ${what} fits the screen`, g.sw <= g.cw, JSON.stringify(g)); };
  await fits('the stage (header with big money and XP numbers)');
  ok('360px: header chips and level badge stay on one line each', await n.$$eval('.chip', (c) => c.every((x) => x.getBoundingClientRect().height < 34)));
  ok('360px: the two views are stacked and fully visible', await n.$eval('.seg.dark', (e) => { const r = e.getBoundingClientRect(); return r.right <= innerWidth && r.height > 40; }));
  for (const id of ['street', 'cafe', 'shop', 'market', 'home']) { await n.evaluate((x) => MSC.stage.show(x), id); await n.waitForTimeout(150); await fits(`the ${id}`); }
  ok('360px: street shop signs do not overlap', await n.evaluate(() => { MSC.stage.show('street'); const r = [...document.querySelectorAll('.scenery-sign')].map((e) => e.getBoundingClientRect()); return r.every((a, i) => r.slice(i + 1).every((c) => a.right <= c.left + 1 || c.right <= a.left + 1 || a.bottom <= c.top + 1 || c.bottom <= a.top + 1)); }));
  await n.evaluate(() => { MSC.state.active = null; MSC.panel.render(true); });
  await fits('the quest list');
  ok('360px: "Go →" never wraps', await n.$$eval('.dest > b:last-child', (b) => b.length > 3 && b.every((x) => x.getBoundingClientRect().height < 24)));
  await n.evaluate(() => { MSC.actions.tab('notebook'); MSC.actions['open-word']('学生'); }); await n.waitForTimeout(200);
  await fits('the notebook with a word pane open');
  await n.evaluate(() => { MSC.actions['close-pane'](); MSC.actions['nb-tab']('phrases'); }); await fits('the phrase book');
  await n.evaluate(() => { MSC.actions['nb-tab']('words'); MSC.actions.tab('stage'); MSC.actions.practice('words'); }); await n.waitForTimeout(200);
  await fits('Practice');
  ok('360px: the Practice title stays on one line', await n.$eval('.pr-head b', (e) => e.getBoundingClientRect().height < 24));
  await n.evaluate(() => MSC.practice.close());
  await n.evaluate(() => { MSC.stage.show('street'); MSC.actions.go('friend'); }); await n.waitForTimeout(3200);
  ok('360px: a conversation header keeps its buttons on one line', await n.$$eval('.pane-head .btn', (b) => b.length >= 2 && b.every((x) => x.getBoundingClientRect().height < 40)));
  await fits('a conversation');
  await p.evaluate(() => MSC.stage.show('street'));
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'board_street.png' });
  for (const pg of [p, m, n]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

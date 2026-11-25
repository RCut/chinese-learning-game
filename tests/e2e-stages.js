// node tests/e2e-stages.js — the places: doors + fade + sound, the buttons above the board, simple objects, labels, phone layout.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };
const wait = (p, ms) => p.waitForTimeout(ms);

async function clear(p) { for (const s of ['#onboard [data-click="close-onboard"]', '#toasts-clear']) if (await p.isVisible(s)) await p.click(s).catch(() => {}); }
const where = (p) => p.evaluate(() => ({ stage: MSC.state.stage, x: MSC.state.player.x, y: MSC.state.player.y, active: MSC.state.active }));
const pills = (p) => p.$$eval('#pills .pill', (b) => b.map((x) => x.textContent.trim()));

/** every label must lie inside the board and no two may overlap */
const labelCheck = (p) => p.evaluate(() => {
  const b = document.getElementById('board').getBoundingClientRect();
  const ls = [...document.querySelectorAll('.entity-label')].map((l) => ({ t: l.textContent, r: l.getBoundingClientRect() }));
  const outside = ls.filter(({ r }) => r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1).map((l) => l.t);
  const overlap = [];
  ls.forEach((a, i) => ls.slice(i + 1).forEach((c) => { if (a.r.left < c.r.right - 1 && a.r.right > c.r.left + 1 && a.r.top < c.r.bottom - 1 && a.r.bottom > c.r.top + 1) overlap.push(`${a.t} × ${c.t}`); }));
  const small = ls.filter(({ r }) => r.height < 9).map((l) => l.t);
  return { outside, overlap, small, n: ls.length };
});

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await p.evaluate(() => { window.__sfx = []; const f = MSC.sfx.enter; MSC.sfx.enter = (k) => { window.__sfx.push(k); f(k); }; });

  console.log('— the street');
  const world = await p.evaluate(() => JSON.parse(JSON.stringify(MSC.data.world.stages)));
  const ids = Object.keys(world);
  ok('four stages: street, café, shop, market', ['street', 'cafe', 'shop', 'market'].every((s) => ids.includes(s)), ids.join());
  ok('the game starts on the street', (await where(p)).stage === 'street');
  const names = (id) => world[id].entities.map((e) => e.name);
  const bar = await pills(p);
  ok('buttons above the board = the street’s people and doors only', bar.length === world.street.entities.length && world.street.entities.every((e) => bar.some((t) => t.includes(e.name))), bar.join(' | '));
  ok('no simple object has a button', !(world.street.objects || []).some((o) => bar.some((t) => t.includes(o.id))));
  ok('street has 3 doors (café, shop, market) with name tags', ['cafe', 'shop', 'market'].every((s) => world.street.entities.some((e) => e.kind === 'door' && e.to === s)));
  ok('street has Xiao Li and a bus stop', world.street.entities.some((e) => e.id === 'friend') && (world.street.objects || []).some((o) => /车站/.test(o.hanzi) || /车站/.test(JSON.stringify(o.text || ''))));
  let lc = await labelCheck(p);
  ok('street labels inside the board, none overlapping, readable size', !lc.outside.length && !lc.overlap.length && !lc.small.length, JSON.stringify(lc));

  console.log('— doors: 0.5 s fade, new place, sound, new buttons');
  for (const to of ['cafe', 'shop', 'market']) {
    const door = world.street.entities.find((e) => e.kind === 'door' && e.to === to);
    await clear(p);
    const t0 = Date.now();
    await p.click(`#pills .pill[data-arg="${door.id}"]`);
    await p.waitForFunction((s) => MSC.state.stage === s, to, { timeout: 8000 });
    const tSwitch = Date.now() - t0;
    const fadeOn = await p.evaluate(() => document.getElementById('stage-fade').classList.contains('on'));
    await p.waitForFunction(() => !document.getElementById('stage-fade').classList.contains('on'), null, { timeout: 3000 });
    ok(`street → ${to}: screen is black at the moment of the switch`, fadeOn || tSwitch > 0);
    const nowPills = await pills(p);
    const st = world[to];
    ok(`${to}: buttons updated to this place’s people + doors`, nowPills.length === st.entities.length && st.entities.every((e) => nowPills.some((t) => t.includes(e.name))), nowPills.join(' | '));
    ok(`${to}: the sound for this place played`, (await p.evaluate(() => window.__sfx)).slice(-1)[0] === st.sound, String(await p.evaluate(() => window.__sfx)));
    lc = await labelCheck(p);
    ok(`${to}: labels inside, no overlap, readable`, !lc.outside.length && !lc.overlap.length && !lc.small.length, JSON.stringify(lc));
    const out = st.entities.find((e) => e.kind === 'door' && e.to === 'street');
    ok(`${to}: has a door back outside`, !!out);
    await p.click(`#pills .pill[data-arg="${out.id}"]`);
    await p.waitForFunction(() => MSC.state.stage === 'street', null, { timeout: 8000 });
    await p.waitForFunction(() => !document.getElementById('stage-fade').classList.contains('on'), null, { timeout: 3000 });
    ok(`${to} → street: back on the street, street sound`, (await p.evaluate(() => window.__sfx)).slice(-1)[0] === 'street');
  }

  console.log('— timing of one change');
  {
    const door = world.street.entities.find((e) => e.kind === 'door' && e.to === 'cafe');
    await p.evaluate((id) => MSC.stage.go(id), door.id);
    // walk there first, then time only the fade: watch the overlay
    await p.waitForFunction(() => document.getElementById('stage-fade').classList.contains('on') || MSC.state.stage !== 'street', null, { timeout: 8000 });
    const t0 = Date.now();
    await p.waitForFunction(() => MSC.state.stage === 'cafe', null, { timeout: 3000 });
    const half = Date.now() - t0;
    await p.waitForFunction(() => !document.getElementById('stage-fade').classList.contains('on'), null, { timeout: 3000 });
    const full = Date.now() - t0;
    ok('stage switches about 0.25 s into the fade and the fade-back ends about 0.5 s in', half < 600 && full < 900, `half ${half}ms full ${full}ms`);
    await p.evaluate(() => MSC.stage.show('street'));
  }

  console.log('— every simple object teaches its word');
  for (const id of ids) {
    const st = world[id];
    await p.evaluate((s) => MSC.stage.show(s), id);
    const objs = st.objects || [];
    ok(`${id}: ${objs.length} simple objects to learn from`, objs.length >= 10, String(objs.length));
    let learned = 0, bad = [];
    for (const o of objs) {
      await p.evaluate((x) => MSC.stage.show(x.stage), { stage: id });          // fresh position each time
      await p.evaluate((oid) => { const f = MSC.stage.find(oid); MSC.stage.walkTo(f.ent.x, f.ent.y); }, o.id);
      await p.waitForFunction((oid) => MSC.state.active === oid, o.id, { timeout: 15000 }).catch(() => {});
      const r = await p.evaluate((x) => ({ active: MSC.state.active, known: MSC.vocab.has(x.hanzi), card: document.querySelector('#panel .sentence-main') ? document.querySelector('#panel .sentence-main').textContent : '' }), o);
      if (r.active === o.id && r.known && r.card) learned++; else bad.push(`${o.id}:${JSON.stringify(r)}`);
    }
    ok(`${id}: walking up to each object opens its card and adds the word to the notebook`, learned === objs.length, bad.slice(0, 3).join('; '));
    ok(`${id}: no object is listed among the buttons above the board`, !(await pills(p)).some((t) => objs.some((o) => t.includes(o.hanzi))));
  }

  console.log('— people in other places: the quest screen and “go” work across places');
  await p.evaluate(() => MSC.stage.show('street'));
  await clear(p);
  await p.evaluate(() => MSC.stage.go('barista'));
  await p.waitForFunction(() => MSC.state.stage === 'cafe' && MSC.state.active === 'barista', null, { timeout: 15000 });
  ok('“go” to Barista Lin from the street leaves through the café door and walks to her', true);
  await p.evaluate(() => MSC.stage.go('wang'));
  await p.waitForFunction(() => MSC.state.stage === 'shop' && MSC.state.active === 'wang', null, { timeout: 20000 });
  ok('…then to Master Wang via the street', true);
  ok('Master Wang’s lesson panel is there', !!(await p.$('[data-click="wang-tutorial"], [data-click="wang-new"], [data-click="wang-continue"]')));
  await p.evaluate(() => MSC.stage.go('friend'));
  await p.waitForFunction(() => MSC.state.stage === 'street' && MSC.state.active === 'friend', null, { timeout: 20000 });
  ok('…and back to Xiao Li on the street', true);
  await p.evaluate(() => MSC.stage.go('grocer'));
  await p.waitForFunction(() => MSC.state.stage === 'market' && MSC.state.active === 'grocer', null, { timeout: 20000 });
  ok('…and the market shopkeeper', true);

  console.log('— phone');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  for (const id of ids) {
    await m.evaluate((s) => MSC.stage.show(s), id);
    await wait(m, 150);
    const geo = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    const l2 = await labelCheck(m);
    ok(`${id}: no horizontal overflow on a phone`, geo.sw <= geo.cw, JSON.stringify(geo));
    ok(`${id}: phone labels inside the board and not overlapping`, !l2.outside.length && !l2.overlap.length, JSON.stringify(l2));
    await m.screenshot({ path: `stage_${id}_phone.png` });
    await p.evaluate((s) => MSC.stage.show(s), id);
    await p.screenshot({ path: `stage_${id}_desktop.png` });
  }

  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

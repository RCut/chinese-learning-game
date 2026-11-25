// node tests/e2e-writing-rules.js — rules of the writing mechanic: feedback, hints, review, practice, offers, layout, touch.
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? '  ok  ' : '  FAIL', name, cond ? '' : extra); if (!cond) fails++; };

/** Put the game in a state where the tutorial and some characters are already mastered. */
async function seed(p, mastered, opts = {}) {
  await p.evaluate(([chars, o]) => {
    const WR = MSC.writing, S = MSC.state.writing;
    S.tutorialDone = true;
    chars.forEach((c, i) => {
      S.mastered[c] = { last: 1000 + i };
      const med = MSC.strokes.screenMedians(MSC.data.strokes[c]);
      S.best[c] = { seal: 'red', strokes: med.map((m) => MSC.strokes.simplify(m, 10)), t: 1 };
      MSC.vocab.discover(WR.wordFor(c));
    });
    S.offer = null; S.lesson = null;
    MSC.progress.save();
    MSC.emit('writing-changed');
  }, [mastered, opts]);
}
const begin = (p, expr) => p.evaluate((e) => MSC.writer.begin(eval(e)), expr);
const msg = (p) => p.$eval('#w-msg', (e) => e.textContent);
const next = async (p) => { await H.waitNext(p); await p.click('#w-next'); await p.waitForTimeout(120); };

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  const rect = (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(','); });
  await seed(p, ['一', '十', '人', '大', '口', '日']);
  await H.goTo(p, 'wang');

  console.log('— specific stroke feedback (右: slanted stroke first)');
  await begin(p, "MSC.writing.startLesson(['右', '左', '女', '不'])");
  await next(p);                                                         // Watch 右
  ok('Trace 右', (await H.phase(p)) === 'Trace');
  const layoutBefore = [await rect('#board'), await rect('#panel')].join('|');
  await H.drawStroke(p, '右', 1);                                        // the horizontal stroke, but the slanted one is expected first
  ok('wrong order → "later stroke" + the editor tip for 右', /later stroke/.test(await msg(p)) && /slanted stroke comes first, unlike 左/.test(await msg(p)), await msg(p));
  await H.drawStroke(p, '右', 0, { reverse: true });
  ok('wrong direction → arrow message', /other way round/.test(await msg(p)), await msg(p));
  ok('direction arrow shown on the board', (await p.$$('#w-board .sb-start g')).length === 1);
  await H.scribble(p);
  ok('wrong shape → flash message', /watch the flash/.test(await msg(p)), await msg(p));
  ok('correct stroke accepted and counter advances', await (async () => { await H.drawStroke(p, '右', 0); return /Stroke 2 of 5/.test(await p.$eval('#w-count', (e) => e.textContent)); })());
  ok('Undo removes the last stroke', await (async () => { await p.click('#w-undo'); return /Stroke 1 of 5/.test(await p.$eval('#w-count', (e) => e.textContent)); })());
  ok('page layout did not move while writing', [await rect('#board'), await rect('#panel')].join('|') === layoutBefore);
  await H.writeChar(p, '右');
  ok('finished with 4 mistakes → plain ink', /Plain ink/.test(await msg(p)), await msg(p));
  ok('Trace never fails: Next offered', !(await p.$eval('#w-next', (e) => e.classList.contains('invisible'))));
  await p.click('[data-click="writer-close"]'); await p.waitForTimeout(250);
  ok('closing the tray hides it and restores the page', !(await p.$eval('#writer', (e) => e.classList.contains('open'))) && [await rect('#board'), await rect('#panel')].join('|') === layoutBefore);

  console.log('— hint ladder + mastery rule (via Review)');
  await begin(p, 'MSC.writing.reviewSession()');
  const order = [];
  const cur = () => p.evaluate(() => MSC.writer.current());
  order.push((await cur()).c);
  ok('review runs only the mastery check', (await H.phase(p)) === 'Memory check');
  ok('header hides the character in a check', (await p.$eval('#w-hz', (e) => e.textContent)) === '？');
  await p.click('#w-hint'); ok('hint 1 = a stroke tip', /💡/.test(await msg(p)));
  await p.click('#w-hint'); ok('hint 2 = start + direction', (await p.$$('#w-board .sb-start g')).length === 1 && /orange dot/.test(await msg(p)));
  await p.click('#w-hint'); ok('hint 3 = whole character, disabled afterwards', /whole character/.test(await msg(p)) && await p.$eval('#w-hint', (e) => e.disabled));
  await H.writeChar(p, order[0]); await H.waitNext(p);
  ok('flawless but used the full-character hint → NOT mastered', /Not mastered/.test(await msg(p)) && /full-character hint/.test(await msg(p)), await msg(p));
  const lastBefore = await p.evaluate((c) => MSC.state.writing.mastered[c].last, order[0]);
  ok('a failed review keeps the character (never removed) and its date unchanged', lastBefore < 2000 && (await p.evaluate((c) => MSC.writing.isMastered(c), order[0])));
  await p.click('#w-next'); await p.waitForTimeout(150);
  order.push((await cur()).c);
  // armed "Watch again": first tap warns, second reveals and counts as the hint
  await p.click('#w-watch'); ok('Watch again in a check asks first', /counts as the full-character hint/.test(await msg(p)));
  const mid = await p.evaluate(() => 0);
  await H.writeChar(p, order[1]); await H.waitNext(p);
  ok('second char (no hints) is mastered', /Mastered/.test(await msg(p)), await msg(p));
  await p.click('#w-next'); await p.waitForTimeout(150);
  for (let i = 2; i < 6; i++) { const c = (await cur()).c; order.push(c); await H.writeChar(p, c); await next(p); }
  ok('review covers each learned character once (random order, up to 10)', [...order].sort().join() === (await p.evaluate(() => MSC.writing.masteredChars().sort().join())) && new Set(order).size === order.length, order.join());
  ok('passed characters had their date refreshed; the failed one did not', await p.evaluate((o) => MSC.state.writing.mastered[o[1]].last > 5000 && MSC.state.writing.mastered[o[0]].last < 2000, order));
  void mid;

  console.log('— practice from the notebook');
  await p.evaluate(() => MSC.actions.tab('notebook')); await p.evaluate(() => MSC.actions['open-word']('口')); await p.waitForTimeout(400);
  const masteryBefore = await p.evaluate(() => JSON.stringify(MSC.state.writing.mastered['口']));
  await p.click('[data-click="howto-practice"]'); await p.waitForTimeout(300);
  ok('opens Memory mode (empty grid, character hidden)', (await H.phase(p)) === 'Practice' && (await p.$eval('#w-hz', (e) => e.textContent)) === '？');
  await H.writeChar(p, '口'); await H.waitNext(p);
  ok('practice finishing text', /Gold seal/.test(await msg(p)), await msg(p));
  await p.click('#w-next'); await p.waitForTimeout(300);
  ok('practice does not change mastery or the wall', (await p.evaluate(() => JSON.stringify(MSC.state.writing.mastered['口']))) === masteryBefore);
  ok('but a better attempt replaces "your handwriting" (red → gold)', (await p.evaluate(() => MSC.state.writing.best['口'].seal)) === 'gold');
  ok('notebook pane refreshed with the new seal', !!(await p.$('.howto-mine .seal-gold')));

  console.log('— persistence');
  await p.reload(); await p.waitForTimeout(300);
  ok('mastery and handwriting survive a reload', await p.evaluate(() => MSC.writing.isMastered('口') && MSC.state.writing.best['口'].seal === 'gold' && MSC.state.writing.tutorialDone));

  console.log('— review packs');
  ok('review = random pack of 10 from all learned characters', await p.evaluate(() => {
    const w = MSC.state.writing, saved = JSON.stringify(w.mastered);
    MSC.data.writing.pool.slice(0, 30).forEach((c, i) => { w.mastered[c.char] = { last: 1000 + i }; });
    const packs = new Set(); let ok = true;
    for (let i = 0; i < 8; i++) { const s = MSC.writing.reviewSession(); const cs = s.slots().map((x) => x.c); ok = ok && cs.length === 10 && new Set(cs).size === 10 && cs.every((c) => MSC.writing.isMastered(c)); packs.add(cs.join()); }
    w.mastered = JSON.parse(saved);
    return ok && packs.size > 1;
  }));

  console.log('— offers');
  ok('offer is 8 cards from tier 1', await p.evaluate(() => { const o = MSC.writing.makeOffer(); return o.chars.length === 8 && o.chars.every((c) => MSC.writing.info(c).tier === 1); }));
  ok('reshuffle is unlimited', await p.evaluate(() => { MSC.writing.makeOffer(); let n = 0; for (let i = 0; i < 6; i++) if (MSC.writing.reshuffle()) n++; return n === 6; }));
  ok('leaving a lesson drops it and offers new characters', await p.evaluate(() => { const o = MSC.writing.makeOffer(); MSC.writing.startLesson(o.chars.slice(0, 4)); const left = MSC.writing.abandonLesson(); return left && !MSC.writing.hasLesson() && MSC.writing.offer().chars.length === 8; }));
  ok('all of tier 1 learned → offer moves on to tier 2', await p.evaluate(() => {
    MSC.data.writing.pool.filter((c) => c.tier === 1).forEach((c) => { MSC.state.writing.mastered[c.char] = { last: 1 }; });
    const o = MSC.writing.makeOffer(); return o.chars.length === 8 && o.chars.every((c) => MSC.writing.info(c).tier >= 2) && o.chars.filter((c) => MSC.writing.info(c).tier === 2).length === 8; }));
  ok('fewer than 4 left → lesson covers what is left; no reshuffle', await p.evaluate(() => {
    const keep = ['我', '你', '是'];
    MSC.data.writing.pool.forEach((c) => { if (!keep.includes(c.char)) MSC.state.writing.mastered[c.char] = { last: 1 }; });
    const o = MSC.writing.makeOffer(); const s = MSC.writing.startLesson(o.chars);
    return o.chars.length === 3 && s.slots().length === 3 && MSC.writing.reshuffle() === false; }));
  await p.evaluate(() => { MSC.state.writing.lesson = null; MSC.data.writing.pool.forEach((c) => { MSC.state.writing.mastered[c.char] = { last: 1 }; }); MSC.state.writing.offer = null; MSC.emit('writing-changed'); });
  await H.goTo(p, 'wang');
  ok('pool empty → only Review (New lesson disabled)', await p.$eval('[data-click="wang-new"]', (e) => e.disabled).catch(() => true) && !!(await p.$('[data-click="wang-review"]')));

  console.log('— offline');
  const reqs = [];
  const p2 = await H.open(b); p2.on('request', (r) => reqs.push(r.url()));
  await seed(p2, ['一', '十']); await H.goTo(p2, 'wang');
  await begin(p2, "MSC.writing.practiceSession('十')"); await H.writeChar(p2, '十'); await H.waitNext(p2);
  ok('no network requests while writing (stroke data is bundled)', reqs.filter((u) => /^https?:/.test(u)).length === 0, reqs.join(' '));

  console.log('— phone: bottom sheet + touch drawing without scrolling');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await seed(m, ['一', '十']);
  await H.goTo(m, 'wang');
  await begin(m, "MSC.writing.practiceSession('十')"); await m.waitForTimeout(500);
  const geo = await m.evaluate(() => { const w = document.getElementById('writer').getBoundingClientRect(), bd = document.getElementById('w-board').getBoundingClientRect(); return { wb: w.bottom, wh: w.height, vh: innerHeight, vw: innerWidth, bw: bd.width, bh: bd.height, pageW: document.documentElement.scrollWidth }; });
  ok('tray is a bottom sheet that fits the screen', Math.abs(geo.wb - geo.vh) < 2 && geo.wh <= geo.vh, JSON.stringify(geo));
  ok('board is square and ≤ 60% of the screen height', Math.abs(geo.bw - geo.bh) < 2 && geo.bh <= geo.vh * 0.61, JSON.stringify(geo));
  ok('no horizontal overflow', geo.pageW <= geo.vw, JSON.stringify(geo));
  const cdp = await m.context().newCDPSession(m);
  const touch = async (pts) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
    for (const q of pts.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q[0], y: q[1] }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const r = await H.boardRect(m);
  const line = (a, c) => Array.from({ length: 12 }, (_, i) => [r.x + (a[0] + (c[0] - a[0]) * i / 11) / 1024 * r.w, r.y + (a[1] + (c[1] - a[1]) * i / 11) / 1024 * r.h]);
  const med = await m.evaluate(() => MSC.strokes.screenMedians(MSC.data.strokes['十']));
  ok('nothing overlaps the writing board (a tip card cannot swallow strokes)', await m.evaluate(() => { const b = document.querySelector('#w-board svg').getBoundingClientRect(); let bad = 0; for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) { const e = document.elementFromPoint(b.x + b.width * i / 10, b.y + b.height * j / 10); if (!e || !e.closest('#w-board')) bad++; } return bad === 0; }));
  const scrollBefore = await m.evaluate(() => scrollY);
  for (let i = 0; i < 2; i++) { const a = med[i][0], z = med[i][med[i].length - 1]; await touch(line(a, z)); await m.waitForTimeout(120); }
  ok('finger strokes are recognised (十 written by touch)', /Gold|Red/.test(await msg(m)), await msg(m));
  ok('the page did not scroll while drawing', (await m.evaluate(() => scrollY)) === scrollBefore);
  await m.click('#w-next'); await m.waitForTimeout(300);
  ok('Done closes the sheet', !(await m.$eval('#writer', (e) => e.classList.contains('open'))));
  await begin(m, "MSC.writing.practiceSession('十')"); await m.waitForTimeout(400);
  await m.evaluate(() => {   // swipe the handle down
    const h = document.getElementById('w-handle'); const r0 = h.getBoundingClientRect();
    const mk = (t, y) => h.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 5, clientX: r0.x + 50, clientY: y, pointerType: 'touch' }));
    mk('pointerdown', r0.y + 5); mk('pointermove', r0.y + 60); mk('pointermove', r0.y + 160); mk('pointerup', r0.y + 160);
  });
  await m.waitForTimeout(300);
  ok('swipe down on the handle closes the tray', !(await m.$eval('#writer', (e) => e.classList.contains('open'))));

  for (const pg of [p, p2, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

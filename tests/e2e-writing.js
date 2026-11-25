// node tests/e2e-writing.js — plays Master Wang's tutorial and a full lesson in a real browser (needs playwright).
const { chromium } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? '  ok  ' : '  FAIL', name, cond ? '' : extra); if (!cond) fails++; };
const S = (p, fn) => p.evaluate(fn);

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await H.goTo(p, 'wang');

  console.log('— tutorial');
  ok('Wang available at the start (quest not done)', await S(p, () => !MSC.state.story.menuChecked && MSC.state.active === 'wang'));
  await p.click('[data-click="wang-tutorial"]');
  const seen = [];
  for (let guard = 0; guard < 12; guard++) {
    if (!(await p.$eval('#writer', (e) => e.classList.contains('open')))) break;
    const ch = await p.$eval('#w-hz', (e) => e.textContent), ph = await H.phase(p);
    seen.push(`${ch}:${ph}`);
    if (ph !== 'Watch') await H.writeChar(p, ch);
    await H.waitNext(p);
    await p.click('#w-next'); await p.waitForTimeout(150);
  }
  ok('tutorial steps are 一 watch, trace · 十 watch, trace, guided', seen.join(' ') === '一:Watch 一:Trace 十:Watch 十:Trace 十:Guided', seen.join(' '));
  ok('一 and 十 are mastered after the tutorial', await S(p, () => MSC.writing.isMastered('一') && MSC.writing.isMastered('十') && MSC.state.writing.tutorialDone));
  ok('hv rule unlocked', await S(p, () => MSC.state.writing.rules.includes('hv')));
  ok('goes straight into choosing the first lesson (offer of 8, tier 1 only)', (await p.$$eval('.offer-card', (e) => e.length)) === 8 && await S(p, () => MSC.writing.offer().chars.every((c) => MSC.writing.info(c).tier === 1)));

  console.log('— lesson');
  await p.click('.offer-card >> nth=0');
  ok('Start disabled until 4 picked', await p.$eval('[data-click="wang-start"]', (e) => e.disabled));
  for (let i = 1; i < 4; i++) await p.click(`.offer-card >> nth=${i}`);
  const picked = await S(p, () => [...document.querySelectorAll('.offer-card.on .oc-hz')].map((e) => e.textContent));
  ok('exactly 4 picked', picked.length === 4);
  await p.click('.offer-card:not(.on) >> nth=0');
  ok('a 5th pick is refused', (await p.$$('.offer-card.on')).length === 4);
  const vocabBefore = await S(p, () => MSC.state.vocab.length);
  const linked = await S(p, () => [...document.querySelectorAll('.offer-card.on .oc-hz')].map((e) => MSC.writing.wordFor(e.textContent)));
  const linkedKnown = await p.evaluate((ws) => ws.map((w) => MSC.vocab.has(w)), linked);
  await p.click('[data-click="wang-start"]'); await p.waitForTimeout(300);

  const plan = [];
  let failedOnce = false, checkFailedChar = null;
  for (let guard = 0; guard < 40; guard++) {
    if (!(await p.$eval('#writer', (e) => e.classList.contains('open')))) break;
    const ch = await p.$eval('#w-hz', (e) => e.textContent), ph = await H.phase(p);
    if (ph === 'Memory check') {
      const ch2 = await S(p, () => MSC.writing.continueSession().current().c);   // the header hides the character in a check
      plan.push(`${ch2}:check`);
      ok(`check header hides the character (${ch2})`, ch === '？');
      if (!failedOnce) {                                          // fail the first check on purpose: 3 mistakes
        failedOnce = true; checkFailedChar = ch2;
        for (let k = 0; k < 3; k++) await H.scribble(p);
        await H.writeChar(p, ch2);
        await H.waitNext(p);
        const m = await p.$eval('#w-msg', (e) => e.textContent);
        ok('3 mistakes → not mastered message', /Not mastered/.test(m), m);
      } else { await H.writeChar(p, ch2); await H.waitNext(p); }
    } else {
      plan.push(`${ch}:${ph}`);
      if (ph !== 'Watch') await H.writeChar(p, ch);
      await H.waitNext(p);
    }
    if (plan.length === 6) {                                      // leave mid-lesson and come back
      await p.click('[data-click="writer-close"]'); await p.waitForTimeout(300);
      ok('taught characters\' words untouched mid-lesson (not added, no How-to)', JSON.stringify(await p.evaluate((ws) => ws.map((w) => MSC.vocab.has(w)), linked)) === JSON.stringify(linkedKnown) && (await p.evaluate((ws) => ws.every((w) => !MSC.howto.has(w)), linked)));
      ok('wall unchanged mid-lesson', (await S(p, () => MSC.writing.masteredChars().length)) === 2);
      ok('Continue lesson shown', !!(await p.$('[data-click="wang-continue"]')));
      await p.click('[data-click="wang-continue"]'); await p.waitForTimeout(300);
      continue;
    }
    await p.click('#w-next'); await p.waitForTimeout(150);
  }
  const phases = plan.map((x) => x.split(':')[1]);
  ok('each picked char: Watch → Trace → Guided (12 steps)', phases.slice(0, 12).join() === 'Watch,Trace,Guided,Watch,Trace,Guided,Watch,Trace,Guided,Watch,Trace,Guided', phases.join());
  ok('failed char: back through Guided once, then checked again', phases.length === 18 && plan.slice(16).join() === `${checkFailedChar}:Guided,${checkFailedChar}:check`, plan.slice(12).join());
  ok('all 4 mastered, lesson cleared', await S(p, () => MSC.writing.masteredChars().length === 6 && !MSC.writing.hasLesson()));
  ok('every linked word is now in the notebook with How to write', await p.evaluate((ws) => ws.every((w) => MSC.vocab.has(w) && MSC.howto.has(w)), linked));
  ok('at least one linked word was newly added', (await S(p, () => MSC.state.vocab.length)) > vocabBefore);

  console.log('— wall + notebook');
  ok('lesson-complete view shows 4 signs', (await p.$$('.sign')).length === 4);
  ok('the log gets a summary message with tappable characters', (await p.$$('#log-list .log-chip')).length === 4);
  await p.click('.sign >> nth=0'); await p.waitForTimeout(500);
  const word = await p.evaluate(() => MSC.state.selectedWord);
  ok('tapping a sign opens its word in the notebook', (await p.$eval('#view-notebook', (e) => !e.classList.contains('hidden'))) && !!word, word);
  ok('How to write section present', !!(await p.$('.howto-char[data-howto-char]')));
  await p.waitForTimeout(1800);
  await p.screenshot({ path: 'e2e_notebook.png' });

  ok('no page errors', p.errors.length === 0, p.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

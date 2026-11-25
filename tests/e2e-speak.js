// node tests/e2e-speak.js — speech input (mocked recogniser): what was heard appears as a tappable NPC-style line, in Barista and Xiao Li.
const { chromium } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (n, c, x = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : x); if (!c) fails++; };

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await p.evaluate(() => {
    window.__heard = '';
    window.SpeechRecognition = window.webkitSpeechRecognition = function () {
      this.start = () => setTimeout(() => {
        const r = [{ transcript: window.__heard }]; r.isFinal = true;
        this.onresult({ resultIndex: 0, results: [r] }); this.onend();
      }, 50);
      this.stop = () => {};
    };
  });
  const dismiss = async () => { for (const s of ['#onboard [data-click="close-onboard"]', '#toasts-clear']) if (await p.isVisible(s)) await p.click(s).catch(() => {}); };
  const say = (t) => p.evaluate((x) => { window.__heard = x; }, t);

  console.log('— Xiao Li: speaking');
  await dismiss(); await p.click('.pill:has-text("Xiao Li")'); await p.waitForSelector('[data-click="chat-send"]');
  await dismiss(); await p.click('[data-click="chat-mode"][data-arg="speak"]');
  ok('Speak mode has a mic button instead of Send', !!(await p.$('[data-click="chat-mic"]')) && !(await p.$('[data-click="chat-send"]')));
  await say(await p.evaluate(() => MSC.chat.current().replies[0].variants[0]));
  const before = await p.evaluate(() => MSC.state.chat.log.length);
  await dismiss(); await p.click('[data-click="chat-mic"]'); await p.waitForTimeout(300);
  ok('a correct spoken answer is accepted and the chat moves on', await p.evaluate((n) => MSC.state.chat.log.length > n || MSC.state.chat.finished, before));
  ok('your spoken line shows in the chat', !!(await p.$('.chat-line.me .bubble')));

  console.log('— a wrong answer is shown as a clickable sentence');
  await say('我要咖啡');
  await dismiss(); await p.click('[data-click="chat-mic"]'); await p.waitForTimeout(300);
  const box = await p.$('#live.heard');
  ok('"You said" box appears', !!box);
  if (box) {
    ok('words are separate tappable tokens', (await box.$$('.sentence-main [data-zh-interactive]')).length >= 2, await box.$eval('.sentence-main', (e) => e.innerHTML.slice(0, 200)));
    ok('English is shown, not blurred', (await box.$$('.sentence-en:not(.veiled)')).length === 1 && (await box.$eval('.sentence-en', (e) => e.textContent)).length > 3);
    ok('has the whole-sentence 🔊 like NPC lines', !!(await box.$('.say-btn')));
    const hz = await box.$eval('.sentence-main', (e) => getComputedStyle(e).fontSize);
    const npc = await p.$eval('#panel .box .sentence.lg .sentence-main', (e) => getComputedStyle(e).fontSize);
    ok('same font size as an NPC line', hz === npc, `${hz} vs ${npc}`);
    ok('pinyin under the hanzi in Hybrid mode', (await box.$$('.sentence-py')).length === 1);
    await p.evaluate(() => MSC.actions.tier(3));
    ok('Hanzi-only mode hides the pinyin line', (await p.$$('#live.heard .sentence-py')).length === 0);
    await p.evaluate(() => MSC.actions.tier(2));
  }

  console.log('— Barista Lin');
  await p.click('[data-click="overview"]'); await dismiss();
  await p.evaluate(() => { MSC.state.story.menuChecked = true; MSC.state.inputMode = 'speak'; });
  await p.click('.pill:has-text("Barista Lin")'); await dismiss();
  await say('我要咖啡');
  await p.waitForSelector('[data-click="mic"]');
  await p.click('[data-click="mic"]'); await p.waitForTimeout(300);
  ok('Barista: heard sentence with translation', !!(await p.$('#live.heard .sentence-en:not(.veiled)')) && !!(await p.$('#live.heard .say-btn')));

  ok('no page errors', p.errors.length === 0, p.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

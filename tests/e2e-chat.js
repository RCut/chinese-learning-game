// node tests/e2e-chat.js — chatting with Xiao Li in a real browser (needs playwright).
const { chromium, devices } = require('playwright');
const H = require('./e2e-helpers.js');
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? '  ok  ' : '  FAIL', name, cond ? '' : extra); if (!cond) fails++; };
const hasZh = (t) => /[㐀-鿿]/.test(t);

const cur = (p) => p.evaluate(() => { const c = MSC.chat.current(); return c && { id: c.id, end: c.end, goal: c.goal, npc: c.npc && c.npc.hanzi, tiles: c.tiles, replies: c.replies.map((r) => ({ variants: r.variants, label: r.label, next: r.next })), hint: c.st.hint }; });
const state = (p) => p.evaluate(() => ({ dlg: MSC.state.chat && MSC.state.chat.dlg.id, finished: MSC.state.chat && MSC.state.chat.finished, log: MSC.state.chat ? MSC.state.chat.log.length : 0 }));

/** Build `variant` from the tile bank by tapping tiles in order. */
async function build(p, variant) {
  const words = await p.evaluate((v) => MSC.dict.segment(v).filter((t) => t.kind === 'word' || t.kind === 'number').map((t) => t.hanzi), variant);
  const tiles = (await cur(p)).tiles, used = new Set();
  for (const w of words) {
    const i = tiles.findIndex((t, k) => t === w && !used.has(k));
    if (i < 0) throw new Error(`no tile for ${w} in ${tiles.join(' ')}`);
    used.add(i);
    await tap(p, `#panel .bank .tile-btn >> nth=${i}`);
  }
}
/** Click like a person would: if a popup is covering the button, dismiss it (✕ on the tip, or "Clear all") and try again. */
async function tap(p, sel) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try { await p.click(sel, { timeout: 2500 }); return; } catch (e) {
      if (attempt === 3) throw e;
      await p.keyboard.press('Escape');                                  // the notification list may be open on top
      await p.waitForTimeout(150);
    }
  }
}
const rects = (p) => p.evaluate(() => ['#board', '#panel', '.app-header'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(','); }).join('|'));

(async () => {
  const b = await chromium.launch();
  const p = await H.open(b);
  await p.evaluate(() => MSC.levels.set(2));                  // these checks cover everything in the game (all levels)

  console.log('— meeting Xiao Li');
  ok('Xiao Li stands on the street with a name tag', (await p.$eval('[data-ent-label="friend"]', (e) => e.textContent)).includes('小李'));
  ok('there is a button to walk to Xiao Li', !!(await p.$('.pill:has-text("Xiao Li")')));
  const layout0 = await rects(p);
  await H.goTo(p, 'friend'); await p.waitForSelector('[data-click="chat-send"]');
  let st = await state(p);
  ok('a conversation started', !!st.dlg && !st.finished && st.log === 0, JSON.stringify(st));
  let c = await cur(p);
  ok('the goal is plain English (no Chinese hint)', c.goal && !hasZh(c.goal), c.goal);
  ok('no answer buttons — only word tiles to build with', (await p.$$('#panel [data-click^="chat-pick"], #panel .quiz-opt')).length === 0 && (await p.$$('#panel .bank .tile-btn')).length >= 4);
  ok('nothing helpful is shown by default (no pattern / clue / answer)', (await p.$$('#feedback .box')).length === 0);
  ok('page layout stable while the panel opens', (await rects(p)).split('|').slice(0, 1).join() === layout0.split('|').slice(0, 1).join());

  console.log('— wrong answer + hints');
  const wrongId = c.id;
  await tap(p, '#panel .bank .tile-btn >> nth=0'); await tap(p, '[data-click="chat-send"]'); await p.waitForTimeout(150);
  ok('a wrong answer gets a gentle reaction and opens hint 1', (await p.$$('#feedback .box')).length === 2 && (await cur(p)).hint === 1);
  ok('hint 1 shows the pattern', /Pattern/.test(await p.$eval('#feedback', (e) => e.innerText)));
  await tap(p, '[data-click="chat-hint"]'); ok('hint 2 shows the words you need', /Words you need/.test(await p.$eval('#feedback', (e) => e.innerText)));
  await tap(p, '[data-click="chat-hint"]'); ok('hint 3 shows what you could say', /You could say/.test(await p.$eval('#feedback', (e) => e.innerText)) && await p.$eval('[data-click="chat-hint"]', (e) => e.classList.contains('invisible')));
  ok('still on the same turn', (await cur(p)).id === wrongId && (await state(p)).log === 0);
  const layoutA = await rects(p);

  console.log('— building the right answer');
  await tap(p, '[data-click="chat-clear"]');
  c = await cur(p);
  await build(p, c.replies[0].variants[0]);
  ok('used tiles grey out in the bank', (await p.$$('#panel .bank .tile-btn.used')).length > 0);
  await tap(p, '[data-click="chat-send"]'); await p.waitForTimeout(250);
  st = await state(p);
  ok('the reply was accepted and the conversation moved on', st.log === (c.npc ? 2 : 1) || st.finished, JSON.stringify(st));
  ok('your line appears in the chat on the right', !!(await p.$('.chat-line.me .bubble')));
  ok('hints reset for the next turn', st.finished || (await cur(p)).hint === 0);
  ok('page layout never moved', (await rects(p)).split('|')[0] === layoutA.split('|')[0] && (await rects(p)).split('|')[2] === layoutA.split('|')[2]);

  console.log('— typing instead of building');
  if (!(await state(p)).finished) {
    await tap(p, '[data-click="chat-mode"][data-arg="recall"]');
    c = await cur(p);
    const typed = await p.evaluate((v) => MSC.dict.syllables(v).map((s) => MSC.util.numToTone(s)).join(' '), c.replies[0].variants[0]);
    await p.fill('#chat-input', typed); await p.press('#chat-input', 'Enter'); await p.waitForTimeout(250);
    ok('tone-marked pinyin is accepted when typed', (await state(p)).log > st.log || (await state(p)).finished, typed);
    await tap(p, '[data-click="chat-mode"][data-arg="tiles"]').catch(() => {});
  }

  console.log('— play whole conversations, taking different branches');
  const visited = new Set(), endings = new Set();
  for (let round = 0; round < 8; round++) {
    if (round > 0 || !(await state(p)).finished) { /* continue current */ }
    for (let guard = 0; guard < 14 && !(await state(p)).finished; guard++) {
      c = await cur(p);
      const ri = Math.floor(Math.random() * c.replies.length), vi = Math.floor(Math.random() * c.replies[ri].variants.length);
      await tap(p, '[data-click="chat-mode"][data-arg="tiles"]').catch(() => {});
      await tap(p, '[data-click="chat-clear"]').catch(() => {});
      await build(p, c.replies[ri].variants[vi]);
      await tap(p, '[data-click="chat-send"]'); await p.waitForTimeout(120);
    }
    st = await state(p); visited.add(st.dlg);
    ok(`conversation "${st.dlg}" reached its ending`, st.finished && !!(await p.$('text=Conversation finished')));
    endings.add(await p.evaluate(() => MSC.state.chat.cur.npc.hanzi));
    const before = st.dlg;
    await tap(p, '[data-click="chat-new"]'); await p.waitForTimeout(150);
    ok('"Talk again" starts a different conversation', (await state(p)).dlg !== before && !(await state(p)).finished);
  }
  ok(`variety: played ${visited.size} different conversations, ${endings.size} different endings`, visited.size >= 4 && endings.size >= 4);

  console.log('— every visit starts a new conversation');
  const first = (await state(p)).dlg;
  await tap(p, '[data-click="overview"]'); await p.waitForTimeout(150);
  await H.goTo(p, 'friend'); await p.waitForSelector('[data-click="chat-send"]');
  ok('walking away and back starts a new random conversation', (await state(p)).dlg !== first && (await state(p)).log === 0);
  ok('words from the chat reach the notebook', await p.evaluate(() => MSC.state.vocab.length) > 50);
  ok('notebook counts HSK progress', /HSK 1[\s\S]*learned[\s\S]*met/.test(await p.evaluate(() => (MSC.actions.tab('notebook'), document.getElementById('hsk-progress').innerText))));

  console.log('— the market shopkeeper has his own conversations');
  await p.evaluate(() => MSC.actions.tab('stage'));
  await H.goTo(p, 'grocer');
  await p.waitForSelector('[data-click="chat-send"]');
  ok('walking to Shopkeeper Zhang starts HIS chat (not Xiao Li\'s)', await p.evaluate(() => MSC.state.chat.npcId === 'grocer' && MSC.state.chat.set === MSC.data.chats.grocer && MSC.state.stage === 'market'));
  ok('the panel shows the shopkeeper', /Shopkeeper Zhang/.test(await p.innerText('#panel')));
  const grocerDlgs = new Set();
  for (let round = 0; round < 4; round++) {
    for (let guard = 0; guard < 14 && !(await state(p)).finished; guard++) {
      c = await cur(p);
      const ri = Math.floor(Math.random() * c.replies.length), vi = Math.floor(Math.random() * c.replies[ri].variants.length);
      await tap(p, '[data-click="chat-clear"]').catch(() => {});
      await build(p, c.replies[ri].variants[vi]);
      await tap(p, '[data-click="chat-send"]'); await p.waitForTimeout(120);
    }
    st = await state(p); grocerDlgs.add(st.dlg);
    ok(`shopkeeper conversation "${st.dlg}" reached its ending`, st.finished && !!(await p.$('text=Conversation finished')));
    await tap(p, '[data-click="chat-new"]'); await p.waitForTimeout(150);
    ok('"Talk again" keeps talking to the shopkeeper', await p.evaluate(() => MSC.state.chat.npcId === 'grocer'));
  }
  ok(`played ${grocerDlgs.size} different shopkeeper conversations`, grocerDlgs.size >= 3);
  ok('the stall quiz still opens: Fruit Stall', await (async () => { await H.goTo(p, 'cart'); return p.evaluate(() => MSC.state.active === 'cart'); })());
  ok('walking to Xiao Li still starts Xiao Li\'s chat', await (async () => { await H.goTo(p, 'friend'); await p.waitForSelector('[data-click="chat-send"]'); return p.evaluate(() => MSC.state.chat.npcId === 'friend'); })());

  console.log('— phone');
  const m = await H.open(b, { context: { ...devices['iPhone 13'] } });
  await m.evaluate(() => MSC.levels.set(2));                  // these checks cover everything in the game (all levels)
  await H.goTo(m, 'friend'); await m.waitForSelector('[data-click="chat-send"]');
  const geo = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok('no horizontal overflow on a phone', geo.sw <= geo.cw, JSON.stringify(geo));
  await m.screenshot({ path: 'chat_phone.png' });
  await p.screenshot({ path: 'chat_desktop.png' });

  for (const pg of [p, m]) ok('no page errors', pg.errors.length === 0, pg.errors.join('; '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
  process.exit(fails ? 1 : 0);
})();

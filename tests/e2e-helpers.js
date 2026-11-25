// Shared helpers for the browser tests: open the game, and "draw" strokes with a mouse like a (slightly shaky) finger.
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

async function open(browser, opts = {}) {
  const ctx = await browser.newContext(opts.context || { viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|fonts\./.test(m.text())) p.errors.push(m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  // record speech instead of playing it
  await p.addInitScript(() => {
    window.__said = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { value: { speak: (u) => window.__said.push(u.text), cancel() {}, getVoices: () => [], speaking: false, pending: false } });
  });
  if (opts.save) await p.addInitScript((s) => { if (!localStorage.getItem('mandarin_street_corner_v5')) localStorage.setItem('mandarin_street_corner_v5', s); }, opts.save);
  await p.goto(URL);
  await p.waitForTimeout(250);
  return p;
}

/** Walk to a person anywhere (through the street's doors if needed) and wait until their panel is open. */
async function goTo(p, id) {
  await p.evaluate((x) => MSC.stage.go(x), id);
  await p.waitForFunction((x) => MSC.state.active === x && !document.getElementById('stage-fade').classList.contains('on'), id, { timeout: 25000 });
  await p.waitForTimeout(150);
}

// the tray slides in; don't measure or draw until it has settled
const settled = (p) => p.waitForFunction(() => { const w = document.getElementById('writer'); if (!w || !w.classList.contains('open')) return true; const t = getComputedStyle(w).transform; return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'; });
const boardRect = async (p) => { await settled(p); return boardRect0(p); };
const boardRect0 = (p) => p.evaluate(() => { const r = document.querySelector('#w-board svg').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });

/** Draw stroke `i` of `ch` (reference centre line + a little wobble). `reverse` draws it backwards. */
async function drawStroke(p, ch, i, { reverse = false, wobble = 14 } = {}) {
  const med = await p.evaluate(([c, k]) => MSC.strokes.screenMedians(MSC.data.strokes[c])[k], [ch, i]);
  let pts = await p.evaluate(([m]) => MSC.strokes.resample(m, 14), [med]);
  if (reverse) pts = pts.slice().reverse();
  const r = await boardRect(p);
  const at = (q, n) => [r.x + (q[0] / 1024) * r.w + (Math.sin(n) * wobble * r.w) / 1024, r.y + (q[1] / 1024) * r.h + (Math.cos(n * 1.7) * wobble * r.h) / 1024];
  const a = at(pts[0], 0);
  await p.mouse.move(a[0], a[1]); await p.mouse.down();
  for (let n = 1; n < pts.length; n++) { const q = at(pts[n], n); await p.mouse.move(q[0], q[1], { steps: 2 }); }
  await p.mouse.up();
  await p.waitForTimeout(60);
}

const strokeCount = (p, ch) => p.evaluate((c) => MSC.data.strokes[c].strokes.length, ch);

/** Write the whole current character correctly. */
async function writeChar(p, ch) { const n = await strokeCount(p, ch); for (let i = 0; i < n; i++) await drawStroke(p, ch, i); }

/** Scribble that matches nothing. */
async function scribble(p) {
  const r = await boardRect(p);
  await p.mouse.move(r.x + r.w * 0.1, r.y + r.h * 0.1); await p.mouse.down();
  await p.mouse.move(r.x + r.w * 0.9, r.y + r.h * 0.15, { steps: 6 }); await p.mouse.move(r.x + r.w * 0.15, r.y + r.h * 0.9, { steps: 6 }); await p.mouse.up();
  await p.waitForTimeout(60);
}

const phase = (p) => p.$eval('#w-phase', (e) => e.textContent);
const wchar = (p) => p.evaluate(() => MSC.writing && document.getElementById('w-hz').textContent);
async function waitNext(p) { await p.waitForSelector('#w-next:not(.invisible)', { timeout: 15000 }); }

module.exports = { goTo, open, drawStroke, writeChar, scribble, boardRect, phase, waitNext, strokeCount, URL };

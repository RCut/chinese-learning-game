/*
 * The writing tray — slides up from the bottom on phones, and sits as a side panel on tablets/desktop.
 * It runs a SESSION from js/game/writing.js (lesson, tutorial, review or practice):
 *   watch    Wang draws the character (animation, audio, mnemonic)
 *   trace    write over a gray outline
 *   guided   no outline — only the start point and direction of the next stroke
 *   check    from memory on an empty grid; scored (≤ 2 mistakes, no full-character hint)
 *   practice from memory, from the notebook; never changes mastery
 *
 * Layout policy: every row of the tray exists from the start and only changes content or visibility,
 * so nothing jumps while you write.
 */
(function (MSC) {
  const U = MSC.util, WR = MSC.writing, SB = MSC.StrokeBoard, SM = MSC.strokes, UI = MSC.ui;
  const WRT = (MSC.writer = {});
  let session = null, cur = null, board = null, run = null, built = false, animating = false, armedTimer = null;
  const $ = (id) => document.getElementById(id);

  const PHASE = { watch: 'Watch', trace: 'Trace', guided: 'Guided', check: 'Memory check', practice: 'Practice' };
  const HINT_LABEL = ['💡 Hint', '💡 More', '👁 Show it', '💡 Hint'];
  const SEAL_TEXT = {
    gold: 'Gold seal — a perfect character!',
    red: 'Red seal — nicely written.',
    plain: 'Plain ink — keep practising, it will come.',
  };

  function build() {
    $('writer').innerHTML = `
      <div class="w-handle" id="w-handle"><i></i></div>
      <div class="w-head">
        <div class="w-id">
          <div class="w-hz hz" id="w-hz"></div>
          <div><div class="w-py"><span id="w-py"></span><button class="say-btn sm" id="w-say" aria-label="Hear it">🔊</button></div><div class="w-mean" id="w-mean"></div></div>
        </div>
        <div class="w-topright"><span class="w-phase" id="w-phase"></span><button class="w-x" data-click="writer-close" aria-label="Close">✕</button></div>
      </div>
      <div class="w-meta"><div class="w-slots" id="w-slots"></div><span id="w-seal" class="w-seal"></span><div class="w-count num" id="w-count"></div></div>
      <div class="w-boardwrap"><div id="w-board" class="w-board"></div></div>
      <div class="w-msg" id="w-msg" aria-live="polite"></div>
      <div class="w-controls">
        <button id="w-undo" data-click="w-undo">↶ Undo</button>
        <button id="w-clear" data-click="w-clear">🗑 Clear</button>
        <button id="w-watch" data-click="w-watch">▶ Watch</button>
        <button id="w-hint" class="hint" data-click="w-hint">💡 Hint</button>
        <button id="w-next" class="next invisible" data-click="w-next">Next →</button>
      </div>`;
    built = true;
    const head = $('w-handle');
    let y0 = null;                                                  // swipe down to close (phones)
    const tray = $('writer');
    const narrow = () => window.matchMedia('(max-width: 899px)').matches;
    [head, tray.querySelector('.w-head')].forEach((h) => {
      h.addEventListener('pointerdown', (e) => { if (narrow() && !e.target.closest('button')) { y0 = e.clientY; try { h.setPointerCapture(e.pointerId); } catch (err) { /* no active pointer: the swipe still works */ } } });
      h.addEventListener('pointermove', (e) => { if (y0 !== null) tray.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
      const up = (e) => {
        if (y0 === null) return;
        const dy = e.clientY - y0; y0 = null;
        tray.style.transform = '';
        if (dy > 90) WRT.close();
      };
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
    });
    $('w-say').addEventListener('click', () => { if (cur) MSC.speech.say(cur.c, $('w-say')); });
  }

  const msg = (html) => { $('w-msg').innerHTML = html || ''; };
  const msgText = (t) => msg(U.esc(t));
  const vibrate = () => { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* not supported */ } };

  function setControls({ undo, clear, watch, hint }) {
    [['w-undo', undo], ['w-clear', clear], ['w-watch', watch], ['w-hint', hint]].forEach(([id, on]) => {
      const b = $(id); b.disabled = !on; b.classList.toggle('off', !on);
    });
  }
  const interactive = () => cur && cur.k !== 'watch' && !run.done;
  function syncControls() {
    const on = interactive() && !animating;
    setControls({ undo: on, clear: on, watch: !animating && (cur.k === 'watch' || !run.done), hint: on && run.hint < 3 });
    $('w-hint').textContent = HINT_LABEL[run.hint];
  }

  function updateCount() {
    $('w-count').textContent = !board ? '' : board.idx >= board.n ? `All ${board.n} strokes` : cur.k === 'watch' ? `${board.n} strokes` : `Stroke ${board.idx + 1} of ${board.n}`;
  }

  function guides() {
    if (!board || run.done) return;
    if ((cur.k === 'guided' || run.hint >= 2) && board.idx < board.n) board.showStart(board.idx); else board.clearHints();
  }

  // ───────────── steps ─────────────
  function showStep() {
    cur = session.current();
    if (!cur) { WRT.close(); return; }
    const info = WR.info(cur.c);
    const unlocked = session.started(cur);
    run = { mistakes: 0, hint: 0, done: false, taps: 0, armed: false };
    animating = false;
    if (board) board.destroy();
    board = new SB($('w-board'), cur.c, { numbers: cur.k === 'watch' });
    board.onDraw = onDraw;

    const hidden = cur.k === 'check' || cur.k === 'practice';
    $('w-hz').textContent = hidden ? '？' : cur.c;
    $('w-hz').classList.toggle('mystery', hidden);
    $('w-py').textContent = info.pinyin;
    $('w-mean').textContent = info.meaning;
    $('w-phase').textContent = PHASE[cur.k];
    $('w-slots').innerHTML = session.slots().map((s) => `<span class="w-slot ${s.state}">${s.state === 'done' ? '✓' : s.state === 'missed' ? '·' : ''}</span>`).join('');
    $('w-seal').innerHTML = '';
    $('w-next').classList.add('invisible');
    $('w-next').textContent = 'Next →';
    board.setOutline(cur.k === 'trace');
    board.setEnabled(cur.k !== 'watch');
    updateCount();

    let intro = '';
    if (cur.k === 'watch') {
      intro = U.esc(info.mnemonic);
      unlocked.forEach((r) => { intro += `<br><b>New rule:</b> ${U.esc(r.title)}${r.hanzi ? ` — ${UI.richText(r.hanzi)}` : ''}`; });
      msg(intro);
      MSC.speech.say(cur.c);
      syncControls();
      playWatch();
    } else {
      msg({ trace: 'Trace the gray outline, stroke by stroke.', guided: 'Write it again — follow the dot and the arrow.', check: 'Write it from memory.', practice: 'Write it from memory. Hints are available.' }[cur.k]);
      guides();
      syncControls();
    }
  }

  async function playWatch() {
    animating = true; syncControls();
    const ok = await board.animateAll({ numbers: true });
    animating = false;
    if (!ok) return;
    updateCount();
    syncControls();
    $('w-next').classList.remove('invisible');
  }

  function onDraw(points) {
    if (!interactive() || animating) return;
    const idx = board.idx;
    const r = SM.classify(points, board.med, idx);
    if (r.kind === 'ignore') {
      if (++run.taps >= 2) msgText('Drag across the grid to draw the stroke.');
      return;
    }
    if (r.kind === 'ok') {
      board.accept(points);
      vibrate();
      msg('');
      updateCount();
      if (board.idx >= board.n) finishChar(); else { guides(); syncControls(); }
      return;
    }
    run.mistakes++;
    board.reject(points);
    const info = WR.info(cur.c);
    const specific = info.tips && info.tips[idx];
    if (r.kind === 'order') {
      msgText(`Not yet, that’s a later stroke. ${WR.tipFor(cur.c, idx)}`);
    } else if (r.kind === 'direction') {
      board.showStart(idx);
      msgText(`Right stroke, other way round — follow the arrow.${specific ? ` ${specific}` : ''}`);
    } else {
      board.flashStroke(idx);
      msgText(`Not quite — watch the flash for the right stroke.${specific ? ` ${specific}` : ''}`);
    }
  }

  function finishChar() {
    run.done = true;
    board.clearHints();
    const seal = WR.grade(run);
    const scored = cur.k === 'check';
    const passed = scored ? WR.passes(run) : true;
    const res = { seal, passed, mistakes: run.mistakes, hint: run.hint, strokes: board.user.slice() };
    session.finish(res);
    $('w-seal').innerHTML = SB.sealHtml(seal);
    $('w-seal').classList.remove('stamp'); void $('w-seal').offsetWidth; $('w-seal').classList.add('stamp');
    let text = SEAL_TEXT[seal];
    if (scored && !passed) {
      const why = run.hint >= 3 ? 'you used the full-character hint' : 'more than 2 mistakes';
      text = `Not mastered this time — ${why}. ${session.kind === 'lesson' ? 'Wang will have you write it again.' : 'It stays first in line for your next review.'}`;
    } else if (scored && cur.k === 'check') {
      text = `Mastered! ${text}`;
    }
    msgText(text);
    $('w-next').textContent = session.current() ? 'Next →' : session.kind === 'practice' ? 'Done' : 'Finish';
    $('w-next').classList.remove('invisible');
    syncControls();
  }

  // ───────────── controls ─────────────
  function undo() {
    if (!interactive() || animating || board.idx === 0) return;
    board.reset(board.idx - 1);
    updateCount(); guides(); msg(''); syncControls();
  }
  function clear() {
    if (!interactive() || animating || board.idx === 0) return;
    board.reset(0);
    updateCount(); guides(); msg(''); syncControls();
  }
  function hint() {
    if (!interactive() || animating || run.hint >= 3) return;
    run.hint++;
    const i = board.idx;
    if (run.hint === 1) {
      const info = WR.info(cur.c), sp = info.tips && info.tips[i];
      msgText(`💡 ${info.mnemonic}${sp ? ` ${sp}` : ''}`);
    }
    if (run.hint === 2) { board.showStart(i); msgText('Start at the orange dot and follow the arrow.'); }
    if (run.hint === 3) { board.setOutline(true); board.flashStroke(i); msgText('Here is the whole character. This counts as the full-character hint.'); }
    syncControls();
  }
  async function watchAgain() {
    if (animating || !cur) return;
    if (cur.k === 'watch') { $('w-next').classList.add('invisible'); return playWatch(); }
    if (run.done) return;
    if ((cur.k === 'check' || cur.k === 'practice') && run.hint < 3) {
      if (!run.armed) {                                              // watching shows the answer, so confirm first
        run.armed = true;
        msgText('Watching shows the whole character, so it counts as the full-character hint. Tap Watch again to go ahead.');
        clearTimeout(armedTimer); armedTimer = setTimeout(() => { if (run) run.armed = false; }, 6000);
        return;
      }
      run.hint = 3;
    }
    run.armed = false;
    animating = true; board.setEnabled(false); syncControls();
    board.setOutline(false);
    const ok = await board.animateAll({ numbers: false });
    animating = false;
    if (!ok || !session) return;
    board.reset(0);
    board.setOutline(cur.k === 'trace' || run.hint >= 3);
    board.setEnabled(true);
    updateCount(); guides(); syncControls();
    msgText('Your turn.');
  }
  function next() {
    if (!cur || (!run.done && cur.k !== 'watch')) return;
    if (cur.k === 'watch') { if (animating) return; session.finish({}); }
    if (session.current()) showStep(); else WRT.close();
  }

  // ───────────── open / close ─────────────
  WRT.isOpen = () => !!session;
  WRT.current = () => (cur ? { ...cur } : null);

  WRT.begin = (sess) => {
    if (session) return;
    if (!built) build();
    session = sess;
    MSC.gestures.hideTip();
    document.body.classList.add('writer-open');
    $('writer').classList.add('open');
    $('writer-backdrop').classList.add('show');
    showStep();
  };

  WRT.close = () => {
    if (!session) return;
    const s = session;
    session = null; cur = null; animating = false;
    clearTimeout(armedTimer);
    if (board) { board.destroy(); board = null; }
    document.body.classList.remove('writer-open');
    $('writer').classList.remove('open');
    $('writer').style.transform = '';
    $('writer-backdrop').classList.remove('show');
    if (s.end) s.end();
    MSC.emit('writer-closed', s);
  };

  const A = MSC.actions;
  A['writer-close'] = () => WRT.close();
  A['w-undo'] = undo; A['w-clear'] = clear; A['w-hint'] = hint; A['w-watch'] = watchAgain; A['w-next'] = next;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && session) WRT.close(); });
})(window.MSC = window.MSC || {});

/*
 * Corner toasts (fixed overlay, never affects layout) and the dismissible first-time tip.
 *
 * Every popup can be dismissed: tap the ✕, or swipe it sideways (a mouse drag works too).
 * Holding a toast pauses its timer so it can be read; "Clear all" appears when two or more are stacked.
 */
(function (MSC) {
  const U = MSC.util;
  const T = {};
  const READ_MS = { vocab: 6500, plain: 3200 };
  const MAX_VISIBLE = 3;
  let pending = [];
  let timer = null;
  const box = () => document.getElementById('toasts');

  // ───────────── swipe to dismiss (shared by toasts and the first-time tip) ─────────────
  /** Horizontal swipe past ~70px (or a quick flick) dismisses; a shorter drag snaps back. */
  function swipeable(el, { onDismiss, onHold, onRelease }) {
    let x0 = null, y0 = null, dx = 0, id = null, locked = false, t0 = 0;
    const snapBack = () => { el.style.transition = 'transform .18s ease, opacity .18s ease'; el.style.transform = ''; el.style.opacity = ''; };
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; locked = false; id = e.pointerId; t0 = Date.now();
      el.style.transition = 'none';
      try { el.setPointerCapture(id); } catch (err) { /* fine */ }      // so a mouse swipe that leaves the popup is still tracked
      if (onHold) onHold();
    });
    el.addEventListener('pointermove', (e) => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (!locked) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) locked = true;
        else if (Math.abs(dy) > 14) { x0 = null; snapBack(); if (onRelease) onRelease(); return; }
        else return;
      }
      el.style.transform = `translateX(${dx}px)`;
      el.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 280));
    });
    const end = (e) => {
      if (x0 === null) return;
      const moved = dx, fast = Math.abs(moved) / Math.max(1, Date.now() - t0) > 0.5;
      x0 = null;
      if (locked && e.type !== 'pointercancel' && (Math.abs(moved) > 70 || (fast && Math.abs(moved) > 30))) {
        el.style.transition = 'transform .2s ease, opacity .2s ease';
        el.style.transform = `translateX(${moved > 0 ? '120%' : '-120%'})`;
        el.style.opacity = '0';
        setTimeout(onDismiss, 200);
      } else {
        snapBack();
        if (onRelease) onRelease();
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  // ───────────── toasts ─────────────
  const visible = () => [...box().querySelectorAll('.toast')];

  function syncClear() {
    const b = document.getElementById('toasts-clear');
    if (b) b.classList.toggle('show', visible().length >= 2);
  }

  function remove(el) {
    clearTimeout(el._t); clearTimeout(el._t2);
    el.remove();
    syncClear();
  }

  function schedule(el, ms) {
    clearTimeout(el._t); clearTimeout(el._t2);
    el._t = setTimeout(() => { el.classList.add('out'); el._t2 = setTimeout(() => remove(el), 550); }, ms);
  }

  // While the writing tray is open nothing may cover the board: toasts wait and appear when it closes.
  let held = [];
  function push(html, kind, ms) {
    if (document.body.classList.contains('writer-open') && kind !== 'tip') { held.push([html, kind, ms]); return; }
    const el = document.createElement('div');
    el.className = `toast ${kind || ''}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="toast-body">${html}</div><button type="button" class="toast-x" aria-label="Dismiss">✕</button>`;
    box().appendChild(el);
    while (visible().length > MAX_VISIBLE) remove(visible()[0]);
    el.querySelector('.toast-x').addEventListener('click', (e) => { e.stopPropagation(); remove(el); });
    el.addEventListener('click', (e) => { if (e.target.closest('[data-click]')) setTimeout(() => remove(el), 0); });   // acting on a toast's button closes it
    swipeable(el, {
      onDismiss: () => remove(el),
      onHold: () => { clearTimeout(el._t); clearTimeout(el._t2); el.classList.remove('out'); },     // pause while it is being read or dragged
      onRelease: () => schedule(el, 1800),
    });
    schedule(el, ms);
    syncClear();
  }

  /** A toast that may contain buttons (e.g. tappable characters). */
  T.html = (html, kind, ms) => push(html, kind || 'act', ms || 8000);

  T.show = (text, ms) => push(U.esc(text), 'plain', ms || READ_MS.plain);

  T.clearAll = () => { visible().forEach(remove); held = []; };

  /** Queue a newly learned word; several arriving together become one toast. */
  T.word = (entry) => {
    pending.push(entry);
    if (timer) return;
    timer = setTimeout(() => {
      const list = pending; pending = []; timer = null;
      const shown = list.slice(0, 3).map((e) =>
        `<span class="wl-line"><b class="hz">${U.esc(e.hanzi)}</b> ${U.esc(e.pinyin)} — ${U.esc(e.english)}</span>`).join('');
      const more = list.length > 3 ? `<span class="wl-line">+${list.length - 3} more</span>` : '';
      push(`✨ ${list.length === 1 ? 'New word' : `${list.length} new words`} added to your notebook${shown}${more}`, 'vocab', READ_MS.vocab + (Math.min(list.length, 3) - 1) * 800);
    }, 200);
  };

  MSC.on('writer-closed', () => { const list = held; held = []; list.forEach(([h, k, m]) => push(h, k, m)); });

  // ───────────── first-time tip ─────────────
  T.onboarding = () => {
    if (MSC.state.tipSeen) return;
    const tip = MSC.data.ui.onboardingTip;
    document.getElementById('onboard-title').textContent = tip.title;
    document.getElementById('onboard-body').textContent = tip.body;
    document.getElementById('onboard').classList.add('show');
  };
  T.closeOnboarding = () => {
    const el = document.getElementById('onboard');
    el.classList.remove('show');
    el.style.transition = ''; el.style.transform = ''; el.style.opacity = '';
    MSC.state.tipSeen = true;
    MSC.progress.save();
  };
  MSC.actions['close-onboard'] = T.closeOnboarding;
  MSC.actions['toasts-clear'] = T.clearAll;

  // The "Clear all" pill and swipe on the tip card exist from the start.
  const clear = document.createElement('button');
  clear.id = 'toasts-clear'; clear.type = 'button'; clear.className = 'toasts-clear';
  clear.setAttribute('data-click', 'toasts-clear');
  clear.textContent = 'Clear all ✕';
  box().appendChild(clear);
  swipeable(document.getElementById('onboard'), { onDismiss: T.closeOnboarding });

  MSC.toast = T;
})(window.MSC = window.MSC || {});

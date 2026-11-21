/*
 * Input gestures.
 *  [data-zh-interactive]  short tap/click = speak + run data-action; press & hold = translation tooltip
 *  [data-say]             speaker button: speaks the whole sentence
 *  [data-reveal]          blurred translation: tap to reveal
 *  [data-click]           ordinary button: runs MSC.actions[name](arg, el)
 */
(function (MSC) {
  const G = { timer: null, el: null, long: false, x: 0, y: 0, touch: false, suppressUntil: 0 };
  const tip = () => document.getElementById('tooltip');

  function showTip(el) {
    const zh = el.getAttribute('data-tip-zh') || '';
    const en = el.getAttribute('data-tip-en') || '';
    if (!zh && !en) return;
    const t = tip();
    document.getElementById('tip-zh').textContent = zh;
    document.getElementById('tip-zh').style.display = zh ? 'block' : 'none';
    document.getElementById('tip-en').textContent = en;
    document.getElementById('tip-en').style.display = en ? 'block' : 'none';
    t.style.left = '0px'; t.style.top = '0px';
    const r = el.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    let left = Math.max(10, Math.min(innerWidth - tr.width - 10, r.left + r.width / 2 - tr.width / 2));
    let top;
    if (G.touch) { top = r.top - tr.height - 44; if (top < 62) top = Math.min(innerHeight - tr.height - 12, r.bottom + 24); }
    else { top = r.bottom + 8; if (top + tr.height > innerHeight - 12) top = Math.max(62, r.top - tr.height - 8); }
    t.style.left = `${left}px`; t.style.top = `${top}px`;
    t.classList.add('show');
  }
  const hideTip = () => tip().classList.remove('show');
  const clearTimer = () => { if (G.timer) { clearTimeout(G.timer); G.timer = null; } };
  const reset = () => { clearTimer(); G.el = null; G.long = false; hideTip(); };

  function run(el) {
    const speak = el.getAttribute('data-speak');
    if (speak) MSC.speech.say(speak, el);
    const action = el.getAttribute('data-action');
    if (action && MSC.actions[action]) MSC.actions[action](el.getAttribute('data-arg') || '', el);
  }

  const target = (e) => (e.target && e.target.closest ? e.target.closest('[data-zh-interactive="1"]') : null);

  function press(e, el, x, y, touch, delay) {
    reset();
    G.el = el; G.x = x; G.y = y; G.touch = touch;
    G.timer = setTimeout(() => { if (G.el === el) { G.long = true; showTip(el); } }, delay);
  }

  function setup() {
    document.addEventListener('touchstart', (e) => {
      const el = target(e);
      if (!el || !e.touches.length) { reset(); return; }
      press(e, el, e.touches[0].clientX, e.touches[0].clientY, true, 220);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!G.el || !e.touches.length) return;
      if (Math.hypot(e.touches[0].clientX - G.x, e.touches[0].clientY - G.y) > 14) { clearTimer(); if (!G.long) G.el = null; }
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (G.el) {
        G.suppressUntil = Date.now() + 450;      // swallow the ghost click that follows a handled tap
        if (!G.long) run(G.el);
      }
      reset();
    }, { passive: true });
    document.addEventListener('touchcancel', reset, { passive: true });

    document.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || Date.now() < G.suppressUntil) return;
      const el = target(e);
      if (!el) { reset(); return; }
      press(e, el, e.clientX, e.clientY, false, 200);
    });
    document.addEventListener('mousemove', (e) => {
      if (G.el && !G.touch && Math.hypot(e.clientX - G.x, e.clientY - G.y) > 10) reset();
    });
    document.addEventListener('mouseup', () => {
      if (G.touch) return;
      if (G.el && !G.long) run(G.el);
      reset();
    });
    document.addEventListener('contextmenu', (e) => { if (target(e)) e.preventDefault(); });

    document.addEventListener('click', (e) => { if (Date.now() < G.suppressUntil) { e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener('click', (e) => {
      const say = e.target.closest('[data-say]');
      if (say) { MSC.speech.say(say.getAttribute('data-say'), say); return; }
      const rev = e.target.closest('[data-reveal]');
      if (rev) {
        rev.classList.remove('veiled');
        MSC.state.revealed.add(rev.getAttribute('data-reveal'));
        return;
      }
      const btn = e.target.closest('[data-click]');
      if (btn && MSC.actions[btn.getAttribute('data-click')]) MSC.actions[btn.getAttribute('data-click')](btn.getAttribute('data-arg') || '', btn);
    });
  }

  MSC.gestures = { setup, hideTip };
})(window.MSC = window.MSC || {});

/* Corner toasts (fixed overlay, never affects layout) and the dismissible first-time tip. */
(function (MSC) {
  const U = MSC.util;
  const T = {};
  const READ_MS = { vocab: 6500, plain: 3200 };
  let pending = [];
  let timer = null;

  function push(html, kind, ms) {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${kind || ''}`;
    el.innerHTML = html;
    box.appendChild(el);
    while (box.querySelectorAll('.toast').length > 3) box.querySelector('.toast').remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 550); }, ms);
  }

  T.show = (text, ms) => push(U.esc(text), 'plain', ms || READ_MS.plain);

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

  T.onboarding = () => {
    const MSCs = MSC.state;
    if (MSCs.tipSeen) return;
    const tip = MSC.data.ui.onboardingTip;
    document.getElementById('onboard-title').textContent = tip.title;
    document.getElementById('onboard-body').textContent = tip.body;
    document.getElementById('onboard').classList.add('show');
  };
  T.closeOnboarding = () => {
    document.getElementById('onboard').classList.remove('show');
    MSC.state.tipSeen = true;
    MSC.progress.save();
  };
  MSC.actions['close-onboard'] = T.closeOnboarding;

  MSC.toast = T;
})(window.MSC = window.MSC || {});

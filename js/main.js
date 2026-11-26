/* Start-up, header controls and keyboard input. */
(function (MSC) {
  const S = MSC.state;

  function updateStats(info) {
    document.getElementById('money-val').textContent = `¥${S.money}`;
    document.getElementById('xp-val').textContent = `${S.xp} XP`;
    document.getElementById('vocab-count').textContent = S.vocab.length;
    document.getElementById('nb-total').textContent = S.vocab.length;
    if (info && info.moneyChanged) {
      const chip = document.getElementById('money-chip');
      chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    }
  }
  MSC.on('stats', updateStats);

  function setTier(n) {
    S.displayMode = Number(n);
    document.querySelectorAll('#tier-seg button').forEach((b) => b.classList.toggle('on', Number(b.dataset.arg) === S.displayMode));
    MSC.progress.save();
    MSC.stage.refresh();
    MSC.panel.render(false);
    MSC.notebook.render();
  }

  /** 'stage' | 'notebook' | 'settings' */
  function showTab(tab) {
    if (tab !== 'settings') S.lastTab = tab;
    document.getElementById('view-stage').classList.toggle('hidden', tab !== 'stage');
    document.getElementById('view-notebook').classList.toggle('hidden', tab !== 'notebook');
    document.getElementById('view-settings').classList.toggle('hidden', tab !== 'settings');
    document.getElementById('tab-stage').classList.toggle('on', tab === 'stage');
    document.getElementById('tab-notebook').classList.toggle('on', tab === 'notebook');
    document.getElementById('tab-settings').classList.toggle('on', tab === 'settings');
    if (tab === 'notebook') MSC.notebook.render();
    if (tab === 'settings') window.scrollTo({ top: 0 });
  }

  MSC.actions.tab = showTab;
  MSC.actions.tier = setTier;
  MSC.actions.settings = () => showTab(S.lastTab && !document.getElementById('view-settings').classList.contains('hidden') ? S.lastTab : 'settings');
  MSC.actions.rate = (v) => MSC.speech.setRate(Number(v));
  MSC.actions['test-voice'] = (a, el) => MSC.speech.say('你好，欢迎来到中文街角！', el);

  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    if (document.getElementById('view-stage').classList.contains('hidden')) return;     // arrow keys only move you on the stage
    if (MSC.writer && MSC.writer.isOpen()) return;                 // the tray owns the keyboard while it is open
    const k = e.key.toLowerCase();
    const dir = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }[k];
    if (dir) { e.preventDefault(); MSC.stage.move(dir[0], dir[1]); }
    else if (k === 'e') { e.preventDefault(); MSC.stage.interact(); }
  });

  window.addEventListener('DOMContentLoaded', () => {
    MSC.progress.load();
    MSC.economy.init();
    MSC.speech.initVoices();
    MSC.gestures.setup();
    MSC.stage.build();
    updateStats();
    setTier(S.displayMode || 2);
    MSC.speech.syncRate();
    const sfx = document.getElementById('sfx-on');
    if (sfx) { sfx.checked = !MSC.sfx.muted; sfx.addEventListener('change', () => { MSC.sfx.muted = !sfx.checked; MSC.progress.save(); if (sfx.checked) MSC.sfx.enter('home'); }); }
    showTab('stage');
  });
})(window.MSC = window.MSC || {});

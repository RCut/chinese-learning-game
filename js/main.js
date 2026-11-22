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
    MSC.stage.refresh();
    MSC.panel.render(false);
    MSC.notebook.render();
  }

  function showTab(tab) {
    const stage = tab === 'stage';
    document.getElementById('view-stage').classList.toggle('hidden', !stage);
    document.getElementById('view-notebook').classList.toggle('hidden', stage);
    document.getElementById('tab-stage').classList.toggle('on', stage);
    document.getElementById('tab-notebook').classList.toggle('on', !stage);
    if (!stage) MSC.notebook.render();
  }

  MSC.actions.tab = showTab;
  MSC.actions.tier = setTier;
  MSC.actions.rate = () => MSC.speech.toggleRate();
  MSC.actions['test-voice'] = (a, el) => MSC.speech.say('你好，欢迎来到中文街角！', el);

  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    if (document.getElementById('view-stage').classList.contains('hidden')) return;
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
    setTier(2);
    showTab('stage');
  });
})(window.MSC = window.MSC || {});

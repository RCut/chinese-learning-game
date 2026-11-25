/*
 * Level-up: the header chip ("Lv 1"), and the pop-up when the next level opens — with what is new around town.
 * (The one pop-up in the game: everything else goes to the notification log.)
 */
(function (MSC) {
  const U = MSC.util, S = MSC.state, L = MSC.levels;
  const $ = (id) => document.getElementById(id);
  const chip = () => { const c = $('level-chip'); if (c) c.textContent = `Lv ${S.level}`; };

  /** what appears at exactly this level */
  function whatsNew(lv) {
    const out = [];
    Object.values(MSC.data.world.stages).forEach((st) => {
      const n = (st.objects || []).filter((o) => L.of(o, 'object') === lv).length + st.entities.filter((e) => L.of(e, 'person') === lv).length;
      if (n) out.push(`${st.name}: ${n} new`);
    });
    const dl = Object.values(MSC.data.chats || {}).reduce((n, c) => n + c.dialogues.filter((d) => L.of(d, 'dialogue') === lv).length, 0);
    if (dl) out.push(`${dl} new conversations`);
    const ch = MSC.data.writing.pool.filter((p) => L.of(p, 'char') === lv).length;
    if (ch) out.push(`${ch} new characters`);
    return out;
  }

  MSC.on('level-up', (e) => {
    chip();
    if (MSC.stage && MSC.stage.stage && $('board-dom').innerHTML) MSC.stage.show(S.stage, S.player);   // the places fill up
    if (MSC.panel) MSC.panel.render(false);
    if (e.silent) return;
    $('levelup-title').textContent = e.title;
    $('levelup-text').textContent = e.text;
    $('levelup-new').innerHTML = whatsNew(e.level).map((t) => `<span>${U.esc(t)}</span>`).join('');
    $('levelup').classList.add('show');
    MSC.log.say(`🎉 ${e.title}`);
  });
  MSC.on('level-progress', () => { if (MSC.panel && !S.active) MSC.panel.render(false); });
  MSC.actions['levelup-ok'] = () => { $('levelup').classList.remove('show'); };
  window.addEventListener('DOMContentLoaded', () => setTimeout(chip, 0));
})(window.MSC = window.MSC || {});

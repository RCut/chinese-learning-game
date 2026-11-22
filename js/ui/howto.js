/*
 * "How to write" — the notebook's word-details section for words Master Wang has taught.
 * A word gets it once a lesson containing its linked character is complete (see MSC.writing.canWriteWord).
 * Shows the animated stroke order (play / loop / step), stroke count, the highlighted component,
 * Wang's mnemonic, the player's best handwriting next to the reference, and a Practice button.
 */
(function (MSC) {
  const U = MSC.util, S = MSC.state, WR = MSC.writing, SB = MSC.StrokeBoard;
  const H = (MSC.howto = {});
  let boards = [];            // { c, b, loop, timer }

  H.has = (hanzi) => WR.canWriteWord(hanzi);

  /** Changes whenever the section's content would change (used to avoid needless re-renders). */
  H.signature = () => JSON.stringify([WR.masteredChars(), Object.keys(S.writing.best).map((c) => [c, S.writing.best[c].seal, S.writing.best[c].t])]);

  function block(c, multi) {
    const info = WR.info(c), sd = WR.strokeData(c);
    if (!info || !sd) return '';
    const title = multi ? `<div class="howto-ch"><span class="hz">${U.esc(c)}</span> <span class="sub">${U.esc(info.pinyin)} · ${U.esc(info.meaning)}</span></div>` : '';
    if (!WR.isMastered(c)) {
      return `<div class="howto-char">${title}<div class="howto-lock">Master Wang can teach you this.
        <button class="btn btn-ghost btn-sm" data-click="go-wang">Visit Master Wang</button></div></div>`;
    }
    const best = S.writing.best[c];
    const rules = (info.rules || []).map(WR.rule).filter(Boolean);
    const part = MSC.dict.char(c);
    const hasRad = sd.rad && sd.rad.length > 0 && sd.rad.length < sd.strokes.length;
    return `<div class="howto-char" data-howto-char="${U.esc(c)}">${title}
      <div class="howto-row">
        <div class="howto-board" data-howto-board="${U.esc(c)}"></div>
        <div class="howto-side">
          <div><b class="num">${sd.strokes.length}</b> stroke${sd.strokes.length > 1 ? 's' : ''}</div>
          <div class="howto-ctl">
            <button type="button" data-click="howto-play" data-arg="${U.esc(c)}" title="Play the stroke order">▶ Play</button>
            <button type="button" data-click="howto-loop" data-arg="${U.esc(c)}" class="loop" title="Loop">🔁 Loop</button>
            <button type="button" data-click="howto-step" data-arg="${U.esc(c)}" title="Add one stroke at a time">⏭ Step</button>
          </div>
          ${hasRad ? `<div class="howto-legend"><i></i> Highlighted component${part && part.parts ? `: ${U.esc(part.parts)}` : ''}</div>` : ''}
          ${rules.length ? `<div class="chip-list">${rules.map((r) => `<span class="rule-chip" title="${U.esc(r.tip)}">${U.esc(r.title)}</span>`).join('')}</div>` : ''}
          <div class="howto-mn">“${U.esc(info.mnemonic)}”</div>
        </div>
      </div>
      <div class="howto-mine">
        <div class="mine-cell"><div class="sub">Reference</div>${SB.referenceSvg(c)}</div>
        <div class="mine-cell"><div class="sub">Your handwriting ${best ? SB.sealHtml(best.seal) : ''}</div>${best ? SB.handwritingSvg(best.strokes) : '<div class="hw-empty">—</div>'}</div>
        <button class="btn btn-primary btn-sm" data-click="howto-practice" data-arg="${U.esc(c)}">✍️ Practice</button>
      </div></div>`;
  }

  H.html = (entry) => {
    if (!H.has(entry.hanzi)) return '';
    const chars = [...new Set([...entry.hanzi])];
    const inner = chars.map((c) => block(c, chars.length > 1)).join('');
    return inner ? `<div class="wp-sec howto"><h4>How to write</h4>${inner}</div>` : '';
  };

  // ───────────── animation boards ─────────────
  function play(rec) {
    clearTimeout(rec.timer);
    rec.b.animateAll({ numbers: true }).then((ran) => {
      if (ran && rec.loop && boards.includes(rec)) rec.timer = setTimeout(() => play(rec), 900);
    });
  }

  H.unmount = () => { boards.forEach((r) => { clearTimeout(r.timer); r.b.destroy(); }); boards = []; };

  H.mount = (root) => {
    H.unmount();
    root.querySelectorAll('[data-howto-board]').forEach((host) => {
      const c = host.getAttribute('data-howto-board');
      const rec = { c, b: new SB(host, c, { numbers: true, radical: true }), loop: false, timer: null };
      boards.push(rec);
      rec.b.showAll(true);
      play(rec);                                       // the character draws itself once when the details open
    });
  };

  const rec = (c) => boards.find((r) => r.c === c);
  const A = MSC.actions;
  A['howto-play'] = (c) => { const r = rec(c); if (r) play(r); };
  A['howto-loop'] = (c, btn) => {
    const r = rec(c); if (!r) return;
    r.loop = !r.loop;
    btn.classList.toggle('on', r.loop);
    if (r.loop) play(r); else clearTimeout(r.timer);
  };
  A['howto-step'] = (c) => { const r = rec(c); if (r) { clearTimeout(r.timer); r.loop = false; r.b.stepForward(); } };
  A['howto-practice'] = (c) => MSC.writer.begin(WR.practiceSession(c));
})(window.MSC = window.MSC || {});

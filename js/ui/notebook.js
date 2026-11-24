/*
 * Vocabulary notebook + word detail pane.
 * The detail pane lists each character of a word ONCE (no repeats, e.g. 看看 → 看) and a tidy "related" section
 * from MSC.dict.related(): phrases first, then words often used together, parts, and words it appears in.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, UI = MSC.ui;
  const NB = (MSC.notebook = {});
  let query = '';
  const CAN_WRITE = 'Can write';
  const HSK = 'HSK 1–2';

  const chip = (hanzi, extraClass) => {
    const e = D.get(hanzi);
    const known = MSC.vocab.has(hanzi);
    return `<button type="button" class="rel ${known ? '' : 'unseen'} ${extraClass || ''}" ${UI.interactAttrs(hanzi, `${hanzi} (${e.pinyin})`, e.english, 'open-word', hanzi).replace(/data-action[^ ]*/, 'data-action="open-word"')}>
      <span class="hz">${U.esc(hanzi)}</span><small>${U.esc(e.english)}</small></button>`;
  };

  let paneKey = '';
  NB.renderPane = (force) => {
    const pane = document.getElementById('word-pane');
    const entry = S.selectedWord && D.get(S.selectedWord);
    // Re-render only when the content would change, so typing in search never restarts the stroke animation or moves the pane.
    const key = `${S.selectedWord}|${entry && MSC.howto.has(entry.hanzi) ? MSC.howto.signature() : ''}|${S.displayMode}`;
    if (!force && key === paneKey) return;
    paneKey = key;
    MSC.howto.unmount();
    if (!entry) { pane.classList.remove('open'); pane.innerHTML = '<div class="wp-empty">Select a word to see its characters and related words.</div>'; return; }
    const chars = D.breakdown(entry);
    const charsHtml = entry.hanzi.length > 1
      ? `<div class="chars">${chars.map((c) => `<div class="char-row" ${UI.interactAttrs(c.hanzi, '', '', c.isWord ? 'open-word' : '', c.hanzi)}>
            <span class="c hz">${U.esc(c.hanzi)}</span>
            <span class="d"><b>${U.esc(c.pinyin)}</b> ${U.esc(c.meaning)}<small>${U.esc(c.parts)}</small></span></div>`).join('')}</div>`
      : (chars[0] && chars[0].parts ? `<div class="box-sm" style="color:#44403c">${U.esc(chars[0].parts)}</div>` : '');
    const groups = D.related(entry).map((g) =>
      `<div class="group-t">${g.title}</div><div class="chip-list">${g.items.map((i) => chip(i.hanzi)).join('')}</div>`).join('');
    pane.innerHTML = `
      <div class="pane-handle" data-pane-drag><i></i></div>
      <button class="pane-close" data-click="close-pane" aria-label="Close">✕</button>
      <div class="row" data-pane-drag style="align-items:flex-start;gap:12px">
        <div class="grow"><div class="wp-hz hz">${U.esc(entry.hanzi)}</div><div class="wp-py">${U.esc(entry.pinyin)}</div>
          <div style="font-weight:700;margin-top:2px">${U.esc(entry.english)}</div><div class="sub">${U.esc(entry.pos)} · ${U.esc(entry.category)}</div></div>
        <button class="say-btn" style="margin-right:36px" data-say="${U.esc(entry.hanzi)}" aria-label="Play">🔊</button>
      </div>
      ${entry.note ? `<div class="box amber box-sm" style="margin-top:12px">${UI.richText(entry.note)}</div>` : ''}
      ${MSC.howto.html(entry)}
      ${charsHtml ? `<div class="wp-sec"><h4>${entry.hanzi.length > 1 ? 'Characters' : 'Character'}</h4>${charsHtml}</div>` : ''}
      ${groups ? `<div class="wp-sec"><h4>Related</h4>${groups}</div>` : ''}`;
    pane.classList.add('open');
    MSC.howto.mount(pane);
  };

  NB.render = (forcePane) => {
    const writable = S.vocab.filter((h) => MSC.howto.has(h)).length;
    if (S.category === CAN_WRITE && !writable) S.category = 'All';
    const hskAll = D.all().filter((e) => e.hsk), hskKnown = hskAll.filter((e) => S.vocabSet.has(e.hanzi)).length;
    const prog = document.getElementById('hsk-progress');
    if (prog) prog.innerHTML = `HSK 1–2 words discovered: <b class="num">${hskKnown}</b> / ${hskAll.length}<div class="hsk-bar"><i style="width:${Math.round((100 * hskKnown) / hskAll.length)}%"></i></div>`;
    const cats = ['All', ...(hskKnown ? [HSK] : []), ...new Set(S.vocab.map((h) => D.get(h).category)), ...(writable ? [CAN_WRITE] : [])];
    document.getElementById('cats').innerHTML = cats.map((c) =>
      `<button class="cat ${S.category === c ? 'on' : ''}" data-click="cat" data-arg="${U.esc(c)}">${c === CAN_WRITE ? `✍ ${CAN_WRITE} <span class="num">${writable}</span>` : c === HSK ? `${HSK} <span class="num">${hskKnown}</span>` : U.esc(c)}</button>`).join('');
    const q = query.trim().toLowerCase();
    const list = S.vocab.map((h) => D.get(h)).filter((e) =>
      (S.category === 'All' || (S.category === CAN_WRITE ? MSC.howto.has(e.hanzi) : S.category === HSK ? !!e.hsk : e.category === S.category)) &&
      (!q || e.english.toLowerCase().includes(q) || e.pinyin.toLowerCase().includes(q) || e.pinyinNum.includes(q) || e.hanzi.includes(q)));
    document.getElementById('vgrid').innerHTML = list.map((e) => {
      const isNew = S.fresh.has(e.hanzi);
      return `<div class="vcard ${isNew ? 'new' : ''} ${S.selectedWord === e.hanzi ? 'sel' : ''}" ${UI.interactAttrs(e.hanzi, '', '', 'open-word', e.hanzi)}>
        <div class="row between" style="align-items:flex-start"><div>${UI.wordLabel(e.hanzi, false)}</div>
          <div class="vtags">${isNew ? '<span class="tag new">New</span>' : ''}${e.hsk ? `<span class="tag hsk" title="HSK level ${e.hsk}">HSK${e.hsk}</span>` : ''}${MSC.howto.has(e.hanzi) ? '<span class="tag write" title="You can write this">✍</span>' : ''}<span class="tag">${U.esc(e.pos)}</span></div></div>
        <div style="font-weight:700;font-size:13px">${U.esc(e.english)}</div></div>`;
    }).join('') || '<div class="wp-empty" style="grid-column:1/-1">No words match.</div>';
    NB.renderPane(forcePane === true);
  };

  MSC.on('writing-changed', () => NB.render(true));

  // On phones the details are a bottom sheet: swipe it down (from the handle or the title) to close it.
  (() => {
    const pane = document.getElementById('word-pane');
    let y0 = null;
    const sheet = () => window.matchMedia('(max-width: 1023px)').matches;
    pane.addEventListener('pointerdown', (e) => {
      const h = e.target.closest('[data-pane-drag]');
      if (!sheet() || !h || e.target.closest('button')) return;
      y0 = e.clientY; pane.style.transition = 'none';
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
    });
    pane.addEventListener('pointermove', (e) => { if (y0 !== null) pane.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
    const end = (e) => {
      if (y0 === null) return;
      const dy = e.clientY - y0; y0 = null;
      pane.style.transition = '';
      pane.style.transform = '';
      if (e.type !== 'pointercancel' && dy > 90) { S.selectedWord = null; NB.render(true); }
    };
    pane.addEventListener('pointerup', end);
    pane.addEventListener('pointercancel', end);
  })();
  MSC.actions['open-word'] = (hanzi) => { S.selectedWord = hanzi; NB.render(); };
  MSC.actions['close-pane'] = () => { S.selectedWord = null; NB.render(); };
  MSC.actions.cat = (c) => { S.category = c; NB.render(); };
  MSC.actions['clear-search'] = () => { document.getElementById('vocab-search').value = ''; query = ''; NB.render(); };
  document.addEventListener('input', (e) => { if (e.target.id === 'vocab-search') { query = e.target.value; NB.render(); } });
})(window.MSC = window.MSC || {});

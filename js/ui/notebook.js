/*
 * Vocabulary notebook + word detail pane.
 * The detail pane lists each character of a word ONCE (no repeats, e.g. 看看 → 看) and a tidy "related" section
 * from MSC.dict.related(): phrases first, then words often used together, parts, and words it appears in.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, UI = MSC.ui;
  const NB = (MSC.notebook = {});
  let query = '';

  const chip = (hanzi, extraClass) => {
    const e = D.get(hanzi);
    const known = MSC.vocab.has(hanzi);
    return `<button type="button" class="rel ${known ? '' : 'unseen'} ${extraClass || ''}" ${UI.interactAttrs(hanzi, `${hanzi} (${e.pinyin})`, e.english, 'open-word', hanzi).replace(/data-action[^ ]*/, 'data-action="open-word"')}>
      <span class="hz">${U.esc(hanzi)}</span><small>${U.esc(e.english)}</small></button>`;
  };

  NB.renderPane = () => {
    const pane = document.getElementById('word-pane');
    const entry = S.selectedWord && D.get(S.selectedWord);
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
      <button class="pane-close" data-click="close-pane" aria-label="Close">✕</button>
      <div class="row" style="align-items:flex-start;gap:12px">
        <div class="grow"><div class="wp-hz hz">${U.esc(entry.hanzi)}</div><div class="wp-py">${U.esc(entry.pinyin)}</div>
          <div style="font-weight:700;margin-top:2px">${U.esc(entry.english)}</div><div class="sub">${U.esc(entry.pos)} · ${U.esc(entry.category)}</div></div>
        <button class="say-btn" style="margin-right:36px" data-say="${U.esc(entry.hanzi)}" aria-label="Play">🔊</button>
      </div>
      ${entry.note ? `<div class="box amber box-sm" style="margin-top:12px">${UI.richText(entry.note)}</div>` : ''}
      ${charsHtml ? `<div class="wp-sec"><h4>${entry.hanzi.length > 1 ? 'Characters' : 'Character'}</h4>${charsHtml}</div>` : ''}
      ${groups ? `<div class="wp-sec"><h4>Related</h4>${groups}</div>` : ''}`;
    pane.classList.add('open');
  };

  NB.render = () => {
    const cats = ['All', ...new Set(S.vocab.map((h) => D.get(h).category))];
    document.getElementById('cats').innerHTML = cats.map((c) =>
      `<button class="cat ${S.category === c ? 'on' : ''}" data-click="cat" data-arg="${U.esc(c)}">${U.esc(c)}</button>`).join('');
    const q = query.trim().toLowerCase();
    const list = S.vocab.map((h) => D.get(h)).filter((e) =>
      (S.category === 'All' || e.category === S.category) &&
      (!q || e.english.toLowerCase().includes(q) || e.pinyin.toLowerCase().includes(q) || e.pinyinNum.includes(q) || e.hanzi.includes(q)));
    document.getElementById('vgrid').innerHTML = list.map((e) => {
      const isNew = S.fresh.has(e.hanzi);
      return `<div class="vcard ${isNew ? 'new' : ''} ${S.selectedWord === e.hanzi ? 'sel' : ''}" ${UI.interactAttrs(e.hanzi, '', '', 'open-word', e.hanzi)}>
        <div class="row between" style="align-items:flex-start"><div>${UI.wordLabel(e.hanzi, false)}</div>
          <div class="vtags">${isNew ? '<span class="tag new">New</span>' : ''}<span class="tag">${U.esc(e.pos)}</span></div></div>
        <div style="font-weight:700;font-size:13px">${U.esc(e.english)}</div></div>`;
    }).join('') || '<div class="wp-empty" style="grid-column:1/-1">No words match.</div>';
    NB.renderPane();
  };

  MSC.actions['open-word'] = (hanzi) => { S.selectedWord = hanzi; NB.render(); };
  MSC.actions['close-pane'] = () => { S.selectedWord = null; NB.render(); };
  MSC.actions.cat = (c) => { S.category = c; NB.render(); };
  MSC.actions['clear-search'] = () => { document.getElementById('vocab-search').value = ''; query = ''; NB.render(); };
  document.addEventListener('input', (e) => { if (e.target.id === 'vocab-search') { query = e.target.value; NB.render(); } });
})(window.MSC = window.MSC || {});

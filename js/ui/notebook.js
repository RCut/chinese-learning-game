/*
 * Notebook — two tabs:
 *   Words    every word you have met, by category; filter by HSK level, "HSK only" hides non-HSK words. Each card shows
 *            how well you know it (mastery, js/core/mastery.js). The detail pane: characters, related words, and the
 *            phrases that use the word.
 *   Phrases  the phrase book by chapter (data/phrases.js): the phrases you have met, with level and mastery; the detail
 *            pane lists the phrase's words.
 * 🎯 Practise (both tabs) opens a short session on your weakest items (js/ui/practice.js).
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, UI = MSC.ui, M = MSC.mastery, PH = MSC.phrases;
  const NB = (MSC.notebook = {});
  let query = '';
  const CAN_WRITE = 'Can write';
  const LEVELS = Object.keys((MSC.data.hsk && MSC.data.hsk.levels) || {}).map(Number);
  const levelCat = (l) => `HSK ${l}`;
  S.phraseLevel = S.phraseLevel || 'All';
  S.selectedPhrase = S.selectedPhrase || null;

  const bar = (key) => {
    const v = M.score(key);
    return `<div class="mbar" title="Mastery ${v}%${v >= M.LEARNED ? ' — learned' : ''}"><i class="${v >= M.LEARNED ? 'ok' : ''}" style="width:${v}%"></i></div>`;
  };
  const review = (key) => (M.needsReview(key) ? '<span class="tag review" title="You knew this, but mistakes pulled it back — use it again">review</span>' : '');
  const pct = (key) => { const v = M.score(key); return `<span class="mpct ${v >= M.LEARNED ? 'ok' : ''}">${v >= M.LEARNED ? '✓ ' : ''}${v}%</span>`; };
  const lvlTag = (l) => (l ? `<span class="tag hsk" title="HSK level ${l}">HSK${l}</span>` : '<span class="tag extra" title="Not an HSK word">extra</span>');

  const chip = (hanzi, extraClass) => {
    const e = D.get(hanzi);
    const known = MSC.vocab.has(hanzi);
    return `<button type="button" class="rel ${known ? '' : 'unseen'} ${extraClass || ''}" ${UI.interactAttrs(hanzi, `${hanzi} (${e.pinyin})`, e.english, 'open-word', hanzi).replace(/data-action[^ ]*/, 'data-action="open-word"')}>
      <span class="hz">${U.esc(hanzi)}</span><small>${U.esc(e.english)}</small></button>`;
  };
  const phraseChip = (p) => (PH.has(p.id)
    ? `<button type="button" class="rel phrase-chip" data-click="open-phrase" data-arg="${p.id}"><span class="hz">${U.esc(p.hanzi)}</span><small>${U.esc(p.english)}</small></button>`
    : '');

  // ───────────── detail pane ─────────────
  let paneKey = '';
  function wordPane(entry) {
    const chars = D.breakdown(entry);
    const charsHtml = entry.hanzi.length > 1
      ? `<div class="chars">${chars.map((c) => `<div class="char-row" ${UI.interactAttrs(c.hanzi, '', '', c.isWord ? 'open-word' : '', c.hanzi)}>
            <span class="c hz">${U.esc(c.hanzi)}</span>
            <span class="d"><b>${U.esc(c.pinyin)}</b> ${U.esc(c.meaning)}<small>${U.esc(c.parts)}</small></span></div>`).join('')}</div>`
      : (chars[0] && chars[0].parts ? `<div class="box-sm" style="color:#44403c">${U.esc(chars[0].parts)}</div>` : '');
    const groups = D.related(entry).map((g) =>
      `<div class="group-t">${g.title}</div><div class="chip-list">${g.items.map((i) => chip(i.hanzi)).join('')}</div>`).join('');
    const ph = PH.withWord(entry.hanzi), metPh = ph.filter((p) => PH.has(p.id));
    const phHtml = ph.length
      ? `<div class="wp-sec"><h4>Phrases with ${U.esc(entry.hanzi)}</h4>${metPh.length ? `<div class="chip-list">${metPh.map(phraseChip).join('')}</div>` : ''}
          ${ph.length > metPh.length ? `<div class="sub" style="margin-top:6px">${ph.length - metPh.length} more phrase${ph.length - metPh.length === 1 ? '' : 's'} to discover in the game.</div>` : ''}</div>` : '';
    const lvl = D.level(entry.hanzi);
    return `
      <div class="row" data-pane-drag style="align-items:flex-start;gap:12px">
        <div class="grow"><div class="wp-hz hz">${U.esc(entry.hanzi)}</div><div class="wp-py">${U.esc(entry.pinyin)}</div>
          <div style="font-weight:700;margin-top:2px">${U.esc(entry.english)}</div><div class="sub">${U.esc(entry.pos)} · ${U.esc(entry.category)} · ${lvl ? `HSK ${lvl}` : 'extra word'}</div></div>
        <button class="say-btn" style="margin-right:36px" data-say="${U.esc(entry.hanzi)}" aria-label="Play">🔊</button>
      </div>
      ${masteryBox(entry.hanzi)}
      ${entry.note ? `<div class="box amber box-sm" style="margin-top:12px">${UI.richText(entry.note)}</div>` : ''}
      ${MSC.howto.html(entry)}
      ${charsHtml ? `<div class="wp-sec"><h4>${entry.hanzi.length > 1 ? 'Characters' : 'Character'}</h4>${charsHtml}</div>` : ''}
      ${phHtml}
      ${groups ? `<div class="wp-sec"><h4>Related</h4>${groups}</div>` : ''}`;
  }
  function masteryBox(key) {
    const v = M.score(key), n = M.uses(key), pl = M.places(key).length;
    const msg = !n ? 'Not used yet — say it in a conversation, an order or Practice to start learning it.'
      : v >= M.LEARNED ? 'Learned.'
        : pl < 2 ? `Used ${n}× — use it somewhere else too (a different person or place) to learn it.`
          : `Used ${n}× in ${pl} places — keep using it without hints.`;
    const again = M.needsReview(key) ? 'You knew this, but recent mistakes pulled it back under 85% — a few clean uses and it is learned again.' : msg;
    return `<div class="mbox"><div class="row between"><b>Mastery</b>${pct(key)}</div>${bar(key)}<div class="sub" style="margin-top:4px">${again}</div></div>`;
  }
  function phrasePane(p) {
    const words = p.words.filter((w) => D.get(w));
    return `
      <div data-pane-drag><div class="kicker">${U.esc((PH.chapters().find((c) => c.id === p.chapter) || {}).title || '')}</div>
        <div style="margin-top:6px">${UI.sentence({ hanzi: p.hanzi, english: p.english }, { size: 'lg', plain: true, discover: false })}</div>
        <div class="sub" style="margin-top:4px">${p.level ? `HSK ${p.level}` : 'extra'} phrase</div></div>
      ${masteryBox(p.key)}
      ${p.note ? `<div class="box amber box-sm" style="margin-top:12px">${UI.richText(p.note)}</div>` : ''}
      <div class="wp-sec"><h4>Words in this phrase</h4><div class="chip-list">${words.map((w) => chip(w)).join('')}</div></div>`;
  }

  NB.renderPane = (force) => {
    const pane = document.getElementById('word-pane');
    const phrase = S.nbTab === 'phrases' && S.selectedPhrase && PH.get(S.selectedPhrase);
    const entry = !phrase && S.nbTab === 'words' && S.selectedWord && D.get(S.selectedWord);
    // Re-render only when the content would change, so typing in search never restarts the stroke animation or moves the pane.
    const key = `${S.nbTab}|${S.selectedWord}|${S.selectedPhrase}|${entry && MSC.howto.has(entry.hanzi) ? MSC.howto.signature() : ''}|${S.displayMode}|${M.score(phrase ? phrase.key : S.selectedWord || '')}`;
    if (!force && key === paneKey) return;
    paneKey = key;
    MSC.howto.unmount();
    if (!entry && !phrase) {
      pane.classList.remove('open');
      pane.innerHTML = `<div class="wp-empty">${S.nbTab === 'phrases' ? 'Select a phrase to see its words.' : 'Select a word to see its characters, phrases and related words.'}</div>`;
      return;
    }
    pane.innerHTML = `<div class="pane-handle" data-pane-drag><i></i></div><button class="pane-close" data-click="close-pane" aria-label="Close">✕</button>${phrase ? phrasePane(phrase) : wordPane(entry)}`;
    pane.classList.add('open');
    if (entry) MSC.howto.mount(pane);
  };

  // ───────────── header: tabs, HSK-only, progress ─────────────
  function header() {
    const tabs = ['words', 'phrases'].map((t) => `<button type="button" class="${S.nbTab === t ? 'on' : ''}" data-click="nb-tab" data-arg="${t}">${t === 'words' ? '🔤 Words' : '💬 Phrases'}</button>`).join('');
    const prog = LEVELS.map((l) => {
      const keys = S.nbTab === 'words' ? D.hskWords(l) : PH.all().filter((p) => p.level === l).map((p) => p.key);
      const met = keys.filter((k) => M.score(k) > 0).length, learned = keys.filter((k) => M.learned(k)).length;
      return `<div class="lvl-prog"><span class="lvl-name">HSK ${l}</span><div class="lvl-bar" title="${learned} learned · ${met} met · ${keys.length} in all"><i class="met" style="width:${(100 * met) / Math.max(1, keys.length)}%"></i><i class="learned" style="width:${(100 * learned) / Math.max(1, keys.length)}%"></i></div><span class="num sub">${learned} learned · ${met}/${keys.length} met</span></div>`;
    }).join('');
    document.getElementById('nb-head').innerHTML = `
      <div class="row between" style="flex-wrap:wrap;gap:8px">
        <div class="tabs3 nb-tabs" style="grid-template-columns:repeat(2,1fr)">${tabs}</div>
        <div class="row" style="gap:8px">
          <label class="toggle"><input type="checkbox" id="hsk-only" ${S.hskOnly ? 'checked' : ''}> HSK only</label>
          <button type="button" class="btn btn-primary btn-sm" data-click="practice" data-arg="${S.nbTab}">🎯 Practise</button>
        </div>
      </div>
      <div id="hsk-progress" class="lvl-progs">${prog}</div>`;
    document.getElementById('nb-title').textContent = S.nbTab === 'words' ? 'My Vocabulary' : 'My Phrases';
    document.getElementById('nb-total').textContent = S.nbTab === 'words' ? S.vocab.length : S.phraseSet.size;
    document.getElementById('nb-hint').textContent = S.nbTab === 'words'
      ? 'Words you meet are added automatically. Using them (in conversations, orders, Practice) raises their mastery; 85% = learned.'
      : 'Phrases you meet in the game are collected here, chapter by chapter. Use them to learn them.';
  }

  // ───────────── words ─────────────
  function renderWords() {
    const writable = S.vocab.filter((h) => MSC.howto.has(h)).length;
    if (S.category === CAN_WRITE && !writable) S.category = 'All';
    const known = S.vocab.map((h) => D.get(h)).filter((e) => e && (!S.hskOnly || D.level(e.hanzi)));
    const cats = ['All', ...LEVELS.filter((l) => known.some((e) => D.level(e.hanzi) === l)).map(levelCat), ...new Set(known.map((e) => e.category)), ...(writable ? [CAN_WRITE] : [])];
    if (!cats.includes(S.category)) S.category = 'All';
    document.getElementById('cats').innerHTML = cats.map((c) =>
      `<button class="cat ${S.category === c ? 'on' : ''}" data-click="cat" data-arg="${U.esc(c)}">${c === CAN_WRITE ? `✍ ${CAN_WRITE} <span class="num">${writable}</span>` : U.esc(c)}</button>`).join('');
    const q = query.trim().toLowerCase();
    const list = known.filter((e) =>
      (S.category === 'All' || (S.category === CAN_WRITE ? MSC.howto.has(e.hanzi) : S.category.startsWith('HSK ') ? D.level(e.hanzi) === Number(S.category.slice(4)) : e.category === S.category)) &&
      (!q || e.english.toLowerCase().includes(q) || e.pinyin.toLowerCase().includes(q) || e.pinyinNum.includes(q) || e.hanzi.includes(q)));
    document.getElementById('vgrid').innerHTML = list.map((e) => {
      const isNew = S.fresh.has(e.hanzi);
      return `<div class="vcard ${isNew ? 'new' : ''} ${S.selectedWord === e.hanzi ? 'sel' : ''}" ${UI.interactAttrs(e.hanzi, '', '', 'open-word', e.hanzi)}>
        <div class="row between" style="align-items:flex-start"><div>${UI.wordLabel(e.hanzi, false)}</div>
          <div class="vtags">${isNew ? '<span class="tag new">New</span>' : ''}${review(e.hanzi)}${lvlTag(D.level(e.hanzi))}${MSC.howto.has(e.hanzi) ? '<span class="tag write" title="You can write this">✍</span>' : ''}</div></div>
        <div style="font-weight:700;font-size:13px">${U.esc(e.english)}</div>
        <div class="row" style="gap:6px">${bar(e.hanzi)}${pct(e.hanzi)}</div></div>`;
    }).join('') || '<div class="wp-empty" style="grid-column:1/-1">No words match.</div>';
  }

  // ───────────── phrases ─────────────
  function renderPhrases() {
    const all = PH.all().filter((p) => !S.hskOnly || !p.extra);
    const lv = ['All', ...LEVELS.map(levelCat)];
    if (!lv.includes(S.phraseLevel)) S.phraseLevel = 'All';
    document.getElementById('cats').innerHTML = lv.map((c) => `<button class="cat ${S.phraseLevel === c ? 'on' : ''}" data-click="phrase-level" data-arg="${U.esc(c)}">${U.esc(c)}</button>`).join('');
    const q = query.trim().toLowerCase();
    const inLevel = all.filter((p) => S.phraseLevel === 'All' || p.level === Number(S.phraseLevel.slice(4)));
    const waiting = (S.phraseQueue || []).map((id) => PH.get(id)).filter(Boolean);
    const toLearn = waiting.length ? `<div class="chapter to-learn"><div class="row between"><h4>✨ To learn</h4><span class="sub num">${waiting.length} waiting</span></div>
        <div class="sub">Phrases you met but haven't practised yet.</div>
        <div class="pgrid">${waiting.map((p) => `<div class="pcard"><div>${UI.phraseLabel(p.hanzi)}</div><div style="font-weight:600;font-size:12.5px">${U.esc(p.english)}</div><button type="button" class="btn btn-primary btn-sm" data-click="teach-open" data-arg="${p.id}">Learn it</button></div>`).join('')}</div></div>` : '';
    const html = toLearn + PH.chapters().map((ch) => {
      const ps = inLevel.filter((p) => p.chapter === ch.id);
      if (!ps.length) return '';
      const met = ps.filter((p) => PH.has(p.id) && (!q || p.english.toLowerCase().includes(q) || p.hanzi.includes(q) || D.sentencePinyin(p.hanzi).toLowerCase().includes(q)));
      const cards = met.map((p) => `<div class="pcard ${S.selectedPhrase === p.id ? 'sel' : ''}" data-click="open-phrase" data-arg="${p.id}">
          <div class="row between" style="align-items:flex-start;gap:8px"><div class="grow">${UI.phraseLabel(p.hanzi)}</div><div class="vtags">${review(p.key)}${lvlTag(p.level)}</div></div>
          <div style="font-weight:600;font-size:12.5px">${U.esc(p.english)}</div>
          <div class="row" style="gap:6px">${bar(p.key)}${pct(p.key)}</div></div>`).join('');
      return `<div class="chapter"><div class="row between"><h4>${U.esc(ch.title)}</h4><span class="sub num">${ps.filter((p) => PH.has(p.id)).length} / ${ps.length} met</span></div>
        ${ch.blurb ? `<div class="sub">${U.esc(ch.blurb)}</div>` : ''}
        <div class="pgrid">${cards || '<div class="sub locked">🔒 Meet these phrases by talking to people around town.</div>'}</div></div>`;
    }).join('');
    document.getElementById('vgrid').innerHTML = html || '<div class="wp-empty" style="grid-column:1/-1">No phrases yet.</div>';
  }

  NB.render = (forcePane) => {
    document.getElementById('vgrid').classList.toggle('as-chapters', S.nbTab === 'phrases');
    header();
    if (S.nbTab === 'phrases') renderPhrases(); else renderWords();
    NB.renderPane(forcePane === true);
  };

  MSC.on('writing-changed', () => NB.render(true));
  const visible = () => !document.getElementById('view-notebook').classList.contains('hidden');
  MSC.on('mastery', () => { if (visible()) NB.render(); });
  // a learned word or phrase slipped back under 85%: say so, with a link to it
  MSC.on('unlearned', ({ key, score }) => {
    const isPhrase = String(key).startsWith('p:');
    const p = isPhrase ? PH.get(key) : null, e = isPhrase ? null : D.get(key);
    if (!p && !e) return;
    const link = isPhrase
      ? `<button type="button" class="log-zh hz" data-click="open-phrase" data-arg="${p.id}">${U.esc(p.hanzi)}</button>`
      : `<button type="button" class="log-zh hz" data-click="log-open" data-arg="${U.esc(key)}">${U.esc(key)}</button>`;
    MSC.log.html(`🔁 ${link} needs practice again <span class="log-en">(${score}%)</span> <button type="button" class="log-learn warn" data-click="practice" data-arg="${isPhrase ? 'phrases' : 'words'}">Practise</button>`, 'review');
  });
  MSC.on('phrase', () => { if (visible()) NB.render(); });

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
      if (e.type !== 'pointercancel' && dy > 90) { S.selectedWord = null; S.selectedPhrase = null; NB.render(true); }
    };
    pane.addEventListener('pointerup', end);
    pane.addEventListener('pointercancel', end);
  })();
  const A = MSC.actions;
  A['open-word'] = (hanzi) => { S.nbTab = 'words'; S.selectedWord = hanzi; NB.render(); };
  A['open-phrase'] = (id) => { if (A.tab) A.tab('notebook'); S.nbTab = 'phrases'; S.selectedPhrase = id; NB.render(); };
  A['close-pane'] = () => { S.selectedWord = null; S.selectedPhrase = null; NB.render(); };
  A['nb-tab'] = (t) => { S.nbTab = t; query = ''; const s = document.getElementById('vocab-search'); if (s) s.value = ''; NB.render(true); };
  A.cat = (c) => { S.category = c; NB.render(); };
  A['phrase-level'] = (c) => { S.phraseLevel = c; NB.render(); };
  A['clear-search'] = () => { document.getElementById('vocab-search').value = ''; query = ''; NB.render(); };
  document.addEventListener('input', (e) => { if (e.target.id === 'vocab-search') { query = e.target.value; NB.render(); } });
  document.addEventListener('change', (e) => { if (e.target.id === 'hsk-only') { S.hskOnly = e.target.checked; NB.render(true); } });
})(window.MSC = window.MSC || {});

/*
 * Text rendering: interactive word tokens, sentences with a 🔊 button + veiled translation,
 * and labels for tiles / options that follow the Pinyin · Hybrid · Hanzi display mode.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state;
  const UI = (MSC.ui = MSC.ui || {});

  function tokenHtml(tok) {
    const tier = S.displayMode;
    if (tok.kind === 'text') return U.esc(tok.text);
    if (tok.kind === 'unknown') return `<span class="zt">${U.esc(tok.hanzi)}</span>`;
    const hanzi = tok.hanzi;
    const py = D.tokenPinyin(tok);
    const parts = tok.kind === 'word' ? [hanzi] : tok.parts;
    let isNew = false;
    parts.forEach((p) => { MSC.vocab.discover(p); if (S.fresh.has(p)) isNew = true; });
    const tipZh = `${hanzi} (${py})${isNew ? '  ✨ new' : ''}`;
    return `<span class="zt ${isNew ? 'zt-new' : ''} ${tier === 1 ? 'py' : ''}" data-zh-interactive="1" data-speak="${U.esc(hanzi)}" data-tip-zh="${U.esc(tipZh)}" data-tip-en="${U.esc(D.tokenEnglish(tok))}">${U.esc(tier === 1 ? py : hanzi)}</span>`;
  }

  /** Chinese in a board sign: tap to hear it, hold for the meaning — without adding anything to the notebook (nothing is "learned" by a sign you haven't looked at). */
  UI.signHtml = (text) => D.segment(text).map((tok) => {
    if (tok.kind === 'text') return U.esc(tok.text);
    if (tok.kind === 'unknown') return U.esc(tok.hanzi);
    return `<span class="zt sign-zt" data-zh-interactive="1" data-speak="${U.esc(tok.hanzi)}" data-tip-zh="${U.esc(`${tok.hanzi} (${D.tokenPinyin(tok)})`)}" data-tip-en="${U.esc(D.tokenEnglish(tok))}">${U.esc(tok.hanzi)}</span>`;
  }).join('');

  /** Mixed English/Chinese text (hints). Chinese runs become tappable tokens. */
  UI.richText = (text) => D.segment(text).map(tokenHtml).join('');

  /**
   * A line of dialogue.
   * opts: size 'lg'|'md'|'sm' · translation (default true) · speaker (default true)
   * Translation is always present but blurred, so revealing it never changes the layout.
   */
  /** Word-by-word English for text we have no real translation of (e.g. what the speech recogniser heard). */
  UI.gloss = (hanzi) => D.segment(hanzi).filter((t) => t.kind !== 'text').map((t) => D.tokenEnglish(t)).filter(Boolean).join(' · ');

  UI.sentence = (line, opts = {}) => {
    const size = opts.size || 'md';
    const tier = S.displayMode;
    const main = D.segment(line.hanzi).map(tokenHtml).join('');
    const pyLine = tier === 2 ? `<div class="sentence-py">${U.esc(D.sentencePinyin(line.hanzi))}</div>` : '';
    const key = U.esc(line.english || '');
    const en = opts.translation === false || !line.english ? '' :
      `<div class="sentence-en ${opts.plain || S.revealed.has(line.english) ? '' : 'veiled'}" data-reveal="${key}" title="Tap to show the translation">${U.esc(line.english)}</div>`;
    const spk = opts.speaker === false ? '' :
      `<button type="button" class="say-btn" data-say="${U.esc(line.hanzi)}" aria-label="Play the whole sentence" title="Play the whole sentence">🔊</button>`;
    return `<div class="sentence ${size}"><div class="sentence-body"><div class="sentence-main hz">${main}</div>${pyLine}${en}</div>${spk}</div>`;
  };

  /** What the speech recogniser heard, shown like an NPC line: tappable words, pinyin under it (per the display mode), plain English. */
  UI.heardBox = (heard) => !heard
    ? '<div id="live" class="mic-box">Say your answer in Mandarin.</div>'
    : `<div id="live" class="box heard"><span class="kicker">You said</span>${UI.sentence({ hanzi: heard, english: UI.gloss(heard) }, { size: 'lg', plain: true })}</div>`;

  /** Single-word label (tiles) following the display mode. */
  UI.wordLabel = (hanzi, compact) => {
    const e = D.get(hanzi);
    const py = e ? e.pinyin : D.segment(hanzi).map(D.tokenPinyin).join('');       // numbers like 二十 are not dictionary words
    const tier = S.displayMode;
    if (tier === 1) return `<span class="wl wl-only-py">${U.esc(py)}</span>`;
    if (tier === 3) return `<span class="wl ${compact ? 'compact' : ''}"><span class="wl-hz hz">${U.esc(hanzi)}</span></span>`;
    return `<span class="wl ${compact ? 'compact' : ''}"><span class="wl-hz hz">${U.esc(hanzi)}</span><span class="wl-py">${U.esc(py)}</span></span>`;
  };

  /** Multi-word label (answer options, menu lines). */
  UI.phraseLabel = (hanzi) => {
    const py = D.sentencePinyin(hanzi);
    const tier = S.displayMode;
    if (tier === 1) return `<span class="wl wl-only-py" style="align-items:flex-start">${U.esc(py)}</span>`;
    if (tier === 3) return `<span class="wl" style="align-items:flex-start"><span class="wl-hz hz">${U.esc(hanzi)}</span></span>`;
    return `<span class="wl" style="align-items:flex-start"><span class="wl-hz hz">${U.esc(hanzi)}</span><span class="wl-py">${U.esc(py)}</span></span>`;
  };

  /** Attributes that make an element tappable (speak) and holdable (tooltip). */
  UI.interactAttrs = (hanzi, tipZh, tipEn, action, arg) => {
    const words = D.wordsIn(hanzi);
    words.forEach((w) => MSC.vocab.discover(w));
    return `data-zh-interactive="1" data-speak="${U.esc(hanzi)}" data-tip-zh="${U.esc(tipZh || '')}" data-tip-en="${U.esc(tipEn || '')}"${action ? ` data-action="${action}" data-arg="${U.esc(arg)}"` : ''}`;
  };
})(window.MSC = window.MSC || {});

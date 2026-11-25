/*
 * THE PHRASE SCREEN — a new phrase is practised a little before it goes into the phrase book.
 * When someone says a phrase you haven't learned, it is highlighted under their line ("✨ New phrase — learn it") and
 * queued; the screen opens by itself when the conversation (or order, or encounter) is over, or whenever you tap it.
 *   1 Listen & see   characters, pinyin, meaning, its words
 *   2 Build it       from shuffled word tiles
 *   3 Say or type it from memory (pinyin, hanzi, or the microphone)
 * Passing adds it to the phrase book with a first mastery score (how it went: hints, mistakes). "Practise later" keeps it
 * waiting in the Phrases tab ("To learn").
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, UI = MSC.ui, PH = MSC.phrases, M = MSC.mastery, P = MSC.pinyin;
  const T = (MSC.teach = {});
  S.phraseQueue = S.phraseQueue || [];
  let cur = null;                         // { p, step, tiles, tray, built: {hint, mistakes}, recall: {hint, mistakes}, typed, msg, from }
  const $ = (id) => document.getElementById(id);
  const wordsOf = (t) => D.segment(t).flatMap((x) => (x.kind === 'word' ? [x.hanzi] : x.kind === 'number' ? x.parts : []));
  const busy = () => (MSC.writer && MSC.writer.isOpen()) || (MSC.practice && MSC.practice.isOpen());

  T.offer = (id) => {
    if (PH.has(id) || S.phraseQueue.includes(id)) return;
    const p = PH.get(id);
    if (!p) return;
    S.phraseQueue.push(id);
    if (MSC.progress) MSC.progress.save();
    MSC.log.html(`✨ New phrase: <button type="button" class="log-zh hz" data-click="teach-open" data-arg="${p.id}">${U.esc(p.hanzi)}</button> <span class="log-en">${U.esc(p.english)}</span> <button type="button" class="log-learn" data-click="teach-open" data-arg="${p.id}">Learn it</button>`, 'vocab');
    MSC.emit('phrase', id);
  };
  T.pending = () => S.phraseQueue.slice();
  T.isOpen = () => !!cur;
  T.current = () => (cur ? { id: cur.p.id, step: cur.step, tiles: cur.tiles, target: wordsOf(cur.p.hanzi) } : null);

  /** after a conversation / order / encounter: offer the first waiting phrase */
  T.prompt = () => { setTimeout(() => { if (!cur && !busy() && S.phraseQueue.length) T.open(S.phraseQueue[0]); }, 900); };

  T.open = (id) => {
    const p = PH.get(id);
    if (!p || PH.has(p.id) || busy()) return;
    const ws = wordsOf(p.hanzi);
    const pool = S.vocab.filter((h) => D.get(h) && !ws.includes(h) && h.length <= 2);
    cur = { p, step: 0, tiles: U.shuffle([...ws, ...U.shuffle(pool).slice(0, 2)]), tray: [], built: { hint: 0, mistakes: 0 }, recall: { hint: 0, mistakes: 0 }, typed: '', msg: '', from: S.active };
    $('teach').classList.add('open'); $('teach-backdrop').classList.add('show');
    document.body.classList.add('practice-open');
    render();
    MSC.speech.say(p.hanzi);
  };
  T.close = () => {
    if (!cur) return;
    cur = null;
    $('teach').classList.remove('open'); $('teach-backdrop').classList.remove('show');
    document.body.classList.remove('practice-open');
    if (MSC.notebook && !$('view-notebook').classList.contains('hidden')) MSC.notebook.render(true);
  };

  const dots = () => [0, 1, 2].map((i) => `<span class="w-slot ${i < cur.step ? 'done' : i === cur.step ? 'cur' : ''}"></span>`).join('');
  const label = (h) => UI.wordLabel(h, true);

  function body() {
    const p = cur.p;
    if (cur.step === 0) {
      const ws = p.words.filter((w) => D.get(w));
      return `<div class="pq">Listen and look</div>
        <div class="box">${UI.sentence({ hanzi: p.hanzi, english: p.english }, { size: 'lg', plain: true, discover: false })}</div>
        <div class="group-t">Its words — tap to hear, hold for the meaning</div>
        <div class="chip-list">${ws.map((w) => { const e = D.get(w); return `<span class="rel" ${UI.interactAttrs(w, `${w} (${e.pinyin})`, e.english, '', '')}><span class="hz">${U.esc(w)}</span><small>${U.esc(e.english)}</small></span>`; }).join('')}</div>
        ${p.note ? `<div class="box amber box-sm">${UI.richText(p.note)}</div>` : ''}`;
    }
    if (cur.step === 1) {
      const used = new Set(cur.tray);
      const tray = cur.tray.length ? cur.tray.map((i, k) => `<button type="button" class="tile-btn picked" data-click="tc-untile" data-arg="${k}">${label(cur.tiles[i])}</button>`).join('') : '<span class="tray-empty">Tap the words in order…</span>';
      const bank = cur.tiles.map((t, i) => `<button type="button" class="tile-btn ${used.has(i) ? 'used' : ''}" data-click="tc-tile" data-arg="${i}">${label(t)}</button>`).join('');
      return `<div class="pq">Build it: <b>“${U.esc(p.english)}”</b></div><div class="tray">${cur.tray.length ? tray : tray}</div><div class="bank">${bank}</div>
        ${cur.built.hint ? `<div class="box sky box-sm">💡 ${cur.built.hint >= 2 ? UI.sentence({ hanzi: p.hanzi }, { size: 'sm', translation: false, discover: false }) : `It starts with <b class="hz">${U.esc(wordsOf(p.hanzi)[0])}</b>`}</div>` : ''}`;
    }
    if (cur.step === 2) {
      const mic = MSC.recognizer && MSC.recognizer.supported();
      return `<div class="pq">Now from memory: <b>“${U.esc(p.english)}”</b></div>
        <input type="text" id="tc-input" class="field" autocomplete="off" autocapitalize="off" spellcheck="false" value="${U.esc(cur.typed)}" placeholder="Type pinyin (nǐ hǎo / ni3 hao3) or hanzi…" />
        ${mic ? `<button type="button" class="btn btn-dark ${S.mic.recording ? 'rec' : ''}" data-click="tc-mic">${S.mic.recording ? '⏹ Stop' : '🎙️ Say it'}</button>` : ''}
        ${cur.recall.hint ? `<div class="box sky box-sm">💡 ${cur.recall.hint >= 2 ? UI.sentence({ hanzi: p.hanzi }, { size: 'sm', translation: false, discover: false }) : `Pinyin: <b>${U.esc(D.sentencePinyin(p.hanzi))}</b>`}</div>` : ''}`;
    }
    return `<div class="box green"><div class="box-title">✨ Added to your phrase book</div>${UI.sentence({ hanzi: p.hanzi, english: p.english }, { size: 'md', plain: true, discover: false })}
      <div class="sub" style="margin-top:6px">Use it in conversations to learn it fully.</div></div>`;
  }

  function render() {
    if (!cur) return;
    const left = S.phraseQueue.filter((x) => x !== cur.p.id).length;
    const btns = cur.step === 0 ? '<button type="button" class="btn btn-ghost" data-click="tc-later">Practise later</button><button type="button" class="btn btn-primary grow" data-click="tc-next">Next →</button>'
      : cur.step === 1 ? `<button type="button" class="btn btn-hint ${cur.built.hint >= 2 ? 'invisible' : ''}" data-click="tc-hint">💡 Hint</button><button type="button" class="btn btn-primary grow" data-click="tc-check">Check</button>`
        : cur.step === 2 ? `<button type="button" class="btn btn-hint ${cur.recall.hint >= 2 ? 'invisible' : ''}" data-click="tc-hint">💡 Hint</button><button type="button" class="btn btn-primary grow" data-click="tc-check">Check</button>`
          : `<button type="button" class="btn btn-ghost grow" data-click="tc-close">Close</button>${left ? `<button type="button" class="btn btn-primary grow" data-click="tc-another">Next phrase (${left}) →</button>` : ''}`;
    $('teach').innerHTML = `<div class="pr-head"><b>✨ New phrase</b><div class="w-slots">${dots()}</div><button class="w-x" data-click="tc-later" aria-label="Practise later">✕</button></div>
      <div class="pr-body">${body()}</div><div class="pr-msg">${U.esc(cur.msg)}</div><div class="actions">${btns}</div>`;
    const inp = $('tc-input'); if (inp) setTimeout(() => inp.focus(), 0);
  }

  function pass() {
    const p = cur.p;
    const q = (M.quality({ ...cur.built, tiles: true }) + M.quality(cur.recall)) / 2;
    PH.add(p.id);
    M.record([p.key, ...wordsOf(p.hanzi)], q, 'phrase-screen');
    cur.step = 3; cur.msg = '';
    render();
    MSC.speech.say(p.hanzi);
  }

  const A = MSC.actions;
  A['teach-open'] = (id) => { if (PH.has(id)) { A['open-phrase'](id); return; } if (cur) T.close(); T.open(id); };
  A['tc-later'] = () => { if (cur && cur.step < 3) MSC.log.say('Saved for later — find it under "To learn" in your phrases.'); T.close(); };
  A['tc-close'] = () => T.close();
  A['tc-another'] = () => { const next = S.phraseQueue.find((x) => x !== (cur && cur.p.id)); T.close(); if (next) T.open(next); };
  A['tc-next'] = () => { if (!cur) return; cur.step = 1; cur.msg = ''; render(); };
  A['tc-tile'] = (i) => { if (!cur) return; i = Number(i); if (!cur.tray.includes(i)) cur.tray.push(i); render(); };
  A['tc-untile'] = (k) => { if (!cur) return; cur.tray.splice(Number(k), 1); render(); };
  A['tc-hint'] = () => { if (!cur) return; const h = cur.step === 1 ? cur.built : cur.recall; h.hint = Math.min(2, h.hint + 1); render(); };
  A['tc-check'] = () => {
    if (!cur) return;
    const want = D.syllables(cur.p.hanzi).map(P.fromNum);
    if (cur.step === 1) {
      const built = cur.tray.map((i) => cur.tiles[i]).join('');
      if (!built) { cur.msg = 'Tap the words first.'; return render(); }
      if (P.sameSentence(want, P.parse(built))) { cur.step = 2; cur.msg = '✓ Right! Now without the tiles.'; return render(); }
      cur.built.mistakes++; cur.tray = []; cur.msg = 'Not quite — try again.';
      if (cur.built.mistakes >= 2) cur.built.hint = Math.max(cur.built.hint, 1);
      return render();
    }
    if (cur.step === 2) {
      const inp = $('tc-input'); cur.typed = inp ? inp.value : cur.typed;
      const user = P.parse(cur.typed);
      if (!user.length) { cur.msg = 'Type it (or say it) first.'; return render(); }
      if (P.sameSentence(want, user)) return pass();
      cur.recall.mistakes++;
      cur.msg = P.sameBases(want, user) ? 'Right words — check the tones.' : 'Not quite — try again.';
      if (cur.recall.mistakes >= 2) cur.recall.hint = Math.max(cur.recall.hint, 1);
      return render();
    }
  };
  A['tc-mic'] = () => {
    if (!cur) return;
    if (S.mic.recording && MSC.recognizer.active()) { MSC.recognizer.stop(); return; }
    S.mic.recording = true; render();
    MSC.recognizer.start({
      onFinal: (fin) => {
        S.mic.recording = false;
        if (!cur || cur.step !== 2) return;
        cur.typed = fin;
        const want = D.syllables(cur.p.hanzi).map(P.fromNum);
        if (P.sameBases(want, P.parse(fin))) return pass();               // speech: right words in any tones
        cur.recall.mistakes++; cur.msg = `Heard “${fin}” — try again.`; render();
      },
      onError: () => { S.mic.recording = false; if (cur) { cur.msg = 'The microphone isn’t available — type it instead.'; render(); } },
      onEnd: () => { S.mic.recording = false; if (cur) render(); },
    });
  };
  document.addEventListener('keydown', (e) => {
    if (!cur) return;
    if (e.key === 'Escape') A['tc-later']();
    else if (e.key === 'Enter' && e.target && e.target.id === 'tc-input') A['tc-check']();
  });
  document.addEventListener('input', (e) => { if (cur && e.target && e.target.id === 'tc-input') cur.typed = e.target.value; });
})(window.MSC = window.MSC || {});

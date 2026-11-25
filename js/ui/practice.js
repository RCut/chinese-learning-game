/*
 * PRACTICE — a short session (up to 8 exercises) on your weakest words or phrases, from the notebook (🎯 Practise).
 *
 * Words:   meaning  "which word means …?" (pick one of 4 — recognition)
 *          build    build the word from character tiles (production)
 *          gap      fill the gap in a phrase that uses the word (pick one of 4 — recognition)
 * Phrases: build    build the phrase from word tiles (production)
 *          type     type it in pinyin (or hanzi) from its English (production)
 *          gap      fill the gap (pick one of 4 — recognition)
 * Both:    listen   "what did you hear?" — the word/phrase is spoken, you pick its pinyin among similar-sounding options
 *                   (other tones, or real words that sound alike). For learning only: it NEVER changes mastery.
 * Uses are scored by js/core/mastery.js (place = 'practice'): hints and mistakes lower the score.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, M = MSC.mastery, PH = MSC.phrases, P = MSC.pinyin, UI = MSC.ui;
  const PR = (MSC.practice = {});
  const SIZE = 8, PLACE = 'practice';
  let sess = null;
  const $ = (id) => document.getElementById(id);
  const canSpeak = () => typeof window.speechSynthesis !== 'undefined';
  const wordsOf = (t) => D.segment(t).flatMap((x) => (x.kind === 'word' ? [x.hanzi] : x.kind === 'number' ? x.parts : []));

  // ───────────── listening options: other tones / similar-sounding real words ─────────────
  const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
  const GROUPS = [['zh', 'z', 'j'], ['ch', 'c', 'q'], ['sh', 's', 'x'], ['n', 'l'], ['r', 'l'], ['b', 'p'], ['d', 't'], ['g', 'k']];
  const FINALS = [['an', 'ang'], ['en', 'eng'], ['in', 'ing'], ['ian', 'iang'], ['u', 'v'], ['ou', 'uo']];
  const split = (s) => { const base = s.replace(/[0-5]$/, ''), tone = Number((s.match(/[0-5]$/) || ['5'])[0]); const ini = INITIALS.find((i) => base.startsWith(i)) || ''; return { base, ini, fin: base.slice(ini.length), tone }; };
  const near = (a, b) => {                         // two syllables that a learner can mix up (tone may differ)
    if (a.base === b.base) return true;
    const sameFin = a.fin === b.fin, sameIni = a.ini === b.ini;
    if (sameFin && GROUPS.some((g) => g.includes(a.ini) && g.includes(b.ini))) return true;
    if (sameIni && FINALS.some((g) => g.includes(a.fin) && g.includes(b.fin))) return true;
    return false;
  };
  const show = (syls) => syls.map((s) => U.numToTone(s)).join(' ');
  function listenOptions(hanzi) {
    const syls = D.syllables(hanzi);
    if (!syls || !syls.length) return null;
    const target = show(syls), out = new Map([[target, { py: target, hanzi, ok: true }]]);
    // similar real words (same length, every syllable confusable, not identical)
    if (syls.length <= 3) {
      const tp = syls.map(split);
      U.shuffle(D.all().filter((e) => e.hanzi !== hanzi && e.hanzi.length === syls.length)).some((e) => {
        const es = (e.pinyinNum || '').split(' ').map(split);
        if (es.length !== tp.length || !es.every((s, i) => near(s, tp[i]))) return false;
        const py = show(e.pinyinNum.split(' '));
        if (!out.has(py)) out.set(py, { py, hanzi: e.hanzi, english: e.english });
        return out.size >= 3;
      });
    }
    // other tones on one syllable
    for (let guard = 0; out.size < 4 && guard < 40; guard++) {
      const i = Math.floor(Math.random() * syls.length), s = split(syls[i]);
      const tone = U.pick([1, 2, 3, 4].filter((t) => t !== s.tone));
      const alt = syls.slice(); alt[i] = `${s.base}${tone}`;
      const py = show(alt);
      if (!out.has(py)) out.set(py, { py });
    }
    return U.shuffle([...out.values()]);
  }

  // ───────────── building a session ─────────────
  function distractors(hanzi, n, pool) {
    const e = D.get(hanzi);
    const same = pool.filter((h) => h !== hanzi && D.get(h) && (!e || D.get(h).pos === e.pos));
    const rest = pool.filter((h) => h !== hanzi && D.get(h) && !same.includes(h));
    return U.shuffle(same).concat(U.shuffle(rest)).slice(0, n);
  }
  const knownWords = () => S.vocab.filter((h) => D.get(h) && (!S.hskOnly || D.level(h)));

  function exercise(kind, item, i) {
    if (kind === 'words') {
      const phr = PH.withWord(item).filter((p) => p.words.length > 1);
      const types = ['meaning', 'build', ...(phr.length ? ['gap'] : []), ...(canSpeak() && D.syllables(item) ? ['listen'] : [])];
      const type = types[i % types.length];
      if (type === 'gap') { const p = U.pick(phr.filter((x) => PH.has(x.id)).concat(phr)); return { type, key: item, word: item, phrase: p }; }
      return { type, key: item, word: item };
    }
    const p = PH.get(item.replace(/^p:/, ''));
    const types = ['build', 'type', 'gap', ...(canSpeak() ? ['listen'] : [])];
    const type = types[i % types.length];
    if (type === 'gap') { const w = M.weakest(p.words.filter((x) => D.get(x)), 1)[0] || U.pick(p.words); return { type, key: p.key, phrase: p, word: w }; }
    return { type, key: p.key, phrase: p };
  }

  function prepare(ex) {
    const st = { hint: 0, mistakes: 0, done: false, picked: null, tray: [], typed: '', result: '' };
    const pool = knownWords().concat(D.hskWords(1));
    if (ex.type === 'meaning' || ex.type === 'gap') ex.options = U.shuffle([ex.word, ...distractors(ex.word, 3, pool)]);
    if (ex.type === 'build' && ex.word) {
      const chars = [...ex.word], others = U.shuffle([...new Set(pool.join('').split(''))].filter((c) => !chars.includes(c))).slice(0, Math.max(2, 5 - chars.length));
      ex.tiles = U.shuffle([...chars, ...others]);
    }
    if (ex.type === 'build' && ex.phrase) {
      const ws = wordsOf(ex.phrase.hanzi);
      ex.target = ws; ex.tiles = U.shuffle([...ws, ...distractors(U.pick(ws), 2, pool)]);
    }
    if (ex.type === 'listen') ex.options = listenOptions(ex.phrase ? ex.phrase.hanzi : ex.word);
    ex.st = st;
    return ex;
  }

  PR.open = (kind) => {
    const keys = kind === 'phrases' ? [...S.phraseSet].filter((id) => PH.get(id) && (!S.hskOnly || !PH.get(id).extra)).map((id) => `p:${id}`) : knownWords();
    if (keys.length < 3) { MSC.log.say(kind === 'phrases' ? 'Meet a few phrases first — talk to people around town.' : 'Meet a few more words first.'); return; }
    const weak = M.weakest(keys.filter((k) => !M.learned(k)), SIZE);
    const pick = weak.length >= 3 ? weak : M.weakest(keys, SIZE);
    sess = { kind, list: U.shuffle(pick).map((k, i) => prepare(exercise(kind, k, i))), i: 0, right: 0 };
    sess.list = sess.list.filter((ex) => ex.type !== 'listen' || ex.options);
    $('practice').classList.add('open'); $('practice-backdrop').classList.add('show');
    document.body.classList.add('practice-open');
    render();
    autoplay();
  };
  /** A listening moment in the world (the TV, an announcement, someone calling out): "what did you hear?" on these texts. Never scores. */
  PR.listen = (texts, title) => {
    const list = U.shuffle(texts.slice()).map((t) => prepare({ type: 'listen', key: t, word: t })).filter((ex) => ex.options);
    if (!list.length) return;
    sess = { kind: 'listen', title: title || 'Listen', list, i: 0, right: 0 };
    $('practice').classList.add('open'); $('practice-backdrop').classList.add('show');
    document.body.classList.add('practice-open');
    render(); autoplay();
  };
  PR.close = () => {
    if (!sess) return;
    const s = sess; sess = null;
    $('practice').classList.remove('open'); $('practice-backdrop').classList.remove('show');
    document.body.classList.remove('practice-open');
    if (s.i > 0 && s.kind !== 'listen') MSC.log.say(`Practice: ${s.right} of ${s.list.length} right.`);
    if (MSC.notebook) MSC.notebook.render(true);
  };
  PR.isOpen = () => !!sess;
  PR.current = () => (sess ? sess.list[sess.i] : null);

  const cur = () => sess && sess.list[sess.i];
  const label = (h) => UI.wordLabel(h, true);
  const say = (t, slow) => { const r = S.rate; if (slow) S.rate = 0.55; MSC.speech.say(t); S.rate = r; };
  function autoplay() { const ex = cur(); if (ex && ex.type === 'listen') setTimeout(() => { if (cur() === ex) say(ex.phrase ? ex.phrase.hanzi : ex.word); }, 250); }

  function prompt(ex) {
    const e = ex.word && D.get(ex.word);
    if (ex.type === 'listen') return `<div class="pq">🎧 What did you hear?</div><div class="row" style="gap:8px;justify-content:center"><button type="button" class="btn btn-ghost" data-click="pr-play">🔁 Again</button><button type="button" class="btn btn-ghost" data-click="pr-play" data-arg="slow">🐢 Slowly</button></div><div class="sub" style="text-align:center">Listening practice — it doesn't change your scores.</div>`;
    if (ex.type === 'meaning') return `<div class="pq">Which word means <b>“${U.esc(e.english)}”</b>?</div>`;
    if (ex.type === 'gap') {
      const p = ex.phrase, blank = p.hanzi.replace(ex.word, '＿＿');
      return `<div class="pq">Fill the gap</div><div class="pgap hz">${U.esc(blank)}</div><div class="sub" style="text-align:center">${U.esc(p.english)}</div>`;
    }
    if (ex.type === 'build' && ex.word) return `<div class="pq">Build the word for <b>“${U.esc(e.english)}”</b></div>`;
    if (ex.type === 'build') return `<div class="pq">Build: <b>“${U.esc(ex.phrase.english)}”</b></div>`;
    if (ex.type === 'type') return `<div class="pq">Say it in Chinese: <b>“${U.esc(ex.phrase.english)}”</b></div><div class="sub" style="text-align:center">Type pinyin (nǐ hǎo / ni3 hao3) or hanzi.</div>`;
    return '';
  }

  function answerArea(ex) {
    const st = ex.st;
    if (ex.type === 'listen') return `<div class="popts">${ex.options.map((o, i) => `<button type="button" class="popt py-opt ${st.done && o.ok ? 'ok' : ''} ${st.done && st.picked === i && !o.ok ? 'bad' : ''}" data-click="pr-pick" data-arg="${i}" ${st.done ? 'disabled' : ''}>${U.esc(o.py)}${st.done && o.hanzi ? `<small class="hz">${U.esc(o.hanzi)}${o.ok ? ` — ${U.esc((D.get(o.hanzi) || {}).english || (ex.phrase ? ex.phrase.english : ''))}` : o.english ? ` — ${U.esc(o.english)}` : ''}</small>` : ''}</button>`).join('')}</div>`;
    if (ex.type === 'meaning' || ex.type === 'gap') return `<div class="popts">${ex.options.map((h, i) => `<button type="button" class="popt ${st.done && h === ex.word ? 'ok' : ''} ${st.wrong && st.wrong.includes(i) ? 'bad' : ''}" data-click="pr-pick" data-arg="${i}" ${st.done ? 'disabled' : ''}>${label(h)}</button>`).join('')}</div>`;
    if (ex.type === 'build') {
      const used = new Set(st.tray);
      const tray = st.tray.length ? st.tray.map((ti, k) => `<button type="button" class="tile-btn picked" data-click="pr-untile" data-arg="${k}">${ex.word ? `<span class="hz" style="font-size:18px">${U.esc(ex.tiles[ti])}</span>` : label(ex.tiles[ti])}</button>`).join('') : '<span class="tray-empty">Tap the tiles in order…</span>';
      const bank = ex.tiles.map((t, i) => `<button type="button" class="tile-btn ${used.has(i) ? 'used' : ''}" data-click="pr-tile" data-arg="${i}" ${st.done ? 'disabled' : ''}>${ex.word ? `<span class="hz" style="font-size:18px">${U.esc(t)}</span>` : label(t)}</button>`).join('');
      return `<div class="tray">${tray}</div><div class="bank">${bank}</div>`;
    }
    if (ex.type === 'type') return `<input type="text" id="pr-input" class="field" autocomplete="off" autocapitalize="off" spellcheck="false" value="${U.esc(st.typed)}" placeholder="Type it…" ${st.done ? 'disabled' : ''}/>`;
    return '';
  }

  function hintBox(ex) {
    const st = ex.st, target = ex.phrase && !ex.word ? ex.phrase.hanzi : ex.word;
    if (!st.hint || ex.type === 'listen') return '';
    if (st.hint === 1) return `<div class="box sky box-sm">💡 Starts with <b class="hz">${U.esc([...(ex.type === 'build' && ex.phrase ? wordsOf(ex.phrase.hanzi)[0] : target)][0])}</b></div>`;
    if (st.hint === 2) return `<div class="box violet box-sm">💡 Pinyin: <b>${U.esc(D.sentencePinyin(target))}</b></div>`;
    return `<div class="box green box-sm">✅ ${UI.sentence({ hanzi: ex.phrase && !ex.word ? ex.phrase.hanzi : (ex.type === 'gap' ? ex.phrase.hanzi : target), english: ex.phrase && !ex.word ? ex.phrase.english : (D.get(target) || {}).english }, { size: 'md', plain: true, discover: false })}</div>`;
  }

  function render() {
    const ex = cur();
    const el = $('practice');
    if (!ex) {
      el.innerHTML = `<div class="pr-head"><b>🎯 Practice</b><button class="w-x" data-click="pr-close" aria-label="Close">✕</button></div>
        <div class="box green"><div class="box-title">Done!</div><div class="box-sm">${sess.right} of ${sess.list.length} right. Your scores are updated in the notebook.</div></div>
        <div class="actions"><button class="btn btn-ghost grow" data-click="pr-close">Close</button>${sess.kind === 'listen' ? '' : `<button class="btn btn-primary grow" data-click="practice" data-arg="${sess.kind}">Again ↺</button>`}</div>`;
      return;
    }
    const st = ex.st;
    const dots = sess.list.map((x, i) => `<span class="w-slot ${i < sess.i ? 'done' : i === sess.i ? 'cur' : ''}"></span>`).join('');
    const canCheck = ex.type === 'build' || ex.type === 'type';
    el.innerHTML = `<div class="pr-head"><b>${sess.kind === 'listen' ? `🎧 ${U.esc(sess.title)}` : `🎯 Practice · ${sess.kind === 'phrases' ? 'Phrases' : 'Words'}`}</b><div class="w-slots">${dots}</div><button class="w-x" data-click="pr-close" aria-label="Close">✕</button></div>
      <div class="pr-body">${prompt(ex)}${answerArea(ex)}</div>
      <div class="pr-msg" id="pr-msg">${st.result}</div>${hintBox(ex)}
      <div class="actions">
        <button type="button" class="btn btn-hint ${st.done || ex.type === 'listen' || st.hint >= 3 ? 'invisible' : ''}" data-click="pr-hint">${['💡 Hint', '💡 More', '👁 Answer'][Math.min(st.hint, 2)]}</button>
        ${st.done ? '<button type="button" class="btn btn-primary grow" data-click="pr-next">Next →</button>'
          : canCheck ? '<button type="button" class="btn btn-primary grow" data-click="pr-check">Check</button>' : '<span class="grow"></span>'}
      </div>`;
    const inp = $('pr-input'); if (inp && !st.done) setTimeout(() => inp.focus(), 0);
  }

  // ───────────── answering ─────────────
  function finish(ex, ok, msg) {
    const st = ex.st;
    st.done = true;
    if (ok) sess.right++;
    st.result = msg;
    if (ex.type !== 'listen') {                                   // listening never scores
      const how = { hint: ok ? st.hint : 3, mistakes: st.mistakes, tiles: ex.type === 'build', recognition: ex.type === 'meaning' || ex.type === 'gap' };
      const q = M.quality(how);
      const keys = ex.type === 'gap' ? [ex.word, ...(ex.phrase && !ex.key.startsWith('p:') ? [] : [ex.key])] : [ex.key];
      M.record(keys, q, PLACE);
    }
    const t = ex.phrase && !ex.word ? ex.phrase.hanzi : ex.type === 'gap' ? ex.phrase.hanzi : ex.word;
    say(t);
    render();
  }
  function miss(ex, msg) { ex.st.mistakes++; ex.st.result = msg; if (ex.st.mistakes >= 2) ex.st.hint = Math.max(ex.st.hint, Math.min(ex.st.mistakes - 1, 2)); render(); }

  const A = MSC.actions;
  A.practice = (kind) => { PR.close(); PR.open(kind === 'phrases' ? 'phrases' : 'words'); };
  A['pr-close'] = () => PR.close();
  A['pr-play'] = (slow) => { const ex = cur(); if (ex) say(ex.phrase ? ex.phrase.hanzi : ex.word, slow === 'slow'); };
  A['pr-next'] = () => { if (!sess) return; sess.i++; render(); autoplay(); };
  A['pr-hint'] = () => { const ex = cur(); if (!ex || ex.st.done) return; ex.st.hint = Math.min(3, ex.st.hint + 1); if (ex.st.hint === 3) finish(ex, false, 'Here is the answer — it will come up again.'); else render(); };
  A['pr-pick'] = (i) => {
    const ex = cur(); if (!ex || ex.st.done) return;
    i = Number(i);
    if (ex.type === 'listen') { ex.st.picked = i; const o = ex.options[i]; return finish(ex, o.ok, o.ok ? '✓ Right!' : 'Not quite — listen to the difference.'); }
    if (ex.options[i] === ex.word) return finish(ex, true, ex.st.mistakes ? '✓ Got it.' : '✓ Right!');
    ex.st.wrong = (ex.st.wrong || []).concat(i);
    miss(ex, 'Not that one — try again.');
  };
  A['pr-tile'] = (i) => { const ex = cur(); if (!ex || ex.st.done) return; i = Number(i); if (!ex.st.tray.includes(i)) ex.st.tray.push(i); render(); };
  A['pr-untile'] = (k) => { const ex = cur(); if (!ex || ex.st.done) return; ex.st.tray.splice(Number(k), 1); render(); };
  A['pr-check'] = () => {
    const ex = cur(); if (!ex || ex.st.done) return;
    if (ex.type === 'build') {
      const built = ex.st.tray.map((i) => ex.tiles[i]).join('');
      const want = ex.word || ex.target.join('');
      if (!built) return miss(ex, 'Tap some tiles first.');
      if (built === want || (ex.phrase && P.sameSentence(D.syllables(want).map(P.fromNum), P.parse(built)))) return finish(ex, true, '✓ Right!');
      ex.st.tray = [];
      return miss(ex, 'Not quite — try again.');
    }
    if (ex.type === 'type') {
      const inp = $('pr-input'); ex.st.typed = inp ? inp.value : ex.st.typed;
      const user = P.parse(ex.st.typed);
      if (!user.length) return miss(ex, 'Type your answer first.');
      const want = D.syllables(ex.phrase.hanzi).map(P.fromNum);
      if (P.sameSentence(want, user)) return finish(ex, true, '✓ Right!');
      return miss(ex, P.sameBases(want, user) ? 'Right words — check the tones.' : 'Not quite — try again.');
    }
  };
  document.addEventListener('keydown', (e) => {
    if (!sess) return;
    if (e.key === 'Escape') PR.close();
    else if (e.key === 'Enter' && e.target && e.target.id === 'pr-input') A['pr-check']();
  });
  document.addEventListener('input', (e) => { if (e.target && e.target.id === 'pr-input' && cur()) cur().st.typed = e.target.value; });
})(window.MSC = window.MSC || {});

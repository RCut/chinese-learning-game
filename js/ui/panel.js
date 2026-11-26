/*
 * The dialogue pane next to the stage: quest overview, Barista Lin, and the four object encounters.
 *
 * Hint policy (applies to every screen here):
 *   - nothing helpful is shown by default (no answers, grammar notes, clues, or target phrases),
 *   - the Hint button reveals, step by step: 1 grammar note → 2 word-by-word clue → 3 the answer,
 *   - a wrong answer opens the next level automatically (up to the clue; the answer is always the player's call).
 *
 * Layout policy: the feedback/hint area sits BELOW the inputs and buttons, the Hint button keeps its
 * slot (it is hidden with `invisible`, never removed), and the pane scrolls internally.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, B = MSC.barista, QZ = MSC.quizzes, UI = MSC.ui;
  const QD = MSC.data.quests, UT = MSC.data.ui;
  const P = (MSC.panel = { screens: {} });
  const panelEl = () => document.getElementById('panel');
  const HINT_LABEL = ['💡 Hint', '💡 More', '👁 Answer'];

  // ───────────────────────── shared pieces ─────────────────────────
  /** a sprite key → its pixel portrait; anything else (e.g. a one-off symbol) is shown as text */
  const avatar = (x) => (MSC.art.has(x) ? MSC.art.img(x, 3, true) : U.esc(x));
  const head = (emoji, title, hanzi, sub, extra) => `
    <div class="pane-head">
      <div class="row"><div class="avatar">${avatar(emoji)}</div>
        <div><h3>${U.esc(title)} ${hanzi ? `<span class="hz">(${U.esc(hanzi)})</span>` : ''}</h3><div class="sub">${sub}</div></div></div>
      <div class="row">${extra || ''}<button class="btn btn-ghost btn-sm only-narrow" data-click="to-map" title="Back to the map">🗺️ <span class="lbl">Map</span></button><button class="btn btn-ghost btn-sm" data-click="overview" title="Back to the quest overview">🧭 <span class="lbl">Quest</span></button></div>
    </div>`;

  P.head = head;
  const hintBtn = (level, solved, arg) =>
    `<button type="button" class="btn btn-hint ${solved || level >= 3 ? 'invisible' : ''}" style="min-width:104px" data-click="hint" data-arg="${arg}">${HINT_LABEL[Math.min(level, 2)]}</button>`;

  function reactionBox(r) {
    if (!r) return '';
    return `<div class="box ${r.type === 'success' ? 'green' : 'amber'}">${UI.sentence({ hanzi: r.hanzi, english: r.english }, { size: 'sm' })}</div>`;
  }

  function hintBoxes(level, { grammar, clue, answer }) {
    let h = '';
    if (level >= 1) h += `<div class="box sky box-sm"><div class="box-title">📘 Grammar</div>${UI.richText(grammar)}</div>`;
    if (level >= 2) h += `<div class="box violet box-sm"><div class="box-title">💡 Clue</div>${UI.richText(clue)}</div>`;
    if (level >= 3) h += `<div class="box green box-sm"><div class="box-title">✅ Answer</div>${UI.sentence(answer, { size: 'md' })}</div>`;
    return h;
  }

  // ───────────────────────── quest overview ─────────────────────────
  /** the journey card: the level, how many of its words are learned, and the tasks still to do */
  function journey() {
    if (!MSC.levels) return '';
    const p = MSC.levels.progress();
    const pct = Math.min(100, Math.round((100 * p.learned) / Math.max(1, p.need)));
    return `<div class="box journey stack" style="gap:6px">
      <div class="row between"><b>🗺️ ${U.esc(p.title)}</b><span class="sub num">${p.learned} / ${p.need} words learned</span></div>
      <div class="lvl-bar wide"><i class="learned" style="width:${pct}%"></i></div>
      <div class="sub">A word is learned when you can use it without help in two places (85%). ${MSC.levels.current() < MSC.levels.max() ? 'Learn these and finish the tasks to open the next level.' : ''}</div>
      ${p.tasks.map((t) => `<div class="step-line ${t.done ? 'done' : 'todo'}"><span>${t.done ? '✅' : '⬜'}</span><span>${U.esc(t.text)}</span></div>`).join('')}
    </div>`;
  }

  function renderWelcome() {
    const done = { menu: S.story.menuChecked, order: S.story.questDone };
    const nextId = !done.menu ? 'menu' : !done.order ? 'barista' : null;
    return `<div class="stack">
      <div class="pane-head"><div class="row"><div class="avatar">${avatar('compass')}</div>
        <div><div class="kicker">${UT.welcome.kicker}</div><h3>${UT.welcome.title}</h3></div></div>
        <div class="sub">Wallet <b class="num" style="color:#047857">¥${S.money}</b></div></div>
      ${journey()}
      <div class="box amber stack" style="gap:8px">
        ${UT.quest.map((q, i) => `<div class="step-line ${done[q.id] ? 'done' : 'todo'}"><span>${done[q.id] ? '✅' : ['1️⃣', '2️⃣'][i]}</span><span>${U.esc(q.text)}</span></div>`).join('')}
        ${S.story.questDone ? '<div class="sub" style="color:#065f46;font-weight:700">Quest complete! Order again, help a traveler, or explore.</div>' : ''}
      </div>
      <div class="stack" style="gap:8px">
        ${UT.destinations.map((d) => {
          const ent = MSC.stage.find(d.id).ent;
          return `<button class="dest ${d.id === nextId ? 'focus' : ''}" data-click="go" data-arg="${d.id}"><span class="row"><span class="dest-ic">${MSC.art.img(ent.sprite || ent.id, 2, true)}</span><span><b>${U.esc(d.title)}</b><small>${U.esc(MSC.data.world.stages[MSC.stage.find(d.id).stage].name)} · ${U.esc(d.subtitle)}</small></span></span><b style="font-size:12px">Go →</b></button>`;
        }).join('')}
      </div></div>`;
  }

  // ───────────────────────── Barista Lin ─────────────────────────
  function renderBaristaGate() {
    return `<div class="stack">${head('barista', 'Barista Lin', '林老板', `Wallet <b class="num">¥${S.money}</b>`)}
      <div class="box">${UI.sentence(QD.barista.gate, { size: 'lg' })}</div>
      <div class="box amber stack" style="gap:8px"><div class="box-sm"><b>Objective:</b> ${U.esc(QD.barista.gateObjective)}</div>
        <button class="btn btn-primary btn-block" data-click="go" data-arg="menu">📋 Go to the menu</button></div></div>`;
  }

  function renderBaristaBroke() {
    return `<div class="stack">${head('barista', 'Barista Lin', '林老板', `Wallet <b class="num">¥${S.money}</b>`)}
      <div class="box">${UI.sentence(QD.barista.broke, { size: 'lg' })}</div>
      <div class="box amber stack" style="gap:8px"><div class="box-sm"><b>Objective:</b> ${U.esc(QD.barista.brokeObjective)}</div>
        <button class="btn btn-primary btn-block" data-click="go" data-arg="passerby">🧳 Find the traveler</button></div></div>`;
  }

  function trayHtml(step) {
    const tray = step.state.tray;
    if (!tray.length) return '<span class="tray-empty">Tap word tiles below to build your sentence…</span>';
    return tray.map((h, i) => {
      const e = D.get(h);
      return `<button type="button" class="tile-btn picked" ${UI.interactAttrs(h, `${h} (${e.pinyin})`, e.english, 'remove-tile', i)}>${UI.wordLabel(h, true)}</button>`;
    }).join('');
  }

  function baristaInput(step) {
    const st = step.state;
    if (S.inputMode === 'tiles') {
      const bank = step.tiles.map((h, i) => {
        const e = D.get(h);
        return `<button type="button" class="tile-btn ${S.fresh.has(h) ? 'new' : ''}" ${UI.interactAttrs(h, `${h} (${e.pinyin})`, e.english, 'add-tile', i)}>${UI.wordLabel(h, true)}</button>`;
      }).join('');
      return `<div id="tray" class="tray">${trayHtml(step)}</div><div class="bank">${bank}</div>
        <div class="row"><button class="btn btn-ghost btn-sm" data-click="clear-tray">Clear</button><button class="btn btn-ghost btn-sm" data-click="shuffle" title="Shuffle tiles">🔀</button></div>`;
    }
    if (S.inputMode === 'recall') {
      return `<input type="text" id="recall-input" class="field" autocomplete="off" autocapitalize="off" spellcheck="false" value="${U.esc(st.recall)}" placeholder="Type pinyin, e.g. wǒ yào… or wo3 yao4…" />`;
    }
    const msg = S.mic.msg ? `<div class="box amber box-sm">${U.esc(S.mic.msg)}</div>` : '';
    const fallback = S.mic.unavailable
      ? `<button class="btn btn-soft-green btn-block ${st.hint >= 3 ? '' : 'off'}" data-click="shadow">✓ I said it aloud${st.hint >= 3 ? '' : ' (open the answer with Hint first)'}</button>` : '';
    return `${UI.heardBox(S.mic.transcript)}${msg}${fallback}`;
  }

  function renderBarista() {
    if (!S.story.menuChecked) return renderBaristaGate();
    if (S.round && !S.round.paid && S.money < S.round.total) {
      S.round = null; MSC.log.say('You spent some money, so Barista Lin has changed your order.');
    }
    if (!S.round) B.newRound();
    if (!S.round) return renderBaristaBroke();

    const r = S.round, step = B.step(), st = step.state;
    const last = r.step === r.steps.length - 1;
    const goalText = last && st.solved ? U.fill(QD.barista.roundDone, { totalNum: r.total }) : step.goal;
    const pills = r.steps.map((s, i) => `<button class="pillnum ${i === r.step ? 'on' : s.state.solved ? 'done' : ''}" data-click="step" data-arg="${i}">${s.state.solved ? '✓ ' : ''}${i + 1}</button>`).join('');
    const nextBtn = st.solved
      ? (last ? '<button class="btn btn-dark btn-sm" data-click="new-order">New order ↺</button>' : '<button class="btn btn-ok btn-sm" data-click="next">Next →</button>')
      : '<button class="btn btn-sm invisible" tabindex="-1">Next →</button>';
    const modes = ['tiles', 'recall', 'speak'].map((m) =>
      `<button type="button" class="${S.inputMode === m ? 'on' : ''}" data-click="mode" data-arg="${m}">${{ tiles: '🧩 Tiles', recall: '✍️ Recall', speak: '🎙️ Speak' }[m]}</button>`).join('');

    const primary = S.inputMode === 'speak'
      ? `<button class="btn btn-dark grow ${S.mic.recording ? 'rec' : ''}" data-click="mic">${S.mic.recording ? '⏹ Stop' : '🎙️ Speak'}</button>`
      : '<button class="btn btn-primary grow" data-click="send">Send</button>';
    const evalHtml = st.eval && S.inputMode === 'recall'
      ? `<div class="eval">${st.eval.map((it) => `<span class="ev ${it.status}"><span>${U.esc(it.label)}</span><small>${it.status === 'correct' ? '✓ ' : it.status === 'wrong' ? '✕ ' : ''}${U.esc(it.detail)}</small></span>`).join('')}</div>` : '';

    return `<div class="stack">
      ${head('barista', 'Barista Lin', '林老板', `Wallet <b class="num" style="color:#047857">¥${S.money}</b>`, `<div class="row" style="gap:4px">${pills}</div>`)}
      <div class="box">${UI.sentence(step.npc, { size: 'lg' })}</div>
      <div class="box amber row between" style="min-height:62px"><div><span class="kicker" style="color:#92400e">Your goal</span><div style="font-weight:700;font-size:13px">${U.esc(goalText)}</div></div>${nextBtn}</div>
      <div class="tabs3">${modes}</div>
      <div class="stack" style="gap:10px">${baristaInput(step)}</div>
      <div class="actions">${hintBtn(st.hint, st.solved, 'barista')}${primary}</div>
      <div id="feedback" class="stack" style="gap:8px">${reactionBox(st.reaction)}${evalHtml}${hintBoxes(st.hint, { grammar: step.grammarHint, clue: B.clue(step), answer: { hanzi: step.targetHanzi, english: step.goal } })}</div>
    </div>`;
  }

  // ───────────────────────── object encounters ─────────────────────────
  function boardHtml(quiz) {
    if (quiz.board === 'menu') {
      return `<div class="box amber stack" style="gap:6px"><div class="row between sub" style="color:#92400e"><b>Today’s menu</b><span>Wallet <b class="num">¥${S.money}</b></span></div>
        <div class="menu-board">${MSC.economy.menu().map((m) => `<div class="menu-line"><span class="hz" style="font-weight:700">${UI.sentence({ hanzi: m.hanzi }, { size: 'sm', translation: false, speaker: false })}</span><span class="price num">¥${m.price}</span></div>`).join('')}</div></div>`;
    }
    if (quiz.board === 'sign') {
      return `<div class="box green"><div class="sign-lines">${quiz.signLines.map((l) => UI.sentence(l, { size: 'md', translation: false, speaker: false })).join('')}</div></div>`;
    }
    return '';
  }

  function renderQuiz(key) {
    const st = QZ.state(key), quiz = st.quiz;
    const opts = quiz.items.map((it, i) =>
      `<button type="button" class="quiz-opt ${st.selected === i ? 'on' : ''} ${st.hint >= 3 && it.correct ? 'ans' : ''}" data-quiz="${key}" data-idx="${i}" ${UI.interactAttrs(it.hanzi, `${it.hanzi} (${D.sentencePinyin(it.hanzi)})`, it.english, 'select-quiz', `${key}:${i}`)}>
        ${UI.phraseLabel(it.hanzi)}<span class="radio"><i></i></span></button>`).join('');
    const after = st.solved
      ? `<div class="row" style="flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-click="renew-quiz" data-arg="${key}">↻ ${U.esc(quiz.repeatLabel)}</button>${key === 'menu' ? '<button class="btn btn-ok btn-sm" data-click="go" data-arg="barista">Go order lunch →</button>' : ''}</div>` : '';
    const correct = quiz.items.find((i) => i.correct);
    return `<div class="stack">
      ${head(key, quiz.title, quiz.hanzi, `<span class="kicker">${U.esc(quiz.badge)}</span>`)}
      ${boardHtml(quiz)}
      <div class="box"><div class="sub" style="margin-bottom:6px;font-weight:600">${U.esc(quiz.instruction)}</div>${UI.sentence(quiz.prompt, { size: 'lg' })}</div>
      <div class="stack" style="gap:8px">${opts}</div>
      <div class="actions">${hintBtn(st.hint, st.solved, key)}<button class="btn btn-primary grow" data-click="send-quiz" data-arg="${key}">Send</button></div>
      <div id="feedback" class="stack" style="gap:8px">${reactionBox(st.reaction)}${after}${hintBoxes(st.hint, { grammar: quiz.grammarHint, clue: quiz.clue, answer: correct })}</div>
    </div>`;
  }

  // ───────────────────────── simple objects (a tree, a bench, a sign…) ─────────────────────────
  function renderObject(o) {
    const e = D.get(o.hanzi);
    const sub = e ? `<span class="kicker">${U.esc(e.category)}</span>` : '';
    // the word itself comes first (it is what you hear); a sign or notice, if there is one, is shown below it
    const word = `<div class="box">${UI.sentence({ hanzi: o.hanzi, english: e ? e.english : '' }, { size: 'lg' })}</div>`;
    const sign = o.text && o.text.length
      ? `<div class="box green"><div class="kicker" style="margin-bottom:4px">The sign says</div><div class="sign-lines">${o.text.map((l) => UI.sentence(l, { size: 'md', speaker: true })).join('')}</div></div>` : '';
    const body = word + sign;
    return `<div class="stack">${head(o.sprite || o.id, e ? U.capitalize(e.english.split(/[\/;(]/)[0].trim()) : o.hanzi, o.hanzi, sub)}
      ${body}${o.note ? `<div class="box amber box-sm">${UI.richText(o.note)}</div>` : ''}
      ${o.listen && o.listen.length ? `<button type="button" class="btn btn-dark btn-block" data-click="obj-listen" data-arg="${U.esc(o.id)}">🎧 ${U.esc(o.listenTitle || 'Listen — what did you hear?')}</button>` : ''}
      <div class="sub">${o.listen && o.listen.length ? 'Listen and pick what you heard — just for your ears, it doesn’t change your scores.' : 'Nothing to do here — just learn the word. It is in your notebook now.'}</div></div>`;
  }

  // ───────────────────────── render ─────────────────────────
  P.render = (resetScroll, toFeedback) => {
    const el = panelEl();
    const top = resetScroll ? 0 : el.scrollTop;
    const before = S.discoverCount;
    const a = S.active;
    el.innerHTML = a === 'barista' ? renderBarista() : a && QZ.has(a) ? renderQuiz(a) : a && P.screens[a] ? P.screens[a]() : a && MSC.stage.find(a) && MSC.stage.find(a).type === 'object' ? renderObject(MSC.stage.find(a).ent) : renderWelcome();
    el.scrollTop = top;
    if (S.discoverCount > before && a) MSC.log.tip();
    if (toFeedback) P.revealFeedback();
  };

  // On phones the dialogue pane is part of the page (single column); on wide screens it is its own scroller beside the stage.
  const singleColumn = () => window.matchMedia('(max-width: 1023px)').matches;
  const headerH = () => (document.querySelector('.app-header') || { offsetHeight: 0 }).offsetHeight;
  /** Bring the bottom of `el` into view: the page scrolls on phones, the pane on wide screens. */
  P.revealBottom = (el, pad = 12) => {
    if (singleColumn()) {
      const over = el.getBoundingClientRect().bottom - (window.innerHeight - pad);
      if (over > 0) window.scrollBy({ top: over, behavior: 'smooth' });
    } else {
      const pane = panelEl(), over = el.getBoundingClientRect().bottom - pane.getBoundingClientRect().bottom;
      if (over > 0) pane.scrollBy({ top: over + pad, behavior: 'smooth' });
    }
  };
  P.revealFeedback = () => requestAnimationFrame(() => {
    const fb = document.getElementById('feedback');
    if (fb && fb.firstElementChild) P.revealBottom(fb);
  });
  /** Phones: scroll so the dialogue pane (below the stage) is under the header; the 🗺️ button scrolls back to the stage. */
  P.showPanel = () => { if (singleColumn()) window.scrollTo({ top: Math.max(0, panelEl().getBoundingClientRect().top + window.scrollY - headerH() - 8), behavior: 'smooth' }); };
  P.showStage = () => { if (singleColumn()) window.scrollTo({ top: Math.max(0, document.getElementById('view-stage').getBoundingClientRect().top + window.scrollY - headerH() - 8), behavior: 'smooth' }); };


  // ───────────────────────── actions ─────────────────────────
  const A = MSC.actions;
  const curState = () => (S.active === 'barista' ? B.step().state : QZ.state(S.active));

  A['to-map'] = () => P.showStage();
  A.overview = () => { S.active = null; MSC.stage.refresh(); P.render(true); };
  A.hint = (arg) => {
    const st = arg === 'barista' ? B.step().state : QZ.state(arg);
    st.hint = Math.min(3, st.hint + 1);
    if (st.hint === 3) {
      if (arg === 'barista') MSC.speech.say(B.step().targetHanzi);
      else MSC.speech.say(QZ.state(arg).quiz.items.find((i) => i.correct).hanzi);
    }
    P.render(false, true);
  };
  A.mode = (m) => { S.inputMode = m; S.mic.msg = ''; P.render(false); };

  // — Barista —
  A['add-tile'] = (idx) => {
    const step = B.step(); if (!step) return;
    step.state.tray.push(step.tiles[Number(idx)]);
    document.getElementById('tray').innerHTML = trayHtml(step);
  };
  A['remove-tile'] = (idx) => {
    const step = B.step();
    step.state.tray.splice(Number(idx), 1);
    document.getElementById('tray').innerHTML = trayHtml(step);
  };
  A['clear-tray'] = () => { const s = B.step(); s.state.tray = []; document.getElementById('tray').innerHTML = trayHtml(s); };
  A.shuffle = () => { const s = B.step(); s.tiles = U.shuffle(s.tiles); P.render(false); };
  A.step = (i) => { S.round.step = Number(i); MSC.speech.say(B.step().npc.hanzi); P.render(true); };
  A.next = () => { S.round.step++; MSC.speech.say(B.step().npc.hanzi); P.render(true); };
  A['new-order'] = () => { S.round = null; P.render(true); if (S.round) MSC.speech.say(B.step().npc.hanzi); };

  function baristaSubmit(custom) {
    const step = B.step(), st = step.state;
    let user = custom;
    if (!user) {
      if (S.inputMode === 'recall') {
        const inp = document.getElementById('recall-input');
        if (inp) st.recall = inp.value;
        user = MSC.pinyin.parse(st.recall);
      } else user = MSC.pinyin.parse(st.tray.join(''));
    }
    if (!user.length) { MSC.log.say(S.inputMode === 'recall' ? 'Type your answer first.' : 'Tap some word tiles first.'); return; }
    const res = B.check(step, user, S.inputMode === 'recall');
    if (res.ok && res.first) { MSC.mastery.useText(step.targetHanzi, { hint: st.hint, mistakes: st.attempts, tiles: S.inputMode === 'tiles' }, 'cafe'); if (MSC.teach) MSC.teach.prompt(); }
    MSC.speech.say(st.reaction.hanzi);
    if (res.ok && res.first) {
      MSC.addXP(25, step.goal.replace(/\.$/, ''));
      if (step.id === 'price') B.settle();
    }
    P.render(false, true);
  }
  A.send = () => baristaSubmit();
  A.shadow = () => { const step = B.step(); S.mic.transcript = step.targetHanzi; baristaSubmit(MSC.pinyin.parse(step.targetHanzi)); };

  // — speech recognition (Speak mode) —
  A.mic = () => {
    if (S.mic.recording && MSC.recognizer.active()) { MSC.recognizer.stop(); return; }
    S.mic.recording = true; S.mic.transcript = ''; S.mic.msg = '';
    const started = MSC.recognizer.start({
      onInterim: (t) => { const live = document.getElementById('live'); if (live) live.textContent = `Hearing: “${t}”`; },
      onFinal: (fin) => {
        S.mic.transcript = fin; S.mic.recording = false;
        const heard = MSC.pinyin.parse(fin), step = B.step();
        const same = step.accepted.find((alt) => MSC.pinyin.sameBases(alt, heard));   // recognisers rarely get tones right
        baristaSubmit(same || heard);
      },
      onError: (code) => {
        S.mic.recording = false;
        if (code === 'unsupported') { S.mic.unavailable = true; S.mic.msg = 'Speech recognition isn’t supported in this browser.'; }
        else if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(code)) { S.mic.unavailable = true; S.mic.msg = 'Microphone access is blocked here.'; }
        else if (code === 'start-failed') { S.mic.unavailable = true; S.mic.msg = 'The microphone couldn’t start here.'; }
        else if (code !== 'aborted') S.mic.msg = `Mic problem (${code}). Try again.`;
        P.render(false);
      },
      onEnd: () => { S.mic.recording = false; P.render(false); },
    });
    P.render(false);
    return started;
  };

  // — Object encounters —
  A['select-quiz'] = (arg) => {
    const [key, idx] = arg.split(':');
    QZ.state(key).selected = Number(idx);
    document.querySelectorAll(`.quiz-opt[data-quiz="${key}"]`).forEach((b) => b.classList.toggle('on', Number(b.dataset.idx) === Number(idx)));
  };
  A['send-quiz'] = (key) => {
    const st = QZ.state(key);
    if (st.selected === null) { MSC.log.say('Pick an answer first.'); return; }
    const res = QZ.submit(key);
    MSC.speech.say(st.reaction.hanzi);
    P.render(false, true);
    if (res && res.ok && MSC.teach) MSC.teach.prompt();
    return res;
  };
  A['obj-listen'] = (id) => { const f = MSC.stage.find(id); if (f && f.ent.listen) MSC.practice.listen(f.ent.listen, f.ent.listenTitle); };
  A['renew-quiz'] = (key) => { QZ.renew(key); P.render(true); MSC.speech.say(QZ.state(key).quiz.prompt.hanzi); };

  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.id === 'recall-input') {
      if (e.key === 'Enter') baristaSubmit();
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'recall-input' && S.round) B.step().state.recall = e.target.value;
  });
})(window.MSC = window.MSC || {});

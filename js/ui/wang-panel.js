/*
 * Master Wang's stall — the dialogue pane for 王师傅.
 * Views: intro (first visit) · menu · offer (pick 4 of 8) · rules (stroke-rule cards) · done (lesson complete).
 * Available from the very first minute: it never depends on the café quest.
 */
(function (MSC) {
  const U = MSC.util, S = MSC.state, WR = MSC.writing, P = MSC.panel, UI = MSC.ui, SB = MSC.StrokeBoard;
  const D = MSC.data.writing;
  const st = () => S.writing;
  let view = 'menu';
  let picked = new Set();
  let afterTutorial = false;
  let lastDone = [];

  const head = () => P.head('🖌️', 'Master Wang', '王师傅', 'Calligraphy &amp; seals');

  function sign(c, { button = true } = {}) {
    const best = st().best[c];
    const art = best ? SB.handwritingSvg(best.strokes, { grid: false }) : SB.referenceSvg(c);
    const inner = `<span class="sign-art">${art}</span>${best ? `<span class="sign-seal">${SB.sealHtml(best.seal)}</span>` : ''}`;
    return button
      ? `<button type="button" class="sign" data-click="wall-open" data-arg="${U.esc(WR.wordFor(c))}" title="Open ${U.esc(c)} in your notebook">${inner}</button>`
      : `<span class="sign">${inner}</span>`;
  }

  const wall = () => {
    const chars = WR.masteredChars();
    return `<div class="wp-sec" style="margin-top:4px"><h4>Wang’s wall${chars.length ? ` · ${chars.length}` : ''}</h4>
      ${chars.length ? `<div class="wall">${chars.map((c) => sign(c)).join('')}</div>` : '<div class="sub">The characters you master hang here in your own handwriting.</div>'}</div>`;
  };

  // ───────────── views ─────────────
  function introView() {
    const going = WR.hasLesson() && WR.lessonProgress().kind === 'tutorial';
    return `<div class="stack">${head()}
      <div class="box">${UI.sentence(D.lines.tutorialIntro, { size: 'lg' })}</div>
      <div class="box amber stack" style="gap:8px"><div class="box-sm"><b>Objective:</b> Learn to write your first two characters. It takes about two minutes.</div>
        <button class="btn btn-primary btn-block" data-click="wang-tutorial">${going ? '✍️ Continue the tutorial' : '✍️ Start the tutorial'}</button></div></div>`;
  }

  function menuView() {
    const prog = WR.lessonProgress();
    const left = WR.poolLeft();
    const mastered = WR.masteredChars().length;
    const lessonBtn = prog
      ? `<button class="btn btn-primary btn-block" data-click="wang-continue">✍️ Continue lesson <span class="num">(${prog.done}/${prog.total} mastered)</span></button>`
      : left
        ? '<button class="btn btn-primary btn-block" data-click="wang-new">✍️ New lesson</button>'
        : '<button class="btn btn-primary btn-block off" disabled>✍️ New lesson</button>';
    const line = !prog && !left ? D.lines.nothingLeft : D.lines.menu;
    const rulesCount = st().rules.length;
    return `<div class="stack">${head()}
      <div class="box">${UI.sentence(line, { size: 'lg' })}</div>
      <div class="stack" style="gap:8px">${lessonBtn}
        <div class="actions"><button class="btn btn-ghost grow" data-click="wang-review">🔁 Review <span class="num sub">(${Math.min(mastered, D.lessonSize)})</span></button>
          <button class="btn btn-ghost grow" data-click="wang-rules">📜 Stroke rules <span class="num sub">(${rulesCount}/${D.rules.length})</span></button></div></div>
      ${wall()}</div>`;
  }

  function offerView() {
    const offer = WR.offer();
    if (!offer) { view = 'menu'; return menuView(); }
    const need = Math.min(D.lessonSize, offer.chars.length);
    const cards = offer.chars.map((c) => {
      const info = WR.info(c), on = picked.has(c);
      return `<button type="button" class="offer-card ${on ? 'on' : ''}" data-click="wang-pick" data-arg="${U.esc(c)}" aria-pressed="${on}">
        <span class="oc-hz hz">${U.esc(c)}</span><span class="oc-py">${U.esc(info.pinyin)}</span><span class="oc-mean">${U.esc(info.meaning)}</span>
        <span class="oc-n num">${WR.strokeCount(c)} strokes</span></button>`;
    }).join('');
    const canReshuffle = offer.reshuffles > 0 && WR.poolLeft() > D.lessonSize;
    const line = afterTutorial ? D.lines.tutorialDone : D.lines.offer;
    return `<div class="stack">${head()}
      <div class="box">${UI.sentence(line, { size: 'lg' })}</div>
      <div class="row between"><div class="box-sm"><b>Pick ${need}</b> to learn today</div><div class="num" style="font-weight:800">${picked.size} / ${need}</div></div>
      <div class="offer-grid">${cards}</div>
      <div class="actions">
        <button class="btn btn-ghost grow" data-click="wang-random">🎲 Let Wang choose</button>
        <button class="btn btn-ghost ${canReshuffle ? '' : 'off'}" data-click="wang-reshuffle" ${canReshuffle ? '' : 'disabled'}>🔀 Reshuffle <span class="num sub">(${canReshuffle ? offer.reshuffles : 0})</span></button></div>
      <div class="actions"><button class="btn btn-ghost" data-click="wang-back">← Back</button>
        <button class="btn btn-primary grow ${picked.size === need ? '' : 'off'}" data-click="wang-start" ${picked.size === need ? '' : 'disabled'}>Start lesson</button></div></div>`;
  }

  function rulesView() {
    const cards = D.rules.map((r) => {
      const open = st().rules.includes(r.id);
      return open
        ? `<div class="rule-card"><div class="rc-ex hz">${U.esc(r.example)}</div><div><b>${U.esc(r.title)}</b>${r.hanzi ? ` <span class="hz">${UI.richText(r.hanzi)}</span>` : ''}<div class="box-sm">${U.esc(r.tip)}</div></div></div>`
        : '<div class="rule-card locked"><div class="rc-ex">🔒</div><div><b>Not unlocked yet</b><div class="box-sm">Learn a character that uses this rule.</div></div></div>';
    }).join('');
    return `<div class="stack">${head()}<div class="row between"><h3 style="margin:0;font-size:15px">Stroke rules</h3><button class="btn btn-ghost btn-sm" data-click="wang-back">← Back</button></div>
      <div class="stack" style="gap:8px">${cards}</div></div>`;
  }

  function doneView() {
    return `<div class="stack">${head()}
      <div class="box green">${UI.sentence(D.lines.lessonDone, { size: 'lg' })}</div>
      <div class="box amber"><div class="box-title">Stamped with Wang’s seal</div><div class="wall">${lastDone.map((c) => sign(c)).join('')}</div>
        <div class="sub" style="margin-top:6px">They are on the wall and in your notebook now.</div></div>
      <div class="actions"><button class="btn btn-ghost grow" data-click="wang-back">Menu</button>
        <button class="btn btn-primary grow ${WR.poolLeft() ? '' : 'off'}" data-click="wang-new" ${WR.poolLeft() ? '' : 'disabled'}>Next lesson →</button></div></div>`;
  }

  P.screens.wang = () => {
    if (!st().tutorialDone) return introView();
    if (WR.hasLesson() && view === 'offer') view = 'menu';          // a lesson in progress: offer Continue, never a second offer
    if (view === 'offer') return offerView();
    if (view === 'rules') return rulesView();
    if (view === 'done') return doneView();
    return menuView();
  };
  const refresh = (reset) => P.render(!!reset);

  // ───────────── actions ─────────────
  const A = MSC.actions;
  A['wang-tutorial'] = () => MSC.writer.begin(WR.hasLesson() ? WR.continueSession() : WR.startTutorial());
  A['wang-continue'] = () => MSC.writer.begin(WR.continueSession());
  A['wang-new'] = () => { view = 'offer'; picked = new Set(); WR.offer(); const o = WR.offer(); if (o && o.chars.length <= D.lessonSize) picked = new Set(o.chars); refresh(true); };
  A['wang-back'] = () => { view = 'menu'; afterTutorial = false; refresh(true); };
  A['wang-rules'] = () => { view = 'rules'; refresh(true); };
  A['wang-pick'] = (c) => {
    const need = Math.min(D.lessonSize, WR.offer().chars.length);
    if (picked.has(c)) picked.delete(c);
    else if (picked.size < need) { picked.add(c); MSC.speech.say(c); }
    else { MSC.toast.show(`You have ${need} already — tap one to put it back.`); return; }
    refresh(false);
  };
  A['wang-random'] = () => { const s = WR.startLesson(WR.randomPick()); view = 'menu'; MSC.writer.begin(s); };
  A['wang-reshuffle'] = () => { if (WR.reshuffle()) { picked = new Set(); refresh(false); } };
  A['wang-start'] = () => {
    const need = Math.min(D.lessonSize, WR.offer().chars.length);
    if (picked.size !== need) return;
    const s = WR.startLesson([...picked]);
    view = 'menu';
    MSC.writer.begin(s);
  };
  A['wang-review'] = () => {
    if (!WR.masteredChars().length) { MSC.toast.show('Nothing to review yet — learn some characters first.'); return; }
    MSC.writer.begin(WR.reviewSession());
  };
  A['wall-open'] = (word) => { A.tab('notebook'); A['open-word'](word); };
  A['open-notebook-word'] = A['wall-open'];
  A['go-wang'] = () => { A.tab('stage'); MSC.stage.go('wang'); };

  // ───────────── lesson complete: wall + notebook ─────────────
  MSC.on('writing-complete', ({ kind, chars }) => {
    chars.forEach((c) => MSC.vocab.discover(WR.wordFor(c)));        // new words are added; existing ones simply gain "How to write"
    MSC.toast.html(`✍️ You can now write ${chars.map((c) =>
      `<button type="button" class="toast-chip hz" data-click="open-notebook-word" data-arg="${U.esc(WR.wordFor(c))}">${U.esc(c)}</button>`).join(' ')}`, 'act', 9000);
    lastDone = chars;
    if (kind === 'tutorial') { afterTutorial = true; view = 'offer'; picked = new Set(); WR.makeOffer(); } else { afterTutorial = false; view = 'done'; }
    MSC.emit('writing-changed');
  });

  MSC.on('writer-closed', () => { if (S.active === 'wang') refresh(false); });
  MSC.on('writing-changed', () => { if (S.active === 'wang') refresh(false); });
})(window.MSC = window.MSC || {});

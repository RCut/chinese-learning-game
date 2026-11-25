/*
 * Xiao Li's chat screen. The conversation scrolls like a chat: Xiao Li's lines on the left, yours on the right.
 * You never pick from a list of answers — you BUILD what you say from word tiles (or type it).
 *
 * Hint policy (same as everywhere): nothing helpful is shown by default.
 *   Hint 1 → the pattern to use · Hint 2 → the words you need, word by word · Hint 3 → example answers.
 * A wrong answer opens the next level by itself (never the full answer).
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state, P = MSC.panel, UI = MSC.ui, CH = MSC.chat;
  const SETS = MSC.data.chats;
  const mine = () => S.chat && S.chat.set;           // the conversation set of whoever you are talking to
  const HINT_LABEL = ['💡 Hint', '💡 More', '👁 Answer'];
  const SHOWN = 4;      // how many earlier lines stay on screen

  const info = (h) => { const e = D.get(h); if (e) return { py: e.pinyin, en: e.english }; const t = D.segment(h)[0]; return { py: D.tokenPinyin(t), en: D.tokenEnglish(t) }; };

  const bubble = (m) => `<div class="chat-line ${m.who}"><div class="bubble ${m.who}">${UI.sentence({ hanzi: m.hanzi, english: m.english }, { size: 'sm' })}</div></div>`;

  function hintBoxes(cur) {
    const st = cur.st;
    let h = '';
    if (st.hint >= 1) h += `<div class="box sky box-sm"><div class="box-title">📘 Pattern</div>${UI.richText(cur.tip)}</div>`;
    if (st.hint >= 2) {
      const lines = cur.replies.map((r) => `${cur.replies.length > 1 ? `<b>${U.esc(r.label)}:</b> ` : ''}${UI.richText(CH.clue(r.variants[0]))}`).join('<br>');
      h += `<div class="box violet box-sm"><div class="box-title">💡 Words you need</div>${lines}</div>`;
    }
    if (st.hint >= 3) {
      h += `<div class="box green box-sm"><div class="box-title">✅ You could say</div><div class="stack" style="gap:6px">${cur.replies.map((r) =>
        `${cur.replies.length > 1 ? `<div class="sub"><b>${U.esc(r.label)}</b></div>` : ''}${UI.sentence({ hanzi: r.variants[0], english: r.en }, { size: 'sm' })}`).join('')}</div></div>`;
    }
    return h;
  }

  function inputArea(cur) {
    const st = cur.st;
    if (S.chatMode === 'speak') {
      const fallback = S.mic.unavailable ? '<div class="box amber box-sm">Speaking isn’t available here — use Build or Type instead.</div>' : '';
      return `${UI.heardBox(st.heard)}${S.mic.msg ? `<div class="box amber box-sm">${U.esc(S.mic.msg)}</div>` : ''}${fallback}`;
    }
    if (S.chatMode === 'recall') {
      return `<input type="text" id="chat-input" class="field" autocomplete="off" autocapitalize="off" spellcheck="false" value="${U.esc(st.recall)}" placeholder="Type pinyin (nǐ hǎo / ni3 hao3) or hanzi…" />`;
    }
    const usedIdx = new Set(st.tray.map((t) => t.i));
    const tray = st.tray.length
      ? st.tray.map((t, k) => { const x = info(t.h); return `<button type="button" class="tile-btn picked" ${UI.interactAttrs(t.h, `${t.h} (${x.py})`, x.en, 'chat-remove', k)}>${UI.wordLabel(t.h, true)}</button>`; }).join('')
      : '<span class="tray-empty">Tap word tiles to build what you want to say…</span>';
    const bank = cur.tiles.map((h, i) => {
      const x = info(h);
      return `<button type="button" class="tile-btn ${usedIdx.has(i) ? 'used' : ''}" ${UI.interactAttrs(h, `${h} (${x.py})`, x.en, 'chat-add', i)}>${UI.wordLabel(h, true)}</button>`;
    }).join('');
    return `<div id="chat-tray" class="tray">${tray}</div><div class="bank">${bank}</div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-click="chat-clear">Clear</button><button class="btn btn-ghost btn-sm" data-click="chat-shuffle" title="Shuffle tiles">🔀</button></div>`;
  }

  function render(npcId) {
    if (!S.chat || S.chat.npcId !== npcId) CH.begin(npcId);
    const c = S.chat, cur = c.cur, C = c.set;
    const log = c.log.slice(-SHOWN).map(bubble).join('');
    const more = c.log.length > SHOWN ? '<div class="sub" style="text-align:center">…</div>' : '';
    const top = P.head(C.npc.emoji, C.npc.name, C.npc.hanzi, U.esc(C.npc.blurb),
      '<button class="btn btn-ghost btn-sm" data-click="chat-new" title="Start a different conversation">🔄 New chat</button>');
    const topic = `<div class="kicker">Topic · ${U.esc(c.dlg.title)}</div>`;

    if (c.finished) {
      return `<div class="stack">${top}${topic}<div class="chat-log">${more}${log}</div>
        <div class="box">${UI.sentence(cur.npc, { size: 'lg' })}</div>
        <div class="box green"><div class="box-title">🎉 Conversation finished!</div><div class="box-sm">You built ${c.turns} phrase${c.turns === 1 ? '' : 's'} in Chinese. Every time you come back, ${U.esc(C.npc.name)} has something new to say.</div></div>
        <div class="actions"><button class="btn btn-primary grow" data-click="chat-new">Talk again ↺</button></div></div>`;
    }

    const st = cur.st;
    const npc = cur.npc
      ? `<div class="box">${UI.sentence(cur.npc, { size: 'lg' })}</div>`
      : `<div class="box"><div class="box-sm">💬 ${U.esc(C.npc.name)} is waiting for <b>you</b> to speak first.</div></div>`;
    const modes = ['tiles', 'recall', 'speak'].map((m) => `<button type="button" class="${S.chatMode === m ? 'on' : ''}" data-click="chat-mode" data-arg="${m}">${{ tiles: '🧩 Build', recall: '✍️ Type', speak: '🎙️ Speak' }[m]}</button>`).join('');
    return `<div class="stack">${top}${topic}
      <div class="chat-log">${more}${log}</div>
      ${npc}
      <div class="box amber"><span class="kicker" style="color:#92400e">Your goal</span><div style="font-weight:700;font-size:13px">${U.esc(cur.goal)}</div></div>
      <div class="tabs3" style="grid-template-columns:repeat(3,1fr)">${modes}</div>
      <div class="stack" style="gap:10px">${inputArea(cur)}</div>
      <div class="actions"><button type="button" class="btn btn-hint ${st.hint >= 3 ? 'invisible' : ''}" style="min-width:104px" data-click="chat-hint">${HINT_LABEL[Math.min(st.hint, 2)]}</button>${S.chatMode === 'speak'
        ? `<button type="button" class="btn btn-dark grow ${S.mic.recording ? 'rec' : ''}" data-click="chat-mic">${S.mic.recording ? '⏹ Stop' : '🎙️ Speak'}</button>`
        : '<button class="btn btn-primary grow" data-click="chat-send">Send</button>'}</div>
      <div id="feedback" class="stack" style="gap:8px">${st.reaction ? `<div class="box amber">${UI.sentence({ hanzi: st.reaction.hanzi, english: st.reaction.english }, { size: 'sm' })}</div>` : ''}${hintBoxes(cur)}</div>
    </div>`;
  }
  Object.keys(SETS).forEach((id) => { P.screens[id] = () => render(id); });

  const refresh = (toEnd) => {
    P.render(false);
    if (toEnd) requestAnimationFrame(() => { const el = document.getElementById('panel'); el.scrollTop = el.scrollHeight; });
  };
  const quietXP = (n) => { S.xp += n; MSC.progress.save(); MSC.emit('stats'); };

  // ───────────── actions ─────────────
  const A = MSC.actions;
  const live = () => (S.chat && !S.chat.finished ? S.chat.cur : null);

  A['chat-new'] = () => {
    CH.begin(S.chat ? S.chat.npcId : S.active);
    P.render(true);
    const id = S.chat.dlg.id, npc = S.chat.npcId;
    setTimeout(() => { if (S.chat && S.chat.dlg.id === id && !S.chat.log.length && S.chat.cur.npc && S.active === npc) MSC.speech.say(S.chat.cur.npc.hanzi); }, 250);
  };
  A['chat-mode'] = (m) => { if (MSC.recognizer.active()) MSC.recognizer.stop(); S.mic.recording = false; S.mic.msg = ''; S.chatMode = m; refresh(false); };
  A['chat-add'] = (i) => {
    const cur = live(); if (!cur) return;
    const idx = Number(i);
    if (cur.st.tray.some((t) => t.i === idx)) return;
    cur.st.tray.push({ h: cur.tiles[idx], i: idx });
    refresh(false);
  };
  A['chat-remove'] = (k) => { const cur = live(); if (!cur) return; cur.st.tray.splice(Number(k), 1); refresh(false); };
  A['chat-clear'] = () => { const cur = live(); if (!cur) return; cur.st.tray = []; refresh(false); };
  A['chat-shuffle'] = () => { const cur = live(); if (!cur) return; cur.tiles = U.shuffle(cur.tiles); cur.st.tray = []; refresh(false); };
  A['chat-hint'] = () => {
    const cur = live(); if (!cur) return;
    cur.st.hint = Math.min(3, cur.st.hint + 1);
    if (cur.st.hint === 3) MSC.speech.say(cur.replies[0].variants[0]);
    refresh(false);
  };

  A['chat-send'] = () => {
    const cur = live(); if (!cur) return;
    const typing = S.chatMode === 'recall';
    if (typing) { const inp = document.getElementById('chat-input'); if (inp) cur.st.recall = inp.value; }
    const user = CH.userSyllables(cur, S.chatMode);
    if (!user.length) { MSC.toast.show(typing ? 'Type your answer first.' : 'Tap some word tiles first.'); return; }
    if (!typing) MSC.vocab.discoverText(cur.st.tray.map((t) => t.h).join(''));
    submit(cur, CH.match(cur, user));
  };

  /** Speak: what the recogniser heard appears like Xiao Li's lines (tappable words), then it is judged like any answer. */
  A['chat-mic'] = () => {
    const cur = live(); if (!cur) return;
    if (S.mic.recording && MSC.recognizer.active()) { MSC.recognizer.stop(); return; }
    S.mic.recording = true; S.mic.msg = ''; cur.st.heard = '';
    MSC.recognizer.start({
      onInterim: (t) => { const el = document.getElementById('live'); if (el && !el.classList.contains('heard')) el.textContent = `Hearing: “${t}”`; },
      onFinal: (fin) => {
        S.mic.recording = false;
        if (live() !== cur) return;
        cur.st.heard = fin;
        MSC.vocab.discoverText(fin);
        submit(cur, CH.matchSpoken(cur, MSC.pinyin.parse(fin)));
      },
      onError: (code) => {
        S.mic.recording = false;
        if (code === 'unsupported') { S.mic.unavailable = true; S.mic.msg = 'Speech recognition isn’t supported in this browser.'; }
        else if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(code)) { S.mic.unavailable = true; S.mic.msg = 'Microphone access is blocked here.'; }
        else if (code === 'start-failed') { S.mic.unavailable = true; S.mic.msg = 'The microphone couldn’t start here.'; }
        else if (code !== 'aborted' && code !== 'no-speech') S.mic.msg = `Mic problem (${code}). Try again.`;
        refresh(false);
      },
      onEnd: () => { S.mic.recording = false; refresh(false); },
    });
    refresh(false);
  };

  function submit(cur, m) {
    if (m.reply) {
      quietXP(mine().xpTurn);
      const next = CH.advance(m);
      if (S.chat.finished) MSC.addXP(mine().xpFinish, 'Finished a conversation');
      if (next.npc) MSC.speech.say(next.npc.hanzi);
      refresh(true);
    } else {
      CH.miss(cur, m.tonesOff);
      MSC.speech.say(cur.st.reaction.hanzi);
      refresh(false);
    }
  }

  document.addEventListener('keydown', (e) => { if (e.target && e.target.id === 'chat-input' && e.key === 'Enter') A['chat-send'](); });
  document.addEventListener('input', (e) => { if (e.target && e.target.id === 'chat-input' && live()) live().st.recall = e.target.value; });

  // say the NPC's opening line once you have walked up (the name is spoken first)
  MSC.on('enter', (id) => {
    if (!SETS[id]) return;
    const dlg = () => S.chat && S.chat.dlg.id;
    const id0 = dlg();
    setTimeout(() => { if (S.active === id && dlg() === id0 && S.chat && !S.chat.log.length && S.chat.cur.npc) MSC.speech.say(S.chat.cur.npc.hanzi); }, 1100);
  });
})(window.MSC = window.MSC || {});

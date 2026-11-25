/*
 * Chat with Xiao Li — game logic only (no DOM). The screen lives in ui/chat-panel.js; the content in data/chat.js.
 *
 * Every time you walk up to Xiao Li a NEW random conversation starts (never the same one twice in a row).
 * There are no answer buttons: the player BUILDS a reply from word tiles (or types it). Every accepted phrasing
 * of every reply is expanded from the patterns in the data, matched by pinyin syllables, and decides which way the
 * conversation branches.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, P = MSC.pinyin, S = MSC.state, PT = MSC.pattern;
  const SETS = () => MSC.data.chats;
  const CH = {};

  S.chat = null;          // the conversation in progress
  S.chatLast = {};        // npc id → id of that NPC's previous conversation (so a new chat is never a repeat)
  S.chatMode = 'tiles';   // 'tiles' | 'recall'
  S.chatDone = 0;         // conversations finished this session

  const fillLine = (line, vars) => (line ? { hanzi: PT.fill(line.hanzi, vars), english: PT.fill(line.english, vars) } : null);
  const tileWords = (text) => D.segment(text).filter((t) => t.kind === 'word' || t.kind === 'number').map((t) => t.hanzi);

  /** Build one turn: resolved text, every accepted phrasing as syllables, and the shuffled tile bank. */
  function buildNode(id) {
    const n = S.chat.dlg.nodes[id], vars = S.chat.vars;
    const node = {
      id, end: !!n.end, npc: fillLine(n.npc, vars), goal: n.goal ? PT.fill(n.goal, vars) : '', tip: n.tip || '',
      replies: [], tiles: [], st: { tray: [], recall: '', heard: '', attempts: 0, hint: 0, reaction: null },
    };
    if (n.end) return node;
    n.replies.forEach((r) => {
      const variants = [...new Set(r.say.flatMap((p) => PT.expand(PT.fill(p, vars))))];
      node.replies.push({ variants, syls: variants.map((v) => D.syllables(v).map(P.fromNum)), en: PT.fill(r.en, vars), label: r.label || '', next: r.next });
    });
    // the bank holds every word any accepted phrasing needs (as many copies as the phrasing uses) + 3 distractors
    const need = new Map();
    node.replies.forEach((r) => r.variants.forEach((v) => {
      const count = new Map();
      tileWords(v).forEach((h) => count.set(h, (count.get(h) || 0) + 1));
      count.forEach((k, h) => need.set(h, Math.max(need.get(h) || 0, k)));
    }));
    const bank = [];
    need.forEach((k, h) => { for (let i = 0; i < k; i++) bank.push(h); });
    const pool = D.all().filter((e) => e.hsk && !need.has(e.hanzi) && e.hanzi.length <= 3 && e.pos !== 'particle' && e.pos !== 'phrase');
    U.shuffle(pool).slice(0, 3).forEach((e) => bank.push(e.hanzi));
    node.tiles = U.shuffle(bank);
    return node;
  }

  /** Start a given conversation with given slot values (begin() calls this with random ones). */
  CH.start = (dlg, vars, npcId = 'friend') => {
    S.chatLast[npcId] = dlg.id;
    S.chat = { npcId, set: SETS()[npcId], dlg, vars, log: [], finished: false, turns: 0, cur: null };
    S.chat.cur = buildNode(dlg.start);
    return S.chat;
  };

  /** Start a brand-new random conversation (never the one just before). */
  CH.begin = (npcId = 'friend') => {
    const C = SETS()[npcId];
    const others = C.dialogues.filter((d) => d.id !== S.chatLast[npcId]);
    const dlg = U.pick(others.length ? others : C.dialogues);
    const vars = {};
    Object.keys(dlg.slots || {}).forEach((name) => { const v = U.pick(dlg.slots[name]); vars[name] = v.hanzi; vars[`${name}.en`] = v.en; });
    return CH.start(dlg, vars, npcId);
  };

  CH.current = () => (S.chat ? S.chat.cur : null);

  /** What the player built / typed, as syllables. (The tray holds { h: word, i: index in the tile bank }.) */
  CH.userSyllables = (cur, mode) => P.parse(mode === 'recall' ? cur.st.recall : cur.st.tray.map((t) => t.h).join(''));

  /** Does this answer match any accepted phrasing? → { reply, variant } | { tonesOff } | {} */
  CH.match = (cur, user) => {
    for (const r of cur.replies) {
      for (let i = 0; i < r.variants.length; i++) {
        if (P.sameSentence(r.syls[i], user)) return { reply: r, variant: r.variants[i] };
      }
    }
    return { tonesOff: cur.replies.some((r) => r.syls.some((s) => P.sameBases(s, user))) };
  };

  /** Spoken answers: recognisers rarely get tones right, so right words in any tones are accepted (typed answers still flag tones). */
  CH.matchSpoken = (cur, user) => {
    const m = CH.match(cur, user);
    if (m.reply) return m;
    for (const r of cur.replies) for (let i = 0; i < r.variants.length; i++) if (P.sameBases(r.syls[i], user)) return { reply: r, variant: r.variants[i] };
    return {};
  };

  /** A wrong or unclear answer: a gentle reaction, and the next hint level opens. */
  CH.miss = (cur, tonesOff) => {
    const C = S.chat.set, st = cur.st;
    st.attempts++;
    st.hint = Math.max(st.hint, Math.min(st.attempts, 2));
    st.reaction = { type: 'retry', ...(tonesOff ? C.lines.tonesOff : C.lines.notUnderstood) };
  };

  /** A good answer: record the exchange and move to wherever that answer leads. */
  CH.advance = (match) => {
    const ch = S.chat, cur = ch.cur;
    if (cur.npc) ch.log.push({ who: 'npc', hanzi: cur.npc.hanzi, english: cur.npc.english });
    ch.log.push({ who: 'me', hanzi: match.variant, english: match.reply.en });
    ch.turns++;
    ch.cur = buildNode(match.reply.next);
    if (ch.cur.end) { ch.finished = true; S.chatDone++; }
    return ch.cur;
  };

  // ───────────── hints (all on demand, nothing shown by default) ─────────────
  /** "我 (wǒ) = I + 想 (xiǎng) = would like …" for one phrasing. */
  CH.clue = (variant) => D.segment(variant).filter((t) => t.kind !== 'text')
    .map((t) => `${t.hanzi} (${D.tokenPinyin(t)}) = ${D.tokenEnglish(t) || '…'}`).join(' + ');

  MSC.chat = CH;
  MSC.on('enter', (id) => { if (SETS()[id]) CH.begin(id); });
})(window.MSC = window.MSC || {});

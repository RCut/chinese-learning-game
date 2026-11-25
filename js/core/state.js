/* Shared game state, tiny event bus, progress saving and vocabulary discovery. */
(function (MSC) {
  const KEY = 'mandarin_street_corner_v5';
  const handlers = {};
  MSC.on = (evt, fn) => { (handlers[evt] = handlers[evt] || []).push(fn); };
  MSC.emit = (evt, arg) => (handlers[evt] || []).forEach((fn) => fn(arg));
  MSC.actions = MSC.actions || {};   // name → fn(arg, el); used by data-action / data-click attributes

  const S = {
    xp: 0,
    money: 0,
    displayMode: 2,        // 1 Pinyin · 2 Hybrid · 3 Hanzi
    rate: 0.85,
    voiceURI: '',
    vocab: [],             // hanzi in the order they were learned
    vocabSet: new Set(),
    fresh: new Set(),      // learned this session (highlighted)
    discoverCount: 0,
    tipSeen: false,
    revealed: new Set(),   // translations the player chose to reveal
    story: { menuChecked: false, questDone: false },
    prices: {},            // menu item id → price (fixed for the session)
    menuItems: [],
    player: { x: 4, y: 4 },
    active: null,          // 'barista' | 'menu' | … | null
    round: null,           // current café order (see js/game/barista.js)
    quizzes: {},
    inputMode: 'tiles',
    mic: { recording: false, transcript: '', msg: '', unavailable: false },
    writing: { tutorialDone: false, mastered: {}, best: {}, rules: [], offer: null, lesson: null },   // Master Wang (see js/game/writing.js)
    mastery: {},           // word / 'p:<phrase id>' → uses (see js/core/mastery.js)
    phraseSet: new Set(),  // phrases met (ids)
    hskOnly: false,        // notebook: show HSK words only
    nbTab: 'words',        // notebook: 'words' | 'phrases'
    selectedWord: null,    // notebook detail pane
    category: 'All',
  };
  MSC.state = S;

  MSC.progress = {
    load() {
      MSC.dict.all().filter((e) => e.starter).forEach((e) => { S.vocab.push(e.hanzi); S.vocabSet.add(e.hanzi); });
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!saved) return;
        S.xp = Number(saved.xp) || 0;
        S.tipSeen = !!saved.tipSeen;
        if (saved.writing && typeof saved.writing === 'object') Object.assign(S.writing, saved.writing);
        if (saved.mastery && typeof saved.mastery === 'object') S.mastery = saved.mastery;
        if (Array.isArray(saved.phrases)) saved.phrases.forEach((id) => S.phraseSet.add(id));
        (saved.words || []).forEach((h) => {
          if (MSC.dict.get(h) && !S.vocabSet.has(h)) { S.vocab.push(h); S.vocabSet.add(h); }
        });
      } catch (e) { console.warn('Could not load progress', e); }
    },
    save() {
      try {
        const starters = new Set(MSC.dict.all().filter((e) => e.starter).map((e) => e.hanzi));
        localStorage.setItem(KEY, JSON.stringify({ xp: S.xp, tipSeen: S.tipSeen, writing: S.writing, words: S.vocab.filter((h) => !starters.has(h)), mastery: S.mastery, phrases: [...S.phraseSet] }));
      } catch (e) { /* storage unavailable: progress simply isn't kept */ }
    },
  };

  MSC.vocab = {
    has: (h) => S.vocabSet.has(h),
    /** Adds a dictionary word to the notebook the first time it is seen. Returns true if it was new. */
    discover(hanzi) {
      const entry = MSC.dict.get(hanzi);
      if (!entry || S.vocabSet.has(hanzi)) return false;
      S.vocab.push(hanzi);
      S.vocabSet.add(hanzi);
      S.fresh.add(hanzi);
      S.discoverCount++;
      MSC.progress.save();
      MSC.emit('stats');
      if (MSC.log) MSC.log.word(entry);
      return true;
    },
    discoverText(text) { MSC.dict.wordsIn(text).forEach((h) => MSC.vocab.discover(h)); },
  };

  MSC.setMoney = (n) => { S.money = Math.max(0, n); MSC.emit('stats', { moneyChanged: true }); };
  MSC.addXP = (n, why) => {
    S.xp += n;
    MSC.progress.save();
    MSC.emit('stats');
    if (MSC.log) MSC.log.say(`+${n} XP — ${why}`);
  };
})(window.MSC = window.MSC || {});

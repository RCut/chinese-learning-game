/*
 * LEVELS — the journey through HSK 1, then HSK 2 (data/levels.js).
 *   MSC.levels.of(thing, kind)   the level a thing appears at ('object' | 'person' | 'dialogue' | 'menu' | 'char' | 'phrase')
 *   MSC.levels.visible(thing, kind)   is it part of the game at the player's level?
 *   MSC.levels.progress(level)   { learned, total, need, tasks: [{ text, done }], ready }
 *   MSC.levels.check()           unlocks the next level when ready (pop-up + log), called after every use and task
 * The player's level, and the tasks done, are saved with the progress.
 */
(function (MSC) {
  const D = MSC.dict, S = MSC.state, PT = MSC.pattern;
  const L = (MSC.levels = {});
  const DATA = MSC.data.levels;
  const MAX = Math.max(...Object.keys(DATA).map(Number));
  S.level = S.level || 1;
  S.flags = S.flags || {};

  const wordsOf = (t) => D.segment(t || '').filter((x) => x.kind === 'word').map((x) => x.hanzi);
  const maxLevel = (texts) => Math.max(1, ...texts.flatMap(wordsOf).map((w) => D.level(w)));
  const dlgCache = new Map();

  /** the level a thing belongs to */
  L.of = (t, kind) => {
    if (t && t.level) return t.level;
    if (kind === 'object' || kind === 'menu') return D.level(t.hanzi) || 2;
    if (kind === 'dialogue') {
      if (!dlgCache.has(t)) {
        const texts = [];
        Object.values(t.nodes).forEach((n) => {
          if (n.npc) texts.push(n.npc.hanzi.replace(/\{[\w.]+\}/g, ''));
          (n.replies || []).forEach((r) => r.say.forEach((p) => PT.expand(p.replace(/\{[\w.]+\}/g, '')).forEach((v) => texts.push(v))));
        });
        dlgCache.set(t, maxLevel(texts));
      }
      return dlgCache.get(t);
    }
    if (kind === 'char') {
      const lv = [1, 2].find((l) => D.hskWords(l).some((w) => w.includes(t.char || t)));
      return lv || 2;
    }
    if (kind === 'phrase') return t.level || 1;
    return 1;
  };
  L.visible = (t, kind) => L.of(t, kind) <= S.level;
  L.current = () => S.level;
  L.max = () => MAX;

  const TASKS = {
    ordered: () => !!(S.flags.ordered || (S.story && S.story.questDone)),
    chatted: () => !!S.flags.chatted,
    wrote: () => !!S.flags.wrote,
    family: () => !!S.flags.family,
  };

  L.progress = (lv = S.level) => {
    const d = DATA[lv];
    const words = D.hskWords(lv);
    const learned = words.filter((w) => MSC.mastery.learned(w)).length;
    const need = Math.ceil(words.length * d.learnedShare);
    const tasks = d.tasks.map((t) => ({ ...t, done: TASKS[t.id] ? TASKS[t.id]() : false }));
    return { level: lv, title: d.title, learned, total: words.length, need, tasks, ready: learned >= need && tasks.every((t) => t.done) };
  };

  /** mark a task done (e.g. 'chatted'), then see whether the next level opens */
  L.flag = (id) => { if (!S.flags[id]) { S.flags[id] = true; if (MSC.progress) MSC.progress.save(); MSC.emit('level-progress'); } L.check(); };

  L.check = () => {
    if (S.levelDoneShown === S.level) return false;
    const p = L.progress();
    if (!p.ready) return false;
    const d = DATA[S.level];
    if (S.level < MAX) S.level++; else S.levelDoneShown = S.level;
    if (MSC.progress) MSC.progress.save();
    MSC.emit('level-up', { level: S.level, title: d.unlockTitle, text: d.unlockText });
    return true;
  };

  /** for tests and tools: jump to a level */
  L.set = (n) => { S.level = Math.max(1, Math.min(MAX, n)); if (MSC.progress) MSC.progress.save(); MSC.emit('level-up', { level: S.level, silent: true }); };

  MSC.on('learned', () => L.check());
  MSC.on('writing-complete', ({ kind }) => { if (kind === 'lesson') L.flag('wrote'); });
})(window.MSC = window.MSC || {});

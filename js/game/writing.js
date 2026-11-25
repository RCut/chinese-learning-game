/*
 * Master Wang's writing lessons — game logic only (no DOM). The UI lives in ui/wang-panel.js and ui/writer.js.
 *
 * Lesson flow (ticket): offer 8 → player picks 4 → each character: Watch → Trace → Guided →
 * then all 4 go through the mastery check in random order. A failed check sends that character back through
 * Guided once and then it comes up in the check again. The lesson ends only when all 4 are mastered; only then
 * do the characters hang on the wall and their words reach the notebook.
 *
 * A "session" is what the writing tray runs: lesson, tutorial, review or practice. It exposes
 *   current() → { c, k } | null      slots() → [{c, state}]      finish(result) → note      end()
 * where k is 'watch' | 'trace' | 'guided' | 'check' | 'practice'.
 */
(function (MSC) {
  const U = MSC.util, S = MSC.state;
  const D = MSC.data.writing;
  const WR = {};

  const all = [...D.tutorial, ...D.pool];
  const SEAL_RANK = { plain: 1, red: 2, gold: 3 };
  const save = () => MSC.progress.save();
  const st = () => S.writing;

  // ───────────────────────── lookups ─────────────────────────
  WR.info = (c) => all.find((x) => x.char === c) || null;
  WR.strokeData = (c) => MSC.data.strokes[c] || null;
  WR.strokeCount = (c) => (WR.strokeData(c) ? WR.strokeData(c).strokes.length : 0);
  WR.rule = (id) => D.rules.find((r) => r.id === id);
  WR.isMastered = (c) => !!st().mastered[c];
  WR.masteredChars = () => Object.keys(st().mastered);
  WR.canWriteWord = (hanzi) => WR.masteredChars().some((c) => WR.info(c) && WR.info(c).word === hanzi);
  WR.wordFor = (c) => (WR.info(c) ? WR.info(c).word : c);

  // ───────────────────────── grading ─────────────────────────
  /** gold: clean · red: 1–2 mistakes or one hint step · plain ink: more than that. */
  WR.grade = ({ mistakes, hint }) => {
    if (mistakes === 0 && hint === 0) return 'gold';
    if (mistakes <= 2 && hint <= 1) return 'red';
    return 'plain';
  };
  /** Mastery check: at most 2 mistakes and never the hint that reveals the whole character (hint level 3). */
  WR.passes = ({ mistakes, hint }) => mistakes <= 2 && hint < 3;

  /** Keep the player's best attempt at a character (it becomes "your handwriting"). */
  WR.recordAttempt = (c, seal, strokes) => {
    const old = st().best[c];
    if (!old || SEAL_RANK[seal] >= SEAL_RANK[old.seal]) st().best[c] = { seal, strokes, t: Date.now() };
    save();
  };

  // ───────────────────────── stroke rules ─────────────────────────
  /** Unlock the rule cards a character needs (first time only). Returns the newly unlocked rules. */
  WR.unlockRules = (c) => {
    const info = WR.info(c);
    const fresh = ((info && info.rules) || []).filter((r) => !st().rules.includes(r));
    fresh.forEach((r) => st().rules.push(r));
    if (fresh.length) save();
    return fresh.map(WR.rule);
  };

  /** The tip shown for the first level of hint / after a slip on stroke `idx`. */
  WR.tipFor = (c, idx) => {
    const info = WR.info(c) || {};
    if (info.tips && info.tips[idx]) return info.tips[idx];
    const rule = WR.rule((info.rules || [])[0]);
    return rule ? `${rule.title}: ${rule.tip}` : 'Follow the stroke order Master Wang showed you.';
  };

  // ───────────────────────── offers ─────────────────────────
  const unlearned = () => D.pool.filter((p) => !WR.isMastered(p.char));
  WR.poolLeft = () => unlearned().length;

  /** 8 random unlearned characters, from the lowest tier that still has some (filling from the next tier if needed). */
  function draw() {
    const left = unlearned();
    const out = [];
    [1, 2, 3].forEach((t) => U.shuffle(left.filter((p) => p.tier === t)).forEach((p) => { if (out.length < D.offerSize) out.push(p.char); }));
    return U.shuffle(out);
  }

  WR.makeOffer = () => {
    const chars = draw();
    st().offer = chars.length ? { chars } : null;
    save();
    return st().offer;
  };
  WR.reshuffle = () => {
    const o = st().offer;
    if (!o || WR.poolLeft() <= D.lessonSize) return false;
    o.chars = draw(); save();
    return true;
  };
  WR.offer = () => st().offer || WR.makeOffer();
  /** "Let Wang choose" */
  WR.randomPick = () => U.shuffle(WR.offer().chars).slice(0, D.lessonSize);

  // ───────────────────────── sessions ─────────────────────────
  const stepsFor = (c, kinds) => kinds.map((k) => ({ c, k }));

  function lessonSession() {
    const L = st().lesson;
    const s = {
      kind: L.kind,
      title: L.kind === 'tutorial' ? 'Tutorial' : 'Lesson',
      completed: false,
      current: () => L.queue[0] || null,
      slots: () => L.chars.map((c) => ({
        c,
        state: L.mastered.includes(c) || (L.kind === 'tutorial' && !L.queue.some((q) => q.c === c)) ? 'done'
          : L.queue[0] && L.queue[0].c === c ? 'cur' : 'todo',
      })),
      started: (step) => (step.k === 'watch' ? WR.unlockRules(step.c) : []),
      finish(res) {
        const step = L.queue.shift();
        let note = '';
        if (step.k !== 'watch') WR.recordAttempt(step.c, res.seal, res.strokes);
        if (step.k === 'check') {
          if (res.passed) L.mastered.push(step.c);
          else { L.queue.push({ c: step.c, k: 'guided' }, { c: step.c, k: 'check' }); note = 'retry'; }
        }
        s.completed = L.queue.length === 0;
        save();
        return { note };
      },
      end() { if (!L.queue.length) WR.completeLesson(); },
    };
    return s;
  }

  WR.hasLesson = () => !!st().lesson;
  /** Leave a lesson in progress (not the tutorial) so a new set of characters can be chosen. Nothing is added to the wall. */
  WR.abandonLesson = () => {
    const L = st().lesson;
    if (!L || L.kind !== 'lesson') return false;
    st().lesson = null; st().offer = null; save();
    return true;
  };
  WR.lessonProgress = () => { const L = st().lesson; return L ? { done: L.mastered.length, total: L.chars.length, kind: L.kind } : null; };
  WR.continueSession = () => (st().lesson ? lessonSession() : null);

  WR.startTutorial = () => {
    const chars = D.tutorial.map((t) => t.char);
    st().lesson = { kind: 'tutorial', chars, mastered: [], queue: chars.flatMap((c) => stepsFor(c, c === '十' ? ['watch', 'trace', 'guided'] : ['watch', 'trace'])) };
    save();
    return lessonSession();
  };

  WR.startLesson = (picked) => {
    const chars = picked.slice(0, D.lessonSize);
    const queue = chars.flatMap((c) => stepsFor(c, ['watch', 'trace', 'guided']));
    U.shuffle(chars).forEach((c) => queue.push({ c, k: 'check' }));
    st().lesson = { kind: 'lesson', chars, mastered: [], queue };
    st().offer = null;
    save();
    return lessonSession();
  };

  /** All characters of a finished lesson reach the wall and the notebook together. */
  WR.completeLesson = () => {
    const L = st().lesson;
    if (!L || L.queue.length) return null;
    const now = Date.now();
    L.chars.forEach((c) => { st().mastered[c] = { last: now }; });
    if (L.kind === 'tutorial') st().tutorialDone = true;
    st().lesson = null;
    save();
    const summary = { kind: L.kind, chars: L.chars.slice() };
    MSC.emit('writing-complete', summary);
    return summary;
  };

  /** Review: a random pack of (up to) 10 characters from everything mastered, in random order — only the mastery check. */
  WR.reviewSession = () => {
    const chars = U.shuffle(WR.masteredChars()).slice(0, D.reviewSize);
    const queue = chars.map((c) => ({ c, k: 'check' }));
    const results = {};
    const s = {
      kind: 'review', title: 'Review', completed: false,
      current: () => queue[0] || null,
      slots: () => chars.map((c) => ({ c, state: c in results ? (results[c] ? 'done' : 'missed') : queue[0] && queue[0].c === c ? 'cur' : 'todo' })),
      started: () => [],
      finish(res) {
        const step = queue.shift();
        results[step.c] = res.passed;
        WR.recordAttempt(step.c, res.seal, res.strokes);
        if (res.passed) { st().mastered[step.c].last = Date.now(); save(); }   // a failed review never removes anything; it just stays first in line
        s.completed = queue.length === 0;
        return { note: '' };
      },
      end() {
        const done = Object.keys(results).length;
        if (!done) return;
        const kept = Object.values(results).filter(Boolean).length;
        MSC.log.say(`Review done: ${kept} of ${done} written from memory.`);
        MSC.emit('writing-changed');
      },
    };
    return s;
  };

  /** Practice from the notebook: Memory mode. Changes neither mastery nor the wall — only a better handwriting sample. */
  WR.practiceSession = (c) => {
    let finished = false;
    return {
      kind: 'practice', title: 'Practice', completed: false,
      current: () => (finished ? null : { c, k: 'practice' }),
      slots: () => [],
      started: () => [],
      finish(res) { finished = true; this.completed = true; WR.recordAttempt(c, res.seal, res.strokes); return { note: '' }; },
      end() { MSC.emit('writing-changed'); },
    };
  };

  MSC.writing = WR;
})(window.MSC = window.MSC || {});

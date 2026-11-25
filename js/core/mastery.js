/*
 * MASTERY — how well each word and phrase is known, from how the player USES it (not from merely seeing it).
 *
 * Every use is scored 0…1:
 *   right, no hint 1.0 · after hint 1 (pattern) 0.7 · after hint 2 (word clue) 0.4 · answer revealed / given up 0
 *   a wrong attempt before getting it right multiplies by 0.6 · building from word tiles counts ×0.85 (the words are on screen)
 *   recognition (pick the right option from a list) counts ×0.6 · listening drills ("what did you hear?") never count
 * Mastery % = a running average of the recent uses (newer ones weigh more), capped by how much evidence there is:
 *   1 use ≤ 30 % · 2 uses ≤ 50 % · 3 uses ≤ 70 % · 4+ uses ≤ 100 %, and below 85 % until it was used in 2+ different places.
 * Seen but never used = 10 %. Learned = 85 % or more. Nothing ever decays.
 *
 *   MSC.mastery.record(keys, quality, place)    keys: words (hanzi) or phrases ('p:<id>')
 *   MSC.mastery.score(key) → 0…100 · learned(key) · seen(key) · weakest(keys, n)
 */
(function (MSC) {
  const S = MSC.state;
  const M = (MSC.mastery = {});
  const KEEP = 8, ALPHA = 0.35;
  const CAPS = [0, 30, 50, 70, 100];
  M.LEARNED = 85;
  M.Q = { clean: 1, hint1: 0.7, hint2: 0.4, revealed: 0, tilesFactor: 0.85, recognitionFactor: 0.6, mistakeFactor: 0.6 };

  S.mastery = S.mastery || {};                         // key → { u: [qualities, newest last], p: [places], seen: true }
  const rec = (k) => (S.mastery[k] = S.mastery[k] || { u: [], p: [] });

  M.seen = (k) => { rec(k).seen = true; };

  M.record = (keys, q, place) => {
    const quality = Math.max(0, Math.min(1, q));
    [...new Set(keys)].forEach((k) => {
      const r = rec(k);
      const before = M.score(k);
      r.seen = true;
      r.u.push(Math.round(quality * 100) / 100);
      if (r.u.length > KEEP) r.u.shift();
      if (place && !r.p.includes(place)) r.p.push(place);
      const after = M.score(k);
      if (before < M.LEARNED && after >= M.LEARNED) MSC.emit('learned', k);
    });
    MSC.emit('mastery', keys);
    if (MSC.progress) MSC.progress.save();
  };

  M.score = (k) => {
    const r = S.mastery[k];
    if (!r || !r.u.length) return (r && r.seen) || (!String(k).startsWith('p:') && MSC.vocab && MSC.vocab.has(k)) ? 10 : 0;
    let avg = r.u[0];
    for (let i = 1; i < r.u.length; i++) avg = ALPHA * r.u[i] + (1 - ALPHA) * avg;
    let cap = CAPS[Math.min(r.u.length, 4)];
    if (r.p.length < 2) cap = Math.min(cap, M.LEARNED - 1);
    return Math.max(10, Math.round(Math.min(avg * 100, cap)));
  };
  M.learned = (k) => M.score(k) >= M.LEARNED;
  M.uses = (k) => (S.mastery[k] ? S.mastery[k].u.length : 0);
  M.places = (k) => (S.mastery[k] ? S.mastery[k].p.slice() : []);
  /** the n weakest of `keys` that have been seen (for Practice) */
  M.weakest = (keys, n) => keys.filter((k) => M.score(k) > 0).sort((a, b) => M.score(a) - M.score(b)).slice(0, n);

  /** the quality of one use, from how it went */
  M.quality = ({ hint = 0, mistakes = 0, tiles = false, recognition = false }) => {
    let q = [M.Q.clean, M.Q.hint1, M.Q.hint2, M.Q.revealed][Math.min(hint, 3)];
    if (mistakes) q *= M.Q.mistakeFactor;
    if (tiles) q *= M.Q.tilesFactor;
    if (recognition) q *= M.Q.recognitionFactor;
    return q;
  };
})(window.MSC = window.MSC || {});

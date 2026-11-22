/*
 * Stroke matching — compares what the player drew with the reference stroke (no handwriting recognition).
 * All points are [x, y] in the 1024 × 1024 board space (y down). Pure functions, no DOM.
 *
 * classify() says WHY a stroke was rejected, which is what makes the specific feedback possible:
 *   ok        matches the expected stroke
 *   order     matches a LATER stroke of the character (wrong order)
 *   direction matches the expected stroke drawn the other way round
 *   shape     matches nothing
 *   ignore    an accidental tap / tiny scribble
 */
(function (MSC) {
  const SM = {};
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  SM.length = (pts) => { let l = 0; for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]); return l; };

  /** n points evenly spaced along the path. */
  SM.resample = (pts, n) => {
    if (pts.length === 1) return Array.from({ length: n }, () => pts[0]);
    const total = SM.length(pts);
    if (total === 0) return Array.from({ length: n }, () => pts[0]);
    const step = total / (n - 1);
    const out = [pts[0]];
    let acc = 0, i = 1, prev = pts[0];
    while (out.length < n - 1 && i < pts.length) {
      const d = dist(prev, pts[i]);
      if (acc + d >= step) {
        const t = (step - acc) / d;
        prev = [prev[0] + (pts[i][0] - prev[0]) * t, prev[1] + (pts[i][1] - prev[1]) * t];
        out.push(prev); acc = 0;
      } else { acc += d; prev = pts[i]; i++; }
    }
    while (out.length < n) out.push(pts[pts.length - 1]);
    return out;
  };

  /** Reduce a drawn path to at most n points (for saving the player's handwriting). Integers only. */
  SM.simplify = (pts, n = 14) => SM.resample(pts, Math.min(n, Math.max(2, pts.length))).map((p) => [Math.round(p[0]), Math.round(p[1])]);

  /** Reference centre lines are stored y-up; the board is y-down. */
  SM.screenMedians = (data) => data.medians.map((m) => m.map((p) => [p[0], 900 - p[1]]));

  /** Moving-average smoothing, so tremor doesn't inflate the measured length. */
  SM.smooth = (pts) => {
    const d = SM.resample(pts, 30);
    return d.map((_, i) => {
      let x = 0, y = 0, n = 0;
      for (let k = Math.max(0, i - 3); k <= Math.min(29, i + 3); k++) { x += d[k][0]; y += d[k][1]; n++; }
      return [x / n, y / n];
    });
  };

  const N = 24;
  const cos = (a, b) => (a[0] * b[0] + a[1] * b[1]) / ((Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1])) || 1);

  /** Does `drawn` follow `ref`? `lenient` scales the tolerances (1 = normal). */
  SM.match = (drawn, ref, lenient = 1) => {
    const dl = SM.length(SM.smooth(drawn)), rl = SM.length(ref);
    const d = SM.resample(drawn, N), r = SM.resample(ref, N);
    const endTol = 210 * lenient, avgTol = 150 * lenient;
    if (dist(d[0], r[0]) > endTol || dist(d[N - 1], r[N - 1]) > endTol) return false;
    let avg = 0;
    for (let i = 0; i < N; i++) avg += dist(d[i], r[i]);
    if (avg / N > avgTol) return false;
    if (rl > 150) {                                   // short dots are judged by position only
      const ratio = dl / rl;
      if (ratio < (rl < 350 ? 0.15 : 0.45) || ratio > 2.6) return false;   // dots are often flicked short
      const dv = [d[N - 1][0] - d[0][0], d[N - 1][1] - d[0][1]];
      const rv = [r[N - 1][0] - r[0][0], r[N - 1][1] - r[0][1]];
      if (Math.hypot(rv[0], rv[1]) > 120 && Math.hypot(dv[0], dv[1]) > 60 && cos(dv, rv) < 0.2) return false;
    }
    return true;
  };

  /**
   * @param drawn    the player's points
   * @param medians  screen-space centre lines of ALL strokes (SM.screenMedians)
   * @param idx      index of the stroke the player should draw next
   */
  SM.classify = (drawn, medians, idx) => {
    const expected = medians[idx];
    const len = SM.length(drawn);
    if (len < 25) return { kind: 'ignore' };            // an accidental tap
    if (SM.match(drawn, expected)) return { kind: 'ok' };
    for (let j = idx + 1; j < medians.length; j++) if (SM.match(drawn, medians[j])) return { kind: 'order', index: j };
    if (SM.match(drawn.slice().reverse(), expected)) return { kind: 'direction' };
    return { kind: 'shape' };
  };

  MSC.strokes = SM;
})(window.MSC = window.MSC || {});

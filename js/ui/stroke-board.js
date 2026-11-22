/*
 * StrokeBoard — an SVG writing canvas (米字格 grid) for one character.
 * Used by the writing tray (interactive) and by the notebook's "How to write" section (animation only).
 * The board does not judge strokes; it reports what was drawn (onDraw) and the controller decides
 * (js/core/stroke-match.js), then calls accept() / reject(). Everything is drawn in a 1024 × 1024 space.
 */
(function (MSC) {
  const NS = 'http://www.w3.org/2000/svg';
  const SM = MSC.strokes;
  const INK = '#2c241e', RAD = '#d97706', HINT = '#f97316';
  const FLIP = 'scale(1,-1) translate(0,-900)';           // stroke outlines are stored y-up
  let uid = 0;

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  };
  const pathD = (pts) => `M ${pts.map((p) => `${Math.round(p[0])} ${Math.round(p[1])}`).join(' L ')}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const GRID = `<g fill="none" stroke="#e8cdbf" stroke-width="6">
      <rect x="4" y="4" width="1016" height="1016" stroke="#d6a590" stroke-width="10"/>
      <path d="M512 4V1020M4 512H1020M4 4L1020 1020M1020 4L4 1020" stroke-dasharray="26 20"/></g>`;

  class StrokeBoard {
    constructor(host, ch, opts = {}) {
      this.ch = ch;
      this.opts = opts;
      this.data = MSC.data.strokes[ch];
      this.med = SM.screenMedians(this.data);
      this.n = this.data.strokes.length;
      this.rad = new Set(this.data.rad || []);
      this.id = `sb${++uid}`;
      this.idx = 0;               // number of strokes drawn so far
      this.user = [];             // the player's accepted strokes (simplified), same order
      this.token = 0;
      this.enabled = false;
      this.onDraw = null;
      this.host = host;
      host.innerHTML = `<svg class="sboard" viewBox="0 0 1024 1024" role="img" aria-label="Writing grid for ${ch}">
        <defs></defs>
        <rect width="1024" height="1024" fill="#fffdf8"/>${GRID}
        <g class="sb-outline" transform="${FLIP}" fill="#ddd8d2"></g>
        <g class="sb-done" transform="${FLIP}"></g>
        <g class="sb-flash" transform="${FLIP}"></g>
        <g class="sb-start"></g>
        <g class="sb-user" fill="none" stroke="${INK}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"></g>
        <g class="sb-fade" fill="none" stroke="#e11d48" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"></g>
        <g class="sb-nums"></g></svg>`;
      this.svg = host.firstElementChild;
      const q = (c) => this.svg.querySelector(`.${c}`);
      this.defs = this.svg.querySelector('defs');
      this.gOutline = q('sb-outline'); this.gDone = q('sb-done'); this.gFlash = q('sb-flash');
      this.gStart = q('sb-start'); this.gUser = q('sb-user'); this.gFade = q('sb-fade'); this.gNums = q('sb-nums');
      this.data.strokes.forEach((d) => el('path', { d }, this.gOutline));
      this.gOutline.style.opacity = 0;
      this.gOutline.style.transition = 'opacity .25s';
      this._bindPointer();
    }

    // ───────────── drawing input ─────────────
    _bindPointer() {
      const svg = this.svg;
      let cur = null, curEl = null;
      const pt = (e) => { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 1024, ((e.clientY - r.top) / r.height) * 1024]; };
      svg.addEventListener('pointerdown', (e) => {
        if (!this.enabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* not capturable: fine */ }
        cur = [pt(e)];
        curEl = el('path', { d: pathD([cur[0], cur[0]]) }, this.gUser);
      });
      svg.addEventListener('pointermove', (e) => {
        if (!cur) return;
        e.preventDefault();
        cur.push(pt(e));
        curEl.setAttribute('d', pathD(cur));
      });
      const end = (e) => {
        if (!cur) return;
        const pts = cur;
        cur = null;
        if (curEl) { curEl.remove(); curEl = null; }
        if (e.type !== 'pointercancel' && this.enabled && this.onDraw) this.onDraw(pts);
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      svg.addEventListener('touchmove', (e) => { if (this.enabled) e.preventDefault(); }, { passive: false });   // never scroll/zoom while writing
      svg.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setEnabled(on) { this.enabled = !!on; }
    setOutline(on) { this.gOutline.style.opacity = on ? 1 : 0; }

    // ───────────── strokes ─────────────
    /** Draw reference stroke i in the done layer. ms > 0 animates it being brushed on. */
    async drawStroke(i, { ms = 0, color } = {}) {
      const g = el('g', { 'data-i': i }, this.gDone);
      const path = el('path', { d: this.data.strokes[i], fill: color || (this.opts.radical && this.rad.has(i) ? RAD : INK) }, g);
      if (!ms) return;
      const len = SM.length(this.data.medians[i]) + 6;
      const mid = `${this.id}m${i}`;
      const mask = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: -300, y: -300, width: 1700, height: 1700 }, this.defs);
      const mp = el('path', {
        d: pathD(this.data.medians[i]), fill: 'none', stroke: '#fff', 'stroke-width': 190, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': len, 'stroke-dashoffset': len,
      }, mask);
      path.setAttribute('mask', `url(#${mid})`);
      if (mp.animate) mp.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, fill: 'forwards', easing: 'ease-in-out' });
      else mp.setAttribute('stroke-dashoffset', 0);
      await sleep(ms);
    }

    _number(i) {
      const p = this.med[i][0];
      const g = el('g', { class: 'sb-num' }, this.gNums);
      el('circle', { cx: p[0], cy: p[1], r: 38, fill: '#fff', stroke: RAD, 'stroke-width': 8 }, g);
      const t = el('text', { x: p[0], y: p[1] + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 46, 'font-weight': 700, fill: '#92400e' }, g);
      t.textContent = i + 1;
    }

    /** Remove everything drawn, then redraw the first `count` reference strokes (used by Undo / Clear). */
    reset(count = 0) {
      this.token++;
      this.gDone.innerHTML = ''; this.gFlash.innerHTML = ''; this.gStart.innerHTML = ''; this.gUser.innerHTML = ''; this.gFade.innerHTML = ''; this.gNums.innerHTML = '';
      this.defs.innerHTML = '';
      for (let i = 0; i < count; i++) { this.drawStroke(i); if (this.opts.numbers) this._number(i); }
      this.idx = count;
      this.user.length = Math.min(this.user.length, count);
    }

    /** The controller accepted the player's stroke: snap it to the clean reference shape. */
    accept(points) {
      this.user.push(SM.simplify(points, 14));
      const i = this.idx++;
      this.drawStroke(i);
      const g = this.gDone.lastElementChild;
      if (g && g.animate) g.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160 });
      this.clearHints();
    }

    /** The player's stroke was wrong: it fades out in red. */
    reject(points) {
      const p = el('path', { d: pathD(points.length > 1 ? points : [points[0], points[0]]) }, this.gFade);
      if (p.animate) p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' }).onfinish = () => p.remove();
      else setTimeout(() => p.remove(), 700);
    }

    // ───────────── hints ─────────────
    clearHints() { this.gStart.innerHTML = ''; }

    /** Orange dot at the start of stroke i with an arrow along its first direction. */
    showStart(i) {
      this.clearHints();
      if (i >= this.n) return;
      const r = SM.resample(this.med[i], 8);
      const a = r[0], b = r[Math.min(3, r.length - 1)];
      let vx = b[0] - a[0], vy = b[1] - a[1];
      const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
      const tip = [a[0] + vx * 150, a[1] + vy * 150];
      const g = el('g', { class: 'sb-pulse' }, this.gStart);
      el('line', { x1: a[0], y1: a[1], x2: tip[0], y2: tip[1], stroke: HINT, 'stroke-width': 22, 'stroke-linecap': 'round' }, g);
      const nx = -vy, ny = vx;
      el('polygon', { points: `${tip[0] + vx * 34},${tip[1] + vy * 34} ${tip[0] + nx * 30},${tip[1] + ny * 30} ${tip[0] - nx * 30},${tip[1] - ny * 30}`, fill: HINT }, g);
      el('circle', { cx: a[0], cy: a[1], r: 34, fill: HINT, stroke: '#fff', 'stroke-width': 8 }, g);
    }

    /** Flash the correct stroke once. */
    flashStroke(i) {
      if (i >= this.n) return;
      const p = el('path', { d: this.data.strokes[i], fill: '#f59e0b' }, this.gFlash);
      if (p.animate) p.animate([{ opacity: 0 }, { opacity: 0.95 }, { opacity: 0.95 }, { opacity: 0 }], { duration: 1100, easing: 'ease-in-out' }).onfinish = () => p.remove();
      else setTimeout(() => p.remove(), 1100);
    }

    // ───────────── animation ─────────────
    /** Draw the whole character stroke by stroke. Resolves true if it ran to the end (false if interrupted). */
    async animateAll({ numbers = this.opts.numbers, speed = 1, gap = 220 } = {}) {
      this.reset(0);
      const my = this.token;
      for (let i = 0; i < this.n; i++) {
        if (this.token !== my) return false;
        if (numbers) this._number(i);
        const ms = Math.max(380, Math.min(950, SM.length(this.data.medians[i]) * 1.15)) / speed;
        await this.drawStroke(i, { ms });
        if (this.token !== my) return false;
        this.idx = i + 1;
        await sleep(gap / speed);
      }
      return this.token === my;
    }

    showAll(numbers) {
      this.reset(0);
      for (let i = 0; i < this.n; i++) { this.drawStroke(i); if (numbers) this._number(i); }
      this.idx = this.n;
    }

    /** Add the next stroke (wraps around to empty after the last one). */
    async stepForward() {
      if (this.idx >= this.n) { this.reset(0); return; }
      const my = ++this.token;
      const i = this.idx;
      if (this.opts.numbers) this._number(i);
      this.idx = i + 1;
      await this.drawStroke(i, { ms: 450 });
      return my;
    }

    destroy() { this.token++; this.enabled = false; this.onDraw = null; this.host.innerHTML = ''; }

    // ───────────── static renderers ─────────────
    /** The player's own handwriting as SVG markup (a saved attempt). */
    static handwritingSvg(strokes, { grid = true } = {}) {
      const lines = (strokes || []).map((s) => `<path d="${pathD(s.length > 1 ? s : [s[0], s[0]])}"/>`).join('');
      return `<svg class="hw-svg" viewBox="0 0 1024 1024" aria-hidden="true"><rect width="1024" height="1024" fill="#fffdf8"/>${grid ? GRID : ''}
        <g fill="none" stroke="${INK}" stroke-width="50" stroke-linecap="round" stroke-linejoin="round">${lines}</g></svg>`;
    }

    /** The reference character as SVG markup. */
    static referenceSvg(ch) {
      const d = MSC.data.strokes[ch];
      if (!d) return '';
      return `<svg class="hw-svg" viewBox="0 0 1024 1024" aria-hidden="true"><rect width="1024" height="1024" fill="#fffdf8"/>${GRID}
        <g transform="${FLIP}" fill="${INK}">${d.strokes.map((p) => `<path d="${p}"/>`).join('')}</g></svg>`;
    }

    static sealHtml(seal, label) {
      const name = { gold: 'Gold seal', red: 'Red seal', plain: 'Plain ink' }[seal] || '';
      return `<span class="seal seal-${seal}" title="${name}" aria-label="${name}">${label || '印'}</span>`;
    }
  }

  MSC.StrokeBoard = StrokeBoard;
})(window.MSC = window.MSC || {});

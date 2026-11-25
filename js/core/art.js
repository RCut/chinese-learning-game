/*
 * ART — the game's pixel art, drawn in code (no image files, no emoji: it looks the same on every device).
 * Style: 16×16 tiles, objects 16×16 (or 16×24 when tall), people 16×24; warm, soft, outlined — in the spirit of cosy farming games.
 *
 * Pure data + pixel arrays (no DOM until a canvas is asked for), so the validator can load it in node.
 *
 * DEFINING A SPRITE  (in data/art/*.js)
 *   MSC.art.draw('cup', (g, c) => { … }, { w: 16, h: 16 })    paint with shapes (see Painter below); c = colour helpers
 *   MSC.art.pix('cup', { k: '#3b2a1d', w: '#fff' }, [ '....kkkk....', … ])   ASCII rows: '.' = transparent, other chars = palette keys
 *   MSC.art.person('barista', { skin, hair, hairStyle, top, bottom, apron, hat, beard, glasses, bag, robe })
 *   MSC.art.tile('G', [ (g, c, rnd) => …, …variants ], 'street')   a 16×16 ground tile (3rd arg: a stage id for a stage-only tile)
 *
 * A sprite is looked up by key: an object's `sprite` field (default: its id); a person's/door's `sprite` (default: its id).
 *
 * Painter  g.px(x,y,col) · rect(x,y,w,h,col) · frame(x,y,w,h,col) · hline · vline · line(x0,y0,x1,y1,col)
 *          disc(cx,cy,r,col) · ellipse(cx,cy,rx,ry,col) · outline([col]) (1px outline, auto-darkened; default on) · get(x,y)
 * Colours  c.lt(col,t) lighten · c.dk(col,t) darken · c.mix(a,b,t)
 */
(function (MSC) {
  const A = (MSC.art = { size: 16, defs: {}, tiles: {}, order: [] });

  // ───────── colour helpers ─────────
  const toRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (r, g, b) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
  const mix = (a, b, t) => { const x = toRgb(a), y = toRgb(b); return toHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t); };
  const C = (A.c = { mix, lt: (c, t = 0.25) => mix(c, '#ffffff', t), dk: (c, t = 0.25) => mix(c, '#000000', t) });

  // ───────── painter: a w×h grid of colours (null = transparent) ─────────
  class Painter {
    constructor(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
    get(x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.p[y * this.w + x]; }
    px(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; return this; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); return this; }
    frame(x, y, w, h, c) { this.hline(x, y, w, c).hline(x, y + h - 1, w, c).vline(x, y, h, c).vline(x + w - 1, y, h, c); return this; }
    hline(x, y, n, c) { for (let i = 0; i < n; i++) this.px(x + i, y, c); return this; }
    vline(x, y, n, c) { for (let j = 0; j < n; j++) this.px(x, y + j, c); return this; }
    line(x0, y0, x1, y1, c) {
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, x = x0, y = y0;
      for (let n = 0; n < 200; n++) { this.px(x, y, c); if (x === x1 && y === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x += sx; } if (e2 <= dx) { err += dx; y += sy; } }
      return this;
    }
    ellipse(cx, cy, rx, ry, c) {                     // cx,cy may be x.5 (centre between pixels)
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx - 0.5) / rx, dy = (y + 0.5 - cy - 0.5) / ry;
        if (dx * dx + dy * dy <= 1.02) this.px(x, y, c);
      }
      return this;
    }
    disc(cx, cy, r, c) { return this.ellipse(cx, cy, r, r, c); }
    /** a 1px outline around everything painted so far (colour: given, or a darkened neighbour) */
    outline(col) {
      const add = [];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => this.get(x + dx, y + dy)).filter(Boolean);
        if (n.length) add.push([x, y, col || C.dk(n[0], 0.62)]);
      }
      add.forEach(([x, y, c]) => this.px(x, y, c));
      return this;
    }
  }
  A.Painter = Painter;

  const rngFrom = (seed) => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 10000) / 10000; }; };

  function store(key, p, meta) {
    if (!A.defs[key]) A.order.push(key);
    A.defs[key] = { key, w: p.w, h: p.h, p: p.p, meta: meta || {} };
    return A.defs[key];
  }

  /** Paint a sprite with shapes. opts: { w = 16, h = 16, outline = true, shadow = true } */
  A.draw = (key, fn, opts = {}) => {
    const g = new Painter(opts.w || 16, opts.h || 16);
    fn(g, C);
    if (opts.outline !== false) g.outline(opts.outlineColor);
    return store(key, g, { shadow: opts.shadow !== false });
  };

  /** A sprite from ASCII rows. '.' and ' ' are transparent; every other character is a palette key. */
  A.pix = (key, pal, rows, opts = {}) => {
    const w = Math.max(...rows.map((r) => r.length)), g = new Painter(opts.w || w, opts.h || rows.length);
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && ch !== ' ') { if (!pal[ch]) throw new Error(`art ${key}: no palette colour "${ch}"`); g.px(x, y, pal[ch]); } }));
    if (opts.outline) g.outline(opts.outlineColor);
    return store(key, g, { shadow: opts.shadow !== false, rowsOk: rows.every((r) => r.length === w) });
  };

  /** A ground tile 16×16: a list of variant painters (chosen by position). `stage` = a tile only for that stage. */
  A.tile = (letter, variants, stage) => {
    const id = stage ? `${stage}:${letter}` : letter;
    A.tiles[id] = variants.map((fn, i) => { const g = new Painter(16, 16); fn(g, C, rngFrom(letter.charCodeAt(0) * 31 + i * 7 + 3), i); return { w: 16, h: 16, p: g.p }; });
    return A.tiles[id];
  };
  A.tileFor = (stage, letter) => A.tiles[`${stage}:${letter}`] || A.tiles[letter] || null;

  // ───────── people: 16×24, big head, short body ─────────
  /**
   * opts: skin, hair, hairStyle 'short'|'bun'|'long'|'bald'|'cap', top, bottom, shoes, apron (colour), hat (colour), brim,
   *       beard (colour), glasses, bag (colour), robe (colour), sash, cheeks
   */
  A.person = (key, o = {}) => {
    const skin = o.skin || '#f2c7a0', hair = o.hair || '#3b2a1d', top = o.top || '#4a7fb0', bottom = o.bottom || '#3d3a5c', shoes = o.shoes || '#3b2a1d';
    const g = new Painter(16, 24);
    // backpack / bag (behind the body)
    if (o.bag) { g.rect(2, 12, 3, 7, o.bag).rect(11, 12, 3, 7, C.dk(o.bag, 0.15)); }
    // legs
    if (!o.robe) { g.rect(5, 19, 2, 4, bottom).rect(9, 19, 2, 4, bottom).rect(4, 22, 3, 2, shoes).rect(9, 22, 3, 2, shoes); }
    else { g.rect(4, 12, 8, 11, o.robe).rect(4, 22, 3, 2, shoes).rect(9, 22, 3, 2, shoes); }
    // body + arms
    if (!o.robe) g.rect(4, 12, 8, 8, top);
    g.rect(3, 13, 2, 5, o.robe || top).rect(11, 13, 2, 5, o.robe || top).px(3, 18, skin).px(4, 18, skin).px(11, 18, skin).px(12, 18, skin);
    if (o.robe) g.rect(3, 13, 2, 6, o.robe).rect(11, 13, 2, 6, o.robe).rect(7, 12, 2, 4, C.lt(o.robe, 0.25));      // open collar
    if (o.sash) g.rect(4, 17, 8, 2, o.sash);
    if (o.apron) { g.rect(5, 14, 6, 6, o.apron).rect(5, 12, 1, 2, o.apron).rect(10, 12, 1, 2, o.apron).hline(5, 14, 6, C.lt(o.apron, 0.35)); }
    // head
    g.rect(4, 3, 8, 8, skin).rect(5, 2, 6, 10, skin).rect(3, 5, 10, 4, skin).px(4, 11, null).px(11, 11, null);
    g.px(3, 7, skin).px(12, 7, skin);
    // face
    g.px(5, 7, '#2b1d14').px(10, 7, '#2b1d14').px(5, 8, '#2b1d14').px(10, 8, '#2b1d14');
    if (o.glasses) { g.frame(4, 6, 3, 3, o.glasses).frame(9, 6, 3, 3, o.glasses).px(7, 7, o.glasses).px(8, 7, o.glasses); g.px(5, 7, '#2b1d14').px(10, 7, '#2b1d14'); }
    g.px(7, 10, C.dk(skin, 0.3)).px(8, 10, C.dk(skin, 0.3));
    if (o.cheeks !== false) { g.px(4, 9, C.mix(skin, '#ff7b7b', 0.45)).px(11, 9, C.mix(skin, '#ff7b7b', 0.45)); }
    if (o.beard) { g.rect(5, 10, 6, 2, o.beard).rect(6, 12, 4, 1, o.beard).px(7, 10, C.dk(skin, 0.3)).px(8, 10, C.dk(skin, 0.3)); g.rect(5, 9, 1, 1, o.beard).rect(10, 9, 1, 1, o.beard); }
    // hair / hat
    const st = o.hairStyle || 'short';
    if (st === 'short' || st === 'cap') { g.rect(4, 1, 8, 3, hair).rect(3, 3, 2, 4, hair).rect(11, 3, 2, 4, hair).rect(5, 0, 6, 2, hair).hline(5, 4, 3, hair); g.px(9, 4, hair).px(10, 4, hair); }
    if (st === 'bun') { g.rect(4, 1, 8, 3, hair).rect(3, 3, 2, 5, hair).rect(11, 3, 2, 5, hair).rect(5, 0, 6, 2, hair).disc(7.5, 0.5, 2, hair).hline(5, 4, 6, hair); }
    if (st === 'long') { g.rect(4, 1, 8, 3, hair).rect(3, 3, 2, 9, hair).rect(11, 3, 2, 9, hair).rect(5, 0, 6, 2, hair).hline(5, 4, 6, hair); }
    if (st === 'bald') { g.rect(5, 1, 6, 2, C.dk(skin, 0.05)).px(3, 6, hair).px(12, 6, hair).px(3, 7, hair).px(12, 7, hair); }
    if (o.hat) {                                                  // a brimmed or flat hat
      g.rect(3, 2, 10, 2, o.hat).rect(4, 0, 8, 3, o.hat);
      if (o.brim !== false) g.rect(2, 3, 12, 1, C.dk(o.hat, 0.15));
      g.hline(4, 3, 8, C.lt(o.hat, 0.2));
    }
    g.outline();
    return store(key, g, { shadow: true, person: true });
  };

  // ───────── lookups, canvases, thumbnails (browser only) ─────────
  A.has = (key) => !!A.defs[key];
  const canvasOf = (def, scale = 1, crop) => {
    const sy = crop ? crop[0] : 0, sh = crop ? crop[1] : def.h;
    const cv = document.createElement('canvas');
    cv.width = def.w * scale; cv.height = sh * scale;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let y = sy; y < sy + sh; y++) for (let x = 0; x < def.w; x++) {
      const c = def.p[y * def.w + x];
      if (c) { ctx.fillStyle = c; ctx.fillRect(x * scale, (y - sy) * scale, scale, scale); }
    }
    return cv;
  };
  const cache = {};
  /** 1× canvas of a sprite (cached) — for Phaser textures */
  A.canvas = (key) => { if (!cache[key]) cache[key] = canvasOf(A.defs[key], 1); return cache[key]; };
  A.tileCanvas = (def) => { if (!def._cv) def._cv = canvasOf(def, 1); return def._cv; };
  /** data: URL of a sprite at `scale`× (nearest-neighbour); portrait=true crops people to head and shoulders */
  A.url = (key, scale = 3, portrait = false) => {
    const def = A.defs[key];
    if (!def) return '';
    const k = `${key}@${scale}${portrait ? 'p' : ''}`;
    if (!cache[k]) cache[k] = canvasOf(def, scale, portrait && def.meta.person ? [0, 15] : null).toDataURL();
    return cache[k];
  };
  /** an <img> for panels, pills and headers */
  A.img = (key, scale = 3, portrait = true) => `<img class="px" src="${A.url(key, scale, portrait)}" alt="" draggable="false">`;
})(window.MSC = window.MSC || {});

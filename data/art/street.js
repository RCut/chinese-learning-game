/* ART for the street stage: its objects, people, doors and its own ground tiles. See js/core/art.js (how to draw) and tools/art-sheet.js (preview). */
(function (MSC) {
  const A = MSC.art;
  const INK = '#3b2a1d', WOOD = '#b9854f', WOOD_D = '#8a5a33', CREAM = '#f3e9d2', STEEL = '#9aa3ab', GLASS = '#a9dbe6';
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };
  const ring = (g, cx, cy, r, col) => { for (let a = 0; a < 48; a++) g.px(cx + Math.cos(a / 48 * 6.2832) * r, cy + Math.sin(a / 48 * 6.2832) * r, col); };

  // ───────────── ground tiles for the street ─────────────
  // T — tiled roof line (row 0): rows of terracotta tiles
  A.tile('T', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#b4573a');
    for (let row = 0; row < 4; row++) {
      const y = row * 4, off = (row + v) % 2 ? 4 : 0;
      g.hline(0, y + 3, 16, '#7a3322');
      for (let x = off; x < 16; x += 8) { g.vline(x, y, 3, '#8f4029'); g.hline(x + 1, y, 3, '#d27a55'); }
    }
    speckle(g, r, 6, ['#c4694a', '#a24a30']);
    g.hline(0, 15, 16, '#5e2616');
  }), 'street');

  // N — plaster wall of the shop row (row 1): window with shutters / lantern / plain
  A.tile('N', [
    (g) => {
      g.rect(0, 0, 16, 16, '#efe3cc'); g.hline(0, 0, 16, '#c9a67a').hline(0, 15, 16, '#d8c7a6');
      g.rect(3, 3, 10, 9, WOOD_D); g.rect(4, 4, 8, 7, GLASS); g.vline(8, 4, 7, WOOD_D).hline(4, 7, 8, WOOD_D);
      g.px(5, 5, '#ffffff').px(9, 5, '#e6f6fa'); g.rect(2, 3, 1, 9, '#5f8f5a').rect(13, 3, 1, 9, '#5f8f5a');
      g.rect(3, 12, 10, 2, '#a07040'); g.hline(4, 12, 3, '#d0453a').px(8, 12, '#e86f8a').px(10, 12, '#f2c230');
    },
    (g, c, r) => {
      g.rect(0, 0, 16, 16, '#efe3cc'); g.hline(0, 0, 16, '#c9a67a').hline(0, 15, 16, '#d8c7a6');
      g.vline(7, 0, 3, INK); g.rect(5, 3, 6, 7, '#d9482b'); g.rect(6, 4, 4, 5, '#f26b43'); g.hline(5, 3, 6, '#f2c230').hline(5, 9, 6, '#f2c230'); g.vline(7, 10, 3, '#f2c230').px(8, 12, '#f2c230');
      g.px(4, 13, '#e0d2b4').px(12, 13, '#e0d2b4');
    },
    (g, c, r) => {
      g.rect(0, 0, 16, 16, '#efe3cc'); g.hline(0, 0, 16, '#c9a67a').hline(0, 15, 16, '#d8c7a6');
      g.rect(2, 4, 12, 8, WOOD_D); g.rect(3, 5, 4, 6, GLASS); g.rect(9, 5, 4, 6, GLASS); g.px(4, 6, '#fff').px(10, 6, '#fff');
      g.rect(1, 12, 14, 2, '#a07040'); g.px(3, 11, '#f26b8a').px(4, 11, '#5f8f5a').px(11, 11, '#f2c230').px(12, 11, '#5f8f5a');
    },
  ], 'street');

  // D — door step under the shop doors
  A.tile('D', [(g, c, r) => {
    g.rect(0, 0, 16, 16, '#c9b896'); g.rect(0, 11, 16, 5, '#a89678'); g.hline(0, 11, 16, '#e3d5b6'); g.hline(0, 15, 16, '#7d6c52');
    speckle(g, r, 8, ['#d6c7a5', '#b6a583']);
  }], 'street');

  // K — pavement edge with a kerb stone (row 6, next to the road)
  A.tile('K', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#d9d1c2');
    for (const x of [0, 8]) { g.vline(x, 0, 8, '#c4baa7'); }
    g.hline(0, 7, 16, '#c4baa7'); speckle(g, r, 8, ['#e6dfd2', '#cfc6b4']);
    g.rect(0, 9, 16, 5, '#ece6d8'); g.hline(0, 9, 16, '#fbf8ee'); g.hline(0, 13, 16, '#b9af9a'); g.hline(0, 14, 16, '#7d776c'); g.hline(0, 15, 16, '#4d4944');
    for (let x = 4 + v * 3; x < 16; x += 8) g.vline(x, 10, 3, '#cfc8b8');
  }), 'street');

  // Y — bus-stop paving: warm tint with a yellow tactile strip
  A.tile('Y', [(g, c, r) => {
    g.rect(0, 0, 16, 16, '#d7c9b0');
    for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) { g.hline(x, y, 8, '#bfae92').vline(x, y, 8, '#bfae92'); }
    g.rect(0, 11, 16, 3, '#e8c24a'); for (let x = 1; x < 16; x += 3) { g.px(x, 12, '#b8932a'); }
    speckle(g, r, 6, ['#e3d6bd', '#cbbd9f']);
  }], 'street');

  // Z — road under the zebra crossing (the white stripes are board texture on top)
  A.tile('Z', [(g, c, r) => { g.rect(0, 0, 16, 16, '#58544f'); speckle(g, r, 26, ['#625e58', '#4d4944', '#69645d']); }], 'street');

  // ───────────── doors (16×16) ─────────────
  const awning = (g, a, b) => {
    for (let x = 0; x < 16; x++) { const s = (x >> 2) % 2 ? b : a; g.vline(x, 0, 4, s); g.vline(x, 4, (x % 4 === 0 || x % 4 === 3) ? 1 : 2, s); }
    g.hline(0, 0, 16, A.c.dk(a, 0.3)); g.hline(0, 4, 16, 'rgba(0,0,0,.15)');
  };
  const wall = (g) => { g.rect(0, 0, 16, 16, '#efe3cc'); g.vline(0, 0, 16, '#d8c7a6'); g.vline(15, 0, 16, '#d8c7a6'); };

  A.draw('door-cafe', (g) => {
    wall(g); awning(g, '#c9812c', CREAM);
    g.rect(4, 7, 8, 9, '#6e4727'); g.rect(5, 8, 6, 5, GLASS); g.rect(5, 13, 6, 3, '#8a5a33'); g.px(10, 14, '#f2c230');
    g.rect(6, 10, 3, 2, '#ffffff').px(9, 10, '#ffffff').px(6, 12, '#d8d0c0').px(8, 12, '#d8d0c0').rect(7, 12, 1, 1, '#d8d0c0');   // a cup in the window
    g.px(7, 8, '#ffffff').px(8, 9, '#ffffff');                                                                                   // steam
    g.rect(1, 9, 2, 4, '#7a5a3a').px(1, 8, '#e03a3a');
  }, { shadow: false });

  A.draw('door-shop', (g) => {
    wall(g); awning(g, '#3b4a8c', CREAM);
    g.rect(4, 7, 8, 9, '#7a3b2a'); g.rect(5, 8, 6, 6, '#e9d9b4'); g.frame(5, 8, 6, 6, '#c9a227');
    g.line(6, 13, 10, 9, WOOD_D); g.px(10, 9, INK).px(9, 9, INK).px(10, 10, INK);                                                // a writing brush
    g.px(7, 12, INK).px(8, 12, INK);
    g.rect(1, 8, 2, 6, CREAM).hline(1, 8, 2, '#8a5a33').hline(1, 13, 2, '#8a5a33').px(1, 10, INK).px(2, 11, INK).px(1, 14, '#d9482b'); // hanging scroll
    g.px(13, 10, '#d9482b').px(13, 11, '#d9482b');
  }, { shadow: false });

  A.draw('door-market', (g) => {
    wall(g); awning(g, '#3f8f52', CREAM);
    g.rect(2, 7, 7, 9, '#5a3d2a'); g.rect(3, 8, 5, 8, '#8a5a33'); g.hline(3, 11, 5, '#5a3d2a'); g.px(4, 9, '#e0603a').px(6, 9, '#f2c230').px(5, 13, '#7ab648');
    g.rect(10, 11, 5, 5, '#c9955a'); g.hline(10, 11, 5, '#e3b783'); g.hline(10, 13, 5, '#8a5a33'); g.vline(12, 12, 4, '#8a5a33');   // a basket
    g.px(10, 10, '#d9482b').px(11, 9, '#d9482b').px(12, 10, '#f2994a').px(13, 9, '#f2994a').px(14, 10, '#7ab648').px(11, 10, '#e86f3a').px(13, 10, '#d9482b');
  }, { shadow: false });

  // ───────────── signpost (16×24) ─────────────
  A.draw('signpost', (g) => {
    g.rect(7, 3, 2, 21, WOOD_D); g.vline(7, 3, 21, '#a8723f'); g.rect(5, 22, 6, 2, '#8c8274');
    g.rect(3, 3, 9, 5, '#d9a066'); g.px(12, 4, '#d9a066').px(12, 6, '#d9a066').rect(12, 5, 2, 1, '#d9a066'); g.hline(3, 3, 9, '#ecc088'); g.hline(3, 7, 9, '#a8723f'); g.px(4, 5, WOOD_D).px(5, 5, WOOD_D).px(6, 5, WOOD_D);
    g.rect(5, 10, 9, 5, '#c98a50'); g.px(4, 12, '#c98a50').px(4, 11, '#c98a50').px(4, 13, '#c98a50').rect(3, 12, 1, 1, '#c98a50'); g.hline(5, 10, 9, '#e0a96c'); g.hline(5, 14, 9, '#8f5f33'); g.px(11, 12, WOOD_D).px(10, 12, WOOD_D).px(9, 12, WOOD_D);
    g.rect(6, 1, 4, 2, WOOD_D);
  }, { w: 16, h: 24 });

  // ───────────── buildings on the facade (16×16 doorways) ─────────────
  A.draw('st-bank', (g) => {
    g.rect(0, 0, 16, 16, '#d8d2c4'); g.vline(0, 0, 16, '#b5ae9d'); g.vline(15, 0, 16, '#b5ae9d');
    g.rect(0, 0, 16, 2, '#9c9484'); g.hline(0, 2, 16, '#6e6858');
    g.disc(7.5, 6, 3.5, '#f2c230'); g.disc(7.5, 6, 2.5, '#fbe27a'); g.rect(7, 4, 2, 4, '#c8961d'); g.hline(6, 5, 4, '#c8961d'); g.hline(6, 7, 4, '#c8961d');   // gold coin
    for (const x of [1, 12]) { g.rect(x, 3, 3, 12, '#ece6d8'); g.vline(x, 3, 12, '#fff'); g.vline(x + 2, 3, 12, '#b5ae9d'); }
    g.rect(5, 10, 6, 6, '#4a3a2c'); g.rect(6, 11, 4, 5, '#6b5846'); g.px(9, 13, '#f2c230');
    g.hline(0, 15, 16, '#8c8576');
  }, { shadow: false });

  A.draw('st-toilet', (g) => {
    g.rect(0, 0, 16, 16, '#e8e4da'); g.vline(0, 0, 16, '#cfc9ba'); g.vline(15, 0, 16, '#cfc9ba');
    g.rect(2, 1, 12, 6, '#2f6fa8'); g.frame(2, 1, 12, 6, '#ffffff');
    g.hline(4, 2, 2, '#fff').rect(4, 3, 2, 2, '#fff').px(4, 5, '#fff').px(5, 5, '#fff').px(4, 6, '#fff').px(5, 6, '#fff');                // man
    g.hline(10, 2, 2, '#fff').hline(10, 3, 2, '#fff').hline(9, 4, 4, '#fff').hline(9, 5, 4, '#fff').px(10, 6, '#fff').px(11, 6, '#fff');   // woman
    g.rect(2, 8, 6, 8, '#4d8fb5'); g.rect(8, 8, 6, 8, '#d9729a'); g.vline(7, 8, 8, '#2f5f80'); g.vline(8, 8, 8, '#8f3f62');
    g.hline(2, 8, 6, '#7fb7d6'); g.hline(8, 8, 6, '#eea0be'); g.px(6, 12, '#f2c230').px(9, 12, '#f2c230');
  }, { shadow: false });

  // ───────────── scenery objects ─────────────
  A.draw('st-tree', (g) => {
    g.rect(7, 15, 3, 9, '#8a5a33'); g.vline(7, 15, 9, '#a8723f'); g.rect(5, 22, 7, 2, '#8a5a33'); g.px(5, 23, null);
    g.disc(8, 8.5, 7, '#3f8f4a'); g.disc(4.5, 10, 4, '#3f8f4a'); g.disc(11.5, 10, 4, '#3f8f4a');
    g.disc(6, 5.5, 4, '#5cae5f'); g.disc(5, 4.5, 2, '#86c96c'); g.px(10, 12, '#2f7a3d').px(11, 9, '#2f7a3d').px(7, 13, '#2f7a3d').px(4, 12, '#2f7a3d');
  }, { w: 16, h: 24 });

  A.draw('st-lamp', (g) => {
    g.rect(7, 7, 2, 17, '#3d4a55'); g.vline(7, 7, 17, '#5a6b79'); g.rect(5, 21, 6, 3, '#3d4a55'); g.hline(5, 21, 6, '#5a6b79');
    g.rect(4, 1, 8, 2, '#3d4a55'); g.rect(5, 0, 6, 1, '#3d4a55');
    g.rect(5, 3, 6, 4, '#fbe07a'); g.rect(6, 4, 2, 2, '#fff6c8'); g.hline(5, 6, 6, '#e0b83a'); g.vline(5, 3, 4, '#caa530').vline(10, 3, 4, '#caa530');
    g.rect(6, 7, 4, 1, '#3d4a55');
  }, { w: 16, h: 24 });

  A.draw('st-bus-stop', (g) => {
    g.rect(7, 9, 2, 15, '#5a6b79'); g.vline(7, 9, 15, '#8aa0b2'); g.rect(5, 22, 6, 2, '#4d5a66');
    g.rect(2, 1, 12, 9, '#2f6fa8'); g.frame(2, 1, 12, 9, '#ffffff');
    g.rect(4, 3, 8, 4, '#ffffff'); g.rect(5, 4, 2, 1, '#2f6fa8').rect(8, 4, 2, 1, '#2f6fa8').rect(11, 4, 1, 1, '#2f6fa8'); g.hline(4, 6, 8, '#d9482b');   // a tiny bus on the plate
    g.px(5, 7, '#1b1b1b').px(10, 7, '#1b1b1b').hline(4, 8, 8, '#cfe3f2');
  }, { w: 16, h: 24 });

  const wheel = (g, x, y) => { g.disc(x, y, 2, '#2a2a30'); g.px(x, y, '#9aa3ab'); };

  A.draw('st-bus', (g) => {
    g.rect(0, 2, 16, 11, '#d9482b'); g.rect(1, 1, 14, 1, '#d9482b'); g.hline(1, 1, 14, '#f27a5a'); g.hline(0, 2, 16, '#f27a5a');
    g.rect(0, 10, 16, 3, '#f3e9d2'); g.hline(0, 10, 16, '#c9bfa8'); g.hline(0, 12, 16, '#b0a68e');
    for (const x of [1, 5, 9]) { g.rect(x, 4, 3, 4, '#a9dbe6'); g.px(x, 4, '#e6f6fa'); }
    g.rect(13, 4, 2, 6, '#a9dbe6'); g.px(13, 4, '#e6f6fa'); g.px(15, 11, '#fbe07a');
    wheel(g, 4, 13); wheel(g, 12, 13); g.px(0, 11, '#8f2f1c');
  });

  A.draw('st-car', (g) => {
    g.rect(0, 8, 16, 5, '#3f78b0'); g.hline(0, 8, 16, '#6aa0d4'); g.rect(3, 4, 9, 4, '#3f78b0'); g.px(2, 7, '#3f78b0').px(12, 7, '#3f78b0'); g.hline(3, 4, 9, '#6aa0d4');
    g.rect(4, 5, 3, 3, '#a9dbe6').rect(8, 5, 3, 3, '#a9dbe6'); g.px(4, 5, '#e6f6fa'); g.vline(7, 5, 3, '#2d5a85');
    g.hline(0, 12, 16, '#2d5a85'); g.px(15, 9, '#fbe07a').px(0, 9, '#d9482b'); g.hline(6, 10, 3, '#2d5a85');
    wheel(g, 4, 13); wheel(g, 12, 13);
  });

  A.draw('st-taxi', (g) => {
    g.rect(0, 8, 16, 5, '#f2c230'); g.hline(0, 8, 16, '#fbe27a'); g.rect(3, 4, 9, 4, '#f2c230'); g.px(2, 7, '#f2c230').px(12, 7, '#f2c230'); g.hline(3, 4, 9, '#fbe27a');
    g.rect(4, 5, 3, 3, '#a9dbe6').rect(8, 5, 3, 3, '#a9dbe6'); g.vline(7, 5, 3, '#b8901a');
    g.rect(5, 2, 5, 2, '#ffffff'); g.rect(6, 2, 1, 1, INK).rect(8, 2, 1, 1, INK);                                                  // roof light
    for (let x = 0; x < 16; x += 2) g.px(x, 10, INK);                                                                              // checker band
    g.hline(0, 12, 16, '#b8901a'); g.px(15, 9, '#fff6c8').px(0, 9, '#d9482b');
    wheel(g, 4, 13); wheel(g, 12, 13);
  });

  A.draw('st-bike', (g) => {
    ring(g, 3.5, 11.5, 3.4, '#2a2a30'); ring(g, 12.5, 11.5, 3.4, '#2a2a30'); g.px(3, 11, '#9aa3ab').px(12, 11, '#9aa3ab');
    g.line(3, 11, 7, 6, '#2f9a8a'); g.line(7, 6, 12, 11, '#2f9a8a'); g.line(7, 6, 9, 11, '#2f9a8a'); g.line(3, 11, 9, 11, '#2f9a8a'); g.line(9, 11, 7, 6, '#5fc9b8');
    g.hline(5, 5, 3, '#2a2a30'); g.line(11, 6, 12, 11, '#9aa3ab'); g.hline(10, 5, 3, '#2a2a30'); g.px(8, 10, '#b0a68e');
  });

  A.draw('st-bird', (g) => {
    g.ellipse(7.5, 10, 5, 3.5, '#8a6a4a'); g.ellipse(6.5, 11, 3, 2, '#e8d9b8'); g.disc(11.5, 7, 3, '#8a6a4a'); g.px(10, 6, '#a8855f');
    g.px(14, 7, '#f2a02a').px(15, 7, '#f2a02a'); g.px(12, 6, INK);                                                                 // beak and eye
    g.rect(1, 9, 4, 2, '#6b4f36'); g.px(0, 10, '#6b4f36'); g.px(0, 11, '#6b4f36');                                               // tail
    g.rect(5, 8, 4, 3, '#a8855f'); g.hline(5, 10, 4, '#6b4f36');
    g.vline(7, 13, 2, '#e0a050').vline(9, 13, 2, '#e0a050').px(6, 14, '#e0a050').px(10, 14, '#e0a050');
  });

  A.draw('st-light', (g) => {
    g.rect(7, 13, 2, 11, '#4d5a66'); g.vline(7, 13, 11, '#6e8090'); g.rect(5, 22, 6, 2, '#3d4a55');
    g.rect(4, 0, 8, 14, '#2a2d33'); g.vline(4, 0, 14, '#454a52');
    g.disc(8, 3, 2, '#e5483a'); g.px(7, 2, '#ff9a8c'); g.disc(8, 7, 2, '#5a4a14'); g.disc(8, 11, 2, '#1d4a2a');
    g.rect(3, 1, 1, 3, '#2a2d33'); g.rect(12, 1, 1, 3, '#2a2d33');
  }, { w: 16, h: 24 });

  A.draw('st-crosswalk', (g) => {
    g.rect(7, 8, 2, 8, '#6e8090'); g.vline(7, 8, 8, '#9aa3ab'); g.rect(4, 14, 8, 2, '#4d5a66');
    g.rect(2, 0, 12, 9, '#2f6fa8'); g.frame(2, 0, 12, 9, '#ffffff');
    for (let y = 2; y < 8; y += 2) g.hline(4, y, 8, '#ffffff');                                                                  // zebra stripes
    for (let x = 4; x < 12; x += 2) g.vline(x, 11, 3, '#ffffff');
  });

  A.draw('st-flower', (g) => {
    g.rect(5, 11, 6, 5, '#c0603a'); g.rect(4, 10, 8, 2, '#d9784a'); g.hline(4, 10, 8, '#eea070'); g.hline(5, 15, 6, '#8f3f22');
    g.vline(8, 5, 6, '#3f8f4a'); g.rect(5, 8, 3, 2, '#5cae5f'); g.rect(9, 7, 3, 2, '#5cae5f');
    for (const [x, y] of [[8, 1], [8, 5], [5.5, 3], [10.5, 3]]) g.disc(x, y, 1.6, '#f26b8a');
    g.disc(8, 3, 1.4, '#f2c230'); g.px(7, 1, '#ffb0c4');
  });

  A.draw('st-dog', (g) => {
    g.rect(3, 6, 9, 5, '#b9854f'); g.hline(3, 6, 9, '#d9a066'); g.hline(3, 10, 9, '#8f5f33');
    g.rect(10, 3, 5, 5, '#b9854f'); g.rect(14, 5, 2, 3, '#e8d9b8'); g.px(15, 5, INK); g.rect(10, 3, 2, 4, '#7a4a28'); g.px(13, 4, INK);       // head, snout, ear, eye
    g.px(14, 8, '#e0506a');
    g.line(3, 6, 1, 3, '#b9854f'); g.px(1, 3, '#d9a066');                                                                         // tail
    for (const x of [3, 5, 9, 11]) g.rect(x, 11, 1, 4, '#8f5f33');
    g.rect(2, 14, 4, 1, '#6b4a2a'); g.rect(8, 14, 5, 1, '#6b4a2a'); g.rect(4, 7, 3, 2, '#e8d9b8');
  });

  A.draw('st-cat', (g) => {
    g.ellipse(7.5, 11, 5, 4, '#e8914a'); g.hline(4, 14, 8, '#c06f2e');
    g.disc(7.5, 5.5, 3.5, '#e8914a'); g.px(4, 1, '#e8914a').px(5, 1, '#e8914a').px(4, 2, '#e8914a').px(5, 2, '#e8914a').px(3, 2, '#e8914a').px(11, 1, '#e8914a').px(10, 1, '#e8914a').px(11, 2, '#e8914a').px(10, 2, '#e8914a').px(12, 2, '#e8914a');
    g.px(5, 2, '#f2a8a0').px(10, 2, '#f2a8a0'); g.px(6, 5, INK).px(9, 5, INK); g.px(7, 7, '#e86f6f').px(8, 7, '#e86f6f');
    g.hline(2, 6, 2, '#f3e9d2').hline(12, 6, 2, '#f3e9d2');                                                                       // whiskers
    g.vline(6, 3, 2, '#c06f2e').vline(9, 3, 2, '#c06f2e'); g.hline(7, 2, 2, '#c06f2e');
    g.line(11, 13, 14, 12, '#e8914a'); g.line(14, 12, 14, 8, '#e8914a'); g.px(14, 8, '#c06f2e'); g.px(13, 13, '#e8914a').px(15, 12, '#e8914a');   // tail
    g.rect(5, 12, 2, 3, '#f3e9d2'); g.rect(9, 12, 2, 3, '#f3e9d2');
  });

  // ───────────── level-1 shop fronts on the facade (16×16 doorways, not walkable) ─────────────
  const front = (g, col, edge) => { g.rect(0, 0, 16, 16, col); g.vline(0, 0, 16, edge); g.vline(15, 0, 16, edge); g.hline(0, 15, 16, A.c.dk(edge, 0.2)); };

  A.draw('door-home', (g) => {                                     // Xiao Ming's apartment door: red door, red couplet strips, a lantern and a plant
    wall(g);
    g.rect(0, 0, 16, 2, '#b4573a'); g.hline(0, 2, 16, '#7a3322');                                                                  // little tiled porch roof
    g.rect(4, 3, 8, 2, '#d9482b'); g.hline(5, 4, 6, '#f2c230');                                                                    // red strip above the door (no text)
    g.rect(4, 5, 8, 11, '#8a5a33'); g.rect(5, 6, 6, 10, '#c0392b'); g.vline(5, 6, 10, '#e0574a'); g.vline(8, 6, 10, '#8f2a20');   // frame + red double door
    g.px(7, 11, '#f2c230').px(9, 11, '#f2c230');                                                                                    // handles
    g.rect(6, 7, 2, 2, '#f2c230'); g.px(6, 7, '#fbe27a'); g.rect(9, 7, 2, 2, '#f2c230'); g.px(9, 7, '#fbe27a');                     // gold door ornaments
    g.rect(2, 5, 1, 8, '#d9482b'); g.rect(13, 5, 1, 8, '#d9482b');                                                                 // red couplet strips (no text)
    g.vline(14, 3, 1, INK); g.rect(14, 4, 2, 3, '#e5483a'); g.px(14, 4, '#ff7a5a'); g.hline(14, 7, 2, '#f2c230');                    // a small lantern
    g.rect(0, 13, 3, 3, '#c0603a'); g.hline(0, 13, 3, '#e08a5a'); g.disc(1.2, 11, 1.6, '#3f8f4a'); g.px(1, 10, '#5cae5f').px(0, 11, '#5cae5f');   // potted plant
    g.rect(5, 15, 6, 1, '#d9a066');                                                                                                // door mat
  }, { shadow: false });

  A.draw('door-school', (g) => {                                   // school gate: pale wall, flag on a pole, clock, an iron gate
    front(g, '#f1e6c8', '#cdb98f');
    g.rect(0, 0, 16, 2, '#4a7ab0'); g.hline(0, 2, 16, '#2f5a85');
    g.vline(2, 3, 7, '#6b6f78'); g.rect(3, 3, 4, 3, '#d9482b'); g.px(4, 4, '#f2c230');                                            // flag
    g.disc(11.5, 5.5, 2.5, '#ffffff'); g.px(11, 4, INK).px(11, 5, INK).px(12, 5, INK); ring(g, 11.5, 5.5, 2.6, '#4a7ab0');           // clock
    g.rect(1, 10, 14, 6, '#7a8089'); for (let x = 2; x < 15; x += 2) g.vline(x, 10, 6, '#b8bec6'); g.hline(1, 10, 14, '#4d5058'); g.hline(1, 13, 14, '#9aa3ab');   // gate
    g.rect(7, 8, 2, 2, '#f2c230');
  }, { shadow: false });

  A.draw('st-hospital', (g) => {                                   // hospital: white front, green cross, glass doors
    front(g, '#f4f4f0', '#cfd3d6');
    g.rect(0, 0, 16, 2, '#4f9a8a'); g.hline(0, 2, 16, '#2f6f62');
    g.disc(7.5, 6, 3.6, '#ffffff'); g.rect(6, 3, 3, 7, '#2fa05a'); g.rect(4, 5, 7, 3, '#2fa05a'); g.px(6, 3, '#5cc47f').px(4, 5, '#5cc47f');   // green cross
    g.rect(3, 10, 10, 6, '#7fb8c8'); g.vline(7, 10, 6, '#cfd3d6').vline(8, 10, 6, '#cfd3d6'); g.frame(3, 10, 10, 6, '#9aa3ab');
    g.px(4, 11, '#e6f6fa').px(9, 11, '#e6f6fa'); g.px(6, 13, '#4d5058').px(9, 13, '#4d5058');
  }, { shadow: false });

  A.draw('st-bookshop', (g) => {                                   // bookshop: wooden front, an open book above, books in the window
    front(g, '#efe3cc', '#d8c7a6');
    g.rect(0, 0, 16, 4, '#4f8a5a'); g.hline(0, 4, 16, '#2f5a3a');
    g.rect(4, 1, 4, 3, '#ffffff'); g.rect(8, 1, 4, 3, '#f3e9d2'); g.vline(8, 1, 3, '#8a5a33'); g.hline(5, 2, 2, '#9aa3ab').hline(9, 2, 2, '#9aa3ab');   // open book
    g.rect(1, 6, 14, 10, '#8a5a33'); g.rect(2, 7, 7, 8, '#a9dbe6'); g.rect(10, 7, 4, 9, '#6e4727'); g.px(13, 11, '#f2c230');
    const bk = ['#b8453a', '#3f6fa6', '#d8b04a', '#4f8a5a', '#8c5a9c'];
    for (let i = 0; i < 6; i++) g.vline(2 + i, 10 + (i % 2), 5 - (i % 2), bk[i % 5]);                                              // books on display
    g.px(3, 7, '#e6f6fa').px(4, 8, '#e6f6fa');
  }, { shadow: false });

  A.draw('st-store', (g) => {                                      // shop / convenience store: striped awning, goods in the window
    wall(g); awning(g, '#d9482b', '#ffffff');
    g.rect(1, 6, 14, 10, '#5f6b78'); g.rect(2, 7, 8, 8, '#cfe8ef'); g.rect(11, 7, 3, 9, '#a9dbe6'); g.vline(11, 7, 9, '#3d4a55');
    g.hline(2, 10, 8, '#9aa3ab'); g.hline(2, 14, 8, '#9aa3ab');
    g.rect(3, 8, 1, 2, '#3f8f52').rect(5, 8, 1, 2, '#d9482b').rect(7, 8, 2, 2, '#f2c230');                                         // bottles and a box
    g.rect(3, 12, 2, 2, '#f2994a').rect(6, 12, 2, 2, '#3f6fa6').rect(8, 12, 1, 2, '#e86f8a');
    g.px(12, 8, '#e6f6fa'); g.px(13, 12, '#f2c230');
  }, { shadow: false });

  A.draw('st-restaurant', (g) => {                                 // restaurant: red front with gold trim, lanterns, a steaming bowl sign
    front(g, '#b8332b', '#8f2a20');
    g.rect(0, 0, 16, 2, '#6e1f1a'); g.hline(0, 2, 16, '#f2c230');
    g.ellipse(7.5, 6, 3.5, 1.5, '#ffffff'); g.rect(4, 6, 8, 2, '#ffffff'); g.hline(5, 8, 6, '#d8d0c0'); g.hline(5, 6, 6, '#f2c230');   // bowl
    g.line(9, 3, 12, 5, WOOD_D); g.line(10, 3, 13, 5, WOOD_D); g.px(6, 4, '#ffffff').px(7, 3, '#ffffff');                           // chopsticks + steam
    for (const x of [1, 14]) { g.disc(x + 0.5, 5.5, 1.5, '#f26b43'); g.px(x, 4, '#f2c230').px(x, 7, '#f2c230'); }
    g.rect(4, 10, 8, 6, '#6e3b22'); g.rect(5, 11, 6, 5, '#e8b04a'); g.vline(8, 11, 5, '#6e3b22'); g.hline(5, 11, 6, '#f6d27a');   // warm lit door
    g.hline(1, 10, 3, '#f2c230').hline(12, 10, 3, '#f2c230');
  }, { shadow: false });

  A.draw('st-cinema', (g) => {                                     // cinema: dark front, marquee lights, a film poster
    front(g, '#4a3a6a', '#2f2448');
    g.rect(0, 0, 16, 3, '#2f2448'); for (let x = 1; x < 16; x += 2) g.px(x, 1, '#fbe07a');                                         // marquee bulbs
    g.rect(2, 4, 6, 9, '#f3e9d2'); g.rect(3, 5, 4, 5, '#3f6fa6'); g.rect(4, 6, 2, 2, '#f2c230'); g.px(3, 9, '#2f5a85').px(6, 8, '#2f5a85').hline(3, 9, 4, '#2f5a85'); g.rect(3, 10, 4, 2, '#d9482b');    // poster
    g.rect(9, 4, 5, 2, INK); for (let x = 9; x < 14; x += 2) g.px(x, 4, '#ffffff').px(x, 5, '#ffffff');                            // film strip
    g.rect(9, 7, 6, 9, '#2a2030'); g.rect(10, 8, 4, 8, '#8a2a3a'); g.vline(12, 8, 8, '#5a1a26'); g.px(11, 12, '#f2c230');           // red curtain door
  }, { shadow: false });

  // ───────────── level-1 things on the pavement (16×24) ─────────────
  A.draw('st-phone', (g) => {                                      // a street phone box: orange hood on a post, the handset inside
    g.rect(7, 16, 2, 8, '#5a6b79'); g.vline(7, 16, 8, '#8aa0b2'); g.rect(5, 22, 6, 2, '#4d5a66');
    g.ellipse(8, 5, 7, 4, '#f2994a'); g.rect(1, 5, 14, 11, '#f2994a'); g.hline(1, 5, 14, '#f6b77a'); g.vline(1, 5, 11, '#f6b77a');   // hood
    g.rect(3, 6, 10, 9, '#fbe8d0');
    g.rect(5, 7, 6, 7, '#3d4a55'); g.rect(6, 8, 4, 2, '#a9dbe6'); for (const [x, y] of [[6, 11], [8, 11], [6, 12], [8, 12]]) g.px(x, y, '#d8d0c0');   // phone with keys
    g.vline(11, 7, 5, '#1b1b1b'); g.px(12, 7, '#1b1b1b').px(12, 11, '#1b1b1b');                                                    // handset
    g.hline(1, 15, 14, '#c06f2e');
  }, { w: 16, h: 24 });

  A.draw('st-weather', (g) => {                                    // a weather board on a post: rain cloud today, a snowflake-cold tomorrow
    g.rect(7, 15, 2, 9, '#5a6b79'); g.vline(7, 15, 9, '#8aa0b2'); g.rect(5, 22, 6, 2, '#4d5a66');
    g.rect(1, 1, 14, 14, '#2a3a4a'); g.frame(1, 1, 14, 14, '#9aa3ab');
    g.disc(5.5, 5, 2, '#e6eef2'); g.disc(8, 4.5, 2.4, '#e6eef2'); g.rect(4, 5, 7, 2, '#e6eef2');                                     // cloud
    g.px(5, 8, '#6ab0ff').px(7, 9, '#6ab0ff').px(9, 8, '#6ab0ff').px(4, 10, '#6ab0ff').px(8, 11, '#6ab0ff');                       // rain
    g.hline(3, 12, 10, '#4d5a66');
    g.rect(11, 3, 2, 7, '#e6eef2'); g.rect(11, 7, 2, 3, '#4aa0e0'); g.px(12, 10, '#4aa0e0');                                         // thermometer (cold)
  }, { w: 16, h: 24 });
  // ───────────── level-2 facade fronts (16×16, not walkable) ─────────────
  A.draw('st-hotel', (g) => {                                      // hotel: tall cream front, rows of lit windows, a canopy over a glass door
    front(g, '#e9dcc0', '#c9b58a');
    g.rect(0, 0, 16, 2, '#7a4a8c'); g.hline(0, 2, 16, '#4f2f5c');
    for (const y of [4, 7]) for (const x of [2, 6, 10]) { g.rect(x, y, 3, 2, '#f2d27a'); g.frame(x - 1, y - 1, 5, 4, '#a89268'); }
    g.rect(2, 10, 12, 2, '#7a4a8c'); g.hline(2, 12, 12, '#4f2f5c'); g.rect(5, 12, 6, 4, '#7fb8c8'); g.vline(8, 12, 4, '#cfd3d6'); g.px(6, 13, '#e6f6fa');
  }, { shadow: false });

  A.draw('st-flats', (g) => {                                      // block of flats: grey-blue storeys, balconies with washing, a door
    front(g, '#b9c4d4', '#8f9db3');
    g.rect(0, 0, 16, 2, '#6b7a92'); g.hline(0, 2, 16, '#44506a');
    for (const y of [3, 7]) for (const x of [2, 9]) { g.rect(x, y, 5, 3, '#8fcfe6'); g.frame(x, y, 5, 3, '#5d6c85'); g.hline(x - 1, y + 3, 7, '#5d6c85'); }
    g.rect(10, 8, 2, 2, '#e8564a'); g.rect(3, 4, 2, 2, '#f2c230');
    g.rect(6, 11, 4, 5, '#6e4727'); g.px(9, 13, '#f2c230');
  }, { shadow: false });

  A.draw('st-tickets', (g) => {                                    // ticket office: green kiosk, a little window with a counter, tickets hanging
    front(g, '#efe3cc', '#d8c7a6');
    g.rect(0, 0, 16, 3, '#2f8a6a'); g.hline(0, 3, 16, '#1d5a45');
    g.rect(2, 5, 12, 9, '#3f6fb0'); g.rect(4, 6, 8, 5, '#a9dbe6'); g.frame(4, 6, 8, 5, '#f3e9d2'); g.rect(3, 11, 10, 2, '#c58b55'); g.hline(3, 11, 10, '#e0b57c');
    g.rect(5, 12, 3, 1, '#ffffff').rect(9, 12, 2, 1, '#f2c230'); g.px(5, 7, '#e6f6fa').px(6, 8, '#e6f6fa');
    g.rect(13, 0, 2, 3, '#f2c230'); g.hline(13, 1, 2, '#c8961d');
  }, { shadow: false });

  A.draw('st-watchshop', (g) => {                                  // watch shop: dark navy front, a big watch face above, small watches in the window
    front(g, '#2f3a5a', '#1d2640');
    g.rect(0, 0, 16, 2, '#c9a227'); g.hline(0, 2, 16, '#8a6c12');
    g.rect(6, 3, 4, 1, '#8a5a33'); g.rect(6, 9, 4, 1, '#8a5a33'); g.rect(5, 4, 6, 5, '#8a5a33');
    g.disc(8, 6, 2.5, '#fdfdfb'); g.px(8, 5, INK).px(8, 6, INK).px(9, 6, INK);
    g.rect(2, 11, 12, 5, '#a9dbe6'); g.frame(2, 11, 12, 5, '#c9a227');
    for (const x of [4, 8, 11]) { g.rect(x, 12, 2, 2, '#fdfdfb'); g.hline(x, 14, 2, '#8a5a33'); g.px(x, 12, '#c9a227'); }
  }, { shadow: false });

  A.draw('st-noodles', (g) => {                                    // small restaurant: warm orange front, a hanging bowl sign, steaming bowl in the window
    front(g, '#f0d6a8', '#d2b078');
    g.rect(0, 0, 16, 3, '#d9742a'); g.hline(0, 3, 16, '#8f4a16');
    g.rect(5, 4, 6, 4, '#f8f8f4'); g.hline(5, 4, 6, '#4f7ab5'); g.ellipse(7.5, 5.5, 2, 1, '#f2d98a'); g.vline(8, 2, 2, '#6e4727');
    g.rect(1, 9, 14, 7, '#8a5a33'); g.rect(2, 10, 12, 5, '#a9dbe6');
    g.rect(5, 12, 6, 3, '#f8f8f4'); g.hline(5, 12, 6, '#4f7ab5'); g.rect(6, 11, 4, 1, '#f2d98a'); g.px(6, 9, '#ffffff').px(9, 9, '#ffffff');
  }, { shadow: false });

  // ───────────── things on the pavement ─────────────
  A.draw('st-metro', (g) => {                                      // metro entrance: stairs going down under a blue roof, a round M-less sign
    g.rect(1, 2, 14, 2, '#2f6fb0'); g.hline(1, 2, 14, '#6fa2d8'); g.rect(2, 4, 1, 11, '#5d6c85'); g.rect(13, 4, 1, 11, '#5d6c85');
    g.rect(3, 4, 10, 11, '#2a2d38');
    for (let i = 0; i < 5; i++) { g.hline(3 + i, 6 + i * 2, 10 - i * 2, '#8d93a0'); g.hline(3 + i, 7 + i * 2, 10 - i * 2, '#555b68'); }
    g.disc(8, 0.5, 1.5, '#2f6fb0'); g.px(8, 0, '#ffffff');
    g.rect(2, 14, 12, 2, '#d9d1c2');
  }, { h: 16 });

  const arrowSign = (key, dir) => A.draw(key, (g) => {             // a street sign on a post with a big arrow
    g.rect(7, 8, 2, 8, '#6b6f78'); g.vline(7, 8, 8, '#8d93a0'); g.rect(5, 14, 6, 2, '#8c8274');
    g.rect(1, 1, 14, 8, '#2f6fb0'); g.frame(1, 1, 14, 8, '#fdfdfb');
    const a = dir < 0 ? [12, 3, 3, 5, 5, 5] : [3, 3, 12, 5, 10, 5];
    g.rect(4, 4, 8, 2, '#fdfdfb');
    if (dir < 0) { g.line(5, 5, 8, 2, '#fdfdfb').line(5, 4, 8, 7, '#fdfdfb').vline(4, 4, 2, '#fdfdfb'); }
    else { g.line(10, 2, 12, 4, '#fdfdfb').line(10, 7, 12, 5, '#fdfdfb'); }
  });
  arrowSign('st-left', -1);
  arrowSign('st-right', 1);
})(window.MSC = window.MSC || {});

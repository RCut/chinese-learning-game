/* ART for the shop stage: its objects, people, doors and its own ground tiles. See js/core/art.js (how to draw) and tools/art-sheet.js (preview). */
(function (MSC) {
  const A = MSC.art;
  const T = 'shop';

  // ───────── ground tiles ─────────
  // P — warm wooden floor boards
  A.tile('P', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#d6a86e');
    for (let y = 0; y < 16; y += 5) { g.hline(0, y, 16, '#e6c18a'); g.hline(0, y + 4, 16, '#b48650'); }
    const j = [[3, 9], [11, 4], [7, 12]][v];
    g.vline(j[0], 1, 3, '#b48650').vline(j[1], 6, 3, '#b48650').vline(j[0] + 5, 11, 4, '#b48650');
    for (let i = 0; i < 5; i++) g.px(Math.floor(r() * 16), Math.floor(r() * 16), i % 2 ? '#c99a60' : '#e0b57c');
  }), T);

  // W — wall: plaster over a dark timber skirting, with a hanging cloth border
  A.tile('W', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#efe0c0');
    g.rect(0, 0, 16, 2, '#7a4a2b').hline(0, 2, 16, '#4f2f19');
    for (let y = 4; y < 12; y += 4) for (let x = (y / 4 % 2) * 4 + v * 2; x < 18; x += 8) g.hline(x - 2, y + 1, 4, '#e0cda4');
    g.rect(0, 12, 16, 4, '#7a4a2b').hline(0, 12, 16, '#a2693d').hline(0, 15, 16, '#4f2f19');
    g.vline(5 + v * 5, 12, 4, '#5f391f');
    g.px(2, 6 + v, '#f7ecd2').px(12, 7 - v, '#d8c49a');
  }), T);

  // H — a tall wooden shelving unit (blocked); objects stand on its top
  A.tile('H', [(g, c) => {
    g.rect(0, 0, 16, 16, '#8a5530');
    g.rect(0, 0, 16, 4, '#c58b55').hline(0, 0, 16, '#e0ac77').hline(0, 4, 16, '#5e3a1b');
    g.rect(1, 5, 14, 10, '#4f2f19');
    g.hline(1, 9, 14, '#8a5530').hline(1, 13, 14, '#8a5530');
    const bk = ['#b8453a', '#3f6fa6', '#d8b04a', '#4f8a5a', '#8c5a9c'];
    for (let x = 2, i = 0; x < 14; x += 2, i++) { g.vline(x, 6, 3, bk[i % 5]).vline(x + 1, 6, 3, c.dk(bk[i % 5], 0.2)); }
    for (let x = 2, i = 2; x < 12; x += 3, i++) { g.rect(x, 10, 2, 3, bk[i % 5]); }
    g.hline(0, 15, 16, '#5e3a1b').vline(0, 5, 11, '#6e4425').vline(15, 5, 11, '#6e4425');
  }], T);

  // T — a work / display table (top surface, front panel)
  A.tile('T', [(g) => {
    g.rect(0, 0, 16, 16, '#7b4f27');
    g.rect(0, 0, 16, 9, '#c58b55').hline(0, 0, 16, '#e6b27a').hline(0, 3, 16, '#b87f4a').hline(0, 6, 16, '#b87f4a').hline(0, 9, 16, '#5e3a1b');
    g.rect(0, 10, 16, 3, '#8f5c32').hline(0, 10, 16, '#a87240');
    g.rect(1, 13, 2, 3, '#5e3a1b').rect(13, 13, 2, 3, '#5e3a1b');
    g.px(6, 2, '#a9703d').px(11, 5, '#a9703d');
  }], T);

  // K — red rug with a gold border
  A.tile('K', [(g, c, r, i) => {
    g.rect(0, 0, 16, 16, '#a8332b');
    g.frame(0, 0, 16, 16, '#6e1f1a');
    g.frame(1, 1, 14, 14, '#e0b64a');
    g.frame(3, 3, 10, 10, '#7d2620');
    g.rect(4, 4, 8, 8, '#bd4036');
    g.px(7, 5, '#e0b64a').px(8, 6, '#e0b64a').px(7, 7, '#e0b64a').px(8, 8, '#e0b64a').px(7, 9, '#e0b64a').px(8, 10, '#e0b64a');
    g.px(5, 7, '#e0b64a').px(10, 8, '#e0b64a');
  }], T);

  // ───────── door ─────────
  A.draw('door-shop-out', (g, c) => {
    g.rect(1, 1, 14, 15, '#6e4423').frame(1, 1, 14, 15, '#c58b55');
    g.rect(3, 3, 10, 13, '#2f2a3a');                           // dark open doorway to the street
    g.rect(3, 3, 10, 6, '#87b8d8').rect(3, 9, 10, 4, '#86c06c').hline(3, 9, 10, '#a8d890');   // sky + grass beyond
    g.rect(3, 13, 10, 3, '#c9bfae');
    g.rect(1, 0, 14, 2, '#8f5a33').hline(1, 0, 14, '#c58b55');
    g.rect(2, 13, 12, 3, '#a8332b').hline(2, 13, 12, '#d9564a').hline(2, 15, 12, '#6e1f1a'); // mat
    g.px(5, 14, '#e0b64a').px(8, 14, '#e0b64a').px(11, 14, '#e0b64a');
  });

  // ───────── the four treasures + the work table ─────────
  A.draw('sh-brush', (g, c) => {                               // brush lying diagonally: bamboo handle, black tip
    g.line(3, 13, 11, 5, '#d8b85a'); g.line(3, 12, 11, 4, '#b8963c');
    g.line(11, 5, 13, 3, '#8a6a2a');
    g.rect(11, 3, 2, 2, '#e8d9a0');
    g.line(13, 3, 15, 1, '#1d1a1f'); g.line(13, 2, 14, 1, '#2f2a35'); g.px(14, 3, '#1d1a1f');
    g.px(3, 14, '#d8b85a').px(2, 13, '#b8963c');
  });
  A.draw('sh-ink', (g, c) => {                                 // ink stick: dark block with gold lettering band
    g.rect(4, 3, 8, 12, '#2a2630').rect(4, 3, 8, 2, '#4a4552').vline(4, 3, 12, '#4a4552');
    g.rect(5, 6, 6, 6, '#3a3544').frame(5, 6, 6, 6, '#c9a227');
    g.px(7, 8, '#c9a227').px(8, 9, '#c9a227').px(7, 10, '#c9a227');
    g.hline(5, 14, 7, '#18151c');
  });
  A.draw('sh-xuan', (g, c) => {                                // flat stack of paper sheets with a curled corner
    g.rect(1, 9, 14, 6, '#f1ebd9').hline(1, 9, 14, '#fffbea').hline(1, 11, 14, '#d9d1b8').hline(1, 13, 14, '#d9d1b8').hline(1, 14, 14, '#bdb391');
    g.rect(2, 5, 12, 5, '#fbf6e6').hline(2, 5, 12, '#ffffff').hline(2, 9, 12, '#d9d1b8');
    g.px(12, 6, '#e6dfc8').px(13, 6, '#e6dfc8').px(13, 7, '#e6dfc8').px(12, 7, '#d3cbb0');
    g.px(4, 7, '#e9e2cb').px(8, 6, '#ece5cf');
  });

  // ───────── shelves ─────────
  const bookSet = (g, c, cols) => {
    let x = 2;
    cols.forEach(([col, h, w]) => { g.rect(x, 15 - h, w, h, col).vline(x, 15 - h, h, c.lt(col, 0.3)).hline(x, 15 - h + 1, w, c.dk(col, 0.25)); g.hline(x, 15 - Math.floor(h / 2), w, '#f1e3b8'); x += w; });
  };
  A.draw('sh-book1', (g, c) => { bookSet(g, c, [['#b8453a', 11, 3], ['#3f6fa6', 13, 3], ['#d8b04a', 10, 2], ['#4f8a5a', 12, 3]]); g.rect(1, 15, 14, 1, '#6e4425'); });
  A.draw('sh-book2', (g, c) => {                                // a stack laid flat
    g.rect(2, 11, 12, 4, '#3f6fa6').hline(2, 11, 12, '#6f9bd0').rect(2, 13, 12, 1, '#f1e3b8');
    g.rect(3, 8, 10, 3, '#b8453a').hline(3, 8, 10, '#d9695d').rect(3, 10, 10, 1, '#f1e3b8');
    g.rect(4, 5, 8, 3, '#4f8a5a').hline(4, 5, 8, '#74b080').rect(4, 7, 8, 1, '#f1e3b8');
  });
  A.draw('sh-bookshelf', (g, c) => {                            // tall bookcase 16x24
    g.rect(0, 0, 16, 24, '#8a5530').rect(0, 0, 16, 2, '#c58b55').hline(0, 0, 16, '#e6b27a');
    g.rect(2, 3, 12, 20, '#3b2312');
    const bk = ['#b8453a', '#3f6fa6', '#d8b04a', '#4f8a5a', '#8c5a9c', '#e07b39'];
    [3, 10, 17].forEach((y, row) => {
      g.hline(2, y + 6, 12, '#a2693d');
      for (let x = 3, i = row; x < 13; x += 2, i++) { const h = 4 + ((x + row) % 3); g.rect(x, y + 6 - h, 2, h, bk[i % 6]).vline(x, y + 6 - h, h, c.lt(bk[i % 6], 0.3)); }
    });
    g.vline(0, 2, 22, '#a2693d').vline(15, 2, 22, '#6e4425').hline(0, 23, 16, '#5e3a1b');
  }, { h: 24 });
  A.draw('sh-flower', (g, c) => {                               // a pink flower on a green stem
    g.vline(8, 8, 7, '#4f8a4a').vline(7, 8, 6, '#4f8a4a');
    g.rect(9, 11, 3, 1, '#6ab066').px(11, 10, '#6ab066').rect(4, 12, 3, 1, '#6ab066').px(4, 11, '#6ab066');
    [[7, 2], [10, 4], [9, 7], [5, 7], [4, 4]].forEach(([x, y]) => g.disc(x + 0.5, y + 0.5, 1.6, '#f08ab4'));
    g.disc(7.5, 5.5, 1.5, '#f6c54a'); g.px(7, 5, '#fde68a');
    g.px(6, 3, '#f9b5d1').px(5, 4, '#f9b5d1');
  });

  // ───────── back wall hangings ─────────
  const scroll = (key, paper, art) => A.draw(key, (g, c) => {   // hanging scroll with wooden rods and a cord
    g.hline(7, 0, 2, '#c9a227'); g.px(6, 1, '#c9a227').px(9, 1, '#c9a227');
    g.rect(2, 2, 12, 2, '#6e4423').hline(2, 2, 12, '#a2693d');
    g.rect(3, 4, 10, 16, paper).rect(3, 4, 1, 16, c.lt(paper, 0.4));
    g.rect(2, 20, 12, 2, '#6e4423').hline(2, 20, 12, '#a2693d').px(1, 21, '#c9a227').px(14, 21, '#c9a227');
    art(g, c);
  }, { h: 24 });
  const framed = (key, draw) => A.draw(key, (g, c) => {
    g.rect(1, 3, 14, 12, '#7a4a2b').frame(1, 3, 14, 12, '#c58b55');
    g.rect(3, 5, 10, 8, '#f3ead0');
    g.px(7, 0, '#c9a227').px(8, 0, '#c9a227').px(6, 1, '#c9a227').px(9, 1, '#c9a227').line(5, 2, 7, 3, '#c9a227').line(10, 2, 8, 3, '#c9a227');
    draw(g, c);
  });
  framed('sh-painting', (g) => {                                // a fish pond / sunrise
    g.rect(3, 5, 10, 4, '#f6d98a').rect(3, 9, 10, 4, '#6fa8c8');
    g.disc(7.5, 8.5, 2, '#e8624a').rect(3, 9, 10, 1, '#4f88a8');
    g.hline(4, 11, 3, '#9fcce0').hline(9, 12, 3, '#9fcce0');
  });
  A.draw('sh-lantern', (g, c) => {                              // red paper lantern with tassel
    g.rect(7, 0, 2, 3, '#4a3a2a');
    g.rect(5, 3, 6, 2, '#e0b64a').hline(5, 3, 6, '#f2d27a');
    g.ellipse(7.5, 10, 6, 5.5, '#d33a2c');
    g.vline(4, 7, 7, '#e8604f').vline(6, 5, 11, '#b02a20').vline(9, 5, 11, '#b02a20').vline(11, 7, 7, '#a02218');
    g.px(5, 7, '#ff8a76').px(5, 8, '#ff8a76');
    g.rect(5, 15, 6, 2, '#e0b64a').hline(5, 16, 6, '#b08f2a');
    g.vline(7, 17, 5, '#d33a2c').vline(8, 17, 5, '#b02a20').rect(6, 21, 4, 2, '#e0b64a');
  }, { h: 24 });
  A.draw('sh-calligraphy', (g, c) => {                          // a long paper banner with brush strokes (no real characters)
    g.rect(1, 1, 14, 2, '#6e4423').hline(1, 1, 14, '#a2693d');
    g.rect(2, 3, 12, 11, '#f6efd8').hline(2, 3, 12, '#c9bfa0');
    g.rect(1, 13, 14, 2, '#6e4423').hline(1, 13, 14, '#a2693d');
    const ink = '#1d1a1f';
    g.line(4, 5, 7, 5, ink).line(5, 5, 5, 8, ink).line(4, 8, 7, 8, ink).vline(6, 8, 3, ink).line(4, 11, 7, 11, ink);
    g.line(9, 5, 12, 5, ink).line(10, 6, 9, 9, ink).line(10, 8, 12, 11, ink).line(9, 11, 12, 11, ink);
    g.rect(11, 9, 2, 2, '#b8302a');
  });

  // ───────── display tables ─────────
  A.draw('sh-paper', (g, c) => {                                // a rolled sheet and a flat sheet
    g.rect(3, 9, 10, 5, '#fbf6e6').hline(3, 9, 10, '#ffffff').hline(3, 13, 10, '#d9d1b8').px(12, 10, '#e6dfc8');
    g.rect(2, 5, 12, 4, '#f1ebd9').hline(2, 5, 12, '#ffffff').vline(13, 5, 4, '#cfc6a8').vline(2, 5, 4, '#cfc6a8');
    g.hline(4, 7, 8, '#e0d8bc');
    g.rect(5, 7, 6, 1, '#c8a05a');
  });
  A.draw('sh-teaset', (g, c) => {                               // teapot with two little cups
    g.rect(4, 6, 7, 6, '#7a4f3a').rect(5, 5, 5, 1, '#7a4f3a').rect(7, 3, 2, 2, '#5a3626').px(7, 3, '#a8725a');
    g.rect(4, 6, 2, 5, '#a8725a').hline(4, 11, 7, '#4f2f20').rect(5, 12, 5, 1, '#4f2f20');
    g.line(11, 7, 13, 6, '#7a4f3a').px(13, 5, '#7a4f3a');
    g.vline(3, 7, 3, '#5a3626').px(2, 7, '#5a3626').px(2, 9, '#5a3626');
    g.rect(1, 13, 4, 2, '#f4f1e6').rect(11, 13, 4, 2, '#f4f1e6').hline(1, 13, 4, '#3f6fb0').hline(11, 13, 4, '#3f6fb0');
  });
  A.draw('sh-cup', (g, c) => {                                  // a small blue-and-white tea cup with a saucer
    g.rect(3, 13, 10, 2, '#e4dfcc').hline(3, 13, 10, '#ffffff');
    g.rect(4, 6, 8, 7, '#f4f1e6').rect(5, 12, 6, 1, '#f4f1e6').vline(4, 6, 6, '#ffffff').vline(11, 7, 6, '#cfcab6');
    g.hline(4, 6, 8, '#3f6fb0').hline(4, 9, 8, '#3f6fb0').px(7, 11, '#3f6fb0').px(8, 11, '#3f6fb0');
    g.rect(5, 6, 6, 1, '#b07a3a');
    g.px(12, 8, '#f4f1e6').px(13, 8, '#f4f1e6').px(13, 9, '#f4f1e6').px(13, 10, '#cfcab6').px(12, 11, '#cfcab6');
  });

  // ───────── floor pieces ─────────
  // ───────── paint pots: the colours (黑色 白色 绿色 红色) and a palette (颜色) ─────────
  const pot = (key, paint, rim) => A.draw(key, (g, c) => {      // a round pot of paint with a brush resting in it
    g.rect(3, 7, 10, 7, '#e9e2cf').rect(3, 7, 1, 7, '#fffaf0').vline(12, 8, 6, '#bdb391');
    g.rect(2, 6, 12, 2, '#f4efe0').hline(2, 6, 12, '#ffffff');
    g.ellipse(7.5, 6.5, 4.5, 1.5, rim || c.dk(paint, 0.35)).ellipse(7.5, 6.5, 3.8, 1, paint);
    g.px(6, 6, c.lt(paint, 0.45));
    g.hline(3, 14, 10, '#bdb391');
    g.line(11, 5, 13, 1, '#8a5a33').rect(12, 0, 2, 2, '#3b2a1d');
  });
  pot('sh-black', '#26222b', '#4a4552');
  pot('sh-white', '#fdfdfb', '#c9c4b2');
  pot('sh-green', '#3f9a5a');
  pot('sh-red', '#d0392e');
  A.draw('sh-colours', (g, c) => {                              // a wooden palette with blobs of colour and a thumb hole
    g.ellipse(7.5, 8.5, 7, 5.5, '#c58b55').ellipse(7.5, 8.5, 6, 4.5, '#e0b57c');
    g.disc(10.5, 10.5, 1.4, '#c58b55');
    [[4, 6, '#d0392e'], [7, 4, '#f2c230'], [11, 5, '#3f9a5a'], [4, 10, '#3f6fb0'], [7, 8, '#26222b']].forEach(([x, y, col]) => { g.disc(x + 0.5, y + 0.5, 1.5, col); g.px(x, y, c.lt(col, 0.4)); });
  });
  A.draw('sh-welcome', (g, c) => {                              // small red welcome sign on a stand (no text)
    g.rect(2, 2, 12, 9, '#a8332b').frame(2, 2, 12, 9, '#e0b64a').rect(3, 3, 10, 7, '#c0392b');
    g.px(7, 5, '#e0b64a').px(8, 5, '#e0b64a').px(7, 6, '#e0b64a').px(8, 6, '#e0b64a').px(6, 7, '#e0b64a').px(9, 7, '#e0b64a').px(6, 4, '#e0b64a').px(9, 4, '#e0b64a');
    g.rect(3, 11, 2, 4, '#6e4423').rect(11, 11, 2, 4, '#6e4423').rect(3, 14, 2, 1, '#4f2f19').rect(11, 14, 2, 1, '#4f2f19');
    g.hline(5, 12, 6, '#6e4423');
  });

  // ───────── level 1: reading and writing ─────────
  const INK = '#1d1a1f', GRID = '#d9564a';
  A.draw('sh-hanzi', (g, c) => {                                // a wall chart: one big 人 in a red practice square with guide lines
    g.px(7, 0, '#c9a227').px(8, 0, '#c9a227').line(4, 2, 7, 0, '#c9a227').line(11, 2, 8, 0, '#c9a227');
    g.rect(1, 2, 14, 13, '#fbf6e6').frame(1, 2, 14, 13, '#3f6fa6').hline(1, 2, 14, '#6f9bd0');
    g.frame(3, 4, 10, 10, GRID);
    for (let i = 4; i < 13; i += 2) { g.px(i, 8, '#f0b8b0'); g.px(7, i + 0, '#f0b8b0'); }                // dashed guide lines
    g.line(8, 5, 4, 12, INK).line(7, 5, 3, 12, INK);                                                       // 人: the left-falling stroke
    g.line(8, 8, 11, 12, INK).line(8, 9, 12, 12, INK);                                                     //     and the right-falling stroke
  });
  A.draw('sh-class', (g, c) => {                                // the class notice board: cork, pinned sheets, a little clock
    g.rect(1, 2, 14, 12, '#7a4a2b').rect(2, 3, 12, 10, '#c89a64');
    g.px(4, 5, '#b48650').px(10, 11, '#b48650').px(12, 4, '#b48650');
    g.rect(3, 4, 5, 7, '#ffffff').hline(4, 6, 3, '#9aa3ab').hline(4, 8, 3, '#9aa3ab').hline(4, 9, 2, '#9aa3ab').px(5, 4, '#d9482b');   // timetable
    g.disc(11, 6.5, 2.4, '#fbf6e6'); g.px(11, 5, INK).px(11, 6, INK).px(12, 6, INK); g.px(11, 4, '#3f6fa6');                            // clock note
    g.rect(9, 10, 4, 2, '#f2d27a').px(10, 10, '#3f8a58');                                                                                 // sticky note
    g.hline(1, 14, 14, '#4f2f19');
  });
  A.draw('sh-reading', (g, c) => {                              // a wooden reading stand with an open book
    g.rect(7, 9, 2, 6, '#8a5530').rect(4, 14, 8, 2, '#6e4425').hline(4, 14, 8, '#a2693d');
    g.line(1, 8, 4, 3, '#a2693d').line(15, 8, 12, 3, '#a2693d').hline(1, 9, 15, '#7a4a2b');
    g.rect(2, 3, 6, 6, '#fbf6e6').rect(8, 3, 6, 6, '#f1ebd9').vline(8, 3, 6, '#b48650');
    g.hline(3, 5, 4, '#9aa3ab').hline(3, 7, 3, '#9aa3ab').hline(9, 5, 4, '#9aa3ab').hline(9, 7, 4, '#9aa3ab');
    g.rect(2, 2, 12, 1, '#b8453a');
  });
  A.draw('sh-practice', (g, c) => {                             // a practice sheet: red squares with 一 and 二 written in, a pencil
    g.rect(1, 3, 14, 12, '#fbf6e6').hline(1, 3, 14, '#ffffff').hline(1, 14, 14, '#d9d1b8');
    g.frame(2, 4, 6, 7, GRID).frame(8, 4, 6, 7, GRID);
    g.hline(3, 7, 4, INK);                                                                   // 一
    g.hline(10, 6, 2, INK).hline(9, 8, 4, INK);                                              // 二
    g.line(4, 13, 10, 12, '#e8b04a').px(10, 12, '#f2c4a8').px(4, 13, INK);                       // pencil
  });
  A.draw('sh-computer', (g, c) => {                             // a little desktop computer: screen, stand, keyboard
    g.rect(2, 1, 12, 9, '#3d4a55').rect(3, 2, 10, 7, '#a9dbe6').hline(3, 2, 10, '#e6f6fa');
    g.hline(4, 4, 5, '#3f6fa6').hline(4, 6, 6, '#6f9bd0').px(11, 7, '#d9482b');
    g.rect(7, 10, 2, 2, '#5a6b79').rect(5, 12, 6, 1, '#5a6b79');
    g.rect(2, 13, 12, 2, '#e4e6ea').hline(2, 13, 12, '#ffffff'); for (let x = 3; x < 13; x += 2) g.px(x, 14, '#9aa3ab');
  });
  A.draw('sh-chair', (g, c) => {                                // a wooden chair (side view)
    g.rect(3, 1, 2, 14, '#8a5530').vline(3, 1, 14, '#b47a45');
    g.rect(5, 3, 1, 5, '#a2693d');
    g.rect(3, 8, 11, 2, '#c58b55').hline(3, 8, 11, '#e0ac77');
    g.rect(12, 10, 2, 5, '#8a5530'); g.rect(5, 10, 1, 5, '#6e4425');
  });
  A.draw('sh-desk', (g, c) => {                                 // a pupil's desk with an open book on it
    g.rect(0, 7, 16, 2, '#c58b55').hline(0, 7, 16, '#e0ac77').hline(0, 9, 16, '#5e3a1b');
    g.rect(1, 9, 14, 2, '#8f5c32'); g.rect(1, 11, 2, 4, '#6e4425').rect(13, 11, 2, 4, '#6e4425');
    g.rect(3, 3, 5, 4, '#fbf6e6').rect(8, 3, 5, 4, '#f1ebd9').vline(8, 3, 4, '#b48650').hline(3, 6, 10, '#3f6fa6');
    g.hline(4, 4, 3, '#9aa3ab').hline(9, 4, 3, '#9aa3ab');
    g.line(12, 2, 14, 6, '#e8b04a');                                                          // a pencil leaning on the book
  });
})(window.MSC = window.MSC || {});

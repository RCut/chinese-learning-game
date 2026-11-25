/* ART for the cafe stage: its objects, people, doors and its own ground tiles. See js/core/art.js (how to draw) and tools/art-sheet.js (preview). */
(function (MSC) {
  const A = MSC.art;
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };

  // ───────────── ground tiles (café only) ─────────────
  // W — wall: cream plaster above, wooden wainscot below
  A.tile('W', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#ead7b3');
    for (let x = 3 + v * 2; x < 16; x += 8) g.vline(x, 0, 9, '#e0c99f');
    speckle(g, r, 6, ['#f2e4c6', '#e0c99f']);
    g.rect(0, 9, 16, 1, '#b8844f').hline(0, 10, 16, '#8a5a30');            // rail
    g.rect(0, 11, 16, 5, '#a8713f');
    for (let x = 0; x < 16; x += 8) g.frame(x + 1, 12, 6, 3, '#8a5a30');
    g.hline(0, 0, 16, '#f6ead0').hline(0, 15, 16, '#7a4d29');
  }), 'cafe');

  // V — wall with a window (blue sky, white frame)
  A.tile('V', [(g) => {
    g.rect(0, 0, 16, 16, '#ead7b3');
    g.rect(0, 9, 16, 1, '#b8844f').hline(0, 10, 16, '#8a5a30').rect(0, 11, 16, 5, '#a8713f');
    for (let x = 0; x < 16; x += 8) g.frame(x + 1, 12, 6, 3, '#8a5a30');
    g.rect(1, 1, 14, 8, '#fff6e0').rect(2, 2, 12, 6, '#9fd3ee');
    g.rect(2, 2, 12, 2, '#bfe4f5').rect(3, 6, 3, 2, '#b9dca0').rect(9, 5, 4, 3, '#a8d28f');
    g.px(4, 3, '#ffffff').px(5, 3, '#ffffff').px(10, 3, '#ffffff').px(11, 3, '#ffffff').px(11, 2, '#ffffff');
    g.vline(7, 2, 6, '#fff6e0').vline(8, 2, 6, '#e6d6b4').hline(2, 4, 12, '#fff6e0');
    g.hline(0, 9, 16, '#d9c39a');
  }], 'cafe');

  // F — soft checkered floor
  A.tile('F', [0, 1].map((v) => (g, c, r) => {
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) g.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#e0c9a4' : '#f1e3c8');
    g.hline(0, 0, 16, '#f8eedb').vline(0, 0, 16, '#f8eedb');
    speckle(g, r, 5 + v * 3, ['#d6bd96', '#f6ebd4']);
  }), 'cafe');

  // C — wooden counter: light top, panelled front
  A.tile('C', [(g) => {
    g.rect(0, 0, 16, 16, '#9a6a3e');
    g.rect(0, 0, 16, 9, '#d6a56c').hline(0, 0, 16, '#ecc590').hline(0, 4, 16, '#caa064').hline(0, 9, 16, '#6e4727');
    g.rect(0, 10, 16, 1, '#b5824c');
    g.rect(1, 11, 6, 4, '#87582f').rect(9, 11, 6, 4, '#87582f').frame(1, 11, 6, 4, '#6e4727').frame(9, 11, 6, 4, '#6e4727');
    g.hline(0, 15, 16, '#5e3a1b');
  }], 'cafe');

  // T — a café table top (things stand on it): round-ish wooden top, a front edge and legs
  A.tile('T', [(g) => {
    g.rect(0, 0, 16, 16, null);
    g.rect(0, 0, 16, 16, '#efe0c6');                                    // floor shows around the table
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) g.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#e0c9a4' : '#f1e3c8');
    g.rect(1, 12, 14, 3, '#cdb48c');                        // soft shadow on the floor
    g.rect(2, 11, 2, 4, '#7b4f27').rect(12, 11, 2, 4, '#7b4f27');       // legs
    g.rect(0, 1, 16, 9, '#d3a066').hline(0, 1, 16, '#ebc08a').hline(0, 5, 16, '#c28d55');
    g.rect(0, 10, 16, 1, '#8a5a30').hline(0, 11, 16, '#6e4727');
    g.px(0, 1, '#efe0c6').px(15, 1, '#efe0c6');
  }], 'cafe');

  // Q — tea-corner rug (woven, diamond pattern)
  A.tile('Q', [(g) => {
    g.rect(0, 0, 16, 16, '#b8473b');
    g.frame(0, 0, 16, 16, '#7d2d27').frame(1, 1, 14, 14, '#e3b660');
    for (let i = 0; i < 4; i++) { g.px(8, 3 + i, '#e3b660').px(8, 12 - i, '#e3b660'); }
    g.line(8, 3, 3, 8, '#e3b660').line(3, 8, 8, 13, '#e3b660').line(8, 3, 13, 8, '#e3b660').line(13, 8, 8, 13, '#e3b660');
    g.disc(7.5, 7.5, 1.5, '#2f6f7a');
    g.px(2, 2, '#e3b660').px(13, 2, '#e3b660').px(2, 13, '#e3b660').px(13, 13, '#e3b660');
  }], 'cafe');

  // ───────────── helpers ─────────────
  const WOOD = '#a9743f', WOOD_L = '#d3a066', WOOD_D = '#6e4727', CREAM = '#fff6e0', STEEL = '#b9c2c9', STEEL_D = '#7b858d';
  const cupAt = (g, c, x, y, col, coffee) => {                             // 5 wide, 4 tall mug with a handle on the right
    g.rect(x, y, 5, 4, col).hline(x, y, 5, coffee || c.dk(col, 0.35)).px(x, y + 1, c.lt(col, 0.4)).hline(x, y + 3, 5, c.dk(col, 0.15));
    g.px(x + 5, y + 1, col).px(x + 6, y + 1, col).px(x + 6, y + 2, col).px(x + 5, y + 3, col);
  };

  // ───────────── people & doors ─────────────
  // exit door: a doorway seen from inside, door ajar to the daylight; the mat tile lies in front
  A.draw('door-cafe-out', (g, c) => {
    g.rect(1, 1, 14, 23, '#7a4d29');                                    // frame
    g.rect(3, 3, 10, 21, '#bfe4f5').rect(3, 3, 10, 8, '#9fd3ee');       // daylight
    g.rect(3, 15, 10, 9, '#cfd9b0').rect(3, 18, 10, 6, '#b9c79a');      // pavement + grass beyond
    g.rect(3, 3, 6, 21, '#a45b3a');                                     // door leaf, open inwards
    g.rect(4, 4, 4, 8, '#8a4a2d').frame(4, 4, 4, 8, '#c27a50').rect(4, 14, 4, 8, '#8a4a2d').frame(4, 14, 4, 8, '#c27a50');
    g.px(8, 14, '#f2cf4a').px(8, 15, '#f2cf4a');                        // handle
    g.hline(1, 1, 14, '#a8713f').hline(1, 2, 14, '#c98f58');
    g.rect(5, 0, 6, 1, '#f2cf4a');                                      // little lintel bell
  }, { w: 16, h: 24, shadow: false });

  // menu: a standing chalkboard (A-frame) with chalk scribbles and a mug doodle
  A.draw('menu', (g, c) => {
    g.rect(2, 1, 12, 16, '#2f3f38').frame(2, 1, 12, 16, '#a9743f').frame(3, 2, 10, 14, '#7b4f27');
    g.hline(5, 5, 6, '#f1efe8').hline(5, 8, 4, '#d9d4c3').hline(5, 10, 6, '#d9d4c3').hline(5, 12, 5, '#d9d4c3');
    g.hline(10, 8, 1, '#f2cf4a').px(11, 10, '#f2cf4a').px(11, 12, '#f2cf4a');
    g.hline(6, 3, 4, '#f1efe8');
    g.line(3, 17, 1, 22, '#7b4f27').line(12, 17, 14, 22, '#7b4f27').vline(7, 17, 6, '#7b4f27').vline(8, 17, 6, '#7b4f27');
    g.hline(1, 22, 3, '#5e3a1b').hline(12, 22, 3, '#5e3a1b');
  }, { w: 16, h: 24 });

  // ───────────── objects ─────────────
  // coffee machine: steel body, hopper on top, spout + portafilter, cup under it, drip tray
  A.draw('cf-machine', (g, c) => {
    g.rect(1, 1, 14, 14, '#a8aeb4').rect(1, 1, 14, 3, '#d6dbe0').rect(13, 1, 2, 14, '#7b858d');   // steel body, top shine
    g.rect(2, 4, 12, 2, '#59606a').disc(4, 2, 1, '#3b2a1d');                                       // hopper hint
    g.disc(11.5, 2.5, 1.5, '#fff6e0').px(11, 2, '#d9482b');                                        // pressure gauge
    g.rect(5, 6, 6, 3, '#3b3f46').rect(6, 9, 4, 1, '#2a2d33');                                     // group head
    g.rect(2, 7, 4, 2, '#7b4f27').rect(0, 7, 3, 1, '#7b4f27');                                     // portafilter + handle
    g.px(7, 10, '#6e4423').px(8, 10, '#6e4423');                                                   // dripping coffee
    g.rect(5, 11, 6, 3, '#f8f4ea').rect(5, 11, 6, 1, '#6e4423').px(11, 12, '#f8f4ea').px(12, 12, '#f8f4ea');   // cup
    g.rect(2, 14, 12, 1, '#3b3f46');
  });

  // cups: a little stack of two mugs and one in front
  A.draw('cf-cups', (g, c) => {
    cupAt(g, c, 1, 2, '#f6ecd0', '#b9854f'); cupAt(g, c, 1, 7, '#f6ecd0', '#b9854f');
    cupAt(g, c, 9, 8, '#d96a4a', '#8a4a2d');
    g.rect(0, 11, 8, 1, '#c9bd9c');
  }, { shadow: true });

  // milk: a glass bottle with a cap and a white label band
  A.draw('cf-milk', (g, c) => {
    g.rect(5, 1, 6, 2, '#e8564a').rect(6, 3, 4, 2, '#e8f1f5');           // cap + neck
    g.rect(4, 5, 8, 9, '#f8fbfc').rect(4, 5, 2, 9, '#ffffff').rect(10, 5, 2, 9, '#d9e6ec');
    g.rect(4, 8, 8, 3, '#5aa9e6').px(6, 9, '#ffffff').px(9, 9, '#ffffff');
    g.hline(4, 13, 8, '#c9d8df');
  });

  // cake: a glass dome over a cake stand holding a layered cake with a cherry
  A.draw('cf-cake', (g, c) => {
    g.rect(1, 13, 14, 2, '#e8dcc0').rect(6, 12, 4, 1, '#d6c7a3');       // stand
    g.rect(3, 6, 10, 6, '#e9c9d3').rect(3, 9, 10, 1, '#fbf3e8').rect(3, 6, 10, 1, '#f6a5b8');
    g.rect(3, 5, 10, 2, '#f6a5b8').px(8, 3, '#d9322b').px(8, 4, '#d9322b').px(9, 4, '#d9322b');
    g.frame(2, 2, 12, 11, '#bfe4f5').px(2, 2, null).px(13, 2, null).px(3, 2, '#bfe4f5').px(12, 2, '#bfe4f5').hline(5, 1, 6, '#bfe4f5').px(8, 0, '#8fc4dc');
    g.px(4, 3, '#ffffff').px(4, 4, '#ffffff');
  }, { shadow: true });

  // window: a tall window with curtains, a sill and a flower box
  A.draw('cf-window', (g, c) => {
    g.rect(1, 2, 14, 18, '#fff6e0');
    g.rect(2, 3, 12, 16, '#9fd3ee').rect(2, 3, 12, 5, '#bfe4f5').rect(3, 14, 4, 5, '#b9dca0').rect(9, 12, 4, 7, '#a8d28f');
    g.px(4, 5, '#ffffff').px(5, 5, '#ffffff').px(10, 6, '#ffffff').px(11, 6, '#ffffff');
    g.vline(7, 3, 16, '#fff6e0').vline(8, 3, 16, '#e6d6b4').hline(2, 10, 12, '#fff6e0');
    g.rect(2, 1, 12, 2, '#a9743f').px(1, 1, '#a9743f').px(14, 1, '#a9743f');     // curtain rod
    g.rect(2, 3, 3, 9, '#d96a4a').rect(11, 3, 3, 9, '#d96a4a').px(2, 4, '#e98a6a').px(2, 5, '#e98a6a').vline(4, 3, 9, '#b8473b').vline(11, 3, 9, '#b8473b');
    g.rect(0, 19, 16, 2, '#c9a26b').hline(0, 19, 16, '#e6c48e');
    g.rect(1, 21, 14, 3, '#8a5a30').hline(1, 21, 14, '#a9743f');
    g.px(3, 20, '#e8564a').px(7, 20, '#f2cf4a').px(11, 20, '#e8564a').px(5, 20, '#6fae58').px(9, 20, '#6fae58');
  }, { w: 16, h: 24 });

  // sugar: a glass jar of white cubes with a lid and a spoon
  A.draw('cf-sugar', (g, c) => {
    g.rect(4, 1, 8, 3, '#c9a26b').hline(4, 1, 8, '#e3c48c').rect(7, 0, 2, 1, '#8a5a30');
    g.rect(3, 4, 10, 10, '#e4f2f7').rect(3, 4, 2, 10, '#ffffff').rect(11, 4, 2, 10, '#bcd4de');
    for (const [x, y] of [[5, 9], [8, 9], [6, 6], [9, 6], [5, 12], [8, 12], [10, 11]]) g.rect(x, y, 3, 3, '#ffffff').hline(x, y + 2, 3, '#d4d9dd');
    g.hline(3, 13, 10, '#9ab4c0');
  });

  // welcome: a wooden signboard on a post with a heart and ribbon (no text)
  A.draw('cf-welcome', (g, c) => {
    g.rect(7, 9, 2, 6, '#6e4727');
    g.rect(1, 1, 14, 8, '#d3a066').frame(1, 1, 14, 8, '#8a5a30').hline(2, 2, 12, '#ebc08a');
    g.px(7, 4, '#d9322b').px(9, 4, '#d9322b').rect(6, 5, 5, 1, '#d9322b').rect(7, 6, 3, 1, '#d9322b').px(8, 7, '#d9322b');
    g.px(3, 3, '#6fae58').px(3, 6, '#6fae58').px(12, 3, '#6fae58').px(12, 6, '#6fae58');
    g.px(4, 0, '#8a5a30').px(11, 0, '#8a5a30');
  });

  // table: a small round table with a checked cloth
  A.draw('cf-table', (g, c) => {
    g.rect(3, 4, 10, 3, '#f1efe8').rect(2, 5, 12, 2, '#f1efe8');
    g.rect(2, 7, 12, 1, '#c8472f');
    for (let x = 3; x < 13; x += 2) g.px(x, 5, '#e8564a').px(x + 1, 6, '#e8564a');
    g.rect(7, 8, 2, 4, '#8a5a30').rect(4, 12, 8, 1, '#6e4727');
    g.hline(3, 4, 4, '#ffffff');
  });

  // chairs: a wooden chair seen from the front (four share this)
  ['cf-chair-1', 'cf-chair-2', 'cf-chair-3', 'cf-chair-4', 'cf-chair-5'].forEach((key) => A.draw(key, (g, c) => {
    g.rect(3, 1, 10, 7, '#a9743f').rect(5, 2, 6, 4, '#8a5a30').hline(3, 1, 10, '#d3a066').vline(3, 1, 7, '#c28d55');
    g.rect(3, 8, 10, 3, '#d96a4a').hline(3, 8, 10, '#e98a6a').hline(3, 10, 10, '#b8473b');
    g.rect(3, 11, 2, 4, '#6e4727').rect(11, 11, 2, 4, '#6e4727');
  }));

  // spoon: a silver spoon lying diagonally, oval bowl at the low end
  A.draw('cf-spoon', (g, c) => {
    g.line(13, 2, 6, 9, '#c9d2d8').line(12, 2, 5, 9, '#e9eef1').line(14, 3, 7, 10, '#98a3ab');
    g.ellipse(4.5, 10.5, 3, 2.5, '#d9e1e6').ellipse(4, 10, 1.5, 1, '#f6fafc').px(5, 11, '#98a3ab').px(6, 11, '#98a3ab');
  });

  // cup on the table: a mug of coffee on a saucer, with steam
  A.draw('cf-cup-table', (g, c) => {
    g.rect(2, 12, 12, 2, '#f6ecd0').hline(2, 13, 12, '#c9bd9c');
    cupAt(g, c, 3, 7, '#f8f4ea', '#6e4423');
    g.px(4, 8, '#8a5a30').px(6, 8, '#8a5a30').rect(4, 8, 3, 1, '#6e4423');
    g.px(5, 4, '#ffffff').px(6, 3, '#ffffff').px(5, 2, '#ffffff').px(8, 4, '#ffffff').px(9, 3, '#ffffff');
  });

  // plants: a leafy plant in a terracotta pot (two share this)
  ['cf-plant', 'cf-plant-2'].forEach((key) => A.draw(key, (g, c) => {
    g.ellipse(7.5, 5.5, 5, 4.5, '#5fa24f').ellipse(5, 4, 2.5, 2, '#86c06c').ellipse(10.5, 7, 2.5, 2, '#4f9040');
    g.line(8, 9, 8, 6, '#3f7a35').line(5, 5, 7, 8, '#3f7a35').line(11, 5, 9, 8, '#3f7a35');
    g.rect(3, 9, 10, 2, '#c26a3f').rect(4, 11, 8, 4, '#b25a33').hline(3, 9, 10, '#e08a5a').vline(4, 11, 4, '#d9784a');
  }));

  // ───────────── level-1 things ─────────────
  // lunch: a hanging chalkboard with a rice-bowl doodle and chalk lines (the text is the sign's lines)
  A.draw('cf-lunch', (g, c) => {
    g.line(4, 0, 7, 2, '#8a5a30').line(11, 0, 8, 2, '#8a5a30');
    g.rect(1, 2, 14, 12, '#8a5a30').rect(2, 3, 12, 10, '#2f3f38');
    g.ellipse(5.5, 8.5, 2.5, 1.5, '#ffffff').rect(3, 7, 6, 2, '#f1efe8').rect(3, 9, 6, 2, '#d96a4a').px(3, 10, null).px(8, 10, null);
    g.line(7, 4, 9, 7, '#e3b660').line(8, 4, 10, 7, '#e3b660');
    g.hline(10, 8, 3, '#d9d4c3').hline(10, 10, 3, '#d9d4c3').hline(4, 5, 2, '#f1efe8');
    g.hline(1, 13, 14, '#6e4727');
  });
  // telephone: an old red desk phone with the handset on top and a dial
  A.draw('cf-phone', (g, c) => {
    g.rect(2, 9, 12, 5, '#d9402f').rect(3, 8, 10, 1, '#d9402f').hline(2, 13, 12, '#a8281f').hline(3, 8, 10, '#f27a6a');
    g.disc(7.5, 10.5, 2.2, '#f6ecd0').px(7, 10, '#3b2a1d').px(6, 9, '#3b2a1d').px(9, 9, '#3b2a1d').px(6, 12, '#3b2a1d').px(9, 12, '#3b2a1d');
    g.rect(1, 4, 14, 2, '#c0352a').hline(1, 4, 14, '#f27a6a').rect(0, 5, 3, 3, '#c0352a').rect(13, 5, 3, 3, '#c0352a');
    g.line(14, 12, 15, 15, '#3b2a1d');
  });
  // money: a little wooden tray with banknotes and gold coins
  A.draw('cf-money', (g, c) => {
    g.rect(1, 10, 14, 4, '#a9743f').hline(1, 10, 14, '#d3a066').hline(1, 13, 14, '#6e4727');
    g.rect(2, 5, 9, 5, '#e8564a').frame(2, 5, 9, 5, '#b8473b').disc(6.5, 7.5, 1.3, '#f6c0b4');
    g.rect(4, 3, 9, 5, '#d96a4a').frame(4, 3, 9, 5, '#a8381f').disc(8.5, 5.5, 1.3, '#f6c0b4').px(5, 4, '#f6c0b4').px(11, 6, '#f6c0b4');
    for (const [x, y] of [[11, 9], [13, 8], [12, 10]]) g.disc(x, y, 1.6, '#f2cf4a').px(x, y, '#c9a227');
  });
  // water: a water dispenser — a big blue bottle upside down on a white stand, with a tap
  A.draw('cf-water', (g, c) => {
    g.rect(5, 0, 6, 1, '#4f9ad0').rect(4, 1, 8, 8, '#8fd0f2').rect(4, 1, 2, 8, '#c4e8fa').vline(11, 1, 8, '#5aa9e6').hline(4, 4, 8, '#5aa9e6');
    g.rect(6, 9, 4, 1, '#4f9ad0');
    g.rect(3, 10, 10, 14, '#f4f6f8').rect(3, 10, 2, 14, '#ffffff').rect(11, 10, 2, 14, '#c9d2d8').hline(3, 23, 10, '#9aa4ab');
    g.rect(5, 13, 6, 4, '#cfd8de').px(7, 13, '#4f9ad0').px(8, 13, '#4f9ad0').px(7, 14, '#2f6fb0');
    g.rect(6, 16, 4, 1, '#9aa4ab');
  }, { w: 16, h: 24 });
  // tea: a glass of green tea with leaves floating, on a saucer, with steam
  A.draw('cf-tea', (g, c) => {
    g.rect(1, 13, 14, 2, '#f6ecd0').hline(1, 14, 14, '#c9bd9c');
    g.rect(4, 6, 8, 7, '#e8f4f0').rect(5, 7, 6, 6, '#b9d27a').hline(5, 7, 6, '#d8e8a0').vline(4, 6, 7, '#ffffff').vline(11, 6, 7, '#c0d8d0');
    g.px(6, 9, '#4f7a2a').px(7, 10, '#5f8a3a').px(9, 8, '#4f7a2a').px(8, 11, '#4f7a2a').px(9, 11, '#5f8a3a');
    g.px(6, 4, '#ffffff').px(7, 3, '#ffffff').px(6, 2, '#ffffff').px(9, 4, '#ffffff').px(10, 3, '#ffffff');
  });
  // rice: a blue-and-white bowl heaped with white rice and a pair of chopsticks
  A.draw('cf-rice', (g, c) => {
    g.ellipse(7.5, 7, 5.5, 3, '#ffffff').px(5, 5, '#f1efe8').px(9, 6, '#f1efe8').px(7, 4, '#f1efe8');
    g.rect(2, 8, 12, 3, '#f8f8f4').rect(3, 11, 10, 2, '#f8f8f4').rect(5, 13, 6, 1, '#d9d4c3');
    g.hline(2, 9, 12, '#4f7ab5').px(4, 10, '#4f7ab5').px(7, 10, '#4f7ab5').px(10, 10, '#4f7ab5').hline(3, 12, 10, '#c9d2d8');
    g.line(9, 2, 15, 9, '#a9743f').line(10, 1, 15, 7, '#c98f58');
  });
  // dish (菜): a plate of green vegetables with red pepper bits
  A.draw('cf-dish', (g, c) => {
    g.ellipse(7.5, 10, 7, 3.5, '#f8f4ea').ellipse(7.5, 10, 5.5, 2.5, '#ffffff').hline(2, 13, 12, '#c9c3b2');
    for (const [x, y, col] of [[4, 8, '#4f9a45'], [6, 7, '#6fbf5a'], [9, 7, '#4f9a45'], [11, 9, '#6fbf5a'], [7, 9, '#3f8a35'], [5, 10, '#6fbf5a'], [9, 10, '#4f9a45']]) g.ellipse(x, y, 1.6, 1, col);
    g.px(6, 9, '#d9402f').px(10, 8, '#d9402f').px(8, 11, '#e8832a').vline(7, 7, 2, '#e8f4d0');
  });
  // mobile phone: a smartphone lying on the table, screen lit with app squares
  A.draw('cf-mobile', (g, c) => {
    g.rect(4, 2, 8, 13, '#2a2d33').rect(5, 3, 6, 10, '#7fc4e8').hline(5, 3, 6, '#bfe4f5');
    g.rect(6, 5, 1, 1, '#f2cf4a').rect(8, 5, 1, 1, '#e8564a').rect(6, 7, 1, 1, '#6fae58').rect(8, 7, 1, 1, '#ffffff').rect(6, 9, 1, 1, '#d96a4a').rect(8, 9, 1, 1, '#5aa9e6');
    g.hline(7, 13, 2, '#59606a').px(7, 2, '#59606a').px(8, 2, '#59606a');
  });
  // ── HSK 2 things ──
  // milk tea (奶茶): a tall clear cup of beige tea, tapioca pearls at the bottom and a fat straw
  A.draw('cf-milktea', (g, c) => {
    g.rect(4, 4, 8, 10, '#f4efe6').rect(5, 5, 6, 8, '#d9b48a').rect(5, 5, 6, 2, '#ead2b0').vline(4, 4, 10, '#ffffff').vline(11, 5, 9, '#cfc6b4');
    g.rect(5, 11, 6, 2, '#5a3a26'); g.px(6, 11, '#7a5238').px(9, 12, '#7a5238').px(8, 11, '#7a5238');
    g.rect(3, 3, 10, 1, '#e8564a').hline(3, 3, 10, '#f08a7c');
    g.line(9, 3, 11, 0, '#4f9a8a').line(10, 3, 12, 0, '#4f9a8a');
    g.hline(5, 14, 6, '#bdb391');
  });
  // noodles (面): a blue-and-white bowl of noodles with an egg and a green sprig, chopsticks across
  A.draw('cf-noodle', (g, c) => {
    g.ellipse(7.5, 7.5, 6, 3, '#f2d98a').ellipse(7.5, 7, 5, 2, '#f6e4a2');
    for (const x of [4, 6, 8, 10]) g.line(x, 6, x + 2, 8, '#d8b95a');
    g.disc(10.5, 6.5, 1.6, '#ffffff').px(10, 6, '#f2b030').px(11, 6, '#f2b030'); g.px(5, 6, '#4f9a45').px(6, 5, '#4f9a45');
    g.rect(2, 9, 12, 3, '#f8f8f4').rect(4, 12, 8, 2, '#f8f8f4').hline(5, 14, 6, '#d9d4c3');
    g.hline(2, 10, 12, '#4f7ab5').px(4, 11, '#4f7ab5').px(7, 11, '#4f7ab5').px(10, 11, '#4f7ab5');
    g.line(9, 1, 14, 8, '#a9743f').line(11, 1, 15, 6, '#c98f58');
  });
  // bag (包): a satchel with a flap, a buckle and a strap
  A.draw('cf-bag', (g, c) => {
    g.rect(3, 6, 10, 8, '#c0603a').rect(3, 6, 10, 4, '#d97a4a').hline(3, 9, 10, '#8f3f22').rect(3, 6, 1, 8, '#e08a5a');
    g.rect(7, 8, 2, 3, '#f2c230').px(7, 9, '#fbe27a');
    g.line(4, 6, 6, 2, '#8f3f22').line(11, 6, 9, 2, '#8f3f22').hline(6, 2, 4, '#8f3f22');
    g.hline(3, 14, 10, '#8f3f22');
  });
  // seat card (位): a little tent card on the table, three chairs drawn as dots
  A.draw('cf-seats', (g, c) => {
    g.rect(2, 4, 12, 9, '#f6efd8').frame(2, 4, 12, 9, '#c9a227').hline(2, 13, 12, '#8a5a33');
    for (const x of [5, 8, 11]) { g.disc(x, 7, 1.2, '#c0392b'); g.rect(x - 1, 9, 3, 2, '#c0392b'); }
    g.hline(3, 12, 10, '#e0d2a4');
  });
  // inside sign (里面): a wooden board with an arrow pointing into a doorway
  A.draw('cf-inside', (g, c) => {
    g.rect(1, 3, 14, 10, '#8a5a33').rect(2, 4, 12, 8, '#d9a066').frame(1, 3, 14, 10, '#5e3a1b');
    g.rect(3, 7, 7, 2, '#3b2a1d'); g.line(10, 5, 13, 8, '#3b2a1d').line(10, 10, 13, 8, '#3b2a1d').vline(10, 6, 4, '#3b2a1d');
    g.px(4, 5, '#ecc088').px(5, 5, '#ecc088');
  });
})(window.MSC = window.MSC || {});

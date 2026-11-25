/* ART for Xiao Ming's home: the family, the rooms, the things. See js/core/art.js (how to draw) and tools/art-sheet.js (preview). */
(function (MSC) {
  const A = MSC.art;
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };
  /** paint on top of an existing sprite (e.g. add a collar to a person) */
  const touch = (key, fn) => { const d = A.defs[key], g = new A.Painter(d.w, d.h); g.p = d.p; fn(g, A.c); };

  // ───────────── people (16×24) ─────────────
  // Xiao Ming: a friendly young man — messy dark hair, an orange hoodie with a white pocket stripe, jeans
  A.person('xiaoming', { skin: '#f0c19a', hair: '#2a1d14', hairStyle: 'short', top: '#ee9a35', bottom: '#4b6a9c', shoes: '#f1efe8' });
  touch('xiaoming', (g) => {
    g.px(6, 0, null).px(9, 0, null).px(5, 0, '#2a1d14').px(10, -0, '#2a1d14');   // tufts
    g.px(4, 0, '#2a1d14').px(11, 1, '#2a1d14').px(7, 4, null);
    g.hline(5, 16, 6, '#f8e3c0').px(7, 12, '#d9822a').px(8, 12, '#d9822a');      // hoodie pocket + hood strings
    g.px(6, 13, '#f8f1e4').px(9, 13, '#f8f1e4');
  });

  // Dad: neat short hair with grey temples, glasses, a pale blue shirt and a navy tie, grey trousers
  A.person('baba', { skin: '#e9b78f', hair: '#1d1b1f', hairStyle: 'short', top: '#a9cbe8', bottom: '#555b66', glasses: '#9aa6b2', shoes: '#2b2118' });
  touch('baba', (g) => {
    g.px(3, 5, '#8a8a8a').px(12, 5, '#8a8a8a').px(3, 6, '#8a8a8a').px(12, 6, '#8a8a8a');   // grey temples
    g.vline(7, 12, 5, '#2c3e6b').vline(8, 12, 5, '#2c3e6b').px(7, 17, '#2c3e6b');          // tie
    g.px(6, 12, '#ffffff').px(9, 12, '#ffffff');                                            // collar points
  });

  // Mum: dark hair in a bun, a rose cardigan, a sunny yellow apron
  A.person('mama', { skin: '#f2c7a0', hair: '#4a2c1a', hairStyle: 'bun', top: '#cf6b84', bottom: '#5b4b6e', apron: '#f4cf5a' });
  touch('mama', (g) => { g.px(7, 16, '#e8564a').px(8, 16, '#e8564a').px(7, 17, '#e8564a').px(8, 17, '#e8564a'); g.px(10, 1, '#e8564a'); });   // apron heart, hair clip

  // Older sister: long black hair, a white school shirt with a navy sailor collar and red bow, navy skirt, a schoolbag
  A.person('jiejie', { skin: '#f4cba6', hair: '#141218', hairStyle: 'long', top: '#f6f3ea', bottom: '#2f3f6e', bag: '#7a5bb0', shoes: '#3b2a1d' });
  touch('jiejie', (g) => {
    g.rect(4, 12, 8, 2, '#2f3f6e').px(5, 14, '#2f3f6e').px(10, 14, '#2f3f6e');               // sailor collar
    g.px(7, 14, '#d9322b').px(8, 14, '#d9322b').px(6, 14, '#e8564a').px(9, 14, '#e8564a');   // bow
    g.rect(4, 18, 8, 2, '#2f3f6e').hline(4, 19, 8, '#24315a');                                // skirt
    g.rect(5, 20, 2, 2, '#f4cba6').rect(9, 20, 2, 2, '#f4cba6');                              // knees
  });

  // Younger brother: small (squashed down), spiky hair, a red-and-white football shirt with a number, shorts
  A.person('didi', { skin: '#f2c49d', hair: '#33231a', hairStyle: 'short', top: '#d93f35', bottom: '#2f3f6e', shoes: '#f1efe8' });
  touch('didi', (g) => {
    g.vline(7, 13, 6, '#ffffff').vline(8, 13, 6, '#ffffff');                                  // shirt stripe
    g.px(4, 0, '#33231a').px(11, 0, '#33231a').px(7, -1, '#33231a');                          // spikes
    g.rect(5, 19, 2, 2, '#2f3f6e').rect(9, 19, 2, 2, '#2f3f6e').rect(5, 21, 2, 1, '#f2c49d').rect(9, 21, 2, 1, '#f2c49d');   // shorts + knees
  });
  {                                                                                           // make him shorter: drop 3 rows of body
    const d = A.defs.didi, rows = [];
    for (let y = 0; y < 24; y++) rows.push(d.p.slice(y * 16, y * 16 + 16));
    const keep = [...rows.slice(0, 15), ...rows.slice(17, 19), ...rows.slice(20, 24)];       // shorter torso + legs
    const out = [...Array(24 - keep.length).fill(0).map(() => new Array(16).fill(null)), ...keep];
    d.p = out.flat();
  }

  // ───────────── ground tiles (home only) ─────────────
  const WALL = '#f3e2c4', WALL_D = '#e6cfa8', SKIRT = '#b07a48';
  const wallBase = (g, r) => {
    g.rect(0, 0, 16, 16, WALL);
    for (let y = 1; y < 11; y += 4) for (let x = (y % 8 === 1 ? 2 : 6); x < 16; x += 8) { g.px(x, y, '#e9b9a6').px(x + 1, y + 1, '#cfe0c0'); }   // little flower print
    g.hline(0, 0, 16, '#fbf1de');
    g.rect(0, 11, 16, 5, '#c58e58').hline(0, 11, 16, '#e0ad74').hline(0, 12, 16, SKIRT).hline(0, 15, 16, '#8a5a30');
    for (let x = 0; x < 16; x += 4) g.vline(x, 13, 2, '#b07a48');
    speckle(g, r, 3, [WALL_D]);
  };
  A.tile('W', [0, 1].map(() => (g, c, r) => wallBase(g, r)), 'home');
  // V — a window: sky, a cloud, a tree top, white frame and soft green curtains
  A.tile('V', [(g, c, r) => {
    wallBase(g, r);
    g.rect(1, 1, 14, 10, '#ffffff').rect(2, 2, 12, 8, '#9fd3ee').rect(2, 2, 12, 3, '#bfe4f5');
    g.rect(4, 3, 4, 1, '#ffffff').rect(3, 4, 6, 1, '#ffffff');
    g.disc(11.5, 8, 2.5, '#7fba62').px(11, 6, '#9ad47f');
    g.vline(7, 2, 8, '#ffffff').hline(2, 6, 12, '#ffffff');
    g.rect(0, 1, 2, 10, '#8fbf86').rect(14, 1, 2, 10, '#8fbf86').vline(1, 1, 10, '#6fa068').vline(14, 1, 10, '#6fa068');
    g.rect(1, 10, 14, 1, '#e0c7a0');
  }], 'home');
  // P — warm honey floorboards
  A.tile('P', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#e2bf8c');
    for (let y = 0; y < 16; y += 4) { g.hline(0, y + 3, 16, '#c79c66'); g.hline(0, y, 16, '#ecd0a4'); g.vline((y * 5 + v * 7) % 16, y, 3, '#c79c66'); }
    speckle(g, r, 6, ['#d6b07c', '#efd6ae']);
  }), 'home');
  // K — kitchen floor: small cream and sky-blue tiles
  A.tile('K', [(g) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) g.rect(x * 4, y * 4, 4, 4, (x + y) % 2 ? '#bcd9e4' : '#f5f1e6');
    for (let i = 0; i < 16; i += 4) { g.hline(0, i, 16, '#d9d2c0'); g.vline(i, 0, 16, '#d9d2c0'); }
  }], 'home');
  // C — kitchen counter: a pale stone top, blue-grey cupboard doors with knobs
  A.tile('C', [0, 1].map((v) => (g) => {
    g.rect(0, 0, 16, 16, '#6f8fa3');
    g.rect(0, 0, 16, 8, '#e9e4da').hline(0, 0, 16, '#fbf8f2').hline(0, 4, 16, '#ddd6c9').hline(0, 8, 16, '#4f6a7c');
    g.frame(1, 9, 6, 6, '#56738a').frame(9, 9, 6, 6, '#56738a').px(6, 11, '#e3c48c').px(9, 11, '#e3c48c');
    if (v) g.rect(3, 1, 10, 3, '#bfc6cc').rect(4, 2, 8, 1, '#9aa3ab');         // a sink
    g.hline(0, 15, 16, '#3f5666');
  }), 'home');
  // U — living-room rug: soft blue with a cream pattern
  A.tile('U', [(g) => {
    g.rect(0, 0, 16, 16, '#6f95c4');
    g.hline(0, 0, 16, '#557aa8').hline(0, 15, 16, '#557aa8').vline(0, 0, 16, '#557aa8').vline(15, 0, 16, '#557aa8');
    g.line(8, 2, 2, 8, '#f0e6cf').line(2, 8, 8, 14, '#f0e6cf').line(8, 2, 14, 8, '#f0e6cf').line(14, 8, 8, 14, '#f0e6cf');
    g.disc(7.5, 7.5, 1.5, '#e8a35a');
    g.px(2, 2, '#f0e6cf').px(13, 2, '#f0e6cf').px(2, 13, '#f0e6cf').px(13, 13, '#f0e6cf');
  }], 'home');
  // T / X — the dining table: wooden top (T), and its front edge with legs (X)
  const tableTop = (g) => { g.rect(0, 0, 16, 16, '#c98d56'); for (let y = 2; y < 16; y += 5) g.hline(0, y, 16, '#b57a45'); g.hline(0, 0, 16, '#dda66c'); };
  A.tile('T', [tableTop], 'home');
  A.tile('X', [(g) => {
    g.rect(0, 0, 16, 16, '#e2bf8c'); for (let y = 0; y < 16; y += 4) g.hline(0, y + 3, 16, '#c79c66');
    g.rect(0, 0, 16, 10, '#c98d56').hline(0, 3, 16, '#b57a45').hline(0, 7, 16, '#b57a45');
    g.rect(0, 10, 16, 2, '#8a5a30').hline(0, 12, 16, '#6e4727');
    g.rect(1, 12, 2, 4, '#6e4727').rect(13, 12, 2, 4, '#6e4727');
  }], 'home');
  // H I J — the sofa seen from behind (it faces the TV): a green backrest with a soft top roll; H and J have the arms
  const sofa = (left, right) => (g) => {
    g.rect(0, 0, 16, 16, '#6f95c4');                                                         // rug shows behind
    g.hline(0, 0, 16, '#557aa8');
    g.rect(0, 3, 16, 12, '#5f9a6e').rect(0, 3, 16, 3, '#7fbf8c').hline(0, 3, 16, '#9ad4a4');   // back + roll
    g.hline(0, 14, 16, '#3f6f4c').hline(0, 15, 16, '#557aa8');
    for (let x = 4; x < 16; x += 8) g.vline(x, 7, 7, '#4f8a5e');                              // seams
    if (left) { g.rect(0, 1, 3, 14, '#4f8a5e').rect(0, 1, 3, 2, '#7fbf8c'); }
    if (right) { g.rect(13, 1, 3, 14, '#4f8a5e').rect(13, 1, 3, 2, '#7fbf8c'); }
    g.rect(left ? 1 : 0, 15, 16, 1, '#557aa8');
  };
  A.tile('H', [sofa(true, false)], 'home');
  A.tile('I', [sofa(false, false)], 'home');
  A.tile('J', [sofa(false, true)], 'home');
  // E / Y — the bed: wooden headboard + white pillow (E), and a patchwork blanket + footboard (Y)
  A.tile('E', [(g) => {
    g.rect(0, 0, 16, 16, '#e2bf8c');
    g.rect(1, 0, 14, 5, '#8a5a30').hline(1, 0, 14, '#a9743f').rect(1, 5, 14, 11, '#f6f1e6');
    g.rect(3, 6, 10, 5, '#ffffff').frame(3, 6, 10, 5, '#d9d2c4');
    g.rect(1, 12, 14, 4, '#e8826a').hline(1, 12, 14, '#f3a28c');
    g.vline(1, 5, 11, '#d9d2c4').vline(14, 5, 11, '#d9d2c4');
  }], 'home');
  A.tile('Y', [(g) => {
    g.rect(0, 0, 16, 16, '#e2bf8c');
    g.rect(1, 0, 14, 12, '#e8826a');
    for (let y = 0; y < 12; y += 4) for (let x = 1; x < 15; x += 4) if ((x + y) % 8 === 1) g.rect(x, y, 4, 4, '#f4b860');
    g.vline(1, 0, 12, '#c9634e').vline(14, 0, 12, '#c9634e');
    g.rect(1, 12, 14, 3, '#8a5a30').hline(1, 12, 14, '#a9743f').hline(1, 15, 14, '#6e4727');
  }], 'home');

  // ───────────── the door out ─────────────
  // a front door seen from inside: blue-painted panels, a brass handle, a peephole; the mat lies in front
  A.draw('door-home-out', (g) => {
    g.rect(1, 1, 14, 23, '#8a5a30');                                                          // frame
    g.rect(3, 3, 10, 21, '#4f7fa8').rect(3, 3, 10, 1, '#6f9fc8');
    g.frame(4, 5, 8, 7, '#3d6a90').frame(4, 14, 8, 8, '#3d6a90');
    g.px(11, 13, '#f2cf4a').px(10, 13, '#f2cf4a').px(11, 14, '#c9a227');                      // handle
    g.px(7, 4, '#2b2b2b').px(8, 4, '#2b2b2b');                                                // peephole
    g.rect(5, 7, 6, 2, '#f6ecd0').px(7, 7, '#d9322b').px(8, 7, '#d9322b');                    // a little red 福-style card
    g.hline(1, 1, 14, '#a9743f');
  }, { w: 16, h: 24, shadow: false });

  // ───────────── wall things ─────────────
  // calendar: a paper wall calendar — red header with rings, a grid of days, one day ringed in red
  A.draw('hm-calendar', (g) => {
    g.rect(3, 1, 10, 11, '#ffffff').rect(3, 1, 10, 3, '#d9322b').px(5, 0, '#5a5a5a').px(10, 0, '#5a5a5a');
    g.hline(5, 2, 6, '#f6c0b4');
    for (let y = 5; y < 11; y += 2) for (let x = 4; x < 12; x += 2) g.px(x, y, '#7b858d');
    g.frame(7, 6, 3, 3, '#e8564a').px(8, 7, '#2b2b2b');
    g.hline(3, 11, 10, '#d9d2c4');
  }, { shadow: false });
  // painting: mountains and a sun in a gold frame
  A.draw('hm-painting', (g) => {
    g.rect(1, 1, 14, 10, '#c9a227').rect(2, 2, 12, 8, '#dff0f5');
    for (let x = 2; x < 14; x++) { const h1 = 7 - Math.max(0, 3 - Math.abs(x - 5)), h2 = 8 - Math.max(0, 4 - Math.abs(x - 10)); g.vline(x, Math.min(h1, h2), 10 - Math.min(h1, h2), Math.min(h1, h2) === h2 ? '#3f6f5a' : '#5f8f6a'); }
    g.px(10, 4, '#ffffff').px(5, 4, '#ffffff');
    g.rect(2, 9, 12, 1, '#6fae58');
    g.disc(12, 3.5, 1, '#f2a03a');
  }, { shadow: false });
  // room sign: a little wooden plaque with a star sticker
  A.draw('hm-room-sign', (g) => {
    g.rect(2, 3, 12, 7, '#d3a066').frame(2, 3, 12, 7, '#8a5a30').hline(3, 4, 10, '#ebc08a');
    g.hline(4, 6, 6, '#6e4727').hline(4, 8, 4, '#6e4727');
    g.px(11, 6, '#f2cf4a').px(10, 7, '#f2cf4a').px(11, 7, '#f2cf4a').px(12, 7, '#f2cf4a').px(11, 8, '#f2cf4a');
    g.px(7, 2, '#5a5a5a').px(8, 2, '#5a5a5a').px(6, 3, '#5a5a5a').px(9, 3, '#5a5a5a');
  }, { shadow: false });

  // ───────────── kitchen ─────────────
  // water: a glass jug of blue water with a handle
  A.draw('hm-water', (g) => {
    g.rect(4, 3, 7, 10, '#e4f2f7').rect(4, 6, 7, 7, '#7cc0e8').hline(4, 6, 7, '#a9d8f2');
    g.rect(3, 2, 8, 1, '#cfe3ea').px(3, 1, '#cfe3ea');
    g.vline(12, 4, 6, '#cfe3ea').px(11, 4, '#cfe3ea').px(11, 9, '#cfe3ea');
    g.vline(5, 7, 4, '#d6eef9');
  });
  // eggs: an open carton with eggs
  A.draw('hm-eggs', (g) => {
    g.rect(1, 9, 14, 5, '#b8a07a').hline(1, 9, 14, '#d6c29c').vline(5, 10, 4, '#a08a66').vline(10, 10, 4, '#a08a66');   // carton
    for (const x of [3, 8, 13]) { g.ellipse(x - 0.5, 6, 2, 3, '#fbf3e2'); g.px(x - 2, 5, '#ffffff').px(x - 2, 4, '#ffffff'); }
    g.ellipse(5, 8.5, 2, 2, '#f3dcb8').ellipse(10.5, 8.5, 2, 2, '#f3dcb8');
  });
  // bread: a golden loaf with slash marks and one slice
  A.draw('hm-bread', (g) => {
    g.ellipse(7, 8.5, 6, 4, '#d9944a').ellipse(7, 7.5, 5, 3, '#e8ad62');
    g.line(4, 6, 5, 9, '#b8742f').line(7, 5, 8, 9, '#b8742f').line(10, 6, 11, 9, '#b8742f');
    g.rect(12, 8, 3, 5, '#f6e2b8').frame(12, 8, 3, 5, '#d9944a');
  });
  // tea: a green tea cup with leaves and steam, a small tea tin behind
  A.draw('hm-tea', (g) => {
    g.rect(9, 3, 5, 8, '#3f8576').rect(9, 3, 5, 2, '#2f6f62').px(11, 7, '#f2cf4a');
    g.rect(2, 8, 7, 5, '#f6f1e6').hline(2, 8, 7, '#9cc46a').px(4, 8, '#6f9a3a').hline(3, 12, 5, '#d9d2c4');
    g.px(8, 9, '#f6f1e6').px(9, 10, '#f6f1e6');
    g.px(4, 6, '#e6eef0').px(5, 5, '#e6eef0').px(4, 4, '#e6eef0').px(6, 6, '#e6eef0').px(7, 5, '#e6eef0');
  });
  // fridge: tall white two-door fridge with a magnet
  A.draw('hm-fridge', (g) => {
    g.rect(2, 1, 12, 22, '#f1f4f6').rect(12, 1, 2, 22, '#d3dade').hline(2, 1, 12, '#ffffff');
    g.hline(2, 8, 12, '#b9c2c9').vline(4, 3, 4, '#9aa3ab').vline(4, 10, 6, '#9aa3ab');
    g.rect(8, 4, 2, 2, '#e8564a').rect(9, 12, 2, 2, '#5aa9e6').rect(7, 15, 3, 2, '#f2cf4a');
    g.rect(3, 23, 2, 1, '#7b858d').rect(11, 23, 2, 1, '#7b858d');
  }, { w: 16, h: 24 });
  // apples: a woven basket of shiny red apples
  A.draw('hm-apples', (g) => {
    g.disc(5, 6, 2.5, '#d9322b').disc(10, 6, 2.5, '#e0452f').disc(7.5, 4.5, 2.5, '#c92a25');
    g.px(4, 5, '#f78a7a').px(9, 5, '#f78a7a').px(7, 3, '#f78a7a').vline(7, 1, 2, '#6e4727').px(8, 1, '#6fae58').px(9, 1, '#6fae58');
    g.rect(2, 8, 12, 6, '#c99a5a').hline(2, 8, 12, '#e0b878');
    for (let x = 3; x < 14; x += 2) g.vline(x, 9, 5, '#a9783f');
    g.hline(2, 11, 12, '#a9783f');
  });

  // ───────────── living room ─────────────
  // flowers: a blue vase with pink and yellow flowers
  A.draw('hm-flowers', (g) => {
    g.vline(6, 4, 6, '#4f9040').vline(9, 3, 7, '#4f9040').line(7, 9, 11, 6, '#4f9040');
    g.disc(6, 3, 1.5, '#f472b6').disc(9.5, 2, 1.5, '#f2cf4a').disc(12, 5, 1.5, '#f472b6');
    g.px(6, 3, '#fde68a').px(9, 2, '#e8564a').px(12, 5, '#fde68a');
    g.rect(5, 9, 6, 6, '#4f7fa8').rect(6, 8, 4, 1, '#4f7fa8').vline(6, 10, 4, '#7fa9d0');
  });
  // TV: a flat screen on a low wooden cabinet, showing the weather: a cloud with rain and a little sun
  A.draw('hm-tv', (g) => {
    g.rect(0, 2, 16, 13, '#26262c').rect(1, 3, 14, 10, '#7cc0e8').rect(1, 3, 14, 3, '#a9d8f2');
    g.disc(4, 5, 2, '#f2c33a');
    g.rect(5, 6, 8, 3, '#ffffff').disc(7, 5.5, 2, '#ffffff').disc(10, 5, 2, '#ffffff').hline(5, 9, 8, '#d9e6ec');
    for (const x of [6, 8, 10, 12]) g.px(x, 11, '#2f6f9a').px(x - 1, 12, '#2f6f9a');
    g.px(14, 13, '#e8564a');                                                                 // power light
    g.rect(6, 15, 4, 2, '#26262c');
    g.rect(0, 17, 16, 6, '#a9743f').hline(0, 17, 16, '#c98f58').frame(1, 19, 6, 3, '#8a5a30').frame(9, 19, 6, 3, '#8a5a30');
    g.rect(1, 23, 2, 1, '#6e4727').rect(13, 23, 2, 1, '#6e4727');
  }, { w: 16, h: 24 });
  // phone: an old red home telephone (handset + round dial) on a little round side table
  A.draw('hm-phone', (g) => {
    g.rect(3, 6, 10, 5, '#d9322b').rect(4, 5, 8, 1, '#d9322b').hline(4, 6, 8, '#f0604f');
    g.disc(8, 8.5, 1.8, '#f6ecd0').px(8, 8, '#2b2b2b');
    g.rect(2, 2, 12, 2, '#b82722').rect(2, 4, 2, 2, '#b82722').rect(12, 4, 2, 2, '#b82722').hline(3, 2, 10, '#e8564a');   // handset
    g.line(13, 9, 15, 12, '#2b2b2b');
    g.ellipse(8, 12.5, 7, 1.5, '#a9743f').hline(2, 12, 12, '#c98f58');
    g.rect(7, 14, 2, 8, '#8a5a30').rect(4, 22, 8, 2, '#6e4727');
  }, { w: 16, h: 24 });
  // cat: an orange tabby sitting, tail curled, green eyes
  A.draw('hm-cat', (g) => {
    const O = '#ee9a45', D2 = '#c8702a';
    g.ellipse(7.5, 11, 4.5, 3.5, O).rect(4, 4, 7, 6, O).px(4, 3, O).px(4, 2, O).px(5, 3, O).px(10, 3, O).px(10, 2, O).px(9, 3, O);
    g.px(4, 3, '#f7b8b0').px(10, 3, '#f7b8b0');
    g.hline(5, 5, 2, D2).hline(8, 5, 2, D2).hline(4, 11, 2, D2).hline(10, 11, 2, D2);
    g.px(5, 7, '#3f8f4a').px(9, 7, '#3f8f4a').px(7, 8, '#e8768a').px(6, 9, '#7a4a2a').px(8, 9, '#7a4a2a');
    g.rect(6, 11, 3, 3, '#fbe8cf');
    g.line(12, 13, 14, 10, O).px(14, 9, O).px(13, 9, D2);
  });

  // ───────────── dining table ─────────────
  // rice: a blue-rimmed bowl heaped with white rice, chopsticks across
  A.draw('hm-rice', (g) => {
    g.ellipse(7.5, 7, 5, 2.5, '#ffffff').px(6, 6, '#eef0f2').px(9, 7, '#eef0f2');
    g.rect(2, 8, 12, 3, '#f6f1e6').rect(3, 11, 10, 1, '#f6f1e6').rect(5, 12, 6, 1, '#d9d2c4').hline(2, 9, 12, '#5aa9e6');
    g.line(1, 4, 14, 7, '#8a5a30');
  });
  // vegetables: a plate of green bok choy with carrot slices
  A.draw('hm-dishes', (g) => {
    g.ellipse(7.5, 9, 7, 3.5, '#f6f1e6').ellipse(7.5, 9, 5.5, 2.5, '#ffffff');
    g.ellipse(6, 8, 3, 1.5, '#5faa4a').ellipse(9.5, 8.5, 2.5, 1.5, '#4f9040').px(5, 8, '#9ad47f').px(9, 8, '#9ad47f');
    g.px(4, 10, '#f08a3a').px(11, 10, '#f08a3a').px(8, 10, '#f08a3a');
  });
  // fruit: a bowl with an apple, a banana and grapes
  A.draw('hm-fruit', (g) => {
    g.disc(5, 6, 2, '#d9322b').px(4, 5, '#f78a7a').px(5, 3, '#6e4727');
    g.line(7, 4, 12, 6, '#f2cf4a').line(7, 5, 12, 7, '#f2cf4a').px(12, 5, '#8a6a1d');
    for (const [x, y] of [[9, 7], [11, 7], [10, 8], [8, 8]]) g.px(x, y, '#8a4fb0');
    g.rect(2, 8, 12, 3, '#e8a35a').rect(4, 11, 8, 1, '#e8a35a').hline(2, 8, 12, '#f4c27f');
  });
  // dumplings: a plate of plump white dumplings
  A.draw('hm-dumplings', (g) => {
    g.ellipse(7.5, 11, 7, 3, '#5aa9e6').ellipse(7.5, 11, 6, 2.2, '#f6f1e6');
    const dump = (x, y) => { g.ellipse(x, y, 3, 2, '#fbf6ea').hline(x - 3, y + 2, 7, '#e8dcc0'); g.px(x - 2, y - 2, '#e8dcc0').px(x, y - 2, '#e8dcc0').px(x + 2, y - 2, '#e8dcc0'); };
    dump(4, 9); dump(11, 9); dump(7.5, 6);
  });
  // cups: two mugs, one red, one white
  A.draw('hm-cups', (g) => {
    const mug = (x, y, col) => { g.rect(x, y, 5, 5, col).hline(x, y, 5, A.c.dk(col, 0.35)).px(x + 5, y + 1, col).px(x + 6, y + 2, col).px(x + 5, y + 3, col); };
    mug(1, 6, '#e8564a'); mug(8, 8, '#f6f1e6');
  });
  // mobile phone: a smartphone lying on the table, its screen lit with app squares
  A.draw('hm-mobile', (g) => {
    g.rect(4, 3, 8, 12, '#2b2b33').rect(5, 4, 6, 9, '#7cc0e8');
    for (const [x, y, col] of [[5, 5, '#f2cf4a'], [8, 5, '#e8564a'], [5, 8, '#6fae58'], [8, 8, '#f472b6']]) g.rect(x, y, 2, 2, col);
    g.px(7, 13, '#7b858d').px(8, 13, '#7b858d');
  });
  // chairs: a wooden chair with a red cushion
  ['hm-chair-1', 'hm-chair-2', 'hm-chair-3', 'hm-chair-4'].forEach((key) => A.draw(key, (g) => {
    g.rect(3, 1, 10, 7, '#a9743f').rect(4, 2, 8, 2, '#c98f58').vline(7, 4, 4, '#8a5a30').vline(8, 4, 4, '#8a5a30');
    g.rect(2, 8, 12, 3, '#d9634a').hline(2, 8, 12, '#ef8a6a');
    g.rect(3, 11, 2, 4, '#8a5a30').rect(11, 11, 2, 4, '#8a5a30');
  }));

  // ───────────── bedroom & study corner ─────────────
  // computer: a monitor with a game on screen, a keyboard, on a small desk
  A.draw('hm-computer', (g) => {
    g.rect(2, 2, 12, 9, '#2b2b33').rect(3, 3, 10, 7, '#3f6fb0');
    g.rect(4, 7, 3, 2, '#6fae58').rect(9, 5, 2, 2, '#f2cf4a').px(6, 4, '#ffffff').px(11, 8, '#e8564a');
    g.rect(7, 11, 2, 2, '#2b2b33');
    g.rect(0, 13, 16, 3, '#c98f58').hline(0, 13, 16, '#e0ad74');
    g.rect(3, 13, 9, 1, '#e9e4da').px(13, 13, '#e9e4da');
    g.rect(1, 16, 2, 8, '#8a5a30').rect(13, 16, 2, 8, '#8a5a30').rect(3, 16, 10, 2, '#a9743f');
  }, { w: 16, h: 24 });
  // books: a tall bookshelf full of colourful books
  A.draw('hm-books', (g) => {
    g.rect(1, 1, 14, 23, '#8a5a30').rect(2, 2, 12, 21, '#6e4727');
    const cols = ['#d9322b', '#5aa9e6', '#f2cf4a', '#6fae58', '#8a4fb0', '#f08a3a', '#f6f1e6'];
    for (let s = 0; s < 3; s++) {
      const y = 2 + s * 7;
      for (let x = 2, i = s; x < 14; i++) { const w = 1 + ((i * 3) % 2); g.rect(x, y + 1 + (i % 3 === 0 ? 1 : 0), w, 6 - (i % 3 === 0 ? 1 : 0), cols[(i * 2 + s) % cols.length]); x += w + (i % 4 === 3 ? 1 : 0); }
      g.hline(1, y + 7, 14, '#a9743f');
    }
  }, { w: 16, h: 24 });
  // football: black and white
  A.draw('hm-ball', (g) => {
    g.disc(7.5, 9.5, 5, '#ffffff');
    g.rect(6, 8, 3, 3, '#2b2b2b').px(7, 7, '#2b2b2b').px(3, 9, '#2b2b2b').px(3, 10, '#2b2b2b').px(12, 9, '#2b2b2b').px(12, 10, '#2b2b2b').px(5, 13, '#2b2b2b').px(10, 13, '#2b2b2b').px(7, 5, '#2b2b2b').px(8, 5, '#2b2b2b');
    g.px(5, 7, '#e6e6e6').px(5, 6, '#e6e6e6');
  });
  // clothes: an open wardrobe with shirts and a dress on hangers
  A.draw('hm-clothes', (g) => {
    g.rect(1, 1, 14, 23, '#a9743f').rect(2, 3, 12, 19, '#5e3a1b').hline(1, 1, 14, '#c98f58');
    g.hline(2, 4, 12, '#b9c2c9');
    const shirt = (x, col) => { g.px(x + 1, 5, '#b9c2c9'); g.rect(x, 6, 3, 8, col).px(x - 1, 7, col).px(x + 3, 7, col).px(x + 1, 6, A.c.lt(col, 0.4)); };
    shirt(3, '#e8564a'); shirt(7, '#5aa9e6'); shirt(11, '#f2cf4a');
    g.rect(3, 16, 10, 5, '#7b4f27').frame(3, 16, 10, 5, '#a9743f').px(8, 18, '#f2cf4a');
    g.rect(2, 22, 2, 2, '#6e4727').rect(12, 22, 2, 2, '#6e4727');
  }, { w: 16, h: 24 });
  // schoolbag: a purple backpack with a front pocket and a keyring
  A.draw('hm-schoolbag', (g) => {
    g.rect(3, 3, 10, 11, '#7a5bb0').rect(4, 2, 8, 1, '#7a5bb0').hline(4, 3, 8, '#9a7bd0');
    g.rect(4, 8, 8, 5, '#6a4b9f').hline(4, 8, 8, '#f2cf4a');
    g.vline(6, 0, 3, '#4f3a7a').vline(9, 0, 3, '#4f3a7a').hline(6, 0, 4, '#4f3a7a');
    g.px(12, 10, '#f472b6').px(13, 11, '#f472b6');
  });
  // desk: a small study desk with an open exercise book, a pencil and a lamp
  A.draw('hm-desk', (g) => {
    g.rect(0, 6, 16, 3, '#c98f58').hline(0, 6, 16, '#e0ad74').hline(0, 9, 16, '#8a5a30');
    g.rect(1, 3, 10, 5, '#fffaf0');                                                         // practice sheet with red grid squares
    g.frame(2, 4, 4, 3, '#e8826a').frame(6, 4, 4, 3, '#e8826a');
    g.hline(3, 5, 2, '#2b2b2b').vline(8, 4, 3, '#2b2b2b').hline(7, 5, 2, '#2b2b2b');
    g.line(11, 7, 14, 4, '#f2cf4a').px(14, 4, '#f472b6');                                  // pencil
    g.rect(1, 10, 2, 6, '#8a5a30').rect(13, 10, 2, 6, '#8a5a30').rect(3, 10, 10, 3, '#a9743f');
  });
})(window.MSC = window.MSC || {});

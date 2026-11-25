/* ART for the school: Xiao Hong, the school's own floors and walls, the door, and everything to learn. See js/core/art.js. */
(function (MSC) {
  const A = MSC.art;
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };
  const D = (key, fn, o) => A.draw(key, fn, o);
  const INK = '#2b2b2b', WOOD = '#b98450', WOOD_D = '#8a5a30', PAPER = '#fbf6e6';

  // ───────────── Xiao Hong: a cheerful student — ponytail with a red tie, a blue tracksuit jacket with a white stripe, a red schoolbag ─────────────
  A.person('xiaohong', { skin: '#f2c49d', hair: '#3a2418', hairStyle: 'short', top: '#3b86d4', bottom: '#2c3a5e', shoes: '#f4f1e8', bag: '#d9453a' });
  {
    const d = A.defs.xiaohong, g = new A.Painter(d.w, d.h); g.p = d.p;
    g.vline(7, 12, 8, '#ffffff').vline(8, 12, 8, '#ffffff').px(6, 12, '#ffffff').px(9, 12, '#ffffff');   // jacket zip stripe + collar
    g.rect(12, 3, 2, 6, '#3a2418').px(13, 9, '#3a2418').px(12, 4, '#d9322b').px(12, 5, '#d9322b');       // ponytail and its red tie
    g.px(6, 4, null).px(5, 4, '#3a2418');                                                                 // a fringe
    g.rect(5, 12, 1, 3, '#2c5da0');                                                                       // jacket seam
  }

  // ───────────── the door out ─────────────
  // double school doors seen from inside: pale frame, two glass panes with daylight, steel push bars
  D('door-school-out', (g) => {
    g.rect(1, 1, 14, 23, '#8f98a3');
    g.rect(2, 2, 6, 22, '#d6dde3').rect(8, 2, 6, 22, '#d6dde3');
    g.rect(3, 3, 4, 11, '#bfe3f4').rect(9, 3, 4, 11, '#bfe3f4').rect(3, 3, 4, 3, '#e3f4fb').rect(9, 3, 4, 3, '#e3f4fb');
    g.vline(7, 2, 22, '#7b848f');
    g.hline(3, 17, 4, '#aab3bc').hline(9, 17, 4, '#aab3bc');
    g.px(6, 15, '#6b7480').px(9, 15, '#6b7480').vline(6, 15, 3, '#6b7480').vline(9, 15, 3, '#6b7480');
    g.hline(1, 1, 14, '#aeb7c1');
  }, { w: 16, h: 24, shadow: false });

  // ───────────── ground tiles (school only) ─────────────
  const WALL = '#e9eef0', WALL_D = '#d4dde1', SKIRT = '#6f9fb6';
  const wallBase = (g, r) => {
    g.rect(0, 0, 16, 16, WALL);
    g.rect(0, 11, 16, 5, SKIRT).hline(0, 11, 16, '#9bc3d6').hline(0, 15, 16, '#4f7f96');
    g.hline(0, 0, 16, '#f7fafb');
    speckle(g, r, 3, [WALL_D]);
  };
  A.tile('W', [0, 1].map(() => (g, c, r) => wallBase(g, r)), 'school');
  // Q — a green blackboard in a wooden frame, a chalk smudge and a tray
  A.tile('Q', [0, 1].map((v) => (g, c, r) => {
    wallBase(g, r);
    g.rect(0, 1, 16, 10, WOOD).rect(1, 2, 14, 8, '#2f5a46').rect(1, 2, 14, 2, '#3b6b54');
    g.hline(0, 10, 16, WOOD_D).hline(0, 1, 16, '#d09a64');
    g.hline(3 + v, 5, 4, 'rgba(255,255,255,.35)').hline(9, 7, 3, 'rgba(255,255,255,.3)').px(12, 4, 'rgba(255,255,255,.35)');
    g.rect(4 + v * 6, 9, 3, 1, '#f1efe6');
  }), 'school');
  // N — cork notice-board wall with pins
  A.tile('N', [(g, c, r) => {
    wallBase(g, r);
    g.rect(0, 1, 16, 10, WOOD).rect(1, 2, 14, 8, '#c8955c');
    speckle(g, r, 14, ['#b3814c', '#d8a96f']);
    g.px(2, 3, '#d9322b').px(13, 8, '#2f7fc8').px(8, 9, '#2f9a5a');
    g.hline(0, 10, 16, WOOD_D).hline(0, 1, 16, '#d09a64');
  }], 'school');
  // P — warm wooden classroom floor
  A.tile('P', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#d6a86c');
    for (let y = 0; y < 16; y += 4) { g.hline(0, y, 16, '#b98450'); const off = ((y >> 2) + v) % 2 ? 4 : 10; g.vline(off, y, 4, '#b98450'); }
    speckle(g, r, 6, ['#e2b97d', '#c6955a']);
  }), 'school');
  // H — pale hall floor of big light tiles
  A.tile('H', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#e6e2d6');
    g.rect(0, 0, 8, 8, '#ece8dc').rect(8, 8, 8, 8, '#ece8dc');
    g.hline(0, 7, 16, '#cdc8b8').vline(7, 0, 16, '#cdc8b8').hline(0, 15, 16, '#cdc8b8').vline(15, 0, 16, '#cdc8b8');
    speckle(g, r, 4 + v, ['#d6d1c1', '#f4f1e8']);
  }), 'school');
  // T — red running track with a white lane line
  A.tile('T', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#c8543f');
    g.hline(0, 0, 16, '#f4efe6').hline(0, 15, 16, '#f4efe6');
    speckle(g, r, 14, ['#b84632', '#d6694f']);
    g.hline(0, 8, 6, 'rgba(255,255,255,.18)');
  }), 'school');
  // D — the door mat: a blue mat on the hall floor
  A.tile('D', [(g, c, r) => {
    g.rect(0, 0, 16, 16, '#e6e2d6').hline(0, 15, 16, '#cdc8b8');
    g.rect(1, 2, 14, 12, '#4a6fa5').frame(1, 2, 14, 12, '#34527f');
    for (let x = 3; x < 14; x += 2) g.vline(x, 4, 8, '#5b82bb');
  }], 'school');

  // ───────────── classroom things ─────────────
  D('sc-desk', (g) => {                                                       // a student desk: wooden top, metal legs, a drawer shadow
    g.rect(1, 5, 14, 4, WOOD).hline(1, 5, 14, '#d09a64').hline(1, 8, 14, WOOD_D);
    g.rect(2, 9, 2, 6, '#7b848f').rect(12, 9, 2, 6, '#7b848f').hline(2, 13, 12, '#9aa4ae');
    g.rect(3, 9, 10, 2, '#a0734a');
  });
  D('sc-chair', (g) => {                                                      // a chair seen from the front: blue seat, back, metal legs
    g.rect(3, 2, 10, 5, '#3f7fc4').hline(3, 2, 10, '#6aa2de').rect(4, 7, 8, 2, '#2f6aa8');
    g.rect(4, 9, 1, 6, '#7b848f').rect(11, 9, 1, 6, '#7b848f').rect(6, 9, 4, 1, '#7b848f');
  });
  D('sc-teacher-desk', (g) => {                                               // the teacher's big desk with a mug and stacked books
    g.rect(0, 5, 16, 5, '#a8703f').hline(0, 5, 16, '#cf9a62').hline(0, 9, 16, WOOD_D);
    g.rect(1, 10, 3, 5, '#8a5a30').rect(12, 10, 3, 5, '#8a5a30').rect(4, 10, 8, 3, '#7a4f29');
    g.rect(2, 3, 5, 2, '#d9453a').rect(2, 2, 5, 1, '#2f7fc8');
    g.rect(10, 2, 3, 3, '#f4f1e8').px(13, 3, '#f4f1e8').px(11, 1, '#cfd6db');
  });
  D('sc-notebook', (g) => {                                                   // 本子: a spiral notebook with a blue cover
    g.rect(3, 2, 10, 12, '#3f7fc4').rect(4, 3, 9, 11, '#2f6aa8').rect(5, 5, 6, 3, '#f1efe6');
    for (let y = 3; y < 13; y += 2) g.px(3, y, '#e8e8e8');
    g.hline(6, 6, 4, '#9aa6b2');
  });
  D('sc-pen', (g) => {                                                        // 笔: a pen lying diagonally, red barrel, silver tip
    g.line(3, 12, 12, 3, '#d9322b').line(4, 12, 13, 3, '#e8564a').line(2, 13, 3, 12, '#4a4a4a').px(12, 3, '#2b2b2b').px(13, 4, '#cfd6db');
    g.line(4, 11, 11, 4, '#b82a22');
  });
  D('sc-testpaper', (g) => {                                                  // 考: an exam paper with lines and a red tick
    g.rect(3, 1, 10, 14, PAPER).hline(5, 4, 6, '#9aa6b2').hline(5, 6, 6, '#9aa6b2').hline(5, 8, 4, '#9aa6b2').hline(5, 10, 6, '#9aa6b2');
    g.line(9, 12, 10, 13, '#d9322b').line(10, 13, 12, 10, '#d9322b');
  });
  D('sc-nametag', (g) => {                                                    // 名: a name card standing on a desk
    g.rect(2, 5, 12, 6, PAPER).frame(2, 5, 12, 6, '#d6cfb4').hline(4, 7, 8, '#7b858d').hline(5, 9, 6, '#7b858d');
    g.rect(5, 11, 6, 2, '#b3a98c');
  });
  D('sc-watch', (g) => {                                                      // 手表: a wrist watch lying flat — blue strap, round white face
    g.rect(6, 1, 4, 5, '#2f6aa8').rect(6, 10, 4, 5, '#2f6aa8');
    g.disc(8, 8, 4, '#c9cfd6').disc(8, 8, 3, '#ffffff').px(8, 6, INK).px(8, 7, INK).px(9, 8, INK).px(7, 9, '#d9322b');
  });
  D('sc-seat', (g) => {                                                       // 位: a seat card with a number on a little stand
    g.rect(3, 4, 10, 8, '#f6d36a').frame(3, 4, 10, 8, '#c9a227');
    g.rect(7, 6, 2, 4, '#b78a14').px(6, 7, '#b78a14').hline(6, 9, 4, '#b78a14');
    g.rect(5, 12, 6, 2, '#8a5a30');
  });
  D('sc-wordcard', (g) => {                                                   // 词: a word card pinned to the board — cream card, red border, a brush stroke
    g.rect(3, 2, 10, 11, PAPER).frame(3, 2, 10, 11, '#d9453a');
    g.rect(6, 4, 4, 1, INK).vline(8, 4, 6, INK).rect(5, 8, 2, 2, INK).rect(9, 8, 2, 2, INK);
    g.px(8, 1, '#d9322b');
  });
  D('sc-classroom-sign', (g) => {                                             // 教室: a sign over the door — blue plate with a white door-and-desk picture
    g.rect(1, 3, 14, 8, '#2f6aa8').frame(1, 3, 14, 8, '#1f4a7a');
    g.rect(3, 5, 4, 5, '#ffffff').rect(4, 6, 2, 4, '#2f6aa8').rect(9, 6, 4, 1, '#ffffff').rect(9, 9, 1, 1, '#ffffff').rect(12, 9, 1, 1, '#ffffff').rect(9, 7, 4, 2, '#cfe3f4');
  });
  D('sc-cupboard', (g) => {                                                   // 里面: a cupboard with its doors open — books inside
    g.rect(1, 1, 14, 14, '#8a5a30').rect(3, 2, 10, 12, '#4b3320');
    g.hline(3, 7, 10, '#a0734a').rect(4, 3, 2, 4, '#d9453a').rect(6, 4, 2, 3, '#3f7fc4').rect(8, 3, 2, 4, '#f6d36a').rect(5, 9, 3, 4, '#5aa05a').rect(9, 10, 3, 3, '#d9453a');
    g.rect(0, 2, 2, 12, '#a0734a').rect(14, 2, 2, 12, '#a0734a');
  });
  D('sc-shelf', (g) => {                                                      // 上面: books and a small globe ON TOP of a shelf (arrow-free, clear)
    g.rect(2, 8, 12, 3, '#a0734a').hline(2, 8, 12, '#cf9a62').rect(3, 11, 2, 4, '#8a5a30').rect(11, 11, 2, 4, '#8a5a30');
    g.rect(3, 3, 2, 5, '#d9453a').rect(5, 4, 2, 4, '#3f7fc4').rect(7, 2, 2, 6, '#5aa05a');
    g.disc(11.5, 5.5, 2.5, '#5a9fd6').px(11, 5, '#6fbf6f').px(12, 6, '#6fbf6f');
  });
  D('sc-box', (g) => {                                                        // 下面: a cardboard box UNDER the shelf, lid flaps open
    g.rect(2, 6, 12, 9, '#c8955c').frame(2, 6, 12, 9, '#9a6e3c').hline(2, 8, 12, '#b3814c');
    g.rect(6, 6, 4, 2, '#e6c28f').line(2, 6, 0, 3, '#b3814c').line(13, 6, 15, 3, '#b3814c');
  });
  D('sc-timetable', (g) => {                                                  // 周: a weekly timetable — a coloured grid
    g.rect(1, 2, 14, 12, PAPER).frame(1, 2, 14, 12, '#9aa6b2').rect(1, 2, 14, 2, '#2f6aa8');
    for (let y = 5; y < 13; y += 2) for (let x = 2; x < 14; x += 3) g.rect(x, y, 2, 1, ((x + y) % 3 ? '#e8564a' : '#4aa56a'));
    g.vline(5, 4, 9, '#cfd6db').vline(9, 4, 9, '#cfd6db');
  });

  // ───────────── notice board and corridor ─────────────
  D('sc-notice-start', (g) => {                                               // 开学: a bright poster with a school-gate and a sun
    g.rect(2, 2, 12, 11, '#fff6c9').frame(2, 2, 12, 11, '#e0b94a');
    g.disc(11, 5, 1.5, '#f6a623').rect(4, 7, 8, 5, '#e8564a').rect(7, 9, 2, 3, '#f6e7b0').hline(3, 6, 10, '#c8493a').px(8, 1, '#2f7fc8');
  });
  D('sc-notice-exam', (g) => {                                                // 考试: an exam timetable notice with a red heading
    g.rect(2, 2, 12, 12, PAPER).frame(2, 2, 12, 12, '#d6cfb4').rect(3, 3, 10, 3, '#d9322b');
    g.hline(4, 8, 8, '#7b858d').hline(4, 10, 8, '#7b858d').hline(4, 12, 5, '#7b858d').px(8, 1, '#2f7fc8');
  });
  D('sc-names', (g) => {                                                      // 姓名: a class list — header, rows of names
    g.rect(3, 1, 10, 14, PAPER).frame(3, 1, 10, 14, '#d6cfb4').rect(4, 2, 8, 2, '#2f6aa8');
    for (let y = 5; y < 14; y += 2) { g.px(4, y, '#d9322b'); g.hline(6, y, 5, '#7b858d'); }
  });
  D('sc-score', (g) => {                                                      // 分: a score board — dark panel with two lit numbers
    g.rect(1, 3, 14, 9, '#2b3340').frame(1, 3, 14, 9, '#1d232d');
    g.rect(3, 5, 4, 5, '#3b4656').rect(9, 5, 4, 5, '#3b4656');
    g.hline(4, 5, 2, '#ffd34d').vline(5, 5, 5, '#ffd34d').hline(4, 9, 2, '#ffd34d');
    g.hline(10, 5, 2, '#6fe08f').vline(12, 5, 3, '#6fe08f').hline(10, 7, 3, '#6fe08f').vline(10, 7, 3, '#6fe08f').hline(10, 9, 3, '#6fe08f');
  });
  D('sc-gate-sign', (g) => {                                                  // 高中: the school name plaque — red plate with gold frame
    g.rect(0, 3, 16, 9, '#a52a2a').frame(0, 3, 16, 9, '#e0b94a');
    g.rect(3, 6, 10, 1, '#f6e7b0').rect(3, 9, 10, 1, '#f6e7b0').rect(7, 5, 2, 6, '#f6e7b0');
  });
  D('sc-sign-left', (g) => {                                                  // 左: a blue sign with an arrow to the left
    g.rect(1, 4, 14, 8, '#2f6aa8').frame(1, 4, 14, 8, '#1f4a7a');
    g.hline(5, 8, 8, '#ffffff').line(5, 8, 8, 5, '#ffffff').line(5, 8, 8, 11, '#ffffff');
  });
  D('sc-sign-right', (g) => {                                                 // 右: a green sign with an arrow to the right
    g.rect(1, 4, 14, 8, '#2f8a5a').frame(1, 4, 14, 8, '#1f6a40');
    g.hline(3, 8, 8, '#ffffff').line(10, 8, 7, 5, '#ffffff').line(10, 8, 7, 11, '#ffffff');
  });

  // ───────────── sports ─────────────
  D('sc-ball', (g) => {                                                       // 球: a plain light-blue and white beach-style ball
    g.disc(8, 8, 6, '#ffffff').disc(8, 8, 6, '#ffffff');
    g.rect(4, 3, 3, 10, '#4a9fe0').rect(9, 3, 3, 10, '#e8564a').rect(7, 2, 2, 12, '#ffffff').px(7, 8, '#f6d36a').px(8, 8, '#f6d36a');
    g.disc(5, 5, 1, '#9fd0f2');
  });
  D('sc-basketball', (g) => {                                                 // 篮球: orange ball with black seams
    g.disc(8, 8, 6, '#e8872e').disc(6, 6, 2, '#f2a352');
    g.vline(8, 2, 12, '#3b2a1d').hline(2, 8, 12, '#3b2a1d').line(4, 3, 6, 6, '#3b2a1d').line(12, 3, 10, 6, '#3b2a1d').line(4, 13, 6, 10, '#3b2a1d').line(12, 13, 10, 10, '#3b2a1d');
  });
  D('sc-football', (g) => {                                                   // 足球: white ball with black pentagons
    g.disc(8, 8, 6, '#f4f1e8');
    g.rect(7, 7, 2, 2, INK).rect(4, 4, 2, 2, INK).rect(10, 4, 2, 2, INK).rect(4, 10, 2, 2, INK).rect(10, 10, 2, 2, INK).rect(7, 2, 2, 1, INK).rect(7, 13, 2, 1, INK);
    g.line(6, 6, 5, 5, '#9aa6b2').line(9, 6, 10, 5, '#9aa6b2').line(6, 9, 5, 10, '#9aa6b2').line(9, 9, 10, 10, '#9aa6b2');
  });
  D('sc-shoes', (g) => {                                                      // 跑: a pair of running shoes — white with a red swoosh
    g.rect(1, 6, 7, 6, '#f4f1e8').rect(8, 3, 7, 6, '#f4f1e8');
    g.rect(1, 11, 7, 2, '#d9453a').rect(8, 8, 7, 2, '#d9453a').hline(2, 8, 4, '#e8564a').hline(9, 5, 4, '#e8564a');
    g.px(2, 6, '#9aa6b2').px(9, 3, '#9aa6b2');
  });
  D('sc-dance', (g) => {                                                      // 跳舞: a little speaker playing music, with notes
    g.rect(3, 6, 10, 9, '#4a4f5c').frame(3, 6, 10, 9, '#2f333d').disc(8, 9, 2, '#2b2f38').disc(8, 9, 1, '#6b7280').disc(8, 13, 1, '#2b2f38');
    g.rect(10, 1, 1, 4, '#e8564a').rect(8, 4, 3, 2, '#e8564a').rect(5, 2, 1, 3, '#f6d36a').rect(4, 4, 2, 1, '#f6d36a');
  });
  D('sc-swim', (g) => {                                                       // 游: swimming goggles on a blue swim ring
    g.disc(8, 9, 6, '#4a9fe0').disc(8, 9, 3, 'rgba(0,0,0,0)');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x - 7.5) ** 2 + (y - 8.5) ** 2 < 10) g.p[y * 16 + x] = null;
    g.hline(5, 3, 3, '#ffffff').hline(10, 12, 3, '#ffffff');
    g.rect(2, 7, 5, 3, '#2b2f38').rect(9, 7, 5, 3, '#2b2f38').rect(3, 8, 3, 1, '#9fe0f2').rect(10, 8, 3, 1, '#9fe0f2').rect(7, 8, 2, 1, '#2b2f38');
  });
  D('sc-track-sign', (g) => {                                                 // 跑步: a start line sign — a runner on a post
    g.rect(7, 8, 2, 7, '#7b848f').rect(2, 1, 12, 8, '#f6d36a').frame(2, 1, 12, 8, '#c9a227');
    g.disc(7, 3, 1, INK).line(7, 4, 7, 6, INK).line(7, 5, 5, 6, INK).line(7, 5, 10, 4, INK).line(7, 6, 5, 8, INK).line(7, 6, 10, 8, INK);
  });
})(window.MSC = window.MSC || {});

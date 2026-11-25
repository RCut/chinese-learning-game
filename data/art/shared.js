/*
 * ART — shared: the people who stand around the places, the ground tiles several places use, and board texture.
 * Per-place art lives in data/art/<place>.js (objects, doors, and that place's own tiles). See js/core/art.js for how to draw.
 * Preview everything:  node tools/art-sheet.js out.png
 */
(function (MSC) {
  const A = MSC.art;

  // ───────────── people (16×24) ─────────────
  A.person('player', { skin: '#f2c7a0', hair: '#5a3a22', hairStyle: 'short', top: '#d9634a', bottom: '#3d4a6b', bag: '#2f6f8f' });
  A.person('barista', { skin: '#f0c4a0', hair: '#2b2b2b', hairStyle: 'bun', top: '#8c5a35', bottom: '#3a3a3a', apron: '#f4efe6' });
  A.person('wang', { skin: '#e8b98f', hair: '#cfcfcf', hairStyle: 'bald', hat: '#2a2a2a', brim: false, robe: '#3b4a8c', sash: '#c9a227', beard: '#ececec', top: '#3b4a8c' });
  A.person('friend', { skin: '#f2c7a0', hair: '#1f1f1f', hairStyle: 'short', top: '#2aa198', bottom: '#5b6b8c', bag: '#e0b050' });
  A.person('passerby', { skin: '#e9bd96', hair: '#6b3f1d', hairStyle: 'short', hat: '#c9a063', top: '#6b8e4e', bottom: '#6b5a3d', bag: '#8a4f2a', glasses: '#3b2a1d' });
  A.person('grocer', { skin: '#e6b48c', hair: '#2a2a2a', hairStyle: 'short', hat: '#f3efe3', brim: false, top: '#e9e3d3', bottom: '#4a4a4a', apron: '#2f7d4a' });

  // ───────────── ground tiles (16×16, a few variants each) ─────────────
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };

  // G — grass
  A.tile('G', [
    (g, c, r) => { g.rect(0, 0, 16, 16, '#86c06c'); speckle(g, r, 22, ['#6fae58', '#9ad47f', '#78b862']); },
    (g, c, r) => { g.rect(0, 0, 16, 16, '#86c06c'); speckle(g, r, 14, ['#6fae58', '#9ad47f']); g.px(4, 9, '#4f9040').px(4, 8, '#4f9040').px(5, 9, '#4f9040'); g.px(11, 4, '#4f9040').px(11, 3, '#4f9040').px(12, 4, '#4f9040'); },
    (g, c, r) => { g.rect(0, 0, 16, 16, '#86c06c'); speckle(g, r, 16, ['#6fae58', '#9ad47f']); g.px(9, 10, '#ffffff').px(8, 10, '#fde68a').px(10, 10, '#fde68a').px(9, 9, '#fde68a').px(9, 11, '#fde68a').px(9, 10, '#f472b6'); },
  ]);

  // S — sidewalk paving
  A.tile('S', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#d9d1c2');
    for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) { g.hline(x, y, 8, '#c4baa7').vline(x, y, 8, '#c4baa7'); }
    g.hline(0, 8 + (v === 1 ? 1 : 0), 16, '#c4baa7');
    speckle(g, r, 10, ['#e6dfd2', '#cfc6b4']);
  }));

  // R — asphalt
  A.tile('R', [0, 1, 2].map(() => (g, c, r) => { g.rect(0, 0, 16, 16, '#58544f'); speckle(g, r, 28, ['#625e58', '#4d4944', '#69645d']); }));

  // B — the street-side building front (wooden shop fronts under a tiled roof line)
  A.tile('B', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#a45b3a');
    for (let y = 3; y < 16; y += 4) g.hline(0, y, 16, '#8a4a2d');
    g.rect(0, 0, 16, 3, '#7a3d27').hline(0, 3, 16, '#5e2d1b');
    for (let x = v * 4; x < 16; x += 8) g.vline(x, 4, 12, '#93513a');
    speckle(g, r, 8, ['#b56a47', '#94512f']);
    g.hline(0, 15, 16, '#6f3822');
  }));

  // W — interior wall (dark wood panelling)
  A.tile('W', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#6e4727');
    for (let x = 0; x < 16; x += 4) g.vline(x + (v ? 1 : 0), 0, 16, '#573719');
    g.rect(0, 12, 16, 4, '#4f321a').hline(0, 12, 16, '#8a5d34');
    g.hline(0, 0, 16, '#8a5d34');
    speckle(g, r, 8, ['#7d5330', '#603d20']);
  }));

  // F — café floor (cream & tan checks)
  A.tile('F', [(g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) g.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#dcc5a2' : '#efdfc4'); g.hline(0, 0, 16, 'rgba(255,255,255,.25)'); }]);

  // C — counter
  A.tile('C', [(g) => {
    g.rect(0, 0, 16, 16, '#9a6a3e'); g.rect(0, 0, 16, 5, '#c89460').hline(0, 0, 16, '#e3b783').hline(0, 5, 16, '#6e4727');
    g.rect(1, 7, 6, 7, '#87582f').rect(9, 7, 6, 7, '#87582f').frame(1, 7, 6, 7, '#6e4727').frame(9, 7, 6, 7, '#6e4727');
  }]);

  // P — wooden floor
  A.tile('P', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#dcbd90');
    for (let y = 0; y < 16; y += 4) { g.hline(0, y + 3, 16, '#bf9b6b'); g.hline(0, y, 16, '#e7cda6'); g.px((y * 3 + v * 5) % 16, y + 1, '#bf9b6b').px((y * 3 + v * 5) % 16, y + 2, '#bf9b6b'); }
    speckle(g, r, 6, ['#cfae80', '#e9d1ab']);
  }));

  // M — market flagstones
  A.tile('M', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#d0c7b7');
    g.hline(0, 5 + v, 16, '#b8ae9c').hline(0, 11 - v, 16, '#b8ae9c').vline(4 + v * 2, 0, 5 + v, '#b8ae9c').vline(11 - v, 6 + v, 5, '#b8ae9c').vline(6, 12 - v, 4, '#b8ae9c');
    speckle(g, r, 12, ['#dcd3c4', '#c3b9a7']);
  }));

  // L — stall table (products stand on it)
  A.tile('L', [(g) => {
    g.rect(0, 0, 16, 16, '#a9743f'); g.rect(0, 0, 16, 9, '#d3a066').hline(0, 0, 16, '#e8bd88').hline(0, 4, 16, '#c28d55').hline(0, 9, 16, '#7b4f27');
    for (let x = 3; x < 16; x += 5) g.vline(x, 10, 6, '#7b4f27');
    g.hline(0, 15, 16, '#5e3a1b');
  }]);

  // D — door mat
  A.tile('D', [(g) => {
    g.rect(0, 0, 16, 16, '#8f5a33'); g.frame(1, 1, 14, 14, '#c9a26b'); g.frame(3, 3, 10, 10, '#6e4423');
    for (let y = 5; y < 12; y += 2) g.hline(5, y, 6, '#b07f4a');
    g.hline(1, 15, 14, '#b88a55');
  }]);

  // A — striped awning (red & cream, scalloped)
  A.tile('A', [(g) => {
    g.rect(0, 0, 16, 16, '#b9ae9b');                                    // shade under the scallops, so the tile is fully painted
    for (let x = 0; x < 16; x++) g.vline(x, 0, 12, (x >> 2) % 2 ? '#f6ecd0' : '#c8472f');
    for (let x = 0; x < 16; x++) { const s = (x >> 2) % 2 ? '#f6ecd0' : '#c8472f'; g.vline(x, 12, (x % 4 === 0 || x % 4 === 3) ? 2 : 3, s); }
    g.hline(0, 0, 16, '#8f2f1c').hline(0, 11, 16, 'rgba(0,0,0,.18)');
  }]);

  // ───────────── board texture (not things to learn) ─────────────
  A.draw('road-dash', (g) => { g.rect(2, 7, 12, 2, '#f2cf4a'); }, { outline: false, shadow: false });
  A.draw('zebra', (g) => { for (let y = 1; y < 16; y += 4) g.rect(1, y, 14, 2, '#f1efe8'); }, { outline: false, shadow: false });
  A.draw('shelter', (g) => { g.rect(0, 0, 16, 5, 'rgba(120,190,230,.55)'); g.hline(0, 0, 16, '#2f6f9a').hline(0, 5, 16, '#2f6f9a'); g.vline(0, 0, 16, '#2f6f9a'); g.vline(15, 0, 16, '#2f6f9a'); }, { outline: false, shadow: false });
  A.draw('compass', (g, c) => { g.disc(7.5, 7.5, 6.5, '#e0b24a'); g.disc(7.5, 7.5, 5, '#fff7e0'); g.line(7, 3, 8, 7, '#d9482b').line(8, 3, 8, 7, '#d9482b'); g.line(7, 8, 7, 12, '#4a5a7a').line(8, 8, 8, 12, '#4a5a7a'); g.px(7, 7, '#3b2a1d').px(8, 8, '#3b2a1d'); g.px(7, 1, '#8a6a1d').px(8, 1, '#8a6a1d'); }, { shadow: false });
  A.draw('bubble', (g) => { g.rect(1, 1, 14, 9, '#ffffff'); g.rect(0, 2, 16, 7, '#ffffff'); g.px(6, 11, '#ffffff').px(7, 11, '#ffffff').px(7, 12, '#ffffff'); g.px(4, 5, '#3b2a1d').px(8, 5, '#3b2a1d').px(12, 5, '#3b2a1d'); }, { w: 16, h: 16, shadow: false });
})(window.MSC = window.MSC || {});

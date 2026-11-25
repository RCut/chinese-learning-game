/* ART for the market stage: its objects, people, doors and its own ground tiles. See js/core/art.js (how to draw) and tools/art-sheet.js (preview). */
(function (MSC) {
  const A = MSC.art;
  const D = (key, fn, opts) => A.draw(key, fn, opts);

  // ───────────── shared shape helpers ─────────────
  // a shaded blob: dark rim, body, highlight top-left
  const blob = (g, c, cx, cy, rx, ry, col) => {
    g.ellipse(cx, cy, rx, ry, c.dk(col, 0.2));
    g.ellipse(cx - 0.5, cy - 0.5, Math.max(0.6, rx - 0.9), Math.max(0.6, ry - 0.9), col);
    g.px(Math.round(cx - rx * 0.45), Math.round(cy - ry * 0.45), c.lt(col, 0.5));
  };
  const fruit = (key, body, leaf, o = {}) => D(key, (g, c) => {
    blob(g, c, 7.5, 9.5, 5, 4.6, body);
    g.px(5, 7, c.lt(body, 0.55)).px(6, 6, c.lt(body, 0.4));
    g.vline(7, 3, 2, '#6b4a2a');
    if (leaf) g.rect(8, 3, 3, 2, leaf).px(11, 3, leaf);
    if (o.dent) g.px(7, 5, c.dk(body, 0.3)).px(8, 5, c.dk(body, 0.3));
  });
  // a lidded tea tin
  const tin = (key, body, lid, leaf) => D(key, (g, c) => {
    g.rect(3, 4, 10, 10, body).rect(2, 3, 12, 3, lid).hline(2, 3, 12, c.lt(lid, 0.35));
    g.vline(4, 6, 7, c.lt(body, 0.35)).vline(11, 6, 7, c.dk(body, 0.2)).hline(3, 13, 10, c.dk(body, 0.25));
    g.rect(5, 7, 6, 5, c.lt(body, 0.55));                       // label
    g.rect(6, 10, 4, 1, leaf).rect(7, 9, 2, 1, leaf).px(7, 8, leaf).px(8, 11, c.dk(leaf, 0.3));
  });
  // wooden-board sign on a post: border colour + a little icon of what the stall sells
  const stall = (key, cloth, icon) => D(key, (g, c) => {
    g.rect(7, 9, 2, 6, '#8a5d34').vline(7, 9, 6, '#a9743f').rect(5, 14, 6, 1, '#6e4727');
    g.rect(1, 1, 14, 9, c.dk(cloth, 0.15)).rect(2, 2, 12, 7, '#f7ecd0');
    g.hline(1, 1, 14, c.lt(cloth, 0.3)).hline(2, 2, 12, '#ffffff');
    g.rect(1, 1, 14, 1, cloth);
    g.px(0, 0, cloth).px(15, 0, cloth).px(0, 1, cloth).px(15, 1, cloth);   // tassel corners
    icon(g, c);
  });

  // ───────────── stall signs ─────────────
  stall('mk-veg', '#4f9a45', (g) => {                           // carrot
    g.line(4, 7, 9, 4, '#e8832a').line(4, 6, 9, 3, '#f0a050').px(4, 7, '#c0651a');
    g.rect(9, 2, 3, 1, '#4f9a45').px(10, 3, '#4f9a45').px(11, 4, '#4f9a45').px(8, 2, '#6fbf5a');
  });
  stall('mk-meat', '#b5382f', (g) => {                          // cleaver
    g.rect(4, 3, 6, 4, '#c9d2d6').hline(4, 3, 6, '#ffffff').hline(4, 6, 6, '#8f9aa0').rect(10, 4, 3, 1, '#8a5d34').px(5, 4, '#8f9aa0');
  });
  stall('mk-tofu', '#d4a73a', (g) => {                          // tofu cube + egg
    g.rect(3, 4, 5, 4, '#fbfbf2').hline(3, 4, 5, '#ffffff').vline(7, 5, 3, '#d8d8c8').hline(3, 7, 5, '#d8d8c8');
    g.ellipse(10.5, 5.5, 2, 2.5, '#f3e3c4').px(10, 4, '#ffffff');
  });
  stall('mk-tea', '#7a9a3a', (g) => {                           // tea cup + steam
    g.rect(4, 5, 6, 3, '#f4f1e8').px(3, 6, '#f4f1e8').px(10, 5, '#f4f1e8').px(11, 6, '#f4f1e8').px(10, 7, '#f4f1e8').hline(4, 5, 6, '#6fae58').hline(5, 8, 4, '#c9c3b0');
    g.px(6, 3, '#c9c3b0').px(7, 2, '#c9c3b0').px(8, 3, '#c9c3b0');
  });
  stall('mk-fruit', '#d9634a', (g, c) => {                      // apple
    g.disc(7.5, 5.5, 2.8, '#d9402f').px(5, 4, '#f08a7a').vline(7, 2, 2, '#6b4a2a').rect(8, 2, 2, 1, '#4f9a45');
  });
  stall('mk-snack', '#c9a063', (g) => {                         // steamed bun
    g.ellipse(7.5, 5.5, 3.5, 2.8, '#fbf3e0').hline(5, 3, 3, '#ffffff').px(7, 3, '#e0cfa6').px(8, 3, '#e0cfa6').hline(4, 7, 8, '#e0cfa6');
  });
  stall('mk-fish', '#3a82b0', (g) => {                          // fish
    g.ellipse(7, 5.5, 3.5, 2.2, '#6fa8c9').rect(10, 4, 2, 3, '#6fa8c9').px(12, 3, '#6fa8c9').px(12, 7, '#6fa8c9').px(5, 5, '#2b2b2b').hline(5, 3, 4, '#a9d0e6');
  });
  stall('mk-drink', '#d98a2f', (g) => {                         // glass with straw
    g.rect(5, 4, 5, 5, '#f3a840').hline(5, 4, 5, '#fff3d0').frame(5, 4, 5, 5, '#cfe6ee').rect(6, 5, 3, 3, '#f3a840').px(8, 2, '#d9482b').px(8, 3, '#d9482b').px(7, 3, '#d9482b');
  });

  // ───────────── vegetables ─────────────
  D('mk-cabbage', (g, c) => {
    g.ellipse(7.5, 8.5, 3.8, 5.2, '#eef2cc');
    g.rect(4, 3, 8, 5, '#7fbf5a').px(4, 3, null).px(11, 3, null).px(3, 5, '#7fbf5a').px(12, 5, '#7fbf5a');
    g.hline(5, 2, 6, '#9ad47f').px(7, 8, '#7fbf5a').px(8, 8, '#7fbf5a');
    g.vline(7, 4, 10, '#fbfce8').vline(5, 9, 4, '#d6dfae').vline(10, 9, 4, '#d6dfae');
    g.px(5, 4, '#a8dc8a').px(6, 3, '#a8dc8a').hline(5, 13, 6, '#c9d39a');
  });
  const spud = (g, c, cx, cy) => { blob(g, c, cx, cy, 3.6, 2.8, '#c49a5c'); g.px(cx - 1, cy, '#7a5a30').px(cx + 1, cy + 1, '#7a5a30'); };
  D('mk-potato', (g, c) => { spud(g, c, 5.5, 8.5); spud(g, c, 10, 10.5); spud(g, c, 8, 6.5); });
  D('mk-tomato', (g, c) => {
    blob(g, c, 7.5, 9.5, 5.2, 4.4, '#e0402f');
    g.px(5, 7, '#f59a8a').px(6, 6, '#f59a8a').px(5, 8, '#f08272');
    g.rect(5, 4, 6, 1, '#4f9a45').px(7, 3, '#4f9a45').px(8, 3, '#4f9a45').px(6, 5, '#4f9a45').px(9, 5, '#4f9a45').px(7, 2, '#3f7a35');
  });
  D('mk-cucumber', (g, c) => {
    const cuke = (x0, y0, x1, y1) => { for (const [dx, dy, col] of [[0, -1, '#8fd070'], [0, 0, '#4f9a45'], [0, 1, '#3f7a35'], [1, 1, '#3f7a35']]) g.line(x0 + dx, y0 + dy, x1 + dx, y1 + dy, col); g.line(x0, y0 - 2, x1, y1 - 2, '#6fb858'); };
    cuke(3, 11, 12, 6); cuke(3, 14, 12, 9);
    g.px(11, 5, '#e9c84a').px(5, 10, '#2f6a30').px(8, 8, '#2f6a30').px(7, 13, '#2f6a30').px(10, 11, '#2f6a30');
  });
  D('mk-chili', (g, c) => {
    for (const [x0, y0, x1, y1, col] of [[4, 5, 10, 12, '#d9302a'], [5, 4, 11, 11, '#e84a3a'], [8, 5, 11, 7, '#d9302a']]) g.line(x0, y0, x1, y1, col);
    g.px(11, 12, '#a82020').px(10, 12, '#a82020').px(4, 4, '#4f9a45').px(5, 3, '#4f9a45').px(4, 3, '#3f7a35');
    g.line(5, 5, 9, 10, '#f07a6a');
    g.px(8, 4, '#d9302a').px(9, 5, '#d9302a').px(9, 6, '#d9302a').px(10, 7, '#d9302a');
  });

  // ───────────── meat ─────────────
  D('mk-pork', (g, c) => {                                       // pork cut: pink meat, white fat, skin edge
    g.rect(2, 5, 12, 8, '#e58a8a').rect(3, 4, 10, 10, '#e58a8a');
    g.rect(2, 5, 12, 2, '#fbefe4').rect(3, 4, 10, 1, '#fbefe4');
    g.rect(2, 12, 12, 2, '#d9a066').hline(3, 13, 10, '#b57a40');
    g.line(5, 9, 8, 8, '#f6b4b0').line(9, 10, 12, 9, '#c86a6a').px(6, 11, '#c86a6a');
    g.px(3, 5, '#ffffff');
  });
  D('mk-beef', (g, c) => {                                       // steak with marbling
    g.rect(2, 5, 12, 8, '#a8302f').rect(3, 4, 10, 10, '#a8302f').rect(4, 3, 7, 1, '#a8302f');
    g.rect(2, 5, 3, 2, '#c24a45').px(3, 4, '#c24a45');
    g.hline(4, 7, 5, '#f2c8c0').px(9, 8, '#f2c8c0').px(10, 9, '#f2c8c0').hline(5, 10, 4, '#f2c8c0').px(8, 12, '#f2c8c0');
    g.hline(3, 13, 10, '#7a1f20');
    g.rect(10, 5, 3, 3, '#fbefe4').px(11, 6, '#e8c8b0');
  });
  D('mk-lamb', (g, c) => {                                       // rack of ribs with bone ends
    g.rect(2, 7, 12, 6, '#b5483a').hline(2, 7, 12, '#d96a58').hline(2, 12, 12, '#8a2f26').hline(3, 9, 9, '#e8b8a8');
    for (const x of [3, 6, 9, 12]) g.vline(x, 3, 5, '#f4ecd8').px(x, 2, '#ffffff').px(x - 1, 2, '#f4ecd8').px(x + 1, 2, '#f4ecd8');
    for (const x of [4, 7, 10]) g.px(x, 8, '#fbefe4');
  });
  D('mk-chicken', (g, c) => {                                    // roast drumstick
    g.ellipse(6.5, 8, 4.8, 4.6, '#c9792f').ellipse(6, 7.5, 3.8, 3.6, '#e09a45');
    g.line(9, 11, 12, 13, '#f4ecd8').rect(12, 12, 2, 2, '#f4ecd8').px(14, 13, '#f4ecd8').px(14, 12, '#f4ecd8').px(12, 14, '#f4ecd8');
    g.px(4, 5, '#f7c070').px(5, 4, '#f7c070').px(5, 5, '#f7c070').px(8, 9, '#a85f20').px(5, 10, '#a85f20');
  });

  // ───────────── tofu & eggs ─────────────
  D('mk-bean-curd', (g, c) => {                                  // white tofu blocks
    g.rect(2, 5, 9, 4, '#fbfbf2').rect(11, 6, 2, 4, '#d9d9c6').hline(2, 5, 9, '#ffffff').px(12, 5, '#ffffff');
    g.rect(2, 9, 9, 4, '#f3f3e4').rect(11, 10, 2, 4, '#cfcfba').hline(2, 9, 9, '#fbfbf2').hline(2, 12, 11, '#c4c4ae');
    g.hline(11, 9, 3, '#cfcfba').px(12, 5, '#f0f0e0');
    g.px(5, 7, '#e8e8d6').px(8, 11, '#e0e0cc');
  });
  D('mk-egg', (g, c) => {                                        // three eggs on a straw bed
    g.ellipse(7.5, 12.5, 7, 1.8, '#c9a85a').hline(1, 13, 14, '#8a6a2a').px(1, 12, '#e0c070').px(14, 12, '#e0c070').px(5, 11, '#e0c070').px(10, 11, '#e0c070');
    for (const [x, y] of [[3.5, 9], [7.5, 8.5], [11.5, 9]]) { blob(g, c, x, y, 2.2, 3, '#f3dcb0'); g.px(x - 1, y - 2, '#ffffff'); }
  });

  // noodles: a bundle of fresh yellow noodles tied with a red band, lying on paper
  D('mk-noodles', (g, c) => {
    g.rect(1, 11, 14, 3, '#f4ecd8').hline(1, 13, 14, '#d9cfb4');
    for (let y = 5; y < 12; y++) g.hline(2 + (y % 2), y, 12 - (y % 2), y % 2 ? '#f0d68a' : '#e6c66a');
    for (const x of [3, 5, 8, 10, 12]) g.vline(x, 5, 7, '#d4b050');
    g.px(1, 6, '#e6c66a').px(14, 7, '#f0d68a').px(1, 9, '#f0d68a').px(14, 10, '#e6c66a');
    g.rect(7, 4, 2, 8, '#d9402f').px(7, 4, '#f27a6a');
  });

  // ───────────── tea & dry goods ─────────────
  tin('mk-greentea', '#4f9a5a', '#d4b75a', '#2f6a3a');
  tin('mk-blacktea', '#b5382f', '#2f2a26', '#6b2a20');
  // tea: an open tin heaped with dark tea leaves and a little scoop
  D('mk-tea-tin', (g, c) => {
    g.rect(3, 6, 10, 8, '#c9a227').vline(4, 7, 6, '#f2d070').vline(11, 7, 6, '#8a6a1d').hline(3, 13, 10, '#8a6a1d');
    g.rect(5, 8, 6, 4, '#b5382f').px(7, 9, '#f2d070').px(8, 9, '#f2d070').px(7, 10, '#f2d070').px(8, 10, '#f2d070');
    g.ellipse(7.5, 5, 5, 2, '#3f6a2a').px(5, 4, '#5f8a3a').px(8, 3, '#5f8a3a').px(10, 4, '#2f5a20').px(6, 5, '#2f5a20');
    g.line(10, 4, 14, 1, '#d3a066').px(14, 0, '#d3a066');
  });
  D('mk-peanut', (g, c) => {                                     // bowl of peanuts
    g.ellipse(7.5, 12, 6.5, 2.5, '#a9743f').rect(2, 11, 12, 2, '#a9743f').hline(2, 11, 12, '#d3a066').hline(4, 14, 8, '#7b4f27');
    const nut = (x, y) => { g.rect(x, y, 4, 2, '#e0bb7a').px(x, y, null).px(x + 3, y + 1, null).px(x + 1, y, '#f0d49a').px(x + 2, y + 1, '#b58a45'); g.px(x + 1, y + 1, '#c89a55'); };
    nut(3, 8); nut(8, 8); nut(5, 6); nut(9, 5); nut(6, 9);
  });
  D('mk-rice', (g, c) => {                                       // open sack of rice
    g.ellipse(7.5, 10.5, 5.8, 4.4, '#d8bf8a').rect(2, 7, 12, 6, '#d8bf8a');
    g.rect(2, 4, 12, 3, '#fbf8ee').hline(2, 4, 12, '#ffffff').hline(2, 6, 12, '#d9d4c0').rect(4, 3, 8, 1, '#fbf8ee');
    for (const [x, y] of [[4, 5], [7, 4], [10, 5], [9, 3], [5, 3]]) g.px(x, y, '#e8e2cc');
    g.rect(2, 7, 12, 1, '#a98a52').px(3, 9, '#ede0b8').px(4, 10, '#ede0b8').vline(11, 8, 5, '#b99d66');
    g.rect(6, 9, 4, 3, '#4f7a9a').hline(6, 9, 4, '#7fa6c4');
    g.hline(3, 14, 10, '#a98a52');
  });
  D('mk-salt', (g, c) => {                                       // salt canister with a spout
    g.rect(3, 5, 10, 9, '#4f7ab5').rect(3, 5, 10, 1, '#7fa0d0').vline(4, 6, 7, '#7fa0d0').vline(12, 6, 7, '#355a8a').hline(3, 13, 10, '#355a8a');
    g.rect(4, 7, 8, 5, '#f4f1e8').hline(5, 9, 6, '#9fb8dc').hline(6, 10, 4, '#9fb8dc');
    g.rect(5, 3, 6, 3, '#d9d4c0').rect(6, 2, 4, 2, '#e8e4d4').px(7, 2, '#a8a490').px(8, 2, '#a8a490');
    g.px(12, 3, '#ffffff').px(13, 2, '#ffffff').px(11, 2, '#ffffff').px(12, 1, '#ffffff');
  });

  // ───────────── fruit ─────────────
  fruit('mk-apple', '#d9402f', '#4f9a45', { dent: true });
  D('mk-banana', (g, c) => {
    for (const [off, col] of [[0, '#e8c533'], [-2, '#f4d84a'], [2, '#d9b025']]) {
      for (let t = 0; t <= 12; t++) { const x = 2 + t, y = Math.round(7 + off * 0.4 + 0.045 * (t - 6) * (t - 6) * 1.2 + 0.5); g.px(x, y, col).px(x, y + 1, col).px(x, y + 2, c.dk(col, 0.12)); }
    }
    g.px(2, 5, '#6b4a2a').px(3, 5, '#6b4a2a').px(14, 11, '#6b4a2a').px(2, 6, '#8a6a2a');
    g.px(4, 6, '#fbe98a').px(5, 6, '#fbe98a');
  });
  fruit('mk-orange', '#f08a22', '#4f9a45');
  D('mk-grape', (g, c) => {
    g.vline(7, 2, 2, '#6b4a2a').rect(8, 2, 3, 2, '#4f9a45').px(11, 3, '#4f9a45');
    const rows = [[4, 5, 3], [3, 6, 5], [4, 8, 4], [5, 10, 3], [6, 12, 2]];
    for (const [r, y, n] of [[0, 4, 4], [1, 6, 5], [2, 8, 4], [3, 10, 3], [4, 12, 2]]) {
      const x0 = 8 - n; for (let i = 0; i < n; i++) { const cx = x0 + i * 2 + 0.5; blob(g, c, cx, y, 1.4, 1.3, (i + r) % 2 ? '#7a3f9a' : '#8a4faa'); g.px(Math.round(cx) - 1, y - 1, '#c9a0e0'); }
    }
  });
  D('mk-pear', (g, c) => {
    blob(g, c, 7.5, 11, 4.8, 3.8, '#b8c93a'); blob(g, c, 7.5, 6.5, 3, 3.2, '#c4d54a');
    g.px(6, 5, '#e4ee8a').px(5, 10, '#e4ee8a').px(9, 11, '#9aaa2a').px(10, 12, '#9aaa2a');
    g.vline(8, 2, 2, '#6b4a2a').rect(9, 2, 3, 1, '#4f9a45').px(11, 3, '#4f9a45');
  });
  D('mk-berry', (g, c) => {
    g.rect(4, 5, 8, 4, '#e03a4a').rect(5, 9, 6, 3, '#e03a4a').rect(6, 12, 4, 1, '#d02f40').rect(3, 6, 10, 2, '#e03a4a');
    g.rect(4, 5, 2, 1, '#f27a84').px(3, 6, '#f27a84').px(4, 6, '#f27a84');
    for (const [x, y] of [[5, 7], [8, 7], [10, 8], [6, 9], [9, 10], [7, 11], [4, 8]]) g.px(x, y, '#f9e08a');
    g.rect(4, 4, 8, 1, '#4f9a45').px(7, 3, '#4f9a45').px(8, 3, '#4f9a45').px(7, 2, '#3f7a35').px(5, 5, '#4f9a45').px(10, 5, '#4f9a45').px(8, 5, '#6fbf5a');
  });
  D('mk-melon', (g, c) => {                                      // a wedge of watermelon
    // slice: half-disc, rind at the bottom (curved edge down)
    for (let x = 1; x < 15; x++) { const h = Math.round(Math.sqrt(Math.max(0, 49 - (x - 7.5) * (x - 7.5))) * 0.95); for (let y = 3; y < 3 + h; y++) g.px(x, y, '#e63e4a'); }
    for (let x = 1; x < 15; x++) { const h = Math.round(Math.sqrt(Math.max(0, 49 - (x - 7.5) * (x - 7.5))) * 0.95); g.px(x, 2 + h, '#f4f0d8').px(x, 3 + h, '#3f9a4a').px(x, 4 + h, '#2f7a3a'); }
    g.hline(1, 3, 14, '#f27a84').hline(2, 2, 12, '#8a2020');
    for (const [x, y] of [[4, 6], [7, 5], [10, 6], [6, 8], [9, 9]]) g.px(x, y, '#2b1d14');
  });

  // ───────────── snacks & bakery ─────────────
  D('mk-bun', (g, c) => {                                        // pleated steamed bun on a bamboo steamer lid
    g.ellipse(7.5, 12.5, 6.5, 2, '#c99a50').hline(2, 12, 12, '#e0b870').hline(3, 14, 10, '#8a6428');
    blob(g, c, 7.5, 8, 5, 4.2, '#fbf3e0');
    g.px(6, 4, '#e0cfa6').px(7, 4, '#e0cfa6').px(8, 4, '#e0cfa6').px(7, 3, '#e0cfa6').px(7, 5, '#e0cfa6');
    g.px(5, 5, '#e0cfa6').px(9, 5, '#e0cfa6').px(4, 6, '#e0cfa6').px(10, 6, '#e0cfa6').px(6, 6, '#e0cfa6').px(8, 6, '#e0cfa6');
    g.px(5, 8, '#ffffff').px(4, 7, '#ffffff');
  });
  D('mk-dumpling', (g, c) => {                                   // half-moon dumplings with pleated edges
    const half = (cx, base, rx, hh) => {
      for (let x = Math.ceil(cx - rx); x <= Math.floor(cx + rx); x++) {
        const t = (x - cx) / rx, h = Math.round(Math.sqrt(Math.max(0, 1 - t * t)) * hh);
        for (let y = base - h; y <= base; y++) g.px(x, y, y === base ? '#d9ccaa' : '#f6eed8');
        if (h > 1 && (x - Math.ceil(cx - rx)) % 2 === 0) g.px(x, base - h + 1, '#d9ccaa');
        g.px(x, base - h, '#ffffff');
      }
    };
    half(7.5, 8, 5.5, 5); half(7.5, 14, 6.5, 6);
    g.px(2, 14, '#f6eed8').px(13, 14, '#f6eed8');
  });
  D('mk-mantou', (g, c) => {                                     // plain smooth steamed bread
    blob(g, c, 5.5, 9.5, 3.6, 3, '#f7efdc'); blob(g, c, 10.5, 9.5, 3.6, 3, '#f1e6cc'); blob(g, c, 8, 6, 3.8, 3.2, '#fbf6e8');
    g.hline(4, 12, 8, '#d9c9a0').px(7, 4, '#ffffff').px(6, 5, '#ffffff');
  });
  D('mk-bread', (g, c) => {
    g.ellipse(7.5, 9, 6.8, 4.3, '#c07a35').ellipse(7, 8.2, 5.8, 3.3, '#d9964a');
    g.rect(2, 9, 12, 4, '#c07a35').hline(3, 13, 10, '#8a5220');
    for (const x of [4, 7, 10]) g.px(x, 6, '#f4cf8a').px(x + 1, 7, '#f4cf8a').px(x - 1, 5, '#a8652a');
    g.px(3, 7, '#f0b86a').px(4, 6, '#f0b86a');
  });
  D('mk-cake', (g, c) => {                                       // slice of layered cake with a cherry
    g.rect(2, 8, 12, 6, '#c98a55'); g.rect(2, 10, 12, 1, '#fdf0d8').rect(2, 12, 12, 1, '#fdf0d8'); g.hline(2, 13, 12, '#9a6234').hline(2, 14, 12, '#7a4a20');
    g.rect(2, 6, 12, 2, '#fff4f4').rect(3, 5, 10, 1, '#fff4f4').px(5, 8, '#fff4f4').px(9, 8, '#fff4f4').px(12, 8, '#fff4f4').hline(3, 5, 4, '#ffffff');
    g.vline(13, 9, 5, '#a8703f');
    g.disc(7.5, 3.5, 1.6, '#d9302a').px(7, 3, '#f59a8a').px(8, 1, '#4f6a30').px(8, 2, '#4f6a30');
  });
  D('mk-cookie', (g, c) => {
    const ck = (cx, cy, r) => { blob(g, c, cx, cy, r, r, '#d9a05a'); g.px(cx - 1, cy - 1, '#5a3a22').px(cx + 1, cy, '#5a3a22').px(cx, cy + 1, '#5a3a22').px(cx - 2, cy + 1, '#5a3a22'); };
    ck(5.5, 10, 3.6); ck(10.5, 9, 3.6); ck(8, 5.5, 3.6);
  });
  D('mk-candy', (g, c) => {                                      // wrapped sweets with twisted ends
    const cd = (x, y, col, stripe) => {
      g.rect(x - 2, y - 2, 5, 5, col).px(x - 2, y - 2, null).px(x + 2, y + 2, null).px(x - 2, y + 2, null).px(x + 2, y - 2, null);
      g.rect(x - 4, y - 1, 2, 3, c.lt(col, 0.3)).rect(x + 3, y - 1, 2, 3, c.lt(col, 0.3)).px(x - 5, y - 2, c.lt(col, 0.3)).px(x - 5, y + 2, c.lt(col, 0.3)).px(x + 5, y - 2, c.lt(col, 0.3)).px(x + 5, y + 2, c.lt(col, 0.3));
      g.vline(x, y - 2, 5, stripe).px(x - 1, y - 1, '#ffffff');
    };
    cd(8, 6, '#e8508a', '#f9a0c4'); cd(7, 12, '#3aa0d0', '#a0daf0');
  });

  // ───────────── seafood ─────────────
  D('mk-fishitem', (g, c) => {
    g.ellipse(7, 8.5, 5.5, 3.6, '#7aa8c9').rect(10, 6, 2, 5, '#7aa8c9').rect(12, 4, 2, 9, '#5f8fb0').px(14, 3, '#5f8fb0').px(14, 13, '#5f8fb0');
    g.ellipse(6.5, 10, 4, 1.8, '#d8e8f0').hline(3, 7, 8, '#a9c9de');
    g.px(4, 7, '#ffffff').px(4, 8, '#2b2b2b').px(3, 9, '#5f8fb0').vline(5, 6, 5, '#5f8fb0').px(7, 5, '#5f8fb0').px(8, 5, '#5f8fb0').px(8, 4, '#5f8fb0');
    g.px(9, 8, '#a9c9de').px(10, 9, '#a9c9de').px(8, 9, '#9fbfd6');
  });
  D('mk-shrimp', (g, c) => {
    for (const [x, y] of [[6, 4], [7, 4], [8, 4], [9, 5], [10, 6], [11, 8], [11, 9], [10, 11], [9, 12], [7, 12]]) g.rect(x, y, 2, 2, '#f08a4a');
    g.px(5, 4, '#f4a870').px(6, 4, '#f4a870').px(7, 4, '#f4a870').px(9, 5, '#f4a870').px(10, 7, '#f4a870');
    for (const x of [8, 10]) g.px(x, 8, '#c9552a');
    g.px(6, 5, '#2b2b2b').rect(3, 2, 1, 1, '#f08a4a').px(4, 3, '#f08a4a').px(5, 3, '#f08a4a').px(2, 1, '#f08a4a');
    g.px(4, 5, '#f08a4a').px(3, 6, '#f08a4a').px(5, 6, '#f08a4a');
    g.rect(5, 12, 2, 2, '#d9602a').px(4, 14, '#d9602a').px(7, 14, '#d9602a').px(5, 14, '#d9602a');
  });
  D('mk-crab', (g, c) => {
    g.ellipse(7.5, 9.5, 5, 3.4, '#d9402f').hline(4, 8, 8, '#f08a7a').px(5, 7, '#f08a7a');
    g.px(6, 6, '#ffffff').px(9, 6, '#ffffff').vline(6, 5, 2, '#d9402f').vline(9, 5, 2, '#d9402f').px(6, 5, '#2b2b2b').px(9, 5, '#2b2b2b');
    g.rect(1, 4, 3, 3, '#e8503a').px(2, 5, null).px(3, 3, '#e8503a').px(1, 3, '#e8503a');
    g.rect(12, 4, 3, 3, '#e8503a').px(13, 5, null).px(12, 3, '#e8503a').px(14, 3, '#e8503a');
    g.line(3, 7, 5, 9, '#d9402f').line(12, 7, 11, 9, '#d9402f');
    for (const [x0, x1] of [[2, 4], [1, 4], [11, 13], [11, 14]]) g.line(x0, 12 + (x0 === 1 || x1 === 14 ? 1 : 0), x1, 10, '#b8301f');
    g.hline(5, 12, 6, '#a82a1f');
  });

  // fruit: a wooden crate of mixed fruit (apple, orange, banana, grapes)
  D('mk-fruitbox', (g, c) => {
    g.disc(4.5, 7.5, 2.6, '#d9402f').px(3, 6, '#f08a7a');
    g.disc(8.5, 6.5, 2.6, '#f08a22').px(7, 5, '#fbbf5a');
    g.line(10, 5, 14, 7, '#f2d050').line(10, 6, 14, 8, '#e8c533').px(14, 6, '#6b4a2a');
    g.disc(12, 9, 1.2, '#8a4ab0').disc(10.5, 9.5, 1.2, '#9a5ac0').px(11, 8, '#c08ae0');
    g.rect(1, 9, 14, 6, '#c28d4f').hline(1, 9, 14, '#e0b070').hline(1, 12, 14, '#a9743f').hline(1, 14, 14, '#7b4f27');
    g.vline(1, 9, 6, '#8a5d34').vline(14, 9, 6, '#8a5d34').vline(7, 10, 5, '#a9743f');
  });
  // vegetables: a basket of leafy greens (bok choy) with a carrot
  D('mk-greens', (g, c) => {
    for (const [x, col] of [[3, '#4f9a45'], [6, '#6fbf5a'], [9, '#4f9a45'], [12, '#6fbf5a']]) {
      g.ellipse(x + 0.5, 5, 2, 3.5, col).vline(x, 5, 5, '#e8f4d0').px(x - 1, 3, c.lt(col, 0.35));
    }
    g.line(10, 9, 14, 3, '#e8832a').px(14, 2, '#4f9a45').px(13, 2, '#4f9a45');
    g.rect(1, 9, 14, 6, '#c28d4f').hline(1, 9, 14, '#e0b070').hline(1, 14, 14, '#8a5d34');
    for (let x = 2; x < 15; x += 3) g.vline(x, 10, 4, '#a9743f');
  });

  // ───────────── counter: price, till, scale, basket, bag ─────────────
  D('mk-price', (g, c) => {                                      // chalk price board with a red tag
    g.rect(2, 2, 12, 10, '#8a5d34').rect(3, 3, 10, 8, '#3a4a3f').hline(2, 2, 12, '#c28d55');
    g.hline(4, 5, 5, '#e8e8d8').hline(4, 7, 4, '#e8e8d8').hline(4, 9, 6, '#e8e8d8').px(10, 5, '#e8e8d8');
    g.disc(11.5, 8.5, 1.6, '#e8b830').px(11, 8, '#fbe98a');
    g.rect(5, 12, 2, 3, '#6e4727').rect(9, 12, 2, 3, '#6e4727');
    g.rect(11, 2, 3, 3, '#d9402f').px(12, 3, '#ffffff');
  });
  D('mk-till', (g, c) => {                                       // cash register
    g.rect(2, 9, 12, 5, '#7a6a58').hline(2, 9, 12, '#a89880').hline(2, 13, 12, '#4a3f33').rect(4, 11, 8, 2, '#5a4a3a').px(10, 12, '#e8b830');
    g.rect(3, 6, 10, 3, '#8a7a66').hline(3, 6, 10, '#a89880');
    for (let x = 4; x < 12; x += 2) g.px(x, 7, '#d9d2c0').px(x, 8, '#c4bca8');
    g.rect(4, 2, 8, 4, '#4a4036').rect(5, 3, 6, 2, '#9ad48a').px(5, 3, '#c9f0b8');
  });
  D('mk-scale', (g, c) => {                                      // balance scale
    g.rect(7, 4, 2, 9, '#a98a52').rect(5, 13, 6, 1, '#7a5a2a').px(7, 2, '#e8b830').px(8, 2, '#e8b830').px(7, 3, '#c9a227').px(8, 3, '#c9a227');
    g.hline(1, 4, 14, '#c9a227').px(1, 5, '#8a6a1d').px(14, 5, '#8a6a1d');
    g.line(1, 5, 0, 9, '#8a6a1d').line(1, 5, 3, 9, '#8a6a1d').line(14, 5, 12, 9, '#8a6a1d').line(14, 5, 15, 9, '#8a6a1d');
    g.rect(0, 9, 4, 2, '#d9d2c0').hline(0, 9, 4, '#ffffff').rect(12, 9, 4, 2, '#d9d2c0').hline(12, 9, 4, '#ffffff');
    g.px(1, 8, '#6fae58').px(2, 8, '#d9402f');
  });
  D('mk-basket', (g, c) => {                                     // woven basket with a handle
    g.rect(2, 7, 12, 7, '#c28d4f').rect(3, 14, 10, 1, '#8a5d34').hline(2, 7, 12, '#e0b070').hline(2, 8, 12, '#8a5d34');
    for (let y = 9; y < 14; y += 2) g.hline(2, y, 12, '#a9743f');
    for (let y = 9; y < 14; y++) for (let x = 3 + (y % 2) * 2; x < 14; x += 4) g.px(x, y, '#8a5d34');
    for (const [x, y] of [[2, 6], [3, 4], [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 3], [11, 4], [12, 6]]) g.px(x, y, '#d3a066');
    g.px(3, 5, '#d3a066').px(12, 5, '#d3a066');
  });
  D('mk-bag', (g, c) => {                                        // paper shopping bag with handles
    g.rect(3, 5, 10, 9, '#d9402f').rect(3, 5, 10, 1, '#f27a6a').vline(3, 5, 9, '#f27a6a').vline(12, 5, 9, '#a8281f').hline(3, 13, 10, '#a8281f');
    g.vline(8, 5, 9, '#c0352a');
    g.rect(5, 8, 6, 3, '#f7ecd0').px(7, 9, '#d9402f').px(8, 9, '#d9402f');
    g.line(5, 5, 6, 2, '#c9a063').line(6, 2, 8, 2, '#c9a063').line(8, 2, 10, 5, '#c9a063');
    g.px(5, 3, '#c9a063').px(10, 3, '#c9a063');
  });

  // ───────────── drinks ─────────────
  D('mk-juice', (g, c) => {                                      // tall glass of orange juice + straw + orange slice
    g.rect(4, 4, 8, 10, '#e8f4f8').rect(5, 6, 6, 8, '#f39a28').hline(5, 6, 6, '#fbbf5a').hline(4, 4, 8, '#ffffff').vline(5, 7, 6, '#fbd080').hline(4, 14, 8, '#b8d4de');
    g.vline(9, 1, 6, '#d9402f').px(10, 1, '#d9402f').vline(8, 2, 3, '#e8503a');
    g.disc(12, 5, 1.7, '#f08a22').px(12, 5, '#fbd080').px(11, 4, '#fbd080');
  });
  D('mk-milk', (g, c) => {                                       // gable-top milk carton with a cow patch
    g.rect(4, 6, 8, 8, '#f7f7f2').rect(4, 6, 1, 8, '#ffffff').rect(11, 6, 1, 8, '#d0d4d8').hline(4, 13, 8, '#c8ccd0');
    g.rect(4, 3, 8, 3, '#e8ecf0').px(5, 2, '#e8ecf0').px(6, 1, '#d0d4d8').px(7, 1, '#d0d4d8').px(8, 1, '#d0d4d8').px(9, 1, '#d0d4d8').px(10, 2, '#d0d4d8');
    g.hline(4, 3, 8, '#c8ccd0');
    g.rect(5, 8, 3, 2, '#3a82c0').px(7, 10, '#3a82c0').rect(9, 10, 2, 2, '#3a82c0').px(10, 9, '#3a82c0').rect(5, 11, 2, 1, '#3a82c0');
  });
  D('mk-soymilk', (g, c) => {                                    // bottle of pale soy milk with a bean on the label
    g.rect(6, 2, 4, 2, '#8a5d34').rect(7, 4, 2, 2, '#ece4c4').rect(5, 6, 6, 8, '#f3ecc8');
    g.vline(6, 7, 6, '#fffbe8').hline(5, 13, 6, '#cfc49a').vline(10, 7, 6, '#d9cfa0');
    g.rect(5, 8, 6, 4, '#7bb25a').ellipse(7.5, 9.5, 1.5, 1.1, '#f3ecc8').px(7, 9, '#e0d49a').px(9, 11, '#5f9a40');
  });
  D('mk-yogurt', (g, c) => {                                     // yogurt cup with foil lid and a spoon
    g.rect(4, 5, 8, 2, '#d9dde0').hline(4, 5, 8, '#ffffff').rect(5, 7, 6, 7, '#fbfbf6').px(4, 7, '#fbfbf6').px(11, 7, '#fbfbf6');
    g.rect(5, 9, 6, 3, '#e8708a').hline(5, 9, 6, '#f6a0b4').vline(10, 7, 7, '#d9d9d0').hline(5, 14, 6, '#c8c8be');
    g.px(7, 10, '#ffffff').px(8, 11, '#ffffff');
    g.line(12, 2, 13, 5, '#c9c4b4').px(12, 1, '#c9c4b4').px(13, 6, '#c9c4b4');
  });
  D('mk-water', (g, c) => {
    g.rect(6, 2, 4, 2, '#2f6fb0').rect(7, 4, 2, 2, '#dff0f8').rect(5, 6, 6, 8, '#a8dcf4');
    g.vline(6, 7, 6, '#e0f6ff').hline(5, 13, 6, '#6fb8e0').vline(10, 7, 6, '#79c0ea');
    g.px(7, 9, '#4f9ad0').px(8, 9, '#4f9ad0').px(9, 10, '#4f9ad0').px(6, 10, '#4f9ad0').px(7, 11, '#4f9ad0').px(8, 11, '#4f9ad0');   // wave
    g.hline(5, 7, 6, '#4a8cc0');
  });

  // ───────────── lanterns ─────────────
  const lantern = (key) => D(key, (g, c) => {
    g.vline(7, 0, 3, '#6b4a2a').vline(8, 0, 3, '#6b4a2a');
    g.rect(5, 3, 6, 2, '#d9a62a').hline(5, 3, 6, '#f2d070');
    g.ellipse(7.5, 8, 6.2, 4, '#d9302a').rect(3, 6, 10, 4, '#d9302a');
    g.vline(5, 5, 6, '#a82020').vline(10, 5, 6, '#a82020').vline(7, 4, 8, '#e8503a').vline(8, 4, 8, '#b82424');
    g.px(4, 6, '#f27a6a').px(5, 5, '#f27a6a');
    g.rect(5, 12, 6, 2, '#d9a62a').hline(5, 13, 6, '#a07a1a');
    g.vline(7, 14, 2, '#d9a62a').vline(8, 14, 2, '#f2d070').px(7, 15, '#d9a62a');
  }, { shadow: false });
  ['mk-lantern2', 'mk-lantern3', 'mk-lantern4'].forEach(lantern);

  // ───────────── people & door ─────────────
  D('cart', (g, c) => {                                          // wooden fruit barrow loaded with fruit
    const pile = [[4, 7, '#d9402f'], [7, 6, '#f08a22'], [10, 7, '#d9402f'], [6, 8, '#b8c93a'], [9, 8, '#f08a22'], [12, 8, '#e8c533'], [3, 9, '#f08a22'], [5, 4, '#d9402f'], [8, 4, '#b8c93a'], [11, 5, '#f08a22']];
    g.rect(1, 12, 14, 7, '#a9743f').rect(1, 11, 14, 2, '#d3a066').hline(1, 11, 14, '#e8bd88').hline(1, 18, 14, '#6e4727');
    for (const x of [4, 8, 12]) g.vline(x, 13, 5, '#8a5d34');
    for (const [x, y, col] of pile) { g.disc(x + 1, y + 3, 2.2, col); g.px(x, y + 2, c.lt(col, 0.5)); }
    g.rect(0, 11, 16, 2, '#c28d55').hline(0, 11, 16, '#e8bd88');
    g.rect(3, 20, 4, 4, '#4a3a2a').rect(9, 20, 4, 4, '#4a3a2a').rect(4, 21, 2, 2, '#8a6a42').rect(10, 21, 2, 2, '#8a6a42');
    g.vline(1, 19, 2, '#6e4727').vline(14, 19, 2, '#6e4727').rect(0, 16, 1, 5, '#8a5d34');
    g.rect(2, 1, 12, 1, '#c8472f').rect(1, 2, 14, 2, '#c8472f').rect(3, 2, 2, 2, '#f6ecd0').rect(7, 2, 2, 2, '#f6ecd0').rect(11, 2, 2, 2, '#f6ecd0').hline(1, 4, 14, '#8f2f1c');
    g.vline(2, 4, 8, '#8a5d34').vline(13, 4, 8, '#8a5d34');
  }, { w: 16, h: 24 });
  D('door-market-out', (g, c) => {                               // doorway seen from inside: frame, bright daylight, step
    g.rect(1, 1, 14, 21, '#5e3a1b').rect(2, 2, 12, 20, '#7b4f27').rect(3, 4, 10, 18, '#bfe4f0');
    g.rect(3, 4, 10, 6, '#d9f0f6').rect(3, 14, 10, 8, '#9ad47f').hline(3, 13, 10, '#6fae58').rect(3, 17, 10, 5, '#d9d1c2').hline(3, 17, 10, '#c4baa7');
    g.rect(5, 6, 2, 2, '#ffffff').rect(9, 9, 3, 1, '#ffffff');
    g.rect(0, 0, 16, 4, '#8a5d34').hline(0, 0, 16, '#c28d55').hline(0, 3, 16, '#4f321a');
    g.rect(0, 22, 16, 2, '#b88a55').hline(0, 22, 16, '#d9b078').rect(7, 3, 2, 1, '#e8b830');
    g.rect(2, 3, 1, 19, '#5e3a1b').rect(13, 3, 1, 19, '#5e3a1b');
  }, { w: 16, h: 24 });

  // ───────────── ground tiles for this stage ─────────────
  const speckle = (g, rnd, n, cols) => { for (let i = 0; i < n; i++) g.px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), cols[Math.floor(rnd() * cols.length)]); };
  // A — a green & cream striped awning with scalloped edge
  A.tile('A', [0, 1].map((v) => (g, c, r) => {
    g.rect(0, 12, 16, 4, '#9a8a70');
    for (let x = 0; x < 16; x++) g.vline(x, 0, 12, ((x + v * 4) >> 2) % 2 ? '#f6ecd0' : '#3f8a5a');
    for (let x = 0; x < 16; x++) { const s = ((x + v * 4) >> 2) % 2 ? '#f6ecd0' : '#3f8a5a'; g.vline(x, 12, (x % 4 === 0 || x % 4 === 3) ? 2 : 3, s); }
    g.hline(0, 0, 16, '#2a5f3d').hline(0, 1, 16, 'rgba(255,255,255,.25)').hline(0, 11, 16, 'rgba(0,0,0,.18)');
    for (let x = 0; x < 16; x += 4) g.px(x + 1, 14, 'rgba(0,0,0,.15)');
  }), 'market');
  // T — a lighter stone path of laid bricks
  A.tile('T', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#eee5d0');
    for (let y = 0; y < 16; y += 4) { g.hline(0, y, 16, '#d4c8ae'); const off = ((y >> 2) + v) % 2 ? 4 : 0; for (let x = off; x < 16; x += 8) g.vline(x, y, 4, '#d4c8ae'); }
    speckle(g, r, 10, ['#f7f0de', '#e0d4ba']);
    g.hline(0, 1, 16, 'rgba(255,255,255,.18)');
  }), 'market');
  // M — warm market flagstones
  A.tile('M', [0, 1, 2].map((v) => (g, c, r) => {
    g.rect(0, 0, 16, 16, '#cfc2ac');
    g.hline(0, 5 + v, 16, '#b3a58d').hline(0, 11 - v, 16, '#b3a58d').vline(4 + v * 2, 0, 5 + v, '#b3a58d').vline(11 - v, 6 + v, 5, '#b3a58d').vline(6, 12 - v, 4, '#b3a58d');
    speckle(g, r, 12, ['#dbcfba', '#bfb199']);
  }), 'market');
})(window.MSC = window.MSC || {});

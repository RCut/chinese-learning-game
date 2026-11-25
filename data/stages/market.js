/* STAGE: the market — a covered market with food stalls and Shopkeeper Zhang. (See data/world.js for the format.) */
(function (MSC) {
  // a stall: the table tile holds the stall object; its neighbour is decoration (scenery) showing the goods
  const stall = (id, x, y, emoji, hanzi, text, note) => ({ id, x, y, emoji, hanzi, text: text.map(([h, e]) => ({ hanzi: h, english: e })), note });

  MSC.data.world.stages.market = {
    id: 'market', name: 'Market', hanzi: '市场', sound: 'market',
    cols: 18, rows: 10,
    // A awning over a stall (blocked) · T path of worn tiles from the door · L stall table
    tileClasses: { A: 'tile-awning', T: 'tile-mk-path' },
    blockedTiles: ['A'],
    map: [
      'WWAAWWAAWWAAWWAAWW',
      'WMLLMMLLMMLLMMLLMW',
      'WMMMMMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMMMMMW',
      'WMMLLMMMMLMMMLLMMW',
      'WMMMMMMMMTMMMMMMMW',
      'WMMMMMMMMTMMMMMMMW',
      'WLLMMMMMMTMMMMLLMW',
      'WMMMMMMMMDMMMMMMMW',
      'WWWWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 9, y: 7 },
    scenery: [
      // hanging lanterns along the roof
      { x: 1, y: 0, text: '🏮' }, { x: 4, y: 0, text: '🏮' }, { x: 8, y: 0, text: '🏮' }, { x: 12, y: 0, text: '🏮' }, { x: 16, y: 0, text: '🏮' },
      // the goods on the second table of each stall
      { x: 3, y: 1, text: '🥬' }, { x: 7, y: 1, text: '🥩' }, { x: 11, y: 1, text: '🦐' }, { x: 15, y: 1, text: '🥚' },
      { x: 4, y: 4, text: '🥟' }, { x: 9, y: 4, text: '🍌' }, { x: 1, y: 7, text: '💴' }, { x: 14, y: 4, text: '🥡' }, { x: 15, y: 7, text: '🥤' },
    ],
    objects: [
      // ── the stalls (each one has a price board) ──
      stall('mk-veg', 2, 1, '🥬', '蔬菜摊', [
        ['白菜 一斤 三块', 'Chinese cabbage — 3 yuan a jin'],
        ['土豆 一斤 两块', 'Potatoes — 2 yuan a jin'],
        ['西红柿 一斤 四块', 'Tomatoes — 4 yuan a jin'],
        ['萝卜 一斤 两块', 'Radish — 2 yuan a jin'],
      ], '黄瓜一斤三块，青菜也很新鲜！ — Cucumbers are 3 yuan a jin, and the green vegetables are fresh too!'),
      stall('mk-meat', 6, 1, '🥩', '肉摊', [
        ['猪肉 一斤 十八块', 'Pork — 18 yuan a jin'],
        ['牛肉 一斤 三十块', 'Beef — 30 yuan a jin'],
        ['羊肉 一斤 四十块', 'Lamb — 40 yuan a jin'],
        ['鸡肉 一斤 十二块', 'Chicken — 12 yuan a jin'],
      ]),
      stall('mk-fish', 10, 1, '🐟', '海鲜摊', [
        ['鱼 一条 十五块', 'Fish — 15 yuan each'],
        ['虾 一斤 三十块', 'Shrimp — 30 yuan a jin'],
      ], '海鲜很新鲜！ — The seafood is very fresh!'),
      stall('mk-tofu', 14, 1, '🥚', '豆腐摊', [
        ['鸡蛋 一斤 六块', 'Eggs — 6 yuan a jin'],
        ['豆腐 一斤 三块', 'Tofu — 3 yuan a jin'],
        ['豆浆 一瓶 三块', 'Soy milk — 3 yuan a bottle'],
      ]),
      stall('mk-snack', 3, 4, '🥟', '点心摊', [
        ['饺子 一碗 十块', 'Dumplings — 10 yuan a bowl'],
        ['包子 一个 两块', 'Steamed buns — 2 yuan each'],
        ['馒头 一个 一块', 'Plain steamed bread — 1 yuan each'],
        ['面包 一个 五块', 'Bread — 5 yuan a loaf'],
      ], '蛋糕和点心也很好吃！ — The cakes and pastries are tasty too!'),
      stall('mk-tea', 13, 4, '🍵', '茶叶摊', [
        ['绿茶 一斤 八十块', 'Green tea — 80 yuan a jin'],
        ['红茶 一斤 六十块', 'Black tea — 60 yuan a jin'],
        ['花生 一斤 十块', 'Peanuts — 10 yuan a jin'],
        ['大米 一斤 三块', 'Rice — 3 yuan a jin'],
      ]),
      stall('mk-drink', 14, 7, '🧃', '饮料摊', [
        ['果汁 一瓶 六块', 'Fruit juice — 6 yuan a bottle'],
        ['酸奶 一瓶 四块', 'Yogurt — 4 yuan a bottle'],
        ['牛奶 一瓶 三块', 'Milk — 3 yuan a bottle'],
        ['水 一瓶 两块', 'Water — 2 yuan a bottle'],
      ]),

      // ── things lying around the market ──
      { id: 'mk-basket', x: 4, y: 1, emoji: '🧺', hanzi: '篮子' },
      { id: 'mk-scale', x: 8, y: 1, emoji: '⚖️', hanzi: '秤', note: 'Shops weigh your food on the 秤 and sell it by the 斤 (about 500 g).' },
      { id: 'mk-rice', x: 12, y: 1, emoji: '🌾', hanzi: '大米', text: [{ hanzi: '大米 一斤 三块', english: 'Rice — 3 yuan a jin' }] },
      { id: 'mk-bag', x: 16, y: 2, emoji: '🛍️', hanzi: '袋子', note: 'You can ask for a bag: 请给我一个袋子。' },
      { id: 'mk-orange', x: 6, y: 3, emoji: '🍊', hanzi: '橙子' },
      { id: 'mk-grape', x: 11, y: 3, emoji: '🍇', hanzi: '葡萄' },
      { id: 'mk-price', x: 1, y: 4, emoji: '🏷️', hanzi: '价钱', text: [{ hanzi: '多少钱？', english: 'How much is it?' }, { hanzi: '便宜一点，可以吗？', english: 'A little cheaper, OK?' }] },
      { id: 'mk-peanut', x: 16, y: 4, emoji: '🥜', hanzi: '花生' },
      { id: 'mk-pear', x: 6, y: 5, emoji: '🍐', hanzi: '梨' },
      { id: 'mk-berry', x: 11, y: 5, emoji: '🍓', hanzi: '草莓' },
      { id: 'mk-cat', x: 16, y: 6, emoji: '🐈', hanzi: '猫' },
      { id: 'mk-salt', x: 6, y: 7, emoji: '🧂', hanzi: '盐' },
      { id: 'mk-chili', x: 12, y: 7, emoji: '🌶️', hanzi: '辣椒', note: '辣 means spicy — 这个很辣！' },
      { id: 'mk-bottle', x: 13, y: 7, emoji: '🍾', hanzi: '瓶' },
      { id: 'mk-till', x: 2, y: 7, emoji: '🧾', hanzi: '收银台', note: 'Pay at the 收银台 — and ask for 找钱 (change).' },
    ],
    entities: [
      { id: 'door-market-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 9, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果摊', emoji: '🍎', x: 8, y: 4, stand: { x: 8, y: 5 }, badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', emoji: '👨‍🍳', x: 3, y: 7, stand: { x: 4, y: 7 }, badge: 'badge-amber', pill: 'pill-amber' },
    ],
  };
})(window.MSC = window.MSC || {});

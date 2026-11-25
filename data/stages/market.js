/* STAGE: the market — a covered market with tidy stalls (every product sits on a stall table) and Shopkeeper Zhang. (See data/world.js for the format.) */
(function (MSC) {
  // a stall sign: its text lists only the goods of that stall (word + English, no prices)
  const sign = (id, x, y, emoji, hanzi, items, note) => {
    const o = { id, x, y, emoji, hanzi, text: items.map(([h, e]) => ({ hanzi: h, english: e })) };
    if (note) o.note = note;
    return o;
  };
  // a product on a stall table
  const item = (id, x, y, emoji, hanzi, note) => (note ? { id, x, y, emoji, hanzi, note } : { id, x, y, emoji, hanzi });

  MSC.data.world.stages.market = {
    id: 'market', name: 'Market', hanzi: '市场', sound: 'market',
    cols: 18, rows: 10,
    // A awning along the roof (blocked) · T path of worn tiles from the door · L stall table (products sit on these)
    tileClasses: { A: 'tile-awning', T: 'tile-mk-path' },
    blockedTiles: ['A'],
    map: [
      'WAAAAAAAAAAAAAAAAW',
      'WLLLLLLMLLLLLMLLLW',
      'WMMMMMMMMTMMMMMMMW',
      'WLMMMMMMMTMMMMMMLW',
      'WLMLLLLMMTLLLLMMLW',
      'WLMLLLLMMTLLLLMMLW',
      'WLMMMMMMMTMMMMMMLW',
      'WLMLLLLLMTMLLLLLLW',
      'WLMMMMMMMDMMMMMMMW',
      'WWWWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 9, y: 7 },
    scenery: [],
    objects: [
      // ── back wall, left to right: vegetables · meat · tofu & eggs ──
      sign('mk-veg', 1, 1, '🥕', '蔬菜摊', [['白菜', 'Chinese cabbage'], ['土豆', 'potato'], ['西红柿', 'tomato'], ['黄瓜', 'cucumber'], ['辣椒', 'chili pepper']],
        '黄瓜和青菜都很新鲜！ — The cucumbers and green vegetables are fresh!'),
      item('mk-cabbage', 2, 1, '🥬', '白菜'),
      item('mk-potato', 3, 1, '🥔', '土豆'),
      item('mk-tomato', 4, 1, '🍅', '西红柿'),
      item('mk-cucumber', 5, 1, '🥒', '黄瓜'),
      item('mk-chili', 6, 1, '🌶️', '辣椒', '辣 means spicy — 这个很辣！ — This one is very spicy!'),

      sign('mk-meat', 8, 1, '🔪', '肉摊', [['猪肉', 'pork'], ['牛肉', 'beef'], ['羊肉', 'lamb'], ['鸡肉', 'chicken']]),
      item('mk-pork', 9, 1, '🐖', '猪肉'),
      item('mk-beef', 10, 1, '🥩', '牛肉'),
      item('mk-lamb', 11, 1, '🍖', '羊肉'),
      item('mk-chicken', 12, 1, '🍗', '鸡肉'),

      sign('mk-tofu', 14, 1, '🥢', '豆腐摊', [['豆腐', 'tofu'], ['鸡蛋', 'eggs']]),
      item('mk-bean-curd', 15, 1, '🍥', '豆腐'),
      item('mk-egg', 16, 1, '🥚', '鸡蛋'),

      // ── left wall: tea and dry goods ──
      sign('mk-tea', 1, 3, '🍵', '茶叶摊', [['绿茶', 'green tea'], ['红茶', 'black tea'], ['花生', 'peanuts'], ['大米', 'rice'], ['盐', 'salt']]),
      item('mk-greentea', 1, 4, '🍵', '绿茶'),
      item('mk-blacktea', 1, 5, '☕', '红茶'),
      item('mk-peanut', 1, 6, '🥜', '花生'),
      item('mk-rice', 1, 7, '🌾', '大米'),
      item('mk-salt', 1, 8, '🧂', '盐'),

      // ── island: fruit (Fruit Stall person stands at its end) ──
      sign('mk-fruit', 3, 4, '🍑', '水果摊', [['苹果', 'apple'], ['香蕉', 'banana'], ['橙子', 'orange'], ['葡萄', 'grapes'], ['梨', 'pear'], ['草莓', 'strawberry'], ['西瓜', 'watermelon']]),
      item('mk-apple', 4, 4, '🍎', '苹果'),
      item('mk-banana', 5, 4, '🍌', '香蕉'),
      item('mk-orange', 6, 4, '🍊', '橙子'),
      item('mk-grape', 3, 5, '🍇', '葡萄'),
      item('mk-pear', 4, 5, '🍐', '梨'),
      item('mk-berry', 5, 5, '🍓', '草莓'),
      item('mk-melon', 6, 5, '🍉', '西瓜'),

      // ── island: snacks and bakery ──
      sign('mk-snack', 10, 4, '🥠', '点心摊', [['包子', 'steamed buns'], ['饺子', 'dumplings'], ['馒头', 'plain steamed bread'], ['面包', 'bread'], ['蛋糕', 'cake'], ['饼干', 'cookies'], ['糖果', 'candy']],
        '蛋糕和点心也很好吃！ — The cakes and pastries are tasty too!'),
      item('mk-bun', 11, 4, '🍙', '包子'),
      item('mk-dumpling', 12, 4, '🥟', '饺子'),
      item('mk-mantou', 13, 4, '🥯', '馒头'),
      item('mk-bread', 10, 5, '🍞', '面包'),
      item('mk-cake', 11, 5, '🍰', '蛋糕'),
      item('mk-cookie', 12, 5, '🍪', '饼干'),
      item('mk-candy', 13, 5, '🍬', '糖果'),

      // ── right wall: seafood ──
      sign('mk-fish', 16, 3, '🦞', '海鲜摊', [['鱼', 'fish'], ['虾', 'shrimp'], ['螃蟹', 'crab']], '海鲜很新鲜！ — The seafood is very fresh!'),
      item('mk-fishitem', 16, 4, '🐟', '鱼'),
      item('mk-shrimp', 16, 5, '🦐', '虾'),
      item('mk-crab', 16, 6, '🦀', '螃蟹'),

      // ── front counter, left: the till and weighing things ──
      { id: 'mk-price', x: 3, y: 7, emoji: '🏷️', hanzi: '价钱', text: [{ hanzi: '多少钱？', english: 'How much is it?' }, { hanzi: '便宜一点，可以吗？', english: 'A little cheaper, OK?' }] },
      item('mk-till', 4, 7, '🧾', '收银台', 'Pay at the 收银台 — and ask for 找钱 (change). — 找钱 means to give change.'),
      item('mk-scale', 5, 7, '⚖️', '秤', 'Shops weigh your food on the 秤 and sell it by the 斤 (about 500 g).'),
      item('mk-basket', 6, 7, '🧺', '篮子'),
      item('mk-bag', 7, 7, '🛍️', '袋子', 'You can ask for a bag: 请给我一个袋子。 — Please give me a bag.'),

      // ── front counter, right: drinks ──
      sign('mk-drink', 11, 7, '🍹', '饮料摊', [['果汁', 'fruit juice'], ['牛奶', 'milk'], ['豆浆', 'soy milk'], ['酸奶', 'yogurt'], ['水', 'water']]),
      item('mk-juice', 12, 7, '🥤', '果汁'),
      item('mk-milk', 13, 7, '🥛', '牛奶'),
      item('mk-soymilk', 14, 7, '🍶', '豆浆'),
      item('mk-yogurt', 15, 7, '🥣', '酸奶'),
      item('mk-water', 16, 7, '💧', '水'),

      // ── lanterns hanging from the roof and the walls ──
      item('mk-lantern1', 7, 0, '🏮', '灯笼', 'Red lanterns bring good luck. — 灯笼 are hung for festivals and in markets.'),
      item('mk-lantern2', 13, 0, '🏮', '灯笼'),
      item('mk-lantern3', 17, 2, '🏮', '灯笼'),
      item('mk-lantern4', 0, 2, '🏮', '灯笼'),
    ],
    entities: [
      { id: 'door-market-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 9, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果摊', emoji: '🍎', x: 7, y: 4, stand: { x: 7, y: 3 }, badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', emoji: '👨‍🍳', x: 8, y: 7, stand: { x: 8, y: 6 }, badge: 'badge-amber', pill: 'pill-amber' },
    ],
  };
})(window.MSC = window.MSC || {});

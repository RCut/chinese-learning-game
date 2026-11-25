/* STAGE: the market — a covered market with tidy stalls (every product sits on a stall table) and Shopkeeper Zhang. (See data/world.js for the format.) */
(function (MSC) {
  // a stall sign: its text lists only the goods of that stall (word + English, no prices)
  const sign = (id, x, y, hanzi, items, note) => {
    const o = { id, x, y, hanzi, text: items.map(([h, e]) => ({ hanzi: h, english: e })) };
    if (note) o.note = note;
    return o;
  };
  // a product on a stall table
  const item = (id, x, y, hanzi, note) => (note ? { id, x, y, hanzi, note } : { id, x, y, hanzi });

  MSC.data.world.stages.market = {
    id: 'market', name: 'Market', hanzi: '市场', sound: 'market',
    cols: 18, rows: 10,
    // A awning along the roof (blocked) · T path of worn tiles from the door · L stall table (products sit on these)
    blockedTiles: ['A'],
    map: [
      'WAAAAAAAAAAAAAAAAW',
      'WLLLLLLLLLLLLLLLLW',
      'WMMMMMMMMTMMMMMMMW',
      'WLMMMMMMMTMMMMMMLW',
      'WLMLLLLMMTLLLLLMLW',
      'WLMLLLLMMTLLLLLMLW',
      'WLMMMMMMMTMMMMMMLW',
      'WLMLLLLLMTMLLLLLLW',
      'WLMMMMMMMDMMMMMMMW',
      'WWWWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 9, y: 7 },
    scenery: [],
    // Level 1 (HSK 1) goods sit first on their stalls, next to the (level-2) stall sign: 菜 · 鸡蛋 面条儿 · 茶 ·
    // 包子 饺子 面包 · 苹果 水果 · 水 牛奶 — and Zhang's price board (块) by his counter. The rest appears at level 2.
    objects: [
      // ── back wall, left to right: vegetables · meat · tofu, eggs & noodles ──
      sign('mk-veg', 1, 1, '蔬菜摊', [['菜', 'vegetables'], ['白菜', 'Chinese cabbage'], ['土豆', 'potato'], ['西红柿', 'tomato'], ['黄瓜', 'cucumber'], ['辣椒', 'chili pepper']],
        '黄瓜和青菜都很新鲜！ — The cucumbers and green vegetables are fresh!'),
      item('mk-greens', 2, 1, '菜', '菜 is vegetables — and also a dish of food: 中国菜 is Chinese food.'),
      item('mk-cabbage', 3, 1, '白菜'),
      item('mk-potato', 4, 1, '土豆'),
      item('mk-tomato', 5, 1, '西红柿'),
      item('mk-cucumber', 6, 1, '黄瓜'),
      item('mk-chili', 7, 1, '辣椒', '辣 means spicy — 这个很辣！ — This one is very spicy!'),

      sign('mk-meat', 8, 1, '肉摊', [['猪肉', 'pork'], ['牛肉', 'beef'], ['羊肉', 'lamb'], ['鸡肉', 'chicken']]),
      item('mk-pork', 9, 1, '猪肉'),
      item('mk-beef', 10, 1, '牛肉'),
      item('mk-lamb', 11, 1, '羊肉'),
      item('mk-chicken', 12, 1, '鸡肉'),

      sign('mk-tofu', 13, 1, '豆腐摊', [['鸡蛋', 'eggs'], ['面条儿', 'noodles'], ['豆腐', 'tofu']]),
      item('mk-egg', 14, 1, '鸡蛋', 'Eggs are counted with 个: 两个鸡蛋 = two eggs.'),
      item('mk-noodles', 15, 1, '面条儿', 'Fresh 面条儿 (noodles). 面 is flour, 条 is a long strip.'),
      item('mk-bean-curd', 16, 1, '豆腐'),

      // ── left wall: tea and dry goods ──
      sign('mk-tea', 1, 3, '茶叶摊', [['茶', 'tea'], ['绿茶', 'green tea'], ['红茶', 'black tea'], ['大米', 'rice'], ['盐', 'salt']]),
      item('mk-tea-tin', 1, 4, '茶', 'A tin of 茶 (tea leaves). 喝茶 = to drink tea.'),
      item('mk-greentea', 1, 5, '绿茶'),
      item('mk-blacktea', 1, 6, '红茶'),
      item('mk-rice', 1, 7, '大米'),
      item('mk-salt', 1, 8, '盐'),

      // ── island: snacks and bakery (beside the Fruit Stall cart) ──
      sign('mk-snack', 3, 4, '点心摊', [['包子', 'steamed buns'], ['饺子', 'dumplings'], ['面包', 'bread'], ['馒头', 'plain steamed bread'], ['蛋糕', 'cake'], ['饼干', 'cookies'], ['糖果', 'candy']],
        '蛋糕和点心也很好吃！ — The cakes and pastries are tasty too!'),
      item('mk-bun', 4, 4, '包子'),
      item('mk-dumpling', 5, 4, '饺子'),
      item('mk-bread', 6, 4, '面包'),
      item('mk-mantou', 3, 5, '馒头'),
      item('mk-cake', 4, 5, '蛋糕'),
      item('mk-cookie', 5, 5, '饼干'),
      item('mk-candy', 6, 5, '糖果'),

      // ── island: fruit and nuts ──
      sign('mk-fruit', 10, 4, '水果摊', [['苹果', 'apple'], ['水果', 'fruit'], ['香蕉', 'banana'], ['橙子', 'orange'], ['葡萄', 'grapes'], ['梨', 'pear'], ['草莓', 'strawberry'], ['西瓜', 'watermelon'], ['花生', 'peanuts']]),
      item('mk-apple', 11, 4, '苹果'),
      item('mk-fruitbox', 12, 4, '水果', '水果 is fruit — all kinds. 我喜欢吃水果。 — I like eating fruit.'),
      item('mk-banana', 13, 4, '香蕉'),
      item('mk-orange', 14, 4, '橙子'),
      item('mk-grape', 10, 5, '葡萄'),
      item('mk-pear', 11, 5, '梨'),
      item('mk-berry', 12, 5, '草莓'),
      item('mk-melon', 13, 5, '西瓜'),
      item('mk-peanut', 14, 5, '花生'),

      // ── right wall: seafood ──
      sign('mk-fish', 16, 3, '海鲜摊', [['鱼', 'fish'], ['虾', 'shrimp'], ['螃蟹', 'crab']], '海鲜很新鲜！ — The seafood is very fresh!'),
      item('mk-fishitem', 16, 4, '鱼'),
      item('mk-shrimp', 16, 5, '虾'),
      item('mk-crab', 16, 6, '螃蟹'),

      // ── front counter, left: shopping things and, next to Zhang, his price board ──
      item('mk-basket', 3, 7, '篮子'),
      item('mk-bag', 4, 7, '袋子', 'You can ask for a bag: 请给我一个袋子。 — Please give me a bag.'),
      item('mk-scale', 5, 7, '秤', 'Shops weigh your food on the 秤 and sell it by the 斤 (about 500 g).'),
      item('mk-till', 6, 7, '收银台', 'Pay at the 收银台 — and ask for 找钱 (change). — 找钱 means to give change.'),
      {
        id: 'mk-price', x: 7, y: 7, hanzi: '块',
        note: '块 is how people SAY yuan: 四块 = ¥4. Price tags WRITE it 元. Ask 多少钱？ (how much?) — and if it is too much: 太贵了！',
        text: [
          { hanzi: '苹果 四块', english: 'apples ¥4' }, { hanzi: '面包 两块', english: 'bread ¥2' }, { hanzi: '水 一块', english: 'water ¥1' },
          { hanzi: '牛奶 七块', english: 'milk ¥7' }, { hanzi: '鸡蛋 十块', english: 'eggs ¥10' }, { hanzi: '饺子 十四块', english: 'dumplings ¥14' },
          { hanzi: '茶 四十块', english: 'tea ¥40' }, { hanzi: '块 = 元', english: '块 (said) = 元 (written): yuan' },
          { hanzi: '买东西？很便宜，不贵！', english: 'Shopping? Very cheap, not expensive!' },
        ],
        listen: ['四块', '十块', '七块', '一块', '两块', '十四块', '四十块'], listenTitle: 'Zhang calls out the prices',
      },

      // ── front counter, right: drinks ──
      sign('mk-drink', 11, 7, '饮料摊', [['水', 'water'], ['牛奶', 'milk'], ['果汁', 'fruit juice'], ['豆浆', 'soy milk'], ['酸奶', 'yogurt']]),
      item('mk-water', 12, 7, '水'),
      item('mk-milk', 13, 7, '牛奶'),
      item('mk-juice', 14, 7, '果汁'),
      item('mk-soymilk', 15, 7, '豆浆'),
      item('mk-yogurt', 16, 7, '酸奶'),

      // ── lanterns hanging on the walls ──
      item('mk-lantern2', 17, 8, '灯笼', 'Red lanterns bring good luck. — 灯笼 are hung for festivals and in markets.'),
      item('mk-lantern3', 17, 2, '灯笼'),
      item('mk-lantern4', 0, 2, '灯笼'),
    ],
    entities: [
      { id: 'door-market-out', kind: 'door', name: 'Outside', hanzi: '外面', x: 9, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果摊', x: 7, y: 5, stand: { x: 7, y: 6 }, badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', x: 8, y: 7, stand: { x: 8, y: 6 }, badge: 'badge-amber', pill: 'pill-amber' },
    ],
  };
})(window.MSC = window.MSC || {});

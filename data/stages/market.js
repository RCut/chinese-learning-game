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
      'WLLLMLLLMLLLMLLLMW',
      'WMMMMMMMMTMMMMMMMW',
      'WLMMMMMMMTMMMMMMLW',
      'WLMLLLMMMTLLLMMMLW',
      'WLMLLLMMMTLLMMMMLW',
      'WLMMMMMMMTMMMMMMMW',
      'WMMMMMLLMTMMMMMMMW',
      'WMMMMMMMMDMMMMMMMW',
      'WWWWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 9, y: 7 },
    scenery: [],
    // Level 1 (HSK 1) goods sit first on their stalls, next to the stall sign: 菜 · 肉 鱼 · 鸡蛋 面条儿 · 水 牛奶 ·
    // 包子 饺子 面包 米饭 · 苹果 水果 · 茶 — and Zhang's price board (块) by his counter. The rest appears at level 2.
    objects: [
      // ── back wall, left to right: vegetables · meat & fish · eggs & noodles · drinks ──
      sign('mk-veg', 1, 1, '菜', [['菜', 'vegetables'], ['白菜', 'Chinese cabbage'], ['豆腐', 'tofu']],
        '菜 is vegetables — and also a dish of food: 中国菜 is Chinese food.'),
      item('mk-cabbage', 2, 1, '白菜', '黄瓜和青菜都很新鲜！ — The vegetables are fresh!'),
      item('mk-bean-curd', 3, 1, '豆腐'),

      sign('mk-meat', 5, 1, '肉', [['肉', 'meat'], ['鱼', 'fish']]),
      item('mk-pork', 6, 1, '肉', '肉 is meat. 我不吃肉。 — I do not eat meat.'),
      item('mk-fishitem', 7, 1, '鱼', '鱼很新鲜！ — The fish is very fresh!'),

      sign('mk-tofu', 9, 1, '面', [['鸡蛋', 'eggs'], ['面条儿', 'noodles'], ['面', 'flour / noodles']]),
      item('mk-egg', 10, 1, '鸡蛋', 'Eggs are counted with 个: 两个鸡蛋 = two eggs.'),
      item('mk-noodles', 11, 1, '面条儿', 'Fresh 面条儿 (noodles). 面 is flour, 条 is a long strip.'),

      sign('mk-drink', 13, 1, '水', [['水', 'water'], ['牛奶', 'milk'], ['果汁', 'fruit juice']], '喝水 = to drink water.'),
      item('mk-milk', 14, 1, '牛奶'),
      item('mk-juice', 15, 1, '果汁'),

      // ── left wall: tea ──
      sign('mk-tea', 1, 3, '茶', [['茶', 'tea'], ['绿茶', 'green tea'], ['红茶', 'black tea'], ['奶茶', 'milk tea']], '喝茶 = to drink tea.'),
      item('mk-greentea', 1, 4, '绿茶'),
      item('mk-blacktea', 1, 5, '红茶'),
      item('mk-milktea', 1, 6, '奶茶', '奶茶 = "milk tea": a sweet tea drink with milk.'),

      // ── island: snacks and bakery ──
      sign('mk-snack', 3, 4, '点心', [['包子', 'steamed buns'], ['饺子', 'dumplings'], ['面包', 'bread'], ['米饭', 'rice'], ['蛋糕', 'cake']],
        '蛋糕和点心也很好吃！ — The cakes and pastries are tasty too!'),
      item('mk-bun', 4, 4, '包子'),
      item('mk-dumpling', 5, 4, '饺子'),
      item('mk-bread', 3, 5, '面包'),
      item('mk-rice', 4, 5, '米饭'),
      item('mk-cake', 5, 5, '蛋糕'),

      // ── island: fruit (beside the Fruit Stall cart) ──
      sign('mk-fruit', 10, 4, '水果', [['苹果', 'apple'], ['香蕉', 'banana'], ['西瓜', 'watermelon'], ['橙子', 'orange']],
        '水果 is fruit — all kinds. 我喜欢吃水果。 — I like eating fruit.'),
      item('mk-apple', 11, 4, '苹果'),
      item('mk-banana', 12, 4, '香蕉'),
      item('mk-melon', 10, 5, '西瓜'),
      item('mk-orange', 11, 5, '橙子'),

      // ── right wall: bags ──
      sign('mk-bagsign', 16, 3, '包', [['包', 'bag'], ['书包', 'schoolbag'], ['袋子', 'carrier bag']],
        '包 is a bag. 书包 is a schoolbag ("book bag").'),
      { id: 'mk-schoolbag', sprite: 'hm-schoolbag', x: 16, y: 4, hanzi: '书包', note: '书包: a schoolbag.' },
      item('mk-bag', 16, 5, '袋子', 'You can ask for a bag: 请给我一个袋子。 — Please give me a bag.'),

      // ── front: the till and, next to Zhang, his price board ──
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

      // ── lanterns hanging on the walls ──
      item('mk-lantern2', 17, 8, '灯笼', 'Red lanterns bring good luck. — 灯笼 are hung for festivals and in markets.'),
      item('mk-lantern3', 17, 2, '灯笼'),
      item('mk-lantern4', 0, 2, '灯笼'),
    ],
    entities: [
      { id: 'door-market-out', kind: 'door', name: 'Outside', hanzi: '外面', x: 9, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果', x: 7, y: 5, stand: { x: 7, y: 6 }, badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', x: 8, y: 7, stand: { x: 8, y: 6 }, badge: 'badge-amber', pill: 'pill-amber' },
    ],
  };
})(window.MSC = window.MSC || {});

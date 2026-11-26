/* STAGE: Barista Lin's café. (See data/world.js for the format.)
 * Extra tiles (css/stage-cafe.css): T table top · Q tea-corner rug · V window wall. */
(function (MSC) {
  MSC.data.world.stages.cafe = {
    id: 'cafe', name: 'Café', hanzi: '咖啡店', sound: 'cafe',
    cols: 16, rows: 10,
    blockedTiles: ['T', 'V'],
    map: [
      'WWWWWWWWWVVVVVWW',
      'WFFFFFFFFFFFFFFW',
      'WFCCCCCFFFFFQQQW',
      'WFFFFFFFFFFFQQQW',
      'WFFFFFFFFFFFQQQW',
      'WFFTTFFFFFTTFFFW',
      'WFFFFFFFFFFFFFFW',
      'WFFTTTFFFFFFFFFW',
      'WFFFFFFDFFFFFFFW',
      'WWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 7, y: 7 },
    scenery: [
      { x: 4, y: 0, text: '咖啡店', className: 'scenery-sign' },
    ],
    objects: [
      { id: 'cf-machine', x: 1, y: 1, hanzi: '咖啡机', text: [{ hanzi: '咖啡在左边', english: 'Coffee is on the left' }], note: 'Barista Lin makes your 咖啡 with this.' },
      { id: 'cf-cups', x: 7, y: 1, hanzi: '杯子', note: 'Count cups with 杯: 一杯咖啡 is one cup of coffee.' },
      { id: 'cf-milk', x: 8, y: 1, hanzi: '牛奶', note: 'Fresh 牛奶 for the 咖啡.' },
      { id: 'cf-cake', x: 9, y: 1, hanzi: '蛋糕', note: 'A slice of 蛋糕 goes nicely with 咖啡.' },
      { id: 'cf-window', x: 13, y: 1, hanzi: '窗户', note: 'A 窗户 looks out on the street.' },
      { id: 'cf-sugar', x: 14, y: 4, hanzi: '糖', note: 'Want 糖 in your 咖啡?' },
      { id: 'cf-welcome', x: 1, y: 5, hanzi: '欢迎光临', text: [{ hanzi: '欢迎光临', english: 'Welcome!' }] },
      { id: 'cf-table', x: 3, y: 5, hanzi: '桌子', note: 'A 桌子 to sit at: a table.' },
      { id: 'cf-chair-1', x: 3, y: 6, hanzi: '椅子', note: 'A 椅子 to sit on: a chair.' },
      { id: 'cf-chair-2', x: 5, y: 5, hanzi: '椅子', note: 'A 椅子 to sit on: a chair.' },
      { id: 'cf-spoon', x: 10, y: 5, hanzi: '勺子', note: 'A 勺子 stirs the 咖啡: a spoon.' },
      { id: 'cf-cup-table', x: 11, y: 5, hanzi: '咖啡', level: 1, note: '一杯咖啡 = a cup of coffee. Not an HSK 1 word — but in a café you need it!' },
      { id: 'cf-chair-3', x: 10, y: 6, hanzi: '椅子', note: 'A 椅子 to sit on: a chair.' },
      { id: 'cf-chair-4', x: 12, y: 5, hanzi: '椅子', note: 'A 椅子 to sit on: a chair.' },

      // ── level 2 (HSK 2): milk tea, noodles, a bag, seats, inside and left / right ──
      { id: 'cf-milktea', x: 12, y: 3, hanzi: '奶茶', note: '奶茶 is milk tea — and the cups of bubble tea are 奶茶 too.' },
      { id: 'cf-noodle', x: 4, y: 5, hanzi: '面', note: '面 is noodles: 牛肉面 is beef noodles, 面条儿 are the noodles themselves.' },
      { id: 'cf-bag', x: 1, y: 8, hanzi: '包', note: 'A 包 is a bag. A school bag is a 书包.' },
      { id: 'cf-seats', x: 11, y: 8, hanzi: '位', text: [{ hanzi: '几位？', english: 'How many people?' }, { hanzi: '三位', english: 'Three people' }], note: '位 is the polite measure word for people: 几位？三位。' },
      { id: 'cf-inside', x: 11, y: 1, hanzi: '里面', text: [{ hanzi: '里面请', english: 'Please come in' }, { hanzi: '外面也有桌子', english: 'There are tables outside too' }], note: '里面 is inside; its opposite is 外面, outside.' },

      // ── level 1 (HSK 1): the counter, the tea corner, water, and a lunch table ──
      { id: 'cf-lunch', x: 12, y: 1, hanzi: '午饭', note: '午饭 = lunch (饭 is a meal). 早饭 is breakfast, 晚饭 is dinner.',
        text: [{ hanzi: '午饭', english: 'Lunch' }, { hanzi: '中午十一点到两点', english: 'From eleven to two o’clock' }, { hanzi: '我们的饭很好吃！', english: 'Our food is very tasty!' }] },
      { id: 'cf-phone', x: 2, y: 2, hanzi: '电话', note: 'The café 电话. People call to order: 喂，我要一杯茶！ — Hello, I’d like a cup of tea!',
        listen: ['一杯茶', '两杯水', '一个包子', '两碗米饭', '一杯咖啡', '十个饺子', '一碗面条儿', '一杯牛奶'], listenTitle: 'An order on the phone' },
      { id: 'cf-money', x: 6, y: 2, hanzi: '钱', note: '钱 is money. Ask 多少钱？ — how much? Prices are said in 块: 十块 = ¥10.' },
      { id: 'cf-water', x: 1, y: 4, hanzi: '水', note: 'Free 水 (water) for everyone. 两杯水 = two glasses of water.' },
      { id: 'cf-tea', x: 13, y: 3, hanzi: '茶', text: [{ hanzi: '茶在右边', english: 'Tea is on the right' }], note: 'A cup of green 茶. 喝茶 = to drink tea.' },
      { id: 'cf-chair-5', x: 2, y: 7, hanzi: '椅子' },
      { id: 'cf-rice', x: 3, y: 7, hanzi: '米饭', note: '米饭 is cooked rice, counted in bowls: 一碗米饭.' },
      { id: 'cf-dish', x: 4, y: 7, hanzi: '菜', note: '菜 is a dish of food (and vegetables): 这个菜很好吃！ — This dish is tasty!' },
      { id: 'cf-mobile', x: 5, y: 7, hanzi: '手机', note: 'Someone left a 手机 (mobile phone) on the table.' },
    ],
    entities: [
      { id: 'door-cafe-out', kind: 'door', name: 'Outside', hanzi: '外面', x: 7, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'barista', name: 'Barista Lin', hanzi: '林老板', x: 4, y: 1, stand: { x: 4, y: 3 }, zone: { x1: 2, x2: 6, y1: 3, y2: 3 }, badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'menu', name: 'Café Menu', hanzi: '菜单', x: 10, y: 2, stand: { x: 10, y: 3 }, badge: 'badge-stone', pill: 'pill-stone' },
    ],
  };
})(window.MSC = window.MSC || {});

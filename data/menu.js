/*
 * MENU & SHOP ITEMS — what can be ordered at the café and bought at the fruit stall.
 *
 * Café items: `prices` — one is picked at random per session and printed on the menu.
 *   measure      measure word used when ordering (杯 / 碗 / 个)
 *   qty          how many are ordered (1 → 一, 2 → 两, 10 → 十)
 *   level        the level the item is on the menu from (data/levels.js); level 1 = HSK 1 food and drink
 *   orderEnglish English used in the goal ("Order one iced coffee.")
 *   grammarHint  first hint level shown on demand / after a failed attempt
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.menu = {
    // Level 1 (HSK 1): 咖啡 (a deliberate extra — it's a café!), 茶, 水, 牛奶 · 米饭, 包子, 面包, 面条儿, 饺子.
    // Level 2 adds 冰咖啡, 热茶, 牛肉面. The cheapest drink and food are level-1 items, so the starting money
    // (economy.js: one random drink + food + spare) always buys a level-1 order.
    drinks: [
      {
        id: 'kafei', hanzi: '咖啡', english: 'coffee', menuEnglish: 'Coffee', level: 1,
        qty: 1, measure: '杯', orderEnglish: 'one cup of coffee', prices: [10, 12, 14],
        greeting: { hanzi: '你好！你想喝什么？', english: 'Hello! What would you like to drink?' },
        grammarHint: 'Drinks are counted in cups: number + 杯 + drink. 一杯咖啡 = one cup of coffee.',
      },
      {
        id: 'cha', hanzi: '茶', english: 'tea', menuEnglish: 'Tea', level: 1,
        qty: 1, measure: '杯', orderEnglish: 'one cup of tea', prices: [5, 6, 8],
        greeting: { hanzi: '你好！你想喝什么？我们的茶很好。', english: 'Hello! What would you like to drink? Our tea is very good.' },
        grammarHint: 'Drinks take the measure word 杯 (cup): 一 + 杯 + 茶.',
      },
      {
        id: 'shui', hanzi: '水', english: 'water', menuEnglish: 'Water (2 glasses)', level: 1,
        qty: 2, measure: '杯', orderEnglish: 'two glasses of water', prices: [2, 3, 4],
        greeting: { hanzi: '你好！今天很热！你想喝什么？', english: 'Hello! It’s hot today! What would you like to drink?' },
        grammarHint: 'Before a measure word, "two" is 两 — not 二: 两杯水.',
      },
      {
        id: 'niunai', hanzi: '牛奶', english: 'milk', menuEnglish: 'Milk', level: 1,
        qty: 1, measure: '杯', orderEnglish: 'one glass of milk', prices: [6, 8, 9],
        greeting: { hanzi: '你好！我们有咖啡、茶和牛奶。你想喝什么？', english: 'Hello! We have coffee, tea and milk. What would you like to drink?' },
        grammarHint: 'Drinks take the measure word 杯 (cup / glass): 一 + 杯 + drink.',
      },
      {
        id: 'bing_kafei', hanzi: '冰咖啡', english: 'iced coffee', menuEnglish: 'Iced coffee', level: 2,
        qty: 1, measure: '杯', orderEnglish: 'one iced coffee', prices: [12, 14, 15],
        greeting: { hanzi: '你好！你想喝什么？热的还是冰的？', english: 'Hello! What would you like to drink? Hot or iced?' },
        grammarHint: 'Describing words go before the noun: number + measure word (一杯) + 冰 + 咖啡.',
      },
      {
        id: 're_cha', hanzi: '热茶', english: 'hot tea', menuEnglish: 'Hot tea', level: 2,
        qty: 1, measure: '杯', orderEnglish: 'one cup of hot tea', prices: [8, 10, 12],
        greeting: { hanzi: '你好！今天想喝点什么？咖啡还是茶？', english: 'Hello! What would you like to drink today? Coffee or tea?' },
        grammarHint: 'Temperature words like 热 (hot) go right before the drink: 热茶. Drinks are counted in cups: 一杯.',
      },
    ],
    foods: [
      {
        id: 'mifan', hanzi: '米饭', english: 'rice', menuEnglish: 'Rice (2 bowls)', level: 1,
        qty: 2, measure: '碗', orderEnglish: 'two bowls of rice', prices: [4, 5],
        grammarHint: 'Before a measure word, "two" is 两 — not 二. Rice is counted in bowls (碗).',
      },
      {
        id: 'baozi', hanzi: '包子', english: 'steamed buns', menuEnglish: 'Steamed buns (2)', level: 1,
        qty: 2, measure: '个', orderEnglish: 'two steamed buns', prices: [6, 8, 10],
        grammarHint: 'Before a measure word, "two" is 两 — not 二. Buns use the general measure word 个.',
      },
      {
        id: 'mianbao', hanzi: '面包', english: 'bread', menuEnglish: 'Bread (1)', level: 1,
        qty: 1, measure: '个', orderEnglish: 'one piece of bread', prices: [5, 6],
        grammarHint: 'Bread takes the general measure word 个: 一个面包.',
      },
      {
        id: 'miantiaor', hanzi: '面条儿', english: 'noodles', menuEnglish: 'Noodles (1 bowl)', level: 1,
        qty: 1, measure: '碗', orderEnglish: 'one bowl of noodles', prices: [8, 10, 12],
        grammarHint: 'Noodles and rice are counted in bowls: number + 碗 + dish. 一碗面条儿.',
      },
      {
        id: 'jiaozi', hanzi: '饺子', english: 'dumplings', menuEnglish: 'Dumplings (10)', level: 1,
        qty: 10, measure: '个', orderEnglish: 'ten dumplings', prices: [10, 12, 14],
        grammarHint: 'Dumplings are counted with 个, and ten is 十: 十个饺子.',
      },
      {
        id: 'niuroumian', hanzi: '牛肉面', english: 'beef noodles', menuEnglish: 'Beef noodles (1 bowl)', level: 2,
        qty: 1, measure: '碗', orderEnglish: 'one bowl of beef noodles', prices: [14, 15, 16],
        grammarHint: 'Noodles and rice are counted in bowls: number + 碗 + dish.',
      },
    ],

    // Shown instead of the drink's own greeting from the second order on.
    againGreeting: { hanzi: '你好，朋友！今天还想喝什么？', english: 'Hello again, friend! What would you like to drink today?' },

    // Fruit stall. Each purchase is always "two of" the fruit.
    fruits: [
      { hanzi: '苹果', english: 'apple', plural: 'apples', unitPrice: 4, wrongMeasure: '碗', wrongMeasureEnglish: 'bowls of' },
      { hanzi: '香蕉', english: 'banana', plural: 'bananas', unitPrice: 3, wrongMeasure: '杯', wrongMeasureEnglish: 'cups of' },
      { hanzi: '西瓜', english: 'watermelon', plural: 'watermelons', unitPrice: 6, wrongMeasure: '碗', wrongMeasureEnglish: 'bowls of' },
    ],
  };
})(window.MSC = window.MSC || {});

/*
 * MENU & SHOP ITEMS — what can be ordered at the café and bought at the fruit stall.
 *
 * Café items: `prices` — one is picked at random per session and printed on the menu.
 *   measure      measure word used when ordering (杯 / 碗 / 个)
 *   qty          how many are ordered (1 → 一, 2 → 两)
 *   orderEnglish English used in the goal ("Order one iced coffee.")
 *   grammarHint  first hint level shown on demand / after a failed attempt
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.menu = {
    drinks: [
      {
        id: 'bing_kafei', hanzi: '冰咖啡', english: 'iced coffee', menuEnglish: 'Iced coffee',
        qty: 1, measure: '杯', orderEnglish: 'one iced coffee', prices: [12, 14, 15],
        greeting: { hanzi: '你好！你想喝什么？热的还是冰的？', english: 'Hello! What would you like to drink? Hot or iced?' },
        grammarHint: 'Describing words go before the noun: number + measure word (一杯) + 冰 + 咖啡.',
      },
      {
        id: 're_cha', hanzi: '热茶', english: 'hot tea', menuEnglish: 'Hot tea',
        qty: 1, measure: '杯', orderEnglish: 'one cup of hot tea', prices: [8, 10, 12],
        greeting: { hanzi: '你好！今天想喝点什么？咖啡还是茶？', english: 'Hello! What would you like to drink today? Coffee or tea?' },
        grammarHint: 'Temperature words like 热 (hot) go right before the drink: 热茶. Drinks are counted in cups: 一杯.',
      },
      {
        id: 'niunai', hanzi: '牛奶', english: 'milk', menuEnglish: 'Milk',
        qty: 1, measure: '杯', orderEnglish: 'one glass of milk', prices: [9, 10, 11],
        greeting: { hanzi: '欢迎光临！你想喝咖啡、茶，还是牛奶？', english: 'Welcome! Would you like coffee, tea, or milk?' },
        grammarHint: 'Drinks take the measure word 杯 (cup / glass): 一 + 杯 + drink.',
      },
    ],
    foods: [
      {
        id: 'niuroumian', hanzi: '牛肉面', english: 'beef noodles', menuEnglish: 'Beef noodles (1 bowl)',
        qty: 1, measure: '碗', orderEnglish: 'one bowl of beef noodles', prices: [14, 15, 16],
        grammarHint: 'Noodles and rice are counted in bowls: number + 碗 + dish.',
      },
      {
        id: 'baozi', hanzi: '包子', english: 'steamed buns', menuEnglish: 'Steamed buns (2)',
        qty: 2, measure: '个', orderEnglish: 'two steamed buns', prices: [8, 10, 12],
        grammarHint: 'Before a measure word, "two" is 两 — not 二. Buns use the general measure word 个.',
      },
      {
        id: 'mifan', hanzi: '米饭', english: 'rice', menuEnglish: 'Rice (2 bowls)',
        qty: 2, measure: '碗', orderEnglish: 'two bowls of rice', prices: [6, 8, 10],
        grammarHint: 'Before a measure word, "two" is 两 — not 二. Rice is counted in bowls (碗).',
      },
    ],

    // Shown instead of the drink's own greeting from the second order on.
    againGreeting: { hanzi: '欢迎再来！今天还想喝点什么？', english: 'Welcome back! What else would you like to drink today?' },

    // Fruit stall. Each purchase is always "two of" the fruit.
    fruits: [
      { hanzi: '苹果', english: 'apple', plural: 'apples', unitPrice: 4, wrongMeasure: '碗', wrongMeasureEnglish: 'bowls of' },
      { hanzi: '香蕉', english: 'banana', plural: 'bananas', unitPrice: 3, wrongMeasure: '杯', wrongMeasureEnglish: 'cups of' },
      { hanzi: '西瓜', english: 'watermelon', plural: 'watermelons', unitPrice: 6, wrongMeasure: '碗', wrongMeasureEnglish: 'bowls of' },
    ],
  };
})(window.MSC = window.MSC || {});

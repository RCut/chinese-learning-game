/*
 * QUESTS & DIALOGUE — every line the characters say, every objective and every hint.
 *
 * Lines are { hanzi, english }. Pinyin is generated automatically from data/dictionary.js,
 * so every word used here must exist in the dictionary (`node tools/check-data.js` checks this).
 * {placeholders} are filled in by the game (js/game/*.js).
 *
 * Hint policy: objectives are plain English with no Chinese. Grammar hints and clues are only
 * shown when the player presses Hint or after failed attempts.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.quests = {
    // ───────────────────────── Barista Lin (café ordering) ─────────────────────────
    barista: {
      title: 'Barista Lin',
      hanzi: '林老板',
      emoji: '👩‍🍳',

      gate: {
        hanzi: '你好！欢迎光临！请先看菜单，看看今天有什么。',
        english: 'Hello, welcome! Please look at the menu first and see what we have today.',
      },
      gateObjective: 'Check the café menu first.',

      broke: { hanzi: '不好意思，你的钱不够。', english: 'Sorry, you don’t have enough money.' },
      brokeObjective: 'You can’t afford anything right now. Maybe someone nearby could use your help?',

      foodPrompt: { hanzi: '我们有{food}和{other}。你要什么？', english: 'We have {foodEn} and {otherEn}. What would you like?' },
      drinkSuccess: { hanzi: '好的，{order}！', english: 'Sure, {orderEn}!' },
      drinkSuccessMore: { hanzi: '好的，{order}！还要吃什么吗？', english: 'Sure, {orderEn}! Anything to eat as well?' },
      foodSuccess: { hanzi: '好的！{order}，给你！', english: 'OK! {orderEn}, here you go!' },
      pricePrompt: { hanzi: '{orders}，都在这里！', english: 'Here you are: {ordersEn}!' },
      priceSuccess: { hanzi: '一共{total}。谢谢，欢迎再来！', english: 'That’s ¥{totalNum} altogether. Thank you, come again!' },

      goals: {
        drink: 'Order {orderEn}.',
        food: 'Order {orderEn}.',
        price: 'Ask how much it is altogether.',
      },
      roundDone: 'Order paid: ¥{totalNum}.',

      // Accepted ways to place an order. {order} = e.g. 一杯冰咖啡
      orderPatterns: {
        drink: ['我要{order}', '我想要{order}', '我想喝{order}', '{order}'],
        food: ['我要{order}', '我想要{order}', '我想吃{order}', '{order}'],
      },
      priceTarget: '一共多少钱',
      priceAccepted: ['一共多少钱', '多少钱'],
      priceGrammarHint: 'Put 一共 (altogether) in front of the question phrase 多少钱 (how much money).',
      clue: 'Word by word: {tokens}',

      reactions: {
        notEnoughMoney: {
          hanzi: '不好意思，你的钱不够！{item}要{price}，你只有{money}。',
          english: 'Sorry, you don’t have enough money! The {itemEn} costs ¥{priceNum}, and you only have ¥{moneyNum}.',
        },
        otherItem: { hanzi: '{item}？不是这个吧？再想想！', english: '{ItemEn}? That’s not the one, is it? Think again!' },
        beiTone: { hanzi: '哈哈，是一杯，不是被子哦！', english: 'Haha, it’s one cup (bēi) — bèizi is a quilt!' },
        woTone: { hanzi: '是“我”，不是“握”哦！', english: 'It’s wǒ (3rd tone, “I”), not wò (4th tone, “to grasp”)!' },
        erBeforeMeasure: { hanzi: '哈哈，量词前面我们说“两”，不说“二”哦！再试一次！', english: 'Haha, before a measure word we say liǎng, not èr! Try once more!' },
        wanTone: { hanzi: '一万碗？太多了！是一碗哦！', english: 'Ten thousand (wàn) bowls?! That’s too many! It’s wǎn, bowl.' },
        tonesOff: { hanzi: '我差不多听懂了！但是你的声调有一点不一样。', english: 'I almost understood! But your tones are a little different.' },
        notUnderstood: { hanzi: '不好意思，我没听清楚。你可以再说一遍吗？', english: 'Sorry, I didn’t catch that. Could you say it again?' },
      },
    },

    // ───────────────────────── Café menu board ─────────────────────────
    menu: {
      title: 'Café Menu',
      hanzi: '菜单',
      emoji: '📋',
      badge: 'Menu board',
      customer: { hanzi: '我要{item}。', english: 'I’d like the {itemEn}.' },
      instruction: 'A customer asks for something. Find it on the menu.',
      wrong: { hanzi: '再看看菜单！不是这个哦。', english: 'Have another look at the menu! Not that one.' },
      success: { hanzi: '对！{item}，{price}。现在去找林老板吧！', english: 'Right! The {itemEn} is ¥{priceNum}. Now go and order from Boss Lin!' },
      grammarHint: 'The customer says 我要 (I want) followed by the item. Match those characters on the menu.',
      clue: 'Look for {item} ({pinyin}).',
      xp: 15,
      repeatLabel: 'Another customer',
    },

    // ───────────────────────── Street signpost ─────────────────────────
    signpost: {
      title: 'Signpost',
      hanzi: '路牌',
      emoji: '🪧',
      badge: 'Street sign',
      directions: [
        { hanzi: '左边', english: 'on the left', arrow: '⬅️' },
        { hanzi: '前面', english: 'straight ahead', arrow: '⬆️' },
        { hanzi: '右边', english: 'on the right', arrow: '➡️' },
      ],
      landmarks: [
        { hanzi: '火车站', english: 'train station' },
        { hanzi: '地铁站', english: 'subway station' },
        { hanzi: '书店', english: 'bookstore' },
        { hanzi: '公园', english: 'park' },
        { hanzi: '水果摊', english: 'fruit stall' },
      ],
      signLine: '{arrow} {dir}：{place}',
      question: { hanzi: '{place}在哪里？', english: 'Where is the {placeEn}?' },
      option: { hanzi: '在{dir}', english: 'It’s {dirEn}.' },
      instruction: 'Read the sign and answer the question.',
      wrong: { hanzi: '方向不对哦，再看看路牌！', english: 'That direction isn’t right — check the sign again!' },
      success: { hanzi: '太好了，找到{place}了！', english: 'Great, you found the {placeEn}!' },
      grammarHint: 'Answer a 在哪里 (where is…) question with 在 + a direction word: 左边, 右边 or 前面.',
      clue: 'Find {place} on the sign and read the direction word in front of it.',
      xp: 15,
      repeatLabel: 'Another place',
    },

    // ───────────────────────── Fruit stall ─────────────────────────
    cart: {
      title: 'Fruit Stall',
      hanzi: '水果摊',
      emoji: '🍎',
      badge: 'Fruit stall',
      greeting: { hanzi: '你好！{fruit}一个{unit}。你要几个？', english: 'Hi! {PluralEn} are ¥{unitNum} each. How many would you like?' },
      instruction: 'You’d like two. Pick the right reply.',
      options: {
        correct: { hanzi: '我要两个{fruit}，一共{total}。', english: 'I’d like two {plural}, ¥{totalNum} altogether.' },
        er: { hanzi: '我要二个{fruit}，一共{total}。', english: 'I’d like two {plural}, ¥{totalNum} altogether.', why: 'Before a measure word, “two” is 两 — never 二.' },
        measure: { hanzi: '我要两{wrongMeasure}{fruit}，一共{total}。', english: 'I’d like two {wrongMeasureEn} {plural}, ¥{totalNum} altogether.', why: 'Fruit is counted with 个, the general measure word.' },
        math: { hanzi: '我要两个{fruit}，一共{wrongTotal}。', english: 'I’d like two {plural}, ¥{wrongTotalNum} altogether.', why: 'Check the total again: two × ¥{unitNum}.' },
      },
      wrong: { hanzi: '量词或数字不对哦，再算一算！', english: 'The measure word or the number isn’t right — work it out again!' },
      success: { hanzi: '好的，两个{fruit}，一共{total}。谢谢！', english: 'OK, two {plural}, ¥{totalNum} altogether. Thank you!' },
      successBroke: { hanzi: '对，一共{total}。可是你的钱不够哦！', english: 'Right, ¥{totalNum} altogether. But you don’t have enough money!' },
      grammarHint: 'Pattern: 两 + measure word + noun. Fruit uses the general measure word 个.',
      clue: '两个{fruit} — and two × ¥{unitNum} makes ¥{totalNum}.',
      xp: 15,
      repeatLabel: 'Buy more fruit',
    },

    // ───────────────────────── Lost traveler ─────────────────────────
    passerby: {
      title: 'Lost Traveler',
      hanzi: '路人',
      emoji: '🧳',
      badge: 'Traveler · tip ¥{tip}',
      tip: 10,
      instruction: 'Listen to the traveler’s question and pick the right reply.',
      encounters: [
        {
          question: { hanzi: '请问，咖啡店在哪里？', english: 'Excuse me, where is the café?' },
          correct: { hanzi: '咖啡店在前面', english: 'The café is straight ahead.' },
          distractors: [
            { hanzi: '这是火车站', english: 'This is the train station.' },
            { hanzi: '我要吃米饭', english: 'I want to eat rice.' },
          ],
          clue: 'The traveler asks about 咖啡店 (the café). It’s just ahead of you: 咖啡店在前面.',
        },
        {
          question: { hanzi: '请问，水果摊在哪里？', english: 'Excuse me, where is the fruit stall?' },
          correct: { hanzi: '水果摊在右边', english: 'The fruit stall is on the right.' },
          distractors: [
            { hanzi: '我要买苹果', english: 'I want to buy apples.' },
            { hanzi: '咖啡店在这里', english: 'The café is here.' },
          ],
          clue: 'Place + 在 + direction: 水果摊 + 在 + 右边.',
        },
        {
          question: { hanzi: '请问，这里是咖啡店吗？', english: 'Excuse me, is this the café?' },
          correct: { hanzi: '对，这里是咖啡店', english: 'Yes, this is the café.' },
          distractors: [
            { hanzi: '这是火车站', english: 'This is the train station.' },
            { hanzi: '一共有十块', english: 'There’s ten yuan in total.' },
          ],
          clue: 'Say yes with 对, then repeat the question as a statement: 这里是咖啡店.',
        },
      ],
      wrong: { hanzi: '不对哦，再听一遍我的问题！', english: 'Not quite — listen to my question again!' },
      success: { hanzi: '谢谢你！给你十块钱！再见！', english: 'Thank you! Here’s ten yuan for you! Goodbye!' },
      grammarHint: 'To answer “X 在哪里？”, keep the place and swap 哪里 for a location: X + 在 + 前面 / 右边 / 这里.',
      xp: 20,
      repeatLabel: 'Another traveler',
    },
  };
})(window.MSC = window.MSC || {});

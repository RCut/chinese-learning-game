/*
 * CHAT — Shopkeeper Zhang (张老板), the grocer in the market. Same format and same engine as data/chat.js (Xiao Li):
 * every visit starts a NEW random conversation about BUYING things. Nothing is multiple choice — you build what you say.
 * Prices in the slots are plain numbers of yuan; the stall boards themselves list item names only.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.chats = MSC.data.chats || {};
  MSC.data.chats.grocer = {
    npc: { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', emoji: '👨‍🍳', blurb: 'The grocer: practise buying food, prices and bargaining' },
    xpTurn: 8,
    xpFinish: 20,
    lines: {
      notUnderstood: { hanzi: '不好意思，我没听清楚。你可以再说一遍吗？', english: "Sorry, I didn't catch that. Could you say it again?" },
      tonesOff: { hanzi: '我差不多听懂了！但是你的声调有一点不一样。', english: 'I almost understood! But your tones are a little different.' },
    },

    dialogues: [
      // ───────────────────────── 1. How much is a jin? (YOU start) ─────────────────────────
      {
        id: 'price', title: 'How much is a jin?',
        slots: { item: [{ hanzi: '土豆', en: 'potatoes' }, { hanzi: '萝卜', en: 'radishes' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask how much a jin of {item.en} costs.', tip: '多少钱 = "how much money"; 一斤 = "one jin" (about 500 g): 一斤{item}多少钱？',
            replies: [{ say: ['(请问，)一斤{item}多少钱', '(请问，){item}一斤多少钱', '(请问，){item}多少钱一斤'], en: 'How much is a jin of {item.en}?', next: 'n2' }] },
          n2: { npc: { hanzi: '{item}一斤两块。你要几斤？', english: '{item.en} are 2 yuan a jin. How many jin do you want?' }, goal: 'Say that you want three jin.', tip: '要 + number + 斤. (Only "two" becomes 两 before a measure word; three is just 三.)',
            replies: [{ say: ['我要三斤({item})', '给我三斤({item})', '三斤，谢谢'], en: 'I want three jin.', next: 'n3' }] },
          n3: { npc: { hanzi: '好的，三斤，一共六块。你还要别的吗？', english: 'OK, three jin, six yuan altogether. Anything else?' }, goal: 'Say that you also want a bag — or that this is all.', tip: '还要 = "also want"; 不要了 = "no more".',
            replies: [
              { say: ['我还要一个袋子'], en: 'I also want a bag.', label: 'A bag', next: 'n4a' },
              { say: ['不要了，谢谢', '不要了'], en: "No more, thank you.", label: "That's all", next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '没问题，袋子送你！', english: 'No problem, the bag is a gift from me!' }, goal: 'Say thank you and hand over six yuan.', tip: '给你 = "here you are" (literally "give you").',
            replies: [{ say: ['谢谢，给你六块(钱)', '给你六块(钱)，谢谢'], en: 'Thanks, here are six yuan.', next: 'bye1' }] },
          n4b: { npc: { hanzi: '好的，那你付钱吧。一共六块。', english: "OK, then please pay. Six yuan altogether." }, goal: 'Hand over the six yuan.', tip: '给你 + amount + 块.',
            replies: [{ say: ['给你六块(钱)', '给你，六块(钱)'], en: 'Here are six yuan.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '谢谢！欢迎再来！', english: 'Thank you! Welcome back any time!' }, end: true },
          bye2: { npc: { hanzi: '谢谢！明天再来！', english: 'Thanks! Come again tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 2. Bargaining (Zhang starts) ─────────────────────────
      {
        id: 'bargain', title: 'Bargaining',
        slots: { thing: [{ hanzi: '一斤虾', en: 'a jin of shrimp' }, { hanzi: '一斤牛肉', en: 'a jin of beef' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '欢迎光临！今天的东西都很新鲜！', english: 'Welcome! Everything is very fresh today!' }, goal: 'Ask how much {thing.en} costs.', tip: 'Put the thing first, then 多少钱: {thing}多少钱？',
            replies: [{ say: ['(请问，){thing}多少钱'], en: 'How much is {thing.en}?', next: 'n2' }] },
          n2: { npc: { hanzi: '{thing}三十块。', english: '{thing.en} costs 30 yuan.' }, goal: 'Decide: ask for a lower price, accept it, or say it is too expensive and leave.', tip: '太 + adjective + 了 = "too …". 便宜一点 = "a little cheaper". 不买了 = "not buying (any more)".',
            replies: [
              { say: ['太贵了，便宜一点'], en: "That's too expensive — a bit cheaper, please.", label: 'Bargain', next: 'n3a' },
              { say: ['好，我要{thing}'], en: "OK, I'll take {thing.en}.", label: 'Accept', next: 'n4' },
              { say: ['太贵了，不买'], en: "That's too expensive, I won't buy.", label: 'Walk away', next: 'bye3' },
            ] },
          n3a: { npc: { hanzi: '好吧，{thing}二十五块，可以吗？', english: 'All right: {thing.en} for 25 yuan. OK?' }, goal: 'Accept the new price — or ask for an even lower one.', tip: '还是太贵 = "still too expensive". Say the price you want: 二十块.',
            replies: [
              { say: ['好，我要{thing}'], en: "OK, I'll take it.", label: 'Accept', next: 'n4' },
              { say: ['还是太贵，二十块吧'], en: "It's still too expensive — twenty yuan?", label: 'Push harder', next: 'n3d' },
            ] },
          n3d: { npc: { hanzi: '不好不好！二十五块，真的不能再便宜了！', english: "No no no! 25 yuan — I really can't go any cheaper!" }, goal: 'Accept the price — or say that you will not buy.', tip: '好吧 = "all right then". 再见 ends a visit.',
            replies: [
              { say: ['好吧，我要{thing}', '好吧，二十五块'], en: "All right, I'll take it.", label: 'Accept', next: 'n4' },
              { say: ['那我不买了，再见', '不买了，再见'], en: "Then I won't buy. Goodbye.", label: 'Leave', next: 'bye3' },
            ] },
          n4: { npc: { hanzi: '好的！你要袋子吗？', english: 'Good! Do you want a bag?' }, goal: 'Say yes please — or no thanks.', tip: '要 = "want / will take"; 不要 = "no".',
            replies: [
              { say: ['要，谢谢', '要一个，谢谢'], en: 'Yes please.', label: 'Yes', next: 'bye1' },
              { say: ['不要，谢谢'], en: 'No, thank you.', label: 'No', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '给你，袋子送你！欢迎再来！', english: 'Here you are — the bag is on me! Welcome back!' }, end: true },
          bye2: { npc: { hanzi: '好的，给你！谢谢，再见！', english: 'OK, here you are! Thanks, goodbye!' }, end: true },
          bye3: { npc: { hanzi: '好吧，再见！欢迎再来！', english: 'All right, goodbye! Come again!' }, end: true },
        },
      },

      // ───────────────────────── 3. Snacks (YOU start) ─────────────────────────
      {
        id: 'snacks', title: 'Something to eat',
        slots: { buy: [{ hanzi: '两个包子', en: 'two steamed buns' }, { hanzi: '四个馒头', en: 'four plain steamed breads' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask what snacks he has.', tip: '什么 = "what": 你们有什么点心？ ("you-all have what snacks")',
            replies: [{ say: ['(请问，)你们有什么(点心)', '(请问，)你有什么(点心)', '有什么点心'], en: 'What snacks do you have?', next: 'n2' }] },
          n2: { npc: { hanzi: '我们有包子、馒头、饺子，还有面包。你想吃什么？', english: 'We have steamed buns, plain steamed bread, dumplings, and bread. What would you like?' }, goal: 'Choose: {buy.en}, or a bowl of dumplings.', tip: 'Number + measure word + food. Bowls (碗) for dumplings, 个 for buns. Two is 两.',
            replies: [
              { say: ['我要{buy}', '给我{buy}', '我想吃{buy}'], en: 'I want {buy.en}.', label: 'Buns / bread', next: 'n3a' },
              { say: ['我要一碗饺子', '给我一碗饺子', '我想吃一碗饺子'], en: 'I want a bowl of dumplings.', label: 'Dumplings', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '好的，{buy}，一共四块。', english: 'OK, {buy.en}: four yuan altogether.' }, goal: 'Hand over four yuan.', tip: '给你 + amount.',
            replies: [{ say: ['给你四块(钱)', '给你，四块(钱)'], en: 'Here are four yuan.', next: 'bye1' }] },
          n3b: { npc: { hanzi: '好，饺子十块一碗。你要辣的吗？', english: 'OK, dumplings are 10 yuan a bowl. Do you want spicy ones?' }, goal: 'Say whether you want them spicy.', tip: '辣 = spicy. 的 turns it into "the spicy kind": 辣的.',
            replies: [
              { say: ['我要辣的', '要辣的'], en: 'I want spicy ones.', label: 'Spicy', next: 'bye2' },
              { say: ['我不要辣的', '不要辣的'], en: "I don't want spicy ones.", label: 'Not spicy', next: 'bye3' },
            ] },
          bye1: { npc: { hanzi: '谢谢！很好吃哦，再来！', english: 'Thanks! They are delicious — come again!' }, end: true },
          bye2: { npc: { hanzi: '好的，辣的。很辣哦！给你！', english: "OK, spicy ones. They're very spicy! Here you are!" }, end: true },
          bye3: { npc: { hanzi: '好的，不辣的。给你！欢迎再来！', english: 'OK, not spicy. Here you are! Welcome back!' }, end: true },
        },
      },

      // ───────────────────────── 4. Weighing vegetables (YOU start) ─────────────────────────
      {
        id: 'weigh', title: 'Weighing vegetables',
        slots: { item: [{ hanzi: '白菜', en: 'Chinese cabbage' }, { hanzi: '黄瓜', en: 'cucumbers' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Say that you want two jin of {item.en}.', tip: '我要 + number + 斤 + food. Before a measure word, "two" is 两.',
            replies: [{ say: ['我要两斤{item}', '给我两斤{item}', '我想买两斤{item}'], en: 'I want two jin of {item.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '好的！你看，这是两斤{item}。够吗？', english: 'OK! Look, here are two jin of {item.en}. Is that enough?' }, goal: 'Say that it is enough — or ask for one more jin.', tip: '够了 = "enough already". 再要一斤 = "want one more jin".',
            replies: [
              { say: ['够了(，谢谢)'], en: "That's enough.", label: 'Enough', next: 'n3a' },
              { say: ['再来一斤', '我想再要一斤', '再要一斤'], en: 'One more jin, please.', label: 'One more', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '好的，两斤，一共六块。', english: 'OK, two jin: six yuan altogether.' }, goal: 'Ask whether the {item.en} are fresh.', tip: 'Adjective + 吗: {item}新鲜吗？',
            replies: [{ say: ['{item}新鲜吗', '这个新鲜吗', '新鲜吗'], en: 'Is it fresh?', next: 'n4' }] },
          n3b: { npc: { hanzi: '好，再来一斤，三斤，一共九块。很新鲜吧？', english: 'OK, one more: three jin, nine yuan altogether. Nice and fresh, right?' }, goal: 'Agree that it is very fresh.', tip: '很 + adjective.',
            replies: [{ say: ['很新鲜(，谢谢)', '真新鲜', '对，很新鲜'], en: 'Yes, very fresh.', next: 'n4' }] },
          n4: { npc: { hanzi: '新鲜！今天早上的！你要袋子吗？', english: 'Fresh! From this morning! Do you want a bag?' }, goal: 'Say yes please — or no thanks.', tip: '要 = "want"; 不要 = "no".',
            replies: [
              { say: ['要，谢谢', '请给我一个袋子'], en: 'Yes, please.', label: 'Yes', next: 'bye1' },
              { say: ['不要，谢谢'], en: 'No, thank you.', label: 'No', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '给你！谢谢，欢迎再来！', english: 'Here you are! Thanks, welcome back!' }, end: true },
          bye2: { npc: { hanzi: '好的，谢谢！明天再来！', english: 'OK, thanks! Come again tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 5. What is fresh today? (YOU start) ─────────────────────────
      {
        id: 'fresh', title: 'What is fresh today?',
        slots: { fruit: [{ hanzi: '橙子', en: 'oranges' }, { hanzi: '葡萄', en: 'grapes' }, { hanzi: '草莓', en: 'strawberries' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask the shopkeeper what is fresh today.', tip: '今天什么新鲜？ — "today what fresh".',
            replies: [{ say: ['今天什么(东西)新鲜', '今天有什么新鲜的', '什么新鲜'], en: 'What is fresh today?', next: 'n2' }] },
          n2: { npc: { hanzi: '今天{fruit}很新鲜，也很甜！', english: 'Today the {fruit.en} are very fresh, and sweet too!' }, goal: 'Ask whether the {fruit.en} are sweet.', tip: 'Adjective + 吗: …甜吗？',
            replies: [{ say: ['{fruit}甜吗', '真的甜吗', '这个甜吗'], en: 'Are they sweet?', next: 'n3' }] },
          n3: { npc: { hanzi: '很甜，不酸！你吃吃看。', english: "Very sweet, not sour! Try some." }, goal: 'Say that it is delicious — or that it is a bit sour.', tip: '好吃 = delicious. 有一点 + adjective = "a little …".',
            replies: [
              { say: ['真好吃！我要一斤{fruit}', '很好吃！我要一斤{fruit}', '很好吃，我要一斤'], en: "Delicious! I'll take a jin.", label: 'Delicious', next: 'n4' },
              { say: ['有一点酸，我不买了', '有一点酸，不买了'], en: "It's a bit sour, I won't buy.", label: 'A bit sour', next: 'bye2' },
            ] },
          n4: { npc: { hanzi: '一斤八块，很便宜！你要几斤？', english: "8 yuan a jin, very cheap! How many jin do you want?" }, goal: 'Say that it is cheap and you want two jin.', tip: '便宜 = cheap. 两斤 = "two jin".',
            replies: [{ say: ['很便宜！我要两斤', '便宜，我要两斤', '好便宜！我要两斤'], en: "Cheap! I'll take two jin.", next: 'n5' }] },
          n5: { npc: { hanzi: '好，两斤，一共十六块。', english: 'OK, two jin: 16 yuan altogether.' }, goal: 'Hand over twenty yuan.', tip: '给你 + 二十块.',
            replies: [{ say: ['给你二十块(钱)', '给你，二十块(钱)'], en: 'Here are twenty yuan.', next: 'n6' }] },
          n6: { npc: { hanzi: '二十块，找你四块。给你！', english: "Twenty yuan — here's four yuan change. Here you are!" }, goal: 'Say thank you and goodbye.', tip: 'Thank you, then goodbye (再 + 见).',
            replies: [{ say: ['谢谢，再见', '谢谢你，再见'], en: 'Thanks, goodbye.', next: 'bye1' }] },
          bye1: { npc: { hanzi: '不客气！欢迎再来！', english: "You're welcome! Welcome back!" }, end: true },
          bye2: { npc: { hanzi: '没关系！那你看看别的吧。再见！', english: "No problem! Have a look at something else. Goodbye!" }, end: true },
        },
      },

      // ───────────────────────── 6. Paying and change (Zhang starts) ─────────────────────────
      {
        id: 'change', title: 'Paying and change',
        slots: { item: [{ hanzi: '一斤鸡肉', en: 'a jin of chicken' }, { hanzi: '三斤西红柿', en: 'three jin of tomatoes' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '{item}，一共十二块。', english: '{item.en}: twelve yuan altogether.' }, goal: 'Pay: give twenty yuan, give twelve yuan exactly, or say you have no small change.', tip: '零钱 = small change. 没有 = "do not have".',
            replies: [
              { say: ['给你二十块(钱)', '给你，二十块(钱)'], en: 'Here are twenty yuan.', label: 'Twenty yuan', next: 'n2a' },
              { say: ['给你，十二块，我有零钱', '我有零钱，给你十二块'], en: 'Here are twelve yuan, I have change.', label: 'Exact money', next: 'bye2' },
              { say: ['我没有零钱，对不起'], en: "I don't have small change, sorry.", label: 'No change', next: 'n2c' },
            ] },
          n2a: { npc: { hanzi: '二十块，找你八块。给你！', english: "Twenty yuan — here's eight yuan change. Here you are!" }, goal: 'Say thank you.', tip: 'Say thanks — and maybe goodbye too.',
            replies: [{ say: ['谢谢(，再见)', '谢谢你'], en: 'Thank you.', next: 'bye1' }] },
          n2c: { npc: { hanzi: '没关系，我找钱。你有二十块吗？', english: "No problem, I'll give you change. Do you have twenty yuan?" }, goal: 'Say that you have twenty yuan and hand it over.', tip: '我有 + amount; 给你 = "here you are".',
            replies: [{ say: ['我有二十块，给你', '有，给你二十块(钱)'], en: 'I have twenty yuan — here.', next: 'n2a' }] },
          bye1: { npc: { hanzi: '不客气！欢迎再来！', english: "You're welcome! Welcome back!" }, end: true },
          bye2: { npc: { hanzi: '太好了！谢谢你！我不找钱了。', english: 'Great! Thank you! No change needed.' }, end: true },
        },
      },

      // ───────────────────────── 7. Tea and peanuts (YOU start) ─────────────────────────
      {
        id: 'tea', title: 'Buying tea',
        slots: { tea: [{ hanzi: '绿茶', en: 'green tea' }, { hanzi: '红茶', en: 'black tea' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask whether he has {tea.en}.', tip: '有 + thing + 吗: 你有{tea}吗？',
            replies: [{ say: ['(请问，)你们有{tea}吗', '(请问，)你有{tea}吗', '有{tea}吗'], en: 'Do you have {tea.en}?', next: 'n2' }] },
          n2: { npc: { hanzi: '有！这是新的{tea}。你要多少？', english: 'Yes! This is new {tea.en}. How much do you want?' }, goal: 'Say that you want one jin.', tip: '一斤 = "one jin".',
            replies: [{ say: ['我要一斤', '一斤(吧)', '给我一斤'], en: 'I want one jin.', next: 'n3' }] },
          n3: { npc: { hanzi: '好的，一斤{tea}。价钱有一点贵，可以吗？', english: 'OK, one jin of {tea.en}. The price is a little high — is that all right?' }, goal: 'Say it is fine — or ask for a discount.', tip: '打折 = "give a discount": 可以打折吗？',
            replies: [
              { say: ['可以，我要', '可以，给我一斤'], en: "That's fine, I'll take it.", label: 'Fine', next: 'n4a' },
              { say: ['可以打折吗', '能不能打折'], en: 'Can you give a discount?', label: 'Discount', next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '好的，一斤{tea}。还要花生吗？花生很好吃！', english: 'OK, one jin of {tea.en}. Do you want peanuts too? They are delicious!' }, goal: 'Say that you want a jin of peanuts — or no thanks.', tip: '还要 = "also want"; 不要了 = "no more".',
            replies: [
              { say: ['要，我要一斤花生', '好，我要一斤花生'], en: 'Yes, a jin of peanuts.', label: 'Peanuts', next: 'bye1' },
              { say: ['不要了，谢谢'], en: 'No more, thank you.', label: 'No', next: 'bye2' },
            ] },
          n4b: { npc: { hanzi: '好，给你打折！还要花生吗？', english: "All right, a discount for you! Do you want peanuts too?" }, goal: 'Say that you want a jin of peanuts — or no thanks.', tip: '还要 = "also want".',
            replies: [
              { say: ['要，我要一斤花生', '好，我要一斤花生'], en: 'Yes, a jin of peanuts.', label: 'Peanuts', next: 'bye3' },
              { say: ['不要了，谢谢'], en: 'No more, thank you.', label: 'No', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好的！谢谢，欢迎再来！', english: 'Good! Thanks, welcome back!' }, end: true },
          bye2: { npc: { hanzi: '好的，谢谢！再见！', english: 'OK, thanks! Goodbye!' }, end: true },
          bye3: { npc: { hanzi: '花生也打折，再送你一个袋子！谢谢！', english: 'Discount on the peanuts too, and a free bag for you! Thanks!' }, end: true },
        },
      },

      // ───────────────────────── 8. What do you sell? (YOU start) ─────────────────────────
      {
        id: 'sell', title: 'What do you sell?',
        slots: { thing: [{ hanzi: '豆浆', en: 'soy milk' }, { hanzi: '牛奶', en: 'milk' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask the shopkeeper what he sells.', tip: '卖 = "sell" (the opposite of 买 "buy"): 你卖什么？',
            replies: [{ say: ['(老板，)你卖什么', '(老板，)你们卖什么'], en: 'What do you sell?', next: 'n2' }] },
          n2: { npc: { hanzi: '我卖水果、蔬菜、鸡蛋、豆腐，什么都有！', english: 'I sell fruit, vegetables, eggs and tofu — everything!' }, goal: 'Ask whether he also sells {thing.en}.', tip: '你卖{thing}吗？ Or the "sell or not sell" pattern: 卖不卖？',
            replies: [{ say: ['你(也)卖{thing}吗', '你卖不卖{thing}', '你们有{thing}吗'], en: 'Do you sell {thing.en} too?', next: 'n3' }] },
          n3: { npc: { hanzi: '卖！在那边的饮料摊，三块一瓶。', english: 'Yes! At the drinks stall over there: 3 yuan a bottle.' }, goal: 'Say that you want two bottles — or only one.', tip: 'Bottles are counted with 瓶: 两瓶 / 一瓶. 只要 = "only want".',
            replies: [
              { say: ['我要两瓶({thing})', '给我两瓶({thing})'], en: 'I want two bottles.', label: 'Two bottles', next: 'n4a' },
              { say: ['我只要一瓶', '我只想要一瓶'], en: 'I only want one bottle.', label: 'One bottle', next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '两瓶，一共六块。', english: 'Two bottles: six yuan altogether.' }, goal: 'Hand over six yuan.', tip: '给你 + amount.',
            replies: [{ say: ['给你六块(钱)', '给你，六块(钱)'], en: 'Here are six yuan.', next: 'bye1' }] },
          n4b: { npc: { hanzi: '一瓶，三块钱。', english: 'One bottle: three yuan.' }, goal: 'Hand over three yuan.', tip: '给你 + amount.',
            replies: [{ say: ['给你三块(钱)', '给你，三块(钱)'], en: 'Here are three yuan.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '谢谢！欢迎再来！', english: 'Thank you! Welcome back!' }, end: true },
          bye2: { npc: { hanzi: '谢谢！明天再来！', english: 'Thanks! Come again tomorrow!' }, end: true },
        },
      },
    ],
  };
})(window.MSC = window.MSC || {});

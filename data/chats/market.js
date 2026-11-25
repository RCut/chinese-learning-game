/*
 * CHAT — Shopkeeper Zhang (张老板), the grocer in the market. Same format and same engine as data/chat.js (Xiao Li):
 * every visit starts a NEW random conversation about BUYING things. Nothing is multiple choice — you build what you say.
 * Prices in the slots are plain numbers of yuan; the stall boards themselves list item names only.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.chats = MSC.data.chats || {};
  MSC.data.chats.grocer = {
    npc: { id: 'grocer', name: 'Shopkeeper Zhang', hanzi: '张老板', blurb: 'The grocer: practise buying food, prices and bargaining' },
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
      // ════════════════ Level 1 (HSK 1 words only) ════════════════

      // ───────────────────────── 9. Buying apples (YOU start) ─────────────────────────
      {
        id: 'apples', title: 'These or those?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask the shopkeeper whether he has apples.', tip: '有 + thing + 吗: 你有苹果吗？ Or ask whether he sells them: 卖苹果吗？',
            replies: [{ say: ['(老板，)你有苹果吗', '你们有苹果吗', '你卖苹果吗'], en: 'Do you have apples?', next: 'n2' }] },
          n2: { npc: { hanzi: '有！这些苹果很好吃，那些是新的，有点儿贵。你要哪些？', english: 'Yes! These apples are delicious; those are new ones, a bit expensive. Which do you want?' }, goal: 'Choose: these ones or those ones.', tip: '这些 = these; 那些 = those.',
            replies: [
              { say: ['我要这些', '这些(苹果)'], en: 'These ones.', label: 'These', next: 'n3a' },
              { say: ['我要那些', '那些(苹果)'], en: 'Those ones.', label: 'Those', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '好！这些很便宜。你要几个？', english: 'OK! These are cheap. How many do you want?' }, goal: 'Say how many you want: five, six or eight.', tip: '个 counts apples: 我要五个.',
            replies: [{ say: ['我要[五|六|八]个', '[五|六|八]个'], en: 'I want that many.', next: 'n4' }] },
          n3b: { npc: { hanzi: '那些很好，可是有点儿贵。你要几个？', english: 'Those are very good, but a bit expensive. How many do you want?' }, goal: 'Say that you only want two.', tip: '只 = only. Before a measure word, "two" is 两: 两个.',
            replies: [{ say: ['我只要两个', '我要两个'], en: 'Just two.', next: 'n4' }] },
          n4: { npc: { hanzi: '好的。你还要什么？我们还有鸡蛋和牛奶。', english: 'OK. What else would you like? We also have eggs and milk.' }, goal: 'Say that you also want some milk — or that you want nothing else.', tip: '还要 = also want. 一些 = some. 不要了 = no more.',
            replies: [
              { say: ['我还要一些牛奶', '还要(一些)牛奶'], en: 'I also want some milk.', label: 'Milk', next: 'bye1' },
              { say: ['我还要几个鸡蛋', '还要(几个)鸡蛋'], en: 'I also want some eggs.', label: 'Eggs', next: 'bye1' },
              { say: ['不要了，谢谢', '不要了'], en: 'Nothing else, thanks.', label: 'Nothing', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好的，都给你！谢谢，再见！', english: 'OK, here it all is! Thanks, goodbye!' }, end: true },
          bye2: { npc: { hanzi: '好的，谢谢！明天再来！', english: 'OK, thanks! Come again tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 10. Breakfast things (Zhang starts) ─────────────────────────
      {
        id: 'breakfast', title: 'Something for breakfast',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '早上好！你买早饭吗？我们有面包、鸡蛋和牛奶。', english: 'Good morning! Buying breakfast? We have bread, eggs and milk.' }, goal: 'Say what you want: bread, or two eggs.', tip: '要 + number + 个 + food. "Two" is 两 before a measure word.',
            replies: [
              { say: ['我要(一个)面包', '我想买(一个)面包'], en: 'I want some bread.', label: 'Bread', next: 'n2a' },
              { say: ['我要两个鸡蛋', '我想买两个鸡蛋'], en: 'I want two eggs.', label: 'Eggs', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '好的。你也要牛奶吗？', english: 'OK. Do you want milk too?' }, goal: 'Say that you want milk too — or that you do not drink milk.', tip: '也要 = also want. 不喝 = do not drink.',
            replies: [
              { say: ['我也要牛奶', '要，我也要牛奶'], en: 'Yes, milk too.', label: 'Milk too', next: 'n3' },
              { say: ['我不喝牛奶', '不要，我不喝牛奶'], en: "I don't drink milk.", label: 'No milk', next: 'n3' },
            ] },
          n2b: { npc: { hanzi: '两个鸡蛋。你会做饭吗？', english: 'Two eggs. Can you cook?' }, goal: 'Say that you can cook — or that you cannot, your mum cooks.', tip: '会 = can (a skill). 做饭 = cook.',
            replies: [
              { say: ['我会做饭'], en: 'I can cook.', label: 'I can', next: 'n3' },
              { say: ['我不会做饭，我妈妈做', '我不会，我妈妈做饭'], en: "I can't — my mum cooks.", label: "Mum cooks", next: 'n3' },
            ] },
          n3: { npc: { hanzi: '好。一共五块。', english: 'Good. Five yuan altogether.' }, goal: 'Ask whether you can pay with a hundred yuan — or hand over five yuan.', tip: '一百 = a hundred. 可以吗 = is that OK?',
            replies: [
              { say: ['我只有一百块，可以吗', '一百块可以吗'], en: 'I only have a hundred — is that OK?', label: 'A hundred', next: 'bye1' },
              { say: ['给你五块(钱)', '给你，五块'], en: 'Here are five yuan.', label: 'Five yuan', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '可以，我找你九十五块。给你！', english: "Sure, here's ninety-five yuan change. Here you are!" }, end: true },
          bye2: { npc: { hanzi: '谢谢！早饭很好吃，明天再来！', english: 'Thanks! Enjoy your breakfast — come again tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 11. Cooking dinner (Zhang starts) ─────────────────────────
      {
        id: 'dinner', title: 'What is for dinner?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！今天晚上你做饭吗？', english: 'Hello! Are you cooking this evening?' }, goal: 'Say that you will cook — or that you will eat at a restaurant.', tip: '做饭 = cook. 去饭店吃 = eat at a restaurant.',
            replies: [
              { say: ['对，我要做饭', '我想做饭', '我做晚饭'], en: "Yes, I'm cooking.", label: 'Cooking', next: 'n2a' },
              { say: ['不做，我去饭店吃', '我去饭店吃(晚饭)'], en: "No, I'm eating at a restaurant.", label: 'Restaurant', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '我们有很多菜，也有米饭。你要买什么？', english: 'We have lots of vegetables, and rice too. What do you want to buy?' }, goal: 'Say that you want some vegetables and rice.', tip: '一些 = some. 和 = and.',
            replies: [{ say: ['我要一些菜和米饭', '我要买些菜', '一些菜和米饭'], en: 'Some vegetables and rice, please.', next: 'n3' }] },
          n2b: { npc: { hanzi: '饭店的菜很贵！你买一些水果吧？', english: 'Restaurant food is expensive! Why not buy some fruit?' }, goal: 'Say OK, you want a few apples — or no thanks.', tip: '几个 = a few. 不要 = no.',
            replies: [
              { say: ['好，我要几个苹果', '我要几个苹果'], en: "OK, I'll take a few apples.", label: 'Apples', next: 'n3' },
              { say: ['不要，谢谢'], en: 'No, thank you.', label: 'No thanks', next: 'bye2' },
            ] },
          n3: { npc: { hanzi: '好的，都是二十元。', english: 'OK, that is twenty yuan in all.' }, goal: 'Hand over a hundred yuan — or say it is too expensive.', tip: '元 is the written word for 块. 太…了 = too …',
            replies: [
              { say: ['给你一百块', '给你一百块钱'], en: 'Here is a hundred yuan.', label: 'Pay', next: 'n4a' },
              { say: ['太贵了', '有点儿贵', '便宜一点儿吧'], en: "That's too expensive.", label: 'Too expensive', next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '一百块，找你八十块。给你！', english: "A hundred — here's eighty change. Here you are!" }, goal: 'Say thank you and goodbye.', tip: 'Thank you, then 再见.',
            replies: [{ say: ['谢谢，再见', '谢谢你，再见'], en: 'Thanks, goodbye.', next: 'bye1' }] },
          n4b: { npc: { hanzi: '不贵！那十五元，好吗？', english: "It's not expensive! Fifteen yuan then, OK?" }, goal: 'Say OK and hand it over.', tip: '好 = OK. 给你 = here you are.',
            replies: [{ say: ['好，给你', '好的，给你'], en: 'OK, here you are.', next: 'bye1' }] },
          bye1: { npc: { hanzi: '谢谢！晚饭做好吃一点儿！', english: 'Thanks! Make a tasty dinner!' }, end: true },
          bye2: { npc: { hanzi: '好的，再见！', english: 'OK, goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 12. Shopping for someone (YOU start) ─────────────────────────
      {
        id: 'forwhom', title: 'Who is it for?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask whether he sells noodles.', tip: '卖 = sell: 你卖面条儿吗？',
            replies: [{ say: ['(老板，)你卖面条儿吗', '你们卖面条儿吗', '有面条儿吗'], en: 'Do you sell noodles?', next: 'n2' }] },
          n2: { npc: { hanzi: '卖！你给谁买？', english: 'Yes! Who are you buying them for?' }, goal: 'Say that you are buying them for your mum — or for your friends.', tip: '给 + person + 买 = "buy for someone".',
            replies: [
              { say: ['给我妈妈买', '我给(我)妈妈买'], en: "For my mum.", label: 'Mum', next: 'n3a' },
              { say: ['给我的朋友们买', '我给朋友们买', '给朋友买'], en: 'For my friends.', label: 'Friends', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '你妈妈也爱吃面条儿吗？', english: 'Does your mum love noodles too?' }, goal: 'Say that she loves them.', tip: '她 = she. 爱吃 = love eating.',
            replies: [{ say: ['她很爱吃', '她非常爱吃(面条儿)', '她很喜欢'], en: 'She loves them.', next: 'n4' }] },
          n3b: { npc: { hanzi: '你有几个朋友？', english: 'How many friends are there?' }, goal: 'Say that there are four of you — or many.', tip: '四个 = four (people). 很多 = many.',
            replies: [
              { say: ['我们有四个人', '四个(人)'], en: 'There are four of us.', label: 'Four', next: 'n4' },
              { say: ['很多', '我有很多朋友'], en: 'Lots.', label: 'Lots', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '好的，这些面条儿给你。十块钱。', english: 'OK, here are the noodles. Ten yuan.' }, goal: 'Hand over the money and say thank you.', tip: '给你 + amount, then 谢谢.',
            replies: [{ say: ['给你十块(钱)，谢谢', '谢谢，给你十块(钱)'], en: 'Here is ten yuan, thanks.', next: 'bye' }] },
          bye: { npc: { hanzi: '谢谢你！吃面条儿吧！', english: 'Thank you! Enjoy the noodles!' }, end: true },
        },
      },

      // ───────────────────────── 13. Fresh eggs (Zhang starts) ─────────────────────────
      {
        id: 'eggs', title: 'New eggs today',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！今天的鸡蛋都是新的。你要多少？', english: 'Hello! The eggs are all new today. How many do you want?' }, goal: 'Say that you want ten eggs — or that ten is too few and you want twenty.', tip: '个 counts eggs. 太少了 = too few.',
            replies: [
              { say: ['我要十个(鸡蛋)', '十个'], en: 'Ten, please.', label: 'Ten', next: 'n2' },
              { say: ['十个太少了，我要二十个', '我要二十个(鸡蛋)'], en: 'Ten is too few — twenty, please.', label: 'Twenty', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '好的。你还要些什么？这个大面包很好吃，你可以买一半。', english: 'OK. Anything else? This big loaf is delicious — you can buy half.' }, goal: 'Say that you will take half — or nothing else.', tip: '一半 = half. 不要了 = no more.',
            replies: [
              { say: ['好，我要一半', '我要一半(面包)'], en: "OK, I'll take half.", label: 'Half', next: 'n3' },
              { say: ['不要了，谢谢', '不要了'], en: 'Nothing else, thanks.', label: 'Nothing', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '好，都是二十元。', english: 'OK, twenty yuan in all.' }, goal: 'Hand over a hundred yuan — or the exact twenty.', tip: '元 = 块 (the written word). 给你 + amount.',
            replies: [
              { say: ['给你一百元', '给你一百块(钱)'], en: 'Here is a hundred yuan.', label: 'A hundred', next: 'bye1' },
              { say: ['给你，二十元', '给你二十元'], en: 'Here is twenty yuan.', label: 'Exact', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '一百元，找你八十。谢谢，再见！', english: 'A hundred — eighty change. Thanks, bye!' }, end: true },
          bye2: { npc: { hanzi: '谢谢！鸡蛋很新，明天再来！', english: 'Thanks! The eggs are fresh — come again tomorrow!' }, end: true },
        },
      },

      // ════════════════ Level 2 starter (HSK 2 words) ════════════════

      // ───────────────────────── 14. A birthday present (YOU start) ─────────────────────────
      {
        id: 'birthday', title: 'A birthday present',
        start: 'n1',
        nodes: {
          n1: { goal: 'Tell the shopkeeper that tomorrow is your mum’s birthday and you want to buy some fruit.', tip: '生日 = birthday. 想 + 买 + thing.',
            replies: [{ say: ['明天是我妈妈的生日，我想买一些水果', '我想给妈妈买一些水果'], en: "Tomorrow is my mum's birthday; I want to buy some fruit.", next: 'n2' }] },
          n2: { npc: { hanzi: '送水果很好！你妈妈最喜欢吃什么？', english: 'Fruit is a lovely present! What does your mum like best?' }, goal: 'Say that she likes apples best — or watermelon.', tip: '最 = most: 她最喜欢…',
            replies: [
              { say: ['她最喜欢吃苹果', '她最喜欢苹果'], en: 'She likes apples best.', label: 'Apples', next: 'n3a' },
              { say: ['她最喜欢吃西瓜', '她最喜欢西瓜'], en: 'She likes watermelon best.', label: 'Watermelon', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '这些红色的苹果很甜。你要几个？', english: 'These red apples are very sweet. How many do you want?' }, goal: 'Say that you want six.', tip: '个 counts apples.',
            replies: [{ say: ['我要六个', '六个'], en: 'Six, please.', next: 'n4' }] },
          n3b: { npc: { hanzi: '这个西瓜很大，也很甜！', english: 'This watermelon is big, and very sweet!' }, goal: 'Say that you will take it.', tip: '就 = "then (that settles it)": 就要这个.',
            replies: [{ say: ['我就要这个', '好，我要这个'], en: "I'll take this one.", next: 'n4' }] },
          n4: { npc: { hanzi: '东西很多！我帮你拿吧？', english: "That's a lot to carry! Shall I help you?" }, goal: 'Say thank you, he is very kind — or that it is fine, you can carry it yourself.', tip: '帮 = help. 自己 = yourself: 我自己拿.',
            replies: [
              { say: ['谢谢，你真好'], en: "Thank you, that's very kind.", label: 'Yes please', next: 'bye1' },
              { say: ['没关系，我自己拿', '我自己拿'], en: "It's fine, I'll carry it myself.", label: 'Myself', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '不客气！你妈妈生日快乐！', english: "You're welcome! Happy birthday to your mum!" }, end: true },
          bye2: { npc: { hanzi: '好的！你妈妈生日快乐！欢迎再来！', english: 'OK! Happy birthday to your mum! Come again!' }, end: true },
        },
      },

      // ═══════════════════════ HSK 2 conversations ═══════════════════════
      // ───────────────────────── Milk tea (奶茶, 红茶, 绿茶, 还是) ─────────────────────────
      {
        id: 'milktea', title: 'Milk tea or tea?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '欢迎！今天有奶茶，也有红茶和绿茶。你要哪个？', english: 'Welcome! Today we have milk tea, and also black tea and green tea. Which one?' }, goal: 'Say which you want: milk tea, black tea or green tea.', tip: '奶茶 = milk tea (lit. "milk-tea"); 红茶 = red tea = black tea; 绿茶 = green tea. 我要…',
            replies: [
              { say: ['我要奶茶', '奶茶，谢谢', '给我奶茶'], en: 'I want milk tea.', label: 'Milk tea', next: 'n2a' },
              { say: ['我要红茶', '红茶，谢谢', '给我红茶'], en: 'I want black tea.', label: 'Black tea', next: 'n2b' },
              { say: ['我要绿茶', '绿茶，谢谢', '给我绿茶'], en: 'I want green tea.', label: 'Green tea', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '好的，奶茶一杯。你要大杯还是小杯？', english: 'OK, one milk tea. Large or small?' }, goal: 'Say whether you want a large cup or a small one.', tip: '大杯 = large cup (杯 is the measure word); 小杯 = small.',
            replies: [{ say: ['我要大杯', '大杯', '大杯，谢谢'], en: 'A large one.', label: 'Large', next: 'n3' }, { say: ['我要小杯', '小杯', '小杯，谢谢'], en: 'A small one.', label: 'Small', next: 'n3' }] },
          n2b: { npc: { hanzi: '好的，一杯。你要热的还是冷的？', english: 'OK, one cup. Hot or cold?' }, goal: 'Say that you want it hot — or cold.', tip: '热的 = a hot one; 冷的 = a cold one.',
            replies: [{ say: ['我要热的', '热的', '热的，谢谢'], en: 'A hot one.', label: 'Hot', next: 'n3' }, { say: ['我要冷的', '冷的', '冷的，谢谢'], en: 'A cold one.', label: 'Cold', next: 'n3' }] },
          n3: { npc: { hanzi: '好了，给你。八块。', english: 'Here you are. Eight yuan.' }, goal: 'Say thank you and that it looks good.', tip: '不错 = not bad / good.',
            replies: [{ say: ['谢谢，不错', '谢谢，这个不错', '谢谢'], en: 'Thanks, that looks good.', next: 'bye' }] },
          bye: { npc: { hanzi: '不客气！欢迎再来！', english: "You're welcome! Come again!" }, end: true },
        },
      },

      // ───────────────────────── Left behind (包, 忘, 里面, 手机) ─────────────────────────
      {
        id: 'leftbag', title: 'You forgot your bag',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你的包忘在这儿了！', english: 'Hello! You left your bag here!' }, goal: 'Thank him, and say that you forgot it.', tip: '忘 = forget: 我忘了. 忘在这儿 = forgot it here.',
            replies: [{ say: ['谢谢！我忘了', '谢谢，我忘在这儿了', '啊，我的包！谢谢'], en: 'Thanks! I forgot it.', next: 'n2' }] },
          n2: { npc: { hanzi: '你看看，里面的东西都在吗？', english: 'Have a look — are all the things inside still there?' }, goal: 'Say that your phone is inside — and everything is fine.', tip: '里面 = inside; 手机 = phone; 都 = all.',
            replies: [
              { say: ['我的手机在里面', '都在，谢谢', '我拿出手机看看'], en: 'My phone is inside, and everything is there.', label: 'All there', next: 'bye1' },
              { say: ['我的钱不在里面'], en: 'My money is not inside.', label: 'No money', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！下次别忘了。', english: "Great! Don't forget it next time." }, end: true },
          bye2: { npc: { hanzi: '你再看看！', english: "Look again!" }, end: true },
        },
      },

      // ───────────────────────── Tickets (票, 门票, 周, 跟) ─────────────────────────
      {
        id: 'tickets', title: 'Two free tickets',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我有两张门票，这周我没时间去。你要吗？', english: "I have two entrance tickets, but I have no time to go this week. Do you want them?" }, goal: 'Say that you do — and thank him.', tip: '要 = want; 门票 = entrance ticket; 太好了 / 谢谢.',
            replies: [
              { say: ['我要，谢谢', '要，太好了', '这周我有时间', '我要门票，谢谢你的票'], en: 'Yes please, thank you.', label: 'Yes', next: 'n2' },
              { say: ['不要，谢谢', '我不要，谢谢'], en: 'No thanks.', label: 'No thanks', next: 'bye2' },
            ] },
          n2: { npc: { hanzi: '你跟谁去？', english: 'Who will you go with?' }, goal: 'Say that you will go with a friend — or with Mum.', tip: '跟 + person + 去.',
            replies: [{ say: ['我跟朋友去', '我跟朋友一起去', '跟朋友去'], en: "I'll go with a friend.", label: 'A friend', next: 'bye1' }, { say: ['我跟妈妈去', '我跟妈妈一起去', '跟妈妈去'], en: "I'll go with Mum.", label: 'Mum', next: 'bye1' }] },
          bye1: { npc: { hanzi: '好，玩得高兴！', english: 'Good — have fun!' }, end: true },
          bye2: { npc: { hanzi: '好吧，下周我再问问别人。', english: "OK, next week I'll ask someone else." }, end: true },
        },
      },

      // ───────────────────────── Cheaper than that stall (比, 这么, 那么, 便宜) ─────────────────────────
      {
        id: 'cheaper', title: 'Cheaper than the shop',
        slots: { item: [{ hanzi: '苹果', en: 'apples' }, { hanzi: '西瓜', en: 'watermelon' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Say that the {item.en} are so expensive.', tip: '这么 + adjective = "so …": 这么贵！',
            replies: [{ say: ['{item}这么贵', '这么贵', '这{item}这么贵'], en: 'These {item.en} are so expensive!', next: 'n2' }] },
          n2: { npc: { hanzi: '不贵不贵！我的{item}比商店的便宜多了。', english: "Not expensive at all! My {item.en} are much cheaper than the shop's." }, goal: 'Say that the shop is not so cheap — or ask if he can go lower.', tip: '没有 A 那么 …: 商店没有这里那么便宜. 便宜一点 = a bit cheaper.',
            replies: [
              { say: ['商店没有这里那么便宜', '商店没有你这里便宜', '商店没有这里便宜'], en: "The shop isn't as cheap as here.", label: 'Agree', next: 'n3a' },
              { say: ['可以便宜一点吗', '便宜一点，可以吗', '能便宜一点吗'], en: 'Can it be a little cheaper?', label: 'Ask lower', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '对！你多买一点吧。', english: 'Right! Buy a bit more.' }, goal: 'Say you will take two jin.', tip: '要两斤 (two = 两).',
            replies: [{ say: ['我要两斤', '好，我要两斤', '两斤'], en: "I'll take two jin.", next: 'bye' }] },
          n3b: { npc: { hanzi: '好吧，那就便宜一块！', english: "OK then, one yuan off!" }, goal: 'Say thank you, he is kind.', tip: '你真好.',
            replies: [{ say: ['谢谢，你真好', '谢谢你，你真好', '你真好'], en: "Thanks, you're kind.", next: 'bye' }] },
          bye: { npc: { hanzi: '欢迎再来！', english: 'Come again!' }, end: true },
        },
      },

      // ───────────────────────── Wrong money (错, 找钱) ─────────────────────────
      {
        id: 'wrongmoney', title: 'Wrong change',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你给了我二十块，找你十二块。给你。', english: 'You gave me twenty yuan, so I give you back twelve. Here.' }, goal: 'Say that there is a mistake — he gave you too little.', tip: '错 = wrong: 你找错钱了. 少 = too few.',
            replies: [
              { say: ['你找错钱了', '找错钱了', '你找错了'], en: 'You gave the wrong change.', label: 'Wrong change', next: 'n2a' },
              { say: ['没错，谢谢', '对，谢谢', '没错'], en: "That's right, thanks.", label: "That's right", next: 'bye2' },
            ] },
          n2a: { npc: { hanzi: '哦，对不起！我错了。我给你十三块。', english: "Oh, sorry! My mistake. I'll give you thirteen." }, goal: 'Say that it is OK.', tip: '没关系.',
            replies: [{ say: ['没关系', '没关系，谢谢'], en: "It's fine.", next: 'bye1' }] },
          bye1: { npc: { hanzi: '谢谢你告诉我！欢迎再来。', english: 'Thank you for telling me! Come again.' }, end: true },
          bye2: { npc: { hanzi: '好，欢迎再来！', english: 'Good, come again!' }, end: true },
        },
      },

      // ───────────────────────── A bad melon (坏, 帮忙, 新鲜) ─────────────────────────
      {
        id: 'badone', title: 'A bad one',
        slots: { fruit: [{ hanzi: '西瓜', en: 'watermelon' }, { hanzi: '梨', en: 'pears' }, { hanzi: '香蕉', en: 'bananas' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Say that you bought the {fruit.en} yesterday and one is bad.', tip: '坏了 = gone bad / broken: 这个坏了. 昨天 = yesterday.',
            replies: [{ say: ['我昨天买的{fruit}坏了', '昨天买的{fruit}坏了', '这个{fruit}坏了'], en: 'The {fruit.en} I bought yesterday has gone bad.', next: 'n2' }] },
          n2: { npc: { hanzi: '对不起！我的{fruit}都很新鲜的。你要我帮忙吗？', english: 'Sorry! My {fruit.en} are all fresh. Do you want me to help?' }, goal: 'Say please help — you would like a new one.', tip: '请帮忙 = please help.',
            replies: [
              { say: ['请帮忙，我要新的', '请你帮忙', '请帮忙'], en: 'Please help — I want a new one.', label: 'Change it', next: 'n3a' },
              { say: ['没关系，谢谢', '没关系'], en: "It's OK, never mind.", label: 'Never mind', next: 'bye2' },
            ] },
          n3a: { npc: { hanzi: '好，给你一个新的！', english: 'OK, here is a fresh one!' }, goal: 'Say thank you.', tip: '谢谢.',
            replies: [{ say: ['谢谢', '谢谢你'], en: 'Thank you.', next: 'bye1' }] },
          bye1: { npc: { hanzi: '不客气！欢迎再来。', english: "You're welcome! Come again." }, end: true },
          bye2: { npc: { hanzi: '谢谢你！下次会好的。', english: 'Thanks! Next time it will be good.' }, end: true },
        },
      },

      // ───────────────────────── Fish and meat (鱼, 肉, 条) ─────────────────────────
      {
        id: 'fishmeat', title: 'A fish and some meat',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '欢迎！今天的鱼很新鲜，肉也不错。你要什么？', english: 'Welcome! The fish is very fresh today and the meat is good too. What would you like?' }, goal: 'Say that you want a fish — or some meat.', tip: '条 counts fish: 一条鱼. 肉 = meat: 我要肉.',
            replies: [
              { say: ['我要一条鱼', '来一条鱼', '一条鱼'], en: 'I want a fish.', label: 'Fish', next: 'n2a' },
              { say: ['我要肉', '来两斤肉', '我要两斤肉'], en: 'I want some meat.', label: 'Meat', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '好的！这条大的，十八块。', english: 'OK! This big one is eighteen yuan.' }, goal: 'Say that is a bit expensive — or that you will take it.', tip: '太贵了 / 好，我要.',
            replies: [
              { say: ['有点贵', '太贵了'], en: "That's a bit expensive.", label: 'Expensive', next: 'bye1' },
              { say: ['好，我要这条', '好，我要'], en: "OK, I'll take it.", label: 'Take it', next: 'bye2' },
            ] },
          n2b: { npc: { hanzi: '好的！两斤肉，三十块。', english: 'OK! Two jin of meat, thirty yuan.' }, goal: 'Say OK, and here is the money.', tip: '给你钱 = here is the money.',
            replies: [{ say: ['好，给你钱', '好的，给你', '好，我拿出钱'], en: 'OK, here you are.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '那给你便宜两块！', english: 'Then two yuan off for you!' }, end: true },
          bye2: { npc: { hanzi: '谢谢！欢迎再来！', english: 'Thank you! Come again!' }, end: true },
        },
      },
    ],
  };
})(window.MSC = window.MSC || {});

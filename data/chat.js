/*
 * CHAT — Xiao Li (小李), a friendly student you can talk to. Every time you walk up to Xiao Li a NEW random
 * conversation starts. There are no multiple-choice buttons: you BUILD what you say (word tiles or typing),
 * so you have to think about what you want to say. Some conversations start with Xiao Li, some with YOU.
 *
 * dialogue   { id, title, slots?, start, nodes }
 *   slots      random fillers picked once per conversation:  { drink: [ { hanzi: '茶', en: 'tea' }, … ] }
 *              use {drink} in Chinese text and {drink.en} in English text
 *   nodes      { nodeId: node }
 *
 * node       one turn.
 *   npc        { hanzi, english } what Xiao Li says. Leave it out when the PLAYER speaks first.
 *   goal       what you are trying to say, in plain English — never in Chinese
 *   tip        shown by the first Hint: the pattern to use (Chinese examples are fine here)
 *   replies    every acceptable answer, each leading somewhere — that is the branching:
 *                say    patterns for the accepted Chinese:   (optional)   [one|other]   {slot}
 *                en     English meaning of the answer (shown after you say it)
 *                label  short English name of this branch (shown by Hint level 2 when there are several)
 *                next   id of the next node
 *   end        true on the last node (Xiao Li's goodbye); it has no replies
 *
 * Punctuation never matters when matching. Pinyin tone numbers/marks are accepted when typing.
 * Run `node tools/check-data.js`: every Chinese word must exist in data/dictionary.js, every `next` must exist,
 * and every conversation must really branch.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.chat = {
    npc: { id: 'friend', name: 'Xiao Li', hanzi: '小李', blurb: 'A friendly student who loves to chat' },
    xpTurn: 8,
    xpFinish: 20,
    lines: {
      notUnderstood: { hanzi: '不好意思，我没听清楚。你可以再说一遍吗？', english: "Sorry, I didn't catch that. Could you say it again?" },
      tonesOff: { hanzi: '我差不多听懂了！但是你的声调有一点不一样。', english: 'I almost understood! But your tones are a little different.' },
    },

    dialogues: [
      // ───────────────────────── 1. Meeting someone (YOU start) ─────────────────────────
      {
        id: 'meet', title: 'Meeting someone new',
        slots: { myname: [{ hanzi: '小王', en: 'Xiao Wang' }, { hanzi: '小林', en: 'Xiao Lin' }], job: [{ hanzi: '老师', en: 'teacher' }, { hanzi: '医生', en: 'doctor' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Say hello to Xiao Li and ask what their name is.', tip: 'Greet first, then ask: 你叫什么名字？ ("you are-called what name").',
            replies: [{ say: ['你好，你叫什么(名字)', '你叫什么(名字)'], en: "Hello, what's your name?", next: 'n2' }] },
          n2: { npc: { hanzi: '你好！我叫小李。你呢？', english: "Hello! I'm called Xiao Li. And you?" }, goal: 'Tell Xiao Li your name: you are {myname.en}.', tip: '我叫 + name. 你呢？ means "and you?"',
            replies: [{ say: ['我叫{myname}', '我是{myname}', '我叫{myname}，你好'], en: 'My name is {myname.en}.', next: 'n3' }] },
          n3: { npc: { hanzi: '很高兴认识你！你是学生吗？', english: 'Nice to meet you! Are you a student?' }, goal: 'Answer honestly: are you a student? Say yes or no.', tip: 'To say yes: 我是…  To say no: 我不是…',
            replies: [
              { say: ['(是，)我是学生', '是的，我是学生'], en: "Yes, I'm a student.", label: 'Yes, a student', next: 'n4a' },
              { say: ['(不，)我不是学生', '不是，我不是学生'], en: "No, I'm not a student.", label: 'No', next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '太好了！你在哪儿学习？', english: 'Great! Where do you study?' }, goal: 'Say that you study at school.', tip: '在 + place + verb: 我在…学习.',
            replies: [{ say: ['我在学校(学习)'], en: 'I study at school.', next: 'n5' }] },
          n4b: { npc: { hanzi: '哦，你做什么工作？', english: 'Oh, what work do you do?' }, goal: 'Say that you are a {job.en}.', tip: 'Jobs work like names: 我是 + job.',
            replies: [{ say: ['我是{job}'], en: "I'm a {job.en}.", next: 'n5' }] },
          n5: { npc: { hanzi: '好的。我们是朋友了！', english: "OK. We're friends now!" }, goal: 'Say goodbye to Xiao Li.', tip: 'Goodbye is made of "again" + "see".',
            replies: [{ say: ['再见(，小李)', '小李，再见'], en: 'Goodbye, Xiao Li.', next: 'bye' }] },
          bye: { npc: { hanzi: '明天再见！', english: 'See you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 2. Family (Xiao Li starts) ─────────────────────────
      {
        id: 'family', title: 'Talking about family',
        slots: { n: [{ hanzi: '三', en: 'three' }, { hanzi: '四', en: 'four' }, { hanzi: '五', en: 'five' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你家有几口人？', english: 'Hello! How many people are in your family?' }, goal: 'Say that there are {n.en} people in your family.', tip: '家 is "home / family"; 口 counts family members: 我家有…口人.',
            replies: [{ say: ['我家有{n}口人'], en: 'There are {n.en} people in my family.', next: 'n2' }] },
          n2: { npc: { hanzi: '{n}口人，真好！你有哥哥姐姐吗？', english: 'Lovely! Do you have older brothers or sisters?' }, goal: 'Tell Xiao Li about your siblings: you have an older brother, an older sister, or neither.', tip: 'Have: 我有…  Not have: 我没有…',
            replies: [
              { say: ['我有(一个)哥哥'], en: 'I have an older brother.', label: 'A brother', next: 'n3a' },
              { say: ['我有(一个)姐姐'], en: 'I have an older sister.', label: 'A sister', next: 'n3b' },
              { say: ['我没有哥哥姐姐', '我没有'], en: "I don't have any.", label: 'Neither', next: 'n3c' },
            ] },
          n3a: { npc: { hanzi: '你哥哥做什么工作？', english: 'What does your brother do?' }, goal: 'Say that he is a doctor.', tip: '他是 + job.',
            replies: [{ say: ['他是医生'], en: 'He is a doctor.', next: 'n4' }] },
          n3b: { npc: { hanzi: '你姐姐几岁？', english: 'How old is your sister?' }, goal: 'Say that she is twenty years old.', tip: 'Age: 她 + number + 岁. Twenty is "two-ten": 二十.',
            replies: [{ say: ['她二十岁'], en: 'She is twenty.', next: 'n4' }] },
          n3c: { npc: { hanzi: '那你有朋友吗？', english: 'Then do you have friends?' }, goal: 'Say that you have a lot of friends.', tip: '"A lot" = 很 + 多: 我有很多…',
            replies: [{ say: ['我有很多朋友'], en: 'I have a lot of friends.', next: 'n4' }] },
          n4: { npc: { hanzi: '真好！你爸爸妈妈好吗？', english: 'Lovely! How are your mum and dad?' }, goal: 'Say that your parents are both very well.', tip: '都 ("all, both") goes before 很.',
            replies: [{ say: ['他们(都)很好', '我爸爸妈妈(都)很好'], en: 'They are both very well.', next: 'bye' }] },
          bye: { npc: { hanzi: '太好了！我们家也很好。再见！', english: 'Wonderful! My family is well too. Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 3. Hobbies (YOU start) ─────────────────────────
      {
        id: 'hobbies', title: 'What do you like to do?',
        slots: { hobby: [{ hanzi: '唱歌', en: 'sing' }, { hanzi: '看电影', en: 'watch films' }, { hanzi: '看电视', en: 'watch TV' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Start a conversation: ask Xiao Li what they like to do.', tip: '喜欢 + verb: 你喜欢做什么？ ("you like do what").',
            replies: [{ say: ['(小李，)你喜欢做什么', '(小李，)你喜欢什么'], en: 'What do you like to do?', next: 'n2' }] },
          n2: { npc: { hanzi: '我喜欢{hobby}。你呢？', english: 'I like to {hobby.en}. And you?' }, goal: "Say that you like it too, or that you don't.", tip: '也 ("also") goes before the verb. 不 makes it negative.',
            replies: [
              { say: ['我也喜欢{hobby}', '我也很爱{hobby}', '我也喜欢'], en: 'I like it too.', label: 'Like it too', next: 'n3a' },
              { say: ['我不喜欢{hobby}', '我不喜欢'], en: "I don't like it.", label: "Don't like it", next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！我们明天去{hobby}吧？', english: "Great! Shall we go and {hobby.en} tomorrow?" }, goal: 'Agree enthusiastically.', tip: '"Great!" is 太 + 好 + 了.',
            replies: [{ say: ['太好了', '好的', '好，太好了'], en: 'Great!', next: 'bye1' }] },
          n3b: { npc: { hanzi: '是吗？那你喜欢做什么？', english: 'Really? Then what do you like to do?' }, goal: 'Say that you like reading — or that you like sleeping.', tip: '看 + 书 is "read (look at books)"; sleep is 睡觉.',
            replies: [
              { say: ['我喜欢看书'], en: 'I like reading.', label: 'Reading', next: 'bye2' },
              { say: ['我喜欢睡觉'], en: 'I like sleeping.', label: 'Sleeping', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好的，明天再见！', english: 'OK, see you tomorrow!' }, end: true },
          bye2: { npc: { hanzi: '是吗？我也喜欢！再见！', english: 'Really? I like it too! Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 4. Weather and plans (Xiao Li starts) ─────────────────────────
      {
        id: 'weather', title: 'Weather and plans',
        slots: { wx: [{ hanzi: '很冷', en: 'cold' }, { hanzi: '很热', en: 'hot' }, { hanzi: '下雨', en: 'rainy' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！今天天气怎么样？', english: 'Hello! What is the weather like today?' }, goal: 'Tell Xiao Li the weather today: it is {wx.en}.', tip: '今天 + weather word: 今天…',
            replies: [{ say: ['今天{wx}', '今天天气{wx}'], en: 'Today is {wx.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '是吗？明天呢？', english: 'Really? And tomorrow?' }, goal: 'Say that tomorrow the weather is nice.', tip: 'Time first: 明天天气…',
            replies: [{ say: ['明天天气很好', '明天很好'], en: 'Tomorrow the weather is nice.', next: 'n3' }] },
          n3: { npc: { hanzi: '太好了！明天你想做什么？', english: 'Great! What would you like to do tomorrow?' }, goal: 'Say what you want to do tomorrow: go to a shop, watch a film, or study at home.', tip: '想 + verb: 我想…',
            replies: [
              { say: ['(明天)我想去商店', '我想去商店'], en: 'I want to go to the shop.', label: 'A shop', next: 'n4a' },
              { say: ['(明天)我想看电影'], en: 'I want to watch a film.', label: 'A film', next: 'n4b' },
              { say: ['(明天)我想在家学习', '我想学习'], en: 'I want to study at home.', label: 'Study', next: 'n4c' },
            ] },
          n4a: { npc: { hanzi: '你想买什么？', english: 'What do you want to buy?' }, goal: 'Say that you want to buy clothes.', tip: '想 + 买 + thing.',
            replies: [{ say: ['我想买衣服'], en: 'I want to buy clothes.', next: 'bye' }] },
          n4b: { npc: { hanzi: '你和谁去？', english: 'Who are you going with?' }, goal: 'Say that you are going with a friend.', tip: '和 + person + verb: 我和…去.',
            replies: [{ say: ['我和(我的)朋友去', '和朋友去'], en: "I'm going with a friend.", next: 'bye' }] },
          n4c: { npc: { hanzi: '你在哪儿学习？', english: 'Where will you study?' }, goal: 'Say that you study at home.', tip: '在 + place.',
            replies: [{ say: ['我在家(学习)', '在家'], en: 'At home.', next: 'bye' }] },
          bye: { npc: { hanzi: '好的！明天再见！', english: 'OK! See you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 5. Food (Xiao Li starts) ─────────────────────────
      {
        id: 'food', title: 'Lunch with a friend',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！我很饿。你饿吗？', english: "Hi! I'm very hungry. Are you hungry?" }, goal: 'Say whether you are hungry too.', tip: '也 = "also / too": 我也…  Negative: 我不…',
            replies: [
              { say: ['我也(很)饿'], en: "I'm hungry too.", label: 'Hungry too', next: 'n2a' },
              { say: ['我不饿'], en: "I'm not hungry.", label: 'Not hungry', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '你想吃什么？米饭还是面条？', english: 'What would you like to eat? Rice or noodles?' }, goal: 'Say what you would like to eat.', tip: '想 + 吃 + food.',
            replies: [
              { say: ['我[想|要]吃面条'], en: 'I would like noodles.', label: 'Noodles', next: 'n3' },
              { say: ['我[想|要]吃米饭'], en: 'I would like rice.', label: 'Rice', next: 'n3' },
            ] },
          n2b: { npc: { hanzi: '那你想喝什么？茶还是咖啡？', english: 'Then what would you like to drink? Tea or coffee?' }, goal: 'Say what you would like to drink.', tip: '想 + 喝 + drink.',
            replies: [
              { say: ['我[想|要]喝茶'], en: 'I would like tea.', label: 'Tea', next: 'n3' },
              { say: ['我[想|要]喝咖啡'], en: 'I would like coffee.', label: 'Coffee', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '好的！我们一起去饭店吧。', english: "OK! Let's go to a restaurant together." }, goal: 'Ask whether the restaurant is far.', tip: 'Adjective + 吗: …远吗？ Or the "far or not far" pattern: 远不远？',
            replies: [{ say: ['(饭店)远吗', '(饭店)远不远'], en: 'Is the restaurant far?', next: 'n4' }] },
          n4: { npc: { hanzi: '不远，在前面。', english: "Not far — it's straight ahead." }, goal: 'Say thank you.', tip: 'Two words, one repeated.',
            replies: [{ say: ['谢谢(你)', '谢谢，小李'], en: 'Thank you.', next: 'bye' }] },
          bye: { npc: { hanzi: '不客气！', english: "You're welcome!" }, end: true },
        },
      },

      // ───────────────────────── 6. What time is it? (YOU start) ─────────────────────────
      {
        id: 'time', title: 'What time is it?',
        slots: { t: [{ hanzi: '三', en: 'three' }, { hanzi: '四', en: 'four' }, { hanzi: '五', en: 'five' }, { hanzi: '九', en: 'nine' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li what time it is.', tip: '几点 means "what time": 现在几点？',
            replies: [{ say: ['(请问，)现在几点(了)'], en: 'What time is it now?', next: 'n2' }] },
          n2: { npc: { hanzi: '现在{t}点。你有时间吗？', english: "It's {t.en} o'clock. Do you have time?" }, goal: 'Say whether you have time now — or that you are busy.', tip: '有 = have; 忙 = busy.',
            replies: [
              { say: ['我有时间', '我有时间，怎么了'], en: 'I have time.', label: 'Have time', next: 'n3a' },
              { say: ['我很忙', '我很忙，没有时间'], en: "I'm busy.", label: 'Busy', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！我们一起喝茶吧。', english: "Great! Let's have tea together." }, goal: 'Agree, and ask where you should go.', tip: 'Place question word: 去哪儿？',
            replies: [{ say: ['好(的)，我们去哪[儿|里]', '好(的)，去哪[儿|里]'], en: 'OK, where shall we go?', next: 'n4' }] },
          n3b: { npc: { hanzi: '没关系。你明天有时间吗？', english: "No problem. Do you have time tomorrow?" }, goal: 'Say that you have time tomorrow.', tip: 'Time word first: 明天…',
            replies: [{ say: ['明天(我)有时间'], en: 'I have time tomorrow.', next: 'bye2' }] },
          n4: { npc: { hanzi: '我们去咖啡店吧。', english: "Let's go to the café." }, goal: 'Say OK.', tip: 'A short, friendly agreement.',
            replies: [{ say: ['好(的)', '好的，谢谢'], en: 'OK.', next: 'bye1' }] },
          bye1: { npc: { hanzi: '好！走吧！', english: "Good! Let's go!" }, end: true },
          bye2: { npc: { hanzi: '太好了！明天下午三点，再见！', english: 'Great! Tomorrow at three in the afternoon. Bye!' }, end: true },
        },
      },

      // ───────────────────────── 7. Shopping together (Xiao Li starts) ─────────────────────────
      {
        id: 'shopping', title: 'Shopping for clothes',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看，这件衣服怎么样？', english: 'Look — what do you think of this piece of clothing?' }, goal: 'Say that it is pretty — or that it is not.', tip: 'Adjective with 很: 很漂亮. Negative: 不漂亮.',
            replies: [
              { say: ['(这件衣服)很漂亮', '漂亮'], en: "It's very pretty.", label: 'Pretty', next: 'n2a' },
              { say: ['(这件衣服)不(太)漂亮'], en: "It's not pretty.", label: 'Not pretty', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '是吗？但是有点贵。', english: 'Really? But it is a bit expensive.' }, goal: 'Ask how much it costs.', tip: 'The price question you already know: 多少钱？',
            replies: [{ say: ['这件(衣服)多少钱', '多少钱'], en: 'How much is this one?', next: 'n3' }] },
          n2b: { npc: { hanzi: '那这件呢？这件很便宜。', english: 'What about this one? This one is cheap.' }, goal: 'Say that you will buy this one.', tip: '买 = buy: 我买 / 我想买 / 我要…',
            replies: [{ say: ['我[想|要]买这件', '我买这件'], en: "I'll buy this one.", next: 'bye2' }] },
          n3: { npc: { hanzi: '八十块。', english: 'Eighty yuan.' }, goal: 'Say that it is too expensive.', tip: '太 + adjective + 了.',
            replies: [{ say: ['(这)太贵了'], en: "That's too expensive.", next: 'n5' }] },
          n5: { npc: { hanzi: '那我们看看别的吧。', english: "Then let's look at something else." }, goal: 'Say OK.', tip: 'A short, friendly agreement.',
            replies: [{ say: ['好(的)', '好的，谢谢'], en: 'OK.', next: 'bye1' }] },
          bye1: { npc: { hanzi: '你看，这件很便宜！', english: 'Look, this one is cheap!' }, end: true },
          bye2: { npc: { hanzi: '好的！三十块，太便宜了！', english: "Good! Thirty yuan — so cheap!" }, end: true },
        },
      },

      // ───────────────────────── 8. Asking the way (YOU start) ─────────────────────────
      {
        id: 'directions', title: 'Asking the way',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li where the train station is.', tip: 'Put the place first: …在哪儿？ and start politely with 请问.',
            replies: [{ say: ['(请问，)火车站在[哪儿|哪里]'], en: 'Excuse me, where is the train station?', next: 'n2' }] },
          n2: { npc: { hanzi: '火车站在前面，路很大。', english: 'The train station is straight ahead; the road is wide.' }, goal: 'Ask Xiao Li whether it is far — or whether you should take a taxi.', tip: 'Far: …远吗？  Taxi: 要坐出租车吗？',
            replies: [
              { say: ['(火车站)远吗', '(火车站)远不远'], en: 'Is it far?', label: 'Is it far?', next: 'n3b' },
              { say: ['(我)要坐出租车吗', '坐出租车吗'], en: 'Should I take a taxi?', label: 'A taxi?', next: 'n3a' },
            ] },
          n3a: { npc: { hanzi: '不要，很近，你走去吧。', english: "No — it's very near. Walk there." }, goal: 'Say thank you.', tip: 'Two words, one repeated.',
            replies: [{ say: ['谢谢(你)', '谢谢，再见'], en: 'Thank you.', next: 'bye' }] },
          n3b: { npc: { hanzi: '不远，走十分钟。', english: "Not far — a ten-minute walk." }, goal: 'Say thank you.', tip: 'Two words, one repeated.',
            replies: [{ say: ['谢谢(你)', '谢谢，再见'], en: 'Thank you.', next: 'bye' }] },
          bye: { npc: { hanzi: '不客气！再见！', english: "You're welcome! Goodbye!" }, end: true },
        },
      },

      // ───────────────────────── 9. How are you feeling? (Xiao Li starts) ─────────────────────────
      {
        id: 'feelings', title: 'You look tired',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你怎么了？你很累吗？', english: "What's wrong? Are you very tired?" }, goal: 'Say that you are tired — or that you are fine.', tip: '累 = tired; 好 = fine. Add 很 before an adjective.',
            replies: [
              { say: ['我(很)累'], en: "I'm tired.", label: 'Tired', next: 'n2a' },
              { say: ['我不累', '我很好', '我很好，谢谢'], en: "I'm fine.", label: 'Fine', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '你要休息一下。你今天几点睡觉？', english: 'You need a rest. What time do you go to bed today?' }, goal: 'Say that you go to bed at ten tonight.', tip: 'Time before the verb: 晚上十点睡觉.',
            replies: [{ say: ['我(今天)晚上十点睡觉', '今天晚上十点睡觉'], en: 'I go to bed at ten tonight.', next: 'bye1' }] },
          n2b: { npc: { hanzi: '太好了！我们一起玩吧！', english: "Great! Let's play together!" }, goal: 'Say OK.', tip: 'A short, friendly agreement.',
            replies: [{ say: ['好(的)', '好的，太好了'], en: 'OK!', next: 'bye2' }] },
          bye1: { npc: { hanzi: '好，晚上好好休息。明天再见！', english: 'OK, rest well tonight. See you tomorrow!' }, end: true },
          bye2: { npc: { hanzi: '太好了，走吧！', english: "Great, let's go!" }, end: true },
        },
      },

      // ───────────────────────── 10. A phone call (Xiao Li starts) ─────────────────────────
      {
        id: 'phone', title: 'A phone call',
        slots: { act: [{ hanzi: '看电视', en: 'watching TV' }, { hanzi: '学习', en: 'studying' }, { hanzi: '休息', en: 'resting' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '喂，你好！你在做什么？', english: 'Hello! What are you doing?' }, goal: 'Say that you are {act.en} right now.', tip: '在 + verb means "is doing": 我在…',
            replies: [{ say: ['我在{act}'], en: "I'm {act.en}.", next: 'n2' }] },
          n2: { npc: { hanzi: '是吗？你现在在哪儿？', english: 'Oh? Where are you now?' }, goal: 'Say where you are: at home or at school.', tip: '在 + place.',
            replies: [
              { say: ['我在家'], en: "I'm at home.", label: 'At home', next: 'n3a' },
              { say: ['我在学校'], en: "I'm at school.", label: 'At school', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '你来我家玩吧？', english: 'Why not come over to my place to play?' }, goal: 'Say yes, you would like to go — or say sorry, you are busy.', tip: 'Yes: 我想去.  Sorry: 对不起 …',
            replies: [
              { say: ['好的，我想去', '我想去'], en: "Yes, I'd like to go.", label: 'Go', next: 'bye1' },
              { say: ['对不起，我很忙'], en: "Sorry, I'm busy.", label: 'Busy', next: 'bye3' },
            ] },
          n3b: { npc: { hanzi: '你下午忙吗？', english: 'Are you busy this afternoon?' }, goal: 'Say that you are not busy this afternoon.', tip: '不 + adjective: 不忙.',
            replies: [{ say: ['(我)下午不忙', '我不忙'], en: "I'm not busy this afternoon.", next: 'bye2' }] },
          bye1: { npc: { hanzi: '太好了！你来吧！我在家。', english: "Great! Come over! I'm at home." }, end: true },
          bye2: { npc: { hanzi: '太好了！下午三点，再见！', english: 'Great! Three this afternoon, bye!' }, end: true },
          bye3: { npc: { hanzi: '没关系，再见！', english: 'No problem, bye!' }, end: true },
        },
      },

      // ───────────────────────── 11. Where do you live? (Xiao Li starts) ─────────────────────────
      {
        id: 'live', title: 'Where do you live?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你住在哪儿？', english: 'Hi! Where do you live?' }, goal: 'Say that you live in Beijing.', tip: '住 (live) + 在 + place.',
            replies: [{ say: ['我住(在)北京'], en: 'I live in Beijing.', next: 'n2' }] },
          n2: { npc: { hanzi: '北京很大，也很漂亮。你的家在哪儿？', english: 'Beijing is big, and pretty too. Where is your home?' }, goal: 'Say where your home is: next to the school, or next to a shop.', tip: 'Place + 旁边 = "beside": 学校旁边.',
            replies: [
              { say: ['我家在学校旁边', '我的家在学校旁边'], en: 'My home is next to the school.', label: 'By the school', next: 'n3a' },
              { say: ['我家在商店旁边', '我的家在商店旁边'], en: 'My home is next to a shop.', label: 'By a shop', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '真的？我也住在学校旁边！我们是朋友吧？', english: "Really? I live next to the school too! We're friends, right?" }, goal: 'Say that yes, you are friends.', tip: '我们是…',
            replies: [{ say: ['是(的)，我们是朋友', '对，我们是朋友', '我们是朋友'], en: 'Yes, we are friends.', next: 'bye' }] },
          n3b: { npc: { hanzi: '真的？商店旁边很好！我们是朋友吧？', english: "Really? Next to a shop is great! We're friends, right?" }, goal: 'Say that yes, you are friends.', tip: '我们是…',
            replies: [{ say: ['是(的)，我们是朋友', '对，我们是朋友', '我们是朋友'], en: 'Yes, we are friends.', next: 'bye' }] },
          bye: { npc: { hanzi: '太好了！明天再见！', english: 'Wonderful! See you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 12. A normal day (YOU start) ─────────────────────────
      {
        id: 'routine', title: 'A normal day',
        start: 'n1',
        nodes: {
          n1: { goal: 'Start a conversation: ask Xiao Li what time they get up in the morning.', tip: '几点 = what time; 起床 = get up.',
            replies: [{ say: ['(小李，)你(早上)几点起床'], en: 'What time do you get up?', next: 'n2' }] },
          n2: { npc: { hanzi: '我早上六点起床。你呢？', english: 'I get up at six in the morning. And you?' }, goal: 'Say that you get up at seven.', tip: 'Time before the verb: 我早上…点起床.',
            replies: [{ say: ['我(早上)七点起床'], en: 'I get up at seven.', next: 'n3' }] },
          n3: { npc: { hanzi: '你早饭吃什么？', english: 'What do you have for breakfast?' }, goal: 'Say what you eat for breakfast: eggs or noodles.', tip: '我吃 + food. Breakfast is 早饭 ("early meal").',
            replies: [
              { say: ['我(早饭)吃鸡蛋', '我早上吃鸡蛋'], en: 'I eat eggs.', label: 'Eggs', next: 'bye' },
              { say: ['我(早饭)吃面条(儿)', '我早上吃面条(儿)'], en: 'I eat noodles.', label: 'Noodles', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '是吗？我也很喜欢吃早饭。明天再见！', english: 'Really? I love breakfast too. See you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 13. Ordering at a café (Xiao Li starts) ─────────────────────────
      {
        id: 'cafe', title: 'Ordering a drink',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你想喝什么？这里有水、茶和牛奶。', english: 'What would you like to drink? There is water, tea and milk here.' }, goal: 'Say what you would like — and say "please".', tip: '请 (please) + 给我 (give me) + 一杯 (one cup) + drink.',
            replies: [
              { say: ['请给我一杯水', '我要一杯水'], en: 'A glass of water, please.', label: 'Water', next: 'n2' },
              { say: ['请给我一杯茶', '我要一杯茶'], en: 'A cup of tea, please.', label: 'Tea', next: 'n2' },
              { say: ['请给我一杯牛奶', '我要一杯牛奶'], en: 'A glass of milk, please.', label: 'Milk', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '好的！你要多少？', english: 'OK! How many do you want?' }, goal: 'Say that you want two.', tip: 'Before a measure word, "two" is 两 (not 二): 两杯.',
            replies: [{ say: ['我要两杯', '两杯'], en: 'Two, please.', next: 'n3' }] },
          n3: { npc: { hanzi: '这里的菜很好吃！你还想吃水果吗？', english: 'The food here is delicious! Would you like some fruit as well?' }, goal: 'Say that you want two apples or two watermelons — or say no thanks.', tip: '两个 + fruit. To decline politely: 不要，谢谢。',
            replies: [
              { say: ['我要两个苹果'], en: 'I want two apples.', label: 'Apples', next: 'n4' },
              { say: ['我要两个西瓜'], en: 'I want two watermelons.', label: 'Watermelons', next: 'n4' },
              { say: ['不要，谢谢'], en: 'No, thank you.', label: 'No thanks', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '好的。一共二十块。你的钱够吗？', english: 'OK. Twenty yuan altogether. Do you have enough money?' }, goal: 'Say that you have enough money — or that you do not.', tip: '够 = enough. Negative: 不够.',
            replies: [
              { say: ['我的钱够', '我的钱够了', '够了'], en: 'I have enough.', label: 'Enough', next: 'bye1' },
              { say: ['我的钱不够', '不够'], en: "I don't have enough.", label: 'Not enough', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！给你！', english: 'Great! Here you are!' }, end: true },
          bye2: { npc: { hanzi: '没关系！我有钱。', english: "No problem! I have money." }, end: true },
        },
      },

      // ───────────────────────── 14. Can you come? (Xiao Li starts) ─────────────────────────
      {
        id: 'invite', title: 'Can you come tomorrow?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你明天能来吗？', english: 'Can you come tomorrow?' }, goal: 'Say that you can come — or that you cannot.', tip: '能 + verb = "can". Negative: 不能.',
            replies: [
              { say: ['我能来', '能，我能来'], en: 'I can come.', label: 'I can', next: 'n2a' },
              { say: ['我不能来'], en: "I can't come.", label: "I can't", next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '太好了！你会唱歌吗？', english: 'Great! Can you sing?' }, goal: 'Say that you can sing — or that you cannot.', tip: '会 = know how to (a skill).',
            replies: [
              { say: ['我会唱歌'], en: 'I can sing.', label: 'I can sing', next: 'bye1' },
              { say: ['我不会唱歌', '我不会'], en: "I can't sing.", label: "I can't", next: 'bye1' },
            ] },
          n2b: { npc: { hanzi: '为什么？你要工作吗？', english: 'Why? Do you have to work?' }, goal: 'Explain that you cannot come because you are busy.', tip: '因为 … ，所以 … = "because … , so …". Or just give the reason.',
            replies: [{ say: ['因为我很忙', '因为我很忙，所以不能来', '我要工作', '因为我要工作'], en: "Because I'm busy.", next: 'bye2' }] },
          bye1: { npc: { hanzi: '好！明天再见！', english: 'Good! Bye, until tomorrow!' }, end: true },
          bye2: { npc: { hanzi: '没关系，我知道了。再见！', english: "No problem, I understand. Goodbye!" }, end: true },
        },
      },

      // ───────────────────────── 15. May I ask a question? (YOU start) ─────────────────────────
      {
        id: 'ask', title: 'May I ask you something?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Start a conversation: politely ask Xiao Li whether you may ask a question.', tip: '可以 = may; 问 = ask: 我可以问你一个问题吗？',
            replies: [{ say: ['我可以问你(一个)问题吗', '可以问你(一个)问题吗'], en: 'May I ask you a question?', next: 'n2' }] },
          n2: { npc: { hanzi: '可以！你想问什么？', english: 'Of course! What would you like to ask?' }, goal: 'Ask whether Xiao Li knows where the train station is.', tip: '知道 = know (a fact): 你知道…吗？',
            replies: [{ say: ['你知道火车站在[哪儿|哪里]吗'], en: 'Do you know where the train station is?', next: 'n3' }] },
          n3: { npc: { hanzi: '知道！我可以教你。你现在有时间吗？', english: 'I do! I can show you. Do you have time now?' }, goal: 'Say that you have time now — or ask Xiao Li to wait a moment because you need to go home first.', tip: 'Wait a moment: 请等一下.  Home: 回家.',
            replies: [
              { say: ['我现在有时间', '我有时间'], en: 'I have time now.', label: 'Have time', next: 'bye1' },
              { say: ['请等一下，我要回家', '请等一下'], en: 'Please wait a moment, I need to go home.', label: 'Wait a moment', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '好的，我等你。你快回家吧！', english: "OK, I'll wait for you. Hurry home!" }, goal: 'Say thank you very much.', tip: '非常 ("extremely") goes before the verb.',
            replies: [{ say: ['非常谢谢(你)'], en: 'Thank you very much.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '太好了！我们走吧！', english: "Great! Let's go!" }, end: true },
          bye2: { npc: { hanzi: '不客气！', english: "You're welcome!" }, end: true },
        },
      },

      // ───────────────────────── 16. Plans for the week (Xiao Li starts) ─────────────────────────
      {
        id: 'week', title: 'Plans for the weekend',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '昨天你做什么了？', english: 'What did you do yesterday?' }, goal: 'Say that yesterday you watched a film — or that you studied.', tip: 'Time first. Past actions take 了 at the end.',
            replies: [
              { say: ['昨天我看电影了', '我看电影了'], en: 'Yesterday I watched a film.', label: 'A film', next: 'n2' },
              { say: ['昨天我学习了', '我学习了'], en: 'Yesterday I studied.', label: 'Studied', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '好！星期六上午你忙吗？', english: 'Good! Are you busy on Saturday morning?' }, goal: 'Say that you are not busy — or that you are busy on Saturday.', tip: '星期 + number is the day of the week: 星期六 = Saturday. 不忙 = not busy.',
            replies: [
              { say: ['我不忙', '我星期六不忙'], en: "I'm not busy.", label: 'Not busy', next: 'n3a' },
              { say: ['我很忙', '我星期六很忙'], en: "I'm busy.", label: 'Busy', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！中国商店星期六上午开。那个时候我们去吧。', english: "Great! The Chinese shop opens on Saturday morning. Let's go then." }, goal: 'Say OK, you would like to go.', tip: '想去 = would like to go.',
            replies: [{ say: ['好的，我想去', '我想去'], en: "OK, I'd like to go.", next: 'bye1' }] },
          n3b: { npc: { hanzi: '没关系！那星期日呢？', english: 'No problem! What about Sunday?' }, goal: 'Say that you are not busy on Sunday.', tip: '星期日 (or 星期天) = Sunday. Time word first.',
            replies: [{ say: ['[星期日|星期天]我不忙', '我[星期日|星期天]不忙'], en: "I'm not busy on Sunday.", next: 'bye2' }] },
          bye1: { npc: { hanzi: '好！星期六再见！', english: 'Good! See you on Saturday. Bye!' }, end: true },
          bye2: { npc: { hanzi: '太好了！星期日再见！', english: 'Great! See you on Sunday!' }, end: true },
        },
      },

      // ───────────────────────── 17. A hospital visit (Xiao Li starts) ─────────────────────────
      {
        id: 'hospital', title: 'Visiting a classmate',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我的同学在医院。你想和我一起去看他吗？', english: 'My classmate is in hospital. Would you like to go and see him with me?' }, goal: 'Say that you would like to go with Xiao Li — or that you cannot because you are busy.', tip: '和 + person + 一起 = "together with".',
            replies: [
              { say: ['我想和你一起去', '我想去'], en: "I'd like to go with you.", label: 'Go', next: 'n2' },
              { say: ['对不起，我很忙', '对不起，我不能去'], en: "Sorry, I'm busy.", label: 'Busy', next: 'bye2' },
            ] },
          n2: { npc: { hanzi: '谢谢你！你坐出租车还是走去？', english: 'Thank you! Will you take a taxi or walk?' }, goal: 'Say that you will take a taxi — or that you will walk.', tip: '坐 = travel by (a vehicle); 走 = walk.',
            replies: [
              { say: ['我坐出租车'], en: "I'll take a taxi.", label: 'Taxi', next: 'bye1' },
              { say: ['我走去', '我走去吧'], en: "I'll walk.", label: 'Walk', next: 'bye1' },
            ] },
          bye1: { npc: { hanzi: '好！医院在学校旁边。明天再见！', english: 'Good! The hospital is next to the school. See you tomorrow!' }, end: true },
          bye2: { npc: { hanzi: '没关系！再见！', english: 'No problem! Bye!' }, end: true },
        },
      },

      // ───────────────────────── 18. Polite hello (YOU start) ─────────────────────────
      {
        id: 'polite', title: 'Greeting Mr. Li politely',
        start: 'n1',
        nodes: {
          n1: { goal: 'Greet Xiao Li politely, as "Mr. Li", using the polite word for "you".', tip: 'Polite "you" is 您. Mr. = a surname + 先生.',
            replies: [{ say: ['您好，李先生', '李先生，您好', '您好'], en: 'Hello, Mr. Li.', next: 'n2' }] },
          n2: { npc: { hanzi: '你好！请坐。你有儿子吗？', english: 'Hello! Please sit down. Do you have a son?' }, goal: 'Say that you have a daughter — or a son.', tip: '我有一个… + family word.',
            replies: [
              { say: ['我有一个女儿'], en: 'I have a daughter.', label: 'A daughter', next: 'n3' },
              { say: ['我有一个儿子'], en: 'I have a son.', label: 'A son', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '真好！您好吗？', english: 'Lovely! And how are you?' }, goal: 'Say thank you and that you are very well.', tip: '谢谢，我很好。',
            replies: [{ say: ['谢谢，我很好', '谢谢，我非常好', '我很好，谢谢'], en: "Thank you, I'm very well.", next: 'bye' }] },
          bye: { npc: { hanzi: '太好了！再见！', english: 'Wonderful! Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 19. Where is the shop? (Xiao Li starts) ─────────────────────────
      {
        id: 'shopway', title: 'Where is the shop?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '请问，这儿有商店吗？商店在哪里？', english: 'Excuse me, is there a shop here? Where is it?' }, goal: 'Say that there is a shop, and where it is: on the left, on the right, or behind.', tip: '有 = there is. Place words: 左边 right? No — 左边 = left side, 右边 = right side, 后面 = behind.',
            replies: [
              { say: ['有，(商店)在左边', '商店在左边'], en: "Yes — it's on the left.", label: 'Left', next: 'n2' },
              { say: ['有，(商店)在右边', '商店在右边'], en: "Yes — it's on the right.", label: 'Right', next: 'n2' },
              { say: ['有，(商店)在后面', '商店在后面'], en: "Yes — it's behind.", label: 'Behind', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '远吗？', english: 'Is it far?' }, goal: 'Say that it is near — or that it is a bit far.', tip: '近 = near, 远 = far. Add 很 before the adjective.',
            replies: [
              { say: ['不远', '不远，很近', '很近'], en: "It's not far.", label: 'Near', next: 'bye' },
              { say: ['很远', '有点远'], en: "It's far.", label: 'Far', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '谢谢你！再见！', english: 'Thank you! Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 20. A new phone (Xiao Li starts) ─────────────────────────
      {
        id: 'newthing', title: 'My new phone',
        slots: { item: [{ hanzi: '手机', en: 'phone' }, { hanzi: '电脑', en: 'computer' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看，这是我的新{item}！', english: 'Look, this is my new {item.en}!' }, goal: 'Say that it is very pretty.', tip: '漂亮 = pretty. Strengthen it with 很, 真 or 非常.',
            replies: [{ say: ['(这个)很漂亮', '(这个)真漂亮', '(这个)非常漂亮', '漂亮'], en: "It's very pretty.", next: 'n2' }] },
          n2: { npc: { hanzi: '这个很快，和你的不一样。你想看看吗？', english: "This one is fast — not the same as yours. Do you want to have a look?" }, goal: 'Say that you would like a look — or that you have one too.', tip: '看看 / 看一下 = have a look.',
            replies: [
              { say: ['我想看看', '我想看一下'], en: "I'd like to have a look.", label: 'A look', next: 'bye1' },
              { say: ['我也有一个', '我有一个'], en: 'I have one too.', label: 'Have one', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '给你！请看。', english: 'Here you go! Please look.' }, end: true },
          bye2: { npc: { hanzi: '是吗？你的东西也很新！再见！', english: 'Really? Your things are new too! Bye!' }, end: true },
        },
      },

      // ───────────────────────── 21. Please say it again (Xiao Li starts) ─────────────────────────
      {
        id: 'slow', title: 'Please say it again',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！我说中文很快。你听懂了吗？', english: 'Hi! I speak Chinese very fast. Did you understand?' }, goal: 'Say that you did not understand — and ask Xiao Li to say it again, or to speak more slowly.', tip: 'Again: 请再说一遍.  Slower: 请说慢一点.',
            replies: [
              { say: ['我没听懂，请再说一遍', '请再说一遍', '请再说一次'], en: "I didn't understand — please say it again.", label: 'Say it again', next: 'n2a' },
              { say: ['我没听懂，请说慢一点', '请你说慢一点', '请说慢一点'], en: "I didn't understand — please speak more slowly.", label: 'Slower', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '好的。我喜欢中国！你听懂了吗？', english: 'OK. I like China! Did you understand?' }, goal: 'Say that you understand now.', tip: '听懂了 = understood (by listening).',
            replies: [{ say: ['我听懂了', '我现在听懂了'], en: 'I understand now.', next: 'bye' }] },
          n2b: { npc: { hanzi: '好的，我说慢一点：我喜欢中国。你听懂了吗？', english: 'OK, I will go slower: I like China. Did you understand?' }, goal: 'Say that you understand now.', tip: '听懂了 = understood (by listening).',
            replies: [{ say: ['我听懂了', '我现在听懂了'], en: 'I understand now.', next: 'bye' }] },
          bye: { npc: { hanzi: '太好了！你听和说都很好！', english: 'Great! Your listening and speaking are both very good!' }, end: true },
        },
      },

      // ───────────────────────── 22. Writing characters (Xiao Li starts) ─────────────────────────
      {
        id: 'writing', title: 'Can you write characters?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你会写中文字吗？', english: 'Can you write Chinese characters?' }, goal: 'Say that you can write a few — or that you cannot yet.', tip: '会 = can (a skill). 一点 = a little. 还不会 = "not yet".',
            replies: [
              { say: ['我会写(一点)'], en: 'I can write a few.', label: 'A few', next: 'n2a' },
              { say: ['我不会写', '我还不会写'], en: "I can't write yet.", label: 'Not yet', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '太好了！你会写什么字？', english: 'Great! Which character can you write?' }, goal: 'Say that you can write the character for "person".', tip: 'The character for person is one you meet early at Master Wang.',
            replies: [{ say: ['我会写人字', '我会写人'], en: 'I can write 人.', next: 'bye1' }] },
          n2b: { npc: { hanzi: '没关系，我可以教你写字。', english: "No problem — I can teach you to write." }, goal: 'Say thank you very much.', tip: '非常 ("extremely") goes before the verb.',
            replies: [{ say: ['非常谢谢(你)'], en: 'Thank you very much.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '你真好！再见！', english: "You're great! Bye!" }, end: true },
          bye2: { npc: { hanzi: '不客气！明天再见！', english: "You're welcome! See you tomorrow!" }, end: true },
        },
      },

      // ───────────────────────── 23. Looking for something (Xiao Li starts) ─────────────────────────
      {
        id: 'lost', title: 'Looking for something',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你在找东西吗？', english: 'Hi! Are you looking for something?' }, goal: 'Say that yes, you are looking for your phone — or your computer.', tip: '在 + verb = "is doing". 找 = look for.',
            replies: [
              { say: ['是，我在找(我的)手机', '我在找(我的)手机'], en: "Yes, I'm looking for my phone.", label: 'Phone', next: 'n2' },
              { say: ['是，我在找(我的)电脑', '我在找(我的)电脑'], en: "Yes, I'm looking for my computer.", label: 'Computer', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '我可以给你打电话。你的手机呢？', english: 'I can call you. Where is your phone?' }, goal: 'Say that you do not know — or that you do not have one with you.', tip: '不知道 = do not know. 没有 = do not have.',
            replies: [
              { say: ['我不知道'], en: "I don't know.", label: "Don't know", next: 'bye1' },
              { say: ['我没有手机'], en: "I don't have a phone.", label: 'No phone', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '没关系，我们在这里找找吧！', english: "No problem, let's look around here!" }, end: true },
          bye2: { npc: { hanzi: '没关系！明天学校见！', english: 'No problem! See you at school tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 24. A visitor (Xiao Li starts) ─────────────────────────
      {
        id: 'host', title: 'A visit to your room',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！这里是你的房间吗？很漂亮！', english: 'Hello! Is this your room? It is very pretty!' }, goal: 'Say thank you, and ask Xiao Li what they would like to drink.', tip: '想喝什么 = "would like to drink what".',
            replies: [{ say: ['谢谢，你想喝什么', '谢谢，你要喝什么'], en: 'Thank you. What would you like to drink?', next: 'n2' }] },
          n2: { npc: { hanzi: '我想喝茶。请给我一个杯子。', english: 'I would like tea. Please give me a cup.' }, goal: 'Hand over a cup: say "here you are".', tip: '给 = give; 给你 = "for you / here you are".',
            replies: [{ say: ['给你'], en: 'Here you are.', next: 'n3' }] },
          n3: { npc: { hanzi: '谢谢！你家有猫吗？', english: 'Thanks! Do you have a cat at home?' }, goal: 'Say that you have a cat, that you have a dog, or that you have neither.', tip: '有 / 没有 + animal. 一只 counts animals: 一只猫.',
            replies: [
              { say: ['我有(一只)猫', '我家有(一只)猫'], en: 'I have a cat.', label: 'A cat', next: 'bye1' },
              { say: ['我有(一只)狗', '我家有(一只)狗', '没有，我有(一只)狗'], en: 'I have a dog.', label: 'A dog', next: 'bye3' },
              { say: ['我没有猫(，也没有狗)', '我家没有猫'], en: "I don't have a cat.", label: 'Neither', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '真好！我也喜欢猫！', english: 'Lovely! I like cats too!' }, end: true },
          bye3: { npc: { hanzi: '狗也很好！它叫什么名字？', english: 'Dogs are great too! What is its name?' }, end: true },
          bye2: { npc: { hanzi: '没关系！再见！', english: 'No problem! Bye!' }, end: true },
        },
      },
      // ════════════════ Level 1 (HSK 1 words only) ════════════════

      // ───────────────────────── 25. Do we know each other? (Xiao Li starts) ─────────────────────────
      {
        id: 'again', title: 'Do we know each other?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！我们认识吗？', english: 'Hello! Do we know each other?' }, goal: 'Say that yes, you are classmates — or that you do not know each other, but you are glad to meet.', tip: '认识 = know (a person). 同学 = classmate. 很高兴认识你 = "very glad to know you".',
            replies: [
              { say: ['认识，我们是同学', '我们是同学'], en: 'Yes — we are classmates.', label: 'Classmates', next: 'n2a' },
              { say: ['不认识，很高兴认识你', '(我们)不认识'], en: "No — but I'm glad to meet you.", label: "Don't know", next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '对！我们是同学。你现在是大学生吗？', english: 'Right! We are classmates. Are you a university student now?' }, goal: 'Say whether you are a university student or a middle-school student.', tip: '大学生 = university student; 中学生 = middle-school student.',
            replies: [
              { say: ['是，我是大学生', '我是大学生'], en: "Yes, I'm a university student.", label: 'University', next: 'n3' },
              { say: ['不是，我是中学生', '我是中学生'], en: "No, I'm a middle-school student.", label: 'Middle school', next: 'n3' },
            ] },
          n2b: { npc: { hanzi: '我也很高兴认识你！我是大学生。你呢？', english: "I'm glad to meet you too! I'm a university student. And you?" }, goal: 'Say whether you are a university student or a middle-school student.', tip: '大学生 = university student; 中学生 = middle-school student.',
            replies: [
              { say: ['我也是大学生', '我是大学生'], en: "I'm a university student too.", label: 'University', next: 'n3' },
              { say: ['我是中学生', '我不是大学生，我是中学生'], en: "I'm a middle-school student.", label: 'Middle school', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '你的同学都是中国人吗？', english: 'Are your classmates all Chinese?' }, goal: 'Say that some are and some are not — or that they all are.', tip: '有的 … 有的 … = "some … others …". 都 = all.',
            replies: [
              { say: ['有的是，有的不是', '有的是中国人，有的不是'], en: 'Some are, some are not.', label: 'Some', next: 'bye1' },
              { say: ['(他们)都是中国人', '大家都是中国人', '都是'], en: 'They are all Chinese.', label: 'All', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '真好！我们都是朋友。再见！', english: "Lovely! We're all friends. Goodbye!" }, end: true },
          bye2: { npc: { hanzi: '是吗？那你会说很多汉语吧！再见！', english: 'Really? Then you can speak lots of Chinese, right? Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 26. What are you doing? (Xiao Li starts) ─────────────────────────
      {
        id: 'doing', title: 'What are you doing?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你正在做什么？', english: 'Hi! What are you doing right now?' }, goal: 'Say what you are doing: reading a book, listening to songs, or writing characters.', tip: '正在 (or just 在) + verb = "is doing right now": 我正在…',
            replies: [
              { say: ['我(正)在看书', '我(正)在读书'], en: "I'm reading a book.", label: 'Reading', next: 'n2a' },
              { say: ['我(正)在听歌'], en: "I'm listening to songs.", label: 'Songs', next: 'n2b' },
              { say: ['我(正)在写汉字'], en: "I'm writing characters.", label: 'Writing', next: 'n2c' },
            ] },
          n2a: { npc: { hanzi: '你看的是什么书？', english: 'What book are you reading?' }, goal: 'Say that it is a Chinese book.', tip: '一本 counts books: 一本中文书.',
            replies: [{ say: ['(是)一本中文书', '是中文书', '我看的是中文书'], en: "It's a Chinese book.", next: 'n3' }] },
          n2b: { npc: { hanzi: '是中国歌吗？好听吗？', english: 'Chinese songs? Do they sound nice?' }, goal: 'Say that they sound very nice — or not very nice.', tip: '好听 = "good to listen to". 不太 = "not very".',
            replies: [
              { say: ['很好听', '非常好听', '中国歌很好听'], en: 'They sound very nice.', label: 'Nice', next: 'n3' },
              { say: ['不太好听', '不好听'], en: "They don't sound very nice.", label: 'Not nice', next: 'n3' },
            ] },
          n2c: { npc: { hanzi: '你写了多少个字？', english: 'How many characters have you written?' }, goal: 'Say that you have written ten characters.', tip: 'Verb + 了 + number + 个: 我写了十个.',
            replies: [{ say: ['我写了十个(字)', '十个(字)'], en: "I've written ten.", next: 'n3' }] },
          n3: { npc: { hanzi: '我也想学！我可以看吗？', english: 'I want to learn too! May I have a look?' }, goal: 'Say yes and hand it over — or say sorry, you are busy now.', tip: '可以 = may / OK. 给你 = here you are. 对不起 = sorry.',
            replies: [
              { say: ['可以，给你', '可以(，请看)'], en: 'Sure, here you are.', label: 'Yes', next: 'bye1' },
              { say: ['对不起，我现在很忙'], en: "Sorry, I'm busy right now.", label: 'Busy', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '谢谢你！我明天也想学。', english: 'Thank you! I want to learn tomorrow too.' }, end: true },
          bye2: { npc: { hanzi: '没关系，明天见！', english: 'No problem, see you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── 27. Rain and snow (YOU start) ─────────────────────────
      {
        id: 'snow', title: 'Rain and snow',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li what the weather is like outside today.', tip: '外边 = outside. 怎么样 = "how is it?": 天气怎么样？',
            replies: [{ say: ['今天外边天气怎么样', '(今天)天气怎么样', '外边怎么样'], en: "What's the weather like outside today?", next: 'n2' }] },
          n2: { npc: { hanzi: '外边下雨了，也很冷。', english: "It's raining outside, and it's cold too." }, goal: 'Say that you do not like rain — or that you like it.', tip: '喜欢 + verb. 下雨 = "to rain" (literally "fall rain").',
            replies: [
              { say: ['我不喜欢下雨', '我不喜欢雨'], en: "I don't like rain.", label: "Don't like it", next: 'n3a' },
              { say: ['我喜欢下雨', '我很喜欢雨'], en: 'I like rain.', label: 'Like it', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '我也不喜欢。明天会下雪！你喜欢雪吗？', english: "Me neither. Tomorrow it'll snow! Do you like snow?" }, goal: 'Say whether you like snow.', tip: 'Yes: 我喜欢雪. No: 我不喜欢雪.',
            replies: [
              { say: ['我(很)喜欢雪', '我爱雪'], en: 'I like snow.', label: 'Yes', next: 'n4' },
              { say: ['我不喜欢雪'], en: "I don't like snow.", label: 'No', next: 'n4' },
            ] },
          n3b: { npc: { hanzi: '真的？明天会下雪！你喜欢雪吗？', english: "Really? Tomorrow it'll snow! Do you like snow?" }, goal: 'Say whether you like snow.', tip: 'Yes: 我喜欢雪. No: 我不喜欢雪.',
            replies: [
              { say: ['我也喜欢雪', '我(很)喜欢雪'], en: 'I like snow too.', label: 'Yes', next: 'n4' },
              { say: ['我不喜欢雪'], en: "I don't like snow.", label: 'No', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '天冷了，你要多穿衣服！', english: "It's getting cold — wear more clothes!" }, goal: 'Say OK — or say that you are not cold, you like the cold.', tip: '多穿 = "wear more". 不冷 = not cold.',
            replies: [
              { say: ['好，我多穿衣服', '好，谢谢'], en: "OK, I'll wear more.", label: 'OK', next: 'bye1' },
              { say: ['我不冷', '我喜欢冷天', '我不冷，我很热'], en: "I'm not cold — I like cold days.", label: 'Not cold', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '对！冷的时候，喝一杯热茶。再见！', english: 'Right! When it is cold, drink a cup of hot tea. Goodbye!' }, end: true },
          bye2: { npc: { hanzi: '是吗？我喜欢热天！再见！', english: 'Really? I like hot days! Goodbye!' }, end: true },
        },
      },

      // ───────────────────────── 28. Dates and times (Xiao Li starts) ─────────────────────────
      {
        id: 'date', title: 'What is the date today?',
        slots: { m: [{ hanzi: '三', en: 'March' }, { hanzi: '五', en: 'May' }, { hanzi: '十', en: 'October' }], d: [{ hanzi: '八', en: '8th' }, { hanzi: '二十', en: '20th' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '今天几月几号？', english: "What's the date today?" }, goal: 'Say that today is {m.en} {d.en}.', tip: 'Month first, then the day: number + 月 + number + 号.',
            replies: [{ say: ['今天{m}月{d}[号|日]', '{m}月{d}号'], en: 'Today is {m.en} {d.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '对！今天星期几？', english: 'Right! What day of the week is it today?' }, goal: 'Say what day of the week it is today — a weekday or the weekend, as you like.', tip: '星期 + number: 星期一 = Monday … 星期六 = Saturday. Sunday is 星期日 or 星期天.',
            replies: [
              { say: ['今天星期[一|二|三|四|五]', '星期[一|二|三|四|五]'], en: "It's a weekday.", label: 'A weekday', next: 'n3a' },
              { say: ['今天星期[六|日|天]', '星期[六|日|天]'], en: "It's the weekend.", label: 'The weekend', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '你今天上午有课吗？', english: 'Do you have class this morning?' }, goal: 'Say whether you have class this morning.', tip: '有课 = have class; 没有课 = have no class. 上午 = morning.',
            replies: [
              { say: ['有，我上午有课', '我上午有课'], en: 'Yes, I have class this morning.', label: 'Yes', next: 'n4' },
              { say: ['没有，我上午没有课', '我上午没有课'], en: 'No class this morning.', label: 'No', next: 'n4' },
            ] },
          n3b: { npc: { hanzi: '太好了，今天不上课！你昨天做什么了？', english: 'Great, no class today! What did you do yesterday?' }, goal: 'Say that yesterday you stayed at home — or went to the bookshop.', tip: 'Time first: 昨天我… Use 了 for something done.',
            replies: [
              { say: ['昨天我在家', '我昨天在家'], en: 'Yesterday I was at home.', label: 'At home', next: 'n4' },
              { say: ['昨天我去书店了', '我去书店了'], en: 'Yesterday I went to the bookshop.', label: 'Bookshop', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '我们今天晚上去看电影吧！', english: "Let's go and see a film this evening!" }, goal: 'Ask what time you will go in the evening.', tip: '几点 = what time. Time words go before the verb: 晚上几点去？',
            replies: [{ say: ['(我们)晚上几点去', '几点去'], en: 'What time in the evening?', next: 'n5' }] },
          n5: { npc: { hanzi: '晚上七点。现在几点？', english: 'Seven in the evening. What time is it now?' }, goal: 'Say that it is half past five now.', tip: '半 = half: 五点半.',
            replies: [{ say: ['现在五点半', '五点半', '五点三十分'], en: "It's half past five.", next: 'bye' }] },
          bye: { npc: { hanzi: '好，还有一个半小时。七点见！', english: 'OK, an hour and a half to go. See you at seven!' }, end: true },
        },
      },

      // ───────────────────────── 29. Going shopping (Xiao Li starts) ─────────────────────────
      {
        id: 'errand', title: 'Going shopping',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你去哪儿？', english: 'Hi! Where are you going?' }, goal: 'Say that you are going to the supermarket — or to a shop — to buy things.', tip: '去 + place + 买东西 = "go to … to buy things".',
            replies: [
              { say: ['我去超市(买东西)'], en: "I'm going to the supermarket.", label: 'Supermarket', next: 'n2a' },
              { say: ['我去商店(买东西)'], en: "I'm going to a shop.", label: 'Shop', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '超市的东西很便宜。你要买什么？', english: 'Things at the supermarket are cheap. What do you want to buy?' }, goal: 'Say that you want to buy fruit and milk — or a new phone.', tip: '要 / 想 + 买 + thing. 和 = and.',
            replies: [
              { say: ['我[要|想]买水果和牛奶'], en: 'I want to buy fruit and milk.', label: 'Fruit and milk', next: 'n3a' },
              { say: ['我[要|想]买(一个)新手机'], en: 'I want to buy a new phone.', label: 'A phone', next: 'n3b' },
            ] },
          n2b: { npc: { hanzi: '那个商店的东西有点儿贵。你要买什么？', english: 'Things in that shop are a bit expensive. What do you want to buy?' }, goal: 'Say that you want to buy a piece of clothing — or a new phone.', tip: '件 counts clothes: 一件衣服.',
            replies: [
              { say: ['我[要|想]买一件衣服'], en: 'I want to buy a piece of clothing.', label: 'Clothes', next: 'n3a' },
              { say: ['我[要|想]买(一个)新手机'], en: 'I want to buy a new phone.', label: 'A phone', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '好！你有多少钱？', english: 'OK! How much money do you have?' }, goal: 'Say that you have a hundred yuan.', tip: '一百 = one hundred: 我有一百块(钱).',
            replies: [{ say: ['我有一百块(钱)', '一百块(钱)'], en: 'I have a hundred yuan.', next: 'bye1' }] },
          n3b: { npc: { hanzi: '手机很贵！你有多少钱？', english: 'Phones are expensive! How much money do you have?' }, goal: 'Say that you have two thousand yuan — or that you do not have much money.', tip: '千 = thousand: 两千块. Not much: 我的钱不多.',
            replies: [
              { say: ['我有两千块(钱)', '两千块(钱)'], en: 'I have two thousand yuan.', label: 'Two thousand', next: 'bye2' },
              { say: ['我的钱不多', '我没有很多钱'], en: "I don't have much money.", label: 'Not much', next: 'bye3' },
            ] },
          bye1: { npc: { hanzi: '一百块很多！你可以买很多东西。再见！', english: 'A hundred is a lot! You can buy lots of things. Bye!' }, end: true },
          bye2: { npc: { hanzi: '两千块？好，你可以买一个好手机！', english: 'Two thousand? Good — you can buy a good phone!' }, end: true },
          bye3: { npc: { hanzi: '没关系，也有便宜的手机！', english: 'No problem — there are cheap phones too!' }, end: true },
        },
      },

      // ───────────────────────── 30. Getting there (YOU start) ─────────────────────────
      {
        id: 'travel', title: 'How do you get there?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li how they get to school.', tip: '怎么 + verb = "how (to do it)": 你怎么去学校？',
            replies: [{ say: ['(小李，)你怎么去学校'], en: 'How do you get to school?', next: 'n2' }] },
          n2: { npc: { hanzi: '我坐车去。你呢？', english: 'I go by car. And you?' }, goal: 'Say that you take a taxi — or that your dad drives you in his car.', tip: '坐 + vehicle + 去 = "go by …". 开车 = drive.',
            replies: [
              { say: ['我坐出租车(去)'], en: 'I take a taxi.', label: 'Taxi', next: 'n3a' },
              { say: ['我坐我爸爸的车(去)', '我爸爸开车'], en: "I go in my dad's car.", label: "Dad's car", next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '坐出租车很贵吧？', english: "Taking a taxi must be expensive, right?" }, goal: 'Say that it is a bit expensive — or that it is cheap.', tip: '有点儿 + adjective = "a bit …". 便宜 = cheap.',
            replies: [
              { say: ['(是，)有点儿贵'], en: "Yes, it's a bit expensive.", label: 'Expensive', next: 'n4' },
              { say: ['不贵，很便宜', '不贵'], en: "No, it's cheap.", label: 'Cheap', next: 'n4' },
            ] },
          n3b: { npc: { hanzi: '你爸爸会开车，真好！他在哪儿工作？', english: 'Your dad can drive — great! Where does he work?' }, goal: 'Say that he works at a hospital — or at a company.', tip: '在 + place + 工作.',
            replies: [
              { say: ['他在医院工作', '在医院'], en: 'He works at a hospital.', label: 'Hospital', next: 'n4' },
              { say: ['他在公司工作', '在公司'], en: 'He works at a company.', label: 'Company', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '我明年想去中国，坐飞机去！你想去中国吗？', english: 'Next year I want to go to China — by plane! Do you want to go to China?' }, goal: 'Say that you want to go by plane — or by train — or that you do not want to go.', tip: '想 + 坐 + vehicle + 去. 火车 = train, 飞机 = plane.',
            replies: [
              { say: ['我想坐飞机去(中国)', '我也想坐飞机去'], en: 'I want to go by plane.', label: 'By plane', next: 'bye1' },
              { say: ['我想坐火车去(中国)'], en: 'I want to go by train.', label: 'By train', next: 'bye1' },
              { say: ['我去年去了(中国)'], en: 'I went last year.', label: 'Went last year', next: 'bye3' },
              { say: ['我不想去'], en: "I don't want to go.", label: 'No', next: 'bye2' },
            ] },
          bye3: { npc: { hanzi: '真的？那明年你也去吧！', english: 'Really? Then go again next year!' }, end: true },
          bye1: { npc: { hanzi: '太好了！我们明年中国见！', english: 'Wonderful! See you in China next year!' }, end: true },
          bye2: { npc: { hanzi: '没关系！我给你打电话。再见！', english: "No problem! I'll call you. Goodbye!" }, end: true },
        },
      },

      // ───────────────────────── 31. Feeling ill (Xiao Li starts) ─────────────────────────
      {
        id: 'ill', title: 'Are you ill?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你怎么了？你生病了吗？', english: "What's wrong? Are you ill?" }, goal: 'Say that you are ill — or that you are fine.', tip: '生病了 = "have fallen ill". 很好 = fine.',
            replies: [
              { say: ['(是，)我生病了', '我病了'], en: "Yes, I'm ill.", label: 'Ill', next: 'n2a' },
              { say: ['没有，我很好', '我没有生病'], en: "No, I'm fine.", label: 'Fine', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '你去医院看病了吗？', english: 'Did you go to the hospital to see a doctor?' }, goal: 'Say that you went to the hospital — or that you did not.', tip: '去了 = went. 没有去 = did not go.',
            replies: [
              { say: ['去了，我去医院了', '我去医院看病了'], en: 'Yes, I went to the hospital.', label: 'Went', next: 'n3a' },
              { say: ['我没有去医院', '没有'], en: "No, I didn't go.", label: "Didn't go", next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '医生说什么？', english: 'What did the doctor say?' }, goal: 'Say that the doctor said you should rest at home.', tip: '医生说 + what he said: 医生说我要…',
            replies: [{ say: ['医生说我要(在家)休息', '我要在家休息'], en: 'The doctor said I need to rest at home.', next: 'bye1' }] },
          n3b: { npc: { hanzi: '你要去看医生！我和你去吧。', english: 'You need to see a doctor! I will go with you.' }, goal: 'Say OK, thank you — or that you want to sleep first.', tip: '好的 = OK. 睡觉 = sleep.',
            replies: [
              { say: ['好的，谢谢你', '好，谢谢'], en: 'OK, thank you.', label: 'OK', next: 'bye1' },
              { say: ['我想睡觉', '我现在想睡觉'], en: 'I want to sleep.', label: 'Sleep', next: 'bye2' },
            ] },
          n2b: { npc: { hanzi: '太好了！我的同学病了，他在医院。', english: 'Good! My classmate is ill; he is in hospital.' }, goal: 'Ask what illness he has.', tip: '什么 + noun: 什么病？',
            replies: [{ say: ['他有什么病', '他是什么病', '什么病'], en: 'What is wrong with him?', next: 'bye3' }] },
          bye1: { npc: { hanzi: '好好休息！晚上早一点儿睡觉。', english: 'Rest well! Go to bed a little early tonight.' }, end: true },
          bye2: { npc: { hanzi: '好，你多睡觉，多喝水！明天我给你打电话。', english: "OK, sleep a lot and drink lots of water! I'll call you tomorrow." }, end: true },
          bye3: { npc: { hanzi: '不是大病。他明天回家。', english: "Nothing serious. He'll go home tomorrow." }, end: true },
        },
      },

      // ───────────────────────── 32. Films and songs (YOU start) ─────────────────────────
      {
        id: 'films', title: 'Films and songs',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li whether they like watching films.', tip: '喜欢 + verb + 吗: 你喜欢看电影吗？',
            replies: [{ say: ['(小李，)你喜欢看电影吗'], en: 'Do you like watching films?', next: 'n2' }] },
          n2: { npc: { hanzi: '我很爱看电影！昨天我去电影院了，那个电影很好看。你喜欢中国电影吗？', english: 'I love films! I went to the cinema yesterday — the film was great. Do you like Chinese films?' }, goal: 'Say that you like Chinese films too — or that you do not really like them.', tip: '也 = too. 不太 = not really.',
            replies: [
              { say: ['我也(很)喜欢(中国电影)', '我也爱看中国电影', '我觉得很好看'], en: 'I like them too.', label: 'Like them', next: 'n3a' },
              { say: ['我不太喜欢', '我不喜欢(中国电影)'], en: "I don't really like them.", label: "Don't like them", next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！我们明天去电影院吧？', english: "Great! Shall we go to the cinema tomorrow?" }, goal: 'Agree, and ask what time.', tip: '好 = OK. 几点 = what time.',
            replies: [{ say: ['好，几点去', '好的，明天几点'], en: 'OK — what time?', next: 'bye1' }] },
          n3b: { npc: { hanzi: '那你喜欢做什么？', english: 'Then what do you like doing?' }, goal: 'Say that you like singing Chinese songs — or playing with your cat.', tip: '唱 = sing; 歌 = song. 和 + someone + 玩 = play with someone.',
            replies: [
              { say: ['我喜欢唱中文歌', '我喜欢唱歌'], en: 'I like singing Chinese songs.', label: 'Singing', next: 'n4a' },
              { say: ['我喜欢和我的猫玩', '我喜欢和猫玩'], en: 'I like playing with my cat.', label: 'My cat', next: 'n4b' },
            ] },
          n4a: { npc: { hanzi: '你唱一个吧！', english: 'Sing one for me!' }, goal: 'Say OK, you will sing — or that you do not want to sing now.', tip: '我唱 = I will sing. 不想 = do not want to.',
            replies: [
              { say: ['好，我唱', '好的，我唱一个'], en: "OK, I'll sing.", label: 'Sing', next: 'bye2' },
              { say: ['我现在不想唱'], en: "I don't want to sing now.", label: 'Not now', next: 'bye3' },
            ] },
          n4b: { npc: { hanzi: '你的猫好玩儿吗？', english: 'Is your cat fun?' }, goal: 'Say that it is a lot of fun.', tip: '它 = it (animals and things). 好玩儿 = fun.',
            replies: [{ say: ['它很好玩儿', '很好玩儿', '它非常好玩儿'], en: "It's a lot of fun.", next: 'bye4' }] },
          bye1: { npc: { hanzi: '晚上七点，电影院见！', english: 'Seven in the evening — see you at the cinema!' }, end: true },
          bye2: { npc: { hanzi: '真好听！我也很喜欢中国歌！', english: 'That sounds lovely! I love Chinese songs too!' }, end: true },
          bye3: { npc: { hanzi: '没关系，明天唱吧！', english: 'No problem — sing tomorrow!' }, end: true },
          bye4: { npc: { hanzi: '真好！我也想看看它。', english: 'Lovely! I want to see it too.' }, end: true },
        },
      },

      // ───────────────────────── 33. How many books? (Xiao Li starts) ─────────────────────────
      {
        id: 'books', title: 'How old? How many?',
        slots: { age: [{ hanzi: '十八', en: 'eighteen' }, { hanzi: '二十', en: 'twenty' }, { hanzi: '二十五', en: 'twenty-five' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你今年多少岁？', english: 'How old are you this year?' }, goal: 'Say that you are {age.en} this year.', tip: 'Age: number + 岁. 今年 = this year.',
            replies: [{ say: ['我今年{age}岁', '{age}岁'], en: "I'm {age.en} this year.", next: 'n2' }] },
          n2: { npc: { hanzi: '我也是！你有多少本中文书？', english: 'Me too! How many Chinese books do you have?' }, goal: 'Say that you have a few, many — or none.', tip: '一些 = some / a few. 很多 = many. 没有 = none.',
            replies: [
              { say: ['我有一些(中文书)', '有一些'], en: 'I have a few.', label: 'A few', next: 'n3a' },
              { say: ['我有很多(中文书)', '很多'], en: 'I have lots.', label: 'Lots', next: 'n3b' },
              { say: ['我没有中文书', '没有'], en: "I don't have any.", label: 'None', next: 'n3c' },
            ] },
          n3a: { npc: { hanzi: '一些是几本？', english: 'How many is "a few"?' }, goal: 'Say that you have three.', tip: '本 counts books: 三本.',
            replies: [{ say: ['我有三本', '三本'], en: 'Three.', next: 'n4' }] },
          n3b: { npc: { hanzi: '真的？你有几本？', english: 'Really? How many?' }, goal: 'Say that you have ten.', tip: '本 counts books: 十本.',
            replies: [{ say: ['我有十本', '十本'], en: 'Ten.', next: 'n4' }] },
          n3c: { npc: { hanzi: '没关系，这本书给你！', english: 'No problem — this book is for you!' }, goal: 'Say thank you very much.', tip: '非常 ("extremely") goes before the verb.',
            replies: [{ say: ['非常谢谢(你)', '谢谢你'], en: 'Thank you very much.', next: 'n4' }] },
          n4: { npc: { hanzi: '你明年想做什么？', english: 'What do you want to do next year?' }, goal: 'Say that next year you want to go to China — or to learn more Chinese.', tip: 'Time first: 明年我想…',
            replies: [
              { say: ['(明年)我想去中国', '我明年想去中国'], en: 'I want to go to China.', label: 'Go to China', next: 'bye1' },
              { say: ['(明年)我想学汉语', '我明年想学汉语', '我想学习汉语'], en: 'I want to learn Chinese.', label: 'Learn Chinese', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！去年我也去了中国。', english: 'Great! I went to China last year too.' }, end: true },
          bye2: { npc: { hanzi: '好！你的汉语会很好！', english: 'Good! Your Chinese will be great!' }, end: true },
        },
      },

      // ───────────────────────── 34. Who is that? (Xiao Li starts) ─────────────────────────
      {
        id: 'who', title: 'Who is that?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看那里！那个人是谁？', english: 'Look over there! Who is that person?' }, goal: 'Say that it is your teacher, your friend — or that you do not know.', tip: '那是 + who. 我的 = my. 不知道 = do not know.',
            replies: [
              { say: ['(那是)我的老师', '他是我的老师'], en: "That's my teacher.", label: 'Teacher', next: 'n2a' },
              { say: ['(那是)我的朋友', '他是我的朋友'], en: "That's my friend.", label: 'Friend', next: 'n2b' },
              { say: ['我不知道(他是谁)'], en: "I don't know.", label: "Don't know", next: 'n3' },
            ] },
          n2a: { npc: { hanzi: '他是哪国人？', english: 'Which country is he from?' }, goal: 'Say that he is Chinese — or that he is not.', tip: '哪国人 = "which-country person". Answer: 他是中国人.',
            replies: [
              { say: ['他是中国人'], en: 'He is Chinese.', label: 'Chinese', next: 'n3' },
              { say: ['他不是中国人'], en: 'He is not Chinese.', label: 'Not Chinese', next: 'n3' },
            ] },
          n2b: { npc: { hanzi: '你的朋友住哪里？', english: 'Where does your friend live?' }, goal: 'Say that he lives here — or over there.', tip: '这里 / 这儿 = here; 那里 / 那边 = there.',
            replies: [
              { say: ['他住在[这里|这儿|这边]', '(住在)这里'], en: 'He lives here.', label: 'Here', next: 'n3' },
              { say: ['他住在[那里|那边]', '(住在)那边'], en: 'He lives over there.', label: 'There', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '你看，那边有一只小狗。它是谁的？', english: 'Look, there is a little dog over there. Whose is it?' }, goal: 'Say that it is yours — or that you do not know whose it is.', tip: '它 = it. 谁的 = whose. 我的 = mine.',
            replies: [
              { say: ['它是我的(狗)', '是我的'], en: "It's mine.", label: 'Mine', next: 'n4' },
              { say: ['我不知道它是谁的', '不知道'], en: "I don't know whose it is.", label: "Don't know", next: 'bye2' },
            ] },
          n4: { npc: { hanzi: '真的？它叫什么名字？', english: 'Really? What is its name?' }, goal: 'Say that it is called Xiao Gou ("little dog").', tip: '它叫 + name.',
            replies: [{ say: ['它叫小狗', '小狗'], en: "It's called Little Dog.", next: 'bye1' }] },
          bye1: { npc: { hanzi: '小狗，你好！它真漂亮！', english: 'Hello, Little Dog! It is really pretty!' }, end: true },
          bye2: { npc: { hanzi: '我们问问那边的人吧。', english: "Let's ask the people over there." }, end: true },
        },
      },

      // ───────────────────────── 37. A phone call at noon (Xiao Li calls YOU) ─────────────────────────
      {
        id: 'call', title: 'A call at lunchtime',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '喂，你好！我是小李。你听见了吗？', english: "Hello! It's Xiao Li. Can you hear me?" }, goal: 'Say that you can hear him, and ask what is up.', tip: 'On the phone, start with 喂. 听见 = hear. 有什么事？ = "what is it?"',
            replies: [{ say: ['喂，(我)听见了，你有什么事', '(我)听见了，有什么事', '喂，你有什么事'], en: 'Yes, I can hear you. What is it?', next: 'n2' }] },
          n2: { npc: { hanzi: '我想问你一个问题。你现在能说话吗？', english: 'I want to ask you something. Can you talk now?' }, goal: 'Say yes, go ahead — or sorry, you are in class.', tip: '能 = can. 你说吧 = "go ahead". 上课 = be in class.',
            replies: [
              { say: ['能，你说吧', '能，你问吧', '我能说话'], en: 'Yes, go ahead.', label: 'Go ahead', next: 'n3' },
              { say: ['对不起，我在上课', '对不起，我现在没有时间'], en: "Sorry, I'm in class.", label: 'In class', next: 'n2b' },
            ] },
          n2b: { npc: { hanzi: '好的，你几点下课？', english: 'OK, what time does your class end?' }, goal: 'Say that class ends at twelve, and that you will call him back then.', tip: '下课 = class ends. 再 = again. 打电话 = make a phone call.',
            replies: [{ say: ['十二点下课，我再给你打电话', '我十二点下课', '下课后我再给你打电话'], en: "Class ends at twelve — I'll call you back.", next: 'bye2' }] },
          n3: { npc: { hanzi: '中午你在哪儿吃午饭？', english: 'Where are you having lunch at noon?' }, goal: 'Say that you eat lunch at school — or at a restaurant.', tip: '在 + place + 吃午饭.',
            replies: [
              { say: ['我(中午)在学校吃(午饭)', '在学校吃(午饭)'], en: 'At school.', label: 'School', next: 'n4' },
              { say: ['我(中午)在饭店吃(午饭)', '在饭店吃(午饭)'], en: 'At a restaurant.', label: 'Restaurant', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '我下班后去饭店吃晚饭。你能来吗？', english: "After work I'm going to a restaurant for dinner. Can you come?" }, goal: 'Say that you can come — or that you cannot.', tip: '能来 = can come. 不能来 = cannot come.',
            replies: [
              { say: ['能，我能来', '我下班后能来'], en: 'Yes, I can come.', label: 'Can come', next: 'bye1' },
              { say: ['对不起，我不能来', '我不能来'], en: "Sorry, I can't come.", label: "Can't", next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！晚上见！', english: 'Great! See you this evening!' }, end: true },
          bye2: { npc: { hanzi: '没关系，我们再打电话吧。再见！', english: "No problem, let's talk on the phone again. Bye!" }, end: true },
        },
      },

      // ───────────────────────── 38. First day of class (YOU start) ─────────────────────────
      {
        id: 'class', title: 'The first day of class',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li what time class starts today.', tip: '几点 + 上课: 今天几点上课？',
            replies: [{ say: ['今天几点上课', '我们(今天)几点上课'], en: 'What time does class start today?', next: 'n2' }] },
          n2: { npc: { hanzi: '九点上课，十二点下课。今天我们读汉字。你会读多少个字？', english: 'Class is from nine to twelve. Today we read characters. How many can you read?' }, goal: 'Say that you can read a few — or a lot.', tip: '会 + 读 = can read. 一些 = a few; 很多 = a lot.',
            replies: [
              { say: ['我会读一些(汉字)', '一些'], en: 'I can read a few.', label: 'A few', next: 'n3' },
              { say: ['我会读很多(汉字)', '很多'], en: 'I can read lots.', label: 'Lots', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '你在哪儿学的汉语？', english: 'Where did you learn Chinese?' }, goal: 'Say where you learned Chinese: at primary school, middle school or university.', tip: '在 + school + 学 (汉语). 小学 / 中学 / 大学.',
            replies: [
              { say: ['我在小学学(汉语)', '在小学'], en: 'At primary school.', label: 'Primary school', next: 'n4' },
              { say: ['我在中学学(汉语)', '在中学'], en: 'At middle school.', label: 'Middle school', next: 'n4' },
              { say: ['我在大学学(汉语)', '在大学'], en: 'At university.', label: 'University', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '真好！你坐这里吧，这里没有人。', english: "Great! Sit here — nobody is sitting here." }, goal: 'Say thanks, you will sit here — or ask whether you may sit at the front, or whether you may ask a question.', tip: '坐 = sit. 前边 = the front. 可以…吗 = may I …? 问 = ask; 问题 = question.',
            replies: [
              { say: ['谢谢，我坐这里'], en: "Thanks, I'll sit here.", label: 'Sit here', next: 'bye1' },
              { say: ['我想坐前边，可以吗', '我可以坐前边吗'], en: 'May I sit at the front?', label: 'At the front', next: 'bye2' },
              { say: ['我可以问一个问题吗'], en: 'May I ask a question?', label: 'A question', next: 'bye3' },
            ] },
          bye1: { npc: { hanzi: '老师来了！我们不说话了。', english: "The teacher is here! Let's stop talking." }, end: true },
          bye2: { npc: { hanzi: '可以！前边也有椅子。', english: 'Sure! There are chairs at the front too.' }, end: true },
          bye3: { npc: { hanzi: '可以，你问吧！可是老师来了，我们下课说。', english: 'Sure, go ahead! But the teacher is here — let us talk after class.' }, end: true },
        },
      },

      // ───────────────────────── 39. Is there a bookshop? (YOU start) ─────────────────────────
      {
        id: 'bookshop', title: 'Is there a bookshop near here?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Politely ask Xiao Li whether there is a bookshop here.', tip: '请问 = excuse me. 这里有 … 吗？ = "is there … here?"',
            replies: [{ say: ['请问，这[里|儿]有书店吗', '这[里|儿]有书店吗'], en: 'Excuse me, is there a bookshop here?', next: 'n2' }] },
          n2: { npc: { hanzi: '有，书店在电影院后边。你看见电影院了吗？', english: "Yes — the bookshop is behind the cinema. Can you see the cinema?" }, goal: 'Say that you can see it — or ask where the cinema is.', tip: '看见了 = (I) see it. 在哪里 = where.',
            replies: [
              { say: ['(我)看见了', '我看见电影院了'], en: 'Yes, I can see it.', label: 'I see it', next: 'n3' },
              { say: ['电影院在[哪儿|哪里]'], en: 'Where is the cinema?', label: 'Where?', next: 'n2b' },
            ] },
          n2b: { npc: { hanzi: '在那边，超市的前边。', english: 'Over there, in front of the supermarket.' }, goal: 'Ask how many minutes it takes to get there.', tip: '要几分钟 = "takes how many minutes".',
            replies: [{ say: ['(去那儿)要几分钟', '几分钟能到'], en: 'How many minutes does it take?', next: 'n3' }] },
          n3: { npc: { hanzi: '五分钟。书店里有很多书。你想买什么书？', english: 'Five minutes. The bookshop has lots of books inside. What book do you want?' }, goal: 'Say that you want to buy a Chinese book — or just have a look.', tip: '想买 + 一本 + book. 看 = look.',
            replies: [
              { say: ['我想买一本中文书', '(我想买)一本中文书'], en: 'I want to buy a Chinese book.', label: 'Chinese book', next: 'bye1' },
              { say: ['我不买，我想在里边看书', '我不买'], en: "I'm not buying, I just want to look.", label: 'Just looking', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '那个店的中文书很多，也很便宜！', english: 'That shop has lots of Chinese books, and they are cheap!' }, end: true },
          bye2: { npc: { hanzi: '好的！书店很大，你可以在里边看书。', english: 'OK! The shop is big — you can read inside.' }, end: true },
        },
      },

      // ───────────────────────── 40. Early or late? (Xiao Li starts) ─────────────────────────
      {
        id: 'sleep', title: 'Early bird or night owl?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你晚上几点睡觉？', english: 'What time do you go to sleep at night?' }, goal: 'Say that you go to sleep late (at twelve) — or early (at half past nine). You can ask "and you?" too.', tip: 'Time before the verb: 我十二点睡. 很晚 = late; 很早 = early. 你呢？ = and you?',
            replies: [
              { say: ['我很晚睡(，你呢)', '我十二点睡(觉)'], en: 'I go to sleep late.', label: 'Late', next: 'n2a' },
              { say: ['我很早睡(，你呢)', '我九点半睡(觉)'], en: 'I go to sleep early.', label: 'Early', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '太晚了！你睡几个小时？', english: "That's late! How many hours do you sleep?" }, goal: 'Say that you sleep seven hours.', tip: '个小时 = hours: 七个小时.',
            replies: [{ say: ['我睡七个小时', '七个小时'], en: 'I sleep seven hours.', next: 'n3' }] },
          n2b: { npc: { hanzi: '真早！你白天很忙吗？', english: 'So early! Are you very busy during the day?' }, goal: 'Say that yes, you are busy during the day.', tip: '白天 = daytime. 很忙 = very busy.',
            replies: [{ say: ['(对，)我白天很忙', '白天很忙'], en: "Yes, I'm busy in the daytime.", next: 'n3' }] },
          n3: { npc: { hanzi: '你什么时候不忙？我们去喝茶吧。', english: "When are you free? Let's go for tea." }, goal: 'Say that you are free on Sunday — or in the evenings.', tip: '什么时候 = when. Time word + 不忙.',
            replies: [
              { say: ['[星期日|星期天]不忙', '我[星期日|星期天]不忙'], en: "I'm free on Sunday.", label: 'Sunday', next: 'bye' },
              { say: ['晚上不忙', '我晚上不忙'], en: "I'm free in the evenings.", label: 'Evenings', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '好！那个时候我给你打电话。', english: "Good! I'll call you then." }, end: true },
        },
      },

      // ───────────────────────── 41. Who are those people? (Xiao Li starts) ─────────────────────────
      {
        id: 'people', title: 'Who are those people?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看那边，那些人是谁？', english: 'Look over there — who are those people?' }, goal: 'Say that they are your classmates — or your family.', tip: '她们 / 他们 = they. 同学 = classmates; 家人 = family.',
            replies: [
              { say: ['[她们|他们]是我的同学'], en: 'They are my classmates.', label: 'Classmates', next: 'n2a' },
              { say: ['[她们|他们]是我的家人'], en: 'They are my family.', label: 'Family', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '她们是哪国人？', english: 'Which country are they from?' }, goal: 'Say that some are Chinese and some are not.', tip: '有些 … 有些 … = "some … others …".',
            replies: [{ say: ['有些是中国人，有些不是', '有的是中国人，有的不是'], en: 'Some are Chinese, some are not.', next: 'n3' }] },
          n2b: { npc: { hanzi: '那个女士是你妈妈吗？', english: 'Is that lady your mum?' }, goal: 'Say that yes, she is your mum — or no, she is your older sister.', tip: '对 = yes. 不是 = no. 姐姐 = older sister.',
            replies: [
              { say: ['对，她是我妈妈', '对，那个女士是我妈妈'], en: 'Yes, she is my mum.', label: 'Mum', next: 'n3' },
              { say: ['不是，她是我姐姐'], en: 'No, she is my older sister.', label: 'Sister', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '那两个人呢？一个男的，一个女的。', english: 'And those two? A man and a woman.' }, goal: 'Say who they are: your little brother and his girlfriend, your little sister and her boyfriend — or that you do not know them.', tip: '弟弟 / 妹妹 = younger brother / sister. 女朋友 / 男朋友 = girlfriend / boyfriend.',
            replies: [
              { say: ['是我弟弟和他的女朋友'], en: 'My little brother and his girlfriend.', label: 'Brother', next: 'bye1' },
              { say: ['是我妹妹和她的男朋友'], en: 'My little sister and her boyfriend.', label: 'Sister', next: 'bye1' },
              { say: ['我不认识他们'], en: "I don't know them.", label: "Don't know", next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '真好！大家都很高兴。', english: 'Lovely! Everyone looks very happy.' }, end: true },
          bye2: { npc: { hanzi: '没关系，我们去问问吧！', english: "No problem, let's go and ask!" }, end: true },
        },
      },

      // ───────────────────────── 42. Sorry I'm late (Xiao Li starts) ─────────────────────────
      {
        id: 'late', title: "Sorry I'm late",
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '对不起，我来晚了！', english: "Sorry, I'm late!" }, goal: 'Tell Xiao Li it does not matter, and ask them to sit down.', tip: '没关系 = never mind. 请坐 = please sit.',
            replies: [{ say: ['没关系，请坐', '没关系'], en: "Never mind — please sit down.", next: 'n2' }] },
          n2: { npc: { hanzi: '桌子上有很多杯子。这些都是你的吗？', english: 'There are lots of cups on the table. Are these all yours?' }, goal: 'Say that they are all yours — or that some are yours and some are your little sister’s.', tip: '都 = all. 有些 … 有些 … = some … others …',
            replies: [
              { say: ['都是我的', '桌子上的都是我的'], en: "Yes, they're all mine.", label: 'All mine', next: 'n3' },
              { say: ['有些是我的，有些是我妹妹的'], en: "Some are mine, some are my sister's.", label: 'Some', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '今天很热。我能喝一点儿水吗？', english: "It's hot today. Could I have a little water?" }, goal: 'Say of course, and give Xiao Li a cup — or say sorry, there is no water left.', tip: '能 / 可以 = can. 给你 = here you are. 没有水了 = the water is gone.',
            replies: [
              { say: ['能，给你一个杯子', '可以，给你'], en: 'Of course, here is a cup.', label: 'Water', next: 'n4' },
              { say: ['对不起，没有水了'], en: "Sorry, there's no water left.", label: 'No water', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '谢谢你！', english: 'Thank you!' }, goal: "Say you're welcome.", tip: 'The answer to 谢谢 is "not guest-polite": 不客气.',
            replies: [{ say: ['不客气'], en: "You're welcome.", next: 'bye' }] },
          bye: { npc: { hanzi: '你真好！', english: "You're so kind!" }, end: true },
        },
      },

      // ════════════════ Level 2 starters (HSK 2 words) ════════════════

      // ───────────────────────── 35. A trip (Xiao Li starts) ─────────────────────────
      {
        id: 'trip', title: 'Going on a trip',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '下个星期我要去旅游！', english: "Next week I'm going on a trip!" }, goal: 'Ask Xiao Li where they are going on the trip.', tip: '去哪儿 + 旅游: 你去哪儿旅游？',
            replies: [{ say: ['你去[哪儿|哪里]旅游', '你要去[哪儿|哪里]旅游'], en: 'Where are you going?', next: 'n2' }] },
          n2: { npc: { hanzi: '我去北京。我已经买了机票。', english: "I'm going to Beijing. I've already bought a plane ticket." }, goal: 'Ask when the plane leaves — or say that you have never been to Beijing.', tip: '几点 = what time. 过 after a verb = "have ever done": 我没去过北京.',
            replies: [
              { say: ['飞机几点飞', '你几点去机场'], en: 'What time is the flight?', label: 'What time?', next: 'n3' },
              { say: ['我没去过北京', '我还没去过北京'], en: "I've never been to Beijing.", label: 'Never been', next: 'n3b' },
            ] },
          n3: { npc: { hanzi: '明天早上八点。你能送我去机场吗？', english: 'Tomorrow at eight in the morning. Can you take me to the airport?' }, goal: 'Say that you can drive Xiao Li there — or say sorry, you have an exam tomorrow.', tip: '送 = take someone somewhere. 考试 = exam.',
            replies: [
              { say: ['可以，我开车送你', '没问题，我送你'], en: "Sure, I'll drive you.", label: 'Yes', next: 'bye1' },
              { say: ['对不起，明天我有考试', '不好意思，我明天要考试'], en: "Sorry, I have an exam tomorrow.", label: 'Exam', next: 'bye2' },
            ] },
          n3b: { npc: { hanzi: '北京很漂亮！下次我们一起去旅游吧。', english: "Beijing is beautiful! Next time let's travel together." }, goal: 'Agree happily — or say that you are too busy at the moment.', tip: '好啊 = "sure!". Busy: 我现在很忙.',
            replies: [
              { say: ['好啊，下次一起去', '好啊'], en: "Sure, next time let's go together.", label: 'Sure', next: 'bye1' },
              { say: ['我现在很忙', '对不起，我现在太忙了'], en: "I'm too busy at the moment.", label: 'Busy', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！谢谢你！', english: 'Great! Thank you!' }, end: true },
          bye2: { npc: { hanzi: '没关系，我打车去。回来再见！', english: "No problem, I'll take a taxi. See you when I'm back!" }, end: true },
        },
      },

      // ───────────────────────── 36. Sport (YOU start) ─────────────────────────
      {
        id: 'sport', title: 'Do you like sport?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Li what sport they like.', tip: '运动 = sport: 你喜欢什么运动？',
            replies: [{ say: ['(小李，)你喜欢什么运动'], en: 'What sport do you like?', next: 'n2' }] },
          n2: { npc: { hanzi: '我最喜欢踢足球。你呢？', english: 'I like playing football best. And you?' }, goal: 'Say that you like football too — or running — or swimming.', tip: '踢足球 = play football; 跑步 = run; 游泳 = swim.',
            replies: [
              { say: ['我也喜欢踢足球'], en: 'I like football too.', label: 'Football', next: 'n3a' },
              { say: ['我喜欢跑步'], en: 'I like running.', label: 'Running', next: 'n3b' },
              { say: ['我喜欢游泳'], en: 'I like swimming.', label: 'Swimming', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！星期六我们一起去踢足球吧！', english: "Great! Let's play football together on Saturday!" }, goal: 'Agree, and ask what time it starts.', tip: '开始 = start: 几点开始？',
            replies: [{ say: ['好啊，几点开始', '好，几点开始'], en: 'Sure — what time does it start?', next: 'bye1' }] },
          n3b: { npc: { hanzi: '运动对身体很好。你经常运动吗？', english: 'Exercise is good for your health. Do you exercise often?' }, goal: 'Say that you exercise every day — or that you are too tired after work.', tip: '每天 = every day. 累 = tired.',
            replies: [
              { say: ['我每天都运动', '对，我经常运动'], en: 'I exercise every day.', label: 'Every day', next: 'bye2' },
              { say: ['不，下班后我太累了', '我太累了'], en: "No, I'm too tired after work.", label: 'Too tired', next: 'bye3' },
            ] },
          bye1: { npc: { hanzi: '上午十点，在学校门口见！', english: 'Ten in the morning — see you at the school gate!' }, end: true },
          bye2: { npc: { hanzi: '真不错！所以你的身体很好。', english: "That's great! That's why you're so healthy." }, end: true },
          bye3: { npc: { hanzi: '我知道了。那我们星期天一起去跑步吧！', english: "I see. Then let's go running together on Sunday!" }, end: true },
        },
      },

      // ═══════════════════════ HSK 2 conversations ═══════════════════════
      // ───────────────────────── Comparing (比) ─────────────────────────
      {
        id: 'compare', title: 'Today is colder than yesterday',
        slots: { w: [{ hanzi: '冷', en: 'cold' }, { hanzi: '热', en: 'hot' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '今天天气这么{w}！比昨天{w}多了。', english: 'The weather is so {w.en} today! Much {w.en}er than yesterday.' }, goal: 'Agree: today really is {w.en}er than yesterday.', tip: 'A 比 B + adjective: 今天比昨天{w}.',
            replies: [{ say: ['是啊，今天比昨天{w}', '今天比昨天{w}', '对，今天比昨天{w}'], en: 'Yes, today is {w.en}er than yesterday.', next: 'n2' }] },
          n2: { npc: { hanzi: '你觉得明天会怎么样？', english: 'What do you think tomorrow will be like?' }, goal: 'Say tomorrow will probably be colder — or probably hotter — than today.', tip: '可能 = "maybe / probably": 明天可能比今天冷.',
            replies: [
              { say: ['明天可能比今天冷', '可能比今天冷'], en: 'Tomorrow will probably be colder than today.', label: 'Colder', next: 'n3a' },
              { say: ['明天可能比今天热', '可能比今天热'], en: 'Tomorrow will probably be hotter than today.', label: 'Hotter', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '真的吗？那我明天不出门了！', english: "Really? Then I won't go out tomorrow!" }, goal: 'Say that you will stay at home too.', tip: '我也在家 = "I\'m at home too".',
            replies: [{ say: ['我也在家', '我也不出门', '好，我也在家'], en: "I'll stay at home too.", next: 'bye' }] },
          n3b: { npc: { hanzi: '那我们明天去喝茶吧！', english: "Then let's go for tea tomorrow!" }, goal: 'Say that is a good idea.', tip: '好主意 isn\'t needed — 好 or 太好了 is enough.',
            replies: [{ say: ['好', '好，我们去', '太好了'], en: 'Good idea.', next: 'bye' }] },
          bye: { npc: { hanzi: '好！明天见！', english: 'Good! See you tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── How do you get to school? (从, 跟, 走路, 地铁) ─────────────────────────
      {
        id: 'commute', title: 'How do you get there?',
        slots: { place: [{ hanzi: '学校', en: 'school' }, { hanzi: '公司', en: 'work' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你每天怎么去{place}？', english: 'How do you get to {place.en} every day?' }, goal: 'Say that you go on foot — or by underground.', tip: '走路 = walk; 坐地铁 = take the underground (坐 + vehicle).',
            replies: [
              { say: ['我走路(去)', '我(每天)走路去{place}', '我慢慢地走路去'], en: 'I walk.', label: 'On foot', next: 'n2a' },
              { say: ['我坐地铁(去)', '我(每天)坐地铁去{place}'], en: 'I take the underground.', label: 'Underground', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '你家离{place}近吗？', english: 'Is your home close to {place.en}?' }, goal: 'Say that it is close — from home to there only ten minutes.', tip: '从 A 到 B = from A to B; 十分钟 = ten minutes.',
            replies: [{ say: ['很近，从我家到{place}只要十分钟', '很近，从家到{place}十分钟', '很近'], en: "It's close — only ten minutes from my home.", next: 'n3' }] },
          n2b: { npc: { hanzi: '路上要多长时间？', english: 'How long does it take on the way?' }, goal: 'Say that it takes one hour.', tip: '一个小时 = one hour; 要 = "it takes".',
            replies: [{ say: ['要一个小时', '路上要一个小时', '一个小时', '路上要一个小时，很快'], en: 'It takes an hour.', next: 'n3' }] },
          n3: { npc: { hanzi: '你一个人去吗？', english: 'Do you go on your own?' }, goal: 'Say that you go with a friend.', tip: '跟 + person + 一起 = "together with …".',
            replies: [
              { say: ['不，我跟朋友一起去', '我跟朋友一起去'], en: 'No, I go with a friend.', label: 'With a friend', next: 'bye' },
              { say: ['对，我一个人去', '我一个人去'], en: 'Yes, I go on my own.', label: 'Alone', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '真好。明天路上小心！', english: 'Nice. Be careful on the road tomorrow!' }, end: true },
        },
      },

      // ───────────────────────── Remembering and forgetting (记得, 忘, 告诉, 希望) ─────────────────────────
      {
        id: 'remember', title: 'I forgot the number',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我忘了小明的电话。你记得吗？', english: "I've forgotten Xiao Ming's phone number. Do you remember it?" }, goal: 'Say that you remember it — or that you have forgotten it too.', tip: '记得 = remember; 忘了 = forgot.',
            replies: [
              { say: ['我记得', '我记得，我告诉你'], en: 'I remember it.', label: 'I remember', next: 'n2a' },
              { say: ['我也忘了', '对不起，我也忘了'], en: 'I forgot it too.', label: 'I forgot too', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '太好了！请告诉我吧。', english: 'Great! Please tell me.' }, goal: 'Say that you will tell Xiao Li — then ask him to write it down.', tip: '告诉 + person = tell someone: 我告诉你. 写 = write.',
            replies: [{ say: ['好，我告诉你，你写吧', '我告诉你，你写吧', '好，我告诉你'], en: "OK, I'll tell you — you write it down.", next: 'bye1' }] },
          n2b: { npc: { hanzi: '没关系，我给他打电话问问。', english: "That's OK, I'll call and ask him." }, goal: 'Say that you hope he is at home.', tip: '希望 = hope: 希望他在家.',
            replies: [{ say: ['希望他在家', '我希望他在家', '你给他打个电话吧'], en: 'I hope he is at home.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '谢谢你！你记得真清楚。', english: 'Thank you! You remember so clearly.' }, end: true },
          bye2: { npc: { hanzi: '我也希望！再见！', english: 'I hope so too! Bye!' }, end: true },
        },
      },

      // ───────────────────────── Already, still, just (已经, 还是, 就, 饭馆) ─────────────────────────
      {
        id: 'already', title: 'Have you eaten yet?',
        slots: { food: [{ hanzi: '面条', en: 'noodles' }, { hanzi: '米饭', en: 'rice' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你已经吃饭了吗？', english: 'Have you eaten already?' }, goal: 'Say that you have already eaten — or not yet.', tip: '已经…了 = already; 还没(有) = not yet.',
            replies: [
              { say: ['我已经吃了', '我已经吃饭了'], en: 'I have already eaten.', label: 'Already', next: 'n2a' },
              { say: ['我还没(有)吃', '还没(有)'], en: "I haven't eaten yet.", label: 'Not yet', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '那我们去饭馆喝茶，好吗？', english: "Then let's go to a restaurant for tea, OK?" }, goal: 'Say OK, you will go, but you still want tea.', tip: '还是 here = "still": 我还是想喝茶.',
            replies: [{ say: ['好，我们走吧', '好，我们去吧', '好', '好，但我还是想喝茶'], en: "OK, let's go.", next: 'bye1' }] },
          n2b: { npc: { hanzi: '我也还没吃。你想吃什么？', english: "I haven't eaten either. What do you want to eat?" }, goal: 'Say that you just want {food.en}.', tip: '就 = "just / only": 我就想吃{food}.',
            replies: [{ say: ['我就想吃{food}', '我想吃{food}', '{food}', '我们去饭馆吃{food}'], en: 'I just want {food.en}.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '走吧！我们一起去！', english: "Let's go! Together!" }, end: true },
          bye2: { npc: { hanzi: '好，我们去饭馆吃{food}！', english: "OK, let's go to a restaurant for {food.en}!" }, end: true },
        },
      },

      // ───────────────────────── On the phone (打电话, 打车, 正, 一会儿, 快要) ─────────────────────────
      {
        id: 'phonecall', title: 'A phone call',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '喂？你在做什么呢？', english: 'Hello? What are you doing?' }, goal: 'Say that you are just watching TV — or just eating.', tip: '正在 / 在 + verb = "am doing right now": 我正在看电视.',
            replies: [
              { say: ['我正在看电视', '我在看电视', '我正看着电视呢'], en: "I'm watching TV.", label: 'TV', next: 'n2' },
              { say: ['我正在吃饭', '我在吃饭'], en: "I'm eating.", label: 'Eating', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '我们快要没时间了！一会儿你能来吗？', english: "We're about to run out of time! Can you come in a while?" }, goal: 'Say that you can come in a moment — and that you will take a taxi.', tip: '一会儿 = a little while; 打车 = take a taxi (lit. "hit a car").',
            replies: [
              { say: ['我一会儿就到', '好，我一会儿就到', '我一会儿到', '好，我快要到了'], en: "I'll be there in a moment.", label: 'In a moment', next: 'n3a' },
              { say: ['我打车去', '好，我打车去'], en: "I'll take a taxi.", label: 'Taxi', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '好，快一点！', english: 'OK, be quick!' }, goal: 'Say OK — then hang up with goodbye.', tip: '好的 + 再见.',
            replies: [{ say: ['好的，再见', '好，再见', '再见'], en: 'OK, bye.', next: 'bye' }] },
          n3b: { npc: { hanzi: '太好了，打车很快！', english: 'Great, a taxi is fast!' }, goal: 'Say goodbye.', tip: '再见.',
            replies: [{ say: ['好的，再见', '好，再见', '再见'], en: 'OK, bye.', next: 'bye' }] },
          bye: { npc: { hanzi: '一会儿见！', english: 'See you in a bit!' }, end: true },
        },
      },

      // ───────────────────────── Childhood (小时候, 小孩儿, 有意思, 笑, 画) ─────────────────────────
      {
        id: 'childhood', title: 'When I was little',
        slots: { act: [{ hanzi: '画画', en: 'drawing' }, { hanzi: '唱歌', en: 'singing' }, { hanzi: '踢足球', en: 'playing football' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你小时候喜欢做什么？', english: 'What did you like to do when you were little?' }, goal: 'Say that when you were little you liked {act.en}.', tip: '小时候 = "when (I was) little": 我小时候喜欢…',
            replies: [{ say: ['我小时候喜欢{act}', '小时候我喜欢{act}', '我从小喜欢{act}'], en: 'When I was little I liked {act.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '真有意思！我小时候是个爱笑的小孩儿。', english: 'How interesting! As a kid I laughed all the time.' }, goal: 'Ask Xiao Li what he laughed at.', tip: '笑 = laugh; 你笑什么？',
            replies: [{ say: ['你笑什么', '你为什么笑', '你为什么爱笑'], en: 'What did you laugh at?', next: 'n3' }] },
          n3: { npc: { hanzi: '什么都笑！你现在还是爱笑吗？', english: 'Everything! Do you still laugh a lot now?' }, goal: 'Say yes, you do — or that you laugh sometimes.', tip: '有时(候) = sometimes.',
            replies: [
              { say: ['我也(是)', '是，我也爱笑', '我现在还是爱笑'], en: 'Yes, I still laugh a lot.', label: 'Still', next: 'bye' },
              { say: ['我有时笑', '我有时候笑', '我有时爱笑'], en: 'I laugh sometimes.', label: 'Sometimes', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '笑一笑，十年少！', english: 'A laugh takes ten years off!' }, end: true },
        },
      },

      // ───────────────────────── Online (上网, 网上, 有时, 没意思) ─────────────────────────
      {
        id: 'online', title: 'Going online',
        slots: { thing: [{ hanzi: '看电影', en: 'watch films' }, { hanzi: '买东西', en: 'shop' }, { hanzi: '学中文', en: 'study Chinese' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你喜欢上网吗？', english: 'Do you like going online?' }, goal: 'Say that you like it — or that it is boring.', tip: '上网 = go online; 没意思 = boring (lit. "no meaning").',
            replies: [
              { say: ['喜欢，我有时上网', '我喜欢上网', '喜欢', '我上网时看电影'], en: 'I like it.', label: 'Like it', next: 'n2' },
              { say: ['不喜欢，没意思', '上网没意思', '我不喜欢，没意思'], en: "I don't like it — it's boring.", label: 'Boring', next: 'n3' },
            ] },
          n2: { npc: { hanzi: '你在网上做什么？', english: 'What do you do online?' }, goal: 'Say that you {thing.en} online.', tip: '在网上 + verb = do it online: 我在网上{thing}.',
            replies: [{ say: ['我在网上{thing}', '我(有时)在网上{thing}', '我上网时{thing}'], en: 'I {thing.en} online.', next: 'bye1' }] },
          n3: { npc: { hanzi: '那你喜欢做什么？', english: 'Then what do you like doing?' }, goal: 'Say that you like walking, or playing with friends.', tip: '走路 / 跟朋友玩.',
            replies: [
              { say: ['我喜欢走路', '我喜欢走路和跑步'], en: 'I like walking.', label: 'Walking', next: 'bye2' },
              { say: ['我喜欢跟朋友玩', '我喜欢跟朋友一起玩'], en: 'I like playing with friends.', label: 'With friends', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '真有意思！我也要试试。', english: 'How interesting! I want to try it too.' }, end: true },
          bye2: { npc: { hanzi: '好！我们下周一起去吧！', english: "Good! Let's go together next week!" }, end: true },
        },
      },

      // ───────────────────────── Directions (左, 右, 前面, 门口, 路) ─────────────────────────
      {
        id: 'hotelway', title: 'Which way is the hotel?',
        slots: { dir: [{ hanzi: '左', en: 'left' }, { hanzi: '右', en: 'right' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '请问，去酒店怎么走？', english: 'Excuse me, how do I get to the hotel?' }, goal: 'Tell Xiao Li to go straight ahead first.', tip: '往前走 = go forward.',
            replies: [{ say: ['往前走', '你往前走', '请往前走', '往前走，过去就是那间酒店'], en: 'Go straight ahead.', next: 'n2' }] },
          n2: { npc: { hanzi: '好。再往哪儿走？', english: 'OK. Where next?' }, goal: 'Tell him to turn {dir.en}.', tip: '往 + direction + 走: 往{dir}走. (左 = left, 右 = right)',
            replies: [{ say: ['再往{dir}走', '往{dir}走', '往{dir}'], en: 'Turn {dir.en}.', next: 'n3' }] },
          n3: { npc: { hanzi: '远吗？', english: 'Is it far?' }, goal: 'Say that it is not far — the hotel is in front of the metro.', tip: '不远 = not far; 前面 = in front; 酒店在地铁站前面.',
            replies: [
              { say: ['不远，酒店在地铁站前面', '不远，就在前面', '不远'], en: "Not far — it's in front of the metro station.", label: 'Not far', next: 'n4' },
              { say: ['有一点远', '有点远', '有点儿远'], en: "It's a bit far.", label: 'A bit far', next: 'n4' },
            ] },
          n4: { npc: { hanzi: '谢谢你！我路上小心。', english: "Thank you! I'll be careful on the way." }, goal: 'Say you are welcome.', tip: '不客气.',
            replies: [{ say: ['不客气', '没关系'], en: "You're welcome.", next: 'bye' }] },
          bye: { npc: { hanzi: '再见！', english: 'Bye!' }, end: true },
        },
      },

      // ───────────────────────── Come down! (楼, 下来, 上去, 过来) ─────────────────────────
      {
        id: 'downstairs', title: 'I am downstairs',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我在楼下。你能下来吗？', english: "I'm downstairs. Can you come down?" }, goal: 'Say that you are coming down — or ask him to come up.', tip: '下来 = come down; 上来 = come up. 来 + direction.',
            replies: [
              { say: ['好，我下来', '好，我就下来', '我下来'], en: "OK, I'm coming down.", label: 'Come down', next: 'n2a' },
              { say: ['你上来吧', '请你上来', '你上来'], en: 'You come up.', label: 'Come up', next: 'n2b' },
              { say: ['你站在门口等我，我下去', '我下去，你在门口等', '好，我出来了'], en: "Wait at the door — I'll go down.", label: 'Go down', next: 'n2a' },
            ] },
          n2a: { npc: { hanzi: '好！我在门口等你。', english: "OK! I'll wait for you at the door." }, goal: 'Say you will be right there.', tip: '就来 = "coming right away".',
            replies: [{ say: ['我就来', '我就来了', '我来了', '我上去拿包，就下来'], en: "I'm coming right away.", next: 'bye1' }] },
          n2b: { npc: { hanzi: '你家在几楼？', english: 'Which floor are you on?' }, goal: 'Say you live on the third floor.', tip: '楼 = floor: 三楼.',
            replies: [{ say: ['我家在三楼', '三楼', '在三楼'], en: "I'm on the third floor.", next: 'bye2' }] },
          bye1: { npc: { hanzi: '好，一会儿见！', english: 'OK, see you in a moment!' }, end: true },
          bye2: { npc: { hanzi: '好，我上去了！', english: "OK, I'm going up!" }, end: true },
        },
      },

      // ───────────────────────── Colours and flowers (颜色, 花, 鸟, 绿色…) ─────────────────────────
      {
        id: 'colours', title: 'My favourite colour',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看，那只鸟多漂亮！你喜欢什么颜色？', english: 'Look, what a pretty bird! What colour do you like?' }, goal: 'Say which colour you like: red, green, white or black.', tip: '颜色 = colour; 我喜欢 + colour (红色 red, 绿色 green, 白色 white, 黑色 black).',
            replies: [
              { say: ['我喜欢红色', '红色'], en: 'I like red.', label: 'Red', next: 'n2' },
              { say: ['我喜欢绿色', '绿色'], en: 'I like green.', label: 'Green', next: 'n2' },
              { say: ['我喜欢白色', '白色'], en: 'I like white.', label: 'White', next: 'n2' },
              { say: ['我喜欢黑色', '黑色'], en: 'I like black.', label: 'Black', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '为什么喜欢这个颜色？', english: 'Why do you like this colour?' }, goal: 'Say that it looks nice — or that you like it on the bird.', tip: '好看 = good-looking; 花 = flower; 鸟 = bird.',
            replies: [
              { say: ['因为很好看', '很好看', '因为好看'], en: 'Because it looks nice.', label: 'Looks nice', next: 'bye' },
              { say: ['鸟很好看', '这只鸟的颜色很好看', '因为我喜欢花和鸟'], en: 'The bird looks lovely.', label: 'The bird', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '真好！我们一起去看花吧！', english: "Lovely! Let's go and look at flowers together!" }, end: true },
        },
      },

      // ───────────────────────── Tallest (个子, 高, 最, 比) ─────────────────────────
      {
        id: 'tallest', title: 'Who is the tallest?',
        slots: { who: [{ hanzi: '小明', en: 'Xiao Ming' }, { hanzi: '哥哥', en: 'my brother' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你的个子真高！你比我高多了。', english: "You're so tall! You're much taller than me." }, goal: 'Say that {who.en} is taller than you.', tip: 'A 比 B 高 = "A is taller than B": {who}比我高.',
            replies: [{ say: ['{who}比我高', '{who}的个子比我高', '我们班{who}比我高'], en: '{who.en} is taller than me.', next: 'n2' }] },
          n2: { npc: { hanzi: '真的？那你们家谁的个子最高？', english: 'Really? So who is the tallest in your family?' }, goal: 'Say that {who.en} is the tallest.', tip: '最 = most: 最高 = tallest.',
            replies: [{ say: ['{who}的个子最高', '{who}最高', '{who}是我家个子最高的'], en: '{who.en} is the tallest.', next: 'n3' }] },
          n3: { npc: { hanzi: '我家爸爸的个子最高。你喜欢高个子吗？', english: 'In my family Dad is the tallest. Do you like tall people?' }, goal: 'Say yes — or that it makes no difference.', tip: '没关系 = it doesn\'t matter.',
            replies: [
              { say: ['喜欢，高个子很好', '喜欢'], en: 'Yes, I like tall people.', label: 'Yes', next: 'bye' },
              { say: ['没关系，高不高都好', '没关系'], en: "It doesn't matter.", label: "Doesn't matter", next: 'bye' },
            ] },
          bye: { npc: { hanzi: '哈哈，我也是！', english: 'Haha, me too!' }, end: true },
        },
      },

      // ───────────────────────── Hobbies and travel (爱好, 经常, 旅游, 外国) ─────────────────────────
      {
        id: 'travelhobby', title: 'Travel and hobbies',
        slots: { where: [{ hanzi: '北京', en: 'Beijing' }, { hanzi: '外国', en: 'abroad' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你有什么爱好？', english: 'What are your hobbies?' }, goal: 'Say that your hobby is travelling.', tip: '爱好 = hobby; 旅游 = travel: 我的爱好是旅游.',
            replies: [{ say: ['我的爱好是旅游', '我爱好旅游', '我喜欢旅游'], en: 'My hobby is travelling.', next: 'n2' }] },
          n2: { npc: { hanzi: '真好！你经常去哪儿旅游？', english: 'Nice! Where do you often travel to?' }, goal: 'Say that you often go to {where.en}.', tip: '经常 = often: 我经常去{where}旅游.',
            replies: [{ say: ['我经常去{where}旅游', '我经常去{where}', '我也想去外国旅游'], en: 'I often go to {where.en}.', next: 'n3' }] },
          n3: { npc: { hanzi: '什么时候开始的？', english: 'When did that start?' }, goal: 'Say that you started when you were little.', tip: '开始 = begin: 小时候开始的.',
            replies: [
              { say: ['我小时候开始的', '小时候开始的', '过年的时候开始的'], en: 'It started when I was little.', label: 'Little', next: 'bye' },
              { say: ['去年开始的', '我去年开始的'], en: 'It started last year.', label: 'Last year', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '太有意思了！下次你跟我一起去吧。', english: 'How interesting! Take me along next time.' }, end: true },
        },
      },

      // ───────────────────────── Birthday (生日, 送, 快乐, 准备) ─────────────────────────
      {
        id: 'birthday', title: 'It is my birthday!',
        slots: { gift: [{ hanzi: '花', en: 'flowers' }, { hanzi: '书', en: 'a book' }, { hanzi: '蛋糕', en: 'a cake' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你知道吗？明天是我的生日！', english: 'Guess what? Tomorrow is my birthday!' }, goal: 'Wish Xiao Li a happy birthday.', tip: '生日快乐 = happy birthday.',
            replies: [{ say: ['生日快乐', '小李，生日快乐', '你生日快乐'], en: 'Happy birthday!', next: 'n2' }] },
          n2: { npc: { hanzi: '谢谢！你送我什么？', english: 'Thanks! What will you give me?' }, goal: 'Say that you give him {gift.en}.', tip: '送 = give as a gift: 我送你{gift}.',
            replies: [{ say: ['我送你{gift}', '我送你{gift}，生日快乐', '我准备了{gift}送你'], en: "I'll give you {gift.en}.", next: 'n3' }] },
          n3: { npc: { hanzi: '太好了！我准备请朋友来家里。你来吗？', english: 'Great! I am getting ready to invite friends over. Will you come?' }, goal: 'Say that you will certainly come — or that you are sorry, you cannot.', tip: '一定 isn\'t needed: 我去 / 对不起，我不能去.',
            replies: [
              { say: ['我去', '好，我去', '我会去', '我去，这周我有时间'], en: "I'll come.", label: 'Come', next: 'bye1' },
              { say: ['对不起，我不能去', '不好意思，我不能去'], en: "Sorry, I can't.", label: "Can't", next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '太好了！明天见！', english: 'Great! See you tomorrow!' }, end: true },
          bye2: { npc: { hanzi: '没关系，下次吧。', english: "That's OK, next time." }, end: true },
        },
      },

      // ───────────────────────── Not feeling well (身体, 舒服, 头, 疼, 药, 药店) ─────────────────────────
      {
        id: 'unwell', title: 'You do not look well',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你怎么了？你看起来不舒服。', english: "What's wrong? You don't look well." }, goal: 'Say that your head hurts — or that you just feel unwell.', tip: '疼 = hurt: 我头疼 / 我不舒服 (舒服 = comfortable).',
            replies: [
              { say: ['我头疼', '我头很疼', '我的头很疼', '我眼睛疼', '我的眼睛很疼'], en: 'I have a headache.', label: 'Head', next: 'n2' },
              { say: ['我不舒服', '我身体不舒服'], en: 'I feel unwell.', label: 'Unwell', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '你要去药店买药吗？', english: 'Do you want to go to the pharmacy and buy medicine?' }, goal: 'Say that you will go — or that you will rest at home.', tip: '药 = medicine; 药店 = pharmacy; 休息 = rest.',
            replies: [
              { say: ['好，我去药店买药', '我去药店买药', '我去药店'], en: "I'll go to the pharmacy.", label: 'Pharmacy', next: 'bye1' },
              { say: ['我在家休息', '我想在家休息', '我想回去休息'], en: "I'll rest at home.", label: 'Rest', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好，快去吧。多喝水！', english: 'Good, off you go. Drink lots of water!' }, end: true },
          bye2: { npc: { hanzi: '好，多休息，多喝水！', english: 'Good, rest a lot and drink lots of water!' }, end: true },
        },
      },

      // ───────────────────────── New trousers (条, 裤子, 颜色, 黑色, 商场) ─────────────────────────
      {
        id: 'trousers', title: 'New trousers',
        slots: { col: [{ hanzi: '黑色', en: 'black' }, { hanzi: '白色', en: 'white' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我想去商场买一条裤子。', english: 'I want to go to the mall and buy a pair of trousers.' }, goal: 'Ask him what colour he wants.', tip: '什么颜色？ 条 is the measure word for trousers.',
            replies: [{ say: ['你想买什么颜色的', '什么颜色', '你要什么颜色的'], en: 'What colour do you want?', next: 'n2' }] },
          n2: { npc: { hanzi: '我想要{col}的。你觉得怎么样？', english: 'I want {col.en} ones. What do you think?' }, goal: 'Say that {col.en} is good — or that they would look better in another colour.', tip: '好看 = good-looking.',
            replies: [
              { say: ['{col}的很好看', '{col}很好', '好看', '这条裤子很好看'], en: '{col.en} looks good.', label: 'Good', next: 'bye1' },
              { say: ['我觉得别的颜色好看', '别的颜色好看'], en: 'I think another colour looks better.', label: 'Another colour', next: 'bye2' },
              { say: ['这条裤子太长了', '太长了'], en: 'The trousers are too long.', label: 'Too long', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好，那我就买{col}的！', english: "OK, then I'll buy {col.en}!" }, end: true },
          bye2: { npc: { hanzi: '哦？好，那我们一起去看看。', english: "Oh? OK, let's go and look together." }, end: true },
        },
      },

      // ───────────────────────── The bus stop (公交车, 车站, 旁边, 后面, 右边, 离, 近) ─────────────────────────
      {
        id: 'busstop', title: 'Where is the bus stop?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '请问，公交车站在哪儿？', english: 'Excuse me, where is the bus stop?' }, goal: 'Tell Xiao Li it is next to the mall — or behind the bank.', tip: '旁边 = beside; 后面 = behind: 在商场旁边 / 在银行后面.',
            replies: [
              { say: ['在商场旁边', '车站在商场旁边', '公交车站在商场旁边'], en: "It's next to the mall.", label: 'Next to the mall', next: 'n2' },
              { say: ['在银行后面', '车站在银行后面', '公交车站在银行后面'], en: "It's behind the bank.", label: 'Behind the bank', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '离这儿远吗？', english: 'Is it far from here?' }, goal: 'Say that it is not far, it is close.', tip: '离 = away from; 近 = near: 离这儿很近.',
            replies: [
              { say: ['不远，离这儿很近', '离这儿很近', '很近', '很近，走这条路就到'], en: 'Not far — close to here.', label: 'Close', next: 'n3' },
              { say: ['有点远，坐公交车吧', '有点远'], en: "It's a bit far.", label: 'Far', next: 'n3' },
            ] },
          n3: { npc: { hanzi: '好的。我是从机场回来的，东西很多。', english: "OK. I'm coming back from the airport and have a lot of things." }, goal: 'Say that you can help — carry it.', tip: '拿 = carry/take: 我帮你拿.',
            replies: [{ say: ['我帮你拿', '我来帮你拿', '我帮你拿吧'], en: "I'll help you carry it.", next: 'bye' }] },
          bye: { npc: { hanzi: '谢谢你！你真好！', english: "Thank you! You're so kind!" }, end: true },
        },
      },

      // ───────────────────────── Teach me (教, 懂, 别, 不好意思, 完) ─────────────────────────
      {
        id: 'teachme', title: 'Teach me',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '不好意思，你可以教我这个字吗？', english: 'Excuse me, can you teach me this character?' }, goal: 'Say sure, and ask him to show you which one.', tip: '可以 = can; 哪个 = which.',
            replies: [{ say: ['可以，哪个字', '好，哪个字', '可以，是哪个', '好，你过来', '可以，你要知道什么意思'], en: 'Sure — which character?', next: 'n2' }] },
          n2: { npc: { hanzi: '这个！我还是不懂。', english: "This one! I still don't understand." }, goal: 'Say do not worry, and you will explain it slowly.', tip: '没关系 = no problem. 慢 = slow: 我慢慢说.',
            replies: [
              { say: ['没关系，我慢慢说', '我慢慢说', '好，我慢慢说', '这样写，不是那样写'], en: "No problem, I'll explain slowly.", label: 'Explain', next: 'n3' },
              { say: ['我也不懂', '对不起，我也不懂'], en: "I don't understand it either.", label: "Don't know", next: 'bye2' },
            ] },
          n3: { npc: { hanzi: '我懂了！你教完了吗？', english: 'I get it! Have you finished teaching me?' }, goal: 'Say that you have finished.', tip: '完 = finished: 教完了.',
            replies: [{ say: ['教完了', '我教完了', '完了'], en: "I've finished.", next: 'bye1' }] },
          bye1: { npc: { hanzi: '谢谢你！你是我的好老师。', english: "Thank you! You're my good teacher." }, end: true },
          bye2: { npc: { hanzi: '没关系，我们问老师吧。', english: "No problem, let's ask the teacher." }, end: true },
        },
      },

      // ───────────────────────── Weather outside (外面, 晴, 阴, 门, 打开) ─────────────────────────
      {
        id: 'outside', title: 'How is it outside?',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你看一下外面，天气怎么样？', english: 'Take a look outside — how is the weather?' }, goal: 'Say that it is sunny outside — or cloudy.', tip: '外面 = outside; 晴 = sunny, 阴 = cloudy: 外面是晴天.',
            replies: [
              { say: ['外面是晴天', '外面晴了', '外面是晴的'], en: "It's sunny outside.", label: 'Sunny', next: 'n2' },
              { say: ['外面是阴天', '外面阴了', '外面是阴的'], en: "It's cloudy outside.", label: 'Cloudy', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '那我们出去走走，好吗？', english: "Then shall we go out for a walk?" }, goal: 'Say good — and ask him to open the door — or that you would rather stay in.', tip: '打开 = open; 门 = door: 请打开门. 动 = move: 我想动一动.',
            replies: [
              { say: ['好，请打开门', '请打开门', '好，我打开门'], en: 'Good — please open the door.', label: 'Open the door', next: 'bye1' },
              { say: ['好，我想动一动', '好，我也想动一动'], en: 'Good, I want to move around a bit.', label: 'Move a bit', next: 'bye1' },
              { say: ['不去了，外面太冷', '我不想出去'], en: "No, I don't want to go out.", label: 'Stay in', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '好！我们走吧！', english: "OK! Let's go!" }, end: true },
          bye2: { npc: { hanzi: '好吧，那我们在家看电视。', english: "OK, then let's watch TV at home." }, end: true },
        },
      },

      // ───────────────────────── Waking up (起来, 床, 得, 慢) ─────────────────────────
      {
        id: 'wakeup', title: 'Getting up',
        slots: { t: [{ hanzi: '六点', en: 'six o\'clock' }, { hanzi: '七点', en: 'seven o\'clock' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你每天几点起来？', english: 'What time do you get up every day?' }, goal: 'Say that you get up at {t.en}.', tip: '起来 = get up (起床 too): 我{t}起来.',
            replies: [{ say: ['我{t}起来', '我每天{t}起来', '我{t}起床'], en: 'I get up at {t.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '你起来得真早！我起来得很晚。', english: 'You get up so early! I get up very late.' }, goal: 'Say that you go to bed early too — or that you sleep well.', tip: 'Verb + 得 + adjective: 睡得很好 = sleep well.',
            replies: [
              { say: ['我睡得很早', '我也睡得早', '我睡得早'], en: 'I go to bed early.', label: 'Early bed', next: 'bye' },
              { say: ['我睡得很好', '我睡得好'], en: 'I sleep well.', label: 'Sleep well', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '我也要早一点睡！', english: 'I should go to bed a bit earlier too!' }, end: true },
        },
      },

      // ───────────────────────── Compliments (得, 说得, 学得, 快, 慢) ─────────────────────────
      {
        id: 'goodchinese', title: 'You speak so well',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你的中文说得真好！', english: 'You speak Chinese so well!' }, goal: 'Say thank you, but you do not speak it very well.', tip: '说得不太好 = "don\'t speak very well": verb + 得 + comment.',
            replies: [
              { say: ['谢谢，我说得不太好', '我说得不太好', '哪里，我说得不好'], en: "Thanks, I don't speak very well.", label: 'Modest', next: 'n2' },
              { say: ['谢谢，我学得很快', '我学得很快'], en: 'Thanks, I learn quickly.', label: 'Proud', next: 'n2' },
            ] },
          n2: { npc: { hanzi: '你学中文学了多长时间？', english: 'How long have you studied Chinese?' }, goal: 'Say about one year.', tip: '一年 = one year.',
            replies: [{ say: ['学了一年', '我学了一年', '一年'], en: 'For a year.', label: 'A year', next: 'n3' }, { say: ['学了两年', '我学了两年', '两年'], en: 'For two years.', label: 'Two years', next: 'n3' }] },
          n3: { npc: { hanzi: '太好了！慢慢学就好。', english: "Great! Just study slowly." }, goal: 'Say that you will study every day.', tip: '每天 = every day.',
            replies: [{ say: ['我每天学', '我每天学习', '我每天都学'], en: 'I study every day.', next: 'bye' }] },
          bye: { npc: { hanzi: '好好学！', english: 'Study well!' }, end: true },
        },
      },
    ],
  };
  // every talkable NPC registers its conversation set here: MSC.data.chats[npcId] = { npc, xpTurn, xpFinish, lines, dialogues }
  MSC.data.chats = MSC.data.chats || {};
  MSC.data.chats[MSC.data.chat.npc.id] = MSC.data.chat;
})(window.MSC = window.MSC || {});

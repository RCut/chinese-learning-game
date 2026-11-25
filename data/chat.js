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
          n3a: { npc: { hanzi: '太好了！我们一起{hobby}吧？', english: "Great! Shall we {hobby.en} together?" }, goal: 'Agree enthusiastically.', tip: '"Great!" is 太 + 好 + 了.',
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
          n4b: { npc: { hanzi: '你和谁一起去？', english: 'Who are you going with?' }, goal: 'Say that you are going with a friend.', tip: '和 + person + 一起 + verb.',
            replies: [{ say: ['我和朋友一起去', '我和朋友去'], en: "I'm going with a friend.", next: 'bye' }] },
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
          n3b: { npc: { hanzi: '你下午有时间吗？', english: 'Do you have time this afternoon?' }, goal: 'Say that you have time.', tip: '有 + 时间.',
            replies: [{ say: ['我有时间'], en: 'I have time.', next: 'bye2' }] },
          bye1: { npc: { hanzi: '太好了！你快来吧！', english: 'Great! Come quickly!' }, end: true },
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
          n3: { npc: { hanzi: '早上你吃什么？', english: 'What do you eat in the morning?' }, goal: 'Say what you eat in the morning: eggs or noodles.', tip: '我吃 + food.',
            replies: [
              { say: ['我吃鸡蛋', '我(早上)吃鸡蛋'], en: 'I eat eggs.', label: 'Eggs', next: 'bye' },
              { say: ['我吃面条', '我(早上)吃面条'], en: 'I eat noodles.', label: 'Noodles', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '是吗？我们一起去吃吧。明天再见！', english: "Really? Let's go and eat together. See you tomorrow!" }, end: true },
        },
      },

      // ───────────────────────── 13. Ordering at a café (Xiao Li starts) ─────────────────────────
      {
        id: 'cafe', title: 'Ordering a drink',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你想喝什么？水、茶还是牛奶？', english: 'What would you like to drink? Water, tea or milk?' }, goal: 'Say what you would like — and say "please".', tip: '请 (please) + 给我 (give me) + 一杯 (one cup) + drink.',
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
          n2: { npc: { hanzi: '好！星期六上午你有时间吗？', english: 'Good! Do you have time on Saturday morning?' }, goal: 'Say that you have time — or that you are busy on Saturday.', tip: '星期 + number is the day of the week: 星期六 = Saturday.',
            replies: [
              { say: ['我有时间'], en: 'I have time.', label: 'Have time', next: 'n3a' },
              { say: ['我很忙', '我星期六很忙'], en: "I'm busy.", label: 'Busy', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！中国商店星期六上午开。那个时候我们一起去。', english: "Great! The Chinese shop opens on Saturday morning. We'll go together then." }, goal: 'Say OK, you would like to go.', tip: '想去 = would like to go.',
            replies: [{ say: ['好的，我想去', '我想去'], en: "OK, I'd like to go.", next: 'bye1' }] },
          n3b: { npc: { hanzi: '没关系！那星期日呢？', english: 'No problem! What about Sunday?' }, goal: 'Say that you have time on Sunday.', tip: '星期日 = Sunday.',
            replies: [{ say: ['星期日我有时间', '我星期日有时间', '星期日有时间'], en: 'I have time on Sunday.', next: 'bye2' }] },
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
          bye1: { npc: { hanzi: '没关系，我等你！', english: "No problem, I'll wait for you!" }, end: true },
          bye2: { npc: { hanzi: '没关系，你在学校等我吧。', english: 'No problem — wait for me at school.' }, end: true },
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
          n3: { npc: { hanzi: '谢谢！你家有鱼吗？', english: 'Thanks! Do you have a fish at home?' }, goal: 'Say that you have a fish — or that you do not.', tip: '有 / 没有 + thing.',
            replies: [
              { say: ['我有鱼', '我家有鱼'], en: 'I have a fish.', label: 'Yes', next: 'bye1' },
              { say: ['我没有鱼', '我家没有鱼'], en: "I don't have a fish.", label: 'No', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '真好！我喜欢鱼！', english: 'Lovely! I like fish!' }, end: true },
          bye2: { npc: { hanzi: '没关系！再见！', english: 'No problem! Bye!' }, end: true },
        },
      },
    ],
  };
  // every talkable NPC registers its conversation set here: MSC.data.chats[npcId] = { npc, xpTurn, xpFinish, lines, dialogues }
  MSC.data.chats = MSC.data.chats || {};
  MSC.data.chats[MSC.data.chat.npc.id] = MSC.data.chat;
})(window.MSC = window.MSC || {});

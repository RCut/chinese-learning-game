/*
 * CHAT — Xiao Ming (小明) and his family at home: Dad, Mum, his older sister and his younger brother.
 * Same format and engine as data/chat.js; each set has `family: true` (finishing any of them counts for the level-1 "family" task).
 * Level 1 content: HSK 1 words only, plus 小明 and a couple of everyday extras (欢迎, 你好).
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.chats = MSC.data.chats || {};
  const lines = {
    notUnderstood: { hanzi: '对不起，我没有听见。你可以再说吗？', english: "Sorry, I didn't hear that. Can you say it again?" },
    tonesOff: { hanzi: '我差不多听懂了！但是你的声调有一点不一样。', english: 'I almost understood! But your tones are a little different.' },
  };
  const set = (npc, dialogues) => ({ npc, family: true, xpTurn: 8, xpFinish: 20, lines, dialogues });

  // ───────────────────────────────────────── Xiao Ming ─────────────────────────────────────────
  MSC.data.chats.xiaoming = set({ id: 'xiaoming', name: 'Xiao Ming', hanzi: '小明', blurb: 'Your friend: he shows you his home and his family' }, [
    // 1. Welcome (Xiao Ming starts)
    {
      id: 'welcome', title: 'Welcome to my home',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你好！欢迎！请坐。', english: 'Hello! Welcome! Please sit down.' }, goal: 'Thank Xiao Ming and say his home is beautiful — or ask where you should sit.', tip: '你家 = "your home"; 真 / 很 + 漂亮. Where = 哪儿: 我坐哪儿？',
          replies: [
            { say: ['谢谢，你家[很|真]漂亮', '你家[很|真]漂亮'], en: 'Thanks, your home is beautiful.', label: 'Compliment', next: 'n2a' },
            { say: ['谢谢，我坐哪儿', '我坐哪儿'], en: 'Thanks — where shall I sit?', label: 'Where to sit', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '谢谢！你想喝什么？我们家有茶，也有水。', english: 'Thanks! What would you like to drink? We have tea, and water too.' }, goal: 'Say what you would like to drink: tea or water.', tip: '我想喝… = "I would like to drink …".',
          replies: [
            { say: ['我[想|要]喝茶', '茶，谢谢'], en: 'I would like tea.', label: 'Tea', next: 'n3' },
            { say: ['我[想|要]喝水', '水，谢谢'], en: 'I would like water.', label: 'Water', next: 'n3' },
          ] },
        n2b: { npc: { hanzi: '你坐这儿吧。你想喝什么？我们家有茶，也有水。', english: 'Sit here. What would you like to drink? We have tea, and water too.' }, goal: 'Say what you would like to drink: tea or water.', tip: '我想喝… = "I would like to drink …".',
          replies: [
            { say: ['我[想|要]喝茶', '茶，谢谢'], en: 'I would like tea.', label: 'Tea', next: 'n3' },
            { say: ['我[想|要]喝水', '水，谢谢'], en: 'I would like water.', label: 'Water', next: 'n3' },
          ] },
        n3: { npc: { hanzi: '好，给你。', english: 'OK, here you are.' }, goal: 'Say thank you to Xiao Ming.', tip: 'Thank you: 谢谢. Add 你 or his name if you like.',
          replies: [{ say: ['谢谢(你)', '谢谢，小明', '小明，谢谢(你)'], en: 'Thank you.', next: 'bye' }] },
        bye: { npc: { hanzi: '不客气！你是我的好朋友。', english: "You're welcome! You're my good friend." }, end: true },
      },
    },

    // 2. Meet my family (YOU start)
    {
      id: 'family', title: 'Meet my family',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Xiao Ming how many people there are in his family.', tip: '几 asks "how many" (small numbers); 口 counts family members: 你家有几口人？',
          replies: [{ say: ['你家有几口人'], en: 'How many people are in your family?', next: 'n2' }] },
        n2: { npc: { hanzi: '我家有五口人：爸爸、妈妈、姐姐、弟弟和我。我没有妹妹。', english: 'Five: Dad, Mum, my older sister, my younger brother and me. I have no younger sister.' }, goal: 'Point at someone and ask: is this his dad — or his older sister?', tip: 'A yes/no question just adds 吗: 这是你爸爸吗？',
          replies: [
            { say: ['这是你爸爸吗', '那是你爸爸吗'], en: 'Is this your dad?', label: 'His dad?', next: 'n3a' },
            { say: ['这是你姐姐吗', '那是你姐姐吗'], en: 'Is this your older sister?', label: 'His sister?', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '对，这是我爸爸。他是医生，工作很忙。', english: "Yes, this is my dad. He's a doctor; his work is very busy." }, goal: 'Ask whether they are all at home today.', tip: '都 ("all") goes before the verb; 在家 = "at home": 他们今天都在家吗？',
          replies: [{ say: ['他们(今天)都在家吗', '今天他们都在家吗'], en: 'Are they all at home today?', next: 'n4' }] },
        n3b: { npc: { hanzi: '对，那是我姐姐。她是中学生，非常喜欢学习。', english: "Yes, that's my older sister. She's at secondary school and loves studying." }, goal: 'Ask whether they are all at home today.', tip: '都 ("all") goes before the verb; 在家 = "at home": 他们今天都在家吗？',
          replies: [{ say: ['他们(今天)都在家吗', '今天他们都在家吗'], en: 'Are they all at home today?', next: 'n4' }] },
        n4: { npc: { hanzi: '都在家！今天星期天，大家都在家休息。', english: "They're all here! It's Sunday, so everyone is resting at home." }, goal: 'Say that you would like to meet them.', tip: '认识 = "to get to know, meet": 我想认识他们.',
          replies: [{ say: ['我想认识他们', '(很好，)我想认识他们', '我想认识你的家人'], en: 'I would like to meet them.', next: 'bye' }] },
        bye: { npc: { hanzi: '好！我爸爸妈妈也想认识你！', english: 'Great! My mum and dad want to meet you too!' }, end: true },
      },
    },

    // 3. My room (Xiao Ming starts)
    {
      id: 'room', title: 'My room',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你看，这是我的房间。', english: 'Look, this is my room.' }, goal: 'Say that his room is big — or that it is small.', tip: '你的房间 + 很 + 大 / 小.',
          replies: [
            { say: ['你的房间很大', '你的房间真大'], en: 'Your room is big.', label: 'Big', next: 'n2a' },
            { say: ['你的房间很小', '你的房间真小'], en: 'Your room is small.', label: 'Small', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '谢谢！这是我的电脑，那些是我的书。', english: 'Thanks! This is my computer, and those are my books.' }, goal: 'Ask whether he likes reading books.', tip: '喜欢 + verb + 吗？ To read books: 看书.',
          replies: [{ say: ['你喜欢看书吗', '你喜欢读书吗'], en: 'Do you like reading?', next: 'n3' }] },
        n2b: { npc: { hanzi: '对，不大。我很喜欢它！', english: "Yes, it isn't big, but I really like it." }, goal: 'Ask whether he likes reading books.', tip: '喜欢 + verb + 吗？ To read books: 看书.',
          replies: [{ say: ['你喜欢看书吗', '你喜欢读书吗'], en: 'Do you like reading?', next: 'n3' }] },
        n3: { npc: { hanzi: '喜欢！我晚上看书，也在电脑上看电影。', english: 'Yes! In the evening I read, and I also watch films on my computer.' }, goal: 'Say that you like watching films too.', tip: '也 ("too") goes before the verb: 我也喜欢…',
          replies: [{ say: ['我也喜欢看电影'], en: 'I like watching films too.', next: 'bye' }] },
        bye: { npc: { hanzi: '那我们明天去电影院吧！', english: "Then let's go to the cinema tomorrow!" }, end: true },
      },
    },

    // 4. The cat (YOU start)
    {
      id: 'cat', title: 'Whose cat is this?',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Xiao Ming whose cat this is.', tip: 'Whose = 谁的: 这是谁的猫？',
          replies: [{ say: ['这是谁的猫', '那是谁的猫'], en: 'Whose cat is this?', next: 'n2' }] },
        n2: { npc: { hanzi: '它是我们的猫！它两岁了。', english: "It's our cat! It's two years old." }, goal: 'Ask what the cat likes to eat — or where it sleeps.', tip: 'It = 它. 它喜欢吃什么？ / 它在哪儿睡觉？',
          replies: [
            { say: ['它喜欢吃什么'], en: 'What does it like to eat?', label: 'Food', next: 'n3a' },
            { say: ['它在哪儿睡觉'], en: 'Where does it sleep?', label: 'Bed', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '它喜欢吃鸡蛋，也喜欢喝牛奶。', english: 'It likes eating eggs, and it likes drinking milk too.' }, goal: 'Say that the cat is very pretty.', tip: '它 + 很 / 真 + 漂亮.',
          replies: [{ say: ['它[很|真]漂亮', '你们的猫[很|真]漂亮'], en: 'It is very pretty.', next: 'bye' }] },
        n3b: { npc: { hanzi: '它在我的房间里睡觉，在我的椅子上！', english: 'It sleeps in my room — on my chair!' }, goal: 'Say that the cat is very pretty.', tip: '它 + 很 / 真 + 漂亮.',
          replies: [{ say: ['它[很|真]漂亮', '你们的猫[很|真]漂亮'], en: 'It is very pretty.', next: 'bye' }] },
        bye: { npc: { hanzi: '谢谢！它是我们家的小朋友。', english: "Thanks! It's our family's little friend." }, end: true },
      },
    },

    // 5. Getting up, going to bed (Xiao Ming starts)
    {
      id: 'day', title: 'Getting up and going to bed',
      slots: { t: [{ hanzi: '六点', en: 'six' }, { hanzi: '七点', en: 'seven' }, { hanzi: '八点', en: 'eight' }] },
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你早上几点起床？', english: 'What time do you get up in the morning?' }, goal: 'Say that you get up at {t.en} o’clock.', tip: 'The time goes BEFORE the verb: 我 + time + 起床.',
          replies: [{ say: ['我(早上){t}起床', '(早上){t}'], en: 'I get up at {t.en}.', next: 'n2' }] },
        n2: { npc: { hanzi: '{t}？我七点半起床。你晚上几点睡觉？', english: '{t.en}? I get up at half past seven. What time do you go to bed?' }, goal: 'Say that you go to bed at ten — or at eleven.', tip: '半 = "half past". 我 + time + 睡觉.',
          replies: [
            { say: ['我(晚上)十点睡觉'], en: 'I go to bed at ten.', label: 'Ten', next: 'n3a' },
            { say: ['我(晚上)十一点睡觉'], en: 'I go to bed at eleven.', label: 'Eleven', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '很好！我也十点睡觉。', english: 'Good! I go to bed at ten too.' }, goal: 'Say goodbye: see you tomorrow.', tip: 'See you tomorrow = 明天 + 见.',
          replies: [{ say: ['明天见', '明天再见', '再见，明天见'], en: 'See you tomorrow.', next: 'bye' }] },
        n3b: { npc: { hanzi: '十一点？太晚了！', english: 'Eleven? That is too late!' }, goal: 'Say goodbye: see you tomorrow.', tip: 'See you tomorrow = 明天 + 见.',
          replies: [{ say: ['明天见', '明天再见', '再见，明天见'], en: 'See you tomorrow.', next: 'bye' }] },
        bye: { npc: { hanzi: '明天见！', english: 'See you tomorrow!' }, end: true },
      },
    },
    // ── HSK 2 ──
    {
      id: 'washhands', title: 'Wash your hands!',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你过来！要吃饭了，快去洗手！', english: "Come here! We're about to eat — go and wash your hands!" }, goal: 'Say that you will go and wash your hands — or that you have already washed them.', tip: '洗手 = wash hands; 我去洗手. 已经…了 = already.',
          replies: [
            { say: ['好，我去洗手', '我去洗手'], en: "OK, I'll go and wash my hands.", label: 'Go wash', next: 'n2a' },
            { say: ['我已经洗了', '我已经洗手了'], en: "I've already washed them.", label: 'Already', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '洗好了吗？', english: 'All washed?' }, goal: 'Say that you have washed them.', tip: '好了 / 洗了 = done.',
          replies: [{ say: ['洗好了', '我洗好了', '洗了'], en: 'Done.', next: 'bye1' }] },
        n2b: { npc: { hanzi: '我没看见你去洗手！你的眼睛在哪儿？', english: "I didn't see you wash them! Where were your eyes?" }, goal: 'Say sorry, you will go and wash them.', tip: '对不起 + 我去洗.',
          replies: [{ say: ['对不起，我去洗手', '好吧，我去洗手', '我去洗手'], en: "Sorry, I'll go and wash.", next: 'bye2' }] },
        bye1: { npc: { hanzi: '好！现在可以吃饭了。', english: 'Good! Now we can eat.' }, end: true },
        bye2: { npc: { hanzi: '快去！', english: 'Quick, go!' }, end: true },
      },
    },
    {
      id: 'onthebed', title: 'Where is my cat?',
      slots: { col: [{ hanzi: '黑色', en: 'black' }, { hanzi: '白色', en: 'white' }] },
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '我的{col}书包不见了！你看见了吗？', english: "My {col.en} school bag is gone! Have you seen it?" }, goal: 'Say that it is on top of the bed — or underneath it.', tip: '上面 = on top; 下面 = underneath; 床 = bed: 在床上面 / 在床下面.',
          replies: [
            { say: ['在床上面', '书包在床上面', '在床上'], en: "It's on the bed.", label: 'On the bed', next: 'n2a' },
            { say: ['在床下面', '书包在床下面'], en: "It's under the bed.", label: 'Under the bed', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '真的！里面有我的书。谢谢你！', english: "It is! My books are inside. Thank you!" }, goal: 'Say that it is nothing.', tip: '不客气.',
          replies: [{ say: ['不客气', '没关系'], en: "You're welcome.", next: 'bye' }] },
        n2b: { npc: { hanzi: '哦，我看到了！猫在里面睡觉！', english: "Oh, I see it! The cat is asleep inside!" }, goal: 'Say that the cat is so pretty.', tip: '漂亮 = pretty.',
          replies: [{ say: ['猫很漂亮', '小猫很漂亮', '猫真漂亮'], en: 'The cat is so pretty.', next: 'bye' }] },
        bye: { npc: { hanzi: '我们一会儿再找别的东西吧。', english: "Let's look for the rest in a while." }, end: true },
      },
    },
  ]);

  // ───────────────────────────────────────── Dad ─────────────────────────────────────────
  MSC.data.chats.baba = set({ id: 'baba', name: 'Dad', hanzi: '爸爸', blurb: 'Xiao Ming’s dad, a busy doctor: talk about work' }, [
    // 1. Who are you? (Dad starts)
    {
      id: 'work', title: 'What do you do?',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你好！你是小明的朋友吧？', english: "Hello! You must be Xiao Ming's friend?" }, goal: 'Say yes: you are Xiao Ming’s friend.', tip: '的 links owner and thing: 小明的朋友 = "Xiao Ming\'s friend".',
          replies: [{ say: ['(对，)我是小明的朋友', '是，我是小明的朋友'], en: "Yes, I'm Xiao Ming's friend.", next: 'n2' }] },
        n2: { npc: { hanzi: '欢迎！你是学生吗？', english: 'Welcome! Are you a student?' }, goal: 'Say whether you are a student — or that you are not, you work.', tip: 'Yes: 我是学生. No: 我不是学生，我工作.',
          replies: [
            { say: ['(是，)我是学生'], en: "Yes, I'm a student.", label: 'Student', next: 'n3a' },
            { say: ['(不是，)我不是学生，我工作'], en: "No, I'm not a student — I work.", label: 'I work', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '很好！你在哪儿学习汉语？', english: 'Good! Where do you study Chinese?' }, goal: 'Say that you study Chinese at school.', tip: '在 + place + verb: 我在学校学习.',
          replies: [{ say: ['我在学校学习(汉语)'], en: 'I study Chinese at school.', next: 'n4' }] },
        n3b: { npc: { hanzi: '你在哪儿工作？', english: 'Where do you work?' }, goal: 'Say that you work at a company.', tip: '在 + place + verb: 我在公司工作.',
          replies: [{ say: ['我在公司工作'], en: 'I work at a company.', next: 'n4' }] },
        n4: { npc: { hanzi: '我在医院工作，我是医生。', english: "I work at a hospital. I'm a doctor." }, goal: 'Ask Dad whether his work is busy.', tip: 'Polite "you" for a friend’s parent: 您. 忙 = busy: 您工作忙吗？',
          replies: [{ say: ['[您|你](工作)忙吗', '医生忙吗'], en: 'Is your work busy?', next: 'bye' }] },
        bye: { npc: { hanzi: '很忙！今天星期天，我不上班，很高兴。', english: "Very busy! But today is Sunday, I'm not at work — I'm happy." }, end: true },
      },
    },

    // 2. Going to work (YOU start)
    {
      id: 'commute', title: 'Going to work',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Dad what time he goes to work.', tip: 'Time question: 几点 + verb: 您几点上班？',
          replies: [{ say: ['[您|你](早上)几点上班'], en: 'What time do you go to work?', next: 'n2' }] },
        n2: { npc: { hanzi: '我早上八点上班，下午五点下班。', english: 'I start work at eight in the morning and finish at five in the afternoon.' }, goal: 'Ask whether he drives to work — or takes a taxi.', tip: '开车 = drive; 坐出租车 = take a taxi. Add 吗 for a yes/no question.',
          replies: [
            { say: ['[您|你]开车上班吗'], en: 'Do you drive to work?', label: 'Drive', next: 'n3a' },
            { say: ['[您|你]坐出租车上班吗'], en: 'Do you take a taxi to work?', label: 'Taxi', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '对，我开车上班，二十分钟。', english: 'Yes, I drive to work — twenty minutes.' }, goal: 'Ask whether he goes to work tomorrow too.', tip: '也 ("too, also") goes before the verb: 您明天也上班吗？',
          replies: [{ say: ['[您|你]明天也上班吗', '明天[您|你]也上班吗'], en: 'Do you work tomorrow too?', next: 'bye' }] },
        n3b: { npc: { hanzi: '不，出租车很贵！我开车上班，二十分钟。', english: 'No, taxis are expensive! I drive — twenty minutes.' }, goal: 'Ask whether he goes to work tomorrow too.', tip: '也 ("too, also") goes before the verb: 您明天也上班吗？',
          replies: [{ say: ['[您|你]明天也上班吗', '明天[您|你]也上班吗'], en: 'Do you work tomorrow too?', next: 'bye' }] },
        bye: { npc: { hanzi: '明天星期一，我上班。今天我休息！', english: "Tomorrow is Monday, so I work. Today I'm resting!" }, end: true },
      },
    },

    // 3. The weather on TV (Dad starts)
    {
      id: 'weather', title: 'What did the TV say?',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '电视上说，今天天气怎么样？', english: "What did the TV say — what's the weather like today?" }, goal: 'Tell Dad what the forecast said: rain today — or cold today.', tip: '今天 + 下雨 (to rain), or 今天 + 很冷 (very cold).',
          replies: [
            { say: ['今天下雨', '(电视上说)今天下雨'], en: "It's raining today.", label: 'Rain', next: 'n2a' },
            { say: ['今天很冷', '(电视上说)今天很冷'], en: "It's cold today.", label: 'Cold', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '下雨了？那我们在家看电视吧。', english: "Raining? Then let's stay home and watch TV." }, goal: 'Say OK — you like watching TV.', tip: '好 = OK. 喜欢 + 看电视.',
          replies: [{ say: ['好，我喜欢看电视', '我喜欢看电视'], en: 'OK, I like watching TV.', next: 'bye' }] },
        n2b: { npc: { hanzi: '很冷？那你多穿衣服！', english: 'Cold? Then put on more clothes!' }, goal: 'Say thank you — you will wear more clothes.', tip: '多 + verb = "do more of it": 多穿衣服.',
          replies: [{ say: ['谢谢，我多穿衣服', '好，我多穿衣服'], en: "Thanks, I'll wear more clothes.", next: 'bye' }] },
        bye: { npc: { hanzi: '电视上说，明天天气很好！', english: 'The TV says the weather will be nice tomorrow!' }, end: true },
      },
    },
    // ── HSK 2 ──
    {
      id: 'grandpa', title: 'Grandpa is coming',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '下周爷爷要从北京过来！', english: 'Next week Grandpa is coming from Beijing!' }, goal: 'Say that you are happy — and ask how he is coming.', tip: '怎么来？= "how is he coming?"; 爷爷 = paternal grandfather.',
          replies: [{ say: ['太好了！爷爷怎么来', '太好了，他怎么来', '爷爷怎么来'], en: 'Great! How is he coming?', next: 'n2' }] },
        n2: { npc: { hanzi: '坐飞机。一个小时就到了。', english: 'By plane. It takes just an hour.' }, goal: 'Say that you will go to the airport with Dad.', tip: '跟 + person + 一起: 我跟你一起去机场.',
          replies: [
            { say: ['我跟你一起去机场', '我跟你去机场', '我跟你一起去'], en: "I'll go to the airport with you.", label: 'Go with Dad', next: 'n3a' },
            { say: ['我在家等爷爷', '我在家等'], en: "I'll wait for Grandpa at home.", label: 'Wait at home', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '好！我们打车去。', english: "Good! We'll go by taxi." }, goal: 'Say OK.', tip: '好的.',
          replies: [{ say: ['好的', '好', '好，谢谢爸爸'], en: 'OK.', next: 'bye' }] },
        n3b: { npc: { hanzi: '好。你想想，爷爷喜欢吃什么？', english: 'OK. Think — what does Grandpa like to eat?' }, goal: 'Say that he likes noodles.', tip: '喜欢吃 + food.',
          replies: [{ say: ['爷爷喜欢吃面条', '他喜欢吃面条', '面条'], en: 'He likes noodles.', next: 'bye' }] },
        bye: { npc: { hanzi: '好，爷爷来了，我们一起吃饭。', english: "Good — when he comes, we'll all eat together." }, end: true },
      },
    },
  ]);

  // ───────────────────────────────────────── Mum ─────────────────────────────────────────
  MSC.data.chats.mama = set({ id: 'mama', name: 'Mum', hanzi: '妈妈', blurb: 'Xiao Ming’s mum, a great cook: talk about food and meals' }, [
    // 1. Have you eaten? (Mum starts)
    {
      id: 'eaten', title: 'Have you eaten?',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你好！你吃饭了吗？', english: 'Hello! Have you eaten?' }, goal: 'Answer: you have eaten — or not yet.', tip: '吃了 = "have eaten". Not yet: 还没有吃.',
          replies: [
            { say: ['(我)吃了', '我吃饭了'], en: 'Yes, I have eaten.', label: 'Yes', next: 'n2a' },
            { say: ['(我)还没有吃(饭)'], en: "No, I haven't eaten yet.", label: 'Not yet', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '吃了？那你喝茶吧！', english: "You've eaten? Then have some tea!" }, goal: 'Say OK, thank you.', tip: '好 + 谢谢.',
          replies: [{ say: ['好，谢谢(您)', '谢谢(您)'], en: 'OK, thank you.', next: 'bye1' }] },
        n2b: { npc: { hanzi: '那你在我们家吃饭吧！有米饭，也有饺子。', english: 'Then eat with us! There is rice, and dumplings too.' }, goal: 'Say what you would like to eat: rice — or dumplings.', tip: '我想吃 + food.',
          replies: [
            { say: ['我想吃米饭', '米饭，谢谢'], en: "I'd like rice.", label: 'Rice', next: 'n3' },
            { say: ['我想吃饺子', '饺子，谢谢'], en: "I'd like dumplings.", label: 'Dumplings', next: 'n3' },
          ] },
        n3: { npc: { hanzi: '好！我现在做饭。', english: "Good! I'll cook now." }, goal: 'Thank Mum politely.', tip: 'Polite "you" = 您: 谢谢您.',
          replies: [{ say: ['谢谢(您)', '谢谢您，[您|你]做饭很好吃'], en: 'Thank you.', next: 'bye2' }] },
        bye1: { npc: { hanzi: '不客气，你坐吧。', english: "You're welcome — sit down." }, end: true },
        bye2: { npc: { hanzi: '不客气！多吃一点儿！', english: "You're welcome! Eat a little more!" }, end: true },
      },
    },

    // 2. Mealtimes (YOU start)
    {
      id: 'meals', title: 'When do you eat?',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Mum what time the family eats dinner.', tip: '晚饭 = dinner ("evening meal"). 你们几点吃晚饭？',
          replies: [{ say: ['你们几点吃晚饭', '(您)家几点吃晚饭'], en: 'What time do you eat dinner?', next: 'n2' }] },
        n2: { npc: { hanzi: '我们早上七点吃早饭，中午十二点吃午饭，晚上六点半吃晚饭。', english: 'We eat breakfast at seven, lunch at twelve noon and dinner at half past six.' }, goal: 'Ask what there is for dinner today.', tip: '今天晚上 + 吃什么？',
          replies: [{ say: ['今天晚上吃什么', '今天晚饭吃什么', '晚饭吃什么'], en: "What's for dinner tonight?", next: 'n3' }] },
        n3: { npc: { hanzi: '有鸡蛋、菜和米饭。你想在这儿吃吗？', english: 'Eggs, vegetables and rice. Would you like to eat here?' }, goal: 'Say yes, you would like to — or no thanks, you will eat at home.', tip: 'Yes: 想！ No: 不，谢谢 + 我回家吃.',
          replies: [
            { say: ['想，谢谢', '(好，)我想在这儿吃'], en: 'Yes please!', label: 'Yes', next: 'bye1' },
            { say: ['不，谢谢，我回家吃', '谢谢，我回家吃'], en: "No thanks, I'll eat at home.", label: 'No', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '好！六点半来吃晚饭！', english: 'Good! Come for dinner at half past six!' }, end: true },
        bye2: { npc: { hanzi: '好，那明天来吃吧！', english: 'OK, then come and eat tomorrow!' }, end: true },
      },
    },

    // 3. Fruit (Mum starts)
    {
      id: 'fruit', title: 'Do you like fruit?',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你喜欢吃水果吗？', english: 'Do you like fruit?' }, goal: 'Say that you like fruit very much — or that you don’t.', tip: '喜欢 / 不喜欢 + 吃水果.',
          replies: [
            { say: ['(我)很喜欢(吃水果)', '我喜欢吃水果'], en: 'I like it a lot.', label: 'Yes', next: 'n2a' },
            { say: ['我不喜欢(吃水果)'], en: "I don't like fruit.", label: 'No', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '给你一个苹果！', english: 'Here, have an apple!' }, goal: 'Say thank you — apples are delicious.', tip: '好吃 = "tasty" (good to eat).',
          replies: [{ say: ['谢谢，苹果很好吃', '谢谢(您)，[很|真]好吃'], en: 'Thank you, apples are delicious.', next: 'byeA' }] },
        n2b: { npc: { hanzi: '不喜欢？那你喝牛奶吧。', english: "No? Then have some milk." }, goal: 'Say OK, thank you.', tip: '好 + 谢谢.',
          replies: [{ say: ['好，谢谢(您)', '谢谢(您)'], en: 'OK, thank you.', next: 'byeB' }] },
        byeA: { npc: { hanzi: '不客气！我们家有很多水果。', english: "You're welcome! We have lots of fruit." }, end: true },
        byeB: { npc: { hanzi: '不客气！牛奶也很好！', english: "You're welcome! Milk is good too!" }, end: true },
      },
    },
    // 4. My children (Mum starts)
    {
      id: 'children', title: 'My children',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你认识我的孩子吗？', english: 'Do you know my children?' }, goal: 'Say that you know Xiao Ming — or ask how many children she has.', tip: '认识 = "to know (a person)". How many children: 您有几个孩子？',
          replies: [
            { say: ['我认识小明', '(认识，)我认识小明'], en: 'I know Xiao Ming.', label: 'Xiao Ming', next: 'n2a' },
            { say: ['[您|你]有几个孩子'], en: 'How many children do you have?', label: 'How many?', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '小明是我儿子。我还有一个儿子和一个女儿。', english: 'Xiao Ming is my son. I also have another son and a daughter.' }, goal: 'Say that her children are all very nice.', tip: '都 ("all") before 很: 您的孩子都很好.',
          replies: [{ say: ['[您|你]的孩子都很好', '他们都很好'], en: 'Your children are all lovely.', next: 'bye' }] },
        n2b: { npc: { hanzi: '三个：两个儿子，一个女儿。', english: 'Three: two sons and one daughter.' }, goal: 'Say that her children are all very nice.', tip: '都 ("all") before 很: 您的孩子都很好.',
          replies: [{ say: ['[您|你]的孩子都很好', '他们都很好'], en: 'Your children are all lovely.', next: 'bye' }] },
        bye: { npc: { hanzi: '谢谢！昨天他们都去学校了，今天都在家。', english: 'Thank you! Yesterday they were all at school; today they are all at home.' }, end: true },
      },
    },
    // ── HSK 2 ──
    {
      id: 'grandma', title: 'Grandma’s phone',
      slots: { col: [{ hanzi: '红色', en: 'red' }, { hanzi: '白色', en: 'white' }, { hanzi: '绿色', en: 'green' }] },
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '奶奶的手机坏了，她不能打电话。', english: "Grandma's phone is broken, so she can't make calls." }, goal: 'Ask Mum whether you can help.', tip: '帮忙 = help: 我可以帮忙吗？',
          replies: [{ say: ['我可以帮忙吗', '我能帮忙吗', '我可以帮你吗'], en: 'Can I help?', next: 'n2' }] },
          n2: { npc: { hanzi: '好！我们给她买一个新的。你说什么颜色好？', english: 'Good! Let us buy her a new one. What colour is best?' }, goal: 'Suggest a {col.en} one.', tip: '颜色 = colour: 买{col}的.',
          replies: [{ say: ['买{col}的', '{col}的好', '{col}'], en: 'A {col.en} one.', next: 'n3' }] },
        n3: { npc: { hanzi: '好。奶奶会很高兴。你要跟我去商店吗？', english: 'Good. Grandma will be very happy. Do you want to come to the shop with me?' }, goal: 'Say yes, you will go with her — or that you will stay and wash the dishes.', tip: '洗 = wash: 洗碗.',
          replies: [
            { say: ['好，我跟你去', '我跟你去'], en: "Yes, I'll go with you.", label: 'Go', next: 'bye1' },
            { say: ['我在家洗碗', '我洗碗'], en: "I'll stay and wash the dishes.", label: 'Wash up', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '走吧，我们快去快回。', english: "Let's go — there and back quickly." }, end: true },
        bye2: { npc: { hanzi: '你真好！谢谢你。', english: "You're so kind! Thank you." }, end: true },
      },
    },
  ]);

  // ───────────────────────────────────────── Older sister ─────────────────────────────────────────
  MSC.data.chats.jiejie = set({ id: 'jiejie', name: 'Older sister', hanzi: '姐姐', blurb: 'Xiao Ming’s older sister, a secondary-school student: talk about school' }, [
    // 1. School (YOU start)
    {
      id: 'school', title: 'Are you a student?',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Xiao Ming’s sister whether she is a student.', tip: 'Add 吗 to make a yes/no question: 你是学生吗？',
          replies: [{ say: ['你是学生吗'], en: 'Are you a student?', next: 'n2' }] },
        n2: { npc: { hanzi: '是，我是中学生。我早上七点上学。', english: "Yes, I'm at secondary school. I leave for school at seven in the morning." }, goal: 'Ask what she likes to study.', tip: '喜欢 + 学 + 什么？',
          replies: [{ say: ['你喜欢学什么', '你喜欢学习什么'], en: 'What do you like to study?', next: 'n3' }] },
        n3: { npc: { hanzi: '我喜欢学汉语和汉字。你呢？', english: 'I like studying Chinese and characters. And you?' }, goal: 'Say that you like Chinese too — or that you like reading.', tip: '我也喜欢… = "I like … too". 读书 = to read.',
          replies: [
            { say: ['我也喜欢(学)汉语', '我也喜欢学习汉语'], en: 'I like Chinese too.', label: 'Chinese', next: 'bye1' },
            { say: ['我喜欢读书'], en: 'I like reading.', label: 'Reading', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '我们都喜欢汉语！你的汉语很好！', english: 'We both like Chinese! Your Chinese is very good!' }, end: true },
        bye2: { npc: { hanzi: '读书很好！我也喜欢读书。', english: 'Reading is great! I like reading too.' }, end: true },
      },
    },

    // 2. My classmates (sister starts)
    {
      id: 'classmates', title: 'My classmates',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你看我的手机：这是我的老师，这些是我的同学。', english: 'Look at my phone: this is my teacher, and these are my classmates.' }, goal: 'Ask how many classmates she has.', tip: '多少 asks "how many" for bigger numbers: 你有多少(个)同学？',
          replies: [{ say: ['你有多少(个)同学', '你有几个同学'], en: 'How many classmates do you have?', next: 'n2' }] },
        n2: { npc: { hanzi: '我有四十个同学。', english: 'I have forty classmates.' }, goal: 'Say that is a lot — or ask whether her teacher is nice.', tip: '真多 / 很多 = "so many". 你的老师好吗？',
          replies: [
            { say: ['[真|很|非常]多'], en: "That's a lot!", label: 'So many', next: 'bye1' },
            { say: ['你的老师好吗', '你的老师怎么样'], en: 'Is your teacher nice?', label: 'Teacher', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '对，很多！他们都是我的朋友。', english: "Yes, lots! They're all my friends." }, end: true },
        bye2: { npc: { hanzi: '她很好！她是中国人，我们叫她王老师。', english: "She's lovely! She's Chinese; we call her Teacher Wang." }, end: true },
      },
    },

    // 3. Homework (sister starts)
    {
      id: 'homework', title: 'Writing characters',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '我现在正在写汉字。', english: "I'm writing characters right now." }, goal: 'Ask how many hours she is studying today.', tip: '几个小时 = "how many hours": 你今天学习几个小时？',
          replies: [{ say: ['你今天学习几个小时', '今天你学习几个小时'], en: 'How many hours are you studying today?', next: 'n2' }] },
        n2: { npc: { hanzi: '三个小时！明天上午有汉语课。', english: 'Three hours! Tomorrow morning I have a Chinese class.' }, goal: 'Say she is really busy — or tell her she should rest.', tip: '你真忙 = "you are really busy". 你要休息 = "you should rest".',
          replies: [
            { say: ['你[真|很]忙'], en: "You're really busy!", label: 'Busy', next: 'bye1' },
            { say: ['你要休息', '你[要|可以]休息(了)'], en: 'You should rest.', label: 'Rest', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '对，我很忙。下课了我想睡觉！', english: "Yes, I'm busy. After class I just want to sleep!" }, end: true },
        bye2: { npc: { hanzi: '好，我现在休息。我们看电视吧！', english: "OK, I'll rest now. Let's watch TV!" }, end: true },
      },
    },
    // ── HSK 2 ──
    {
      id: 'abroad', title: 'Studying abroad',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '我想出国学习。', english: 'I want to study abroad.' }, goal: 'Ask which country she wants to go to.', tip: '国家 = country; 哪个国家？',
          replies: [{ say: ['你想去哪个国家', '哪个国家', '你想去哪儿'], en: 'Which country do you want to go to?', next: 'n2' }] },
        n2: { npc: { hanzi: '可能去中国。机票要一万多块！', english: "Maybe China. The plane ticket is over ten thousand yuan!" }, goal: 'Say that it is so expensive — or that you hope she can go.', tip: '这么 + adjective = "so …"; 希望 = hope.',
          replies: [
            { say: ['这么贵', '这么贵啊'], en: "So expensive!", label: 'Expensive', next: 'n3a' },
            { say: ['希望你能去', '我希望你能去'], en: 'I hope you can go.', label: 'I hope so', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '是啊，但是我想去。我会好好学习。', english: "Yes, but I want to go. I'll study hard." }, goal: 'Say that you hope she can go.', tip: '希望你能去.',
          replies: [{ say: ['希望你能去', '我希望你能去'], en: 'I hope you can go.', next: 'bye' }] },
        n3b: { npc: { hanzi: '谢谢！我比去年学得好了。', english: "Thanks! I'm studying better than last year." }, goal: 'Say that she is very good.', tip: '你真好 / 你很好.',
          replies: [{ say: ['你真好', '你很好', '你真不错'], en: "You're great.", next: 'bye' }] },
        bye: { npc: { hanzi: '谢谢你，我会告诉你的。', english: "Thanks — I'll tell you about it." }, end: true },
      },
    },
  ]);

  // ───────────────────────────────────────── Younger brother ─────────────────────────────────────────
  MSC.data.chats.didi = set({ id: 'didi', name: 'Younger brother', hanzi: '弟弟', blurb: 'Xiao Ming’s little brother: games, TV and primary school' }, [
    // 1. Let's play (brother starts)
    {
      id: 'play', title: 'Let’s play!',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '你好！你和我玩，好吗？', english: 'Hi! Will you play with me?' }, goal: 'Say yes, let’s play — or ask what he wants to play.', tip: 'Yes: 好！ What do you want to play? = 你想玩什么？',
          replies: [
            { say: ['好(，我们玩吧)', '好，我和你玩'], en: "OK, let's play!", label: 'Yes', next: 'n2a' },
            { say: ['你想玩什么'], en: 'What do you want to play?', label: 'What?', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '太好了！我们在电脑上玩，非常好玩儿！', english: "Great! Let's play on the computer — it's so much fun!" }, goal: 'Ask where his computer is.', tip: 'Where is …? = … 在哪儿？',
          replies: [{ say: ['你的电脑在哪儿', '电脑在哪儿'], en: 'Where is your computer?', next: 'n3a' }] },
        n2b: { npc: { hanzi: '我想在电脑上玩。电脑在我的房间里。', english: 'I want to play on the computer. It is in my room.' }, goal: 'Say OK, let’s go to his room.', tip: '去 + place + 吧 = "let\'s go to …".',
          replies: [{ say: ['好，我们去你的房间吧', '我们去你的房间吧'], en: "OK, let's go to your room.", next: 'n3b' }] },
        n3a: { npc: { hanzi: '在我的房间里。你看，它很新！', english: "In my room. Look, it's new!" }, goal: 'Say his computer is really nice.', tip: '真 + 好 / 好看 = "really nice".',
          replies: [{ say: ['你的电脑[真|很]好(看)', '[真|很]好看'], en: 'Your computer is really nice!', next: 'bye' }] },
        n3b: { npc: { hanzi: '你看，这是我的电脑，它很新！', english: "Look, this is my computer — it's new!" }, goal: 'Say his computer is really nice.', tip: '真 + 好 / 好看 = "really nice".',
          replies: [{ say: ['你的电脑[真|很]好(看)', '[真|很]好看'], en: 'Your computer is really nice!', next: 'bye' }] },
        bye: { npc: { hanzi: '谢谢！我们玩吧！', english: "Thanks! Let's play!" }, end: true },
      },
    },

    // 2. How old are you? (YOU start)
    {
      id: 'age', title: 'How old are you?',
      start: 'n1',
      nodes: {
        n1: { goal: 'Ask Xiao Ming’s little brother how old he is.', tip: 'For a child: 你几岁(了)？ — 几 for small numbers, 岁 = years of age.',
          replies: [{ say: ['你几岁(了)'], en: 'How old are you?', next: 'n2' }] },
        n2: { npc: { hanzi: '我八岁了！我是小学生。小明是我哥哥。', english: "I'm eight! I'm at primary school. Xiao Ming is my big brother." }, goal: 'Ask whether he likes going to school — or whether he likes his teacher.', tip: '你喜欢 + 上学 / 你的老师 + 吗？',
          replies: [
            { say: ['你喜欢上学吗', '你喜欢你的学校吗'], en: 'Do you like school?', label: 'School', next: 'bye1' },
            { say: ['你喜欢你的老师吗'], en: 'Do you like your teacher?', label: 'Teacher', next: 'bye2' },
          ] },
        bye1: { npc: { hanzi: '不太喜欢……我喜欢下课！', english: 'Not really… I like it when class is over!' }, end: true },
        bye2: { npc: { hanzi: '喜欢！我的老师很好，她也喜欢猫！', english: 'Yes! My teacher is really nice — she likes cats too!' }, end: true },
      },
    },

    // 3. Watching TV (brother starts)
    {
      id: 'tv', title: 'Watching TV',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '我在看电视。你也看吗？', english: "I'm watching TV. Do you want to watch too?" }, goal: 'Say you will watch too — or that you want to play with the cat.', tip: '我也看 = "I\'ll watch too". 和 + 猫 + 玩 = play with the cat.',
          replies: [
            { say: ['(好，)我也[看|想看]'], en: "OK, I'll watch too.", label: 'Watch', next: 'n2a' },
            { say: ['我想和猫玩'], en: 'I want to play with the cat.', label: 'The cat', next: 'n2b' },
          ] },
        n2a: { npc: { hanzi: '坐这儿！电视上有两只小狗，它们非常好玩儿！', english: 'Sit here! There are two puppies on TV — they are so funny!' }, goal: 'Ask what the puppies are called.', tip: 'They (animals) = 它们. 它们叫什么(名字)？',
          replies: [{ say: ['它们叫什么(名字)'], en: 'What are they called?', next: 'bye1' }] },
        n2b: { npc: { hanzi: '猫在那儿睡觉呢！你看电视吧。', english: 'The cat is sleeping over there! Watch TV instead.' }, goal: 'Say OK, then you will watch TV too.', tip: '那 = "then"; 也 before the verb.',
          replies: [{ say: ['好，那我也看电视', '那我也看电视'], en: "OK, then I'll watch TV too.", next: 'bye2' }] },
        bye1: { npc: { hanzi: '我不知道！我们看吧！', english: "I don't know! Let's watch!" }, end: true },
        bye2: { npc: { hanzi: '好！电视很好看！', english: 'Good! The TV is really good!' }, end: true },
      },
    },
    // ── HSK 2 ──
    {
      id: 'funnything', title: 'A funny thing at school',
      start: 'n1',
      nodes: {
        n1: { npc: { hanzi: '今天学校有一件有意思的事情！', english: 'Something funny happened at school today!' }, goal: 'Ask what happened.', tip: '事情 = matter / thing; 什么事情？',
          replies: [{ say: ['什么事情', '什么事', '什么事情啊'], en: 'What happened?', next: 'n2' }] },
        n2: { npc: { hanzi: '有一个男孩儿在教室里睡着了，女孩儿们都笑了！', english: 'A boy fell asleep in the classroom and the girls all laughed!' }, goal: 'Say that it is funny — or ask whether the boy laughed too.', tip: '真有意思 / 他也笑了吗？',
          replies: [
            { say: ['真有意思', '太有意思了'], en: 'How funny!', label: 'Funny', next: 'n3a' },
            { say: ['他也笑了吗', '那个男孩儿笑了吗', '男孩儿也笑了吗'], en: 'Did the boy laugh too?', label: 'Did he laugh?', next: 'n3b' },
          ] },
        n3a: { npc: { hanzi: '是啊！我笑了一天。', english: 'Yes! I laughed all day.' }, goal: 'Say goodbye — see you later.', tip: '一会儿见.',
          replies: [{ say: ['一会儿见', '好，一会儿见', '再见'], en: 'See you in a bit.', next: 'bye' }] },
        n3b: { npc: { hanzi: '他笑了！他说：我太累了。', english: 'He did! He said: I was so tired.' }, goal: 'Say that you hope he sleeps well tonight.', tip: '希望 + clause: 希望他今天晚上睡好.',
          replies: [{ say: ['希望他今天晚上睡好', '希望他睡好'], en: 'I hope he sleeps well tonight.', next: 'bye' }] },
        bye: { npc: { hanzi: '哈哈，再见！', english: 'Haha, bye!' }, end: true },
      },
    },
  ]);
})(window.MSC = window.MSC || {});

/*
 * CHAT — Xiao Hong (小红), a cheerful high-school student at the school. Same format and engine as data/chat.js;
 * the set has `school: true` (finishing any of her chats completes the level-2 task "school").
 * Level 2: HSK 1–2 words — school life, sports, names and seats, small talk.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.chats = MSC.data.chats || {};

  MSC.data.chats.xiaohong = {
    npc: { id: 'xiaohong', name: 'Xiao Hong', hanzi: '小红', blurb: 'A cheerful high-school student: school, sports and weekends' },
    school: true, xpTurn: 8, xpFinish: 20,
    lines: {
      notUnderstood: { hanzi: '对不起，我没听清楚。你可以再说一遍吗？', english: "Sorry, I didn't catch that. Could you say it again?" },
      tonesOff: { hanzi: '我差不多听懂了！但是你的声调有一点不一样。', english: 'I almost understood! But your tones are a little different.' },
    },
    dialogues: [
      // 1. Meeting Xiao Hong (she starts)
      {
        id: 'meet', title: 'A new friend at school',
        slots: { myname: [{ hanzi: '小王', en: 'Xiao Wang' }, { hanzi: '小林', en: 'Xiao Lin' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！我叫小红，我是高中学生。你叫什么名字？', english: "Hello! I'm Xiao Hong, a high-school student. What's your name?" }, goal: 'Say hello and tell her your name: you are {myname.en}.', tip: '我叫 + name.',
            replies: [{ say: ['你好，我叫{myname}', '我叫{myname}'], en: 'Hello, my name is {myname.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '很高兴认识你！你学过汉语吗？', english: 'Nice to meet you! Have you studied Chinese?' }, goal: 'Say that you have studied some Chinese — or that you never have.', tip: 'Experience uses 过: 我学过汉语 / 我没学过汉语.',
            replies: [
              { say: ['我学过(一点儿)汉语', '学过，我学过汉语'], en: 'Yes, I have studied a little Chinese.', label: 'Yes, I have', next: 'n3a' },
              { say: ['我没学过汉语', '没学过，我没学过汉语'], en: "No, I've never studied Chinese.", label: 'No, never', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '真的吗？你说得很好！', english: 'Really? You speak very well!' }, goal: 'Thank her.', tip: '谢谢(你).',
            replies: [{ say: ['谢谢(你)', '谢谢，小红'], en: 'Thank you.', next: 'bye' }] },
          n3b: { npc: { hanzi: '没关系，我可以教你！', english: "Never mind, I can teach you!" }, goal: 'Thank her and say you are happy.', tip: '谢谢你 + 我很高兴.',
            replies: [{ say: ['谢谢你，我很高兴', '谢谢，我很高兴'], en: 'Thank you, I am happy.', next: 'bye' }] },
          bye: { npc: { hanzi: '我们是同学了！明天见！', english: "We're classmates now! See you tomorrow!" }, end: true },
        },
      },

      // 2. School starts (YOU start)
      {
        id: 'kaixue', title: 'When does school start?',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Hong when school starts.', tip: '什么时候 = "what time / when": 你们什么时候开学？',
            replies: [{ say: ['你们什么时候开学', '什么时候开学'], en: 'When does school start?', next: 'n2' }] },
          n2: { npc: { hanzi: '星期一开学。我们快要开学了！', english: 'On Monday. School is about to start!' }, goal: 'Ask whether she is happy — or whether she wants to go to school.', tip: '你高兴吗？ / 你想上学吗？ (上学 = go to school)',
            replies: [
              { say: ['你高兴吗'], en: 'Are you happy?', label: 'Are you happy?', next: 'n3a' },
              { say: ['你想上学吗'], en: 'Do you want to go to school?', label: 'Want to go?', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '高兴！我想见同学和老师。', english: 'Happy! I want to see my classmates and teachers.' }, goal: 'Say that you want to see them too.', tip: '也 goes before 想: 我也想见他们.',
            replies: [{ say: ['我也想见他们', '我也想见同学和老师'], en: 'I want to see them too.', next: 'bye' }] },
          n3b: { npc: { hanzi: '想，但是我不想考试！', english: "I do, but I don't want to take exams!" }, goal: 'Say that you do not want exams either.', tip: '我也不想考试.',
            replies: [{ say: ['我也不想考试'], en: "I don't want exams either.", next: 'bye' }] },
          bye: { npc: { hanzi: '星期一见！', english: 'See you on Monday!' }, end: true },
        },
      },

      // 3. The exam (she starts)
      {
        id: 'exam', title: 'Before the exam',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！我明天考试，我有一点忙。', english: "Hi! I have an exam tomorrow, and I'm a bit busy." }, goal: 'Ask what she is taking the exam in.', tip: '考 = "to take an exam": 你考什么？',
            replies: [{ say: ['你考什么', '你明天考什么'], en: 'What is your exam in?', next: 'n2' }] },
          n2: { npc: { hanzi: '我考汉语。题很多。', english: 'Chinese. There are lots of questions.' }, goal: 'Encourage her — or offer to help.', tip: '你可以的！ / 我可以帮忙吗？',
            replies: [
              { say: ['你可以的'], en: 'You can do it!', label: 'Encourage', next: 'n3a' },
              { say: ['我可以帮忙吗', '我可以帮你吗'], en: 'Can I help?', label: 'Offer help', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '谢谢！我希望我考得好。', english: 'Thanks! I hope I do well.' }, goal: 'Say that you hope so too.', tip: '考得好 = "do well in the exam".',
            replies: [{ say: ['我也希望你考得好', '我也希望'], en: 'I hope you do well too.', next: 'bye1' }] },
          n3b: { npc: { hanzi: '太好了！你记得这些词吗？', english: 'Great! Do you remember these words?' }, goal: 'Say that you remember them — or that you forgot.', tip: '记得 = remember; 忘 = forget: 我忘了.',
            replies: [
              { say: ['我记得', '我都记得'], en: 'I remember them.', label: 'I remember', next: 'bye1' },
              { say: ['我忘了', '我都忘了'], en: 'I forgot them.', label: 'I forgot', next: 'bye2' },
            ] },
          bye1: { npc: { hanzi: '谢谢你，你真是我的好朋友！', english: "Thank you, you're a good friend!" }, end: true },
          bye2: { npc: { hanzi: '哈哈，没关系，我们一起看看。', english: "Haha, never mind, let's look together." }, end: true },
        },
      },

      // 4. Sports (YOU start)
      {
        id: 'sports', title: 'Sports and hobbies',
        slots: { sport: [{ hanzi: '篮球', en: 'basketball' }, { hanzi: '足球', en: 'football' }, { hanzi: '跑步', en: 'running' }] },
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask Xiao Hong whether she likes sports.', tip: '运动 = sport / exercise: 你喜欢运动吗？',
            replies: [{ say: ['你喜欢运动吗', '你喜欢什么运动'], en: 'Do you like sports?', next: 'n2' }] },
          n2: { npc: { hanzi: '喜欢！我最喜欢{sport}。你呢？', english: 'Yes! I like {sport.en} best. And you?' }, goal: 'Say you like {sport.en} too — or that you like swimming or dancing.', tip: '也 = "too": 我也喜欢…  Or name your own: 游泳 / 跳舞.',
            replies: [
              { say: ['我也喜欢{sport}'], en: 'I like {sport.en} too.', label: 'Same as her', next: 'n3a' },
              { say: ['我喜欢[游泳|跳舞]'], en: 'I like swimming / dancing.', label: 'Swimming or dancing', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '太好了！我们一起运动吧！', english: "Great! Let's exercise together!" }, goal: 'Say yes, together.', tip: '好 + 一起: 好，我们一起去.',
            replies: [{ say: ['好，我们一起去', '好，我们一起运动'], en: "OK, let's go together.", next: 'bye' }] },
          n3b: { npc: { hanzi: '很有意思！我也想学。', english: 'How interesting! I want to learn too.' }, goal: 'Say that you can teach her.', tip: '教 = teach: 我可以教你.',
            replies: [{ say: ['我可以教你'], en: 'I can teach you.', next: 'bye' }] },
          bye: { npc: { hanzi: '好！下午见！', english: 'OK! See you this afternoon!' }, end: true },
        },
      },

      // 5. Name and seat (she starts)
      {
        id: 'seat', title: 'My name, my seat',
        slots: { myname: [{ hanzi: '小王', en: 'Xiao Wang' }, { hanzi: '小林', en: 'Xiao Lin' }] },
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '同学，请坐！你的姓名是什么？', english: "Classmate, please sit down! What's your name?" }, goal: 'Say your full name: {myname.en}.', tip: '姓名 = full name: 我的姓名是…',
            replies: [{ say: ['我的姓名是{myname}', '我叫{myname}'], en: 'My name is {myname.en}.', next: 'n2' }] },
          n2: { npc: { hanzi: '好。你的位在左边还是右边？', english: 'OK. Is your seat on the left or on the right?' }, goal: 'Say your seat is on the left — or on the right.', tip: '左边 = left side, 右边 = right side: 我坐在左边.',
            replies: [
              { say: ['我坐(在)左边', '左边'], en: 'I sit on the left.', label: 'Left', next: 'n3a' },
              { say: ['我坐(在)右边', '右边'], en: 'I sit on the right.', label: 'Right', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '左边？太好了，我坐在你的右边！', english: 'The left? Great, I sit on your right!' }, goal: 'Say that is great and thank her.', tip: '太好了，谢谢.',
            replies: [{ say: ['太好了，谢谢', '太好了'], en: 'Great, thanks.', next: 'bye' }] },
          n3b: { npc: { hanzi: '右边？太好了，我坐在你的左边！', english: 'The right? Great, I sit on your left!' }, goal: 'Say that is great and thank her.', tip: '太好了，谢谢.',
            replies: [{ say: ['太好了，谢谢', '太好了'], en: 'Great, thanks.', next: 'bye' }] },
          bye: { npc: { hanzi: '我们是同学，也是朋友！', english: "We're classmates, and friends too!" }, end: true },
        },
      },

      // 6. Tired (she starts)
      {
        id: 'tired', title: 'A tired friend',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '你好！你今天累吗？', english: 'Hi! Are you tired today?' }, goal: 'Say you are tired because you ran yesterday — or: although tired, you are happy.', tip: '因为 … (所以) …  /  虽然 … 但是 …',
            replies: [
              { say: ['我很累，因为我昨天跑步了', '因为我昨天跑步了，所以很累'], en: 'I am tired because I went running yesterday.', label: 'Tired', next: 'n2a' },
              { say: ['虽然累，但是我很高兴', '虽然很累，但是我很高兴'], en: 'Although I am tired, I am happy.', label: 'Happy anyway', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '那你回家休息一会儿吧！', english: 'Then go home and rest for a while!' }, goal: 'Say you will go home and rest.', tip: '休息 = rest: 我回家休息.',
            replies: [{ say: ['好，我回家休息', '我回家休息'], en: "OK, I'll go home and rest.", next: 'bye' }] },
          n2b: { npc: { hanzi: '太好了！我们下午去跑步吧！', english: "Great! Let's go running this afternoon!" }, goal: 'Say OK, together — or say you want to rest a little.', tip: '好，我们一起去  /  我想休息一会儿.',
            replies: [
              { say: ['好，我们一起去'], en: "OK, let's go together.", label: 'Go', next: 'bye' },
              { say: ['我想休息一会儿', '不，我想休息一会儿'], en: 'I want to rest a little.', label: 'Rest', next: 'bye' },
            ] },
          bye: { npc: { hanzi: '好的，明天见！', english: 'OK, see you tomorrow!' }, end: true },
        },
      },

      // 7. The broken watch (she starts)
      {
        id: 'watch', title: 'A broken watch',
        start: 'n1',
        nodes: {
          n1: { npc: { hanzi: '我的手表坏了！', english: 'My watch is broken!' }, goal: 'Ask whether she told the teacher — or offer to help.', tip: '告诉 = tell: 你告诉老师了吗？  /  我可以帮忙吗？',
            replies: [
              { say: ['你告诉老师了吗'], en: 'Did you tell the teacher?', label: 'Told the teacher?', next: 'n2a' },
              { say: ['我可以帮忙吗', '我可以帮你吗'], en: 'Can I help?', label: 'Offer help', next: 'n2b' },
            ] },
          n2a: { npc: { hanzi: '还没有。可能我忘在教室里面了。', english: 'Not yet. Maybe I left it in the classroom.' }, goal: 'Say you will go and look in the classroom together.', tip: '我们去教室看看.',
            replies: [{ say: ['我们去教室看看', '我们一起去教室看看'], en: "Let's go and look in the classroom.", next: 'n3' }] },
          n2b: { npc: { hanzi: '谢谢！可能我忘在教室里面了。', english: 'Thanks! Maybe I left it in the classroom.' }, goal: 'Say you will go and look in the classroom together.', tip: '我们去教室看看.',
            replies: [{ say: ['我们去教室看看', '我们一起去教室看看'], en: "Let's go and look in the classroom.", next: 'n3' }] },
          n3: { npc: { hanzi: '找到了！在桌子下面！我错了，它没有坏。', english: "Found it! Under the desk! I was wrong, it isn't broken." }, goal: 'Laugh with her: say great, haha!', tip: '太好了，哈哈！(笑 = to laugh)',
            replies: [{ say: ['太好了，哈哈', '太好了'], en: 'Great, haha!', next: 'bye' }] },
          bye: { npc: { hanzi: '谢谢你帮忙！我们都笑了。', english: 'Thanks for helping! We both laughed.' }, end: true },
        },
      },

      // 8. A school day (YOU start)
      {
        id: 'day', title: 'A day at school',
        start: 'n1',
        nodes: {
          n1: { goal: 'Ask from what time to what time classes are.', tip: '从 … 到 …: 你们从几点到几点上课？',
            replies: [{ say: ['你们从几点到几点上课', '从几点到几点上课'], en: 'From what time to what time are your classes?', next: 'n2' }] },
          n2: { npc: { hanzi: '我们从八点到四点上课。中午在学校吃饭。', english: 'We have classes from eight to four. At noon we eat at school.' }, goal: 'Ask whether she is tired from classes — or where she eats.', tip: '累吗？ / 在哪儿吃饭？',
            replies: [
              { say: ['你们上课累吗', '上课累吗'], en: 'Are classes tiring?', label: 'Tiring?', next: 'n3a' },
              { say: ['你们在哪儿吃饭', '你在哪儿吃饭'], en: 'Where do you eat?', label: 'Where to eat?', next: 'n3b' },
            ] },
          n3a: { npc: { hanzi: '有一点累，但是下课可以玩。', english: 'A little, but after class we can play.' }, goal: 'Ask her to let you play with them.', tip: '让 = let: 让我跟你们一起玩.',
            replies: [{ say: ['让我跟你们一起玩', '让我跟你一起玩'], en: 'Let me play with you.', next: 'bye' }] },
          n3b: { npc: { hanzi: '在学校。我跟同学一起吃，很有意思。', english: 'At school. I eat with my classmates, it is fun.' }, goal: 'Say you want to eat with them too.', tip: '跟 … 一起: 我想跟你们一起吃.',
            replies: [{ say: ['我也想跟你们一起吃', '我想跟你们一起吃'], en: 'I want to eat with you too.', next: 'bye' }] },
          bye: { npc: { hanzi: '好！欢迎你！', english: 'OK! You are welcome!' }, end: true },
        },
      },
    ],
  };
})(window.MSC = window.MSC || {});

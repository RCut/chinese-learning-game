/*
 * WRITING — Master Wang's lessons. Edit freely; run `node tools/check-data.js` afterwards.
 *
 * pool[]      the basic characters Wang can offer (a lesson = 4 of them, picked by the player)
 *   char        the character (must have stroke data in data/strokes.js — see tools/build-strokes.js)
 *   pinyin / meaning   shown on the offer card and in the writing tray
 *   word        LINKED VOCABULARY WORD: added to / updated in the notebook when the lesson is complete.
 *               Usually the character itself; a short word when the character isn't used alone (文 → 中文).
 *               Must exist in data/dictionary.js and contain the character.
 *   tier        1–3. Offers come from the lowest tier that still has unlearned characters.
 *   mnemonic    Wang's one-line memory hook
 *   rules       ids of the stroke rules (below) this character uses; unlocked the first time it is taught
 *   tips        { strokeIndex: 'tip' } — specific tips, shown when the player slips on that stroke (0 = first stroke)
 *   confusable  characters it is often mixed up with (shown in the notebook)
 *
 * tutorial[]  一 and 十, taught on the first visit. Not part of the pool.
 * rules[]     the general stroke-order rules shown as cards at Wang's stall.
 * lines       Wang's dialogue. Chinese must exist in the dictionary; English is blurred until tapped.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.writing = {
    lessonSize: 4,
    offerSize: 8,
    reshuffles: 1,

    rules: [
      { id: 'hv', title: 'Horizontal before vertical', hanzi: '先横后竖', tip: 'When strokes cross, write the horizontal one before the vertical one.', example: '十' },
      { id: 'tb', title: 'Top before bottom', tip: 'Write the upper part first, then work downwards.', example: '三' },
      { id: 'lr', title: 'Left before right', tip: 'Write the left side first, then the right side.', example: '八' },
      { id: 'oc', title: 'Outside before inside', tip: 'Draw the outer frame first, then what sits inside it.', example: '四' },
      { id: 'cb', title: 'Close the box last', tip: 'In a box, draw the bottom line last, after everything inside.', example: '口' },
      { id: 'ms', title: 'Middle before the sides', tip: 'In a symmetrical character, write the middle first, then left, then right.', example: '小' },
    ],

    lines: {
      tutorialIntro: { hanzi: '你好！我是王师傅。我教你写字。先横后竖！', english: 'Hello! I’m Master Wang. I’ll teach you to write. Horizontal first, then vertical!' },
      tutorialDone: { hanzi: '好的！现在选四个字吧。', english: 'Good! Now choose four characters.' },
      menu: { hanzi: '你好！今天想写什么？', english: 'Hello! What would you like to write today?' },
      offer: { hanzi: '请选四个字。', english: 'Please choose four characters.' },
      lessonDone: { hanzi: '太好了！你会写这四个字了。', english: 'Wonderful! You can write these four characters now.' },
      review: { hanzi: '我们再写一遍吧。', english: 'Let’s write them once more.' },
      nothingLeft: { hanzi: '你都会写了！我们再写一遍吧。', english: 'You can write them all! Let’s write them once more.' },
    },

    tutorial: [
      { char: '一', pinyin: 'yī', meaning: 'one', word: '一', mnemonic: 'One stroke for one: a single line, drawn from left to right.', rules: ['hv'] },
      { char: '十', pinyin: 'shí', meaning: 'ten', word: '十', mnemonic: 'A cross for ten: across first, then down.', rules: ['hv'] },
    ],

    pool: [
      // ── Tier 1: up to 4 strokes — numbers and pictographs ──
      { char: '二', pinyin: 'èr', meaning: 'two', word: '二', tier: 1, rules: ['tb'], mnemonic: 'Two lines stacked: the short one on top, the long one below.' },
      { char: '三', pinyin: 'sān', meaning: 'three', word: '三', tier: 1, rules: ['tb'], mnemonic: 'Three lines from top to bottom — the middle one is the shortest.' },
      { char: '五', pinyin: 'wǔ', meaning: 'five', word: '五', tier: 1, rules: ['hv'], mnemonic: 'Two bars with a post between them: a little fence, one for each finger.' },
      { char: '六', pinyin: 'liù', meaning: 'six', word: '六', tier: 1, rules: ['tb'], mnemonic: 'A hat on top, two legs below: six steps on a roof.' },
      { char: '七', pinyin: 'qī', meaning: 'seven', word: '七', tier: 1, rules: ['hv'], mnemonic: 'A line across, then a hook: seven days hang from a flagpole.' },
      { char: '八', pinyin: 'bā', meaning: 'eight', word: '八', tier: 1, rules: ['lr'], mnemonic: 'Two strokes opening wide like legs: eight is lucky, so wide open!' },
      { char: '九', pinyin: 'jiǔ', meaning: 'nine', word: '九', tier: 1, rules: [], mnemonic: 'A flick and a hook: nine is almost ten, with a bent tail.', tips: { 0: 'In 九 the short slanted stroke comes first, then the long hooked one.' } },
      { char: '人', pinyin: 'rén', meaning: 'person', word: '人', tier: 1, rules: ['lr'], mnemonic: 'A person walking on two legs.', confusable: ['入'] },
      { char: '入', pinyin: 'rù', meaning: 'to enter', word: '入', tier: 1, rules: ['lr'], mnemonic: 'A pointed tip pushing in — like 人, but the long stroke is on the right.', confusable: ['人'] },
      { char: '口', pinyin: 'kǒu', meaning: 'mouth', word: '口', tier: 1, rules: ['cb'], mnemonic: 'An open mouth, drawn as a box.' },
      { char: '大', pinyin: 'dà', meaning: 'big', word: '大', tier: 1, rules: ['hv', 'lr'], mnemonic: 'A person with arms stretched wide: big!' },
      { char: '小', pinyin: 'xiǎo', meaning: 'small', word: '小', tier: 1, rules: ['ms'], mnemonic: 'A tiny stick in the middle with a drop falling on each side.', tips: { 0: 'In 小 the middle hook comes first, then the left drop, then the right.' } },
      { char: '中', pinyin: 'zhōng', meaning: 'middle', word: '中', tier: 1, rules: ['oc'], mnemonic: 'An arrow through the middle of a box: right in the centre.', tips: { 3: 'The vertical through the middle is written last.' } },
      { char: '上', pinyin: 'shàng', meaning: 'up / above', word: '上', tier: 1, rules: [], mnemonic: 'A small mark above a line: something sitting on top.', confusable: ['下'], tips: { 0: 'In 上 the vertical stroke comes first, then the short line, then the long line.' } },
      { char: '下', pinyin: 'xià', meaning: 'down / below', word: '下', tier: 1, rules: ['hv'], mnemonic: 'A mark hanging below a line: something underneath.', confusable: ['上'], tips: { 0: 'In 下 the long horizontal comes first, then the vertical, then the dot.' } },
      { char: '日', pinyin: 'rì', meaning: 'sun / day', word: '日', tier: 1, rules: ['cb'], mnemonic: 'The sun as a box with a line across.', confusable: ['目', '月'] },
      { char: '月', pinyin: 'yuè', meaning: 'moon / month', word: '月', tier: 1, rules: ['cb'], mnemonic: 'A crescent moon with two lines on it.', confusable: ['日'] },
      { char: '木', pinyin: 'mù', meaning: 'tree', word: '木', tier: 1, rules: ['hv', 'lr'], mnemonic: 'A tree: trunk, branches and roots.' },
      { char: '水', pinyin: 'shuǐ', meaning: 'water', word: '水', tier: 1, rules: ['ms'], mnemonic: 'A stream in the middle with splashes on both sides.' },
      { char: '火', pinyin: 'huǒ', meaning: 'fire', word: '火', tier: 1, rules: ['lr'], mnemonic: 'Flames licking up from a fire.' },
      { char: '山', pinyin: 'shān', meaning: 'mountain', word: '山', tier: 1, rules: ['ms'], mnemonic: 'Three peaks, the tallest in the middle.', tips: { 0: 'In 山 the middle peak comes first, then the left, then the right.' } },

      // ── Tier 2: up to 6 strokes — core HSK 1 words ──
      { char: '四', pinyin: 'sì', meaning: 'four', word: '四', tier: 2, rules: ['oc', 'cb'], mnemonic: 'A box with two legs inside: four walls.' },
      { char: '左', pinyin: 'zuǒ', meaning: 'left', word: '左边', tier: 2, rules: ['hv'], mnemonic: 'The left hand holds a tool, resting on a flat line.', confusable: ['右'], tips: { 0: 'In 左 the horizontal stroke comes first, unlike 右.' } },
      { char: '右', pinyin: 'yòu', meaning: 'right', word: '右边', tier: 2, rules: ['lr'], mnemonic: 'The right hand brings food to the mouth (口).', confusable: ['左'], tips: { 0: 'In 右 the slanted stroke comes first, unlike 左.' } },
      { char: '女', pinyin: 'nǚ', meaning: 'woman', word: '女', tier: 2, rules: [], mnemonic: 'A woman kneeling with her hands folded.' },
      { char: '子', pinyin: 'zǐ', meaning: 'child', word: '包子', tier: 2, rules: ['tb'], mnemonic: 'A baby with arms stretched out.' },
      { char: '好', pinyin: 'hǎo', meaning: 'good', word: '好', tier: 2, rules: ['lr'], mnemonic: 'A woman (女) with a child (子): that is good.' },
      { char: '不', pinyin: 'bù', meaning: 'not', word: '不', tier: 2, rules: ['hv'], mnemonic: 'A bird flying up and never coming down: no, not.' },
      { char: '他', pinyin: 'tā', meaning: 'he', word: '他', tier: 2, rules: ['lr'], mnemonic: 'The person radical on the left, plus a sound part on the right: he.' },
      { char: '文', pinyin: 'wén', meaning: 'writing', word: '中文', tier: 2, rules: ['tb'], mnemonic: 'A person with a patterned chest: writing, culture.' },
      { char: '目', pinyin: 'mù', meaning: 'eye', word: '目', tier: 2, rules: ['oc', 'cb'], mnemonic: 'An eye turned on its side, with the pupil and the iris as two lines.', confusable: ['日'] },
      { char: '天', pinyin: 'tiān', meaning: 'sky / day', word: '今天', tier: 2, rules: ['tb'], mnemonic: 'A big person (大) with the sky (一) above his head.' },
      { char: '买', pinyin: 'mǎi', meaning: 'to buy', word: '买', tier: 2, rules: ['tb'], mnemonic: 'A hand reaching out to take the goods.' },
      { char: '吃', pinyin: 'chī', meaning: 'to eat', word: '吃', tier: 2, rules: ['lr'], mnemonic: 'A mouth (口) on the left, ready to eat.' },

      // ── Tier 3: 7+ strokes — frequent café and fruit-stall words ──
      { char: '我', pinyin: 'wǒ', meaning: 'I / me', word: '我', tier: 3, rules: [], mnemonic: 'A hand holding a spear: me, defending myself.' },
      { char: '你', pinyin: 'nǐ', meaning: 'you', word: '你', tier: 3, rules: ['lr'], mnemonic: 'The person radical on the left: you, the person facing me.' },
      { char: '是', pinyin: 'shì', meaning: 'to be', word: '是', tier: 3, rules: ['tb'], mnemonic: 'The sun (日) above a straight line: what is, is.' },
      { char: '茶', pinyin: 'chá', meaning: 'tea', word: '茶', tier: 3, rules: ['tb'], mnemonic: 'Grass on top, a person (人) in the middle, a tree (木) below: tea leaves.' },
      { char: '点', pinyin: 'diǎn', meaning: 'dot / to order', word: '点', tier: 3, rules: ['tb'], mnemonic: 'Four little flames at the bottom: a row of dots.' },
      { char: '钱', pinyin: 'qián', meaning: 'money', word: '钱', tier: 3, rules: ['lr'], mnemonic: 'The metal radical on the left: money was made of metal.' },
    ],
  };
})(window.MSC = window.MSC || {});

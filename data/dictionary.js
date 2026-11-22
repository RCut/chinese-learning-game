/*
 * DICTIONARY — every word and phrase the game knows.
 *
 * Edit freely. One entry per word. Fields:
 *   hanzi      Simplified characters (unique key).
 *   pinyin     Display pinyin with tone marks.
 *   pinyinNum  Numbered pinyin, ONE syllable per character, space separated (5 = neutral tone).
 *   english    Short meaning shown in tooltips / notebook.
 *   pos        Part of speech. Use 'phrase' for set expressions — phrases are listed first in "Related".
 *   category   Notebook filter group.
 *   starter    true = in the notebook from the start (the HSK 1 starter deck).
 *   related    Curated hanzi that really belong with this word: collocations (喝 → 咖啡), measure-word pairs,
 *              near-synonyms and opposites (热/冰, 二/两, 但是/可是). May include the word's own character
 *              (看看 → 看). Don't add words that are merely in the same topic.
 *   exclude    Hanzi the AUTOMATIC lists must not show for this word because the meaning is lost in the compound
 *              (在 ↛ 现在, 水 ↛ 水果). Phrases / compounds containing the word are otherwise found automatically.
 *   note       Optional usage note shown in the word pane.
 *
 * Character components (radicals) live in data/characters.js.
 * Run `node tools/check-data.js` after editing to validate everything.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.dictionary = [
    // ───────────── Pronouns & People ─────────────
    { hanzi: '我', pinyin: 'wǒ', pinyinNum: 'wo3', english: 'I / me', pos: 'pronoun', category: 'Pronouns & People', starter: true, related: ['你'] },
    { hanzi: '你', pinyin: 'nǐ', pinyinNum: 'ni3', english: 'you', pos: 'pronoun', category: 'Pronouns & People', starter: true, related: ['我'] },
    { hanzi: '他', pinyin: 'tā', pinyinNum: 'ta1', english: 'he / him', pos: 'pronoun', category: 'Pronouns & People', starter: true },
    { hanzi: '我们', pinyin: 'wǒmen', pinyinNum: 'wo3 men5', english: 'we / us', pos: 'pronoun', category: 'Pronouns & People', starter: true },
    { hanzi: '老板', pinyin: 'lǎobǎn', pinyinNum: 'lao3 ban3', english: 'boss / shop owner', pos: 'noun', category: 'Pronouns & People', starter: true, related: ['林', '店'] },
    { hanzi: '路人', pinyin: 'lùrén', pinyinNum: 'lu4 ren2', english: 'passer-by', pos: 'noun', category: 'Pronouns & People', starter: true, related: ['请问'] },
    { hanzi: '谁', pinyin: 'shéi', pinyinNum: 'shei2', english: 'who', pos: 'pronoun', category: 'Pronouns & People', starter: true, related: ['什么'] },
    { hanzi: '什么', pinyin: 'shénme', pinyinNum: 'shen2 me5', english: 'what', pos: 'pronoun', category: 'Pronouns & People', related: ['谁'] },
    { hanzi: '这', pinyin: 'zhè', pinyinNum: 'zhe4', english: 'this', pos: 'pronoun', category: 'Pronouns & People' },
    { hanzi: '这个', pinyin: 'zhège', pinyinNum: 'zhe4 ge5', english: 'this one', pos: 'pronoun', category: 'Pronouns & People', related: ['多少钱'] },
    { hanzi: '人', pinyin: 'rén', pinyinNum: 'ren2', english: 'person', pos: 'noun', category: 'Pronouns & People' },
    { hanzi: '林', pinyin: 'Lín', pinyinNum: 'lin2', english: 'Lin (a surname)', pos: 'name', category: 'Pronouns & People', related: ['老板'] },

    // ───────────── Verbs ─────────────
    { hanzi: '是', pinyin: 'shì', pinyinNum: 'shi4', english: 'to be (am / is / are)', pos: 'verb', category: 'Verbs', starter: true, related: ['不'], exclude: ['还是', '但是', '可是'] },
    { hanzi: '要', pinyin: 'yào', pinyinNum: 'yao4', english: 'to want / would like', pos: 'verb', category: 'Verbs', starter: true, related: ['想'], note: '我要… is the most direct way to order something.' },
    { hanzi: '想', pinyin: 'xiǎng', pinyinNum: 'xiang3', english: 'to want to / to think', pos: 'verb', category: 'Verbs', starter: true, related: ['要'] },
    { hanzi: '喝', pinyin: 'hē', pinyinNum: 'he1', english: 'to drink', pos: 'verb', category: 'Verbs', starter: true, related: ['咖啡', '茶', '水', '饮料', '口'] },
    { hanzi: '吃', pinyin: 'chī', pinyinNum: 'chi1', english: 'to eat', pos: 'verb', category: 'Verbs', starter: true, related: ['米饭', '包子', '喝', '口'] },
    { hanzi: '买', pinyin: 'mǎi', pinyinNum: 'mai3', english: 'to buy', pos: 'verb', category: 'Verbs', starter: true, related: ['多少钱', '钱', '块'] },
    { hanzi: '去', pinyin: 'qù', pinyinNum: 'qu4', english: 'to go', pos: 'verb', category: 'Verbs', starter: true, related: ['来', '哪里'] },
    { hanzi: '在', pinyin: 'zài', pinyinNum: 'zai4', english: 'to be at / in', pos: 'verb', category: 'Verbs', starter: true, related: ['哪里', '这里', '前面'], exclude: ['现在'], note: 'Place + 在 + location: 咖啡店在前面.' },
    { hanzi: '喜欢', pinyin: 'xǐhuan', pinyinNum: 'xi3 huan5', english: 'to like', pos: 'verb', category: 'Verbs', starter: true, related: ['吃', '喝'] },
    { hanzi: '有', pinyin: 'yǒu', pinyinNum: 'you3', english: 'to have / there is', pos: 'verb', category: 'Verbs', related: ['没'] },
    { hanzi: '看', pinyin: 'kàn', pinyinNum: 'kan4', english: 'to look / to read / to watch', pos: 'verb', category: 'Verbs', related: ['看看', '菜单', '目'] },
    { hanzi: '看看', pinyin: 'kànkan', pinyinNum: 'kan4 kan5', english: 'to have a look', pos: 'verb', category: 'Verbs', related: ['看', '菜单'], note: 'Doubling a verb (看 → 看看) makes it brief and casual: "take a quick look".' },
    { hanzi: '想想', pinyin: 'xiǎngxiang', pinyinNum: 'xiang3 xiang5', english: 'to think it over', pos: 'verb', category: 'Verbs', related: ['想', '看看'], note: 'Doubled verb, like 看看: "have a think".' },
    { hanzi: '说', pinyin: 'shuō', pinyinNum: 'shuo1', english: 'to say / to speak', pos: 'verb', category: 'Verbs', related: ['听'] },
    { hanzi: '听', pinyin: 'tīng', pinyinNum: 'ting1', english: 'to listen / to hear', pos: 'verb', category: 'Verbs', related: ['说', '清楚'] },
    { hanzi: '听懂', pinyin: 'tīngdǒng', pinyinNum: 'ting1 dong3', english: 'to understand (by listening)', pos: 'verb', category: 'Verbs', related: ['听', '清楚'] },
    { hanzi: '找', pinyin: 'zhǎo', pinyinNum: 'zhao3', english: 'to look for', pos: 'verb', category: 'Verbs' },
    { hanzi: '找到', pinyin: 'zhǎodào', pinyinNum: 'zhao3 dao4', english: 'to find', pos: 'verb', category: 'Verbs', related: ['找'] },
    { hanzi: '给', pinyin: 'gěi', pinyinNum: 'gei3', english: 'to give / for', pos: 'verb', category: 'Verbs', related: ['你'] },
    { hanzi: '来', pinyin: 'lái', pinyinNum: 'lai2', english: 'to come', pos: 'verb', category: 'Verbs', related: ['去', '欢迎'] },
    { hanzi: '试', pinyin: 'shì', pinyinNum: 'shi4', english: 'to try', pos: 'verb', category: 'Verbs', related: ['再', '次'] },
    { hanzi: '算', pinyin: 'suàn', pinyinNum: 'suan4', english: 'to calculate / to work out', pos: 'verb', category: 'Verbs', related: ['一共', '多少'] },
    { hanzi: '请', pinyin: 'qǐng', pinyinNum: 'qing3', english: 'please / to invite', pos: 'verb', category: 'Verbs' },
    { hanzi: '欢迎', pinyin: 'huānyíng', pinyinNum: 'huan1 ying2', english: 'to welcome', pos: 'verb', category: 'Verbs', related: ['来'] },
    { hanzi: '点', pinyin: 'diǎn', pinyinNum: 'dian3', english: 'a little; to order (food)', pos: 'verb', category: 'Verbs', related: ['菜单'] },
    { hanzi: '可以', pinyin: 'kěyǐ', pinyinNum: 'ke3 yi3', english: 'can / may', pos: 'verb', category: 'Verbs', related: ['会'] },
    { hanzi: '握', pinyin: 'wò', pinyinNum: 'wo4', english: 'to grasp / to hold', pos: 'verb', category: 'Verbs', note: 'Sounds like 我 (wǒ) but with a 4th tone.' },

    // ───────────── Food & Drink ─────────────
    { hanzi: '咖啡', pinyin: 'kāfēi', pinyinNum: 'ka1 fei1', english: 'coffee', pos: 'noun', category: 'Food & Drink', starter: true, related: ['杯', '喝', '冰', '热'] },
    { hanzi: '茶', pinyin: 'chá', pinyinNum: 'cha2', english: 'tea', pos: 'noun', category: 'Food & Drink', starter: true, related: ['杯', '喝', '热'] },
    { hanzi: '水', pinyin: 'shuǐ', pinyinNum: 'shui3', english: 'water', pos: 'noun', category: 'Food & Drink', starter: true, related: ['杯', '喝', '火'], exclude: ['水果', '水果摊'] },
    { hanzi: '牛奶', pinyin: 'niúnǎi', pinyinNum: 'niu2 nai3', english: 'milk', pos: 'noun', category: 'Food & Drink', starter: true, related: ['杯', '喝'] },
    { hanzi: '牛肉面', pinyin: 'niúròumiàn', pinyinNum: 'niu2 rou4 mian4', english: 'beef noodles', pos: 'noun', category: 'Food & Drink', starter: true, related: ['碗', '吃'] },
    { hanzi: '苹果', pinyin: 'píngguǒ', pinyinNum: 'ping2 guo3', english: 'apple', pos: 'noun', category: 'Food & Drink', starter: true, related: ['个', '水果', '买'] },
    { hanzi: '米饭', pinyin: 'mǐfàn', pinyinNum: 'mi3 fan4', english: 'cooked rice', pos: 'noun', category: 'Food & Drink', starter: true, related: ['碗', '吃'] },
    { hanzi: '菜单', pinyin: 'càidān', pinyinNum: 'cai4 dan1', english: 'menu', pos: 'noun', category: 'Food & Drink', starter: true, related: ['看', '点'] },
    { hanzi: '包子', pinyin: 'bāozi', pinyinNum: 'bao1 zi5', english: 'steamed bun', pos: 'noun', category: 'Food & Drink', related: ['个', '吃'] },
    { hanzi: '香蕉', pinyin: 'xiāngjiāo', pinyinNum: 'xiang1 jiao1', english: 'banana', pos: 'noun', category: 'Food & Drink', related: ['个', '水果'] },
    { hanzi: '西瓜', pinyin: 'xīguā', pinyinNum: 'xi1 gua1', english: 'watermelon', pos: 'noun', category: 'Food & Drink', related: ['个', '水果'] },
    { hanzi: '水果', pinyin: 'shuǐguǒ', pinyinNum: 'shui3 guo3', english: 'fruit', pos: 'noun', category: 'Food & Drink', related: ['苹果', '香蕉', '西瓜'] },
    { hanzi: '饮料', pinyin: 'yǐnliào', pinyinNum: 'yin3 liao4', english: 'drink / beverage', pos: 'noun', category: 'Food & Drink', related: ['喝', '咖啡', '茶'] },
    { hanzi: '牛肉', pinyin: 'niúròu', pinyinNum: 'niu2 rou4', english: 'beef', pos: 'noun', category: 'Food & Drink' },
    { hanzi: '牛', pinyin: 'niú', pinyinNum: 'niu2', english: 'cow / ox', pos: 'noun', category: 'Food & Drink' },
    { hanzi: '面', pinyin: 'miàn', pinyinNum: 'mian4', english: 'noodles; side (as in 前面)', pos: 'noun', category: 'Food & Drink', related: ['碗'] },
    { hanzi: '米', pinyin: 'mǐ', pinyinNum: 'mi3', english: 'rice (uncooked grain)', pos: 'noun', category: 'Food & Drink' },
    { hanzi: '饭', pinyin: 'fàn', pinyinNum: 'fan4', english: 'meal / cooked rice', pos: 'noun', category: 'Food & Drink', related: ['吃'] },
    { hanzi: '菜', pinyin: 'cài', pinyinNum: 'cai4', english: 'dish / vegetable', pos: 'noun', category: 'Food & Drink' },

    // ───────────── Numbers & Measures ─────────────
    { hanzi: '一', pinyin: 'yī', pinyinNum: 'yi1', english: 'one', pos: 'number', category: 'Numbers & Measures', starter: true, exclude: ['一样'], note: 'Often said yí or yì depending on the next tone (一共 yígòng, 一点 yìdiǎn).' },
    { hanzi: '二', pinyin: 'èr', pinyinNum: 'er4', english: 'two (when counting)', pos: 'number', category: 'Numbers & Measures', starter: true, related: ['两'], note: 'Before a measure word use 两, not 二.' },
    { hanzi: '两', pinyin: 'liǎng', pinyinNum: 'liang3', english: 'two (before measure words)', pos: 'number', category: 'Numbers & Measures', starter: true, related: ['二', '个', '杯', '碗'] },
    { hanzi: '三', pinyin: 'sān', pinyinNum: 'san1', english: 'three', pos: 'number', category: 'Numbers & Measures', starter: true },
    { hanzi: '四', pinyin: 'sì', pinyinNum: 'si4', english: 'four', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '五', pinyin: 'wǔ', pinyinNum: 'wu3', english: 'five', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '六', pinyin: 'liù', pinyinNum: 'liu4', english: 'six', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '七', pinyin: 'qī', pinyinNum: 'qi1', english: 'seven', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '八', pinyin: 'bā', pinyinNum: 'ba1', english: 'eight', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '九', pinyin: 'jiǔ', pinyinNum: 'jiu3', english: 'nine', pos: 'number', category: 'Numbers & Measures' },
    { hanzi: '十', pinyin: 'shí', pinyinNum: 'shi2', english: 'ten', pos: 'number', category: 'Numbers & Measures', starter: true },
    { hanzi: '万', pinyin: 'wàn', pinyinNum: 'wan4', english: 'ten thousand', pos: 'number', category: 'Numbers & Measures', note: 'Sounds like 碗 (wǎn) but with a 4th tone.' },
    { hanzi: '个', pinyin: 'gè', pinyinNum: 'ge4', english: 'general measure word', pos: 'measure', category: 'Numbers & Measures', starter: true, related: ['两', '苹果', '包子', '量词'], note: 'Often toneless (ge) in speech.' },
    { hanzi: '杯', pinyin: 'bēi', pinyinNum: 'bei1', english: 'cup / glass (measure word)', pos: 'measure', category: 'Numbers & Measures', starter: true, related: ['咖啡', '茶', '牛奶', '水', '量词'] },
    { hanzi: '碗', pinyin: 'wǎn', pinyinNum: 'wan3', english: 'bowl (measure word)', pos: 'measure', category: 'Numbers & Measures', starter: true, related: ['米饭', '牛肉面', '量词'] },
    { hanzi: '块', pinyin: 'kuài', pinyinNum: 'kuai4', english: 'yuan (spoken unit of money)', pos: 'measure', category: 'Numbers & Measures', starter: true, related: ['钱', '多少钱'] },
    { hanzi: '次', pinyin: 'cì', pinyinNum: 'ci4', english: 'time(s) — measure for occurrences', pos: 'measure', category: 'Numbers & Measures', related: ['遍'] },
    { hanzi: '遍', pinyin: 'biàn', pinyinNum: 'bian4', english: 'time(s) — once through, start to finish', pos: 'measure', category: 'Numbers & Measures', related: ['次'] },
    { hanzi: '几', pinyin: 'jǐ', pinyinNum: 'ji3', english: 'how many (small number)', pos: 'pronoun', category: 'Numbers & Measures', related: ['多少', '个'] },
    { hanzi: '多少', pinyin: 'duōshao', pinyinNum: 'duo1 shao5', english: 'how many / how much', pos: 'pronoun', category: 'Numbers & Measures', related: ['几'] },
    { hanzi: '一共', pinyin: 'yīgòng', pinyinNum: 'yi1 gong4', english: 'altogether / in total', pos: 'adv', category: 'Numbers & Measures', related: ['多少钱', '块'] },
    { hanzi: '一点', pinyin: 'yīdiǎn', pinyinNum: 'yi1 dian3', english: 'a little', pos: 'adv', category: 'Numbers & Measures' },
    { hanzi: '第', pinyin: 'dì', pinyinNum: 'di4', english: 'ordinal prefix (第三 = third)', pos: 'prefix', category: 'Numbers & Measures' },
    { hanzi: '数字', pinyin: 'shùzì', pinyinNum: 'shu4 zi4', english: 'number / digit', pos: 'noun', category: 'Numbers & Measures', related: ['字'] },
    { hanzi: '钱', pinyin: 'qián', pinyinNum: 'qian2', english: 'money', pos: 'noun', category: 'Numbers & Measures', related: ['块', '买'] },

    // ───────────── Directions & Places ─────────────
    { hanzi: '火车站', pinyin: 'huǒchēzhàn', pinyinNum: 'huo3 che1 zhan4', english: 'train station', pos: 'place', category: 'Directions & Places', starter: true, related: ['地铁站'] },
    { hanzi: '左边', pinyin: 'zuǒbiān', pinyinNum: 'zuo3 bian1', english: 'left side', pos: 'direction', category: 'Directions & Places', starter: true, related: ['右边', '前面', '后面'] },
    { hanzi: '右边', pinyin: 'yòubiān', pinyinNum: 'you4 bian1', english: 'right side', pos: 'direction', category: 'Directions & Places', starter: true, related: ['左边', '前面', '后面'] },
    { hanzi: '前面', pinyin: 'qiánmiàn', pinyinNum: 'qian2 mian4', english: 'in front / ahead', pos: 'direction', category: 'Directions & Places', starter: true, related: ['后面', '左边', '右边'] },
    { hanzi: '这里', pinyin: 'zhèlǐ', pinyinNum: 'zhe4 li3', english: 'here', pos: 'place', category: 'Directions & Places', starter: true, related: ['哪里', '在'] },
    { hanzi: '哪里', pinyin: 'nǎlǐ', pinyinNum: 'na3 li3', english: 'where', pos: 'pronoun', category: 'Directions & Places', starter: true, related: ['这里', '在', '请问'] },
    { hanzi: '咖啡店', pinyin: 'kāfēidiàn', pinyinNum: 'ka1 fei1 dian4', english: 'café / coffee shop', pos: 'place', category: 'Directions & Places', starter: true, related: ['书店', '老板'] },
    { hanzi: '路牌', pinyin: 'lùpái', pinyinNum: 'lu4 pai2', english: 'street sign', pos: 'noun', category: 'Directions & Places', starter: true, related: ['方向'] },
    { hanzi: '水果摊', pinyin: 'shuǐguǒtān', pinyinNum: 'shui3 guo3 tan1', english: 'fruit stall', pos: 'place', category: 'Directions & Places', starter: true, related: ['苹果', '老板', '买'] },
    { hanzi: '地铁站', pinyin: 'dìtiězhàn', pinyinNum: 'di4 tie3 zhan4', english: 'subway station', pos: 'place', category: 'Directions & Places', related: ['火车站'] },
    { hanzi: '书店', pinyin: 'shūdiàn', pinyinNum: 'shu1 dian4', english: 'bookstore', pos: 'place', category: 'Directions & Places', related: ['咖啡店'] },
    { hanzi: '公园', pinyin: 'gōngyuán', pinyinNum: 'gong1 yuan2', english: 'park', pos: 'place', category: 'Directions & Places' },
    { hanzi: '后面', pinyin: 'hòumiàn', pinyinNum: 'hou4 mian4', english: 'behind / at the back', pos: 'direction', category: 'Directions & Places', related: ['前面'] },
    { hanzi: '火车', pinyin: 'huǒchē', pinyinNum: 'huo3 che1', english: 'train', pos: 'noun', category: 'Directions & Places' },
    { hanzi: '地铁', pinyin: 'dìtiě', pinyinNum: 'di4 tie3', english: 'subway / metro', pos: 'noun', category: 'Directions & Places' },
    { hanzi: '站', pinyin: 'zhàn', pinyinNum: 'zhan4', english: 'station / stop', pos: 'noun', category: 'Directions & Places' },
    { hanzi: '店', pinyin: 'diàn', pinyinNum: 'dian4', english: 'shop / store', pos: 'noun', category: 'Directions & Places', related: ['老板'] },
    { hanzi: '书', pinyin: 'shū', pinyinNum: 'shu1', english: 'book', pos: 'noun', category: 'Directions & Places', related: ['看', '买'] },
    { hanzi: '路', pinyin: 'lù', pinyinNum: 'lu4', english: 'road / street', pos: 'noun', category: 'Directions & Places' },
    { hanzi: '边', pinyin: 'biān', pinyinNum: 'bian1', english: 'side', pos: 'noun', category: 'Directions & Places' },
    { hanzi: '方向', pinyin: 'fāngxiàng', pinyinNum: 'fang1 xiang4', english: 'direction', pos: 'noun', category: 'Directions & Places', related: ['左边', '右边', '前面'] },

    // ───────────── Time & Adjectives ─────────────
    { hanzi: '今天', pinyin: 'jīntiān', pinyinNum: 'jin1 tian1', english: 'today', pos: 'time', category: 'Time & Adjectives', starter: true, related: ['现在', '日'] },
    { hanzi: '现在', pinyin: 'xiànzài', pinyinNum: 'xian4 zai4', english: 'now', pos: 'time', category: 'Time & Adjectives', starter: true, related: ['今天'] },
    { hanzi: '热', pinyin: 'rè', pinyinNum: 're4', english: 'hot', pos: 'adj', category: 'Time & Adjectives', starter: true, related: ['冰', '茶', '咖啡'] },
    { hanzi: '冰', pinyin: 'bīng', pinyinNum: 'bing1', english: 'ice / iced', pos: 'adj', category: 'Time & Adjectives', starter: true, related: ['热', '咖啡', '水'] },
    { hanzi: '好吃', pinyin: 'hǎochī', pinyinNum: 'hao3 chi1', english: 'delicious', pos: 'adj', category: 'Time & Adjectives', starter: true, related: ['好', '吃'] },
    { hanzi: '好', pinyin: 'hǎo', pinyinNum: 'hao3', english: 'good / well', pos: 'adj', category: 'Time & Adjectives', related: ['对', '女'], exclude: ['不好意思'] },
    { hanzi: '对', pinyin: 'duì', pinyinNum: 'dui4', english: 'right / correct', pos: 'adj', category: 'Time & Adjectives', related: ['不', '好的'] },
    { hanzi: '一样', pinyin: 'yīyàng', pinyinNum: 'yi1 yang4', english: 'the same', pos: 'adj', category: 'Time & Adjectives' },
    { hanzi: '清楚', pinyin: 'qīngchu', pinyinNum: 'qing1 chu5', english: 'clear', pos: 'adj', category: 'Time & Adjectives', related: ['听'] },
    { hanzi: '多', pinyin: 'duō', pinyinNum: 'duo1', english: 'many / much', pos: 'adj', category: 'Time & Adjectives', related: ['太'], exclude: ['差不多'] },
    { hanzi: '够', pinyin: 'gòu', pinyinNum: 'gou4', english: 'enough', pos: 'adj', category: 'Time & Adjectives', related: ['钱'] },

    // ───────────── Everyday Phrases ─────────────
    { hanzi: '你好', pinyin: 'nǐ hǎo', pinyinNum: 'ni3 hao3', english: 'hello', pos: 'phrase', category: 'Everyday Phrases', related: ['再见'] },
    { hanzi: '谢谢', pinyin: 'xièxie', pinyinNum: 'xie4 xie5', english: 'thank you', pos: 'phrase', category: 'Everyday Phrases', starter: true, related: ['再见'] },
    { hanzi: '多少钱', pinyin: 'duōshao qián', pinyinNum: 'duo1 shao5 qian2', english: 'how much (does it cost)?', pos: 'phrase', category: 'Everyday Phrases', starter: true, related: ['一共', '块', '买'] },
    { hanzi: '请问', pinyin: 'qǐngwèn', pinyinNum: 'qing3 wen4', english: 'excuse me, may I ask…', pos: 'phrase', category: 'Everyday Phrases', starter: true, related: ['哪里', '不好意思', '问题'] },
    { hanzi: '欢迎光临', pinyin: 'huānyíng guānglín', pinyinNum: 'huan1 ying2 guang1 lin2', english: 'welcome! (said by shop staff)', pos: 'phrase', category: 'Everyday Phrases', related: ['你好'] },
    { hanzi: '好的', pinyin: 'hǎo de', pinyinNum: 'hao3 de5', english: 'OK / sure', pos: 'phrase', category: 'Everyday Phrases', related: ['对'] },
    { hanzi: '太好了', pinyin: 'tài hǎo le', pinyinNum: 'tai4 hao3 le5', english: 'great! / wonderful!', pos: 'phrase', category: 'Everyday Phrases', related: ['太棒了'] },
    { hanzi: '太棒了', pinyin: 'tài bàng le', pinyinNum: 'tai4 bang4 le5', english: 'awesome!', pos: 'phrase', category: 'Everyday Phrases', related: ['太好了'] },
    { hanzi: '不好意思', pinyin: 'bù hǎoyìsi', pinyinNum: 'bu4 hao3 yi4 si5', english: 'sorry / excuse me', pos: 'phrase', category: 'Everyday Phrases', related: ['请问'] },
    { hanzi: '再说一遍', pinyin: 'zài shuō yī biàn', pinyinNum: 'zai4 shuo1 yi1 bian4', english: 'say it again', pos: 'phrase', category: 'Everyday Phrases', related: ['听', '清楚'] },
    { hanzi: '再见', pinyin: 'zàijiàn', pinyinNum: 'zai4 jian4', english: 'goodbye', pos: 'phrase', category: 'Everyday Phrases', related: ['你好', '谢谢'] },
    { hanzi: '有一点', pinyin: 'yǒu yīdiǎn', pinyinNum: 'you3 yi1 dian3', english: 'a little, somewhat (before adjectives)', pos: 'phrase', category: 'Everyday Phrases' },
    { hanzi: '在哪里', pinyin: 'zài nǎlǐ', pinyinNum: 'zai4 na3 li3', english: 'where is…?', pos: 'phrase', category: 'Everyday Phrases', related: ['请问'], note: 'Put the place first: 火车站在哪里？' },

    // ───────────── Writing (Master Wang's stall) ─────────────
    { hanzi: '写', pinyin: 'xiě', pinyinNum: 'xie3', english: 'to write', pos: 'verb', category: 'Verbs', related: ['写字', '教'] },
    { hanzi: '写字', pinyin: 'xiězì', pinyinNum: 'xie3 zi4', english: 'to write characters / handwriting', pos: 'phrase', category: 'Language & Learning', related: ['教', '字'] },
    { hanzi: '字', pinyin: 'zì', pinyinNum: 'zi4', english: 'character / written word', pos: 'noun', category: 'Language & Learning', related: ['写', '数字'] },
    { hanzi: '教', pinyin: 'jiāo', pinyinNum: 'jiao1', english: 'to teach', pos: 'verb', category: 'Verbs', related: ['写', '师傅'] },
    { hanzi: '选', pinyin: 'xuǎn', pinyinNum: 'xuan3', english: 'to choose', pos: 'verb', category: 'Verbs' },
    { hanzi: '会', pinyin: 'huì', pinyinNum: 'hui4', english: 'can / to know how to', pos: 'verb', category: 'Verbs', related: ['可以', '写'], note: '会 is about a learned skill: 我会写字 = "I can write (I know how)". 可以 is about permission.' },
    { hanzi: '王', pinyin: 'Wáng', pinyinNum: 'wang2', english: 'Wang (a surname)', pos: 'name', category: 'Pronouns & People', related: ['师傅'] },
    { hanzi: '师傅', pinyin: 'shīfu', pinyinNum: 'shi1 fu5', english: 'master / skilled worker (polite address)', pos: 'noun', category: 'Pronouns & People', related: ['王', '老板'], note: 'A respectful way to address a craftsman, driver or chef: 王师傅 = "Master Wang".' },
    { hanzi: '横', pinyin: 'héng', pinyinNum: 'heng2', english: 'horizontal stroke', pos: 'noun', category: 'Language & Learning', related: ['竖', '先横后竖'] },
    { hanzi: '竖', pinyin: 'shù', pinyinNum: 'shu4', english: 'vertical stroke', pos: 'noun', category: 'Language & Learning', related: ['横', '先横后竖'] },
    { hanzi: '后', pinyin: 'hòu', pinyinNum: 'hou4', english: 'after / behind', pos: 'adv', category: 'Time & Adjectives', related: ['后面', '先'] },
    { hanzi: '先横后竖', pinyin: 'xiān héng hòu shù', pinyinNum: 'xian1 heng2 hou4 shu4', english: 'horizontal first, then vertical (stroke-order rule)', pos: 'phrase', category: 'Language & Learning', related: ['横', '竖', '写字'], note: 'Master Wang’s favourite rule: in a crossing like 十, write the horizontal stroke before the vertical one.' },
    { hanzi: '中文', pinyin: 'zhōngwén', pinyinNum: 'zhong1 wen2', english: 'Chinese (language)', pos: 'noun', category: 'Language & Learning', related: ['说', '写字', '中'] },

    // ───────────── Basic characters taught at Master Wang's stall ─────────────
    { hanzi: '入', pinyin: 'rù', pinyinNum: 'ru4', english: 'to enter', pos: 'verb', category: 'Verbs', note: 'Easy to mix up with 人 (person): in 入 the long stroke is on the right.' },
    { hanzi: '口', pinyin: 'kǒu', pinyinNum: 'kou3', english: 'mouth', pos: 'noun', category: 'Body & Nature', related: ['喝', '吃'] },
    { hanzi: '大', pinyin: 'dà', pinyinNum: 'da4', english: 'big', pos: 'adj', category: 'Time & Adjectives', related: ['小'] },
    { hanzi: '小', pinyin: 'xiǎo', pinyinNum: 'xiao3', english: 'small', pos: 'adj', category: 'Time & Adjectives', related: ['大'] },
    { hanzi: '中', pinyin: 'zhōng', pinyinNum: 'zhong1', english: 'middle / in', pos: 'noun', category: 'Directions & Places', related: ['中文'] },
    { hanzi: '上', pinyin: 'shàng', pinyinNum: 'shang4', english: 'up / above / on', pos: 'direction', category: 'Directions & Places', related: ['下'] },
    { hanzi: '下', pinyin: 'xià', pinyinNum: 'xia4', english: 'down / below / under', pos: 'direction', category: 'Directions & Places', related: ['上'] },
    { hanzi: '日', pinyin: 'rì', pinyinNum: 'ri4', english: 'sun / day', pos: 'noun', category: 'Time & Adjectives', related: ['月', '今天'], note: 'Easy to mix up with 目 (eye): 日 is a box with one line inside.' },
    { hanzi: '月', pinyin: 'yuè', pinyinNum: 'yue4', english: 'moon / month', pos: 'noun', category: 'Time & Adjectives', related: ['日'] },
    { hanzi: '木', pinyin: 'mù', pinyinNum: 'mu4', english: 'tree / wood', pos: 'noun', category: 'Body & Nature' },
    { hanzi: '山', pinyin: 'shān', pinyinNum: 'shan1', english: 'mountain', pos: 'noun', category: 'Body & Nature' },
    { hanzi: '火', pinyin: 'huǒ', pinyinNum: 'huo3', english: 'fire', pos: 'noun', category: 'Body & Nature', related: ['水'], exclude: ['火车', '火车站'] },
    { hanzi: '目', pinyin: 'mù', pinyinNum: 'mu4', english: 'eye (formal)', pos: 'noun', category: 'Body & Nature', related: ['看'], note: 'Easy to mix up with 日 (sun): 目 has two lines inside the box.' },
    { hanzi: '女', pinyin: 'nǚ', pinyinNum: 'nv3', english: 'woman / female', pos: 'noun', category: 'Pronouns & People', related: ['好'] },

    // ───────────── Particles & Connectors ─────────────
    { hanzi: '的', pinyin: 'de', pinyinNum: 'de5', english: 'possessive / modifier particle', pos: 'particle', category: 'Particles & Connectors' },
    { hanzi: '了', pinyin: 'le', pinyinNum: 'le5', english: 'particle: change or completion', pos: 'particle', category: 'Particles & Connectors' },
    { hanzi: '吗', pinyin: 'ma', pinyinNum: 'ma5', english: 'yes/no question particle', pos: 'particle', category: 'Particles & Connectors' },
    { hanzi: '吧', pinyin: 'ba', pinyinNum: 'ba5', english: 'particle: suggestion ("let\'s…", "right?")', pos: 'particle', category: 'Particles & Connectors' },
    { hanzi: '哦', pinyin: 'o', pinyinNum: 'o5', english: 'particle: friendly, softening tone', pos: 'particle', category: 'Particles & Connectors' },
    { hanzi: '哈哈', pinyin: 'hāhā', pinyinNum: 'ha1 ha1', english: 'haha', pos: 'interjection', category: 'Particles & Connectors' },
    { hanzi: '们', pinyin: 'men', pinyinNum: 'men5', english: 'plural suffix (for people)', pos: 'suffix', category: 'Particles & Connectors' },
    { hanzi: '不', pinyin: 'bù', pinyinNum: 'bu4', english: 'not / no', pos: 'adv', category: 'Particles & Connectors', related: ['没'], exclude: ['不过'], note: 'Becomes bú before a 4th tone: 不是 búshì, 不对 búduì.' },
    { hanzi: '没', pinyin: 'méi', pinyinNum: 'mei2', english: 'not (did not / have not)', pos: 'adv', category: 'Particles & Connectors', related: ['不', '有'] },
    { hanzi: '还是', pinyin: 'háishi', pinyinNum: 'hai2 shi5', english: 'or (in questions)', pos: 'conj', category: 'Particles & Connectors', related: ['和', '或'], note: 'Use 还是 for "or" in questions; 和 means "and".' },
    { hanzi: '和', pinyin: 'hé', pinyinNum: 'he2', english: 'and (between nouns)', pos: 'conj', category: 'Particles & Connectors', related: ['还是', '或'] },
    { hanzi: '或', pinyin: 'huò', pinyinNum: 'huo4', english: 'or (in statements)', pos: 'conj', category: 'Particles & Connectors', related: ['还是', '和'] },
    { hanzi: '但是', pinyin: 'dànshì', pinyinNum: 'dan4 shi4', english: 'but', pos: 'conj', category: 'Particles & Connectors', related: ['可是', '不过'] },
    { hanzi: '可是', pinyin: 'kěshì', pinyinNum: 'ke3 shi4', english: 'but', pos: 'conj', category: 'Particles & Connectors', related: ['但是', '不过'] },
    { hanzi: '不过', pinyin: 'bùguò', pinyinNum: 'bu4 guo4', english: 'however', pos: 'conj', category: 'Particles & Connectors', related: ['但是', '可是'] },
    { hanzi: '还', pinyin: 'hái', pinyinNum: 'hai2', english: 'also / still', pos: 'adv', category: 'Particles & Connectors', related: ['再'] },
    { hanzi: '都', pinyin: 'dōu', pinyinNum: 'dou1', english: 'all / both', pos: 'adv', category: 'Particles & Connectors' },
    { hanzi: '再', pinyin: 'zài', pinyinNum: 'zai4', english: 'again', pos: 'adv', category: 'Particles & Connectors', related: ['还'] },
    { hanzi: '只', pinyin: 'zhǐ', pinyinNum: 'zhi3', english: 'only', pos: 'adv', category: 'Particles & Connectors' },
    { hanzi: '先', pinyin: 'xiān', pinyinNum: 'xian1', english: 'first (before something else)', pos: 'adv', category: 'Particles & Connectors' },
    { hanzi: '太', pinyin: 'tài', pinyinNum: 'tai4', english: 'too / extremely', pos: 'adv', category: 'Particles & Connectors', related: ['多'] },
    { hanzi: '差不多', pinyin: 'chàbuduō', pinyinNum: 'cha4 bu5 duo1', english: 'almost / about the same', pos: 'adv', category: 'Particles & Connectors' },

    // ───────────── Language & Learning ─────────────
    { hanzi: '声调', pinyin: 'shēngdiào', pinyinNum: 'sheng1 diao4', english: 'tone (of a syllable)', pos: 'noun', category: 'Language & Learning' },
    { hanzi: '声', pinyin: 'shēng', pinyinNum: 'sheng1', english: 'sound / tone', pos: 'noun', category: 'Language & Learning' },
    { hanzi: '量词', pinyin: 'liàngcí', pinyinNum: 'liang4 ci2', english: 'measure word', pos: 'noun', category: 'Language & Learning', related: ['个', '杯', '碗'] },
    { hanzi: '问题', pinyin: 'wèntí', pinyinNum: 'wen4 ti2', english: 'question / problem', pos: 'noun', category: 'Language & Learning', related: ['请问'] },
    { hanzi: '被子', pinyin: 'bèizi', pinyinNum: 'bei4 zi5', english: 'quilt / duvet', pos: 'noun', category: 'Language & Learning', note: 'Sounds like 杯 (bēi) + 子 but with a 4th tone.' },
  ];
})(window.MSC = window.MSC || {});

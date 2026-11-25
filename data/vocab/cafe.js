/* VOCABULARY for the cafe stage — extra words and their characters. Same entry format as data/dictionary.js / data/characters.js. */
(function (MSC) {
  MSC.data.dictionary.push(
    { hanzi: '桌子', pinyin: 'zhuōzi', pinyinNum: 'zhuo1 zi5', english: 'table', pos: 'noun', category: 'Café' },
    { hanzi: '椅子', pinyin: 'yǐzi', pinyinNum: 'yi3 zi5', english: 'chair', pos: 'noun', category: 'Café' },
    { hanzi: '咖啡机', pinyin: 'kāfēijī', pinyinNum: 'ka1 fei1 ji1', english: 'coffee machine', pos: 'noun', category: 'Café', related: ['咖啡'] },
    { hanzi: '茶壶', pinyin: 'cháhú', pinyinNum: 'cha2 hu2', english: 'teapot', pos: 'noun', category: 'Café', related: ['茶'] },
    { hanzi: '窗户', pinyin: 'chuānghu', pinyinNum: 'chuang1 hu5', english: 'window', pos: 'noun', category: 'Café' },
    { hanzi: '钟', pinyin: 'zhōng', pinyinNum: 'zhong1', english: 'clock', pos: 'noun', category: 'Café', related: ['时间'] },
    { hanzi: '勺子', pinyin: 'sháozi', pinyinNum: 'shao2 zi5', english: 'spoon', pos: 'noun', category: 'Café' },
    { hanzi: '盘子', pinyin: 'pánzi', pinyinNum: 'pan2 zi5', english: 'plate / dish', pos: 'noun', category: 'Café' },
    { hanzi: '冰箱', pinyin: 'bīngxiāng', pinyinNum: 'bing1 xiang1', english: 'fridge', pos: 'noun', category: 'Café', related: ['冰'] },
    { hanzi: '植物', pinyin: 'zhíwù', pinyinNum: 'zhi2 wu4', english: 'plant', pos: 'noun', category: 'Café' },
    { hanzi: '灯', pinyin: 'dēng', pinyinNum: 'deng1', english: 'lamp / light', pos: 'noun', category: 'Café' },
    { hanzi: '营业时间', pinyin: 'yíngyè shíjiān', pinyinNum: 'ying2 ye4 shi2 jian1', english: 'opening hours', pos: 'noun', category: 'Café', related: ['时间'] },
  );
  Object.assign(MSC.data.characters, {
    '桌': { meaning: 'table', parts: '卓 (sound, “outstanding”) above 木 wood' },
    '椅': { meaning: 'chair', parts: '木 wood + 奇 (sound)' },
    '壶': { meaning: 'pot, kettle', parts: 'Pictograph of a lidded pot' },
    '窗': { meaning: 'window', parts: '穴 hole in the wall + 囱 chimney' },
    '户': { meaning: 'door, household', parts: 'Pictograph of a single-leaf door' },
    '勺': { meaning: 'spoon, ladle', parts: 'A scoop 勹 with a drop 丶 inside' },
    '盘': { meaning: 'plate, tray', parts: '舟 + 皿 dish' },
    '箱': { meaning: 'box, chest', parts: '竹 bamboo + 相 (sound)' },
    '植': { meaning: 'to plant', parts: '木 tree + 直 straight (sound)' },
    '物': { meaning: 'thing, object', parts: '牛 ox + 勿 (sound)' },
    '灯': { meaning: 'lamp, light', parts: '火 fire + 丁 (sound)' },
    '营': { meaning: 'to run (a business); camp', parts: '艹 + 吕 rooms under a roof' },
    '业': { meaning: 'trade, business', parts: 'Pictograph of a wooden frame' },
  });
})(window.MSC = window.MSC || {});

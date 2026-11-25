/* VOCABULARY used by the stage system itself (door names). Same entry format as data/dictionary.js / data/characters.js. */
(function (MSC) {
  MSC.data.dictionary.push(
    { hanzi: '街道', pinyin: 'jiēdào', pinyinNum: 'jie1 dao4', english: 'street', pos: 'place', category: 'Around Town', related: ['路'] },
    { hanzi: '外面', pinyin: 'wàimiàn', pinyinNum: 'wai4 mian4', english: 'outside', pos: 'place', category: 'Around Town' },
    { hanzi: '市场', pinyin: 'shìchǎng', pinyinNum: 'shi4 chang3', english: 'market', pos: 'place', category: 'Around Town' },
    { hanzi: '字画店', pinyin: 'zìhuàdiàn', pinyinNum: 'zi4 hua4 dian4', english: 'calligraphy & painting shop', pos: 'place', category: 'Around Town' },
  );
  Object.assign(MSC.data.characters, {
    '街': { meaning: 'street', parts: '彳 step + 圭 (sound)' },
    '道': { meaning: 'road, way', parts: '辶 walk + 首 head (leading the way)' },
    '外': { meaning: 'outside', parts: '夕 evening + 卜 divination (fortune told outside, after dusk)' },
    '市': { meaning: 'market, city', parts: '亠 + 巾 cloth (a place to trade cloth)' },
    '场': { meaning: 'field, place, venue', parts: '土 earth + 汤 (sound)' },
    '画': { meaning: 'to draw; a painting', parts: 'Outline of a field drawn with a brush' },
  });
})(window.MSC = window.MSC || {});

/* STAGE: Master Wang's calligraphy shop. (See data/world.js for the format.)
 * Own tile letters:  H shelf (wall unit)  ·  T table  ·  K rug.   Tables and shelves are solid; objects stand on them.
 * Level 1 (HSK 1): reading and writing — books, a character chart, the class notice, a practice sheet, a reading stand,
 * a pupil's desk and chair, the shop computer. Level 2 adds the calligraphy things (brush, ink, paper, paint pots in four colours…). */
(function (MSC) {
  MSC.data.world.stages.shop = {
    id: 'shop', name: 'Master Wang’s shop', hanzi: '字画店', sound: 'shop',
    cols: 16, rows: 10,
    blockedTiles: ['H', 'T'],
    map: [
      'WWWWWWWWWWWWWWWW',
      'WHPPPPPPPPPPPPHW',
      'WHPPTTPPPTTPPPHW',
      'WHPPPPPPPPPPPPHW',
      'WPPPPPKKKKPPPPPW',
      'WPPPPPKKKKPPTTPW',
      'WPPTTPPPPPPPPPPW',
      'WPPPPPPPPPPPPPPW',
      'WPPPPPPPDPPPTTPW',
      'WWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 8, y: 7 },
    scenery: [],
    objects: [
      // ── level 1: reading and writing ──
      { id: 'sh-book1', x: 1, y: 1, hanzi: '书', note: 'A book. 书 is also the first character of 书架 (bookshelf) and 书法 (calligraphy).' },
      { id: 'sh-book2', x: 1, y: 3, hanzi: '书', note: 'Another book: 书.' },
      { id: 'sh-hanzi', x: 3, y: 1, hanzi: '汉字', text: [{ hanzi: '学汉字', english: 'Learn Chinese characters' }, { hanzi: '人 口 大 小', english: 'person · mouth · big · small' }], note: 'Every 汉字 is one syllable. Many simple ones started as pictures: 人 is a person walking.' },
      { id: 'sh-class', x: 11, y: 1, hanzi: '课', text: [{ hanzi: '汉字课', english: 'Character class' }, { hanzi: '星期六 上午九点', english: 'Saturday, 9 a.m.' }, { hanzi: '上课 一个小时', english: 'The class is one hour' }], note: '上课 = class starts; 下课 = class is over.' },
      { id: 'sh-reading', x: 1, y: 5, hanzi: '读书', text: [{ hanzi: '新书', english: 'New books' }, { hanzi: '多读书', english: 'Read more books' }], note: '读 is to read (aloud); 读书 is reading books — and also simply "to study".' },
      { id: 'sh-practice', x: 3, y: 6, hanzi: '字', text: [{ hanzi: '写汉字', english: 'Write Chinese characters' }], note: 'Each 字 sits in its own square, so it is written the same size as the others.' },
      { id: 'sh-computer', x: 13, y: 5, hanzi: '电脑', note: '电脑 is literally "electric brain". Master Wang keeps his class list on it.' },
      { id: 'sh-chair', x: 2, y: 8, hanzi: '椅子' },
      { id: 'sh-desk', x: 3, y: 8, hanzi: '桌子', note: 'A pupil’s desk with a 汉语 book: sit here to 学习.' },
      { id: 'sh-cup', x: 13, y: 8, hanzi: '杯子', note: 'A tea cup: 杯子.' },
      // ── level 2: the calligraphy things ──
      // the four treasures of the study sit on Master Wang's big work table
      { id: 'sh-brush', x: 4, y: 2, hanzi: '毛笔', note: 'The brush, 毛笔, is one of the Four Treasures of the Study 文房四宝: brush, ink, paper and inkstone.' },
      { id: 'sh-ink', x: 5, y: 2, hanzi: '墨', note: 'Ink sticks are ground with water on an inkstone to make fresh ink.' },
      // paint pots: the colours of the studio
      { id: 'sh-black', x: 9, y: 2, hanzi: '黑色', text: [{ hanzi: '黑色', english: 'Black' }], note: 'Black ink, 黑色, is the colour of calligraphy.' },
      { id: 'sh-xuan', x: 10, y: 2, hanzi: '宣纸', note: '宣纸 is soft, absorbent paper made in Xuan (Anhui) — the classic paper for brush and ink.' },
      // shelves
      { id: 'sh-bookshelf', x: 1, y: 2, hanzi: '书架' },
      { id: 'sh-green', x: 14, y: 2, hanzi: '绿色', text: [{ hanzi: '绿色', english: 'Green' }], note: 'Green paint for leaves and bamboo: 绿色.' },
      { id: 'sh-flower', x: 14, y: 3, hanzi: '花', note: 'A flower: 花. Put one in a 花瓶 and you have a vase of flowers.' },
      // back wall
      { id: 'sh-painting', x: 5, y: 1, hanzi: '画' },
      { id: 'sh-lantern', x: 7, y: 1, hanzi: '灯笼' },
      { id: 'sh-calligraphy', x: 9, y: 1, hanzi: '书法', text: [{ hanzi: '多看 多写', english: 'Look more, write more' }] },
      { id: 'sh-colours', x: 13, y: 1, hanzi: '颜色', text: [{ hanzi: '什么颜色？', english: 'What colour?' }, { hanzi: '红色 绿色 黑色 白色', english: 'Red · green · black · white' }], note: '颜色 means colour. Ask 你喜欢什么颜色？ (What colour do you like?)' },
      // tables, corners and the entrance
      { id: 'sh-paper', x: 4, y: 6, hanzi: '纸' },
      { id: 'sh-white', x: 12, y: 5, hanzi: '白色', text: [{ hanzi: '白色', english: 'White' }], note: 'White paint, 白色, for the clouds and the snow.' },
      { id: 'sh-teaset', x: 12, y: 8, hanzi: '茶具' },
      { id: 'sh-red', x: 1, y: 8, hanzi: '红色', text: [{ hanzi: '红色', english: 'Red' }], note: 'Red paint, 红色, the lucky colour.' },
      { id: 'sh-welcome', x: 10, y: 8, hanzi: '欢迎光临', text: [{ hanzi: '欢迎光临', english: 'Welcome!' }] },
    ],
    entities: [
      { id: 'door-shop-out', kind: 'door', name: 'Outside', hanzi: '外面', x: 8, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'wang', name: 'Master Wang', hanzi: '王师傅', x: 7, y: 3, stand: { x: 7, y: 4 }, badge: 'badge-ink', pill: 'pill-ink' },
    ],
  };
})(window.MSC = window.MSC || {});

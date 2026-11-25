/* STAGE: Master Wang's calligraphy shop. (See data/world.js for the format.)
 * Own tile letters:  H shelf (wall unit)  ·  T table  ·  K rug.   Tables and shelves are solid; objects stand on them. */
(function (MSC) {
  MSC.data.world.stages.shop = {
    id: 'shop', name: 'Master Wang’s shop', hanzi: '字画店', sound: 'shop',
    cols: 16, rows: 10,
    tileClasses: { H: 'tile-shop-shelf', T: 'tile-shop-table', K: 'tile-shop-rug' },
    blockedTiles: ['H', 'T'],
    map: [
      'WWWWWWWWWWWWWWWW',
      'WHPPPPPPPPPPPPHW',
      'WHPPPPPPPPPPPPHW',
      'WHPPTTPPPTTPPPHW',
      'WPPPPPKKKKPPPPPW',
      'WPPPPPKKKKPPTTPW',
      'WPPTTPPPPPPPPPPW',
      'WPPPPPPPPPPPPPPW',
      'WPPPPPPPDPPPTTPW',
      'WWWWWWWWWWWWWWWW',
    ],
    playerStart: { x: 8, y: 7 },
    scenery: [
      { x: 2, y: 0, text: '📜' }, { x: 6, y: 0, text: '🖼️' }, { x: 9, y: 0, text: '🖼️' }, { x: 13, y: 0, text: '📜' },
      { x: 4, y: 0, text: '🏮' }, { x: 11, y: 0, text: '🏮' },
      { x: 1, y: 1, text: '📚' }, { x: 1, y: 3, text: '📕' }, { x: 14, y: 1, text: '📘' }, { x: 14, y: 3, text: '🪴' },
      { x: 13, y: 5, text: '⬛' }, { x: 13, y: 8, text: '🍵' },
    ],
    objects: [
      // the four treasures of the study sit on Master Wang's big work table
      { id: 'sh-brush', x: 4, y: 3, emoji: '🖊️', hanzi: '毛笔', text: [{ hanzi: '毛笔 三十块', english: 'Writing brush: 30 yuan' }], note: 'The brush, 毛笔, is one of the Four Treasures of the Study 文房四宝: brush, ink, paper and inkstone.' },
      { id: 'sh-ink', x: 5, y: 3, emoji: '⚫', hanzi: '墨', note: 'Ink sticks are ground with water on an inkstone to make fresh ink.' },
      { id: 'sh-inkstone', x: 9, y: 3, emoji: '🪨', hanzi: '砚台', note: 'The inkstone is where the ink is ground and kept.' },
      { id: 'sh-xuan', x: 10, y: 3, emoji: '📃', hanzi: '宣纸', text: [{ hanzi: '宣纸 十块', english: 'Rice paper: 10 yuan' }], note: '宣纸 is soft, absorbent paper made in Xuan (Anhui) — the classic paper for brush and ink.' },
      // back wall
      { id: 'sh-bookshelf', x: 1, y: 2, emoji: '📚', hanzi: '书架' },
      { id: 'sh-scroll', x: 3, y: 1, emoji: '📜', hanzi: '卷轴' },
      { id: 'sh-calligraphy', x: 5, y: 1, emoji: '🖋️', hanzi: '书法', text: [{ hanzi: '多看 多写', english: 'Look more, write more' }] },
      { id: 'sh-painting', x: 11, y: 1, emoji: '🖼️', hanzi: '画' },
      { id: 'sh-vase', x: 14, y: 2, emoji: '🏺', hanzi: '花瓶' },
      // display tables
      { id: 'sh-paper', x: 3, y: 6, emoji: '📄', hanzi: '纸' },
      { id: 'sh-pot', x: 4, y: 6, emoji: '✏️', hanzi: '笔筒' },
      { id: 'sh-seal', x: 12, y: 5, emoji: '🔴', hanzi: '印章', note: 'A seal is stamped in red ink (红色) to sign a painting or a piece of calligraphy.' },
      { id: 'sh-teaset', x: 12, y: 8, emoji: '🫖', hanzi: '茶具' },
      // corners and the entrance
      { id: 'sh-lantern', x: 7, y: 1, emoji: '🏮', hanzi: '灯笼' },
      { id: 'sh-screen', x: 1, y: 8, emoji: '🎴', hanzi: '屏风' },
      { id: 'sh-welcome', x: 10, y: 8, emoji: '🪧', hanzi: '欢迎光临', text: [{ hanzi: '欢迎光临', english: 'Welcome!' }] },
    ],
    entities: [
      { id: 'door-shop-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 8, y: 8, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'wang', name: 'Master Wang', hanzi: '王师傅', emoji: '🖌️', x: 7, y: 3, stand: { x: 7, y: 4 }, badge: 'badge-ink', pill: 'pill-ink' },
    ],
  };
})(window.MSC = window.MSC || {});

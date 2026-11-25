/* STAGE: the street — the hub. Doors to the café, Xiao Ming's home, Master Wang's shop and the market. (See data/world.js for the format.)
 * Level 1 (HSK 1): the shop fronts on the facade (school, hospital, bookshop, shop, restaurant, cinema), the bus stop with its
 * announcement, a phone box, a weather board, a car and a taxi. Level 2 adds the street furniture (trees, lamps, bins…), the bank
 * and the toilet. */
(function (MSC) {
  MSC.data.world.stages.street = {
    id: 'street', name: 'Street', hanzi: '街道', sound: 'street',
    cols: 18, rows: 10,
    map: [
      'TTTTTTTTTTTTTTTTTT',
      'NNNDNNNNNDNNDNNNDN',
      'SSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSS',
      'SSSSSSYYYSSSSSSSSS',
      'GKKKKKKKKKKKKKKKKG',
      'RRRRRRRRRRRRZRRRRR',
      'RRRRRRRRRRRRZRRRRR',
      'RRRRRRRRRRRRZRRRRR',
    ],
    blockedTiles: ['T', 'N'],
    playerStart: { x: 9, y: 3 },
    scenery: [
      // shop-front signs
      { x: 0, y: 0, text: '学校', className: 'scenery-sign' },
      { x: 1.9, y: 0, text: '医院', className: 'scenery-sign' },
      { x: 3.1, y: 0, text: '咖啡店', className: 'scenery-sign' },
      { x: 6, y: 0, text: '书店', className: 'scenery-sign' },
      { x: 9, y: 0, text: '字画店', className: 'scenery-sign' },
      { x: 11, y: 0, text: '商店', className: 'scenery-sign' },
      { x: 13, y: 0, text: '饭店', className: 'scenery-sign' },
      { x: 14.9, y: 0, text: '电影院', className: 'scenery-sign' },
      { x: 16.1, y: 0, text: '市场', className: 'scenery-sign' },
      // bus shelter roof and the zebra crossing
      { x: 6, y: 5, className: 'shelter' }, { x: 7, y: 5, className: 'shelter' }, { x: 8, y: 5, className: 'shelter' },
      { x: 12, y: 7, className: 'zebra' }, { x: 12, y: 8, className: 'zebra' }, { x: 12, y: 9, className: 'zebra' },
      // lane dashes
      ...[0, 2, 4, 6, 8, 10, 14, 16].map((x) => ({ x, y: 8, className: 'road-dash' })),
    ],
    objects: [
      // ── level 1: the shop fronts on the facade (drawn as doorways; only the doors lead anywhere) ──
      { id: 'st-school', x: 0, y: 1, hanzi: '学校', text: [{ hanzi: '第一小学', english: 'No. 1 Primary School' }, { hanzi: '上午八点上课', english: 'Classes start at 8 a.m.' }], note: '小学 is a primary school, 中学 a middle school, 大学 a university.' },
      { id: 'st-hospital', x: 2, y: 1, hanzi: '医院', text: [{ hanzi: '医院', english: 'Hospital' }, { hanzi: '看病', english: 'See a doctor' }, { hanzi: '上午八点到下午五点', english: '8 a.m. to 5 p.m.' }], note: 'The 医生 (doctor) works in the 医院.' },
      { id: 'st-bookshop', x: 6, y: 1, hanzi: '书店', text: [{ hanzi: '书店', english: 'Bookshop' }, { hanzi: '新书', english: 'New books' }, { hanzi: '中文书', english: 'Chinese books' }], note: '店 is any shop: 书店 sells 书 (books), 饭店 sells 饭 (meals).' },
      { id: 'st-store', x: 11, y: 1, hanzi: '商店', text: [{ hanzi: '商店', english: 'Shop' }, { hanzi: '早上七点开', english: 'Opens at 7 in the morning' }] },
      { id: 'st-restaurant', x: 13, y: 1, hanzi: '饭店', text: [{ hanzi: '饭店', english: 'Restaurant' }, { hanzi: '午饭 晚饭', english: 'Lunch · Dinner' }, { hanzi: '饺子 面条儿 米饭', english: 'Dumplings · Noodles · Rice' }] },
      { id: 'st-cinema', x: 15, y: 1, hanzi: '电影院', text: [{ hanzi: '新电影', english: 'New film' }, { hanzi: '星期天 下午两点', english: 'Sunday, 2 p.m.' }], note: '电影 is a film; an 电影院 is where you go to see one.' },
      // ── level 1: on the pavement and the road ──
      { id: 'st-bus-stop', x: 6, y: 5, hanzi: '车站', level: 1, text: [{ hanzi: '车站', english: 'Bus stop' }, { hanzi: '去大学', english: 'To the university' }, { hanzi: '去医院', english: 'To the hospital' }],
        listen: ['大学', '医院', '火车', '下午三点', '书店'], listenTitle: 'At the bus stop: what did the loudspeaker say?',
        note: 'Wait here for the 公交车 (bus). A 火车站 is a train station.' },
      { id: 'st-phone', x: 17, y: 3, hanzi: '电话', text: [{ hanzi: '打电话', english: 'Make a phone call' }], note: 'Most people 打电话 on their 手机 now, but the phone box is still here.' },
      { id: 'st-weather', x: 0, y: 4, hanzi: '天气', text: [{ hanzi: '今天 下雨', english: 'Today: rain' }, { hanzi: '明天 很冷', english: 'Tomorrow: cold' }], note: 'To ask: 今天天气怎么样？ (How is the weather today?)' },
      { id: 'st-car', x: 5, y: 7, hanzi: '车', note: '车 is any vehicle: 出租车 (taxi), 火车 (train), 公交车 (bus), 自行车 (bicycle).' },
      { id: 'st-taxi', x: 15, y: 6, hanzi: '出租车' },
      { id: 'st-dog', x: 16, y: 5, hanzi: '狗' },
      { id: 'st-cat', x: 17, y: 6, hanzi: '猫' },
      // ── level 2: the bank, the toilet and the street furniture ──
      { id: 'st-bank', x: 5, y: 1, hanzi: '银行', note: 'The first character means silver, from the days when money was silver.' },
      { id: 'st-toilet', x: 7, y: 1, hanzi: '厕所', text: [{ hanzi: '厕所', english: 'Toilet' }], note: 'To ask: 厕所在哪里？ (Where is the toilet?)' },
      { id: 'st-tree', x: 1, y: 3, hanzi: '树' },
      { id: 'st-mailbox', x: 1, y: 5, hanzi: '邮筒' },
      { id: 'st-lamp', x: 5, y: 3, hanzi: '路灯' },
      { id: 'st-bin', x: 7, y: 3, hanzi: '垃圾桶' },
      { id: 'st-bench', x: 8, y: 5, hanzi: '长椅' },
      { id: 'st-bus', x: 2, y: 7, hanzi: '公交车', note: '公交车 is the everyday word; 公共汽车 is the full, older name.' },
      { id: 'st-moto', x: 8, y: 7, hanzi: '摩托车' },
      { id: 'st-bike', x: 3, y: 6, hanzi: '自行车' },
      { id: 'st-bird', x: 12, y: 3, hanzi: '鸟' },
      { id: 'st-light', x: 11, y: 6, hanzi: '红绿灯' },
      { id: 'st-crosswalk', x: 12, y: 6, hanzi: '斑马线', text: [{ hanzi: '小心', english: 'Be careful' }], note: 'Cross where the "zebra" stripes are.' },
      { id: 'st-flower', x: 16, y: 3, hanzi: '花' },
    ],
    entities: [
      { id: 'door-cafe', kind: 'door', name: 'Café', hanzi: '咖啡店', x: 3, y: 1, to: 'cafe', badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'door-home', kind: 'door', name: 'Xiao Ming’s home', hanzi: '家', x: 12, y: 1, to: 'home', badge: 'badge-rose', pill: 'pill-amber' },
      { id: 'door-shop', kind: 'door', name: 'Master Wang’s shop', hanzi: '字画店', x: 9, y: 1, to: 'shop', badge: 'badge-ink', pill: 'pill-ink' },
      { id: 'door-market', kind: 'door', name: 'Market', hanzi: '市场', x: 16, y: 1, to: 'market', badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'signpost', name: 'Signpost', hanzi: '路牌', x: 3, y: 4, stand: { x: 4, y: 4 }, badge: 'badge-green', pill: 'pill-stone' },
      { id: 'friend', name: 'Xiao Li', hanzi: '小李', x: 14, y: 4, stand: { x: 13, y: 4 }, badge: 'badge-teal', pill: 'pill-teal' },
      { id: 'passerby', name: 'Traveler', hanzi: '路人', x: 10, y: 4, stand: { x: 10, y: 5 }, badge: 'badge-sky', pill: 'pill-sky' },
    ],
  };
})(window.MSC = window.MSC || {});

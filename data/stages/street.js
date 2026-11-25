/* STAGE: the street — the hub. Doors to the café, Xiao Ming's home, Master Wang's shop and the market. (See data/world.js for the format.)
 * Level 1 (HSK 1): the shop fronts on the facade (hospital, bookshop, shop, restaurant, cinema), the bus stop with its
 * announcement, a phone box, a weather board, a car and a taxi. Level 2 adds the school door, hotel, flats, ticket office, watch shop, noodle restaurant, the metro,
 * left/right signs, the bank, the toilet and some street furniture. */
(function (MSC) {
  MSC.data.world.stages.street = {
    id: 'street', name: 'Street', hanzi: '街道', sound: 'street',
    cols: 18, rows: 10,
    map: [
      'TTTTTTTTTTTTTTTTTT',
      'DNNDNNNNNDNNDNNNDN',
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
      { x: 6, y: 0, text: '书店', className: 'scenery-sign' },
      { x: 11, y: 0, text: '商店', className: 'scenery-sign' },
      { x: 13, y: 0, text: '饭店', className: 'scenery-sign' },
      { x: 14.9, y: 0, text: '电影院', className: 'scenery-sign' },
      // bus shelter roof and the zebra crossing
      { x: 6, y: 5, className: 'shelter' }, { x: 7, y: 5, className: 'shelter' }, { x: 8, y: 5, className: 'shelter' },
      { x: 12, y: 7, className: 'zebra' }, { x: 12, y: 8, className: 'zebra' }, { x: 12, y: 9, className: 'zebra' },
      // lane dashes
      ...[0, 2, 4, 6, 8, 10, 14, 16].map((x) => ({ x, y: 8, className: 'road-dash' })),
    ],
    objects: [
      // ── level 1: the shop fronts on the facade (drawn as doorways; only the doors lead anywhere) ──
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
      { id: 'st-toilet', x: 7, y: 1, hanzi: '洗手间', text: [{ hanzi: '洗手间', english: 'Toilet' }], note: 'To ask: 洗手间在哪里？ (Where is the toilet?) 洗手间 is literally the hand-washing room.' },
      { id: 'st-tree', x: 1, y: 3, hanzi: '树' },
      { id: 'st-lamp', x: 5, y: 3, hanzi: '路灯' },
      { id: 'st-bus', x: 2, y: 7, hanzi: '公交车', note: '公交车 is the everyday word; 公共汽车 is the full, older name.' },
      { id: 'st-bike', x: 3, y: 6, hanzi: '自行车' },
      { id: 'st-bird', x: 12, y: 3, hanzi: '鸟' },
      { id: 'st-light', x: 11, y: 6, hanzi: '红绿灯' },
      { id: 'st-crosswalk', x: 12, y: 6, hanzi: '斑马线', text: [{ hanzi: '路上小心', english: 'Take care on the road' }], note: 'Cross where the "zebra" stripes are.' },
      { id: 'st-flower', x: 16, y: 3, hanzi: '花' },
      // ── level 2: more of the street — hotel, flats, ticket office, watch shop, noodle restaurant, the metro, left / right ──
      { id: 'st-hotel', x: 1, y: 1, hanzi: '酒店', text: [{ hanzi: '酒店', english: 'Hotel' }, { hanzi: '一楼 咖啡', english: 'Ground floor: coffee' }], note: '酒店 is a hotel; 饭店 can be a hotel or a restaurant, depending on the place.' },
      { id: 'st-flats', x: 4, y: 1, hanzi: '楼', text: [{ hanzi: '三楼', english: 'Third floor' }, { hanzi: '五楼', english: 'Fifth floor' }], note: '楼 is a building with floors, and also one floor: 我住三楼 (I live on the third floor).' },
      { id: 'st-tickets', x: 8, y: 1, hanzi: '票', text: [{ hanzi: '买票', english: 'Buy tickets' }, { hanzi: '门票 二十块', english: 'Entrance ticket: 20 yuan' }], note: '票 is a ticket; 门票 is an entrance ticket.' },
      { id: 'st-watchshop', x: 10, y: 1, hanzi: '手表', text: [{ hanzi: '手表', english: 'Watches' }, { hanzi: '现在几点？', english: 'What time is it now?' }], note: '手表 is a watch worn on the 手 (hand).' },
      { id: 'st-noodles', x: 14, y: 1, hanzi: '饭馆', text: [{ hanzi: '饭馆', english: 'Restaurant' }, { hanzi: '牛肉面 十五块', english: 'Beef noodles: 15 yuan' }], note: '饭馆 is a small restaurant, a place to 吃饭.' },
      { id: 'st-metro', x: 13, y: 2, hanzi: '地铁', level: 2, text: [{ hanzi: '地铁站', english: 'Subway station' }, { hanzi: '下一站 火车站', english: 'Next stop: train station' }],
        listen: ['下一站', '地铁站', '左边', '右边', '前面'], listenTitle: 'In the subway: what did the announcement say?',
        note: '地铁 is the subway. The stop is the 地铁站; the next stop is the 下一站.' },
      { id: 'st-left', x: 2, y: 3, hanzi: '左', text: [{ hanzi: '左边是医院', english: 'On the left is the hospital' }], note: '左 is left: 左边 is the left side. 右 is right.' },
      { id: 'st-right', x: 17, y: 2, hanzi: '右', text: [{ hanzi: '右边是电影院', english: 'On the right is the cinema' }], note: '右 is right: 右边 is the right side.' },
    ],
    entities: [
      { id: 'door-school', kind: 'door', name: 'School', hanzi: '学校', x: 0, y: 1, to: 'school', level: 2, badge: 'badge-sky', pill: 'pill-sky' },
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

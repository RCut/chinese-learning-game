/* STAGE: the street — the hub. Doors to the café, Master Wang's shop and the market. (See data/world.js for the format.) */
(function (MSC) {
  MSC.data.world.stages.street = {
    id: 'street', name: 'Street', hanzi: '街道', sound: 'street',
    cols: 18, rows: 10,
    map: [
      'TTTTTTTTTTTTTTTTTT',
      'NNNDNNDNNDNNDNNNDN',
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
      { x: 3, y: 0, text: '咖啡店', className: 'scenery-sign' },
      { x: 6, y: 0, text: '银行', className: 'scenery-sign' },
      { x: 9, y: 0, text: '字画店', className: 'scenery-sign' },
      { x: 12, y: 0, text: '厕所', className: 'scenery-sign' },
      { x: 16, y: 0, text: '市场', className: 'scenery-sign' },
      // bus shelter roof and the zebra crossing
      { x: 6, y: 5, className: 'shelter' }, { x: 7, y: 5, className: 'shelter' }, { x: 8, y: 5, className: 'shelter' },
      { x: 12, y: 7, className: 'zebra' }, { x: 12, y: 8, className: 'zebra' }, { x: 12, y: 9, className: 'zebra' },
      // lane dashes
      ...[0, 2, 4, 6, 8, 10, 14, 16].map((x) => ({ x, y: 8, className: 'road-dash' })),
    ],
    objects: [
      { id: 'st-bank', x: 6, y: 1, hanzi: '银行', note: 'The first character means silver, from the days when money was silver.' },
      { id: 'st-toilet', x: 12, y: 1, hanzi: '厕所', text: [{ hanzi: '厕所', english: 'Toilet' }], note: 'To ask: 厕所在哪里？ (Where is the toilet?)' },
      { id: 'st-tree', x: 1, y: 3, hanzi: '树' },
      { id: 'st-mailbox', x: 1, y: 5, hanzi: '邮筒' },
      { id: 'st-lamp', x: 5, y: 3, hanzi: '路灯' },
      { id: 'st-bin', x: 7, y: 3, hanzi: '垃圾桶' },
      { id: 'st-bus-stop', x: 6, y: 5, hanzi: '公共汽车站', text: [{ hanzi: '公共汽车站', english: 'Bus stop' }, { hanzi: '去市场', english: 'To the market' }, { hanzi: '去公园', english: 'To the park' }], note: 'Wait here for the 公共汽车. 站 also means "to stand".' },
      { id: 'st-bench', x: 8, y: 5, hanzi: '长椅' },
      { id: 'st-bus', x: 2, y: 7, hanzi: '公共汽车' },
      { id: 'st-car', x: 5, y: 7, hanzi: '汽车' },
      { id: 'st-moto', x: 8, y: 7, hanzi: '摩托车' },
      { id: 'st-bike', x: 3, y: 6, hanzi: '自行车' },
      { id: 'st-bird', x: 12, y: 3, hanzi: '鸟' },
      { id: 'st-light', x: 11, y: 6, hanzi: '红绿灯' },
      { id: 'st-crosswalk', x: 12, y: 6, hanzi: '斑马线', text: [{ hanzi: '小心', english: 'Be careful' }], note: 'Cross where the "zebra" stripes are.' },
      { id: 'st-taxi', x: 15, y: 6, hanzi: '出租车' },
      { id: 'st-flower', x: 16, y: 3, hanzi: '花' },
      { id: 'st-dog', x: 16, y: 5, hanzi: '狗' },
      { id: 'st-cat', x: 17, y: 6, hanzi: '猫' },
    ],
    entities: [
      { id: 'door-cafe', kind: 'door', name: 'Café', hanzi: '咖啡店', x: 3, y: 1, to: 'cafe', badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'door-shop', kind: 'door', name: 'Master Wang’s shop', hanzi: '字画店', x: 9, y: 1, to: 'shop', badge: 'badge-ink', pill: 'pill-ink' },
      { id: 'door-market', kind: 'door', name: 'Market', hanzi: '市场', x: 16, y: 1, to: 'market', badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'signpost', name: 'Signpost', hanzi: '路牌', x: 3, y: 4, stand: { x: 4, y: 4 }, badge: 'badge-green', pill: 'pill-stone' },
      { id: 'friend', name: 'Xiao Li', hanzi: '小李', x: 14, y: 4, stand: { x: 13, y: 4 }, badge: 'badge-teal', pill: 'pill-teal' },
      { id: 'passerby', name: 'Traveler', hanzi: '路人', x: 10, y: 4, stand: { x: 10, y: 5 }, badge: 'badge-sky', pill: 'pill-sky' },
    ],
  };
})(window.MSC = window.MSC || {});

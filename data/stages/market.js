/* STAGE: the market — food stalls and the shopkeeper. (See data/world.js for the format.) */
(function (MSC) {
  MSC.data.world.stages.market = {
    id: 'market', name: 'Market', hanzi: '市场', sound: 'market',
    cols: 14, rows: 9,
    map: [
      'WWWWWWWWWWWWWW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMMMMMMMW',
      'WMMMMMMDMMMMMW',
      'WWWWWWWWWWWWWW',
    ],
    playerStart: { x: 6, y: 6 },
    scenery: [],
    objects: [],
    entities: [
      { id: 'door-market-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 7, y: 7, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果摊', emoji: '🍎', x: 9, y: 3, stand: { x: 9, y: 4 }, badge: 'badge-rose', pill: 'pill-stone' },
    ],
  };
})(window.MSC = window.MSC || {});

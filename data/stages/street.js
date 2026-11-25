/* STAGE: the street — the hub. Doors to the café, Master Wang's shop and the market. (See data/world.js for the format.) */
(function (MSC) {
  MSC.data.world.stages.street = {
    id: 'street', name: 'Street', hanzi: '街道', sound: 'street',
    cols: 14, rows: 9,
    map: [
      'BBBBBBBBBBBBBB',
      'BBDBBBBDBBBDBB',
      'SSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSS',
      'GGSSSSSSSSSSGG',
      'RRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRR',
    ],
    playerStart: { x: 7, y: 4 },
    scenery: [],
    objects: [],
    entities: [
      { id: 'door-cafe', kind: 'door', name: 'Café', hanzi: '咖啡店', emoji: '☕', x: 2, y: 1, to: 'cafe', badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'door-shop', kind: 'door', name: 'Master Wang’s shop', hanzi: '字画店', emoji: '🖌️', x: 7, y: 1, to: 'shop', badge: 'badge-ink', pill: 'pill-ink' },
      { id: 'door-market', kind: 'door', name: 'Market', hanzi: '市场', emoji: '🧺', x: 11, y: 1, to: 'market', badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'signpost', name: 'Signpost', hanzi: '路牌', emoji: '🪧', x: 4, y: 4, stand: { x: 5, y: 4 }, badge: 'badge-green', pill: 'pill-stone' },
      { id: 'friend', name: 'Xiao Li', hanzi: '小李', emoji: '🙋', x: 12, y: 4, stand: { x: 11, y: 4 }, badge: 'badge-teal', pill: 'pill-teal' },
      { id: 'passerby', name: 'Traveler', hanzi: '路人', emoji: '🧳', x: 8, y: 5, stand: { x: 8, y: 4 }, badge: 'badge-sky', pill: 'pill-sky' },
    ],
  };
})(window.MSC = window.MSC || {});

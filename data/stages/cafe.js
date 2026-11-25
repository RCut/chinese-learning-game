/* STAGE: Barista Lin's café. (See data/world.js for the format.) */
(function (MSC) {
  MSC.data.world.stages.cafe = {
    id: 'cafe', name: 'Café', hanzi: '咖啡店', sound: 'cafe',
    cols: 12, rows: 9,
    map: [
      'WWWWWWWWWWWW',
      'WFFFFFFFFFFW',
      'WFFCCCCCFFFW',
      'WFFFFFFFFFFW',
      'WFFFFFFFFFFW',
      'WFFFFFFFFFFW',
      'WFFFFFFFFFFW',
      'WFFFFDFFFFFW',
      'WWWWWWWWWWWW',
    ],
    playerStart: { x: 5, y: 6 },
    scenery: [{ x: 5, y: 0, text: '☕ 咖啡店', className: 'scenery-sign' }],
    objects: [],
    entities: [
      { id: 'door-cafe-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 5, y: 7, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'barista', name: 'Barista Lin', hanzi: '林老板', emoji: '👩‍🍳', x: 5, y: 1, stand: { x: 5, y: 3 }, zone: { x1: 3, x2: 7, y1: 3, y2: 3 }, badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'menu', name: 'Café Menu', hanzi: '菜单', emoji: '📋', x: 2, y: 2, stand: { x: 2, y: 3 }, badge: 'badge-stone', pill: 'pill-stone' },
    ],
  };
})(window.MSC = window.MSC || {});

/*
 * WORLD — the 12×9 street-corner map and everything placed on it.
 *
 * Map legend:  W wall · F café floor · C counter · D café door · S sidewalk · G grass · R road
 * Entities are interactive (solid) objects. `stand` is where the player walks to when the entity is clicked.
 * `zone` (optional) is an extra rectangle the player can stand in to talk to the entity.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.world = {
    cols: 12,
    rows: 9,
    map: [
      'WWWWWWWWWWWW',
      'WFFFFFFFFFFW',
      'WFFCCCCCFFFW',
      'WFFFFFFFFFFW',
      'WDDSSSSSSSSS',
      'SSSSSSSSSSSS',
      'GGSSSSSSSSGG',
      'RRRRRRRRRRRR',
      'RRRRRRRRRRRR',
    ],
    blockedTiles: ['W', 'C', 'R'],
    tileClasses: {
      W: 'tile-wall',
      F: 'tile-cafe-floor',
      C: 'tile-counter',
      D: 'tile-cafe-floor tile-door',
      S: 'tile-sidewalk',
      G: 'tile-grass',
      R: 'tile-road',
    },
    playerStart: { x: 4, y: 4 },
    playerEmoji: '🧑‍🎓',

    // Purely decorative items.
    scenery: [
      { x: 5, y: 0, text: '☕ 咖啡店', className: 'scenery-sign' },
      { x: 9, y: 1, text: '🪴' },
      { x: 9, y: 3, text: '🪑' },
      { x: 4, y: 2, text: '☕' },
      { x: 6, y: 2, text: '🍰' },
      { x: 4, y: 6, text: '写字', className: 'scenery-banner' },
      { x: 0, y: 6, text: '🌳' },
      { x: 11, y: 6, text: '🌳' },
      { x: 1, y: 8, className: 'road-dash' },
      { x: 3, y: 8, className: 'road-dash' },
      { x: 5, y: 8, className: 'road-dash' },
      { x: 7, y: 8, className: 'road-dash' },
      { x: 9, y: 8, className: 'road-dash' },
      { x: 11, y: 8, className: 'road-dash' },
    ],

    entities: [
      { id: 'barista', name: 'Barista Lin', hanzi: '林老板', emoji: '👩‍🍳', x: 5, y: 1, stand: { x: 5, y: 3 }, zone: { x1: 3, x2: 7, y1: 3, y2: 3 }, badge: 'badge-amber', pill: 'pill-amber' },
      { id: 'menu', name: 'Café Menu', hanzi: '菜单', emoji: '📋', x: 2, y: 2, stand: { x: 2, y: 3 }, badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'signpost', name: 'Signpost', hanzi: '路牌', emoji: '🪧', x: 2, y: 5, stand: { x: 3, y: 5 }, badge: 'badge-green', pill: 'pill-stone' },
      { id: 'wang', name: 'Master Wang', hanzi: '王师傅', emoji: '🖌️', x: 4, y: 5, stand: { x: 5, y: 5 }, badge: 'badge-ink', pill: 'pill-ink' },
      { id: 'cart', name: 'Fruit Stall', hanzi: '水果摊', emoji: '🍎', x: 9, y: 5, stand: { x: 8, y: 5 }, badge: 'badge-rose', pill: 'pill-stone' },
      { id: 'passerby', name: 'Traveler', hanzi: '路人', emoji: '🧳', x: 6, y: 6, stand: { x: 6, y: 5 }, badge: 'badge-sky', pill: 'pill-sky' },
    ],
  };
})(window.MSC = window.MSC || {});

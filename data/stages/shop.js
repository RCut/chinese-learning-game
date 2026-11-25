/* STAGE: Master Wang's calligraphy shop. (See data/world.js for the format.) */
(function (MSC) {
  MSC.data.world.stages.shop = {
    id: 'shop', name: 'Master Wang’s shop', hanzi: '字画店', sound: 'shop',
    cols: 12, rows: 9,
    map: [
      'WWWWWWWWWWWW',
      'WPPPPPPPPPPW',
      'WPPPPPPPPPPW',
      'WPPPPPPPPPPW',
      'WPPPPPPPPPPW',
      'WPPPPPPPPPPW',
      'WPPPPPPPPPPW',
      'WPPPPDPPPPPW',
      'WWWWWWWWWWWW',
    ],
    playerStart: { x: 5, y: 6 },
    scenery: [],
    objects: [],
    entities: [
      { id: 'door-shop-out', kind: 'door', name: 'Outside', hanzi: '外面', emoji: '🚪', x: 5, y: 7, to: 'street', badge: 'badge-stone', pill: 'pill-stone' },
      { id: 'wang', name: 'Master Wang', hanzi: '王师傅', emoji: '🖌️', x: 5, y: 3, stand: { x: 5, y: 4 }, badge: 'badge-ink', pill: 'pill-ink' },
    ],
  };
})(window.MSC = window.MSC || {});

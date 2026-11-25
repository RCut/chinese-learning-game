/*
 * The board renderer — Phaser draws the place: ground tiles, objects, people and the player, all from the pixel art in
 * data/art (js/core/art.js). Phaser only DRAWS; walking, doors and interaction stay in js/game/stage.js, and the name tags and
 * board signs stay HTML on top (crisp Chinese text, tooltips, the Pinyin/Hybrid/Hanzi toggle).
 *
 * Art is 16px; it is drawn at 3× and the browser scales the canvas to the board.
 *   MSC.board.build(stage, player)   draw a place          setPlayer(x, y, instant)   move the player (a short tween)
 *   MSC.board.setActive(id)          the thing being used bobs          setNear(bool)   show the "talk" bubble
 */
(function (MSC) {
  const A = MSC.art, W = MSC.data.world;
  const T = 16, Z = 3, TZ = T * Z;
  const B = (MSC.board = {});
  const LIFT = { L: 6, C: 6, T: 6 };            // things standing on a table / counter sit on its top, not at its front edge
  let game = null, scene = null, ready = false;
  const queue = [];
  let stageObjs = [], things = {}, player = null, bubble = null, activeId = null, activeTween = null, moveTween = null;

  const when = (fn) => { if (ready) fn(); else queue.push(fn); };

  B.init = (el) => {
    if (game || !window.Phaser) return;
    game = new Phaser.Game({
      type: Phaser.CANVAS, parent: el, width: 12 * TZ, height: 9 * TZ, backgroundColor: '#86c06c', banner: false, disableContextMenu: false,
      render: { pixelArt: true, antialias: false, roundPixels: true },
      input: { mouse: false, touch: false, keyboard: false, gamepad: false },
      audio: { noAudio: true },
      scene: { create() { scene = this; ready = true; queue.splice(0).forEach((f) => f()); } },
    });
  };

  const tex = (key, canvas) => {
    if (!scene.textures.exists(key)) { scene.textures.addCanvas(key, canvas); scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST); }
    return key;
  };
  const missingCanvas = () => {                                      // a visible "?" so a missing sprite can never go unnoticed
    const cv = document.createElement('canvas'); cv.width = cv.height = 16;
    const x = cv.getContext('2d'); x.fillStyle = '#ff00ff'; x.fillRect(1, 1, 14, 14); x.fillStyle = '#fff'; x.font = 'bold 12px monospace'; x.fillText('?', 5, 13);
    return cv;
  };
  const spriteTex = (key) => (A.has(key) ? tex(`s:${key}`, A.canvas(key)) : tex('s:?', missingCanvas()));

  function clear() {
    stageObjs.forEach((o) => o.destroy());
    stageObjs = []; things = {}; player = null; bubble = null; activeId = null;
    if (activeTween) { activeTween.stop(); activeTween = null; }
    if (moveTween) { moveTween.stop(); moveTween = null; }
  }
  const add = (o) => { stageObjs.push(o); return o; };
  const foot = (x, y, lift = 0) => [(x + 0.5) * TZ, (y + 1) * TZ - 2 - lift * Z];

  B.build = (st, pl) => when(() => {
    clear();
    game.scale.resize(st.cols * TZ, st.rows * TZ);
    scene.cameras.main.setBackgroundColor('#86c06c');
    // ground
    for (let y = 0; y < st.rows; y++) for (let x = 0; x < st.cols; x++) {
      const letter = st.map[y][x], vs = A.tileFor(st.id, letter);
      const def = vs ? vs[(x * 7 + y * 13) % vs.length] : null;
      const key = def ? tex(`t:${st.id}:${letter}:${(x * 7 + y * 13) % vs.length}`, A.tileCanvas(def)) : tex('s:?', missingCanvas());
      add(scene.add.image(x * TZ, y * TZ, key).setOrigin(0).setScale(Z).setDepth(0));
    }
    // board texture: lane dashes, zebra stripes, shelter roof
    (st.scenery || []).forEach((s) => {
      const name = s.className === 'road-dash' ? 'road-dash' : ['zebra', 'shelter'].includes(s.className) ? s.className : null;
      if (name) add(scene.add.image(s.x * TZ, s.y * TZ, spriteTex(name)).setOrigin(0).setScale(Z).setDepth(1));
    });
    // objects and people (sorted by row so lower ones draw in front)
    const all = [...(st.objects || []).map((o) => ({ t: o, kind: 'object' })), ...st.entities.map((e) => ({ t: e, kind: e.kind === 'door' ? 'door' : 'person' }))];
    all.forEach(({ t, kind }) => {
      const key = t.sprite || t.id, def = A.defs[key];
      const letter = st.map[t.y] && st.map[t.y][t.x];
      const lift = kind === 'object' ? (LIFT[letter] || 0) : 0;
      const [fx, fy] = foot(t.x, t.y, lift);
      if (def && def.meta.shadow && kind !== 'door') add(scene.add.ellipse(fx, fy - 1, Math.min(def.w, 14) * Z * 0.8, 4 * Z, 0x000000, 0.2).setDepth(5 + t.y));
      const spr = add(scene.add.image(fx, kind === 'door' ? (t.y + 1) * TZ : fy, spriteTex(key)).setOrigin(0.5, 1).setScale(Z).setDepth((kind === 'door' ? 4 : 10) + t.y + (lift ? 0.2 : 0)));
      spr.baseY = spr.y;
      things[t.id] = spr;
    });
    // the player
    const [px, py] = foot(pl.x, pl.y);
    player = add(scene.add.image(px, py, spriteTex('player')).setOrigin(0.5, 1).setScale(Z).setDepth(10.5 + pl.y));
    bubble = add(scene.add.image(px, py - 24 * Z - 2, spriteTex('bubble')).setOrigin(0.5, 1).setScale(Z * 0.6).setDepth(60).setAlpha(0));
  });

  B.setPlayer = (x, y, instant) => when(() => {
    if (!player) return;
    const [px, py] = foot(x, y);
    if (moveTween) { moveTween.stop(); moveTween = null; }
    player.setDepth(10.5 + y);
    if (instant) { player.setPosition(px, py); bubble.setPosition(px, py - 24 * Z - 2); return; }
    moveTween = scene.tweens.add({ targets: [player], x: px, y: py, duration: 105, ease: 'Linear' });
    scene.tweens.add({ targets: [bubble], x: px, y: py - 24 * Z - 2, duration: 105, ease: 'Linear' });
  });

  B.setNear = (on) => when(() => { if (bubble) bubble.setAlpha(on ? 1 : 0); });

  /** The thing being used (a person talking, an object being read) hops gently. */
  B.setActive = (id) => when(() => {
    if (id === activeId) return;
    if (activeTween) { activeTween.stop(); activeTween = null; }
    if (activeId && things[activeId]) things[activeId].y = things[activeId].baseY;
    activeId = id;
    const spr = id && things[id];
    if (spr) activeTween = scene.tweens.add({ targets: spr, y: spr.baseY - 2 * Z, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  });

  B.ready = () => ready;
  B.size = () => (game ? { w: game.scale.width, h: game.scale.height } : null);
  /** the canvas, for tests */
  B.canvas = () => (game ? game.canvas : null);
})(window.MSC = window.MSC || {});

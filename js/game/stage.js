/*
 * The stages (street, café, shop, market). Each is a small tile board built from data/stages/*.js.
 * The board DOM is rebuilt only when the stage changes; moving, selecting and relabelling just change
 * positions / classes / text, so nothing on the page reflows when you act.
 *
 * Doors: stepping onto a door (or tapping it, or its button) fades to black and back (W.fadeMs in total),
 * switches stage and plays an arrival sound. Every stage's doors lead to the street, the street's to the others.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state;
  const W = MSC.data.world;
  const ST = {};
  let walkTimer = null;
  let busy = false;           // a stage change is in progress
  let pending = null;         // an entity we are on our way to in another stage

  // ───────────── lookups ─────────────
  const stage = () => W.stages[S.stage];
  const stageList = () => Object.values(W.stages);
  const isDoor = (e) => e.kind === 'door';
  ST.stage = stage;

  /** Find a person / door / object by id in ANY stage → { ent, stage, type: 'door' | 'person' | 'object' } */
  ST.find = (id) => {
    for (const st of stageList()) {
      const e = st.entities.find((x) => x.id === id);
      if (e) return { ent: e, stage: st.id, type: isDoor(e) ? 'door' : 'person' };
      const o = (st.objects || []).find((x) => x.id === id);
      if (o) return { ent: o, stage: st.id, type: 'object' };
    }
    return null;
  };

  /** Where you appear after `door`: its own `arrive`, or (if left out) a free tile beside the door that leads back, in the other stage. */
  ST.arrival = (door) => {
    if (door.arrive) return { ...door.arrive };
    const to = W.stages[door.to];
    const back = to.entities.find((e) => isDoor(e) && e.to === S.stage);
    if (!back) return { ...to.playerStart };
    const free = (x, y) => x >= 0 && y >= 0 && x < to.cols && y < to.rows && ![...W.blockedTiles, ...(to.blockedTiles || [])].includes(to.map[y][x])
      && !solids(to).some((t) => t.x === x && t.y === y) && !to.entities.some((t) => isDoor(t) && t.x === x && t.y === y);
    const side = [[0, 1], [0, -1], [-1, 0], [1, 0]].map(([dx, dy]) => ({ x: back.x + dx, y: back.y + dy })).find((p) => free(p.x, p.y));
    return side || { ...to.playerStart };
  };

  // Only what belongs to the player's level is in a place (data/levels.js): the rest appears after levelling up.
  const ents = (st = stage()) => st.entities.filter((e) => !MSC.levels || MSC.levels.visible(e, 'person'));
  const objs = (st = stage()) => (st.objects || []).filter((o) => !MSC.levels || MSC.levels.visible(o, 'object'));
  ST.visibleStage = (st = stage()) => ({ ...st, entities: ents(st), objects: objs(st) });
  const solids = (st = stage()) => [...ents(st).filter((e) => !isDoor(e)), ...objs(st)];
  const doorAt = (x, y) => ents().find((e) => isDoor(e) && e.x === x && e.y === y) || null;
  const thingAt = (x, y) => ents().concat(objs()).find((e) => e.x === x && e.y === y) || null;
  const blocked = () => [...W.blockedTiles, ...(stage().blockedTiles || [])];

  const label = (ent) => {
    const py = D.sentencePinyin(ent.hanzi);
    return S.displayMode === 1 ? py : S.displayMode === 2 ? `${ent.hanzi} · ${py}` : ent.hanzi;
  };

  // ───────────── building the board ─────────────
  function buildBoard() {
    const st = stage();
    const board = document.getElementById('board');
    board.style.setProperty('--cols', st.cols);
    board.style.setProperty('--rows', st.rows);
    board.style.setProperty('--ar', `${st.cols} / ${st.rows}`);
    board.style.setProperty('--ar-m', `${st.cols} / ${st.rows + 1}`);
    board.dataset.stage = st.id;
    const title = document.getElementById('stage-title');
    if (title) title.textContent = st.name;
    // HTML on top of the canvas: name tags (people and doors) and Chinese board signs. The drawing itself is Phaser's (js/ui/board.js).
    const scenery = (st.scenery || []).filter((s) => s.text).map((s) =>
      `<div class="cell scenery" style="--x:${s.x};--y:${s.y}"><span class="${s.className || ''}">${MSC.ui.signHtml(s.text)}</span></div>`).join('');
    const tags = ents(st).map((e) =>
      `<div class="cell entity ${isDoor(e) ? 'door' : ''}" id="ent-${e.id}" style="--x:${e.x};--y:${e.y}"><span class="entity-label ${e.badge}" data-ent-label="${e.id}"></span></div>`).join('');
    document.getElementById('board-dom').innerHTML = scenery + tags;
    MSC.board.build(ST.visibleStage(st), S.player);
    // the buttons above the board: the people and doors of THIS stage (simple objects have no button)
    document.getElementById('pills').innerHTML = ents(st).map((e) =>
      `<button class="pill ${e.pill}" data-click="go" data-arg="${e.id}">${MSC.art.img(e.sprite || e.id, 2, true)}<span>${U.esc(e.name)}</span></button>`).join('');
  }

  ST.build = () => {
    const first = W.stages[W.start];
    S.stage = S.stage || W.start;
    if (!S.stageInit) { S.player = { ...first.playerStart }; S.stageInit = true; }
    MSC.board.init(document.getElementById('board-gl'));
    buildBoard();
    const board = document.getElementById('board');
    board.addEventListener('click', (e) => {
      if (busy) return;
      const st = stage(), r = board.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * st.cols);
      const y = Math.floor(((e.clientY - r.top) / r.height) * st.rows);
      pending = null;
      ST.walkTo(x, y);
    });
    ST.refresh();
  };

  /** Re-apply labels (display mode), player position and the active highlight. No DOM is added or removed. */
  ST.refresh = () => {
    const st = stage();
    ents(st).forEach((e) => {
      const l = document.querySelector(`[data-ent-label="${e.id}"]`);
      if (l) {
        l.textContent = label(e);
        l.setAttribute('data-zh-interactive', '1');                       // hold a name tag for its meaning (a tap still walks there)
        l.setAttribute('data-tip-zh', `${e.hanzi} (${D.sentencePinyin(e.hanzi)})`);
        l.setAttribute('data-tip-en', e.name);
      }
    });
    MSC.board.setPlayer(S.player.x, S.player.y);
    MSC.board.setActive(S.active);
    MSC.board.setNear(!!ST.adjacent());
    fitLabels();
    fitSigns();
  };

  /** Name tags are wider than their cell. Slide any tag that would stick out of the board back inside, and nudge
   *  tags that would sit on top of each other apart (never clipped, never unreadable). */
  function fitLabels() {
    const board = document.getElementById('board');
    if (!board) return;
    const b = board.getBoundingClientRect();
    const labels = [...board.querySelectorAll('.entity-label')];
    labels.forEach((l) => { l.style.transform = ''; });                     // measure at the natural position
    const placed = [];
    labels.sort((p, q) => p.getBoundingClientRect().left - q.getBoundingClientRect().left).forEach((l) => {
      let r = l.getBoundingClientRect();
      const dx = r.right > b.right - 3 ? b.right - 3 - r.right : r.left < b.left + 3 ? b.left + 3 - r.left : 0;
      let dy = 0;
      for (let tries = 0; tries < 3; tries++) {
        const hit = placed.find((p) => r.left < p.right + 1 && r.right + dx > p.left - 1 && r.top + dy < p.bottom && r.bottom + dy > p.top);
        if (!hit) break;
        dy = hit.bottom - r.top + 1;
      }
      if (dx || dy) l.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
      r = l.getBoundingClientRect();
      placed.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    });
  }
  /** Shop-front signs on a narrow board would sit on top of each other: stagger neighbours onto a second line. */
  function fitSigns() {
    const board = document.getElementById('board');
    if (!board) return;
    const signs = [...board.querySelectorAll('.scenery-sign')];
    signs.forEach((s) => { s.style.transform = ''; });
    signs.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const placed = [];
    signs.forEach((s) => {
      const r = s.getBoundingClientRect();
      let dy = 0;
      for (let tries = 0; tries < 2; tries++) {
        const hit = placed.find((p) => r.left < p.right + 2 && r.right > p.left - 2 && r.top + dy < p.bottom && r.bottom + dy > p.top);
        if (!hit) break;
        dy = hit.bottom - r.top + 1;
      }
      if (dy) s.style.transform = `translateY(${Math.round(dy)}px)`;
      placed.push({ left: r.left, right: r.right, top: r.top + dy, bottom: r.bottom + dy });
    });
  }
  window.addEventListener('resize', () => { fitLabels(); fitSigns(); });

  // ───────────── walking ─────────────
  ST.walkable = (x, y) => {
    const st = stage();
    if (x < 0 || x >= st.cols || y < 0 || y >= st.rows) return false;
    if (blocked().includes(st.map[y][x])) return false;
    return !solids().some((e) => e.x === x && e.y === y);
  };

  ST.adjacent = () => {
    const { x, y } = S.player;
    return solids().find((e) => {
      const z = e.zone;
      return Math.abs(e.x - x) + Math.abs(e.y - y) <= 1 || (z && x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2);
    }) || null;
  };

  ST.activate = (id, speak) => {
    const changed = S.active !== id;
    S.active = id;
    const f = id && ST.find(id);
    if (f && f.type === 'object') learnObject(f.ent);
    if (changed && id) MSC.emit('enter', id);        // e.g. Xiao Li starts a new conversation
    ST.refresh();
    if (changed || speak) MSC.panel.render(changed);
    if (speak && f) MSC.speech.say(f.ent.hanzi);
  };

  /** Walking up to a simple object teaches its word (and any words on its sign). */
  function learnObject(o) {
    MSC.vocab.discoverText(o.hanzi);
    (o.text || []).forEach((l) => MSC.vocab.discoverText(l.hanzi));
  }

  ST.move = (dx, dy) => {
    if (busy) return;
    pending = null;
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }
    const nx = S.player.x + dx, ny = S.player.y + dy;
    const door = doorAt(nx, ny);
    if (door) { S.player.x = nx; S.player.y = ny; ST.refresh(); ST.through(door); return; }
    if (!ST.walkable(nx, ny)) return;
    S.player.x = nx; S.player.y = ny;
    const adj = ST.adjacent();
    if (adj && S.active !== adj.id) ST.activate(adj.id, true); else ST.refresh();
  };

  /** Walk to (tx,ty) — or, if a person/object/door is there, to it. */
  ST.walkTo = (tx, ty, after) => {
    if (busy) return;
    const clicked = thingAt(tx, ty);
    const clickedDoor = clicked && isDoor(clicked) ? clicked : null;
    const st = stage();
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }

    // where we want to end up
    const goal = (x, y) => {
      if (clickedDoor) return x === clickedDoor.x && y === clickedDoor.y;
      if (clicked && clicked.stand) return x === clicked.stand.x && y === clicked.stand.y;
      if (clicked) return Math.abs(clicked.x - x) + Math.abs(clicked.y - y) === 1;       // a simple object: any free tile beside it
      return x === tx && y === ty;
    };
    const start = [S.player.x, S.player.y];
    const key = (x, y) => `${x},${y}`;
    const queue = [start];
    const parent = new Map([[key(...start), null]]);
    let found = null;
    const okStep = (x, y) => (clickedDoor && x === clickedDoor.x && y === clickedDoor.y) || ST.walkable(x, y);   // doors only as the destination
    while (queue.length) {
      const [cx, cy] = queue.shift();
      if (goal(cx, cy) && (ST.walkable(cx, cy) || (clickedDoor && cx === clickedDoor.x && cy === clickedDoor.y) || (cx === start[0] && cy === start[1]))) { found = [cx, cy]; break; }
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= st.cols || ny >= st.rows) return;
        if (!parent.has(key(nx, ny)) && okStep(nx, ny)) { parent.set(key(nx, ny), [cx, cy]); queue.push([nx, ny]); }
      });
    }
    if (!found) return;
    const path = [];
    for (let c = found; c && !(c[0] === S.player.x && c[1] === S.player.y); c = parent.get(key(c[0], c[1]))) path.unshift(c);

    const arrive = () => {
      if (clickedDoor && S.player.x === clickedDoor.x && S.player.y === clickedDoor.y) { ST.refresh(); ST.through(clickedDoor); return; }
      const target = clicked || ST.adjacent();
      if (target && !isDoor(target)) { ST.activate(target.id, !!clicked); if (clicked && MSC.panel.showPanel) MSC.panel.showPanel(); } else ST.refresh();
      if (after) after();
    };
    if (!path.length) { arrive(); return; }
    let i = 0;
    walkTimer = setInterval(() => {
      if (i >= path.length) { clearInterval(walkTimer); walkTimer = null; arrive(); return; }
      S.player.x = path[i][0]; S.player.y = path[i][1]; i++;
      ST.refresh();
    }, 110);
  };

  /** Go to a person / object / door anywhere: through the street's doors if it is in another stage. */
  ST.go = (id) => {
    if (busy) return;
    const f = ST.find(id);
    if (!f || (MSC.levels && !MSC.levels.visible(f.ent, f.type === 'object' ? 'object' : 'person'))) return;
    if (f.stage === S.stage) { pending = null; ST.walkTo(f.ent.x, f.ent.y); return; }
    const via = S.stage === W.start ? f.stage : W.start;                    // every place is reached from the street
    const door = ents().find((e) => isDoor(e) && e.to === via);
    if (!door) return;
    ST.walkTo(door.x, door.y);
    pending = id;
  };

  // ───────────── changing stage ─────────────
  const fadeEl = () => document.getElementById('stage-fade');

  /** Fade to black, switch to the other stage, fade back (W.fadeMs in total) and play its arrival sound. */
  ST.through = (door, instant) => {
    if (busy) return;
    const to = W.stages[door.to];
    if (!to) return;
    busy = true;
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }
    const half = instant ? 0 : Math.round(W.fadeMs / 2);
    const fade = fadeEl();
    if (fade) {
      fade.querySelector('.stage-fade-title').textContent = `${to.hanzi} · ${to.name}`;
      fade.style.transitionDuration = `${half}ms`;
      fade.classList.add('on');
    }
    setTimeout(() => {
      S.stage = to.id;
      S.player = ST.arrival(door);
      S.active = null;
      buildBoard();
      ST.refresh();
      MSC.panel.render(true);
      MSC.emit('stage', to.id);
      if (MSC.sfx) MSC.sfx.enter(to.sound);
      if (fade) fade.classList.remove('on');
      setTimeout(() => {
        busy = false;
        if (pending) { const p = pending; pending = null; ST.go(p); }
      }, half);
    }, half);
  };

  ST.busy = () => busy;

  /** Jump straight to a stage with no fade or sound (tests and tools). */
  ST.show = (id, at) => {
    const to = W.stages[id];
    S.stage = id; S.player = { ...(at || to.playerStart) }; S.active = null;
    buildBoard(); ST.refresh(); MSC.panel.render(true);
  };

  ST.interact = () => {
    const adj = ST.adjacent();
    if (adj) { ST.activate(adj.id, true); if (MSC.panel.showPanel) MSC.panel.showPanel(); }
    else MSC.log.say('Walk up to someone or something first.');
  };

  MSC.stage = ST;
  MSC.actions.go = (id) => ST.go(id);
  MSC.actions.move = (arg) => { const [dx, dy] = arg.split(',').map(Number); ST.move(dx, dy); };
  MSC.actions.interact = () => ST.interact();
})(window.MSC = window.MSC || {});

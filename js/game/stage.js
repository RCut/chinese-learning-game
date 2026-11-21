/*
 * The 12×9 street-corner board. The board DOM is built ONCE; moving, selecting and relabelling
 * only change positions / classes / text, so nothing on the page reflows when you act.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, S = MSC.state;
  const W = MSC.data.world;
  const ST = {};
  let walkTimer = null;
  let playerEl = null;

  const entityById = (id) => W.entities.find((e) => e.id === id);
  const label = (ent) => {
    const py = D.sentencePinyin(ent.hanzi);
    return S.displayMode === 1 ? py : S.displayMode === 2 ? `${ent.hanzi} · ${py}` : ent.hanzi;
  };

  ST.build = () => {
    const board = document.getElementById('board');
    const tiles = [];
    for (let y = 0; y < W.rows; y++) for (let x = 0; x < W.cols; x++) tiles.push(`<div class="tile ${W.tileClasses[W.map[y][x]]}"></div>`);
    const scenery = W.scenery.map((s) =>
      `<div class="cell scenery" style="--x:${s.x};--y:${s.y}">${s.className === 'road-dash' ? '<i class="road-dash"></i>' : `<span class="${s.className || ''}">${U.esc(s.text)}</span>`}</div>`).join('');
    const entities = W.entities.map((e) =>
      `<div class="cell entity" id="ent-${e.id}" style="--x:${e.x};--y:${e.y}"><span class="entity-emoji">${e.emoji}</span><span class="entity-label ${e.badge}" data-ent-label="${e.id}"></span></div>`).join('');
    board.innerHTML = `<div class="tiles">${tiles.join('')}</div>${scenery}
      <div class="cell player" id="player" style="--x:${S.player.x};--y:${S.player.y}"><span class="player-bubble">💬</span><span class="player-emoji">${W.playerEmoji}</span></div>${entities}`;
    playerEl = document.getElementById('player');
    board.addEventListener('click', (e) => {
      const r = board.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * W.cols);
      const y = Math.floor(((e.clientY - r.top) / r.height) * W.rows);
      ST.walkTo(x, y);
    });
    document.getElementById('pills').innerHTML = W.entities.map((e) =>
      `<button class="pill ${e.pill}" data-click="go" data-arg="${e.id}">${e.emoji} ${U.esc(e.name)}</button>`).join('');
    ST.refresh();
  };

  /** Re-apply labels (display mode), player position and the active highlight. No DOM is added or removed. */
  ST.refresh = () => {
    W.entities.forEach((e) => {
      const l = document.querySelector(`[data-ent-label="${e.id}"]`);
      if (l) l.textContent = label(e);
      document.getElementById(`ent-${e.id}`).classList.toggle('active', S.active === e.id);
    });
    playerEl.style.setProperty('--x', S.player.x);
    playerEl.style.setProperty('--y', S.player.y);
    playerEl.classList.toggle('near', !!ST.adjacent());
  };

  ST.walkable = (x, y) => {
    if (x < 0 || x >= W.cols || y < 0 || y >= W.rows) return false;
    if (W.blockedTiles.includes(W.map[y][x])) return false;
    return !W.entities.some((e) => e.x === x && e.y === y);
  };

  ST.adjacent = () => {
    const { x, y } = S.player;
    return W.entities.find((e) => {
      const z = e.zone;
      return Math.abs(e.x - x) + Math.abs(e.y - y) <= 1 || (z && x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2);
    }) || null;
  };

  ST.activate = (id, speak) => {
    const changed = S.active !== id;
    S.active = id;
    ST.refresh();
    if (changed || speak) MSC.panel.render(changed);
    if (speak && id) MSC.speech.say(entityById(id).hanzi);
  };

  ST.move = (dx, dy) => {
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }
    const nx = S.player.x + dx, ny = S.player.y + dy;
    if (!ST.walkable(nx, ny)) return;
    S.player.x = nx; S.player.y = ny;
    const adj = ST.adjacent();
    if (adj && S.active !== adj.id) ST.activate(adj.id, true); else ST.refresh();
  };

  ST.walkTo = (tx, ty, after) => {
    const clicked = W.entities.find((e) => e.x === tx && e.y === ty);
    const dest = clicked ? clicked.stand : { x: tx, y: ty };
    if (!ST.walkable(dest.x, dest.y)) return;
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }

    const key = (x, y) => `${x},${y}`;
    const queue = [[S.player.x, S.player.y]];
    const parent = new Map([[key(S.player.x, S.player.y), null]]);
    while (queue.length) {
      const [cx, cy] = queue.shift();
      if (cx === dest.x && cy === dest.y) break;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (!parent.has(key(nx, ny)) && ST.walkable(nx, ny)) { parent.set(key(nx, ny), [cx, cy]); queue.push([nx, ny]); }
      });
    }
    if (!parent.has(key(dest.x, dest.y))) return;
    const path = [];
    for (let c = [dest.x, dest.y]; c && !(c[0] === S.player.x && c[1] === S.player.y); c = parent.get(key(c[0], c[1]))) path.unshift(c);

    const arrive = () => {
      const target = clicked || ST.adjacent();
      if (target) ST.activate(target.id, !!clicked); else ST.refresh();
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

  ST.go = (id) => { const e = entityById(id); if (e) ST.walkTo(e.x, e.y); };

  ST.interact = () => {
    const adj = ST.adjacent();
    if (adj) ST.activate(adj.id, true);
    else MSC.toast.show('Walk up to someone or something first.');
  };

  MSC.stage = ST;
  MSC.actions.go = (id) => ST.go(id);
  MSC.actions.move = (arg) => { const [dx, dy] = arg.split(',').map(Number); ST.move(dx, dy); };
  MSC.actions.interact = () => ST.interact();
})(window.MSC = window.MSC || {});

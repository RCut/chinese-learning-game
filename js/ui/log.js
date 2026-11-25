/*
 * The notification log — the only place the game tells you things (new words, money, quests, tips, small errors).
 * One frame above the game: collapsed it is a single row with the latest message; expanded it is a scrollable list
 * (newest first, up to ~8 rows). It never covers the stage when collapsed and never shifts the layout (the list floats).
 *
 * Every Chinese word or character in a message is a button: it opens that word in the notebook.
 *   MSC.log.say(text)      plain text (Chinese in it becomes clickable)
 *   MSC.log.html(html)     trusted markup, for messages that carry their own buttons
 *   MSC.log.word(entry)    a newly learned word (several arriving together become one message)
 *   MSC.log.tip()          the first-time tip (opens the log once)
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict;
  const L = (MSC.log = {});
  const MAX = 100;
  const entries = [];                 // newest first: { html, kind, time }
  let open = false;
  let pending = [], timer = null;
  const $ = (id) => document.getElementById(id);

  /** The dictionary word a clicked word/character should open (a lone character opens a word that contains it). */
  function resolve(h) {
    if (D.get(h)) return h;
    const all = D.all().filter((e) => e.hanzi.includes(h));
    all.sort((a, b) => (MSC.vocab.has(b.hanzi) - MSC.vocab.has(a.hanzi)) || (a.hanzi.length - b.hanzi.length));
    return all.length ? all[0].hanzi : null;
  }
  const zh = (h, label) => {
    const target = resolve(h);
    return target
      ? `<button type="button" class="log-zh hz" data-click="log-open" data-arg="${U.esc(target)}" title="Open in the notebook">${U.esc(label || h)}</button>`
      : `<span class="hz">${U.esc(label || h)}</span>`;
  };
  /** Plain text → HTML in which every Chinese word / character is a button. */
  const linkify = (text) => D.segment(text).map((t) => {
    if (t.kind === 'text') return U.esc(t.text);
    if (t.kind === 'word') return zh(t.hanzi);
    if (t.kind === 'number') return t.parts.map((p) => zh(p)).join('');
    return zh(t.hanzi);
  }).join('');

  function add(html, kind) {
    const d = new Date();
    entries.unshift({ html, kind: kind || 'plain', time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` });
    if (entries.length > MAX) entries.length = MAX;
    render(true);
  }

  function render(flash) {
    const root = $('log');
    if (!root) return;
    const latest = entries[0];
    $('log-latest').innerHTML = latest ? latest.html : '<span class="log-empty">Notifications will appear here.</span>';
    $('log-latest').className = `log-latest ${latest ? latest.kind : ''}`;
    $('log-n').textContent = entries.length ? String(entries.length) : '';
    $('log-list').innerHTML = entries.length
      ? entries.map((e) => `<div class="log-item ${e.kind}"><span class="log-time">${e.time}</span><div class="log-msg">${e.html}</div></div>`).join('')
      : '<div class="log-item"><div class="log-msg log-empty">Nothing yet.</div></div>';
    root.classList.toggle('open', open);
    $('log-toggle').setAttribute('aria-expanded', String(open));
    $('log-toggle').textContent = open ? '▴' : '▾';
    if (flash && !open) { root.classList.remove('flash'); void root.offsetWidth; root.classList.add('flash'); }
  }

  L.say = (text) => add(linkify(text), 'plain');
  L.html = (html, kind) => add(html, kind || 'act');

  /** A newly learned word. Several arriving together (a conversation turn) become one message. */
  L.word = (entry) => {
    pending.push(entry);
    if (timer) return;
    timer = setTimeout(() => {
      const list = pending; pending = []; timer = null;
      const items = list.map((e) => `<span class="log-w">${zh(e.hanzi)} <span class="log-py">${U.esc(e.pinyin)}</span> <span class="log-en">${U.esc(e.english)}</span></span>`).join('');
      add(`✨ ${list.length === 1 ? 'New word' : 'New words'}: ${items}`, 'vocab');   // the words come first so they stay visible in the one-row view
    }, 200);
  };

  /** The first-time tip: one message, and the log opens once so it is seen. */
  L.tip = () => {
    if (MSC.state.tipSeen) return;
    MSC.state.tipSeen = true;
    MSC.progress.save();
    const tip = MSC.data.ui.onboardingTip;
    open = true;
    add(`💡 <b>${U.esc(tip.title)}</b> ${U.esc(tip.body)}`, 'tip');
  };

  L.count = () => entries.length;
  L.isOpen = () => open;
  L.clear = () => { entries.length = 0; render(false); };

  const A = MSC.actions;
  A['log-toggle'] = () => { open = !open; render(false); if (open) $('log-list').scrollTop = 0; };
  A['log-clear'] = () => { L.clear(); open = false; render(false); };
  A['log-open'] = (hanzi) => { open = false; render(false); A.tab('notebook'); A['open-word'](hanzi); };

  // tap outside the open list (or press Esc) to fold it away
  document.addEventListener('click', (e) => { if (open && !e.target.closest('#log')) { open = false; render(false); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { open = false; render(false); } });
  // tapping the message row itself (not a word) also toggles
  document.addEventListener('click', (e) => {
    const bar = e.target.closest('#log .log-bar');
    if (bar && !e.target.closest('button, a')) A['log-toggle']();
  });
  window.addEventListener('DOMContentLoaded', () => render(false));
})(window.MSC = window.MSC || {});

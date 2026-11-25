/*
 * PHRASES — the phrase book (data/phrases.js): lookup, level, words ↔ phrases links, discovery, and crediting uses.
 *   MSC.phrases.all() · get(id) · level(p) (highest HSK level of its words) · words(p) · withWord(hanzi) · chapters()
 *   MSC.phrases.find(text) → phrases contained in a sentence · scan(text) → discover them · discover(id)
 *   MSC.mastery.useText(text, how, place) → credit every word and phrase in something the player SAID
 */
(function (MSC) {
  const D = MSC.dict, S = MSC.state;
  const data = MSC.data.phrases || { chapters: [], list: [] };
  const PH = (MSC.phrases = {});
  const norm = (t) => String(t || '').replace(/[^\u3400-\u9fff]/g, '');           // Chinese characters only
  const wordsOf = (t) => D.segment(t).flatMap((x) => (x.kind === 'word' ? [x.hanzi] : x.kind === 'number' ? x.parts : []));

  const list = data.list.map((p) => {
    const words = [...new Set(wordsOf(p.hanzi))];
    return { ...p, words, key: `p:${p.id}`, norm: norm(p.hanzi), level: Math.max(0, ...words.map((w) => D.level(w))), extra: words.some((w) => !D.level(w)) };
  });
  const byId = new Map(list.map((p) => [p.id, p]));
  const byWord = new Map();
  list.forEach((p) => p.words.forEach((w) => { if (!byWord.has(w)) byWord.set(w, []); byWord.get(w).push(p); }));

  PH.all = () => list;
  PH.get = (id) => byId.get(String(id).replace(/^p:/, '')) || null;
  PH.chapters = () => data.chapters;
  PH.level = (p) => p.level;
  PH.words = (p) => p.words;
  PH.withWord = (hanzi) => byWord.get(hanzi) || [];
  PH.has = (id) => S.phraseSet.has(id);

  /** phrases that occur inside a sentence (longest first, at least 2 characters) */
  PH.find = (text) => {
    const n = norm(text);
    if (n.length < 2) return [];
    return list.filter((p) => p.norm.length >= 2 && n.includes(p.norm)).sort((a, b) => b.norm.length - a.norm.length);
  };

  /** The player has met a phrase. (PR 3 turns this into a short practice screen; for now it is added with a log message.) */
  PH.discover = (id) => {
    const p = PH.get(id);
    if (!p || S.phraseSet.has(p.id)) return false;
    S.phraseSet.add(p.id);
    if (MSC.mastery) MSC.mastery.seen(p.key);
    if (MSC.log) MSC.log.html(`💬 New phrase: <button type="button" class="log-zh hz" data-click="open-phrase" data-arg="${p.id}">${MSC.util.esc(p.hanzi)}</button> <span class="log-en">${MSC.util.esc(p.english)}</span>`, 'vocab');
    if (MSC.progress) MSC.progress.save();
    MSC.emit('phrase', p.id);
    return true;
  };
  PH.scan = (text) => PH.find(text).forEach((p) => PH.discover(p.id));

  /** Something the player SAID (built, typed or spoken) — every word and phrase in it gets a use. */
  MSC.mastery.useText = (text, how, place) => {
    const q = MSC.mastery.quality(how || {});
    const phrases = PH.find(text);
    phrases.forEach((p) => PH.discover(p.id));
    MSC.mastery.record([...wordsOf(text), ...phrases.map((p) => p.key)], q, place);
  };
})(window.MSC = window.MSC || {});

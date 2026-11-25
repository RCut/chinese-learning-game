/*
 * PHRASES — useful sentences and set expressions, in thematic chapters. Shown in the notebook's Phrases tab.
 *
 *   chapters  [{ id, title, blurb }] in the order the notebook shows them
 *   list      [{ id, hanzi, english, chapter, note? }]
 *     id        unique, lowercase-with-dashes (it is stored in the player's progress — never rename one)
 *     hanzi     the phrase with Chinese punctuation; every word must be in the dictionary (pinyin is generated)
 *     english   a natural translation
 *     note      optional short usage tip (English; Chinese in it must be dictionary words)
 * A phrase's HSK level is NOT written: it is the highest HSK level among its words (data/hsk.js). Its words link
 * to it automatically (a word's pane lists the phrases that use it). Keep non-HSK ("extra") words to ~20% of phrases.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.phrases = {
    chapters: [],
    list: [],
  };
})(window.MSC = window.MSC || {});

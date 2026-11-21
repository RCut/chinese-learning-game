# Mandarin Street Corner (中文街角)

A browser game for learning Mandarin. No build step, no backend: open `index.html`
(or serve the folder, e.g. `npx serve .`).

## Where things live

```
index.html            page shell (loads everything below)
css/styles.css        all styling

data/                 ← CONTENT. Edit these; no game code needed.
  dictionary.js       every word/phrase: hanzi, pinyin, english, category, related, note
  characters.js       one entry per character: meaning + components (radicals)
  world.js            the map, scenery and the interactive entities
  menu.js             café drinks/food (prices, measure words, hints) and fruit-stall items
  quests.js           all dialogue, objectives, hints and reactions
  ui-text.js          quest tracker, destinations, first-time tip

js/core/              pure logic, no DOM
  util.js             helpers, tone-mark conversion, number → hanzi
  dictionary.js       lookup, sentence segmentation, generated pinyin, character breakdown, related words
  pinyin.js           parses typed pinyin ("wo3", "wǒyào", "kafei", hanzi) and compares it
  state.js            shared state, progress saving, vocabulary discovery
  speech.js           text-to-speech
js/ui/                toast.js · gestures.js (tap / hold / 🔊) · text.js (sentence rendering) · panel.js · notebook.js
js/game/              economy.js (wallet, prices) · stage.js (board) · barista.js (orders) · quizzes.js
js/main.js            start-up and header controls

tools/check-data.js   validates all data files
```

**After editing anything in `data/`, run `node tools/check-data.js`.** It catches duplicate
words, wrong syllable counts, broken `related` links, and Chinese in dialogue that isn't in the
dictionary (dialogue pinyin is generated from the dictionary, so a word must exist there).

## Common edits

- **Add a word:** one line in `data/dictionary.js` (+ its characters in `data/characters.js`).
  `starter: true` puts it in the notebook from the start; otherwise it is learned when first seen.
- **Related words:** automatic (phrases that contain it, parts, words it appears in) plus the optional
  curated `related: [...]` list on the entry — keep that list to words genuinely used together.
- **Add a menu item / price range:** `data/menu.js`. Orders, accepted answers, tiles and the
  grammar hint are all derived from it.
- **Change a line of dialogue or a hint:** `data/quests.js`.

## Behaviour notes

- **Hints:** hidden by default. 💡 Hint reveals grammar → word-by-word clue → answer; a wrong answer opens the next level.
  Objectives are English-only. NPC translations are blurred until tapped.
- **Money:** one wallet (header chip). Paying Barista Lin or the fruit stall deducts from it; tips add to it.
  Each new café order is built from what you can actually afford; if you can't afford anything, Lin says so.
- **Audio:** tap a word to hear it, hold for the meaning, 🔊 for the whole sentence.

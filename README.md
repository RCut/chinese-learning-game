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
  writing.js          Master Wang: the pool of characters (linked word, tier, mnemonic, stroke tips), rules, dialogue
  chat.js             Xiao Li: the branching conversations (patterns for every accepted answer, random slots)
  strokes.js          GENERATED stroke-order data for those characters (tools/build-strokes.js)

js/core/              pure logic, no DOM
  util.js             helpers, tone-mark conversion, number → hanzi
  stroke-match.js     compares a drawn stroke with the reference stroke (order / direction / shape)
  pattern.js          answer patterns for the chat: (optional)  [a|b]  {slot}
  dictionary.js       lookup, sentence segmentation, generated pinyin, character breakdown, related words
  pinyin.js           parses typed pinyin ("wo3", "wǒyào", "kafei", hanzi) and compares it
  state.js            shared state, progress saving, vocabulary discovery
  speech.js           text-to-speech
js/ui/                toast.js · gestures.js (tap / hold / 🔊) · text.js (sentence rendering) · panel.js · notebook.js
                      stroke-board.js (SVG writing canvas) · writer.js (the writing tray) · wang-panel.js · howto.js · chat-panel.js
js/game/              economy.js (wallet, prices) · stage.js (board) · barista.js (orders) · quizzes.js
                      writing.js (Master Wang's lessons, mastery, review — no DOM)
                      chat.js (Xiao Li's conversations: random start, matching, branching — no DOM)
js/main.js            start-up and header controls

tools/check-data.js   validates all data files
tools/build-strokes.js  regenerates data/strokes.js from the hanzi-writer-data package
tests/                stroke matcher, validator and browser tests (see "Tests")
licenses/             Arphic Public License (covers the stroke data) — see THIRD_PARTY_NOTICES.md
```

**After editing anything in `data/`, run `node tools/check-data.js`.** It catches duplicate
words, wrong syllable counts, broken `related` links, and Chinese in dialogue that isn't in the
dictionary (dialogue pinyin is generated from the dictionary, so a word must exist there).

## Common edits

- **Add a word:** one line in `data/dictionary.js` (+ its characters in `data/characters.js`).
  `starter: true` puts it in the notebook from the start; otherwise it is learned when first seen.
- **Related words:** the details panel lists, in this order, (1) set *phrases* that contain the word, (2) the entry's
  curated `related: [...]` — collocations (喝 → 咖啡), measure-word pairs, near-synonyms and opposites (热/冰, 二/两) —
  (3) shorter words it is built from (火车站 → 火车), (4) longer words that contain it. Capped at 8. If a compound
  has lost the meaning of a part (在 ↛ 现在, 水 ↛ 水果) add it to that word's `exclude: [...]`. The validator rejects
  dead links, self-links and duplicates, and warns about one-way links.
- **Add a menu item / price range:** `data/menu.js`. Orders, accepted answers, tiles and the
  grammar hint are all derived from it.
- **Change a line of dialogue or a hint:** `data/quests.js`.

## Behaviour notes

- **Hints:** hidden by default. 💡 Hint reveals grammar → word-by-word clue → answer; a wrong answer opens the next level.
  Objectives are English-only. NPC translations are blurred until tapped.
- **Money:** one wallet (header chip). Paying Barista Lin or the fruit stall deducts from it; tips add to it.
  Each new café order is built from what you can actually afford; if you can't afford anything, Lin says so.
- **Audio:** tap a word to hear it, hold for the meaning, 🔊 for the whole sentence.
- **Popups:** every toast has a ✕ and can be swiped away (hold one to keep reading); "Clear all" appears when two or more
  stack up. The first-time tip swipes away too, and the notebook's phone bottom sheet closes with a swipe down.

## Master Wang — learning to write (王师傅)

Wang's stall is on the street from the first minute (no quest needed).

- **First visit:** a short tutorial with 一 and 十, then straight into choosing a lesson. Both count as mastered.
- **Lesson:** Wang offers 8 random unlearned characters (from the lowest tier that still has some); the player picks 4
  ("Let Wang choose" and unlimited reshuffles are available; "Leave this lesson" drops an unfinished lesson so you can choose other characters). Each character goes Watch → Trace → Guided; then all 4 are
  written from memory in random order. **Mastered = at most 2 mistakes and no full-character hint.** A failed character
  goes back through Guided once and is checked again, without limit or penalty. Leaving mid-lesson keeps progress.
- **Only when all 4 are mastered:** the characters hang on Wang's wall (in the player's own handwriting) and their
  linked words are added to — or gain "How to write" in — the notebook, with one summary notice.
- **Review:** a random pack of up to 10 of everything you have mastered (not the lesson groups), mastery check only. Failing never removes anything.
- **Notebook:** "How to write" shows the animated stroke order (play / loop / step), stroke count, highlighted
  component, Wang's mnemonic, your best handwriting next to the reference, and Practice (memory mode; it never changes
  mastery, only replaces your handwriting with a better attempt).
- **Seals:** gold = no mistakes and no hints · red = 1–2 mistakes or one hint step · plain ink = more.
- **Hints (same ladder as elsewhere):** stroke tip → start point and direction → the full character.

### Adding characters
1. Add the character to `pool` in `data/writing.js` (pinyin, meaning, linked `word`, `tier`, `mnemonic`, optional `rules`, `tips`, `confusable`).
2. Make sure its linked word exists in `data/dictionary.js`.
3. Regenerate the stroke data: `npm i hanzi-writer-data` somewhere outside the repo, then
   `node tools/build-strokes.js <path>/node_modules/hanzi-writer-data`.
4. `node tools/check-data.js` — flags missing stroke data, a bad linked word, a missing mnemonic or tier,
   a stroke tip for a stroke the character doesn't have, and a tier with fewer than 4 characters.

## Tests

```bash
node tools/check-data.js                 # data validator
node tests/stroke-match.test.js          # stroke matcher against all 42 characters (clean + shaky input)
node tests/validator.test.js             # proves the validator flags each content problem
node tests/related.test.js               # the "related words" panel only shows genuinely related words
node tests/e2e-popups.js                 # browser: every popup dismisses with ✕ or a swipe (desktop + phone)
node tests/chat.test.js                  # chat engine: plays every path of every conversation (3,000+ paths)
node tests/e2e-speak.js                  # browser: speech input (mocked recogniser) shows what was heard as a tappable line
node tests/e2e-chat.js                   # browser: talking to Xiao Li — tiles, typing, hints, branching, a new chat each visit
node tests/e2e-writing.js                # browser: tutorial, a full lesson, wall, notebook (needs playwright)
node tests/e2e-writing-rules.js          # browser: feedback, hints, review, practice, offers, phone touch
```

## Vocabulary: 200 HSK 1–2 words

`data/dictionary.js` holds every word. Entries with `hsk: 1` or `hsk: 2` are the **200 HSK 1–2 words** the game teaches
(135 + 65; the notebook counts your progress towards them and can filter by them). Entries without `hsk` are helpers
(names, stroke terms, extra phrases). The levels follow the classic HSK 2.0 lists as best recalled — spot-check before
relying on them for exam prep.

The validator enforces the target: at least 200 HSK words, and **every character of every HSK word can be learned at
Master Wang's** (`data/writing.js` has 235 characters, tiered by stroke count). To add a word: add it to the dictionary
with `hsk`, make sure each of its characters has an entry in `data/characters.js` and in the Wang pool, and rebuild the
stroke data (see "Adding characters").

## Xiao Li (小李) — conversation practice

Walk up to Xiao Li (right side of the street, or the **Xiao Li** button) and a **new random conversation** starts —
never the same one twice in a row. There are **24 branching conversations** (some start with Xiao Li, some with you),
covering all 200 HSK words: meeting people, family, hobbies, weather and plans, food, time, shopping, directions, feelings,
phone calls, home, daily routine, polite address, asking questions, handwriting…

- **You build, you don't pick.** There are no answer buttons. Each turn has an English *goal* ("Say that you have an older
  brother"), and you assemble the Chinese from word tiles (extra distractor words are mixed in) or type pinyin/hanzi, or 🎙️ **speak** (browser speech recognition): what was heard is shown like Xiao Li's own lines — tappable words, pinyin per the display toggle, an English gloss — and right words in any tones are accepted.
  Several phrasings are accepted; which one you choose — and sometimes *what* you choose to say — decides how the
  conversation branches. Random slots (a hobby, a name, the weather) make the same conversation differ between visits.
- **Hints on demand:** 💡 Hint → the pattern to use → the words you need, word by word → example answers. A wrong answer opens
  the next level by itself, never the answer. Tone slips are called out ("right words, tones are a little different").
- **Adding a conversation:** copy one in `data/chat.js`. Replies are *patterns*: `(是，)我是学生` (optional part),
  `我[想|要]喝茶` (alternatives), `{drink}` (random slot). The validator checks that every word exists in the dictionary,
  every path ends, every conversation really branches, no answer is accepted by two different branches, and goals are English-only.

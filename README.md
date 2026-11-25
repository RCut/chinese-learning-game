# Mandarin Street Corner (中文街角)

A browser game for learning Mandarin through a small Chinese street: shops to walk into, people to talk to, and characters to write.
No build step, no backend — open `index.html` (or serve the folder, e.g. `npx serve .`). Progress is saved in the browser.

- **Part 1 — The game** (what a player sees and does)
- **Part 2 — The code** (structure, editing content, tests)

---

# Part 1 — The game

## The world

Four places. Walk with the arrow keys / WASD / on-screen pad, or tap the map or a button above it. **E** or **Talk** interacts.

| Place | What is there |
|---|---|
| **Street** (hub) | Doors to the other places (named on the board), a bus stop, signs, Xiao Li, a lost traveler, 17 everyday objects |
| **Café** | Barista Lin (order and pay), the café menu, 16 objects (cups, teapot, cake display…) |
| **Master Wang's shop** | Master Wang (learn to write), 16 objects (brush, ink, scrolls, lanterns…) |
| **Market** | Shopkeeper Zhang (buying conversations), the fruit stall, 7 food stalls with price boards, 22 objects |

- **Doors:** step on one (or tap it, or its button). The screen fades to black and back in 0.5 s, with a short arrival sound —
  street ambience going out, a soft jingle going in. Every place has a door back to the street.
- **Buttons above the board** list the people and doors of the current place. Tapping someone in another place walks you there through the doors.
- **Simple objects** (a tree, a teapot, a stall…) have no button or tag. Walk up to one, or tap it, and its word goes into your notebook;
  signs and price boards can be read there.
- **Starting quest:** check the café menu, then order a drink and a meal from Barista Lin.

## Learning features

- **Words everywhere:** tap a Chinese word to hear it, press and hold for its meaning, 🔊 for the whole sentence. Translations of
  NPC lines are blurred until tapped. The header toggle switches **Pinyin / Hybrid / Hanzi** everywhere.
- **Notebook:** every word you meet. Filter by category, by **HSK 1–2** (with a progress bar) or **✍ Can write**. Each word shows
  its characters and components, related words (phrases, collocations, parts, compounds) and, once learned, *How to write*.
- **Vocabulary:** the 200 words of HSK 1–2 plus about 200 helper words from the places (names, objects, foods).
- **Barista Lin:** build the order from word tiles, type pinyin, or speak. Prices are real: one wallet (header), tips add to it,
  every order is built from what you can afford.
- **Xiao Li (street) and Shopkeeper Zhang (market):** a new random conversation every visit — 24 with Xiao Li (covering all 200 HSK words),
  8 buying conversations with Zhang. You **build** your replies from word tiles (with distractors), **type** them, or **speak** them;
  several phrasings are accepted and your choice decides how the conversation branches. Tone slips are called out.
- **Speaking:** what the recogniser heard is shown like an NPC line (tappable words, pinyin per the toggle, English gloss); right
  words in any tones are accepted.
- **Fruit stall and traveler:** short pick-the-right-reply encounters (the fruit stall spends money, the traveler gives a tip).
- **Hints are on demand:** nothing helpful is shown by default. 💡 Hint → grammar/pattern → word-by-word clue → the answer. A wrong
  answer opens the next level; the answer is always your call. Objectives are English-only.

## Master Wang — learning to write (王师傅)

- **Tutorial** (一, 十), then lessons: Wang offers 8 random unlearned characters (lowest tier first, unlimited reshuffle); pick 4.
  Each goes Watch → Trace → Guided, then all 4 are written from memory in random order. You can leave an unfinished lesson to pick other characters.
- **Mastered** = at most 2 mistakes and no full-character hint. A failed character goes back through Guided once and is checked again.
  When all 4 are mastered they hang on Wang's wall in your own handwriting and their words gain *How to write* in the notebook.
- **Seals:** gold = no mistakes or hints · red = 1–2 mistakes or one hint · plain ink = more.
- **Hints:** the character's shape reminder → start point and direction → the full character (counts as a hint).
- **Review:** a random pack of up to 10 from everything you have mastered, mastery check only; the English meaning is blurred.
  Failing never removes anything.
- **Practice** (from the notebook): memory mode; never changes mastery, only replaces your handwriting with a better attempt.
- **Stroke rules** (e.g. horizontal before vertical) unlock as you meet them. The stroke order is checked by direction, order and shape.
- Every character of every HSK word can be learned here (233 characters, tiered by stroke count).

## Interface notes

- Every popup has a ✕ and can be swiped away (hold to keep reading); "Clear all" appears when several stack up.
- The writing tray is a bottom sheet on phones (swipe down to close) and a side panel on desktop.
- Layout never jumps while you act: hint and feedback areas keep their slots.

---

# Part 2 — The code

Vanilla JS, no dependencies, no build step. All code hangs off one global, `window.MSC`, split into script-order-loaded modules.

## Structure

```
index.html              page shell; loads data, then js/core → ui/game → main (order matters)
css/styles.css          shared styling · css/stage-<place>.css  per-place tiles and scenery

data/                   CONTENT — edit these, no game code needed
  dictionary.js         every word: hanzi, pinyin, pinyinNum, english, pos, category, hsk, related, exclude, note
  characters.js         per-character meaning + components
  vocab/<place>.js      extra words/characters per place (same formats; pushed into the dictionary)
  world.js              shared stage settings (fade time, tile letters); format documented in its header
  stages/<place>.js     one place: map, scenery, objects (simple words), people, doors
  chat.js · chats/      conversations: Xiao Li · other NPCs (market.js = shopkeeper)
  menu.js · quests.js · ui-text.js   café menu/prices, quest dialogue and hints, interface text
  writing.js · strokes.js            Wang's pool, rules and dialogue · GENERATED stroke data

js/core/                pure logic (no DOM): util, dictionary (segmentation, related words), pinyin, pattern, stroke-match,
                        state (state, saving, word discovery), speech (TTS), sfx (synthesised arrival sounds)
js/game/                game logic: stage (places, walking, doors, fade), barista, quizzes, economy, chat, writing (lessons, mastery)
js/ui/                  rendering and input: panel, text (sentences), gestures, toast, notebook, chat-panel, wang-panel, writer
                        (writing tray), stroke-board (SVG canvas), howto, recognizer (speech input)
js/main.js              start-up, header controls, keyboard

tools/                  check-data.js (validator) · build-strokes.js · data-files.js (file list shared with the tests)
tests/                  node and browser tests
licenses/               Arphic Public License (stroke data) — see THIRD_PARTY_NOTICES.md
```

## How it works

- **Events and actions:** `MSC.on/emit` is a tiny event bus. Buttons use `data-click="action" data-arg="…"`, handled by `MSC.actions[action]`.
- **Dictionary engine:** longest-match sentence segmentation, number tokens, generated sentence pinyin. Dialogue pinyin is never
  written by hand, so every Chinese word used anywhere must exist in the dictionary.
- **Related words** (word pane): set phrases containing the word → its curated `related` → shorter words it is built from → longer
  words containing it, capped at 8. `exclude` hides compounds that lost the part's meaning (在 ↛ 现在).
- **Stages:** the board is rebuilt per place from `data/stages`; sizes come from `cols/rows` via CSS variables, label sizes scale with
  the tile size, and name tags are kept inside the board and nudged apart. Doors fade (`W.fadeMs`) and call `MSC.sfx`.
  A door's `arrive` is optional: left out, you appear beside that place's door back.
- **Chat engine:** answers are patterns — `(optional)`, `[a|b]`, `{slot}` — expanded to every accepted phrasing and compared by
  pinyin syllables; the tile bank is the needed words plus 3 distractors. Each NPC registers `MSC.data.chats[id]`. Speech uses
  `MSC.recognizer`, a thin wrapper over the browser's SpeechRecognition.
- **Writing:** `stroke-match.js` classifies each drawn stroke (ok / order / direction / shape) against the reference; `game/writing.js`
  is the lesson state machine (no DOM) and `ui/writer.js` the tray. Stroke data comes from hanzi-writer-data.

## Editing content

**After any change in `data/`, run `node tools/check-data.js`.** It checks duplicate words, syllable counts, `related` links,
characters, Chinese text that isn't in the dictionary, stage maps (shape, reachability, door pairs, unique ids), chat graphs
(every path ends, branches are unambiguous, goals are English-only) and Wang's pool and stroke data.

| To… | Do this |
|---|---|
| Add a word | One line in `data/dictionary.js` (or `data/vocab/<place>.js`) + its characters in `characters.js`. `starter: true` = in the notebook from the start; `hsk: 1\|2` counts it towards HSK progress |
| Add a simple object | One entry in a stage's `objects` (`id, x, y, emoji, hanzi, text?, note?`); `hanzi` must be a dictionary word |
| Add a place | New file in `data/stages/` + `<script>` tag in `index.html` + a door from the street and one back |
| Add a conversation | Copy one in `data/chat.js` or `data/chats/`; a new talkable NPC also needs a person with the same id on a stage |
| Change café items or prices | `data/menu.js` (orders, answers, tiles and hints are derived from it) |
| Change dialogue or hints | `data/quests.js` |
| Add a writable character | Add it to `pool` in `data/writing.js` (linked word, tier, mnemonic, optional tips), then `npm i hanzi-writer-data` somewhere outside the repo and run `node tools/build-strokes.js <path>/node_modules/hanzi-writer-data` |
| Adjust the HSK target | Every character of every `hsk` word must be in Wang's pool; the validator enforces at least 200 words |

HSK levels follow the classic HSK 2.0 lists as best recalled — spot-check before relying on them for exam prep.

## Tests

```bash
node tools/check-data.js          # data validator
node tests/stroke-match.test.js   # stroke matcher against all characters (clean + shaky input)
node tests/validator.test.js      # proves the validator flags each content problem
node tests/related.test.js        # related words are genuinely related
node tests/chat.test.js           # plays every path of every conversation, for every NPC
# browser tests (need playwright)
node tests/e2e-stages.js          # doors, 0.5 s fade, sounds, buttons per place, every object teaches its word, labels, phone
node tests/e2e-chat.js            # talking to Xiao Li and the shopkeeper: tiles, typing, hints, branching
node tests/e2e-speak.js           # speech input (mocked recogniser)
node tests/e2e-popups.js          # every popup dismisses with ✕ or a swipe
node tests/e2e-writing.js         # tutorial, a lesson, wall, notebook
node tests/e2e-writing-rules.js   # feedback, hints, review, practice, offers, phone touch
```

Browser tests write screenshots to the repo root (git-ignored).

## Licences

Stroke-order data: Arphic Public License via hanzi-writer-data — see `THIRD_PARTY_NOTICES.md` and `licenses/`.

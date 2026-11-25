# Mandarin Street Corner (中文街角)

A browser game for learning Mandarin through a small Chinese street: shops to walk into, people to talk to, and characters to write.
No build step, no backend — open `index.html` (or serve the folder, e.g. `npx serve .`). Progress is saved in the browser.

- **Part 1 — The game** (what a player sees and does)
- **Part 2 — The code** (structure, editing content, tests)

---

# Part 1 — The game

## The world

Five places. Walk with the arrow keys / WASD / on-screen pad, or tap the map or a button above it. **E** or **Talk** interacts.

| Place | What is there |
|---|---|
| **Street** (hub) | Doors to the other places (named on the board), a bus stop, signs, Xiao Li, a lost traveler, 17 everyday objects |
| **Café** | Barista Lin (order and pay), the café menu, 16 objects (cups, teapot, cake display…) |
| **Master Wang's shop** | Master Wang (learn to write), 16 objects (brush, ink, scrolls, lanterns…) |
| **Xiao Ming's home** | Your friend 小明 and his family (爸爸, 妈妈, 姐姐, 弟弟): introductions, meals, routine; a calendar, a TV forecast and a phone to listen to |
| **Market** | Shopkeeper Zhang (buying conversations), the fruit stall, 7 food stalls with price boards, 22 objects |

- **Doors:** step on one (or tap it, or its button). The screen fades to black and back in 0.5 s, with a short arrival sound —
  street ambience going out, a soft jingle going in. Every place has a door back to the street.
- **Buttons above the board** list the people and doors of the current place. Tapping someone in another place walks you there through the doors.
- **Simple objects** (a tree, a teapot, a stall…) have no button or tag. Walk up to one, or tap it, and its word goes into your notebook;
  signs and price boards can be read there.
- **Starting quest:** check the café menu, then order a drink and a meal from Barista Lin.
- **The journey — levels:** the game's levels follow HSK: **level 1 = HSK 1**, **level 2 = HSK 2**. At level 1 the places only hold
  things, conversations, café items and characters of HSK 1 (non-HSK things appear from level 2). The quest screen and the header
  chip (Lv 1) show the journey: the next level opens when **80% of the level's HSK words are learned** and its tasks are done
  (order lunch, finish a conversation with Xiao Li, finish a writing lesson, meet Xiao Ming's family). A pop-up announces it, with what is new where;
  every place fills up with the next level's things, and going back to them is how you keep practising.
- **New phrases:** when someone says a phrase you haven't learned, it is highlighted under their line (✨ New phrase — learn it).
  After the conversation a short phrase screen opens: listen & see → build it from word tiles → say or type it from memory. Then it
  goes into your phrase book. *Practise later* keeps it under "To learn" in the Phrases tab.

## Learning features

- **Words everywhere:** tap a Chinese word to hear it, press and hold for its meaning, 🔊 for the whole sentence. Translations of
  NPC lines are blurred until tapped. The header toggle switches **Pinyin / Hybrid / Hanzi** everywhere.
- **Notebook — Words:** every word you meet, by category; filter by HSK level, and **HSK only** hides non-HSK words. Each word shows
  its **mastery**, its characters and components, the **phrases that use it**, related words and, once learned, *How to write*.
- **Notebook — Phrases:** the phrase book (≈130 phrases in 14 chapters: greetings, café, market, family, time…), each with its HSK
  level and mastery; you collect a phrase by meeting it in the game. A phrase lists its words; a word lists its phrases.
- **Mastery:** a word or phrase is *learned* when you can USE it — say, build or type it — without help, in at least two places.
  Each use scores 1 (no hint) · 0.7 (first hint) · 0.4 (word clue) · 0 (answer shown); a mistake ×0.6, word tiles ×0.85, picking
  from options ×0.6. Mastery is a running average capped by evidence (1 use ≤ 30%, 2 ≤ 50%, 3 ≤ 70%), learned at 85%. Nothing fades.
- **Practice** (🎯 in the notebook): 8 quick exercises on your weakest words or phrases — which word means…, build it from tiles,
  fill the gap in a phrase, type the phrase — plus **What did you hear?**: a word is spoken and you pick its pinyin among
  similar-sounding options (other tones, or real words that sound alike). Listening is for learning only and never changes mastery.
- **Vocabulary:** the 491 words of **HSK 1–2 in the revised HSK 3.0 lists** (294 + 197) plus helper words from the places (names, objects, foods).
- **Barista Lin:** build the order from word tiles, type pinyin, or speak. Prices are real: one wallet (header), tips add to it,
  every order is built from what you can afford.
- **Xiao Li (street) and Shopkeeper Zhang (market):** a new random conversation every visit — 24 with Xiao Li,
  8 buying conversations with Zhang. You **build** your replies from word tiles (with distractors), **type** them, or **speak** them;
  several phrasings are accepted and your choice decides how the conversation branches. Tone slips are called out.
- **Speaking:** what the recogniser heard is shown like an NPC line (tappable words, pinyin per the toggle, English gloss); right
  words in any tones are accepted.
- **Listening moments:** some things you can listen to — the TV weather forecast, a phone call, the bus stop, Zhang calling out prices,
  the café phone: *what did you hear?* (for your ears only; never scored).
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
- Every character of every HSK 1–2 word can be learned here (tiered by stroke count).

## Interface notes

- **Notification log:** nothing pops up over the game. Every message (new words, money, quest progress, tips, small errors) goes to one
  frame above the stage: collapsed it is a single row with the latest message, expanded (▾) a scrollable list of the last ~100.
  Every Chinese word or character in it is a button that opens that word in the notebook.
- The writing tray is a bottom sheet on phones (swipe down to close) and a side panel on desktop.
- Layout never jumps while you act: hint and feedback areas keep their slots.

---

# Part 2 — The code

Vanilla JS, no dependencies, no build step. All code hangs off one global, `window.MSC`, split into script-order-loaded modules.

## Structure

```
index.html              page shell; loads data, then js/core → ui/game → main (order matters)
css/styles.css          styling
vendor/                 phaser.min.js (Phaser 3, MIT — see PHASER_LICENSE.md)

data/                   CONTENT — edit these, no game code needed
  hsk.js                GENERATED official HSK word list per level (revised HSK 3.0) — the source of every word's level
  dictionary.js         every word: hanzi, pinyin, pinyinNum, english, pos, category, related, exclude, note
  characters.js         per-character meaning + components
  vocab/<place>.js      extra words/characters per place (same formats; pushed into the dictionary)
  world.js              shared stage settings (fade time, tile letters); format documented in its header
  stages/<place>.js     one place: map, signs, objects (simple words), people, doors
  art/<place>.js        the pixel art: that place's objects, doors, ground tiles (art/shared.js: people, shared tiles)
  chat.js · chats/      conversations: Xiao Li · other NPCs (market.js = shopkeeper)
  levels.js             the journey: per level the share of words to learn, the tasks, the unlock text
  phrases.js            the phrase book: chapters and phrases (a phrase's HSK level is computed from its words)
  menu.js · quests.js · ui-text.js   café menu/prices, quest dialogue and hints, interface text
  writing.js · strokes.js            Wang's pool, rules and dialogue · GENERATED stroke data

js/core/                pure logic (no DOM): art (pixel-art toolkit), mastery (how well each word/phrase is known), phrases (phrase book, word↔phrase links), util, dictionary (segmentation, related words), pinyin, pattern, stroke-match,
                        state (state, saving, word discovery), speech (TTS), sfx (synthesised arrival sounds)
js/game/                game logic: levels (the journey, what appears at each level, unlocking), stage (places, walking, doors, fade), barista, quizzes, economy, chat, writing (lessons, mastery)
js/ui/                  rendering and input: board (Phaser renderer), practice (Practice mode), teach (new-phrase screen), levelup (pop-up), panel, text (sentences), gestures, log (notification log), notebook, chat-panel, wang-panel, writer
                        (writing tray), stroke-board (SVG canvas), howto, recognizer (speech input)
js/main.js              start-up, header controls, keyboard

tools/                  check-data.js (validator) · build-strokes.js · art-sheet.js (renders all art to a PNG) · import-hsk.js (regenerates data/hsk.js) · data-files.js
tests/                  node and browser tests
licenses/               Arphic Public License (stroke data) — see THIRD_PARTY_NOTICES.md
```

## How it works

- **Events and actions:** `MSC.on/emit` is a tiny event bus. Buttons use `data-click="action" data-arg="…"`, handled by `MSC.actions[action]`.
- **Dictionary engine:** longest-match sentence segmentation, number tokens, generated sentence pinyin. Dialogue pinyin is never
  written by hand, so every Chinese word used anywhere must exist in the dictionary.
- **Related words** (word pane): set phrases containing the word → its curated `related` → shorter words it is built from → longer
  words containing it, capped at 8. `exclude` hides compounds that lost the part's meaning (在 ↛ 现在).
- **Stages and art:** each place is a tile map in `data/stages`, drawn by Phaser (`js/ui/board.js`, canvas renderer) from pixel art
  generated in code (`js/core/art.js`: a painter with shapes and an automatic outline; `data/art/*.js`). Art is 16px, drawn at 3×.
  Name tags and signs stay HTML on top (crisp Chinese, tooltips, the pinyin toggle); panel portraits are the same sprites as images.
  Name tags are kept inside the board and nudged apart. Doors fade (`W.fadeMs`) and call `MSC.sfx`.
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
| Draw a picture | Everything on a board is pixel art drawn in code — no emoji, no image files (they look different on every device). Add `MSC.art.draw('<object id>', (g, c) => …)` in `data/art/<place>.js` (see the header of `js/core/art.js`), preview with `node tools/art-sheet.js out.png <place>`. Anything on a board that looks like a thing must be an `objects` entry with its word; only Chinese shop-sign text and texture (road dashes, zebra stripes) may be scenery |
| Set when something appears | Objects and café items appear at their word's HSK level (non-HSK: level 2), conversations at the highest level of their words, people and doors at level 1 — or give anything `level: n`. The journey's rules are in `data/levels.js` |
| Add a place | New file in `data/stages/` + `<script>` tag in `index.html` + a door from the street and one back |
| Add a conversation | Copy one in `data/chat.js` or `data/chats/`; a new talkable NPC also needs a person with the same id on a stage |
| Change café items or prices | `data/menu.js` (orders, answers, tiles and hints are derived from it) |
| Change dialogue or hints | `data/quests.js` |
| Add a writable character | Add it to `pool` in `data/writing.js` (linked word, tier, mnemonic, optional tips), then `npm i hanzi-writer-data` somewhere outside the repo and run `node tools/build-strokes.js <path>/node_modules/hanzi-writer-data` |
| Update the HSK list | `data/hsk.js` is generated: clone https://github.com/drkameleon/complete-hsk-vocabulary (MIT) and run `node tools/import-hsk.js <path> [maxLevel]`. Levels are never written on dictionary entries — the game reads them from that list. Every listed word must be in the dictionary (`data/vocab/hsk1.js`, `hsk2.js`), and every character of it in Wang's pool with a character entry |

HSK levels come from the revised HSK 3.0 lists (the dataset's "newest" lists, believed to be the 2025 revision). `node tools/check-data.js` also prints a **coverage report**: how many words of each level appear in the game, how many the player can actually use, in how many places, and the share of non-HSK "extra" words (target ≤ 20%; `SHOW_COVERAGE=1` lists the missing words).

## Tests

```bash
node tools/check-data.js          # data validator
node tests/stroke-match.test.js   # stroke matcher against all characters (clean + shaky input)
node tests/validator.test.js      # proves the validator flags each content problem
node tests/related.test.js        # related words are genuinely related
node tests/chat.test.js           # plays every path of every conversation, for every NPC
node tests/mastery.test.js        # mastery scoring rules; saying a phrase credits it and its words
# browser tests (need playwright)
node tests/e2e-board.js           # the Phaser canvas: every place drawn from the art, no emoji, no missing art, the player moves
node tests/e2e-stages.js          # doors, 0.5 s fade, sounds, buttons per place, every object teaches its word, labels, phone
node tests/e2e-chat.js            # talking to Xiao Li and the shopkeeper: tiles, typing, hints, branching
node tests/e2e-speak.js           # speech input (mocked recogniser)
node tests/e2e-levels.js          # level 1 shows only HSK 1 content; the phrase screen; levelling up to HSK 2
node tests/e2e-practice.js        # notebook tabs, HSK only, mastery bars, word↔phrase links, Practice (listening never scores)
node tests/e2e-log.js             # the notification log: one row / scrollable list, clickable words, no popups left
node tests/e2e-writing.js         # tutorial, a lesson, wall, notebook
node tests/e2e-writing-rules.js   # feedback, hints, review, practice, offers, phone touch
```

Browser tests write screenshots to the repo root (git-ignored).

## Licences

Stroke-order data: Arphic Public License via hanzi-writer-data — see `THIRD_PARTY_NOTICES.md` and `licenses/`.

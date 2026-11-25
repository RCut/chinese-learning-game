# Third-party notices

## Stroke-order data (`data/strokes.js`)

Stroke outlines and centre lines come from **Make Me a Hanzi** (https://github.com/skishore/makemeahanzi),
packaged by **hanzi-writer-data** (https://github.com/chanind/hanzi-writer-data, v2.0.1).
They are distributed under the **Arphic Public License** (`licenses/ARPHICPL.TXT`),
Copyright (C) 1999 Arphic Technology Co., Ltd.

Under that license, redistributing the data requires keeping the copyright notice and license text with it
and clearly marking any modification. This repository does both:

- the license text is in `licenses/ARPHICPL.TXT` and referenced from the header of `data/strokes.js`;
- the one modification (stroke order of 右 changed to the standard order) is noted in that header and
  in `tools/build-strokes.js`.

Have the licensing terms reviewed before a public release.

## Phaser (`vendor/phaser.min.js`)

Phaser 3.80.1, MIT licence, Copyright (c) 2024 Richard Davey, Phaser Studio Inc. (`vendor/PHASER_LICENSE.md`). It draws the game board.

The pixel art is original, drawn in code in this repository (`data/art`).

## HSK word lists (`data/hsk.js`)

The level of each word comes from **complete-hsk-vocabulary** (https://github.com/drkameleon/complete-hsk-vocabulary),
MIT licence, Copyright (c) Yanis Zafirópulos — its "newest" (revised HSK 3.0) lists, converted by `tools/import-hsk.js`.
Meanings, categories and everything else about the words are written in this repository.

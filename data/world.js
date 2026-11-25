/*
 * WORLD — shared settings for the stages (places) of the game. The places themselves live in data/stages/*.js:
 *
 *   street.js   the main road: doors to the other places, a bus stop, signs, Xiao Li, things to learn
 *   cafe.js     Barista Lin's café
 *   shop.js     Master Wang's calligraphy shop
 *   market.js   the market: food stalls and the shopkeeper
 *
 * Each stage file registers   MSC.data.world.stages.<id> = { id, name, hanzi, cols, rows, map, playerStart, scenery, objects, entities }
 *
 *   map        rows of tile letters (see tileClasses). Every row must be exactly `cols` long and there must be `rows` rows.
 *   scenery    decoration only: { x, y, text, className? }
 *   objects    simple things to learn a word from: { id, x, y, hanzi, text?: [{ hanzi, english }], note?, sprite? }
 *              Walk up to one (or tap it) and its word goes into the notebook; `text` is a sign/notice to read.
 *              `hanzi` MUST be a dictionary word. Objects are solid and have no name tag.
 *   entities   people/things you do something with, and doors:
 *                person  { id, name, hanzi, x, y, stand, zone?, badge, pill, sprite? }
 *                door    { id, kind: 'door', name, hanzi, x, y, to: '<stage id>', arrive?: { x, y }, badge, pill, sprite? }
 *                        A door sits on a walkable tile (usually 'D'); stepping on it (or tapping it) changes the stage.
 *                        `arrive` (optional) = where you appear in the other stage. Left out, you appear on a free tile beside
 *                        that stage's door back to this one — so doors can be moved without editing the other stage's file.
 *              People and doors get a name tag on the board and a button above it; objects do not.
 *   sound      what plays when you arrive here: 'street' | 'shop' | 'market' | 'cafe' | 'home'
 *   objects may also have  listen: ['四块', '十块'], listenTitle: '…'  → a "what did you hear?" moment on its card (never scores),
 *              and  level: n  (see data/levels.js — by default an object appears at its word's HSK level, non-HSK words at level 2)
 *
 * Pictures are pixel art drawn in code (js/core/art.js, data/art/*.js) — never emoji. A thing's picture is the art called `sprite`,
 * or, if that is left out, the art called by its id. Ground tiles come from the map letters (data/art too). Ids must be unique across ALL stages.
 * Every stage has a door back to the street.
 *
 * Tile letters — each needs ground art (A.tile in data/art; a stage can have its own version of a letter, or add a letter, and block it via `blockedTiles`):
 *   W wall · F café floor · C counter · D door mat · S sidewalk · G grass · R road · P wooden floor · M market stone
 *   B shop-front wall · L stall table
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.world = {
    start: 'street',
    fadeMs: 500,                       // a stage change: fade to black and back, in total
    blockedTiles: ['W', 'C', 'R', 'B', 'L'],
    stages: {},
  };
})(window.MSC = window.MSC || {});

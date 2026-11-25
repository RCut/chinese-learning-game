/*
 * LEVELS — the journey. The game's levels follow the HSK levels: level 1 = HSK 1, level 2 = HSK 2.
 * Content (objects, conversations, café items, Master Wang's characters, phrases) appears from its level on; going back to a
 * place after levelling up shows what is new there.
 *
 *   learnedShare  share of the level's HSK words that must be LEARNED (mastery ≥ 85%) to unlock the next level
 *   tasks         also needed: [{ id, text }] — ids are checked in js/game/levels.js (ordered, chatted, wrote, family)
 *   unlockTitle / unlockText   the pop-up when the NEXT level opens
 *
 * Content levels: an object's or a café item's level is its word's HSK level (non-HSK words: level 2) unless it has
 * `level: n`; a conversation's level is the highest HSK level of its words unless it has `level: n`; people and doors are
 * level 1 unless they have `level: n`.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.levels = {
    1: {
      title: 'Level 1 · HSK 1',
      learnedShare: 0.8,
      tasks: [
        { id: 'ordered', text: 'Order lunch from Barista Lin' },
        { id: 'chatted', text: 'Finish a conversation with Xiao Li' },
        { id: 'wrote', text: 'Finish a writing lesson with Master Wang' },
        { id: 'family', text: 'Meet Xiao Ming’s family (finish a chat at his home)' },
      ],
      unlockTitle: 'Level 2 unlocked!',
      unlockText: 'HSK 2 words are now around town: new things to learn in every place, new conversations, new café items and new characters at Master Wang’s. Go back and explore!',
    },
    2: {
      title: 'Level 2 · HSK 2',
      learnedShare: 0.8,
      tasks: [
        { id: 'school', text: 'Make a new friend at school (finish a chat with Xiao Hong)' },
      ],
      unlockTitle: 'HSK 2 complete!',
      unlockText: 'You have learned most of HSK 2. More levels are coming — keep practising to reach 100%.',
    },
  };
})(window.MSC = window.MSC || {});

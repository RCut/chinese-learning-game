// The data files in load order — shared by the validator and the node tests, so a new file in data/vocab/ or data/stages/ is picked up automatically.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const list = (dir, ext = '.js') => (fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(ext)).sort().map((f) => `${dir}/${f}`) : []);
module.exports = {
  /** dictionary + characters + every vocab extension */
  vocab: () => ['data/dictionary.js', 'data/characters.js', ...list('data/vocab')],
  /** everything the validator needs, in order */
  all: () => ['data/dictionary.js', 'data/characters.js', ...list('data/vocab'), 'data/world.js', ...list('data/stages'), 'data/menu.js', 'data/quests.js', 'data/ui-text.js', 'data/writing.js', 'data/strokes.js', 'data/chat.js', ...list('data/chats'), 'js/core/pattern.js', 'js/core/util.js', 'js/core/dictionary.js'],
  chat: () => ['data/dictionary.js', 'data/characters.js', ...list('data/vocab'), 'data/chat.js', ...list('data/chats'), 'js/core/util.js', 'js/core/dictionary.js', 'js/core/pinyin.js', 'js/core/pattern.js'],
};

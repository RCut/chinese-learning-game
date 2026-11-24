// node tests/validator.test.js — breaks the writing data in each way the ticket lists and checks the validator reports it.
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const work = path.join(process.env.MSC_TEST_TMP || os.tmpdir(), 'msc-validator-run');
let fails = 0;

function fresh() {                                          // pristine copy of everything the validator reads
  fs.mkdirSync(work, { recursive: true });
  ['data', 'js', 'tools'].forEach((d) => fs.cpSync(path.join(root, d), path.join(work, d), { recursive: true, force: true }));
}
const edit = (file, fn) => { const f = path.join(work, file); fs.writeFileSync(f, fn(fs.readFileSync(f, 'utf8'))); };
const run = () => { const r = spawnSync('node', [path.join(work, 'tools/check-data.js')], { encoding: 'utf8' }); return { code: r.status, out: `${r.stdout}${r.stderr}` }; };

function expectError(name, mutate, pattern) {
  fresh(); mutate();
  const r = run();
  const ok = r.code !== 0 && pattern.test(r.out);
  console.log(ok ? '  ok  ' : '  FAIL', name, ok ? '' : `\n      exit ${r.code}: ${r.out.slice(0, 300)}`);
  if (!ok) fails++;
}

fresh();
const base = run();
console.log(base.code === 0 ? '  ok   pristine data passes' : '  FAIL pristine data should pass\n' + base.out);
if (base.code !== 0) fails++;

expectError('pool character with no stroke-order data', () => edit('data/strokes.js', (s) => {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(s, ctx);
  const data = ctx.window.MSC.data.strokes; delete data['木'];
  return `(function (MSC) { MSC.data = MSC.data || {}; MSC.data.strokes = ${JSON.stringify(data)}; })(window.MSC = window.MSC || {});`;
}), /木: no stroke-order data/);

expectError('linked word that is not in the vocabulary data', () => edit('data/writing.js', (s) => s.replace("char: '木', pinyin: 'mù', meaning: 'tree', word: '木'", "char: '木', pinyin: 'mù', meaning: 'tree', word: '树林'")), /linked word "树林" is not in the dictionary/);

expectError('linked word not spelled with that character', () => edit('data/writing.js', (s) => s.replace("char: '木', pinyin: 'mù', meaning: 'tree', word: '木'", "char: '木', pinyin: 'mù', meaning: 'tree', word: '火'")), /linked word "火" is not spelled with 木/);

expectError('missing mnemonic', () => edit('data/writing.js', (s) => s.replace("mnemonic: 'Three lines from top to bottom — the middle one is the shortest.'", "mnemonic: ''")), /三: missing mnemonic/);

expectError('missing tier', () => edit('data/writing.js', (s) => s.replace("{ char: '二', pinyin: 'èr', meaning: 'two', word: '二', tier: 1,", "{ char: '二', pinyin: 'èr', meaning: 'two', word: '二',")), /二: tier must be 1, 2 or 3/);

expectError('stroke tip pointing to a stroke the character does not have', () => edit('data/writing.js', (s) => s.replace("{ char: '口', pinyin: 'kǒu', meaning: 'mouth', word: '口', tier: 1, rules: ['cb'],", "{ char: '口', pinyin: 'kǒu', meaning: 'mouth', word: '口', tier: 1, rules: ['cb'], tips: { 9: 'x' },")), /口: stroke tip points to stroke 10, but 口 has 3 strokes/);

expectError('tier with fewer than 4 characters (could not fill a lesson)', () => edit('data/writing.js', (s) =>
  s.replace(/(char: '(.)'[^\n]*?)tier: 3/g, (m, pre, ch) => (['我', '你', '是'].includes(ch) ? m : `${pre}tier: 2`))), /tier 3 has 3 characters; it needs at least 4/);

expectError('HSK word whose character cannot be learned at Master Wang', () => edit('data/writing.js', (s) => s.replace(/\n\s*\{ char: '爸',[^\n]*\},/, '')), /HSK word 爸爸: character 爸 cannot be learned at Master Wang/);

expectError('fewer than 200 HSK words', () => edit('data/dictionary.js', (s) => s.replace("{ hanzi: '爸爸', pinyin: 'bàba', pinyinNum: 'ba4 ba5', english: 'dad', pos: 'noun', category: 'Family & Friends', hsk: 1,", "{ hanzi: '爸爸', pinyin: 'bàba', pinyinNum: 'ba4 ba5', english: 'dad', pos: 'noun', category: 'Family & Friends',")), /only 199 HSK 1–2 words/);

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('validator: every content problem in the ticket is flagged');

/*
 * Dictionary engine: lookup, sentence segmentation (longest match), generated pinyin,
 * character breakdowns and related-word groups. Pure functions — no DOM access.
 */
(function (MSC) {
  const U = MSC.util;
  const D = {};

  const entries = MSC.data.dictionary;
  const byHanzi = new Map();
  entries.forEach((e) => byHanzi.set(e.hanzi, e));
  // HSK levels come from the official list (data/hsk.js), never from hand-written tags
  const levelOf = new Map();
  Object.entries((MSC.data.hsk && MSC.data.hsk.levels) || {}).forEach(([l, ws]) => ws.forEach((w) => { if (!levelOf.has(w)) levelOf.set(w, Number(l)); }));
  entries.forEach((e) => { const l = levelOf.get(e.hanzi); if (l) e.hsk = l; else delete e.hsk; });
  /** HSK level of a word (0 = not an HSK word) */
  D.level = (hanzi) => levelOf.get(hanzi) || 0;
  /** the words of one HSK level, in list order */
  D.hskWords = (l) => ((MSC.data.hsk && MSC.data.hsk.levels[l]) || []).slice();

  const maxLen = entries.reduce((m, e) => Math.max(m, e.hanzi.length), 1);

  D.get = (hanzi) => byHanzi.get(hanzi) || null;
  D.all = () => entries;
  D.char = (ch) => (MSC.data.characters && MSC.data.characters[ch]) || null;

  // ── Numbers: 十四块 / 二十三 become one token ("¥14") instead of separate digits ──
  const NUM_VALUE = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const NUM_RE = /^[一二两三四五六七八九十]+块?/;

  function parseChineseNumber(str) {
    if (!str) return NaN;
    if (str === '十') return 10;
    const i = str.indexOf('十');
    if (i < 0) return str.length === 1 ? NUM_VALUE[str] : NaN;
    const tens = i === 0 ? 1 : NUM_VALUE[str.slice(0, i)];
    const onesStr = str.slice(i + 1);
    const ones = onesStr ? NUM_VALUE[onesStr] : 0;
    return (tens || NaN) * 10 + (ones === undefined ? NaN : ones);
  }

  function numberToken(text) {
    const hasKuai = text.endsWith('块');
    const digits = hasKuai ? text.slice(0, -1) : text;
    const value = parseChineseNumber(digits);
    if (Number.isNaN(value)) return null;
    const syls = [...text].map((ch) => byHanzi.get(ch).pinyinNum);
    const pinyin = [...text].map((ch) => byHanzi.get(ch).pinyin);
    return {
      kind: 'number',
      hanzi: text,
      pinyin: hasKuai ? `${pinyin.slice(0, -1).join('')} ${pinyin[pinyin.length - 1]}` : pinyin.join(''),
      pinyinNum: syls.join(' '),
      english: hasKuai ? `¥${value} (${value} yuan)` : String(value),
      parts: [...text],
    };
  }

  /**
   * Split text into tokens:
   *   { kind: 'word', hanzi, entry } | { kind: 'number', ... } | { kind: 'text', text } | { kind: 'unknown', hanzi }
   */
  D.segment = (text) => {
    const tokens = [];
    let buf = '';
    const flush = () => { if (buf) { tokens.push({ kind: 'text', text: buf }); buf = ''; } };
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (!U.isHanzi(ch)) { buf += ch; i++; continue; }
      flush();
      const longestAt = (j) => { for (let L = Math.min(maxLen, text.length - j); L >= 1; L--) if (byHanzi.has(text.substr(j, L))) return L; return 0; };
      let dictLen = longestAt(i);
      // Look one word ahead: if the longest word leaves a lone character (有时|间) but one character less lets a longer word
      // follow (有|时间, 有|时候), take the shorter one.
      if (dictLen >= 2 && i + dictLen < text.length && U.isHanzi(text[i + dictLen]) && longestAt(i + dictLen) <= 1
          && byHanzi.has(text.substr(i, dictLen - 1)) && longestAt(i + dictLen - 1) >= 2) dictLen -= 1;
      const numMatch = NUM_RE.exec(text.slice(i));
      const numLen = numMatch ? numMatch[0].length : 0;
      if (numLen > dictLen && (numLen >= 2)) {
        const tok = numberToken(numMatch[0]);
        if (tok) { tokens.push(tok); i += numLen; continue; }
      }
      if (dictLen) {
        const hanzi = text.substr(i, dictLen);
        tokens.push({ kind: 'word', hanzi, entry: byHanzi.get(hanzi) });
        i += dictLen;
      } else {
        tokens.push({ kind: 'unknown', hanzi: ch });
        i++;
      }
    }
    flush();
    return tokens;
  };

  D.tokenPinyin = (tok) => {
    if (tok.kind === 'word') return tok.entry.pinyin;
    if (tok.kind === 'number') return tok.pinyin;
    if (tok.kind === 'unknown') return tok.hanzi;
    return tok.text;
  };

  D.tokenEnglish = (tok) => {
    if (tok.kind === 'word') return tok.entry.english;
    if (tok.kind === 'number') return tok.english;
    return '';
  };

  const PUNCT = { '，': ',', '。': '.', '！': '!', '？': '?', '、': ',', '：': ':', '；': ';', '…': '…', '（': '(', '）': ')' };

  /** Readable sentence pinyin built from the dictionary, e.g. "Nǐ hǎo! Nǐ xiǎng hē shénme?" */
  D.sentencePinyin = (text) => {
    let out = '';
    let capNext = true;
    let quoteOpen = false;
    D.segment(text).forEach((tok) => {
      if (tok.kind === 'text') {
        for (const ch of tok.text) {
          if (ch === '“' || ch === '”' || ch === '"') {
            if (!quoteOpen) { out += (out && !out.endsWith(' ') ? ' ' : '') + '“'; quoteOpen = true; }
            else { out += '”'; quoteOpen = false; }
          } else if (PUNCT[ch]) {
            out = out.replace(/\s+$/, '') + PUNCT[ch];
            if ('.!?'.includes(PUNCT[ch])) capNext = true;
          } else if (/\s/.test(ch)) {
            if (out && !out.endsWith(' ')) out += ' ';
          } else {
            out += ch;
          }
        }
        return;
      }
      let py = D.tokenPinyin(tok);
      if (capNext) { py = U.capitalize(py); capNext = false; }
      const needsSpace = out && !out.endsWith(' ') && !out.endsWith('“');
      out += (needsSpace ? ' ' : '') + py;
    });
    return out.trim();
  };

  /** Numbered syllables for all Chinese in `text`; null if any character is unknown. */
  D.syllables = (text) => {
    const out = [];
    for (const tok of D.segment(text)) {
      if (tok.kind === 'unknown') return null;
      if (tok.kind === 'word' || tok.kind === 'number') {
        const num = tok.kind === 'word' ? tok.entry.pinyinNum : tok.pinyinNum;
        num.toLowerCase().split(/\s+/).forEach((s) => out.push(s));
      }
    }
    return out;
  };

  /** Dictionary words a sentence is made of (deduped, in order). Number tokens contribute their digits. */
  D.wordsIn = (text) => {
    const seen = new Set();
    const out = [];
    D.segment(text).forEach((tok) => {
      const list = tok.kind === 'word' ? [tok.hanzi] : tok.kind === 'number' ? tok.parts : [];
      list.forEach((h) => { if (!seen.has(h) && byHanzi.has(h)) { seen.add(h); out.push(h); } });
    });
    return out;
  };

  /** Unique characters of a word with the reading used in that word. Each character appears once. */
  D.breakdown = (entry) => {
    const syls = entry.pinyinNum.split(/\s+/);
    const seen = new Set();
    const out = [];
    [...entry.hanzi].forEach((ch, idx) => {
      if (seen.has(ch)) return;
      seen.add(ch);
      const info = D.char(ch) || {};
      out.push({
        hanzi: ch,
        pinyin: U.numToTone(syls[idx] || ''),
        meaning: info.meaning || '',
        parts: info.parts || '',
        isWord: byHanzi.has(ch),
      });
    });
    return out;
  };

  /**
   * Related words, most useful first (the whole panel is capped at `limit`, so phrases always win the slots):
   *   1. Phrases      — set phrases that contain this word (你好, 太好了)
   *   2. Used with    — curated: collocations, measure-word pairs, near-synonyms and opposites (data: `related`)
   *   3. Built from   — shorter words a longer word is made of (火车站 → 火车)
   *   4. Part of      — longer words that contain it (牛 → 牛奶)
   * Anything in the entry's `exclude` list is skipped by the automatic groups (meaning lost in the compound).
   */
  D.related = (entry, limit = 8) => {
    const h = entry.hanzi;
    const used = new Set([h, ...(entry.exclude || [])]);
    let room = limit;
    const take = (list) => {
      const out = [];
      list.forEach((e) => {
        if (e && room > 0 && !used.has(e.hanzi)) { used.add(e.hanzi); out.push(e); room--; }
      });
      return out;
    };
    const containing = entries.filter((e) => e.hanzi !== h && e.hanzi.includes(h));
    const phrases = take(containing.filter((e) => e.pos === 'phrase'));
    const curated = take((entry.related || []).map((r) => byHanzi.get(r)));
    const builtFrom = h.length > 1
      ? take(entries.filter((e) => e.hanzi.length > 1 && e.hanzi.length < h.length && h.includes(e.hanzi))
        .sort((a, b) => h.indexOf(a.hanzi) - h.indexOf(b.hanzi)))
      : [];
    const partOf = take(containing.filter((e) => e.pos !== 'phrase').sort((a, b) => a.hanzi.length - b.hanzi.length));
    return [
      { id: 'phrases', title: 'Phrases', items: phrases },
      { id: 'with', title: 'Used with', items: curated },
      { id: 'parts', title: 'Built from', items: builtFrom },
      { id: 'in', title: 'Part of', items: partOf },
    ].filter((g) => g.items.length);
  };

  MSC.dict = D;
})(window.MSC = window.MSC || {});

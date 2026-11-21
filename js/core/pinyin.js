/*
 * Pinyin input parsing and comparison.
 * Understands: "wo3 yao4", "wǒ yào", "wǒyào", "kāfēi", "kafei", Chinese characters, or any mix.
 * A syllable is { base:'wo', tone:3 }. tone 0 = the player did not give one; 5 = neutral.
 */
(function (MSC) {
  const D = MSC.dict;
  const P = {};

  const TONED = {
    ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4], ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
    ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4], ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
    ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4], ǖ: ['v', 1], ǘ: ['v', 2], ǚ: ['v', 3], ǜ: ['v', 4],
  };

  let inventory = null;
  function syllableSet() {
    if (inventory) return inventory;
    inventory = new Set();
    D.all().forEach((e) => e.pinyinNum.split(/\s+/).forEach((s) => inventory.add(s.replace(/[0-5]$/, '').replace(/ü/g, 'v'))));
    return inventory;
  }

  /** Split a run of letters (possibly several syllables, with tone marks) into syllables. */
  function splitLetters(piece) {
    let plain = '';
    const tones = [];
    for (const c of piece) {
      if (TONED[c]) { plain += TONED[c][0]; tones.push(TONED[c][1]); }
      else if (c === 'ü') { plain += 'v'; tones.push(0); }
      else { plain += c; tones.push(0); }
    }
    const n = plain.length;
    const best = new Array(n + 1).fill(null);
    best[0] = [];
    const set = syllableSet();
    for (let i = 0; i < n; i++) {
      if (!best[i]) continue;
      for (let L = 6; L >= 1; L--) {
        if (i + L > n || !set.has(plain.substr(i, L))) continue;
        const cand = best[i].concat([[i, i + L]]);
        if (!best[i + L] || cand.length < best[i + L].length) best[i + L] = cand;
      }
    }
    const spans = best[n] || [[0, n]];
    return spans.map(([a, b]) => ({ base: plain.slice(a, b), tone: tones.slice(a, b).find(Boolean) || 0 }));
  }

  /** "wo3" / "kāfēi" / "我要" … → syllable list. */
  P.parse = (text) => {
    const out = [];
    const re = /[㐀-鿿]+|[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+[0-5]?/g;
    let m;
    const src = String(text || '').toLowerCase();
    while ((m = re.exec(src))) {
      const chunk = m[0];
      if (/[㐀-鿿]/.test(chunk)) {
        (D.syllables(chunk) || []).forEach((s) => out.push(P.fromNum(s)));
        continue;
      }
      const digit = /[0-5]$/.test(chunk) ? Number(chunk.slice(-1)) : 0;
      const letters = digit || /0$/.test(chunk) ? chunk.slice(0, -1) : chunk;
      const syls = splitLetters(letters);
      if (digit && syls.length && !syls[syls.length - 1].tone) syls[syls.length - 1].tone = digit;
      out.push(...syls);
    }
    return out;
  };

  /** "wo3" → { base:'wo', tone:3 }. */
  P.fromNum = (s) => {
    const m = /^([a-zv]+?)([0-5])?$/.exec(String(s).replace(/ü/g, 'v'));
    return m ? { base: m[1], tone: Number(m[2] || 0) } : { base: String(s), tone: 0 };
  };

  P.show = (syl) => MSC.util.numToTone(`${syl.base.replace(/v/g, 'ü')}${syl.tone || ''}`);

  function toneOk(exp, usr) {
    if (exp.tone === usr.tone) return true;
    if (usr.tone === 0 && exp.tone === 5) return true;       // neutral tone may be left off
    if (exp.base === 'yi' && [1, 2, 4].includes(exp.tone) && [1, 2, 4].includes(usr.tone)) return true; // 一 tone sandhi
    if (exp.base === 'bu' && [2, 4].includes(exp.tone) && [2, 4].includes(usr.tone)) return true;       // 不 tone sandhi
    return false;
  }
  P.sameSyl = (exp, usr) => exp.base === usr.base && toneOk(exp, usr);
  P.sameBase = (exp, usr) => exp.base === usr.base;
  P.sameSentence = (exp, usr) => exp.length === usr.length && exp.every((e, i) => P.sameSyl(e, usr[i]));
  P.sameBases = (exp, usr) => exp.length === usr.length && exp.every((e, i) => P.sameBase(e, usr[i]));

  /** Per-word feedback for the Recall mode. `target` is a list of tokens from D.segment (words + numbers). */
  P.evaluate = (userSyls, target) => {
    const results = [];
    let cursor = 0;
    target.forEach((tok) => {
      const expSyls = (tok.kind === 'word' ? tok.entry.pinyinNum : tok.pinyinNum).split(/\s+/).map(P.fromNum);
      const slice = userSyls.slice(cursor, cursor + expSyls.length);
      cursor += expSyls.length;
      const label = tok.hanzi;
      if (!slice.length) { results.push({ status: 'missing', label: '…', detail: 'Missing word' }); return; }
      const typed = slice.map(P.show).join(' ');
      if (slice.length === expSyls.length && expSyls.every((e, i) => P.sameSyl(e, slice[i]))) {
        results.push({ status: 'correct', label: `${label} · ${typed}`, detail: 'Correct' });
      } else if (slice.length === expSyls.length && expSyls.every((e, i) => P.sameBase(e, slice[i]))) {
        const want = expSyls.map((e) => e.tone).join('/');
        const had = slice.map((s) => s.tone || '–').join('/');
        results.push({ status: 'tone', label: typed, detail: `Tone ${had} → ${want}` });
      } else {
        results.push({ status: 'wrong', label: typed, detail: 'Wrong word' });
      }
    });
    if (cursor < userSyls.length) results.push({ status: 'wrong', label: userSyls.slice(cursor).map(P.show).join(' '), detail: 'Extra words' });
    return results;
  };

  MSC.pinyin = P;
})(window.MSC = window.MSC || {});

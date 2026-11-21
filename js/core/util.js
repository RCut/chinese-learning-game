/* Small, dependency-free helpers shared by every module. */
(function (MSC) {
  const U = {};

  U.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  U.shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  U.isHanzi = (ch) => /[\u3400-\u9fff]/.test(ch);

  U.capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  /** Fill {placeholders}. {Key} with a capital first letter capitalizes the value of {key}. */
  U.fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (m, key) => {
    if (key in vars) return vars[key];
    const lower = key.charAt(0).toLowerCase() + key.slice(1);
    if (lower in vars) return U.capitalize(String(vars[lower]));
    return m;
  });

  U.fillLine = (line, vars) => ({ hanzi: U.fill(line.hanzi, vars), english: U.fill(line.english, vars) });

  // ── Pinyin tone numbers → tone marks ──
  const MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', v: 'ǖǘǚǜ' };
  U.numToTone = (syl) => {
    const m = /^([a-zA-ZüÜv:]+)([0-5])?$/.exec(syl || '');
    if (!m) return syl;
    let base = m[1].replace(/u:/g, 'v').replace(/ü/g, 'v');
    const tone = Number(m[2] || 5);
    const cap = /^[A-Z]/.test(base);
    base = base.toLowerCase();
    if (tone >= 1 && tone <= 4) {
      let idx = base.search(/[ae]/);
      if (idx < 0) idx = base.indexOf('ou');
      if (idx < 0) {
        for (let i = base.length - 1; i >= 0; i--) {
          if ('iouv'.includes(base[i])) { idx = i; break; }
        }
      }
      if (idx >= 0) base = base.slice(0, idx) + MARKS[base[idx]][tone - 1] + base.slice(idx + 1);
    }
    base = base.replace(/v/g, 'ü');
    return cap ? U.capitalize(base) : base;
  };

  // ── Numbers & prices in Chinese (0–99) ──
  const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  U.numberToHanzi = (n) => {
    if (n < 10) return DIGITS[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${tens === 1 ? '' : DIGITS[tens]}十${ones ? DIGITS[ones] : ''}`;
  };
  U.priceHanzi = (n) => `${U.numberToHanzi(n)}块`;
  /** Quantity before a measure word: 1 → 一, 2 → 两. */
  U.qtyHanzi = (n) => (n === 2 ? '两' : U.numberToHanzi(n));

  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  MSC.util = U;
})(window.MSC = window.MSC || {});

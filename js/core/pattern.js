/*
 * Answer patterns for the chat (data/chat.js). Pure functions, no DOM.
 *
 *   (…)     optional                    我(很)好        → 我很好, 我好
 *   [a|b]   one of                      我[想|要]喝茶   → 我想喝茶, 我要喝茶
 *   {name}  a random slot value         我叫{myname}
 *
 * expand() returns every accepted string, FULLEST FIRST (optional parts included, first alternatives first).
 */
(function (MSC) {
  const P = {};

  /** Replace {slot} (Chinese) and {slot.en} (English) from `vars`. Unknown placeholders are left alone. */
  P.fill = (text, vars) => String(text).replace(/\{([\w.]+)\}/g, (m, k) => (k in vars ? vars[k] : m));

  P.expand = (pattern, cap = 64) => {
    const parts = [];
    const re = /\(([^()]*)\)|\[([^\[\]]*)\]/g;
    let last = 0, m;
    while ((m = re.exec(pattern))) {
      if (m.index > last) parts.push([pattern.slice(last, m.index)]);
      parts.push(m[1] !== undefined ? [m[1], ''] : m[2].split('|'));
      last = re.lastIndex;
    }
    if (last < pattern.length) parts.push([pattern.slice(last)]);
    let out = [''];
    for (const options of parts) {
      const next = [];
      for (const prefix of out) for (const o of options) { next.push(prefix + o); if (next.length >= cap) break; }
      out = next;
    }
    return [...new Set(out)];
  };

  MSC.pattern = P;
})(window.MSC = window.MSC || {});

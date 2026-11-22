#!/usr/bin/env node
/*
 * Cache-busting. Stamps every local <script src> / <link href> in index.html with ?v=<hash of the file>, so a browser
 * (or CDN / GitHub Pages) can never keep serving an old copy of a file that changed.
 *
 *   node tools/stamp-assets.js           rewrite index.html
 *   node tools/stamp-assets.js --check   exit 1 if any stamp is out of date (also run by tools/check-data.js)
 *
 * Run it after editing any file under css/, js/ or data/.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const RE = /((?:src|href)=")((?:css|js|data)\/[^"?]+)(?:\?v=[0-9a-f]+)?(")/g;

function stamped(html) {
  return html.replace(RE, (m, a, file, z) => {
    const f = path.join(root, file);
    if (!fs.existsSync(f)) return m;
    const hash = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 8);
    return `${a}${file}?v=${hash}${z}`;
  });
}

/** Files whose stamp in index.html is missing or out of date (empty when index.html isn't present). */
function stale() {
  const file = path.join(root, 'index.html');
  if (!fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, 'utf8');
  const fresh = stamped(html);
  if (fresh === html) return [];
  const old = html.match(RE) || [], now = fresh.match(RE) || [];
  return now.filter((s, i) => s !== old[i]).map((s) => s.replace(/^(?:src|href)="|"$/g, '').replace(/\?v=.*/, ''));
}

module.exports = { stamped, stale };

if (require.main === module) {
  const file = path.join(root, 'index.html');
  if (process.argv.includes('--check')) {
    const s = stale();
    if (s.length) { console.error(`stale asset stamps (run: node tools/stamp-assets.js): ${s.join(', ')}`); process.exit(1); }
    console.log('asset stamps are current');
  } else {
    const html = fs.readFileSync(file, 'utf8');
    const out = stamped(html);
    fs.writeFileSync(file, out);
    console.log(out === html ? 'asset stamps already current' : 'index.html stamped');
  }
}

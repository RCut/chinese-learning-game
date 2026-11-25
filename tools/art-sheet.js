#!/usr/bin/env node
/*
 * Renders every sprite and tile to a labelled PNG so the art can be reviewed:
 *   node tools/art-sheet.js [out.png] [filter]      e.g.  node tools/art-sheet.js /tmp/sheet.png cafe
 * `filter` keeps only keys/stages containing that text (a stage id also keeps that stage's tiles).
 */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || 'art-sheet.png'), filter = process.argv[3] || '';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
  await p.setContent('<body style="margin:0;background:#2b2a33;font:11px monospace;color:#ddd"><div id="root" style="padding:10px;display:flex;flex-wrap:wrap;gap:10px"></div></body>');
  const files = ['js/core/art.js', ...fs.readdirSync(path.join(root, 'data/art')).filter((f) => f.endsWith('.js')).sort().map((f) => `data/art/${f}`)];
  for (const f of files) await p.addScriptTag({ path: path.join(root, f) });
  await p.evaluate(([filter]) => {
    const A = MSC.art, Z = 5, host = document.getElementById('root');
    const cell = (label, cv, bg) => {
      const d = document.createElement('div'); d.style.cssText = 'text-align:center;width:' + Math.max(cv.width * Z, 90) + 'px';
      cv.style.cssText = `width:${cv.width * Z}px;height:${cv.height * Z}px;image-rendering:pixelated;background:${bg || '#8fb870'};display:block;margin:0 auto 3px`;
      d.appendChild(cv); d.appendChild(document.createTextNode(label)); host.appendChild(d);
    };
    const section = (t) => { const h = document.createElement('div'); h.style.cssText = 'width:100%;font-size:14px;color:#fcd34d;margin-top:8px'; h.textContent = t; host.appendChild(h); };
    section('tiles');
    Object.keys(A.tiles).filter((k) => !filter || k.includes(filter) || !k.includes(':')).forEach((k) => A.tiles[k].forEach((v, i) => cell(`${k}#${i}`, A.tileCanvas(v), '#000')));
    section('sprites');
    A.order.filter((k) => !filter || k.includes(filter)).forEach((k) => cell(k + ` ${A.defs[k].w}×${A.defs[k].h}`, A.canvas(k)));
  }, [filter]);
  const h = await p.evaluate(() => document.body.scrollHeight);
  await p.setViewportSize({ width: 1100, height: Math.min(h + 20, 6000) });
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
  console.log('wrote', out);
})();

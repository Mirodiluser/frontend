// Render individual frames for review: node scripts/still.cjs [--hd] t1 t2 ...  → out/stills/t_XXX.png
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const args = process.argv.slice(2); const hd = args[0] === '--hd'; if (hd) args.shift();
  const out = path.join(__dirname, '../out/stills'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--allow-file-access-from-files'] });
  const W = hd ? 3840 : 1920, H = hd ? 2160 : 1080;
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + path.join(__dirname, '../src/index.html'));
  if (!hd) await pg.evaluate(() => { document.documentElement.style.zoom = '1'; });
  await pg.evaluate(() => document.fonts.ready);
  for (const a of args) {
    const t = +a; await pg.evaluate((t) => window.FILM.renderAt(t), t);
    const f = path.join(out, `t_${t.toFixed(2).padStart(7, '0')}${hd ? '_4k' : ''}.png`);
    await pg.screenshot({ path: f }); console.log(f);
  }
  if (errs.length) console.log('ERRORS:\n' + errs.join('\n'));
  await b.close();
})();

const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const br = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
  const pg = await br.newPage({ viewport: { width: 3840, height: 2160 } });
  await pg.goto('file://' + path.join(__dirname, '../src/index.html')); await pg.evaluate(() => document.fonts.ready);
  const cdp = await pg.context().newCDPSession(pg);
  for (const T of process.argv.slice(2).map(Number)) {
    let a = 0, b = 0, sz = 0; const n = 8;
    for (let i = 0; i < n; i++) { const t0 = Date.now(); await pg.evaluate((t) => window.FILM.renderAt(t), T + i / 60); const t1 = Date.now();
      const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }); const t2 = Date.now(); a += t1 - t0; b += t2 - t1; sz += r.data.length; }
    console.log(`t=${T}  js ${(a / n).toFixed(0)}ms  capture ${(b / n).toFixed(0)}ms  png ${(sz / n * 0.75 / 1e6).toFixed(1)}MB`);
  }
  await br.close();
})();

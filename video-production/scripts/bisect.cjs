const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const br = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', ...(process.env.FLAGS ? process.env.FLAGS.split(' ') : [])] });
  const pg = await br.newPage({ viewport: { width: 3840, height: 2160 } });
  await pg.goto('file://' + path.join(__dirname, '../src/index.html')); await pg.evaluate(() => document.fonts.ready);
  const cdp = await pg.context().newCDPSession(pg);
  const T = +process.argv[2];
  const tests = process.env.ONLY ? [['none','']] : [['none', ''], ['grade', '#grade'], ['bg', '#bg'], ['world', '#world'], ['ui', '#ui'], ['fx', '#fx'], ['hdr', '#hdr'], ['site-bg', '.site-bg'], ['browser-shadow', '#browser']];
  for (const [name, sel] of tests) {
    await pg.evaluate(([sel]) => { document.querySelectorAll('[data-hid]').forEach((n) => { n.style.display = ''; n.removeAttribute('data-hid'); }); }, [sel]);
    let ms = 0; const n = 3;
    for (let i = 0; i < n; i++) { await pg.evaluate(([t, sel]) => { window.FILM.renderAt(t); if (sel) { const e = document.querySelector(sel); if (sel === '#browser') { e.style.boxShadow = 'none'; } else { e.style.display = 'none'; } e.setAttribute('data-hid', 1); } }, [T + i / 60, sel]);
      const t1 = Date.now(); await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }); ms += Date.now() - t1; }
    console.log(name.padEnd(16), (ms / n).toFixed(0), 'ms');
  }
  await br.close();
})();

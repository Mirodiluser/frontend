// Deterministic frame-by-frame renderer. Every frame n is rendered at t = n / FPS (no duplicated frames).
// node scripts/render.cjs [--workers 3] [--from 0] [--to <frames>] [--name master]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out');
const HD = arg('res', '4k') === 'hd', VW = HD ? 1920 : 3840, VH = HD ? 1080 : 2160;
const W = +arg('workers', 3), NAME = arg('name', 'master'), CRF = arg('crf', '15'), PRESET = arg('preset', 'slow');
(async () => {
  fs.mkdirSync(path.join(OUT, 'seg'), { recursive: true });
  // read duration + export audio events from the same timeline
  const b0 = await chromium.launch(); const p0 = await b0.newPage({ viewport: { width: 3840, height: 2160 } });
  await p0.goto('file://' + path.join(ROOT, 'src/index.html'));
  const meta = await p0.evaluate(() => ({ d: window.FILM.DURATION, fps: window.FILM.FPS, events: window.FILM.events, chapters: window.FILM.chapters }));
  fs.writeFileSync(path.join(OUT, 'events.json'), JSON.stringify(meta, null, 1)); await b0.close();
  meta.fps = +arg('fps', meta.fps);
  const total = Math.round(meta.d * meta.fps);
  const from = +arg('from', 0), to = Math.min(+arg('to', total), total);
  const SEG = +arg('seg', 600);
  const queue = []; for (let a = from; a < to; a += SEG) queue.push([a, Math.min(to, a + SEG)]);
  const segs = queue.map(([a]) => path.join(OUT, 'seg', `${NAME}_${String(a).padStart(6, '0')}.mp4`));
  const t0 = Date.now(); let doneFrames = 0, skipped = 0;
  for (let i = 0; i < queue.length; i++) if (fs.existsSync(segs[i] + '.done')) { skipped += queue[i][1] - queue[i][0]; }
  const tick = setInterval(() => { const el = (Date.now() - t0) / 1000; const rate = doneFrames / el; process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${doneFrames + skipped}/${to - from} frames  ${rate.toFixed(2)} fps  ETA ${((to - from - skipped - doneFrames) / Math.max(rate, 0.01) / 60).toFixed(0)} min\n`); }, 60000);
  let next = 0;
  await Promise.all(Array.from({ length: W }, async (_, w) => {
    const br = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
    const pg = await br.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
    pg.on('pageerror', (e) => console.error('pageerror', e.message));
    await pg.goto('file://' + path.join(ROOT, 'src/index.html'));
    if (HD) await pg.evaluate(() => { document.documentElement.style.zoom = '1'; });
    await pg.evaluate(() => document.fonts.ready);
    const cdp = await pg.context().newCDPSession(pg);
    while (next < queue.length) {
      const qi = next++; const [a, z] = queue[qi]; const seg = segs[qi];
      if (fs.existsSync(seg + '.done')) continue;
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(meta.fps), '-c:v', 'png', '-i', '-',
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
        '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-profile:v', 'high', '-level:v', HD ? '4.1' : '5.2', '-g', String(meta.fps * 2), '-keyint_min', String(meta.fps * 2), '-sc_threshold', '0', '-bf', '3',
        '-x264-params', 'aq-mode=3', '-threads', '2',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-r', String(meta.fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
      await pg.evaluate((t) => window.FILM.renderAt(t), Math.max(0, (a - 1) / meta.fps));
      for (let n = a; n < z; n++) {
        await pg.evaluate((t) => window.FILM.renderAt(t), n / meta.fps);
        const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
        const buf = Buffer.from(r.data, 'base64');
        if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res));
        doneFrames++;
      }
      ff.stdin.end(); const code = await new Promise((res) => ff.on('close', res));
      if (code === 0) fs.writeFileSync(seg + '.done', String(z - a)); else console.error('ffmpeg failed', seg);
      console.log(`segment ${a}-${z} done (worker ${w})`);
    }
    await br.close();
  }));
  clearInterval(tick);
  const list = path.join(OUT, 'seg', NAME + '.txt'); fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
  await new Promise((res) => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, NAME + '_video.mp4')], { stdio: 'inherit' }).on('close', res));
  console.log(`\nDone ${to - from} frames in ${((Date.now() - t0) / 60000).toFixed(1)} min → out/${NAME}_video.mp4`);
})();

---
name: cinematic-video-render
description: Produce a deterministic, frame-accurate 4K60 (and 1080p60) product film from an HTML/CSS/JS scene using headless Chromium + ffmpeg. Use when asked to make, re-render, or edit the TAHRIR AI promo/tutorial video, or any browser-driven motion-design video where every frame must be a real intermediate animation state.
---

# Cinematic video render (deterministic, frame-by-frame)

Project lives in `video-production/` (repo root of `frontend`).

## Principles
- **Time is a pure input.** Every visual is a function of `t` (seconds) through `window.renderAt(t)`.
  No CSS `animation`/`transition`, no `setTimeout`, no `Date.now()`, no `Math.random()` (use the seeded RNG in `src/engine.js`).
  This is what makes 60 fps *real*: frame `n` renders `t = n/60`, never a duplicated frame.
- **Native 4K, not upscaled.** Viewport is 3840×2160 at DSF 1 and the stage is authored at 1920×1080 with `html{zoom:2}`.
  Chromium re-rasterises text on every capture, so push-ins stay sharp (verified at 4× zoom).
- **Interface truth.** UI is reconstructed from the real components (`app/page.tsx`, `UzsTopupPanel.tsx`,
  `UzsPaymentExperience.tsx`, `DocxTranslitPro.tsx`, `app/lib/uzTranslit.ts`). Copy labels verbatim.
  Never show Google Sign-In, per-page prices, real card numbers or real QR codes. Mark reconstruction as "Namoyish".
- **Qoʻllanma motion language** (`app/components/guideStyles.ts`): spring moves, a conic golden focus ring, a living cursor
  with press + ripple, word-by-word blur-rise text, one glass guide card that *travels* between targets instead of popping.

## Pipeline
1. `node scripts/precompute.cjs` — runs the real `uzTranslit.ts` to produce transliteration strings (`src/data.gen.js`).
2. Preview single frames: `node scripts/still.cjs 12.5 40 95` → `out/stills/*.png` (look at them!).
3. Render: `node scripts/render.cjs --workers 3` — each worker owns a contiguous frame range, captures PNG via CDP
   (`optimizeForSpeed`) and pipes to its own x264 encoder (`-crf 14 -preset slow -profile:v high -pix_fmt yuv420p`, closed GOP, keyint 120).
   Segments are concatenated losslessly (`-c copy`).
4. `python3 scripts/audio.py` builds music + SFX from `out/events.json` (exported by the same timeline), then `scripts/mux.sh`
   mixes, loudness-normalises (−16 LUFS, −1.5 dBTP) and muxes AAC 320k / 48 kHz stereo; also makes the 1080p60 version (lanczos downscale).
5. Run the `video-qc` skill before delivering.

## Gotchas
- 3840×2160 PNG capture ≈ 0.6 s/frame on 4 vCPU; plan ~1 h per 4 min of 4K60 with 3 workers.
- Large disk usage: never dump frames to disk; pipe them.
- `getBoundingClientRect()` is in zoomed (device) px — divide by `STAGE_SCALE` (computed at boot).
- Keep `backdrop-filter`/`filter: blur()` layers few; they are the main cost.

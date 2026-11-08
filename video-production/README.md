# TAHRIR AI — premium cinematic product film (editable source)

A deterministic motion-design project: the whole film is an HTML/CSS/JS scene whose every pixel is a pure function of time `t`.
Frames are rendered one by one in headless Chromium at native **3840×2160**, 60 fps (frame *n* ⇒ `t = n/60`, no duplicated frames),
and encoded with x264. Music and sound design are synthesised from the same timeline (`out/events.json`), so every sound has a visual cause.

## Layout
| Path | What |
|---|---|
| `src/index.html`, `src/styles.css` | Scene: reconstruction of the real tahrirai.uz UI (labels copied from `app/page.tsx`, `UzsTopupPanel.tsx`, `UzsPaymentExperience.tsx`, `DocxTranslitPro.tsx`) + film layers |
| `src/engine.js` | Motion engine: springs, easings, seeded RNG, value noise, typing schedules |
| `src/film.js` | **Timeline** — camera keys, cursor path & clicks, Qoʻllanma focus ring, guide card, step rails, captions, every UI state, SFX cues |
| `scripts/precompute.mts` | Runs the site's real `app/lib/uzTranslit.ts` → `src/data.gen.js` (all Cyrillic/Latin strings in the film come from it) |
| `scripts/icons.cjs` | Bundles the lucide icons used by the site |
| `scripts/still.cjs` | Preview frames: `node scripts/still.cjs 12.5 40 [--hd]` → `out/stills/` |
| `scripts/render.cjs` | Frame-accurate renderer (resumable 600-frame segments, N workers) |
| `scripts/audio.py` | Original score (pad, felt piano, strings, bass, air, pulse) + SFX → `out/audio/*.wav` |
| `scripts/mux.sh` | Loudness mastering (−16 LUFS, −1.5 dBTP), optional narration ducking, 4K + 1080p deliverables |
| `scripts/qc.sh` | Technical QC report + contact sheet |
| `voiceover/` | Uzbek narration script with timecodes (`.md`) and subtitles (`.srt`) |

## Build
```bash
cd video-production && npm install
node --experimental-strip-types scripts/precompute.mts && node scripts/icons.cjs
node scripts/render.cjs --workers 3 --preset fast --crf 15 --name master   # ≈2 h on 4 vCPU
pip install numpy scipy soundfile && python3 scripts/audio.py
bash scripts/mux.sh
bash scripts/qc.sh out/final/TAHRIR_AI_Premium_Cinematic_4K60.mp4
```
To change anything: edit times/texts in `src/film.js`, preview with `still.cjs`, re-render only affected segments
(delete the matching `out/seg/master_XXXXXX.mp4.done` files and run `render.cjs` again — finished segments are reused).

## Narration (Uzbek, via transcript-tts MCP)
`scripts/voiceover.py` connects to the **transcript-tts** MCP server (github.com/ShevinuM/transcript-tts — Microsoft Edge neural TTS,
voice `uz-UZ-SardorNeural`) over stdio, calls its `text_to_speech` tool for each of the 13 segments in `voiceover/tts_segments.json`
(brand names spelled phonetically for correct pronunciation), adapts the speaking rate so every segment fits its scene, levels the voice
and writes `out/audio/voice.wav`. `scripts/mux_hd.sh` then ducks the music under the voice and embeds Uzbek subtitles.
```bash
git clone https://github.com/ShevinuM/transcript-tts /home/user/shevinum/transcript-tts   # TRANSCRIPT_TTS_SERVER overrides the path
pip install edge-tts "mcp[cli]>=2.0.0"
python3 scripts/voiceover.py && python3 scripts/srt.py && bash scripts/mux_hd.sh
```
Network: the host `speech.platform.bing.com` must be allowed. Behind an HTTPS proxy, edge-tts needs `proxy=` passed to
`edge_tts.Communicate` (a 2-line change in the server's `text_to_speech`; the stock server only works without a proxy).

### Human narrator (optional)
If a professional Uzbek voice recording is made from `voiceover/script_uz.md`, save it as `out/audio/voice.wav` (48 kHz) and run
`scripts/mux.sh` — the music is side-chain ducked under the voice automatically.

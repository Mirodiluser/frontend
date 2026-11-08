---
name: video-qc
description: Technical and editorial quality control for rendered MP4 deliverables (resolution, real 60 fps without duplicate frames, codec/pixel format, 48 kHz stereo audio, loudness/peaks, A/V sync, visual contact sheets, text/spelling checks). Use before delivering any rendered video.
---

# Video QC checklist

Run `bash video-production/scripts/qc.sh <file.mp4>`; it writes `out/qc/<name>.txt` and contact sheets.

## Technical
- `ffprobe`: 3840×2160 (or 1920×1080), `r_frame_rate=60/1`, `avg_frame_rate=60/1`, H.264 High, `yuv420p`, BT.709 tags.
- Frame count = duration × 60. Audio: AAC, 48000 Hz, 2 ch.
- Duplicate-frame scan: `mpdecimate` on the whole file — only intentional holds (≤ a few % of frames) may be flagged; no long frozen runs during motion.
- Decode the full file with `ffmpeg -v error -i f.mp4 -f null -` → must print nothing (no corrupt frames).
- Loudness: `ebur128` integrated ≈ −16 LUFS, true peak ≤ −1 dBTP.
- Sync: SFX events are generated from the same timeline as the frames; spot-check click frames against waveform onsets.

## Visual / editorial
- Contact sheet every 2 s (`scripts/qc.sh` makes `sheet_*.jpg`) and look at every tile.
- Full-res stills at each chapter midpoint; zoom on text: Uzbek letters `oʻ gʻ sh ch ng`, apostrophes `ʻ` (U+02BB) and `ʼ` (U+02BC) render, nothing clipped or overlapping.
- Must NOT appear: Google sign-in, price per page, real card numbers / QR codes, "100%" accuracy or privacy promises, auto-credit on «Men toʻladim».
- Sequence matches the real UI flow (register → login, upload → price → start → result → download, payment PENDING → REVIEW → PAID).
- Fix every finding and re-render the affected range; never deliver the first export unchecked.

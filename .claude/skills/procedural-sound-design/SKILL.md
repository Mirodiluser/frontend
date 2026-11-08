---
name: procedural-sound-design
description: Compose original ambient-cinematic music and tasteful UI sound effects in Python/numpy, synchronised to an animation timeline's event list, and mix them to broadcast loudness. Use for the TAHRIR AI video soundtrack or any request for original, licence-free music/SFX that must sit under narration.
---

# Procedural sound design

Script: `video-production/scripts/audio.py` (numpy + scipy + soundfile), 48 kHz, float32, stereo.

## Music (original, no samples → no licensing issues)
- Style: Ambient Cinematic Luxury / Minimal Neo-Classical. 72 BPM, key D major / B minor colour.
- Layers: warm detuned-saw pad through a resonant low-pass (slow filter LFO), felt-piano voice
  (additive partials with slight inharmonicity, hammer noise, per-note velocity/decay), legato string texture (detuned saws, slow attack, vibrato),
  sub-bass sine with soft saturation, airy noise bed, and a barely audible pulse (filtered ticks + gentle pad ducking).
- Form follows the film's chapters (`SECTIONS` in the script): sparse intro → pulse enters in tutorial chapters →
  quieter payment/privacy → fuller final cadence. Each chapter gets its own chord set/voicing so nothing loops audibly.
- Space: stereo convolution reverb with a synthetic decorrelated IR (2.8–3.5 s), pre-delay 25 ms.

## SFX (one family, many variants)
whoosh (band-swept noise + pan), soft click (filtered transient + body), hover (very quiet tonal tick),
glass (inharmonic bell partials), text reveal (airy shimmer), paper (modulated noise bursts), scan sweep,
deep transition swell, confirmation (two soft bell tones), key taps. Every SFX call randomises pitch/level/filter a little
(seeded) so repeated actions never sound identical. SFX are placed only from timeline events — every sound has a visual cause.

## Mix rules
- Music bed ≈ −20 LUFS, ducks −6 dB under narration (if a VO stem exists), SFX peaks ≤ −12 dBFS.
- Final: `ffmpeg loudnorm` two-pass to −16 LUFS integrated, −1.5 dBTP, LRA ≤ 11. No hard limiting artefacts.
- Never use cartoon pops, game bleeps, hard hits or aggressive sub drops.

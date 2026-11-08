#!/usr/bin/env python3
"""Uzbek narration with ElevenLabs (model eleven_v4, language uz). The API key is injected by the session's
network proxy (header xi-api-key) — set ELEVEN_API_KEY yourself when running elsewhere.
Each segment is fitted to its scene window via voice_settings.speed, then placed on the timeline → out/audio/voice.wav."""
import json, os, subprocess, urllib.request
import numpy as np, soundfile as sf
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'out', 'audio', 'el'); os.makedirs(OUT, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, 'voiceover', 'tts_segments.json'), encoding='utf-8'))
VOICE = os.environ.get('EL_VOICE', 'onwK4e9ZLuTAKqWW03F9')  # Daniel — Steady Broadcaster
KEY = os.environ.get('ELEVEN_API_KEY', 'proxy-injected')
def tts(text, speed, prev, nxt, path):
    body = {'text': text, 'model_id': 'eleven_v4', 'language_code': 'uz', 'previous_text': prev, 'next_text': nxt,
            'voice_settings': {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.15, 'use_speaker_boost': True, 'speed': speed}}
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128', data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'xi-api-key': KEY}, method='POST')
    with urllib.request.urlopen(req, timeout=180) as r: open(path, 'wb').write(r.read())
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
segs = cfg['segments']; timing = []
for i, s in enumerate(segs):
    win = s['end'] - s['start']; speed = 0.97; path = os.path.join(OUT, f'seg{i:02d}.mp3')
    prev = segs[i - 1]['text'] if i else ''; nxt = segs[i + 1]['text'] if i + 1 < len(segs) else ''
    meta = path + '.json'; cached = os.path.exists(meta) and json.load(open(meta)).get('text') == s['text']
    if cached:
        speed = json.load(open(meta))['speed']; d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
    else:
        d = tts(s['text'], speed, prev, nxt, path)
    if not cached and d > win * 0.98:  # too long for the scene → one retry, a bit faster (ElevenLabs speed range 0.7–1.2)
        speed = min(1.18, round(speed * d / (win * 0.95), 2)); d = tts(s['text'], speed, prev, nxt, path)
    json.dump({'text': s['text'], 'speed': speed}, open(meta, 'w'))
    print(f'seg{i:02d} window {win:5.1f}s speech {d:5.1f}s speed {speed}', flush=True)
    timing.append({'start': s['start'], 'speech': d})
json.dump(timing, open(os.path.join(ROOT, 'out', 'audio', 'vo', 'timing.json'), 'w'), indent=1)
SR = 48000; total = int(segs[-1]['end'] * SR) + SR * 6; voice = np.zeros(total)
for i, t in enumerate(timing):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', os.path.join(OUT, f'seg{i:02d}.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64); a = int(t['start'] * SR); voice[a:a + len(x)] += x[: total - a]
raw_p = os.path.join(ROOT, 'out', 'audio', 'voice_raw.wav'); sf.write(raw_p, voice, SR, subtype='PCM_24')
fin = os.path.join(ROOT, 'out', 'audio', 'voice.wav')
subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', raw_p, '-af', 'highpass=f=80,acompressor=threshold=-22dB:ratio=2:attack=10:release=200:makeup=1.5,aecho=0.8:0.2:35|58:0.08|0.05,pan=stereo|c0=c0|c1=c0',
                       '-ar', str(SR), '-c:a', 'pcm_s24le', fin])
vw, _ = sf.read(fin); act = np.abs(vw.mean(1)) > 1e-4
g = 10 ** ((-17 - 20 * np.log10(np.sqrt(np.mean(vw[act] ** 2)) + 1e-12)) / 20); vw = np.tanh(vw * g * 1.05) / 1.05
sf.write(fin, vw, SR, subtype='PCM_24'); print(f'voice.wav ready (gain {20*np.log10(g):+.1f} dB)')

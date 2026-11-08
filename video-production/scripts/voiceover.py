#!/usr/bin/env python3
"""Uzbek narration via the transcript-tts MCP server (github.com/ShevinuM/transcript-tts, Edge neural TTS).
Each segment is synthesised through the MCP tool `text_to_speech`; the speaking rate is adapted so it fits
its scene window, then all segments are placed on the timeline → out/audio/voice.wav (48 kHz stereo)."""
import asyncio, json, os, subprocess, sys
import numpy as np, soundfile as sf
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SERVER = os.environ.get('TRANSCRIPT_TTS_SERVER', '/home/user/shevinum/transcript-tts/server.py')
OUT = os.path.join(ROOT, 'out', 'audio', 'vo'); os.makedirs(OUT, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, 'voiceover', 'tts_segments.json'), encoding='utf-8'))
BASE = int(os.environ.get('VO_BASE_RATE', '-4'))
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
async def main():
    env = dict(os.environ, TRANSCRIPT_TTS_OUTPUT_DIR=OUT)
    async with stdio_client(StdioServerParameters(command=sys.executable, args=[SERVER], env=env)) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = []
            for i, seg in enumerate(cfg['segments']):
                win = seg['end'] - seg['start']; rate = BASE
                for attempt in range(4):
                    out = await s.call_tool('text_to_speech', {'text': seg['text'], 'voice': cfg['voice'], 'rate': f'{rate:+d}%', 'filename': f'seg{i:02d}_r{rate:+d}'})
                    if getattr(out, 'is_error', False): raise RuntimeError(out.content[0].text)
                    path = json.loads(out.content[0].text)['audio_path']; d = dur(path)
                    if d <= win * 0.98 or rate >= 18: break
                    rate = min(18, rate + int(np.ceil((d / (win * 0.96) - 1) * 100)) + 1)
                print(f'seg{i:02d} window {win:5.1f}s  speech {d:5.1f}s  rate {rate:+d}%', flush=True)
                res.append((seg['start'], path, d, win, rate))
            return res
segs = asyncio.run(main())
json.dump([{'start': a, 'speech': d} for a, _, d, _, _ in segs], open(os.path.join(OUT, 'timing.json'), 'w'), indent=1)
SR = 48000; total = int(cfg['segments'][-1]['end'] * SR) + SR * 6
voice = np.zeros(total)
for start, path, d, win, rate in segs:
    wav = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    x = np.frombuffer(wav, dtype=np.float32).astype(np.float64)
    i = int(start * SR); voice[i:i + len(x)] += x[: total - i]
sf.write(os.path.join(ROOT, 'out', 'audio', 'voice_raw.wav'), voice, SR, subtype='PCM_24')
# broadcast voice chain: rumble cut, gentle presence, light compression, soft room, -1 dB peak
subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(ROOT, 'out', 'audio', 'voice_raw.wav'), '-af',
  'highpass=f=85,lowshelf=f=180:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1.8,deesser=i=0.4,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=180:makeup=2,'
  'aecho=0.8:0.25:38|61:0.12|0.07,pan=stereo|c0=c0|c1=c0,alimiter=limit=0.89', '-ar', '48000', '-c:a', 'pcm_s24le', os.path.join(ROOT, 'out', 'audio', 'voice.wav')])
print('voice.wav ready')
# level: narration RMS (while speaking) → −17 dBFS, so it sits ~8–10 dB above the ducked music
import soundfile as _sf
vw, _sr = _sf.read(os.path.join(ROOT, 'out', 'audio', 'voice.wav'))
act = np.abs(vw.mean(1)) > 1e-4
g = 10 ** ((-17 - 20 * np.log10(np.sqrt(np.mean(vw[act] ** 2)) + 1e-12)) / 20)
vw = np.tanh(vw * g * 1.05) / 1.05
_sf.write(os.path.join(ROOT, 'out', 'audio', 'voice.wav'), vw, _sr, subtype='PCM_24')
print(f'voice gain {20*np.log10(g):+.1f} dB')

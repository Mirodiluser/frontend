#!/usr/bin/env python3
"""TAHRIR AI film — original score + sound design, fully procedural (no samples, no licences needed).

Reads out/events.json (exported by the same timeline that renders the frames) so every sound
has a visual cause and lands on the exact frame. Writes:
  out/audio/music.wav  (score stem)      out/audio/sfx.wav (sound-design stem)
  out/audio/mix.wav    (pre-master mix, 48 kHz / 24-bit stereo)
"""
import json, os, sys
import numpy as np
from scipy import signal
import soundfile as sf

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'out', 'audio')
os.makedirs(OUT, exist_ok=True)
meta = json.load(open(os.path.join(ROOT, 'out', 'events.json')))
DUR = float(meta['d'])
N = int(DUR * SR) + SR * 2
rng = np.random.default_rng(20261108)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.full(n, s, dtype=np.float64)
    if a: e[:a] = np.linspace(0, 1, a) ** 1.6
    if d: e[a:a + d] = np.linspace(1, s, min(d, max(0, n - a)))[:len(e[a:a + d])]
    if r: e[-r:] *= np.linspace(1, 0, min(r, n)) ** 1.4
    return e
def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), 'low', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def saw(f, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + phase) % 1.0) - 1
def pan2(x, p):  # equal power, p in [-1, 1]
    a = (p + 1) * np.pi / 4; return np.stack([x * np.cos(a), x * np.sin(a)])
def add(buf, x, t0):
    i = int(t0 * SR)
    if i >= buf.shape[-1]: return
    if i < 0: x = x[..., -i:]; i = 0
    n = min(x.shape[-1], buf.shape[-1] - i); buf[..., i:i + n] += x[..., :n]

def reverb_ir(sec=3.2, pre=0.025, bright=5200, seed=1):
    r = np.random.default_rng(seed); n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.zeros((2, n + int(pre * SR)))
    for c in range(2):
        noise = r.standard_normal(n) * np.exp(-t * 6.9 / sec)
        noise = lp(noise, bright) * (1 - np.exp(-t * 60))
        ir[c, int(pre * SR):] = noise
    ir /= np.max(np.abs(ir)); return ir * 0.25
def reverb(x, ir, wet=0.35):
    y = np.stack([signal.fftconvolve(x[c], ir[c])[:x.shape[1]] for c in range(2)])
    return x * (1 - wet) + y * wet

# ---------------------------------------------------------------- harmony
# Warm D-major world: maj9 / m11 colours, voice-led. (start, chord-name)
CH = {
 'Dmaj9': [50, 57, 61, 64, 66], 'Gmaj9': [43, 50, 54, 57, 59], 'Bm11': [47, 54, 57, 61, 64], 'A6/9': [45, 52, 54, 59, 61],
 'Em9': [40, 50, 54, 55, 59], 'F#m7': [42, 52, 57, 61, 64], 'Gmaj7#11': [43, 50, 54, 61, 59], 'Asus': [45, 52, 57, 59, 62],
 'D/F#': [42, 50, 57, 61, 64],
}
B = 60 / 72; BAR = 4 * B
prog = []
def section(t0, t1, names, bars=2):
    t = t0; i = 0
    while t < t1 - 0.01:
        d = min(bars * BAR, t1 - t); prog.append((t, t + d, names[i % len(names)])); t += d; i += 1
section(0, 13.3, ['Dmaj9', 'Gmaj9'], bars=2)
section(13.3, 36.0, ['Dmaj9', 'Bm11', 'Gmaj9', 'A6/9'])
section(36.0, 70.0, ['Bm11', 'Gmaj9', 'Dmaj9', 'Asus', 'Em9', 'Gmaj9', 'Dmaj9', 'A6/9'])
section(70.0, 100.0, ['Gmaj9', 'Dmaj9', 'Em9', 'A6/9'])
section(100.0, 127.0, ['Dmaj9', 'F#m7', 'Gmaj9', 'Asus'])
section(127.0, 159.4, ['Bm11', 'Gmaj7#11', 'Em9', 'A6/9'])
section(159.4, 181.0, ['Gmaj9', 'A6/9', 'F#m7', 'Bm11'])
section(181.0, 229.6, ['Dmaj9', 'Gmaj9', 'D/F#', 'Em9', 'Gmaj9', 'Asus'])
section(229.6, 251.6, ['Gmaj9', 'Dmaj9', 'Em9', 'Gmaj9'], bars=3)
prog += [(251.6, 254.6, 'Asus'), (254.6, DUR + 1.5, 'Dmaj9')]

# intensity curve per chapter (0..1) drives layer levels → the score follows the story
def intensity(t):
    pts = [(0, .15), (6, .3), (12, .55), (14, .5), (36, .6), (70, .65), (100, .72), (110, .8), (127, .72), (140, .8), (159, .7), (181, .55), (200, .6), (216, .7), (229, .5), (240, .45), (251, .6), (256, .9), (262, .55), (268, .15)]
    xs, ys = zip(*pts); return np.interp(t, xs, ys)
def pulse_amt(t):
    pts = [(0, 0), (36, 0), (40, .8), (68, .8), (72, .6), (98, .7), (100, .5), (108, .4), (117, .8), (127, .7), (138, .5), (150, .7), (159, .8), (180, .6), (185, .3), (205, .4), (216, .1), (229, 0), (268, 0)]
    xs, ys = zip(*pts); return np.interp(t, xs, ys)

T = np.arange(N) / SR
music = np.zeros((2, N))

print('pad…', flush=True)
for (t0, t1, name) in prog:
    notes = CH[name]; xf = 1.6
    n = int((t1 - t0 + xf * 2) * SR)
    seg = np.zeros((2, n))
    for j, m in enumerate(notes):
        f = mtof(m + 12)
        for k, det in enumerate((-0.09, 0.0, 0.085)):
            ph = rng.random()
            v = saw(f * 2 ** (det / 12), n, ph)
            seg += pan2(v, (-0.6 + 1.2 * ((j * 3 + k) % 7) / 6)) * 0.05
    seg = np.stack([lp(hp(seg[c], 110), 1500, 4) for c in range(2)])
    e = env_adsr(n, xf, 0.1, 1.0, xf)
    add(music, seg * e * 0.55, t0 - xf)
# slow filter "breathing": amplitude-weighted brightness via a gentle tremolo on the pad bus
music *= (0.86 + 0.14 * np.sin(2 * np.pi * T / 9.3))[None, :]

print('strings…', flush=True)
strings = np.zeros((2, N))
for (t0, t1, name) in prog:
    notes = CH[name][2:]; n = int((t1 - t0 + 3.0) * SR)
    tt = np.arange(n) / SR
    for j, m in enumerate(notes):
        f = mtof(m + 12)
        for k, det in enumerate((-0.06, 0.05)):
            vib = 1 + 0.0035 * np.sin(2 * np.pi * (4.9 + 0.3 * k) * tt + rng.random() * 6)
            ph = np.cumsum(f * 2 ** (det / 12) * vib) / SR + rng.random()
            v = 2 * (ph % 1.0) - 1
            strings[:, :0] += 0
            add(strings, pan2(v * 0.035, (-0.5 + j * 0.5) * (1 if k else -1)) * env_adsr(n, 2.2, 0.5, 0.8, 2.6), t0 - 0.6)
strings = np.stack([lp(hp(strings[c], 180), 2600, 4) for c in range(2)])
strings *= np.clip((intensity(T) - 0.45) / 0.4, 0, 1)[None, :] * 0.9

print('piano…', flush=True)
piano = np.zeros((2, N))
def piano_note(m, vel, length=4.0):
    f = mtof(m); n = int(length * SR); t = np.arange(n) / SR; Bc = 0.00025; x = np.zeros(n)
    for h in range(1, 9):
        fh = f * h * np.sqrt(1 + Bc * h * h)
        if fh > 9000: break
        dec = 1.2 + 0.55 * h + f / 600
        x += (1 / h ** 1.25) * np.sin(2 * np.pi * fh * t + rng.random()) * np.exp(-t * dec * (0.8 + 0.4 * (1 - vel)))
    ham = lp(rng.standard_normal(int(0.012 * SR)), 2400) * np.linspace(1, 0, int(0.012 * SR)) * 0.25
    x[:len(ham)] += ham
    x *= np.minimum(1, t / 0.004)
    x = lp(x, 1800 + 2600 * vel)  # felt: darker when soft
    return x * vel
r2 = np.random.default_rng(7)
for ci, (t0, t1, name) in enumerate(prog):
    notes = CH[name]; top = [notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[3] + 24]
    patterns = [[0, 2, 1, 3], [1, 3, 2, 0], [2, 1, 3, 1], [0, 1, 2, 3, 2]]
    pat = patterns[ci % len(patterns)]
    step = B * (2 if t0 < 13 or t0 > 229 else 1)
    t = t0 + (B * 0.5 if ci % 2 else 0)
    k = 0
    while t < t1 - 0.2:
        if r2.random() < (0.55 if t0 < 13 or t0 > 229 else 0.8):
            m = top[pat[k % len(pat)]]
            vel = 0.35 + 0.25 * r2.random() + 0.2 * intensity(t)
            x = piano_note(m, min(vel, 0.85))
            add(piano, pan2(x * 0.16, -0.3 + 0.6 * ((m % 12) / 11)), t + (r2.random() - 0.5) * 0.03)
        t += step; k += 1
# melodic phrase at the title moments
for (tt, mel) in [(5.4, [74, 78, 81, 78]), (254.8, [74, 78, 81, 85, 86])]:
    for i, m in enumerate(mel):
        add(piano, pan2(piano_note(m, 0.6, 5) * 0.2, 0.1 * i - 0.2), tt + i * B * 0.75)

print('bass + air + pulse…', flush=True)
bass = np.zeros(N)
for (t0, t1, name) in prog:
    m = CH[name][0] - 12 if CH[name][0] > 45 else CH[name][0]; n = int((t1 - t0 + 1.2) * SR); tt = np.arange(n) / SR
    f = mtof(m); x = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
    x = np.tanh(1.4 * x) * env_adsr(n, 0.9, 0.3, 0.85, 1.0)
    add(bass[None, :], x[None, :] * 0.085, t0 - 0.2)
bass *= np.clip(intensity(T) * 1.2, 0.2, 1)
air = bp(rng.standard_normal(N), 3500, 11000) * 0.016 * (0.6 + 0.4 * np.sin(2 * np.pi * T / 13.0))
air2 = np.stack([air, np.roll(air, 2400)])
pulse = np.zeros((2, N)); duck = np.ones(N)
pa = pulse_amt(np.arange(0, DUR, B))
for i, a in enumerate(pa):
    t = i * B
    if a < 0.02: continue
    n = int(0.22 * SR); tt = np.arange(n) / SR
    th = np.sin(2 * np.pi * (52 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18) * 0.11 * a
    add(pulse, pan2(th, 0), t)
    tk = hp(rng.standard_normal(int(0.04 * SR)), 6000) * np.exp(-np.arange(int(0.04 * SR)) / SR * 90) * 0.02 * a
    add(pulse, pan2(tk, 0.35 if i % 2 else -0.35), t + B / 2)
    j = int(t * SR); d = int(0.3 * SR)
    if j + d < N: duck[j:j + d] = np.minimum(duck[j:j + d], 1 - 0.12 * a * np.exp(-np.arange(d) / SR * 9))

level = 0.55 + 0.45 * intensity(T)
music = (music * duck[None, :] + strings) * level[None, :] + piano * (0.7 + 0.3 * level)[None, :] + np.stack([bass, bass]) * 0.9 + air2 + pulse
print('reverb (music)…', flush=True)
music = reverb(music, reverb_ir(3.4, 0.03, 5000, 3), wet=0.42)
music = np.stack([hp(music[c], 30) for c in range(2)])
fade = np.clip(T / 2.5, 0, 1) ** 2 * np.clip((DUR + 0.6 - T) / 3.0, 0, 1)
music *= fade[None, :]

# ---------------------------------------------------------------- SFX
print('sfx…', flush=True)
sfx = np.zeros((2, N)); rs = np.random.default_rng(99)
def noise(n): return rs.standard_normal(n)
def click(v=1.0):  # luxury UI click: muted transient + short woody body
    n = int(0.09 * SR); t = np.arange(n) / SR
    f = 1800 * (0.85 + 0.3 * rs.random())
    body = np.sin(2 * np.pi * f * t) * np.exp(-t * 95) * 0.5 + np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t * 60) * 0.35
    tr = bp(noise(n), 2500, 7000) * np.exp(-t * 400) * 0.6
    return lp(body + tr, 6500) * v * 0.24
def key(v=1.0):
    n = int(0.05 * SR); t = np.arange(n) / SR
    x = bp(noise(n), 1500, 5000) * np.exp(-t * 180) * 0.4 + np.sin(2 * np.pi * (380 + 120 * rs.random()) * t) * np.exp(-t * 120) * 0.2
    return x * v * 0.16
def whoosh(d=1.5, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.2
    lo = lp(x, 900); mid = bp(x, 900, 3200)
    sweep = 0.5 - 0.5 * np.cos(np.pi * np.clip(t / d, 0, 1))
    y = lo * (1 - sweep) * 0.8 + mid * sweep * 0.5
    return y * e * v * 0.22
def glass(v=1.0, base=None):
    n = int(2.4 * SR); t = np.arange(n) / SR; f = base or rs.choice([880, 987.8, 1108.7, 1318.5])
    x = sum((a * np.sin(2 * np.pi * f * r * t + rs.random()) * np.exp(-t * dk)) for a, r, dk in [(1, 1, 2.2), (.5, 2.76, 3.5), (.3, 5.4, 6), (.15, 8.9, 9)])
    return x * np.minimum(1, t / 0.003) * v * 0.045
def shimmer(v=1.0):
    n = int(2.2 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for i in range(7):
        f = 1760 * 2 ** (rs.integers(0, 12) / 12) * (1 + i % 2); st = i * 0.09
        y += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(t - st, 0) * 3.5) * (t >= st) * 0.12
    return (y + hp(noise(n), 7000) * np.exp(-t * 3) * 0.05) * np.sin(np.pi * np.clip(t / 2.2, 0, 1)) ** 0.5 * v * 0.18
def reveal(v=1.0):
    n = int(1.0 * SR); t = np.arange(n) / SR
    return bp(noise(n), 2500, 8000) * np.sin(np.pi * t / 1.0) ** 2 * 0.06 * v + np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t * 5) * 0.025 * v
def swell(v=1.0, d=1.8):
    n = int(d * SR); t = np.arange(n) / SR; e = np.sin(np.pi * t / d) ** 2
    return (np.sin(2 * np.pi * 73.4 * t) * 0.5 + lp(noise(n), 300) * 0.25) * e * v * 0.2
def confirm(v=1.0, big=False):
    y = glass(0.9, 1174.7)
    y2 = np.zeros_like(y); s = int(0.12 * SR); y2[s:] = glass(0.8, 1480.0)[:len(y) - s]
    out = y + y2
    if big: s = int(0.24 * SR); y3 = np.zeros_like(y); y3[s:] = glass(0.7, 1760.0)[:len(y) - s]; out += y3
    return out * v * 1.6
def paper(v=1.0):
    n = int(0.7 * SR); t = np.arange(n) / SR; m = np.abs(lp(noise(n), 30)) * 6
    return bp(noise(n), 1800, 7000) * m * np.sin(np.pi * t / 0.7) * 0.05 * v
def scan(d=4.0, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; e = np.sin(np.pi * t / d) ** 1.5
    ph = np.cumsum(600 + 900 * t / d) / SR
    tone = np.sin(2 * np.pi * ph) * 0.02 + np.sin(2 * np.pi * ph * 1.5) * 0.01
    return (bp(noise(n), 2500, 6000) * 0.035 + tone) * e * v * 2.6
def tick(d=2.6):
    n = int(d * SR); y = np.zeros(n); k = 0; tt = 0.0
    while tt < d - 0.05:
        c = key(0.6); i = int(tt * SR); m = min(len(c), n - i); y[i:i + m] += c[:m]; tt += 0.11 + 0.02 * np.sin(k); k += 1
    return y * 0.8
def tone(nm):
    base = {'open': 146.8, 'flash': 220.0, 'price': 587.3, 'order': 659.3}.get(nm, 440)
    n = int(3.0 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * base * t) * 0.6 + np.sin(2 * np.pi * base * 1.5 * t) * 0.25) * np.sin(np.pi * np.clip(t / 3.0, 0, 1)) ** 2 * 0.05
def drop():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (220 - 90 * t / 0.35) * t) * np.exp(-t * 12) * 0.2 + lp(noise(n), 1200) * np.exp(-t * 30) * 0.12) * 0.7
def mark():
    n = int(0.6 * SR); t = np.arange(n) / SR
    return lp(noise(n), 3000) * np.exp(-t * 14) * 0.05 + np.sin(2 * np.pi * 1046.5 * t) * np.exp(-t * 6) * 0.04
def count(d=1.4):
    n = int(d * SR); y = np.zeros(n)
    for i in range(10):
        g = glass(0.25, 1568.0 * 2 ** (i / 24)); s = int(i * d / 10 * SR); m = min(len(g), n - s); y[s:s + m] += g[:m]
    return y

last = {}
for e in meta['events']:
    t, ty = e['t'], e['type']
    p = float(np.clip(e.get('pan', (rs.random() - 0.5) * 0.4), -1, 1))
    if ty == 'click': x = click(0.9 + 0.2 * rs.random())
    elif ty == 'key':
        if t - last.get('key', -9) < 0.03: continue
        x = key(0.7 + 0.5 * rs.random())
    elif ty == 'whoosh': x = whoosh(e.get('d', 1.5))
    elif ty == 'swoosh': x = whoosh(0.6, 0.7)
    elif ty == 'glass': x = glass(0.6 if e.get('soft') else 1.0)
    elif ty == 'shimmer': x = shimmer()
    elif ty == 'reveal': x = reveal()
    elif ty == 'swell': x = swell()
    elif ty == 'confirm': x = confirm(0.6 if e.get('soft') else 1.0, bool(e.get('big')))
    elif ty == 'paper': x = paper()
    elif ty in ('scan', 'sweep'): x = scan(e.get('d', 1.2))
    elif ty == 'tick': x = tick(e.get('d', 2.6))
    elif ty == 'tone': x = tone(e.get('n'))
    elif ty == 'drop': x = drop()
    elif ty == 'grab': x = click(0.5)
    elif ty == 'mark': x = mark()
    elif ty == 'count': x = count(e.get('d', 1.4))
    else: continue
    last[ty] = t
    add(sfx, pan2(x, p), t)
print('reverb (sfx)…', flush=True)
sfx = reverb(sfx, reverb_ir(1.8, 0.012, 7000, 5), wet=0.22)

def norm_peak(x, db):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (db / 20)
music = norm_peak(music, -6.0); sfx_peak = np.max(np.abs(sfx))
sfx = sfx / (sfx_peak + 1e-9) * 10 ** (-9.0 / 20)
mix = music * 0.82 + sfx * 0.9
mix = np.tanh(mix * 1.1) / 1.1  # gentle safety saturation, no hard clipping
L = int((DUR) * SR)
sf.write(os.path.join(OUT, 'music.wav'), music[:, :L].T, SR, subtype='PCM_24')
sf.write(os.path.join(OUT, 'sfx.wav'), sfx[:, :L].T, SR, subtype='PCM_24')
sf.write(os.path.join(OUT, 'mix.wav'), mix[:, :L].T, SR, subtype='PCM_24')
print('ok', L / SR, 's')

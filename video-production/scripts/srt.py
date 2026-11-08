# Builds voiceover/script_uz.srt from the timed table in voiceover/script_uz.md
import re
rows = [l for l in open('voiceover/script_uz.md', encoding='utf-8') if re.match(r'^\| \d\d:', l)]
def sec(s):
    m, r = s.split(':'); return int(m) * 60 + float(r)
def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
import json, os
TIM = json.load(open('out/audio/vo/timing.json')) if os.path.exists('out/audio/vo/timing.json') else None
cues = []
for ri, r in enumerate(rows):
    _, tm, txt, _ = r.split('|'); a, b = [sec(x.strip()) for x in tm.split('–')]
    if TIM: a, b = TIM[ri]['start'], TIM[ri]['start'] + TIM[ri]['speech'] + 0.25  # follow the recorded narration
    sents0 = [s.strip() for s in re.split(r'(?<=[.!?])\s+', txt.strip()) if s.strip()]
    sents = []
    for s0 in sents0:  # long sentences → chunks at commas / dashes (≤ 84 chars per cue)
        parts = re.split(r'(?<=,)\s+', s0); cur = ''
        for p_ in parts:
            if cur and len(cur) + len(p_) + 1 > 84: sents.append(cur); cur = p_
            else: cur = (cur + ' ' + p_).strip()
        if cur: sents.append(cur)
    total = sum(len(s) for s in sents); t = a
    for s in sents:
        d = (b - a) * len(s) / total
        words = s.split(); lines = [s]
        if len(s) > 42:  # balanced two lines
            best = min(range(1, len(words)), key=lambda k: abs(len(' '.join(words[:k])) - len(' '.join(words[k:]))))
            lines = [' '.join(words[:best]), ' '.join(words[best:])]
        cues.append((t, t + d - 0.05, '\n'.join(lines))); t += d
with open('voiceover/script_uz.srt', 'w', encoding='utf-8') as f:
    for i, (a, b, s) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{s}\n\n")
print(len(cues), 'cues')

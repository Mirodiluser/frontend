#!/usr/bin/env bash
# Full HD 30 fps deliverable: master the audio (two-pass loudnorm −16 LUFS / −1.5 dBTP) and mux with out/hd30_video.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
A=out/audio; mkdir -p out/final; SRC=$A/mix.wav
if [ -f $A/voice.wav ]; then   # narration present → duck the music under the voice (SFX stay untouched)
  ffmpeg -y -v error -i $A/music.wav -i $A/sfx.wav -i $A/voice.wav -filter_complex \
   "[2:a]asplit=2[vk][vm];[0:a][vk]sidechaincompress=threshold=0.06:ratio=2.2:attack=60:release=700:makeup=1[md];[md][1:a][vm]amix=inputs=3:weights=0.82 0.8 1.0:normalize=0,alimiter=limit=0.95[o]" \
   -map "[o]" -ar 48000 -c:a pcm_s24le $A/mix_vo.wav
  SRC=$A/mix_vo.wav
fi
J=$(ffmpeg -hide_banner -nostats -i $SRC -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $SRC -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le $A/master_audio.wav
ffmpeg -y -v error -i out/hd30_video.mp4 -i $A/master_audio.wav -i voiceover/script_uz.srt -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -c:s mov_text \
  -metadata:s:a:0 language=uzb -metadata:s:s:0 language=uzb -metadata:s:s:0 title="Oʻzbekcha" -shortest -movflags +faststart \
  -metadata title="TAHRIR AI — Premium (Full HD 30, oʻzbekcha ovoz)" -metadata comment="Narration: ElevenLabs eleven_v4 (synthetic voice)" out/final/${OUT_NAME:-TAHRIR_AI_Premium_FullHD30_UZ_voice}.mp4
ls -la out/final

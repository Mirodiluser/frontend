#!/usr/bin/env bash
# Full HD 30 fps deliverable: master the audio (two-pass loudnorm −16 LUFS / −1.5 dBTP) and mux with out/hd30_video.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
A=out/audio; mkdir -p out/final; SRC=$A/mix.wav
J=$(ffmpeg -hide_banner -nostats -i $SRC -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $SRC -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le $A/master_audio.wav
ffmpeg -y -v error -i out/hd30_video.mp4 -i $A/master_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart \
  -metadata title="TAHRIR AI — Premium (Full HD 30)" out/final/TAHRIR_AI_Premium_FullHD30.mp4
ls -la out/final

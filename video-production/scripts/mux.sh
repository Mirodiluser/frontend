#!/usr/bin/env bash
# Master audio (two-pass loudnorm, -16 LUFS / -1.5 dBTP), mux with the 4K60 picture, derive the 1080p60 version.
# Optional: put a recorded narration at out/audio/voice.wav — music is then side-chain ducked (~-6 dB) under the voice.
set -euo pipefail
cd "$(dirname "$0")/.."
A=out/audio; V=out/master_video.mp4; mkdir -p out/final
SRC=$A/mix.wav
if [ -f $A/voice.wav ]; then
  ffmpeg -y -v error -i $A/music.wav -i $A/sfx.wav -i $A/voice.wav -filter_complex \
   "[2:a]asplit=2[vk][vm];[0:a][vk]sidechaincompress=threshold=0.03:ratio=4:attack=80:release=600:makeup=1[md];[md][1:a][vm]amix=inputs=3:weights=0.82 0.9 1.0:normalize=0[o]" \
   -map "[o]" -ar 48000 -c:a pcm_s24le $A/mix_vo.wav
  SRC=$A/mix_vo.wav
fi
J=$(ffmpeg -hide_banner -nostats -i $SRC -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $SRC -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le $A/master_audio.wav
ffmpeg -y -v error -i $V -i $A/master_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -ac 2 -shortest -movflags +faststart \
  -metadata title="TAHRIR AI — Premium Cinematic" -metadata language=uzb out/final/TAHRIR_AI_Premium_Cinematic_4K60.mp4
ffmpeg -y -v error -i $V -i $A/master_audio.wav -map 0:v -map 1:a \
  -vf "scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level:v 4.2 -g 120 -bf 3 -r 60 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart -metadata title="TAHRIR AI — Premium (Full HD)" out/final/TAHRIR_AI_Premium_FullHD60.mp4
ls -la out/final

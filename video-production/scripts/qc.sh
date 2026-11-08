#!/usr/bin/env bash
# Technical QC for a delivered MP4: bash scripts/qc.sh out/final/<file>.mp4
set -uo pipefail
F="$1"; N=$(basename "$F" .mp4); D="$(dirname "$0")/../out/qc"; mkdir -p "$D"; R="$D/$N.txt"
{
echo "# QC: $N"; date -u
echo "## streams"; ffprobe -v error -show_entries stream=codec_name,profile,level,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,color_space,color_primaries,color_transfer,sample_rate,channels,bit_rate -show_entries format=duration,size,bit_rate -of default=nw=1 "$F"
echo "## decode check (errors below, empty = clean)"; ffmpeg -v error -i "$F" -f null - 2>&1 | head -20
echo "## frame count / duplicates (mpdecimate on full file)"
TOT=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$F")
KEPT=$(ffmpeg -hide_banner -nostats -i "$F" -an -vf "mpdecimate=hi=64*12:lo=64*5:frac=0.33,showinfo" -f null - 2>&1 | grep -c "n:")
echo "frames=$TOT  unique(mpdecimate)=$KEPT  near-identical=$((TOT-KEPT))"
echo "## loudness"; ffmpeg -hide_banner -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary
} > "$R" 2>&1
ffmpeg -v error -y -i "$F" -vf "fps=1/2,scale=480:-1,tile=6x23" -frames:v 1 "$D/${N}_sheet.jpg"
cat "$R"

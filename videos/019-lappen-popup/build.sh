#!/bin/sh
# „Durch die Lappen gehen“ (Pop-up) – Neubau: Ereignisse → Mix → Bild → Master (−14 LUFS)
# Stimme/Zeiten kommen aus ../018-lappen (audio/voice.wav, timeline.json)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export PATH=/root/ffmpeg7/ffmpeg-7.0.2-amd64-static:$PATH
cd "$LIB"
node core/render/events.mjs "$HERE"
python3 "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/lappen-popup.mp4" 24 2

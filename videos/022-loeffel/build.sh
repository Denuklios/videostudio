#!/bin/sh
# Pop-up-Folge – Neubau: Ereignisse → Mix → Bild → Master (−14 LUFS). Stimme vorher: tools/timeline.py (Qwen3 Ryan)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export PATH=/root/ffmpeg7/ffmpeg-7.0.2-amd64-static:$PATH
cd "$LIB"
node core/render/events.mjs "$HERE"
python3 "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/loeffel.mp4" 24 2
ffmpeg -loglevel error -y -ss 0.04 -i "$HERE/loeffel.mp4" -frames:v 1 "$HERE/loeffel_cover.jpg"
echo BUILD_OK

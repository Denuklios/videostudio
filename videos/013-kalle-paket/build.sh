#!/bin/sh
# Kalle und das Paket – kompletter Neubau: Stimmen → Ereignisse → Mix → Bild → Master (−14 LUFS)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export PATH=/root/ffmpeg7/ffmpeg-7.0.2-amd64-static:$PATH
sh "$HERE/tools/fonts.sh"
python3 "$HERE/voice.py"
cd "$LIB"
node core/render/events.mjs "$HERE"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/kalle-paket.mp4" 24

#!/bin/sh
# „Durch die Lappen gehen“ – kompletter Neubau: Schriften → Zeitplan (aus Stimme) → Mix → Bild → Master (−14 LUFS)
# Stimme vorher: Qwen3 Ryan (../../engine/qwen_stimme.py) → audio/voice_raw.wav, Wortzeiten → audio/woerter_raw.json
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export PATH=/root/ffmpeg7/ffmpeg-7.0.2-amd64-static:$PATH
sh "$HERE/tools/fonts.sh"
python3 "$HERE/tools/timeline.py"
python3 "$HERE/mix.py"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/lappen.mp4" 24 4

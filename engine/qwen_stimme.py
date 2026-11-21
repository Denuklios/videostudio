#!/usr/bin/env python3
"""Qwen3-TTS: ganzer Sprechtext in EINEM Durchgang (gleichbleibende Stimme) → WAV.
Aufruf (qwen-venv): python qwen_stimme.py <eingabe.json> <ausgabe.wav>
eingabe.json: {"text": "...", "stimme": "design_erzaehler|design_tiktok|Ryan|Aiden"}"""
import json, sys, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
cfg = json.load(open(sys.argv[1])); text, st = cfg["text"], cfg["stimme"]
DESIGN = {
    "design_erzaehler": "Tiefe, warme deutsche Männerstimme, Ende dreißig, wie ein spannender Doku-Erzähler, natürliches Hochdeutsch, lebendige Betonung.",
    "design_tiktok": "Junge, energiegeladene deutsche Männerstimme, schnell und begeistert wie ein TikTok-Creator, klares Hochdeutsch.",
}
if st in DESIGN:
    m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    w, sr = m.generate_voice_design(text=text, language="German", instruct=DESIGN[st], max_new_tokens=4096)
else:
    m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice", device_map="cpu", dtype=torch.float32)
    w, sr = m.generate_custom_voice(text=text, language="German", speaker=st, max_new_tokens=4096)
sf.write(sys.argv[2], w[0], sr); print("ok", len(w[0]) / sr)

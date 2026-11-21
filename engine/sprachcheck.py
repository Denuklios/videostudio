#!/usr/bin/env python3
"""Prüft gesprochene Zeilen mit Whisper (faster-whisper, lokal, kostenlos).
Aufruf: /root/stimme-venv/bin/python engine/sprachcheck.py <datei.wav|mp3> ["erwarteter Text"]
Gibt erkannten Text aus; mit erwartetem Text zusätzlich die Übereinstimmung in %."""
import sys, re, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.concatenate([np.zeros(9600, np.float32), np.frombuffer(raw, np.float32), np.zeros(9600, np.float32)])
segs, _ = m.transcribe(audio, language="de", beam_size=5)
txt = " ".join(s.text.strip() for s in segs)
print("Erkannt:", txt)
if len(sys.argv) > 2:
    norm = lambda s: re.sub(r"[^a-zäöüß0-9 ]", "", s.lower())
    r = difflib.SequenceMatcher(None, norm(sys.argv[2]), norm(txt)).ratio()
    print(f"Übereinstimmung: {r*100:.0f} %"); sys.exit(0 if r > .85 else 1)

#!/usr/bin/env python3
"""Wort-Zeitstempel mit Whisper (stimme-venv): python woerter.py <audio> <aus.json>"""
import json, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="de", word_timestamps=True, beam_size=5)
out = [{"wort": w.word.strip(), "start": round(w.start, 3), "ende": round(w.end, 3)} for s in segs for w in s.words]
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False); print(len(out), "Wörter")

#!/usr/bin/env python3
"""Stimme ×1,1 beschleunigen (mit 0,25 s Vorlauf) und aus den Whisper-Wortzeiten die Zeilen-Zeiten berechnen → timeline.json"""
import json, re, difflib, subprocess
from pathlib import Path

HIER = Path(__file__).resolve().parents[1]
TEMPO, VOR, NACH = 1.1, .25, 2.6
lines = json.loads((HIER / "lines.json").read_text())
ww = json.loads((HIER / "audio" / "woerter_raw.json").read_text())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(HIER / "audio" / "voice_raw.wav"),
                "-af", f"atempo={TEMPO},adelay={int(VOR*1000)}:all=1", "-ar", "48000", str(HIER / "audio" / "voice.wav")], check=True)
norm = lambda x: re.sub(r"[^a-zäöüß0-9]", "", x.lower())
tw, von = [], []
for i, l in enumerate(lines):
    for w in l["text"].split(): tw.append(norm(w)); von.append(i)
hw = [norm(w["wort"]) for w in ww]
zu = {}
for tag, a1, a2, b1, b2 in difflib.SequenceMatcher(None, tw, hw, autojunk=False).get_opcodes():
    for k in range(a2 - a1): zu[a1 + k] = min(b2 - 1, b1 + k) if b2 > b1 else max(0, b1 - 1)
vo = []
for i, l in enumerate(lines):
    idx = [k for k, s in enumerate(von) if s == i]
    t0 = ww[zu[idx[0]]]["start"] / TEMPO + VOR; t1 = ww[zu[idx[-1]]]["ende"] / TEMPO + VOR
    vo.append({"id": l["id"], "t0": round(t0, 3), "t1": round(t1, 3), "text": l["text"]})
dur = round(vo[-1]["t1"] + NACH, 2)
(HIER / "timeline.json").write_text(json.dumps({"dur": dur, "vo": vo}, ensure_ascii=False, indent=1))
print("Dauer", dur, [(v["id"], v["t0"], v["t1"]) for v in vo])

#!/usr/bin/env python3
"""Stimmen (edge-tts) + Lippen-Hüllkurven. Kalle = Killian (schnell, nervös), Rudi = Conrad (langsam, tief, trocken)."""
import asyncio, json, os, ssl, subprocess, wave, numpy as np
from pathlib import Path
import edge_tts, edge_tts.communicate as ec
HERE = Path(__file__).parent; OUT = HERE / "voices"; OUT.mkdir(exist_ok=True)
ca = "/root/.ccr/ca-bundle.crt"
if os.path.exists(ca): ec._SSL_CTX = ssl.create_default_context(cafile=ca)
CAST = {"KALLE": ("de-DE-KillianNeural", "+14%", "+6Hz"), "RUDI": ("de-DE-ConradNeural", "-14%", "-12Hz")}
async def tts(text, v, rate, pitch, mp3):
    await edge_tts.Communicate(text, v, rate=rate, pitch=pitch).save(str(mp3))
lines = json.loads((HERE / "lines.json").read_text()); dur, lips = {}, {}
for L in lines:
    v, rate, pitch = CAST[L["who"]]; mp3 = OUT / f"{L['id']}.mp3"; wav = OUT / f"{L['id']}.wav"
    asyncio.run(tts(L["text"], v, rate, pitch, mp3))
    # Stille vorn/hinten weg, Mono 48 kHz
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    "-ar", "48000", "-ac", "1", str(wav)], check=True)
    with wave.open(str(wav)) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    dur[L["id"]] = round(len(a) / sr, 3)
    hop = sr // 24; o, b = [], []
    for i in range(0, len(a), hop):
        f = a[i:i + hop]
        if len(f) < 32: break
        r = np.sqrt(np.mean(f ** 2)); o.append(r)
        sp = np.abs(np.fft.rfft(f * np.hanning(len(f)))); fr = np.fft.rfftfreq(len(f), 1 / sr)
        b.append(float((sp * fr).sum() / (sp.sum() + 1e-9)))
    o = np.array(o); o = np.clip(o / (np.percentile(o, 95) + 1e-9), 0, 1) ** .8
    b = np.clip((np.array(b) - 800) / 2200, 0, 1)
    lips[L["id"]] = {"o": [round(float(x), 3) for x in o], "b": [round(float(x), 3) for x in b]}
    print(L["id"], dur[L["id"]])
(OUT / "dur.json").write_text(json.dumps(dur, indent=1)); (OUT / "lips.json").write_text(json.dumps(lips))

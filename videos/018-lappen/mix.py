#!/usr/bin/env python3
"""Ton für „Durch die Lappen gehen“: Stimme (Ryan, ×1,1) + Wind, Messer im Holz, Lappen-Flattern, Hufe, Tam-Tam beim Sprung,
Papier beim Abzug, tiefer Streicher-Bordun. Alles synthetisch. Musik und Geräusche ducken unter der Stimme. → out/mix.wav"""
import json, subprocess, wave
from pathlib import Path
import numpy as np

HIER = Path(__file__).resolve().parent
SR = 48000
TL = json.loads((HIER / "timeline.json").read_text())
DUR = TL["dur"]; VO = {v["id"]: v for v in TL["vo"]}
N = int(DUR * SR)
rng = np.random.default_rng(7)

def lade(pfad):
    roh = subprocess.run(["ffmpeg", "-v", "error", "-i", str(pfad), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(roh, dtype=np.float32).copy()

def lp(x, fc):  # einfacher Tiefpass 1. Ordnung
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)

def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    n = min(len(sig), len(buf) - i); buf[i:i + n] += sig[:n] * g

def env(n, att=.002, dec=.1):
    t = np.arange(n) / SR; return np.minimum(1, t / att) * np.exp(-t / dec)

def knife():           # Messer ins Holz: Klick + reißende Fasern
    n = int(.09 * SR); x = rng.standard_normal(n) * env(n, .001, .03)
    return np.diff(np.concatenate([[0], x])) * .6 + np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * env(n, .0005, .008) * .3

def woodblock(f=820):
    n = int(.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * env(n, .001, .05)

def thump():
    n = int(.25 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (70 - 30 * t) * t) * env(n, .002, .06) + rng.standard_normal(n) * env(n, .001, .02) * .15

def tamtam():
    n = int(4 * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for f, a, d in [(97, 1, 2.6), (143, .7, 2.1), (211, .5, 1.6), (287, .35, 1.2), (413, .25, .9)]:
        out += a * np.sin(2 * np.pi * f * t * (1 + .002 * np.sin(t * 3))) * np.exp(-t / d)
    return out * np.minimum(1, t / .01) * .5

voice = lade(HIER / "audio" / "voice.wav")
musik = np.zeros(N); gerausch = np.zeros(N)

# Bordun: tiefe Streicher (Grundton A, Quinte), schwillt langsam
t = np.arange(N) / SR
bord = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(55, 1, 0), (82.4, .55, 1), (110, .3, 2), (164.8, .15, 3)])
bord *= (.55 + .45 * np.sin(2 * np.pi * t / 9) ** 2) * np.minimum(1, t / 2)
musik += bord * .05

# Wind (Szenen 2–6)
T = {k: VO[k]["t0"] - .15 for k in VO}
wind = lp(rng.standard_normal(N), 380) * (.6 + .4 * np.sin(2 * np.pi * t / 5.3) ** 2)
maske = ((t > T["l2"]) & (t < T["l7"])).astype(float)
gerausch += wind * maske * .5

# Schnitte = neue Abzüge → Holzblock
for k in ["l2", "l3", "l4", "l5", "l6", "l7"]: put(gerausch, woodblock(), T[k], .35)
# Lappen werden aufgehängt: Messer im Holz (jeder 2.)
for i in range(0, 34, 2): put(gerausch, knife(), T["l3"] + i * .07 / 1.35, .35)
# Lappen flattern (Szenen 3–5)
fl = lp(rng.standard_normal(N), 1800) * (np.abs(np.sin(2 * np.pi * t * 3.5)) ** 3)
gerausch += fl * ((t > T["l3"]) & (t < T["l6"])) * .12
# Hufe im Anlauf, dann Sprung
LEAP0 = VO["l5"]["t0"] + .9
x = T["l5"]
while x < LEAP0: put(gerausch, thump(), x, .5); x += .19
put(gerausch, thump(), LEAP0, .8); put(musik, tamtam(), LEAP0 + .05, .9)
for k in range(4): put(gerausch, thump(), LEAP0 + .9 + k * .17, .4 * (1 - k * .2))
# Stille vor dem Abzug, dann Papier
PEEL0 = VO["l6"]["t0"] + 1.9
n = int(1.3 * SR); pap = lp(rng.standard_normal(n), 2500) * np.sin(np.pi * np.arange(n) / n) ** .5
put(gerausch, pap, PEEL0, .35)
# Schluss-Akkord
n = int(3 * SR); tt = np.arange(n) / SR
put(musik, sum(np.sin(2 * np.pi * f * tt) for f in (110, 138.6, 164.8, 220)) * np.exp(-tt / 1.6) * np.minimum(1, tt / .02) * .12, T["l7"])

# Ducking unter der Stimme
v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
huelle = lp(np.abs(v), 6) * 8; duck = 1 - np.clip(huelle, 0, 1) * .6
mix = v * 1.0 + musik * duck + gerausch * (1 - np.clip(huelle, 0, 1) * .45)
stille = (t > PEEL0 - .45) & (t < PEEL0); mix[stille] *= .15
mix /= max(1e-6, np.abs(mix).max() / .9)
(HIER / "out").mkdir(exist_ok=True)
with wave.open(str(HIER / "out" / "mix.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("mix ok", round(DUR, 2), "s")

#!/usr/bin/env python3
"""Ton für den Pop-up-Film: Stimme (Ryan) klar vorn; leise Spieluhr-Musik, Papier-Geräusche (Pop, Knarren, Sprung).
Musik und Geräusche liegen deutlich unter der Stimme (Wunsch des Nutzers: Geräusche waren zu laut). → out/mix.wav"""
import json, subprocess, wave
from pathlib import Path
import numpy as np
from scipy.signal import lfilter

HIER = Path(__file__).resolve().parent
SR = 48000
TL = json.loads((HIER / "timeline.json").read_text())
EV = json.loads((HIER / "events.json").read_text())
EV = EV.get("ev", EV) if isinstance(EV, dict) else EV
DUR = TL["dur"]; N = int(DUR * SR); t = np.arange(N) / SR
rng = np.random.default_rng(3)

def lade(p):
    roh = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(roh, dtype=np.float32).copy()
def lp(x, fc): a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)
def put(b, s, at, g=1.):
    i = int(at * SR)
    if 0 <= i < len(b): n = min(len(s), len(b) - i); b[i:i + n] += s[:n] * g
def env(n, a=.002, d=.1): tt = np.arange(n) / SR; return np.minimum(1, tt / a) * np.exp(-tt / d)

def pop():      # Pop-up: kurzer Sinus-Sweep + Papierknistern
    n = int(.18 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (900 - 2600 * tt) * tt) * env(n, .001, .03) * .6 + lp(rng.standard_normal(n), 3000) * env(n, .001, .04) * .5
def creak():    # Buchrücken knarrt, Deckel klappt
    n = int(1.4 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (180 + 40 * np.sin(tt * 9)) * tt) * (np.abs(np.sin(tt * 37)) ** 4) * env(n, .05, .6) * .3
    return s + lp(rng.standard_normal(n), 900) * env(n, .01, .5) * .3
def thump():
    n = int(.25 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * (90 - 40 * tt) * tt) * env(n, .002, .07)

voice = lade(HIER / "audio" / "voice.wav"); v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
musik = np.zeros(N); fx = np.zeros(N)

# Spieluhr: einfache Melodie (Glockenklänge) in C-Dur, 96 BPM
mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74]
beat = 60 / 96
for k in range(int(DUR / beat)):
    f = 440 * 2 ** ((mel[k % len(mel)] - 69) / 12); n = int(1.2 * SR); tt = np.arange(n) / SR
    note = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / .15)) * np.exp(-tt / .5) * np.minimum(1, tt / .003)
    put(musik, note, k * beat, .5)
musik += np.sin(2 * np.pi * 130.8 * t) * .05 * np.minimum(1, t / 2)        # weicher Bordun

for e in EV:
    ty, at = e.get("type"), e.get("t", 0)
    if ty == "pop": put(fx, pop(), at, .35)
    elif ty == "creak": put(fx, creak(), at, .5)
    elif ty == "leap": put(fx, thump(), at, .5); put(fx, thump(), at + 1.0, .4)
    elif ty in ("knife", "crack", "splat"): put(fx, thump(), at, .35); put(fx, pop(), at, .25)
    elif ty == "pling": n = int(.8 * SR); tt = np.arange(n) / SR; put(fx, np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt / .25), at, .3)

# Mischung: Stimme vorn, Musik und Geräusche weit darunter und unter der Stimme zusätzlich geduckt
h = np.clip(lp(np.abs(v), 5) * 10, 0, 1)
mix = v * 1.0 + musik * .09 * (1 - .7 * h) + fx * .12 * (1 - .6 * h)
mix /= max(1e-6, np.abs(mix).max() / .9)
(HIER / "out").mkdir(exist_ok=True)
with wave.open(str(HIER / "out" / "mix.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("mix ok", DUR)

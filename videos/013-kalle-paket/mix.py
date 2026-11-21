#!/usr/bin/env python3
"""Musik (synthetisiert), Geräusche, Stimmen → out/mix.wav (48 kHz Stereo)."""
import json, os, sys, wave
from pathlib import Path
import numpy as np
LIB = os.environ.get("LIB", "/root/lemo-opuscar"); sys.path.insert(0, f"{LIB}/core/audio")
import sfx
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, add, compress, limit

HERE = Path(__file__).parent; OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
DUR = 38.6; N = int(DUR * SR)
EV = json.loads((HERE / "events.json").read_text())["ev"]
VO = {"k1": 1.55, "k2": 4.95, "r1": 8.05, "k3": 10.6, "r2": 15.25, "k4": 17.0, "k5": 23.55, "r3": 30.95, "cta": 34.45}
BPM = 112; B = 60 / BPM
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

def stereo(): return np.zeros((N, 2))
music, fx, amb, voice = stereo(), stereo(), stereo(), stereo()

# —— Instrumente ——
def theremin(notes, gain=.22):
    """notes: (start, dur, midi). Portamento ~70 ms, Vibrato nach 150 ms, Federhall."""
    if not notes: return np.zeros(0)
    t0 = notes[0][0]; t1 = max(s + d for s, d, _ in notes) + .5; tt = np.arange(int((t1 - t0) * SR)) / SR
    f = np.zeros_like(tt); amp = np.zeros_like(tt); prev = None
    for s, d, m in notes:
        a, b = int((s - t0) * SR), int((s - t0 + d) * SR)
        tgt = mf(m); seg = np.arange(b - a) / SR
        start = prev if prev else tgt
        f[a:b] = tgt + (start - tgt) * np.exp(-seg / .025)
        vib = 1 + .012 * np.sin(2 * np.pi * 5.5 * seg) * np.clip((seg - .15) / .2, 0, 1)
        f[a:b] *= vib
        amp[a:b] = np.minimum(1, seg / .04) * np.minimum(1, (d - seg) / .08 + .0)
        prev = tgt
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + .25 * np.sin(2 * ph) + .1 * np.sin(3 * ph)) * np.clip(amp, 0, 1)
    rev = np.zeros_like(x)
    for dl, g in [(.031, .35), (.047, .28), (.073, .2), (.11, .14)]:
        k = int(dl * SR); rev[k:] += x[:-k] * g
    return (x + rev) * gain, t0
def bass(m, d, g=.35):
    tt = t_(d); f = mf(m); x = np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)
    return x * np.minimum(1, tt / .01) * np.exp(-tt / (d * .9)) * g
def sq(m, d, g=.06):
    tt = t_(d); x = np.sign(np.sin(2 * np.pi * mf(m) * tt)); return lp(x, 2600) * np.exp(-tt / .08) * g
def kick(g=.6):
    tt = t_(.25); f = 110 * np.exp(-tt * 28) + 45; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14) * g
def snare(g=.25): d = .18; return (bp(noise(d), 1500, 6000) * env_exp(d, .045) + np.sin(2 * np.pi * 190 * t_(d)) * env_exp(d, .03) * .5) * g
def hat(g=.08): d = .05; return hp(noise(d), 7000) * env_exp(d, .012) * g
def pluck(m, d, g=.25):
    n = int(SR / mf(m)); buf = np.random.default_rng(m).uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = .5 * (buf[i % n] + buf[(i + 1) % n]) * .996
    return out * g
def put(buf, x, at, g=1., pan=0.): add(buf, x * g, at, 1.0, pan)

# —— Score ——
CH = [(50, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72]), (45, [61, 64, 69])]   # Dm Bb C A
MEL = [74, 69, 70, 69, 64, 65, 64, 63, 62]
def groove(t0, t1, lead=True, up=0):
    bars = int((t1 - t0) / (4 * B)) + 1; notes = []
    for bi in range(bars):
        tb = t0 + bi * 4 * B; root, ch = CH[bi % 4]
        for k in range(4):
            tt = tb + k * B
            if tt >= t1: break
            put(music, kick(), tt, .9 if k % 2 == 0 else 0); put(music, snare(), tt, 1 if k % 2 else 0)
            put(music, bass(root + up - 12 + (7 if k == 2 else 0), B * .9), tt)
            for h in range(2): put(music, hat(), tt + h * B / 2, 1, .3)
            for s16 in range(4):
                ts = tt + s16 * B / 4
                if ts < t1: put(music, sq(ch[(k * 4 + s16) % 3] + up + 12, B / 4), ts, 1, -.3)
        if lead and bi % 2 == 0:
            for j, m in enumerate(MEL[:5] if bi % 4 == 0 else MEL[4:]):
                st = tb + j * B * .75
                if st < t1 - .2: notes.append((st, B * .7, m + up))
    if notes:
        x, s = theremin(notes); put(music, x, s, 1, .1)
def world(t0, t1):   # Paketwagen-Welt: schnelles Zupf-Riff, Four-on-the-floor
    riff = [62, 65, 67, 69, 72, 69, 67, 65]; i = 0; tt = t0
    while tt < t1:
        put(music, pluck(riff[i % 8] + 12, .25), tt, 1, -.2);
        if i % 2 == 0: put(music, kick(.7), tt)
        if i % 4 == 2: put(music, snare(.22), tt)
        put(music, bass(riff[i % 8] - 12, B / 2 * .9, .3), tt)
        i += 1; tt += B / 2
groove(4.65, 19.4); world(19.4, 23.0); groove(23.0, 26.45, up=2)
# Schluss-Phrase auf der Endkarte
x, s = theremin([(34.1, .5, 69), (34.6, .5, 70), (35.1, .5, 69), (35.6, 1.6, 62)], .2); put(music, x, s)
put(music, bass(50 - 12, 2.5, .3), 35.6)
# Stabs am Anfang
for st in (0.0, 2.05):
    tt = t_(.9); chord = sum(np.sign(np.sin(2 * np.pi * mf(m) * tt)) for m in (50, 57, 62, 65))
    put(music, lp(chord, 1800) * np.exp(-tt / .25) * .12, st)
    put(music, kick(.9), st)

# —— Geräusche ——
def paper(): d = .35; return bp(noise(d), 1500, 7000) * (np.abs(np.sin(t_(d) * 60)) ** 3) * env_exp(d, .15) * .5
def blip(f=1300): d = .09; return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, .03) * .25
def portal_open():
    d = 1.6; tt = t_(d)
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 3) + 35) / SR) * env_exp(d, .5)
    sweep = bp(noise(d), 300, 4000) * env_exp(d, .4) * .5
    rise = np.sin(2 * np.pi * np.cumsum(200 + 900 * tt / d) / SR) * .15 * np.minimum(1, tt / .5) * env_exp(d, 1.0)
    return norm(sub + sweep + rise) * .8
def boing(): d = .45; tt = t_(d); f = 220 + 160 * np.sin(tt * 30) * np.exp(-tt * 6); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .18) * .45
def suck(): d = .5; tt = t_(d); return bp(noise(d), 400, 5000) * (tt / d) ** 2 * .6 + np.sin(2 * np.pi * np.cumsum(300 + 1500 * tt) / SR) * (tt / d) * .15
def kazoo():
    d = 1.0; tt = t_(d); f = 330 * (1 - .25 * tt / d) * (1 + .03 * np.sin(2 * np.pi * 6 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = sum(np.sin(k * ph) / k for k in range(1, 12))
    return bp(x, 300, 3500) * np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .1) * .25
MAP = {"paper": paper, "blip": blip, "click": lambda: sfx.click(1.0, .5), "portal": portal_open, "boing": boing, "suck": suck,
       "swirl": lambda: sfx.whoosh(.6, .7), "thump": lambda: sfx.thump(.7), "grab": lambda: sfx.clack(.8, .6),
       "ding": lambda: sfx.ding(.5), "kazoo": kazoo, "stab": lambda: np.zeros(10)}
for e in EV:
    fn = MAP.get(e["type"])
    if fn: put(fx, fn(), e["t"], .9)

# —— Atmo ——
def bed(t0, t1, kind):
    d = t1 - t0; tt = t_(d)
    if kind == "hall": x = lp(brown(d), 500) * .04
    elif kind == "fridge": x = lp(brown(d), 300) * .03 + (np.sin(2 * np.pi * 60 * tt) * .5 + np.sin(2 * np.pi * 120 * tt) * .3) * .012
    else: x = lp(brown(d), 200) * .07 + np.sin(2 * np.pi * 48 * tt) * .015
    fade = np.minimum(1, np.minimum(tt / .05, (d - tt) / .05)); put(amb, x * fade, t0)
bed(0, 4.65, "hall"); bed(4.65, 19.4, "fridge"); bed(19.4, 23.0, "van"); bed(23.0, 34.0, "fridge")

# —— Stimmen ——
lines = {l["id"]: l for l in json.loads((HERE / "lines.json").read_text())}
vmask = np.zeros(N)
for vid, st in VO.items():
    with wave.open(str(HERE / "voices" / f"{vid}.wav")) as w: a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    if lines[vid]["who"] == "RUDI": a = a + lp(a, 200) * .6           # tiefer, trockener
    else: a = a + hp(a, 2500) * .3                                    # Präsenz
    a = compress(norm(a, .9), .3, 3.5)
    put(voice, a, st, .9, -.05 if lines[vid]["who"] == "KALLE" else .08)
    i0 = int(st * SR); vmask[i0:i0 + len(a)] = 1
# Ducking: Musik −7 dB unter Stimme
k = int(.15 * SR); sm = np.convolve(vmask, np.ones(k) / k, mode="same")
music *= (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
# Stille-Pointe: ab 26.45 bis 34.0 keine Musik (inkl. Hall)
music[int(26.45 * SR):int(34.0 * SR)] = 0

mix = music * .8 + fx * .9 + amb + voice * 1.1
mix = mix / max(1e-9, np.abs(mix).max()) * .9
mix = np.stack([limit(mix[:, 0]), limit(mix[:, 1])], axis=1)
with wave.open(str(OUT / "mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix ok", DUR)

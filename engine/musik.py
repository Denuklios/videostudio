#!/usr/bin/env python3
"""Erzeugt lizenzfreie Hintergrundmusik (selbst synthetisiert) nach engine/musik/<stil>.mp3.
Aufruf: python3 musik.py   → spannend.mp3, ruhig.mp3, episch.mp3 (je ca. 64 s, nahtlos loopbar)"""
import numpy as np, subprocess, wave
from pathlib import Path

SR = 44100
ZIEL = Path(__file__).parent / "musik"


def note(m):  # MIDI → Hz
    return 440 * 2 ** ((m - 69) / 12)


def pad(freqs, dauer, weich=0.6):
    t = np.arange(int(SR * dauer)) / SR
    s = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.3 * t) * 0.6) +
            0.5 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs) / len(freqs)
    hull = np.minimum(1, np.minimum(t / weich, (dauer - t) / weich))
    return s * hull


def kick(laenge=0.35):
    t = np.arange(int(SR * laenge)) / SR
    f = 120 * np.exp(-t * 25) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat(laenge=0.06, seed=0):
    r = np.random.default_rng(seed)
    t = np.arange(int(SR * laenge)) / SR
    n = r.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # Hochpass
    return n * np.exp(-t * 60) * 0.25


def bass(f, laenge):
    t = np.arange(int(SR * laenge)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3)


def mische(spur, klang, pos):
    i = int(pos * SR)
    e = min(len(spur), i + len(klang))
    spur[i:e] += klang[: e - i]


def stueck(stil):
    bpm = {"spannend": 104, "ruhig": 80, "episch": 90}[stil]
    takt = 4 * 60 / bpm
    if stil == "ruhig":
        akkorde = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 66]]  # Am7 Fmaj7 Cmaj7 G
    elif stil == "episch":
        akkorde = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]  # Dm Bb C A
    else:
        akkorde = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]]  # Am F G E
    takte = int(np.ceil(64 / takt / 4) * 4)
    L = int(SR * takt * takte) + SR
    spur = np.zeros(L)
    for k in range(takte):
        ak = akkorde[k % 4]
        t0 = k * takt
        mische(spur, pad([note(m) for m in ak], takt + 0.4) * 0.22, t0)
        schlag = takt / 4
        for b in range(4):
            if stil != "ruhig":
                mische(spur, kick() * (0.8 if stil == "spannend" else 1.0), t0 + b * schlag)
            if stil == "spannend":
                mische(spur, bass(note(ak[0] - 12), schlag / 2) * 0.35, t0 + b * schlag + schlag / 2)
                for h in range(2):
                    mische(spur, hat(seed=k * 8 + b * 2 + h), t0 + b * schlag + h * schlag / 2 + schlag / 4)
            if stil == "episch" and b in (1, 3):
                mische(spur, kick(0.6) * 0.6, t0 + b * schlag + schlag / 2)
        if stil == "ruhig":  # sanfte Arpeggio-Töne
            for j, m in enumerate(ak):
                mische(spur, bass(note(m + 12), 0.8) * 0.12, t0 + j * takt / 4)
    spur = spur[: int(SR * takt * takte)]
    spur /= np.max(np.abs(spur)) * 1.1
    return spur


def main():
    ZIEL.mkdir(exist_ok=True)
    for stil in ["spannend", "ruhig", "episch"]:
        s = stueck(stil)
        st = np.stack([s, np.roll(s, 300)], axis=1)
        wav = ZIEL / f"{stil}.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((st * 32767).astype(np.int16).tobytes())
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav), "-b:a", "128k", str(ZIEL / f"{stil}.mp3")], check=True)
        wav.unlink()
        print(stil, "ok")


if __name__ == "__main__":
    main()

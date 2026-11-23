#!/usr/bin/env python3
"""Vertont jede Szene eines Video-Projekts und speichert Wort-Zeitstempel.

Aufruf:  python3 stimme.py <projektordner>

Liest <projektordner>/projekt.json und schreibt:
  audio/szene_NN.wav       Ton je Szene (auf Szenenlänge aufgefüllt)
  audio/gesamt.wav         alle Szenen hintereinander
  timing.json              Szenenlängen und Wörter mit Start/Ende (Sekunden)

Stimme: ElevenLabs, wenn ELEVENLABS_API_KEY gesetzt ist (oder "anbieter": "elevenlabs"
im Projekt), sonst die kostenlose Microsoft-Edge-Stimme.
"""
import asyncio, base64, json, os, subprocess, sys, urllib.request
from pathlib import Path

PAUSE_NACH_SZENE = 0.30  # Sekunden Luft zwischen den Szenen
SR = 44100


def ffprobe_dauer(datei):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(datei)])
    return float(out.strip())


async def edge_vertonen(text, stimme, tempo, ziel_mp3):
    import edge_tts, ssl
    import edge_tts.communicate as ec
    ca = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
    if ca:  # hinter einem Proxy mit eigenem Zertifikat
        ec._SSL_CTX = ssl.create_default_context(cafile=ca)
    com = edge_tts.Communicate(text, stimme, rate=tempo, boundary="WordBoundary")
    woerter = []
    with open(ziel_mp3, "wb") as f:
        async for teil in com.stream():
            if teil["type"] == "audio":
                f.write(teil["data"])
            elif teil["type"] == "WordBoundary":
                s = teil["offset"] / 1e7
                woerter.append({"wort": teil["text"], "start": s,
                                "ende": s + teil["duration"] / 1e7})
    return woerter


def elevenlabs_vertonen(text, stimme_id, ziel_mp3):
    key = os.environ.get("ELEVENLABS_API_KEY", "x")  # der Proxy ersetzt ggf. den Schlüssel
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{stimme_id}/with-timestamps"
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8,
                                          "style": 0.35}}).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "xi-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        daten = json.load(r)
    Path(ziel_mp3).write_bytes(base64.b64decode(daten["audio_base64"]))
    al = daten["alignment"]
    zeichen, starts, enden = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    woerter, akt, s0 = [], "", None
    for z, s, e in zip(zeichen, starts, enden):
        if z.isspace():
            if akt:
                woerter.append({"wort": akt, "start": s0, "ende": letzte})
            akt, s0 = "", None
            continue
        if s0 is None:
            s0 = s
        akt += z
        letzte = e
    if akt:
        woerter.append({"wort": akt, "start": s0, "ende": letzte})
    return woerter


QWEN_PY, WHISPER_PY = "/root/qwen-venv/bin/python", "/root/stimme-venv/bin/python"
QWEN_STIMME = "Ryan"   # Wunsch des Nutzers 22.11.: NUR noch Ryan, alle anderen Stimmen raus


def qwen_stimme_fuer(ordner, projekt):
    return QWEN_STIMME


def _lade_mono(wav, sr=24000):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def _leiseste_stelle(sig, a, b, sr=24000):
    """Schnittpunkt zwischen zwei Wörtern: die leiseste Stelle in der Pause (nicht blind die Mitte),
    damit kein Wortanfang/-ende abgeschnitten wird. Whisper-Zeiten sind ungenau, daher etwas Spielraum."""
    import numpy as np
    rand = .06 if b - a > .15 else .2
    lo, hi = max(0, int((min(a, b) - rand) * sr)), min(len(sig), int((max(a, b) + rand) * sr))
    if hi - lo < int(.03 * sr):
        return round((a + b) / 2, 3)
    fen, schritt = int(.03 * sr), int(.005 * sr)
    best, best_e = lo, 1e9
    for x in range(lo, hi - fen, schritt):
        e = float(np.sqrt(np.mean(sig[x:x + fen] ** 2)))
        if e < best_e: best, best_e = x, e
    return round((best + fen / 2) / sr, 3)


def _schneiden(sig, t0, t1, ziel, sr=24000):
    """Stück aus der Gesamtaufnahme schneiden (Original-Zeit), 8 ms weich ein-/ausblenden, dann Tempo ×1,1 als WAV."""
    import numpy as np, wave
    teil = sig[int(t0 * sr):int(t1 * sr)].copy()
    f = min(int(.008 * sr), len(teil) // 2)
    if f > 0:
        teil[:f] *= np.linspace(0, 1, f); teil[-f:] *= np.linspace(1, 0, f)
    roh = Path(str(ziel) + ".roh.wav")
    with wave.open(str(roh), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(teil, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(roh), "-af", "atempo=1.1", str(ziel)], check=True)
    roh.unlink()


def qwen_vorbereiten(projekt, audio, ordner):
    """Ganzer Text in einem Durchgang (gleiche Stimme), dann mit Whisper-Wortzeiten in Szenen schneiden."""
    import difflib, re
    st = qwen_stimme_fuer(ordner, projekt)
    texte = [sz["text"].strip() for sz in projekt["szenen"]]
    # Aussprache: {"GTA": "G T A", "6": "sechs"} – nur für die Stimme; Untertitel zeigen den Originaltext
    aus = projekt.get("aussprache", {})
    def sprich(w):
        kern = re.sub(r"^[^\wÄÖÜäöü]+|[^\wÄÖÜäöü]+$", "", w)
        return w.replace(kern, aus[kern]) if kern and kern in aus else w
    gesprochen = [" ".join(sprich(w) for w in tx.split()) for tx in texte]
    gesamt_wav, wjson = audio / "qwen_gesamt.wav", audio / "qwen_woerter.json"
    ein = json.dumps({"text": " ".join(gesprochen), "stimme": st}, ensure_ascii=False)
    alt = (audio / "qwen_in.json").read_text() if (audio / "qwen_in.json").exists() else ""
    if alt != ein or not gesamt_wav.exists() or not wjson.exists():   # gleicher Text + Stimme → Aufnahme wiederverwenden
        (audio / "qwen_in.json").write_text(ein)
        subprocess.run([QWEN_PY, str(Path(__file__).with_name("qwen_stimme.py")), str(audio / "qwen_in.json"), str(gesamt_wav)], check=True)
        subprocess.run([WHISPER_PY, str(Path(__file__).with_name("woerter.py")), str(gesamt_wav), str(wjson)], check=True)
    ww = json.loads(wjson.read_text())
    norm = lambda x: re.sub(r"[^a-zäöüß0-9]", "", x.lower())
    tw, szene_von, textwoerter, sp_von = [], [], [], []   # sp_von: gesprochenes Wort → Textwort-Index
    for i, tx in enumerate(texte):
        for w in tx.split():
            k = len(textwoerter); textwoerter.append(w); szene_von.append(i)
            for s_ in sprich(w).split(): tw.append(norm(s_)); sp_von.append(k)
    hw = [norm(w["wort"]) for w in ww]
    zu_sp = {}   # gesprochener Index → Whisper-Index
    for tag, a1, a2, b1, b2 in difflib.SequenceMatcher(None, tw, hw, autojunk=False).get_opcodes():
        for k in range(a2 - a1): zu_sp[a1 + k] = min(b2 - 1, b1 + k) if b2 > b1 else max(0, b1 - 1)
    zu, zu_ende = {}, {}   # Textwort → erstes / letztes Whisper-Wort
    for j, k in enumerate(sp_von):
        if j in zu_sp:
            zu.setdefault(k, zu_sp[j]); zu_ende[k] = zu_sp[j]
    # Schnittpunkte zwischen den Szenen
    sig = _lade_mono(gesamt_wav)
    grenzen = [0.0]
    for i in range(len(texte) - 1):
        last = max(j for j, s_ in enumerate(szene_von) if s_ == i); nxt = last + 1
        a, b = ww[zu_ende[last]]["ende"], ww[zu[nxt]]["start"]
        grenzen.append(_leiseste_stelle(sig, a, b))
    grenzen.append(len(sig) / 24000)
    for k in range(1, len(grenzen)):   # Schutz: jede Szene mindestens 0,3 s (sehr kurze Szenen wie „Karma.“)
        if grenzen[k] < grenzen[k - 1] + .3: grenzen[k] = grenzen[k - 1] + .3
    grenzen[-1] = max(grenzen[-1], len(sig) / 24000)
    teile = []
    for i in range(len(texte)):
        t0, t1 = grenzen[i], grenzen[i + 1]; mp3 = audio / f"qwen_{i:02d}.wav"
        _schneiden(sig, t0, t1, mp3)   # Schnitt in der ORIGINAL-Zeit, erst danach Tempo ×1,1 (vorher verrutschten die Schnitte)
        # Wörter aus dem SKRIPT (damit Effekte per Wort auslösen), Zeiten von Whisper
        ws = []
        for k, (txw, s_) in enumerate(zip(textwoerter, szene_von)):
            if s_ != i or k not in zu: continue
            w, we = ww[zu[k]], ww[zu_ende[k]]
            ws.append({"wort": txw, "start": max(0, (w["start"] - t0) / 1.1), "ende": max(0, (we["ende"] - t0) / 1.1)})
        teile.append((mp3, ws))
    print("Qwen3-Stimme:", st)
    return teile


def vertonen(projekt, audio, anbieter, stimme, tempo, qwen=None):
    szenen_info, alle_woerter, wavs, t = [], [], [], 0.0
    for i, sz in enumerate(projekt["szenen"]):
        mp3 = audio / f"szene_{i:02d}.mp3"
        wav = audio / f"szene_{i:02d}.wav"
        if anbieter == "qwen":
            src, woerter = qwen[i]; mp3 = src
        elif anbieter == "elevenlabs":
            woerter = elevenlabs_vertonen(sz["text"], projekt.get("elevenlabs_stimme", "JBFqnCBsd6RMkjVDRZzb"), mp3)
        else:
            woerter = asyncio.run(edge_vertonen(sz["text"], stimme, tempo, mp3))
        dauer_ton = ffprobe_dauer(mp3)
        pause = 0.12 if anbieter == "qwen" else PAUSE_NACH_SZENE   # Qwen hat schon natürliche Pausen
        dauer = round(max(dauer_ton + pause, sz.get("min_dauer", 0)), 3)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af",
                        f"apad=whole_dur={dauer}", "-ar", str(SR), "-ac", "2", str(wav)], check=True)
        for w in woerter:
            alle_woerter.append({"wort": w["wort"], "start": round(t + w["start"], 3),
                                 "ende": round(t + w["ende"], 3), "szene": i})
        szenen_info.append({"start": round(t, 3), "dauer": dauer})
        wavs.append(wav)
        t += dauer
        print(f"Szene {i+1}: {dauer:.2f}s, {len(woerter)} Wörter ({anbieter})")
    return szenen_info, alle_woerter, wavs, t


def main():
    ordner = Path(sys.argv[1]).resolve()
    projekt = json.loads((ordner / "projekt.json").read_text())
    audio = ordner / "audio"
    audio.mkdir(exist_ok=True)

    # "auto" (Standard): ElevenLabs, solange Guthaben da ist, sonst die kostenlose Edge-Stimme
    wunsch = projekt.get("anbieter", "qwen")  # Standard ab 21.11.: Qwen3 im Wechsel Design/Ryan/Aiden, Ausweich: Killian
    reihenfolge = {"auto": ["elevenlabs", "edge"], "elevenlabs": ["elevenlabs", "edge"], "qwen": ["qwen"]}.get(wunsch, ["qwen"])  # nur Ryan, kein Ausweichen
    stimme = projekt.get("stimme", "de-DE-KillianNeural")
    tempo = projekt.get("tempo", "+8%")

    for anbieter in reihenfolge:
        try:
            qw = qwen_vorbereiten(projekt, audio, ordner) if anbieter == "qwen" else None
            szenen_info, alle_woerter, wavs, t = vertonen(projekt, audio, anbieter, stimme, tempo, qw)
            break
        except Exception as e:  # z. B. Guthaben leer, Schlüssel fehlt
            grund = getattr(e, "read", lambda: b"")().decode(errors="ignore")[:200] or str(e)
            print(f"{anbieter} nicht verfügbar: {grund}")
    else:
        sys.exit("Keine Stimme verfügbar")

    liste = audio / "liste.txt"
    liste.write_text("".join(f"file '{w.name}'\n" for w in wavs))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(liste),
                    "-c", "copy", str(audio / "gesamt.wav")], check=True)
    (ordner / "timing.json").write_text(json.dumps(
        {"gesamt": round(t, 3), "szenen": szenen_info, "woerter": alle_woerter,
         "anbieter": anbieter}, ensure_ascii=False, indent=1))
    print(f"Gesamt: {t:.2f}s ({anbieter})")


if __name__ == "__main__":
    main()

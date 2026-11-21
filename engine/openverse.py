#!/usr/bin/env python3
"""Freie Bilder/Klänge von Openverse (api.openverse.org) suchen und laden – nur Lizenzen ohne Einschränkung.

Suchen:  python3 openverse.py suche "miami night skyline" [--audio] [--hoch] [--n 12]
         → Liste mit Nummer, Titel, Größe, Lizenz, Quelle; Vorschau-Raster unter ./ov_vorschau.jpg
Laden:   python3 openverse.py lade <id> <ziel.png|ziel.mp3> [--projekt videos/NNN]
         → speichert Datei (Bilder auf 1080×1920 zugeschnitten) und trägt Urheber/Lizenz in <projekt>/quellen.txt ein.
Lizenzen: cc0, pdm (gemeinfrei), by (Namensnennung → steht in quellen.txt und kommt in post.txt).
"""
import json, sys, urllib.parse, urllib.request, io
from pathlib import Path

API = "https://api.openverse.org/v1"
LIZENZ = "cc0,pdm,by"


def hole(url, roh=False):
    req = urllib.request.Request(url, headers={"User-Agent": "videostudio/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read() if roh else json.load(r)


def suche(q, audio=False, hoch=False, n=12):
    art = "audio" if audio else "images"
    p = {"q": q, "license": LIZENZ, "page_size": n, "mature": "false"}
    if not audio:
        p["size"] = "large"
        if hoch:
            p["aspect_ratio"] = "tall"
    d = hole(f"{API}/{art}/?" + urllib.parse.urlencode(p))
    erg = d.get("results", [])
    for i, r in enumerate(erg):
        gr = f'{r.get("width")}x{r.get("height")}' if not audio else f'{(r.get("duration") or 0)/1000:.0f}s'
        print(f'{i:2d} {r["id"]} | {(r.get("title") or "")[:45]:45} | {gr:10} | {r["license"]} | {r["source"]}')
    if not audio and erg:
        from PIL import Image
        kacheln = []
        for r in erg:
            try:
                kacheln.append(Image.open(io.BytesIO(hole(r["thumbnail"], True))).convert("RGB"))
            except Exception:
                kacheln.append(Image.new("RGB", (200, 200), "gray"))
        w = 4; h = (len(kacheln) + w - 1) // w
        g = Image.new("RGB", (w * 240, h * 240), "black")
        from PIL import ImageDraw
        for i, k in enumerate(kacheln):
            k.thumbnail((236, 220)); g.paste(k, ((i % w) * 240 + 2, (i // w) * 240 + 2))
            ImageDraw.Draw(g).text(((i % w) * 240 + 6, (i // w) * 240 + 222), str(i), fill="yellow")
        g.save("ov_vorschau.jpg"); print("Vorschau: ov_vorschau.jpg")


def lade(id_, ziel, projekt=None, audio=None):
    ziel = Path(ziel)
    audio = ziel.suffix.lower() in (".mp3", ".wav", ".ogg") if audio is None else audio
    r = hole(f"{API}/{'audio' if audio else 'images'}/{id_}/")
    daten = hole(r["url"], True)
    if audio:
        ziel.write_bytes(daten)
    else:
        from PIL import Image
        im = Image.open(io.BytesIO(daten)).convert("RGB")
        s = max(1080 / im.width, 1920 / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        l, o = (im.width - 1080) // 2, (im.height - 1920) // 2
        im.crop((l, o, l + 1080, o + 1920)).save(ziel)
    zeile = f'{ziel.name}: „{r.get("title") or "ohne Titel"}“ von {r.get("creator") or "unbekannt"}, {r["license"].upper()} {r.get("license_version") or ""} – {r.get("foreign_landing_url")}\n'
    if projekt:
        with open(Path(projekt) / "quellen.txt", "a") as f:
            f.write(zeile)
    print("gespeichert:", ziel, "|", zeile.strip())


if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "suche":
        n = int(a[a.index("--n") + 1]) if "--n" in a else 12
        suche(a[1], "--audio" in a, "--hoch" in a, n)
    elif a and a[0] == "lade":
        lade(a[1], a[2], a[a.index("--projekt") + 1] if "--projekt" in a else None)
    else:
        print(__doc__)

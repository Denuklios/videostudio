#!/usr/bin/env python3
"""Wusstest du's? – GTA 5: fast 235 Millionen verkauft – Platz 3 aller Zeiten."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
B = HIER / "bilder"
M = lambda n: str(B / f"maske_{n}.png")
hat = lambda n: (B / f"maske_{n}.png").exists()

szenen = [
    {"kopf": "<b>235 Mio.</b> verkauft",
     "text": "GTA 5 hat sich fast 235 Millionen Mal verkauft."},
    {"kopf": "Platz <b>1, 2 oder 3?</b>",
     "text": "Was glaubst du: Platz eins, zwei oder drei der meistverkauften Spiele aller Zeiten? Schreib's in die Kommentare, bevor ich's auflöse!"},
    {"kopf": "Seit <b>2013</b>", "label": "FAKT 1/2",
     "text": "Dabei ist GTA 5 schon 2013 erschienen. Vor über 13 Jahren."},
    {"kopf": "Immer noch <b>gekauft</b>", "label": "FAKT 2/2",
     "text": "Und es verkauft sich weiter, sogar in der Woche, in der GTA 6 rauskam."},
    {"kopf": "Die Antwort: <b>Platz 3</b>",
     "text": "Die Antwort: Platz drei. Nur Minecraft und Tetris wurden öfter verkauft."},
    {"kopf": "<b>235 Mio.</b> Mal",
     "text": "Fast 235 Millionen Mal. Kein anderes Rockstar-Spiel kommt da ran."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["laden", "podest", "stadt", "laden", "podest", "stadt"]
OBJ = {"laden": ("laden", 540, 1000), "podest": ("podest", 540, 1100), "stadt": ("stadt", 540, 900)}
UEBER = [
    (hervorheben(*OBJ["laden"][1:], maske=M("laden"), art="puls", glanz=MAG, wort="verkauft") if hat("laden") else ""),
    "",
    schild(540, 1300, "SEIT 2013", CYAN, groesse=70, wort="2013"),
    (hervorheben(*OBJ["laden"][1:], maske=M("laden"), art="heben", glanz=CYAN, wort="verkauft") if hat("laden") else ""),
    (hervorheben(*OBJ["podest"][1:], maske=M("podest"), art="blink", glanz=MAG, wort="platz") if hat("podest") else "") + beben(1.1, .5, wort="drei"),
    "",
]
FX = [
    [fx_explosion(235, nach=" MIO.", unter="VERKAUFT", wort="235", plus=-.4, dauer=2.0)],
    [fx_farbschnitte(["PLATZ", "1?", "2?", "3?"], wort="platz", dauer=1.4)],
    [],
    [],
    [fx_punkte("#3", unter="NUR MINECRAFT UND TETRIS DAVOR", wort="drei", dauer=2.0)],
    [fx_muster(d=0, dauer=0.7)],
]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/{BILDER[i]}.png"
    sz["ueber"] = UEBER[i]
    sz["fx"] = FX[i]
    m, x, y = OBJ[BILDER[i]]
    if hat(m):
        sz["objekt"] = {"maske": M(m), "x": x, "y": y}
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
szenen[-1]["fx"] = [fx_strahlen(dauer=4.0)]
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 5: Platz 3 aller Zeiten", "datei": "gta5-rekord",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 5: <b>235 Mio.</b> verkauft", "szene": 0},
    "hook": {"text": "235 Mio.<br><b>verkauft?!</b>", "dauer": 1.4},
    "musik": "episch",
    "emojis": {"millionen": "💰", "platz": "🏆", "kommentare": "💬", "minecraft": "⛏️", "rockstar": "⭐"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

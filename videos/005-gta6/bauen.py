#!/usr/bin/env python3
"""Wusstest du's? – GTA 6 ist da: 5 Fakten."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
szenen = [
    {"kopf": "GTA 6: <b>13 Jahre</b> Warten",
     "text": "13 Jahre haben Fans auf dieses Spiel gewartet. Seit gestern ist GTA 6 endlich da. Hier sind fünf Fakten, die du kennen musst."},
    {"kopf": "<b>90 Mio.</b> in 24 Stunden",
     "text": "Schon der erste Trailer brach einen Weltrekord: rund 90 Millionen Aufrufe auf YouTube in nur 24 Stunden."},
    {"kopf": "Dann <b>475 Mio.</b>",
     "text": "Der zweite Trailer legte noch einen drauf: 475 Millionen Aufrufe auf allen Plattformen, an einem einzigen Tag."},
    {"kopf": "Zweimal <b>verschoben</b>",
     "text": "Dafür mussten Fans Geduld haben. Das Spiel wurde zweimal verschoben, erst auf Mai, dann auf den 19. November 2026."},
    {"kopf": "Willkommen in <b>Leonida</b>",
     "text": "Gespielt wird im Bundesstaat Leonida, angelehnt an Florida. Und mittendrin: die Rückkehr von Vice City."},
    {"kopf": "<b>200 Mio.</b> Mal verkauft",
     "text": "Die Messlatte ist riesig: Der Vorgänger GTA 5 wurde über 200 Millionen Mal verkauft."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Dann folg für mehr!", "min_dauer": 3.0},
]
EFFEKTE = [""] * 6
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/g{i+1}.png"
    sz["ueber"] = EFFEKTE[i]
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 6 ist da", "datei": "gta6-fakten",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6: <b>5 Fakten</b>", "szene": 0},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

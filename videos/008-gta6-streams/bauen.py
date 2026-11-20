#!/usr/bin/env python3
"""Wusstest du's? – GTA 6 bricht das Internet."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
szenen = [
    {"kopf": "GTA 6 <b>bricht</b> das Internet",
     "text": "GTA 6 ist seit gestern da und hat sofort das Internet gesprengt."},
    {"kopf": "<b>7,9 Mio.</b> live dabei",
     "text": "Fast acht Millionen Menschen haben gleichzeitig Streams zum Spiel geschaut, auf Twitch, YouTube und Kick zusammen."},
    {"kopf": "Twitch-<b>Rekord</b>",
     "text": "Allein auf Twitch waren es über drei Millionen. Kein Spiel hatte dort jemals mehr Zuschauer, nicht mal League of Legends oder Fortnite."},
    {"kopf": "<b>1.500 Jahre</b> Zuschauen",
     "text": "Laut Twitch entspricht das zusammen mehr als 1500 Jahren Dauerzuschauen."},
    {"kopf": "Die <b>GTA-Grippe</b>",
     "text": "Und viele haben sich dafür freigenommen. In den USA spricht man schon von der GTA-Grippe."},
    {"kopf": "Und <b>du?</b>",
     "text": "Hast du dich auch schon angesteckt? Schreib's in die Kommentare."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Dann folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["stadt", "publikum", "publikum", "handys", "grippe", "grippe"]
EFFEKTE = [""] * 6
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/s_{BILDER[i]}.png" if (HIER / f"bilder/s_{BILDER[i]}.png").exists() else "bilder/s_zimmer.png"
    sz["ueber"] = EFFEKTE[i]
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 6 bricht das Internet", "datei": "gta6-streams",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6 <b>bricht</b> das Internet", "szene": 0},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

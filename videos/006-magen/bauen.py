#!/usr/bin/env python3
"""Wusstest du's? – Warum verdaut sich der Magen nicht selbst?"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
szenen = [
    {"kopf": "Warum verdaut er sich <b>nicht?</b>",
     "text": "Dein Magen ist voller Säure. Warum verdaut er sich eigentlich nicht selbst?"},
    {"kopf": "Salzsäure im <b>Bauch</b>",
     "text": "Im Magen steckt Salzsäure. Sie zersetzt dein Essen und tötet Keime ab."},
    {"kopf": "Ein <b>Schutzschild</b>",
     "text": "Damit sie dich nicht selbst angreift, ist die Magenwand mit einer dicken Schleimschicht bedeckt."},
    {"kopf": "Bikarbonat gegen <b>Säure</b>",
     "text": "In diesem Schleim steckt Bikarbonat. Es fängt die Säure ab, bevor sie deine Zellen erreicht."},
    {"kopf": "Alle <b>3 bis 5 Tage</b> neu",
     "text": "Und die oberste Zellschicht wird ständig erneuert. Etwa alle drei bis fünf Tage hast du eine neue Magenoberfläche."},
    {"kopf": "Einfach <b>mitverdaut</b>",
     "text": "Die alten Zellen lösen sich ab und werden einfach mitverdaut, zusammen mit deinem Essen."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Dann folg für mehr!", "min_dauer": 3.0},
]
EFFEKTE = [""] * 6
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/m{[1 if (HIER / 'bilder/m1.png').exists() else 2,2,3,4,5,2][i]}.png"
    sz["ueber"] = EFFEKTE[i]
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Warum verdaut sich der Magen nicht selbst", "datei": "magen-saeure",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": CYAN, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Warum verdaut sich dein <b>Magen</b> nicht?", "szene": 0},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

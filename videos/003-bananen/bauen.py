#!/usr/bin/env python3
"""Wusstest du's? – Warum Bananen leicht radioaktiv sind."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG, GIFT = "#3ff0ff", "#ff4fd8", "#c6ff3f"
szenen = [
    {"kopf": "Bananen sind <b>radioaktiv</b>",
     "text": "Deine Banane ist radioaktiv. Kein Witz. Und du bist es auch.",
     "ueber": ""},
    {"kopf": "Schuld ist <b>Kalium-40</b>",
     "text": "Bananen stecken voller Kalium. Ein winziger Teil davon ist Kalium-40, ein natürlich radioaktives Atom.",
     "ueber": ""},
    {"kopf": "<b>15</b> Zerfälle pro Sekunde",
     "text": "Eine Banane hat etwa 15 Becquerel. Das heißt: In ihr zerfallen jede Sekunde rund 15 Atome.",
     "ueber": ""},
    {"kopf": "Harmloser als <b>Fliegen</b>",
     "text": "Eine Banane bringt dir etwa 0,1 Mikrosievert. Ein Flug nach New York bringt dir mehrere hundert Mal so viel.",
     "ueber": ""},
    {"kopf": "Kein <b>Risiko</b>",
     "text": "Und keine Sorge: Dein Körper hält den Kaliumspiegel konstant. Was zu viel ist, scheidest du einfach wieder aus.",
     "ueber": ""},
    {"kopf": "Du strahlst <b>mehr</b>",
     "text": "Übrigens: Dein eigener Körper hat mehrere tausend Becquerel. Du strahlst also mehr als jede Banane.",
     "ueber": ""},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Folg für mehr Wusstest-du's!",
     "min_dauer": 3.0, "ueber": ""},
]
EFFEKTE = Path(__file__).with_name("effekte.json")
if EFFEKTE.exists():
    for sz, u in zip(szenen, json.loads(EFFEKTE.read_text())):
        sz["ueber"] = u
for i, sz in enumerate(szenen):
    sz["foto"] = f"bilder/b{i+1}.png"
    sz["bild"] = ""
projekt = {
    "titel": "Bananen sind radioaktiv", "datei": "bananen-radioaktiv",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": GIFT, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Bananen sind <b>radioaktiv</b>", "szene": 0},
    "szenen": szenen,
}
Path(__file__).with_name("projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

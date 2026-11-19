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
    {"kopf": "Schuld ist <b style=\"white-space:nowrap\">Kalium-40</b>",
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
effekte = [
    leuchten(562, 886, 150, GIFT, wort="radioaktiv")
    + sonar(778, 713, 45, GIFT, wort="radioaktiv", plus=0.2) + sonar(162, 1112, 45, GIFT, wort="radioaktiv", plus=0.35)
    + sonar(875, 1231, 45, GIFT, wort="radioaktiv", plus=0.5)
    + schild(540, 1380, "DU AUCH!", MAG, WEISS, wort="auch"),

    kreis(529, 1210, 270, 300, CYAN, wort="kalium")
    + leuchten(562, 734, 95, MAG, wort="kalium-40") + schild(850, 620, "K-40", MAG, WEISS, wort="kalium-40", plus=0.2),

    schild(800, 1000, "15 Bq", GIFT, wort="15")
    + sonar(402, 1150, 120, MAG, wort="zerfallen")
    + kreis(518, 486, 240, wort="sekunde"),

    kreis(324, 994, 140, 230, GIFT, wort="banane") + schild(330, 1300, "0,1 µSv", GIFT, wort="0,1")
    + kreis(626, 691, 300, 170, MAG, wort="flug") + schild(760, 950, "HUNDERTFACH", MAG, WEISS, wort="hundert"),

    leuchten(540, 778, 110, CYAN, wort="konstant")
    + pfeil(600, 1150, 900, 1380, biegung=0.2, farbe=CYAN, wort="scheidest"),

    leuchten(531, 880, 230, CYAN, wort="körper") + schild(820, 560, "1000+ Bq", CYAN, wort="tausend")
    + kreis(356, 1430, 70, farbe=GIFT, wort="banane"),

    leuchten(564, 421, 140, MAG, wort="folg"),
]
for sz, u in zip(szenen, effekte):
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

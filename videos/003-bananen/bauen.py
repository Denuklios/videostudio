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
     "text": "Wusstest du das? Dann folg für mehr!",
     "min_dauer": 3.0, "ueber": ""},
]
B = Path(__file__).resolve().parent / "bilder"
M = lambda n: str(B / f"maske_{n}.png")
effekte = [
    hervorheben(562, 886, maske=M("banane"), art="puls", glanz=GIFT, wort="radioaktiv")
    + schild(540, 1380, "DU AUCH!", MAG, WEISS, wort="auch"),

    hervorheben(485, 1225, maske=M("scheibe"), glanz=CYAN, wort="kalium")
    + hervorheben(560, 730, maske=M("atom"), art="blink", glanz=MAG, wort="kalium-40")
    + schild(850, 620, "K-40", MAG, WEISS, wort="kalium-40", plus=0.2),

    schild(800, 1000, "15 Bq", GIFT, wort="15")
    + hervorheben(470, 1165, maske=M("kern"), art="blink", glanz=MAG, wort="zerfallen")
    + hervorheben(515, 435, maske=M("stoppuhr"), art="puls", glanz=CYAN, wort="sekunde"),

    hervorheben(335, 985, maske=M("banane4"), glanz=GIFT, wort="banane") + schild(330, 1300, "0,1 µSv", GIFT, wort="0,1")
    + hervorheben(660, 690, maske=M("flugzeug"), art="puls", glanz=MAG, wort="flug")
    + schild(760, 950, "HUNDERTFACH", MAG, WEISS, wort="hundert"),

    hervorheben(540, 755, maske=M("waage"), art="blink", glanz=CYAN, wort="konstant")
    + pfeil(600, 1150, 900, 1380, biegung=0.2, farbe=CYAN, wort="scheidest"),

    hervorheben(540, 1020, maske=M("mensch"), art="puls", glanz=CYAN, wort="körper")
    + schild(820, 560, "1000+ Bq", CYAN, wort="tausend")
    + hervorheben(365, 1480, maske=M("minibanane"), art="blink", glanz=GIFT, halten=None, wort="banane"),

    hervorheben(540, 860, maske=str(Path(__file__).resolve().parents[2] / "kanal/maske_logo.png"),
                art="puls", glanz=MAG, halten=None, wort="folg"),
]
for sz, u in zip(szenen, effekte):
    sz["ueber"] = u
for i, sz in enumerate(szenen):
    sz["foto"] = f"bilder/b{i+1}.png" if i < len(szenen) - 1 else "../../kanal/schluss.png"
    sz["bild"] = ""
projekt = {
    "titel": "Bananen sind radioaktiv", "datei": "bananen-radioaktiv-v3",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": GIFT, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Bananen sind <b>radioaktiv</b>", "szene": 0},
    "szenen": szenen,
}
Path(__file__).with_name("projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

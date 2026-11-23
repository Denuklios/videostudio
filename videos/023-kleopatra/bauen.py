#!/usr/bin/env python3
"""Wusstest du's? – Kleopatra lebte näher an der Mondlandung als am Pyramidenbau."""
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
    {"kopf": "Kleopatra &amp; der <b>Mond?!</b>",
     "text": "Kleopatra lebte näher an der Mondlandung als am Bau der Pyramiden."},
    {"kopf": "<b>Stimmt</b> oder nicht?",
     "text": "Was glaubst du: Stimmt das oder nicht? Schreib's in die Kommentare, bevor ich's auflöse!"},
    {"kopf": "Pyramide: <b>2560 v. Chr.</b>", "label": "FAKT 1/3",
     "text": "Die große Pyramide von Gizeh war um 2560 vor Christus fertig."},
    {"kopf": "Kleopatra: <b>30 v. Chr.</b>", "label": "FAKT 2/3",
     "text": "Kleopatra starb im Jahr 30 vor Christus. Da war die Pyramide schon über 2500 Jahre alt."},
    {"kopf": "Mondlandung: <b>1969</b>", "label": "FAKT 3/3",
     "text": "Bis zur Mondlandung 1969 vergingen danach nur knapp 2000 Jahre."},
    {"kopf": "Es <b>stimmt!</b>",
     "text": "Es stimmt also: Kleopatra stand der Mondlandung näher als dem Bau der Pyramiden."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["pyramiden", "koenigin", "pyramiden", "koenigin", "mond", "mond"]
OBJ = {"pyramiden": ("pyramide", 540, 1000), "koenigin": ("koenigin", 540, 1000), "mond": ("astronaut", 540, 1000)}

UEBER = [
    (hervorheben(*OBJ["pyramiden"][1:], maske=M("pyramide"), art="puls", glanz=CYAN, wort="pyramiden") if hat("pyramide") else ""),
    "",
    schild(540, 1300, "2560 V. CHR.", MAG, WEISS, groesse=64, wort="2560"),
    (hervorheben(*OBJ["koenigin"][1:], maske=M("koenigin"), art="heben", glanz=MAG, wort="kleopatra") if hat("koenigin") else ""),
    schild(540, 1300, "1969", CYAN, groesse=70, wort="1969") + beben(1.0, .5, wort="knapp"),
    (hervorheben(*OBJ["mond"][1:], maske=M("astronaut"), art="blink", glanz=CYAN, wort="mondlandung") if hat("astronaut") else ""),
]
FX = [
    [],
    [fx_farbschnitte(["STIMMT", "ODER", "NICHT?"], wort="stimmt", dauer=1.3)],
    [],
    [fx_uhr("2.500 JAHRE", wort="2500", dauer=2.0)],
    [],
    [fx_streifen("STIMMT!", unter="NÄHER AM MOND", wort="stimmt", dauer=1.6)],
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
    "titel": "Kleopatra und die Mondlandung", "datei": "kleopatra",
    "stil": {"bg1": "#1a1208", "bg2": "#3a2a10", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Kleopatra: <b>näher am Mond?!</b>", "szene": 0},
    "hook": {"text": "Kleopatra:<br><b>näher am Mond?!</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"kleopatra": "👑", "mondlandung": "🌕", "pyramide": "🔺", "kommentare": "💬", "stimmt": "✅"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

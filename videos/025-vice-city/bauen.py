#!/usr/bin/env python3
"""Wusstest du's? – Vice City: von 1986 bis GTA 6."""
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
    {"kopf": "Vice City ist <b>zurück</b>",
     "text": "Vice City gibt es schon seit 2002. GTA 6 ist die große Rückkehr."},
    {"kopf": "<b>1976, 1986 oder 1996?</b>",
     "text": "Was glaubst du: In welchem Jahr spielte das erste Vice City? 1976, 1986 oder 1996? Schreib's, bevor ich's auflöse!"},
    {"kopf": "Erfundenes <b>Miami</b>", "label": "FAKT 1/3",
     "text": "Vice City ist eine erfundene Version von Miami."},
    {"kopf": "Die Antwort: <b>1986</b>", "label": "FAKT 2/3",
     "text": "Das Spiel von 2002 spielte in den Achtzigern, genauer gesagt 1986."},
    {"kopf": "Heute in <b>Leonida</b>", "label": "FAKT 3/3",
     "text": "In GTA 6 ist Vice City zurück, diesmal heute, im Bundesstaat Leonida, Rockstars Version von Florida."},
    {"kopf": "<b>24 Jahre</b> später",
     "text": "Vierundzwanzig Jahre nach dem ersten Besuch geht es wieder nach Vice City."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["retro", "retro", "strand", "retro", "heute", "heute"]
OBJ = {"retro": ("auto", 540, 1200), "strand": ("palme", 540, 900), "heute": ("turm", 540, 800)}
UEBER = [
    (hervorheben(*OBJ["retro"][1:], maske=M("auto"), art="puls", glanz=MAG, wort="vice") if hat("auto") else ""),
    "",
    (hervorheben(*OBJ["strand"][1:], maske=M("palme"), art="heben", glanz=CYAN, wort="miami") if hat("palme") else ""),
    schild(540, 1300, "1986", MAG, WEISS, groesse=80, wort="1986") + beben(1.0, .5, wort="1986"),
    (hervorheben(*OBJ["heute"][1:], maske=M("turm"), art="blink", glanz=CYAN, wort="leonida") if hat("turm") else ""),
    "",
]
FX = [
    [fx_laufband("VICE CITY", wort="vice", dauer=2.0, y=1250)],
    [fx_farbschnitte(["1976?", "1986?", "1996?"], wort="1976", dauer=1.5)],
    [],
    [],
    [],
    [fx_uhr("24 JAHRE", wort="vierundzwanzig", dauer=2.0)],
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
    "titel": "Vice City: von 1986 bis GTA 6", "datei": "vice-city",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Vice City: <b>1986 → heute</b>", "szene": 0},
    "hook": {"text": "Vice City<br><b>ist zurück!</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"vice": "🌴", "miami": "🏖️", "kommentare": "💬", "florida": "🌊", "1986": "📼"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

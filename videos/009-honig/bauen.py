#!/usr/bin/env python3
"""Wusstest du's? – Warum Honig praktisch nie schlecht wird."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
B = HIER / "bilder"
szenen = [
    {"kopf": "Honig hält <b>ewig?</b>",
     "text": "Honig kann tausende Jahre halten. In ägyptischen Gräbern fand man über dreitausend Jahre alten Honig."},
    {"kopf": "Kaum <b>Wasser</b>", "label": "TRICK 1/3",
     "text": "Erstens: Honig hat nur etwa siebzehn Prozent Wasser. Keime trocknen darin aus."},
    {"kopf": "Sauer wie <b>O-Saft</b>", "label": "TRICK 2/3",
     "text": "Zweitens: Honig ist so sauer wie Orangensaft. Das hassen Bakterien."},
    {"kopf": "Der <b>Bienen-Trick</b>", "label": "TRICK 3/3",
     "text": "Drittens: Ein Bienen-Enzym bildet mit Feuchtigkeit Wasserstoffperoxid, ein natürliches Desinfektionsmittel."},
    {"kopf": "Deckel <b>drauf!</b>",
     "text": "Aber: Offen zieht Honig Wasser und kann gären. Mit Deckel hält er praktisch ewig, wie der Honig der Pharaonen."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["h_aegypten", "h_dipper", "h_glas", "h_bienen", "h_glaeser"]
OBJ = [("krug", 540, 1050), ("dipper", 540, 800), ("glas", 600, 1330), ("biene", 380, 560), ("glas2", 480, 990)]
EFFEKTE = [""] * 5
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/{BILDER[i]}.png"
    sz["ueber"] = EFFEKTE[i]
    m, x, y = OBJ[i]
    sz["objekt"] = {"maske": str(B / f"maske_{m}.png"), "x": x, "y": y}
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Warum Honig nie schlecht wird", "datei": "honig-ewig",
    "stil": {"bg1": "#140c02", "bg2": "#3a2406", "akzent": CYAN, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Honig hält <b>ewig?</b>", "szene": 0},
    "hook": {"text": "3000 Jahre<br><b>alter Honig?!</b>", "dauer": 1.4},
    "musik": "ruhig",
    "emojis": {"honig": "🍯", "ägyptischen": "🏺", "bakterien": "🦠", "bienen": "🐝", "sauer": "🍊", "deckel": "🫙"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

#!/usr/bin/env python3
"""Wusstest du's? – Ein Tag auf der Venus ist länger als ein Jahr."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
szenen = [
    {"kopf": "Ein Tag <b>länger</b> als ein Jahr",
     "text": "Auf der Venus dauert ein Tag länger als ein ganzes Jahr. Klingt unmöglich? Ist aber so."},
    {"kopf": "<b>225 Tage</b> pro Jahr",
     "text": "Für eine Runde um die Sonne braucht die Venus etwa 225 Erdtage."},
    {"kopf": "<b>243 Tage</b> pro Drehung",
     "text": "Aber um sich einmal um sich selbst zu drehen, braucht sie rund 243 Tage. Kein Planet dreht sich langsamer."},
    {"kopf": "Sie dreht sich <b>rückwärts</b>",
     "text": "Und sie dreht sich auch noch andersherum als die Erde und fast alle anderen Planeten."},
    {"kopf": "Sonne geht im <b>Westen</b> auf",
     "text": "Deshalb geht auf der Venus die Sonne im Westen auf und im Osten unter."},
    {"kopf": "Warum? <b>Unklar</b>",
     "text": "Warum das so ist, weiß niemand genau. Vielleicht hat ein riesiger Einschlag sie einst ausgebremst."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Dann folg für mehr!", "min_dauer": 3.0},
]
EFFEKTE = [""] * 6
BILDER = ["v4", "v2", "v2", "v4", "v5", "v5"]
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/{BILDER[i]}.png"
    sz["ueber"] = EFFEKTE[i]
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
B = HIER / "bilder"
OBJ = {0: ("venus4", 540, 1320), 1: ("sonne", 250, 1250), 2: ("venus2", 815, 780), 3: ("venus4", 540, 1320), 4: ("horizont_sonne", 750, 745)}
for i, (m, x, y) in OBJ.items():
    szenen[i]["objekt"] = {"maske": str(B / f"maske_{m}.png"), "x": x, "y": y}
for i, l in {1: "FAKT 1/3", 3: "FAKT 2/3", 4: "FAKT 3/3"}.items():
    szenen[i]["label"] = l
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Ein Tag auf der Venus", "datei": "venus-tag",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Ein Tag <b>länger</b> als ein Jahr", "szene": 0},
    "hook": {"text": "1 Tag &gt;<br><b>1&nbsp;Jahr?!</b>", "dauer": 1.4},
    "musik": "episch",
    "emojis": {"venus": "🪐", "sonne": "☀️", "erde": "🌍", "andersherum": "🔄", "einschlag": "💥", "unmöglich": "🤯"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

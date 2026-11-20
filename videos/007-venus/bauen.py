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
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/v{i+1}.png"
    sz["ueber"] = EFFEKTE[i]
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Ein Tag auf der Venus", "datei": "venus-tag",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Ein Tag <b>länger</b> als ein Jahr", "szene": 0},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

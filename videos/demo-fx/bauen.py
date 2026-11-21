#!/usr/bin/env python3
"""Wusstest du's? – GTA 6: So wirst du schnell reich (Stand Release-Woche)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
B = HIER / "bilder"
szenen = [
    {"kopf": "Bis zu <b>205.000 $</b>",
     "text": "In GTA 6 bringt ein Banküberfall bis zu zweihundertfünftausend Dollar. So kommst du hin."},
    {"kopf": "Kapitel 1: <b>nicht farmen</b>", "label": "TIPP 1/4",
     "text": "Tipp eins: Sammel in Kapitel eins kein Geld. Am Ende des Kapitels ist es nämlich weg."},
    {"kopf": "Autos an <b>Moses</b>", "label": "TIPP 2/4",
     "text": "Tipp zwei: Ab Kapitel zwei verkaufst du geklaute Autos an Moses, für ein paar tausend Dollar."},
    {"kopf": "<b>Juweliere</b> knacken", "label": "TIPP 3/4",
     "text": "Tipp drei: Raub einen Juwelier aus. Das bringt zehn- bis fünfundzwanzigtausend Dollar pro Überfall."},
    {"kopf": "Der <b>Banktresor</b>", "label": "TIPP 4/4",
     "text": "Tipp vier: Ende Kapitel vier schaltet eine Nebenmission die Banktresore frei."},
    {"kopf": "<b>205.000 $</b> pro Tresor",
     "text": "Und dann holst du bis zu zweihundertfünftausend Dollar, pro Tresor."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["g_tresor", "g_skyline", "g_auto", "g_juwelier", "g_tresor", "g_dollar"]
OBJ = {0: ("tresor", 690, 1050), 1: ("turm", 860, 720), 3: ("juwelier", 760, 960), 4: ("tresor", 690, 1050)}
if not (B / "g_juwelier.png").exists():
    BILDER[3] = "g_dollar"; OBJ.pop(3, None)
EFFEKTE = [""] * 6
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/{BILDER[i]}.png"
    sz["ueber"] = EFFEKTE[i]
    if i in OBJ and (B / f"maske_{OBJ[i][0]}.png").exists():
        m, x, y = OBJ[i]
        sz["objekt"] = {"maske": str(B / f"maske_{m}.png"), "x": x, "y": y}
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 6: So wirst du schnell reich", "datei": "gta6-geld",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6: <b>205.000 $</b> pro Coup", "szene": 0},
    "hook": {"text": "205.000 $<br><b>pro Coup?!</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"banküberfall": "🏦", "geld": "💰", "autos": "🚗", "juweliere": "💎", "dollar": "💵", "banktresore": "🔓"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

#!/usr/bin/env python3
"""Wusstest du's? – GTA 6: Die ersten Glitches gehen viral (Stand 20./21.11.)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
B = HIER / "bilder"
szenen = [
    {"kopf": "GTA 6 <b>glitcht</b>",
     "text": "GTA 6 ist erst zwei Tage draußen, und schon gehen die ersten Glitches viral."},
    {"kopf": "Fliegende <b>Autos</b>", "label": "GLITCH 1/3",
     "text": "Glitch eins: Autos, die plötzlich abheben und durch die Luft fliegen."},
    {"kopf": "Figuren <b>verschwinden</b>", "label": "GLITCH 2/3",
     "text": "Glitch zwei: Figuren, die einfach verschwinden oder durch Wände laufen."},
    {"kopf": "Polizei-<b>Bugs</b>", "label": "GLITCH 3/3",
     "text": "Glitch drei: Seltsame Fehler bei Polizei-Einsätzen."},
    {"kopf": "Wie <b>Cyberpunk?</b>",
     "text": "Manche vergleichen das schon mit dem Fehlstart von Cyberpunk 2077. Doch bei so riesigen Spielen sind Bugs zum Start nicht ungewöhnlich."},
    {"kopf": "Die Clips <b>gehen viral</b>",
     "text": "Und genau deshalb sind fliegende Autos gerade die lustigsten Clips im ganzen Netz."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
FLIEG = (B / "x_fliegauto.png").exists()
BILDER = ["x_fliegauto" if FLIEG else "x_highway", "x_highway", "x_kreuz", "x_polizei", "x_skyline", "x_fliegauto" if FLIEG else "x_kreuz"]
OBJ = {3: ("polizei", 620, 1260), 4: ("turm", 685, 920)}
if FLIEG and (B / "maske_fliegauto.png").exists():
    OBJ[0] = OBJ[5] = ("fliegauto",) + tuple(json.loads((B / "fliegauto_pos.json").read_text()))
EFFEKTE = [""] * 6
datei = HIER / "effekte.py"
if datei.exists():
    ns = dict(globals()); exec(datei.read_text(), ns); EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/{BILDER[i]}.png"
    sz["ueber"] = EFFEKTE[i]
    if i in OBJ:
        m, x, y = OBJ[i]
        sz["objekt"] = {"maske": str(B / f"maske_{m}.png"), "x": x, "y": y}
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                  art="puls", glanz=MAG, halten=None, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 6: Die ersten Glitches", "datei": "gta6-glitches",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": CYAN, "text": "#ffffff", "form": MAG},
    "cover": {"titel": "GTA 6: <b>Fliegende Autos?!</b>", "szene": 0},
    "hook": {"text": "Fliegende<br><b>Autos?!</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"glitches": "👾", "autos": "🚗", "luft": "🚀", "verschwinden": "👻", "polizei": "🚓", "cyberpunk": "🤖", "lustigsten": "😂"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

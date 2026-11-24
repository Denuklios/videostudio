#!/usr/bin/env python3
"""GTA 6: 3 geheime Easter Eggs – Paul Walkers Auto, Schlange im Kofferraum, Mario-Mützen (Trend #gta6 / #lucia)."""
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
    {"kopf": "GTA 6: <b>Geheimes Mario?!</b>",
     "text": "In GTA 6 ist ein geheimes Mario-Easter-Egg versteckt. Und kaum einer hat es gefunden."},
    {"kopf": "Bleib bis zum <b>Ende</b>",
     "text": "Aber erst zwei andere Geheimnisse. Bleib dran, das Mario-Ding ist das Krasseste."},
    {"kopf": "Paul Walkers <b>Auto</b>", "label": "GEHEIMNIS 1/3",
     "text": "In einer Villa auf Vespucci Island steht in der Garage ein Mitsubishi Eclipse. Genau das Auto von Paul Walker aus Fast and Furious."},
    {"kopf": "Schlange im <b>Kofferraum</b>", "label": "GEHEIMNIS 2/3",
     "text": "Jetzt öffne den Kofferraum. Da springt dich eine Schlange an. Eine Anspielung auf Toy Story."},
    {"kopf": "Der <b>Mario-Block</b>", "label": "GEHEIMNIS 3/3",
     "text": "Und jetzt das Krasseste: Irgendwo steht ein Block wie bei Super Mario. Schieß drauf, und Jason und Lucia bekommen die Mützen von Mario und Luigi."},
    {"kopf": "Speichern & <b>folgen</b>",
     "text": "Speicher dir das und folg für mehr GTA-Geheimnisse!", "min_dauer": 2.4},
]
BILDER = ["block", "garage", "garage", "kofferraum", "block"]
OBJ = {"block": ("block", 540, 900), "garage": ("auto", 540, 1150), "kofferraum": ("schlange", 540, 1100)}
def hv(n, wort, art="puls", glanz=MAG):
    m, x, y = OBJ[n]
    return hervorheben(x, y, maske=M(m), art=art, glanz=glanz, wort=wort) if hat(m) else ""
UEBER = [
    hv("block", "mario"),
    "",
    hv("garage", "mitsubishi", "blink", CYAN),
    hv("kofferraum", "schlange") + beben(1.1, .5, wort="springt"),
    hv("block", "schieß", "blink", CYAN),
]
FX = [
    [],
    [fx_farbschnitte(["3", "GEHEIME", "EASTER", "EGGS"], wort="zwei", dauer=1.4)],
    [fx_streifen("FAST & FURIOUS", wort="paul", dauer=1.6)],
    [],
    [fx_streifen("MARIO + LUIGI", wort="mützen", dauer=1.8)],
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
szenen[-1]["fx"] = [fx_strahlen(dauer=3.0)]
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "GTA 6: 3 geheime Easter Eggs", "datei": "gta6-geheimnisse",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6: <b>Geheimes Mario?!</b>", "szene": 0},
    "hook": {"text": "GTA 6:<br><b>MARIO?!</b>", "dauer": 1.3},
    "musik": "spannend",
    "emojis": {"mario": "🍄", "geheimnisse": "🤫", "auto": "🏎️", "schlange": "🐍", "krasseste": "🤯", "speicher": "📌"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

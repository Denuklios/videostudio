#!/usr/bin/env python3
"""Wusstest du's? – GTA 6: Der meistgesehene Clip ist ein Fehlklick."""
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
    {"kopf": "<b>600.000</b> Aufrufe",
     "text": "Der meistgesehene GTA-6-Clip hat über sechshunderttausend Aufrufe. Und alles wegen eines Fehlklicks."},
    {"kopf": "Live auf <b>Twitch</b>", "label": "SCHRITT 1/3",
     "text": "Streamer ohnePixel spielt GTA 6 live auf Twitch."},
    {"kopf": "Der <b>falsche</b> Knopf", "label": "SCHRITT 2/3",
     "text": "Im Club drückt er aus Versehen den falschen Knopf."},
    {"kopf": "Chat <b>eskaliert</b>", "label": "SCHRITT 3/3",
     "text": "Und kauft damit einen Privattanz. Sein Chat rastet komplett aus."},
    {"kopf": "Weit <b>vorne</b>",
     "text": "Kein anderer GTA-6-Clip kommt auch nur in die Nähe."},
    {"kopf": "1 Klick = <b>Platz 1</b>",
     "text": "Ein einziger falscher Klick. Und genau deshalb ist er der Nummer-eins-Clip zu GTA 6."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["streamer", "streamer", "maus", "club", "club", "maus"]
OBJ = {"streamer": ("streamer", 480, 1300), "maus": ("maus", 580, 1050), "club": ("club", 520, 1260)}

UEBER = [
    "",
    (hervorheben(*OBJ["streamer"][1:], maske=M("streamer"), art="puls", glanz=CYAN, wort="streamer") if hat("streamer") else ""),
    (hervorheben(*OBJ["maus"][1:], maske=M("maus"), art="blink", glanz=MAG, wort="knopf") if hat("maus") else ""),
    beben(1.1, 0.5, wort="rastet"),
    (hervorheben(*OBJ["club"][1:], maske=M("club"), art="heben", glanz=CYAN, wort="clip") if hat("club") else ""),
    "",
]
FX = [
    [fx_explosion(600000, unter="AUFRUFE", wort="sechshunderttausend", plus=-0.3, dauer=2.2)],
    [],
    [fx_farbschnitte(["1", "FALSCHER", "KLICK"], wort="falschen", dauer=1.2)],
    [fx_laufband("CHAT ESKALIERT", wort="chat", dauer=2.0, y=1250)],
    [],
    [fx_punkte("#1", unter="MEISTGESEHENER GTA-6-CLIP", wort="nummer", dauer=2.0)],
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
    "titel": "GTA 6: Der meistgesehene Clip", "datei": "gta6-clip",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6: <b>600.000 Views</b> für 1 Fehlklick", "szene": 0},
    "hook": {"text": "1 Fehlklick =<br><b>600.000 Views</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"fehlklicks": "🖱️", "twitch": "🎮", "knopf": "😳", "chat": "💬", "rastet": "🤯", "klick": "👆"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

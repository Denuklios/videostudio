#!/usr/bin/env python3
"""GTA 6: 3 Geld-Tipps für Kapitel 1 (hilfreicher Content, Suchbegriff „GTA 6 Geld“)."""
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
    {"kopf": "GTA 6 <b>Geld-Tipps</b>",
     "text": "GTA 6: So kommst du in Kapitel 1 schnell an Geld. Tipp 3 bringt am meisten."},
    {"kopf": "Bargeld <b>verstecken</b>", "label": "TIPP 1/3",
     "text": "Tipp 1: Stirbst du oder wirst du verhaftet, ist dein Bargeld weg. Versteck es unter den losen Dielen in Jasons Zimmer."},
    {"kopf": "<b>Briefkasten</b> leeren", "label": "TIPP 2/3",
     "text": "Tipp 2: Schau nach jeder Mission in den Briefkasten. Dort landet dein Lohn."},
    {"kopf": "<b>Schätze</b> tauchen", "label": "TIPP 3/3",
     "text": "Tipp 3: Nach der Mission Island Dreams tauchst du für Kenton nach Schätzen in alten Schiffswracks."},
    {"kopf": "Sofort <b>kassieren</b>",
     "text": "Du musst nicht jedes Schiffswrack ganz leeren. Bring ihm jeden Fund und kassier sofort ab."},
    {"kopf": "Speichern & <b>folgen</b>",
     "text": "Speicher dir das und folg für mehr!", "min_dauer": 2.6},
]
BILDER = ["dielen", "dielen", "briefkasten", "taucher", "hafen"]
OBJ = {"dielen": ("geld", 650, 1290), "briefkasten": ("briefkasten", 540, 1000),
       "taucher": ("taucher", 290, 620), "hafen": ("schatz", 630, 1270)}
UEBER = [
    "",
    (hervorheben(*OBJ["dielen"][1:], maske=M("geld"), art="puls", glanz=MAG, wort="dielen") if hat("geld") else "") + schild(540, 1500, "BARGELD = WEG", MAG, groesse=64, wort="weg"),
    (hervorheben(*OBJ["briefkasten"][1:], maske=M("briefkasten"), art="blink", glanz=CYAN, wort="briefkasten") if hat("briefkasten") else ""),
    (hervorheben(*OBJ["taucher"][1:], maske=M("taucher"), art="puls", glanz=MAG, wort="schätzen") if hat("taucher") else "") + beben(1.1, .5, wort="mission"),
    (hervorheben(*OBJ["hafen"][1:], maske=M("schatz"), art="blink", glanz=CYAN, wort="fund") if hat("schatz") else ""),
]
FX = [
    [fx_farbschnitte(["GTA 6", "GELD", "3 TIPPS"], wort="geld", dauer=1.4)],
    [],
    [],
    [fx_streifen("BESTER TIPP", wort="mission", dauer=1.6)],
    [fx_muster(d=0, dauer=0.7)],
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
    "titel": "GTA 6: 3 Geld-Tipps für Kapitel 1", "datei": "gta6-geld-tipps",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6 <b>Geld-Tipps</b>", "szene": 0},
    "hook": {"text": "GTA 6<br><b>Geld-Trick</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"geld": "💰", "bargeld": "💵", "briefkasten": "📬", "schätzen": "🤿", "schiffswrack": "🚢", "speicher": "📌"},
    "aussprache": {"GTA": "Ge Te A", "6": "sechs", "1": "eins", "2": "zwei", "3": "drei", "Island": "Eiländ", "Dreams": "Driems", "Kenton": "Kenten", "Jasons": "Dschäisons"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

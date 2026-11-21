#!/usr/bin/env python3
"""Wusstest du's? – Warum Flamingos rosa sind (und grau zur Welt kommen)."""
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
    {"kopf": "Grau <b>geboren</b>",
     "text": "Flamingos kommen grau zur Welt. Nicht rosa."},
    {"kopf": "Die Farbe kommt vom <b>Essen</b>", "label": "FAKT 1/3",
     "text": "Ihre Farbe kommt aus dem Essen: Algen und winzige Salinenkrebse."},
    {"kopf": "<b>Carotinoide</b>", "label": "FAKT 2/3",
     "text": "Darin stecken Farbstoffe namens Carotinoide. Die gibt es auch in Karotten."},
    {"kopf": "In <b>Federn</b>, Beinen, Schnabel", "label": "FAKT 3/3",
     "text": "Der Körper lagert sie in Federn, Beinen und Schnabel ein."},
    {"kopf": "<b>2–3 Jahre</b> bis Rosa",
     "text": "Bis ein Küken ganz rosa ist, dauert es zwei bis drei Jahre."},
    {"kopf": "Ohne Futter: <b>blass</b>",
     "text": "Ohne dieses Futter bleiben sie blass. Deshalb sind Flamingos am Anfang grau."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["kueken", "krebse", "krebse", "flamingo", "flamingo", "kueken"]
# Hauptobjekt je Bild (Maske aus ausschneiden.py, Mitte x/y) – nur genutzt, wenn die Maske existiert
OBJ = {"kueken": ("kueken", 620, 1250), "krebse": ("krebs", 540, 960), "flamingo": ("flamingo", 540, 900)}

UEBER = [
    (hervorheben(*OBJ["kueken"][1:], maske=M("kueken"), art="puls", glanz=CYAN, wort="grau") if hat("kueken") else "")
    + beben(1.0, 0.5, wort="nicht"),
    (hervorheben(*OBJ["krebse"][1:], maske=M("krebs"), art="heben", glanz=MAG, wort="salinenkrebse") if hat("krebs") else "")
    + schild(540, 1300, "ALGEN + KREBSE", MAG, WEISS, groesse=60, wort="algen"),
    "",
    (hervorheben(*OBJ["flamingo"][1:], maske=M("flamingo"), art="blink", glanz=MAG, wort="federn") if hat("flamingo") else ""),
    "",
    (hervorheben(*OBJ["kueken"][1:], maske=M("kueken"), art="heben", glanz=CYAN, wort="grau") if hat("kueken") else ""),
]
FX = [
    [],
    [],
    [fx_streifen("CAROTINOIDE", unter="WIE IN KAROTTEN", wort="carotinoide", dauer=1.7)],
    [],
    [fx_uhr("2–3 JAHRE", wort="zwei", dauer=2.0)],
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
szenen[-1]["fx"] = [fx_strahlen(dauer=4.0)]
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Warum Flamingos rosa sind", "datei": "flamingos",
    "stil": {"bg1": "#140a14", "bg2": "#3a1030", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Flamingos sind <b>grau?!</b>", "szene": 0},
    "hook": {"text": "Grau<br><b>geboren?!</b>", "dauer": 1.4},
    "musik": "ruhig",
    "emojis": {"flamingos": "🦩", "algen": "🌿", "salinenkrebse": "🦐", "karotten": "🥕", "jahre": "⏳", "blass": "🤍"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

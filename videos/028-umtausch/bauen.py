#!/usr/bin/env python3
"""Umtausch-Irrtum: Im Laden gibt es kein Recht auf Umtausch – 3 Regeln, die Geld sparen."""
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
    {"kopf": "Umtausch? <b>Kein Recht!</b>",
     "text": "Im Laden umtauschen? Darauf hast du gar kein Recht."},
    {"kopf": "3 Regeln, die <b>Geld sparen</b>",
     "text": "Hier sind drei Regeln, die dir echt Geld sparen. Die dritte kennt fast keiner."},
    {"kopf": "Laden: nur <b>Kulanz</b>", "label": "REGEL 1/3",
     "text": "Gefällt dir etwas aus dem Laden nicht, muss der Händler es nicht zurücknehmen. Das ist nur Kulanz. Lass dir den Umtausch also auf den Kassenbon schreiben."},
    {"kopf": "Online: <b>14 Tage</b>", "label": "REGEL 2/3",
     "text": "Online hast du vierzehn Tage Widerrufsrecht. Aber nur zurückschicken reicht meist nicht. Schreib dem Shop kurz, dass du widerrufst."},
    {"kopf": "Kaputt? <b>Händler</b> muss beweisen", "label": "REGEL 3/3",
     "text": "Und das Beste: Geht etwas im ersten Jahr kaputt, muss der Händler beweisen, dass der Fehler nicht schon beim Kauf da war. Nicht du."},
    {"kopf": "Speichern & <b>folgen</b>",
     "text": "Speicher dir das und folg für mehr!", "min_dauer": 2.4},
]
BILDER = ["kasse", "kasse", "bon", "paket", "kaputt"]
OBJ = {"kasse": ("tuete", 540, 1100), "bon": ("bon", 540, 1000), "paket": ("paket", 540, 1100), "kaputt": ("geraet", 540, 1100)}
def hv(n, wort, art="puls", glanz=MAG):
    m, x, y = OBJ[n]
    return hervorheben(x, y, maske=M(m), art=art, glanz=glanz, wort=wort) if hat(m) else ""
UEBER = [
    hv("kasse", "recht") + beben(1.1, .5, wort="kein"),
    "",
    hv("bon", "kassenbon", "blink", CYAN) + schild(540, 1450, "NUR KULANZ", MAG, groesse=70, wort="kulanz"),
    hv("paket", "zurückschicken"),
    hv("kaputt", "kaputt", "blink", CYAN),
]
FX = [
    [],
    [fx_farbschnitte(["3", "REGELN", "GELD", "SPAREN"], wort="drei", dauer=1.4)],
    [],
    [fx_uhr("14 TAGE", wort="vierzehn", dauer=1.8)],
    [fx_streifen("1 JAHR: HÄNDLER IN DER PFLICHT", wort="beweisen", dauer=1.8)],
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
    "titel": "Umtausch im Laden: kein Recht!", "datei": "umtausch",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Umtausch? <b>Kein Recht!</b>", "szene": 0},
    "hook": {"text": "KEIN<br><b>Umtausch?!</b>", "dauer": 1.4},
    "musik": "spannend",
    "emojis": {"umtauschen": "🔄", "geld": "💰", "kassenbon": "🧾", "online": "📦", "kaputt": "💥", "speicher": "📌"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

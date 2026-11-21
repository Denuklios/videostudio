#!/usr/bin/env python3
"""Wusstest du's? – GTA 6: 3,79 Milliarden Dollar an Tag 1."""
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
    {"kopf": "<b>3,8 Mrd. $</b> an Tag 1",
     "text": "GTA 6 hat an einem einzigen Tag knapp drei Komma acht Milliarden Dollar eingespielt."},
    {"kopf": "<b>32,5 Mio.</b> Kopien", "label": "FAKT 1/3",
     "text": "Schon vor dem Start waren über zweiunddreißig Millionen Kopien verkauft."},
    {"kopf": "GTA 5: <b>816 Mio. $</b>", "label": "FAKT 2/3",
     "text": "Zum Vergleich: GTA 5 machte am ersten Tag rund achthundertsechzehn Millionen Dollar."},
    {"kopf": "Mehr als das <b>Vierfache</b>", "label": "FAKT 3/3",
     "text": "GTA 6 schafft also mehr als das Vierfache."},
    {"kopf": "<b>Größter Start</b> aller Zeiten",
     "text": "Rockstar nennt es den größten Unterhaltungs-Start der Geschichte."},
    {"kopf": "Alles an <b>1 Tag</b>",
     "text": "Kein Kinofilm ist je so stark gestartet. Und das alles an einem einzigen Tag."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Schreib's in die Kommentare und folg für mehr!", "min_dauer": 3.0},
]
BILDER = ["geld", "laden", "geld", "skyline", "skyline", "laden"]
OBJ = {"geld": ("geld", 540, 1050), "laden": ("laden", 540, 950), "skyline": ("skyline", 540, 800)}

UEBER = [
    (hervorheben(*OBJ["geld"][1:], maske=M("geld"), art="puls", glanz=MAG, wort="milliarden") if hat("geld") else ""),
    (hervorheben(*OBJ["laden"][1:], maske=M("laden"), art="heben", glanz=CYAN, wort="kopien") if hat("laden") else ""),
    zaehler(540, 1300, 816, nach=" MIO. $", farbe=CYAN, groesse=70, wort="achthundertsechzehn", plus=-0.5),
    beben(1.2, 0.6, wort="vierfache"),
    (hervorheben(*OBJ["skyline"][1:], maske=M("skyline"), art="blink", glanz=MAG, wort="größten") if hat("skyline") else ""),
    "",
]
FX = [
    [fx_explosion(3790, nach=" MIO. $", unter="AN TAG 1", wort="milliarden", plus=-0.4, dauer=2.2)],
    [fx_punkte("32,5 MIO", unter="KOPIEN VOR DEM START", wort="zweiunddreißig", dauer=2.0)],
    [],
    [fx_farbschnitte(["4×", "MEHR", "ALS", "GTA 5"], wort="vierfache", dauer=1.4)],
    [],
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
    "titel": "GTA 6: Rekord an Tag 1", "datei": "gta6-rekord",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "GTA 6: <b>3,8 Mrd. $</b> an 1 Tag", "szene": 0},
    "hook": {"text": "3,8 Mrd. $<br><b>an 1 Tag?!</b>", "dauer": 1.4},
    "musik": "episch",
    "emojis": {"milliarden": "💰", "kopien": "📦", "gta": "🎮", "vierfache": "🚀", "geschichte": "🏆", "kinofilm": "🎬"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

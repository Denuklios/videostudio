#!/usr/bin/env python3
"""GTA 6: Streamer verliert 11 Stunden Fortschritt – mach NICHT diesen Fehler (Trend #gta6, Streamer-Moment + Tipp)."""
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
    {"kopf": "11 Stunden <b>weg?!</b>",
     "text": "Ein Streamer hat in GTA 6 elf Stunden Fortschritt verloren. Live vor allen Zuschauern."},
    {"kopf": "Kann <b>dir</b> auch passieren",
     "text": "Und genau das kann dir auch passieren. Pass auf."},
    {"kopf": "Der <b>Fehler</b>",
     "text": "Der Streamer JasonTheWeen hat seine PlayStation ausgeschaltet, während das Spiel gerade gespeichert hat."},
    {"kopf": "Spielstand <b>kaputt</b>",
     "text": "Der Spielstand war kaputt. Elf Stunden, einfach weg. Und selbst die Cloud hat ihn nicht gerettet."},
    {"kopf": "So schützt du <b>dich</b>",
     "text": "Deshalb: Siehst du das Speicher-Symbol, mach niemals die Konsole aus. Warte, bis es verschwunden ist."},
    {"kopf": "Speichern & <b>folgen</b>",
     "text": "Speicher dir das und folg für mehr Tipps!", "min_dauer": 2.4},
]
BILDER = ["schock", "schock", "konsole", "fehler", "warten"]
OBJ = {"schock": ("gamer", 540, 1100), "konsole": ("konsole", 480, 1300), "fehler": ("tv", 540, 650), "warten": ("konsole", 480, 1300)}
def hv(n, wort, art="puls", glanz=MAG):
    m, x, y = OBJ[n]
    return hervorheben(x, y, maske=M(m), art=art, glanz=glanz, wort=wort) if hat(m) else ""
UEBER = [
    hv("schock", "verloren") + beben(1.1, .5, wort="elf"),
    "",
    hv("konsole", "ausgeschaltet", "blink", CYAN),
    hv("fehler", "kaputt"),
    hv("warten", "niemals", "blink", CYAN),
]
FX = [
    [fx_explosion(11, nach=" STUNDEN", unter="WEG", wort="elf", plus=-.3, dauer=1.8)],
    [fx_farbschnitte(["DAS", "KANN", "DIR", "PASSIEREN"], wort="passieren", dauer=1.4)],
    [],
    [fx_streifen("SPIELSTAND KAPUTT", wort="kaputt", dauer=1.6)],
    [fx_streifen("NIE BEIM SPEICHERN AUSSCHALTEN", wort="niemals", dauer=1.8)],
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
    "titel": "GTA 6: 11 Stunden weg!", "datei": "gta6-11-stunden",
    "stil": {"bg1": "#0a0418", "bg2": "#2a0a3a", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "11 Stunden <b>weg?!</b>", "szene": 0},
    "hook": {"text": "11 STUNDEN<br><b>WEG?!</b>", "dauer": 1.3},
    "musik": "spannend",
    "emojis": {"verloren": "😱", "playstation": "🎮", "kaputt": "💀", "cloud": "☁️", "niemals": "⛔", "speicher": "📌"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

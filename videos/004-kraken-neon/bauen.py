#!/usr/bin/env python3
"""Wusstest du's? – Kraken haben 3 Herzen (Neon-Version)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG, GELB2 = "#3ff0ff", "#ff4fd8", "#ffd23f"
szenen = [
    {"kopf": "Kraken haben <b>3&nbsp;Herzen</b>",
     "text": "Kraken haben drei Herzen, blaues Blut und quasi neun Gehirne. Und das ist noch nicht mal das Verrückteste."},
    {"kopf": "2 für die <b>Kiemen</b>",
     "text": "Zwei der Herzen pumpen das Blut nur durch die Kiemen. Das dritte versorgt den ganzen restlichen Körper."},
    {"kopf": "Herz <b>aus!</b>",
     "text": "Und jetzt kommt's: Wenn ein Krake schwimmt, hört sein Hauptherz einfach auf zu schlagen."},
    {"kopf": "Lieber <b>krabbeln</b>",
     "text": "Deshalb krabbeln Kraken lieber über den Meeresboden. Schwimmen ist für sie richtig anstrengend."},
    {"kopf": "Warum <b>blau?</b>",
     "text": "Ihr Blut ist blau, weil es Sauerstoff mit Kupfer statt mit Eisen transportiert. Das funktioniert besser im kalten Wasser."},
    {"kopf": "Jeder Arm <b>denkt mit</b>",
     "text": "Und die neun Gehirne? Eins im Kopf und ein eigenes Nervenzentrum in jedem der acht Arme. Zwei Drittel ihrer Nervenzellen stecken in den Armen."},
    {"kopf": "Wusstest <b>du's?</b>",
     "text": "Wusstest du das? Dann folg für mehr!", "min_dauer": 3.0},
]
EFFEKTE = [""] * 6
effekte_datei = Path(__file__).with_name("effekte.py")
if effekte_datei.exists():
    ns = {}
    exec(effekte_datei.read_text(), globals(), ns)
    EFFEKTE = ns["EFFEKTE"]
for i, sz in enumerate(szenen[:-1]):
    sz["foto"] = f"bilder/k{i+1}.png"
    sz["ueber"] = EFFEKTE[i]
# Schluss-Szene: immer das feste Logo
szenen[-1]["foto"] = "../../kanal/schluss.png"
szenen[-1]["ueber"] = leuchten(564, 421, 140, MAG, wort="folg")
for sz in szenen:
    sz["bild"] = ""
projekt = {
    "titel": "Kraken haben 3 Herzen", "datei": "kraken-3-herzen-neon",
    "stil": {"bg1": "#060b1f", "bg2": "#12204a", "akzent": CYAN, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "Kraken haben <b>3&nbsp;Herzen</b>", "szene": 0},
    "szenen": szenen,
}
Path(__file__).with_name("projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

#!/usr/bin/env python3
"""Comic-Test: Kalle an der Supermarktkasse (eigene SVG-Zeichnungen, viele schnelle Schnitte)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "engine"))
from effekte import *  # noqa

CYAN, MAG = "#3ff0ff", "#ff4fd8"
HIER = Path(__file__).resolve().parent
S = [  # (Bild, Sprechtext, Überschrift, Effekt)
    ("k01_totale", "Samstag. Nur noch eine Person vor mir.", "POV: <b>Supermarkt</b>", ""),
    ("k02_display", "Siebenundvierzig Euro dreiundachtzig.", "", ""),
    ("k03_wuehlt", "Und jetzt sucht sie ihr Portemonnaie.", "", ""),
    ("k04_skeptisch", "Ernsthaft?", "", ""),
    ("k05_uhr", "Eine Minute. Zwei Minuten.", "", schild(540, 1360, "+2 MIN", MAG, WEISS, groesse=60, wort="zwei")),
    ("k06_schlange", "Die Schlange wird immer länger.", "", ""),
    ("k07_muenzen", "Kleingeld. Cent für Cent.", "", ""),
    ("k08_karte", "Dann Karte. Abgelehnt.", "", beben(0.8, 0.4, wort="abgelehnt")),
    ("k09_wuetend", "Ich koche.", "", beben(1.0, 0.5, wort="koche")),
    ("k10_dran", "Endlich dran.", "", ""),
    ("k11_display2", "Zwölf Euro neunzig.", "", ""),
    ("k12_taschen", "Moment. Mein Portemonnaie?", "", ""),
    ("k13_schock", "Liegt zu Hause.", "", beben(1.3, 0.6, wort="hause")),
    ("k14_karma", "Karma.", "<b>KARMA.</b>", ""),
]
szenen = [{"foto": f"bilder/{b}.png", "text": t, "kopf": k, "ueber": e, "bild": "", "kamera": None} for b, t, k, e in S]
for sz in szenen:
    sz.pop("kamera")
szenen.append({"kopf": "Kennst du <b>das?</b>", "text": "Kennst du das? Schreib's in die Kommentare und folg für mehr!",
               "min_dauer": 3.0, "foto": "../../kanal/schluss.png", "bild": "",
               "ueber": hervorheben(540, 860, maske=str(HIER.parents[1] / "kanal/maske_logo.png"),
                                    art="puls", glanz=MAG, halten=None, wort="folg")})
projekt = {
    "titel": "Kalle an der Kasse", "datei": "comic-kasse",
    "stil": {"bg1": "#efe6d2", "bg2": "#e8dcc4", "akzent": MAG, "text": "#ffffff", "form": CYAN},
    "cover": {"titel": "POV: <b>Supermarktkasse</b> 😤", "szene": 2},
    "hook": {"text": "Nur 1 Person<br><b>vor mir…</b>", "dauer": 1.4},
    "musik": "spannend", "tempo": "+18%",
    "emojis": {"portemonnaie": "👛", "minute": "⏰", "kleingeld": "🪙", "karte": "💳", "koche": "🤬", "karma": "😏"},
    "szenen": szenen,
}
(HIER / "projekt.json").write_text(json.dumps(projekt, ensure_ascii=False, indent=1))
print("ok")

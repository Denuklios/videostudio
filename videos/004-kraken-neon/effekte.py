# Effekte je Szene (wird von bauen.py geladen). Nur exakt ausgeschnittene Objekte, keine Kreise.
from pathlib import Path
B = Path("/home/user/videostudio/videos/004-kraken-neon/bilder")
M = lambda n: str(B / f"maske_{n}.png")
CYAN, MAG, ROT, KUPFER = "#3ff0ff", "#ff4fd8", "#ff3355", "#ff9a3c"
EFFEKTE = [
    hervorheben(535, 990, maske=M("krake1"), art="puls", glanz=MAG, wort="herzen")
    + schild(540, 1390, "9 GEHIRNE", MAG, WEISS, groesse=60, wort="gehirne"),

    hervorheben(530, 860, maske=M("kiemenherzen"), art="puls", glanz=CYAN, wort="kiemen")
    + hervorheben(520, 860, maske=M("hauptherz"), art="blink", glanz=MAG, wort="dritte"),

    hervorheben(350, 890, maske=M("krake3"), glanz=CYAN, wort="schwimmt") + tempo_linien(160, 880, wort="schwimmt")
    + hervorheben(870, 800, maske=M("monitor"), art="blink", glanz=ROT, halten=None, wort="schlagen")
    + schild(870, 1080, "STOP", ROT, WEISS, wort="schlagen", plus=0.2),

    hervorheben(615, 925, maske=M("krake4"), art="puls", glanz=MAG, wort="krabbeln")
    + pfeil(200, 1250, 880, 1230, biegung=-0.06, farbe=CYAN, gestrichelt=True, wort="meeresboden"),

    hervorheben(420, 730, maske=M("tropfen"), art="puls", glanz=CYAN, wort="blau")
    + hervorheben(710, 760, maske=M("kupfer"), glanz=KUPFER, wort="kupfer") + schild(710, 1060, "Cu", "#d9822b", WEISS, wort="kupfer", plus=0.2)
    + schild(540, 1250, "STATT Fe", "#8e2b2b", WEISS, groesse=56, wort="eisen"),

    hervorheben(555, 600, maske=M("gehirn"), art="blink", glanz=MAG, wort="kopf")
    + hervorheben(540, 960, maske=M("krake6"), art="puls", glanz=CYAN, wort="arme")
    + schild(540, 1400, "2/3 IN DEN ARMEN", CYAN, groesse=52, wort="drittel"),
]

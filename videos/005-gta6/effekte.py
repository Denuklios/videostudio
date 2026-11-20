# Effekte je Szene – nur exakt ausgeschnittene Objekte, keine Kreise.
from pathlib import Path
B = Path(__file__).resolve().parent / "bilder" if "__file__" in dir() else Path("/home/user/videostudio/videos/005-gta6/bilder")
B = Path("/home/user/videostudio/videos/005-gta6/bilder")
M = lambda n: str(B / f"maske_{n}.png")
CYAN, MAG, ROT = "#3ff0ff", "#ff4fd8", "#ff3355"
EFFEKTE = [
    hervorheben(570, 1095, maske=M("auto"), art="puls", glanz=MAG, wort="6")
    + tempo_linien(200, 1150, wort="6"),

    hervorheben(515, 800, maske=M("play"), art="blink", glanz=CYAN, wort="trailer")
    + hervorheben(540, 815, maske=M("bildschirm"), glanz=MAG, wort="weltrekord")
    + schild(540, 1180, "WELTREKORD", MAG, WEISS, wort="weltrekord", plus=0.2)
    + schild(540, 1330, "90 MIO. / 24 H", CYAN, wort="90"),

    hervorheben(530, 860, maske=M("handys"), art="blink", glanz=MAG, wort="475")
    + schild(540, 1330, "475 MIO. AN 1 TAG", MAG, WEISS, groesse=56, wort="475", plus=0.2),

    hervorheben(330, 615, maske=M("kreuze"), art="blink", glanz=ROT, wort="zweimal")
    + hervorheben(580, 815, maske=M("datum"), art="puls", glanz=CYAN, halten=None, wort="auf den")
    + schild(580, 1010, "19.11.2026", CYAN, wort="auf den", plus=0.3),

    hervorheben(510, 1100, maske=M("hotels"), art="puls", glanz=MAG, wort="vice")
    + schild(540, 560, "LEONIDA ≈ FLORIDA", CYAN, groesse=56, wort="florida"),

    hervorheben(560, 1050, maske=M("berg"), art="puls", glanz=CYAN, wort="über")
    + schild(540, 1380, "200 MIO.+", MAG, WEISS, wort="über", plus=0.2),
]

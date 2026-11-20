# Effekte – nur exakt ausgeschnittene Objekte.
from pathlib import Path
B = Path("/home/user/videostudio/videos/008-gta6-streams/bilder")
M = lambda n: str(B / f"maske_{n}.png")
CYAN, MAG = "#3ff0ff", "#ff4fd8"
EFFEKTE = [
    hervorheben(570, 1095, maske=M("auto"), art="puls", glanz=MAG, wort="gesprengt") + tempo_linien(200, 1150, wort="gesprengt"),
    hervorheben(540, 815, maske=M("bildschirm"), glanz=MAG, wort="acht")
    + schild(540, 1330, "7,9 MIO. GLEICHZEITIG", MAG, WEISS, groesse=54, wort="acht", plus=0.2),
    hervorheben(515, 800, maske=M("play"), art="blink", glanz=CYAN, wort="twitch")
    + schild(540, 1330, "3,3 MIO. AUF TWITCH", CYAN, groesse=54, wort="drei"),
    hervorheben(530, 860, maske=M("handys"), art="blink", glanz=MAG, wort="entspricht")
    + schild(540, 1330, "1.500 JAHRE", MAG, WEISS, wort="entspricht", plus=0.4),
    hervorheben(575, 1290, maske=M("controller"), art="puls", glanz=CYAN, wort="freigenommen")
    + schild(560, 1000, "GTA-GRIPPE", CYAN, wort="gta-grippe"),
    hervorheben(575, 1290, maske=M("controller"), art="blink", glanz=MAG, halten=None, wort="angesteckt"),
]

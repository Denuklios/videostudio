# Effekte – nur exakt ausgeschnittene Objekte, alle Bilder neu für dieses Video.
from pathlib import Path
B = Path("/home/user/videostudio/videos/008-gta6-streams/bilder")
M = lambda n: str(B / f"maske_{n}.png")
CYAN, MAG = "#3ff0ff", "#ff4fd8"
EFFEKTE = [
    hervorheben(540, 900, maske=M("skyline"), art="puls", glanz=MAG, wort="internet")
    + hervorheben(520, 1340, maske=M("highway"), art="blink", glanz=CYAN, wort="gesprengt"),
    hervorheben(540, 720, maske=M("zuschauer"), glanz=CYAN, wort="acht")
    + schild(540, 1380, "7,9 MIO. GLEICHZEITIG", MAG, WEISS, groesse=54, wort="acht", plus=0.2),
    hervorheben(540, 720, maske=M("zuschauer"), art="blink", glanz=MAG, wort="jemals")
    + schild(540, 1380, "3,3 MIO. AUF TWITCH", CYAN, groesse=54, wort="drei"),
    hervorheben(460, 1220, maske=M("snacks"), art="puls", glanz=CYAN, wort="entspricht")
    + schild(540, 1420, "1.500 JAHRE", MAG, WEISS, wort="entspricht", plus=0.4),
    hervorheben(685, 910, maske=M("controller"), art="puls", glanz=CYAN, wort="freigenommen")
    + hervorheben(240, 1320, maske=M("taschentuecher"), art="blink", glanz=MAG, wort="gta-grippe"),
    hervorheben(365, 1570, maske=M("thermometer"), art="blink", glanz=MAG, halten=None, wort="angesteckt"),
]

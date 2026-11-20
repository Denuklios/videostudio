# Effekte je Szene – nur exakt ausgeschnittene Objekte.
from pathlib import Path
B = Path("/home/user/videostudio/videos/006-magen/bilder")
M = lambda n: str(B / f"maske_{n}.png")
CYAN, MAG = "#3ff0ff", "#ff4fd8"
s1 = (hervorheben(565, 980, maske=M("magen"), art="puls", glanz=CYAN, wort="säure")
      if (B / "maske_magen.png").exists() else
      hervorheben(420, 1050, maske=M("essen"), art="puls", glanz=CYAN, wort="säure"))
EFFEKTE = [
    s1,
    hervorheben(420, 1050, maske=M("essen"), art="puls", glanz=MAG, wort="zersetzt")
    + schild(540, 1330, "SALZSÄURE", MAG, WEISS, wort="salzsäure"),
    hervorheben(540, 740, maske=M("schleim"), art="puls", glanz=CYAN, halten=None, wort="schleimschicht"),
    hervorheben(560, 560, maske=M("saeure"), art="blink", glanz=MAG, wort="säure")
    + schild(540, 1330, "BIKARBONAT", CYAN, wort="bikarbonat"),
    hervorheben(512, 990, maske=M("neuzellen"), art="puls", glanz=CYAN, halten=None, wort="erneuert"),
    hervorheben(420, 1050, maske=M("essen"), art="blink", glanz=MAG, halten=None, wort="mitverdaut"),
]

B = Path("/home/user/videostudio/videos/010-gta6-geld/bilder"); M = lambda n: str(B / f"maske_{n}.png")
JUW = (B / "maske_juwelier.png").exists()
EFFEKTE = [
 # 0 Tresor
 (hervorheben(690,1050,maske=M("tresor"),art="puls",glanz=MAG,wort="banküberfall") if (B/"maske_tresor.png").exists() else "")
 + zaehler(540,1300,205000,nach=" $",farbe=MAG,textfarbe=WEISS,groesse=70,wort="zweihundertfünftausend",plus=-0.6),
 # 1 Skyline Kapitel 1
 hervorheben(860,720,maske=M("turm"),art="heben",glanz=CYAN,wort="kapitel")
 + schild(540,1250,"GELD WEG ❌",MAG,WEISS,groesse=60,wort="weg"),
 # 2 Auto
 tempo_linien(160,1000,wort="autos")
 + schild(540,1250,"+ EIN PAAR 1.000 $",CYAN,groesse=56,wort="tausend"),
 # 3 Juwelier
 (hervorheben(760,960,maske=M("juwelier"),art="puls",glanz=CYAN,wort="juweliere") if JUW else "")
 + schild(540,1250,"10.000 – 25.000 $",MAG,WEISS,groesse=60,wort="zehn"),
 # 4 Tresor
 (hervorheben(690,1050,maske=M("tresor"),art="blink",glanz=CYAN,wort="banktresore") if (B/"maske_tresor.png").exists() else "")
 + schild(540,1250,"ENDE KAPITEL 4",CYAN,groesse=56,wort="kapitel"),
 # 5 Dollar
 zaehler(540,1250,205000,nach=" $",farbe=MAG,textfarbe=WEISS,groesse=76,wort="zweihundertfünftausend",plus=-0.6)
 + beben(1.2,0.6,wort="tresor"),
]

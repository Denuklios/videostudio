B = Path("/home/user/videostudio/videos/007-venus/bilder"); M = lambda n: str(B / f"maske_{n}.png")
EFFEKTE = [
 # 1 v4: Erde + Venus
 hervorheben(540,1320,maske=M("venus4"),art="puls",glanz=MAG,wort="venus")
 + schild(540,930,"1 TAG &gt; 1 JAHR",CYAN,groesse=58,wort="länger"),
 # 2 v2: Sonne + Venus, 225 Tage Umlauf
 hervorheben(250,1250,maske=M("sonne"),art="puls",glanz=CYAN,wort="sonne")
 + pfeil(900,980,720,640,biegung=0.45,farbe=CYAN,wort="runde")
 + hervorheben(815,780,maske=M("venus2"),art="blink",glanz=MAG,wort="venus")
 + zaehler(800,1060,225,nach=" TAGE",farbe=MAG,textfarbe=WEISS,groesse=56,wort="225",plus=-0.4),
 # 3 v2: 243 Tage Drehung
 hervorheben(815,780,maske=M("venus2"),art="puls",glanz=CYAN,wort="drehen")
 + zaehler(800,1060,243,nach=" TAGE",farbe=CYAN,groesse=56,wort="243",plus=-0.4)
 + schild(760,1180,"LANGSAMSTER PLANET",MAG,WEISS,groesse=40,wort="langsamer") + beben(wort="langsamer"),
 # 4 v4: dreht rückwärts
 hervorheben(540,1320,maske=M("venus4"),art="blink",glanz=MAG,wort="andersherum")
 + pfeil(760,1060,320,1060,biegung=0.3,farbe=MAG,wort="andersherum",plus=0.3)
 + hervorheben(540,520,maske=M("erde"),art="puls",glanz=CYAN,wort="erde")
 + pfeil(320,860,760,860,biegung=0.3,farbe=CYAN,wort="erde",plus=0.3),
 # 5 v5: Sonne im Westen
 hervorheben(750,745,maske=M("horizont_sonne"),art="puls",glanz=MAG,wort="westen")
 + schild(540,1000,"AUFGANG IM WESTEN",CYAN,groesse=52,wort="westen",plus=0.3),
 # 6 v5: Einschlag?
 hervorheben(750,745,maske=M("horizont_sonne"),art="blink",glanz=CYAN,wort="niemand")
 + hervorheben(165,1370,maske=M("felsen"),art="puls",glanz=MAG,halten=None,wort="einschlag")
 + schild(540,1000,"EINSCHLAG?",MAG,WEISS,groesse=58,wort="einschlag",plus=0.2) + beben(1.4,0.7,wort="einschlag"),
]

B = Path("/home/user/videostudio/videos/009-honig/bilder"); M = lambda n: str(B / f"maske_{n}.png")
EFFEKTE = [
 # 1 Krug aus Ägypten
 hervorheben(540,1050,maske=M("krug"),art="puls",glanz=CYAN,wort="gräbern")
 + zaehler(540,560,3000,vor="ÜBER ",nach=" JAHRE",farbe=MAG,textfarbe=WEISS,groesse=60,wort="dreitausend",plus=-0.5),
 # 2 Wasser
 hervorheben(540,800,maske=M("dipper"),art="heben",glanz=CYAN,wort="siebzehn")
 + zaehler(540,1330,17,nach=" % WASSER",farbe=CYAN,groesse=60,wort="siebzehn",plus=-0.4),
 # 3 sauer
 hervorheben(600,1330,maske=M("glas"),art="puls",glanz=MAG,wort="sauer")
 + schild(540,640,"pH 3,2 – 4,5",MAG,WEISS,groesse=56,wort="orangensaft"),
 # 4 Bienen
 hervorheben(380,560,maske=M("biene"),art="blink",glanz=CYAN,wort="bienen")
 + schild(560,1250,"NATÜRLICHES DESINFEKTIONSMITTEL",MAG,WEISS,groesse=40,wort="desinfektionsmittel",plus=-0.3),
 # 5 Deckel drauf
 hervorheben(480,990,maske=M("glas2"),art="puls",glanz=CYAN,wort="deckel")
 + schild(540,560,"OFFEN = GÄRT",MAG,WEISS,groesse=52,wort="gären")
 + beben(wort="ewig"),
]

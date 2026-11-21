B = Path("/home/user/videostudio/videos/011-gta6-glitches/bilder"); M = lambda n: str(B / f"maske_{n}.png")
FA = (B / "maske_fliegauto.png").exists()
FP = json.loads((B / "fliegauto_pos.json").read_text()) if FA else [540, 960]
EFFEKTE = [
 (hervorheben(FP[0],FP[1],maske=M("fliegauto"),art="puls",glanz=CYAN,wort="glitches") if FA else tempo_linien(160,900,wort="glitches"))
 + schild(540,1300,"2 TAGE NACH RELEASE",MAG,WEISS,groesse=50,wort="zwei"),
 tempo_linien(140,1000,wort="abheben") + beben(1.0,0.5,wort="luft"),
 schild(540,1250,"DURCH WÄNDE 👻",CYAN,groesse=56,wort="wände"),
 hervorheben(620,1260,maske=M("polizei"),art="blink",glanz=MAG,wort="polizei"),
 hervorheben(685,920,maske=M("turm"),art="heben",glanz=CYAN,wort="cyberpunk")
 + schild(540,1300,"CYBERPUNK 2077?",MAG,WEISS,groesse=56,wort="cyberpunk",plus=0.3),
 (hervorheben(FP[0],FP[1],maske=M("fliegauto"),art="blink",glanz=MAG,wort="fliegende") if FA else "")
 + beben(1.2,0.6,wort="lustigsten"),
]

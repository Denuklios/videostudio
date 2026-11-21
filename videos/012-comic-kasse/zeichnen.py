#!/usr/bin/env python3
"""Zeichnet die Comic-Einstellungen (SVG 1080×1920) für „Kalle an der Kasse“.
Danach: node ../../engine/svg2png.js bilder  → PNGs."""
from pathlib import Path

W, H = 1080, 1920
OUT = Path(__file__).parent / "bilder"
OUT.mkdir(exist_ok=True)

HAUT = "#f1c9a5"; HAUT_D = "#d9a77f"; HAAR = "#5a3b22"; HOODIE = "#2f5d50"; HOSE = "#2b2f3a"
FRAU_MANTEL = "#7b4a7a"; FRAU_HAAR = "#c9c4c0"; TASCHE = "#b5652e"
SB = 'stroke="#1d1a17" stroke-linejoin="round" stroke-linecap="round"'
STROKE = SB + ' stroke-width="7"'


def svg(inhalt, bg="#efe6d2"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<rect width="{W}" height="{H}" fill="{bg}"/>{inhalt}</svg>')


def markt():
    """Hintergrund: Regale, Deckenlampen, Fliesenboden."""
    s = '<rect y="0" width="1080" height="1300" fill="#e8dcc4"/>'
    for x in (90, 390, 690, 990):  # Deckenlampen
        s += f'<rect x="{x-80}" y="60" width="160" height="22" rx="8" fill="#fffbe8" {STROKE}/>'
    farben = ["#d9534f", "#f0ad4e", "#5bc0de", "#5cb85c", "#8e6bbf", "#e8e1cf", "#c0392b", "#2c7fb8"]
    for reihe, y in enumerate((260, 470, 680, 890)):
        s += f'<rect x="-10" y="{y+150}" width="1100" height="20" fill="#9a8a73" {STROKE}/>'
        for i in range(14):
            x = 10 + i * 78
            h = 90 + ((i * 37 + reihe * 13) % 50)
            f = farben[(i + reihe * 3) % len(farben)]
            s += f'<rect x="{x}" y="{y+150-h}" width="62" height="{h}" rx="6" fill="{f}" {STROKE}/>'
            s += f'<rect x="{x+12}" y="{y+150-h+20}" width="38" height="18" rx="4" fill="#ffffff" opacity=".75"/>'
    s += '<rect y="1300" width="1080" height="620" fill="#cfc6b6"/>'
    for i in range(12):
        s += f'<line x1="{i*100-200}" y1="1920" x2="{540+(i*100-740)*0.35}" y2="1300" stroke="#b8ae9c" stroke-width="5"/>'
    for y in (1380, 1500, 1660, 1860):
        s += f'<line x1="0" y1="{y}" x2="1080" y2="{y}" stroke="#b8ae9c" stroke-width="5"/>'
    return s


def kasse(x=0, y=1060, display=""):
    s = (f'<g transform="translate({x},{y})">'
         f'<rect x="-40" y="60" width="760" height="300" rx="20" fill="#7d8a96" {STROKE}/>'
         f'<rect x="-40" y="40" width="760" height="60" rx="14" fill="#3a3f47" {STROKE}/>'  # Band
         + "".join(f'<line x1="{i*60-20}" y1="44" x2="{i*60-20}" y2="96" stroke="#555b64" stroke-width="5"/>' for i in range(13))
         + f'<rect x="560" y="-180" width="40" height="230" fill="#555b64" {STROKE}/>'
         f'<rect x="470" y="-300" width="230" height="140" rx="16" fill="#20242b" {STROKE}/>')
    if display:
        s += f'<text x="585" y="-212" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="54" fill="#7CFC9A">{display}</text>'
    return s + "</g>"


def kopf(x, y, s=1.0, laune="normal", blick=0):
    """Kalles Kopf. laune: normal, skeptisch, genervt, wuetend, froh, schock."""
    g = f'<g transform="translate({x},{y}) scale({s})">'
    g += f'<ellipse cx="0" cy="0" rx="150" ry="170" fill="{HAUT}" {STROKE}/>'
    g += f'<ellipse cx="-150" cy="10" rx="26" ry="40" fill="{HAUT}" {STROKE}/><ellipse cx="150" cy="10" rx="26" ry="40" fill="{HAUT}" {STROKE}/>'
    g += f'<path d="M-150 -40 C-160 -180 160 -200 152 -40 C120 -110 60 -120 0 -105 C-60 -125 -120 -100 -150 -40 Z" fill="{HAAR}" {STROKE}/>'
    # Augen
    ay = -5
    for sx in (-55, 55):
        if laune == "schock":
            g += f'<circle cx="{sx}" cy="{ay}" r="30" fill="#fff" {STROKE}/><circle cx="{sx}" cy="{ay}" r="9" fill="#1d1a17"/>'
        elif laune == "froh":
            g += f'<path d="M{sx-24} {ay+6} Q{sx} {ay-22} {sx+24} {ay+6}" fill="none" {STROKE}/>'
        else:
            g += f'<ellipse cx="{sx}" cy="{ay}" rx="20" ry="{14 if laune in ("genervt","wuetend") else 22}" fill="#fff" {STROKE}/><circle cx="{sx+blick}" cy="{ay+2}" r="9" fill="#1d1a17"/>'
    # Brauen
    b = {"normal": (-60, -60, -60, -60), "skeptisch": (-62, -62, -85, -55), "genervt": (-64, -52, -52, -64),
         "wuetend": (-78, -38, -38, -78), "froh": (-70, -68, -68, -70), "schock": (-85, -80, -80, -85)}[laune]
    g += f'<line x1="-85" y1="{b[0]}" x2="-28" y2="{b[1]}" {SB} stroke-width="12"/>'
    g += f'<line x1="28" y1="{b[2]}" x2="85" y2="{b[3]}" {SB} stroke-width="12"/>'
    # Nase
    g += f'<path d="M0 10 Q-14 45 4 52" fill="none" stroke="{HAUT_D}" stroke-width="8" stroke-linecap="round"/>'
    # Mund
    m = {"normal": '<path d="M-38 95 Q0 108 38 95" fill="none" {S}/>',
         "skeptisch": '<path d="M-40 100 L36 88" fill="none" {S}/>',
         "genervt": '<path d="M-40 104 Q0 88 40 104" fill="none" {S}/>',
         "wuetend": '<rect x="-55" y="88" width="110" height="44" rx="10" fill="#fff" {S}/><line x1="-55" y1="110" x2="55" y2="110" {S}/><line x1="-18" y1="88" x2="-18" y2="132" {S}/><line x1="18" y1="88" x2="18" y2="132" {S}/>',
         "froh": '<path d="M-55 85 Q0 140 55 85 Z" fill="#7a1f1f" {S}/>',
         "schock": '<ellipse cx="0" cy="105" rx="30" ry="40" fill="#5a1414" {S}/>'}[laune]
    g += m.replace("{S}", STROKE)
    if laune == "genervt":
        g += '<path d="M150 -90 q14 26 0 40 q-14 -14 0 -40z" fill="#8fd3ff" stroke="#1d1a17" stroke-width="5"/>'
    if laune == "wuetend":
        g += '<ellipse cx="0" cy="60" rx="150" ry="120" fill="#e0533d" opacity=".18"/>'
        for dx in (-110, 0, 110):
            g += f'<path d="M{dx} -200 q-30 -40 0 -80 q30 -40 0 -80" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" opacity=".9"/>'
    if laune == "schock":
        g += '<path d="M-170 -60 q-14 26 0 40 q14 -14 0 -40z" fill="#8fd3ff" stroke="#1d1a17" stroke-width="5"/>'
    return g + "</g>"


def kalle(x, y, s=1.0, laune="normal", korb=True, haende="unten"):
    g = f'<g transform="translate({x},{y}) scale({s})">'
    g += f'<path d="M-120 560 L-100 900 L-20 900 L-10 600 L10 600 L20 900 L100 900 L120 560 Z" fill="{HOSE}" {STROKE}/>'
    g += f'<path d="M-180 220 Q-190 140 -110 120 L110 120 Q190 140 180 220 L170 600 L-170 600 Z" fill="{HOODIE}" {STROKE}/>'
    g += f'<path d="M-60 120 Q0 190 60 120" fill="none" {STROKE}/>'
    if haende == "taschen":  # Taschen nach außen gestülpt
        g += f'<path d="M-175 380 L-245 470 L-160 480 Z" fill="#f4f0e6" {STROKE}/><path d="M175 380 L245 470 L160 480 Z" fill="#f4f0e6" {STROKE}/>'
        g += f'<circle cx="-215" cy="380" r="34" fill="{HAUT}" {STROKE}/><circle cx="215" cy="380" r="34" fill="{HAUT}" {STROKE}/>'
    else:
        g += f'<path d="M-175 230 L-215 520" stroke="{HOODIE}" stroke-width="60" stroke-linecap="round"/><path d="M175 230 L215 520" stroke="{HOODIE}" stroke-width="60" stroke-linecap="round"/>'
        g += f'<circle cx="-215" cy="540" r="34" fill="{HAUT}" {STROKE}/><circle cx="215" cy="540" r="34" fill="{HAUT}" {STROKE}/>'
    if korb:
        g += f'<rect x="150" y="520" width="170" height="110" rx="12" fill="#e2463a" {STROKE}/><path d="M170 520 Q235 430 300 520" fill="none" {STROKE}/>'
        g += f'<rect x="175" y="490" width="40" height="60" fill="#f0ad4e" {STROKE}/><rect x="230" y="480" width="34" height="70" fill="#5bc0de" {STROKE}/>'
    g += kopf(0, -60, 1.0, laune) + "</g>"
    return g


def frau(x, y, s=1.0, wuehlt=False, grinst=False):
    g = f'<g transform="translate({x},{y}) scale({s})">'
    g += f'<path d="M-170 240 Q-180 150 -100 130 L100 130 Q180 150 170 240 L200 900 L-200 900 Z" fill="{FRAU_MANTEL}" {STROKE}/>'
    g += f'<ellipse cx="0" cy="-20" rx="135" ry="150" fill="{HAUT}" {STROKE}/>'
    g += f'<path d="M-140 -10 C-160 -190 160 -190 140 -10 C110 -100 -110 -100 -140 -10Z" fill="{FRAU_HAAR}" {STROKE}/><circle cx="0" cy="-185" r="55" fill="{FRAU_HAAR}" {STROKE}/>'
    g += f'<circle cx="-48" cy="-15" r="38" fill="none" {STROKE}/><circle cx="48" cy="-15" r="38" fill="none" {STROKE}/><line x1="-10" y1="-15" x2="10" y2="-15" {STROKE}/>'
    g += '<circle cx="-48" cy="-12" r="8" fill="#1d1a17"/><circle cx="48" cy="-12" r="8" fill="#1d1a17"/>'
    g += (f'<path d="M-40 70 Q0 110 40 70" fill="none" {STROKE}/>' if grinst else f'<ellipse cx="0" cy="78" rx="18" ry="12" fill="#7a1f1f" {STROKE}/>')
    g += f'<path d="M120 420 Q140 300 260 330 Q330 360 300 500 L330 720 L80 720 Z" fill="{TASCHE}" {STROKE}/>'
    if wuehlt:
        g += f'<path d="M150 260 L230 470" stroke="{FRAU_MANTEL}" stroke-width="58" stroke-linecap="round"/><circle cx="235" cy="480" r="32" fill="{HAUT}" {STROKE}/>'
        for i, (dx, dy, f) in enumerate([(380, 260, "#f0ad4e"), (460, 380, "#5bc0de"), (330, 140, "#ffffff"), (500, 200, "#d9534f")]):
            g += f'<rect x="{dx}" y="{dy}" width="60" height="44" rx="8" fill="{f}" {STROKE} transform="rotate({i*23-20} {dx} {dy})"/>'
    return g + "</g>"


def leute(n, y=980, s=0.75, x0=120):
    g = ""
    for i in range(n):
        x = x0 + i * 220
        c = ["#3d5a80", "#9c6644", "#6a994e", "#bc4749", "#5e548e"][i % 5]
        g += f'<g transform="translate({x},{y}) scale({s})">'
        g += f'<path d="M-150 220 Q-160 140 -90 120 L90 120 Q160 140 150 220 L160 700 L-160 700 Z" fill="{c}" {STROKE}/>'
        g += f'<ellipse cx="0" cy="-20" rx="120" ry="135" fill="{HAUT if i%2 else "#c99a72"}" {STROKE}/>'
        g += f'<path d="M-120 -40 C-120 -170 120 -170 120 -40 C90 -100 -90 -100 -120 -40Z" fill="{["#2b2b2b","#8a5a2b","#d6b36a","#4a3020","#1d1d1d"][i%5]}" {STROKE}/>'
        g += '<line x1="-70" y1="-45" x2="-20" y2="-30" stroke="#1d1a17" stroke-width="11" stroke-linecap="round"/><line x1="70" y1="-45" x2="20" y2="-30" stroke="#1d1a17" stroke-width="11" stroke-linecap="round"/>'
        g += '<circle cx="-42" cy="-5" r="9" fill="#1d1a17"/><circle cx="42" cy="-5" r="9" fill="#1d1a17"/>'
        g += f'<path d="M-35 70 Q0 50 35 70" fill="none" {STROKE}/></g>'
    return g


def uhr(t_min=2):
    g = '<circle cx="540" cy="930" r="330" fill="#fffdf6" stroke="#1d1a17" stroke-width="18"/>'
    for i in range(12):
        import math
        a = math.radians(i * 30)
        g += f'<line x1="{540+math.sin(a)*280}" y1="{930-math.cos(a)*280}" x2="{540+math.sin(a)*310}" y2="{930-math.cos(a)*310}" stroke="#1d1a17" stroke-width="12"/>'
    g += '<line x1="540" y1="930" x2="540" y2="740" stroke="#1d1a17" stroke-width="20" stroke-linecap="round"/>'
    g += f'<line x1="540" y1="930" x2="{540+150}" y2="{930+60}" stroke="#d9534f" stroke-width="12" stroke-linecap="round"/>'
    g += '<circle cx="540" cy="930" r="20" fill="#1d1a17"/>'
    return g


def display_gross(text):
    return (f'<rect x="90" y="620" width="900" height="520" rx="40" fill="#20242b" stroke="#1d1a17" stroke-width="14"/>'
            f'<rect x="140" y="680" width="800" height="400" rx="20" fill="#0d1a12"/>'
            f'<text x="540" y="790" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="60" fill="#7CFC9A">SUMME</text>'
            f'<text x="540" y="960" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="150" fill="#7CFC9A">{text}</text>')


def muenzen():
    g = f'<ellipse cx="540" cy="1080" rx="420" ry="220" fill="{HAUT}" {STROKE}/>'
    for i, (x, y, r) in enumerate([(420, 1040, 55), (540, 1000, 45), (650, 1060, 60), (480, 1130, 40), (600, 1150, 50), (720, 990, 35), (360, 1110, 38)]):
        g += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{"#d4a017" if i%2 else "#c0c0c0"}" {STROKE}/><circle cx="{x}" cy="{y}" r="{r*0.6}" fill="none" stroke="#1d1a17" stroke-width="4" opacity=".5"/>'
    g += f'<path d="M180 980 Q120 820 260 760 L330 900" fill="{HAUT}" {STROKE}/>'
    return g


def terminal_abgelehnt():
    return (f'<rect x="300" y="520" width="480" height="780" rx="50" fill="#33373e" {STROKE}/>'
            f'<rect x="350" y="580" width="380" height="300" rx="18" fill="#2b0d0d"/>'
            f'<path d="M440 650 L640 830 M640 650 L440 830" stroke="#ff4b4b" stroke-width="34" stroke-linecap="round"/>'
            + "".join(f'<rect x="{360+(i%3)*125}" y="{930+(i//3)*95}" width="100" height="72" rx="12" fill="#5a606a" {STROKE}/>' for i in range(9))
            + f'<rect x="200" y="300" width="380" height="240" rx="24" fill="#2c7fb8" {STROKE} transform="rotate(-18 390 420)"/>'
            f'<rect x="250" y="360" width="80" height="60" rx="8" fill="#f0c04e" transform="rotate(-18 390 420)"/>')


EINSTELLUNGEN = {
    "k01_totale": markt() + kasse(-40, 1060, "47,83") + frau(330, 700, 0.8) + kalle(820, 760, 0.7, "normal"),
    "k02_display": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".35"/>' + display_gross("47,83 €"),
    "k03_wuehlt": markt() + kasse(-300, 1150) + frau(420, 720, 1.05, wuehlt=True),
    "k04_skeptisch": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".15"/>' + kopf(540, 960, 2.2, "skeptisch", blick=-6),
    "k05_uhr": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".25"/>' + uhr(),
    "k06_schlange": markt() + leute(4, 1000, 0.72, 160) + kalle(540, 1060, 0.55, "genervt", korb=True),
    "k07_muenzen": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".2"/>' + muenzen(),
    "k08_karte": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".25"/>' + terminal_abgelehnt(),
    "k09_wuetend": markt() + '<rect width="1080" height="1920" fill="#7a1f1f" opacity=".25"/>' + kopf(540, 1000, 2.2, "wuetend"),
    "k10_dran": markt() + kasse(-40, 1060, "") + kalle(520, 760, 0.75, "froh"),
    "k11_display2": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".35"/>' + display_gross("12,90 €"),
    "k12_taschen": markt() + kalle(540, 700, 0.85, "schock", korb=False, haende="taschen"),
    "k13_schock": markt() + leute(4, 1060, 0.62, 140) + kopf(540, 900, 1.9, "schock"),
    "k14_karma": markt() + '<rect width="1080" height="1920" fill="#000" opacity=".3"/>' + frau(540, 820, 1.0, grinst=True),
}

for name, inhalt in EINSTELLUNGEN.items():
    (OUT / f"{name}.svg").write_text(svg(inhalt))
print(len(EINSTELLUNGEN), "SVGs geschrieben")

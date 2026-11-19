#!/usr/bin/env python3
"""Schneidet ein Objekt exakt aus einem Bild aus (Freistell-KI „SAM“ über rembg).

Aufruf:  python3 ausschneiden.py <bild.png> <name> x1,y1,x2,y2 [x1,y1,x2,y2 ...]
  Jeder Rahmen umschließt EIN Objekt bzw. Teil (Bildpixel im 1080×1920-Bild, eher knapp als zu groß).
  Mehrere Rahmen = mehrere Teile in einer Maske (z. B. zwei Herzen).
Schreibt neben das Bild: maske_<name>.png (weißes Objekt auf Schwarz, weiche Kante)
                        maske_<name>_inv.png (umgekehrt, für das Abdunkeln)
                        maske_<name>_check.jpg (Kontrollbild: Objekt magenta eingefärbt – ANSEHEN!)
"""
import os, sys
from pathlib import Path
os.environ.setdefault("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt")
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage

bild, name, rahmen = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
im = Image.open(bild).convert("RGB")
sitzung = new_session("sam")
gesamt = np.zeros((im.height, im.width), bool)
for r in rahmen:
    x1, y1, x2, y2 = map(int, r.split(","))
    m = np.array(remove(im, session=sitzung, only_mask=True,
                        sam_prompt=[{"type": "rectangle", "data": [x1, y1, x2, y2], "label": 1}])) > 127
    innen = np.zeros_like(m); innen[y1:y2, x1:x2] = True
    m &= innen  # nichts außerhalb des Rahmens
    if m.sum() == 0:
        print(f"WARNUNG: Rahmen {r} ergab nichts"); continue
    lab, n = ndimage.label(m)
    groesste = np.argmax(np.bincount(lab.ravel())[1:]) + 1
    teil = ndimage.binary_fill_holes(ndimage.binary_closing(lab == groesste, iterations=3))
    gesamt |= teil
maske = Image.fromarray((gesamt * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2.5))
ziel = bild.parent / f"maske_{name}.png"
maske.save(ziel)
Image.eval(maske, lambda v: 255 - v).save(bild.parent / f"maske_{name}_inv.png")
check = Image.composite(Image.blend(im, Image.new("RGB", im.size, (255, 0, 255)), 0.55), im, maske)
check.resize((540, 960)).save(bild.parent / f"maske_{name}_check.jpg", quality=80)
print(f"{ziel.name}: {gesamt.mean()*100:.1f}% des Bildes")

// „Etwas auf dem Kerbholz haben“ — Paper Pop-up Book, 1080×1920 (Serie „Woher kommt das?“, Folge 2)
import { basis, THREE, A, sh, crescent, INK, paperFill, mulberry, track, seg, eio, back, lerp, clamp, menschKarte, schild, TAU } from './basis.js';

const HOLZ = '#c9935a', HOLZ_D = '#9a6a38';
const B = await basis({
  coverZeilen: [['italic 96px "IM Fell English"', 'Woher kommt', .24], ['160px "Lilita One"', '»Etwas auf dem', .43], ['230px "Lilita One"', 'Kerbholz', .63], ['170px "Lilita One"', 'haben«?', .80]],
  coverIcon: (x, px, py, w, h) => {      // Holzstab mit Kerben
    x.save(); x.translate(px, py + h * .35); x.fillStyle = HOLZ; x.strokeStyle = INK; x.lineWidth = 10;
    x.beginPath(); x.roundRect(0, 0, w, h * .22, 20); x.fill(); x.stroke();
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(w * (.15 + i * .13), 0); x.lineTo(w * (.15 + i * .13), h * .22); x.lineWidth = 12; x.stroke(); }
    x.restore();
  },
  boden: (x, w, h) => {                  // Dielenboden der Wirtsstube
    paperFill(x, w, h, '#b98a5a', 4, .06); x.strokeStyle = '#8a5f36'; x.lineWidth = 8;
    for (let i = 1; i < 9; i++) { x.beginPath(); x.moveTo(0, i * h / 9); x.lineTo(w, i * h / 9); x.stroke(); }
    const R = mulberry(2); for (let i = 0; i < 40; i++) { const yy = Math.floor(R() * 9) * h / 9, xx = R() * w; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy + h / 9); x.stroke(); }
  },
  himmel: (x, w, h) => {                 // Wand der Wirtsstube mit Fenster, Regal und Krügen
    paperFill(x, w, h, '#e8c99a', 5, .05);
    x.strokeStyle = '#b48852'; x.lineWidth = 6; for (let i = 1; i < 14; i++) { x.beginPath(); x.moveTo(i * w / 14, 0); x.lineTo(i * w / 14, h); x.stroke(); }
    x.fillStyle = '#9fd0e8'; x.fillRect(w * .62, h * .18, w * .24, h * .32); x.lineWidth = 14; x.strokeStyle = INK; x.strokeRect(w * .62, h * .18, w * .24, h * .32);
    x.beginPath(); x.moveTo(w * .74, h * .18); x.lineTo(w * .74, h * .5); x.moveTo(w * .62, h * .34); x.lineTo(w * .86, h * .34); x.stroke();
    x.fillStyle = '#8a5f36'; x.fillRect(w * .08, h * .42, w * .4, 26); x.strokeRect(w * .08, h * .42, w * .4, 26);
    for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? '#7a8a9a' : '#c98a4a'; x.beginPath(); x.roundRect(w * (.1 + i * .075), h * .42 - 110, 70, 110, 14); x.fill(); x.lineWidth = 9; x.stroke(); }
  },
});
const { popper, figur, zeige, renderBasis, logoItem, K, DUR } = B;

// ---------- Figuren und Dinge ----------
const wirt = popper(menschKarte({ schuerze: '#f4efe2', bart: '#6b4a2e', rock: '#a0522d', rockS: '#7a3d20', haar: '#6b4a2e', arm: [.2, -.6] }), -.085, 0, .19);
const wirtB = popper(menschKarte({ schuerze: '#f4efe2', bart: '#6b4a2e', rock: '#a0522d', rockS: '#7a3d20', haar: '#6b4a2e', arm: [.2, 2.4], boese: true }), -.085, 0, .19);
const krug = (x, hx, hy) => { x.beginPath(); x.roundRect(hx - 20, hy - 60, 44, 60, 8); sh(x, '#c98a4a', 8); };
const gast = popper(menschKarte({ spiegel: true, hut: '#4a3a6a', rock: '#4a6aa0', rockS: '#344e7a', haar: '#3a2a20', arm: [.2, 1.2], hand: krug }), .085, 0, .19);
const tisch = popper(A.cut(.11, .035, (x, w, h) => { x.fillRect(0, 0, w, h * .25); sh(x, '#8a5f36', 10); x.fillRect(w * .1, 0, w * .08, h); x.fillRect(w * .82, 0, w * .08, h); sh(x, '#8a5f36', 10); }, { pad: 20, border: 12 }), 0, 0, .14);
const fass = (sx) => A.cut(.04, .05, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, TAU); crescent(x, () => { x.beginPath(); x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, TAU); }, '#7a4f2a', 20, 0, '#a8723f'); x.beginPath(); x.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, TAU); sh(x, null, 12); x.strokeStyle = '#555'; x.lineWidth = 10; for (const f of [.25, .75]) { x.beginPath(); x.moveTo(0, h * f); x.lineTo(w, h * f); x.stroke(); } }, { pad: 20, border: 12 });
const faesser = [popper(fass(), -.19, 0, .08), popper(fass(), .19, 0, .07), popper(fass(), .2, 0, .12)];

// Kerbholz: zwei Hälften (oben/unten), Kerben als eigene Karten auf beiden Hälften
const LANG = .15, DICK = .011;
const haelfte = (oben) => A.cut(LANG, DICK, (x, w, h) => { x.beginPath(); x.roundRect(0, 0, w, h, oben ? [20, 20, 4, 4] : [4, 4, 20, 20]); sh(x, HOLZ, 10);
  x.strokeStyle = HOLZ_D; x.lineWidth = 4; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(10, h * (.2 + i * .12)); x.bezierCurveTo(w * .3, h * (.15 + i * .12), w * .7, h * (.3 + i * .1), w - 10, h * (.2 + i * .12)); x.stroke(); } }, { pad: 14, border: 10 });
const kerbe = A.cut(.004, DICK * .9, (x, w, h) => { x.fillStyle = '#4a2e18'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w * .6, h); x.lineTo(w * .4, h); x.closePath(); x.fill(); }, { pad: 4, border: 0, raw: true });
const STAB_Y = .06, STAB_Z = .23;
const oben = new THREE.Group(), unten = new THREE.Group();
const { cutMesh } = await import('./cutmesh.js');
oben.add(cutMesh(haelfte(true))); unten.add(cutMesh(haelfte(false)));
const KX = [-.05, -.03, -.01, .01, .03, .05];
const kerbenO = KX.map(x => { const m = cutMesh(kerbe, { shadow: false }); m.position.set(x, -DICK * .45, .0012); oben.add(m); return m; });
const kerbenU = KX.map(x => { const m = cutMesh(kerbe, { shadow: false }); m.position.set(x, -DICK * .05, .0012); unten.add(m); return m; });
for (const g of [oben, unten]) { g.visible = false; B.book.stage.add(g); }
const spruch = popper(schild('Etwas auf dem Kerbholz!', .12), 0, 0, .27);
const logo = popper(logoItem, -.05, .0, .21);
const wds = popper(schild("Wusstest du's?", .085), .055, 0, .23);

// ---------- Zeitplan ----------
const OPEN0 = K.l2 - .1, RAUM0 = OPEN0 + 1.2, STAB0 = K.l3, KERB0 = K.l3 + 1.0, SPALT0 = K.l4 + .3, ZUS0 = K.l5 + .2, SPRUCH0 = K.l6 + 1.6, END0 = K.l7 - .2;
[tisch, ...faesser].forEach((p, i) => { p.rise = RAUM0 + i * .12; p.fold = END0; });
wirt.rise = RAUM0 + .5; wirt.fold = SPRUCH0 - .1; wirtB.rise = SPRUCH0; wirtB.fold = END0;
gast.rise = RAUM0 + .7; gast.fold = END0;

spruch.rise = SPRUCH0; spruch.fold = END0; logo.rise = END0 + .5; wds.rise = END0 + .3;
window.EV = [{ t: OPEN0, type: 'creak' }, ...B.pops.filter(p => p.rise < 1e8).map(p => ({ t: p.rise, type: 'pop' })),
  ...KX.map((_, i) => ({ t: KERB0 + i * .28, type: 'knife' })), { t: SPALT0 + .1, type: 'crack' }, { t: ZUS0 + 1.1, type: 'pling' }];

const CAM = track([
  [0, [.05, .78, .44, .05, .0, .155]], [OPEN0 - .2, [.05, .76, .46, .05, .0, .155]],
  [RAUM0 + 1.4, [0, .2, .85, 0, .06, .13]],
  [STAB0 + .8, [0, .11, .62, 0, .06, .21]],
  [SPALT0 + .2, [0, .11, .64, 0, .06, .21]],
  [SPALT0 + 1.6, [0, .15, .9, 0, .07, .2]],
  [ZUS0 + 1.4, [0, .11, .64, 0, .06, .21]],
  [SPRUCH0 + .6, [0, .16, .85, 0, .07, .2]],
  [END0 + 1.2, [0, .2, .72, 0, .06, .2]], [DUR, [0, .2, .7, 0, .06, .2]],
]);

window.DUR = DUR;
window.render = t => {
  // Kerbholz: erscheint, bekommt Kerben, wird gespalten, Hälften zum Wirt / Gast, später wieder zusammen
  const k = back(seg(t, STAB0, STAB0 + .45), 1.6) * (1 - eio(seg(t, SPRUCH0 - .2, SPRUCH0 + .2)));
  oben.visible = unten.visible = k > .002;
  KX.forEach((_, i) => { const s = clamp((t - KERB0 - i * .28) / .12); kerbenO[i].visible = kerbenU[i].visible = s > 0; kerbenO[i].scale.set(1, Math.max(.01, s), 1); kerbenU[i].scale.set(1, Math.max(.01, s), 1); });
  const sp = eio(seg(t, SPALT0, SPALT0 + 1.2)), zu = eio(seg(t, ZUS0, ZUS0 + 1.0));
  const weg = sp * (1 - zu), auf = Math.sin(Math.PI * clamp(seg(t, SPALT0, SPALT0 + .5))) * (1 - zu);
  oben.position.set(lerp(0, -.055, weg), STAB_Y + .012 * auf + .004 * weg, STAB_Z);
  unten.position.set(lerp(0, .055, weg), STAB_Y - .004 * weg, STAB_Z);
  for (const g of [oben, unten]) { g.rotation.x = -(Math.PI / 2) * (1 - Math.min(1, k)); g.scale.setScalar(1 + .06 * Math.sin(Math.PI * clamp((t - ZUS0 - 1) / .3))); }
  renderBasis(t, CAM, OPEN0);
};
window.READY = true;

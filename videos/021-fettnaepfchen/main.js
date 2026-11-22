// „Ins Fettnäpfchen treten“ — Paper Pop-up Book, 1080×1920 (Serie „Woher kommt das?“, Folge 3)
import { basis, THREE, A, sh, crescent, INK, paperFill, mulberry, track, seg, eio, back, lerp, clamp, menschKarte, schild, TAU, blob } from './basis.js';
import { cutMesh } from './cutmesh.js';

const B = await basis({
  coverZeilen: [['italic 96px "IM Fell English"', 'Woher kommt', .24], ['190px "Lilita One"', '»Ins', .43], ['210px "Lilita One"', 'Fettnäpfchen', .63], ['170px "Lilita One"', 'treten«?', .80]],
  coverIcon: (x, px, py, w, h) => {       // Napf mit Fett
    x.save(); x.translate(px + w * .15, py + h * .4); x.lineWidth = 10; x.strokeStyle = INK;
    x.fillStyle = '#8a6a4a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w * .7, 0); x.lineTo(w * .6, h * .3); x.lineTo(w * .1, h * .3); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#f3e3a8'; x.beginPath(); x.ellipse(w * .35, 0, w * .35, h * .07, 0, 0, TAU); x.fill(); x.stroke(); x.restore();
  },
  boden: (x, w, h) => {                   // Steinfliesen
    paperFill(x, w, h, '#d8cbb2', 4, .06); x.strokeStyle = '#a89878'; x.lineWidth = 7;
    for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(0, i * h / 8); x.lineTo(w, i * h / 8); x.stroke(); }
    for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo(i * w / 12, 0); x.lineTo(i * w / 12, h); x.stroke(); }
  },
  himmel: (x, w, h) => {                  // Bauernhaus-Wand: Putz, Fachwerk, Tür links, Kachelofen rechts
    paperFill(x, w, h, '#f4ecdc', 5, .04);
    x.fillStyle = '#7a4f2a'; for (const [a, b, c, d] of [[0, h * .12, w, 34], [w * .3, 0, 34, h], [w * .62, 0, 34, h]]) x.fillRect(a, b, c, d);
    x.strokeStyle = INK; x.lineWidth = 10; x.fillStyle = '#9a6a38'; x.beginPath(); x.roundRect(w * .07, h * .3, w * .17, h * .7, [60, 60, 0, 0]); x.fill(); x.stroke();
    x.fillStyle = '#e0b456'; x.beginPath(); x.arc(w * .21, h * .66, 16, 0, TAU); x.fill(); x.stroke();
    x.fillStyle = '#5f9a78'; x.beginPath(); x.roundRect(w * .72, h * .32, w * .2, h * .68, 24); x.fill(); x.stroke();
    x.strokeStyle = '#3f7a5a'; x.lineWidth = 6; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(w * .72, h * (.32 + i * .11)); x.lineTo(w * .92, h * (.32 + i * .11)); x.stroke(); }
    x.fillStyle = '#9fd0e8'; x.fillRect(w * .4, h * .2, w * .14, h * .22); x.lineWidth = 10; x.strokeStyle = INK; x.strokeRect(w * .4, h * .2, w * .14, h * .22);
  },
});
const { popper, figur, zeige, renderBasis, logoItem, K, DUR } = B;

// ---------- Dinge ----------
const napf = popper(A.cut(.03, .016, (x, w, h) => { x.beginPath(); x.moveTo(0, h * .25); x.lineTo(w, h * .25); x.lineTo(w * .85, h); x.lineTo(w * .15, h); x.closePath(); sh(x, '#8a6a4a', 10);
  x.beginPath(); x.ellipse(w / 2, h * .25, w / 2, h * .2, 0, 0, TAU); sh(x, '#f3e3a8', 8); }, { pad: 16, border: 10 }), -.03, 0, .2);
const stiefel = popper(A.cut(.028, .028, (x, w, h) => { for (const ox of [0, w * .5]) { x.beginPath(); x.moveTo(ox + w * .05, 0); x.lineTo(ox + w * .3, 0); x.lineTo(ox + w * .32, h * .75); x.lineTo(ox + w * .45, h * .8); x.lineTo(ox + w * .45, h); x.lineTo(ox + w * .05, h); x.closePath(); sh(x, '#4a3020', 9); } }, { pad: 16, border: 10 }), .0, 0, .215);
const bank = popper(A.cut(.08, .022, (x, w, h) => { x.fillRect(0, 0, w, h * .3); sh(x, '#9a6a38', 10); x.fillRect(w * .08, 0, w * .08, h); x.fillRect(w * .84, 0, w * .08, h); sh(x, '#9a6a38', 10); }, { pad: 16, border: 10 }), .11, 0, .1);
// Gast (geht nach rechts), Bäuerin (schaut nach links)
const gastO = { hut: '#5a5a3a', rock: '#7a6a4a', rockS: '#5a4a30', hose: '#3a3a4a', haar: '#3a2a20' };
const GAST = figur({ steh: menschKarte({ ...gastO }), a: menschKarte({ ...gastO, bein: [.35, -.35] }), b: menschKarte({ ...gastO, bein: [-.35, .35] }), oh: menschKarte({ ...gastO, arm: [.2, 2.6] }) });
const frauO = { spiegel: true, haube: '#f4efe2', haar: '#a0522d', zopf: true, rock: '#b5434a', rockS: '#8a2f36', kleid: true, schuerze: '#f4efe2', hose: '#b5434a' };
const FRAU = figur({ ruhig: menschKarte({ ...frauO }), boese: menschKarte({ ...frauO, boese: true, arm: [.2, 2.7] }) });
// Fettspritzer und Fußabdrücke
const tropfen = A.cut(.006, .008, (x, w, h) => { blob(x, w / 2, h / 2, w / 2, h / 2, .1, 3); sh(x, '#f3e3a8', 6); }, { pad: 8, border: 6 });
const spritzer = Array.from({ length: 7 }, (_, i) => { const m = cutMesh(tropfen, { shadow: false }); m.visible = false; B.book.stage.add(m); return m; });
const abdruck = A.cut(.012, .02, (x, w, h) => { x.fillStyle = 'rgba(120,90,40,.75)'; x.beginPath(); x.ellipse(w / 2, h * .35, w * .45, h * .33, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(w / 2, h * .82, w * .35, h * .17, 0, 0, TAU); x.fill(); }, { pad: 4, border: 0, raw: true });
const spuren = [0, 1, 2, 3, 4].map(i => { const m = cutMesh(abdruck, { shadow: false }); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.PI / 2; m.position.set(-.005 + i * .022, .0006, .2 + (i % 2 ? .008 : -.008)); m.visible = false; B.book.stage.add(m); return m; });
const spruch = popper(schild('Ins Fettnäpfchen getreten!', .12), 0, 0, .27);
const logo = popper(logoItem, -.05, .0, .21);
const wds = popper(schild("Wusstest du's?", .085), .055, 0, .23);

// ---------- Zeitplan ----------
const OPEN0 = K.l2 - .1, RAUM0 = OPEN0 + 1.2, NAPF0 = K.l2 + 1.6, STIEF0 = K.l3 + .3, GEH0 = K.l4, TRITT = K.l4 + 1.4, FRAU0 = RAUM0 + .6, BOESE = K.l5, SPRUCH0 = K.l6 + .4, END0 = K.l7 - .2;
bank.rise = RAUM0; bank.fold = END0; napf.rise = NAPF0; napf.fold = END0; stiefel.rise = STIEF0; stiefel.fold = GEH0;
spruch.rise = SPRUCH0; spruch.fold = END0; logo.rise = END0 + .5; wds.rise = END0 + .3;
window.EV = [{ t: OPEN0, type: 'creak' }, ...B.pops.filter(p => p.rise < 1e8).map(p => ({ t: p.rise, type: 'pop' })), { t: TRITT, type: 'splat' }, { t: BOESE, type: 'pop' }];

const CAM = track([
  [0, [.05, .78, .44, .05, .0, .155]], [OPEN0 - .2, [.05, .76, .46, .05, .0, .155]],
  [RAUM0 + 1.2, [0, .2, .85, 0, .06, .13]],
  [STIEF0 + .4, [-.02, .09, .5, -.02, .03, .2]],              // Napf + Stiefel nah
  [GEH0 + .3, [-.06, .1, .58, -.06, .04, .2]],
  [TRITT + .3, [-.01, .1, .62, -.01, .045, .2]],              // der Tritt
  [BOESE + .4, [.03, .13, .74, .03, .06, .18]],                // Gast + Bäuerin
  [SPRUCH0 + .6, [0, .16, .85, 0, .07, .2]],
  [END0 + 1.2, [0, .2, .72, 0, .06, .2]], [DUR, [0, .2, .7, 0, .06, .2]],
]);

window.DUR = DUR;
window.render = t => {
  // Gast: kommt durch die Tür, geht nach rechts, tritt in den Napf, geht weiter (Fettspuren)
  if (t > RAUM0 + .8 && t < END0) {
    let x = -.17, pose = 'steh';
    if (t > GEH0) { const u = seg(t, GEH0, TRITT + 1.6); x = lerp(-.17, .05, u); pose = u > 0 && u < 1 ? (Math.floor(t * 6) % 2 ? 'a' : 'b') : 'steh'; }
    if (t > BOESE) pose = 'oh';
    zeige(GAST, pose, x, 0, .2, back(seg(t, RAUM0 + .8, RAUM0 + 1.2), 1.6));
  } else zeige(GAST, null);
  zeige(FRAU, t < BOESE ? 'ruhig' : 'boese', .13, 0, .19, back(seg(t, FRAU0, FRAU0 + .4), 1.6) * (1 - eio(seg(t, END0, END0 + .4))));
  const sp = seg(t, TRITT, TRITT + .7);
  spritzer.forEach((m, i) => { const a = -Math.PI * (.15 + i * .1); m.visible = sp > 0 && sp < 1; m.position.set(-.03 + Math.cos(a) * .03 * sp, .012 + Math.sin(Math.PI * sp) * .025 * (1 + i % 3 * .3), .205); });
  spuren.forEach((m, i) => { m.visible = t > TRITT + .3 + i * .25 && t < END0; });
  renderBasis(t, CAM, OPEN0);
};
window.READY = true;

// „Den Löffel abgeben“ — Paper Pop-up Book, 1080×1920 (Serie „Woher kommt das?“, Folge 4)
import { basis, THREE, A, sh, crescent, INK, paperFill, mulberry, track, seg, eio, back, lerp, clamp, menschKarte, schild, TAU, blob } from './basis.js';
import { cutMesh } from './cutmesh.js';

const HOLZ = '#c9935a';
const loeffelZeichnen = (x, w, h) => {      // Holzlöffel: Laffe oben, Stiel nach unten
  x.beginPath(); x.ellipse(w / 2, h * .2, w * .42, h * .19, 0, 0, TAU); sh(x, HOLZ, 9);
  x.beginPath(); x.ellipse(w / 2, h * .2, w * .26, h * .11, 0, 0, TAU); x.fillStyle = '#a8723f'; x.fill();
  x.beginPath(); x.roundRect(w * .43, h * .36, w * .14, h * .62, 10); sh(x, HOLZ, 9);
};
const B = await basis({
  coverZeilen: [['italic 96px "IM Fell English"', 'Woher kommt', .24], ['165px "Lilita One"', '»Den Löffel', .45], ['210px "Lilita One"', 'abgeben«?', .68]],
  coverIcon: (x, px, py, w, h) => { x.save(); x.translate(px + w * .3, py + h * .05); x.rotate(.5); loeffelZeichnen(x, w * .35, h * .9); x.restore(); },
  boden: (x, w, h) => {                    // Stroh auf festgestampftem Boden
    paperFill(x, w, h, '#d9c08a', 4, .07); const R = mulberry(6); x.strokeStyle = '#b89a5a'; x.lineWidth = 5; x.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const px = R() * w, py = R() * h, a = R() * 3; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 40, py + Math.sin(a) * 40); x.stroke(); }
  },
  himmel: (x, w, h) => {                   // Steinwand mit Feuerstelle und Kessel
    paperFill(x, w, h, '#b8aa96', 5, .05); x.strokeStyle = '#8a7c6a'; x.lineWidth = 7;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) { x.strokeRect(c * w / 8 - (r % 2) * w / 16, r * h / 10, w / 8, h / 10); }
    x.fillStyle = '#3a2a20'; x.strokeStyle = INK; x.lineWidth = 12; x.beginPath(); x.roundRect(w * .55, h * .45, w * .32, h * .55, [80, 80, 0, 0]); x.fill(); x.stroke();
    const g = x.createRadialGradient(w * .71, h * .92, 10, w * .71, h * .92, w * .16); g.addColorStop(0, '#ffd36a'); g.addColorStop(.5, '#ff8a3a'); g.addColorStop(1, 'rgba(255,90,30,0)');
    x.fillStyle = g; x.fillRect(w * .55, h * .6, w * .32, h * .4);
    x.fillStyle = '#2a2a2a'; x.beginPath(); x.arc(w * .71, h * .78, w * .07, 0, Math.PI); x.fill(); x.stroke();
    x.fillStyle = '#9fd0e8'; x.fillRect(w * .15, h * .2, w * .14, h * .2); x.lineWidth = 10; x.strokeStyle = INK; x.strokeRect(w * .15, h * .2, w * .14, h * .2);
  },
});
const { popper, figur, zeige, renderBasis, logoItem, K, DUR } = B;

// ---------- Dinge und Figuren ----------
const tisch = popper(A.cut(.13, .034, (x, w, h) => { x.fillRect(0, 0, w, h * .25); sh(x, '#8a5f36', 10); x.fillRect(w * .08, 0, w * .07, h); x.fillRect(w * .85, 0, w * .07, h); sh(x, '#8a5f36', 10); }, { pad: 20, border: 12 }), 0, 0, .13);
const topf = popper(A.cut(.045, .03, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h * .55, w / 2, h * .45, 0, 0, TAU); crescent(x, () => { x.beginPath(); x.ellipse(w / 2, h * .55, w / 2, h * .45, 0, 0, TAU); }, '#555', 20, 0, '#7a7a7a'); x.beginPath(); x.ellipse(w / 2, h * .55, w / 2, h * .45, 0, 0, TAU); sh(x, null, 10);
  x.beginPath(); x.ellipse(w / 2, h * .2, w * .4, h * .1, 0, 0, TAU); sh(x, '#d9a05a', 8); }, { pad: 16, border: 10 }), 0, .034, .135);
const loeffelIn = (x, hx, hy) => { x.save(); x.translate(hx - 18, hy - 70); loeffelZeichnen(x, 36, 90); x.restore(); };
const mutter = popper(menschKarte({ haube: '#f4efe2', haar: '#a0522d', rock: '#6a7ab5', rockS: '#4a5a8a', kleid: true, arm: [.2, 1.0], hand: loeffelIn }), -.085, 0, .17);
const kind = popper(menschKarte({ spiegel: true, haar: '#e0b456', rock: '#b5434a', rockS: '#8a2f36', arm: [.2, 1.0], hand: loeffelIn }), .09, 0, .17, 1e9, { s: .78 });
const ALT = figur({ halt: menschKarte({ haar: '#dcdcdc', bart: '#e8e8e8', rock: '#7a5a3a', rockS: '#5a4028', arm: [.2, 1.35], hand: loeffelIn }), leer: menschKarte({ haar: '#dcdcdc', bart: '#e8e8e8', rock: '#7a5a3a', rockS: '#5a4028', arm: [.2, 1.35] }) });
const JUNG = figur({ leer: menschKarte({ spiegel: true, haar: '#6b4a2e', rock: '#4a8a5a', rockS: '#2f6a44', arm: [.2, 1.35] }), halt: menschKarte({ spiegel: true, haar: '#6b4a2e', rock: '#4a8a5a', rockS: '#2f6a44', arm: [.2, 1.35], hand: loeffelIn }) });
const grosserLoeffel = popper(A.cut(.03, .075, loeffelZeichnen, { pad: 20, border: 14 }), 0, .0, .245);
const wandernd = cutMesh(A.cut(.009, .022, loeffelZeichnen, { pad: 8, border: 6 })); wandernd.visible = false; B.book.stage.add(wandernd);
const kerze = popper(A.cut(.012, .04, (x, w, h) => { x.beginPath(); x.roundRect(w * .2, h * .35, w * .6, h * .65, 6); sh(x, '#f4efe2', 8); x.beginPath(); x.ellipse(w / 2, h * .2, w * .25, h * .16, 0, 0, TAU); sh(x, '#ffcf5a', 6); }, { pad: 12, border: 8 }), -.15, 0, .23, 1e9, { sway: .04 });
const spruch = popper(schild('Den Löffel abgegeben', .12), 0, 0, .27);
const logo = popper(logoItem, -.052, .0, .21);
const wds = popper(schild('Welche als Nächstes?', .095), .05, 0, .23);

// ---------- Zeitplan ----------
const OPEN0 = K.l2 - .1, RAUM0 = OPEN0 + 1.2, FAM0 = K.l2 + 1.4, GROSS0 = K.l3 + .2, ALT0 = K.l4 - .2, GABE = K.l4 + .9, GEHT = K.l4 + 2.3, SPRUCH0 = K.l5 + 1.5, END0 = K.l7 - .2;
[tisch, topf].forEach((p, i) => { p.rise = RAUM0 + i * .15; p.fold = ALT0; });
mutter.rise = FAM0; kind.rise = FAM0 + .25; mutter.fold = kind.fold = ALT0;
grosserLoeffel.rise = GROSS0; grosserLoeffel.fold = ALT0 - .2;
kerze.rise = ALT0 + .3; kerze.fold = END0;
spruch.rise = SPRUCH0; spruch.fold = END0; logo.rise = END0 + .5; wds.rise = END0 + .3;
window.EV = [{ t: OPEN0, type: 'creak' }, ...B.pops.filter(p => p.rise < 1e8).map(p => ({ t: p.rise, type: 'pop' })), { t: GABE + .9, type: 'pling' }];

const CAM = track([
  [0, [.05, .78, .44, .05, .0, .155]], [OPEN0 - .2, [.05, .76, .46, .05, .0, .155]],
  [RAUM0 + 1.4, [0, .19, .85, 0, .06, .13]],                  // Familie am Tisch
  [GROSS0 + .5, [0, .1, .55, 0, .045, .22]],                  // der eigene Löffel
  [ALT0 + .6, [0, .13, .72, 0, .06, .19]],                    // Alter und Junger
  [GEHT + .6, [0, .13, .72, 0, .06, .19]],
  [SPRUCH0 + .6, [0, .16, .85, 0, .07, .2]],
  [END0 + 1.2, [0, .2, .82, 0, .06, .2]], [DUR, [0, .2, .8, 0, .06, .2]],
]);

window.DUR = DUR;
window.render = t => {
  // Der Alte reicht seinen Löffel dem Jungen und klappt danach sanft ein
  const kA = back(seg(t, ALT0, ALT0 + .4), 1.6) * (1 - eio(seg(t, GEHT, GEHT + .9)));
  const kJ = back(seg(t, ALT0 + .2, ALT0 + .6), 1.6) * (1 - eio(seg(t, END0, END0 + .4)));
  const u = seg(t, GABE, GABE + .9);
  zeige(ALT, u > 0 ? 'leer' : 'halt', -.05, 0, .2, kA);
  zeige(JUNG, u >= 1 ? 'halt' : 'leer', .055, 0, .2, kJ);
  wandernd.visible = u > 0 && u < 1;
  if (wandernd.visible) wandernd.position.set(lerp(-.05 + .033, .055 - .033, eio(u)), .066 + Math.sin(Math.PI * u) * .012, .201);
  renderBasis(t, CAM, OPEN0);
};
window.READY = true;

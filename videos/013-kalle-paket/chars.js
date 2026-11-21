// chars.js — Kalle (nervös, Hoodie) und Rudi (Saugroboter mit Stielauge, deadpan) + Requisiten
// Lokale Koordinaten: Ursprung an den Füßen, y nach unten.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  skin: '#f2c49b', skinS: '#d79e74', hair: '#5a3620', hairS: '#3f2414',
  hood: '#3f8a62', hoodS: '#2c6547', jeans: '#3e4f7a', jeansS: '#2d3a5c', shoe: '#f4f1ea', sole: '#ff7a3d',
  mouthIn: '#4a1a2a', tongue: '#e8637a', white: '#ffffff',
  rudi: '#cfd5de', rudiS: '#a3abb8', rudiDark: '#3a3f4b', led: '#2ec4b6',
  card: '#ffd84d', cardS: '#e8b923', box: '#c98b4f', boxS: '#a56c37', tape: '#e9d9a8',
};

// —— Gesicht ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 5, skin = PAL.skin, lw = 6, jitter = 0, lower = 0 } = {}) {
  shape(ell(cx, cy, rx, ry, 34), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.4, cy - ry * 1.5], [cx + rx * 1.4, cy - ry * 1.5], [cx + rx * 1.4, yl], [cx - rx * 1.4, yl + ry * .06]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .06], [cx + rx * 1.2, yl]], lw); }
      if (lower > 0) { const yb = cy + ry - lower * 2 * ry; fillOnly([[cx - rx * 1.4, yb], [cx + rx * 1.4, yb], [cx + rx * 1.4, cy + ry * 1.5], [cx - rx * 1.4, cy + ry * 1.5]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yb], [cx + rx * 1.2, yb]], lw * .8); }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6 } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  shape([...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)], {
    fill: PAL.mouthIn, lw, shade: () => {
      if (o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .3 + 6), PAL.white, { boil: .3 });
      fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 18), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 17, col = PAL.skin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
const drop = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— Kalle ——
// P: x,y,s,face,t, nerv, look, lid, brow (-1 wütend … 1 besorgt), mouth{o,w,sm}, armL/armR {h:[dx,dy],bend,fist}, legL/legR, lean, headTilt, sq, sweat, hold(fn)
export function kalle(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0, C = { hood: P.hood || PAL.hood, hoodS: P.hoodS || PAL.hoodS, jeans: P.jeans || PAL.jeans };
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 7 * ner : 0;
  push(); translate(P.x + jit, P.y); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const legL = P.legL || [0, 0], legR = P.legR || [0, 0];
  for (const [sx, lg] of [[-1, legL], [1, legR]]) {
    const hip = [sx * 26, -110], ank = [sx * 30 + lg[0], -20 + lg[1]];
    shape(noodle(hip, ank, sx * 4, 40, 34), { fill: C.jeans, lw: 6, shade: () => fillOnly(rect(sx > 0 ? 10 : -60, -140, 50, 140), PAL.jeansS, { boil: .3 }) });
    shape(spline([[ank[0] - 26, ank[1] + 20], [ank[0] - 22, ank[1] - 6], [ank[0] + 12, ank[1] - 8], [ank[0] + 44, ank[1] + 8], [ank[0] + 42, ank[1] + 22]]), { fill: PAL.shoe, lw: 6, shade: () => fillOnly(rect(ank[0] - 40, ank[1] + 14, 100, 20), PAL.sole, { boil: .3 }) });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-62, -236], shF = [60, -236];
  const armB = P.armL || { h: [-14, 112], bend: -14 }, armF = P.armR || { h: [14, 112], bend: 14 };
  const drawArm = (sh, arm) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 34, 28), { fill: C.hood, lw: 6 });
    hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 17, PAL.skin, { fist: arm.fist });
    return hp;
  };
  const hB = drawArm(shB, armB);
  // Körper: Hoodie mit Kängurutasche und Kordeln
  const body = spline([[0, -276], [62, -258], [84, -180], [74, -112], [0, -100], [-74, -112], [-84, -180], [-62, -258]]);
  shape(body, {
    fill: C.hood, lw: 7, shade: () => {
      fillOnly(spline([[24, -280], [90, -250], [104, -170], [86, -96], [44, -96], [66, -170]]), C.hoodS, { boil: .4 });
      fillOnly(rr(-48, -170, 96, 50, 14), C.hoodS, { boil: .3 });
    }
  });
  stroke(spline([[-48, -122], [-40, -170], [40, -170], [48, -122]], false), 5);
  stroke([[-16, -262], [-20, -214]], 4); stroke([[16, -262], [20, -214]], 4);
  dot(-20, -212, 5); dot(20, -212, 5);
  // Kopf
  push(); translate(0, -340); rotate(P.headTilt ?? 0); kalleHead(P, ner); pop();
  const hF = drawArm(shF, armF);
  if (P.hold) P.hold(hB, hF);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; drop(-96, -430 + u * 50, 1.1); drop(104, -410 + ((u + .5) % 1) * 50, .9); }
  pop();
}
function kalleHead(P, ner) {
  for (const sx of [-1, 1]) shape(ell(sx * 84, 10, 15, 22, 16), { fill: PAL.skin, lw: 6 });
  shape(spline([[0, -86], [70, -72], [88, 0], [62, 74], [0, 92], [-62, 74], [-88, 0], [-70, -72]]), { fill: PAL.skin, lw: 7, shade: () => fillOnly(ell(52, 30, 50, 70, 26), PAL.skinS, { boil: .3 }) });
  // Strubbelhaare
  const hair = spline([[-92, -6], [-96, -60], [-70, -104], [-40, -96], [-20, -126], [10, -100], [40, -128], [56, -98], [92, -96], [96, -40], [80, -30], [60, -62], [20, -58], [-20, -70], [-60, -52], [-80, -20]]);
  if (!P.bald) shape(hair, { fill: P.hair || PAL.hair, lw: 7, shade: () => fillOnly(ell(50, -90, 50, 30, 20), PAL.hairS, { boil: .3 }) });
  else { stroke(arc(-60, -40, 30, 20, Math.PI, Math.PI * 1.6, 8), 5); stroke(arc(60, -40, 30, 20, Math.PI * 1.4, TAU, 8), 5); }
  if (P.peel) {   // Bananenschale: Stiel oben, vier Lappen hängen weich über den Kopf
    const lap = (ang, len) => { push(); translate(0, -104); rotate(ang);
      shape(spline([[-26, 0], [26, 0], [34, len * .45], [20, len * .85], [0, len], [-20, len * .85], [-34, len * .45]]), { fill: '#ffe066', lw: 6,
        shade: () => { fillOnly(spline([[-14, 6], [14, 6], [18, len * .5], [0, len * .8], [-18, len * .5]]), '#fff6c4', { boil: .3 }); fillOnly(ell(0, len - 6, 16, 10, 12), '#7a5230', { boil: .3 }); } });
      pop(); };
    lap(1.05, 125); lap(-1.05, 125); lap(.42, 70); lap(-.42, 70);
    shape(spline([[-30, -96], [30, -96], [22, -132], [-22, -132]]), { fill: '#ffd43b', lw: 6, shade: () => fillOnly(rect(6, -140, 30, 50), '#e8b923', { boil: .3 }) });
    shape(rr(-9, -170, 18, 42, 6), { fill: '#7a5230', lw: 5 });
  }
  // Brauen: brow -1 wütend (innen tief), +1 besorgt (innen hoch)
  const br = P.brow ?? .3;
  stroke([[-70, -36 - br * 4], [-26, -40 - br * 12 + (br < 0 ? -br * 22 : 0)]], 8);
  stroke([[70, -36 - br * 4], [26, -40 - br * 12 + (br < 0 ? -br * 22 : 0)]], 8);
  const look = P.look || [0, 0], sh = ner ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * ner : 0;
  for (const ex of [-34, 34]) eye(ex, 4, 30 * (P.eyeS ?? 1), 34 * (P.eyeS ?? 1), { lid: P.blink ? 1 : (P.lid ?? .05), look, pupil: P.pupil ?? 5, jitter: sh, lw: 6, lower: P.lower ?? 0 });
  stroke(arc(-34, 42, 18, 6, .2, Math.PI - .2, 6), 3, { line: PAL.skinS }); stroke(arc(34, 42, 18, 6, .2, Math.PI - .2, 6), 3, { line: PAL.skinS });
  stroke(spline([[4, 18], [16, 40], [2, 48]], false), 5);
  const m = P.mouth || {};
  mouth(0, 64, 46 * (P.mouthS ?? 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? 0, lw: 6 });
}

// —— Rudi, der Saugroboter ——
// P: x,y,s,t, o (spricht 0..1), look, lid, stalk (Höhe 0..1), bob, tilt
export function rudi(P) {
  push(); translate(P.x, P.y + (P.bob || 0)); scale(P.s ?? 1);
  // Räder + Gehäuse
  shape(ell(0, -30, 150, 46, 40), { fill: PAL.rudiDark, lw: 7 });
  shape(spline([[-150, -44], [-140, -96], [0, -118], [140, -96], [150, -44], [0, -24]]), { fill: PAL.rudi, lw: 7, shade: () => { fillOnly(ell(70, -60, 90, 50, 24), PAL.rudiS, { boil: .3 }); fillOnly(rect(-160, -60, 320, 14), PAL.rudiS, { boil: .3 }); } });
  shape(ell(0, -100, 52, 14, 24), { fill: PAL.rudiDark, lw: 5 });
  // LED-Mund (Balken pulsieren beim Sprechen)
  const o = P.o || 0;
  for (let i = 0; i < 5; i++) { const hgt = 6 + o * 22 * (1 - Math.abs(i - 2) / 3); fillOnly(rr(-46 + i * 20, -64 - hgt / 2, 12, hgt, 4), o > .05 ? PAL.led : '#4b5563', { boil: .2 }); }
  // Stiel + Auge
  const st = 140 + (P.stalk ?? 1) * 120;
  push(); rotate(P.tilt || 0);
  shape(noodle([0, -108], [0, -108 - st], 8, 16, 14), { fill: PAL.rudiS, lw: 6 });
  shape(ell(0, -108 - st - 40, 62, 52, 30), { fill: PAL.rudi, lw: 7 });
  eye(0, -108 - st - 40, 46, 38, { lid: P.lid ?? .48, look: P.look || [0, 0], pupil: 7, skin: PAL.rudi, lw: 6 });
  dot(30, -108 - st - 96, 7, P.blink ? '#ff4f6d' : '#ffb3c1');
  stroke([[22, -108 - st - 88], [30, -108 - st - 96]], 4);
  pop();
  pop();
}

// —— Requisiten ——
export function zettel(x, y, s = 1, a = 0) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(rr(-150, -100, 300, 200, 10), { fill: PAL.card, lw: 6, shade: () => fillOnly(rect(-150, 60, 300, 40), PAL.cardS, { boil: .3 }) });
  text('LEIDER', 0, -58, { font: '800 40px "Baloo 2"' });
  text('NICHT ANGETROFFEN', 0, -16, { font: '800 30px "Baloo 2"' });
  shape(rr(-120, 22, 26, 26, 4), { fill: '#fff', lw: 4 }); stroke([[-116, 34], [-106, 46], [-90, 18]], 5, { line: '#d62839' });
  text('Paket beim Nachbarn', 20, 36, { font: '700 22px "Baloo 2"' });
  pop();
}
export function karton(x, y, s = 1, { open = 0, label = 'KALLE', a = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(rect(-130, -160, 260, 160), { fill: PAL.box, lw: 7, shade: () => fillOnly(rect(40, -170, 100, 180), PAL.boxS, { boil: .3 }) });
  if (open < .05) { shape(rect(-130, -180, 260, 26), { fill: PAL.box, lw: 6 }); fillOnly(rect(-20, -180, 40, 26), PAL.tape, { boil: .2 }); }
  else {
    const fa = open * 1.9;
    for (const sx of [-1, 1]) { push(); translate(sx * 130, -160); rotate(-sx * fa); shape(rect(sx > 0 ? -130 : 0, -24, 130, 24).map(([px, py]) => [sx > 0 ? px : px, py]), { fill: PAL.boxS, lw: 6 }); pop(); }
  }
  shape(rr(-70, -110, 140, 56, 6), { fill: '#fffaf0', lw: 4 });
  text(label, 0, -82, { font: '800 30px "Baloo 2"' });
  pop();
}
export function klingel(x, y, s = 1, { glow = 0, a = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(rr(-70, -110, 140, 220, 26), { fill: '#f4f1ea', lw: 7, shade: () => fillOnly(rect(20, -120, 70, 240), '#d9d3c4', { boil: .3 }) });
  shape(ell(0, -20, 40, 40, 30), { fill: '#d9a441', lw: 6, shade: () => fillOnly(ell(14, -8, 26, 26, 20), '#b5832a', { boil: .3 }) });
  shape(rr(-50, 40, 100, 40, 6), { fill: '#fff', lw: 4 });
  text('KALLE', 0, 62, { font: '800 24px "Baloo 2"' });
  if (glow) for (let i = 0; i < 6; i++) { const ang = i / 6 * TAU + .3; stroke([[Math.cos(ang) * 130, Math.sin(ang) * 150], [Math.cos(ang) * 170, Math.sin(ang) * 190]], 6, { alpha: glow }); }
  pop();
}
// Kalles Bastelgerät: Toaster mit Antenne und Klebeband „PAKET-PORTAL“
export function geraet(x, y, s = 1, { press = 0, glow = 0 } = {}) {
  push(); translate(x, y); scale(s);
  stroke(spline([[30, -110], [50, -160], [20, -190], [44, -230]], false), 6);
  dot(44, -232, 11, glow ? '#ff4fd8' : '#ff8ad0');
  shape(rr(-90, -120, 180, 120, 26), { fill: '#b8c4cf', lw: 7, shade: () => fillOnly(rect(40, -130, 60, 140), '#8f9cab', { boil: .3 }) });
  stroke([[-50, -120], [-50, -100]], 10); stroke([[10, -120], [10, -100]], 10);
  shape(rr(-70, -76, 120, 30, 4), { fill: '#f3e27a', lw: 4 });
  text('PAKET-PORTAL', -10, -60, { font: '800 18px "Baloo 2"' });
  shape(ell(70, -40, 16, 16 - press * 4, 16), { fill: press ? '#ff7b6b' : '#e8392b', lw: 5 });
  pop();
}

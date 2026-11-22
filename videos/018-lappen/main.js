// „Durch die Lappen gehen“ — Woodcut Print, 1080×1920, 24 fps (Serie „Woher kommt das?“)
import * as WC from './engine/index.js';
import { clamp, lerp, seg, mulberry } from '/core/lib.js';
import { curl, peelState } from './trans.js';

const W = 1080, H = 1920, IMG = { x: 36, y: 36, w: 1008, h: 1488 };
const RED = '#9E1F1A';
const cv = document.getElementById('cv'), g = cv.getContext('2d');
await Promise.all(['400 60px "IM Fell English"', '400 60px "IM Fell English SC"'].map(f => document.fonts.load(f)));
const logo = new Image(); logo.src = 'logo.png'; await logo.decode();
const TL = await (await fetch('timeline.json')).json();
const VO = TL.vo, DUR = TL.dur;
const K = Object.fromEntries(VO.map(v => [v.id, v.t0]));

const [M, m] = WC.canvas(W, H), [C, c] = WC.canvas(W, H), P = WC.makePrinter(W, H);
const [B1, b1] = WC.canvas(W, H), [B2, b2] = WC.canvas(W, H), [B3, b3] = WC.canvas(W, H);
const q = t => Math.floor(t * 12 + 1e-6) / 12;                       // Figuren auf Zweien (12 fps)
const SUN = WC.light(-.85, -.25, .45);

// ---------- Kamera und Bildaufbau ----------
function begin(cam = {}) {
  for (const x of [m, c]) { x.setTransform(1, 0, 0, 1, 0, 0); }
  m.fillStyle = '#fff'; m.fillRect(0, 0, W, H); c.clearRect(0, 0, W, H);
  const z = cam.z ?? 1, cx = cam.x ?? W / 2, cy = cam.y ?? (IMG.y + IMG.h / 2);
  const ox = IMG.x + IMG.w / 2, oy = IMG.y + IMG.h / 2;
  for (const x of [m, c]) { x.save(); x.beginPath(); x.rect(IMG.x, IMG.y, IMG.w, IMG.h); x.clip(); x.setTransform(z, 0, 0, z, ox - z * cx, oy - z * cy); }
  m.fillStyle = '#000'; m.fillRect(-2000, -2000, 6000, 6000);
}
function end() { m.restore(); c.restore(); m.setTransform(1, 0, 0, 1, 0, 0); c.setTransform(1, 0, 0, 1, 0, 0); }

// Untertitel als Buchdruck im unteren Papierrand (in Tinte auf die Maske → wird mitgedruckt)
function caption(text, a = 1, size = 68) {
  if (!text || a <= 0) return;
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0);
  m.font = `400 ${size}px "IM Fell English"`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = `rgba(0,0,0,${a})`;
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (m.measureText(t).width > 940 && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const y0 = IMG.y + IMG.h + (H - IMG.y - IMG.h) / 2 - (lines.length - 1) * size * .62;
  lines.forEach((l, i) => m.fillText(l, W / 2, y0 + i * size * 1.24));
  m.restore();
}
function captionAt(t) {
  for (const v of VO) { const t1 = Math.max(v.t0 + 1.8, v.t1 + .5); if (t >= v.t0 - .05 && t < t1) return { text: v.text, a: Math.min(seg(t, v.t0 - .05, v.t0 + .05), 1 - seg(t, t1 - .15, t1)) }; }
  return null;
}

// ---------- Welt: Wald im tiefen Abendlicht (Bildkoordinaten = Leinwand) ----------
const HOR = 1000, SUNP = [250, 930];
const rnd = mulberry(7);
const trunks = [];
for (const [x, w] of [[90, 70], [210, 44], [330, 58], [470, 36], [800, 64], [930, 48], [1020, 80], [700, 30], [560, 26]]) {
  const top = 36, base = HOR + 40 + rnd() * 40, lean = (rnd() - .5) * 30;
  trunks.push({ x, w, poly: [[x - w / 2 + lean, top], [x + w / 2 + lean, top], [x + w * .62, base], [x - w * .62, base]] });
}
function buildForest(reveal) {
  const R = (a, b, key) => reveal ? { t0: a, t1: b, key, speed: 1400, jit: .15 } : undefined;
  const sky = new WC.Region([[[36, 36], [1044, 36], [1044, HOR + 20], [36, HOR + 20]]], { res: 3 });
  const dist = (x, y) => Math.hypot(x - SUNP[0], (y - SUNP[1]) * 1.3);
  const skyStr = WC.hatch(sky, { dir: (x, y) => Math.atan2(y - SUNP[1], x - SUNP[0]) + Math.PI / 2, tone: (x, y) => clamp(1.05 - dist(x, y) / 1100), sp: 9, lo: .15, hi: .98, kind: 'u', seg: [40, 140], seed: 3, reveal: R(0, 1.1, (x, y) => dist(x, y) / 1100) });
  const rayStr = WC.rays(SUNP[0], SUNP[1], { n: 26, r0: 70, r1: [320, 760], w: 13, a0: -Math.PI * .98, a1: -Math.PI * .02, seed: 4, reveal: reveal ? { t0: .2, t1: 1.2 } : undefined });
  const ground = new WC.Region([[[36, HOR], [1044, HOR], [1044, 1524], [36, 1524]]], { res: 3 });
  const gStr = WC.hatch(ground, { dir: (x, y) => .03 * Math.sin(x * .01), tone: (x, y) => clamp(.75 - (y - HOR) / 260 - Math.abs(x - SUNP[0]) / 2200), sp: 10, lo: .2, hi: .9, kind: 'v', seg: [30, 120], seed: 9, reveal: R(.4, 1.3, (x, y) => (y - HOR) / 500) });
  const tr = trunks.map((T, i) => WC.shape([T.poly], { light: SUN, dir: Math.PI / 2, sp: 7, halo: 5, lo: .35, hi: .95, seed: 20 + i, reveal: R(.5 + i * .05, 1.4, (x, y) => (y - 36) / 1500) }));
  const lv = []; const r = mulberry(31);
  for (let i = 0; i < 160; i++) lv.push([36 + r() * 1008, HOR + 40 + r() * 480, 2 + r() * 4]);
  const leaves = WC.flecks(lv, { seed: 5, angle: .3 });
  if (reveal) leaves.forEach((s, i) => { s.t0 = 1 + i * .003; s.dur = .1; });
  return { skyStr, rayStr, gStr, tr, leaves };
}
const FOREST_R = buildForest(true), FOREST = buildForest(false);
function drawForest(t = 1e9, F = FOREST) {
  WC.drawStrokes(m, F.skyStr, { t, color: '#fff' });
  WC.drawStrokes(m, F.rayStr, { t, color: '#fff' });
  m.fillStyle = '#000'; m.fillRect(-500, HOR, 2000, 2000);
  WC.drawStrokes(m, F.gStr, { t, color: '#fff' });
  for (const T of F.tr) T.draw(m, t);
  WC.drawStrokes(m, F.leaves, { t, color: '#fff' });
}
// statischer Wald einmal vorgerendert (schnell)
const [FC, fc] = WC.canvas(W, H);
{ const sv = m; fc.fillStyle = '#000'; fc.fillRect(0, 0, W, H); }
let forestCached = false;
function forestStatic() {
  if (!forestCached) {
    m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.fillStyle = '#000'; m.fillRect(0, 0, W, H); drawForest(); m.restore();
    fc.drawImage(M, 0, 0); forestCached = true;
  }
  m.drawImage(FC, 0, 0);
}

// ---------- Leine mit Lappen ----------
const ROPE = { x0: -60, x1: 1140, y: 936, sag: 22 }, GAP = [592, 712], POSTS = [150, 430, 860];
const ropeY = x => ROPE.y + ROPE.sag * Math.sin(Math.PI * clamp((x - ROPE.x0) / (ROPE.x1 - ROPE.x0)));
const LAP = []; for (let x = -40; x < 1130; x += 34) if (x < GAP[0] || x > GAP[1]) LAP.push(x);
const ropeStr = WC.cutAlong(Array.from({ length: 60 }, (_, i) => { const x = lerp(ROPE.x0, ROPE.x1, i / 59); return [x, ropeY(x)]; }), { w: 4, kind: 'k', seg: [60, 160], gap: [1, 3], seed: 8 });
const postShapes = POSTS.map((x, i) => WC.shape([[[x - 9, ropeY(x) - 30], [x + 9, ropeY(x) - 30], [x + 12, 1130], [x - 12, 1130]]], { light: SUN, dir: Math.PI / 2, sp: 6, halo: 5, seed: 50 + i }));
function lappenPoly(x, t, wind = 1) {
  const y = ropeY(x), ph = t * 7 + x * .05, sw = Math.sin(ph) * 14 * wind, lift = Math.abs(Math.sin(ph * .7)) * 6 * wind;
  return [[x - 13, y], [x + 13, y], [x + 13 + sw, y + 82 - lift], [x - 13 + sw * .8, y + 86 - lift]];
}
function drawLine(t, visible = 1e9, wind = 1) {
  for (const S of postShapes) S.draw(m, 1e9);
  WC.drawStrokes(m, ropeStr, { t: 1e9, color: '#fff' });
  const tq = q(t);
  LAP.forEach((x, i) => {
    if (i * .07 > visible) return;
    const drop = clamp((visible - i * .07) / .12), P0 = lappenPoly(x, tq, wind).map(([px, py], k) => k < 2 ? [px, py] : [px, lerp(ropeY(x), py, drop)]);
    WC.fillPoly(m, [P0], '#fff');
    m.strokeStyle = '#000'; m.lineWidth = 3; m.beginPath(); WC.pathOf(m, P0); m.stroke();
    m.lineWidth = 2.2; m.beginPath(); m.moveTo(lerp(P0[0][0], P0[3][0], .2), lerp(P0[0][1], P0[3][1], .55)); m.lineTo(lerp(P0[1][0], P0[2][0], .2), lerp(P0[1][1], P0[2][1], .5)); m.stroke();
    if (i % 2 === 0) WC.plate(c, [P0], 1);
  });
}

// ---------- Hirsch (Profil nach rechts, Ursprung = Boden unter dem Rumpf) ----------
const DEER = [[-150, -215], [-120, -232], [-40, -238], [60, -236], [115, -240], [140, -262], [158, -300], [170, -330], [190, -352], [214, -356], [236, -346], [262, -326], [272, -312], [262, -304], [236, -304], [214, -298], [196, -280], [186, -250], [172, -205], [150, -168], [110, -150], [40, -146], [-40, -148], [-110, -152], [-150, -165], [-168, -190], [-176, -214], [-166, -226]];
const EAR = [[196, -350], [176, -386], [210, -356]];
const deerShape = WC.shape([DEER, EAR], { light: SUN, sp: 7, halo: 8, lo: .3, hi: .95, seed: 61 });
const ANT = [[[208, -354], [196, -400], [178, -442], [156, -470]], [[196, -400], [224, -428]], [[180, -440], [204, -476]], [[214, -356], [232, -396], [240, -436]], [[232, -396], [258, -414]]];
// Beine: [Hüfte x, y], Winkel oben/unten je Pose
const LEGS = [[128, -166], [98, -160], [-118, -160], [-92, -156]];
const POSE = {
  stand: [[.05, -.05], [-.04, .04], [.06, -.08], [-.05, .05]],
  shy: [[-.25, .1], [-.15, .05], [.2, -.3], [.25, -.4]],
  run1: [[.7, -.9], [.4, -.6], [-.6, .9], [-.3, .5]],
  run2: [[-.5, .3], [-.2, .2], [.5, -.2], [.3, -.1]],
  leap: [[1.25, -1.6], [1.05, -1.3], [-1.15, .5], [-1.0, .35]],
};
function limb(g, pts, w) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#fff'; g.lineWidth = w + 6; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke();
  g.strokeStyle = '#000'; g.lineWidth = w; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke();
}
function legPts([hx, hy], [a, b], L1 = 80, L2 = 86) {
  const kx = hx + Math.sin(a) * L1, ky = hy + Math.cos(a) * L1;
  return [[hx, hy], [kx, ky], [kx + Math.sin(a + b) * L2, ky + Math.cos(a + b) * L2]];
}
function drawDeer(x, y, s, pose, rot = 0) {
  m.save(); m.translate(x, y); m.scale(s, s); m.rotate(rot);
  const P0 = POSE[pose];
  LEGS.forEach((h, i) => limb(m, legPts(h, P0[i]), 22));
  for (const A of ANT) limb(m, A, 9);
  deerShape.draw(m, 1e9);
  m.fillStyle = '#fff'; m.beginPath(); m.arc(232, -330, 5, 0, 7); m.fill();          // Auge als Schnitt
  m.restore();
}

// ---------- Jäger (Silhouette nach rechts) ----------
const HUNT = [[[-34, -400], [34, -400], [40, -386], [66, -382], [66, -372], [-66, -372], [-66, -382], [-40, -386]],
  WC.ellipse(4, -342, 24, 28, 24), [[-40, -312], [40, -312], [54, -270], [60, -150], [70, -96], [-64, -96], [-56, -150], [-52, -270]]];
const hunterShape = WC.shape(HUNT, { light: SUN, sp: 6, halo: 7, lo: .3, hi: .95, seed: 71 });
function drawHunter(x, y, s, arm = 0, t = 0) {
  m.save(); m.translate(x, y); m.scale(s, s);
  limb(m, [[-22, -100], [-30, -50], [-34, 0]], 26); limb(m, [[22, -100], [30, -50], [36, 0]], 26);
  hunterShape.draw(m, 1e9);
  limb(m, [[30, -296], [70 + arm * 20, -250 - arm * 30], [110 + arm * 40, -230 - arm * 70]], 16);
  m.restore();
}

// ---------- Titel ----------
function titleText(lines, y0, size, mirror = false) {
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0);
  if (mirror) m.setTransform(-1, 0, 0, 1, W, 0);
  m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = '#fff';
  lines.forEach(([s, sz, font], i) => { m.font = `400 ${sz}px "${font || 'IM Fell English SC'}"`; m.fillText(s, W / 2, y0 + lines.slice(0, i).reduce((a, l) => a + l[1] * 1.08, 0)); });
  m.restore();
}
const titleFlecks = (() => { const r = mulberry(91), p = []; for (let i = 0; i < 240; i++) p.push([60 + r() * 960, 80 + r() * 1400, 2 + r() * 3]); return WC.flecks(p, { seed: 3 }); })();
function titleRope(y, t) {
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0);
  m.strokeStyle = '#fff'; m.lineWidth = 5; m.beginPath(); m.moveTo(60, y); m.quadraticCurveTo(540, y + 40, 1020, y); m.stroke();
  for (let i = 0; i < 18; i++) {
    const x = 100 + i * 52, yy = y + 40 * (1 - ((x - 540) / 480) ** 2), sw = Math.sin(t * 7 + i) * 10;
    const P0 = [[x - 16, yy], [x + 16, yy], [x + 16 + sw, yy + 92], [x - 16 + sw * .8, yy + 96]];
    WC.fillPoly(m, [P0], '#fff'); m.strokeStyle = '#000'; m.lineWidth = 3; m.beginPath(); WC.pathOf(m, P0); m.stroke();
    if (i % 2 === 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); WC.plate(c, [P0], 1); c.restore(); }
  }
  m.restore();
}

// ---------- Szenen ----------
const T = { s1: 0, s2: K.l2 - .15, s3: K.l3 - .15, s4: K.l4 - .15, s5: K.l5 - .15, s6: K.l6 - .15, s7: K.l7 - .15 };
const LEAP0 = (VO.find(v => v.id === 'l5').t0) + .9;       // Sprung startet bei „Lücke“
const PEEL0 = VO.find(v => v.id === 'l6').t0 + 1.9;
function printNow(o) { return P.render(M, C, { plate: RED, ...o }); }

function shot1(t) {           // Hook: geschnitzter Titel, ab Bild 0 voll lesbar
  begin({ z: 1 + .03 * t });
  end();
  m.fillStyle = '#000'; m.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
  WC.drawStrokes(m, titleFlecks, { t: 1e9, color: '#fff' });
  titleText([['WOHER KOMMT DAS?', 62]], 300, 62);
  titleText([['»DURCH DIE', 128], ['LAPPEN', 190], ['GEHEN«', 150]], 620, 128);
  titleRope(1080, q(t));
  caption(captionAt(t)?.text, captionAt(t)?.a ?? 0);
  return printNow({ seed: 3, inkSeed: 1 });
}
function shot2(t) {           // Wald, Abendlicht wird eingeschnitten, langsamer Pull-back
  begin({ z: 1.18 - .14 * clamp(t / 4), y: 820 });
  if (t < 1.5) drawForest(t, FOREST_R); else forestStatic();
  end(); caption(captionAt(t + T.s2)?.text, captionAt(t + T.s2)?.a ?? 0);
  return printNow({ seed: 3, inkSeed: 2, reg: t < 2 / 24 ? [3, -2] : [0, 0] });
}
function shot3(t, dur) {      // Jäger spannt die Leine, Lappen werden aufgehängt, Kamera fährt mit
  const u = clamp(t / dur);
  begin({ z: 1.55, x: lerp(360, 680, u), y: 1010 });
  forestStatic();
  drawLine(t, t * 1.35);
  drawHunter(lerp(230, 260, u), 1250, 1.45, Math.sin(q(t) * 6) * .5);
  end(); caption(captionAt(t + T.s3)?.text, captionAt(t + T.s3)?.a ?? 0);
  return printNow({ seed: 3, inkSeed: 3, reg: t < 2 / 24 ? [-3, 2] : [0, 0] });
}
function shot4(t) {           // Wild vor den flatternden Lappen, weicht zurück
  begin({ z: 1.6, x: 690, y: 1000 });
  forestStatic();
  const shy = t > 1.0;
  drawDeer(lerp(720, 790, clamp((t - 1) / .6)), 1066, .9, shy ? 'shy' : 'stand', shy ? -.06 : 0);
  drawLine(t, 1e9, 1.6);
  end(); caption(captionAt(t + T.s4)?.text, captionAt(t + T.s4)?.a ?? 0);
  return printNow({ seed: 3, inkSeed: 4, reg: t < 2 / 24 ? [2, 3] : [0, 0] });
}
function shot5(t) {           // Sprung durch die Lücke – Snap-Zoom, dann zu uns heraus
  const tl = t + T.s5, u = clamp((tl - LEAP0) / 1.1), tq = q(t);
  const z = tl < LEAP0 ? 1.5 : 1.5 + .25 * clamp((tl - LEAP0) / .12);
  begin({ z, x: 660, y: 1030 });
  forestStatic();
  if (tl < LEAP0) {             // Anlauf hinter der Leine
    const r = clamp(t / (LEAP0 - T.s5));
    drawDeer(lerp(980, 640, r), 1066, .9, Math.floor(tq * 6) % 2 ? 'run1' : 'run2');
    drawLine(t, 1e9, 1.3);
  } else {
    drawLine(t, 1e9, 1.3);
    const x = lerp(620, 520, u), y = lerp(1066, 1330, u) - Math.sin(Math.PI * Math.min(1, u * 1.4)) * 220, s = lerp(.9, 1.4, u * u);
    drawDeer(x, y, s, u < .7 ? 'leap' : 'run1', -.15 + .3 * u);
    const r = mulberry(12), chips = [];                 // Erde und Laub fliegen
    for (let i = 0; i < 40; i++) chips.push([660 + r() * 160 + u * 60 * (r() - .5) * 4, 1080 - u * 160 * r(), 2 + r() * 4]);
    if (u > .05 && u < .8) WC.drawStrokes(m, WC.flecks(chips, { seed: 2 }), { t: 1e9, color: '#fff' });
  }
  end(); caption(captionAt(tl)?.text, captionAt(tl)?.a ?? 0);
  const hit = tl >= LEAP0 && tl < LEAP0 + 2 / 24;
  return printNow({ seed: 3, inkSeed: 5 + (tl >= LEAP0 ? 1 : 0), reg: (t < 2 / 24 || hit) ? [-4, 3] : [0, 0] });
}
function shot6(t) {           // leere Lücke, Jäger zu spät → Abzug: der Spruch steht lesbar da
  const tl = t + T.s6;
  const scene = () => {
    begin({ z: 1.55, x: 640, y: 1020 });
    forestStatic(); drawLine(t, 1e9, .9);
    drawHunter(470, 1270, 1.45, -.4);
    end();
  };
  if (tl < PEEL0 - .7) { scene(); caption(captionAt(tl)?.text, captionAt(tl)?.a ?? 0); return printNow({ seed: 3, inkSeed: 7, reg: t < 2 / 24 ? [3, 3] : [0, 0] }); }
  // Druckstock (gespiegelt, Holz) – dann wird das Blatt abgezogen
  begin(); end(); m.fillStyle = '#000'; m.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
  WC.drawStrokes(m, titleFlecks, { t: 1e9, color: '#fff' });
  titleText([['»DURCH DIE', 128], ['LAPPEN', 190], ['GEGANGEN«', 128]], 560, 128, true);
  const block = P.render(M, C, { mode: 'block', plate: RED, seed: 3 });
  b1.clearRect(0, 0, W, H); b1.drawImage(block, 0, 0);
  begin(); end(); m.fillStyle = '#000'; m.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
  WC.drawStrokes(m, titleFlecks, { t: 1e9, color: '#fff' });
  titleText([['»DURCH DIE', 128], ['LAPPEN', 190], ['GEGANGEN«', 128]], 560, 128);
  titleRope(1130, q(t));
  caption('Daher kommt der Spruch.', 1);
  const pr = P.render(M, C, { plate: RED, seed: 3, inkSeed: 8 });
  b2.clearRect(0, 0, W, H); b2.drawImage(pr, 0, 0);
  const u = clamp((tl - PEEL0) / 1.3);
  if (tl < PEEL0) return B1;
  if (u >= 1) return B2;
  b3.fillStyle = '#EFE8D8'; b3.fillRect(0, 0, W, H);
  const st = peelState(u, 120);
  b3.drawImage(B1, 0, 0);
  curl(b3, B3blank(), B2, st.xf, st.r);
  return B3;
}
let BL = null;
function B3blank() { if (!BL) { const [x, xc] = WC.canvas(W, H); xc.fillStyle = '#EFE8D8'; xc.fillRect(0, 0, W, H); BL = x; } return BL; }
function shot7(t) {           // Schluss: Kanal-Logo als Abzug, Kommentar-Aufruf im Rand
  begin(); end(); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  m.fillStyle = '#000'; m.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
  titleText([['WUSSTEST DU\'S?', 110]], 260, 110);
  caption(captionAt(t + T.s7)?.text || 'Schreib’s in die Kommentare und folg für mehr!', 1);
  const out = printNow({ seed: 3, inkSeed: 9, reg: t < 2 / 24 ? [3, -3] : [0, 0] });
  b1.clearRect(0, 0, W, H); b1.drawImage(out, 0, 0);
  const s = 640 * (1 + .03 * Math.sin(t * 2)), x = (W - s) / 2, y = 470;
  b1.save(); b1.beginPath(); b1.arc(W / 2, y + s / 2, s / 2, 0, 7); b1.clip(); b1.drawImage(logo, x, y, s, s); b1.restore();
  b1.strokeStyle = '#EFE8D8'; b1.lineWidth = 10; b1.beginPath(); b1.arc(W / 2, y + s / 2, s / 2, 0, 7); b1.stroke();
  return B1;
}

const SHOTS = [[T.s1, shot1], [T.s2, shot2], [T.s3, shot3], [T.s4, shot4], [T.s5, shot5], [T.s6, shot6], [T.s7, shot7]];
window.DUR = DUR;
window.render = t => {
  let i = SHOTS.length - 1; while (i > 0 && t < SHOTS[i][0]) i--;
  const t0 = SHOTS[i][0], dur = (SHOTS[i + 1]?.[0] ?? DUR) - t0;
  const out = SHOTS[i][1](t - t0, dur);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(out, 0, 0);
};
window.READY = true;

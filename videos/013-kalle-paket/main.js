// Kalle und das Paket — Sci-Fi Sitcom Toon, 1080×1920, 24 fps
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, bands, S, reset, noodle } from './toon.js';
import { kalle, rudi, zettel, karton, klingel, geraet, eye, PAL } from './chars.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
await Promise.all(['800 58px "Baloo 2"', '800 34px "Baloo 2"', '400 110px "Titan One"'].map(f => document.fonts.load(f)));
const logo = new Image(); logo.src = 'schluss.png'; await logo.decode().catch(() => { });

export const DUR = 38.6;
// Sprecheinsätze (s)
const VO = { k1: 1.55, k2: 4.95, r1: 8.05, k3: 10.6, r2: 15.25, k4: 17.0, k5: 23.55, r3: 30.95, cta: 34.45 };
const q = t => Math.floor(t * 12 + 1e-6) / 12;   // auf Zweien
const vdur = id => DURS[id] ?? 1;
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + vdur(id)) {
      const k = Math.floor((tq - t0) * 24), lp = LIPS[id];
      const o = lp ? (lp.o[k] ?? 0) : .4, b = lp ? (lp.b[k] ?? .5) : .5;
      return { o, w: .8 + .45 * b - .2 * o, on: true };
    }
  }
  return { o: 0, w: 1, on: false };
}
// Kamera: Bühnenpunkt (cx,cy) in Bildmitte, Zoom z
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const landSq = (t, tl) => { const u = t - tl; if (u < 0 || u > .6) return 1; return 1 - .22 * Math.exp(-u * 9) * Math.cos(u * 30); };
const blinkK = t => { const k = Math.floor(t * 12) % 40; return k === 0 || k === 1; };

// —— Kulissen (Bühne: Boden bei y=1500) ——
const FLOOR = 1500;
function treppenhaus(t) {
  bands(['#93a7b8', '#9db1c2', '#a8bccd'], -600, FLOOR, -1200, 2400);
  fillOnly(rect(-1200, FLOOR, 3600, 900), '#6f7d8c', { boil: 0 });
  stroke([[-1200, FLOOR], [2400, FLOOR]], 7);
  // Tür
  shape(rect(240, 380, 600, 1120), { fill: '#8a5a3c', lw: 8, shade: () => { fillOnly(rect(640, 360, 220, 1160), '#6e4329', { boil: .3 }); } });
  shape(rr(300, 460, 480, 400, 14), { fill: '#9b6a49', lw: 6 }); shape(rr(300, 920, 480, 460, 14), { fill: '#9b6a49', lw: 6 });
  shape(ell(760, 960, 22, 22, 16), { fill: '#d9a441', lw: 6 });
  // Klingel neben der Tür – mit Klebeband „KAPUTT“ (Hinweis für die Pointe)
  shape(rr(900, 820, 90, 140, 16), { fill: '#f4f1ea', lw: 6 }); shape(ell(945, 870, 22, 22, 16), { fill: '#d9a441', lw: 5 });
  push(); translate(945, 872); rotate(-.35); shape(rr(-62, -16, 124, 32, 4), { fill: '#e9d9a8', lw: 4 }); text('KAPUTT', 0, 2, { font: '800 20px "Baloo 2"' }); pop();
}
function wohnzimmer(t, { fridge = true } = {}) {
  bands(['#e9cfa5', '#efd7b1', '#f4dfbd'], -800, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#a0714d', { boil: 0 });
  for (let i = -6; i < 14; i++) stroke([[i * 180, FLOOR], [i * 180 - 120, 2400]], 4, { line: '#86593a' });
  stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  // Fenster
  shape(rect(-260, 380, 420, 520), { fill: '#8fd3e8', lw: 8, shade: () => { fillOnly(rect(-260, 700, 420, 200), '#b6e3d0', { boil: .2 }); fillOnly(ell(60, 520, 50, 50, 20), '#fff3b0', { boil: .3 }); } });
  stroke([[-50, 380], [-50, 900]], 7); stroke([[-260, 640], [160, 640]], 7);
  // Sofa
  shape(rr(620, 1180, 640, 260, 40), { fill: '#3a9b8f', lw: 8, shade: () => fillOnly(rect(620, 1340, 640, 120), '#2b7a70', { boil: .3 }) });
  shape(rr(580, 1260, 110, 220, 30), { fill: '#3a9b8f', lw: 7 }); shape(rr(1200, 1260, 110, 220, 30), { fill: '#3a9b8f', lw: 7 });
  // Kühlschrank (summt)
  if (fridge) { shape(rr(-760, 720, 360, 780, 20), { fill: '#f1f3f4', lw: 8, shade: () => fillOnly(rect(-480, 700, 100, 820), '#d5dade', { boil: .3 }) }); stroke([[-760, 1000], [-400, 1000]], 6); stroke([[-440, 820], [-440, 920]], 9); stroke([[-440, 1060], [-440, 1200]], 9); }
  // Bild an der Wand
  shape(rr(300, 520, 220, 160, 8), { fill: '#ffcf6b', lw: 6, shade: () => fillOnly(spline([[300, 680], [380, 590], [450, 640], [520, 560], [520, 680]]), '#e98c43', { boil: .3 }) });
}
function paketwagen(t) {
  bands(['#ff7a2f', '#ff8f4a', '#ffa566', '#ffb862'], -900, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#1f6f6c', { boil: 0 }); stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  for (const sx of [-560, 1240]) {   // Regale
    shape(rect(sx, 300, 400, 1200), { fill: '#2b9c98', lw: 8 });
    for (let r = 0; r < 4; r++) { stroke([[sx, 560 + r * 280], [sx + 400, 560 + r * 280]], 7); for (let k = 0; k < 2; k++) shape(rect(sx + 30 + k * 190, 400 + r * 280 + (hash(r * 3 + k) * 40), 160, 150 - hash(r * 3 + k) * 40), { fill: hash(r + k * 7) > .5 ? PAL.box : '#d9a066', lw: 6 }); }
  }
  // Tür hinten mit Fenster
  shape(rr(280, 420, 520, 900, 30), { fill: '#145653', lw: 8 }); shape(rr(360, 500, 360, 260, 20), { fill: '#ffe1b0', lw: 6 });
  text('ZUSTELLUNG', 540, 1060, { font: '800 56px "Baloo 2"', fill: '#ffb862' });
}
// Portal (die einzige Glühfarbe: Magenta)
function portal(cx, cy, r, t, open = 1) {
  if (open <= .001) return;
  const R = r * open;
  push(); translate(cx, cy); scale(.78, 1);
  fillOnly(ell(0, 0, R * 1.5, R * 1.42, 44), 'rgba(255,79,216,.16)', { boil: .6 });
  const rim = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k = 1 + .08 * Math.sin(i * 2.3 + t * 3) + .05 * Math.sin(a * 5 + t * 6); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), {
    fill: '#ff4fd8', lw: 8, shade: () => {
      fillOnly(ell(0, 0, R * .9, R * .9, 40), '#ff8de6', { boil: .3 });
      for (let k = 0; k < 5; k++) { const a1 = [], a2 = []; for (let j = 0; j <= 20; j++) { const u = j / 20, rr_ = R * (1 - u) * .95, a = k / 5 * TAU + u * 3.6 + t * 2.6; a1.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const b = a + .55 * (1 - u * .7); a2.push([Math.cos(b) * rr_, Math.sin(b) * rr_]); } fillOnly([...a1, ...a2.reverse()], k % 2 ? '#3ff0ff' : '#c2189b', { boil: .4 }); }
      fillOnly(ell(0, 0, R * .28, R * .28, 22), '#ffd6f5', { boil: .5 });
    }
  });
  for (let i = 0; i < 10; i++) { const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1)); dot(Math.cos(a) * d, Math.sin(a) * d, 6, i % 3 ? '#ffb3ec' : '#ffffff'); }
  pop();
}
// Swirl-Wischer über den ganzen Schirm
function swirl(u) {
  if (u <= 0 || u >= 1) return;
  const k = u < .5 ? eo(u * 2) : 1 - ei((u - .5) * 2);
  reset(); translate(W / 2, H / 2);
  const R = 1500 * k;
  for (let a = 0; a < 6; a++) { const p = []; for (let j = 0; j <= 30; j++) { const v = j / 30, rr_ = R * v, ang = a / 6 * TAU + v * 5 + u * 8; p.push([Math.cos(ang) * rr_, Math.sin(ang) * rr_]); } const p2 = p.map(([x, y], j) => { const ang = Math.atan2(y, x) + .5; const d = Math.hypot(x, y); return [Math.cos(ang) * d, Math.sin(ang) * d]; }).reverse(); fillOnly([...p, ...p2], a % 2 ? '#ff4fd8' : '#7a1d6b', { boil: .3 }); }
}

// —— Untertitel ——
const SUB_COL = { KALLE: '#ff8a3d', RUDI: '#2ec4b6' };
function subtitles(t) {
  const out = [];
  for (const [id, t0] of Object.entries(VO)) {
    const L = LINE[id], t1 = t0 + Math.max(1.8, vdur(id) + .6);
    if (id === 'cta') continue;
    if (t >= t0 - .05 && t < t1) out.push(L);
  }
  if (!out.length) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const L = out[out.length - 1];
  g.font = '800 58px "Baloo 2"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const words = L.sub.split(' '), lines = []; let cur = '';
  for (const w of words) { const tryL = cur ? cur + ' ' + w : w; if (g.measureText(tryL).width > 900) { lines.push(cur); cur = w; } else cur = tryL; }
  lines.push(cur);
  const y0 = 1640 - (lines.length - 1) * 34;
  lines.forEach((ln, i) => { g.lineWidth = 13; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(ln, W / 2, y0 + i * 68); g.fillStyle = '#fff'; g.fillText(ln, W / 2, y0 + i * 68); });
  // Sprecher-Pille
  const name = L.who === 'KALLE' ? 'Kalle' : 'Rudi';
  g.font = '800 34px "Baloo 2"'; const pw = g.measureText(name).width + 40;
  reset(); shape(rr(W / 2 - pw / 2, y0 - 96, pw, 52, 26), { fill: SUB_COL[L.who], lw: 6 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.font = '800 34px "Baloo 2"'; g.fillText(name, W / 2, y0 - 69);
}

// —— Posen ——
const KX = 330, RX = 790;
function K(t, o = {}) { const m = talk('KALLE', t), tq = q(t); return { x: KX, y: FLOOR, s: 1.55, face: 1, t, nerv: .25, look: [.4, 0], blink: blinkK(t), brow: .4, mouth: { o: m.o * 1.1, w: m.w, sm: .1 }, sq: 1 + .01 * Math.sin(tq * 2.6), headTilt: m.on ? (m.o - .3) * .1 : 0, ...o }; }
function R(t, o = {}) { const m = talk('RUDI', t); return { x: RX, y: FLOOR, s: 1.25, t, o: m.o, look: [-.5, .1], lid: .5, stalk: .8, blink: Math.floor(t * 2) % 2 === 0, ...o }; }

// —— Shots ——
const SH = [
  { t: 0, d: 2.05, f: (t, l) => {   // 1 Insert: Zettel an der Tür
      cam(560, 760 + l * 10, 1.9 + l * .12); treppenhaus(t); zettel(540, 700, 1.25, -.05 + Math.sin(q(t) * 3) * .01);
    } },
  { t: 2.05, d: 2.6, f: (t, l) => {   // 2 Close Kalle schreit
      const sh = (t > 2.15 && t < 2.6) ? 16 : 0;
      cam(540, 1010, 2.1, sh, t); treppenhaus(t);
      kalle(K(t, { x: 540, s: 1.6, brow: -1, nerv: 1, look: [0, -.1], eyeS: 1.15, pupil: 4, mouth: { o: talk('KALLE', t).o * 1.5, w: 1.1, sm: -.6 }, armL: { h: [-80, -60], bend: -30, fist: true }, armR: { h: [80, -60], bend: 30, fist: true }, hold: (a, b) => zettel(b[0] + 30, b[1] - 70, .45, .25) }));
    } },
  { t: 4.65, d: 5.85, f: (t, l) => {   // 3 Two-Shot Wohnzimmer
      cam(560, 1080, .98 + l * .04); wohnzimmer(t);
      const kt = talk('KALLE', t);
      kalle(K(t, { brow: kt.on ? -.4 : .6, look: t > 8 ? [.6, .2] : [.6, -.1], armR: t > 5.3 && t < 7.5 ? { h: [90, -40], bend: 40, fist: true } : undefined, lid: t > 8.9 ? .35 : .05 }));
      rudi(R(t, { stalk: t > 7.8 ? .9 : .6 }));
    } },
  { t: 10.5, d: 4.4, f: (t, l) => {   // 4 Wide: Gerät + Portal öffnet
      const open = t < 11.7 ? 0 : back(clamp((t - 11.7) / .32), 1.4);
      cam(560 + l * 30, 1000, .92 + l * .1); wohnzimmer(t);
      portal(840, 1040, 300, t, open);
      if (open > 0) screenRect('#ff4fd8', .06 * open);
      reset(); cam(560 + l * 30, 1000, .92 + l * .1);
      geraet(330 + 120, FLOOR - 520, 1.1, { press: t > 11.55 && t < 11.8 ? 1 : 0, glow: open });
      kalle(K(t, { x: 260, look: [.7, -.1], brow: open ? -.2 : .2, armR: { h: [120, 20], bend: 30 }, mouth: { ...K(t).mouth, sm: open ? .7 : .1 } }));
      rudi(R(t, { x: 640, s: .9, look: [.4, -.3], lid: .55 }));
    } },
  { t: 14.9, d: 2.0, f: (t, l) => {   // 5 Reaction Close Rudi
      cam(790, 1050, 2.1 + l * .05); wohnzimmer(t); portal(1150, 900, 300, t, 1);
      rudi(R(t, { look: [0, .1], lid: .5, stalk: .9 }));
    } },
  { t: 16.9, d: 2.5, f: (t, l) => {   // 6 Kalle springt, wird eingesaugt, Rush-Zoom
      const z = t < 18.6 ? .95 : .95 + ei(seg(t, 18.6, 19.4)) * 3;
      cam(lerp(560, 840, seg(t, 18.6, 19.4)), lerp(1000, 1040, seg(t, 18.6, 19.4)), z); wohnzimmer(t);
      portal(840, 1040, 300, t, 1); screenRect('#ff4fd8', .06);
      reset(); cam(lerp(560, 840, seg(t, 18.6, 19.4)), lerp(1000, 1040, seg(t, 18.6, 19.4)), z);
      const ju = seg(t, 17.85, 18.6), x = lerp(300, 840, ju), y = FLOOR - Math.sin(ju * Math.PI) * 420 - ju * 300;
      const suck = seg(t, 18.35, 18.75), s = 1.5 * (1 - suck * .9);
      if (suck < 1) kalle(K(t, { x, y, s, sq: 1 + ju * .3, lean: ju * .6, brow: -.8, nerv: ju ? 0 : .6, armL: { h: [-60, -140], bend: -20 }, armR: { h: [60, -140], bend: 20 }, mouth: { o: t > 17.85 ? .7 : talk('KALLE', t).o, w: 1, sm: .4 } }));
      rudi(R(t, { x: 820, s: .8, look: [.3, -.3] }));
      swirl(seg(t, 19.0, 19.8));
    } },
  { t: 19.4, d: 3.6, f: (t, l) => {   // 7 Paketwagen-Welt
      cam(540 + Math.sin(l * 3) * 20, 1000, 1.0); paketwagen(t);
      const ar = seg(t, 19.4, 19.9), grab = t > 20.7;
      const kx = lerp(-100, 380, eo(ar)), sq = landSq(t, 19.9);
      karton(grab ? kx + 150 : 640, grab ? FLOOR - 330 : FLOOR, grab ? 1.1 : 1.2, { label: 'KALLE' });
      kalle(K(t, { x: kx, sq, brow: grab ? .2 : -.4, look: [1, .4], mouth: { o: grab ? .5 : 0, w: 1.1, sm: grab ? .9 : 0 }, armR: grab ? { h: [110, -70], bend: 10 } : { h: [120, 40], bend: 20 }, armL: grab ? { h: [140, -70], bend: 10 } : undefined }));
      portal(200, 900, 260, t, clamp((t - 21.9) / .3));
      swirl(seg(t, 22.4, 23.2));
    } },
  { t: 23.0, d: 3.45, f: (t, l) => {   // 8 Landung + Triumph
      cam(560, 1040, 1.0); wohnzimmer(t);
      const sq = landSq(t, 23.15), up = seg(t, 23.0, 23.15);
      kalle(K(t, { y: FLOOR - (1 - up) * 300, sq, brow: .1, look: [0, -.4], mouth: { o: talk('KALLE', t).o * 1.4, w: 1.2, sm: 1 }, armL: { h: [-60, -230], bend: -10 }, armR: { h: [60, -230], bend: 10 },
        hold: (a, b) => karton((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 30, .75, { label: 'KALLE' }) }));
      rudi(R(t, { look: [-.6, -.2], lid: .55 }));
    } },
  { t: 26.45, d: 3.95, f: (t, l) => {   // 9 Insert: Karton auf → Türklingel
      cam(540, 1180, 1.7 + l * .08); wohnzimmer(t, { fridge: false });
      const op = eo(seg(t, 27.0, 27.6)), rise = eo(seg(t, 27.5, 28.2));
      if (rise > 0) klingel(540, 1180 - rise * 260, 1.1, { glow: seg(t, 28.2, 28.6) * (1 - seg(t, 29.6, 30)) });
      karton(540, 1400, 1.35, { open: op, label: 'KALLE' });
    } },
  { t: 30.4, d: 3.6, f: (t, l) => {   // 10 Two-Shot, tote Stille, Rudis Satz
      cam(560, 1080, 1.0 + l * .1); wohnzimmer(t);
      kalle(K(t, { nerv: 0, brow: .9, lid: .45, look: [0, .2], mouth: { o: 0, sm: -.6 }, armL: { h: [-20, 80], bend: -10 }, armR: { h: [40, 60], bend: 10 },
        hold: (a, b) => klingel(b[0] + 10, b[1] - 40, .55) }));
      rudi(R(t, { look: [-.7, 0], lid: .55, stalk: 1 }));
    } },
  { t: 34.0, d: 4.6, f: (t, l) => {   // 11 Endkarte
      reset(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
      if (logo.naturalWidth) g.drawImage(logo, 0, 0, W, H);
      const p = back(clamp((t - 34.15) / .35), 1.6);
      g.save(); g.translate(W / 2, 300); g.scale(p, p); g.font = '400 110px "Titan One"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('Kennst du das?', 0, 0); g.fillStyle = '#ffffff'; g.fillText('Kennst du das?', 0, 0); g.restore();
      const p2 = clamp((t - 35.9) / .3);
      g.globalAlpha = p2; g.font = '800 54px "Baloo 2"'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = INK;
      for (const [s, y] of [['Schreib\'s in die Kommentare 👇', 1560], ['und folg für mehr!', 1640]]) { g.strokeText(s, W / 2, y); g.fillStyle = '#ff4fd8'; g.fillText(s, W / 2, y); }
      g.globalAlpha = 1;
    } },
];
function shotAt(t) { for (let i = SH.length - 1; i >= 0; i--) if (t >= SH[i].t) return SH[i]; return SH[0]; }

window.DUR = DUR;
window.render = t => {
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const s = shotAt(t); S.lw = 7; s.f(t, clamp((t - s.t) / s.d));
  if (t < 34.0) subtitles(t);
};
// Ereignisse für die Mischung
window.EV = [
  { t: 0.0, type: 'stab' }, { t: 0.15, type: 'paper' }, { t: 2.05, type: 'stab' },
  { t: 4.65, type: 'music', cue: 'groove' }, { t: 5.3, type: 'blip' }, { t: 8.0, type: 'blip' },
  { t: 11.55, type: 'click' }, { t: 11.7, type: 'portal' }, { t: 15.0, type: 'blip' },
  { t: 17.85, type: 'boing' }, { t: 18.35, type: 'suck' }, { t: 19.0, type: 'swirl' }, { t: 19.4, type: 'music', cue: 'world' },
  { t: 19.9, type: 'thump' }, { t: 20.7, type: 'grab' }, { t: 21.9, type: 'portal' }, { t: 22.4, type: 'swirl' },
  { t: 23.0, type: 'music', cue: 'groove' }, { t: 23.15, type: 'boing' },
  { t: 26.45, type: 'music', cue: 'stop' }, { t: 27.0, type: 'paper' }, { t: 28.2, type: 'ding' },
  { t: 33.3, type: 'kazoo' }, { t: 34.0, type: 'music', cue: 'end' },
];
window.VO = VO;
window.TEXTS = t => [];
window.READY = true;

// Kalle und das Paket — Sci-Fi Sitcom Toon, 1080×1920, 24 fps
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, bands, S, reset, noodle } from './toon.js';
import { kalle, rudi, zettel, karton, klingel, geraet, eye, PAL } from './chars.js';
import { DUR, VO, SUB_END, EV } from './shots.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
await Promise.all(['800 58px "Baloo 2"', '800 34px "Baloo 2"', '400 110px "Titan One"'].map(f => document.fonts.load(f)));
const logo = new Image(); logo.src = 'schluss.png'; await logo.decode().catch(() => { });


const q = t => Math.floor(t * 12 + 1e-6) / 12;
const vdur = id => DURS[id] ?? 1;
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + vdur(id) + .05) {
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


const FLOOR = 1500;
// —— Kulissen ——
function flur(t, { slot = 0 } = {}) {   // Wohnungsflur von innen: Tür mit Briefschlitz
  bands(['#d9c3e8', '#e2cfee', '#ead9f2'], -800, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#8b6a8f', { boil: 0 }); stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  shape(rect(300, 360, 560, 1140), { fill: '#7a5236', lw: 8, shade: () => fillOnly(rect(680, 340, 200, 1180), '#603f28', { boil: .3 }) });
  shape(rr(350, 440, 460, 360, 14), { fill: '#8b5f40', lw: 6 }); shape(rr(350, 1050, 460, 380, 14), { fill: '#8b5f40', lw: 6 });
  shape(ell(800, 960, 20, 20, 16), { fill: '#d9a441', lw: 6 });
  // Briefschlitz (Klappe geht auf)
  shape(rr(480, 880, 200, 60, 10), { fill: '#3a2a20', lw: 6 });
  push(); translate(480, 880); scale(1, 1 - slot * .8); shape(rr(0, 0, 200, 60, 10), { fill: '#d9a441', lw: 6 }); pop();
  shape(rr(-500, 300, 300, 380, 10), { fill: '#fff6d6', lw: 6, shade: () => fillOnly(rect(-500, 520, 300, 160), '#9bd0b8', { boil: .2 }) });   // Bild: Landschaft
}
function stuhl(x, y, s = 1) {   // Campingstuhl + Thermoskanne
  push(); translate(x, y); scale(s);
  stroke([[-120, 0], [100, -220]], 9); stroke([[120, 0], [-100, -220]], 9);
  shape(spline([[-130, -230], [130, -230], [120, -150], [-120, -150]]), { fill: '#2b7fd6', lw: 7 });
  shape(spline([[-120, -240], [-110, -420], [110, -420], [120, -240]]), { fill: '#3b8fe6', lw: 7 });
  shape(rr(180, -170, 50, 170, 14), { fill: '#d6283f', lw: 6 }); shape(rr(176, -196, 58, 34, 8), { fill: '#444', lw: 5 });
  pop();
}
function handy(t, { app = 0 } = {}) {   // Insert Handy: Push-Nachricht bzw. Sendungsverfolgung
  bands(['#2a1f3d', '#33264a'], -400, 2400, -400, 1600);
  shape(rr(170, 220, 740, 1480, 80), { fill: '#16121c', lw: 9 });
  shape(rr(210, 300, 660, 1330, 40), { fill: app ? '#fff7e8' : '#2f6fd6', lw: 5 });
  const pop_ = back(clamp((t - (app ? 6.15 : 3.25)) / .3), 1.6);
  if (!app) {
    text('Samstag', 540, 470, { font: '800 52px "Baloo 2"', fill: '#fff' }); text('14:37', 540, 600, { font: '400 150px "Titan One"', fill: '#fff' });
    push(); translate(540, 900); scale(pop_); shape(rr(-300, -110, 600, 220, 30), { fill: '#ffffff', lw: 6 });
    text('📦 PAKETDIENST', -110, -60, { font: '800 34px "Baloo 2"' }); text('Ihr Paket wurde', 0, -4, { font: '800 44px "Baloo 2"' }); text('ZUGESTELLT ✅', 0, 52, { font: '800 50px "Baloo 2"', fill: '#1f9d55' }); pop();
  } else {
    text('Sendungsverfolgung', 540, 400, { font: '800 50px "Baloo 2"' });
    for (const [i, s_] of ['Paket im Zustellfahrzeug', 'Zustellversuch: niemand da', 'Abgelegt am sicheren Ort:'].entries()) { dot(270, 520 + i * 110, 12, '#1f9d55'); text(s_, 300, 520 + i * 110, { font: '700 40px "Baloo 2"', align: 'left' }); }
    push(); translate(540, 980); scale(pop_); rotate(-.06);
    shape(rr(-280, -90, 560, 180, 24), { fill: '#ff4f6d', lw: 7 }); text('MÜLLTONNE 🗑️', 0, 4, { font: '400 70px "Titan One"', fill: '#fff' }); pop();
  }
}
// Welten (eigene Palette je Welt)
function welt_tonne(t) {   // Hinterhof bei Nacht: grün/grau
  bands(['#1f3b3a', '#24514a', '#2c6655'], -800, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#3d4a3f', { boil: 0 }); stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  for (const [x, c] of [[120, '#2e8b57'], [880, '#4a5fd6']]) { shape(rr(x - 170, 900, 340, 600, 20), { fill: c, lw: 8 }); stroke([[x - 140, 1000], [x + 140, 1000]], 6); }
  shape(rr(320, 860, 440, 640, 24), { fill: '#6b6f78', lw: 8, shade: () => fillOnly(rect(640, 840, 140, 680), '#55585f', { boil: .3 }) });
  push(); translate(330, 860); rotate(-.9 * ss(seg(t, 12.15, 12.4))); shape(rr(-20, -60, 460, 60, 14), { fill: '#55585f', lw: 7 }); pop();
  dot(900, 300, 46, '#f6f0c4');
}
function welt_tanke(t) {   // Tankstellen-Shop: lila/gelb
  bands(['#4b2a7a', '#5a3490', '#6a3fa6'], -800, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#e8d34a', { boil: 0 }); stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  shape(rect(-300, 360, 1700, 140), { fill: '#e8d34a', lw: 8 }); text('24/7 TANKE', 540, 434, { font: '400 90px "Titan One"', fill: '#4b2a7a' });
  shape(rect(560, 600, 520, 900), { fill: '#3b2160', lw: 8 });   // Regal voller fremder Pakete
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) shape(rect(590 + c * 160, 640 + r * 170, 140, 130), { fill: hash(r * 5 + c) > .5 ? '#c98b4f' : '#d9a066', lw: 5 });
}
function welt_nachbar(t) {   // Nachbarswohnung: mint/koralle, Paketberg
  bands(['#9fe0c8', '#b2e8d4', '#c4efdf'], -800, FLOOR, -1400, 2600);
  fillOnly(rect(-1400, FLOOR, 4000, 900), '#ff7f6b', { boil: 0 }); stroke([[-1400, FLOOR], [2600, FLOOR]], 7);
  for (let i = 0; i < 26; i++) { const x = 520 + (i % 6) * 110 - (Math.floor(i / 6) % 2) * 50, y = FLOOR - 120 - Math.floor(i / 6) * 120; shape(rect(x, y, 120, 120), { fill: hash(i) > .5 ? '#c98b4f' : '#d9a066', lw: 5 }); }
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
    const L = LINE[id], t1 = t0 + (id[0] === 'n' ? .9 : Math.max(1.8, vdur(id) + .6));
    if (id === 'cta') continue;
    if (t >= SUB_END) continue;
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
const nein = (t, t0) => { const u = t - t0; return u > -.05 && u < .6 ? 1 : 0; };
function machineShot(t, l, world, t0, nId, extra, after) {   // gleiche Einstellung in jeder Welt, nur die Welt wechselt
  const z = 1.0 + (nein(t, VO[nId]) ? .25 : 0), sh = nein(t, VO[nId]) ? 18 : 0;
  cam(560, 1040, z, sh, t); world(t);
  extra && extra(t);
  const m = talk('KALLE', t), yell = nein(t, VO[nId]);
  kalle(K(t, { brow: yell ? -1 : -.3, nerv: yell ? 1 : .4, eyeS: yell ? 1.2 : 1, pupil: yell ? 3.5 : 5, look: [.6, 0],
    mouth: { o: yell ? Math.max(.7, m.o * 1.6) : 0, w: 1.15, sm: -.7 }, armL: yell ? { h: [-90, -150], bend: -30, fist: true } : undefined, armR: yell ? { h: [90, -150], bend: 30, fist: true } : undefined, peel: world === welt_tonne,
    ...(world === welt_tonne ? { x: 540, y: FLOOR - 330 + 300 * (1 - eo(seg(t, 12.2, 12.5))), sq: landSq(t, 12.5) } : {}) }));
  after && after(t);
}
const SH = [
  { t: 0, d: 3.2, f: (t, l) => {   // 1 Lauer-Posten vor der Tür
      cam(560, 1080, 1.0 + l * .08); flur(t); stuhl(300, FLOOR, 1.2);
      kalle(K(t, { x: 300, y: FLOOR - 170, sq: .9, nerv: .35, brow: -.5, lid: .3, lower: .25, look: [.7, -.1], armR: { h: [70, -110], bend: 20, fist: true }, armL: { h: [40, -120], bend: -20, fist: true },
        hold: (a, b) => { push(); translate((a[0] + b[0]) / 2 + 20, (a[1] + b[1]) / 2 - 10); shape(rr(-50, -26, 46, 52, 14), { fill: '#333', lw: 5 }); shape(rr(6, -26, 46, 52, 14), { fill: '#333', lw: 5 }); pop(); } }));
      rudi(R(t, { x: 860, s: 1.0, look: [-.6, -.2], lid: .62 }));
    } },
  { t: 3.2, d: .8, f: (t, l) => { cam(540, 960, 1.0); handy(t); } },
  { t: 4.0, d: 1.9, f: (t, l) => {   // 3 Close Kalle: WO?!
      cam(540, 1010, 2.1, t > 4.9 && t < 5.5 ? 18 : 0, t); flur(t);
      kalle(K(t, { x: 540, s: 1.6, brow: -1, nerv: 1, eyeS: 1.2, pupil: 3.5, look: [0, -.1], mouth: { o: talk('KALLE', t).o * 1.6, w: 1.1, sm: -.7 } }));
    } },
  { t: 5.9, d: 1.7, f: (t, l) => { cam(540, 960, 1.0 + l * .05); handy(t, { app: 1 }); } },
  { t: 7.6, d: 1.4, f: (t, l) => {   // 5 Rudi Close
      cam(790, 1050, 2.1); flur(t); rudi(R(t, { look: [0, .1], lid: .55, stalk: .9 }));
    } },
  { t: 9.0, d: 2.8, f: (t, l) => {   // 6 Portal auf
      const open = t < 10.95 ? 0 : back(clamp((t - 10.95) / .3), 1.4);
      cam(560, 1040, 1.0); flur(t); portal(560, 1000, 300, t, open);
      if (open > 0) screenRect('#ff4fd8', .06 * open);
      reset(); cam(560, 1040, 1.0);
      kalle(K(t, { x: 240, brow: -.6, look: [.7, -.1], armR: { h: [130, 10], bend: 30 }, hold: (a, b) => geraet(b[0] + 40, b[1] + 60, .8, { press: t > 10.8 && t < 11 ? 1 : 0, glow: open }) }));
      rudi(R(t, { x: 870, s: .9 }));
      swirl(seg(t, 11.4, 12.0));
    } },
  { t: 11.8, d: 2.8, f: (t, l) => machineShot(t, l, welt_tonne, 11.8, 'n1', null, t => { shape(rr(320, 990, 440, 510, 24), { fill: '#6b6f78', lw: 8, shade: () => fillOnly(rect(640, 970, 140, 550), '#55585f', { boil: .3 }) }); stroke([[350, 1070], [730, 1070]], 6); }), sw: [14.3, 14.8] },
  { t: 14.6, d: 2.4, f: (t, l) => machineShot(t, l, welt_tanke, 14.6, 'n2'), sw: [16.7, 17.2] },
  { t: 17.0, d: 2.4, f: (t, l) => machineShot(t, l, welt_nachbar, 17.0, 'n3', t => {   // Nachbar umarmt Kalles Paket
      kalle({ x: 820, y: FLOOR, s: 1.35, face: -1, t, bald: true, hood: '#8e6bbf', hoodS: '#6b4f99', jeans: '#4a4a4a', brow: .2, lid: .5, look: [.3, 0], mouth: { o: 0, sm: .8 },
        armL: { h: [60, -40], bend: -10 }, armR: { h: [-40, -40], bend: 10 }, hold: (a, b) => karton((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 60, .55, { label: 'KALLE' }) });
    }), sw: [19.0, 19.6] },
  { t: 19.4, d: 3.2, f: (t, l) => {   // 10 Zurück, Stuhl, Stille, Briefschlitz
      cam(560, 1080, 1.0); const slot = clamp((t - 21.6) / .15) * (1 - clamp((t - 22.3) / .2));
      flur(t, { slot }); stuhl(300, FLOOR, 1.2);
      const fall = eo(seg(t, 19.4, 19.6)), sq = landSq(t, 19.6);
      kalle(K(t, { x: 300, y: FLOOR - 170 - (1 - fall) * 300, sq, nerv: 0, brow: .9, lid: .5, lower: .3, look: [0, .3], mouth: { o: 0, sm: -.8 }, armL: { h: [-80, 120], bend: -20 }, armR: { h: [80, 120], bend: 20 } }));
      // Karte fliegt durch den Schlitz ins Gesicht
      const u = seg(t, 21.65, 21.95);
      if (t > 21.6) zettel(lerp(580, 300, eo(u)), lerp(900, FLOOR - 170 - 340 * 1.55 + 20, eo(u)), lerp(.25, .55, u), lerp(0, 4 * Math.PI + .2, u));
      rudi(R(t, { x: 860, s: 1.0, look: [-.6, 0], lid: .6 }));
    } },
  { t: 22.6, d: 3.0, f: (t, l) => {   // 11 Close: Karte im Gesicht, Rudis Satz
      cam(330, FLOOR - 170 - 300 * 1.55, 1.9 + l * .15); flur(t); stuhl(300, FLOOR, 1.2);
      kalle(K(t, { x: 300, y: FLOOR - 170, nerv: 0, brow: .9, lid: .55, lower: .3, look: [0, .2], mouth: { o: 0, sm: -.8 }, armL: { h: [-80, 120], bend: -20 }, armR: { h: [80, 120], bend: 20 } }));
      zettel(300, FLOOR - 170 - 340 * 1.55 + 20, .55, .2);
    } },
  { t: 25.6, d: 4.8, f: (t, l) => {   // 12 Endkarte
      reset(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
      if (logo.naturalWidth) g.drawImage(logo, 0, 0, W, H);
      const p = back(clamp((t - 25.75) / .35), 1.6);
      g.save(); g.translate(W / 2, 300); g.scale(p, p); g.font = '400 110px "Titan One"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('Kennst du das?', 0, 0); g.fillStyle = '#ffffff'; g.fillText('Kennst du das?', 0, 0); g.restore();
      const p2 = clamp((t - 27.5) / .3); g.globalAlpha = p2; g.font = '800 54px "Baloo 2"'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = INK;
      for (const [s_, y] of [['Schreib\'s in die Kommentare 👇', 1560], ['und folg für mehr!', 1640]]) { g.strokeText(s_, W / 2, y); g.fillStyle = '#ff4fd8'; g.fillText(s_, W / 2, y); }
      g.globalAlpha = 1;
    } },
];
function shotAt(t) { for (let i = SH.length - 1; i >= 0; i--) if (t >= SH[i].t) return SH[i]; return SH[0]; }
// —— Cold Open (Hook): Vorblende aus der Mülltonne ——
const HOOK = 1.6;
function coldOpen(t) {
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const sh = t < .7 ? 20 * (1 - t / .7) : 0;
  cam(560, 900, 1.12 + t * .05, sh, t); welt_tonne(13);
  kalle(K(t, { x: 540, y: FLOOR - 330, brow: -1, nerv: 1, eyeS: 1.2, pupil: 3.5, look: [.2, -.2], peel: true,
    mouth: { o: .85 + .1 * Math.sin(t * 30), w: 1.15, sm: -.7 }, armL: { h: [-90, -150], bend: -30, fist: true }, armR: { h: [90, -150], bend: 30, fist: true } }));
  shape(rr(320, 990, 440, 510, 24), { fill: '#6b6f78', lw: 8, shade: () => fillOnly(rect(640, 970, 140, 550), '#55585f', { boil: .3 }) }); stroke([[350, 1070], [730, 1070]], 6);
  // Hook-Text
  const p = back(clamp(t / .25), 1.6);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.translate(W / 2 + (sh ? (hash(Math.floor(t * 24)) - .5) * sh : 0), 300); g.rotate(-.05); g.scale(p, p);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = '400 66px "Titan One"'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('Mein Paket liegt in der', 0, -70); g.fillStyle = '#fff'; g.fillText('Mein Paket liegt in der', 0, -70);
  g.font = '400 120px "Titan One"'; g.lineWidth = 20; g.strokeText('MÜLLTONNE?!', 0, 60); g.fillStyle = '#ff4fd8'; g.fillText('MÜLLTONNE?!', 0, 60);
  g.restore();
  if (t > HOOK - .2) screenRect('#ffffff', (t - (HOOK - .2)) / .2 * .9);   // Blitz-Schnitt
}
function flashback(t) {   // Einblendung „Eine Stunde vorher…“
  if (t > 1.4) return; const a = Math.min(1, t / .15) * (1 - seg(t, 1.1, 1.4));
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.font = '800 64px "Baloo 2"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeText('Eine Stunde vorher…', W / 2, 260); g.fillStyle = '#ffd84d'; g.fillText('Eine Stunde vorher…', W / 2, 260); g.globalAlpha = 1;
}
window.DUR = DUR + HOOK;
window.render = T => {
  if (T < HOOK) return coldOpen(T);
  const t = T - HOOK;
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const s = shotAt(t); S.lw = 7; s.f(t, clamp((t - s.t) / s.d));
  if (s.sw) swirl(seg(t, s.sw[0], s.sw[1]));
  subtitles(t); flashback(t);
};
window.EV = [{ t: 0.02, type: 'stab' }, { t: 0.1, type: 'lid' }, { t: 1.45, type: 'swirl' }, ...EV.map(e => ({ ...e, t: e.t + HOOK }))];
window.VO = VO; window.TEXTS = t => []; window.READY = true;

// „Durch die Lappen gehen“ — Paper Pop-up Book, 1080×1920 (Serie „Woher kommt das?“)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, seg, eio, eo, back, mulberry, track } from './lib.js';
import * as A from './art.js';
import { cv, paperFill, crescent, sh, blob, INK, finishCut } from './paper.js';
import { makeBook, coverCanvases, texOf, BW, BD, PG } from './book.js';
import { cutMesh, blobShadow } from './cutmesh.js';
import { makePost } from './post.js';

const W = 1080, H = 1920, TAU = Math.PI * 2;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const ov = document.getElementById('ov'), OX = ov.getContext('2d');
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(36, W / H, .004, 30);
const post = makePost(renderer, scene, cam, W, H);

await Promise.all(['600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"', '40px "IM Fell English"', 'italic 40px "IM Fell English"'].map(f => document.fonts.load(f, 'Aa')));
const TL = await (await fetch('timeline.json')).json();
const VO = TL.vo, DUR = TL.dur, K = Object.fromEntries(VO.map(v => [v.id, v.t0]));

// ---------- Raum: warmes Zimmerlicht, Walnuss-Tisch, Lampe, Tee ----------
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
scene.background = new THREE.Color('#3b2c22');
const tl = new THREE.TextureLoader(), AS = '/core/assets/polyhaven/';
const wt = n => { const t = tl.load(`${AS}walnut_${n}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.4); return t; };
const wdiff = wt('diff'); wdiff.colorSpace = THREE.SRGBColorSpace;
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, 1.7), new THREE.MeshStandardMaterial({ map: wdiff, normalMap: wt('nor'), roughnessMap: wt('rough'), color: '#c9a88a', envMapIntensity: .7 }));
desk.position.set(0, -.02, .25); desk.receiveShadow = true; scene.add(desk);
const gl = new GLTFLoader();
async function prop(name, x, z, s, ry) {
  try { const m = (await gl.loadAsync(`${AS}${name}/${name}.gltf`)).scene; m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry;
    m.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(m); return m; } catch (e) { return null; }
}
const lamp = await prop('desk_lamp_arm_01', -.36, .02, .55, .5);
if (lamp) lamp.traverse(o => { if (o.isMesh && o.material.name.includes('light')) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffd9a0'); o.material.emissiveIntensity = 6; } });
// (Teeservice entfernt: ragte ins Bild)

const key = new THREE.DirectionalLight('#ffe3c0', 2.4); key.position.set(-.45, .8, .55); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -.4, right: .4, top: .4, bottom: -.4, near: .1, far: 3 }); key.shadow.bias = -.0004; scene.add(key);
scene.add(new THREE.HemisphereLight('#fff1dc', '#5a4030', .7));
const warm = new THREE.PointLight('#ffb870', 1.2, 2.5); warm.position.set(-.3, .45, .2); scene.add(warm);

// ---------- Buch ----------
function coverIcon(x, px, py, w, h) {   // runde Vignette: rot-weiße Lappen an einer Leine
  x.save(); x.translate(px, py);
  x.strokeStyle = INK; x.lineWidth = 8; x.beginPath(); x.moveTo(0, h * .38); x.quadraticCurveTo(w * .5, h * .5, w, h * .38); x.stroke();
  for (let i = 0; i < 7; i++) { const u = (i + .5) / 7, xx = u * w, yy = h * .38 + Math.sin(Math.PI * u) * h * .12;
    x.fillStyle = i % 2 ? '#f6f0e2' : '#c8322a'; x.beginPath(); x.moveTo(xx - 26, yy); x.lineTo(xx + 26, yy); x.lineTo(xx + 30, yy + 90); x.lineTo(xx - 22, yy + 94); x.closePath(); x.fill(); x.lineWidth = 6; x.stroke(); }
  x.restore();
}
const book = makeBook(coverCanvases(coverIcon));
scene.add(book.root);
// Seiten: Waldboden + Abendhimmel
{
  const gw = 2048, gh = Math.round(2048 * BD / BW);
  const g = cv(gw, gh), x = g.getContext('2d'); paperFill(x, gw, gh, '#7fae5a', 3, .08);
  const R = mulberry(4); x.strokeStyle = '#5f8f44'; x.lineWidth = 9; x.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const px = R() * gw, py = R() * gh; x.beginPath(); x.moveTo(px - 12, py); x.lineTo(px - 4, py - 26); x.moveTo(px + 4, py); x.lineTo(px + 8, py - 30); x.stroke(); }
  x.fillStyle = '#b07a46'; for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(R() * gw, R() * gh, 14, 8, R() * 3, 0, TAU); x.fill(); }
  book.groundMat.map = texOf(g); book.groundMat.needsUpdate = true;
  const s = cv(gw, gh), y = s.getContext('2d'); const gr = y.createLinearGradient(0, 0, 0, gh);
  gr.addColorStop(0, '#f6b26b'); gr.addColorStop(.55, '#ffd9a0'); gr.addColorStop(1, '#ffe9c4'); y.fillStyle = gr; y.fillRect(0, 0, gw, gh);
  paperFill(y, gw, gh, 'rgba(0,0,0,0)', 5, .05);
  y.fillStyle = '#ffe680'; y.beginPath(); y.arc(gw * .28, gh * .62, 150, 0, TAU); y.fill(); y.lineWidth = 12; y.strokeStyle = INK; y.stroke();
  y.fillStyle = '#5d8a4a'; y.beginPath(); y.moveTo(0, gh); for (let i = 0; i <= 12; i++) y.lineTo(i / 12 * gw, gh * (.78 + .08 * Math.sin(i * 1.7))); y.lineTo(gw, gh); y.fill(); y.stroke();
  book.backMat.map = texOf(s); book.backMat.needsUpdate = true;
}

// ---------- Papier-Figuren (eigene Zeichnungen) ----------
const LW = 14;
const DEER_COL = '#b7753e', DEER_SH = '#8e5428';
function deerArt(pose) {          // Profil nach rechts, Kopf vorn
  return A.cut(.105, .11, (x, Wp, Hp) => {
    const s = Wp / 520; x.scale(s, s);
    const legs = pose === 'leap' ? [[352, 300, 470, 330], [320, 305, 430, 360], [150, 305, 40, 330], [120, 300, 20, 360]]
      : pose === 'run' ? [[352, 300, 400, 440], [320, 305, 290, 440], [150, 305, 190, 440], [120, 300, 70, 440]]
      : [[352, 300, 360, 470], [322, 305, 318, 470], [150, 305, 156, 470], [118, 300, 112, 470]];
    x.lineCap = 'round';
    for (const [a, b, c2, d] of legs) { x.strokeStyle = INK; x.lineWidth = 34; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); x.strokeStyle = DEER_SH; x.lineWidth = 20; x.stroke(); }
    const body = () => { x.beginPath(); x.moveTo(90, 250); x.bezierCurveTo(100, 180, 260, 170, 360, 190); x.bezierCurveTo(400, 160, 410, 110, 420, 80);
      x.bezierCurveTo(440, 50, 490, 60, 510, 92); x.lineTo(500, 108); x.bezierCurveTo(470, 110, 450, 130, 440, 170); x.bezierCurveTo(420, 230, 400, 300, 340, 318);
      x.bezierCurveTo(260, 330, 160, 330, 110, 310); x.bezierCurveTo(70, 300, 66, 270, 90, 250); x.closePath(); };
    crescent(x, body, DEER_SH, 0, 26, DEER_COL); body(); sh(x, null, LW);
    x.beginPath(); x.ellipse(150, 260, 40, 26, 0, 0, TAU); x.fillStyle = '#e8c99a'; x.fill();               // heller Spiegel
    x.beginPath(); x.moveTo(420, 82); x.lineTo(400, 40); x.lineTo(440, 70); x.closePath(); sh(x, DEER_SH, 10); // Ohr
    x.strokeStyle = INK; x.lineWidth = 12; x.lineCap = 'round';                                           // Geweih
    x.beginPath(); x.moveTo(445, 70); x.lineTo(430, 20); x.lineTo(400, -10); x.moveTo(432, 28); x.lineTo(465, 0); x.moveTo(460, 72); x.lineTo(478, 24); x.lineTo(500, 0); x.stroke();
    x.strokeStyle = '#d9b07a'; x.lineWidth = 5; x.stroke();
    x.beginPath(); x.arc(478, 82, 9, 0, TAU); x.fillStyle = INK; x.fill(); x.beginPath(); x.arc(481, 79, 3, 0, TAU); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.arc(508, 98, 7, 0, TAU); x.fillStyle = INK; x.fill();
  }, { pad: 40, border: 16 });
}
function hunterArt() {
  return A.cut(.06, .13, (x, Wp, Hp) => {
    const s = Wp / 300; x.scale(s, s);
    x.lineCap = 'round';
    for (const [a, b, c2, d] of [[120, 420, 110, 640], [180, 420, 196, 640]]) { x.strokeStyle = INK; x.lineWidth = 40; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); x.strokeStyle = '#5a4a3a'; x.lineWidth = 26; x.stroke(); }
    const coat = () => { x.beginPath(); x.moveTo(90, 200); x.bezierCurveTo(150, 180, 210, 190, 230, 210); x.lineTo(250, 450); x.lineTo(60, 450); x.closePath(); };
    crescent(x, coat, '#3f6a3a', 24, 0, '#5c8f4f'); coat(); sh(x, null, LW);
    x.strokeStyle = INK; x.lineWidth = 34; x.beginPath(); x.moveTo(220, 230); x.lineTo(290, 320); x.stroke(); x.strokeStyle = '#5c8f4f'; x.lineWidth = 20; x.stroke();  // Arm
    blob(x, 160, 140, 58, 64, .03, 3); sh(x, '#f2c9a0', LW);                                   // Kopf
    x.beginPath(); x.arc(185, 132, 8, 0, TAU); x.fillStyle = INK; x.fill();
    x.beginPath(); x.ellipse(160, 88, 110, 22, 0, 0, TAU); sh(x, '#6b4a2e', 10);                // Hut
    x.beginPath(); x.moveTo(110, 86); x.lineTo(120, 30); x.lineTo(200, 30); x.lineTo(210, 86); x.closePath(); sh(x, '#6b4a2e', 10);
    x.beginPath(); x.moveTo(204, 40); x.lineTo(236, 6); x.lineWidth = 8; x.strokeStyle = '#c8322a'; x.stroke();       // Feder
  }, { pad: 40, border: 16 });
}
function flagArt(red) {
  return A.cut(.014, .024, (x, Wp, Hp) => { x.beginPath(); x.moveTo(0, 0); x.lineTo(Wp, 0); x.lineTo(Wp * 1.05, Hp); x.lineTo(Wp * .05, Hp * .96); x.closePath(); sh(x, red ? '#c8322a' : '#f7f1e3', 8); }, { pad: 16, border: 8, ay: 0 + 16 / (Math.ceil(.024 * A.PPM) + 32) });
}
function logoArt() {
  const img = new Image(); img.src = 'logo.png';
  return img.decode().then(() => A.cut(.11, .11, (x, Wp, Hp) => { x.save(); x.beginPath(); x.arc(Wp / 2, Hp / 2, Wp / 2, 0, TAU); x.clip(); x.drawImage(img, 0, 0, Wp, Hp); x.restore(); x.beginPath(); x.arc(Wp / 2, Hp / 2, Wp / 2, 0, TAU); x.lineWidth = 12; x.strokeStyle = INK; x.stroke(); }, { pad: 30, border: 18 }));
}

// ---------- Aufbau auf der Seite (stage: x −.22….22, z 0 Rücken … .30 Leser) ----------
const pops = [];
function popper(item, x, y, z, rise, o = {}) {
  const g = new THREE.Group(), m = cutMesh(item, { s: o.s ?? 1 }); g.add(m); g.position.set(x, y, z); g.rotation.y = o.ry ?? 0;
  book.stage.add(g); const p = { g, rise, fold: o.fold ?? 1e9, sway: o.sway ?? 0, ph: o.ph ?? 0 }; pops.push(p); return p;
}
const R = mulberry(11);
for (let i = 0; i < 9; i++) popper(A.pine(.13 + R() * .05, ['#3f7a4a', '#4d8a52', '#2f6a44'][i % 3], '#24573a', 20 + i), -.2 + i * .05 + (R() - .5) * .02, 0, .02 + R() * .03, 0, { sway: .02, ph: i });
for (let i = 0; i < 6; i++) popper(A.pine(.09 + R() * .03, '#5a9a58', '#3d7a44', 40 + i), -.19 + i * .075, 0, .075 + R() * .02, 0, { sway: .02, ph: i * 2 });
for (const [i, bx] of [[0, -.19], [1, .19]]) popper(A.bush(.05, .03, '#6aa85a', '#4c8a44', 60 + i, false), bx, 0, .27, 0);
const forestP = pops.slice();
// Leine mit Lappen
const ROPE_Z = .17, ROPE_Y = .045, GAP = [.015, .065];
const posts = [-.2, -.07, .1, .2].map((x, i) => popper(A.cut(.006, .05, (c, w, h) => { c.fillRect(0, 0, w, h); sh(c, '#8a5a30', 8); }, { pad: 10, border: 6 }), x, 0, ROPE_Z, 0));
const ropeMesh = new THREE.Mesh(new THREE.CylinderGeometry(.0008, .0008, .42, 6), new THREE.MeshStandardMaterial({ color: '#e7dcc2', roughness: .9 }));
ropeMesh.rotation.z = Math.PI / 2; ropeMesh.position.set(0, ROPE_Y, ROPE_Z); ropeMesh.castShadow = true; book.stage.add(ropeMesh);
const FR = flagArt(true), FW = flagArt(false), flags = [];
for (let x = -.2, i = 0; x <= .2; x += .019, i++) {
  if (x > GAP[0] && x < GAP[1]) continue;
  const g = new THREE.Group(), m = cutMesh(i % 2 ? FW : FR); g.add(m);
  g.position.set(x, ROPE_Y, ROPE_Z + .001); book.stage.add(g); flags.push({ g, x, i });
}
const hunter = popper(hunterArt(), -.12, 0, .215, 0);
const deerItems = { stand: deerArt('stand'), run: deerArt('run'), leap: deerArt('leap') };
const deer = {}; for (const k in deerItems) { deer[k] = cutMesh(deerItems[k]); deer[k].visible = false; book.stage.add(deer[k]); }
const deerShadow = blobShadow(.03, .4); book.stage.add(deerShadow);
const signItem = A.sign(.2, 'Durch die Lappen gegangen!', '700 92px Fredoka');
const sign = popper(signItem, 0, 0, .245, 1e9);
const logo = popper(await logoArt(), 0, .035, .2, 1e9);
const wds = popper(A.sign(.15, "Wusstest du's?", '700 110px Fredoka'), 0, 0, .25, 1e9);

// ---------- Zeitplan ----------
const OPEN0 = K.l2 - .1, FOREST0 = OPEN0 + 1.3, LINE0 = K.l3, HUNT0 = K.l3 + .2, DEER0 = K.l4, RUN0 = K.l5 + .1, LEAP0 = K.l5 + .9, GONE = LEAP0 + 1.0;
const SIGN0 = K.l6 + 1.6, END0 = K.l7 - .2;
forestP.forEach((p, i) => { p.rise = FOREST0 + (.3 - p.g.position.z) * 3 + (i % 5) * .03; p.fold = END0; });
posts.forEach((p, i) => { p.rise = LINE0 + i * .15; p.fold = END0; });
hunter.rise = HUNT0; hunter.fold = END0;
sign.rise = SIGN0; sign.fold = END0; logo.rise = END0 + .5; wds.rise = END0 + .25;
window.EV = [{ t: OPEN0, type: 'creak' }, ...pops.filter(p => p.rise < 1e8).map(p => ({ t: p.rise, type: 'pop' })), { t: LEAP0, type: 'leap' }];

// ---------- Kamera (Position, Ziel) ----------
const CAM = track([
  [0, [.05, .78, .44, .05, .0, .155]],             // Hook: Cover-Titel von oben, formatfüllend
  [OPEN0 - .2, [.05, .76, .46, .05, .0, .155]],
  [FOREST0 + 1.2, [0, .2, .78, 0, .06, .12]],      // aufgeklapptes Buch, Wald
  [LINE0 + 1.5, [-.09, .1, .56, -.08, .05, .17]],  // Leine, Jäger
  [DEER0 + .4, [-.035, .11, .55, -.035, .06, .13]],  // Hirsch hinter den Lappen
  [LEAP0, [-.01, .09, .56, -.01, .05, .16]],       // Augenhöhe
  [GONE + .4, [.03, .11, .64, .03, .05, .19]],
  [K.l6 + 1.2, [-.07, .11, .6, -.07, .06, .19]],   // Jäger an der Lücke – zu spät
  [SIGN0 + .6, [0, .14, .66, 0, .05, .2]],
  [END0 + 1.2, [0, .26, .66, 0, .07, .2]],
  [DUR, [0, .25, .62, 0, .07, .2]],
]);

// ---------- Untertitel (2D) ----------
function subs(t) {
  OX.clearRect(0, 0, W, H);
  const v = VO.find(v => t >= v.t0 - .05 && t < Math.max(v.t0 + 1.8, v.t1 + .5)); if (!v) return;
  OX.font = '700 62px Fredoka'; OX.textAlign = 'center'; OX.textBaseline = 'middle';
  const words = v.text.split(' '), L = []; let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (OX.measureText(s).width > 940 && cur) { L.push(cur); cur = w; } else cur = s; } L.push(cur);
  const y0 = 1560 - (L.length - 1) * 38;
  L.forEach((l, i) => { const y = y0 + i * 76; OX.lineJoin = 'round'; OX.lineWidth = 16; OX.strokeStyle = '#3a2a24'; OX.strokeText(l, W / 2, y); OX.fillStyle = '#fff6e4'; OX.fillText(l, W / 2, y); });
}

// ---------- Bild ----------
window.DUR = DUR;
window.render = t => {
  book.setOpen(Math.PI / 2 * eio(seg(t, OPEN0, OPEN0 + 1.5)));
  for (const p of pops) {
    const k = back(seg(t, p.rise, p.rise + .45), 1.7) * (1 - eio(seg(t, p.fold, p.fold + .4)));
    p.g.visible = k > .002; p.g.rotation.x = -(Math.PI / 2) * (1 - k) + Math.sin(t * 1.3 + p.ph) * p.sway;
  }
  // Lappen: erscheinen nacheinander, flattern im Wind
  flags.forEach(f => {
    const k = back(seg(t, LINE0 + .6 + (f.x + .2) * 3, LINE0 + .9 + (f.x + .2) * 3), 1.6) * (1 - eio(seg(t, END0, END0 + .4)));
    f.g.visible = k > .01; f.g.scale.setScalar(Math.max(.001, k));
    const wind = t > DEER0 && t < GONE ? 1.8 : 1;
    f.g.rotation.x = .25 * wind * Math.sin(t * 6 + f.x * 40); f.g.rotation.z = .08 * Math.sin(t * 4.3 + f.i);
  });
  ropeMesh.visible = t > LINE0 + .4 && t < END0 + .3; ropeMesh.scale.y = clamp((t - LINE0 - .4) / .6, .001, 1);
  // Hirsch: hinter der Leine, scheut, läuft an, springt durch die Lücke zum Leser
  for (const k in deer) deer[k].visible = false;
  deerShadow.visible = false;
  if (t > DEER0 && t < GONE + .6) {
    let pose = 'stand', x = .1, y = 0, z = .11, sx = 1;
    const pk = back(seg(t, DEER0, DEER0 + .4), 1.6);
    if (t < RUN0) { x = -.03 - .015 * eio(seg(t, DEER0 + 1.2, DEER0 + 1.6)); sx = 1 - .08 * Math.sin(Math.PI * seg(t, DEER0 + 1.2, DEER0 + 1.5)); }   // scheut: weicht zurück
    else if (t < LEAP0) { const u = seg(t, RUN0, LEAP0); pose = Math.floor(t * 8) % 2 ? 'run' : 'stand'; x = lerp(-.045, -.02, u); z = lerp(.11, .14, u); }   // Anlauf nach rechts
    else { const u = seg(t, LEAP0, GONE); pose = u < .75 ? 'leap' : 'run'; x = lerp(-.02, .12, u); z = lerp(.14, .27, u); y = Math.sin(Math.PI * Math.min(1, u * 1.3)) * .05; }   // Sprung durch die Lücke nach rechts vorn
    const d = deer[pose]; d.visible = true; d.position.set(x, y, z); d.rotation.x = -(Math.PI / 2) * (1 - Math.min(1, pk));
    d.scale.set(sx, 2 - sx, 1);
    deerShadow.visible = true; deerShadow.position.set(x + .05, .0005, z); deerShadow.scale.setScalar(1 - y * 8);
  }
  hunter.g.rotation.z = t > SIGN0 - 1.5 && t < END0 ? .04 * Math.sin(t * 5) : 0;
  logo.g.rotation.y = Math.sin(t * 1.2) * .08;
  const c = CAM(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.updateProjectionMatrix();
  post.dof.focus = cam.position.distanceTo(new THREE.Vector3(c[3], c[4], c[5])); post.dof.aper = 1.6;
  scene.updateMatrixWorld(true); post.composer.render();
  subs(t);
};
window.READY = true;

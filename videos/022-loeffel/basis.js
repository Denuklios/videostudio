// Gemeinsame Basis für die Serie „Woher kommt das?“ im Pop-up-Buch-Stil (Vorlage: videos/019-lappen-popup)
// Buch auf dem Walnuss-Tisch, Lampenlicht, Pop-up-Mechanik, Kamera-Spur, Untertitel, Schild + Logo am Ende.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, lerp, seg, eio, eo, back, mulberry, track } from './lib.js';
import * as A from './art.js';
import { cv, paperFill, crescent, sh, blob, INK } from './paper.js';
import { makeBook, coverCanvases, texOf, BW, BD } from './book.js';
import { cutMesh, blobShadow } from './cutmesh.js';
import { makePost } from './post.js';
export { THREE, A, cv, paperFill, crescent, sh, blob, INK, clamp, lerp, seg, eio, eo, back, mulberry, track, cutMesh, blobShadow, texOf, BW, BD };

export const W = 1080, H = 1920, TAU = Math.PI * 2, LW = 14;

export async function basis({ coverZeilen, coverIcon, boden, himmel }) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('stage').appendChild(renderer.domElement);
  const OX = document.getElementById('ov').getContext('2d');
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(36, W / H, .004, 30);
  const post = makePost(renderer, scene, cam, W, H);
  await Promise.all(['600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"', '40px "IM Fell English"', 'italic 40px "IM Fell English"'].map(f => document.fonts.load(f, 'Aa')));
  const TL = await (await fetch('timeline.json')).json();
  const VO = TL.vo, DUR = TL.dur, K = Object.fromEntries(VO.map(v => [v.id, v.t0]));

  // Raum
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.background = new THREE.Color('#3b2c22');
  const tl = new THREE.TextureLoader(), AS = '/core/assets/polyhaven/';
  const wt = n => { const t = tl.load(`${AS}walnut_${n}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.4); return t; };
  const wd = wt('diff'); wd.colorSpace = THREE.SRGBColorSpace;
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, 1.7), new THREE.MeshStandardMaterial({ map: wd, normalMap: wt('nor'), roughnessMap: wt('rough'), color: '#c9a88a', envMapIntensity: .7 }));
  desk.position.set(0, -.02, .25); desk.receiveShadow = true; scene.add(desk);
  try { const m = (await new GLTFLoader().loadAsync(`${AS}desk_lamp_arm_01/desk_lamp_arm_01.gltf`)).scene; m.position.set(-.36, 0, .02); m.scale.setScalar(.55); m.rotation.y = .5;
    m.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (o.material.name.includes('light')) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffd9a0'); o.material.emissiveIntensity = 6; } } }); scene.add(m); } catch (e) { }
  const key = new THREE.DirectionalLight('#ffe3c0', 2.4); key.position.set(-.45, .8, .55); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -.4, right: .4, top: .4, bottom: -.4, near: .1, far: 3 }); key.shadow.bias = -.0004; scene.add(key);
  scene.add(new THREE.HemisphereLight('#fff1dc', '#5a4030', .7));
  const warm = new THREE.PointLight('#ffb870', 1.2, 2.5); warm.position.set(-.3, .45, .2); scene.add(warm);

  // Buch mit eigenem Cover-Titel
  const book = makeBook(coverCanvases(coverIcon, coverZeilen));
  scene.add(book.root);
  const gw = 2048, gh = Math.round(2048 * BD / BW);
  { const g = cv(gw, gh); boden(g.getContext('2d'), gw, gh); book.groundMat.map = texOf(g); book.groundMat.needsUpdate = true; }
  { const s = cv(gw, gh); himmel(s.getContext('2d'), gw, gh); book.backMat.map = texOf(s); book.backMat.needsUpdate = true; }

  // Pop-up-Mechanik
  const pops = [];
  function popper(item, x, y, z, rise = 1e9, o = {}) {
    const g = new THREE.Group(), m = cutMesh(item, { s: o.s ?? 1 }); g.add(m); g.position.set(x, y, z); g.rotation.y = o.ry ?? 0;
    book.stage.add(g); const p = { g, m, rise, fold: o.fold ?? 1e9, sway: o.sway ?? 0, ph: o.ph ?? 0 }; pops.push(p); return p;
  }
  function figur(items) {            // mehrere Posen derselben Figur, je eine Karte; nur eine sichtbar
    const o = {}; for (const k in items) { o[k] = cutMesh(items[k]); o[k].visible = false; book.stage.add(o[k]); } return o;
  }
  function zeige(fig, pose, x, y, z, k = 1, sx = 1) {
    for (const p in fig) fig[p].visible = false; if (!pose || k <= .002) return;
    const m = fig[pose]; m.visible = true; m.position.set(x, y, z); m.rotation.x = -(Math.PI / 2) * (1 - Math.min(1, k)); m.scale.set(sx, 2 - sx, 1);
  }
  function subs(t) {
    OX.clearRect(0, 0, W, H);
    const v = VO.find(v => t >= v.t0 - .05 && t < Math.max(v.t0 + 1.8, v.t1 + .5)); if (!v) return;
    OX.font = '700 62px Fredoka'; OX.textAlign = 'center'; OX.textBaseline = 'middle';
    const words = v.text.split(' '), L = []; let cur = '';
    for (const w of words) { const s = cur ? cur + ' ' + w : w; if (OX.measureText(s).width > 940 && cur) { L.push(cur); cur = w; } else cur = s; } L.push(cur);
    const y0 = 1560 - (L.length - 1) * 38;
    L.forEach((l, i) => { const y = y0 + i * 76; OX.lineJoin = 'round'; OX.lineWidth = 16; OX.strokeStyle = '#3a2a24'; OX.strokeText(l, W / 2, y); OX.fillStyle = '#fff6e4'; OX.fillText(l, W / 2, y); });
  }
  // Schluss: Logo (rund) + Schild „Wusstest du's?“ nebeneinander, nichts verdeckt
  const img = new Image(); img.src = 'logo.png'; await img.decode();
  const logoItem = A.cut(.085, .085, (x, Wp, Hp) => { x.save(); x.beginPath(); x.arc(Wp / 2, Hp / 2, Wp / 2, 0, TAU); x.clip(); x.drawImage(img, 0, 0, Wp, Hp); x.restore(); x.beginPath(); x.arc(Wp / 2, Hp / 2, Wp / 2, 0, TAU); x.lineWidth = 12; x.strokeStyle = INK; x.stroke(); }, { pad: 30, border: 18 });

  function renderBasis(t, CAM, open0, aper = 1.6) {
    book.setOpen(Math.PI / 2 * eio(seg(t, open0, open0 + 1.5)));
    for (const p of pops) {
      const k = back(seg(t, p.rise, p.rise + .45), 1.7) * (1 - eio(seg(t, p.fold, p.fold + .4)));
      p.g.visible = k > .002; p.g.rotation.x = -(Math.PI / 2) * (1 - k) + Math.sin(t * 1.3 + p.ph) * p.sway;
    }
    const c = CAM(t); cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.updateProjectionMatrix();
    post.dof.focus = cam.position.distanceTo(new THREE.Vector3(c[3], c[4], c[5])); post.dof.aper = aper;
    scene.updateMatrixWorld(true); post.composer.render(); subs(t);
  }
  return { scene, cam, book, popper, pops, figur, zeige, renderBasis, logoItem, VO, DUR, K };
}

// Hilfen zum Zeichnen von Figuren (Papier-Look)
export function glied(x, pts, w, farbe) {
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = INK; x.lineWidth = w + 14; x.beginPath(); x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); x.stroke();
  x.strokeStyle = farbe; x.lineWidth = w; x.stroke();
}
// einfacher Mensch im Profil nach rechts (Breite 300 × Höhe 660 Einheiten), Posen über Arm-/Beinwinkel
export function mensch(x, o = {}) {
  const hut = o.hut, haar = o.haar ?? '#6b4a2e', haut = o.haut ?? '#f2c9a0', rock = o.rock ?? '#5c8f4f', rockS = o.rockS ?? '#3f6a3a', hose = o.hose ?? '#5a4a3a';
  const bein = o.bein ?? [0, 0], arm = o.arm ?? [.2, .2];
  const hx = 150, hy = 430;
  glied(x, [[hx - 25, hy], [hx - 25 + Math.sin(bein[0]) * 110, hy + Math.cos(bein[0]) * 110], [hx - 25 + Math.sin(bein[0]) * 210 + 10, hy + 210]], 26, hose);
  glied(x, [[hx + 25, hy], [hx + 25 + Math.sin(bein[1]) * 110, hy + Math.cos(bein[1]) * 110], [hx + 25 + Math.sin(bein[1]) * 210 + 10, hy + 210]], 26, hose);
  const coat = () => { x.beginPath(); x.moveTo(90, 200); x.bezierCurveTo(150, 180, 210, 190, 230, 210); x.lineTo(o.kleid ? 270 : 250, 450); x.lineTo(o.kleid ? 40 : 60, 450); x.closePath(); };
  crescent(x, coat, rockS, 24, 0, rock); coat(); sh(x, null, LW);
  if (o.schuerze) { x.beginPath(); x.moveTo(150, 260); x.lineTo(240, 260); x.lineTo(256, 440); x.lineTo(140, 440); x.closePath(); sh(x, o.schuerze, 10); }
  glied(x, [[215, 230], [215 + Math.sin(arm[1]) * 90, 230 + Math.cos(arm[1]) * 90], [215 + Math.sin(arm[1]) * 170, 230 + Math.cos(arm[1]) * 170]], 22, rock);
  blob(x, 160, 140, 58, 64, .03, 3); sh(x, haut, LW);
  if (haar) { x.beginPath(); x.ellipse(140, 100, 62, 34, -.3, Math.PI, TAU); sh(x, haar, 10); }
  if (o.zopf) { x.beginPath(); x.ellipse(100, 150, 20, 50, .3, 0, TAU); sh(x, haar, 8); }
  x.beginPath(); x.arc(185, 132, 8, 0, TAU); x.fillStyle = INK; x.fill();
  if (o.boese) { x.lineWidth = 7; x.strokeStyle = INK; x.beginPath(); x.moveTo(170, 112); x.lineTo(198, 120); x.stroke(); x.beginPath(); x.moveTo(178, 176); x.quadraticCurveTo(195, 166, 210, 176); x.stroke(); }
  else { x.lineWidth = 7; x.strokeStyle = INK; x.beginPath(); x.moveTo(180, 168); x.quadraticCurveTo(196, 180, 210, 168); x.stroke(); }
  if (o.bart) { x.beginPath(); x.ellipse(180, 190, 34, 30, 0, 0, TAU); sh(x, o.bart, 8); }
  if (hut) { x.beginPath(); x.ellipse(160, 88, 110, 22, 0, 0, TAU); sh(x, hut, 10); x.beginPath(); x.moveTo(110, 86); x.lineTo(120, 30); x.lineTo(200, 30); x.lineTo(210, 86); x.closePath(); sh(x, hut, 10); }
  if (o.haube) { x.beginPath(); x.ellipse(150, 100, 74, 46, -.2, Math.PI * .9, TAU * 1.02); sh(x, o.haube, 10); }
  if (o.hand) o.hand(x, 215 + Math.sin(arm[1]) * 170, 230 + Math.cos(arm[1]) * 170);
}
export function menschKarte(o) { return A.cut(.078, .13, (x, Wp) => { const s = Wp / 300; if (o.spiegel) { x.translate(Wp, 0); x.scale(-1, 1); } x.scale(s, s); mensch(x, o); }, { pad: 40, border: 16 }); }
export function schild(text, breite = .16) { return A.sign(breite, text, '700 84px Fredoka'); }

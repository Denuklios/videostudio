// Motion-Design-Effekte als Ebene über den Fotos (Canvas 1080×1920).
// In projekt.json pro Szene: "fx": [{"typ": "streifen", "text": "205.000 $", "wort": "zweihundertfünftausend", "dauer": 1.6}, …]
// Zeit: "wort" (+ "n", "plus") wie bei den SVG-Effekten, sonst "d" (Sekunden ab Szenenbeginn).
// Erzeugt werden die Einträge bequem mit den fx_…-Funktionen in effekte.py.
(function () {
  const W = 1080, H = 1920;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const eo = t => 1 - Math.pow(1 - clamp(t), 3), eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const back = (t, s = 1.8) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
  const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const INK = '#0b0b0f', PAPER = '#f2efe8', LIME = '#c8ff1a', ORANGE = '#ff5a1f';
  const fmt = v => Math.round(v).toLocaleString('de-DE');
  let g, AK = '#ff4fd8', LISTE = [];

  // Ein- und Ausblenden einer Überlagerung (a = Deckkraft 0..1)
  const huelle = (t, d, ein = .2, aus = .25) => clamp(t / ein) * (1 - clamp((t - (d - aus)) / aus));
  function abdunkeln(a, st = .55) { g.fillStyle = `rgba(0,0,0,${st * a})`; g.fillRect(0, 0, W, H); }
  function txt(s, x, y, size, fill, font = 'Titel', stroke = 0) {
    g.font = `400 ${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (stroke) { g.lineJoin = 'round'; g.lineWidth = stroke; g.strokeStyle = INK; g.strokeText(s, x, y); }
    g.fillStyle = fill; g.fillText(s, x, y);
  }
  function passend(s, maxW, size, font = 'Titel') { g.font = `400 ${size}px ${font}`; const w = g.measureText(s).width; return w > maxW ? size * maxW / w : size; }

  const EFFEKTE = {
    // 1 Schrift fliegt in Streifen herein und wieder hinaus. voll: eigene Papier-Fläche statt Foto
    streifen(t, d, o) {
      const n = 12, fs = passend(o.text, 980, o.groesse || 230), y = o.y || H / 2, voll = o.voll;
      if (voll) { g.globalAlpha = clamp(t / .12) * (1 - clamp((t - d + .12) / .12)); g.fillStyle = o.hg || PAPER; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
      else abdunkeln(huelle(t, d), .45);
      g.font = `400 ${fs}px Titel`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const y0 = y - fs * .62 + i * (fs * 1.24 / n), hh = fs * 1.24 / n + 1;
        const inn = eo((t - i * .02) / .4), out = clamp((t - (d - .3) - i * .012) / .28);
        const dx = (1 - inn) * (i % 2 ? 1 : -1) * 1200 + out * (i % 2 ? -1 : 1) * 1400;
        g.save(); g.beginPath(); g.rect(0, y0, W, hh); g.clip();
        if (!voll) { g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = INK; g.strokeText(o.text, W / 2 + dx, y); }
        g.fillStyle = voll ? INK : (o.farbe || '#fff'); g.fillText(o.text, W / 2 + dx, y); g.restore();
      }
      const bw = eo((t - .25) / .35) * 700 * (1 - clamp((t - d + .3) / .3));
      g.fillStyle = AK; g.fillRect(W / 2 - bw / 2, y + fs * .7, bw, 24);
      if (o.unter) { g.globalAlpha = huelle(t - .35, d - .35); txt(o.unter, W / 2, y + fs * .7 + 95, 64, '#fff', 'Kraft', voll ? 0 : 14); g.globalAlpha = 1; }
    },
    // 2 Schräge Laufbänder quer über das Bild
    laufband(t, d, o) {
      const a = huelle(t, d, .25, .3), y = o.y || 1180, txt0 = (o.text + '  •  ');
      [[-7, LIME, INK, -1], [5, INK, '#fff', 1]].forEach(([w, bgc, fg, dir], k) => {
        g.save(); g.translate(W / 2, y + k * 40); g.rotate(w * Math.PI / 180); g.globalAlpha = a;
        const hb = 150, ein = eo(t / .35); g.fillStyle = bgc; g.fillRect(-W * ein, -hb / 2, 2 * W * ein, hb);
        g.font = '400 110px Titel'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = fg;
        const u = g.measureText(txt0).width, off = ((t * 420 * dir) % u + u) % u;
        g.beginPath(); g.rect(-W * ein, -hb / 2, 2 * W * ein, hb); g.clip();
        for (let x = -W - u + off; x < W + u; x += u) g.fillText(txt0, x, 6);
        g.restore();
      });
      g.globalAlpha = 1;
    },
    // 3 Wellen-Kachelmuster als Übergang (deckt das Bild kurz ab)
    muster(t, d, o) {
      const s = 90, cols = 13, rows = 23, front = lerp(-300, H + 300, eio(t / d));
      g.lineWidth = 26; g.lineCap = 'round';
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * s, y = j * s, dist = Math.abs(y - front);
        if (dist > 620) continue;
        const k = 1 - dist / 620, flip = hash(i * 31 + j * 7) > .5;
        g.fillStyle = PAPER; g.globalAlpha = clamp(k * 2.2); g.fillRect(x, y, s + 1, s + 1);
        g.strokeStyle = Math.sin(i * .5 + j * .35 - t * 9) > .4 ? AK : INK;
        g.save(); g.translate(x + s / 2, y + s / 2); g.rotate((flip ? Math.PI / 2 : 0) + (1 - k) * 1.5);
        g.beginPath(); g.arc(-s / 2, -s / 2, s / 2, 0, Math.PI / 2); g.stroke(); g.beginPath(); g.arc(s / 2, s / 2, s / 2, Math.PI, Math.PI * 1.5); g.stroke(); g.restore();
      }
      g.globalAlpha = 1;
    },
    // 4 Drehende, sich verformende 3D-Punktkugel (z. B. über einem Planeten)
    punktkugel(t, d, o) {
      const N = 1100, R = o.r || 300, cx = o.x || W / 2, cy = o.y || 900, rot = t * .9, tilt = .35, a = huelle(t, d, .3, .4), pts = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
        let x = Math.cos(th) * r, z = Math.sin(th) * r, yy = y;
        const k = 1 + .15 * Math.sin(yy * 6 + t * 3) * clamp(t / 1.2); x *= k; z *= k; yy *= k;
        const xr = x * Math.cos(rot) - z * Math.sin(rot), zr = x * Math.sin(rot) + z * Math.cos(rot);
        const yr = yy * Math.cos(tilt) - zr * Math.sin(tilt), zr2 = yy * Math.sin(tilt) + zr * Math.cos(tilt);
        const p = 900 / (900 + zr2 * R); pts.push([xr * R * p, yr * R * p, zr2]);
      }
      const grow = eo(t / .5);
      for (const [x, y, z] of pts.sort((a, b) => b[2] - a[2])) {
        g.fillStyle = `rgba(230,245,255,${a * (.2 + .8 * (1 - (z + 1) / 2))})`;
        g.beginPath(); g.arc(cx + x * grow, cy + y * grow, 2.4 + (1 - z) * 1.5, 0, 6.283); g.fill();
      }
      if (o.text) { g.globalAlpha = a * clamp((t - .4) / .3); txt(o.text, W / 2, cy + R + 140, passend(o.text, 960, 92), AK, 'Titel', 16); g.globalAlpha = 1; }
    },
    // 5 Speichen-Explosion + hochzählende Zahl
    explosion(t, d, o) {
      const cx = o.x || W / 2, cy = o.y || 820, n = 14, p = back(clamp(t / .35), 2.2) * (1 - eo((t - d + .3) / .3)), rot = t * .8, a = huelle(t, d, .1, .3);
      abdunkeln(a, .5);
      g.save(); g.translate(cx, cy); g.rotate(rot); g.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const w = i / n * 6.283, L = (i % 2 ? 210 : 260) * p;
        for (const [col, lw] of [[INK, 46], [i % 2 ? '#fff' : AK, 30]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(Math.cos(w) * 50 * p, Math.sin(w) * 50 * p); g.lineTo(Math.cos(w) * L, Math.sin(w) * L); g.stroke(); }
      }
      g.restore();
      const v = lerp(o.von || 0, o.zahl, eo((t - .15) / (o.zaehldauer || .9)));
      g.globalAlpha = a; const s = (o.vor || '') + fmt(v) + (o.nach || '');
      txt(s, cx, cy + 420, passend(s, 1000, 210), '#fff', 'Titel', 26);
      if (o.unter) txt(o.unter, cx, cy + 580, 62, AK, 'Kraft', 14);
      g.globalAlpha = 1;
    },
    // 6 Zifferblatt mit Ringen und Zeigern (für Zeit-Fakten)
    uhr(t, d, o) {
      const cx = o.x || W / 2, cy = o.y || 820, a = huelle(t, d, .2, .3), R = o.r || 330;
      abdunkeln(a, .55); g.globalAlpha = a;
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3;
      for (const r of [R, R * .83, R * .66]) { g.beginPath(); g.arc(cx, cy, r * eo(t / .4), 0, 6.283); g.stroke(); }
      for (let i = 0; i < 60; i++) {
        const w = i / 60 * 6.283 - Math.PI / 2, on = i / 60 < t / d; g.strokeStyle = on ? AK : 'rgba(255,255,255,.45)'; g.lineWidth = i % 5 ? 4 : 9;
        const r1 = i % 5 ? R * .92 : R * .86; g.beginPath(); g.moveTo(cx + Math.cos(w) * r1, cy + Math.sin(w) * r1); g.lineTo(cx + Math.cos(w) * R, cy + Math.sin(w) * R); g.stroke();
      }
      g.lineCap = 'round';
      const w1 = t * 7 - Math.PI / 2; g.strokeStyle = AK; g.lineWidth = 12; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(w1) * R * .8, cy + Math.sin(w1) * R * .8); g.stroke();
      const w2 = t * .6 - Math.PI / 2; g.strokeStyle = '#fff'; g.lineWidth = 18; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(w2) * R * .55, cy + Math.sin(w2) * R * .55); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 20, 0, 6.283); g.fill();
      if (o.text) { g.globalAlpha = a * clamp((t - .3) / .2); txt(o.text, cx, cy + R + 150, passend(o.text, 980, 140), '#fff', 'Titel', 20); }
      g.globalAlpha = 1;
    },
    // 7 Punkte fliegen von überall herbei und formen eine Zahl/ein Wort
    punkte(t, d, o) {
      if (!o._ziel) {
        const c = document.createElement('canvas'); c.width = W; c.height = 600; const x = c.getContext('2d');
        x.font = `400 ${passend(o.text, 1000, 440)}px Titel`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.text, W / 2, 300);
        const px = x.getImageData(0, 0, W, 600).data; o._ziel = [];
        for (let y = 0; y < 600; y += 14) for (let xx = 0; xx < W; xx += 14) if (px[(y * W + xx) * 4 + 3] > 128) o._ziel.push([xx, y + (o.y || 820) - 300]);
      }
      const a = huelle(t, d, .15, .3); abdunkeln(a, .6);
      o._ziel.forEach(([x, y], i) => {
        const sx = hash(i) * W, sy = hash(i + 99) * H, u = eio((t - hash(i + 7) * .35) / .75);
        g.fillStyle = i % 7 === 0 ? AK : '#fff'; g.globalAlpha = a; g.beginPath(); g.arc(lerp(sx, x, u), lerp(sy, y, u), 6, 0, 6.283); g.fill();
      });
      if (o.unter) { g.globalAlpha = a * clamp((t - .9) / .2); txt(o.unter, W / 2, (o.y || 820) + 330, passend(o.unter, 980, 64, 'Kraft'), '#fff', 'Kraft', 14); }
      g.globalAlpha = 1;
    },
    // 8 Play-Symbol mit kreisenden Punkten (z. B. „Gleich geht's los“)
    play(t, d, o) {
      const cx = o.x || W / 2, cy = o.y || 860, a = huelle(t, d, .1, .25), p = back(clamp(t / .3), 1.8);
      abdunkeln(a, .45); g.globalAlpha = a;
      for (let i = 0; i < 16; i++) { const w = i / 16 * 6.283 + t * 1.6, r = 280 + Math.sin(t * 4 + i) * 20; g.fillStyle = i % 2 ? AK : '#fff'; g.beginPath(); g.arc(cx + Math.cos(w) * r, cy + Math.sin(w) * r, 11, 0, 6.283); g.fill(); }
      g.save(); g.translate(cx + 20, cy); g.scale(p, p); g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 14; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(-100, -140); g.lineTo(160, 0); g.lineTo(-100, 140); g.closePath(); g.stroke(); g.fill(); g.restore();
      if (o.text) { g.globalAlpha = a * clamp((t - .3) / .2); txt(o.text, cx, cy + 440, passend(o.text, 980, 80, 'Kraft'), '#fff', 'Kraft', 14); }
      g.globalAlpha = 1;
    },
    // 9 Harte Farb-Schnitte im Takt, je ein Wort
    farbschnitte(t, d, o) {
      const ws = o.woerter, B = d / ws.length, k = Math.min(ws.length - 1, Math.floor(t / B)), cols = [AK, LIME, '#3ff0ff', ORANGE, '#fff', INK];
      const col = cols[k % cols.length]; g.fillStyle = col; g.fillRect(0, 0, W, H);
      const q = (t % B) / B, s = 1 + .08 * (1 - q);
      g.save(); g.translate(W / 2, H / 2 - 100); g.scale(s, s); txt(ws[k], 0, 0, passend(ws[k], 980, 280), col === INK ? '#fff' : INK); g.restore();
    },
    // 10 Rotierende Lichtstrahlen (z. B. hinter dem Logo am Ende)
    strahlen(t, d, o) {
      const a = huelle(t, d, .4, .3);
      g.save(); g.translate(o.x || W / 2, o.y || 860); g.rotate(t * .25); g.globalCompositeOperation = 'screen';
      for (let i = 0; i < 24; i++) { g.rotate(6.283 / 24); g.fillStyle = i % 2 ? `rgba(255,79,216,${.16 * a})` : `rgba(63,240,255,${.12 * a})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(-70, -1500); g.lineTo(70, -1500); g.fill(); }
      g.restore();
    },
  };
  // Effekte, die einen Ton auslösen: [Art, Zeitversatz]
  const TOENE = { streifen: [['wusch', 0]], laufband: [['wusch', 0]], muster: [['wusch', 0]], punktkugel: [['wusch', 0]],
    explosion: [['bass', 0], ['pling', .95]], uhr: [['klick', 0]], punkte: [['wusch', 0], ['pling', .8]], play: [['klick', 0]], farbschnitte: [], strahlen: [] };

  // zeitVon(wort, n) liefert Sekunden ab Szenenbeginn (aus player.html)
  window.fxAufbauen = function (P, T, zeitVonSzene) {
    AK = (P.stil && P.stil.akzent) || AK;
    const c = document.createElement('canvas'); c.id = 'fx'; c.width = W; c.height = H;
    c.style.cssText = 'position:absolute;inset:0;width:1080px;height:1920px;pointer-events:none';
    document.getElementById('buehne').insertBefore(c, document.getElementById('hook')); g = c.getContext('2d');
    LISTE = [];
    P.szenen.forEach((sz, i) => (sz.fx || []).forEach(f => {
      if (!EFFEKTE[f.typ]) { console.warn('Unbekannter fx-Typ', f.typ); return; }
      let lok = f.d || 0;
      if (f.wort) { const z = zeitVonSzene(i, f.wort, f.n); if (z === null) return; lok = z; }
      lok = Math.max(0, lok + (f.plus || 0));
      const t0 = T.szenen[i].start + lok, dauer = f.dauer || 1.5;
      LISTE.push({ t0, dauer, f: Object.assign({}, f) });
      if (f.typ === 'farbschnitte') f.woerter.forEach((_, k) => window.EREIGNISSE.push({ t: +(t0 + k * dauer / f.woerter.length).toFixed(3), art: 'klick' }));
      (TOENE[f.typ] || []).forEach(([art, v]) => window.EREIGNISSE.push({ t: +(t0 + v * (art === 'pling' ? (f.zaehldauer || 1) : 1)).toFixed(3), art }));
    }));
  };
  window.fxZeige = function (T) {
    if (!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (const e of LISTE) {
      const t = T - e.t0;
      if (t < 0 || t >= e.dauer) continue;
      g.save(); EFFEKTE[e.f.typ](t, e.dauer, e.f); g.restore();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  };
})();

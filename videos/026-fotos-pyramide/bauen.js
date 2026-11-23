// Foto-Beitrag (TikTok-Karussell): „GTA 6 in Zahlen“ – Zahlen-Karten im Kanal-Look, 1080×1920 PNG.
// Aufruf: node bauen.js  → folie_1.png … folie_N.png
const { chromium } = require('playwright');
const path = require('path');

const MAG = '#ff4fd8', CYAN = '#3ff0ff';
const FOLIEN = [
  { art: 'cover', oben: 'PYRAMIDE', zahl: '4 Zahlen', unten: 'die man kaum glaubt', hinweis: 'Wisch weiter 👉' },
  { zahl: '146 m', farbe: MAG, satz: 'war die Cheops-Pyramide <b>ursprünglich</b> hoch', klein: 'Heute sind es nur noch etwa 138,5 m – die glatte Außenhülle wurde abgetragen', quelle: 'Quelle: Britannica / Wikipedia' },
  { zahl: '2,3 Mio.', farbe: CYAN, satz: '<b>Steinblöcke</b> stecken darin', klein: 'Zusammen fast 6 Millionen Tonnen Stein', quelle: 'Quelle: Wikipedia (gängige Schätzung)' },
  { zahl: '230 m', farbe: MAG, satz: 'lang ist <b>jede Seite</b> der Grundfläche', klein: 'Das sind mehr als zwei Fußballfelder hintereinander', quelle: 'Quelle: Wikipedia' },
  { zahl: '3.800', farbe: CYAN, satz: '<b>Jahre</b> lang das höchste Bauwerk der Welt', klein: 'Erst eine Kathedrale im Mittelalter war höher', quelle: 'Quelle: Wikipedia' },
  { art: 'schluss', oben: 'Welche Zahl<br>haut dich um?', unten: 'Schreib\'s in die Kommentare 👇<br>und folg für mehr!' },
];

const css = `
@font-face { font-family: Titel; src: url('file://${path.resolve(__dirname, '../../fonts/Anton-Regular.ttf')}'); }
@font-face { font-family: Kraft; src: url('file://${path.resolve(__dirname, '../../fonts/ArchivoBlack-Regular.ttf')}'); }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; overflow: hidden; color: #fff; font-family: Kraft;
  background: radial-gradient(ellipse at 50% 38%, #3a0f4f 0%, #160828 55%, #07030f 100%); position: relative; }
.raster { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.09) 2px, transparent 2.5px); background-size: 46px 46px; }
.glanz { position: absolute; width: 900px; height: 900px; border-radius: 50%; left: 90px; top: 380px; filter: blur(120px); opacity: .35; }
.kopf { position: absolute; top: 120px; left: 0; right: 0; text-align: center; font-family: Titel; font-size: 64px; letter-spacing: 4px; }
.kopf span { color: ${MAG}; }
.zaehler { position: absolute; top: 210px; left: 50%; transform: translateX(-50%); padding: 10px 34px 6px; border-radius: 40px; font-family: Titel; font-size: 48px; letter-spacing: 2px; color: #000; border: 5px solid #000; }
.zahl { position: absolute; left: 40px; right: 40px; top: 560px; text-align: center; font-family: Titel; line-height: 1; font-size: 330px; white-space: nowrap;
  -webkit-text-stroke: 22px #000; paint-order: stroke fill; text-shadow: 0 16px 0 rgba(0,0,0,.5); }
.satz { position: absolute; left: 70px; right: 70px; top: 1010px; text-align: center; font-size: 74px; line-height: 1.15; text-transform: uppercase;
  -webkit-text-stroke: 12px #000; paint-order: stroke fill; }
.satz b { font-weight: normal; }
.balken { position: absolute; left: 340px; width: 400px; top: 1290px; height: 18px; border-radius: 9px; }
.klein { position: absolute; left: 110px; right: 110px; top: 1370px; text-align: center; font-size: 44px; line-height: 1.3; color: #e8dff5; }
.quelle { position: absolute; left: 0; right: 0; bottom: 120px; text-align: center; font-size: 32px; color: rgba(255,255,255,.55); }
.marke { position: absolute; left: 0; right: 0; bottom: 60px; text-align: center; font-family: Titel; font-size: 40px; letter-spacing: 3px; color: rgba(255,255,255,.75); }
.cover .oben { position: absolute; top: 420px; left: 0; right: 0; text-align: center; font-family: Titel; font-size: 230px; color: ${CYAN};
  -webkit-text-stroke: 20px #000; paint-order: stroke fill; text-shadow: 0 14px 0 rgba(0,0,0,.5); }
.cover .zahl2 { position: absolute; top: 720px; left: 0; right: 0; text-align: center; font-family: Titel; font-size: 210px; white-space: nowrap; color: ${MAG}; transform: rotate(-4deg);
  -webkit-text-stroke: 20px #000; paint-order: stroke fill; text-shadow: 0 14px 0 rgba(0,0,0,.5); }
.cover .unten { position: absolute; top: 1030px; left: 60px; right: 60px; text-align: center; font-size: 76px; text-transform: uppercase; -webkit-text-stroke: 12px #000; paint-order: stroke fill; }
.cover .hinweis { position: absolute; top: 1380px; left: 0; right: 0; text-align: center; font-size: 60px; }
.schluss img { position: absolute; left: 240px; top: 620px; width: 600px; height: 600px; object-fit: cover; border-radius: 50%; box-shadow: 0 0 80px ${MAG}; }
.schluss .oben { position: absolute; top: 220px; left: 40px; right: 40px; text-align: center; font-family: Titel; font-size: 130px; line-height: 1.05; text-transform: uppercase;
  -webkit-text-stroke: 16px #000; paint-order: stroke fill; }
.schluss .unten { position: absolute; top: 1330px; left: 60px; right: 60px; text-align: center; font-size: 62px; line-height: 1.3; }
`;

function html(f, i, n) {
  const kopf = `<div class="kopf">PYRAMIDE <span>IN ZAHLEN</span></div>`;
  const marke = `<div class="marke">@WUSSTESTDU_S</div>`;
  if (f.art === 'cover')
    return `<body class="cover"><div class="raster"></div><div class="glanz" style="background:${MAG}"></div>
      <div class="oben">${f.oben}</div><div class="zahl2">${f.zahl}</div><div class="unten">${f.unten}</div><div class="hinweis">${f.hinweis}</div>${marke}</body>`;
  if (f.art === 'schluss')
    return `<body class="schluss"><div class="raster"></div><div class="glanz" style="background:${CYAN}"></div>
      <div class="oben">${f.oben}</div><img src="file://${path.resolve(__dirname, '../../kanal/profilbild.png')}"><div class="unten">${f.unten}</div>${marke}</body>`;
  return `<body><div class="raster"></div><div class="glanz" style="background:${f.farbe}"></div>${kopf}
    <div class="zaehler" style="background:${f.farbe}">ZAHL ${i}/${n}</div>
    <div class="zahl" style="color:${f.farbe}">${f.zahl}</div>
    <div class="satz">${f.satz.replace(/<b>/g, `<b style="color:${f.farbe}">`)}</div>
    <div class="balken" style="background:${f.farbe}"></div>
    <div class="klein">${f.klein}</div><div class="quelle">${f.quelle}</div>${marke}</body>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const fakten = FOLIEN.filter(f => !f.art).length;
  let k = 0;
  for (let i = 0; i < FOLIEN.length; i++) {
    const f = FOLIEN[i];
    if (!f.art) k++;
    const datei = path.join(__dirname, `_folie.html`);
    require('fs').writeFileSync(datei, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>${html(f, k, fakten)}</html>`);
    await p.goto('file://' + datei);
    await p.evaluate(() => document.fonts.ready);
    // große Zahl auf eine Zeile einpassen
    await p.evaluate(() => document.querySelectorAll('.zahl, .zahl2').forEach(el => {
      let fs = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth && fs > 80) { fs -= 6; el.style.fontSize = fs + 'px'; }
    }));
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, `folie_${i + 1}.png`) });
  }
  require('fs').unlinkSync(path.join(__dirname, '_folie.html'));
  await b.close();
  console.log('ok', FOLIEN.length, 'Folien');
})();

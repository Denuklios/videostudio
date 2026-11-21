#!/usr/bin/env node
// Wandelt alle SVGs in einem Ordner in PNGs (1080×1920) um.  Aufruf: node svg2png.js <ordner>
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const dir = path.resolve(process.argv[2]);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".svg"))) {
    await p.goto("file://" + path.join(dir, f));
    await p.screenshot({ path: path.join(dir, f.replace(/\.svg$/, ".png")) });
    console.log("ok", f);
  }
  await b.close();
})();

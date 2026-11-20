#!/usr/bin/env node
// Rendert ein Video-Projekt zu MP4 (1080x1920) plus Cover-Bild.
// Aufruf: node render.js <projektordner> [--fps 30] [--nur-cover]
const { chromium } = require("playwright");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const ordner = path.resolve(args[0]);
const fps = +(args[args.indexOf("--fps") + 1] || 30) || 30;
const nurCover = args.includes("--nur-cover");

const projekt = JSON.parse(fs.readFileSync(path.join(ordner, "projekt.json"), "utf8"));
// Bildpfade relativ zum Projektordner -> file://-URL
const url = f => /^(https?|file|data):/.test(f) ? f : "file://" + path.resolve(ordner, f);
projekt.szenen.forEach(sz => { if (sz.foto) sz.foto = url(sz.foto); if (sz.objekt) sz.objekt.maske = url(sz.objekt.maske); });
const timing = JSON.parse(fs.readFileSync(path.join(ordner, "timing.json"), "utf8"));
const name = projekt.datei || "video";

// Klänge: Wusch (Szenenwechsel), Bass (Hook/Beben), Pling (Zähler), Klick (Schild)
const KLANG = {
  wusch: (i) => ["-t", "0.45", "-i", "anoisesrc=color=pink:amplitude=0.6:seed=" + (i + 3), "highpass=f=500,lowpass=f=5000,afade=t=in:d=0.18,afade=t=out:st=0.18:d=0.27,volume=0.22", 0.12],
  bass: () => ["-t", "0.9", "-i", "sine=frequency=52:sample_rate=44100", "volume=1.6,afade=t=out:st=0.05:d=0.85", 0],
  pling: () => ["-t", "0.6", "-i", "sine=frequency=1568:sample_rate=44100", "volume=0.25,afade=t=out:st=0.01:d=0.55", 0],
  klick: () => ["-t", "0.12", "-i", "sine=frequency=880:sample_rate=44100", "volume=0.22,afade=t=out:st=0.01:d=0.1", 0],
};
function sfxSpur(datei, ereignisse) {
  const ev = timing.szenen.slice(1).map(s => ({ t: s.start, art: "wusch" })).concat(ereignisse || []).slice(0, 60);
  if (!ev.length) return null;
  const inputs = [], filter = [];
  ev.forEach((e, i) => {
    const [o1, o2, o3, src, fx, vor] = KLANG[e.art] ? KLANG[e.art](i) : KLANG.klick();
    inputs.push("-f", "lavfi", o1, o2, o3, src);
    const ms = Math.max(0, Math.round((e.t - vor) * 1000));
    filter.push(`[${i}]${fx},adelay=${ms}|${ms}[w${i}]`);
  });
  filter.push(ev.map((_, i) => `[w${i}]`).join("") + `amix=inputs=${ev.length}:normalize=0,apad=whole_dur=${timing.gesamt}[out]`);
  execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filter.join(";"), "-map", "[out]", "-ac", "2", "-ar", "44100", datei]);
  return datei;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, "player.html"));
  await page.evaluate(([p, t]) => { window.PROJEKT = p; window.TIMING = t; }, [projekt, timing]);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.aufbauen());
  await page.evaluate(() => document.fonts.ready);

  // Cover
  await page.evaluate((c) => {
    const i = c.szene ?? 0;
    window.zeige(window.TIMING.szenen[i].start + window.TIMING.szenen[i].dauer - 0.05);
    document.getElementById("untertitel").innerHTML = "";
    document.getElementById("balken").style.display = "none";
    document.getElementById("blitz").style.opacity = 0;
    const el = document.querySelectorAll(".szene")[i];
    el.style.transform = "none"; el.style.opacity = 1;
    let k = el.querySelector(".kopf");
    if (!k) { k = document.createElement("div"); k.className = "kopf"; el.prepend(k); }
    k.innerHTML = c.titel; k.style.transform = "none"; k.style.opacity = 1;
    k.style.top = "1440px"; k.style.fontSize = "150px";
    el.querySelector(".bild").style.top = "330px";
  }, projekt.cover || { titel: projekt.titel });
  await page.screenshot({ path: path.join(ordner, name + "_cover.jpg"), type: "jpeg", quality: 92 });
  if (!nurCover) await page.reload();
  if (nurCover) { await browser.close(); return; }


  await page.evaluate(([p, t]) => { window.PROJEKT = p; window.TIMING = t; }, [projekt, timing]);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.aufbauen());

  const ereignisse = await page.evaluate(() => window.EREIGNISSE || []);
  const stumm = path.join(ordner, "_bild.mp4");
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", stumm], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.ceil(timing.gesamt * fps);
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.zeige(t), f / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 90 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % (fps * 5) === 0) process.stdout.write(`\rBild ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log(`\rBilder fertig: ${frames} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  // Ton: Stimme + Übergangsgeräusche (+ optionale Musik im Projektordner: musik.mp3)
  const sprache = path.join(ordner, "audio", "gesamt.wav");
  const sfx = sfxSpur(path.join(ordner, "audio", "sfx.wav"), ereignisse);
  // Musik: projekt.musik = "spannend" | "ruhig" | "episch" (engine/musik/) oder musik.mp3 im Projektordner
  const musik = projekt.musik ? path.join(__dirname, "musik", projekt.musik + ".mp3") : path.join(ordner, "musik.mp3");
  const ins = ["-i", stumm, "-i", sprache];
  let mix = "[1]volume=1.0,asplit=2[s][sk]", spuren = "[s]", n = 1;
  if (sfx) { ins.push("-i", sfx); n++; mix += `;[${n}]anull[x]`; spuren += "[x]"; }
  if (fs.existsSync(musik)) { ins.push("-stream_loop", "-1", "-i", musik); n++; mix += `;[${n}]volume=0.22,atrim=0:${timing.gesamt},afade=t=out:st=${Math.max(0, timing.gesamt - 1.5)}:d=1.5[m0];[m0][sk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[m]`; spuren += "[m]"; }
  else mix += ";[sk]anullsink";
  mix += `;${spuren}amix=inputs=${spuren.split("][").length}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
  const ziel = path.join(ordner, name + ".mp4");
  execFileSync("ffmpeg", ["-y", "-v", "error", ...ins, "-filter_complex", mix, "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", ziel]);
  fs.unlinkSync(stumm);
  console.log("Fertig:", ziel);
})();

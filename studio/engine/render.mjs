// Studio engine driver: renders an episode's storyboard with headless Chromium.
//   node studio/engine/render.mjs <episode-dir> sheet            -> build/sheet/*.png, build/contact.png, build/cues.json, build/engine_report.json
//   node studio/engine/render.mjs <episode-dir> full [workers]   -> build/frames/%05d.jpg (resumable) + the same reports
//   node studio/engine/render.mjs <episode-dir> frames 1.2,3.4   -> build/sheet/ stills at exact times
// Needs build/timeline.json (voice stage) and, for map scenes, build/geo.json (studio/tools/geo.py).
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/node22/lib/node_modules/")("playwright")); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDIO = path.dirname(HERE);
const [epArg, mode = "sheet", arg] = process.argv.slice(2);
if (!epArg) { console.error("usage: node studio/engine/render.mjs <episode-dir> sheet|full [workers]|frames t1,t2"); process.exit(2); }
const EPD = path.resolve(epArg), BUILD = path.join(EPD, "build");
const rd = (p, dflt) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : dflt;
const meta = rd(path.join(EPD, "episode.json"));
const bible = rd(path.join(STUDIO, "channels", meta.channel, "bible.json"));
const EP = {
  format: bible.format, look: bible.look,
  storyboard: rd(path.join(EPD, "storyboard.json")),
  timeline: rd(path.join(BUILD, "timeline.json")),
  script: rd(path.join(EPD, "script.json")),
  geo: rd(path.join(BUILD, "geo.json"), null),
  data: {},   // datasets named by scene params.dataset (ranking_bars, ranking_race), keyed by that path, raw text
};
for (const sc of EP.storyboard.scenes) {
  const ds = sc.params && sc.params.dataset;
  if (!ds || EP.data[ds] !== undefined) continue;
  const f = path.resolve(EPD, ds);
  if (!f.startsWith(EPD + path.sep) || !fs.existsSync(f)) { console.error(`scene ${sc.id}: dataset '${ds}' must be a file inside the episode folder`); process.exit(1); }
  EP.data[ds] = fs.readFileSync(f, "utf8");
}
if (!EP.timeline) { console.error("missing build/timeline.json: run the voice stage first"); process.exit(1); }
const customJs = path.join(EPD, "scenes.js");
const FPS = bible.format.fps, W = bible.format.width, H = bible.format.height;

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(`window.EP=${JSON.stringify(EP)};`);
  await page.goto("file://" + path.join(HERE, "index.html"));
  const vendor = path.join(EPD, "vendor");                 // third-party libraries an episode needs (e.g. three.min.js), loaded first
  if (fs.existsSync(vendor)) for (const f of fs.readdirSync(vendor).filter(f => f.endsWith(".js")).sort()) await page.addScriptTag({ path: path.join(vendor, f) });
  if (fs.existsSync(customJs)) await page.addScriptTag({ path: customJs });
  await page.evaluate(async () => { await Promise.all(["98px Anton", "40px Elite", "92px Serif"].map(f => document.fonts.load(f))); });
  if (errors.length) { console.error("ENGINE ERROR:", errors.join("\n")); process.exit(1); }
  await page.evaluate(() => window.render(0));
  return page;
}
const grab = (page, t, type) => page.evaluate(([t, type]) => {
  window.render(t);
  return document.getElementById("c").toDataURL(type === "png" ? "image/png" : "image/jpeg", 0.94).split(",")[1];
}, [t, type]);

// WebGL runs on SwiftShader (CPU), so 3D scenes render the same on any machine
// (the 2D canvas stays on the CPU rasteriser: through SwiftShader it is ~50x slower)
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-accelerated-2d-canvas"] });
const first = await openPage(browser);
fs.mkdirSync(BUILD, { recursive: true });
const writeReports = async () => {
  fs.writeFileSync(path.join(BUILD, "cues.json"), JSON.stringify(await first.evaluate(() => window.sfxCues()), null, 1));
  const rep = await first.evaluate(() => window.engineReport());
  fs.writeFileSync(path.join(BUILD, "engine_report.json"), JSON.stringify(rep, null, 1));
  return rep;
};

if (mode === "sheet" || mode === "frames") {
  const dir = path.join(BUILD, "sheet");
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const times = mode === "frames" ? arg.split(",").map(Number) : await first.evaluate(() => window.sheetTimes());
  for (const t of times) fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, "0")}.png`), Buffer.from(await grab(first, t, "png"), "base64"));
  fs.writeFileSync(path.join(BUILD, "contact.png"), Buffer.from(await first.evaluate(t => window.contact(t), times), "base64"));
  console.log(`sheet: ${times.length} stills in build/sheet/, tiled in build/contact.png`);
} else if (mode === "full") {
  const n = Math.round(EP.timeline.duration * FPS), workers = Number(arg || 4);
  const dir = path.join(BUILD, "frames"); fs.mkdirSync(dir, { recursive: true });
  const pages = [first, ...await Promise.all(Array.from({ length: workers - 1 }, () => openPage(browser)))];
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async page => {
    // each worker takes runs of BLOCK consecutive frames, so a scene that caches work between frames (a 3D world
    // on twos, a scan) can reuse it
    const BLOCK = 12;
    while (next < n) {
      const i0 = next; next += BLOCK;
      for (let i = i0; i < Math.min(n, i0 + BLOCK); i++) {
        const out = path.join(dir, String(i).padStart(5, "0") + ".jpg");
        if (fs.existsSync(out)) { done++; continue; }
        fs.writeFileSync(out, Buffer.from(await grab(page, i / FPS, "jpg"), "base64"));
        if (++done % 200 === 0) console.log(`${done}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
  }));
  console.log(`rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
} else { console.error("unknown mode " + mode); process.exit(2); }
const rep = await writeReports();
console.log(rep.warnings.length ? "ENGINE WARNINGS:\n  - " + rep.warnings.join("\n  - ") : "engine: no warnings");
await browser.close();

// Headless renderer: loads index.html in Chromium and pulls frames as a pure function of t.
//   node render.mjs sheet 1.2,5.0,...   -> build/sheet/*.png (review contact sheet) + build/cues.json
//   node render.mjs full [workers]      -> build/frames/%05d.jpg + build/cues.json
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(HERE, "..", "build");
const FPS = 24;
const TL = fs.readFileSync(path.join(BUILD, "timeline.json"), "utf8");
const AUS = fs.readFileSync(path.join(HERE, "..", "assets", "australia.json"), "utf8");

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on("pageerror", e => { console.error("PAGE ERROR", e.message); process.exit(1); });
  await page.addInitScript(`window.TL=${TL};window.AUS=${AUS};`);
  await page.goto("file://" + path.join(HERE, "index.html"));
  await page.evaluate(async () => {
    await Promise.all(["98px Anton", "40px Elite", "92px Serif"].map(f => document.fonts.load(f)));
    window.render(0);
  });
  return page;
}
const grab = (page, t, type) => page.evaluate(([t, type]) => {
  window.render(t);
  return document.getElementById("c").toDataURL(type === "png" ? "image/png" : "image/jpeg", 0.94).split(",")[1];
}, [t, type]);

const [mode, arg] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--disable-gpu"] });
const first = await openPage(browser);
const tl = JSON.parse(TL);
fs.writeFileSync(path.join(BUILD, "cues.json"), JSON.stringify(await first.evaluate(() => window.sfxCues()), null, 0));
fs.writeFileSync(path.join(BUILD, "scenes.json"), JSON.stringify(await first.evaluate(() => window.SCENES())));

if (mode === "sheet") {
  const dir = path.join(BUILD, "sheet"); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (const t of arg.split(",").map(Number)) {
    fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, "0")}.png`), Buffer.from(await grab(first, t, "png"), "base64"));
  }
} else {
  const n = Math.round(tl.duration * FPS), workers = Number(arg || 4);
  const dir = path.join(BUILD, "frames"); fs.mkdirSync(dir, { recursive: true });
  const pages = [first, ...await Promise.all(Array.from({ length: workers - 1 }, () => openPage(browser)))];
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async page => {
    while (next < n) {
      const i = next++;
      const out = path.join(dir, String(i).padStart(5, "0") + ".jpg");
      if (fs.existsSync(out)) { done++; continue; } // resumable
      fs.writeFileSync(out, Buffer.from(await grab(page, i / FPS, "jpg"), "base64"));
      if (++done % 100 === 0) console.log(`${done}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
  console.log(`rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();

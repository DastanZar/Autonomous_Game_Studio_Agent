// Style lab renderer.
//   node studio/stylelab/lab_render.mjs <outdir> [board ...]   -> <board>.png (still, with safe-zone tint) and <board>.mp4 (clip)
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/node22/lib/node_modules/")("playwright")); }
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [out, ...only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--disable-gpu"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; page.on("pageerror", e => errs.push(e.message));
await page.goto("file://" + path.join(HERE, "lab.html"));
await page.evaluate(async () => { await Promise.all(["98px Anton", "40px Elite", "92px Serif"].map(f => document.fonts.load(f))); });
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
const boards = only.length ? only : await page.evaluate(() => Object.keys(window.BOARDS));
const grab = (b, t, z, type = "png") => page.evaluate(([b, t, z, type]) => { window.drawBoard(b, t, z); return document.getElementById("c").toDataURL(type, 0.92).split(",")[1]; }, [b, t, z, type]);
for (const b of boards) {
  const { dur, still } = await page.evaluate(b => ({ dur: window.BOARDS[b].dur, still: window.BOARDS[b].still }), b);
  fs.writeFileSync(path.join(out, b + ".png"), Buffer.from(await grab(b, still, false), "base64"));
  fs.writeFileSync(path.join(out, b + "_zones.png"), Buffer.from(await grab(b, still, true), "base64"));
  const fdir = path.join(out, "_f_" + b); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
  const n = Math.round(dur * 24);
  for (let i = 0; i < n; i++) fs.writeFileSync(path.join(fdir, String(i).padStart(4, "0") + ".jpg"), Buffer.from(await grab(b, i / 24, false, "image/jpeg"), "base64"));
  if (errs.length) { console.error(b, errs.join("\n")); process.exit(1); }
  execFileSync(process.env.FFMPEG || execFileSync("python3", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim(), ["-y", "-loglevel", "error", "-framerate", "24", "-i", path.join(fdir, "%04d.jpg"), "-vf", "scale=720:1280", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", path.join(out, b + ".mp4")]);
  fs.rmSync(fdir, { recursive: true, force: true });
  console.log(b, "ok");
}
await browser.close();

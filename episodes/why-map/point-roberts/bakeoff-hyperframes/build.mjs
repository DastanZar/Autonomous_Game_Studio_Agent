// Generates index.html for the HyperFrames Point Roberts Short.
// Inputs (all from the parent episode dir): script.json, timeline.snapshot.json, build/geo.json (Natural Earth, via studio/tools/geo.py)
// Run: node build.mjs   (then: npx hyperframes check / render)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ep = path.resolve(here, "..");
const script = JSON.parse(fs.readFileSync(path.join(ep, "script.json"), "utf8"));
const tline = JSON.parse(fs.readFileSync(path.join(ep, "timeline.snapshot.json"), "utf8"));
const geo = JSON.parse(fs.readFileSync(path.join(ep, "build/geo.json"), "utf8"));

const DUR = tline.duration; // 41.5
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

// ---- word timings -> T[paraId] = [{w,t}] ----
const T = {};
for (const p of tline.paras) T[p.id] = p.words.map((w) => ({ w: norm(w.w), t: w.t }));
const paraEnd = {};
for (const p of tline.paras) paraEnd[p.id] = p.end;

// ---- captions: script.json chunks (text, wordcount) -> start times from word timings ----
const caps = [];
for (const p of script.paras) {
  const words = T[p.id];
  let i = 0;
  const chunks = [];
  for (const [text, n] of p.caps) {
    chunks.push({ text, t0: words[i].t });
    i += n;
  }
  if (i !== words.length) throw new Error(`caption word count mismatch in ${p.id}: ${i} vs ${words.length}`);
  chunks.forEach((c, k) => {
    c.t1 = k + 1 < chunks.length ? chunks[k + 1].t0 : Math.min(paraEnd[p.id] + 0.25, DUR);
    caps.push(c);
  });
}

// ---- map projection (equirectangular, cos(lat) corrected) ----
function makeView(cLon, cLat, latSpan, W, H) {
  const k = Math.cos((cLat * Math.PI) / 180);
  const lonSpan = (latSpan * (W / H)) / k;
  return { W, H, lonW: cLon - lonSpan / 2, lonE: cLon + lonSpan / 2, latS: cLat - latSpan / 2, latN: cLat + latSpan / 2 };
}
const proj = (v) => (lon, lat) => [((lon - v.lonW) / (v.lonE - v.lonW)) * v.W, ((v.latN - lat) / (v.latN - v.latS)) * v.H];
const f1 = (n) => Math.round(n * 10) / 10;
function ringPath(ring, P) {
  return "M" + ring.map(([lo, la]) => P(lo, la).map(f1).join(",")).join("L") + "Z";
}
function layerPaths(scene, iso, P) {
  const L = geo.scenes[scene].layers.find((l) => l.iso === iso);
  return L.polys.map((poly) => poly.map((r) => ringPath(r, P)).join(""));
}

const CARD_W = 880, CARD_H = 1000;
// view D: the whole corner (storyboard region -125..-121 x 47..50)
const vD = makeView(-123, 48.5, 3.0, CARD_W, CARD_H);
const PD = proj(vD);
// view F: Point Roberts close-up
const vF = makeView(-122.92, 48.99, 0.5, CARD_W, CARD_H);
const PF = proj(vF);

const D_US = layerPaths("s4_reveal", "US", PD).join("");
const D_CA = layerPaths("s4_reveal", "CA", PD).join("");
const F_CA = layerPaths("s7_cutoff", "CA", PF).join("");
// Point Roberts = the small US polygon whose ring starts at lon -123.035, lat 48.9925
const usF = geo.scenes["s7_cutoff"].layers.find((l) => l.iso === "US").polys;
const prIdx = usF.findIndex((poly) => Math.abs(poly[0][0][0] - -123.03531) < 1e-4);
if (prIdx < 0) throw new Error("Point Roberts polygon not found in geo.json");
const F_PR = usF[prIdx].map((r) => ringPath(r, PF)).join("");
const F_US = usF.filter((_, i) => i !== prIdx).map((poly) => poly.map((r) => ringPath(r, PF)).join("")).join("");

const BORDER_LAT = 48.99251; // where Natural Earth draws the border at this scale
const yD49 = PD(0, 49.0)[1];
const yF = PF(0, BORDER_LAT)[1];
const pr = PF(-123.07, 48.978); // Point Roberts pin
// route: Point Roberts -> north across border -> east through BC -> south across border at Blaine
const route = [
  PF(-122.757, 48.968), PF(-122.757, BORDER_LAT), PF(-122.76, 49.02), PF(-122.86, 49.045), PF(-122.98, 49.05), PF(-123.07, 49.03),
  PF(-123.07, BORDER_LAT), PF(-123.07, 48.978),
];
const routeD = "M" + route.map((p) => p.map(f1).join(",")).join("L");
// route runs mainland (Blaine) -> BC -> Tsawwassen -> Point Roberts
const cross1 = PF(-122.757, BORDER_LAT);
const cross2 = PF(-123.07, BORDER_LAT);

const DATA = { T, caps, DUR, pr, cross1, cross2, yD49, yF, CARD_W, CARD_H };

// ---- HTML pieces ----
const flagSvg = (id) => {
  const stripes = Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${i * 18.5}" width="240" height="18.5" fill="${i % 2 ? "#f8f1e2" : "#c8452d"}"/>`).join("");
  let stars = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) stars += `<circle cx="${14 + c * 20}" cy="${16 + r * 20}" r="3.6" fill="#f8f1e2"/>`;
  return `<svg id="${id}" width="240" height="130" viewBox="0 0 240 130" style="display:block;overflow:visible"><g>${stripes}<rect x="0" y="0" width="100" height="74" fill="#2f4858"/>${stars}<rect x="0" y="0" width="240" height="130" fill="none" stroke="#2b2320" stroke-width="5"/></g></svg>`;
};

const capHtml = caps
  .map((c, i) => {
    const txt = c.text.replace(/(CANADA|\d[\d,]*)/g, '<em>$1</em>');
    return `<div class="cap" id="cap${i}">${txt}</div>`;
  })
  .join("\n");

const OV = 0.5; // outgoing scene stays this long under the incoming transition
const B = [0, 3.73, 6.19, 9.01, 16.54, 19.14, 25.73, 29.09, 33.87, 37.91, DUR];
const names = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const sceneAttrs = (i) => {
  const dur = i === 9 ? DUR - B[i] : B[i + 1] - B[i] + OV;
  return `class="clip scene" id="s${names[i]}" data-start="${B[i]}" data-duration="${dur.toFixed(3)}" data-track-index="${1 + (i % 2)}"`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="assets/gsap.min.js"></script>
<style>
@font-face{font-family:"Anton";src:url("assets/fonts/anton.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Special Elite";src:url("assets/fonts/special-elite.ttf") format("truetype");font-weight:400}
@font-face{font-family:"DM Serif Display";src:url("assets/fonts/dm-serif-display.ttf") format("truetype");font-weight:400}
:root{--ink:#2b2320;--paper:#efe4cc;--card:#f8f1e2;--sea:#a9c7c2;--land:#ecd9ae;--red:#c8452d;--orange:#e08a3c;--yellow:#f2c14e;--green:#6d9a5b;--navy:#2f4858}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--paper)}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--paper);font-family:"Special Elite",monospace;color:var(--ink)}
.scene{position:absolute;inset:0;overflow:hidden}
.wrap{position:absolute;inset:0;overflow:hidden}
.bgf{position:absolute;inset:0}
.abs{position:absolute;display:block}
.anton{font-family:"Anton",sans-serif;text-transform:uppercase;line-height:.98;letter-spacing:.01em}
.serif{font-family:"DM Serif Display",serif}
.tw{font-family:"Special Elite",monospace}
.ink-sh{text-shadow:8px 9px 0 rgba(43,35,32,.9)}
.card{background:var(--card);border:6px solid var(--ink);box-shadow:12px 14px 0 rgba(43,35,32,.85)}
.mapcard{position:absolute;left:60px;top:250px;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:var(--sea);border:7px solid var(--ink);box-shadow:14px 16px 0 rgba(43,35,32,.85)}
.mapcard svg{position:absolute;left:0;top:0;display:block}
.cam{position:absolute;left:0;top:0;width:${CARD_W}px;height:${CARD_H}px}
.lbl{position:absolute;display:block;white-space:nowrap;font-family:"DM Serif Display",serif;color:var(--ink);font-size:58px;line-height:1}
.chip{position:absolute;display:block;white-space:nowrap;background:var(--card);border:5px solid var(--ink);box-shadow:7px 8px 0 rgba(43,35,32,.85);padding:8px 20px 6px;font-family:"Anton",sans-serif;font-size:50px;line-height:1.05;text-transform:uppercase;letter-spacing:.02em}
.cap{position:absolute;left:60px;width:880px;bottom:440px;text-align:center;font-family:"Anton",sans-serif;text-transform:uppercase;font-size:92px;line-height:1.04;color:#fff;opacity:0;-webkit-text-stroke:14px var(--ink);paint-order:stroke fill;text-shadow:0 8px 0 var(--ink);z-index:50}
.cap em{font-style:normal;color:var(--yellow)}
#grain{position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:multiply;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .2  0 0 0 .22 0'/></filter><rect width='360' height='360' filter='url(%23n)'/></svg>");background-size:360px 360px}
#vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 55%,rgba(43,35,32,.32) 100%)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">

<audio id="vo" src="assets/voice.m4a" data-start="0" data-duration="${DUR}" data-track-index="9" data-volume="1"></audio>

<!-- ============ A. HOOK ============ -->
<div ${sceneAttrs(0)}><div class="wrap" id="wA">
  <div class="bgf" style="background:var(--paper)"></div>
  <div class="abs" id="aSun" style="left:300px;top:420px;width:760px;height:760px;border-radius:50%;background:var(--yellow);border:7px solid var(--ink);box-shadow:14px 16px 0 rgba(43,35,32,.85);opacity:.9"></div>
  <div class="abs" id="aFlagBox" style="left:76px;top:255px;width:240px;height:130px">${flagSvg("aFlag")}</div>
  <div class="abs anton ink-sh" id="aL1" style="left:70px;top:470px;width:900px;font-size:218px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill">A US TOWN</div>
  <div class="abs anton ink-sh" id="aL2" style="left:70px;top:700px;width:900px;font-size:200px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill">CUT OFF BY</div>
  <div class="abs anton ink-sh" id="aL3" style="left:70px;top:925px;width:900px;font-size:290px;color:var(--red);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill">CANADA</div>
</div></div>

<!-- ============ B. ONLY WAY IN ============ -->
<div ${sceneAttrs(1)}><div class="wrap" id="wB">
  <div class="bgf" style="background:var(--card)"></div>
  <div class="abs anton" id="bBig" style="left:30px;top:340px;width:980px;font-size:760px;line-height:1;color:rgba(224,138,60,.16);text-align:center">!</div>
  <div class="abs card tw" id="bShort" style="left:150px;top:280px;width:700px;height:150px;font-size:76px;line-height:138px;text-align:center;letter-spacing:.04em">SHORTCUT</div>
  <svg class="abs" id="bStrikeSvg" style="left:130px;top:300px;overflow:visible" width="760" height="120" viewBox="0 0 760 120"><path id="bStrike" d="M10,70 C200,40 500,100 750,50" pathLength="1" fill="none" stroke="#c8452d" stroke-width="16" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
  <div class="abs" id="bStamp" style="left:110px;top:500px;width:760px;border:14px solid var(--orange);outline:6px solid var(--ink);outline-offset:6px;background:rgba(248,241,226,.5);padding:20px 0 6px;text-align:center">
    <div class="anton" style="font-size:230px;line-height:.86;color:var(--orange);-webkit-text-stroke:8px var(--ink);paint-order:stroke fill;text-shadow:7px 8px 0 var(--ink)">ONLY WAY IN</div>
  </div>
</div></div>

<!-- ============ C. MAPPING MISTAKE? ============ -->
<div ${sceneAttrs(2)}><div class="wrap" id="wC">
  <div class="bgf" style="background:var(--sea)"></div>
  <div class="abs" id="cFold" style="left:520px;top:300px;width:420px;height:620px">
    <svg width="420" height="620" viewBox="0 0 420 620" style="display:block;overflow:visible">
      <g stroke="#2b2320" stroke-width="6" stroke-linejoin="round">
        <polygon points="10,40 150,10 150,590 10,610" fill="#ecd9ae"/>
        <polygon points="150,10 290,50 290,630 150,590" fill="#f8f1e2"/>
        <polygon points="290,50 410,20 410,600 290,630" fill="#ecd9ae"/>
      </g>
      <path d="M40,200 C90,160 110,260 130,330 M180,150 C230,200 250,160 270,240 M320,250 C350,200 380,300 395,360" fill="none" stroke="#6d9a5b" stroke-width="9" stroke-linecap="round"/>
      <path d="M170,430 L260,520 M260,430 L170,520" fill="none" stroke="#c8452d" stroke-width="12" stroke-linecap="round" class="cX" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    </svg>
  </div>
  <div class="abs anton" id="cL1" style="left:60px;top:300px;width:520px;font-size:210px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 var(--ink)">JUST A</div>
  <div class="abs anton" id="cL2" style="left:60px;top:510px;width:560px;font-size:250px;color:var(--yellow);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 var(--ink)">MAP</div>
  <div class="abs anton" id="cL3" style="left:60px;top:760px;width:960px;font-size:208px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 var(--ink)">MISTAKE?</div>
  <div class="abs anton" id="cQ" style="left:660px;top:960px;width:260px;font-size:300px;color:var(--red);-webkit-text-stroke:9px var(--ink);paint-order:stroke fill;text-align:center">?</div>
</div></div>

<!-- ============ D. MAP: THE 49TH PARALLEL ============ -->
<div ${sceneAttrs(3)}><div class="wrap" id="wD">
  <div class="bgf" style="background:var(--paper)"></div>
  <div class="abs anton" id="dBig" style="left:40px;top:1030px;width:1000px;font-size:560px;color:rgba(43,35,32,.07);text-align:center;line-height:1">49</div>
  <div class="mapcard" id="dCard"><div class="cam" id="dCam">
    <svg width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
      <rect width="${CARD_W}" height="${CARD_H}" fill="#a9c7c2"/>
      <g id="dCA" style="filter:drop-shadow(5px 6px 0 rgba(43,35,32,.3))"><path d="${D_CA}" fill="#d3dbb0" stroke="#2b2320" stroke-width="3.5" stroke-linejoin="round" fill-rule="evenodd"/></g>
      <g id="dUS" style="filter:drop-shadow(5px 6px 0 rgba(43,35,32,.3))"><path d="${D_US}" fill="#ecd9ae" stroke="#2b2320" stroke-width="3.5" stroke-linejoin="round" fill-rule="evenodd"/></g>
      <path id="dLine" d="M-20,${f1(yD49)} L${CARD_W + 20},${f1(yD49)}" pathLength="1" fill="none" stroke="#c8452d" stroke-width="9" stroke-linecap="butt" stroke-dasharray="1" stroke-dashoffset="1"/>
    </svg>
    <div class="lbl" id="dLblCA" style="left:520px;top:290px;font-size:64px;letter-spacing:.06em">CANADA</div>
    <div class="lbl" id="dLblUS" style="left:90px;top:640px;font-size:70px;letter-spacing:.04em">UNITED STATES</div>
    <div class="chip" id="dChipLine" style="left:150px;top:${f1(yD49) - 112}px;color:var(--red);font-size:56px">49TH PARALLEL</div>
  </div></div>
  <div class="abs card" id="dTreaty" style="left:100px;top:262px;width:0;height:96px;overflow:hidden;z-index:5"><div class="tw" style="position:absolute;left:24px;top:14px;white-space:nowrap;font-size:48px;line-height:62px">TREATY OF OREGON, 1846</div></div>
</div></div>

<!-- ============ E. OOPS ============ -->
<div ${sceneAttrs(4)}><div class="wrap" id="wE">
  <div class="bgf" style="background:var(--orange)"></div>
  <div class="abs" id="eRing" style="left:240px;top:560px;width:600px;height:600px;border-radius:50%;border:16px solid var(--ink);opacity:0"></div>
  <div class="abs" id="eStamp" style="left:40px;top:480px;width:960px;text-align:center">
    <div class="anton" style="font-size:520px;line-height:1;color:var(--card);-webkit-text-stroke:14px var(--ink);paint-order:stroke fill;text-shadow:14px 16px 0 var(--ink)">OOPS</div>
  </div>
  <svg class="abs" id="eCutSvg" style="left:0;top:690px;overflow:visible" width="1080" height="60" viewBox="0 0 1080 60"><path id="eCut" d="M-20,30 L1100,30" pathLength="1" fill="none" stroke="#2b2320" stroke-width="11" stroke-dasharray="0.03 0.03" stroke-dashoffset="0"/></svg>
</div></div>

<!-- ============ F. MAP: POINT ROBERTS ============ -->
<div ${sceneAttrs(5)}><div class="wrap" id="wF">
  <div class="bgf" style="background:var(--paper)"></div>
  <div class="mapcard" id="fCard"><div class="cam" id="fCam">
    <svg width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
      <rect width="${CARD_W}" height="${CARD_H}" fill="#a9c7c2"/>
      <g id="fCA" style="filter:drop-shadow(5px 6px 0 rgba(43,35,32,.3))"><path d="${F_CA}" fill="#d3dbb0" stroke="#2b2320" stroke-width="3.5" stroke-linejoin="round" fill-rule="evenodd"/></g>
      <g id="fUS" style="filter:drop-shadow(5px 6px 0 rgba(43,35,32,.3))"><path d="${F_US}" fill="#ecd9ae" stroke="#2b2320" stroke-width="3.5" stroke-linejoin="round" fill-rule="evenodd"/></g>
      <g id="fPRg" style="filter:drop-shadow(5px 6px 0 rgba(43,35,32,.3))"><path id="fPR" d="${F_PR}" fill="#ecd9ae" stroke="#2b2320" stroke-width="4" stroke-linejoin="round" fill-rule="evenodd"/></g>
      <path d="M-20,${f1(yF)} L${CARD_W + 20},${f1(yF)}" fill="none" stroke="#c8452d" stroke-width="5" stroke-dasharray="16 11"/>
      <path id="fRoute" d="${routeD}" pathLength="1" fill="none" stroke="#2b2320" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/>
      <path id="fRoute2" d="${routeD}" pathLength="1" fill="none" stroke="#f2c14e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0.03 0.025" stroke-dashoffset="1" opacity="0"/>
      <circle id="fRing" cx="${f1(pr[0])}" cy="${f1(pr[1])}" r="30" fill="none" stroke="#c8452d" stroke-width="7" opacity="0"/>
      <circle id="fPin" cx="${f1(pr[0])}" cy="${f1(pr[1])}" r="17" fill="#c8452d" stroke="#2b2320" stroke-width="5" opacity="0"/>
      <circle id="fTruck" cx="${f1(pr[0])}" cy="${f1(pr[1])}" r="15" fill="#f2c14e" stroke="#2b2320" stroke-width="5" opacity="0"/>
      <g id="fX1" opacity="0"><circle cx="${f1(cross1[0])}" cy="${f1(cross1[1])}" r="26" fill="#f8f1e2" stroke="#2b2320" stroke-width="5"/><text x="${f1(cross1[0])}" y="${f1(cross1[1]) + 14}" text-anchor="middle" font-family="Anton" font-size="38" fill="#2b2320">1</text></g>
      <g id="fX2" opacity="0"><circle cx="${f1(cross2[0])}" cy="${f1(cross2[1])}" r="26" fill="#f8f1e2" stroke="#2b2320" stroke-width="5"/><text x="${f1(cross2[0])}" y="${f1(cross2[1]) + 14}" text-anchor="middle" font-family="Anton" font-size="38" fill="#2b2320">2</text></g>
    </svg>
    <div class="lbl" style="left:80px;top:100px;font-size:64px;letter-spacing:.05em" id="fLblCA">CANADA</div>
    <div class="lbl" style="left:560px;top:860px;font-size:44px" id="fLblUS">WASHINGTON</div>
    <div class="chip" id="fChipPR" style="left:${f1(pr[0]) - 110}px;top:${f1(pr[1]) + 56}px">POINT ROBERTS</div>
    <div class="chip" id="fChipSq" style="left:${f1(pr[0]) - 110}px;top:${f1(pr[1]) + 140}px;font-family:'Special Elite',monospace;font-size:34px;text-transform:uppercase;background:var(--yellow)">ABOUT 5 SQ. MILES</div>
  </div></div>
  <div class="abs chip" id="fChipRoute" style="left:90px;top:262px;font-size:60px;background:var(--yellow);z-index:5">25 MILES THROUGH CANADA</div>
</div></div>

<!-- ============ G. KIDS ============ -->
<div ${sceneAttrs(6)}><div class="wrap" id="wG">
  <div class="bgf" style="background:var(--yellow)"></div>
  <div class="abs anton" id="gFour" style="left:60px;top:250px;width:420px;font-size:640px;line-height:1;color:var(--card);-webkit-text-stroke:14px var(--ink);paint-order:stroke fill;text-shadow:14px 16px 0 var(--ink);text-align:center">4</div>
  <div class="abs anton" id="gCross" style="left:480px;top:300px;width:470px;font-size:108px;line-height:1.02;color:var(--ink)">CROSSINGS</div>
  <div class="abs tw" id="gADay" style="left:490px;top:445px;width:450px;font-size:56px;line-height:1.1">A DAY</div>
  <div class="abs" id="gTally" style="left:490px;top:560px;width:450px;height:150px">${[0,1,2,3].map(i=>`<div class="abs" id="gT${i}" style="left:${i*70}px;top:10px;width:26px;height:130px;background:var(--ink);border-radius:13px;opacity:0"></div>`).join("")}</div>
  <div class="abs" id="gRoad" style="left:0;top:790px;width:1080px;height:300px">
    <div class="abs" style="left:0;top:90px;width:1080px;height:130px;background:var(--ink)"></div>
    <div class="abs" style="left:0;top:150px;width:1080px;height:0;border-top:8px dashed var(--yellow)"></div>
    <div class="abs" id="gBorder" style="left:520px;top:0;width:30px;height:300px;background:repeating-linear-gradient(0deg,var(--red) 0 30px,var(--card) 30px 60px);border:4px solid var(--ink)"></div>
    <div class="abs chip" id="gBorderLbl" style="left:600px;top:238px;font-size:34px;padding:5px 14px 3px;box-shadow:5px 6px 0 rgba(43,35,32,.85)">THE BORDER</div>
    <div class="abs" id="gBus" style="left:0;top:20px;width:260px;height:150px">
      <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;overflow:visible">
        <rect x="8" y="14" width="236" height="96" rx="20" fill="#f2c14e" stroke="#2b2320" stroke-width="7"/>
        <rect x="26" y="34" width="46" height="36" fill="#f8f1e2" stroke="#2b2320" stroke-width="5"/><rect x="86" y="34" width="46" height="36" fill="#f8f1e2" stroke="#2b2320" stroke-width="5"/><rect x="146" y="34" width="46" height="36" fill="#f8f1e2" stroke="#2b2320" stroke-width="5"/>
        <rect x="8" y="80" width="236" height="12" fill="#2b2320"/>
        <circle cx="62" cy="116" r="22" fill="#2b2320"/><circle cx="62" cy="116" r="8" fill="#efe4cc"/><circle cx="192" cy="116" r="22" fill="#2b2320"/><circle cx="192" cy="116" r="8" fill="#efe4cc"/>
      </svg>
    </div>
  </div>
  <div class="abs" id="gStamp" style="left:70px;top:1130px;width:800px;border:12px solid var(--red);outline:5px solid var(--ink);outline-offset:6px;background:var(--card);padding:14px 0 4px;text-align:center">
    <div class="anton" style="font-size:112px;color:var(--red);line-height:1">JUST FOR SCHOOL</div>
  </div>
</div></div>

<!-- ============ H. WATER ============ -->
<div ${sceneAttrs(7)}><div class="wrap" id="wH">
  <div class="bgf" style="background:var(--sea)"></div>
  <div class="abs" id="hBorder" style="left:520px;top:240px;width:0;height:1020px;border-left:10px dashed var(--red)"></div>
  <div class="abs chip" id="hCanadaTag" style="left:600px;top:262px;font-size:44px">CANADA</div>
  <div class="abs chip" id="hUSTag" style="left:70px;top:262px;font-size:44px">POINT ROBERTS</div>
  <svg class="abs" id="hPipeSvg" style="left:0;top:0" width="1080" height="1920" viewBox="0 0 1080 1920">
    <path id="hPipe" d="M1100,520 L640,520 L420,520" pathLength="1" fill="none" stroke="#2b2320" stroke-width="64" stroke-linecap="butt" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path id="hPipeIn" d="M1100,520 L640,520 L420,520" pathLength="1" fill="none" stroke="#2f4858" stroke-width="44" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path id="hFlow" d="M1100,520 L640,520 L420,520" pathLength="1" fill="none" stroke="#a9c7c2" stroke-width="14" stroke-linecap="round" stroke-dasharray="0.03 0.05" stroke-dashoffset="0" opacity="0"/>
  </svg>
  <svg class="abs" id="hFaucet" style="left:140px;top:430px;overflow:visible" width="320" height="400" viewBox="0 0 320 400">
    <rect x="240" y="40" width="80" height="64" fill="#f8f1e2" stroke="#2b2320" stroke-width="7"/>
    <path d="M280,72 L280,20 L180,20 L180,90" fill="none" stroke="#2b2320" stroke-width="40" stroke-linejoin="round" stroke-linecap="butt"/>
    <path d="M280,72 L280,20 L180,20 L180,86" fill="none" stroke="#e08a3c" stroke-width="22" stroke-linejoin="round"/>
    <rect x="156" y="84" width="48" height="26" rx="6" fill="#2b2320"/>
    <rect x="250" y="-14" width="60" height="22" rx="10" fill="#c8452d" stroke="#2b2320" stroke-width="6"/>
  </svg>
  <div id="hDrops">${Array.from({length:10},(_,i)=>`<div class="abs hdrop" style="left:309px;top:548px;width:22px;height:30px;background:#2f4858;border:4px solid #2b2320;border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;opacity:0"></div>`).join("")}</div>
  <svg class="abs" id="hGlass" style="left:235px;top:1010px;overflow:visible" width="170" height="220" viewBox="0 0 170 220">
    <path d="M10,10 L160,10 L140,210 L30,210 Z" fill="#f8f1e2" fill-opacity=".55" stroke="#2b2320" stroke-width="7" stroke-linejoin="round"/>
    <rect id="hWater" x="22" y="210" width="126" height="0" fill="#2f4858" opacity=".75"/>
  </svg>
  <div class="abs card" id="hDoc" style="left:420px;top:760px;width:520px;height:440px">
    <div class="tw" style="position:absolute;left:30px;top:24px;font-size:30px;line-height:36px;width:460px">AGREEMENT</div>
    <div class="tw" style="position:absolute;left:30px;top:84px;font-size:27px;line-height:34px;width:460px;white-space:normal">GREATER VANCOUVER WATER DISTRICT</div>
    <div style="position:absolute;left:30px;top:190px;width:300px;height:7px;background:var(--ink);opacity:.55"></div>
    <div style="position:absolute;left:30px;top:226px;width:380px;height:7px;background:var(--ink);opacity:.55"></div>
    <div style="position:absolute;left:30px;top:262px;width:240px;height:7px;background:var(--ink);opacity:.55"></div>
  </div>
  <div class="abs" id="hStamp1987" style="left:610px;top:1020px;width:300px;border:10px solid var(--red);padding:6px 0 0;text-align:center;background:rgba(248,241,226,.7)"><div class="anton" style="font-size:150px;line-height:1;color:var(--red)">1987</div></div>
  <div class="abs chip" id="hFromCanada" style="left:630px;top:400px;font-size:62px;background:var(--yellow)">FROM CANADA</div>
</div></div>

<!-- ============ I. TODAY ============ -->
<div ${sceneAttrs(8)}><div class="wrap" id="wI">
  <div class="bgf" style="background:var(--ink)"></div>
  <div class="abs anton" id="iYear" style="left:70px;top:250px;width:600px;font-size:150px;line-height:1;color:var(--yellow)">2025</div>
  <div class="abs tw" id="iSub" style="left:70px;top:405px;width:900px;font-size:36px;line-height:1.2;color:var(--card)">FEBRUARY, COMPARED WITH A YEAR EARLIER</div>
  <div class="abs" id="iBase" style="left:70px;top:1020px;width:480px;height:8px;background:var(--card)"></div>
  <div class="abs" id="iBar1" style="left:90px;top:520px;width:200px;height:500px;background:var(--green);border:6px solid var(--card)"></div>
  <div class="abs" id="iBar2" style="left:340px;top:520px;width:200px;height:500px;background:var(--red);border:6px solid var(--card)"></div>
  <div class="abs tw" id="iLb1" style="left:70px;top:1040px;width:240px;text-align:center;font-size:30px;color:var(--card)">YEAR BEFORE</div>
  <div class="abs tw" id="iLb2" style="left:320px;top:1040px;width:240px;text-align:center;font-size:30px;color:var(--card)">FEBRUARY</div>
  <div class="abs anton" id="iNum" style="left:500px;top:560px;width:400px;font-size:250px;line-height:1;color:var(--card);text-align:right;-webkit-text-stroke:0;text-shadow:10px 11px 0 var(--red)">0%</div>
  <div class="abs anton" id="iDown" style="left:500px;top:470px;width:400px;font-size:84px;color:var(--yellow);text-align:right">DOWN</div>
  <div class="abs chip" id="iChip" style="left:70px;top:1120px;font-size:36px;font-family:'Special Elite',monospace;white-space:normal;width:770px;line-height:1.2;background:var(--yellow);text-transform:uppercase;padding:12px 20px 9px">ONE BUSINESS OWNER'S REPORTED FIGURE</div>
</div></div>

<!-- ============ J. LOOP ============ -->
<div ${sceneAttrs(9)}><div class="wrap" id="wJ">
  <div class="bgf" style="background:var(--paper)"></div>
  <div class="abs" id="jSun" style="left:300px;top:420px;width:760px;height:760px;border-radius:50%;background:var(--yellow);border:7px solid var(--ink);box-shadow:14px 16px 0 rgba(43,35,32,.85);opacity:.9"></div>
  <div class="abs" id="jFlagBox" style="left:76px;top:255px;width:240px;height:130px">${flagSvg("jFlag")}</div>
  <div class="abs anton" id="jL1" style="left:70px;top:470px;width:900px;font-size:218px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 rgba(43,35,32,.9)">A US TOWN</div>
  <div class="abs anton" id="jL2" style="left:70px;top:700px;width:900px;font-size:200px;color:var(--card);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 rgba(43,35,32,.9)">CUT OFF BY</div>
  <div class="abs anton" id="jL3" style="left:70px;top:925px;width:900px;font-size:290px;color:var(--red);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;text-shadow:8px 9px 0 rgba(43,35,32,.9)">CANADA</div>
  <svg class="abs" id="jLoopSvg" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920">
    <path id="jLoop" d="M900,1090 C1010,1000 990,860 800,860 C560,860 150,880 80,1000 C40,1100 160,1230 420,1250 C700,1270 960,1220 960,1130" pathLength="1" fill="none" stroke="#2b2320" stroke-width="12" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/>
  </svg>
</div></div>

<!-- ============ CAPTIONS ============ -->
<div id="capLayer" class="clip" data-start="0" data-duration="${DUR}" data-track-index="5" style="position:absolute;inset:0;z-index:50">
${capHtml}
</div>
<div id="grain" class="clip" data-start="0" data-duration="${DUR}" data-track-index="6" style="z-index:40"></div>
<div id="vig" class="clip" data-start="0" data-duration="${DUR}" data-track-index="7" style="z-index:41"></div>
</div>
<script>window.__D=${JSON.stringify(DATA)};window.__B=${JSON.stringify(B)};</script>
<script>${fs.readFileSync(path.join(here, "page.js"), "utf8")}</script>
</body>
</html>
`;

fs.writeFileSync(path.join(here, "index.html"), html);
console.log("wrote index.html", html.length, "bytes;", caps.length, "caption chunks");

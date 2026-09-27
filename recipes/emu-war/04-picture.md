# Step 4: The picture

## 4.1 Create `shorts/emu-war/render/index.html`

This is the page Chromium loads: three fonts and one 1080×1920 canvas.

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: "Anton"; src: url("../assets/anton.ttf"); }
  @font-face { font-family: "Elite"; src: url("../assets/special-elite.ttf"); }
  @font-face { font-family: "Serif"; src: url("../assets/dm-serif-display.ttf"); }
  html, body { margin: 0; background: #111; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="c" width="1080" height="1920"></canvas>
<script src="emu.js"></script>
</body>
</html>
```

## 4.2 Create `shorts/emu-war/render/emu.js`

This is the renderer. `render(t)` draws the frame at time `t` (seconds). It holds the palette, the
paper-cutout helpers, the characters (emu, soldier, Lewis gun, truck), 13 scenes, torn-paper wipes,
captions, the paper texture and grain. `sfxCues()` exports the sound-effect timeline.

```js
// THE GREAT EMU WAR — every frame is a pure function of t.
// No Math.random, no clock: all variation comes from rnd(), a seeded integer hash.
// Timing comes from window.TL (build/timeline.json, generated from the voiceover).
"use strict";

const W = 1080, H = 1920, FPS = 24;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// ---------- palette ----------
const INK = "#2b2320", CREAM = "#f3ead7", CARD = "#f8f1e2", SKY = "#efe2c4", SUN = "#f4cf6b";
const HILL = "#dcb27a", GROUND = "#cf9a5f", GROUND2 = "#bf874f", SCRUB = "#6e7148", SCRUB2 = "#585b37";
const KHAKI = "#a38d5a", KHAKI2 = "#8a774b", HAT = "#77643f", SKIN = "#e6c09a", BOOT = "#3d2f25";
const EMU_BODY = "#4b3a30", EMU_FEATHER = "#6a5445", EMU_NECK = "#8ea1ae", EMU_HEAD = "#5a4a40", EMU_LEG = "#8c7f73";
const WHEAT = "#e3b94b", WHEAT2 = "#c99a33", EATEN = "#b9895a", RED = "#c8452d", OCEAN = "#9fbcb8", OCEAN2 = "#8eaeaa";
const LAND = "#ecd3a0", WA = "#dc9d5c", STEEL = "#45443e", STEEL2 = "#5b5a52", OLIVE = "#6b6f45", OLIVE2 = "#565a36", BRASS = "#c9a043";

// ---------- deterministic helpers ----------
function hash(n) {
  n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296;
}
const rnd = (a, b = 0, c = 0) => hash((Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791)) | 0);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const fmt = n => Math.round(n).toLocaleString("en-US");

// ---------- timeline ----------
const TL = window.TL;
const LN = id => TL.lines.find(l => l.id === id);
const S = id => LN(id).start;
const E = id => LN(id).end;
const WT = (id, word) => { const l = LN(id); const w = l.words.find(w => w.w.toLowerCase().replace(/[^a-z0-9']/g, "") === word); return w ? w.t : l.start; };
const CAP = text => TL.caps.find(c => c.text === text).start;

let T = 0; // current time, set by render()

// ---------- drawing primitives ----------
function boil(id, amt = 1) {
  const f = Math.floor(T * 12);
  ctx.translate((rnd(id, f, 1) - 0.5) * 2.0 * amt, (rnd(id, f, 2) - 0.5) * 2.0 * amt);
  ctx.rotate((rnd(id, f, 3) - 0.5) * 0.01 * amt);
}
function cut(path, fill, o = {}) {
  ctx.save();
  if (o.shadow !== false) {
    ctx.shadowColor = o.sc || "rgba(45,28,16,0.35)";
    ctx.shadowOffsetX = o.sx ?? 5; ctx.shadowOffsetY = o.sy ?? 7; ctx.shadowBlur = o.sb ?? 6;
  }
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
  if (o.lw !== 0) {
    ctx.save(); ctx.beginPath(); path();
    ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.ink || INK; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
    ctx.restore();
  }
}
function smooth(pts) {
  const n = pts.length;
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}
function stroke2(path, color, w, inkW) { // inked tube: ink underlay then colour
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = inkW ?? w + 7; ctx.stroke();
  ctx.beginPath(); path(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function text(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.size || 60}px ${o.font || "Anton"}`;
  ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "alphabetic";
  if (o.ls) ctx.letterSpacing = o.ls + "px";
  if (o.shadow) { ctx.shadowColor = "rgba(45,28,16,0.4)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.shadowBlur = 4; }
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || INK; ctx.strokeText(str, x, y); ctx.shadowColor = "transparent"; }
  ctx.fillStyle = o.color || INK; ctx.fillText(str, x, y);
  ctx.restore();
}
function label(str, x, y, o = {}) { // typewriter text on a paper tag
  ctx.save();
  ctx.font = `${o.size || 40}px Elite`;
  const w = ctx.measureText(str).width + 36, h = (o.size || 40) * 1.45;
  ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const ax = o.align === "left" ? 0 : -w / 2;
  cut(() => ctx.rect(ax, -h / 2, w, h), o.bg || CARD, { lw: 3 });
  ctx.fillStyle = o.color || INK; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(str, ax + 18, 2);
  ctx.restore();
}
const STAMPS = {};
function stampImage(str, size, color) { // cached offscreen so the worn-ink knockouts only cut the stamp
  const key = str + size + color;
  if (STAMPS[key]) return STAMPS[key];
  const c = document.createElement("canvas"), g = c.getContext("2d");
  g.font = `${size}px Anton`; g.letterSpacing = "6px";
  const w = g.measureText(str).width + 50, h = size * 1.15;
  c.width = Math.ceil(w + 20); c.height = Math.ceil(h + 20);
  g.translate(c.width / 2, c.height / 2);
  g.font = `${size}px Anton`; g.letterSpacing = "6px";
  g.strokeStyle = color; g.lineWidth = 10; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(str, 0, 6);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.5 + rnd(i, 10, str.length) * 0.5;
    g.beginPath(); g.arc((rnd(i, 7, str.length) - 0.5) * w, (rnd(i, 8, str.length) - 0.5) * h, 1.5 + rnd(i, 9) * 4, 0, 7); g.fill();
  }
  return (STAMPS[key] = c);
}
function stamp(str, x, y, k, o = {}) { // rubber stamp that slams in (k: seconds since hit)
  if (k <= 0) return;
  const img = stampImage(str, o.size || 120, o.color || RED);
  const s = 1 + 0.9 * (1 - eout(clamp(k * 5)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(s, s);
  ctx.globalAlpha = clamp(k * 8) * 0.9;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}
function star(cx, cy, r, fill) {
  cut(() => {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }, fill, { lw: 4 });
}

// ---------- characters ----------
// Emu: feet at origin, ~310 units tall. o: x,y,s,dir,ph (run/walk phase),gait(0 stand,1 walk,2 run),peck,stare,id
function emu(o) {
  const g = o.gait || 0, ph = o.ph || 0;
  ctx.save(); ctx.translate(o.x, o.y); boil(o.id || 1, 0.8 / (o.s || 1));
  ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  const bob = g ? -Math.abs(Math.sin(ph)) * (g === 2 ? 16 : 6) : Math.sin(T * 3 + (o.id || 0)) * 1.5;
  ctx.translate(0, bob);
  const leg = (side, col) => {
    // emu "knee" is really the ankle: upper segment angles back, lower segment forward
    const hip = [-8 + side * 12, -150];
    const amp = g === 2 ? 0.7 : g === 1 ? 0.32 : 0;
    const lift = g ? Math.max(0, Math.sin(ph + side * Math.PI + 1.3)) * (g === 2 ? 1.0 : 0.45) : 0;
    const a = -0.45 + amp * Math.sin(ph + side * Math.PI) - lift * 0.35 + (g ? 0 : side * 0.06);
    const b = a + 0.8 + lift * 0.6;
    const knee = [hip[0] + Math.sin(a) * 70, hip[1] + Math.cos(a) * 70];
    const foot = [knee[0] + Math.sin(b) * 90, knee[1] + Math.cos(b) * 90];
    stroke2(() => { ctx.moveTo(...hip); ctx.lineTo(...knee); ctx.lineTo(...foot); }, col, 9, 16);
    stroke2(() => {
      ctx.moveTo(...foot); ctx.lineTo(foot[0] + 26, foot[1] + 2);
      ctx.moveTo(...foot); ctx.lineTo(foot[0] + 18, foot[1] - 8);
      ctx.moveTo(...foot); ctx.lineTo(foot[0] - 12, foot[1] + 1);
    }, col, 6, 11);
  };
  leg(1, "#6f645a");
  // body: shaggy blob
  const body = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const lower = Math.sin(a) > 0.1;
    const r = lower ? (i % 2 ? 1.13 : 0.97) : 1 + (rnd(i, 3) - 0.5) * 0.06;
    body.push([-12 + Math.cos(a) * 98 * r, -178 + Math.sin(a) * 60 * r - (Math.cos(a) < -0.7 ? 12 : 0)]);
  }
  cut(() => smooth(body), EMU_BODY, { lw: 5 });
  ctx.save(); ctx.strokeStyle = EMU_FEATHER; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const fx = -80 + i * 24, fy = -190 + (i % 2) * 18;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + 10, fy + 18, fx + 2, fy + 34); ctx.stroke();
  }
  ctx.restore();
  leg(0, EMU_LEG);
  // neck + head
  const pk = o.peck || 0;
  const head = [lerp(80, 150, pk), lerp(-308, -30, pk)];
  const ctl = [lerp(108, 165, pk), lerp(-250, -150, pk)];
  stroke2(() => { ctx.moveTo(58, -200); ctx.quadraticCurveTo(ctl[0], ctl[1], head[0], head[1] + 8); }, EMU_NECK, 18, 27);
  // dark neck feathers at base
  cut(() => { ctx.ellipse(62, -208, 26, 20, 0.5, 0, 7); }, EMU_BODY, { shadow: false, lw: 0 });
  ctx.save(); ctx.translate(head[0], head[1]); ctx.rotate(pk * 1.2);
  if (o.stare) { // facing camera
    cut(() => ctx.ellipse(0, 0, 25, 24, 0, 0, 7), EMU_HEAD, { lw: 4 });
    cut(() => { ctx.moveTo(-9, 8); ctx.lineTo(9, 8); ctx.lineTo(0, 30); ctx.closePath(); }, "#3b302a", { lw: 3, shadow: false });
    for (const ex of [-11, 11]) {
      cut(() => ctx.arc(ex, -5, 9.5, 0, 7), "#fffaf0", { lw: 3, shadow: false });
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex, -4, 4.6, 0, 7); ctx.fill();
    }
  } else {
    cut(() => ctx.ellipse(0, 0, 26, 19, -0.1, 0, 7), EMU_HEAD, { lw: 4 });
    cut(() => { ctx.moveTo(20, -6); ctx.quadraticCurveTo(52, 0, 50, 6); ctx.lineTo(20, 9); ctx.closePath(); }, "#3b302a", { lw: 3, shadow: false });
    cut(() => ctx.arc(6, -5, 9, 0, 7), "#fffaf0", { lw: 3, shadow: false });
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(8 + (o.lookX || 0) * 3, -4 + (o.lookY || 0) * 3, 4.4, 0, 7); ctx.fill();
    // tuft
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 6, -17); ctx.lineTo(-14 + i * 5, -30 - i * 2); ctx.stroke(); }
  }
  ctx.restore();
  ctx.restore();
}

// Soldier: feet at origin, ~275 units tall. o: x,y,s,dir,walk(phase or null),flag(0..1),major,hat
function soldier(o) {
  ctx.save(); ctx.translate(o.x, o.y); boil(o.id || 7, 0.8 / (o.s || 1));
  ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  const wk = o.walk != null ? Math.sin(o.walk) : 0;
  const bob = o.walk != null ? -Math.abs(Math.cos(o.walk)) * 5 : 0;
  ctx.translate(0, bob);
  const coat = o.major ? "#8f7b4f" : KHAKI;
  for (const [sx, sgn] of [[-13, 1], [13, -1]]) {
    ctx.save(); ctx.translate(sx, -112); ctx.rotate(wk * 0.45 * sgn);
    cut(() => ctx.roundRect(-11, 0, 22, 100, 6), KHAKI2, { lw: 4 });
    cut(() => ctx.roundRect(-12, 88, 32, 22, 6), BOOT, { lw: 4, shadow: false });
    ctx.restore();
  }
  cut(() => ctx.roundRect(-42, -212, 84, 112, 16), coat, { lw: 5 });
  cut(() => ctx.rect(-42, -134, 84, 12), "#5e4a2e", { lw: 3, shadow: false });
  ctx.fillStyle = INK; for (const by of [-190, -165]) { ctx.beginPath(); ctx.arc(0, by, 3.5, 0, 7); ctx.fill(); }
  // arms
  const flag = o.flag || 0;
  stroke2(() => { ctx.moveTo(-34, -198); ctx.lineTo(-40 - wk * 18, -132); }, coat, 18, 26);
  if (flag > 0) {
    const hx = 46, hy = lerp(-140, -250, eout(flag));
    stroke2(() => { ctx.moveTo(34, -198); ctx.lineTo(hx, hy); }, coat, 18, 26);
    stroke2(() => { ctx.moveTo(hx, hy + 70); ctx.lineTo(hx, hy - 150); }, "#8a6a45", 6, 11);
    const wv = Math.sin(T * 9);
    cut(() => {
      ctx.moveTo(hx, hy - 150);
      ctx.quadraticCurveTo(hx + 45, hy - 150 + wv * 10, hx + 95, hy - 145);
      ctx.lineTo(hx + 92, hy - 88);
      ctx.quadraticCurveTo(hx + 45, hy - 92 - wv * 10, hx, hy - 95);
      ctx.closePath();
    }, "#fbf7ee", { lw: 4 });
  } else {
    stroke2(() => { ctx.moveTo(34, -198); ctx.lineTo(40 + wk * 18, -132); }, coat, 18, 26);
  }
  // head
  cut(() => ctx.arc(0, -242, 27, 0, 7), SKIN, { lw: 4 });
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(10, -246, 3.4, 0, 7); ctx.arc(-4, -246, 3.4, 0, 7); ctx.fill();
  if (o.major) {
    cut(() => { ctx.moveTo(-22, -229); ctx.quadraticCurveTo(3, -238, 26, -229); ctx.quadraticCurveTo(3, -224, -22, -229); }, "#4a3426", { lw: 2, shadow: false });
    cut(() => ctx.roundRect(-27, -284, 54, 26, 8), "#5b5a3a", { lw: 4 });
    cut(() => ctx.rect(-27, -266, 54, 8), RED, { lw: 3, shadow: false });
    cut(() => { ctx.ellipse(12, -258, 26, 6, 0, 0, 7); }, "#2e2a22", { lw: 3, shadow: false });
  } else {
    ctx.beginPath(); ctx.moveTo(-6, -228); ctx.quadraticCurveTo(4, -222, 12, -229); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    // slouch hat, left brim pinned up
    cut(() => { ctx.moveTo(-22, -262); ctx.quadraticCurveTo(-18, -292, 2, -294); ctx.quadraticCurveTo(24, -292, 26, -262); ctx.closePath(); }, HAT, { lw: 4 });
    cut(() => { ctx.moveTo(-26, -262); ctx.quadraticCurveTo(-40, -290, -34, -300); ctx.lineTo(-20, -262); ctx.lineTo(56, -262); ctx.quadraticCurveTo(60, -254, 52, -252); ctx.lineTo(-24, -254); ctx.closePath(); }, HAT, { lw: 4 });
    cut(() => ctx.rect(-21, -270, 47, 7), "#4a3c26", { lw: 0, shadow: false });
  }
  ctx.restore();
}

// Lewis gun, pointing +x, bipod feet at origin. o: x,y,s,dir,recoil
function gun(o) {
  ctx.save(); ctx.translate(o.x, o.y); boil(o.id || 11, 0.6 / (o.s || 1));
  ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  ctx.translate(-(o.recoil || 0) * 8, 0);
  stroke2(() => { ctx.moveTo(40, -70); ctx.lineTo(20, 0); ctx.moveTo(40, -70); ctx.lineTo(62, 0); }, STEEL2, 5, 10);
  cut(() => { ctx.moveTo(-150, -86); ctx.lineTo(-80, -96); ctx.lineTo(-80, -66); ctx.lineTo(-150, -54); ctx.closePath(); }, "#7b5a3a", { lw: 4 });
  cut(() => ctx.roundRect(-85, -98, 190, 34, 12), STEEL, { lw: 4 });
  ctx.strokeStyle = STEEL2; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 20, -94); ctx.lineTo(-60 + i * 20, -68); ctx.stroke(); }
  cut(() => ctx.rect(100, -88, 55, 14), STEEL, { lw: 4 });
  cut(() => ctx.ellipse(-30, -110, 50, 13, 0, 0, 7), "#3a3934", { lw: 4 });
  cut(() => ctx.ellipse(-30, -114, 12, 4, 0, 0, 7), STEEL2, { lw: 2, shadow: false });
  ctx.restore();
}

function bullet(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(() => ctx.roundRect(-9, -8, 20, 44, 3), BRASS, { lw: 3, sx: 3, sy: 4, sb: 3 });
  cut(() => { ctx.moveTo(-8, -8); ctx.quadraticCurveTo(-8, -40, 1, -46); ctx.quadraticCurveTo(10, -40, 10, -8); ctx.closePath(); }, "#b8764a", { lw: 3, shadow: false });
  ctx.restore();
}

function truck(o) { // faces +x, ground at origin
  ctx.save(); ctx.translate(o.x, o.y); boil(o.id || 21, 0.6);
  ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  const bnc = o.bounce || 0;
  // wheels (on the ground)
  for (const wx of [-150, 135]) {
    ctx.save(); ctx.translate(wx, -40);
    cut(() => ctx.arc(0, 0, 40, 0, 7), "#2f2a25", { lw: 4 });
    cut(() => ctx.arc(0, 0, 18, 0, 7), "#7d7a6e", { lw: 3, shadow: false });
    ctx.rotate(o.spin || 0); ctx.strokeStyle = INK; ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.stroke(); }
    ctx.restore();
  }
  ctx.translate(0, -bnc);
  if (o.cargo) o.cargo();
  cut(() => ctx.roundRect(-235, -118, 250, 40, 6), OLIVE, { lw: 4 });
  ctx.strokeStyle = OLIVE2; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-215 + i * 50, -114); ctx.lineTo(-215 + i * 50, -82); ctx.stroke(); }
  cut(() => ctx.roundRect(15, -220, 110, 145, 10), OLIVE, { lw: 4 });
  cut(() => ctx.roundRect(38, -205, 70, 55, 6), "#d7e2d6", { lw: 3, shadow: false });
  cut(() => { ctx.moveTo(125, -160); ctx.quadraticCurveTo(215, -165, 222, -120); ctx.lineTo(225, -78); ctx.lineTo(125, -78); ctx.closePath(); }, OLIVE, { lw: 4 });
  ctx.strokeStyle = OLIVE2; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(150 + i * 14, -140); ctx.lineTo(150 + i * 14, -95); ctx.stroke(); }
  cut(() => ctx.arc(222, -128, 11, 0, 7), "#f6e3a0", { lw: 3, shadow: false });
  for (const wx of [-150, 135]) cut(() => { ctx.moveTo(wx - 60, -76); ctx.quadraticCurveTo(wx, -118, wx + 60, -76); ctx.closePath(); }, OLIVE2, { lw: 4, shadow: false });
  ctx.restore();
}

function puff(x, y, r, a, col = "#efe6d4") {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const pts = []; for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283; const rr = r * (i % 2 ? 0.8 : 1.05); pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.8]); }
  cut(() => smooth(pts), col, { lw: 3, sx: 3, sy: 4 });
  ctx.restore();
}

// ---------- backgrounds ----------
const GY = 1150; // ground line
function outback(o = {}) {
  const scroll = o.scroll || 0;
  ctx.fillStyle = SKY; ctx.fillRect(0, 0, W, H);
  cut(() => ctx.arc(820, 420, 95, 0, 7), SUN, { lw: 4, sx: 4, sy: 5 });
  // far hills
  const hill = (base, amp, col, par, seed) => {
    cut(() => {
      const off = (scroll * par) % 360;
      ctx.moveTo(-10, H);
      for (let x = -360; x <= W + 360; x += 30) {
        const k = Math.floor((x + off) / 360), f = ((x + off) % 360 + 360) % 360 / 360;
        const y = base - amp * (0.5 + 0.5 * Math.sin(f * Math.PI * 2 + rnd(k, seed) * 6)) * (0.7 + 0.3 * rnd(k, seed + 1));
        ctx.lineTo(x - (off % 30), y);
      }
      ctx.lineTo(W + 10, H); ctx.closePath();
    }, col, { lw: 4 });
  };
  hill(930, 110, HILL, 0.15, 3);
  hill(1030, 60, "#d4a56d", 0.35, 5);
  cut(() => {
    ctx.moveTo(-10, H); ctx.lineTo(-10, GY - 20);
    for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, GY - 20 + Math.sin(x * 0.013 + 1) * 8);
    ctx.lineTo(W + 10, H); ctx.closePath();
  }, GROUND, { lw: 5 });
  cut(() => { ctx.rect(-10, GY + 170, W + 20, H); }, GROUND2, { lw: 4, shadow: false });
  // scrub bushes (parallax)
  for (let i = 0; i < 14; i++) {
    const span = W + 400;
    const bx = ((rnd(i, 41) * span - scroll * 1.0) % span + span) % span - 200;
    const by = GY - 10 + rnd(i, 42) * 150, r = 26 + rnd(i, 43) * 30;
    const pts = []; for (let j = 0; j < 9; j++) { const a = Math.PI + j / 8 * Math.PI; pts.push([bx + Math.cos(a) * r * 1.3, by + Math.sin(a) * r * (j % 2 ? 0.9 : 1.1)]); }
    cut(() => smooth(pts), i % 2 ? SCRUB : SCRUB2, { lw: 4 });
  }
}
function wheat(x, y, h, id, eaten = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(T * 1.6 + id) * 0.05 + (rnd(id, 5) - 0.5) * 0.2);
  stroke2(() => { ctx.moveTo(0, 0); ctx.lineTo(0, -h); }, WHEAT2, 4, 8);
  if (eaten < 1) for (let i = 0; i < 5; i++) {
    cut(() => ctx.ellipse(i % 2 ? 7 : -7, -h + i * 13, 7, 12, i % 2 ? 0.5 : -0.5, 0, 7), WHEAT, { lw: 2.5, shadow: false });
  }
  ctx.restore();
}
function graphPaper(col = CREAM) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(90,120,130,0.16)"; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
}

// ---------- map ----------
const AUS = window.AUS;
const K = 24, C0 = [133, -26.5], COSL = Math.cos(27 * Math.PI / 180);
const proj = (lon, lat) => [(lon - C0[0]) * K * COSL, -(lat - C0[1]) * K];
const CAMPION = [118.5, -31.2];

// ---------- scenes (each draws a full frame) ----------
function sceneHook(t) {
  outback();
  for (let i = 0; i < 9; i++) wheat(40 + i * 120 + rnd(i, 1) * 40, GY + 250 + rnd(i, 2) * 40, 120, i);
  const lost = S("lost");
  const flag = prog(t, lost - 0.05, lost + 0.3);
  const lean = eio(prog(t, lost + 0.1, lost + 0.7)) * 0.3;
  soldier({ x: 300, y: GY + 60, s: 1.25, flag, id: 3 });
  emu({ x: 760, y: GY + 60, s: 2.35, dir: -1, peck: lean, lookX: 0, id: 4 });
  stamp("1932", 330, 560, (t - WT("hook", "nineteen")) , { size: 130, rot: -0.14 });
  if (t > lost + 0.2) {
    ctx.save(); ctx.globalAlpha = prog(t, lost + 0.2, lost + 0.4);
    label("SCORE: EMUS 1 — AUSTRALIA 0", 540, 330, { size: 34, rot: 0.02 });
    ctx.restore();
  }
}

function sceneVets(t) {
  outback({ scroll: (t - S("vets")) * 60 });
  const t0 = S("vets");
  const deed = WT("vets", "veterans");
  for (let i = 0; i < 3; i++) {
    const walk = eout(prog(t, t0 - 0.2 + i * 0.12, t0 + 1.3 + i * 0.12));
    const x = lerp(-150, 250 + i * 250, walk);
    const moving = walk < 1;
    soldier({ x, y: GY + 80 + (i % 2) * 30, s: 1.0, walk: moving ? t * 9 + i : null, id: 30 + i });
    // land deed drops above each vet
    const k = prog(t, deed - 0.1 + i * 0.12, deed + 0.25 + i * 0.12);
    if (k > 0) {
      ctx.save(); ctx.translate(x, lerp(300, GY - 260, back(k))); ctx.rotate((rnd(i, 9) - 0.5) * 0.3);
      cut(() => ctx.rect(-70, -50, 140, 100), CARD, { lw: 4 });
      text("LAND", 0, 8, { font: "Elite", size: 36 });
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-45, 28); ctx.lineTo(45, 28); ctx.stroke();
      ctx.restore();
    }
  }
  label("AFTER WWI · 1918", 540, 330, { size: 38 });
}

function mapCam(t) {
  const z0 = WT("vets", "farmland") - 0.1;
  const k = eio(prog(t, z0 + 0.1, z0 + 1.5));
  const c = proj(...CAMPION);
  const cx = lerp(0, c[0] - 20, k), cy = lerp(-40, c[1] + 30, k), z = lerp(1.0, 2.8, k);
  return { cx, cy, z, k };
}
function toScreen(p, cam) { return [W / 2 + (p[0] - cam.cx) * cam.z, 760 + (p[1] - cam.cy) * cam.z]; }
const FIELDS = (() => {
  const f = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if ((r === 0 && c === 3) || (r === 3 && c === 0)) continue;
    f.push({ dx: 40 + (c - 1.5) * 74 + (rnd(r, c, 1) - 0.5) * 10, dy: (r - 1.5) * 68 + (rnd(r, c, 2) - 0.5) * 10, w: 62 + rnd(r, c, 3) * 10, h: 56 + rnd(r, c, 4) * 8, i: r * 4 + c });
  }
  return f;
})();
const MAP_EMUS = Array.from({ length: 64 }, (_, i) => {
  const fld = FIELDS[i % FIELDS.length];
  const ang = -0.9 + rnd(i, 61) * 1.9; // mostly from the east (interior)
  return { i, fld, ang, delay: rnd(i, 62) * 2.2, dist: 700 + rnd(i, 63) * 300, ox: (rnd(i, 64) - 0.5) * 50, oy: (rnd(i, 65) - 0.5) * 40 };
});
function sceneMap(t) {
  const cam = mapCam(t);
  ctx.fillStyle = OCEAN; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = OCEAN2; ctx.lineWidth = 4;
  for (let i = 0; i < 26; i++) {
    const y = 60 + i * 72, off = (i % 2) * 40;
    ctx.beginPath();
    for (let x = -40 + off; x < W; x += 80) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 10, x + 40, y); }
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(W / 2, 760); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);
  const land = () => { for (const poly of AUS) { poly.forEach(([lo, la], j) => { const p = proj(lo, la); j ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.closePath(); } };
  cut(land, LAND, { lw: 4 / cam.z, sx: 8, sy: 10, sb: 8 });
  // Western Australia (everything west of 129°E)
  const wa = eio(prog(t, CAP("IN WESTERN AUSTRALIA.") - 0.3, CAP("IN WESTERN AUSTRALIA.") + 0.3)) * (1 - 0.35 * prog(t, S("emus"), S("emus") + 0.5));
  const x129 = proj(129, 0)[0];
  if (wa > 0) {
    ctx.save(); ctx.beginPath(); land(); ctx.clip();
    ctx.globalAlpha = wa; ctx.fillStyle = WA; ctx.fillRect(-2000, -2000, x129 + 2000, 4000);
    ctx.restore();
    ctx.save(); ctx.beginPath(); land(); ctx.clip();
    ctx.setLineDash([12 / cam.z, 10 / cam.z]); ctx.strokeStyle = INK; ctx.lineWidth = 3 / cam.z; ctx.globalAlpha = wa;
    ctx.beginPath(); ctx.moveTo(x129, -2000); ctx.lineTo(x129, 2000); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  if (cam.k < 0.4) {
    ctx.save(); ctx.globalAlpha = 1 - cam.k / 0.4;
    label("AUSTRALIA", 560, 740, { size: 44 }); ctx.restore();
  }
  const c = toScreen(proj(...CAMPION), cam);
  if (wa > 0 && t < S("emus")) { ctx.save(); ctx.globalAlpha = wa; label("WESTERN AUSTRALIA", 540, 330, { size: 44 }); ctx.restore(); }
  // wheat fields around Campion
  const f0 = CAP("IN WESTERN AUSTRALIA.") + 0.2;
  const eat0 = CAP("AND STARTED EATING");
  for (const f of FIELDS) {
    const k = back(prog(t, f0 + f.i * 0.035, f0 + 0.3 + f.i * 0.035));
    if (k <= 0) continue;
    const eaten = clamp((t - eat0 - (rnd(f.i, 71) * 1.2)) / 1.4);
    ctx.save(); ctx.translate(c[0] + f.dx, c[1] + f.dy); ctx.scale(k, k); ctx.rotate((rnd(f.i, 72) - 0.5) * 0.06);
    const col = eaten > 0 ? `rgb(${lerp(227, 185, eaten)},${lerp(185, 137, eaten)},${lerp(75, 90, eaten)})` : WHEAT;
    cut(() => ctx.rect(-f.w / 2, -f.h / 2, f.w, f.h), col, { lw: 4, sx: 4, sy: 5 });
    ctx.strokeStyle = "rgba(43,35,32,0.28)"; ctx.lineWidth = 3;
    for (let j = 1; j < 5; j++) { ctx.beginPath(); ctx.moveTo(-f.w / 2 + 6, -f.h / 2 + j * f.h / 5); ctx.lineTo(f.w / 2 - 6, -f.h / 2 + j * f.h / 5); ctx.stroke(); }
    ctx.restore();
  }
  if (wa > 0) {
    ctx.save(); ctx.globalAlpha = wa;
    const pp = toScreen(proj(115.86, -31.95), cam);
    cut(() => ctx.arc(pp[0], pp[1], 9, 0, 7), INK, { lw: 0, sx: 2, sy: 3 });
    text("Perth", pp[0] - 16, pp[1] + 46, { font: "Elite", size: 30, align: "center" });
    if (t < S("emus") + 0.4) label("CAMPION", c[0] + 40, c[1] - 175, { size: 30 });
    ctx.restore();
  }
  // vet hats on fields
  for (const f of FIELDS) {
    if (f.i % 3 !== 0) continue;
    const k = back(prog(t, f0 + 0.5 + f.i * 0.03, f0 + 0.8 + f.i * 0.03));
    if (k <= 0) continue;
    ctx.save(); ctx.translate(c[0] + f.dx, c[1] + f.dy + 10); ctx.scale(0.62 * k, 0.62 * k);
    cut(() => { ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-18, -30, 2, -32); ctx.quadraticCurveTo(24, -30, 26, 0); ctx.closePath(); }, HAT, { lw: 4 });
    cut(() => { ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-40, -28, -34, -38); ctx.lineTo(-20, 0); ctx.lineTo(56, 0); ctx.quadraticCurveTo(60, 8, 52, 10); ctx.lineTo(-24, 8); ctx.closePath(); }, HAT, { lw: 4 });
    ctx.restore();
  }
  // emus invade
  const e0 = S("emus");
  const list = MAP_EMUS.map(m => {
    const k = prog(t, e0 + m.delay - 0.3, e0 + m.delay + 1.3);
    const tx = c[0] + m.fld.dx + m.ox, ty = c[1] + m.fld.dy + m.oy;
    const sx = tx + Math.cos(m.ang) * m.dist, sy = ty + Math.sin(m.ang) * m.dist * 0.8 - 80;
    return { m, k, x: lerp(sx, tx, k), y: lerp(sy, ty, k) };
  }).filter(e => e.k > 0).sort((a, b) => a.y - b.y);
  for (const e of list) {
    const arrived = e.k >= 1;
    emu({ x: e.x, y: e.y + 22, s: 0.15, dir: -1, gait: arrived ? 0 : 2, ph: t * 16 + e.m.i, peck: arrived ? 0.5 + 0.5 * Math.sin(t * 8 + e.m.i) : 0, id: 100 + e.m.i });
  }
  // counter
  const ck = prog(t, CAP("THEN 20,000 EMUS"), CAP("THEN 20,000 EMUS") + 0.9);
  if (ck > 0) {
    ctx.save(); ctx.translate(540, 330); const s = back(clamp(ck * 3)); ctx.scale(s, s);
    cut(() => ctx.rect(-300, -85, 600, 170), CARD, { lw: 5 });
    text(fmt(20000 * eout(ck)), 0, 30, { size: 120, color: INK });
    text("EMUS", 0, 72, { font: "Elite", size: 34 });
    ctx.restore();
  }
}

const TELE = ["CAMPION W.A.", "EMUS EATING ALL", "THE WHEAT STOP", "SEND THE ARMY STOP"];
function sceneTelegram(t) {
  ctx.fillStyle = "#6a503c"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(40,25,15,0.25)"; ctx.lineWidth = 5;
  for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(0, i * 70 + 20); ctx.bezierCurveTo(300, i * 70 + 50 * rnd(i, 1), 700, i * 70 - 40 * rnd(i, 2), W, i * 70 + 10); ctx.stroke(); }
  const t0 = S("call"), t1 = E("call") - 0.1;
  ctx.save(); ctx.translate(540, 760 + (1 - eout(prog(t, t0 - 0.2, t0 + 0.2))) * 900); ctx.rotate(-0.04); boil(50, 0.6);
  cut(() => ctx.rect(-400, -390, 800, 780), "#f1e2bf", { lw: 5, sx: 10, sy: 14, sb: 12 });
  ctx.fillStyle = RED; ctx.fillRect(-400, -390, 800, 16);
  text("TELEGRAM", 0, -300, { font: "Elite", size: 64, ls: 10 });
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-340, -265); ctx.lineTo(340, -265); ctx.stroke();
  const total = TELE.join("").length;
  let shown = Math.floor(total * prog(t, t0 + 0.05, t1));
  TELE.forEach((ln, i) => {
    const s = ln.slice(0, Math.max(0, shown)); shown -= ln.length;
    text(s, -330, -170 + i * 110, { font: "Elite", size: i === 0 ? 40 : 54, align: "left", color: "#2b2320" });
  });
  ctx.restore();
  stamp("URGENT", 700, 1090, t - (E("call") - 0.15), { size: 90, rot: -0.2 });
}

function card(cx, cy, w, h, k, draw) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); const s = back(k); ctx.scale(s, s); ctx.rotate((1 - k) * 0.2);
  cut(() => ctx.rect(-w / 2, -h / 2, w, h), CARD, { lw: 5, sx: 8, sy: 10, sb: 8 });
  draw();
  ctx.restore();
}
function sceneInventory(t) {
  graphPaper();
  label("THE ARMY SENDS:", 540, 300, { size: 48 });
  const pk = cap => prog(t, CAP(cap) - 0.05, CAP(cap) + 0.3);
  card(290, 610, 440, 460, pk("ONE MAJOR,"), () => {
    soldier({ x: 0, y: 150, s: 1.05, major: true, id: 60 });
    text("×1", 150, -150, { size: 80 });
  });
  card(790, 610, 440, 460, pk("TWO SOLDIERS,"), () => {
    soldier({ x: -70, y: 150, s: 0.95, id: 61 }); soldier({ x: 70, y: 150, s: 0.95, id: 62 });
    text("×2", 160, -150, { size: 80 });
  });
  card(290, 1090, 440, 400, pk("TWO MACHINE GUNS,"), () => {
    gun({ x: 0, y: -20, s: 1.05, id: 63 }); gun({ x: 10, y: 130, s: 1.05, id: 64 });
    text("×2", 150, -140, { size: 80 });
  });
  const bk = pk("AND 10,000 BULLETS.");
  card(790, 1090, 440, 400, bk, () => {
    const n = Math.floor(21 * clamp(prog(t, CAP("AND 10,000 BULLETS."), CAP("AND 10,000 BULLETS.") + 0.8)));
    let i = 0;
    for (let r = 0; r < 6 && i < n; r++) for (let c = 0; c <= r && i < n; c++, i++) {
      bullet(-10 + (c - r / 2) * 34, -150 + r * 40, 0.8);
    }
    text("×" + fmt(10000 * eout(prog(t, CAP("AND 10,000 BULLETS."), CAP("AND 10,000 BULLETS.") + 0.8))), 0, 160, { size: 64 });
  });
}

const FLOCK = Array.from({ length: 36 }, (_, i) => {
  const grp = i % 6, a = -2.3 + grp * (1.46 / 5);
  return { i, grp, a, x0: 540 + (rnd(i, 81) - 0.5) * 300, y0: 880 + (rnd(i, 82) - 0.5) * 180, jx: (rnd(i, 84) - 0.5) * 110, jy: (rnd(i, 85) - 0.5) * 80 };
});
function sceneScatter(t) {
  ctx.fillStyle = GROUND; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const x = rnd(i, 91) * W, y = rnd(i, 92) * H, r = 14 + rnd(i, 93) * 22;
    cut(() => ctx.ellipse(x, y, r * 1.3, r, 0, 0, 7), i % 2 ? SCRUB : SCRUB2, { lw: 3, sx: 3, sy: 4 });
  }
  const gx = 540, gy = 1180, R = 520;
  ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 6; ctx.strokeStyle = RED;
  ctx.beginPath(); ctx.arc(gx, gy, R, 0, 7); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(gx, gy, R, 0, 7); ctx.fill(); ctx.restore();
  label("GUN RANGE", gx + 250, gy - 400, { size: 34, rot: 0.08 });
  gun({ x: gx - 20, y: gy + 40, s: 0.8, id: 70 });
  soldier({ x: gx - 150, y: gy + 60, s: 0.75, id: 71 });
  const ks = CAP("THE EMUS SPLIT") + 0.25;
  const list = FLOCK.map(e => {
    const k = eio(prog(t, ks + e.grp * 0.1, ks + 1.5 + e.grp * 0.08));
    const tx = gx + Math.cos(e.a) * 720 + e.jx, ty = gy + Math.sin(e.a) * 720 + e.jy;
    return { e, k, x: lerp(e.x0, tx, k), y: lerp(e.y0, ty, k) };
  }).sort((a, b) => a.y - b.y);
  for (const o of list) {
    const moving = o.k > 0 && o.k < 1;
    emu({ x: o.x, y: o.y, s: 0.3, dir: Math.cos(o.e.a) >= 0 ? 1 : -1, gait: moving ? 2 : 0, ph: t * 18 + o.e.i, id: 200 + o.e.i });
  }
  if (t > CAP("AND RAN OUT OF RANGE.") + 0.3) text("?", gx - 150, gy - 260, { size: 110, stroke: 10, color: CARD });
}

const HORDE = Array.from({ length: 30 }, (_, i) => {
  const row = i % 3;
  return { i, row, x: 470 + rnd(i, 101) * 620 + row * 20, s: [0.42, 0.56, 0.74][row], y: [GY - 20, GY + 60, GY + 170][row] };
});
function sceneAmbush(t) {
  const t0 = S("ambush"), fire0 = WT("ambush", "ambush") + 0.15, jam = WT("jam", "jammed");
  const z = 1 + 0.06 * eio(prog(t, t0, jam));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  if (t > jam && t < jam + 0.25) ctx.translate((rnd(Math.floor(t * 48), 5) - 0.5) * 18, (rnd(Math.floor(t * 48), 6) - 0.5) * 12);
  outback();
  const walkK = prog(t, t0 - 0.2, jam);
  const byRow = [...HORDE].sort((a, b) => a.row - b.row);
  for (const e of byRow) {
    const x = e.x + (1 - eout(walkK)) * 520;
    const walking = t < jam;
    const turned = t > jam + 0.5;
    emu({ x, y: e.y, s: e.s, dir: -1, gait: walking ? 1 : 0, ph: t * 9 + e.i, lookX: turned ? -1 : 0, id: 300 + e.i });
  }
  // sandbags + gun nest
  const firing = t > fire0 && t < jam;
  const shot = firing && Math.floor(t * 12) % 2 === 0;
  soldier({ x: 150, y: GY + 150, s: 1.0, id: 80 });
  gun({ x: 250, y: GY + 20, s: 1.0, recoil: shot ? 1 : 0, id: 81 });
  for (let i = 0; i < 7; i++) {
    const bx = 60 + (i % 4) * 95 + (i >= 4 ? 45 : 0), by = GY + 170 - (i >= 4 ? 55 : 0);
    cut(() => ctx.ellipse(bx, by, 55, 30, 0, 0, 7), "#c9b27f", { lw: 4 });
  }
  if (shot) {
    cut(() => { const x = 420, y = GY - 60; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, r = i % 2 ? 22 : 55; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7) : ctx.moveTo(x + r, y); } ctx.closePath(); }, "#ffd35c", { lw: 3, shadow: false });
  }
  if (t > jam) {
    const k = prog(t, jam, jam + 1.4);
    puff(300, GY - 150 - k * 120, 40 + k * 50, 1 - k);
    puff(380, GY - 120 - k * 90, 30 + k * 40, 1 - k);
  }
  ctx.restore();
  stamp("JAMMED", 540, 560, t - jam, { size: 130, rot: -0.1 });
  if (t < fire0) {
    const k = prog(t, CAP("WHEN 1,000 OF THEM"), CAP("WHEN 1,000 OF THEM") + 0.3);
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; label("≈1,000 EMUS", 760, 420, { size: 44, rot: 0.03 }); ctx.restore(); }
  }
}

function sceneTruck(t) {
  const t0 = S("truck"), f0 = S("faster");
  const slow = eio(prog(t, f0 + 0.3, E("faster")));
  const spd = lerp(900, 380, slow);
  // integrate scroll analytically: before slow-down constant speed, then eased
  const scroll = (t - t0) * 900 - Math.max(0, t - (f0 + 0.3)) * 520 * slow;
  outback({ scroll });
  const tx = lerp(-300, 330, eout(prog(t, t0 - 0.15, t0 + 0.7))) - slow * 80;
  const bounce = Math.abs(Math.sin(t * 13)) * 12 + Math.abs(Math.sin(t * 7.3)) * 6;
  truck({
    x: tx, y: GY + 140, s: 1.0, bounce, spin: -scroll / 40, id: 90, cargo: () => {
      soldier({ x: -150, y: -110, s: 0.8, id: 91 });
      ctx.save(); ctx.translate(-60, -120); ctx.rotate(-0.05 + Math.sin(t * 13) * 0.08); gun({ x: 0, y: 0, s: 0.75, id: 92 }); ctx.restore();
    }
  });
  const ex = lerp(760, 1400, eio(prog(t, f0, E("faster") + 0.2)));
  emu({ x: ex, y: GY + 130, s: 0.95, dir: 1, gait: 2, ph: t * (20 + slow * 8), id: 93 });
  // dust
  for (let i = 0; i < 6; i++) {
    const age = ((t * 3 + i / 6) % 1);
    puff(tx - 230 - age * 260, GY + 110 - age * 60, 20 + age * 40, (1 - age) * 0.8, "#e4c79a");
  }
  if (slow > 0) for (let i = 0; i < 3; i++) { const age = ((t * 2 + i / 3) % 1); puff(tx - 245 - age * 60, GY - 20 - age * 140, 14 + age * 30, (1 - age) * slow, "#5a524a"); }
  const lk = prog(t, WT("faster", "faster"), WT("faster", "faster") + 0.25);
  if (lk > 0) {
    ctx.save(); ctx.globalAlpha = lk;
    label("EMU: UP TO 50 KM/H", 620, 560, { size: 40, rot: -0.03 });
    ctx.restore();
  }
}

function sceneTally(t) {
  graphPaper();
  label("BY DECEMBER 1932", 540, 300, { size: 44 });
  const kb = eout(prog(t, CAP("NEARLY 10,000 BULLETS,"), CAP("NEARLY 10,000 BULLETS,") + 1.0));
  const ke = eout(prog(t, CAP("FOR 986 EMUS."), CAP("FOR 986 EMUS.") + 0.9));
  const x0 = 110, full = 860;
  // bullets bar
  text("BULLETS FIRED", x0, 470, { font: "Elite", size: 44, align: "left" });
  cut(() => ctx.rect(x0, 510, Math.max(4, full * kb), 170), BRASS, { lw: 5 });
  for (let i = 0; i < Math.floor(18 * kb); i++) bullet(x0 + 30 + i * 46, 630, 0.8);
  text(fmt(9860 * kb), x0, 800, { size: 110, align: "left" });
  // emus bar (to scale)
  if (ke > 0 || t > CAP("FOR 986 EMUS.") - 0.1) {
    text("EMUS", x0, 920, { font: "Elite", size: 44, align: "left" });
    cut(() => ctx.rect(x0, 960, Math.max(4, full * 0.1 * ke), 170), EMU_BODY, { lw: 5 });
    text(fmt(986 * ke), x0, 1250, { size: 110, align: "left" });
    if (ke > 0.6) emu({ x: x0 + 200, y: 1130, s: 0.5, dir: 1, id: 95, lookX: -1 });
    ctx.save(); ctx.globalAlpha = prog(t, CAP("FOR 986 EMUS.") + 0.9, CAP("FOR 986 EMUS.") + 1.2);
    label("(the major's own count)", 700, 1215, { size: 30, rot: -0.03 });
    ctx.restore();
  }
}

function sceneRatio(t) {
  graphPaper();
  const t0 = S("perbird");
  for (let i = 0; i < 10; i++) {
    const k = back(prog(t, t0 - 0.05 + i * 0.05, t0 + 0.2 + i * 0.05));
    if (k <= 0) continue;
    const a = -0.9 + i * 0.2, r = 380;
    ctx.save(); ctx.translate(540 + Math.sin(a) * r, 900 - Math.cos(a) * r * 0.9); ctx.scale(k * 1.5, k * 1.5); ctx.rotate(a + Math.PI);
    bullet(0, 0, 1);
    ctx.restore();
  }
  emu({ x: 540, y: 1150, s: 1.2, dir: 1, lookX: 0.5, peck: 0, id: 96 });
  const k = back(prog(t, CAP("PER BIRD."), CAP("PER BIRD.") + 0.25));
  if (k > 0) { ctx.save(); ctx.translate(540, 330); ctx.scale(k, k); text("10 : 1", 0, 50, { size: 170, stroke: 14, color: CARD, shadow: true }); ctx.restore(); }
}

function sceneReview(t) {
  graphPaper("#efe4cc");
  ctx.save(); ctx.translate(500, 800); ctx.rotate(-0.03); boil(97, 0.7);
  cut(() => ctx.roundRect(-380, -480, 760, 960, 20), "#8b6a47", { lw: 5, sx: 10, sy: 14, sb: 10 });
  cut(() => ctx.rect(-340, -420, 680, 870), CARD, { lw: 4, shadow: false });
  cut(() => ctx.roundRect(-110, -510, 220, 70, 14), STEEL2, { lw: 4 });
  text("PERFORMANCE", 0, -320, { font: "Elite", size: 58 });
  text("REVIEW", 0, -250, { font: "Elite", size: 58 });
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-290, -215); ctx.lineTo(290, -215); ctx.stroke();
  text("SUBJECT:  THE EMU", -290, -130, { font: "Elite", size: 42, align: "left" });
  text("RATING:", -290, -40, { font: "Elite", size: 42, align: "left" });
  const s0 = CAP("OF THE ENEMY?") - 0.1;
  for (let i = 0; i < 5; i++) {
    const k = back(prog(t, s0 + i * 0.12, s0 + 0.25 + i * 0.12));
    if (k <= 0) continue;
    ctx.save(); ctx.translate(-230 + i * 115, 70); ctx.scale(k, k); star(0, 0, 48, WHEAT); ctx.restore();
  }
  emu({ x: 0, y: 400, s: 0.75, dir: 1, id: 98 });
  ctx.restore();
  // the major peeks in
  const pk = eout(prog(t, S("review") - 0.1, S("review") + 0.5));
  soldier({ x: lerp(1250, 960, pk), y: 1560, s: 1.8, major: true, dir: -1, id: 99 });
}

const QUOTE = [["They", "can", "face"], ["machine", "guns,"], ["with", "the"], ["invulnerability"], ["of", "tanks."]];
function sceneQuote(t) {
  ctx.fillStyle = "#2c2622"; ctx.fillRect(0, 0, W, H);
  const words = LN("quote").words;
  text("“", 150, 420, { font: "Serif", size: 300, color: WHEAT, align: "left" });
  let wi = 0;
  QUOTE.forEach((row, r) => {
    ctx.save(); ctx.font = "92px Serif";
    const widths = row.map(w => ctx.measureText(w + " ").width);
    let x = 150;
    row.forEach((w, j) => {
      const k = prog(t, words[wi].t - 0.06, words[wi].t + 0.12);
      if (k > 0) {
        ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 18);
        text(w, x, 560 + r * 118, { font: "Serif", size: 92, color: w === "tanks." ? WHEAT : CREAM, align: "left" });
        ctx.restore();
      }
      x += widths[j]; wi++;
    });
    ctx.restore();
  });
  const ak = prog(t, S("quote") + 0.3, S("quote") + 0.7);
  ctx.save(); ctx.globalAlpha = ak;
  text("— MAJOR G.P.W. MEREDITH, 1932", 150, 1210, { font: "Elite", size: 38, color: WHEAT, align: "left" });
  ctx.restore();
  // emu tank
  const tk = eout(prog(t, WT("quote", "tanks") - 0.45, WT("quote", "tanks") + 0.25));
  if (tk > 0) {
    const x = lerp(1400, 560, tk), y = 1560;
    ctx.save(); ctx.translate(x, y);
    cut(() => ctx.roundRect(-230, -40, 460, 80, 40), "#3a3934", { lw: 5, sc: "rgba(0,0,0,0.5)" });
    for (let i = 0; i < 6; i++) cut(() => ctx.arc(-180 + i * 72, 0, 24, 0, 7), STEEL2, { lw: 4, shadow: false });
    ctx.restore();
    emu({ x: x - 10, y: y - 30, s: 0.95, dir: -1, id: 110, lookX: -1 });
  }
}

function sceneHome(t) {
  outback();
  const t0 = S("home"), d0 = S("didnot");
  for (let i = 0; i < 9; i++) wheat(40 + i * 120 + rnd(i, 1) * 40, GY + 250 + rnd(i, 2) * 40, 120, i);
  const k = eio(prog(t, t0 - 0.1, E("home") + 0.6));
  const tx = lerp(430, -420, k);
  // emus stay (behind truck)
  emu({ x: 690, y: GY + 60, s: 0.8, dir: -1, peck: 0.5 + 0.5 * Math.sin(t * 7), id: 121 });
  emu({ x: 980, y: GY + 90, s: 0.9, dir: -1, peck: 0.5 + 0.5 * Math.sin(t * 6 + 2), id: 122 });
  const stare = t > WT("didnot", "not") - 0.05;
  emu({ x: 800, y: GY + 250, s: 1.55, dir: -1, stare, lookX: stare ? 0 : -1, id: 123 });
  truck({
    x: tx, y: GY + 140, s: 1.0, dir: -1, bounce: Math.abs(Math.sin(t * 11)) * 8, spin: t * 8, id: 124, cargo: () => {
      soldier({ x: -170, y: -110, s: 0.8, id: 125, flag: 1 });
      soldier({ x: -40, y: -110, s: 0.8, id: 126 });
    }
  });
  for (let i = 0; i < 5; i++) { const age = ((t * 3 + i / 5) % 1); puff(tx + 240 + age * 200, GY + 110 - age * 60, 20 + age * 40, (1 - age) * 0.8 * (k < 1 ? 1 : 0), "#e4c79a"); }
  if (t > d0 + 1.2) {
    ctx.save(); ctx.globalAlpha = prog(t, d0 + 1.2, d0 + 1.5);
    label("THE GREAT EMU WAR · NOV–DEC 1932", 540, 330, { size: 34 });
    ctx.restore();
  }
}

// ---------- scene list + transitions ----------
function SC() {
  return [
    ["hook", 0, sceneHook],
    ["vets", S("vets") - 0.2, sceneVets],
    ["map", CAP("FARMLAND") - 0.15, sceneMap],
    ["telegram", S("call") - 0.2, sceneTelegram],
    ["inventory", S("sent") - 0.15, sceneInventory],
    ["scatter", S("scatter") - 0.15, sceneScatter],
    ["ambush", S("ambush") - 0.15, sceneAmbush],
    ["truck", S("truck") - 0.2, sceneTruck],
    ["tally", S("tally") - 0.2, sceneTally],
    ["ratio", S("perbird") - 0.12, sceneRatio],
    ["review", S("review") - 0.2, sceneReview],
    ["quote", S("quote") - 0.2, sceneQuote],
    ["home", S("home") - 0.25, sceneHome],
  ];
}
const TR = 0.3;
function tornEdge(x) { // jagged vertical edge path
  ctx.moveTo(x, -10);
  for (let y = 0; y <= H + 40; y += 40) ctx.lineTo(x + (rnd(y, 17) - 0.5) * 30, y);
  ctx.lineTo(W + 100, H + 40); ctx.lineTo(W + 100, -10); ctx.closePath();
}

// ---------- paper texture + grain (built once, deterministic) ----------
let PAPER = null, GRAIN = [];
function buildTextures() {
  PAPER = document.createElement("canvas"); PAPER.width = W; PAPER.height = H;
  const p = PAPER.getContext("2d"), img = p.createImageData(W, H), d = img.data;
  const vn = (x, y, sc, seed) => {
    const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = rnd(x0, y0, seed), b = rnd(x0 + 1, y0, seed), c = rnd(x0, y0 + 1, seed), e = rnd(x0 + 1, y0 + 1, seed);
    return lerp(lerp(a, b, sx), lerp(c, e, sx), sy);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = 1 - 0.07 * vn(x, y, 140, 1) - 0.05 * vn(x, y, 22, 2) - 0.035 * rnd(x, y, 3);
    const i = (y * W + x) * 4; d[i] = 255 * v; d[i + 1] = 252 * v; d[i + 2] = 244 * v; d[i + 3] = 255;
  }
  p.putImageData(img, 0, 0);
  p.lineCap = "round";
  for (let i = 0; i < 1400; i++) {
    const x = rnd(i, 1, 9) * W, y = rnd(i, 2, 9) * H, a = rnd(i, 3, 9) * 6.28, l = 6 + rnd(i, 4, 9) * 22;
    p.strokeStyle = `rgba(120,95,70,${0.05 + rnd(i, 5, 9) * 0.07})`; p.lineWidth = 1 + rnd(i, 6, 9);
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  const g = p.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(60,35,15,0.30)");
  p.fillStyle = g; p.fillRect(0, 0, W, H);
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const gc = c.getContext("2d"), gi = gc.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = rnd(i, k, 77) * 255; gi.data[i * 4] = gi.data[i * 4 + 1] = gi.data[i * 4 + 2] = v; gi.data[i * 4 + 3] = 255; }
    gc.putImageData(gi, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
}

// ---------- captions ----------
function captions(t) {
  const c = TL.caps.find(c => t >= c.start - 0.03 && t < c.end + 0.02);
  if (!c) return;
  const k = prog(t, c.start - 0.03, c.start + 0.12);
  const s = lerp(0.8, 1, back(k));
  ctx.save(); ctx.translate(490, 1440); ctx.scale(s, s); ctx.rotate((rnd(c.start * 100 | 0, 3) - 0.5) * 0.03);
  ctx.font = "98px Anton"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
  // wrap to max width
  const words = c.text.split(" "), lines = [];
  let cur = "";
  for (const w of words) { const test = cur ? cur + " " + w : w; if (ctx.measureText(test).width > 800 && cur) { lines.push(cur); cur = w; } else cur = test; }
  lines.push(cur);
  lines.forEach((ln, i) => {
    const y = (i - (lines.length - 1) / 2) * 108;
    // per-word colour: numbers highlighted
    const parts = ln.split(" "), total = ctx.measureText(ln).width, sp = ctx.measureText(" ").width;
    let x = -total / 2;
    for (const p of parts) {
      const w = ctx.measureText(p).width;
      ctx.lineWidth = 16; ctx.strokeStyle = INK;
      ctx.shadowColor = "rgba(20,10,5,0.45)"; ctx.shadowOffsetY = 6; ctx.shadowBlur = 6;
      ctx.strokeText(p, x + w / 2, y);
      ctx.shadowColor = "transparent";
      ctx.fillStyle = /\d/.test(p) ? "#f6c64e" : "#fff8ea";
      ctx.fillText(p, x + w / 2, y);
      x += w + sp;
    }
  });
  ctx.restore();
}

function titleTag(t) {
  const k = eout(prog(t, 0.2, 0.6));
  if (k <= 0) return;
  ctx.save(); ctx.translate(lerp(-400, 0, k), 0);
  ctx.save(); ctx.translate(60, 150); ctx.rotate(-0.02);
  ctx.font = "30px Elite"; const w = ctx.measureText("THE GREAT EMU WAR").width + 40;
  cut(() => ctx.rect(0, -26, w, 52), INK, { lw: 0, sx: 3, sy: 4 });
  ctx.fillStyle = CREAM; ctx.textBaseline = "middle"; ctx.fillText("THE GREAT EMU WAR", 20, 2);
  ctx.restore(); ctx.restore();
}

// ---------- main ----------
function render(t) {
  T = t;
  if (!PAPER) buildTextures();
  const sc = SC();
  let i = 0; while (i + 1 < sc.length && t >= sc[i + 1][1]) i++;
  ctx.save();
  const k = i > 0 ? prog(t, sc[i][1], sc[i][1] + TR) : 1;
  if (k < 1) {
    // previous scene underneath, sliding left slightly
    ctx.save(); ctx.translate(-eio(k) * 160, 0); sc[i - 1][2](t); ctx.restore();
    ctx.save();
    const edge = lerp(W + 40, -60, eio(k));
    ctx.beginPath(); tornEdge(edge); ctx.clip();
    sc[i][2](t);
    ctx.restore();
    ctx.save(); ctx.beginPath(); tornEdge(edge);
    ctx.shadowColor = "rgba(30,15,5,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = -8;
    ctx.strokeStyle = "#fbf5e8"; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  } else {
    sc[i][2](t);
  }
  ctx.restore();
  // paper texture over everything
  ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(PAPER, 0, 0); ctx.restore();
  titleTag(t);
  captions(t);
  // film grain, on twos
  const f = Math.floor(t * 12);
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.09;
  ctx.translate(-rnd(f, 1) * 256, -rnd(f, 2) * 256);
  ctx.fillStyle = GRAIN[f % GRAIN.length]; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}

// ---------- sound cues (read by tools/audio.py via the render driver) ----------
function sfxCues() {
  const cues = [];
  const add = (t, type, o = {}) => cues.push({ t: +t.toFixed(3), type, ...o });
  SC().slice(1).forEach(s => add(s[1], "whoosh"));
  add(WT("hook", "nineteen"), "stamp");
  add(S("lost") + 0.05, "trombone");
  add(WT("vets", "veterans"), "pop"); add(WT("vets", "veterans") + 0.12, "pop"); add(WT("vets", "veterans") + 0.24, "pop");
  const f0 = CAP("IN WESTERN AUSTRALIA.") + 0.2;
  for (let i = 0; i < 6; i++) add(f0 + i * 0.09, "pop", { pitch: 1 + i * 0.08 });
  for (let i = 0; i < 10; i++) add(S("emus") + 0.1 + i * 0.28, "boom");
  add(CAP("THEN 20,000 EMUS"), "tick");
  const total = TELE.join("").length, t0 = S("call") + 0.05, t1 = E("call") - 0.1;
  for (let i = 0; i < total; i += 1) add(t0 + (t1 - t0) * i / total, "type");
  add(E("call") - 0.15, "stamp");
  for (const c of ["ONE MAJOR,", "TWO SOLDIERS,", "TWO MACHINE GUNS,", "AND 10,000 BULLETS."]) add(CAP(c), "pop", { pitch: 1.1 });
  add(CAP("AND 10,000 BULLETS.") + 0.8, "ding");
  add(CAP("THE EMUS SPLIT") + 0.25, "scatter");
  const fire0 = WT("ambush", "ambush") + 0.15, jam = WT("jam", "jammed");
  for (let t = fire0; t < jam - 0.02; t += 1 / 12) add(t, "shot");
  add(jam, "clunk"); add(jam + 0.02, "stamp");
  add(S("truck") - 0.2, "engine", { dur: E("faster") - S("truck") + 0.5 });
  add(WT("faster", "faster"), "sputter");
  add(CAP("NEARLY 10,000 BULLETS,"), "roll", { dur: 1.0 });
  add(CAP("FOR 986 EMUS."), "roll", { dur: 0.9 });
  for (let i = 0; i < 10; i++) add(S("perbird") - 0.05 + i * 0.05, "tick");
  const s0 = CAP("OF THE ENEMY?") - 0.1;
  for (let i = 0; i < 5; i++) add(s0 + i * 0.12, "star", { pitch: 1 + i * 0.12 });
  add(WT("quote", "tanks") - 0.1, "clank");
  add(S("home") - 0.1, "engine", { dur: 1.8 });
  add(WT("didnot", "not"), "boing");
  return cues;
}

window.render = render;
window.sfxCues = sfxCues;
window.SCENES = () => SC().map(s => [s[0], s[1]]);
```

## 4.3 Create `shorts/emu-war/render/render.mjs`

This drives headless Chromium: it loads the page, injects the timeline and map, calls `render(t)`
for each frame and saves JPEGs. Rendering is resumable: existing frames are skipped.

```js
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
```

## 4.4 Optional: review contact sheet

```bash
cd shorts/emu-war/render && node render.mjs sheet 1.0,21.2,25.9,36.0,44.5 && ls ../build/sheet && cd ../../..
```
**Checkpoint:** five PNGs, `t001.00.png` … `t044.50.png`. If you can view images, check them:
- at 1.0 s, a soldier and a giant emu with a red "1932" stamp;
- at 21.2 s, emus scattering outside a red dashed circle;
- at 25.9 s, a red "JAMMED" stamp;
- at 36.0 s, a clipboard with five stars;
- at 44.5 s, an emu staring into the camera.

## 4.5 Render every frame

```bash
cd shorts/emu-war/render && node render.mjs full 4 && cd ../../..
```
**Checkpoint:** it ends with `rendered 1105 frames in …s`, and `ls shorts/emu-war/build/frames | wc -l`
prints `1105`. The run also writes `build/cues.json` and `build/scenes.json`.

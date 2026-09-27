// Paper-cutout engine (16:9). Every frame is a pure function of t: no Math.random, no clock.
"use strict";
const W = 1920, H = 1080, FPS = 24;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// ---------- palette ----------
const P = {
  ink: "#2b2320", cream: "#f3ead7", card: "#f8f1e2", paper2: "#e9dcc0", bg: "#efe4cc",
  navy: "#2f4858", teal: "#4f8a8b", teal2: "#9fc4c0", sea: "#a9c7c2", sea2: "#98b9b4",
  land: "#ecd9ae", red: "#c8452d", orange: "#e08a3c", yellow: "#f2c14e", green: "#6d9a5b",
  green2: "#4f7a45", grey: "#8d8a82", steel: "#4a4a45", steel2: "#6b6a62", steel3: "#9a988e",
  beige: "#d9c9a4", beige2: "#c4b18a", brown: "#7b5a3a", skin1: "#e6c09a", skin2: "#c68d62", skin3: "#8d5a3b",
  purple: "#7a5c8e", blue: "#4a78a8", pink: "#d9848a", glow: "#ffe39a",
};

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
const ein = k => k * k * k;
const back = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const fmt = n => Math.round(n).toLocaleString("en-US");
const pop = (t, t0, d = 0.35) => back(prog(t, t0, t0 + d));

// ---------- timeline ----------
const TL = window.TL;
const PARA = id => { const p = TL.paras.find(p => p.id === id); if (!p) throw new Error("no para " + id); return p; };
const PS = id => PARA(id).start;
const PE = id => PARA(id).end;
const nrm = w => w.toLowerCase().replace(/[^a-z0-9']/g, "");
// time of the nth occurrence of `word` (normalized) inside paragraph `id`
function WT(id, word, nth = 0) {
  const p = PARA(id); let k = 0;
  for (const w of p.words) if (nrm(w.w) === word) { if (k === nth) return w.t; k++; }
  throw new Error(`word "${word}"#${nth} not in ${id}`);
}
let T = 0;

// ---------- drawing primitives ----------
function boil(id, amt = 1) {
  const f = Math.floor(T * 12);
  ctx.translate((rnd(id, f, 1) - 0.5) * 2.2 * amt, (rnd(id, f, 2) - 0.5) * 2.2 * amt);
  ctx.rotate((rnd(id, f, 3) - 0.5) * 0.008 * amt);
}
function cut(path, fill, o = {}) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) {
    ctx.shadowColor = o.sc || "rgba(45,28,16,0.33)";
    ctx.shadowOffsetX = o.sx ?? 6; ctx.shadowOffsetY = o.sy ?? 8; ctx.shadowBlur = o.sb ?? 7;
  }
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
  if (o.lw !== 0) {
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.beginPath(); path();
    ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.ink || P.ink; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
    ctx.restore();
  }
}
const rect = (x, y, w, h, r = 0) => () => r ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
const circ = (x, y, r) => () => ctx.arc(x, y, r, 0, Math.PI * 2);
const ell = (x, y, rx, ry, a = 0) => () => ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2);
const poly = pts => () => { pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
function smooth(pts) {
  const n = pts.length;
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath();
}
function stroke2(path, color, w, inkW) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); path(); ctx.strokeStyle = P.ink; ctx.lineWidth = inkW ?? w + 7; ctx.stroke();
  ctx.beginPath(); path(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function line(x1, y1, x2, y2, col = P.ink, w = 4, dash) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function text(str, x, y, o = {}) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.font = `${o.size || 60}px ${o.font || "Anton"}`;
  ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "alphabetic";
  if (o.ls) ctx.letterSpacing = o.ls + "px";
  if (o.shadow) { ctx.shadowColor = "rgba(45,28,16,0.4)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.shadowBlur = 4; }
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || P.ink; ctx.strokeText(str, x, y); ctx.shadowColor = "transparent"; }
  ctx.fillStyle = o.color || P.ink; ctx.fillText(str, x, y);
  ctx.restore();
}
function tw(str, size, font = "Anton") { ctx.save(); ctx.font = `${size}px ${font}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }
// typewriter paper tag
function label(str, x, y, o = {}) {
  const k = o.k ?? 1; if (k <= 0) return;
  ctx.save();
  const size = o.size || 40;
  ctx.font = `${size}px ${o.font || "Elite"}`;
  const w = ctx.measureText(str).width + size * 0.9, h = size * 1.5;
  ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(back(k), back(k));
  const ax = o.align === "left" ? 0 : o.align === "right" ? -w : -w / 2;
  cut(rect(ax, -h / 2, w, h), o.bg || P.card, { lw: 3, sx: 4, sy: 5 });
  ctx.fillStyle = o.color || P.ink; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(str, ax + size * 0.45, 2);
  ctx.restore();
}
const STAMPS = {};
function stampImage(str, size, color) {
  const key = str + size + color;
  if (STAMPS[key]) return STAMPS[key];
  const c = document.createElement("canvas"), g = c.getContext("2d");
  g.font = `${size}px Anton`; g.letterSpacing = "6px";
  const w = g.measureText(str).width + 50, h = size * 1.15;
  c.width = Math.ceil(w + 20); c.height = Math.ceil(h + 20);
  g.translate(c.width / 2, c.height / 2); g.font = `${size}px Anton`; g.letterSpacing = "6px";
  g.strokeStyle = color; g.lineWidth = 10; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(str, 0, 6);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 110; i++) {
    g.globalAlpha = 0.5 + rnd(i, 10, str.length) * 0.5;
    g.beginPath(); g.arc((rnd(i, 7, str.length) - 0.5) * w, (rnd(i, 8, str.length) - 0.5) * h, 1.5 + rnd(i, 9) * 4, 0, 7); g.fill();
  }
  return (STAMPS[key] = c);
}
function stamp(str, x, y, since, o = {}) {
  if (since <= 0) return;
  const img = stampImage(str, o.size || 120, o.color || P.red);
  const s = 1 + 0.9 * (1 - eout(clamp(since * 5)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(s, s);
  ctx.globalAlpha = clamp(since * 8) * 0.92;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}
function star(cx, cy, r, fill) {
  cut(() => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); }, fill, { lw: 4 });
}
function puff(x, y, r, a, col = "#efe6d4") {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const pts = []; for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283; const rr = r * (i % 2 ? 0.8 : 1.05); pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.8]); }
  cut(() => smooth(pts), col, { lw: 3, sx: 3, sy: 4 });
  ctx.restore();
}
function arrow(x1, y1, x2, y2, k = 1, col = P.ink, w = 7) {
  if (k <= 0) return;
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1);
  stroke2(() => { ctx.moveTo(x1, y1); ctx.lineTo(x, y); }, col, w, w + 6);
  cut(poly([[x + Math.cos(a) * 22, y + Math.sin(a) * 22], [x + Math.cos(a + 2.4) * 22, y + Math.sin(a + 2.4) * 22], [x + Math.cos(a - 2.4) * 22, y + Math.sin(a - 2.4) * 22]]), col, { lw: 3, shadow: false });
}
function check(x, y, s = 1, col = P.green) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  stroke2(() => { ctx.moveTo(-26, 0); ctx.lineTo(-8, 20); ctx.lineTo(28, -24); }, col, 12, 20);
  ctx.restore();
}
function cross(x, y, s = 1, col = P.red) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  stroke2(() => { ctx.moveTo(-24, -24); ctx.lineTo(24, 24); ctx.moveTo(24, -24); ctx.lineTo(-24, 24); }, col, 12, 20);
  ctx.restore();
}
// scale-in wrapper around a drawing
function popIn(x, y, k, draw, rot = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(rot * (1 - Math.min(1, k))); draw(); ctx.restore();
}
function withAlpha(a, draw) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; draw(); ctx.restore(); }

// ---------- backgrounds ----------
function paperBG(col = P.bg) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
function graphPaper(col = P.cream) {
  paperBG(col);
  ctx.strokeStyle = "rgba(90,120,130,0.14)"; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
}
function desk(col = "#6a503c") {
  paperBG(col);
  ctx.strokeStyle = "rgba(40,25,15,0.22)"; ctx.lineWidth = 5;
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo(0, i * 64 + 20); ctx.bezierCurveTo(600, i * 64 + 50 * rnd(i, 1), 1300, i * 64 - 40 * rnd(i, 2), W, i * 64 + 10); ctx.stroke(); }
}
function sea() {
  paperBG(P.sea);
  ctx.strokeStyle = P.sea2; ctx.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const y = 40 + i * 70, off = (i % 2) * 45; ctx.beginPath();
    for (let x = -40 + off; x < W; x += 90) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 22, y - 11, x + 44, y); }
    ctx.stroke();
  }
}

// ---------- maps ----------
const USA = window.USA, WORLD = window.WORLD;
function mapPath(rings, proj) { for (const r of rings) { r.forEach(([lo, la], j) => { const p = proj(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); } }
const usProj = (cx, cy, k) => (lo, la) => [cx + (lo + 96) * k * Math.cos(38 * Math.PI / 180), cy - (la - 38.5) * k];
const worldProj = (cx, cy, k) => (lo, la) => [cx + lo * k, cy - la * k * 1.12];
function pin(x, y, k, col = P.red, lab, labDir = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(back(k), back(k));
  cut(() => { ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -34, -26, -62, 0, -62); ctx.bezierCurveTo(26, -62, 26, -34, 0, 0); }, col, { lw: 4 });
  cut(circ(0, -42, 9), P.card, { lw: 3, shadow: false });
  ctx.restore();
  if (lab) label(lab, x + labDir * 40, y - 40, { size: 34, align: labDir > 0 ? "left" : "right", k });
}

// ---------- characters ----------
const SHIRTS = [P.teal, P.orange, P.purple, P.blue, P.green, P.pink, "#b86b4b", "#5d7d9a", "#a3874f", "#8a5a7a"];
const SKINS = [P.skin1, P.skin2, P.skin3, "#f0cfae", "#a8744f"];
const HAIRS = ["#3b2a20", "#6b4a2b", "#1f1a17", "#b0833f", "#8a8a88", "#4a3222"];
// front-facing person, feet at origin, ~300 units tall
function person(o) {
  const id = o.id || 1;
  const shirt = o.shirt || SHIRTS[id % SHIRTS.length], skin = o.skin || SKINS[(id * 7) % SKINS.length], hair = o.hair || HAIRS[(id * 3) % HAIRS.length];
  ctx.save(); ctx.translate(o.x, o.y); boil(id, 0.8 / (o.s || 1)); ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  const wk = o.walk != null ? Math.sin(o.walk) : 0;
  ctx.translate(0, o.walk != null ? -Math.abs(Math.cos(o.walk)) * 6 : 0);
  // legs
  for (const [sx, sg] of [[-15, 1], [15, -1]]) {
    ctx.save(); ctx.translate(sx, -118); ctx.rotate(wk * 0.4 * sg);
    cut(rect(-12, 0, 24, 108, 7), o.pants || "#4b4f5c", { lw: 4 });
    cut(rect(-14, 98, 32, 18, 6), "#2d2622", { lw: 3, shadow: false });
    ctx.restore();
  }
  // body
  cut(rect(-46, -222, 92, 118, 20), shirt, { lw: 5 });
  if (o.blazer) { cut(poly([[-46, -200], [-10, -222], [0, -150], [-46, -110]]), o.blazer, { lw: 3, shadow: false }); cut(poly([[46, -200], [10, -222], [0, -150], [46, -110]]), o.blazer, { lw: 3, shadow: false }); }
  if (o.lanyard) { line(-16, -218, 0, -170, P.red, 5); line(16, -218, 0, -170, P.red, 5); cut(rect(-14, -172, 28, 36, 4), P.card, { lw: 3, shadow: false }); }
  // arms
  const armL = o.armL ?? 0, armR = o.armR ?? 0; // radians raised
  stroke2(() => { ctx.moveTo(-38, -208); ctx.lineTo(-44 - wk * 16 - Math.sin(armL) * 40, -140 - (1 - Math.cos(armL)) * 70 - Math.sin(armL) * 30); }, shirt, 19, 27);
  stroke2(() => { ctx.moveTo(38, -208); ctx.lineTo(44 + wk * 16 + Math.sin(armR) * 40, -140 - (1 - Math.cos(armR)) * 70 - Math.sin(armR) * 30); }, shirt, 19, 27);
  // head
  cut(circ(0, -254, 34), skin, { lw: 4 });
  const hs = o.hairStyle ?? (id % 4);
  if (hs === 0) cut(() => { ctx.arc(0, -258, 35, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(10, -272, -34, -262); }, hair, { lw: 3, shadow: false });
  else if (hs === 1) cut(() => { ctx.arc(0, -256, 37, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(38, -220); ctx.lineTo(30, -222); ctx.quadraticCurveTo(20, -270, -30, -262); ctx.lineTo(-30, -222); ctx.lineTo(-38, -220); ctx.closePath(); }, hair, { lw: 3, shadow: false });
  else if (hs === 2) cut(() => { ctx.arc(0, -262, 30, Math.PI, 0); ctx.closePath(); }, hair, { lw: 3, shadow: false });
  else { cut(() => { ctx.arc(0, -258, 35, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); }, hair, { lw: 3, shadow: false }); cut(circ(0, -298, 14), hair, { lw: 3, shadow: false }); }
  if (o.glasses) { ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-12, -252, 9, 0, 7); ctx.moveTo(21, -252); ctx.arc(12, -252, 9, 0, 7); ctx.moveTo(-3, -252); ctx.lineTo(3, -252); ctx.stroke(); }
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(-12, -252, 3.6, 0, 7); ctx.arc(12, -252, 3.6, 0, 7); ctx.fill();
  const mood = o.mood || "smile";
  ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = P.ink;
  if (mood === "smile") { ctx.moveTo(-10, -236); ctx.quadraticCurveTo(0, -228, 10, -236); }
  else if (mood === "o") { ctx.arc(0, -234, 5, 0, 7); }
  else { ctx.moveTo(-9, -234); ctx.lineTo(9, -234); }
  ctx.stroke();
  if (o.hold) o.hold();
  ctx.restore();
}
// small map/grid figure (pawn-like)
function pawn(x, y, s, col, k = 1, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * back(k), s * back(k)); boil(o.id || (x | 0), 0.6 / s);
  cut(() => { ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-24, -44, 0, -46); ctx.quadraticCurveTo(24, -44, 24, 0); ctx.closePath(); }, col, { lw: 4, sx: 3, sy: 4 });
  cut(circ(0, -64, 17), o.skin || P.skin1, { lw: 4, sx: 3, sy: 4 });
  ctx.restore();
}

// ---------- objects ----------
function keyShape(x, y, s, rot = 0, col = P.yellow, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(() => { ctx.arc(-60, 0, 36, 0, 7); ctx.moveTo(-40, 0); }, col, { lw: 5 });
  cut(circ(-60, 0, 13), o.hole || P.bg, { lw: 4, shadow: false });
  cut(() => { ctx.rect(-26, -10, 110, 20); ctx.rect(56, 8, 12, 20); ctx.rect(76, 8, 10, 26); }, col, { lw: 4 });
  ctx.restore();
}
function smartcard(x, y, s, rot = 0, col = "#f0e6d0", o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(rect(-85, -54, 170, 108, 12), col, { lw: 4 });
  cut(rect(-60, -24, 44, 34, 6), P.yellow, { lw: 3, shadow: false });
  line(-60, -7, -16, -7, P.ink, 2); line(-38, -24, -38, 10, P.ink, 2);
  line(10, -20, 60, -20, P.grey, 5); line(10, 0, 50, 0, P.grey, 5);
  if (o.label) text(o.label, 30, 40, { font: "Elite", size: 18 });
  ctx.restore();
}
function hsm(x, y, s, o = {}) { // hardware security module
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(o.id || 71, 0.5);
  cut(rect(-190, -120, 380, 240, 16), P.steel, { lw: 5, sx: 10, sy: 12, sb: 10 });
  cut(rect(-170, -100, 340, 60, 8), "#23312c", { lw: 3, shadow: false });
  if (o.screen) text(o.screen, 0, -58, { font: "Elite", size: 30, color: o.screenCol || "#9fe3a8" });
  for (let i = 0; i < 3; i++) {
    const on = o.slots && o.slots[i];
    cut(rect(-150 + i * 110, 10, 80, 16, 4), "#1c1a18", { lw: 3, shadow: false });
    cut(circ(-110 + i * 110, 60, 11), on ? "#8fe07a" : "#5a1f18", { lw: 3, shadow: false });
  }
  cut(rect(130, 40, 40, 50, 6), P.steel2, { lw: 3, shadow: false });
  if (o.xray) {
    ctx.save(); ctx.globalAlpha *= o.xray;
    cut(rect(-150, -30, 300, 120, 10), "#1d2a30", { lw: 3, shadow: false });
    ctx.shadowColor = P.glow; ctx.shadowBlur = 30;
    keyShape(-10, 30, 0.7, -0.1, P.glow, { hole: "#1d2a30" });
    ctx.restore();
  }
  ctx.restore();
}
function safe(x, y, s, open = 0, o = {}) { // open 0..1 door swing
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(o.id || 81, 0.5);
  cut(rect(-200, -220, 400, 440, 20), P.steel2, { lw: 6, sx: 12, sy: 14, sb: 12 });
  cut(rect(-170, -190, 340, 380, 10), o.inside || "#2a2724", { lw: 4, shadow: false });
  if (o.content) o.content();
  const sw = Math.cos(open * Math.PI * 0.55); // door scaleX
  ctx.save(); ctx.translate(-170, 0); ctx.scale(Math.max(0.02, sw), 1);
  cut(rect(0, -190, 340, 380, 10), P.steel3, { lw: 5 });
  cut(circ(170, 0, 70), P.steel2, { lw: 5, shadow: false });
  ctx.save(); ctx.translate(170, 0); ctx.rotate(open * 4 + (o.spin || 0));
  for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); stroke2(() => { ctx.moveTo(0, 0); ctx.lineTo(0, -95); }, P.steel, 10, 16); cut(circ(0, -100, 12), P.steel, { lw: 3, shadow: false }); }
  cut(circ(0, 0, 26), P.steel3, { lw: 4, shadow: false });
  ctx.restore();
  cut(rect(40, -60, 36, 120, 6), P.steel2, { lw: 3, shadow: false });
  ctx.restore();
  ctx.restore();
}
function laptop(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(o.id || 91, 0.5);
  cut(rect(-230, -300, 460, 290, 16), "#3d3b38", { lw: 5 });
  cut(rect(-205, -278, 410, 246, 6), o.screenBg || "#f7f3ea", { lw: 3, shadow: false });
  if (o.screen) { ctx.save(); ctx.beginPath(); ctx.rect(-205, -278, 410, 246); ctx.clip(); o.screen(); ctx.restore(); }
  cut(() => { ctx.moveTo(-270, 0); ctx.lineTo(270, 0); ctx.lineTo(240, -12); ctx.lineTo(-240, -12); ctx.closePath(); }, "#57544f", { lw: 4 });
  ctx.restore();
}
function browser(url, typed = 1) { // draws inside a laptop screen local coords
  cut(rect(-205, -278, 410, 40), "#ddd4c2", { lw: 0, shadow: false });
  for (let i = 0; i < 3; i++) cut(circ(-185 + i * 20, -258, 6), [P.red, P.yellow, P.green][i], { lw: 2, shadow: false });
  cut(rect(-120, -272, 300, 28, 12), "#fffaf0", { lw: 2, shadow: false });
  const s = url.slice(0, Math.floor(url.length * typed));
  text(s + (typed < 1 && Math.floor(T * 3) % 2 ? "|" : ""), -108, -251, { font: "Elite", size: 20, align: "left" });
}
function building(x, y, s, o = {}) { // boring beige building
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(o.id || 101, 0.5);
  cut(rect(-260, -260, 520, 260, 6), o.col || P.beige, { lw: 5, sx: 10, sy: 12 });
  cut(rect(-260, -282, 520, 30, 4), o.col2 || P.beige2, { lw: 4 });
  for (let i = 0; i < 6; i++) cut(rect(-220 + i * 76, -220, 46, 26, 3), "#9fb3b1", { lw: 3, shadow: false });
  cut(rect(-40, -110, 80, 110, 4), P.steel2, { lw: 4, shadow: false });
  // fence
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  for (let i = -300; i <= 300; i += 24) { ctx.beginPath(); ctx.moveTo(i, 20); ctx.lineTo(i, -40); ctx.stroke(); }
  line(-300, -30, 300, -30, P.ink, 3); line(-300, 0, 300, 0, P.ink, 3);
  if (o.cam) { cut(rect(200, -300, 40, 22, 4), P.steel, { lw: 3 }); }
  ctx.restore();
}
function envelope(x, y, s, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(rect(-110, -70, 220, 140, 8), o.col || P.card, { lw: 4 });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -70); ctx.lineTo(0, 10); ctx.lineTo(110, -70); ctx.stroke();
  if (o.text) text(o.text, 0, 50, { font: "Elite", size: o.size || 22 });
  if (o.seal) { const k = o.seal; ctx.save(); ctx.translate(0, 12); ctx.scale(back(k), back(k)); cut(() => smooth(Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.283, r = i % 2 ? 36 : 42; return [Math.cos(a) * r, Math.sin(a) * r]; })), P.red, { lw: 3 }); check(0, 0, 0.6, P.card); ctx.restore(); }
  ctx.restore();
}
function tebag(x, y, s, rot = 0, o = {}) { // tamper-evident bag
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(rect(-120, -160, 240, 320, 10), "rgba(220,235,240,0.75)", { lw: 4 });
  cut(rect(-120, -160, 240, 40, 4), "#5d7d9a", { lw: 3, shadow: false });
  text("TAMPER EVIDENT", 0, -132, { font: "Elite", size: 18, color: P.card });
  if (o.content) o.content();
  cut(rect(-100, 100, 200, 44, 4), P.card, { lw: 3, shadow: false });
  text(o.serial || "A 5219734", 0, 131, { font: "Elite", size: 24 });
  ctx.restore();
}
function calendarPage(x, y, s, month, day, year, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); boil(o.id || 111, 0.5);
  cut(rect(-150, -170, 300, 340, 12), P.card, { lw: 5 });
  cut(rect(-150, -170, 300, 80, 12), o.col || P.red, { lw: 5, shadow: false });
  text(month, 0, -112, { size: 46, color: P.card, ls: 4 });
  text(day, 0, 60, { size: 150 });
  if (year) text(year, 0, 135, { font: "Elite", size: 40 });
  ctx.restore();
}
function clockFace(x, y, r, hrs, o = {}) {
  cut(circ(x, y, r), P.card, { lw: 5 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, P.ink, 4); }
  const ah = hrs / 12 * 6.283 - Math.PI / 2, am = (hrs % 1) * 6.283 - Math.PI / 2;
  line(x, y, x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5, P.ink, 8);
  line(x, y, x + Math.cos(am) * r * 0.75, y + Math.sin(am) * r * 0.75, P.ink, 5);
  cut(circ(x, y, 8), P.ink, { lw: 0, shadow: false });
}
function phonebook(x, y, s, openK = 0, rows = [], o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(o.id || 121, 0.5);
  if (openK < 0.5) {
    const sx = 1 - openK * 2;
    cut(rect(-170, -230, 340, 460, 10), P.yellow, { lw: 5, sx: 10, sy: 12 });
    text("PHONE", 0, -60, { size: 72 }); text("BOOK", 0, 20, { size: 72 });
    text("of the internet", 0, 80, { font: "Elite", size: 28 });
    void sx;
  } else {
    cut(rect(-360, -230, 720, 460, 10), P.card, { lw: 5, sx: 10, sy: 12 });
    line(0, -230, 0, 230, P.ink, 4);
    rows.forEach((r, i) => {
      const k = clamp(o.rowK != null ? o.rowK * rows.length - i : 1);
      if (k <= 0) return;
      ctx.save(); ctx.globalAlpha *= k;
      text(r[0], -330, -150 + i * 64, { font: "Elite", size: 28, align: "left", color: r[2] || P.ink });
      text(r[1], 330, -150 + i * 64, { font: "Elite", size: 28, align: "right", color: r[2] || P.ink });
      ctx.setLineDash([4, 8]); line(-330 + tw(r[0], 28, "Elite") + 10, -158 + i * 64, 330 - tw(r[1], 28, "Elite") - 10, -158 + i * 64, "rgba(43,35,32,0.4)", 2, [4, 8]);
      ctx.restore();
    });
  }
  ctx.restore();
}
function plane(x, y, s, rot = 0, col = P.card) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(() => { ctx.moveTo(-120, -8); ctx.quadraticCurveTo(80, -20, 130, 0); ctx.quadraticCurveTo(80, 20, -120, 8); ctx.closePath(); }, col, { lw: 4 });
  cut(poly([[10, -8], [-40, -70], [-20, -70], [50, -8]]), col, { lw: 4, shadow: false });
  cut(poly([[10, 8], [-40, 70], [-20, 70], [50, 8]]), col, { lw: 4, shadow: false });
  cut(poly([[-100, -6], [-128, -40], [-112, -40], [-80, -6]]), col, { lw: 4, shadow: false });
  ctx.restore();
}
function padlock(x, y, s, open = 0, col = P.yellow) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  stroke2(() => { ctx.arc(0, -50 - open * 30, 38, Math.PI, 0); ctx.lineTo(38, -20 - open * 30); }, P.steel3, 14, 22);
  cut(rect(-60, -40, 120, 100, 14), col, { lw: 5 });
  cut(circ(0, 0, 12), P.ink, { lw: 0, shadow: false }); cut(rect(-5, 0, 10, 26), P.ink, { lw: 0, shadow: false });
  ctx.restore();
}

// ---------- paper texture, grain ----------
let PAPER = null, GRAIN = [];
function buildTextures() {
  PAPER = document.createElement("canvas"); PAPER.width = W; PAPER.height = H;
  const p = PAPER.getContext("2d"), img = p.createImageData(W, H), d = img.data;
  const vn = (x, y, sc, seed) => {
    const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(rnd(x0, y0, seed), rnd(x0 + 1, y0, seed), sx), lerp(rnd(x0, y0 + 1, seed), rnd(x0 + 1, y0 + 1, seed), sx), sy);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = 1 - 0.07 * vn(x, y, 150, 1) - 0.05 * vn(x, y, 22, 2) - 0.03 * rnd(x, y, 3);
    const i = (y * W + x) * 4; d[i] = 255 * v; d[i + 1] = 252 * v; d[i + 2] = 244 * v; d[i + 3] = 255;
  }
  p.putImageData(img, 0, 0);
  for (let i = 0; i < 1600; i++) {
    const x = rnd(i, 1, 9) * W, y = rnd(i, 2, 9) * H, a = rnd(i, 3, 9) * 6.28, l = 6 + rnd(i, 4, 9) * 22;
    p.strokeStyle = `rgba(120,95,70,${0.05 + rnd(i, 5, 9) * 0.07})`; p.lineWidth = 1 + rnd(i, 6, 9);
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  const g = p.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(60,35,15,0.28)");
  p.fillStyle = g; p.fillRect(0, 0, W, H);
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const gc = c.getContext("2d"), gi = gc.createImageData(256, 256);
    for (let i = 0; i < 65536; i++) { const v = rnd(i, k, 77) * 255; gi.data[i * 4] = gi.data[i * 4 + 1] = gi.data[i * 4 + 2] = v; gi.data[i * 4 + 3] = 255; }
    gc.putImageData(gi, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
}
function tornEdge(x) {
  ctx.moveTo(x, -10);
  for (let y = 0; y <= H + 40; y += 36) ctx.lineTo(x + (rnd(y, 17) - 0.5) * 34, y);
  ctx.lineTo(W + 200, H + 40); ctx.lineTo(W + 200, -10); ctx.closePath();
}

// ---------- frame compositor ----------
// scenes: [[name, startTime, drawFn(t)], ...] sorted by start
function composite(t, scenes, overlay) {
  T = t;
  if (!PAPER) buildTextures();
  let i = 0; while (i + 1 < scenes.length && t >= scenes[i + 1][1]) i++;
  const TR = 0.34;
  const k = i > 0 ? prog(t, scenes[i][1], scenes[i][1] + TR) : 1;
  ctx.save();
  if (k < 1 && scenes[i][3] !== "cut") {
    ctx.save(); ctx.translate(-eio(k) * 220, 0); scenes[i - 1][2](t); ctx.restore();
    const edge = lerp(W + 60, -80, eio(k));
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.clip(); scenes[i][2](t); ctx.restore();
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.shadowColor = "rgba(30,15,5,0.5)"; ctx.shadowBlur = 22; ctx.shadowOffsetX = -9;
    ctx.strokeStyle = "#fbf5e8"; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
  } else scenes[i][2](t);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(PAPER, 0, 0); ctx.restore();
  if (overlay) overlay(t);
  const f = Math.floor(t * 12);
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.085;
  ctx.translate(-rnd(f, 1) * 256, -rnd(f, 2) * 256);
  ctx.fillStyle = GRAIN[f % GRAIN.length]; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}

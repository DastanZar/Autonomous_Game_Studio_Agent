// Style lab: shared helpers. Frames are pure functions of t (seeded hash, no clock, no Math.random).
"use strict";
const W = 1080, H = 1920;
const ctx = document.getElementById("c").getContext("2d");
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
const pop = (t, t0, d = 0.35) => back(prog(t, t0, t0 + d));
let T = 0;

// text: o = {size, font, color, align, base, stroke, ink, ls, shadow}
function text(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.size || 60}px ${o.font || "Anton"}`;
  ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "alphabetic";
  if (o.ls) ctx.letterSpacing = o.ls + "px";
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowOffsetY = 6; ctx.shadowBlur = 14; }
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || "#000"; ctx.strokeText(str, x, y); ctx.shadowColor = "transparent"; }
  ctx.fillStyle = o.color || "#000"; ctx.fillText(str, x, y);
  ctx.restore();
}
function measure(str, size, font = "Anton") { ctx.save(); ctx.font = `${size}px ${font}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }
function smooth(pts) {
  const n = pts.length;
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath();
}
function fillPath(path, c) { ctx.beginPath(); path(); ctx.fillStyle = c; ctx.fill(); }
function strokePath(path, c, w) { ctx.beginPath(); path(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); }
function shade(hex, k) {  // k<0 darker, k>0 lighter
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}
// burned-in caption chunk: Anton, uppercase, white with ink outline (the bible's caption style)
function caption(str, y, k = 1, ink = "#1d1b2e", size = 92) {
  if (k <= 0) return;
  while (measure(str, size) > W - 200 && size > 40) size -= 4;
  ctx.save(); ctx.translate(W / 2, y); const s = back(clamp(k)); ctx.scale(s, s);
  text(str, 0, 0, { size, color: "#fff", stroke: 16, ink });
  ctx.restore();
}
function grain(seed, alpha = 0.05, n = 2600) {
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = rnd(i, seed, 3) < 0.5 ? "#000" : "#fff";
    ctx.fillRect(rnd(i, seed, 1) * W, rnd(i, seed, 2) * H, 2, 2);
  }
  ctx.restore();
}
// review tag on every mock frame: these numbers are placeholders, not facts
function sampleTag(dark) {
  ctx.save(); ctx.font = "26px Elite";
  const s = "STYLE TEST · SAMPLE NUMBERS, NOT FACT-CHECKED", w = ctx.measureText(s).width + 28;
  ctx.fillStyle = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)"; ctx.fillRect(W / 2 - w / 2, 150, w, 42);
  ctx.fillStyle = dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s, W / 2, 172);
  ctx.restore();
}
// safe-zone overlay for review stills (platform UI areas)
function safeZones() {
  ctx.save(); ctx.fillStyle = "rgba(255,0,80,0.10)";
  ctx.fillRect(0, 0, W, 220); ctx.fillRect(0, H - 420, W, 420); ctx.fillRect(W - 140, 220, 140, H - 640);
  ctx.restore();
}

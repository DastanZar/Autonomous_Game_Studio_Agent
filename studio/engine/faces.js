// The face rig for flag badges, ported from studio/stylelab/cast.js (flat style only; approved 2026-09-29).
// face({x, y, sz, mood, look:[dx,dy], blink, talk, body}); moods: neutral, happy, smug, tired, worried, shocked, angry, proud.
// All motion is a pure function of t: blinkAt() and flap() use the seeded rnd().
"use strict";
function blinkAt(t, seed) {
  let tb = 0.4 + rnd(seed, 0) * 2;
  for (let i = 1; tb < t + 1 && i < 200; i++) {
    if (t >= tb && t < tb + 0.14) return Math.sin((t - tb) / 0.14 * Math.PI);
    tb += 2.2 + rnd(seed, i) * 1.8;
  }
  return 0;
}
// mouth openness while talking: syllable-rate flap
const flap = (t, seed) => 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + rnd(seed, Math.floor(t * 6)) * 2));
function shadeHex(hex, k) {  // k<0 darker, k>0 lighter
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}
function facePath(path, c, w) { ctx.save(); ctx.beginPath(); path(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.restore(); }
function face(f) {
  const { x, y, sz } = f, mood = f.mood || "neutral", look = f.look || [0, 0], shock = mood === "shocked";
  const INK = P.ink, K = f.lw == null ? 1 : f.lw;   // K scales line weights (1 = as approved in the style lab)
  for (const side of [-1, 1]) {
    const ex = x + side * sz * 0.62, ey = y;
    const rx = sz * 0.42 * (shock ? 1.15 : 1), ry = sz * 0.52 * (shock ? 1.2 : 1) * (1 - 0.92 * (f.blink || 0));
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, rx, Math.max(ry, 2), 0, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6 * K; ctx.stroke();
    if (ry > 6 * K) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, 7); ctx.clip();
      const pr = sz * (shock ? 0.13 : 0.2);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45, ey + look[1] * ry * 0.4 + sz * 0.05, pr, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45 - pr * 0.35, ey + look[1] * ry * 0.4 - pr * 0.2, pr * 0.32, 0, 7); ctx.fill();
      const lid = mood === "tired" ? 0.55 : mood === "smug" ? 0.42 : 0;   // heavy lids: tired / smug
      if (lid) {
        ctx.fillStyle = f.body; ctx.fillRect(ex - rx - 2, ey - ry - 2, rx * 2 + 4, ry * 2 * lid + 2);
        facePath(() => { ctx.moveTo(ex - rx, ey - ry + ry * 2 * lid); ctx.lineTo(ex + rx, ey - ry + ry * 2 * lid); }, INK, 5 * K);
      }
      ctx.restore();
    }
    if (mood === "tired") facePath(() => { ctx.arc(ex, ey + ry * 0.55, rx * 0.8, 0.35, Math.PI - 0.35); }, shadeHex(f.body, -0.35), 4 * K);   // eye bags
    const bt = { angry: 0.45, worried: -0.4, shocked: -0.15, smug: 0.2, proud: -0.1 }[mood] ?? 0;   // brows
    const by = ey - sz * 0.62 - (shock ? sz * 0.18 : 0);
    facePath(() => { ctx.moveTo(ex - side * sz * 0.3, by + bt * sz * 0.3); ctx.lineTo(ex + side * sz * 0.3, by - bt * sz * 0.3); }, INK, 7 * K);
  }
  const my = y + sz * 0.72, mw = sz * 0.5, talk = f.talk || 0;   // mouth
  if (talk > 0.05 || shock) {
    const oh = shock ? sz * 0.34 : sz * 0.3 * talk, ow = shock ? mw * 0.55 : mw * (0.7 + 0.3 * talk);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7);
    ctx.fillStyle = "#5a1f2b"; ctx.fill(); ctx.clip();
    ctx.fillStyle = "#e86a7a"; ctx.beginPath(); ctx.ellipse(x, my + oh * 1.1, ow * 0.7, oh * 0.6, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 5 * K; ctx.stroke();
  } else {
    const lw = 6 * K, curve = { happy: 0.5, proud: 0.45, smug: 0.25, tired: -0.1, worried: -0.35, angry: -0.3 }[mood] ?? 0.15;
    if (mood === "smug") facePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x + mw * 0.2, my + mw * 0.25, x + mw * 0.75, my - mw * 0.3); }, INK, lw);
    else facePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x, my + curve * mw, x + mw * 0.6, my); }, INK, lw);
  }
}
function sweat(x, y, k, s = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + k * 20 * s); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3) * clamp((1 - k) * 4);
  ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(16, 0, 0, 12); ctx.quadraticCurveTo(-16, 0, 0, -26);
  ctx.fillStyle = "#9fd8f0"; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
function crown(x, y, rot, fill) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(-50, -52); ctx.lineTo(-22, -24); ctx.lineTo(0, -64); ctx.lineTo(22, -24); ctx.lineTo(50, -52); ctx.lineTo(44, 0); ctx.closePath();
  ctx.fillStyle = fill || P.gold; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.stroke();
  ctx.restore();
}

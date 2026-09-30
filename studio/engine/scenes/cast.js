// Flat Cast theme (body-cast): the character rig, the five animated sets, and the scene types
// character_dialog and character_explain. Ported from studio/stylelab/cast.js + sets.js (user-approved 2026-09-29),
// flat style only. Everything is a pure function of t: motion comes from sin(t) and the seeded rnd(), never a clock.
"use strict";

// ---------- flat-cast palette: the bible's palette wins over these defaults ----------
const BC = Object.assign({
  ink: "#1d1b2e", flesh: "#f2a38f", blood: "#d2383f", bone: "#f4ecd8", bile: "#9bb63a", lymph: "#7fc8d8", neuron: "#9a7de0", sun: "#ffcc4d",
  liver: "#a8433f", brain: "#f3a0b6", heart: "#d2383f", vein: "#4f6fd0",
}, EP.look.palette || {});

// ---------- drawing helpers (from stylelab/base.js) ----------
function fillPath(path, c) { ctx.beginPath(); path(); ctx.fillStyle = c; ctx.fill(); }
function strokePath(path, c, w) { ctx.beginPath(); path(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); }
function shade(hex, k) {  // k<0 darker, k>0 lighter
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}

// ---------- the cast rig: feet at the origin, about 440 units tall at s = 1 ----------
// a filled body part in the current style
function part(path, fill, o = {}) {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  fillPath(path, shade(fill, -0.22));                       // crescent shade: the shadow colour underneath...
  ctx.save(); ctx.translate(o.sx ?? -9, o.sy ?? -11); fillPath(path, fill); ctx.restore();   // ...the lit colour offset up-left
  if (o.hl !== false) {  // soft highlight streak, upper left
    ctx.globalAlpha = 0.35; ctx.fillStyle = "#fff";
    const b = o.hlAt || [0, 0, 40];
    ctx.beginPath(); ctx.ellipse(b[0], b[1], b[2], b[2] * 0.45, -0.6, 0, 7); ctx.fill();
  }
  ctx.restore();
  strokePath(path, BC.ink, o.lw ?? 8);
}
// a limb from (x1,y1) to (x2,y2), bending sideways by `bend`
function limb(x1, y1, x2, y2, bend, color, w = 16) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  strokePath(() => { ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); }, BC.ink, w);
}
function foot(x, y) { part(() => ctx.ellipse(x + 10, y - 12, 30, 15, 0, 0, 7), BC.ink, { lw: 4, hl: false }); }
function hand(x, y, color) { part(() => ctx.arc(x, y, 15, 0, 7), color, { lw: 6, hl: false, sx: -3, sy: -4 }); }
// blink: 0 open .. 1 shut, from a seeded schedule (every 2.2-4 s, 0.14 s long)
function blinkAt(t, seed) {
  let tb = 0.4 + rnd(seed, 0) * 2;
  for (let i = 1; tb < t + 1 && i < 200; i++) {
    if (t >= tb && t < tb + 0.14) return Math.sin((t - tb) / 0.14 * Math.PI);
    tb += 2.2 + rnd(seed, i) * 1.8;
  }
  return 0;
}
// mouth openness while talking: syllable-rate flap (in production, keyed to voice word times)
const flap = (t, seed) => 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + rnd(seed, Math.floor(t * 6)) * 2));

// face. f = {x, y, sz, mood, look:[dx,dy], blink, talk, body}; moods: neutral, happy, smug, tired, worried, shocked, angry, proud
function face(f) {
  const { x, y, sz } = f, sp = sz * 0.62, mood = f.mood || "neutral";
  const look = f.look || [0, 0];
  const shock = mood === "shocked";
  for (const side of [-1, 1]) {
    const ex = x + side * sp, ey = y;
    {
      const rx = sz * 0.42 * (shock ? 1.15 : 1), ry = sz * 0.52 * (shock ? 1.2 : 1) * (1 - 0.92 * (f.blink || 0));
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, rx, Math.max(ry, 2), 0, 0, 7); ctx.fill();
      ctx.strokeStyle = BC.ink; ctx.lineWidth = 6; ctx.stroke();
      if (ry > 6) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, 7); ctx.clip();
        const pr = sz * (shock ? 0.13 : 0.2);
        ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45, ey + look[1] * ry * 0.4 + sz * 0.05, pr, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45 - pr * 0.35, ey + look[1] * ry * 0.4 - pr * 0.2, pr * 0.32, 0, 7); ctx.fill();
        // heavy lids: tired / smug
        const lid = mood === "tired" ? 0.55 : mood === "smug" ? 0.42 : 0;
        if (lid) {
          ctx.fillStyle = f.body; ctx.fillRect(ex - rx - 2, ey - ry - 2, rx * 2 + 4, ry * 2 * lid + 2);
          strokePath(() => { ctx.moveTo(ex - rx, ey - ry + ry * 2 * lid); ctx.lineTo(ex + rx, ey - ry + ry * 2 * lid); }, BC.ink, 5);
        }
        ctx.restore();
      }
      if (mood === "tired") strokePath(() => { ctx.arc(ex, ey + ry * 0.55, rx * 0.8, 0.35, Math.PI - 0.35); }, shade(f.body, -0.35), 4);  // eye bags
      // brows
      const bt = { angry: 0.45, worried: -0.4, shocked: -0.15, smug: 0.2, proud: -0.1 }[mood] ?? 0;
      const by = ey - sz * 0.62 - (shock ? sz * 0.18 : 0);
      strokePath(() => { ctx.moveTo(ex - side * sz * 0.3, by + bt * sz * 0.3 * -1 * -1); ctx.lineTo(ex + side * sz * 0.3, by - bt * sz * 0.3 * -1 * -1 + (bt ? 0 : 0)); }, BC.ink, 7);
    }
  }
  // mouth
  const my = y + sz * 0.72, mw = sz * 0.5;
  const talk = f.talk || 0;
  if (talk > 0.05 || shock) {
    const oh = shock ? sz * 0.34 : sz * 0.3 * talk, ow = shock ? mw * 0.55 : mw * (0.7 + 0.3 * talk);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7);
    ctx.fillStyle = "#5a1f2b"; ctx.fill(); ctx.clip();
    ctx.fillStyle = "#e86a7a"; ctx.beginPath(); ctx.ellipse(x, my + oh * 1.1, ow * 0.7, oh * 0.6, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7); ctx.strokeStyle = BC.ink; ctx.lineWidth = 5; ctx.stroke();
  } else {
    const lw = 6;
    const curve = { happy: 0.5, proud: 0.45, smug: 0.25, tired: -0.1, worried: -0.35, angry: -0.3 }[mood] ?? 0.15;
    if (mood === "smug") strokePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x + mw * 0.2, my + mw * 0.25, x + mw * 0.75, my - mw * 0.3); }, BC.ink, lw);
    else strokePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x, my + curve * mw, x + mw * 0.6, my); }, BC.ink, lw);
  }
}
function sweat(x, y, k, s = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + k * 20); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3) * clamp((1 - k) * 4);
  part(() => { ctx.moveTo(0, -26); ctx.quadraticCurveTo(16, 0, 0, 12); ctx.quadraticCurveTo(-16, 0, 0, -26); }, "#9fd8f0", { lw: 4, hl: false });
  ctx.restore();
}

// ---- the cast -------------------------------------------------------------------------------------------
// o = {t, mood, talk, look, walk (phase or null), arms: "rest"|"up"|"hips"|"point"|"mug", seed, s, flip}
const CAST = {
  liver(o) {
    const c = BC.liver, t = o.t;
    const body = () => smooth([[-190, -318], [-70, -352], [70, -340], [182, -300], [178, -266], [96, -222], [-20, -168], [-140, -150], [-205, -215]]);
    legs(o, -70, 0, -160, c);
    arm(o, "L", -180, -250, c); 
    part(body, c, { hlAt: [-110, -300, 60] });
    // gallbladder sidekick, hanging under the right edge
    ctx.save(); ctx.translate(40, -178 + Math.sin(t * 3) * 3); ctx.rotate(Math.sin(t * 2.2) * 0.08);
    part(() => { ctx.moveTo(0, 0); ctx.quadraticCurveTo(34, 20, 26, 58); ctx.quadraticCurveTo(0, 82, -24, 56); ctx.quadraticCurveTo(-30, 22, 0, 0); }, BC.bile, { hlAt: [-8, 30, 12], lw: 6 });
    ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.arc(-9, 40, 4, 0, 7); ctx.arc(9, 40, 4, 0, 7); ctx.fill();
    ctx.restore();
    arm(o, "R", 140, -275, c);
    face({ x: -40, y: -272, sz: 68, mood: o.mood || "tired", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
  },
  brain(o) {
    const c = BC.brain, t = o.t;
    const pts = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 1 + 0.05 * Math.sin(a * 9); pts.push([Math.cos(a) * 170 * r, -318 + Math.sin(a) * 130 * r]); }
    const body = () => smooth(pts);
    legs(o, -40, 40, -190, c);
    // brain stem as the neck
    part(() => ctx.roundRect(-26, -215, 52, 50, 18), shade(c, -0.12), { hl: false, lw: 7});
    arm(o, "L", -150, -250, c);
    part(body, c, { hlAt: [-90, -380, 50] });
    ctx.save(); ctx.beginPath(); body(); ctx.clip();       // gyri
    const g = shade(c, -0.28);
    for (let k = 0; k < 7; k++) {
      const y0 = -430 + k * 34, s = 7 + k;
      strokePath(() => { ctx.moveTo(-190, y0); for (let x = -190; x <= 190; x += 38) ctx.quadraticCurveTo(x + 19, y0 + (rnd(s, x) - 0.5) * 50, x + 38, y0 + (rnd(s + 1, x) - 0.5) * 16); }, g, 6);
    }
    strokePath(() => { ctx.moveTo(0, -450); ctx.quadraticCurveTo(8, -400, 0, -350); }, shade(c, -0.4), 7);
    ctx.restore();
    arm(o, "R", 150, -250, c);
    // face panel so the eyes read over the folds
    face({ x: 0, y: -305, sz: 72, mood: o.mood || "smug", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
    if (o.crown !== false) crown(70 + (o.crownFall || 0) * 120, -438 + (o.crownFall || 0) * 380, 0.35 + (o.crownFall || 0) * 2.6);
  },
  heart(o) {
    const c = BC.heart, t = o.t;
    const beat = o.beat ? Math.max(0, Math.sin(t * Math.PI * 2 * 1.2)) ** 6 : 0;
    legs(o, -45, 45, -150, c);
    ctx.save(); ctx.translate(0, -260); ctx.scale(1 + beat * 0.07, 1 - beat * 0.05); ctx.translate(0, 260);
    // great vessels, behind the body: aorta arch (red) and vena cava (blue)
    const v = BC.vein;
    const tube = (path, col, w) => { strokePath(path, BC.ink, w + 16); strokePath(path, col, w); };
    tube(() => { ctx.moveTo(-70, -330); ctx.lineTo(-78, -440); }, v, 44);
    tube(() => { ctx.moveTo(10, -340); ctx.bezierCurveTo(0, -470, 120, -480, 110, -370); }, shade(c, -0.08), 50);
    arm(o, "L", -150, -270, c);
    const body = () => { ctx.moveTo(0, -150); ctx.bezierCurveTo(-120, -210, -190, -270, -170, -345); ctx.bezierCurveTo(-150, -410, -60, -410, -10, -360); ctx.bezierCurveTo(40, -410, 150, -410, 165, -335); ctx.bezierCurveTo(180, -250, 90, -200, 0, -150); ctx.closePath(); };
    part(body, c, { hlAt: [-100, -350, 45] });
    // sweatband
    ctx.save(); ctx.beginPath(); body(); ctx.clip();
    ctx.fillStyle = "#fff"; ctx.fillRect(-200, -392, 400, 34);
    ctx.fillStyle = BC.lymph; ctx.fillRect(-200, -380, 400, 10);
    ctx.restore();
    strokePath(body, BC.ink, 8);
    arm(o, "R", 150, -290, c);
    face({ x: -5, y: -290, sz: 70, mood: o.mood || "proud", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
    ctx.restore();
  },
  microbe(o) {  // o.kind: rod | coccus | spiral; about 130 tall
    const t = o.t, k = o.kind || "rod", sd = o.seed || 1;
    const col = o.color || [BC.bile, BC.neuron, BC.lymph, BC.sun][sd % 4];
    const hop = Math.abs(Math.sin(t * 5 + sd)) * 16 * (o.hop ?? 1);
    ctx.save(); ctx.translate(0, -hop); ctx.rotate(Math.sin(t * 3 + sd) * 0.12);
    if (k === "rod") {
      for (let i = 0; i < 4; i++) strokePath(() => { ctx.moveTo(-60, -70 + i * 6); ctx.quadraticCurveTo(-95, -60 + Math.sin(t * 9 + i) * 14, -120, -80 + i * 10); }, BC.ink, 4);
      part(() => ctx.roundRect(-72, -110, 144, 76, 38), col, { hlAt: [-30, -95, 22], lw: 6 });
      face({ x: 5, y: -78, sz: 30, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    } else if (k === "coccus") {
      part(() => ctx.arc(-34, -46, 34, 0, 7), shade(col, -0.05), { lw: 6, hl: false });
      part(() => ctx.arc(8, -66, 48, 0, 7), col, { hlAt: [-10, -90, 16], lw: 6 });
      face({ x: 8, y: -72, sz: 28, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    } else {
      const path = () => { ctx.moveTo(-80, -60); for (let x = -80; x <= 80; x += 4) ctx.lineTo(x, -60 + Math.sin(x * 0.07 + t * 6) * 22); };
      strokePath(path, BC.ink, 34); strokePath(path, col, 20);
      part(() => ctx.arc(86, -60 + Math.sin(86 * 0.07 + t * 6) * 22, 36, 0, 7), col, { lw: 6, hl: false });
      face({ x: 86, y: -64 + Math.sin(86 * 0.07 + t * 6) * 22, sz: 26, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    }
    ctx.restore();
  },
};
function crown(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  part(() => { ctx.moveTo(-44, 0); ctx.lineTo(-50, -52); ctx.lineTo(-22, -24); ctx.lineTo(0, -64); ctx.lineTo(22, -24); ctx.lineTo(50, -52); ctx.lineTo(44, 0); ctx.closePath(); }, BC.sun, { hlAt: [-20, -30, 14], lw: 6 });
  ctx.restore();
}
function legs(o, hx1, hx2, hy, c) {
  const w = o.walk;
  [[hx1, 0], [hx2, Math.PI]].forEach(([hx, ph]) => {
    const sw = w != null ? Math.sin(w + ph) : 0, lift = w != null ? Math.max(0, Math.cos(w + ph)) * 26 : 0;
    const fx = hx + sw * 46, fy = -lift;
    limb(hx, hy, fx, fy - 8, (hx < 0 ? -1 : 1) * 10 + sw * 10, c, 16);
    foot(fx, fy, c);
  });
}
function arm(o, side, sx, sy, c) {
  const pose = (o.arms && o.arms[side]) || o.arms || "rest", sg = side === "L" ? -1 : 1, t = o.t;
  let hx, hy, bend;
  if (pose === "up") { hx = sx + sg * 70; hy = sy - 150 + Math.sin(t * 8) * 10; bend = sg * 30; }
  else if (pose === "hips") { hx = sx + sg * 10; hy = sy + 90; bend = sg * -60; }
  else if (pose === "point") { hx = sx + sg * 150; hy = sy - 40; bend = sg * 12; }
  else if (pose === "mug") { hx = sx + sg * 55; hy = sy + 95; bend = sg * -30; }
  else if (pose === "wave") { hx = sx + sg * 80; hy = sy - 130 + Math.sin(t * 12) * 20; bend = sg * 20; }
  else { hx = sx + sg * 40; hy = sy + 110 + Math.sin(t * 2 + sg) * 4; bend = sg * 26; }
  limb(sx, sy, hx, hy, bend, c, 14);
  if (pose === "mug") mug(hx, hy);
  else hand(hx, hy, c);
}
function mug(x, y) {
  part(() => ctx.roundRect(x - 26, y - 44, 52, 58, 8), "#fdfaf2", { lw: 6, hl: false });
  strokePath(() => { ctx.arc(x + 30, y - 16, 14, -1.3, 1.3); }, BC.ink, 6);
  ctx.fillStyle = "#6b4226"; ctx.fillRect(x - 20, y - 40, 40, 8);
  hand(x - 26, y - 10, BC.liver);
  for (let i = 0; i < 2; i++) { const k = (T * 0.8 + i * 0.5) % 1; ctx.save(); ctx.globalAlpha = 0.5 * (1 - k);
    strokePath(() => { ctx.moveTo(x - 8 + i * 16, y - 52 - k * 50); ctx.quadraticCurveTo(x + 4 + i * 16, y - 64 - k * 50, x - 8 + i * 16, y - 80 - k * 50); }, "#fff", 5); ctx.restore(); }
}
// place a character: breathing squash-stretch about the feet; flip mirrors the body but not text
function char(kind, x, y, s, o) {
  ctx.save(); ctx.translate(x, y);
  const br = Math.sin(o.t * 2.4 + (o.seed || 0)) * 0.018;
  ctx.scale(s * (o.flip ? -1 : 1) * (1 - br * 0.6), s * (1 + br));
  // ground shadow
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.ellipse(0, 4, kind === "microbe" ? 80 : 150, kind === "microbe" ? 12 : 18, 0, 0, 7); ctx.fill(); ctx.restore();
  T = o.t; CAST[kind](o);
  ctx.restore();
}

// ---------- the five animated sets: full-frame backgrounds, always moving ----------
function vgrad(c0, c1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function glow(x, y, r, c, a = 0.5) { ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
// a red blood cell: a disc with a dimple, seen at angle a (0 = face on)
function rbc(x, y, r, tilt, rot, depth) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(tilt)));
  const c = depth < 0.5 ? "#8e1e3a" : "#e0344a";
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  if (depth >= 0.5) { ctx.strokeStyle = BC.ink; ctx.lineWidth = Math.max(3, r * 0.08); ctx.stroke(); }
  ctx.fillStyle = shade(c, -0.25); ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.3, r * 0.12, -0.5, 0, 7); ctx.fill();
  ctx.restore();
}
const SETS = {
  // 1. BLOODSTREAM: a curving vessel tunnel; red cells stream past in three depth layers
  bloodstream(t) {
    vgrad("#3a0a2a", "#7a1236");
    for (let k = 0; k < 9; k++) {  // tunnel rings rushing towards the viewer
      const z = ((k / 9) + t * 0.25) % 1, r = 200 + z * z * 1400, a = 0.25 * z;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#ff6f8e"; ctx.lineWidth = 6 + z * 40;
      ctx.beginPath(); ctx.ellipse(W / 2 + Math.sin(t * 0.7) * 40 * (1 - z), 820, r, r * 1.25, 0, 0, 7); ctx.stroke(); ctx.restore();
    }
    glow(W / 2, 820, 520, "#ff9fb2", 0.35);
    for (const [layer, n, rr, sp] of [[0, 26, 40, 0.18], [1, 14, 80, 0.35], [2, 6, 150, 0.7]]) {
      for (let i = 0; i < n; i++) {
        const x = ((rnd(i, layer, 1) + t * sp * (0.8 + rnd(i, layer, 2) * 0.4)) % 1.3 - 0.15) * W;
        const y = 200 + rnd(i, layer, 3) * 1400 + Math.sin(t * 2 + i) * 20;
        rbc(x, y, rr * (0.8 + rnd(i, layer, 4) * 0.4), t * 2 + i, rnd(i, layer, 5) * 3, layer / 2);
      }
    }
  },
  // 2. NEURON NIGHT: deep indigo; glowing neurons, electric pulses running along the axons
  neurons(t) {
    vgrad("#0d0b2e", "#241a5c");
    for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * Math.abs(Math.sin(t * 2 + i))})`; ctx.beginPath(); ctx.arc(rnd(i, 1) * W, rnd(i, 2) * H, 1.5 + rnd(i, 3) * 2.5, 0, 7); ctx.fill(); }
    const N = [[180, 420], [860, 560], [300, 1100], [820, 1350], [540, 800], [120, 1600], [980, 1000]];
    const E = [[0, 4], [4, 1], [4, 2], [2, 3], [1, 6], [2, 5], [3, 6], [0, 2]];
    E.forEach(([a, b], i) => {
      const [x1, y1] = N[a], [x2, y2] = N[b], cx = (x1 + x2) / 2 + (rnd(i, 7) - 0.5) * 300, cy = (y1 + y2) / 2 + (rnd(i, 8) - 0.5) * 300;
      ctx.save(); ctx.shadowColor = "#b28cff"; ctx.shadowBlur = 20; strokePath(() => { ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); }, "#7e5ae0", 10); ctx.restore();
      const k = ((t * 0.6 + rnd(i, 9)) % 1), q = 1 - k;          // pulse along the curve
      const px = q * q * x1 + 2 * q * k * cx + k * k * x2, py = q * q * y1 + 2 * q * k * cy + k * k * y2;
      glow(px, py, 60, "#7ff6ff", 0.9); ctx.fillStyle = "#e9ffff"; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
    });
    N.forEach(([x, y], i) => {
      const fire = Math.max(0, Math.sin(t * 3 + i * 1.7)) ** 4;
      glow(x, y, 120 + 60 * fire, "#c9a6ff", 0.5 + 0.4 * fire);
      for (let d = 0; d < 6; d++) { const a = d / 6 * Math.PI * 2 + i; strokePath(() => { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 50, y + Math.sin(a) * 50 + 20, x + Math.cos(a + 0.3) * 95, y + Math.sin(a + 0.3) * 95); }, "#9a7de0", 6); }
      ctx.fillStyle = "#b99bff"; ctx.beginPath(); ctx.arc(x, y, 34, 0, 7); ctx.fill(); ctx.strokeStyle = BC.ink; ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.5 + fire * 0.5; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    });
  },
  // 3. STOMACH: warm folded chamber walls; a bubbling acid pool at the bottom
  stomach(t) {
    vgrad("#ff8a5c", "#ffb347");
    for (let k = 0; k < 7; k++) {  // rugae folds, gently churning
      const y0 = 150 + k * 170, amp = 30 + k * 4;
      ctx.fillStyle = k % 2 ? "#ff9e6b" : "#ff7b55";
      ctx.beginPath(); ctx.moveTo(0, y0);
      for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y0 + Math.sin(x * 0.008 + t * 1.2 + k) * amp);
      ctx.lineTo(W, y0 + 170); ctx.lineTo(0, y0 + 170); ctx.closePath(); ctx.fill();
    }
    const ly = 1380;                  // acid pool
    ctx.fillStyle = "#b6e04a"; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, ly + Math.sin(x * 0.02 + t * 3) * 14 + Math.sin(x * 0.007 - t * 2) * 10);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BC.ink; ctx.lineWidth = 8; ctx.stroke();
    glow(W / 2, ly + 100, 600, "#e7ff7a", 0.4);
    for (let i = 0; i < 28; i++) {    // bubbles rising and popping
      const k = (t * (0.3 + rnd(i, 2) * 0.3) + rnd(i, 3)) % 1, x = rnd(i, 1) * W + Math.sin(t * 3 + i) * 12, y = ly + 380 - k * 520, r = 10 + rnd(i, 4) * 26;
      if (y > ly - 120) { ctx.save(); ctx.globalAlpha = y < ly - 60 ? (y - ly + 120) / 60 : 1; ctx.fillStyle = "#d9f76d"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = BC.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, 7); ctx.fill(); ctx.restore(); }
    }
  },
  // 4. GUT CITY: mint sky; villi hills sway like a forest; microbe crowds on the ridges
  gut(t) {
    vgrad("#5ce1c8", "#c6f7e2");
    for (let i = 0; i < 5; i++) { const x = ((rnd(i, 1) + t * 0.03 * (1 + i % 2)) % 1.2 - 0.1) * W, y = 250 + rnd(i, 2) * 400; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.ellipse(x, y, 120, 40, 0, 0, 7); ctx.ellipse(x + 70, y - 25, 70, 40, 0, 0, 7); ctx.fill(); }
    for (const [row, base, col, h, n] of [[0, 1150, "#f6a6b8", 280, 9], [1, 1350, "#f58aa2", 360, 7], [2, 1600, "#ef6f8b", 460, 5]]) {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) / n * W + (rnd(i, row) - 0.5) * 60, sw = Math.sin(t * 1.5 + i + row) * 18, w = W / n * 0.8;
        part(() => { ctx.moveTo(x - w / 2, base + 40); ctx.bezierCurveTo(x - w / 2, base - h * 0.5, x - w * 0.35 + sw, base - h, x + sw, base - h); ctx.bezierCurveTo(x + w * 0.35 + sw, base - h, x + w / 2, base - h * 0.5, x + w / 2, base + 40); ctx.closePath(); }, col, { hlAt: [x - w * 0.2 + sw, base - h * 0.8, w * 0.2], lw: 6 });
      }
      if (row === 1) for (let j = 0; j < 7; j++) { ctx.save(); ctx.translate(90 + j * 150, 1000 - (j % 2) * 40); ctx.scale(0.45, 0.45); CAST.microbe({ t, seed: j + 1, kind: ["rod", "coccus", "spiral"][j % 3], mood: "happy" }); ctx.restore(); }
    }
    ctx.fillStyle = "#e0587a"; ctx.fillRect(0, 1640, W, 280);
  },
  // 5. SPOTLIGHT: the title / versus stage: saturated colour block, spinning rays, a big radial blob
  spotlight(t) {
    ctx.fillStyle = "#3b1f8f"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(t * 0.25);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? "#4a2aa8" : "#3b1f8f"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1600, i / 16 * Math.PI * 2, (i + 1) / 16 * Math.PI * 2); ctx.fill(); }
    ctx.restore();
    const r = 400 + Math.sin(t * 2) * 12;
    ctx.fillStyle = "#ff5fa2"; ctx.beginPath(); smooth(Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, rr = r * (1 + 0.06 * Math.sin(a * 3 + t * 2)); return [W / 2 + Math.cos(a) * rr, 900 + Math.sin(a) * rr]; })); ctx.fill();
    ctx.strokeStyle = BC.ink; ctx.lineWidth = 10; ctx.stroke();
    for (let i = 0; i < 18; i++) { const k = (t * 0.5 + rnd(i, 1)) % 1, a = rnd(i, 2) * 7; ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(W / 2 + Math.cos(a) * (450 + k * 400), 900 + Math.sin(a) * (450 + k * 400)); ctx.rotate(t + i);
      ctx.fillStyle = [BC.sun, "#7ff6ff", "#fff"][i % 3]; ctx.fillRect(-12, -12, 24, 24); ctx.restore(); }
  },
};

// ---------- scene types: character_dialog, character_explain ----------
// Rig id per cast id (bible cast ids map onto rigs), the rig's visible height and width in units at s = 1, and its default mood.
const RIGS = {
  liver: { kind: "liver", h: 352, w: 400, mood: "tired" },
  brain: { kind: "brain", h: 505, w: 360, mood: "smug" },
  heart: { kind: "heart", h: 480, w: 380, mood: "proud" },
  microbe: { kind: "microbe", h: 120, w: 130, mood: "happy" },
  gut_microbes: { kind: "microbe", h: 120, w: 130, mood: "happy" },
};
const GROUND = 1230;                                   // feet line: above the caption block, below the bubbles
const SPEAK_MIN = 0.35;                                // a speaking character fills at least this share of the frame height
const MAXW = W - SAFE.right - 60;                      // widest a character may be (keeps it out of the right safe zone)
const SCRIPT_PARAS = EP.script.paras || [];
const speakerOf = pid => (SCRIPT_PARAS.find(p => p.id === pid) || {}).speaker;

// size (rig scale) of a character while it speaks: as tall as the rule wants, as wide as the safe area allows
function bigScale(r) { return Math.min(SPEAK_MIN * 1.04 * H / r.h, MAXW * 0.92 / r.w); }

// paragraphs voiced by `id` (script speaker field) inside a scene's time span, with their timeline entries
function spokenBy(S, id) {
  return TL.paras.filter(tp => speakerOf(tp.id) === id && tp.end > S.t0 - 0.3 && tp.start < S.t1 + 0.3);
}
// 0..1: how much `id` is "on the mic" at t (ramps in just before the paragraph, out just after)
function onMic(S, id, t) {
  let lv = 0;
  for (const p of S.mic[id] || []) lv = Math.max(lv, Math.min(prog(t, p.start - 0.2, p.start + 0.05), 1 - prog(t, p.end + 0.05, p.end + 0.35)));
  return eio(lv);
}
// mouth flap only while a word is being said (word times from the voice timeline), closed in the gaps between words
function talkAt(S, id, t) {
  const p = (S.mic[id] || []).find(p => t >= p.start && t <= p.end + 0.05);
  if (!p) return 0;
  let i = -1; p.words.forEach((w, k) => { if (w.t <= t) i = k; });
  if (i < 0) return 0;
  const next = p.words[i + 1] ? p.words[i + 1].t : p.end;
  return t < Math.min(next, p.words[i].t + 0.55) ? flap(t, strSeed(id)) : 0;
}
// the paragraph whose bubble is up at t (last speaker paragraph in the scene's cast that has started)
function bubbleAt(S, t) {
  let best = null;
  for (const id of S.castIds) for (const p of S.mic[id] || []) if (t >= p.start - 0.05 && t <= p.end + 0.4 && (!best || p.start > best.p.start)) best = { p, id };
  return best;
}
function bubbleText(S, pid) {
  if (S.p.bubbles && S.p.bubbles[pid]) return String(S.p.bubbles[pid]);
  const sp = SCRIPT_PARAS.find(p => p.id === pid) || {};
  return String(sp.caps ? sp.caps.map(c => c[0]).join(" ") : sp.say || "").toUpperCase();
}

// the speech bubble: typeset Anton text on a white rounded balloon, tail aimed at the speaker's head. Stays inside the safe zones.
function bubble(str, tipX, tipY, top, k, warnId) {
  if (k <= 0) return;
  const maxW = W - SAFE.right - 60 - 60 - 2 * 44;
  const f = fit(str, maxW, 64, 3, "Anton", "bubble");
  const lh = f.size * 1.12, bw = Math.max(...f.lines.map(l => measure(l, f.size))) + 88, bh = f.lines.length * lh + 64;
  const bx = clamp(tipX - bw / 2, 60, W - SAFE.right - 60 - bw), by = Math.max(top, SAFE.top + 20);
  if (by + bh > tipY - 24) warn(`${warnId}: speech bubble "${str.slice(0, 30)}" collides with the speaker's head; shorten it (bubbles: {para: text})`);
  ctx.save(); ctx.translate(tipX, tipY); ctx.scale(k, k); ctx.translate(-tipX, -tipY);
  const tx = clamp(tipX, bx + 70, bx + bw - 70);
  const path = () => {
    ctx.roundRect(bx, by, bw, bh, 44);
    ctx.moveTo(tx - 34, by + bh - 2); ctx.lineTo(tipX, tipY); ctx.lineTo(tx + 34, by + bh - 2); ctx.closePath();
  };
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowOffsetY = 10; ctx.shadowBlur = 14;
  ctx.beginPath(); path(); ctx.fillStyle = "#fffdf6"; ctx.fill(); ctx.restore();
  ctx.beginPath(); path(); ctx.lineWidth = 8; ctx.strokeStyle = BC.ink; ctx.lineJoin = "round"; ctx.stroke();
  f.lines.forEach((ln, i) => text(ln, bx + bw / 2, by + 32 + i * lh + f.size * 0.86, { size: f.size, color: BC.ink }));
  ctx.restore();
}

function setBackdrop(id, t) { (SETS[id] || SETS.spotlight)(t); }

// validation at load: unknown ids, unknown sets, speaker paragraphs nobody on screen can voice
SC.forEach(S => {
  if (S.type !== "character_dialog" && S.type !== "character_explain") return;
  const ids = S.type === "character_dialog" ? (S.p.cast || []) : [S.p.speaker].filter(Boolean);
  if (!ids.length) warn(`scene ${S.id}: ${S.type} needs ${S.type === "character_dialog" ? "a cast list" : "a speaker"}`);
  if (S.type === "character_dialog" && ids.length > 4) warn(`scene ${S.id}: more than 4 characters do not fit; only the first 4 are drawn`);
  S.castIds = ids.filter(id => RIGS[id] || (warn(`scene ${S.id}: unknown cast id '${id}' (known: ${Object.keys(RIGS).join(", ")})`), false)).slice(0, 4);
  if (!SETS[S.p.setting]) warn(`scene ${S.id}: unknown setting '${S.p.setting}' (known: ${Object.keys(SETS).join(", ")}); drawn as spotlight`);
  S.mic = {}; S.castIds.forEach(id => { S.mic[id] = spokenBy(S, id); });
  TL.paras.forEach(tp => {   // a speaker line inside this scene voiced by someone who is not on screen
    const sp = speakerOf(tp.id);
    if (sp && !S.castIds.includes(sp) && tp.start >= S.t0 && tp.end <= S.t1 + 0.05 && sp !== "narrator") warn(`scene ${S.id}: paragraph '${tp.id}' is spoken by '${sp}', who is not on screen`);
  });
  const first = Math.min(...S.castIds.flatMap(id => S.mic[id].map(p => p.start)), S.t1);
  S.landAt = clamp(first + 0.7, S.t0 + 0.3, S.t1 - 0.1);
  S.castIds.forEach(id => { if (bigScale(RIGS[id]) * RIGS[id].h < SPEAK_MIN * H && S.mic[id].length) warn(`scene ${S.id}: ${id} would fill under ${SPEAK_MIN * 100}% of the frame height when speaking`); });
});

function drawCharacter(S, id, i, x, s, t, lookDir, extra = {}) {
  const r = RIGS[id], o = Object.assign({
    t, seed: 3 + i * 2, mood: (S.p.moods || {})[id] || r.mood, talk: talkAt(S, id, t), look: [lookDir, 0], kind: S.p.microbe_kind || "coccus",
    arms: "rest", beat: r.kind === "heart",
  }, extra);
  char(r.kind, x, GROUND, s, o);
}

SCENE_FNS.character_dialog = (t, S) => {
  setBackdrop(S.p.setting, t);
  const ids = S.castIds, n = ids.length;
  const ANCH = { 1: [470], 2: [345, 640], 3: [190, 470, 750], 4: [150, 350, 590, 800] }[n] || [470];
  const lv = ids.map(id => onMic(S, id, t));
  const sc = ids.map((id, i) => bigScale(RIGS[id]) * lerp(0.75, 1, lv[i]));
  const lead = lv.indexOf(Math.max(...lv));
  const xs = ids.map((id, i) => ANCH[i] + (470 - ANCH[i]) * 0.6 * lv[i]);
  const order = ids.map((_, i) => i).sort((a, b) => lv[a] - lv[b] || a - b);   // the speaker draws in front
  order.forEach(i => {
    const flip = ANCH[i] > 470;                                                 // right-hand characters face left
    const toward = lv[lead] > 0 && i !== lead ? Math.sign(xs[lead] - xs[i]) : 0;
    drawCharacter(S, ids[i], i, xs[i], sc[i], t, (flip ? -1 : 1) * toward * 0.8, { flip, arms: lv[i] > 0.5 && RIGS[ids[i]].kind !== "microbe" ? "hips" : "rest" });
  });
  // a title on the stage (the spotlight opener), until the first bubble takes the space
  const bb = bubbleAt(S, t);
  if (S.p.title) {
    const gone = bb ? 1 - prog(t, bb.p.start - 0.05, bb.p.start + 0.15) : 1;
    withAlpha(gone, () => { ctx.save(); ctx.translate((W - SAFE.right) / 2, 400); const k = 1 + Math.sin(t * 4) * 0.03; ctx.scale(k, k);
      const f = fit(String(S.p.title).toUpperCase(), W - SAFE.right - 140, 130, 2, "Anton", "title");
      f.lines.forEach((l, j) => text(l, 0, (j - (f.lines.length - 1) / 2) * f.size * 1.05 + f.size * 0.36, { size: f.size, color: "#fff", stroke: 20, ink: BC.ink }));
      ctx.restore(); });
  }
  if (bb) {
    const i = ids.indexOf(bb.id), r = RIGS[bb.id];
    const headTop = GROUND - r.h * sc[i] * 0.97;
    bubble(bubbleText(S, bb.p.id), xs[i], headTop - 6, 250, pop(t, bb.p.start - 0.05, 0.3), S.id);
  }
};

// diagram card: a title and, optionally, steps [{label, at}] that pop in on their cues
function diagramCard(t, S) {
  const d = String(S.p.diagram || ""), steps = S.p.steps || [];
  const k = pop(t, evT(S, "reveal", S.t0 + 0.2), 0.35);
  if (k <= 0) return 0;
  const cw = W - SAFE.right - 80, top = SAFE.top + 30, cx0 = 40 + cw / 2;
  const ft = fit(d.toUpperCase(), cw - 80, 64, 2, "Anton", "diagram title");
  const chipH = steps.length ? 92 : 0, gap = 26;
  const chipW = steps.length ? (cw - 60 - gap * (steps.length - 1)) / steps.length : 0;
  const cf = steps.map(s => fit(String(s.label).toUpperCase(), chipW - 30, 56, 2, "Anton", "diagram step"));
  const h = 28 + ft.lines.length * ft.size * 1.05 + (steps.length ? 22 + chipH : 0) + 26;
  ctx.save(); ctx.translate(cx0, top + h / 2); ctx.scale(k, k); ctx.translate(-cx0, -(top + h / 2));
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowOffsetY = 10; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.roundRect(40, top, cw, h, 36); ctx.fillStyle = "#fffdf6"; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.roundRect(40, top, cw, h, 36); ctx.lineWidth = 8; ctx.strokeStyle = BC.ink; ctx.stroke();
  ft.lines.forEach((l, j) => text(l, cx0, top + 22 + j * ft.size * 1.05 + ft.size * 0.85, { size: ft.size, color: BC.ink }));
  steps.forEach((s, j) => {
    const kk = pop(t, cue(s.at), 0.3), x = 70 + j * (chipW + gap), y = top + h - 26 - chipH;
    if (j) withAlpha(clamp(kk), () => line(x - gap + 2, y + chipH / 2, x - 2, y + chipH / 2, BC.ink, 8));
    popIn(x + chipW / 2, y + chipH / 2, kk, () => {
      ctx.beginPath(); ctx.roundRect(-chipW / 2, -chipH / 2, chipW, chipH, 24); ctx.fillStyle = [BC.sun, BC.lymph, BC.bile, BC.flesh][j % 4]; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = BC.ink; ctx.stroke();
      cf[j].lines.forEach((l, m) => text(l, 0, (m - (cf[j].lines.length - 1) / 2) * cf[j].size * 1.05 + cf[j].size * 0.36, { size: cf[j].size, color: BC.ink }));
    });
  });
  ctx.restore();
  return top + h;
}

SCENE_FNS.character_explain = (t, S) => {
  setBackdrop(S.p.setting, t);
  const id = S.castIds[0]; if (!id) return;
  const r = RIGS[id], lv = onMic(S, id, t), s = bigScale(r) * lerp(0.9, 1, lv);
  const cardBottom = diagramCard(t, S);
  const headTop = GROUND - r.h * s;
  if (cardBottom && cardBottom > headTop - 10) warn(`scene ${S.id}: the diagram card (bottom ${Math.round(cardBottom)}px) overlaps the ${id}'s head (top ${Math.round(headTop)}px); use fewer or shorter lines`);
  drawCharacter(S, id, 0, 470 + 30 * lv, s, t, 0.5, { arms: { L: "rest", R: "up" }, flip: false });
};

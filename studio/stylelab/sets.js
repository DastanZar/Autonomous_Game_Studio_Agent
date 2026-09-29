// body-cast animated sets (Flat Cast). Each set is a full-frame background with motion, drawn behind the cast.
// Everything moves as a pure function of t: looping parallax, pulses, bubbles, sways.
"use strict";
function vgrad(c0, c1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function rgrad(x, y, r, c0, c1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
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
    text("pH 1.5", 860, ly + 240, { size: 60, color: "#fff", stroke: 12, ink: BC.ink });  // sample label, would be sourced in production
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
      if (row === 1) for (let j = 0; j < 7; j++) { ctx.save(); ctx.translate(90 + j * 150, 1000 - (j % 2) * 40); ctx.scale(0.45, 0.45); STYLE = "flat"; CAST.microbe({ t, seed: j + 1, kind: ["rod", "coccus", "spiral"][j % 3], mood: "happy" }); ctx.restore(); }
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
const SET_CAST = {
  bloodstream: t => { char("heart", 540, 1350, 0.95, { t, seed: 6, mood: "proud", arms: { L: "up", R: "rest" }, beat: true, talk: flap(t, 6) * (t % 3 < 1.6 ? 1 : 0) }); },
  neurons: t => { char("brain", 540, 1380, 1.0, { t, seed: 5, mood: t % 4 < 2 ? "smug" : "worried", arms: "hips", look: [Math.sin(t), 0] }); },
  stomach: t => { char("liver", 330, 1330, 0.8, { t, seed: 3, mood: "worried", arms: { L: "up", R: "mug" } }); sweat(420, 980, (t % 1.5) / 1.5); },
  gut: t => { char("microbe", 380, 1560, 1.3, { t, seed: 2, kind: "coccus", mood: "angry", talk: flap(t, 2) }); char("microbe", 720, 1560, 1.3, { t, seed: 1, kind: "rod", mood: "happy" }); },
  spotlight: t => { char("liver", 300, 1180, 0.8, { t, seed: 3, mood: "tired", arms: { L: "rest", R: "mug" }, look: [0.8, 0] }); char("brain", 790, 1180, 0.8, { t, seed: 5, flip: true, mood: "smug", arms: "hips", look: [0.7, 0] });
    ctx.save(); ctx.translate(W / 2, 520); const s = 1 + Math.sin(t * 4) * 0.03; ctx.scale(s, s); text("LIVER VS BRAIN", 0, 0, { size: 130, color: "#fff", stroke: 20, ink: BC.ink }); ctx.restore(); },
};
const SET_TITLES = { bloodstream: "1 · BLOODSTREAM", neurons: "2 · NEURON NIGHT", stomach: "3 · STOMACH ACID", gut: "4 · GUT CITY", spotlight: "5 · SPOTLIGHT STAGE" };
for (const k of Object.keys(SETS)) {
  BOARDS["bc_set_" + k] = { dur: 5, still: 2.2, draw: t => {
    STYLE = "flat"; SETS[k](t); SET_CAST[k](t);
    ctx.save(); ctx.font = "34px Anton"; const w = ctx.measureText(SET_TITLES[k]).width + 40; ctx.fillStyle = "rgba(29,27,46,0.75)"; ctx.fillRect(W / 2 - w / 2, 150, w, 56); ctx.restore();
    text(SET_TITLES[k], W / 2, 190, { size: 34, color: "#fff", ls: 3 });
  }};
}

// Why yawns are contagious (and it isn't oxygen). The Brain insists it yawns for oxygen; Provine's tests say no,
// then show yawns spread, even by reading. Organ cast and flat props (body kit), numbers in moving type (kinetic kit).
// Provine is named on a tag, never drawn.
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
// the Brain mid-yawn: heavy lids, mouth wide, arms up in a stretch (k 0..1 = how far into the yawn)
function yawnBrain(x, s, t, k, o = {}) {
  castAt("brain", x, s, t, Object.assign({ mood: k > 0.2 ? "tired" : (o.mood || "smug"), talk: 1.6 * k, arms: k > 0.4 ? "up" : "rest", look: [0, -0.5] }, o.extra || {}));
}
const yawnK = (t, t0, d = 2.2) => { const u = (t - t0) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 0.6; };
// a gas cylinder with a typeset label
function tank(x, y, s, label, col, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5) * 0.02);
  part(() => ctx.roundRect(-80, -360, 160, 360, 70), col, { hlAt: [-40, -300, 26] });
  part(() => ctx.roundRect(-30, -420, 60, 70, 12), "#b9c3cc", { hl: false, lw: 6 });
  part(() => ctx.roundRect(-60, -445, 120, 30, 10), "#8a94a0", { hl: false, lw: 6 });
  part(() => ctx.roundRect(-70, -230, 140, 90, 18), "#fffdf6", { hl: false, lw: 5 });
  text(label, 0, -168, { size: 56, color: BC.ink });
  ctx.restore();
}
// breath puffs leaving a mouth at (x, y), rate = puffs per second
function puffs(x, y, t, rate, col = "#ffffff") {
  for (let i = 0; i < 5; i++) { const a = (t * rate * 0.5 + i / 5) % 1; withAlpha(0.7 * (1 - a), () => part(() => ctx.ellipse(x + a * 220, y - a * 60 + Math.sin(i * 2 + t * 3) * 10, 22 + a * 40, 16 + a * 26, 0, 0, 7), col, { hl: false, lw: 4 })); }
}
// a little TV on a stand, content drawn in screen coordinates (w, h centred)
function tv(x, y, w, h, draw) {
  part(() => ctx.roundRect(x - 20, y + h / 2 + 10, 40, 80, 8), "#3a3550", { hl: false, lw: 6 });
  part(() => ctx.roundRect(x - 140, y + h / 2 + 80, 280, 30, 12), "#3a3550", { hl: false, lw: 6 });
  part(() => ctx.roundRect(x - w / 2 - 34, y - h / 2 - 34, w + 68, h + 68, 40), "#4b4470", { hlAt: [x - w / 2, y - h / 2, 30] });
  ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 20); ctx.clip(); ctx.fillStyle = "#1a1440"; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.translate(x, y); draw(); ctx.restore();
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 20); ctx.lineWidth = 8; ctx.strokeStyle = BC.ink; ctx.stroke();
}
// a grid of small cartoon faces (cast-style eyes), yawning or smiling
function faceGrid(t, kind) {
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = -255 + c * 170, y = -170 + r * 170, seed = r * 4 + c, col = [BC.flesh, BC.neuron, BC.lymph, BC.sun, BC.bile][seed % 5];
    part(() => ctx.arc(x, y, 64, 0, 7), col, { hlAt: [x - 20, y - 24, 14], lw: 5 });
    const y2 = kind === "yawn" ? yawnK(t + seed * 0.37, 0, 1.6 + rnd(seed, 2)) : 0;
    const k = kind === "yawn" ? ((t * 0.7 + rnd(seed, 1)) % 1) : 0;
    castFace({ x, y: y - 10, sz: 34, mood: kind === "yawn" ? "tired" : "happy", look: [0, 0], blink: 0, talk: kind === "yawn" ? 1.4 * Math.sin(Math.PI * k) : 0, body: col });
  }
}
// 100 dots, the first n light up in col after t0 (a share of the subjects)
function dots(t, t0, n, col) {
  for (let i = 0; i < 100; i++) { const c = i % 20, r = Math.floor(i / 20), x = 128 + c * 36, y = 830 + r * 38;
    const kIn = clamp((t - t0 + 0.6 - (c + r) * 0.012) / 0.2), on = i < n && t > t0 + 0.2 + i * 0.008;
    if (kIn <= 0) continue; ctx.globalAlpha = kIn; ctx.fillStyle = on ? col : "#6b5fb0"; ctx.beginPath(); ctx.arc(x, y, on ? 15 : 11, 0, 7); ctx.fill();
    if (on) { ctx.lineWidth = 4; ctx.strokeStyle = BC.ink; ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
// a vertical result bar with a big percentage
function resultBar(x, base, h, pct, t, t0, col, label) {
  const k = eout(clamp((t - t0) / 0.8)), hh = h * pct / 100 * k;
  part(() => ctx.roundRect(x - 90, base - h, 180, h, 24), "#2b2450", { hl: false, lw: 6 });
  if (hh > 4) part(() => ctx.roundRect(x - 90, base - hh, 180, hh, 24), col, { hlAt: [x - 50, base - hh + 20, 14], lw: 6 });
  if (t > t0) text(Math.round(pct * k) + "%", x, base - h - 30, { size: 110, color: "#fff", stroke: 14, ink: BC.ink });
  text(label, x, base + 70, { size: 46, color: "#fff", stroke: 10, ink: BC.ink });
}

CU.hook = (t, S) => {                          // frame 1: the Brain refusing to yawn under the dare
  SETS.spotlight(t);
  const ty = cue("hook/yawn") - 0.1, ts = cue("hook/scientist") - 0.1;
  yawnBrain(470, SB("brain") * 0.8, t, yawnK(t, ty, 2.0) * 0.5, { mood: "worried" });
  stageTitle(t < ts ? "READ THIS. DON'T YAWN." : "A SCIENTIST MEASURED IT", t, 0, 400, 120);
};
CU.myth = (t, S) => {                          // the classic theory on a card, then 'tested'
  SETS.neurons(t);
  const tc = cue("myth/classic") - 0.15, ty = cue("myth/nineteen") - 0.1;
  flatCard(470, 520, 720, 380, -0.03, popK(t, tc), (w, h) => {
    text("THE CLASSIC THEORY", 0, -h / 2 + 76, { size: 56, color: BC.ink });
    text("YAWN = NEED OXYGEN", 0, 30, { size: 78, color: BC.blood });
    text("(everyone, for centuries)", 0, 110, { size: 32, font: "Elite", color: "#6b5a48" });
  });
  castAt("brain", 230, SB("brain") * 0.45, t, { mood: "proud", look: [1, -1], gy: 1090 });
  if (t > ty) stamp("TESTED 1987", 640, 900, t - ty, { size: 84, rot: -0.1, color: BC.blood });
  popIn(560, 1180, popK(t, cue("myth/robert") - 0.1), () => tag("ROBERT PROVINE, PSYCHOLOGIST", 0, 0, { size: 40 }));
};
CU.oxygen = (t, S) => {                        // pure oxygen in, yawns keep coming
  SETS.neurons(t);
  const to = cue("oxygen/oxygen") - 0.3, tk = cue("oxygen/kept") - 0.2;
  tank(760, 1180, 1.1, "O₂", "#7fc8d8", t);
  if (t > to) strokePath(() => { ctx.moveTo(760, 690); ctx.bezierCurveTo(760, 560, 520, 560, 470, 760); }, "#d9f2f7", 14);
  yawnBrain(360, SB("brain") * 0.72, t, t > tk ? yawnK(t, tk, 2.2) : 0);
  popIn(470, 380, popK(t, to), () => tag("100% OXYGEN", 0, 0, { size: 60 }));
  if (t > tk) kText("STILL YAWNING", 470, 540, 100, t, tk, { color: BC.sun, stroke: 14, ink: BC.ink });
};
CU.co2 = (t, S) => {                           // CO2 in: breathing races, yawns don't
  SETS.neurons(t);
  const th = cue("co2/harder") - 0.2, tn = cue("co2/not") - 0.1;
  tank(800, 1180, 1.0, "CO₂", "#9a9aa8", t);
  castAt("brain", 360, SB("brain") * 0.62, t, { mood: "worried", look: [1, 0], talk: t > th ? 0.6 + 0.4 * Math.sin(t * 18) : 0 });
  if (t > th) puffs(420, 860, t, 6);
  popIn(330, 360, popK(t, th), () => tag("BREATHING ▲", 0, 0, { size: 60 }));
  popIn(680, 470, popK(t, tn), () => tag("YAWNS: SAME", 0, 0, { size: 60 }));
};
CU.video = (t, S) => {                         // five minutes of yawning faces; 55% of viewers yawn
  vgrad("#1a1440", "#3b1f8f");
  const tf = cue("video/faces") - 0.2, tn = cue("video/fiftyfive") - 0.15;
  tv(470, 440, 600, 420, () => faceGrid(t, "yawn"));
  popIn(470, 250, popK(t, tf), () => tag("5 MINUTES OF YAWNS", 0, 0, { size: 46 }));
  if (t > tn) { dots(t, tn, 55, BC.sun);
    kText("55% YAWNED", 470, 1150, 110, t, tn + 0.3, { color: BC.sun, stroke: 14, ink: BC.ink }); }
};
CU.smiles = (t, S) => {                        // same set-up with smiles: 21%
  vgrad("#1a1440", "#3b1f8f");
  const tn = cue("smiles/twentyone") - 0.15;
  tv(470, 440, 600, 420, () => faceGrid(t, "smile"));
  popIn(470, 250, popK(t, S.t0), () => tag("5 MINUTES OF SMILES", 0, 0, { size: 46 }));
  if (t > tn) { dots(t, tn, 21, BC.lymph);
    kText("21% YAWNED", 470, 1150, 110, t, tn + 0.3, { color: BC.lymph, stroke: 14, ink: BC.ink }); }
};
CU.read = (t, S) => {                          // reading about yawning vs about hiccups
  SETS.neurons(t);
  const t3 = cue("read/thirty") - 0.15, t1 = cue("read/eleven") - 0.15;
  flatCard(470, 330, 700, 150, 0.02, popK(t, S.t0), (w, h) => { text("READ FOR 5 MINUTES:", 0, 22, { size: 64, color: BC.ink }); });
  resultBar(300, 1100, 520, 30, t, t3, BC.sun, "ABOUT YAWNING");
  resultBar(660, 1100, 520, 11, t, t1, BC.lymph, "ABOUT HICCUPS");
};
CU.half = (t, S) => {                          // a yawn, once started, runs to the end
  SETS.spotlight(t);
  const ts = cue("half/starts") - 0.2, th = cue("half/half") - 0.1;
  yawnBrain(470, SB("brain") * 0.85, t, yawnK(t, ts, 3.4));
  if (t > th) stamp("NO HALF-YAWNS", 470, 400, t - th, { size: 110, rot: -0.08, color: BC.blood });
};

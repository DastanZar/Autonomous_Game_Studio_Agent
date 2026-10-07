// Does swallowed gum stay in you for seven years? (rewrite 2026-10-07) The myth, what really happens, and the
// real risk: habit. Organ cast and flat props (body kit), the big number in moving type (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
CU.hook = (t, S) => {
  SETS.spotlight(t);
  gumBlob(700, 980, 1.1, t, { mood: "smug", look: [-1, 0] });
  castAt("stomach", 270, SB("stomach") * 0.7, t, { mood: t > cue("hook/seven") ? "shocked" : "worried", look: [1, 0] });
  stageTitle(t < cue("hook/seven") - 0.1 ? "SWALLOWED GUM" : "7 YEARS?", t, 0, 420, 150);
};
CU.base = (t, S) => {
  SETS.stomach(t);
  const ts = cue("base/sweeteners") - 0.1, td = cue("base/doesn't") - 0.15;
  gumBlob(560, 820, 1.4, t, { mood: t > td ? "smug" : "happy", sparkle: clamp((t - ts) / 2) });
  popIn(470, 430, popK(t, ts), () => tag("SWEETENERS: DIGESTED", 0, 0, { size: 52 }));
  if (t > td) stamp("GUM BASE: NOPE", 520, 1100, t - td, { size: 92, rot: -0.08, color: BC.blood });
};
CU.empty = (t, S) => {
  SETS.stomach(t);
  const t2 = cue("empty/two") - 0.3, k = eio(clamp((t - t2) / 1.4));
  clockRing(760, 560, 170, k, k > 0 ? "≤ " + Math.round(k * 120) + " MIN" : "");
  castAt("stomach", 300, SB("stomach") * 0.8, t, { mood: "tired" });
  const tr = cue("empty/rides") - 0.3, g = clamp((t - tr) / 1.6);
  if (t < tr) gumBlob(330, 980, 0.45, t, { mood: "happy" });
  else { tube([[300, 1080], [600, 1120], [900, 1060], [1140, 1100]], 90, "#f58aa2", t, 1.2); gumBlob(lerp(330, 1000, eio(g)), lerp(1060, 1060, g), 0.4, t, { mood: "happy" }); sandwich(lerp(200, 870, eio(g)), 1090, 0.3, t); }
};
CU.doctors = (t, S) => {
  SETS.spotlight(t);
  const tw = cue("week/week") - 0.15;
  bigNumber(t, S.t0 + 0.2, { value: 7, suffix: " YEARS", label: "THE MYTH", stroke: 18, size: 220, y: 560, roll: 0.6, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  if (t > tw) { const k = eio(clamp((t - tw) / 0.35)); ctx.save(); ctx.strokeStyle = BC.blood; ctx.lineCap = "round"; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(150, 600); ctx.lineTo(150 + 780 * k, 400); ctx.stroke(); ctx.restore();
    kText("< 1 WEEK", W / 2 - 40, 900, 170, t, tw + 0.2, { color: "#b5e05a", stroke: 18, ink: BC.ink }); }
  castAt("microbe", 760, 1.5, t, { mood: "happy", mkind: "rod" });
};
CU.catch = (t, S) => {                          // the case file
  SETS.spotlight(t);
  flatCard(470, 640, 720, 560, -0.03, popK(t, S.t0), (w, h) => {
    ctx.fillStyle = BC.blood; ctx.fillRect(-w / 2, -h / 2, w, 90); text("CASE REPORT", 0, -h / 2 + 64, { size: 56, color: "#fff" });
    text("Pediatrics, 1998", 0, -h / 2 + 150, { size: 40, font: "Elite", color: BC.ink });
    text("Children who swallowed", 0, -10, { size: 40, font: "Elite", color: BC.ink }); text("gum every day", 0, 45, { size: 40, font: "Elite", color: BC.ink });
    if (t > cue("catch/kids") - 0.1) stamp("2 KIDS", 0, 170, t - cue("catch/kids") + 0.1, { size: 90, rot: -0.08, color: BC.blood });
  });
};
CU.reward = (t, S) => {                         // a gold star, a piece of gum, gulp; again, and again
  SETS.stomach(t);
  castAt("stomach", 300, SB("stomach") * 0.75, t, { mood: "worried", look: [1, -1] });
  const n = Math.floor(clamp((t - S.t0) / 2.6) * 6);
  for (let i = 0; i < 6; i++) { const t0 = S.t0 + i * 0.42, k = clamp((t - t0) / 0.42);
    if (k <= 0) continue; const y = lerp(380, 860, eio(k)); if (k < 1) gumBlob(760, y, 0.32, t, { mood: "happy" });
    if (k < 0.6) text("★", 860, y - 60, { size: 70, color: BC.sun, stroke: 8, ink: BC.ink }); }
  for (let i = 0; i < n; i++) gumBlob(560 + (i % 3) * 60, 1150 - Math.floor(i / 3) * 50, 0.28, t, { mood: "neutral" });
  popIn(720, 1180, popK(t, cue("catch/reward") - 0.1), () => tag("GUM AS A REWARD", 0, 0, { size: 44 }));
};
CU.mass = (t, S) => {                           // it builds into a lump; the lump comes out
  SETS.stomach(t);
  const tp = cue("mass/pulled") - 0.2, grow = eout(clamp((t - S.t0) / 1.6)), out = eio(clamp((t - tp) / 0.8));
  ctx.save(); ctx.translate(470, lerp(820, 300, out)); ctx.rotate(out * 0.4);
  const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283, r = (120 + 120 * grow) * (1 + 0.12 * Math.sin(a * 5 + t)); pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.8]); }
  part(() => smooth(pts), "#e88fb4", { hlAt: [-60, -60, 30] }); for (let i = 0; i < 8; i++) strokePath(() => ctx.arc((rnd(i, 1) - 0.5) * 200, (rnd(i, 2) - 0.5) * 150, 30, 0.3, 2.4), shade("#e88fb4", -0.2), 5);
  ctx.restore();
  if (out > 0) { strokePath(() => { ctx.moveTo(470, lerp(820, 300, out) - 200); ctx.lineTo(470, -20); }, BC.ink, 10); }
  popIn(470, 1180, popK(t, cue("mass/lump") - 0.1), () => tag("A TAFFY-LIKE LUMP", 0, 0, { size: 48 }));
  if (t > tp + 0.5) stamp("REMOVED", 520, 900, t - tp - 0.5, { size: 100, rot: -0.1, color: BC.blood });
};
CU.coins = (t, S) => {                          // four coins glued into one blob
  SETS.spotlight(t);
  const tg = cue("coins/glued") - 0.2, k = eio(clamp((t - tg) / 0.8));
  const home = [[260, 560], [700, 540], [300, 1000], [720, 980]];
  if (k > 0.5) { const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283, r = 210 * (1 + 0.1 * Math.sin(a * 4 + t)); pts.push([470 + Math.cos(a) * r, 770 + Math.sin(a) * r * 0.85]); } withAlpha((k - 0.5) * 2, () => part(() => smooth(pts), "#f59ac0", { hlAt: [400, 680, 30] })); }
  home.forEach(([x, y], i) => coin(lerp(x, 420 + (i % 2) * 100, k), lerp(y, 720 + Math.floor(i / 2) * 100, k), 80, t * 0.5 + i));
  popIn(470, 330, popK(t, cue("coins/four") - 0.1), () => tag("4 COINS + GUM = 1 BLOB", 0, 0, { size: 48 }));
};

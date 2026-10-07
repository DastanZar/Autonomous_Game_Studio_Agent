// Your gut isn't the size of a tennis court: follow the lunch. (rewrite 2026-10-07) A relay through the cast,
// ending on the corrected number. Organ cast and flat props (body kit), the big number in moving type (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
const PX = 26;                                       // px per metre for the courts (tennis doubles 23.77 x 10.97 m)
function courts(t, kT, kB, cy) {                     // a tennis court and half a badminton court, to the same scale
  court(470, cy, 10.97, 23.77, PX, "#4f8f5a", true, kT);
  court(470, cy + 23.77 * PX / 2 - 6.7 * PX / 2, 6.1, 6.7, PX, "#e9a23b", false, kB);
}
CU.hook = (t, S) => {
  SETS.spotlight(t);
  courts(t, popK(t, cue("hook/tennis") - 0.3), 0, 800);
  sandwich(470, 1060, 1.1, t);
  stageTitle(t < cue("hook/tennis") - 0.2 ? "HOW BIG IS YOUR GUT INSIDE?" : "A TENNIS COURT?", t, 0, 380, 110);
};
CU.door = (t, S) => {                                // follow the lunch; a ring of muscle opens
  SETS.stomach(t);
  const to = cue("door/ring") - 0.1, k = eio(clamp((t - to) / 0.6));
  ctx.save(); ctx.translate(470, 820);
  part(() => { ctx.ellipse(0, 0, 330, 130, 0, 0, 7); ctx.ellipse(0, 0, lerp(40, 220, k), lerp(14, 86, k), 0, 0, 7, true); }, "#d65a6e", { hlAt: [-200, -60, 30] });
  ctx.restore();
  const d = clamp((t - to - 0.3) / 1.2); if (d < 1) sandwich(470, lerp(450, 1000, eio(d)) + Math.sin(t * 6) * (1 - d) * 10, lerp(0.8, 0.4, d), t);
  popIn(470, 330, popK(t, to), () => tag("A RING OF MUSCLE OPENS", 0, 0, { size: 52 }));
};
CU.churn = (t, S) => {
  SETS.stomach(t);
  const tf = cue("churn/four") - 0.2, k = eio(clamp((t - tf) / 1.4));
  castAt("stomach", 330, SB("stomach") * 0.85, t, { mood: "tired", arms: "up" });
  clockRing(780, 560, 160, k * 0.9, k > 0 ? "4–5 HOURS" : "");
  for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.3; part(() => ctx.arc(330 + Math.cos(a) * 60, 1010 + Math.sin(a) * 30, 14, 0, 7), "#e9b36a", { hl: false, lw: 4 }); }
};
CU.bile = (t, S) => {                                // the liver squirts bile; the fat splits into droplets
  SETS.stomach(t);
  const tb = cue("bile/bile") - 0.2, td = cue("bile/droplets") - 0.5;
  castAt("liver", 270, SB("liver") * 0.6, t, { mood: "tired", arms: { L: "rest", R: "point" } });
  if (t > tb) for (let i = 0; i < 10; i++) { const a = ((t - tb) * 1.2 + i / 10) % 1; withAlpha(1 - a * 0.3, () => part(() => ctx.ellipse(lerp(420, 700, a), 760 - Math.sin(a * Math.PI) * 140, 14, 18, 0, 0, 7), BC.bile, { hl: false, lw: 4 })); }
  fatBlob(760, 820, 120, clamp((t - td) / 1.0), t);
  popIn(760, 600, popK(t, cue("bile/fat") - 0.1), () => tag("FAT", 0, 0, { size: 48 }));
  const tc = cue("bile/eight") - 0.2; if (t > tc) { rollNumber(800 * eout(clamp((t - tc) / 0.8)), 470, 420, 120, { color: BC.bile, stroke: 12, ink: BC.ink, fmt: v => "≤" + Math.round(v) + " ml" }); kText("OF BILE A DAY", 470, 480, 46, t, tc + 0.2, { color: "#fff", stroke: 8, ink: BC.ink }); }
};
CU.folds = (t, S) => {                               // inside the small intestine: folds, villi, food soaked up
  SETS.gut(t);
  for (let i = 0; i < 14; i++) { const a = (t * 0.6 + i / 14) % 1, x = 80 + rnd(i, 1) * 860, y = lerp(300, 1050, a);
    withAlpha(1 - Math.max(0, a - 0.8) * 5, () => part(() => ctx.arc(x + Math.sin(t * 2 + i) * 20, y, 12 + rnd(i, 2) * 10, 0, 7), "#e9b36a", { hl: false, lw: 4 })); }
  popIn(470, 330, popK(t, cue("folds/small") - 0.1), () => tag("SMALL INTESTINE", 0, 0, { size: 56 }));
  popIn(470, 460, popK(t, cue("folds/fingers") - 0.1), () => tag("FOLDS + TINY FINGERS (VILLI)", 0, 0, { size: 42 }));
};
CU.area = (t, S) => {                                // the one big number, then the two courts to scale
  SETS.spotlight(t);
  const tn = cue("area/thirty") - 0.2, tt = cue("area/tennis") - 0.2, tb = cue("area/badminton") - 0.3;
  if (t < tt) bigNumber(t, tn, { value: 30, suffix: " m²", label: "UNFOLDED", stroke: 18, size: 240, y: 620, roll: 0.7, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  else { courts(t, popK(t, tt), popK(t, tb), 760);
    if (t > tt + 0.1) { ctx.save(); ctx.strokeStyle = BC.blood; ctx.lineWidth = 22; ctx.lineCap = "round"; const k = eio(clamp((t - tt - 0.1) / 0.35)); ctx.beginPath(); ctx.moveTo(470 - 200, 760 - 260); ctx.lineTo(470 - 200 + 400 * k, 760 - 260 + 520 * k); ctx.stroke(); ctx.restore(); }
    if (t > tb) popIn(470, 1150, popK(t, tb + 0.2), () => tag("½ BADMINTON COURT ≈ 30 m²", 0, 0, { size: 44 })); }
};
CU.water = (t, S) => {
  SETS.gut(t);
  tube([[-60, 640], [300, 580], [700, 640], [1140, 580]], 200, "#e98a6c", t, 0.5);
  const tw = cue("water/water") - 0.2;
  if (t > tw) for (let i = 0; i < 14; i++) { const a = ((t - tw) * 0.8 + i / 14) % 1, x = 80 + i * 66; withAlpha(1 - a, () => part(() => { const y = 560 - a * 300; ctx.moveTo(x, y - 30); ctx.quadraticCurveTo(x + 20, y, x, y + 14); ctx.quadraticCurveTo(x - 20, y, x, y - 30); }, BC.lymph, { hl: false, lw: 5 })); }
  const tb = cue("water/bacteria") - 0.2;
  for (let i = 0; i < 4; i++) { const k = popK(t, tb + i * 0.12); if (k <= 0) continue; ctx.save(); ctx.translate(220 + i * 180, 1050); ctx.scale(k, k); CAST.microbe({ t, seed: i + 1, kind: ["rod", "coccus", "spiral", "rod"][i], mood: "happy", look: [0, -1] }); ctx.restore(); }
  popIn(470, 330, popK(t, cue("water/large") - 0.1), () => tag("LARGE INTESTINE: WATER BACK", 0, 0, { size: 46 }));
};
CU.toll = (t, S) => {
  SETS.spotlight(t);
  courts(t, 1, 1, 720);
  castAt("stomach", 230, SB("stomach") * 0.5, t, { mood: "proud" });
  castAt("liver", 750, SB("liver") * 0.4, t, { mood: "tired", flip: true });
  stageTitle("HALF A BADMINTON COURT", t, S.t0, 300, 90);
};

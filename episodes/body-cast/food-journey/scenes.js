// Where your lunch goes. Gut Gang house method: organ cast and flat props (body kit), moving type for the one big
// number (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
CU.hook = (t, S) => {
  SETS.spotlight(t);
  bigNumber(t, cue("hook/nine") - 0.15, { value: 9, suffix: " METERS", label: "MOUTH TO EXIT", stroke: 18, size: 210, y: 520, roll: 0.7, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  sandwich(540, 1020, 1.5, t);
  if (t < cue("hook/nine") - 0.15) stageTitle("WHERE DOES LUNCH GO?", t, 0, 420, 120);
};
CU.door = (t, S) => {                          // the ring of muscle opens, the lunch drops through
  SETS.stomach(t);
  const to = cue("door/opens") - 0.1, k = eio(clamp((t - to) / 0.6));
  ctx.save(); ctx.translate(540, 760);
  part(() => { ctx.ellipse(0, 0, 330, 130, 0, 0, 7); ctx.ellipse(0, 0, lerp(40, 220, k), lerp(14, 86, k), 0, 0, 7, true); }, "#d65a6e", { hlAt: [-200, -60, 30] });
  ctx.restore();
  const d = clamp((t - to - 0.3) / 1.2); if (d < 1) sandwich(540, lerp(470, 980, eio(d)), lerp(0.7, 0.4, d), t);
  popIn(540, 420, popK(t, cue("door/ring") - 0.1), () => tag("A RING OF MUSCLE", 0, 0, { size: 62 }));
};
CU.churn = (t, S) => {
  SETS.stomach(t);
  const tf = cue("churn/four") - 0.2, k = eio(clamp((t - tf) / 1.4));
  castAt("stomach", 330, SB("stomach") * 0.85, t, { mood: "tired", arms: "up" });
  clockRing(780, 640, 170, k * 0.9, k > 0 ? "4–5 HOURS" : "");
};
CU.small = (t, S) => {                         // a long coiled tube, 22 feet, about 4 hours
  SETS.gut(t);
  const pts = []; for (let i = 0; i < 7; i++) pts.push([i % 2 ? 900 : 160, 560 + i * 80]);
  tube(pts, 80, "#f6a6b8", t, 1.4);
  popIn(400, 330, popK(t, cue("small/twentytwo") - 0.1), () => tag("SMALL INTESTINE · 22 FT", 0, 0, { size: 50 }));
  const tf = cue("four/four") - 0.2; if (t > tf) clockRing(860, 380, 95, eio(clamp((t - tf) / 1.2)) * 0.67, "≈ 4 HOURS");
};
CU.water = (t, S) => {
  SETS.gut(t);
  tube([[-60, 700], [300, 640], [700, 700], [1140, 640]], 200, "#e98a6c", t, 0.5);
  const tw = cue("water/water") - 0.2;
  if (t > tw) for (let i = 0; i < 14; i++) { const a = ((t - tw) * 0.8 + i / 14) % 1, x = 80 + i * 66; withAlpha(1 - a, () => part(() => { const y = 620 - a * 340; ctx.moveTo(x, y - 30); ctx.quadraticCurveTo(x + 20, y, x, y + 14); ctx.quadraticCurveTo(x - 20, y, x, y - 30); }, BC.lymph, { hl: false, lw: 5 })); }
  popIn(540, 1040, popK(t, cue("water/large") - 0.1), () => tag("LARGE INTESTINE: WATER OUT", 0, 0, { size: 56 }));
};

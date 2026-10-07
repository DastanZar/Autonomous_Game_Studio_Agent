// Your brain: 2% of your weight, 20% of your energy. Gut Gang house method: organ cast and flat props (body kit),
// moving type for the one big number (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
CU.hook = (t, S) => {                          // a seesaw: the small brain outweighs the energy budget
  SETS.spotlight(t);
  const tf = cue("hook/fifth") - 0.15, tilt = 0.12 * eio(clamp((t - tf) / 0.6));
  ctx.save(); ctx.translate(470, 1180); part(() => { ctx.moveTo(-60, 60); ctx.lineTo(0, -20); ctx.lineTo(60, 60); ctx.closePath(); }, "#ffd23f", { hl: false });
  ctx.rotate(tilt); part(() => ctx.roundRect(-420, -40, 840, 26, 12), "#fffdf6", { hl: false }); ctx.restore();
  castAt("brain", 470 - 230 * Math.cos(tilt), SB("brain") * 0.62, t, { gy: 1140 - 230 * Math.sin(tilt), mood: "smug" });
  if (t < cue("hook/two") - 0.1) stageTitle("YOUR BRAIN'S ENERGY BILL", t, 0, 420, 120);
  popIn(470, 330, popK(t, cue("hook/two") - 0.1), () => tag("2% OF YOUR WEIGHT", 0, 0, { size: 56 }));
  bigNumber(t, tf, { value: 20, suffix: "%", label: "OF YOUR ENERGY", stroke: 18, size: 260, y: 760, roll: 0.6, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
};
CU.share = (t, S) => {
  SETS.neurons(t);
  meter(270, 560, 150, 20, t, cue("oxygen/twenty") - 0.2, BC.lymph, "OXYGEN");
  meter(730, 560, 150, 25, t, cue("glucose/quarter") - 0.2, BC.sun, "GLUCOSE");
  meter(500, 1000, 150, 15, t, cue("blood/fifteen") - 0.2, BC.blood, "HEART'S OUTPUT");
};
CU.myth = (t, S) => {                          // every region lights up; the myth gets stamped
  SETS.neurons(t);
  const tt = cue("myth/ten") - 0.1;
  castAt("brain", 470, SB("brain"), t, { mood: "angry", arms: "hips" });
  for (let i = 0; i < 18; i++) { const a = (t * 1.6 + rnd(i, 2)) % 1, x = 470 + (rnd(i, 3) - 0.5) * 380, y = GROUND - SB("brain") * (300 + (rnd(i, 4) - 0.5) * 220); withAlpha(1 - a, () => { ctx.fillStyle = "#fff59a"; ctx.beginPath(); ctx.arc(x, y, 10 + a * 26, 0, 7); ctx.fill(); }); }
  if (t > tt) stamp("10%? MYTH", 470, 420, t - tt, { size: 120, rot: -0.1, color: BC.blood });
};

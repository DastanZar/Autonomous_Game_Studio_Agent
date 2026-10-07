// Your brain runs on 12 watts, and never turns off. (rewrite 2026-10-07) Organ cast and flat props (body kit),
// the big number in moving type (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
CU.hook = (t, S) => {                          // a seesaw: the small brain outweighs a fifth of the energy budget
  SETS.spotlight(t);
  const tf = cue("hook/fifth") - 0.15, tilt = 0.12 * eio(clamp((t - tf) / 0.6));
  ctx.save(); ctx.translate(470, 1180); part(() => { ctx.moveTo(-60, 60); ctx.lineTo(0, -20); ctx.lineTo(60, 60); ctx.closePath(); }, "#ffd23f", { hl: false });
  ctx.rotate(tilt); part(() => ctx.roundRect(-420, -40, 840, 26, 12), "#fffdf6", { hl: false });
  for (let i = 0; i < 5; i++) { const k = popK(t, tf + i * 0.08); if (k > 0) { ctx.save(); ctx.translate(200 + (i % 3) * 60, -90 - Math.floor(i / 3) * 70); ctx.scale(k, k); text("⚡", 0, 0, { size: 70, color: BC.sun, stroke: 8, ink: BC.ink }); ctx.restore(); } }
  ctx.restore();
  castAt("brain", 470 - 230 * Math.cos(tilt), SB("brain") * 0.62, t, { gy: 1140 - 230 * Math.sin(tilt), mood: "smug" });
  if (t < cue("hook/two") - 0.1) stageTitle("YOUR BRAIN'S ENERGY BILL", t, 0, 420, 120);
  else { popIn(470, 360, popK(t, cue("hook/two") - 0.1), () => tag("2% OF YOUR WEIGHT", 0, 0, { size: 56 })); if (t > tf) kText("20% OF YOUR ENERGY", 470, 560, 90, t, tf, { color: BC.sun, stroke: 12, ink: BC.ink }); }
};
CU.share = (t, S) => {
  SETS.neurons(t);
  meter(270, 600, 150, 20, t, cue("bill/twenty") - 0.2, BC.lymph, "OXYGEN");
  meter(670, 600, 150, 25, t, cue("bill/quarter") - 0.2, BC.sun, "GLUCOSE");
};
CU.watts = (t, S) => {                         // the one big number: 12 watts, and an old bulb
  vgrad("#1a1440", "#3a2a7a");
  const tw = cue("watts/twelve") - 0.15, tb = cue("watts/bulb") - 0.3;
  bigNumber(t, tw, { value: 12, suffix: " W", label: "TO RUN A BRAIN", stroke: 18, size: 240, y: 520, roll: 0.6, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  bulb(470, 1100, 1.4, 0.25 + 0.1 * Math.sin(t * 7) * (t > tb ? 1 : 0) + (t > tb ? 0.15 : 0), t);
  if (t > tb) popIn(470, 1190, popK(t, tb), () => tag("= 1/5 OF AN OLD 60 W BULB", 0, 0, { size: 44 }));
};
CU.hard = (t, S) => {                          // thinking hard: the meter barely moves
  SETS.neurons(t);
  castAt("brain", 300, SB("brain") * 0.7, t, { mood: "worried" });
  for (let i = 0; i < 3; i++) { const a = (t * 1.2 + i / 3) % 1; withAlpha(1 - a, () => part(() => ctx.ellipse(380 + i * 30, 640 - a * 120, 10, 16, 0, 0, 7), BC.lymph, { hl: false, lw: 4 })); }
  const x0 = 560, y0 = 450, h = 600, w = 260, extra = 0.04 * eout(clamp((t - cue("hard/barely") + 0.3) / 0.6));
  flatCard(x0 + 40 + w / 2, y0 + h / 2, w + 80, h + 160, 0, 1, () => {}, {});
  ctx.fillStyle = "#3b6fd0"; ctx.fillRect(x0 + 40, y0 + h * 0.15, w, h * 0.85); ctx.fillStyle = BC.blood; ctx.fillRect(x0 + 40, y0 + h * (0.15 - extra), w, h * extra);
  text("RESTING", x0 + 40 + w / 2, y0 + h * 0.6, { size: 50, color: "#fff" }); text("+ THINKING HARD", x0 + 40 + w / 2, y0 + h * 0.15 - h * extra - 16, { size: 34, color: BC.blood });
};
CU.on = (t, S) => {                            // most of the cost is staying switched on
  vgrad("#1a1440", "#3a2a7a");
  bulb(470, 1000, 1.3, 0.85 + 0.05 * Math.sin(t * 9), t);
  const k = popK(t, cue("on/switched") - 0.2);
  flatCard(470, 380, 360, 170, 0, k, () => { part(() => ctx.roundRect(-90, -40, 180, 80, 40), "#5f9e3a", { hl: false, lw: 6 }); part(() => ctx.arc(50, 0, 32, 0, 7), "#fff", { hl: false, lw: 5 }); text("ON", -30, 14, { size: 40, color: "#fff" }); });
};
CU.myth = (t, S) => {
  SETS.neurons(t);
  const tt = cue("myth/ten") - 0.1;
  castAt("brain", 470, SB("brain"), t, { mood: "angry", arms: "hips" });
  for (let i = 0; i < 18; i++) { const a = (t * 1.6 + rnd(i, 2)) % 1, x = 470 + (rnd(i, 3) - 0.5) * 380, y = GROUND - SB("brain") * (300 + (rnd(i, 4) - 0.5) * 220); withAlpha(1 - a, () => { ctx.fillStyle = "#fff59a"; ctx.beginPath(); ctx.arc(x, y, 10 + a * 26, 0, 7); ctx.fill(); }); }
  if (t > tt) stamp("10%? MYTH", 470, 420, t - tt, { size: 120, rot: -0.1, color: BC.blood });
  if (t > cue("myth/pay") - 0.2) popIn(470, 1230, popK(t, cue("myth/pay") - 0.2), () => tag("YOU PAY FOR 100%", 0, 0, { size: 48 }));
};

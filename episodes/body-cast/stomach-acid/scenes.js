// Why doesn't your stomach digest itself? (rewrite 2026-10-07) The organ cast tells it: acid, a snot raincoat,
// the corkscrew bacterium, and the doctor who drank it (shown only as a beaker and a hand: no likeness).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
function zincNut(x, y, s, melt, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - melt * 0.6), s * (1 - melt * 0.75)); ctx.rotate(t * 0.6);
  part(() => { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; i ? ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 90) : ctx.moveTo(Math.cos(a) * 90, Math.sin(a) * 90); } ctx.closePath(); ctx.moveTo(40, 0); ctx.arc(0, 0, 40, 0, 7, true); }, "#b9c3cc", { hlAt: [-30, -40, 20] });
  ctx.restore();
  for (let i = 0; i < 10; i++) { const a = (t * 1.3 + i / 10) % 1; withAlpha((1 - a) * Math.min(1, melt * 4), () => { ctx.fillStyle = "#d9f76d"; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2.3) * 90, y - a * 260, 8 + i % 3 * 5, 0, 7); ctx.fill(); }); }
}
// the lining up close: cells, mucus gel, acid drops bouncing off; drill = 0..1 for the corkscrew bacterium
function lining(t, gel, o = {}) {
  vgrad("#5a0f2e", "#a3244a");
  const wallY = 1000;
  for (let i = 0; i < 9; i++) { const w = 120, x = 20 + i * 120;
    part(() => ctx.roundRect(x, wallY, w - 6, 260, 26), BC.stomach, { hlAt: [x + 30, wallY + 40, 16] });
    castFace({ x: x + w / 2, y: wallY + 120, sz: 30, mood: o.mood || "worried", look: [0, -1], blink: castBlinkAt(t, i), talk: 0, body: BC.stomach }); }
  if (gel > 0) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = "#b5e05a"; ctx.beginPath(); ctx.moveTo(0, wallY + 10); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, wallY - gel * 170 + Math.sin(x * 0.02 + t * 2) * 14); ctx.lineTo(W, wallY + 10); ctx.closePath(); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = BC.ink; ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 12; i++) { const p = (t * 0.55 + rnd(i, 3)) % 1, x = 60 + rnd(i, 4) * 860, floor = wallY - 20 - gel * 170;
    const y = p < 0.7 ? lerp(300, floor, p / 0.7) : floor - Math.sin((p - 0.7) / 0.3 * Math.PI) * 120;
    part(() => { ctx.moveTo(x, y - 34); ctx.quadraticCurveTo(x + 24, y, x, y + 16); ctx.quadraticCurveTo(x - 24, y, x, y - 34); }, "#e8ff6a", { hl: false, lw: 5 }); }
  if (o.drill != null) { const d = eio(o.drill), x = lerp(-120, 520, d), y = lerp(500, wallY - 60, d);
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.5); ctx.scale(2.2, 2.2); CAST.microbe({ t, seed: 2, kind: "spiral", mood: "smug", look: [1, 0.5], hop: 0 }); ctx.restore(); }
}
CU.hook = (t, S) => {
  SETS.spotlight(t);
  castAt("stomach", 300, SB("stomach") * 0.8, t, { mood: t > cue("hook/so") ? "shocked" : "worried", look: [1, 0] });
  zincNut(760, 900, 0.9, clamp((t - cue("hook/zinc") + 0.2) / 2.2), t);
  stageTitle(t < cue("hook/so") - 0.1 ? "STOMACH ACID VS ZINC" : "SO WHY NOT YOUR STOMACH?", t, 0, 400, 110);
};
CU.mucus = (t, S) => {
  lining(t, eio(clamp((t - cue("mucus/mucus") + 0.1) / 0.8)));
  popIn(330, 380, popK(t, cue("mucus/mucus") - 0.1), () => tag("MUCUS LAYER", 0, 0, { size: 60 }));
  popIn(560, 500, popK(t, cue("mucus/bicarbonate") - 0.1), () => tag("+ BICARBONATE (A BASE)", 0, 0, { size: 52 }));
};
CU.coat = (t, S) => {
  SETS.stomach(t);
  const s = SB("stomach"), k = popK(t, cue("coat/raincoat") - 0.2);
  castAt("stomach", 470, s, t, { mood: "proud", arms: "hips" });
  if (k > 0) { ctx.save(); ctx.translate(470, GROUND); ctx.scale(s, s * k);
    part(() => { ctx.moveTo(-190, -400); ctx.quadraticCurveTo(-170, -530, -30, -540); ctx.quadraticCurveTo(140, -540, 170, -400); ctx.quadraticCurveTo(60, -470, -30, -470); ctx.quadraticCurveTo(-120, -470, -190, -400); ctx.closePath(); }, "#ffd23f", { hlAt: [-100, -510, 20] });
    part(() => { ctx.moveTo(-200, -260); ctx.quadraticCurveTo(-20, -230, 190, -270); ctx.lineTo(230, -150); ctx.quadraticCurveTo(0, -110, -230, -150); ctx.closePath(); }, "#ffd23f", { hlAt: [-120, -230, 20] });
    for (const bx of [-60, 40]) part(() => ctx.arc(bx, -200, 12, 0, 7), BC.ink, { hl: false, lw: 3 });
    ctx.restore(); }
  // the snot is green, and it drips
  for (let i = 0; i < 4; i++) { const a = (t * 0.7 + i / 4) % 1; withAlpha(1 - a, () => part(() => ctx.ellipse(330 + i * 90, 900 + a * 260, 10, 16, 0, 0, 7), "#b5e05a", { hl: false, lw: 4 })); }
};
CU.turn = (t, S) => {
  lining(t, 1, { mood: t > cue("turn/corkscrews") ? "shocked" : "proud", drill: clamp((t - cue("turn/corkscrews") + 0.4) / 2.2) });
  popIn(540, 380, popK(t, cue("turn/bacterium") - 0.1), () => tag("ONE BACTERIUM GETS THROUGH", 0, 0, { size: 48 }));
};
CU.blame = (t, S) => {
  SETS.spotlight(t);
  const ts = cue("blame/stress") - 0.15, tp = cue("blame/spicy") - 0.15;
  flatCard(470, 560, 640, 420, -0.03, popK(t, S.t0), (w, h) => {
    text("WHAT CAUSES ULCERS?", 0, -h / 2 + 70, { size: 52, color: BC.ink });
    text("(the old answer)", 0, -h / 2 + 115, { size: 30, font: "Elite", color: "#6b5a48" });
    if (t > ts) text("✔ STRESS", -200, -10, { size: 62, align: "left", color: BC.blood });
    if (t > tp) text("✔ SPICY FOOD", -200, 90, { size: 62, align: "left", color: BC.blood });
  }, { bg: "#fffdf6", tape: false });
  castAt("brain", 250, SB("brain") * 0.55, t, { mood: "worried", look: [1, -1] });
  if (t > tp) for (let i = 0; i < 3; i++) chili(640 + i * 90, 1080 - i * 30 + Math.sin(t * 3 + i) * 8, 0.9 * popK(t, tp + i * 0.1), -0.3 + i * 0.2);
};
CU.drank = (t, S) => {
  vgrad("#1d3b4f", "#2c6a7a");
  for (let i = 0; i < 6; i++) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(i * 200, 0, 90, H); }
  part(() => ctx.rect(-20, 1080, W + 40, 60), "#8b6b4a", { hl: false });               // the lab bench
  const td = cue("drank/drank") - 0.2, lift = eio(clamp((t - td) / 0.6)), drain = clamp((t - td - 0.4) / 1.2);
  beaker(470, lerp(1080, 760, lift), 1.35, -lift * 1.3, 1 - drain, t);
  // the hand: a plain cartoon sleeve and hand, no face
  if (t > td + 0.3) stamp("GULP", 720, 640, t - td - 0.3, { size: 110, rot: -0.1, color: BC.blood });
  for (let i = 0; i < 3; i++) if (lift > 0.2 && lift < 1) line(300 - i * 40, 900 + i * 50, 240 - i * 40, 860 + i * 50, "rgba(255,255,255,0.6)", 6);
  stageTitle("JULY 1984", t, S.t0 + 0.1, 330, 100);
  popIn(470, 1300 - 60, popK(t, cue("drank/barry") - 0.1), () => tag("H. PYLORI, CULTURED", 0, 0, { size: 40 }));
};
CU.sick = (t, S) => {
  SETS.stomach(t);
  const tk = cue("sick/sick") - 0.2, ts = clamp((t - tk) / 0.8);
  ctx.save(); ctx.globalAlpha = 0.35 * ts; ctx.fillStyle = "#9bb63a"; ctx.fillRect(0, 0, W, H); ctx.restore();
  castAt("stomach", 330, SB("stomach") * 0.85, t, { mood: t > tk ? "worried" : "neutral" });
  flatCard(780, 520, 260, 240, 0.06, popK(t, S.t0), (w, h) => { part(() => ctx.rect(-w / 2, -h / 2, w, 60), BC.blood, { hl: false, lw: 0 }); text("DAY", 0, -h / 2 + 44, { size: 34, color: "#fff" });
    text(String(Math.min(3, 1 + Math.floor(clamp((t - S.t0) / 1.2) * 3))), 0, 70, { size: 120, color: BC.ink }); }, { tape: false });
  if (t > cue("sick/breath") - 0.3) for (let i = 0; i < 5; i++) { const a = (t * 0.8 + i / 5) % 1; withAlpha(1 - a, () => strokePath(() => { ctx.moveTo(470 + i * 30, 700 - a * 200); ctx.quadraticCurveTo(500 + i * 30, 660 - a * 200, 470 + i * 30, 620 - a * 200); }, "#7fa82a", 8)); }
};
CU.nobel = (t, S) => {
  SETS.spotlight(t);
  const tn = cue("nobel/two") - 0.15, k = popK(t, cue("nobel/nobel") - 0.2);
  bigNumber(t, tn, { value: 2005, from: 1984, rollDigits: false, fmt: v => String(Math.round(v)), label: "NOBEL PRIZE", sub: "for the bacterium behind most ulcers", stroke: 18, size: 230, y: 560, roll: 0.9, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink }, subColor: "#ffffff" });
  if (k > 0) { ctx.save(); ctx.translate(470, 1010); ctx.scale(k, k); ctx.rotate(Math.sin(t * 2) * 0.05);
    part(() => { ctx.moveTo(-60, -230); ctx.lineTo(-20, -120); ctx.lineTo(20, -120); ctx.lineTo(60, -230); ctx.closePath(); }, BC.blood, { hl: false });
    part(() => ctx.arc(0, -40, 110, 0, 7), BC.sun, { hlAt: [-30, -80, 26] }); strokePath(() => ctx.arc(0, -40, 80, 0, 7), shade(BC.sun, -0.25), 6); ctx.restore(); }
};
CU.hi = (t, S) => {                            // H. pylori introduces itself
  SETS.stomach(t);
  ctx.save(); ctx.translate(430, 980); ctx.scale(3, 3); CAST.microbe({ t, seed: 2, kind: "spiral", mood: "smug", look: [-0.5, 0], hop: 0.3, talk: talkAt ? 0 : 0 }); ctx.restore();
  bubble("HELLO. HELICOBACTER. ABOUT HALF OF YOU HAVE ME.", 610, 760, 260, popK(t, S.t0 + 0.1, 0.3), S.id);
  popIn(470, 1230, popK(t, cue("hi/half") - 0.1), () => tag("MOST CARRIERS HAVE NO SYMPTOMS", 0, 0, { size: 36 }));
};

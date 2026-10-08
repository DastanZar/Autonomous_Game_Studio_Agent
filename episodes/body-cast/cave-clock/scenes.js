// He lived in a cave without clocks and lost 25 days. Michel Siffre's 1962 experiment (named on a tag, never drawn:
// a tent, a lamp, a phone line) and Harvard's 24 h 11 min, told by the Brain, home of the master clock.
// Organ cast and flat props (body kit), moving type (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
// the cave: dark rock, stalactites, drips, a tent glowing from its lamp
function caveSet(t, o = {}) {
  vgrad("#1c1636", "#3a2f63");
  ctx.fillStyle = "#2f2650";
  for (let i = 0; i < 9; i++) { const x = i * 130 - 20, h = 140 + rnd(i, 5) * 220; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 130, 0); ctx.lineTo(x + 70, h); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = BC.ink; ctx.stroke();
    const a = (t * 0.5 + rnd(i, 7)) % 1; withAlpha(1 - a, () => part(() => ctx.ellipse(x + 70, h + a * 900, 7, 11, 0, 0, 7), "#7fc8d8", { hl: false, lw: 3 })); }
  ctx.fillStyle = "#6a5aa0"; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 1250); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 1250 + Math.sin(x * 0.02) * 20); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 40; i++) { const x = (rnd(i, 11) * W + t * (12 + rnd(i, 12) * 30)) % W, y = 250 + ((rnd(i, 13) * 1000 - t * (20 + rnd(i, 14) * 40)) % 1000 + 1000) % 1000;
    ctx.fillStyle = `rgba(255,230,170,${0.25 + 0.35 * Math.abs(Math.sin(t * 2 + i))})`; ctx.beginPath(); ctx.arc(x, y, 3 + rnd(i, 15) * 4, 0, 7); ctx.fill(); }
  if (o.tent !== false) { const tx = o.tentX ?? 760, ty = 1240;
    glow(tx, ty - 120, 300 + 30 * Math.sin(t * 3), "#ffd36b", 0.35 + 0.1 * Math.sin(t * 7));
    part(() => { ctx.moveTo(tx - 170, ty); ctx.lineTo(tx, ty - 260); ctx.lineTo(tx + 170, ty); ctx.closePath(); }, "#e07a3a", { hlAt: [tx - 40, ty - 180, 20] });
    part(() => { ctx.moveTo(tx - 40, ty); ctx.lineTo(tx, ty - 150); ctx.lineTo(tx + 40, ty); ctx.closePath(); }, "#ffd36b", { hl: false, lw: 5 }); }
}
// a clock face; crossed = struck through in red
function clockFace(x, y, r, t, o = {}) {
  part(() => ctx.arc(x, y, r, 0, 7), "#fffdf6", { hl: false, lw: 8 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, BC.ink, 5); }
  const sp = o.speed ?? 1, a1 = -Math.PI / 2 + t * 0.5 * sp, a2 = -Math.PI / 2 + t * 6 * sp;
  line(x, y, x + Math.cos(a1) * r * 0.5, y + Math.sin(a1) * r * 0.5, BC.ink, 10); line(x, y, x + Math.cos(a2) * r * 0.72, y + Math.sin(a2) * r * 0.72, BC.blood, 6);
  if (o.crossed > 0) { const k = clamp(o.crossed); ctx.save(); ctx.lineCap = "round"; ctx.lineWidth = 22; ctx.strokeStyle = BC.blood; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * k, y - r + 2 * r * k); ctx.stroke(); ctx.restore(); }
}
// a tear-off calendar page
function calPage(x, y, rot, k, top, big, sub, col) {
  flatCard(x, y, 300, 330, rot, k, (w, h) => {
    ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, 80); text(top, 0, -h / 2 + 58, { size: 44, color: "#fff" });
    text(big, 0, 70, { size: 150, color: BC.ink }); text(sub, 0, 140, { size: 34, font: "Elite", color: "#6b5a48" });
  }, { tape: false });
}

CU.hook = (t, S) => {                          // frame 1: the Brain in the cave, no clocks
  caveSet(t);
  const tc = cue("hook/clocks") - 0.2;
  castAt("brain", 330, SB("brain") * 0.7, t, { mood: "worried", look: [1, -0.5] });
  clockFace(760, 700, 120, t, { crossed: (t - tc) / 0.4 });
  stageTitle("2 MONTHS IN A CAVE. NO CLOCKS.", t, 0, 380, 110);
};
CU.lost = (t, S) => {                          // the number: 25 days lost
  caveSet(t, { tent: false });
  bigNumber(t, S.t0 + 0.15, { value: 25, suffix: " DAYS", label: "LOST", stroke: 18, size: 230, y: 760, roll: 0.6, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  popIn(470, 1000, popK(t, S.t0 + 0.8), () => tag("HIS OWN ACCOUNT", 0, 0, { size: 52 }));
};
CU.who = (t, S) => {                           // 130 metres down
  caveSet(t, { tentX: 760 });
  const td = cue("who/thirty") - 0.2, k = eio(clamp((t - S.t0) / 1.6));
  popIn(470, 330, popK(t, S.t0 + 0.1), () => tag("MICHEL SIFFRE, JULY 1962", 0, 0, { size: 50 }));
  ctx.save(); ctx.setLineDash([16, 14]); line(170, 420, 170, 420 + 700 * k, "#fff", 6); ctx.restore();
  if (t > td) kText(Math.round(130 * clamp((t - td) / 0.45)) + " M DOWN", 180, 560, 80, t, td, { align: "left", color: BC.sun, stroke: 12, ink: BC.ink });
  castAt("brain", 470, SB("brain") * 0.55, t, { mood: "neutral", look: [0, 1] });
};
CU.rules = (t, S) => {                         // no watch, no sun; sleep when the body says
  caveSet(t);
  const tw = cue("who/watch") - 0.2, ts = cue("who/sun") - 0.2, tb = cue("who/slept") - 0.2;
  clockFace(250, 560, 100, t, { crossed: (t - tw) / 0.3 });
  if (t > ts - 0.3) { ctx.save(); ctx.globalAlpha = clamp((t - ts + 0.3) / 0.3); part(() => ctx.arc(650, 560, 90, 0, 7), BC.sun, { hl: false }); ctx.lineCap = "round"; ctx.lineWidth = 22; ctx.strokeStyle = BC.blood; const k = clamp((t - ts) / 0.3); ctx.beginPath(); ctx.moveTo(560, 470); ctx.lineTo(560 + 180 * k, 470 + 180 * k); ctx.stroke(); ctx.restore(); }
  castAt("brain", 330, SB("brain") * 0.55, t, { mood: t > tb ? "tired" : "neutral" });
  if (t > tb) for (let i = 0; i < 3; i++) { const a = (t * 0.6 + i / 3) % 1; withAlpha(1 - a, () => text("z", 420 + a * 60 + i * 20, 900 - a * 140, { size: 50 + a * 30, color: "#fff", stroke: 8, ink: BC.ink })); }
};
CU.count = (t, S) => {                         // count to 120, one a second: five minutes
  caveSet(t, { tentX: 820 });
  const t0 = cue("count/count") - 0.1, t5 = cue("count/five") - 0.15, n = Math.min(120, Math.floor(clamp((t - t0) / 4.2) * 120));
  popIn(470, 330, popK(t, S.t0 + 0.1), () => tag("COUNT TO 120, ONE PER SECOND", 0, 0, { size: 44 }));
  if (t > t0) kText(String(n), 330, 760, 220, t, t0, { color: "#fff", stroke: 16, ink: BC.ink, stagger: 0 });
  clockRing(700, 700, 130, clamp((t - t0) / 4.2) * 5 / 60 * 12, "");
  if (t > t5) { text("= 5 MIN", 700, 920, { size: 80, color: BC.sun, stroke: 12, ink: BC.ink }); }
};
CU.slow = (t, S) => {                          // the Brain defends itself
  caveSet(t);
  const s = SB("brain") * 0.85;
  castAt("brain", 420, s, t, { mood: "smug", arms: "hips" });
  bubble("I WAS BEING THOROUGH.", 420, GROUND - RIGS.brain.h * s * 0.97 - 6, 250, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.date = (t, S) => {                          // his guess vs the real date
  caveSet(t, { tent: false });
  const ts = cue("date/september") - 0.2, ta = cue("date/august") - 0.2;
  calPage(300, 640, -0.06, popK(t, ts), "REAL DATE", "14", "September", BC.blood);
  calPage(660, 640, 0.06, popK(t, ta), "HIS GUESS", "20", "August", "#6b4a8a");
  if (t > ta + 0.5) stamp("25 DAYS BEHIND", 470, 1000, t - ta - 0.5, { size: 90, rot: -0.08, color: BC.blood });
};
CU.cycle = (t, S) => {                         // but the body kept a near-daily rhythm
  SETS.neurons(t);
  const tb = cue("cycle/beat") - 0.2, tc = cue("cycle/twentyfour") - 0.2;
  castAt("brain", 230, SB("brain") * 0.5, t, { mood: "proud" });
  clockFace(720, 640, 130, t, { speed: 3 });
  popIn(470, 330, popK(t, cue("cycle/own") - 0.15), () => tag("HIS OWN ACCOUNT", 0, 0, { size: 52 }));
  if (t > tc) kText("24½ H DAYS", 610, 1070, 100, t, tc, { color: BC.sun, stroke: 14, ink: BC.ink });
};
CU.lamp = (t, S) => {                          // Harvard's catch
  vgrad("#5a1a2a", "#a3244a");
  flatCard(470, 560, 660, 300, -0.02, popK(t, cue("lamp/harvard") - 0.15), (w, h) => {
    text("HARVARD", 0, -30, { size: 90, color: BC.blood });
    text("a catch in the old experiments", 0, 60, { size: 38, font: "Elite", color: "#6b5a48" });
  });
  castAt("brain", 470, SB("brain") * 0.45, t, { mood: "worried", look: [0, -1] });
};
CU.lamp2 = (t, S) => {                         // switching on a lamp resets the clock
  caveSet(t, { tent: false });
  const ts = cue("lamp/switching") - 0.1, tr = cue("lamp/resets") - 0.15, on = t > ts + 0.4;
  if (on) glow(300, 700, 420, "#ffe59a", 0.6);
  ctx.save(); ctx.translate(300, 900); part(() => ctx.roundRect(-14, -240, 28, 240, 8), "#b9c3cc", { hl: false, lw: 5 }); part(() => ctx.roundRect(-90, 0, 180, 30, 10), "#8a94a0", { hl: false, lw: 5 });
  part(() => { ctx.moveTo(-130, -230); ctx.lineTo(130, -230); ctx.lineTo(80, -360); ctx.lineTo(-80, -360); ctx.closePath(); }, on ? "#ffd36b" : "#e07a3a", { hlAt: [-40, -320, 16] }); ctx.restore();
  clockFace(720, 640, 130, t, { speed: t > tr && t < tr + 0.6 ? -12 : 1 });
  if (t > ts) popIn(300, 1080, popK(t, ts), () => tag("CLICK", 0, 0, { size: 46 }));
  if (t > tr) popIn(720, 880, popK(t, tr), () => tag("CLOCK RESET", 0, 0, { size: 46 }));
};
CU.real = (t, S) => {                          // the real number: 24 h 11 min
  SETS.spotlight(t);
  const th = cue("real/twentyfour") - 0.15, tm = cue("real/eleven") - 0.15;
  stageTitle("YOUR REAL BODY CLOCK:", t, S.t0 + 0.1, 330, 90);
  if (t < th) castAt("brain", 470, SB("brain") * 0.6, t, { mood: "worried", look: [0, -1], gy: 1150 });
  if (t > th) kText("24 HOURS", 470, 620, 210, t, th, { color: "#fff", stroke: 18, ink: BC.ink });
  if (t > tm) kText("+ 11 MINUTES", 470, 800, 140, t, tm, { color: BC.sun, stroke: 16, ink: BC.ink });
  popIn(470, 1000, popK(t, tm + 0.4), () => tag("HARVARD, 1999: 24 PEOPLE, 1 MONTH", 0, 0, { size: 40 }));
};
CU.master = (t, S) => {                        // the master clock lives in the Brain; light sets it
  SETS.neurons(t);
  const s = SB("brain") * 0.8, tl = cue("master/light") - 0.2;
  castAt("brain", 420, s, t, { mood: "proud", arms: "hips" });
  clockFace(420, GROUND - 120 * s, 46, t);
  if (t > tl) { glow(820, 520, 200, "#fff2a8", 0.6); part(() => ctx.arc(820, 520, 60, 0, 7), BC.sun, { hl: false }); for (let i = -1; i <= 1; i++) withAlpha(0.5, () => strokePath(() => { ctx.moveTo(780, 560); ctx.lineTo(560 + i * 40, 900 + i * 40); }, "#fff6c2", 14)); }
  bubble("THE MASTER CLOCK IS IN ME. LIGHT SETS IT.", 420, GROUND - RIGS.brain.h * s * 0.97 - 6, 250, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.toll = (t, S) => {                          // back to the cave: the clock never stopped
  caveSet(t);
  castAt("brain", 330, SB("brain") * 0.7, t, { mood: "proud", look: [1, -0.5] });
  clockFace(760, 700, 120, t);
  stageTitle("HE LOST COUNT. HIS BODY DIDN'T.", t, S.t0 + 0.1, 380, 110);
};

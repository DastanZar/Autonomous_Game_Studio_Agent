// Why your stomach doesn't digest itself. Gut Gang house method: the organ cast and flat props (body kit), moving
// type for the one big number (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
function zincNut(x, y, s, melt, t) {          // a hex nut fizzing away in acid; melt 0..1
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - melt * 0.6), s * (1 - melt * 0.75)); ctx.rotate(t * 0.6);
  part(() => { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; i ? ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 90) : ctx.moveTo(Math.cos(a) * 90, Math.sin(a) * 90); } ctx.closePath(); ctx.moveTo(40, 0); ctx.arc(0, 0, 40, 0, 7, true); }, "#b9c3cc", { hlAt: [-30, -40, 20] });
  ctx.restore();
  for (let i = 0; i < 10; i++) { const a = (t * 1.3 + i / 10) % 1; withAlpha((1 - a) * Math.min(1, melt * 4), () => { ctx.fillStyle = "#d9f76d"; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2.3) * 90, y - a * 260, 8 + i % 3 * 5, 0, 7); ctx.fill(); }); }
}
CU.hook = (t, S) => {
  SETS.stomach(t);
  castAt("stomach", 330, SB("stomach") * 0.85, t, { mood: t > cue("hook/zinc") ? "shocked" : "worried", look: [1, 0] });
  zincNut(800, 900, 0.9, clamp((t - cue("hook/zinc") + 0.2) / 2.5), t);
  stageTitle(t < cue("hook/acid") - 0.1 ? "WHY DOESN'T IT DIGEST ITSELF?" : "ACID THAT DISSOLVES ZINC", t, 0, 380, 110);
};
CU.ph = (t, S) => {
  SETS.spotlight(t);
  phBar(t, S.t0 + 0.1, 1, 3, 520);
  castAt("stomach", 470, SB("stomach") * 0.8, t, { mood: "worried", look: [-1, -0.5] });
  if (t > cue("ph/three")) popIn(260, 470, popK(t, cue("ph/three")), () => tag("STOMACH ACID: pH 1–3", 0, 0, { size: 40 }));
};
CU.litres = (t, S) => {
  SETS.stomach(t);
  const t0 = cue("litres/one") - 0.15;
  bigNumber(t, t0, { value: 1.5, suffix: " L", fmt: v => v.toFixed(1), label: "OF GASTRIC JUICE", sub: "every day", stroke: 18, size: 260, y: 600, roll: 0.9, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink }, subColor: "#ffffff" });
  jug(740, 1220, 0.95, clamp((t - t0) / 2.4), "");
  castAt("stomach", 290, SB("stomach") * 0.6, t, { mood: "proud", arms: { L: "rest", R: "point" } });
};
CU.mucus = (t, S) => {                         // the lining up close: cells, mucus gel, acid bouncing off
  vgrad("#5a0f2e", "#a3244a");
  const tm = cue("mucus/mucus") - 0.1, tb = cue("base/bicarbonate") - 0.1, ts = cue("seal/tightly") - 0.1;
  const wallY = 1000, gel = eio(clamp((t - tm) / 0.8)), tight = eio(clamp((t - ts) / 0.6));
  for (let i = 0; i < 9; i++) {               // lining cells, closing ranks on "tightly"
    const w = 120, x = 20 + i * (w + lerp(14, 0, tight)) + lerp(0, 50, tight);
    part(() => ctx.roundRect(x, wallY, w, 260, 26), BC.stomach, { hlAt: [x + 30, wallY + 40, 16] });
    castFace({ x: x + w / 2, y: wallY + 120, sz: 30, mood: t > ts ? "proud" : "worried", look: [0, -1], blink: castBlinkAt(t, i), talk: 0, body: BC.stomach });
  }
  if (gel > 0) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = "#b5e05a"; ctx.beginPath(); ctx.moveTo(0, wallY + 10); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, wallY - gel * 170 + Math.sin(x * 0.02 + t * 2) * 14); ctx.lineTo(W, wallY + 10); ctx.closePath(); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = BC.ink; ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 12; i++) {               // acid drops fall and bounce off the gel
    const p = (t * 0.55 + rnd(i, 3)) % 1, x = 60 + rnd(i, 4) * 860, floor = wallY - 20 - gel * 170;
    const y = p < 0.7 ? lerp(300, floor, p / 0.7) : floor - Math.sin((p - 0.7) / 0.3 * Math.PI) * 120;
    part(() => { ctx.moveTo(x, y - 34); ctx.quadraticCurveTo(x + 24, y, x, y + 16); ctx.quadraticCurveTo(x - 24, y, x, y - 34); }, "#e8ff6a", { hl: false, lw: 5 });
  }
  popIn(330, 380, popK(t, tm), () => tag("MUCUS LAYER", 0, 0, { size: 60 }));
  popIn(560, 500, popK(t, tb), () => tag("+ BICARBONATE (A BASE)", 0, 0, { size: 52 }));
  popIn(500, 640, popK(t, ts), () => tag("CELLS TIGHTLY JOINED", 0, 0, { size: 56 }));
};
CU.coat = (t, S) => {                          // the stomach in its raincoat
  SETS.stomach(t);
  const s = SB("stomach"), k = popK(t, cue("coat/raincoat") - 0.2);
  castAt("stomach", 470, s, t, { mood: "proud", arms: "hips" });
  if (k > 0) { ctx.save(); ctx.translate(470, GROUND); ctx.scale(s, s * k);
    part(() => { ctx.moveTo(-190, -400); ctx.quadraticCurveTo(-170, -530, -30, -540); ctx.quadraticCurveTo(140, -540, 170, -400); ctx.quadraticCurveTo(60, -470, -30, -470); ctx.quadraticCurveTo(-120, -470, -190, -400); ctx.closePath(); }, "#ffd23f", { hlAt: [-100, -510, 20] });
    part(() => { ctx.moveTo(-200, -260); ctx.quadraticCurveTo(-20, -230, 190, -270); ctx.lineTo(230, -150); ctx.quadraticCurveTo(0, -110, -230, -150); ctx.closePath(); }, "#ffd23f", { hlAt: [-120, -230, 20] });
    for (const bx of [-60, 40]) part(() => ctx.arc(bx, -200, 12, 0, 7), BC.ink, { hl: false, lw: 3 });
    ctx.restore(); }
};

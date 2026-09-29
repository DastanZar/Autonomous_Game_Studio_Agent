// Style-lab boards: each is {dur, still, draw(t)}. Rendered by lab_render.mjs.
"use strict";
const BOARDS = {};

// ================================ body-cast ================================
function bgFlat(t) {
  ctx.fillStyle = BC.bg; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 11; i++) {  // drifting cells
    const x = rnd(i, 1) * W + Math.sin(t * 0.3 + i) * 20, y = rnd(i, 2) * H + Math.cos(t * 0.25 + i) * 20, r = 90 + rnd(i, 3) * 150;
    ctx.fillStyle = "#f8dcd5"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = "#f4cfc7"; ctx.beginPath(); ctx.arc(x + r * 0.2, y - r * 0.1, r * 0.3, 0, 7); ctx.fill();
  }
  grain(4, 0.04);
}
function bgPaper(t, plate) {
  ctx.fillStyle = BC.paper; ctx.fillRect(0, 0, W, H);
  grain(9, 0.05, 4000);
  ctx.strokeStyle = BC.ink; ctx.lineWidth = 3; ctx.strokeRect(40, 230, W - 80, H - 480);
  ctx.lineWidth = 1.5; ctx.strokeRect(52, 242, W - 104, H - 504);
  if (plate) text(plate, W / 2, 290, { size: 34, font: "Elite", color: BC.ink, ls: 4 });
}
function bubble(x, y, str, k, tailX, tailY) {
  if (k <= 0) return;
  const size = 54, w = measure(str, size) + 70, h = 100;
  ctx.save(); ctx.translate(x, y); const s = back(clamp(k)); ctx.scale(s, s);
  const path = () => { ctx.roundRect(-w / 2, -h / 2, w, h, STYLE === "flat" ? 44 : 6); ctx.moveTo(tailX - x - 20, h / 2 - 2); ctx.lineTo(tailX - x, tailY - y); ctx.lineTo(tailX - x + 22, h / 2 - 2); };
  if (STYLE === "flat") { fillPath(path, "#fff"); strokePath(path, BC.ink, 7); ctx.fillStyle = "#fff"; ctx.fillRect(tailX - x - 16, h / 2 - 8, 34, 10); }
  else { part(path, "#fbf6ea", {}); }
  text(str, 0, 20, { size, color: BC.ink, font: STYLE === "flat" ? "Anton" : "Elite" });
  ctx.restore();
}
function energyBar(cx, y, v, k, win) {
  const w = 380, h = 56;
  if (STYLE === "flat") {
    fillPath(() => ctx.roundRect(cx - w / 2, y, w, h, 28), "#fff"); strokePath(() => ctx.roundRect(cx - w / 2, y, w, h, 28), BC.ink, 7);
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(cx - w / 2, y, w, h, 28); ctx.clip();
      ctx.fillStyle = win ? BC.sun : "#f7b9a8"; ctx.fillRect(cx - w / 2, y, w * (v / 25) * k, h); ctx.restore();
      strokePath(() => ctx.roundRect(cx - w / 2, y, w, h, 28), BC.ink, 7); }
    if (k > 0) text(Math.round(v * k) + "%", cx, y + 150, { size: 110, color: "#fff", stroke: 14, ink: BC.ink });
  } else {
    part(() => ctx.rect(cx - w / 2, y, w, h), "#fbf6ea", {});
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2, y, w * (v / 25) * k, h); ctx.clip();
      ctx.fillStyle = win ? BC.blood : "#8a7d6a"; ctx.fillRect(cx - w / 2, y, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 3; for (let i = -100; i < 500; i += 14) { ctx.beginPath(); ctx.moveTo(cx - w / 2 + i, y); ctx.lineTo(cx - w / 2 + i + 56, y + h); ctx.stroke(); }
      ctx.restore(); strokePath(() => ctx.rect(cx - w / 2, y, w, h), BC.ink, 3.5); }
    if (k > 0) text(Math.round(v * k) + "%", cx, y + 140, { size: 100, color: BC.ink, font: "Anton" });
  }
}
function versusScene(t, style) {
  STYLE = style;
  style === "flat" ? bgFlat(t) : bgPaper(t, "PLATE IV · RESTING ENERGY");
  sampleTag(false);
  const kt = pop(t, 0.05, 0.4);
  ctx.save(); ctx.translate(W / 2, 400); ctx.scale(kt, kt);
  if (style === "flat") { text("LIVER VS BRAIN", 0, 0, { size: 130, color: "#fff", stroke: 18, ink: BC.ink }); text("WHO BURNS MORE ENERGY?", 0, 80, { size: 54, color: BC.ink }); }
  else { text("The Liver & the Brain", 0, -10, { size: 96, font: "Serif", color: BC.ink }); text("WHO BURNS MORE ENERGY?", 0, 64, { size: 40, font: "Elite", color: BC.ink, ls: 3 }); }
  ctx.restore();
  const win = t > 5.8, shock = prog(t, 5.8, 6.0);
  // liver, left
  const kl = pop(t, 0.3, 0.45);
  if (kl > 0) {
    ctx.save(); ctx.translate(290, 1060); ctx.scale(kl, kl); ctx.translate(-290, -1060);
    char("liver", 290, 1060, 0.86, { t, seed: 3, mood: win ? "smug" : "tired", look: t < 5.2 ? [0.8, 0] : [0.6, -0.2],
      arms: { L: win ? "up" : "rest", R: "mug" }, talk: 0 });
    ctx.restore();
    if (style === "paper") { text("FIG. 1 — HEPAR", 290, 1110, { size: 30, font: "Elite", color: BC.ink }); }
  }
  // brain walks in from the right
  const kw = eio(prog(t, 0.5, 1.7)), bx = lerp(1300, 790, kw), walking = t > 0.5 && t < 1.7;
  const talking = t > 1.8 && t < 3.0;
  char("brain", bx, 1060, 0.86, { t, seed: 5, flip: true, walk: walking ? t * 9 : null, mood: shock > 0 ? "shocked" : talking ? "smug" : "smug",
    look: [0.7, 0], talk: talking ? flap(t, 5) : 0, arms: talking ? "hips" : shock > 0 ? "up" : "rest", crownFall: eio(prog(t, 5.9, 6.3)) });
  if (shock > 0) sweat(bx + 100, 700, prog(t, 5.9, 6.6));
  if (style === "paper" && kw > 0.99) text("FIG. 2 — CEREBRUM", 790, 1110, { size: 30, font: "Elite", color: BC.ink });
  bubble(700, 560, "I RUN THIS PLACE.", prog(t, 1.8, 2.1) * (t < 3.0 ? 1 : 0), 780, 660);
  // bars
  const kb = pop(t, 3.0, 0.35);
  if (kb > 0) {
    text(style === "flat" ? "SHARE OF RESTING ENERGY" : "share of resting energy", W / 2, 1172, { size: style === "flat" ? 40 : 34, font: style === "flat" ? "Anton" : "Elite", color: BC.ink, ls: 2 });
    energyBar(790, 1195, 20, eout(prog(t, 3.3, 4.4)), false);
    energyBar(290, 1195, 21, eout(prog(t, 5.2, 5.8)), win);
  }
  if (win && style === "paper") {  // the studio stamp
    const since = t - 5.85; const s = 1 + 0.9 * (1 - eout(clamp(since * 5)));
    ctx.save(); ctx.translate(300, 600); ctx.rotate(-0.12); ctx.scale(s, s); ctx.globalAlpha = clamp(since * 8) * 0.9;
    ctx.strokeStyle = BC.blood; ctx.lineWidth = 9; ctx.strokeRect(-160, -60, 320, 120);
    text("WINNER", 0, 38, { size: 100, color: BC.blood, ls: 6 }); ctx.restore();
  }
  if (win && style === "flat") {  // burst behind the numbers
    const k = prog(t, 5.8, 6.2);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.4, r1 = 60 + 150 * eout(k), r2 = r1 + 40;
      strokePath(() => { ctx.moveTo(290 + Math.cos(a) * r1, 1290 + Math.sin(a) * r1 * 0.6); ctx.lineTo(290 + Math.cos(a) * r2, 1290 + Math.sin(a) * r2 * 0.6); }, BC.sun, 10); }
  }
  // narrator captions
  const cap = [[3.0, 4.4, "AT REST, THE BRAIN USES"], [4.4, 5.3, "TWENTY PERCENT."], [5.3, 7.2, "THE LIVER? TWENTY-ONE."]].find(c => t >= c[0] && t < c[1]);
  if (cap) caption(cap[2], 1470, prog(t, cap[0], cap[0] + 0.15), BC.ink, 84);
}
BOARDS.bc_flat_scene = { dur: 7, still: 6.4, draw: t => versusScene(t, "flat") };
BOARDS.bc_paper_scene = { dur: 7, still: 6.4, draw: t => versusScene(t, "paper") };

function lineup(t, style) {
  STYLE = style;
  style === "flat" ? bgFlat(t) : bgPaper(t, "PLATE I · THE CAST");
  if (style === "flat") { text("THE BODY CAST", W / 2, 360, { size: 140, color: "#fff", stroke: 18, ink: BC.ink }); text("DIRECTION A · FLAT CAST", W / 2, 430, { size: 44, color: BC.ink, ls: 3 }); }
  else { text("The Body Cast", W / 2, 390, { size: 110, font: "Serif", color: BC.ink }); text("DIRECTION B · PAPER ANATOMY", W / 2, 450, { size: 36, font: "Elite", color: BC.ink, ls: 3 }); }
  const lab = (x, y, name, role) => {
    text(name, x, y, { size: style === "flat" ? 62 : 52, font: style === "flat" ? "Anton" : "Serif", color: style === "flat" ? "#fff" : BC.ink, stroke: style === "flat" ? 12 : 0, ink: BC.ink });
    text(role, x, y + 44, { size: 32, font: "Elite", color: BC.ink });
  };
  char("brain", 290, 1000, 0.78, { t, seed: 5, mood: "smug", arms: "hips", look: [0.3, 0] });
  char("heart", 790, 1000, 0.78, { t, seed: 6, mood: "proud", arms: { L: "up", R: "rest" }, beat: true, look: [-0.3, 0] });
  lab(290, 1070, "BRAIN", "thinks it runs the place");
  lab(790, 1070, "HEART", "the athlete. never rests");
  char("liver", 290, 1560, 0.78, { t, seed: 3, mood: "tired", arms: { L: "rest", R: "mug" }, look: [0.4, 0.2] });
  [[690, 1480, "rod", 1], [820, 1500, "coccus", 2], [760, 1580, "spiral", 3], [900, 1590, "rod", 4]].forEach(([x, y, k, sd]) =>
    char("microbe", x, y, 0.75, { t, seed: sd, kind: k, mood: ["happy", "angry", "smug", "worried"][sd - 1], talk: sd === 2 ? flap(t, sd) : 0 }));
  lab(290, 1630, "LIVER", "500 jobs. zero thanks");
  lab(790, 1650, "THE MICROBES", "chaotic. secretly in charge");
}
BOARDS.bc_flat_lineup = { dur: 4, still: 1.3, draw: t => lineup(t, "flat") };
BOARDS.bc_paper_lineup = { dur: 4, still: 1.3, draw: t => lineup(t, "paper") };

// ================================ ranked ================================
const RK = { ink: "#14213d", bg: "#f5f3ee", bar: "#4a78a8", hi: "#e63946", gold: "#f4b942", silver: "#b8c0c8", bronze: "#c47f45", grid: "#d9d6cf" };
const DATA = [["FI", 12.0], ["NO", 9.9], ["IS", 9.0], ["DK", 8.7], ["NL", 8.4], ["SE", 8.2], ["CH", 7.9]];
const ITALY = ["IT", 5.9];
const FIELD = { FI: "#ffffff", NO: "#ba0c2f", IS: "#02529c", DK: "#c8102e", SE: "#006aa7", NL: "#ffffff", IT: "#ffffff", CH: "#da291c" };
function badge(code, x, y, r, o = {}) {
  if (o.k != null && o.k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = o.k != null ? back(clamp(o.k)) : 1; ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.save(); ctx.shadowColor = "rgba(20,33,61,0.28)"; ctx.shadowOffsetY = 6; ctx.shadowBlur = 8;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); flagRect(code, -r * 1.25, -r, r * 2.5, r * 2);
  ctx.globalAlpha = 0.22; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.55, r * 0.6, r * 0.28, -0.4, 0, 7); ctx.fill();
  ctx.globalAlpha = 0.12; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.3, r, 0, 7); ctx.arc(0, 0, r * 1.2, 0, 7, true); ctx.fill("evenodd");
  ctx.restore();
  ctx.strokeStyle = RK.ink; ctx.lineWidth = Math.max(3, r * 0.09); ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, 7); ctx.stroke();
  ctx.lineWidth = Math.max(2, r * 0.05); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  if (o.mood) { STYLE = "flat"; face({ x: 0, y: -r * 0.12, sz: r * 0.52, mood: o.mood, look: o.look || [0, 0], blink: o.blink || 0, talk: o.talk || 0, body: FIELD[code] }); }
  if (o.crown) { ctx.save(); ctx.scale(r / 70, r / 70); crown(10, -70, 0.25); ctx.restore(); }
  ctx.restore();
  if (o.sweat) sweat(x + r * 0.9, y - r * 0.6, o.sweat, r / 60);
}
function rankedBadges(t) {
  ctx.fillStyle = RK.bg; ctx.fillRect(0, 0, W, H); grain(11, 0.035);
  ctx.strokeStyle = RK.grid; ctx.lineWidth = 2;
  for (let v = 0; v <= 12; v += 2) { const x = 130 + v / 12 * 600; ctx.beginPath(); ctx.moveTo(x, 590); ctx.lineTo(x, 1300); ctx.stroke(); }
  sampleTag(false);
  const kt = pop(t, 0.05, 0.4);
  ctx.save(); ctx.translate(W / 2, 0); ctx.scale(1, 1);
  text("WHO DRINKS THE", 0, 350, { size: 108 * kt, color: RK.ink }); text("MOST COFFEE?", 0, 470, { size: 108 * kt, color: RK.hi });
  text("kilograms per person, per year", 0, 540, { size: 38, font: "Elite", color: RK.ink }); ctx.restore();
  const crownT = 4.3;
  DATA.forEach(([code, v], i) => {
    const r = i + 1, y = 650 + i * 96, t0 = 0.6 + (7 - r) * 0.5, kg = eout(prog(t, t0, t0 + 0.45)), top = r === 1 && t > crownT;
    const medal = [RK.gold, RK.silver, RK.bronze][i] || RK.grid;
    ctx.fillStyle = medal; ctx.beginPath(); ctx.arc(76, y, 32, 0, 7); ctx.fill(); ctx.strokeStyle = RK.ink; ctx.lineWidth = 4; ctx.stroke();
    text(String(r), 76, y + 15, { size: 42, color: RK.ink });
    const len = v / 12 * 600 * kg;
    if (kg > 0) {
      ctx.fillStyle = top ? RK.hi : RK.bar; ctx.beginPath(); ctx.roundRect(130, y - 34, Math.max(len, 1), 68, 12); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(130, y - 34, Math.max(len, 1), 68, 12); ctx.clip();
      text(NAMES[code].toUpperCase(), 150, y + 14, { size: 38, color: "#fff", align: "left" });
      text((v * kg).toFixed(1), 130 + len - 14, y + 14, { size: 40, color: "#fff", align: "right" });
      ctx.restore();
      const mood = top ? "smug" : r === 1 ? "happy" : r === 7 ? "worried" : ["happy", "proud", "neutral", "smug", "neutral", "worried"][i];
      badge(code, 130 + len + 58, y, 44, { k: prog(t, t0 + 0.3, t0 + 0.65), mood, blink: blinkAt(t, 20 + i), look: t > 4.9 ? [0, 0.8] : [-0.5, 0], crown: top });
    } else { ctx.fillStyle = "rgba(20,33,61,0.08)"; ctx.beginPath(); ctx.roundRect(130, y - 34, 180, 68, 12); ctx.fill(); text("?", 220, y + 14, { size: 40, color: "rgba(20,33,61,0.3)" }); }
  });
  if (t > crownT) for (let i = 0; i < 40; i++) {  // confetti from the leader
    const k = (t - crownT) * 0.9, a = rnd(i, 7) * Math.PI * 2, sp = 300 + rnd(i, 8) * 500;
    const x = 790 + Math.cos(a) * sp * k, y = 650 + Math.sin(a) * sp * k * 0.6 + 400 * k * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 6 + i); ctx.globalAlpha = clamp(1.6 - k);
    ctx.fillStyle = [RK.hi, RK.gold, RK.bar, "#fff"][i % 4]; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
  // the obvious guess, parked below the chart
  const ki = eout(prog(t, 4.9, 5.4));
  if (ki > 0) {
    const ox = lerp(-900, 0, ki);
    ctx.save(); ctx.translate(ox, 0);
    ctx.setLineDash([12, 10]); ctx.strokeStyle = RK.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, 1310); ctx.lineTo(940, 1310); ctx.stroke(); ctx.setLineDash([]);
    text("#?", 76, 1382, { size: 34, color: RK.ink });
    ctx.fillStyle = "#9aa3ad"; ctx.beginPath(); ctx.roundRect(130, 1336, 5.9 / 12 * 600, 68, 12); ctx.fill();
    text("ITALY", 150, 1384, { size: 38, color: "#fff", align: "left" }); text("5.9", 130 + 295 - 14, 1384, { size: 40, color: "#fff", align: "right" });
    badge("IT", 130 + 295 + 58, 1370, 44, { mood: "shocked", sweat: prog(t, 5.5, 6.3), look: [0, -0.6] });
    ctx.restore();
  }
  const cap = [[0.4, 2.4, "THE OBVIOUS GUESS: ITALY."], [2.4, 4.3, "NOT EVEN CLOSE."], [4.3, 5.6, "FINLAND. TWELVE KILOS."], [5.6, 7.2, "ITALY? FIVE POINT NINE."]].find(c => t >= c[0] && t < c[1]);
  if (cap) caption(cap[2], 1500, prog(t, cap[0], cap[0] + 0.15), RK.ink, 80);
}
BOARDS.rk_badge_scene = { dur: 7, still: 6.2, draw: rankedBadges };
BOARDS.rk_badge_lineup = { dur: 4, still: 1.3, draw: t => {
  ctx.fillStyle = RK.bg; ctx.fillRect(0, 0, W, H); grain(11, 0.035);
  text("RANKED", W / 2, 370, { size: 150, color: RK.ink }); text("DIRECTION A · FLAG BADGES", W / 2, 440, { size: 44, color: RK.hi, ls: 3 });
  const moods = [["FI", "smug"], ["NO", "proud"], ["IS", "happy"], ["DK", "neutral"], ["SE", "worried"], ["NL", "tired"], ["CH", "angry"], ["IT", "shocked"]];
  moods.forEach(([c, m], i) => {
    const x = 200 + (i % 3) * 340, y = 640 + Math.floor(i / 3) * 360;
    badge(c, x, y + Math.sin(t * 3 + i) * 6, 110, { mood: m, blink: blinkAt(t, 30 + i), talk: m === "happy" ? flap(t, i) : 0, crown: m === "smug", sweat: m === "shocked" ? (t % 1.2) / 1.2 : 0 });
    text(NAMES[c].toUpperCase(), x, y + 170, { size: 42, color: RK.ink }); text(m, x, y + 210, { size: 32, font: "Elite", color: "#6b7280" });
  });
  text("same rig for every flag: 8 moods, blink, talk", W / 2, 1660, { size: 30, font: "Elite", color: RK.ink });
}};

// ---- direction B: sports-broadcast leaderboard, no faces
function bgBroadcast(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0a1230"); g.addColorStop(1, "#16275a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.strokeStyle = "#fff"; ctx.lineWidth = 30;
  for (let i = -H; i < W + H; i += 90) { ctx.beginPath(); ctx.moveTo(i + (t * 40) % 90, 0); ctx.lineTo(i + (t * 40) % 90 - H * 0.6, H); ctx.stroke(); }
  ctx.restore();
  const sw = ((t * 0.35) % 1.6) - 0.3;  // light sweep
  const lg = ctx.createLinearGradient(sw * W - 300, 0, sw * W + 300, 0); lg.addColorStop(0, "rgba(255,255,255,0)"); lg.addColorStop(0.5, "rgba(255,255,255,0.04)"); lg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
}
function wavingFlag(code, x, y, w, h, t, seed) {
  const n = 12;
  for (let i = 0; i < n; i++) {  // vertical slices displaced by a wave
    const x0 = x + w * i / n, dy = Math.sin(t * 5 + i * 0.6 + seed) * 3 * (i / n);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y + dy - 1, w / n + 1, h + 2); ctx.clip(); ctx.translate(0, dy); flagRect(code, x, y, w, h);
    ctx.fillStyle = `rgba(0,0,0,${0.1 + 0.1 * Math.sin(t * 5 + i * 0.6 + seed)})`; ctx.fillRect(x0, y, w / n + 1, h); ctx.restore();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
}
function panel(x, y, w, h, fill, sk = 16) { ctx.beginPath(); ctx.moveTo(x + sk, y); ctx.lineTo(x + w + sk, y); ctx.lineTo(x + w - sk, y + h); ctx.lineTo(x - sk, y + h); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function header(title, sub) {
  panel(40, 250, 250, 96, RK.hi); text("RANKED", 165, 318, { size: 60, color: "#fff", ls: 2 });
  panel(300, 250, 660, 96, "#0f1a3e"); text(title, 330, 316, { size: 52, color: "#fff", align: "left" });
  ctx.fillStyle = RK.gold; ctx.fillRect(40, 352, 920, 6);
  if (sub) text(sub, 60, 400, { size: 32, font: "Elite", color: "rgba(255,255,255,0.7)", align: "left" });
}
function rankedBroadcast(t) {
  bgBroadcast(t); sampleTag(true);
  header("COFFEE PER PERSON", "kilograms per person, per year");
  DATA.slice().reverse().forEach(([code, v], j) => {
    const i = 6 - j, r = i + 1, y = 450 + i * 112, t0 = 0.5 + j * 0.45, k = eout(prog(t, t0, t0 + 0.4));
    if (k <= 0) return;
    const ox = (1 - k) * 1100, hero = r === 1;
    ctx.save(); ctx.translate(ox, 0);
    if (hero && t > t0 + 0.4) { ctx.save(); ctx.shadowColor = RK.gold; ctx.shadowBlur = 30 + 10 * Math.sin(t * 6); panel(60, y, 880, 96, "#223a78"); ctx.restore(); }
    panel(60, y, 880, 96, hero ? "#223a78" : "#152552");
    const medal = [RK.gold, RK.silver, RK.bronze][i] || "#2b3d6b";
    panel(60, y, 96, 96, medal); text(String(r), 108, y + 70, { size: 60, color: i < 3 ? RK.ink : "#fff" });
    wavingFlag(code, 178, y + 16, 96, 64, t, i);
    text(NAMES[code].toUpperCase(), 296, y + 68, { size: 50, color: "#fff", align: "left" });
    const kv = eout(prog(t, t0 + 0.2, t0 + 0.9));
    text((v * kv).toFixed(1), 912, y + 70, { size: 60, color: hero ? RK.gold : "#fff", align: "right" });
    ctx.fillStyle = hero ? RK.gold : "#4a78a8"; ctx.fillRect(170, y + 88, 740 * v / 12 * kv, 6);
    ctx.restore();
    if (hero && t > t0 + 0.4) { const f = prog(t, t0 + 0.4, t0 + 0.7); ctx.save(); ctx.globalAlpha = (1 - f) * 0.7; panel(60, y, 880, 96, "#fff"); ctx.restore(); }
  });
  const ki = eout(prog(t, 4.9, 5.3));
  if (ki > 0) {
    ctx.save(); ctx.translate((1 - ki) * -1100, 0);
    panel(60, 1250, 880, 84, "rgba(230,57,70,0.9)");
    text("OUTSIDE THE TOP 7", 90, 1308, { size: 40, color: "#fff", align: "left" });
    wavingFlag("IT", 560, 1266, 78, 52, t, 9); text("ITALY 5.9", 912, 1310, { size: 48, color: "#fff", align: "right" });
    ctx.restore();
  }
  text("Source: sample data (style test)", 60, 1372, { size: 28, font: "Elite", color: "rgba(255,255,255,0.55)", align: "left" });
  const cap = [[0.4, 2.4, "THE OBVIOUS GUESS: ITALY."], [2.4, 4.3, "NOT EVEN CLOSE."], [4.3, 5.6, "FINLAND. TWELVE KILOS."], [5.6, 7.2, "ITALY? FIVE POINT NINE."]].find(c => t >= c[0] && t < c[1]);
  if (cap) caption(cap[2], 1470, prog(t, cap[0], cap[0] + 0.15), "#0a1230", 80);
}
BOARDS.rk_broadcast_scene = { dur: 7, still: 6.2, draw: rankedBroadcast };
BOARDS.rk_broadcast_versus = { dur: 4, still: 2.5, draw: t => {
  bgBroadcast(t); sampleTag(true);
  header("TALE OF THE TAPE", "DIRECTION B · BROADCAST");
  const kl = eout(prog(t, 0.2, 0.7)), kr = eout(prog(t, 0.35, 0.85));
  ctx.save(); ctx.translate((kl - 1) * 600, 0); wavingFlag("IT", 60, 480, 340, 227, t, 1); text("ITALY", 230, 800, { size: 80, color: "#fff" }); ctx.restore();
  ctx.save(); ctx.translate((1 - kr) * 600, 0); wavingFlag("FI", 600, 480, 340, 227, t, 2); text("FINLAND", 770, 800, { size: 80, color: "#fff" }); ctx.restore();
  const kvs = pop(t, 0.9, 0.3); ctx.save(); ctx.translate(510, 595); ctx.scale(kvs, kvs); panel(-70, -60, 140, 120, RK.hi, 14); text("VS", 0, 34, { size: 90, color: "#fff" }); ctx.restore();
  const rows = [["COFFEE (KG / PERSON)", 5.9, 12.0], ["ESPRESSO BARS PER TOWN", 9, 2], ["SAUNAS PER PERSON", 0.1, 0.6]];
  rows.forEach(([lab, a, b], i) => {
    const y = 930 + i * 150, k = eout(prog(t, 1.2 + i * 0.35, 1.8 + i * 0.35)), m = Math.max(a, b);
    text(lab, W / 2, y, { size: 36, color: "rgba(255,255,255,0.8)" });
    ctx.fillStyle = a >= b ? RK.gold : "#4a78a8"; ctx.fillRect(W / 2 - 20 - 300 * a / m * k, y + 22, 300 * a / m * k, 40);
    ctx.fillStyle = b >= a ? RK.gold : "#4a78a8"; ctx.fillRect(W / 2 + 20, y + 22, 300 * b / m * k, 40);
    text(String(a), 110, y + 60, { size: 44, color: "#fff", align: "left" }); text(String(b), 930, y + 60, { size: 44, color: "#fff", align: "right" });
  });
  text("(rows are placeholders)", W / 2, 1400, { size: 30, font: "Elite", color: "rgba(255,255,255,0.5)" });
}};

window.BOARDS = BOARDS;
window.drawBoard = (name, t, zones) => { T = t; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; BOARDS[name].draw(t); if (zones) safeZones(); };

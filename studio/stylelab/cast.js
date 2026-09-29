// body-cast characters. One rig, two render treatments:
//   style "flat"  : flat vector, thick ink outline, crescent shade + highlight, big cartoon eyes, rubber-hose limbs
//   style "paper" : cut paper, drop shadow, engraving hatch, small paper eyes, paper-strip limbs with brass pins, 12 fps boil
// Every character draws with its feet at the origin, about 440 units tall at s = 1.
"use strict";
const BC = {
  ink: "#1d1b2e", bg: "#fbe9e4", flesh: "#f2a38f", blood: "#d2383f", bone: "#f4ecd8", bile: "#9bb63a",
  lymph: "#7fc8d8", neuron: "#9a7de0", sun: "#ffcc4d",
  liver: "#a8433f", brain: "#f3a0b6", heart: "#d2383f", vein: "#4f6fd0", paper: "#efe4cc",
};
const PAPER_TONE = { liver: "#98493b", brain: "#dc949f", heart: "#b93a31", bile: "#8ea35a", neuron: "#8b78b8", lymph: "#79aebb", vein: "#50679e" };
let STYLE = "flat";
const tone = (key, hex) => STYLE === "paper" && PAPER_TONE[key] ? PAPER_TONE[key] : hex;

// a filled body part in the current style
function part(path, fill, o = {}) {
  const ink = BC.ink;
  if (STYLE === "flat") {
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    fillPath(path, shade(fill, -0.22));
    ctx.save(); ctx.translate(o.sx ?? -9, o.sy ?? -11); fillPath(path, fill); ctx.restore();
    if (o.hl !== false) {  // soft highlight streak, upper left
      ctx.globalAlpha = 0.35; ctx.fillStyle = "#fff";
      const b = o.hlAt || [0, 0, 40];
      ctx.beginPath(); ctx.ellipse(b[0], b[1], b[2], b[2] * 0.45, -0.6, 0, 7); ctx.fill();
    }
    ctx.restore();
    strokePath(path, ink, o.lw ?? 8);
  } else {
    ctx.save();
    ctx.shadowColor = "rgba(45,28,16,0.35)"; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 8; ctx.shadowBlur = 7;
    fillPath(path, fill); ctx.restore();
    ctx.save(); ctx.beginPath(); path(); ctx.clip();          // engraving hatch, heavier on the shadow side
    ctx.strokeStyle = "rgba(29,27,46,0.16)"; ctx.lineWidth = 2;
    for (let i = -600; i < 600; i += 11) { ctx.beginPath(); ctx.moveTo(i, -700); ctx.lineTo(i + 700, 0); ctx.stroke(); }
    ctx.globalAlpha = 0.12; fillPath(() => { ctx.save(); ctx.translate(14, 16); path(); ctx.restore(); }, "#000");
    ctx.restore();
    strokePath(path, ink, 3.5);
  }
}
// a limb from (x1,y1) to (x2,y2), bending sideways by `bend`
function limb(x1, y1, x2, y2, bend, color, w = 16) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  if (STYLE === "flat") {
    strokePath(() => { ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); }, BC.ink, w);
  } else {  // two paper strips pinned at the elbow
    const ex = (x1 + 2 * cx + x2) / 4, ey = (y1 + 2 * cy + y2) / 4;
    for (const [a, b, c2, d] of [[x1, y1, ex, ey], [ex, ey, x2, y2]]) {
      ctx.save(); ctx.shadowColor = "rgba(45,28,16,0.3)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 5; ctx.shadowBlur = 4;
      strokePath(() => { ctx.moveTo(a, b); ctx.lineTo(c2, d); }, BC.ink, w + 7); ctx.restore();
      strokePath(() => { ctx.moveTo(a, b); ctx.lineTo(c2, d); }, color, w);
    }
    ctx.fillStyle = "#c9a44a"; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = BC.ink; ctx.lineWidth = 2; ctx.stroke();
  }
}
function foot(x, y, color) {
  if (STYLE === "flat") part(() => ctx.ellipse(x + 10, y - 12, 30, 15, 0, 0, 7), BC.ink, { lw: 4, hl: false });
  else part(() => ctx.ellipse(x + 8, y - 10, 24, 11, 0, 0, 7), color, {});
}
function hand(x, y, color) {
  if (STYLE === "flat") part(() => ctx.arc(x, y, 15, 0, 7), color, { lw: 6, hl: false, sx: -3, sy: -4 });
  else part(() => ctx.arc(x, y, 12, 0, 7), color, {});
}
// blink: 0 open .. 1 shut, from a seeded schedule (every 2.2-4 s, 0.14 s long)
function blinkAt(t, seed) {
  let tb = 0.4 + rnd(seed, 0) * 2;
  for (let i = 1; tb < t + 1 && i < 200; i++) {
    if (t >= tb && t < tb + 0.14) return Math.sin((t - tb) / 0.14 * Math.PI);
    tb += 2.2 + rnd(seed, i) * 1.8;
  }
  return 0;
}
// mouth openness while talking: syllable-rate flap (in production, keyed to voice word times)
const flap = (t, seed) => 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + rnd(seed, Math.floor(t * 6)) * 2));

// face. f = {x, y, sz, mood, look:[dx,dy], blink, talk, body}; moods: neutral, happy, smug, tired, worried, shocked, angry, proud
function face(f) {
  const { x, y, sz } = f, sp = sz * 0.62, mood = f.mood || "neutral";
  const look = f.look || [0, 0];
  const shock = mood === "shocked";
  for (const side of [-1, 1]) {
    const ex = x + side * sp, ey = y;
    if (STYLE === "flat") {
      const rx = sz * 0.42 * (shock ? 1.15 : 1), ry = sz * 0.52 * (shock ? 1.2 : 1) * (1 - 0.92 * (f.blink || 0));
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, rx, Math.max(ry, 2), 0, 0, 7); ctx.fill();
      ctx.strokeStyle = BC.ink; ctx.lineWidth = 6; ctx.stroke();
      if (ry > 6) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, 7); ctx.clip();
        const pr = sz * (shock ? 0.13 : 0.2);
        ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45, ey + look[1] * ry * 0.4 + sz * 0.05, pr, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex + look[0] * rx * 0.45 - pr * 0.35, ey + look[1] * ry * 0.4 - pr * 0.2, pr * 0.32, 0, 7); ctx.fill();
        // heavy lids: tired / smug
        const lid = mood === "tired" ? 0.55 : mood === "smug" ? 0.42 : 0;
        if (lid) {
          ctx.fillStyle = f.body; ctx.fillRect(ex - rx - 2, ey - ry - 2, rx * 2 + 4, ry * 2 * lid + 2);
          strokePath(() => { ctx.moveTo(ex - rx, ey - ry + ry * 2 * lid); ctx.lineTo(ex + rx, ey - ry + ry * 2 * lid); }, BC.ink, 5);
        }
        ctx.restore();
      }
      if (mood === "tired") strokePath(() => { ctx.arc(ex, ey + ry * 0.55, rx * 0.8, 0.35, Math.PI - 0.35); }, shade(f.body, -0.35), 4);  // eye bags
      // brows
      const bt = { angry: 0.45, worried: -0.4, shocked: -0.15, smug: 0.2, proud: -0.1 }[mood] ?? 0;
      const by = ey - sz * 0.62 - (shock ? sz * 0.18 : 0);
      strokePath(() => { ctx.moveTo(ex - side * sz * 0.3, by + bt * sz * 0.3 * -1 * -1); ctx.lineTo(ex + side * sz * 0.3, by - bt * sz * 0.3 * -1 * -1 + (bt ? 0 : 0)); }, BC.ink, 7);
    } else {
      const r = sz * 0.3;
      ctx.fillStyle = "#fbf6ea"; ctx.beginPath(); ctx.arc(ex, ey, r, 0, 7); ctx.fill();
      ctx.strokeStyle = BC.ink; ctx.lineWidth = 3; ctx.stroke();
      const shut = (f.blink || 0) > 0.5;
      if (shut) strokePath(() => { ctx.moveTo(ex - r * 0.8, ey); ctx.lineTo(ex + r * 0.8, ey); }, BC.ink, 3);
      else {
        ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.arc(ex + look[0] * r * 0.35, ey + look[1] * r * 0.3, r * (shock ? 0.22 : 0.38), 0, 7); ctx.fill();
        const lid = mood === "tired" ? 0.5 : mood === "smug" ? 0.38 : 0;
        if (lid) { ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, r + 1, 0, 7); ctx.clip(); ctx.fillStyle = f.body; ctx.fillRect(ex - r - 2, ey - r - 2, 2 * r + 4, 2 * r * lid + 2); ctx.restore();
          strokePath(() => { ctx.moveTo(ex - r, ey - r + 2 * r * lid); ctx.lineTo(ex + r, ey - r + 2 * r * lid); }, BC.ink, 3); }
      }
      const bt = { angry: 0.45, worried: -0.4, shocked: -0.3 }[mood] ?? 0;
      if (bt) strokePath(() => { ctx.moveTo(ex - side * r, ey - r * 1.6 + bt * r * 0.6); ctx.lineTo(ex + side * r, ey - r * 1.6 - bt * r * 0.6); }, BC.ink, 3.5);
    }
  }
  // mouth
  const my = y + sz * 0.72, mw = sz * 0.5;
  const talk = f.talk || 0;
  if (talk > 0.05 || shock) {
    const oh = shock ? sz * 0.34 : sz * 0.3 * talk, ow = shock ? mw * 0.55 : mw * (0.7 + 0.3 * talk);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7);
    ctx.fillStyle = STYLE === "flat" ? "#5a1f2b" : BC.ink; ctx.fill(); ctx.clip();
    if (STYLE === "flat") { ctx.fillStyle = "#e86a7a"; ctx.beginPath(); ctx.ellipse(x, my + oh * 1.1, ow * 0.7, oh * 0.6, 0, 0, 7); ctx.fill(); }
    ctx.restore();
    if (STYLE === "flat") { ctx.beginPath(); ctx.ellipse(x, my + oh * 0.3, ow, Math.max(oh, 3), 0, 0, 7); ctx.strokeStyle = BC.ink; ctx.lineWidth = 5; ctx.stroke(); }
  } else {
    const lw = STYLE === "flat" ? 6 : 3.5;
    const curve = { happy: 0.5, proud: 0.45, smug: 0.25, tired: -0.1, worried: -0.35, angry: -0.3 }[mood] ?? 0.15;
    if (mood === "smug") strokePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x + mw * 0.2, my + mw * 0.25, x + mw * 0.75, my - mw * 0.3); }, BC.ink, lw);
    else strokePath(() => { ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x, my + curve * mw, x + mw * 0.6, my); }, BC.ink, lw);
  }
}
function sweat(x, y, k, s = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + k * 20); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3) * clamp((1 - k) * 4);
  part(() => { ctx.moveTo(0, -26); ctx.quadraticCurveTo(16, 0, 0, 12); ctx.quadraticCurveTo(-16, 0, 0, -26); }, "#9fd8f0", { lw: 4, hl: false });
  ctx.restore();
}

// ---- the cast -------------------------------------------------------------------------------------------
// o = {t, mood, talk, look, walk (phase or null), arms: "rest"|"up"|"hips"|"point"|"mug", seed, s, flip}
const CAST = {
  liver(o) {
    const c = tone("liver", BC.liver), t = o.t;
    const body = () => smooth([[-190, -318], [-70, -352], [70, -340], [182, -300], [178, -266], [96, -222], [-20, -168], [-140, -150], [-205, -215]]);
    legs(o, -70, 0, -160, c);
    arm(o, "L", -180, -250, c); 
    part(body, c, { hlAt: [-110, -300, 60] });
    // gallbladder sidekick, hanging under the right edge
    ctx.save(); ctx.translate(40, -178 + Math.sin(t * 3) * 3); ctx.rotate(Math.sin(t * 2.2) * 0.08);
    part(() => { ctx.moveTo(0, 0); ctx.quadraticCurveTo(34, 20, 26, 58); ctx.quadraticCurveTo(0, 82, -24, 56); ctx.quadraticCurveTo(-30, 22, 0, 0); }, tone("bile", BC.bile), { hlAt: [-8, 30, 12], lw: 6 });
    ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.arc(-9, 40, 4, 0, 7); ctx.arc(9, 40, 4, 0, 7); ctx.fill();
    ctx.restore();
    arm(o, "R", 140, -275, c);
    face({ x: -40, y: -272, sz: 68, mood: o.mood || "tired", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
  },
  brain(o) {
    const c = tone("brain", BC.brain), t = o.t;
    const pts = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 1 + 0.05 * Math.sin(a * 9); pts.push([Math.cos(a) * 170 * r, -318 + Math.sin(a) * 130 * r]); }
    const body = () => smooth(pts);
    legs(o, -40, 40, -190, c);
    // brain stem as the neck
    part(() => ctx.roundRect(-26, -215, 52, 50, 18), shade(c, -0.12), { hl: false, lw: STYLE === "flat" ? 7 : 3 });
    arm(o, "L", -150, -250, c);
    part(body, c, { hlAt: [-90, -380, 50] });
    ctx.save(); ctx.beginPath(); body(); ctx.clip();       // gyri
    const g = shade(c, -0.28);
    for (let k = 0; k < 7; k++) {
      const y0 = -430 + k * 34, s = 7 + k;
      strokePath(() => { ctx.moveTo(-190, y0); for (let x = -190; x <= 190; x += 38) ctx.quadraticCurveTo(x + 19, y0 + (rnd(s, x) - 0.5) * 50, x + 38, y0 + (rnd(s + 1, x) - 0.5) * 16); }, g, STYLE === "flat" ? 6 : 3);
    }
    strokePath(() => { ctx.moveTo(0, -450); ctx.quadraticCurveTo(8, -400, 0, -350); }, shade(c, -0.4), STYLE === "flat" ? 7 : 3.5);
    ctx.restore();
    arm(o, "R", 150, -250, c);
    // face panel so the eyes read over the folds
    face({ x: 0, y: -305, sz: 72, mood: o.mood || "smug", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
    if (o.crown !== false) crown(70 + (o.crownFall || 0) * 120, -438 + (o.crownFall || 0) * 380, 0.35 + (o.crownFall || 0) * 2.6);
  },
  heart(o) {
    const c = tone("heart", BC.heart), t = o.t;
    const beat = o.beat ? Math.max(0, Math.sin(t * Math.PI * 2 * 1.2)) ** 6 : 0;
    legs(o, -45, 45, -150, c);
    ctx.save(); ctx.translate(0, -260); ctx.scale(1 + beat * 0.07, 1 - beat * 0.05); ctx.translate(0, 260);
    // great vessels, behind the body: aorta arch (red) and vena cava (blue)
    const v = tone("vein", BC.vein);
    const tube = (path, col, w) => { if (STYLE === "flat") { strokePath(path, BC.ink, w + 16); strokePath(path, col, w); } else { strokePath(path, BC.ink, w + 7); strokePath(path, col, w); } };
    tube(() => { ctx.moveTo(-70, -330); ctx.lineTo(-78, -440); }, v, 44);
    tube(() => { ctx.moveTo(10, -340); ctx.bezierCurveTo(0, -470, 120, -480, 110, -370); }, shade(c, -0.08), 50);
    arm(o, "L", -150, -270, c);
    const body = () => { ctx.moveTo(0, -150); ctx.bezierCurveTo(-120, -210, -190, -270, -170, -345); ctx.bezierCurveTo(-150, -410, -60, -410, -10, -360); ctx.bezierCurveTo(40, -410, 150, -410, 165, -335); ctx.bezierCurveTo(180, -250, 90, -200, 0, -150); ctx.closePath(); };
    part(body, c, { hlAt: [-100, -350, 45] });
    // sweatband
    ctx.save(); ctx.beginPath(); body(); ctx.clip();
    ctx.fillStyle = "#fff"; ctx.fillRect(-200, -392, 400, 34);
    ctx.fillStyle = tone("lymph", BC.lymph); ctx.fillRect(-200, -380, 400, 10);
    ctx.restore();
    strokePath(body, BC.ink, STYLE === "flat" ? 8 : 3.5);
    arm(o, "R", 150, -290, c);
    face({ x: -5, y: -290, sz: 70, mood: o.mood || "proud", look: o.look, blink: blinkAt(t, o.seed), talk: o.talk, body: c });
    ctx.restore();
  },
  microbe(o) {  // o.kind: rod | coccus | spiral; about 130 tall
    const t = o.t, k = o.kind || "rod", sd = o.seed || 1;
    const col = o.color || [tone("bile", BC.bile), tone("neuron", BC.neuron), tone("lymph", BC.lymph), BC.sun][sd % 4];
    const hop = Math.abs(Math.sin(t * 5 + sd)) * 16 * (o.hop ?? 1);
    ctx.save(); ctx.translate(0, -hop); ctx.rotate(Math.sin(t * 3 + sd) * 0.12);
    if (k === "rod") {
      for (let i = 0; i < 4; i++) strokePath(() => { ctx.moveTo(-60, -70 + i * 6); ctx.quadraticCurveTo(-95, -60 + Math.sin(t * 9 + i) * 14, -120, -80 + i * 10); }, BC.ink, 4);
      part(() => ctx.roundRect(-72, -110, 144, 76, 38), col, { hlAt: [-30, -95, 22], lw: 6 });
      face({ x: 5, y: -78, sz: 30, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    } else if (k === "coccus") {
      part(() => ctx.arc(-34, -46, 34, 0, 7), shade(col, -0.05), { lw: 6, hl: false });
      part(() => ctx.arc(8, -66, 48, 0, 7), col, { hlAt: [-10, -90, 16], lw: 6 });
      face({ x: 8, y: -72, sz: 28, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    } else {
      const path = () => { ctx.moveTo(-80, -60); for (let x = -80; x <= 80; x += 4) ctx.lineTo(x, -60 + Math.sin(x * 0.07 + t * 6) * 22); };
      strokePath(path, BC.ink, STYLE === "flat" ? 34 : 26); strokePath(path, col, STYLE === "flat" ? 20 : 20);
      part(() => ctx.arc(86, -60 + Math.sin(86 * 0.07 + t * 6) * 22, 36, 0, 7), col, { lw: 6, hl: false });
      face({ x: 86, y: -64 + Math.sin(86 * 0.07 + t * 6) * 22, sz: 26, mood: o.mood || "happy", look: o.look, blink: blinkAt(t, sd), talk: o.talk, body: col });
    }
    ctx.restore();
  },
};
function crown(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  part(() => { ctx.moveTo(-44, 0); ctx.lineTo(-50, -52); ctx.lineTo(-22, -24); ctx.lineTo(0, -64); ctx.lineTo(22, -24); ctx.lineTo(50, -52); ctx.lineTo(44, 0); ctx.closePath(); }, BC.sun, { hlAt: [-20, -30, 14], lw: 6 });
  ctx.restore();
}
function legs(o, hx1, hx2, hy, c) {
  const w = o.walk;
  [[hx1, 0], [hx2, Math.PI]].forEach(([hx, ph]) => {
    const sw = w != null ? Math.sin(w + ph) : 0, lift = w != null ? Math.max(0, Math.cos(w + ph)) * 26 : 0;
    const fx = hx + sw * 46, fy = -lift;
    limb(hx, hy, fx, fy - 8, (hx < 0 ? -1 : 1) * 10 + sw * 10, c, STYLE === "flat" ? 16 : 18);
    foot(fx, fy, c);
  });
}
function arm(o, side, sx, sy, c) {
  const pose = (o.arms && o.arms[side]) || o.arms || "rest", sg = side === "L" ? -1 : 1, t = o.t;
  let hx, hy, bend;
  if (pose === "up") { hx = sx + sg * 70; hy = sy - 150 + Math.sin(t * 8) * 10; bend = sg * 30; }
  else if (pose === "hips") { hx = sx + sg * 10; hy = sy + 90; bend = sg * -60; }
  else if (pose === "point") { hx = sx + sg * 150; hy = sy - 40; bend = sg * 12; }
  else if (pose === "mug") { hx = sx + sg * 55; hy = sy + 95; bend = sg * -30; }
  else if (pose === "wave") { hx = sx + sg * 80; hy = sy - 130 + Math.sin(t * 12) * 20; bend = sg * 20; }
  else { hx = sx + sg * 40; hy = sy + 110 + Math.sin(t * 2 + sg) * 4; bend = sg * 26; }
  limb(sx, sy, hx, hy, bend, c, STYLE === "flat" ? 14 : 16);
  if (pose === "mug") mug(hx, hy);
  else hand(hx, hy, c);
}
function mug(x, y) {
  part(() => ctx.roundRect(x - 26, y - 44, 52, 58, 8), "#fdfaf2", { lw: STYLE === "flat" ? 6 : 3, hl: false });
  strokePath(() => { ctx.arc(x + 30, y - 16, 14, -1.3, 1.3); }, BC.ink, STYLE === "flat" ? 6 : 3);
  ctx.fillStyle = "#6b4226"; ctx.fillRect(x - 20, y - 40, 40, 8);
  hand(x - 26, y - 10, tone("liver", BC.liver));
  for (let i = 0; i < 2; i++) { const k = (T * 0.8 + i * 0.5) % 1; ctx.save(); ctx.globalAlpha = 0.5 * (1 - k);
    strokePath(() => { ctx.moveTo(x - 8 + i * 16, y - 52 - k * 50); ctx.quadraticCurveTo(x + 4 + i * 16, y - 64 - k * 50, x - 8 + i * 16, y - 80 - k * 50); }, "#fff", 5); ctx.restore(); }
}
// place a character: breathing squash-stretch about the feet; flip mirrors the body but not text
function char(kind, x, y, s, o) {
  ctx.save(); ctx.translate(x, y);
  if (STYLE === "paper") { const f = Math.floor(o.t * 12), id = (o.seed || 1) * 7; ctx.translate((rnd(id, f, 1) - 0.5) * 2.2, (rnd(id, f, 2) - 0.5) * 2.2); ctx.rotate((rnd(id, f, 3) - 0.5) * 0.01); }
  const br = Math.sin(o.t * 2.4 + (o.seed || 0)) * 0.018;
  ctx.scale(s * (o.flip ? -1 : 1) * (1 - br * 0.6), s * (1 + br));
  // ground shadow
  ctx.save(); ctx.globalAlpha = STYLE === "flat" ? 0.18 : 0.12; ctx.fillStyle = BC.ink; ctx.beginPath(); ctx.ellipse(0, 4, kind === "microbe" ? 80 : 150, kind === "microbe" ? 12 : 18, 0, 0, 7); ctx.fill(); ctx.restore();
  T = o.t; CAST[kind](o);
  ctx.restore();
}

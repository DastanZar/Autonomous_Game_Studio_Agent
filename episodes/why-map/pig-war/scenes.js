// The Pig War (1859). House method: paper cast and props (paper kit), 3D map flights for geography (flight kit),
// the one big number in moving type (kinetic kit), official flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const HARO = [[-123.215, 48.80], [-123.25, 48.72], [-123.215, 48.64], [-123.18, 48.56], [-123.165, 48.49], [-123.20, 48.40]];
const ROSARIO = [[-122.80, 48.80], [-122.755, 48.70], [-122.73, 48.60], [-122.76, 48.50], [-122.79, 48.40]];
const US_BLUE = 0x2f4f8f, UK_RED = 0xc0442c;

// ---------- the two flights: the disputed years (neutral land) and the settlement (US orange) ----------
const F1 = makeFlight({
  origin: [-123.06, 48.55], near: "s_two", far: "s_treaty", colors: { default: 0xe2cfa2 }, sea: 0x93b4ae, switchKm: 260,
  trees: { n: 2600, scale: 1.4, span: [90, 70] },
  lines: [
    { pts: [[-114, 49], [-123.3, 49]], color: UK_RED, width: 9, layer: "far", from: at("treaty/border") - 0.2, to: at("treaty/channel") + 0.2 },
    { pts: HARO, color: US_BLUE, width: 0.22, from: at("two/two") - 0.1, to: at("two/channels") + 0.3, smooth: 0.3 },
    { pts: ROSARIO, color: UK_RED, width: 0.22, from: at("two/channels") - 0.1, to: at("two/both"), smooth: 0.3 },
  ],
  keys: [
    [at("treaty.start"), -119.5, 48.6, 1700, 0, 20], [at("treaty/channel") + 0.2, -123.0, 48.75, 700, 0, 24],
    [at("two.start"), -122.99, 48.6, 70, 0, 28], [at("two.end") + 0.3, -122.99, 48.6, 58, 6, 30],
    [at("stay.start"), -123.09, 48.535, 40, -6, 36], [at("stay.end") + 0.3, -123.09, 48.53, 34, -14, 38],
  ],
});
const F2 = makeFlight({
  origin: [-123.06, 48.55], near: "s_kaiser", colors: { US: 0xd98a3d, default: 0xe2cfa2 }, sea: 0x93b4ae,
  trees: { iso: ["CA"], n: 1500, scale: 1.4, span: [90, 70] },
  lines: [{ pts: HARO, color: UK_RED, width: 0.24, from: at("kaiser/settled") + 0.1, to: at("kaiser/america"), smooth: 0.3 }],
  keys: [[at("kaiser/settled"), -123.0, 48.6, 62, 0, 28], [at("kaiser.end") + 0.4, -123.0, 48.6, 52, 10, 30]],
});

// ---------- the island, side view ----------
function island(t, o = {}) {
  sky({ sunX: o.sunX ?? 840, sunY: 380, top: o.top });
  ridge(900, 320, KA.mtnFar, 0, 3, 0, true); haze(560, 940, 0.45);
  seaBand(900, 1010, 0);
  grass(1000, 1060, 0, KA.moss);
  for (let i = 0; i < 9; i++) pine(40 + i * 130 + rnd(i, 7) * 40, 1050, 0.5 + rnd(i, 8) * 0.25, i, tone(KA.moss, -0.05), 0.55);
  nearGround(1060, 0, o.ground || "#9fae6a");
}
function potatoes(x0, x1, y) { for (let r = 0; r < 3; r++) for (let x = x0; x < x1; x += 70) { const yy = y + r * 60; piece(blob(x + (r % 2) * 35, yy, 30, 12, 9, x + r, 0.2), "#7a5a3a", { lw: 2.5, rim: 3, sx: 2, sy: 3 }); piece(blob(x + (r % 2) * 35, yy - 18, 22, 16, 9, x * 3 + r, 0.3), KA.moss2, { lw: 2.5, rim: 3, sx: 2, sy: 3 }); } }
function zoomAround(cx, cy, z, draw) { ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); draw(); ctx.restore(); }

// 1. HOOK: the standoff, then the camera finds what it is about
CU.hook = (t, S) => {
  const tp = at("hook/pig"), z = 1 + 0.9 * eio(pp(t, tp - 0.55, 0.6));
  zoomAround(540, 1240, z, () => {
    island(t);
    potatoes(380, 720, 1190);
    for (let i = 0; i < 3; i++) trooper({ x: 90 + i * 95, gy: 1240 + i * 18, s: 0.82, side: "US", musket: true, id: 10 + i, look: 1, brow: 0.6 });
    for (let i = 0; i < 3; i++) trooper({ x: 990 - i * 95, gy: 1240 + i * 18, s: 0.82, side: "UK", dir: -1, musket: true, id: 20 + i, look: 1, brow: 0.6 });
    pig({ x: 540, gy: 1290, s: 0.8, chew: 1, dir: 1, id: 41 });
  });
  if (z < 1.3) { flagArt("US", 70, 360, 180); flagArt("GB", W - 250, 360, 180); }
  stamp("1859", 540, 400, t - at("hook/in") - 0.3, { size: 120, rot: -0.08 });
  if (t > tp) { const k = spring(pp(t, tp, 0.5)); ctx.save(); ctx.translate(540, 660); ctx.scale(k, k); text("?!", 0, 0, { size: 150, color: KA.red, stroke: 14 }); ctx.restore(); }
  brandTag(BRAND);
};
// 2. TREATY: the 1846 line drawn across the continent toward "the middle of the channel"
CU.treaty = (t, S) => {
  F1.draw(t);
  if (F1.cam(t).h > 260) { flightPin(F1, "1846", -116, 49, t, at("treaty/eighteen"), { size: 44, bg: KA.mustard, h: 6.5, up: 60 }); flightPin(F1, "BRITISH", -121, 51.4, t, at("treaty/treaty"), { size: 36, h: 6.5, up: 20 }); flightPin(F1, "AMERICAN", -120, 46.6, t, at("treaty/treaty"), { size: 36, h: 6.5, up: 20 }); }
  kText("“the middle of the channel”", W / 2, 470, 64, t, at("treaty/middle") - 0.1, { font: "Serif", color: KA.cream, stroke: 10, ink: KA.ink, stagger: 0.015 });
  brandTag(BRAND);
};
// 3. TWO: the two channels, both claims
CU.two = (t, S) => {
  F1.draw(t);
  flightPin(F1, "HARO STRAIT", -123.2, 48.62, t, at("two/two"), { size: 32, bg: "#cfd8ef", up: 90 });
  flightPin(F1, "ROSARIO STRAIT", -122.75, 48.58, t, at("two/channels"), { size: 32, bg: "#f2c9bd", up: 90 });
  flightPin(F1, "SAN JUAN ISLANDS", -123.02, 48.53, t, at("two/both"), { size: 36, bg: KA.mustard, up: 150 });
  kText("TWO CHANNELS", W / 2, 470, 110, t, at("two/two") - 0.1, { color: KA.cream, stroke: 14, ls: 4 });
  const kb = pp(t, at("two/both"), 0.5); if (kb > 0) { ctx.save(); ctx.globalAlpha = 0.25 * Math.abs(Math.sin((t - at("two/both")) * 8)) * (1 - pp(t, at("two/between"), 0.6)); ctx.fillStyle = KA.mustard; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  brandTag(BRAND);
};
// 4. PIG: the farmer, the garden, the pig, the shot
CU.pig = (t, S) => {
  const ts = at("pig/shot"), dead = eio(pp(t, ts + 0.05, 0.5));
  island(t, { ground: "#a3ae6c" });
  potatoes(300, 1050, 1190);
  pig({ x: 720, gy: 1300, s: 1.05, chew: dead > 0 ? 0 : 1, dead, id: 41 });
  local({ x: 210, gy: 1330, s: 0.95, hat: "straw", plaid: false, coat: "#6e7f9a", straps: "#3f5873", beard: "#7a5a3a", look: 1, brow: t > at("pig/pig") ? 0.9 : 0, blink: 0.4, id: 9, arm: t > ts - 0.6 ? "hold" : null,
    carry: t > ts - 0.6 ? () => { ctx.save(); ctx.rotate(-0.15); piece(() => ctx.roundRect(-10, -16, 150, 14, 4), KA.wood, { lw: 3, rim: 3 }); piece(() => ctx.roundRect(60, -14, 120, 8, 3), "#8a8a84", { lw: 2.5, rim: 2, shadow: false }); ctx.restore(); } : null });
  if (t > ts && t < ts + 0.8) { const k = pp(t, ts, 0.8); piece(blob(420 + k * 60, 1080 - k * 80, 40 + k * 70, 30 + k * 50, 12, 3, 0.2), KA.cream, { lw: 3, rim: 4, alpha: 1 - k }); }
  stamp("BANG", 560, 860, t - ts, { size: 120, rot: -0.12, color: KA.red });
  popLabel("JUNE 15, 1859 · SAN JUAN ISLAND", W / 2, 380, t, S.t0 + 0.1, { size: 34, bg: KA.cream });
  popLabel("A HUDSON'S BAY COMPANY PIG", 760, 1010, t, at("pig/pig") - 0.1, { size: 30 });
  brandTag(BRAND);
};
// 5. MONEY: the offer and the demand
CU.money = (t, S) => {
  island(t);
  local({ x: 230, gy: 1300, s: 0.95, hat: "straw", plaid: false, coat: "#6e7f9a", straps: "#3f5873", beard: "#7a5a3a", look: 1, blink: 1.2, id: 9, arm: "hold" });
  local({ x: 850, gy: 1300, s: 0.95, dir: -1, hat: "top", plaid: false, coat: "#3a3a46", beard: false, mustache: "#5a4636", look: 1, blink: 0.6, id: 12, brow: t > at("money/hundred") ? 0.9 : 0 });
  pig({ x: 540, gy: 1320, s: 0.7, dead: 1, id: 41 });
  const k1 = spring(pp(t, at("money/ten") - 0.1, 0.6)), k2 = spring(pp(t, at("money/hundred") - 0.1, 0.6));
  card(290, 560, 380, 260, -0.05, k1, (w, h) => { text("OFFERED", 0, -h / 2 + 52, { size: 32, font: "Elite" }); rollNumber(10 * eout(pp(t, at("money/ten") - 0.1, 0.5)), 0, 70, 130, { color: KA.moss2, fmt: v => "$" + Math.round(v), roll: false }); });
  card(790, 560, 380, 260, 0.05, k2, (w, h) => { text("WANTED", 0, -h / 2 + 52, { size: 32, font: "Elite" }); rollNumber(100 * eout(pp(t, at("money/hundred") - 0.1, 0.6)), 0, 70, 130, { color: KA.red, fmt: v => "$" + Math.round(v), roll: false }); });
  stamp("NO DEAL", 540, 860, t - at("money/dollars#1") - 0.25, { size: 100, rot: -0.1, color: KA.red });
  brandTag(BRAND);
};
// 6. ARMY: an arrest warrant; then the US Army lands 64 soldiers
CU.army = (t, S) => {
  const ta = at("army/arrest"), t64 = at("army/sixtyfour"), land = pp(t, at("army/so") - 0.2, 2.6);
  island(t, { ground: "#c9bb8a" });
  trooper({ x: 900, gy: 1270, s: 0.9, side: "UK", dir: -1, id: 30, look: 1, brow: 0.7 });
  const kw = spring(pp(t, ta - 0.1, 0.6));
  card(830, 560, 330, 300, 0.06, kw, (w, h) => { text("WARRANT", 0, -h / 2 + 60, { size: 44 }); rule(-120, 120, -h / 2 + 80); text("for the arrest of", 0, -10, { size: 26, font: "Elite" }); text("L. CUTLAR", 0, 40, { size: 40, font: "Elite" }); });
  // 64 soldiers in 4 ranks of 16, marching in from the left
  for (let r = 0; r < 4; r++) for (let c = 0; c < 16; c++) {
    const i = r * 16 + c, x = lerp(-900, 60, eout(land)) + c * 34 + (r % 2) * 17, y = 1150 + r * 42;
    if (x < -40 || x > 760) continue;
    trooper({ x, gy: y, s: 0.36, side: "US", musket: true, walk: land < 1 ? t * 8 + i : null, id: 100 + i, look: 1 });
  }
  if (t > t64 - 0.1) { const v = 64 * eout(pp(t, t64 - 0.1, 0.6)); rollNumber(v, 260, 520, 200, { color: KA.cream, stroke: 14, ink: KA.ink }); kText("SOLDIERS", 260, 590, 52, t, t64, { color: KA.navy, ls: 6 }); }
  brandTag(BRAND);
};
// 7. SHIPS: three British warships steam in
CU.ships = (t, S) => {
  sky({ sunX: 900, sunY: 560, top: "#d9cdb4" }); ridge(860, 300, KA.mtnFar, 0, 3, 0, true); haze(560, 920, 0.5);
  seaBand(860, H, 0, KA.sea2);
  [[0, 0.55, 1010, 800], [0.12, 0.78, 1180, 300], [0.24, 1.0, 1700, 640]].forEach(([d, s, y, xe], i) => warship({ x: lerp(W + 500 * s, xe, eout(pp(t, S.t0 - 0.3 + d, 1.2))), gy: y, s, dir: -1, flag: "GB", id: 60 + i }));
  kText("HMS TRIBUNE · 31 GUNS", W / 2, 420, 50, t, S.t0 + 0.3, { color: KA.ink, font: "Elite", stagger: 0.02 });
  brandTag(BRAND);
};
// 8. FORCES: 461 Americans (one dot each) against five warships
CU.forces = (t, S) => {
  paperBG(KA.paper); graphPaper();
  const t4 = at("forces/four"), t5 = at("forces/five");
  text("AUGUST 31, 1859", W / 2, 330, { size: 40, font: "Elite" });
  unitChart(t, 461, 70, 480, 20, 22, 8, KA.navy, { t0: t4 - 0.1, dur: 1.0 });
  if (t > t4) { rollNumber(461 * eout(pp(t, t4, 0.9)), 280, 1120, 110, { color: KA.navy }); text("AMERICANS · 14 CANNONS", 280, 1170, { size: 26, font: "Elite" }); }
  for (let i = 0; i < 5; i++) { const k = spring(pp(t, t5 + i * 0.12, 0.5)); if (k <= 0) continue; ctx.save(); ctx.translate(i < 4 ? 700 + (i % 2) * 210 : 805, 660 + Math.floor(i / 2) * 190); ctx.scale(k * 0.26, k * 0.26); warship({ x: 0, gy: 0, s: 1, dir: -1, flag: "GB", id: 70 + i, smoke: false }); ctx.restore(); }
  if (t > t5) { text("5", 805, 1120, { size: 110, color: KA.red }); text("BRITISH WARSHIPS", 805, 1170, { size: 26, font: "Elite" }); }
  popLabel("British side: 70 cannons, 2,140 men · " + (S.p.label || "Wikipedia's summary figure"), W / 2, 1460, t, t5 + 0.6, { size: 24, bg: KA.cream });
  brandTag(BRAND);
};
// 9. ADMIRAL: he refuses
CU.admiral = (t, S) => {
  sky({ sunX: 860, sunY: 360, top: "#d9cdb4" }); seaBand(900, H, 0, KA.sea2);
  piece(() => { ctx.moveTo(-20, 1140); ctx.lineTo(W + 20, 1100); ctx.lineTo(W + 20, H); ctx.lineTo(-20, H); ctx.closePath(); }, "#8a6142", { lw: 4.5, rim: 10 });     // the deck
  for (let i = 0; i < 9; i++) line(-20, 1170 + i * 80, W + 20, 1130 + i * 80, "rgba(43,35,32,0.3)", 3);
  const shake = t > at("admiral/refused") ? Math.sin(t * 12) * 0.08 * Math.exp(-(t - at("admiral/refused")) * 1.5) : 0;
  trooper({ x: 850, gy: 1520, s: 1.35, side: "navy", dir: -1, id: 80, whiskers: "#e8e2d6", mustache: "#e8e2d6", skin: "#e8c4a8", look: 1, brow: -0.6 + shake * 4 });
  quoteCard(400, 600, 660, "...involve two great nations in a war over a squabble about a pig.", "Rear Admiral R. L. Baynes, 1859", t, at("admiral/refused") - 0.1, { size: 44 });
  brandTag(BRAND);
};
// 10. STAY: two camps, twelve years
CU.stay = (t, S) => {
  F1.draw(t);
  flightPin(F1, "ENGLISH CAMP", -123.152, 48.588, t, S.t0 + 0.2, { size: 32, bg: "#f2c9bd", up: 60 });
  flightPin(F1, "AMERICAN CAMP", -123.025, 48.465, t, S.t0 + 0.5, { size: 32, bg: "#cfd8ef", up: 110 });
  const tw = at("stay/twelve");
  if (t > tw - 0.2) { const y = Math.floor(1860 + 12 * eout(pp(t, tw - 0.2, 1.0))); bigNumber(t, tw - 0.2, { value: 12, label: "YEARS", sub: `1860 → ${y}`, stroke: 14, size: 240, y: 560, roll: 0.9, colors: { fg: KA.cream, accent: KA.red, ink: KA.ink }, subColor: KA.ink }); }
  brandTag(BRAND);
};
// 11. KAISER: the arbitration, then the line through Haro Strait
CU.kaiser = (t, S) => {
  const tk = at("kaiser/settled") + 0.1;
  if (t < tk) {
    paperBG(KA.paper); desk();
    trooper({ x: 270, gy: 1620, s: 1.75, side: "pickel", id: 90, whiskers: "#efe9de", mustache: "#efe9de", skin: "#e8c4a8", look: 1 });
    card(720, 700, 520, 440, 0.03, spring(pp(t, S.t0 + 0.1, 0.6)), (w, h) => { text("ARBITRATION", 0, -h / 2 + 64, { size: 48 }); rule(-200, 200, -h / 2 + 84); text("San Juan Water Boundary", 0, -40, { size: 28, font: "Elite" }); text("decided through", 0, 20, { size: 26, font: "Elite" }); text("Kaiser Wilhelm I", 0, 70, { size: 34, font: "Serif" }); stamp("1872", 120, 150, t - at("kaiser/eighteen"), { size: 70, rot: -0.12, color: KA.red, maxW: 260 }); });
  } else {
    F2.draw(t);
    flightPin(F2, "HARO STRAIT · THE BORDER", -123.2, 48.62, t, tk + 0.1, { size: 30, bg: "#f2c9bd", up: 90 });
    kText("AMERICA GOT THE ISLANDS", W / 2, 470, 80, t, at("kaiser/america") - 0.1, { color: KA.cream, stroke: 12, ls: 2 });
  }
  brandTag(BRAND);
};
// 12. TOLL: the one casualty
CU.toll = (t, S) => {
  island(t, { top: "#e2c7a0" });
  potatoes(300, 1050, 1190);
  ctx.save(); ctx.translate(780, 1310);                      // a small grave in the garden
  piece(() => { ctx.moveTo(-70, 0); ctx.lineTo(-70, -120); ctx.quadraticCurveTo(0, -190, 70, -120); ctx.lineTo(70, 0); ctx.closePath(); }, "#c9c4b6", { lw: 4, rim: 8 });
  text("PIG", 0, -96, { size: 34, color: KA.ink }); text("1859", 0, -56, { size: 26, font: "Elite" });
  ctx.restore();
  const to = at("toll/one") - 0.15, dim = eout(pp(t, to - 0.2, 0.3));
  if (dim > 0) { ctx.fillStyle = `rgba(43,35,32,${0.5 * dim})`; ctx.fillRect(0, 0, W, H); }
  bigNumber(t, to, { value: 1, label: "CASUALTY", sub: "the only one: a pig (U.S. National Park Service)", stroke: 16, size: 340, y: 700, roll: 0.4, colors: { fg: KA.cream, accent: KA.red, ink: KA.ink }, subColor: KA.cream });
  brandTag(BRAND);
};

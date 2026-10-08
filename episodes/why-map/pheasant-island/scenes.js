// Pheasant Island: the island that changes country every six months. House method: paper island and props (paper kit),
// a 3D map flight over the real Bidasoa (flight kit; river and island outlines from OpenStreetMap, data/geom.json),
// moving type for the calendar and the 24 meetings (kinetic kit), official flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const GM = JSON.parse(EP.data["data/geom.json"]);
const ISL = [-1.76547, 43.34282];
GEO.ph_near = { layers: GM.near_layers };                    // France / Spain split along the river, plus the island (OSM)
const ES_RED = "#c8452d", ES_YEL = "#f2c14e", FR_BLUE = "#3a5a9c", FR_RED = "#c8452d";

// ---------- the flight: from the Bay of Biscay down to the island ----------
const F = makeFlight({
  origin: ISL, near: "ph_near", far: "s_river", switchKm: 14, sea: 0x8fb0aa,
  colors: { FR: 0xa9bfe8, ES: 0xead6a4, PH: 0x8fae62, default: 0xe2cfa2 },
  trees: { iso: ["PH"], n: 60, scale: 0.35, span: [0.5, 0.3] },
  keys: [
    [at("river.start") - 0.2, -1.7, 43.3, 520, 0, 8], [at("river/spain") + 0.35, -1.72, 43.32, 380, 0, 12], [at("size.start") + 0.1, -1.766, 43.341, 4.5, 0, 26],
    [at("size/two") - 0.3, -1.7655, 43.3424, 2.4, 0, 30], [at("size.end") + 0.3, -1.7655, 43.3426, 0.65, -12, 40],
    [at("share.start"), -1.7655, 43.3427, 0.75, -20, 44], [at("share.end") + 0.3, -1.7655, 43.3427, 0.62, 20, 46],
  ],
});

// ---------- small helpers ----------
function waveFlag(code, x, y, w, ph = 0, k = 1) {         // official flag art, waving like the paper kit's flags
  const img = flagLoad(code); if (!img.complete || !img.naturalWidth) return;
  const h = w * img.naturalHeight / img.naturalWidth, N = 24, amp = w * 0.05, dy = u => Math.sin(u * 5.5 - T * 5.5 + ph) * amp * u;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, 1); ctx.translate(-x, -y);
  ctx.save(); ctx.shadowColor = "rgba(40,25,12,0.28)"; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 7; ctx.shadowBlur = 6; ctx.beginPath();
  for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();
  for (let i = 0; i < N; i++) { const u = i / N; ctx.drawImage(img, img.naturalWidth * u, 0, img.naturalWidth / N + 1, img.naturalHeight, x + w * u, y + dy(u), w / N + 1, h); const l = Math.cos(u * 5.5 - T * 5.5 + ph); ctx.fillStyle = l > 0 ? `rgba(255,250,235,${l * 0.16})` : `rgba(30,20,10,${-l * 0.2})`; ctx.fillRect(x + w * u, y + dy(u), w / N + 1, h); }
  ctx.strokeStyle = KA.ink; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.stroke();
  ctx.restore();
}
// a flagpole whose flag turns over from one country to the other at tFlip (a card flip)
function flipPole(x, gy, h, w, t, tFlip, a, b, dur = 0.5) {
  piece(() => ctx.roundRect(x - 7, gy - h, 14, h, 4), "#d8d1c2", { lw: 3, rim: 4 });
  piece(() => ctx.arc(x, gy - h - 8, 11, 0, 7), KA.mustard, { lw: 3, rim: 4 });
  const k = tFlip == null ? 0 : clamp((t - tFlip) / dur), sx = Math.abs(Math.cos(Math.PI * eio(k)));
  waveFlag(k < 0.5 ? a : b, x + 6, gy - h + 4, w, 0, Math.max(0.04, sx));
}
function houses(y, x0, x1, seed, col) {                    // a row of paper town houses on the far bank
  for (let x = x0, i = 0; x < x1; i++) {
    const w = 60 + rnd(i, seed) * 50, h = 50 + rnd(i, seed + 1) * 60;
    piece(() => ctx.rect(x, y - h, w, h), i % 3 ? col : tone(col, -0.08), { lw: 3, rim: 4, sx: 3, sy: 4 });
    piece(() => { ctx.moveTo(x - 6, y - h); ctx.lineTo(x + w / 2, y - h - 26); ctx.lineTo(x + w + 6, y - h); ctx.closePath(); }, i % 2 ? "#b5674a" : "#9a5a40", { lw: 3, rim: 3, sx: 3, sy: 4 });
    for (let k = 0; k < 2; k++) piece(() => ctx.rect(x + 10 + k * (w - 34), y - h + 16, 14, 16), "#f3dc94", { lw: 2, light: false, shadow: false });
    x += w + 8;
  }
}
// side view of the Bidasoa: France on the far bank, the island mid-river, Spain on the near bank
function islandScene(t, o = {}) {
  sky({ sunX: o.sunX ?? 860, sunY: 380, top: o.top });
  ridge(820, 260, KA.mtnFar, 0, 4, 0, false); haze(520, 900, 0.45);
  piece(() => ctx.rect(-20, 860, W + 40, 90), "#b9c08a", { lw: 3.5, rim: 6, shadow: false });     // far bank (France)
  houses(905, 30, W, 7, "#efe0c4");
  seaBand(940, 1240, 0, KA.sea);
  // the island
  const top = 1040, isle = () => { ctx.moveTo(150, 1110); ctx.bezierCurveTo(220, top - 10, 420, top - 40, 560, top - 34); ctx.bezierCurveTo(720, top - 30, 880, top - 6, 940, 1110); ctx.quadraticCurveTo(540, 1140, 150, 1110); ctx.closePath(); };
  piece(isle, "#8fae62", { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(150, 1110); ctx.quadraticCurveTo(540, 1140, 940, 1110); ctx.lineTo(930, 1124); ctx.quadraticCurveTo(540, 1156, 160, 1124); ctx.closePath(); }, "#b9a27a", { lw: 3, rim: 3, shadow: false });
  for (let i = 0; i < 7; i++) if (i !== 3) pine(210 + i * 108 + rnd(i, 3) * 30, 1070 + Math.abs(i - 3) * 6, 0.34 + rnd(i, 4) * 0.1, i, i % 2 ? KA.pine : KA.moss2);
  // the 1659 monolith in the middle
  piece(() => { ctx.moveTo(530, 1052); ctx.lineTo(540, 930); ctx.lineTo(552, 922); ctx.lineTo(564, 930); ctx.lineTo(574, 1052); ctx.closePath(); }, "#d8d1c2", { lw: 3.5, rim: 5 });
  piece(() => ctx.rect(518, 1046, 68, 16), "#bdb4a3", { lw: 3, rim: 3, shadow: false });
  // near bank (Spain), in the foreground
  piece(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, 1250); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, 1250 + Math.sin(x * 0.01) * 10); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, "#9fae6a", { lw: 4.5, rim: 10, shadow: false });
  if (o.labels !== false) { tag("FRANCE · HENDAYE", 300, 820, { size: 30, bg: "#cfd8ef" }); tag("SPAIN · IRUN", 250, 1205, { size: 30, bg: "#f6dfa0" }); }
}
function calendarTile(x, y, w, h, label, fill, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(lerp(0.7, 1, k), lerp(0.7, 1, k)); ctx.globalAlpha *= clamp(k * 2);
  piece(() => ctx.roundRect(-w / 2, -h / 2, w, h, 10), fill, { lw: 3.5, rim: 6, sx: 4, sy: 6 });
  if (o.stripe) { ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.clip(); ctx.fillStyle = o.stripe; ctx.fillRect(-w / 2, -h / 2 + h * 0.3, w, h * 0.4); ctx.restore(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.lineWidth = 3.5; ctx.strokeStyle = KA.ink; ctx.stroke(); }
  text(label, 0, 14, { size: 40, color: o.color || KA.ink, stroke: o.stroke, ink: KA.ink });
  ctx.restore();
}
function pheasant(x, gy, s, t) {                            // a paper pheasant: copper body, long barred tail, green head, red face
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(77, 0.5 / s);
  footShadow(0, 2, 90);
  for (const lx of [-14, 14]) line(lx, -10, lx - 4, -60, "#7a5a3a", 6);
  piece(() => { ctx.moveTo(-60, -120); ctx.lineTo(-330, -170); ctx.lineTo(-320, -140); ctx.lineTo(-60, -95); ctx.closePath(); }, "#b8864a", { lw: 3.5, rim: 5 });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.55)"; ctx.lineWidth = 4; for (let i = 1; i < 7; i++) { const u = i / 7; ctx.beginPath(); ctx.moveTo(lerp(-60, -330, u), lerp(-120, -170, u) - 2); ctx.lineTo(lerp(-60, -320, u), lerp(-95, -140, u) + 2); ctx.stroke(); } ctx.restore();
  piece(() => ctx.ellipse(0, -100, 90, 56, -0.15, 0, 7), "#b5612e", { lw: 4.5, rim: 9 });
  ctx.save(); ctx.fillStyle = "rgba(43,35,32,0.35)"; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(-50 + (i % 5) * 24, -120 + Math.floor(i / 5) * 22, 4, 0, 7); ctx.fill(); } ctx.restore();
  const bob = Math.sin(t * 3) * 4;
  piece(() => { ctx.moveTo(50, -130); ctx.quadraticCurveTo(80, -200 + bob, 92, -214 + bob); ctx.lineTo(118, -206 + bob); ctx.quadraticCurveTo(96, -160, 86, -110); ctx.closePath(); }, "#2f5a4a", { lw: 3.5, rim: 4 });
  piece(() => ctx.arc(106, -214 + bob, 26, 0, 7), "#2f5a4a", { lw: 3.5, rim: 4 });
  piece(() => ctx.ellipse(112, -214 + bob, 14, 16, 0, 0, 7), "#c8452d", { lw: 2.5, rim: 2, shadow: false });
  piece(() => ctx.rect(70, -168, 40, 12), KA.cream, { lw: 2.5, light: false, shadow: false });            // white neck ring
  piece(() => { ctx.moveTo(128, -220 + bob); ctx.lineTo(150, -212 + bob); ctx.lineTo(128, -206 + bob); ctx.closePath(); }, KA.mustard, { lw: 2.5, rim: 2, shadow: false });
  ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(114, -220 + bob, 4, 0, 7); ctx.fill();
  ctx.restore();
}

// 1. HOOK: the island, its flag turning from Spain to France
CU.hook = (t, S) => {
  islandScene(t);
  flipPole(790, 1060, 300, 190, t, at("hook/changes") - 0.1, "ES", "FR");
  flagBadge("ES", 330, 420, 70); flagBadge("FR", 750, 420, 70);
  const ka = clamp((t - 0.0) / 0.01); ctx.save(); ctx.globalAlpha = ka;
  const sp = t * 2.2;                                      // the two arrows chase each other: a swap that never stops
  for (const [a0, col] of [[sp, ES_RED], [sp + Math.PI, FR_BLUE]]) { ctx.save(); ctx.translate(540, 420); ctx.strokeStyle = KA.ink; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, 0, 110, a0, a0 + 2.2); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 110, a0, a0 + 2.2); ctx.stroke(); const ex = Math.cos(a0 + 2.2) * 110, ey = Math.sin(a0 + 2.2) * 110, ta = a0 + 2.2 + Math.PI / 2; piece(() => { ctx.moveTo(ex + Math.cos(ta) * 26, ey + Math.sin(ta) * 26); ctx.lineTo(ex + Math.cos(ta + 2.4) * 24, ey + Math.sin(ta + 2.4) * 24); ctx.lineTo(ex + Math.cos(ta - 2.4) * 24, ey + Math.sin(ta - 2.4) * 24); ctx.closePath(); }, col, { lw: 3, shadow: false }); ctx.restore(); }
  ctx.restore();
  kText("EVERY 6 MONTHS", W / 2, 640, 104, t, at("hook/six") - 0.15, { color: KA.cream, stroke: 14, ls: 3 });
  brandTag(BRAND);
};
// 2. RIVER: fly in from the Bay of Biscay to the Bidasoa
CU.river = (t, S) => {
  const c = F.draw(t);
  if (c.h > 14) { flightPin(F, "FRANCE", -1.3, 43.55, t, at("river/france") - 0.05, { size: 40, bg: "#cfd8ef", h: 6.5, up: 60 }); flightPin(F, "SPAIN", -2.02, 43.12, t, at("river/spain") - 0.05, { size: 40, bg: "#f6dfa0", h: 6.5, up: 60 }); }
  else { flightPin(F, "HENDAYE (FRANCE)", -1.758, 43.352, t, at("river/border"), { size: 30, bg: "#cfd8ef", up: 90 }); flightPin(F, "IRUN (SPAIN)", -1.775, 43.336, t, at("river/border"), { size: 30, bg: "#f6dfa0", up: 70 }); }
  if (c.h < 14) flightPin(F, "THE BIDASOA RIVER", -1.7705, 43.3425, t, at("river/border") + 0.2, { size: 30, bg: KA.cream, up: 260 });
  brandTag(BRAND);
};
// 3. SIZE: 200 metres long, nobody lives there
CU.size = (t, S) => {
  F.draw(t);
  const t2 = at("size/two") - 0.1;
  if (t > t2) {
    const [x0, y0] = F.project(-1.76683, 43.34265), [x1, y1] = F.project(-1.76422, 43.34300), k = eio(pp(t, t2, 0.6));
    const xm = (x0 + x1) / 2, ym = Math.min(y0, y1) - 120;
    ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(xm - (xm - x0) * k, ym); ctx.lineTo(xm + (x1 - xm) * k, ym); ctx.stroke();
    for (const xx of [x0, x1]) if (k > 0.95) { ctx.beginPath(); ctx.moveTo(xx, ym - 22); ctx.lineTo(xx, ym + 22); ctx.stroke(); } ctx.restore();
    popLabel("≈200 M LONG", xm, ym - 70, t, t2 + 0.3, { size: 44, bg: KA.mustard });
  }
  flightPin(F, "PHEASANT ISLAND", ISL[0], ISL[1], t, S.t0 + 0.3, { size: 34, bg: KA.cream, up: 420 });
  stamp("POPULATION: 0", W / 2, 1130, t - at("size/nobody"), { size: 96, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 4. TREATY: 1659, the peace signed on the island
CU.treaty = (t, S) => {
  desk();
  const k = spring(pp(t, S.t0, 0.6));
  card(540, 720, 820, 780, -0.02, k, (w, h) => {
    text("TREATY OF THE PYRENEES", 0, -h / 2 + 90, { size: 54 }); rule(-320, 320, -h / 2 + 112);
    text(typed("France · Spain · peace", pp(t, at("treaty/france") - 0.1, 0.8)), 0, -h / 2 + 200, { size: 42, font: "Serif" });
    text("signed on Pheasant Island", 0, -h / 2 + 260, { size: 32, font: "Elite", color: "#6b5a48" });
    flagArt("ES", -300, 20, 200); flagArt("FR", 100, 20, 200);
    text("7 NOVEMBER 1659", 0, 260, { size: 40, font: "Elite" });
  }, { bg: "#f1e6cc" });
  quill(820, 1180, -0.5 + Math.sin(t * 6) * 0.04 * (t < at("treaty/peace") ? 1 : 0));
  stamp("1659", 540, 1190, t - at("treaty/sixteen"), { size: 80, rot: -0.04, color: KA.red });
  stamp("PEACE", 540, 1060, t - at("treaty/peace"), { size: 110, rot: -0.1, color: KA.moss2 });
  brandTag(BRAND);
};
// 5. TALKS: it took 24 meetings (C: the number)
CU.talks = (t, S) => {
  graphPaper();
  const t0 = at("talks/twentyfour") - 0.15;
  for (let i = 0; i < 24; i++) {                            // 24 meeting slips pinned up, one by one
    const c = i % 6, r = Math.floor(i / 6), k = spring(pp(t, t0 + i * 0.04, 0.4)); if (k <= 0) continue;
    ctx.save(); ctx.translate(150 + c * 156, 720 + r * 128); ctx.rotate((rnd(i, 5) - 0.5) * 0.14); ctx.scale(k, k);
    piece(() => ctx.rect(-62, -46, 124, 92), i % 2 ? KA.cream : "#f2e6c9", { lw: 3, rim: 4, sx: 4, sy: 6 });
    text("MEETING", 0, -10, { size: 18, font: "Elite", color: "#6b5a48" }); text(String(i + 1), 0, 32, { size: 36 });
    ctx.restore();
  }
  bigNumber(t, t0, { value: 24, label: "MEETINGS", sub: "Spain's and France's chief ministers, 1659", stroke: 14, size: 230, y: 470, roll: 0.9, colors: { fg: KA.cream, accent: KA.red, ink: KA.ink }, subColor: KA.ink });
  brandTag(BRAND);
};
// 6. BRIDES: for centuries, royal brides were handed over here
CU.brides = (t, S) => {
  islandScene(t, { labels: false });
  const kr = eio(pp(t, at("brides/royal") - 0.2, 0.8));
  // a striped pavilion on the island and a red carpet from bank to bank
  ctx.save(); ctx.translate(380, 1050);
  piece(() => ctx.rect(-120, -150, 240, 150), KA.cream, { lw: 4, rim: 6 });
  ctx.save(); ctx.beginPath(); ctx.rect(-120, -150, 240, 150); ctx.clip(); ctx.fillStyle = "#3a5a9c"; for (let x = -120; x < 120; x += 48) ctx.fillRect(x, -150, 24, 150); ctx.restore();
  piece(() => { ctx.moveTo(-140, -150); ctx.lineTo(0, -240); ctx.lineTo(140, -150); ctx.closePath(); }, KA.red, { lw: 4, rim: 5 });
  piece(() => ctx.roundRect(-34, -86, 68, 86, [30, 30, 0, 0]), "#2b2724", { lw: 3, rim: 3, shadow: false });
  ctx.restore();
  // a crown and a ring box: royal handovers (no faces: the people are named, never drawn)
  const kc = spring(pp(t, at("brides/brides") - 0.1, 0.6));
  popIn(380, 700, kc, () => { piece(() => { ctx.moveTo(-90, 40); ctx.lineTo(-100, -50); ctx.lineTo(-50, -10); ctx.lineTo(0, -70); ctx.lineTo(50, -10); ctx.lineTo(100, -50); ctx.lineTo(90, 40); ctx.closePath(); }, KA.mustard, { lw: 4, rim: 7 }); for (const x of [-100, 0, 100]) piece(() => ctx.arc(x, x ? -54 : -74, 12, 0, 7), KA.red, { lw: 3, rim: 2, shadow: false }); });
  popIn(700, 720, spring(pp(t, at("brides/handed") - 0.1, 0.6)), () => { piece(() => ctx.roundRect(-70, -40, 140, 80, 10), "#7b2a3a", { lw: 4, rim: 6 }); piece(() => ctx.arc(0, -40, 30, Math.PI, 0), "#7b2a3a", { lw: 4, rim: 4 }); ctx.lineWidth = 9; ctx.strokeStyle = KA.ink; ctx.beginPath(); ctx.arc(0, -30, 22, 0, 7); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = KA.mustard; ctx.beginPath(); ctx.arc(0, -30, 22, 0, 7); ctx.stroke(); });
  popLabel("1659: LOUIS XIV MET HIS SPANISH BRIDE HERE", W / 2, 470, t, at("brides/handed"), { size: 30, bg: KA.cream });
  brandTag(BRAND);
};
// 7. SHARE: both countries own it; they take turns
CU.share = (t, S) => {
  F.draw(t);
  const [x, y] = F.project(ISL[0], ISL[1]);
  const kb = spring(pp(t, at("share/both") - 0.1, 0.6));
  if (kb > 0) { flagBadge("ES", x - 170, y - 260, 70 * kb); flagBadge("FR", x + 170, y - 260, 70 * kb); }
  kText("JOINT SOVEREIGNTY", W / 2, 470, 92, t, at("share/both"), { color: KA.cream, stroke: 13, ls: 2 });
  popLabel("THE WORLD'S SMALLEST CONDOMINIUM", W / 2, 560, t, at("share/own"), { size: 30, bg: KA.mustard });
  popLabel("THEY TAKE TURNS", x, y - 120, t, at("share/turns") - 0.1, { size: 36, bg: KA.cream });
  brandTag(BRAND);
};
// 8. SWAP: the calendar: February-July Spain, August-January France
CU.swap = (t, S) => {
  graphPaper();
  const M = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const tE = at("swap/february") - 0.1, tF = at("swap/august") - 0.1;
  for (let i = 0; i < 12; i++) {
    const c = i % 3, r = Math.floor(i / 3), x = 120 + c * 290, y = 490 + r * 150, es = i >= 1 && i <= 6;
    const k0 = spring(pp(t, S.t0 + i * 0.03, 0.4)), kc = es ? pp(t, tE + (i - 1) * 0.08, 0.3) : pp(t, tF + ((i + 5) % 12) * 0.08, 0.3);
    calendarTile(x, y, 260, 120, M[i], kc > 0.5 ? (es ? ES_RED : FR_BLUE) : KA.cream, k0, kc > 0.5 ? (es ? { stripe: ES_YEL, color: KA.ink } : { color: KA.cream, stroke: 8 }) : {});
  }
  const showES = t > tE && t < tF;
  if (t > tE) { const k = spring(pp(t, showES ? tE : tF, 0.6)); popIn(W / 2, 360, k, () => { flagArt(showES ? "ES" : "FR", -130, -80, 260); }); }
  kText(showES ? "SPAIN" : t > tF ? "FRANCE" : "", W / 2, 1150, 90, t, showES ? tE + 0.3 : tF + 0.3, { color: showES ? ES_RED : FR_BLUE, stroke: 12, ink: KA.ink, ls: 6 });
  brandTag(BRAND);
};
// 9. VICEROY: France's official in charge is the 'viceroy of Pheasant Island'
CU.viceroy = (t, S) => {
  paperBG("#e7dcc4");
  local({ x: 540, gy: 1290, s: 1.25, hat: "bowler", plaid: false, coat: "#2f3f5c", beard: false, mustache: "#5a4636", look: 0, blink: 0.7, id: 31, brow: t > at("viceroy/viceroy") ? 0.8 : 0 });
  piece(() => ctx.rect(-20, 1060, W + 40, 400), KA.wood, { lw: 4, rim: 10 });             // the desk, in front of him
  for (let i = 0; i < 6; i++) line(-20, 1100 + i * 50, W + 20, 1100 + i * 50, "rgba(30,15,5,0.25)", 3);
  piece(() => ctx.rect(-20, 1040, W + 40, 40), KA.wood2, { lw: 4, rim: 6 });
  const kp = spring(pp(t, at("viceroy/official") - 0.1, 0.6));      // the nameplate on the desk
  card(540, 1130, 760, 150, 0, kp, (w, h) => { text(typed("DEPUTY DIRECTOR, SEA AND COAST", pp(t, at("viceroy/official"), 0.6)), 0, -16, { size: 34, font: "Elite" }); text("Pyrénées-Atlantiques and Landes", 0, 34, { size: 26, font: "Elite", color: "#6b5a48" }); }, { bg: "#d9c08f", tape: false });
  flagArt("FR", 80, 330, 170);
  kText("ALSO KNOWN AS", W / 2, 520, 50, t, at("viceroy/title") - 0.1, { color: KA.ink, font: "Elite", stagger: 0.02 });
  stamp("VICEROY OF PHEASANT ISLAND", W / 2, 640, t - at("viceroy/viceroy"), { size: 70, rot: -0.05, color: KA.red, maxW: W - 80 });
  brandTag(BRAND);
};
// 10. BIRDS: there are no pheasants on Pheasant Island
CU.birds = (t, S) => {
  islandScene(t, { labels: false });
  const tp = at("birds/pheasants") - 0.1, ti = at("birds/island") - 0.1;
  const k = spring(pp(t, tp, 0.6));
  popIn(560, 820, k, () => pheasant(80, 120, 1.1, t));
  if (t > ti) { const kk = eio(pp(t, ti, 0.4)); ctx.save(); ctx.translate(560, 720); ctx.lineWidth = 34; ctx.strokeStyle = KA.ink; ctx.beginPath(); ctx.arc(0, 0, 250, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * kk); ctx.stroke(); ctx.lineWidth = 22; ctx.strokeStyle = KA.red; ctx.beginPath(); ctx.arc(0, 0, 250, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * kk); ctx.stroke();
    if (kk > 0.6) { const kl = pp(t, ti + 0.25, 0.25); ctx.lineCap = "round"; ctx.lineWidth = 34; ctx.strokeStyle = KA.ink; ctx.beginPath(); ctx.moveTo(-176, -176); ctx.lineTo(-176 + 352 * kl, -176 + 352 * kl); ctx.stroke(); ctx.lineWidth = 22; ctx.strokeStyle = KA.red; ctx.beginPath(); ctx.moveTo(-176, -176); ctx.lineTo(-176 + 352 * kl, -176 + 352 * kl); ctx.stroke(); }
    ctx.restore(); }
  stamp("PHEASANTS: 0", W / 2, 390, t - ti - 0.5, { size: 96, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 11. NAME: probably a translation mistake (Euronews' chain of names)
CU.name = (t, S) => {
  graphPaper();
  const steps = [["PAUSOA", "Basque: passage", at("name/name") - 0.1], ["PAYSANS", "French: peasants", at("name/probably") - 0.1], ["FAISANS", "French: pheasants", at("name/translation") - 0.1]];
  steps.forEach(([w, g, t0], i) => {
    const y = 470 + i * 250, k = spring(pp(t, t0, 0.6));
    card(540, y, 640, 170, (i - 1) * 0.03, k, (cw, ch) => { text(w, 0, 16, { size: 76, color: i === 2 ? KA.red : KA.ink, ls: 4 }); text(g, 0, 62, { size: 26, font: "Elite", color: "#6b5a48" }); });
    if (i > 0) arrow(540, y - 165, 540, y - 95, eio(pp(t, t0 - 0.1, 0.3)), KA.ink, 8);
  });
  popLabel("PROBABLY", 880, 380, t, at("name/probably"), { size: 34, bg: KA.mustard, rot: 0.08 });
  stamp("MISTAKE?", 540, 1180, t - at("name/mistake"), { size: 80, rot: -0.08, color: KA.red });
  brandTag(BRAND);
};
// 12. NOW: right now it's French, until February (loops to the opening flag)
CU.now = (t, S) => {
  islandScene(t);
  flipPole(790, 1060, 300, 190, t, null, "FR", "FR");
  const kc = spring(pp(t, at("now/french") - 0.1, 0.6));
  card(540, 470, 600, 250, -0.03, kc, (w, h) => { text("RIGHT NOW", 0, -h / 2 + 70, { size: 40, font: "Elite" }); rule(-200, 200, -h / 2 + 90); text("FRANCE", 0, 40, { size: 96, color: FR_BLUE }); });
  popLabel("UNTIL 1 FEBRUARY", W / 2, 650, t, at("now/february") - 0.1, { size: 42, bg: "#f6dfa0" });
  brandTag(BRAND);
};

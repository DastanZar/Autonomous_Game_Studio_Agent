// Why Russia sold Alaska (1867), and the border it left between "yesterday" and "tomorrow". House method: paper
// cast and props (paper kit), 3D map flights for geography (flight kit), the one big number in moving type
// (kinetic kit), official flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const BIG = [-169.05, 65.785], LITTLE = [-168.925, 65.755];      // island centres (OSM coastline extents)
const LINE_LON = -168.977;                                       // the 1867 line runs north midway between them

// ---------- flights: before the sale (Russian America) and after (the new border) ----------
const F1 = makeFlight({
  origin: [-150, 61], near: null, far: "s_defend", colors: { US: 0x9fb07a, CA: 0xd9907a, RU: 0xc9b98f, default: 0xe2cfa2 }, sea: 0x93b4ae, switchKm: 10,
  keys: [[at("defend.start"), -142, 62, 14000, 0, 6], [at("defend.end") + 0.4, -141, 61.5, 12000, 0, 10]],
});
const F2 = makeFlight({
  origin: [-169, 65.77], near: "s_diomede", far: "s_border", colors: { US: 0xd98a3d, RU: 0xd9b48f, CA: 0xe2cfa2, default: 0xe2cfa2 }, sea: 0x93b4ae, switchKm: 140,
  lines: [
    { pts: [[LINE_LON, 70.5], [LINE_LON, 65.77], [LINE_LON - 0.6, 64.6]], color: 0xc0442c, width: 3, layer: "far", from: at("border/border") - 0.1, to: at("border/islands"), until: at("border/islands") + 0.3 },
    { pts: [[LINE_LON, 65.95], [LINE_LON, 65.58]], color: 0xe0b23c, width: 0.12, from: at("dateline/date") - 0.1, to: at("dateline/runs") + 0.3 },
  ],
  keys: [
    [at("border.start"), -158, 64.5, 2600, 0, 14], [at("border/border"), -166, 65.4, 1300, 0, 18], [at("border.end") + 0.2, -168.98, 65.77, 160, 0, 26],
    [at("diomede.start"), -168.99, 65.77, 44, 0, 30], [at("diomede.end"), -168.99, 65.765, 36, -10, 36],
    [at("dateline.start"), -168.99, 65.765, 36, -10, 36], [at("dateline.end") + 0.4, -168.985, 65.765, 30, -24, 44],
  ],
});

// ---------- small props ----------
function chest(x, gy, s, open) {                // a strongbox, lid opening by `open`
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  footShadow(0, 4, 150);
  piece(() => ctx.roundRect(-140, -150, 280, 150, 10), KA.wood2, { lw: 4.5, rim: 8 });
  piece(() => ctx.rect(-140, -110, 280, 18), "#8a7a5a", { lw: 2.5, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-20, -120, 40, 46, 6), "#c9a043", { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(-140, -150); ctx.rotate(-1.9 * eio(open));
  piece(() => ctx.roundRect(0, -60, 280, 60, [30, 30, 6, 6]), KA.wood, { lw: 4.5, rim: 8 }); ctx.restore();
  ctx.fillStyle = "#1e1612"; if (open > 0.3) ctx.fillRect(-128, -146, 256, 30);
  ctx.restore();
}
function moth(x, y, t) { const f = Math.sin(t * 30) * 0.9; ctx.save(); ctx.translate(x, y); for (const k of [-1, 1]) { ctx.save(); ctx.scale(k, 1); ctx.rotate(-0.3 - f * 0.4); piece(() => ctx.ellipse(18, -6, 20, 12, -0.4, 0, 7), "#cdbfa3", { lw: 2.5, rim: 2, shadow: false }); ctx.restore(); } piece(() => ctx.ellipse(0, 0, 6, 14, 0, 0, 7), "#8a7a5a", { lw: 2, rim: 2, shadow: false }); ctx.restore(); }
function icebox(x, gy, s, k) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, gy - (1 - eout(k)) * 900); ctx.scale(s, s);
  footShadow(0, 4, 170);
  piece(() => ctx.roundRect(-150, -420, 300, 420, 14), "#b48a5e", { lw: 4.5, rim: 9 });
  for (const y of [-400, -190]) { piece(() => ctx.roundRect(-128, y, 256, y < -300 ? 190 : 176, 8), "#c79a6a", { lw: 3.5, rim: 5 }); piece(() => ctx.roundRect(90, y + 70, 18, 46, 6), "#c9a043", { lw: 2.5, rim: 2, shadow: false }); }
  ctx.fillStyle = "rgba(235,245,250,0.85)"; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-150 + i * 36, -420); ctx.lineTo(-138 + i * 36, -400 + rnd(i, 5) * 30); ctx.lineTo(-126 + i * 36, -420); ctx.fill(); }
  ctx.restore();
}
function cheque(x, y, w, k, t, tv) {
  card(x, y, w, w * 0.42, -0.03, k, (cw, ch) => {
    text("TREASURY WARRANT · 1868", -cw / 2 + 30, -ch / 2 + 54, { size: 26, font: "Elite", align: "left", color: "#6b5a48" });
    text("Pay to the order of", -cw / 2 + 30, -20, { size: 30, font: "Serif", align: "left" });
    text("the Russian Minister", -cw / 2 + 300, -20, { size: 34, font: "Serif", align: "left", color: KA.navy });
    rule(-cw / 2 + 30, cw / 2 - 30, 4);
    rollNumber(7200000 * eout(pp(t, tv, 0.9)), cw / 2 - 40, ch / 2 - 40, 64, { align: "right", color: KA.moss2, fmt: v => "$" + Math.round(v).toLocaleString("en-US") });
  }, { tape: false, bg: "#e9eedc" });
}
function binoculars() { piece(() => ctx.roundRect(-6, -18, 46, 22, 6), "#2b2724", { lw: 3, rim: 3 }); piece(() => ctx.roundRect(-6, 2, 46, 22, 6), "#2b2724", { lw: 3, rim: 3 }); }
function rockIsland(x, gy, w, h, seed, col) { piece(() => { ctx.moveTo(x - w / 2, gy); ctx.bezierCurveTo(x - w * 0.42, gy - h * 0.9, x - w * 0.1, gy - h * (1 + rnd(seed, 1) * 0.1), x + w * 0.08, gy - h); ctx.bezierCurveTo(x + w * 0.3, gy - h * 0.98, x + w * 0.44, gy - h * 0.5, x + w / 2, gy); ctx.closePath(); }, col, { lw: 4, rim: 9 }); }

// 1. HOOK: the deal on the desk, the map of Alaska, the price per acre
CU.hook = (t, S) => {
  desk();
  const mp = mapProj({ lon: -152, lat: 62.5, cx: 0, cy: 0, s: 19 });
  const km = 1, sold = pp(t, at("hook/bought") - 0.1, 0.5);
  card(540, 760, 900, 640, -0.02, km, (w, h) => {
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40); ctx.clip();
    ctx.fillStyle = KA.sea; ctx.fillRect(-w / 2, -h / 2, w, h);
    mapLand("s_hook", mp, iso => iso === "US" ? (sold > 0.5 ? KA.us : "#9fb07a") : "#e2d3b0", { lw: 3, rim: 6 });
    ctx.restore();
    text(sold > 0.5 ? "ALASKA" : "RUSSIAN AMERICA", 40, -h / 2 + 80, { size: 48, color: KA.ink, ls: 4 });
  }, { bg: KA.cream });
  // the two men at the desk edge: an American official (left) and a Russian envoy (right)
  local({ x: 210, gy: 1640, s: 1.05, hat: "top", plaid: false, coat: "#2f2f3a", beard: false, mustache: false, look: 1, blink: 0.4, id: 3, arm: t > at("hook/bought") ? "hold" : null });
  local({ x: 870, gy: 1640, s: 1.05, dir: -1, hat: "bowler", plaid: false, coat: "#3f5240", beard: "#d9d0c0", look: 1, blink: 1.3, id: 4 });
  flagArt("US", 70, 330, 170); flagArt("RU", W - 240, 330, 170);
  stamp("2¢ AN ACRE", 560, 1150, t - at("hook/cents"), { size: 110, rot: -0.08, color: KA.red });
  brandTag(BRAND);
};
// 2. WHY: the Crimean War is lost; the treasury is empty
CU.why = (t, S) => {
  paperBG(KA.paper);
  const tl = at("why/lost"), tm = at("why/money");
  card(540, 520, 620, 300, -0.03, spring(pp(t, S.t0 + 0.05, 0.6)), (w, h) => { text("THE CRIMEAN WAR", 0, -40, { size: 64 }); text("1853 – 1856", 0, 30, { size: 36, font: "Elite" }); });
  stamp("LOST", 700, 600, t - tl, { size: 120, rot: -0.14, color: KA.red });
  chest(560, 1420, 1.25, pp(t, tm - 0.4, 0.5));
  if (t > tm - 0.1) { const k = pp(t, tm - 0.1, 2.5); moth(560 + Math.sin(k * 9) * 90, 1220 - k * 420, t); }
  trooper({ x: 210, gy: 1500, s: 1.1, side: "RU", id: 31, look: 1, brow: -0.8 });
  popLabel("RUSSIAN TREASURY", 560, 1500, t, tm - 0.3, { size: 34, bg: KA.cream });
  brandTag(BRAND);
};
// 3. DEFEND: Russian America next to British North America
CU.defend = (t, S) => {
  F1.draw(t);
  flightPin(F1, "RUSSIAN AMERICA", -152, 64.5, t, S.t0 + 0.1, { size: 36, bg: "#dfe6c8", h: 6.5 });
  flightPin(F1, "BRITISH NORTH AMERICA", -122, 58, t, at("defend/britain") - 0.2, { size: 34, bg: "#f2c9bd", h: 6.5 });
  if (t > at("defend/britain")) { const [x, y] = F1.project(-122, 58, 6.5); flagArt("GB", x - 70, y + 20, 140); }
  kText("HARD TO DEFEND", W / 2, 1600, 96, t, at("defend/hard") - 0.1, { color: KA.cream, stroke: 12, ls: 3 });
  brandTag(BRAND);
};
// 4. SETTLERS: a huge territory, four hundred settlers
CU.settlers = (t, S) => {
  seaFlat(KA.sea);
  const mp = mapProj({ lon: -150, lat: 61, cx: 540, cy: 900, s: 40 });
  mapLand("s_settlers", mp, iso => iso === "US" ? "#f1ece0" : "#d9cdb0", { lw: 3, rim: 7 });
  mapLabel("RUSSIAN AMERICA", 470, 800, 56, 0.4);
  const tf = at("settlers/four"), [sx, sy] = mp(-135.33, 57.05);          // Sitka (New Archangel)
  unitChart(t, 400, sx - 38, sy - 30, 20, 4, 1.4, KA.red, { t0: tf - 0.1, dur: 0.8 });
  popLabel("≤ 400 SETTLERS", sx - 60, sy - 110, t, tf + 0.2, { size: 34, bg: KA.cream });
  if (t > tf + 0.6) { const k = spring(pp(t, tf + 0.6, 0.5)); ctx.save(); ctx.strokeStyle = KA.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx - 1, sy - 22, 70 * k, 0, 7); ctx.stroke(); ctx.restore(); }
  brandTag(BRAND);
};
// 5. PRICE: the cheque, then the one big number
CU.price = (t, S) => {
  desk();
  const ts = at("price/seven") - 0.1, tw = at("price/twice") - 0.1;
  cheque(540, 1660, 900, spring(pp(t, S.t0, 0.6)), t, ts);
  bigNumber(t, ts, { value: 7.2, prefix: "$", suffix: "M", fmt: v => v.toFixed(1), label: "FOR ALASKA", sub: "586,412 square miles", stroke: 14, size: 260, y: 640, roll: 0.9, colors: { fg: KA.cream, accent: KA.mustard, ink: KA.ink }, subColor: KA.cream });
  if (t > tw) kText("MORE THAN 2× TEXAS", W / 2, 960, 70, t, tw, { color: KA.cream, stroke: 10, ink: KA.ink, ls: 3 });
  brandTag(BRAND);
};
// 6. FOLLY: the critics' names for it
CU.folly = (t, S) => {
  paperBG("#e9dcc0");
  const tf = at("folly/folly") - 0.1, ti = at("folly/icebox") - 0.15;
  card(540, 560, 760, 420, 0.02, spring(pp(t, S.t0, 0.6)), (w, h) => {
    text("THE CRITICS, 1867", 0, -h / 2 + 60, { size: 30, font: "Elite", color: "#6b5a48" }); rule(-w / 2 + 40, w / 2 - 40, -h / 2 + 84);
    if (t > tf) text("“SEWARD'S", 0, 0, { size: 96 }); if (t > tf) text("FOLLY”", 0, 100, { size: 96, color: KA.red });
  }, { bg: "#f3ead8" });
  icebox(760, 1560, 0.95, pp(t, ti, 0.5));
  popLabel("“SEWARD'S ICEBOX”", 760, 1080, t, ti + 0.3, { size: 40, bg: "#dfeaf0" });
  for (let i = 0; i < 2; i++) local({ x: 170 + i * 220, gy: 1600 + i * 30, s: 0.95, hat: "top", plaid: false, coat: i ? "#4a3a46" : "#2f2f3a", beard: i ? "#5a4636" : false, mustache: i ? false : "#5a4636", look: 1, brow: 0.8, id: 50 + i, arm: t > tf ? "wave" : null });
  brandTag(BRAND);
};
// 7. GOLD: the Klondike strike next door
CU.gold = (t, S) => {
  const tg = at("gold/gold") - 0.1, tw = at("gold/gateway") - 0.2;
  sky({ sunX: 840, sunY: 420, top: "#d9cdb4" }); ridge(940, 360, KA.mtnFar, 0, 7, 0, true); ridge(1000, 240, KA.mtnMid, 0, 8, 0, true); haze(600, 1000, 0.4);
  seaBand(1040, 1140, t * 60, KA.sea2); grass(1140, 1180, 0, KA.moss);
  for (let i = 0; i < 7; i++) pine(60 + i * 170 + rnd(i, 3) * 40, 1170, 0.55 + rnd(i, 4) * 0.2, i, KA.pine, 0.6);
  nearGround(1180, 0, "#a3ae6c");
  local({ x: 330, gy: 1560, s: 1.1, hat: "knit", plaid: true, beard: KA.beard, look: 1, blink: 0.9, id: 21, arm: "hold", brow: t > tg ? 0.9 : 0,
    carry: () => { piece(() => ctx.ellipse(40, -4, 70, 16, 0, 0, 7), "#5b574f", { lw: 3, rim: 4 }); if (t > tg) for (let i = 0; i < 4; i++) piece(blob(18 + i * 16, -14, 7, 6, 7, i, 0.3), "#e8b93c", { lw: 2, rim: 2, shadow: false }); } });
  if (t > tg) for (let i = 0; i < 6; i++) { const a = (t * 1.4 + i / 6) % 1; ctx.save(); ctx.globalAlpha = 1 - a; text("✦", 450 + Math.cos(i * 1.1) * 90 * a, 1440 - a * 140, { size: 34, color: "#f1c35c" }); ctx.restore(); }
  popLabel("1896 · THE YUKON", W / 2, 380, t, tg, { size: 38, bg: KA.cream });
  woodSign(790, 1380, [["KLONDIKE →", 52], ["via ALASKA", 34, KA.mustard]], spring(pp(t, tw, 0.6)), { w: 400, post: 220 });
  for (let i = 0; i < 5; i++) { const x = ((t - tw) * 70 + i * 120) % 700 + 120; if (t > tw) local({ x, gy: 1235, s: 0.28, walk: t * 8 + i, hat: "knit", beard: KA.beard, id: 70 + i, look: 1 }); }
  brandTag(BRAND);
};
// 8. BORDER: the flight to the Bering Strait; the 1867 line
CU.border = (t, S) => {
  F2.draw(t);
  flightPin(F2, "ALASKA", -152, 64, t, S.t0 + 0.1, { size: 36, bg: "#f6d8b4", h: 6.5 });
  flightPin(F2, "RUSSIA", -173, 66.3, t, S.t0 + 0.3, { size: 36, bg: "#f2c9bd", h: 6.5 });
  flightPin(F2, "1867 TREATY LINE", LINE_LON, 68.6, t, at("border/border") + 0.4, { size: 32, bg: KA.cream, h: 6.5, up: 40 });
  brandTag(BRAND);
};
// 9. DIOMEDE: two islands, two countries, 2.4 miles
CU.diomede = (t, S) => {
  F2.draw(t);
  const tb = at("diomede/big"), tl = at("diomede/little"), td = at("diomede/two");
  flightPin(F2, "BIG DIOMEDE", BIG[0], BIG[1], t, tb, { size: 34, bg: "#f2c9bd", up: 120 });
  flightPin(F2, "LITTLE DIOMEDE", LITTLE[0], LITTLE[1], t, tl, { size: 34, bg: "#f6d8b4", up: 120 });
  for (const [c, p, t0] of [["RU", BIG, tb], ["US", LITTLE, tl]]) if (t > t0 + 0.2) { const [x, y] = F2.project(p[0], p[1]); flagBadge(c, x, y - 230, 44 * spring(pp(t, t0 + 0.2, 0.5))); }
  if (t > td - 0.1) {                                                         // the gap between the closest shores
    const [x0, y0] = F2.project(-168.998, 65.763), [x1, y1] = F2.project(-168.955, 65.763), k = eio(pp(t, td - 0.1, 0.6));
    const xm = lerp(x0, x1, 0.5); ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xm - (xm - x0) * k, y0 + 60); ctx.lineTo(xm + (x1 - xm) * k, y1 + 60); ctx.stroke(); ctx.restore();
    popLabel("2.4 MILES", xm, y0 + 120, t, td + 0.2, { size: 40, bg: KA.mustard });
  }
  brandTag(BRAND);
};
// 10. DATELINE: tomorrow on the left, today on the right
CU.dateline = (t, S) => {
  F2.draw(t);
  const td = at("dateline/date"), th = at("dateline/twentyone") - 0.1;
  flightPin(F2, "INTERNATIONAL DATE LINE", LINE_LON, 65.86, t, td + 0.3, { size: 30, bg: "#f4e3a8", up: 60 });
  const cal = (x, y, top, day, col, k) => card(x, y, 300, 250, x < 540 ? -0.05 : 0.05, k, (w, h) => { piece(() => ctx.rect(-w / 2, -h / 2, w, 64), col, { lw: 0, light: false, shadow: false }); text(top, 0, -h / 2 + 46, { size: 34, color: KA.cream }); text(day, 0, 50, { size: 70 }); }, { tape: false });
  cal(260, 560, "BIG DIOMEDE", "TOMORROW", KA.red, spring(pp(t, at("dateline/big") - 0.1, 0.6)));
  cal(820, 560, "LITTLE DIOMEDE", "TODAY", KA.navy, spring(pp(t, at("dateline/big") + 0.2, 0.6)));
  if (t > th) kText("+21 HOURS", 260, 780, 74, t, th, { color: KA.mustard, stroke: 10, ink: KA.ink });
  brandTag(BRAND);
};
// 11. TOLL: from Little Diomede, a view of tomorrow
CU.toll = (t, S) => {
  const tc = at("toll/cents") - 0.1, tt = at("toll/tomorrow") - 0.2;
  sky({ sunX: 300, sunY: 520, top: "#d6cbb6" }); haze(500, 1100, 0.4);
  seaBand(1000, H, t * 40, KA.sea2);
  rockIsland(330, 1030, 620, 260, 3, "#9a9488");                             // Big Diomede, across the water
  woodSign(330, 860, [["TOMORROW", 48]], spring(pp(t, tt, 0.6)), { w: 360, post: 90, rot: -0.04 });
  rockIsland(900, 1500, 900, 380, 5, "#a8a090");                             // Little Diomede, near
  local({ x: 880, gy: 1300, s: 1.0, dir: -1, hat: "knit", plaid: true, beard: KA.beard, look: 1, id: 23, arm: "hold", carry: () => { ctx.save(); ctx.rotate(-1.2); binoculars(); ctx.restore(); } });
  popLabel("2¢ AN ACRE", W / 2, 420, t, tc, { size: 44, bg: KA.mustard });
  brandTag(BRAND);
};

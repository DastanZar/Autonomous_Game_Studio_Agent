// The Statue of Liberty is in New York, surrounded by New Jersey. House method: paper statue, harbour and props
// (paper kit), a 3D map flight over the real harbour (flight kit; OSM coastline and NY-NJ boundary, data/geom.json),
// moving type for the numbers (kinetic kit), official flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const GM = JSON.parse(EP.data["data/geom.json"]);
const LIB = [-74.04526, 40.68986], ELL = [-74.04124, 40.69916];
const LY = id => GM.layers.find(l => l.iso === id).polys;
GEO.sol_near = { layers: GM.layers.filter(l => ["NJ", "NY", "LIB", "ELNY"].includes(l.iso)) };
const NJ_COL = "#e3a64f", NY_COL = "#4f6fb0", COPPER = "#7fb5a0", COPPER2 = "#5f9682";

let ELNJ = null;                                              // Ellis Island's landfill: appears when the fill is added
const tFill = () => at("fill/adding") - 0.2;
const F = makeFlight({
  origin: LIB, near: "sol_near", switchKm: 1e6, sea: 0x8fb0aa, slab: 0.012,
  colors: { NJ: 0xe8c27a, NY: 0xa9bfe8, LIB: 0x6f8fd0, ELNY: 0x6f8fd0, default: 0xe2cfa2 },
  lines: [{ pts: GM.line, color: 0xc0442c, width: 0.05, from: at("line/border") - 0.2, to: at("line/hudson") + 0.2 }],
  keys: [
    [at("line.start") - 0.2, -74.035, 40.70, 13, 0, 14], [at("line.end") + 0.2, -74.04, 40.695, 9, 0, 20],
    [at("side.start"), -74.043, 40.6915, 5.5, 0, 24], [at("side.end") + 0.3, -74.043, 40.6925, 3.8, -10, 30],
    [at("ellis.start"), -74.0412, 40.6990, 1.8, -15, 30], [at("ellis.end"), -74.0412, 40.6991, 1.05, 15, 38],
    [at("fill.start"), -74.0412, 40.6991, 1.05, 15, 38], [at("fill.end") + 0.2, -74.0414, 40.6990, 1.35, 40, 40],
    [at("two.start"), -74.0414, 40.6990, 1.25, 40, 38], [at("two.end") + 0.3, -74.0414, 40.6990, 0.95, 75, 44],
  ],
  update: (t, o) => {
    if (!ELNJ) ELNJ = slabOf(o, LY("ELNJ"), 0xd9c69a);
    const k = eio(clamp((t - tFill()) / 1.6));
    ELNJ.visible = k > 0; ELNJ.scale.y = Math.max(0.02, k);
    ELNJ.material.color.setHex(t > at("court/gave") - 0.1 ? 0xe8c27a : 0xd9c69a);
  },
});
function slabOf(o, polys, col) {                              // extrude OSM polygons into a paper slab, like the flight kit's land
  const T3 = o.T3, shapes = [];
  for (const poly of polys) { const sh = new T3.Shape(poly[0].map(([lo, la]) => new T3.Vector2(...F.km(lo, la)))); for (const h of poly.slice(1)) sh.holes.push(new T3.Path(h.map(([lo, la]) => new T3.Vector2(...F.km(lo, la))))); shapes.push(sh); }
  const g = new T3.ExtrudeGeometry(shapes, { depth: 0.012, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  const m = new T3.Mesh(g, new T3.MeshLambertMaterial({ color: col })); m.castShadow = true; m.receiveShadow = true; o.props.add(m); return m;
}

// ---------- the paper statue and harbour (side view) ----------
function liberty(x, gy, s, o = {}) {                          // a paper Statue of Liberty on its pedestal; feet of the pedestal at gy
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(55, 0.4 / s);
  piece(() => { ctx.moveTo(-150, 0); ctx.lineTo(-120, -60); ctx.lineTo(120, -60); ctx.lineTo(150, 0); ctx.closePath(); }, "#c9bfa8", { lw: 4, rim: 6 });   // star fort base
  piece(() => ctx.rect(-62, -250, 124, 192), "#d8cdb4", { lw: 4, rim: 7 });                                                                      // pedestal
  piece(() => ctx.rect(-74, -270, 148, 24), "#c9bfa8", { lw: 3.5, rim: 4 });
  for (const yy of [-220, -150]) piece(() => ctx.rect(-30, yy, 60, 40), "#b9ae94", { lw: 2.5, rim: 3, shadow: false });
  // the figure
  piece(() => { ctx.moveTo(-46, -270); ctx.quadraticCurveTo(-58, -400, -36, -500); ctx.lineTo(36, -500); ctx.quadraticCurveTo(58, -400, 46, -270); ctx.closePath(); }, COPPER, { lw: 4, rim: 8 });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.3)"; ctx.lineWidth = 3; for (const k of [-24, 0, 22]) { ctx.beginPath(); ctx.moveTo(k, -280); ctx.quadraticCurveTo(k - 6, -380, k + 4, -480); ctx.stroke(); } ctx.restore();
  stroke2(() => { ctx.moveTo(26, -480); ctx.lineTo(44, -560); ctx.lineTo(52, -640); }, COPPER, 22, 30);                                          // raised arm
  piece(() => ctx.roundRect(42, -690, 22, 54, 4), COPPER2, { lw: 3, rim: 3 });                                                                    // torch
  piece(() => { ctx.moveTo(53, -760); ctx.quadraticCurveTo(80, -720, 53, -690); ctx.quadraticCurveTo(26, -720, 53, -760); ctx.closePath(); }, "#e8b84a", { lw: 3, rim: 4 });
  piece(() => { ctx.moveTo(-40, -470); ctx.lineTo(-70, -420); ctx.lineTo(-40, -380); ctx.closePath(); }, COPPER2, { lw: 3, rim: 3 });              // tablet
  piece(() => ctx.ellipse(0, -530, 28, 34, 0, 0, 7), COPPER, { lw: 3.5, rim: 5 });                                                                // head
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; piece(() => { ctx.moveTo(Math.cos(a - 0.08) * 26, -548 + Math.sin(a - 0.08) * 26); ctx.lineTo(Math.cos(a) * 62, -548 + Math.sin(a) * 62); ctx.lineTo(Math.cos(a + 0.08) * 26, -548 + Math.sin(a + 0.08) * 26); ctx.closePath(); }, COPPER2, { lw: 2.5, rim: 2, shadow: false }); }
  ctx.restore();
}
function skyline(x0, x1, base, hmin, hmax, seed, col) {
  for (let x = x0, i = 0; x < x1; i++) { const w = 40 + rnd(i, seed) * 60, h = hmin + rnd(i, seed + 1) * (hmax - hmin);
    piece(() => ctx.rect(x, base - h, w, h), i % 2 ? col : tone(col, -0.1), { lw: 3, rim: 4, sx: 3, sy: 4 });
    ctx.fillStyle = "rgba(243,220,148,0.8)"; for (let yy = base - h + 14; yy < base - 14; yy += 22) for (let xx = x + 8; xx < x + w - 10; xx += 16) if (rnd(xx | 0, yy | 0, seed) > 0.5) ctx.fillRect(xx, yy, 6, 9);
    x += w + 4; }
}
function harbour(t, o = {}) {
  sky({ sunX: 860, sunY: 360, top: o.top });
  skyline(560, W + 40, 930, 120, 420, 9, "#8d97a8");          // Manhattan, New York (right)
  skyline(-40, 420, 930, 60, 200, 4, "#b8a58a");               // Jersey City (left)
  haze(560, 960, 0.4);
  seaBand(920, 1260, t * 60, KA.sea);
  piece(() => { ctx.moveTo(250, 1150); ctx.bezierCurveTo(330, 1080, 750, 1070, 830, 1150); ctx.quadraticCurveTo(540, 1180, 250, 1150); ctx.closePath(); }, "#8fae62", { lw: 4.5, rim: 9 });
  for (let i = 0; i < 2; i++) { const x = ((i * 640 + t * 110) % (W + 500)) - 250; ctx.save(); ctx.translate(x, 1235 - i * 60); ctx.scale(0.16, 0.16); warship({ x: 0, gy: 0, s: 1, dir: 1, id: 70 + i, smoke: true }); ctx.restore(); }
  liberty(540, 1120, o.s ?? 0.92);
  for (let i = 0; i < 5; i++) { const x = ((i * 260 + t * 90) % (W + 300)) - 150, y = 560 + (i % 3) * 70 + Math.sin(t * 2 + i) * 18; ctx.save(); ctx.translate(x, y); ctx.strokeStyle = KA.ink; ctx.lineWidth = 4; const f = Math.sin(t * 9 + i) * 8; ctx.beginPath(); ctx.moveTo(-18, f); ctx.quadraticCurveTo(-8, -8, 0, 0); ctx.quadraticCurveTo(8, -8, 18, f); ctx.stroke(); ctx.restore(); }
  if (o.labels !== false) { tag("NEW JERSEY", 190, 860, { size: 32, bg: "#f2d29a" }); tag("NEW YORK", 880, 470, { size: 32, bg: "#cfd8ef" }); }
}
// the New Jersey ring: a dashed orange line that closes around the island
function jerseyRing(t, t0, o = {}) {
  const k = eio(pp(t, t0, 0.9)); if (k <= 0) return;
  ctx.save(); ctx.translate(540, o.cy ?? 880); ctx.lineCap = "round";
  for (const [w, c] of [[16, KA.ink], [9, NJ_COL]]) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.setLineDash([30, 22]); ctx.beginPath(); ctx.ellipse(0, 0, o.rx ?? 400, o.ry ?? 560, 0, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * k); ctx.stroke(); }
  ctx.restore();
  popLabel("NEW JERSEY'S SIDE OF THE LINE", W / 2, o.ly ?? 1215, t, t0 + 0.6, { size: 30, bg: "#f2d29a" });
}

// 1. HOOK: the statue in New York, ringed by New Jersey
CU.hook = (t, S) => {
  harbour(t, { labels: false });
  popLabel("NEW YORK", 540, 330, t, 0, { size: 46, bg: "#cfd8ef" });
  flagArt("US-NY", 70, 300, 150);
  jerseyRing(t, at("hook/surrounded") - 0.2);
  brandTag(BRAND);
};
// 2. LINE: 1834, the border down the middle of the Hudson
CU.line = (t, S) => {
  F.draw(t);
  flightPin(F, "NEW JERSEY", -74.075, 40.715, t, S.t0 + 0.2, { size: 36, bg: "#f2d29a", up: 40 });
  flightPin(F, "NEW YORK", -74.0, 40.705, t, S.t0 + 0.4, { size: 36, bg: "#cfd8ef", up: 40 });
  flightPin(F, "THE 1834 LINE", -74.022, 40.718, t, at("line/border") + 0.3, { size: 32, bg: KA.cream, up: 160 });
  kText("1834", W / 2, 470, 150, t, at("line/eighteen") - 0.1, { color: KA.cream, stroke: 16, ls: 6 });
  brandTag(BRAND);
};
// 3. SIDE: two islands on New Jersey's side
CU.side = (t, S) => {
  F.draw(t);
  const t2 = at("side/two") - 0.1;
  flightPin(F, "BEDLOE'S ISLAND (TODAY: LIBERTY)", LIB[0], LIB[1], t, t2, { size: 28, bg: "#cfd8ef", up: 200 });
  flightPin(F, "ELLIS ISLAND", ELL[0], ELL[1], t, t2 + 0.3, { size: 28, bg: "#cfd8ef", up: 80 });
  brandTag(BRAND);
};
// 4. KEEP: the deal says New York keeps them
CU.keep = (t, S) => {
  desk();
  candle(900, 1180);
  quoteCard(540 + Math.sin(t * 0.9) * 14, 700 + Math.cos(t * 0.7) * 10, 860, "New York shall retain its present jurisdiction of and over Bedlow's and Ellis's islands", "The 1834 compact, Article Second", t, at("keep/kept") - 0.2, { size: 50 });
  flagArt("US-NY", 80, 300, 170);
  stamp("NEW YORK'S", 540, 1130, t - at("keep/written"), { size: 96, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 5. STATUE: dedicated on 28 October 1886
CU.statue = (t, S) => {
  harbour(t, { labels: false, s: 0.66 });
  const kc = spring(pp(t, at("statue/october") - 0.1, 0.6));
  card(540, 430, 560, 220, -0.03, kc, (w, h) => { text("DEDICATED", 0, -h / 2 + 60, { size: 34, font: "Elite" }); rule(-180, 180, -h / 2 + 78); text("OCT 28, 1886", 0, 40, { size: 76, color: KA.red }); });
  stamp("140 YEARS AGO THIS MONTH", W / 2, 575, t - at("statue/dedicated") - 0.2, { size: 54, rot: -0.05, color: KA.navy, maxW: W - 120 });
  for (let i = 0; i < 5; i++) { const x = ((i * 260 + t * 40) % (W + 300)) - 150; ctx.save(); ctx.translate(x, 1215 + (i % 2) * 20); ctx.scale(0.13, 0.13); warship({ x: 0, gy: 0, s: 1, dir: 1, id: 90 + i, smoke: true }); ctx.restore(); }
  brandTag(BRAND);
};
// 6. FOG: in fog and rain (visibility under a quarter of a mile)
CU.fog = (t, S) => {
  harbour(t, { labels: false });
  const k = eio(pp(t, S.t0, 0.8));
  ctx.save(); ctx.globalAlpha = 0.78 * k; ctx.fillStyle = "#e6e3da"; ctx.fillRect(0, 0, W, H); ctx.restore();
  for (let i = 0; i < 8; i++) { const x = ((rnd(i, 3) * W + t * (30 + i * 6)) % (W + 600)) - 300, y = 380 + rnd(i, 4) * 800; ctx.save(); ctx.globalAlpha = 0.6 * k; piece(blob(x, y, 260, 70, 14, i, 0.15), "#f1eee6", { lw: 0, light: false, shadow: false }); ctx.restore(); }
  ctx.save(); ctx.fillStyle = "rgba(90,100,110,0.35)"; ctx.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = (rnd(i, 7) * W + t * 120) % W, y = (rnd(i, 8) * H + t * 900) % H; ctx.fillRect(x, y, 3, 26); } ctx.restore();
  popLabel("VISIBILITY: UNDER ¼ MILE", W / 2, 470, t, at("statue/fog") - 0.1, { size: 40, bg: KA.cream });
  brandTag(BRAND);
};
// 7. ELLIS: the other island, three acres back then
CU.ellis = (t, S) => {
  F.draw(t);
  flightPin(F, "ELLIS ISLAND", ELL[0] + 0.0012, ELL[1] - 0.0004, t, at("ellis/ellis") - 0.1, { size: 34, bg: "#cfd8ef", up: 260 });
  const t3 = at("ellis/three") - 0.1;
  if (t > t3) { rollNumber(3 * eout(pp(t, t3, 0.5)), W / 2, 560, 200, { color: KA.cream, stroke: 14, ink: KA.ink, roll: false }); kText("ACRES IN 1834", W / 2, 640, 56, t, t3 + 0.2, { color: KA.navy, ls: 4 }); }
  brandTag(BRAND);
};
// 8. FILL: about 24.5 more acres of landfill
CU.fill = (t, S) => {
  F.draw(t);
  const t24 = at("fill/twentyfour") - 0.1;
  kText("LANDFILL", W / 2, 470, 100, t, at("fill/landfill") - 0.1, { color: KA.cream, stroke: 14, ls: 4 });
  if (t > t24) { rollNumber(24.5 * eout(pp(t, t24, 0.9)), W / 2, 680, 170, { color: "#d9c69a", stroke: 14, ink: KA.ink, fmt: v => "+" + v.toFixed(1), roll: false }); kText("ACRES", W / 2, 750, 52, t, t24 + 0.3, { color: KA.ink, ls: 6 }); }
  brandTag(BRAND);
};
// 9. COURT: New Jersey sued; in 1998 the Supreme Court gave it the new land
CU.court = (t, S) => {
  paperBG("#e7dcc4");
  ctx.save(); ctx.translate(540, 560); ctx.rotate(t * 0.5); ctx.fillStyle = "rgba(242,193,78,0.22)"; for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -120); ctx.lineTo(1400, 120); ctx.closePath(); ctx.fill(); } ctx.restore();
  for (let i = 0; i < 6; i++) piece(() => ctx.rect(110 + i * 160, 560, 60, 520), "#ece4d2", { lw: 3.5, rim: 6 });    // columns
  piece(() => { ctx.moveTo(60, 560); ctx.lineTo(540, 330); ctx.lineTo(1020, 560); ctx.closePath(); }, "#ece4d2", { lw: 4, rim: 8 });
  piece(() => ctx.rect(60, 1080, 960, 60), "#d8cdb4", { lw: 4, rim: 6 });
  text("NEW JERSEY v. NEW YORK", 540, 520, { size: 44, color: KA.ink });
  const kc = spring(pp(t, at("court/nineteen") - 0.1, 0.6));
  card(540 + Math.sin(t * 0.9) * 12, 820, 700, 300, -0.02 + Math.sin(t * 0.8) * 0.01, kc, (w, h) => { text("SUPREME COURT · 1998", 0, -h / 2 + 64, { size: 36, font: "Elite" }); rule(-260, 260, -h / 2 + 84); text("the filled land:", 0, 10, { size: 38, font: "Serif" }); text("NEW JERSEY", 0, 90, { size: 80, color: NJ_COL, stroke: 10, ink: KA.ink }); });
  stamp("SUED", 840, 380, t - at("court/sued") + 0.1, { size: 80, rot: 0.1, color: KA.red });
  stamp("NEW JERSEY WINS", W / 2, 1180, t - at("court/gave"), { size: 76, rot: -0.05, color: KA.red });
  brandTag(BRAND);
};
// 10. TWO: Ellis Island is in two states
CU.two = (t, S) => {
  F.draw(t);
  flightPin(F, "NEW YORK (ORIGINAL 3 ACRES)", -74.0399, 40.6986, t, S.t0 + 0.2, { size: 28, bg: "#cfd8ef", up: 220 });
  flightPin(F, "NEW JERSEY (LANDFILL)", -74.0425, 40.6985, t, S.t0 + 0.5, { size: 28, bg: "#f2d29a", up: 120 });
  kText("2 STATES", W / 2, 470, 130, t, at("two/two") - 0.1, { color: KA.cream, stroke: 16, ls: 4 });
  brandTag(BRAND);
};
// 11. GROUND: landfill on Liberty Island's west shore, natural ground under the statue
CU.ground = (t, S) => {
  sky({ sunX: 860, sunY: 360 }); haze(560, 960, 0.4);
  seaBand(840, H, t * 60, KA.sea);
  const tl = at("ground/landfill") - 0.1, tn = at("ground/natural") - 0.2;
  // the island in cross-section: rock under the statue, fill on the west (left) shore
  piece(() => { ctx.moveTo(120, 900); ctx.lineTo(960, 900); ctx.lineTo(900, 1240); ctx.lineTo(180, 1240); ctx.closePath(); }, "#8a7458", { lw: 4.5, rim: 8 });
  const kf = eio(pp(t, tl, 0.7));
  if (kf > 0) { ctx.save(); ctx.beginPath(); ctx.rect(120, 900 + (1 - kf) * 340, 260, 340); ctx.clip(); piece(() => { ctx.moveTo(120, 900); ctx.lineTo(380, 900); ctx.lineTo(380, 1240); ctx.lineTo(180, 1240); ctx.closePath(); }, "#d9c69a", { lw: 4, rim: 6 }); ctx.fillStyle = "rgba(43,35,32,0.25)"; for (let i = 0; i < 40; i++) ctx.fillRect(140 + rnd(i, 1) * 220, 920 + rnd(i, 2) * 300, 10, 6); ctx.restore(); }
  piece(() => ctx.rect(120, 880, 840, 24), "#8fae62", { lw: 4, rim: 5 });
  liberty(620, 880, 0.62);
  popLabel("LANDFILL (WEST SHORE)", 250, 1300 - 60, t, tl + 0.3, { size: 28, bg: "#f2d29a" });
  popLabel("NATURAL GROUND", 640, 1070, t, tn, { size: 36, bg: KA.cream });
  if (t > tn) { ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.rect(470, 905, 300, 330); ctx.stroke(); ctx.restore(); }
  brandTag(BRAND);
};
// 12. POWER: power and water from the New Jersey side
CU.power = (t, S) => {
  harbour(t, { labels: false }); tag("NEW JERSEY", 190, 860, { size: 32, bg: "#f2d29a" });
  const tp = at("power/power") - 0.1, k = eio(pp(t, tp, 0.8));
  if (k > 0) { ctx.save(); ctx.lineCap = "round"; for (const [y, c] of [[1160, "#e8b84a"], [1185, "#6fa4d8"]]) { ctx.strokeStyle = KA.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(-10 + 470 * k, y - 50 * k); ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(-10 + 470 * k, y - 50 * k); ctx.stroke(); } ctx.restore();
    const f = (t * 1.5) % 1; for (let i = 0; i < 3; i++) { const u = ((f + i / 3) % 1) * k; piece(() => ctx.arc(-10 + 470 * u, 1160 - 50 * u, 9, 0, 7), "#fff2b8", { lw: 2, light: false, shadow: false }); } }
  card(540, 420, 640, 200, 0.02, spring(pp(t, at("power/jersey") - 0.2, 0.6)), (w, h) => { text("ELECTRICITY · WATER · SEWAGE", 0, -18, { size: 34, font: "Elite" }); text("from the New Jersey side", 0, 44, { size: 40, font: "Serif", color: NJ_COL }); });
  brandTag(BRAND);
};
// 13. END: she stays in New York, surrounded by New Jersey (echoes the first frame)
CU.end = (t, S) => {
  harbour(t, { labels: false });
  popLabel("NEW YORK", 540, 330, t, S.t0, { size: 46, bg: "#cfd8ef" });
  flagArt("US-NY", 70, 300, 150);
  jerseyRing(t, at("end/surrounded") - 0.2);
  brandTag(BRAND);
};

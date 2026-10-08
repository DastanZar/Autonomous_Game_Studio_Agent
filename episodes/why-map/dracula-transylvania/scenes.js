// When Dracula came out (1897), Transylvania wasn't in Romania. House method: paper castle, book and props (paper kit),
// a 3D map flight over the Carpathians (flight kit; Natural Earth countries, the region merged from OSM county
// boundaries and labelled approximate, data/geom.json), moving type for the dates (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const GM = JSON.parse(EP.data["data/geom.json"]);
const BRAN = [25.3672, 45.5149], BUDA = [19.04, 47.50], BUC = [26.10, 44.43], ALBA = [23.58, 46.07], CLUJ = [24.2, 46.55], WAL = [25.0, 44.75];
const HU_HEX = "#c9806a", RO_HEX = "#e6bb5e", NIGHT = "#2c3248";
const tUnion = () => at("union/declared") - 0.2;
let REG = null;
const F = makeFlight({
  origin: [24, 46], near: null, far: "s_hungary", switchKm: 1, sea: 0x8fb0aa,
  colors: { RO: 0xe8c27a, HU: 0xd9947c, default: 0xe2d6bb },
  lines: [{ pts: GM.region[0][0], color: 0x2b2320, width: 2.2, layer: "far", height: 1.0, smooth: 0 }],
  keys: [
    [at("hungary.start") - 0.2, 23.6, 45.6, 3900, -6, 8], [at("hungary.end") + 0.2, 23.8, 45.8, 3200, 2, 12],
    [at("then.start"), 22.2, 46.1, 3400, 4, 10], [at("then.end") + 0.2, 22.8, 46.2, 2800, -6, 14],
    [at("border.start"), 24.8, 45.2, 2600, -6, 14], [at("border.end") + 0.2, 25.1, 45.2, 2050, 6, 20],
    [at("union.start"), 23.8, 45.7, 3100, 6, 12], [at("union.end") + 0.2, 24.1, 45.8, 2500, -6, 16],
    [at("vlad.start"), 25.0, 45.0, 2000, -8, 18], [at("vlad.end") + 0.2, 25.2, 45.1, 1450, 8, 26],
  ],
  update: (t, o) => {
    if (!REG) {
      const T3 = o.T3, shapes = GM.region.map(poly => new T3.Shape(poly[0].map(([lo, la]) => new T3.Vector2(...F.km(lo, la)))));
      const g = new T3.ExtrudeGeometry(shapes, { depth: 1.2, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, 5.8, 0);
      REG = new T3.Mesh(g, new T3.MeshLambertMaterial({ color: 0xd9947c })); REG.castShadow = true; o.scene.add(REG);
    }
    const k = clamp((t - tUnion()) / 1.2);
    REG.material.color.setHex(k < 0.5 ? 0xd9947c : 0xe8c27a); REG.position.y = 3 * Math.sin(Math.PI * k);
  },
});

// ---------- the castle, the night, the book ----------
function nightSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, "#1f2438"); g.addColorStop(1, "#4a4a62"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  softHalo(820, 420, 330, "#f3e6c0", 0.35); piece(() => ctx.arc(820, 420, 110, 0, 7), "#f1e6c6", { lw: 4, rim: 10 });
  for (let i = 0; i < 40; i++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)); ctx.fillStyle = `rgba(250,240,210,${a})`; ctx.fillRect(rnd(i, 1) * W, rnd(i, 2) * 700, 3, 3); }
}
function bat(x, y, s, t, id) {
  const f = Math.sin(t * 14 + id) * 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const k of [-1, 1]) { ctx.save(); ctx.scale(k, 1); ctx.rotate(-f * 0.6); piece(() => { ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -30, 70, -10); ctx.quadraticCurveTo(55, 0, 50, 12); ctx.quadraticCurveTo(30, 4, 20, 14); ctx.quadraticCurveTo(10, 4, 0, 8); ctx.closePath(); }, "#1b1820", { lw: 2.5, rim: 2, shadow: false }); ctx.restore(); }
  piece(() => ctx.ellipse(0, 4, 12, 16, 0, 0, 7), "#1b1820", { lw: 2.5, rim: 2, shadow: false });
  ctx.restore();
}
function castle(x, gy, s, o = {}) {                        // a generic gothic castle on a crag (not a portrait of any real one)
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(71, 0.4 / s);
  piece(() => { ctx.moveTo(-420, 260); ctx.lineTo(-300, 40); ctx.lineTo(-160, 20); ctx.lineTo(-60, -30); ctx.lineTo(120, -10); ctx.lineTo(260, 30); ctx.lineTo(420, 260); ctx.closePath(); }, o.rock || "#5a5560", { lw: 4.5, rim: 10 });
  const wall = o.wall || "#d8cdb4", roof = o.roof || "#b5532e";
  piece(() => ctx.rect(-220, -200, 420, 200), wall, { lw: 4, rim: 8 });
  for (let i = 0; i < 9; i++) piece(() => ctx.rect(-220 + i * 48, -226, 26, 28), wall, { lw: 3, rim: 3, shadow: false });
  for (const [tx, tw, th] of [[-250, 90, 380], [130, 110, 460], [-60, 80, 300]]) {
    piece(() => ctx.rect(tx, -th, tw, th), tone(wall, -0.05), { lw: 4, rim: 7 });
    piece(() => { ctx.moveTo(tx - 16, -th); ctx.lineTo(tx + tw / 2, -th - tw * 1.3); ctx.lineTo(tx + tw + 16, -th); ctx.closePath(); }, roof, { lw: 4, rim: 6 });
    for (let k = 0; k < 3; k++) piece(() => ctx.roundRect(tx + tw / 2 - 12, -th + 50 + k * 90, 24, 40, [12, 12, 0, 0]), o.lit ? "#f3cf6a" : "#3a3540", { lw: 2.5, rim: 2, shadow: false });
  }
  piece(() => ctx.roundRect(-30, -110, 60, 110, [30, 30, 0, 0]), "#2b2724", { lw: 3, rim: 3, shadow: false });
  ctx.restore();
}
function book(x, y, s, k, rot = -0.08) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y + (1 - k) * 200); ctx.rotate(rot); ctx.scale(s * k, s * k);
  piece(() => ctx.roundRect(-150, -210, 300, 420, 10), "#7b2a2a", { lw: 4.5, rim: 9, sx: 10, sy: 14 });
  piece(() => ctx.rect(-150, -210, 26, 420), "#5a1d1d", { lw: 3, light: false, shadow: false });
  text("DRACULA", 12, -60, { size: 52, color: "#e8c56a", font: "Serif" }); rule(-90, 110, -30);
  text("BRAM STOKER", 12, 20, { size: 30, color: "#e8c56a", font: "Elite" }); text("1897", 12, 140, { size: 44, color: "#e8c56a" });
  ctx.restore();
}

// 1. HOOK: 1897, Dracula's castle in Transylvania... not in Romania
CU.hook = (t, S) => {
  nightSky(t);
  castle(560, 1020, 1.05, { lit: true });
  for (let i = 0; i < 5; i++) bat(((i * 230 + t * 120) % (W + 200)) - 100, 300 + rnd(i, 3) * 260 + Math.sin(t * 2 + i) * 20, 0.8, t, i);
  piece(() => ctx.rect(-20, 1240, W + 40, H - 1240), "#3a3a48", { lw: 4, rim: 6, shadow: false });
  book(830, 760, 0.62, spring(pp(t, at("hook/eighteen") - 0.3, 0.6)), 0.1);
  popLabel("TRANSYLVANIA", 330, 360, t, 0, { size: 46, bg: KA.cream });
  stamp("NOT ROMANIA", W / 2, 1150, t - at("hook/wasn't") - 0.2, { size: 110, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 2. HUNGARY: in 1897 the region was in the Kingdom of Hungary
CU.hungary = (t, S) => {
  F.draw(t);
  flightPin(F, "KINGDOM OF HUNGARY, 1897", CLUJ[0], CLUJ[1], t, S.t0 + 0.1, { size: 34, bg: "#f2c9bd", h: 7.5, up: 120 });
  kText("HUNGARY", W / 2, 470, 150, t, at("hungary/hungary") - 0.1, { color: HU_HEX, stroke: 16, ink: KA.ink, ls: 6 });
  popLabel("borders approximate", W / 2, 1180, t, S.t0 + 0.3, { size: 28, bg: KA.cream });
  brandTag(BRAND);
};
// 3. STOKER: he put the Count's castle there; he never went
CU.stoker = (t, S) => {
  desk(); candle(930, 1075);
  book(330, 760, 1.0, 1, -0.06);
  const k = spring(pp(t, at("stoker/castle") - 0.2, 0.6));
  card(760, 700, 470, 330, 0.05, k, (w, h) => { text("THE NOVEL'S SETTING", 0, -h / 2 + 60, { size: 26, font: "Elite", color: "#6b5a48" }); rule(-170, 170, -h / 2 + 78); text("Count Dracula's", 0, -10, { size: 40, font: "Serif" }); text("castle,", 0, 40, { size: 40, font: "Serif" }); text("TRANSYLVANIA", 0, 110, { size: 48, color: KA.red }); });
  stamp("NEVER VISITED", W / 2, 1160, t - at("stoker/never"), { size: 100, rot: -0.06, color: KA.red });
  brandTag(BRAND);
};
// 4. THEN: part of the Kingdom of Hungary, inside Austria-Hungary
CU.then = (t, S) => {
  F.draw(t);
  flightPin(F, "BUDAPEST", BUDA[0], BUDA[1], t, at("then/kingdom") - 0.1, { size: 34, bg: "#f2c9bd", h: 7.5, up: 70 });
  flightPin(F, "TRANSYLVANIA", CLUJ[0], CLUJ[1], t, at("then/transylvania") - 0.1, { size: 34, bg: KA.cream, h: 7.5, up: 100 });
  kText("AUSTRIA-HUNGARY", W / 2, 470, 100, t, at("then/inside") - 0.1, { color: KA.cream, stroke: 14, ls: 2 });
  popLabel("borders approximate", W / 2, 1180, t, S.t0 + 0.3, { size: 28, bg: KA.cream });
  brandTag(BRAND);
};
// 5. BORDER: Romania was next door, across the mountains
CU.border = (t, S) => {
  F.draw(t);
  flightPin(F, "KINGDOM OF ROMANIA", BUC[0], BUC[1], t, at("border/romania") - 0.1, { size: 34, bg: "#f6dfa0", h: 7.5, up: 70 });
  flightPin(F, "CARPATHIAN MOUNTAINS", 25.6, 45.6, t, at("border/mountains") - 0.2, { size: 30, bg: KA.cream, h: 7.5, up: 160 });
  kText("NEXT DOOR", W / 2, 470, 120, t, at("border/next") - 0.1, { color: RO_HEX, stroke: 15, ink: KA.ink, ls: 4 });
  brandTag(BRAND);
};
// 6. WAR: the First World War broke Austria-Hungary apart
CU.war = (t, S) => {
  paperBG("#e7dcc4");
  const tr = at("war/broke") - 0.1, k = eio(pp(t, tr, 0.9));
  const tear = side => () => { ctx.moveTo(0, -260); for (let i = 0; i <= 12; i++) ctx.lineTo((rnd(i, 9) - 0.5) * 50, -260 + i * 43); ctx.lineTo(side * 400, 260); ctx.lineTo(side * 400, -260); ctx.closePath(); };
  for (const side of [-1, 1]) { ctx.save(); ctx.translate(540 + side * 160 * k, 760 + 40 * k); ctx.rotate(side * 0.12 * k);
    piece(tear(side), "#f1e6cc", { lw: 4, rim: 7, sx: 10, sy: 14 });
    ctx.save(); ctx.beginPath(); tear(side)(); ctx.clip(); text("AUSTRIA-HUNGARY", 0, -40, { size: 84, color: KA.ink }); text("1867 – 1918", 0, 60, { size: 46, font: "Elite", color: "#6b5a48" }); ctx.restore();
    ctx.restore(); }
  stamp("WORLD WAR I", W / 2, 420, t - at("war/war") + 0.1, { size: 90, rot: -0.06, color: KA.red });
  brandTag(BRAND);
};
// 7. UNION: 1918, Transylvania's Romanian delegates declared union with Romania
CU.union = (t, S) => {
  F.draw(t);
  flightPin(F, "ALBA IULIA · 1918", ALBA[0], ALBA[1], t, at("union/nineteen") - 0.1, { size: 32, bg: KA.cream, h: 7.5, up: 120 });
  kText("1918", W / 2, 470, 150, t, at("union/nineteen") - 0.1, { color: KA.cream, stroke: 16, ls: 6 });
  kText("UNION WITH ROMANIA", W / 2, 580, 70, t, at("union/union") - 0.1, { color: RO_HEX, stroke: 11, ink: KA.ink, ls: 2 });
  popLabel("borders approximate", W / 2, 1180, t, S.t0 + 0.3, { size: 28, bg: KA.cream });
  brandTag(BRAND);
};
// 8. TREATY: a treaty made it official in 1920
CU.treaty = (t, S) => {
  desk();
  const k = spring(pp(t, S.t0 + 0.05, 0.6));
  candle(150, 1230);
  card(540 + Math.sin(t * 0.9) * 12, 740, 800, 620, -0.02 + Math.sin(t * 0.7) * 0.01, k, (w, h) => {
    text("TREATY OF TRIANON", 0, -h / 2 + 90, { size: 58 }); rule(-300, 300, -h / 2 + 112);
    text("Transylvania: part of", 0, 20, { size: 44, font: "Serif" }); text("the Kingdom of Romania", 0, 80, { size: 44, font: "Serif" });
    text("1920", 0, 220, { size: 70, color: KA.red });
  }, { bg: "#f1e6cc" });
  quill(840, 1200, -0.5);
  stamp("OFFICIAL", W / 2, 1150, t - at("treaty/official"), { size: 96, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 9. VLAD: the real Dracula ruled Wallachia, the other side of the mountains
CU.vlad = (t, S) => {
  F.draw(t);
  flightPin(F, "WALLACHIA", WAL[0], WAL[1], t, at("vlad/wallachia") - 0.1, { size: 38, bg: "#f6dfa0", h: 7.5, up: 40 });
  flightPin(F, "TRANSYLVANIA", 24.6, 46.3, t, at("vlad/mountains") - 0.2, { size: 34, bg: "#f6dfa0", h: 7.5, up: 70 });
  const kc = spring(pp(t, at("vlad/vlad") - 0.1, 0.6));
  card(540, 470, 700, 220, -0.03, kc, (w, h) => { text("VLAD III · “THE IMPALER”", 0, -24, { size: 44 }); text("Voivode of Wallachia (1456–62 reign)", 0, 40, { size: 32, font: "Elite", color: "#6b5a48" }); });
  brandTag(BRAND);
};
// 10. BRAN: sold to tourists as Dracula's Castle
CU.bran = (t, S) => {
  sky({ sunX: 840, sunY: 380, top: "#d6c3a0" }); ridge(900, 300, KA.mtnFar, 0, 6, 0, true); haze(560, 960, 0.4);
  castle(560, 940, 0.82, { rock: "#8a8478" });
  for (let i = 0; i < 6; i++) bat(((i * 210 + t * 100) % (W + 200)) - 100, 420 + (i % 3) * 70 + Math.sin(t * 2 + i) * 25, 0.55, t, i);
  grass(1100, 1300, t * 20, KA.moss);
  woodSign(260, 1030, [["DRACULA'S", 40], ["CASTLE", 48]], spring(pp(t, at("bran/sold") - 0.1, 0.6)), { w: 330, post: 120, rot: -0.05 });
  const kt = pp(t, at("bran/tourists") - 0.3, 0.8);
  for (let i = 0; i < 22; i++) { const x = lerp(W + 60, 520 + (i % 11) * 48, eout(clamp(kt * 1.3 - i * 0.03))), y = 1170 + Math.floor(i / 11) * 40; shopper({ x, y, col: ["#c0442c", "#3a6ea5", "#6d9a5b", "#e08a3c", "#7b5a3a"][i % 5], skin: [KA.skin, "#c99a72", "#8d5f3e"][i % 3], hat: i % 4 === 0 }, 1.5, Math.abs(Math.sin(t * 8 + i)) * -3); }
  popLabel("BRAN CASTLE", 560, 470, t, at("bran/bran") - 0.1, { size: 44, bg: KA.cream });
  popLabel("MARKETED SINCE THE 1960s (LOCAL HISTORIAN)", W / 2, 560, t, at("bran/dracula's") - 0.2, { size: 26, bg: KA.mustard });
  brandTag(BRAND);
};
// 11. EVIDENCE: no evidence Stoker even knew it existed
CU.evidence = (t, S) => {
  sky({ sunX: 840, sunY: 380, top: "#d6c3a0" }); ridge(900, 300, KA.mtnFar, 0, 6, 0, true); haze(560, 960, 0.4);
  castle(560, 940, 0.82, { rock: "#8a8478" });
  for (let i = 0; i < 6; i++) bat(((i * 210 + t * 100) % (W + 200)) - 100, 420 + (i % 3) * 70 + Math.sin(t * 2 + i) * 25, 0.55, t, i);
  grass(1100, 1300, t * 20, KA.moss);
  book(820, 1030, 0.5, 1, 0.12);
  const kq = eio(pp(t, at("evidence/stoker") - 0.2, 0.6));       // the castle's absence from the book: a question mark pops over it
  if (kq > 0) { ctx.save(); ctx.translate(820, 760); ctx.scale(kq, kq); text("?", 0, 0, { size: 200, color: KA.red, stroke: 16 }); ctx.restore(); }
  stamp("NO EVIDENCE", W / 2, 480, t - at("evidence/evidence"), { size: 120, rot: -0.07, color: KA.red });
  popLabel("NOT MENTIONED IN THE NOVEL", W / 2, 1180, t, at("evidence/knew") - 0.1, { size: 32, bg: KA.cream });
  brandTag(BRAND);
};
// 12. END: Dracula never moved; the border did (the castle stays, the line slides past it)
CU.end = (t, S) => {
  nightSky(t);
  castle(560, 1020, 1.05, { lit: true });
  piece(() => ctx.rect(-20, 1240, W + 40, H - 1240), "#3a3a48", { lw: 4, rim: 6, shadow: false });
  const tb = at("end/border") - 0.2, k = eio(pp(t, tb, 1.0));
  const x = lerp(1020, 60, k);                                      // the border line slides across, under the castle
  ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([26, 18]); for (const [w, c] of [[14, KA.ink], [8, "#c0442c"]]) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 1230); ctx.stroke(); } ctx.restore();
  popLabel(k < 0.5 ? "HUNGARY (1897)" : "ROMANIA (SINCE 1918–20)", W / 2, 1180, t, at("end/moved") - 0.2, { size: 36, bg: k < 0.5 ? "#f2c9bd" : "#f6dfa0" });
  kText("THE BORDER MOVED", W / 2, 470, 96, t, tb + 0.4, { color: KA.cream, stroke: 14, ls: 3 });
  brandTag(BRAND);
};

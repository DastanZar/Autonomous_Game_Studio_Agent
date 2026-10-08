// Märket: Finland built its lighthouse in Sweden, so in 1985 they bent the border. House method: paper lighthouse,
// rock and props (paper kit), a 3D map flight to the real island (flight kit; OSM coastline, border and lighthouse,
// data/geom.json), moving type for the 3,913 square metres (kinetic kit), official flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";
const GM = JSON.parse(EP.data["data/geom.json"]);
const MID = [19.1318, 60.3009], LH = GM.lighthouse;
GEO.mk_near = { layers: [{ iso: "SE", polys: GM.old_halves.SE.map(r => [r]) }, { iso: "FI", polys: GM.old_halves.FI.map(r => [r]) }] };
const SE_BLUE = "#3a6ea5", FI_BLUE = "#2f5aa0";
const tSwap = () => at("swap/land") - 0.3;
let PIECES = null, TOWER = null;
const F = makeFlight({
  origin: MID, near: "mk_near", far: "s_rock", switchKm: 8, sea: 0x8fb0aa,
  colors: { SE: 0xead6a4, FI: 0xa9bfe8, AX: 0xa9bfe8, default: 0xe2cfa2 },
  lines: [
    { pts: GM.old, color: 0x2b2320, width: 0.0035, from: at("middle/border") - 0.1, to: at("middle/middle"), until: at("swap/back") + 0.4 },
    { pts: GM.new, color: 0xc0442c, width: 0.004, from: at("fix/border") - 0.2, to: at("fix/border") + 0.9 },
  ],
  keys: [
    [at("rock.start") - 0.2, 19.6, 60.1, 420, 0, 8], [at("rock/sea") + 0.1, 19.3, 60.25, 160, 0, 14], [at("rock.end") + 0.2, MID[0], MID[1] - 0.0005, 0.9, 0, 28],
    [at("middle.start"), MID[0], MID[1] - 0.0005, 0.85, 0, 30], [at("middle.end") + 0.2, MID[0], MID[1] - 0.0004, 0.7, -8, 34],
    [at("west.start"), MID[0] - 0.0003, MID[1] - 0.0004, 0.62, -8, 34], [at("west.end") + 0.2, MID[0] - 0.0004, MID[1] - 0.0003, 0.55, -14, 38],
    [at("fix.start"), MID[0], MID[1] - 0.0005, 0.8, 0, 26], [at("fix.end"), MID[0], MID[1] - 0.0004, 0.68, 6, 28],
    [at("swap.start"), MID[0], MID[1] - 0.0002, 0.62, 0, 14], [at("swap.end") + 0.3, MID[0], MID[1] - 0.0002, 0.58, 0, 18],
    [at("coast.start"), MID[0], MID[1] - 0.0004, 0.75, 10, 28], [at("coast.end") + 0.3, MID[0], MID[1] - 0.0004, 0.7, 20, 32],
    [at("zigzag.start"), MID[0], MID[1] - 0.0004, 0.7, 20, 32], [at("zigzag.end") + 0.3, MID[0], MID[1] - 0.0004, 0.62, 45, 40],
  ],
  update: (t, o) => {
    if (!PIECES) {
      PIECES = GM.swap.filter(p => p.m2 > 1000).map(p => ({ to: p.to, m: slabOf(o, [[p.poly]], p.to === "FI" ? 0x7f9fe0 : 0xf0c870, 0.012) }));
      TOWER = new o.T3.Group();
      const v = o.v3(LH[0], LH[1], o.TOP);
      const body = new o.T3.Mesh(new o.T3.CylinderGeometry(0.006, 0.008, 0.034, 12), new o.T3.MeshLambertMaterial({ color: 0xf4efe4 })); body.position.set(v.x, v.y + 0.017, v.z);
      const cap = new o.T3.Mesh(new o.T3.CylinderGeometry(0.004, 0.006, 0.01, 12), new o.T3.MeshLambertMaterial({ color: 0xc0442c })); cap.position.set(v.x, v.y + 0.039, v.z);
      const house = new o.T3.Mesh(new o.T3.BoxGeometry(0.03, 0.014, 0.018), new o.T3.MeshLambertMaterial({ color: 0xd9c9b0 })); house.position.set(v.x + 0.012, v.y + 0.007, v.z + 0.004);
      [body, cap, house].forEach(m => { m.castShadow = true; TOWER.add(m); }); o.props.add(TOWER);
    }
    const k = eio(clamp((t - tSwap()) / 1.4));
    for (const P of PIECES) { P.m.visible = k > 0; P.m.position.y = 0.02 + 0.03 * Math.sin(Math.PI * k); }
  },
});
function slabOf(o, polys, col, depth) {
  const T3 = o.T3, shapes = [];
  for (const poly of polys) { const sh = new T3.Shape(poly[0].map(([lo, la]) => new T3.Vector2(...F.km(lo, la)))); shapes.push(sh); }
  const g = new T3.ExtrudeGeometry(shapes, { depth, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, o.TOP - 0.01, 0);
  const m = new T3.Mesh(g, new T3.MeshLambertMaterial({ color: col })); m.castShadow = true; m.receiveShadow = true; o.props.add(m); return m;
}

// ---------- side view: the bare rock, the lighthouse, the flags ----------
function rock(t, o = {}) {
  sky({ sunX: 840, sunY: 400, top: "#d8d2c4", bot: "#e6dccb" }); haze(560, 980, 0.4);
  seaBand(940, H, t * 30, KA.sea2);
  piece(() => { ctx.moveTo(60, 1180); ctx.bezierCurveTo(140, 1060, 300, 1010, 520, 1000); ctx.bezierCurveTo(760, 992, 930, 1050, 1020, 1180); ctx.quadraticCurveTo(540, 1215, 60, 1180); ctx.closePath(); }, "#9a9488", { lw: 4.5, rim: 10 });
  for (let i = 0; i < 12; i++) piece(blob(120 + i * 75, 1150 + rnd(i, 3) * 30, 26, 10, 8, i, 0.3), "#86807a", { lw: 2.5, rim: 3, shadow: false });
}
function lighthouse(x, gy, s, k = 1) {                       // the 1885 tower on its keeper's house, rising by k (0..1)
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s * k); boil(61, 0.4 / s);
  piece(() => ctx.rect(-170, -150, 340, 150), "#d9c9b0", { lw: 4, rim: 7 });
  piece(() => { ctx.moveTo(-190, -150); ctx.lineTo(0, -240); ctx.lineTo(190, -150); ctx.closePath(); }, "#8a3a2a", { lw: 4, rim: 6 });
  for (const wx of [-120, -40, 60, 130]) piece(() => ctx.rect(wx - 18, -110, 36, 48), "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  piece(() => { ctx.moveTo(-50, -200); ctx.lineTo(-38, -520); ctx.lineTo(38, -520); ctx.lineTo(50, -200); ctx.closePath(); }, "#f4efe4", { lw: 4, rim: 8 });
  piece(() => ctx.rect(-50, -560, 100, 44), "#c0442c", { lw: 4, rim: 5 });
  piece(() => ctx.rect(-36, -610, 72, 50), "#e8d68a", { lw: 3.5, rim: 4 });
  piece(() => { ctx.moveTo(-46, -610); ctx.lineTo(0, -660); ctx.lineTo(46, -610); ctx.closePath(); }, "#2b2724", { lw: 3.5, rim: 3 });
  ctx.restore();
  if (k >= 1) { const g = 0.5 + 0.5 * Math.sin(T * 3); softHalo(x, gy - 585 * s, 160 * s, "#fff2b8", 0.35 * g); }
}
function flagOnPole(code, x, gy, h, w, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, gy); ctx.scale(1, k); ctx.translate(-x, -gy);
  piece(() => ctx.roundRect(x - 6, gy - h, 12, h, 4), "#d8d1c2", { lw: 3, rim: 4 }); flagArt(code, x + 6, gy - h + 4, w); ctx.restore();
}

// 1. HOOK: 1885, Finland builds its lighthouse... in Sweden
CU.hook = (t, S) => {
  rock(t);
  const kb = eout(pp(t, at("hook/built") - 0.3, 0.9));
  lighthouse(380, 1030, 0.85, lerp(0.35, 1, kb));
  flagOnPole("FI", 640, 1040, 260, 150, spring(pp(t, at("hook/finland") - 0.2, 0.5)));
  stamp("1885", 820, 480, t - at("hook/in") - 0.25, { size: 110, rot: 0.08, color: KA.navy });
  if (t > at("hook/sweden") - 0.1) { const k = spring(pp(t, at("hook/sweden") - 0.1, 0.5)); popIn(380, 1190, k, () => { piece(() => ctx.rect(-330, -40, 660, 80), "#f2c14e", { lw: 4, rim: 5, alpha: 0.9 }); text("YOU ARE IN SWEDEN", 0, 18, { size: 44, color: SE_BLUE }); }); }
  flagBadge("SE", 160, 420, 64);
  stamp("IN SWEDEN", W / 2, 690, t - at("hook/sweden"), { size: 120, rot: -0.07, color: KA.red });
  brandTag(BRAND);
};
// 2. ROCK: fly in to a bare rock in the Baltic
CU.rock = (t, S) => {
  const c = F.draw(t);
  if (c.h > 8) { flightPin(F, "SWEDEN", 18.3, 60.15, t, S.t0 + 0.2, { size: 38, bg: "#f6dfa0", h: 6.5, up: 50 }); flightPin(F, "ÅLAND (FINLAND)", 20.0, 60.2, t, S.t0 + 0.4, { size: 34, bg: "#cfd8ef", h: 6.5, up: 50 }); flightPin(F, "MÄRKET", 19.13, 60.3, t, at("rock/baltic") - 0.1, { size: 36, bg: KA.cream, h: 6.5, up: 150 }); }
  else {
    flightPin(F, "MÄRKET", MID[0], MID[1] + 0.0004, t, at("rock/just") - 0.3, { size: 36, bg: KA.cream, up: 260 });
    popLabel("JUST OVER 300 M LONG", W / 2, 1180, t, at("rock/three") - 0.1, { size: 40, bg: KA.mustard });
  }
  brandTag(BRAND);
};
// 3. MIDDLE: since 1809 the border ran straight through the middle
CU.middle = (t, S) => {
  F.draw(t);
  flightPin(F, "SWEDEN", MID[0] - 0.0019, MID[1] + 0.0002, t, S.t0 + 0.2, { size: 34, bg: "#f6dfa0", up: 120 });
  flightPin(F, "FINLAND", MID[0] + 0.0021, MID[1] - 0.0002, t, S.t0 + 0.4, { size: 34, bg: "#cfd8ef", up: 120 });
  kText("SINCE 1809", W / 2, 470, 110, t, at("middle/eighteen") - 0.1, { color: KA.cream, stroke: 14, ls: 4 });
  brandTag(BRAND);
};
// 4. WEST: the lighthouse went up 35-60 m west of the line, on the Swedish side
CU.west = (t, S) => {
  F.draw(t);
  flightPin(F, "THE LIGHTHOUSE", LH[0], LH[1], t, S.t0 + 0.1, { size: 32, bg: KA.cream, up: 300, h: 0.31 });
  const td = at("west/thirtyfive") - 0.1;
  if (t > td) {
    const [x0, y0] = F.project(LH[0], LH[1]), [x1, y1] = F.project(19.13215, 60.30092), k = eio(pp(t, td, 0.6));
    ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x0, k), lerp(y1, y0, k)); ctx.stroke(); ctx.restore();
    popLabel("35–60 M WEST", (x0 + x1) / 2, Math.max(y0, y1) + 80, t, td + 0.4, { size: 40, bg: KA.mustard });
  }
  stamp("SWEDISH SIDE", W / 2, 470, t - at("west/swedish"), { size: 100, rot: -0.06, color: KA.red });
  brandTag(BRAND);
};
// 5. WHY: the official papers don't say
CU.why = (t, S) => {
  desk();
  const k = spring(pp(t, S.t0 + 0.05, 0.6));
  card(540, 720, 860, 700, -0.02, k, (w, h) => {
    text("SVERIGES RIKSDAG", 0, -h / 2 + 70, { size: 34, font: "Elite", color: "#6b5a48" });
    text("LU 1984/85:16", 0, -h / 2 + 130, { size: 56 }); rule(-320, 320, -h / 2 + 152);
    const q = ["“Orsaken till att fyranläggningen", "uppförts på svenskt territorium", "framgår inte av propositionen", "eller gränshandlingarna.”"];
    q.forEach((l, i) => { ctx.save(); ctx.globalAlpha = clamp((t - at("why/papers") + 0.2 - i * 0.12) / 0.3); text(l, 0, -60 + i * 56, { size: 36, font: "Serif" }); ctx.restore(); });
    text("“The reason the lighthouse was built on Swedish", 0, 200, { size: 24, font: "Elite", color: "#6b5a48" });
    text("territory is not stated in the bill or the border papers.”", 0, 234, { size: 24, font: "Elite", color: "#6b5a48" });
  }, { bg: "#f1e6cc" });
  stamp("REASON: NOT RECORDED", W / 2, 1180, t - at("why/say"), { size: 74, rot: -0.05, color: KA.red });
  brandTag(BRAND);
};
// 6. FIX: 1985, they moved the border, not the lighthouse
CU.fix = (t, S) => {
  F.draw(t);
  kText("1985", W / 2, 460, 140, t, at("fix/nineteen") - 0.1, { color: KA.cream, stroke: 16, ls: 6 });
  if (t > at("fix/not") - 0.1 && t < at("fix/by#1") - 0.1) stamp("MOVE THE LIGHTHOUSE?", W / 2, 1140, t - at("fix/not") + 0.1, { size: 66, rot: -0.05, color: KA.navy });
  stamp("MOVE THE BORDER", W / 2, 1140, t - at("fix/border") + 0.1, { size: 86, rot: -0.05, color: KA.red });
  brandTag(BRAND);
};
// 7. SWAP: Finland got the land around the lighthouse; Sweden got the same amount back
CU.swap = (t, S) => {
  F.draw(t);
  const fi = GM.swap.find(p => p.to === "FI"), se = GM.swap.filter(p => p.to === "SE").sort((a, b) => b.m2 - a.m2)[0];
  const cen = p => p.poly.reduce((a, q) => [a[0] + q[0] / p.poly.length, a[1] + q[1] / p.poly.length], [0, 0]);
  const [fx, fy] = F.project(...cen(fi)), [sx, sy] = F.project(...cen(se));
  popLabel("→ FINLAND", fx, fy - 170, t, at("swap/land") - 0.1, { size: 40, bg: "#cfd8ef" });
  popLabel("→ SWEDEN", sx, sy - 170, t, at("swap/sweden") - 0.1, { size: 40, bg: "#f6dfa0" });
  brandTag(BRAND);
};
// 8. NUMBER: 3,913 square metres, each way (C: the one big number)
CU.number = (t, S) => {
  graphPaper();
  const t0 = at("number/three") - 0.15;
  bigNumber(t, t0, { value: 3913, suffix: " M²", label: "EACH WAY", sub: "the Swedish parliament's 1985 report", stroke: 14, size: 210, y: 640, roll: 1.4, colors: { fg: KA.cream, accent: KA.red, ink: KA.ink }, subColor: KA.ink });
  // two equal paper squares sliding past each other
  const k = eio(pp(t, at("number/each") - 0.2, 0.8));
  for (const [x0, x1, col] of [[300, 780, "#a9bfe8"], [780, 300, "#ead6a4"]]) popIn(lerp(x0, x1, k), 1000, spring(pp(t, t0 + 0.5, 0.5)), () => piece(() => ctx.rect(-90, -90, 180, 180), col, { lw: 4, rim: 7 }));
  arrow(420, 1000, 660, 1000, k, KA.ink, 6);
  brandTag(BRAND);
};
// 9. COAST: the coastline stayed put, for both countries' fishing rights
CU.coast = (t, S) => {
  F.draw(t);
  const ends = [GM.new[0], GM.new[GM.new.length - 1]], tc = at("coast/coastline") - 0.1;
  ends.forEach(([lo, la], i) => { const [x, y] = F.project(lo, la); const k = spring(pp(t, tc + i * 0.2, 0.5)); if (k > 0) { ctx.save(); ctx.lineWidth = 8; ctx.strokeStyle = KA.ink; ctx.beginPath(); ctx.arc(x, y, 34 * k, 0, 7); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = KA.mustard; ctx.beginPath(); ctx.arc(x, y, 34 * k, 0, 7); ctx.stroke(); ctx.restore(); } });
  popLabel("SAME SHORE POINTS AS BEFORE", W / 2, 470, t, tc + 0.3, { size: 36, bg: KA.mustard });
  popLabel("FISHING RIGHTS: UNCHANGED", W / 2, 1150, t, at("coast/fishing") - 0.1, { size: 40, bg: KA.cream });
  brandTag(BRAND);
};
// 10. ZIGZAG: a zigzag border on a rock where nobody lives
CU.zigzag = (t, S) => {
  F.draw(t);
  kText("ZIGZAG", W / 2, 470, 150, t, at("zigzag/zigzag") - 0.1, { color: "#c0442c", stroke: 16, ink: KA.ink, ls: 8 });
  stamp("POPULATION: 0", W / 2, 1150, t - at("zigzag/nobody"), { size: 90, rot: -0.06, color: KA.red });
  brandTag(BRAND);
};
// 11. HOLES: marked by holes drilled into the rock; drift ice would shear anything taller off
CU.holes = (t, S) => {
  sky({ sunX: 300, sunY: 420, top: "#cfd3d4", bot: "#e2e0d8" }); haze(560, 940, 0.4);
  seaBand(860, H, t * 30, "#8aa7a6");
  piece(() => { ctx.moveTo(-20, 1260); ctx.lineTo(-20, 900); ctx.quadraticCurveTo(540, 860, W + 20, 920); ctx.lineTo(W + 20, 1260); ctx.closePath(); }, "#9a9488", { lw: 4.5, rim: 10 });
  const th = at("holes/holes") - 0.1;
  for (let i = 0; i < 6; i++) { const k = pp(t, th + i * 0.15, 0.25); if (k <= 0) continue; const x = 150 + i * 160, y = 1000 + Math.sin(i * 1.3) * 60; ctx.save(); ctx.globalAlpha = k; piece(() => ctx.ellipse(x, y, 26, 12, 0, 0, 7), "#3a3530", { lw: 3, light: false, shadow: false }); ctx.restore(); if (i) { ctx.save(); ctx.globalAlpha = 0.6 * k; line(x - 160, 1000 + Math.sin((i - 1) * 1.3) * 60, x, y, "#c0442c", 4, [12, 10]); ctx.restore(); } }
  popLabel("BORDER MARKERS: HOLES IN THE ROCK", W / 2, 1150, t, th + 0.4, { size: 32, bg: KA.cream });
  const ti = at("holes/ice") - 0.6;                          // drift ice slides in and grinds the shore
  for (let i = 0; i < 4; i++) { const x = lerp(-400 - i * 120, 120 + i * 220, eout(pp(t, ti + i * 0.1, 1.2))); piece(() => { ctx.moveTo(x - 150, 880 - i * 30); ctx.lineTo(x + 120, 870 - i * 30); ctx.lineTo(x + 170, 930 - i * 30); ctx.lineTo(x - 130, 945 - i * 30); ctx.closePath(); }, "#eef3f4", { lw: 4, rim: 7 }); }
  // a little marker post that the ice knocks over
  const kk = eio(pp(t, at("holes/shear") - 0.1, 0.4));
  ctx.save(); ctx.translate(820, 960); ctx.rotate(-1.4 * kk); ctx.globalAlpha = 1 - 0.3 * kk; piece(() => ctx.rect(-10, -150, 20, 150), "#c0442c", { lw: 3.5, rim: 4 }); ctx.restore();
  if (t > at("holes/taller") - 0.2) popLabel("POSTS? THE ICE TAKES THEM", 760, 640, t, at("holes/taller") - 0.2, { size: 30, bg: KA.mustard });
  brandTag(BRAND);
};
// 12. END: all for one lighthouse (echoes the first frame)
CU.end = (t, S) => {
  rock(t);
  lighthouse(380, 1030, 0.85, 1);
  flagOnPole("FI", 640, 1040, 260, 150, 1);
  ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([24, 16]); const zz = [[760, 1190], [700, 1080], [560, 1150], [470, 1010]];
  for (const [w, c] of [[14, KA.ink], [8, "#c0442c"]]) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.beginPath(); zz.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); }
  ctx.restore();
  kText("1 LIGHTHOUSE", W / 2, 520, 120, t, at("end/one") - 0.15, { color: KA.cream, stroke: 15, ls: 4 });
  brandTag(BRAND);
};

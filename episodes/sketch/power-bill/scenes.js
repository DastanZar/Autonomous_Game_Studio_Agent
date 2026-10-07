// power-bill: one page, drawn while the narrator talks. Layout (world units, page 2200 x 5280):
//   row 0: A hook (left)        B data center (right)
//   row 1: C share of US power  D the PJM grid (real state outlines, Natural Earth)
//   row 2: E the auction        F the forecast
//   row 3: G the price chart (full width)
//   row 4: H market monitor     I the D.C. bill
// Every number drawn here is in dossier.json; estimates carry their label on the page.
"use strict";
(() => {
  const L = 60, R = 1140, ROW = [60, 1100, 2140, 3180, 4220];
  const cell = (x0, y0) => ({ x: v => x0 + v, y: v => y0 + v, p: (a, b) => [x0 + a, y0 + b] });
  const A = cell(L, ROW[0]), B = cell(R, ROW[0]), C = cell(L, ROW[1]), D = cell(R, ROW[1]), E = cell(L, ROW[2]), F = cell(R, ROW[2]);
  const G = cell(L, ROW[3]), Hc = cell(L, ROW[4]), I = cell(R, ROW[4]);
  const item = SK.item;
  const T = (c, d = 0) => cue(c) + d;
  const big = (size, c, align = "center") => ({ font: "Marker", size, c, align });
  const hand = (size, c, align = "center") => ({ font: "Hand", size, c, align });
  const wedge = (cx, cy, r, a0, a1) => { const pts = [[cx, cy]]; const n = Math.max(6, Math.round((a1 - a0) * 20)); for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; };
  const stick = (it, x, y, s = 1, o = {}) => {        // a stick figure, feet at (x, y)
    it.circle(x, y - 205 * s, 34 * s, { w: 5 * s + 1 });
    it.line(x, y - 171 * s, x, y - 70 * s, { w: 5 * s + 1 });
    it.line(x, y - 70 * s, x - 34 * s, y, { w: 5 * s + 1 }); it.line(x, y - 70 * s, x + 34 * s, y, { w: 5 * s + 1 });
    if (o.arms !== false) { it.line(x, y - 140 * s, x - 42 * s, y - 95 * s, { w: 5 * s + 1 }); it.line(x, y - 140 * s, x + 42 * s, y - 95 * s, { w: 5 * s + 1 }); }
  };
  const servers = (it, x, y, w, h, n, seed) => {
    it.rect(x, y, w, h, { w: 4 });
    for (let i = 1; i < n; i++) it.line(x + 6, y + h * i / n, x + w - 6, y + h * i / n, { w: 3, ghost: false });
    for (let i = 0; i < n; i++) it.dot(x + w - 22, y + h * (i + 0.5) / n, 6, { c: "green", blink: { rate: 1.7, phase: (seed * 7 + i * 5) % 3, c: "red" } });
  };

  // ---------- A: the hook ----------
  item(T("hook/your", -0.05), 0.95).text("YOUR POWER BILL", A.x(40), A.y(150), big(112, "ink", "left"));
  item(T("hook/went", -0.05), 0.5).text("WENT UP", A.x(40), A.y(280), big(112, "red", "left"));
  item(T("hook/up", 0.12), 0.3).arrow(A.x(470), A.y(290), A.x(470), A.y(170), { c: "red", w: 9, head: 30 });
  { const it = item(T("hook/blame", -0.35), 0.75); stick(it, A.x(200), A.y(900), 1.25, { arms: false });
    it.line(A.x(200), A.y(725), A.x(290), A.y(760)); it.line(A.x(200), A.y(740), A.x(290), A.y(790));
    it.arc(A.x(200), A.y(670), 16, 3.6, 5.8, { w: 4, ghost: false }); }
  { const it = item(T("hook/a", 0.1), 0.6);
    it.rect(A.x(280), A.y(560), 220, 300, { w: 5 }); it.text("$$$", A.x(390), A.y(680), big(80, "red"));
    it.line(A.x(305), A.y(730), A.x(475), A.y(730), { w: 3 }); it.line(A.x(305), A.y(770), A.x(445), A.y(770), { w: 3 }); it.line(A.x(305), A.y(810), A.x(465), A.y(810), { w: 3 }); }
  { const it = item(T("hook/you've", -0.1), 0.85);
    it.poly([A.p(620, 900), A.p(620, 560), A.p(940, 560), A.p(940, 900)], { dash: [16, 14], w: 5 });
    it.text("?", A.x(780), A.y(800), big(190, "blue")); }

  // ---------- B: the data center ----------
  item(T("dc/this", 0.25), 0.6).text("DATA CENTER", B.x(500), B.y(200), big(104, "ink"));
  { const it = item(T("dc/center", 0.2), 0.75);
    it.line(B.x(30), B.y(760), B.x(970), B.y(760), { w: 5 });
    it.rect(B.x(110), B.y(330), 780, 430, { w: 6 }); it.line(B.x(95), B.y(330), B.x(905), B.y(330), { w: 7 }); }
  { const it = item(T("dc/warehouse", 0.15), 1.25);
    [0, 1, 2, 3].forEach(i => servers(it, B.x(150 + i * 185), B.y(400), 140, 320, 6, i)); }
  { const it = item(T("dc/running", 0.05), 0.85);
    [270, 730].forEach(x => { it.rect(B.x(x - 60), B.y(275), 120, 55, { w: 4 }); it.circle(B.x(x), B.y(302), 20, { w: 3, ghost: false }); });
    it.line(B.x(20), B.y(760), B.x(20), B.y(390), { w: 5 }); it.line(B.x(-10), B.y(410), B.x(50), B.y(410), { w: 5 });
    it.curve([B.p(-5, 410), B.p(50, 450), B.p(110, 455)], { w: 3, ghost: false }); it.curve([B.p(45, 410), B.p(80, 470), B.p(110, 490)], { w: 3, ghost: false });
    it.poly([B.p(60, 520), B.p(40, 575), B.p(72, 575), B.p(52, 630)], { c: "yellow", w: 7, ghost: false }); }
  { const it = item(T("dc/day", -0.1), 0.45); it.circle(B.x(130), B.y(80), 34, { c: "yellow", w: 6 });
    for (let k = 0; k < 8; k++) { const a = k * 0.785; it.line(B.x(130 + Math.cos(a) * 48), B.y(80 + Math.sin(a) * 48), B.x(130 + Math.cos(a) * 66), B.y(80 + Math.sin(a) * 66), { c: "yellow", w: 5, ghost: false }); } }
  { const it = item(T("dc/night", -0.1), 0.45); it.arc(B.x(870), B.y(80), 40, 1.2, 5.1, { c: "blue", w: 6 }); it.arc(B.x(888), B.y(76), 32, 1.5, 4.8, { c: "blue", w: 5 }); }

  // ---------- C: share of all US electricity ----------
  item(T("share/in", 0.25), 0.9).text("SHARE OF ALL US ELECTRICITY", C.x(500), C.y(110), hand(66, "ink"));
  item(T("share/they", -0.1), 0.45).circle(C.x(260), C.y(420), 185, { w: 6 });
  { const a0 = -Math.PI / 2, it = item(T("share/four", -0.05), 0.55), w = wedge(C.x(260), C.y(420), 185, a0, a0 + 0.044 * 6.283);
    it.poly(w, { closed: true, c: "red", w: 5 }); it.hatch(w, { c: "red", gap: 9, angle: -0.6 }); }
  { const it = item(T("share/electricity", -0.3), 0.8); it.text("2023", C.x(260), C.y(700), big(76, "ink")); it.text("4.4%", C.x(260), C.y(800), big(92, "red")); }
  item(T("share/by", -0.35), 0.3).arrow(C.x(470), C.y(420), C.x(540), C.y(420), { w: 6, head: 24 });
  item(T("share/by", 0.0), 0.45).circle(C.x(740), C.y(420), 185, { w: 6 });
  { const a0 = -Math.PI / 2, it = item(T("share/twentyeight", 0.05), 0.65);
    const w1 = wedge(C.x(740), C.y(420), 185, a0, a0 + 0.067 * 6.283), w2 = wedge(C.x(740), C.y(420), 185, a0, a0 + 0.12 * 6.283);
    it.poly(w2, { closed: true, c: "red", w: 5, dash: [12, 10] }); it.hatch(w1, { c: "red", gap: 9, angle: -0.6 }); it.hatch(w2, { c: "red", gap: 16, angle: 0.7, alpha: 0.3 }); }
  { const it = item(T("share/it", 0.0), 0.7); it.text("2028", C.x(740), C.y(700), big(76, "ink")); it.text("6.7-12%", C.x(740), C.y(800), big(92, "red")); }
  item(T("share/twelve", 0.15), 0.45, { sfx: false }).text("LBNL estimate for the US Dept. of Energy, Dec 2024", C.x(500), C.y(910), hand(36, "grey"));

  // ---------- D: the PJM grid, real state outlines ----------
  item(T("grid/thirteen", 0.3), 0.75).text("13 STATES + D.C.", D.x(500), D.y(90), big(84, "ink"));
  {
    const data = JSON.parse(EP.data["data/states_east.json"]), sts = data.states.filter(s => s.pjm);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const kx = Math.cos(40 * Math.PI / 180);
    sts.forEach(s => s.rings.forEach(r => r.forEach(([lo, la]) => { x0 = Math.min(x0, lo * kx); x1 = Math.max(x1, lo * kx); y0 = Math.min(y0, la); y1 = Math.max(y1, la); })));
    const sc = Math.min(880 / (x1 - x0), 700 / (y1 - y0)), ox = 500 - (x1 - x0) * sc / 2, oy = 130 + (700 - (y1 - y0) * sc) / 2;
    const pr = ([lo, la]) => D.p(ox + (lo * kx - x0) * sc, oy + (y1 - la) * sc);
    const it = item(T("grid/washington", -0.05), 1.45);
    const order = ["IL", "IN", "MI", "OH", "KY", "TN", "WV", "PA", "VA", "NC", "MD", "DE", "NJ", "DC"];
    order.forEach(c => { const s = sts.find(q => q.code === c); if (!s) return; s.rings.forEach(r => { if (c === "DC") { const p = pr(r[0]); it.dot(p[0], p[1], 9, { c: "red" }); } else it.poly(r.map(pr), { closed: true, w: 4, amp: 1.0 }); }); });
    const ht = item(T("grid/called", -0.15), 0.8, { sfx: false });
    order.forEach(c => { const s = sts.find(q => q.code === c); if (!s || c === "DC") return; s.rings.forEach(r => ht.hatch(r.map(pr), { c: "blue", gap: 15, angle: -0.8, alpha: 0.42 })); });
    const oh = sts.find(q => q.code === "OH"), cen = oh.rings[0].reduce((a, p) => [a[0] + p[0] / oh.rings[0].length, a[1] + p[1] / oh.rings[0].length], [0, 0]);
    const pc = pr(cen);
    item(T("grid/pjm", -0.1), 0.5).text("PJM", pc[0] + 60, pc[1] + 40, { font: "Marker", size: 150, c: "ink", align: "center" });
  }
  item(T("grid/sixtyseven", -0.05), 0.9).text("67 MILLION PEOPLE", D.x(500), D.y(925), big(80, "red"));
  item(T("grid/people", -0.35), 0.4, { sfx: false }).text("(all or part of each state)", D.x(500), D.y(980), hand(34, "grey"));

  // ---------- E: the auction ----------
  item(T("auction/every", 0.25), 0.55).text("EVERY YEAR:", E.x(500), E.y(80), hand(56, "ink"));
  { const it = item(T("auction/pjm", -0.1), 0.85);          // a gavel: barrel head with banded ends, handle, sound block
    const hx = 250, hy = 330, ca = Math.cos(-0.45), sa = Math.sin(-0.45), rp = (u, v) => E.p(hx + u * ca - v * sa, hy + u * sa + v * ca);
    const capE = (u) => { const pts = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * 6.283; pts.push(rp(u + Math.cos(a) * 16, Math.sin(a) * 46)); } return pts; };
    it.poly([rp(-100, -46), rp(100, -46)], { w: 6 }); it.poly([rp(-100, 46), rp(100, 46)], { w: 6 });
    it.poly(capE(-100), { w: 5, over: 0 }); it.poly(capE(100), { w: 5, over: 0 });
    it.poly([rp(-62, -46), rp(-62, 46)], { w: 4 }); it.poly([rp(62, -46), rp(62, 46)], { w: 4 });
    it.poly([rp(-10, 46), rp(-12, 300), rp(12, 300), rp(10, 46)], { w: 5 });
    it.circle(E.x(330), E.y(600), 130, { ry: 28, w: 5 }); it.line(E.x(200), E.y(600), E.x(200), E.y(630), { w: 5 }); it.line(E.x(460), E.y(600), E.x(460), E.y(630), { w: 5 });
    it.arc(E.x(330), E.y(630), 130, 0.05, 3.09, { ry: 28, w: 5 }); }
  item(T("auction/holds", 0.1), 0.55).text("THE AUCTION", E.x(500), E.y(190), big(96, "ink"));
  { const it = item(T("auction/auction", 0.0), 0.3, { sfx: false });
    [[-1, -0.3], [-0.8, -1.1], [1, -0.3], [0.8, -1.1]].forEach(([dx, dy]) => it.line(E.x(330 + dx * 150), E.y(560 + dy * 40), E.x(330 + dx * 200), E.y(560 + dy * 70), { w: 5 })); }
  { const it = item(T("auction/pays", -0.1), 1.2);
    it.curve([E.p(640, 640), E.p(665, 520), E.p(650, 420), E.p(675, 330)], { w: 5 }); it.curve([E.p(840, 640), E.p(815, 520), E.p(830, 420), E.p(805, 330)], { w: 5 });
    it.circle(E.x(740), E.y(330), 66, { ry: 14, w: 4 });
    it.rect(E.x(560), E.y(640), 380, 120, { w: 5 }); it.rect(E.x(880), E.y(380), 40, 260, { w: 4 });
    it.curve([E.p(740, 300), E.p(700, 240), E.p(760, 200), E.p(720, 150)], { c: "grey", w: 5 }); }
  { const it = item(T("auction/plants", 0.15), 0.55);
    it.arrow(E.x(400), E.y(470), E.x(560), E.y(470), { dash: [14, 10], w: 6, c: "green" }); it.text("$", E.x(480), E.y(440), big(80, "green")); }
  item(T("auction/just", -0.05), 0.85).text("JUST TO BE READY", E.x(400), E.y(880), big(80, "red"));
  { const it = item(T("auction/busiest", -0.25), 0.7); it.circle(E.x(860), E.y(860), 34, { c: "yellow", w: 6 });
    for (let k = 0; k < 8; k++) { const a = k * 0.785; it.line(E.x(860 + Math.cos(a) * 48), E.y(860 + Math.sin(a) * 48), E.x(860 + Math.cos(a) * 64), E.y(860 + Math.sin(a) * 64), { c: "yellow", w: 5, ghost: false }); }
    it.text("busiest days", E.x(860), E.y(960), hand(38, "ink")); }

  // ---------- G: the price chart ($ per MW-day, PJM base residual auctions) ----------
  const BASE = 900, PX = 760 / 560, bx = [330, 820, 1310, 1800], BW = 250;
  const bar = (it, i, v, c = "red") => { const x = bx[i] - BW / 2, h = v * PX; it.rect(G.x(x), G.y(BASE - h), BW, h, { w: 5 }); it.hatch([G.p(x, BASE - h), G.p(x + BW, BASE - h), G.p(x + BW, BASE), G.p(x, BASE)], { c, gap: 12, angle: -0.9, alpha: 0.5 }); };
  { const it = item(T("cheap/for", -0.4), 0.6); it.line(G.x(110), G.y(120), G.x(110), G.y(BASE), { w: 5 }); it.line(G.x(110), G.y(BASE), G.x(1000), G.y(BASE), { w: 5 }); }
  item(T("cheap/twentyfour", 0.05), 0.4).text("2024/25", G.x(bx[0]), G.y(BASE + 70), hand(52, "ink"));
  { const it = item(T("cheap/twentynine", -0.15), 0.4); bar(it, 0, 28.92, "blue"); }
  item(T("cheap/dollars", 0.0), 0.45).text("$28.92", G.x(bx[0]), G.y(BASE - 28.92 * PX - 26), big(76, "blue"));
  { const it = item(T("cheap/per", 0.0), 1.2); it.text("PRICE PAID TO BE READY", G.x(150), G.y(110), big(60, "ink", "left")); it.text("$ per megawatt, per day · PJM", G.x(150), G.y(170), hand(46, "ink", "left")); }
  { const it = item(T("fcst/then", -0.2), 0.9); it.rect(F.x(250), F.y(120), 500, 780, { w: 6 }); it.rect(F.x(410), F.y(90), 180, 60, { w: 5 }); it.text("FORECAST", F.x(500), F.y(250), big(88, "ink")); }
  { const it = item(T("fcst/filled", -0.15), 0.5); it.line(F.x(300), F.y(820), F.x(700), F.y(820), { w: 4 }); it.curve([F.p(300, 800), F.p(450, 760), F.p(580, 600), F.p(690, 330)], { c: "red", w: 7 }); }
  { const it = item(T("fcst/with", -0.1), 1.05, { sfx: false });
    [[330, 740], [430, 700], [520, 620], [600, 530], [660, 430], [470, 520]].forEach(([x, y], i) => { it.rect(F.x(x - 34), F.y(y - 46), 68, 46, { w: 3, ghost: false }); it.dot(F.x(x + 18), F.y(y - 24), 5, { c: "green", blink: { rate: 1.9, phase: i % 3, c: "red" } }); }); }
  item(T("jump/two", -0.2), 0.25, { sfx: false }).line(G.x(1000), G.y(BASE), G.x(2050), G.y(BASE), { w: 5, over: 0 });
  [["two", 1, 269.92, "2025/26"], ["three", 2, 329.17, "2026/27"], ["three#1", 3, 333.44, "2027/28"]].forEach(([w, i, v, y]) => {
    const [word, nth] = w.split("#"), at = `jump/${word}${nth ? "#" + nth : ""}`;
    const it = item(T(at, 0.0), 1.15); bar(it, i, v);
    it.text("$" + v.toFixed(2), G.x(bx[i]), G.y(BASE - v * PX - 30), big(72, "red")); it.text(y, G.x(bx[i]), G.y(BASE + 70), hand(52, "ink"));
  });
  // the cap, and the price PJM's own simulation says it would have been without it
  { const it = item(T("cap/price", -0.25), 0.7); const y = BASE - 333.44 * PX;
    it.line(G.x(1100), G.y(y), G.x(2050), G.y(y), { c: "ink", w: 5, dash: [18, 12] }); it.text("CAP", G.x(1555), G.y(y - 20), big(64, "ink")); }
  { const it = item(T("cap/without", 0.0), 1.3, { sfx: false }); const x = bx[3] - BW / 2, top = BASE - 529.8 * PX;
    it.poly([G.p(x, BASE - 333.44 * PX), G.p(x, top), G.p(x + BW, top), G.p(x + BW, BASE - 333.44 * PX)], { dash: [16, 12], c: "red", w: 5 });
    it.hatch([G.p(x, top), G.p(x + BW, top), G.p(x + BW, BASE - 333.44 * PX), G.p(x, BASE - 333.44 * PX)], { c: "red", gap: 22, angle: 0.8, alpha: 0.22 }); }
  { const it = item(T("cap/been", -0.1), 1.05); const top = BASE - 529.8 * PX;
    it.text("$529.80?", G.x(bx[3]), G.y(top - 24), big(76, "red")); it.text("without the cap", G.x(1650), G.y(top + 60), hand(46, "ink", "right")); it.text("(PJM's simulation)", G.x(1650), G.y(top + 110), hand(40, "ink", "right")); }

  // ---------- H: the market monitor ----------
  item(T("monitor/the", 0.1), 0.95).text("MARKET MONITOR'S ESTIMATE", Hc.x(500), Hc.y(90), hand(60, "ink"));
  { const it = item(T("monitor/estimate", 0.0), 0.7); it.circle(Hc.x(320), Hc.y(400), 200, { w: 9 }); it.line(Hc.x(462), Hc.y(542), Hc.x(600), Hc.y(690), { w: 18 }); }
  item(T("monitor/data", 0.0), 0.45).circle(Hc.x(320), Hc.y(400), 150, { w: 5 });
  { const a0 = -Math.PI / 2, it = item(T("monitor/caused", 0.0), 0.95), w = wedge(Hc.x(320), Hc.y(400), 150, a0, a0 + 0.63 * 6.283);
    it.poly(w, { closed: true, c: "red", w: 5 }); it.hatch(w, { c: "red", gap: 10, angle: -0.7 }); it.text("63%", Hc.x(780), Hc.y(320), big(130, "red")); }
  { const it = item(T("monitor/first", -0.2), 0.75); it.text("data centers", Hc.x(780), Hc.y(390), hand(52, "ink")); it.text("of the 2025/26 jump", Hc.x(780), Hc.y(445), hand(40, "ink")); }
  item(T("monitor/nine", -0.05), 1.3).text("$9.3 BILLION", Hc.x(500), Hc.y(800), big(118, "red"));
  { const it = item(T("monitor/paid", -0.1), 1.2, { sfx: false }); [150, 270, 390, 510, 630, 750, 870].forEach(x => stick(it, Hc.x(x), Hc.y(980), 0.42)); }

  // ---------- I: the bill in Washington, D.C. ----------
  item(T("bill/in", 0.05), 0.75).text("IN WASHINGTON, D.C.", I.x(500), I.y(90), hand(64, "ink"));
  { const it = item(T("bill/home", -0.15), 0.85);
    const zig = []; for (let k = 0; k <= 10; k++) zig.push(I.p(750 - k * 50, 820 + (k % 2 ? 22 : 0)));
    it.poly([I.p(250, 150), I.p(750, 150), ...zig], { closed: true, w: 6 }); it.text("HOME BILL", I.x(500), I.y(240), big(64, "ink")); }
  item(T("bill/twentyone", -0.1), 0.9).text("+$21 a month", I.x(500), I.y(400), big(92, "red"));
  { const it = item(T("bill/about", -0.1), 0.45); it.rect(I.x(300), I.y(500), 400, 90, { w: 5 }); it.line(I.x(500), I.y(490), I.x(500), I.y(600), { w: 4 }); }
  { const it = item(T("bill/half", 0.0), 0.5); it.hatch([I.p(300, 500), I.p(500, 500), I.p(500, 590), I.p(300, 590)], { c: "red", gap: 10, angle: -0.8 }); }
  item(T("bill/half", 0.5), 0.6).text("about $10: the auction", I.x(500), I.y(670), hand(50, "red"));
  item(T("bill/auction", -0.15), 0.5, { sfx: false }).text("consumer counsel's estimate, Pepco, June 2025", I.x(500), I.y(770), hand(30, "grey"));

  // ---------- the callback: from the building you've never seen, to your bill ----------
  { const it = item(T("call/but", -0.05), 1.1);
    it.curve([[1990, 600], [2165, 1100], [2172, 2600], [2172, 3900], [2000, 4330]], { c: "red", w: 16, dash: [34, 22] });
    it.poly([[1955, 4255], [2000, 4330], [2075, 4290]], { c: "red", w: 16 }); }

  SK.done();
  window.CUSTOM = Object.assign(window.CUSTOM || {}, { page: t => SK.frame(t) });
  // a gavel knock on "auction"
  if (SC[0]) SC[0].cues.push({ t: +cue("auction/auction").toFixed(3), type: "thud" });
})();

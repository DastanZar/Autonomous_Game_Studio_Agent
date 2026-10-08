// earth-stops-spinning: one page, drawn while the narrator talks. Layout (world units, page 2200 x 5560):
//   row 0: A the spinning Earth (hook)      B stop: the ground stops, you don't (+ the air)
//   row 1: C the wind, drawn to scale        D the oceans over the coast
//   row 2: E plan B: stop it slowly          F the bulge
//   row 3: G the oceans drain to the poles   H one day = one year (+ the heat)
//   row 4: I Earth really is slowing         J one extra hour = 200 million years
// Coastlines: Natural Earth 1:10m (public domain), data/land.json. Every number is in dossier.json; the
// estimates carry their labels on the page ("simplified model", "BBC Science Focus estimate", "our sum ...").
"use strict";
(() => {
  const L = 60, R = 1140, ROW = [60, 1100, 2140, 3180, 4220];
  const cell = (x0, y0) => ({ x: v => x0 + v, y: v => y0 + v, p: (a, b) => [x0 + a, y0 + b] });
  const A = cell(L, ROW[0]), B = cell(R, ROW[0]), C = cell(L, ROW[1]), D = cell(R, ROW[1]), E = cell(L, ROW[2]), F = cell(R, ROW[2]);
  const G = cell(L, ROW[3]), Hh = cell(R, ROW[3]), I = cell(L, ROW[4]), J = cell(R, ROW[4]);
  const PACE = EP.storyboard.pace || 1;
  const T = (c, d = 0) => cue(c) + d;
  // items run one after another (one hand). Items are queued per page cell; flush(<cue of the next camera move>) lays
  // them out: each starts on its word or just after the previous one, and the whole cell is drawn a little faster if
  // needed so that every drawing is finished (and holds) before the camera leaves.
  let Q = [], last = -1;
  const item = (c, dur, o) => { const rec = [], px = new Proxy({}, { get: (_, k) => (...a) => { rec.push([k, a]); return px; } }); Q.push({ c, dur, o, rec }); return px; };
  const flush = (c, what) => {
    const dl = c === null ? 1e9 : T(c) - 0.45; let k = 1, plan;
    for (; k >= 0.3; k -= 0.05) {
      let t = last; plan = Q.map(q => { const s0 = Math.max(typeof q.c === "number" ? q.c : T(q.c), t + 0.08); t = s0 + q.dur * k * PACE; return s0; });
      if (t <= dl) break;
    }
    if (k < 0.3) { k = 0.3; warn(`page: '${what}' cannot finish before the camera leaves`); }
    Q.forEach((q, i) => { const it = SK.item(plan[i], q.dur * k, q.o); q.rec.forEach(([m, a]) => it[m](...a)); last = plan[i] + q.dur * k * PACE; });
    Q = [];
  };
  const by = flush;
  const big = (size, c, align = "center") => ({ font: "Marker", size, c, align });
  const hand = (size, c, align = "center") => ({ font: "Hand", size, c, align });
  const rot = (cx, cy, a) => ([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  const stick = (it, x, y, s = 1, o = {}) => {        // a generic stick figure, feet at (x, y); o.ang tilts it about the feet
    const r = rot(x, y, o.ang || 0), w = { w: 5 * s + 1 }, L2 = (a, b) => { const p = r(a), q = r(b); it.line(p[0], p[1], q[0], q[1], w); };
    const hc = r([x, y - 205 * s]); it.circle(hc[0], hc[1], 34 * s, w);
    L2([x, y - 171 * s], [x, y - 70 * s]); L2([x, y - 70 * s], [x - 34 * s, y]); L2([x, y - 70 * s], [x + 34 * s, y]);
    const arm = o.arms || [[-42, -95], [42, -95]];
    arm.forEach(([dx, dy]) => L2([x, y - 140 * s], [x + dx * s, y + dy * s]));
  };
  const arcArrow = (it, cx, cy, rx, ry, a0, a1, so = {}) => {   // an elliptical arc with a head at a1
    it.arc(cx, cy, rx, a0, a1, Object.assign({ ry }, so));
    const P2 = a => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry], e = P2(a1), b = P2(a1 - Math.sign(a1 - a0) * 0.08), an = Math.atan2(e[1] - b[1], e[0] - b[0]), h = so.head || 30;
    it.poly([[e[0] + Math.cos(an + 2.6) * h, e[1] + Math.sin(an + 2.6) * h], e, [e[0] + Math.cos(an - 2.6) * h, e[1] + Math.sin(an - 2.6) * h]], Object.assign({}, so, { over: 0, dash: null }));
  };
  const sun = (it, x, y, r, c = "yellow") => { it.circle(x, y, r, { c, w: 6 }); for (let k = 0; k < 8; k++) { const a = k * 0.785 + 0.2; it.line(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14), x + Math.cos(a) * (r + 34), y + Math.sin(a) * (r + 34), { c, w: 5, ghost: false }); } };
  const snail = (it, x, y, s = 1) => {               // a snail, facing right, foot on y
    const pts = []; for (let k = 0; k <= 60; k++) { const a = k / 60 * 4.4 * Math.PI, rr = 70 * s * (1 - k / 66); pts.push([x + Math.cos(a + Math.PI) * rr, y - 75 * s + Math.sin(a + Math.PI) * rr]); }
    it.curve([[x - 95 * s, y], [x + 40 * s, y + 2], [x + 120 * s, y - 6], [x + 150 * s, y - 40 * s], [x + 120 * s, y - 50 * s], [x + 70 * s, y - 20 * s]], { w: 5 });
    it.poly(pts, { w: 5, over: 0 });
    it.line(x + 135 * s, y - 42 * s, x + 150 * s, y - 95 * s, { w: 4 }); it.line(x + 120 * s, y - 45 * s, x + 118 * s, y - 92 * s, { w: 4 });
    it.dot(x + 150 * s, y - 98 * s, 6 * s + 2); it.dot(x + 118 * s, y - 95 * s, 6 * s + 2);
  };

  // ---------- the globe: real coastlines (Natural Earth), orthographic projection ----------
  const LAND = JSON.parse(EP.data["data/land.json"]).rings, D2R = Math.PI / 180;
  const ortho = (cx, cy, r, lon0, lat0) => ([lo, la]) => {
    const l = (lo - lon0) * D2R, p = la * D2R, p0 = lat0 * D2R;
    const cc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
    return { v: cc >= 0, x: cx + r * Math.cos(p) * Math.sin(l), y: cy - r * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) };
  };
  const coast = (it, pr, minPts = 4, so = {}) => {
    LAND.forEach(ring => {
      let run = [];
      const flush = () => { if (run.length >= minPts) it.poly(run, Object.assign({ w: 3.5, amp: 0.6, over: 0, ghost: false }, so)); run = []; };
      ring.forEach(q => { const s = pr(q); if (s.v) run.push([s.x, s.y]); else flush(); });
      flush();
    });
  };
  const latLine = (pr, lat, lon0) => { const pts = []; for (let lo = lon0 - 90; lo <= lon0 + 90; lo += 4) { const s = pr([lo, lat]); if (s.v) pts.push([s.x, s.y]); } return pts; };

  // ---------- A: the spinning Earth (hook) ----------
  const GA = { cx: A.x(500), cy: A.y(500), r: 290, lon0: -25, lat0: 18 }, prA = ortho(GA.cx, GA.cy, GA.r, GA.lon0, GA.lat0);
  item("hook/at", 0.6).text("THE GROUND AT THE EQUATOR", A.x(500), A.y(105), hand(58, "ink"));
  { const it = item("hook/equator", 0.55); it.circle(GA.cx, GA.cy, GA.r, { w: 6 }); }
  { const it = item("hook/the#1", 1.0, { sfx: false }); coast(it, prA); }
  { const it = item("hook/moves", 0.55); it.poly(latLine(prA, 0, GA.lon0), { c: "red", w: 5, dash: [14, 10] });
    const e = prA([GA.lon0, 0]); stick(it, e.x, e.y, 0.32); it.text("you", e.x + 30, e.y - 26, hand(40, "ink", "left")); }
  { const it = item("hook/sixteen", 0.45); arcArrow(it, GA.cx, GA.cy + 60, GA.r + 50, 95, 2.55, 0.6, { c: "red", w: 7 }); }
  item("hook/hundred", 0.75).text("1,670 km/h", A.x(500), A.y(905), big(118, "red"));
  item("hook/an", 0.55, { sfx: false }).text("40,075 km around / 23.93 h per spin  (NASA Earth fact sheet)", A.x(500), A.y(975), hand(30, "grey"));
  by("stop.start-0.2", "hook");

  // ---------- B: stop. The ground stops; you don't (and the air) ----------
  item("stop/now", 0.55).text("NOW STOP THE EARTH.", B.x(500), B.y(105), hand(62, "ink"));
  item("stop/instantly", 0.45).text("INSTANTLY.", B.x(500), B.y(205), big(96, "red"));
  { const it = item("stop/ground", 0.6); it.line(B.x(30), B.y(770), B.x(990), B.y(770), { w: 6 });
    for (let k = 0; k < 14; k++) it.line(B.x(60 + k * 68), B.y(770), B.x(40 + k * 68), B.y(800), { w: 3, ghost: false });
    it.text("ground: 0 km/h", B.x(60), B.y(865), hand(46, "ink", "left")); }
  { const it = item("stop/you", 0.7); stick(it, B.x(560), B.y(560), 0.85, { ang: 1.25, arms: [[-60, -170], [50, -175]] });
    [[330, 455], [290, 515], [345, 575]].forEach(([x, y]) => it.line(B.x(x), B.y(y), B.x(x - 170), B.y(y), { w: 4, ghost: false })); }
  item("stop/don't", 0.5).text("you: still 1,670 km/h", B.x(60), B.y(930), hand(46, "red", "left"));
  { const it = item("east/east", 0.45); it.arrow(B.x(600), B.y(300), B.x(860), B.y(300), { c: "red", w: 8, head: 30 }); it.text("EAST", B.x(470), B.y(318), big(60, "red")); }
  { const it = item("east/so", 0.9);
    [[400, 0], [520, 90], [440, 180]].forEach(([y, dx], i) => { it.curve([B.p(70 + dx, y + 30), B.p(160 + dx, y - 10), B.p(250 + dx, y + 30), B.p(330 + dx, y - 5)], { c: "blue", w: 5 });
      it.line(B.x(330 + dx), B.y(y - 5), B.x(305 + dx), B.y(y - 25), { c: "blue", w: 5 }); it.line(B.x(330 + dx), B.y(y - 5), B.x(308 + dx), B.y(y + 17), { c: "blue", w: 5 }); }); }
  item("east/air", 0.45).text("the air, too", B.x(200), B.y(700), hand(46, "blue"));
  by("wind.start-0.2", "stop/east");

  // ---------- C: the wind, drawn to scale ----------
  item("wind/that's", 0.6).text("WIND SPEED (to scale)", C.x(500), C.y(105), hand(60, "ink"));
  const KW = 860 / 1670;
  { const it = item("wind/wind", 0.8); it.line(C.x(70), C.y(200), C.x(70), C.y(760), { w: 5 }); it.rect(C.x(70), C.y(240), 1670 * KW, 140, { w: 5 }); it.hatch([C.p(70, 240), C.p(70 + 1670 * KW, 240), C.p(70 + 1670 * KW, 380), C.p(70, 380)], { c: "red", gap: 12, alpha: 0.5, k: 0.5 });
    it.text("1,670 km/h", C.x(500), C.y(335), big(76, "ink")); }
  item("wind/four", 0.45, { sfx: false }).text("after the stop, at the equator", C.x(80), C.y(435), hand(40, "ink", "left"));
  { const it = item("wind/strongest", 0.6); it.rect(C.x(70), C.y(520), 408 * KW, 120, { w: 5 }); it.hatch([C.p(70, 520), C.p(70 + 408 * KW, 520), C.p(70 + 408 * KW, 640), C.p(70, 640)], { c: "blue", gap: 12, alpha: 0.5 });
    it.text("408 km/h", C.x(100 + 408 * KW), C.y(605), big(64, "blue", "left")); }
  item("wind/gust", 0.45).text("strongest gust ever recorded", C.x(80), C.y(690), hand(40, "ink", "left"));
  item("wind/recorded", 0.45).text("about 4x", C.x(500), C.y(860), big(110, "red"));
  item("wind/recorded", 0.3, { sfx: false }).text("1,670 / 408 = 4.1   (IFLScience; Astronomy magazine)", C.x(500), C.y(940), hand(30, "grey"));
  by("sea.start-0.2", "wind");

  // ---------- D: the oceans keep going ----------
  item("sea/the", 0.5).text("THE OCEANS TOO", D.x(500), D.y(105), hand(62, "ink"));
  { const it = item("sea/keep", 0.8);
    it.curve([D.p(30, 720), D.p(200, 690), D.p(330, 610), D.p(420, 470), D.p(500, 380), D.p(600, 360), D.p(660, 420), D.p(620, 470), D.p(570, 450)], { c: "blue", w: 7 });
    it.hatch([D.p(30, 720), D.p(200, 690), D.p(330, 610), D.p(420, 470), D.p(500, 380), D.p(600, 360), D.p(640, 450), D.p(600, 760), D.p(30, 760)], { c: "blue", gap: 14, angle: -0.5, alpha: 0.4 }); }
  { const it = item("sea/too", 0.6); it.arrow(D.x(130), D.y(300), D.x(380), D.y(300), { c: "blue", w: 7, head: 28 }); it.text("1,670 km/h", D.x(250), D.y(260), hand(44, "blue")); }
  { const it = item("sea/straight", 0.95); it.line(D.x(560), D.y(760), D.x(990), D.y(760), { w: 5 });
    [[700, 0], [850, 1]].forEach(([x, k]) => { it.rect(D.x(x), D.y(640 - k * 30), 100, 120 + k * 30, { w: 4 }); it.poly([D.p(x - 15, 640 - k * 30), D.p(x + 50, 580 - k * 30), D.p(x + 115, 640 - k * 30)], { w: 4 }); }); }
  item("sea/coasts", 0.5).text("the coast", D.x(780), D.y(830), hand(46, "ink"));
  by("slow.start-0.2", "sea");

  // ---------- E: plan B, slowly ----------
  item("slow/fine", 0.4).text("FINE.", E.x(500), E.y(150), big(100, "ink"));
  item("slow/let's", 0.55).text("PLAN B: SLOWLY", E.x(500), E.y(290), big(96, "red"));
  { const it = item("slow/over", 0.8); [0, 1, 2].forEach(k => { const x = 150 + k * 250; it.rect(E.x(x), E.y(400), 190, 210, { w: 5 }); it.line(E.x(x), E.y(455), E.x(x + 190), E.y(455), { w: 4, ghost: false }); it.text(["YEAR 1", "YEAR 2", "YEAR 3"][k], E.x(x + 95), E.y(560), hand(44, "ink")); }); }
  { const it = item("slow/years", 0.9); snail(it, E.x(380), E.y(860), 1.1); it.text("(slowly)", E.x(700), E.y(830), hand(46, "grey")); }
  by("bulge.start-0.2", "slow");

  // ---------- F: the bulge ----------
  item("bulge/spinning", 0.6).text("SPINNING MAKES EARTH BULGE", F.x(500), F.y(105), hand(58, "ink"));
  { const it = item("bulge/makes", 0.6); it.circle(F.x(480), F.y(520), 330, { ry: 290, w: 6 }); it.line(F.x(480), F.y(190), F.x(480), F.y(850), { w: 3, dash: [12, 10], ghost: false }); }
  { const it = item("bulge/bulge", 0.5); it.circle(F.x(480), F.y(520), 300, { w: 4, dash: [10, 12], c: "grey" }); }
  { const it = item("bulge/poles", 0.6); it.arrow(F.x(560), F.y(220), F.x(560), F.y(238), { c: "red", w: 5, head: 16 }); it.line(F.x(470), F.y(220), F.x(650), F.y(220), { c: "red", w: 3, ghost: false }); it.text("pole", F.x(370), F.y(205), hand(40, "ink")); }
  item("bulge/twentyone", 0.6).text("21 km closer", F.x(700), F.y(200), big(60, "red", "left"));
  item("bulge/centre", 0.5).text("to the centre", F.x(700), F.y(255), hand(42, "red", "left"));
  { const it = item("bulge/equator", 0.55); it.arrow(F.x(480), F.y(520), F.x(800), F.y(520), { w: 4, head: 20 }); it.text("equator", F.x(640), F.y(500), hand(40, "ink")); }
  item("bulge.end", 0.5, { sfx: false }).text("bulge exaggerated: really 21 km out of 6,378 (NASA)", F.x(480), F.y(940), hand(32, "grey"));
  by("drain.start-0.2", "bulge");

  // ---------- G: without the spin, the oceans slide to the poles ----------
  const GG = { cx: G.x(510), cy: G.y(520), r: 330, lon0: -8, lat0: 20 }, prG = ortho(GG.cx, GG.cy, GG.r, GG.lon0, GG.lat0);
  item("drain/without", 0.55).text("NO SPIN:", G.x(510), G.y(105), hand(62, "ink"));
  { const it = item("drain/spin", 0.9, { sfx: false }); it.circle(GG.cx, GG.cy, GG.r, { w: 6 }); coast(it, prG, 4, { w: 3 }); }
  const cap = (lat, dir) => {      // the part of the disc beyond a latitude line: the line, then the limb arc on the pole's side
    const pts = latLine(prG, lat, GG.lon0), n = 40;
    const a0 = Math.atan2(pts[pts.length - 1][1] - GG.cy, pts[pts.length - 1][0] - GG.cx), a1 = Math.atan2(pts[0][1] - GG.cy, pts[0][0] - GG.cx);
    const arc = da => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + da * k / n; o.push([GG.cx + Math.cos(a) * GG.r, GG.cy + Math.sin(a) * GG.r]); } return o; };
    let d1 = a1 - a0; while (d1 <= 0) d1 += 2 * Math.PI; const d2 = d1 - 2 * Math.PI;
    const A1 = arc(d1), A2 = arc(d2), mid = o => o[n >> 1][1];
    return pts.concat(dir < 0 ? (mid(A1) < mid(A2) ? A1 : A2) : (mid(A1) > mid(A2) ? A1 : A2)); };
  { const it = item("drain/poles", 0.9); const n = cap(44, -1), s = cap(-44, 1);
    it.poly(latLine(prG, 44, GG.lon0), { c: "blue", w: 5 }); it.hatch(n, { c: "blue", gap: 13, angle: -0.4, alpha: 0.5, k: 0.5 });
    it.poly(latLine(prG, -44, GG.lon0), { c: "blue", w: 5 }); it.hatch(s, { c: "blue", gap: 13, angle: -0.4, alpha: 0.5, k: 0.5 }); }
  item("drain/two", 0.5).text("polar ocean", G.x(150), G.y(215), hand(44, "blue"));
  item("drain/one", 0.6).text("one belt of land", G.x(510), G.y(935), big(64, "ink"));
  item("drain/middle", 0.4, { sfx: false }).text("simplified model (BBC Science Focus; Esri via IFLScience)", G.x(510), G.y(990), hand(28, "grey"));
  { const it = item("spain/everything", 0.6); const sp = prG([-4, 40.3]); it.circle(sp.x, sp.y, 26, { c: "red", w: 5 }); it.line(sp.x + 20, sp.y - 18, G.x(760), G.y(235), { c: "red", w: 4 }); }
  item("spain/spain", 0.6).text("north of Spain:", G.x(800), G.y(150), hand(42, "red"));
  item("spain/underwater", 0.55).text("UNDERWATER", G.x(800), G.y(215), big(56, "red"));
  by("day.start-0.2", "drain/spain");

  // ---------- H: one day = one year (and the heat) ----------
  item("day/one", 0.7).text("1 DAY = 1 YEAR", Hh.x(500), Hh.y(130), big(100, "ink"));
  { const it = item("day/year", 0.8); sun(it, Hh.x(200), Hh.y(400), 70); it.circle(Hh.x(500), Hh.y(400), 360, { ry: 130, w: 4, dash: [12, 12], c: "grey" }); }
  { const it = item("day/six", 0.75); const ex = Hh.x(820), ey = Hh.y(430), r = 62; it.circle(ex, ey, r, { w: 5 });
    const half = (s) => { const p = []; for (let k = 0; k <= 16; k++) { const a = Math.PI / 2 + s * k / 16 * Math.PI; p.push([ex + Math.cos(a) * r, ey + Math.sin(a) * r]); } return p; };
    it.hatch(half(1), { c: "yellow", gap: 8, alpha: 0.8 }); it.hatch(half(-1), { c: "blue", gap: 8, alpha: 0.6 });
    it.text("6 months of daylight", Hh.x(80), Hh.y(660), hand(52, "ink", "left")); }
  item("day/then", 0.6).text("then 6 months of night", Hh.x(80), Hh.y(730), hand(52, "blue", "left"));
  item("day.end", 0.4, { sfx: false }).text("one orbit = 365 days (NASA)", Hh.x(80), Hh.y(790), hand(32, "grey", "left"));
  { const it = item("heat/long", 0.9); const x = 830, y0 = 560, y1 = 860;
    it.line(Hh.x(x - 18), Hh.y(y0), Hh.x(x - 18), Hh.y(y1), { w: 5 }); it.line(Hh.x(x + 18), Hh.y(y0), Hh.x(x + 18), Hh.y(y1), { w: 5 }); it.arc(Hh.x(x), Hh.y(y0), 18, Math.PI, 2 * Math.PI, { w: 5 });
    it.circle(Hh.x(x), Hh.y(y1 + 28), 36, { w: 5 }); it.hatch([Hh.p(x - 10, 600), Hh.p(x + 10, 600), Hh.p(x + 10, y1 + 40), Hh.p(x - 10, y1 + 40)], { c: "red", gap: 6, alpha: 0.9, angle: -1.2 }); }
  item("heat/hundred", 0.6).text("past 100°C", Hh.x(80), Hh.y(890), big(76, "red", "left"));
  item("heat/degrees", 0.4, { sfx: false }).text("BBC Science Focus estimate", Hh.x(80), Hh.y(945), hand(32, "grey", "left"));
  by("real.start-0.2", "day/heat");

  // ---------- I: Earth really is slowing down ----------
  item("real/here's", 0.6).text("THE REAL PART:", I.x(500), I.y(105), hand(62, "ink"));
  item("real/earth", 0.75).text("EARTH IS SLOWING", I.x(500), I.y(220), big(100, "red"));
  { const it = item("real/every", 0.8); const cx = I.x(250), cy = I.y(480), r = 150; it.circle(cx, cy, r, { w: 6 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; it.line(cx + Math.cos(a) * (r - 22), cy + Math.sin(a) * (r - 22), cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6), { w: 4, ghost: false }); }
    it.line(cx, cy, cx, cy - 105, { w: 6 }); it.line(cx, cy, cx + 75, cy + 30, { w: 6 }); }
  item("real/day", 0.5).text("each century, a day gets", I.x(680), I.y(420), hand(44, "ink"));
  item("real/one", 0.8).text("+1.8 ms", I.x(680), I.y(530), big(110, "red"));
  item("real/second", 0.5).text("(thousandths of a second) longer", I.x(680), I.y(600), hand(38, "ink"));
  { const it = item("real/longer", 0.5, { sfx: false }); it.text("from ancient eclipse records, 720 BC to AD 2015", I.x(500), I.y(800), hand(36, "ink")); it.text("Stephenson, Morrison & Hohenkerk, Proc. R. Soc. A, 2016", I.x(500), I.y(860), hand(30, "grey")); }
  by("hour.start-0.2", "real");

  // ---------- J: one extra hour ----------
  item("hour/at", 0.5).text("TO ADD ONE HOUR:", J.x(500), J.y(105), hand(60, "ink"));
  item("hour/two", 0.9).text("200 MILLION", J.x(500), J.y(250), big(116, "red"));
  item("hour/years", 0.4).text("YEARS", J.x(500), J.y(360), big(100, "red"));
  { const it = item("hour/add", 0.8, { sfx: false }); it.text("3,600 s / 0.0018 s per century", J.x(500), J.y(470), hand(46, "ink")); it.text("= 2,000,000 centuries", J.x(500), J.y(535), hand(46, "ink")); }
  item("hour/hour", 0.35, { sfx: false }).text("our sum, at today's average rate", J.x(500), J.y(600), hand(36, "grey"));
  by("call.start-0.2", "hour");

  // ---------- the callback: Earth isn't stopping, just taking its time ----------
  { const it = item("call/earth", 1.0); arcArrow(it, GA.cx, GA.cy, GA.r + 70, GA.r + 70, -0.55, -2.6, { c: "red", w: 9, head: 40 }); }
  { const it = item("call/relax", 0.8); snail(it, J.x(330), J.y(860), 0.9); }
  item("call/taking", 0.8).text("still spinning", J.x(740), J.y(800), big(60, "red"));

  flush(null, "callback");
  SK.done();
  window.CUSTOM = Object.assign(window.CUSTOM || {}, { page: t => SK.frame(t) });
})();

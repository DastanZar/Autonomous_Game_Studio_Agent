// quicksand: one page, drawn while the narrator talks. Six rows (the page is made taller for this episode):
//   row 0: A films vs physics (hook)        B the recipe, and at rest
//   row 1: C step on it: liquid; you sink    D twice as dense as you
//   row 2: E so you float (waist)           F the lab test (Khaldoun et al., Nature 2005)
//   row 3: G stuck: the sand packs tight     H the force of lifting a car
//   row 4: I don't let friends pull          J wiggle, lie back, float free
//   row 5: K the real risk: the tide         L callback: it just holds on
// Every number is in dossier.json; the estimate carries its label ("the researchers' estimate").
"use strict";
(() => {
  SK.page.h = 6640;                                    // six rows instead of the kit's five
  const L = 60, R = 1140, ROW = [60, 1100, 2140, 3180, 4220, 5260];
  const cell = (x0, y0) => ({ x: v => x0 + v, y: v => y0 + v, p: (a, b) => [x0 + a, y0 + b] });
  const [A, B, C, D, E, F, G, Hc, I, J, K, Lc] = ROW.flatMap(y => [cell(L, y), cell(R, y)]);
  const PACE = EP.storyboard.pace || 1;
  const T = (c, d = 0) => cue(c) + d;
  // items are queued per page cell; flush(<cue of the next camera move>) lays them out one after another (one hand),
  // each on its word or just after the previous one, drawing a little faster if needed so the cell is finished and
  // holds before the camera leaves.
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
  const big = (size, c, align = "center") => ({ font: "Marker", size, c, align });
  const hand = (size, c, align = "center") => ({ font: "Hand", size, c, align });
  // a generic stick figure, feet at (x, y). o.cut: draw only what is above this y (the rest is under the sand)
  const stick = (it, x, y, s = 1, o = {}) => {
    const w = { w: 5 * s + 1 }, cut = o.cut ?? 1e9;
    const seg = (x1, y1, x2, y2) => { if (y1 > cut && y2 > cut) return; if (y2 > cut) { const k = (cut - y1) / (y2 - y1); x2 = x1 + (x2 - x1) * k; y2 = cut; } if (y1 > cut) { const k = (cut - y2) / (y1 - y2); x1 = x2 + (x1 - x2) * k; y1 = cut; } it.line(x1, y1, x2, y2, w); };
    it.circle(x, y - 205 * s, 34 * s, w);
    seg(x, y - 171 * s, x, y - 70 * s); seg(x, y - 70 * s, x - 34 * s, y); seg(x, y - 70 * s, x + 34 * s, y);
    (o.arms || [[-42, -95], [42, -95]]).forEach(([dx, dy]) => seg(x, y - 140 * s, x + dx * s, y + dy * s));
    if (o.cut !== undefined) [-1, 1].forEach(d => it.curve([[x + d * 75 * s, cut + 5], [x + d * 38 * s, cut - 14 * s], [x + d * 10 * s, cut - 4]], { w: 4, ghost: false }));   // sand heaped round the body
  };
  const sand = (it, x0, x1, y, depth, seed = 1) => {      // a sand pit: wavy surface, yellow pencil, a few grains
    const top = []; for (let x = x0; x <= x1; x += 40) top.push([x, y + Math.sin(x / 37 + seed) * 6]);
    it.curve(top, { w: 5 });
    it.hatch([...top, [x1, y + depth], [x0, y + depth]], { c: "yellow", gap: 11, angle: -0.5, alpha: 0.55, k: 0.5 });
    for (let k = 0; k < 9; k++) it.dot(x0 + 40 + rnd(k, seed, 61) * (x1 - x0 - 80), y + 25 + rnd(k, seed, 62) * (depth - 40), 4, { c: "grey" });
  };
  const handUp = (it, x, y, s = 1) => {                   // a stick hand reaching out of the sand at (x, y)
    it.line(x, y, x + 6 * s, y - 120 * s, { w: 6 }); it.circle(x + 7 * s, y - 140 * s, 20 * s, { w: 5 });
    [-0.9, -0.3, 0.3, 0.9].forEach(a => it.line(x + 7 * s + Math.sin(a) * 20 * s, y - 140 * s - Math.cos(a) * 20 * s, x + 7 * s + Math.sin(a) * 42 * s, y - 140 * s - Math.cos(a) * 42 * s, { w: 4, ghost: false }));
  };

  // ---------- A: films vs physics (hook) ----------
  item("hook/in", 0.45).text("IN FILMS:", A.x(250), A.y(140), big(76, "ink"));
  { const it = item("hook/quicksand", 0.9); sand(it, A.x(40), A.x(470), A.y(640), 300, 1); }
  { const it = item("hook/swallows", 0.6); handUp(it, A.x(250), A.y(640), 1.2); it.text("help", A.x(330), A.y(430), hand(44, "ink", "left")); }
  item("hook/whole", 0.4).text("swallowed whole", A.x(255), A.y(1000), hand(44, "ink"));
  { const it = item("hook/physics", 0.4); it.line(A.x(510), A.y(90), A.x(510), A.y(960), { w: 3, dash: [12, 12], c: "grey" }); it.text("PHYSICS:", A.x(770), A.y(140), big(76, "red")); }
  { const it = item("hook/says", 0.9); sand(it, A.x(550), A.x(990), A.y(640), 300, 2); stick(it, A.x(770), A.y(745), 1.15, { cut: A.y(640), arms: [[-80, -190], [80, -190]] }); }
  { const it = item("hook/waist", 0.55); it.arrow(A.x(950), A.y(560), A.x(860), A.y(625), { c: "red", w: 6, head: 22 }); it.text("waist", A.x(940), A.y(530), hand(46, "red")); }
  item("hook/waist", 0.45).text("you stop here", A.x(775), A.y(1000), hand(44, "red"));
  flush("mix.start-0.2", "hook");

  // ---------- B: the recipe ----------
  item("mix/quicksand", 0.5).text("QUICKSAND =", B.x(500), B.y(140), big(90, "ink"));
  { const it = item("mix/fine", 0.6); it.poly([B.p(90, 470), B.p(170, 330), B.p(250, 470)], { closed: true, w: 5 }); it.hatch([B.p(90, 470), B.p(170, 330), B.p(250, 470)], { c: "yellow", gap: 9, alpha: 0.7 }); it.text("fine sand", B.x(170), B.y(540), hand(44, "ink")); }
  { const it = item("mix/clay", 0.55); it.text("+", B.x(300), B.y(420), big(80, "ink")); it.curve([B.p(370, 470), B.p(360, 400), B.p(430, 370), B.p(500, 400), B.p(490, 470), B.p(370, 470)], { w: 5 });
    it.hatch([B.p(370, 470), B.p(362, 400), B.p(430, 372), B.p(498, 400), B.p(490, 470)], { c: "red", gap: 10, alpha: 0.4 }); it.text("clay", B.x(430), B.y(540), hand(44, "ink")); }
  { const it = item("mix/salt", 0.6); it.text("+", B.x(560), B.y(420), big(80, "ink")); it.rect(B.x(630), B.y(320), 150, 160, { w: 5 });
    [380, 420].forEach(y => it.curve([B.p(640, y), B.p(675, y - 12), B.p(710, y), B.p(745, y - 12), B.p(772, y)], { c: "blue", w: 4 })); it.text("salt water", B.x(705), B.y(540), hand(44, "ink")); }
  item("mix/leave", 0.45).text("LEFT ALONE:", B.x(500), B.y(680), hand(54, "ink"));
  { const it = item("mix/slowly", 0.9); for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) it.circle(B.x(250 + c * 82 + (r % 2) * 41), B.y(890 - r * 62), 26, { w: 3, ghost: false }); }
  item("mix/thickens", 0.45).text("it slowly thickens", B.x(500), B.y(985), hand(44, "ink"));
  flush("step.start-0.2", "mix");

  // ---------- C: step on it; you sink ----------
  item("step/step", 0.5).text("STEP ON IT:", C.x(260), C.y(140), big(76, "ink"));
  { const it = item("step/on", 0.8); sand(it, C.x(40), C.x(480), C.y(560), 230, 3);
    it.poly([C.p(190, 380), C.p(190, 520), C.p(290, 520), C.p(300, 490), C.p(240, 470), C.p(240, 380)], { w: 5 }); it.arrow(C.x(330), C.y(330), C.x(330), C.y(470), { c: "red", w: 6, head: 22 }); }
  { const it = item("step/liquid", 0.6); [610, 650, 690].forEach((y, i) => it.curve([C.p(80, y), C.p(150, y - 14), C.p(220, y), C.p(290, y - 14), C.p(360, y), C.p(430, y - 14)], { c: "blue", w: 4 })); it.text("turns liquid", C.x(260), C.y(860), hand(46, "blue")); }
  { const it = item("step/harder", 0.7); it.line(C.x(560), C.y(200), C.x(560), C.y(560), { w: 5 }); it.line(C.x(560), C.y(560), C.x(960), C.y(560), { w: 5 });
    it.text("push", C.x(760), C.y(615), hand(42, "ink")); it.text("runny", C.x(545), C.y(185), hand(42, "ink", "left")); }
  item("step/runnier", 0.5).curve([C.p(570, 545), C.p(700, 500), C.p(820, 380), C.p(930, 220)], { c: "red", w: 7 });
  flush("sink.start-0.2", "step");
  { const it = item("sink/so", 0.6); stick(it, C.x(760), C.y(1010), 0.8, { cut: C.y(880) }); it.line(C.x(600), C.y(880), C.x(930), C.y(880), { w: 4 }); it.arrow(C.x(900), C.y(700), C.x(900), C.y(820), { c: "red", w: 6, head: 20 }); }
  { const it = item("sink/thrashing", 0.6); [[690, 790], [830, 790], [700, 740], [820, 740]].forEach(([x, y], i) => it.arc(C.x(x), C.y(y), 22, i % 2 ? -0.4 : 2.7, i % 2 ? 1.2 : 4.3, { w: 3, ghost: false })); }
  item("sink/faster", 0.45).text("thrashing: faster", C.x(560), C.y(980), hand(42, "red", "left"));
  flush("dense.start-0.2", "sink");

  // ---------- D: twice as dense as you ----------
  item("dense/but", 0.45).text("THE CATCH:", D.x(500), D.y(140), big(80, "ink"));
  { const it = item("dense/catch", 0.7); it.line(D.x(500), D.y(300), D.x(500), D.y(760), { w: 6 }); it.line(D.x(400), D.y(760), D.x(600), D.y(760), { w: 6 });
    it.line(D.x(160), D.y(380), D.x(840), D.y(300), { w: 6 }); it.line(D.x(160), D.y(380), D.x(160), D.y(470), { w: 3 }); it.line(D.x(840), D.y(300), D.x(840), D.y(390), { w: 3 }); }
  { const it = item("dense/quicksand", 0.7); it.rect(D.x(80), D.y(470), 160, 150, { w: 5 }); it.hatch([D.p(80, 470), D.p(240, 470), D.p(240, 620), D.p(80, 620)], { c: "yellow", gap: 9, alpha: 0.7 });
    it.text("1 mL of quicksand", D.x(160), D.y(680), hand(38, "ink")); it.text("2 g", D.x(160), D.y(560), big(64, "ink")); }
  { const it = item("dense/twice", 0.7); it.rect(D.x(780), D.y(390), 120, 110, { w: 5 }); it.text("1 g", D.x(840), D.y(465), big(56, "ink")); it.text("1 mL of you", D.x(840), D.y(560), hand(38, "ink")); }
  item("dense/dense", 0.6).text("2x AS DENSE", D.x(500), D.y(900), big(100, "red"));
  item("dense/are", 0.35, { sfx: false }).text("National Geographic; Live Science", D.x(500), D.y(970), hand(30, "grey"));
  flush("float.start-0.2", "dense");

  // ---------- E: so you float ----------
  item("float/so", 0.45).text("SO YOU FLOAT", E.x(500), E.y(140), big(90, "ink"));
  { const it = item("float/sink", 0.9); sand(it, E.x(60), E.x(940), E.y(560), 380, 4); stick(it, E.x(500), E.y(715), 1.5, { cut: E.y(560), arms: [[-95, -150], [95, -150]] }); }
  { const it = item("float/waist", 0.5); it.line(E.x(330), E.y(560), E.x(670), E.y(560), { c: "red", w: 7 }); it.text("about waist deep", E.x(500), E.y(680), hand(48, "red")); }
  item("float/stop", 0.45).text("then you stop", E.x(500), E.y(1000), big(64, "red"));
  flush("lab.start-0.2", "float");

  // ---------- F: the lab test ----------
  item("lab/in", 0.45).text("IN THE LAB:", F.x(500), F.y(140), big(80, "ink"));
  { const it = item("lab/ball", 0.8); it.line(F.x(300), F.y(300), F.x(300), F.y(720), { w: 6 }); it.line(F.x(700), F.y(300), F.x(700), F.y(720), { w: 6 }); it.line(F.x(300), F.y(720), F.x(700), F.y(720), { w: 6 });
    it.line(F.x(305), F.y(430), F.x(695), F.y(430), { w: 4 }); it.hatch([F.p(305, 430), F.p(695, 430), F.p(695, 715), F.p(305, 715)], { c: "yellow", gap: 11, alpha: 0.55, k: 0.5 });
    it.circle(F.x(500), F.y(400), 32, { w: 5 }); it.hatch([F.p(470, 390), F.p(530, 390), F.p(530, 425), F.p(470, 425)], { c: "red", gap: 7, alpha: 0.5 }); }
  item("lab/person", 0.5).text("ball as dense as a person", F.x(500), F.y(260), hand(44, "ink"));
  { const it = item("lab/however", 0.7); [[250, 430], [230, 520], [250, 610], [750, 430], [770, 520], [750, 610]].forEach(([x, y]) => it.line(F.x(x), F.y(y), F.x(x + (x < 500 ? -60 : 60)), F.y(y), { w: 4, ghost: false })); it.text("shake!", F.x(500), F.y(800), big(64, "ink")); }
  item("lab/it", 0.45).text("it never sank", F.x(500), F.y(890), hand(48, "red"));
  item("lab/it", 0.35, { sfx: false }).text("Khaldoun, Eiser, Wegdam & Bonn, Nature, 2005", F.x(500), F.y(960), hand(30, "grey"));
  flush("stuck.start-0.2", "lab");

  // ---------- G: stuck ----------
  item("stuck/getting", 0.5).text("GETTING OUT:", G.x(500), G.y(140), big(80, "ink"));
  { const it = item("stuck/around", 0.8); it.line(G.x(80), G.y(300), G.x(940), G.y(300), { w: 5 });
    [[400, 1], [600, -1]].forEach(([x, d]) => { it.line(G.x(x), G.y(240), G.x(x + d * 20), G.y(800), { w: 8 }); it.poly([G.p(x + d * 20, 800), G.p(x + d * 20 + d * 70, 810)], { w: 8 }); }); }
  { const it = item("stuck/sand", 0.9); for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { const x = (c < 2 ? 280 : 650) + (c % 2) * 52 + (r % 2) * 22, y = 360 + r * 62; it.circle(G.x(x), G.y(y), 22, { w: 3, ghost: false }); } }
  item("stuck/tight", 0.5).text("packed tight", G.x(500), G.y(920), big(76, "red"));
  flush("car.start-0.2", "stuck");

  // ---------- H: the force of lifting a car ----------
  item("car/researchers'", 0.6).text("THE RESEARCHERS' ESTIMATE:", Hc.x(500), Hc.y(140), hand(54, "ink"));
  { const it = item("car/pulling", 0.6); it.line(Hc.x(140), Hc.y(470), Hc.x(140), Hc.y(320), { w: 8 }); it.line(Hc.x(140), Hc.y(320), Hc.x(220), Hc.y(320), { w: 8 }); it.arrow(Hc.x(90), Hc.y(450), Hc.x(90), Hc.y(310), { c: "red", w: 5, head: 18 }); sand(it, Hc.x(40), Hc.x(300), Hc.y(470), 120, 5); }
  item("car/centimetre", 0.6).text("1 foot, at 1 cm/s", Hc.x(170), Hc.y(660), hand(42, "ink"));
  { const it = item("car/force", 0.6); it.text("=", Hc.x(360), Hc.y(420), big(110, "ink")); }
  { const it = item("car/lift", 1.0); const x = 470, y = 520;
    it.poly([Hc.p(x, y), Hc.p(x, y - 80), Hc.p(x + 90, y - 85), Hc.p(x + 150, y - 160), Hc.p(x + 330, y - 160), Hc.p(x + 390, y - 85), Hc.p(x + 460, y - 75), Hc.p(x + 460, y), Hc.p(x, y)], { w: 6 });
    it.circle(Hc.x(x + 100), Hc.y(y + 5), 42, { w: 6 }); it.circle(Hc.x(x + 360), Hc.y(y + 5), 42, { w: 6 });
    it.arrow(Hc.x(x + 230), Hc.y(y - 180), Hc.x(x + 230), Hc.y(y - 300), { c: "red", w: 7, head: 26 }); }
  item("car/car", 0.6).text("LIFTING A CAR", Hc.x(700), Hc.y(660), big(70, "red"));
  item("car.end", 0.4, { sfx: false }).text("(a medium-size car, says National Geographic; a small one, says Live Science)", Hc.x(500), Hc.y(760), hand(28, "grey"));
  flush("pull.start-0.2", "car");

  // ---------- I: don't let friends pull ----------
  item("pull/so", 0.55).text("DON'T PULL!", I.x(500), I.y(140), big(90, "red"));
  { const it = item("pull/friends", 0.9); sand(it, I.x(40), I.x(380), I.y(560), 200, 6); stick(it, I.x(200), I.y(660), 1.0, { cut: I.y(560), arms: [[150, -110], [-50, -80]] });
    stick(it, I.x(640), I.y(700), 0.95, { arms: [[-150, -110], [-150, -100]] }); stick(it, I.x(830), I.y(700), 0.95, { arms: [[-150, -110], [-150, -100]] }); }
  { const it = item("pull/yank", 0.4); it.line(I.x(350), I.y(530), I.x(690), I.y(565), { w: 4, c: "grey" }); }
  item("pull/warned", 0.6).text("\"into two pieces\"", I.x(500), I.y(850), big(80, "ink"));
  item("pull/pieces", 0.4, { sfx: false }).text("Daniel Bonn, study co-author, to National Geographic", I.x(500), I.y(930), hand(32, "grey"));
  flush("wiggle.start-0.2", "pull");

  // ---------- J: wiggle, lie back, float free ----------
  item("wiggle/instead", 0.5).text("INSTEAD:", J.x(500), J.y(140), big(80, "ink"));
  { const it = item("wiggle/wiggle", 0.8); sand(it, J.x(60), J.x(940), J.y(300), 330, 7);
    [[380, 1], [600, -1]].forEach(([x, d]) => { it.line(J.x(x), J.y(260), J.x(x + d * 10), J.y(560), { w: 8 }); it.arc(J.x(x + d * 10), J.y(470), 50, 0, 5.2, { c: "red", w: 4, ghost: false }); }); }
  item("wiggle/slowly", 0.4).text("wiggle slowly", J.x(800), J.y(250), hand(44, "red"));
  { const it = item("wiggle/water", 0.7); [[330, 360], [450, 400], [560, 360], [670, 410]].forEach(([x, y]) => { it.line(J.x(x), J.y(y), J.x(x), J.y(y + 70), { c: "blue", w: 5 }); it.dot(J.x(x), J.y(y + 82), 8, { c: "blue" }); }); }
  item("wiggle/loosens", 0.45).text("water loosens the sand", J.x(500), J.y(700), hand(46, "blue"));
  flush("wiggle/lie-0.3", "wiggle 1");
  { const it = item("wiggle/lie", 0.8); const y = 860; it.circle(J.x(210), J.y(y - 40), 32, { w: 5 }); it.line(J.x(245), J.y(y - 35), J.x(520), J.y(y - 20), { w: 6 });
    it.line(J.x(520), J.y(y - 20), J.x(700), J.y(y - 60), { w: 6 }); it.line(J.x(520), J.y(y - 20), J.x(710), J.y(y - 20), { w: 6 }); it.line(J.x(330), J.y(y - 30), J.x(300), J.y(y - 120), { w: 5 }); it.line(J.x(400), J.y(y - 26), J.x(440), J.y(y - 110), { w: 5 });
    it.curve([J.p(100, y), J.p(400, y + 8), J.p(800, y - 4), J.p(940, y + 6)], { w: 4 }); }
  item("wiggle/free", 0.45).text("lie back, float free", J.x(500), J.y(975), hand(46, "ink"));
  flush("tide.start-0.2", "wiggle 2");

  // ---------- K: the real risk: the tide ----------
  item("tide/the", 0.5).text("THE REAL RISK:", K.x(500), K.y(140), big(80, "ink"));
  { const it = item("tide/stuck", 0.8); sand(it, K.x(40), K.x(560), K.y(660), 240, 8); stick(it, K.x(300), K.y(760), 1.0, { cut: K.y(660) }); }
  { const it = item("tide/sea", 0.7); [600, 650, 700].forEach(y => it.curve([K.p(580, y), K.p(660, y - 20), K.p(740, y), K.p(820, y - 20), K.p(900, y), K.p(980, y - 20)], { c: "blue", w: 5 }));
    it.hatch([K.p(580, 620), K.p(980, 620), K.p(980, 900), K.p(580, 900)], { c: "blue", gap: 13, alpha: 0.4, k: 0.5 }); }
  { const it = item("tide/tide", 0.6); it.arrow(K.x(900), K.y(520), K.x(640), K.y(520), { c: "blue", w: 7, head: 26 }); it.text("the tide", K.x(780), K.y(480), hand(48, "blue")); }
  item("tide/in", 0.45).text("not the sand", K.x(300), K.y(980), hand(46, "red"));
  flush("call.start-0.2", "tide");

  // ---------- L: callback ----------
  { const it = item("call/quicksand", 0.8); sand(it, Lc.x(60), Lc.x(940), Lc.y(600), 300, 9); stick(it, Lc.x(500), Lc.y(700), 1.2, { cut: Lc.y(600), arms: [[-70, -170], [80, -60]] }); }
  item("call/swallow", 0.45).text("not swallowed", Lc.x(500), Lc.y(160), hand(56, "ink"));
  item("call/it", 0.6).text("IT JUST HOLDS ON", Lc.x(500), Lc.y(1000), big(80, "red"));
  flush("call.end-0.1", "callback");

  SK.done();
  window.CUSTOM = Object.assign(window.CUSTOM || {}, { page: t => SK.frame(t) });
})();

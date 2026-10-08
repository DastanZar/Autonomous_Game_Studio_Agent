// mars-no-suit: one page, drawn while the narrator talks. Layout (world units, page 2200 x 5560):
//   row 0: A you on Mars: blood no, spit yes (hook)   B the air: pressure to scale; 95% CO2
//   row 1: C boiling at body temperature             D why your blood doesn't boil
//   row 2: E the tongue; don't hold your breath       F 10 to 15 seconds
//   row 3: G 1965: the vacuum-chamber leak            H 14 seconds; the water on his tongue
//   row 4: I the air comes back                       J the cold
// Every number is in dossier.json. The 1965 test subject is a real person: he is not drawn (the chamber is).
"use strict";
(() => {
  const L = 60, R = 1140, ROW = [60, 1100, 2140, 3180, 4220];
  const cell = (x0, y0) => ({ x: v => x0 + v, y: v => y0 + v, p: (a, b) => [x0 + a, y0 + b] });
  const [A, B, C, D, E, F, G, Hc, I, J] = ROW.flatMap(y => [cell(L, y), cell(R, y)]);
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
  const disc = (cx, cy, r, n = 32) => { const p = []; for (let k = 0; k < n; k++) { const a = k / n * 6.283; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  const stick = (it, x, y, s = 1, o = {}) => {        // a generic stick figure, feet at (x, y)
    const w = { w: 5 * s + 1 };
    it.circle(x, y - 205 * s, 34 * s, w);
    it.line(x, y - 171 * s, x, y - 70 * s, w); it.line(x, y - 70 * s, x - 34 * s, y, w); it.line(x, y - 70 * s, x + 34 * s, y, w);
    (o.arms || [[-42, -95], [42, -95]]).forEach(([dx, dy]) => it.line(x, y - 140 * s, x + dx * s, y + dy * s, w));
  };
  const bubbles = (it, pts, c = "blue") => pts.forEach(([x, y, r]) => it.circle(x, y, r, { c, w: 3, ghost: false }));
  const watch = (it, x, y, r) => {
    it.circle(x, y, r, { w: 6 }); it.rect(x - 16, y - r - 34, 32, 26, { w: 5 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; it.line(x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18), x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6), { w: 3, ghost: false }); }
  };
  const wedgeP = (x, y, r, f0, f1) => { const p = [[x, y]]; for (let k = 0; k <= 20; k++) { const a = -Math.PI / 2 + 6.283 * (f0 + (f1 - f0) * k / 20); p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return p; };

  // ---------- A: you on Mars (hook) ----------
  { const it = item("hook/step", 0.8); it.circle(A.x(820), A.y(200), 110, { c: "red", w: 6 }); it.hatch(disc(A.x(820), A.y(200), 110), { c: "red", gap: 12, alpha: 0.45 }); it.text("MARS", A.x(820), A.y(360), big(60, "red"));
    it.curve([A.p(40, 760), A.p(300, 740), A.p(520, 770), A.p(980, 750)], { w: 5 }); it.hatch([A.p(40, 760), A.p(300, 740), A.p(520, 770), A.p(980, 750), A.p(980, 860), A.p(40, 860)], { c: "red", gap: 14, alpha: 0.35, k: 0.5 }); }
  { const it = item("hook/without", 0.6); stick(it, A.x(330), A.y(755), 1.3); it.text("no suit", A.x(130), A.y(380), hand(48, "ink")); it.line(A.x(170), A.y(400), A.x(270), A.y(450), { w: 3 }); }
  { const it = item("hook/blood", 0.7); it.curve([A.p(560, 560), A.p(530, 630), A.p(560, 660), A.p(590, 630), A.p(560, 560)], { c: "red", w: 5 }); it.hatch([A.p(560, 565), A.p(533, 630), A.p(560, 656), A.p(587, 630)], { c: "red", gap: 7, alpha: 0.7 });
    it.text("blood: won't boil", A.x(620), A.y(650), hand(46, "ink", "left")); }
  { const it = item("hook/spit", 0.7); bubbles(it, [[A.x(380), A.y(480), 9], [A.x(400), A.y(455), 7], [A.x(392), A.y(430), 5]]); it.text("spit: will", A.x(620), A.y(470), hand(46, "red", "left")); it.line(A.x(610), A.y(455), A.x(418), A.y(465), { c: "red", w: 3 }); }
  flush("air.start-0.2", "hook");

  // ---------- B: the air, to scale ----------
  item("air/mars", 0.5).text("AIR PRESSURE (to scale)", B.x(500), B.y(120), hand(56, "ink"));
  const KP = 600 / 1014;
  { const it = item("air/have", 0.7); it.line(B.x(120), B.y(880), B.x(900), B.y(880), { w: 5 }); it.rect(B.x(180), B.y(880 - 1014 * KP), 220, 1014 * KP, { w: 5 }); it.hatch([B.p(180, 880 - 1014 * KP), B.p(400, 880 - 1014 * KP), B.p(400, 880), B.p(180, 880)], { c: "blue", gap: 13, alpha: 0.45, k: 0.5 });
    it.text("Earth", B.x(290), B.y(940), hand(48, "ink")); it.text("1,014 mb", B.x(290), B.y(880 - 1014 * KP - 25), big(56, "blue")); }
  { const it = item("air/less", 0.6); it.rect(B.x(600), B.y(880 - 6.36 * KP), 220, Math.max(5, 6.36 * KP), { c: "red", w: 5 }); it.text("Mars", B.x(710), B.y(940), hand(48, "ink")); it.text("6.4 mb", B.x(710), B.y(830), big(56, "red")); }
  item("air/earth", 0.6).text("under 1%", B.x(710), B.y(560), big(84, "red"));
  item("air/carbon", 0.6).text("95% carbon dioxide", B.x(710), B.y(640), hand(42, "ink"));
  item("air/dioxide", 0.35, { sfx: false }).text("NASA Mars & Earth fact sheets", B.x(710), B.y(700), hand(30, "grey"));
  flush("boil.start-0.2", "air");

  // ---------- C: boiling at body temperature ----------
  item("boil/thin", 0.5).text("THIN AIR = LOW BOILING POINT", C.x(500), C.y(120), hand(54, "ink"));
  { const it = item("boil/water", 0.8); it.poly([C.p(150, 330), C.p(170, 560), C.p(430, 560), C.p(450, 330)], { w: 6 }); it.line(C.x(120), C.y(330), C.x(480), C.y(330), { w: 6 });
    [[200, 380], [260, 420], [320, 370], [380, 430], [240, 480], [350, 500]].forEach(([x, y]) => it.circle(C.x(x), C.y(y), 14, { c: "blue", w: 3, ghost: false })); }
  { const it = item("boil/lower", 0.6); it.text("water boils at 37°C", C.x(300), C.y(650), hand(46, "ink")); it.text("below 6.3 kPa", C.x(300), C.y(710), hand(46, "ink")); it.text("(the 'Armstrong limit')", C.x(300), C.y(760), hand(36, "grey")); }
  { const it = item("boil/mars", 0.7); it.line(C.x(620), C.y(250), C.x(620), C.y(760), { w: 5 }); it.line(C.x(600), C.y(300), C.x(640), C.y(300), { w: 4 }); it.text("6.3 kPa", C.x(660), C.y(315), hand(44, "ink", "left"));
    it.line(C.x(600), C.y(720), C.x(640), C.y(720), { c: "red", w: 5 }); it.text("Mars: 0.64 kPa", C.x(660), C.y(735), hand(44, "red", "left")); it.arrow(C.x(760), C.y(370), C.x(760), C.y(660), { c: "red", w: 6, head: 22 }); it.text("10x lower", C.x(790), C.y(530), big(52, "red", "left")); }
  item("boil/temperature", 0.6).text("ON MARS, IT BOILS AT BODY TEMPERATURE", C.x(500), C.y(880), hand(44, "red"));
  item("boil.end", 0.4, { sfx: false }).text("simplified: for your body, close to a vacuum", C.x(500), C.y(950), hand(34, "grey"));
  flush("blood.start-0.2", "boil");

  // ---------- D: why your blood doesn't boil ----------
  item("blood/why", 0.5).text("SO WHY NOT YOUR BLOOD?", D.x(500), D.y(120), hand(56, "ink"));
  { const it = item("blood/skin", 0.9); stick(it, D.x(500), D.y(860), 2.4, { arms: [[-90, -40], [90, -40]] }); }
  { const it = item("blood/vessels", 0.8); it.curve([D.p(500, 430), D.p(430, 520), D.p(440, 640), D.p(500, 690), D.p(560, 640), D.p(570, 520), D.p(500, 430)], { c: "red", w: 6 }); it.dot(D.x(500), D.y(560), 12, { c: "red" }); }
  { const it = item("blood/pressure", 0.7); [[330, 560, 1], [670, 560, -1]].forEach(([x, y, d]) => it.arrow(D.x(x - d * 90), D.y(y), D.x(x), D.y(y), { c: "blue", w: 6, head: 20 }));
    it.text("skin + vessels", D.x(500), D.y(940), hand(46, "blue")); it.text("keep it under pressure", D.x(500), D.y(995), hand(46, "blue")); }
  flush("spit.start-0.2", "blood");

  // ---------- E: the tongue; don't hold your breath ----------
  item("spit/tongue", 0.5).text("YOUR TONGUE:", E.x(500), E.y(120), big(76, "ink"));
  { const it = item("spit/open", 0.8); it.circle(E.x(330), E.y(380), 170, { w: 6 }); it.curve([E.p(410, 440), E.p(470, 460), E.p(560, 470), E.p(590, 500), E.p(540, 520), E.p(440, 495)], { c: "red", w: 6 });
    it.dot(E.x(300), E.y(330), 10); it.dot(E.x(390), E.y(330), 10); }
  { const it = item("spit/saliva", 0.8); bubbles(it, [[E.x(490), E.y(440), 12], [E.x(530), E.y(420), 9], [E.x(560), E.y(445), 11], [E.x(510), E.y(395), 7], [E.x(570), E.y(400), 6]]); it.text("saliva boils", E.x(780), E.y(420), big(58, "blue")); }
  flush("breath.start-0.2", "spit");
  { const it = item("breath/don't", 0.8); it.curve([E.p(380, 640), E.p(300, 650), E.p(270, 800), E.p(330, 880), E.p(400, 850), E.p(410, 700), E.p(380, 640)], { w: 5 });
    it.curve([E.p(470, 640), E.p(550, 650), E.p(580, 800), E.p(520, 880), E.p(450, 850), E.p(440, 700), E.p(470, 640)], { w: 5 }); it.line(E.x(425), E.y(560), E.x(425), E.y(650), { w: 5 }); }
  item("breath/hold", 0.5).text("don't hold your breath", E.x(780), E.y(760), hand(44, "red"));
  item("breath/lungs", 0.4).text("it can damage your lungs", E.x(780), E.y(820), hand(40, "ink"));
  flush("clock.start-0.2", "breath");

  // ---------- F: 10 to 15 seconds ----------
  item("clock/you'd", 0.5).text("YOU'D STAY AWAKE", F.x(500), F.y(120), big(76, "ink"));
  { const it = item("clock/about", 0.7); watch(it, F.x(300), F.y(420), 170); }
  { const it = item("clock/fifteen", 0.6); it.hatch(wedgeP(F.x(300), F.y(420), 140, 10 / 60, 15 / 60), { c: "red", gap: 9, alpha: 0.7 }); it.hatch(wedgeP(F.x(300), F.y(420), 140, 0, 10 / 60), { c: "red", gap: 18, alpha: 0.3 }); it.text("10 to 15 s", F.x(690), F.y(430), big(80, "red")); }
  { const it = item("clock/oxygenpoor", 0.8); it.curve([F.p(560, 840), F.p(520, 790), F.p(560, 760), F.p(600, 790), F.p(640, 760), F.p(680, 790), F.p(640, 840), F.p(600, 880), F.p(560, 840)], { c: "red", w: 5 });
    it.arrow(F.x(700), F.y(800), F.x(840), F.y(700), { c: "blue", w: 6, head: 22 }); it.circle(F.x(900), F.y(660), 60, { w: 5 }); it.text("brain", F.x(900), F.y(760), hand(40, "ink")); }
  item("clock/brain", 0.45).text("oxygen-poor blood, heart to brain", F.x(500), F.y(960), hand(40, "blue"));
  flush("real.start-0.2", "clock");

  // ---------- G: 1965, the chamber ----------
  item("real/we", 0.5).text("WE KNOW, BECAUSE...", G.x(500), G.y(120), hand(56, "ink"));
  item("real/nineteen", 0.6).text("1965", G.x(500), G.y(250), big(110, "red"));
  { const it = item("real/nasa", 0.9); it.rect(G.x(180), G.y(330), 640, 520, { w: 7 }); it.circle(G.x(500), G.y(560), 110, { w: 6 }); it.circle(G.x(500), G.y(560), 90, { w: 3, ghost: false });
    it.line(G.x(820), G.y(500), G.x(900), G.y(500), { w: 6 }); it.line(G.x(900), G.y(500), G.x(900), G.y(880), { w: 6 }); }
  { const it = item("real/leaked", 0.6); [[-1, -0.6], [0, -1], [1, -0.6]].forEach(([dx, dy]) => it.line(G.x(500 + dx * 60), G.y(560 + dy * 60), G.x(500 + dx * 95), G.y(560 + dy * 95), { c: "red", w: 4, ghost: false })); it.text("a suit leak", G.x(500), G.y(760), hand(46, "red")); }
  item("real/chamber", 0.5).text("NASA vacuum chamber (Manned Spacecraft Center)", G.x(500), G.y(920), hand(36, "ink"));
  item("real/chamber", 0.3, { sfx: false }).text("account: NASA, Imagine the Universe! 'Ask an Astrophysicist'", G.x(500), G.y(975), hand(28, "grey"));
  flush("tongue.start-0.2", "real");

  // ---------- H: 14 seconds; his last memory ----------
  item("tongue/stayed", 0.6).text("CONSCIOUS FOR", Hc.x(500), Hc.y(120), hand(56, "ink"));
  item("tongue/fourteen", 0.6).text("ABOUT 14 SECONDS", Hc.x(500), Hc.y(240), big(90, "red"));
  item("tongue/last", 0.5).text("his last memory:", Hc.x(500), Hc.y(380), hand(50, "ink"));
  { const it = item("tongue/water", 0.8); it.curve([Hc.p(250, 560), Hc.p(380, 520), Hc.p(620, 520), Hc.p(750, 560), Hc.p(620, 700), Hc.p(380, 700), Hc.p(250, 560)], { c: "red", w: 6 }); it.line(Hc.x(500), Hc.y(540), Hc.x(500), Hc.y(660), { c: "red", w: 3 }); }
  { const it = item("tongue/beginning", 0.6); bubbles(it, [[Hc.x(400), Hc.y(510), 14], [Hc.x(450), Hc.y(470), 10], [Hc.x(560), Hc.y(500), 12], [Hc.x(610), Hc.y(460), 8], [Hc.x(500), Hc.y(440), 7]]); }
  item("tongue/boil", 0.5).text("the water on his tongue, beginning to boil", Hc.x(500), Hc.y(800), hand(44, "blue"));
  flush("woke.start-0.2", "tongue");

  // ---------- I: the air comes back ----------
  { const it = item("woke/pumped", 0.8); it.rect(I.x(180), I.y(250), 640, 460, { w: 7 }); [[60, 330], [60, 470], [60, 610]].forEach(([x, y]) => it.arrow(I.x(x), I.y(y), I.x(170), I.y(y), { c: "blue", w: 7, head: 26 })); it.text("air back in", I.x(500), I.y(170), big(70, "blue")); }
  item("woke/woke", 0.5).text("HE WOKE UP", I.x(500), I.y(860), big(96, "ink"));
  item("woke/up", 0.3, { sfx: false }).text("(repressurising began within 15 s, says NASA)", I.x(500), I.y(940), hand(34, "grey"));
  flush("cold.start-0.2", "woke");

  // ---------- J: the cold ----------
  item("cold/cold", 0.5).text("AND THE COLD?", J.x(500), J.y(120), big(80, "ink"));
  { const it = item("cold/averages", 0.8); const x = 260; it.line(J.x(x - 22), J.y(250), J.x(x - 22), J.y(640), { w: 5 }); it.line(J.x(x + 22), J.y(250), J.x(x + 22), J.y(640), { w: 5 }); it.arc(J.x(x), J.y(250), 22, Math.PI, 2 * Math.PI, { w: 5 });
    it.circle(J.x(x), J.y(680), 44, { w: 5 }); it.hatch([J.p(x - 12, 560), J.p(x + 12, 560), J.p(x + 12, 700), J.p(x - 12, 700)], { c: "blue", gap: 6, alpha: 0.9, angle: -1.2 }); }
  item("cold/fiftynine", 0.6).text("-59°C average", J.x(380), J.y(470), big(72, "blue", "left"));
  item("cold/freeze", 0.5).text("but no instant freeze:", J.x(500), J.y(800), hand(48, "ink"));
  item("cold/heat", 0.5).text("heat leaves a body slowly", J.x(500), J.y(860), hand(48, "red"));
  item("cold/slowly", 0.3, { sfx: false }).text("NASA Mars fact sheet; NASA Ask an Astrophysicist", J.x(500), J.y(930), hand(30, "grey"));
  flush("call.start-0.2", "cold");

  // ---------- callback: mouth shut ----------
  { const it = item("call/keep", 0.9); it.line(A.x(312), A.y(506), A.x(348), A.y(506), { c: "red", w: 5 }); [316, 326, 336, 346].forEach(x => it.line(A.x(x), A.y(499), A.x(x), A.y(513), { c: "red", w: 3, ghost: false }));
    it.text("blood in, mouth shut", A.x(500), A.y(960), big(76, "red")); }
  flush(null, "callback");

  SK.done();
  window.CUSTOM = Object.assign(window.CUSTOM || {}, { page: t => SK.frame(t) });
})();

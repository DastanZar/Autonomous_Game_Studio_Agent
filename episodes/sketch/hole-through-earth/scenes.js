// hole-through-earth: one page, drawn while the narrator talks. Layout (world units, page 2200 x 5560):
//   row 0: A jump in: 38 minutes (hook)        B the hole: 12,700 km
//   row 1: C the deepest hole ever dug, to scale D let's pretend: no air, no lava, no spin
//   rows 2-3: the big cross-section (core drawn to scale, NASA radii): the fall, the centre, the flip, the far side
//   row 4: I the textbook 42 min, the real densities   J the real 38 min; constant gravity gives the same
// Every number is in dossier.json. Simplifications are written on the page ("no air, no lava, no spin").
"use strict";
(() => {
  const L = 60, R = 1140, ROW = [60, 1100, 2140, 3180, 4220];
  const cell = (x0, y0) => ({ x: v => x0 + v, y: v => y0 + v, p: (a, b) => [x0 + a, y0 + b] });
  const A = cell(L, ROW[0]), B = cell(R, ROW[0]), C = cell(L, ROW[1]), D = cell(R, ROW[1]), I = cell(L, ROW[4]), J = cell(R, ROW[4]);
  const PACE = EP.storyboard.pace || 1;
  const T = (c, d = 0) => cue(c) + d;
  // items are queued per camera view; flush(<cue of the next camera move>) lays them out one after another (one hand),
  // each on its word or just after the previous one, drawing a little faster if needed so everything is finished and
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
  const rot = (cx, cy, a) => ([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  const stick = (it, x, y, s = 1, o = {}) => {        // a generic stick figure, feet at (x, y); o.ang turns it about the feet
    const r = rot(x, y, o.ang || 0), w = { w: 5 * s + 1 }, L2 = (a, b) => { const p = r(a), q = r(b); it.line(p[0], p[1], q[0], q[1], w); };
    const hc = r([x, y - 205 * s]); it.circle(hc[0], hc[1], 34 * s, w);
    L2([x, y - 171 * s], [x, y - 70 * s]); L2([x, y - 70 * s], [x - 34 * s, y]); L2([x, y - 70 * s], [x + 34 * s, y]);
    (o.arms || [[-42, -95], [42, -95]]).forEach(([dx, dy]) => L2([x, y - 140 * s], [x + dx * s, y + dy * s]));
  };
  const watch = (it, x, y, r, c = "ink") => {           // a stopwatch
    it.circle(x, y, r, { w: 6, c }); it.rect(x - 16, y - r - 34, 32, 26, { w: 5, c }); it.line(x, y - r - 8, x, y - r, { w: 5, c, ghost: false });
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; it.line(x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18), x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6), { w: 3, ghost: false, c }); }
  };
  const watchHand = (it, x, y, r, frac, c = "red") => { const a = -Math.PI / 2 + frac * 6.283; it.line(x, y, x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26), { w: 7, c }); it.hatch((() => { const p = [[x, y]]; for (let k = 0; k <= 24; k++) { const b = -Math.PI / 2 + frac * 6.283 * k / 24; p.push([x + Math.cos(b) * (r - 28), y + Math.sin(b) * (r - 28)]); } return p; })(), { c, gap: 12, alpha: 0.3 }); };

  // ---------- A: jump in (hook) ----------
  item("hook/jump", 0.4).text("JUMP IN:", A.x(500), A.y(130), big(90, "ink"));
  { const it = item("hook/hole", 0.7); it.line(A.x(60), A.y(760), A.x(330), A.y(760), { w: 5 }); it.line(A.x(670), A.y(760), A.x(960), A.y(760), { w: 5 });
    it.circle(A.x(500), A.y(760), 170, { ry: 40, w: 6 }); it.hatch((() => { const p = []; for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; p.push([A.x(500) + Math.cos(a) * 165, A.y(760) + Math.sin(a) * 36]); } return p; })(), { c: "ink", gap: 10, alpha: 0.6 }); }
  { const it = item("hook/earth", 0.6); stick(it, A.x(430), A.y(560), 0.9, { ang: 0.35, arms: [[-60, -190], [60, -190]] }); [[350, 300], [400, 280]].forEach(([x, y]) => it.line(A.x(x), A.y(y), A.x(x - 20), A.y(y - 70), { w: 3, ghost: false })); }
  { const it = item("hook/pop", 0.6); watch(it, A.x(800), A.y(400), 120); }
  { const it = item("hook/thirtyeight", 0.5); watchHand(it, A.x(800), A.y(400), 120, 38 / 60); }
  item("hook/minutes", 0.55).text("38 minutes", A.x(500), A.y(940), big(100, "red"));
  flush("dig.start-0.2", "hook");

  // ---------- B: the hole ----------
  item("dig/the", 0.45).text("THE HOLE:", B.x(500), B.y(130), big(90, "ink"));
  { const it = item("dig/would", 0.7); it.circle(B.x(500), B.y(540), 330, { w: 6 }); }
  { const it = item("dig/about", 0.6); it.line(B.x(500), B.y(210), B.x(500), B.y(870), { w: 6, dash: [16, 10] }); it.dot(B.x(500), B.y(540), 9, { c: "red" }); }
  item("dig/twelve", 0.7).text("12,742 km", B.x(560), B.y(560), big(76, "red", "left"));
  item("dig/long", 0.4, { sfx: false }).text("2 x 6,371 km (NASA Earth fact sheet)", B.x(500), B.y(960), hand(34, "grey"));
  flush("kola.start-0.2", "dig");

  // ---------- C: the deepest hole ever dug, to scale ----------
  item("kola/the", 0.6).text("DEEPEST HOLE EVER DUG:", C.x(500), C.y(130), hand(58, "ink"));
  item("kola/twelve", 0.45).text("12 km", C.x(500), C.y(250), big(100, "red"));
  { const it = item("kola/kilometers", 0.8); it.arc(C.x(500), C.y(330 + 1600), 1600, -Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3, { w: 6 });
    it.line(C.x(500), C.y(330), C.x(500), C.y(333), { c: "red", w: 6 }); it.circle(C.x(500), C.y(340), 46, { c: "red", w: 4 }); }
  item("kola/about", 0.55).text("drawn to scale, it's this deep", C.x(500), C.y(470), hand(46, "ink"));
  { const it = item("kola/tenth", 0.6); it.arrow(C.x(640), C.y(440), C.x(545), C.y(355), { c: "red", w: 4, head: 18 }); it.text("0.1% of the way", C.x(500), C.y(640), big(80, "red")); }
  item("kola/way", 0.4, { sfx: false }).text("a Soviet dig, 1970 to 1989 (Klotz, via Live Science)", C.x(500), C.y(730), hand(34, "grey"));
  flush("pretend.start-0.2", "kola");

  // ---------- D: let's pretend ----------
  item("pretend/so", 0.5).text("LET'S PRETEND:", D.x(500), D.y(130), big(84, "ink"));
  const X = (it, x, y) => { it.line(D.x(x - 90), D.y(y - 90), D.x(x + 90), D.y(y + 90), { c: "red", w: 8 }); it.line(D.x(x + 90), D.y(y - 90), D.x(x - 90), D.y(y + 90), { c: "red", w: 8 }); };
  { const it = item("pretend/air", 0.6); it.curve([D.p(110, 470), D.p(100, 400), D.p(170, 380), D.p(210, 330), D.p(280, 360), D.p(320, 420), D.p(300, 470), D.p(110, 470)], { w: 5 }); X(it, 210, 410); it.text("no air", D.x(210), D.y(580), hand(48, "ink")); }
  { const it = item("pretend/lava", 0.6); it.curve([D.p(400, 470), D.p(430, 380), D.p(500, 350), D.p(570, 380), D.p(600, 470), D.p(400, 470)], { c: "red", w: 5 }); it.hatch([D.p(405, 468), D.p(432, 382), D.p(500, 352), D.p(568, 382), D.p(596, 468)], { c: "red", gap: 9, alpha: 0.5 }); X(it, 500, 410); it.text("no lava", D.x(500), D.y(580), hand(48, "ink")); }
  { const it = item("pretend/spinning", 0.6); it.arc(D.x(790), D.y(410), 70, 0.3, 5.6, { w: 6 }); it.line(D.x(790 + 70 * Math.cos(5.6)), D.y(410 + 70 * Math.sin(5.6)), D.x(800 + 70 * Math.cos(5.6)), D.y(370 + 70 * Math.sin(5.6)), { w: 6 }); X(it, 790, 410); it.text("no spin", D.x(790), D.y(580), hand(48, "ink")); }
  item("pretend/earth", 0.45, { sfx: false }).text("(simplified: the paper also ignores air)", D.x(500), D.y(700), hand(38, "grey"));
  flush("fall.start-0.2", "pretend");

  // ---------- the big cross-section (rows 2-3). Core radius to scale: 3,485 of 6,371 km (NASA) ----------
  const CX = 1100, CY = 3180, RE = 960, RC = RE * 3485 / 6371, TW = 26, TOP = CY - RE, BOT = CY + RE;
  { const it = item("fall/you", 0.9); it.circle(CX, CY, RE, { w: 7 }); it.circle(CX, CY, RE - 18, { w: 3, ghost: false, c: "grey" }); }
  { const it = item("fall/jump", 0.5); it.line(CX - TW, TOP - 8, CX - TW, BOT + 8, { w: 5 }); it.line(CX + TW, TOP - 8, CX + TW, BOT + 8, { w: 5 }); }
  { const it = item("fall/gravity", 0.55); stick(it, CX, TOP + 330, 0.55, { ang: Math.PI, arms: [[-30, -235], [30, -235]] }); }
  { const it = item("fall/faster", 0.7); [[TOP + 380, 30], [TOP + 470, 50], [TOP + 590, 75]].forEach(([y, l], k) => it.arrow(CX + 130, y, CX + 130, y + l, { c: "red", w: 5 + k, head: 14 + k * 4 })); it.text("faster", CX + 170, TOP + 520, hand(52, "red", "left")); it.text("and faster", CX + 170, TOP + 580, hand(52, "red", "left")); }
  flush("speed.start-0.2", "fall");
  { const it = item("speed/by", 0.8); it.circle(CX, CY, RC, { w: 5 }); it.hatch((() => { const p = []; for (let k = 0; k < 40; k++) { const a = k / 40 * 6.283; p.push([CX + Math.cos(a) * RC, CY + Math.sin(a) * RC]); } return p; })(), { c: "red", gap: 18, alpha: 0.22, k: 0.4 }); }
  item("speed/center", 0.4).text("core", CX - 330, CY - 260, hand(56, "red"));
  { const it = item("speed/you're", 0.5); it.dot(CX, CY, 10, { c: "ink" }); stick(it, CX, CY + 60, 0.42, { ang: Math.PI }); }
  { const it = item("speed/eight", 0.7); it.arrow(CX + 80, CY - 120, CX + 80, CY + 120, { c: "red", w: 10, head: 30 }); it.text("8+ km", CX + 130, CY - 20, big(96, "red", "left")); it.text("a second", CX + 130, CY + 60, big(70, "red", "left")); }
  flush("flip.start-0.2", "speed");
  item("flip/flips", 0.5).text("gravity flips", CX - 150, CY + 70, big(64, "ink", "right"));
  { const it = item("flip/behind", 0.7); [[CY - 300, 1], [CY - 180, 1], [CY + 180, -1], [CY + 300, -1]].forEach(([y, d]) => it.arrow(CX - 85, y - d * 40, CX - 85, y + d * 20, { c: "blue", w: 6, head: 18 })); it.text("pull", CX - 200, CY + 330, hand(44, "blue", "right")); }
  { const it = item("flip/slowing", 0.6); [[CY + 420, 75], [CY + 530, 50], [CY + 620, 30]].forEach(([y, l], k) => it.arrow(CX + 130, y, CX + 130, y + l, { c: "red", w: 7 - k, head: 22 - k * 4 })); it.text("slowing down", CX + 170, CY + 520, hand(52, "red", "left")); }
  flush("top.start-0.2", "flip");
  { const it = item("top/rise", 0.7); it.line(CX - 420, BOT + 2, CX - TW, BOT + 2, { w: 5 }); it.line(CX + TW, BOT + 2, CX + 420, BOT + 2, { w: 5 }); stick(it, CX, BOT + 10, 0.55, { ang: Math.PI, arms: [[-60, -60], [60, -60]] }); }
  item("top/other", 0.5).text("the other side", CX - 300, BOT - 200, hand(52, "ink"));
  item("top/stop", 0.5).text("speed: 0", CX + 300, BOT - 230, big(70, "red"));
  item("top/top", 0.4, { sfx: false }).text("(upside down, to us)", CX - 300, BOT - 145, hand(36, "grey"));
  flush("grab.start-0.2", "top");
  { const it = item("grab/grab", 0.5); it.text("GRAB THE EDGE!", CX + 330, BOT - 140, big(64, "red")); }
  { const it = item("grab/back", 1.0); it.curve([[CX - 70, TOP + 60], [CX - 90, CY], [CX - 70, BOT - 60]], { c: "red", w: 7, dash: [22, 14] }); it.line(CX - 70, BOT - 60, CX - 95, BOT - 100, { c: "red", w: 7 }); it.line(CX - 70, BOT - 60, CX - 40, BOT - 100, { c: "red", w: 7 });
    it.curve([[CX + 70, BOT - 60], [CX + 90, CY], [CX + 70, TOP + 60]], { c: "red", w: 7, dash: [22, 14] }); it.line(CX + 70, TOP + 60, CX + 45, TOP + 100, { c: "red", w: 7 }); it.line(CX + 70, TOP + 60, CX + 100, TOP + 100, { c: "red", w: 7 }); }
  item("grab/again", 0.5).text("and back again", CX - 700, CY - 520, big(80, "red"));
  item("grab.end", 0.4, { sfx: false }).text("core to scale (NASA radii)", CX + 640, CY - 620, hand(46, "grey"));
  flush("text.start-0.2", "grab");

  // ---------- I: the textbook answer, and the real densities ----------
  item("text/textbooks", 0.5).text("TEXTBOOKS:", I.x(500), I.y(120), big(80, "ink"));
  { const it = item("text/fortytwo", 0.6); watch(it, I.x(220), I.y(330), 110); watchHand(it, I.x(220), I.y(330), 110, 42 / 60, "blue"); it.text("42 min", I.x(380), I.y(360), big(90, "blue", "left")); }
  { const it = item("text/same", 0.9); const cx = I.x(260), cy = I.y(700), r = 170; it.circle(cx, cy, r, { w: 5 }); it.hatch((() => { const p = []; for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; })(), { c: "blue", gap: 16, alpha: 0.4, k: 0.6 }); it.text("same density", cx, cy + 230, hand(44, "blue")); it.text("all through", cx, cy + 280, hand(44, "blue")); }
  flush("dense.start-0.2", "text");
  { const it = item("dense/isn't", 0.5); it.text("REAL:", I.x(740), I.y(480), big(70, "red")); }
  { const it = item("dense/crust", 0.9); const cx = I.x(740), cy = I.y(700), r = 170, rc = r * 3485 / 6371; it.circle(cx, cy, r, { w: 5 }); it.circle(cx, cy, rc, { w: 4 });
    const disc = rr => { const p = []; for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
    it.hatch(disc(r), { c: "red", gap: 24, alpha: 0.3, k: 0.4 }); it.hatch(disc(rc), { c: "red", gap: 8, alpha: 0.55, k: 0.6 }); }
  item("dense/three", 0.45).text("crust: under 3 g/cm³", I.x(740), I.y(930), hand(42, "ink"));
  item("dense/thirteen", 0.45).text("centre: about 13", I.x(740), I.y(985), hand(42, "red"));
  flush("real.start-0.2", "dense");

  // ---------- J: the real answer, and the weird shortcut ----------
  item("real/redo", 0.5).text("THE REAL EARTH:", J.x(500), J.y(120), big(80, "ink"));
  { const it = item("real/measured", 0.7); watch(it, J.x(240), J.y(340), 120); }
  { const it = item("real/thirtyeight", 0.6); watchHand(it, J.x(240), J.y(340), 120, 38 / 60); it.text("38 min", J.x(410), J.y(370), big(110, "red", "left")); }
  item("real/minutes", 0.4, { sfx: false }).text("seismic data: Klotz, Am. J. Phys., 2015", J.x(500), J.y(520), hand(36, "grey"));
  flush("twist.start-0.2", "real");
  item("twist/weirder", 0.5).text("WEIRDER STILL:", J.x(500), J.y(620), hand(56, "ink"));
  { const it = item("twist/never", 0.8); [140, 300, 460, 620, 780].forEach(x => it.arrow(J.x(x), J.y(680), J.x(x), J.y(790), { c: "blue", w: 6, head: 18 })); it.text("gravity never changes", J.x(500), J.y(850), hand(48, "blue")); }
  item("twist/same", 0.6).text("still about 38 min", J.x(500), J.y(950), big(76, "red"));
  flush("call.start-0.2", "twist");

  // ---------- callback ----------
  item("call/door", 0.9).text("38 MINUTES, DOOR TO DOOR", 1100, 2110, big(96, "red"));
  flush(null, "callback");

  SK.done();
  window.CUSTOM = Object.assign(window.CUSTOM || {}, { page: t => SK.frame(t) });
})();

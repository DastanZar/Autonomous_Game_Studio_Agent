// THE KEYS TO THE INTERNET (SORT OF) — scenes. Times come from the voiceover word timeline.
"use strict";

// ---------------- cold open ----------------
function sceneArrive(t) {
  paperBG("#f0e5cc");
  cut(rect(-10, 760, W + 20, 400), "#cdb98f", { lw: 5 });
  const t0 = PS("cold"), b = WT("cold", "boringlooking");
  // plane
  const pk = prog(t, t0, t0 + 4.5);
  if (pk > 0 && pk < 1) plane(lerp(-200, 2150, pk), 190 - Math.sin(pk * Math.PI) * 60, 0.9, -0.05 + pk * 0.1);
  label("4× A YEAR", 960, 120, { size: 44, k: pop(t, t0 + 0.2) });
  const bk = pop(t, b - 0.1);
  popIn(560, 760, bk, () => building(0, 0, 0.95, { id: 102, cam: true }));
  popIn(1360, 760, pop(t, b + 0.15), () => building(0, 0, 0.95, { id: 103, col: "#d6ccb0", cam: true }));
  label("VERY BORING BUILDING", 560, 860, { size: 32, k: pop(t, b + 0.5) });
  label("ALSO VERY BORING", 1360, 860, { size: 32, k: pop(t, b + 0.8) });
  // travellers with suitcases
  for (let i = 0; i < 6; i++) {
    const fromLeft = i % 2 === 0, target = fromLeft ? 380 + i * 30 : 1540 - i * 30;
    const k = eout(prog(t, t0 + 0.2 + i * 0.35, t0 + 3.2 + i * 0.35));
    const x = lerp(fromLeft ? -120 : 2040, target, k);
    person({
      x, y: 990 + (i % 3) * 18, s: 0.62, dir: fromLeft ? 1 : -1, walk: k < 1 ? t * 8 + i : null, id: 20 + i,
      hold: () => { cut(rect(46, -130, 50, 70, 8), ["#8a4b3a", "#3d5a6a", "#6a6a3a"][i % 3], { lw: 4, shadow: false }); line(58, -130, 58, -142, P.ink, 5); line(84, -130, 84, -142, P.ink, 5); line(58, -142, 84, -142, P.ink, 5); }
    });
  }
}

function sceneUSMap(t) {
  sea();
  const pr = usProj(960, 560, 30);
  cut(() => mapPath(USA, pr), P.land, { lw: 4, sx: 10, sy: 12, sb: 10 });
  const es = pr(-118.42, 33.92), cu = pr(-78.0, 38.47);
  pin(es[0], es[1], prog(t, WT("cold", "el") - 0.1, WT("cold", "el") + 0.25), P.orange, "EL SEGUNDO, CA", 1);
  pin(cu[0], cu[1], prog(t, WT("cold", "culpeper") - 0.1, WT("cold", "culpeper") + 0.25), P.blue, "CULPEPER, VA", -1);
  label("UNITED STATES", 960, 960, { size: 36, k: pop(t, PS("cold") + 6.8) });
}

function scanPanel(x, kind, k, t, t0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, 520); ctx.scale(back(k), back(k)); ctx.rotate((1 - Math.min(1, k)) * 0.2);
  cut(rect(-190, -250, 380, 500, 18), P.card, { lw: 5, sx: 8, sy: 10 });
  const lt = t - t0;
  if (kind === 0) { // keypad
    cut(rect(-120, -200, 240, 70, 8), "#23312c", { lw: 3, shadow: false });
    text("*".repeat(clamp(Math.floor(lt * 5), 0, 4)), 0, -148, { font: "Elite", size: 50, color: "#9fe3a8" });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const hit = Math.floor(lt * 5) === r * 3 + c && lt < 0.9;
      cut(rect(-105 + c * 75, -105 + r * 62, 60, 50, 8), hit ? P.yellow : P.steel3, { lw: 3, shadow: false });
      text(String((r * 3 + c + 1) % 11 === 10 ? 0 : r * 3 + c + 1).replace("11", "#"), -75 + c * 75, -70 + r * 62, { font: "Elite", size: 26 });
    }
  } else if (kind === 1) { // card reader
    cut(rect(-110, -40, 220, 200, 12), P.steel2, { lw: 4 });
    cut(rect(-90, -20, 180, 14, 4), "#1c1a18", { lw: 2, shadow: false });
    smartcard(0, lerp(-190, -60, eout(clamp(lt * 2))), 0.9, 0);
    cut(circ(0, 110, 16), lt > 0.6 ? "#8fe07a" : "#5a1f18", { lw: 3, shadow: false });
  } else if (kind === 2) { // hand scanner
    cut(rect(-140, -200, 280, 360, 20), "#2e3b44", { lw: 4 });
    ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = "#6fc7d6";
    ctx.beginPath(); ctx.ellipse(0, 40, 70, 80, 0, 0, 7); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(-62 + i * 34, -140 + Math.abs(i - 1.5) * 16, 26, 110, 13); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(-86, 10, 16, 50, -0.6, 0, 7); ctx.fill(); ctx.restore();
    const sy = -190 + ((lt * 1.6) % 1) * 340;
    line(-130, sy, 130, sy, "#b8f2ff", 6);
  } else { // retina
    ctx.save(); ctx.shadowColor = "rgba(255,40,30,0.8)"; ctx.shadowBlur = 40 * clamp(lt * 2);
    cut(() => { ctx.moveTo(-150, 0); ctx.quadraticCurveTo(0, -130, 150, 0); ctx.quadraticCurveTo(0, 130, -150, 0); ctx.closePath(); }, "#fffaf0", { lw: 5, shadow: false });
    ctx.restore();
    cut(circ(0, 0, 62), P.teal, { lw: 4, shadow: false });
    cut(circ(0, 0, 28), P.ink, { lw: 0, shadow: false });
    cut(circ(12, -12, 9), "#fffaf0", { lw: 0, shadow: false });
    ctx.save(); ctx.strokeStyle = "rgba(230,40,30,0.85)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 90 + Math.sin(lt * 8) * 6, 0, 7); ctx.stroke();
    line(-170, -130 + ((lt * 1.4) % 1) * 260, 170, -130 + ((lt * 1.4) % 1) * 260, "rgba(230,40,30,0.8)", 4); ctx.restore();
  }
  text(["PIN", "SMARTCARD", "HAND SCAN", "RETINA SCAN"][kind], 0, 210, { size: 46 });
  ctx.restore();
}
function sceneSecurity(t) {
  graphPaper();
  const ts = [WT("cold", "pin"), WT("cold", "smartcard"), WT("cold", "hand"), WT("cold", "eye")];
  ts.forEach((tt, i) => scanPanel(270 + i * 460, i, prog(t, tt - 0.25, tt + 0.1), t, tt - 0.25));
}

function sceneSafe(t) {
  paperBG("#2c2622");
  const o = WT("cold", "open"), kk = WT("cold", "keys");
  const open = eio(prog(t, o, o + 1.1));
  const zoom = 1 + 0.15 * eio(prog(t, o, kk + 1.5));
  ctx.save(); ctx.translate(960, 560); ctx.scale(zoom, zoom); ctx.translate(-960, -560);
  safe(960, 560, 1.35, open, {
    inside: "#1d1a17", content: () => {
      const g = prog(t, o + 0.4, o + 1.4);
      ctx.save(); ctx.globalAlpha = g; const gr = ctx.createRadialGradient(0, 0, 10, 0, 0, 220); gr.addColorStop(0, "rgba(255,227,154,0.95)"); gr.addColorStop(1, "rgba(255,227,154,0)");
      ctx.fillStyle = gr; ctx.fillRect(-170, -190, 340, 380); ctx.restore();
      const rise = eout(prog(t, kk - 0.3, kk + 0.6));
      if (rise > 0) { ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 40; keyShape(-5, 40 - rise * 40, 1.1, -0.35, P.yellow, { hole: "#1d1a17" }); ctx.restore(); }
    }
  });
  ctx.restore();
}

// ---------------- title ----------------
function sceneTitle(t) {
  paperBG();
  const t0 = PS("sortof");
  const tk = pop(t, t0 - 0.15, 0.5);
  popIn(960, 330, tk, () => {
    text("THE KEYS TO", 0, -40, { size: 130, stroke: 14, color: P.card, shadow: true });
    text("THE INTERNET", 0, 110, { size: 150, stroke: 14, color: P.yellow, shadow: true });
    text("*", 560, 20, { size: 150, stroke: 12, color: P.red });
  });
  stamp("*SORT OF", 1500, 560, t - WT("sortof", "sort") + 0.05, { size: 90, rot: -0.12 });
  const ck = pop(t, WT("sortof", "two") - 0.1, 0.45);
  popIn(620, 780, ck, () => calendarPage(0, 0, 0.9, "OCTOBER", "11", "2026", { rot: -0.05 }), 0.3);
  label("IN 2 WEEKS", 620, 1000, { size: 36, k: pop(t, WT("sortof", "weeks")) });
  const lk = prog(t, WT("sortof", "changing") - 0.1, WT("sortof", "changing") + 0.8);
  if (t > WT("sortof", "second") - 0.2) {
    const old = eio(lk);
    withAlpha(1 - old, () => { padlock(1300 - old * 200, 840, 1.1, 0, P.steel3); text("OLD KEY", 1300 - old * 200, 960, { font: "Elite", size: 30 }); });
    withAlpha(old, () => { padlock(1300 + (1 - old) * 200, 840, 1.1, 0, P.yellow); text("NEW KEY", 1300 + (1 - old) * 200, 960, { font: "Elite", size: 30 }); });
    label("2ND TIME EVER", 1300, 700, { size: 32, k: pop(t, WT("sortof", "second")) });
  }
}

// ---------------- the myth ----------------
function sceneHeadline(t) {
  desk();
  const t0 = PS("myth") - 0.2;
  const k = eout(prog(t, t0, t0 + 0.9));
  ctx.save(); ctx.translate(960, 520); ctx.rotate((1 - k) * 6 - 0.04); ctx.scale(0.2 + 0.8 * k, 0.2 + 0.8 * k); boil(130, 0.5);
  cut(rect(-620, -380, 1240, 760, 4), "#f1ebdd", { lw: 5, sx: 14, sy: 18, sb: 14 });
  text("THE DAILY INTERNET", 0, -300, { font: "Serif", size: 74 });
  line(-580, -270, 580, -270, P.ink, 4); line(-580, -260, 580, -260, P.ink, 2);
  text("MEET THE 7 PEOPLE", 0, -160, { size: 104 });
  text("WHO HOLD THE KEYS", 0, -50, { size: 104 });
  text("TO THE INTERNET", 0, 60, { size: 104, color: P.red });
  for (let c = 0; c < 3; c++) for (let r = 0; r < 8; r++) cut(rect(-560 + c * 390, 120 + r * 28, 340 - (r === 7 ? 120 : 0), 12, 3), "rgba(43,35,32,0.28)", { lw: 0, shadow: false });
  ctx.restore();
  const f = WT("myth", "fantastic");
  for (let i = 0; i < 5; i++) { const sk = pop(t, f + i * 0.08, 0.3) * (1 - prog(t, f + 1.2, f + 1.6)); if (sk > 0) popIn(300 + i * 330, 150 + (i % 2) * 760, sk, () => star(0, 0, 40, P.yellow)); }
  const wr = WT("myth", "wrong");
  stamp("WRONG", 1250, 700, t - wr + 0.05, { size: 150, rot: -0.16 });
  label("— according to the people who hold the keys", 960, 1000, { size: 30, k: pop(t, WT("myth", "according")) });
}
function sceneQuestions(t) {
  graphPaper();
  const qs = [["1", "WHAT DO THE", "KEYS DO?", WT("myth", "really")], ["2", "WHO HAS", "THEM?", WT("myth", "who")], ["3", "WHAT IF ONE", "GETS LOST?", WT("myth", "loses")]];
  qs.forEach(([n, a, b, tt], i) => popIn(400 + i * 560, 540, pop(t, tt - 0.15, 0.4), () => {
    ctx.rotate((i - 1) * 0.04);
    cut(rect(-230, -170, 460, 340, 6), P.card, { lw: 5, sx: 8, sy: 10 });
    line(-230, -90, 230, -90, P.red, 3);
    text(n, -170, -110, { size: 70, color: P.red });
    text(a, 0, 20, { size: 64 }); text(b, 0, 100, { size: 64 });
  }, 0.4));
}

// ---------------- DNS ----------------
function sceneDNS(t) {
  paperBG();
  const t0 = PS("dns");
  const typed = prog(t, t0 + 0.2, WT("dns", "website") + 0.2);
  laptop(520, 900, 1.25, { screen: () => { browser("wikipedia.org", typed); if (t > WT("dns", "means")) text(t > WT("dns", "number") ? "208.80.154.224" : "???", 0, -130, { size: 50, color: t > WT("dns", "number") ? P.green2 : P.red }); } });
  // thought bubble
  const bq = pop(t, WT("dns", "means") - 0.1);
  if (bq > 0 && t < WT("dns", "domain")) popIn(900, 270, bq, () => {
    cut(ell(0, 0, 190, 110), P.card, { lw: 4 }); cut(circ(-150, 120, 18), P.card, { lw: 3 }); cut(circ(-190, 160, 10), P.card, { lw: 3 });
    text(t > WT("dns", "number") ? "a number?" : "wikipedia…?", 0, 16, { font: "Elite", size: 38 });
  });
  label("IP ADDRESS", 520, 330, { size: 36, k: pop(t, WT("dns", "ip")) });
  const pk = prog(t, WT("dns", "phone") - 0.4, WT("dns", "phone") + 0.6);
  const dk = pop(t, WT("dns", "domain") - 0.1);
  if (dk > 0) {
    popIn(1400, 560, dk, () => {
      phonebook(0, 0, 0.85, pk > 0.2 ? 1 : 0, [["wikipedia.org", "208.80.154.224"], ["yourbank.example", "203.0.113.7"], ["catvideos.example", "198.51.100.23"], ["…", "…"]], { rowK: prog(t, WT("dns", "phone"), WT("dns", "phone") + 1.2) });
    });
    label("DOMAIN NAME SYSTEM (DNS)", 1400, 180, { size: 38, k: dk });
    if (pk > 0.3) label("= the internet's phone book", 1400, 950, { size: 34, k: pop(t, WT("dns", "phone")) });
  }
}

function serverTower(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); boil(141, 0.5);
  cut(rect(-90, -180, 180, 360, 12), P.steel, { lw: 5 });
  for (let i = 0; i < 5; i++) { cut(rect(-70, -160 + i * 64, 140, 44, 6), P.steel2, { lw: 3, shadow: false }); cut(circ(50, -138 + i * 64, 7), Math.floor(T * 4 + i) % 3 ? "#8fe07a" : "#e0c35a", { lw: 2, shadow: false }); }
  ctx.restore();
}
function hacker(x, y, s, k) {
  person({ x, y, s, id: 5, shirt: "#2d2b2a", skin: "#d8b28e", hairStyle: 2, hair: "#2d2b2a", mood: "flat", hold: () => {
    cut(() => { ctx.arc(0, -262, 48, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(44, -205); ctx.lineTo(-44, -205); ctx.closePath(); }, "#2d2b2a", { lw: 4, shadow: false });
    cut(rect(-30, -266, 60, 22, 8), P.ink, { lw: 0, shadow: false });
    cut(circ(-12, -255, 5), "#fff", { lw: 0, shadow: false }); cut(circ(12, -255, 5), "#fff", { lw: 0, shadow: false });
  } });
}
function sceneSpoof(t) {
  paperBG();
  const t0 = PS("spoof"), tr = WT("spoof", "trusted"), hk = WT("spoof", "hacker"), bk = WT("spoof", "bank"), e8 = WT("spoof", "eight");
  const race = t < e8 - 0.3;
  const fade = 1 - prog(t, e8 - 0.5, e8 - 0.1);
  withAlpha(fade, () => {
    laptop(380, 880, 0.95, { screen: () => {
      browser("yourbank.example", 1);
      if (t > bk - 0.2) { // the fake bank
        cut(poly([[-110, -120], [0, -190], [110, -120]]), "#c9b27f", { lw: 3, shadow: false });
        for (let i = 0; i < 4; i++) cut(rect(-95 + i * 55, -118, 26, 80, 2), "#e8d9b4", { lw: 3, shadow: false });
        cut(rect(-110, -40, 220, 12), "#c9b27f", { lw: 3, shadow: false });
        text("totally real bank", 0, -60 - 150, { font: "Elite", size: 20, color: P.red });
      }
    } });
    serverTower(1560, 470, 0.9);
    label("REAL DNS SERVER", 1560, 250, { size: 30, k: pop(t, t0 + 0.2) });
    const hkK = pop(t, hk - 0.3);
    if (hkK > 0) { popIn(1560, 1040, hkK, () => hacker(0, 0, 0.8)); }
    // racing answers
    const legit = prog(t, tr, hk + 2.6), fake = prog(t, hk + 0.4, hk + 1.4);
    if (t > tr && legit < 1) envelope(lerp(1450, 560, eio(legit)), lerp(470, 640, eio(legit)), 0.6, 0, { text: "REAL" });
    if (t > hk + 0.4 && fake < 1) envelope(lerp(1450, 560, eio(fake)), lerp(880, 690, eio(fake)), 0.6, 0.1, { text: "FAKE", col: "#f2c9c0" });
    if (fake >= 1) label("FIRST ANSWER WINS", 560, 560, { size: 34, k: pop(t, hk + 1.4), bg: "#f2c9c0" });
  });
  if (!race || t > e8 - 0.5) {
    const k = pop(t, e8 - 0.3);
    popIn(560, 520, k, () => calendarPage(0, 0, 1.0, "YEAR", "2008", null, { id: 145 }));
    label("DAN KAMINSKY FINDS A FLAW", 560, 820, { size: 34, k: pop(t, WT("spoof", "kaminsky")) });
    // difficulty meter
    const mk = pop(t, WT("spoof", "showed") - 0.2);
    popIn(1330, 600, mk, () => {
      cut(() => { ctx.arc(0, 0, 260, Math.PI, 0); ctx.closePath(); }, P.card, { lw: 5 });
      const segs = [P.red, P.orange, P.yellow, P.green];
      segs.forEach((c, i) => cut(() => { ctx.arc(0, 0, 230, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); ctx.arc(0, 0, 150, Math.PI + (i + 1) * Math.PI / 4, Math.PI + i * Math.PI / 4, true); ctx.closePath(); }, c, { lw: 3, shadow: false }));
      const ne = eio(prog(t, WT("spoof", "much") - 0.1, WT("spoof", "easier") + 0.3));
      const a = Math.PI * (1.9 - ne * 0.8);
      stroke2(() => { ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 210, Math.sin(a) * 210); }, P.ink, 10, 12);
      cut(circ(0, 0, 18), P.ink, { lw: 0 });
      text("EASY", -250, 60, { size: 40 }); text("HARD", 250, 60, { size: 40 });
      text("HOW HARD IS THIS ATTACK?", 0, 130, { font: "Elite", size: 34 });
    });
  }
}

// ---------------- DNSSEC chain of trust ----------------
function nodeBox(x, y, str, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(back(k), back(k));
  const w = Math.max(230, tw(str, o.size || 54) + 70);
  cut(rect(-w / 2, -58, w, 116, 16), o.col || P.card, { lw: 5, sx: 7, sy: 9 });
  text(str, 0, 20, { size: o.size || 54, color: o.tc || P.ink });
  if (o.seal) { ctx.save(); ctx.translate(w / 2 - 10, -50); ctx.scale(0.55, 0.55); cut(() => smooth(Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.283, r = i % 2 ? 36 : 42; return [Math.cos(a) * r, Math.sin(a) * r]; })), P.red, { lw: 3 }); check(0, 0, 0.6, P.card); ctx.restore(); }
  ctx.restore();
}
function drawTree(t) {
  const c0 = WT("dnssec", "every", 1), v0 = WT("dnssec", "vouched", 0), v1 = WT("dnssec", "vouched", 1), rt = WT("dnssec", "root");
  const sib = prog(t, c0, c0 + 0.6);
  nodeBox(1300, 880, "wikipedia.org", pop(t, c0 - 0.1), { seal: 1 });
  withAlpha(0.45 * sib, () => { nodeBox(880, 880, "school.org", 1); nodeBox(1720, 880, "charity.org", 1); });
  nodeBox(1300, 560, ".org", pop(t, v0 - 0.1), { seal: 1 });
  withAlpha(0.45 * prog(t, v0, v0 + 0.6), () => { nodeBox(860, 560, ".com", 1); nodeBox(1740, 560, ".net", 1); });
  arrow(1300, 490, 1300, 505, 0); // placeholder no-op keeps call order stable
  if (t > v0) { arrow(1300, 625, 1300, 800, eio(prog(t, v0, v0 + 0.5)), P.green2); label("vouches for", 1420, 715, { size: 28, align: "left", k: pop(t, v0 + 0.2) }); }
  nodeBox(1300, 240, "THE ROOT  ( . )", pop(t, rt - 0.2), { col: P.navy, tc: P.card, seal: 1 });
  if (t > v1) { arrow(1300, 305, 1300, 480, eio(prog(t, v1, v1 + 0.5)), P.green2); label("vouches for", 1420, 395, { size: 28, align: "left", k: pop(t, v1 + 0.2) }); }
}
function sceneDNSSEC(t) {
  graphPaper();
  const sg = WT("dnssec", "signature"), c0 = WT("dnssec", "every", 1);
  const slide = eio(prog(t, c0 - 0.3, c0 + 0.5));
  envelope(lerp(960, 420, slide), 540, lerp(1.9, 1.3, slide), -0.04, { text: "wikipedia.org → 208.80.154.224", size: 15, seal: prog(t, sg, sg + 0.35) });
  label("DNSSEC", lerp(960, 420, slide), 250, { size: 50, k: pop(t, PS("dnssec") + 0.2) });
  label("TAMPER-PROOF SEAL", lerp(960, 420, slide), 820, { size: 34, k: pop(t, WT("dnssec", "seal")) });
  drawTree(t);
}
function sceneRoot(t) {
  graphPaper();
  const t0 = PS("root"), n = WT("root", "nobody");
  const z = eio(prog(t, t0 - 0.2, t0 + 1.4));
  ctx.save(); ctx.translate(960, lerp(540, 620, z)); ctx.scale(lerp(1, 1.5, z), lerp(1, 1.5, z)); ctx.translate(-lerp(960, 1300, z), -lerp(540, 240, z));
  drawTree(t + 100); // fully built
  if (t > n - 0.2) {
    ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.strokeRect(1180, 30, 240, 100); ctx.restore();
    popIn(1300, 80, pop(t, n - 0.2), () => text("?", 0, 30, { size: 120, color: P.red }));
  }
  const pl = WT("root", "very", 1);
  for (let i = 0; i < 6; i++) {
    const k = prog(t, pl + i * 0.12, pl + 0.3 + i * 0.12);
    if (k > 0) padlock(1110 + i * 76, lerp(-300, 225, eout(k)), 0.42, 0, [P.yellow, P.steel3, P.orange][i % 3]);
  }
  ctx.restore();
  label("NOTHING ABOVE IT", 960, 90, { size: 38, k: pop(t, WT("root", "there's")) });
  label("TAKEN ON FAITH", 1500, 760, { size: 44, k: pop(t, WT("root", "faith")), bg: P.yellow });
}

// ---------------- HSM ----------------
function sceneHSM(t) {
  desk("#5c4636");
  const t0 = PS("hsm"), wipe = WT("hsm", "wipe"), back2 = WT("hsm", "there") - 0.3;
  const xr = prog(t, WT("hsm", "lives") - 0.2, WT("hsm", "lives") + 0.4);
  const erased = t > wipe + 0.35 && t < back2;
  const bar = prog(t, wipe - 0.4, wipe + 0.3);
  const shake = t > wipe + 0.2 && t < wipe + 0.6 ? (rnd(Math.floor(t * 40), 3) - 0.5) * 14 : 0;
  hsm(960 + shake, 540, 1.6, { xray: erased ? 0 : xr, screen: erased ? "TAMPER! WIPED" : "KSK OK", screenCol: erased ? "#ff7a6a" : "#9fe3a8" });
  if (bar > 0 && t < back2) { // crowbar
    ctx.save(); ctx.translate(lerp(1800, 1330, eout(bar)), lerp(200, 420, eout(bar))); ctx.rotate(-0.7 + (t > wipe + 0.2 ? 0.25 : 0));
    stroke2(() => { ctx.moveTo(0, -200); ctx.lineTo(0, 150); ctx.quadraticCurveTo(0, 190, -40, 190); }, P.red, 22, 32); ctx.restore();
  }
  label("KEY SIGNING KEY", 960, 190, { size: 44, k: pop(t, WT("hsm", "key", 1)), bg: P.yellow });
  label("HARDWARE SECURITY MODULE", 960, 930, { size: 40, k: pop(t, WT("hsm", "hardware")) });
}
function sceneHSMMap(t) {
  sea();
  const pr = usProj(960, 560, 30);
  cut(() => mapPath(USA, pr), P.land, { lw: 4, sx: 10, sy: 12, sb: 10 });
  const es = pr(-118.42, 33.92), cu = pr(-78.0, 38.47);
  const k0 = WT("hsm", "copies");
  popIn(es[0], es[1] - 40, pop(t, k0 - 0.1), () => hsm(0, 0, 0.35, { xray: 1 }));
  popIn(cu[0], cu[1] - 40, pop(t, k0 + 0.2), () => hsm(0, 0, 0.35, { xray: 1 }));
  const fk = prog(t, WT("hsm", "four") - 0.4, WT("hsm", "four") + 0.6);
  if (fk > 0) {
    ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = P.red; ctx.lineWidth = 7; ctx.beginPath();
    const mx = (es[0] + cu[0]) / 2, my = Math.min(es[1], cu[1]) - 260;
    for (let i = 0; i <= 40 * fk; i++) { const u = i / 40, x = (1 - u) * (1 - u) * es[0] + 2 * (1 - u) * u * mx + u * u * cu[0], y = (1 - u) * (1 - u) * (es[1] - 80) + 2 * (1 - u) * u * my + u * u * (cu[1] - 80); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    label("4,000+ KM APART", 960, 200, { size: 44, k: pop(t, WT("hsm", "four")) });
  }
  stamp("NEVER LEAVES", 960, 900, t - WT("hsm", "never"), { size: 90, rot: -0.06 });
}

// ---------------- smartcards in bags in boxes in a safe ----------------
function sceneNest(t) {
  graphPaper();
  const t0 = PS("cards"), sb = WT("cards", "sealed"), db = WT("cards", "safedeposit"), sf = WT("cards", "safe");
  // camera: zoom out through the nesting
  const z = t < sb ? 3.2 : t < db ? lerp(3.2, 1.9, eio(prog(t, sb - 0.2, sb + 0.6))) : t < sf ? lerp(1.9, 1.15, eio(prog(t, db - 0.2, db + 0.6))) : lerp(1.15, 0.72, eio(prog(t, sf - 0.2, sf + 0.7)));
  ctx.save(); ctx.translate(960, 560); ctx.scale(z, z); ctx.translate(-960, -560);
  const sk = pop(t, sf - 0.2, 0.5);
  if (sk > 0) withAlpha(clamp(sk), () => safe(960, 560, 1.55, 1, { inside: "#2a2724" }));
  const dk = pop(t, db - 0.2, 0.5);
  if (dk > 0) popIn(960, 600, dk, () => { cut(rect(-190, -150, 380, 300, 10), P.steel3, { lw: 5 }); cut(rect(-160, -120, 320, 240, 8), "#3a3632", { lw: 3, shadow: false }); cut(circ(120, -100, 12), P.steel, { lw: 3, shadow: false }); cut(circ(-120, -100, 12), P.steel, { lw: 3, shadow: false }); });
  const bk = pop(t, sb - 0.2, 0.5);
  if (bk > 0) popIn(960, 600, bk * 0.62, () => tebag(0, 0, 1, 0, {}));
  smartcard(960, 590, 0.62, -0.05, "#f0e6d0");
  ctx.restore();
  label("SMARTCARD", 960, 170, { size: 40, k: pop(t, t0 + 0.3) * (t < sb ? 1 : 0) });
  label("IN A TAMPER-EVIDENT BAG", 960, 170, { size: 40, k: t >= sb && t < db ? pop(t, sb) : 0 });
  label("IN A SAFE-DEPOSIT BOX", 960, 170, { size: 40, k: t >= db && t < sf ? pop(t, db) : 0 });
  label("IN A SAFE", 960, 170, { size: 40, k: t >= sf ? pop(t, sf) : 0 });
}
function sceneTwoKeys(t) {
  graphPaper();
  const tw0 = WT("cards", "two"), ic = WT("cards", "icann"), co = WT("cards", "crypto");
  popIn(960, 560, pop(t, tw0 - 0.5, 0.45), () => {
    cut(rect(-420, -260, 840, 520, 16), P.steel3, { lw: 6, sx: 10, sy: 14 });
    cut(rect(-380, -220, 760, 440, 10), "#b8b5aa", { lw: 3, shadow: false });
    for (const kx of [-200, 200]) { cut(circ(kx, 0, 60), P.steel2, { lw: 5, shadow: false }); cut(() => { ctx.arc(kx, -10, 14, 0, 7); ctx.rect(kx - 6, -10, 12, 40); }, P.ink, { lw: 0, shadow: false }); }
  });
  const k1 = eout(prog(t, ic - 0.4, ic + 0.3)), k2 = eout(prog(t, co - 0.4, co + 0.3));
  if (k1 > 0) keyShape(lerp(-200, 760 - 90, k1), 560 - 90 * 0 - 10 + (1 - k1) * -100, 0.9, 0, P.yellow);
  if (k2 > 0) keyShape(lerp(2100, 1160 - 90, k2), 560 - 10 + (1 - k2) * -100, 0.9, 0, P.orange);
  label("ICANN", 760, 280, { size: 48, k: pop(t, ic) });
  label("CRYPTO OFFICER", 1160, 280, { size: 48, k: pop(t, co), bg: P.yellow });
  label("BOTH KEYS NEEDED", 960, 920, { size: 38, k: pop(t, co + 0.8) });
}

// ---------------- the people ----------------
const SPOTS = [[-122, 47], [-99, 19], [-46, -23], [-74, 42], [-0.1, 51], [3, 46], [13, 52], [18, 60], [36, -1], [31, 30], [77, 26], [103, 1], [139, 36], [151, -33]];
const RSPOTS = [[-79, 44], [-58, -34], [10, 60], [28, -26], [55, 25], [120, 30], [174, -40]];
function sceneWorld(t) {
  sea();
  const pr = worldProj(960, 560, 5);
  cut(() => mapPath(WORLD, pr), P.land, { lw: 3, sx: 8, sy: 10, sb: 8 });
  const f0 = WT("officers", "fourteen"), s0 = WT("officers", "seven"), th = WT("officers", "three"), r0 = WT("officers", "seven", 1), fv = WT("officers", "five"), ds = WT("officers", "destroyed");
  SPOTS.forEach(([lo, la], i) => {
    const p = pr(lo, la), col = t > s0 ? (i % 2 ? P.blue : P.orange) : P.purple;
    const hl = t > th && [0, 5, 10].includes(i);
    if (hl) { ctx.save(); ctx.strokeStyle = P.yellow; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(p[0], p[1] - 30, 46 + Math.sin(t * 6) * 4, 0, 7); ctx.stroke(); ctx.restore(); }
    pawn(p[0], p[1], 0.62, col, prog(t, f0 - 0.2 + i * 0.07, f0 + 0.15 + i * 0.07), { id: 300 + i });
  });
  label("14 CRYPTO OFFICERS", 960, 90, { size: 42, k: pop(t, f0) * (t < r0 ? 1 : 0) });
  if (t > s0) { label("7 WEST COAST", 330, 980, { size: 32, k: pop(t, s0), bg: "#f6d3b0" }); label("7 EAST COAST", 720, 980, { size: 32, k: pop(t, s0 + 0.2), bg: "#c9d8ea" }); }
  label("3 MUST SHOW UP", 1290, 980, { size: 34, k: pop(t, th), bg: P.yellow });
  RSPOTS.forEach(([lo, la], i) => {
    const p = pr(lo, la);
    pawn(p[0], p[1], 0.62, P.green, prog(t, r0 - 0.2 + i * 0.07, r0 + 0.15 + i * 0.07), { id: 400 + i });
    const on = t > fv && i < 5;
    if (t > r0 + 0.5) popIn(p[0] + 30, p[1] - 70, pop(t, r0 + 0.5 + i * 0.05), () => cut(() => { ctx.rect(-14, -14, 28, 28); ctx.moveTo(14, 0); ctx.arc(20, 0, 8, 0, 7); }, on ? P.yellow : P.card, { lw: 3, sx: 2, sy: 3 }));
  });
  label("+ 7 RECOVERY KEY SHARE HOLDERS", 960, 90, { size: 42, k: t >= r0 ? pop(t, r0) : 0, bg: "#cfe3c4" });
  label("5 OF 7 NEEDED…", 1640, 980, { size: 32, k: pop(t, fv) });
  label("…ONLY IF EVERY MACHINE IS DESTROYED", 960, 180, { size: 30, k: pop(t, ds - 0.3), bg: "#f2c9c0" });
}
function sceneTwentyOne(t) {
  graphPaper();
  const t0 = PS("twentyone"), n21 = WT("twentyone", "twentyone"), nt = WT("twentyone", "not");
  popIn(620, 380, pop(t, t0 - 0.1), () => { text("7", 0, 100, { size: 300, color: P.grey }); });
  if (t > n21 - 0.3) { const k = prog(t, n21 - 0.3, n21); line(520, 380 + 120, lerp(520, 740, k), lerp(500, 220, k), P.red, 18); }
  popIn(1300, 380, pop(t, n21 - 0.1, 0.45), () => text("21", 0, 100, { size: 300, color: P.red, stroke: 16, ink: P.ink }));
  for (let i = 0; i < 21; i++) {
    const col = i < 14 ? (i % 2 ? P.blue : P.orange) : P.green;
    const x = 380 + (i % 7) * 193, y = 760 + Math.floor(i / 7) * 110;
    pawn(x, y, 0.55, col, prog(t, n21 + i * 0.03, n21 + 0.3 + i * 0.03), { id: 500 + i });
    if (t > nt) popIn(x + 36, y - 60, pop(t, nt + i * 0.03), () => cut(() => { ctx.rect(-10, -10, 20, 20); ctx.moveTo(10, 0); ctx.arc(15, 0, 6, 0, 7); }, P.yellow, { lw: 3, sx: 2, sy: 3 }));
  }
  label("NONE CAN ACT ALONE", 960, 110, { size: 40, k: pop(t, nt + 0.3), bg: P.yellow });
}

// ---------------- the ceremony ----------------
function sceneFacility(t) {
  paperBG("#e9dcc0");
  const t0 = PS("ceremony"), two = WT("ceremony", "two");
  // nested security layers (cross-section)
  const layers = [[80, 140, 1760, 800, "#d7c7a3"], [300, 220, 1320, 640, "#cdbb94"], [520, 300, 880, 480, "#c3ae85"], [740, 380, 440, 320, "#b9a176"]];
  layers.forEach(([x, y, w, h, c], i) => { cut(rect(x, y, w, h, 12), c, { lw: 5, sx: 6, sy: 8 }); cut(rect(x - 12, y + h / 2 - 60, 24, 120, 4), P.steel2, { lw: 3, shadow: false }); cut(circ(x - 32, y + h / 2 - 80, 10), Math.floor(T * 3 + i) % 2 ? "#8fe07a" : P.red, { lw: 2, shadow: false }); });
  text("CEREMONY ROOM", 960, 440, { font: "Elite", size: 30 });
  label("LAYER AFTER LAYER", 960, 80, { size: 40, k: pop(t, WT("ceremony", "layer")) });
  // officers walking inward, one door at a time
  for (let i = 0; i < 3; i++) {
    const k = prog(t, t0 + 0.8 + i * 0.3, two - 0.3 + i * 0.1);
    const x = lerp(-60, 830 + i * 110, eio(k));
    pawn(x, 700 - i * 10, 0.9, [P.orange, P.blue, P.purple][i], 1, { id: 600 + i });
  }
  // two staff tied together to the safe room
  if (t > two - 0.3) {
    cut(rect(1500, 300, 300, 420, 10), "#a8916a", { lw: 5 }); text("SAFE ROOM", 1650, 350, { font: "Elite", size: 30 });
    safe(1650, 560, 0.45, 0);
    const k = eio(prog(t, two - 0.2, two + 1.6));
    const x1 = lerp(1080, 1560, k), x2 = x1 + 80;
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = P.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1 + 18, 640); ctx.quadraticCurveTo(x1 + 40, 670, x2 - 18, 640); ctx.stroke(); ctx.restore();
    pawn(x1, 700, 0.8, P.navy, 1, { id: 610 }); pawn(x2, 700, 0.8, P.navy, 1, { id: 611 });
    label("ALWAYS TOGETHER", 1400, 860, { size: 34, k: pop(t, WT("ceremony", "together")) });
  }
}
function sceneBag(t) {
  desk();
  const t0 = WT("ceremony", "every"), sn = WT("ceremony", "serial"), mo = WT("ceremony", "months");
  popIn(620, 540, pop(t, t0 - 0.3), () => tebag(0, 0, 1.6, -0.05, { serial: "A 5219734", content: () => smartcard(0, -10, 0.9, 0.1) }));
  popIn(1340, 560, pop(t, t0 + 0.2), () => {
    ctx.rotate(0.03);
    cut(rect(-260, -360, 520, 720, 12), "#a47a4f", { lw: 5, sx: 10, sy: 12 });
    cut(rect(-230, -320, 460, 660, 6), P.card, { lw: 3, shadow: false });
    cut(rect(-70, -380, 140, 50, 8), P.steel2, { lw: 4 });
    text("BAG LOG", 0, -250, { font: "Elite", size: 44 });
    ["A 5219730", "A 5219731", "A 5219734", "A 5219738"].forEach((s, i) => {
      const hl = i === 2 && t > sn;
      if (hl) cut(rect(-200, -180 + i * 90, 400, 60, 6), "rgba(242,193,78,0.6)", { lw: 0, shadow: false });
      text(s, -170, -140 + i * 90, { font: "Elite", size: 38, align: "left" });
    });
    if (t > sn + 0.4) check(170, 40, 1.1);
    text("logged months ago", 0, 290, { font: "Elite", size: 28, color: P.brown, alpha: prog(t, mo - 0.4, mo) });
  });
  label("SERIAL NUMBERS MUST MATCH", 960, 100, { size: 38, k: pop(t, sn) });
}
function sceneLaptop(t) {
  graphPaper();
  const lp = WT("ceremony", "laptop"), bt = WT("ceremony", "battery"), hd = WT("ceremony", "hard"), dv = WT("ceremony", "dvd"), sc = WT("ceremony", "script"), fl = WT("ceremony", "filmed"), sl = WT("ceremony", "streamed");
  const phase2 = t > sc - 0.4;
  const lx = lerp(760, 520, eio(prog(t, sc - 0.6, sc)));
  popIn(lx, 820, pop(t, lp - 0.3), () => laptop(0, 0, 1.2, { screenBg: "#1f2a2e", screen: () => { text("root@ceremony:~$", -190, -240, { font: "Elite", size: 22, color: "#9fe3a8", align: "left" }); if (t > dv + 0.5) text("booting from DVD…", -190, -205, { font: "Elite", size: 22, color: "#9fe3a8", align: "left" }); } }));
  withAlpha(1 - prog(t, sc - 0.5, sc - 0.1), () => {
    // battery
    popIn(1380, 260, pop(t, bt - 0.2), () => { cut(rect(-110, -50, 220, 100, 10), P.green, { lw: 5 }); cut(rect(110, -20, 20, 40, 4), P.green, { lw: 4 }); cross(0, 0, 1.4); text("NO BATTERY", 0, 100, { size: 44 }); });
    popIn(1380, 540, pop(t, hd - 0.2), () => { cut(rect(-110, -70, 220, 140, 10), P.steel3, { lw: 5 }); cut(circ(-10, 0, 50), P.steel2, { lw: 4, shadow: false }); cross(0, 0, 1.4); text("NO HARD DRIVE", 0, 120, { size: 44 }); });
    popIn(1380, 820, pop(t, dv - 0.2), () => { ctx.rotate(t * 3); cut(circ(0, 0, 80), "#dfe6ea", { lw: 5 }); cut(circ(0, 0, 18), P.bg, { lw: 4, shadow: false }); ctx.strokeStyle = "rgba(120,160,200,0.6)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 55, 0.3, 1.6); ctx.stroke(); });
    if (t > dv) text("BOOTS FROM A DVD", 1380, 960, { size: 44, alpha: prog(t, dv, dv + 0.3) });
  });
  if (phase2) {
    popIn(1080, 470, pop(t, sc - 0.2), () => { for (let i = 2; i >= 0; i--) { cut(rect(-150 + i * 14, -200 + i * 14, 300, 400, 6), P.card, { lw: 4 }); } for (let r = 0; r < 9; r++) line(-120, -150 + r * 36, 110 - (r % 3) * 30, -150 + r * 36, "rgba(43,35,32,0.5)", 4); text("SCRIPT", 0, -170, { font: "Elite", size: 32 }); });
    popIn(1450, 470, pop(t, fl - 0.2), () => { cut(rect(-110, -70, 190, 140, 14), P.steel, { lw: 5 }); cut(poly([[80, -40], [150, -70], [150, 70], [80, 40]]), P.steel, { lw: 5 }); cut(circ(-15, 0, 44), P.ink, { lw: 4, shadow: false }); cut(circ(-15, 0, 22), "#5d7d9a", { lw: 0, shadow: false }); if (Math.floor(T * 2) % 2) cut(circ(-80, -95, 16), P.red, { lw: 3 }); text("REC", -40, -84, { font: "Elite", size: 28, color: P.red }); });
    popIn(1740, 470, pop(t, sl - 0.2), () => { cut(rect(-110, -50, 220, 100, 14), P.red, { lw: 5 }); text("● LIVE", 0, 20, { size: 58, color: P.card }); text("streamed publicly", 0, 100, { font: "Elite", size: 26 }); });
    label("READ ALOUD · FILMED · STREAMED", 1380, 850, { size: 36, k: pop(t, sl + 0.3) });
  }
}
function sceneSigning(t) {
  paperBG();
  const ins = WT("signing", "insert"), wk = WT("signing", "wakes"), sg = WT("signing", "signs"), th = WT("signing", "that's");
  const slots = [0, 1, 2].map(i => t > ins + i * 0.35 + 0.35);
  hsm(960, 600, 1.7, { slots, screen: t > sg ? "SIGNING…" : t > wk ? "READY" : "LOCKED", screenCol: t > wk ? "#9fe3a8" : "#ff7a6a" });
  for (let i = 0; i < 3; i++) {
    const k = eout(prog(t, ins + i * 0.35 - 0.3, ins + i * 0.35 + 0.35));
    if (k > 0) smartcard(960 + (-150 + i * 110 + 40) * 1.7, lerp(-40, 600 + 18 * 1.7 - 60, k), 0.55, 0, "#f0e6d0");
  }
  for (let i = 0; i < 3; i++) {
    const k = eout(prog(t, sg + 0.4 + i * 0.3, sg + 1.1 + i * 0.3));
    if (k > 0) { const x = lerp(1250, 1560 + i * 40, k), y = lerp(560, 320 + i * 190, k); calendarPage(x, y, 0.42, "MONTH", String(i + 1), null, { col: P.teal, id: 700 + i }); }
  }
  label("NEXT 3 MONTHS OF SIGNATURES", 1560, 960, { size: 32, k: pop(t, WT("signing", "three", 1)) });
  label("THAT'S IT. THAT'S THE RITUAL.", 700, 140, { size: 40, k: pop(t, th), bg: P.yellow });
}
function sceneOdds(t) {
  graphPaper();
  const ds = WT("signing", "designed"), dh = WT("signing", "dishonest"), ml = WT("signing", "million");
  for (let i = 0; i < 20; i++) {
    const x = 260 + (i % 10) * 150, y = 400 + Math.floor(i / 10) * 200;
    const bad = i === 13 && t > dh - 0.2;
    pawn(x, y, 0.8, bad ? P.red : P.teal, prog(t, ds - 0.2 + i * 0.03, ds + 0.2 + i * 0.03), { id: 800 + i });
    if (bad) popIn(x + 30, y - 110, pop(t, dh - 0.2), () => text("!", 0, 0, { size: 60, color: P.red }));
  }
  label("EVEN IF 1 IN 20 WERE DISHONEST…", 960, 150, { size: 40, k: pop(t, dh - 0.3) });
  popIn(960, 850, pop(t, ml - 0.8, 0.45), () => { text("< 1 IN 1,000,000", 0, 40, { size: 130, color: P.yellow, stroke: 14, shadow: true }); });
  label("chance of stealing the key", 960, 990, { size: 32, k: pop(t, ml - 0.3) });
}

// ---------------- when things go wrong ----------------
function sceneLocksmith(t) {
  desk("#5f4a3a");
  const fl = WT("locksmith", "failed"), hk = WT("locksmith", "hacked"), br = WT("locksmith", "broken"), ls = WT("locksmith", "locksmith"), tw2 = WT("locksmith", "two"), rs = WT("locksmith", "rescheduled");
  label("EL SEGUNDO, CA · FEBRUARY 2020", 960, 80, { size: 36, k: pop(t, PS("locksmith") + 1.5) });
  const sx = 760;
  safe(sx, 560, 1.1, 0, { spin: t > fl ? Math.sin(t * 30) * 0.05 : 0 });
  if (t > fl) { // broken lock: spring pops out
    const k = prog(t, fl, fl + 0.4);
    ctx.save(); ctx.strokeStyle = P.steel3; ctx.lineWidth = 6; ctx.beginPath();
    for (let i = 0; i < 30; i++) { const u = i / 29; ctx.lineTo(sx + 40 + u * 160 * k, 560 - u * 120 * k + Math.sin(u * 30) * 14); }
    ctx.stroke(); ctx.restore();
  }
  label("HACKED?", 1360, 300, { size: 44, k: pop(t, hk) }); if (t > hk + 0.2) cross(1520, 300, 0.9);
  label("JUST BROKEN", 1360, 420, { size: 44, k: pop(t, br), bg: P.yellow }); if (t > br + 0.2) check(1580, 420, 0.9);
  if (t > ls - 0.5) {
    const k = eout(prog(t, ls - 0.5, ls + 0.5));
    person({ x: lerp(2100, 1180, k), y: 1000, s: 0.95, dir: -1, id: 13, shirt: "#6e7d8a", mood: "flat", walk: k < 1 ? t * 8 : null, armR: 1.2, hold: () => {
      ctx.save(); ctx.translate(95, -205); cut(rect(-10, -30, 110, 50, 10), P.orange, { lw: 4 }); cut(rect(20, 10, 30, 60, 6), P.orange, { lw: 4 }); line(100, -5, 150, -5, P.steel3, 8); ctx.restore();
    } });
    if (k >= 1) for (let i = 0; i < 8; i++) { const a = rnd(i, Math.floor(t * 12)) * 2 - 1; line(sx + 220, 560, sx + 220 + Math.cos(a) * 70, 560 + Math.sin(a) * 70, P.yellow, 4); }
  }
  if (t > tw2 - 0.3) {
    const hrs = 8 + 40 * eio(prog(t, tw2 - 0.3, tw2 + 1.6));
    clockFace(1560, 740, 120, hrs);
    label("~2 DAYS", 1560, 930, { size: 40, k: pop(t, tw2) });
  }
  stamp("RESCHEDULED", 960, 560, t - rs + 0.1, { size: 120, rot: -0.1 });
  label("FIRST TIME IN 10 YEARS", 960, 1000, { size: 34, k: pop(t, rs + 0.5) });
}
function sceneCovid(t) {
  paperBG("#dfe8e4");
  const gd = WT("covid", "grounded"), ml = WT("covid", "mailed"), vc = WT("covid", "video"), nn = WT("covid", "nine");
  const ph = t < ml - 0.3 ? 0 : t < vc - 0.3 ? 1 : t < nn - 0.3 ? 2 : 3;
  if (ph === 0) {
    popIn(960, 520, pop(t, PS("covid") - 0.2), () => {
      cut(rect(-620, -300, 1240, 600, 14), "#23272a", { lw: 6, sx: 10, sy: 14 });
      text("DEPARTURES", -560, -220, { font: "Elite", size: 48, color: P.yellow, align: "left" });
      ["LOS ANGELES", "WASHINGTON", "LONDON", "TOKYO", "NAIROBI"].forEach((c, i) => {
        text(c, -560, -120 + i * 90, { font: "Elite", size: 44, color: "#f3ead7", align: "left" });
        const k = prog(t, gd - 0.2 + i * 0.12, gd + i * 0.12);
        text(k > 0 ? "CANCELLED" : "ON TIME", 560, -120 + i * 90, { font: "Elite", size: 44, color: k > 0 ? P.red : P.green, align: "right" });
      });
    });
    label("2020", 960, 110, { size: 44, k: pop(t, PS("covid")) });
  } else if (ph === 1) {
    building(1450, 800, 0.8, { id: 150 });
    label("ICANN", 1450, 900, { size: 32, k: 1 });
    for (let i = 0; i < 5; i++) {
      const k = eio(prog(t, ml - 0.3 + i * 0.4, ml + 1.9 + i * 0.4));
      const x = lerp(-150, 1450, k), y = lerp(200 + i * 110, 650, k) - Math.sin(k * Math.PI) * 120;
      if (k < 1 && k > 0) tebag(x, y, 0.35, Math.sin(t * 3 + i) * 0.2, { content: () => keyShape(0, 0, 0.8, 0.4, P.yellow, { hole: "#dce9ee" }), serial: "SEALED" });
    }
    label("KEYS MAILED IN SEALED BAGS", 700, 120, { size: 40, k: pop(t, ml) });
  } else if (ph === 2) {
    popIn(960, 540, pop(t, vc - 0.3), () => {
      cut(rect(-640, -360, 1280, 720, 16), "#2b2f33", { lw: 6, sx: 10, sy: 14 });
      for (let i = 0; i < 6; i++) {
        const x = -420 + (i % 3) * 420, y = -170 + Math.floor(i / 3) * 330;
        cut(rect(x - 190, y - 140, 380, 280, 10), ["#6e8ca0", "#a08c6e", "#7e9a78", "#9a7e9a", "#8a9aa8", "#a8988a"][i], { lw: 3, shadow: false });
        ctx.save(); ctx.beginPath(); ctx.rect(x - 190, y - 140, 380, 280); ctx.clip();
        person({ x, y: y + 300, s: 1.0, id: 900 + i, mood: i === 4 ? "o" : "smile" });
        ctx.restore();
      }
      text("● REC", 540, -310, { font: "Elite", size: 28, color: P.red });
    });
  } else {
    popIn(640, 560, pop(t, nn - 0.3), () => { calendarPage(0, 0, 1.0, "USUAL", "3", "months", { col: P.grey }); });
    if (t > nn + 0.3) cross(640, 560, 2.2);
    popIn(1280, 560, pop(t, nn + 0.1), () => { calendarPage(0, 0, 1.2, "2020", "9", "months", { col: P.teal }); });
    label("SIGNED IN ONE GO", 1280, 900, { size: 38, k: pop(t, nn + 0.5) });
  }
}

// ---------------- can they turn off the internet? ----------------
function sceneSwitch(t) {
  graphPaper();
  const t0 = PS("cant"), no = WT("cant", "no"), on = WT("cant", "only"), tp = WT("cant", "top");
  const p2 = t > on - 0.4;
  if (!p2) {
    popIn(960, 540, pop(t, t0 - 0.2), () => {
      cut(rect(-200, -300, 400, 600, 30), P.card, { lw: 6, sx: 10, sy: 14 });
      cut(rect(-70, -200, 140, 400, 20), "#3a3632", { lw: 4, shadow: false });
      const flip = t > no ? 0 : Math.sin(clamp((t - t0) * 2) * Math.PI) * 0.2;
      cut(rect(-60, -190 + flip * 100, 120, 200, 16), P.steel3, { lw: 4 });
      text("INTERNET", 0, -230, { size: 50 }); text("ON", 0, -270 + 560, { size: 40 });
    });
    const hk = eout(prog(t, t0, t0 + 1.2));
    if (t < no + 0.4) person({ x: lerp(1900, 1450, hk), y: 1060, s: 1.2, dir: -1, id: 14, armR: 1.4 * hk, mood: "o" });
    stamp("NOPE", 960, 540, t - no, { size: 170, rot: -0.12 });
  } else {
    const bk = pop(t, on - 0.3);
    popIn(700, 700, bk, () => building(0, 0, 1.1, { id: 160 }));
    if (t > on) { ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 30; keyShape(700, 610, 0.6, 0, P.yellow); ctx.restore(); check(700, 460, 0.9); }
    if (t > on + 0.5) { keyShape(1350, 610, 0.6, 0.3, P.steel3); cross(1350, 610, 1.2); label("outside: useless", 1350, 760, { size: 32, k: pop(t, on + 0.5) }); }
    label("KEYS ONLY WORK INSIDE", 960, 140, { size: 40, k: pop(t, on) });
    label("AND ONLY PROTECT THE TOP OF THE PHONE BOOK", 960, 950, { size: 34, k: pop(t, tp - 0.2), bg: P.yellow });
  }
}
function sceneRecovery(t) {
  paperBG();
  const vn = WT("cant", "vanished"), by = WT("cant", "buy"), bu = WT("cant", "backups"), an = WT("cant", "annoying"), ap = WT("cant", "apocalyptic");
  for (let i = 0; i < 4; i++) { const k = prog(t, vn, vn + 0.5); if (k < 1) keyShape(360 + i * 120, 300, 0.45, 0.2, P.yellow); puff(360 + i * 120, 300, 40 + k * 30, k > 0 ? 1 - k : 0); }
  label("KEYS GONE?", 540, 150, { size: 38, k: pop(t, vn - 0.3) });
  popIn(1000, 420, pop(t, by - 0.2), () => { // shopping cart with a new HSM
    stroke2(() => { ctx.moveTo(-220, -140); ctx.lineTo(-170, -140); ctx.lineTo(-120, 60); ctx.lineTo(170, 60); ctx.lineTo(200, -80); ctx.lineTo(-150, -80); }, P.steel2, 10, 16);
    cut(circ(-90, 110, 22), P.ink, { lw: 0 }); cut(circ(140, 110, 22), P.ink, { lw: 0 });
    hsm(30, -40, 0.38, {});
  });
  label("BUY A NEW MACHINE", 1000, 620, { size: 34, k: pop(t, by) });
  popIn(1560, 420, pop(t, bu - 0.2), () => { cut(rect(-150, -110, 300, 220, 12), P.navy, { lw: 5 }); padlock(0, 10, 0.8, 0, P.yellow); });
  label("RESTORE FROM ENCRYPTED BACKUP", 1560, 620, { size: 30, k: pop(t, bu) });
  label("ANNOYING? VERY.", 640, 880, { size: 60, k: pop(t, an), rot: -0.03 });
  label("APOCALYPTIC? NO.", 1300, 880, { size: 60, k: pop(t, ap), rot: 0.03, bg: P.yellow });
}

// ---------------- changing the locks ----------------
function sceneTimeline(t) {
  paperBG();
  const ev = [
    [2010, WT("rollover", "ten"), "FIRST ROOT KEY", P.yellow],
    [2017, WT("rollover", "seventeen"), "PLANNED SWITCH", P.grey],
    [2018, WT("rollover", "eighteen"), "OCT 11: SWITCHED", P.green],
    [2024, WT("rollover", "twentyfour"), "NEW KEY MADE", P.orange],
    [2026, WT("rollover", "twentysix"), "OCT 11: TAKES OVER", P.red],
  ];
  const yx = y => 300 + (y - 2010) * 150; // world x
  // camera follows the latest event
  const cur = ev.reduce((a, e) => (t > e[1] - 0.6 ? e : a), ev[0]);
  const target = clamp(yx(cur[0]) - 960, 0, yx(2026) + 260 - W);
  let camx = 0; for (let i = 0; i < ev.length; i++) { const tx = clamp(yx(ev[i][0]) - 960, 0, yx(2026) + 260 - W); camx = lerp(camx, tx, eio(prog(t, ev[i][1] - 0.8, ev[i][1]))); }
  void target;
  ctx.save(); ctx.translate(-camx, 0);
  stroke2(() => { ctx.moveTo(150, 620); ctx.lineTo(yx(2026) + 200, 620); }, P.ink, 8, 12);
  for (let y = 2010; y <= 2026; y++) { line(yx(y), 600, yx(y), 640, P.ink, 5); if ([2010, 2017, 2018, 2024, 2026].includes(y) || y % 2 === 0) text(String(y), yx(y), 690, { font: "Elite", size: y % 2 ? 26 : 30 }); }
  ev.forEach(([y, tt, lab, col], i) => {
    const k = pop(t, tt - 0.3);
    if (k <= 0) return;
    const up = i % 2 === 0;
    popIn(yx(y), up ? 400 : 850, k, () => {
      if (y === 2026) calendarPage(0, -20, 0.75, "OCTOBER", "11", "2026", { id: 1000 });
      else keyShape(0, 0, 0.8, -0.2, col, { hole: P.bg });
    });
    line(yx(y), up ? 470 : 740, yx(y), up ? 600 : 640, P.ink, 4, [8, 8]);
    label(lab, yx(y), up ? 230 : 1010, { size: 32, k, bg: y === 2026 ? P.yellow : P.card });
  });
  stamp("POSTPONED", yx(2017), 860, t - WT("rollover", "delayed"), { size: 70, rot: -0.15 });
  label("too many systems weren't ready", yx(2017) + 440, 860, { size: 26, k: pop(t, WT("rollover", "ready")) });
  ctx.restore();
}

// ---------------- close ----------------
function sceneClose(t) {
  paperBG();
  const t0 = PS("close"), nt = WT("close", "notice"), nb = WT("close", "nobody"), bt = WT("close", "but");
  if (t < bt - 0.3) {
    for (let i = 0; i < 3; i++) {
      popIn(420 + i * 540, 820, pop(t, t0 - 0.1 + i * 0.15), () => {
        person({ x: 0, y: 0, s: 1.0, id: 40 + i, hold: () => { cut(rect(40, -200, 60, 100, 10), "#2b2f33", { lw: 4 }); cut(rect(46, -192, 48, 80, 4), "#9fc4c0", { lw: 0, shadow: false }); } });
        if (t > t0 + 1 + i * 0.3) { cut(ell(0, -420, 120, 70), P.card, { lw: 4 }); check(0, -420, 1.0); }
      });
    }
    label("YOU WON'T NOTICE A THING", 960, 120, { size: 44, k: pop(t, nt - 0.2), bg: P.yellow });
    if (t > nb - 0.2) label("NO OFF SWITCH", 960, 230, { size: 36, k: pop(t, nb) });
  } else {
    const items = [["fly", "FLY ACROSS THE WORLD"], ["scan", "SCAN THEIR EYEBALLS"], ["script", "READ A SCRIPT ALOUD"], ["safe", "NEXT TO A SAFE"]];
    items.forEach(([w, lab], i) => {
      const tt = WT("close", w);
      popIn(270 + i * 460, 470, pop(t, tt - 0.3), () => {
        cut(rect(-200, -220, 400, 440, 16), P.card, { lw: 5, sx: 8, sy: 10 });
        if (i === 0) plane(0, -20, 1.1, -0.2, P.card);
        if (i === 1) { cut(() => { ctx.moveTo(-140, 0); ctx.quadraticCurveTo(0, -120, 140, 0); ctx.quadraticCurveTo(0, 120, -140, 0); ctx.closePath(); }, "#fffaf0", { lw: 5 }); cut(circ(0, 0, 55), P.teal, { lw: 4, shadow: false }); cut(circ(0, 0, 25), P.ink, { lw: 0, shadow: false }); line(-160, -60 + ((T * 1.4) % 1) * 120, 160, -60 + ((T * 1.4) % 1) * 120, "rgba(230,40,30,0.8)", 5); }
        if (i === 2) { for (let j = 2; j >= 0; j--) cut(rect(-110 + j * 12, -150 + j * 12, 220, 300, 6), P.card, { lw: 4 }); for (let r = 0; r < 7; r++) line(-90, -110 + r * 36, 80 - (r % 3) * 30, -110 + r * 36, "rgba(43,35,32,0.5)", 4); }
        if (i === 3) safe(0, 0, 0.55, 0);
        text(lab, 0, 280, { size: 34 });
      });
    });
    const ek = prog(t, PE("close") + 0.2, PE("close") + 0.8);
    if (ek > 0) {
      ctx.save(); ctx.globalAlpha = ek; paperBG(); ctx.restore();
      popIn(960, 420, back(ek), () => {
        text("THE KEYS TO", 0, -40, { size: 120, stroke: 14, color: P.card, shadow: true });
        text("THE INTERNET*", 0, 100, { size: 140, stroke: 14, color: P.yellow, shadow: true });
      });
      label("*sort of", 1350, 620, { size: 40, k: ek, rot: -0.05 });
      label("NEXT ROOT KEY CHANGE: 11 OCTOBER 2026", 960, 820, { size: 38, k: ek, bg: P.yellow });
    }
  }
}

// ---------------- scene list ----------------
function SCENES() {
  return [
    ["arrive", 0, sceneArrive],
    ["usmap", WT("cold", "one", 1) - 0.25, sceneUSMap],
    ["security", WT("cold", "they", 0) - 0.3, sceneSecurity],
    ["safe", WT("cold", "they", 3) - 0.3, sceneSafe],
    ["title", PS("sortof") - 0.25, sceneTitle],
    ["headline", PS("myth") - 0.3, sceneHeadline],
    ["questions", WT("myth", "so") - 0.3, sceneQuestions],
    ["dns", PS("dns") - 0.3, sceneDNS],
    ["spoof", PS("spoof") - 0.3, sceneSpoof],
    ["dnssec", PS("dnssec") - 0.3, sceneDNSSEC],
    ["root", PS("root") - 0.1, sceneRoot, "cut"],
    ["hsm", PS("hsm") - 0.3, sceneHSM],
    ["hsmmap", WT("hsm", "copies") - 0.35, sceneHSMMap],
    ["nest", PS("cards") - 0.3, sceneNest],
    ["twokeys", WT("cards", "every") - 0.3, sceneTwoKeys],
    ["world", PS("officers") - 0.3, sceneWorld],
    ["twentyone", PS("twentyone") - 0.25, sceneTwentyOne],
    ["facility", PS("ceremony") - 0.3, sceneFacility],
    ["bag", WT("ceremony", "every") - 0.35, sceneBag],
    ["laptop", WT("ceremony", "laptop") - 0.35, sceneLaptop],
    ["signing", PS("signing") - 0.3, sceneSigning],
    ["odds", WT("signing", "designed") - 0.35, sceneOdds],
    ["locksmith", PS("locksmith") - 0.3, sceneLocksmith],
    ["covid", PS("covid") - 0.3, sceneCovid],
    ["switch", PS("cant") - 0.3, sceneSwitch],
    ["recovery", WT("cant", "and", 0) - 0.3, sceneRecovery],
    ["timeline", PS("rollover") - 0.3, sceneTimeline],
    ["close", PS("close") - 0.3, sceneClose],
  ];
}
const SC_CACHE = { list: null };
function render(t) {
  if (!SC_CACHE.list) SC_CACHE.list = SCENES();
  composite(t, SC_CACHE.list);
}

// ---------------- sound cues ----------------
function sfxCues() {
  const cues = [], add = (t, type, o = {}) => cues.push({ t: +t.toFixed(3), type, ...o });
  const sc = SCENES(); sc.slice(1).forEach(s => add(s[1], s[3] === "cut" ? "tick" : "whoosh"));
  const W_ = (p, w, n = 0, type = "pop", o = {}) => add(WT(p, w, n), type, o);
  W_("cold", "boringlooking", 0, "pop"); W_("cold", "el", 0, "pop"); W_("cold", "culpeper", 0, "pop", { pitch: 1.2 });
  W_("cold", "pin", 0, "beep"); W_("cold", "smartcard", 0, "beep", { pitch: 1.2 }); W_("cold", "hand", 0, "scan"); W_("cold", "eye", 0, "scan");
  add(WT("cold", "open"), "clunk"); add(WT("cold", "open") + 0.3, "creak"); add(WT("cold", "keys") - 0.2, "shimmer");
  add(WT("sortof", "sort"), "stamp"); W_("sortof", "two", 0, "pop"); W_("sortof", "changing", 0, "click");
  add(PS("myth") - 0.1, "paper"); W_("myth", "fantastic", 0, "shimmer"); add(WT("myth", "wrong"), "stamp");
  W_("myth", "really", 0, "pop"); W_("myth", "who", 0, "pop", { pitch: 1.1 }); W_("myth", "loses", 0, "pop", { pitch: 1.2 });
  for (let i = 0; i < 13; i++) add(PS("dns") + 0.2 + i * 0.09, "type");
  W_("dns", "means", 0, "pop"); W_("dns", "number", 0, "ding"); W_("dns", "phone", 0, "paper");
  W_("spoof", "trusted", 0, "whoosh"); add(WT("spoof", "hacker") + 0.4, "zip"); W_("spoof", "bank", 0, "buzz"); W_("spoof", "eight", 0, "pop");
  add(WT("spoof", "much") - 0.1, "slide");
  W_("dnssec", "signature", 0, "stamp", { soft: 1 }); W_("dnssec", "vouched", 0, "pop"); W_("dnssec", "vouched", 1, "pop", { pitch: 1.2 }); W_("dnssec", "root", 0, "ding");
  W_("root", "nobody", 0, "pop"); for (let i = 0; i < 6; i++) add(WT("root", "very", 1) + 0.3 + i * 0.12, "clunk", { soft: 1 });
  W_("hsm", "lives", 0, "shimmer"); W_("hsm", "wipe", 0, "alarm"); W_("hsm", "four", 0, "slide"); add(WT("hsm", "never"), "stamp");
  W_("cards", "sealed", 0, "paper"); W_("cards", "safedeposit", 0, "clunk", { soft: 1 }); W_("cards", "safe", 0, "clunk");
  W_("cards", "icann", 0, "click"); W_("cards", "crypto", 0, "click");
  for (let i = 0; i < 14; i++) add(WT("officers", "fourteen") - 0.1 + i * 0.07, "tick");
  W_("officers", "three", 0, "ding"); for (let i = 0; i < 7; i++) add(WT("officers", "seven", 1) - 0.1 + i * 0.07, "tick");
  W_("twentyone", "twentyone", 0, "stamp");
  W_("ceremony", "together", 0, "pop"); W_("ceremony", "serial", 0, "ding"); W_("ceremony", "battery", 0, "buzz"); W_("ceremony", "hard", 0, "buzz"); W_("ceremony", "dvd", 0, "slide");
  W_("ceremony", "filmed", 0, "click"); W_("ceremony", "streamed", 0, "ding");
  for (let i = 0; i < 3; i++) add(WT("signing", "insert") + i * 0.35 + 0.35, "click");
  W_("signing", "wakes", 0, "boot"); W_("signing", "million", 0, "stamp", { soft: 1 });
  W_("locksmith", "failed", 0, "boing"); W_("locksmith", "locksmith", 0, "drill", { dur: 2.4 }); add(WT("locksmith", "rescheduled"), "stamp");
  for (let i = 0; i < 5; i++) add(WT("covid", "grounded") + i * 0.12, "flap");
  W_("covid", "mailed", 0, "whoosh"); W_("covid", "video", 0, "ding"); W_("covid", "nine", 0, "pop");
  add(WT("cant", "no"), "stamp"); W_("cant", "vanished", 0, "poof"); W_("cant", "buy", 0, "ding"); W_("cant", "apocalyptic", 0, "pop");
  add(WT("rollover", "delayed"), "stamp"); W_("rollover", "twentysix", 0, "shimmer");
  W_("close", "notice", 0, "pop"); add(PE("close") + 0.2, "shimmer");
  return cues;
}
window.render = render;
window.sfxCues = sfxCues;
window.SCENES_LIST = () => SCENES().map(s => [s[0], s[1]]);

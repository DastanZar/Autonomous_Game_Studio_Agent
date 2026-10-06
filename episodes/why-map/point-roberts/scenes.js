// Point Roberts v2: a bespoke paper diorama. Loaded after the engine (core.js, props.js, scenes/*.js), so it
// uses the engine's helpers (cut, smooth, stroke2, text, tag, stamp, rnd, prog, eout, back, cue, P, W, H...).
// Every frame is a pure function of t. Every map shape comes from build/geo.json (Natural Earth + OSM coastline).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const at = c => cue(c);                                   // "para/word#n" -> seconds
const sinceAt = (t, c) => t - cue(c);
const pp = (t, a, d) => clamp((t - a) / d);               // progress over d seconds from a
const ease2 = k => k * k * (3 - 2 * k);

// ---------- palette for this world ----------
const C = {
  sky: "#f3e3c3", sky2: "#e9cf9f", sun: "#f4cf6b", cloud: "#fbf3e2",
  mtn: "#8fa3a6", mtn2: "#7a9093", snow: "#f4efe4", sea: "#a9c7c2", sea2: "#95b7b2",
  grass: "#9fb36c", grass2: "#86a05a", soil: "#b98d5c", soil2: "#9c7246", road: "#6b665e", road2: "#59544d",
  pine: "#4f7350", pine2: "#3f5f41", wood: "#8a5a3a", wood2: "#744a2f", wood3: "#a06b45",
  us: "#e08a3c", ca: "#ecd9ae", caR: "#d52b1e", usR: "#b8322a", usB: "#2f3f6e", white: "#fff8ea",
  parch: "#ead7ab", parch2: "#dcc290", brick: "#b5674a", steel: "#7b7d7a",
};

// ---------- flags (typeset in code; waving = drawn in vertical slices) ----------
const FLAGIMG = {};
function mapleLeaf(g, cx, cy, s) {
  const L = [[0,-1],[.12,-.78],[.3,-.86],[.22,-.42],[.46,-.64],[.54,-.5],[.78,-.58],[.68,-.32],[.84,-.24],[.48,.04],[.55,.18],[.08,.12],[.07,.55],[-.07,.55],[-.08,.12],[-.55,.18],[-.48,.04],[-.84,-.24],[-.68,-.32],[-.78,-.58],[-.54,-.5],[-.46,-.64],[-.22,-.42],[-.3,-.86],[-.12,-.78]];
  g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s)); g.closePath();
}
function flagImage(kind) {
  if (FLAGIMG[kind]) return FLAGIMG[kind];
  const c = document.createElement("canvas"), w = 380, h = 200; c.width = w; c.height = h;
  const g = c.getContext("2d");
  if (kind === "US") {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? C.white : C.usR; g.fillRect(0, i * h / 13, w, h / 13 + 1); }
    g.fillStyle = C.usB; g.fillRect(0, 0, w * 0.4, h * 7 / 13);
    g.fillStyle = C.white;
    for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) { g.beginPath(); g.arc(12 + k * 25 + (r % 2 ? 12 : 0), 9 + r * 11.5, 3.4, 0, 7); g.fill(); }
  } else {
    g.fillStyle = C.caR; g.fillRect(0, 0, w, h); g.fillStyle = C.white; g.fillRect(w / 4, 0, w / 2, h);
    g.fillStyle = C.caR; mapleLeaf(g, w / 2, h * 0.52, h * 0.4); g.fill();
    g.fillRect(w / 2 - 4, h * 0.6, 8, h * 0.2);
  }
  return (FLAGIMG[kind] = c);
}
// a waving flag whose hoist is at (x, y); w wide; amp in px
function wavyFlag(kind, x, y, w, o = {}) {
  const img = flagImage(kind), h = w * img.height / img.width, N = 24, amp = o.amp ?? w * 0.05, ph = o.ph || 0;
  ctx.save();
  ctx.shadowColor = "rgba(45,28,16,0.3)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.shadowBlur = 5;
  for (let i = 0; i < N; i++) {
    const u = i / N, dy = Math.sin(u * 5 - T * 6 + ph) * amp * u;
    const shade = 0.88 + 0.12 * Math.cos(u * 5 - T * 6 + ph);
    ctx.drawImage(img, img.width * u, 0, img.width / N + 1, img.height, x + w * u, y + dy, w / N + 1, h);
    if (i === 0) ctx.shadowColor = "transparent";
    if (shade < 1) { ctx.fillStyle = `rgba(30,20,10,${(1 - shade) * 0.6})`; ctx.fillRect(x + w * u, y + dy, w / N + 1, h); }
  }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= N; i++) { const u = i / N; ctx.lineTo(x + w * u, y + Math.sin(u * 5 - T * 6 + ph) * amp * u); }
  for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(x + w * u, y + h + Math.sin(u * 5 - T * 6 + ph) * amp * u); }
  ctx.closePath(); ctx.stroke(); ctx.restore();
}
function flagpole(kind, x, gy, hgt, w, o = {}) {
  cut(() => ctx.rect(x - 5, gy - hgt, 10, hgt), "#d9d4c8", { lw: 3 });
  cut(() => ctx.arc(x, gy - hgt - 6, 9, 0, 7), P.yellow, { lw: 3 });
  if ((o.k ?? 1) > 0) { ctx.save(); ctx.translate(x + 4, gy - hgt + 4); ctx.scale(o.k ?? 1, o.k ?? 1); wavyFlag(kind, 0, 0, w, o); ctx.restore(); }
}
function flatFlag(kind, x, y, w) {   // small, unwaving (stickers, map pins)
  const img = flagImage(kind), h = w * img.height / img.width;
  ctx.drawImage(img, x, y, w, h); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
}

// ---------- side-view world ----------
const GY = 1110;                                          // ground line of the side-view diorama
function skyBG(o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, GY);
  g.addColorStop(0, o.top || C.sky2); g.addColorStop(1, o.bot || C.sky);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sx = o.sunX ?? 830, sy = o.sunY ?? 430;
  if (o.sun !== false) {
    withAlpha(0.35, () => cut(() => ctx.arc(sx, sy, 150, 0, 7), "#f7dc90", { lw: 0, shadow: false }));
    cut(() => ctx.arc(sx, sy, 92, 0, 7), C.sun, { lw: 4, sx: 4, sy: 5 });
  }
  for (let i = 0; i < 5; i++) {                           // clouds drift slowly
    const span = W + 500, cx = ((rnd(i, 61) * span + T * (14 + 10 * rnd(i, 62)) + (o.scroll || 0) * 0.05) % span) - 250;
    cloud(cx, 260 + rnd(i, 63) * 330, 0.7 + rnd(i, 64) * 0.6, i);
  }
}
function cloud(x, y, s, id) {
  const pts = [];
  for (let j = 0; j < 14; j++) { const a = j / 14 * 6.283, r = (j % 2 ? 0.78 : 1) * (60 + rnd(id, j, 5) * 22); pts.push([x + Math.cos(a) * r * 1.9 * s, y + Math.sin(a) * r * 0.62 * s]); }
  cut(() => smooth(pts), C.cloud, { lw: 3, sx: 3, sy: 5, sb: 6 });
}
// North Shore-style mountains across the bay, then the water
function mountains(scroll = 0, o = {}) {
  const ridge = (base, amp, col, par, seed, snow) => {
    const off = scroll * par;
    const pts = [];
    for (let x = -60; x <= W + 60; x += 30) {
      const u = (x + off) / 260, k = Math.floor(u), f = u - k;
      const a = rnd(k, seed), b = rnd(k + 1, seed);
      const pk = lerp(a, b, ease2(f)) * 0.7 + 0.3 * Math.abs(Math.sin(u * 2.3 + seed));
      pts.push([x, base - amp * pk]);
    }
    cut(() => { ctx.moveTo(-60, GY); pts.forEach(p => ctx.lineTo(...p)); ctx.lineTo(W + 60, GY); ctx.closePath(); }, col, { lw: 4, sx: 3, sy: 4 });
    if (snow) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(-60, GY); pts.forEach(p => ctx.lineTo(...p)); ctx.lineTo(W + 60, GY); ctx.closePath(); ctx.clip();
      ctx.fillStyle = C.snow; ctx.beginPath(); ctx.moveTo(-60, base - amp * 0.62);
      for (let x = -60; x <= W + 60; x += 30) ctx.lineTo(x, base - amp * (0.62 + 0.05 * Math.sin(x * 0.07 + seed)));
      ctx.lineTo(W + 60, -10); ctx.lineTo(-60, -10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
  ridge(o.base ?? 900, 330, C.mtn, 0.08, 7, true);
  ridge((o.base ?? 900) + 50, 190, C.mtn2, 0.14, 11, false);
}
function waterBand(y0, y1, scroll = 0) {
  ctx.fillStyle = C.sea; ctx.fillRect(-10, y0, W + 20, y1 - y0);
  ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) {
    const x = ((i * 140 + r * 60 + T * 22 - scroll * 0.2) % (W + 140)) - 70, y = y0 + 14 + r * ((y1 - y0 - 20) / 4);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 15, y - 6, x + 30, y); ctx.stroke();
  }
}
function groundBand(y = GY, scroll = 0, o = {}) {
  cut(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y + Math.sin((x + scroll) * 0.011) * 7); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, o.col || C.grass, { lw: 5 });
  ctx.fillStyle = C.grass2;
  for (let i = 0; i < 70; i++) {                         // grass tufts, scrolling
    const span = W + 100, x = ((rnd(i, 71) * span - scroll) % span + span) % span - 50, yy = y + 40 + rnd(i, 72) * (H - y - 60);
    ctx.beginPath(); ctx.moveTo(x - 8, yy); ctx.lineTo(x - 2, yy - 16); ctx.lineTo(x + 1, yy - 2); ctx.lineTo(x + 6, yy - 13); ctx.lineTo(x + 9, yy); ctx.closePath(); ctx.fill();
  }
}
function roadBand(y0, y1, scroll = 0, o = {}) {
  cut(() => ctx.rect(-20, y0, W + 40, y1 - y0), C.road, { lw: 5, sy: 4 });
  ctx.fillStyle = P.yellow;
  const dash = 90, off = ((scroll % (dash * 2)) + dash * 2) % (dash * 2);
  if (o.lines !== false) for (let x = -dash * 2 - off; x < W + dash; x += dash * 2) ctx.fillRect(x, (y0 + y1) / 2 - 5, dash, 10);
}
function pine(x, gy, s, id) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.rotate(Math.sin(T * 1.3 + id) * 0.012);
  cut(() => ctx.rect(-9, -40, 18, 40), C.wood2, { lw: 3 });
  for (let i = 0; i < 3; i++) {
    const w = 70 - i * 16, y = -40 - i * 52;
    cut(() => { ctx.moveTo(-w, y); ctx.lineTo(0, y - 92); ctx.lineTo(w, y); ctx.closePath(); }, i % 2 ? C.pine2 : C.pine, { lw: 3.5, sx: 3, sy: 4 });
  }
  ctx.restore();
}
function house(x, gy, s, col, roof, id, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(id, 0.5);
  cut(() => ctx.rect(-80, -120, 160, 120), col, { lw: 4 });
  cut(() => { ctx.moveTo(-98, -118); ctx.lineTo(0, -196); ctx.lineTo(98, -118); ctx.closePath(); }, roof, { lw: 4 });
  const lit = o.lit ?? 1;
  for (const wx of [-48, 22]) cut(() => ctx.rect(wx, -92, 30, 30), lit > 0.5 ? "#f8de8a" : "#5b6168", { lw: 3, shadow: false });
  cut(() => ctx.rect(-12, -58, 26, 58), C.wood2, { lw: 3, shadow: false });
  ctx.restore();
}
// side-view car facing +x; o: x, gy, s, col, spin, flag ("US"|"CA" plate sticker), dir
function car(o) {
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1); boil(o.id || 5, 0.5);
  const bob = Math.abs(Math.sin((o.ph ?? T) * 14)) * 3 * (o.moving === false ? 0 : 1);
  ctx.translate(0, -bob);
  cut(() => { ctx.moveTo(-120, -30); ctx.lineTo(-120, -66); ctx.quadraticCurveTo(-112, -78, -90, -80); ctx.lineTo(-62, -80); ctx.lineTo(-34, -120); ctx.lineTo(46, -120); ctx.lineTo(80, -82); ctx.lineTo(112, -76); ctx.quadraticCurveTo(126, -70, 126, -46); ctx.lineTo(126, -30); ctx.closePath(); }, o.col || P.red, { lw: 4 });
  cut(() => { ctx.moveTo(-52, -84); ctx.lineTo(-28, -112); ctx.lineTo(4, -112); ctx.lineTo(4, -84); ctx.closePath(); }, "#cfe0de", { lw: 3, shadow: false });
  cut(() => { ctx.moveTo(14, -84); ctx.lineTo(14, -112); ctx.lineTo(42, -112); ctx.lineTo(66, -84); ctx.closePath(); }, "#cfe0de", { lw: 3, shadow: false });
  cut(() => ctx.rect(112, -66, 12, 10), "#f6e3a0", { lw: 2, shadow: false });
  if (o.flag) flatFlag(o.flag, -108, -66, 38);
  if (o.box) { cut(() => ctx.rect(-40, -150, 70, 32), "#c79a5e", { lw: 3 }); line(-5, -150, -5, -118, P.ink, 2); }
  ctx.restore();
  for (const wx of [-72, 80]) {                           // wheels stay on the ground and spin
    ctx.save(); ctx.translate(o.x + wx * (o.s || 1) * (o.dir || 1), o.gy - 26 * (o.s || 1)); ctx.scale(o.s || 1, o.s || 1);
    cut(() => ctx.arc(0, 0, 26, 0, 7), "#2f2a25", { lw: 3 });
    ctx.rotate(o.spin || 0); cut(() => ctx.arc(0, 0, 11, 0, 7), "#9a968a", { lw: 2, shadow: false });
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.stroke();
    ctx.restore();
  }
}
// top-down car for maps; heading a (radians), s scale
function carTop(x, y, a, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  cut(() => ctx.roundRect(-30, -16, 60, 32, 9), col || P.red, { lw: 3, sx: 3, sy: 4 });
  cut(() => ctx.roundRect(4, -12, 14, 24, 4), "#cfe0de", { lw: 2, shadow: false });
  cut(() => ctx.roundRect(-22, -12, 10, 24, 3), "#cfe0de", { lw: 2, shadow: false });
  ctx.restore();
}
// border booth: canopy + hut; flag pole; barrier arm (open 0..1)
function booth(x, gy, s, kind, open, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(o.id || 33, 0.4);
  cut(() => ctx.rect(-140, -270, 280, 34), kind === "CA" ? C.caR : C.usB, { lw: 4 });
  text(kind === "CA" ? "CANADA" : "UNITED STATES", 0, -243, { size: kind === "CA" ? 30 : 24, color: C.white, ls: 3 });
  for (const px of [-120, 112]) cut(() => ctx.rect(px, -236, 10, 236), "#cfc8b8", { lw: 3 });
  cut(() => ctx.rect(-64, -170, 104, 170), "#e9e2d2", { lw: 4 });
  cut(() => ctx.rect(-48, -150, 72, 54), "#cfe0de", { lw: 3, shadow: false });
  if (o.officer) {                                        // a generic officer's head in the window
    cut(() => ctx.arc(-12, -114, 16, 0, 7), P.skin, { lw: 3, shadow: false });
    cut(() => ctx.rect(-30, -136, 36, 9), kind === "CA" ? "#1d2b4a" : "#2c3b2a", { lw: 2, shadow: false });
  }
  ctx.restore();
  // barrier arm across the road: pivot beside the hut, the arm points toward oncoming traffic (armDir -1 = left)
  const dirA = o.armDir || -1, px = x + dirA * 90 * s, py = o.armY ?? gy - 60 * s;
  ctx.save(); ctx.translate(px, py); ctx.scale(s * dirA, s); ctx.rotate(-open * 1.35 * dirA);
  cut(() => ctx.rect(0, -9, 250, 18), C.white, { lw: 3 });
  ctx.fillStyle = C.caR; for (let i = 0; i < 5; i++) ctx.fillRect(14 + i * 50, -9, 24, 18);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.strokeRect(0, -9, 250, 18);
  ctx.restore();
  cut(() => ctx.rect(px - 7 * s, py, 14 * s, (gy - py) + 80 * s), "#5e5a52", { lw: 3 });
  cut(() => ctx.arc(px, py, 12 * s, 0, 7), "#5e5a52", { lw: 3 });
}
function roadSign(x, y, lines, o = {}) {
  const size = o.size || 40, w = Math.max(...lines.map(l => measure(l, size))) + 50, h = lines.length * size * 1.15 + 34;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  if (o.post !== false) { cut(() => ctx.rect(-6, h / 2, 12, o.post || 160), "#9c978b", { lw: 3 }); }
  cut(() => ctx.roundRect(-w / 2, -h / 2, w, h, 12), o.bg || "#2f6b4a", { lw: 4 });
  ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  lines.forEach((l, i) => text(l, 0, -h / 2 + 17 + size * (i + 0.95), { size, color: o.color || C.white }));
  ctx.restore();
}
// a little paper person; o: x, gy, s, col, walk (phase or null), dir, arms ("up"|"carry"), hat
function person(o) {
  const s = o.s || 1, id = o.id || 1, ph = o.walk;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s);
  const sw = ph == null ? 0 : Math.sin(ph) * 0.45, bob = ph == null ? 0 : Math.abs(Math.cos(ph)) * 4;
  ctx.translate(0, -bob);
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 9, -58); ctx.rotate(sw * k); cut(() => ctx.roundRect(-6, 0, 12, 58, 5), "#3c3a40", { lw: 3, shadow: false }); ctx.restore(); }
  cut(() => ctx.roundRect(-24, -128, 48, 76, 14), o.col || ["#c8452d", "#2f4858", "#6d9a5b", "#e08a3c", "#7b5a8a"][id % 5], { lw: 3.5 });
  const armA = o.arms === "up" ? -2.6 : o.arms === "carry" ? -1.2 : sw * 0.8;
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 22, -120); ctx.rotate(k === 1 ? armA : -armA * (o.arms ? 1 : 1)); cut(() => ctx.roundRect(-5, 0, 10, 52, 5), o.col2 || P.skin, { lw: 2.5, shadow: false }); ctx.restore(); }
  cut(() => ctx.arc(0, -150, 22, 0, 7), P.skin, { lw: 3.5 });
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(7, -153, 3, 0, 7); ctx.fill();
  if (o.hat === "top") { cut(() => ctx.rect(-20, -206, 40, 40), "#2b2320", { lw: 2 }); cut(() => ctx.rect(-30, -170, 60, 8), "#2b2320", { lw: 2 }); }
  else if (o.hat === "cap") cut(() => { ctx.arc(0, -158, 22, Math.PI, 0); ctx.lineTo(34, -158); ctx.closePath(); }, o.hatCol || C.usB, { lw: 3 });
  if (o.arms === "carry") cut(() => ctx.rect(18, -128, 56, 44), "#c79a5e", { lw: 3 });
  ctx.restore();
}
// the near foreground: fills the frame below the road (under the captions and platform UI) with depth
function foreground(scroll = 0, o = {}) {
  const y0 = o.y ?? GY + 200;
  cut(() => ctx.rect(-20, y0, W + 40, 46), "#d8d2c2", { lw: 4, sy: 4 });               // curb + sidewalk
  ctx.strokeStyle = "rgba(43,35,32,0.25)"; ctx.lineWidth = 3;
  for (let x = -((scroll * 1.1) % 120); x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, y0 + 4); ctx.lineTo(x, y0 + 44); ctx.stroke(); }
  // fence
  const fy = y0 + 210, fs = scroll * 1.3, sp = 110;
  if (o.fence !== false) {
    cut(() => ctx.rect(-20, fy - 120, W + 40, 18), C.wood3, { lw: 3 }); cut(() => ctx.rect(-20, fy - 60, W + 40, 18), C.wood3, { lw: 3 });
    for (let x = -((fs % sp) + sp) % sp; x < W + sp; x += sp) cut(() => { ctx.moveTo(x - 14, fy); ctx.lineTo(x - 14, fy - 150); ctx.lineTo(x, fy - 170); ctx.lineTo(x + 14, fy - 150); ctx.lineTo(x + 14, fy); ctx.closePath(); }, "#c49a6a", { lw: 3 });
  }
  // near bushes and flowers, faster parallax
  for (let i = 0; i < 9; i++) {
    const span = W + 400, bx = ((rnd(i, 151) * span - scroll * 1.7) % span + span) % span - 200, by = fy + 120 + rnd(i, 152) * 330, r = 60 + rnd(i, 153) * 60;
    const pts = []; for (let j = 0; j < 11; j++) { const a = Math.PI + j / 10 * Math.PI; pts.push([bx + Math.cos(a) * r * 1.4, by + Math.sin(a) * r * (j % 2 ? 0.86 : 1.08)]); }
    pts.push([bx + r * 1.4, by + 30], [bx - r * 1.4, by + 30]);
    cut(() => smooth(pts), i % 2 ? C.pine : C.grass2, { lw: 4, sx: 6, sy: 9 });
    for (let k = 0; k < 4; k++) cut(() => ctx.arc(bx + (rnd(i, k, 154) - 0.5) * r * 2, by - r * 0.5 + rnd(i, k, 155) * r * 0.6, 9, 0, 7), [P.yellow, C.white, "#e07a8a"][(i + k) % 3], { lw: 2, shadow: false });
  }
  if (o.items) o.items(fy);
  if (o.pines) { pine(-70 - (scroll * 2.2) % 40, H + 30, 3.2, 901); pine(W + 80, H + 60, 2.9, 902); }
}
function puffC(x, y, r, a, col = "#efe6d4") {
  if (a <= 0) return;
  withAlpha(a, () => { const pts = []; for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283, rr = r * (i % 2 ? 0.78 : 1.05); pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.82]); } cut(() => smooth(pts), col, { lw: 3, sx: 3, sy: 4 }); });
}
// a paper label that pops in at time a (seconds)
function popTag(str, x, y, t, a, o = {}) {
  const k = back(pp(t, a, 0.3));
  if (t < a) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); tag(str, 0, 0, Object.assign({ size: 40 }, o)); ctx.restore();
}
// big counter number on a paper card
function counterCard(str, x, y, sub, o = {}) {
  const size = o.size || 120, w = Math.max(measure(str, size), sub ? measure(sub, 34, "Elite") : 0) + 70, h = size * 1.05 + (sub ? 60 : 30);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02);
  cut(() => ctx.rect(-w / 2, -h / 2, w, h), o.bg || P.card, { lw: 4 });
  text(str, 0, -h / 2 + size * 0.98, { size, color: o.color || P.ink });
  if (sub) text(sub, 0, h / 2 - 22, { size: 34, font: "Elite" });
  ctx.restore();
}

// ---------- top-down maps from build/geo.json ----------
// cam: {lon, lat, s (px per degree latitude), cx, cy}; every point goes through mp()
function mapProj(cam) {
  const k = Math.cos(cam.lat * Math.PI / 180);
  return (lon, lat) => [cam.cx + (lon - cam.lon) * k * cam.s, cam.cy - (lat - cam.lat) * cam.s];
}
function seaBG(col = C.sea, drift = 1) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.lineWidth = 3;
  for (let y = -40; y < H + 40; y += 34) { const o = Math.sin(y * 0.05 + T * 0.8 * drift) * 10; ctx.beginPath(); ctx.moveTo(0, y + o); ctx.lineTo(W, y + 12 + o); ctx.stroke(); }
}
function ringsPath(polys, mp) {
  for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const p = mp(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); }
}
// draw the land layers of a geo scene; fills: {US: col, CA: col} or a function (iso) -> col
function drawLand(geoId, mp, fills, o = {}) {
  const g = GEO[geoId];
  if (!g) { warn(`point-roberts: no geometry for ${geoId}; run studio/tools/geo.py`); return; }
  for (const L of g.layers) {
    const f = typeof fills === "function" ? fills(L.iso) : (fills[L.iso] || C.ca);
    cut(() => ringsPath(L.polys, mp), f, { lw: o.lw ?? 4, rule: "evenodd", sx: o.sx ?? 6, sy: o.sy ?? 9, sb: 8 });
  }
}
// clip to one country's land (for tinting / filling a piece)
function clipLand(geoId, mp, iso, draw) {
  const g = GEO[geoId]; if (!g) return;
  ctx.save(); ctx.beginPath();
  for (const L of g.layers) if (!iso || L.iso === iso) ringsPath(L.polys, mp);
  ctx.clip("evenodd"); draw(); ctx.restore();
}
// Point Roberts = the US land on the peninsula (west of -122.95)
const PR_BOX = [-123.12, 48.96, -122.99, 49.0021];
function prPolys(geoId) {
  const g = GEO[geoId]; if (!g) return [];
  const us = g.layers.find(L => L.iso === "US"); if (!us) return [];
  return us.polys.filter(poly => poly[0].some(([lo, la]) => lo < -122.99 && lo > -123.12 && la > 48.95));
}
const BORDER_LAT = 49.0021;                               // the line as surveyed (OSM), about 230 m north of 49°00'00"
function borderLine(mp, lon0, lon1, k = 1, o = {}) {
  if (k <= 0) return;
  const a = mp(lon0, BORDER_LAT), b = mp(lerp(lon0, lon1, k), BORDER_LAT);
  ctx.save(); if (o.dash !== false) ctx.setLineDash([26, 14]);
  stroke2(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, o.col || P.red, o.w || 8, (o.w || 8) + 6);
  ctx.restore();
}

// =====================================================================================================
// 1. HOOK: the town, its one road, the Canadian booth. Frame 0 is a finished picture; the car is already rolling.
// Also drawn at negative t by the loop ending, so everything here extrapolates backwards cleanly.
// =====================================================================================================
const HOOK_ROAD = [GY + 70, GY + 190];
function hookWorld(t, camX) {
  skyBG({ sunX: 860, sunY: 420, scroll: camX });
  mountains(camX);
  waterBand(900, GY + 5, camX);
  groundBand(GY, camX);
  ctx.save(); ctx.translate(-camX, 0);
  // the town (world x -700 .. 470): houses, trees, a water tower, the flag
  for (let i = 0; i < 9; i++) pine(-680 + i * 150 + rnd(i, 3) * 60, GY + 40, 0.75 + rnd(i, 4) * 0.4, i);
  const HC = [["#e8d2b0", "#9b4a3a"], ["#c9d6c4", "#5a6b7a"], ["#ecd9ae", "#7b5a3a"], ["#d9c2d0", "#7a4a5a"], ["#f1e0c0", "#3f5f41"]];
  [-560, -330, -110, 100, 300].forEach((x, i) => house(x, GY + 60, 0.95 + rnd(i, 9) * 0.15, HC[i][0], HC[i][1], 40 + i));
  // water tower
  cut(() => ctx.rect(-230, GY - 210, 10, 250), "#9c978b", { lw: 3 }); cut(() => ctx.rect(-150, GY - 210, 10, 250), "#9c978b", { lw: 3 });
  cut(() => ctx.roundRect(-262, GY - 330, 154, 130, 30), "#d8d2c2", { lw: 4 });
  text("PT. ROBERTS", -185, GY - 255, { size: 30, ls: 1 });
  flagpole("US", 420, GY + 70, 330, 170, { ph: 0.3 });
  // the road sign before the border
  roadSign(640, GY - 150, ["REST OF USA", "→ VIA CANADA"], { size: 34, post: 220 });
  // booth + welcome sign
  const open = eio(pp(t, at("hook/through") - 0.25, 0.45));
  booth(900, GY + 70, 1.15, "CA", open, { officer: true, armY: GY + 95 });
  flagpole("CA", 1100, GY + 70, 300, 150, { ph: 1.1 });
  const wk = back(pp(t, at("hook/canada") - 0.05, 0.35));
  if (wk > 0) { ctx.save(); ctx.translate(1340, GY - 40); ctx.scale(wk, wk); roadSign(0, 0, ["WELCOME TO", "CANADA"], { size: 40, bg: C.caR, post: 160 }); ctx.restore(); }
  for (let i = 0; i < 6; i++) pine(1560 + i * 150 + rnd(i, 13) * 50, GY + 40, 0.8 + rnd(i, 14) * 0.5, 20 + i);
  ctx.restore();
  roadBand(HOOK_ROAD[0], HOOK_ROAD[1], camX);
  foreground(camX, { pines: true, items: fy => {
    const mx = 330 - camX * 1.3;                          // a mailbox on the US side
    cut(() => ctx.rect(mx - 8, fy - 40, 16, 150), C.wood2, { lw: 3 });
    cut(() => ctx.roundRect(mx - 60, fy - 110, 120, 74, [36, 36, 6, 6]), C.usB, { lw: 4 });
    cut(() => ctx.rect(mx + 50, fy - 150, 10, 60), P.red, { lw: 2 });
  } });
}
function hookCarX(t) {                                     // world x of the car: rolls, waits for the arm, goes
  const tArm = at("hook/through");
  if (t < tArm - 0.6) return 300 + 150 * t;
  const xs = 300 + 150 * (tArm - 0.6);
  if (t < tArm + 0.2) return xs + 70 * eout(pp(t, tArm - 0.6, 0.8));
  return xs + 70 + 260 * Math.pow(t - tArm - 0.2, 1.35);
}
const hookCam = t => 60 + 85 * t + 120 * eio(pp(t, at("hook/goes"), 1.4));
CU.hook = (t, S) => {
  const camX = hookCam(t), cx = hookCarX(t);
  hookWorld(t, camX);
  car({ x: cx - camX, gy: HOOK_ROAD[0] + 90, s: 1.3, col: P.red, flag: "US", spin: cx / 26, ph: t, id: 7 });
  // overlays: where we are, and how many roads out
  popTag("POINT ROBERTS, WASHINGTON · USA", W / 2, 300, t, -99, { size: 38 });
  const rk = back(pp(t, at("hook/road") - 0.05, 0.35));
  if (rk > 0) { ctx.save(); ctx.translate(890, 455); ctx.scale(rk, rk); counterCard("1", 0, 0, "ROAD OUT", { size: 110, rot: 0.04 }); ctx.restore(); }
};

// =====================================================================================================
// 2. WHO: the real coastline from above; 1,191 people (2020 census) on five square miles
// =====================================================================================================
const PR_C = [-123.062, 48.986];
function prPath(geoId, mp) { const p = new Path2D(); for (const poly of prPolys(geoId)) for (const ring of poly) { ring.forEach(([lo, la], j) => { const q = mp(lo, la); j ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); }); p.closePath(); } return p; }
function topHouse(x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); cut(() => ctx.rect(-14, -10, 28, 20), col, { lw: 2.5, sx: 2, sy: 3, sb: 2 }); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); ctx.restore(); }
function prMap(t, S, cam, o = {}) {
  const mp = mapProj(cam);
  seaBG();
  drawLand(S.id, mp, { US: C.us, CA: C.ca });
  // Canadian side: a few fields and the road north, so the land isn't empty
  clipLand(S.id, mp, "CA", () => {
    ctx.strokeStyle = "rgba(120,95,60,0.18)"; ctx.lineWidth = 2;
    for (let i = -30; i < 60; i++) { const a = mp(-123.4 + i * 0.012, 49.0), b = mp(-123.4 + i * 0.012 + 0.03, 49.3); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  });
  borderLine(mp, -123.2, -122.6, 1, { dash: true });
  return mp;
}
CU.who = (t, S) => {
  const z = lerp(19000, 15500, eio(pp(t, S.t0, S.t1 - S.t0 + 0.4)));
  const cam = { lon: PR_C[0] + 0.004, lat: PR_C[1] + 0.006, s: z, cx: W / 2, cy: 820 };
  const mp = prMap(t, S, cam);
  const path = prPath(S.id, mp);
  // houses on the US side only, in a seeded scatter
  for (let i = 0; i < 70; i++) {
    const lo = lerp(-123.088, -123.034, rnd(i, 81)), la = lerp(48.972, 49.0, rnd(i, 82));
    const [x, y] = mp(lo, la);
    if (ctx.isPointInPath(path, x, y)) topHouse(x, y, 0.8, (rnd(i, 83) - 0.5) * 0.6, ["#efe4cc", "#d9c2a0", "#f3d6b6"][i % 3]);
  }
  // one paper person per ten residents, popping in on "twelve"
  const t1 = at("who/twelve");
  let shown = 0;
  for (let i = 0; i < 360 && shown < 119; i++) {
    const lo = lerp(-123.09, -123.032, rnd(i, 91)), la = lerp(48.969, 49.0, rnd(i, 92));
    const [x, y] = mp(lo, la);
    if (!ctx.isPointInPath(path, x, y)) continue;
    const k = back(pp(t, t1 + shown * 0.006, 0.25)); shown++;
    if (k <= 0) continue;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * 0.9, k * 0.9);
    cut(() => ctx.arc(0, -16, 6, 0, 7), P.skin, { lw: 2, shadow: false });
    cut(() => ctx.roundRect(-6, -10, 12, 16, 4), ["#c8452d", "#2f4858", "#6d9a5b", "#7b5a8a"][i % 4], { lw: 2, sx: 2, sy: 2, sb: 1 });
    ctx.restore();
  }
  text("CANADA", W / 2, 560, { size: 120, color: "rgba(43,35,32,0.55)", ls: 18 });
  const nb = mp(-122.995, BORDER_LAT); tag("49°N", Math.min(W - 120, nb[0]), nb[1] - 44, { size: 34, bg: P.card, rot: 0.03 });
  const n = Math.round(1191 * eout(pp(t, t1, 0.9)));
  if (t > t1 - 0.05) counterCard(fmt(n), 280, 330, "PEOPLE · 2020 CENSUS", { size: 96 });
  const t5 = at("who/five");
  if (t > t5 - 0.05) {
    // outline traces the town; the area card lands
    ctx.save(); ctx.setLineDash([2200, 2200]); ctx.lineDashOffset = 2200 * (1 - eout(pp(t, t5, 0.7)));
    ctx.strokeStyle = P.yellow; ctx.lineWidth = 9; ctx.stroke(path); ctx.restore();
    const k = back(pp(t, t5, 0.3)); ctx.save(); ctx.translate(800, 330); ctx.scale(k, k); counterCard("5", 0, 0, "SQUARE MILES", { size: 96, rot: 0.03 }); ctx.restore();
  }
  tag("1 tiny person = 10 residents", W / 2, 1180, { size: 30, bg: P.card });
};

// =====================================================================================================
// 3. TREATY: a desk in 1846; the real coastline on parchment; a ruler; a quill draws the 49th parallel
// =====================================================================================================
const NW_CAM = { lon: -121.6, lat: 48.6, s: 96, cx: W / 2, cy: 720 };
const LINE_E = -114.2, LINE_W = -124.4;                    // where the drawn line runs (east edge to the strait)
function deskBG() {
  ctx.fillStyle = C.wood; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) {                           // planks
    const y = i * 230 - 40;
    ctx.fillStyle = i % 2 ? C.wood2 : C.wood; ctx.fillRect(0, y, W, 226);
    ctx.strokeStyle = "rgba(40,20,10,0.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.strokeStyle = "rgba(255,230,190,0.08)"; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(0, y + 30 + k * 34); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y + 30 + k * 34 + Math.sin(x * 0.01 + i + k) * 6); ctx.stroke(); }
  }
}
function parchment(draw) {
  ctx.save(); ctx.translate(W / 2, 735); ctx.rotate(-0.018); ctx.translate(-W / 2, -735);
  const pts = []; const x0 = 50, y0 = 250, x1 = W - 50, y1 = 1215;
  for (let i = 0; i <= 12; i++) pts.push([lerp(x0, x1, i / 12), y0 + (rnd(i, 51) - 0.5) * 10]);
  for (let i = 0; i <= 12; i++) pts.push([x1 + (rnd(i, 52) - 0.5) * 10, lerp(y0, y1, i / 12)]);
  for (let i = 12; i >= 0; i--) pts.push([lerp(x0, x1, i / 12), y1 + (rnd(i, 53) - 0.5) * 10]);
  for (let i = 12; i >= 0; i--) pts.push([x0 + (rnd(i, 54) - 0.5) * 10, lerp(y0, y1, i / 12)]);
  const edge = () => { pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); };
  cut(edge, C.parch, { lw: 4, sx: 10, sy: 14, sb: 16 });
  ctx.save(); ctx.beginPath(); edge(); ctx.clip();
  const g = ctx.createRadialGradient(W / 2, 735, 200, W / 2, 735, 700); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,80,30,0.28)");
  draw();
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.restore();
}
function nwMap(t, S, mp, lineK, tint) {
  ctx.fillStyle = "#cdd6c0"; ctx.fillRect(0, 0, W, H);   // old-map sea
  ctx.strokeStyle = "rgba(60,80,70,0.18)"; ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) { ctx.beginPath(); const y = 260 + i * 26; ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // land as one piece of paper: no border yet (both countries in one colour)
  drawLand(S.id, mp, () => "#e2c98f", { lw: 3, sx: 3, sy: 4 });
  // the chart's own furniture: title, compass rose, scale bar
  ctx.save(); ctx.globalAlpha = 0.72;
  text("OREGON COUNTRY", 700, 360, { size: 52, font: "Serif", color: "#6b4a28", ls: 2 });
  line(540, 386, 860, 386, "rgba(107,74,40,0.7)", 3);
  ctx.translate(840, 1040);
  cut(() => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 34 : 78; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0); } ctx.closePath(); }, "#d9bc84", { lw: 3, shadow: false });
  cut(() => { ctx.moveTo(0, -84); ctx.lineTo(22, -18); ctx.lineTo(-22, -18); ctx.closePath(); }, "#8a2a1e", { lw: 2.5, shadow: false });
  text("N", 0, -98, { size: 30, color: "#6b4a28" });
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.6; ctx.translate(230, 1060);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#6b4a28" : "#e7d3a6"; ctx.fillRect(i * 40, 0, 40, 14); }
  ctx.strokeStyle = "#6b4a28"; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 160, 14);
  text("200 MILES", 80, 46, { size: 24, font: "Elite", color: "#6b4a28" });
  ctx.restore();
  // graticule
  ctx.save(); ctx.strokeStyle = "rgba(90,60,30,0.25)"; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
  for (let la = 45; la <= 52; la++) { const a = mp(-129, la), b = mp(-113, la); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  for (let lo = -128; lo <= -114; lo += 2) { const a = mp(lo, 44), b = mp(lo, 53); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.restore();
  if (tint > 0) clipLand(S.id, mp, null, () => {
    const y = mp(0, 49)[1];
    ctx.fillStyle = `rgba(200,69,45,${0.32 * tint})`; ctx.fillRect(0, 0, W, y);
    ctx.fillStyle = `rgba(47,72,120,${0.30 * tint})`; ctx.fillRect(0, y, W, H);
  });
  if (lineK > 0) {
    const a = mp(LINE_E, 49), b = mp(lerp(LINE_E, LINE_W, lineK), 49);
    stroke2(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, P.red, 7, 12);
  }
}
function hand(x, y, a, sleeve, cuff, s = 1) {               // a paper hand + sleeve reaching from off-frame
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  cut(() => ctx.roundRect(-520, -58, 480, 116, 24), sleeve, { lw: 4, sx: 8, sy: 12, sb: 12 });
  cut(() => ctx.roundRect(-70, -64, 60, 128, 12), cuff, { lw: 4 });
  cut(() => { ctx.moveTo(-14, -46); ctx.quadraticCurveTo(60, -62, 96, -30); ctx.quadraticCurveTo(118, -10, 96, 14); ctx.lineTo(70, 44); ctx.quadraticCurveTo(20, 60, -14, 46); ctx.closePath(); }, P.skin, { lw: 4 });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  for (const yy of [-22, -2, 18]) { ctx.beginPath(); ctx.moveTo(50, yy); ctx.lineTo(88, yy - 4); ctx.stroke(); }
  ctx.restore();
}
function ruler(x0, x1, y, k, rot) {
  if (k <= 0) return;
  ctx.save(); ctx.translate((x0 + x1) / 2, y - (1 - eout(k)) * 260); ctx.rotate(rot * (1 - eout(k)));
  const w = x1 - x0;
  cut(() => ctx.rect(-w / 2, -4, w, 44), "#d7b26a", { lw: 4, sx: 8, sy: 14, sb: 12 });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
  for (let i = 0; i <= 60; i++) { const xx = -w / 2 + 10 + i * (w - 20) / 60; ctx.beginPath(); ctx.moveTo(xx, -4); ctx.lineTo(xx, i % 5 ? 8 : 18); ctx.stroke(); }
  ctx.restore();
}
function quill(x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  cut(() => { ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -120, 150, -300); ctx.quadraticCurveTo(70, -150, 0, 0); ctx.closePath(); }, "#f3ead7", { lw: 3, sx: 6, sy: 10 });
  line(0, 0, 120, -250, P.ink, 3);
  ctx.restore();
}
function candle(x, y) {
  cut(() => ctx.ellipse(x, y + 10, 70, 22, 0, 0, 7), "#b9a27a", { lw: 3 });
  cut(() => ctx.rect(x - 24, y - 120, 48, 130), "#f5ecd8", { lw: 3 });
  const f = 1 + 0.12 * Math.sin(T * 23) + 0.08 * Math.sin(T * 37);
  withAlpha(0.35, () => cut(() => ctx.arc(x, y - 150, 60 * f, 0, 7), "#ffe2a0", { lw: 0, shadow: false }));
  cut(() => { ctx.moveTo(x, y - 190 * f + 70); ctx.quadraticCurveTo(x + 18, y - 140, x, y - 122); ctx.quadraticCurveTo(x - 18, y - 140, x, y - 190 * f + 70); ctx.closePath(); }, "#f7b84a", { lw: 3, shadow: false });
}
function treatyDesk(t, S, o = {}) {
  deskBG();
  candle(130, 250);
  const mp = mapProj(NW_CAM);
  const tL0 = at("treaty/the") - 0.05, tL1 = at("treaty/parallel") + 0.5;
  const lineK = o.lineK ?? eio(pp(t, tL0, tL1 - tL0));
  const tint = o.tint ?? eout(pp(t, at("treaty/parallel") + 0.3, 0.5));
  parchment(() => nwMap(t, S, mp, lineK, tint));
  // inkwell
  cut(() => ctx.roundRect(880, 1235, 120, 90, 18), "#2b2f3a", { lw: 4 });
  // the rest of the desk: letters, a wax seal, a pocket watch, a sealing stick
  [[150, 1560, -0.15], [330, 1640, 0.1], [520, 1580, -0.05]].forEach(([x, y, r], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); cut(() => ctx.rect(-130, -90, 260, 180), i % 2 ? "#efe2c2" : C.parch, { lw: 3, sx: 6, sy: 9 }); ctx.fillStyle = "rgba(43,35,32,0.35)"; for (let k = 0; k < 5; k++) ctx.fillRect(-100, -55 + k * 26, 200 - (k === 4 ? 80 : 0), 6); ctx.restore(); });
  cut(() => ctx.arc(330, 1700, 46, 0, 7), "#8a2a1e", { lw: 4 });
  cut(() => ctx.arc(820, 1600, 90, 0, 7), "#c9a043", { lw: 5 }); cut(() => ctx.arc(820, 1600, 72, 0, 7), "#f6efe0", { lw: 3, shadow: false });
  { const a1 = T * 0.6, a2 = T * 7; line(820, 1600, 820 + Math.cos(a1) * 40, 1600 + Math.sin(a1) * 40, P.ink, 5); line(820, 1600, 820 + Math.cos(a2) * 60, 1600 + Math.sin(a2) * 60, P.ink, 3); }
  stroke2(() => { ctx.moveTo(600, 1820); ctx.lineTo(1000, 1760); }, "#b23a2a", 22, 28);
  // labels and the ruler
  const ry = mp(0, 49)[1] - 44;
  const rk = pp(t, at("treaty/ruler") - 0.15, 0.45);
  ruler(70, W - 70, ry, o.rulerK ?? rk, -0.12);
  const k1 = back(pp(t, at("treaty/britain") - 0.05, 0.3)), k2 = back(pp(t, at("treaty/america") - 0.05, 0.3));
  if (k1 > 0 && !o.noLabels) { ctx.save(); ctx.translate(560, 470); ctx.scale(k1, k1); tag("BRITAIN", 0, 0, { size: 46, rot: -0.03 }); ctx.restore(); }
  if (k2 > 0 && !o.noLabels) { ctx.save(); ctx.translate(600, 960); ctx.scale(k2, k2); tag("UNITED STATES", 0, 0, { size: 46, rot: 0.02 }); ctx.restore(); }
  // the hands: Britain holds the ruler from the left, America draws from the right
  const hb = eout(pp(t, at("treaty/britain") - 0.2, 0.5)), ha = eout(pp(t, at("treaty/america") - 0.2, 0.5));
  if (hb > 0) hand(lerp(-200, 210, hb), ry + 20 + Math.sin(T * 3) * 3, 0.05, "#b23a2a", "#f3ead7", 0.9);
  const px = mp(lerp(LINE_E, LINE_W, lineK), 49);
  if (ha > 0) {
    const hx = lineK > 0 ? px[0] + 40 : lerp(W + 400, 900, ha), hy = lineK > 0 ? px[1] + 70 : ry + 120;
    quill(hx - 40, hy - 70, -0.25);
    ctx.save(); ctx.translate(hx + 330, hy + 40); ctx.scale(-1, 1); hand(0, 0, 0.12, "#2f3f6e", "#e8d6a8", 0.9); ctx.restore();
  }
  stamp("1846", 230, 1130, t - at("treaty/eighteen"), { size: 110, rot: -0.12, color: "#8a2a1e" });
  const k49 = back(pp(t, at("treaty/fortyninth") - 0.05, 0.3));
  if (k49 > 0 && !o.noLabels) { const q = mp(-116.2, 49); ctx.save(); ctx.translate(q[0], q[1] + 70); ctx.scale(k49, k49); tag("49°N", 0, 0, { size: 44, bg: P.yellow }); ctx.restore(); }
  return mp;
}
CU.treaty = (t, S) => { treatyDesk(t, S); };

// =====================================================================================================
// 4. COAST: the deal gets signed; the camera dives to the coast; the lens shows what the line did
// =====================================================================================================
CU.coast = (t, S) => {
  const mpD = mapProj(NW_CAM), focus = mpD(-123.06, 49.0);
  const z = 1 + 2.4 * eio(pp(t, S.t0 + 0.15, 1.0));
  ctx.save(); ctx.translate(W / 2, 700); ctx.scale(z, z); ctx.translate(-focus[0], -focus[1]);
  treatyDesk(t, SC.find(x => x.id === "s_treaty"), { lineK: 1, tint: 1, rulerK: 1, noLabels: true });
  ctx.restore();
  stamp("SIGNED", 760, 400, t - at("coast/nobody"), { size: 120, rot: 0.12, color: "#8a2a1e" });
  // magnifying glass with the real coastline (OSM) inside
  const lk = eout(pp(t, at("coast/the") - 0.1, 0.45));
  if (lk > 0) {
    const cx = lerp(W + 400, 540, lk), cy = 760, r = 330;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
    const cam = { lon: -123.03, lat: 49.01, s: 9000, cx, cy };
    const mp = mapProj(cam);
    seaBG("#b7d0ca");
    drawLand("s_survey", mp, () => "#e2c98f", { lw: 3 });
    const a = mp(-122.9, BORDER_LAT), b = mp(-123.2, BORDER_LAT);
    stroke2(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, P.red, 8, 14);
    ctx.restore();
    ctx.save(); ctx.translate(cx, cy);
    stroke2(() => { ctx.moveTo(r * 0.72, r * 0.72); ctx.lineTo(r * 1.35, r * 1.35); }, C.wood2, 44, 54);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 34; ctx.strokeStyle = P.ink; ctx.stroke(); ctx.lineWidth = 22; ctx.strokeStyle = "#c9a043"; ctx.stroke();
    withAlpha(0.18, () => { ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.4, r * 0.3, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); });
    ctx.restore();
    const qk = back(pp(t, at("coast/coast") + 0.05, 0.3));
    if (qk > 0) { ctx.save(); ctx.translate(cx + 40, cy + 120); ctx.scale(qk, qk); text("?", 0, 0, { size: 170, color: P.red, stroke: 14 }); ctx.restore(); }
  }
};

// =====================================================================================================
// 5. SURVEY: surveyors walk the line across the real peninsula; the tip comes loose and turns American
// =====================================================================================================
function surveyor(x, y, s, ph, id, hat) { person({ x, gy: y, s, walk: ph, id, hat, col: id % 2 ? "#5a4636" : "#2f4858" }); }
CU.survey = (t, S) => {
  const cam = { lon: -123.055, lat: 49.004, s: lerp(9800, 10800, pp(t, S.t0, 3.6)), cx: W / 2, cy: 760 };
  const mp = mapProj(cam);
  seaBG();
  const tc = at("survey/cut"), lift = eout(pp(t, tc, 0.5));
  // Canada first, then Point Roberts on top, lifted like a cut piece of paper
  const g = GEO[S.id];
  for (const L of g.layers) {
    const isPR = poly => poly[0].some(([lo, la]) => lo < -122.99 && lo > -123.12 && la > 48.95);
    const rest = L.iso === "US" ? L.polys.filter(p => !isPR(p)) : L.polys;
    cut(() => ringsPath(rest, mp), L.iso === "US" ? C.us : C.ca, { lw: 4, rule: "evenodd" });
  }
  // the tip: Canadian colour until the cut, then American; it lifts on the cut
  const tip = prPolys(S.id);
  ctx.save(); ctx.translate(0, -16 * lift);
  const col = lift > 0 ? C.us : C.ca;
  cut(() => ringsPath(tip, mp), col, { lw: 4, rule: "evenodd", sx: 6 + 10 * lift, sy: 9 + 16 * lift, sb: 8 + 12 * lift });
  ctx.restore();
  // the line drawn behind the surveyors, east to west
  const walk = eio(pp(t, S.t0 - 0.2, tc - S.t0 + 0.2));
  const lonS = lerp(-122.99, -123.105, walk);
  borderLine(mp, -122.95, lonS, 1, { dash: false, w: 7 });
  // stakes every so often
  for (let lo = -123.0; lo > lonS; lo -= 0.008) { const p = mp(lo, BORDER_LAT); cut(() => ctx.rect(p[0] - 4, p[1] - 30, 8, 30), C.white, { lw: 2.5, sx: 2, sy: 3 }); }
  const sp = mp(lonS, BORDER_LAT), walking = t < tc;
  surveyor(sp[0] + 30, sp[1] + 6, 0.75, walking ? t * 9 : null, 1, "top");
  surveyor(sp[0] + 140, sp[1] + 6, 0.75, walking ? t * 9 + 2 : null, 2, "top");
  // the chain between them
  ctx.save(); ctx.strokeStyle = "#5e5a52"; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(sp[0] + 40, sp[1] - 40); ctx.quadraticCurveTo(sp[0] + 70, sp[1] - 20, sp[0] + 100, sp[1] - 40); ctx.stroke(); ctx.restore();
  // scissors snip along the line at the cut
  const sk = pp(t, tc - 0.15, 0.6);
  if (sk > 0 && sk < 1) {
    const q = mp(lerp(-123.035, -123.1, sk), BORDER_LAT);
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(Math.PI);
    const o = 0.35 * Math.abs(Math.sin(t * 30));
    for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * o); cut(() => { ctx.ellipse(-60, k * 16, 26, 14, 0, 0, 7); }, P.red, { lw: 3 }); cut(() => { ctx.moveTo(-40, k * 6); ctx.lineTo(60, 0); ctx.lineTo(-40, -k * 2); ctx.closePath(); }, "#c9ccd0", { lw: 3 }); ctx.restore(); }
    ctx.restore();
  }
  text("CANADA", W / 2, 420, { size: 110, color: "rgba(43,35,32,0.5)", ls: 16 });
  const tp = at("survey/peninsula");
  if (t > tc + 0.2) { const k = back(pp(t, tc + 0.2, 0.3)); const q = mp(-123.062, 48.982); ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(k, k); text("USA", 0, 30, { size: 90, color: C.white, stroke: 12 }); ctx.restore(); }
  popTag("POINT ROBERTS", W / 2, 1150, t, tp - 0.1, { size: 46, bg: P.yellow });
  // the surveyors' reaction
  if (t > tc + 0.6) { const k = back(pp(t, tc + 0.6, 0.3)); ctx.save(); ctx.translate(sp[0] + 70, sp[1] - 170); ctx.scale(k, k); cut(() => ctx.ellipse(0, 0, 54, 44, 0, 0, 7), C.white, { lw: 3 }); text("?!", 0, 22, { size: 64, color: P.red }); ctx.restore(); }
  popTag("BOUNDARY SURVEY", W / 2, 300, t, -99, { size: 34 });
};

// =====================================================================================================
// 6. DRIVE: the only drive to the rest of the US, on the real map: two borders, about 25 miles of Canada
// =====================================================================================================
const ROUTE = [[-123.055, 48.985], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06], [-123.0, 49.08], [-122.93, 49.095], [-122.89, 49.103], [-122.84, 49.08], [-122.80, 49.04], [-122.765, 49.015], [-122.757, 49.0021], [-122.75, 48.99]];
function routeAt(pts, k) {                                 // point and heading at fraction k of the path length
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let d = clamp(k) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const u = seg[i] ? d / seg[i] : 0; const a = pts[i], b = pts[i + 1]; return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), a: Math.atan2(b[1] - a[1], b[0] - a[0]), i, u }; } d -= seg[i]; }
}
function passport(x, y, n, since) {
  if (since <= 0) return;
  const k = back(clamp(since / 0.3));
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.06);
  cut(() => ctx.roundRect(-110, -78, 220, 156, 12), "#1f3a5f", { lw: 4 });
  text("PASSPORT", 0, -30, { size: 34, color: "#e8c46a", ls: 2 });
  ctx.restore();
  stamp(n === 1 ? "CROSSING 1" : "CROSSING 2", x, y + 30, since - 0.15, { size: 46, rot: -0.12, color: n === 1 ? C.caR : P.red });
}
CU.drive = (t, S) => {
  const cam = { lon: -122.925, lat: 49.04, s: 4300, cx: W / 2, cy: 760 };
  const mp = mapProj(cam);
  seaBG();
  drawLand(S.id, mp, { US: C.us, CA: C.ca });
  borderLine(mp, -123.3, -122.6, 1, { dash: true, w: 6 });
  // the route through Canada (screen space), drawn as the car goes
  const t1 = at("drive/cross"), t2 = at("drive/twice");
  const k = lerp(0.04, 0.985, eio(pp(t, S.t0 - 0.1, t2 - S.t0 + 0.15)));
  const R = ROUTE.map(p => mp(...p));
  const L = R.map((p, i) => i ? Math.hypot(p[0] - R[i - 1][0], p[1] - R[i - 1][1]) : 0).reduce((a, b) => a + b, 0);
  ctx.save(); ctx.setLineDash([L * k, L * 2]);
  stroke2(() => { R.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, P.yellow, 10, 18);
  ctx.restore();
  // booths at the two crossings
  for (const [lo, la] of [ROUTE[1], ROUTE[10]]) { const q = mp(lo, la); cut(() => ctx.rect(q[0] - 22, q[1] - 22, 44, 44), C.white, { lw: 3 }); flatFlag("CA", q[0] - 16, q[1] - 12, 32); }
  const c = routeAt(R, k);
  carTop(c.x, c.y, c.a, 1.0, P.red);
  // miles in Canada, counted between the crossings
  const lens = R.slice(1).map((p, i) => Math.hypot(p[0] - R[i][0], p[1] - R[i][1])), tot = lens.reduce((a, b) => a + b, 0);
  const upto = n => lens.slice(0, n).reduce((a, b) => a + b, 0) / tot;      // fraction of the path at waypoint n
  const inCanada = clamp((k - upto(1)) / (upto(10) - upto(1)));             // between crossing 1 and crossing 2
  const miles = Math.round(25 * inCanada);
  text("CANADA", W / 2, 360, { size: 110, color: "rgba(43,35,32,0.5)", ls: 16 });
  const p0 = mp(-123.062, 48.975); tag("POINT ROBERTS", p0[0] + 10, p0[1] + 80, { size: 32 });
  const pb = mp(-122.74, 48.975); tag("BLAINE, WA", pb[0] - 60, pb[1] + 70, { size: 32 });
  counterCard(`${miles} MI`, 800, 1090, "OF CANADA", { size: 80, rot: 0.03 });
  passport(240, 600, 1, t - t1);
  passport(240, 600, 2, t - t2);
  popTag("REST OF THE USA ↓", 800, 960, t, t2 + 0.2, { size: 32, bg: P.yellow });
};

// =====================================================================================================
// 7. KIDS: the school bus: out through Canada and back, four crossings, sun across the sky
// =====================================================================================================
function bus(x, gy, s, dir, ph, id) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s); boil(id, 0.5);
  ctx.translate(0, -Math.abs(Math.sin(ph * 12)) * 3);
  cut(() => ctx.roundRect(-230, -190, 440, 150, 18), P.yellow, { lw: 4 });
  cut(() => { ctx.moveTo(210, -150); ctx.lineTo(268, -140); ctx.quadraticCurveTo(280, -132, 280, -100); ctx.lineTo(280, -40); ctx.lineTo(210, -40); ctx.closePath(); }, P.yellow, { lw: 4 });
  ctx.fillStyle = P.ink; ctx.fillRect(-230, -92, 510, 10);
  for (let i = 0; i < 5; i++) {
    const wx = -205 + i * 80;
    cut(() => ctx.rect(wx, -172, 60, 52), "#cfe0de", { lw: 3, shadow: false });
    const bob = Math.sin(ph * 8 + i * 1.7) * 3;
    cut(() => ctx.arc(wx + 30, -136 + bob, 15, 0, 7), [P.skin, "#c99a72", "#8d5f3e", P.skin, "#e3b48c"][i], { lw: 2.5, shadow: false });
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(wx + 35, -139 + bob, 2.4, 0, 7); ctx.fill();
  }
  ctx.save(); ctx.scale(dir, 1); text("SCHOOL BUS", dir > 0 ? -10 : 10, -52, { size: 30, color: P.ink, ls: 3 }); ctx.restore();
  ctx.restore();
  for (const wx of [-150, 170]) { ctx.save(); ctx.translate(x + wx * s * dir, gy - 30 * s); ctx.scale(s, s); cut(() => ctx.arc(0, 0, 32, 0, 7), "#2f2a25", { lw: 3 }); ctx.rotate(ph * 20 * dir); cut(() => ctx.arc(0, 0, 13, 0, 7), "#9a968a", { lw: 2, shadow: false }); ctx.fillStyle = P.ink; ctx.fillRect(-13, -2, 26, 4); ctx.restore(); }
}
CU.kids = (t, S) => {
  const u = pp(t, S.t0, S.t1 - S.t0);
  const sunA = lerp(Math.PI * 0.95, Math.PI * 0.05, u);
  skyBG({ sunX: 540 + Math.cos(sunA) * 470, sunY: 760 - Math.sin(sunA) * 430, top: u > 0.75 ? "#e8b98f" : C.sky2 });
  mountains(0);
  waterBand(900, GY + 5);
  groundBand(GY);
  // zones: Point Roberts | Canada | Blaine
  house(95, GY + 60, 0.7, "#e8d2b0", "#9b4a3a", 61);
  flagpole("US", 180, GY + 60, 220, 110);
  for (let i = 0; i < 4; i++) pine(390 + i * 95, GY + 40, 0.65 + rnd(i, 66) * 0.25, 70 + i);
  // the school
  cut(() => ctx.rect(860, GY - 150, 200, 210), C.brick, { lw: 4 });
  cut(() => { ctx.moveTo(845, GY - 148); ctx.lineTo(960, GY - 220); ctx.lineTo(1075, GY - 148); ctx.closePath(); }, "#7b3a2a", { lw: 4 });
  text("SCHOOL", 960, GY - 95, { size: 38, color: C.white });
  flagpole("US", 1040, GY - 150, 120, 70);
  const B1 = 270, B2 = 790;
  roadBand(GY + 80, GY + 200, 0, { lines: false });
  foreground(0, { items: fy => { cut(() => ctx.roundRect(150, fy + 40, 120, 140, 24), P.red, { lw: 4 }); cut(() => ctx.roundRect(170, fy + 70, 80, 50, 10), "#a8382a", { lw: 3 }); cut(() => ctx.roundRect(820, fy + 90, 130, 90, 10), P.navy, { lw: 4 }); text("LUNCH", 885, fy + 148, { size: 30, color: C.white }); } });
  // the bus: out (crossings 1, 2), back (3, 4)
  const tOut0 = S.t0 + 0.05, tOut1 = at("kids/four") - 0.45, tBack0 = tOut1 + 0.15, tBack1 = at("kids/day") - 0.1;
  let bx, dir;
  if (t < tBack0) { bx = lerp(60, 1000, eio(pp(t, tOut0, tOut1 - tOut0))); dir = 1; }
  else { bx = lerp(1000, 60, eio(pp(t, tBack0, tBack1 - tBack0))); dir = -1; }
  const passes = [];
  if (t >= tOut0) { const xs = [B1, B2]; xs.forEach(b => { if (bx > b + 40 || t >= tBack0) passes.push(1); }); }
  if (t >= tBack0) { [B2, B1].forEach(b => { if (bx < b - 40) passes.push(1); }); }
  const n = passes.length;
  booth(B1, GY + 80, 0.55, "CA", n >= 1 && n < 3 ? 1 : (Math.abs(bx - B1) < 260 ? 1 : 0), { armY: GY + 120 });
  booth(B2, GY + 80, 0.55, "US", Math.abs(bx - B2) < 260 ? 1 : 0, { armY: GY + 120 });
  bus(bx, GY + 195, 0.78, dir, t, 88);
  // tally
  for (let i = 0; i < 4; i++) {
    const x = 210 + i * 220, y = 520, on = i < n;
    cut(() => ctx.roundRect(x - 90, y - 70, 180, 140, 14), on ? P.card : "rgba(248,241,226,0.55)", { lw: 4 });
    if (on) { const since = t - (S.t0 + 0.1); stamp(String(i + 1), x, y, 1, { size: 100, rot: -0.08 + i * 0.05, color: i % 2 ? P.red : C.caR }); }
  }
  popTag("BORDER CROSSINGS, EVERY SCHOOL DAY", W / 2, 360, t, -99, { size: 34 });
  popTag("FROM 4TH GRADE · TO BLAINE, WA", W / 2, 690, t, S.t0 + 0.4, { size: 32, bg: P.yellow });
};

// =====================================================================================================
// 8. WATER: cutaway: a Point Roberts kitchen tap fed by a pipe from a Canadian reservoir (1987 agreement)
// =====================================================================================================
CU.water = (t, S) => {
  const SY = 760;                                          // the ground surface in this cutaway
  skyBG({ sunX: 180, sunY: 360 });
  // Canadian mountains + reservoir on the right
  ctx.save(); ctx.translate(0, SY - GY); mountains(0, { base: 900 }); ctx.restore();
  cut(() => ctx.ellipse(880, SY - 6, 210, 34, 0, 0, 7), "#7fb0b5", { lw: 4 });
  // soil, layered, to the bottom of the frame
  cut(() => ctx.rect(-10, SY, W + 20, H - SY + 10), C.soil, { lw: 5 });
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? C.soil2 : "#a87c50"; ctx.beginPath(); ctx.moveTo(0, SY + 260 + i * 240); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, SY + 260 + i * 240 + Math.sin(x * 0.01 + i) * 18); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 40; i++) cut(() => ctx.ellipse(rnd(i, 101) * W, SY + 60 + rnd(i, 102) * (H - SY - 80), 10 + rnd(i, 103) * 16, 7 + rnd(i, 104) * 10, rnd(i, 105), 0, 7), "#c9b08a", { lw: 2, shadow: false });
  cut(() => ctx.rect(-10, SY - 14, W + 20, 26), C.grass, { lw: 4 });
  // the border post on the surface
  cut(() => ctx.rect(552, SY - 170, 16, 170), "#d9d4c8", { lw: 3 });
  flatFlag("US", 470, SY - 165, 76); flatFlag("CA", 574, SY - 165, 76);
  line(560, SY + 12, 560, H, "rgba(200,69,45,0.6)", 6, [24, 16]);
  text("USA", 300, SY + 100, { size: 54, color: "rgba(43,35,32,0.5)", ls: 8 }); text("CANADA", 820, SY + 100, { size: 54, color: "rgba(43,35,32,0.5)", ls: 8 });
  // the pipe: reservoir -> down -> west under the border -> up into the house
  const PIPE = [[880, SY + 10], [880, 1010], [210, 1010], [210, 560]];
  stroke2(() => { PIPE.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, "#8b9aa0", 34, 44);
  ctx.save(); ctx.setLineDash([22, 30]); ctx.lineDashOffset = T * 160;      // water moving west
  ctx.beginPath(); PIPE.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.strokeStyle = "#5fa8d3"; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.stroke(); ctx.restore();
  // the house, cut open: kitchen with a tap and a filling glass
  cut(() => ctx.rect(60, 420, 340, SY - 420), "#efe0c4", { lw: 5 });
  cut(() => { ctx.moveTo(30, 424); ctx.lineTo(230, 280); ctx.lineTo(430, 424); ctx.closePath(); }, "#9b4a3a", { lw: 5 });
  cut(() => ctx.rect(90, 600, 280, 30), C.wood3, { lw: 3 });                 // counter
  stroke2(() => { ctx.moveTo(210, 560); ctx.lineTo(210, 500); ctx.lineTo(262, 500); ctx.lineTo(262, 520); }, "#b8bcc0", 12, 18);
  const fill = pp(t, S.t0 + 0.2, 3.6);
  for (let i = 0; i < 3; i++) { const y = 528 + ((T * 3 + i / 3) % 1) * 40; cut(() => ctx.ellipse(262, y, 5, 8, 0, 0, 7), "#5fa8d3", { lw: 2, shadow: false }); }
  ctx.save(); ctx.beginPath(); ctx.moveTo(236, 548); ctx.lineTo(288, 548); ctx.lineTo(282, 600); ctx.lineTo(242, 600); ctx.closePath(); ctx.clip();
  ctx.fillStyle = "#8cc6e6"; ctx.fillRect(230, 600 - 52 * fill, 70, 60); ctx.restore();
  ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(236, 548); ctx.lineTo(242, 600); ctx.lineTo(282, 600); ctx.lineTo(288, 548); ctx.stroke(); ctx.restore();
  flagpole("US", 420, SY - 10, 260, 120);
  popTag("POINT ROBERTS KITCHEN", 230, 240, t, -99, { size: 30 });
  popTag("GREATER VANCOUVER WATER DISTRICT", 760, 640, t, at("water/canadian") - 0.05, { size: 28, bg: P.card });
  const ck = back(pp(t, at("water/canadian") - 0.05, 0.3));
  if (ck > 0) { ctx.save(); ctx.translate(560, 1080); ctx.scale(ck, ck); arrow(160, 0, -160, 0, 1, "#2f6b8f", 10); ctx.restore(); }
  // the agreement
  const dk = eout(pp(t, at("water/under") - 0.1, 0.5));
  if (dk > 0) {
    ctx.save(); ctx.translate(lerp(W + 300, 770, dk), 330); ctx.rotate(0.05);
    cut(() => ctx.rect(-190, -120, 380, 240), P.card, { lw: 4 });
    text("WATER AGREEMENT", 0, -62, { size: 40 });
    ctx.fillStyle = "rgba(43,35,32,0.35)"; for (let i = 0; i < 4; i++) ctx.fillRect(-150, -36 + i * 24, 300 - (i === 3 ? 120 : 0), 8);
    const sg = pp(t, at("water/deal"), 0.8);
    ctx.save(); ctx.strokeStyle = "#1f3a7a"; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= 40 * sg; i++) { const x = -140 + i * 5, y = 82 + Math.sin(i * 0.9) * 12 - i * 0.3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  stamp("1987", 880, 400, t - at("water/eightyseven") + 0.1, { size: 90, rot: -0.15 });
};

// =====================================================================================================
// 9. SHUT: Canadians queue for gas and parcels; 2020: the arm drops; the cars back away and vanish
// =====================================================================================================
const SHOP_X = 260;
function parcelShop(x, gy) {
  cut(() => ctx.rect(x - 150, gy - 250, 300, 250), "#e9d8b8", { lw: 4 });
  cut(() => ctx.rect(x - 170, gy - 300, 340, 60), "#2f4858", { lw: 4 });
  text("PARCELS", x, gy - 255, { size: 44, color: C.white, ls: 4 });
  cut(() => ctx.rect(x - 110, gy - 210, 220, 120), "#cfe0de", { lw: 3, shadow: false });
}
function box(x, y, s, id) { ctx.save(); ctx.translate(x, y); ctx.rotate((rnd(id, 7) - 0.5) * 0.2); ctx.scale(s, s); cut(() => ctx.rect(-36, -60, 72, 60), "#c79a5e", { lw: 3 }); line(0, -60, 0, 0, "rgba(43,35,32,0.5)", 3); ctx.restore(); }
CU.shut = (t, S) => {
  skyBG({ sunX: 900, sunY: 380, top: t > at("shut/shut") ? "#d9cdb8" : C.sky2 });
  mountains(0);
  waterBand(900, GY + 5);
  groundBand(GY);
  parcelShop(SHOP_X, GY + 60);
  // gas sign
  cut(() => ctx.rect(48, GY - 360, 12, 300), "#9c978b", { lw: 3 });
  cut(() => ctx.roundRect(-10, GY - 440, 130, 90, 10), P.red, { lw: 4 }); text("GAS", 55, GY - 378, { size: 52, color: C.white });
  const tShut = at("shut/shut"), tGo = at("shut/and") - 0.1, tVan = at("shut/vanished");
  // the US booth: arm swings shut
  const open = 1 - eout(pp(t, tShut - 0.15, 0.22));
  booth(650, GY + 70, 0.95, "US", open, { armY: GY + 85, armDir: 1, officer: true });
  // queue of Canadian cars driving west (dir -1), then reversing east and vanishing
  for (let i = 0; i < 4; i++) {
    const base = 860 + i * 290;
    const roll = Math.min(t, tShut) - S.t0;
    let x = base - 80 * roll;
    const back_ = Math.max(0, t - tGo - i * 0.12);
    x += 520 * back_ * back_;
    const gone = pp(t, tVan - 0.25 + i * 0.12, 0.2);
    if (gone < 1) car({ x, gy: GY + 145, s: 0.85, dir: -1, col: ["#2f4858", "#6d9a5b", "#e08a3c", "#7b5a8a"][i], flag: "CA", box: i % 2 === 0, spin: -x / 24, moving: t < tShut || t > tGo, id: 110 + i });
    if (gone > 0) puffC(x, GY + 80, 70 + 80 * gone, 1 - gone * 0.8);
  }
  roadBand(GY + 70, GY + 190, 0);
  // parcels: picked up before the closure, left piling up after, right in front of us
  const pile = Math.floor(clamp((t - tShut) / 2.6) * 14);
  foreground(0, { fence: true, items: fy => {
    for (let i = 0; i < 4 + pile; i++) { const k = back(pp(t, tShut + (i - 4) * 0.18, 0.25)); if (i >= 4 && k <= 0) continue; box(150 + (i % 6) * 150, fy + 220 - Math.floor(i / 6) * 120, 1.8 * (i < 4 ? 1 : k), i); }
    if (pile > 2) tag("UNCLAIMED", 540, fy - 40, { size: 40, bg: P.card, rot: -0.04 });
  } });
  // the calendar and the stamp
  const ck = back(pp(t, at("shut/twenty") - 0.05, 0.3));
  if (ck > 0) { ctx.save(); ctx.translate(210, 380); ctx.scale(ck, ck); ctx.rotate(-0.05); cut(() => ctx.rect(-120, -100, 240, 200), P.card, { lw: 4 }); cut(() => ctx.rect(-120, -100, 240, 54), P.red, { lw: 4 }); text("2020", 0, 70, { size: 96 }); ctx.restore(); }
  if (t > tShut) {
    const k = back(pp(t, tShut, 0.3));
    ctx.save(); ctx.translate(820, GY - 80); ctx.scale(k, k);
    cut(() => ctx.rect(-130, -70, 260, 110), C.white, { lw: 4 }); text("CLOSED", 0, 10, { size: 70, color: P.red });
    line(-110, 40, -140, 160, P.ink, 8); line(110, 40, 140, 160, P.ink, 8);
    ctx.restore();
  }
  stamp("BORDER CLOSED", W / 2, 560, t - tShut, { size: 96, rot: -0.08 });
  if (t > tVan + 0.3) { const x = lerp(W + 80, -120, pp(t, tVan + 0.3, 1.6)); ctx.save(); ctx.translate(x, GY + 130); ctx.rotate(-T * 6); ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(0, 0, 18 + i * 4, i, i + 2.4); ctx.stroke(); } ctx.restore(); }
};

// =====================================================================================================
// 10. LOST: main street; the business meter drains past 80 percent; four of five shop windows go dark
// =====================================================================================================
const SHOPS = [["CAFE", "#c8452d"], ["PARCELS", "#2f4858"], ["GAS", "#e08a3c"], ["MARKET", "#6d9a5b"], ["GIFTS", "#7b5a8a"]];
function shopFront(x, gy, name, col, lit, id) {
  ctx.save(); ctx.translate(x, gy); boil(id, 0.4);
  cut(() => ctx.rect(-98, -330, 196, 330), "#efe0c4", { lw: 4 });
  cut(() => ctx.rect(-108, -370, 216, 56), col, { lw: 4 });
  text(name, 0, -328, { size: name.length > 6 ? 34 : 42, color: C.white, ls: 2 });
  cut(() => ctx.rect(-78, -280, 156, 130), lit ? "#f8de8a" : "#4d545c", { lw: 3, shadow: false });
  if (lit) { ctx.fillStyle = "rgba(255,240,180,0.35)"; ctx.beginPath(); ctx.moveTo(-78, -150); ctx.lineTo(78, -150); ctx.lineTo(110, 0); ctx.lineTo(-110, 0); ctx.closePath(); ctx.fill(); }
  cut(() => ctx.rect(-30, -120, 60, 120), C.wood2, { lw: 3, shadow: false });
  if (!lit) { ctx.save(); ctx.translate(0, -215); ctx.rotate(-0.08); cut(() => ctx.rect(-60, -22, 120, 44), C.white, { lw: 3 }); text("CLOSED", 0, 13, { size: 30, color: P.red }); ctx.restore(); }
  ctx.restore();
}
CU.lost = (t, S) => {
  skyBG({ sunX: 160, sunY: 330, top: "#e3c9a0", bot: "#efdcbc" });
  mountains(0, { base: 820 });
  groundBand(GY - 40, 0, { col: "#bfb59a" });
  const t0 = at("lost/lost"), t1 = at("lost/business") + 0.4;
  const left = lerp(100, 18, eio(pp(t, t0, t1 - t0)));    // percent of business left
  SHOPS.forEach(([n, c], i) => shopFront(118 + i * 211, GY + 60, n, c, left > 100 - (i + 1) * 20 + 1 || i === 4, 120 + i));
  roadBand(GY + 80, GY + 200, 0, { lines: true });
  foreground(0, { items: fy => { const k = back(pp(t, at("lost/business") - 0.2, 0.3)); if (k > 0) { ctx.save(); ctx.translate(780, fy - 150); ctx.scale(k, k); ctx.rotate(0.05); cut(() => ctx.rect(-150, -60, 300, 120), C.white, { lw: 4 }); text("FOR LEASE", 0, 18, { size: 54, color: P.red }); ctx.restore(); } } });
  // coins leaving town
  for (let i = 0; i < 14; i++) {
    const a = pp(t, t0 + i * 0.16, 0.9);
    if (a <= 0 || a >= 1) continue;
    const x = lerp(140 + (i % 5) * 200, W + 80, eout(a)), y = GY - 300 - Math.sin(a * Math.PI) * 260;
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.abs(Math.cos(T * 9 + i)) * 0.8 + 0.2, 1); cut(() => ctx.arc(0, 0, 26, 0, 7), P.yellow, { lw: 3 }); text("$", 0, 13, { size: 34, color: "#8a6a1a" }); ctx.restore();
  }
  // the meter
  const mx = 110, my = 360, mw = W - 220, mh = 90;
  text("TOWN BUSINESS", W / 2, my - 30, { size: 56 });
  cut(() => ctx.rect(mx, my, mw, mh), "#efe6d4", { lw: 5 });
  ctx.fillStyle = left > 40 ? P.green : P.red; ctx.fillRect(mx + 6, my + 6, (mw - 12) * left / 100, mh - 12);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(mx + mw * i / 5, my); ctx.lineTo(mx + mw * i / 5, my + 24); ctx.stroke(); }
  stamp("−80%+", W / 2 + 160, my + 190, t - at("lost/eighty"), { size: 110, rot: -0.1 });
  popTag(S.p.label || "Border Policy Research Institute estimate", W / 2, my + 300, t, at("lost/percent"), { size: 30, bg: P.card });
};

// =====================================================================================================
// 11. GROCERY: five thousand shoppers a day fill the whole frame; then fifty are left
// =====================================================================================================
const CROWD_ROWS = 40, CROWD_COLS = 25;        // 1,000 figures, one per five shoppers
const CROWD = (() => {
  const out = [];
  for (let r = 0; r < CROWD_ROWS; r++) for (let c = 0; c < CROWD_COLS; c++) {
    const i = r * CROWD_COLS + c, u = r / CROWD_ROWS;
    out.push({
      x: 24 + c * 42 + (r % 2) * 21 + (rnd(i, 131) - 0.5) * 14,
      y: 690 + Math.pow(u, 1.15) * 1180 + (rnd(i, 132) - 0.5) * 12,
      s: lerp(0.62, 1.25, u),                   // perspective: nearer rows are bigger
      d: Math.hypot(c - CROWD_COLS / 2, (CROWD_ROWS - r) * 0.5), keep: false,
      col: ["#c8452d", "#2f4858", "#6d9a5b", "#e08a3c", "#7b5a8a", "#d9c2a0"][Math.floor(rnd(i, 133) * 6)],
      skin: ["#e6c09a", "#c99a72", "#8d5f3e", "#e3b48c"][Math.floor(rnd(i, 136) * 4)], v: rnd(i, 134),
    });
  }
  const order = out.map((p, i) => [p.v, i]).sort((a, b) => a[0] - b[0]);
  order.slice(0, 10).forEach(([, i]) => (out[i].keep = true));    // ten figures left = about fifty shoppers
  return out;
})();
CU.grocery = (t, S) => {
  paperBG("#d8cdb4");
  // the store
  cut(() => ctx.rect(110, 390, 860, 300), "#efe0c4", { lw: 5 });
  cut(() => ctx.rect(80, 340, 920, 110), P.green, { lw: 5 });
  text("GROCERY", W / 2, 428, { size: 92, color: C.white, ls: 14 });
  for (let i = 0; i < 4; i++) cut(() => ctx.rect(150 + i * 200, 480, 150, 110), "#f8de8a", { lw: 3, shadow: false });
  cut(() => ctx.rect(480, 580, 120, 110), "#cfe0de", { lw: 4 });
  const tIn = at("grocery/five"), tOut = at("grocery/about");
  const n = t < tOut ? Math.round(5000 * eout(pp(t, tIn - 0.1, 0.8))) : Math.round(lerp(5000, 50, eout(pp(t, tOut, 0.45))));
  for (let i = 0; i < CROWD.length; i++) {
    const p = CROWD[i];
    const kIn = pp(t, tIn - 0.1 + p.d / 112 * 0.8, 0.18);
    if (kIn <= 0) continue;
    const kOut = p.keep ? 0 : pp(t, tOut + p.v * 0.45, 0.12);
    if (kOut >= 1) continue;
    const s = back(kIn) * (1 - kOut) * p.s;
    const bob = Math.sin(T * 6 + i) * 2.2 * p.s, sw = Math.sin(T * 6 + i) * 0.3;
    ctx.save(); ctx.translate(p.x, p.y + bob); ctx.scale(s, s);
    ctx.fillStyle = "rgba(43,35,32,0.18)"; ctx.beginPath(); ctx.ellipse(0, 4, 15, 5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3.4; ctx.lineCap = "round";
    for (const kk of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(kk * 5 + sw * 6 * kk, 2); ctx.stroke(); }
    cut(() => ctx.roundRect(-9, -40, 18, 28, 7), p.col, { lw: 2.6, sx: 2, sy: 3, sb: 2 });
    cut(() => ctx.arc(0, -48, 8, 0, 7), p.skin, { lw: 2.4, shadow: false });
    ctx.restore();
  }
  const k = t < tOut ? 0 : 1;
  counterCard(fmt(n), 300, 180, k ? "SHOPPERS A DAY · 2020" : "SHOPPERS A DAY · PEAK", { size: 110, rot: -0.03 });
  tag("1 figure = 5 shoppers", 820, 740, { size: 28, bg: P.card });
  if (t > tOut + 0.5) { const x = lerp(-80, 420, eout(pp(t, tOut + 0.5, 1.6))); ctx.save(); ctx.translate(x, 1120); line(-30, -40, 30, -40, P.ink, 5); cut(() => ctx.rect(-34, -40, 68, 40), "#c9ccd0", { lw: 3 }); cut(() => ctx.arc(-20, 6, 8, 0, 7), "#2f2a25", { lw: 2 }); cut(() => ctx.arc(20, 6, 8, 0, 7), "#2f2a25", { lw: 2 }); ctx.restore(); }
};

// =====================================================================================================
// 12. GAS: five gas stations pop up in a row; fewer than a thousand people to use them
// =====================================================================================================
function station(x, gy, s, n, id) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(id, 0.4);
  cut(() => ctx.rect(-150, -330, 300, 50), C.white, { lw: 4 }); ctx.fillStyle = P.red; ctx.fillRect(-146, -296, 292, 12);
  for (const px of [-120, 110]) cut(() => ctx.rect(px, -282, 14, 282), "#d9d4c8", { lw: 3 });
  for (const px of [-60, 40]) { cut(() => ctx.roundRect(px, -150, 50, 150, 8), P.red, { lw: 3 }); cut(() => ctx.rect(px + 10, -130, 30, 26), "#cfe0de", { lw: 2, shadow: false }); }
  text("GAS", 0, -296, { size: 34, color: P.ink });
  ctx.restore();
}
CU.gas = (t, S) => {
  skyBG({ sunX: 900, sunY: 470, top: "#e7b98e", bot: "#f0d5ad" });
  mountains(0, { base: 880 });
  groundBand(GY - 40, 0, { col: "#c7b98f" });
  roadBand(GY + 100, GY + 220, 0);
  foreground(0, { y: GY + 220, fence: false, items: fy => { const x = lerp(W + 100, -150, pp(t, at("gas/fewer"), 2.2)); ctx.save(); ctx.translate(x, fy + 160); ctx.rotate(-T * 5); ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 6; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(0, 0, 30 + i * 8, i, i + 2.4); ctx.stroke(); } ctx.restore(); } });
  const t5 = [at("gas/five"), at("gas/gas"), at("gas/stations"), at("gas/stations") + 0.18, at("gas/stations") + 0.36];
  for (let i = 0; i < 5; i++) {
    const k = back(pp(t, t5[i] - 0.05, 0.3));
    if (k <= 0) continue;
    const x = 108 + i * 216;
    ctx.save(); ctx.translate(x, GY + 80); ctx.scale(1, k); station(0, 0, 0.68, i + 1, 140 + i); ctx.restore();
    popTag(String(i + 1), x, GY - 230, t, t5[i] + 0.05, { size: 40, bg: P.yellow, rot: 0 });
  }
  // the one customer
  const tf = at("gas/fewer");
  const wx = lerp(-60, 560, pp(t, tf - 0.4, 3.0));
  person({ x: wx, gy: GY + 150, s: 0.7, walk: t * 8, id: 3 });
  cut(() => ctx.roundRect(wx + 24, GY + 60, 26, 34, 4), P.red, { lw: 2.5 });
  const k = back(pp(t, tf - 0.05, 0.35));
  if (k > 0) { ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k); counterCard("< 1,000", 0, 0, "PEOPLE IN TOWN · 2020", { size: 120 }); ctx.restore(); }
  popTag("THAT'S UNDER 200 PEOPLE PER STATION", W / 2, 680, t, at("gas/people") + 0.15, { size: 30, bg: P.card });
};

// =====================================================================================================
// 13. TRADE: 2025: a tug of war over the line, tariff crates; then one diner's February, down 55 percent
// =====================================================================================================
function crate(x, y, s, k, txt) { if (k <= 0) return; ctx.save(); ctx.translate(x, y - (1 - eout(k)) * 700); ctx.scale(s, s); cut(() => ctx.rect(-90, -110, 180, 110), C.wood3, { lw: 4 }); line(-90, -55, 90, -55, C.wood2, 5); text(txt, 0, -38, { size: 40, color: P.ink }); ctx.restore(); }
CU.trade = (t, S) => {
  const tB = at("trade/one") - 0.15;
  const slide = eio(pp(t, tB, 0.35));
  ctx.save(); ctx.translate(-W * slide, 0);
  // A: tug of war over the border
  skyBG({ sunX: 540, sunY: 300 });
  groundBand(GY - 60, 0, { col: "#c9b88a" });
  line(W / 2, GY - 60, W / 2, H, P.red, 10, [30, 18]);
  const tug = Math.sin(T * 5) * 18;
  stroke2(() => { ctx.moveTo(140 + tug, 760); ctx.quadraticCurveTo(W / 2 + tug, 790, W - 140 + tug, 760); }, "#d7b26a", 14, 22);
  hand(260 + tug, 760, 0.05, C.usB, "#e8d6a8", 0.85);
  ctx.save(); ctx.translate(W - 260 + tug, 760); ctx.scale(-1, 1); hand(0, 0, 0.05, C.caR, C.white, 0.85); ctx.restore();
  flatFlag("US", 120, 520, 150); flatFlag("CA", W - 270, 520, 150);
  const tt = at("trade/trade");
  crate(240, GY + 120, 0.95, pp(t, tt - 0.1, 0.35), "TARIFF"); crate(840, GY + 120, 0.95, pp(t, tt + 0.05, 0.35), "TARIFF");
  crate(300, GY + 10, 0.8, pp(t, tt + 0.25, 0.35), "TARIFF"); crate(780, GY + 10, 0.8, pp(t, tt + 0.35, 0.35), "TARIFF");
  // trucks stopped nose to nose at the line, engines idling
  for (let i = 0; i < 3; i++) {
    const k = eout(pp(t, S.t0 + i * 0.12, 0.7));
    car({ x: lerp(-260, 330 - i * 300, k), gy: GY + 40, s: 0.8, col: ["#2f4858", "#6d9a5b", "#7b5a8a"][i], flag: "US", box: true, spin: (1 - k) * 9, moving: false, id: 160 + i });
    car({ x: lerp(W + 260, W - 330 + i * 300, k), gy: GY + 40, s: 0.8, dir: -1, col: ["#c8452d", "#e08a3c", "#2f4858"][i], flag: "CA", box: true, spin: -(1 - k) * 9, moving: false, id: 170 + i });
  }
  for (let i = 0; i < 4; i++) { const a = (T * 0.6 + i / 4) % 1; puffC(250 - i * 20, GY - 60 - a * 220, 24 + a * 46, (1 - a) * 0.5, "#cfc6b8"); puffC(W - 250 + i * 20, GY - 60 - a * 220, 24 + a * 46, (1 - a) * 0.5, "#cfc6b8"); }
  foreground(0, { y: GY + 160, fence: false, items: fy => {
    crate(220, fy + 230, 1.5, pp(t, tt + 0.45, 0.35), "TARIFF");
    crate(830, fy + 250, 1.5, pp(t, tt + 0.6, 0.35), "TARIFF");
  } });
  const ck = back(pp(t, at("trade/twenty") - 0.05, 0.3));
  if (ck > 0) { ctx.save(); ctx.translate(W / 2, 360); ctx.scale(ck, ck); cut(() => ctx.rect(-120, -90, 240, 180), P.card, { lw: 4 }); cut(() => ctx.rect(-120, -90, 240, 50), P.red, { lw: 4 }); text("2025", 0, 64, { size: 90 }); ctx.restore(); }
  stamp("TRADE WAR", W / 2, 620, t - at("trade/war"), { size: 110, rot: -0.07 });
  // B: the diner and its February
  ctx.translate(W, 0);
  paperBG("#efe4cc");
  cut(() => ctx.rect(80, 820, 920, 400), "#e7d3b0", { lw: 5 });
  cut(() => ctx.rect(50, 760, 980, 100), "#2f4858", { lw: 5 });
  text("DINER", W / 2, 838, { size: 78, color: C.white, ls: 18 });
  cut(() => ctx.rect(130, 900, 340, 200), "#f8de8a", { lw: 3, shadow: false }); cut(() => ctx.rect(610, 900, 340, 200), "#f8de8a", { lw: 3, shadow: false });
  person({ x: 300, gy: 1110, s: 0.9, id: 12, col: C.white, hat: null });
  foreground(0, { y: 1220, fence: false, items: fy => car({ x: 700, gy: fy + 150, s: 1.2, col: "#6d9a5b", flag: "US", moving: false, id: 150 }) });
  if (t > at("trade/fiftyfive")) { ctx.save(); ctx.translate(318, 935); cut(() => ctx.ellipse(0, 0, 8, 12, 0, 0, 7), "#8cc6e6", { lw: 2 }); ctx.restore(); }
  // chart: Feb last year vs Feb 2025
  const bx = 330, by = 680, bw = 170, top = 300;
  const grow = eout(pp(t, tB + 0.3, 0.6));
  const drop = eio(pp(t, at("trade/fiftyfive") - 0.1, 0.5));
  const h1 = (by - top) * grow, h2 = (by - top) * grow * lerp(1, 0.45, drop);
  cut(() => ctx.rect(bx - bw / 2, by - h1, bw, h1), P.green, { lw: 4 });
  cut(() => ctx.rect(bx + 260 - bw / 2, by - h2, bw, h2), P.red, { lw: 4 });
  line(160, by, W - 160, by, P.ink, 5);
  text("FEB 2024", bx, by + 50, { size: 40 }); text("FEB 2025", bx + 260, by + 50, { size: 40 });
  stamp("−55%", 800, 420, t - at("trade/fiftyfive"), { size: 120, rot: -0.1 });
  popTag("one business owner's reported figure", W / 2, 230, t, at("trade/owner"), { size: 30, bg: P.card });
  ctx.restore();
};

// =====================================================================================================
// 14. LOOP: back to the desk: one straight line; then a torn wipe to the opening picture (hook at t<=0)
// =====================================================================================================
CU.loop = (t, S) => {
  const tr = SC.find(x => x.id === "s_treaty");
  const mpD = mapProj(NW_CAM), focus = mpD(-123.06, 49.0);
  const z = lerp(1.25, 1, eout(pp(t, S.t0, 0.8)));
  ctx.save(); ctx.translate(W / 2, 735); ctx.scale(z, z); ctx.translate(-W / 2, -735);
  treatyDesk(t, tr, { lineK: 1, tint: 1, rulerK: 1 });
  ctx.restore();
  const pulse = 0.5 + 0.5 * Math.sin((t - at("loopback/line")) * 9);
  if (t > at("loopback/line") - 0.1) { const a = mpD(LINE_E, 49), b = mpD(LINE_W, 49); ctx.save(); ctx.globalAlpha = 0.5 * pulse; stroke2(() => { ctx.moveTo(a[0], a[1] - 5); ctx.lineTo(b[0], b[1] - 5); }, P.yellow, 20, 22); ctx.restore(); }
  // torn wipe into the opening scene, which is drawn at the matching negative time
  const tw = at("loopback/which") - 0.1, end = TL.duration;
  const k = eio(pp(t, tw, 0.45));
  if (k > 0) {
    const edge = lerp(W + 40, -60, k);
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.clip(); CU.hook(t - end, SC[0]); ctx.restore();
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.shadowColor = "rgba(30,15,5,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = -8; ctx.strokeStyle = "#fbf5e8"; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  }
};

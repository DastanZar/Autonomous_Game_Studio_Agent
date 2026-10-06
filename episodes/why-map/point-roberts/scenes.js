// Point Roberts, version A: ART-DIRECTED PAPER.
// Method (the Emu War's craft, made explicit):
//   1. one palette for the whole film, 4-5 tones per beat, one accent (red = the border / Canada);
//   2. one hero per beat at 50-80% of the frame, everything else quieter (aerial perspective);
//   3. every asset is an illustration: bezier silhouettes, a light from the top-left (rim light + core shadow
//      on every paper piece), contact shadows, anatomy for characters;
//   4. a recurring character (an original Point Roberts local) carries the story;
//   5. data lives on designed paper props (census card, passport, water bill, receipt), like the telegram;
//   6. animation principles: anticipation, overshoot, follow-through, secondary motion, a moving camera.
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const at = c => cue(c);
const pp = (t, a, d) => clamp((t - a) / d);
const ease2 = k => k * k * (3 - 2 * k);
const spring = (k, f = 4.5, d = 5) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-d * k) * Math.cos(f * Math.PI * k);   // overshoot then settle

// ---------- the palette (Pacific Northwest, autumn) ----------
const A = {
  ink: "#2b2320", paper: "#efe4cc", cream: "#f7efdf",
  sky: "#ecdcbd", sky2: "#e2c79c", sun: "#f1c35c",
  mtnFar: "#a9b3ad", mtnMid: "#8a9a97", snow: "#f3ede0",
  sea: "#93b4ae", sea2: "#7fa29c", seaHi: "#c4d9d2",
  land: "#d9c08f", land2: "#c9aa75", moss: "#7d8a52", moss2: "#65733f", pine: "#4f6142", pine2: "#3e4f35",
  road: "#6e6a61", road2: "#5b574f", wood: "#8a6142", wood2: "#6f4c33",
  red: "#b8432c", red2: "#93321f", us: "#d98a3d", navy: "#2f3f5c", mustard: "#d9a441",
  sage: "#6f8f86", sage2: "#58766e", denim: "#4a5a70", skin: "#e6c09a", skin2: "#cfa47c", beard: "#6b4a32",
};
const tone = (hex, k) => {        // lighten (k>0) or darken (k<0); always returns #rrggbb so tones can be toned again
  const n = parseInt(hex.slice(1), 16), f = v => Math.round(clamp(k < 0 ? v * (1 + k) : v + (255 - v) * k, 0, 255));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, "0")).join("");
};

// ---------- the lit paper piece: fill, rim light (top-left), core shadow (bottom-right), ink ----------
function piece(path, col, o = {}) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) { ctx.shadowColor = o.sc || "rgba(40,25,12,0.30)"; ctx.shadowOffsetX = o.sx ?? 5; ctx.shadowOffsetY = o.sy ?? 8; ctx.shadowBlur = o.sb ?? 7; }
  ctx.beginPath(); path(); ctx.fillStyle = col; ctx.fill(o.rule || "nonzero");
  ctx.shadowColor = "transparent";
  if (o.light !== false) {
    const w = o.rim ?? 7;
    ctx.save(); ctx.beginPath(); path(); ctx.clip(o.rule || "nonzero");
    ctx.lineJoin = "round";
    ctx.save(); ctx.translate(w * 0.5, w * 0.6); ctx.beginPath(); path(); ctx.strokeStyle = tone(col, 0.22); ctx.lineWidth = w; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(-w * 0.6, -w * 0.8); ctx.beginPath(); path(); ctx.strokeStyle = tone(col, -0.16); ctx.lineWidth = w * 1.6; ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  if (o.lw !== 0) { ctx.beginPath(); path(); ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.ink || A.ink; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
  ctx.restore();
}
const footShadow = (x, y, w, a = 0.22) => { ctx.save(); ctx.fillStyle = `rgba(40,25,12,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, 7); ctx.fill(); ctx.restore(); };
function blob(cx, cy, rx, ry, n, seed, jag = 0.08) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283; const r = 1 + (rnd(seed, i) - 0.5) * jag * 2; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return () => smooth(pts); }

// ---------- flags (typeset in code), waving in slices ----------
const FIMG = {};
function mapleLeaf(g, cx, cy, s) {
  const L = [[0,-1],[.12,-.78],[.3,-.86],[.22,-.42],[.46,-.64],[.54,-.5],[.78,-.58],[.68,-.32],[.84,-.24],[.48,.04],[.55,.18],[.08,.12],[.07,.55],[-.07,.55],[-.08,.12],[-.55,.18],[-.48,.04],[-.84,-.24],[-.68,-.32],[-.78,-.58],[-.54,-.5],[-.46,-.64],[-.22,-.42],[-.3,-.86],[-.12,-.78]];
  g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s)); g.closePath();
}
function flagImg(kind) {
  if (FIMG[kind]) return FIMG[kind];
  const c = document.createElement("canvas"), w = 380, h = 200; c.width = w; c.height = h; const g = c.getContext("2d");
  if (kind === "US") {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? A.cream : A.red; g.fillRect(0, i * h / 13, w, h / 13 + 1); }
    g.fillStyle = A.navy; g.fillRect(0, 0, w * 0.4, h * 7 / 13); g.fillStyle = A.cream;
    for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) { g.beginPath(); g.arc(12 + k * 25 + (r % 2 ? 12 : 0), 9 + r * 11.5, 3.4, 0, 7); g.fill(); }
  } else {
    g.fillStyle = A.red; g.fillRect(0, 0, w, h); g.fillStyle = A.cream; g.fillRect(w / 4, 0, w / 2, h);
    g.fillStyle = A.red; mapleLeaf(g, w / 2, h * 0.52, h * 0.4); g.fill(); g.fillRect(w / 2 - 4, h * 0.6, 8, h * 0.2);
  }
  return (FIMG[kind] = c);
}
function flag(kind, x, y, w, ph = 0, amp) {
  const img = flagImg(kind), h = w * img.height / img.width, N = 26; amp = amp ?? w * 0.06;
  const dy = u => Math.sin(u * 5.5 - T * 5.5 + ph) * amp * u;
  ctx.save(); ctx.shadowColor = "rgba(40,25,12,0.28)"; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 7; ctx.shadowBlur = 6;
  ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();
  for (let i = 0; i < N; i++) { const u = i / N; ctx.drawImage(img, img.width * u, 0, img.width / N + 1, img.height, x + w * u, y + dy(u), w / N + 1, h); const l = Math.cos(u * 5.5 - T * 5.5 + ph); ctx.fillStyle = l > 0 ? `rgba(255,250,235,${l * 0.18})` : `rgba(30,20,10,${-l * 0.22})`; ctx.fillRect(x + w * u, y + dy(u), w / N + 1, h); }
  ctx.save(); ctx.strokeStyle = A.ink; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.stroke(); ctx.restore();
}
function pole(kind, x, gy, h, w, ph) {
  piece(() => ctx.roundRect(x - 6, gy - h, 12, h, 4), "#d8d1c2", { lw: 3, rim: 4 });
  piece(() => ctx.arc(x, gy - h - 7, 10, 0, 7), A.mustard, { lw: 3, rim: 4 });
  flag(kind, x + 5, gy - h + 4, w, ph);
}

// ---------- the world (side view): layered, with aerial perspective ----------
const GY = 1120;
function sky(o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, o.top || A.sky2); g.addColorStop(1, o.bot || A.sky);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sx = o.sunX ?? 820, sy = o.sunY ?? 430;
  if (o.sun !== false) {
    const rg = ctx.createRadialGradient(sx, sy, 60, sx, sy, 300); rg.addColorStop(0, "rgba(250,225,150,0.55)"); rg.addColorStop(1, "rgba(250,225,150,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    piece(() => ctx.arc(sx, sy, 88, 0, 7), A.sun, { lw: 4, rim: 10 });
  }
  for (let i = 0; i < 4; i++) {
    const span = W + 600, cx = ((rnd(i, 61) * span + T * (10 + 8 * rnd(i, 62)) - (o.scroll || 0) * 0.04) % span + span) % span - 300, cy = 250 + rnd(i, 63) * 300, s = 0.7 + rnd(i, 64) * 0.5;
    piece(blob(cx, cy, 150 * s, 44 * s, 16, i, 0.12), A.cream, { lw: 3, rim: 6, sx: 3, sy: 6, alpha: 0.95 });
  }
}
function ridge(base, amp, col, par, seed, scroll, snow) {
  const off = scroll * par, pts = [];
  for (let x = -80; x <= W + 80; x += 24) { const u = (x + off) / 300; const k = Math.floor(u), f = u - k; const h = lerp(rnd(k, seed), rnd(k + 1, seed), ease2(f)); pts.push([x, base - amp * (0.35 + 0.65 * h) * (0.85 + 0.15 * Math.sin(u * 7 + seed))]); }
  const path = () => { ctx.moveTo(-80, GY + 40); pts.forEach(p => ctx.lineTo(...p)); ctx.lineTo(W + 80, GY + 40); ctx.closePath(); };
  piece(path, col, { lw: 3.5, rim: 8, shadow: false });
  if (snow) { ctx.save(); ctx.beginPath(); path(); ctx.clip(); ctx.fillStyle = A.snow; ctx.beginPath(); ctx.moveTo(-80, base - amp * 0.72); for (let x = -80; x <= W + 80; x += 24) ctx.lineTo(x, base - amp * (0.72 + 0.06 * Math.sin(x * 0.05 + seed))); ctx.lineTo(W + 80, -10); ctx.lineTo(-80, -10); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
function haze(y0, y1, a = 0.35) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(236,220,189,${a})`); g.addColorStop(1, "rgba(236,220,189,0)"); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }
function water(y0, y1, scroll = 0) {
  piece(() => ctx.rect(-20, y0, W + 40, y1 - y0), A.sea, { lw: 3.5, rim: 8, shadow: false });
  ctx.save(); ctx.strokeStyle = "rgba(255,250,235,0.55)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (let i = 0; i < 26; i++) { const x = ((rnd(i, 71) * (W + 200) - scroll * 0.25 + T * 18) % (W + 200) + W + 200) % (W + 200) - 100, y = y0 + 12 + rnd(i, 72) * (y1 - y0 - 24), l = 14 + rnd(i, 73) * 26, a = 0.5 + 0.5 * Math.sin(T * 2 + i); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); }
  ctx.restore();
}
function pine(x, gy, s, id, col = A.pine, far = 1) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.rotate(Math.sin(T * 1.2 + id) * 0.012);
  piece(() => ctx.roundRect(-8, -36, 16, 40, 3), A.wood2, { lw: 3, rim: 3, sx: 3, sy: 4 });
  const tiers = [[78, -30, -120], [62, -86, -170], [44, -138, -214], [28, -184, -250]];
  tiers.forEach(([w, y, top], i) => piece(() => { ctx.moveTo(-w, y); ctx.quadraticCurveTo(-w * 0.45, y - 10, -w * 0.2, (y + top) / 2 + 4); ctx.lineTo(0, top); ctx.lineTo(w * 0.2, (y + top) / 2 + 4); ctx.quadraticCurveTo(w * 0.45, y - 10, w, y); ctx.quadraticCurveTo(0, y + 12, -w, y); ctx.closePath(); }, i % 2 ? tone(col, -0.1) : col, { lw: 3.5 * far, rim: 6, sx: 3 * far, sy: 5 * far, ink: far < 1 ? "#4a4436" : A.ink }));
  ctx.restore();
}
function grass(y0, y1, scroll, col = A.moss) {
  piece(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y0); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y0 + Math.sin((x + scroll) * 0.009) * 8); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, col, { lw: 4.5, rim: 10, shadow: false });
  ctx.fillStyle = tone(col, -0.18);
  for (let i = 0; i < 90; i++) { const span = W + 100, x = ((rnd(i, 81) * span - scroll * (1 + rnd(i, 84) * 0.5)) % span + span) % span - 50, y = y0 + 30 + rnd(i, 82) * (y1 - y0 - 30), s = 0.6 + rnd(i, 83) * 0.8;
    ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.quadraticCurveTo(x - 6 * s, y - 14 * s, x - 3 * s, y - 20 * s); ctx.quadraticCurveTo(x - 1 * s, y - 8 * s, x, y - 3 * s); ctx.quadraticCurveTo(x + 3 * s, y - 16 * s, x + 7 * s, y - 22 * s); ctx.quadraticCurveTo(x + 6 * s, y - 8 * s, x + 9 * s, y); ctx.closePath(); ctx.fill(); }
}
function road(y0, y1, scroll = 0) {
  piece(() => ctx.rect(-20, y0, W + 40, y1 - y0), A.road, { lw: 4, rim: 6, sx: 0, sy: 5 });
  ctx.fillStyle = "rgba(255,240,200,0.06)"; for (let i = 0; i < 60; i++) ctx.fillRect(((rnd(i, 91) * W - scroll) % W + W) % W, y0 + rnd(i, 92) * (y1 - y0), 3, 3);
  const dash = 80, off = ((scroll % (dash * 2)) + dash * 2) % (dash * 2);
  ctx.fillStyle = A.mustard; for (let x = -dash * 2 - off; x < W + dash; x += dash * 2) ctx.fillRect(x, (y0 + y1) / 2 - 5, dash, 10);
  piece(() => ctx.rect(-20, y1, W + 40, 18), "#a19a8b", { lw: 3, rim: 3, shadow: false });
}

// ---------- characters ----------
// The local: an original Point Roberts resident (knit cap, beard, buffalo-check jacket). Feet at origin, ~330 tall,
// facing +x. o: x, gy, s, dir, walk (phase) | null, look (-1..1), brow (-1 worried .. 1 flat/annoyed), blink seed,
// arm ("wave" | "hold" | null), carry (fn drawn in the right hand), sit (only head and shoulders, for vehicles)
function local(o) {
  const s = o.s || 1, ph = o.walk;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 3, 0.6 / s);
  const sw = ph == null ? 0 : Math.sin(ph), bob = ph == null ? Math.sin(T * 2.2 + (o.id || 0)) * 1.5 : -Math.abs(Math.cos(ph)) * 7;
  if (!o.sit) {
    footShadow(0, 2, 70);
    ctx.translate(0, bob);
    // legs: hip -> knee -> foot, the knee bends on the forward swing
    for (const side of [1, -1]) {
      const a = sw * 0.42 * side, bend = ph == null ? 0 : Math.max(0, Math.sin(ph + (side > 0 ? 0 : Math.PI) + 0.9)) * 0.7;
      const hip = [side * 5, -130], knee = [hip[0] + Math.sin(a) * 64, hip[1] + Math.cos(a) * 64];
      const foot = [knee[0] + Math.sin(a - bend) * 64, knee[1] + Math.cos(a - bend) * 64];
      stroke2(() => { ctx.moveTo(...hip); ctx.lineTo(...knee); ctx.lineTo(...foot); }, side > 0 ? A.denim : tone(A.denim, -0.12), 26, 34);
      piece(() => ctx.roundRect(foot[0] - 16, foot[1] - 12, 44, 20, [8, 12, 4, 4]), A.wood2, { lw: 3.5, rim: 4, shadow: false });
    }
  } else ctx.translate(0, bob);
  // torso: a buffalo-check jacket
  const torso = () => { ctx.moveTo(-40, -240); ctx.quadraticCurveTo(-48, -170, -42, -118); ctx.quadraticCurveTo(0, -108, 42, -118); ctx.quadraticCurveTo(50, -170, 40, -240); ctx.quadraticCurveTo(0, -256, -40, -240); ctx.closePath(); };
  piece(torso, A.red, { lw: 4.5, rim: 9 });
  ctx.save(); ctx.beginPath(); torso(); ctx.clip(); ctx.fillStyle = "rgba(43,35,32,0.42)";
  for (let gx = -60; gx < 60; gx += 28) ctx.fillRect(gx, -260, 14, 160); for (let gy = -260; gy < -100; gy += 28) ctx.fillRect(-60, gy, 120, 14); ctx.restore();
  ctx.save(); ctx.beginPath(); torso(); ctx.lineWidth = 4.5; ctx.strokeStyle = A.ink; ctx.stroke(); ctx.restore();
  // arms: shoulder -> elbow -> mitten
  const arm = (side, ang, el) => {
    const sh = [side > 0 ? 16 : -12, -226], elb = [sh[0] + Math.sin(ang) * 52, sh[1] + Math.cos(ang) * 52], hand = [elb[0] + Math.sin(ang + el) * 50, elb[1] + Math.cos(ang + el) * 50];
    stroke2(() => { ctx.moveTo(...sh); ctx.lineTo(...elb); ctx.lineTo(...hand); }, side > 0 ? A.red : A.red2, 22, 30);
    piece(() => ctx.arc(hand[0], hand[1], 14, 0, 7), A.skin, { lw: 3.5, rim: 4, shadow: false });
    return hand;
  };
  const wave = o.arm === "wave" ? Math.sin(T * 10) * 0.35 : 0;
  arm(-1, sw * 0.5 + 0.05, 0.35);
  const hand = o.arm === "wave" ? arm(1, Math.PI - 0.5 + wave, 0.5) : o.arm === "hold" ? arm(1, 0.9, 1.0) : arm(1, -sw * 0.5 + 0.05, 0.35);
  if (o.carry) { ctx.save(); ctx.translate(...hand); o.carry(); ctx.restore(); }
  // head
  ctx.save(); ctx.translate(6, -282); ctx.rotate((o.tilt || 0) + Math.sin(T * 1.7 + (o.id || 0)) * 0.02);
  piece(() => { ctx.ellipse(0, 0, 40, 44, 0, 0, 7); }, A.skin, { lw: 4, rim: 7 });
  piece(() => ctx.ellipse(-30, 4, 9, 13, 0, 0, 7), A.skin2, { lw: 3, rim: 3, shadow: false });                  // ear
  piece(() => { ctx.moveTo(-34, 4); ctx.quadraticCurveTo(-36, 50, 2, 56); ctx.quadraticCurveTo(40, 52, 40, 8); ctx.quadraticCurveTo(26, 20, 8, 20); ctx.quadraticCurveTo(-14, 22, -34, 4); ctx.closePath(); }, A.beard, { lw: 4, rim: 5, shadow: false });
  piece(() => ctx.ellipse(36, -2, 9, 11, 0.3, 0, 7), A.skin2, { lw: 3, rim: 3, shadow: false });                // nose
  const bl = o.blink != null ? (((T + o.blink) % 3.7) < 0.12) : false, lx = (o.look || 0) * 4;
  if (bl) line(10, -6, 26, -6, A.ink, 3.5);
  else { piece(() => ctx.ellipse(18, -6, 8, 10, 0, 0, 7), A.cream, { lw: 3, light: false, shadow: false }); ctx.fillStyle = A.ink; ctx.beginPath(); ctx.arc(20 + lx, -5, 4.2, 0, 7); ctx.fill(); }
  const br = o.brow || 0; line(8, -22 + br * 2, 30, -22 - br * 4 + (br < 0 ? 6 : 0), A.ink, 4.5);
  line(16, 34, 30, 33 + (o.mouth === "o" ? 0 : 0), A.cream, 3);
  // knit cap with a fold and a pom
  piece(() => { ctx.moveTo(-42, -12); ctx.quadraticCurveTo(-46, -64, 0, -70); ctx.quadraticCurveTo(46, -64, 42, -12); ctx.closePath(); }, A.mustard, { lw: 4, rim: 6, shadow: false });
  piece(() => ctx.roundRect(-46, -26, 92, 22, 8), tone(A.mustard, -0.1), { lw: 4, rim: 4, shadow: false });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.25)"; ctx.lineWidth = 2.5; for (let k = -30; k <= 30; k += 12) { ctx.beginPath(); ctx.moveTo(k, -26); ctx.lineTo(k * 0.8, -62); ctx.stroke(); } ctx.restore();
  piece(() => ctx.arc(-4 + Math.sin(T * 6) * (ph == null ? 0.5 : 3), -78, 14, 0, 7), A.cream, { lw: 3.5, rim: 4, shadow: false });
  ctx.restore();
  ctx.restore();
}
// a school kid (smaller, backpack), reusing the same construction language
function kidHead(x, y, s, id, look = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(T * 6 + id) * 0.05);
  const skin = [A.skin, "#c99a72", "#8d5f3e", "#e3b48c"][id % 4];
  piece(() => ctx.ellipse(0, 0, 24, 26, 0, 0, 7), skin, { lw: 3, rim: 4, shadow: false });
  piece(() => { ctx.moveTo(-25, -2); ctx.quadraticCurveTo(-24, -32, 2, -30); ctx.quadraticCurveTo(26, -28, 25, -4); ctx.quadraticCurveTo(10, -16, -25, -2); ctx.closePath(); }, ["#3b2a20", "#6b4a32", "#2b2320", "#a8743a"][id % 4], { lw: 3, rim: 3, shadow: false });
  ctx.fillStyle = A.ink; ctx.beginPath(); ctx.arc(8 + look * 3, 0, 3.2, 0, 7); ctx.arc(-6 + look * 3, 0, 3.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(1, 10, 6, 0.2, 2.9); ctx.strokeStyle = A.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
// an 1850s surveyor: frock coat, top hat, a chain over the shoulder; feet at origin, ~300 tall
function surveyor(o) {
  const s = o.s || 1, ph = o.walk;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 9, 0.6 / s);
  const sw = ph == null ? 0 : Math.sin(ph); footShadow(0, 2, 60);
  ctx.translate(0, ph == null ? 0 : -Math.abs(Math.cos(ph)) * 6);
  for (const side of [1, -1]) { ctx.save(); ctx.translate(side * 8, -120); ctx.rotate(sw * 0.4 * side); piece(() => ctx.roundRect(-10, 0, 20, 112, 6), "#3a3530", { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.roundRect(-12, 104, 34, 16, 6), A.ink, { lw: 3, light: false, shadow: false }); ctx.restore(); }
  piece(() => { ctx.moveTo(-36, -232); ctx.quadraticCurveTo(-44, -150, -46, -96); ctx.lineTo(44, -96); ctx.quadraticCurveTo(42, -150, 36, -232); ctx.quadraticCurveTo(0, -246, -36, -232); ctx.closePath(); }, o.col || "#4a5560", { lw: 4.5, rim: 8 });
  stroke2(() => { ctx.moveTo(30, -220); ctx.lineTo(48 + sw * 10, -160); ctx.lineTo(56 + sw * 14, -112); }, o.col || "#4a5560", 18, 26);
  piece(() => ctx.arc(56 + sw * 14, -108, 11, 0, 7), A.skin, { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(4, -272);
  piece(() => ctx.ellipse(0, 0, 32, 36, 0, 0, 7), A.skin, { lw: 4, rim: 6 });
  piece(() => { ctx.moveTo(-28, 6); ctx.quadraticCurveTo(-30, 44, 4, 46); ctx.quadraticCurveTo(34, 42, 32, 8); ctx.quadraticCurveTo(10, 22, -28, 6); ctx.closePath(); }, o.beard || "#8a8070", { lw: 3.5, rim: 4, shadow: false });
  ctx.fillStyle = A.ink; ctx.beginPath(); ctx.arc(16 + (o.look || 0) * 3, -6, 4, 0, 7); ctx.fill(); line(6, -20 + (o.brow || 0) * 3, 26, -22 - (o.brow || 0) * 3, A.ink, 4);
  piece(() => ctx.roundRect(-30, -40, 60, 10, 4), A.ink, { lw: 3, light: false, shadow: false });
  piece(() => ctx.roundRect(-22, -96, 44, 60, 4), "#2b2724", { lw: 3.5, rim: 4, shadow: false });
  ctx.restore();
  ctx.restore();
}

// ---------- vehicles ----------
// the local's car: a sage station wagon, facing +x; wheels at gy. o: x, gy, s, spin, squat (anticipation), driver
function wagon(o) {
  const s = o.s || 1;
  footShadow(o.x + 10 * s, o.gy + 2, 150 * s, 0.25);
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 5, 0.4 / s);
  const sq = o.squat || 0, bob = o.moving === false ? 0 : Math.sin((o.ph ?? T) * 17) * 1.6;
  ctx.save(); ctx.translate(0, -bob + sq * 6); ctx.rotate(-sq * 0.035);
  const body = () => { ctx.moveTo(-170, -42); ctx.quadraticCurveTo(-176, -96, -150, -104); ctx.lineTo(-120, -106); ctx.lineTo(-104, -168); ctx.quadraticCurveTo(-100, -176, -88, -176); ctx.lineTo(40, -176); ctx.quadraticCurveTo(56, -176, 66, -164); ctx.lineTo(104, -112); ctx.quadraticCurveTo(168, -106, 176, -84); ctx.quadraticCurveTo(182, -58, 176, -42); ctx.closePath(); };
  piece(body, A.sage, { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(-160, -86); ctx.lineTo(170, -86); ctx.lineTo(172, -74); ctx.lineTo(-162, -74); ctx.closePath(); }, A.cream, { lw: 2.5, rim: 2, shadow: false });     // wood-grain stripe
  const win = (x0, x1, x2, x3) => () => { ctx.moveTo(x0, -110); ctx.lineTo(x1, -164); ctx.lineTo(x2, -164); ctx.lineTo(x3, -110); ctx.closePath(); };
  [win(-102, -90, -34, -34), win(-24, -24, 34, 34), win(44, 44, 56, 92)].forEach(w => {
    piece(w, "#bfd3cf", { lw: 3, rim: 4, shadow: false });
    ctx.save(); ctx.beginPath(); w(); ctx.clip(); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-120, -110); ctx.lineTo(-60, -170); ctx.moveTo(0, -110); ctx.lineTo(60, -170); ctx.stroke(); ctx.restore();
  });
  if (o.driver !== false) { ctx.save(); ctx.beginPath(); win(44, 44, 56, 92)(); win(-24, -24, 34, 34)(); ctx.clip(); local({ x: 26, gy: 76, s: 0.75, sit: true, blink: 1.3, look: o.look ?? 1, brow: o.brow, id: 3 }); ctx.restore(); }
  piece(() => ctx.roundRect(166, -70, 18, 14, 4), "#f6dc8a", { lw: 2.5, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-182, -56, 30, 12, 4), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false });
  piece(() => ctx.roundRect(160, -50, 30, 12, 4), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false });
  if (o.plate) { piece(() => ctx.rect(-176, -72, 34, 20), A.cream, { lw: 2, light: false, shadow: false }); text("WA", -159, -57, { size: 14 }); }
  // antenna with follow-through
  const wob = Math.sin(T * 9) * 0.06 + (o.accel || 0) * 0.35;
  ctx.save(); ctx.translate(-88, -176); ctx.rotate(-0.2 - wob); line(0, 0, 0, -70, A.ink, 3); ctx.restore();
  for (const wx of [-108, 112]) piece(() => { ctx.moveTo(wx - 58, -40); ctx.quadraticCurveTo(wx, -96, wx + 58, -40); ctx.closePath(); }, A.sage2, { lw: 3.5, rim: 3, shadow: false });
  ctx.restore();
  for (const wx of [-108, 112]) {
    ctx.save(); ctx.translate(wx, -32);
    piece(() => ctx.arc(0, 0, 34, 0, 7), "#2f2a25", { lw: 3.5, rim: 5, shadow: false });
    piece(() => ctx.arc(0, 0, 18, 0, 7), "#c9c4b6", { lw: 3, rim: 3, shadow: false });
    ctx.rotate(o.spin || 0); ctx.strokeStyle = A.ink; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}
function exhaust(x, y, t, n = 5, col = "#e6dccb") {
  for (let i = 0; i < n; i++) { const a = ((t * 1.6 + i / n) % 1); ctx.save(); ctx.globalAlpha = (1 - a) * 0.8; piece(blob(x - a * 140, y - a * 60, 14 + a * 34, 12 + a * 26, 10, i, 0.15), col, { lw: 2.5, rim: 4, shadow: false }); ctx.restore(); }
}
// Canadian border booth, the barrier pivots on its post; open 0..1 with a spring overshoot. Traffic comes from the left.
function borderBooth(x, gy, s, open, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(o.id || 33, 0.3);
  footShadow(0, 4, 210, 0.2);
  // canopy
  for (const px of [-170, 170]) piece(() => ctx.roundRect(px - 9, -300, 18, 300, 4), "#ddd6c6", { lw: 3.5, rim: 4 });
  piece(() => { ctx.moveTo(-220, -300); ctx.quadraticCurveTo(0, -350, 220, -300); ctx.lineTo(220, -262); ctx.quadraticCurveTo(0, -306, -220, -262); ctx.closePath(); }, A.cream, { lw: 4.5, rim: 8 });
  piece(() => { ctx.moveTo(-220, -276); ctx.quadraticCurveTo(0, -320, 220, -276); ctx.lineTo(220, -262); ctx.quadraticCurveTo(0, -306, -220, -262); ctx.closePath(); }, A.red, { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(0, -322); ctx.fillStyle = A.red; mapleLeaf(ctx, 0, 0, 22); ctx.fill(); ctx.restore();
  text(o.label || "CANADA", 0, -270, { size: 26, color: A.cream, ls: 6 });
  // kiosk
  piece(() => ctx.roundRect(-70, -200, 140, 200, [10, 10, 0, 0]), "#e8e1d1", { lw: 4, rim: 6 });
  piece(() => ctx.roundRect(-54, -184, 108, 76, 6), "#bfd3cf", { lw: 3, rim: 4, shadow: false });
  if (o.officer !== false) { ctx.save(); ctx.beginPath(); ctx.roundRect(-54, -184, 108, 76, 6); ctx.clip();
    piece(() => ctx.ellipse(-8, -112, 34, 26, 0, Math.PI, 0), o.uniform || "#1f2b44", { lw: 3, rim: 3, shadow: false });
    piece(() => ctx.arc(-8, -142, 18, 0, 7), A.skin, { lw: 3, rim: 3, shadow: false });
    piece(() => { ctx.moveTo(-28, -152); ctx.quadraticCurveTo(-8, -170, 14, -152); ctx.lineTo(20, -150); ctx.lineTo(-30, -150); ctx.closePath(); }, o.uniform || "#1f2b44", { lw: 2.5, rim: 2, shadow: false });
    ctx.fillStyle = A.ink; ctx.beginPath(); ctx.arc(-14 + (o.look || -1) * 3, -142, 2.6, 0, 7); ctx.arc(-2 + (o.look || -1) * 3, -142, 2.6, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // barrier on its own post, left of the kiosk
  const px = x - 150 * s, py = gy - 70 * s;
  ctx.save(); ctx.translate(px, py); ctx.scale(-s, s); ctx.rotate(-open * 1.4);
  piece(() => ctx.roundRect(0, -11, 300, 22, 10), A.cream, { lw: 3.5, rim: 4 });
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, -11, 300, 22, 10); ctx.clip(); ctx.fillStyle = A.red; for (let i = 0; i < 6; i++) ctx.fillRect(20 + i * 48, -11, 22, 22); ctx.restore();
  ctx.beginPath(); ctx.roundRect(0, -11, 300, 22, 10); ctx.lineWidth = 3.5; ctx.strokeStyle = A.ink; ctx.stroke();
  ctx.restore();
  piece(() => ctx.roundRect(px - 16 * s, py - 10 * s, 32 * s, 80 * s, 6), "#5e5a52", { lw: 3.5, rim: 4 });
}
// a school bus, facing +x (dir flips)
function schoolBus(x, gy, s, dir, ph, o = {}) {
  footShadow(x, gy + 2, 260 * s, 0.25);
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s); boil(88, 0.4 / s);
  ctx.translate(0, Math.sin(ph * 15) * 1.8);
  const body = () => { ctx.moveTo(-260, -46); ctx.lineTo(-262, -210); ctx.quadraticCurveTo(-260, -230, -236, -232); ctx.lineTo(170, -232); ctx.quadraticCurveTo(190, -230, 194, -210); ctx.lineTo(198, -150); ctx.quadraticCurveTo(262, -146, 270, -110); ctx.lineTo(272, -46); ctx.closePath(); };
  piece(body, "#e9b23a", { lw: 4.5, rim: 10 });
  piece(() => ctx.rect(-262, -122, 534, 12), A.ink, { lw: 0, light: false, shadow: false });
  piece(() => ctx.rect(-262, -96, 534, 8), A.ink, { lw: 0, light: false, shadow: false });
  for (let i = 0; i < 6; i++) {
    const wx = -236 + i * 66;
    piece(() => ctx.roundRect(wx, -212, 52, 66, 6), "#bfd3cf", { lw: 3, rim: 4, shadow: false });
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, -212, 52, 66, 6); ctx.clip(); kidHead(wx + 26, -160 + Math.sin(ph * 9 + i * 1.3) * 3, 0.9, i + (o.seed || 0), dir); ctx.restore();
  }
  piece(() => ctx.roundRect(176, -212, 40, 60, 6), "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.scale(dir, 1); text("SCHOOL BUS", dir > 0 ? -40 : 40, -66, { size: 30, color: A.ink, ls: 4 }); ctx.restore();
  piece(() => ctx.roundRect(262, -96, 16, 16, 3), "#f6dc8a", { lw: 2.5, rim: 2, shadow: false });
  ctx.restore();
  for (const wx of [-170, 190]) { ctx.save(); ctx.translate(x + wx * s * dir, gy - 32 * s); ctx.scale(s, s); piece(() => ctx.arc(0, 0, 36, 0, 7), "#2f2a25", { lw: 3.5, rim: 5, shadow: false }); piece(() => ctx.arc(0, 0, 17, 0, 7), "#c9c4b6", { lw: 3, rim: 3, shadow: false }); ctx.rotate(ph * 22 * dir); line(-14, 0, 14, 0, A.ink, 3); ctx.restore(); }
}

// ---------- designed paper props for the numbers (the telegram's descendants) ----------
function card(x, y, w, h, rot, k, draw, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - k) * 80); ctx.rotate(rot + (1 - k) * 0.12); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); ctx.globalAlpha *= clamp(k * 3);
  piece(() => ctx.rect(-w / 2, -h / 2, w, h), o.bg || A.cream, { lw: 4, rim: 6, sx: 10, sy: 16, sb: 18 });
  if (o.tape !== false) { ctx.save(); ctx.translate(0, -h / 2); ctx.rotate(-0.04); ctx.fillStyle = "rgba(230,215,170,0.85)"; ctx.fillRect(-60, -16, 120, 32); ctx.restore(); }
  draw(w, h);
  ctx.restore();
}
const typed = (str, k) => str.slice(0, Math.round(str.length * clamp(k)));
function rule(x0, x1, y) { line(x0, y, x1, y, "rgba(43,35,32,0.45)", 2); }

// =====================================================================================================
// shared overlays
// =====================================================================================================
function brandTag() { ctx.save(); ctx.translate(40, 248); piece(() => ctx.rect(0, -22, 236, 44), A.ink, { lw: 0, light: false, sx: 3, sy: 4 }); text("BORDER QUIRKS", 118, 10, { size: 26, font: "Elite", color: A.cream, ls: 2 }); ctx.restore(); }
function woodSign(x, y, lines, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot || 0) + (1 - k) * 0.3); ctx.scale(k, k);
  for (const px of [-o.w / 2 + 40, o.w / 2 - 40]) piece(() => ctx.roundRect(px - 10, 0, 20, o.post || 200, 4), A.wood2, { lw: 3.5, rim: 4 });
  const h = lines.length * 54 + 40;
  piece(() => ctx.roundRect(-o.w / 2, -h, o.w, h, 10), A.wood, { lw: 4.5, rim: 8 });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.18)"; ctx.lineWidth = 2; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-o.w / 2 + 10, -h + i * h / 5); ctx.quadraticCurveTo(0, -h + i * h / 5 + 6, o.w / 2 - 10, -h + i * h / 5); ctx.stroke(); } ctx.restore();
  lines.forEach(([str, size, col], i) => text(str, 0, -h + 58 + i * 54, { size, color: col || A.cream, font: o.font || "Anton", ls: 2 }));
  ctx.restore();
}

// =====================================================================================================
// 1. HOOK: the local drives the town's one road out; the Canadian booth ahead. Frame 0 is finished.
// =====================================================================================================
const HOOK_Y = 1150;                                       // the road's wheel line
function hookCarX(t) { const ta = at("hook/through"); if (t < ta - 0.7) return 330 + 130 * t; const xs = 330 + 130 * (ta - 0.7); if (t < ta + 0.15) return xs + 80 * eout(pp(t, ta - 0.7, 0.85)); return xs + 80 + 300 * Math.pow(t - ta - 0.15, 1.4); }
const hookCam = t => 40 + 80 * t + 160 * eio(pp(t, at("hook/goes"), 1.3));
function hookWorld(t, cam) {
  sky({ sunX: 860, sunY: 420, scroll: cam });
  ridge(880, 360, A.mtnFar, 0.05, 7, cam, true); haze(560, 900, 0.45);
  ridge(930, 200, A.mtnMid, 0.1, 11, cam, false); haze(780, 960, 0.35);
  water(905, 1010, cam);
  grass(1000, 1060, cam * 0.6, A.moss);
  ctx.save(); ctx.translate(-cam * 0.6, 0);                // the far shore of the road: trees and the town
  for (let i = 0; i < 12; i++) pine(-300 + i * 170 + rnd(i, 3) * 70, 1050, 0.55 + rnd(i, 4) * 0.25, i, tone(A.moss, -0.05), 0.55);
  woodSign(560, 930, [["POINT ROBERTS", 40], ["WASHINGTON · USA", 26, A.mustard]], 1, { w: 360, post: 140 });
  ctx.restore();
  ctx.save(); ctx.translate(-cam, 0);
  pole("US", 150, 1070, 300, 150, 0.2);
  borderBooth(1180, 1078, 0.92, spring(pp(t, at("hook/through") - 0.45, 0.9)), { look: -1 });
  pole("CA", 1470, 1070, 290, 140, 1.4);
  ctx.restore();
  road(1070, 1200, cam);
}
// the near ground: one lit plane that darkens toward the viewer, a few tufts, flowers and stones; no clutter
function nearGround(y0, scroll, col = A.moss) {
  piece(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y0); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y0 + Math.sin((x + scroll) * 0.007) * 6); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, col, { lw: 4.5, rim: 10, shadow: false });
  const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(40,30,15,0.28)"); ctx.fillStyle = g; ctx.fillRect(0, y0 + 10, W, H - y0);
  for (let i = 0; i < 26; i++) {
    const span = W + 200, x = ((rnd(i, 101) * span - scroll * 1.4) % span + span) % span - 100, y = y0 + 80 + rnd(i, 102) * (H - y0 - 120), s = 0.7 + (y - y0) / (H - y0) * 1.3;
    if (i % 5 === 0) piece(blob(x, y, 30 * s, 16 * s, 9, i, 0.2), "#b9ad93", { lw: 3, rim: 4, sx: 3, sy: 4 });
    else { ctx.fillStyle = tone(col, -0.22); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 9 * s - 4 * s, y); ctx.quadraticCurveTo(x + k * 12 * s, y - 26 * s, x + k * 16 * s, y - 34 * s); ctx.quadraticCurveTo(x + k * 9 * s + 2 * s, y - 14 * s, x + k * 9 * s + 4 * s, y); ctx.fill(); }
      if (i % 3 === 0) piece(() => ctx.arc(x + 6 * s, y - 30 * s, 6 * s, 0, 7), [A.cream, A.mustard, "#d98a8a"][i % 3], { lw: 2, rim: 2, shadow: false }); }
  }
}
function splitRail(y, scroll, col = A.wood) {        // a split-rail fence in the near ground, faster parallax
  const sp = 260, off = ((scroll % sp) + sp) % sp;
  for (let x = -sp - off; x < W + sp; x += sp) {
    piece(() => { ctx.moveTo(x - 10, y); ctx.lineTo(x - 8, y - 150); ctx.lineTo(x + 10, y - 156); ctx.lineTo(x + 12, y); ctx.closePath(); }, col, { lw: 3.5, rim: 5 });
    for (const ry of [-118, -64]) piece(() => { ctx.moveTo(x, y + ry); ctx.quadraticCurveTo(x + sp / 2, y + ry + 8, x + sp, y + ry - 4); ctx.lineTo(x + sp, y + ry + 14); ctx.quadraticCurveTo(x + sp / 2, y + ry + 24, x, y + ry + 16); ctx.closePath(); }, tone(col, 0.08), { lw: 3.5, rim: 5 });
  }
}
function hookFore(t, cam) { nearGround(1218, cam * 1.6); splitRail(1560, cam * 1.9); }
const HOOK_Z = 1.32;
CU.hook = (t, S) => {
  const cam = hookCam(t), cx = hookCarX(t);
  ctx.save(); ctx.translate(W * 0.42, HOOK_Y); ctx.scale(HOOK_Z, HOOK_Z); ctx.translate(-W * 0.42, -HOOK_Y);
  hookWorld(t, cam);
  const ta = at("hook/through"), sq = t > ta - 0.05 && t < ta + 0.35 ? Math.sin(pp(t, ta - 0.05, 0.4) * Math.PI) : 0;
  exhaust(cx - cam - 190, HOOK_Y - 50, t, 5);
  wagon({ x: cx - cam, gy: HOOK_Y, s: 1.18, spin: cx / 34, ph: t, squat: sq, accel: sq, plate: true, brow: t > at("hook/canada") ? 0.6 : 0 });
  hookFore(t, cam);
  ctx.restore();
  brandTag();
  const rk = spring(pp(t, at("hook/road") - 0.05, 0.6));
  card(800, 470, 330, 220, 0.04, rk, (w, h) => {
    text("ROADS OUT", 0, -40, { size: 34, font: "Elite" }); rule(-120, 120, -20);
    text("1", 0, 80, { size: 130, color: A.red });
  });
};

// =====================================================================================================
// maps (top-down), restyled: sea with depth bands along the coast, lit land, a quiet graticule
// =====================================================================================================
const PR_C = [-123.062, 48.986], BORDER_LAT = 49.0021;
function mapProj(cam) { const k = Math.cos(cam.lat * Math.PI / 180); return (lon, lat) => [cam.cx + (lon - cam.lon) * k * cam.s, cam.cy - (lat - cam.lat) * cam.s]; }
function ringsPath(polys, mp) { for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const p = mp(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); } }
const isPR = poly => poly[0].some(([lo, la]) => lo < -122.99 && lo > -123.12 && la > 48.95);
function prPolys(id) { const g = GEO[id]; const us = g && g.layers.find(L => L.iso === "US"); return us ? us.polys.filter(isPR) : []; }
function seaFlat(col = A.sea) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = "rgba(255,250,235,0.16)"; ctx.lineWidth = 2;
  for (let y = -40; y < H + 40; y += 30) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.012 + y * 0.03 + T * 0.9) * 5); ctx.stroke(); }
  ctx.restore();
}
// coast bands: the shallows drawn as soft rings outside the land, before the land itself
function mapLand(id, mp, fill, o = {}) {
  const g = GEO[id]; if (!g) { warn("no geometry for " + id); return; }
  const all = () => { for (const L of g.layers) ringsPath(L.polys, mp); };
  ctx.save(); ctx.lineJoin = "round";
  [[44, 0.10], [28, 0.14], [14, 0.22]].forEach(([w, a]) => { ctx.beginPath(); all(); ctx.strokeStyle = `rgba(214,232,224,${a})`; ctx.lineWidth = w; ctx.stroke(); });
  ctx.restore();
  for (const L of g.layers) {
    const polys = o.skipPR && L.iso === "US" ? L.polys.filter(p => !isPR(p)) : L.polys;
    piece(() => ringsPath(polys, mp), typeof fill === "function" ? fill(L.iso) : fill[L.iso] || A.land, { rule: "evenodd", lw: o.lw ?? 3.5, rim: o.rim ?? 9, sx: 5, sy: 8, sb: 9 });
  }
}
function borderOnMap(mp, lon0, lon1, k = 1, o = {}) {
  if (k <= 0) return; const a = mp(lon0, BORDER_LAT), b = mp(lerp(lon0, lon1, k), BORDER_LAT);
  ctx.save(); if (o.dash !== false) ctx.setLineDash([22, 12]); stroke2(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, A.red, o.w || 7, (o.w || 7) + 6); ctx.restore();
}
function mapLabel(str, x, y, size = 64, a = 0.55) { text(str, x, y, { size, color: `rgba(43,35,32,${a})`, ls: size * 0.18 }); }
function houseTop(x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); piece(() => ctx.rect(-14, -11, 28, 22), col, { lw: 2.5, rim: 4, sx: 2, sy: 3, sb: 2 }); line(-14, 0, 14, 0, "rgba(43,35,32,0.6)", 2); ctx.restore(); }
function treeTop(x, y, s, id) { piece(blob(x, y, 12 * s, 12 * s, 8, id, 0.25), (id % 2 ? A.pine : A.moss2), { lw: 2, rim: 3, sx: 2, sy: 3, sb: 2 }); }

// =====================================================================================================
// 2. WHO: the real coastline; the town's houses and woods; a census card fills in
// =====================================================================================================
CU.who = (t, S) => {
  const z = lerp(14000, 12000, eio(pp(t, S.t0, S.t1 - S.t0 + 0.6)));
  const cam = { lon: PR_C[0] + 0.002, lat: PR_C[1] + 0.002, s: z, cx: W / 2, cy: 840 };
  const mp = mapProj(cam);
  seaFlat();
  mapLand(S.id, mp, { US: A.us, CA: A.land });
  const path = new Path2D(); for (const poly of prPolys(S.id)) for (const ring of poly) { ring.forEach(([lo, la], j) => { const q = mp(lo, la); j ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1]); }); path.closePath(); }
  // the town drawn in: woods first, then houses, spreading from the border crossing
  const t1 = at("who/twelve");
  for (let i = 0; i < 260; i++) {
    const lo = lerp(-123.092, -123.03, rnd(i, 81)), la = lerp(48.968, 49.001, rnd(i, 82)), [x, y] = mp(lo, la);
    if (!ctx.isPointInPath(path, x, y)) continue;
    const d = Math.hypot(lo + 123.063, la - 49.0) * 60, k = back(pp(t, t1 - 0.2 + d * 0.5, 0.3));
    if (k <= 0) continue;
    if (i % 3) treeTop(x, y, k, i); else houseTop(x, y, k * 0.9, (rnd(i, 83) - 0.5) * 0.5, [A.cream, "#e5cfa9", "#d9b59a"][i % 3]);
  }
  mapLabel("CANADA", 300, 560, 96);
  const nb = mp(-123.0, BORDER_LAT); borderOnMap(mp, -123.25, -122.6, 1);
  tag("49°N", Math.min(W - 130, nb[0] + 120), nb[1] - 40, { size: 30, rot: 0.03 });
  // the census card, typed as it lands
  const ck = spring(pp(t, t1 - 0.15, 0.6)), tp = pp(t, t1, 1.2), t5 = at("who/five");
  card(770, 380, 420, 300, 0.03, ck, (w, h) => {
    text("U.S. CENSUS · 2020", 0, -h / 2 + 52, { size: 30, font: "Elite" }); rule(-170, 170, -h / 2 + 70);
    text("POINT ROBERTS, WA", 0, -h / 2 + 110, { size: 26, font: "Elite" });
    text("POPULATION", -175, 10, { size: 26, font: "Elite", align: "left" });
    text(fmt(Math.round(1191 * eout(tp))), 175, 14, { size: 54, align: "right", color: A.red });
    text("AREA", -175, 96, { size: 26, font: "Elite", align: "left" });
    if (t > t5) text(typed("≈ 5 SQ MI", pp(t, t5, 0.4)), 175, 98, { size: 44, align: "right", color: A.red });
  });
  if (t > t5) { ctx.save(); ctx.setLineDash([2400, 2400]); ctx.lineDashOffset = 2400 * (1 - eout(pp(t, t5, 0.8))); ctx.strokeStyle = A.mustard; ctx.lineWidth = 8; ctx.stroke(path); ctx.restore(); }
  brandTag();
};

// =====================================================================================================
// 3. TREATY: 1846, a desk; the real coastline on parchment; Britain holds the ruler, America draws the line
// =====================================================================================================
const NW_CAM = { lon: -121.6, lat: 48.6, s: 96, cx: W / 2, cy: 720 };
const LINE_E = -114.2, LINE_W = -124.4;
function desk() {
  ctx.fillStyle = A.wood; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { const y = i * 230 - 40; ctx.fillStyle = i % 2 ? A.wood2 : A.wood; ctx.fillRect(0, y, W, 226);
    ctx.strokeStyle = "rgba(255,230,190,0.07)"; ctx.lineWidth = 2; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(0, y + 22 + k * 30); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y + 22 + k * 30 + Math.sin(x * 0.009 + i * 2 + k) * 7); ctx.stroke(); }
    ctx.strokeStyle = "rgba(30,15,5,0.4)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const v = ctx.createRadialGradient(W / 2, 760, 300, W / 2, 760, 1100); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,10,0,0.45)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function parchment(draw) {
  ctx.save(); ctx.translate(W / 2, 735); ctx.rotate(-0.018); ctx.translate(-W / 2, -735);
  const pts = [], x0 = 50, y0 = 250, x1 = W - 50, y1 = 1215, n = 16;
  for (let i = 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), y0 + (rnd(i, 51) - 0.5) * 12]);
  for (let i = 0; i <= n; i++) pts.push([x1 + (rnd(i, 52) - 0.5) * 12, lerp(y0, y1, i / n)]);
  for (let i = n; i >= 0; i--) pts.push([lerp(x0, x1, i / n), y1 + (rnd(i, 53) - 0.5) * 12]);
  for (let i = n; i >= 0; i--) pts.push([x0 + (rnd(i, 54) - 0.5) * 12, lerp(y0, y1, i / n)]);
  const edge = () => { pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); };
  piece(edge, "#ead7ab", { lw: 3, rim: 14, sx: 12, sy: 18, sb: 22 });
  ctx.save(); ctx.beginPath(); edge(); ctx.clip(); draw();
  const g = ctx.createRadialGradient(W / 2, 735, 220, W / 2, 735, 720); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,80,30,0.32)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore(); ctx.restore();
}
function oldMap(mp, lineK, tint) {
  ctx.fillStyle = "#cfd6bf"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = "rgba(60,80,70,0.16)"; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const y = 262 + i * 24; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore();
  const g = GEO.s_treaty, all = () => { for (const L of g.layers) ringsPath(L.polys, mp); };
  ctx.save(); [[18, 0.12], [8, 0.2]].forEach(([w, a]) => { ctx.beginPath(); all(); ctx.strokeStyle = `rgba(90,70,40,${a})`; ctx.lineWidth = w; ctx.stroke(); }); ctx.restore();
  piece(all, "#e2c98f", { rule: "evenodd", lw: 2.5, rim: 6, sx: 2, sy: 3, sb: 3, ink: "#5a4430" });
  // relief: hachured ranges (the Cascades and the Rockies), drawn as little paper peaks
  for (let i = 0; i < 60; i++) { const lo = i < 30 ? lerp(-122.2, -120.9, rnd(i, 1)) : lerp(-117.5, -115.0, rnd(i, 2)), la = lerp(45.4, 52, rnd(i, 3)); const [x, y] = mp(lo, la); ctx.save(); ctx.strokeStyle = "rgba(90,60,30,0.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 9, y + 5); ctx.lineTo(x, y - 8); ctx.lineTo(x + 9, y + 5); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = 0.7; text("OREGON COUNTRY", 700, 360, { size: 52, font: "Serif", color: "#6b4a28", ls: 2 }); line(540, 386, 860, 386, "rgba(107,74,40,0.7)", 3);
  ctx.translate(850, 1050); piece(() => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 30 : 74; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0); } ctx.closePath(); }, "#d9bc84", { lw: 2.5, rim: 4, shadow: false, ink: "#6b4a28" });
  piece(() => { ctx.moveTo(0, -80); ctx.lineTo(20, -16); ctx.lineTo(-20, -16); ctx.closePath(); }, A.red2, { lw: 2, light: false, shadow: false }); text("N", 0, -92, { size: 28, color: "#6b4a28" }); ctx.restore();
  if (tint > 0) { ctx.save(); ctx.beginPath(); all(); ctx.clip("evenodd"); const y = mp(0, 49)[1]; ctx.fillStyle = `rgba(184,67,44,${0.30 * tint})`; ctx.fillRect(0, 0, W, y); ctx.fillStyle = `rgba(47,63,92,${0.26 * tint})`; ctx.fillRect(0, y, W, H); ctx.restore(); }
  if (lineK > 0) { const a = mp(LINE_E, 49), b = mp(lerp(LINE_E, LINE_W, lineK), 49); ctx.save(); ctx.strokeStyle = "#5a1f12"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.restore(); }
}
// a hand with a cuffed sleeve reaching in from off-frame (+x is toward the fingertips)
function hand(x, y, a, sleeve, cuff, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  piece(() => { ctx.moveTo(-640, -66); ctx.quadraticCurveTo(-300, -80, -70, -62); ctx.lineTo(-70, 62); ctx.quadraticCurveTo(-300, 80, -640, 66); ctx.closePath(); }, sleeve, { lw: 4.5, rim: 14, sx: 10, sy: 16, sb: 16 });
  ctx.save(); ctx.strokeStyle = "rgba(20,10,5,0.25)"; ctx.lineWidth = 4; for (const k of [-300, -200]) { ctx.beginPath(); ctx.moveTo(k, -60); ctx.quadraticCurveTo(k + 30, 0, k, 60); ctx.stroke(); } ctx.restore();
  piece(() => ctx.roundRect(-84, -72, 70, 144, 14), cuff, { lw: 4, rim: 6 });
  if (o.lace) { ctx.save(); ctx.fillStyle = A.cream; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-14, -60 + i * 24, 13, 0, 7); ctx.fill(); ctx.strokeStyle = A.ink; ctx.lineWidth = 2.5; ctx.stroke(); } ctx.restore(); }
  piece(() => { ctx.moveTo(-18, -50); ctx.bezierCurveTo(30, -70, 80, -64, 104, -36); ctx.bezierCurveTo(122, -16, 116, 12, 98, 22); ctx.lineTo(70, 50); ctx.bezierCurveTo(30, 66, -4, 60, -18, 50); ctx.closePath(); }, A.skin, { lw: 4, rim: 8 });
  piece(() => { ctx.moveTo(10, 36); ctx.quadraticCurveTo(50, 64, 92, 58); ctx.quadraticCurveTo(102, 50, 90, 40); ctx.quadraticCurveTo(54, 40, 26, 22); ctx.closePath(); }, A.skin2, { lw: 3.5, rim: 4, shadow: false });   // thumb
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.55)"; ctx.lineWidth = 3; for (const yy of [-24, -4, 14]) { ctx.beginPath(); ctx.moveTo(58, yy); ctx.quadraticCurveTo(80, yy - 3, 98, yy - 6); ctx.stroke(); } ctx.restore();
  ctx.restore();
}
function ruler(x0, x1, y, k, rot) {
  if (k <= 0) return; ctx.save(); ctx.translate((x0 + x1) / 2, y - (1 - eout(k)) * 300); ctx.rotate(rot * (1 - spring(k)));
  const w = x1 - x0; piece(() => ctx.roundRect(-w / 2, -6, w, 50, 6), "#d7b26a", { lw: 4, rim: 8, sx: 10, sy: 16, sb: 14 });
  ctx.strokeStyle = "rgba(43,35,32,0.8)"; ctx.lineWidth = 2; for (let i = 0; i <= 80; i++) { const xx = -w / 2 + 12 + i * (w - 24) / 80; ctx.beginPath(); ctx.moveTo(xx, -6); ctx.lineTo(xx, i % 10 ? (i % 5 ? 6 : 14) : 22); ctx.stroke(); }
  ctx.restore();
}
function quill(x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  piece(() => { ctx.moveTo(0, 0); ctx.bezierCurveTo(30, -110, 110, -260, 210, -380); ctx.bezierCurveTo(130, -250, 70, -120, 0, 0); ctx.closePath(); }, "#f3ead7", { lw: 3, rim: 6, sx: 8, sy: 12 });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.35)"; ctx.lineWidth = 2; for (let i = 1; i < 14; i++) { const u = i / 14; ctx.beginPath(); ctx.moveTo(u * 150, -u * 300); ctx.lineTo(u * 150 + 28 * (1 - u * 0.5), -u * 300 + 6); ctx.stroke(); } ctx.restore();
  line(0, 0, 175, -340, "rgba(43,35,32,0.7)", 3); piece(() => { ctx.moveTo(-4, 4); ctx.lineTo(10, -22); ctx.lineTo(20, -18); ctx.closePath(); }, "#3a3530", { lw: 2, light: false, shadow: false });
  ctx.restore();
}
function candle(x, y) {
  piece(() => ctx.ellipse(x, y + 12, 80, 24, 0, 0, 7), "#b9a27a", { lw: 3.5, rim: 6 });
  piece(() => ctx.roundRect(x - 26, y - 130, 52, 142, 6), "#f5ecd8", { lw: 3.5, rim: 8 });
  const f = 1 + 0.10 * Math.sin(T * 23) + 0.07 * Math.sin(T * 37);
  const rg = ctx.createRadialGradient(x, y - 170, 10, x, y - 170, 200); rg.addColorStop(0, "rgba(255,226,160,0.55)"); rg.addColorStop(1, "rgba(255,226,160,0)"); ctx.fillStyle = rg; ctx.fillRect(x - 220, y - 390, 440, 440);
  piece(() => { ctx.moveTo(x, y - 200 * f + 60); ctx.quadraticCurveTo(x + 20, y - 150, x, y - 132); ctx.quadraticCurveTo(x - 20, y - 150, x, y - 200 * f + 60); ctx.closePath(); }, "#f7b84a", { lw: 2.5, rim: 4, shadow: false });
}
function treatyDesk(t, o = {}) {
  desk(); candle(130, 250);
  const mp = mapProj(NW_CAM), tL0 = at("treaty/the") - 0.05, tL1 = at("treaty/parallel") + 0.5;
  const lineK = o.lineK ?? eio(pp(t, tL0, tL1 - tL0)), tint = o.tint ?? eout(pp(t, at("treaty/parallel") + 0.3, 0.5));
  parchment(() => oldMap(mp, lineK, tint));
  piece(() => ctx.roundRect(870, 1250, 130, 96, 20), "#2b2f3a", { lw: 4, rim: 6 });                       // inkwell
  piece(() => ctx.arc(250, 1560, 64, 0, 7), A.red2, { lw: 4, rim: 10 });                                  // wax seal
  ctx.save(); ctx.translate(250, 1560); ctx.rotate(0.2); text("1846", 0, 14, { size: 40, color: "#e7b0a0" }); ctx.restore();
  const ry = mp(0, 49)[1] - 50, rk = o.rulerK ?? pp(t, at("treaty/ruler") - 0.2, 0.6);
  ruler(70, W - 70, ry, rk, -0.14);
  if (!o.noLabels) {
    const k1 = spring(pp(t, at("treaty/britain") - 0.05, 0.6)), k2 = spring(pp(t, at("treaty/america") - 0.05, 0.6));
    if (k1 > 0) { ctx.save(); ctx.translate(560, 470); ctx.scale(k1, k1); tag("BRITAIN", 0, 0, { size: 46, rot: -0.03 }); ctx.restore(); }
    if (k2 > 0) { ctx.save(); ctx.translate(600, 960); ctx.scale(k2, k2); tag("UNITED STATES", 0, 0, { size: 46, rot: 0.02 }); ctx.restore(); }
    const k49 = spring(pp(t, at("treaty/fortyninth") - 0.05, 0.6)); if (k49 > 0) { const q = mp(-116.2, 49); ctx.save(); ctx.translate(q[0], q[1] + 80); ctx.scale(k49, k49); tag("49°N", 0, 0, { size: 44, bg: A.mustard }); ctx.restore(); }
  }
  const hb = eout(pp(t, at("treaty/britain") - 0.25, 0.6)), ha = eout(pp(t, at("treaty/america") - 0.25, 0.6));
  if (hb > 0 || o.hands) hand(lerp(-260, 200, o.hands ? 1 : hb), ry + 24 + Math.sin(T * 3) * 2, 0.04, "#a8392b", A.cream, 0.85, { lace: true });
  const px = mp(lerp(LINE_E, LINE_W, lineK), 49);
  if (ha > 0 || o.hands) { const hx = lineK > 0 ? px[0] + 30 : lerp(W + 500, 900, ha), hy = lineK > 0 ? px[1] + 80 : ry + 140;
    quill(hx - 30, hy - 74, -0.15); ctx.save(); ctx.translate(hx + 320, hy + 30); ctx.scale(-1, 1); hand(0, 0, 0.1, A.navy, "#e8d6a8", 0.85); ctx.restore(); }
  if (!o.noLabels) stamp("1846", 240, 1130, t - at("treaty/eighteen"), { size: 110, rot: -0.12, color: A.red2 });
  return mp;
}
CU.treaty = (t, S) => { treatyDesk(t); };

// =====================================================================================================
// 4. COAST: the deal is signed; the camera dives to the coast; a lens shows what the line actually did
// =====================================================================================================
CU.coast = (t, S) => {
  const focus = mapProj(NW_CAM)(-123.06, 49.0), z = 1 + 2.4 * eio(pp(t, S.t0 + 0.1, 1.0));
  ctx.save(); ctx.translate(W / 2, 700); ctx.scale(z, z); ctx.translate(-focus[0], -focus[1]); treatyDesk(t, { lineK: 1, tint: 1, rulerK: 1, noLabels: true }); ctx.restore();
  stamp("SIGNED", 760, 400, t - at("coast/nobody"), { size: 120, rot: 0.12, color: A.red2 });
  const lk = eout(pp(t, at("coast/the") - 0.1, 0.45));
  if (lk > 0) {
    const cx = lerp(W + 420, 540, lk), cy = 780, r = 330;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
    const mp = mapProj({ lon: -123.03, lat: 49.012, s: 9000, cx, cy }); seaFlat("#bcd2ca"); mapLand("s_survey", mp, () => "#e2c98f", { lw: 3 });
    ctx.save(); ctx.strokeStyle = "#5a1f12"; ctx.lineWidth = 8; ctx.lineCap = "round"; const a = mp(-122.9, BORDER_LAT), b = mp(-123.2, BORDER_LAT); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.restore();
    const rg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, 20, cx, cy, r); rg.addColorStop(0, "rgba(255,255,255,0.18)"); rg.addColorStop(1, "rgba(0,0,0,0.12)"); ctx.fillStyle = rg; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.restore();
    ctx.save(); ctx.translate(cx, cy);
    piece(() => { ctx.moveTo(r * 0.66, r * 0.78); ctx.lineTo(r * 1.38, r * 1.5); ctx.lineTo(r * 1.5, r * 1.38); ctx.lineTo(r * 0.78, r * 0.66); ctx.closePath(); }, A.wood2, { lw: 4, rim: 8 });
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 40; ctx.strokeStyle = A.ink; ctx.stroke(); ctx.lineWidth = 28; ctx.strokeStyle = "#c9a043"; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r - 4, Math.PI * 1.05, Math.PI * 1.45); ctx.lineWidth = 8; ctx.strokeStyle = "#f3dc94"; ctx.stroke();
    ctx.restore();
    const qk = spring(pp(t, at("coast/coast") + 0.05, 0.6)); if (qk > 0) { ctx.save(); ctx.translate(cx + 30, cy + 150); ctx.scale(qk, qk); text("?", 0, 0, { size: 180, color: A.red, stroke: 16 }); ctx.restore(); }
  }
};

// =====================================================================================================
// 5. SURVEY: two surveyors on the beach with a theodolite, the line of stakes; a map card shows the tip coming loose
// =====================================================================================================
function theodolite(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  for (const a of [-0.32, 0.05, 0.36]) { ctx.save(); ctx.rotate(a); piece(() => ctx.roundRect(-5, -230, 10, 230, 3), A.wood, { lw: 3, rim: 3 }); ctx.restore(); }
  piece(() => ctx.roundRect(-34, -270, 68, 40, 8), "#9a8a5a", { lw: 3.5, rim: 5 });
  piece(() => ctx.roundRect(-10, -296, 90, 24, 8), "#c9a043", { lw: 3.5, rim: 4 }); piece(() => ctx.arc(80, -284, 13, 0, 7), "#3a3530", { lw: 3, rim: 3, shadow: false });
  ctx.restore();
}
CU.survey = (t, S) => {
  const tc = at("survey/cut"), tp = at("survey/peninsula");
  sky({ sunX: 180, sunY: 380, top: "#e4cfa8" });
  ridge(900, 260, A.mtnFar, 0, 7, 0, true); haze(600, 960, 0.45);
  water(860, 1090, 0);
  // the beach and a grassy bank
  piece(() => { ctx.moveTo(-20, H); ctx.lineTo(-20, 1060); ctx.quadraticCurveTo(400, 1030, W + 20, 1080); ctx.lineTo(W + 20, H); ctx.closePath(); }, "#d8c49a", { lw: 4, rim: 10, sx: 0, sy: -3 });
  nearGround(1290, 0, A.moss);
  // the line of stakes running off toward the water, and the chain between the surveyors
  const walk = eio(pp(t, S.t0 - 0.2, tc - S.t0 + 0.1));
  for (let i = 0; i < 9; i++) { const k = pp(walk, i / 9, 0.12); if (k <= 0) continue; const x = 1000 - i * 115, y = 1150 + i * 4; piece(() => { ctx.moveTo(x - 7, y); ctx.lineTo(x - 5, y - 60 * k); ctx.lineTo(x, y - 70 * k); ctx.lineTo(x + 5, y - 60 * k); ctx.lineTo(x + 7, y); ctx.closePath(); }, A.cream, { lw: 3, rim: 3 }); if (k > 0.8) piece(() => ctx.rect(x - 7, y - 66, 14, 12), A.red, { lw: 2, light: false, shadow: false }); }
  const sx = lerp(1150, 250, walk), walking = t < tc - 0.1;
  theodolite(sx - 120, 1190, 1.0);
  surveyor({ x: sx, gy: 1210, s: 1.35, walk: walking ? t * 7 : null, dir: -1, id: 11, look: t > tc ? 1 : 0, brow: t > tc + 0.5 ? -1 : 0 });
  surveyor({ x: sx + 260, gy: 1225, s: 1.3, walk: walking ? t * 7 + 2 : null, dir: -1, id: 12, col: "#5a4a3a", beard: "#5a4636", look: t > tc ? 1 : 0, brow: t > tc + 0.5 ? -1 : 0 });
  ctx.save(); ctx.strokeStyle = "#6a6458"; ctx.lineWidth = 4; ctx.setLineDash([8, 5]); ctx.beginPath(); ctx.moveTo(sx + 40, 1090); ctx.quadraticCurveTo(sx + 115, 1150, sx + 190, 1085); ctx.stroke(); ctx.restore();
  // the map card: the real tip below the line, lifting off and turning American
  const mk = spring(pp(t, S.t0 + 0.1, 0.6));
  card(540, 470, 820, 400, 0.02, mk, (w, h) => {
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40); ctx.clip();
    const mp = mapProj({ lon: -123.06, lat: 49.0, s: 10500, cx: 0, cy: -20 });
    ctx.fillStyle = A.sea; ctx.fillRect(-w / 2, -h / 2, w, h);
    const g = GEO[S.id], lift = eout(pp(t, tc, 0.5));
    for (const L of g.layers) piece(() => ringsPath(L.iso === "US" ? L.polys.filter(p => !isPR(p)) : L.polys, mp), L.iso === "US" ? A.us : A.land, { rule: "evenodd", lw: 3, rim: 7 });
    ctx.save(); ctx.translate(0, -18 * lift); ctx.rotate(-0.02 * lift); piece(() => ringsPath(prPolys(S.id), mp), lift > 0 ? A.us : A.land, { rule: "evenodd", lw: 3.5, rim: 8, sx: 6 + 12 * lift, sy: 9 + 18 * lift, sb: 8 + 14 * lift }); ctx.restore();
    const a = mp(-122.9, BORDER_LAT), b = mp(lerp(-122.9, -123.2, walk), BORDER_LAT); ctx.save(); ctx.setLineDash([20, 10]); stroke2(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, A.red, 6, 12); ctx.restore();
    if (t > tc + 0.15) { const k = spring(pp(t, tc + 0.15, 0.6)), q = mp(-123.062, 48.984); ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(k, k); text("USA", 0, 26, { size: 76, color: A.cream, stroke: 12 }); ctx.restore(); }
    mapLabel("CANADA", -180, -h / 2 + 100, 60, 0.5);
    ctx.restore();
  });
  popLabel("POINT ROBERTS", 760, 640, t, tp - 0.1);
  if (t > tc + 0.55) { const k = spring(pp(t, tc + 0.55, 0.6)); ctx.save(); ctx.translate(sx + 30, 780); ctx.scale(k, k); piece(blob(0, 0, 60, 46, 12, 5, 0.06), A.cream, { lw: 3.5, rim: 5 }); text("?!", 0, 22, { size: 62, color: A.red }); ctx.restore(); }
  brandTag();
};
function popLabel(str, x, y, t, a, o = {}) { const k = spring(pp(t, a, 0.6)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); tag(str, 0, 0, Object.assign({ size: 42, bg: A.mustard }, o)); ctx.restore(); }

// =====================================================================================================
// 6. DRIVE: the wagon from above on the real roads; a passport takes two stamps; the odometer rolls to 25
// =====================================================================================================
const ROUTE = [[-123.055, 48.985], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06], [-123.0, 49.08], [-122.93, 49.095], [-122.89, 49.103], [-122.84, 49.08], [-122.80, 49.04], [-122.765, 49.015], [-122.757, 49.0021], [-122.75, 48.99]];
function along(R, k) { const L = R.slice(1).map((p, i) => Math.hypot(p[0] - R[i][0], p[1] - R[i][1])), tot = L.reduce((a, b) => a + b, 0); let d = clamp(k) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const u = L[i] ? d / L[i] : 0, a = R[i], b = R[i + 1]; return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), a: Math.atan2(b[1] - a[1], b[0] - a[0]), frac: n => L.slice(0, n).reduce((x, y) => x + y, 0) / tot }; } d -= L[i]; } }
function wagonTop(x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  piece(() => ctx.roundRect(-44, -22, 88, 44, 14), A.sage, { lw: 3.5, rim: 6, sx: 4, sy: 6 });
  piece(() => ctx.roundRect(-30, -17, 50, 34, 8), "#bfd3cf", { lw: 2.5, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-26, -13, 40, 26, 5), A.sage2, { lw: 2.5, rim: 3, shadow: false });
  ctx.strokeStyle = A.ink; ctx.lineWidth = 2.5; for (const yy of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(-22, yy); ctx.lineTo(8, yy); ctx.stroke(); }
  ctx.restore();
}
function odometer(x, y, value, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  piece(() => ctx.roundRect(-190, -90, 380, 180, 30), "#2f2b28", { lw: 4, rim: 10, sx: 8, sy: 12 });
  text("MILES IN CANADA", 0, -48, { size: 28, font: "Elite", color: A.cream });
  const digits = 3, cw = 72;
  for (let i = 0; i < digits; i++) {
    const place = Math.pow(10, digits - 1 - i), v = value / place, d = Math.floor(v) % 10, f = i === digits - 1 ? v - Math.floor(v) : (v % 1 > 0.92 ? (v % 1 - 0.92) / 0.08 : 0);
    const cx = -cw + i * cw;
    ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 30, -24, 60, 88, 8); ctx.clip();
    ctx.fillStyle = A.cream; ctx.fillRect(cx - 30, -24, 60, 88);
    for (const [dd, oy] of [[d, -f * 80], [(d + 1) % 10, 80 - f * 80]]) text(String(dd), cx, 46 + oy, { size: 66, color: A.ink });
    const g = ctx.createLinearGradient(0, -24, 0, 64); g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(0.3, "rgba(0,0,0,0)"); g.addColorStop(0.7, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = g; ctx.fillRect(cx - 30, -24, 60, 88);
    ctx.restore(); ctx.beginPath(); ctx.roundRect(cx - 30, -24, 60, 88, 8); ctx.lineWidth = 3; ctx.strokeStyle = A.ink; ctx.stroke();
  }
  ctx.restore();
}
function passportCard(x, y, t, t1, t2) {
  const k = spring(pp(t, t1 - 0.25, 0.6));
  card(x, y, 400, 300, -0.04, k, (w, h) => {
    piece(() => ctx.rect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28), "#e6dcc4", { lw: 2, light: false, shadow: false });
    text("PASSPORT · ENTRIES", 0, -h / 2 + 50, { size: 26, font: "Elite" }); rule(-160, 160, -h / 2 + 66);
    stamp("CANADA", -80, 30, t - t1, { size: 44, rot: -0.18, color: A.red, maxW: 220 });
    stamp("U.S.A.", 90, 50, t - t2, { size: 44, rot: 0.12, color: A.navy, maxW: 220 });
  }, { bg: "#efe5cc" });
}
CU.drive = (t, S) => {
  const cam = { lon: -122.93, lat: 49.045, s: 4300, cx: W / 2, cy: 760 }, mp = mapProj(cam);
  seaFlat(); mapLand(S.id, mp, { US: A.us, CA: A.land });
  borderOnMap(mp, -123.3, -122.6, 1, { w: 6 });
  const t1 = at("drive/cross"), t2 = at("drive/twice"), k = lerp(0.03, 0.985, eio(pp(t, S.t0 - 0.1, t2 - S.t0 + 0.15)));
  const R = ROUTE.map(p => mp(...p)), c = along(R, k), Ltot = R.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - R[i][0], p[1] - R[i][1]), 0);
  ctx.save(); ctx.setLineDash([Ltot * k, Ltot * 2]); stroke2(() => { R.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, A.mustard, 12, 20); ctx.restore();
  for (const p of [ROUTE[1], ROUTE[10]]) { const q = mp(...p); piece(() => ctx.roundRect(q[0] - 24, q[1] - 24, 48, 48, 8), A.cream, { lw: 3, rim: 4 }); ctx.save(); ctx.fillStyle = A.red; mapleLeaf(ctx, q[0], q[1] + 2, 15); ctx.fill(); ctx.restore(); }
  wagonTop(c.x, c.y, c.a, 0.9);
  mapLabel("CANADA", W / 2, 360, 104);
  const p0 = mp(-123.062, 48.975); tag("POINT ROBERTS", p0[0] + 20, p0[1] + 80, { size: 30 });
  const pb = mp(-122.74, 48.975); tag("BLAINE, WA", pb[0] - 60, pb[1] + 74, { size: 30 });
  const inC = clamp((k - c.frac(1)) / (c.frac(10) - c.frac(1)));
  odometer(770, 1080, 25 * inC, spring(pp(t, S.t0 + 0.2, 0.6)));
  passportCard(260, 1060, t, t1, t2);
  brandTag();
};

// =====================================================================================================
// 7. KIDS: the school bus out through Canada and back; the sun crosses the sky; a bus pass gets punched 4 times
// =====================================================================================================
function schoolhouse(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  footShadow(0, 4, 220);
  piece(() => ctx.rect(-180, -230, 360, 230), "#b5674a", { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(-205, -226); ctx.lineTo(0, -330); ctx.lineTo(205, -226); ctx.closePath(); }, "#7b3a2a", { lw: 4.5, rim: 8 });
  piece(() => ctx.rect(-40, -400, 80, 90), A.cream, { lw: 4, rim: 6 }); piece(() => { ctx.moveTo(-54, -398); ctx.lineTo(0, -446); ctx.lineTo(54, -398); ctx.closePath(); }, "#7b3a2a", { lw: 4, rim: 5 });
  piece(() => ctx.arc(0, -356, 18, 0, 7), A.mustard, { lw: 3, rim: 4, shadow: false });
  for (const wx of [-140, -70, 40, 110]) piece(() => ctx.rect(wx, -190, 46, 60), "#f3dc94", { lw: 3, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-30, -110, 60, 110, [30, 30, 0, 0]), A.wood2, { lw: 3.5, rim: 4, shadow: false });
  text("SCHOOL", 0, -260, { size: 30, color: A.cream, ls: 4 });
  ctx.restore();
}
function busPass(x, y, t, times, k) {
  card(x, y, 600, 210, -0.02, k, (w, h) => {
    piece(() => ctx.rect(-w / 2, -h / 2, 120, h), A.mustard, { lw: 0, light: false, shadow: false });
    ctx.save(); ctx.translate(-w / 2 + 60, 0); ctx.rotate(-Math.PI / 2); text("BUS PASS", 0, 12, { size: 34, color: A.ink, ls: 4 }); ctx.restore();
    text("BORDER CROSSINGS · ONE SCHOOL DAY", 60, -h / 2 + 44, { size: 22, font: "Elite" });
    for (let i = 0; i < 4; i++) {
      const cx = -110 + i * 120, cy = 20, since = t - times[i];
      ctx.save(); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(cx, cy, 36, 0, 7); ctx.strokeStyle = "rgba(43,35,32,0.5)"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
      text(String(i + 1), cx, cy + 80, { size: 26, font: "Elite" });
      if (since > 0) { const kk = spring(clamp(since / 0.35)); ctx.save(); ctx.translate(cx, cy); ctx.scale(kk, kk); ctx.fillStyle = A.wood2; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.arc(-3, -3, 30, 0, 7); ctx.fill(); ctx.restore(); }
    }
  });
}
CU.kids = (t, S) => {
  const u = pp(t, S.t0, S.t1 - S.t0), sunA = lerp(Math.PI * 0.92, Math.PI * 0.08, u);
  ctx.save(); ctx.translate(W / 2, 1150); ctx.scale(1.06, 1.06); ctx.translate(-W / 2, -1150);
  sky({ sunX: 540 + Math.cos(sunA) * 470, sunY: 800 - Math.sin(sunA) * 420, top: u > 0.7 ? lerp(0, 1, 1) && "#e3b98e" : A.sky2 });
  ridge(900, 300, A.mtnFar, 0, 7, 0, true); haze(600, 960, 0.4);
  water(905, 1010, 0); grass(1000, 1060, 0, A.moss);
  pole("US", 120, 1070, 230, 110, 0.4);
  for (let i = 0; i < 5; i++) pine(330 + i * 90 + rnd(i, 66) * 30, 1052, 0.5 + rnd(i, 67) * 0.2, 70 + i, tone(A.moss, -0.05), 0.55);
  schoolhouse(930, 1070, 0.62);
  const B1 = 260, B2 = 760;
  const tOut0 = S.t0 + 0.05, tOut1 = at("kids/four") - 0.4, tBack0 = tOut1 + 0.12, tBack1 = at("kids/day") - 0.05;
  const bx = t < tBack0 ? lerp(40, 1020, eio(pp(t, tOut0, tOut1 - tOut0))) : lerp(1020, 40, eio(pp(t, tBack0, tBack1 - tBack0))), dir = t < tBack0 ? 1 : -1;
  // crossing times, found once by scanning the motion (deterministic)
  if (!S.cross) { S.cross = []; let prev = null; for (let tt = S.t0; tt < S.t1; tt += 1 / 240) { const x = tt < tBack0 ? lerp(40, 1020, eio(pp(tt, tOut0, tOut1 - tOut0))) : lerp(1020, 40, eio(pp(tt, tBack0, tBack1 - tBack0))); if (prev != null) for (const b of [B1, B2]) if ((prev - b) * (x - b) < 0) S.cross.push(tt); prev = x; } while (S.cross.length < 4) S.cross.push(1e9); }
  const near = b => clamp(1 - (Math.abs(bx - b) - 160) / 140);
  borderBooth(B1, 1078, 0.5, spring(near(B1)), { officer: true });
  borderBooth(B2, 1078, 0.5, spring(near(B2)), { label: "USA", uniform: "#2c3b2a" });
  road(1070, 1200, 0);
  schoolBus(bx, 1170, 0.62, dir, t, { seed: 3 });
  nearGround(1218, 0); splitRail(1560, 0);
  ctx.restore();
  busPass(W / 2, 470, t, S.cross, spring(pp(t, S.t0 + 0.1, 0.6)));
  popLabel("FROM 4TH GRADE · TO BLAINE, WA", W / 2, 640, t, S.t0 + 0.5, { size: 28 });
  brandTag();
};

// =====================================================================================================
// 8. WATER: a cutaway: the local fills a glass at his tap; the pipe runs under the border from a Canadian reservoir
// =====================================================================================================
CU.water = (t, S) => {
  const SY = 820;
  sky({ sunX: 200, sunY: 380 });
  ctx.save(); ctx.translate(0, SY - GY); ridge(900, 300, A.mtnFar, 0, 7, 0, true); haze(600, 960, 0.4); ridge(950, 160, A.mtnMid, 0, 11, 0, false); ctx.restore();
  piece(blob(870, SY - 4, 200, 30, 18, 4, 0.04), "#7fa8ad", { lw: 4, rim: 6 });
  piece(() => ctx.rect(-10, SY, W + 20, H - SY + 10), "#b98d5c", { lw: 5, rim: 12 });
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#9c7246" : "#a87c50"; ctx.beginPath(); ctx.moveTo(0, SY + 240 + i * 230); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, SY + 240 + i * 230 + Math.sin(x * 0.01 + i) * 16); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 34; i++) piece(blob(rnd(i, 101) * W, SY + 60 + rnd(i, 102) * (H - SY - 80), 10 + rnd(i, 103) * 18, 7 + rnd(i, 104) * 11, 9, i, 0.2), "#c9b08a", { lw: 2, rim: 3, shadow: false });
  piece(() => ctx.rect(-10, SY - 16, W + 20, 28), A.moss, { lw: 4, rim: 5 });
  piece(() => ctx.roundRect(552, SY - 190, 16, 190, 4), "#d8d1c2", { lw: 3, rim: 3 });
  flag("US", 470, SY - 182, 76, 0, 3); flag("CA", 572, SY - 182, 76, 1, 3);
  line(560, SY + 14, 560, H, "rgba(184,67,44,0.6)", 6, [24, 16]);
  mapLabel("USA", 290, SY + 110, 54, 0.5); mapLabel("CANADA", 830, SY + 110, 54, 0.5);
  const PIPE = [[870, SY + 14], [870, 1040], [210, 1040], [210, 640]];
  stroke2(() => { PIPE.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, "#8b9aa0", 36, 46);
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 6; ctx.beginPath(); PIPE.forEach((p, i) => i ? ctx.lineTo(p[0] - 8, p[1] - 8) : ctx.moveTo(p[0] - 8, p[1] - 8)); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.setLineDash([22, 30]); ctx.lineDashOffset = T * 170; ctx.beginPath(); PIPE.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.strokeStyle = "#5fa8d3"; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.stroke(); ctx.restore();
  // the house, cut open
  piece(() => ctx.rect(30, 420, 400, SY - 420), "#efe0c4", { lw: 5, rim: 12 });
  piece(() => { ctx.moveTo(0, 424); ctx.lineTo(230, 270); ctx.lineTo(460, 424); ctx.closePath(); }, "#9b4a3a", { lw: 5, rim: 10 });
  piece(() => ctx.rect(60, 650, 340, 30), A.wood, { lw: 3.5, rim: 5 });
  stroke2(() => { ctx.moveTo(210, 640); ctx.lineTo(210, 560); ctx.lineTo(276, 560); ctx.lineTo(276, 584); }, "#b8bcc0", 12, 18);
  const fill = pp(t, S.t0 + 0.2, 3.4);
  for (let i = 0; i < 3; i++) { const y = 592 + ((T * 3 + i / 3) % 1) * 34; piece(() => ctx.ellipse(276, y, 5, 8, 0, 0, 7), "#5fa8d3", { lw: 2, light: false, shadow: false }); }
  // the local holds the glass under the tap
  local({ x: 340, gy: SY - 10, s: 0.62, dir: -1, arm: "hold", look: 1, blink: 2.1, brow: t > at("water/canadian") ? 0.7 : 0, id: 3, carry: () => {
    ctx.save(); ctx.rotate(0); const gx = -10, gy = -30;
    ctx.beginPath(); ctx.moveTo(gx - 26, gy - 40); ctx.lineTo(gx + 26, gy - 40); ctx.lineTo(gx + 20, gy + 30); ctx.lineTo(gx - 20, gy + 30); ctx.closePath(); ctx.save(); ctx.clip(); ctx.fillStyle = "#8cc6e6"; ctx.fillRect(gx - 30, gy + 30 - 70 * fill, 60, 80); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = A.ink; ctx.stroke(); ctx.restore(); } });
  pole("US", 440, SY - 12, 270, 120, 0.3);
  const ck = spring(pp(t, at("water/canadian") - 0.05, 0.6));
  if (ck > 0) { ctx.save(); ctx.translate(560, 1110); ctx.scale(ck, ck); arrow(170, 0, -170, 0, 1, "#2f6b8f", 10); ctx.restore(); popLabel("FROM CANADA", 560, 1180, t, at("water/canadian") - 0.05, { size: 30, bg: A.cream }); }
  const dk = spring(pp(t, at("water/under") - 0.15, 0.6));
  card(770, 380, 440, 300, 0.04, dk, (w, h) => {
    text("WATER SUPPLY AGREEMENT", 0, -h / 2 + 52, { size: 26, font: "Elite" }); rule(-180, 180, -h / 2 + 68);
    text("Greater Vancouver Water District", 0, -h / 2 + 108, { size: 22, font: "Elite" });
    text("→ Point Roberts Water District", 0, -h / 2 + 140, { size: 22, font: "Elite" });
    const sg = pp(t, at("water/deal"), 0.8); ctx.save(); ctx.strokeStyle = "#1f3a7a"; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= 40 * sg; i++) { const x = -150 + i * 5, y = 70 + Math.sin(i * 0.9) * 12 - i * 0.3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    rule(-160, 40, 92);
    stamp("1987", 110, 60, t - at("water/eightyseven") + 0.1, { size: 70, rot: -0.15, color: A.red, maxW: 220 });
  });
  brandTag();
};

// =====================================================================================================
// 9. SHUT: Canadians queue for gas and parcels; 2020: the barrier slams; the cars back off and vanish
// =====================================================================================================
function shopfront(x, gy, w, name, col, o = {}) {
  ctx.save(); ctx.translate(x, gy); boil(o.id || 120, 0.3);
  footShadow(0, 4, w * 0.55);
  piece(() => ctx.rect(-w / 2, -300, w, 300), o.wall || "#efe0c4", { lw: 4.5, rim: 10 });
  piece(() => ctx.rect(-w / 2 - 12, -340, w + 24, 60), col, { lw: 4.5, rim: 6 });
  text(name, 0, -297, { size: name.length > 7 ? 30 : 38, color: A.cream, ls: 3 });
  // striped awning
  piece(() => { ctx.moveTo(-w / 2 - 6, -276); ctx.lineTo(w / 2 + 6, -276); ctx.lineTo(w / 2 + 18, -220); ctx.lineTo(-w / 2 - 18, -220); ctx.closePath(); }, A.cream, { lw: 3.5, rim: 4 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(-w / 2 - 6, -276); ctx.lineTo(w / 2 + 6, -276); ctx.lineTo(w / 2 + 18, -220); ctx.lineTo(-w / 2 - 18, -220); ctx.closePath(); ctx.clip(); ctx.fillStyle = col; for (let i = -w; i < w; i += 40) ctx.fillRect(i, -280, 20, 70); ctx.restore();
  const lit = o.lit ?? 1;
  piece(() => ctx.rect(-w / 2 + 22, -200, w - 44 - 56, 120), lit > 0.5 ? "#f6d98a" : "#4d545c", { lw: 3.5, rim: 4, shadow: false });
  if (lit > 0.5) { const g = ctx.createLinearGradient(0, -80, 0, 30); g.addColorStop(0, "rgba(255,236,170,0.4)"); g.addColorStop(1, "rgba(255,236,170,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2 + 22, -80); ctx.lineTo(w / 2 - 78, -80); ctx.lineTo(w / 2 - 50, 20); ctx.lineTo(-w / 2, 20); ctx.closePath(); ctx.fill(); }
  piece(() => ctx.rect(w / 2 - 66, -170, 44, 170), A.wood2, { lw: 3.5, rim: 4, shadow: false });
  if (o.closed) { const sw = Math.sin((T - o.closed) * 7) * Math.exp(-(T - o.closed) * 2.5) * 0.35; ctx.save(); ctx.translate(-18, -200); ctx.rotate(sw); line(-30, 0, 0, -26, A.ink, 2.5); line(30, 0, 0, -26, A.ink, 2.5); piece(() => ctx.rect(-56, 0, 112, 40), A.cream, { lw: 3, rim: 3 }); text("CLOSED", 0, 30, { size: 26, color: A.red }); ctx.restore(); }
  ctx.restore();
}
function parcel(x, y, s, id) { ctx.save(); ctx.translate(x, y); ctx.rotate((rnd(id, 7) - 0.5) * 0.16); ctx.scale(s, s); piece(() => ctx.rect(-40, -64, 80, 64), "#c79a5e", { lw: 3.5, rim: 6 }); line(0, -64, 0, 0, "rgba(43,35,32,0.45)", 4); piece(() => ctx.rect(-28, -50, 30, 18), A.cream, { lw: 2, light: false, shadow: false }); ctx.restore(); }
function carSimple(x, gy, s, dir, col, o = {}) {      // the Canadian visitors' cars: same construction, no driver detail
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s);
  footShadow(0, 2, 150, 0.22);
  const b = o.moving ? Math.sin(T * 17 + x) * 1.5 : 0; ctx.translate(0, -b);
  piece(() => { ctx.moveTo(-150, -40); ctx.quadraticCurveTo(-156, -84, -128, -92); ctx.lineTo(-92, -94); ctx.quadraticCurveTo(-70, -150, -30, -152); ctx.lineTo(40, -152); ctx.quadraticCurveTo(70, -150, 92, -96); ctx.quadraticCurveTo(150, -92, 156, -64); ctx.lineTo(158, -40); ctx.closePath(); }, col, { lw: 4, rim: 9 });
  piece(() => { ctx.moveTo(-70, -98); ctx.quadraticCurveTo(-56, -138, -28, -140); ctx.lineTo(2, -140); ctx.lineTo(2, -98); ctx.closePath(); }, "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  piece(() => { ctx.moveTo(12, -98); ctx.lineTo(12, -140); ctx.lineTo(40, -140); ctx.quadraticCurveTo(62, -136, 76, -98); ctx.closePath(); }, "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(-120, -66); ctx.fillStyle = A.red; mapleLeaf(ctx, 0, 0, 13); ctx.fill(); ctx.restore();
  if (o.box) { piece(() => ctx.rect(-50, -184, 90, 34), "#c79a5e", { lw: 3, rim: 4 }); line(-5, -184, -5, -150, "rgba(43,35,32,0.5)", 3); }
  ctx.restore();
  for (const wx of [-92, 96]) { ctx.save(); ctx.translate(x + wx * s * dir, gy - 28 * s); ctx.scale(s, s); piece(() => ctx.arc(0, 0, 28, 0, 7), "#2f2a25", { lw: 3, rim: 4, shadow: false }); piece(() => ctx.arc(0, 0, 13, 0, 7), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false }); ctx.rotate(o.spin || 0); line(-11, 0, 11, 0, A.ink, 2.5); ctx.restore(); }
}
CU.shut = (t, S) => {
  const tShut = at("shut/shut"), tGo = at("shut/and") - 0.1, tVan = at("shut/vanished"), grey = pp(t, tShut, 1.2);
  sky({ sunX: 900, sunY: 360, top: grey > 0 ? "#d6c9b0" : A.sky2 });
  ridge(900, 300, A.mtnFar, 0, 7, 0, true); haze(600, 960, 0.4 + grey * 0.2);
  water(905, 1010, 0); grass(1000, 1060, 0, A.moss);
  shopfront(230, 1072, 330, "PARCELS", A.navy, { id: 121, closed: t > tVan ? tVan : null });
  // gas sign on a pole
  piece(() => ctx.roundRect(470, 760, 14, 310, 4), "#9c978b", { lw: 3, rim: 3 }); piece(() => ctx.roundRect(420, 690, 116, 84, 12), A.red, { lw: 4, rim: 6 }); text("GAS", 478, 750, { size: 48, color: A.cream });
  const open = 1 - eout(pp(t, tShut - 0.12, 0.18)), bounce = t > tShut ? Math.sin((t - tShut - 0.06) * 30) * Math.exp(-(t - tShut) * 7) * 0.12 : 0;
  borderBooth(820, 1078, 0.8, Math.max(0, open - bounce), { label: "USA", uniform: "#2c3b2a", look: 1 });
  road(1070, 1200, 0);
  for (let i = 0; i < 4; i++) {
    const roll = Math.min(t, tShut) - S.t0, back_ = Math.max(0, t - tGo - i * 0.12);
    const x = 1040 + i * 300 - 70 * roll + 520 * back_ * back_, gone = pp(t, tVan - 0.25 + i * 0.12, 0.2);
    if (gone < 1) carSimple(x, 1170, 0.82, -1, [A.navy, A.moss2, A.mustard, "#7b5a8a"][i], { box: i % 2 === 0, moving: t < tShut || t > tGo, spin: -x / 24 });
    if (gone > 0) piece(blob(x, 1090, 70 + 90 * gone, 50 + 60 * gone, 12, i, 0.12), A.cream, { lw: 3, rim: 5, alpha: 1 - gone });
  }
  local({ x: 430, gy: 1180, s: 0.72, look: 1, brow: t > tShut ? -1 : 0, blink: 0.7, id: 3, arm: t < tShut ? "wave" : null });
  // parcels nobody collects
  const pile = Math.floor(clamp((t - tShut) / 2.6) * 12);
  nearGround(1218, 0);
  for (let i = 0; i < 3 + pile; i++) { const k = i < 3 ? 1 : spring(pp(t, tShut + (i - 3) * 0.2, 0.5)); if (k <= 0) continue; parcel(160 + (i % 6) * 150, 1700 - Math.floor(i / 6) * 120, 1.7 * k, i); }
  if (pile > 2) popLabel("UNCLAIMED", 540, 1480, t, tShut + 0.8, { size: 36, bg: A.cream });
  const ck = spring(pp(t, at("shut/twenty") - 0.05, 0.6));
  card(240, 420, 260, 230, -0.05, ck, (w, h) => { piece(() => ctx.rect(-w / 2, -h / 2, w, 60), A.red, { lw: 0, light: false, shadow: false }); text("MARCH", 0, -h / 2 + 44, { size: 32, color: A.cream, ls: 4 }); text("2020", 0, 70, { size: 96 }); });
  stamp("BORDER CLOSED", 640, 520, t - tShut, { size: 96, rot: -0.08, color: A.red });
  brandTag();
};

// =====================================================================================================
// 10. LOST: main street; a ledger page drains past 80 percent; four of five windows go dark
// =====================================================================================================
const SHOPS = [["CAFE", A.red], ["PARCELS", A.navy], ["GAS", A.mustard], ["MARKET", A.moss2], ["GIFTS", "#7b5a8a"]];
CU.lost = (t, S) => {
  const t0 = at("lost/lost"), t1 = at("lost/business") + 0.4, left = lerp(100, 18, eio(pp(t, t0, t1 - t0)));
  sky({ sunX: 170, sunY: 330, top: "#e2c7a0", bot: "#eddcbd" });
  ridge(860, 260, A.mtnFar, 0, 7, 0, true); haze(600, 920, 0.45);
  piece(() => ctx.rect(-20, 1000, W + 40, 80), "#c9bfa6", { lw: 4, rim: 6 });
  SHOPS.forEach(([n, c], i) => shopfront(108 + i * 216, 1076, 200, n, c, { id: 130 + i, lit: left > 100 - (i + 1) * 20 + 1 || i === 4 ? 1 : 0, closed: left > 100 - (i + 1) * 20 + 1 || i === 4 ? null : t0 + i * 0.5 }));
  road(1070, 1200, 0);
  nearGround(1218, 0, "#9a9a6a");
  local({ x: lerp(-60, 620, pp(t, S.t0, 3.4)), gy: 1186, s: 0.62, walk: t * 6, look: 0, brow: -1, blink: 1.1, id: 3 });
  const lk = spring(pp(t, S.t0 + 0.05, 0.6));
  card(W / 2, 470, 760, 330, -0.02, lk, (w, h) => {
    ctx.save(); ctx.strokeStyle = "rgba(90,120,150,0.25)"; ctx.lineWidth = 2; for (let y = -h / 2 + 70; y < h / 2; y += 34) { ctx.beginPath(); ctx.moveTo(-w / 2 + 20, y); ctx.lineTo(w / 2 - 20, y); ctx.stroke(); } ctx.restore();
    line(-w / 2 + 90, -h / 2 + 20, -w / 2 + 90, h / 2 - 20, "rgba(184,67,44,0.45)", 2);
    text("TOWN BUSINESS · 2020", -w / 2 + 110, -h / 2 + 56, { size: 30, font: "Elite", align: "left" });
    const bw = 520, bx = -w / 2 + 110, by = -10;
    piece(() => ctx.rect(bx, by, bw, 70), "#efe6d4", { lw: 3.5, light: false, shadow: false });
    ctx.fillStyle = left > 40 ? A.moss2 : A.red; ctx.fillRect(bx + 5, by + 5, (bw - 10) * left / 100, 60);
    text(`${Math.round(left)}%`, bx + bw + 14, by + 54, { size: 50, align: "left", color: A.ink });
    text(S.p.label || "Border Policy Research Institute estimate", -w / 2 + 110, h / 2 - 40, { size: 22, font: "Elite", align: "left", color: "#6b5a48" });
  });
  stamp("−80%+", 800, 700, t - at("lost/eighty"), { size: 100, rot: -0.1, color: A.red });
  brandTag();
};

// =====================================================================================================
// 11. GROCERY: a crowd (one figure = five shoppers) fills the lot; a receipt tape counts; then ten figures remain
// =====================================================================================================
const CROWD_R = 34, CROWD_C = 30;
const CROWD = (() => {
  const out = [];
  for (let r = 0; r < CROWD_R; r++) for (let c = 0; c < CROWD_C; c++) {
    const i = r * CROWD_C + c, u = r / CROWD_R;
    out.push({ x: 20 + c * 35 + (r % 2) * 17 + (rnd(i, 131) - 0.5) * 12, y: 760 + Math.pow(u, 1.12) * 1140 + (rnd(i, 132) - 0.5) * 10, s: lerp(0.55, 1.2, u),
      d: Math.hypot(c - CROWD_C / 2, (CROWD_R - r) * 0.6), keep: false,
      col: [A.red, A.navy, A.moss2, A.mustard, "#7b5a8a", "#c9b08a"][Math.floor(rnd(i, 133) * 6)], hat: rnd(i, 135) < 0.3, skin: [A.skin, "#c99a72", "#8d5f3e", "#e3b48c"][Math.floor(rnd(i, 136) * 4)], v: rnd(i, 134) });
  }
  out.sort((a, b) => a.y - b.y);
  const ord = out.map((p, i) => [p.v, i]).sort((a, b) => a[0] - b[0]); ord.slice(0, 10).forEach(([, i]) => (out[i].keep = true));
  return out;
})();
function shopper(p, s, bob) {
  ctx.save(); ctx.translate(p.x, p.y + bob); ctx.scale(s, s);
  ctx.fillStyle = "rgba(40,25,12,0.18)"; ctx.beginPath(); ctx.ellipse(0, 3, 16, 5, 0, 0, 7); ctx.fill();
  ctx.lineCap = "round"; ctx.strokeStyle = A.ink; ctx.lineWidth = 3.4; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 4, -14); ctx.lineTo(k * 6, 2); ctx.stroke(); }
  ctx.lineWidth = 2.6; ctx.strokeStyle = A.ink;          // the crowd is drawn cheaply: 1,000 figures, no blur
  ctx.beginPath(); ctx.roundRect(-10, -42, 20, 30, 8); ctx.fillStyle = p.col; ctx.fill(); ctx.fillStyle = "rgba(255,250,235,0.22)"; ctx.fillRect(-7, -40, 6, 24); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -50, 8.5, 0, 7); ctx.fillStyle = p.skin; ctx.fill(); ctx.stroke();
  if (p.hat) { ctx.beginPath(); ctx.arc(0, -53, 9, Math.PI, 0); ctx.closePath(); ctx.fillStyle = A.mustard; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function receipt(x, y, n, k, sub) {
  if (k <= 0) return; const h = 260;
  ctx.save(); ctx.translate(x, y - (1 - k) * 200); ctx.rotate(-0.04);
  piece(() => { ctx.moveTo(-130, -h / 2); for (let i = 0; i <= 13; i++) ctx.lineTo(-130 + i * 20, -h / 2 + (i % 2 ? 10 : 0)); ctx.lineTo(130, h / 2); for (let i = 13; i >= 0; i--) ctx.lineTo(-130 + i * 20, h / 2 + (i % 2 ? 10 : 0)); ctx.closePath(); }, "#fbf6ea", { lw: 3, rim: 5, sx: 8, sy: 12 });
  text("PT. ROBERTS MARKET", 0, -h / 2 + 50, { size: 24, font: "Elite" }); rule(-100, 100, -h / 2 + 64);
  text("SHOPPERS / DAY", 0, -h / 2 + 100, { size: 22, font: "Elite" });
  text(fmt(n), 0, 50, { size: 84, color: A.ink });
  text(sub, 0, 100, { size: 22, font: "Elite", color: "#6b5a48" });
  ctx.restore();
}
CU.grocery = (t, S) => {
  const tIn = at("grocery/five"), tOut = at("grocery/about");
  sky({ sunX: 860, sunY: 300, top: "#e6cfa8" });
  piece(() => ctx.rect(-20, 700, W + 40, H), "#cfc6ae", { lw: 4, rim: 8 });
  ctx.save(); ctx.strokeStyle = "rgba(250,245,230,0.6)"; ctx.lineWidth = 6; for (let i = 0; i < 9; i++) { const x = 60 + i * 120; ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x - 40 + i * 10, 1900); ctx.stroke(); } ctx.restore();
  // the store
  footShadow(W / 2, 706, 470, 0.2);
  piece(() => ctx.rect(80, 410, 920, 300), "#efe0c4", { lw: 5, rim: 12 });
  piece(() => ctx.rect(50, 350, 980, 100), A.moss2, { lw: 5, rim: 8 });
  text("MARKET", W / 2, 428, { size: 84, color: A.cream, ls: 18 });
  piece(() => { ctx.moveTo(70, 456); ctx.lineTo(1010, 456); ctx.lineTo(1030, 520); ctx.lineTo(50, 520); ctx.closePath(); }, A.cream, { lw: 3.5, rim: 4 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(70, 456); ctx.lineTo(1010, 456); ctx.lineTo(1030, 520); ctx.lineTo(50, 520); ctx.closePath(); ctx.clip(); ctx.fillStyle = A.moss2; for (let i = 0; i < 30; i++) ctx.fillRect(40 + i * 70, 450, 35, 80); ctx.restore();
  for (let i = 0; i < 4; i++) piece(() => ctx.rect(120 + i * 210, 545, 160, 110), "#f6d98a", { lw: 3.5, rim: 4, shadow: false });
  piece(() => ctx.rect(470, 560, 140, 150), "#bfd3cf", { lw: 4, rim: 5 });
  const n = t < tOut ? Math.round(5000 * eout(pp(t, tIn - 0.1, 0.9))) : Math.round(lerp(5000, 50, eout(pp(t, tOut, 0.5))));
  for (let i = 0; i < CROWD.length; i++) {
    const p = CROWD[i], kIn = pp(t, tIn - 0.15 + p.d / 40 * 0.8, 0.22); if (kIn <= 0) continue;
    const kOut = p.keep ? 0 : pp(t, tOut + p.v * 0.5, 0.14); if (kOut >= 1) continue;
    shopper(p, spring(kIn) * (1 - kOut) * p.s, Math.sin(T * 6 + i) * 2 * p.s);
  }
  receipt(860, 220 + 140, n, spring(pp(t, tIn - 0.2, 0.6)), t < tOut ? "at its peak" : "2020 closure");
  if (t > tOut + 0.4) local({ x: lerp(-80, 330, eout(pp(t, tOut + 0.4, 1.6))), gy: 1180, s: 0.7, walk: t * 6, carry: () => { piece(() => ctx.rect(4, -40, 70, 44), "#c9ccd0", { lw: 3, rim: 3 }); }, arm: "hold", brow: -1, blink: 0.4, id: 3 });
  popLabel("1 figure = 5 shoppers", 230, 660, t, tIn + 0.2, { size: 26, bg: A.cream });
  brandTag();
};

// =====================================================================================================
// 12. GAS: five stations pop up along the road; the local walks the length of it with a jerry can
// =====================================================================================================
function station(x, gy, s, id) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(id, 0.3);
  footShadow(0, 4, 170, 0.2);
  for (const px of [-130, 120]) piece(() => ctx.roundRect(px - 8, -300, 16, 300, 4), "#d8d1c2", { lw: 3.5, rim: 4 });
  piece(() => { ctx.moveTo(-170, -330); ctx.lineTo(170, -330); ctx.lineTo(180, -290); ctx.lineTo(-180, -290); ctx.closePath(); }, A.cream, { lw: 4, rim: 6 });
  piece(() => ctx.rect(-176, -302, 352, 12), A.red, { lw: 0, light: false, shadow: false });
  text("GAS", 0, -300, { size: 30, color: A.ink, ls: 4 });
  for (const px of [-60, 40]) { piece(() => ctx.roundRect(px - 4, -160, 54, 160, [10, 10, 2, 2]), A.red, { lw: 3.5, rim: 5 }); piece(() => ctx.roundRect(px + 6, -140, 34, 30, 4), "#bfd3cf", { lw: 2.5, rim: 3, shadow: false }); stroke2(() => { ctx.moveTo(px + 50, -100); ctx.quadraticCurveTo(px + 70, -60, px + 56, -30); }, "#3a3530", 4, 8); }
  ctx.restore();
}
CU.gas = (t, S) => {
  const pan = lerp(0, 1, eio(pp(t, S.t0, S.t1 - S.t0)));
  sky({ sunX: 880, sunY: 460, top: "#e6b98d", bot: "#efd4ad" });
  ridge(880, 260, A.mtnFar, 0.05, 7, pan * 400, true); haze(600, 940, 0.45);
  water(905, 1010, 0); grass(1000, 1060, pan * 200, "#8d9058");
  const t5 = [at("gas/five"), at("gas/gas"), at("gas/stations"), at("gas/stations") + 0.18, at("gas/stations") + 0.36];
  for (let i = 0; i < 5; i++) { const k = spring(pp(t, t5[i] - 0.05, 0.55)); if (k <= 0) continue; const x = 108 + i * 216;
    ctx.save(); ctx.translate(x, 1080); ctx.scale(1, k); station(0, 0, 0.6, 140 + i); ctx.restore();
    popLabel(String(i + 1), x, 820, t, t5[i] + 0.05, { size: 38, bg: A.mustard, rot: 0 }); }
  road(1070, 1200, 0);
  const tf = at("gas/fewer");
  local({ x: lerp(-60, 700, pp(t, tf - 0.6, 3.2)), gy: 1186, s: 0.6, walk: t * 6, arm: "hold", brow: 0.6, blink: 0.9, id: 3, carry: () => piece(() => ctx.roundRect(-4, -14, 46, 56, 6), A.red, { lw: 3, rim: 4 }) });
  nearGround(1218, 0, "#8d9058");
  const tw = lerp(W + 120, -160, pp(t, tf, 2.4)); ctx.save(); ctx.translate(tw, 1600); ctx.rotate(-T * 5); ctx.strokeStyle = A.wood2; ctx.lineWidth = 6; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(0, 0, 30 + i * 8, i, i + 2.4); ctx.stroke(); } ctx.restore();
  const ck = spring(pp(t, tf - 0.1, 0.6));
  card(W / 2, 440, 560, 280, 0.02, ck, (w, h) => {
    text("PEOPLE IN TOWN · 2020", 0, -h / 2 + 52, { size: 28, font: "Elite" }); rule(-220, 220, -h / 2 + 68);
    text("< 1,000", 0, 60, { size: 116, color: A.red });
    if (t > at("gas/people") + 0.2) text(typed("that's under 200 per station", pp(t, at("gas/people") + 0.2, 0.7)), 0, h / 2 - 24, { size: 24, font: "Elite", color: "#6b5a48" });
  });
  brandTag();
};

// =====================================================================================================
// 13. TRADE: 2025: a tug of war over the line, tariff crates drop; then the diner's February, down 55 percent
// =====================================================================================================
function crate(x, y, s, k, txt) { if (k <= 0) return; ctx.save(); ctx.translate(x, y - (1 - eout(k)) * 700); ctx.rotate((1 - k) * 0.4); ctx.scale(s, s); footShadow(0, 2, 110, 0.25 * k); piece(() => ctx.rect(-100, -120, 200, 120), A.wood, { lw: 4, rim: 8 }); for (const yy of [-80, -40]) line(-100, yy, 100, yy, A.wood2, 4); text(txt, 0, -44, { size: 38, color: A.ink }); ctx.restore(); }
CU.trade = (t, S) => {
  const tB = at("trade/one") - 0.15, slide = eio(pp(t, tB, 0.4));
  ctx.save(); ctx.translate(-W * slide, 0);
  sky({ sunX: 540, sunY: 300 }); ridge(900, 260, A.mtnFar, 0, 7, 0, true); haze(600, 960, 0.4);
  piece(() => ctx.rect(-20, 1000, W + 40, H), "#c9b88a", { lw: 4, rim: 10 });
  line(W / 2, 1000, W / 2, H, A.red, 10, [30, 18]);
  const tug = Math.sin(T * 4.5) * 22;
  stroke2(() => { ctx.moveTo(170 + tug, 760); ctx.quadraticCurveTo(W / 2 + tug, 800, W - 170 + tug, 760); }, "#d7b26a", 16, 24);
  hand(260 + tug, 760, 0.05, A.navy, "#e8d6a8", 0.75);
  ctx.save(); ctx.translate(W - 260 + tug, 760); ctx.scale(-1, 1); hand(0, 0, 0.05, A.red, A.cream, 0.75, { lace: false }); ctx.restore();
  flag("US", 110, 520, 160, 0); flag("CA", W - 270, 520, 160, 1);
  const tt = at("trade/trade");
  [[240, 1200, 1, tt - 0.1], [840, 1200, 1, tt + 0.05], [300, 1080, 0.85, tt + 0.25], [780, 1080, 0.85, tt + 0.35], [200, 1620, 1.4, tt + 0.5], [880, 1640, 1.4, tt + 0.65]].forEach(([x, y, s, a]) => crate(x, y, s, pp(t, a, 0.35), "TARIFF"));
  const ck = spring(pp(t, at("trade/twenty") - 0.05, 0.6));
  card(W / 2, 360, 260, 200, 0, ck, (w, h) => { piece(() => ctx.rect(-w / 2, -h / 2, w, 54), A.red, { lw: 0, light: false, shadow: false }); text("2025", 0, 64, { size: 90 }); });
  stamp("TRADE WAR", W / 2, 640, t - at("trade/war"), { size: 110, rot: -0.07, color: A.red });
  // B: the diner
  ctx.translate(W, 0);
  sky({ sunX: 900, sunY: 300, top: "#e2c8a0" });
  piece(() => ctx.rect(-20, 1060, W + 40, H), "#c9bfa6", { lw: 4, rim: 8 });
  footShadow(W / 2, 1066, 470, 0.2);
  piece(() => ctx.roundRect(70, 760, 940, 310, [40, 40, 0, 0]), "#d9e2dc", { lw: 5, rim: 12 });
  piece(() => ctx.rect(70, 960, 940, 22), A.red, { lw: 3, rim: 3, shadow: false });
  piece(() => ctx.roundRect(260, 640, 560, 110, 20), A.navy, { lw: 5, rim: 8 }); text("DINER", W / 2, 724, { size: 80, color: A.cream, ls: 20 });
  for (let i = 0; i < 4; i++) piece(() => ctx.roundRect(120 + i * 220, 800, 180, 140, 18), "#f6d98a", { lw: 3.5, rim: 4, shadow: false });
  // the owner behind the window, unnamed: a generic figure, not a real person
  ctx.save(); ctx.beginPath(); ctx.roundRect(340, 800, 180, 140, 18); ctx.clip();
  piece(() => ctx.ellipse(430, 950, 60, 70, 0, Math.PI, 0), A.cream, { lw: 3, rim: 4, shadow: false }); piece(() => ctx.arc(430, 860, 30, 0, 7), A.skin2, { lw: 3, rim: 4, shadow: false });
  ctx.fillStyle = A.ink; ctx.beginPath(); ctx.arc(420, 856, 3.5, 0, 7); ctx.arc(442, 856, 3.5, 0, 7); ctx.fill(); line(416, 842, 428, 846, A.ink, 3); line(436, 846, 448, 842, A.ink, 3);
  ctx.restore();
  // a chalkboard of February, last year vs this year
  const bk = spring(pp(t, tB + 0.25, 0.6));
  card(W / 2, 380, 760, 420, -0.02, bk, (w, h) => {
    piece(() => ctx.rect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28), "#3c4a42", { lw: 3, light: false, shadow: false });
    text("FEBRUARY SALES", 0, -h / 2 + 64, { size: 40, color: A.cream, ls: 4 });
    const grow = eout(pp(t, tB + 0.4, 0.6)), drop = eio(pp(t, at("trade/fiftyfive") - 0.1, 0.5)), base = h / 2 - 70, top = -h / 2 + 100;
    const h1 = (base - top) * grow, h2 = (base - top) * grow * lerp(1, 0.45, drop);
    piece(() => ctx.rect(-200, base - h1, 140, h1), "#9cc49a", { lw: 3, rim: 4, ink: A.cream, shadow: false });
    piece(() => ctx.rect(60, base - h2, 140, h2), "#e08a7a", { lw: 3, rim: 4, ink: A.cream, shadow: false });
    line(-260, base, 260, base, A.cream, 4);
    text("2024", -130, base + 40, { size: 30, color: A.cream }); text("2025", 130, base + 40, { size: 30, color: A.cream });
  }, { bg: "#7a5a3c", tape: false });
  stamp("−55%", 820, 300, t - at("trade/fiftyfive"), { size: 110, rot: -0.1, color: A.red });
  popLabel("one business owner's reported figure", W / 2, 1150, t, at("trade/owner"), { size: 28, bg: A.cream });
  ctx.restore();
  brandTag();
};

// =====================================================================================================
// 14. LOOP: back on the desk, the line glows; then a torn wipe into the opening picture (hook at t <= 0)
// =====================================================================================================
CU.loop = (t, S) => {
  const z = lerp(1.25, 1, eout(pp(t, S.t0, 0.9)));
  ctx.save(); ctx.translate(W / 2, 735); ctx.scale(z, z); ctx.translate(-W / 2, -735); treatyDesk(t, { lineK: 1, tint: 1, rulerK: 1, hands: true, noLabels: true }); ctx.restore();
  const mp = mapProj(NW_CAM), tl = at("loopback/line");
  if (t > tl - 0.1) { const a = mp(LINE_E, 49), b = mp(LINE_W, 49), p = 0.5 + 0.5 * Math.sin((t - tl) * 9); ctx.save(); ctx.globalAlpha = 0.55 * p; stroke2(() => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }, A.mustard, 22, 24); ctx.restore(); }
  const tw = at("loopback/which") - 0.1, k = eio(pp(t, tw, 0.45));
  if (k > 0) {
    const edge = lerp(W + 40, -60, k);
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.clip(); CU.hook(t - TL.duration, SC[0]); ctx.restore();
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.shadowColor = "rgba(30,15,5,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = -8; ctx.strokeStyle = "#fbf5e8"; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  }
};

// =====================================================================================================
// HYBRID (the house method): the geography beats fly over the real coastline in 3D (flight kit), the one big
// number uses moving type (kinetic kit). These replace version A's who / drive / lost scenes.
// =====================================================================================================
const PRF = makeFlight({
  origin: [-123.06, 48.99], near: "s_drive", colors: { US: 0xd98a3d, default: 0xe2cfa2 }, sea: 0x93b4ae,
  trees: { iso: ["CA", "US"], n: 2400, scale: 1.1 },
  lines: [
    { pts: [[-123.5, BORDER_LAT], [-122.3, BORDER_LAT]], color: 0xb8432c, width: 0.09, from: at("who.start") - 1, to: at("who.start") - 0.9 },
    { pts: ROUTE, color: 0xd9a441, width: 0.16, from: at("drive/to") - 0.1, to: at("drive/twice") + 0.1, smooth: 0.3 },
  ],
  keys: [
    [at("who.start"), -123.062, 48.987, 7.5, -12, 42], [at("who.end") + 0.3, -123.06, 48.99, 9.5, 0, 36],
    [at("drive.start"), -122.95, 49.035, 62, 0, 26], [at("drive.end") + 0.3, -122.91, 49.04, 70, 6, 26],
  ],
  update(t, k) {
    if (!k.props.userData.car) {                       // the local's sage wagon, in miniature, on the route
      const g = new k.T3.Group(); const b = new k.T3.Mesh(new k.T3.BoxGeometry(0.5, 0.16, 0.24), new k.T3.MeshLambertMaterial({ color: 0x6f8f86 })); b.position.y = 0.12; g.add(b);
      const c = new k.T3.Mesh(new k.T3.BoxGeometry(0.28, 0.12, 0.2), new k.T3.MeshLambertMaterial({ color: 0xcfe0dc })); c.position.set(-0.03, 0.25, 0); g.add(c);
      g.traverse(m => { if (m.isMesh) m.castShadow = true; }); k.props.add(g); k.props.userData.car = g;
    }
    const car = k.props.userData.car, td = at("drive/to") - 0.1, t2 = at("drive/twice");
    car.visible = t > td - 0.3 && t < at("kids/kids");
    const kk = lerp(0.03, 0.985, eio(pp(t, td, t2 - td + 0.2))), P = ROUTE.map(([lo, la]) => k.v3(lo, la, k.TOP)), c = along(P.map(p => [p.x, p.z]), kk);
    car.position.set(c.x, k.TOP, c.y); car.rotation.y = -c.a; car.scale.setScalar(4.5);
  },
});
CU.who = (t, S) => {
  PRF.draw(t);
  const t1 = at("who/twelve"), t5 = at("who/five");
  flightPin(PRF, "POINT ROBERTS, WA", -123.062, 48.984, t, S.t0 + 0.2, { size: 38, bg: A.mustard });
  flightPin(PRF, "CANADA", -123.08, 49.03, t, S.t0 + 0.6, { size: 40 });
  const ck = spring(pp(t, t1 - 0.15, 0.6)), tp = pp(t, t1, 1.2);
  card(540, 430, 560, 300, 0.02, ck, (w, h) => {
    text("U.S. CENSUS · 2020", 0, -h / 2 + 52, { size: 30, font: "Elite" }); rule(-230, 230, -h / 2 + 70);
    text("POPULATION", -230, 6, { size: 28, font: "Elite", align: "left" }); text(fmt(Math.round(1191 * eout(tp))), 230, 14, { size: 64, align: "right", color: A.red });
    text("AREA", -230, 96, { size: 28, font: "Elite", align: "left" }); if (t > t5) text(typed("≈ 5 SQ MI", pp(t, t5, 0.4)), 230, 100, { size: 52, align: "right", color: A.red });
  });
  brandTag();
};
CU.drive = (t, S) => {
  PRF.draw(t);
  const t1 = at("drive/cross"), t2 = at("drive/twice"), k = lerp(0.03, 0.985, eio(pp(t, S.t0 - 0.1, t2 - S.t0 + 0.15)));
  flightPin(PRF, "CROSSING 1", -123.0632, 49.0021, t, t1 - 0.1, { size: 32, bg: "#f2c9bd" });
  flightPin(PRF, "CROSSING 2", -122.757, 49.0021, t, t2 - 0.1, { size: 32, bg: "#f2c9bd" });
  flightPin(PRF, "BLAINE, WA", -122.75, 48.99, t, t2 + 0.2, { size: 32, up: 120 });
  const c = along(ROUTE, k), inC = clamp((k - c.frac(1)) / (c.frac(10) - c.frac(1)));
  odometer(780, 420, 25 * inC, spring(pp(t, S.t0 + 0.2, 0.6)));
  passportCard(270, 440, t, t1, t2);
  brandTag();
};
CU.lost = (t, S) => {
  const t0 = at("lost/lost"), te = at("lost/eighty");
  sky({ sunX: 170, sunY: 330, top: "#e2c7a0", bot: "#eddcbd" });
  ridge(860, 260, A.mtnFar, 0, 7, 0, true); haze(600, 920, 0.45);
  piece(() => ctx.rect(-20, 1000, W + 40, 80), "#c9bfa6", { lw: 4, rim: 6 });
  const left = lerp(100, 18, eio(pp(t, t0, at("lost/business") + 0.4 - t0)));
  SHOPS.forEach(([n, c], i) => shopfront(108 + i * 216, 1076, 200, n, c, { id: 130 + i, lit: left > 100 - (i + 1) * 20 + 1 || i === 4 ? 1 : 0, closed: left > 100 - (i + 1) * 20 + 1 || i === 4 ? null : t0 + i * 0.5 }));
  road(1070, 1200, 0); nearGround(1218, 0, "#9a9a6a");
  // the big number: the street dims, the figure rolls in on paper ink
  const dim = eout(pp(t, te - 0.4, 0.4)); if (dim > 0) { ctx.fillStyle = `rgba(43,35,32,${0.5 * dim})`; ctx.fillRect(0, 0, W, H); }
  bigNumber(t, te - 0.3, { value: 80, prefix: "−", suffix: "%+", label: "OF ITS BUSINESS", sub: S.p.label || "Border Policy Research Institute estimate",
    stroke: 16, size: 280, y: 640, roll: 0.8, colors: { fg: A.cream, accent: A.red, ink: A.ink }, subColor: A.cream });
  brandTag();
};

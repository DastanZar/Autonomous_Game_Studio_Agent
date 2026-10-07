// Paper kit (method A, "art-directed paper"): the Emu War craft as reusable parts.
// Load with storyboard.json "kits": ["paper"]. Pure functions of their arguments and T.
// Encodes the rules: one palette (KA; a channel may override entries), every shape a lit paper piece (rim light
// top-left, core shadow bottom-right, ink line, soft drop shadow), characters with anatomy, numbers on paper props.
"use strict";
const at = c => cue(c);
const pp = (t, a, d) => clamp((t - a) / d);
const ease2 = k => k * k * (3 - 2 * k);
const spring = (k, f = 4.5, d = 5) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-d * k) * Math.cos(f * Math.PI * k);   // overshoot then settle
const KA = {
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
  if (o.lw !== 0) { ctx.beginPath(); path(); ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.ink || KA.ink; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
  ctx.restore();
}
const footShadow = (x, y, w, a = 0.22) => { ctx.save(); ctx.fillStyle = `rgba(40,25,12,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, 7); ctx.fill(); ctx.restore(); };
function blob(cx, cy, rx, ry, n, seed, jag = 0.08) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283; const r = 1 + (rnd(seed, i) - 0.5) * jag * 2; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return () => smooth(pts); }
const FIMG = {};
function mapleLeaf(g, cx, cy, s) {
  const L = [[0,-1],[.12,-.78],[.3,-.86],[.22,-.42],[.46,-.64],[.54,-.5],[.78,-.58],[.68,-.32],[.84,-.24],[.48,.04],[.55,.18],[.08,.12],[.07,.55],[-.07,.55],[-.08,.12],[-.55,.18],[-.48,.04],[-.84,-.24],[-.68,-.32],[-.78,-.58],[-.54,-.5],[-.46,-.64],[-.22,-.42],[-.3,-.86],[-.12,-.78]];
  g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s)); g.closePath();
}
function flagImg(kind) {
  if (FIMG[kind]) return FIMG[kind];
  const c = document.createElement("canvas"), w = 380, h = 200; c.width = w; c.height = h; const g = c.getContext("2d");
  if (kind === "US") {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? KA.cream : KA.red; g.fillRect(0, i * h / 13, w, h / 13 + 1); }
    g.fillStyle = KA.navy; g.fillRect(0, 0, w * 0.4, h * 7 / 13); g.fillStyle = KA.cream;
    for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) { g.beginPath(); g.arc(12 + k * 25 + (r % 2 ? 12 : 0), 9 + r * 11.5, 3.4, 0, 7); g.fill(); }
  } else {
    g.fillStyle = KA.red; g.fillRect(0, 0, w, h); g.fillStyle = KA.cream; g.fillRect(w / 4, 0, w / 2, h);
    g.fillStyle = KA.red; mapleLeaf(g, w / 2, h * 0.52, h * 0.4); g.fill(); g.fillRect(w / 2 - 4, h * 0.6, 8, h * 0.2);
  }
  return (FIMG[kind] = c);
}
function flag(kind, x, y, w, ph = 0, amp) {
  const img = flagImg(kind), h = w * img.height / img.width, N = 26; amp = amp ?? w * 0.06;
  const dy = u => Math.sin(u * 5.5 - T * 5.5 + ph) * amp * u;
  ctx.save(); ctx.shadowColor = "rgba(40,25,12,0.28)"; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 7; ctx.shadowBlur = 6;
  ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();
  for (let i = 0; i < N; i++) { const u = i / N; ctx.drawImage(img, img.width * u, 0, img.width / N + 1, img.height, x + w * u, y + dy(u), w / N + 1, h); const l = Math.cos(u * 5.5 - T * 5.5 + ph); ctx.fillStyle = l > 0 ? `rgba(255,250,235,${l * 0.18})` : `rgba(30,20,10,${-l * 0.22})`; ctx.fillRect(x + w * u, y + dy(u), w / N + 1, h); }
  ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(x + w * i / N, y + dy(i / N)); for (let i = N; i >= 0; i--) ctx.lineTo(x + w * i / N, y + h + dy(i / N)); ctx.closePath(); ctx.stroke(); ctx.restore();
}
function pole(kind, x, gy, h, w, ph) {
  piece(() => ctx.roundRect(x - 6, gy - h, 12, h, 4), "#d8d1c2", { lw: 3, rim: 4 });
  piece(() => ctx.arc(x, gy - h - 7, 10, 0, 7), KA.mustard, { lw: 3, rim: 4 });
  flag(kind, x + 5, gy - h + 4, w, ph);
}
const GY = 1120;
function sky(o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, o.top || KA.sky2); g.addColorStop(1, o.bot || KA.sky);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sx = o.sunX ?? 820, sy = o.sunY ?? 430;
  if (o.sun !== false) {
    const rg = ctx.createRadialGradient(sx, sy, 60, sx, sy, 300); rg.addColorStop(0, "rgba(250,225,150,0.55)"); rg.addColorStop(1, "rgba(250,225,150,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    piece(() => ctx.arc(sx, sy, 88, 0, 7), KA.sun, { lw: 4, rim: 10 });
  }
  for (let i = 0; i < 4; i++) {
    const span = W + 600, cx = ((rnd(i, 61) * span + T * (10 + 8 * rnd(i, 62)) - (o.scroll || 0) * 0.04) % span + span) % span - 300, cy = 250 + rnd(i, 63) * 300, s = 0.7 + rnd(i, 64) * 0.5;
    piece(blob(cx, cy, 150 * s, 44 * s, 16, i, 0.12), KA.cream, { lw: 3, rim: 6, sx: 3, sy: 6, alpha: 0.95 });
  }
}
function ridge(base, amp, col, par, seed, scroll, snow) {
  const off = scroll * par, pts = [];
  for (let x = -80; x <= W + 80; x += 24) { const u = (x + off) / 300; const k = Math.floor(u), f = u - k; const h = lerp(rnd(k, seed), rnd(k + 1, seed), ease2(f)); pts.push([x, base - amp * (0.35 + 0.65 * h) * (0.85 + 0.15 * Math.sin(u * 7 + seed))]); }
  const path = () => { ctx.moveTo(-80, GY + 40); pts.forEach(p => ctx.lineTo(...p)); ctx.lineTo(W + 80, GY + 40); ctx.closePath(); };
  piece(path, col, { lw: 3.5, rim: 8, shadow: false });
  if (snow) { ctx.save(); ctx.beginPath(); path(); ctx.clip(); ctx.fillStyle = KA.snow; ctx.beginPath(); ctx.moveTo(-80, base - amp * 0.72); for (let x = -80; x <= W + 80; x += 24) ctx.lineTo(x, base - amp * (0.72 + 0.06 * Math.sin(x * 0.05 + seed))); ctx.lineTo(W + 80, -10); ctx.lineTo(-80, -10); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
function haze(y0, y1, a = 0.35) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(236,220,189,${a})`); g.addColorStop(1, "rgba(236,220,189,0)"); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }
function water(y0, y1, scroll = 0) {
  piece(() => ctx.rect(-20, y0, W + 40, y1 - y0), KA.sea, { lw: 3.5, rim: 8, shadow: false });
  ctx.save(); ctx.strokeStyle = "rgba(255,250,235,0.55)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (let i = 0; i < 26; i++) { const x = ((rnd(i, 71) * (W + 200) - scroll * 0.25 + T * 18) % (W + 200) + W + 200) % (W + 200) - 100, y = y0 + 12 + rnd(i, 72) * (y1 - y0 - 24), l = 14 + rnd(i, 73) * 26, a = 0.5 + 0.5 * Math.sin(T * 2 + i); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); }
  ctx.restore();
}
function pine(x, gy, s, id, col = KA.pine, far = 1) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.rotate(Math.sin(T * 1.2 + id) * 0.012);
  piece(() => ctx.roundRect(-8, -36, 16, 40, 3), KA.wood2, { lw: 3, rim: 3, sx: 3, sy: 4 });
  const tiers = [[78, -30, -120], [62, -86, -170], [44, -138, -214], [28, -184, -250]];
  tiers.forEach(([w, y, top], i) => piece(() => { ctx.moveTo(-w, y); ctx.quadraticCurveTo(-w * 0.45, y - 10, -w * 0.2, (y + top) / 2 + 4); ctx.lineTo(0, top); ctx.lineTo(w * 0.2, (y + top) / 2 + 4); ctx.quadraticCurveTo(w * 0.45, y - 10, w, y); ctx.quadraticCurveTo(0, y + 12, -w, y); ctx.closePath(); }, i % 2 ? tone(col, -0.1) : col, { lw: 3.5 * far, rim: 6, sx: 3 * far, sy: 5 * far, ink: far < 1 ? "#4a4436" : KA.ink }));
  ctx.restore();
}
function grass(y0, y1, scroll, col = KA.moss) {
  piece(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y0); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y0 + Math.sin((x + scroll) * 0.009) * 8); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, col, { lw: 4.5, rim: 10, shadow: false });
  ctx.fillStyle = tone(col, -0.18);
  for (let i = 0; i < 90; i++) { const span = W + 100, x = ((rnd(i, 81) * span - scroll * (1 + rnd(i, 84) * 0.5)) % span + span) % span - 50, y = y0 + 30 + rnd(i, 82) * (y1 - y0 - 30), s = 0.6 + rnd(i, 83) * 0.8;
    ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.quadraticCurveTo(x - 6 * s, y - 14 * s, x - 3 * s, y - 20 * s); ctx.quadraticCurveTo(x - 1 * s, y - 8 * s, x, y - 3 * s); ctx.quadraticCurveTo(x + 3 * s, y - 16 * s, x + 7 * s, y - 22 * s); ctx.quadraticCurveTo(x + 6 * s, y - 8 * s, x + 9 * s, y); ctx.closePath(); ctx.fill(); }
}
function road(y0, y1, scroll = 0) {
  piece(() => ctx.rect(-20, y0, W + 40, y1 - y0), KA.road, { lw: 4, rim: 6, sx: 0, sy: 5 });
  ctx.fillStyle = "rgba(255,240,200,0.06)"; for (let i = 0; i < 60; i++) ctx.fillRect(((rnd(i, 91) * W - scroll) % W + W) % W, y0 + rnd(i, 92) * (y1 - y0), 3, 3);
  const dash = 80, off = ((scroll % (dash * 2)) + dash * 2) % (dash * 2);
  ctx.fillStyle = KA.mustard; for (let x = -dash * 2 - off; x < W + dash; x += dash * 2) ctx.fillRect(x, (y0 + y1) / 2 - 5, dash, 10);
  piece(() => ctx.rect(-20, y1, W + 40, 18), "#a19a8b", { lw: 3, rim: 3, shadow: false });
}
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
      stroke2(() => { ctx.moveTo(...hip); ctx.lineTo(...knee); ctx.lineTo(...foot); }, side > 0 ? KA.denim : tone(KA.denim, -0.12), 26, 34);
      piece(() => ctx.roundRect(foot[0] - 16, foot[1] - 12, 44, 20, [8, 12, 4, 4]), KA.wood2, { lw: 3.5, rim: 4, shadow: false });
    }
  } else ctx.translate(0, bob);
  // torso: a buffalo-check jacket
  const torso = () => { ctx.moveTo(-40, -240); ctx.quadraticCurveTo(-48, -170, -42, -118); ctx.quadraticCurveTo(0, -108, 42, -118); ctx.quadraticCurveTo(50, -170, 40, -240); ctx.quadraticCurveTo(0, -256, -40, -240); ctx.closePath(); };
  const coat = o.coat || KA.red;                          // outfit options: coat, plaid, beard (colour|false), hat, capCol
  piece(torso, coat, { lw: 4.5, rim: 9 });
  if (o.plaid !== false) { ctx.save(); ctx.beginPath(); torso(); ctx.clip(); ctx.fillStyle = "rgba(43,35,32,0.42)";
  for (let gx = -60; gx < 60; gx += 28) ctx.fillRect(gx, -260, 14, 160); for (let gy = -260; gy < -100; gy += 28) ctx.fillRect(-60, gy, 120, 14); ctx.restore(); }
  if (o.straps) { ctx.save(); ctx.beginPath(); torso(); ctx.clip(); ctx.fillStyle = o.straps; ctx.fillRect(-36, -190, 72, 80); ctx.fillRect(-30, -250, 12, 70); ctx.fillRect(18, -250, 12, 70); ctx.restore(); }
  ctx.save(); ctx.beginPath(); torso(); ctx.lineWidth = 4.5; ctx.strokeStyle = KA.ink; ctx.stroke(); ctx.restore();
  // arms: shoulder -> elbow -> mitten
  const arm = (side, ang, el) => {
    const sh = [side > 0 ? 16 : -12, -226], elb = [sh[0] + Math.sin(ang) * 52, sh[1] + Math.cos(ang) * 52], hand = [elb[0] + Math.sin(ang + el) * 50, elb[1] + Math.cos(ang + el) * 50];
    stroke2(() => { ctx.moveTo(...sh); ctx.lineTo(...elb); ctx.lineTo(...hand); }, side > 0 ? coat : tone(coat, -0.18), 22, 30);
    piece(() => ctx.arc(hand[0], hand[1], 14, 0, 7), KA.skin, { lw: 3.5, rim: 4, shadow: false });
    return hand;
  };
  const wave = o.arm === "wave" ? Math.sin(T * 10) * 0.35 : 0;
  arm(-1, sw * 0.5 + 0.05, 0.35);
  const hand = o.arm === "wave" ? arm(1, Math.PI - 0.5 + wave, 0.5) : o.arm === "hold" ? arm(1, 0.9, 1.0) : arm(1, -sw * 0.5 + 0.05, 0.35);
  if (o.carry) { ctx.save(); ctx.translate(...hand); o.carry(); ctx.restore(); }
  // head
  ctx.save(); ctx.translate(6, -282); ctx.rotate((o.tilt || 0) + Math.sin(T * 1.7 + (o.id || 0)) * 0.02);
  piece(() => { ctx.ellipse(0, 0, 40, 44, 0, 0, 7); }, KA.skin, { lw: 4, rim: 7 });
  piece(() => ctx.ellipse(-30, 4, 9, 13, 0, 0, 7), KA.skin2, { lw: 3, rim: 3, shadow: false });                  // ear
  piece(() => { ctx.moveTo(-34, 4); ctx.quadraticCurveTo(-36, 50, 2, 56); ctx.quadraticCurveTo(40, 52, 40, 8); ctx.quadraticCurveTo(26, 20, 8, 20); ctx.quadraticCurveTo(-14, 22, -34, 4); ctx.closePath(); }, o.beard === false ? KA.skin : (o.beard || KA.beard), { lw: o.beard === false ? 0 : 4, rim: 5, shadow: false, light: o.beard !== false });
  if (o.beard === false) { ctx.beginPath(); ctx.arc(22, 30, 9, 0.2, 2.6); ctx.strokeStyle = KA.ink; ctx.lineWidth = 3; ctx.stroke(); if (o.mustache) piece(() => { ctx.moveTo(4, 22); ctx.quadraticCurveTo(24, 12, 44, 24); ctx.quadraticCurveTo(24, 20, 4, 22); }, o.mustache, { lw: 2.5, rim: 2, shadow: false }); }
  piece(() => ctx.ellipse(36, -2, 9, 11, 0.3, 0, 7), KA.skin2, { lw: 3, rim: 3, shadow: false });                // nose
  const bl = o.blink != null ? (((T + o.blink) % 3.7) < 0.12) : false, lx = (o.look || 0) * 4;
  if (bl) line(10, -6, 26, -6, KA.ink, 3.5);
  else { piece(() => ctx.ellipse(18, -6, 8, 10, 0, 0, 7), KA.cream, { lw: 3, light: false, shadow: false }); ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(20 + lx, -5, 4.2, 0, 7); ctx.fill(); }
  const br = o.brow || 0; line(8, -22 + br * 2, 30, -22 - br * 4 + (br < 0 ? 6 : 0), KA.ink, 4.5);
  line(16, 34, 30, 33 + (o.mouth === "o" ? 0 : 0), KA.cream, 3);
  const hat = o.hat || "knit", capCol = o.capCol || KA.mustard;
  if (hat === "knit") {
  // knit cap with a fold and a pom
  piece(() => { ctx.moveTo(-42, -12); ctx.quadraticCurveTo(-46, -64, 0, -70); ctx.quadraticCurveTo(46, -64, 42, -12); ctx.closePath(); }, capCol, { lw: 4, rim: 6, shadow: false });
  piece(() => ctx.roundRect(-46, -26, 92, 22, 8), tone(capCol, -0.1), { lw: 4, rim: 4, shadow: false });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.25)"; ctx.lineWidth = 2.5; for (let k = -30; k <= 30; k += 12) { ctx.beginPath(); ctx.moveTo(k, -26); ctx.lineTo(k * 0.8, -62); ctx.stroke(); } ctx.restore();
  piece(() => ctx.arc(-4 + Math.sin(T * 6) * (ph == null ? 0.5 : 3), -78, 14, 0, 7), KA.cream, { lw: 3.5, rim: 4, shadow: false });
  } else if (hat === "straw") {
    piece(() => ctx.ellipse(0, -30, 72, 14, 0, 0, 7), "#e3c36e", { lw: 3.5, rim: 4, shadow: false });
    piece(() => { ctx.moveTo(-36, -30); ctx.quadraticCurveTo(-34, -78, 0, -80); ctx.quadraticCurveTo(34, -78, 36, -30); ctx.closePath(); }, "#e8cd7e", { lw: 3.5, rim: 5, shadow: false });
    piece(() => ctx.rect(-36, -44, 72, 10), KA.red2, { lw: 2.5, light: false, shadow: false });
  } else if (hat === "top") {
    piece(() => ctx.roundRect(-46, -36, 92, 12, 4), "#2b2724", { lw: 3, light: false, shadow: false });
    piece(() => ctx.roundRect(-30, -110, 60, 78, 4), "#2b2724", { lw: 3.5, rim: 4, shadow: false });
  } else if (hat === "bowler") {
    piece(() => ctx.ellipse(0, -30, 56, 10, 0, 0, 7), "#3a3330", { lw: 3, rim: 3, shadow: false });
    piece(() => { ctx.moveTo(-34, -32); ctx.bezierCurveTo(-34, -84, 34, -84, 34, -32); ctx.closePath(); }, "#3a3330", { lw: 3.5, rim: 4, shadow: false });
  }
  ctx.restore();
  ctx.restore();
}
function kidHead(x, y, s, id, look = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(T * 6 + id) * 0.05);
  const skin = [KA.skin, "#c99a72", "#8d5f3e", "#e3b48c"][id % 4];
  piece(() => ctx.ellipse(0, 0, 24, 26, 0, 0, 7), skin, { lw: 3, rim: 4, shadow: false });
  piece(() => { ctx.moveTo(-25, -2); ctx.quadraticCurveTo(-24, -32, 2, -30); ctx.quadraticCurveTo(26, -28, 25, -4); ctx.quadraticCurveTo(10, -16, -25, -2); ctx.closePath(); }, ["#3b2a20", "#6b4a32", "#2b2320", "#a8743a"][id % 4], { lw: 3, rim: 3, shadow: false });
  ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(8 + look * 3, 0, 3.2, 0, 7); ctx.arc(-6 + look * 3, 0, 3.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(1, 10, 6, 0.2, 2.9); ctx.strokeStyle = KA.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
function surveyor(o) {
  const s = o.s || 1, ph = o.walk;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 9, 0.6 / s);
  const sw = ph == null ? 0 : Math.sin(ph); footShadow(0, 2, 60);
  ctx.translate(0, ph == null ? 0 : -Math.abs(Math.cos(ph)) * 6);
  for (const side of [1, -1]) { ctx.save(); ctx.translate(side * 8, -120); ctx.rotate(sw * 0.4 * side); piece(() => ctx.roundRect(-10, 0, 20, 112, 6), "#3a3530", { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.roundRect(-12, 104, 34, 16, 6), KA.ink, { lw: 3, light: false, shadow: false }); ctx.restore(); }
  piece(() => { ctx.moveTo(-36, -232); ctx.quadraticCurveTo(-44, -150, -46, -96); ctx.lineTo(44, -96); ctx.quadraticCurveTo(42, -150, 36, -232); ctx.quadraticCurveTo(0, -246, -36, -232); ctx.closePath(); }, o.col || "#4a5560", { lw: 4.5, rim: 8 });
  stroke2(() => { ctx.moveTo(30, -220); ctx.lineTo(48 + sw * 10, -160); ctx.lineTo(56 + sw * 14, -112); }, o.col || "#4a5560", 18, 26);
  piece(() => ctx.arc(56 + sw * 14, -108, 11, 0, 7), KA.skin, { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(4, -272);
  piece(() => ctx.ellipse(0, 0, 32, 36, 0, 0, 7), KA.skin, { lw: 4, rim: 6 });
  piece(() => { ctx.moveTo(-28, 6); ctx.quadraticCurveTo(-30, 44, 4, 46); ctx.quadraticCurveTo(34, 42, 32, 8); ctx.quadraticCurveTo(10, 22, -28, 6); ctx.closePath(); }, o.beard || "#8a8070", { lw: 3.5, rim: 4, shadow: false });
  ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(16 + (o.look || 0) * 3, -6, 4, 0, 7); ctx.fill(); line(6, -20 + (o.brow || 0) * 3, 26, -22 - (o.brow || 0) * 3, KA.ink, 4);
  piece(() => ctx.roundRect(-30, -40, 60, 10, 4), KA.ink, { lw: 3, light: false, shadow: false });
  piece(() => ctx.roundRect(-22, -96, 44, 60, 4), "#2b2724", { lw: 3.5, rim: 4, shadow: false });
  ctx.restore();
  ctx.restore();
}
function wagon(o) {
  const s = o.s || 1;
  footShadow(o.x + 10 * s, o.gy + 2, 150 * s, 0.25);
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 5, 0.4 / s);
  const sq = o.squat || 0, bob = o.moving === false ? 0 : Math.sin((o.ph ?? T) * 17) * 1.6;
  ctx.save(); ctx.translate(0, -bob + sq * 6); ctx.rotate(-sq * 0.035);
  const body = () => { ctx.moveTo(-170, -42); ctx.quadraticCurveTo(-176, -96, -150, -104); ctx.lineTo(-120, -106); ctx.lineTo(-104, -168); ctx.quadraticCurveTo(-100, -176, -88, -176); ctx.lineTo(40, -176); ctx.quadraticCurveTo(56, -176, 66, -164); ctx.lineTo(104, -112); ctx.quadraticCurveTo(168, -106, 176, -84); ctx.quadraticCurveTo(182, -58, 176, -42); ctx.closePath(); };
  piece(body, KA.sage, { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(-160, -86); ctx.lineTo(170, -86); ctx.lineTo(172, -74); ctx.lineTo(-162, -74); ctx.closePath(); }, KA.cream, { lw: 2.5, rim: 2, shadow: false });     // wood-grain stripe
  const win = (x0, x1, x2, x3) => () => { ctx.moveTo(x0, -110); ctx.lineTo(x1, -164); ctx.lineTo(x2, -164); ctx.lineTo(x3, -110); ctx.closePath(); };
  [win(-102, -90, -34, -34), win(-24, -24, 34, 34), win(44, 44, 56, 92)].forEach(w => {
    piece(w, "#bfd3cf", { lw: 3, rim: 4, shadow: false });
    ctx.save(); ctx.beginPath(); w(); ctx.clip(); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-120, -110); ctx.lineTo(-60, -170); ctx.moveTo(0, -110); ctx.lineTo(60, -170); ctx.stroke(); ctx.restore();
  });
  if (o.driver !== false) { ctx.save(); ctx.beginPath(); win(44, 44, 56, 92)(); win(-24, -24, 34, 34)(); ctx.clip(); local({ x: 26, gy: 76, s: 0.75, sit: true, blink: 1.3, look: o.look ?? 1, brow: o.brow, id: 3 }); ctx.restore(); }
  piece(() => ctx.roundRect(166, -70, 18, 14, 4), "#f6dc8a", { lw: 2.5, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-182, -56, 30, 12, 4), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false });
  piece(() => ctx.roundRect(160, -50, 30, 12, 4), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false });
  if (o.plate) { piece(() => ctx.rect(-176, -72, 34, 20), KA.cream, { lw: 2, light: false, shadow: false }); text("WA", -159, -57, { size: 14 }); }
  // antenna with follow-through
  const wob = Math.sin(T * 9) * 0.06 + (o.accel || 0) * 0.35;
  ctx.save(); ctx.translate(-88, -176); ctx.rotate(-0.2 - wob); line(0, 0, 0, -70, KA.ink, 3); ctx.restore();
  for (const wx of [-108, 112]) piece(() => { ctx.moveTo(wx - 58, -40); ctx.quadraticCurveTo(wx, -96, wx + 58, -40); ctx.closePath(); }, KA.sage2, { lw: 3.5, rim: 3, shadow: false });
  ctx.restore();
  for (const wx of [-108, 112]) {
    ctx.save(); ctx.translate(wx, -32);
    piece(() => ctx.arc(0, 0, 34, 0, 7), "#2f2a25", { lw: 3.5, rim: 5, shadow: false });
    piece(() => ctx.arc(0, 0, 18, 0, 7), "#c9c4b6", { lw: 3, rim: 3, shadow: false });
    ctx.rotate(o.spin || 0); ctx.strokeStyle = KA.ink; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}
function exhaust(x, y, t, n = 5, col = "#e6dccb") {
  for (let i = 0; i < n; i++) { const a = ((t * 1.6 + i / n) % 1); ctx.save(); ctx.globalAlpha = (1 - a) * 0.8; piece(blob(x - a * 140, y - a * 60, 14 + a * 34, 12 + a * 26, 10, i, 0.15), col, { lw: 2.5, rim: 4, shadow: false }); ctx.restore(); }
}
function borderBooth(x, gy, s, open, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(o.id || 33, 0.3);
  footShadow(0, 4, 210, 0.2);
  // canopy
  for (const px of [-170, 170]) piece(() => ctx.roundRect(px - 9, -300, 18, 300, 4), "#ddd6c6", { lw: 3.5, rim: 4 });
  piece(() => { ctx.moveTo(-220, -300); ctx.quadraticCurveTo(0, -350, 220, -300); ctx.lineTo(220, -262); ctx.quadraticCurveTo(0, -306, -220, -262); ctx.closePath(); }, KA.cream, { lw: 4.5, rim: 8 });
  piece(() => { ctx.moveTo(-220, -276); ctx.quadraticCurveTo(0, -320, 220, -276); ctx.lineTo(220, -262); ctx.quadraticCurveTo(0, -306, -220, -262); ctx.closePath(); }, KA.red, { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(0, -322); ctx.fillStyle = KA.red; mapleLeaf(ctx, 0, 0, 22); ctx.fill(); ctx.restore();
  text(o.label || "CANADA", 0, -270, { size: 26, color: KA.cream, ls: 6 });
  // kiosk
  piece(() => ctx.roundRect(-70, -200, 140, 200, [10, 10, 0, 0]), "#e8e1d1", { lw: 4, rim: 6 });
  piece(() => ctx.roundRect(-54, -184, 108, 76, 6), "#bfd3cf", { lw: 3, rim: 4, shadow: false });
  if (o.officer !== false) { ctx.save(); ctx.beginPath(); ctx.roundRect(-54, -184, 108, 76, 6); ctx.clip();
    piece(() => ctx.ellipse(-8, -112, 34, 26, 0, Math.PI, 0), o.uniform || "#1f2b44", { lw: 3, rim: 3, shadow: false });
    piece(() => ctx.arc(-8, -142, 18, 0, 7), KA.skin, { lw: 3, rim: 3, shadow: false });
    piece(() => { ctx.moveTo(-28, -152); ctx.quadraticCurveTo(-8, -170, 14, -152); ctx.lineTo(20, -150); ctx.lineTo(-30, -150); ctx.closePath(); }, o.uniform || "#1f2b44", { lw: 2.5, rim: 2, shadow: false });
    ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(-14 + (o.look || -1) * 3, -142, 2.6, 0, 7); ctx.arc(-2 + (o.look || -1) * 3, -142, 2.6, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // barrier on its own post, left of the kiosk
  const px = x - 150 * s, py = gy - 70 * s;
  ctx.save(); ctx.translate(px, py); ctx.scale(-s, s); ctx.rotate(-open * 1.4);
  piece(() => ctx.roundRect(0, -11, 300, 22, 10), KA.cream, { lw: 3.5, rim: 4 });
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, -11, 300, 22, 10); ctx.clip(); ctx.fillStyle = KA.red; for (let i = 0; i < 6; i++) ctx.fillRect(20 + i * 48, -11, 22, 22); ctx.restore();
  ctx.beginPath(); ctx.roundRect(0, -11, 300, 22, 10); ctx.lineWidth = 3.5; ctx.strokeStyle = KA.ink; ctx.stroke();
  ctx.restore();
  piece(() => ctx.roundRect(px - 16 * s, py - 10 * s, 32 * s, 80 * s, 6), "#5e5a52", { lw: 3.5, rim: 4 });
}
function schoolBus(x, gy, s, dir, ph, o = {}) {
  footShadow(x, gy + 2, 260 * s, 0.25);
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s); boil(88, 0.4 / s);
  ctx.translate(0, Math.sin(ph * 15) * 1.8);
  const body = () => { ctx.moveTo(-260, -46); ctx.lineTo(-262, -210); ctx.quadraticCurveTo(-260, -230, -236, -232); ctx.lineTo(170, -232); ctx.quadraticCurveTo(190, -230, 194, -210); ctx.lineTo(198, -150); ctx.quadraticCurveTo(262, -146, 270, -110); ctx.lineTo(272, -46); ctx.closePath(); };
  piece(body, "#e9b23a", { lw: 4.5, rim: 10 });
  piece(() => ctx.rect(-262, -122, 534, 12), KA.ink, { lw: 0, light: false, shadow: false });
  piece(() => ctx.rect(-262, -96, 534, 8), KA.ink, { lw: 0, light: false, shadow: false });
  for (let i = 0; i < 6; i++) {
    const wx = -236 + i * 66;
    piece(() => ctx.roundRect(wx, -212, 52, 66, 6), "#bfd3cf", { lw: 3, rim: 4, shadow: false });
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, -212, 52, 66, 6); ctx.clip(); kidHead(wx + 26, -160 + Math.sin(ph * 9 + i * 1.3) * 3, 0.9, i + (o.seed || 0), dir); ctx.restore();
  }
  piece(() => ctx.roundRect(176, -212, 40, 60, 6), "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.scale(dir, 1); text("SCHOOL BUS", dir > 0 ? -40 : 40, -66, { size: 30, color: KA.ink, ls: 4 }); ctx.restore();
  piece(() => ctx.roundRect(262, -96, 16, 16, 3), "#f6dc8a", { lw: 2.5, rim: 2, shadow: false });
  ctx.restore();
  for (const wx of [-170, 190]) { ctx.save(); ctx.translate(x + wx * s * dir, gy - 32 * s); ctx.scale(s, s); piece(() => ctx.arc(0, 0, 36, 0, 7), "#2f2a25", { lw: 3.5, rim: 5, shadow: false }); piece(() => ctx.arc(0, 0, 17, 0, 7), "#c9c4b6", { lw: 3, rim: 3, shadow: false }); ctx.rotate(ph * 22 * dir); line(-14, 0, 14, 0, KA.ink, 3); ctx.restore(); }
}
function card(x, y, w, h, rot, k, draw, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - k) * 80); ctx.rotate(rot + (1 - k) * 0.12); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); ctx.globalAlpha *= clamp(k * 3);
  piece(() => ctx.rect(-w / 2, -h / 2, w, h), o.bg || KA.cream, { lw: 4, rim: 6, sx: 10, sy: 16, sb: 18 });
  if (o.tape !== false) { ctx.save(); ctx.translate(0, -h / 2); ctx.rotate(-0.04); ctx.fillStyle = "rgba(230,215,170,0.85)"; ctx.fillRect(-60, -16, 120, 32); ctx.restore(); }
  draw(w, h);
  ctx.restore();
}
const typed = (str, k) => str.slice(0, Math.round(str.length * clamp(k)));
function rule(x0, x1, y) { line(x0, y, x1, y, "rgba(43,35,32,0.45)", 2); }
function woodSign(x, y, lines, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot || 0) + (1 - k) * 0.3); ctx.scale(k, k);
  for (const px of [-o.w / 2 + 40, o.w / 2 - 40]) piece(() => ctx.roundRect(px - 10, 0, 20, o.post || 200, 4), KA.wood2, { lw: 3.5, rim: 4 });
  const h = lines.length * 54 + 40;
  piece(() => ctx.roundRect(-o.w / 2, -h, o.w, h, 10), KA.wood, { lw: 4.5, rim: 8 });
  ctx.save(); ctx.strokeStyle = "rgba(43,35,32,0.18)"; ctx.lineWidth = 2; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-o.w / 2 + 10, -h + i * h / 5); ctx.quadraticCurveTo(0, -h + i * h / 5 + 6, o.w / 2 - 10, -h + i * h / 5); ctx.stroke(); } ctx.restore();
  lines.forEach(([str, size, col], i) => text(str, 0, -h + 58 + i * 54, { size, color: col || KA.cream, font: o.font || "Anton", ls: 2 }));
  ctx.restore();
}
function nearGround(y0, scroll, col = KA.moss) {
  piece(() => { ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y0); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y0 + Math.sin((x + scroll) * 0.007) * 6); ctx.lineTo(W + 20, H + 20); ctx.closePath(); }, col, { lw: 4.5, rim: 10, shadow: false });
  const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(40,30,15,0.28)"); ctx.fillStyle = g; ctx.fillRect(0, y0 + 10, W, H - y0);
  for (let i = 0; i < 26; i++) {
    const span = W + 200, x = ((rnd(i, 101) * span - scroll * 1.4) % span + span) % span - 100, y = y0 + 80 + rnd(i, 102) * (H - y0 - 120), s = 0.7 + (y - y0) / (H - y0) * 1.3;
    if (i % 5 === 0) piece(blob(x, y, 30 * s, 16 * s, 9, i, 0.2), "#b9ad93", { lw: 3, rim: 4, sx: 3, sy: 4 });
    else { ctx.fillStyle = tone(col, -0.22); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 9 * s - 4 * s, y); ctx.quadraticCurveTo(x + k * 12 * s, y - 26 * s, x + k * 16 * s, y - 34 * s); ctx.quadraticCurveTo(x + k * 9 * s + 2 * s, y - 14 * s, x + k * 9 * s + 4 * s, y); ctx.fill(); }
      if (i % 3 === 0) piece(() => ctx.arc(x + 6 * s, y - 30 * s, 6 * s, 0, 7), [KA.cream, KA.mustard, "#d98a8a"][i % 3], { lw: 2, rim: 2, shadow: false }); }
  }
}
function splitRail(y, scroll, col = KA.wood) {        // a split-rail fence in the near ground, faster parallax
  const sp = 260, off = ((scroll % sp) + sp) % sp;
  for (let x = -sp - off; x < W + sp; x += sp) {
    piece(() => { ctx.moveTo(x - 10, y); ctx.lineTo(x - 8, y - 150); ctx.lineTo(x + 10, y - 156); ctx.lineTo(x + 12, y); ctx.closePath(); }, col, { lw: 3.5, rim: 5 });
    for (const ry of [-118, -64]) piece(() => { ctx.moveTo(x, y + ry); ctx.quadraticCurveTo(x + sp / 2, y + ry + 8, x + sp, y + ry - 4); ctx.lineTo(x + sp, y + ry + 14); ctx.quadraticCurveTo(x + sp / 2, y + ry + 24, x, y + ry + 16); ctx.closePath(); }, tone(col, 0.08), { lw: 3.5, rim: 5 });
  }
}
function mapProj(cam) { const k = Math.cos(cam.lat * Math.PI / 180); return (lon, lat) => [cam.cx + (lon - cam.lon) * k * cam.s, cam.cy - (lat - cam.lat) * cam.s]; }
function ringsPath(polys, mp) { for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const p = mp(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); } }
function seaFlat(col = KA.sea) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = "rgba(255,250,235,0.16)"; ctx.lineWidth = 2;
  for (let y = -40; y < H + 40; y += 30) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.012 + y * 0.03 + T * 0.9) * 5); ctx.stroke(); }
  ctx.restore();
}
function mapLand(id, mp, fill, o = {}) {
  const g = GEO[id]; if (!g) { warn("no geometry for " + id); return; }
  const all = () => { for (const L of g.layers) ringsPath(L.polys, mp); };
  ctx.save(); ctx.lineJoin = "round";
  [[44, 0.10], [28, 0.14], [14, 0.22]].forEach(([w, a]) => { ctx.beginPath(); all(); ctx.strokeStyle = `rgba(214,232,224,${a})`; ctx.lineWidth = w; ctx.stroke(); });
  ctx.restore();
  for (const L of g.layers) {
    const polys = o.filter ? L.polys.filter(p => o.filter(L.iso, p)) : L.polys;
    piece(() => ringsPath(polys, mp), typeof fill === "function" ? fill(L.iso) : fill[L.iso] || KA.land, { rule: "evenodd", lw: o.lw ?? 3.5, rim: o.rim ?? 9, sx: 5, sy: 8, sb: 9 });
  }
}
function mapLabel(str, x, y, size = 64, a = 0.55) { text(str, x, y, { size, color: `rgba(43,35,32,${a})`, ls: size * 0.18 }); }
function houseTop(x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); piece(() => ctx.rect(-14, -11, 28, 22), col, { lw: 2.5, rim: 4, sx: 2, sy: 3, sb: 2 }); line(-14, 0, 14, 0, "rgba(43,35,32,0.6)", 2); ctx.restore(); }
function treeTop(x, y, s, id) { piece(blob(x, y, 12 * s, 12 * s, 8, id, 0.25), (id % 2 ? KA.pine : KA.moss2), { lw: 2, rim: 3, sx: 2, sy: 3, sb: 2 }); }
function desk() {
  ctx.fillStyle = KA.wood; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { const y = i * 230 - 40; ctx.fillStyle = i % 2 ? KA.wood2 : KA.wood; ctx.fillRect(0, y, W, 226);
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
function hand(x, y, a, sleeve, cuff, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  piece(() => { ctx.moveTo(-640, -66); ctx.quadraticCurveTo(-300, -80, -70, -62); ctx.lineTo(-70, 62); ctx.quadraticCurveTo(-300, 80, -640, 66); ctx.closePath(); }, sleeve, { lw: 4.5, rim: 14, sx: 10, sy: 16, sb: 16 });
  ctx.save(); ctx.strokeStyle = "rgba(20,10,5,0.25)"; ctx.lineWidth = 4; for (const k of [-300, -200]) { ctx.beginPath(); ctx.moveTo(k, -60); ctx.quadraticCurveTo(k + 30, 0, k, 60); ctx.stroke(); } ctx.restore();
  piece(() => ctx.roundRect(-84, -72, 70, 144, 14), cuff, { lw: 4, rim: 6 });
  if (o.lace) { ctx.save(); ctx.fillStyle = KA.cream; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-14, -60 + i * 24, 13, 0, 7); ctx.fill(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 2.5; ctx.stroke(); } ctx.restore(); }
  piece(() => { ctx.moveTo(-18, -50); ctx.bezierCurveTo(30, -70, 80, -64, 104, -36); ctx.bezierCurveTo(122, -16, 116, 12, 98, 22); ctx.lineTo(70, 50); ctx.bezierCurveTo(30, 66, -4, 60, -18, 50); ctx.closePath(); }, KA.skin, { lw: 4, rim: 8 });
  piece(() => { ctx.moveTo(10, 36); ctx.quadraticCurveTo(50, 64, 92, 58); ctx.quadraticCurveTo(102, 50, 90, 40); ctx.quadraticCurveTo(54, 40, 26, 22); ctx.closePath(); }, KA.skin2, { lw: 3.5, rim: 4, shadow: false });   // thumb
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
function theodolite(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  for (const a of [-0.32, 0.05, 0.36]) { ctx.save(); ctx.rotate(a); piece(() => ctx.roundRect(-5, -230, 10, 230, 3), KA.wood, { lw: 3, rim: 3 }); ctx.restore(); }
  piece(() => ctx.roundRect(-34, -270, 68, 40, 8), "#9a8a5a", { lw: 3.5, rim: 5 });
  piece(() => ctx.roundRect(-10, -296, 90, 24, 8), "#c9a043", { lw: 3.5, rim: 4 }); piece(() => ctx.arc(80, -284, 13, 0, 7), "#3a3530", { lw: 3, rim: 3, shadow: false });
  ctx.restore();
}
function popLabel(str, x, y, t, a, o = {}) { const k = spring(pp(t, a, 0.6)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); tag(str, 0, 0, Object.assign({ size: 42, bg: KA.mustard }, o)); ctx.restore(); }
function along(R, k) { const L = R.slice(1).map((p, i) => Math.hypot(p[0] - R[i][0], p[1] - R[i][1])), tot = L.reduce((a, b) => a + b, 0); let d = clamp(k) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const u = L[i] ? d / L[i] : 0, a = R[i], b = R[i + 1]; return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), a: Math.atan2(b[1] - a[1], b[0] - a[0]), frac: n => L.slice(0, n).reduce((x, y) => x + y, 0) / tot }; } d -= L[i]; } }
function wagonTop(x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  piece(() => ctx.roundRect(-44, -22, 88, 44, 14), KA.sage, { lw: 3.5, rim: 6, sx: 4, sy: 6 });
  piece(() => ctx.roundRect(-30, -17, 50, 34, 8), "#bfd3cf", { lw: 2.5, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-26, -13, 40, 26, 5), KA.sage2, { lw: 2.5, rim: 3, shadow: false });
  ctx.strokeStyle = KA.ink; ctx.lineWidth = 2.5; for (const yy of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(-22, yy); ctx.lineTo(8, yy); ctx.stroke(); }
  ctx.restore();
}
function odometer(x, y, value, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  piece(() => ctx.roundRect(-190, -90, 380, 180, 30), "#2f2b28", { lw: 4, rim: 10, sx: 8, sy: 12 });
  text("MILES IN CANADA", 0, -48, { size: 28, font: "Elite", color: KA.cream });
  const digits = 3, cw = 72;
  for (let i = 0; i < digits; i++) {
    const place = Math.pow(10, digits - 1 - i), v = value / place, d = Math.floor(v) % 10, f = i === digits - 1 ? v - Math.floor(v) : (v % 1 > 0.92 ? (v % 1 - 0.92) / 0.08 : 0);
    const cx = -cw + i * cw;
    ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 30, -24, 60, 88, 8); ctx.clip();
    ctx.fillStyle = KA.cream; ctx.fillRect(cx - 30, -24, 60, 88);
    for (const [dd, oy] of [[d, -f * 80], [(d + 1) % 10, 80 - f * 80]]) text(String(dd), cx, 46 + oy, { size: 66, color: KA.ink });
    const g = ctx.createLinearGradient(0, -24, 0, 64); g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(0.3, "rgba(0,0,0,0)"); g.addColorStop(0.7, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = g; ctx.fillRect(cx - 30, -24, 60, 88);
    ctx.restore(); ctx.beginPath(); ctx.roundRect(cx - 30, -24, 60, 88, 8); ctx.lineWidth = 3; ctx.strokeStyle = KA.ink; ctx.stroke();
  }
  ctx.restore();
}
function schoolhouse(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  footShadow(0, 4, 220);
  piece(() => ctx.rect(-180, -230, 360, 230), "#b5674a", { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(-205, -226); ctx.lineTo(0, -330); ctx.lineTo(205, -226); ctx.closePath(); }, "#7b3a2a", { lw: 4.5, rim: 8 });
  piece(() => ctx.rect(-40, -400, 80, 90), KA.cream, { lw: 4, rim: 6 }); piece(() => { ctx.moveTo(-54, -398); ctx.lineTo(0, -446); ctx.lineTo(54, -398); ctx.closePath(); }, "#7b3a2a", { lw: 4, rim: 5 });
  piece(() => ctx.arc(0, -356, 18, 0, 7), KA.mustard, { lw: 3, rim: 4, shadow: false });
  for (const wx of [-140, -70, 40, 110]) piece(() => ctx.rect(wx, -190, 46, 60), "#f3dc94", { lw: 3, rim: 3, shadow: false });
  piece(() => ctx.roundRect(-30, -110, 60, 110, [30, 30, 0, 0]), KA.wood2, { lw: 3.5, rim: 4, shadow: false });
  text("SCHOOL", 0, -260, { size: 30, color: KA.cream, ls: 4 });
  ctx.restore();
}
function shopfront(x, gy, w, name, col, o = {}) {
  ctx.save(); ctx.translate(x, gy); boil(o.id || 120, 0.3);
  footShadow(0, 4, w * 0.55);
  piece(() => ctx.rect(-w / 2, -300, w, 300), o.wall || "#efe0c4", { lw: 4.5, rim: 10 });
  piece(() => ctx.rect(-w / 2 - 12, -340, w + 24, 60), col, { lw: 4.5, rim: 6 });
  text(name, 0, -297, { size: name.length > 7 ? 30 : 38, color: KA.cream, ls: 3 });
  // striped awning
  piece(() => { ctx.moveTo(-w / 2 - 6, -276); ctx.lineTo(w / 2 + 6, -276); ctx.lineTo(w / 2 + 18, -220); ctx.lineTo(-w / 2 - 18, -220); ctx.closePath(); }, KA.cream, { lw: 3.5, rim: 4 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(-w / 2 - 6, -276); ctx.lineTo(w / 2 + 6, -276); ctx.lineTo(w / 2 + 18, -220); ctx.lineTo(-w / 2 - 18, -220); ctx.closePath(); ctx.clip(); ctx.fillStyle = col; for (let i = -w; i < w; i += 40) ctx.fillRect(i, -280, 20, 70); ctx.restore();
  const lit = o.lit ?? 1;
  piece(() => ctx.rect(-w / 2 + 22, -200, w - 44 - 56, 120), lit > 0.5 ? "#f6d98a" : "#4d545c", { lw: 3.5, rim: 4, shadow: false });
  if (lit > 0.5) { const g = ctx.createLinearGradient(0, -80, 0, 30); g.addColorStop(0, "rgba(255,236,170,0.4)"); g.addColorStop(1, "rgba(255,236,170,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2 + 22, -80); ctx.lineTo(w / 2 - 78, -80); ctx.lineTo(w / 2 - 50, 20); ctx.lineTo(-w / 2, 20); ctx.closePath(); ctx.fill(); }
  piece(() => ctx.rect(w / 2 - 66, -170, 44, 170), KA.wood2, { lw: 3.5, rim: 4, shadow: false });
  if (o.closed) { const sw = Math.sin((T - o.closed) * 7) * Math.exp(-(T - o.closed) * 2.5) * 0.35; ctx.save(); ctx.translate(-18, -200); ctx.rotate(sw); line(-30, 0, 0, -26, KA.ink, 2.5); line(30, 0, 0, -26, KA.ink, 2.5); piece(() => ctx.rect(-56, 0, 112, 40), KA.cream, { lw: 3, rim: 3 }); text("CLOSED", 0, 30, { size: 26, color: KA.red }); ctx.restore(); }
  ctx.restore();
}
function parcel(x, y, s, id) { ctx.save(); ctx.translate(x, y); ctx.rotate((rnd(id, 7) - 0.5) * 0.16); ctx.scale(s, s); piece(() => ctx.rect(-40, -64, 80, 64), "#c79a5e", { lw: 3.5, rim: 6 }); line(0, -64, 0, 0, "rgba(43,35,32,0.45)", 4); piece(() => ctx.rect(-28, -50, 30, 18), KA.cream, { lw: 2, light: false, shadow: false }); ctx.restore(); }
function carSimple(x, gy, s, dir, col, o = {}) {      // the Canadian visitors' cars: same construction, no driver detail
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s);
  footShadow(0, 2, 150, 0.22);
  const b = o.moving ? Math.sin(T * 17 + x) * 1.5 : 0; ctx.translate(0, -b);
  piece(() => { ctx.moveTo(-150, -40); ctx.quadraticCurveTo(-156, -84, -128, -92); ctx.lineTo(-92, -94); ctx.quadraticCurveTo(-70, -150, -30, -152); ctx.lineTo(40, -152); ctx.quadraticCurveTo(70, -150, 92, -96); ctx.quadraticCurveTo(150, -92, 156, -64); ctx.lineTo(158, -40); ctx.closePath(); }, col, { lw: 4, rim: 9 });
  piece(() => { ctx.moveTo(-70, -98); ctx.quadraticCurveTo(-56, -138, -28, -140); ctx.lineTo(2, -140); ctx.lineTo(2, -98); ctx.closePath(); }, "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  piece(() => { ctx.moveTo(12, -98); ctx.lineTo(12, -140); ctx.lineTo(40, -140); ctx.quadraticCurveTo(62, -136, 76, -98); ctx.closePath(); }, "#bfd3cf", { lw: 3, rim: 3, shadow: false });
  ctx.save(); ctx.translate(-120, -66); ctx.fillStyle = KA.red; mapleLeaf(ctx, 0, 0, 13); ctx.fill(); ctx.restore();
  if (o.box) { piece(() => ctx.rect(-50, -184, 90, 34), "#c79a5e", { lw: 3, rim: 4 }); line(-5, -184, -5, -150, "rgba(43,35,32,0.5)", 3); }
  ctx.restore();
  for (const wx of [-92, 96]) { ctx.save(); ctx.translate(x + wx * s * dir, gy - 28 * s); ctx.scale(s, s); piece(() => ctx.arc(0, 0, 28, 0, 7), "#2f2a25", { lw: 3, rim: 4, shadow: false }); piece(() => ctx.arc(0, 0, 13, 0, 7), "#c9c4b6", { lw: 2.5, rim: 2, shadow: false }); ctx.rotate(o.spin || 0); line(-11, 0, 11, 0, KA.ink, 2.5); ctx.restore(); }
}
function shopper(p, s, bob) {
  ctx.save(); ctx.translate(p.x, p.y + bob); ctx.scale(s, s);
  ctx.fillStyle = "rgba(40,25,12,0.18)"; ctx.beginPath(); ctx.ellipse(0, 3, 16, 5, 0, 0, 7); ctx.fill();
  ctx.lineCap = "round"; ctx.strokeStyle = KA.ink; ctx.lineWidth = 3.4; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 4, -14); ctx.lineTo(k * 6, 2); ctx.stroke(); }
  ctx.lineWidth = 2.6; ctx.strokeStyle = KA.ink;          // the crowd is drawn cheaply: 1,000 figures, no blur
  ctx.beginPath(); ctx.roundRect(-10, -42, 20, 30, 8); ctx.fillStyle = p.col; ctx.fill(); ctx.fillStyle = "rgba(255,250,235,0.22)"; ctx.fillRect(-7, -40, 6, 24); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -50, 8.5, 0, 7); ctx.fillStyle = p.skin; ctx.fill(); ctx.stroke();
  if (p.hat) { ctx.beginPath(); ctx.arc(0, -53, 9, Math.PI, 0); ctx.closePath(); ctx.fillStyle = KA.mustard; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function receipt(x, y, n, k, sub) {
  if (k <= 0) return; const h = 260;
  ctx.save(); ctx.translate(x, y - (1 - k) * 200); ctx.rotate(-0.04);
  piece(() => { ctx.moveTo(-130, -h / 2); for (let i = 0; i <= 13; i++) ctx.lineTo(-130 + i * 20, -h / 2 + (i % 2 ? 10 : 0)); ctx.lineTo(130, h / 2); for (let i = 13; i >= 0; i--) ctx.lineTo(-130 + i * 20, h / 2 + (i % 2 ? 10 : 0)); ctx.closePath(); }, "#fbf6ea", { lw: 3, rim: 5, sx: 8, sy: 12 });
  text("PT. ROBERTS MARKET", 0, -h / 2 + 50, { size: 24, font: "Elite" }); rule(-100, 100, -h / 2 + 64);
  text("SHOPPERS / DAY", 0, -h / 2 + 100, { size: 22, font: "Elite" });
  text(fmt(n), 0, 50, { size: 84, color: KA.ink });
  text(sub, 0, 100, { size: 22, font: "Elite", color: "#6b5a48" });
  ctx.restore();
}
function station(x, gy, s, id) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); boil(id, 0.3);
  footShadow(0, 4, 170, 0.2);
  for (const px of [-130, 120]) piece(() => ctx.roundRect(px - 8, -300, 16, 300, 4), "#d8d1c2", { lw: 3.5, rim: 4 });
  piece(() => { ctx.moveTo(-170, -330); ctx.lineTo(170, -330); ctx.lineTo(180, -290); ctx.lineTo(-180, -290); ctx.closePath(); }, KA.cream, { lw: 4, rim: 6 });
  piece(() => ctx.rect(-176, -302, 352, 12), KA.red, { lw: 0, light: false, shadow: false });
  text("GAS", 0, -300, { size: 30, color: KA.ink, ls: 4 });
  for (const px of [-60, 40]) { piece(() => ctx.roundRect(px - 4, -160, 54, 160, [10, 10, 2, 2]), KA.red, { lw: 3.5, rim: 5 }); piece(() => ctx.roundRect(px + 6, -140, 34, 30, 4), "#bfd3cf", { lw: 2.5, rim: 3, shadow: false }); stroke2(() => { ctx.moveTo(px + 50, -100); ctx.quadraticCurveTo(px + 70, -60, px + 56, -30); }, "#3a3530", 4, 8); }
  ctx.restore();
}
function crate(x, y, s, k, txt) { if (k <= 0) return; ctx.save(); ctx.translate(x, y - (1 - eout(k)) * 700); ctx.rotate((1 - k) * 0.4); ctx.scale(s, s); footShadow(0, 2, 110, 0.25 * k); piece(() => ctx.rect(-100, -120, 200, 120), KA.wood, { lw: 4, rim: 8 }); for (const yy of [-80, -40]) line(-100, yy, 100, yy, KA.wood2, 4); text(txt, 0, -44, { size: 38, color: KA.ink }); ctx.restore(); }

// ---------- history cast (period figures, animals, ships) ----------
// a pig: feet at origin, facing +x, ~150 tall at s=1. o: x, gy, s, dir, chew (0..1 rooting), dead (0..1 flips over), look
function pig(o) {
  const s = o.s || 1, dead = o.dead || 0;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 41, 0.5 / s);
  footShadow(0, 2, 90);
  ctx.translate(0, -64 * dead); ctx.rotate(Math.PI * eio(dead)); ctx.translate(0, 64 * dead);
  const bob = (o.chew || 0) * Math.abs(Math.sin(T * 9)) * 6;
  for (const lx of [-50, -26, 30, 54]) piece(() => ctx.roundRect(lx - 9, -50, 18, 50, 6), "#e8a0a0", { lw: 3, rim: 3, shadow: false });
  piece(() => { ctx.ellipse(0, -84, 92, 54, 0, 0, 7); }, "#f0b3b0", { lw: 4.5, rim: 10 });
  piece(() => { ctx.moveTo(-90, -96); ctx.bezierCurveTo(-120, -110, -112, -78, -100, -88); }, "#f0b3b0", { lw: 3.5, light: false, shadow: false });   // tail curl
  ctx.save(); ctx.translate(76, -96 + bob); ctx.rotate(0.25 * (o.chew || 0));
  piece(() => ctx.ellipse(0, 0, 46, 40, 0, 0, 7), "#f0b3b0", { lw: 4, rim: 7 });
  piece(() => { ctx.moveTo(-14, -34); ctx.lineTo(-2, -66); ctx.lineTo(14, -32); ctx.closePath(); }, "#e8a0a0", { lw: 3, rim: 3, shadow: false });
  piece(() => ctx.ellipse(40, 8, 18, 15, 0, 0, 7), "#e48f8c", { lw: 3.5, rim: 3, shadow: false });
  ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.ellipse(36, 6, 3, 5, 0, 0, 7); ctx.ellipse(46, 6, 3, 5, 0, 0, 7); ctx.fill();
  if (dead > 0.5) { line(8, -16, 20, -4, KA.ink, 4); line(20, -16, 8, -4, KA.ink, 4); }
  else { ctx.beginPath(); ctx.arc(14 + (o.look || 0) * 3, -10, 5, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.restore();
}
// a period soldier or official, feet at origin, ~320 tall, facing +x.
// o: side ("US" blue kepi | "UK" redcoat shako | "navy" bicorne admiral | "pickel" spiked helmet), musket, walk, salute, brow, mustache
function trooper(o) {
  const s = o.s || 1, ph = o.walk, side = o.side || "US";
  const coat = o.coat || { US: "#2f3f6e", UK: "#b8322a", navy: "#1f2a44", pickel: "#2f3a46", RU: "#3f5240", sailor: "#eeeae0" }[side];
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); boil(o.id || 7, 0.6 / s);
  const sw = ph == null ? 0 : Math.sin(ph); footShadow(0, 2, 62);
  ctx.translate(0, ph == null ? 0 : -Math.abs(Math.cos(ph)) * 6);
  for (const k of [1, -1]) { ctx.save(); ctx.translate(k * 9, -120); ctx.rotate(sw * 0.42 * k); piece(() => ctx.roundRect(-11, 0, 22, 112, 6), side === "UK" || side === "sailor" ? "#2b2724" : tone(coat, -0.15), { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.roundRect(-13, 104, 36, 16, 6), KA.ink, { lw: 3, light: false, shadow: false }); ctx.restore(); }
  piece(() => { ctx.moveTo(-38, -240); ctx.quadraticCurveTo(-46, -170, -42, -108); ctx.lineTo(42, -108); ctx.quadraticCurveTo(46, -170, 38, -240); ctx.quadraticCurveTo(0, -252, -38, -240); ctx.closePath(); }, coat, { lw: 4.5, rim: 9 });
  if (side === "UK") { line(-38, -240, 36, -120, KA.cream, 7); line(38, -240, -36, -120, KA.cream, 7); }        // crossbelts
  else { ctx.fillStyle = "#e3c36e"; for (const by of [-220, -196, -172, -148]) { ctx.beginPath(); ctx.arc(8, by, 4, 0, 7); ctx.fill(); } }
  if (side === "navy") { for (const k of [-1, 1]) piece(() => ctx.ellipse(k * 34, -236, 18, 8, 0, 0, 7), "#e3c36e", { lw: 2.5, rim: 2, shadow: false }); }
  piece(() => ctx.rect(-42, -130, 84, 12), side === "UK" ? KA.cream : "#2b2724", { lw: 2.5, light: false, shadow: false });
  // arms: one swings or salutes, the other carries the musket
  const armR = o.salute ? -2.4 : sw * 0.5;
  stroke2(() => { ctx.moveTo(26, -226); ctx.lineTo(26 + Math.sin(armR) * 56, -226 + Math.cos(armR) * 56); }, coat, 20, 28);
  if (o.musket) { ctx.save(); ctx.translate(-30, -150); ctx.rotate(-0.12); piece(() => ctx.roundRect(-5, -150, 10, 210, 3), KA.wood, { lw: 3, rim: 3 }); piece(() => ctx.roundRect(-3, -190, 6, 44, 2), "#9a9a92", { lw: 2.5, rim: 2, shadow: false }); ctx.restore(); }
  stroke2(() => { ctx.moveTo(-26, -226); ctx.lineTo(-30, -160); }, tone(coat, -0.15), 20, 28);
  // head
  ctx.save(); ctx.translate(4, -276);
  piece(() => ctx.ellipse(0, 0, 32, 36, 0, 0, 7), o.skin || KA.skin, { lw: 4, rim: 6 });
  ctx.fillStyle = KA.ink; ctx.beginPath(); ctx.arc(16 + (o.look || 0) * 3, -6, 4, 0, 7); ctx.fill();
  line(6, -20 + (o.brow || 0) * 3, 26, -22 - (o.brow || 0) * 3, KA.ink, 4);
  if (o.mustache) piece(() => { ctx.moveTo(4, 14); ctx.quadraticCurveTo(22, 4, 44, 16); ctx.quadraticCurveTo(22, 12, 4, 14); }, o.mustache, { lw: 2.5, rim: 2, shadow: false });
  else { ctx.beginPath(); ctx.arc(18, 18, 7, 0.3, 2.5); ctx.strokeStyle = KA.ink; ctx.lineWidth = 3; ctx.stroke(); }
  if (o.whiskers) piece(() => { ctx.moveTo(-30, -6); ctx.quadraticCurveTo(-34, 34, -8, 30); ctx.lineTo(-14, 6); ctx.closePath(); }, o.whiskers, { lw: 2.5, rim: 3, shadow: false });
  if (side === "sailor") { piece(() => { ctx.moveTo(-26, 40); ctx.lineTo(0, 74); ctx.lineTo(26, 40); ctx.closePath(); }, "#26324f", { lw: 2.5, rim: 2, shadow: false }); }
  if (side === "US") { piece(() => { ctx.moveTo(-30, -24); ctx.lineTo(-22, -64); ctx.lineTo(24, -60); ctx.lineTo(30, -24); ctx.closePath(); }, o.cap || "#26324f", { lw: 3.5, rim: 4, shadow: false }); piece(() => { ctx.moveTo(14, -26); ctx.quadraticCurveTo(40, -26, 46, -16); ctx.lineTo(14, -18); ctx.closePath(); }, KA.ink, { lw: 2.5, light: false, shadow: false }); }
  else if (side === "UK") { piece(() => ctx.roundRect(-28, -78, 56, 54, 4), "#1e1c1a", { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.rect(-28, -34, 56, 8), "#e3c36e", { lw: 0, light: false, shadow: false }); piece(() => ctx.ellipse(0, -84, 8, 12, 0, 0, 7), KA.cream, { lw: 2.5, rim: 2, shadow: false }); }
  else if (side === "navy") { piece(() => { ctx.moveTo(-64, -22); ctx.quadraticCurveTo(0, -84, 64, -22); ctx.quadraticCurveTo(0, -40, -64, -22); ctx.closePath(); }, "#1e1c1a", { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.arc(0, -44, 7, 0, 7), "#e3c36e", { lw: 2, rim: 2, shadow: false }); }
  else if (side === "RU") { piece(() => ctx.roundRect(-34, -44, 68, 24, 8), o.cap || "#3f5240", { lw: 3.5, rim: 4, shadow: false }); piece(() => ctx.rect(-34, -30, 68, 8), "#b8322a", { lw: 0, light: false, shadow: false }); piece(() => { ctx.moveTo(10, -22); ctx.quadraticCurveTo(38, -22, 44, -14); ctx.lineTo(10, -16); ctx.closePath(); }, KA.ink, { lw: 2.5, light: false, shadow: false }); }
  else if (side === "sailor") { piece(() => ctx.ellipse(0, -30, 38, 12, 0, 0, 7), o.cap || "#f4f1ea", { lw: 3, rim: 3, shadow: false }); piece(() => ctx.rect(-30, -30, 60, 8), "#26324f", { lw: 0, light: false, shadow: false }); }
  else if (side === "pickel") { piece(() => { ctx.moveTo(-32, -18); ctx.bezierCurveTo(-32, -66, 32, -66, 32, -18); ctx.closePath(); }, "#1e1c1a", { lw: 3.5, rim: 5, shadow: false }); piece(() => { ctx.moveTo(-6, -58); ctx.lineTo(0, -92); ctx.lineTo(6, -58); ctx.closePath(); }, "#c9a043", { lw: 2.5, rim: 2, shadow: false }); piece(() => ctx.arc(0, -40, 8, 0, 7), "#c9a043", { lw: 2, rim: 2, shadow: false }); }
  ctx.restore();
  ctx.restore();
}
// a steam frigate under sail, waterline at origin, facing +x, ~620 long at s=1. o: x, gy, s, dir, flag (flagart code), smoke, rock
function warship(o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.gy); ctx.scale(s * (o.dir || 1), s); ctx.rotate(Math.sin(T * 1.3 + (o.id || 0)) * 0.015 * (o.rock ?? 1)); boil(o.id || 51, 0.4 / s);
  piece(() => { ctx.moveTo(-320, -60); ctx.lineTo(300, -60); ctx.quadraticCurveTo(330, -40, 300, 20); ctx.lineTo(-290, 20); ctx.quadraticCurveTo(-320, -10, -320, -60); ctx.closePath(); }, "#2b2724", { lw: 4.5, rim: 8 });
  piece(() => ctx.rect(-300, -40, 590, 16), KA.cream, { lw: 2.5, light: false, shadow: false });
  ctx.fillStyle = "#1a1714"; for (let i = 0; i < 12; i++) ctx.fillRect(-270 + i * 46, -36, 18, 9);       // gun ports
  for (const [mx, mh] of [[-170, 330], [20, 380], [190, 300]]) {
    piece(() => ctx.roundRect(mx - 6, -60 - mh, 12, mh, 3), KA.wood2, { lw: 3, rim: 3 });
    for (let k = 0; k < 3; k++) { const y = -60 - mh + 30 + k * mh * 0.28, w = 120 - k * 18; piece(() => { ctx.moveTo(mx - w / 2, y); ctx.quadraticCurveTo(mx, y - 12, mx + w / 2, y); ctx.lineTo(mx + w / 2 - 6, y + mh * 0.22); ctx.quadraticCurveTo(mx, y + mh * 0.22 + 14 + Math.sin(T * 2 + k) * 3, mx - w / 2 + 6, y + mh * 0.22); ctx.closePath(); }, "#f2e8d2", { lw: 3, rim: 5 }); }
  }
  piece(() => ctx.roundRect(90, -150, 34, 92, 4), "#3a3330", { lw: 3, rim: 4 });         // funnel
  if (o.smoke !== false) for (let i = 0; i < 5; i++) { const a = (T * 0.5 + i / 5) % 1; ctx.save(); ctx.globalAlpha = (1 - a) * 0.6; piece(blob(107 - a * 180, -170 - a * 160, 22 + a * 50, 18 + a * 36, 10, i, 0.2), "#cfc6b8", { lw: 2.5, rim: 3, shadow: false }); ctx.restore(); }
  if (o.flag && typeof flagArt === "function") { ctx.save(); ctx.translate(-300, -150); flagArt(o.flag, 0, 0, 90, null, { lw: 2 }); ctx.restore(); line(-300, -150, -300, -60, KA.ink, 3); }
  ctx.restore();
}
function seaBand(y0, y1, scroll = 0, col = KA.sea) {
  piece(() => ctx.rect(-20, y0, W + 40, y1 - y0), col, { lw: 3.5, rim: 8, shadow: false });
  ctx.save(); ctx.strokeStyle = "rgba(255,250,235,0.5)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (let r = 0; r < 6; r++) for (let i = 0; i < 10; i++) { const x = ((i * 130 + r * 70 + T * 25 - scroll * 0.3) % (W + 160) + W + 160) % (W + 160) - 80, y = y0 + 20 + r * (y1 - y0 - 30) / 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 16, y - 7, x + 32, y); ctx.stroke(); }
  ctx.restore();
}
// a quote card: the words in serif, the attribution in typewriter
function quoteCard(x, y, w, quote, who, t, t0, o = {}) {
  const k = spring(pp(t, t0, 0.6)); if (k <= 0) return;
  const lines = wrap(quote, w - 90, o.size || 46, "Serif"), h = lines.length * (o.size || 46) * 1.2 + 130;
  card(x, y, w, h, o.rot ?? -0.02, k, (cw, ch) => {
    text("“", -cw / 2 + 50, -ch / 2 + 96, { size: 120, font: "Serif", color: KA.red });
    lines.forEach((l, i) => { const kk = clamp((t - t0 - 0.2 - i * 0.25) / 0.3); ctx.save(); ctx.globalAlpha = kk; text(l, 0, -ch / 2 + 70 + (i + 0.7) * (o.size || 46) * 1.2, { size: o.size || 46, font: "Serif" }); ctx.restore(); });
    text("— " + who, cw / 2 - 40, ch / 2 - 30, { size: 26, font: "Elite", align: "right", color: "#6b5a48" });
  });
}
function brandTag(name = "BORDER QUIRKS") { ctx.save(); ctx.translate(40, 248); const w = measure(name, 26, "Elite") + 40; piece(() => ctx.rect(0, -22, w, 44), KA.ink, { lw: 0, light: false, sx: 3, sy: 4 }); text(name, w / 2, 10, { size: 26, font: "Elite", color: KA.cream, ls: 2 }); ctx.restore(); }

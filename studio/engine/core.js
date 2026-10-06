// Studio engine core: renders an episode's storyboard.json as frames. Every frame is a pure function of t.
// No Math.random, no clock: variation comes from rnd(), a seeded integer hash.
// Inputs (injected by render.mjs as window.EP): format, look (bible), storyboard, timeline, script, geo.
"use strict";

const EP = window.EP;
const W = EP.format.width, H = EP.format.height, FPS = EP.format.fps;
const cv = document.getElementById("c");
cv.width = W; cv.height = H;
const ctx = cv.getContext("2d");
const WARN = new Set();
const warn = m => WARN.add(m);

// ---------- palette: the bible's palette, with defaults for anything it doesn't name ----------
const P = Object.assign({
  ink: "#2b2320", paper: "#efe4cc", card: "#f8f1e2", sea: "#a9c7c2", land: "#ecd9ae", red: "#c8452d",
  orange: "#e08a3c", yellow: "#f2c14e", green: "#6d9a5b", navy: "#2f4858", cream: "#f3ead7",
  steel: "#45443e", steel2: "#5b5a52", olive: "#6b6f45", olive2: "#565a36", khaki: "#a38d5a", khaki2: "#8a774b",
  skin: "#e6c09a", brown: "#7b5a3a", white: "#fff8ea",
}, EP.look.palette || {});
const col = k => (k && P[k]) || (typeof k === "string" && k.startsWith("#") ? k : P.red);

// ---------- deterministic helpers ----------
function hash(n) {
  n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296;
}
const rnd = (a, b = 0, c = 0) => hash((Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791)) | 0);
const strSeed = s => { let h = 7; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const pop = (t, t0, d = 0.35) => back(prog(t, t0, t0 + d));
const fmt = n => Math.round(n).toLocaleString("en-US");
let T = 0;

// ---------- cues: the same grammar the storyboard gate resolves ----------
const TL = EP.timeline;
const NRM = w => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const CUE_RE = /^([a-z0-9_]+)(?:\.(start|end)|\/([a-z0-9']+)(?:#(\d+))?)?([+-]\d+(?:\.\d+)?)?$/;
function cue(c) {
  if (c === "0" || c === 0) return 0;
  const m = CUE_RE.exec(c);
  if (!m) throw new Error("bad cue " + c);
  const [, pid, edge, word, nth, off] = m;
  const p = TL.paras.find(p => p.id === pid);
  if (!p) throw new Error("cue " + c + ": no paragraph " + pid);
  let t;
  if (word) {
    const hits = p.words.filter(w => NRM(w.w) === word);
    const n = +(nth || 0);
    if (hits.length <= n) throw new Error(`cue ${c}: '${word}' not spoken in ${pid}`);
    t = hits[n].t;
  } else t = edge === "end" ? p.end : p.start;
  return t + parseFloat(off || 0);
}

// ---------- drawing primitives (paper-cutout) ----------
function boil(id, amt = 1) {
  const f = Math.floor(T * 12);
  ctx.translate((rnd(id, f, 1) - 0.5) * 2.0 * amt, (rnd(id, f, 2) - 0.5) * 2.0 * amt);
  ctx.rotate((rnd(id, f, 3) - 0.5) * 0.008 * amt);
}
function cut(path, fill, o = {}) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) {
    ctx.shadowColor = o.sc || "rgba(45,28,16,0.33)";
    ctx.shadowOffsetX = o.sx ?? 5; ctx.shadowOffsetY = o.sy ?? 7; ctx.shadowBlur = o.sb ?? 6;
  }
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill(o.rule || "nonzero");
  ctx.restore();
  if (o.lw !== 0) {
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.beginPath(); path();
    ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.ink || P.ink; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
    ctx.restore();
  }
}
function smooth(pts) {
  const n = pts.length;
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath();
}
function stroke2(path, color, w, inkW) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); path(); ctx.strokeStyle = P.ink; ctx.lineWidth = inkW ?? w + 7; ctx.stroke();
  ctx.beginPath(); path(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function line(x1, y1, x2, y2, c = P.ink, w = 4, dash) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
const FONTS = { Anton: "Anton", Elite: "Elite", Serif: "Serif" };
function measure(str, size, font = "Anton") { ctx.save(); ctx.font = `${size}px ${font}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }
function wrap(str, maxW, size, font = "Anton") {
  const words = String(str).split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) { const test = cur ? cur + " " + w : w; if (measure(test, size, font) > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur);
  return lines;
}
// largest size <= size0 whose wrapped text fits maxW and maxLines
function fit(str, maxW, size0, maxLines, font = "Anton", what = "text") {
  let size = size0;
  while (size > 24) {
    const ls = wrap(str, maxW, size, font);
    if (ls.length <= maxLines && ls.every(l => measure(l, size, font) <= maxW)) return { size, lines: ls };
    size -= 4;
  }
  warn(`${what}: "${str}" does not fit even at 24px`);
  return { size, lines: wrap(str, maxW, size, font) };
}
function text(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.size || 60}px ${o.font || "Anton"}`;
  ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "alphabetic";
  if (o.ls) ctx.letterSpacing = o.ls + "px";
  if (o.shadow) { ctx.shadowColor = "rgba(45,28,16,0.4)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.shadowBlur = 4; }
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || P.ink; ctx.strokeText(str, x, y); ctx.shadowColor = "transparent"; }
  ctx.fillStyle = o.color || P.ink; ctx.fillText(str, x, y);
  ctx.restore();
}
// typewriter tag; returns its width. Keeps itself inside the frame.
function tag(str, x, y, o = {}) {
  const size = o.size || 38;
  ctx.save(); ctx.font = `${size}px Elite`;
  let w = ctx.measureText(str).width + 36;
  const h = size * 1.45;
  if (w > W - 60) { warn(`tag "${str}" wider than the frame`); }
  let ax = o.align === "left" ? x : x - w / 2;
  const m = ctx.getTransform(), sx = Math.hypot(m.a, m.b) || 1;   // keep the tag on screen, measured in screen space
  const scr = m.a * ax + m.c * y + m.e, lo = 30, hi = W - 30 - w * sx;
  if (scr < lo) ax += (lo - scr) / sx; else if (scr > hi) ax -= (scr - hi) / sx;
  ctx.translate(ax, y); ctx.rotate(o.rot ?? (rnd(strSeed(str), 3) - 0.5) * 0.04);
  if (o.k != null) { const s = o.k; ctx.translate(w / 2, 0); ctx.scale(s, s); ctx.translate(-w / 2, 0); }
  cut(() => ctx.rect(0, -h / 2, w, h), o.bg || P.card, { lw: 3 });
  ctx.fillStyle = o.color || P.ink; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(str, 18, 2);
  ctx.restore();
  return w;
}
const STAMPS = {};
function stampImage(str, size, color) {  // offscreen, so the worn-ink knockouts only cut the stamp
  const key = str + size + color;
  if (STAMPS[key]) return STAMPS[key];
  const c = document.createElement("canvas"), g = c.getContext("2d");
  g.font = `${size}px Anton`; g.letterSpacing = "6px";
  const w = g.measureText(str).width + 50, h = size * 1.15;
  c.width = Math.ceil(w + 20); c.height = Math.ceil(h + 20);
  g.translate(c.width / 2, c.height / 2);
  g.font = `${size}px Anton`; g.letterSpacing = "6px";
  g.strokeStyle = color; g.lineWidth = 10; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(str, 0, 6);
  g.globalCompositeOperation = "destination-out";
  const sd = strSeed(str);
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.5 + rnd(i, 10, sd) * 0.5;
    g.beginPath(); g.arc((rnd(i, 7, sd) - 0.5) * w, (rnd(i, 8, sd) - 0.5) * h, 1.5 + rnd(i, 9, sd) * 4, 0, 7); g.fill();
  }
  return (STAMPS[key] = c);
}
function stamp(str, x, y, since, o = {}) {  // slams in; since = seconds since the hit
  if (since <= 0) return;
  let size = o.size || 150;
  while (measure(str, size) + 80 > (o.maxW || W - 120) && size > 40) size -= 6;
  const img = stampImage(str, size, o.color || P.red);
  const s = 1 + 0.9 * (1 - eout(clamp(since * 5)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.1); ctx.scale(s, s);
  ctx.globalAlpha = clamp(since * 8) * 0.92;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}
function arrow(x1, y1, x2, y2, k = 1, c = P.ink, w = 6) {
  if (k <= 0) return;
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1);
  stroke2(() => { ctx.moveTo(x1, y1); ctx.lineTo(x, y); }, c, w, w + 6);
  if (k > 0.9) cut(() => { ctx.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); ctx.lineTo(x + Math.cos(a + 2.4) * 22, y + Math.sin(a + 2.4) * 22); ctx.lineTo(x + Math.cos(a - 2.4) * 22, y + Math.sin(a - 2.4) * 22); ctx.closePath(); }, c, { lw: 3, shadow: false });
}
function star(cx, cy, r, fill) {
  cut(() => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); }, fill, { lw: 4, shadow: false });
}
function popIn(x, y, k, draw, rot = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(rot * (1 - Math.min(1, k))); draw(); ctx.restore();
}
function withAlpha(a, draw) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; draw(); ctx.restore(); }

// ---------- backgrounds ----------
function paperBG(c = P.paper) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
function graphPaper(c = P.cream || P.card) {
  paperBG(c);
  ctx.strokeStyle = "rgba(90,120,130,0.15)"; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
}

// ---------- layout: where scenes may draw (captions and platform UI own the rest) ----------
const SAFE = Object.assign({ top: 220, bottom: 420, right: 140 }, (EP.look.captions || {}).safe_zone || {});
const CAP_Y = H - SAFE.bottom - 150;                 // caption block centre
const STAGE = { x: 40, y: SAFE.top, w: W - 80, h: CAP_Y - 130 - SAFE.top };  // scene content box
const STAGE_CX = W / 2, STAGE_CY = STAGE.y + STAGE.h / 2;

// ---------- scenes: resolve the storyboard against the voice timeline ----------
const SCENE_FNS = {};   // filled by scenes/*.js: SCENE_FNS[type] = (t, S) => draws a full frame
const VERBS = ["reveal", "draw", "count_start", "count_stop", "highlight", "verdict", "emphasize"];
const SC = EP.storyboard.scenes.map((s, i) => ({ id: s.id, type: s.type, p: s.params || {}, idx: i, raw: s }));
SC.forEach((S, i) => {
  S.t0 = i === 0 ? 0 : cue(S.raw.start);
  S.ev = (S.raw.events || []).map(e => ({ t: cue(e.at), do: e.do, args: e.args || {}, sfx: e.sfx }));
  S.ev.forEach(e => { if (!VERBS.some(v => e.do.includes(v.split("_")[0]))) warn(`scene ${S.id}: event verb '${e.do}' is not one the engine knows (${VERBS.join(", ")}); drawn as 'emphasize'`); });
});
SC.forEach((S, i) => { S.t1 = S.raw.end ? cue(S.raw.end) : (i + 1 < SC.length ? SC[i + 1].t0 : TL.duration); S.prev = SC[i - 1] || null; S.next = SC[i + 1] || null; });
const evT = (S, verb, fallback) => { const e = S.ev.find(e => e.do.includes(verb)); return e ? e.t : fallback; };
const emph = (t, S) => S.ev.reduce((a, e) => a + Math.max(0, 1 - Math.abs(t - e.t - 0.08) / 0.22), 0); // 0..1 pulse near any event
function drawScene(S, t) {
  const fn = SCENE_FNS[S.type];
  if (!fn) { warn(`no renderer for scene type '${S.type}'`); paperBG(); text(S.type.toUpperCase(), W / 2, H / 2, { size: 70 }); return; }
  ctx.save(); fn(t, S); ctx.restore();
}

// ---------- captions from the script's caption chunks, timed by the spoken words ----------
const CAPS = [];
(EP.script.paras || []).forEach(p => {
  const tp = TL.paras.find(q => q.id === p.id);
  if (!tp || !p.caps) return;
  let wi = 0;
  p.caps.forEach(([txt, n], ci) => {
    const w0 = tp.words[wi];
    wi += n;
    const nextW = tp.words[wi];
    CAPS.push({ text: txt, start: w0 ? w0.t : tp.start, end: nextW ? nextW.t : tp.end + 0.12 });
  });
});
function captions(t) {
  if (!(EP.look.captions || {}).burned) return;
  const c = CAPS.find(c => t >= c.start - 0.03 && t < c.end + 0.02);
  if (!c) return;
  const k = prog(t, c.start - 0.03, c.start + 0.12);
  const s = lerp(0.8, 1, back(k));
  ctx.save(); ctx.translate((W - SAFE.right) / 2 + 30, CAP_Y); ctx.scale(s, s); ctx.rotate((rnd(c.start * 100 | 0, 3) - 0.5) * 0.03);
  const f = fit(c.text, W - SAFE.right - 120, 96, 2, "Anton", "caption");
  ctx.font = `${f.size}px Anton`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
  f.lines.forEach((ln, i) => {
    const y = (i - (f.lines.length - 1) / 2) * f.size * 1.1 + f.size * 0.35;
    const parts = ln.split(" "), total = ctx.measureText(ln).width, sp = ctx.measureText(" ").width;
    let x = -total / 2;
    for (const w of parts) {
      const ww = ctx.measureText(w).width;
      ctx.lineWidth = 16; ctx.strokeStyle = P.ink;
      ctx.shadowColor = "rgba(20,10,5,0.45)"; ctx.shadowOffsetY = 6; ctx.shadowBlur = 6;
      ctx.strokeText(w, x + ww / 2, y);
      ctx.shadowColor = "transparent";
      ctx.fillStyle = /\d/.test(w) ? P.yellow : P.white;
      ctx.fillText(w, x + ww / 2, y);
      x += ww + sp;
    }
  });
  ctx.restore();
}

// ---------- paper texture + grain (built once, deterministic) ----------
let PAPER = null; const GRAIN = [];
function buildTextures() {
  PAPER = document.createElement("canvas"); PAPER.width = W; PAPER.height = H;
  const p = PAPER.getContext("2d"), img = p.createImageData(W, H), d = img.data;
  const vn = (x, y, sc, seed) => {
    const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(rnd(x0, y0, seed), rnd(x0 + 1, y0, seed), sx), lerp(rnd(x0, y0 + 1, seed), rnd(x0 + 1, y0 + 1, seed), sx), sy);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = 1 - 0.07 * vn(x, y, 140, 1) - 0.05 * vn(x, y, 22, 2) - 0.035 * rnd(x, y, 3);
    const i = (y * W + x) * 4; d[i] = 255 * v; d[i + 1] = 252 * v; d[i + 2] = 244 * v; d[i + 3] = 255;
  }
  p.putImageData(img, 0, 0);
  p.lineCap = "round";
  for (let i = 0; i < 1400; i++) {
    const x = rnd(i, 1, 9) * W, y = rnd(i, 2, 9) * H, a = rnd(i, 3, 9) * 6.28, l = 6 + rnd(i, 4, 9) * 22;
    p.strokeStyle = `rgba(120,95,70,${0.05 + rnd(i, 5, 9) * 0.07})`; p.lineWidth = 1 + rnd(i, 6, 9);
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  const g = p.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(60,35,15,0.30)");
  p.fillStyle = g; p.fillRect(0, 0, W, H);
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const gc = c.getContext("2d"), gi = gc.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = rnd(i, k, 77) * 255; gi.data[i * 4] = gi.data[i * 4 + 1] = gi.data[i * 4 + 2] = v; gi.data[i * 4 + 3] = 255; }
    gc.putImageData(gi, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
}

// ---------- transitions ----------
const FLAT = ["flat-cast", "data-flags"].includes(EP.look.theme);   // flat themes: hard cuts, no paper texture or film grain
const TR = 0.3;
function tornEdge(x) {
  ctx.moveTo(x, -10);
  for (let y = 0; y <= H + 40; y += 40) ctx.lineTo(x + (rnd(y, 17) - 0.5) * 30, y);
  ctx.lineTo(W + 100, H + 40); ctx.lineTo(W + 100, -10); ctx.closePath();
}
// a cut (no torn-paper wipe) when the next scene continues the same picture
function continuous(S) {
  if (!S.prev || FLAT) return true;
  if (S.p.cut) return true;                                          // custom scenes that continue the previous camera
  if (S.type === "stamp_reveal") return true;                        // stamps land on the previous picture
  const same = a => JSON.stringify(a.p.region || null);
  return S.type.startsWith("map_") && S.prev.type.startsWith("map_") && same(S) === same(S.prev);
}

// ---------- main ----------
function sceneAt(t) { let i = 0; while (i + 1 < SC.length && t >= SC[i + 1].t0) i++; return SC[i]; }
function render(t) {
  T = t;
  if (!PAPER && !FLAT) buildTextures();
  const S = sceneAt(t);
  const k = continuous(S) ? 1 : prog(t, S.t0, S.t0 + TR);
  if (k < 1) {
    ctx.save(); ctx.translate(-eio(k) * 160, 0); drawScene(S.prev, t); ctx.restore();
    const edge = lerp(W + 40, -60, eio(k));
    ctx.save(); ctx.beginPath(); tornEdge(edge); ctx.clip(); drawScene(S, t); ctx.restore();
    ctx.save(); ctx.beginPath(); tornEdge(edge);
    ctx.shadowColor = "rgba(30,15,5,0.5)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = -8;
    ctx.strokeStyle = "#fbf5e8"; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  } else drawScene(S, t);
  if (!FLAT) { ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(PAPER, 0, 0); ctx.restore(); }
  captions(t);
  if (FLAT) return;
  const f = Math.floor(t * 12);
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.09;
  ctx.translate(-rnd(f, 1) * 256, -rnd(f, 2) * 256);
  ctx.fillStyle = GRAIN[f % GRAIN.length]; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
}

// ---------- outputs for the driver ----------
function sfxCues() {
  const cues = [];
  SC.forEach(S => {
    if (S.prev && !continuous(S)) cues.push({ t: +S.t0.toFixed(3), type: "whoosh" });
    S.ev.forEach(e => { if (e.sfx) cues.push({ t: +e.t.toFixed(3), type: e.sfx }); });
    (S.cues || []).forEach(c => cues.push(c));
  });
  return cues.sort((a, b) => a.t - b.t);
}
// the moment a scene's picture has settled: after its last event, before it ends
function nestedAt(o, out = []) {
  if (Array.isArray(o)) o.forEach(v => nestedAt(v, out));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "at" && typeof v === "string") { try { out.push(cue(v)); } catch (e) {} } else nestedAt(v, out); }
  return out;
}
const landed = S => clamp(Math.max(S.t0 + 0.9, ...S.ev.map(e => e.t + 0.5), ...nestedAt(S.p).map(x => x + 0.6), ...(S.landAt ? [S.landAt] : [])), S.t0 + 0.3, S.t1 - 0.05);
function sheetTimes() { return [0.05, ...SC.flatMap(S => [landed(S), ...(S.sheetAt || [])]).sort((a, b) => a - b), TL.duration - 0.05]; }   // S.sheetAt: extra review stills mid-scene (ranking_race)
function contact(times, cols = 5, scale = 0.24) {
  const cw = Math.round(W * scale), ch = Math.round(H * scale), rows = Math.ceil(times.length / cols);
  const g = document.createElement("canvas"); g.width = cols * cw + (cols + 1) * 12; g.height = rows * (ch + 44) + 12;
  const gc = g.getContext("2d"); gc.fillStyle = "#1b1b1b"; gc.fillRect(0, 0, g.width, g.height);
  times.forEach((t, i) => {
    render(t);
    const x = 12 + (i % cols) * (cw + 12), y = 12 + Math.floor(i / cols) * (ch + 44);
    gc.drawImage(cv, x, y, cw, ch);
    gc.fillStyle = "#eee"; gc.font = "20px sans-serif"; gc.fillText(`${sceneAt(t).id}  ${t.toFixed(2)}s`, x, y + ch + 26);
  });
  return g.toDataURL("image/png").split(",")[1];
}
window.render = render;
window.sfxCues = sfxCues;
window.sheetTimes = sheetTimes;
window.contact = contact;
window.engineReport = () => ({ warnings: [...WARN], scenes: SC.map(S => ({ id: S.id, type: S.type, t0: +S.t0.toFixed(3), t1: +S.t1.toFixed(3), landed: +landed(S).toFixed(3) })) });

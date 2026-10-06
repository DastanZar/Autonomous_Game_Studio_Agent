// Point Roberts, version C: KINETIC INFOGRAPHIC (Vox / documentary motion-graphics language).
// Method: no paper, no characters. One continuous map camera that flies from the town to the continent and back
// (OSM detail close in, Natural Earth far out), glowing lines that draw on, big kinetic type with letters rising
// out of a mask, unit charts (one dot = one person), rolling counters and clean icons. Every move is eased or sprung.
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const at = c => cue(c);
const pp = (t, a, d) => clamp((t - a) / d);
const spring = (k, f = 4.2, d = 5.5) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-d * k) * Math.cos(f * Math.PI * k);

const K = {
  bg: "#0d1826", sea: "#10202f", grid: "rgba(120,170,210,0.07)", land: "#1d3147", land2: "#24394f", edge: "#3e5d7c",
  us: "#ffb547", usDeep: "#c9862a", red: "#ff5a4f", cyan: "#58d0e6", white: "#f4f1ea", mute: "#8fa3b8", ink: "#0d1826",
};

// ---------- primitives ----------
function glow(path, col, w, o = {}) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (o.dash) ctx.setLineDash(o.dash);
  for (const [m, a] of [[5, 0.08], [2.6, 0.18], [1, 1]]) { ctx.beginPath(); path(); ctx.strokeStyle = col; ctx.globalAlpha = a * (o.alpha ?? 1); ctx.lineWidth = w * m; ctx.stroke(); }
  ctx.restore();
}
function halo(x, y, r, col, a = 0.5) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace(")", `,${a})`).replace("rgb", "rgba")); g.addColorStop(1, col.replace(")", ",0)").replace("rgb", "rgba")); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function softHalo(x, y, r, hex, a = 0.45) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(hex, a)); g.addColorStop(1, hexA(hex, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
// kinetic type: each letter rises out of a mask, staggered
function kText(str, x, y, size, t, t0, o = {}) {
  if (t < t0) return;
  ctx.save(); ctx.font = `${size}px ${o.font || "Anton"}`; if (o.ls) ctx.letterSpacing = o.ls + "px";
  const adv = [...str].map(ch => ctx.measureText(ch).width), wTot = adv.reduce((a, b) => a + b, 0);   // letterSpacing is already in each advance
  let cx = o.align === "left" ? x : o.align === "right" ? x - wTot : x - wTot / 2;
  const out = o.out != null ? pp(t, o.out, 0.3) : 0;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.beginPath(); ctx.rect(cx - 20, y - size * 1.05, wTot + 40, size * 1.3); ctx.clip();
  for (let i = 0; i < str.length; i++) {
    const ch = str[i], cw = adv[i], k = eout(pp(t, t0 + i * (o.stagger ?? 0.025), 0.35));
    const dy = (1 - k) * size * 1.1 - out * size * 1.2;
    ctx.fillStyle = o.color || K.white; ctx.fillText(ch, cx, y + dy);
    cx += cw;
  }
  ctx.restore();
}
function label(str, x, y, t, t0, o = {}) {        // a thin callout: dot, leader line, text
  const k = pp(t, t0, 0.4); if (k <= 0) return;
  const lx = x + (o.dx ?? 120), ly = y + (o.dy ?? -90);
  ctx.save(); ctx.fillStyle = o.col || K.white; ctx.beginPath(); ctx.arc(x, y, 7 * spring(k), 0, 7); ctx.fill();
  ctx.strokeStyle = o.col || K.white; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, eout(k)), lerp(y, ly, eout(k))); ctx.stroke(); ctx.restore();
  kText(str, lx + (o.dx >= 0 || o.dx == null ? 12 : -12), ly + 12, o.size || 40, t, t0 + 0.2, { align: o.dx < 0 ? "right" : "left", color: o.col || K.white, font: o.font, ls: 2 });
}
function counter(v, x, y, size, col = K.white, o = {}) { text(o.fmt ? o.fmt(v) : fmt(v), x, y, { size, color: col, align: o.align || "center" }); }
function pill(str, x, y, size, bg, fg = K.ink, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = `${size}px Anton`; const w = ctx.measureText(str).width + size; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.75, w, size * 1.4, size * 0.7); ctx.fill(); text(str, 0, size * 0.42, { size, color: fg }); ctx.restore(); }

// ---------- the continuous map camera ----------
const PR = [-123.062, 48.986], BORDER_LAT = 49.0021;
const KEYS = () => [                                         // [time, lon, lat, scale px per degree latitude]
  [0, -123.03, 49.03, 6200],
  [at("hook/canada"), -123.0, 49.045, 5200],
  [at("who/about") - 0.1, -123.058, 48.99, 15000],
  [at("treaty/in") + 0.05, -123.058, 48.99, 15000],
  [at("treaty/britain") - 0.1, -121.4, 48.6, 96],
  [at("treaty/parallel") + 0.6, -121.4, 48.6, 100],
  [at("coast/nobody"), -121.6, 48.8, 110],
  [at("coast/coast") + 0.3, -123.04, 49.0, 2600],
  [at("survey/surveyors") - 0.05, -123.06, 48.996, 11500],
  [at("survey/peninsula") + 0.5, -123.06, 48.992, 12500],
  [at("drive/to") - 0.1, -122.93, 49.045, 4300],
  [at("drive/twice") + 1, -122.93, 49.045, 4400],
];
let _keys = null;
function camAt(t) {
  _keys = _keys || KEYS(); const k = _keys;
  if (t <= k[0][0]) return { lon: k[0][1], lat: k[0][2], s: k[0][3] };
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) {
    const u = eio(pp(t, k[i][0], k[i + 1][0] - k[i][0]));
    const ls = lerp(Math.log(k[i][3]), Math.log(k[i + 1][3]), u);    // zoom in log space: a constant-feeling flight
    const w = (Math.exp(ls) - k[i][3]) / ((k[i + 1][3] - k[i][3]) || 1);  // follow the zoom so the target stays framed
    const uu = k[i][3] === k[i + 1][3] ? u : clamp(w);
    return { lon: lerp(k[i][1], k[i + 1][1], uu), lat: lerp(k[i][2], k[i + 1][2], uu), s: Math.exp(ls) };
  }
  const l = k[k.length - 1]; return { lon: l[1], lat: l[2], s: l[3] };
}
function proj(cam, cy = 780) { const kk = Math.cos(cam.lat * Math.PI / 180); return (lon, lat) => [W / 2 + (lon - cam.lon) * kk * cam.s, cy - (lat - cam.lat) * cam.s]; }
function ringsPath(polys, mp) { for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const p = mp(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); } }
const isPR = poly => poly[0].some(([lo, la]) => lo < -122.99 && lo > -123.12 && la > 48.95);
function backdrop() {
  ctx.fillStyle = K.bg; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, 760, 100, W / 2, 760, 1200); g.addColorStop(0, "#14283b"); g.addColorStop(1, K.bg); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// draws the world under camera `cam`; o.tint(iso, poly) can return a highlight colour
function world(t, cam, o = {}) {
  backdrop();
  const mp = proj(cam);
  // graticule every degree (fades in as we zoom out), every 0.05 deg close in
  const step = cam.s > 2000 ? 0.05 : 1;
  ctx.save(); ctx.strokeStyle = K.grid; ctx.lineWidth = 2;
  const lat0 = Math.floor((cam.lat - 1000 / cam.s) / step) * step, lon0 = Math.floor((cam.lon - 1200 / cam.s) / step) * step;
  for (let la = lat0; la < cam.lat + 1000 / cam.s; la += step) { const a = mp(cam.lon - 3000 / cam.s, la), b = mp(cam.lon + 3000 / cam.s, la); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  for (let lo = lon0; lo < cam.lon + 1600 / cam.s; lo += step) { const a = mp(lo, cam.lat - 2000 / cam.s), b = mp(lo, cam.lat + 2000 / cam.s); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.restore();
  const fine = clamp((cam.s - 900) / 1200);                 // 0 = Natural Earth, 1 = OSM coastline
  const layer = (id, alpha) => {
    const g = GEO[id]; if (!g || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    for (const L of g.layers) {
      const groups = L.iso === "US" && id === "s_drive" ? [[L.polys.filter(p => !isPR(p)), "us"], [L.polys.filter(isPR), "pr"]] : [[L.polys, L.iso === "US" ? "us" : "ca"]];
      for (const [polys, kind] of groups) {
        // far out (1846) the continent is one piece: the border only exists once the line is drawn
        const col = o.fill ? o.fill(kind) : id === "s_treaty" ? K.land : (kind === "ca" ? K.land : kind === "pr" ? K.us : K.land2);
        ctx.beginPath(); ringsPath(polys, mp); ctx.fillStyle = col; ctx.fill("evenodd");
        if (id !== "s_treaty") { ctx.beginPath(); ringsPath(polys, mp); ctx.strokeStyle = kind === "pr" ? K.us : K.edge; ctx.lineWidth = kind === "pr" ? 3 : 2; ctx.stroke(); }
      }
    }
    ctx.restore();
  };
  layer("s_treaty", 1 - fine);
  layer("s_drive", fine);
  return mp;
}
function prPath(mp) { const p = new Path2D(); const us = GEO.s_drive.layers.find(L => L.iso === "US"); for (const poly of us.polys.filter(isPR)) for (const ring of poly) { ring.forEach(([lo, la], j) => { const q = mp(lo, la); j ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); }); p.closePath(); } return p; }
function prGlow(mp, a = 1, pulse = 0) { const p = prPath(mp); ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = K.us; ctx.shadowBlur = 30 + pulse * 30; ctx.fillStyle = K.us; ctx.fill(p); ctx.restore(); }
function border(mp, lon0, lon1, k, o = {}) { if (k <= 0) return; const a = mp(lon0, BORDER_LAT), b = mp(lerp(lon0, lon1, k), BORDER_LAT); glow(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, o.col || K.red, o.w || 4, { dash: o.dash }); }
function header(str, t, t0) { kText(str, 60, 330, 46, t, t0, { align: "left", color: K.mute, font: "Elite", ls: 4, stagger: 0.015 }); }
function seriesTag() { ctx.save(); ctx.fillStyle = K.white; ctx.globalAlpha = 0.85; ctx.font = "26px Anton"; ctx.letterSpacing = "6px"; ctx.fillText("BORDER QUIRKS", 60, 258); ctx.fillStyle = K.red; ctx.fillRect(60, 268, 60, 5); ctx.restore(); }

// ---------- icons ----------
function iconCar(x, y, s, col, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-26, -13, 52, 26, 9); ctx.fill(); ctx.fillStyle = K.ink; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.roundRect(2, -10, 12, 20, 3); ctx.fill(); ctx.restore(); }
function iconPerson(x, y, s, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 15 * s, 6 * s, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 7 * s, y - 7 * s, 14 * s, 18 * s, 6 * s); ctx.fill(); }
function iconPump(x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-30, -90, 60, 90, 8); ctx.fill(); ctx.fillStyle = K.ink; ctx.fillRect(-18, -74, 36, 26); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(30, -66); ctx.quadraticCurveTo(52, -50, 44, -14); ctx.stroke(); ctx.restore(); }
function iconDrop(x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(14, -10, 22, 2, 22, 12); ctx.arc(0, 12, 22, 0, Math.PI); ctx.bezierCurveTo(-22, 2, -14, -10, 0, -30); ctx.fill(); ctx.restore(); }
function iconBus(x, y, s, col, dir = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-60, -34, 120, 52, 10); ctx.fill(); ctx.fillStyle = K.ink; ctx.globalAlpha = 0.55; for (let i = 0; i < 4; i++) ctx.fillRect(-50 + i * 24, -26, 16, 16); ctx.globalAlpha = 1; ctx.fillStyle = K.ink; for (const wx of [-34, 36]) { ctx.beginPath(); ctx.arc(wx, 20, 10, 0, 7); ctx.fill(); } ctx.restore(); }
function iconGate(x, y, s, col, open) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.fillRect(-6, -70, 12, 70); ctx.save(); ctx.translate(0, -60); ctx.rotate(-open * 1.4); ctx.fillRect(0, -6, 90, 12); ctx.restore(); ctx.restore(); }
function maple(x, y, s, col) { ctx.save(); ctx.fillStyle = col; const L = [[0,-1],[.12,-.78],[.3,-.86],[.22,-.42],[.46,-.64],[.54,-.5],[.78,-.58],[.68,-.32],[.84,-.24],[.48,.04],[.55,.18],[.08,.12],[.07,.55],[-.07,.55],[-.08,.12],[-.55,.18],[-.48,.04],[-.84,-.24],[-.68,-.32],[-.78,-.58],[-.54,-.5],[-.46,-.64],[-.22,-.42],[-.3,-.86],[-.12,-.78]]; ctx.beginPath(); L.forEach(([a, b], i) => i ? ctx.lineTo(x + a * s, y + b * s) : ctx.moveTo(x + a * s, y + b * s)); ctx.closePath(); ctx.fill(); ctx.restore(); }

// the one road out, as real waypoints (Tyee Dr / 56 St north into Tsawwassen)
const ROAD = [[-123.058, 48.982], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06]];
const ROUTE = [[-123.055, 48.985], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06], [-123.0, 49.08], [-122.93, 49.095], [-122.89, 49.103], [-122.84, 49.08], [-122.80, 49.04], [-122.765, 49.015], [-122.757, 49.0021], [-122.75, 48.99]];
function pathLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
function along(P, k) { const tot = pathLen(P); let d = clamp(k) * tot; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (d <= l || i === P.length - 1) { const u = l ? d / l : 0; return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; } d -= l; } }
function drawPath(P, k, col, w) { const L = pathLen(P); glow(() => { P.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, col, w, {}); return L; }
function partial(P, k) { const out = [P[0]], tot = pathLen(P); let d = clamp(k) * tot; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (d >= l) { out.push(P[i]); d -= l; } else { const u = d / l; out.push([lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]); break; } } return out; }

// =====================================================================================================
// map scenes share the camera; each adds its own layer
// =====================================================================================================
CU.hook = (t, S) => {
  const cam = camAt(Math.max(t, 0)), mp = world(t, cam);
  border(mp, -123.4, -122.4, 1, { dash: [18, 12], w: 3 });
  const pulse = 0.5 + 0.5 * Math.sin(t * 3); prGlow(mp, 0.9, pulse);
  // the one road: draws on, a car runs it northward into Canada
  const rk = eout(pp(t, at("hook/road") - 0.3, 0.9)), R = ROAD.map(p => mp(...p));
  if (rk > 0) glow(() => { partial(R, rk).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, K.white, 4);
  const ck = ((t * 0.28) % 1), [cx, cy, ca] = along(R, ck);
  iconCar(cx, cy, 0.9, K.white, ca);
  // Canada lights up on "Canada"
  const tc = at("hook/canada"), kc = pp(t, tc - 0.05, 0.5);
  if (kc > 0) { ctx.save(); ctx.globalAlpha = 0.35 * kc; const g = GEO.s_drive; const ca_ = g.layers.find(L => L.iso === "CA"); ctx.beginPath(); ringsPath(ca_.polys, mp); ctx.fillStyle = K.red; ctx.fill("evenodd"); ctx.restore(); }
  seriesTag();
  const p0 = mp(...PR); label("POINT ROBERTS, WA", p0[0] - 60, p0[1] - 10, t, -1, { dx: -140, dy: -250, size: 40, col: K.us });
  kText("ONE ROAD OUT", W / 2, 540, 110, t, at("hook/one") - 0.1, { color: K.white, ls: 3 });
  kText("THROUGH CANADA", W / 2, 640, 74, t, tc - 0.15, { color: K.red, ls: 4 });
};
CU.who = (t, S) => {
  const cam = camAt(t), mp = world(t, cam);
  border(mp, -123.4, -122.4, 1, { dash: [18, 12], w: 3 });
  prGlow(mp, 0.95);
  // one dot per resident, scattered over the real outline
  const path = prPath(mp), t1 = at("who/twelve"); let n = 0;
  ctx.fillStyle = K.ink;
  for (let i = 0; i < 4000 && n < 1191; i++) { const lo = lerp(-123.092, -123.03, rnd(i, 81)), la = lerp(48.968, 49.001, rnd(i, 82)), [x, y] = mp(lo, la); if (!ctx.isPointInPath(path, x, y)) continue; const k = pp(t, t1 + n * 0.0006, 0.2); n++; if (k <= 0) continue; ctx.globalAlpha = 0.75 * k; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  seriesTag(); header("THE TOWN, 2020 CENSUS", t, S.t0);
  const nn = Math.round(1191 * eout(pp(t, t1, 1.0)));
  if (t > t1 - 0.1) { counter(nn, 60, 470, 150, K.white, { align: "left" }); kText("PEOPLE", 64, 530, 40, t, t1, { align: "left", color: K.mute, ls: 6 }); }
  const t5 = at("who/five");
  if (t > t5 - 0.1) { ctx.save(); ctx.setLineDash([3000, 3000]); ctx.lineDashOffset = 3000 * (1 - eout(pp(t, t5, 0.8))); ctx.strokeStyle = K.white; ctx.lineWidth = 5; ctx.stroke(path); ctx.restore();
    counter(5, W - 60, 470, 150, K.us, { align: "right" }); kText("SQ MILES", W - 60, 530, 40, t, t5, { align: "right", color: K.mute, ls: 6 }); }
};
CU.treaty = (t, S) => {
  const cam = camAt(t), mp = world(t, cam);
  const tL0 = at("treaty/the") - 0.05, tL1 = at("treaty/parallel") + 0.5, lk = eio(pp(t, tL0, tL1 - tL0));
  // north / south washes once the line is down
  const tint = eout(pp(t, at("treaty/parallel") + 0.2, 0.6));
  if (tint > 0) { const y = mp(0, 49)[1]; ctx.save(); const g = GEO.s_treaty; ctx.beginPath(); for (const L of g.layers) ringsPath(L.polys, mp); ctx.clip("evenodd"); ctx.globalAlpha = 0.35 * tint; ctx.fillStyle = K.red; ctx.fillRect(0, 0, W, y); ctx.fillStyle = K.cyan; ctx.globalAlpha = 0.22 * tint; ctx.fillRect(0, y, W, H); ctx.restore(); }
  if (lk > 0) { const a = mp(-114, 49), b = mp(lerp(-114, -124.6, lk), 49); glow(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, K.red, 5); softHalo(b[0], b[1], 60, K.red, 0.6); }
  seriesTag();
  kText("1846", W / 2, 520, 220, t, at("treaty/eighteen") - 0.1, { color: K.white, stagger: 0.06 });
  kText("BRITAIN", W / 2, mp(0, 49.9)[1], 64, t, at("treaty/britain") - 0.05, { color: K.white, ls: 10 });
  kText("UNITED STATES", W / 2, mp(0, 47.2)[1], 64, t, at("treaty/america") - 0.05, { color: K.white, ls: 8 });
  if (t > at("treaty/ruler") - 0.2) { const k = eout(pp(t, at("treaty/ruler") - 0.2, 0.4)), y = mp(0, 49)[1]; ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = K.white; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.restore(); }
  if (t > at("treaty/fortyninth") - 0.05) pill("49°N", W - 150, mp(0, 49)[1] - 50, 40, K.red, K.white, spring(pp(t, at("treaty/fortyninth") - 0.05, 0.5)));
};
CU.coast = (t, S) => {
  const cam = camAt(t), mp = world(t, cam);
  const a = mp(-114, 49), b = mp(-124.6, 49); glow(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, K.red, 4);
  if (cam.s > 1500) { border(mp, -123.4, -122.4, 1, { w: 4 }); prGlow(mp, clamp((cam.s - 1500) / 1000)); }
  seriesTag();
  kText("NOBODY CHECKED", W / 2, 470, 96, t, at("coast/nobody") - 0.1, { color: K.white, ls: 2 });
  kText("THE COAST", W / 2, 580, 96, t, at("coast/the") - 0.1, { color: K.us, ls: 2 });
  const tc = at("coast/coast"), kr = pp(t, tc, 0.9);
  if (kr > 0) { const p = mp(-123.06, 48.99); ctx.save(); ctx.strokeStyle = K.us; ctx.lineWidth = 4; ctx.globalAlpha = 1 - kr; ctx.beginPath(); ctx.arc(p[0], p[1], 60 + kr * 260, 0, 7); ctx.stroke(); ctx.restore(); }
};
CU.survey = (t, S) => {
  const cam = camAt(t), mp = world(t, cam, { fill: k => k === "pr" ? K.land : k === "ca" ? K.land : K.land2 });
  const tc = at("survey/cut"), walk = eio(pp(t, S.t0 - 0.2, tc - S.t0 + 0.1)), lonS = lerp(-122.98, -123.11, walk);
  border(mp, -122.9, lonS, 1, { w: 4 });
  // survey stakes tick along behind the line's head
  for (let lo = -122.99; lo > lonS; lo -= 0.006) { const p = mp(lo, BORDER_LAT); ctx.fillStyle = K.white; ctx.fillRect(p[0] - 3, p[1] - 16, 6, 16); }
  const head = mp(lonS, BORDER_LAT); softHalo(head[0], head[1], 70, K.white, 0.5);
  const lift = eout(pp(t, tc, 0.6));
  if (lift > 0) { ctx.save(); ctx.translate(0, 26 * lift); prGlow(mp, lift, 0.4); ctx.restore(); }
  seriesTag(); header("THE BOUNDARY SURVEY", t, S.t0);
  kText("CUT OFF", W / 2, 520, 130, t, tc - 0.05, { color: K.us, ls: 4 });
  const p0 = mp(...PR); label("POINT ROBERTS", p0[0], p0[1] + 30, t, at("survey/peninsula") - 0.1, { dx: -40, dy: 220, size: 44, col: K.us });
  kText("CANADA", W / 2, mp(0, 49.04)[1], 70, t, tc + 0.3, { color: K.mute, ls: 16 });
};
CU.drive = (t, S) => {
  const cam = camAt(t), mp = world(t, cam);
  border(mp, -123.4, -122.4, 1, { dash: [18, 12], w: 3 });
  const t1 = at("drive/cross"), t2 = at("drive/twice"), k = lerp(0.03, 0.985, eio(pp(t, S.t0 - 0.1, t2 - S.t0 + 0.15)));
  const R = ROUTE.map(p => mp(...p));
  glow(() => { partial(R, k).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); }, K.white, 4);
  for (let i = 0; i < 18; i++) { const kk = k - i * 0.012; if (kk < 0) break; const [x, y] = along(R, kk); ctx.globalAlpha = (1 - i / 18) * 0.6; ctx.fillStyle = K.cyan; ctx.beginPath(); ctx.arc(x, y, 6 - i * 0.25, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const [cx, cy, ca] = along(R, k); iconCar(cx, cy, 1.0, K.white, ca); softHalo(cx, cy, 60, K.white, 0.25);
  [[ROUTE[1], t1, "1"], [ROUTE[10], t2, "2"]].forEach(([p, tt, n]) => { const q = mp(...p), kk = spring(pp(t, tt - 0.05, 0.5)); if (kk > 0) { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(kk, kk); ctx.fillStyle = K.red; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill(); text(n, 0, 16, { size: 44, color: K.white }); ctx.restore(); } });
  seriesTag(); header("TO THE REST OF THE USA", t, S.t0);
  const L = pathLen(R), cum = (n) => pathLen(R.slice(0, n + 1)) / L, inC = clamp((k - cum(1)) / (cum(10) - cum(1)));
  counter(Math.round(25 * inC), 60, 500, 170, K.white, { align: "left" }); kText("MILES IN CANADA", 64, 560, 40, t, S.t0, { align: "left", color: K.mute, ls: 6 });
  kText("2 BORDER CROSSINGS", W / 2, 1140, 64, t, t2 - 0.1, { color: K.red, ls: 2 });
};

// =====================================================================================================
// diagram scenes: same palette, no map
// =====================================================================================================
function stage() { backdrop(); ctx.save(); ctx.strokeStyle = K.grid; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore(); }
CU.kids = (t, S) => {
  stage(); seriesTag(); header("ONE SCHOOL DAY · FROM 4TH GRADE", t, S.t0);
  // a schematic strip: Point Roberts | Canada | Blaine, two gates
  const y = 900, xPR = 120, xB1 = 330, xB2 = 750, xS = 960;
  ctx.fillStyle = hexA(K.us, 0.15); ctx.fillRect(0, y - 120, xB1, 240); ctx.fillRect(xB2, y - 120, W - xB2, 240);
  ctx.fillStyle = hexA(K.red, 0.12); ctx.fillRect(xB1, y - 120, xB2 - xB1, 240);
  text("POINT ROBERTS", xPR + 40, y - 140, { size: 30, color: K.us }); text("CANADA", (xB1 + xB2) / 2, y - 140, { size: 30, color: K.red }); text("BLAINE", xS, y - 140, { size: 30, color: K.us });
  glow(() => { ctx.moveTo(40, y + 60); ctx.lineTo(W - 40, y + 60); }, K.mute, 3);
  const tOut0 = S.t0 + 0.05, tOut1 = at("kids/four") - 0.4, tBack0 = tOut1 + 0.12, tBack1 = at("kids/day") - 0.05;
  const bx = t < tBack0 ? lerp(80, 1000, eio(pp(t, tOut0, tOut1 - tOut0))) : lerp(1000, 80, eio(pp(t, tBack0, tBack1 - tBack0))), dir = t < tBack0 ? 1 : -1;
  if (!S.cross) { S.cross = []; let prev = null; for (let tt = S.t0; tt < S.t1; tt += 1 / 240) { const x = tt < tBack0 ? lerp(80, 1000, eio(pp(tt, tOut0, tOut1 - tOut0))) : lerp(1000, 80, eio(pp(tt, tBack0, tBack1 - tBack0))); if (prev != null) for (const b of [xB1, xB2]) if ((prev - b) * (x - b) < 0) S.cross.push(tt); prev = x; } }
  for (const b of [xB1, xB2]) { iconGate(b, y + 60, 1.2, K.red, clamp(1 - (Math.abs(bx - b) - 80) / 120)); glow(() => { ctx.moveTo(b, y - 120); ctx.lineTo(b, y + 120); }, K.red, 2, { dash: [10, 10] }); }
  iconBus(bx, y + 22, 1.15, K.us, dir);
  // the counter: four slots light as they happen
  const n = S.cross.filter(c => t >= c).length;
  for (let i = 0; i < 4; i++) { const x = 210 + i * 220, on = i < n, k = on ? spring(pp(t, S.cross[i], 0.45)) : 0; ctx.strokeStyle = K.mute; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, 560, 70, 0, 7); ctx.stroke(); if (k > 0) { ctx.save(); ctx.translate(x, 560); ctx.scale(k, k); ctx.fillStyle = K.red; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill(); text(String(i + 1), 0, 30, { size: 90, color: K.white }); ctx.restore(); } }
  kText("CROSSINGS A DAY", W / 2, 720, 56, t, at("kids/crossings") - 0.1, { color: K.white, ls: 4 });
  // a sun-to-moon arc for the day
  const u = pp(t, S.t0, S.t1 - S.t0), a = lerp(Math.PI, 0, u); ctx.fillStyle = K.us; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * 400, 1160 - Math.sin(a) * 80, 16, 0, 7); ctx.fill();
};
CU.water = (t, S) => {
  stage(); seriesTag(); header("WHERE THE TAP WATER COMES FROM", t, S.t0);
  const y = 900;
  glow(() => { ctx.moveTo(W / 2, 640); ctx.lineTo(W / 2, 1180); }, K.red, 3, { dash: [14, 12] });
  text("USA", W / 2 - 230, 680, { size: 44, color: K.us }); text("CANADA", W / 2 + 230, 680, { size: 44, color: K.red });
  // reservoir (right), tap (left), a pipe between, droplets flowing west
  ctx.fillStyle = hexA(K.cyan, 0.25); ctx.beginPath(); ctx.ellipse(880, y, 130, 60, 0, 0, 7); ctx.fill(); ctx.strokeStyle = K.cyan; ctx.lineWidth = 3; ctx.stroke(); text("RESERVOIR", 880, y + 110, { size: 28, color: K.cyan, font: "Elite" });
  ctx.save(); ctx.translate(180, y); ctx.fillStyle = K.white; ctx.fillRect(-10, -70, 20, 70); ctx.fillRect(-10, -70, 80, 20); ctx.fillRect(56, -70, 14, 30); ctx.restore(); text("TAP", 200, y + 110, { size: 28, color: K.white, font: "Elite" });
  const P = [[860, y], [600, y + 40], [240, y - 20]];
  glow(() => { ctx.moveTo(...P[0]); ctx.quadraticCurveTo(...P[1], ...P[2]); }, K.cyan, 6);
  for (let i = 0; i < 12; i++) { const u = (T * 0.45 + i / 12) % 1, x = (1 - u) * (1 - u) * P[0][0] + 2 * (1 - u) * u * P[1][0] + u * u * P[2][0], yy = (1 - u) * (1 - u) * P[0][1] + 2 * (1 - u) * u * P[1][1] + u * u * P[2][1]; iconDrop(x, yy - 10, 0.6, K.cyan); }
  const tc = at("water/canadian"); kText("CANADIAN", W / 2, 520, 130, t, tc - 0.1, { color: K.cyan, ls: 4 });
  if (t > tc) maple(W / 2 + 330, 470, 46 * spring(pp(t, tc, 0.5)), K.red);
  kText("SUPPLY AGREEMENT", W / 2, 1150, 48, t, at("water/deal") - 0.1, { color: K.mute, ls: 4 });
  kText("1987", W / 2, 1110 - 70, 120, t, at("water/nineteen") - 0.1, { color: K.white, stagger: 0.06 });
  kText("Greater Vancouver Water District → Point Roberts", W / 2, 1210, 26, t, at("water/deal"), { color: K.mute, font: "Elite", stagger: 0.008 });
};
CU.shut = (t, S) => {
  // back on the map: shoppers stream in as dots; the border becomes a wall; the stream stops and fades
  const cam = { lon: -123.03, lat: 49.03, s: 6800 }, mp = world(t, cam);
  prGlow(mp, 0.8);
  const tShut = at("shut/shut"), tVan = at("shut/vanished"), wall = eout(pp(t, tShut - 0.1, 0.35));
  border(mp, -123.4, -122.4, 1, { w: 3 + wall * 6, dash: wall > 0.5 ? null : [18, 12] });
  const R = ROAD.map(p => mp(...p)).reverse();
  for (let i = 0; i < 40; i++) { const born = S.t0 - 3 + i * 0.12; if (born > tShut) break; const k = (t - born) * 0.45; const dead = pp(t, tVan - 0.3 + rnd(i, 5) * 0.4, 0.3); if (k <= 0 || k >= 1) continue; const [x, y] = along(R, k); ctx.globalAlpha = 1 - dead; ctx.fillStyle = K.red; ctx.beginPath(); ctx.arc(x + (rnd(i, 1) - 0.5) * 24, y, 7, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  seriesTag();
  kText("2020", W / 2, 520, 200, t, at("shut/twenty") - 0.15, { color: K.white, stagger: 0.06 });
  kText("BORDER CLOSED", W / 2, 640, 90, t, tShut - 0.05, { color: K.red, ls: 4 });
  label("CANADIAN SHOPPERS", mp(-123.064, 49.02)[0], mp(-123.064, 49.02)[1], t, S.t0 + 0.2, { dx: 80, dy: -120, size: 34, col: K.red });
};
CU.lost = (t, S) => {
  stage(); seriesTag(); header("TOWN BUSINESS, 2020", t, S.t0);
  const t0 = at("lost/lost"), t1 = at("lost/business") + 0.4, left = lerp(100, 18, eio(pp(t, t0, t1 - t0)));
  const x0 = 120, w = W - 240, y0 = 700, h = 160;
  ctx.fillStyle = hexA(K.white, 0.08); ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = left > 40 ? K.us : K.red; ctx.fillRect(x0, y0, w * left / 100, h);
  ctx.strokeStyle = K.white; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, w, h);
  for (let i = 1; i < 5; i++) { ctx.fillStyle = K.bg; ctx.fillRect(x0 + w * i / 5 - 1, y0, 3, 24); }
  counter(Math.round(left), x0 + w, y0 - 30, 110, K.white, { align: "right", fmt: v => v + "%" });
  kText("−80%+", W / 2, 1120, 220, t, at("lost/eighty") - 0.1, { color: K.red, stagger: 0.05 });
  kText(S.p.label || "Border Policy Research Institute estimate", W / 2, 1190, 30, t, at("lost/percent"), { color: K.mute, font: "Elite", stagger: 0.008 });
};
CU.grocery = (t, S) => {
  stage(); seriesTag(); header("THE GROCERY STORE · SHOPPERS A DAY", t, S.t0);
  const tIn = at("grocery/five"), tOut = at("grocery/about");
  // a unit chart: 5,000 dots, one per shopper; 50 survive
  const cols = 100, rows = 50, x0 = 40, y0 = 560, dx = (W - 80) / cols, dy = 12.5;
  if (!S.keep) { S.keep = new Set(); const ord = Array.from({ length: 5000 }, (_, i) => [rnd(i, 7), i]).sort((a, b) => a[0] - b[0]); ord.slice(0, 50).forEach(([, i]) => S.keep.add(i)); }
  for (let i = 0; i < 5000; i++) {
    const r = Math.floor(i / cols), c = i % cols, kIn = pp(t, tIn - 0.1 + (c + r) / 150 * 0.9, 0.15); if (kIn <= 0) continue;
    const keep = S.keep.has(i), kOut = keep ? 0 : pp(t, tOut + rnd(i, 9) * 0.45, 0.12); if (kOut >= 1) continue;
    ctx.fillStyle = keep && t > tOut ? K.white : K.us; ctx.globalAlpha = (1 - kOut);
    const grow = keep ? eout(pp(t, tOut + 0.4, 0.5)) : 0, s = 3.6 + grow * 6, px = x0 + c * dx + dx / 2, py = y0 + r * dy;
    if (grow > 0) softHalo(px, py, 30 * grow, K.white, 0.35);
    ctx.beginPath(); ctx.arc(px, py, s, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const n = t < tOut ? Math.round(5000 * eout(pp(t, tIn - 0.1, 0.9))) : Math.round(lerp(5000, 50, eout(pp(t, tOut, 0.5))));
  counter(n, 60, 500, 150, t < tOut ? K.us : K.white, { align: "left" });
  kText(t < tOut ? "AT ITS PEAK" : "DURING THE 2020 CLOSURE", W - 60, 490, 34, t, t < tOut ? tIn : tOut, { align: "right", color: K.mute, ls: 4, font: "Elite" });
};
CU.gas = (t, S) => {
  stage(); seriesTag(); header("GAS STATIONS VS PEOPLE, 2020", t, S.t0);
  const t5 = [at("gas/five"), at("gas/gas"), at("gas/stations"), at("gas/stations") + 0.15, at("gas/stations") + 0.3], tf = at("gas/fewer");
  for (let i = 0; i < 5; i++) {
    const x = 140 + i * 200, k = spring(pp(t, t5[i] - 0.05, 0.5)); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 760); ctx.scale(k, k); iconPump(0, 0, 1.2, K.us); ctx.restore();
    // each station's share of the town: fewer than 200 people, as a column of dots
    const kk = pp(t, tf + i * 0.08, 0.6);
    for (let j = 0; j < 190 * kk; j++) { const r = Math.floor(j / 10), c = j % 10; ctx.fillStyle = K.white; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x - 45 + c * 10, 820 + r * 18, 3.4, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  kText("5 STATIONS", W / 2, 540, 120, t, t5[0] - 0.1, { color: K.us, ls: 3 });
  kText("< 1,000 PEOPLE", W / 2, 1220, 72, t, tf - 0.05, { color: K.white, ls: 3 });
};
CU.trade = (t, S) => {
  stage(); seriesTag();
  const tB = at("trade/one") - 0.15, slide = eio(pp(t, tB, 0.4));
  ctx.save(); ctx.translate(-W * slide, 0);
  header("2025 · THE TRADE WAR", t, S.t0);
  kText("2025", W / 2, 560, 220, t, at("trade/twenty") - 0.15, { color: K.white, stagger: 0.06 });
  // tariff arrows bouncing off the line
  glow(() => { ctx.moveTo(W / 2, 700); ctx.lineTo(W / 2, 1200); }, K.red, 4, { dash: [16, 12] });
  const tt = at("trade/trade");
  for (let i = 0; i < 6; i++) { const k = pp(t, tt + i * 0.12, 0.5), dir = i % 2 ? 1 : -1, y = 760 + i * 70; if (k <= 0) continue; const x = W / 2 + dir * (360 - 330 * Math.sin(Math.min(1, k) * Math.PI)); arrow(W / 2 + dir * 400, y, x, y, 1, i % 2 ? K.red : K.us, 8); text("TARIFF", W / 2 + dir * 420, y + 12, { size: 26, color: K.mute, align: dir > 0 ? "left" : "right" }); }
  kText("TRADE WAR", W / 2, 680, 90, t, at("trade/war") - 0.1, { color: K.red, ls: 4 });
  ctx.translate(W, 0);
  header("ONE RESTAURANT · FEBRUARY SALES", t, tB + 0.2);
  const grow = eout(pp(t, tB + 0.35, 0.6)), drop = eio(pp(t, at("trade/fiftyfive") - 0.1, 0.5)), base = 1150, top = 640;
  const h1 = (base - top) * grow, h2 = (base - top) * grow * lerp(1, 0.45, drop);
  ctx.fillStyle = K.mute; ctx.fillRect(230, base - h1, 220, h1); ctx.fillStyle = K.red; ctx.fillRect(630, base - h2, 220, h2);
  glow(() => { ctx.moveTo(150, base); ctx.lineTo(W - 150, base); }, K.white, 2);
  text("FEB 2024", 340, base + 50, { size: 40, color: K.white }); text("FEB 2025", 740, base + 50, { size: 40, color: K.white });
  kText("−55%", 740, base - h2 - 30, 120, t, at("trade/fiftyfive") - 0.05, { color: K.red });
  kText(S.p.label || "one business owner's reported figure", W / 2, 470, 30, t, at("trade/owner"), { color: K.mute, font: "Elite", stagger: 0.008 });
  ctx.restore();
};
CU.loop = (t, S) => {
  // from the whole continent, the line glows, then the camera dives back to the opening frame
  const t0 = S.t0, tw = at("loopback/which") - 0.3, end = TL.duration;
  const c0 = { lon: -121.4, lat: 48.6, s: 96 }, c1 = camAt(0);
  const u = eio(pp(t, tw, end - tw)), ls = lerp(Math.log(c0.s), Math.log(c1.s), u), ww = clamp((Math.exp(ls) - c0.s) / (c1.s - c0.s));
  const cam = { lon: lerp(c0.lon, c1.lon, ww), lat: lerp(c0.lat, c1.lat, ww), s: Math.exp(ls) }, mp = world(t, cam);
  const a = mp(-114, 49), b = mp(-124.6, 49), pulse = 0.6 + 0.4 * Math.sin((t - at("loopback/line")) * 8);
  glow(() => { ctx.moveTo(...a); ctx.lineTo(...b); }, K.red, 4 + 3 * pulse * (1 - u));
  if (cam.s > 1500) { prGlow(mp, clamp((cam.s - 1500) / 1500), 0.5); border(mp, -123.4, -122.4, 1, { dash: [18, 12], w: 3 }); }
  seriesTag();
  kText("ONE STRAIGHT LINE", W / 2, 540, 110, t, at("loopback/one") - 0.1, { color: K.white, ls: 3, out: tw });
  if (t > end - 0.5) {                                        // the last frames are the opening frame: label and car back in place
    const p0 = mp(...PR); label("POINT ROBERTS, WA", p0[0] - 60, p0[1] - 10, t, end - 0.5, { dx: -140, dy: -250, size: 40, col: K.us });
    const R = ROAD.map(p => mp(...p)), [cx, cy, ca] = along(R, (((t - end) * 0.28) % 1 + 1) % 1); iconCar(cx, cy, 0.9, K.white, ca); }
};

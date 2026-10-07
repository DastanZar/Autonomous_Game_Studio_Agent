// Kinetic kit (method C's moving type, usable on paper or flat themes): letters rising out of a mask, rolling digits,
// glowing lines, the one big number of an episode. Load with storyboard.json "kits": ["kinetic"].
"use strict";
const kpp = (t, a, d) => clamp((t - a) / d);
const kSpring = (k, f = 4.2, d = 5.5) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-d * k) * Math.cos(f * Math.PI * k);
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function kGlow(path, col, w, o = {}) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; if (o.dash) ctx.setLineDash(o.dash);
  for (const [m, a] of [[5, 0.08], [2.6, 0.18], [1, 1]]) { ctx.beginPath(); path(); ctx.strokeStyle = col; ctx.globalAlpha = a * (o.alpha ?? 1); ctx.lineWidth = w * m; ctx.stroke(); }
  ctx.restore();
}
function softHalo(x, y, r, hex, a = 0.45) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(hex, a)); g.addColorStop(1, hexA(hex, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
// letters rise out of a mask, staggered; o: align, color, font, ls, stagger, out (time to drop out), stroke (ink outline)
function kText(str, x, y, size, t, t0, o = {}) {
  if (t < t0) return;
  ctx.save(); ctx.font = `${size}px ${o.font || "Anton"}`; if (o.ls) ctx.letterSpacing = o.ls + "px";
  const adv = [...str].map(ch => ctx.measureText(ch).width), wTot = adv.reduce((a, b) => a + b, 0);
  let cx = o.align === "left" ? x : o.align === "right" ? x - wTot : x - wTot / 2;
  const out = o.out != null ? kpp(t, o.out, 0.3) : 0;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.beginPath(); ctx.rect(cx - 30, y - size * 1.1, wTot + 60, size * 1.4); ctx.clip();
  [...str].forEach((ch, i) => {
    const k = eout(kpp(t, t0 + i * (o.stagger ?? 0.025), 0.35)), dy = (1 - k) * size * 1.1 - out * size * 1.2;
    if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || "#2b2320"; ctx.strokeText(ch, cx, y + dy); }
    ctx.fillStyle = o.color || "#f4f1ea"; ctx.fillText(ch, cx, y + dy); cx += adv[i];
  });
  ctx.restore();
}
// rolling digits: each digit slides like an odometer wheel as the value climbs
function rollNumber(value, x, y, size, o = {}) {
  const str = o.fmt ? o.fmt(value) : Math.floor(value).toLocaleString("en-US");
  ctx.save(); ctx.font = `${size}px ${o.font || "Anton"}`; ctx.textBaseline = "alphabetic";
  const w = ctx.measureText(str).width; let cx = o.align === "left" ? x : o.align === "right" ? x - w : x - w / 2;
  const frac = value - Math.floor(value);
  [...str].forEach((ch, i) => {
    const cw = ctx.measureText(ch).width, last = i === str.length - 1 && /\d/.test(ch);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - 4, y - size * 0.98, cw + 8, size * 1.12); ctx.clip();
    const draw = (c, dy) => { if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.ink || "#2b2320"; ctx.strokeText(c, cx, y + dy); } ctx.fillStyle = o.color || "#f4f1ea"; ctx.fillText(c, cx, y + dy); };
    if (last && frac > 0 && o.roll !== false) { draw(ch, -frac * size); draw(String((+ch + 1) % 10), size - frac * size); } else draw(ch, 0);
    ctx.restore(); cx += cw;
  });
  ctx.restore();
}
// THE big number of an episode: a full-frame moment. o: value, from (start value), prefix, suffix, label, sub,
// colors {bg, fg, accent, ink}, y. The value rolls from `from` to `value` in o.roll seconds; the label rises after.
function bigNumber(t, t0, o) {
  const c = Object.assign({ bg: null, fg: "#f4f1ea", accent: "#e0533f", ink: "#2b2320" }, o.colors || {});
  const k = eout(kpp(t, t0, o.roll ?? 0.9)), v = lerp(o.from ?? 0, o.value, k), y = o.y ?? 760;
  if (c.bg) { const r = kSpring(kpp(t, t0 - 0.15, 0.5)); if (r > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, r); ctx.fillStyle = c.bg; ctx.beginPath(); ctx.arc(W / 2, y - 120, 1400 * r, 0, 7); ctx.fill(); ctx.restore(); } }
  if (t < t0) return;
  const pop = 1 + 0.12 * Math.exp(-(t - t0 - (o.roll ?? 0.9)) * 8) * (t > t0 + (o.roll ?? 0.9) ? 1 : 0);
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(pop, pop); ctx.translate(-W / 2, -y);
  const txt = (o.prefix || "") + "#" + (o.suffix || "");
  ctx.font = `${o.size || 300}px Anton`;
  const pre = o.prefix ? ctx.measureText(o.prefix).width : 0, numW = ctx.measureText((o.fmt ? o.fmt(o.value) : Math.round(o.value).toLocaleString("en-US"))).width, suf = o.suffix ? ctx.measureText(o.suffix).width : 0;
  const x0 = W / 2 - (pre + numW + suf) / 2;
  if (o.prefix) text(o.prefix, x0, y, { size: o.size || 300, align: "left", color: c.accent, stroke: o.stroke, ink: c.ink });
  rollNumber(v, x0 + pre, y, o.size || 300, { align: "left", color: c.fg, stroke: o.stroke, ink: c.ink, fmt: o.fmt, roll: o.rollDigits });
  if (o.suffix) text(o.suffix, x0 + pre + numW, y, { size: o.size || 300, align: "left", color: c.accent, stroke: o.stroke, ink: c.ink });
  ctx.restore();
  if (o.label) kText(o.label, W / 2, y + 110, o.labelSize || 64, t, t0 + 0.35, { color: c.accent, ls: 6, stroke: o.stroke ? o.stroke * 0.6 : 0, ink: c.ink });
  if (o.sub) kText(o.sub, W / 2, y + 175, 30, t, t0 + 0.6, { color: o.subColor || c.fg, font: "Elite", stagger: 0.008 });
}
// a unit chart: n dots in a grid, revealed from t0 over `dur`; keep(i) marks survivors after tOut
function unitChart(t, n, x0, y0, cols, gap, r, col, o = {}) {
  for (let i = 0; i < n; i++) {
    const c = i % cols, row = Math.floor(i / cols), kIn = kpp(t, o.t0 + (c + row) / (cols + n / cols) * (o.dur ?? 0.9), 0.15);
    if (kIn <= 0) continue;
    const keep = o.keep ? o.keep(i) : true, kOut = o.tOut != null && !keep ? kpp(t, o.tOut + rnd(i, 9) * 0.45, 0.12) : 0;
    if (kOut >= 1) continue;
    ctx.globalAlpha = 1 - kOut; ctx.fillStyle = keep && o.tOut != null && t > o.tOut ? (o.keepCol || col) : col;
    ctx.beginPath(); ctx.arc(x0 + c * gap, y0 + row * gap, r * (keep && o.tOut != null && t > o.tOut + 0.4 ? 1.7 : 1), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

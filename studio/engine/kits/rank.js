// Rank kit (Leader Flags, method C: kinetic infographic): a night-blue stage that never stops moving, official flag
// art, rolling numbers and type that rises out of a mask. Load with "kits": ["kinetic", "flagart", "rank"].
// Built to fix C's measured weakness (it settled and held): the grid drifts, particles float and every flag breathes.
//
//   rankBG(t, o)                         the stage: gradient, drifting perspective grid, particles, vignette
//   lfEntry(t, S)                        one countdown step from scene params: {codes, name, value, unit, rank, sub, at, fmt}
//   flagRow(codes, cy, t, t0, o)         1-3 flags side by side, springing in, floating
//   faceoff(t, t0, L, R, o)              two flags with values and bars; the bigger one gets the crown
//   clocks(n, t, t0, y, o)               n small clock rings sweeping (time zones)
//   srcLine(str)                         the data source, small, above the caption zone (bible: every chart shows its source)
"use strict";
const LF = { bg0: "#0b1430", bg1: "#1d2d5c", ink: "#0b1020", fg: "#f4f1ea", gold: "#f4b942", red: "#e63946", blue: "#4aa3df", grid: "rgba(120,160,255,0.16)" };
function rankBG(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.bg0 || LF.bg0); g.addColorStop(1, o.bg1 || LF.bg1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // a floor grid in perspective that slides toward the viewer
  ctx.save(); ctx.strokeStyle = LF.grid; ctx.lineWidth = 2; const hz = 1080, vx = W / 2 + Math.sin(t * 0.3) * 60;
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(vx + i * 30, hz); ctx.lineTo(W / 2 + i * 260, H + 40); ctx.stroke(); }
  for (let k = 0; k < 10; k++) { const z = ((k / 10) + t * 0.12) % 1, y = hz + (H - hz) * z * z; ctx.globalAlpha = z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
  // particles drifting up
  for (let i = 0; i < 40; i++) { const k = (t * (0.03 + rnd(i, 2) * 0.05) + rnd(i, 3)) % 1, x = rnd(i, 1) * W + Math.sin(t * 0.8 + i) * 20, y = H - k * H * 1.1, r = 1.5 + rnd(i, 4) * 3.5;
    ctx.fillStyle = `rgba(190,210,255,${0.5 * Math.sin(k * Math.PI)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  const v = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.25, W / 2, H * 0.42, H * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,10,0.55)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function flagRow(codes, cy, t, t0, o = {}) {
  const n = codes.length, w = o.w || [520, 380, 290, 230][n - 1], gap = 40, tot = n * w + (n - 1) * gap;
  codes.forEach((c, i) => {
    const k = kSpring(kpp(t, t0 + i * 0.12, 0.6)); if (k <= 0) return;
    const x = W / 2 - tot / 2 + i * (w + gap) + w / 2, fy = cy + Math.sin(t * 1.6 + i) * 10, h = w * 0.62;
    ctx.save(); ctx.translate(x, fy); ctx.rotate(Math.sin(t * 1.1 + i * 2) * 0.025); ctx.scale(k, k);
    softHalo(0, 0, w * 0.9, o.halo || LF.blue, 0.28);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 18; ctx.fillStyle = "#000"; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    flagArt(c, -w / 2, -h / 2, w, h, { lw: 5 });
    // a sheen that sweeps across once
    const sw = kpp(t, t0 + 0.3 + i * 0.12, 0.9); if (sw > 0 && sw < 1) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); const sx = lerp(-w, w, sw); const gg = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0); gg.addColorStop(0, "rgba(255,255,255,0)"); gg.addColorStop(0.5, "rgba(255,255,255,0.45)"); gg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = gg; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore(); }
    ctx.restore();
    if (o.labels) kText(o.labels[i], x, fy + h / 2 + 70, o.labelSize || 52, t, t0 + 0.25 + i * 0.12, { color: LF.fg, stroke: 10, ink: LF.ink });
  });
}
function rankChip(rank, t, t0, y = 330) {
  const k = kSpring(kpp(t, t0, 0.5)); if (k <= 0) return;
  ctx.save(); ctx.translate(W / 2 - 70, y); ctx.scale(k, k);
  const col = { 1: LF.gold, 2: "#c9d1d9", 3: "#d08a4e" }[rank] || LF.blue;
  ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = LF.ink; ctx.stroke();
  text("#" + rank, 0, 26, { size: 76, color: LF.ink });
  ctx.restore();
}
function lfEntry(t, S) {
  const p = S.p, t0 = cue(p.at) - 0.15;
  rankBG(t);
  if (p.rank) rankChip(p.rank, t, t0 - 0.1);
  flagRow(p.codes, 660, t, t0, { halo: p.rank === 1 ? LF.gold : LF.blue });
  if (p.name) kText(p.name.toUpperCase(), W / 2 - 70, 1000, p.nameSize || 84, t, t0 + 0.2, { color: LF.fg, stroke: 12, ink: LF.ink, ls: 2 });
  if (p.value != null) {
    const tv = cue(p.valueAt || p.at) - 0.1, k = eout(kpp(t, tv, 0.8)), v = typeof p.value === "number" ? p.value * k : p.value;
    if (t > tv) {
      const unit = p.unit ? " " + p.unit : "", size = p.valueSize || 130;
      ctx.save(); ctx.font = `${size}px Anton`; const uw = unit ? measure(unit, size * 0.55) : 0; ctx.restore();
      const x = W / 2 - 70 - uw / 2;
      rollNumber(v, x, 1170, size, { color: p.rank === 1 ? LF.gold : LF.fg, stroke: 12, ink: LF.ink, fmt: p.fmt ? (u => p.fmt.replace("#", Math.round(u).toLocaleString("en-US"))) : (u => Math.round(u).toLocaleString("en-US")), roll: false });
      if (unit) { ctx.save(); ctx.font = `${size}px Anton`; const vw = ctx.measureText(p.fmt ? p.fmt.replace("#", Math.round(p.value).toLocaleString("en-US")) : Math.round(p.value).toLocaleString("en-US")).width; ctx.restore(); kText(unit.trim(), x + vw / 2 + 16, 1170, size * 0.55, t, tv + 0.3, { align: "left", color: LF.blue, stroke: 8, ink: LF.ink }); }
    }
  }
  if (p.sub) kText(p.sub, W / 2 - 70, 1235, 30, t, t0 + 0.5, { color: "rgba(244,241,234,0.75)", font: "Elite", stagger: 0.01 });
  if (p.clocks) clocks(p.clocks, t, cue(p.valueAt || p.at) - 0.1, 445, { per: 12, r: 30 });
  if (p.source) srcLine(p.source);
}
function srcLine(str) { text("Source: " + str, W / 2 - 70, H - 450, { size: 24, font: "Elite", color: "rgba(244,241,234,0.6)" }); }
function faceoff(t, t0, L, R, o = {}) {
  const max = Math.max(L.value, R.value), k = eout(kpp(t, t0 + 0.4, 1.0));
  [[L, 270], [R, 690]].forEach(([s, x], i) => {
    const kk = kSpring(kpp(t, t0 + i * 0.15, 0.6)); if (kk <= 0) return;
    const w = 300, h = w * 0.62, fy = 470 + Math.sin(t * 1.5 + i) * 8;
    ctx.save(); ctx.translate(x, fy); ctx.scale(kk, kk); softHalo(0, 0, 280, s.value === max ? LF.gold : LF.blue, 0.3);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 14; ctx.fillStyle = "#000"; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    flagArt(s.code, -w / 2, -h / 2, w, h, { lw: 5 }); ctx.restore();
    kText(s.name.toUpperCase(), x, 690, s.name.length > 10 ? 50 : 62, t, t0 + 0.2 + i * 0.15, { color: LF.fg, stroke: 10, ink: LF.ink });
    // the bar grows up from the floor line
    const bh = 380 * (s.value / max) * k, by = 1180;
    ctx.save(); const gg = ctx.createLinearGradient(0, by - bh, 0, by); gg.addColorStop(0, s.value === max ? LF.gold : LF.blue); gg.addColorStop(1, hexA(s.value === max ? LF.gold : LF.blue, 0.4));
    ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(x - 90, by - bh, 180, bh, [18, 18, 0, 0]); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = LF.ink; ctx.stroke(); ctx.restore();
    if (k > 0) rollNumber(s.value * k, x, by - bh - 24, 64, { color: LF.fg, stroke: 9, ink: LF.ink, fmt: o.fmt || (v => "$" + (v / 1e6).toFixed(2) + "T"), roll: false });
  });
  const tw = t0 + 1.5; if (t > tw && o.crown !== false) { const win = L.value >= R.value ? 270 : 690, kk = kSpring(kpp(t, tw, 0.5)); ctx.save(); ctx.translate(win, 330); ctx.scale(kk, kk); text("👑", 0, 0, { size: 90 }); ctx.restore(); }
  line(60, 1180, W - 60, 1180, "rgba(244,241,234,0.5)", 4);
}
function clocks(n, t, t0, y, o = {}) {
  const per = o.per || 6, r = o.r || 62, gapX = Math.min((W - 220) / per, r * 2.6);
  for (let i = 0; i < n; i++) {
    const k = kSpring(kpp(t, t0 + i * 0.08, 0.4)); if (k <= 0) continue;
    const inRow = Math.min(per, n - Math.floor(i / per) * per), x = W / 2 - 70 - (inRow - 1) * gapX / 2 + (i % per) * gapX, yy = y + Math.floor(i / per) * (r * 2 + 30), off = (o.offsets ? o.offsets[i] : i) / 24;
    ctx.save(); ctx.translate(x, yy); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = "#f4f1ea"; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = LF.ink; ctx.stroke();
    const a = (t * 0.25 + off) * 6.283 - Math.PI / 2; line(0, 0, Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75, LF.ink, 6);
    const b = (t * 0.02 + off) * 6.283 - Math.PI / 2; line(0, 0, Math.cos(b) * r * 0.5, Math.sin(b) * r * 0.5, LF.red, 7);
    ctx.restore();
  }
}

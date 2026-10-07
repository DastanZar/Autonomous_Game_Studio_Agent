// Body kit (Gut Gang): flat-cast props for custom scenes, in the same 8 px ink, crescent-shade style as the cast
// (studio/engine/scenes/cast.js). Load with "kits": ["body", "kinetic"]. Every function is a pure function of t.
//
//   castAt(kind, x, s, t, o)       one cast member standing on the GROUND line (o: mood, arms, flip, look, walk)
//   stageTitle(str, t, t0, y)      a bouncing Anton title in the spotlight style
//   gumBlob(x, y, s, t, o)         a pink chewing-gum character (o.mood, o.sparkle 0..1 = sweeteners leaving)
//   sandwich(x, y, s, t)           a lunch sandwich
//   phBar(t, t0, lo, hi, y)        the 0-14 pH scale; a marker slides into the lo..hi band
//   meter(x, y, r, pct, t, t0, col, label)  a ring that fills to pct with the number in the middle
//   clockRing(x, y, r, k, label)   a clock face sweeping k (0..1) of a turn
//   jug(x, y, s, fill, label)      a measuring jug filling to fill (0..1)
//   tube(pts, w, col, t, flow)     a thick gut tube along points, with a flow of chyme dots
"use strict";
function castAt(kind, x, s, t, o = {}) { char(kind, x, o.gy ?? GROUND, s, Object.assign({ t, seed: o.seed ?? 3, mood: o.mood, talk: 0, look: o.look || [0, 0], arms: o.arms || "rest", kind: o.mkind || "coccus", beat: kind === "heart" }, o)); }
function stageTitle(str, t, t0, y = 400, size = 130) {
  const k = popK(t, t0); if (k <= 0) return;
  ctx.save(); ctx.translate((W - SAFE.right) / 2, y); const b = (1 + Math.sin(t * 4) * 0.03) * k; ctx.scale(b, b);
  const f = fit(String(str).toUpperCase(), W - SAFE.right - 140, size, 2, "Anton", "title");
  f.lines.forEach((l, j) => text(l, 0, (j - (f.lines.length - 1) / 2) * f.size * 1.05 + f.size * 0.36, { size: f.size, color: "#fff", stroke: 20, ink: BC.ink }));
  ctx.restore();
}
function popK(t, t0, d = 0.45) { const k = clamp((t - t0) / d); return k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-5.5 * k) * Math.cos(4.2 * Math.PI * k); }
function gumBlob(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * 6); ctx.scale(s, s); ctx.rotate(Math.sin(t * 2.2) * 0.06);
  const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = 1 + 0.08 * Math.sin(a * 3 + t * 2); pts.push([Math.cos(a) * 120 * r, Math.sin(a) * 90 * r]); }
  part(() => smooth(pts), "#f59ac0", { hlAt: [-50, -40, 26] });
  strokePath(() => { ctx.moveTo(-60, 30); ctx.quadraticCurveTo(-10, 60, 40, 34); }, shade("#f59ac0", -0.2), 5);
  castFace({ x: 0, y: -14, sz: 46, mood: o.mood || "happy", look: o.look || [0, 0], blink: castBlinkAt(t, 9), talk: 0, body: "#f59ac0" });
  if (o.sparkle > 0) for (let i = 0; i < 8; i++) { const a = (o.sparkle * 1.4 + i / 8) % 1; withAlpha(1 - a, () => text("✦", Math.cos(i * 0.8) * (130 + a * 160), -60 - a * 220 + Math.sin(i) * 40, { size: 40, color: BC.sun })); }
  ctx.restore();
}
function sandwich(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.6) * 5); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.8) * 0.05);
  const slab = (yy, h, col, wob) => part(() => { ctx.moveTo(-170, yy); for (let i = 0; i <= 10; i++) ctx.lineTo(-170 + i * 34, yy - (wob ? Math.abs(Math.sin(i * 1.7)) * 12 : 0)); ctx.lineTo(170, yy + h); ctx.lineTo(-170, yy + h); ctx.closePath(); }, col, { hl: false, lw: 6 });
  part(() => ctx.roundRect(-180, 30, 360, 60, 26), "#e9b36a", { hlAt: [-100, 45, 14] });
  slab(16, 22, "#7fc85a", true); slab(0, 22, "#e0533f", false); slab(-14, 18, "#ffd65c", false);
  part(() => { ctx.moveTo(-180, -10); ctx.bezierCurveTo(-180, -110, 180, -110, 180, -10); ctx.closePath(); }, "#eaa95c", { hlAt: [-60, -70, 20] });
  for (let i = 0; i < 6; i++) { ctx.fillStyle = "#fff3d6"; ctx.beginPath(); ctx.ellipse(-90 + i * 36, -60 + (i % 2) * 14, 7, 4, 0.4, 0, 7); ctx.fill(); }
  ctx.restore();
}
function phBar(t, t0, lo, hi, y = 560) {
  const k = clamp((t - t0) / 0.5); if (k <= 0) return;
  const x0 = 80, x1 = W - SAFE.right - 40, w = x1 - x0, cols = ["#e0333d", "#ef5a37", "#f6863a", "#f9b13e", "#f7d640", "#c8dc45", "#8fd14f", "#54c46b", "#3cb59a", "#3c9fc0", "#4a7fd0", "#5b62c9", "#6a4cb9", "#6b3aa0"];
  withAlpha(k, () => {
    cols.forEach((c, i) => part(() => ctx.roundRect(x0 + i * w / 14, y, w / 14 - 4, 90, 14), c, { hl: false, lw: 5 }));
    for (const v of [0, 7, 14]) text(String(v), x0 + v * w / 14 + (v === 14 ? -20 : v ? 0 : 20), y + 150, { size: 46, color: "#fff", stroke: 10, ink: BC.ink });
    text("ACID", x0 + 70, y - 30, { size: 44, color: "#fff", stroke: 10, ink: BC.ink }); text("BASE", x1 - 70, y - 30, { size: 44, color: "#fff", stroke: 10, ink: BC.ink });
  });
  const m = eio(clamp((t - t0 - 0.4) / 0.9)), xa = x0 + lerp(7, lo, m) * w / 14, xb = x0 + lerp(7, hi, m) * w / 14;
  if (m > 0) { ctx.save(); ctx.lineWidth = 10; ctx.strokeStyle = BC.ink; ctx.beginPath(); ctx.roundRect(xa - 8, y - 14, xb - xa + 16, 118, 22); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = "#fff"; ctx.stroke(); ctx.restore(); }
}
function meter(x, y, r, pct, t, t0, col, label) {
  const k = popK(t, t0); if (k <= 0) return;
  const f = eout(clamp((t - t0 - 0.15) / 0.9)) * pct / 100;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  part(() => ctx.arc(0, 0, r, 0, 7), "#2b2450", { hl: false, lw: 7 });
  ctx.save(); ctx.lineCap = "round"; ctx.lineWidth = r * 0.28; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, -Math.PI / 2, -Math.PI / 2 + f * 6.283); ctx.stroke(); ctx.restore();
  text(Math.round(f * 100) + "%", 0, r * 0.18, { size: r * 0.55, color: "#fff", stroke: 8, ink: BC.ink });
  text(label, 0, r + 70, { size: 46, color: "#fff", stroke: 10, ink: BC.ink });
  ctx.restore();
}
function clockRing(x, y, r, k, label) {
  part(() => ctx.arc(x, y, r, 0, 7), "#fffdf6", { hl: false, lw: 8 });
  ctx.save(); ctx.fillStyle = "rgba(255,204,77,0.75)"; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 12, -Math.PI / 2, -Math.PI / 2 + clamp(k) * 6.283); ctx.closePath(); ctx.fill(); ctx.restore();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92, BC.ink, 6); }
  const a = -Math.PI / 2 + k * 6.283; line(x, y, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, BC.ink, 10);
  if (label) text(label, x, y + r + 80, { size: 60, color: "#fff", stroke: 12, ink: BC.ink });
}
function jug(x, y, s, fill, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = () => { ctx.moveTo(-120, -300); ctx.lineTo(120, -300); ctx.lineTo(140, 0); ctx.lineTo(-140, 0); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip(); const h = 300 * clamp(fill); ctx.fillStyle = "#c8f05a"; ctx.fillRect(-150, -h, 300, h + 4);
  for (let i = 0; i < 6; i++) { const yy = -h + 20 + ((T * 60 + i * 50) % Math.max(1, h)); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(-80 + i * 32, -yy + -h * 0 + 0, 8, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); body(); ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = BC.ink; ctx.stroke(); ctx.restore();
  strokePath(() => { ctx.moveTo(122, -250); ctx.quadraticCurveTo(210, -200, 136, -90); }, BC.ink, 12);
  for (let i = 1; i < 4; i++) line(-120 + i * 2, -i * 75, -70, -i * 75, BC.ink, 6);
  if (label) text(label, 0, 90, { size: 54, color: "#fff", stroke: 12, ink: BC.ink });
  ctx.restore();
}
function tube(pts, w, col, t, flow = 1) {
  const path = () => { ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2); ctx.lineTo(...pts[pts.length - 1]); };
  strokePath(path, BC.ink, w + 16); strokePath(path, col, w); strokePath(path, shade(col, 0.25), w * 0.3);
  if (flow) { ctx.save(); ctx.setLineDash([18, 70]); ctx.lineDashOffset = -t * 160 * flow; ctx.lineCap = "round"; ctx.lineWidth = w * 0.35; ctx.strokeStyle = "#e9b36a"; ctx.beginPath(); path(); ctx.stroke(); ctx.restore(); }
}

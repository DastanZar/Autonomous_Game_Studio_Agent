// Map scene types: map_focus and map_route. Geometry comes only from build/geo.json (studio/tools/geo.py):
// Natural Earth countries, plus OpenStreetMap boundaries where the storyboard asked for detail.
"use strict";

const GEO = (EP.geo && EP.geo.scenes) || {};
const HL_COLORS = () => [P.orange, P.green, P.yellow, P.navy];
const FRAME = { x: 40, y: STAGE.y, w: W - 80, h: STAGE.h };

function mapView(region) {
  const [w, s, e, n] = region;
  const k = Math.cos(((s + n) / 2) * Math.PI / 180);
  const sx = (FRAME.w - 40) / ((e - w) * k), sy = (FRAME.h - 40) / (n - s);
  const sc = Math.min(sx, sy), cx = (w + e) / 2, cy = (s + n) / 2;
  return { proj: (lon, lat) => [(lon - cx) * k * sc, -(lat - cy) * sc], sc };
}
// the first scene of a run of map scenes on the same region: zoom and pins accumulate across the run
function chainStart(S) { let a = S; while (a.prev && a.prev.type.startsWith("map_") && JSON.stringify(a.prev.p.region) === JSON.stringify(S.p.region)) a = a.prev; return a; }

function ringPath(polys, proj) {
  for (const poly of polys) for (const ring of poly) {
    ring.forEach(([lo, la], j) => { const p = proj(lo, la); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.closePath();
  }
}
function pin(x, y, k, c, label) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y - (1 - Math.min(1, k)) * 60);
  cut(() => { ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -34, -26, -64, 0, -66); ctx.bezierCurveTo(26, -64, 26, -34, 0, 0); ctx.closePath(); }, c, { lw: 4 });
  cut(() => ctx.arc(0, -46, 9, 0, 7), P.card, { lw: 3, shadow: false });
  ctx.restore();
  if (label) tag(label, x, y - 118, { size: 34, k: Math.min(1, k) });
}

function drawMap(t, S, overlay) {
  paperBG(P.paper);
  const g = GEO[S.id];
  if (!g) { warn(`map scene ${S.id}: no geometry in build/geo.json (run studio/tools/geo.py)`); text("NO MAP DATA", W / 2, H / 2, { size: 80 }); return; }
  const C = chainStart(S);
  const view = mapView(g.region);
  const zin = C.prev ? 1 - eout(prog(t, C.t0, C.t0 + 0.9)) : 0;
  const z = 1 - 0.14 * zin + 0.03 * prog(t, C.t0, C.t1 + 6);
  let hl = S.p.highlight;
  for (let a = S.prev; !hl && a && a.type.startsWith("map_"); a = a.prev) hl = a.p.highlight;
  for (let a = S.next; !hl && a && a.type.startsWith("map_"); a = a.next) hl = a.p.highlight;
  hl = hl || [];
  const colorOf = iso => hl.includes(iso) ? HL_COLORS()[hl.indexOf(iso) % 4] : P.land;
  // frame: a clipping of a map glued onto the page
  ctx.save(); ctx.translate(FRAME.x + FRAME.w / 2, FRAME.y + FRAME.h / 2); ctx.rotate(-0.012);
  cut(() => ctx.rect(-FRAME.w / 2, -FRAME.h / 2, FRAME.w, FRAME.h), P.sea, { lw: 6, sx: 9, sy: 12, sb: 12 });
  ctx.save(); ctx.beginPath(); ctx.rect(-FRAME.w / 2, -FRAME.h / 2, FRAME.w, FRAME.h); ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 3;
  for (let y = -FRAME.h / 2; y < FRAME.h / 2; y += 26) { ctx.beginPath(); ctx.moveTo(-FRAME.w / 2, y); ctx.lineTo(FRAME.w / 2, y + 10); ctx.stroke(); }
  ctx.scale(z, z);
  for (const L of g.layers) {
    const isHL = hl.includes(L.iso);
    cut(() => ringPath(L.polys, view.proj), colorOf(L.iso), { lw: L.src === "osm" ? 2.5 : 3.5, rule: "evenodd", shadow: isHL && L.src === "ne", sx: 3, sy: 4, sb: 4 });
  }
  const labelsK = pop(t, C.t0 + 0.35, 0.35), placed = [];
  for (const L of g.layers) if (L.label && hl.includes(L.iso) && L.src === "ne") {
    let [x, y] = view.proj(...L.label);
    const lw = measure(L.name.toUpperCase(), 46) / z, lh = 60 / z;
    for (let tries = 0; tries < 12 && placed.some(r => Math.abs(r[0] - x) < (r[2] + lw) / 2 && Math.abs(r[1] - y) < (r[3] + lh) / 2); tries++) y += lh;
    placed.push([x, y, lw, lh]);
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / z, 1 / z);
    if (labelsK > 0) { ctx.save(); ctx.scale(Math.min(1, labelsK), Math.min(1, labelsK)); text(L.name.toUpperCase(), 0, 0, { size: 46, color: P.white, stroke: 10 }); ctx.restore(); }
    ctx.restore();
  }
  // pins from earlier scenes of the same run stay, small and unlabelled
  for (let a = C; a && a !== S; a = a.next) (a.p.pins || []).forEach(p => { const [x, y] = view.proj(p.lon, p.lat); ctx.save(); ctx.translate(x, y); ctx.scale(0.6 / z, 0.6 / z); pin(0, 0, 1, P.steel2, null); ctx.restore(); });
  if (overlay) overlay(view, z);
  const banners = [];
  (S.p.pins || []).forEach((p, i) => {
    const at = p.at ? cue(p.at) : S.t0 + 0.3 + i * 0.3;
    const [x, y] = view.proj(p.lon, p.lat);
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / z, 1 / z); pin(0, 0, pop(t, at, 0.4), P.red, null); ctx.restore();
    if (p.label) banners.push({ label: String(p.label), at, x: x * z, y: (y - 46 / z) * z });
  });
  ctx.restore();
  // pin labels: a banner along the top of the map with a leader line to the pin, so they never cover the map's own labels
  banners.forEach((b, i) => {
    const k = pop(t, b.at + 0.15, 0.3);
    if (k <= 0) return;
    const by = -FRAME.h / 2 + 70 + i * 80;
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(clamp(b.x, -FRAME.w / 2 + 60, FRAME.w / 2 - 60), by + 24); ctx.lineTo(b.x, lerp(by + 24, b.y, Math.min(1, k))); ctx.stroke(); ctx.restore();
    tag(b.label, 0, by, { size: 42, k, bg: P.yellow });
  });
  if (g.osm) text("© OpenStreetMap contributors", FRAME.w / 2 - 16, FRAME.h / 2 - 16, { size: 26, font: "Elite", align: "right", color: P.ink });
  ctx.restore();
}

SCENE_FNS.map_focus = (t, S) => drawMap(t, S);
SC.forEach(S => { if (S.type === "map_route") S.landAt = evT(S, "draw", S.t0 + 0.3) + 1.8; });

SCENE_FNS.map_route = (t, S) => drawMap(t, S, (view, z) => {
  const pts = (S.p.path || []).map(([lo, la]) => view.proj(lo, la));
  if (pts.length < 2) return;
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const t0 = evT(S, "draw", S.t0 + 0.3), k = eio(prog(t, t0, t0 + 1.2)) * total;
  if (k <= 0) return;
  let left = k; const drawn = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const f = Math.min(1, left / segs[i]);
    drawn.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
    left -= segs[i];
  }
  ctx.save(); ctx.lineWidth = 16 / z; ctx.strokeStyle = P.ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); drawn.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
  ctx.lineWidth = 9 / z; ctx.strokeStyle = P.red; ctx.setLineDash([26 / z, 16 / z]); ctx.stroke(); ctx.restore();
  const end = drawn[drawn.length - 1];
  ctx.save(); ctx.translate(...end); ctx.scale(1 / z, 1 / z); cut(() => ctx.arc(0, 0, 12, 0, 7), P.red, { lw: 4, shadow: false }); ctx.restore();
  if (S.p.label) {
    const mid = pts[Math.floor(pts.length / 2)];
    const kl = pop(t, t0 + 0.5, 0.3);
    if (kl > 0) { ctx.save(); ctx.translate(mid[0], mid[1]); ctx.scale(1 / z, 1 / z); tag(String(S.p.label), 0, -80, { size: 36, k: kl, bg: P.yellow }); ctx.restore(); }
  }
});

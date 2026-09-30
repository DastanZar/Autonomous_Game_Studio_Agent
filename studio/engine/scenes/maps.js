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

function drawMap(t, S, overlay, hud) {
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
  if (hud) hud(t);
  ctx.restore();
}

// ---------- map_history: territories recolour / morph between dated snapshots ----------
// geo.json: scene.history.snapshots[i] = {date, approximate, territories: [{key, name, color, polys, label, morph}]}
// (morph = equal-length resampled rings toward the next snapshot, made by geo.py). Transition times are storyboard cues
// (snapshots[i].at); a transition lasts HIST_TR seconds. Text stays left of the right safe zone (frame right edge minus SAFE.right).
const HIST_TR = 1.5;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function mixColor(a, b, k) {
  const pa = col(a), pb = col(b), h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const x = h(pa), y = h(pb);
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], k)).toString(16).padStart(2, "0")).join("");
}
function parseDate(d) {   // "1846-08-22" | "1849" | "1823-07" -> {y, m, d}
  const m = /^(-?\d+)(?:-(\d\d))?(?:-(\d\d))?$/.exec(String(d));
  return m ? { y: +m[1], m: m[2] ? +m[2] : 0, d: m[3] ? +m[3] : 0 } : { y: 0, m: 0, d: 0 };
}
function dateLabel(d) { const p = parseDate(d); return p.m ? (p.d ? p.d + " " : "") + MONTHS[p.m - 1] + " " + p.y : String(p.y); }
function histState(t, S) {
  const snaps = (((GEO[S.id] || {}).history) || {}).snapshots || [];
  const ats = (S.p.snapshots || []).map((s, i) => i ? cue(s.at) : S.t0);
  let j = 0; ats.forEach((a, i) => { if (i && t >= a) j = i; });
  const k = j ? eio(prog(t, ats[j], ats[j] + HIST_TR)) : 0;
  return { snaps, j, k, ats };
}
function ringsMix(pairs, k) {   // interpolated exteriors of matched polygon pairs
  return pairs.map(pr => pr.a.map((p, i) => [lerp(p[0], pr.b[i][0], k), lerp(p[1], pr.b[i][1], k)]));
}
function drawTerritory(proj, T, colr, alpha, sub) {
  cut(() => ringPath(T.polys, proj), colr, { lw: 4, rule: "evenodd", alpha, sx: 3, sy: 4, sb: 4, ...(sub || {}) });
}
SC.forEach(S => { if (S.type === "map_history") S.landAt = Math.max(...(S.p.snapshots || []).map((s, i) => i ? cue(s.at) + HIST_TR : S.t0)) + 0.7; });
SCENE_FNS.map_history = (t, S) => {
  if (!(S.p.snapshots || []).length) { warn(`map_history ${S.id}: no snapshots`); }
  const { snaps, j, k } = histState(t, S);
  drawMap(t, S, (view, z) => {
    if (!snaps.length) return;
    const P2 = view.proj, cur = snaps[j], prv = j ? snaps[j - 1] : null;
    const labels = [];
    const shape = (ringsList, colr, alpha) => cut(() => { for (const ring of ringsList) { ring.forEach(([lo, la], i) => { const p = P2(lo, la); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); } }, colr, { lw: 4, alpha, sx: 3, sy: 4, sb: 4 });
    if (!prv || k >= 1) {
      cur.territories.forEach(T => { drawTerritory(P2, T, col(T.color), 1); if (T.label) labels.push([T.name, T.label, 1]); });
    } else {
      const keysNow = new Set(cur.territories.map(T => T.key));
      prv.territories.forEach(T => {
        const nx = cur.territories.find(N => N.key === T.key);
        if (!nx || !T.morph) { drawTerritory(P2, T, col(T.color), 1 - k); if (T.label) labels.push([T.name, T.label, 1 - k]); return; }
        const colr = mixColor(T.color, nx.color, k), m = T.morph;
        const usedA = new Set(m.pairs.map(p => p.ia)), usedB = new Set(m.pairs.map(p => p.ib));
        m.a_polys.forEach((r, i) => { if (!usedA.has(i)) shape([r[0]], colr, 1 - k); });
        m.b_polys.forEach((r, i) => { if (!usedB.has(i)) shape([r[0]], colr, k); });
        ringsMix(m.pairs, k).forEach(r => shape([r], colr, 1));
        const la = T.label || nx.label, lb = nx.label || T.label;
        if (la && lb) labels.push([nx.name, [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k)], 1]);
      });
      cur.territories.forEach(N => { if (!prv.territories.some(T => T.key === N.key)) { drawTerritory(P2, N, col(N.color), k); if (N.label) labels.push([N.name, N.label, k]); } });
    }
    labels.forEach(([name, lp, a]) => {
      if (a <= 0.02) return;
      const [x, y] = P2(...lp);
      ctx.save(); ctx.translate(x, y); ctx.scale(1 / z, 1 / z); ctx.globalAlpha *= a;
      text(name, 0, 0, { size: 46, color: P.white, stroke: 10 });
      ctx.restore();
    });
  }, tt => {
    // HUD in frame coordinates: year counter (top-left), exact date, approximate label, credit (bottom-left)
    const { snaps: sn, j: jj, k: kk } = histState(tt, S);
    if (!sn.length) return;
    const a = sn[jj ? jj - 1 : 0], b = sn[jj || 0];
    const ya = parseDate(a.date).y, yb = parseDate(b.date).y;
    const yr = jj ? Math.round(lerp(ya, yb, kk)) : ya;
    const shown = kk >= 0.5 && jj ? b : a;
    const left = -FRAME.w / 2 + 30, bot = FRAME.h / 2 - 50;   // bottom-left corner: open sea in most maps, clear of the right safe zone
    const pulse = jj && kk > 0 && kk < 1 ? 1 + 0.06 * Math.sin(kk * Math.PI) : 1;
    ctx.save(); ctx.translate(left + 150, bot - 100); ctx.scale(pulse, pulse); ctx.rotate(-0.02);
    cut(() => ctx.rect(-150, -100, 300, 200), P.card, { lw: 5 });
    text(String(yr), 0, 22, { size: 130, color: P.red, stroke: 0 });
    const dl = dateLabel(shown.date);
    if (dl !== String(yr) && kk % 1 === 0) text(dl, 0, 76, { size: 30, font: "Elite", color: P.ink });
    ctx.restore();
    if (sn.some(s => s.approximate) && (shown.approximate || kk > 0 && kk < 1 && (a.approximate || b.approximate))) tag("APPROXIMATE BORDERS", left, bot - 235, { size: 30, align: "left", bg: P.yellow, rot: 0.01 });
    text("Historical borders: OpenHistoricalMap contributors", left, FRAME.h / 2 - 18, { size: 24, font: "Elite", align: "left", color: P.ink });
  });
};

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

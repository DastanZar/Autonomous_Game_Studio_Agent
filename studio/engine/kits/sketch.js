// Sketch kit: the "drawn while you watch" format. One sheet of paper on a desk; every beat is drawn into its own
// part of the page by a hand holding a pencil; the camera pans across the page and pulls back at the end to show the
// whole sheet. Load with storyboard.json "kits": ["sketch"] and theme "sketch".
//
// An episode's scenes.js builds the page once, at load, from items keyed to spoken words:
//   const it = SK.item("hook/bill", 1.2);         // starts on the word, drawn over 1.2 s
//   it.text("YOUR POWER BILL", 120, 200, { font: "Marker", size: 96 });
//   it.rect(...); it.circle(...); it.line(...); it.curve([...]); it.hatch(poly, { c: "red" }); it.dot(...)
//   SK.done();                                   // after the last item: timing, sound cues
// and every storyboard scene is { type: "custom", params: { fn: "page", cam: [x, y, w, h] } } (world units).
// The hand follows the stroke being drawn; between items it travels, or leaves the frame on a long pause.
// Frames are pure functions of t: all wobble comes from rnd() seeds fixed when the page is built.
"use strict";
const SK = (() => {
  const items = [];
  const page = { w: 2200, h: 5560 };
  const pc = k => (k && P[k]) || k || P.ink;
  const n1 = (s, seed) => { const i = Math.floor(s), f = s - i, u = f * f * (3 - 2 * f); return lerp(rnd(i, seed, 5), rnd(i + 1, seed, 5), u) * 2 - 1; };
  const at = a => typeof a === "number" ? a : cue(a);
  const PACE = EP.storyboard.pace || 1;      // >1 draws slower (user 2026-10-07: 'a tinge bit too fast')

  // ---------- geometry ----------
  function resample(pts, step) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / step));
      for (let j = 1; j <= n; j++) out.push([lerp(x0, x1, j / n), lerp(y0, y1, j / n)]);
    }
    return out;
  }
  function withLengths(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, len: L[L.length - 1] }; }
  // a hand-drawn line: low-frequency drift across the stroke, a little tremor, a small overshoot at both ends
  function wobble(pts, seed, amp, over = 4) {
    if (pts.length >= 2 && over) {
      const [a, b] = [pts[0], pts[1]], [c, d] = [pts[pts.length - 2], pts[pts.length - 1]];
      const da = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, dc = Math.hypot(d[0] - c[0], d[1] - c[1]) || 1;
      pts = [[a[0] - (b[0] - a[0]) / da * over, a[1] - (b[1] - a[1]) / da * over], ...pts, [d[0] + (d[0] - c[0]) / dc * over, d[1] + (d[1] - c[1]) / dc * over]];
    }
    const r = resample(pts, 7);
    let s = 0;
    return r.map((p, i) => {
      if (i) s += Math.hypot(p[0] - r[i - 1][0], p[1] - r[i - 1][1]);
      const q = r[Math.min(r.length - 1, i + 1)], o = r[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], dl = Math.hypot(dx, dy) || 1;
      const off = amp * (n1(s / 90, seed) + 0.35 * n1(s / 16, seed + 3));
      return [p[0] - dy / dl * off, p[1] + dx / dl * off];
    });
  }
  function catmull(pts, seg = 10) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < seg; j++) {
        const u = j / seg, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // scanline hatching: parallel strokes at an angle, clipped to the polygon, drawn back and forth like a pencil
  function hatchLines(poly, ang, gap, seed) {
    const ca = Math.cos(-ang), sa = Math.sin(-ang), rot = ([x, y]) => [x * ca - y * sa, x * sa + y * ca];
    const ci = Math.cos(ang), si = Math.sin(ang), unrot = ([x, y]) => [x * ci - y * si, x * si + y * ci];
    const R = poly.map(rot), ys = R.map(p => p[1]), lines = [];
    let flip = false;
    for (let y = Math.min(...ys) + gap * 0.5; y < Math.max(...ys); y += gap) {
      const xs = [];
      for (let i = 0; i < R.length; i++) {
        const [x0, y0] = R[i], [x1, y1] = R[(i + 1) % R.length];
        if ((y0 <= y) !== (y1 <= y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const j = lines.length, e1 = (rnd(j, seed, 1) - 0.4) * 6, e2 = (rnd(j, seed, 2) - 0.4) * 6, yy = y + (rnd(j, seed, 3) - 0.5) * gap * 0.35;
        let a = [xs[k] - e1, yy], b = [xs[k + 1] + e2, yy + (rnd(j, seed, 4) - 0.5) * gap * 0.5];
        if (b[0] - a[0] < 3) continue;
        if (flip) [a, b] = [b, a];
        flip = !flip;
        lines.push(withLengths(wobble([unrot(a), unrot(b)], seed * 31 + j, 0.8, 0)));
      }
    }
    return lines;
  }

  // ---------- items ----------
  function item(start, dur, o = {}) {
    const it = { t0: at(start), dur: dur * PACE, ops: [], seed: 101 + items.length * 13, sfx: o.sfx !== false };
    items.push(it);
    const add = op => { op.seed = it.seed * 50 + it.ops.length; it.ops.push(op); return api; };
    const stroke = (pts, so = {}) => {
      const seed = it.seed * 50 + it.ops.length, amp = so.amp ?? 1.6;
      const main = withLengths(wobble(pts, seed, amp, so.over ?? 4));
      const ghost = so.ghost === false ? null : withLengths(wobble(pts, seed + 7, amp * 1.4, (so.over ?? 4) * 0.6));
      return add({ kind: "line", main, ghost, c: so.c || "ink", w: so.w || 5, dash: so.dash || null, alpha: so.alpha ?? 0.95, len: main.len });
    };
    const api = {
      it,
      line: (x1, y1, x2, y2, so) => stroke([[x1, y1], [x2, y2]], so),
      poly: (pts, so = {}) => stroke(so.closed ? [...pts, pts[0], pts[1] ? [lerp(pts[0][0], pts[1][0], 0.12), lerp(pts[0][1], pts[1][1], 0.12)] : pts[0]] : pts, so),
      curve: (pts, so) => stroke(catmull(pts), so),
      rect: (x, y, w, h, so) => api.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Object.assign({ closed: true }, so)),
      circle: (cx, cy, r, so = {}) => {
        const a0 = rnd(it.seed, it.ops.length, 9) * 6.28, n = Math.max(18, Math.round(r / 5)), ry = so.ry || r, pts = [];
        for (let i = 0; i <= n * 1.08; i++) { const a = a0 + i / n * 6.283; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); }
        return stroke(pts, Object.assign({ over: 0 }, so));
      },
      arc: (cx, cy, r, a0, a1, so = {}) => { const n = Math.max(8, Math.round(Math.abs(a1 - a0) * r / 8)), pts = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * (so.ry || r)]); } return stroke(pts, so); },
      arrow: (x1, y1, x2, y2, so = {}) => {
        stroke([[x1, y1], [x2, y2]], so);
        const a = Math.atan2(y2 - y1, x2 - x1), h = so.head || 34;
        return stroke([[x2 + Math.cos(a + 2.6) * h, y2 + Math.sin(a + 2.6) * h], [x2, y2], [x2 + Math.cos(a - 2.6) * h, y2 + Math.sin(a - 2.6) * h]], Object.assign({}, so, { dash: null, over: 0 }));
      },
      text: (str, x, y, so = {}) => add({ kind: "text", str, x, y, size: so.size || 56, font: so.font || "Hand", c: so.c || "ink", align: so.align || "left", rot: so.rot || 0, len: str.length * (so.size || 56) * 0.9 }),
      hatch: (poly, so = {}) => {
        const lines = hatchLines(poly, so.angle ?? -0.9, so.gap || 13, it.seed * 50 + it.ops.length);
        const len = lines.reduce((a, l) => a + l.len, 0) * 0.12 * (so.k || 1);      // colouring in is quick, loose strokes
        return add({ kind: "hatch", lines, c: so.c || "red", w: so.w || 9, alpha: so.alpha ?? 0.5, len: Math.max(30, len) });
      },
      dot: (x, y, r, so = {}) => add({ kind: "dot", x, y, r, c: so.c || "ink", blink: so.blink || null, len: 18 }),
    };
    return api;
  }

  // ---------- timing: every op gets a share of the item's time; the pen travels between ops ----------
  let ready = false;
  const opStart = op => op.kind === "line" ? op.main.pts[0] : op.kind === "hatch" ? (op.lines[0] ? op.lines[0].pts[0] : [0, 0]) : op.kind === "text" ? [op.x0, op.y - op.size * 0.3] : [op.x, op.y];
  const opEnd = op => op.kind === "line" ? op.main.pts[op.main.pts.length - 1] : op.kind === "hatch" ? (op.lines.length ? op.lines[op.lines.length - 1].pts.slice(-1)[0] : [0, 0]) : op.kind === "text" ? [op.x0 + op.wM, op.y - op.size * 0.3] : [op.x, op.y];
  function finalize() {
    if (ready) return;
    ready = true;
    // one hand: an item that would still be drawing when the next one starts is shortened (or, at its minimum, the next waits)
    const seq = items.slice().sort((a, b) => a.t0 - b.t0);
    for (let i = 0; i + 1 < seq.length; i++) {
      const a = seq[i], b = seq[i + 1];
      if (a.t0 + a.dur > b.t0 - 0.06) { a.dur = Math.max(0.25, b.t0 - 0.06 - a.t0); if (a.t0 + a.dur > b.t0 - 0.06) b.t0 = a.t0 + a.dur + 0.06; }
    }
    for (const it of items) {
      for (const op of it.ops) if (op.kind === "text") {
        ctx.save(); ctx.font = `${op.size}px ${op.font}`; op.wM = ctx.measureText(op.str).width; ctx.restore();
        op.x0 = op.align === "center" ? op.x - op.wM / 2 : op.align === "right" ? op.x - op.wM : op.x;
        op.len = Math.max(op.len, op.wM * 1.6);
      }
      let acc = 0; it.seg = [];
      it.ops.forEach((op, i) => {
        if (i) { const a = opEnd(it.ops[i - 1]), b = opStart(op), d = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.35; it.seg.push({ travel: true, a, b, s0: acc, s1: acc + d }); acc += d; }
        it.seg.push({ op, s0: acc, s1: acc + op.len }); acc += op.len;
      });
      it.total = Math.max(1, acc);
      it.start = opStart(it.ops[0]); it.end = opEnd(it.ops[it.ops.length - 1]);
    }
  }

  // ---------- drawing ----------
  function drawPart(pl, amt, w, color, alpha, dash) {
    const { pts, L } = pl;
    if (amt <= 0) return null;
    ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    let i = 1;
    for (; i < pts.length && L[i] <= amt; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    let tip = pts[i - 1];
    if (i < pts.length) { const k = (amt - L[i - 1]) / (L[i] - L[i - 1] || 1); tip = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; ctx.lineTo(tip[0], tip[1]); }
    ctx.stroke();
    return tip;
  }
  function drawOp(op, k, t) {          // k: 0..1 of this op; returns the pencil tip
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    let tip = null;
    if (op.kind === "line") {
      const c = pc(op.c), dash = op.dash ? op.dash : null;
      if (op.ghost) drawPart(op.ghost, k * op.ghost.len, op.w * 0.5, c, op.alpha * 0.35, dash);
      tip = drawPart(op.main, k * op.main.len, op.w, c, op.alpha, dash);
    } else if (op.kind === "hatch") {
      const tot = op.lines.reduce((a, l) => a + l.len, 0); let amt = k * tot;
      for (const l of op.lines) { if (amt <= 0) break; tip = drawPart(l, Math.min(amt, l.len), op.w, pc(op.c), op.alpha) || tip; amt -= l.len; }
    } else if (op.kind === "text") {
      ctx.font = `${op.size}px ${op.font}`; ctx.fillStyle = pc(op.c); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
      ctx.translate(op.x0, op.y); ctx.rotate(op.rot);
      if (k < 1) { ctx.beginPath(); ctx.rect(-10, -op.size * 1.2, 10 + op.wM * k, op.size * 1.6); ctx.clip(); }
      ctx.globalAlpha = 0.96; ctx.fillText(op.str, 0, 0);
      const xx = op.wM * k; tip = [op.x0 + xx * Math.cos(op.rot), op.y + xx * Math.sin(op.rot) - op.size * (0.3 + 0.18 * Math.sin(xx / 9))];
    } else if (op.kind === "dot") {
      let c = pc(op.c);
      if (op.blink && k >= 1) c = Math.floor(t * op.blink.rate + op.blink.phase) % 3 === 0 ? pc(op.blink.c) : c;
      ctx.fillStyle = c; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.arc(op.x, op.y, op.r * clamp(k * 1.4), 0, 6.283); ctx.fill();
      tip = [op.x, op.y];
    }
    ctx.restore();
    return tip;
  }
  // draws every item as of time t (world transform already set); returns the pen: { tip, item, drawing }
  function drawItems(t) {
    let pen = null;
    for (const it of items) {
      if (t < it.t0) continue;
      const s = clamp((t - it.t0) / it.dur) * it.total;
      let tip = null, drawing = false;
      for (const g of it.seg) {
        if (s <= g.s0) break;
        const k = clamp((s - g.s0) / (g.s1 - g.s0 || 1));
        if (g.travel) { if (k < 1) { tip = [lerp(g.a[0], g.b[0], eio(k)), lerp(g.a[1], g.b[1], eio(k))]; drawing = false; } continue; }
        const tp = drawOp(g.op, k, t);
        if (k < 1 || g === it.seg[it.seg.length - 1]) { tip = tp; drawing = k < 1; }
      }
      if (t < it.t0 + it.dur) pen = { tip: tip || it.start, item: it, drawing };
    }
    return pen;
  }

  // ---------- page, desk ----------
  let DESK = null, GRAINP = null;
  function textures() {
    const d = document.createElement("canvas"); d.width = d.height = 1024;
    const g = d.getContext("2d"); g.fillStyle = P.desk || "#7a5636"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 140; i++) {
      const y0 = rnd(i, 1, 41) * 1024, amp = 4 + rnd(i, 2, 41) * 14, per = [256, 512, 1024][i % 3], ph = rnd(i, 3, 41) * 6.28;
      g.strokeStyle = rnd(i, 4, 41) < 0.5 ? `rgba(40,22,10,${0.10 + rnd(i, 5, 41) * 0.15})` : `rgba(190,140,90,${0.06 + rnd(i, 5, 41) * 0.10})`;
      g.lineWidth = 1 + rnd(i, 6, 41) * 4; g.beginPath();
      for (let x = 0; x <= 1024; x += 16) { const y = y0 + Math.sin(x / per * 6.283 + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    DESK = ctx.createPattern(d, "repeat");
    const p = document.createElement("canvas"); p.width = p.height = 512;
    const pg = p.getContext("2d"), im = pg.createImageData(512, 512);
    for (let i = 0; i < 512 * 512; i++) { const x = i % 512, y = (i / 512) | 0, v = 238 + rnd(x, y, 43) * 17; im.data[i * 4] = v; im.data[i * 4 + 1] = v - 2; im.data[i * 4 + 2] = v - 8; im.data[i * 4 + 3] = 255; }   // per-pixel only, so the tile has no seams
    pg.putImageData(im, 0, 0);
    GRAINP = ctx.createPattern(p, "repeat");
  }
  function drawPage() {
    ctx.save(); ctx.fillStyle = DESK; ctx.fillRect(-4000, -4000, page.w + 8000, page.h + 8000); ctx.restore();
    ctx.save(); ctx.shadowColor = "rgba(25,12,4,0.45)"; ctx.shadowBlur = 40; ctx.shadowOffsetX = 14; ctx.shadowOffsetY = 22;
    ctx.fillStyle = P.paper; ctx.fillRect(0, 0, page.w, page.h); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.55; ctx.fillStyle = GRAINP; ctx.fillRect(0, 0, page.w, page.h); ctx.restore();
  }

  // ---------- camera: each scene's params.cam is a world rect fitted into the stage (params.full: the whole screen) ----------
  const camOf = S => {
    const r = S.p.cam === "page" ? [-40, -40, page.w + 80, page.h + 80] : S.p.cam || [0, 0, page.w, page.h];
    const full = !!S.p.full || S.p.cam === "page";
    const z = full ? Math.min(W / r[2], H / r[3]) : Math.min(STAGE.w / r[2], STAGE.h / r[3]) * 0.98;
    return { x: r[0] + r[2] / 2, y: r[1] + r[3] / 2, z, sx: full ? W / 2 : STAGE_CX, sy: full ? H / 2 : STAGE_CY };
  };
  function camera(t) {
    let j = 0;
    for (let i = 1; i < SC.length; i++) if (t >= SC[i].t0 - (SC[i].p.lead ?? 0.35)) j = i;
    const S = SC[j], b = camOf(S);
    let c = b;
    if (j > 0) {
      const a = camOf(SC[j - 1]), lead = S.p.lead ?? 0.35, k = eio(prog(t, S.t0 - lead, S.t0 - lead + (S.p.move ?? 0.95) * PACE));
      const dist = Math.hypot(b.x - a.x, b.y - a.y), dip = 1 - Math.min(0.22, dist / 6000) * Math.sin(Math.PI * k);
      c = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)) * dip, sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) };
    }
    const u = prog(t, S.t0, S.t1);                         // the camera never sits still: a slow push and sway
    return Object.assign({}, c, { z: c.z * (1 + 0.03 * u), x: c.x + Math.sin(t * 0.4) * 5, y: c.y + Math.cos(t * 0.33) * 4 });
  }
  const toScreen = (cam, p) => [cam.sx + (p[0] - cam.x) * cam.z, cam.sy + (p[1] - cam.y) * cam.z];

  // ---------- the hand: a cartoon white glove holding a pencil, tip at (0,0), pencil along +x ----------
  // (user 2026-10-07: the drawn human hand didn't read as a hand; a glove is an honest cartoon, not a bad anatomy study)
  const capsule = (x1, y1, x2, y2, r) => { const a = Math.atan2(y2 - y1, x2 - x1); ctx.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2); ctx.arc(x1, y1, r, a + Math.PI / 2, a + Math.PI * 1.5); ctx.closePath(); };
  function handShape(g) {   // g(path-fn, fill, outline?) draws each part in order, back to front
    const W1 = "#fbfaf4", SH = "#e4e1d6";
    g(() => { ctx.moveTo(470, -70); ctx.lineTo(1300, -40); ctx.lineTo(1300, 310); ctx.lineTo(470, 175); ctx.closePath(); }, P.sleeve || "#3d4a5c");   // sleeve
    g(() => { ctx.moveTo(395, -70); ctx.quadraticCurveTo(440, -100, 500, -95); ctx.quadraticCurveTo(540, 50, 505, 205); ctx.quadraticCurveTo(445, 200, 400, 165); ctx.quadraticCurveTo(425, 50, 395, -70); }, W1);   // flared cuff
    g(() => { ctx.moveTo(425, -72); ctx.quadraticCurveTo(455, 50, 432, 178); }, null);                                                       // cuff roll line
    g(() => { ctx.moveTo(190, -50); ctx.bezierCurveTo(250, -92, 370, -88, 420, -50); ctx.bezierCurveTo(455, 20, 445, 120, 405, 160); ctx.bezierCurveTo(330, 200, 230, 185, 190, 130); ctx.bezierCurveTo(165, 80, 160, -15, 190, -50); }, W1);   // back of the glove
    g(() => capsule(300, 150, 230, 128, 34), SH);                                                                                              // curled pinky
    g(() => capsule(285, 112, 195, 92, 37), SH);                                                                                               // curled ring finger
    g(() => capsule(250, 48, 128, 40, 36), W1);                                                                                                // middle finger, under the pencil
    // pencil
    g(() => { ctx.moveTo(52, -12); ctx.lineTo(400, -12); ctx.lineTo(400, 12); ctx.lineTo(52, 12); ctx.closePath(); }, "#f2c230");
    g(() => { ctx.moveTo(52, -12); ctx.lineTo(400, -12); ctx.lineTo(400, -4); ctx.lineTo(52, -4); ctx.closePath(); }, "#f8dc72", false);
    g(() => { ctx.moveTo(52, 5); ctx.lineTo(400, 5); ctx.lineTo(400, 12); ctx.lineTo(52, 12); ctx.closePath(); }, "#d39b1c", false);
    g(() => { ctx.moveTo(16, -4); ctx.lineTo(52, -12); ctx.lineTo(52, 12); ctx.lineTo(16, 4); ctx.closePath(); }, "#ecc896");
    g(() => { ctx.moveTo(0, 0); ctx.lineTo(17, -4.5); ctx.lineTo(17, 4.5); ctx.closePath(); }, "#33343a");
    g(() => { ctx.moveTo(400, -13); ctx.lineTo(426, -13); ctx.lineTo(426, 13); ctx.lineTo(400, 13); ctx.closePath(); }, "#b9b9b4");
    g(() => { ctx.moveTo(426, -13); ctx.lineTo(440, -13); ctx.quadraticCurveTo(454, 0, 440, 13); ctx.lineTo(426, 13); ctx.closePath(); }, "#e99b9b");
    g(() => capsule(235, -62, 125, -30, 36), W1);                                                                                              // thumb, far side of the pencil
    g(() => capsule(255, -8, 92, -2, 37), W1);                                                                                                 // index finger, on top of the pencil
    g(() => { ctx.moveTo(250, -52); ctx.quadraticCurveTo(300, -40, 345, -48); ctx.moveTo(262, -20); ctx.quadraticCurveTo(312, -8, 360, -14); ctx.moveTo(268, 14); ctx.quadraticCurveTo(318, 24, 362, 20); }, null);   // the three stitch lines on the back
  }
  function hand(sx, sy, s, lift, t) {
    ctx.save(); ctx.translate(sx, sy); ctx.scale(s, s); ctx.rotate(-0.62 + Math.sin(t * 1.3) * 0.025 + lift * 0.04);
    ctx.save(); ctx.translate(26 + lift * 40, 36 + lift * 50); ctx.filter = "blur(12px)";      // shadow on the paper
    handShape((path, fill, edge) => { if (edge === false || !fill) return; ctx.beginPath(); path(); ctx.fillStyle = "rgba(40,22,8,0.20)"; ctx.fill(); });
    ctx.restore();
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    handShape((path, fill, edge) => {
      ctx.beginPath(); path();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (edge !== false) { ctx.lineWidth = fill ? 5 : 3.5; ctx.strokeStyle = fill ? P.ink : "rgba(40,40,45,0.55)"; ctx.stroke(); }
    });
    ctx.restore();
  }
  // photoreal hand (storyboard.hand = "photo"): cut-outs from studio/assets/hands/ (hand_cutout.py); the pencil tip is pinned to the stroke
  const PHOTO = (() => {
    if (EP.storyboard.hand !== "photo") return null;
    let meta = null;
    try { const x = new XMLHttpRequest(); x.open("GET", "../assets/hands/hands.json", false); x.send(); meta = JSON.parse(x.responseText).hands; } catch (e) { warn("photo hand: hands.json not readable"); return null; }
    const out = {};
    window.PRELOAD = window.PRELOAD || [];
    for (const [k, m] of Object.entries(meta)) {
      const img = new Image(); img.src = "../assets/hands/" + m.file; out[k] = { img, tip: m.tip };
      window.PRELOAD.push(new Promise(r => { img.onload = r; img.onerror = () => { warn("photo hand: " + m.file + " failed to load"); r(); }; }));
    }
    return out;
  })();
  function photoHand(sx, sy, s, lift, t) {
    const H = PHOTO[lift > 0.5 && PHOTO.hand_lifted ? "hand_lifted" : "hand_down"]; if (!H || !H.img.complete) return;
    const k = s * 1.0;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(t * 1.1) * 0.02 + lift * 0.03);
    ctx.shadowColor = "rgba(30,18,8,0.30)"; ctx.shadowBlur = 26 + lift * 20; ctx.shadowOffsetX = 16 + lift * 26; ctx.shadowOffsetY = 22 + lift * 34;
    ctx.drawImage(H.img, -H.tip[0] * k, -H.tip[1] * k, H.img.width * k, H.img.height * k);
    ctx.restore();
  }
  const REST = () => [W + 300, H * 0.66];
  function handPos(t, cam, pen) {
    if (pen) return { p: toScreen(cam, pen.tip), lift: pen.drawing ? 0 : 1 };
    let prev = null, next = null;
    for (const it of items) { const e = it.t0 + it.dur; if (e <= t && (!prev || e > prev.t0 + prev.dur)) prev = it; if (it.t0 > t && (!next || it.t0 < next.t0)) next = it; }
    const rest = REST();
    if (prev && next && next.t0 - (prev.t0 + prev.dur) < 1.0) {
      const k = eio(prog(t, prev.t0 + prev.dur, next.t0));
      return { p: toScreen(cam, [lerp(prev.end[0], next.start[0], k), lerp(prev.end[1], next.start[1], k)]), lift: 1 };
    }
    let p = rest;
    if (prev) { const k = eio(prog(t, prev.t0 + prev.dur, prev.t0 + prev.dur + 0.5)); const a = toScreen(cam, prev.end); p = [lerp(a[0], rest[0], k), lerp(a[1], rest[1], k)]; }
    if (next && t > next.t0 - 0.5) { const k = eio(prog(t, next.t0 - 0.5, next.t0)); const b = toScreen(cam, next.start); p = [lerp(rest[0], b[0], k), lerp(rest[1], b[1], k)]; }
    return { p, lift: 1 };
  }

  // ---------- one frame ----------
  function frame(t) {
    finalize();
    if (!DESK) textures();
    const cam = camera(t);
    ctx.save(); ctx.fillStyle = P.desk || "#7a5636"; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.translate(cam.sx, cam.sy); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    drawPage();
    const pen = drawItems(t);
    ctx.restore();
    const h = handPos(t, cam, pen);
    const bob = pen && pen.drawing ? Math.sin(t * 31) * 1.5 : 0;
    if (h.p[0] < W + 250) { if (PHOTO) photoHand(h.p[0], h.p[1] + bob, clamp(cam.z, 0.5, 1.0) * 0.95, h.lift, t); else hand(h.p[0], h.p[1] + bob, clamp(cam.z, 0.5, 1.0) * 0.74, h.lift, t); }
  }

  // no pencil-scratch sound: the user found it grating (2026-10-07); an episode can still add its own cues
  function done() {
    const cues = [];
    if (SC[0]) SC[0].cues = (SC[0].cues || []).concat(cues);
    SC.forEach(S => { S.landAt = S.t1 - 0.4; });     // review stills: each part of the page as its scene ends
  }
  return { item, frame, done, page, items };
})();

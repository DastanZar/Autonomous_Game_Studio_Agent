// Data-flags scene types for the ranked channel: ranking_bars, ranking_race, and country cards for versus.
// Look ported from the approved "Flag Badges" board (studio/stylelab/boards.js rankedBadges): bars on off-white,
// round flag badges with faces riding the bar tips, medal circles, confetti on #1, the parked "obvious guess" row.
// Needs faces.js and flags.js. Every frame is a pure function of t.
//
// DATASET (params.dataset = path relative to the episode folder; the driver injects it as EP.data[path]):
//   ranking_bars  JSON {"title","metric","source","decimals","prefix","suffix","rows":[{"code","name","value"}]}
//                 CSV  "# source: ..." / "# metric: ..." / "# decimals: 1" comment lines, then header  code,name,value
//   ranking_race  JSON {... ,"rows":[{"code","name","values":{"1960":123.4,...}}]}
//                 CSV  long format  code,name,year,value
//   "source" is required and is drawn on screen for the whole scene. Values between data years are linear
//   interpolations of real neighbours (never extrapolated); the source line says so.
// EVENTS (storyboard scene.events, every `at` a spoken-word cue):
//   ranking_bars  reveal {rank?}  reveals rank N, N-1, ... 1 in order (or the named rank);  highlight  the underdog beat;
//                 emphasize {code?}  pulses a badge.
//   ranking_race  any event with args.year  pins that year to the cue (piecewise linear between pins);
//                 highlight  activates the highlighted country; emphasize {code}  pulses that badge.
"use strict";

const RK = {
  get ink() { return P.ink; }, get bg() { return P.bg || "#f5f3ee"; }, get bar() { return P.bar || "#4a78a8"; },
  get hi() { return P.highlight || "#e63946"; }, get gold() { return P.gold; },
  get silver() { return P.silver || "#b8c0c8"; }, get bronze() { return P.bronze || "#c47f45"; }, get grid() { return P.grid || "#d9d6cf"; },
  grey: "#9aa3ad",
};
const RK_CX = () => (40 + W - SAFE.right) / 2;      // centre of the area the platform leaves free
const RK_RIGHT = () => W - SAFE.right - 0;          // right edge for content (bars, badges, text)
const RK_CROWNT = 0.6;                               // seconds from the #1 reveal to the crown

// ---------------------------------------------------------------- dataset parsing
function rkCsv(text) {
  const meta = {}, rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const ln = raw.trim();
    if (!ln) continue;
    const m = /^#\s*([a-z_]+)\s*:\s*(.*)$/i.exec(ln);
    if (m) { meta[m[1].toLowerCase()] = m[2]; continue; }
    if (ln.startsWith("#")) continue;
    const cells = []; let cur = "", q = false;
    for (const ch of ln) { if (ch === '"') q = !q; else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch; }
    cells.push(cur); rows.push(cells.map(c => c.trim()));
  }
  const head = (rows.shift() || []).map(h => h.toLowerCase());
  const ix = k => head.indexOf(k);
  const out = Object.assign({}, meta, { rows: [] });
  if (ix("year") >= 0) {
    const by = new Map();
    rows.forEach(r => {
      const code = r[ix("code")], it = by.get(code) || { code, name: r[ix("name")] || code, values: {} };
      it.values[r[ix("year")]] = r[ix("value")] === "" ? null : Number(r[ix("value")]); by.set(code, it);
    });
    out.rows = [...by.values()];
  } else rows.forEach(r => out.rows.push({ code: r[ix("code")], name: r[ix("name")], value: r[ix("value")] === "" ? NaN : Number(r[ix("value")]) }));
  return out;
}
const RK_CACHE = {};
function rkData(S, race) {
  const path = S.p.dataset;
  const key = path + (race ? "#race" : "#bars");
  if (RK_CACHE[key]) return RK_CACHE[key];
  const bad = msg => { warn(`scene ${S.id}: dataset '${path}' ${msg}`); return (RK_CACHE[key] = null); };
  const raw = (EP.data || {})[path];
  if (raw == null) return bad("was not loaded (params.dataset must be a file in the episode folder)");
  let d;
  try { d = raw.trim().startsWith("{") ? JSON.parse(raw) : rkCsv(raw); } catch (e) { return bad("could not be parsed: " + e.message); }
  if (!d.source || !String(d.source).trim()) warn(`scene ${S.id}: dataset '${path}' has no source string; every chart must show its source`);
  const D = { title: d.title || "", metric: d.metric || "", source: String(d.source || "").trim(), prefix: d.prefix || "", suffix: d.suffix || "", items: [], years: [] };
  const seen = new Set();
  let allInt = true;
  (d.rows || []).forEach(r => {
    if (!r.code) { warn(`scene ${S.id}: dataset '${path}' has a row without a code`); return; }
    if (seen.has(r.code)) warn(`scene ${S.id}: dataset '${path}' has code ${r.code} twice`);
    seen.add(r.code);
    if (race) {
      const pts = Object.entries(r.values || {}).filter(([, v]) => v != null && v !== "").map(([y, v]) => [+y, +v]).sort((a, b) => a[0] - b[0]);
      if (pts.some(p => !isFinite(p[1]) || !isFinite(p[0]))) warn(`scene ${S.id}: dataset '${path}' ${r.code} has a non-numeric value`);
      pts.forEach(p => { if (p[1] % 1) allInt = false; });
      D.items.push({ code: r.code, name: r.name || NAMES[r.code] || r.code, pts: pts.filter(p => isFinite(p[0]) && isFinite(p[1])) });
    } else {
      if (!isFinite(r.value)) { warn(`scene ${S.id}: dataset '${path}' ${r.code} has a non-numeric value`); return; }
      if (r.value % 1) allInt = false;
      D.items.push({ code: r.code, name: r.name || NAMES[r.code] || r.code, value: +r.value });
    }
  });
  D.decimals = d.decimals != null ? +d.decimals : (allInt ? 0 : 1);
  if (race) {
    D.years = [...new Set(D.items.flatMap(i => i.pts.map(p => p[0])))].sort((a, b) => a - b);
    D.items.forEach(i => { if (i.pts.length < 2) warn(`scene ${S.id}: ${i.code} has fewer than two data years in '${path}'; it cannot be drawn as a race bar`); });
  } else D.items.sort((a, b) => b.value - a.value);
  return (RK_CACHE[key] = D);
}
const rkFmt = (v, D) => D.prefix + v.toLocaleString("en-US", { minimumFractionDigits: D.decimals, maximumFractionDigits: D.decimals }) + D.suffix;

// ---------------------------------------------------------------- pieces
// round flag badge with a face. o = {k (pop 0..1), mood, look, blink, talk, crown (0..1), sweat (0..1), pulse (0..1)}
function rkBadge(code, x, y, r, o = {}) {
  if (o.k != null && o.k <= 0) return;
  const known = flagKnown(code);
  if (!known) warn(`flag '${code}' has no official drawing in studio/engine/flags.js; drew a neutral badge with the code (add the flag, never guess it)`);
  ctx.save(); ctx.translate(x, y);
  const s = (o.k != null ? back(clamp(o.k)) : 1) * (1 + 0.28 * (o.pulse || 0)); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = "rgba(20,33,61,0.28)"; ctx.shadowOffsetY = 6 * r / 44; ctx.shadowBlur = 8 * r / 44;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, r + 7 * r / 44, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
  if (known) flagRect(code, -r * 1.25, -r, r * 2.5, r * 2); else { ctx.fillStyle = "#e4e0d6"; ctx.fillRect(-r, -r, 2 * r, 2 * r); }
  ctx.globalAlpha = 0.22; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.55, r * 0.6, r * 0.28, -0.4, 0, 7); ctx.fill();
  ctx.globalAlpha = 0.12; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.3, r, 0, 7); ctx.arc(0, 0, r * 1.2, 0, 7, true); ctx.fill("evenodd");
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = Math.max(3, r * 0.09); ctx.beginPath(); ctx.arc(0, 0, r + 7 * r / 44, 0, 7); ctx.stroke();
  ctx.lineWidth = Math.max(2, r * 0.05); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  if (o.mood) face({ x: 0, y: -r * 0.12, sz: r * 0.52, mood: o.mood, look: o.look || [0, 0], blink: o.blink || 0, talk: o.talk || 0, body: flagBody(code), lw: o.lw != null ? o.lw : clamp(r * 0.52 / 40, 0.45, 1) });
  if (!known) text(code, 0, r * 0.86, { size: r * 0.4, color: P.ink });
  if (o.crown > 0) { ctx.save(); ctx.scale(r / 70 * clamp(o.crown), r / 70 * clamp(o.crown)); crown(10, -70, 0.25, P.gold); ctx.restore(); }
  ctx.restore();
  if (o.sweat) sweat(x + r * 0.9, y - r * 0.6, o.sweat, r / 60);
}
// one chart row. o = {code, name, y, len, s, fill, ink, value (text), rank (text), medal, alpha, badge}
function rkRow(o) {
  const s = o.s, x0 = 130, bh = 68 * s, rad = 12 * s;
  if (o.alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= o.alpha;
  ctx.fillStyle = o.medal; ctx.beginPath(); ctx.arc(76, o.y, 32 * s, 0, 7); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
  text(o.rank, 76, o.y + 15 * s, { size: (o.rank.length > 2 ? 27 : 42) * s, color: P.ink });
  const len = Math.max(o.len, 1);
  ctx.fillStyle = o.fill; ctx.beginPath(); ctx.roundRect(x0, o.y - bh / 2, len, bh, rad); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, o.y - bh / 2, len, bh, rad); ctx.clip();
  const vs = 40 * s, ns = 38 * s, vw = measure(o.value, vs), pad = 16 * s;
  let name = o.name.toUpperCase();
  if (measure(name, ns) + vw + pad * 3 > len) name = o.code;            // narrow bar: the ISO code instead of the name
  if (measure(name, ns) + vw + pad * 3 > len) name = "";                // still no room: the number alone
  if (name) text(name, x0 + pad + 4, o.y + 14 * s, { size: ns, color: o.ink, align: "left" });
  if (vw + pad * 2 <= len) text(o.value, x0 + len - pad + 2, o.y + 14 * s, { size: vs, color: o.ink, align: "right" });
  ctx.restore();
  if (o.badge) rkBadge(o.code, x0 + len + 58 * s, o.y, 44 * s, o.badge);
  ctx.restore();
}
function rkGrid(top, bottom, vmax, maxLen) {
  ctx.save(); ctx.strokeStyle = RK.grid; ctx.lineWidth = 2;
  const raw = vmax / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(m => m * mag).find(v => v >= raw) || raw;
  for (let v = 0; v <= vmax * 1.001; v += step) { const x = 130 + v / vmax * maxLen; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); }
  ctx.restore();
}
function rkConfetti(t, t0, ox, oy) {
  if (t <= t0) return;
  for (let i = 0; i < 40; i++) {                                         // up-and-left from the leader, away from the platform buttons
    const k = (t - t0) * 0.9, a = Math.PI + rnd(i, 7) * Math.PI, sp = 300 + rnd(i, 8) * 500;
    const x = ox + Math.cos(a) * sp * k * 0.8, y = oy + Math.sin(a) * sp * k * 0.6 + 400 * k * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 6 + i); ctx.globalAlpha = clamp(1.6 - k);
    ctx.fillStyle = [RK.hi, RK.gold, RK.bar, "#fff"][i % 4]; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
}
// title, metric, source: returns the geometry the rows must respect
function rkFrame(S, D, race) {
  const title = S.p.title != null ? String(S.p.title) : D.title;
  const tf = title ? fit(title, RK_RIGHT() - 60, race ? 84 : 100, 2, "Anton", "ranking title") : { size: 0, lines: [] };
  const lh = tf.size * 1.08;
  const G = { tf, lh, titleTop: SAFE.top + 12 };
  let y = G.titleTop + tf.lines.length * lh;
  if (race) {
    G.yearBase = y + 150; G.yearSize = 150;
    const mx = 50 + measure("2020", G.yearSize) + 34;   // right of the widest year
    const mf = fit(D.metric, RK_RIGHT() - mx, 34, 3, "Elite", "ranking metric");
    G.mf = mf; G.metricX = mx; G.metricTop = y + 40; y += 180;
  } else {
    const mf = D.metric ? fit(D.metric, RK_RIGHT() - 60, 36, 2, "Elite", "ranking metric") : { size: 0, lines: [] };
    G.mf = mf; G.metricBase = y + 16 + mf.size * 0.7; y += 24 + mf.lines.length * mf.size * 1.25;
  }
  const note = race && D.years.length > 1 && (D.years[1] - D.years[0]) > 1 ? " Between data years the values are interpolated." : "";
  const sf = fit("Source: " + (D.source || "(none)") + note, RK_RIGHT() - 50, 27, 3, "Elite", "source line");
  G.sf = sf; G.srcBase = STAGE.y + STAGE.h - 8 - (sf.lines.length - 1) * sf.size * 1.15;
  G.rowsTop = y + 44; G.rowsBottom = G.srcBase - sf.size - 14;
  return G;
}
function rkSource(G) {
  ctx.save(); ctx.globalAlpha *= 0.85;
  G.sf.lines.forEach((ln, i) => text(ln, 50, G.srcBase + i * G.sf.size * 1.15, { size: G.sf.size, font: "Elite", align: "left", color: P.ink }));
  ctx.restore();
}
function rkTitle(t, S, G) {
  const kt = pop(t, S.t0 + 0.05, 0.4);
  ctx.save(); ctx.translate(RK_CX(), 0);
  G.tf.lines.forEach((ln, i) => {
    const last = i === G.tf.lines.length - 1 && G.tf.lines.length > 1;
    ctx.save(); ctx.translate(0, G.titleTop + i * G.lh + G.tf.size * 0.86); ctx.scale(kt, kt);
    text(ln.toUpperCase(), 0, 0, { size: G.tf.size, color: last ? RK.hi : P.ink }); ctx.restore();
  });
  ctx.restore();
}
function rkBackground() { ctx.fillStyle = RK.bg; ctx.fillRect(0, 0, W, H); }
const rkPulse = (t, times) => times.reduce((a, x) => Math.max(a, clamp(1 - Math.abs(t - x - 0.1) / 0.32)), 0);
function rkPrep(S, race) {
  const D = rkData(S, race);
  S.rkD = D;
  if (!D) return;
  if (!D.source) return;
  S.rkPulses = S.ev.filter(e => e.do.includes("emphasize")).map(e => ({ t: e.t, code: e.args.code || null }));
  const hiE = S.ev.find(e => e.do.includes("highlight"));
  S.rkHiT = hiE ? hiE.t : null;
  if (S.p.highlight && !D.items.some(i => i.code === S.p.highlight)) warn(`scene ${S.id}: highlight '${S.p.highlight}' is not in dataset '${S.p.dataset}'`);
  const top = S.rkTop = Math.max(1, Math.min(+S.p.top || 5, D.items.length));
  if (top > 8) warn(`scene ${S.id}: top ${top} is too many rows for a vertical chart (max 8)`);
  if (!race) {
    if (D.items.length < (+S.p.top || 5)) warn(`scene ${S.id}: dataset '${S.p.dataset}' has only ${D.items.length} rows for top ${S.p.top || 5}`);
    const rev = {}, ev = S.ev.filter(e => e.do.includes("reveal")).sort((a, b) => a.t - b.t);
    let next = top;
    ev.forEach(e => {
      let r = e.args.rank != null ? +e.args.rank : next;
      if (r < 1 || r > top || rev[r] != null) { warn(`scene ${S.id}: reveal event has rank ${r}, out of range or already revealed`); return; }
      rev[r] = e.t; next = r - 1;
    });
    if (!ev.length) warn(`scene ${S.id}: ranking_bars has no reveal events; rows appear on default timing, not on spoken words`);
    let last = ev.length ? ev[ev.length - 1].t : S.t0 + 0.3;
    for (let r = top; r >= 1; r--) if (rev[r] == null) { last += 0.5; rev[r] = last; }
    S.rkRev = rev; S.rkCrownT = rev[1] + RK_CROWNT;
    const hr = S.p.highlight ? D.items.findIndex(i => i.code === S.p.highlight) + 1 : 0;
    S.rkHiRank = hr;
    if (S.rkHiT == null) S.rkHiT = hr > top ? S.rkCrownT + 0.6 : hr ? rev[hr] + RK_CROWNT : S.rkCrownT;
    S.landAt = Math.max(S.rkCrownT, S.rkHiT) + 1.0;
    for (let r = top; r >= 1; r--) if (!S.ev.some(e => e.sfx && Math.abs(e.t - rev[r]) < 0.01)) S.cues.push({ t: +rev[r].toFixed(3), type: "pop" });
  } else {
    const from = +S.p.from, to = +S.p.to;
    if (!isFinite(from) || !isFinite(to) || to <= from) warn(`scene ${S.id}: ranking_race needs numeric from < to`);
    if (D.years.length && (from < D.years[0] || to > D.years[D.years.length - 1])) warn(`scene ${S.id}: from/to (${from}-${to}) lie outside the dataset years ${D.years[0]}-${D.years[D.years.length - 1]}`);
    D.items.forEach(i => {
      const have = new Set(i.pts.map(p => p[0]));
      const gap = D.years.filter(y => y >= from && y <= to && y >= i.pts[0][0] && y <= i.pts[i.pts.length - 1][0] && !have.has(y));
      if (gap.length) warn(`scene ${S.id}: ${i.code} has no value for ${gap.join(", ")}; drawn as an interpolation between its neighbours`);
    });
    const kf = S.ev.filter(e => e.args.year != null).map(e => ({ t: e.t, y: +e.args.year })).sort((a, b) => a.t - b.t);
    if (!kf.length) warn(`scene ${S.id}: ranking_race has no events with args.year; the years run on default timing, not on spoken words`);
    if (!kf.length || kf[0].t > S.t0 + 0.5) kf.unshift({ t: S.t0 + 0.5, y: from });
    if (kf[kf.length - 1].y < to) kf.push({ t: Math.max(kf[kf.length - 1].t + 1, S.t1 - 0.9), y: to });
    S.rkKf = kf;
    S.landAt = kf[kf.length - 1].t + 0.4;
    const a = kf[0].t, b = kf[kf.length - 1].t;
    S.sheetAt = [a + (b - a) * 0.3, a + (b - a) * 0.65];
    if (S.rkHiT == null) S.rkHiT = S.t0;
    S.rkPulses.forEach(p => S.cues.push({ t: +p.t.toFixed(3), type: "pop" }));
  }
}

// ---------------------------------------------------------------- ranking_bars
SCENE_FNS.ranking_bars = (t, S) => {
  rkBackground();
  const D = S.rkD;
  if (!D || !D.source) { text("RANKING: DATASET PROBLEM", W / 2, H / 2, { size: 60, color: RK.hi }); return; }
  const G = rkFrame(S, D, false), top = S.rkTop, hr = S.rkHiRank, parked = hr > top;
  const s = Math.min(1, (G.rowsBottom - G.rowsTop - 40) / (top + (parked ? 1.3 : 0.1)) / 96), pitch = 96 * s;
  const y0 = G.rowsTop + 40 * s;   // room for the crown above the first row
  const yRow = pos => y0 + pitch * (pos + 0.5);
  const maxLen = RK_RIGHT() - 130 - (58 + 51) * s, vmax = D.items[0].value;
  rkGrid(y0 - 10, yRow(top - 1) + pitch / 2, vmax, maxLen);
  rkTitle(t, S, G);
  if (G.mf.lines.length) G.mf.lines.forEach((ln, i) => withAlpha(prog(t, S.t0 + 0.2, S.t0 + 0.5), () => text(ln, RK_CX(), G.metricBase + i * G.mf.size * 1.25, { size: G.mf.size, font: "Elite", color: P.ink })));
  const crowned = t > S.rkCrownT, hiOn = t >= S.rkHiT;
  let leader = null;
  for (let r = top; r >= 1; r--) {
    const it = D.items[r - 1], i = r - 1, y = yRow(i), t0 = S.rkRev[r];
    const kg = eout(prog(t, t0, t0 + 0.45)), isLead = r === 1, isHi = r === hr;
    const medal = [RK.gold, RK.silver, RK.bronze][i] || RK.grid;
    if (kg <= 0) {   // not revealed yet: a ghost row keeps the slot
      ctx.save(); ctx.globalAlpha = 1;
      ctx.fillStyle = medal; ctx.beginPath(); ctx.arc(76, y, 32 * s, 0, 7); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
      text(String(r), 76, y + 15 * s, { size: 42 * s, color: P.ink });
      ctx.fillStyle = "rgba(20,33,61,0.08)"; ctx.beginPath(); ctx.roundRect(130, y - 34 * s, 180 * s, 68 * s, 12 * s); ctx.fill();
      text("?", 220 * s + 40, y + 14 * s, { size: 40 * s, color: "rgba(20,33,61,0.3)" });
      ctx.restore();
      continue;
    }
    const len = it.value / vmax * maxLen * kg;
    let fill = RK.bar, ink = "#fff";
    if (hr ? (isHi && hiOn) : (isLead && crowned)) { fill = RK.hi; }
    if (hr && isLead && !isHi && crowned) { fill = RK.gold; ink = P.ink; }
    let mood = ["happy", "proud", "neutral", "tired", "neutral", "happy", "neutral", "happy"][i] || "neutral";
    if (isLead) mood = crowned ? "smug" : "happy";
    let look = hiOn ? [0, (hr > r ? 0.8 : -0.7)] : [-0.5, 0];
    let sweatK = 0;
    if (isHi && hiOn && !isLead) { mood = "worried"; look = [0, -0.6]; sweatK = prog(t, S.rkHiT + 0.3, S.rkHiT + 1.1); }
    const pulse = rkPulse(t, S.rkPulses.filter(p => !p.code || p.code === it.code).map(p => p.t));
    rkRow({
      code: it.code, name: it.name, y, len, s, fill, ink, value: rkFmt(it.value * kg, D), rank: String(r), medal, alpha: 1,
      badge: { k: prog(t, t0 + 0.3, t0 + 0.65), mood, look, blink: blinkAt(t, strSeed(it.code)), crown: isLead && crowned ? eout(prog(t, S.rkCrownT, S.rkCrownT + 0.3)) : 0, sweat: sweatK, pulse },
    });
    if (isLead) leader = { x: 130 + len + 58 * s, y };
  }
  if (leader) rkConfetti(t, S.rkCrownT, leader.x, leader.y);
  if (parked) {   // the highlighted country sits outside the top N: parked below the chart, worried
    const ki = eout(prog(t, S.rkHiT, S.rkHiT + 0.5));
    if (ki > 0) {
      const it = D.items[hr - 1], y = yRow(top + 0.3), ox = lerp(-900, 0, ki);
      ctx.save(); ctx.translate(ox, 0);
      ctx.setLineDash([12, 10]); ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, y - pitch * 0.56); ctx.lineTo(RK_RIGHT() - 40, y - pitch * 0.56); ctx.stroke(); ctx.setLineDash([]);
      rkRow({
        code: it.code, name: it.name, y, len: it.value / vmax * maxLen, s, fill: RK.grey, ink: P.ink, value: rkFmt(it.value, D), rank: "#" + hr, medal: "#e6e2d9", alpha: 1,
        badge: { mood: "shocked", look: [0, -0.6], blink: 0, sweat: prog(t, S.rkHiT + 0.6, S.rkHiT + 1.4), pulse: rkPulse(t, S.rkPulses.filter(p => !p.code || p.code === it.code).map(p => p.t)) },
      });
      ctx.restore();
    }
  }
  rkSource(G);
};

// ---------------------------------------------------------------- ranking_race
function rkYearAt(S, t) {
  const kf = S.rkKf;
  if (t <= kf[0].t) return kf[0].y;
  for (let i = 1; i < kf.length; i++) if (t <= kf[i].t) return lerp(kf[i - 1].y, kf[i].y, (t - kf[i - 1].t) / Math.max(1e-6, kf[i].t - kf[i - 1].t));
  return kf[kf.length - 1].y;
}
// value at a (fractional) year: linear between the two real neighbouring data points, absent outside the data
function rkValueAt(item, year) {
  const p = item.pts;
  if (p.length < 2 || year < p[0][0] || year > p[p.length - 1][0]) return null;
  let i = 1; while (i < p.length - 1 && p[i][0] < year) i++;
  const [ya, va] = p[i - 1], [yb, vb] = p[i];
  return lerp(va, vb, clamp((year - ya) / (yb - ya)));
}
// soft ranks: each row's slot is the (smoothed) count of rows ahead of it, so overtakes glide instead of jumping
function rkRanks(D, year) {
  const rows = [];
  D.items.forEach((it, n) => { const v = rkValueAt(it, year); if (v != null) rows.push({ it, v, n }); });
  const vmax = rows.reduce((a, r) => Math.max(a, r.v), 1e-9), tau = 0.018 * vmax;
  rows.forEach(r => { r.pos = rows.reduce((a, o) => o === r ? a : a + 1 / (1 + Math.exp(-(o.v + o.n * 1e-9 - r.v) / tau)), 0); });
  rows.sort((a, b) => a.pos - b.pos || a.n - b.n);
  for (let i = 1; i < rows.length; i++) rows[i].pos = Math.max(rows[i].pos, rows[i - 1].pos + 0.78);   // never overlap, even at a tie
  const m = {}; rows.forEach(r => { m[r.it.code] = r; r.vmax = vmax; });
  return { rows, m, vmax };
}
SCENE_FNS.ranking_race = (t, S) => {
  rkBackground();
  const D = S.rkD;
  if (!D || !D.source) { text("RANKING: DATASET PROBLEM", W / 2, H / 2, { size: 60, color: RK.hi }); return; }
  const G = rkFrame(S, D, true), top = S.rkTop, hc = S.p.highlight, hasHi = !!hc;
  const s = Math.min(1, (G.rowsBottom - G.rowsTop - 40) / (top + (hasHi ? 1.3 : 0.1)) / 96), pitch = 96 * s;
  const y0 = G.rowsTop + 40 * s, yPos = pos => y0 + pitch * (pos + 0.5);
  const year = rkYearAt(S, t), R = rkRanks(D, year), Rp = rkRanks(D, rkYearAt(S, t - 0.7));
  const maxLen = RK_RIGHT() - 130 - (58 + 51) * s, vmax = R.vmax;
  rkGrid(y0 - 10, yPos(top - 1) + pitch / 2, vmax, maxLen);
  rkTitle(t, S, G);
  // year counter and metric
  const yr = Math.round(year), kY = pop(t, S.t0 + 0.15, 0.4);
  ctx.save(); ctx.translate(50, G.yearBase); ctx.scale(kY, kY);
  text(String(yr), 0, 0, { size: G.yearSize, color: RK.hi, align: "left" }); ctx.restore();
  G.mf.lines.forEach((ln, i) => withAlpha(prog(t, S.t0 + 0.2, S.t0 + 0.5), () => text(ln, G.metricX, G.metricTop + 24 + i * G.mf.size * 1.3, { size: G.mf.size, font: "Elite", color: P.ink, align: "left" })));
  const hiOn = t >= S.rkHiT, cw = clamp(prog(t, S.t0 + 0.25, S.t0 + 0.7));
  // draw from the bottom up so the leader is painted last
  const vis = R.rows.slice().reverse();
  let leader = null;
  vis.forEach(r => {
    const it = r.it, isHi = hasHi && it.code === hc;
    let pos = r.pos, alpha = clamp((top - 0.1 - pos) / 0.7), b = 0;
    if (isHi) {
      b = eio(prog(pos, top - 1, top)); pos = lerp(pos, top + 0.3, b); alpha = 1;
      if (b > 0) { ctx.save(); ctx.globalAlpha = b * cw; ctx.setLineDash([12, 10]); ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, yPos(top + 0.3) - pitch * 0.56); ctx.lineTo(RK_RIGHT() - 40, yPos(top + 0.3) - pitch * 0.56); ctx.stroke(); ctx.restore(); }
    }
    if (alpha <= 0) return;
    const rank = Math.round(r.pos) + 1, lead = r.pos < 0.45;
    const prev = Rp.m[it.code], slid = prev ? r.pos - prev.pos : 0;
    let mood = ["happy", "proud", "neutral", "tired", "neutral", "happy", "neutral", "happy"][Math.min(rank - 1, 7)] || "neutral";
    let look = [-0.5, -0.5];
    if (slid > 0.5) mood = "worried"; else if (slid < -0.5) mood = "happy";   // just overtaken / just overtook
    if (lead) { mood = "smug"; look = [0, 0.7]; }
    let sweatK = 0;
    if (isHi && hiOn) { mood = b > 0.5 ? "shocked" : "worried"; look = [0, -0.6]; sweatK = b > 0.5 ? prog(t, S.rkHiT, S.rkHiT + 0.9) : 0; }
    const pulse = rkPulse(t, S.rkPulses.filter(p => p.code === it.code).map(p => p.t));
    const y = yPos(pos), len = r.v / vmax * maxLen;
    const medal = b > 0.5 ? "#e6e2d9" : [RK.gold, RK.silver, RK.bronze][rank - 1] || RK.grid;
    let fill = RK.bar, ink = "#fff";
    if (isHi && hiOn) fill = RK.hi; else if (lead) { fill = RK.gold; ink = P.ink; }
    let trueRank = 0; if (b > 0.5) trueRank = R.rows.filter(o => o.v > r.v).length + 1;
    ctx.save(); ctx.globalAlpha *= cw;
    rkRow({
      code: it.code, name: it.name, y, len, s, fill, ink, value: rkFmt(r.v, D), rank: b > 0.5 ? "#" + trueRank : String(rank), medal, alpha,
      badge: { mood, look, blink: blinkAt(t, strSeed(it.code)), crown: lead ? clamp(1 - r.pos * 2.5) : 0, sweat: sweatK, pulse },
    });
    ctx.restore();
    if (lead) leader = { x: 130 + len + 58 * s, y };
  });
  rkSource(G);
};

// ---------------------------------------------------------------- versus: country cards (Broadcast "tale of the tape")
// params: left {code,name}, right {code,name}, title, source, rows [{label, left, right}] (real numbers, source required),
// verdict. Events: reveal (each row in order), verdict. Used by the "Country vs country" series; plain versus keeps props.
const RKV = { navy0: "#0a1230", navy1: "#16275a", row: "#152552", rowHi: "#223a78", bar: "#4a78a8" };
function rkPanel(x, y, w, h, fill, sk = 16) { ctx.beginPath(); ctx.moveTo(x + sk, y); ctx.lineTo(x + w + sk, y); ctx.lineTo(x + w - sk, y + h); ctx.lineTo(x - sk, y + h); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function rkWave(code, x, y, w, h, t, seed) {
  const known = flagKnown(code);
  if (!known) warn(`flag '${code}' has no official drawing in studio/engine/flags.js; drew a neutral card with the code (add the flag, never guess it)`);
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x0 = x + w * i / n, dy = Math.sin(t * 5 + i * 0.6 + seed) * 3 * (i / n);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y + dy - 1, w / n + 1, h + 2); ctx.clip(); ctx.translate(0, dy);
    if (known) flagRect(code, x, y, w, h); else { ctx.fillStyle = "#e4e0d6"; ctx.fillRect(x, y, w, h); text(code, x + w / 2, y + h * 0.66, { size: h * 0.5, color: P.ink }); }
    ctx.fillStyle = `rgba(0,0,0,${0.1 + 0.1 * Math.sin(t * 5 + i * 0.6 + seed)})`; ctx.fillRect(x0, y, w / n + 1, h); ctx.restore();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
}
function rkVersus(t, S) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, RKV.navy0); g.addColorStop(1, RKV.navy1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const L = S.p.left, R = S.p.right, rows = S.p.rows || [], right = RK_RIGHT();
  const src = String(S.p.source || "");
  if (!src.trim()) warn(`scene ${S.id}: versus card has no source string; every chart must show its source`);
  // header
  const x0 = 40, hw = right - x0 - 20;
  rkPanel(x0, SAFE.top + 10, 230, 90, RK.hi); text("RANKED", x0 + 115, SAFE.top + 74, { size: 56, color: "#fff", ls: 2 });
  rkPanel(x0 + 240, SAFE.top + 10, hw - 240, 90, "#0f1a3e");
  const hf = fit(String(S.p.title || "TALE OF THE TAPE").toUpperCase(), hw - 240 - 60, 48, 1, "Anton", "versus title");
  text(hf.lines[0], x0 + 270, SAFE.top + 72, { size: hf.size, color: "#fff", align: "left" });
  ctx.fillStyle = RK.gold; ctx.fillRect(x0, SAFE.top + 108, hw, 6);
  // the two flags
  const fy = SAFE.top + 160, fw = 330, fh = 220, cxL = x0 + 20 + fw / 2, cxR = right - 20 - fw / 2;
  const kl = eout(prog(t, S.t0 + 0.1, S.t0 + 0.6)), kr = eout(prog(t, S.t0 + 0.25, S.t0 + 0.75));
  ctx.save(); ctx.translate((kl - 1) * 600, 0); rkWave(L.code, cxL - fw / 2, fy, fw, fh, t, 1);
  const nf = fit(String(L.name).toUpperCase(), fw + 40, 76, 1, "Anton", "versus name"); text(nf.lines[0], cxL, fy + fh + 90, { size: nf.size, color: "#fff" }); ctx.restore();
  ctx.save(); ctx.translate((1 - kr) * 600, 0); rkWave(R.code, cxR - fw / 2, fy, fw, fh, t, 2);
  const nr = fit(String(R.name).toUpperCase(), fw + 40, 76, 1, "Anton", "versus name"); text(nr.lines[0], cxR, fy + fh + 90, { size: nr.size, color: "#fff" }); ctx.restore();
  const kv = pop(t, S.t0 + 0.5, 0.3); ctx.save(); ctx.translate((cxL + cxR) / 2, fy + fh / 2); ctx.scale(kv, kv); rkPanel(-60, -52, 120, 104, RK.hi, 12); text("VS", 0, 30, { size: 78, color: "#fff" }); ctx.restore();
  // metric rows
  const ry0 = fy + fh + 170, pitch = Math.min(150, (STAGE.y + STAGE.h - 60 - ry0) / Math.max(1, rows.length));
  const rev = S.ev.filter(e => e.do.includes("reveal")).sort((a, b) => a.t - b.t).map(e => e.t);
  rows.forEach((r, i) => {
    const at = rev[i] != null ? rev[i] : S.t0 + 1.0 + i * 0.4, k = eout(prog(t, at, at + 0.5)), y = ry0 + i * pitch;
    if (k <= 0) return;
    const a = +r.left, b = +r.right, m = Math.max(a, b, 1e-9), half = (right - 40 - 2 * 20 - 40) / 2 - 100;
    ctx.save(); ctx.globalAlpha = k;
    const lf = fit(String(r.label).toUpperCase(), right - 100, 34, 1, "Anton", "versus row label");
    text(lf.lines[0], RK_CX(), y, { size: lf.size, color: "rgba(255,255,255,0.85)" });
    const cxm = RK_CX();
    ctx.fillStyle = a >= b ? RK.gold : RKV.bar; ctx.fillRect(cxm - 16 - half * a / m * k, y + 18, half * a / m * k, 38);
    ctx.fillStyle = b >= a ? RK.gold : RKV.bar; ctx.fillRect(cxm + 16, y + 18, half * b / m * k, 38);
    const dec = r.decimals != null ? +r.decimals : (a % 1 || b % 1 ? 1 : 0);
    text(a.toFixed(dec), x0 + 10, y + 56, { size: 42, color: "#fff", align: "left" });
    text(b.toFixed(dec), right - 20, y + 56, { size: 42, color: "#fff", align: "right" });
    ctx.restore();
  });
  const vt = evT(S, "verdict", null);
  if (S.p.verdict && vt != null) stamp(String(S.p.verdict).toUpperCase(), S.p.verdict_side === "left" ? cxL : S.p.verdict_side === "right" ? cxR : RK_CX(), fy + fh / 2, t - vt, { color: RK.gold, size: 110, maxW: fw + 40 });
  const sf = fit("Source: " + src, right - 50, 26, 2, "Elite", "source line");
  sf.lines.forEach((ln, i) => text(ln, 50, STAGE.y + STAGE.h - 8 - (sf.lines.length - 1 - i) * sf.size * 1.15, { size: sf.size, font: "Elite", color: "rgba(255,255,255,0.7)", align: "left" }));
}
// plain `versus` (props) stays in cards.js; country cards are chosen when both sides are {code, name} objects
const rkPlainVersus = SCENE_FNS.versus;
SCENE_FNS.versus = (t, S) => (S.p.left && typeof S.p.left === "object" && S.p.left.code) ? rkVersus(t, S) : rkPlainVersus(t, S);

// ---------------------------------------------------------------- load-time preparation
SC.forEach(S => {
  S.cues = S.cues || [];
  if (S.type === "ranking_bars") rkPrep(S, false);
  if (S.type === "ranking_race") rkPrep(S, true);
  if (S.type === "versus" && S.p.left && typeof S.p.left === "object" && S.p.left.code) {
    const rev = S.ev.filter(e => e.do.includes("reveal")).map(e => e.t);
    S.landAt = Math.max(S.t0 + 1.0 + (S.p.rows || []).length * 0.4, ...rev, ...S.ev.map(e => e.t)) + 0.8;
    rev.forEach(x => S.cues.push({ t: +x.toFixed(3), type: "pop" }));
  }
});

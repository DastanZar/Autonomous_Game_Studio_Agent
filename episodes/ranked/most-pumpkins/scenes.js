// Countries ranked by pumpkins, squash and gourds grown (FAOSTAT 2024). Leader Flags house method: C.
// Every number is a row of data/faostat_pumpkins_squash_gourds_2024.csv. Pumpkins are drawn in code.
const LOCAL_FLAGS = ["EG", "UA"];
const SRC = "FAOSTAT 2024 · pumpkins, squash and gourds";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
// flags not in the shared set live in this episode's flags/ folder (Wikimedia Commons, public domain; see flags/README.md)
LOCAL_FLAGS.forEach(c => {
  const img = new Image(); img.src = "../../episodes/ranked/" + EP.storyboard.episode + "/flags/" + c + ".svg"; FLAGART[c] = img;
  window.PRELOAD.push(new Promise(r => { img.onload = r; img.onerror = () => { warn("episode flag missing: " + c); r(); }; }));
});
const N = v => Math.round(v).toLocaleString("en-US");
CU.entry = lfEntry;
// a ranked list that grows as each place is named: rows without `at` were named in an earlier scene and sit dimmed.
// row: {rank, code, name, value, at, valueAt, dec (decimals), suffix}
CU.rows = (t, S) => {
  rankBG(t);
  const p = S.p, y0 = p.y0 || 430, dy = p.dy || 140;
  if (p.title) kText(p.title, W / 2 - 70, y0 - 110, 64, t, S.t0, { color: LF.fg, stroke: 10, ink: LF.ink, ls: 2 });
  p.rows.forEach((r, i) => {
    const ta = r.at ? cue(r.at) - 0.15 : -1, k = r.at ? kSpring(kpp(t, ta, 0.5)) : 1; if (k <= 0) return;
    const y = y0 + i * dy, a = r.at ? 1 : 0.5;
    withAlpha(a, () => {
      ctx.save(); ctx.translate((1 - Math.min(1, k)) * -500, 0);
      ctx.fillStyle = "rgba(8,14,40,0.55)"; ctx.beginPath(); ctx.roundRect(60, y - 58, 840, 116, 58); ctx.fill();
      const rk = "#" + r.rank;
      text(rk, 130, y + 22, { size: rk.length > 3 ? 44 : 58, color: r.rank <= 3 ? LF.gold : LF.fg, stroke: 8, ink: LF.ink });
      flagBadge(r.code, 250, y, 48);
      text(r.name.toUpperCase(), 320, y + 22, { size: r.name.length > 11 ? 50 : 60, align: "left", color: LF.fg, stroke: 8, ink: LF.ink });
      const kv = r.at ? eout(kpp(t, cue(r.valueAt || r.at) - 0.1, 0.6)) : 1, d = r.dec || 0;
      if (kv > 0) rollNumber(r.value * kv, 870, y + 24, 66, { align: "right", color: LF.gold, stroke: 9, ink: LF.ink, fmt: v => (d ? v.toFixed(d) : N(v)) + (r.suffix || ""), roll: false });
      ctx.restore();
    });
  });
  if (p.note) kText(p.note, W / 2 - 70, y0 + p.rows.length * dy + 10, 34, t, cue(p.noteAt) - 0.1, { color: "rgba(244,241,234,0.85)", font: "Elite", stagger: 0.012 });
  srcLine(SRC);
};
// a pulsing ring on the globe for places whose land is too scattered or small to see (params.ring: [codes]).
// Same projection as rank.js lfGlobe; drawn right after the stage so flags and text stay on top.
function lfRingAt(t, codes) {
  const F = lfFocusNow(t), cur = F.cur, prv = F.prv, k = eio(clamp((t - (cur.t || 0)) / 1.0));
  let dl = cur.lon - prv.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
  const lon0 = prv.lon + dl * k + (t - (cur.t || 0)) * 1.5, lat0 = clamp(lerp(prv.lat, cur.lat, k) - 24, -60, 60);
  const cx = W / 2 - 70, cy = 1330, R = 980, ph = lat0 * Math.PI / 180, sp = Math.sin(ph), cp = Math.cos(ph);
  codes.forEach(c => {
    const cc = lfCen(lfKey(c)); if (!cc) return;
    const l = (cc[0] - lon0) * Math.PI / 180, f = cc[1] * Math.PI / 180, cl = Math.cos(f), z = sp * Math.sin(f) + cp * cl * Math.cos(l);
    if (z < 0.15) return;
    const x = cx + cl * Math.sin(l) * R, y = cy - (cp * Math.sin(f) - sp * cl * Math.cos(l)) * R;
    for (let r = 0; r < 2; r++) { const u = (t * 0.8 + r * 0.5) % 1; ctx.strokeStyle = `rgba(255,214,120,${0.85 * (1 - u)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 46 + u * 70, 0, 7); ctx.stroke(); }
  });
}
const _lfBG = rankBG;
rankBG = (t, o) => { _lfBG(t, o); const S = sceneAt(t); if (S.p.ring) lfRingAt(t, S.p.ring); };
// a pumpkin (or squash, or gourd) in flat cut-out style; kind 0 pumpkin, 1 squash, 2 gourd
function gourd(x, y, r, t, kind = 0, seed = 0) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + seed) * 4); ctx.rotate(Math.sin(t * 1.3 + seed) * 0.04);
  ctx.lineWidth = Math.max(3, r * 0.07); ctx.strokeStyle = LF.ink;
  const body = (cx, cy, rx, ry, col) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.stroke(); };
  if (kind === 0) { [[-0.55, 0.42, "#e8771e"], [0.55, 0.42, "#e8771e"], [-0.25, 0.5, "#f28c28"], [0.25, 0.5, "#f28c28"], [0, 0.5, "#f7a03c"]].forEach(([dx, w, c]) => body(dx * r, 0, w * r, 0.8 * r, c)); }
  else if (kind === 1) { body(0, 0.25 * r, 0.62 * r, 0.6 * r, "#e9b949"); body(0, -0.45 * r, 0.32 * r, 0.5 * r, "#f0c95c"); }
  else { body(0, 0.3 * r, 0.55 * r, 0.55 * r, "#7fa34a"); body(0, -0.4 * r, 0.25 * r, 0.45 * r, "#e6d36a"); }
  ctx.fillStyle = "#4a7a2c"; ctx.beginPath(); ctx.roundRect(-0.09 * r, (kind === 0 ? -0.95 : -1.05) * r, 0.18 * r, 0.32 * r, 4); ctx.fill(); ctx.stroke();
  ctx.restore();
}
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST PUMPKINS?", W / 2 - 70, 380, 120, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  [[150, 0], [790, 1]].forEach(([x, s]) => gourd(x, 560, 70, t, 0, s));
  flagRow(["US"], 760, t, -1);
  const ta = cue("hook/america");
  if (t > ta) stamp("NOT AMERICA", W / 2 - 70, 1080, t - ta, { size: 110, rot: -0.08, color: LF.red });
};
CU.item = (t, S) => {
  rankBG(t);
  [["PUMPKINS", 0, 200, "item/pumpkins"], ["SQUASH", 1, 470, "item/squash"], ["GOURDS", 2, 740, "item/gourds"]].forEach(([n, k, x, c], i) => {
    const kk = kSpring(kpp(t, cue(c) - 0.15, 0.5)); if (kk <= 0) return;
    ctx.save(); ctx.translate(x, 640); ctx.scale(kk, kk); gourd(0, 0, 95, t, k, i); ctx.restore();
    kText(n, x, 820, 54, t, cue(c) - 0.05, { color: LF.fg, stroke: 9, ink: LF.ink, ls: 2 });
  });
  kText("ONE FAO CROP", W / 2 - 70, 1010, 84, t, cue("item/one") - 0.15, { color: LF.gold, stroke: 12, ink: LF.ink, ls: 3 });
  srcLine(SRC);
};
CU.india = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["IN"], 560, t, S.t0 + 0.05, { halo: LF.gold, labels: ["INDIA"], labelSize: 64 });
  bigNumber(t, cue("india/nine") - 0.15, { value: 9.33, fmt: v => v.toFixed(2), rollDigits: false, suffix: "M", label: "TONNES, 2024", sub: S.p.sub, stroke: 16, size: 210, y: 1080, roll: 1.0, labelSize: 56, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  srcLine(SRC);
};
CU.ten = (t, S) => {
  rankBG(t);
  const t1 = S.t0 + 0.05, t2 = cue("ten/america") - 0.2;
  flagBadge("IN", 140, 520, 56); kText("INDIA", 140, 640, 44, t, t1, { color: LF.fg, stroke: 8, ink: LF.ink });
  for (let i = 0; i < 10; i++) { const k = kSpring(kpp(t, S.t0 + 0.05 + i * 0.06, 0.4)); if (k <= 0) continue;
    ctx.save(); ctx.translate(260 + (i % 5) * 140, 470 + Math.floor(i / 5) * 130); ctx.scale(k, k); gourd(0, 0, 52, t, 0, i); ctx.restore(); }
  if (t > t2) { const k = kSpring(kpp(t, t2, 0.5)); flagBadge("US", 140, 900, 56); kText("USA", 140, 1020, 44, t, t2, { color: LF.fg, stroke: 8, ink: LF.ink });
    ctx.save(); ctx.translate(260, 900); ctx.scale(k, k); gourd(0, 0, 52, t, 0, 11); ctx.restore(); }
  kText("10 TIMES", 640, 935, 84, t, cue("ten/times") - 0.1, { color: LF.gold, stroke: 12, ink: LF.ink });
  kText(S.p.sub, W / 2 - 70, 1150, 30, t, cue("ten/times"), { color: LF.fg, font: "Elite", stagger: 0.008 });
  srcLine(SRC);
};
CU.toll = (t, S) => {
  rankBG(t);
  faceoff(t, S.t0, { code: "IN", name: "India", value: 9330691 }, { code: "US", name: "United States", value: 934922 }, { fmt: v => (v / 1e6).toFixed(2) + "M t" });
  srcLine(SRC);
};

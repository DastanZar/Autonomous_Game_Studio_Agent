// Where Major League players were born outside the 50 states (MLB, 2026 Opening Day), by count and per person. Method C.
// Every number is a row of data/mlb_opening_day_2026_by_birthplace.csv (MLB counts, World Bank 2024 populations).
const LOCAL_FLAGS = ["DO", "VE", "CU", "PR", "CW"];
const SRC = "MLB, 2026 Opening Day rosters";
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
CU.hook = (t, S) => {
  rankBG(t);
  kText("NEARLY 1 IN 10", W / 2 - 70, 360, 120, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  kText("MLB PLAYERS", W / 2 - 70, 480, 90, t, -1, { color: LF.blue, stroke: 12, ink: LF.ink, ls: 3 });
  const td = cue("hook/dominican") - 0.2;
  for (let i = 0; i < 10; i++) {           // ten players, one of them Dominican
    const x = 470 + (i - 4.5) * 84, y = 640 + Math.sin(t * 2 + i) * 5, gold = i === 0 && t > td;
    ctx.beginPath(); ctx.arc(x, y - 26, 16, 0, 7); ctx.fillStyle = gold ? LF.gold : "rgba(244,241,234,0.85)"; ctx.fill();
    ctx.beginPath(); ctx.roundRect(x - 22, y - 6, 44, 56, 14); ctx.fill();
  }
  flagRow(["DO"], 900, t, td, { w: 380 });
};
CU.count = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["DO"], 560, t, S.t0 + 0.05, { halo: LF.gold, labels: ["DOMINICAN REPUBLIC"], labelSize: 56 });
  bigNumber(t, cue("count/ninetythree") - 0.15, { value: 93, label: "PLAYERS", sub: S.p.sub, stroke: 16, size: 230, y: 1060, roll: 0.8, labelSize: 60, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  srcLine(SRC);
};
CU.pivot = (t, S) => {
  rankBG(t);
  kText("PER PERSON?", W / 2 - 70, 520, 130, t, S.t0 + 0.05, { color: LF.gold, stroke: 16, ink: LF.ink, ls: 4 });
  const ts = cue("pivot/smaller") - 0.3, k = eio(kpp(t, ts, 0.8)), x = W / 2 - 70;
  ctx.save(); ctx.translate(x, 860); const s = lerp(1, 0.35, k); ctx.scale(s, s);
  ctx.strokeStyle = LF.fg; ctx.lineWidth = 8 / s; ctx.setLineDash([24 / s, 18 / s]); ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.stroke(); ctx.restore();
  srcLine("MLB 2026; World Bank population, 2024");
};
CU.curacao = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0, 300);
  kText("PER PERSON", W / 2 - 70, 430, 56, t, S.t0 + 0.1, { color: LF.gold, stroke: 9, ink: LF.ink, ls: 3 });
  flagRow(["CW"], 640, t, S.t0 + 0.05, { halo: LF.gold, w: 400, labels: ["CURAÇAO"], labelSize: 64 });
  bigNumber(t, cue("curacao/four") - 0.15, { value: 4, label: "MAJOR LEAGUERS", sub: S.p.sub, stroke: 16, size: 200, y: 1080, roll: 0.5, labelSize: 52, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  srcLine("MLB 2026; World Bank population, 2024");
};
CU.ratio = (t, S) => {
  rankBG(t);
  kText("PLAYERS PER MILLION PEOPLE", W / 2 - 70, 300, 50, t, S.t0, { color: LF.fg, stroke: 8, ink: LF.ink, ls: 2 });
  faceoff(t, S.t0, { code: "CW", name: "Curaçao", value: 25.65 }, { code: "DO", name: "Dominican Rep.", value: 8.14 }, { fmt: v => v.toFixed(1), crown: false });
  srcLine("MLB 2026; World Bank population, 2024");
};
CU.toll = (t, S) => {
  rankBG(t);
  const t2 = cue("toll/per") - 0.2;
  [["DO", 270, "MOST PLAYERS", "93", S.t0], ["CW", 690, "PER PERSON", "#1", t2]].forEach(([c, x, lab, v, t0]) => {
    const k = kSpring(kpp(t, t0, 0.6)); if (k <= 0) return;
    ctx.save(); ctx.translate(x, 520 + Math.sin(t * 1.5 + x) * 8); ctx.scale(k, k); softHalo(0, 0, 260, LF.gold, 0.3); flagArt(c, -150, -93, 300, 186, { lw: 5 }); ctx.restore();
    kText(lab, x, 720, 52, t, t0 + 0.2, { color: LF.gold, stroke: 9, ink: LF.ink, ls: 2 });
    kText(v, x, 900, 150, t, t0 + 0.35, { color: LF.fg, stroke: 14, ink: LF.ink });
  });
  srcLine("MLB 2026; World Bank population, 2024");
};

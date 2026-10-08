// Countries ranked by meat supply per person (FAO Food Balances 2023, via Our World in Data). Leader Flags house method: C.
// Every number is a row of data/meat_supply_per_person_2023.csv.
const LOCAL_FLAGS = ["TO", "MN", "MH", "CD"];
const SRC = "FAO Food Balances 2023 (Our World in Data)";
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
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST MEAT", W / 2 - 70, 360, 130, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  kText("PER PERSON?", W / 2 - 70, 500, 110, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  flagRow(["US"], 790, t, -1);
  const ta = cue("hook/america");
  if (t > ta) stamp("NOT AMERICA", W / 2 - 70, 1100, t - ta, { size: 110, rot: -0.08, color: LF.red });
};
CU.first = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["TO"], 560, t, S.t0 + 0.05, { halo: LF.gold, labels: ["TONGA"], labelSize: 64 });
  bigNumber(t, cue("first/one") - 0.15, { value: 157, suffix: " KG", label: "PER PERSON, PER YEAR", sub: S.p.label, stroke: 16, size: 210, y: 1080, roll: 1.0, labelSize: 52, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  srcLine(SRC);
};
CU.day = (t, S) => {
  rankBG(t);
  const tf = cue("day/four") - 0.15;
  bigNumber(t, tf, { value: 430, suffix: " g", label: "A DAY, PER PERSON", sub: "Tonga: 157 kg ÷ 365 days", stroke: 16, size: 230, y: 760, roll: 0.9, labelSize: 60, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  flagRow(["TO"], 1060, t, S.t0, { w: 230 });
  srcLine(SRC);
};
CU.supply = (t, S) => {
  rankBG(t);
  kText("SUPPLY", W / 2 - 70, 560, 150, t, S.t0 + 0.05, { color: LF.gold, stroke: 16, ink: LF.ink, ls: 4 });
  const tn = cue("supply/not") - 0.15;
  if (t > tn) { stamp("NOT ALL EATEN", W / 2 - 70, 760, t - tn, { size: 100, rot: -0.06, color: LF.red }); }
  kText("FAO counts meat available for consumption.", W / 2 - 70, 960, 32, t, S.t0 + 0.3, { color: LF.fg, font: "Elite", stagger: 0.008 });
  kText("It does not correct for waste. Fish not included.", W / 2 - 70, 1010, 32, t, S.t0 + 0.6, { color: LF.fg, font: "Elite", stagger: 0.008 });
  srcLine(SRC);
};
CU.toll = (t, S) => {
  rankBG(t);
  faceoff(t, S.t0, { code: "TO", name: "Tonga", value: 156.93 }, { code: "US", name: "United States", value: 122.06 }, { fmt: v => Math.round(v) + " kg" });
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

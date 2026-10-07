// Countries ranked by nuclear warheads (SIPRI Yearbook 2026, January 2026 estimates). Leader Flags house method: C.
// Every number below is a row of data/sipri_world_nuclear_forces_2026.csv (total inventory).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
// flags not in the shared set live in this episode's flags/ folder (Wikimedia Commons, public domain; see flags/README.md)
const LOCAL_FLAGS = ["PK", "IL", "KP"];
LOCAL_FLAGS.forEach(c => {
  const img = new Image(); img.src = "../../episodes/ranked/" + EP.storyboard.episode + "/flags/" + c + ".svg"; FLAGART[c] = img;
  window.PRELOAD.push(new Promise(r => { img.onload = r; img.onerror = () => { warn("episode flag missing: " + c); r(); }; }));
});
const SRC = "SIPRI Yearbook 2026 · estimates, Jan 2026 · total warheads";
const N = v => Math.round(v).toLocaleString("en-US");
CU.entry = lfEntry;
// a ranked list that grows as each place is named: rows without `at` were named in an earlier scene and sit dimmed
CU.rows = (t, S) => {
  rankBG(t);
  const p = S.p, y0 = p.y0 || 430, dy = p.dy || 140;
  p.rows.forEach((r, i) => {
    const ta = r.at ? cue(r.at) - 0.15 : -1, k = r.at ? kSpring(kpp(t, ta, 0.5)) : 1; if (k <= 0) return;
    const y = y0 + i * dy, a = r.at ? 1 : 0.5;
    withAlpha(a, () => {
      ctx.save(); ctx.translate((1 - Math.min(1, k)) * -500, 0);
      ctx.fillStyle = "rgba(8,14,40,0.55)"; ctx.beginPath(); ctx.roundRect(60, y - 58, 840, 116, 58); ctx.fill();
      text("#" + r.rank, 130, y + 22, { size: 58, color: r.rank <= 3 ? LF.gold : LF.fg, stroke: 8, ink: LF.ink });
      flagBadge(r.code, 250, y, 48);
      text(r.name.toUpperCase(), 320, y + 22, { size: r.name.length > 11 ? 50 : 60, align: "left", color: LF.fg, stroke: 8, ink: LF.ink });
      const kv = r.at ? eout(kpp(t, cue(r.valueAt || r.at) - 0.1, 0.6)) : 1;
      if (kv > 0) rollNumber(r.value * kv, 870, y + 24, 66, { align: "right", color: LF.gold, stroke: 9, ink: LF.ink, fmt: N, roll: false });
      ctx.restore();
    });
  });
  if (p.note) kText(p.note, W / 2 - 70, y0 + p.rows.length * dy + 10, 34, t, cue(p.noteAt) - 0.1, { color: "rgba(244,241,234,0.85)", font: "Elite", stagger: 0.012 });
  srcLine(SRC);
};
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST NUCLEAR", W / 2 - 70, 360, 120, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  kText("WEAPONS?", W / 2 - 70, 490, 120, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  flagRow(["US"], 790, t, -1);
  const ta = cue("hook/america");
  if (t > ta) stamp("NOT AMERICA", W / 2 - 70, 1100, t - ta, { size: 110, rot: -0.08, color: LF.red });
};
CU.nine = (t, S) => {
  rankBG(t);
  bigNumber(t, cue("nine/about") - 0.1, { value: 12187, label: "WARHEADS", sub: S.p.label, stroke: 16, size: 210, y: 1010, roll: 1.0, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  const codes = ["RU", "US", "CN", "FR", "GB", "IN", "PK", "IL", "KP"], tn = cue("nine/nine") - 0.15;
  kText("9 COUNTRIES", W / 2 - 70, 380, 96, t, tn, { color: LF.fg, stroke: 12, ink: LF.ink, ls: 3 });
  codes.forEach((c, i) => { const k = kSpring(kpp(t, tn + i * 0.07, 0.45)); if (k <= 0) return; const x = 470 + (i - 4) * 98, y = 560 + Math.sin(t * 2 + i) * 6;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); flagBadge(c, 0, 0, 42); ctx.restore(); });
  srcLine(SRC);
};
CU.russia = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["RU"], 560, t, S.t0 + 0.05, { halo: LF.gold });
  bigNumber(t, cue("russia/five") - 0.15, { value: 5420, label: "WARHEADS", sub: S.p.label, stroke: 16, size: 210, y: 1010, roll: 1.4, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
  srcLine(SRC);
};
CU.share = (t, S) => {
  rankBG(t);
  flagRow(["RU", "US"], 470, t, S.t0);
  const t8 = cue("share/eightythree") - 0.2, k = eout(kpp(t, t8, 1.0)), cx = W / 2 - 70, cy = 850, R = 170;
  ctx.save(); ctx.lineWidth = 46; ctx.strokeStyle = "rgba(244,241,234,0.18)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  if (k > 0) { ctx.strokeStyle = LF.gold; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 6.2832 * 0.83 * k); ctx.stroke(); }
  ctx.restore();
  if (k > 0) text(Math.round(83 * k) + "%", cx, cy + 40, { size: 120, color: LF.fg, stroke: 12, ink: LF.ink });
  kText("OF THE USABLE WARHEADS", cx, 1120, 52, t, cue("share/usable") - 0.2, { color: LF.gold, stroke: 9, ink: LF.ink, ls: 2 });
  kText(S.p.label, cx, 1180, 30, t, cue("share/usable"), { color: LF.fg, font: "Elite", stagger: 0.01 });
  srcLine(SRC);
};
CU.toll = (t, S) => {
  rankBG(t);
  faceoff(t, S.t0, { code: "RU", name: "Russia", value: 5420 }, { code: "US", name: "United States", value: 5042 }, { fmt: N });
  const tb = cue("toll/by") - 0.1;
  if (t > tb) popIn(W / 2 - 70, 1270 - 60, kSpring(kpp(t, tb, 0.45)), () => tag("GAP: 378 WARHEADS", 0, 0, { size: 38 }));
  srcLine(SRC);
};

// US states vs countries by GDP (2024, nominal). Leader Flags house method: C (kinetic infographic).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SRC = "BEA (states) and World Bank (countries), 2024, via Wikipedia";
const T$ = v => "$" + (v / 1e6).toFixed(2) + "T";
CU.hook = (t, S) => { rankBG(t); kText("STATE VS COUNTRY", W / 2 - 70, 250, 60, t, -1, { color: LF.blue, stroke: 8, ink: LF.ink, ls: 4 }); faceoff(t, -2, { code: "US-CA", name: "California", value: 4103124 }, { code: "JP", name: "Japan", value: 4026211 }, { fmt: T$ }); srcLine(SRC); };
CU.fourth = (t, S) => {
  rankBG(t);
  bigNumber(t, cue("fourth/four") - 0.15, { value: 4.1, prefix: "$", suffix: "T", fmt: v => v.toFixed(1), label: "CALIFORNIA, 2024", stroke: 16, size: 230, y: 520, roll: 0.8, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink } });
  const rows = [["US", "UNITED STATES"], ["CN", "CHINA"], ["DE", "GERMANY"], ["US-CA", "CALIFORNIA"], ["JP", "JAPAN"]], tr = cue("fourth/rank") - 0.2;
  rows.forEach(([c, n], i) => { const k = kSpring(kpp(t, tr + i * 0.12, 0.45)); if (k <= 0) return; const y = 760 + i * 92; ctx.save(); ctx.translate(140, y); ctx.scale(k, k);
    text(String(i + 1), 0, 22, { size: 56, color: i === 3 ? LF.gold : LF.fg, stroke: 8, ink: LF.ink }); flagBadge(c, 90, 0, 36); text(n, 150, 20, { size: 52, align: "left", color: i === 3 ? LF.gold : LF.fg, stroke: 8, ink: LF.ink }); ctx.restore(); });
  if (t > cue("japan/japan") - 0.1) popIn(720, 1220, kSpring(kpp(t, cue("japan/japan") - 0.1, 0.45)), () => tag("JAPAN: $4.03T", 0, 0, { size: 40 }));
  srcLine("Sherwood News (IMF, BEA); BEA, World Bank 2024");
};
CU.duel = (t, S) => {
  rankBG(t);
  faceoff(t, cue(S.p.at) - 0.2, S.p.L, S.p.R, { fmt: T$ });
  if (S.p.extra && t > cue(S.p.extra.at) - 0.1) { const k = kSpring(kpp(t, cue(S.p.extra.at) - 0.1, 0.5)); ctx.save(); ctx.translate(690, 1260); ctx.scale(k, k); flagBadge(S.p.extra.code, -150, 0, 34); tag(S.p.extra.name, 30, 0, { size: 34 }); ctx.restore(); }
  srcLine(SRC);
};
CU.canada = (t, S) => {
  rankBG(t);
  flagRow(["CA"], 560, t, S.t0, { w: 420 });
  const t2 = cue("canada/two") - 0.2;
  [["US-TX", 250], ["US-NY", 690]].forEach(([c, x], i) => { const k = kSpring(kpp(t, t2 + i * 0.15, 0.5)); if (k <= 0) return; ctx.save(); ctx.translate(x, 960); ctx.scale(k, k); flagArt(c, -130, -80, 260, 160, { lw: 5 }); ctx.restore(); });
  kText("OUTSCORED BY 2 STATES", W / 2 - 70, 1180, 70, t, t2 + 0.3, { color: LF.gold, stroke: 10, ink: LF.ink });
  srcLine(SRC);
};
CU.toll = (t, S) => { rankBG(t); faceoff(t, S.t0, { code: "US-CA", name: "California", value: 4103124 }, { code: "JP", name: "Japan", value: 4026211 }, { fmt: T$ }); srcLine(SRC); };

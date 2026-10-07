// Most men's World Cup titles, after the 2026 final. Leader Flags house method: C (kinetic infographic) with
// official flag art (rank kit + flagart + kinetic).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
CU.entry = lfEntry;
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST WORLD CUP TITLES?", W / 2 - 70, 380, 92, t, -1, { color: LF.fg, stroke: 12, ink: LF.ink, ls: 2 });
  flagRow(["ES"], 760, t, -1, { halo: LF.gold });
  kText("2026 CHAMPIONS", W / 2 - 70, 1060, 72, t, cue("hook/second") - 0.1, { color: LF.gold, stroke: 10, ink: LF.ink, ls: 3 });
};
CU.five = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["BR"], 560, t, S.t0 + 0.05, { halo: LF.gold });
  bigNumber(t, cue("five/five") - 0.15, { value: 5, label: "TITLES", sub: "the only team at every World Cup", stroke: 16, size: 240, y: 1020, roll: 0.6, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
};
CU.eight = (t, S) => {
  rankBG(t);
  const codes = ["BR", "DE", "IT", "AR", "FR", "UY", "ES", "GB-ENG"], t8 = cue("eight/only") - 0.2;
  codes.forEach((c, i) => { const k = kSpring(kpp(t, t8 + i * 0.09, 0.45)); if (k <= 0) return; const x = 175 + (i % 4) * 200, y = 560 + Math.floor(i / 4) * 230 + Math.sin(t * 2 + i) * 6; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); flagBadge(c, 0, 0, 80); ctx.restore(); });
  kText("ONLY 8 WINNERS", W / 2 - 70, 380, 100, t, t8, { color: LF.gold, stroke: 12, ink: LF.ink, ls: 2 });
  kText("84 nations have played · 13 reached a final", W / 2 - 70, 1110, 30, t, t8 + 0.8, { color: LF.fg, font: "Elite", stagger: 0.01 });
  srcLine("Wikipedia, List of FIFA World Cup finals");
};
CU.toll = (t, S) => {
  rankBG(t);
  faceoff(t, S.t0, { code: "ES", name: "Spain", value: 2 }, { code: "BR", name: "Brazil", value: 5 }, { fmt: v => Math.round(v) + "" });
};

// The countries with the most islands (national counts). Leader Flags house method: C (kinetic infographic).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
CU.entry = lfEntry;
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST ISLANDS?", W / 2 - 70, 380, 120, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  flagRow(["ID"], 760, t, -1);
  if (t > cue("hook/not")) stamp("NOT INDONESIA", W / 2 - 70, 1080, t - cue("hook/not"), { size: 100, rot: -0.08, color: LF.red });
};
CU.sweden = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  rankChip(1, t, S.t0);
  flagRow(["SE"], 540, t, S.t0 + 0.05, { halo: LF.gold });
  bigNumber(t, cue("sweden/two") - 0.15, { value: 267570, label: "ISLANDS", sub: "Statistics Sweden, 2013 count", stroke: 16, size: 190, y: 1000, roll: 1.4, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
};
CU.tiny = (t, S) => {                          // nine square metres: about a parking space
  rankBG(t);
  const tp = cue("tiny/parking") - 0.2, k = kSpring(kpp(t, tp, 0.6));
  ctx.save(); ctx.translate(W / 2 - 70, 760);
  ctx.fillStyle = "#2c6a9a"; ctx.beginPath(); ctx.roundRect(-330, -260, 660, 520, 40); ctx.fill();
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, -200 + i * 80 + Math.sin(t * 2 + i) * 6); ctx.quadraticCurveTo(0, -215 + i * 80, 300, -200 + i * 80 + Math.cos(t * 2 + i) * 6); ctx.stroke(); }
  ctx.fillStyle = "#8a7a5a"; ctx.beginPath(); ctx.roundRect(-150, -150, 300, 300, 30); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = LF.ink; ctx.stroke();
  if (k > 0) { ctx.save(); ctx.scale(k, k); ctx.setLineDash([24, 18]); ctx.strokeStyle = "#f4f1ea"; ctx.lineWidth = 8; ctx.strokeRect(-115, -125, 230, 250); ctx.setLineDash([]);
    ctx.fillStyle = LF.red; ctx.beginPath(); ctx.roundRect(-70, -95, 140, 190, 30); ctx.fill(); ctx.strokeStyle = LF.ink; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = "#bcd7ef"; ctx.fillRect(-50, -60, 100, 40); ctx.restore(); }
  ctx.restore();
  kText("SMALLEST COUNTED: 9 m²", W / 2 - 70, 380, 76, t, S.t0 + 0.2, { color: LF.gold, stroke: 12, ink: LF.ink });
  srcLine("Scandinavia Standard, on Statistics Sweden's 2013 inventory");
};
CU.toll = (t, S) => {
  rankBG(t);
  faceoff(t, S.t0, { code: "SE", name: "Sweden", value: 267570 }, { code: "ID", name: "Indonesia", value: 17508 }, { fmt: v => Math.round(v).toLocaleString("en-US") });
};

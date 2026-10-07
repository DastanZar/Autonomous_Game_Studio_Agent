// The countries with the most time zones. Leader Flags house method: C (kinetic infographic).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
CU.entry = lfEntry;
CU.hook = (t, S) => {
  rankBG(t);
  kText("MOST TIME ZONES?", W / 2 - 70, 380, 110, t, -1, { color: LF.fg, stroke: 14, ink: LF.ink, ls: 3 });
  flagRow(["RU"], 760, t, -1);
  if (t > cue("hook/not")) stamp("NOT RUSSIA", W / 2 - 70, 1080, t - cue("hook/not"), { size: 110, rot: -0.08, color: LF.red });
};
CU.france = (t, S) => {
  rankBG(t, { bg1: "#3a2f10" });
  flagRow(["FR"], 600, t, S.t0 + 0.05, { halo: LF.gold });
  clocks(12, t, S.t0 + 0.3, 400, { per: 12, r: 30 });
  bigNumber(t, cue("france/twelve") - 0.15, { value: 12, label: "TIME ZONES", sub: "13 with its Antarctic claim", stroke: 16, size: 230, y: 1010, roll: 0.7, colors: { fg: LF.gold, accent: LF.fg, ink: LF.ink }, subColor: LF.fg });
};
CU.china = (t, S) => {                         // five geographical zones collapse into one clock
  rankBG(t);
  flagRow(["CN"], 560, t, S.t0, { w: 420 });
  const to = cue("china/one") - 0.2, m = eio(kpp(t, to, 0.6));
  for (let i = 0; i < 5; i++) { const k = kSpring(kpp(t, cue("china/five") - 0.3 + i * 0.1, 0.45)); if (k <= 0) continue; const x0 = 150 + i * 180, x = lerp(x0, W / 2 - 70, m), a = i === 2 ? 1 : 1 - m;
    withAlpha(a, () => { ctx.save(); ctx.translate(x, 960); ctx.scale(k * (i === 2 ? 1 + m * 0.6 : 1), k * (i === 2 ? 1 + m * 0.6 : 1)); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = "#f4f1ea"; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = LF.ink; ctx.stroke();
      const hA = (m > 0.5 ? 8 : 6 + i) / 12 * 6.283 - Math.PI / 2; line(0, 0, Math.cos(hA) * 40, Math.sin(hA) * 40, LF.ink, 8); line(0, 0, Math.cos(t * 1.5) * 55, Math.sin(t * 1.5) * 55, LF.red, 5); ctx.restore(); }); }
  if (t > to + 0.4) kText("ONE CLOCK: UTC+8", W / 2 - 70, 1180, 64, t, to + 0.4, { color: LF.gold, stroke: 10, ink: LF.ink });
  srcLine("Wikipedia, Time in China");
};
CU.toll = (t, S) => { rankBG(t); faceoff(t, S.t0, { code: "FR", name: "France", value: 12 }, { code: "CN", name: "China", value: 1 }, { fmt: v => Math.round(v) + "" }); };

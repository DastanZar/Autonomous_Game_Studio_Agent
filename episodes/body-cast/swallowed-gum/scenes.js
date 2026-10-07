// Does swallowed gum stay in you for seven years? Gut Gang house method: organ cast and flat props (body kit),
// moving type for the one big number (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
CU.hook = (t, S) => {
  SETS.spotlight(t);
  gumBlob(700, 980, 1.1, t, { mood: "smug", look: [-1, 0] });
  castAt("stomach", 270, SB("stomach") * 0.7, t, { mood: t > cue("hook/seven") ? "shocked" : "worried", look: [1, 0] });
  stageTitle(t < cue("hook/seven") - 0.1 ? "SWALLOWED GUM" : "7 YEARS?", t, 0, 420, 150);
};
CU.base = (t, S) => {
  SETS.stomach(t);
  const ts = cue("base/sweeteners") - 0.1, ti = cue("base/indigestible") - 0.1;
  gumBlob(560, 820, 1.4, t, { mood: t > ti ? "smug" : "happy", sparkle: clamp((t - ts) / 2) });
  popIn(470, 430, popK(t, ts), () => tag("SWEETENERS: BROKEN DOWN", 0, 0, { size: 52 }));
  if (t > ti) stamp("INDIGESTIBLE", 560, 1080, t - ti, { size: 96, rot: -0.08, color: BC.blood });
};
CU.empty = (t, S) => {
  SETS.stomach(t);
  const t2 = cue("empty/two") - 0.3, k = eio(clamp((t - t2) / 1.4));
  clockRing(760, 640, 190, k, k > 0 ? Math.round(k * 120) + " MIN" : "");
  castAt("stomach", 300, SB("stomach") * 0.8, t, { mood: "tired" });
  const g = clamp((t - cue("empty/gum") + 0.3) / 1.2); gumBlob(lerp(330, 900, eio(g)), lerp(1000, 1200, g), 0.45, t, { mood: "happy" });
};
CU.path = (t, S) => {
  SETS.gut(t);
  const pts = [[-60, 520], [500, 470], [900, 700], [300, 900], [140, 1120], [700, 1180], [1140, 1080]];
  tube(pts, 110, "#f58aa2", t, 1);
  const u = clamp((t - S.t0) / 3.2), i = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1))), f = u * (pts.length - 1) - i;
  gumBlob(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f) - 20, 0.42, t, { mood: "happy" });
  popIn(540, 360, popK(t, cue("path/path") - 0.1), () => tag("SAME PATH AS FOOD", 0, 0, { size: 60 }));
};
CU.doctors = (t, S) => {                       // the one big number: seven years, struck out
  SETS.spotlight(t);
  const tw = cue("doctors/week") - 0.15;
  bigNumber(t, S.t0 + 0.2, { value: 7, suffix: " YEARS", label: "THE MYTH", stroke: 18, size: 220, y: 560, roll: 0.6, colors: { fg: "#ffffff", accent: BC.sun, ink: BC.ink } });
  if (t > tw) { const k = eio(clamp((t - tw) / 0.35)); ctx.save(); ctx.strokeStyle = BC.blood; ctx.lineCap = "round"; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(150, 600); ctx.lineTo(150 + 780 * k, 400); ctx.stroke(); ctx.restore();
    kText("< 1 WEEK", W / 2 - 40, 900, 170, t, tw + 0.2, { color: "#b5e05a", stroke: 18, ink: BC.ink }); }
  castAt("microbe", 760, 1.5, t, { mood: "happy", mkind: "rod" });
};

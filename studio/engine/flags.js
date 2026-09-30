// Flags drawn in code from their official geometry (proportions from each country's flag law or the
// standard vexillological references; colours are the officially specified or standard values).
// flagRect(code, x, y, w, h) fills the box (the badge crops it round). Only flags whose geometry is exact and
// simple are drawn here (tricolours, stripes, crosses, discs). A code with no drawing is NEVER guessed:
// flagKnown(code) is false and the caller draws a neutral badge and logs an engine warning.
"use strict";
// kinds: h/v = stripes [colours, weights]; nordic; swiss; disc; greece
const stripes = (dir, c, w) => ({ k: dir, c, w: w || c.map(() => 1) });
const FLAG = {
  // Nordic crosses: field, cross, border (or null), vertical bar centred at 'cx' of the width
  FI: { k: "nordic", field: "#ffffff", cross: "#002f6c", border: null, cx: 0.36 },
  NO: { k: "nordic", field: "#ba0c2f", cross: "#00205b", border: "#ffffff", cx: 0.36 },
  IS: { k: "nordic", field: "#02529c", cross: "#dc1e35", border: "#ffffff", cx: 0.36 },
  DK: { k: "nordic", field: "#c8102e", cross: "#ffffff", border: null, cx: 0.36 },
  SE: { k: "nordic", field: "#006aa7", cross: "#fecc02", border: null, cx: 0.36 },
  CH: { k: "swiss" },
  // horizontal tricolours and bicolours
  NL: stripes("h", ["#ae1c28", "#ffffff", "#21468b"]),
  DE: stripes("h", ["#000000", "#dd0000", "#ffce00"]),
  AT: stripes("h", ["#ed2939", "#ffffff", "#ed2939"]),
  LU: stripes("h", ["#ed2939", "#ffffff", "#00a2e1"]),
  HU: stripes("h", ["#ce2939", "#ffffff", "#477050"]),
  BG: stripes("h", ["#ffffff", "#00966e", "#d62612"]),
  RU: stripes("h", ["#ffffff", "#0039a6", "#d52b1e"]),
  LT: stripes("h", ["#fdb913", "#006a44", "#c1272d"]),
  EE: stripes("h", ["#0072ce", "#000000", "#ffffff"]),
  YE: stripes("h", ["#ce1126", "#ffffff", "#000000"]),
  SL: stripes("h", ["#1eb53a", "#ffffff", "#0072c6"]),
  AM: stripes("h", ["#d90012", "#0033a0", "#f2a800"]),
  GA: stripes("h", ["#009e60", "#fcd116", "#3a75c4"]),
  PL: stripes("h", ["#ffffff", "#dc143c"]),
  UA: stripes("h", ["#0057b7", "#ffd700"]),
  ID: stripes("h", ["#e70011", "#ffffff"]),
  MC: stripes("h", ["#ce1126", "#ffffff"]),
  MU: stripes("h", ["#ea2839", "#1a206d", "#ffd500", "#00a551"]),
  CO: stripes("h", ["#fcd116", "#003893", "#ce1126"], [2, 1, 1]),
  LV: stripes("h", ["#9e3039", "#ffffff", "#9e3039"], [2, 1, 2]),
  // vertical tricolours
  IT: stripes("v", ["#009246", "#ffffff", "#ce2b37"]),
  FR: stripes("v", ["#002395", "#ffffff", "#ed2939"]),
  BE: stripes("v", ["#000000", "#fae042", "#ed2939"]),
  IE: stripes("v", ["#169b62", "#ffffff", "#ff883e"]),
  RO: stripes("v", ["#002b7f", "#fcd116", "#ce1126"]),
  NG: stripes("v", ["#008751", "#ffffff", "#008751"]),
  ML: stripes("v", ["#14b53a", "#fcd116", "#ce1126"]),
  CI: stripes("v", ["#f77f00", "#ffffff", "#009e60"]),
  GN: stripes("v", ["#ce1126", "#fcd116", "#009460"]),
  TD: stripes("v", ["#002664", "#fecb00", "#c60c30"]),
  // discs: r is a fraction of the flag height, cx a fraction of the width
  JP: { k: "disc", bg: "#ffffff", disc: "#bc002d", r: 0.3, cx: 0.5 },                       // diameter 3/5 of height, centred
  BD: { k: "disc", bg: "#006a4e", disc: "#f42a41", r: 1 / 3, cx: 0.45 },                     // radius 1/5 of length (10:6), centre 9/20 of length
  LA: Object.assign(stripes("h", ["#ce1126", "#002868", "#ce1126"], [1, 2, 1]), { disc: "#ffffff", r: 0.2, cx: 0.5 }),  // disc 4/5 of the blue band
  GR: { k: "greece" },                                                                       // 9 stripes, square canton of 5 stripes, cross arms 1 stripe wide
};
const NAMES = {
  FI: "Finland", NO: "Norway", IS: "Iceland", DK: "Denmark", SE: "Sweden", NL: "Netherlands", IT: "Italy", CH: "Switzerland",
  DE: "Germany", AT: "Austria", LU: "Luxembourg", HU: "Hungary", BG: "Bulgaria", RU: "Russia", LT: "Lithuania", EE: "Estonia",
  YE: "Yemen", SL: "Sierra Leone", AM: "Armenia", GA: "Gabon", PL: "Poland", UA: "Ukraine", ID: "Indonesia", MC: "Monaco",
  MU: "Mauritius", CO: "Colombia", LV: "Latvia", FR: "France", BE: "Belgium", IE: "Ireland", RO: "Romania", NG: "Nigeria",
  ML: "Mali", CI: "Cote d'Ivoire", GN: "Guinea", TD: "Chad", JP: "Japan", BD: "Bangladesh", LA: "Laos", GR: "Greece",
};
const flagKnown = code => Object.prototype.hasOwnProperty.call(FLAG, code);
// the colour under the middle of the badge (the face's eyelids must match it)
function flagBody(code) {
  const f = FLAG[code];
  if (!f) return "#e4e0d6";
  if (f.k === "nordic") return f.field;
  if (f.k === "swiss") return "#da291c";
  if (f.k === "disc") return f.disc;
  if (f.k === "greece") return "#0d5eaf";
  if (f.disc) return f.disc;
  const tot = f.w.reduce((a, b) => a + b, 0); let acc = 0;
  for (let i = 0; i < f.c.length; i++) { acc += f.w[i] / tot; if (acc >= 0.5 + 1e-9) return f.c[i]; }
  return f.c[f.c.length - 1];
}
function flagRect(code, x, y, w, h) {
  const f = FLAG[code];
  if (!f) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const disc = (cx, cy, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); };
  if (f.k === "nordic") {
    ctx.fillStyle = f.field; ctx.fillRect(x, y, w, h);
    const vx = x + w * f.cx, hy = y + h / 2, t = h * (f.border ? 0.125 : 0.18), b = h * 0.25;
    if (f.border) { ctx.fillStyle = f.border; ctx.fillRect(vx - b / 2, y, b, h); ctx.fillRect(x, hy - b / 2, w, b); }
    ctx.fillStyle = f.cross; ctx.fillRect(vx - t / 2, y, t, h); ctx.fillRect(x, hy - t / 2, w, t);
  } else if (f.k === "swiss") {
    ctx.fillStyle = "#da291c"; ctx.fillRect(x, y, w, h);
    const s = Math.min(w, h), cx = x + w / 2, cy = y + h / 2, a = s * 0.1875, L = s * 0.3125;  // arms 6/32 wide, 20/32 across
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - a / 2, cy - L, a, 2 * L); ctx.fillRect(cx - L, cy - a / 2, 2 * L, a);
  } else if (f.k === "h" || f.k === "v") {
    const tot = f.w.reduce((a, b) => a + b, 0); let acc = 0;
    f.c.forEach((c, i) => {
      const a0 = acc / tot, a1 = (acc + f.w[i]) / tot; acc += f.w[i];
      ctx.fillStyle = c;
      if (f.k === "h") ctx.fillRect(x, y + h * a0, w, h * (a1 - a0) + 1); else ctx.fillRect(x + w * a0, y, w * (a1 - a0) + 1, h);
    });
    if (f.disc) disc(x + w * f.cx, y + h / 2, h * f.r, f.disc);
  } else if (f.k === "disc") {
    ctx.fillStyle = f.bg; ctx.fillRect(x, y, w, h);
    disc(x + w * f.cx, y + h / 2, h * f.r, f.disc);
  } else if (f.k === "greece") {
    const sh = h / 9;
    for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : "#0d5eaf"; ctx.fillRect(x, y + sh * i, w, sh + 1); }
    const cs = sh * 5;                                    // canton: a square of five stripes
    ctx.fillStyle = "#0d5eaf"; ctx.fillRect(x, y, cs, cs);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 2 * sh, y, sh, cs); ctx.fillRect(x, y + 2 * sh, cs, sh);
  }
  ctx.restore();
}

// Flags drawn in code from their official geometry (simplified where noted). flagRect(code, x, y, w, h).
"use strict";
const FLAG = {
  // Nordic crosses: [field, cross, border or null], vertical bar centred at 'cx' of the width
  FI: ["nordic", "#ffffff", "#002f6c", null, 0.36],
  NO: ["nordic", "#ba0c2f", "#00205b", "#ffffff", 0.36],
  IS: ["nordic", "#02529c", "#dc1e35", "#ffffff", 0.36],
  DK: ["nordic", "#c8102e", "#ffffff", null, 0.36],
  SE: ["nordic", "#006aa7", "#fecc02", null, 0.36],
  NL: ["h3", "#ae1c28", "#ffffff", "#21468b"],
  IT: ["v3", "#009246", "#ffffff", "#ce2b37"],
  CH: ["swiss"],
};
const NAMES = { FI: "Finland", NO: "Norway", IS: "Iceland", DK: "Denmark", SE: "Sweden", NL: "Netherlands", IT: "Italy", CH: "Switzerland" };
function flagRect(code, x, y, w, h) {
  const f = FLAG[code];
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (f[0] === "nordic") {
    const [, field, cross, border, cx] = f;
    ctx.fillStyle = field; ctx.fillRect(x, y, w, h);
    const vx = x + w * cx, hy = y + h / 2, t = h * (border ? 0.125 : 0.18), b = h * 0.25;
    if (border) { ctx.fillStyle = border; ctx.fillRect(vx - b / 2, y, b, h); ctx.fillRect(x, hy - b / 2, w, b); }
    ctx.fillStyle = cross; ctx.fillRect(vx - t / 2, y, t, h); ctx.fillRect(x, hy - t / 2, w, t);
  } else if (f[0] === "h3") {
    for (let i = 0; i < 3; i++) { ctx.fillStyle = f[1 + i]; ctx.fillRect(x, y + h * i / 3, w, h / 3 + 1); }
  } else if (f[0] === "v3") {
    for (let i = 0; i < 3; i++) { ctx.fillStyle = f[1 + i]; ctx.fillRect(x + w * i / 3, y, w / 3 + 1, h); }
  } else if (f[0] === "swiss") {
    ctx.fillStyle = "#da291c"; ctx.fillRect(x, y, w, h);
    const s = Math.min(w, h), cx = x + w / 2, cy = y + h / 2, a = s * 0.1875, L = s * 0.3125;  // arms 6/32 wide, 20/32 across
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - a / 2 * 1, cy - L, a, 2 * L); ctx.fillRect(cx - L, cy - a / 2, 2 * L, a);
  }
  ctx.restore();
}

// Flag-art kit: official flag SVGs (studio/assets/flags/, Wikimedia Commons, public domain) for any country,
// so no flag is ever approximated. Load with "kits": ["flagart"]. Images preload before frame 0 (window.PRELOAD).
"use strict";
const FLAGART = {};
window.PRELOAD = window.PRELOAD || [];
function flagLoad(code) {
  if (FLAGART[code]) return FLAGART[code];
  const img = new Image(); img.src = "../assets/flags/" + code + ".svg";
  FLAGART[code] = img;
  window.PRELOAD.push(new Promise(res => { img.onload = res; img.onerror = () => { warn("flag art missing: " + code); res(); }; }));
  return img;
}
(EP.storyboard.flags || []).forEach(flagLoad);          // the storyboard lists the flags it uses, so they preload
function flagArt(code, x, y, w, h, o = {}) {
  const img = flagLoad(code);
  if (!img.complete || !img.naturalWidth) { warn("flag not loaded yet: " + code); return; }
  h = h ?? w * img.naturalHeight / img.naturalWidth;
  ctx.save();
  if (o.shadow !== false) { ctx.shadowColor = "rgba(20,15,10,0.35)"; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.shadowBlur = 8; ctx.fillStyle = "#000"; ctx.fillRect(x, y, w, h); ctx.shadowColor = "transparent"; }
  ctx.drawImage(img, x, y, w, h);
  if (o.border !== false) { ctx.strokeStyle = o.ink || "rgba(20,15,10,0.6)"; ctx.lineWidth = o.lw ?? 2; ctx.strokeRect(x, y, w, h); }
  ctx.restore();
  return h;
}
function flagBadge(code, x, y, r, o = {}) {
  const img = flagLoad(code);
  if (!img.complete || !img.naturalWidth) return;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.closePath();
  if (o.shadow !== false) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowOffsetY = 6; ctx.shadowBlur = 10; ctx.fillStyle = "#000"; ctx.fill(); ctx.shadowColor = "transparent"; }
  ctx.clip(); const ar = img.naturalWidth / img.naturalHeight, h = 2 * r, w = h * ar; ctx.drawImage(img, x - w / 2 + (o.dx || 0) * r, y - r, w, h); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = o.ring ?? 5; ctx.strokeStyle = o.ringCol || "#f4f1ea"; ctx.stroke(); ctx.restore();
}

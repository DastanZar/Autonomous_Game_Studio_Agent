// Do cold feet give you a cold? Cardiff's 2005 foot-chilling study, told by the cast: the Heart volunteers for the
// ice bucket, the Microbes are already waiting in the nose. Organ cast and flat props (body kit), numbers in moving
// type (kinetic kit). The researchers are named on tags, never drawn.
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
const ICE = "#bfe9f5";
// an ice bucket; front = true draws only the front (so a character's feet sit inside it)
function bucket(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const front = () => { ctx.moveTo(-190, -150); ctx.lineTo(190, -150); ctx.lineTo(160, 60); ctx.lineTo(-160, 60); ctx.closePath(); };
  if (!o.front) {
    part(() => ctx.ellipse(0, -150, 190, 40, 0, 0, 7), o.empty ? "#3a3550" : "#7fc8d8", { hl: false, lw: 6 });
    if (!o.empty) for (let i = 0; i < 5; i++) part(() => ctx.roundRect(-150 + i * 62, -178 + Math.sin(t * 2 + i) * 4, 54, 46, 10), ICE, { hl: false, lw: 4 });
  } else {
    part(front, o.empty ? "#b9c3cc" : "#8fb7c9", { hlAt: [-120, -110, 20] });
    for (const yy of [-110, 20]) strokePath(() => { ctx.moveTo(-180 + (yy > 0 ? 18 : 4), yy); ctx.lineTo(180 - (yy > 0 ? 18 : 4), yy); }, shade(o.empty ? "#b9c3cc" : "#8fb7c9", -0.25), 6);
    if (o.label) text(o.label, 0, -30, { size: 52, color: "#fff", stroke: 10, ink: BC.ink });
  }
  ctx.restore();
}
// the Heart standing in the bucket, shivering (shake 0..1)
function heartInBucket(x, s, t, o = {}) {
  const shake = (o.shake ?? 1) * Math.sin(t * 40) * 5;
  bucket(x, GROUND - 40, 1.1, t, {});
  castAt("heart", x + shake, s, t, Object.assign({ mood: "worried", arms: "rest", gy: GROUND - 60 }, o.extra || {}));
  bucket(x, GROUND - 40, 1.1, t, { front: true, label: o.label });
  if (o.frost) for (let i = 0; i < 6; i++) { const a = (t * 0.6 + i / 6) % 1; withAlpha(1 - a, () => text("❄", x - 220 + i * 90, GROUND - 400 - a * 300, { size: 44, color: "#e6fbff", stroke: 6, ink: BC.ink })); }
}
// a cold virus: a microbe with spikes
function coldVirus(x, y, s, t, mood, seed) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + seed) * 8); ctx.scale(s, s);
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + t * 0.4; strokePath(() => { ctx.moveTo(Math.cos(a) * 50, Math.sin(a) * 50); ctx.lineTo(Math.cos(a) * 82, Math.sin(a) * 82); }, BC.ink, 8); part(() => ctx.arc(Math.cos(a) * 86, Math.sin(a) * 86, 12, 0, 7), BC.bile, { hl: false, lw: 4 }); }
  part(() => ctx.arc(0, 0, 62, 0, 7), BC.bile, { hlAt: [-20, -24, 16], lw: 6 });
  castFace({ x: 0, y: -4, sz: 30, mood, look: [0, 0], blink: castBlinkAt(t, seed), talk: 0, body: BC.bile });
  ctx.restore();
}
// the inside of a nose: a warm pink tunnel lined with blood vessels; squeeze 0..1 narrows them
function noseSet(t, squeeze = 0) {
  vgrad("#7a1a3a", "#d0566f");
  for (let k = 0; k < 6; k++) { const y = 260 + k * 190, w = lerp(30, 10, squeeze);
    const path = () => { ctx.moveTo(-40, y); for (let x = 0; x <= W + 40; x += 60) ctx.lineTo(x, y + Math.sin(x * 0.01 + k) * 40); };
    strokePath(path, BC.ink, w + 12); strokePath(path, BC.blood, w);
    if (squeeze < 0.6) { ctx.save(); ctx.setLineDash([10, 60]); ctx.lineDashOffset = -t * 200; ctx.lineCap = "round"; ctx.lineWidth = w * 0.5; ctx.strokeStyle = "#ffd0d6"; ctx.beginPath(); path(); ctx.stroke(); ctx.restore(); }
  }
}
// a white blood cell (a defender)
function defender(x, y, s, t, mood, seed) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4 + seed) * 6); ctx.scale(s, s);
  const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, r = 70 * (1 + 0.08 * Math.sin(a * 3 + t * 2 + seed)); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  part(() => smooth(pts), "#f4f1ff", { hlAt: [-20, -26, 16], lw: 6 });
  castFace({ x: 0, y: -4, sz: 30, mood, look: [0, 0], blink: castBlinkAt(t, seed), talk: 0, body: "#f4f1ff" });
  ctx.restore();
}
// a vertical result bar out of 90
function bar90(x, base, h, n, t, t0, col, label) {
  const k = eout(clamp((t - t0) / 0.8)), hh = h * n / 90 * k;
  part(() => ctx.roundRect(x - 100, base - h, 200, h, 26), "#2b2450", { hl: false, lw: 6 });
  if (hh > 4) part(() => ctx.roundRect(x - 100, base - hh, 200, hh, 26), col, { hlAt: [x - 60, base - hh + 20, 14], lw: 6 });
  if (t > t0) text(Math.round(n * k) + " / 90", x, base - hh - 30, { size: 84, color: "#fff", stroke: 12, ink: BC.ink });
  text(label, x, base + 66, { size: 44, color: "#fff", stroke: 10, ink: BC.ink });
}

CU.hook = (t, S) => {                          // frame 1: the Heart, feet in the ice bucket, under the old claim
  SETS.spotlight(t);
  const tf = cue("hook/folklore") - 0.1;
  heartInBucket(470, SB("heart") * 0.7, t, { frost: true });
  stageTitle("COLD FEET = A COLD?", t, 0, 400, 130);
  if (t > tf) stamp("FOLKLORE?", 640, 640, t - tf, { size: 100, rot: -0.12, color: BC.blood });
};
CU.virus = (t, S) => {                         // colds are viruses; earlier studies: no link
  noseSet(t, 0);
  const tv = cue("virus/viruses") - 0.2, ts = cue("virus/studies") - 0.15;
  for (let i = 0; i < 3; i++) { const k = popK(t, tv + i * 0.12); if (k > 0) coldVirus(250 + i * 220, 760 + (i % 2) * 120, 1.2 * k, t, "smug", i + 1); }
  popIn(470, 380, popK(t, tv), () => tag("COLDS = VIRUSES", 0, 0, { size: 60 }));
  popIn(470, 1130, popK(t, ts), () => tag("EARLIER STUDIES: NO LINK TO CHILL", 0, 0, { size: 42 }));
};
CU.test = (t, S) => {                          // Cardiff, 2005, 180 volunteers
  vgrad("#1d3b4f", "#2c6a7a");
  const tc = cue("test/cardiff") - 0.2, tn = cue("test/hundred") - 0.2;
  flatCard(470, 420, 640, 250, -0.02, popK(t, S.t0 + 0.1), (w, h) => {
    text("COMMON COLD CENTRE", 0, -30, { size: 56, color: BC.ink });
    text("Cardiff University, 2005", 0, 50, { size: 40, font: "Elite", color: "#6b5a48" });
  });
  if (t > tn) { for (let i = 0; i < 180; i++) { const c = i % 18, r = Math.floor(i / 18), k = clamp((t - tn - i * 0.006) / 0.2);
      if (k <= 0) continue; ctx.globalAlpha = k; ctx.fillStyle = r < 5 ? BC.lymph : BC.sun; ctx.beginPath(); ctx.arc(150 + c * 38, 680 + r * 38 + (r >= 5 ? 20 : 0), 13, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = BC.ink; ctx.stroke(); }
    ctx.globalAlpha = 1; kText("180 VOLUNTEERS", 470, 1170, 96, t, tn + 0.4, { color: "#fff", stroke: 12, ink: BC.ink }); }
};
CU.bucket = (t, S) => {                        // half: icy water, 20 minutes; half: empty bowl
  SETS.spotlight(t);
  const ti = cue("bucket/icy") - 0.2, tm = cue("bucket/twenty") - 0.2, te = cue("bucket/empty") - 0.2;
  const k1 = popK(t, ti), k2 = popK(t, te);
  if (k1 > 0) { ctx.save(); ctx.translate(250, 0); ctx.scale(0.75, 0.75); ctx.translate(-470, 0); bucket(470, 1150, 1.1 * k1, t, {}); bucket(470, 1150, 1.1 * k1, t, { front: true, label: "ICY WATER" }); ctx.restore(); }
  if (k2 > 0) { ctx.save(); ctx.translate(690, 0); ctx.scale(0.75, 0.75); ctx.translate(-470, 0); bucket(470, 1150, 1.1 * k2, t, { empty: true }); bucket(470, 1150, 1.1 * k2, t, { front: true, empty: true, label: "EMPTY BOWL" }); ctx.restore(); }
  if (t > tm) { clockRing(250, 520, 130, eio(clamp((t - tm) / 1.5)) * 20 / 60, ""); text("20 MIN", 250, 720, { size: 64, color: "#fff", stroke: 12, ink: BC.ink }); }
  popIn(250, 330, k1, () => tag("90 PEOPLE", 0, 0, { size: 46 }));
  popIn(690, 330, k2, () => tag("90 PEOPLE", 0, 0, { size: 46 }));
};
CU.brr = (t, S) => {                           // the Heart regrets volunteering
  vgrad("#1d3b4f", "#4a8aa0");
  heartInBucket(470, SB("heart") * 0.85, t, { frost: true, extra: { mood: "worried", look: [0.5, -0.5] } });
  const s = SB("heart") * 0.85, headTop = GROUND - 60 - RIGS.heart.h * s;
  bubble("I VOLUNTEERED FOR THIS?", 470, headTop - 6, 250, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.result = (t, S) => {                        // 13 of 90 chilled reported a cold
  vgrad("#1a1440", "#3b1f8f");
  const tn = cue("result/thirteen") - 0.15;
  flatCard(470, 340, 680, 150, 0.02, popK(t, S.t0), () => text("REPORTED A COLD IN 4-5 DAYS", 0, 18, { size: 50, color: BC.ink }));
  bar90(300, 1130, 560, 13, t, tn, ICE, "CHILLED");
  bar90(660, 1130, 560, 0, t, 1e9, BC.sun, "DRY BOWL");
};
CU.result2 = (t, S) => {                       // ... against 5 of 90 in the dry bowls
  vgrad("#1a1440", "#3b1f8f");
  const tn = cue("result/five") - 0.15;
  flatCard(470, 340, 680, 150, 0.02, 1, () => text("REPORTED A COLD IN 4-5 DAYS", 0, 18, { size: 50, color: BC.ink }));
  bar90(300, 1130, 560, 13, t, -10, ICE, "CHILLED");
  bar90(660, 1130, 560, 5, t, tn, BC.sun, "DRY BOWL");
  popIn(470, 1230, popK(t, tn + 0.3), () => tag("ONE STUDY, 180 PEOPLE", 0, 0, { size: 40 }));
};
CU.turn = (t, S) => {                          // the cold water didn't bring the virus
  SETS.spotlight(t);
  const td = cue("turn/didn't") - 0.15;
  heartInBucket(300, SB("heart") * 0.6, t, { shake: 0.4 });
  for (let i = 0; i < 3; i++) withAlpha(0.9, () => text("❄", 700 + (i - 1) * 90, 600 + Math.sin(t * 2 + i) * 20, { size: 70, color: "#e6fbff", stroke: 8, ink: BC.ink }));
  if (t > td) { stamp("NO VIRUS HERE", 680, 820, t - td, { size: 74, rot: -0.1, color: BC.blood }); }
};
CU.carry = (t, S) => {                         // the virus is already there, quietly
  noseSet(t, 0);
  const tc = cue("turn/carry") - 0.2;
  for (let i = 0; i < 3; i++) { coldVirus(250 + i * 220, 820 + (i % 2) * 110, 1.15, t, "tired", i + 1);
    const a = (t * 0.6 + i / 3) % 1; withAlpha(1 - a, () => text("z", 300 + i * 220 + a * 40, 700 - a * 120, { size: 50 + a * 30, color: "#fff", stroke: 8, ink: BC.ink })); }
  popIn(470, 380, popK(t, S.t0 + 0.1), () => tag("THE RESEARCHERS' THEORY", 0, 0, { size: 50 }));
  popIn(470, 1170, popK(t, tc), () => tag("CARRIED WITH NO SYMPTOMS", 0, 0, { size: 46 }));
};
CU.vessels = (t, S) => {                       // chilling squeezes the nose's blood vessels; the defenders can't get through
  const ts = cue("vessels/squeezes") - 0.2, tc = cue("vessels/cuts") - 0.2, sq = eio(clamp((t - ts) / 1.2));
  noseSet(t, sq);
  for (let i = 0; i < 3; i++) defender(lerp(-120, 280 + i * 200, eout(clamp((t - S.t0) / 1.2))) - sq * 200 * (i + 1) * 0.6, 700 + i * 150, 0.9, t, sq > 0.5 ? "worried" : "happy", i + 4);
  popIn(470, 380, popK(t, S.t0 + 0.1), () => tag("THE RESEARCHERS' THEORY", 0, 0, { size: 50 }));
  popIn(470, 1170, popK(t, tc), () => tag("FEWER DEFENDERS GET THROUGH", 0, 0, { size: 44 }));
};
CU.cue = (t, S) => {                           // the viruses wake up
  noseSet(t, 1);
  for (let i = 0; i < 3; i++) coldVirus(250 + i * 220, 900 + (i % 2) * 110, 1.3, t, "smug", i + 1);
  bubble("THAT'S OUR CUE.", 470, 780, 300, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.toll = (t, S) => {                          // back to frame 1's picture: half right
  SETS.spotlight(t);
  heartInBucket(470, SB("heart") * 0.7, t, { frost: true, extra: { mood: "proud" } });
  stageTitle("GRANDMA: HALF RIGHT", t, S.t0 + 0.1, 400, 130);
};

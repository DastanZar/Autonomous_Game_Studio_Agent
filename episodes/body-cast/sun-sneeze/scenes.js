// Why does sunlight make some people sneeze? Aristotle blamed the heat, Bacon shut his eyes and proved it was the
// light, then blamed the brain's moisture; an EEG and a 2025 review bring it up to date. The Brain re-enacts the tests.
// Aristotle and Bacon are named on cards, never drawn. Organ cast and flat props (body kit), moving type (kinetic kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const SB = s => bigScale(RIGS[s]);
// a cartoon sun with a face and turning rays
function sun(x, y, r, t, mood = "happy") {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.3);
  for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i / 12 * 6.283); part(() => { ctx.moveTo(r * 0.9, -22); ctx.lineTo(r * 1.45 + Math.sin(t * 4 + i) * 10, 0); ctx.lineTo(r * 0.9, 22); ctx.closePath(); }, "#ffb627", { hl: false, lw: 5 }); ctx.restore(); }
  ctx.restore();
  glow(x, y, r * 2.2, "#fff2a8", 0.35);
  part(() => ctx.arc(x, y, r, 0, 7), BC.sun, { hlAt: [x - r * 0.35, y - r * 0.35, r * 0.3] });
  castFace({ x, y: y - r * 0.08, sz: r * 0.38, mood, look: [0, 0.3], blink: castBlinkAt(t, 21), talk: 0, body: BC.sun });
}
// light rays from (x1,y1) towards (x2,y2), k 0..1
function beams(x1, y1, x2, y2, k, t) {
  if (k <= 0) return;
  for (let i = -1; i <= 1; i++) withAlpha(0.55 * k, () => strokePath(() => { ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2 + i * 40, k), lerp(y1, y2 + i * 30, k)); }, "#fff6c2", 18 - Math.abs(i) * 6));
}
// the Brain sneezing: shut eyes, spray and an ACHOO stamp; since = seconds since the sneeze
function brainSneeze(x, s, t, since, o = {}) {
  const jolt = since > 0 && since < 0.4 ? Math.sin(since * 40) * 12 * (1 - since / 0.4) : 0;
  castAt("brain", x + jolt, s, t, Object.assign({ mood: since > 0 ? "shocked" : "worried", arms: since > 0 && since < 1.2 ? "up" : "rest", look: [0.5, -0.5] }, o));
  if (since > 0) { for (let i = 0; i < 9; i++) { const a = clamp(since * 1.4 - i * 0.02); withAlpha(1 - a, () => part(() => ctx.arc(x + 120 + a * (200 + i * 30), GROUND - s * 330 + (i - 4) * 18 * a * 3, 10, 0, 7), "#d9f2f7", { hl: false, lw: 3 })); }
    stamp("ACHOO!", x, 610, since, { size: 110, rot: -0.12, color: BC.blood }); }
}
// a typeset history card: name, date, a line in the typewriter face
function historyCard(x, y, w, h, k, name, date, line) {
  flatCard(x, y, w, h, -0.02, k, (ww, hh) => {
    ctx.fillStyle = "#6b4a8a"; ctx.fillRect(-ww / 2, -hh / 2, ww, 84); text(name, 0, -hh / 2 + 60, { size: 54, color: "#fff" });
    text(date, 0, -hh / 2 + 140, { size: 38, font: "Elite", color: "#6b5a48" });
    const f = fit(line, ww - 80, 52, 3, "Anton", "card line"); f.lines.forEach((l, i) => text(l, 0, -hh / 2 + 220 + i * f.size * 1.1, { size: f.size, color: BC.ink }));
  });
}
const BRAIN_X = 330;

CU.hook = (t, S) => {                          // frame 1: the sun and the Brain about to sneeze
  SETS.spotlight(t);
  const tb = cue("hook/bright") - 0.1, ts = cue("hook/sunlight") + 0.1;
  sun(760, 640, 110, t);
  beams(700, 690, 430, 860, clamp((t - tb) / 0.5), t);
  brainSneeze(BRAIN_X, SB("brain") * 0.72, t, t - ts);
  stageTitle("WHY DOES SUNLIGHT MAKE YOU SNEEZE?", t, 0, 380, 110);
};
CU.achoo = (t, S) => {                         // the Brain blames the sun
  SETS.spotlight(t);
  sun(780, 560, 90, t, "smug");
  const s = SB("brain") * 0.8;
  castAt("brain", 400, s, t, { mood: "smug", arms: "hips", look: [1, -0.5] });
  bubble("EXCUSE ME. THAT WAS THE SUN.", 400, GROUND - RIGS.brain.h * s * 0.97 - 6, 250, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.aristotle = (t, S) => {                     // Aristotle's theory: the sun's heat stirs up the nose
  vgrad("#ff8a5c", "#ffb347");
  const th = cue("aristotle/heat") - 0.2;
  historyCard(470, 470, 700, 400, popK(t, S.t0 + 0.1), "ARISTOTLE", "about 350 BCE", "THE SUN'S HEAT STIRS UP THE NOSE");
  sun(800, 1000, 80, t);
  castAt("brain", 330, SB("brain") * 0.55, t, { mood: "worried", look: [1, -0.5] });
  if (t > th) for (let i = 0; i < 4; i++) { const a = (t * 0.9 + i / 4) % 1; withAlpha(1 - a, () => strokePath(() => { const x = 520 + i * 50; ctx.moveTo(x, 1100 - a * 160); ctx.quadraticCurveTo(x + 20, 1060 - a * 160, x, 1020 - a * 160); ctx.quadraticCurveTo(x - 20, 980 - a * 160, x, 940 - a * 160); }, "#ff5a36", 8)); }
};
CU.bacon = (t, S) => {                         // Bacon's test: face the sun, eyes shut
  SETS.spotlight(t);
  const tt = cue("bacon/tested") - 0.15, ts = cue("bacon/shut") - 0.25;
  historyCard(470, 420, 640, 330, popK(t, S.t0 + 0.1), "FRANCIS BACON", "1600s", "THE TEST: FACE THE SUN, EYES SHUT");
  sun(790, 760, 90, t);
  castAt("brain", BRAIN_X, SB("brain") * 0.62, t, { mood: "neutral", look: [1, -0.4] });
  if (t > ts) { const s = SB("brain") * 0.62; withAlpha(clamp((t - ts) / 0.3), () => { for (const dx of [-45, 45]) { part(() => ctx.ellipse(BRAIN_X + dx * s, GROUND - 305 * s, 36 * s, 44 * s, 0, 0, 7), BC.brain, { hl: false, lw: 0 }); strokePath(() => { ctx.arc(BRAIN_X + dx * s, GROUND - 312 * s, 24 * s, 0.25, Math.PI - 0.25); }, BC.ink, 8); } }); }
  beams(730, 800, BRAIN_X + 60, 900, clamp((t - tt) / 0.6), t);
};
CU.none = (t, S) => {                          // no sneeze: it's the light, not the heat
  SETS.spotlight(t);
  const tn = cue("none/sneeze") - 0.1, tl = cue("none/light") - 0.15;
  sun(790, 760, 90, t);
  castAt("brain", BRAIN_X, SB("brain") * 0.62, t, { mood: t > tl ? "shocked" : "proud", look: [1, -0.4] });
  if (t > tn) stamp("NO SNEEZE", 470, 420, t - tn, { size: 110, rot: -0.08, color: BC.blood });
  popIn(470, 1150, popK(t, cue("none/heat") - 0.1), () => tag("✕ HEAT    ✓ LIGHT IN THE EYES", 0, 0, { size: 44 }));
};
CU.moist = (t, S) => {                         // Bacon's own explanation, in his words
  vgrad("#1d3b4f", "#2c6a7a");
  historyCard(470, 470, 760, 420, popK(t, S.t0 + 0.1), "BACON, 1635", "his explanation", "\"THE DRAWING DOWN OF THE MOISTURE OF THE BRAIN\"");
  const td = cue("moist/brain") - 0.2, s = SB("brain") * 0.55;
  castAt("brain", 470, s, t, { mood: t > td ? "shocked" : "neutral", look: [0, 1] });
  if (t > td) for (let i = 0; i < 5; i++) { const a = (t * 0.8 + i / 5) % 1; withAlpha(1 - a, () => part(() => { const x = 420 + i * 25, y = GROUND - 120 * s + a * 160; ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 12, y, x, y + 8); ctx.quadraticCurveTo(x - 12, y, x, y - 18); }, "#9fd8f0", { hl: false, lw: 3 })); }
};
CU.rude = (t, S) => {                          // the Brain objects
  SETS.neurons(t);
  const s = SB("brain") * 0.9;
  castAt("brain", 470, s, t, { mood: "angry", arms: "hips" });
  bubble("I AM NOT LEAKING.", 470, GROUND - RIGS.brain.h * s * 0.97 - 6, 250, pop(t, S.t0 + 0.1, 0.3), S.id);
};
CU.eeg = (t, S) => {                           // 2010: EEG on photic sneezers
  SETS.neurons(t);
  const tb = cue("eeg/scans") - 0.2, s = SB("brain") * 0.7;
  popIn(470, 340, popK(t, S.t0 + 0.1), () => tag("EEG STUDY, 2010", 0, 0, { size: 56 }));
  castAt("brain", 470, s, t, { mood: "worried", look: [0, -1] });
  if (t > tb) for (let i = 0; i < 5; i++) { const ex = 470 + (i - 2) * 70 * s, ey = GROUND - (440 - Math.abs(i - 2) * 25) * s; strokePath(() => { ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + (i - 2) * 30, ey - 160, 470 + (i - 2) * 140, 480); }, "#2b2450", 6); part(() => ctx.arc(ex, ey, 14, 0, 7), BC.sun, { hl: false, lw: 4 }); }
  if (t > tb) { ctx.save(); ctx.beginPath(); for (let x = 120; x <= 820; x += 8) { const y = 520 + Math.sin(x * 0.05 + t * 8) * 26 * (0.6 + 0.4 * Math.sin(x * 0.011)); x === 120 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 8; ctx.strokeStyle = "#7ff6ff"; ctx.stroke(); ctx.restore(); }
};
CU.cortex = (t, S) => {                        // the visual cortex lights up more strongly
  SETS.neurons(t);
  const tv = cue("eeg/visual") - 0.2, tr = cue("eeg/strongly") - 0.2, s = SB("brain") * 0.8;
  sun(780, 520, 80, t);
  beams(720, 560, 520, GROUND - 330 * s, 1, t);
  castAt("brain", 420, s, t, { mood: "shocked", look: [1, -0.5] });
  const g = clamp((t - tr) / 0.5);
  if (t > tv) { glow(420 - 120 * s, GROUND - 330 * s, 160 + 80 * g, "#fff59a", 0.5 + 0.4 * g * Math.abs(Math.sin(t * 6))); }
  popIn(470, 330, popK(t, tv), () => tag("VISUAL CORTEX: MORE REACTIVE", 0, 0, { size: 48 }));
};
CU.unclear = (t, S) => {                       // 2025: still unclear
  SETS.spotlight(t);
  const tr = cue("unclear/review") - 0.2, tu = cue("unclear/unclear") - 0.2;
  castAt("brain", 470, SB("brain") * 0.7, t, { mood: "worried", arms: "rest", look: [0, -1] });
  for (let i = 0; i < 3; i++) { const k = popK(t, S.t0 + 0.3 + i * 0.25); if (k > 0) popIn([150, 790, 790][i], [820, 640, 900][i], k, () => text("?", 0, 0, { size: 150, color: "#fff", stroke: 16, ink: BC.ink }), 0.5); }
  popIn(470, 330, popK(t, tr), () => tag("2025 REVIEW", 0, 0, { size: 56 }));
  if (t > tu) stamp("STILL UNCLEAR", 470, 470, t - tu, { size: 100, rot: -0.08, color: BC.blood });
};
CU.toll = (t, S) => {                          // back to frame 1: the sun wins
  SETS.spotlight(t);
  sun(760, 640, 110, t, "smug");
  beams(700, 690, 430, 860, 1, t);
  brainSneeze(BRAIN_X, SB("brain") * 0.72, t, t - cue("toll/sneezing"));
  stageTitle("2,000 YEARS. STILL SNEEZING.", t, S.t0 + 0.1, 380, 110);
};

// Card-style scene types: title_card, stamp_reveal, count_up, quote_card, split_compare, versus,
// diagram_callout, timeline, outro_loop, custom. Each draws a full frame from (t, S) only.
"use strict";

// torn paper strip behind a line of big text
function strip(x, y, w, h, seed, c = P.card) {
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push([x - w / 2 + (w * i) / 8, y - h / 2 + (rnd(seed, i, 1) - 0.5) * 8]);
  for (let i = 8; i >= 0; i--) pts.push([x - w / 2 + (w * i) / 8, y + h / 2 + (rnd(seed, i, 2) - 0.5) * 8]);
  cut(() => { pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); }, c, { lw: 3 });
}
function bigText(str, cx, top, maxW, size0, maxLines, k, seed, o = {}) {
  const f = fit(str, maxW, size0, maxLines, "Anton", "title");
  f.lines.forEach((ln, i) => {
    const kk = clamp(k - i * 0.12, 0, 1.2);
    if (kk <= 0) return;
    const y = top + i * f.size * 1.18 + f.size * 0.55;
    ctx.save(); ctx.translate(cx, y); ctx.rotate((rnd(seed, i, 5) - 0.5) * 0.05); ctx.scale(back(Math.min(1, kk)), back(Math.min(1, kk)));
    strip(0, 0, measure(ln, f.size) + 50, f.size * 1.12, seed + i, o.bg || P.card);
    text(ln, 0, f.size * 0.36, { size: f.size, color: o.color || P.ink });
    ctx.restore();
  });
  return f.lines.length * f.size * 1.18;
}

SCENE_FNS.title_card = (t, S) => {
  graphPaper();
  const seed = strSeed(S.id);
  const kt = S.idx === 0 ? 1.4 : prog(t, S.t0, S.t0 + 0.4) * 1.4;
  const nl = fit(S.p.text || "", W - 160, 150, 3, "Anton", "title");
  const top = S.p.prop ? STAGE.y + 20 : STAGE_CY - nl.lines.length * nl.size * 1.18 / 2;
  const hTxt = bigText(S.p.text || "", W / 2, top, W - 160, 150, 3, kt, seed);
  if (S.p.prop) {
    const kp = pop(t, evT(S, "reveal", S.t0 + 0.35), 0.4);
    const room = STAGE.y + STAGE.h - (STAGE.y + 40 + hTxt);
    const s = clamp(room / 470, 0.55, 1.25) * (1 + 0.08 * emph(t, S));
    popIn(W / 2, STAGE.y + STAGE.h - 10, kp, () => prop(S.p.prop, Object.assign({ s, id: seed % 50 }, S.p.prop_args || {})));
  }
};

SCENE_FNS.stamp_reveal = (t, S) => {
  if (S.prev) drawScene(S.prev, t); else graphPaper();
  const hit = evT(S, "reveal", S.t0 + 0.08);
  withAlpha(0.18 * clamp((t - hit) * 6), () => { ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H); });
  stamp(String(S.p.text || "").toUpperCase(), W / 2, STAGE_CY + (+S.p.dy || 0), t - hit, { color: col(S.p.color), size: 190, maxW: W - 140 });
};

SCENE_FNS.count_up = (t, S) => {
  graphPaper();
  const t0 = evT(S, "count_start", S.t0 + 0.25);
  let t1 = evT(S, "count_stop", t0 + 1.4);
  if (t1 < t0 + 0.4) t1 = t0 + 1.2;
  const v = S.p.value || 0, k = eout(prog(t, t0, t1));
  const pct = /^(percent|%)$/i.test(S.p.unit || "");
  const num = fmt(v * k) + (pct ? "%" : "");
  const final = fmt(v) + (pct ? "%" : "");
  let size = 330; while (measure(final, size) > W - 180 && size > 80) size -= 10;
  const cy = STAGE.y + STAGE.h * 0.42;
  popIn(W / 2, cy, pop(t, S.t0 + 0.05, 0.35), () => {
    ctx.rotate(-0.03);
    text(num, 0, size * 0.35, { size, color: P.red, stroke: 14, shadow: true });
  });
  if (S.p.unit && !pct) popIn(W / 2, cy + size * 0.55 + 40, pop(t, S.t0 + 0.2), () => bigText(String(S.p.unit), 0, -50, W - 200, 110, 1, 1, strSeed(S.id)));
  if (S.p.qualifier) {  // the label a qualified number must carry (estimates, self-reported counts)
    const kq = pop(t, t0 + 0.3, 0.3);
    if (kq > 0) tag(String(S.p.qualifier), W / 2, STAGE.y + STAGE.h - 40, { size: 44, k: kq, bg: P.yellow });
  }
};

SCENE_FNS.quote_card = (t, S) => {
  paperBG(P.navy);
  const kc = pop(t, S.t0 + 0.05, 0.4);
  const cw = W - 140, maxH = STAGE.h - 40;
  const f = fit("“" + (S.p.quote || "") + "”", cw - 120, 84, 8, "Serif", "quote");
  const ch = Math.min(maxH, f.lines.length * f.size * 1.2 + 230);
  const cy = STAGE_CY;
  popIn(W / 2, cy, kc, () => {
    ctx.rotate(-0.015);
    cut(() => ctx.rect(-cw / 2, -ch / 2, cw, ch), P.card, { lw: 5, sx: 10, sy: 14, sb: 14 });
    const rv = S.t0 + 0.25;   // the quote is on screen while it is being read; a 'reveal' event only pulses the card
    ctx.scale(1 + 0.03 * emph(t, S), 1 + 0.03 * emph(t, S));
    f.lines.forEach((ln, i) => withAlpha(prog(t, rv + i * 0.18, rv + i * 0.18 + 0.3), () =>
      text(ln, 0, -ch / 2 + 90 + i * f.size * 1.2 + f.size * 0.5, { size: f.size, font: "Serif", color: P.ink })));
    const who = "— " + [S.p.who, S.p.year].filter(Boolean).join(", ");
    const fw = fit(who, cw - 100, 36, 2, "Elite", "quote attribution");
    fw.lines.forEach((ln, i) => withAlpha(prog(t, rv + 0.5, rv + 0.9), () =>
      text(ln, cw / 2 - 50, ch / 2 - 60 - (fw.lines.length - 1 - i) * fw.size * 1.3, { size: fw.size, font: "Elite", align: "right" })));
  });
};

SCENE_FNS.split_compare = (t, S) => {
  graphPaper();
  const gap = 30, ph = (STAGE.h - gap) / 2;
  const panel = (y, label, c, k, seed) => popIn(W / 2, y + ph / 2, k, () => {
    ctx.rotate((rnd(seed, 1) - 0.5) * 0.03);
    cut(() => ctx.rect(-(W - 120) / 2, -ph / 2, W - 120, ph), c, { lw: 5 });
    const f = fit(String(label || ""), W - 220, 110, 3, "Anton", "split label");
    f.lines.forEach((ln, i) => text(ln, 0, (i - (f.lines.length - 1) / 2) * f.size * 1.1 + f.size * 0.35, { size: f.size, color: P.white, stroke: 12 }));
  });
  panel(STAGE.y, S.p.left_label, P.orange, pop(t, S.t0 + 0.1), 1);
  panel(STAGE.y + ph + gap, S.p.right_label, P.navy, pop(t, evT(S, "reveal", S.t0 + 0.6)), 2);
};

SCENE_FNS.versus = (t, S) => {
  graphPaper();
  const y = STAGE.y + STAGE.h * 0.62, sL = S.p.left, sR = S.p.right;
  const side = (name, x, dir, k) => popIn(x, y, k, () => PROPS[name] ? prop(name, { s: 0.9, dir }) : bigText(String(name).toUpperCase(), 0, -120, 380, 90, 2, 1, strSeed(name)));
  side(sL, W * 0.28, 1, pop(t, S.t0 + 0.1));
  side(sR, W * 0.72, -1, pop(t, S.t0 + 0.35));
  popIn(W / 2, y - 160, pop(t, S.t0 + 0.55), () => { cut(() => ctx.arc(0, 0, 70, 0, 7), P.yellow, { lw: 5 }); text("VS", 0, 26, { size: 76 }); });
  const vt = evT(S, "verdict", evT(S, "reveal", null));
  if (S.p.verdict && vt != null) stamp(String(S.p.verdict).toUpperCase(), W / 2, STAGE.y + 130, t - vt, { color: P.red, size: 130 });
};

SCENE_FNS.diagram_callout = (t, S) => {
  graphPaper();
  const obj = S.p.object || "building", cx = W / 2, base = STAGE.y + STAGE.h - 40;
  const [pw0, ph0] = PROP_SIZE[obj] || [300, 220];
  const s = Math.min(1.35, (W - 420) / pw0, (STAGE.h - 260) / ph0), pw = pw0 * s, ph = ph0 * s;
  popIn(cx, base, pop(t, S.t0 + 0.05, 0.4), () => prop(obj, { s: s * (1 + 0.05 * emph(t, S)), id: 3 }));
  const cs = S.p.callouts || [];
  cs.forEach((c, i) => {
    const at = c.at ? cue(c.at) : S.t0 + 0.4 + i * 0.4;
    const k = pop(t, at, 0.3);
    if (k <= 0) return;
    const left = i % 2 === 0;
    const ty = base - ph - 110 - (cs.length - 1 - i) * 100;            // one row per callout, above the prop, alternating sides
    const w = Math.min(measure(String(c.label), 42, "Elite") + 36, W - 80);
    const tx = left ? clamp(cx - pw / 2 - 40, 40, W - 40 - w) : clamp(cx + pw / 2 + 40 - w, 40, W - 40 - w);
    const fromX = left ? tx + w * 0.7 : tx + w * 0.3, toX = cx + (left ? -1 : 1) * pw * 0.28, toY = base - ph * 0.62;
    arrow(fromX, ty + 30, toX, toY, eout(prog(t, at + 0.05, at + 0.35)), P.red, 6);
    tag(String(c.label), tx, ty, { size: 42, align: "left", k, bg: P.yellow });
  });
};

SCENE_FNS.timeline = (t, S) => {
  graphPaper();
  const evs = S.p.events || [], x = 170, y0 = STAGE.y + 60, y1 = STAGE.y + STAGE.h - 40;
  const kl = eout(prog(t, S.t0 + 0.05, S.t0 + 0.6));
  stroke2(() => { ctx.moveTo(x, y0); ctx.lineTo(x, lerp(y0, y1, kl)); }, P.card, 10, 18);
  evs.forEach((e, i) => {
    const at = e.at ? cue(e.at) : S.t0 + 0.4 + i * 0.5, k = pop(t, at, 0.3);
    const y = lerp(y0 + 40, y1 - 40, evs.length > 1 ? i / (evs.length - 1) : 0.5);
    popIn(x, y, k, () => cut(() => ctx.arc(0, 0, 22, 0, 7), P.red, { lw: 4 }));
    if (k > 0) { text(String(e.date), x + 50, y - 14, { size: 60, align: "left" }); tag(String(e.label), x + 50, y + 40, { size: 32, align: "left", k }); }
  });
};

SCENE_FNS.outro_loop = (t, S) => {
  const E = SC.find(x => x.id === S.p.echo_of) || SC[0];
  if (E === S) { graphPaper(); return; }
  // the opening picture, settled, so the replay starts where it ends
  drawScene(E, landed(E) + (t - S.t0) * 0.25);
  const e = emph(t, S);
  if (e > 0) withAlpha(0.12 * e, () => { ctx.fillStyle = P.yellow; ctx.fillRect(0, 0, W, H); });
};

SCENE_FNS.custom = (t, S) => {
  const fn = window.CUSTOM && window.CUSTOM[S.p.fn];
  if (fn) return fn(t, S);
  warn(`custom scene ${S.id}: no function '${S.p.fn}' in the episode's scenes.js; drew a placeholder`);
  graphPaper();
  bigText("CUSTOM: " + S.p.fn, W / 2, STAGE.y + 80, W - 160, 90, 2, 1, 3);
  if (S.p.why) { const f = fit(S.p.why, W - 200, 40, 6, "Elite"); f.lines.forEach((l, i) => text(l, W / 2, STAGE.y + 380 + i * 54, { size: f.size, font: "Elite" })); }
};

// sound cues and settle times implied by scene types
SC.forEach(S => {
  S.cues = [];
  if (S.type === "count_up") { const a = evT(S, "count_start", S.t0 + 0.25); let b = evT(S, "count_stop", a + 1.4); if (b < a + 0.4) b = a + 1.2; S.landAt = b + 0.5; }
  if (S.type === "quote_card") { const lines = fit("“" + (S.p.quote || "") + "”", W - 260, 84, 8, "Serif").lines.length; S.landAt = S.t0 + 0.25 + lines * 0.18 + 1.0; }
  if (S.type === "split_compare") S.landAt = evT(S, "reveal", S.t0 + 0.6) + 0.5;
  if (S.type === "stamp_reveal") S.cues.push({ t: +evT(S, "reveal", S.t0 + 0.08).toFixed(3), type: "stamp" });
  if (S.type === "count_up") {
    const a = evT(S, "count_start", S.t0 + 0.25); let b = evT(S, "count_stop", a + 1.4); if (b < a + 0.4) b = a + 1.2;
    for (let x = a; x < b; x += 0.09) S.cues.push({ t: +x.toFixed(3), type: "tick" });
  }
  if (S.type === "diagram_callout") (S.p.callouts || []).forEach(c => c.at && S.cues.push({ t: +cue(c.at).toFixed(3), type: "pop" }));
});

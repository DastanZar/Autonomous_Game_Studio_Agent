// Prop library. Every prop draws with its feet/base at the origin, about 320 units tall at s = 1,
// facing +x. o: {x, y, s, dir, id, ...prop options}. Unknown props draw a labelled card and log a warning.
"use strict";

const PROPS = {
  soldier(o) {
    const wk = o.walk != null ? Math.sin(o.walk) : 0;
    ctx.translate(0, o.walk != null ? -Math.abs(Math.cos(o.walk)) * 5 : 0);
    for (const [sx, sgn] of [[-13, 1], [13, -1]]) {
      ctx.save(); ctx.translate(sx, -112); ctx.rotate(wk * 0.45 * sgn);
      cut(() => ctx.roundRect(-11, 0, 22, 100, 6), P.khaki2, { lw: 4 });
      cut(() => ctx.roundRect(-12, 88, 32, 22, 6), "#3d2f25", { lw: 4, shadow: false });
      ctx.restore();
    }
    cut(() => ctx.roundRect(-42, -212, 84, 112, 16), o.coat || P.khaki, { lw: 5 });
    cut(() => ctx.rect(-42, -134, 84, 12), "#5e4a2e", { lw: 3, shadow: false });
    stroke2(() => { ctx.moveTo(-34, -198); ctx.lineTo(-40 - wk * 18, -132); }, o.coat || P.khaki, 18, 26);
    stroke2(() => { ctx.moveTo(34, -198); ctx.lineTo(40 + wk * 18, -132); }, o.coat || P.khaki, 18, 26);
    cut(() => ctx.arc(0, -242, 27, 0, 7), P.skin, { lw: 4 });
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(10, -246, 3.4, 0, 7); ctx.arc(-4, -246, 3.4, 0, 7); ctx.fill();
    cut(() => ctx.roundRect(-30, -290, 60, 30, 10), o.helmet || "#5b5a3a", { lw: 4 });
    cut(() => ctx.ellipse(0, -262, 38, 8, 0, 0, 7), o.helmet || "#5b5a3a", { lw: 4, shadow: false });
  },
  person(o) {
    const sh = o.shirt || [P.navy, P.green, P.orange, P.red][(o.id || 0) % 4];
    const wk = o.walk != null ? Math.sin(o.walk) : 0;
    for (const [sx, sgn] of [[-12, 1], [12, -1]]) {
      ctx.save(); ctx.translate(sx, -110); ctx.rotate(wk * 0.45 * sgn);
      cut(() => ctx.roundRect(-10, 0, 20, 104, 6), "#3f4a5a", { lw: 4 });
      ctx.restore();
    }
    cut(() => ctx.roundRect(-40, -210, 80, 110, 18), sh, { lw: 5 });
    stroke2(() => { ctx.moveTo(-32, -196); ctx.lineTo(-38 - wk * 16, -128); }, sh, 16, 24);
    stroke2(() => { ctx.moveTo(32, -196); ctx.lineTo(38 + wk * 16, -128); }, sh, 16, 24);
    cut(() => ctx.arc(0, -240, 28, 0, 7), P.skin, { lw: 4 });
    cut(() => { ctx.arc(0, -246, 29, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); }, "#4a3222", { lw: 3, shadow: false });
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(10, -240, 3.4, 0, 7); ctx.arc(-6, -240, 3.4, 0, 7); ctx.fill();
  },
  flag(o) {   // pole + waving flag; o.colors: stripe colours top to bottom
    const cs = o.colors || [P.card];   // neutral by default: a striped placeholder can read as a real country's flag
    stroke2(() => { ctx.moveTo(0, 0); ctx.lineTo(0, -330); }, "#8a6a45", 8, 14);
    cut(() => ctx.arc(0, -334, 10, 0, 7), P.yellow, { lw: 3, shadow: false });
    const wv = Math.sin(T * 5 + (o.id || 0));
    const fw = 200, fh = 130;
    const edge = (y) => [fw + Math.sin(T * 5 + y * 0.03) * 8, -320 + y];
    cs.forEach((c, i) => {
      const y0 = i * fh / cs.length, y1 = (i + 1) * fh / cs.length;
      cut(() => {
        ctx.moveTo(4, -320 + y0);
        ctx.quadraticCurveTo(fw / 2, -320 + y0 + wv * 10, ...edge(y0));
        ctx.lineTo(...edge(y1));
        ctx.quadraticCurveTo(fw / 2, -320 + y1 + wv * 10, 4, -320 + y1);
        ctx.closePath();
      }, c, { lw: i === cs.length - 1 ? 4 : 0, shadow: i === 0 });
    });
    if (!o.colors) { ctx.save(); ctx.translate(fw / 2, -320 + fh / 2 + wv * 5); star(0, 0, 34, P.red); ctx.restore(); }
    cut(() => { ctx.moveTo(4, -320); ctx.quadraticCurveTo(fw / 2, -320 + wv * 10, ...edge(0)); ctx.lineTo(...edge(fh)); ctx.quadraticCurveTo(fw / 2, -320 + fh + wv * 10, 4, -320 + fh); ctx.closePath(); }, "rgba(0,0,0,0)", { lw: 4, shadow: false });
  },
  building(o) {  // shopfront / house; o.door: 0..1 highlight, o.border: draw a dashed border line through it
    const wall = o.wall || "#e7d3b0";
    cut(() => ctx.rect(-170, -300, 340, 300), wall, { lw: 5 });
    cut(() => { ctx.moveTo(-195, -296); ctx.lineTo(0, -410); ctx.lineTo(195, -296); ctx.closePath(); }, o.roof || P.red, { lw: 5 });
    for (const wx of [-110, 60]) {
      cut(() => ctx.rect(wx, -250, 60, 60), "#cfe0e3", { lw: 4, shadow: false });
      line(wx + 30, -250, wx + 30, -190, P.ink, 3); line(wx, -220, wx + 60, -220, P.ink, 3);
    }
    const dk = o.door || 0;
    if (dk > 0) cut(() => ctx.roundRect(-52, -148, 104, 156, 10), `rgba(242,193,78,${0.35 * dk})`, { lw: 0, shadow: false });
    cut(() => ctx.roundRect(-40, -140, 80, 140, 6), o.doorColor || P.navy, { lw: 4 });
    ctx.fillStyle = P.yellow; ctx.beginPath(); ctx.arc(24, -70, 6, 0, 7); ctx.fill();
    if (o.border) line(o.border, -440, o.border, 30, P.ink, 5, [18, 14]);
  },
  truck(o) {
    for (const wx of [-150, 135]) {
      ctx.save(); ctx.translate(wx, -40);
      cut(() => ctx.arc(0, 0, 40, 0, 7), "#2f2a25", { lw: 4 });
      cut(() => ctx.arc(0, 0, 18, 0, 7), "#7d7a6e", { lw: 3, shadow: false });
      ctx.restore();
    }
    cut(() => ctx.roundRect(-235, -118, 250, 40, 6), o.body || P.olive, { lw: 4 });
    cut(() => ctx.roundRect(15, -220, 110, 145, 10), o.body || P.olive, { lw: 4 });
    cut(() => ctx.roundRect(38, -205, 70, 55, 6), "#d7e2d6", { lw: 3, shadow: false });
    cut(() => { ctx.moveTo(125, -160); ctx.quadraticCurveTo(215, -165, 222, -120); ctx.lineTo(225, -78); ctx.lineTo(125, -78); ctx.closePath(); }, o.body || P.olive, { lw: 4 });
    cut(() => ctx.arc(222, -128, 11, 0, 7), "#f6e3a0", { lw: 3, shadow: false });
  },
  bus(o) { PROPS.truck(Object.assign({ body: P.yellow }, o)); },
  machine_gun(o) {
    stroke2(() => { ctx.moveTo(40, -70); ctx.lineTo(20, 0); ctx.moveTo(40, -70); ctx.lineTo(62, 0); }, P.steel2, 5, 10);
    cut(() => { ctx.moveTo(-150, -86); ctx.lineTo(-80, -96); ctx.lineTo(-80, -66); ctx.lineTo(-150, -54); ctx.closePath(); }, P.brown, { lw: 4 });
    cut(() => ctx.roundRect(-85, -98, 190, 34, 12), P.steel, { lw: 4 });
    cut(() => ctx.rect(100, -88, 55, 14), P.steel, { lw: 4 });
    cut(() => ctx.ellipse(-30, -110, 50, 13, 0, 0, 7), "#3a3934", { lw: 4 });
  },
  telegram(o) {
    ctx.rotate(-0.04);
    cut(() => ctx.rect(-170, -300, 340, 280), P.card, { lw: 4 });
    text("TELEGRAM", 0, -250, { size: 40, font: "Elite" });
    for (let i = 0; i < 5; i++) line(-130, -200 + i * 36, 130 - (i === 4 ? 90 : rnd(i, 3) * 40), -200 + i * 36, "rgba(43,35,32,0.55)", 5);
  },
  plane(o) {
    cut(() => { ctx.ellipse(0, -60, 170, 34, 0, 0, 7); }, P.card, { lw: 4 });
    cut(() => { ctx.moveTo(-20, -60); ctx.lineTo(-90, 20); ctx.lineTo(-40, 20); ctx.lineTo(40, -60); ctx.closePath(); }, P.steel2, { lw: 4 });
    cut(() => { ctx.moveTo(-150, -70); ctx.lineTo(-185, -130); ctx.lineTo(-150, -130); ctx.lineTo(-120, -70); ctx.closePath(); }, P.red, { lw: 4 });
  },
  ship(o) {
    cut(() => { ctx.moveTo(-220, -110); ctx.lineTo(220, -110); ctx.lineTo(170, 0); ctx.lineTo(-170, 0); ctx.closePath(); }, P.red, { lw: 5 });
    cut(() => ctx.rect(-110, -200, 180, 90), P.card, { lw: 4 });
    cut(() => ctx.rect(20, -270, 40, 70), P.navy, { lw: 4 });
  },
};
// approximate drawn size at s = 1, for layout (callouts, fitting)
const PROP_SIZE = { soldier: [120, 300], person: [120, 280], flag: [220, 340], building: [390, 410], truck: [470, 250], bus: [470, 250],
  machine_gun: [320, 120], telegram: [340, 300], plane: [380, 170], ship: [440, 270] };
function prop(name, o = {}) {
  ctx.save(); ctx.translate(o.x || 0, o.y || 0); boil(o.id || strSeed(name) % 97, 0.7 / (o.s || 1));
  ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
  const fn = PROPS[name];
  if (fn) fn(o);
  else {
    warn(`prop '${name}' is not in the prop library (${Object.keys(PROPS).join(", ")}); drew a card`);
    cut(() => ctx.roundRect(-150, -220, 300, 220, 14), P.card, { lw: 4 });
    text(String(name).toUpperCase().replace(/_/g, " "), 0, -100, { size: 44 });
  }
  ctx.restore();
}

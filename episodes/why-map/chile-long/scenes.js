// Why Chile is so long, and why landlocked Bolivia still has a navy. House method: paper cast and props (paper kit),
// 3D map flights for geography (flight kit), the one big number in moving type (kinetic kit), flag art (flagart kit).
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const BRAND = "BORDER QUIRKS";

// ---------- one flight over the real continent (Natural Earth 1:10m) ----------
const F = makeFlight({
  origin: [-70, -30], near: "s_hook", colors: { CL: 0xd0644f, BO: 0x8fb26a, AR: 0xe2cfa2, PE: 0xd9c9a2, default: 0xe6d8b6 }, sea: 0x93b4ae, switchKm: 1e6,
  keys: [
    [0, -70.5, -37, 9800, 0, 4], [at("sides.start"), -70.5, -37, 8800, 0, 6], [at("sides.end") + 0.2, -71, -33, 1600, 0, 48],
    [at("north.start"), -70, -28, 2600, 0, 25], [at("north.end") + 0.2, -69.5, -22.5, 1500, 0, 30],
    [at("port.start"), -70.2, -23.5, 900, 0, 30], [at("port.end"), -70.4, -23.65, 360, 0, 40],
    [at("won.end"), -69.5, -21.5, 1500, 0, 25], [at("land.end") + 0.2, -66, -19, 3400, 0, 14],
    [at("toll.start"), -66, -24, 6200, 0, 8], [at("toll.end") + 0.5, -69.5, -33, 9800, 0, 4],
  ],
});

// ---------- small props ----------
function sack(x, gy, s, k, id) { if (k <= 0) return; ctx.save(); ctx.translate(x, gy - (1 - eout(k)) * 800); ctx.rotate((rnd(id, 3) - 0.5) * 0.2); ctx.scale(s, s); footShadow(0, 2, 80);
  piece(() => { ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-86, -80, -50, -150); ctx.quadraticCurveTo(0, -170, 50, -150); ctx.quadraticCurveTo(86, -80, 70, 0); ctx.closePath(); }, "#d8c7a0", { lw: 4, rim: 7 });
  line(-30, -150, 30, -150, KA.ink, 5); text("NITRATE", 0, -66, { size: 30, color: KA.red2 }); ctx.restore(); }
function boat(x, gy, s, dir) { ctx.save(); ctx.translate(x, gy); ctx.scale(s * dir, s); ctx.rotate(Math.sin(T * 1.6) * 0.02);
  piece(() => { ctx.moveTo(-200, -50); ctx.lineTo(210, -50); ctx.quadraticCurveTo(220, -20, 180, 10); ctx.lineTo(-180, 10); ctx.closePath(); }, "#e9e4d8", { lw: 4, rim: 7 });
  piece(() => ctx.rect(-190, -30, 380, 10), "#26324f", { lw: 0, light: false, shadow: false });
  piece(() => ctx.roundRect(-60, -130, 150, 80, 8), "#d6d0c2", { lw: 3.5, rim: 5 }); ctx.fillStyle = "#3a4a5a"; for (let i = 0; i < 3; i++) ctx.fillRect(-44 + i * 44, -112, 30, 24);
  line(-150, -50, -150, -190, KA.ink, 4); ctx.save(); ctx.translate(-150, -190); flagArt("BO", 0, 0, 80, null, { lw: 2 }); ctx.restore(); ctx.restore(); }
function lakeSet(t, o = {}) {
  sky({ sunX: 820, sunY: 420, top: "#cfd6d6", bot: "#e6e2d2" });
  ridge(900, 420, KA.mtnFar, 0, 11, 0, true); ridge(980, 260, KA.mtnMid, 0, 12, 0, true); haze(600, 1000, 0.35);
  seaBand(1000, H, t * 30, KA.sea2);
}
function wedge(x, y, w, h, col) { piece(() => { ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * 0.06, y - h); ctx.lineTo(x + w * 0.08, y - h * 0.97); ctx.lineTo(x + w / 2, y); ctx.closePath(); }, col, { lw: 4.5, rim: 10 }); }

// 1. HOOK: the whole country, top to bottom, and the one big number
CU.hook = (t, S) => {
  F.draw(t);
  flightPin(F, "CHILE", -72.5, -41, t, S.t0 + 0.1, { size: 40, bg: "#f2c9bd", up: 50 });
  bigNumber(t, at("hook/four") - 0.1, { value: 4270, suffix: " KM", label: "LONG", stroke: 14, size: 200, y: 520, roll: 1.0, colors: { fg: KA.cream, accent: KA.red, ink: KA.ink } });
  const ta = at("hook/average") - 0.1;
  if (t > ta) {                                  // a width bracket across the country at Santiago's latitude
    const [x0, y0] = F.project(-71.65, -33.4), [x1, y1] = F.project(-70.0, -33.4), k = eio(pp(t, ta, 0.5)), xm = (x0 + x1) / 2;
    ctx.save(); ctx.strokeStyle = KA.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xm - (xm - x0) * k, y0); ctx.lineTo(xm + (x1 - xm) * k, y1); ctx.stroke(); ctx.restore();
    popLabel("177 KM WIDE (AVERAGE)", Math.min(760, xm + 220), y0 - 40, t, ta + 0.3, { size: 32, bg: KA.mustard });
  }
  brandTag(BRAND);
};
// 2. SIDES: the ocean on one side, the mountains on the other
CU.sides = (t, S) => {
  F.draw(t);
  flightPin(F, "PACIFIC OCEAN", -75.5, -32, t, at("sides/pacific") - 0.1, { size: 36, bg: "#cfe0dc", up: 40 });
  flightPin(F, "THE ANDES", -69.9, -32.5, t, at("sides/andes") - 0.1, { size: 36, bg: KA.cream, up: 120 });
  brandTag(BRAND);
};
// 3. TREATY: the border follows the highest peaks that divide the waters
CU.treaty = (t, S) => {
  const th = at("treaty/highest") - 0.1;
  sky({ sunX: 860, sunY: 400, top: "#d7cdb8" }); ridge(1100, 300, KA.mtnFar, 0, 21, 0, true); haze(700, 1200, 0.35);
  wedge(540, 1560, 1300, 900, "#9aa29c");
  piece(() => { ctx.moveTo(540 - 1300 * 0.06 - 150, 860); ctx.lineTo(540 - 1300 * 0.06, 660); ctx.lineTo(540 + 1300 * 0.08, 687); ctx.lineTo(540 + 180, 880); ctx.quadraticCurveTo(540, 830, 540 - 230, 860); ctx.closePath(); }, KA.snow, { lw: 4, rim: 6 });
  nearGround(1560, 0, "#8f9a72");
  // the border post on the summit, Chile's flag west, Argentina's east
  piece(() => ctx.rect(470, 560, 14, 120), KA.wood2, { lw: 3, rim: 3 }); flagArt("CL", 340, 540, 120); flagArt("AR", 500, 540, 120);
  if (t > th) for (let i = 0; i < 10; i++) { const a = ((t - th) * 0.7 + i / 10) % 1, side = i % 2 ? 1 : -1; ctx.fillStyle = "#4f86a8"; ctx.beginPath(); ctx.arc(480 + side * (40 + a * 520), 700 + a * 760, 12, 0, 7); ctx.fill(); }
  surveyor({ x: 220, gy: 1640, s: 1.0, id: 13 }); surveyor({ x: 880, gy: 1640, s: 1.0, dir: -1, id: 14 });
  popLabel("1881 · BOUNDARY TREATY", W / 2, 380, t, at("treaty/eightyone") - 0.1, { size: 36, bg: KA.cream });
  quoteCard(540, 1000, 820, "...over the highest summits of the said Cordilleras which divide the waters", "Chile–Argentina treaty, 1881", t, th + 0.2, { size: 40 });
  brandTag(BRAND);
};
// 4. NORTH: up to the desert
CU.north = (t, S) => {
  F.draw(t);
  flightPin(F, "ATACAMA DESERT", -69.3, -24.5, t, at("north/north") - 0.1, { size: 36, bg: KA.cream, up: 60 });
  kText("THE NORTH", W / 2, 470, 110, t, at("north/north") - 0.1, { color: KA.cream, stroke: 14, ls: 4 });
  brandTag(BRAND);
};
// 5. WAR: Chile against Bolivia and Peru, over fertilizer
CU.war = (t, S) => {
  const tb = at("war/bolivia") - 0.1, tp = at("war/peru") - 0.1, tf = at("war/fertilizer") - 0.2;
  sky({ sunX: 840, sunY: 380, top: "#e2c79c", bot: "#efd9b0" }); ridge(1000, 260, "#c9a578", 0, 31, 0, false); ridge(1060, 160, "#d6b383", 0, 32, 0, false);
  nearGround(1100, 0, "#dcc08e");
  for (let i = 0; i < 4; i++) trooper({ x: 80 + i * 80, gy: 1300 + i * 16, s: 0.8, side: "US", coat: "#27335a", cap: "#b8322a", musket: true, id: 10 + i, look: 1, brow: 0.6 });
  for (let i = 0; i < 2; i++) if (t > tb) trooper({ x: 1000 - i * 80, gy: 1300 + i * 16, s: 0.8, side: "US", dir: -1, coat: "#7a3a2a", cap: "#d9a441", musket: true, id: 20 + i, look: 1, brow: 0.6 });
  for (let i = 0; i < 2; i++) if (t > tp) trooper({ x: 840 - i * 80, gy: 1300 + i * 16, s: 0.8, side: "US", dir: -1, coat: "#e8e2d6", cap: "#b8322a", musket: true, id: 30 + i, look: 1, brow: 0.6 });
  flagArt("CL", 70, 360, 160); if (t > tb) flagArt("BO", W - 230, 360, 160); if (t > tp) flagArt("PE", W - 230, 500, 160);
  popLabel("1879 · WAR OF THE PACIFIC", W / 2, 700, t, S.t0 + 0.2, { size: 34, bg: KA.cream });
  for (let i = 0; i < 4; i++) sack(400 + i * 95, 1280 + (i % 2) * 20, 0.8, pp(t, tf + i * 0.1, 0.5), i);
  brandTag(BRAND);
};
// 6. PORT: Antofagasta, taken without a fight
CU.port = (t, S) => {
  F.draw(t);
  flightPin(F, "ANTOFAGASTA (BOLIVIA)", -70.4, -23.65, t, at("port/antofagasta") - 0.2, { size: 34, bg: "#d7e6c4", up: 90 });
  popLabel("14 FEB 1879", W / 2, 420, t, at("port/antofagasta") + 0.2, { size: 40, bg: KA.cream });
  if (t > at("port/fight") - 0.1) stamp("WITHOUT A FIGHT", 540, 1600, t - at("port/fight") + 0.1, { size: 84, rot: -0.06, color: KA.red });
  brandTag(BRAND);
};
// 7. WON: the coast changes hands
CU.won = (t, S) => {
  F.draw(t);
  const tc = at("won/coast") - 0.1;
  flightPin(F, "TARAPACÁ ← PERU", -69.6, -20.0, t, tc, { size: 32, bg: "#f2c9bd", up: 60 });
  flightPin(F, "LITORAL ← BOLIVIA", -69.6, -23.0, t, tc + 0.25, { size: 32, bg: "#f2c9bd", up: 200 });
  kText("CHILE WON", W / 2, 470, 110, t, at("won/won") - 0.1, { color: KA.cream, stroke: 14, ls: 4 });
  brandTag(BRAND);
};
// 8. LAND: Bolivia, landlocked
CU.land = (t, S) => {
  F.draw(t);
  flightPin(F, "BOLIVIA", -64.5, -17, t, S.t0 + 0.1, { size: 40, bg: "#d7e6c4", up: 50 });
  stamp("LANDLOCKED", 540, 430, t - at("land/landlocked") + 0.1, { size: 120, rot: -0.08, color: KA.red });
  brandTag(BRAND);
};
// 9. NAVY: a navy on a lake 3,800 metres up
CU.navy = (t, S) => {
  lakeSet(t);
  boat(760, 1180, 0.9, -1);
  piece(() => ctx.rect(-20, 1300, 640, 70), KA.wood, { lw: 4.5, rim: 8 });             // the dock
  for (let i = 0; i < 4; i++) trooper({ x: 90 + i * 130, gy: 1300, s: 0.85, side: "sailor", id: 40 + i, look: 1, salute: t > at("navy/navy") - 0.1 });
  flagArt("BO", 70, 360, 170);
  const tf = at("navy/five") - 0.1;
  if (t > tf) { rollNumber(5000 * eout(pp(t, tf, 0.9)), W / 2 + 120, 560, 160, { color: KA.cream, stroke: 12, ink: KA.ink }); kText("PERSONNEL (2018)", W / 2 + 120, 640, 44, t, tf + 0.2, { color: KA.navy, ls: 4 }); }
  brandTag(BRAND);
};
// 10. LAKE: rivers, and a lake
CU.lake = (t, S) => {
  lakeSet(t);
  boat(lerp(1200, 300, eio(pp(t, S.t0, 2.6))), 1250, 1.1, -1);
  popLabel("RIVERS ✓", 300, 480, t, at("lake/rivers") - 0.1, { size: 44, bg: KA.cream });
  popLabel("LAKE TITICACA · 3,800 m", W / 2, 620, t, at("lake/lake") - 0.1, { size: 40, bg: KA.mustard });
  brandTag(BRAND);
};
// 11. DAY: the Day of the Sea parade
CU.day = (t, S) => {
  paperBG("#e9dcc0");
  sky({ sunX: 860, sunY: 380, top: "#d9cdb4" }); ridge(1050, 360, KA.mtnFar, 0, 41, 0, true); nearGround(1150, 0, "#b5a77f");
  const x0 = lerp(-500, 200, eio(pp(t, S.t0, 3.5)));
  card(x0 + 260, 1060, 560, 130, 0, 1, () => text("DÍA DEL MAR", 0, 24, { size: 70, color: KA.navy }), { tape: false });
  for (let i = 0; i < 6; i++) trooper({ x: x0 + i * 100, gy: 1420, s: 0.8, side: "sailor", walk: t * 7 + i, id: 60 + i, look: 1 });
  card(820, 560, 300, 260, 0.05, spring(pp(t, at("day/march") - 0.1, 0.6)), (w, h) => { piece(() => ctx.rect(-w / 2, -h / 2, w, 64), KA.red, { lw: 0, light: false, shadow: false }); text("MARCH", 0, -h / 2 + 46, { size: 36, color: KA.cream }); text("23", 0, 70, { size: 120 }); }, { tape: false });
  brandTag(BRAND);
};
// 12. TOLL: the long country, and the navy with no sea
CU.toll = (t, S) => {
  F.draw(t);
  flightPin(F, "CHILE", -71.5, -27, t, at("toll/long") - 0.1, { size: 40, bg: "#f2c9bd", up: 50 });
  if (t > at("toll/navy") - 0.2) { trooper({ x: 860, gy: 1700, s: 0.9, side: "sailor", id: 70, look: -1, salute: true }); flagArt("BO", 780, 1250, 150); }
  kText("A NAVY WITH NO SEA", W / 2, 470, 84, t, at("toll/navy") - 0.1, { color: KA.cream, stroke: 12, ls: 2 });
  brandTag(BRAND);
};

// Point Roberts, version B: a 3D PAPER MINIATURE (Three.js r159, WebGL on SwiftShader, deterministic).
// Method: one physical world, built from the real coastline (OSM, extruded into paper slabs) nested inside the real
// continent (Natural Earth), lit by a low sun with soft shadows, and filmed by ONE continuous camera that flies
// from street level to 1846 and back. Props are paper-craft miniatures (instanced trees and houses, a car, a bus,
// booths, crates). Labels and numbers are typeset in 2D over the frame, pinned to 3D positions.
"use strict";
window.CUSTOM = window.CUSTOM || {};
const CU = window.CUSTOM;
const at = c => cue(c);
const pp = (t, a, d) => clamp((t - a) / d);
const spring = (k, f = 4.2, d = 5.5) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-d * k) * Math.cos(f * Math.PI * k);
const T3 = window.THREE;

// ---------- units: kilometres, origin at Point Roberts ----------
const LON0 = -123.06, LAT0 = 48.99, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 110.57;
const km = (lon, lat) => [(lon - LON0) * KX, (lat - LAT0) * KY];          // [east, north]
const v3 = (lon, lat, h = 0) => { const [x, n] = km(lon, lat); return new T3.Vector3(x, h, -n); };
const BORDER_LAT = 49.0021, SLAB = 0.25, LOCAL_TOP = SLAB + 0.02;

const COL = { sea: 0x8fb0aa, seaDeep: 0x7a9e98, ca: 0xe2cfa2, us: 0xe39a4f, edge: 0xb89a6a, pine: 0x5b7048, pine2: 0x4a5e3b, house: 0xf1e3c6, roof: 0xa8503a, red: 0xc0442c, white: 0xf7efdf, sage: 0x6f8f86, bus: 0xe9b23a, road: 0x6e6a61, wood: 0x8a6142, crate: 0xa77a4f };

// ---------- the renderer (an offscreen WebGL canvas, copied into the engine's 2D frame) ----------
const GL = document.createElement("canvas"); GL.width = W; GL.height = H;
const R = new T3.WebGLRenderer({ canvas: GL, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false);
R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap;
R.outputColorSpace = T3.SRGBColorSpace;
const SC3 = new T3.Scene();
SC3.background = new T3.Color(0xe9dcc0);
SC3.fog = new T3.Fog(0xe9dcc0, 60, 400);
const CAM = new T3.PerspectiveCamera(30, W / H, 0.01, 40000);
SC3.add(new T3.HemisphereLight(0xfff4dc, 0x7d6a50, 1.25));
const SUN = new T3.DirectionalLight(0xfff0d0, 2.4); SUN.castShadow = true;
SUN.shadow.mapSize.set(2048, 2048); SUN.shadow.bias = -0.0004; SUN.shadow.normalBias = 0.02; SUN.shadow.radius = 4;
SC3.add(SUN); SC3.add(SUN.target);

// a paper texture: soft fibres, generated once from the seeded hash
function paperTex(base) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256), d = img.data;
  for (let i = 0; i < 256 * 256; i++) { const v = (rnd(i, 3, 17) - 0.5) * 14; d[i * 4] += v; d[i * 4 + 1] += v; d[i * 4 + 2] += v; }
  g.putImageData(img, 0, 0);
  g.strokeStyle = "rgba(90,70,40,0.10)"; for (let i = 0; i < 260; i++) { const x = rnd(i, 1, 23) * 256, y = rnd(i, 2, 23) * 256, a = rnd(i, 3, 23) * 6.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke(); }
  const tx = new T3.CanvasTexture(c); tx.wrapS = tx.wrapT = T3.RepeatWrapping; tx.colorSpace = T3.SRGBColorSpace; return tx;
}
const hex = n => "#" + n.toString(16).padStart(6, "0");
function paperMat(col, rep = 0.08) { const tx = paperTex(hex(col)); tx.repeat.set(rep, rep); return new T3.MeshLambertMaterial({ map: tx }); }
const MAT = {};
for (const [k, c] of Object.entries(COL)) MAT[k] = new T3.MeshLambertMaterial({ color: c });
MAT.caPaper = paperMat(COL.ca, 0.06); MAT.usPaper = paperMat(COL.us, 0.06); MAT.seaPaper = paperMat(COL.sea, 0.02);
MAT.side = new T3.MeshLambertMaterial({ color: 0xcab486 });

// ---------- land: extruded paper slabs from real polygons ----------
function shapesFrom(polys) {
  const out = [];
  for (const poly of polys) {
    const ring = poly[0]; if (ring.length < 4) continue;
    const sh = new T3.Shape(ring.map(([lo, la]) => new T3.Vector2(...km(lo, la))));
    for (const hole of poly.slice(1)) if (hole.length > 3) sh.holes.push(new T3.Path(hole.map(([lo, la]) => new T3.Vector2(...km(lo, la)))));
    out.push(sh);
  }
  return out;
}
function slab(polys, mat, depth, y0, o = {}) {
  const g = new T3.ExtrudeGeometry(shapesFrom(polys), { depth, bevelEnabled: o.bevel ?? true, bevelThickness: depth * 0.25, bevelSize: o.bevelSize ?? depth * 0.25, bevelSegments: 1, curveSegments: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
  const m = new T3.Mesh(g, [mat, MAT.side]); m.castShadow = o.cast ?? true; m.receiveShadow = true; return m;
}
const isPR = poly => poly[0].some(([lo, la]) => lo < -122.99 && lo > -123.12 && la > 48.95);
const local = new T3.Group(), continent = new T3.Group();
SC3.add(local); SC3.add(continent);
{
  const g = GEO.s_drive;
  for (const L of g.layers) {
    if (L.iso === "US") { local.add(slab(L.polys.filter(p => !isPR(p)), MAT.usPaper, SLAB, 0)); local.add(slab(L.polys.filter(isPR), MAT.usPaper, SLAB, 0)); }
    else local.add(slab(L.polys, MAT.caPaper, SLAB, 0));
  }
  const sea = new T3.Mesh(new T3.PlaneGeometry(400, 400), MAT.seaPaper); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; local.add(sea);
  const gc = GEO.s_treaty;
  for (const L of gc.layers) continent.add(slab(L.polys, MAT.caPaper, 6, -0.2, { bevel: false, cast: false }));
  const ocean = new T3.Mesh(new T3.PlaneGeometry(8000, 8000), MAT.seaPaper); ocean.rotation.x = -Math.PI / 2; ocean.position.y = -0.4; continent.add(ocean);
}
// land test in km for scattering props (deterministic)
const LANDP = (() => { const c = document.createElement("canvas").getContext("2d"); const p = { CA: new Path2D(), US: new Path2D() }; for (const L of GEO.s_drive.layers) { const P = L.iso === "US" ? p.US : p.CA; for (const poly of L.polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const [x, n] = km(lo, la); j ? P.lineTo(x, n) : P.moveTo(x, n); }); P.closePath(); } } return { has: (iso, x, n) => c.isPointInPath(p[iso], x, n, "evenodd") }; })();

// ---------- props ----------
function pineGeo() {
  const parts = [];
  const trunk = new T3.CylinderGeometry(0.012, 0.016, 0.05, 6); trunk.translate(0, 0.025, 0); parts.push(trunk);
  for (let i = 0; i < 3; i++) { const c = new T3.ConeGeometry(0.075 - i * 0.017, 0.09, 7); c.translate(0, 0.07 + i * 0.05, 0); parts.push(c); }
  return mergeGeos(parts);
}
function mergeGeos(list) {                                   // a tiny merge (positions + normals only)
  let n = 0; list.forEach(g => { g = g.index ? g.toNonIndexed() : g; n += g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  list.forEach(g0 => { const g = g0.index ? g0.toNonIndexed() : g0; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
  const out = new T3.BufferGeometry(); out.setAttribute("position", new T3.BufferAttribute(pos, 3)); out.setAttribute("normal", new T3.BufferAttribute(nor, 3)); return out;
}
function houseGeo() { const b = new T3.BoxGeometry(0.11, 0.07, 0.08); b.translate(0, 0.035, 0); return b; }
function roofGeo() { const r = new T3.CylinderGeometry(0.0, 0.085, 0.05, 4, 1); r.rotateY(Math.PI / 4); r.scale(1, 1, 0.75); r.translate(0, 0.095, 0); return r; }
const D = new T3.Object3D();
function scatter(geo, mat, n, test, scale, seed, y = LOCAL_TOP - 0.02) {
  const im = new T3.InstancedMesh(geo, mat, n); im.castShadow = true; im.receiveShadow = true; let k = 0;
  for (let i = 0; i < n * 6 && k < n; i++) {
    const x = (rnd(i, seed, 1) - 0.5) * 60, nn = (rnd(i, seed, 2) - 0.5) * 40 + 6; if (!test(x, nn, i)) continue;
    const s = scale * (0.7 + rnd(i, seed, 3) * 0.6);
    D.position.set(x, y, -nn); D.rotation.set(0, rnd(i, seed, 4) * 6.28, 0); D.scale.set(s, s, s); D.updateMatrix(); im.setMatrixAt(k++, D.matrix);
  }
  im.count = k; return im;
}
const prBox = (x, n) => x > -2.4 && x < 2.6 && n > -2.6 && n < 1.35;     // the town, roughly, in km
local.add(scatter(pineGeo(), MAT.pine, 2600, (x, n, i) => LANDP.has("CA", x, n) && !(Math.abs(n - 1.35) < 0.15) && rnd(i, 9) < 0.55, 1.1, 31));
local.add(scatter(pineGeo(), MAT.pine2, 900, (x, n) => LANDP.has("US", x, n) && !(x > -0.9 && x < 0.9 && n > -0.6 && n < 0.9), 1.0, 32));
const HOUSES = scatter(houseGeo(), MAT.house, 420, (x, n) => LANDP.has("US", x, n) && prBox(x, n), 1.5, 41); local.add(HOUSES);
const ROOFS = scatter(roofGeo(), MAT.roof, 420, (x, n) => LANDP.has("US", x, n) && prBox(x, n), 1.5, 41); local.add(ROOFS);

// the 49th parallel: a red paper ribbon on white pins
const RIBBON = (() => { const g = new T3.Group(); const a = v3(-123.4, BORDER_LAT, LOCAL_TOP + 0.08), b = v3(-122.4, BORDER_LAT, LOCAL_TOP + 0.08);
  const len = a.distanceTo(b), rib = new T3.Mesh(new T3.BoxGeometry(len, 0.03, 0.06), MAT.red); rib.position.copy(a.clone().add(b).multiplyScalar(0.5)); rib.castShadow = true; g.add(rib);
  for (let i = 0; i <= 36; i++) { const p = a.clone().lerp(b, i / 36), pin = new T3.Mesh(new T3.CylinderGeometry(0.02, 0.02, 0.12, 6), MAT.white); pin.position.set(p.x, LOCAL_TOP + 0.04, p.z); pin.castShadow = true; g.add(pin); }
  return g; })();
local.add(RIBBON);
// the continent's line (1846), a long ribbon drawn on by scaling
const LINE46 = (() => { const a = v3(-114, 49, 6.2), b = v3(-124.6, 49, 6.2), len = a.distanceTo(b); const g = new T3.BoxGeometry(len, 3, 14); g.translate(-len / 2, 0, 0); const m = new T3.Mesh(g, MAT.red); m.position.copy(a); return m; })();
continent.add(LINE46);

// roads: the one road out, and the drive to Blaine
const ROAD = [[-123.058, 48.982], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06]];
const ROUTE = [[-123.055, 48.985], [-123.0632, 49.0021], [-123.066, 49.03], [-123.06, 49.06], [-123.0, 49.08], [-122.93, 49.095], [-122.89, 49.103], [-122.84, 49.08], [-122.80, 49.04], [-122.765, 49.015], [-122.757, 49.0021], [-122.75, 48.99]];
const curve = P => new T3.CatmullRomCurve3(P.map(([lo, la]) => v3(lo, la, LOCAL_TOP + 0.005)), false, "centripetal", 0.2);
const ROUTE_C = curve(ROUTE), ROAD_C = curve(ROAD);
const roadMesh = new T3.Mesh(new T3.TubeGeometry(ROUTE_C, 400, 0.05, 4, false), MAT.road); roadMesh.scale.y = 0.4; roadMesh.receiveShadow = true; local.add(roadMesh);
const routeGlow = new T3.Mesh(new T3.TubeGeometry(ROUTE_C, 400, 0.22, 6, false), new T3.MeshBasicMaterial({ color: 0xf2c14e })); routeGlow.scale.y = 0.3; local.add(routeGlow);

function makeCar(col) {
  const g = new T3.Group();
  const body = new T3.Mesh(new T3.BoxGeometry(0.30, 0.09, 0.14), new T3.MeshLambertMaterial({ color: col })); body.position.y = 0.075; g.add(body);
  const cab = new T3.Mesh(new T3.BoxGeometry(0.17, 0.07, 0.12), new T3.MeshLambertMaterial({ color: 0xcfe0dc })); cab.position.set(-0.02, 0.15, 0); g.add(cab);
  for (const [x, z] of [[-0.1, 0.075], [0.1, 0.075], [-0.1, -0.075], [0.1, -0.075]]) { const w = new T3.Mesh(new T3.CylinderGeometry(0.035, 0.035, 0.03, 10), MAT.wood); w.rotation.x = Math.PI / 2; w.position.set(x, 0.035, z); g.add(w); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
const CAR = makeCar(COL.sage); local.add(CAR);
const BUS = (() => { const g = new T3.Group(); const b = new T3.Mesh(new T3.BoxGeometry(0.5, 0.15, 0.17), MAT.bus); b.position.y = 0.11; g.add(b); const w = new T3.Mesh(new T3.BoxGeometry(0.42, 0.05, 0.175), new T3.MeshLambertMaterial({ color: 0x3a3530 })); w.position.y = 0.15; g.add(w); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; })();
local.add(BUS);
function booth(lon, lat) {
  const g = new T3.Group(), p = v3(lon, lat, LOCAL_TOP);
  const roof = new T3.Mesh(new T3.BoxGeometry(0.6, 0.04, 0.4), MAT.white); roof.position.y = 0.28; g.add(roof);
  const band = new T3.Mesh(new T3.BoxGeometry(0.61, 0.025, 0.41), MAT.red); band.position.y = 0.25; g.add(band);
  for (const x of [-0.27, 0.27]) for (const z of [-0.17, 0.17]) { const c = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 0.26, 6), MAT.white); c.position.set(x, 0.13, z); g.add(c); }
  const kiosk = new T3.Mesh(new T3.BoxGeometry(0.12, 0.16, 0.12), MAT.house); kiosk.position.set(0, 0.08, 0.2); g.add(kiosk);
  const arm = new T3.Mesh(new T3.BoxGeometry(0.02, 0.02, 0.32), MAT.red); arm.position.set(0.3, 0.08, 0); g.add(arm); g.userData.arm = arm;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.position.copy(p); g.scale.setScalar(0.7); local.add(g); return g;
}
const BOOTH1 = booth(-123.0632, 49.0021), BOOTH2 = booth(-122.757, 49.0021);
// Canadian visitors' cars queued at the Point Roberts crossing (shut beat)
const VISITORS = [0xc0442c, 0x2f3f5c, 0x6d9a5b, 0xd9a441, 0x7b5a8a, 0x2f3f5c].map(c => { const m = makeCar(c); local.add(m); return m; });
// the water pipe: a blue tube from a reservoir in Canada to the town
const RES = v3(-122.98, 49.09, LOCAL_TOP + 0.01);
const reservoir = new T3.Mesh(new T3.CylinderGeometry(1.1, 1.1, 0.05, 32), new T3.MeshLambertMaterial({ color: 0x5f9fb5 })); reservoir.position.copy(RES); local.add(reservoir);
const PIPE_C = new T3.CatmullRomCurve3([RES, v3(-123.0, 49.06, LOCAL_TOP + 0.05), v3(-123.04, 49.02, LOCAL_TOP + 0.05), v3(-123.055, 48.99, LOCAL_TOP + 0.05)]);
const PIPE = new T3.Mesh(new T3.TubeGeometry(PIPE_C, 120, 0.12, 10, false), new T3.MeshLambertMaterial({ color: 0x5fa8d3, emissive: 0x1d4a66, emissiveIntensity: 0.6 })); PIPE.castShadow = true; local.add(PIPE);
// main street: five shops with windows that go dark; five gas stations along the road
function shop(lon, lat, col, rot) {
  const g = new T3.Group(); const b = new T3.Mesh(new T3.BoxGeometry(0.32, 0.22, 0.24), MAT.house); b.position.y = 0.11; g.add(b);
  const aw = new T3.Mesh(new T3.BoxGeometry(0.34, 0.02, 0.1), new T3.MeshLambertMaterial({ color: col })); aw.position.set(0, 0.16, 0.15); aw.rotation.x = 0.4; g.add(aw);
  const win = new T3.Mesh(new T3.PlaneGeometry(0.24, 0.08), new T3.MeshBasicMaterial({ color: 0xffd98a })); win.position.set(0, 0.08, 0.121); g.add(win); g.userData.win = win;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.position.copy(v3(lon, lat, LOCAL_TOP)); g.rotation.y = rot; g.scale.setScalar(0.6); local.add(g); return g;
}
const SHOPS = [0xc0442c, 0x2f3f5c, 0xd9a441, 0x65733f, 0x7b5a8a].map((c, i) => shop(-123.072 + i * 0.003, 48.9862, c, 0));
const STATIONS = Array.from({ length: 5 }, (_, i) => { const g = new T3.Group(); const roof = new T3.Mesh(new T3.BoxGeometry(0.34, 0.03, 0.22), MAT.white); roof.position.y = 0.22; g.add(roof); const band = new T3.Mesh(new T3.BoxGeometry(0.345, 0.012, 0.225), MAT.red); band.position.y = 0.205; g.add(band); for (const x of [-0.08, 0.08]) { const p = new T3.Mesh(new T3.BoxGeometry(0.05, 0.12, 0.04), MAT.red); p.position.set(x, 0.06, 0); g.add(p); } for (const x of [-0.15, 0.15]) { const c = new T3.Mesh(new T3.CylinderGeometry(0.01, 0.01, 0.2, 6), MAT.white); c.position.set(x, 0.1, 0); g.add(c); } g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.position.copy(v3(-123.0645 + 0.0002 * i, 48.977 + i * 0.0026, LOCAL_TOP)); g.rotation.y = Math.PI / 2; g.scale.setScalar(0.65); local.add(g); return g; });
// the crowd at the grocery: 1,000 paper people (one per five shoppers)
const LOT = v3(-123.05, 48.9805, LOCAL_TOP);
const CROWD = (() => { const g = new T3.CapsuleGeometry(0.012, 0.03, 2, 6); g.translate(0, 0.03, 0); const m = new T3.InstancedMesh(g, new T3.MeshLambertMaterial({ color: 0xffffff }), 1000); m.castShadow = true; const cols = [0xc0442c, 0x2f3f5c, 0x6d9a5b, 0xd9a441, 0x7b5a8a, 0xf1e3c6]; for (let i = 0; i < 1000; i++) m.setColorAt(i, new T3.Color(cols[Math.floor(rnd(i, 5) * 6)])); local.add(m); return m; })();
const MARKET = (() => { const g = new T3.Group(); const b = new T3.Mesh(new T3.BoxGeometry(0.7, 0.2, 0.36), MAT.house); b.position.y = 0.1; g.add(b); const s = new T3.Mesh(new T3.BoxGeometry(0.72, 0.06, 0.37), new T3.MeshLambertMaterial({ color: 0x65733f })); s.position.y = 0.22; g.add(s); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.position.copy(LOT.clone().add(new T3.Vector3(0, 0, -0.32))); g.scale.setScalar(0.45); local.add(g); return g; })();
// tariff crates for the trade beat
const CRATES = Array.from({ length: 8 }, (_, i) => { const m = new T3.Mesh(new T3.BoxGeometry(0.2, 0.14, 0.14), MAT.crate); m.castShadow = true; m.receiveShadow = true; local.add(m); return m; });
// two bars for February sales, rising out of the ground
const BARS = [0x9fb36c, 0xc0442c].map((c, i) => { const m = new T3.Mesh(new T3.BoxGeometry(0.5, 1, 0.5), new T3.MeshLambertMaterial({ color: c })); m.castShadow = true; m.position.copy(v3(-123.072 + i * 0.006, 48.9935, LOCAL_TOP)); m.visible = false; local.add(m); return m; });

// ---------- the camera: one continuous flight, keyed to spoken words ----------
// each key: [time, target lon, lat, height above target (km), azimuth (deg, 0 = looking north), tilt (deg from vertical)]
let KEYS = null;
function keys() {
  return KEYS || (KEYS = [
    [0, -123.062, 48.994, 2.6, 8, 58],
    [at("hook/canada"), -123.064, 49.008, 3.4, 0, 56],
    [at("who/about"), -123.06, 48.99, 7.5, -10, 32],
    [at("treaty/in") + 0.1, -123.06, 48.99, 9, -10, 30],
    [at("treaty/britain"), -121.2, 48.6, 1800, 0, 18],
    [at("treaty/parallel") + 0.6, -121.2, 48.6, 1850, 0, 20],
    [at("coast/coast") + 0.3, -123.04, 49.0, 40, 0, 35],
    [at("survey/surveyors") - 0.05, -123.06, 48.995, 6.5, 20, 45],
    [at("survey/peninsula") + 0.5, -123.06, 48.992, 6.0, 30, 48],
    [at("drive/to") - 0.1, -122.92, 49.04, 30, 0, 30],
    [at("drive/twice") + 0.4, -122.92, 49.04, 31, 0, 32],
    [at("kids/kids") + 0.3, -122.98, 49.05, 16, -20, 50],
    [at("water/the"), -123.02, 49.04, 14, -40, 45],
    [at("water/nineteen"), -123.03, 49.035, 13, -55, 50],
    [at("shut/in"), -123.064, 49.0, 1.1, -70, 68],
    [at("shut/vanished") + 0.4, -123.064, 49.0, 1.0, -60, 70],
    [at("lost/the"), -123.066, 48.9855, 0.6, 10, 64],
    [at("lost/business") + 0.3, -123.066, 48.9855, 0.55, 25, 64],
    [at("grocery/the") + 0.1, -123.05, 48.979, 0.75, 0, 52],
    [at("grocery/about") + 0.6, -123.05, 48.979, 0.7, 10, 52],
    [at("gas/five"), -123.064, 48.981, 0.95, 80, 64],
    [at("gas/people") + 0.4, -123.064, 48.983, 0.9, 110, 64],
    [at("trade/in"), -123.063, 49.0021, 1.2, 0, 62],
    [at("trade/one") - 0.1, -123.069, 48.9925, 1.6, -15, 58],
    [at("trade/percent") + 0.4, -123.069, 48.9925, 1.5, -5, 58],
    [at("loopback/all") + 0.3, -121.2, 48.6, 1900, 0, 20],
    [at("loopback/which") - 0.2, -121.2, 48.6, 1900, 0, 20],
    [TL.duration, -123.062, 48.994, 2.6, 8, 58],
  ]);
}
function camAt(t) {
  const k = keys(); let i = 0; while (i < k.length - 2 && t >= k[i + 1][0]) i++;
  const a = k[i], b = k[i + 1], u = eio(pp(t, a[0], b[0] - a[0]));
  const lh = lerp(Math.log(a[3]), Math.log(b[3]), u), h = Math.exp(lh);
  const w = a[3] === b[3] ? u : clamp((h - a[3]) / (b[3] - a[3]));       // pan follows the zoom
  const lon = lerp(a[1], b[1], a[3] > b[3] ? Math.pow(u, 0.6) : w), lat = lerp(a[2], b[2], a[3] > b[3] ? Math.pow(u, 0.6) : w);
  return { lon, lat, h, az: lerp(a[4], b[4], u), tilt: lerp(a[5], b[5], u) };
}
function placeCamera(c, t) {
  const tgt = v3(c.lon, c.lat, c.h > 300 ? 6 : LOCAL_TOP), az = c.az * Math.PI / 180, tl = c.tilt * Math.PI / 180;
  const dist = c.h / Math.cos(tl), back = Math.sin(tl) * dist;
  CAM.position.set(tgt.x - Math.sin(az) * back + Math.sin(t * 0.4) * c.h * 0.01, tgt.y + c.h, tgt.z + Math.cos(az) * back);
  CAM.lookAt(tgt); CAM.updateProjectionMatrix();
  // the sun follows the view so its shadow map always covers what we see
  const r = Math.max(2, c.h * 1.6);
  SUN.position.set(tgt.x - r * 0.6, tgt.y + r * 1.2, tgt.z + r * 0.5); SUN.target.position.copy(tgt);
  const sc = SUN.shadow.camera; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 0.1; sc.far = r * 4; sc.updateProjectionMatrix();
  local.visible = c.h < 260; continent.visible = c.h >= 260;
  SC3.fog.near = c.h * 2.5; SC3.fog.far = c.h * 9;
  return tgt;
}
function screenOf(p) { const q = p.clone().project(CAM); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H, q.z < 1]; }

// ---------- per-frame state of every moving thing ----------
function pose(obj, curveC, k, lift = 0) { const p = curveC.getPointAt(clamp(k)), q = curveC.getTangentAt(clamp(k)); obj.position.set(p.x, p.y + lift, p.z); obj.rotation.set(0, Math.atan2(-q.z, q.x), 0); }
function update(t) {
  // the local's car: runs the one road north in the hook, then the full drive
  const tc = at("hook/canada");
  const tl = t > at("loopback/which") - 0.6 ? t - TL.duration : t;            // the ending re-enters the opening shot
  if (tl < at("drive/to") - 0.2) pose(CAR, ROAD_C, ((((tl + 1.2) * 0.17) % 1) + 1) % 1);
  else { const k = lerp(0.03, 0.985, eio(pp(t, at("drive/to") - 0.1, at("drive/twice") - at("drive/to") + 0.2))); pose(CAR, ROUTE_C, k); }
  CAR.scale.setScalar(tl !== t ? 1 : clamp(camAt(t).h / 4, 1, 7));
  routeGlow.visible = t > at("drive/to") - 0.2 && t < at("kids/kids");
  // barrier arms: lift when a vehicle is near
  for (const B of [BOOTH1, BOOTH2]) { const d = Math.min(B.position.distanceTo(CAR.position), B.position.distanceTo(BUS.position)); B.userData.arm.rotation.x = 0; B.userData.arm.rotation.z = d < 0.6 ? 1.3 : 0; }
  // the school bus, out to Blaine and back (kids beat)
  const k0 = at("kids/kids") - 0.2, k1 = at("kids/four") - 0.3, k2 = at("kids/day") + 0.2;
  BUS.visible = t > k0 - 0.1 && t < at("water/the") + 0.3;
  if (BUS.visible) { const k = t < k1 ? eio(pp(t, k0, k1 - k0)) : 1 - eio(pp(t, k1 + 0.1, k2 - k1 - 0.1)); pose(BUS, ROUTE_C, lerp(0.05, 0.97, k)); if (t > k1) BUS.rotation.y += Math.PI; }
  // visitors queue at the Point Roberts crossing, then back away and vanish
  const ts = at("shut/shut"), tg = at("shut/and"), tv = at("shut/vanished");
  VISITORS.forEach((m, i) => { const show = t > at("water/eightyseven") && t < tv + 0.4 + i * 0.1; m.visible = show; if (!show) return; const k = 0.085 - i * 0.012 + Math.max(0, Math.min(t, ts) - at("shut/in")) * 0.004 - Math.pow(Math.max(0, t - tg - i * 0.1), 2) * 0.02; pose(m, ROAD_C, clamp(k, 0.0, 0.3)); m.rotation.y += Math.PI; const s = 1 - pp(t, tv - 0.2 + i * 0.1, 0.25); m.scale.setScalar(Math.max(0.001, s)); });
  BOOTH1.userData.arm.rotation.z = t > ts - 0.1 && t < at("lost/the") ? 0 : BOOTH1.userData.arm.rotation.z;
  // main street: windows go dark one by one as the business drains
  const left = lerp(100, 18, eio(pp(t, at("lost/lost"), at("lost/business") + 0.4 - at("lost/lost"))));
  SHOPS.forEach((s, i) => { s.userData.win.material.color.set(left > 100 - (i + 1) * 20 + 1 || i === 4 ? 0xffd98a : 0x3a4048); });
  // the crowd: fills the lot, then 990 of 1,000 leave
  const tIn = at("grocery/five"), tOut = at("grocery/about");
  CROWD.visible = t > tIn - 0.4 && t < at("gas/five") + 0.2; let n = 0;
  if (CROWD.visible) for (let i = 0; i < 1000; i++) { const r = Math.floor(i / 40), c = i % 40, kIn = pp(t, tIn - 0.2 + (Math.abs(c - 20) + r) / 45 * 0.8, 0.2), keep = rnd(i, 77) < 0.01, kOut = keep ? 0 : pp(t, tOut + rnd(i, 78) * 0.45, 0.15), s = Math.max(0.001, spring(kIn) * (1 - kOut)) * (keep && t > tOut + 0.4 ? 1.6 : 1.0);
    D.position.set(LOT.x - 0.2 + c * 0.01 + (rnd(i, 1) - 0.5) * 0.004, LOT.y, LOT.z - 0.18 + r * 0.012 + (rnd(i, 2) - 0.5) * 0.004); D.rotation.set(0, 0, 0); D.scale.set(s, s, s); D.updateMatrix(); CROWD.setMatrixAt(i, D.matrix); if (s > 0.01) n++; }
  CROWD.instanceMatrix.needsUpdate = true;
  // gas stations rise one by one
  const t5 = [at("gas/five"), at("gas/gas"), at("gas/stations"), at("gas/stations") + 0.18, at("gas/stations") + 0.36];
  STATIONS.forEach((g, i) => { const k = spring(pp(t, t5[i] - 0.05, 0.55)); g.visible = t > at("gas/five") - 0.6 && t < at("trade/in") + 0.4; g.scale.set(1, Math.max(0.001, t > at("gas/five") - 0.6 ? k : 1), 1); });
  // tariff crates drop onto the line; bars rise for February
  const tt = at("trade/trade");
  CRATES.forEach((m, i) => { const k = pp(t, tt + i * 0.1, 0.45), side = i % 2 ? 1 : -1, base = v3(-123.0632 + (Math.floor(i / 2) - 1.5) * 0.004, BORDER_LAT + side * 0.0018, LOCAL_TOP + 0.07); m.visible = t > tt - 0.1 && t < at("loopback/all"); const y = k < 1 ? lerp(3, 0, k * k) : Math.abs(Math.sin((t - tt - i * 0.1 - 0.45) * 12)) * 0.05 * Math.exp(-(t - tt - i * 0.1 - 0.45) * 5); m.position.set(base.x, base.y + y, base.z); m.rotation.set(0, i * 0.7, (1 - Math.min(1, k)) * 2); });
  const tb = at("trade/one"), grow = eout(pp(t, tb + 0.2, 0.6)), drop = eio(pp(t, at("trade/fiftyfive") - 0.1, 0.5));
  BARS.forEach((m, i) => { const h = Math.max(0.001, grow * (i ? lerp(1, 0.45, drop) : 1) * 0.4); m.visible = t > tb && t < at("loopback/all"); m.scale.set(0.28, h, 0.28); m.position.y = LOCAL_TOP + h / 2; });
  LINE46.scale.x = Math.max(0.001, t < at("coast/nobody") ? eio(pp(t, at("treaty/the") - 0.05, at("treaty/parallel") + 0.5 - at("treaty/the"))) : 1);
  PIPE.visible = t > at("water/the") - 0.3 && t < at("shut/in") + 0.3; reservoir.visible = PIPE.visible;
  PIPE.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(t * 6);
  return { n };
}

// ---------- the frame ----------
let LAST = -1;
function draw3d(t0) {
  const t = Math.floor(t0 * 12 + 1e-6) / 12;                  // a paper miniature moves on twos, like stop-motion
  const c = camAt(t), tgt = placeCamera(c, t);
  if (LAST !== t) { update(t); R.render(SC3, CAM); LAST = t; }
  ctx.drawImage(GL, 0, 0);
  if (c.h < 260) for (const [y0, y1, a0, a1] of [[0, 640, 1, 0], [1180, H, 0, 1]]) {
    ctx.save(); const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(0,0,0,${a0})`); g.addColorStop(1, `rgba(0,0,0,${a1})`);
    ctx.beginPath(); ctx.rect(0, y0, W, y1 - y0); ctx.clip(); ctx.filter = "blur(7px)"; ctx.globalAlpha = 0.9; ctx.drawImage(GL, 0, y0, W, y1 - y0, 0, y0, W, y1 - y0); ctx.restore();
  }
  // a soft vignette and a hint of tilt-shift: blur bands at top and bottom
  const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,25,10,0.32)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  return c;
}
function pinTag(str, lon, lat, h, t, t0, o = {}) { const k = spring(pp(t, t0, 0.6)); if (k <= 0) return; const [x, y, ok] = screenOf(v3(lon, lat, h)); if (!ok) return; ctx.save(); ctx.translate(x, y - (o.up ?? 70)); ctx.scale(k, k); tag(str, 0, 0, Object.assign({ size: 36 }, o)); ctx.restore(); line(x, y, x, y - (o.up ?? 70) + 26, "rgba(43,35,32,0.7)", 3); }
function brand() { ctx.save(); ctx.translate(40, 248); ctx.fillStyle = P.ink; ctx.fillRect(0, -22, 236, 44); text("BORDER QUIRKS", 118, 10, { size: 26, font: "Elite", color: P.cream, ls: 2 }); ctx.restore(); }
function bigCard(x, y, w, h, k, draw) { if (k <= 0) return; ctx.save(); ctx.translate(x, y + (1 - k) * 60); ctx.scale(lerp(0.9, 1, k), lerp(0.9, 1, k)); ctx.globalAlpha = clamp(k * 3); cut(() => ctx.rect(-w / 2, -h / 2, w, h), P.card, { lw: 4, sx: 10, sy: 16, sb: 18 }); draw(w, h); ctx.restore(); }

CU.hook = (t, S) => { draw3d(t); brand(); pinTag("POINT ROBERTS, WA", -123.062, 48.985, LOCAL_TOP, t, -9, { size: 38 }); pinTag("CANADA", -123.07, 49.025, LOCAL_TOP, t, at("hook/canada") - 0.1, { size: 44, bg: "#f2c9bd" });
  const k = spring(pp(t, at("hook/road") - 0.05, 0.6)); bigCard(820, 470, 300, 210, k, () => { text("ROADS OUT", 0, -40, { size: 34, font: "Elite" }); text("1", 0, 80, { size: 130, color: P.red }); }); };
CU.who = (t, S) => { draw3d(t); brand(); const t1 = at("who/twelve"), t5 = at("who/five");
  bigCard(W / 2, 400, 760, 230, spring(pp(t, t1 - 0.1, 0.6)), (w, h) => { text("2020 CENSUS", 0, -h / 2 + 46, { size: 30, font: "Elite" }); text(fmt(Math.round(1191 * eout(pp(t, t1, 1)))), -150, 70, { size: 110, color: P.red }); text("PEOPLE", -150, 100, { size: 24, font: "Elite" }); if (t > t5) { text("5", 200, 70, { size: 110, color: P.red }); text("SQ MILES", 200, 100, { size: 24, font: "Elite" }); } }); };
CU.treaty = (t, S) => { const c = draw3d(t); brand(); stamp("1846", 260, 520, t - at("treaty/eighteen"), { size: 120, rot: -0.1 });
  if (c.h > 260) { pinTag("BRITAIN", -122, 51.5, 6, t, at("treaty/britain") - 0.05, { size: 44, up: 20 }); pinTag("UNITED STATES", -120.5, 46.5, 6, t, at("treaty/america") - 0.05, { size: 44, up: 20 }); pinTag("49°N", -116, 49, 6, t, at("treaty/fortyninth") - 0.05, { size: 40, bg: P.yellow, up: 60 }); } };
CU.coast = (t, S) => { draw3d(t); brand(); stamp("SIGNED", 760, 420, t - at("coast/nobody"), { size: 110, rot: 0.1 });
  const k = pp(t, at("coast/coast"), 0.4); if (k > 0) { const [x, y] = screenOf(v3(-123.06, 48.99, LOCAL_TOP)); ctx.save(); ctx.globalAlpha = 1 - k * 0.5; ctx.strokeStyle = P.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, 80 + 40 * k, 0, 7); ctx.stroke(); ctx.restore(); text("?", x + 120, y - 60, { size: 150, color: P.red, stroke: 14 }); } };
CU.survey = (t, S) => { draw3d(t); brand(); const tc = at("survey/cut");
  stamp("CUT OFF", W / 2, 520, t - tc, { size: 120, rot: -0.08 }); pinTag("POINT ROBERTS · USA", -123.062, 48.985, LOCAL_TOP, t, at("survey/peninsula") - 0.1, { size: 40, bg: P.yellow }); pinTag("CANADA", -123.07, 49.02, LOCAL_TOP, t, tc + 0.2, { size: 40 }); };
CU.drive = (t, S) => { draw3d(t); brand(); const t1 = at("drive/cross"), t2 = at("drive/twice"), k = lerp(0.03, 0.985, eio(pp(t, S.t0 - 0.1, t2 - S.t0 + 0.15)));
  pinTag("CROSSING 1", -123.0632, 49.0021, LOCAL_TOP, t, t1 - 0.1, { size: 34, bg: "#f2c9bd" }); pinTag("CROSSING 2", -122.757, 49.0021, LOCAL_TOP, t, t2 - 0.1, { size: 34, bg: "#f2c9bd" });
  const inC = clamp((k - 0.04) / 0.9); bigCard(W / 2, 400, 520, 200, spring(pp(t, S.t0, 0.6)), (w, h) => { text("MILES IN CANADA", 0, -h / 2 + 46, { size: 30, font: "Elite" }); text(String(Math.round(25 * inC)), 0, 80, { size: 120, color: P.red }); }); };
CU.kids = (t, S) => { draw3d(t); brand(); const k0 = at("kids/kids") - 0.2;
  if (!S.cross) { S.cross = [at("kids/kids") + 0.1, at("kids/canada") + 0.1, at("kids/crossings") + 0.2, at("kids/day")]; }
  const n = S.cross.filter(c => t >= c).length; bigCard(W / 2, 420, 620, 230, spring(pp(t, S.t0, 0.6)), (w, h) => { text("BORDER CROSSINGS · ONE SCHOOL DAY", 0, -h / 2 + 46, { size: 24, font: "Elite" }); for (let i = 0; i < 4; i++) { const x = -195 + i * 130; ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, 40, 46, 0, 7); ctx.stroke(); if (i < n) stamp(String(i + 1), x, 40, t - S.cross[i], { size: 70, rot: -0.1 }); } });
  const [x, y, ok] = screenOf(BUS.position.clone().add(new T3.Vector3(0, 0.3, 0))); if (ok && BUS.visible) tag("SCHOOL BUS", x, y, { size: 30, bg: P.yellow }); };
CU.water = (t, S) => { draw3d(t); brand(); pinTag("RESERVOIR · CANADA", -122.98, 49.09, LOCAL_TOP, t, at("water/canadian") - 0.1, { size: 34, bg: "#cfe6f2" }); pinTag("TAPS · POINT ROBERTS", -123.058, 48.988, LOCAL_TOP, t, at("water/the") + 0.2, { size: 34 });
  bigCard(W / 2, 420, 640, 220, spring(pp(t, at("water/under") - 0.15, 0.6)), (w, h) => { text("WATER SUPPLY AGREEMENT", 0, -h / 2 + 50, { size: 28, font: "Elite" }); text("Greater Vancouver Water District", 0, -h / 2 + 92, { size: 22, font: "Elite" }); stamp("1987", 0, 60, t - at("water/eightyseven") + 0.1, { size: 90, rot: -0.1 }); }); };
CU.shut = (t, S) => { draw3d(t); brand(); const ts = at("shut/shut");
  const ck = spring(pp(t, at("shut/twenty") - 0.05, 0.6)); bigCard(230, 420, 260, 220, ck, (w, h) => { ctx.fillStyle = P.red; ctx.fillRect(-w / 2, -h / 2, w, 56); text("2020", 0, 70, { size: 96 }); });
  stamp("BORDER CLOSED", 620, 560, t - ts, { size: 92, rot: -0.08 }); pinTag("CANADIAN SHOPPERS", -123.064, 49.006, LOCAL_TOP, t, S.t0 + 0.3, { size: 32, bg: "#f2c9bd" }); };
CU.lost = (t, S) => { draw3d(t); brand(); const t0 = at("lost/lost"), left = lerp(100, 18, eio(pp(t, t0, at("lost/business") + 0.4 - t0)));
  bigCard(W / 2, 420, 760, 240, spring(pp(t, S.t0, 0.6)), (w, h) => { text("TOWN BUSINESS · 2020", 0, -h / 2 + 46, { size: 30, font: "Elite" }); const bw = 520; ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.strokeRect(-bw / 2 - 60, -10, bw, 60); ctx.fillStyle = left > 40 ? P.green : P.red; ctx.fillRect(-bw / 2 - 56, -6, (bw - 8) * left / 100, 52); text(Math.round(left) + "%", bw / 2 + 10, 40, { size: 48, align: "left" }); text(S.p.label || "Border Policy Research Institute estimate", 0, h / 2 - 22, { size: 20, font: "Elite" }); });
  stamp("−80%+", 820, 700, t - at("lost/eighty"), { size: 100, rot: -0.1 }); };
CU.grocery = (t, S) => { draw3d(t); brand(); const tIn = at("grocery/five"), tOut = at("grocery/about"); const n = t < tOut ? Math.round(5000 * eout(pp(t, tIn - 0.1, 0.9))) : Math.round(lerp(5000, 50, eout(pp(t, tOut, 0.5))));
  bigCard(W / 2, 400, 600, 230, spring(pp(t, tIn - 0.2, 0.6)), (w, h) => { text("GROCERY SHOPPERS A DAY", 0, -h / 2 + 46, { size: 28, font: "Elite" }); text(fmt(n), 0, 70, { size: 110, color: P.red }); text(t < tOut ? "at its peak · 1 figure = 5 shoppers" : "during the 2020 closure", 0, h / 2 - 18, { size: 22, font: "Elite" }); }); };
CU.gas = (t, S) => { draw3d(t); brand(); const tf = at("gas/fewer");
  bigCard(W / 2, 420, 600, 230, spring(pp(t, tf - 0.1, 0.6)), (w, h) => { text("PEOPLE IN TOWN · 2020", 0, -h / 2 + 46, { size: 28, font: "Elite" }); text("< 1,000", 0, 70, { size: 110, color: P.red }); text("five gas stations", 0, h / 2 - 18, { size: 22, font: "Elite" }); });
  STATIONS.forEach((g, i) => { if (t > at("gas/five") + i * 0.2) { const [x, y, ok] = screenOf(g.position.clone().add(new T3.Vector3(0, 0.4, 0))); if (ok) tag(String(i + 1), x, y, { size: 34, bg: P.yellow, rot: 0 }); } }); };
CU.trade = (t, S) => { draw3d(t); brand(); const tb = at("trade/one");
  const ck = spring(pp(t, at("trade/twenty") - 0.05, 0.6)); bigCard(230, 420, 260, 220, ck, (w, h) => { ctx.fillStyle = P.red; ctx.fillRect(-w / 2, -h / 2, w, 56); text("2025", 0, 70, { size: 96 }); });
  stamp("TRADE WAR", 640, 560, t - at("trade/war"), { size: 100, rot: -0.07 });
  CRATES.forEach((m, i) => { if (m.visible && t > at("trade/trade") + i * 0.1 + 0.4 && i < 4) { const [x, y, ok] = screenOf(m.position.clone().add(new T3.Vector3(0, 0.2, 0))); if (ok) tag("TARIFF", x, y, { size: 26 }); } });
  if (t > tb) { BARS.forEach((m, i) => { const [x, y, ok] = screenOf(m.position.clone().add(new T3.Vector3(0, m.scale.y / 2 + 0.05, 0))); if (ok) tag(i ? "FEB 2025" : "FEB 2024", x, y - 20, { size: 30 }); }); stamp("−55%", 800, 720, t - at("trade/fiftyfive"), { size: 110, rot: -0.1 }); popTagB(S.p.label || "one business owner's reported figure", W / 2, 1180, t, at("trade/owner")); } };
function popTagB(str, x, y, t, a) { const k = spring(pp(t, a, 0.6)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); tag(str, 0, 0, { size: 28 }); ctx.restore(); }
CU.loop = (t, S) => { const c = draw3d(t); brand(); if (t > TL.duration - 0.7) pinTag("POINT ROBERTS, WA", -123.062, 48.985, LOCAL_TOP, t, TL.duration - 0.7, { size: 38 }); if (c.h > 260) pinTag("ONE STRAIGHT LINE · 1846", -119, 49, 6, t, at("loopback/one") - 0.1, { size: 40, bg: P.yellow, up: 60 }); };

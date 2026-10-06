// Flight kit (method B, "3D paper miniature" map flights): real geography extruded into paper slabs, lit by a low
// sun with soft shadows, filmed by one camera that flies between keyframes. Load with "kits": ["flight"]
// (render.mjs adds Three.js r159, MIT). WebGL runs on SwiftShader; the 3D world moves on twos (12 fps).
//
//   const F = makeFlight({
//     origin: [lon, lat],                         // km grid origin (put it near the story)
//     near: "s_map", far: "s_world",              // GEO scene ids: detailed (OSM coast) and far (Natural Earth); far optional
//     colors: { US: 0xe39a4f, default: 0xe2cfa2 }, // fill by ISO code
//     switchKm: 260,                              // above this camera height the far layer shows instead of the near one
//     trees: { iso: ["CA"], n: 2000, scale: 1.1 },  // optional scattered paper pines on land
//     lines: [{ pts: [[lon, lat], ...], color: 0xc0442c, width: 0.12, from: t0, to: t1, height: 0.1 }],  // draw-on ribbons
//     keys: [[t, lon, lat, heightKm, azimuthDeg, tiltDeg], ...],  // the camera path; zoom eases in log space
//   });
//   F.draw(t)   -> draws the frame into ctx;  F.project(lon, lat, hKm) -> [x, y, visible];  F.cam(t) -> camera state
"use strict";
function makeFlight(o) {
  const T3 = window.THREE;
  const [LON0, LAT0] = o.origin, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 110.57;
  const km = (lon, lat) => [(lon - LON0) * KX, (lat - LAT0) * KY];
  const v3 = (lon, lat, h = 0) => { const [x, n] = km(lon, lat); return new T3.Vector3(x, h, -n); };
  const SLAB = o.slab ?? 0.25, TOP = SLAB + 0.02;
  const GL = document.createElement("canvas"); GL.width = W; GL.height = H;
  const R = new T3.WebGLRenderer({ canvas: GL, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  R.setPixelRatio(1); R.setSize(W, H, false); R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; R.outputColorSpace = T3.SRGBColorSpace;
  const scene = new T3.Scene(); const skyCol = o.sky ?? 0xe9dcc0; scene.background = new T3.Color(skyCol); scene.fog = new T3.Fog(skyCol, 60, 400);
  const cam = new T3.PerspectiveCamera(o.fov ?? 30, W / H, 0.01, 60000);
  scene.add(new T3.HemisphereLight(0xfff4dc, 0x7d6a50, 1.25));
  const sun = new T3.DirectionalLight(0xfff0d0, 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun); scene.add(sun.target);
  const hex = n => "#" + n.toString(16).padStart(6, "0");
  function paperMat(col, rep) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); g.fillStyle = hex(col); g.fillRect(0, 0, 256, 256);
    const img = g.getImageData(0, 0, 256, 256), d = img.data; for (let i = 0; i < 65536; i++) { const v = (rnd(i, 3, 17) - 0.5) * 14; d[i * 4] += v; d[i * 4 + 1] += v; d[i * 4 + 2] += v; } g.putImageData(img, 0, 0);
    const tx = new T3.CanvasTexture(c); tx.wrapS = tx.wrapT = T3.RepeatWrapping; tx.repeat.set(rep, rep); tx.colorSpace = T3.SRGBColorSpace; return new T3.MeshLambertMaterial({ map: tx });
  }
  const side = new T3.MeshLambertMaterial({ color: o.side ?? 0xcab486 });
  const fillOf = iso => (o.colors && (o.colors[iso] ?? o.colors.default)) ?? 0xe2cfa2;
  const mats = {}; const matFor = (iso, rep) => mats[iso + rep] || (mats[iso + rep] = paperMat(fillOf(iso), rep));
  function shapes(polys) {
    const out = [];
    for (const poly of polys) { const ring = poly[0]; if (ring.length < 4) continue; const sh = new T3.Shape(ring.map(([lo, la]) => new T3.Vector2(...km(lo, la)))); for (const h of poly.slice(1)) if (h.length > 3) sh.holes.push(new T3.Path(h.map(([lo, la]) => new T3.Vector2(...km(lo, la))))); out.push(sh); }
    return out;
  }
  function slab(polys, mat, depth, y0, bevel = true) {
    const g = new T3.ExtrudeGeometry(shapes(polys), { depth, bevelEnabled: bevel, bevelThickness: depth * 0.25, bevelSize: depth * 0.25, bevelSegments: 1, curveSegments: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); const m = new T3.Mesh(g, [mat, side]); m.castShadow = bevel; m.receiveShadow = true; return m;
  }
  const near = new T3.Group(), far = new T3.Group(); scene.add(near); scene.add(far);
  const seaMat = paperMat(o.sea ?? 0x8fb0aa, 0.02);
  if (o.near && GEO[o.near]) { for (const L of GEO[o.near].layers) near.add(slab(L.polys, matFor(L.iso, 0.06), SLAB, 0)); const sea = new T3.Mesh(new T3.PlaneGeometry(4000, 4000), seaMat); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; near.add(sea); }
  if (o.far && GEO[o.far]) { for (const L of GEO[o.far].layers) far.add(slab(L.polys, matFor(L.iso, 0.002), o.farSlab ?? 6, -0.2, false)); const oc = new T3.Mesh(new T3.PlaneGeometry(40000, 40000), seaMat); oc.rotation.x = -Math.PI / 2; oc.position.y = -0.4; far.add(oc); }
  // scattered paper pines (deterministic), on the land of the listed countries
  if (o.trees && o.near && GEO[o.near]) {
    const c2 = document.createElement("canvas").getContext("2d"), P = new Path2D();
    for (const L of GEO[o.near].layers) if (!o.trees.iso || o.trees.iso.includes(L.iso)) for (const poly of L.polys) for (const ring of poly) { ring.forEach(([lo, la], j) => { const [x, n] = km(lo, la); j ? P.lineTo(x, n) : P.moveTo(x, n); }); P.closePath(); }
    const parts = []; const tr = new T3.CylinderGeometry(0.012, 0.016, 0.05, 6); tr.translate(0, 0.025, 0); parts.push(tr);
    for (let i = 0; i < 3; i++) { const c = new T3.ConeGeometry(0.075 - i * 0.017, 0.09, 7); c.translate(0, 0.07 + i * 0.05, 0); parts.push(c); }
    let n = 0; parts.forEach(g => { n += g.toNonIndexed().attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let off = 0; parts.forEach(g0 => { const g = g0.toNonIndexed(); pos.set(g.attributes.position.array, off * 3); nor.set(g.attributes.normal.array, off * 3); off += g.attributes.position.count; });
    const geo = new T3.BufferGeometry(); geo.setAttribute("position", new T3.BufferAttribute(pos, 3)); geo.setAttribute("normal", new T3.BufferAttribute(nor, 3));
    const N = o.trees.n ?? 1500, im = new T3.InstancedMesh(geo, new T3.MeshLambertMaterial({ color: o.trees.color ?? 0x5b7048 }), N); im.castShadow = true; im.receiveShadow = true;
    const D = new T3.Object3D(), span = o.trees.span ?? [60, 40]; let k = 0;
    for (let i = 0; i < N * 8 && k < N; i++) { const x = (rnd(i, 31, 1) - 0.5) * span[0], nn = (rnd(i, 31, 2) - 0.5) * span[1]; if (!c2.isPointInPath(P, x, nn, "evenodd")) continue; const s = (o.trees.scale ?? 1) * (0.7 + rnd(i, 31, 3) * 0.6); D.position.set(x, TOP - 0.02, -nn); D.rotation.set(0, rnd(i, 31, 4) * 6.28, 0); D.scale.set(s, s, s); D.updateMatrix(); im.setMatrixAt(k++, D.matrix); }
    im.count = k; near.add(im);
  }
  // ribbons that draw on: lines of the story (borders, routes), raised a little above the paper
  const lines = (o.lines || []).map(L => {
    const pts = L.pts.map(([lo, la]) => v3(lo, la, (L.layer === "far" ? (o.farSlab ?? 6) + 0.3 : TOP) + (L.height ?? 0.08)));
    const curve = new T3.CatmullRomCurve3(pts, false, "centripetal", L.smooth ?? 0.0);
    const mesh = new T3.Mesh(new T3.TubeGeometry(curve, Math.max(64, pts.length * 8), L.width ?? 0.06, 6, false), new T3.MeshLambertMaterial({ color: L.color ?? 0xc0442c, emissive: L.color ?? 0xc0442c, emissiveIntensity: 0.25 }));
    mesh.castShadow = true; (L.layer === "far" ? far : near).add(mesh);
    const total = mesh.geometry.index ? mesh.geometry.index.count : mesh.geometry.attributes.position.count;
    return { L, mesh, total };
  });
  const props = new T3.Group(); near.add(props);
  // camera: keys [t, lon, lat, hKm, azDeg, tiltDeg]; zoom eases in log space, the pan follows the zoom
  const K = o.keys;
  function camAt(t) {
    let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1] || a, u = eio(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
    const h = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), w = a[3] === b[3] ? u : clamp((h - a[3]) / (b[3] - a[3]));
    const pu = a[3] > b[3] ? Math.pow(u, 0.6) : w;
    return { lon: lerp(a[1], b[1], pu), lat: lerp(a[2], b[2], pu), h, az: lerp(a[4], b[4], u), tilt: lerp(a[5], b[5], u) };
  }
  function place(c, t) {
    const sw = o.switchKm ?? 260, tgt = v3(c.lon, c.lat, c.h > sw ? (o.farSlab ?? 6) : TOP), az = c.az * Math.PI / 180, tl = c.tilt * Math.PI / 180;
    const dist = c.h / Math.cos(tl), back = Math.sin(tl) * dist;
    cam.position.set(tgt.x - Math.sin(az) * back + Math.sin(t * 0.4) * c.h * 0.01, tgt.y + c.h, tgt.z + Math.cos(az) * back); cam.lookAt(tgt); cam.updateProjectionMatrix();
    const r = Math.max(2, c.h * 1.6); sun.position.set(tgt.x - r * 0.6, tgt.y + r * 1.2, tgt.z + r * 0.5); sun.target.position.copy(tgt);
    const sc = sun.shadow.camera; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 0.1; sc.far = r * 4; sc.updateProjectionMatrix();
    near.visible = c.h < sw || !o.far; far.visible = !!o.far && c.h >= sw; scene.fog.near = c.h * 2.5; scene.fog.far = c.h * 9;
  }
  let last = null;
  function draw(t0, opt = {}) {
    const t = Math.floor(t0 * 12 + 1e-6) / 12, c = camAt(t);
    if (last !== t) {
      place(c, t);
      for (const { L, mesh, total } of lines) { const k = L.from == null ? 1 : clamp((t - L.from) / Math.max(0.01, (L.to ?? L.from + 1) - L.from)); mesh.visible = k > 0 && (L.until == null || t < L.until); mesh.geometry.setDrawRange(0, Math.floor(total * eio(k) / 3) * 3); }
      if (o.update) o.update(t, { v3, props, T3, scene, TOP });
      R.render(scene, cam); last = t;
    }
    ctx.drawImage(GL, 0, 0);
    if ((opt.tilt ?? o.tiltShift ?? true) && c.h < (o.switchKm ?? 260)) for (const [y0, y1] of [[0, 600], [1200, H]]) { ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, y1 - y0); ctx.clip(); ctx.filter = "blur(6px)"; ctx.globalAlpha = 0.85; ctx.drawImage(GL, 0, y0, W, y1 - y0, 0, y0, W, y1 - y0); ctx.restore(); }
    const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,25,10,0.3)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    return c;
  }
  function project(lon, lat, h) { const p = v3(lon, lat, h ?? TOP).project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z < 1 && Math.abs(p.x) < 1.2 && Math.abs(p.y) < 1.2]; }
  return { draw, project, cam: camAt, v3, km, T3, TOP, props, scene };
}
// a typewriter tag on a pin, pinned to a 3D position
function flightPin(F, str, lon, lat, t, t0, o = {}) {
  const k = clamp((t - t0) / 0.5); if (k <= 0) return;
  const kk = k >= 1 ? 1 : 1 - Math.exp(-5.5 * k) * Math.cos(4.2 * Math.PI * k);
  const [x, y, ok] = F.project(lon, lat, o.h); if (!ok) return; const up = o.up ?? 70;
  line(x, y, x, y - up + 26, "rgba(43,35,32,0.75)", 3); ctx.fillStyle = "#2b2320"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(x, y - up); ctx.scale(kk, kk); tag(str, 0, 0, Object.assign({ size: 36 }, o)); ctx.restore();
}

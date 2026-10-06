"""Map data for an episode's map scenes: storyboard.json -> build/geo.json.

    python3 studio/tools/geo.py <episode-dir>

For every map_focus / map_route scene, and every custom scene that has params.region:
- base layer: Natural Earth 1:10m admin-0 countries (public domain), clipped to the scene's region
  (padded) and simplified to screen resolution. Cached in ~/.cache/studio/.
- optional coast: params.coast = "osm" swaps the Natural Earth shapes inside the view for OpenStreetMap's
  coastline and national border (Overpass, cached), each land piece keeping its Natural Earth country. Use it
  when 1:10m is too coarse (a town-sized exclave). ODbL, credited like the detail layer.
- optional detail layer: params.detail = [{"osm": "<place name>", "iso": "BE"}, ...] fetches that
  place's administrative boundary from OpenStreetMap (Nominatim, cached, 1 request/s) and draws it on
  top in that country's colour. Use it when the story lives below country scale (enclaves, villages).
  OSM data is ODbL: the engine prints "© OpenStreetMap contributors" on any scene that uses it.
params.region is [west, south, east, north] in degrees, or an ISO-3166 alpha-2 code.

For every map_history scene (borders that change between dated snapshots; params.focus is the region):
  snapshots: [{"date": "1846-08-22", "at": "<cue>", "approximate": false, "territories": [
      {"key": "MX", "name": "MEXICO", "color": "green",
       "relation": 2841222     # an OpenHistoricalMap relation id, or
       "ohm_name": "Mexico"    # the OHM admin_level=2 relation of that name valid on the snapshot date, or
       "iso": ["MX"]           # Natural Earth units merged into one shape (marked approximate)
      }]}]
  Geometry comes from OpenHistoricalMap through its Overpass API (out geom), one request at a time, cached in
  ~/.cache/studio/, backoff on 429/5xx. OHM data is CC0 unless a relation carries its own license tag: every
  relation's tags are recorded in build/geo.json under "ohm_licenses", and any licence other than CC0 lands in
  "ohm_non_cc0" for the research gate to see. Territories with the same key in consecutive snapshots are morphed
  (rings resampled and aligned here, so the engine only interpolates).
Needs: pip install shapely
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

from shapely.geometry import LineString, Polygon, box, mapping, shape
from shapely.ops import polygonize, unary_union

CACHE = os.path.expanduser("~/.cache/studio")
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"
NE = os.path.join(CACHE, "ne_10m_admin_0_countries.geojson")
UA = "studio-engine/1.0 (explainer video maps; contact via repository owner)"
MAP_TYPES = ("map_focus", "map_route", "map_history")
OHM_URL = "https://overpass-api.openhistoricalmap.org/api/interpreter"
MORPH_N = 240   # points per morphing ring
os.makedirs(CACHE, exist_ok=True)


def natural_earth():
    if not os.path.exists(NE):
        print("downloading Natural Earth 1:10m countries (13 MB, once)")
        urllib.request.urlretrieve(NE_URL, NE)
    out = {}
    for f in json.load(open(NE))["features"]:
        p = f["properties"]
        iso = p["ISO_A2_EH"] if p.get("ISO_A2_EH") not in (None, "-99") else p.get("ISO_A2")
        if iso in (None, "-99"):
            iso = p["ADM0_A3"]
        g = shape(f["geometry"])
        if iso not in out or g.area > out[iso]["geom"].area:   # several features can share a code (AU: Ashmore and Cartier Islands)
            out[iso] = {"name": p["NAME"], "geom": g}
    return out


def osm_boundary(query):
    fn = os.path.join(CACHE, "osm_" + "".join(c if c.isalnum() else "_" for c in query) + ".json")
    if not os.path.exists(fn):
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": query, "format": "json", "polygon_geojson": 1, "limit": 5})
        for attempt in range(5):
            time.sleep(1.1 * 2 ** attempt)  # Nominatim usage policy: at most 1 request/s; back off on 429
            try:
                data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60))
                break
            except urllib.error.HTTPError as e:
                if e.code != 429 or attempt == 4:
                    raise
        hit = next((r for r in data if r.get("type") == "administrative" and r["geojson"]["type"].endswith("Polygon")), None)
        if hit is None:
            sys.exit(f"OSM: no administrative boundary found for '{query}'")
        json.dump({"osm": f"{hit['osm_type']}/{hit['osm_id']}", "name": hit["display_name"], "geojson": hit["geojson"]}, open(fn, "w"))
    return json.load(open(fn))


def rings(geom):
    """shapely (Multi)Polygon -> [[ [ [lon,lat],... ] outer, holes... ], ...] rounded to 5 decimals (~1 m)."""
    polys = [geom] if geom.geom_type == "Polygon" else [g for g in getattr(geom, "geoms", []) if g.geom_type == "Polygon"]
    out = []
    for p in polys:
        if p.is_empty:
            continue
        rr = [p.exterior] + list(p.interiors)
        out.append([[[round(x, 5), round(y, 5)] for x, y in r.coords] for r in rr])
    return out


OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]


def osm_coast(view, countries):
    """Land inside `view` from OSM coastlines + admin_level=2 borders: {iso: shapely geometry}."""
    w, s, e, n = view.bounds
    key = f"osmcoast_{w:.3f}_{s:.3f}_{e:.3f}_{n:.3f}".replace("-", "m")
    fn = os.path.join(CACHE, key + ".json")
    if not os.path.exists(fn):
        bb = f"({s},{w},{n},{e})"   # border ways come from the national relations: not every member way is tagged itself
        ql = (f'[out:json][timeout:120];rel["boundary"="administrative"]["admin_level"="2"]{bb}->.r;way(r.r){bb}->.b;'
              f'(way["natural"="coastline"]{bb};.b;);out geom;')
        data = None
        for url in OVERPASS[1:] + OVERPASS[:1]:                       # public mirrors are often busy: try each, once
            try:
                req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": ql}).encode(), headers={"User-Agent": UA})
                data = json.load(urllib.request.urlopen(req, timeout=180))
                break
            except Exception as ex:                # noqa: BLE001 (HTML error pages, timeouts, 5xx)
                print(f"overpass {url}: {ex}; trying the next mirror")
        if data is None:
            sys.exit("Overpass: every mirror failed; retry later")
        json.dump(data, open(fn, "w"))
    data = json.load(open(fn))
    coast = [LineString([(g["lon"], g["lat"]) for g in el["geometry"]]) for el in data["elements"] if el.get("tags", {}).get("natural") == "coastline"]
    border = [LineString([(g["lon"], g["lat"]) for g in el["geometry"]]) for el in data["elements"] if el.get("tags", {}).get("natural") != "coastline"]
    if not coast:
        return {}
    faces = list(polygonize(unary_union(coast + border + [view.exterior])))
    land = {}
    for f in faces:
        f = f.intersection(view)
        if f.is_empty or f.area == 0:
            continue
        rp = f.representative_point()
        near = min(coast, key=lambda c: c.distance(rp))  # OSM coastlines run with the land on their left
        d = near.project(rp)
        a, b = near.interpolate(max(0, d - 1e-5)), near.interpolate(min(near.length, d + 1e-5))
        if (b.x - a.x) * (rp.y - a.y) - (b.y - a.y) * (rp.x - a.x) <= 0:
            continue
        iso = min(countries, key=lambda k: countries[k]["geom"].distance(rp))
        land.setdefault(iso, []).append(f)
    return {iso: unary_union(fs) for iso, fs in land.items()}


# ---------------- OpenHistoricalMap ----------------
_last_ohm = [0.0]


def ohm_query(ql, cache_key):
    """One Overpass request at a time (>= 1.5 s apart), cached on disk, exponential backoff on 429/5xx."""
    fn = os.path.join(CACHE, "ohm_" + cache_key + ".json")
    if os.path.exists(fn):
        return json.load(open(fn))
    body = urllib.parse.urlencode({"data": ql}).encode()
    for attempt in range(6):
        time.sleep(max(0.0, _last_ohm[0] + 1.5 * 2 ** attempt - time.time()))
        try:
            req = urllib.request.Request(OHM_URL, data=body, headers={"User-Agent": UA})
            data = json.load(urllib.request.urlopen(req, timeout=150))
            _last_ohm[0] = time.time()
            json.dump(data, open(fn, "w"))
            return data
        except urllib.error.HTTPError as e:
            _last_ohm[0] = time.time()
            if e.code not in (429, 502, 503, 504) or attempt == 5:
                raise
        except (urllib.error.URLError, TimeoutError):
            _last_ohm[0] = time.time()
            if attempt == 5:
                raise
    sys.exit("OHM: gave up")


def _pad_date(d, end=False):
    """OHM dates can be '1849', '1823-07' or '1848-02-02': pad to a sortable YYYY-MM-DD (BCE dates sort first)."""
    if not d:
        return "9999-12-31" if end else "0000-01-01"
    if d.startswith("-"):
        return "0000-01-01"
    parts = d.split("-")
    parts += ["01"] * (3 - len(parts))
    return "-".join(parts[:3])


def ohm_resolve(name, date, admin_level="2"):
    """The admin_level relation named `name` (name:en or name) that is valid on `date` (start <= date < end)."""
    safe = "".join(c if c.isalnum() else "_" for c in name)
    ql = ('[out:json][timeout:90];(relation["boundary"="administrative"]["admin_level"="%s"]["name:en"="%s"];'
          'relation["boundary"="administrative"]["admin_level"="%s"]["name"="%s"];);out tags;' % (admin_level, name, admin_level, name))
    els = ohm_query(ql, f"q_{admin_level}_{safe}")["elements"]
    d = _pad_date(date)
    hits = [e for e in els if _pad_date(e["tags"].get("start_date")) <= d < _pad_date(e["tags"].get("end_date"), True)]
    if not hits:
        sys.exit(f"OHM: no admin_level={admin_level} relation named '{name}' valid on {date} "
                 f"(candidates: {sorted((e['tags'].get('start_date') or '', e['tags'].get('end_date') or '', e['id']) for e in els)[:12]})")
    hits.sort(key=lambda e: _pad_date(e["tags"].get("start_date")))
    return hits[-1]["id"]


def ohm_relation(rid):
    """(shapely geometry, tags) for one OHM relation: outer ways assembled into polygons, inner ways cut out."""
    el = ohm_query("[out:json][timeout:120];relation(%d);out geom;" % rid, f"rel_{rid}")["elements"]
    if not el:
        sys.exit(f"OHM: relation {rid} not found")
    el = el[0]
    outer, inner = [], []
    for m in el.get("members", []):
        if m["type"] != "way" or not m.get("geometry"):
            continue
        ln = LineString([(p["lon"], p["lat"]) for p in m["geometry"]])
        (inner if m.get("role") == "inner" else outer).append(ln)
    faces = list(polygonize(unary_union(outer))) if outer else []
    if not faces:
        sys.exit(f"OHM: relation {rid}: outer ways do not close into a polygon")
    g = unary_union(faces)
    if inner:
        holes = list(polygonize(unary_union(inner)))
        if holes:
            g = g.difference(unary_union(holes))
    if not g.is_valid:
        g = g.buffer(0)
    return g, el["tags"]


def ohm_license(rid, tags):
    lic = tags.get("license")
    ok = lic is None or lic.strip().upper().replace("_", "-").startswith("CC0")
    return {"relation": rid, "name": tags.get("name:en") or tags.get("name"), "start_date": tags.get("start_date"),
            "end_date": tags.get("end_date"), "license": lic or "none recorded (OHM default: CC0)", "cc0": ok}


def polys_of(g):
    return [g] if g.geom_type == "Polygon" else [x for x in getattr(g, "geoms", []) if x.geom_type == "Polygon" and not x.is_empty]


def ring_pts(ring, n):
    """Resample a closed ring to n points evenly by length, counter-clockwise, from its westernmost (then northernmost) point."""
    pts = list(ring.coords)[:-1]
    if not Polygon(pts).exterior.is_ccw:
        pts.reverse()
    i0 = min(range(len(pts)), key=lambda i: (pts[i][0], -pts[i][1]))
    pts = pts[i0:] + pts[:i0]
    ln = LineString(pts + [pts[0]])
    return [tuple(ln.interpolate(ln.length * k / n).coords[0]) for k in range(n)]


def align(a, b):
    """Rotate b so the summed squared distance to a is smallest."""
    n = len(a)
    cost = lambda s: sum((a[i][0] - b[(i + s) % n][0]) ** 2 + (a[i][1] - b[(i + s) % n][1]) ** 2 for i in range(0, n, 3))
    best = min(range(n), key=cost)
    return b[best:] + b[:best]


def morph_pairs(ga, gb):
    """Pair polygons of two shapes by overlap; matched exteriors are resampled to equal length for the engine to interpolate.
    Unpaired polygons are returned as indexes so the engine can fade them out/in."""
    A = sorted(polys_of(ga), key=lambda p: -p.area)[:40]
    B = sorted(polys_of(gb), key=lambda p: -p.area)[:40]
    pairs, usedB = [], set()
    for ia, pa in enumerate(A):
        cand = [(pa.intersection(pb).area, j) for j, pb in enumerate(B) if j not in usedB]
        cand = [c for c in cand if c[0] > 0]
        if not cand:
            continue
        _, j = max(cand)
        usedB.add(j)
        a = ring_pts(pa.exterior, MORPH_N)
        b = align(a, ring_pts(B[j].exterior, MORPH_N))
        r = lambda pts: [[round(x, 4), round(y, 4)] for x, y in pts]
        pairs.append({"a": r(a), "b": r(b), "ia": ia, "ib": j})
    return {"pairs": pairs, "a_polys": [rings(q)[0] for q in A], "b_polys": [rings(q)[0] for q in B]}   # polys in area order: pairs index into them


def label_point(g, view_box):
    ps = polys_of(g.intersection(view_box))
    if not ps:
        return None
    lp = max(ps, key=lambda x: x.area).representative_point()
    return [round(lp.x, 5), round(lp.y, 5)]


def history_scene(sc, countries):
    p = sc["params"]
    reg = p.get("focus") or p.get("region")
    if isinstance(reg, str):
        reg = list(countries[reg]["geom"].bounds)
    w, s, e, n = reg
    padx, pady = (e - w) * 0.3, (n - s) * 0.3
    view = box(w - padx, s - pady, e + padx, n + pady)
    inner_box = box(w, s, e, n)
    tol = (e - w) / 1500
    land = unary_union([c["geom"].intersection(view) for c in countries.values() if c["geom"].intersects(view)])
    land_layer = {"iso": "LAND", "name": "land", "src": "ne", "polys": rings(land.simplify(tol, preserve_topology=True)), "label": None}
    snaps, lic, non_cc0, shapes = [], [], [], []
    for sn in p["snapshots"]:
        terr, sgeoms = [], {}
        approx = bool(sn.get("approximate"))
        for tr in sn["territories"]:
            if "relation" in tr or "ohm_name" in tr:
                rid = int(tr.get("relation") or ohm_resolve(tr["ohm_name"], sn["date"]))
                g, tags = ohm_relation(rid)
                info = ohm_license(rid, tags)
                if not any(x["relation"] == rid for x in lic):
                    lic.append(info)
                    if not info["cc0"]:
                        non_cc0.append(info)
                src = {"src": "ohm", "ohm": rid, "ohm_name": info["name"], "ohm_start": info["start_date"], "ohm_end": info["end_date"]}
            else:
                g = unary_union([countries[i]["geom"] for i in tr["iso"]])
                src = {"src": "ne", "iso": tr["iso"]}
                approx = True   # merged modern units stand in for a historical extent
            clip = g.intersection(view).simplify(tol, preserve_topology=True)
            sgeoms[tr["key"]] = clip
            terr.append(dict(key=tr["key"], name=tr.get("name", tr["key"]), color=tr.get("color", "orange"),
                             polys=rings(clip), label=label_point(clip, inner_box), **src))
        snaps.append({"date": sn["date"], "approximate": approx, "territories": terr})
        shapes.append(sgeoms)
    for i in range(len(snaps) - 1):
        for T in snaps[i]["territories"]:
            nxt = shapes[i + 1].get(T["key"])
            T["morph"] = morph_pairs(shapes[i][T["key"]], nxt) if nxt is not None else None
    return {"region": [w, s, e, n], "layers": [land_layer], "osm": False, "ohm": True,
            "history": {"snapshots": snaps}}, lic, non_cc0


ep = os.path.abspath(sys.argv[1])
sb = json.load(open(os.path.join(ep, "storyboard.json")))
countries = None
geo = {"sources": [], "scenes": {}}
all_lic, all_non_cc0 = [], []
for sc in sb["scenes"]:
    if sc["type"] not in MAP_TYPES and not (sc["type"] == "custom" and "region" in sc.get("params", {})):
        continue                       # a custom scene with params.region gets the same Natural Earth layers as map_focus
    countries = countries or natural_earth()
    if sc["type"] == "map_history":
        gs, lic, non = history_scene(sc, countries)
        geo["scenes"][sc["id"]] = gs
        all_lic += [x for x in lic if x not in all_lic]
        all_non_cc0 += [x for x in non if x not in all_non_cc0]
        print(f"{sc['id']:18} history: " + " | ".join(
            sn["date"] + " " + ", ".join(f"{t['key']}<-{t.get('ohm') or ','.join(t['iso'])}({sum(len(r[0]) for r in t['polys'])}pt)" for t in sn["territories"])
            for sn in gs["history"]["snapshots"]))
        continue
    p = sc["params"]
    reg = p.get("region")
    if isinstance(reg, str):
        g = countries[reg]["geom"]
        reg = list(g.bounds)
    w, s, e, n = reg
    padx, pady = (e - w) * 0.6, (n - s) * 0.6
    view = box(w - padx, s - pady, e + padx, n + pady)
    tol = (e - w) / 1500
    layers = []
    for iso, c in countries.items():
        if not c["geom"].intersects(view):
            continue
        clip = c["geom"].intersection(view).simplify(tol, preserve_topology=True)
        if clip.is_empty:
            continue
        inside = c["geom"].intersection(box(w, s, e, n))
        lp = inside.representative_point() if not inside.is_empty and inside.area > 0.02 * box(w, s, e, n).area else None
        layers.append({"iso": iso, "name": c["name"], "src": "ne", "polys": rings(clip),
                       "label": [round(lp.x, 5), round(lp.y, 5)] if lp else None})
    used_osm = False
    if p.get("coast") == "osm":
        oc = osm_coast(view, {iso: c for iso, c in countries.items() if c["geom"].intersects(view)})
        for L in layers:
            if L["iso"] in oc:
                L["polys"], L["src_coast"] = rings(oc[L["iso"]].simplify(tol / 3, preserve_topology=True)), "osm"
        used_osm = bool(oc)
    detail_geoms = []
    for d in p.get("detail", []):
        b = osm_boundary(d["osm"])
        g = shape(b["geojson"]).intersection(view).simplify(tol / 3, preserve_topology=True)
        layers.append({"iso": d["iso"], "name": d["osm"], "src": "osm", "osm": b["osm"], "polys": rings(g), "label": None})
        detail_geoms.append((d["iso"], g))
        used_osm = True
    for L in layers:   # label a country where it really is: not on another country's enclaves
        others = [g for iso, g in detail_geoms if iso != L["iso"]]
        if L["src"] == "ne" and L["label"] and others:
            own = countries[L["iso"]]["geom"].intersection(box(w, s, e, n)).difference(unary_union(others).buffer(tol * 20))
            if not own.is_empty:
                lp = own.representative_point() if own.geom_type == "Polygon" else max(own.geoms, key=lambda g: g.area).representative_point()
                L["label"] = [round(lp.x, 5), round(lp.y, 5)]
    geo["scenes"][sc["id"]] = {"region": [w, s, e, n], "layers": layers, "osm": used_osm}
    print(f"{sc['id']:18} region {w:.3f},{s:.3f},{e:.3f},{n:.3f}  countries: "
          + ", ".join(f"{l['iso']}({sum(len(r[0]) for r in l['polys'])}pt)" for l in layers))
geo["sources"] = ["Natural Earth 1:10m admin-0 countries (public domain)"] + (
    ["OpenStreetMap contributors (ODbL), via Nominatim"] if any(v["osm"] for v in geo["scenes"].values()) else [])
if all_lic:
    geo["sources"].append("OpenHistoricalMap contributors (CC0 unless a relation carries its own licence tag; see ohm_licenses), via Overpass")
    geo["ohm_licenses"] = all_lic
    geo["ohm_non_cc0"] = all_non_cc0   # research gate: anything here needs a licence decision before it ships
    for x in all_non_cc0:
        print(f"WARNING: OHM relation {x['relation']} ({x['name']}) carries license={x['license']}: not CC0; see build/geo.json ohm_non_cc0")
os.makedirs(os.path.join(ep, "build"), exist_ok=True)
json.dump(geo, open(os.path.join(ep, "build", "geo.json"), "w"))
print(f"wrote build/geo.json ({len(geo['scenes'])} map scenes)")

"""Map data for an episode's map scenes: storyboard.json -> build/geo.json.

    python3 studio/tools/geo.py <episode-dir>

For every map_focus / map_route scene:
- base layer: Natural Earth 1:10m admin-0 countries (public domain), clipped to the scene's region
  (padded) and simplified to screen resolution. Cached in ~/.cache/studio/.
- optional detail layer: params.detail = [{"osm": "<place name>", "iso": "BE"}, ...] fetches that
  place's administrative boundary from OpenStreetMap (Nominatim, cached, 1 request/s) and draws it on
  top in that country's colour. Use it when the story lives below country scale (enclaves, villages).
  OSM data is ODbL: the engine prints "© OpenStreetMap contributors" on any scene that uses it.
params.region is [west, south, east, north] in degrees, or an ISO-3166 alpha-2 code.
Needs: pip install shapely
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

from shapely.geometry import box, mapping, shape
from shapely.ops import unary_union

CACHE = os.path.expanduser("~/.cache/studio")
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"
NE = os.path.join(CACHE, "ne_10m_admin_0_countries.geojson")
UA = "studio-engine/1.0 (explainer video maps; contact via repository owner)"
MAP_TYPES = ("map_focus", "map_route")
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


ep = os.path.abspath(sys.argv[1])
sb = json.load(open(os.path.join(ep, "storyboard.json")))
countries = None
geo = {"sources": [], "scenes": {}}
for sc in sb["scenes"]:
    if sc["type"] not in MAP_TYPES:
        continue
    countries = countries or natural_earth()
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
os.makedirs(os.path.join(ep, "build"), exist_ok=True)
json.dump(geo, open(os.path.join(ep, "build", "geo.json"), "w"))
print(f"wrote build/geo.json ({len(geo['scenes'])} map scenes)")

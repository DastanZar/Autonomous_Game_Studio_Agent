"""Synthetic build/timeline.json for the fixture (format of studio/sop/04-voice.md): 0.34 s per word.

Fixture copy step (build/ is generated, not committed):
    cd studio/engine/fixtures/map-history && python3 build_timeline.py    # writes build/timeline.json
    python3 studio/tools/geo.py studio/engine/fixtures/map-history         # writes build/geo.json (needs network once; cached)
    node studio/engine/render.mjs studio/engine/fixtures/map-history sheet
"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
sc = json.load(open(os.path.join(here, "script.json")))
t, paras = sc["lead_in"], []
for p in sc["paras"]:
    words = p["say"].split()
    ws = [{"w": w, "t": round(t + i * 0.34, 3)} for i, w in enumerate(words)]
    end = t + len(words) * 0.34
    paras.append({"id": p["id"], "start": round(t, 3), "end": round(end, 3), "wer": 0.0, "heard": p["say"], "words": ws})
    t = end + p.get("gap", sc["gap"])
os.makedirs(os.path.join(here, "build"), exist_ok=True)
json.dump({"duration": round(t + sc["tail"], 3), "paras": paras}, open(os.path.join(here, "build", "timeline.json"), "w"), indent=1)
print("wrote build/timeline.json")

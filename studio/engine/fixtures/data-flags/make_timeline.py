#!/usr/bin/env python3
"""Writes build/timeline.json for this fixture: a SYNTHETIC voice timeline (no TTS), in the format studio/sop/04-voice.md
describes: {duration, paras: [{id, start, end, wer, heard, words: [{w, t}]}]}. Word times are 0.3 s + 0.035 s per letter apart.
build/timeline.json is committed (like studio/examples/emu-war/build/timeline.json), so this only needs re-running after
script.json is edited:  python3 studio/engine/fixtures/data-flags/make_timeline.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
sc = json.load(open(os.path.join(here, "script.json")))
t = sc["lead_in"]; paras = []
for p in sc["paras"]:
    words = []; start = t
    for w in p["say"].split():
        words.append({"w": w, "t": round(t, 3)})
        t += 0.3 + 0.035 * len("".join(c for c in w if c.isalnum())) + (0.22 if w[-1] in ".,?" else 0)
    end = t - 0.05
    paras.append({"id": p["id"], "start": round(start, 3), "end": round(end, 3), "wer": 0.0, "heard": p["say"].lower(), "words": words})
    t += p.get("gap", sc["gap"])
os.makedirs(os.path.join(here, "build"), exist_ok=True)
json.dump({"duration": round(t + sc["tail"], 3), "paras": paras, "_note": "synthetic timeline for the engine fixture, not real speech"},
          open(os.path.join(here, "build", "timeline.json"), "w"), indent=1)
print("wrote build/timeline.json, duration", round(t + sc["tail"], 2))

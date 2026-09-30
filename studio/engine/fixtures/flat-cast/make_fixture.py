#!/usr/bin/env python3
"""Writes the flat-cast engine test fixture: script.json, storyboard.json, episode.json, and a SYNTHETIC
build/timeline.json (0.34 s per word, 0.3 s gaps; no voice is generated). build/ is scratch, so the
timeline is regenerated here rather than committed.

    python3 studio/engine/fixtures/flat-cast/make_fixture.py
    node studio/engine/render.mjs studio/engine/fixtures/flat-cast sheet     # -> build/contact.png
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
paras = [
    ("hook", "liver", "Brain thinks it runs this place.", [["BRAIN THINKS", 2], ["IT RUNS THIS PLACE.", 4]]),
    ("brag", "brain", "I am ninety percent of the operation.", [["I AM NINETY PERCENT", 4], ["OF THE OPERATION.", 3]]),
    ("chore", "liver", "Who filters the blood, makes the bile, and stores the sugar?", [["WHO FILTERS THE BLOOD,", 4], ["MAKES THE BILE,", 3], ["AND STORES THE SUGAR?", 4]]),
    ("how", "liver", "Here is how one meal gets processed.", [["HERE IS HOW", 3], ["ONE MEAL GETS PROCESSED.", 4]]),
    ("steps", "liver", "Gut, then blood, then me. Every single time.", [["GUT, THEN BLOOD,", 3], ["THEN ME.", 2], ["EVERY SINGLE TIME.", 3]]),
    ("beat", "heart", "I deliver it. Nonstop. No days off.", [["I DELIVER IT.", 3], ["NONSTOP. NO DAYS OFF.", 4]]),
    ("think", "brain", "Fine. Nobody thanks the brain either.", [["FINE. NOBODY THANKS", 4], ["THE BRAIN EITHER.", 3]]),
    ("end", "liver", "Nobody thanks anyone.", [["NOBODY THANKS ANYONE.", 3]]),
]
script = {"channel": "body-cast", "episode": "flat-cast", "note": "engine test fixture; lines are placeholders, not fact-checked content",
          "lead_in": 0.3, "tail": 1.0, "gap": 0.3,
          "paras": [{"id": i, "say": s, "kind": "joke", "speaker": sp, "claims": [], "caps": c} for i, sp, s, c in paras]}

t, tl = 0.3, []
for i, sp, s, c in paras:
    ws = s.split()
    words = [{"w": w, "t": round(t + k * 0.34, 3)} for k, w in enumerate(ws)]
    end = round(t + len(ws) * 0.34, 3)
    tl.append({"id": i, "start": round(t, 3), "end": end, "wer": 0.0, "heard": s, "words": words})
    t = end + 0.3
timeline = {"duration": round(t + 0.7, 3), "paras": tl}


def sc(id, type, start, params, events=None):
    d = {"id": id, "type": type, "start": start, "params": params}
    if events:
        d["events"] = events
    return d


storyboard = {"episode": "flat-cast", "scenes": [
    sc("s_open", "character_dialog", "0", {"cast": ["liver", "brain"], "setting": "spotlight", "title": "LIVER VS BRAIN"}),
    sc("s_brag", "character_dialog", "brag.start-0.15", {"cast": ["liver", "brain"], "setting": "neurons"}),
    sc("s_chore", "character_dialog", "chore.start-0.15", {"cast": ["liver"], "setting": "stomach", "bubbles": {"chore": "WHO FILTERS THE BLOOD AND MAKES THE BILE?"}}),
    sc("s_how", "character_explain", "how.start-0.15", {"speaker": "liver", "setting": "stomach", "diagram": "One meal, three stops",
       "steps": [{"label": "GUT", "at": "steps/gut"}, {"label": "BLOOD", "at": "steps/blood"}, {"label": "LIVER", "at": "steps/me"}]},
       [{"at": "how/here", "do": "reveal_card"}]),
    sc("s_beat", "character_dialog", "beat.start-0.15", {"cast": ["heart", "liver"], "setting": "bloodstream"}),
    sc("s_gut", "character_dialog", "think.start-0.15", {"cast": ["brain", "gut_microbes"], "setting": "gut"}),
    sc("s_end", "character_dialog", "end.start-0.15", {"cast": ["liver", "brain"], "setting": "spotlight", "title": "NOBODY THANKS ANYONE"}),
]}
episode = {"channel": "body-cast", "slug": "flat-cast", "created": "2026-09-30T00:00:00Z",
           "note": "Engine test fixture for the flat-cast theme and the character_dialog / character_explain scene types. "
                   "Synthetic timeline (make_fixture.py writes build/timeline.json). Not a real episode."}

def w(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(obj, open(path, "w"), indent=1)

w(os.path.join(HERE, "script.json"), script)
w(os.path.join(HERE, "storyboard.json"), storyboard)
w(os.path.join(HERE, "episode.json"), episode)
w(os.path.join(HERE, "build", "timeline.json"), timeline)
print("fixture written; duration", timeline["duration"])

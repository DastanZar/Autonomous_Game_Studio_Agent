"""Fail fast if any WT()/W_() word cue in render/scenes.js is missing from build/timeline.json."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "render", "scenes.js")).read()
tl = json.load(open(os.path.join(ROOT, "build", "timeline.json")))
nrm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
bad = 0
refs = list(re.finditer(r'W(?:T|_)\("(\w+)",\s*"([^"]+)"(?:,\s*(\d+))?', src))
for m in refs:
    pid, word, nth = m.group(1), m.group(2), int(m.group(3) or 0)
    para = next((p for p in tl["paras"] if p["id"] == pid), None)
    hits = [w for w in para["words"] if nrm(w["w"]) == word] if para else []
    if len(hits) <= nth:
        bad += 1
        print(f"MISSING  {pid}/{word}#{nth}   words: {' '.join(nrm(w['w']) for w in para['words']) if para else 'no such paragraph'}")
print(f"checked {len(refs)} cues, {bad} missing")
sys.exit(1 if bad else 0)

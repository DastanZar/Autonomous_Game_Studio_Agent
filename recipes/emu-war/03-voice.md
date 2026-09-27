# Step 3: Voice-over and timeline

## 3.1 Create `shorts/emu-war/script.json`

This is the whole story:
- `say` is what the voice reads.
- `gap` is the silence after a line, used for comic timing.
- `caps` are the burned-in caption chunks as `[text shown, number of spoken words it covers]`. The
  counts in each line add up to the number of words in `say`.

```json
{
  "voice": "en_US-ryan-high",
  "lead_in": 0.35,
  "tail": 1.6,
  "lines": [
    {"id": "hook",     "say": "In nineteen thirty-two, Australia went to war against birds.", "gap": 0.25,
     "caps": [["IN 1932,", 3], ["AUSTRALIA WENT TO WAR", 4], ["AGAINST BIRDS.", 2]]},
    {"id": "lost",     "say": "And lost.", "gap": 0.55,
     "caps": [["AND LOST.", 2]]},
    {"id": "vets",     "say": "After World War One, the government gave veterans farmland in Western Australia.", "gap": 0.2,
     "caps": [["AFTER WORLD WAR ONE,", 4], ["THE GOVERNMENT GAVE VETERANS", 4], ["FARMLAND", 1], ["IN WESTERN AUSTRALIA.", 3]]},
    {"id": "emus",     "say": "Then twenty thousand emus showed up, and started eating the wheat.", "gap": 0.25,
     "caps": [["THEN 20,000 EMUS", 4], ["SHOWED UP,", 2], ["AND STARTED EATING", 3], ["THE WHEAT.", 2]]},
    {"id": "call",     "say": "So the farmers called the army.", "gap": 0.2,
     "caps": [["SO THE FARMERS", 3], ["CALLED THE ARMY.", 3]]},
    {"id": "sent",     "say": "The army sent one major, two soldiers, two machine guns, and ten thousand bullets.", "gap": 0.3,
     "caps": [["THE ARMY SENT", 3], ["ONE MAJOR,", 2], ["TWO SOLDIERS,", 2], ["TWO MACHINE GUNS,", 3], ["AND 10,000 BULLETS.", 4]]},
    {"id": "scatter",  "say": "The emus split into tiny groups, and ran out of range.", "gap": 0.25,
     "caps": [["THE EMUS SPLIT", 3], ["INTO TINY GROUPS,", 3], ["AND RAN OUT OF RANGE.", 5]]},
    {"id": "ambush",   "say": "When a thousand of them finally walked into an ambush,", "gap": 0.3,
     "caps": [["WHEN 1,000 OF THEM", 5], ["FINALLY WALKED", 2], ["INTO AN AMBUSH...", 3]]},
    {"id": "jam",      "say": "the gun jammed.", "gap": 0.45,
     "caps": [["THE GUN JAMMED.", 3]]},
    {"id": "truck",    "say": "So they mounted a gun on a truck.", "gap": 0.2,
     "caps": [["SO THEY MOUNTED", 3], ["A GUN ON A TRUCK.", 5]]},
    {"id": "faster",   "say": "The emus were faster than the truck.", "gap": 0.4,
     "caps": [["THE EMUS WERE", 3], ["FASTER THAN THE TRUCK.", 4]]},
    {"id": "tally",    "say": "By December: nearly ten thousand bullets, for nine hundred eighty-six emus.", "gap": 0.25,
     "caps": [["BY DECEMBER:", 2], ["NEARLY 10,000 BULLETS,", 4], ["FOR 986 EMUS.", 5]]},
    {"id": "perbird",  "say": "Ten bullets per bird.", "gap": 0.45,
     "caps": [["TEN BULLETS", 2], ["PER BIRD.", 2]]},
    {"id": "review",   "say": "The major's review of the enemy?", "gap": 0.3,
     "caps": [["THE MAJOR'S REVIEW", 3], ["OF THE ENEMY?", 3]]},
    {"id": "quote",    "say": "They can face machine guns, with the invulnerability of tanks.", "gap": 0.6, "length_scale": 1.02,
     "caps": []},
    {"id": "home",     "say": "The army went home.", "gap": 0.35,
     "caps": [["THE ARMY WENT HOME.", 4]]},
    {"id": "didnot",   "say": "The emus did not.", "gap": 0.0,
     "caps": [["THE EMUS", 2], ["DID NOT.", 2]]}
  ]
}
```

## 3.2 Create `shorts/emu-war/tools/vo.py`

```python
"""Voiceover first: synthesize each script line, lay them on a timeline, align words.

Outputs build/vo.wav and build/timeline.json (line + caption timings) which drive
every visual event in the renderer.
"""
import difflib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
VOICES = os.path.expanduser("~/voices")
SR = 22050

script = json.load(open(os.path.join(ROOT, "script.json")))
model = os.path.join(VOICES, script["voice"] + ".onnx")
os.makedirs(os.path.join(BUILD, "lines"), exist_ok=True)


def read_wav(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def trim(x, thresh=0.01, pad=0.03):
    idx = np.where(np.abs(x) > thresh)[0]
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


whisper = WhisperModel("base.en", device="cpu", compute_type="int8")

audio, t, lines, caps = [np.zeros(int(script["lead_in"] * SR), np.float32)], script["lead_in"], [], []
for ln in script["lines"]:
    path = os.path.join(BUILD, "lines", ln["id"] + ".wav")
    if not os.path.exists(path):  # Piper is random per run: keep (or supply) a take to reproduce it exactly
        subprocess.run(["piper", "-m", model, "-f", path, "--length-scale", str(ln.get("length_scale", 0.9))],
                       input=ln["say"].encode(), check=True, capture_output=True)
    x = trim(read_wav(path))
    dur = len(x) / SR

    # Word timings: whisper words anchor matching script words; the rest interpolate by characters.
    words = ln["say"].split()
    segs, _ = whisper.transcribe(resample_poly(x, 160, 221).astype(np.float32), word_timestamps=True, language="en")
    hyp = [w for s in segs for w in s.words]
    starts = [None] * len(words)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in words], b=[norm(h.word) for h in hyp], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            starts[blk.a + k] = hyp[blk.b + k].start
    lens = np.cumsum([0] + [len(w) + 1 for w in words])
    frac = lens / lens[-1]
    known = [(frac[i], s) for i, s in enumerate(starts) if s is not None]
    kx = [0.0] + [k[0] for k in known] + [1.0]
    ky = [0.0] + [k[1] for k in known] + [dur]
    starts = [float(np.interp(frac[i], kx, ky)) if s is None else s for i, s in enumerate(starts)]
    starts = list(np.maximum.accumulate(starts))

    wi = 0
    for text, n in ln["caps"]:
        caps.append({"text": text, "line": ln["id"], "start": round(t + starts[wi], 3)})
        wi += n
    assert wi in (0, len(words)), f"caption word counts off for {ln['id']}: {wi} vs {len(words)}"
    lines.append({"id": ln["id"], "start": round(t, 3), "end": round(t + dur, 3),
                  "words": [{"w": w, "t": round(t + s, 3)} for w, s in zip(words, starts)]})
    audio.append(x)
    t += dur
    audio.append(np.zeros(int(ln["gap"] * SR), np.float32))
    t += ln["gap"]

# caption end = next caption start within the same line, else line end
for i, c in enumerate(caps):
    ln = next(l for l in lines if l["id"] == c["line"])
    nxt = caps[i + 1] if i + 1 < len(caps) and caps[i + 1]["line"] == c["line"] else None
    c["end"] = nxt["start"] if nxt else round(ln["end"] + 0.12, 3)

total = t + script["tail"]
audio.append(np.zeros(int(script["tail"] * SR), np.float32))
y = np.concatenate(audio)
with wave.open(os.path.join(BUILD, "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({"duration": round(total, 3), "lines": lines, "caps": caps},
          open(os.path.join(BUILD, "timeline.json"), "w"), indent=1)
for l in lines:
    print(f"{l['start']:6.2f}-{l['end']:6.2f}  {l['id']}")
print("total", round(total, 2))
```

What it does:
1. Synthesizes each line to `build/lines/<id>.wav`, only if that file doesn't exist yet.
2. Trims silence (threshold 0.01, 30 ms padding).
3. Lays the lines end to end: a 0.35 s lead-in, each line's `gap`, then a 1.6 s tail.
4. Runs Whisper `base.en` on 16 kHz audio to get word start times, and matches script words to them
   with `difflib`. Words Whisper spells differently (e.g. "nineteen thirty-two" vs "1932") get times
   interpolated by character position.
5. Writes `build/vo.wav` and `build/timeline.json`.

## 3.3 Use the saved voice takes, then build

Piper adds random variation on every run, so the original takes are provided.

```bash
mkdir -p shorts/emu-war/build/lines
cp recipes/emu-war/golden/lines/*.wav shorts/emu-war/build/lines/
cd shorts/emu-war && python3 tools/vo.py && cd ../..
```
**Checkpoint:** the table starts with `  0.35-  3.53  hook` and the last line is `total 46.04`.

## 3.4 Swap in the saved timeline

Whisper's word timings wobble by up to about 0.1 s between runs, and the reference picture was timed
to one specific run.

```bash
cp recipes/emu-war/golden/timeline.json shorts/emu-war/build/timeline.json
md5sum shorts/emu-war/build/vo.wav shorts/emu-war/build/timeline.json
```
**Checkpoint:**
```
10a0464a4f5fb383866325cee5561a1f  shorts/emu-war/build/vo.wav
465cbd1d4518fa13f9adb7ccf7de0e47  shorts/emu-war/build/timeline.json
```

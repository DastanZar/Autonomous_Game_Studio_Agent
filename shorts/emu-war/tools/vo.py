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

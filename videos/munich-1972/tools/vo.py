"""Narration for the Munich 1972 test: script.json -> assets/vo.wav + timeline.json.

    python3 tools/vo.py [--redo p05 p09]

One Fish S2.1 free request per paragraph (tag + text), cached in build/tts/ by hash; the model's price is checked to be
zero before any request. Takes are trimmed, joined with each paragraph's gap, transcribed once (faster-whisper small.en,
16 kHz) and scored per paragraph. The key is read from OPENROUTER_API_KEY or ~/.config/openrouter/key, never printed.
"""
import argparse, hashlib, json, os, re, subprocess, sys, urllib.request
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("--redo", nargs="*", default=[]); args = ap.parse_args()
S = json.load(open(os.path.join(ROOT, "script.json"))); V = S["voice"]
cache = os.path.join(ROOT, "build", "tts"); os.makedirs(cache, exist_ok=True)
SR = 44100


def key():
    k = os.environ.get("OPENROUTER_API_KEY"); p = os.path.expanduser("~/.config/openrouter/key")
    return k or open(p).read().strip()


def free():
    req = urllib.request.Request("https://openrouter.ai/api/v1/models?output_modalities=speech", headers={"User-Agent": "studio"})
    m = next((m for m in json.load(urllib.request.urlopen(req, timeout=60))["data"] if m["id"] == V["model"]), None)
    return m is not None and all(float(v or 0) == 0 for v in m["pricing"].values())


def load(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(out, np.float32).copy(); W = int(.02 * SR)
    rms = np.array([np.sqrt(np.mean(x[j:j + W] ** 2)) for j in range(0, len(x) - W, W)])
    on = np.where(rms > 0.08 * rms.max())[0]
    y = x[max(0, on[0] * W - int(.03 * SR)):min(len(x), (on[-1] + 1) * W + int(.10 * SR))]
    f = np.linspace(0, 1, int(.008 * SR)); y[:len(f)] *= f; y[-len(f):] *= f[::-1]
    return y


checked = False
parts, starts, t = [], [], 0.35
parts.append(np.zeros(int(t * SR), np.float32))
for p in S["paras"]:
    text = f"{p['tag']} {p['say']}"
    h = hashlib.sha1(json.dumps([V["model"], V["id"], text]).encode()).hexdigest()[:12]
    path = os.path.join(cache, f"{p['id']}-{h}.mp3")
    if p["id"] in args.redo:
        for f in os.listdir(cache):
            if f.startswith(p["id"] + "-"): os.remove(os.path.join(cache, f))
    if not os.path.exists(path):
        if not checked:
            if not free(): sys.exit("Fish model is not free right now: no request sent")
            checked = True
        body = json.dumps({"model": V["model"], "input": text, "voice": V["id"], "response_format": "mp3"}).encode()
        r = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", body, {"Authorization": "Bearer " + key(), "Content-Type": "application/json"})
        open(path, "wb").write(urllib.request.urlopen(r, timeout=300).read()); print("synth", p["id"], flush=True)
    y = load(path); starts.append(t); parts += [y, np.zeros(int(p["gap"] * SR), np.float32)]; t += len(y) / SR + p["gap"]
vo = np.concatenate(parts); vo = vo / np.abs(vo).max() * 0.89
os.makedirs(os.path.join(ROOT, "assets"), exist_ok=True)
sf.write(os.path.join(ROOT, "assets", "vo.wav"), vo, SR)

# one transcription of the whole narration, aligned per paragraph by time
from faster_whisper import WhisperModel
import jiwer
tmp = os.path.join(ROOT, "build", "vo16k.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "assets", "vo.wav"), "-ar", "16000", "-ac", "1", tmp], check=True)
segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(tmp, word_timestamps=True)
words = [w for s in segs for w in s.words]
norm = lambda s: " ".join(re.sub(r"[^a-z0-9' ]", " ", s.lower().replace("-", " ")).split())
NUM = {"1972": "nineteen seventy two", "1936": "nineteen thirty six", "2022": "twenty twenty two", "31": "thirty one", "34": "thirty four", "900": "nine hundred", "200": "two hundred", "4": "four", "30": "thirty", "5th": "fifth", "4.30": "four thirty"}
fix = lambda s: " ".join(NUM.get(w, w) for w in s.split())
tl = {"duration": round(t, 3), "paras": []}
for i, p in enumerate(S["paras"]):
    a = starts[i]; b = starts[i + 1] - S["paras"][i]["gap"] if i + 1 < len(starts) else t
    ws = [w for w in words if a - 0.15 <= (w.start + w.end) / 2 <= b + 0.15]
    heard = " ".join(w.word.strip() for w in ws)
    wer = jiwer.wer(fix(norm(p["say"])), fix(norm(heard))) if heard else 1.0
    tl["paras"].append({"id": p["id"], "start": round(a, 3), "end": round(b, 3), "wer": round(wer, 3), "heard": heard,
                        "words": [{"w": w.word.strip(), "t": round(w.start, 3), "e": round(w.end, 3)} for w in ws]})
    print(f"{a:6.2f}-{b:6.2f} {p['id']} WER {wer:.2f}" + ("   <-- CHECK: " + heard if wer > 0.08 else ""))
json.dump(tl, open(os.path.join(ROOT, "timeline.json"), "w"), indent=1)
print(f"total {t:.2f}s")

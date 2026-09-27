"""Voice first: synthesize each paragraph with Fish Audio (via OpenRouter), align every word.

Paragraph audio is cached by content hash, so re-running never re-spends the free quota
unless the text or voice changed. Outputs build/vo.wav and build/timeline.json.
Every paragraph is transcribed back and compared to the script (WER) to catch misreads.
"""
import difflib, hashlib, json, os, re, subprocess, sys, urllib.request, wave
import numpy as np
import imageio_ffmpeg
import jiwer
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
CACHE = os.path.join(ROOT, "build", "tts")
SR = 44100
FF = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs(CACHE, exist_ok=True)
script = json.load(open(os.path.join(ROOT, "script.json")))
V = script["voice"]
KEY = open(os.path.expanduser("~/.config/openrouter/key")).read().strip()


def tts(text):
    h = hashlib.sha1((V["model"] + V["id"] + text).encode()).hexdigest()[:16]
    mp3 = os.path.join(CACHE, h + ".mp3")
    if not os.path.exists(mp3):
        body = json.dumps({"model": V["model"], "input": text, "voice": V["id"], "response_format": "mp3"}).encode()
        req = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", body,
                                     {"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
        data = urllib.request.urlopen(req, timeout=300).read()
        open(mp3, "wb").write(data)
    raw = subprocess.run([FF, "-loglevel", "error", "-i", mp3, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def trim(x, thresh=0.012, pad=0.04):
    idx = np.where(np.abs(x) > thresh)[0]
    return x[max(0, idx[0] - int(pad * SR)): min(len(x), idx[-1] + int(pad * SR))]


norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
whisper = WhisperModel("small.en", device="cpu", compute_type="int8")
only = set(sys.argv[1:])

audio, t, paras = [np.zeros(int(script["lead_in"] * SR), np.float32)], script["lead_in"], []
for p in script["paras"]:
    x = trim(tts(p["say"]))
    dur = len(x) / SR
    x16 = subprocess.run([FF, "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-f", "f32le", "-ar", "16000", "-"],
                         input=x.tobytes(), capture_output=True, check=True).stdout
    segs, _ = whisper.transcribe(np.frombuffer(x16, np.float32), word_timestamps=True, language="en")
    hyp = [w for s in segs for w in s.words]
    words = p["say"].split()
    starts = [None] * len(words)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in words], b=[norm(h.word) for h in hyp], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            starts[blk.a + k] = hyp[blk.b + k].start
    frac = np.cumsum([0] + [len(w) + 1 for w in words]) / (sum(len(w) + 1 for w in words))
    known = [(frac[i], s) for i, s in enumerate(starts) if s is not None]
    kx, ky = [0.0] + [k[0] for k in known] + [1.0], [0.0] + [k[1] for k in known] + [dur]
    starts = list(np.maximum.accumulate([float(np.interp(frac[i], kx, ky)) if s is None else s for i, s in enumerate(starts)]))
    wer = jiwer.wer(" ".join(norm(w) for w in words), " ".join(norm(h.word) for h in hyp))
    paras.append({"id": p["id"], "start": round(t, 3), "end": round(t + dur, 3), "wer": round(wer, 3),
                  "heard": " ".join(h.word.strip() for h in hyp),
                  "words": [{"w": w, "t": round(t + s, 3)} for w, s in zip(words, starts)]})
    print(f"{t:7.2f}-{t + dur:7.2f}  {p['id']:10} WER {wer:.2f}" + ("   <-- CHECK: " + paras[-1]["heard"] if wer > 0.08 else ""))
    audio.append(x.astype(np.float32)); t += dur
    g = p.get("gap", script["gap"])
    audio.append(np.zeros(int(g * SR), np.float32)); t += g

audio.append(np.zeros(int(script["tail"] * SR), np.float32)); t += script["tail"]
y = np.concatenate(audio)
y = y / (np.max(np.abs(y)) + 1e-9) * 0.9
with wave.open(os.path.join(BUILD, "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
json.dump({"duration": round(t, 3), "paras": paras}, open(os.path.join(BUILD, "timeline.json"), "w"), indent=1)
print("total", round(t, 2), "s")

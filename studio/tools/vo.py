"""Voice stage: script.json -> build/vo.wav + build/timeline.json, voiced as the channel bible says.

    python3 studio/tools/vo.py <episode-dir> [--engine piper|fish] [--redo para_id ...]

- The voice comes from the bible (`voice`), or from a cast member's `voice` for lines with a `speaker`.
  Fish needs an OpenRouter key (OPENROUTER_API_KEY or ~/.config/openrouter/key). Without a key, or
  with --engine piper, the bible's `voice.fallback` (Piper) is used and the timeline records that.
- Every paragraph is synthesised once and cached in build/tts/ by hash of (engine, voice, text, speed).
  Re-running costs nothing. --redo <id> deletes that paragraph's take first (a retake).
- The whole narration is transcribed ONCE (faster-whisper small.en, 16 kHz), aligned to the script, and
  scored per paragraph (textnorm.per_para_wer). Short lines are never transcribed alone.
Needs: pip install piper-tts faster-whisper imageio-ffmpeg numpy jiwer; Piper voices in ~/voices/.
"""
import argparse, difflib, hashlib, json, os, re, subprocess, sys, urllib.request, wave

import imageio_ffmpeg
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textnorm import per_para_wer  # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument("episode")
ap.add_argument("--engine", choices=["piper", "fish"])
ap.add_argument("--redo", nargs="*", default=[])
args = ap.parse_args()

ep = os.path.abspath(args.episode)
meta = json.load(open(os.path.join(ep, "episode.json")))
bible = json.load(open(os.path.join(HERE, "channels", meta["channel"], "bible.json")))
script = json.load(open(os.path.join(ep, "script.json")))
cache = os.path.join(ep, "build", "tts")
os.makedirs(cache, exist_ok=True)


def fish_key():
    k = os.environ.get("OPENROUTER_API_KEY")
    p = os.path.expanduser("~/.config/openrouter/key")
    return k or (open(p).read().strip() if os.path.exists(p) else None)


def pick_voice(para):
    v = bible["voice"]
    if para.get("speaker"):
        member = next((c for c in bible.get("cast", []) if c["id"] == para["speaker"]), None)
        if member and member.get("voice"):
            v = member["voice"]
    engine = args.engine or v["engine"]
    if engine == "fish" and not fish_key():
        engine = "piper"
    if engine == "piper" and v["engine"] != "piper":
        v = bible["voice"].get("fallback", {"engine": "piper", "id": "en_US-ryan-high", "length_scale": 0.9})
    return engine, v


def decode(path):
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def synth(para):
    engine, v = pick_voice(para)
    speed = para.get("length_scale", v.get("length_scale", 0.9))
    h = hashlib.sha1(json.dumps([engine, v.get("model"), v["id"], para["say"], speed]).encode()).hexdigest()[:16]
    ext = "mp3" if engine == "fish" else "wav"
    path = os.path.join(cache, f"{para['id']}-{h}.{ext}")
    if para["id"] in args.redo:
        for f in os.listdir(cache):
            if f.startswith(para["id"] + "-"):
                os.remove(os.path.join(cache, f))
    if not os.path.exists(path):
        if engine == "fish":
            body = json.dumps({"model": v["model"], "input": para["say"], "voice": v["id"], "response_format": "mp3"}).encode()
            req = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", body,
                                         {"Authorization": "Bearer " + fish_key(), "Content-Type": "application/json"})
            open(path, "wb").write(urllib.request.urlopen(req, timeout=300).read())
        else:
            model = os.path.expanduser(f"~/voices/{v['id']}.onnx")
            if not os.path.exists(model):
                sys.exit(f"missing Piper voice {model} (see recipes/emu-war/02-assets.md for the download)")
            subprocess.run(["piper", "-m", model, "-f", path, "--length-scale", str(speed)],
                           input=para["say"].encode(), check=True, capture_output=True)
    return decode(path), f"{engine}:{v['id']}"


def trim(x, thresh=0.012, pad=0.04):
    idx = np.where(np.abs(x) > thresh)[0]
    return x[max(0, idx[0] - int(pad * SR)): min(len(x), idx[-1] + int(pad * SR))] if len(idx) else x


# 1. synthesise and lay out
audio, t, layout, voices = [np.zeros(int(script["lead_in"] * SR), np.float32)], script["lead_in"], [], set()
for i, p in enumerate(script["paras"]):
    x, who = synth(p)
    x = trim(x)
    voices.add(who)
    layout.append((p, t, t + len(x) / SR))
    audio.append(x); t += len(x) / SR
    if i < len(script["paras"]) - 1:
        g = p.get("gap", script["gap"])
        audio.append(np.zeros(int(g * SR), np.float32)); t += g
audio.append(np.zeros(int(script["tail"] * SR), np.float32)); t += script["tail"]
y = np.concatenate(audio)
y = y / (np.max(np.abs(y)) + 1e-9) * 0.9
with wave.open(os.path.join(ep, "build", "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())

# 2. one transcript of the whole narration (16 kHz!), with word times
from faster_whisper import WhisperModel
y16 = subprocess.run([FF, "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-f", "f32le", "-ar", "16000", "-"],
                     input=y.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
model = WhisperModel(os.environ.get("STUDIO_WHISPER", "small.en"), device="cpu", compute_type="int8")
segs, _ = model.transcribe(np.frombuffer(y16, np.float32), word_timestamps=True, language="en")
hyp = [w for s in segs for w in s.words]
heard = " ".join(w.word.strip() for w in hyp)

# 3. word times: matched words take Whisper's time; the rest interpolate by characters inside their paragraph
nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
script_words = [(pi, w) for pi, (p, _, _) in enumerate(layout) for w in p["say"].split()]
sm = difflib.SequenceMatcher(a=[nrm(w) for _, w in script_words], b=[nrm(h.word) for h in hyp], autojunk=False)
times = [None] * len(script_words)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        times[blk.a + k] = hyp[blk.b + k].start
scores = per_para_wer([(p["id"], p["say"]) for p, _, _ in layout], heard)
paras, k = [], 0
for pi, (p, a, b) in enumerate(layout):
    words = p["say"].split()
    tt = times[k:k + len(words)]
    k += len(words)
    frac = np.cumsum([0] + [len(w) + 1 for w in words]) / sum(len(w) + 1 for w in words)
    known = [(frac[i], s) for i, s in enumerate(tt) if s is not None and a - 0.3 <= s <= b + 0.3]
    kx, ky = [0.0] + [q[0] for q in known] + [1.0], [a] + [q[1] for q in known] + [b]
    order = np.argsort(kx, kind="stable")
    kx, ky = np.array(kx)[order], np.maximum.accumulate(np.array(ky)[order])
    st = [float(np.interp(frac[i], kx, ky)) for i in range(len(words))]
    st = list(np.maximum.accumulate(st))
    wer, span = scores[p["id"]]
    paras.append({"id": p["id"], "start": round(a, 3), "end": round(b, 3), "wer": wer, "heard": span,
                  "words": [{"w": w, "t": round(s, 3)} for w, s in zip(words, st)]})
    flag = "   <-- CHECK: heard '" + span + "'" if wer > bible["voice"]["max_wer"] else ""
    print(f"{a:6.2f}-{b:6.2f}  {p['id']:14} WER {wer:.2f}{flag}")

json.dump({"duration": round(t, 3), "voices": sorted(voices), "paras": paras}, open(os.path.join(ep, "build", "timeline.json"), "w"), indent=1)
print(f"total {t:.2f}s   voices: {', '.join(sorted(voices))}")
if any(v.startswith("piper") for v in voices) and bible["voice"]["engine"] == "fish":
    print("NOTE: Fish key not available, so this is a Piper DRAFT voice. Re-run with the key for the final voice.")

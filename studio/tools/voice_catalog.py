"""Free voice catalogue: one short sentence read by every free English voice we can use, for the user to pick by ear.

    python3 studio/tools/voice_catalog.py

Policy (user, 2026-10-07): audio is free only. Nothing here may cost money:
  - Kokoro-82M (Apache-2.0) and Piper (MIT) run locally on this machine: free and unlimited.
  - Fish Audio S2.1 through OpenRouter's ':free' model: free, 50 requests a day for the whole studio. Before any request
    the model's OpenRouter price is read and the call is refused unless every price field is zero.
  - No other OpenRouter speech model: they are all paid (checked 2026-10-07).
Fish library voices are picked by hand: narration voices only, never a clone of a real person or a game character.

Writes studio/voices/catalog/<engine>/<voice>.mp3 and catalog.json, and one review-queue item per engine (kind "audio").
Episode voices are not touched. The OpenRouter key is read from OPENROUTER_API_KEY, the vault or ~/.config/openrouter/key
and never printed.
"""
import json, os, re, shutil, subprocess, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "studio", "voices", "catalog")
SENTENCE = "The weirdest border on Earth runs straight through a library. Here's how that happened."
FISH_MODEL = "fish-audio/s2.1-pro-free:free"
FISH = {  # Fish Audio public library, narration voices (no celebrity or character clones)
    "8062e83481fe4165a2a92cd753f9c06b": "Felix (Australian male)",
    "933563129e564b19a115bedd57b7406a": "Sarah", "bf322df2096a46f18c579d0baa36f41d": "Adrian",
    "536d3a5e000945adb7038665781a4aca": "Ethan", "c5f56a6cc2ec4fa8920cb4c5889a3fb7": "Slax",
    "c2623f0c075b4492ac367989aee1576f": "Paula", "e3cd384158934cc9a01029cd7d278634": "Laura",
    "f8dfe9c83081432386f143e2fe9767ef": "Book Record (deep narrator)", "79d0bd3e4e5444b18f7b6d89b5927bf1": "Jordan",
    "beb44e5fac1e4b33a15dfcdcc2a9421d": "Sleepless Historian (British)", "1d52151a55eb4878a997bd06e816b5f6": "Alex",
    "e422370a73e4439b8ccc10d58b78819b": "Deep Voice", "9a9cf47702da476aa4629e2506d4a857": "Hannah",
}
PIPER = ["en_US-ryan-high", "en_US-lessac-high", "en_US-joe-medium", "en_US-amy-medium", "en_US-kristin-medium",
         "en_US-norman-medium", "en_US-hfc_male-medium", "en_US-hfc_female-medium", "en_GB-alan-medium",
         "en_GB-cori-high", "en_GB-northern_english_male-medium", "en_GB-jenny_dioco-medium"]
slug = lambda s: re.sub(r"[^A-Za-z0-9._-]+", "_", s).strip("_")


def to_mp3(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-b:a", "96k", dst]).returncode:
        raise RuntimeError("ffmpeg could not read the audio")


def key():
    k = os.environ.get("OPENROUTER_API_KEY")
    if not k:
        try:
            sys.path.insert(0, os.path.join(ROOT, "studio", "tools"))
            from vault import secret
            k = secret("OPENROUTER_API_KEY")
        except BaseException:
            k = None
    p = os.path.expanduser("~/.config/openrouter/key")
    return k or (open(p).read().strip() if os.path.exists(p) else None)


cat = {}
os.makedirs(OUT, exist_ok=True)
tmp = os.path.join(OUT, "_tmp.wav")

# Kokoro (local)
from kokoro_onnx import Kokoro
import soundfile as sf
K = Kokoro(os.path.expanduser("~/.cache/kokoro/kokoro-v1.0.onnx"), os.path.expanduser("~/.cache/kokoro/voices-v1.0.bin"))
for v in sorted(x for x in K.get_voices() if x[:2] in ("af", "am", "bf", "bm")):
    dst = os.path.join(OUT, "kokoro", v + ".mp3")
    if not os.path.exists(dst):
        x, sr = K.create(SENTENCE, voice=v, speed=1.0, lang="en-gb" if v.startswith("b") else "en-us")
        sf.write(tmp, x, sr); to_mp3(tmp, dst)
    label = {"af": "US female", "am": "US male", "bf": "UK female", "bm": "UK male"}[v[:2]]
    cat.setdefault("kokoro", {})[v] = {"file": os.path.relpath(dst, ROOT), "label": f"{v} ({label})", "status": "ok"}
    print("ok kokoro", v)

# Piper (local)
for v in PIPER:
    model = os.path.expanduser(f"~/voices/{v}.onnx")
    dst = os.path.join(OUT, "piper", v + ".mp3")
    if not os.path.exists(model):
        cat.setdefault("piper", {})[v] = {"file": None, "status": "error", "error": "voice not downloaded"}; continue
    if not os.path.exists(dst):
        subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", tmp], input=SENTENCE.encode(), check=True, capture_output=True)
        to_mp3(tmp, dst)
    cat.setdefault("piper", {})[v] = {"file": os.path.relpath(dst, ROOT), "label": v, "status": "ok"}
    print("ok piper", v)

# Fish S2.1 free (OpenRouter), only after confirming the price is zero
req = urllib.request.Request("https://openrouter.ai/api/v1/models?output_modalities=speech", headers={"User-Agent": "studio"})
fm = next((m for m in json.load(urllib.request.urlopen(req, timeout=60))["data"] if m["id"] == FISH_MODEL), None)
free = fm is not None and all(float(v or 0) == 0 for v in fm["pricing"].values())
k = key()
for vid, name in FISH.items():
    dst = os.path.join(OUT, "fish-free", slug(name) + ".mp3")
    row = {"file": None, "label": name, "status": "error"}
    if os.path.exists(dst):
        row.update(file=os.path.relpath(dst, ROOT), status="ok")
    elif not free:
        row["error"] = "skipped: the model is not free on OpenRouter right now"
    elif not k:
        row["error"] = "skipped: no OpenRouter key"
    else:
        try:
            body = json.dumps({"model": FISH_MODEL, "input": SENTENCE, "voice": vid, "response_format": "mp3"}).encode()
            r = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", body, {"Authorization": "Bearer " + k, "Content-Type": "application/json"})
            data = urllib.request.urlopen(r, timeout=120).read()
            open(tmp, "wb").write(data); to_mp3(tmp, dst)
            row.update(file=os.path.relpath(dst, ROOT), status="ok")
        except urllib.error.HTTPError as e:
            row["error"] = f"HTTP {e.code}: {e.read()[:160].decode('utf-8', 'replace')}"
        except Exception as e:
            row["error"] = str(e)[:160]
    cat.setdefault("fish-free", {})[vid] = row
    print(row["status"], "fish", name, row.get("error") or "")
if os.path.exists(tmp):
    os.remove(tmp)
json.dump(cat, open(os.path.join(OUT, "catalog.json"), "w"), indent=1)

# dashboard: one review item per engine
INFO = {"kokoro": ("Kokoro-82M (free, runs locally, unlimited)", "Apache-2.0 open model; what the channels use now (bm_george)."),
        "piper": ("Piper (free, runs locally, unlimited)", "MIT open-source; older and more robotic, but instant."),
        "fish-free": ("Fish Audio S2.1 Free (free via OpenRouter, 50 requests a day)", "The most natural of the three. The daily cap is shared by every channel: about 6-10 paragraphs per video, so roughly 5 videos a day.")}
rq_p = os.path.join(ROOT, "studio", "review_queue.json")
rq = json.load(open(rq_p))
rq["items"] = [i for i in rq["items"] if not i["id"].startswith("voices-")]
items = []
for eng, vs in cat.items():
    files = [[d["label"], d["file"]] for d in vs.values() if d["status"] == "ok"]
    bad = [d["label"] for d in vs.values() if d["status"] != "ok"]
    t, q = INFO[eng]
    items.append({"id": "voices-" + eng, "status": "open", "kind": "audio", "title": f"Free voices · {t} · {len(files)} voices",
                  "question": q + " Same sentence for every voice. Tell me the names you like." + (f" Not made: {', '.join(bad)}." if bad else ""),
                  "files": files})
rq["items"] = items + rq["items"]
json.dump(rq, open(rq_p, "w"), indent=1, ensure_ascii=False)
print("done:", {e: sum(1 for d in vs.values() if d["status"] == "ok") for e, vs in cat.items()})

"""Voice catalogue: one short sentence read by every English voice OpenRouter's speech models offer.

    python3 studio/tools/voice_catalog.py            # generate what's missing, then add the dashboard review items
    python3 studio/tools/voice_catalog.py --dry-run  # list models, voices and the estimated cost, no requests

Writes studio/voices/catalog/<model>/<voice>.mp3 and studio/voices/catalog/catalog.json, and one review-queue item
per model (kind "audio") so every sample plays on the dashboard. Episode voices are not touched.
The key: OPENROUTER_API_KEY (environment), then the vault, then ~/.config/openrouter/key. It is never printed.
"""
import argparse, concurrent.futures as cf, json, os, re, subprocess, sys, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "studio", "voices", "catalog")
SENTENCE = "The weirdest border on Earth runs straight through a library. Here's how that happened."
FISH = {"8062e83481fe4165a2a92cd753f9c06b": "Felix (Australian male; our original pick)"}
ap = argparse.ArgumentParser()
ap.add_argument("--dry-run", action="store_true")
ap.add_argument("--workers", type=int, default=4)
args = ap.parse_args()


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
    if not k and os.path.exists(p):
        k = open(p).read().strip()
    return k


def english(model, voices):
    if model.startswith("fish-audio/"):
        return list(FISH)
    out = []
    for v in voices:
        if re.match(r"(?i)^en[-_]", v) or v.endswith("-en") or v.startswith("English_") or re.match(r"^[ab][fm]_", v):
            out.append(v)
        elif not re.match(r"^[a-z]{2}[-_][A-Za-z]{2}", v) and not re.search(r"-(es|fr|de|it|ja|nl|pt|zh|ko|hi)$", v) \
                and not re.match(r"^(Chinese|Japanese|Korean|Spanish|French|German|Portuguese|Italian|Arabic|Russian|Turkish|Dutch|Vietnamese|Thai|Indonesian|Hindi|Polish|Ukrainian|Romanian|Greek|Czech|Finnish)", v) \
                and not re.match(r"^[a-z][a-z]_", v):
            out.append(v)
    return out or ["(default)"]


req = urllib.request.Request("https://openrouter.ai/api/v1/models?output_modalities=speech", headers={"User-Agent": "studio"})
models = json.load(urllib.request.urlopen(req, timeout=60))["data"]
jobs = []
for m in models:
    vs = english(m["id"], m.get("supported_voices") or [])
    for v in vs:
        jobs.append((m, v))
price = sum(float(m["pricing"].get("prompt") or 0) * len(SENTENCE) for m, _ in jobs)
print(f"{len(models)} speech models, {len(jobs)} English voices, estimated cost ${price:.2f} (prompt price x characters)")
if args.dry_run:
    for m in models:
        n = sum(1 for mm, _ in jobs if mm is m)
        print(f"  {m['id']:42s} {n:3d} voices  ${float(m['pricing'].get('prompt') or 0) * len(SENTENCE) * n:.3f}")
    sys.exit(0)
K = key()
if not K:
    sys.exit("no OpenRouter key: set OPENROUTER_API_KEY, or add it to the vault (studio/tools/vault.py set OPENROUTER_API_KEY)")

slug = lambda s: re.sub(r"[^A-Za-z0-9._-]+", "_", s).strip("_")
cat_p = os.path.join(OUT, "catalog.json")
cat = json.load(open(cat_p)) if os.path.exists(cat_p) else {}


def one(job):
    m, v = job
    path = os.path.join(OUT, slug(m["id"]), slug(v) + ".mp3")
    rel = os.path.relpath(path, ROOT)
    if os.path.exists(path) and os.path.getsize(path) > 2000:
        return m["id"], v, rel, "ok", None
    body = {"model": m["id"], "input": SENTENCE, "response_format": "mp3"}
    if v != "(default)":
        body["voice"] = v
    for attempt in range(3):
        try:
            r = urllib.request.Request("https://openrouter.ai/api/v1/audio/speech", json.dumps(body).encode(),
                                       {"Authorization": "Bearer " + K, "Content-Type": "application/json"})
            data = urllib.request.urlopen(r, timeout=120).read()
            if len(data) < 2000:
                raise ValueError(f"short response ({len(data)} bytes): {data[:120]!r}")
            os.makedirs(os.path.dirname(path), exist_ok=True)
            tmp = path + ".raw"
            open(tmp, "wb").write(data)          # re-encode whatever came back (mp3, wav or pcm-in-container) to a small mp3
            ok = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ac", "1", "-b:a", "96k", path]).returncode == 0
            os.remove(tmp)
            if not ok:
                raise ValueError("ffmpeg could not read the audio")
            return m["id"], v, rel, "ok", None
        except urllib.error.HTTPError as e:
            msg = f"HTTP {e.code}: {e.read()[:200].decode('utf-8', 'replace')}"
            if e.code in (429, 500, 502, 503) and attempt < 2:
                time.sleep(4 * (attempt + 1)); continue
            return m["id"], v, rel, "error", msg
        except Exception as e:
            if attempt < 2:
                time.sleep(3); continue
            return m["id"], v, rel, "error", str(e)[:200]


with cf.ThreadPoolExecutor(args.workers) as ex:
    for mid, v, rel, st, err in ex.map(one, jobs):
        cat.setdefault(mid, {})[v] = {"file": rel if st == "ok" else None, "status": st, "error": err}
        print(f"{st:5s} {mid} {v}" + (f"  {err}" if err else ""))
json.dump(cat, open(cat_p, "w"), indent=1)

# dashboard: one review item per model, every sample with a player
rq_p = os.path.join(ROOT, "studio", "review_queue.json")
rq = json.load(open(rq_p))
rq["items"] = [i for i in rq["items"] if not i["id"].startswith("voices-")]
names = {m["id"]: m for m in models}
items = []
for mid, vs in sorted(cat.items()):
    files = [[(FISH.get(v, v)), d["file"]] for v, d in sorted(vs.items()) if d["status"] == "ok"]
    bad = [v for v, d in vs.items() if d["status"] != "ok"]
    if not files and not bad:
        continue
    m = names.get(mid, {"name": mid, "pricing": {}})
    cost = float(m["pricing"].get("prompt") or 0) * 1000
    items.append({"id": "voices-" + slug(mid), "status": "open", "kind": "audio",
                  "title": f"Voice catalogue · {m['name']} ({len(files)} voices)",
                  "question": f"Same sentence, every English voice. Price: ${cost:.3f} per 1,000 characters (a 60 s script is about 900)."
                              + (f" Failed: {', '.join(bad)}." if bad else "") + " Tell me the ones you like by name.",
                  "files": files})
rq["items"] = items + rq["items"]
json.dump(rq, open(rq_p, "w"), indent=1, ensure_ascii=False)
ok = sum(1 for vs in cat.values() for d in vs.values() if d["status"] == "ok")
print(f"done: {ok} samples; {len(items)} review items")

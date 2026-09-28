#!/usr/bin/env python3
"""The studio machine: one state machine per episode, one gate per stage.

Any agent (or person) runs the same loop:
    python3 studio/studio.py next  <episode>   # what to do now, which playbook, which files
    ...do the work the playbook describes...
    python3 studio/studio.py check <episode>   # run the gate; PASS moves the episode forward

Other commands:
    new <channel> <slug>       create episodes/<channel>/<slug>/ from the channel bible
    status [<episode>]         every episode (or one) with each stage's state, incl. STALE
    bible <channel>            validate a channel bible
    selftest                   run every gate on studio/examples/ (+ deliberate failures)

<episode> is a path to an episode folder, or <channel>/<slug> under episodes/.
Gates are deterministic. They never call a model. They only read the episode's files.
"""
import datetime, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EPISODES = os.path.join(ROOT, "episodes")
sys.path.insert(0, HERE)
from gates import GATES  # noqa: E402

# ---------------------------------------------------------------- stage registry
# who: which kind of worker the stage needs. "human" stages cannot be passed by a model.
STAGES = [
    {"id": "topic",      "sop": "sop/01-topic.md",      "who": "any model drafts; HUMAN approves",   "out": ["topic.json"],                       "in": []},
    {"id": "research",   "sop": "sop/02-research.md",   "who": "model with web access",               "out": ["dossier.json"],                     "in": ["topic.json"]},
    {"id": "script",     "sop": "sop/03-script.md",     "who": "model (strongest for a new series)",  "out": ["script.json"],                      "in": ["topic.json", "dossier.json"]},
    {"id": "voice",      "sop": "sop/04-voice.md",      "who": "tool; model listens via transcripts", "out": ["build/timeline.json"],              "in": ["script.json"]},
    {"id": "storyboard", "sop": "sop/05-storyboard.md", "who": "model, from the scene catalog",       "out": ["storyboard.json"],                  "in": ["script.json", "build/timeline.json"]},
    {"id": "picture",    "sop": "sop/06-picture.md",    "who": "tool renders; model with vision reviews", "out": ["review.json"],                  "in": ["storyboard.json", "build/timeline.json"]},
    {"id": "final",      "sop": "sop/07-final.md",      "who": "tool",                                "out": ["build/final_report.json"],          "in": ["review.json"]},
    {"id": "package",    "sop": "sop/08-package.md",    "who": "model",                               "out": ["package.json"],                     "in": ["build/final_report.json", "dossier.json", "script.json"]},
    {"id": "publish",    "sop": "sop/09-publish.md",    "who": "tool or HUMAN (until upload API is connected)", "out": ["publish.json"],           "in": ["package.json"]},
    {"id": "analytics",  "sop": "sop/10-analytics.md",  "who": "tool or HUMAN, 48 h after publishing", "out": ["analytics.json"],                 "in": ["publish.json"]},
]
SID = [s["id"] for s in STAGES]


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()[:12] if os.path.exists(path) else None


def resolve(ref):
    for cand in (ref, os.path.join(EPISODES, ref), os.path.join(ROOT, ref)):
        if os.path.isdir(cand) and os.path.exists(os.path.join(cand, "episode.json")):
            return os.path.abspath(cand)
    sys.exit(f"no episode at '{ref}' (need a folder containing episode.json)")


def load_state(ep):
    p = os.path.join(ep, "state.json")
    return json.load(open(p)) if os.path.exists(p) else {"stages": {}}


def save_state(ep, st):
    json.dump(st, open(os.path.join(ep, "state.json"), "w"), indent=1)


def stage_state(ep, st, s):
    """passed / STALE / pending. STALE = passed once, but an input or output changed since."""
    rec = st["stages"].get(s["id"])
    if not rec or rec.get("result") != "pass":
        return "pending"
    for f in s["in"] + s["out"]:
        if rec["hashes"].get(f) != sha(os.path.join(ep, f)):
            return "STALE"
    return "passed"


def next_stage(ep, st):
    for s in STAGES:
        if stage_state(ep, st, s) != "passed":
            return s
    return None


def run_gate(ep, stage_id):
    meta = json.load(open(os.path.join(ep, "episode.json")))
    ctx = {"ep": ep, "root": ROOT, "studio": HERE, "meta": meta,
           "bible": json.load(open(os.path.join(HERE, "channels", meta["channel"], "bible.json")))}
    results = GATES[stage_id](ctx)  # list of (ok, message)
    return results


def cmd_check(ref, stage_id=None, quiet=False):
    ep = resolve(ref)
    st = load_state(ep)
    s = next((x for x in STAGES if x["id"] == stage_id), None) if stage_id else next_stage(ep, st)
    if s is None:
        print("all stages passed"); return True
    # upstream must be passed first: gates assume their inputs are sound
    for up in STAGES[:SID.index(s["id"])]:
        if stage_state(ep, st, up) != "passed":
            print(f"BLOCKED  '{s['id']}' needs '{up['id']}' to pass first ({stage_state(ep, st, up)})")
            return False
    res = run_gate(ep, s["id"])
    ok = all(r[0] for r in res)
    if not quiet:
        for good, msg in res:
            print(f"{'PASS' if good else 'FAIL'}  {msg}")
    print(f"\n{s['id'].upper()} GATE: {'PASSED' if ok else 'FAILED'}  ({sum(r[0] for r in res)}/{len(res)} checks)")
    st["stages"][s["id"]] = {"result": "pass" if ok else "fail", "at": now(),
                             "hashes": {f: sha(os.path.join(ep, f)) for f in s["in"] + s["out"]},
                             "failed": [m for g, m in res if not g]}
    save_state(ep, st)
    if ok:
        nxt = next_stage(ep, st)
        print(f"next: {nxt['id']}  →  python3 studio/studio.py next {os.path.relpath(ep, ROOT)}" if nxt else "episode complete")
    return ok


def cmd_next(ref):
    ep = resolve(ref)
    st = load_state(ep)
    s = next_stage(ep, st)
    if not s:
        print("Episode complete. Nothing to do."); return
    rel = os.path.relpath(ep, ROOT)
    state = stage_state(ep, st, s)
    print(f"EPISODE  {rel}\nSTAGE    {s['id']}  ({state})\nWHO      {s['who']}\nREAD     studio/{s['sop']}  (and studio/sop/00-rules.md once per session)")
    print(f"INPUTS   {', '.join(s['in']) or '(none)'}\nOUTPUTS  {', '.join(s['out'])}\nTHEN     python3 studio/studio.py check {rel}")
    rec = st["stages"].get(s["id"])
    if rec and rec.get("failed"):
        print("\nLast check failed on:"); [print("  - " + m) for m in rec["failed"]]
    if state == "STALE":
        print("\nAn input changed after this stage passed. Re-check it; if it fails, redo the stage.")


def cmd_status(ref=None):
    eps = [resolve(ref)] if ref else sorted(
        os.path.dirname(p) for p in (os.path.join(dp, "episode.json") for dp, _, fs in os.walk(EPISODES) if "episode.json" in fs))
    if not eps:
        print("no episodes yet: python3 studio/studio.py new <channel> <slug>"); return
    mark = {"passed": "✓", "pending": "·", "STALE": "!"}
    print(f"{'episode':40} " + " ".join(f"{s[:5]:>5}" for s in SID))
    for ep in eps:
        st = load_state(ep)
        cells = []
        for s in STAGES:
            state = stage_state(ep, st, s)
            if state == "pending" and st["stages"].get(s["id"], {}).get("result") == "fail":
                state = "fail"
            cells.append(f"{mark.get(state, '✗'):>5}")
        print(f"{os.path.relpath(ep, ROOT)[:40]:40} " + " ".join(cells))
    print("\n✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)")


def cmd_new(channel, slug):
    bible_p = os.path.join(HERE, "channels", channel, "bible.json")
    if not os.path.exists(bible_p):
        sys.exit(f"no channel '{channel}'. Channels: {', '.join(sorted(os.listdir(os.path.join(HERE, 'channels'))))}")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        sys.exit("slug: lowercase letters, digits and dashes")
    ep = os.path.join(EPISODES, channel, slug)
    if os.path.exists(ep):
        sys.exit(f"{ep} already exists")
    os.makedirs(os.path.join(ep, "build"))
    os.makedirs(os.path.join(ep, "out"))
    json.dump({"channel": channel, "slug": slug, "created": now()}, open(os.path.join(ep, "episode.json"), "w"), indent=1)
    open(os.path.join(ep, ".gitignore"), "w").write("build/\nout/*.mp4\n")
    print(f"created {os.path.relpath(ep, ROOT)}")
    cmd_next(ep)


def cmd_bible(channel):
    from gates.common import validate, load_catalog
    b = json.load(open(os.path.join(HERE, "channels", channel, "bible.json")))
    errs = validate(b, "bible")
    cat = load_catalog(HERE)
    errs += [f"scene type '{t}' is not in studio/engine/catalog.json" for t in b.get("scene_types", []) if t not in cat]
    errs += [f"weights must cover topic scores exactly" for _ in [0] if set(b.get("topic", {}).get("weights", {})) != {"hook", "surprise", "visual", "sourceability", "timeliness", "series_fit"}]
    for e in errs:
        print("FAIL  " + e)
    print(f"bible {channel}: {'OK' if not errs else f'{len(errs)} problem(s)'}")
    if b.get("open_decisions"):
        print("open decisions:"); [print("  - " + d) for d in b["open_decisions"]]
    return not errs


def cmd_selftest():
    """Every gate against the gold example, then deliberate breakages that must be caught."""
    import shutil, tempfile
    ok_all = True
    for ch in sorted(os.listdir(os.path.join(HERE, "channels"))):
        ok_all &= cmd_bible(ch)
    src = os.path.join(HERE, "examples", "emu-war")
    tmp = tempfile.mkdtemp()
    ep = os.path.join(tmp, "emu-war")
    shutil.copytree(src, ep)
    expected = json.load(open(os.path.join(ep, "expected.json")))
    print("\n== gold example: gate results must match examples/emu-war/expected.json ==")
    for stage, want in expected.items():
        res = run_gate(ep, stage)
        got = "pass" if all(r[0] for r in res) else "fail"
        ok_all &= got == want
        print(f"{'OK  ' if got == want else 'BAD '}  {stage:11} {got} (expected {want})")
        if got != want:
            [print("        " + m) for g, m in res if not g]
    breaks = [
        ("research", "dossier.json", lambda d: d["claims"][0].update(sources=[]), "claim with no source"),
        ("research", "dossier.json", lambda d: d["claims"][0].update(quote=""), "confirmed claim without a supporting quote"),
        ("script", "script.json", lambda d: d["paras"][2].update(claims=[]), "fact line with no claim"),
        ("script", "script.json", lambda d: d["paras"][0].update(say=d["paras"][0]["say"] + " In 1932."), "digits in narration"),
        ("script", "script.json", lambda d: d["paras"][1].update(caps=[["AND LOST.", 3]]), "captions that don't cover the words"),
        ("topic", "topic.json", lambda d: d.update(approved_by=None), "topic not approved by a human"),
        ("research", "dossier.json", lambda d: d["claims"][8].update(label=""), "estimate without its on-screen label"),
        ("storyboard", "storyboard.json", lambda d: d["scenes"][9]["params"].update(qualifier=""), "label of a self-reported number dropped from screen"),
        ("storyboard", "storyboard.json", lambda d: d["scenes"][3]["events"][0].update(at="emus/ostriches"), "cue on a word that is never spoken"),
        ("storyboard", "storyboard.json", lambda d: d["scenes"][1].update(type="explosion"), "scene type not in the catalog"),
        ("voice", "build/timeline.json", lambda d: d["paras"][16].update(wer=0.4, heard="daines did not"), "misread line"),
        ("final", "build/final_report.json", lambda d: d.update(lufs=-19.0), "loudness off target"),
        ("package", "package.json", lambda d: d.update(description="no sources here"), "description without sources"),
    ]
    print("\n== deliberate breakages: each must FAIL ==")
    for stage, f, mutate, what in breaks:
        shutil.rmtree(ep); shutil.copytree(src, ep)
        p = os.path.join(ep, f); d = json.load(open(p)); mutate(d); json.dump(d, open(p, "w"))
        caught = not all(r[0] for r in run_gate(ep, stage))
        ok_all &= caught
        print(f"{'CAUGHT' if caught else 'MISSED'}  {stage}: {what}")
    shutil.rmtree(tmp)
    print(f"\nSELFTEST {'OK' if ok_all else 'FAILED'}")
    return ok_all


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help", "help"):
        print(__doc__); sys.exit(0)
    cmd, rest = a[0], a[1:]
    if cmd == "next": cmd_next(*rest)
    elif cmd == "check": sys.exit(0 if cmd_check(*rest) else 1)
    elif cmd == "status": cmd_status(*rest)
    elif cmd == "new": cmd_new(*rest)
    elif cmd == "bible": sys.exit(0 if cmd_bible(*rest) else 1)
    elif cmd == "selftest": sys.exit(0 if cmd_selftest() else 1)
    else: sys.exit(f"unknown command '{cmd}'\n{__doc__}")

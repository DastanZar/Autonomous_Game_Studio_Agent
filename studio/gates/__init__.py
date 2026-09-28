"""One gate per stage. A gate reads files, never calls a model, and returns [(ok, message), ...]."""
import datetime, glob, json, os, re, subprocess
from urllib.parse import urlparse

from .common import NRM, NUMBER_WORDS, cue_time, load, load_catalog, need, spoken_words, validate

SCORE_KEYS = ["hook", "surprise", "visual", "sourceability", "timeliness", "series_fit"]
STRONG_TYPES = {"primary", "scholarly", "official", "dataset"}


def ok(cond, msg):
    return (bool(cond), msg)


def epath(ctx, rel):
    """Episode-relative path; '@/x' means x relative to the repository root (for shared files)."""
    return os.path.join(ctx["root"], rel[2:]) if rel.startswith("@/") else os.path.join(ctx["ep"], rel)


# ------------------------------------------------------------------ 1. topic
def gate_topic(ctx):
    b, meta = ctx["bible"], ctx["meta"]
    t, res = need(ctx, "topic.json", "topic")
    if t is None:
        return res
    w = b["topic"]["weights"]
    score = sum(t["scores"][k] * w[k] for k in SCORE_KEYS) / sum(w.values())
    series = {s["id"] for s in b["series"]}
    hook_words = len(spoken_words(t["hook"]))
    res += [
        ok(t["channel"] == meta["channel"] and t["slug"] == meta["slug"], "topic.json channel/slug match the episode folder"),
        ok(t["series"] in series, f"series '{t['series']}' exists in the bible ({', '.join(sorted(series))})"),
        ok(hook_words <= b["script"]["hook_max_words"] + 6, f"hook is one short sentence ({hook_words} words)"),
        ok(len(t["twist"].split()) >= 5, "the twist is stated (what makes this surprising)"),
        ok(len(set(urlparse(u).netloc for u in t["candidate_sources"])) >= 2, "at least two candidate sources from different sites"),
        ok(score >= b["topic"]["min_score"], f"weighted score {score:.2f} ≥ channel minimum {b['topic']['min_score']}"),
    ]
    # duplicates: same slug or near-identical hook in this channel's other episodes
    others = []
    root = os.path.join(ctx["root"], "episodes", meta["channel"])
    for p in glob.glob(os.path.join(root, "*", "topic.json")):
        if os.path.dirname(p) != ctx["ep"]:
            others.append(json.load(open(p)))
    hook_set = set(NRM(x) for x in t["hook"].split())
    dup = [o["slug"] for o in others if len(hook_set & set(NRM(x) for x in o["hook"].split())) / max(1, len(hook_set)) > 0.7]
    res.append(ok(not dup, f"not a repeat of another episode in this channel{': ' + ', '.join(dup) if dup else ''}"))
    res.append(ok(bool(t.get("approved_by")), "approved by a human (set approved_by / approved_at; a model must not fill this in)"))
    return res


# ------------------------------------------------------------------ 2. research
def gate_research(ctx):
    d, res = need(ctx, "dossier.json", "dossier")
    if d is None:
        return res
    src = {s["id"]: s for s in d["sources"]}
    banned = [x.lower() for x in ctx["bible"].get("sources", {}).get("banned", [])]
    res.append(ok(len(src) == len(d["sources"]), "source ids are unique"))
    res.append(ok(len({c["id"] for c in d["claims"]}) == len(d["claims"]), "claim ids are unique"))
    for s in d["sources"]:
        host = urlparse(s["url"]).netloc.lower()
        if any(bd in host for bd in banned):
            res.append(ok(False, f"source {s['id']} uses a banned site ({host})"))
    live = 0
    for c in d["claims"]:
        if c["status"] == "rejected":
            continue
        live += 1
        cid = c["id"]
        missing = [s for s in c["sources"] if s not in src]
        if not c["sources"] or missing:
            res.append(ok(False, f"claim {cid}: needs ≥1 source that exists in sources[] (missing: {missing or 'none given'})"))
            continue
        if c["status"] == "confirmed" and len(c.get("quote", "").split()) < 4:
            res.append(ok(False, f"claim {cid}: confirmed claims need the supporting excerpt in 'quote' (copied from the source)"))
        if c["status"] in ("estimate", "framed", "disputed") and not c.get("label"):
            res.append(ok(False, f"claim {cid}: status '{c['status']}' needs an on-screen 'label' (e.g. \"the major's own count\")"))
        if c["key"]:
            types = {src[s]["type"] for s in c["sources"]}
            hosts = {urlparse(src[s]["url"]).netloc for s in c["sources"]}
            if not (types & STRONG_TYPES or len(hosts) >= 2):
                res.append(ok(False, f"claim {cid}: key claims need 2 independent sites or 1 primary/scholarly/official/dataset source"))
    # quotes must actually be in the sources: studio/tools/verify_quotes.py writes build/quote_check.json
    qc = load(ctx, "build/quote_check.json")
    import hashlib
    cur = hashlib.sha1(open(os.path.join(ctx["ep"], "dossier.json"), "rb").read()).hexdigest()[:12]
    if qc is None or qc.get("dossier_sha") != cur:
        res.append(ok(False, "quotes not verified for this version of dossier.json: run python3 studio/tools/verify_quotes.py <episode>"))
    else:
        for cid, r in qc["claims"].items():
            if r["status"] == "NOT_FOUND":
                res.append(ok(False, f"claim {cid}: quote not found in its fetched source(s); copy the exact words or fix the source"))
            elif r["key"] and r["status"] not in ("verified", "partial"):
                res.append(ok(False, f"claim {cid}: key claim with no machine-verified excerpt (all its sources blocked fetching); add an excerpt from a fetchable source"))
        manual = [cid for cid, r in qc["claims"].items() if r["status"] in ("partial", "unverified")]
        res.append(ok(True, f"quotes verified against fetched sources; human spot-check list: {', '.join(manual) or 'none'}"))
    bad = [m for g, m in res if not g]
    res.append(ok(not bad, f"{live} live claims, {len(src)} sources: every claim sourced, quoted and labelled"))
    return res


# ------------------------------------------------------------------ 3. script
def est_duration(sc, wpm):
    words = sum(len(spoken_words(p["say"])) for p in sc["paras"])
    gaps = sum(p.get("gap", sc["gap"]) for p in sc["paras"][:-1])
    return sc["lead_in"] + words / (wpm / 60) + gaps + sc["tail"], words


def gate_script(ctx):
    b, meta = ctx["bible"], ctx["meta"]
    sc, res = need(ctx, "script.json", "script")
    if sc is None:
        return res
    d = load(ctx, "dossier.json") or {"claims": []}
    claims = {c["id"]: c for c in d["claims"]}
    cast = {c["id"] for c in b.get("cast", [])}
    ids = [p["id"] for p in sc["paras"]]
    res.append(ok(len(set(ids)) == len(ids), "paragraph ids are unique"))
    res.append(ok(sc["channel"] == meta["channel"] and sc["episode"] == meta["slug"], "script channel/episode match the folder"))
    first, last = sc["paras"][0], sc["paras"][-1]
    hw = len(spoken_words(first["say"]))
    res.append(ok(first["kind"] == "hook", "first paragraph is the hook"))
    res.append(ok(hw <= b["script"]["hook_max_words"], f"hook is {hw} words (max {b['script']['hook_max_words']})"))
    want = b["script"]["ending"]
    res.append(ok(last["kind"] in ("callback", "cta") or want == "loop",
                  f"last paragraph is a callback (bible ending: {want})"))
    res.append(ok(sc["loop"]["last"] == last["id"] and sc["loop"]["connects_to"] in ids,
                  "loop.last is the final paragraph and loop.connects_to names a real paragraph"))
    dur, words = est_duration(sc, b["format"]["wpm"])
    lo, hi = b["format"]["duration_s"]
    res.append(ok(lo <= dur <= hi, f"estimated runtime {dur:.1f}s for {words} words at {b['format']['wpm']} wpm (target {lo}-{hi}s)"))
    banned = [x.lower() for x in b["script"]["banned_phrases"]]
    burned = b["look"]["captions"]["burned"]
    used = set()
    for p in sc["paras"]:
        pid, say = p["id"], p["say"]
        if re.search(r"\d", say):
            res.append(ok(False, f"{pid}: digits in 'say'; spell numbers as they are spoken"))
        for bp in banned:
            if bp in say.lower():
                res.append(ok(False, f"{pid}: banned phrase '{bp}'"))
        needs_claim = p["kind"] in ("hook", "fact", "quote") or NUMBER_WORDS.search(say)
        if needs_claim and not p["claims"]:
            res.append(ok(False, f"{pid}: kind '{p['kind']}'{' with numbers' if NUMBER_WORDS.search(say) else ''} must cite claim ids from dossier.json"))
        for c in p["claims"]:
            if c not in claims:
                res.append(ok(False, f"{pid}: claim '{c}' is not in dossier.json"))
            elif claims[c]["status"] == "rejected":
                res.append(ok(False, f"{pid}: claim '{c}' was rejected in research"))
            else:
                used.add(c)
        if b["script"].get("speakers_required") and p.get("speaker") not in cast:
            res.append(ok(False, f"{pid}: needs a 'speaker' from the cast ({', '.join(sorted(cast))})"))
        if p.get("speaker") and cast and p["speaker"] not in cast:
            res.append(ok(False, f"{pid}: speaker '{p['speaker']}' is not in the cast"))
        if burned:
            caps = p.get("caps")
            n = len(spoken_words(say))
            if caps is None:
                res.append(ok(False, f"{pid}: burned captions are on for this channel; add 'caps' (or [] for a quote card)"))
            elif caps and sum(c[1] for c in caps) != n:
                res.append(ok(False, f"{pid}: caption chunks cover {sum(c[1] for c in caps)} words but the line has {n}"))
    key_unused = [c["id"] for c in d["claims"] if c["key"] and c["status"] != "rejected" and c["id"] not in used]
    res.append(ok(not key_unused, f"every key claim is used in the script{': unused ' + ', '.join(key_unused) if key_unused else ''}"))
    bad = [m for g, m in res if not g]
    res.append(ok(not bad, f"{len(sc['paras'])} paragraphs checked"))
    return res


# ------------------------------------------------------------------ 4. voice
def gate_voice(ctx):
    b = ctx["bible"]
    sc = load(ctx, "script.json")
    tl = load(ctx, "build/timeline.json")
    if tl is None:
        return [ok(False, "build/timeline.json is missing: run the voice tool (studio/sop/04-voice.md)")]
    res = []
    sids, tids = [p["id"] for p in sc["paras"]], [p["id"] for p in tl["paras"]]
    res.append(ok(sids == tids, "timeline has exactly the script's paragraphs, in order"))
    waive = sc.get("voice_waivers", {})
    for p in tl["paras"]:
        if p["wer"] > b["voice"]["max_wer"]:
            if p["id"] in waive:
                w = waive[p["id"]]
                res.append(ok(True, f"{p['id']}: WER {p['wer']} waived after a listen by {w['listened_by']}: {w['reason']}"))
            else:
                res.append(ok(False, f"{p['id']}: WER {p['wer']} > {b['voice']['max_wer']}; heard \"{p.get('heard', '')}\". Retake or rewrite the line"))
    say = {p["id"]: p["say"] for p in sc["paras"]}
    for p in tl["paras"]:
        if p["id"] in say and [w["w"] for w in p["words"]] != say[p["id"]].split():
            res.append(ok(False, f"{p['id']}: timeline words differ from script text (script edited after voicing?)"))
    lo, hi = b["format"]["duration_s"]
    res.append(ok(lo <= tl["duration"] <= hi, f"voiced runtime {tl['duration']:.1f}s within {lo}-{hi}s"))
    bad = [m for g, m in res if not g]
    res.append(ok(not bad, f"{len(tl['paras'])} paragraphs voiced and aligned"))
    return res


# ------------------------------------------------------------------ 5. storyboard
def gate_storyboard(ctx):
    b = ctx["bible"]
    sb, res = need(ctx, "storyboard.json", "storyboard")
    if sb is None:
        return res
    tl = load(ctx, "build/timeline.json")
    cat = load_catalog(ctx["studio"])
    allowed = set(b["scene_types"])
    mn, mx = b["format"].get("min_scene_s", 0.8), b["format"].get("max_scene_s", 8)
    times = []
    for i, s in enumerate(sb["scenes"]):
        if s["type"] not in cat:
            res.append(ok(False, f"scene {s['id']}: type '{s['type']}' is not in the catalog"))
        elif s["type"] not in allowed:
            res.append(ok(False, f"scene {s['id']}: type '{s['type']}' is not allowed on this channel"))
        if s["type"] == "custom" and not s["params"].get("why"):
            res.append(ok(False, f"scene {s['id']}: custom scenes must say why no catalog type fits"))
        try:
            t0 = cue_time(s["start"], tl)
            t1 = cue_time(s["end"], tl) if s.get("end") else None
            for e in s.get("events", []):
                cue_time(e["at"], tl)
        except ValueError as e:
            res.append(ok(False, f"scene {s['id']}: {e}")); continue
        times.append((s["id"], t0, t1))
    if len(times) == len(sb["scenes"]):
        res.append(ok(times[0][1] <= 0.05, "first scene starts at 0"))
        for (a, t0, t1), nxt in zip(times, times[1:] + [(None, tl["duration"], None)]):
            end = t1 if t1 is not None else nxt[1]
            if end - t0 < mn:
                res.append(ok(False, f"scene {a}: {end - t0:.2f}s is shorter than {mn}s (flicker)"))
            if end - t0 > mx:
                res.append(ok(False, f"scene {a}: {end - t0:.2f}s is longer than {mx}s (pace; split it)"))
            if nxt[1] < t0:
                res.append(ok(False, f"scene {nxt[0]} starts before {a}: scenes must be in time order"))
    # qualified claims (estimates, the source's own count, disputed) must show their label to the viewer
    sc, d = load(ctx, "script.json"), load(ctx, "dossier.json")
    if sc and d:
        claims = {c["id"]: c for c in d["claims"]}
        seen = (json.dumps(sb) + json.dumps(sc)).lower()
        for cid in {c for p in sc["paras"] for c in p["claims"]}:
            c = claims.get(cid)
            if c and c["status"] in ("estimate", "framed", "disputed") and c["label"].lower() not in seen:
                res.append(ok(False, f"claim {cid} is '{c['status']}': its label \"{c['label']}\" must appear in a scene param, caption or line"))
    runtime = tl["duration"]
    custom = sum((nxt[1] - t0) for (a, t0, _), nxt in zip(times, times[1:] + [(None, runtime, None)])
                 if next(s for s in sb["scenes"] if s["id"] == a)["type"] == "custom") if times else 0
    res.append(ok(custom <= 0.2 * runtime, f"custom scenes are {100 * custom / runtime:.0f}% of runtime (max 20%)"))
    bad = [m for g, m in res if not g]
    res.append(ok(not bad, f"{len(sb['scenes'])} scenes, all cues resolve against the spoken timeline"))
    return res


# ------------------------------------------------------------------ 6. picture review
def gate_picture(ctx):
    rv, res = need(ctx, "review.json", "review")
    if rv is None:
        return res
    rounds = rv["rounds"]
    sheets = glob.glob(os.path.join(ctx["ep"], "build", "sheet", "*.png"))
    res.append(ok(sheets, "contact-sheet frames exist in build/sheet/"))
    res.append(ok(len(rounds) >= 2, f"{len(rounds)} review round(s) logged (minimum 2: look, fix, look again)"))
    if rounds:
        last = rounds[-1]
        open_ = [d for d in last["defects"] if not d["fixed"]]
        res.append(ok(not open_, f"last round has no open defects{': ' + '; '.join(d['issue'] for d in open_) if open_ else ''}"))
        sb = load(ctx, "storyboard.json")
        if sb:
            res.append(ok(len(last["frames"]) >= len(sb["scenes"]), f"last round looked at ≥1 frame per scene ({len(last['frames'])} frames, {len(sb['scenes'])} scenes)"))
        if sheets:
            newest = max(os.path.getmtime(p) for p in sheets)
            at = datetime.datetime.strptime(last["at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc).timestamp()
            res.append(ok(at >= newest - 1, "the last review happened after the newest sheet was rendered"))
    return res


# ------------------------------------------------------------------ 7. final
def gate_final(ctx):
    b = ctx["bible"]
    r = load(ctx, "build/final_report.json")
    if r is None:
        return [ok(False, "build/final_report.json is missing: run python3 studio/tools/final_check.py <episode>")]
    f = b["format"]
    mp4 = epath(ctx, r.get("video", ""))
    import hashlib
    cur = hashlib.sha1(open(mp4, "rb").read()).hexdigest()[:12] if os.path.exists(mp4) else None
    tl = load(ctx, "build/timeline.json") or {"duration": 0}
    return [
        ok(cur and cur == r.get("video_sha"), "report describes the current video file"),
        ok(r["width"] == f["width"] and r["height"] == f["height"], f"resolution {r['width']}x{r['height']}"),
        ok(abs(r["fps"] - f["fps"]) < 0.01, f"{r['fps']} fps"),
        ok(abs(r["duration"] - tl["duration"]) < 0.5, f"duration {r['duration']:.2f}s matches the voice timeline {tl['duration']:.2f}s"),
        ok(abs(r["lufs"] + 14) <= 1, f"loudness {r['lufs']:.1f} LUFS (target −14 ±1)"),
        ok(r["true_peak"] <= -1.0, f"true peak {r['true_peak']:.1f} dBTP (max −1)"),
        ok(r.get("wer") is not None and r["wer"] <= 0.03, f"final-mix transcript WER {r.get('wer')} (max 0.03)"),
        ok(r.get("size_mb", 0) < 100, f"file size {r.get('size_mb', 0):.1f} MB"),
    ]


# ------------------------------------------------------------------ 8. package
def gate_package(ctx):
    b = ctx["bible"]
    pk, res = need(ctx, "package.json", "package")
    if pk is None:
        return res
    d = load(ctx, "dossier.json")
    sc = load(ctx, "script.json")
    used = {c for p in sc["paras"] for c in p["claims"]}
    src_ids = {s for c in d["claims"] if c["id"] in used for s in c["sources"]}
    urls = [s["url"] for s in d["sources"] if s["id"] in src_ids]
    missing = [u for u in urls if u not in pk["description"]]
    pub = b["publishing"]
    res += [
        ok(len(pk["title"]) <= pub["title_max"], f"title is {len(pk['title'])} chars (max {pub['title_max']})"),
        ok(len(pk["hashtags"]) <= pub["hashtags_max"], f"{len(pk['hashtags'])} hashtags (max {pub['hashtags_max']})"),
        ok(not missing, f"description lists every source the script relies on{': missing ' + ', '.join(missing) if missing else ''}"),
        ok(pk["made_for_kids"] == pub["made_for_kids"], f"made_for_kids = {pub['made_for_kids']} as the bible says"),
    ]
    for key in ("video", "srt", "thumbnail"):
        res.append(ok(os.path.exists(epath(ctx, pk[key])), f"{key} file exists ({pk[key]})"))
    return res


# ------------------------------------------------------------------ 9-10
def gate_publish(ctx):
    _, res = need(ctx, "publish.json", "publish")
    return res


def gate_analytics(ctx):
    a, res = need(ctx, "analytics.json", "analytics")
    if a is None:
        return res
    perf = os.path.join(ctx["studio"], "knowledge", "performance.jsonl")
    logged = os.path.exists(perf) and any(json.loads(l).get("episode") == ctx["meta"]["slug"] for l in open(perf) if l.strip())
    res.append(ok(bool(a.get("lesson")), "one-line lesson written (what to repeat or avoid)"))
    res.append(ok(logged, "row appended to studio/knowledge/performance.jsonl"))
    return res


GATES = {"topic": gate_topic, "research": gate_research, "script": gate_script, "voice": gate_voice,
         "storyboard": gate_storyboard, "picture": gate_picture, "final": gate_final, "package": gate_package,
         "publish": gate_publish, "analytics": gate_analytics}

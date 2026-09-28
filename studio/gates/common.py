"""Shared helpers for gates. Every gate returns a list of (ok: bool, message: str)."""
import json, os, re

try:
    import jsonschema
except ImportError:  # the gates are useless without schema checks; say how to fix it
    raise SystemExit("pip install jsonschema")

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NRM = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
NUMBER_WORDS = re.compile(r"\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|"
                          r"sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|"
                          r"hundred|thousand|million|billion|trillion|percent|half|twice|dozen)\b", re.I)


def schema(name):
    return json.load(open(os.path.join(HERE, "schemas", f"{name}.schema.json")))


def validate(obj, name):
    v = jsonschema.Draft202012Validator(schema(name))
    return [f"{name}: {'/'.join(map(str, e.absolute_path)) or '(root)'}: {e.message}" for e in v.iter_errors(obj)]


def load(ctx, rel):
    p = os.path.join(ctx["ep"], rel)
    if not os.path.exists(p):
        return None
    try:
        return json.load(open(p))
    except json.JSONDecodeError as e:
        return {"__error__": f"{rel} is not valid JSON: {e}"}


def load_catalog(studio_dir=HERE):
    return json.load(open(os.path.join(studio_dir, "engine", "catalog.json")))["types"]


def need(ctx, rel, name=None):
    """Load an artifact and schema-check it. Returns (obj or None, results)."""
    obj = load(ctx, rel)
    if obj is None:
        return None, [(False, f"{rel} is missing")]
    if "__error__" in obj:
        return None, [(False, obj["__error__"])]
    errs = validate(obj, name) if name else []
    if errs:
        return None, [(False, e) for e in errs[:15]]
    return obj, [(True, f"{rel} matches the {name} schema")] if name else []


def spoken_words(say):
    return [w for w in say.split() if NRM(w)]


CUE_RE = re.compile(r"^([a-z0-9_]+)(?:\.(start|end)|/([a-z0-9']+)(?:#(\d+))?)?([+-]\d+(?:\.\d+)?)?$")


def cue_time(cue, timeline):
    """Resolve a storyboard cue against build/timeline.json. Returns seconds or raises ValueError.
    Forms: '0' | 'para' | 'para.start' | 'para.end' | 'para/word' | 'para/word#2', each with optional +0.3 / -0.2."""
    if cue == "0":
        return 0.0
    m = CUE_RE.match(cue)
    if not m:
        raise ValueError(f"bad cue syntax '{cue}'")
    pid, edge, word, nth, off = m.groups()
    para = next((p for p in timeline["paras"] if p["id"] == pid), None)
    if para is None:
        raise ValueError(f"cue '{cue}': no paragraph '{pid}'")
    if word:
        hits = [w["t"] for w in para["words"] if NRM(w["w"]) == word]
        n = int(nth or 0)
        if len(hits) <= n:
            raise ValueError(f"cue '{cue}': word '{word}'#{n} not spoken in '{pid}' (heard: {' '.join(NRM(w['w']) for w in para['words'])})")
        t = hits[n]
    else:
        t = para["end"] if edge == "end" else para["start"]
    return t + float(off or 0)

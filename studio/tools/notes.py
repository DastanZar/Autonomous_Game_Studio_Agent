"""Per-video discussion files: everything we've said about a video, in one place next to the video.

    python3 studio/tools/notes.py          # (re)build NOTES.md for every video; also run by `studio.py dashboard`

For each video folder (episodes/<ch>/<slug>, shorts/emu-war, videos/root-keys) it writes NOTES.md with:
  1. "Notes": free text that people and agents add by hand. It is kept across rebuilds (everything above the marker line).
  2. "From the chat logs": every turn in docs/log/*.md that mentions the video, copied verbatim.
  3. "Review rounds" (review.json) and "Trial report" excerpts (episodes/<ch>/TRIAL-REPORT.md), when present.
Which words count as "mentions" comes from VIDEOS below, or episode.json "aliases" for new episodes.
"""
import glob, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MARK = "<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->"
VIDEOS = {
    "shorts/emu-war": ("The Great Emu War", ["emu"]),
    "videos/root-keys": ("The Keys to the Internet (Sort Of)", ["keys to the internet", "root-keys", "root keys"]),
}
ALIASES = {  # extra words that mean this episode in conversation
    "baarle-border-houses": ["baarle"],
    "point-roberts": ["point roberts", "point-roberts"],
    "swiss-invades-liechtenstein": ["liechtenstein", "swiss"],
}


def videos():
    out = dict(VIDEOS)
    for ep in sorted(glob.glob(os.path.join(ROOT, "episodes", "*", "*", "episode.json"))):
        d = os.path.dirname(ep); rel = os.path.relpath(d, ROOT)
        meta = json.load(open(ep)); slug = meta["slug"]
        sp = os.path.join(d, "script.json")
        title = json.load(open(sp)).get("working_title", slug) if os.path.exists(sp) else slug
        words = slug.split("-")
        aliases = meta.get("aliases") or ALIASES.get(slug) or [slug, slug.replace("-", " ")] + ([w for w in words if len(w) > 6][:1])
        out[rel] = (title, [a.lower() for a in aliases])
    return out


def log_turns():
    """Messages from every log: (file, user message that prompted it, message). Split on the ### / #### headings."""
    msgs = []
    for f in sorted(glob.glob(os.path.join(ROOT, "docs", "log", "*.md"))):
        last_user = ""
        for m in re.split(r"\n(?=#{3,4} )", open(f).read()):
            m = m.replace("\n---\n", "\n").strip()
            if not m.startswith("###"):
                continue
            if m.startswith("### "):
                last_user = m
            msgs.append((os.path.relpath(f, ROOT), last_user, m))
    return msgs


def build_one(folder, title, keys, turns):
    path = os.path.join(ROOT, folder, "NOTES.md")
    manual = ""
    if os.path.exists(path):
        old = open(path).read()
        manual = old.split(MARK)[0].split("## Notes", 1)[-1].strip() if MARK in old else ""
    hit = lambda t: any(re.search(r"\b" + re.escape(k), t.lower()) for k in keys)
    parts = [f"# {title}: discussion and decisions\n", f"Folder: `{folder}`. Built by `studio/tools/notes.py`.\n",
             "## Notes\n", (manual or "_(add notes about this video here)_") + "\n", MARK + "\n",
             "## From the chat logs\n"]
    found, shown_user = [], None
    for f, user, m in turns:
        if hit(m):
            if user and user != m and user != shown_user:
                found.append(f"_Source: {f}_\n\n{user}")
            found.append(m if m.startswith("### ") else m)
            shown_user = user
    parts += ["\n\n".join(found) + "\n"] if found else ["_No chat turns mention this video yet._\n"]
    rv = os.path.join(ROOT, folder, "review.json")
    if os.path.exists(rv):
        parts.append("\n## Review rounds (review.json)\n")
        for i, r in enumerate(json.load(open(rv)).get("rounds", []), 1):
            parts.append(f"### Round {i}\n```json\n{json.dumps(r, indent=1)[:4000]}\n```\n")
    tr = os.path.join(ROOT, os.path.dirname(folder), "TRIAL-REPORT.md")
    if os.path.exists(tr):
        secs = [s for s in re.split(r"\n(?=#{2,3} )", open(tr).read()) if hit(s)]
        if secs:
            parts.append("\n## Trial report excerpts\n" + "\n\n".join(secs) + "\n")
    open(path, "w").write("\n".join(parts))
    return len(found)


def build_all():
    turns = log_turns()
    return {folder: build_one(folder, t, k, turns) for folder, (t, k) in videos().items() if os.path.isdir(os.path.join(ROOT, folder))}


if __name__ == "__main__":
    for folder, n in build_all().items():
        print(f"{folder}/NOTES.md  ({n} chat messages)")

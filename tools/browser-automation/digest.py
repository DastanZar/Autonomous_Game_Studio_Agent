"""Watchlist digest: the agent reads pages you'd otherwise doomscroll and brings back only what's new.

A watch is a page (a friend's LinkedIn activity, an X list, a subreddit, a blog) plus an optional
focus ("only job changes and launches"). A digest run opens each watch in turn, read-only, scrolls
like a person would, and returns the posts as structured text (author, when, summary, text, link).
Items it has shown you before are recognised and marked as not new.

Text, not screenshots: it is searchable, tiny, and the model can summarise it. The agent still
sees the page (screenshots on capable models) while it reads.

This is personal, low-volume reading in your own logged-in browser, at human pace. It is still
automated access, which some sites' terms (LinkedIn's §8.2, for one) prohibit; keep the watchlist
short and the schedule daily.
"""
import difflib
import hashlib
import json
import os
import re
import time
import uuid
from datetime import datetime, timezone

from pathlib import Path

from pydantic import BaseModel, Field

APP_DIR = Path(os.environ.get("BROWSER_AGENT_HOME") or Path.home() / ".browser-agent")

WATCHES = APP_DIR / "watches.json"
SEEN = APP_DIR / "seen.json"
DIGESTS = APP_DIR / "digests.jsonl"
SETTINGS = APP_DIR / "settings.json"


class Post(BaseModel):
    author: str = Field(description="who posted or did it, as shown")
    when: str = Field(description="when, as shown on the page (e.g. '3h', '2d', 'Oct 3')")
    summary: str = Field(description="one or two plain sentences: what is new here")
    text: str = Field(default="", description="the post's own text, up to ~1500 characters")
    url: str = Field(default="", description="link to the post if visible, else empty")


class Feed(BaseModel):
    items: list[Post] = Field(default_factory=list)
    notes: str = Field(default="", description="anything that stopped you, e.g. logged out or nothing new")


def _read(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def _write(path, data):
    APP_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")


# ---------------------------------------------------------------- watches and settings

def list_watches():
    return _read(WATCHES, [])


def add_watch(name, url, focus="", max_scrolls=5):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    rows = list_watches()
    rows.append({"id": uuid.uuid4().hex[:8], "name": name.strip() or url, "url": url, "focus": focus.strip(),
                 "max_scrolls": max(1, min(int(max_scrolls or 5), 20)), "enabled": True})
    _write(WATCHES, rows)


def update_watch(watch_id, **fields):
    rows = list_watches()
    for r in rows:
        if r["id"] == watch_id:
            r.update({k: v for k, v in fields.items() if k in ("enabled", "name", "focus", "max_scrolls")})
    _write(WATCHES, rows)


def remove_watch(watch_id):
    _write(WATCHES, [r for r in list_watches() if r["id"] != watch_id])


def settings():
    return {"daily_at": "", **_read(SETTINGS, {})}


def save_settings(**fields):
    _write(SETTINGS, {**settings(), **fields})


# ---------------------------------------------------------------- the task the agent gets

def task_for(watch):
    last = _read(SEEN, {}).get(watch["id"], {}).get("last_run")
    since = f"since {last[:16].replace('T', ' ')} UTC" if last else "from roughly the last 7 days"
    focus = f"\nOnly keep items about: {watch['focus']}." if watch.get("focus") else ""
    return f"""Read-only digest. Open {watch['url']} and collect the recent posts and activity {since}.{focus}

How to read:
- This is reading only. Do not like, comment, react, follow, connect, message, share or post anything,
  and do not change any setting.
- First record every item visible at the top of the page before scrolling (the newest items are there).
- Use scroll_feed to move down (at most {watch['max_scrolls']} times). Read what's on screen after each one.
- Keep going while scroll_feed says new content loaded or there's more page below; stop once items are
  older than the period above, or it says you're at the bottom.
- Before finishing, call page_links (e.g. with contains="post" or the site's post-link pattern) to get each
  item's real link instead of clicking it.
- Click "see more" / "…more" on a post only if its text is cut off and the rest matters.
- If you're logged out or blocked, don't try to get around it: report it in notes and finish.

Return every item you found with: author, when (as shown), the post's text COPIED EXACTLY as it appears on
the page (up to ~1500 characters; copy it while it's on screen, never write it from memory), a one or two
sentence summary that uses only facts in that text, and its link. Return an empty list if nothing is new."""


# ---------------------------------------------------------------- remembering what you've seen

def _fingerprint(post):
    if post.get("url"):
        return "u:" + re.sub(r"[?#].*$", "", post["url"].strip().lower())
    body = re.sub(r"\W+", " ", (post.get("author", "") + " " + (post.get("text") or post.get("summary", ""))[:200]).lower())
    return "t:" + hashlib.sha1(body.strip().encode()).hexdigest()[:16]


def _norm(text):
    return re.sub(r"\s+", " ", (text or "")).strip().lower()


def _grams(text, n=4):
    words = re.findall(r"\w+", text.lower())
    return {tuple(words[i:i + n]) for i in range(max(0, len(words) - n + 1))}


_COMMON = set("""a an and the she he they it its this that these those her his their our we you i in on at of for
to with from by also new post posts posted shares shared says said announces announced update today yesterday
note notes nothing no one two""".split())


def verify(post, page_text):
    """Check a post the model returned against the text that was really on the page.

    Sets post["check"] to "verbatim", "corrected" (text replaced by the matching passage on the
    page) or "unverified" (nothing on the page matched). A summary that names things the page
    never mentions is replaced by the start of the real text."""
    corpus = _norm(page_text)
    text = _norm(post.get("text"))
    if not corpus:
        post["check"] = "unverified"
        return post
    grams = _grams(text)
    overlap = len(grams & _grams(corpus)) / len(grams) if grams else 0.0
    if text and (text in corpus or overlap >= 0.8):
        post["check"] = "verbatim"
    else:
        # snap to the closest passage on the page (paragraph-sized chunks)
        chunks = [c.strip() for c in re.split(r"\n\s*\n|\n", page_text) if len(c.strip()) > 20]
        probe = post.get("text") or post.get("summary", "")
        best, score = "", 0.0
        for c in chunks:
            r = difflib.SequenceMatcher(None, probe.lower()[:600], c.lower()[:600]).ratio()
            if r > score:
                best, score = c, r
        if score >= 0.45:
            post["text"], post["check"] = best[:1500], "corrected"
        else:
            post["check"] = "unverified"
    # Names, numbers and capitalised words in the summary must exist on the page.
    claims = {re.sub(r"['’]s$", "", c) for c in re.findall(r"\b(?:[A-Z][\w&.'’-]+|\d[\d,.%]*)", post.get("summary", ""))}
    allowed = corpus + " " + _norm(post.get("author"))
    missing = [c for c in claims if c.lower() not in _COMMON and c.lower().rstrip(".") not in allowed]
    real = re.sub(r"\s+", " ", post.get("text", "")).strip()
    excerpt = real[:220] + ("…" if len(real) > 220 else "")
    if post["check"] == "corrected":
        post["summary"] = excerpt  # the model misread the post, so its summary can't be trusted either
    elif post["check"] == "unverified":
        post["summary"] = "Couldn't verify this against the page; open the link before relying on it. Model's summary: " + post.get("summary", "")
    elif missing:
        post["summary"], post["summary_replaced"] = excerpt, missing[:5]
    return post


def record(watch, feed, page_text=""):
    """Mark which items are new, remember them, and append the run to the digest log."""
    seen = _read(SEEN, {})
    mine = seen.setdefault(watch["id"], {"hashes": [], "last_run": None})
    known = set(mine["hashes"])
    items = []
    for post in feed.items if feed else []:
        d = verify(post.model_dump(), page_text)
        fp = _fingerprint(d)
        d["new"] = fp not in known
        known.add(fp)
        items.append(d)
    mine["hashes"] = list(known)[-2000:]
    mine["last_run"] = datetime.now(timezone.utc).isoformat(timespec="minutes")
    _write(SEEN, seen)
    entry = {"at": time.time(), "watch_id": watch["id"], "watch": watch["name"], "url": watch["url"],
             "items": items, "notes": feed.notes if feed else "no result"}
    APP_DIR.mkdir(parents=True, exist_ok=True)
    with DIGESTS.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def recent(limit=30):
    if not DIGESTS.exists():
        return []
    rows = []
    for line in DIGESTS.read_text(encoding="utf-8").splitlines()[-limit:]:
        try:
            rows.append(json.loads(line))
        except ValueError:
            pass
    return rows[::-1]

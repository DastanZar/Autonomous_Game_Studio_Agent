"""Check that every dossier quote really appears in its sources. Writes build/quote_check.json.

    python3 studio/tools/verify_quotes.py <episode-dir>

For each claim, the 'quote' is split into segments (on ';' and '...', with trailing '(Source)' tags removed).
Each segment of 4+ words is searched for in the text of the claim's sources, fetched once and cached in
build/sources/<id>.txt (HTML is stripped, PDFs go through pdftotext). The comparison ignores case,
punctuation and spacing, so "10 000" matches "10,000" and curly quotes match straight ones.

Per claim:  verified    every segment found
            partial     some found, the rest only in sources that could not be fetched
            unverified  nothing could be checked (all sources blocked); needs a human spot-check
            NOT_FOUND   a source was fetched and a segment is in none of them: likely misquoted or invented
"""
import hashlib, html, json, os, re, shutil, subprocess, sys, tempfile, urllib.request

ep = os.path.abspath(sys.argv[1])
dossier_p = os.path.join(ep, "dossier.json")
d = json.load(open(dossier_p))
cache = os.path.join(ep, "build", "sources")
os.makedirs(cache, exist_ok=True)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
squash = lambda s: re.sub(r"[^a-z0-9]", "", html.unescape(s).lower())


def page_text(src):
    p = os.path.join(cache, src["id"] + ".txt")
    if os.path.exists(p):
        return open(p).read(), "cached"
    try:
        req = urllib.request.Request(src["url"], headers={"User-Agent": UA, "Accept-Language": "en"})
        with urllib.request.urlopen(req, timeout=40) as r:
            body, ctype = r.read(), r.headers.get("Content-Type", "")
    except Exception as e:
        return None, f"fetch failed: {str(e)[:80]}"
    if body[:5] == b"%PDF-" or "pdf" in ctype:
        if not shutil.which("pdftotext"):
            return None, "PDF, but pdftotext is not installed (apt install poppler-utils)"
        with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
            f.write(body); f.flush()
            text = subprocess.run(["pdftotext", f.name, "-"], capture_output=True, text=True).stdout
    else:
        s = body.decode("utf-8", "replace")
        s = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", s)
        s = re.sub(r"(?is)<sup\b.*?</sup>", " ", s)          # wiki footnote markers
        text = re.sub(r"(?s)<[^>]+>", " ", s)
    open(p, "w").write(text)
    return text, "fetched"


def segments(quote):
    parts = re.split(r";|\.\.\.|…", quote)
    out = []
    for part in parts:
        part = re.sub(r"\([^)]*\)\s*$", "", part.strip()).strip(" '\"“”‘’")
        if len(part.split()) >= 4:
            out.append(part)
    return out


srcs = {s["id"]: s for s in d["sources"]}
texts, fetch = {}, {}
for s in d["sources"]:
    t, status = page_text(s)
    texts[s["id"]] = squash(t) if t else None
    fetch[s["id"]] = status
    print(f"source {s['id']:10} {status}")

claims, bad = {}, 0
for c in d["claims"]:
    if c["status"] == "rejected" or not c.get("quote"):
        continue
    segs = []
    for seg in segments(c["quote"]):
        found = [sid for sid in c["sources"] if texts.get(sid) and squash(seg) in texts[sid]]
        blocked = [sid for sid in c["sources"] if texts.get(sid) is None]
        segs.append({"text": seg, "found_in": found, "unfetched": blocked})
    if not segs:
        status = "unverified"
    elif all(s["found_in"] for s in segs):
        status = "verified"
    elif any(not s["found_in"] and not s["unfetched"] for s in segs):
        status = "NOT_FOUND"
    elif any(s["found_in"] for s in segs):
        status = "partial"
    else:
        status = "unverified"
    bad += status == "NOT_FOUND"
    claims[c["id"]] = {"status": status, "key": c["key"], "segments": segs}
    print(f"claim  {c['id']:14} {status}" + ("" if status == "verified" else "   " + "; ".join(
        f"'{s['text'][:50]}' found={s['found_in']} unfetched={s['unfetched']}" for s in segs if not s["found_in"])))

report = {"dossier_sha": hashlib.sha1(open(dossier_p, "rb").read()).hexdigest()[:12], "sources": fetch, "claims": claims}
json.dump(report, open(os.path.join(ep, "build", "quote_check.json"), "w"), indent=1)
print(f"\n{len(claims)} claims checked, {bad} NOT_FOUND")

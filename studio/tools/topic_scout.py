"""Topic scout: what is actually performing on YouTube in a channel's niche, from the Data API.

    python3 studio/tools/topic_scout.py <channel> [--since 2025-06-01] [--max 50]

For each query in the bible's `scout.queries` (or the defaults below) it runs search.list for Shorts (videoDuration
short, order viewCount, English), then videos.list (views, likes, comments, duration) and channels.list (subscribers).
It scores every video by:
  - views,
  - outlier = views / max(subscribers, 1000): a big number on a small channel means the TOPIC carried it, not the
    channel's audience (the signal we want for a new channel),
  - engagement = (likes + comments) / views.
Writes docs/research/topics/<channel>-<date>.json (raw) and .md (top 40 by outlier, with the query that found it).
Quota: search.list = 100 units per query, videos/channels.list = 1 unit per 50 ids; the daily budget is 10,000.
Read-only: uses the channel's OAuth token (youtube.force-ssl scope covers search).
"""
import argparse, datetime, json, os, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from publish import access_token  # noqa: E402

API = "https://www.googleapis.com/youtube/v3/"
DEFAULTS = {
    "why-map": ["weird borders", "border oddity", "exclave enclave", "geography facts shorts", "strange country facts",
                "history facts shorts", "why does this country", "map facts", "the time a country", "weird history"],
    "body-cast": ["human body facts", "body facts shorts", "why do we yawn", "what happens to your body when",
                  "how your stomach works", "brain facts", "organs explained animation", "why do we sneeze",
                  "weird body facts", "biology facts shorts"],
    "ranked": ["countries ranked", "country comparison", "top 10 countries", "countries with the most",
               "flags of the world shorts", "country ranking", "which country has the most", "countries by",
               "richest countries", "world records countries"],
}


def get(path, token, **params):
    url = API + path + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + token})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def iso_dur(s):
    import re
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    return sum(int(x or 0) * k for x, k in zip(m.groups(), (3600, 60, 1))) if m else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("channel")
    ap.add_argument("--since", default=(datetime.date.today() - datetime.timedelta(days=480)).isoformat())
    ap.add_argument("--max", type=int, default=50)
    a = ap.parse_args()
    bible = json.load(open(os.path.join(ROOT, "studio", "channels", a.channel, "bible.json")))
    queries = (bible.get("scout") or {}).get("queries") or DEFAULTS[a.channel]
    tok = access_token(a.channel)
    found = {}
    for q in queries:
        r = get("search", tok, part="snippet", q=q, type="video", videoDuration="short", order="viewCount",
                publishedAfter=a.since + "T00:00:00Z", relevanceLanguage="en", maxResults=a.max)
        for it in r.get("items", []):
            vid = it["id"]["videoId"]
            found.setdefault(vid, {"id": vid, "title": it["snippet"]["title"], "channel": it["snippet"]["channelTitle"],
                                   "channel_id": it["snippet"]["channelId"], "published": it["snippet"]["publishedAt"][:10], "queries": []})
            found[vid]["queries"].append(q)
        print(f"{q!r}: {len(r.get('items', []))} results", file=sys.stderr)
    ids = list(found)
    for i in range(0, len(ids), 50):
        r = get("videos", tok, part="statistics,contentDetails", id=",".join(ids[i:i + 50]))
        for v in r.get("items", []):
            s = v.get("statistics", {})
            found[v["id"]].update(views=int(s.get("viewCount", 0)), likes=int(s.get("likeCount", 0)),
                                  comments=int(s.get("commentCount", 0)), seconds=iso_dur(v["contentDetails"].get("duration")))
    chans = list({v["channel_id"] for v in found.values()})
    subs = {}
    for i in range(0, len(chans), 50):
        r = get("channels", tok, part="statistics", id=",".join(chans[i:i + 50]))
        for c in r.get("items", []):
            subs[c["id"]] = int(c["statistics"].get("subscriberCount", 0) or 0)
    rows = []
    for v in found.values():
        if "views" not in v:
            continue
        v["subs"] = subs.get(v["channel_id"], 0)
        v["outlier"] = round(v["views"] / max(v["subs"], 1000), 2)
        v["engagement"] = round((v["likes"] + v["comments"]) / max(v["views"], 1), 4)
        rows.append(v)
    rows.sort(key=lambda v: -v["outlier"])
    day = datetime.date.today().isoformat()
    out = os.path.join(ROOT, "docs", "research", "topics")
    os.makedirs(out, exist_ok=True)
    json.dump({"channel": a.channel, "since": a.since, "queries": queries, "videos": rows}, open(os.path.join(out, f"{a.channel}-{day}.json"), "w"), indent=1)
    md = [f"# Topic scout: {a.channel}, {day}", "", f"Shorts published since {a.since}, found by {len(queries)} searches, "
          f"{len(rows)} videos. Sorted by outlier = views / subscribers (min 1,000): high means the topic carried the video.", "",
          "| # | Views | Subs | Outlier | Eng. | Sec | Title | Channel | Query |", "|---|---|---|---|---|---|---|---|---|"]
    for i, v in enumerate(rows[:40], 1):
        t = v["title"].replace("|", "/")[:80]
        md.append(f"| {i} | {v['views']:,} | {v['subs']:,} | {v['outlier']} | {v['engagement']:.3f} | {v['seconds']} | {t} | {v['channel'][:24]} | {v['queries'][0]} |")
    open(os.path.join(out, f"{a.channel}-{day}.md"), "w").write("\n".join(md) + "\n")
    print(f"wrote docs/research/topics/{a.channel}-{day}.md ({len(rows)} videos)")


if __name__ == "__main__":
    main()

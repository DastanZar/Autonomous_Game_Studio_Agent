"""Apply the channel setup in studio/channel_setup.json through the YouTube Data API.

    python3 studio/tools/channel_setup.py apply            # description, keywords, language, playlists, home sections
    python3 studio/tools/channel_setup.py sort             # after uploads: put each uploaded Short in its series playlist

What the API can't do (set by hand in Studio, see docs/channel-setup-2026-10.md): profile picture, banner (needs the
image), links, contact email, a Short's related video. Idempotent: playlists are matched by title and not duplicated;
the uploads are matched to episodes by exact title from each package.json. Quota: channels.update 50, playlists.insert
50, channelSections.insert 50, playlistItems.insert 50 units; the daily budget is 10,000.
"""
import glob, json, os, sys, time, urllib.error, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from publish import access_token  # noqa: E402
API = "https://www.googleapis.com/youtube/v3/"


def call(ch, method, path, body=None, tries=5):
    for i in range(tries):
        req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None, method=method,
                                     headers={"Authorization": "Bearer " + access_token(ch), "Content-Type": "application/json"})
        try:
            return json.load(urllib.request.urlopen(req, timeout=60))
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code >= 500 and i < tries - 1:
                time.sleep(2 ** i * 2); continue
            sys.exit(f"{ch}: {method} {path.split('?')[0]} -> HTTP {e.code} {msg}")


def playlists(ch):
    out, tok = {}, ""
    while True:
        d = call(ch, "GET", f"playlists?part=snippet&mine=true&maxResults=50&pageToken={tok}")
        for p in d.get("items", []): out[p["snippet"]["title"]] = p["id"]
        tok = d.get("nextPageToken")
        if not tok: return out


def apply(ch, cfg):
    me = call(ch, "GET", "channels?part=brandingSettings&mine=true")["items"][0]
    b = me.get("brandingSettings", {}); c = b.setdefault("channel", {})
    c.update(description=cfg["description"], keywords=cfg["keywords"], defaultLanguage="en")
    call(ch, "PUT", "channels?part=brandingSettings", {"id": me["id"], "brandingSettings": {"channel": c, **{k: v for k, v in b.items() if k not in ("channel", "hints")}}})
    print(f"{ch}: description, keywords and language set")
    have = playlists(ch); ids = []
    for p in cfg["playlists"]:
        pid = have.get(p["title"])
        if not pid:
            pid = call(ch, "POST", "playlists?part=snippet,status", {"snippet": {"title": p["title"], "description": p["description"], "defaultLanguage": "en"}, "status": {"privacyStatus": "public"}})["id"]
            print(f"{ch}: playlist created: {p['title']}")
        ids.append(pid)
    secs = call(ch, "GET", "channelSections?part=snippet,contentDetails&mine=true").get("items", [])
    have_pl = {pl for s in secs for pl in (s.get("contentDetails", {}) or {}).get("playlists", [])}
    if not any(s["snippet"]["type"] == "popularUploads" for s in secs):
        call(ch, "POST", "channelSections?part=snippet", {"snippet": {"type": "popularUploads", "position": 0}}); print(f"{ch}: home section: popular uploads")
    for i, pid in enumerate(ids):
        if pid not in have_pl:
            call(ch, "POST", "channelSections?part=snippet,contentDetails", {"snippet": {"type": "singlePlaylist", "position": i + 1}, "contentDetails": {"playlists": [pid]}})
            print(f"{ch}: home section for playlist {pid}")


def sort(ch, cfg):
    me = call(ch, "GET", "channels?part=contentDetails&mine=true")["items"][0]
    up = me["contentDetails"]["relatedPlaylists"]["uploads"]; vids, tok = {}, ""
    while True:
        d = call(ch, "GET", f"playlistItems?part=snippet&playlistId={up}&maxResults=50&pageToken={tok}")
        for it in d.get("items", []): vids[it["snippet"]["title"]] = it["snippet"]["resourceId"]["videoId"]
        tok = d.get("nextPageToken")
        if not tok: break
    have, by_series = playlists(ch), {p["series"]: p["title"] for p in cfg["playlists"]}
    for pkgp in glob.glob(os.path.join(ROOT, "episodes", ch, "*", "package.json")):
        d = os.path.dirname(pkgp); pkg = json.load(open(pkgp)); series = json.load(open(os.path.join(d, "topic.json"))).get("series")
        vid, pl = vids.get(pkg["title"]), have.get(by_series.get(series, ""))
        if not vid or not pl: continue
        items = call(ch, "GET", f"playlistItems?part=snippet&playlistId={pl}&videoId={vid}").get("items", [])
        if not items:
            call(ch, "POST", "playlistItems?part=snippet", {"snippet": {"playlistId": pl, "resourceId": {"kind": "youtube#video", "videoId": vid}}})
            print(f"{ch}: added '{pkg['title']}' to {by_series[series]}")


if __name__ == "__main__":
    cfg = json.load(open(os.path.join(ROOT, "studio", "channel_setup.json")))
    for ch in ("why-map", "body-cast", "ranked"):
        (apply if (sys.argv[1:] or ["apply"])[0] == "apply" else sort)(ch, cfg[ch])

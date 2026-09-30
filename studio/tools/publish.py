"""Publish an episode to its YouTube channel with the YouTube Data API v3 (stdlib only).

    python3 studio/tools/publish.py auth <channel>                  # one time per channel, on a machine with a browser
    python3 studio/tools/publish.py upload <episode> [--dry-run]    # upload package.video, captions, write publish.json

Credentials come from the environment only (never the repo, never chat):
    YT_CLIENT_ID, YT_CLIENT_SECRET         the OAuth client (Google Cloud, type "Desktop app")
    YT_REFRESH_TOKEN_<CHANNEL>             one per channel, e.g. YT_REFRESH_TOKEN_WHY_MAP, from `auth`
`auth` opens Google's consent page. Sign in and pick the channel's Brand Account; the refresh token is
printed once in YOUR terminal. Store it as an environment secret.

Upload behaviour:
- The video goes up as private. With package.schedule (RFC 3339), status.publishAt makes it public at that
  time; otherwise it stays private for a human to publish.
- Until the Google Cloud project passes YouTube's API compliance audit, YouTube locks API uploads to private
  whatever this script asks for. publish.json then records "locked_private": true.
- Category 27 (Education). Sets selfDeclaredMadeForKids and containsSyntheticMedia from package.json.
- Captions: package.srt is uploaded as an English caption track. The pinned comment stays manual (the API can
  post a comment but can't pin it).
Quota (June 2026 buckets): videos.insert is 1 unit of a 100/day upload bucket per project; captions.insert
uses the general bucket.
"""
import argparse, datetime, http.server, json, os, secrets, sys, urllib.parse, urllib.request, webbrowser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl"


def env_name(channel):
    return "YT_REFRESH_TOKEN_" + channel.upper().replace("-", "_")


def need(var):
    v = os.environ.get(var)
    if not v:
        sys.exit(f"missing environment variable {var} (see the header of studio/tools/publish.py)")
    return v


def post_form(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode(), method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def cmd_auth(channel):
    cid, secret = need("YT_CLIENT_ID"), need("YT_CLIENT_SECRET")
    state, got = secrets.token_urlsafe(16), {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            got.update({k: v[0] for k, v in q.items()})
            self.send_response(200); self.end_headers()
            self.wfile.write(b"Done. You can close this tab and return to the terminal.")
        def log_message(self, *a):
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), H)
    redirect = f"http://127.0.0.1:{srv.server_port}"
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": cid, "redirect_uri": redirect, "response_type": "code", "scope": SCOPES,
        "access_type": "offline", "prompt": "consent select_account", "state": state})
    print(f"Open this URL, sign in, and choose the Brand Account for '{channel}':\n{url}\n")
    webbrowser.open(url)
    while "code" not in got and "error" not in got:
        srv.handle_request()
    if got.get("state") != state or "code" not in got:
        sys.exit(f"authorisation failed: {got.get('error', 'state mismatch')}")
    tok = post_form(TOKEN_URL, {"code": got["code"], "client_id": cid, "client_secret": secret,
                                "redirect_uri": redirect, "grant_type": "authorization_code"})
    print(f"\nStore this as the environment secret {env_name(channel)} (it is shown only here):\n{tok['refresh_token']}")


def access_token(channel):
    return post_form(TOKEN_URL, {"client_id": need("YT_CLIENT_ID"), "client_secret": need("YT_CLIENT_SECRET"),
                                 "refresh_token": need(env_name(channel)), "grant_type": "refresh_token"})["access_token"]


def resolve(p, ep):
    return os.path.join(ROOT, p[2:]) if p.startswith("@/") else os.path.join(ep, p)


def build_request(ep):
    meta = json.load(open(os.path.join(ep, "episode.json")))
    pkg = json.load(open(os.path.join(ep, "package.json")))
    bible = json.load(open(os.path.join(ROOT, "studio", "channels", meta["channel"], "bible.json")))
    video = resolve(pkg["video"], ep)
    problems = [f"missing file {f}" for f in [video] + ([resolve(pkg["srt"], ep)] if pkg.get("srt") else []) if not os.path.exists(f)]
    tags = [h.lstrip("#") for h in pkg.get("hashtags", [])]
    desc = pkg["description"] + ("\n\n" + " ".join(pkg["hashtags"]) if pkg.get("hashtags") else "")
    if len(pkg["title"]) > bible["publishing"].get("title_max", 100):
        problems.append(f"title is longer than {bible['publishing']['title_max']} characters")
    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": bool(pkg.get("made_for_kids")),
              "containsSyntheticMedia": bool(pkg.get("synthetic_media", {}).get("realistic"))}
    if pkg.get("schedule"):
        status["publishAt"] = pkg["schedule"]
    body = {"snippet": {"title": pkg["title"], "description": desc, "tags": tags, "categoryId": "27",
                        "defaultLanguage": "en", "defaultAudioLanguage": "en"}, "status": status}
    return meta, pkg, video, body, problems


def cmd_upload(ref, dry):
    ep = ref if os.path.isdir(ref) else os.path.join(ROOT, "episodes", ref)
    meta, pkg, video, body, problems = build_request(ep)
    print(json.dumps(body, indent=1))
    if problems:
        sys.exit("NOT UPLOADED:\n  - " + "\n  - ".join(problems))
    if dry:
        print(f"dry run OK: would upload {os.path.relpath(video, ROOT)} ({os.path.getsize(video) // 1024} KB) to {meta['channel']}")
        return
    tok = access_token(meta["channel"])
    # resumable upload: open a session, then send the bytes
    init = urllib.request.Request(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        data=json.dumps(body).encode(), method="POST",
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=UTF-8",
                 "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(os.path.getsize(video))})
    with urllib.request.urlopen(init, timeout=60) as r:
        session = r.headers["Location"]
    with open(video, "rb") as f:
        put = urllib.request.Request(session, data=f.read(), method="PUT", headers={"Content-Type": "video/mp4"})
    with urllib.request.urlopen(put, timeout=600) as r:
        vid = json.load(r)
    url = f"https://www.youtube.com/shorts/{vid['id']}"
    print("uploaded:", url, "status:", vid["status"].get("privacyStatus"))
    if pkg.get("srt"):
        boundary = "studio" + secrets.token_hex(8)
        meta_part = json.dumps({"snippet": {"videoId": vid["id"], "language": "en", "name": "English"}})
        srt = open(resolve(pkg["srt"], ep), "rb").read()
        payload = (f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta_part}\r\n"
                   f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n").encode() + srt + f"\r\n--{boundary}--\r\n".encode()
        cap = urllib.request.Request("https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet",
                                     data=payload, method="POST",
                                     headers={"Authorization": f"Bearer {tok}", "Content-Type": f"multipart/related; boundary={boundary}"})
        with urllib.request.urlopen(cap, timeout=120):
            print("captions uploaded")
    locked = bool(body["status"].get("publishAt")) and vid["status"].get("privacyStatus") == "private" and not vid["status"].get("publishAt")
    rec = {"youtube": {"url": url, "published_at": body["status"].get("publishAt") or "private (publish in YouTube Studio)",
                       "video_id": vid["id"], "privacy": vid["status"].get("privacyStatus"), "locked_private": locked,
                       "uploaded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")},
           "others": []}
    json.dump(rec, open(os.path.join(ep, "publish.json"), "w"), indent=1)
    print("wrote publish.json; pin the comment by hand:", pkg.get("pinned_comment", "(none)"))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("auth"); a.add_argument("channel")
    u = sub.add_parser("upload"); u.add_argument("episode"); u.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    cmd_auth(args.channel) if args.cmd == "auth" else cmd_upload(args.episode, args.dry_run)

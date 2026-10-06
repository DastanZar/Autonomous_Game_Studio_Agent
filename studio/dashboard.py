"""Build docs/dashboard.html: one self-contained status page for the whole studio."""
import html, json, os, re


def _sections(md):
    """Split DECISIONS.md into {heading: body}."""
    out, cur = {}, None
    for line in md.splitlines():
        m = re.match(r"## (.+)", line)
        if m:
            cur = m.group(1).strip(); out[cur] = []
        elif cur:
            out[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in out.items()}


def _inline(s):
    s = html.escape(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return re.sub(r"`(.+?)`", r"<code>\1</code>", s)


def _md_block(body):
    """Render a markdown table or bullet list to HTML (enough for DECISIONS.md)."""
    rows, items = [], []
    for line in body.splitlines():
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if not all(re.fullmatch(r"-+", c) for c in cells):
                rows.append(cells)
        elif line.startswith("- "):
            items.append(line[2:])
    if rows:
        head, rest = rows[0], rows[1:]
        t = "<div class=scroll><table><tr>" + "".join(f"<th>{_inline(c)}</th>" for c in head) + "</tr>"
        t += "".join("<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in r) + "</tr>" for r in rest)
        return t + "</table></div>"
    if items:
        return "<ul>" + "".join(f"<li>{_inline(i)}</li>" for i in items) + "</ul>"
    return f"<p>{_inline(body)}</p>"


def build(root):
    from studio import STAGES, load_state, stage_state, all_episodes, load_backlog
    studio_dir = os.path.join(root, "studio")
    e = html.escape

    # channels
    ch_html = ""
    for ch in sorted(os.listdir(os.path.join(studio_dir, "channels"))):
        b = json.load(open(os.path.join(studio_dir, "channels", ch, "bible.json")))
        mp = os.path.join(studio_dir, "assets", "music", ch, "manifest.json")
        tracks = json.load(open(mp))["tracks"] if os.path.exists(mp) else []
        planned = [t["id"] for t in b.get("audio", {}).get("music", {}).get("tracks", [])] if isinstance(b.get("audio"), dict) else []
        have = {t["id"]: t for t in tracks}
        chips = "".join(
            f"<span class='chip {'ok' if have[t['id']].get('approved') else 'wait'}'>{e(t['id'])}: {'approved' if have[t['id']].get('approved') else 'pending listen'}</span>"
            for t in tracks)
        chips += "".join(f"<span class='chip none'>{e(t)}: not generated</span>" for t in planned if t not in have)
        chips = chips or "<span class='chip none'>no tracks yet</span>"
        dec = "".join(f"<li>{e(d)}</li>" for d in b.get("open_decisions", [])) or "<li>none</li>"
        ch_html += (f"<section class=card><h3>{e(b['name'])}</h3><p class=sub>{e(ch)} · bible {e(b['status'])}</p>"
                    f"<h4>Music</h4><div>{chips}</div>"
                    f"<h4>Open decisions</h4><ul>{dec}</ul></section>")

    # episodes
    mark = {"passed": ("ok", "✓"), "pending": ("wait", "·"), "STALE": ("stale", "!"), "fail": ("bad", "✗")}
    ep_rows = ""
    for ep in all_episodes():
        st = load_state(ep)
        cells = ""
        for s in STAGES:
            state = stage_state(ep, st, s)
            if state == "pending" and st["stages"].get(s["id"], {}).get("result") == "fail":
                state = "fail"
            cls, sym = mark[state]
            cells += f"<td class='st {cls}' title='{e(s['id'])}: {state}'>{sym}</td>"
        ep_rows += f"<tr><td class=name>{e(os.path.relpath(ep, os.path.join(root, 'episodes')))}</td>{cells}</tr>"
    if not ep_rows:
        ep_rows = f"<tr><td colspan={len(STAGES)+1}>no episodes yet</td></tr>"
    head = "".join(f"<th class=rot><span>{e(s['id'])}</span></th>" for s in STAGES)

    # backlog by who
    groups = {}
    for t in load_backlog():
        if t["status"] in ("todo", "doing", "blocked"):
            groups.setdefault(t["who"], []).append(t)
    bl = ""
    for who in ("model", "human", "laptop"):
        items = groups.pop(who, [])
        if items:
            bl += f"<h4>{e(who)} ({len(items)})</h4><ul>" + "".join(
                f"<li><code>{e(t['id'])}</code> {e(t['title'])} <span class='chip {'bad' if t['status']=='blocked' else 'wait'}'>{e(t['status'])}</span></li>" for t in items) + "</ul>"
    for who, items in groups.items():
        bl += f"<h4>{e(who)}</h4><ul>" + "".join(f"<li><code>{e(t['id'])}</code> {e(t['title'])}</li>" for t in items) + "</ul>"
    done = sum(1 for t in load_backlog() if t["status"] == "done")

    # decisions
    dm = os.path.join(root, "docs", "DECISIONS.md")
    sec = _sections(open(dm).read()) if os.path.exists(dm) else {}
    op = next((k for k in sec if k.startswith("Open decisions")), None)
    bk = next((k for k in sec if k.startswith("Blocked")), None)
    dec_html = "".join(f"<h4>{e(k)}</h4>{_md_block(sec[k])}" for k in (op, bk) if k)

    # summary first: what needs the user, what the models are on
    backlog = load_backlog()
    needs = [t for t in backlog if t["status"] in ("todo", "doing", "blocked") and t["who"] in ("human", "laptop")]
    pending_music = sum(1 for ch in os.listdir(os.path.join(studio_dir, "channels"))
                        for t in (json.load(open(os.path.join(studio_dir, "assets", "music", ch, "manifest.json")))["tracks"]
                                  if os.path.exists(os.path.join(studio_dir, "assets", "music", ch, "manifest.json")) else [])
                        if not t.get("approved"))
    model_open = sum(1 for t in backlog if t["status"] in ("todo", "doing") and t["who"] == "model")
    done_list = "".join(f"<li><code>{e(t['id'])}</code> {e(t['title'])}</li>" for t in backlog if t["status"] == "done") or "<li>nothing yet</li>"
    you = "".join(f"<li><span class='chip {'bad' if t['who']=='laptop' else 'wait'}'>{e(t['who'])}</span> {e(t['title'])}</li>" for t in needs)
    import datetime
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    tiles = (f"<div class=tiles><div class=tile><b>{len(needs)}</b><span>need you or the laptop</span></div>"
             f"<div class=tile><b>{pending_music}</b><span>music tracks to listen to</span></div>"
             f"<div class=tile><b>{model_open}</b><span>jobs a model can do now</span></div>"
             f"<div class=tile><b>{len(all_episodes())}</b><span>episodes in the pipeline</span></div></div>")

    # media library: every finished or partial output, playable on the site (files are copied to _site/media/ by the workflow)
    import glob
    GH = "https://github.com/DastanZar/Autonomous_Game_Studio_Agent/blob/main/"
    def media_card(folder, title, channel, script_paras):
        out = os.path.join(root, folder, "out")
        rel = lambda f: "media/" + os.path.relpath(f, root).replace(os.sep, "/")
        vids = sorted(glob.glob(os.path.join(out, "*.mp4")))
        thumb = os.path.join(out, "thumbnail.jpg")
        srts = sorted(glob.glob(os.path.join(out, "*.srt")))
        poster = f" poster='{rel(thumb)}'" if os.path.exists(thumb) else ""
        if vids:
            player = f"<video controls preload='none' playsinline{poster} src='{rel(vids[0])}'></video>"
        elif os.path.exists(thumb):
            player = f"<img alt='thumbnail' src='{rel(thumb)}'><p class=sub>No final video yet.</p>"
        else:
            player = "<p class=sub>No video or thumbnail yet.</p>"
        script = "".join(f"<p>{e(x)}</p>" for x in script_paras) or "<p class=sub>no script file</p>"
        links = " · ".join([f"<a href='{GH}{folder}'>folder</a>"] + [f"<a href='{rel(x)}'>{e(os.path.basename(x))}</a>" for x in vids + srts])
        return (f"<section class='card media'><h3>{e(title)}</h3><p class=sub>{e(channel)}</p>{player}"
                f"<details><summary>Script</summary>{script}</details><p class=sub>{links}</p></section>")
    cards = []
    for ep in all_episodes():
        rp = os.path.relpath(ep, root)
        sc = json.load(open(os.path.join(ep, "script.json"))) if os.path.exists(os.path.join(ep, "script.json")) else {}
        tp = json.load(open(os.path.join(ep, "topic.json"))) if os.path.exists(os.path.join(ep, "topic.json")) else {}
        title = sc.get("working_title") or tp.get("working_title") or os.path.basename(ep)
        ch = json.load(open(os.path.join(ep, "episode.json")))["channel"]
        chname = json.load(open(os.path.join(studio_dir, "channels", ch, "bible.json"))).get("name", ch)
        cards.append(media_card(rp, title, chname, [p.get("say", "") for p in sc.get("paras", [])]))
    for folder, title, label in [("shorts/emu-war", "The Great Emu War", "Pilot Short (before the channels)"),
                                 ("videos/root-keys", "The Keys to the Internet (Sort Of)", "Pilot long-form 5:40 (video file not in the repo)")]:
        if os.path.isdir(os.path.join(root, folder)):
            sp = os.path.join(root, folder, "script.json")
            sc = json.load(open(sp)) if os.path.exists(sp) else {}
            paras = sc.get("paras") or sc.get("lines") or []
            cards.append(media_card(folder, title, label, [p.get("say") or p.get("text", "") for p in paras if isinstance(p, dict)]))
    media_html = "".join(cards)
    logs = sorted(glob.glob(os.path.join(root, "docs", "log", "*.md")))
    logs_html = "".join(f"<li><a href='{GH}{os.path.relpath(l, root)}'>{e(os.path.basename(l))}</a></li>" for l in logs) or "<li>none</li>"

    vp = os.path.join(studio_dir, "vault.enc.json")
    vnames = sorted(json.load(open(vp)).get("secrets", {})) if os.path.exists(vp) else []
    vault_html = "".join(f"<span class='chip ok'>{e(n)}</span>" for n in vnames) or "<span class='chip none'>empty</span>"
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Studio Control Room</title>
<link rel=preconnect href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Anton&display=swap" rel=stylesheet>
<style>
/* one column of status sections, summary first; chips carry state */
:root{{--bg:#f4f2ec;--fg:#1f1c16;--card:#fffdf8;--mut:#6b665c;--line:#e2ddd1;--ok:#1f7a45;--wait:#8a6200;--bad:#b3261e;--stale:#b35a00;--accent:#c8452d;
--display:'Anton',Impact,'Arial Narrow',sans-serif;--body:'DM Sans',system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#17150f;--fg:#efebe1;--card:#221f18;--mut:#a09a8c;--line:#3a352a;--ok:#5fcf8b;--wait:#e6c35c;--bad:#ff8a80;--stale:#ffb066;--accent:#ff7a5c;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#17150f;--fg:#efebe1;--card:#221f18;--mut:#a09a8c;--line:#3a352a;--ok:#5fcf8b;--wait:#e6c35c;--bad:#ff8a80;--stale:#ffb066;--accent:#ff7a5c;color-scheme:dark}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 var(--body)}}
.wrap{{max-width:1000px;margin-inline:auto;padding-inline:16px;padding-block:20px 48px;display:flex;flex-direction:column;gap:8px}}
h1{{font-family:var(--display);font-weight:400;font-size:clamp(34px,7vw,52px);letter-spacing:.01em;margin:0;line-height:1.05;text-wrap:balance}}
h1 em{{font-style:normal;color:var(--accent)}}
h2{{font-family:var(--display);font-weight:400;letter-spacing:.02em;font-size:26px;margin:1.4em 0 .2em;border-bottom:1px solid var(--line);padding-bottom:.2em}}
h3{{margin:0;font-size:18px}}h4{{margin:1em 0 .3em;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}}
.sub{{color:var(--mut);margin:.1em 0}}.grid{{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}}.grid>*{{min-width:0}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px}}
.tiles{{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:12px}}
.tile{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;display:flex;flex-direction:column}}
.tile b{{font-family:var(--display);font-weight:400;font-size:40px;line-height:1;font-variant-numeric:tabular-nums}}.tile span{{color:var(--mut);font-size:14px}}
.you{{background:var(--card);border:2px solid var(--accent);border-radius:8px;padding:12px 14px}}.you ul{{list-style:none;padding:0}}.you li{{padding:4px 0}}
.chip{{display:inline-block;font-size:13px;padding:1px 8px;border-radius:99px;border:1px solid currentColor;margin:2px 4px 2px 0}}
.ok{{color:var(--ok)}}.wait{{color:var(--wait)}}.bad{{color:var(--bad)}}.stale{{color:var(--stale)}}.none{{color:var(--mut)}}
.scroll{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}}
td.st{{text-align:center;font-weight:700}}td.name{{white-space:nowrap}}th.rot{{height:78px;vertical-align:bottom;padding:0 2px}}th.rot span{{writing-mode:vertical-rl;transform:rotate(180deg);font-weight:600;font-size:12px}}
video,.media img{{width:100%;max-width:100%;aspect-ratio:9/16;object-fit:cover;background:#000;border-radius:6px;display:block}}details{{margin:.4em 0}}summary{{cursor:pointer;font-weight:600}}.media p{{margin:.3em 0}}
code{{font-size:13px;background:var(--line);padding:0 4px;border-radius:4px;overflow-wrap:anywhere}}ul{{padding-left:20px;margin:.3em 0}}
</style></head><body>
<div class=wrap>
<h1>Studio <em>Control Room</em></h1><p class=sub>Three Shorts channels · updated {stamp} · rebuilt automatically on every push to <code>main</code></p>
{tiles}
<h2>Needs you</h2><div class=you><ul>{you or '<li>Nothing is waiting on you.</li>'}</ul></div>
<h2>Channels</h2><div class=grid>{ch_html}</div>
<h2>Episodes</h2><div class=scroll><table><tr><th>episode</th>{head}</tr>{ep_rows}</table></div>
<p class=sub>✓ passed · pending · ✗ failed · ! stale (an input changed after it passed)</p>
<h2>Backlog</h2><p class=sub>Open work by who can do it:</p>{bl}
<h4>Done ({done})</h4><ul>{done_list}</ul>
<h2>Media library</h2><p class=sub>Every video, thumbnail and script, from every session. Click a video to play.</p><div class=grid>{media_html}</div>
<h2>Chat logs</h2><p class=sub>Every session appends its conversation here; nothing lives only in one chat.</p><ul>{logs_html}</ul>
<h2>Keys in the vault</h2><p class=sub>Encrypted in <code>studio/vault.enc.json</code>; one password (<code>STUDIO_VAULT_KEY</code>) unlocks all. Values are never shown here.</p><div>{vault_html}</div>
<h2>Decisions</h2>{dec_html}
</div>
</body></html>"""
    out = os.path.join(root, "docs", "dashboard.html")
    open(out, "w").write(page)
    return os.path.relpath(out, root)

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

    page = f"""<!doctype html><html lang=en><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>Studio dashboard</title>
<link rel=preconnect href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel=stylesheet>
<style>
:root{{--bg:#f6f4ef;--fg:#1d1b18;--card:#fff;--mut:#6b665e;--line:#e2ddd3;--ok:#1f7a45;--wait:#8a6d00;--bad:#b3261e;--stale:#b35a00}}
@media(prefers-color-scheme:dark){{:root{{--bg:#16150f;--fg:#efece4;--card:#211f18;--mut:#9d978a;--line:#39352b;--ok:#5fcf8b;--wait:#e0c060;--bad:#ff8a80;--stale:#ffb066}}}}
*{{box-sizing:border-box}}body{{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:16px/1.45 'DM Sans',system-ui,sans-serif;max-width:1000px;margin-inline:auto}}
h1{{margin:.2em 0}}h2{{margin-top:1.8em;border-bottom:1px solid var(--line);padding-bottom:.2em}}h3{{margin:0}}h4{{margin:1em 0 .3em}}
.sub{{color:var(--mut);margin:.1em 0}}.grid{{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}}
.chip{{display:inline-block;font-size:13px;padding:1px 8px;border-radius:99px;border:1px solid currentColor;margin:2px 4px 2px 0}}
.ok{{color:var(--ok)}}.wait{{color:var(--wait)}}.bad{{color:var(--bad)}}.stale{{color:var(--stale)}}.none{{color:var(--mut)}}
.scroll{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}}
td.st{{text-align:center;font-weight:700}}td.name{{white-space:nowrap}}th.rot{{height:70px;vertical-align:bottom;padding:0 2px}}th.rot span{{writing-mode:vertical-rl;transform:rotate(180deg);font-weight:600;font-size:12px}}
code{{font-size:13px;background:var(--line);padding:0 4px;border-radius:4px}}ul{{padding-left:20px;margin:.3em 0}}
</style></head><body>
<h1>Studio dashboard</h1><p class=sub>Generated by <code>python3 studio/studio.py dashboard</code>. Regenerate after every change.</p>
<h2>Channels</h2><div class=grid>{ch_html}</div>
<h2>Episodes</h2><div class=scroll><table><tr><th>episode</th>{head}</tr>{ep_rows}</table></div>
<p class=sub>✓ passed · pending · ✗ failed · ! stale (an input changed after it passed)</p>
<h2>Backlog</h2><p class=sub>{done} done. Open work by who can do it:</p>{bl}
<h2>Decisions</h2>{dec_html}
</body></html>"""
    out = os.path.join(root, "docs", "dashboard.html")
    open(out, "w").write(page)
    return os.path.relpath(out, root)

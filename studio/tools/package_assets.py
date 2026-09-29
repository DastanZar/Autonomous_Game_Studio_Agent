#!/usr/bin/env python3
"""Build out/<slug>.srt and out/thumbnail.jpg for the package stage.

    python3 studio/tools/package_assets.py episodes/<ch>/<slug> [--thumb-at SECONDS]

SRT: one cue per caption chunk in script.json `caps` ([text, n_words]); a chunk starts on its first
spoken word (build/timeline.json) and ends where the next chunk starts, or at the paragraph end.
Thumbnail: the storyboard frame at rest, at the end of the first paragraph by default (frame 0 is
still animating in). Needs node, plus Pillow or ffmpeg for the JPEG.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def ts(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def build_srt(script, timeline):
    tl = {p["id"]: p for p in timeline["paras"]}
    cues = []
    for para in script["paras"]:
        tp = tl[para["id"]]
        words, i = tp["words"], 0
        chunks = []
        for text, n in para["caps"]:
            if i >= len(words):
                break
            chunks.append([text, words[i]["t"]])
            i += n
        for k, (text, start) in enumerate(chunks):
            end = chunks[k + 1][1] if k + 1 < len(chunks) else tp["end"]
            cues.append((start, max(end, start + 0.3), text))
    return "".join(f"{n}\n{ts(a)} --> {ts(b)}\n{text}\n\n" for n, (a, b, text) in enumerate(cues, 1)), len(cues)


def main(argv):
    if not argv:
        sys.exit(__doc__)
    ep = os.path.abspath(argv[0])
    script = json.load(open(os.path.join(ep, "script.json")))
    timeline = json.load(open(os.path.join(ep, "build", "timeline.json")))
    out = os.path.join(ep, "out")
    os.makedirs(out, exist_ok=True)
    srt, n = build_srt(script, timeline)
    srt_path = os.path.join(out, script["episode"] + ".srt")
    open(srt_path, "w").write(srt)
    print(f"{os.path.relpath(srt_path, ROOT)}: {n} cues")

    at = float(argv[argv.index("--thumb-at") + 1]) if "--thumb-at" in argv else \
        timeline["paras"][0]["end"]
    subprocess.run(["node", os.path.join(ROOT, "studio/engine/render.mjs"), ep, "frames", f"{at:g}"],
                   check=True, stdout=subprocess.DEVNULL)
    png = os.path.join(ep, "build/sheet", f"t{at:06.2f}.png")
    if not os.path.exists(png):
        sys.exit(f"expected frame {png} was not written")
    jpg = os.path.join(out, "thumbnail.jpg")
    try:
        from PIL import Image
        Image.open(png).convert("RGB").save(jpg, quality=92)
    except ImportError:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", png, "-q:v", "2", jpg], check=True)
    print(f"{os.path.relpath(jpg, ROOT)}: frame at {at:.2f}s")


if __name__ == "__main__":
    main(sys.argv[1:])

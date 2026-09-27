# Step 6: Encode, then grade

## 6.1 Create `shorts/emu-war/tools/encode.sh`

It runs a two-pass x264 encode at 4.8 Mbps, loudness-normalises to −14 LUFS, and writes the SRT
captions and a thumbnail.

```bash
#!/usr/bin/env bash
# Frames + mix -> out/great-emu-war.mp4 (two-pass x264 4.8 Mbps, loudnorm -14 LUFS), .srt and thumbnail.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
mkdir -p out
(cd build && $FF -y -loglevel error -framerate 24 -i frames/%05d.jpg -c:v libx264 -preset slow -b:v 4800k -pass 1 -passlogfile x264 -pix_fmt yuv420p -an -f mp4 /dev/null)
(cd build && $FF -y -loglevel error -framerate 24 -i frames/%05d.jpg -i mix.wav -c:v libx264 -preset slow -b:v 4800k -maxrate 7M -bufsize 10M -pass 2 -passlogfile x264 -pix_fmt yuv420p -profile:v high \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest ../out/great-emu-war.mp4)
$FF -y -loglevel error -ss 1.2 -i out/great-emu-war.mp4 -frames:v 1 -q:v 3 out/thumbnail.jpg
python3 - <<'PY'
import json
d=json.load(open('build/timeline.json'))
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:02}:{m:02}:{int(s):02},{int(round((s%1)*1000)):03}"
out=[]; i=1
for c in d['caps']:
    out.append(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n"); i+=1
q=next(l for l in d['lines'] if l['id']=='quote')
out.append(f"{i}\n{ts(q['start'])} --> {ts(q['end'])}\n\"They can face machine guns with the invulnerability of tanks.\"\n")
open('out/great-emu-war.srt','w').write("\n".join(out))
PY
ls -la out
```

## 6.2 Create `shorts/emu-war/tools/verify.py`

The grader. It checks exact checksums first; for any frame that isn't byte-identical, it measures
visual similarity (PSNR) against the reference frame.

```python
"""Grade a rebuild against the reference: exact checksums first, then visual similarity (PSNR).

Usage: python3 tools/verify.py <path-to-golden-dir>
"""
import hashlib, json, os, subprocess, sys
import numpy as np
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
G = sys.argv[1]
ref = json.load(open(os.path.join(G, "reference.json")))
FF = imageio_ffmpeg.get_ffmpeg_exe()
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest() if os.path.exists(p) else "MISSING"


def pixels(p):
    raw = subprocess.run([FF, "-loglevel", "error", "-i", p, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).astype(np.float64)


score, total = 0, 0
def check(name, ok, detail=""):
    global score, total
    total += 1; score += bool(ok)
    print(f"{'PASS' if ok else 'FAIL'}  {name}  {detail}")

for f in ("timeline.json", "vo.wav", "cues.json", "mix.wav"):
    check(f, md5(os.path.join(B, f)) == ref[f], "(exact md5)")
n = len(os.listdir(os.path.join(B, "frames"))) if os.path.isdir(os.path.join(B, "frames")) else 0
check("frame count", n == ref["frame_count"], f"{n} vs {ref['frame_count']}")
worst = 99.0
for i, h in ref["frames"].items():
    p = os.path.join(B, "frames", f"{int(i):05d}.jpg")
    if md5(p) == h:
        check(f"frame {i}", True, "(identical)"); continue
    if not os.path.exists(p):
        check(f"frame {i}", False, "missing"); continue
    a, b = pixels(p), pixels(os.path.join(G, "frames", f"{int(i):05d}.jpg"))
    mse = np.mean((a - b) ** 2) if a.shape == b.shape else 1e9
    psnr = 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
    worst = min(worst, psnr)
    check(f"frame {i}", psnr >= 40, f"(not identical; PSNR {psnr:.1f} dB — >=40 looks the same)")
mp4 = os.path.join(ROOT, "out", "great-emu-war.mp4")
if os.path.exists(mp4):
    info = subprocess.run([FF, "-hide_banner", "-i", mp4], capture_output=True, text=True).stderr
    check("mp4 1080x1920 24fps", "1080x1920" in info and "24 fps" in info)
    check("mp4 duration 00:00:46.04", "Duration: 00:00:46.04" in info)
else:
    check("mp4 exists", False)
print(f"\nSCORE {score}/{total}" + (f"   (worst frame PSNR {worst:.1f} dB)" if worst < 99 else ""))
```

## 6.3 Run both

```bash
bash shorts/emu-war/tools/encode.sh
cd shorts/emu-war && python3 tools/verify.py ../../recipes/emu-war/golden && cd ../..
```
**Checkpoint:** `out/` lists `great-emu-war.mp4` (about 28 MB), `great-emu-war.srt` and
`thumbnail.jpg`. The grader ends with:
```
SCORE 29/29
```
It may add `(worst frame PSNR 6x.x dB)`. That's normal: a handful of frames can differ invisibly
(Chromium's renderer isn't perfectly repeatable). Anything above 40 dB looks the same.

## 6.4 Report

Paste the grader's full output. If any line says `FAIL`, also say which step's checkpoint first
failed to match.

How to read a partial score:
- **`frame N (not identical; PSNR ≥ 40)`** passes: it looks the same, usually because of a different
  Chromium version.
- **A `vo.wav` / `timeline.json` mismatch** means step 3 wasn't followed (the saved takes or timeline
  weren't used).
- **A `mix.wav` mismatch with `cues.json` passing** means `audio.py` wasn't copied exactly, or numpy
  or scipy is a different version.
- **A `cues.json` mismatch** means `emu.js` differs, or the timeline does.

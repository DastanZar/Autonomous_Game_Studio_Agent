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

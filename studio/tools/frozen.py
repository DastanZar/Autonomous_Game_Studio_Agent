"""Frozen-time: how much of a video is a near-still screen (quality bar: <=1s per 30s, no hold > 0.6s).
Film grain registers as change, so the signal is measured after a median blur that removes it (pass a threshold to override)."""
import re, subprocess, sys
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
TH = float(sys.argv[2]) if len(sys.argv) > 2 else 0.35
vf = ("fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,"
      "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-")
out = subprocess.run([FF, "-i", sys.argv[1], "-vf", vf, "-f", "null", "-"], capture_output=True, text=True).stdout
v = [float(m.group(1)) for m in re.finditer(r"YAVG=([0-9.]+)", out)]
still = [x < TH for x in v]
best = cur = 0
for s in still:
    cur = cur + 1 if s else 0
    best = max(best, cur)
d = len(v) / 10
print(f"{sys.argv[1]}\n  {d:.1f}s  still {sum(still) / 10:.1f}s = {sum(still) / 10 / d * 30:.2f}s per 30s  longest hold {best / 10:.1f}s"
      f"  (median YAVG {sorted(v)[len(v) // 2]:.2f})")

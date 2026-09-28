"""Measure the finished video and write build/final_report.json for the 'final' gate.

    python3 studio/tools/final_check.py <episode-dir> [video]    (default video: out/<slug>.mp4; '@/path' = repo-relative)

Measures: resolution, fps, duration (ffmpeg), integrated loudness and true peak (EBU R128),
and word error rate of a Whisper transcript of the final mix against script.json.
Needs: pip install imageio-ffmpeg faster-whisper jiwer numpy   (model: STUDIO_WHISPER, default small.en)
"""
import hashlib, json, os, re, subprocess, sys

import imageio_ffmpeg
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textnorm import wer as text_wer  # noqa: E402

FF = imageio_ffmpeg.get_ffmpeg_exe()
ep = os.path.abspath(sys.argv[1])
meta = json.load(open(os.path.join(ep, "episode.json")))
video_rel = sys.argv[2] if len(sys.argv) > 2 else f"out/{meta['slug']}.mp4"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
video = os.path.join(ROOT, video_rel[2:]) if video_rel.startswith("@/") else os.path.join(ep, video_rel)
if not os.path.exists(video):
    sys.exit(f"no video at {video}")

info = subprocess.run([FF, "-hide_banner", "-i", video], capture_output=True, text=True).stderr
m = re.search(r"Video:.*?(\d{3,5})x(\d{3,5}).*?([\d.]+) fps", info)
d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
width, height, fps = int(m.group(1)), int(m.group(2)), float(m.group(3))
duration = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3))

loud = subprocess.run([FF, "-hide_banner", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
summary = loud[loud.rfind("Summary:"):]
lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
peak = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary).group(1))

# transcript of the final mix vs the script (Whisper needs 16 kHz mono)
from faster_whisper import WhisperModel
pcm = subprocess.run([FF, "-loglevel", "error", "-i", video, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
model = WhisperModel(os.environ.get("STUDIO_WHISPER", "small.en"), device="cpu", compute_type="int8")
segs, _ = model.transcribe(np.frombuffer(pcm, np.float32), language="en")
heard = " ".join(s.text.strip() for s in segs)
script = json.load(open(os.path.join(ep, "script.json")))
said = " ".join(p["say"] for p in script["paras"])
wer = text_wer(said, heard)

report = {"video": video_rel, "video_sha": hashlib.sha1(open(video, "rb").read()).hexdigest()[:12],
          "width": width, "height": height, "fps": fps, "duration": round(duration, 3),
          "lufs": lufs, "true_peak": peak, "wer": round(wer, 4), "heard": heard,
          "size_mb": round(os.path.getsize(video) / 1e6, 2)}
os.makedirs(os.path.join(ep, "build"), exist_ok=True)
json.dump(report, open(os.path.join(ep, "build", "final_report.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in report.items() if k != "heard"}, indent=1))

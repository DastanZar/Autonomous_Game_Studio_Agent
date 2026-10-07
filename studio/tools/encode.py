"""Encode an episode: build/frames/*.jpg + audio -> out/<slug>.mp4 (then run final_check.py).

    python3 studio/tools/encode.py <episode-dir> [--draft]

Audio: build/mix.wav (music + SFX + voice, from the audio tool) if it exists, else build/vo.wav (voice-only draft).
Final: two-pass x264 at 4.8 Mbps (film grain makes CRF files huge), High profile, yuv420p, AAC 48 kHz 192 kbps,
loudness-normalised to -14 LUFS with a -1.5 dBTP ceiling. --draft: one pass, CRF 23, for quick review.
"""
import json, os, subprocess, sys, tempfile

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ep = os.path.abspath(sys.argv[1])
draft = "--draft" in sys.argv
meta = json.load(open(os.path.join(ep, "episode.json")))
bible = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "channels", meta["channel"], "bible.json")))
fps = bible["format"]["fps"]
frames = os.path.join(ep, "build", "frames", "%05d.jpg")
audio = next(p for p in (os.path.join(ep, "build", "mix.wav"), os.path.join(ep, "build", "vo.wav")) if os.path.exists(p))
os.makedirs(os.path.join(ep, "out"), exist_ok=True)
out = os.path.join(ep, "out", f"{meta['slug']}{'-draft' if draft else ''}.mp4")
# loudness: measure the stereo 48 kHz signal, apply the exact gain through a -2 dBFS sample-peak limiter (AAC overshoots ~0.6 dB, so the encoded file lands under -1 dBTP), measure again.
# (one-pass loudnorm undershot to -15.4 LUFS on speech with pauses; a mono file also measures ~3 dB differently once upmixed)
def lufs(path):
    e = subprocess.run([FF, "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(e[e.rfind("Summary:"):].split("I:")[1].split("LUFS")[0])
tmpd = tempfile.mkdtemp()
st = os.path.join(tmpd, "stereo.wav"); fin = os.path.join(tmpd, "final.wav")
subprocess.run([FF, "-y", "-loglevel", "error", "-i", audio, "-ac", "2", "-ar", "48000", st], check=True)
g = -14.0 - lufs(st)
for _ in range(3):   # the limiter shaves a little, so correct and repeat
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", st, "-af", f"volume={g:.2f}dB,alimiter=limit=0.75:level=false", "-ar", "48000", fin], check=True)
    err = -14.0 - lufs(fin)
    if abs(err) < 0.2:
        break
    g += err
print(f"audio: {os.path.basename(audio)} gain {g:+.2f} dB -> {lufs(fin):.1f} LUFS")
audio = fin
vin = ["-framerate", str(fps), "-i", frames]
ain = ["-i", audio]
aout = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
vcommon = ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "medium", "-r", str(fps)]
run = lambda args: subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error"] + args, check=True)
if draft:
    run(vin + ain + vcommon + ["-crf", "23"] + aout + ["-shortest", "-movflags", "+faststart", out])
else:
    with tempfile.TemporaryDirectory() as td:
        log = os.path.join(td, "x264")
        run(vin + vcommon + ["-b:v", "4800k", "-pass", "1", "-passlogfile", log, "-an", "-f", "mp4", os.devnull])
        run(vin + ain + vcommon + ["-b:v", "4800k", "-pass", "2", "-passlogfile", log] + aout + ["-shortest", "-movflags", "+faststart", out])
print(f"wrote {os.path.relpath(out)} ({os.path.getsize(out) / 1e6:.1f} MB) from {os.path.basename(audio)}")

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

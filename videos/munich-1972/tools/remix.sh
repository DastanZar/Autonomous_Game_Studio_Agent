#!/usr/bin/env bash
# Re-mix the audio onto the rendered picture: VO + score (sidechain-ducked under the VO, 1.6 kHz dip) + SFX, then -14 LUFS.
# Usage: tools/remix.sh <score_gain_dB>   (reads renders/munich-1972.mp4, writes renders/munich-1972-master.mp4)
set -euo pipefail
cd "$(dirname "$0")/.."
G=${1:-0}
S=assets/sfx
fc="[1:a]aresample=48000,asplit=2[vo][key];"
fc+="[2:a]aresample=48000,volume=${G}dB,equalizer=f=1600:t=q:w=1.5:g=-4[sc];"
fc+="[sc][key]sidechaincompress=threshold=0.02:ratio=5:attack=30:release=500:makeup=1[duck];"
i=3; mixin="[vo][duck]"
for spec in tick:0.3:0.5 tick:54.3:0.5 tick:146.52:0.5 tick:171.42:0.5 tick:185.12:0.5 whoosh:17.68:0.35 whoosh:44.26:0.35 whoosh:68.6:0.3 whoosh:149.18:0.3 thud:24.14:0.4 thud:164.12:0.45; do
  IFS=: read -r n t v <<<"$spec"; ms=$(python3 -c "print(int($t*1000))")
  fc+="[$i:a]aresample=48000,volume=$v,adelay=${ms}:all=1[f$i];"; mixin+="[f$i]"; i=$((i+1))
done
fc+="${mixin}amix=inputs=$((i-1)):normalize=0:duration=longest[mix]"
ins=(-i renders/munich-1972.mp4 -i assets/vo.wav -i assets/score.wav)
for n in tick tick tick tick tick whoosh whoosh whoosh whoosh thud thud; do ins+=(-i $S/$n.wav); done
ffmpeg -hide_banner -loglevel error -y "${ins[@]}" -filter_complex "$fc" -map "[mix]" -t 247 -ar 48000 -c:a pcm_s16le build/mix_raw.wav
J=$(ffmpeg -hide_banner -i build/mix_raw.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
LN=$(python3 -c "import json,sys;j=json.loads(sys.argv[1]);print('measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s'%(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'],j['target_offset']))" "$J")
ffmpeg -hide_banner -loglevel error -y -i renders/munich-1972.mp4 -i build/mix_raw.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.0:LRA=11:$LN,aresample=48000" -c:a aac -b:a 192k -movflags +faststart renders/munich-1972-master.mp4

#!/bin/sh
# produce <episode-dir...>: full render -> mix -> encode -> final check -> captions + thumbnail -> frozen-time
R=$(cd "$(dirname "$0")/../.." && pwd)
for D in "$@"; do
  echo "== $D $(date +%T)"
  (cd $R/$D && rm -rf build/frames && timeout 7000 node $R/studio/engine/render.mjs . full 4 2>&1 | tail -2)
  python3 $R/studio/tools/audio.py $R/$D 2>&1 | tail -1
  python3 $R/studio/tools/encode.py $R/$D 2>&1 | tail -1
  python3 $R/studio/tools/final_check.py $R/$D 2>&1 | grep -E '"(duration|lufs|wer)"' | tr -d '\n '; echo
  python3 $R/studio/tools/package_assets.py $R/$D 2>&1 | tail -2
  python3 $R/studio/tools/frozen.py $R/$D/out/$(basename $D).mp4 --fair 2>&1 | tail -1
done
echo "== done $(date +%T)"

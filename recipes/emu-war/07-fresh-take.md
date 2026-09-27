# Step 7 (optional): A fresh take

Only do this *after* scoring the exact build, and only if asked. It produces the same video with a
new performance of the voice, so it won't be byte-identical and the grader will show mismatches.
That's expected.

```bash
rm -rf shorts/emu-war/build/lines shorts/emu-war/build/frames
cd shorts/emu-war && python3 tools/vo.py && cd render && node render.mjs full 4 && cd .. && python3 tools/audio.py && cd ../..
bash shorts/emu-war/tools/encode.sh
```

- Piper synthesizes all 17 lines again with length-scale 0.9. Total length lands around 45.6–46.1 s.
- Because every visual event is keyed to the timeline, the picture re-times itself to the new take
  automatically.
- If you want a take that's deterministic but flatter, add `--noise-scale 0 --noise-w-scale 0` to
  the `piper` command in `vo.py`.

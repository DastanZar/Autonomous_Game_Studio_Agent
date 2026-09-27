# Step 6: Encode, then grade

## 6.1 Create `shorts/emu-war/tools/encode.sh`

It runs a two-pass x264 encode at 4.8 Mbps, loudness-normalises to −14 LUFS, and writes the SRT
captions and a thumbnail.

```bash
{{FILE:shorts/emu-war/tools/encode.sh}}
```

## 6.2 Create `shorts/emu-war/tools/verify.py`

The grader. It checks exact checksums first; for any frame that isn't byte-identical, it measures
visual similarity (PSNR) against the reference frame.

```python
{{FILE:shorts/emu-war/tools/verify.py}}
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

# Step 3: Voice-over and timeline

## 3.1 Create `shorts/emu-war/script.json`

This is the whole story:
- `say` is what the voice reads.
- `gap` is the silence after a line, used for comic timing.
- `caps` are the burned-in caption chunks as `[text shown, number of spoken words it covers]`. The
  counts in each line add up to the number of words in `say`.

```json
{{FILE:shorts/emu-war/script.json}}
```

## 3.2 Create `shorts/emu-war/tools/vo.py`

```python
{{FILE:shorts/emu-war/tools/vo.py}}
```

What it does:
1. Synthesizes each line to `build/lines/<id>.wav`, only if that file doesn't exist yet.
2. Trims silence (threshold 0.01, 30 ms padding).
3. Lays the lines end to end: a 0.35 s lead-in, each line's `gap`, then a 1.6 s tail.
4. Runs Whisper `base.en` on 16 kHz audio to get word start times, and matches script words to them
   with `difflib`. Words Whisper spells differently (e.g. "nineteen thirty-two" vs "1932") get times
   interpolated by character position.
5. Writes `build/vo.wav` and `build/timeline.json`.

## 3.3 Use the saved voice takes, then build

Piper adds random variation on every run, so the original takes are provided.

```bash
mkdir -p shorts/emu-war/build/lines
cp recipes/emu-war/golden/lines/*.wav shorts/emu-war/build/lines/
cd shorts/emu-war && python3 tools/vo.py && cd ../..
```
**Checkpoint:** the table starts with `  0.35-  3.53  hook` and the last line is `total 46.04`.

## 3.4 Swap in the saved timeline

Whisper's word timings wobble by up to about 0.1 s between runs, and the reference picture was timed
to one specific run.

```bash
cp recipes/emu-war/golden/timeline.json shorts/emu-war/build/timeline.json
md5sum shorts/emu-war/build/vo.wav shorts/emu-war/build/timeline.json
```
**Checkpoint:**
```
10a0464a4f5fb383866325cee5561a1f  shorts/emu-war/build/vo.wav
465cbd1d4518fa13f9adb7ccf7de0e47  shorts/emu-war/build/timeline.json
```

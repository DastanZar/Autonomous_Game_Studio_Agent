# Free narration voice: Kokoro-82M vs Piper (2026-10-06)

Why: Fish (paid) is unavailable, so the fallback is Piper `en_US-ryan-high`. Is there a better free voice?
Nobody has listened to these takes (the agent cannot hear). Samples are in `voice-samples/` for the user.

## Method
- Text: all 12 paragraphs of `episodes/why-map/point-roberts/script.json` (136 words), one synthesis per paragraph,
  silence-trimmed and joined exactly like `studio/tools/vo.py` (lead_in 0.35 s, per-paragraph gaps, tail 1.6 s),
  peak-normalised to 0.9. Raw peak and clipped samples are measured before that normalisation.
- Pace: tuned per voice toward 170 wpm of speech (words / summed paragraph duration, gaps excluded).
  `wpm gaps` includes the gaps and is closer to what the finished video feels like.
- WER: faster-whisper `small.en`, int8, 16 kHz, whole narration in one pass, `textnorm.wer` (numbers and hyphens normalised).
- Loudness: ffmpeg `ebur128` integrated LUFS and true peak.
- Prosody proxy (crude, not a quality measure): F0 standard deviation via `librosa.pyin` (65-400 Hz), in semitones around
  the median (lower = flatter); number of silences of at least 120 ms inside a paragraph (pauses at punctuation) and their mean.
  pyin can make octave errors, so compare loosely.
- Synthesis time on this 4-core CPU. Piper RTF is inflated: the `piper` CLI (as vo.py calls it) reloads the model for every
  paragraph; Kokoro keeps one loaded session. The machine was shared, so treat RTF as roughly +-30%.
- The benchmark harness lived in scratch and is not committed; the vo.py `kokoro` engine reproduces the Kokoro takes.

## Licence
Kokoro-82M: **Apache-2.0** (model card `hexgrad/Kokoro-82M`, front matter `license: apache-2.0`; base model
`yl4579/StyleTTS2-LJSpeech`). Commercial use is permitted. The `kokoro-onnx` wrapper and the v1.0 ONNX/voices files come
from thewh1teagle/kokoro-onnx releases (check that repo's own licence before redistributing the files; we do not commit them).
The espeak-ng phonemizer that `espeakng-loader` brings in is GPL-3 and is used as a library at run time, not redistributed by us.
Voices are stock Kokoro voices, not clones of real people, so the no-impersonation rule is met.
Piper `ryan-high` is already in use under its own voice card.

## Install that worked (Python 3.11, CPU only)
```
pip install kokoro-onnx soundfile librosa        # pulls onnxruntime, phonemizer, espeakng-loader
mkdir -p ~/.cache/kokoro && cd ~/.cache/kokoro
curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx   # 326 MB
curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin    # 28 MB
```
Same files HyperFrames uses (`packages/cli/src/tts/manager.ts`; it caches in `~/.cache/hyperframes/tts` and passes `lang=`).
Piper 1.8.0 and `~/voices/en_US-ryan-high.onnx` were already present. Side effect: the pip install upgraded numpy to 2.4.6
(pip warned `bpy 5.0.1 requires numpy<2`; bpy is not used by the studio; `studio.py selftest` still passes).
Disk is nearly full in this container (213 MB free at the end), so the 354 MB of model files live in `~/.cache`, not in git.

## Results
| Take | Engine / voice | speed | WER | wpm speech | wpm gaps | total s | synth s | RTF | LUFS (pk-norm 0.9) | raw peak / clipped | F0 sd (st) | F0 median Hz | inner pauses (n, mean ms) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| piper_ryan | Piper en_US-ryan-high | length 1.35 | 0.014 | 173.8 | 161.7 | 52.4 | 33.2 | 0.71 | -16.2 | 1.015 / 16 | 4.49 | 143 | 6, 272 |
| k_am_adam | Kokoro am_adam | 0.82 | 0.000 | 171.3 | 159.6 | 53.1 | 23.8 | 0.50 | -19.7 | 1.09 / 3 | 3.16 | 121 | 9, 347 |
| k_am_michael | Kokoro am_michael | 0.93 | 0.000 | 169.5 | 158.0 | 53.6 | 19.6 | 0.41 | -21.6 | 0.72 / 0 | 3.22 | 116 | 10, 396 |
| k_bm_george | Kokoro bm_george | 0.98 | 0.000 | 163.5 | 152.8 | 55.3 | 24.0 | 0.48 | -18.5 | 0.64 / 0 | 4.19 | 143 | 18, 254 |
| k_bm_lewis | Kokoro bm_lewis | 0.93 | 0.007 | 169.6 | 158.1 | 53.6 | 20.8 | 0.43 | -22.4 | 0.83 / 0 | 3.97 | 89 | 16, 317 |
| k_am_eric | Kokoro am_eric | 0.85 | 0.000 | 190.6 | 176.2 | 48.3 | 57.6* | 1.35* | -16.9 | 0.55 / 0 | 3.95 | 158 | 3, 245 |

*Eric's time was taken under heavy contention. Its pace does not scale linearly with speed (0.77 gave 154 wpm, 0.9 gave 200 wpm), so it is off target.
Raw peak above 1.0 is resampler overshoot, not source clipping; the 0.9 normalisation removes it.
LUFS is after peak-normalisation only; the `final` stage normalises to -14 LUFS anyway, so this column mainly shows how much gain each voice needs.
Piper at the repo default length-scale 0.9 runs 228 wpm, far too fast for these scripts; 1.35 reaches 170.

## Reading the numbers
- Intelligibility does not separate them: everything is far below the 0.08 gate. Kokoro scores 0.000 on four of five voices, Piper 0.014.
- Piper has the highest pitch variance (4.5 st). That can mean lively intonation or pyin octave jumps and glitches; the numbers cannot tell.
  Kokoro bm_george (4.2 st) and bm_lewis (4.0) come closest; the American am_adam and am_michael are flatter (3.2 st) by this proxy.
- Kokoro pauses at most commas (bm_george: 18 pauses, 254 ms mean), which supports the deadpan timing the scripts rely on;
  Piper ran sentences together more (6 inner pauses).
- Kokoro is about 1.5x faster on CPU even with Piper's per-call model load handicap.

## Recommendation
**Best by the numbers: Kokoro `bm_george`, speed 0.98** (WER 0.000, highest Kokoro pitch variance, most punctuation pauses, no clipping, 164 wpm).
For an American voice, **`am_adam` at 0.82** hits the pace target (171 wpm) with WER 0 but is flatter.
Neither is the Australian Felix; Kokoro has no Australian voice. Listen to `voice-samples/` first, then decide. Piper stays the default:
the data show Kokoro is at least as intelligible, paces better and has more varied pauses, but not that it sounds better.

To try it: set `voice.fallback` in a channel bible to `{"engine": "kokoro", "id": "bm_george", "speed": 0.98}`, or run
`python3 studio/tools/vo.py <episode> --engine kokoro`. No bible default was changed.

## Risks
- British (bm_*) or American (am_*) only; continuity with Felix is lost either way.
- The 326 MB model must be downloaded to `~/.cache/kokoro/` in every fresh container; the setup script needs it (not in git).
- Output can differ across onnxruntime versions; vo.py caches takes, and the key includes engine, voice, text and speed.
- Numbers are spelled out in the scripts already; acronyms ("US") were not stress-tested beyond this script.
- Whisper times wobble as with Piper; freeze `timeline.json` once the picture is timed.
- pip upgraded numpy to 2.x here (bpy, unused, objects).
- Nothing was listened to; stress or tone problems that no metric captures may remain.

## Files
`voice-samples/*.mp3`: first 20 s of each take, 128 kbps (about 2.7 MB total).
`studio/tools/vo.py` now has `--engine kokoro` and accepts `voice.fallback` of `{"engine":"kokoro",...}`.
Check run: vo.py on the point-roberts script with `--engine kokoro` (bm_george) gave WER 0.00 on every paragraph, 55.35 s total.
`python3 studio/studio.py selftest` printed SELFTEST OK.

# 2026-10-06 voice benchmark: Kokoro vs Piper

## User message (task from lead agent, condensed)
Voice benchmark task. We need a better FREE narration voice while Fish via OpenRouter is unavailable. Test Kokoro TTS
(licence on model card; HyperFrames tts/ for install hints; pip, CPU only); Piper for fair comparison. Use
episodes/why-map/point-roberts/script.json. Measure WER (faster-whisper small.en, 16 kHz, textnorm), duration, wpm (~170),
synthesis time, RTF, LUFS, clipping, F0 sd (pyin), pause distribution. Deliver docs/research/voice-kokoro-vs-piper-2026-10.md and
samples under docs/research/voice-samples/ (<10 MB). If Kokoro wins, add a `kokoro` engine to studio/tools/vo.py behind voice.fallback
without changing defaults; selftest must print SELFTEST OK. Commit, do not push.

## Done
- Installed kokoro-onnx, librosa, soundfile; downloaded model files to ~/.cache/kokoro. Licence: Apache-2.0.
- Benchmarked Piper ryan-high (length 1.35) and Kokoro am_adam, am_michael, bm_george, bm_lewis, am_eric, tuned toward 170 wpm.
- Added `--engine kokoro` and fallback support to studio/tools/vo.py; verified on the point-roberts script (WER 0.00) and selftest OK.

## Decided / found / skipped
- Recommended bm_george 0.98 on the numbers; default voice untouched (user decides after listening).
- pip upgraded numpy to 2.4.6 (bpy warns; unused). Disk nearly full (213 MB free), so WAVs stayed in scratch only.
- am_eric pace does not scale linearly; ended at 190 wpm, off target. One sample write failed once (disk), re-ran.
- Piper RTF inflated by per-call model load; noted.

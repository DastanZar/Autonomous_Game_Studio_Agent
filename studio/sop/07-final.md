# 07 · Final (sound, encode, measure)

**Goal:** a delivery-ready MP4, with the measurements that prove it.
**Input:** frames plus `build/vo.wav`. **Outputs:** `out/<slug>.mp4`, `build/final_report.json`.

## Steps

1. **Music and SFX.** Adapt `videos/root-keys/tools/audio.py`: code-synthesised score in the
   channel's style, SFX taken from the storyboard `sfx` names at their cue times, and the voice
   ducked. Music should sit about 6–10 dB under speech.
2. **Encode** with two-pass x264 at 4.8–5 Mbps for 1080p (grain makes files huge otherwise).
   Loudness-normalise to −14 LUFS, AAC 48 kHz. Output to `out/<slug>.mp4`.
3. **Measure:** `python3 studio/tools/final_check.py episodes/<channel>/<slug>`. It records
   resolution, fps, duration, LUFS, true peak and the transcript WER of the final mix (small.en).
4. **Spot-check 5 frames** from the encoded file, not from `build/frames`, by extracting them with
   ffmpeg and looking at them.
5. Run the check. It needs:
   - the report to describe the current file;
   - the channel's resolution and fps;
   - duration within 0.5 s of the voice timeline;
   - −14 ±1 LUFS and true peak ≤ −1 dBTP;
   - WER ≤ 0.03;
   - a file under 100 MB.

Measured on the gold example (the shipped Emu short): 1080×1920, 24 fps, 46.04 s, −14.2 LUFS,
−1.4 dBTP, WER 0.0.

# 07 · Final (sound, encode, measure)

**Goal:** a delivery-ready MP4, with the measurements that prove it.
**Input:** frames plus `build/vo.wav`. **Outputs:** `out/<slug>.mp4`, `build/final_report.json`.

## Steps

1. **Music and SFX:** `python3 studio/tools/audio.py episodes/<ch>/<slug>` writes `build/mix.wav` and `build/audio_report.json`.
   - Music comes from the channel's **approved** library tracks (`studio/assets/music/<ch>/manifest.json`, built with
     `tools/music_gen.py`: ACE-Step 1.5, MIT), picked from the slug. Without one, it uses a code-synthesised underscore.
     `--music <id>` previews a specific (even unapproved) track.
   - SFX come from `build/cues.json`: recorded or generated files (`studio/assets/sfx/manifest.json`: Kenney CC0 and
     Stable Audio Open), with a few synthesised sounds. The report lists any cue with no sound.
   - The music is ducked under the voice and set to `audio.music_under_voice_db` (bible, default 8) below it, **measured**.
     The gate needs 6–12 dB and no unknown cues. If the report lists `credits`, the package description must carry them.
   - Research and licences: `docs/research/audio-stack-2026-09.md`.
   - **New library tracks need a human listen.** `music_gen.py` writes them with `approved: false` and automatic checks
     (no words heard, no dropouts). A person listens and flips `approved` in the manifest. Models never approve music.
2. **Encode:** `python3 studio/tools/encode.py episodes/<ch>/<slug>` (two-pass x264 at 4.8 Mbps, AAC 48 kHz,
   gain set by measurement through a −1.5 dBTP limiter until −14 LUFS). It uses `build/mix.wav` if present, else the
   voice alone. `--draft` does a quick one-pass encode.
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

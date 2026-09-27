# Emu War recipe: start here

This folder is the answer key for rebuilding the 46-second short **"The Great Emu War"**. If you
follow it exactly, the grader in step 6 confirms you produced the same video: the same audio mix byte
for byte, and essentially the same frames. In the validation run, 1,099 of 1,105 frames were
byte-identical and the other 6 differed invisibly, because Chromium's software renderer isn't
perfectly repeatable.

It's written for an AI coding agent with a Linux shell. Expect about 10 minutes, about 1 of which is
rendering.

## The documents (do them in order)

| # | File | What you do |
|---|---|---|
| 1 | `01-environment.md` | Install the exact tool versions, create the folders |
| 2 | `02-assets.md` | Download fonts, the map and the voice model; verify checksums |
| 3 | `03-voice.md` | Write the script, build the voice-over and timeline from the saved takes |
| 4 | `04-picture.md` | Write the renderer and render all 1105 frames |
| 5 | `05-sound.md` | Synthesize music and SFX, mix them under the voice |
| 6 | `06-encode-and-grade.md` | Encode the MP4, run the grader, report the score |
| 7 | `07-fresh-take.md` | Optional: regenerate the voice (similar video, not identical) |

## Rules

1. **Don't improvise.** Don't improve, refactor, reformat, rename or re-order anything. Every file
   is final.
2. **Create each file with a file-writing tool, copying its code block byte for byte.** Copy
   everything between the fences and nothing else. Never retype from memory or summarise.
3. **Run the commands in the order given.** After each step, compare your output with its
   **Checkpoint**. If it doesn't match, stop and report the step and what you saw. Don't work around
   it.
4. **Use the golden files** in `recipes/emu-war/golden/` exactly where told. The original run had two
   random steps (text-to-speech noise, speech-recognition timing); the golden files freeze their
   results so the build is exact.
5. **Don't search the web or swap tools.** Every URL and version you need is in these documents.
6. Run all commands from the **repository root** unless a command `cd`s itself.
7. Finish by pasting the grader's complete output, including the `SCORE` line.

## What you are building

| Property | Value |
|---|---|
| Output | `shorts/emu-war/out/great-emu-war.mp4`, `great-emu-war.srt`, `thumbnail.jpg` |
| Video | 1080×1920 vertical, 24 fps, 46.04 s = 1105 frames, H.264 High yuv420p |
| Audio | AAC 48 kHz stereo 192 kbps, loudness-normalised to −14 LUFS |
| Look | 2.5D paper cut-out: cream paper, ink outlines, offset drop shadows, paper texture, film grain, 12 fps "boil" jitter |
| Voice | Piper TTS `en_US-ryan-high` |
| Music/SFX | Synthesized in numpy (comic march + ~20 effect types) |

## How the pieces connect

```
script.json ──vo.py──▶ build/vo.wav + build/timeline.json   (every line/word start time)
                                   │
            emu.js (draws frame at time t) ◀── render.mjs (headless Chromium) ──▶ build/frames/*.jpg
                                   │                                          └─▶ build/cues.json (SFX times)
                         audio.py ─┴─▶ build/mix.wav (music + SFX + voice)
                         encode.sh ──▶ out/great-emu-war.mp4 (+ .srt, thumbnail)
```
Everything is timed to the voice. Every frame is a pure function of `t`: no random numbers and no
clock, only a seeded hash. That's why a rebuild comes out essentially identical.

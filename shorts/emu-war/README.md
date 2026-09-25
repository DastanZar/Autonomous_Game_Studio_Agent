# The Great Emu War — 46s vertical explainer

**Deliverable:** `out/great-emu-war.mp4` — 1080×1920, 24 fps, H.264 High + AAC 48 kHz, 46.0 s, 28 MB,
−14 LUFS integrated / −1.4 dBFS peak. `out/great-emu-war.srt` for platform captions (captions are also
burned in). `out/thumbnail.jpg` for a cover frame.

## How it's made (Method B: code-rendered)
1. `script.json` — narration lines + caption chunks. **Voice first:** `tools/vo.py` synthesizes each line
   with Piper TTS (`en_US-ryan-high`), lays them out with comedic gaps, and aligns every word with
   faster-whisper → `build/timeline.json`. Everything else is timed off this file.
2. `render/emu.js` — every frame is a pure function of `t` (seeded hash, no `Math.random`, no clock).
   Paper-cutout look: ink outlines, offset drop shadows, procedural paper texture, 12 fps "boil" jitter
   and grain on twos. Map coastline is real Natural Earth 1:50m data. All text is typeset in code.
3. `render/render.mjs` — headless Chromium (Playwright), 4 parallel pages, resumable frame output.
   `node render.mjs sheet 1.5,4.4,...` renders a review contact sheet instead.
4. `tools/audio.py` — march score, all SFX, voice ducking; cues exported from the renderer so picture and
   sound share one timeline.
5. ffmpeg: two-pass x264 @ 4.8 Mbps, loudnorm to −14 LUFS.

Rebuild: `python3 tools/vo.py && (cd render && node render.mjs full 4) && python3 tools/audio.py`, then
the ffmpeg commands in the commit message. Needs `pip install piper-tts faster-whisper imageio-ffmpeg scipy`
and the voice model in `~/voices/`.

## Fact check (all on-screen/VO claims)
- Nov–Dec 1932, Campion district, Western Australia; ~20,000 emus into the wheat belt; many farmers were
  WWI soldier-settlers.
- Major G.P.W. Meredith, two soldiers, two Lewis guns, 10,000 rounds.
- Emus split into small groups; ~1,000 approached an ambush at a dam and the gun jammed; a gun mounted on
  a truck couldn't keep up.
- Meredith's claim: 986 kills for 9,860 rounds (his own count, flagged on screen). Emus run up to ~50 km/h.
- Quote: "They can face machine guns with the invulnerability of tanks." — Meredith, 1932
  (full line opens "If we had a military division with the bullet-carrying capacity of these birds…").
- "Went to war" / "lost" is the standard popular framing; there was no formal declaration of war.
  The telegram is an illustration, not a real document.

## Post copy
**Title:** Australia went to war with emus. The emus won.
**Caption:** In 1932 the Australian army brought machine guns to fight 20,000 emus. It did not go well. 🪶
#history #australia #emuwar #explained #shorts

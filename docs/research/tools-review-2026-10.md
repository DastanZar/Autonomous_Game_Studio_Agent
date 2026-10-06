# Four tools reviewed for the content pipeline (2026-10-06)

**Sources the user sent:**
- @RoundtableSpace's "motion design prompt", which is built on **echris6/motion-video-kit**;
- **yasinozmeen/animasyon-stil-katalogu**;
- **heygen-com/hyperframes**;
- **VEED OpenEdit** (veedstudio/open-edit).

**How they were read:**
- The motion kit: all 24 files, read by Opus.
- HyperFrames (8.8k files) and OpenEdit plus the style catalogue (437 files): read by two Sonnet readers.
- Spot checks of their key claims (file paths, licences, telemetry) were done by Opus.

**Full reports:** `tools-hyperframes-2026-10.md` and `tools-openedit-stylecatalog-2026-10.md`.

## Verdict in one line each

| Tool | What it is | Licence | Verdict |
|---|---|---|---|
| **motion-video-kit** (the prompt's kit) | A Claude skill with a critic loop ("builder ≠ judge"), motion grammar distilled from 28 launch films, a measured quality bar, audio rules and ffmpeg scripts | MIT | **Adopt its method.** It's the biggest quality lever: our videos currently grade themselves. |
| **HyperFrames** (HeyGen) | Write HTML + GSAP, seek it per frame in headless Chrome, encode to MP4; 21 agent skills; a lint tool with 121 rules | Apache-2.0 (GSAP has its own licence; telemetry is on by default) | **Don't switch renderers.** Borrow its motion rules, audit ideas and voice-ducking; **benchmark its free Kokoro TTS** (a possible fix for our voice blocker). |
| **OpenEdit** (VEED) | An agent edits by writing HTML; it renders with Playwright and ffmpeg (the same idea as ours) | Apache-2.0 in the current repo; no closed engine found | **Reference only.** Borrow the virtual-clock injector, partial re-render and the ducking settings. Its music and footage generation is paid. |
| **Style catalogue** (20 animation styles) | Exactly our architecture (canvas + `draw({t})` + Playwright) | **None, so all rights reserved: ideas only, never copy code** | **Study techniques**, then write our own versions: paper rim-light, clay shading, odometer counters, line draw-on, spring easing. |

## The measurement that matters

The motion kit's "frozen time" check is run on our own finished videos. It counts frames whose difference from the previous frame falls below a threshold, sampled at 10 fps.

| Video | Length | Near-still screen | Per 30 s | Longest hold |
|---|---|---|---|---|
| The Great Emu War | 46.0 s | 2.2 s | 1.4 s | 0.4 s |
| Point Roberts | 41.5 s | 2.9 s | 2.1 s | 0.6 s |
| Swiss invades Liechtenstein | 44.9 s | 4.1 s | 2.7 s | 0.9 s |

The kit's bar is ≤ ~1 s per 30 s and no hold longer than 0.6 s. All three videos miss it. These numbers are **optimistic**, because our film grain and paper boil register as "change" even when nothing meaningful moves. For Shorts, held screens are where viewers swipe away.

## Upgrade plan (ranked by effect on views and retention)

1. **An independent critic in the picture stage.**
   - The agent that made a storyboard may not write its `review.json`. A fresh agent does: it pulls its own frames, measures, and returns a ranked list of defects with timestamps, ending in SHIP or ONE MORE PASS.
   - The next round's critic checks each previous item as FIXED, PARTLY or STILL PRESENT. A ledger records every round.
   - Critic prompts are adapted for 9:16 Shorts and our three channels.
   - *(Method from the motion kit.)*
2. **Measured quality bar in the final gate.**
   - **Frozen time:** measured on a grain-free check render. The limit is ≤ 1 s per 30 s and no hold over 0.6 s, except the loop ending.
   - **Frame 0 is a finished composition:** no half-entered words, no empty frame.
   - **Settled text has at least 4.5:1 contrast.**
   - **Loudness range:** ≥ 3 LU for energetic channels.
   - **Text placement:** stays in the caption-safe zones and never overlaps other text.
   - *(Checks from the motion kit and HyperFrames' `check`.)*
3. **Motion grammar in the storyboard playbook and the engine.**
   - **Easing:** entrances ease out, exits ease in, and moves between positions ease in and out. Eases vary within a scene. Exits are faster than entrances. The slowest scene is about 3× slower than the fastest.
   - **Scene structure:** build / breathe / resolve.
   - **Continuity:** one persistent object carries across shots (a pin, a flag badge, a character). The foreground becomes the transition.
   - **Cause and effect:** every action shows a result.
   - **Framing:** the lead subject fills 60–85% of the frame. No first animation at t = 0.
   - *(Rules from the motion kit and HyperFrames' `motion-principles.md`.)*
4. **A better free voice.** Benchmark **Kokoro TTS** (local and free; HyperFrames' `hyperframes tts`) against Piper, scoring Whisper WER and naturalness. If it wins, it becomes the default while the Fish key is missing.
5. **Audio.**
   - Voice ducking uses a voice-band carve plus sidechain (HyperFrames' carve; OpenEdit's threshold 0.03, ratio 8, attack 20 ms, release 600 ms).
   - Scene changes are timed to musical beats.
   - Every render ships a music-only version.
6. **Engine techniques, rewritten from ideas** (not copied):
   - **Border Quirks:** layered paper with rim light, inner and cast shadow, and a moving light; arc-length draw-on for borders and routes; a 16 mm documentary grade for history beats.
   - **The Gut Gang:** clay inner-shadow shading; spring and elastic easing for characters.
   - **LeaderFlags:** odometer counters, masked letter rise, and an editorial chart reveal.
   - **All channels:** a seeded linocut stamp to upgrade `stamp_reveal`; picture and sound events driven from one source.

## Not adopted, and why

- **Switching the renderer to HyperFrames or OpenEdit.**
  - Cheap agents would have to write HTML and GSAP, and we'd lose the catalogue plus gates that keep them on-brand.
  - Both tools' map and chart blocks are 16:9 and coarser than ours.
  - HyperFrames sends telemetry by default and fetches from CDNs at render time.
- **Three.js and 3D, and the business-commercial playbook.** They don't fit our faceless 2D Shorts formats today.
- **OpenEdit's generation features.** Paid models.
- **Copying the style catalogue's code.** It has no licence.

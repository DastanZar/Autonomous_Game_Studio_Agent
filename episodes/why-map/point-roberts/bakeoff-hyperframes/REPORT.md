# Bake-off C: Point Roberts in HyperFrames (2026-10-06)

Built by a Sonnet worker following HyperFrames' own skills. It reuses our audio (voice, score and SFX), word timings, fonts, palette and Natural Earth geometry.

## Output
- **File:** `out/bakeoff-hyperframes.mp4`, 1080×1920, 24 fps, 41.5 s, 25.7 MB.
- **Review images:**
  - `out/bakeoff-hyperframes-sheet.jpg`, its own contact sheet;
  - `out/bakeoff-compare-A-C.jpg`, A (top) vs C (bottom), one frame every 3.5 s.
- **Source:**
  - `build.mjs` generates `index.html`;
  - `page.js` holds the single GSAP timeline;
  - `hyperframes.json` pins hyperframes 0.8.137.

## Process
- **Install:** `npx hyperframes@latest init` (22 s).
- **Workarounds:**
  - GSAP was vendored, because the CDN script fails behind the proxy's TLS in headless Chromium.
  - ffmpeg and ffprobe had to be on PATH (apt).
  - The renderer requires at least 1 GB free disk.
- **Time:** about 19 min of agent work across roughly 5 build/check loops. Rendering took 2m05s–2m16s for 996 frames on 4 CPU cores with software GL.

## Checks
- **Lint:** 0 errors, 14 warnings (all advice to split into sub-compositions).
- **`check`:**
  - 0 runtime errors;
  - 9 content_overlap reports, which are tight stacked headlines;
  - 1 contrast false positive, on an outlined yellow word.
- **Frozen time:** 4.6 s of 41.4 s, longest 0.8 s. Our version (A) has 2.9 s, longest 0.6 s.
- **Loudness:** −14.2 LUFS, unchanged from our mix.

## Opus review of the comparison strip
- **C is stronger in composition:**
  - its type fills 60–80% of the frame;
  - it uses colour-field backgrounds (orange "OOPS", yellow border shot, dark chart);
  - it varies its layouts.
- **A is stronger in craft:**
  - richer paper texture and boil;
  - real props (truck, house);
  - better-placed map labels;
  - fewer near-still seconds.
- **C's defects:**
  - stacked headlines crowd each other ("A US TOWN CUT OFF BY CANADA");
  - "UNITED STATES" is clipped by the map frame;
  - flatter props;
  - more frozen time.
- **Lesson for B:** keep our engine and craft, and take C's scale and colour-field variety (which is the motion kit's 60–85% fill rule).

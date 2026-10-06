# Three ways to make the same Short (Point Roberts, 2026-10-06)

**Why:** the user's feedback on v2 was that it lacked the Emu War's finesse: "these look like amateur drawing
cutouts, that looked like well drawn, proper curves, colours, animations." They asked for three versions, each
trying something different, because "it's more about nailing our methodology than a particular content piece".

**Controls:** all three share the same 147-word script, the same Kokoro George voice (WER 0.00), the same word-timed
cues, the same fact table and the same music bed. Only the picture method changes.

## The diagnosis: what v2 got wrong

A side-by-side of Emu War and v2 frames showed the gap was art direction, not "more stuff".

| | Emu War | Point Roberts v2 |
|---|---|---|
| Palette | 4–5 earth tones per scene, one accent | a dozen saturated colours competing (red car, green grass, blue water, purple houses) |
| Hero | one big subject per beat, breathing room | many small objects of equal weight |
| Shapes | organic béziers: the emu body, slouch hats, hills | rectangles: houses, booths and shops are boxes |
| Asset depth | each character is 60–100 lines of anatomy (leg joints, feathers, pinned hat brim) | each object is about 10 lines |
| Numbers | designed paper props (telegram, clipboard, bullet bar) | generic tags and counters |

## The three versions

| | **A: art-directed paper** | **B: 3D paper miniature** | **C: kinetic infographic** |
|---|---|---|---|
| Lineage | Emu War, made explicit and systematic | tilt-shift miniatures, paper-craft dioramas | Vox / documentary motion graphics |
| Renderer | our 2D canvas engine | Three.js r159 (WebGL on SwiftShader) inside our engine | our 2D canvas engine, flat theme |
| Picture | one PNW autumn palette; every asset is a lit paper piece (rim light, core shadow, contact shadow) | real coastline extruded into paper slabs, nested in the real continent; instanced paper trees and houses; low sun, soft shadows | night-blue map, glowing lines that draw on, big type whose letters rise out of a mask, unit charts |
| Story carrier | an original recurring character (a Point Roberts local: knit cap, beard, buffalo-check jacket) plus 1850s surveyors, a school bus full of kids | the place itself: one continuous camera flies from street level to the continent and back | the data: counters, one-dot-per-person charts, route lines |
| Numbers | designed paper props: census card, passport stamps, odometer, punched bus pass, water agreement, ledger, receipt, chalkboard | 2D cards and typewriter tags pinned to 3D positions | the numbers are the picture |
| Motion | spring overshoot, anticipation squash on the car, antenna follow-through, walk cycles with knee bend, swinging CLOSED sign | the 3D world moves on twos (12 fps), like stop-motion; overlays at 24 fps | everything eased or sprung; zoom flights in log space so they feel constant |
| Code | `variants/a/scenes.js` | `variants/b/scenes.js` + `vendor/00-three.min.js` | `variants/c/scenes.js` |

## Measurements (all from the encoded MP4s)

Every version measured 1080×1920, 24 fps, 59.75 s, −14.1 LUFS, true peak −1.9 dBTP, and transcribed at
WER 0.00 against the script.

Motion is measured with `studio/tools/frozen.py`, which counts near-still screen per 30 s. The "fair" mode blurs out
film grain and paper boil first, so grainy and flat looks compare honestly. Its absolute numbers are higher than
the raw bar's.

| Video | Render time (4 CPU workers) | Raw: still per 30 s / longest hold | Fair: still per 30 s / longest hold |
|---|---|---|---|
| The Great Emu War | (old renderer) | 1.44 s / 0.4 s | 8.37 s / 1.4 s |
| Point Roberts v2 | 59 s | 0.40 s / 0.3 s | 9.60 s / 1.2 s |
| **A: art-directed paper** | 73 s | 0.00 s / 0.0 s | **8.19 s / 1.3 s**, Emu War's level |
| **B: 3D miniature** | 559 s | 0.00 s / 0.0 s | **5.28 s / 1.0 s**, the most motion |
| **C: kinetic infographic** | 22 s | 8.34 s / 1.0 s (no grain to hide behind) | **12.36 s / 1.1 s**, the most static |

**Reading it:**
- The raw bar flatters grainy looks, so use the fair column to compare methods.
- C's type and charts settle and then hold. A future C needs more continuous camera drift and particles between
  beats.
- B is never still because the camera never stops.

## What each method costs, and what it is good for

- **A (art-directed paper).**
  - **Strength:** the closest to the Emu War, with warmth and jokes carried by characters and props.
  - **Weakness:** the most hand-drawing per episode; assets have to be built, not just placed.
  - **Engine work:** the character, vehicle, booth, card and shopfront functions are reusable, so they should
    become catalogue types (backlog `diorama-kit`). After that a cheap agent can place them by storyboard.
- **B (3D miniature).**
  - **Strength:** geography. The fly-out from the town to the 1846 continent is one unbroken camera move, and the
    real coastline in relief with real shadows is something 2D can't do.
  - **Weakness:** close-up "people" beats. Toy-scale blocks read as blocks; it would need modelled assets
    (glTF) to compete with A there.
  - **Render cost:** about 0.5 s a frame on CPU, so roughly 4× version A.
  - **Best use:** map-heavy episodes, or as the map layer inside A.
- **C (kinetic infographic).**
  - **Strength:** clarity and pace. Every number lands, and it is the cheapest to make: almost no bespoke
    drawing, so a cheap agent can run it from data.
  - **Weakness:** no warmth and no characters. It looks like a hundred other explainer channels.
  - **Best use:** the Leader Flags ranking channel, and the data beats inside the other two.

## A recommendation to test, not a verdict

The user decides by watching. My bet for Border Quirks is a hybrid:
- A's characters and paper props;
- B's real-relief map flights for the geography beats;
- C's kinetic numbers for the single biggest stat in each episode.

Each method also suits a different channel:

| Channel | Method |
|---|---|
| Border Quirks | A |
| Gut Gang | A, with the organ cast as the characters |
| Leader Flags | C |

## Engine findings along the way

1. **The `--use-angle=swiftshader` flag** (needed for WebGL) also moved the 2D canvas onto the emulated GPU, which
   was about 50× slower. The fix is `--disable-accelerated-2d-canvas`: WebGL stays on SwiftShader and 2D stays on
   the CPU rasteriser.
2. **Workers take runs of 12 consecutive frames** (it used to be one frame each), so a scene that caches work
   between frames can reuse it. B's 3D world renders on twos thanks to this.
3. **A storyboard can set `theme`** to override the bible's look; C uses `data-flags`, which is flat with no paper
   texture.
4. **An episode's `vendor/*.js` files load before its `scenes.js`**, which is how B loads Three.js.

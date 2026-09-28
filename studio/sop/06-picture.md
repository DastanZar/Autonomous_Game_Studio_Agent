# 06 · Picture (render and review)

**Goal:** frames with no layout defects, confirmed by looking at them twice.
**Inputs:** `storyboard.json`, `build/timeline.json`. **Outputs:** `build/sheet/*.png`,
`review.json`, then `build/frames/`.

## Tools

```bash
python3 studio/tools/geo.py episodes/<ch>/<slug>                 # map data for map scenes -> build/geo.json
node studio/engine/render.mjs episodes/<ch>/<slug> sheet         # one still per scene at its landed moment -> build/sheet/, build/contact.png
node studio/engine/render.mjs episodes/<ch>/<slug> frames 3.2,7  # stills at exact times
node studio/engine/render.mjs episodes/<ch>/<slug> full 4        # all frames -> build/frames/ (resumable; delete the folder after engine changes)
```
Every run writes `build/engine_report.json`. Read its **warnings**: unknown event verbs, props not in the library,
text that didn't fit, custom scenes without code. Each one is either a storyboard fix or an engine request.

## Steps

1. **Render a contact sheet** (`sheet` mode). It takes one still per scene at the moment everything in it has landed
   (pins, callouts, counts), plus the first and last frame, and tiles them in `build/contact.png`.
2. **Look at every still** (you need image input), against this checklist:
   - [ ] text is inside the bible's caption `safe_zone` (clear of the platform UI);
   - [ ] no text overlaps another text or crosses an edge;
   - [ ] nothing important is cropped (map regions, faces, numbers);
   - [ ] no empty or near-empty frames, and nothing still animating in when it should have landed;
   - [ ] numbers on screen match the dossier (digits and labels);
   - [ ] the channel look holds: palette, fonts, outline weight;
   - [ ] the first frame works as a thumbnail with no motion.
3. **Log the round** in `review.json`: `{at, reviewer, frames: [t, ...], defects: [{t, issue, fixed}]}`.
   Use the current UTC time for `at`.
4. Fix, re-render the sheet, and **look again**. Log round 2. The gate needs at least 2 rounds, no
   open defects in the last round, and the last review timed after the newest sheet.
5. Then render the full frame sequence (`render.mjs full 4`). It's resumable.

## Common failures
- **Trusting the sheet alone.** A still at the landed moment hides what happens before it. In the engine build a quote
  card was blank while the quote was being read; only frames pulled from the encoded MP4 showed it. Always spot-check.
- **Content defects are defects.** A label or pin text that no dossier claim supports is logged as an open defect,
  and the storyboard is fixed. The gate blocks until it is.
- Reviewing from memory of the code instead of the pixels. The gate can't tell, so be honest.
- Only checking scene starts. Check the frame where the main event has landed.
- Captions hidden by the Shorts UI (bottom 420 px, right 140 px at 1080×1920).

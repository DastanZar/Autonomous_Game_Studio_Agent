# 06 · Picture (render and review)

**Goal:** frames with no layout defects, confirmed by looking at them twice.
**Inputs:** `storyboard.json`, `build/timeline.json`. **Outputs:** `build/sheet/*.png`,
`review.json`, then `build/frames/`.

> **Tool status: to be built (phase 2).** The shared engine (`studio/engine/`) will turn
> `storyboard.json` into frames using the catalog and the channel theme. Until then, scenes are
> hand-written as in `videos/root-keys/render/scenes.js` on top of `lib.js`, and rendered with
> `render.mjs` (`sheet` mode for stills, `full` mode for frames).

## Steps

1. **Render a contact sheet:** one still per scene, at the moment its main event has landed,
   usually its start plus 0.6 s. Include the first and last frame.
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
- Reviewing from memory of the code instead of the pixels. The gate can't tell, so be honest.
- Only checking scene starts. Check the frame where the main event has landed.
- Captions hidden by the Shorts UI (bottom 420 px, right 140 px at 1080×1920).

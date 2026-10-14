# Direction for every scene (read with frame.md)

## Video direction

- **Palette arc:** S1 paper + Aicher rainbow in full colour; S2 paper→night, photos at 60% saturation; S3–S5 night,
  grayscale photos; S6–S9 ink, grayscale, with `--munich` blue as the only accent.
- **Motion grammar:** power3 long-tail; VO-paced reveals; one push or pan per photo in its first half, then hold;
  subtle jitter at most during holds.
- **Held beats (deliberate stillness):** the balcony photo (S4 end); "They're all gone." (S6 end); the names (S9).
- **Negative list:** no red; no bounce; no breathing loops; no text in the bottom 15%; no invented images (only
  the assets listed); never show violence beyond what the listed photos show; never glorify the attackers (no names
  or close-ups of them beyond the anonymous balcony figure).
- **Respect:** victims are named exactly as written here. The attackers' group is named only as "Black September".


## YouTube documentary grammar (USER REQUIREMENT, overrides anything simpler)

The user (14 Oct): "I don't want a collage running with narration, nothing that basic, an actual YouTube-style video."
Think Johnny Harris, Vox and the viral Opus motion pieces. **A photo on screen with narration over it is a failure.**
Every scene must use at least three of these, and never hold a plain static photo for more than about 2 s:
1. **Real archival motion:** cut-in clips from the 1972 Games film (`assets/internal/footage/games72.webm`; use the frame
   index sheets in `assets/internal/footage/index/`). Place them with `<video muted>` inside your scene, trimmed with
   `data-media-start`, and graded to the scene's palette.
2. **2.5D parallax on photos:** split a photo into 2–3 depth planes by duplicating it with `clip-path`/mask cut-outs (the
   subject plane slightly scaled, the background blurred more) and move the planes at different speeds; or a 3D tilt with
   `transformPerspective`. A camera move with depth, not a flat Ken Burns.
3. **Annotation on the image:** draw-on circles, arrows, brackets, callout leader lines and highlight boxes pointing at
   the thing the narrator names (svg-path-draw), with a Plex Mono label.
4. **Paper/print treatments:** newspaper-clipping cards with torn edges or drop shadows; a typed police-log strip; a
   ticker; date stamps.
5. **Maps that move:** a camera flight and zoom on the real map, with drawn routes and pins.
6. **Kinetic type cut to the voice:** words slam or flip in on the spoken syllable; numbers count up; lines type and
   retype.
7. **Match cuts and transitions:** a whip pan, a zoom-through or a light-leak flash between beats, velocity-matched.
8. **Texture:** film grain (host), gate weave on archival (a tiny per-frame offset driven by a seeded sine), and
   occasional film-burn or flash frames at seams.
Pace: a new visual event every 1.5–3 s. Something is always moving except on the three deliberately held beats.


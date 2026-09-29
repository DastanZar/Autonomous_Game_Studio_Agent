# body-cast and ranked: visual, character, animation and story directions (2026-09-29)

These are style tests, drawn in code by `studio/stylelab/`. Render them with `node studio/stylelab/lab_render.mjs <outdir>`.
Every number on these frames is a placeholder, and each frame carries a "not fact-checked" tag.
Pick one direction per channel. The winner becomes the channel's engine theme (`flat-cast` / `data-flags`)
and its bible `look` and `cast` entries, and only then does its music library get built.

## body-cast

### Direction A: Flat Cast (recommended)
- **Look:** flat vector with thick, rounded ink outlines (8 px).
  - Shading: one crescent shade and one highlight streak per shape.
  - Background: a warm pink "inside you" world of drifting cells, with soft grain.
- **Why:** it is distinct from why-map, reads instantly at phone size, and sits in the
  SolarBalls/Kurzgesagt taste zone without copying either.
- **Captions:** Anton white with an ink outline. Speech bubbles are Anton on white.

### Direction B: Paper Anatomy
- **Look:** the studio's paper-cutout look, turned into an old anatomy textbook.
  - Cream plate border, "PLATE IV" headers, "FIG. 1 — HEPAR" labels, engraving hatch.
  - Paper-strip limbs with brass split pins, 12 fps boil, and a red WINNER stamp.
- **Why:** deadpan and adult, and on-brand with why-map (one studio look).
- **Risk:** it is less "character-y" and less appealing to the SolarBalls audience.

### Cast (the same rig in both directions)
| Character | Design | Personality | Signature moves |
|---|---|---|---|
| Liver | Red-brown wedge, heavy lids, eye bags, coffee mug. Its gallbladder hangs underneath as a tiny green sidekick. | Overworked, passive-aggressive, quietly the most competent | Sips coffee, deadpan stare, slow smug win |
| Brain | Pink, folded, a crown worn slightly askew, brainstem neck | Vain, anxious, takes credit | Hands on hips, "I run this place", the crown falls when it's wrong |
| Heart | Red, great vessels on top like a quiff, sweatband | Earnest athlete, dramatic, never rests | Always beating (squash on each beat), pumps a fist |
| The Microbes | Rods, cocci and spirals in bile/neuron/lymph/sun colours | Chaotic crowd, secretly in charge | Hop in sync, all talk at once |
| Narrator | Off screen (Felix) | Dry, precise, slightly tired of everyone | — |

The cast can grow (kidneys, the immune system as a security team, the appendix as the useless intern).
Every new member uses the same rig: body path, face slot, limbs.

### Animation vocabulary (all functions of t, all keyed to spoken words in production)
- Idle: breathing squash-stretch, and seeded blinks every 2.2–4 s.
- Talk: mouth flap during the speaker's words.
- Enter: pop-in (back ease), or a walk-in with a leg cycle.
- Moods: neutral, happy, smug, tired, worried, shocked, angry, proud. Each sets brows, lids and mouth.
- Reactions: sweat drop, crown fall, burst lines, a stamp in B.
- Data: count-up bars and numbers sit under the characters. They are never inside a character.

### Story style
- **Structure: narrator plus cast.** Felix narrates the facts. Characters react on screen and deliver
  one-liners as typeset speech bubbles, which have no voice of their own.
  - This keeps within the Fish free quota and keeps every claim in the narrator's sourced lines.
  - Voiced characters (one library voice each) can be a later upgrade once the format has proved itself.
- **Beats for a "versus" episode (25–45 s):**
  1. The matchup (0–3 s).
  2. The cocky character's claim, as a bubble.
  3. The first number.
  4. The twist number.
  5. The loser's reaction.
  6. A callback line.
- The joke is always a character's self-image colliding with a sourced number. Facts beat jokes.

## ranked

### Direction A: Flag Badges
- **Look:** a clean bar chart on off-white, with a round flag badge riding on each bar's tip.
  Badges have faces with the same 8 moods (smug leader with a crown, sweating underdog).
  Confetti when #1 lands, and the "obvious guess" parked below the chart.
- **Why:** faces give every ranking a story. It sits closest to what already pulls views
  (the countryball rankings), while being our own design: badge rim, typeset data, real sources.

### Direction B: Broadcast
- **Look:** a dark navy sports-broadcast leaderboard with slanted panels.
  - Medal rank boxes and waving code-drawn flags.
  - Values count up, and a gold glow and flash for #1.
  - An "outside the top 7" red strip, and a tale-of-the-tape versus card.
- **Why:** it looks premium and authoritative, and it scales to 20 rows and races through time.
- **Risk:** it has no characters, so it depends on the data surprise alone.

### Recommended: A for the hooks, B's panels for the long list
Use the badge look as the channel identity. Borrow B's versus card for the "Country vs country"
series, where there are only two badges on screen.

### Story style
- **Tone:** a dry sports commentator who is unimpressed by the leader and delighted by the underdog.
- **Per-person beats:**
  1. Hook with the obvious guess.
  2. Reveal 7 → 1, with 2–3 narrated reactions.
  3. The winner and the one-line reason.
  4. The obvious guess's real rank (callback).
- Every chart shows its source on screen. The badges react to the data; they never assert facts.

## What's next once you pick
1. Port the chosen rig into `studio/engine` as a theme, with scene types `character_dialog`,
   `character_explain`, `ranking_bars` and `ranking_race`.
2. Put the cast designs and moods into each bible, which closes its `open_decisions`.
3. Build each channel's music library (bible prompts: lab/inside, scoreboard/tally).

## Decided 2026-09-29
- body-cast: **Flat Cast**, organs confirmed. ranked: **Flag Badges**, plus the Broadcast versus card for Country vs country.
- body-cast backgrounds must be fun and animated, not the paper/Emu look.
  - Reference study (thumbnails only, kept private): Kurzgesagt body Shorts and SolarBalls. Their common traits:
    - deep indigo or purple grounds, or one saturated colour block;
    - neon subjects with glows;
    - a big radial blob behind the subject.
  - Five original set concepts, in `studio/stylelab/sets.js` (board: `docs/design/bc_sets_board.png`):
    1. **Bloodstream:** a tunnel with three parallax layers of red cells.
    2. **Neuron Night:** glowing neurons with pulses along the axons.
    3. **Stomach Acid:** churning folds over a bubbling pool.
    4. **Gut City:** swaying villi hills with microbe crowds.
    5. **Spotlight Stage:** spinning rays and a wobbling blob, for titles and versus.
  - The pale pink cell background from the first test is retired.

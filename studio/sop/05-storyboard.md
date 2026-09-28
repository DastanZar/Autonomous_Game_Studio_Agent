# 05 · Storyboard

**Goal:** a shot list the engine can render, where every change on screen lands on a spoken word.
**Inputs:** `script.json`, `build/timeline.json`, `engine/catalog.json`, the bible.
**Output:** `storyboard.json` (schema: `schemas/storyboard.schema.json`).

A storyboard is **data, not code**. You pick scene types from the catalog and fill their params. The
engine draws them in the channel's look, which keeps episodes consistent and makes the stage safe
for any model.

## Cues: how time is written

Never write seconds. Write a cue against the spoken timeline:

| Cue | Means |
|---|---|
| `0` | Frame one |
| `para` or `para.start` | When paragraph `para` starts |
| `para.end` | When it ends |
| `para/word` | When `word` is spoken in `para` (lowercase, only a-z, 0-9 and apostrophes: "thirty-two," becomes `thirtytwo`) |
| `para/word#1` | The second time that word is spoken there |
| any of the above `+0.3` / `-0.2` | Offset in seconds |

Scene changes usually sit 0.1–0.25 s **before** the paragraph starts (`sent.start-0.15`), so the
picture is ready when the voice lands.

## Steps

1. **One scene per beat**, usually one per 1–2 paragraphs. Each scene must last between
   `format.min_scene_s` and `format.max_scene_s`. In practice Shorts change picture every 2–4 s.
2. **Choose the type** from the bible's `scene_types`. Read each type's `purpose` in the catalog.
   Prefer, in order:
   1. a type that shows the fact (a map for a place, `count_up` for a number, `versus` for a contest);
   2. a type that shows the joke (`stamp_reveal` for a one-word punch).
3. **Fill params only with dossier facts.** Put labels on qualified numbers (`count_up.qualifier`).
   A quote card uses the exact `quote` text.
4. **Add events** for things that change inside a scene. `do` should use a verb the engine knows: `reveal`, `draw`,
   `count_start`, `count_stop`, `highlight`, `verdict` or `emphasize` (a word containing one counts, e.g. `flag_reveal`).
   Props must come from the catalog's `props` list. For maps below country scale, add `detail: [{"osm": "<place>", "iso": "XX"}]`. Key each one to the word that triggers it,
   and add an `sfx` name where a sound helps.
5. **The first scene** starts at `0` and must work as a thumbnail. **The last scene** is an
   `outro_loop` that echoes the first scene, so the replay is seamless.
6. **When no scene type fits:**
   1. first, try to rephrase the beat so one does;
   2. otherwise, use `custom` with `params.why`. Keep custom scenes under 20% of the runtime; the
      gate measures it;
   3. if the same custom need comes up twice in a channel, propose a new catalog type in your
      report. A catalog change is an engine task, not a storyboard task.
7. Run the check. Every cue must resolve against the real timeline: scene starts and ends, events,
   and any `at` inside params (pins, callouts, timeline events). Title cards allow 8 words, stamps 3.

## Worked example
`studio/examples/emu-war/storyboard.json`. 14 scenes; 2 are custom (14% of runtime).
- Title card, then stamp LOST, then the map with a 20,000 count-up.
- Then the telegram, the inventory callouts, the ambush and the truck (versus).
- Then the tally (count-up with "the major's own count"), stamp 10 PER BIRD, and the quote card.
- It ends on an outro loop that echoes the opening.

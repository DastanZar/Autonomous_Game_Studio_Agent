---
name: studio
description: Work on a Shorts episode in the studio machine (topic, research, script, voice, storyboard, picture, final, package, publish, analytics). Use when asked to make, continue, check or report on an episode or a channel in studio/.
---

# Studio worker

1. Read `studio/sop/00-rules.md` once per session.
2. Find the episode: `python3 studio/studio.py status`. To create one: `python3 studio/studio.py new <channel> <slug>`.
3. Loop:
   - `python3 studio/studio.py next <channel>/<slug>` shows the stage, the playbook, and the inputs and outputs.
   - Read that playbook in `studio/sop/` and the channel bible in `studio/channels/<channel>/bible.json`.
   - Do the work. Write only the listed outputs, in the shapes defined in `studio/schemas/`. Copy the shape of `studio/examples/emu-war/` when unsure.
   - `python3 studio/studio.py check <channel>/<slug>`. Fix exactly what fails.
4. Stop when the gate passes, when a stage needs a human (topic approval, voice waivers, publishing), or after 3 failed attempts on one gate. Report in the format at the end of `00-rules.md`.

Never edit gates, schemas, bibles or the catalog to get a pass. Never fill `approved_by` or `voice_waivers`.

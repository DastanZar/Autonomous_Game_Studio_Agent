# Decision log and project map

This is the one place to catch up. It lists every decision made so far, where the detail lives, and
what is still open. It is updated with every step we take; newest entries are at the top of the log.

## Start here

1. **How the three channels were chosen:** `docs/research/channel-selection.md`. It covers the research,
   the benchmarks, why each pick won, and what was parked.
2. **Everything we said, word for word:** `docs/log/`, one file per chat session, with every user message
   verbatim and every reply. Nothing is too minor for it.
3. **This page:** decisions, open items and the map of files.

## Open decisions (waiting on you)

| # | Decision | Options / recommendation | Detail |
|---|---|---|---|
| 1 | body-cast visual direction | A Flat Cast (recommended) or B Paper Anatomy | `docs/design/body-cast-ranked-directions.md`, board `docs/design/bc_board.png` |
| 2 | ranked visual direction | A Flag Badges (recommended), plus B's versus card; or B Broadcast | same doc, board `docs/design/rk_board.png` |
| 3 | body-cast cast voices | Recommended: narrator only (Felix), with characters speaking in typeset speech bubbles. Voiced cast later. | same doc, "Story style" |
| 4 | Channel names and handles, all 3 | Working names: Why the Map Looks Like That / The Body Cast / Ranked | `studio/channels/*/bible.json` → `open_decisions` |
| 6 | Confirm the body cast (organs) vs another cast. You were asked on 2026-09-28 and it isn't explicitly answered yet. | We've proceeded with organs | `docs/research/channel-selection.md` |
| 5 | Keep Felix as the narrator voice for all channels? | Alternatives are in `videos/voice-test/` | why-map bible |

## Blocked (needs something from outside this container)

- **Fish voice:** there is no OpenRouter key in the container, so every episode so far uses the Piper
  draft voice. To unblock, add `OPENROUTER_API_KEY` as an environment secret.
- **Stable Audio Open SFX:** too slow on this CPU (678 s per 1.5 s clip). Run `studio/tools/sfx_gen.py`
  on your RTX 3060 laptop.
- **Baarle episode:** the picture gate fails on one unsourced on-screen label ("NETHERLANDS: NOT
  ALLOWED"). A worker fixes the storyboard.

## Decision log (newest first)

| Date | Decision | Why | Where it's recorded |
|---|---|---|---|
| 2026-09-29 | Two style directions per channel mocked for body-cast and ranked (character rig: 8 moods, blink, talk, walk). Music for these channels waits until you pick. | You asked to settle the visuals, characters, animation and story style before music | `docs/design/body-cast-ranked-directions.md`, `studio/stylelab/` |
| 2026-09-29 | All 4 why-map music tracks approved (caper, spy, detective, march) | You listened and approved | `studio/assets/music/why-map/manifest.json` |
| 2026-09-29 | Audio stack: ACE-Step 1.5 for music (MIT, one library of 4 tracks per channel), Kenney CC0 for SFX, Stable Audio Open for missing SFX, code-synth fallback. Music sits about 8 dB under the voice. | Best free option that allows commercial use; no Content ID risk | `docs/research/audio-stack-2026-09.md`, `studio/tools/audio.py`, `music_gen.py` |
| 2026-09-29 | Music is used only after a human listen (`approved: true`) | We can't verify audio by ear | `studio/tools/music_gen.py`, SOP 07 |
| 2026-09-28 | Render engine: storyboard.json → frames in headless Chromium. Real maps from Natural Earth and OSM. 11 scene types. | One engine for all channels; frames are pure functions of t | `studio/engine/`, `studio/engine/catalog.json` |
| 2026-09-28 | Sonnet trial passed: 3 why-map episodes (Point Roberts, Swiss invades Liechtenstein, Baarle) made by Sonnet in a separate chat, audited and merged. Fixes went into the gates and SOPs. | Proves a cheaper model can run the machine | `episodes/why-map/*/review.json`, `studio/knowledge/lessons.md` |
| 2026-09-28 | Sonnet runs in a separate chat, with manual copy-paste between chats. No automated session creation. | Your choice | this log |
| 2026-09-28 | Studio machine: per-episode state machine with 10 stages (topic → analytics), a deterministic gate per stage, channel bibles, SOP playbooks and a knowledge base. Human-only fields: approvals, voice waivers, music approval. | So any model can plug in and keep quality consistent | `studio/README.md`, `studio/sop/`, `studio/studio.py` |
| 2026-09-28 | Quotes must be verified against fetched sources (contiguous text) before the research gate passes | The Sonnet trial produced a stitched quote | SOP 02, `studio/tools/verify_quotes.py` |
| 2026-09-29 | Every chat is logged word for word in `docs/log/` and kept current each turn | You asked for detailed logs of everything | `docs/log/`, `CLAUDE.md` |
| 2026-09-28 | Three launch channels: **why-map** (quirky geography and history), **body-cast** (organs as characters), **ranked** (country data rankings) | The highest view pullers our pipeline can make without paid video models | `docs/research/channel-selection.md`, `docs/plan/launch-plan.html`, `docs/research/shorts-niches-2026-09.md` |
| 2026-09-28 | Blender works here (bpy), but it isn't the primary engine | The code renderer is faster and fully deterministic | `docs/research/shorts-niches-2026-09.md` |
| 2026-09-28 | Workflow: push straight to `main`, no PRs. Secrets never in git (HF token lives only at `~/.cache/huggingface/token`). | Your instruction | `CLAUDE.md`, this log |
| before 2026-09-28 | Earlier work happened in another chat (the MAREA / Emu War / Keys to the Internet session). Its transcript isn't readable from here; its outputs are in the repo. | — | `docs/handoff/`, `recipes/`, `videos/`, `shorts/` |
| earlier | Emu War short and Keys to the Internet explainer shipped; the Emu recipe was validated at 29/29 | The quality floor | `AGENT_PROMPT.md`, `recipes/emu-war/` |

## Project map

| You want to review… | Open |
|---|---|
| The rules every video follows | `AGENT_PROMPT.md` |
| Why these niches and channels | `docs/research/channel-selection.md` (the decision trail), `docs/research/shorts-niches-2026-09.md` (raw data) |
| Exactly what was said, when | `docs/log/` |
| How the machine works | `studio/README.md`, then `studio/sop/00-rules.md` … `10-analytics.md` |
| A channel's full spec (voice, look, cast, series, music prompts) | `studio/channels/<channel>/bible.json` |
| What went wrong before and the fix for each | `studio/knowledge/lessons.md` |
| Episode status and review rounds | `episodes/<channel>/<slug>/` (`review.json`); `python3 studio/studio.py status` |
| Music and SFX choices | `docs/research/audio-stack-2026-09.md` |
| Visual directions for body-cast and ranked | `docs/design/` |

# The studio machine

A production line for fact-checked animated Shorts across several channels. Its design goal is that
**any capable model, Sonnet included, can take one stage of one episode, follow a playbook, and
either pass a deterministic gate or say exactly why it couldn't.** Consistency comes from files, not
from the model's memory.

```
             ┌────────────── channel bible (look · voice · cast · series · rules) ──────────────┐
             ▼                                                                                   ▼
 topic ─▶ research ─▶ script ─▶ voice ─▶ storyboard ─▶ picture ─▶ final ─▶ package ─▶ publish ─▶ analytics
  │  ▲        │          │         │          │            │          │         │          │          │
 gate│      gate       gate      gate       gate         gate       gate      gate       gate       gate
  │ HUMAN                                                                                           │
  │ approves                          knowledge/ (lessons · hooks · style · performance) ◀──────────┘
```

## The five building blocks

| Block | Where | What it guarantees |
|---|---|---|
| **1. Contracts** | `schemas/*.schema.json` | Every stage hands the next one a file with an exact shape. A model can't "sort of" do a stage. |
| **2. Channel bibles** | `channels/<id>/bible.json` | Everything that must stay the same across a channel's episodes: promise, voice, palette, fonts, cast, series formats and their beats, script rules, allowed scene types, source rules, publishing settings. A new channel is a new bible, not new code. |
| **3. Playbooks** | `sop/00-rules.md` … `sop/10-analytics.md` | The how: steps, a worked example from the Emu War, and the common failures of each stage. |
| **4. Gates** | `gates/`, run by `studio.py check` | Deterministic checks that never call a model: schemas, sourcing, labels, runtime, captions, cue resolution, WER, loudness, specs. A stage is done only when its gate passes. |
| **5. State machine** | `studio.py` + each episode's `state.json` | Knows every episode's stage, blocks work whose inputs haven't passed, and marks a stage **STALE** when an upstream file changes after it passed. |

Plus two supporting pieces:
- **Scene catalog** (`engine/catalog.json`): a storyboard is data (scene types plus params keyed to
  spoken words), not free-form code. Models choose; the engine draws. That's how three channels stay
  on-brand.
- **Knowledge** (`knowledge/`): lessons already paid for, hook patterns with evidence, the house
  style, and a performance log that the analytics stage appends to. It's the studio's memory.

## Run it

```bash
pip install -r studio/requirements.txt
python3 studio/studio.py selftest                 # gates vs the gold example + 13 deliberate breakages
python3 studio/studio.py new why-map <slug>        # <slug>: your topic, e.g. some-border-story
python3 studio/studio.py next why-map/<slug>
python3 studio/studio.py check why-map/<slug>
python3 studio/studio.py status
```

For an agent: read `sop/00-rules.md`, then loop **next → playbook → work → check** (the `studio`
skill in `.claude/skills/studio/` says exactly this).

## What's built and what isn't (2026-09-28)

| Piece | State |
|---|---|
| Schemas, 3 channel bibles, 11 playbooks, knowledge base | **Built** |
| Gates for all 10 stages; state machine with staleness | **Built**; `selftest` passes |
| Gold example (Emu War) through topic, research, script, voice, storyboard, final and package | **Built.** Real sources and excerpts; WER and loudness measured on the shipped file |
| `tools/final_check.py` (specs, LUFS, true peak, final-mix WER) and `tools/textnorm.py` | **Built and run** on the Emu short |
| Voice tool (`tools/vo.py`: bible-driven, Fish or Piper, cast voices, whole-transcript alignment) | **Built**; run on 3 episodes (Sonnet trial + engine build) |
| Render engine (`engine/`: 12 catalog scene types, 10 props, real maps via `tools/geo.py`, burned captions, sheets, full frames) | **Built** for the paper-cutout theme (why-map). Planned: ranking_bars/race and character scenes (Ranked and Body Cast channels), their themes |
| Encoder (`tools/encode.py`) | **Built**: two-pass x264, measured −14 LUFS |
| Music and SFX: `tools/audio.py` (mixer, measured ducking), `tools/music_gen.py` (ACE-Step 1.5 library builder), `tools/sfx_gen.py` (Stable Audio Open), Kenney CC0 SFX library | **Built**; see `docs/research/audio-stack-2026-09.md` |
| SRT and thumbnail builder | Next |
| Topic radar (daily candidate cards per channel) | Phase 3 |
| YouTube upload and analytics via API | Phase 3. Needs the channel owner's OAuth client as an environment secret |
| Daily scheduler (a Routine that runs radar → queue → workers) | Phase 3 |

## How it scales

- **More channels:** copy a bible, change it, and run `studio.py bible <id>`. If the new format
  needs new scene types, add them to the catalog and the engine once; every channel can then use
  them.
- **More episodes in parallel:** episodes are independent folders. Several workers can run on
  different episodes at once. The only shared budget is Fish TTS (50 requests a day), which the
  voice tool will track.
- **Cheaper models:** the stages that need judgment (topic approval, voice waivers) are human by
  design. Everything else is checked. Watch where a model fails its gate most, then add a worked
  example or tighten that playbook. Don't lower the gate.
- **Quality ratchet:** every failure worth remembering goes into `knowledge/lessons.md`. Every
  performance pattern that holds over 5 or more episodes goes into `hooks.md` or `style.md`.

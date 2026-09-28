# Handoff: animated explainer track (paper-cutout)

**This chat is for:** the code-rendered, paper-cutout animated explainers. Vertical shorts and
long-form, in the style of Half as Interesting, Vox and Johnny Harris. No realistic humans here;
that's the separate presenter track (`docs/handoff/presenter-character.md`).

**Read first:** `AGENT_PROMPT.md` (the studio's method, hard rules and definition of done). It
loads automatically via `CLAUDE.md`.

## What's shipped (all on `main`)
| Item | Where | Notes |
|---|---|---|
| The Great Emu War: 46 s, 9:16 short | `shorts/emu-war/` | Piper voice (`en_US-ryan-high`, American male; the user loved it and thought it sounded Australian) |
| The Keys to the Internet (Sort Of): 5:40, 16:9 | `videos/root-keys/` | Fish S2.1 voice "Felix" (Australian); reusable engine in `render/lib.js` |
| Emu War recipe: 8 step-by-step docs | `recipes/emu-war/` | Validated in a clean folder: grader 29/29, audio identical, 1,099/1,105 frames byte-identical |
| Voice shoot-out: Piper vs six Fish voices | `videos/voice-test/` | The user hasn't picked a favourite yet |
| Research notes | `videos/RESEARCH.md` | §1 covers the Opus 5.5 video wave |

## Studio machine (phase 1, 2026-09-28)
`studio/`: bibles for 3 channels (why-map, body-cast, ranked), playbooks, gates, state machine, and the
Emu War as a gold example. `python3 studio/studio.py selftest` must pass. Phase 2 = voice tool plus the shared
storyboard engine. See `studio/README.md`.

## Open threads
1. **Sonnet reproduction test.** The user wants to see whether a cheaper model (Sonnet) can rebuild
   the Emu War from `recipes/emu-war/00-START-HERE.md`. A perfect run ends with `SCORE 29/29`. Next
   idea offered: a **spec-only** recipe (plain-language description, no code) to test whether a
   cheaper model can *create*, not just follow.
2. **Voice choice.** Ask the user to listen to `videos/voice-test/` and choose. The default is Fish
   "Felix".
3. **Next video.** The user likes niche, surprising, true topics (Half as Interesting style). Pick
   one, fact-check it and follow the method in `AGENT_PROMPT.md`.
4. **Known caveat:** the description of the merged PR #1 says the recipes are "bit-identical". That's
   true for the audio; the frames are 1,099/1,105 identical, the other 6 invisibly different.

## Environment notes
- **OpenRouter:** the key is at `~/.config/openrouter/key` (never commit it). It's free tier with a $0
  balance: only `fish-audio/s2.1-pro-free:free` works (50 requests/day). Image, video and music
  models return 402.
- **Git:** the user asked for pushes **straight to `main`**, no PRs.
- **File delivery limit:** 30 MB per file. Send a small preview, plus the master split with
  `ffmpeg -f segment -c copy` and a join file.
- **Cloud containers are temporary:** keys and installed tools don't persist. Reinstall per
  `recipes/emu-war/01-environment.md`, and ask the user to add secrets as environment variables in
  the environment settings.

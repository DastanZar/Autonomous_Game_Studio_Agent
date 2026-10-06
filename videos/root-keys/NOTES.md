# The Keys to the Internet (Sort Of): discussion and decisions

Folder: `videos/root-keys`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

### 🧑 User · 2026-09-28 06:20 UTC

This chat is the user's dedicated thread for the paper-cutout animated explainer pipeline (the Emu War / Keys to the Internet style). Read docs/handoff/animated-shorts.md and AGENT_PROMPT.md first. Then post a short hello to the user: a 3-line status of what's shipped and the open threads, and ask which one they want to start with (Sonnet reproduction test, voice choice, or the next video). Don't start heavy work until they answer. Push straight to main (no PRs) when you commit.

#### Claude · 2026-09-28 06:20 UTC

Hi, this is the thread for the paper-cutout explainers. I've read the handoff brief and `AGENT_PROMPT.md`. Here's where things stand:

1. **Shipped (all on `main`):**
   - **The Great Emu War:** a 46-second vertical short with the Piper voice.
   - **The Keys to the Internet (Sort Of):** a 5:40 widescreen explainer with Fish "Felix" and the reusable `lib.js` engine.
   - **The Emu War recipe:** 8 step-by-step docs. A clean rebuild scored 29/29 on the grader.
2. **Open threads:**
   - **Sonnet reproduction test:** can a cheaper model rebuild the Emu War from the recipe?
   - **Voice choice:** the shoot-out in `videos/voice-test/` is still waiting on your pick. The default is Felix.
   - **Next video:** new topic still to pick.
3. **Caveats:**
   - Merged PR #1 calls the recipes "bit-identical". That's true for the audio. For the frames, 1,099 of 1,105 match exactly; the other 6 differ slightly but you can't see it.
   - The OpenRouter key has $0 credit, so only the free Fish voice works, capped at 50 requests a day.
   - This container is fresh, so I'll reinstall the tools once we start work.

Which do you want to start with: **the Sonnet test, the voice choice, or the next video?** If it's the next video and you have a topic in mind, tell me. Otherwise I'll come back with one pick that has a hook and sources.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

dont you already have the key, you were making videos right? and of all the content we have generated so far which is multiple videos where is it all stored

#### Claude · record

- **No OpenRouter key here** (neither env nor ~/.config). The Emu War and Keys to the Internet videos were voiced in the earlier MAREA session, whose container had the key; it was never stored centrally. The why-map episodes used the free Piper draft voice.
- **Inventory:**
  - Emu War MP4 is in git.
  - Keys to the Internet: only the SRT and thumbnail are in git; the master parts were gitignored and lived in the old container (status unknown).
  - Point Roberts and Swiss MP4s existed only on this container. Now force-added to git (c5a4e3a).
  - Baarle has no final MP4.
- **Creating a GitHub Release** as a media store was blocked (403 for this session type).
- DECISIONS row: storage rule.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

what is this other other chat and other machine excuse, everything is inside this claude account right? why cant we have all the multimedia data, thumbnails videos scripts everything centralised via our dashboard and going forward have all the chats centralised too so we dont have this information cut off anywwher

#### Claude · record

- **Explained:** each session runs on its own temporary machine. The account keeps the chat, but not that machine's files.
- **Built:**
  - a dashboard Media library: a video player, thumbnail and script per episode, plus the pilots. The workflow copies `out/` media into the Pages site;
  - a Chat logs section on the dashboard;
  - an AGENTS.md rule: push to main, commit media, log every chat, keys in the vault.
- Tried to reach the earlier MAREA session so it could push its Keys to the Internet master and chat log. It is not reachable from here (no listed agents), so nothing was sent.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

okay let the video go, can we atleast moving forward, have all the information we discussed about each video, just the chat contents, save all that atleast?

#### Claude · record

- Built `studio/tools/notes.py`, which writes a NOTES.md per video folder (3 why-map episodes, Emu War, Keys to the Internet). Each file has:
  - a hand-written Notes section that is kept across rebuilds;
  - every chat message mentioning the video, with the user message that prompted it;
  - the review rounds and trial-report excerpts.
- The dashboard build regenerates the files, and every Media library card links to "discussion". AGENTS.md has the rule.
- Limit: chats from other sessions are included only if those sessions wrote to docs/log (now required). The earlier MAREA and Sonnet trial transcripts are not readable from here; what survives of them is in TRIAL-REPORT.md, review.json and what was pasted into this chat.

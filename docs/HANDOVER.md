# Handover (updated 2026-10-15)

Start a new session by reading this, then `docs/DECISIONS.md` (open decisions, Vision board, blocked), then run
`python3 studio/studio.py next`. The full history is in `docs/log/2026-09-28-studio-chat.md`; don't reread it unless needed.

## In flight
- **Orchestration and Session Meter (22 Oct):** see `docs/handover/2026-10-22-orchestration.md`. Next: enforce delegation in the mod, ship the agents in the plugin, handle panel handover requests on wake.
- **Uploads (manual, by the user):** Border Quirks and Gut Gang, per `docs/publish-kit-2026-10.md`.
  - Gut Gang episode 2 (`body-cast/stomach-acid`) was re-voiced with Fish 'friendly' on 15 Oct. Its kit slot (13 Oct)
    has passed; the user picks the new time.
  - When the user says uploads are done: verify the schedule via the API and run `channel_setup.py sort` for playlists.
- **Laptop AI b-roll for Munich:** the user runs `videos/munich-1972/ai-broll/LAPTOP.md` in a laptop session (Remote
  Control). Clips land in `videos/munich-1972/assets/ai/`. Then composite them into the Munich video.
  - The internal photos and footage aren't in git. The user has a private zip backup, sent 14 Oct.
- **Voice choice:** 'friendly' is now on episode 2; Hannah is on episodes 1, 3 and 4.
- **Supply:** Border Quirks has videos up to 21 Oct (plus 28 Oct); Gut Gang up to 22 Oct. The next batches are needed.

## Open, waiting on the user
These are on the dashboard and in `docs/DECISIONS.md`:
- 0f: laptop setup, and the user's country (needed for the MiniMax H3 licence);
- 0g: a Zack D. Films-style Gut Gang pilot;
- the pencil channel's name;
- the fifth channel (Inside Job);
- the Munich likes and issues (Vision board).

## How to run (from 15 Oct, user-approved)
- **Repo settings:** `.claude/agents/` has Explore and researcher on Haiku (read-only) and worker on Sonnet;
  `.claude/settings.json` sets the Opus advisor.
- **Episode production:** a Sonnet 5.5 session with the Opus advisor.
- **Visual and creative calls:** Opus.
- **One session per job.** Update this file at the end of each job.

## Recent outputs (15 Oct)
- **Research:**
  - `docs/research/local-studio-stack-2026-10.md`
  - `docs/research/zackdfilms-style-2026-10.md`
  - `docs/research/token-economy-2026-10.md`
- **Experiments:** `videos/experiments-2026-10-15/` (4 code films; the murmuration render was stopped by the user).

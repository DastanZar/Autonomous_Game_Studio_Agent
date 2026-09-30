# Start here (any model, any session)

You are joining a running studio that makes fact-checked animated YouTube Shorts for three channels.
Nobody will re-explain anything. Everything you need is in this repo:

1. Run `python3 studio/studio.py next`. It prints the studio's next job, how to do it, and everything else open.
2. Read `studio/sop/00-rules.md` once, then the playbook or backlog detail the job points to.
3. Do the job. Prove it with the gate (`python3 studio/studio.py check <episode>`) or the backlog task's `done_when`.
4. Record it:
   - append the turn to `docs/log/` (the user's words verbatim, what you did, what failed);
   - update `docs/DECISIONS.md` if a decision changed;
   - update `studio/backlog.json` status;
   - run `python3 studio/studio.py dashboard` and commit `docs/dashboard.html`. The public site (https://dastanzar.github.io/Autonomous_Game_Studio_Agent/) rebuilds itself on every push to main.
5. Commit and push to `main` (no PRs). Then run `next` again.

**Stop** and ask the user only for items whose `who` is `human` or `laptop`.

**Never:**
- fill `approved_by`, `voice_waivers` or music approvals yourself;
- commit secrets;
- edit gates or schemas to get a pass.

`AGENT_PROMPT.md` has the hard rules for video work. `docs/DECISIONS.md` is the history of why things are the way they are.

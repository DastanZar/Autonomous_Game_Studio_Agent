# 2026-10-22: is the Sonnet/Haiku orchestrator setup in place?

**User:** "have we implemented an orchestrator setup which maximizes our tokens and gives us max usage by using sonnet and haiku 5.5 family of models where needed?"

**Done:** checked only, nothing changed. The setup proposed in `docs/research/token-economy-2026-10.md` was applied on 15 Oct (commit 6d75c53):
`.claude/agents/` Explore and researcher on Haiku 5.5 (low effort), worker on Sonnet 5.5 (medium); `.claude/settings.json`
`advisorModel: opus`; the CLAUDE.md model-use line; the SOP 00 note that production sessions run on Sonnet 5.5 with the Opus advisor.
This session loaded all three agents. Not in `browser-agent` (no `.claude/agents/` there).

**Found:** the `/usage` before-and-after measurement on a Gut Gang episode was never logged, so the savings are unverified.
Choosing Sonnet as the main model for a production session is still a manual pick at session start; nothing switches it automatically.

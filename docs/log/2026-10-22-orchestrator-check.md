# 2026-10-22: is the Sonnet/Haiku orchestrator setup in place?

**User:** "have we implemented an orchestrator setup which maximizes our tokens and gives us max usage by using sonnet and haiku 5.5 family of models where needed?"

**Done:** checked only, nothing changed. The setup proposed in `docs/research/token-economy-2026-10.md` was applied on 15 Oct (commit 6d75c53):
`.claude/agents/` Explore and researcher on Haiku 5.5 (low effort), worker on Sonnet 5.5 (medium); `.claude/settings.json`
`advisorModel: opus`; the CLAUDE.md model-use line; the SOP 00 note that production sessions run on Sonnet 5.5 with the Opus advisor.
This session loaded all three agents. Not in `browser-agent` (no `.claude/agents/` there).

**Found:** the `/usage` before-and-after measurement on a Gut Gang episode was never logged, so the savings are unverified.
Choosing Sonnet as the main model for a production session is still a manual pick at session start; nothing switches it automatically.

---

**User:** "if session length matters more, add a mod that notifies me the user when a certain session has crossed a certain point post which its too expensive to run, and then give a button which ports the current progress to a new session and we continue there, also in the mod please add context window stats, usage stats and all that but aesthetic clean and gorgeous"

**User (mid-turn):** "make sure haiku and sonnet run at high effort, and the orchestration is intelligent on when which models get called and for what and how opus does it plus when opus decides it needs to do it itself, eveyrting basically taken as an intelligent deciison"

**Done:**
- Built the `session-meter` mod (in the session's mods folder, copied to `.claude/mods/session-meter/` so it survives the container). The pane shows a context ring gauge (desktop and mobile; text bars in the terminal), the session total, a sparkline of cost per turn, the plan's 5-hour and weekly windows, and three limits as bars. Defaults are 250K context, $3 a turn and $60 a session, changed with `/meter limits`. Crossing 70% shows a toast; crossing 100% sends a notification and adds a band above the prompt. **Continue in a new session** (or `/meter handover`) has the model write the handover (this repo: `docs/HANDOVER.md`), push it and call `create_session`; the pane then links to the new session.
- Checks: `claude plugin validate` passes (warnings only: no author, licence or icon); `tsc` is clean; `claude plugin test` passes (draws on terminal, desktop and mobile, crosses the limit, and the button submits the handover prompt). Not yet seen running live: it loads once the user answers the "turn on mods" question.
- The agents now run at `effort: high`, with descriptions that say when to use each one. New `docs/orchestration.md` holds the routing rule (six questions in order, how to brief, when Opus takes work back, which main model per session). CLAUDE.md's model-use line and SOP 00 point to it.
- Choices: limits are absolute (tokens, dollars), not a percentage of the window, because cost scales with tokens re-read, and the window is 1M on Opus. The advisor stays on for every session (settings can't switch it per model); the doc says to use it sparingly on an Opus main.
- Not done: the `/usage` measurement is still outstanding. `browser-agent` is unchanged.

---

**User:** (ran `/meter`, which said "Session meter opened.") "Shouldnt the mod be turned on by default in each chat, always visible? i cant see it"

**Done:**
- Likely cause: the app this session is viewed in did not seat the pane, and `/meter` did not check. `/meter` now reports whether the pane was drawn, and if not, why and on which surfaces.
- Added an always-on one-line summary above the prompt (context, spent, cost per turn, 5-hour %). It works where panes don't, and gains the alert and buttons past a limit. Fixed a bug in the old band: a variable named `h` shadowed the JSX factory and would have crashed the draw. The test now draws the band on terminal, desktop and mobile.
- "Every chat": the repo is now a plugin marketplace (`.claude-plugin/marketplace.json`, name `studio-mods`), and `.claude/settings.json` declares it and enables `session-meter@studio-mods`. Tested in a throwaway config: marketplace add from GitHub, then install, both succeed. For cloud sessions the dependable route is two lines in the environment's setup script (README). That's a user-side setting I can't change.
- Not verified: whether the cloud runtime auto-installs project-declared marketplaces without the setup-script lines.

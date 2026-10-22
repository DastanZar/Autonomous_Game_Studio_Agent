# Handover: enforced orchestration and the Session Meter (22 Oct 2026)

From session `session_013vs7U4UG8bfw2uk6GVR6Fk` ("Token optimization with Sonnet/Haiku orchestrator"). It was handed over
because it reached about 300K tokens of context on Opus: every request re-read all of it.

## The goal

The user wants two things:
1. Model orchestration that **always works, in every session and every repo**: cheap models do the reading and the
   bounded jobs, and Opus keeps only judgement.
2. An always-visible cost meter that tells them when a session has become too expensive, with a one-click handover
   to a fresh session.

## What exists (all merged to `main`)

| Piece | Where | State |
|---|---|---|
| Subagents: `Explore` and `researcher` (Haiku 5.5), `worker` (Sonnet 5.5), all `effort: high` | `.claude/agents/` | Work, but only in this repo |
| Routing rule (six questions, in order; when Opus takes work back) | `docs/orchestration.md`, CLAUDE.md "Model use" | **Advisory only. Not followed**, see the audit below |
| `advisorModel: opus` | `.claude/settings.json` | On for every session |
| session-meter mod: `/meter` text meter; in-chat alert at 70% and 100%; pane and band (desktop, terminal and IDE only); `/meter handover`; reports figures to the panel after each turn; checks the panel for handover requests every 60 s | `.claude/mods/session-meter/` (`hooks/register.tsx`, `types/`, `tests/`) | Works. Checked: `tsc`, `claude plugin test`, a live write to the panel (ok, version 2) |
| Session Meter panel (claude.ai artifact, pinned in the sidebar) | https://claude.ai/artifact/DJi4GZJYZrKox92i9cqdCx; source `.claude/mods/session-meter/panel.html` | v4, Notion-like, no emojis. Reads collection `sessions`; its button writes `requests/<session id>` `{handover: ms}` |
| Marketplace `studio-mods` | `.claude-plugin/marketplace.json` + `extraKnownMarketplaces` and `enabledPlugins` in `.claude/settings.json` | Install from GitHub tested in a scratch config |

## Facts learned (don't re-discover them)

- The claude.ai **browser** view of a cloud session attaches **no surface** for mods (`$.session.surfaces()` was
  empty). There a mod reaches the user only through slash-command output and the model's replies.
- From an artifact page, the built-in **Claude Code Remote** connector returns `blocked_by_policy`, and the user has no
  setting to change it. So the page can't list sessions or send messages; it uses its own `db` instead.
- A mod **can** call `ArtifactData` through `$.tool.call` with no approval prompt.
  - Reads return `"version":N`; sets return "now at version N".
  - A `set` on an existing document needs `if_version`.
- **Idle cloud containers are shut down.** A mod's timers don't run while a session sleeps, so a handover request
  from the page waits until the session wakes. The user pressed the button at 06:35, the container restarted at
  06:36 when they wrote, and the request was handled by hand.
- Audit of the old session (transcript `~/.claude/projects/-home-user/<id>.jsonl`): 264 requests, **all Opus**,
  **0 subagent calls**, 51.9M cache-read tokens. The routing rule is text; Opus ignored it.
- `claude plugin validate|test`, plus `tsc` with the tsconfig from the plugin-authoring skill's types header, are the
  checks for the mod.

## Next steps, in order

1. **Make delegation enforced, in the session-meter mod** (rename it if a better name fits, e.g. `studio-orchestrator`).
   Add a `tool.call` hook on the main thread only (no `agentId`):
   - `WebSearch` and `WebFetch` → `{ deny }` with "Send web lookups to the researcher subagent (Haiku)".
   - Read-only exploration (`Read`, `Grep`, `Glob`, and read-only `Bash` such as cat, grep, find, ls, sed -n, head,
     tail): allow the first 3 per user turn. From the 4th on, `{ deny }` with "Delegate this reading to the Explore
     subagent (Haiku) and keep only its summary; see docs/orchestration.md".
     - Always allowed: reading a file the turn is about to Edit, and paths under `.claude/` or `docs/orchestration.md`.
     - Reset the counter on `prompt.submit`.
   - Apply it only when the main model is Opus or Fable (`$.session.model()`): a Sonnet main is cheap enough.
   - Add a `/meter orchestration` line showing this session's subagent calls by model, and a deny count.
   - Test it in `tests/` with a mock: three reads pass, the fourth is denied, a subagent's read passes.
2. **Make it work in every repo:**
   - Move the three agent definitions into the plugin (`agents/` at the plugin root, which plugins can ship), so every
     session that loads the plugin has them. Keep the repo copies or delete them, whichever avoids duplicate names.
   - Give the user the two setup-script lines from `.claude/mods/session-meter/README.md`, for their cloud
     environment (environment menu → Edit → Setup script). That's their action, not yours.
3. **Pending handover from the page:** check `requests/<session id>` in `session.start` and on every
   `prompt.submit`, not only on the timer, so a request made while the session slept runs as soon as it wakes. After
   acting, delete the request document (`if_version`). The page should say "Picked up when that session is next
   active" when it writes a request.
4. Update `docs/orchestration.md` (enforcement now exists), `docs/DECISIONS.md` and the log, then commit and push.

## Don't

- Don't use emojis in the panel. The user called that "kiddy".
- Don't build more pages or commands as a substitute for an in-chat panel. The user knows the browser can't show
  one, and accepted the pinned page.
- Don't run this session on Opus for mechanical work. Delegate the reading.

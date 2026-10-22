# session-meter

A Claude Code mod that shows how heavy the session has become, and moves the work to a fresh session when it gets
too expensive to keep going.

**Where it shows.** The claude.ai web and mobile views of a cloud session attach no surface for mods, so no pane or band
can draw there (checked 22 Oct: `$.session.surfaces()` was empty). There:
- `/meter` prints the whole meter as text in the chat;
- the alert comes through the conversation: when a limit is crossed, Claude says so in one line at the start of its
  next reply and points to `/meter handover`.

In the Claude Code desktop app, the terminal or an IDE, it also draws a pane beside the chat and a summary line above
the prompt.

- **Context:** tokens re-read on every turn, against the model's window (ring gauge on desktop and mobile, text in the terminal).
- **Spend:** session total, cost of each turn (sparkline), and the average of the last three turns.
- **Plan limits:** the 5-hour and weekly windows with their reset times, when the plan reports them.
- **Limits:** context 250K tokens, $3 per turn and $60 per session by default. At 70% of a limit it shows a toast; at
  100% it sends a notification, adds a band above the prompt and puts the handover button first. Change the limits with
  `/meter limits <contextK> <turnUsd> <totalUsd>`; they are remembered across sessions.
- **Continue in a new session** (also `/meter handover`): asks the model to write a handover (the repo's own
  convention if it has one), commit and push it, then open a new cloud session that starts from it. The pane then
  links to the new session. Without the cloud session tools, it tells you to `/clear` and paste one line.

Dollar figures are the session ledger's list-price estimates; on a subscription they measure how fast the limits go.

## Install

This repo is a plugin marketplace (`.claude-plugin/marketplace.json`), and `.claude/settings.json` declares it and turns
the mod on for anyone who opens the project (Claude Code asks once to trust the marketplace).

At the prompt of a terminal session:

```
/plugin install session-meter --marketplace DastanZar/Autonomous_Game_Studio_Agent
```

For every cloud session, add these lines to the cloud environment's setup script (environment menu in the session's
title bar → Edit → Setup script):

```
claude plugin marketplace add DastanZar/Autonomous_Game_Studio_Agent
claude plugin install session-meter@studio-mods
```

While developing it, run `claude --plugin-dir .claude/mods/session-meter`.
Check it with `claude plugin validate` and `claude plugin test` in this folder.

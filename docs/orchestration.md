# Who does what: routing work between Opus, Sonnet and Haiku (22 Oct 2026)

The orchestrator (the main session's model, usually Opus 5.5) decides for every piece of work: do it itself, or send
it to a subagent. This page is the rule it follows. Why it matters: `docs/research/token-economy-2026-10.md`.

The agents live in `.claude/agents/`. All three run at **high effort** (user's call, 22 Oct): a cheap model thinking
harder is still far cheaper than Opus, and it fails less often, which saves Opus re-doing the work.

| Agent | Model | Tools | Returns |
|---|---|---|---|
| `Explore` | Haiku 5.5, high | Read, Grep, Glob, Bash (read-only) | Paths, line numbers, short excerpts, a one-line conclusion |
| `researcher` | Haiku 5.5, high | WebSearch, WebFetch, Read | `claim \| source URL \| date` rows, then what's uncertain |
| `worker` | Sonnet 5.5, high | All | What changed, each check's result, what's left undone |

## The decision, in order

Ask these in order. Stop at the first answer.

1. **Is it a judgement the user will see or feel?** Taste, creative choices (hook, script voice, scene picks), visual
   review of frames and contact sheets, what to recommend to the user, anything with safety, secrets, money or
   publishing at stake → **Opus does it itself.** Delegating these saves little and costs quality.
2. **Is it smaller than its own spec?** If writing the brief and checking the result would take as long as doing it
   (a one-file edit, a single known file to read, a command whose output is short) → **Opus does it itself.**
3. **Is it mostly reading?** Finding where something lives, reading a big file or log for a few facts, scanning many
   files → **`Explore` (Haiku).** Rule of thumb: when the input is over ~20K tokens and the answer is a few lines.
4. **Is it a fact from the web?** → **`researcher` (Haiku).** Several independent questions → several researchers
   in one message, in parallel.
5. **Can it be written as a closed spec?** Files to touch, the deliverable, the check that proves it, what not to
   touch → **`worker` (Sonnet).** This covers multi-file code changes, tests, mechanical pipeline stages (re-voice,
   render, gates, packaging), and turning researcher rows into a draft dossier. Independent jobs go out in parallel,
   in one message.
6. **None of the above** (open-ended, ambiguous, needs the whole conversation) → **Opus does it itself**, and asks the
   user if a choice changes the output.

## How Opus delegates

- **Brief like a colleague who wasn't in the room.** The subagent starts cold: name the files, the goal, the check,
  the boundaries, and the shape of the reply. A vague brief is the main reason delegation fails.
- **Ask for summaries, not files.** Whatever a subagent returns lands in Opus's context, which is re-read on every
  turn.
- **Run independent jobs in parallel**, in one message.
- **Verify what ships.** Opus reads the worker's diff, or runs its check, before committing. For a researcher batch,
  Opus spot-checks at least one claim that will be published.

## When Opus takes the work back

- A worker reports the same check failing twice, or says the spec is ambiguous → Opus fixes the spec once. If it
  fails again, Opus does the job itself.
- An Explore answer is incomplete or contradicts what Opus already knows → Opus reads the named file itself. It
  doesn't send the same question again.
- Researchers disagree on a fact that ships → Opus reads the primary sources itself.
- The job turns out to need a taste or visual judgement → it comes back to Opus (rule 1).

## Which main model for which session

| Session | Main model | Advisor |
|---|---|---|
| Talking with the user, new formats, creative and visual decisions | Opus 5.5 | Attached anyway (`settings.json` applies to every session), but Opus-on-Opus is only a second opinion: call it only before a large or hard-to-undo plan |
| Episode production (voice, render, gates, package) by SOP | Sonnet 5.5 | Opus (`advisorModel: opus`); call it before a big plan, on a repeated error, before "done" |
| Research brief | Sonnet 5.5 synthesises | Opus spot-checks the claims that ship |

The main model is picked when the session starts (`/model`). Nothing switches it automatically.

## Keep sessions short

Most of the spend is the conversation being re-read on every turn, not which model does the lookups. Start one session
per job. The **session meter** mod (`.claude/mods/session-meter/`) shows context, cost per turn and plan limits beside
the chat. It warns when a session passes its limits and offers **Continue in a new session**: Opus writes the handover,
pushes it and opens a fresh session that starts from it.

## Enforcement (22 Oct 2026)

The rule above is no longer only advice. The `session-meter` mod (`.claude/mods/session-meter/`, plugin 0.2.0) has a
`tool.call` hook on the main thread of an Opus or Fable session: web lookups are denied ("send to researcher"), and
read-only exploration is denied from the fourth call of a user turn ("delegate to Explore"). Exempt: `.claude/`,
this file, files edited in the session, all subagent calls, and Sonnet mains. `/meter orchestration` prints subagent
calls by model and the deny count. The agents ship inside the plugin, so any repo that installs it gets them.
Each cloud environment needs the two setup-script lines in the mod's README (the user's action).

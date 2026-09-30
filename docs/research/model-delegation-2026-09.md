# When Opus should delegate to Sonnet 5.5 (2026-09-30)

**Source:** Theo (t3.gg), ["OpenAI should be scared of this one"](https://www.youtube.com/watch?v=8WbW_n95wc4).
YouTube blocked the video and its transcript from this container, so this is based on the episode summary on
[BigGo](https://finance.biggo.com/podcast/8491cd4c43421988) and a web search. I haven't watched it.

## What the video claims
- Sonnet 5.5 is **a bad model to select and a very good model to delegate to.** A person shouldn't drive it
  directly. An orchestrator (Opus or Fable) should hand it well-scoped sub-tasks.
- **Its sweet spot is reading and analysis.** On a deep architectural audit of a huge PR it cost about half as
  much as Opus, finished in about 5 minutes (Opus took nearly twice as long) and scored slightly higher on the
  judging panel.
- **Weak at design.** On front-end and visual design it was clearly worse than Opus. It produced scroll bugs,
  ugly cards and poor animation.
- **Cost trap:** cache reads were not discounted and dominate agentic work. On like-for-like coding it can cost
  as much as Opus. It is also very token-hungry: about 272k tokens per task on Cursor's benchmark.
- **Effort levels are budgets, not quality dials.** Going from x-high to max used about 15× the tokens and often
  scored worse.
- **Pattern:** the orchestrator gets the task, sends Sonnet to do reconnaissance or a bounded job, then plans and
  reviews with that result.

## How the studio applies it
| Work | Who |
|---|---|
| Codebase reconnaissance, audits, fact gathering, research dossiers, porting an **approved** design into code from a precise spec, running gates and fixing what they name | **Sonnet 5.5 subagent** (high effort, not max) |
| Visual and design decisions, new looks, reviewing contact sheets, final judgement on accuracy, anything the user will see first | **Opus** (the orchestrator) |
| Long unattended loops over the backlog | Sonnet session, with Opus reviewing its commits |

**Rules:**
- Give Sonnet a closed spec: files to read, deliverables, a check that proves each one is done, and what not to
  touch.
- Isolate parallel workers in separate git worktrees.
- Opus reviews every visual output before it merges.
- Never run max effort by default.

**First use (2026-09-30):** the three engine tasks (flat-cast, data-flags, map_history) went to three parallel
Sonnet subagents in worktrees, porting designs the user had already approved. Opus reviews their contact
sheets and merges.

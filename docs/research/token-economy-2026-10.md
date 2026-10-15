# Spending fewer tokens without losing quality: the three tips, checked (15 Oct 2026)

**The question (user):** three posts about delegating work between Claude models. Are they useful, and how should the
studio run across the board, given the 5.5-family prices?

**Sources:**
- Claude Code docs: [advisor](https://code.claude.com/docs/en/advisor), [subagents](https://code.claude.com/docs/en/sub-agents), [model config](https://code.claude.com/docs/en/model-config);
- Anthropic API prices (the claude-api skill's model table, cached 6 Oct 2026);
- this session's own usage record.

This container runs Claude Code 2.1.300, and no environment variable overrides the advisor, effort or subagents.

## Prices that matter (per million tokens, Anthropic API)

| Model | Input | Output | Cache read | Notes |
|---|---|---|---|---|
| Fable 5.1 | $10 | $50 | $0.25 | On some subscription plans Fable bills to **usage credits** (real money), including as an advisor |
| Opus 5.5 | $4 | $20 | $0.20 | Default effort `medium` |
| Sonnet 5.5 | $2 | $10 | $0.20 | Default effort `medium` in Claude Code |
| Haiku 5.5 | $0.10 | $0.50 | — | Prompts over 100K tokens cost $0.50 / $2.50 |

On a subscription, these don't come out of your pocket; they set how fast you use up the 5-hour and weekly limits.
Subagents and advisor calls count toward the same limits as the main conversation.

## Where our tokens actually go (this session)

The session record shows about **1.19 billion cache-read tokens**, 25.6 M cache writes, 3.4 M fresh input and 3.7 M
output: about **$475** at API rates.

- **Cache reads are most of it** (about $239 at Opus's $0.20).
- **The cause** is one very long conversation (300K+ tokens of context) re-read on every turn, plus many images I
  looked at directly (contact sheets, frames).
- **So the biggest lever isn't which model checks if a file exists.** It's keeping the main context small:
  1. Start fresh sessions per job.
  2. Send reading-heavy work (frames, web research, logs, big files) to cheap subagents that return a short summary.
  3. Keep huge tool outputs out of the main thread.

## The three posts: what's true and what isn't

| Claim | Verdict |
|---|---|
| **Advisor exists** (`/advisor`, `advisorModel`, `--advisor`); it reads the full transcript at decision points (before a plan, on a repeated error, before "done") | ✅ True (docs). Works on subscriptions too and counts toward limits. Each call re-reads the whole transcript with **no caching**, so it isn't free on long sessions |
| Opus main + **Fable** advisor (post 1) | ⚠️ Valid pairing, but a Fable advisor bills to **usage credits** on plans where Fable does. Don't turn it on without deciding to pay for that |
| **Sonnet main + Opus advisor + Haiku subagents** (post 2) | ✅ A pairing the docs list ("Sonnet handles routine work and escalates planning, ambiguous failures and completion checks to Opus") |
| Effort for Opus 5.5 must go in `modelSettings`; a top-level `effortLevel` in user settings doesn't apply to it | ✅ True. Note: a top-level `effortLevel` in **project** settings applies to every model |
| Override the built-in **Explore** by making a subagent named `Explore` with `model: haiku` | ✅ True |
| `haiku` means Haiku 5.5 from v2.1.293 | ✅ True on the Anthropic API (we're on 2.1.300) |
| `CLAUDE_CODE_EFFORT_LEVEL` overrides subagent effort; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` overrides subagent models; `DISABLE_TELEMETRY` turns the advisor off | ✅ True; none are set here |
| `claude --subagents haiku` flag | ❌ Not in the docs. Use subagent `model:` frontmatter or `CLAUDE_CODE_SUBAGENT_MODEL` |
| "Parallel dispatcher pool (3x workers)" setting | ❌ No such setting. The default is up to 20 concurrent subagents (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`) |
| "JEV micro-fork layer, 1,500 branches in 16 ms", "340 tok/s" | ❌ Not a Claude Code feature, and the speed is unverified. Marketing |
| "Automatically summon the advisor when an error repeats" | ⚠️ There's no setting to force advisor calls. A CLAUDE.md line asking for it is the only lever, and Claude still decides |
| Terminal-Bench 39.2% (Haiku) vs 70.6% (Sonnet), so Haiku only reads | ⚠️ Not verified, but the docs' own advice matches: Haiku for narrowly scoped lookups, not edits |
| `/autocompact 100k` on Haiku keeps prompts under the 100K price tier (post 3) | ✅ The mechanism is real (saved per model since v2.1.288; Haiku costs more above 100K). It matters on API billing; on a subscription it's harmless and may slightly stretch limits |

## How the studio should run (recommendation)

| Job | Main model | Helpers |
|---|---|---|
| **Talking with you, creative and visual decisions, final review of what you'll see** (this kind of session) | Opus 5.5, `medium` effort by default, `high` for new formats | Explore → Haiku; a researcher (Haiku) fetches pages and returns only facts with URLs; a Sonnet worker for bounded code jobs |
| **Episode production** (re-voice, render, gates, packaging, the upload kit): mechanical, with gates checking the work | **Sonnet 5.5** session, `medium` effort, **Opus advisor on** | Haiku for reading |
| **Research dossiers and fact tables** | Sonnet 5.5 synthesises | Haiku fetches and extracts; Opus spot-checks the claims that ship |
| **Frame and contact-sheet review** | Stays Opus (Sonnet is weaker at visual judgement: `model-delegation-2026-09.md`) | Haiku can pre-filter for obvious defects (empty frames, text in the bottom 15%) |

**Habits worth more than any setting:**
1. One session per job (an episode, a research brief), with a short handover note in the repo, instead of one giant
   thread.
2. Subagents return summaries, not files.
3. Look at one combined contact sheet rather than many single frames.
4. Don't paste long logs; tail them.

**Where the settings live:** in cloud sessions `~/.claude` is wiped with the container, so the settings belong in
the **repo**: `.claude/agents/*.md` and `.claude/settings.json`. Those persist and also apply on the laptop.

## Proposed change (not applied: waiting for your go-ahead)

1. **`.claude/agents/Explore.md`:** `model: haiku`, `effort: low`, tools `Read, Grep, Glob, Bash`; it returns paths
   and short excerpts only.
2. **`.claude/agents/researcher.md`:** `model: haiku`, `effort: low`, tools `WebSearch, WebFetch, Read`, no Edit or
   Write; it returns claim → URL rows only.
3. **`.claude/agents/worker.md`:** `model: sonnet`, `effort: medium`, full tools; it takes a closed spec (files,
   deliverables, the check that proves each one, what not to touch).
4. **`.claude/settings.json`:** `"advisorModel": "opus"`.
   - It only attaches when the main model ranks at or below Opus. On an Opus main it's an Opus-on-Opus second opinion.
     So for Opus orchestrator sessions, either leave it off or accept the extra spend.
   - Don't use Fable unless you agree to usage-credit billing.
   - Effort stays at each model's default.
5. **`CLAUDE.md`, one line:** "Consult the advisor before committing to a big plan, when the same error shows up
   twice, and before declaring a long task done. Send reading-heavy work to Explore or researcher subagents and
   keep only their summaries."
6. **`studio/sop/00-rules.md`:** studio worker sessions start on Sonnet 5.5 with the Opus advisor.

**What I can't measure for you:** your plan's exact limit accounting per model. The way to check is to run one
Gut Gang episode on the new setup and compare `/usage` before and after.

# Browser automation: give it any task, and it asks you only when a human must

A general-purpose browser agent that works in **your own Chrome** (your logins and cookies). It works on its own,
and stops for you only at three points:

| It pauses with | When | You do |
|---|---|---|
| `ask_human` | It needs a fact or preference only you have, and a wrong guess would matter | type the answer |
| `hand_over` | A login, 2-step code, passkey, CAPTCHA or "verify it's you" screen | do it in the Chrome window, press Enter |
| `confirm` | **Before** paying, sending, posting, deleting, publishing, accepting terms, changing security, billing or sharing, or a final submit | `y`, or say what to do instead |

It never tries to solve CAPTCHAs or bypass logins. Each pause rings the terminal bell. If you set
`NTFY_TOPIC`, it also pushes to your phone through [ntfy](https://ntfy.sh), so you can walk away.

## Setup (on your laptop, once)

```bash
cd tools/browser-automation
./start-chrome.sh                 # Windows: powershell -File start-chrome.ps1
#   A separate Chrome profile. Sign in to the sites you'll use (Google etc.) once, by hand.
python -m venv .venv && . .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export LLM_BASE_URL=<b.ai OpenAI-compatible endpoint>  LLM_API_KEY=<key>  LLM_MODEL=<model id>
export LLM_FALLBACK_MODEL=<second model id>      # optional: used if the main one errors or rate-limits
```

## Use

```bash
python agent.py "Compare the pro plans of Notion, Coda and Obsidian Sync; give me a table with prices and limits"
python agent.py --file tasks/my-task.md      # longer jobs: copy tasks/TEMPLATE.md
python agent.py --chat                       # one session, keep giving follow-ups
```

- **Run logs:** every run's full history goes to `runs/`.
- **Secrets:** `SECRET_<NAME>=value` lets it type a value it never sees. Write `<secret>NAME</secret>` in the task.
- **Domains:** `ALLOWED_DOMAINS` fences it to certain sites. The default is any site.

**Picking a model from your b.ai list:** the model matters more than the framework (see below).
- **Default:** your strongest, Qwen 3.8 Plus or MiMo v2.6 Pro.
- **Fallback:** a flash model (`LLM_FALLBACK_MODEL`).
- **Flash models alone:** fine for short, explicit checklists; expect more wrong turns on long, open-ended tasks.
- **Vision:** turn on `LLM_VISION=1` only if the model accepts images. It helps a lot on canvas-heavy or
  icon-only pages.

## The other two tools here

- **Claude Code drives the same Chrome** (`setup-claude.sh`, Playwright MCP). Use it for the hardest or riskiest
  jobs: a frontier model as the brain, and you're already in the chat to answer questions.
- **Free replays** (`replay.mjs` + `flows/`). Once a click path works, save it as a flow, and rerunning it costs no
  tokens. `gcp/setup.sh` is a reminder that if a site has a CLI or API, that beats any browser agent.

## Is Browser Use the best option? (checked Oct 2026)

**Short answer:** Browser Use is the best **open-source engine that runs on any model**, which is your situation.

The top benchmark scores come from closed products or frontier models, not from the open framework itself.
[Online-Mind2Web](https://leaderboard.steel.dev/leaderboards/online-mind2web/) is the standard live-web
benchmark: 300 tasks on 136 real sites.

| Option | What it is | Score / status | Fit for you |
|---|---|---|---|
| **Browser Use** (library, MIT) | Python agent that drives your Chrome, works with any OpenAI-compatible LLM; custom tools let it pause for you | Its hosted **cloud** agent tops Online-Mind2Web at 97% (proprietary model, paid). The open library's score depends on the model you give it. | **Chosen.** Your models, your browser, your logins |
| **ABP** (Agent Browser Protocol) | Open-source custom Chromium that freezes the page between steps, exposed as MCP | 90.5% with Claude Opus 4.6, the best open-source result | A strong upgrade for the **Claude Code** route; it needs a frontier model, and your b.ai models aren't one |
| **Stagehand v4** (Browserbase) | TypeScript, Python and Go SDK: AI where selectors break, code elsewhere | 55–65% | Better for building scripted products than for "do anything" |
| **Cua** (trycua) | Computer use for the **whole desktop** (any app), background control, VMs; driver at v0.30 (Sep 2026) | A driver, not a scored web agent | Pick it only if your tasks leave the browser (native apps, files). macOS first |
| **Skyvern, Browserbase, Steel** | Hosted browsers and workflow platforms | Paid | Not needed when it's your own accounts on your own machine |
| **ChatGPT Atlas, Claude in Chrome** | Consumer browser agents | 71% (Atlas) | Fine for one-offs. Locked to that vendor's model, not scriptable on your keys |

"browserclaw" and "Jev" turned up nothing in searches.

## Safety

- The `~/.agent-chrome` profile holds live sessions. Keep it local and don't sync it. CDP is bound to `127.0.0.1`.
- Keep `confirm` on (don't set `AUTO_CONFIRM=1`) for anything with money, messages or deletion.
- Keys come from environment variables only. `runs/` logs can contain page text, so they're gitignored.

## Verified (cloud container, headless Chromium 141, browser-use 0.13.10)

- `agent.py` against a mock model, with a scripted sequence of ask_human, then hand_over, then confirm (declined),
  then done, then a `--chat` follow-up task:
  - all three pauses fired;
  - each answer reached the model, and the declined purchase came back as "NOT approved";
  - the `SECRET_` value never appeared in the model's input;
  - it exited 0.
- `replay.mjs`: the success path, and a failure path that left a screenshot and the tab open.
- Playwright MCP attached over CDP; the `gcp/setup.sh` dry-run.
- **Not verified:**
  - Real websites with your logins.
  - Your b.ai models: their endpoint, their structured-output support, how well they browse.
  - The Windows launcher.

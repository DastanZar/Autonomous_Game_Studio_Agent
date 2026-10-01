# Browser automation: fewer clicks for admin work

There are three levels here. Use the cheapest one that can do the job.

| Level | What | Costs | Best for |
|---|---|---|---|
| **0. No browser** | `gcp/setup.sh`: gcloud commands, idempotent, `DRY_RUN=1` first | free | Anything Google Cloud has a CLI for: projects, APIs, IAM, service accounts, buckets, billing links. Most console clicking is this. |
| **1. AI drives your Chrome** | Claude Code + Playwright MCP (`setup-claude.sh`), or `agent.py` on your b.ai models | tokens | Console-only pages (the OAuth consent screen, OAuth clients, YouTube Studio settings), one-off tasks, or "figure out where this setting lives" |
| **2. Replay** | `replay.mjs flows/<flow>.mjs` | free, instant | A click-path you'll repeat. Do it once with level 1, then have Claude save it as a flow. |

All three use **one Chrome window with its own profile**, started by `start-chrome.sh` (or `start-chrome.ps1` on
Windows). Sign in to Google there **once**, by hand, with your 2-step verification. The agent never sees your
password: it reuses the logged-in session. You watch it work and can grab the mouse at any time.

## One-time setup (on your laptop, not the cloud container)

```bash
cd tools/browser-automation
./start-chrome.sh                      # Windows: powershell -File start-chrome.ps1
# sign in to console.cloud.google.com in that window, then leave it open

# Level 1a: Claude Code drives it (needs Node 18+)
./setup-claude.sh                      # registers the "browser" MCP server for Claude Code

# Level 1b: autonomous agent on your own models
python -m venv .venv && . .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export LLM_BASE_URL=...  LLM_API_KEY=...  LLM_MODEL=...   # b.ai's OpenAI-compatible endpoint + model id

# Level 2: replays
npm install
```

## Using it

**Ask Claude Code** (level 1a), in plain words:
> Using the browser, in project `my-proj`: configure the OAuth consent screen as External with app name X,
> add me as a test user, and create a Desktop OAuth client. Tell me before anything destructive.

**Run the agent on your models** (level 1b): write the task as a checklist, like `tasks/gcp-oauth-client.md`.
```bash
python agent.py --file tasks/gcp-oauth-client.md
python agent.py "In project my-proj, turn on the YouTube Data API v3 and show me its quota page"
```
It has guardrails: it only browses Google domains (`ALLOWED_DOMAINS`), it won't delete anything or touch
billing, it stops at password, 2FA or payment prompts, and it stops after 60 steps (`MAX_STEPS`).
Choosing a model: use your strongest one (Qwen Plus, MiMo Pro or GLM) for console work, since Cloud
Console pages are dense. Flash models are fine for short, explicit checklists. If your provider rejects
structured-output requests, set `LLM_JSON_MODE=0`. Only set `LLM_VISION=1` for a model that accepts images.

**Replay** (level 2):
```bash
node replay.mjs flows/gcp-enable-apis.mjs project=my-proj apis=youtube.googleapis.com,drive.googleapis.com
npx playwright codegen https://console.cloud.google.com    # record clicks; paste the body into a new flow
```
If a step fails, you get a screenshot in `failures/` and the tab is left open so you can finish by hand.

**Zero clicks** (level 0): edit the variables at the top of `gcp/setup.sh`, then:
```bash
gcloud auth login
DRY_RUN=1 PROJECT=my-proj gcp/setup.sh     # read every command it will run
PROJECT=my-proj gcp/setup.sh
```

## Why this stack (as of Oct 2026)

- **Playwright MCP** (Microsoft) reads the page's accessibility tree, not pixels, so it's fast, cheap and
  precise. `--cdp-endpoint` attaches it to your own Chrome. It's the most reliable way to give Claude Code
  a browser.
- **Browser Use** is the most popular open-source autonomous browser agent and works with any
  OpenAI-compatible model. That's why it's the one wired to b.ai.
- **Not chosen:**
  - **Stagehand**: a good TypeScript SDK, but it overlaps with what's above.
  - **Skyvern / Browserbase**: hosted, paid browsers, which you don't need for your own account.
  - **Cua**: full-desktop computer use with VMs, which is overkill for web consoles.
  - **Claude in Chrome**: the extension, an option if you'd rather not run a separate Chrome.

## Safety notes

- The `~/.agent-chrome` profile holds a live Google session. Don't share it or sync it anywhere.
  Port 9222 is bound to `127.0.0.1` only. Close that Chrome when you're done.
- Keys come from environment variables only. Never put one in a task file or commit it.
- AI agents misclick. For anything you can't undo, say "stop and ask me before clicking X" in the task.

## Verified here (cloud container, headless Chromium 141)

- `replay.mjs`:
  - The success path passed, and a failure path produced a screenshot, exit 1, and the tab left open.
  - Chrome stays alive after the runner disconnects.
- Playwright MCP 1.64 with `--cdp-endpoint` navigated and snapshotted a page in the attached browser.
- `agent.py` (browser-use 0.13.10) passed against a mock OpenAI-compatible server: navigate → done, exit 0,
  in both JSON modes.
- `gcp/setup.sh` dry-run printed every step.
- **Not verified:**
  - Real Google pages: there's no Google login in the container.
  - Your b.ai endpoint and models.
  - `start-chrome.ps1` on Windows.
  - The example flow's selectors against today's console.

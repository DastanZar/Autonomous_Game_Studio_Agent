# Chat log: 2026-10-01 browser automation

Every user message is verbatim. Secrets are redacted.

---

### 🧑 User · 2026-10-01 UTC

Can you set up browser automation which helps reduce my clicks, like for example i have a task of going into google cloud console and setting a bunch of things up, pure admin work but all those clicks will drain my time, ive been seeing a lot of bwoser automation things on my timeline on x, i would want something similar too

things like CUA and Jev and others is what ive been seeing, brwoserclaw, might be much more and better ones out there too

### 🧑 User · 2026-10-01 UTC (mid-turn)

I also have access to models like deepseekv4.1 flash, mimo v2.6 flash & pro, qwen 3.8plus, glm 5.3 flash via api key from b.ai

#### Claude · record

- **Checked on the web:**
  - Current open-source browser agents: Browser Use, Stagehand v4, Skyvern and Playwright MCP.
  - Cua (trycua) is full-desktop computer use with VMs.
  - "browserclaw" and "Jev" returned no results, so they aren't covered.
- **Decided:** three levels, cheapest first. gcloud scripts, then an AI driving your own Chrome, then free replays. Rationale in DECISIONS.
- **Built `tools/browser-automation/`:**
  - Chrome launchers: `start-chrome.sh` and `.ps1`, with a separate profile and CDP on 127.0.0.1:9222. Chrome 136+ blocks CDP on the default profile.
  - `setup-claude.sh`: registers Playwright MCP over CDP.
  - `agent.py`: Browser Use on any OpenAI-compatible model, configured through env vars. Guardrails: Google domains only, no deletes or billing changes, stops at password, 2FA or payment prompts, 60 steps at most.
  - `replay.mjs` plus the example flow `gcp-enable-apis`.
  - `gcp/setup.sh`: idempotent gcloud steps with DRY_RUN.
  - The task template `tasks/gcp-oauth-client.md` (ties in with the pending yt-api backlog item).
- **Verified (headless Chromium, in the container):**
  - replay: the success and failure paths, the screenshot, and Chrome surviving the disconnect.
  - Playwright MCP 1.64 navigating over CDP.
  - agent.py against a mock OpenAI server: exit 0 in both JSON modes.
  - The gcloud dry-run.
- **Failures fixed along the way:**
  - In the gcloud script, `>/dev/null` hid the IAM step's dry-run echo.
  - `sys.exit` inside asyncio caused noisy shutdown.
- **Not verified:**
  - Real Google pages (no login here).
  - The b.ai endpoint and its model ids; its base URL isn't known, so it's an env var.
  - The Windows launcher.

---

### 🧑 User · 2026-10-01 UTC

the google cloud task was just an example, i want a general use browser automation that can do anything based on the task defined to it and only ask for help where human intervention is the only way, is brwoser use the best option, what about cua latest and others

#### Claude · record

- **Checked on the web:**
  - **Online-Mind2Web (Steel leaderboard):** Browser Use Cloud bu-max is first at 97%, but it's proprietary. The best open-source entry is ABP + Claude Opus 4.6 at 90.5%. Stagehand scores 55–65%.
  - **Cua:** the driver reached v0.30 (Sep 2026). It's a whole-desktop, background computer-use driver, not a web-agent score.
  - **Browser Use library:** MIT; has custom Tools, `fallback_llm`, `sensitive_data` and `step_timeout`.
- **Decided:** keep Browser Use as the engine, because the b.ai models need a model-agnostic engine. ABP is recommended for the Claude Code route; Cua only for tasks outside the browser.
- **Rewrote `agent.py` as general-purpose:**
  - Three human tools: `ask_human`, `hand_over` and `confirm`, with a policy for when each is used.
  - Every pause rings the terminal bell, with an optional ntfy push to the phone.
  - `--chat` for follow-up tasks; `LLM_FALLBACK_MODEL`; `SECRET_*` values the agent types without seeing.
  - Every site allowed by default; runs saved to `runs/`.
  - `step_timeout` raised to 6 h, because the default 180 s would kill a step that's waiting on the human.
- Added `tasks/TEMPLATE.md` and rewrote the README with the comparison table.
- **Verified with a mock model:**
  - It scripted ask, then hand-over, then confirm (declined), then done, then a chat follow-up.
  - All three pauses fired, and each answer reached the model.
  - The secret value was absent from the model's input; exit 0.
- **Fixed:** two tasks in the same second wrote to the same run-log filename; the name now includes microseconds.
- **Not verified:** real sites and the b.ai models.

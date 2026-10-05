# Peer review of the browser agent (2026-10-05): verdicts

Another agent audited `browser-agent.zip` and compared it with its own build (Gradio, "Jev ultrafast DOM-only
mode"). The user gave Claude final authority. Each claim below was checked against the code, and the speed
claims against a benchmark with the real b.ai models.

## Benchmark (same signup task on a local test site, 2 runs per cell)

| Model / setting | Run 1 | Run 2 | Time waiting on the model |
|---|---|---|---|
| DeepSeek v4.1 Flash, default (Browser Use turns its screenshots off) | 80.2 s | 40.6 s | 94–95% |
| DeepSeek v4.1 Flash, screenshots off | 167.1 s | 45.5 s | 93–98% |
| **DeepSeek v4.1 Flash, fast mode** (`flash_mode`) | **37.0 s** | **33.5 s** | 86–87% |
| MiMo v2.6 Pro, screenshots on | 121.2 s | 39.1 s | 92–97% |
| MiMo v2.6 Pro, screenshots off | 171.5 s | 138.7 s | 95% |
| **MiMo v2.6 Pro, fast mode** | **35.7 s** | **45.7 s** | 91–92% |

- All 12 runs completed the signup.
- In all 4 fast-mode runs the model asked for approval itself before paying. In 5 of the 8 other runs it didn't,
  and the code gate is the backstop there.
- **Browser-side cost** (taking the screenshot and reading the page) was about 0.3–0.5 s per step.
- **The variance comes from the model:** long reasoning, and DeepSeek once produced a runaway 12k-token reply.

## Verdicts

| Review claim | Verdict | Evidence / action |
|---|---|---|
| Vision screenshots cause the 100–202 s runs ("15 s+ ScreenshotWatchdog stalls") | **Rejected** | The model is 86–98% of the time. Screenshots off made MiMo *slower* (more steps), and DeepSeek never used vision at all. |
| A DOM-only mode gives "sub-second steps" | **Rejected** | The fastest model calls averaged 3.2–4.0 s, so sub-second steps are impossible with these models. "Jev" is itself a model on b.ai (`jev-latest`); its speed would come from that model, not from turning vision off. |
| It needs a faster mode | **Accepted, a different fix** | Fast mode (`flash_mode`) is 2–4× faster in the benchmark, now on by default (dashboard checkbox, `--no-fast` in the CLI). Screenshots stay on where supported. |
| The dashboard forgets the previous task | **Accepted** | Follow-up is now on by default: `agent.add_new_task()` on the kept agent, so it stays on its page and keeps its history. *New conversation* resets it. Tested: the second request to the model held both tasks, and no new tab opened. |
| Polling clobbers the DOM; Gradio SSE is better | **Rejected** | Re-renders only happen on state change, and typing in the answer box is protected. Gradio would add a heavy dependency for no user-visible gain. |
| The dark-mode media query is a "trap" | **Rejected** | It follows the OS setting, and both palettes are high-contrast. |
| Node.js is required | **Partly** | Only the optional `replay.mjs` needs Node; the dashboard and agent are pure Python. |
| Windows `DETACHED_PROCESS` launches Chrome hidden | **Rejected** | `DETACHED_PROCESS` only affects console allocation, and the child inherits the user's interactive desktop. Unverified on real Windows, like the rest of the Windows path. |
| Its strengths (DevToolsActivePort attach, visible-tab hint, code gate, human tools, fallback model, secrets, token/Host guard) | Agree | Kept unchanged. |

"""General-purpose browser agent: give it any task in plain words; it asks you only when it must.

It drives the Chrome window that start-chrome.sh opened (your logins, your cookies). It works on
its own and pauses for you only when a human is the only way forward:
  ask_human    - information it can't find or infer (which plan? what to name it?)
  hand_over    - something only you can do in the browser: log in, 2FA, CAPTCHA, a passkey
  confirm      - before anything irreversible: pay, send, post, delete, submit, publish, accept terms

    export LLM_BASE_URL=https://<openai-compatible-endpoint>/v1  LLM_API_KEY=...  LLM_MODEL=...
    python agent.py "Find the 3 cheapest flights BLR->DEL on Friday and put them in a table"
    python agent.py --file tasks/my-task.md
    python agent.py --chat                      # keep giving it follow-up tasks in one session

Optional env:
  LLM_FALLBACK_MODEL  second model on the same endpoint, used if the main one errors or rate-limits
  LLM_VISION=1        send screenshots (only for models that accept images)
  LLM_JSON_MODE=0     if your provider rejects structured-output requests
  MAX_STEPS=100       step budget per task
  ALLOWED_DOMAINS     comma list (e.g. "*.google.com,github.com"); default: any site
  AUTO_CONFIRM=1      skip the confirm gate (not recommended)
  NTFY_TOPIC=...      also push "agent needs you" to your phone via ntfy.sh (the question text is sent)
  SECRET_<NAME>=...   values the agent may type without seeing them; refer to them as <secret>NAME</secret>
  CDP=http://127.0.0.1:9222
Each run's history is saved to runs/<timestamp>.json.
"""
import argparse
import asyncio
import os
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

from browser_use import ActionResult, Agent, Browser, ChatOpenAI, Tools

POLICY = """
HOW TO WORK
- Work autonomously. Do not ask for anything you can find, infer, or decide sensibly yourself.
  Pick reasonable defaults for unimportant choices and mention them in your final answer.
- If a site blocks you (rate limit, error page), retry another way before giving up.

WHEN TO INVOLVE THE HUMAN (only these):
- ask_human: you need a fact or preference only the human has, and a wrong guess would matter.
- hand_over: a login, password, 2-step code, passkey, CAPTCHA or "verify it's you" screen. Never
  try to solve or bypass these yourself. After the human finishes, re-check the page and continue.
- confirm: BEFORE any action that spends money, sends or posts something, deletes or overwrites
  data, changes security, sharing or billing settings, accepts terms, or submits a final
  form. Describe exactly what will happen. If the human declines, do not do it.

FINISH with: what you did, what you changed (if anything), defaults you chose, what you could not do.
"""


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        sys.exit(f"set {name} (see the top of agent.py)")
    return value


def notify(text):
    print("\a", end="", flush=True)  # terminal bell
    topic = env("NTFY_TOPIC")
    if topic:
        try:
            urllib.request.urlopen(urllib.request.Request(
                f"https://ntfy.sh/{topic}", data=text[:300].encode(), headers={"Title": "Browser agent needs you"}),
                timeout=5)
        except Exception as e:  # a failed push must never kill the run
            print(f"(ntfy failed: {e})")


async def prompt_human(header, text, hint):
    notify(text)
    print(f"\n{'=' * 70}\n{header}\n{text}\n{'-' * 70}")
    return (await asyncio.to_thread(input, hint)).strip()


def build_tools():
    tools = Tools()

    @tools.action("Ask the human a question only they can answer. Returns their answer.")
    async def ask_human(question: str) -> ActionResult:
        answer = await prompt_human("AGENT QUESTION", question, "your answer> ")
        return ActionResult(extracted_content=f"Human answered: {answer or '(no answer)'}",
                            long_term_memory=f"Asked '{question}', human said '{answer}'")

    @tools.action("Hand the browser to the human for a login, 2-step code, passkey, CAPTCHA or "
                  "identity check. Waits until they are done.")
    async def hand_over(reason: str) -> ActionResult:
        note = await prompt_human("YOUR TURN IN THE BROWSER", reason,
                                  "do it in the Chrome window, then press Enter (or type a note)> ")
        return ActionResult(extracted_content="Human finished in the browser. " + (f"Note: {note}" if note else "")
                            + " Re-check the current page before continuing.",
                            long_term_memory=f"Human handled: {reason}")

    @tools.action("Get the human's approval BEFORE an irreversible or consequential action "
                  "(pay, send, post, delete, publish, change security/billing/sharing, accept terms, final submit).")
    async def confirm(action_description: str) -> ActionResult:
        if env("AUTO_CONFIRM") == "1":
            return ActionResult(extracted_content="Approved (auto-confirm is on).")
        answer = await prompt_human("APPROVAL NEEDED", action_description, "approve? [y/N or instructions]> ")
        if answer.lower() in ("y", "yes"):
            return ActionResult(extracted_content="Approved. Go ahead.", long_term_memory=f"Approved: {action_description}")
        return ActionResult(extracted_content=f"NOT approved. Do not do it. Human said: {answer or 'no'}",
                            long_term_memory=f"Declined: {action_description}")

    return tools


def make_llm(model):
    json_mode = env("LLM_JSON_MODE", "1") == "1"
    return ChatOpenAI(model=model, base_url=env("LLM_BASE_URL", required=True),
                      api_key=env("LLM_API_KEY", required=True), temperature=0.2,
                      dont_force_structured_output=not json_mode, add_schema_to_system_prompt=not json_mode)


async def main():
    ap = argparse.ArgumentParser(description="General-purpose browser agent")
    ap.add_argument("task", nargs="?", help="what to do, in plain words")
    ap.add_argument("--file", help="read the task from a file")
    ap.add_argument("--chat", action="store_true", help="after each task, ask for the next one")
    args = ap.parse_args()
    task = Path(args.file).read_text() if args.file else args.task
    if not task and args.chat:
        task = input("task> ").strip()
    if not task:
        ap.error("give a task, --file, or --chat")

    domains = [d.strip() for d in env("ALLOWED_DOMAINS", "").split(",") if d.strip()]
    browser = Browser(cdp_url=env("CDP", "http://127.0.0.1:9222"), allowed_domains=domains or None,
                      keep_alive=True)  # your Chrome stays open when the agent stops
    fallback = env("LLM_FALLBACK_MODEL")
    secrets = {k[7:]: v for k, v in os.environ.items() if k.startswith("SECRET_") and v}
    agent = Agent(
        task=task.strip(), llm=make_llm(env("LLM_MODEL", required=True)),
        fallback_llm=make_llm(fallback) if fallback else None,
        browser=browser, tools=build_tools(), extend_system_message=POLICY,
        sensitive_data=secrets or None, use_vision=env("LLM_VISION", "0") == "1",
        max_failures=4, step_timeout=6 * 3600,  # a step may wait on you for a long time
    )

    Path("runs").mkdir(exist_ok=True)
    ok = True
    while True:
        history = await agent.run(max_steps=int(env("MAX_STEPS", "100")))
        out = Path("runs") / f"{datetime.now():%Y%m%d-%H%M%S-%f}.json"
        history.save_to_file(out)
        ok = bool(history.is_successful())
        print(f"\n=== result ({'done' if ok else 'not finished'}; log: {out}) ===")
        print(history.final_result() or "(no final answer; see the log above)")
        if not args.chat:
            break
        nxt = (await asyncio.to_thread(input, "\nnext task (blank to quit)> ")).strip()
        if not nxt:
            break
        agent.add_new_task(nxt)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

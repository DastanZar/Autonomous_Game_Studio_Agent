"""Autonomous browser agent (Browser Use) on any OpenAI-compatible model, e.g. your b.ai key.

It drives the Chrome window that start-chrome.sh opened, so it is already logged in to Google.
You watch it work and can take over at any moment.

    export LLM_BASE_URL=https://<your-b.ai-openai-compatible-endpoint>/v1
    export LLM_API_KEY=...                # never commit it
    export LLM_MODEL=qwen3.8-plus         # the exact model id your provider lists
    python agent.py "In project my-proj, open APIs & Services > OAuth consent screen and ..."
    python agent.py --file tasks/gcp-oauth-client.md

Optional env: LLM_VISION=1 (send screenshots; only for vision models), MAX_STEPS (default 60),
ALLOWED_DOMAINS (default Google Cloud + Google sign-in), CDP (default http://127.0.0.1:9222),
LLM_JSON_MODE=0 if your model rejects structured-output requests.
"""
import argparse
import asyncio
import os
import sys

from browser_use import Agent, Browser, ChatOpenAI

GUARDRAILS = """
Rules for this session:
- Work only inside the Google account and project named in the task.
- Never delete projects, resources, keys or users, never change billing, and never make anything
  public unless the task says so explicitly in those words.
- If a page asks for a password, 2-step verification or payment details, stop and report it.
- If something is ambiguous, stop and report the question instead of guessing.
- Finish with a short list of exactly what you changed, and anything you could not do.
"""


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        sys.exit(f"set {name} (see the top of agent.py)")
    return value


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("task", nargs="?", help="what to do, in plain words")
    ap.add_argument("--file", help="read the task from a file instead")
    args = ap.parse_args()
    task = open(args.file).read() if args.file else args.task
    if not task:
        ap.error("give a task or --file")

    json_mode = env("LLM_JSON_MODE", "1") == "1"
    llm = ChatOpenAI(
        model=env("LLM_MODEL", required=True),
        base_url=env("LLM_BASE_URL", required=True),
        api_key=env("LLM_API_KEY", required=True),
        temperature=0.2,
        dont_force_structured_output=not json_mode,
        add_schema_to_system_prompt=not json_mode,
    )
    domains = env("ALLOWED_DOMAINS",
                  "*.cloud.google.com,console.cloud.google.com,accounts.google.com,*.google.com")
    browser = Browser(
        cdp_url=env("CDP", "http://127.0.0.1:9222"),
        allowed_domains=[d.strip() for d in domains.split(",") if d.strip()],
        keep_alive=True,  # leave your Chrome open when the agent stops
    )
    agent = Agent(
        task=task.strip() + "\n" + GUARDRAILS,
        llm=llm,
        browser=browser,
        use_vision=env("LLM_VISION", "0") == "1",
        max_failures=3,
    )
    history = await agent.run(max_steps=int(env("MAX_STEPS", "60")))
    print("\n=== result ===")
    print(history.final_result() or "(no final result; see the log above)")
    return 0 if history.is_successful() else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

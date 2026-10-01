"""Shared pieces of the browser agent: models, Chrome connection, human-in-the-loop tools, policy.

Used by agent.py (terminal) and dashboard.py (web UI). The API key is read from BAI_API_KEY or
~/.config/bai/key and is never written anywhere else.
"""
import json
import os
import platform
import re
import shutil
import socket
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

from browser_use import ActionResult, Agent, Browser, ChatOpenAI, Tools

HERE = Path(__file__).resolve().parent
CONFIG = json.loads((HERE / "models.json").read_text())
MODELS = {m["id"]: m for m in CONFIG["models"]}

POLICY = """
YOU ARE WORKING IN THE HUMAN'S OWN BROWSER (their real tabs and logins).
- Do your work in a new tab unless the task is about a page that is already open.
- The human's other tabs are private. Do not read, search, switch to, close, reload or navigate
  them unless the task explicitly refers to them. Never inspect their storage, cookies or source.
- Never touch the agent dashboard tab (http://127.0.0.1:8770 or localhost:8770).

HOW TO WORK
- Work autonomously on HOW to do the task: navigation, finding settings, filling obvious fields,
  retrying when a site errors. Pick sensible defaults for unimportant details and list them at the end.
- If a site blocks you (rate limit, error page), retry another way before giving up.

WHEN TO INVOLVE THE HUMAN (only these):
- ask_human: a choice that is the human's to make (which plan or option, how much to spend, names,
  recipients, personal details) or a fact only they know, when the task doesn't say and a wrong
  guess would matter. Ask as soon as you reach that choice; do not hunt for hints elsewhere.
  Put all the questions you have at that point into one message, with the options you can see.
- hand_over: a login, password, 2-step code, passkey, CAPTCHA or "verify it's you" screen. Never
  try to solve or bypass these yourself. After the human finishes, re-check the page and continue.
- confirm: call it IMMEDIATELY BEFORE any click that spends money, sends or posts something, deletes
  or overwrites data, changes security, sharing or billing settings, accepts terms, or submits a
  final form. Describe exactly what will happen. If the human declines, do not do it.
  This is always a separate step: answers to ask_human (e.g. picking a plan) are NOT approval, so do
  not bundle "shall I proceed?" into ask_human.

FINISH with: what you did, what you changed (if anything), defaults you chose, what you could not do.
"""


# ---------------------------------------------------------------- models

def api_key():
    key = os.environ.get(CONFIG["key_env"])
    if not key:
        path = Path(os.path.expanduser(CONFIG["key_file"]))
        key = path.read_text().strip() if path.exists() else ""
    return key


def save_api_key(key):
    path = Path(os.path.expanduser(CONFIG["key_file"]))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(key.strip())
    try:
        os.chmod(path.parent, 0o700)
        os.chmod(path, 0o600)
    except OSError:  # Windows: the file lives in the user's own profile
        pass


def make_llm(model_id):
    if model_id not in MODELS:
        raise ValueError(f"unknown model {model_id!r}; choose from {list(MODELS)}")
    key = api_key()
    if not key:
        raise RuntimeError(f"no API key: set {CONFIG['key_env']} or save it in the dashboard")
    json_mode = MODELS[model_id]["json_mode"]
    # Reasoning models spend part of the budget thinking; 4096 (the default) truncated replies in tests.
    return ChatOpenAI(model=model_id, base_url=os.environ.get("LLM_BASE_URL", CONFIG["base_url"]), api_key=key, temperature=0.2,
                      max_completion_tokens=12000, max_retries=3,
                      dont_force_structured_output=not json_mode, add_schema_to_system_prompt=not json_mode)


# ---------------------------------------------------------------- Chrome connection

def default_chrome_dir():
    """Where Chrome keeps your normal profile; it writes DevToolsActivePort there when
    remote debugging is switched on at chrome://inspect/#remote-debugging (Chrome 144+)."""
    system = platform.system()
    if system == "Windows":
        base = os.environ.get("LOCALAPPDATA") or str(Path.home() / "AppData" / "Local")
        return Path(base) / "Google" / "Chrome" / "User Data"
    if system == "Darwin":
        return Path.home() / "Library" / "Application Support" / "Google" / "Chrome"
    return Path(os.environ.get("CHROME_CONFIG_HOME") or Path.home() / ".config") / "google-chrome"


AGENT_PORT = int(os.environ.get("AGENT_PORT", "9222"))
AGENT_PROFILE = Path(os.environ.get("AGENT_PROFILE") or Path.home() / ".agent-chrome")


def port_open(port):
    with socket.socket() as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def find_chrome():
    if os.environ.get("CHROME_PATH"):
        return os.environ["CHROME_PATH"]
    system = platform.system()
    if system == "Windows":
        roots = [os.environ.get(k) for k in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA")]
        cands = [Path(r) / "Google" / "Chrome" / "Application" / "chrome.exe" for r in roots if r]
    elif system == "Darwin":
        cands = [Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")]
    else:
        cands = [shutil.which(n) for n in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser")]
    for c in cands:
        if c and Path(c).exists():
            return str(c)
    raise RuntimeError("Chrome not found; set CHROME_PATH to chrome's executable")


def open_agent_chrome(url=None):
    """Start the agent's own Chrome (persistent profile in ~/.agent-chrome) if it isn't running,
    optionally opening `url` in it. Logins you make in this window persist across restarts."""
    if not port_open(AGENT_PORT):
        AGENT_PROFILE.mkdir(parents=True, exist_ok=True)
        args = [find_chrome(), f"--remote-debugging-port={AGENT_PORT}", "--remote-debugging-address=127.0.0.1",
                f"--user-data-dir={AGENT_PROFILE}", "--no-first-run", "--no-default-browser-check",
                *os.environ.get("CHROME_ARGS", "").split(), url or "about:blank"]
        kwargs = {"stdout": subprocess.DEVNULL, "stderr": subprocess.DEVNULL, "stdin": subprocess.DEVNULL}
        if platform.system() == "Windows":
            kwargs["creationflags"] = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            kwargs["start_new_session"] = True  # keeps running after the dashboard exits
        subprocess.Popen(args, **kwargs)
        for _ in range(60):
            if port_open(AGENT_PORT):
                break
            time.sleep(0.25)
        else:
            raise RuntimeError("the agent Chrome didn't start; is another Chrome using that profile?")
    elif url:
        req = urllib.request.Request(f"http://127.0.0.1:{AGENT_PORT}/json/new?{urllib.parse.quote(url, safe=':/?=&')}",
                                     method="PUT")
        urllib.request.urlopen(req, timeout=5).read()
    return f"http://127.0.0.1:{AGENT_PORT}"


def resolve_cdp(mode=None):
    """Return (cdp_url, description).

    mode "agent" - the agent's own Chrome window with its persistent profile (~/.agent-chrome);
                   started automatically if needed. Log in to sites there once; it stays logged in.
    mode "mine"  - your everyday Chrome and its open tabs (Chrome 144+, remote debugging on)
    mode "auto"  - "mine" if it's reachable, else "agent"
    Any other value is used as a CDP URL as-is.
    """
    mode = mode or os.environ.get("CDP", "auto")
    if mode not in ("auto", "mine", "agent"):
        return mode, f"custom endpoint {mode}"
    if mode in ("auto", "mine"):
        port_file = Path(os.environ.get("CHROME_USER_DATA_DIR") or default_chrome_dir()) / "DevToolsActivePort"
        try:
            lines = [l.strip() for l in port_file.read_text().splitlines() if l.strip()]
            port, path = int(lines[0]), lines[1]
            if not port_open(port):  # stale file left by a Chrome that has since closed
                raise OSError("not listening")
            return f"ws://127.0.0.1:{port}{path}", "your Chrome (existing tabs)"
        except (OSError, ValueError, IndexError):
            if mode == "mine":
                raise RuntimeError(
                    f"Can't reach your Chrome's debugging port ({port_file}). In Chrome 144+, open "
                    "chrome://inspect/#remote-debugging and switch on remote debugging, then retry.")
    return open_agent_chrome(), "agent Chrome window (its own logins)"


def make_browser(cdp_url):
    domains = [d.strip() for d in os.environ.get("ALLOWED_DOMAINS", "").split(",") if d.strip()]
    # keep_alive: never close your Chrome; the same session is reused across tasks, so Chrome's
    # "Allow remote debugging?" prompt appears once per dashboard session, not once per task.
    return Browser(cdp_url=cdp_url, allowed_domains=domains or None, keep_alive=True)


async def visible_tab_hint(browser):
    """Describe the tab the human is looking at, so 'this page' in a task means something."""
    try:
        for target in browser.session_manager.get_all_page_targets():
            if "127.0.0.1:8770" in target.url or "localhost:8770" in target.url:
                continue
            session = await browser.get_or_create_cdp_session(target.target_id, focus=False)
            res = await session.cdp_client.send.Runtime.evaluate(
                params={"expression": "document.visibilityState", "returnByValue": True},
                session_id=session.session_id)
            if res.get("result", {}).get("value") == "visible":
                return (f'(Context: you start in a new blank tab. The human\'s visible tab is "{target.title}" '
                        f'({target.url}, tab_id {target.target_id[-4:]}). Switch to it only if the task says '
                        '"this page", "this tab" or similar; otherwise leave it alone.)')
    except Exception:
        pass
    return ""


# ---------------------------------------------------------------- approval gate (enforced in code)

# Clicks on elements whose label matches this need an approval, even if the model forgot to ask.
# Deliberately leaves out everyday admin verbs (save, create, enable, next, continue) so routine
# work isn't interrupted; it targets money, messages, deletion, publishing, legal and security.
RISKY = re.compile(
    r"\b(pay|buy|purchase|order|checkout|check ?out|subscribe|upgrade|donate|tip|bid|"
    r"send|post|publish|share|tweet|reply|comment|invite|connect|follow|like|endorse|repost|"
    r"delete|remove|erase|destroy|terminate|shut ?down|revoke|reset|wipe|"
    r"transfer|withdraw|refund|cancel (?:my |the )?(?:account|subscription|plan|order)|close (?:my |the )?account|"
    r"confirm|submit|agree|accept|sign ?up|register|create (?:my |an |your )?account|book|reserve|apply)\b",
    re.I)
YES = ("y", "yes", "approve", "approved", "ok", "go", "go ahead")


class GateBlocked(Exception):
    pass


def _element_label(state, index, for_click=False):
    try:
        node = state.dom_state.selector_map.get(int(index))
    except Exception:
        node = None
    if node is None:
        return ""
    attrs = node.attributes or {}
    tag = (node.tag_name or "").lower()
    if for_click and (tag in ("label", "option", "select") or attrs.get("role") in ("checkbox", "radio", "option")
                      or (tag == "input" and attrs.get("type", "").lower() in ("checkbox", "radio"))):
        return ""  # ticking a box is reversible; the final submit is what gets gated
    parts = [node.get_all_children_text(), attrs.get("aria-label", ""), attrs.get("value", ""),
             attrs.get("title", ""), attrs.get("alt", "")]
    return " ".join(p.strip() for p in parts if p and p.strip())[:160]


class Gate:
    """Runs between the model's decision and the browser action (Browser Use step callback)."""

    def __init__(self, human):
        self.human, self.step, self.approved_at = human, 0, -99
        self.approved_labels = set()  # approvals the gate itself got cover only that exact element

    def note_approval(self):
        self.approved_at = self.step

    def _risky(self, name, params, state):
        if name == "click" and "index" in params:
            label = _element_label(state, params["index"], for_click=True)
            if label and RISKY.search(label):
                return f'click "{label}"'
        if name == "send_keys" and "enter" in str(params.get("keys", "")).lower():
            labels = [_element_label(state, i) for i in list(state.dom_state.selector_map)[:400]]
            hits = [l for l in labels if l and RISKY.search(l) and len(l) < 60]
            if hits:
                return f'press Enter on a page with a "{hits[0]}" button (may submit it)'
        if name == "evaluate" and re.search(r"\.(click|submit|requestSubmit)\s*\(|dispatchEvent", str(params.get("code", ""))):
            return "run JavaScript that clicks or submits something"
        return ""

    async def check(self, state, output, n):
        self.step = n
        if os.environ.get("AUTO_CONFIRM") == "1" or not output or state is None:
            return
        for action in output.action or []:
            for name, params in action.model_dump(exclude_none=True).items():
                label = self._risky(name, params or {}, state)
                # The model's own confirm() covers the next couple of steps; the gate's covers that element only.
                if not label or n - self.approved_at <= 2 or label in self.approved_labels:
                    continue
                answer = (await self.human("confirm", f"The agent is about to {label} on {state.url}. Allow it?")).strip()
                if answer.lower() in YES or answer.lower().startswith("yes"):
                    self.approved_labels.add(label)
                    continue
                raise GateBlocked(f"BLOCKED BY THE HUMAN: they did not approve this: {label}. Their reply: "
                                  f"{answer or 'no'}. Do not retry it. Use ask_human to ask what to do instead, or finish.")


# ---------------------------------------------------------------- human-in-the-loop tools

def build_tools(human, gate=None):
    """human: async (kind, text) -> str, with kind in {"ask", "handover", "confirm"}."""
    tools = Tools()

    @tools.action("Ask the human a question only they can answer. Returns their answer.")
    async def ask_human(question: str) -> ActionResult:
        answer = (await human("ask", question)).strip()
        return ActionResult(extracted_content=f"Human answered: {answer or '(no answer)'}",
                            long_term_memory=f"Asked '{question}', human said '{answer}'")

    @tools.action("Hand the browser to the human for a login, 2-step code, passkey, CAPTCHA or "
                  "identity check. Waits until they are done.")
    async def hand_over(reason: str) -> ActionResult:
        note = (await human("handover", reason)).strip()
        return ActionResult(extracted_content="Human finished in the browser. " + (f"Note: {note}. " if note else "")
                            + "Re-check the current page before continuing.",
                            long_term_memory=f"Human handled: {reason}")

    @tools.action("Get the human's approval BEFORE an irreversible or consequential action "
                  "(pay, send, post, delete, publish, change security/billing/sharing, accept terms, final submit).")
    async def confirm(action_description: str) -> ActionResult:
        if os.environ.get("AUTO_CONFIRM") == "1":
            return ActionResult(extracted_content="Approved (auto-confirm is on).")
        answer = (await human("confirm", action_description)).strip()
        if answer.lower() in YES or answer.lower().startswith("yes"):
            if gate:
                gate.note_approval()
            return ActionResult(extracted_content="Approved. Go ahead.", long_term_memory=f"Approved: {action_description}")
        return ActionResult(extracted_content=f"NOT approved. Do not do it. Human said: {answer or 'no'}",
                            long_term_memory=f"Declined: {action_description}")

    return tools


def make_agent(task, model_id, fallback_id, browser, human, on_step=None, vision=None):
    gate = Gate(human)

    async def step_hook(state, output, n):
        if on_step:
            on_step(state, output, n)
        await gate.check(state, output, n)  # may wait for the human, or raise GateBlocked

    secrets = {k[7:]: v for k, v in os.environ.items() if k.startswith("SECRET_") and v}
    if vision is None:
        vision = MODELS[model_id]["vision"] and os.environ.get("LLM_VISION", "1") == "1"
    return Agent(
        task=task.strip(), llm=make_llm(model_id),
        fallback_llm=make_llm(fallback_id) if fallback_id and fallback_id != model_id else None,
        browser=browser, tools=build_tools(human, gate), extend_system_message=POLICY,
        sensitive_data=secrets or None, use_vision=vision,
        register_new_step_callback=step_hook,
        # Start in a fresh tab so the human's tabs are never navigated by accident.
        initial_actions=[{"navigate": {"url": "about:blank", "new_tab": True}}],
        max_failures=4, step_timeout=6 * 3600,  # a step may wait on the human for a long time
        llm_timeout=150,  # the default 75 s was too short for flash models on long pages
        use_judge=False,  # extra LLM pass that grades the run; it added minutes and failed in tests
    )

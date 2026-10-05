# Making the browser agent a product anyone can install (2026-10-05)

**Today:** the agent runs on one laptop, needs Python, and uses the owner's b.ai key.

**Goal:** someone you share it with installs it and starts using it in minutes.

## The three ways to ship it

| | A. Desktop app (package what exists) | B. Chrome extension | C. Hosted cloud browsers |
|---|---|---|---|
| What the user does | Download an installer, double-click, paste a key | Click "Add to Chrome" in the Web Store | Sign up on a website |
| Where the agent and browser run | Their computer, a separate Chrome window | Their own Chrome, in a side panel | Your servers (Browserbase/Steel or your own VMs) |
| Their logins | Stay on their machine | Stay in their browser | You hold everyone's sessions: a security and legal liability |
| Bot-detection / ToS risk | Low (their device, their home IP) | Lowest (it *is* their browser) | High (datacenter IPs get blocked, and accounts get flagged) |
| Reuse of today's code | ~95% | The agent loop must be rewritten in TypeScript, or start from **Nanobrowser** (Apache-2.0, ~14k★, MV3 side panel, custom OpenAI-compatible providers) and port our gate, human tools and digest | ~70%, plus infrastructure, auth and billing |
| Time to a first shareable version | **2–4 days** | 2–4 weeks | 6+ weeks |
| Running cost to you | None (BYOK) | None (BYOK) | Browsers + LLM per user |

## Recommendation

**Ship A now, build B next, skip C.**

1. **A, the desktop app** (shareable this week):
   - **Installer:** a Windows installer and macOS app built with PyInstaller (or Briefcase). It bundles Python, so users install nothing else.
   - **First-run wizard:** paste an API key, pick a model, then sign in to sites.
   - **Polish:** a tray icon, auto-start, and update checks.
   - **Signing:** code-sign it, or Windows SmartScreen and macOS Gatekeeper will scare people off.
2. **B, the Chrome extension** (the real product):
   - It's the plug-and-play experience people know from Claude in Chrome and Comet: works in the browser they already use, logins included, nothing to install.
   - It uses the `chrome.debugger` permission, so Chrome shows its "debugging this browser" bar while it works.
   - **Store review:** the Web Store allows this, but asks you to justify the permission.
3. **The AI key:** start with bring-your-own-key, which costs you nothing.
   - **Your own key:** if you want "it just works" without a key, you need a small backend: user accounts, a proxy to b.ai or other providers, usage metering and billing.
   - **Never ship your own key inside an app or extension:** anyone can extract it.
4. **What carries over from today:** the safety pieces. The approval gate, the read-only digest mode, the password-field rule, the per-session token and the Host check. They're the product's moat as much as the agent.

Before anything ships to strangers, you'll also need a short privacy policy (what's sent to the AI provider: page text and screenshots) and terms that put responsibility for each site's ToS on the user.

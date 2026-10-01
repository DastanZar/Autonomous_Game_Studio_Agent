#!/usr/bin/env bash
# Give Claude Code "hands" in the Chrome window started by start-chrome.sh.
# Run once on your own machine (needs Node 18+ and the `claude` CLI). Works from PowerShell too:
#   claude mcp add --scope user browser -- npx -y @playwright/mcp@latest --cdp-endpoint http://127.0.0.1:9222
set -euo pipefail
PORT="${PORT:-9222}"
claude mcp add --scope user browser -- npx -y @playwright/mcp@latest --cdp-endpoint "http://127.0.0.1:$PORT"
echo "Done. Start Chrome with start-chrome.sh, then in Claude Code say e.g.:"
echo '  "In the browser, open console.cloud.google.com and enable the Gmail API for project X"'

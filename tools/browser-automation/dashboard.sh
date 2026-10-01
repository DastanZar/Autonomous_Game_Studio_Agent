#!/usr/bin/env bash
# One-click launcher for the browser agent dashboard (macOS/Linux). First run installs everything.
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x .venv/bin/python ]]; then
  echo "First run: creating .venv and installing (one-time)..."
  python3 -m venv .venv
  .venv/bin/python -m pip install -q --upgrade pip
  .venv/bin/python -m pip install -q -r requirements.txt
fi
ANONYMIZED_TELEMETRY=false exec .venv/bin/python dashboard.py

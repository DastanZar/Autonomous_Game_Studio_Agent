# One-click launcher for the browser agent dashboard (Windows). First run installs everything.
#   powershell -ExecutionPolicy Bypass -File dashboard.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path ".venv\Scripts\python.exe")) {
  Write-Host "First run: creating .venv and installing (one-time)..."
  py -3 -m venv .venv
  .venv\Scripts\python.exe -m pip install -q --upgrade pip
  .venv\Scripts\python.exe -m pip install -q -r requirements.txt
}
$env:ANONYMIZED_TELEMETRY = "false"
.venv\Scripts\python.exe dashboard.py

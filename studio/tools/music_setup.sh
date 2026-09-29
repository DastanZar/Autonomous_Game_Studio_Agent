#!/usr/bin/env bash
# One-time setup for studio/tools/music_gen.py (ACE-Step 1.5) and studio/tools/sfx_gen.py (Stable Audio Open).
#   bash studio/tools/music_setup.sh cpu     # cloud container / no GPU
#   bash studio/tools/music_setup.sh cu128   # NVIDIA GPU (e.g. RTX 3060 6 GB laptop), CUDA 12.8 wheels
# Creates ~/studio-audio-venv and ~/ACE-Step-1.5 (pinned to ca1e85f, the commit tested here). Needs ~12 GB disk
# (ACE-Step turbo DiT 4.5 GB + text encoder 1.2 GB + VAE 0.3 GB; Stable Audio Open ~5 GB).
set -euo pipefail
FLAVOR="${1:-cpu}"
[ -d ~/ACE-Step-1.5 ] || git clone https://github.com/ace-step/ACE-Step-1.5.git ~/ACE-Step-1.5
git -C ~/ACE-Step-1.5 checkout -q ca1e85f
python3.11 -m venv ~/studio-audio-venv
. ~/studio-audio-venv/bin/activate
pip install -q --index-url "https://download.pytorch.org/whl/$FLAVOR" torch==2.10.0 torchaudio==2.10.0 torchvision==0.25.0
pip install -q -e ~/ACE-Step-1.5 --no-deps
python - <<'PY'
import tomllib, subprocess, sys, os
deps = tomllib.load(open(os.path.expanduser("~/ACE-Step-1.5/pyproject.toml"), "rb"))["project"]["dependencies"]
keep = [d.split(";")[0].strip() for d in deps if not d.startswith(("torch", "torchvision", "torchaudio"))
        and ("sys_platform" not in d or ("linux" in d and "x86_64" in d))]
subprocess.run([sys.executable, "-m", "pip", "install", "-q"] + keep, check=True)
PY
pip install -q torchsde soundfile faster-whisper
echo "ready: ACESTEP_DIR=~/ACE-Step-1.5 ~/studio-audio-venv/bin/python studio/tools/music_gen.py <channel>"
echo "       (the first run downloads the turbo model; the unused 1.7B LM can be deleted from ~/ACE-Step-1.5/checkpoints)"

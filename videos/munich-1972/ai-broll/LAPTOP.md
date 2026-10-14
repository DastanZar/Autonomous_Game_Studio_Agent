# Laptop runbook: AI b-roll for the Munich 1972 test

**For:** the Claude Code session running on the user's laptop: RTX 3060 Laptop GPU (6 GB VRAM), 16 GB RAM (which can't be
upgraded), Windows.
**Written by:** the cloud session that built the video. That session composites the clips; it can't reach this machine.

## Goal

Generate the 9 shots in `shots.json` with local AI video models, **measure what this laptop can actually do**, and push
the clips to `main`. The cloud session then cuts them into the Munich video in place of code-drawn parts and renders it.

The longer-term aim is Shorts in the style of Vox, Johnny Harris and Cleo Abram (the format only: no lookalike of any
real creator, by the repo's hard rules). So the measurements matter as much as the clips.

## Rules (from `AGENT_PROMPT.md`, plus this test's own)

- **Anonymous reconstructions only.** No identifiable real people, no faces in close-up, no visible violence or blood,
  and no text or logos in frame. All on-screen text is set in code, later.
- **Prompts as written.** Use the prompts in `shots.json`, adding `style_suffix` and the `negative` prompt. If a prompt
  keeps failing (text appears, faces, modern objects), adjust its wording and record the change in `runs.json`.
- **Licences:** Wan 2.1 and 2.2 are Apache-2.0, so use them freely.
  - **LTX-2:** check its licence before use.
  - **MiniMax H3:** don't use it unless the user has confirmed their country. Its licence bars all use in the US, EU,
    UK and South Korea.
- **Secrets:** none are needed. Never print or commit tokens.
- **Honesty:** don't fake verification. Say what ran, what failed, and the real numbers.

## Steps

1. **Repo:** run `git pull origin main`. All work goes to `main`.
2. **Before each heavy run, free memory:** RAM is the hard limit on this laptop.
   - Close browsers and other GPU apps; `nvidia-smi` shows what is holding VRAM.
   - Plug in mains power and use the Windows high-performance (Best performance) power mode.
   - Check free disk space: the model downloads total 10–40 GB.
3. **Install Wan2GP** (deepbeepmeep/Wan2GP, v18 or later):
   - Clone it outside this repo, e.g. `C:\ai\Wan2GP`.
   - Run `scripts\install.bat`, then `scripts\run.bat` (it opens a local web UI).
   - It ships memory profiles for low-VRAM, low-RAM machines. Pick the **low-RAM profile**, and under Config →
     RAM/VRAM Management turn on the MMGP-optimised allocator and Read Ahead (Windows).
   - If Wan2GP offers a command-line or batch mode, use it so runs are scripted. If not, drive the web UI, and record
     the settings exactly.
4. **Climb the model ladder.** Stop climbing at the first model that won't run:

   | Rung | Model | Settings | Shots |
   |---|---|---|---|
   | 1 | **Wan 2.1 T2V 1.3B** (smoke test) | 832×480, about 5 s (81 frames at 16 fps), default steps | `A_door`; if it works, all 9 |
   | 2 | **Wan 2.2 TI2V 5B** | 480p or 704p, about 5 s | All 9 |
   | 3 | **Wan 2.2 T2V 14B**, quantised (GGUF Q3 or Q4, or Wan2GP's own quantisation), text encoder on the CPU | 480p | `A_door` only. **Abort if it pages heavily or passes 30 minutes**, and record that |
   | 4 | **LTX-2 / 2.3**, a low-VRAM variant (optional, if its licence allows) | 480p | `A_door` and `E_helicopters` |

   Use seed 72 for the first take. Where time allows, make a second take of the 3 shots that matter most (`A_door`,
   `C_fence`, `I_candles`) with seed 1972.
5. **Measure every run** in `videos/munich-1972/assets/ai/runs.json`, one entry per run:
   ```json
   {"shot": "A_door", "model": "wan2.1-t2v-1.3b", "res": "832x480", "frames": 81, "fps": 16, "steps": 30,
    "seed": 72, "wall_s": 0, "peak_vram_gb": 0, "peak_ram_gb": 0, "result": "ok|oom|aborted",
    "file": "A_door__wan21-1.3b__s72.mp4", "prompt_changes": "", "notes": ""}
   ```
   - **VRAM:** take the peak from `nvidia-smi` (or `nvidia-smi --query-gpu=memory.used --format=csv -l 2` while it runs).
   - **RAM:** take the peak from Task Manager.
   - **Failures:** record them (out-of-memory, crash, hang) with the error text.
6. **Look at every clip.** Pull 3 frames from each (start, middle, end) with ffmpeg and note any defects in `notes`:
   melting hands, text, faces, flicker or modern objects.
7. **Deliver:**
   - Clips go in `videos/munich-1972/assets/ai/`, named `<shot>__<model>__s<seed>.mp4`. Use H.264, the model's native
     resolution and fps, and no audio.
   - **Size:** only commit files under 25 MB each (re-encode with `-crf 20` if bigger).
   - **Commit:** the clips, `runs.json`, and a short `assets/ai/REPORT.md` with a table per model (seconds per clip,
     peak VRAM and RAM, quality notes, the best take per shot).
   - **The two logs:** add a row to `docs/DECISIONS.md` and an entry to `docs/log/2026-09-28-studio-chat.md`, with the
     user's message verbatim and what was done.
   - **Push:** `git push -u origin main`. On a 403, stop and tell the user (it's an access problem, not the network).
   - These clips are generated from text alone (no copyrighted inputs), so they're fine in the public repo.
8. **Tell the cloud session when done:** message the session named `autonomous-game-studio-agent-64` if you can reach
   it. If not, tell the user it's ready, so they can tell it.

## What the cloud session does next (for context)

- Upscales the best takes to 1080p (Lanczos plus matched film grain; or SeedVR2 or Real-ESRGAN on this laptop if they
  fit).
- Grades them to the film's look and adds a small **RECONSTRUCTION** label in code.
- Swaps them into scenes s0, s2, s4, s5, s6 and s9 at the cue words listed in `shots.json`.
- Re-renders, checks the result, and sends it privately to the user.

Its archival photos stay off GitHub (copyright, internal use only), which is why the compositing happens in the cloud
session.

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
  - **MiniMax H3:** cleared. The user is in India and reports MiniMax confirmed (15 Oct 2026) that publishing to
    Western viewers is fine. Credit "MiniMax H3" wherever the licence asks.
- **Secrets:** none are needed. Never print or commit tokens.
- **Honesty:** don't fake verification. Say what ran, what failed, and the real numbers.

## Steps

1. **Repo:** run `git pull origin main`. All work goes to `main`.
2. **Before each heavy run, free memory:** RAM is the hard limit on this laptop.
   - Close browsers and other GPU apps; `nvidia-smi` shows what is holding VRAM.
   - Plug in mains power and use the Windows high-performance (Best performance) power mode.
   - Check free disk space: the model downloads total 10–40 GB for Wan and about 90 GB more for H3.
   - **Measure the SSD once** and record it in `runs.json` as `ssd_read_gbs`: `winsat disk -seq -read -drive c`
     (admin prompt), or CrystalDiskMark's sequential read. Put the models on the fastest internal NVMe drive.
3. **Install ComfyUI, not Wan2GP.** Wan2GP's memory library (mmgp) documents a minimum of 24 GB RAM on Linux and
   about 16 GB more on Windows, so it's the wrong tool for a 16 GB laptop.
   - Install ComfyUI's Windows portable build (current stable), outside this repo, e.g. `C:\ai\ComfyUI`.
   - Start it with **`--fast-disk`** (edit `run_nvidia_gpu.bat`). Its help text: "Force disk-backed dynamic loading
     and offload over unpinned RAM. Can be faster for users with fast NVME disks." Dynamic VRAM is the default on
     NVIDIA under Windows and native Linux (not WSL). Don't add `--disable-mmap`.
   - Use ComfyUI's built-in workflow templates for each model where they exist, and save every workflow you run as
     JSON next to the clips.
   - Wan2GP is a fallback only for rungs 1–2, if ComfyUI fails there.
4. **Climb the model ladder.** Stop climbing at the first model that won't run:

   | Rung | Model | Settings | Shots |
   |---|---|---|---|
   | 1 | **Wan 2.1 T2V 1.3B** (smoke test) | 832×480, about 5 s (81 frames at 16 fps), default steps | `A_door`; if it works, all 9 |
   | 2 | **Wan 2.2 TI2V 5B** | 480p or 704p, about 5 s | All 9 |
   | 3 | **Wan 2.2 T2V 14B**, quantised (GGUF Q3 or Q4, or Wan2GP's own quantisation), text encoder on the CPU | 480p | `A_door` only. **Abort if it pages heavily or passes 30 minutes**, and record that |
   | 4 | **LTX-2 / 2.3**, a low-VRAM variant (optional, if its licence allows) | 480p | `A_door` and `E_helicopters` |

   **H3, first choice: FreeVideo** (github.com/FlashML-org/FreeVideo, Apache-2.0 code; H3 licence for the weights).
   It's a ComfyUI plugin plus launcher that runs **VDN-H3**, OpenVDN's 8-step hybrid-attention H3. Its planner splits
   the 50 transformer blocks across VRAM, pinned RAM and the SSD for each request, and it picks int8 on RTX 30 cards.
   It's advertised for "as little as 8 GB of VRAM and 16 GB of RAM". **This laptop's 6 GB is below that**: untested,
   so start small.
   - Install: download `FreeVideo.exe` from the project's Releases page, choose "install a new ComfyUI", then Install &
     launch. Models are downloaded automatically (budget about 60 GB of disk).
   - Before generating, print the plan without loading weights:
     `freevideo plan --vram-gib 6 --ram-gib 16 --width 864 --height 480 --seconds 3`. Save its output in `REPORT.md`.
   - Rungs, Light quality, `A_door`: (a) 864×480, 3 s, preview first; (b) 864×480, 5 s; (c) 1344×768, 5 s.
     Stop at the first one that fails or takes more than 60 minutes.
   - Each run writes `<output>.request.json` with the plan, stage times and memory peaks: commit it next to the clip.
   - If a rung fails, attach the FreeVideo diagnostic report to the run's notes; the authors publish community results.

   **H3 fallback (rungs 5–8), only if FreeVideo won't run on 6 GB.** These runs work because diffusion reads the full weights only once per
   denoising step, and the H3 Turbo LoRA cuts that to 4 steps. With `--fast-disk`, weights larger than RAM stream from
   the SSD; expect roughly 4 × file size ÷ SSD speed of extra time per clip (21 GB at 0.65–3 GB/s: about 30 s to
   2 min). An LLM is the opposite case: it re-reads its weights for every word, which is why disk streaming is hopeless
   there and fine here. **No pagefile change is needed:** memory-mapped weights are read-only, so Windows drops and
   re-reads them instead of swapping.

   Files (Hugging Face): denoisers and VAEs from `Comfy-Org/MiniMax-H3`; the Turbo LoRA (FL2V v1.2, 4 steps, Euler)
   from `lightx2v/Minimax-h3-Turbo`; GGUFs from `unsloth/MiniMax-H3-GGUF`. Use the **int8_convrot** files. Skip fp8
   (an RTX 30-series card has no FP8 tensor cores, so fp8 is only upcast) and NVFP4 (Blackwell only). Use the int8 video
   VAE with tiled decode. Text encoder: the `int8_convrot` Qwen3-VL-32B; it runs once per prompt, so streaming it is
   cheap.

   | Rung | H3 build | Settings | Abort if |
   |---|---|---|---|
   | 5 | **Pruned FL2VA int8_convrot** (about 21 GB) + Turbo LoRA | 640×384, 25 frames (about 1 s), 4 steps, CFG 1.0, `A_door` | Out of memory, or one step takes more than 15 min |
   | 6 | Same | 640×384, then 848×480, at 73 and then 121 frames (3 s and 5 s); `A_door`, `E_helicopters`, `I_candles` | Same; stop at the last size that runs |
   | 7 | **Unpruned FL2VA int8_convrot** (about 34 GB) + Turbo LoRA | The best size from rung 6, `A_door` | Same. Compare quality against rung 6 at the same seed |
   | 8 | Fallback only if ComfyUI fails at rung 5: **stable-diffusion.cpp `sd-cli`**, using the command on the unsloth model card (`--mode vid_gen`, `--cfg-scale 1.0`, `--backend te=cpu`, `--offload-to-cpu`), with `UD-Q2_K_XL` and then `Q4_K` | 640×384, 25 frames, 4 steps | Same |

   For each H3 run, also record `s_per_step`, `ram_hard_faults` (Resource Monitor → Memory → Hard Faults/sec, peak) and
   the exact file names used.

   Use seed 72 for the first take. Where time allows, make a second take of the 3 shots that matter most (`A_door`,
   `C_fence`, `I_candles`) with seed 1972.
5. **Measure every run** in `videos/munich-1972/assets/ai/runs.json`, one entry per run:
   ```json
   {"shot": "A_door", "model": "wan2.1-t2v-1.3b", "res": "832x480", "frames": 81, "fps": 16, "steps": 30,
    "seed": 72, "engine": "comfyui", "ssd_read_gbs": 0, "s_per_step": 0, "wall_s": 0, "peak_vram_gb": 0, "peak_ram_gb": 0, "result": "ok|oom|aborted",
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

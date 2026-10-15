# Can H3 run on the laptop (RTX 3060 6 GB, 16 GB RAM)? And can three laptops pool RAM? (15 Oct 2026)

## Update 2 (15 Oct 2026): FreeVideo is the purpose-built answer. It supersedes the ComfyUI `--fast-disk` plan below

The user asked about "freevideo/vdn-h3". That repo id doesn't exist on Hugging Face; the projects are
[FlashML-org/FreeVideo](https://github.com/FlashML-org/FreeVideo) (engine) and
[OpenVDN/vdn-minimax-h3](https://huggingface.co/OpenVDN/vdn-minimax-h3) (model).

- **VDN-H3** (OpenVDN; paper arXiv 2609.20744; 6 Sep 2026) adds a frame-wise linear-attention branch and LoRA adapters
  to H3 and distils it to 8 steps. On one H200: dense H3 32.7 s per model evaluation, VDN-H3 FP8 11.2 s (about 2.9×);
  8 steps take 90.5 s against 27.3 min for dense H3 at 50 steps (768p, 14.4 s clip). Weights: H3 base 72 GB plus
  4.3–5.1 GB for VDN; the FreeVideo "edge" pack is 22.9 GB, int8 or FP8.
- **FreeVideo** (open source 2 Oct 2026, v0.4.x): "runs MiniMax H3 in as little as 8 GB of VRAM and 16 GB of RAM".
  Its planner places each of the 50 blocks (432.5 MB each) in VRAM, pinned RAM or on disk (re-read every step). At
  least 8 blocks stay resident. It uses int8 on every Ampere card, runs the text encoder in a separate process that
  exits first, streams the VAE, and stages activations in RAM below a 10 GiB VRAM budget. `freevideo plan --vram-gib
  --ram-gib` prints the plan without loading weights. v0.4.0 adds agent control (an MCP server in `freevideo_engine/agent/`).
- **Community results** ([docs/community-results.md](https://github.com/FlashML-org/FreeVideo/blob/main/docs/community-results.md),
  end to end, Light quality):
  - 3070 Laptop 8 GB / 24 GB, 864×480, 5 s: 645 s;
  - 4060 Laptop 8 / 16, 1312×768, 10 s: 1024 s;
  - 5060 Laptop 8 / 16, 960×544, 3 s: 820 s;
  - 4060 Ti 8 / 16, 672×1184, 6.6 s: 887 s, about 460 s of it waiting on the drive;
  - 5050 Laptop 8 / 16 (drive at about 80 MB/s): 2130 s for a half-resolution preview.

  With 16 GB of RAM, "most of the model is read from the drive at every step", so **SSD speed decides the time**.
  Max quality costs roughly 3–10× Light.
- **Our laptop (6 GB / 16 GB, RTX 3060 Laptop):** below the advertised 8 GB. The minimum of 8 resident blocks is about
  3.5 GB, which leaves about 2 GB for activations, so short 480p clips look plausible. **Unverified.** Estimate by analogy
  (not measured): about 15–30 min per 5 s 480p clip at Light on a fast NVMe; much longer on a slow drive.
- **Licence:** the VDN and FreeVideo weights carry the same H3 licence; per the user, MiniMax has cleared our use.

The runbook (`videos/munich-1972/ai-broll/LAPTOP.md`) now makes FreeVideo the first H3 route. The ComfyUI and
stable-diffusion.cpp rungs are fallbacks.

## Update, 15 Oct 2026 (later the same day): the RAM wall is a software problem. This section supersedes the verdicts below

**Why streaming from the SSD works here.** A diffusion model reads all its weights once per denoising step. H3's Turbo
LoRA (lightx2v, FL2V v1.2, Apache-2.0) needs 4 steps, so a clip reads the weights about 4 times. An LLM re-reads its
weights for every token, which is why disk streaming kills LLMs and costs video models little.

| What streams | File | Extra time at 0.65 GB/s | At 3 GB/s |
|---|---|---|---|
| Text encoder, once per prompt | int8_convrot 27.1 GB | about 42 s | about 9 s |
| Pruned denoiser, 4 steps | int8_convrot 21.0 GB | about 2 min | about 28 s |
| Unpruned denoiser, 4 steps | int8_convrot 34.0 GB | about 3.5 min | about 45 s |

These are upper bounds: part of each file stays in the page cache. Sizes are from the Comfy-Org HF listing; the
speeds are a range because the laptop's SSD hasn't been measured.

**Engines (sourced):**
- **ComfyUI `--fast-disk`:** "Force disk-backed dynamic loading and offload over unpinned RAM. Can be faster for users
  with fast NVME disks" ([cli_args.py](https://raw.githubusercontent.com/comfyanonymous/ComfyUI/master/comfy/cli_args.py)).
  Safetensors load with mmap by default (there's a `--disable-mmap` flag). Dynamic VRAM: NVIDIA on Windows and Linux,
  not WSL ([Comfy blog, 25 Mar 2026](https://blog.comfy.org/p/dynamic-vram-in-comfyui-saving-local)). H3 is supported in
  ComfyUI since 3 Aug 2026.
- **stable-diffusion.cpp `sd-cli`:** the unsloth model card's own command (`--mode vid_gen --steps 4 --cfg-scale 1.0
  --backend te=cpu`, plus `--offload-to-cpu` for small GPUs). Whether it memory-maps the weights isn't documented.
- **Wan2GP was the wrong choice.** mmgp's README: "RAM: minimum 24 GB"; "These RAM requirements are for Linux
  systems"; "Windows will require an extra 16 GB of RAM" ([mmgp](https://github.com/deepbeepmeep/mmgp)).

**Formats on an RTX 3060 (Ampere):** prefer int8 (Ampere has INT8 tensor cores; whether the ConvRot kernels use them
there isn't verified). fp8 is only upcast (no FP8 hardware), and NVFP4 needs Blackwell. Because streaming makes size
cost seconds, not feasibility, **the unpruned 34 GB int8 model is now testable**. The pruned and GGUF builds become
fallbacks rather than requirements.

**No pagefile needed.** Memory-mapped weights are read-only and file-backed: Windows drops them and re-reads them
from the SSD, so nothing is swapped or written. The earlier "40 GB pagefile" advice is withdrawn.

**Still unknown (the test measures these):**
- Compute time per step: H3's VAE factors and patch size weren't found, so token counts can't be estimated.
- Whether activations for 3–5 s clips fit in 6 GB of VRAM (start at 1 s and 640×384, with tiled VAE decode).
- The SSD's real speed.

**The spare laptops:** pooling their RAM is still not practical. Running the text encoder on them would need
conditioning to be saved and loaded between machines, which is unverified. Their honest use is parallel CPU jobs.

**Free extra GPUs (third-party figures, unverified):** Kaggle about 30 GPU-hours a week (P100 16 GB or 2× T4);
Lightning AI about 80 GPU-hours a month; Modal about $30 a month in credits.

The runbook is `videos/munich-1972/ai-broll/LAPTOP.md`, rungs 5–8.

---

Gathered by the researcher subagent from Hugging Face file listings and the Wan2GP README. File sizes are exact
byte counts from the HF API, shown here in GB (10^9). The licence question is in `minimax-h3-licence-2026-10.md`.

## What has to fit (sourced sizes)

| Part | Smallest-to-largest options | Source |
|---|---|---|
| Video transformer, full (33.1B) | BF16 66.3 GB; INT8 34.0 GB | [MiniMaxAI](https://huggingface.co/MiniMaxAI/MiniMax-H3), [Comfy-Org](https://huggingface.co/Comfy-Org/MiniMax-H3) |
| Video transformer, **pruned** | BF16 40.2; FP8 21.0; W6A8 16.0; GGUF Q8 21.4, Q6 16.6, Q5 13.9, **Q4 11.4, Q3 8.8, Q2 6.7** | Comfy-Org; [unsloth GGUF](https://huggingface.co/unsloth/MiniMax-H3-GGUF) |
| Text encoder (Qwen3-VL-32B) | BF16 51.5; INT8 27.1; NVFP4 15.7; GGUF Q4_K_M 18.2, **Q2_K_M 13.1** | Comfy-Org; unsloth |
| Video VAE / audio VAE | INT8 2.8 / 0.6 (fp16 video VAE 5.2) | Comfy-Org |
| Wan2GP claim | "only 5-6GB of VRAM to gen 15 seconds of H3 video at 480p" (v17.17, 7 Oct 2026). No RAM figure is published | [Wan2GP](https://github.com/deepbeepmeep/Wan2GP) |

Not found: H3 runs on 16 GB RAM or less, per-clip times on 6–12 GB cards, quality numbers for the pruned or
quantised versions, and Wan2GP disk-streaming behaviour.

## Our arithmetic (estimate)

- Windows plus the app leave roughly 11–12 GB of the 16 GB free.
- The text encoder runs first (once per prompt) and can be unloaded before the transformer loads, so the peak is the
  larger of the two stages, not their sum.
- **Stage 1, text encoder Q2:** 13.1 GB. Doesn't fit in RAM; it pages to disk (slow, but only once per prompt).
- **Stage 2, transformer Q2 or Q3 plus VAEs:** about 10–12 GB. Q2 fits; Q3 is borderline.
- **Verdict:** possible in principle with a pruned Q2/Q3 model and a large pagefile on the SSD (about 40 GB). Expect
  480p, slow runs and an unknown quality loss from pruning plus 2–3-bit quantisation. A pruned Q2 H3 may not beat
  Wan 2.2. Only a test will tell.

## Pooling three laptops' RAM

- Tools that split one model across machines (llama.cpp RPC, exo) are built for **text LLMs**. No support for video
  diffusion models was found. A llama.cpp RPC report over 10 GbE shows that pooling adds memory but costs speed
  (search summary, not primary).
- Video diffusion runs the whole model 20–50 times per clip, so the activations would cross the network on every
  step. Over Wi-Fi or gigabit Ethernet that is far slower than the disk-paging route.
- The 8 GB laptops have about 4–5 GB free each after the OS, so pooling adds less than it seems.
- **Verdict: not practical.** Better use for the spare laptops: parallel CPU jobs (Whisper alignment, Kokoro or Piper
  voices, code-frame renders, ffmpeg encodes, upscaling queues).

## The clean alternative: rent a GPU by the hour

- RunPod A100 80 GB $1.19/hr, H100 80 GB from $1.99/hr (pricing page, "updated July 2026"); Vast.ai lower but
  interruptible (secondary source). That runs the full model at 768p.
- **Licence:** use is granted only within the Applicable Territory, so pick a datacentre outside the US, EU, UK and
  Korea. The question of publishing to Western viewers stays open either way.
- H3 time per clip on these cards: not found.

# Can H3 run on the laptop (RTX 3060 6 GB, 16 GB RAM)? And can three laptops pool RAM? (15 Oct 2026)

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

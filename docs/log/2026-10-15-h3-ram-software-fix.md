# 2026-10-15: licence cleared; a software solution to the RAM wall

## User message (verbatim)
i have gotten the license situation cleared by minimax, no issues on that front, i expect better from you though, about being clever enough on finding a software solution to our ram blockage

## Done
- Researcher subagent: ComfyUI flags (`--fast-disk`, mmap default), Dynamic VRAM, mmgp RAM minimums, the H3 Turbo LoRA (4 steps),
  unsloth file sizes, free cloud GPUs. I fetched the unsloth card myself: the sample command is stable-diffusion.cpp `sd-cli`.
- Consulted the advisor before writing the plan.
- `LAPTOP.md`: switched the engine from Wan2GP to ComfyUI `--fast-disk` for all rungs (Wan2GP is the fallback for rungs 1–2);
  added an SSD speed measurement; added the H3 rungs 5–8; licence line updated; runs.json gets engine, ssd_read_gbs, s_per_step.
- DECISIONS: superseding row; 0f and 0g updated. Licence note and the laptop research doc marked superseded with the new analysis.

## Decided / found / skipped
- Key point: diffusion reads its weights once per step (4 with Turbo), so streaming from the SSD costs seconds to minutes per clip.
  RAM limits speed, not feasibility. The unpruned 34 GB int8 model is testable.
- My error: I had recommended Wan2GP, whose mmgp needs 24 GB+ RAM. The earlier pagefile advice is withdrawn (mmap is read-only).
- Ampere: int8 preferred; fp8 is only upcast; NVFP4 is Blackwell-only.
- Unknown and not estimated: per-step compute time (VAE factors not found), VRAM headroom for 5 s clips, SSD speed.
- Not done: the spare-laptop text encoder (unverified conditioning transfer). Free-cloud numbers are third-party.
- The licence clearance is the user's report; I suggested keeping MiniMax's written confirmation.

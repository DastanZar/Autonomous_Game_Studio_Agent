# 2026-10-15 question: numbers for running H3 on the laptop; pooling RAM across three laptops

## User message (verbatim)
Pull more numbers on how we can make H3 work on my laptop, also tell me if this is possible, i have other spare laptops each with 8gb of ram, is there some way to interconnect the 3 laptops to have 16 + 8 + 8 gb of ram?

## Done
- Researcher subagent pulled exact H3 file sizes (MiniMaxAI, Comfy-Org, unsloth GGUF), the Wan2GP claims, pooling tools and GPU rental prices.
  Saved as `docs/research/h3-on-the-laptop-2026-10.md`; DECISIONS.md log row added.

## Decided / found / skipped
- Found pruned GGUFs (Q2 6.7 GB to Q8 21.4 GB); the text encoder is a 32B Qwen3-VL (Q2 13.1 GB).
- Estimate: H3 runs only as pruned Q2/Q3 with an SSD pagefile; quality untested. Pooling RAM: not practical (no diffusion support; network cost).
- Not found: RAM measurements, per-clip times on small cards, pruned-model quality, disk-streaming behaviour. These are not invented; the laptop test would measure them.
- LAPTOP.md not changed: adding an H3 stage waits for the user's go-ahead.

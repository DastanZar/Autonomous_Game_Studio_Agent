# 2026-10-15 question: FreeVideo / VDN-H3

## User message (verbatim)
what about freevideo/vdn-h3?

## Done
- `huggingface.co/freevideo/vdn-h3` returned 401 (no such repo). An HF search found OpenVDN/vdn-minimax-h3, its -edge pack, and
  FlashML-org/FreeVideo. Read both model cards, the FreeVideo README, community-results.md and execution-planning.md, and skimmed
  the cloned source (scratchpad only, nothing run).
- LAPTOP.md: FreeVideo is the first H3 route (plan dump, 3 rungs, request.json committed). The ComfyUI/sd.cpp rungs are now fallbacks.
- Research doc update 2; DECISIONS row; open item 0f updated.

## Decided / found / skipped
- FreeVideo is built for exactly this limit (8 GB VRAM / 16 GB RAM): a planner across VRAM, RAM and disk; int8 on Ampere; an 8-step VDN-H3.
- Our 6 GB is below its stated floor: untested. Estimated 15–30 min per 5 s 480p clip (by analogy, not measured).
- With 16 GB RAM, SSD speed dominates (community runs show 460–900 s of drive waits on slow disks).
- Didn't run `freevideo plan` here: it bounds the plan by detected VRAM, and this container has no GPU.

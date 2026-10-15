# 2026-10-15 question: can an Oracle VPS with 24 GB RAM help?

## User message (verbatim)
i have an oracle vps, 24gb ram, can we somehow attach that and help our cause here?

## Done
- Answered from the numbers already gathered (FreeVideo community results, SSD streaming). No new research, no changes to the runbook.

## Decided / found / skipped
- Using the VPS's RAM for the laptop's H3 runs: no. With 16 GB RAM, FreeVideo re-reads part of the model from the drive every step.
  Over home internet (12–125 MB/s for 100 Mbps–1 Gbps) that is slower than the laptop's own SSD (likely 1,000+ MB/s), plus latency.
- Likely the Always Free Ampere A1 (ARM, 4 OCPU, 24 GB); assumed, not confirmed by the user.
- Possible later use: an always-on CPU helper (TTS, Whisper, music, ffmpeg, code-frame renders) and a persistent job and asset store.
  Not set up; asked the user. Running the text encoder there is unverified (FreeVideo's precomputed-conditioning support isn't checked) and gains little on a fast SSD.

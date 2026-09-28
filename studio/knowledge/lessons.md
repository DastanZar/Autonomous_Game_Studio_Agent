# Lessons (append-only; newest at the bottom)

Each entry: date, stage, what happened, the rule. Workers append here when a stage teaches them something.

| Date | Stage | Lesson |
|---|---|---|
| 2026-09 | voice | Whisper needs **16 kHz** input; otherwise timestamps stretch ~1.38×. |
| 2026-09 | voice | Piper output differs every run: cache takes, reuse existing files. |
| 2026-09 | voice | Whisper word times wobble ~20 ms between runs: freeze `timeline.json` once the picture is timed. |
| 2026-09 | storyboard | Cue words are normalized to `[a-z0-9']`: "boring-looking" → `boringlooking`. |
| 2026-09 | picture | `destination-out` punches through the whole frame: pre-render the effect offscreen (`stampImage`). |
| 2026-09 | final | Film grain makes files huge (23 Mbps): two-pass at 4.8–5 Mbps for 1080p. |
| 2026-09 | final | Files over 30 MB can't be sent to the user: small preview + master split with `ffmpeg -f segment -c copy`. |
| 2026-09 | infra | Paid OpenRouter models return 402 on a $0 key; `fish-audio/s2.1-pro-free:free` = 50 requests/day. |
| 2026-09 | infra | `git push` 403 = access problem, not network. Tell the user; don't retry in a loop. |
| 2026-09-28 | voice | **Never transcribe short lines in isolation.** Per-line slices of the Emu mix scored "The emus did not" → "Daines did not" (WER 0.5), while one whole-mix transcript heard every line (WER 0.0). Transcribe once, align, score per paragraph (`textnorm.per_para_wer`). |
| 2026-09-28 | voice | Whisper writes digits ("1932", "10,000", "World War I"). Normalize before WER (`studio/tools/textnorm.py`), or every year looks like an error. |
| 2026-09-28 | research | Quote verification matches one uninterrupted span: skipping an aside or joining sentences across a heading gives NOT_FOUND (Sonnet trial, 2 of 3 episodes). |
| 2026-09-28 | research | Wikipedia paraphrases quotations; use the original report's wording (Liechtenstein "attack helicopters" quote). |
| 2026-09-28 | script | Gates can't catch a line that says more than its claim ("fireworks legal all year" from "fireworks store open all year"). The writer re-reads each line against its claim text. |
| 2026-09-28 | voice | Piper: write "United States" not "US"; avoid "forty-ninth", "sixth" and noun possessives. A retake can change a neighbouring line's WER because the whole mix is transcribed at once. |

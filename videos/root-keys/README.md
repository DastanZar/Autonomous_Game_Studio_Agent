# The 14 People Who Hold the Keys to the Internet (Sort Of)

**Deliverable:** `out/keys-to-the-internet.mp4` — 16:9 1920×1080, 24 fps, 5:40, H.264 High + AAC 48 kHz,
−14 LUFS. `out/keys-to-the-internet.srt` = YouTube captions. `out/thumbnail.jpg`.

Timely hook: on **11 October 2026** the DNS root zone switches to a new Key Signing Key (KSK-2024),
only the second root key change ever.

## Pipeline (same method as the Emu War short, now 16:9 long-form)
1. `script.json` → `tools/vo.py`: Fish Audio S2.1 (free, via OpenRouter; voice "Felix", Australian male),
   one request per paragraph, cached by content hash. faster-whisper aligns every word and checks WER.
2. `render/lib.js` (paper-cutout engine) + `render/scenes.js` (28 scenes): every frame is a pure function
   of `t`; all cues are keyed to spoken words (`WT(paragraph, word)`), so re-voicing re-times the picture.
   Maps are real Natural Earth data (US 1:50m, world 1:110m).
3. `render/render.mjs`: headless Chromium, 4 workers, resumable. `sheet` mode renders review contact sheets.
4. `tools/audio.py`: spy-caper score (pizzicato walking bass, brushed kit, vibes, celesta), 25 SFX types,
   voice ducking, comic music drop-outs on "Sort of." / "Nobody." / "Not hacked." / "No."
5. ffmpeg two-pass x264 @ 5 Mbps, loudnorm −14 LUFS.

Checks run: every word cue resolves; full-mix transcription vs script WER 1.7% (accent spellings);
music ≈ 8 dB under speech; contact sheets reviewed for every scene.

## Fact check
| Claim | Source |
|---|---|
| Ceremonies ~4×/year, alternating El Segundo CA / Culpeper VA | IANA ceremonies page; Stackscale |
| PIN, smartcard, hand scan, retina scan to enter | Guardian 2014 (via reprints); Stackscale |
| "Seven people hold the keys" myth is wrong per ICANN | ICANN blog "The Problem with 'The Seven Keys'" (2017) |
| Kaminsky 2008 DNS cache-poisoning flaw | widely documented |
| KSK lives in HSMs; copies at two facilities 4,000+ km apart; restore from backup by buying a new HSM | ICANN blog (2017) |
| Smartcards in TEBs in safe-deposit boxes in a safe; each box needs 2 keys (IANA + CO) | ICANN KSK ceremony docs / APNIC |
| 14 COs, 7 per coast, ≥3 needed; volunteers | IANA TCR criteria; APNIC |
| 7 RKSHs, 5 needed, only if all HSMs are lost | ICANN blog; APNIC |
| Two staff always together (CA + IW) into safe room; laptop with no battery/HDD, boots from DVD; live-streamed | Stackscale |
| Signs ~3 months of keys per ceremony | Stackscale / IANA |
| "<1 in 1,000,000 with 5% dishonest participants" | Olaf Kolkman, Internet Society (2015) |
| Feb 2020 El Segundo safe lock failure, locksmith drilled, ~2 days, first reschedule in 10 years | APNIC "Drilling for the KSK"; The Register |
| April 2020: COs couriered keys in TEBs, joined by video, 9 months of signatures | ICANN blog on Ceremony 41 |
| KSK 2010; rollover planned 11 Oct 2017, postponed; done 11 Oct 2018 | ICANN KSK rollover page |
| KSK-2024 generated April 2024; takes over 11 Oct 2026 | IANA ceremonies (53-2); ICANN press release Aug 2026 |

Wording choices: "the keys to the internet. Sort of." and "twenty-one people" (14 COs + 7 RKSHs) are
framing, stated with the caveats in the script. IPs shown for fictional sites use the documentation
ranges (203.0.113.0/24, 198.51.100.0/24) and `.example` domains.

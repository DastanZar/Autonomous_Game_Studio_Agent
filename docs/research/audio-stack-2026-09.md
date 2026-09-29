# Music and SFX stack: research and decision (2026-09-29)

**Requirement:** the best quality we can get free or open-source, with licences that allow monetised
YouTube (and TikTok/Reels cross-posts), no Content ID claims, and automation without a human in the loop,
except a one-time listen.

## Decision

| Layer | Choice | Licence | Why |
|---|---|---|---|
| Music (primary) | **ACE-Step 1.5 turbo**, one library of 4 tracks per channel, generated once and reused | Code and weights MIT; output ours | Best open music model that allows commercial use. Quality is positioned between Suno v4.5 and v5. Original audio can't match anyone's Content ID. Runs on CPU (measured) and on a 6 GB RTX 3060 (the vendor's own tier table). |
| Music (fallback) | Code-synthesised underscore (`tools/audio.py`) | Ours | Always available and deterministic. |
| SFX (primary) | **Kenney** audio packs (538 files; 20 cue types curated) | CC0 | Real recordings, no attribution, direct download, small (1 MB). |
| SFX (generated) | **Stable Audio Open 1.0** for sounds Kenney lacks (whooshes, flocks, cartoon boings) | Stability AI Community License: free under US$1M revenue; outputs ours | The model is strongest at SFX and foley. It was trained on Freesound CC0/CC-BY/CC-Sampling+ and FMA, filtered with Audible Magic. |
| SFX (optional, manual) | **Sonniss GDC 2026 bundle** (7.47 GB, 347+ pro files) | Royalty-free, commercial, no attribution | The best free professional SFX library. Its download page is behind a browser check, so it has to be downloaded by hand (e.g. on the laptop) and curated into the manifest. |

## Candidates rejected, and why

| Candidate | Reason |
|---|---|
| LeVo 2 (Tencent) | Best open audio quality, but the licence is non-commercial. |
| YuE, Khala, MusicGen | Weights are CC BY-NC 4.0 (non-commercial), or the models are slow or weaker. |
| HeartMuLa 3B | Apache 2.0, but ranked well below ACE-Step 1.5 on quality; its 7B model isn't released. |
| DiffRhythm 2, Muse | Commercially usable, but weaker than ACE-Step 1.5 in the same comparison. |
| Suno, Udio, Lyria, ElevenLabs Music | Paid. |
| YouTube Audio Library | Content ID-safe on YouTube, but it's only reachable inside YouTube Studio (no API), and tracks are shared by thousands of channels. Worth keeping as a manual option. |
| Pixabay, Uppbeat music | Free, but Pixabay tracks do get Content ID claims (disputable). Uppbeat needs an account and credit. |
| BBC Sound Effects | RemArc licence is non-commercial. |
| Freesound (API) | Mixed licences per file (CC-BY needs attribution; some are NC). It needs an API key. Stable Audio Open already distils its CC0/CC-BY content. |

## Measurements in this container (4 CPU cores, 15 GB RAM, no GPU)

- **ACE-Step 1.5 turbo, 30 s instrumental: 109 s end to end.** The diffusion itself takes 36 s.
  - The first attempt was killed for running out of memory (13.9 GB RSS) in the VAE decode. Setting
    `ACESTEP_VAE_DECODE_CHUNK_SIZE=64` fixed it.
  - Output: −16 dBFS RMS, peak 0.89, no clipping, dense rhythmic spectrum.
  - Whisper heard 0 words.
  - The model ended the piece at about 24 s and left 6 s of silence. `music_gen.py` trims it, and `audio.py`
    loops tracks with a crossfade.
- **Stable Audio Open, 1.5 s whoosh:** a clean symmetric swell peaking at 0.65 s, with tails at −80 dB. It came
  out at full scale; `sfx_gen.py` normalises to −1 dBFS.
- **Disk:** the ACE-Step turbo model is 4.5 GB, its text encoder 1.2 GB and the VAE 0.3 GB. The 1.7B LM
  (3.5 GB) isn't needed with `thinking=False`. The Stable Audio Open repository is 9.5 GB, most of it
  duplicate checkpoints.

## Sources
- [IT-JIM: Best open-source AI music generators 2026](https://www.it-jim.com/blog/best-open-source-ai-music-generator/): model and licence comparison
- [ACE-Step 1.5 repository](https://github.com/ace-step/ACE-Step-1.5): MIT licence, GPU tier table (`docs/en/GPU_COMPATIBILITY.md`)
- [HeartMuLa](https://github.com/HeartMuLa/heartlib)
- [Stable Audio Open 1.0 model card](https://huggingface.co/stabilityai/stable-audio-open-1.0)
- [Sonniss GDC 2026 bundle](https://gdc.sonniss.com/) and [Bedroom Producers Blog](https://bedroomproducersblog.com/2026/03/16/sonniss-gdc-2026-bundle/)
- [Kenney assets](https://kenney.nl/assets): CC0
- [Foxi: YouTube Audio Library and Content ID](https://www.foximusic.com/blog/copyright-free-music-youtube-audio-library-guide/)

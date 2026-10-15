# MiniMax H3: licence, size and fit for this studio (15 Oct 2026)

> **Update, 15 Oct 2026:** the user reports that MiniMax cleared their use (India, publishing to Western viewers).
> Keep MiniMax's written confirmation on file. The recommendation below is superseded.

Context: the user is in India; the audience is English-speaking viewers in the US, UK and EU.
Gathered by the researcher subagent. The licence was read through a summarising fetch, so re-check the raw
file before quoting it in public.

## Findings

| Claim | Source |
|---|---|
| Licence: "MiniMax H3 Community License Agreement", dated 2 Aug 2026 | [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE) |
| Applicable Territory = "worldwide, excluding" the EU, UK, Republic of Korea and USA; the grant applies "Solely within the Applicable Territory"; distribution is allowed "to Third Parties within the Applicable Territory" | LICENSE |
| The licence doesn't say whether a licensee outside those regions may publish outputs to viewers inside them. **Unresolved**; Runpod reads it as a ban on using outputs there | LICENSE; [Runpod](https://www.runpod.io/blog/minimax-h3-the-open-weight-omni-modal-video-model-and-what-it-takes-to-run-it) |
| MiniMax Q&A: "Temporarily limited in certain regions"; organisations in those regions can apply for a licence at platform.minimax.io/h3-license | [QA-about-License](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md) |
| Commercial use is allowed; above $20M revenue you need written permission; the model name must be displayed; outputs belong to you; outputs can't be used to train other models | LICENSE; [The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open) |
| 33.1B parameters, dense (not MoE), BF16; 768p, 4–15 s at 24 fps; native 32 kHz audio and dialogue in 11 languages. Lip-sync quality isn't measured anywhere | Runpod; [atoms.dev](https://atoms.dev/blog/minimax-h3-open-weights-multimodal-video-model); HF model card |
| Wan2GP: "5-6GB of VRAM" for 15 s at 480p; 11 GB for 1080p. **System RAM requirement: not published**; no 6–8 GB timings found | [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP) |
| FTC rule (16 CFR 465, Aug 2024) bans testimonials claiming to come from a person who doesn't exist, AI-generated ones included | [Mondaq](https://mondaq.com/unitedstates/advertising-marketing-branding/1506460/ftc-finalizes-rule-prohibiting-fake-reviews-and-testimonials) |
| YouTube requires creators to disclose realistic synthetic people or scenes | [YouTube blog](https://blog.youtube/news-and-events/disclosing-ai-generated-content) |

## Our arithmetic (estimate, not sourced)

33B weights take about 66 GB in BF16, about 33 GB in 8-bit and about 17–19 GB in 4-bit. A 6 GB GPU works by keeping
the weights in system RAM and streaming blocks to the GPU, so **16 GB of RAM can't hold even the 4-bit model**. Expect
heavy disk paging (very slow) or a crash. Wan 2.2 5B and LTX fit comfortably.

## Recommendation

- **Published work for Western viewers:** don't use H3 until MiniMax confirms in writing (via the form above) that a
  creator in India may publish outputs that are watched in the excluded regions. Use Wan 2.2 (Apache-2.0) and LTX.
- **AI "UGC" testimonial ads:** no. Fake customers are illegal in the US under the FTC rule. A clearly labelled original
  AI presenter is a different, legal format, and outside the current scope.

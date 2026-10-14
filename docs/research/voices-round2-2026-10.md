# Voices, round 2: closer to ElevenLabs, still free (14 Oct 2026)

**Why:** the user got feedback that Hannah (Fish S2.1 free) sounds AI-like. They asked me to look into:
- MiniMax's free tier;
- a free VoxCPM2 endpoint;
- any other free or freemium voice close to ElevenLabs.

**Test:** the same sentence as round 1. Samples are in `studio/voices/catalog/round2/` and on the dashboard (`voices-round2`). Every sample was transcribed back with Whisper small.en: all read the sentence perfectly (WER 0.00). Loudness was matched to -16 LUFS so they compare fairly. I can't hear them; the listening verdict is the user's.

## What I tested

| Model | Licence | How I ran it (free) | Result |
|---|---|---|---|
| **VoxCPM2** (OpenBMB) | Apache-2.0 (model card) | [openbmb/VoxCPM-Demo](https://huggingface.co/spaces/openbmb/VoxCPM-Demo) Space through gradio_client | 3 voices **designed from a text description**, so no real person is copied: British male narrator, American woman explainer, deep American storyteller. 48 kHz. About 1-3 minutes per line on the free Space. |
| **Chatterbox** (Resemble AI) | MIT | [ResembleAI/Chatterbox](https://huggingface.co/spaces/ResembleAI/Chatterbox) Space (ZeroGPU) | Default voice, plus a **clone of the VoxCPM2-designed British voice**. That gives one fixed, original voice that stays the same across every video. Has an "exaggeration" (emotion) control. |
| Qwen3-TTS | Apache-2.0 | [Qwen/Qwen3-TTS-Demo](https://huggingface.co/spaces/Qwen/Qwen3-TTS-Demo) | **Failed:** the Space raised an error for all 8 voices tried. Retry later, or run it locally. |

## What I couldn't test, and why

- **MiniMax Speech:**
  - The free plan is on the consumer web app: 10k credits a month, about 12 minutes of HD, 3 voice slots ([MiniMax Audio](https://www.minimax.io/audio/subscribe)). Commercial use is listed only for songs.
  - The API has no permanent free tier; it's pay-as-you-go ([agentdeals](https://agentdeals.dev/vendor/minimax), [Puter](https://developer.puter.com/tutorials/minimax-api-pricing/)).
  - A free week via Vapi ended on 22 Sept ([Vapi](https://vapi.ai/blog/minimax-speech-02-free-week)).
  - The user can try it in the web app; it isn't usable for our pipeline for free.
- **Gemini 2.5 Flash TTS:**
  - Google AI Studio lists a free tier for `gemini-2.5-flash-preview-tts`, but the limits are per project and only shown in the console ([Google pricing](https://ai.google.dev/gemini-api/docs/pricing)).
  - Needs the user's free AI Studio API key. It's a strong freemium candidate, worth one test.
- **Fish S2 Pro (full)**, the strongest open model, comes with CC-BY-NC weights, so no commercial use ([ocdevel](https://ocdevel.com/blog/20250720-tts)). The free OpenRouter model we use is S2.1, and its terms are Fish's.
- **ElevenLabs free:** 10k credits a month, requires attribution and no commercial use, so not usable for monetised channels.

## Wider picture (third-party roundups, vendor numbers flagged)

- **Chatterbox** is the most-cited open match for ElevenLabs. Resemble's own commissioned blind test claims 63-65% preference over ElevenLabs (vendor-run) ([findskill](https://findskill.ai/blog/best-open-source-tts-2026/), [bymar.co](https://blog.bymar.co/posts/open-source-voice-cloning-alternatives-elevenlabs-2026/)).
- **Qwen3-TTS:** low error rates, Apache-2.0 ([BentoML](https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models)).
- **Voxtral:** strong, but CC BY-NC.

## Recommendation

1. **Listen** to round 2 against Hannah and George.
2. **If a VoxCPM2 voice or the Chatterbox clone wins:**
   - We make one fixed reference voice and keep it.
   - Production runs through the free Spaces now (slow, with a daily GPU quota), then locally on the RTX 3060 at no cost and no limit.
3. **Free test worth doing next:** Gemini TTS, once the user creates a free AI Studio key and adds it as an environment secret.

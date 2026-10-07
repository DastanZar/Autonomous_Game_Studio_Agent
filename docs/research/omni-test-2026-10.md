# Gemini Omni 1.1 Flash test: "What would happen if you jumped into a hole through the Earth?"

User request (7 Oct 2026): try Google's Gemini Omni 1.1 Flash against our drawn style on a topic from the recommended
"What would actually happen if…" lane.

- **Model facts** (Google's release notes, 27 Aug 2026; MindStudio and Atlas Cloud write-ups):
  - 3–10 s per generation, extendable in 10 s steps to 40 s in total;
  - text, first frame, or first and last frame inputs;
  - native audio; 720p/1080p, 4K by upscaling.
- **Plan:**
  - one text-to-video shot plus three extends, about 40 s in total;
  - every prompt forbids text (our labels are typeset in code);
  - no voice or music; our narration and captions replace the audio.
- **Fallback:** if the style drifts between extends, we render text-free first frames from our own engine and use
  image-to-video.
- **Judge on:**
  - do the lines look hand-drawn or filtered;
  - is it consistent across the extends;
  - does stray text appear;
  - time and cost per clip.

The four prompts are in the chat log of 7 Oct (docs/log/2026-09-28-studio-chat.md).

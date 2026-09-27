# Research notes: long-form Opus 5.5 videos, AI presenters, and voice

*Compiled 27 Sep 2026, five days after the Opus 5.5 launch (22 Sep). I could not open X directly
(it returns HTTP 402). X claims below come from search-engine snippets or write-ups that quote them,
and each is linked.*

## 1. What people are building with Opus 5.5

- **Scale.** A community index lists **1,000+ Opus 5.5 videos** and sorts them by how the frames
  were made: code-drawn 2D, Manim-style explainers, WebGL/3D, edits of existing footage, Opus driving
  external video models (e.g. Seedance), app/game capture, and hybrids.
  It also names reusable starter bases: *ClaudeAnimationBase* (character expressions, storyboard and
  contact-sheet steps), *Papermotion* and *Lemo-Opuscar*. [awesome-opus-5-5-videos]
- **Long form is a shot list plus an asset pipeline, not one prompt.** The most ambitious example
  indexed is an **8:33 episode with 211 planned shots, 300+ generated images, 11 characters,
  70 voice lines and 16 music cues**, built in Claude Code. [awesome-opus-5-5-videos]
- **Cheap explainers.** A 5-minute explainer reportedly cost **$3.21 of OpenRouter usage**:
  Remotion for animation, OpenRouter image models for assets, Gemini TTS for narration and MiniMax H3
  for b-roll, recorded with Playwright and ffmpeg. [HN thread]
- **The "one prompt" myth.** Rexan Wong pulled apart the viral "one prompt" videos. The working
  recipe is 1–2 **reference videos** for the style (without them Opus falls back to centred text,
  gradients and fade-ins), then **Remotion/HyperFrames**, real UI component libraries, **storyboard
  approvals** and **director notes**. [Rexan Wong on X]
- **Criticism worth taking seriously** (HN): videos move too fast to absorb, repeat themselves and
  look generic ("slop"). The fixes are editorial: slower pacing, a specific point of view and real
  references. The Orca write-up adds three failure modes: frame flicker from non-determinism,
  **factual errors** (especially in history) and render pipelines that fail silently late in a run.
  [HN thread] [orcarouter]
- **What this means for us.** Our pipeline already does the parts that matter: voice first,
  word-timed cues, deterministic frames, contact-sheet review and a fact-checked script. The next
  upgrades are reference videos per project, and generated image assets where hand-drawing in code
  looks weak.

## 2. Presenter-led videos like Cleo Abram's

**One hard line first.** Don't build a character that looks and sounds exactly like Cleo Abram.
She is a real person. Copying her face, voice and mannerisms is impersonation: it breaks YouTube's
rules on realistic synthetic content and her right of publicity, and it would get the channel
struck. What we *can* copy is her **format**:
- a host who talks straight to camera (A-roll), cut against heavy b-roll and motion graphics;
- one big "huge if true" question per episode;
- optimistic framing;
- a lot of research per video (she reportedly spends months on each one).
[Washington Post Q&A] [OutlierKit analysis]

**How people build a consistent AI presenter (2026):**

| Step | Tools people use | Notes |
|---|---|---|
| 1. Design an original host | Image model (Gemini image, Seedream, FLUX, gpt-image) | Make a **character sheet**: front, 3/4 and profile, 5 expressions, fixed outfit. That sheet is the identity lock for every later shot. |
| 2. Give them a voice | Fish S2/S2.1 (voice cloning from a 10–30 s reference) | Clone only a voice you own or have licensed: yours or a paid voice actor. Or design one from the Fish library. |
| 3. Talking-head A-roll | **HeyGen Avatar IV** (photo + audio → talking video, *on OpenRouter*), HeyGen Avatar V (digital twin from a 15 s clip of an *authorized* person), **Hedra Character-3** (stylized characters, expressive) | Feed it the finished voice track; it lip-syncs the face and animates the head and hands. [HeyGen] [Hedra] |
| 4. Gestures / b-roll with the host in it | Seedance 2.x, Kling 3, Veo 3.1, Runway Gen-4.5 (all on OpenRouter), image-to-video from the character sheet | Identity-lock features (e.g. Higgsfield "Soul ID") carry the same face across clips. [Higgsfield] |
| 5. Graphics and explanations | Our code renderer | Maps, diagrams, numbers and all on-screen text stay in code: exact and never misspelled. |
| 6. Edit | Our timeline (voice first) | Cut presenter shots against the graphics on the narration's word times; picture-in-picture host over diagrams. |

**Where we are:** everything in rows 1, 3 and 4 is available through the OpenRouter key, but the key
is free tier with a **$0 balance**. Image, video and avatar models (and Lyria music) return
`402 Payment Required`. With about **$10–20 of credit** I can run a pilot: design an original host,
build a character sheet, and make a 30-second test with three presenter shots cut into the graphics,
reporting the exact cost per finished minute.

## 3. Voice: Piper vs Fish

Every clip below reads the same line: the cold open of the new video. The clips are in `videos/voice-test/`.

| Voice | Engine | Pace (wpm) | WER* | Notes |
|---|---|---|---|---|
| `piper_ryan` | Piper, local, free, unlimited | 192 | 0.00 | The voice in the Emu War short. It's an **American** voice (en_US-ryan). |
| `fish_felix_au` | Fish S2.1 (free on OpenRouter) | 184 | 0.00 | Young Australian male, laid back. **Used for the new video.** |
| `fish_goodsound_au` | Fish S2.1 | 170 | 0.00 | Warmer, older Australian male |
| `fish_ethan` | Fish S2.1 | 179 | 0.00 | "Curious explainer", American |
| `fish_slax` | Fish S2.1 | 153 | 0.00 | Measured educational narrator |
| `fish_adrian` | Fish S2.1 | 152 | 0.00 | Steady narrator |
| `fish_sarah` | Fish S2.1 | 173 | 0.00 | Engaged female speaker |

\*Word error rate from Whisper transcribing the clip: every voice is fully intelligible. I tried an
automated "which sounds most natural" judge (audio-capable LLMs on OpenRouter), but those models need
credit, so **your ears decide**.

- Fish S2.1 supports inline delivery tags like `[excited]`, `[whisper]` or `[deadpan]`, and voice
  cloning. It returns no word timestamps, so we align words with Whisper (already built in).
- The free tier allows 50 requests a day. The 5:40 video used 18, one per paragraph, all cached, so
  re-renders cost nothing.
- **Recommendation:** Fish for final narration, Piper for fast drafts and timing passes.

## Sources
- [awesome-opus-5-5-videos (GitHub)](https://github.com/athemeroy/awesome-opus-5-5-videos)
- [HN: "Opus 5.5 is good at explainer videos"](https://news.ycombinator.com/item?id=49836374)
- [Rexan Wong on X: how the "one prompt" videos were actually made](https://x.com/rexan_wong/status/2103707054108299437)
- [Orca: what a code-rendered AI film shows](https://www.orcarouter.ai/blog/claude-opus-5-5-code-rendered-ai-history-film)
- [Danny Stuart: agentic video production with Claude Code + Remotion](https://dannystuart.substack.com/p/claude-code-opus-remotion-agentic-promo-video)
- [Charlie Hills: Opus 5.5 motion graphics](https://charliehills.substack.com/p/opus-55-motion-graphics)
- [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)
- [Higgsfield: realistic AI talking & lip-sync videos in 2026](https://higgsfield.ai/blog/make-ai-lipsync-videos)
- [HeyGen vs Hedra lip-sync comparison](https://lipsync.com/compare/heygen-vs-hedra)
- [HeyGen: best AI video tools for YouTube creators 2026](https://www.heygen.com/blog/best-ai-video-tools-youtube-creators-2026)
- [Washington Post: Creator Q&A, Cleo Abram](https://wpcreator.washingtonpost.com/p/creator-q-a-cleo-abram)
- [OutlierKit: Cleo Abram channel analysis](https://outlierkit.com/channel/cleoabram)
- [OpenRouter text-to-speech docs](https://openrouter.ai/docs/guides/overview/multimodal/tts)
- [Fish Audio S2 emotion tags](https://fish.audio/blog/fish-audio-s2-fine-grained-ai-voice-control-at-the-word-level/)

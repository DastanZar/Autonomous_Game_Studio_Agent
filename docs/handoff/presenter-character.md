# Handoff: realistic presenter / UGC track

**This chat is for:** videos led by a consistent, realistic human-looking presenter, in the format
of Cleo Abram's *Huge If True*: a host talking straight to camera, with b-roll and graphics. The
paper-cutout animation track is separate (`docs/handoff/animated-shorts.md`).

**Read first:**
1. `videos/host/HOST_BIBLE.md`: the host, Tess Marlow, and step-by-step image prompts;
2. `videos/RESEARCH.md` §2: how presenter pipelines are built;
3. `AGENT_PROMPT.md`: studio rules. It loads automatically via `CLAUDE.md`.

## Hard line (already agreed with the user)
The host is **original**: inspired by Cleo's *format*, never her face, voice or mannerisms. No
lookalikes or voice clones of real people. Realistic AI-generated people must be disclosed on
YouTube (tick "altered or synthetic content").

## Where it stands
- **Designed:** Tess Marlow, about 30, a science explainer host. Fixed look: short copper-auburn
  curly bob with a clip on the left, freckles, round tortoiseshell glasses, a mustard corduroy
  overshirt over a navy tee, a thin silver chain. Set: a warm cream studio wall.
- **Who makes what:** the **user generates the images** with their own subscription image model; we
  write the prompts and review the results.
- **Waiting on the user:** step 1, the hero portrait (`tess_hero.png`, 4–8 variations, pick one).
  Check it for a clear face, the correct hair, clip, glasses and outfit, and no text or watermark
  before moving to steps 2–5.
- **Open question for the user:** does their subscription include a video or talking-head tool
  (HeyGen, Hedra, Runway, Kling, Veo…)? If yes, use it for lip-sync. If no, the fallback is code:
  audio-driven mouth plus subtle head motion, good enough for picture-in-picture only.

## Next steps
1. Review the hero portrait, then walk the user through the turnaround, expressions, talking-head
   stills (set and green-screen) and gesture stills.
2. Save the approved images to `videos/host/refs/`. Check them for consistency and flag drift with
   corrected prompts.
3. Pick Tess's voice from the Fish library. Never a clone of a real person. Use the free model
   `fish-audio/s2.1-pro-free:free`.
4. Build a **30-second pilot**: three talking-head shots cut against code-rendered graphics
   (reuse `videos/root-keys/render/lib.js`), plus a green-screen composite of Tess beside a graphic.
5. Report the cost per finished minute before scaling up.

## Environment notes
- **OpenRouter:** the key is at `~/.config/openrouter/key`. Free tier, $0 balance: paid image,
  video and avatar models (HeyGen Avatar IV, Seedance, Kling, Veo, Lyria) return 402 until the user
  adds credit.
- **Git:** push **straight to `main`**; the user doesn't want PRs.
- **Files over 30 MB** can't be sent to the user; split them or send previews.

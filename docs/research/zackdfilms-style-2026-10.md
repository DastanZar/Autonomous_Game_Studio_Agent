# Zack D. Films: how the animations are made and how we'd get there (research, 15 Oct 2026)

**The questions (user):**
1. Analyse @zackdfilms and see how we can achieve animations like theirs.
2. Can we get output at the level of video models like Seedance 2.5 through other resources, or by me building it?

## Bottom line

1. **It isn't AI video. It's 3D animation made in Blender**, at factory scale.
   - A freelance 3D artist who says he made 100+ of their Shorts lists his tools: Blender, Cascadeur (physics-assisted
     character animation), BlenderKit assets, After Effects, EmberGen (smoke and fire) and a Flamenco render farm, with
     template files for the base scene, compositing and edit.
   - The channel posts **about 4.8 Shorts a day** (400 uploads in 83 days), so it runs on a team of contract artists
     working from templates.
2. **We can get the look the same way:** Blender on your laptop, driven by Claude through BlenderMCP, with free assets
   (MPFB humans, Mixamo motion, BlenderKit, Poly Haven), our code for captions and arrows, and the GPU for rendering.
   - The hard parts are realistic people and the hours of setup per new set.
   - The easy parts are the things that make their videos work: x-ray cutaways, symbolic props, and a moving camera on
     a sky-blue backdrop.
3. **On Seedance 2.5:** on Artificial Analysis's text-to-video leaderboard, the best **open-weights** model, **MiniMax H3
   (768p), scores 1158 Elo against Seedance 2.5's 1159**. That's a tie.
   - So Seedance-level quality can be downloaded. The limit is your laptop: with 6 GB of VRAM, Wan2GP runs H3 at
     **480p** (about 5–6 GB, reported), slowly, and its licence bars all use in the US, EU, UK and South Korea.
   - Seedance itself has **free daily credits on Dreamina / CapCut** (reports say 120–225 a day, watermarked on the free
     tier). That's enough for tests, not a daily channel.
   - I can't build or train a model like that; it takes thousands of GPUs. What I can do is the craft around the models
     (§4), which narrows the gap a lot.
4. **Recommendation:** pilot one **Gut Gang episode in their style.** Their body Shorts ("Why you get carsick while
   reading": 5.5 M views in a day) are exactly our niche. Make it a hybrid:
   - Blender for anything that must be accurate (cross-sections, mechanisms, the character's key poses);
   - AI image-to-video only for organic motion, starting from our own Blender frames;
   - code for captions and graphics.

   This needs the laptop session.

## 1. The channel in numbers (YouTube Data API, 15 Oct 2026)

| | |
|---|---|
| Subscribers / total views / videos | **29.1 M / 79.8 B / 4,073** (since June 2021) |
| Cadence (last 400 uploads, 24 Jul – 14 Oct 2026) | **4.8 a day** |
| Length | median **35 s** (p10 27 s, p90 48 s) |
| Views per video | median **9.6 M**, mean 11.3 M; engagement (likes + comments) / views: 3.6% |
| Top of the last 400 | Toucan gets a custom artificial beak (53 M), Eagle gets a 3D-printed beak (49 M), How cookiecutter sharks bite whales (46 M), This ant can launch with its face (33 M), What happens after a kangaroo is born? (33 M) |
| Titles | "How X…", "What happens…", "Why you…", "He drifted…": a plain statement plus **one emoji** (😮 🤔 😨 🥲) |
| Topics | true animal stories, the human body, how things work, film trivia, survival stories, everyday hacks |

Raw data: `docs/research/zackdfilms/uploads.json`.

## 2. What the videos look like (6 top Shorts, 233 storyboard frames, about 1 per second)

YouTube blocks downloads from this container ("sign in to confirm you're not a bot"; we don't use cookies), so this
comes from YouTube's own storyboard thumbnails (101×180, about one a second) plus full-size cover frames. The sampled
frames stay out of git (copyright).

- **Medium:** 3D CGI throughout.
  - Semi-realistic humans with detailed skin (freckles, pores, wet eyes) and stylised-real animals.
  - Clean, simple props: CAD screens, 3D printers, cars.
- **Backdrop:** a **flat sky-blue gradient**, or a simple environment (a branch, a car interior, a clinic room) with
  shallow depth of field. Nothing is busy, so the subject always reads at phone size.
- **Camera:** always moving. **Not one pair of consecutive sampled frames is near-identical** (0–1 per video), so no
  second is static. The shots are mostly close-ups and macro (a beak, an eye, the inner ear), and a new angle comes
  roughly every 2–3 seconds. The 1-per-second sampling can't count cuts exactly.
- **Explaining devices:** these are what make the format.
  - **Cutaways and x-rays:** a skull opening onto the brain; the inner ear in cross-section with glowing fluid.
  - **Symbolic props inside the body:** a steering wheel and a speedometer in the inner-ear fluid; a red siren on the
    brain for "emergency response".
  - **Thought bubbles** showing what the brain "thinks" is happening.
  - **Signal lines** (cyan and green squiggles between organs), plus **cyan arrows** and outlines.
  - **Colour as meaning:** the character's skin turning green for nausea.
- **Captions:** 1–3 words at a time, synced to the word. Bold white sans with a dark outline, centred in the lower
  half. There's no other on-screen text.
- **Story shape:**
  - a hook with a problem ("It swung down right into the toucan's upper beak");
  - the mechanism, or the fix;
  - a twist ("but the new beak was too heavy");
  - the payoff callback ("…could pick up fruit again").

  It's one calm narrator; I can't measure pace without the audio.

## 3. How to make it ourselves: three routes

| | **A. Blender (their method)** | **B. AI video** | **C. Hybrid (recommended)** |
|---|---|---|---|
| What | A real 3D scene per shot, rendered on the 3060 (EEVEE) | Prompted or image-to-video clips from H3 or Wan 2.2 (local), or Seedance on free credits | Blender for accurate shots and character key frames; AI image-to-video for organic motion, starting from those frames |
| Look | Exactly controllable; matches theirs once the template is good | Can look very like it ("3D render, soft studio light, sky-blue backdrop"), but drifts: characters change between shots, and anatomy is made up | Accuracy where it matters, life where it's cheap |
| Accuracy (body and mechanisms) | Exact: we build the cross-section | Unreliable: models invent anatomy | Exact |
| Speed on your laptop (estimate) | EEVEE at 1080×1920: roughly 1–5 s a frame, so about 20–90 min of rendering per 35 s Short, plus scene building | 480p: about 10–15 min per 4–5 s clip (Wan 2.2, reported); H3 slower | Mixed; fewest AI clips |
| Cost | Free | Free (local); free credits are watermarked or limited | Free |
| Risks | Setup time for realistic humans; my Blender scenes start out simpler than theirs | Licences (H3 regions; free-tier commercial terms), watermarks, 480p softness | More moving parts |

**Free assets for route A and C:**
- **MPFB 2:** a free, open-source human generator for Blender 4.2+, with automatic Rigify rigs.
- **Mixamo:** free motion capture with an Adobe ID. It's a legacy service; use the community "Mixamo Rig" extension
  on Blender 4.2–5.4.
- **BlenderKit:** its free tier.
- **Poly Haven:** CC0 textures and HDRIs, also pulled in by BlenderMCP.

Character Creator or Daz would get closer to their skin detail, but they're paid. Check the asset licences before
anything ships.

**What I'd build once, as reusable templates in the repo:**
- the sky-blue backdrop scene with soft key and rim lights;
- a set of camera moves (push-in, orbit, macro rack focus);
- a cross-section and x-ray material, as a boolean cutaway with a glow on the cut face;
- a thought-bubble comp;
- a signal-line generator (geometry nodes);
- the skin-tint "emotion" shader;
- the caption style in HyperFrames.

After that, each episode is mostly assembly. That's how they post 4.8 a day.

## 4. Seedance-level output without paying: what's real

- **Quality exists in open weights.** On the AA text-to-video board (v2.1, models up to Sep 2026):
  - 1, Wan 3.0: 1173, closed;
  - 2, Utopai X: 1166, closed;
  - 3, Seedance 2.5: 1159, closed;
  - **4, MiniMax H3 (768p): 1158, open weights**;
  - LTX-2.5: about 950, open;
  - Kling 3.0: 1000;
  - Veo 3.1: 968.

  Wan stopped releasing weights after 2.2 (2.5–3.0 are hosted only).
- **On 6 GB:** Wan2GP runs H3 at 480p in about 5–6 GB of VRAM (reported in its changelog; not yet measured on your
  laptop), and has an H3 2× VAE upsampler to about 960p. Wan 2.2 (Apache-2.0) is the safe fallback, at a clearly
  lower quality.
- **The licence is the catch for H3:** no use at all in the US, EU, UK or South Korea, outputs included; "MiniMax H3"
  has to be credited in a product's interface; no training other models on it. **I still need your country before we
  use it.**
- **Free hosted tiers** are for testing:
  - Dreamina / CapCut (Seedance 2.5): daily credits, watermarked on the free tier.
  - Kling: about 66 credits a day, watermarked, non-commercial (reports conflict).
  - Gemini Omni Flash: one guide says it's free inside YouTube Shorts and the YouTube Create app. That's worth
    checking, since it would be YouTube's own tool.
- **What I can do instead of training a model** is the craft that makes 480p, 5-second clips feel premium:
  - shots designed for 3–5 s;
  - first- and last-frame control from our own Blender or image-model frames, which keeps characters consistent;
  - a reference character sheet;
  - prompts with no text in frame;
  - upscaling (H3 upsampler or SeedVR2) and frame interpolation (RIFE);
  - one shared grade and grain;
  - real sound design and code captions on top.

  Matching the shot style hides most of the resolution gap at phone size.
- **If you ever allow a small budget:** renting a cloud GPU by the hour would run H3 at its native 768p. I haven't
  priced it (we're on free-only).

## 5. Next step (recommended)

A **Gut Gang pilot in this style**: one existing script (e.g. "Why do we yawn?"), on the laptop.
1. Build the backdrop, character and cutaway templates in Blender via BlenderMCP.
2. Render 8–12 shots in EEVEE.
3. Animate 2–3 organic shots with Wan 2.2 or H3 image-to-video from our own frames.
4. Add captions and arrows in HyperFrames.
5. Voice and mix as usual.
6. Measure the render minutes per shot.

This goes in a laptop runbook, like `videos/munich-1972/ai-broll/LAPTOP.md`.

## Sources

- Channel data: YouTube Data API v3 (channels.list, playlistItems.list, videos.list), 15 Oct 2026; storyboard sprites via yt-dlp (mweb client); cover frames from i.ytimg.com
- Production: [Chris Reilly: Viral Videos for Zack D Films](https://supersets.chrisreillyportfolio.com/zackdfilms.php) (a contractor's own portfolio, not an official statement); [How to Make Zack D Films Style Animation in Blender (third-party tutorial)](https://www.youtube.com/watch?v=0quebV6glck)
- Leaderboard: [Artificial Analysis text-to-video](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- Wan weights: [howaiworks: the newest Wan you can download is still 2.2](https://howaiworks.ai/blog/alibaba-wan-open-weights-stopped-at-2-2), [Atlas Cloud: is Wan 3.0 open source](https://www.atlascloud.ai/blog/tips/is-wan-3.0-open-source)
- MiniMax H3 licence: [atoms.dev](https://atoms.dev/blog/minimax-h3-open-weights-multimodal-video-model); H3 in Wan2GP: [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- Free tiers: [Dreamina Seedance 2.5](https://dreamina.capcut.com/seedance/seedance-2-5), [AiSuperSmart: Seedance 2.5 free paths](https://www.aisupersmart.com/seedance-2-5-free/), [camclo3d: Seedance pricing](https://camclo3d.com/blog/seedance-pricing), [whichoneisreal: free AI video limits](https://whichoneisreal.com/compare/best-free-ai-video/), [Krea: best free AI video generators 2026](https://www.krea.ai/blog/best-free-ai-video-generators-in-2026)
- Assets: [MPFB 2](https://github.com/makehumancommunity/mpfb2), [MPFB FAQ](https://static.makehumancommunity.org/mpfb/faq/why_use.html), [Mixamo to Blender 2026](https://app.cinevva.com/guides/mixamo-to-blender-2026), [Cascadeur: Mixamo rigs](https://cascadeur.com/help/using_mixamo_rig_in_cascadeur)
- Laptop stack (BlenderMCP, Wan2GP, VRAM figures): `docs/research/local-studio-stack-2026-10.md`

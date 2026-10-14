# The laptop studio: what an RTX 3060 (6 GB) and 16 GB of RAM can add (research, 14 Oct 2026)

**The question (user):** what software and video tools could I (Claude) control myself, using your RTX 3060 6 GB laptop and
16 GB of RAM, to take the videos to studio quality, on a par with top YouTube channels? A deep dive.

## Bottom line

1. **I can't reach your laptop from this session.** This session runs in a cloud container, and so does every session
   so far: all the work has been CPU-only, with no GPU. To use the 3060, Claude Code has to run **on the laptop itself**.
   You can then drive that session from your phone with Remote Control. It is a one-time setup of about 30 minutes (§1).
2. **The best upgrade is RAM, not the GPU.** With 6 GB of VRAM, every serious model runs by moving part of itself into
   system RAM, so 16 GB is the real limit. Guides put 24 GB as the minimum for local video generation and recommend 32 GB.
   In one report, an 8 GB laptop card took 56 minutes for a 5-second clip because it ran out of RAM. **Going to 32 GB is
   the one hardware change worth making**, if the laptop has free or swappable RAM slots (check the model).
   **Update, 14 Oct: the user says the RAM can't be upgraded**, so the ladder starts with the small models (Wan 2.1 1.3B,
   Wan 2.2 5B), and the 14B and LTX-2 runs are tests that may abort.
3. **The biggest quality gains aren't AI video.** They come from three free, scriptable tools that fit the card easily:
   - **Blender:** real 3D, terrain and maps, driven by Claude through an MCP connector.
   - **Local expressive voices:** Chatterbox, Qwen3-TTS voice design and IndexTTS-2, with no daily quota.
   - **Local music and sound effects:** ACE-Step 1.5 and Stable Audio Open.

   That covers the gaps you've flagged: the voice, the "AI look", and a graphics vocabulary limited to 2D cut-outs.
4. **AI video does work on 6 GB, but slowly.** Expect a 3–5 s clip at 480p in about 10–15 minutes. Wan 2.2, LTX-2 and
   MiniMax H3 all run through low-VRAM front-ends. Use them for b-roll inserts (a 2–4 s establishing shot, a texture,
   motion behind a title), never as the whole video. All text stays set in code (hard rule).
5. **Paid software isn't needed yet.** DaVinci Resolve 21.1 (Sept 2026) added a native connector for Claude Code, but it
   is **Studio-only (€305)**. After Effects with GEOlayers is what Johnny Harris's team uses for maps; there are After
   Effects connectors too, but it's a subscription plus a ~$200 plug-in. Revisit both if we move to long-form with real
   footage.

## 1. How Claude would use the laptop

| | Today (cloud container) | With Claude Code on the laptop |
|---|---|---|
| GPU | none | RTX 3060 6 GB |
| RAM | 15 GB, 4 CPU cores | 16 GB (32 GB after an upgrade) |
| Desktop apps (Blender, Resolve, ComfyUI) | headless only, no GPU | yes: driven through MCP connectors, with screenshots |
| Quotas (Hugging Face ZeroGPU, Fish 50 a day) | hit every day | gone for local models |
| Who starts it | you, from the app | you start it once; then drive it from your phone (Remote Control) |

**Setup:**
1. Install Claude Code natively on Windows: the PowerShell installer `irm https://claude.ai/install.ps1 | iex`, or the
   Claude Desktop app. Also install **Git for Windows**, which gives Claude a bash shell.
2. Clone this repo.
3. Run `claude remote-control` in the repo folder, or `/remote-control` inside a session. The session then appears in
   the Claude app. It keeps running on the laptop with the laptop's files and connectors, and it reconnects after sleep.
4. Install the GPU tools in §3. Most have one-click Windows installers (Wan2GP, ComfyUI portable, Pinokio).

**How the work splits:** cloud sessions keep doing what they do well, such as research, scripts, code renderers,
checks, the dashboard and git. The laptop session does the GPU stages:
- voices;
- music and sound effects;
- Blender shots;
- AI b-roll and upscaling.

Both work on the same repo, so results meet on `main` and the dashboard as now. Large media stays out of git (100 MB
limit per file); only finished deliverables are published.

**Practical limits on the laptop:**
- **VRAM:** Windows and the display already use part of the 6 GB, so plan on about 5 GB free.
- **Power and heat:** run on mains power, in the high-performance power mode. Long jobs throttle on a hot laptop.
- **Encoding:** the 3060 has no AV1 hardware encoder (that started with the RTX 40 series). H.264 and HEVC encoding on
  the GPU (NVENC) are fine for previews; the final YouTube master stays a two-pass x264 encode on the CPU.

## 2. Software Claude can control (the "editing" layer)

| Tool | Cost | How Claude drives it | What it adds for us | Verdict |
|---|---|---|---|---|
| **Blender 4.x/5.x** | Free | Python API, plus **BlenderMCP** (`claude mcp add blender uvx blender-mcp`, v1.8.0): scene edits, viewport screenshots, any Python, and assets from Poly Haven and Sketchfab | Real 3D: globe and terrain flights, 3D maps, cutaways (the Inside Job channel), lighting, depth of field, motion blur. EEVEE renders on the GPU. **BlenderGIS** imports elevation data (works with Blender 5.0, Dec 2025); **Blosm** imports Google photorealistic 3D cities (start at about 1×1 km, since 2.5 M triangles for central Amsterdam) | **Adopt first.** The single biggest jump in visual range |
| **ComfyUI** (local) | Free | HTTP API, plus community MCP servers (e.g. artokun/comfyui-mcp, local or LAN) | One node graph for every image and video model in §3, saved as JSON workflows we can version in git | **Adopt**, as the engine room for local AI |
| **Wan2GP** | Free | Its web UI, or its built-in "Deepy" offline job agent | The easiest low-VRAM front-end: Wan 2.1/2.2, **MiniMax H3**, LTX-2/2.3/2.5, Hunyuan Video 1.5, Flux, Qwen Image, Z-Image, Qwen3-TTS and ACE-Step, all tuned for 6 GB. v18.00, 11 Oct 2026. Windows: run `scripts\install.bat` | **Adopt** for video tests |
| **DaVinci Resolve 21.1** | Free; **Studio €305** (one-off) | Studio: a native MCP server (File → Setup AI Assistants) that works with Claude Code; it can organise media, change settings, cut highlight edits and batch-render. Free: scripting only from the in-app console; external scripting and the MCP server are Studio-only. Python 2 was dropped | Pro colour grading, Fairlight audio, the conform for real-footage edits | **Later**, if we do long-form with real footage |
| **After Effects + GEOlayers 3** | Subscription, plus about $200 for the plug-in | MCP servers over ExtendScript (e.g. kumoproductions/mcp-aftereffects: AE 2024–2026, no plug-in needed) | The map look of Johnny Harris and Vox | **Skip for now.** Blender with real GIS data gets most of the look for free |
| **REAPER** | Low-cost licence, free evaluation | ReaScript in Python (python-reapy) and community REAPER MCP servers; Matchering mastering scripts | A real sound-design session: dialogue, foley, ambience and music stems, mastering | **Optional.** Our ffmpeg/Python mix covers Shorts; REAPER pays off on long-form |
| **Kdenlive / Shotcut (MLT)** | Free | The project is an XML file; `melt <file>.mlt -consumer avformat:out.mp4` renders it | **An editable timeline you can open and tweak by hand**, which our code renderers can't give you | **Useful as a hand-off format.** Not a renderer for us |
| **Manim CE / Motion Canvas** | Free (MIT) | Python / TypeScript code | Precise diagrams and equations (Manim); explainer vector animation (Motion Canvas) | Use for specific scenes |
| **HyperFrames + our canvas engine** (in use) | Free (GSAP vendored) | Code (as now) | Kinetic type, cut-outs, documentary graphics (Munich test) | Keep as the graphics layer |

Remotion is **not** recommended: it's free only for companies of up to 3 people and isn't open source, and HyperFrames
already covers the same ground.

## 3. AI models that fit 6 GB (and what they're for)

The figures are from guides and community reports, not my own runs. Only a run on the actual laptop settles them.

### Voices (the biggest problem you've raised)

| Model | Licence | VRAM | Why it matters |
|---|---|---|---|
| **Chatterbox / Chatterbox Turbo** (Resemble) | MIT | about 4–6 GB (Turbo 350M) | An "exaggeration" dial for emotion, plus tags for laughs and sighs. Ran in round 2 via a free Space; locally there's no quota |
| **Qwen3-TTS VoiceDesign** (Jan 2026) | Apache-2.0 | about 4–6 GB (0.6B; reports conflict) | **Designs a new voice from a text description** ("a bright, teasing, excited woman in her twenties…") with emotion and prosody instructions. This is the cleanest route to the Gut Gang voice without cloning anyone. Also in Wan2GP |
| **IndexTTS-2** | Restricts commercial use (check the licence) | GPU-oriented | The finest emotion control (an 8-emotion vector, or an emotion-reference clip). Blocked by the Hugging Face ZeroGPU quota in round 5; local fixes that |
| VibeVoice (Microsoft) | Research only | — | Long-form, multi-speaker audio; not for channels |
| Kokoro | Apache-2.0 | 2–3 GB | Fast drafts; no emotion |

**Voice polish:**
- **Resemble Enhance** (open source; denoise plus bandwidth repair at 44.1 kHz);
- **DeepFilterNet** (runs in real time even on a laptop CPU).

These sit after any TTS and reduce the thin, "AI" quality.

### Music and sound effects

- **ACE-Step 1.5** (MIT, already our music pick in `audio-stack-2026-09.md`). Its own GPU table puts a 4–6 GB card in
  Tier 2:
  - INT8, with the model moved to the CPU between steps;
  - no lyrics language model;
  - songs up to 8–10 minutes.

  Fine for instrumental beds.
- **Stable Audio Open:** sound effects. On this container's CPU it took 678 s per 1.5 s clip; on the GPU it's practical.
  `studio/tools/sfx_gen.py` is ready to run.

### Video (b-roll inserts only)

| Model / front-end | On 6 GB | Notes |
|---|---|---|
| **Wan 2.2 14B GGUF (Q3/Q4)**, text encoder on the CPU | 480p, about 3–5 s per clip, about 10–15+ min (community reports) | The best-documented 6 GB option; text-to-video and image-to-video |
| Wan 2.2 TI2V 5B (FP8) | listed for 8 GB at 720p; 6 GB with offloading | Lighter, lower quality |
| **LTX-2 / 2.3** (GGUF, or ComfyUI weight streaming) | one report: under 15 min on a 6 GB RTX 3050 laptop at 720p | NVIDIA's guide targets 8–16 GB at 540p for 4 s |
| **MiniMax H3** (33B, native 32 kHz audio) via Wan2GP | Wan2GP: 15 s at 480p in about 5–6 GB VRAM (v17.17) | **Licence:** no use at all in the US, EU, UK or South Korea, outputs included; "MiniMax H3" must be credited in a product's interface; no training other models on it. **This only works if you're outside those regions** |
| FramePack (F1) | 6 GB at any clip length | Slow on laptops (4–8× slower than a 4090), and RAM is the limit: 56 min for 5 s on an 8 GB laptop with too little RAM |

**Image models:**
- **Z-Image Turbo GGUF Q4_K_M:** about 4.5 GB; aggressive quantisation softens fine detail.
- **Flux or Qwen-Image through Nunchaku 4-bit:** about 3–4 GiB claimed, with large speed-ups.

Use them for backgrounds, textures, establishing shots and **original** host character sheets (no lookalikes of real
people).

**Finishing:**
- **Upscaling:** SeedVR2 (3B GGUF, BlockSwap, batch 1; officially 8 GB minimum, so 6 GB is untested) or the lighter
  Real-ESRGAN.
- **Frame interpolation:** RIFE.

**3D assets for Blender:**
- **TRELLIS.2:** low-VRAM mode at 512³, measured at about 6.5 GB on a 3060 8 GB, so tight.
- **Hunyuan3D-2GP:** a low-VRAM fork; the shape stage only, since texturing needs 20 GB+.

**Talking presenter** (an original character, per the no-impersonation rule):
- **MuseTalk:** MIT, about 4–6 GB, fast.
- **LatentSync:** 6.5 GB officially, sharper but slow.
- InfiniteTalk (Wan 14B) is too heavy for this card.

### What 6 GB means in time (estimate)

A 60-second Short with eight AI b-roll inserts of 3–4 s each, at 10–15 min per insert, is **about 1.5–2 hours of GPU
time**. A 10-minute long-form with 40 inserts is an overnight job. Voices, music and Blender shots are much quicker, from
minutes to tens of minutes. So the laptop works best as an **overnight render farm** that I fill with jobs during the
day.

## 4. What "top YouTube quality" actually takes (and where we fall short)

Tools aren't the main gap. These are, roughly in order of how much they cost us now:

1. **Voice.** The most-cited problem in your feedback ("sounds AI", "letdown"). Fix it with local expressive TTS plus
   enhancement (§3), then a blind listening test before anything ships.
2. **Sound design in layers.** Pro mixes are built dialogue → foley → ambience → music → master. We currently have voice,
   one bed and a few stock effects. Retention drops the instant a voice is muddy or levels jump; music and effects
   should carry emotion and transitions, but with restraint. Generated effects and ambience beds, plus a REAPER-style
   stem mix, close this gap.
3. **Pacing contrast.** High-retention documentary channels alternate fast-cut stretches with slower, breathing ones.
   Our motion-kit audit already showed held screens; the critic loop in `tools-review-2026-10.md` targets this.
4. **One visual language per channel, with real data.**
   - **Johnny Harris's map stack:** GEOlayers in After Effects, Natural Earth, **CShapes** (historical borders),
     Mapshaper, MapTiler, PostGIS/QGIS. His map-data person works in Claude Code.
   - **Our equivalents, all free:** Blender with BlenderGIS or Blosm, Natural Earth, CShapes, Mapshaper, plus our code
     renderers. CShapes would serve the historical-borders idea in `historical-borders-2026-09.md`.
5. **Rights to real footage.** The Munich test looked right because of real archival material, which we can't publish.
   For the channels, the sources are public-domain and open archives:
   - US government (NASA, NARA);
   - the Library of Congress;
   - Wikimedia (from a machine that isn't rate-limited: the laptop's own IP may be fine);
   - the Internet Archive's public-domain films;
   - Pexels and Pixabay.

## 5. Plan (one recommendation per step)

| Phase | What | Needs from you | Result |
|---|---|---|---|
| **0. Connect** | Claude Code on the laptop (native Windows plus Git), clone the repo, `claude remote-control`; check whether the RAM can go to 32 GB | About 30 min, once; buying RAM is optional but recommended | I can run GPU jobs |
| **1. Voice and sound (week 1)** | A local voice bake-off on real Gut Gang lines: Chatterbox, Qwen3-TTS VoiceDesign and IndexTTS-2 (if its licence allows our use), each through Resemble Enhance. Then measure pace and pitch swing, transcribe, and put it on the dashboard. Also an ACE-Step music library per channel and a Stable Audio effects set | Listening | A voice you actually like, no daily quota, and a real sound palette |
| **2. Blender (week 2)** | BlenderMCP; one Border Quirks shot as a 3D terrain flight (real elevation and borders) and one Inside Job cutaway test (a pin-tumbler lock) | Watch the tests | A second visual vocabulary beyond cut-outs |
| **3. AI b-roll** | Wan2GP / ComfyUI: test Wan 2.2 and LTX-2 inserts (and H3 if the licence allows your country), plus Z-Image backgrounds and SeedVR2 or Real-ESRGAN finishing; measure real minutes per clip on the laptop | Say which country you're in (for H3's licence) | Measured speed and quality, so we know where inserts are worth it |
| **4. Long-form, only if we go there** | Resolve Studio (€305) for grading, Fairlight and the MCP conform; maybe REAPER | Buying a licence | A pro finishing chain |

## 6. Risks and limits

- **Licences differ per model.** MIT or Apache: Chatterbox, Qwen3-TTS, ACE-Step, MuseTalk, Manim, Motion Canvas.
  Research-only or restricted: VibeVoice, IndexTTS-2 (check), MiniMax H3 (territories). Every model's licence goes into
  the episode README before an output ships.
- **Speed.** Everything heavy on 6 GB uses offloading, so it's slow. The GPU sits idle while I write, so queueing jobs
  overnight is the way to use it.
- **The figures above are reported, not measured by me.** The first laptop session should measure every model we adopt
  (time, VRAM, quality) and replace the estimates in this file.
- **The hard rules still apply:** no text generated inside AI frames, real map data only, no lookalikes of real people
  or creators, and AI-generated media disclosed in descriptions.

## Sources

- Claude Code Remote Control: [DataCamp tutorial](https://www.datacamp.com/tutorial/claude-code-remote-control), [Rick Hightower](https://rickhigh.substack.com/p/claude-code-advanced-drive-your-local); Windows install: [thepromptshelf](https://thepromptshelf.dev/blog/claude-code-windows-native-install-2026/), [gradually.ai](https://www.gradually.ai/en/claude-code-windows/)
- RAM for local video: [localaimaster, low-VRAM text-to-video (20 Jun 2026)](https://localaimaster.com/blog/local-text-to-video-low-vram); [FramePack on a 4060 laptop: RAM is the wall](https://lilting.ch/en/articles/local-long-video-fastwan-framepack-rocm); [Cordux low-VRAM Wan 2.2 workflow](https://github.com/Cordux/ComfyUI-Wan2.2-workflow); [ComfyUI Dynamic VRAM](https://comfyui.org/en/dynamic-vram-in-comfyui-saving-local)
- NVENC/AV1: [OBS 28.1 notes (cowcotland)](https://www.cowcotland.com/news/83886/le-logiciel-obs-studio-28-1-1-est-disponible-et-est-compatible-avec-l-encodeur-nvenc-av1.html), [Bandicam NVENC](https://www.bandicam.com/support/tips/nvidia-nvenc/), [Selur forum (3060 Laptop NVEncC)](https://forum.selur.net/thread-2230.html)
- Blender: [BlenderMCP (PyPI)](https://pypi.org/project/blender-mcp), [Glama listing](https://glama.ai/mcp/servers/ahujasid/blender-mcp); [BlenderGIS](https://github.com/domlysz/BlenderGIS); [Blosm: Google 3D Tiles](https://github.com/vvoovv/blosm/wiki/Import-of-3D-Tiles)
- DaVinci Resolve 21.1: [Digital Production (8 Sep 2026)](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/), [Newsshooter](https://www.newsshooter.com/2026/09/07/blackmagic-design-davinci-resolve-21-1/), [CineD](https://www.cined.com/davinci-resolve-21-1-released-ai-assistant-integration-via-mcp-individual-hdr-trims-and-python-scripting-moves-to-studio/), [Grainzilla](https://grainzilla.com/davinci-resolve-21-1-adds-ai-assistant-integration-and-moves-python-scripting-behind-a-paywall/); [Tooflex Resolve MCP (Studio 18+)](https://mcpservers.org/servers/Tooflex/davinci-resolve-mcp)
- After Effects: [kumoproductions/mcp-aftereffects](https://github.com/kumoproductions/mcp-aftereffects); [How Johnny Harris makes maps (aescripts)](https://aescripts.com/learn/how-johnny-harris-makes-maps/); [10 tools for telling stories with maps (MapScaping, Ryan Shields)](https://mapscaping.com/podcast/10-tools-for-telling-stories-with-maps/)
- ComfyUI MCP: [Comfy Cloud MCP docs](https://docs.comfy.org/development/cloud/mcp-server), [artokun/comfyui-mcp](https://www.mdskills.ai/apps/comfyui-mcp)
- Wan2GP: [README v18.00 (11 Oct 2026)](https://github.com/deepbeepmeep/Wan2GP)
- Video models: [localaimaster: Wan 2.2 vs LTX-2 vs HunyuanVideo](https://localaimaster.com/blog/local-ai-video-generation); [NVIDIA LTX-2 ComfyUI guide](https://www.nvidia.com/en-gb/geforce/news/rtx-ai-video-generation-guide); [LTX-2 on a 6 GB laptop (HF discussion)](https://huggingface.co/Kijai/LTXV2_comfy/discussions/32); [FramePack guide](https://stable-diffusion-art.com/framepack/)
- MiniMax H3: [atoms.dev licence explainer](https://atoms.dev/blog/minimax-h3-open-weights-multimodal-video-model), [Oxen.ai](https://www.oxen.ai/blog/minimax-h3), [RunPod](https://www.runpod.io/blog/minimax-h3-the-open-weight-omni-modal-video-model-and-what-it-takes-to-run-it)
- Images: [Z-Image on 6 GB](https://admin.kinovi.ai/blog/z-image-low-vram-6gb-gpu-setup), [Z-Image GGUF in ComfyUI](https://pandaitech.my/alpha/run-z-image-turbo-on-low-vram-gpus-using-gguf-mode-836b9e28); [Nunchaku](https://github.com/nunchaku-ai/nunchaku)
- Upscaling: [SeedVR2 ComfyUI (numz)](https://huggingface.co/numz/SeedVR2_comfyUI/blob/main/README.md)
- 3D: [TRELLIS.2 in ComfyUI](https://trellis2.app/blog/trellis-2-comfyui), [Hunyuan comparison (Scenario)](https://help.scenario.com/en/articles/comparison-of-hunyuan-models), [Pinokio 3D apps](https://pinokio.co/?tag=3d)
- Voices: [yaps.ai licence-checked list](https://www.yaps.ai/blog/best-local-tts-models), [agentplix expressive TTS](https://agentplix.com/posts/what-is-the-best-and-expressive-ai-tts-running-locally-for/), [tryspeakeasy 2026](https://www.tryspeakeasy.io/blog/open-source-text-to-speech-2026); [Qwen3-TTS (Simon Willison)](https://simonwillison.net/2026/Jan/22/qwen3-tts), [comfyui-wiki](https://comfyui-wiki.com/en/news/2026-01-22-alibaba-qwen3-tts-release)
- Voice polish: [Resemble Enhance (PyPI)](https://pypi.org/project/resemble-enhance), [DeepFilterNet paper](https://arxiv.org/pdf/2305.08227)
- Music: [ACE-Step 1.5 GPU compatibility](https://raw.githubusercontent.com/ace-step/ACE-Step-1.5/HEAD/docs/en/GPU_COMPATIBILITY.md)
- Lip-sync: [LatentSync README mirror](https://huggingface.co/spaces/pillaryao/demo/blob/main/README.md), [MuseTalk models](https://huggingface.co/AEmotionStudio/musetalk-models/blob/main/README.md), [MuseTalk paper](https://arxiv.org/html/2410.10122v1)
- Audio tools: [REAPER ReaScript](https://www.reaper.fm/sdk/reascript/), [python-reapy](https://pypi.org/project/python-reapy/0.7.2/), [bonfire-systems/reaper-mcp](https://github.com/bonfire-systems/reaper-mcp), [Matchering GUI for REAPER](https://hosiprod.gumroad.com/l/matchering)
- MLT/Kdenlive: [KDE forum: melt rendering](https://discuss.kde.org/t/running-melt-from-the-command-line-in-windows-batch-file/22705), [kdenlive_render man page](https://www.mankier.com/1/kdenlive_render)
- Code renderers: [Remotion licence](https://www.remotion.dev/docs/license/faq), [Motion Canvas](https://motioncanvas.io/docs), [Manim CE](https://docs.manim.community/en/stable/index.html)
- Retention and sound design: [AIR Media-Tech retention editing](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8), [IRPR sound design for YouTube](https://sounddesign.irpr.agency/guides/sound-design-for-youtube-complete-guide/)

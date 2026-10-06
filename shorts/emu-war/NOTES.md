# The Great Emu War: discussion and decisions

Folder: `shorts/emu-war`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

### 🧑 User · 2026-09-28 06:20 UTC

This chat is the user's dedicated thread for the paper-cutout animated explainer pipeline (the Emu War / Keys to the Internet style). Read docs/handoff/animated-shorts.md and AGENT_PROMPT.md first. Then post a short hello to the user: a 3-line status of what's shipped and the open threads, and ask which one they want to start with (Sonnet reproduction test, voice choice, or the next video). Don't start heavy work until they answer. Push straight to main (no PRs) when you commit.

#### Claude · 2026-09-28 06:20 UTC

Hi, this is the thread for the paper-cutout explainers. I've read the handoff brief and `AGENT_PROMPT.md`. Here's where things stand:

1. **Shipped (all on `main`):**
   - **The Great Emu War:** a 46-second vertical short with the Piper voice.
   - **The Keys to the Internet (Sort Of):** a 5:40 widescreen explainer with Fish "Felix" and the reusable `lib.js` engine.
   - **The Emu War recipe:** 8 step-by-step docs. A clean rebuild scored 29/29 on the grader.
2. **Open threads:**
   - **Sonnet reproduction test:** can a cheaper model rebuild the Emu War from the recipe?
   - **Voice choice:** the shoot-out in `videos/voice-test/` is still waiting on your pick. The default is Felix.
   - **Next video:** new topic still to pick.
3. **Caveats:**
   - Merged PR #1 calls the recipes "bit-identical". That's true for the audio. For the frames, 1,099 of 1,105 match exactly; the other 6 differ slightly but you can't see it.
   - The OpenRouter key has $0 credit, so only the free Fish voice works, capped at 50 requests a day.
   - This container is fresh, so I'll reinstall the tools once we start work.

Which do you want to start with: **the Sonnet test, the voice choice, or the next video?** If it's the next video and you have a topic in mind, tell me. Otherwise I'll come back with one pick that has a hook and sources.

### 🧑 User · 2026-09-28 06:26 UTC

I want to try a few different things, can you use blender? thats question #1
i want you to research the top niches on yt shorts that are working today that we can make videos on, realistically
my ideas : science explainers, human like characters to re-tell historic events like cuban missile crisis story or chernobyl, continuing the style of videos we have done 2 on already emu and people who can lock the internet, a charcter based explainer - like generating an animated character that goes and explains some topic,similarly character based ai news updater - sort of like whats the top 10 today in the world on ai

these are all quite rough ideas, i dont want any generation as of now, just planning between me and you, come back with research with exact channel names and videos and i will give them a watch and see their metrics, also look into my ideas and see which ones can pull most views if all, and see whos doing it today or even close ot us and lets see thier channels and videos

#### Claude · 2026-09-28 06:35 UTC

## 1. Can I use Blender?

Yes. I installed it here and ran test renders (Blender 5.0, as a Python module).

- **Speed:** the machine has no graphics card, only 4 processor cores. A test frame at half-HD size took 4.7 s with the slower, higher-quality renderer (Cycles) and 0.8 s with the fast preview renderer. My untested estimate for a full-HD 45-second short is **about 2–6 hours of rendering**.
- **Best use:** 3D shots (a reactor cutaway, a missile's flight path) dropped into our existing engine, which still does all the text. For example, one Blender [Chernobyl simulation](https://www.youtube.com/watch?v=WMr3-ShzB08) has 9.5M views on a 100k-subscriber channel.
- **Caveat:** it has to be reinstalled in each new session, which takes about a minute.

## 2. Your ideas, ranked by the data

I pulled real numbers with a download tool, `yt-dlp`: each channel's **median** views over its last 30 Shorts, which is what a typical upload gets. The full tables are in `docs/research/shorts-niches-2026-09.md` (pushed to `main`).

**1. Our current style (quirky true stories, maps, history): strongest fit.** It's proven and our pipeline already makes it.
- **Knowledgia** (2.2M subs, **1.55M median**): [Why wasn't Portugal conquered by Spain?](https://www.youtube.com/shorts/O0WT8kqz31g) (10M). This is the closest channel to us.
- **Mustard** (2.15M median, only 6 Shorts in the sample): [Flying aircraft carriers actually existed](https://www.youtube.com/shorts/i2ySKZo2eQ0) (4.8M).
- **Johnny Harris** (0.49M median): [How a nuclear bomb really works](https://www.youtube.com/shorts/_FsJJGlT4uo) (8.5M).
- **Half as Interesting:** [How Blink 182 violated the Geneva Conventions](https://www.youtube.com/shorts/_f0GXNp38ko) (3.2M).
- **The Armchair Historian** (0.18M median): [Why did soldiers fight in lines?](https://www.youtube.com/shorts/uVq2WFK9rjY) (2.8M).

**2. Science explainers: highest ceiling.** The biggest numbers here, but most of the giants depend on a host or heavy production. The model for us is Zack D. Films: faceless 3D, which is where Blender fits.
- **Zack D. Films** (28.6M subs, **3.5M median**): [What to do if your car sinks](https://www.youtube.com/shorts/p832whe8hrI) (9.9M).
- **Kurzgesagt** (1.2M median): [The deadliest thing in your kitchen](https://www.youtube.com/shorts/2cK8l5Yg5w8).
- **Cleo Abram** (1.5M median) and **Veritasium** (2.6M median) are both host-led.

**3. Human-like characters retelling history: real, but blocked for now.** It needs paid video models, and our OpenRouter key has $0 credit.
- **Chloe VS History** is AI time-travel vlogs (407k subs, 0.18M median): [I tried to warn the people of Pompeii](https://www.youtube.com/shorts/a4MmclH1JP0) and a [Titanic vlog](https://www.youtube.com/watch?v=HZRdKlOHogk) (2.8M).
- The format is bigger on TikTok. A Chernobyl-worker POV reportedly has 21.8M views, but that figure is from a blog and I didn't check it.
- **Opening:** Cuban Missile Crisis Shorts on YouTube are almost empty. The best one I found has [7.7k views](https://youtube.com/shorts/YYIx1NFYtv0). Chernobyl has proven demand: the long-form videos get 6M+.

**4. A mascot character explaining topics: weak on its own.**
- **Life Noggin** has a mascot and 3.1M subscribers, but its Shorts median is **about 10k**. The topic sells the video, not the character.
- **Neural Viz** (original AI characters) built a cult following (240k subs), but it's comedy fiction, not explainers.

**5. Character-based daily AI news: weakest by the numbers.**
- Most AI-news Shorts medians sit between under 5k and 40k: Matt Wolfe, Matthew Berman, Wes Roth, AI Daily Brief, AI Search.
- The one breakout is **Fireship** (1.45M median): [Why do computers suck at math?](https://www.youtube.com/shorts/s9F8pu5KfyM) (8.7M). It works because it's jokes and developer culture, not a top-10 list.
- A daily format also means fact-checking every day on a voice limited to 50 free requests a day.

**Also worth knowing:** cheap copycat channels get almost nothing. There's even a stick-figure Emu War Short with 7 views. Automating a template won't work in this market; quality and a real hook are what win.

## My recommendation

Merge ideas 1 and 2 into one channel of weird true stories and weird science in our paper-cutout style, with Blender 3D shots for moments like a reactor cutaway. Knowledgia and Zack D. Films are the benchmarks to watch. Keep idea 3 for when there's credit for paid video models. Drop the daily AI news format unless we do it Fireship-style: weekly and joke-first.

Sources: [autoclips on the history POV trend](https://www.autoclips.app/ai-history-pov-videos), [Wired profile of Neural Viz, via Mediagazer](https://mediagazer.com/251008/p1). Everything else comes from YouTube's own numbers, pulled 2026-09-28.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 07:23 UTC

Lets decide on the flowchart and our starting out niches, i want to start with 3 channels and 3 different niche/delivery style/series-topics, let spick the highest view pullers, also understanding how to drive views, if naturally driven - best

#### Claude · 2026-09-28 07:26 UTC

I've written up the plan as a page with the three channel picks, the production flowchart and how views are earned: **[Three-Channel Launch Plan](https://claude.ai/artifact/CmYPyPy4XHE9L76Hut1veD)**. The page source is also in `docs/plan/launch-plan.html`, pushed to `main`.

## The three channels
I picked by the median Shorts views of the closest existing channels. I kept only what our pipeline can make without paid video models.

| | Channel (working name) | Niche and style | Benchmark (Shorts median) |
|---|---|---|---|
| A | **Why the Map Looks Like That** | Strange geography and history as a "why", in our paper-cutout style on real maps. The Emu War can be episode 1. | Knowledgia **1.55M**; Mustard 2.15M |
| B | **The Body Cast** | Science told by organs, cells and microbes as recurring cartoon characters, drawn in code | SolarBalls **0.75M**; Kurzgesagt 1.2M |
| C | **Ranked** | Animated rankings between countries from real datasets (World Bank, FAO, UN) | Opera_cb **0.69M** |

For B I chose the body over planets because SolarBalls already owns planets. Body topics are also where Zack D. Films gets its millions.

The biggest niche overall, Zack D.-style 3D "what happens if" stories (3.5M median), is parked. It needs rigged 3D humans, which CPU Blender can't render at a daily pace, or video models that need credit. It becomes channel 4 once we have credit.

## The flowchart
Topic radar → scoring → **you approve 3 topics** → research and source table → **fact check** → script → voice → **voice accuracy check** → storyboard from the channel's template → contact-sheet review → render and mix → **final check (transcript, loudness, specs)** → titles, captions, thumbnail → publish to YouTube, TikTok and Reels → analytics at 48 hours feed back into scoring.

You only touch it at the approval step, about 5 minutes a day, plus an optional preview before publishing.

## Getting views without paying
- **How it works:** YouTube shows each Short to a small test audience first. It widens the audience based on how many **watch rather than swipe away** and what **percentage** they watch. Since March 2025, replays count as views too.
- **What we control:** motion and a question on screen in the first second, 25–40 seconds long, an ending that loops back to the start, one niche per channel, and a recurring series or cast.
- **Cadence:** a daily upload per channel, hooks timed to anniversaries and news, and the same file cross-posted to TikTok and Reels.
- **What we won't do:** no paid promotion and no template spam. Since July 2025, YouTube's "inauthentic content" policy removes monetization from mass-produced, low-effort videos, and our fact check keeps each episode clear of that.

**Expectations:**
- Shorts pay about $0.01–0.08 per 1,000 views. The YouTube Partner Program needs 1,000 subscribers and 10M Shorts views in 90 days. Shorts build the audience; the money comes later from long-form and sponsors.
- The free voice tier covers three Shorts a day, but with little room for retakes. The local voice is the fallback.

## What I need from you
1. A yes or no on the three picks, and on the body cast versus a different cast.
2. Create three YouTube channels and pick their names.
3. For hands-off publishing, a YouTube Data API OAuth client added as an environment secret. Until then, you upload the files I deliver.
4. Optionally, TikTok and Instagram accounts for cross-posting.

Once you've confirmed the picks, my next step is to build the three channel templates and a pilot episode for each. I'll send contact sheets before any full render.

### 🧑 User · 2026-09-28 07:35 UTC

Before you go ahead and make the actual videos, which i think is not the hard part, the hard part is making the system the machine that keeps its consistency across niches, understands how to research, how to write scripts, how to do it, the way you made a complete hand holding step by step of how to do for emu war video, we need a system like that, much larger in scale, automated and can be scaled further, lay down the blocks for that so even a model like sonnet can plug and play in it

#### Claude · 2026-09-28 07:36 UTC

I've got real sources for the Emu War worked example. Next I'm writing the system: data formats, channel bibles, stage playbooks, gates and a state machine.

#### Claude · 2026-09-28 07:42 UTC

Bibles validate. Now the worked example: the Emu War converted into the new data formats, so the gates have a real episode to prove themselves on.

#### Claude · 2026-09-28 07:45 UTC

Now I'm re-measuring each Emu War line on the final mix with the stronger Whisper model.

#### Claude · 2026-09-28 07:52 UTC

I've built the first version of the studio system and pushed it to `main` in a new `studio/` folder. It's the Emu War recipe idea generalised: instead of copying one video step by step, a model works on one stage of one episode at a time, follows that stage's playbook, and has to pass an automatic check before the episode moves on. What isn't built yet is the rendering half: the voice tool and a shared engine that draws scenes, so it can't produce a new video end to end today.

**How a model like Sonnet works in it:**
```
python3 studio/studio.py next  why-map/point-roberts   → the stage, which playbook to read, which files to write
   ...does the work...
python3 studio/studio.py check why-map/point-roberts   → pass moves the episode on; fail names exactly what's wrong
```
It doesn't need to understand the whole system, just the rules page, one playbook and the channel's settings file. A skill in `.claude/skills/studio/` points Sonnet at this loop.

## The building blocks

1. **Data formats.** Each stage (topic, research, script, storyboard, packaging and so on) hands the next one a file with a fixed shape.
2. **Channel bibles.** One settings file per channel holds everything that must stay consistent:
   - its promise, voice, colours, fonts and character cast;
   - its series formats, and the story beats each one follows;
   - its script rules, allowed scene types, source rules and publishing settings.

   The three channels (maps, body cast, rankings) are drafted. Adding a channel means writing a new file, not new code.
3. **Playbooks.** 11 step-by-step guides covering research, scriptwriting, storyboarding and the rest, each with the Emu War as a worked example and the usual mistakes.
4. **Automatic checks.** Every stage has a check that doesn't rely on any AI. For example:
   - every fact must trace to a source, with the supporting sentence copied from it;
   - uncertain numbers must show their label on screen ("the major's own count");
   - numbers in the narration are spelled out, captions cover every spoken word, and runtime fits the channel;
   - every storyboard cue lands on a word that is actually spoken, and scenes come only from an approved catalogue;
   - the voice matches the script, loudness is right, and the upload description lists its sources.
5. **Episode tracker.** It knows where every episode is and refuses to skip ahead. If an earlier file changes after a stage has passed, that stage is flagged to be redone.

The storyboard is written as data: the model picks scene types from a catalogue and times them to spoken words, rather than writing drawing code. That's what keeps three channels on-brand.

Two decisions stay with you by design: approving topics, and approving any voice line that fails its check after you've listened to it. Models can't fill those fields in.

## What I tested
- **Gold example.** The Emu War is re-done in the new formats with real sources, including a scholarly chapter from ANU, and every claim carries an excerpt copied from its source. It passes the topic, research, script, voice, storyboard, final and packaging checks. The picture-review check isn't in the example yet because it needs rendered stills.
- **Self-test.** I deliberately broke the example 13 ways (an unsourced claim, digits in the narration, a cue on a word that's never spoken, loudness off target, and others). All 13 were caught.
- **Measured on the real Emu file:** 1080×1920, 24 fps, 46.04 s, −14.2 LUFS, true peak −1.4 dB, transcript error rate 0.0.

**A correction along the way.** At first I transcribed each line of the Emu mix on its own, and short lines looked badly misheard ("The emus did not" came back as "Daines did not"). Transcribing the whole mix at once heard every line correctly. So the problem was my method, not the audio. The system now transcribes once and scores each line from that, and the lesson is logged in `studio/knowledge/lessons.md`.

## Not built yet
- **Phase 2:** the voice tool (its spec is written) and the shared engine that turns a storyboard into frames. The engine is the biggest remaining piece.
- **Phase 3:**
  - a topic radar that suggests candidate topics each day;
  - uploading and pulling analytics through the YouTube API, which needs your OAuth credentials added as an environment secret;
  - a daily scheduler.
- **Untested with Sonnet.** The system is built so Sonnet can run it, but no Sonnet run has happened yet.

## Recommended next step
Before building the engine, run a real Sonnet trial: one maps-channel episode from topic through storyboard. Those stages are fully runnable today and they're the judgment-heavy ones. Wherever Sonnet fails a check, we improve that playbook. Then build the engine. Want me to set that trial up?

Start at `studio/README.md`.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 08:33 UTC

ill do the manual copy pasting

#### Claude · 2026-09-28 08:34 UTC

Understood, I won't create anything. Here's the Phase B message to paste into the **"Sonnet trial: why-map studio worker"** session. It's written for that session, which already has Phase A in its context:

```
PHASE B. Good work on Phase A. The human approved all three topics. The approvals are recorded in commit 96398b6 on trial/sonnet-1, so run `git pull origin trial/sonnet-1` first. Also run `git fetch origin main && git merge origin/main` in case studio/ changed.

Task: take each episode through research → script → voice → storyboard, following `python3 studio/studio.py next why-map/<slug>` and the playbooks exactly as before. Do them in this order: point-roberts, swiss-invades-liechtenstein, baarle-border-houses. Finish one episode's four stages before starting the next.

Rules:
- Research: run `python3 studio/tools/verify_quotes.py episodes/why-map/<slug>` before the check (see sop/02). Some sites block automated fetching (atlasobscura returns 403); that's expected.
- Voice: there's no Fish key in your container, so studio/tools/vo.py falls back to a Piper DRAFT voice. Install it with `pip install piper-tts==1.8.0` and download the voice exactly as shown in recipes/emu-war/02-assets.md (the ~/voices/en_US-ryan-high files). vo.py has never been run before. If it crashes or produces something wrong, do NOT fix anything under studio/. Put the full traceback or symptom in the report, skip voice and storyboard for that episode, and carry on with the next episode's research and script.
- Stop a stage after 3 failed checks. Record why, then move on to the next episode.
- Don't touch picture or anything after it; the render engine isn't built.
- Never edit anything under studio/, and never fill voice_waivers.

When done, append a "Phase B" section to episodes/why-map/TRIAL-REPORT.md with:
(1) per episode and per stage: number of check attempts, and what failed each time (quote the gate lines);
(2) facts you corrected or dropped in research, compared with what the topic cards claimed;
(3) the per-paragraph WER table vo.py printed, for each episode;
(4) a friction log for these stages (file + what was unclear, wrong or missing);
(5) the final `python3 studio/studio.py status`.

Commit episodes/ only. build/ stays uncommitted, except copy each episode's build/timeline.json and build/quote_check.json into the episode folder as timeline.snapshot.json and quote_check.snapshot.json. Push with `git push -u origin HEAD:trial/sonnet-1`, then stop.
```

Two loose ends from the automatic setup, both still active:
- **The "Orchestrator → Sonnet trial" Routine never delivered anything.** It's harmless, but you may want to delete it from your Routines list.
- **My check-in is still scheduled for about 09:12 UTC.** When it fires, I'll pull `trial/sonnet-1` and audit whatever Sonnet has pushed by then: I'll re-run the checks, open the sources, check the Point Roberts claim and the Swiss incursion dates, and review the scripts. If it hasn't pushed yet, just tell me when it's done and I'll audit then.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 09:35 UTC

start building the render engine here

#### Claude · 2026-09-28 09:38 UTC

I'm reading the Emu renderer so the engine keeps its look (paper texture, boil, captions, transitions) rather than reinventing it.

#### Claude · 2026-09-28 09:42 UTC

Now the prop library, ported from the Emu characters plus new ones the storyboards ask for: flag, building, telegram, person and a generic fallback.

#### Claude · 2026-09-28 10:07 UTC

The render engine works: it turned Sonnet's storyboards into two finished draft Shorts, Point Roberts and Swiss, which I've just sent you. The third, Baarle, is held back on purpose. Its split-screen says "NETHERLANDS: NOT ALLOWED", and no source in the dossier supports that. The review stage stays failed until the storyboard is fixed, so that line can't reach the video.

Both drafts use the Piper draft voice (the Fish voice needs an OpenRouter key) and have no music or sound effects yet. I can't listen to them, so this is what I measured:

| | Point Roberts | Swiss |
|---|---|---|
| Size and frame rate | 1080×1920, 24 fps | 1080×1920, 24 fps |
| Length | 41.5 s | 44.9 s |
| Loudness / peak | −14.0 LUFS / −1.4 dBTP | −14.1 LUFS / −1.3 dBTP |
| Transcript vs script | 0.7% error | 0.8% error |
| Checks, topic through final | all pass | all pass |

**What the engine does:**
- **Scenes come from the storyboard.** It draws 12 scene types (title cards, stamps, count-ups, quote cards, maps, callouts and more) and 10 props from the storyboard file alone, in the Emu War's paper-cutout look.
- **Timing follows the voice.** Every change on screen lands on a spoken word, and captions are burned in above the platform's on-screen buttons.
- **Maps use real data.** Country borders come from Natural Earth. For smaller places it uses OpenStreetMap, so Baarle's actual Belgian enclaves are drawn, with an on-screen credit.
- **It's fast.** About 35 s to render a full Short, plus about 1 minute to encode.
- **It reports problems.** Anything it can't draw exactly as asked gets a warning, such as an unknown prop or a scene with no code.

**Review:** I did four rounds on contact sheets and fixed about a dozen defects. Four were worth knowing about:
- **A placeholder flag looked Dutch.** Its red, white and blue stripes read as the Netherlands in a US/Canada story. It's now a neutral flag with a star.
- **A quote card was blank while the quote was being read.** The sheets hid this; I only caught it in frames pulled from the finished MP4. The playbook now requires that spot-check.
- **Loudness came out at −15.4 instead of −14.** The encoder now measures and corrects it.
- **The map tool zoomed Australia to a speck.** Natural Earth tags a tiny island group as AU too, and it overwrote the mainland.

All four fixes are in the playbooks and the lessons log.

**What doesn't work yet:**
- no music or sound effects, although the engine already writes the timing cues for them;
- captions (subtitle file) and thumbnail builders;
- the scene types the rankings and body-cast channels need (animated bar charts, talking characters);
- the `timeline` scene type is built but no episode has used it yet;
- state or province borders (e.g. Western Australia) don't highlight yet.

Everything is pushed to `main`.

**Next:** I'd build the music and sound-effects tool so these become finished videos, and have Sonnet fix Baarle's label in the meantime. After that come the scene types and looks for the other two channels.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-29 04:33 UTC

build the music and SFX tool but research for open sourced best options or best free options, i only want the best possible solutions for everything

#### Claude · 2026-09-29 04:33 UTC

I'll research before building. There are three routes: open-source AI music models, free royalty-free libraries, and code synthesis (what the Emu War used). What matters is quality, a license that allows monetized YouTube, avoiding Content ID claims, and whether it runs on this 4-core, no-GPU container.

### 🧑 User · 2026-09-29 UTC

organs confirmed, go with flat cast and flag badges
what about channels like knowledgia? maps content explaining geopolitics
for the science explainer channel, i would like much more fun animated backgrounds and such, not the type we had for the emu videos
can you just share a few examples, we can decide just from pictures or examples before we go ahead and generate videos - just for inspiration, not for copying

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

dont you already have the key, you were making videos right? and of all the content we have generated so far which is multiple videos where is it all stored

#### Claude · record

- **No OpenRouter key here** (neither env nor ~/.config). The Emu War and Keys to the Internet videos were voiced in the earlier MAREA session, whose container had the key; it was never stored centrally. The why-map episodes used the free Piper draft voice.
- **Inventory:**
  - Emu War MP4 is in git.
  - Keys to the Internet: only the SRT and thumbnail are in git; the master parts were gitignored and lived in the old container (status unknown).
  - Point Roberts and Swiss MP4s existed only on this container. Now force-added to git (c5a4e3a).
  - Baarle has no final MP4.
- **Creating a GitHub Release** as a media store was blocked (403 for this session type).
- DECISIONS row: storage rule.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

okay let the video go, can we atleast moving forward, have all the information we discussed about each video, just the chat contents, save all that atleast?

#### Claude · record

- Built `studio/tools/notes.py`, which writes a NOTES.md per video folder (3 why-map episodes, Emu War, Keys to the Internet). Each file has:
  - a hand-written Notes section that is kept across rebuilds;
  - every chat message mentioning the video, with the user message that prompted it;
  - the review rounds and trial-report excerpts.
- The dashboard build regenerates the files, and every Media library card links to "discussion". AGENTS.md has the rule.
- Limit: chats from other sessions are included only if those sessions wrote to docs/log (now required). The earlier MAREA and Sonnet trial transcripts are not readable from here; what survives of them is in TRIAL-REPORT.md, review.json and what was pasted into this chat.

### 🧑 User · 2026-10-06 UTC

I looked at the shots for the us town canada video, those were both terrible both versions, a lot of scenes have either irrelevant things or not mesmerizing enoug, why is the first scene either a flag or an orange circle makes no sense, this isnt as rich as the emu war video, that still is your best output, write a richer storyline, more details, more things happeming on the screen, use the entire canvas, use your abilities to the fullest, there is no duration boundation either, stick to whatever is the best short length for views

### 🧑 User · 2026-10-06 UTC

You can even go beyond Emu war, thats the minimum to hit, not maximum

#### Claude · record (Point Roberts v2)

- **Diagnosis:** v1 and the HyperFrames cut were abstract cards on empty paper. The Emu War works because it has one world, recurring characters, and props that carry each joke and fact.
- **Research:** added CBC (27 Sep 2020, "The birth of a ghost town") as a source, plus four new claims: customers are mostly British Columbians buying gas and collecting parcels; grocery 5,000 → about 50 shoppers a day; five gas stations for fewer than 1,000 people; season 6,000 vs 1,250. c_covid now cites CBC/BPRI with the label "Border Policy Research Institute estimate". All 12 quotes re-verified.
- **Script:** 147 words, 14 paragraphs; loops ("Which is why…" → "This American town has one road out"). Voiced with Kokoro bm_george at speed 1.1, 59.8 s, WER 0.00 on every paragraph. The why-map window was widened to 25–62 s ("no duration boundation"; under 60 s kept for Shorts).
- **Tool fixes along the way:**
  - textnorm: ordinals, Whisper's split thousands, "twelve hundred", "a thousand". Three false retake flags are gone.
  - vo.py saves `build/heard.txt`.
  - geo.py `coast: "osm"`: the real coastline and border from Overpass, with mirror fallback. Natural Earth drew Point Roberts as a 6-point blob.
  - Custom scenes can take a map region, request a hard cut, and a `flagship` storyboard lifts the 20% custom cap.
- **Picture:** `scenes.js`, 14 bespoke scenes in one paper world. Hook = the town, its one road, a car waiting at the Canadian barrier. Then: real map with 1,191 residents; 1846 desk with ruler and quill; magnifier on the coast; surveyors snip the peninsula loose; drive with two passport stamps and a 25-mile odometer; school bus crossing four times while the sun crosses the sky; cutaway of the pipe from a Canadian reservoir; border slams shut and cars vanish, parcels pile up; meter drains and four of five shops go dark; 1,000 figures = 5,000 shoppers shrink to 10; five gas stations with one walker and a tumbleweed; tariff tug-of-war and the diner's February; back to the line, then a torn wipe into the opening frame.
- **Reviews:** 3 rounds logged in review.json.
  - Builder sheet 1: empty lower 40% in side views, small actors, label clutter while zoomed, passport over the map.
  - Builder sheet 2: thin trade beat and bare desk.
  - Critic pass on frames pulled from the encoded MP4: odometer stopped at 21 not 25, the grocery crowd read as noise, a blank half-parchment, the barrier arm swung down instead of up, the welcome sign hidden behind trees.
  - All fixed and re-rendered.
- **Measured:** 1080×1920, 24 fps, 59.75 s, −14.1 LUFS, true peak −1.9, final-mix WER 0.00, music 8 dB under the voice. Frozen time 0.40 s per 30 s with a 0.3 s longest hold, against a bar of 1 s and 0.6 s. Emu War measures 1.44 s, v1 2.10 s, HyperFrames 3.33 s. `studio/tools/frozen.py` was added so any agent can measure it.
- **Gates:** research, script, voice, storyboard, picture, final and package all pass. Publish waits on the user.
- **Delivered:** dashboard review item `point-roberts-v2` (v2 with v1 and C beneath it). The bake-off item it replaces was removed. README with fact table, SRT, thumbnail, package.json.
- **Not verified:** nobody has listened. Claude can't hear audio; checked only by transcription and levels. The voice is still the free draft (OpenRouter key rotation pending).

### 🧑 User · 2026-10-06 UTC

can you tell me what is the difference between how you made this one and the emu war one, like did you make the objects in this video the same way you made the emu's?

#### Claude · record

- Same technique for both: every object drawn in code from simple shapes with `cut()` (flat fill, ink outline, drop shadow), with boil jitter, paper texture and grain.
- What differs:
  - Emu War: a standalone renderer with one 60–100-line hero character (the emu: leg joints, feathers).
  - v2: the shared engine with many small objects of about 10 lines each, real OSM maps, no hero character.
- The emu has personality; v2 has more on screen but nothing memorable. Proposed a recurring original host character.

### 🧑 User · 2026-10-06 UTC

dont we have a chennel for posting content like the emu war one?
george does look like the better voice out of the options
our engine render looked better than hyperframes
for the music tracks for the the other 2 niche's - lets use one, see its performance and rotate based on analytical data
the emu war had a certain fineesee thats lacking form this, these look like amateru drawing cutouts, that looked like well drawn, proper curves, coliurs, animations, something is missing if you can go through and re think harder as to what more we can do, try a bunch of different things of rendering the video, different animations, try your best, search the web look for help from others but try better, give me your 3 best versions of this video and do try something different in the 3, its more about nailing our methodology than a parcticular content piece

#### Claude · record

- **Decisions recorded:**
  - Kokoro George on all three channels.
  - Our engine over HyperFrames; the bake-off and the Gemini C2 run are closed.
  - One music track per niche (`inside` for Gut Gang, `countdown` for Leader Flags), rotated on analytics after 5 uploads each. `audio.py` reads `audio.music.current`; picked by the strategy model, not yet heard.
  - The voice, music and bake-off review items are closed.
- **Diagnosis** (Emu War vs v2, frame by frame): v2's gap is art direction, not quantity.
  - A dozen competing colours, many small boxy 10-line objects.
  - The Emu War has 4–5 tones, one hero per beat, bézier shapes, 60–100-line characters and designed paper props.
- **Web research** (Kurzgesagt style, paper-cutout art direction, three.js dioramas): general guidance only. Rounded shapes, a limited and deliberate palette, directional light and shadow so flat layers read as dimensional, joints for characters.
- **Built three versions** of the same Short (same script, voice, facts and music) in `episodes/why-map/point-roberts/variants/{a,b,c}`:
  - **A, art-directed paper:**
    - lit paper pieces (rim light, core shadow, contact shadow) and one PNW palette;
    - an original recurring character, the local (knit cap, beard, buffalo-check jacket), plus 1850s surveyors;
    - designed props: census card, passport stamps, rolling odometer, punched bus pass, water agreement, ledger, receipt, chalkboard;
    - spring and anticipation motion.
  - **B, 3D paper miniature** (Three.js r159 on SwiftShader inside our engine):
    - OSM coastline extruded into paper slabs, nested in the Natural Earth continent;
    - instanced paper trees and houses, low sun with soft shadows, tilt-shift blur;
    - one continuous camera from street level to the 1846 continent and back;
    - the 3D world on twos (12 fps) like stop-motion.
  - **C, kinetic infographic:** night map, glowing lines, a continuous zoom flight (OSM close in, Natural Earth far out), letters rising out of a mask, one-dot-per-person unit charts. No paper.
- **Engine changes:**
  - Episode `vendor/*.js` loads before `scenes.js`.
  - WebGL runs through SwiftShader. The first attempt made all 2D rendering about 50× slower (v2 frames went from about 0.04 s to about 2 s); fixed with `--disable-accelerated-2d-canvas`.
  - Render workers take 12-frame runs.
  - A storyboard can set `theme`.
- **Failures along the way:**
  - A's local first had his knees at hip height, so he floated; fixed.
  - `tone()` returned rgb() that couldn't be toned again, which made some trees black; fixed.
  - C's kinetic type clipped its last letters (letter spacing counted twice); fixed.
  - B's toy-scale props blocked the close shots; rescaled and relocated, still B's weakness.
  - B and C endings didn't match their first frame (gas stations left visible, car missing); fixed and the affected frames re-rendered.
  - `pkill -f` matched my own shell twice; switched to killing by PID.
- **Write-up:** `docs/research/methodology-3-versions-2026-10.md`. Dashboard review item `point-roberts-3-methods` with A, B, C and v2.
- **Answer to the channel question:** Border Quirks (why-map) is the Emu War channel. Its "The time a country…" series is exactly that format.

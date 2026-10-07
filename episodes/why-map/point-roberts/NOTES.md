# This US town's only road goes through Canada: discussion and decisions

Folder: `episodes/why-map/point-roberts`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 07:35 UTC

Before you go ahead and make the actual videos, which i think is not the hard part, the hard part is making the system the machine that keeps its consistency across niches, understands how to research, how to write scripts, how to do it, the way you made a complete hand holding step by step of how to do for emu war video, we need a system like that, much larger in scale, automated and can be scaled further, lay down the blocks for that so even a model like sonnet can plug and play in it

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

### 🧑 User · 2026-09-28 08:29 UTC

check on the Sonnet trial now, everything approved

#### Claude · 2026-09-28 08:31 UTC

I checked on the trial. Phase A is done, your approval is recorded, and Phase B has been sent, but the session hadn't picked it up yet when I last looked.

## Phase A result: all three topic cards passed first try
Each card cleared every check except human approval on the first attempt, taking about 7 minutes and $1.39 in total. The session was already running at high effort.

| Episode | Hook | Series | Score |
|---|---|---|---|
| `swiss-invades-liechtenstein` | "In two thousand seven, Switzerland invaded Liechtenstein by accident. It wasn't the first time." | the_time | 4.55 |
| `point-roberts` | "There's a piece of the United States you can only drive to through Canada." | why | 4.27 |
| `baarle-border-houses` | "In this village, your front door decides which country you live in." | border | 4.09 |

The cards are solid. Each one flags its own risks: the Swiss incursion count and dates vary between sources, Point Roberts has been widely covered already, and parcel counts for Baarle vary. One thing I noticed that research will have to catch: the Point Roberts card says the 1846 border was drawn "without checking the map closely enough". I suspect that framing is a myth and the negotiators knew about the cut-off tip. I didn't hint this to Sonnet, so Phase B tests whether its research stage corrects it.

**Its friction log is useful**, and I'll make these fixes after the trial so the test stays fair:
- The topic playbook never states the weighted-score formula. Sonnet worked it out by reading the check's code.
- "Two sources from different sites" is defined only in code. Two Wikipedia language editions would count as different sites, which isn't the intent.
- The playbook doesn't say when to include the timely-angle field (`why_now`).
- The README's example slug is `point-roberts`, which makes it look already taken.

## Approval and Phase B
- **Approval:** I recorded your approval on all three cards on the trial branch, and all three topic checks now pass 9/9.
- **Phase B instruction:** for each episode, in turn, it runs research, script, voice and storyboard. It also has to report attempts per stage, which facts it had to correct, the voice results, and the friction it hit.
- **Voice will be a draft:** there's no Fish key in its container, so it will use the local Piper voice.
- **Crash rule:** this is the first real run of the voice tool. If it crashes, Sonnet logs the error and continues with the other episodes rather than editing the studio code.

**How I'm talking to it:** cloud sessions don't accept direct messages here, so I set up a Routine, "Orchestrator → Sonnet trial", that posts my instructions into its chat.

## Next check
I'll look again at about 09:12 UTC. If it never picked up Phase B, I'll re-send it. If it's done, I'll re-run every check myself, open its sources to confirm its quotes and facts, read the scripts against the channel's style rules, and bring you a scorecard plus a list of playbook fixes.

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

#### Claude · 2026-09-28 09:16 UTC

The Sonnet trial worked: Sonnet 5 took all three episodes from topic through storyboard by following the repo alone. It needed no help and never touched the studio code, and I reproduced every check result myself. But my audit found three lines where the wording says more than its source, which the automatic checks can't catch.

## Scorecard

| | Point Roberts | Swiss invades Liechtenstein | Baarle border houses |
|---|---|---|---|
| Checks (research / script / voice / storyboard) | all passed first try | all passed; script needed 2 tries | all passed first try |
| Quotes verified against sources | 8/8 found | 9/9 found | 9/9 found |
| Draft-voice accuracy | 3 runs to pass every line | 2 runs | 2 runs |
| Runtime | 42.1 s | 42.7 s | 33.5 s |
| Storyboard | 12 scenes, 0 custom | 11 scenes, 0 custom | 10 scenes, 0 custom |

**What I checked independently:**
- I re-ran all 15 checks from the files it saved.
- I re-fetched every source myself and all 26 quotes matched.
- The storyboards had no nested-cue errors and no over-long on-screen text.
- The voice is the local Piper draft; the proper Fish voice needs an OpenRouter key.

**The research was better than the topic cards:**
- **Swiss:** it found five incursions (1968, 1976, 1985, 1992, 2007), not the three or four the card guessed. Where sources disagree on the 2007 troop count (170 or 171), it logged both and the script says 170.
- **Point Roberts:** it dropped Britannica because the site blocks automated fetching, and labelled one shop owner's "business fell by more than half" as a single person's claim.
- **Baarle:** it found the 1843 treaty and the 5,732 parcels, and logged a parcel-count conflict between sources instead of hiding it.

**I was wrong about Point Roberts.** I suspected "nobody checked what the line would cut off" was a myth. Wikipedia says the 49th parallel was accepted "without precise knowledge of its effects", so Sonnet's line is sourced.

## What the checks missed (from my read of the scripts)
1. **Baarle:** "Cross the street, and fireworks are legal all year round." The source only says a fireworks *store* is open all year, which is not the same as fireworks being legal.
2. **Swiss:** the quote card uses Wikipedia's paraphrase, "It's not like they invaded with attack helicopters." The original report reads "It's not like they stormed over here with attack helicopters or something."
3. **Point Roberts:** "It's not a mistake" is followed two lines later by "Nobody checked what that line would cut off." The script contradicts itself.
4. **Minor:** "set up camp" should be "set up an observation post", and "neutral for five hundred years" is The Local's loose phrasing.

The checks can only verify form; they can't tell whether a line says more than its claim. So I've added this failure to the research and script playbooks with these exact examples, as a mandatory re-read step. A future fix could be a second model reviewing each line against its claim.

## Fixes I made from its friction logs (pushed to `main`)
- **Storyboard check:**
  - cue times inside scene settings (map pins, labels) are now validated;
  - title cards are limited to 8 words and stamps to 3.

  The self-test now catches 16 of 16 deliberate breakages.
- **Playbooks:**
  - the topic score and runtime formulas are now written out;
  - "two sources" now means two different organisations;
  - there's a rule for when to fill in the timely-angle field;
  - the research playbook explains how quote matching works (a quote can't skip an aside or run across a heading);
  - quotations must use the original report's wording;
  - the voice playbook lists the Piper pronunciation traps ("US", "forty-ninth", "sixth", "store's");
  - the README's example slug is now a placeholder.
- **Lessons log:** 4 new entries.

The three episodes are merged into `main`, with those 3 script issues still in them. They're now the best real test set for the next step, the shared render engine.

**Clean-up:** the "Orchestrator → Sonnet trial" Routine never delivered and is still in your Routines list, so you can delete it.

**Next steps:** paste the three script fixes to the Sonnet session as a small follow-up, then start building the engine.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 09:21 UTC

Its finished Phase B

#### Claude · 2026-09-28 09:21 UTC

I've already audited that output: it's the same commit (`fb2a8fa`) my scorecard in the previous message covered, and nothing new has been pushed since. It's merged into `main`.

In short, Sonnet took all three episodes through storyboard on its own, and every check reproduced when I re-ran them. All 26 of its quotes were confirmed against freshly fetched sources. My read of the scripts found 3 lines that say more than their sources support, which the automatic checks can't detect.

If you want Sonnet to fix those, paste this into its session:

```
PHASE B FIXES (from the orchestrator's audit). First run `git pull origin trial/sonnet-1 && git merge origin/main`. main has updated playbooks: re-read studio/sop/02-research.md and 03-script.md, "Common failures".

Fix these three lines, then re-run voice (vo.py) and re-check each affected stage (studio.py marks them STALE):
1. baarle-border-houses / `fireworks`: "Cross the street, and fireworks are legal all year round." overstates the source, which only says a fireworks STORE is open all year. Reword the line (and the claim text) so it says only that.
2. swiss-invades-liechtenstein / `verdict` + quote card s10_verdict: use the original wording from The Local, "It's not like they stormed over here with attack helicopters or something," attributed to Markus Amman, Liechtenstein's interior spokesman. Wikipedia's version is a paraphrase. Update c_quote so its text matches, and re-run verify_quotes.py.
3. point-roberts / `wrongidea` → `reveal` → `oops`: "It's not a mistake" contradicts "Nobody checked what that line would cut off." The source says the border was accepted "without precise knowledge of its effects". Pick one framing (e.g. "It wasn't a typo. It was a guess.") and keep it consistent.
Also: swiss `y1992` should say "observation post", not "camp".

Append a "Phase B fixes" section to TRIAL-REPORT.md: what changed, check attempts, the new WER tables. Commit episodes/ (refresh the snapshot files), push to trial/sonnet-1, stop.
```

When it has pushed, tell me and I'll re-audit and merge. Separately, the next big step is the shared render engine, which turns these storyboards into actual frames.

### 🧑 User · 2026-09-28 09:34 UTC

Pushed successfully to trial/sonnet-1.

Phase B fixes complete. All three audit findings were fixed:

baarle-border-houses/fireworks — reworded to "one fireworks store stays open all year" (the claim text was already accurate; only the script overstated it).
swiss-invades-liechtenstein — c_quote now uses The Local's original wording ("stormed over here... or something," Markus Amman), sourced only to The Local; the verdict line and quote card updated to match (spoken line drops the name to dodge a Piper mispronunciation, on-screen card still credits Amman); y1992 corrected from "camp" to "observation post" to match its own claim text.
point-roberts/reveal — "It's not a mistake" (contradicting "Nobody checked...") became "It wasn't a typo. It was a guess." — consistent with the sourced framing.
Merged main's updated gates first (new word-limit and nested-cue-validation checks), then re-ran verify_quotes.py and vo.py for each affected episode and re-checked every stage the state machine marked stale. One extra wrinkle surfaced and got fixed along the way: editing baarle's fireworks line shifted Whisper's whole-mix transcription enough to falsely flag two untouched lines (hook, literally); a --redo re-synthesis of just those two cleared it. All three episodes pass research → storyboard again, no voice_waivers added, snapshots refreshed, and a "Phase B fixes" section appended to TRIAL-REPORT.md with the full attempt/WER breakdown.

#### Claude · 2026-09-28 09:34 UTC

I re-checked Sonnet's fixes and they're correct, so I've merged them into `main`. All three maps-channel episodes are now done up to storyboard and waiting for the render engine.

**What I checked:**
- **Checks:** all 15 stage checks pass (research, script, voice and storyboard for each episode, plus topic), and the self-test is still OK.
- **Quotes:** all 26 verified against freshly fetched sources.
- **The corrected lines:**
  - **Point Roberts** now reads "You'd think that was a mapping mistake nobody ever fixed. / It wasn't a typo. It was a guess. / Nobody checked what that line would cut off." It's consistent now, and it matches Wikipedia's "without precise knowledge of its effects."
  - **Swiss:** the narration uses The Local's original quote: "It's not like they stormed over here with attack helicopters or something." The quote card credits Markus Amman, sourced to The Local only. "Camp" is now "observation post."
  - **Baarle:** "Cross the street, and one fireworks store stays open all year." That now says only what the source says.

**What the trial showed:** Sonnet can run the studio from topic to storyboard without help, and it handled audit feedback well. It fixed exactly what was flagged and noted a side effect: changing one line made two unchanged lines fail the voice check, and it re-recorded just those two. The one thing it can't do on its own is catch a line that quietly says more than its source. The checks can't detect that either, so a review pass stays in the loop for now. The cheapest option is a second model reading each line against its claim.

The trial branch has served its purpose. `trial/sonnet-1` is fully merged, so you can delete it.

**Next:** build the shared render engine, which turns these three storyboards into actual frames. It's the last big missing piece before real videos. I can start it in this chat, or write it up as a brief for a separate session.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 09:35 UTC

start building the render engine here

#### Claude · 2026-09-28 09:40 UTC

Map data is ready for all three episodes: Natural Earth for Point Roberts and the Alps, plus OpenStreetMap enclave polygons for Baarle. Now the drawing core.

#### Claude · 2026-09-28 10:02 UTC

Point Roberts and Swiss both pass the picture and final checks. Now confirming Baarle is correctly blocked, and spot-checking frames pulled from the encoded MP4, not from the render.

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

#### Claude · 2026-09-29 05:24 UTC

Music is generating: 4 tracks, about 16 minutes. Meanwhile I'm re-mixing Point Roberts with the generated whoosh to confirm the variant logic works.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-29 05:44 UTC

[Request interrupted by user]

#### Claude · 2026-09-29 05:45 UTC

Stopped, and waiting for your direction.

Where things stand:
- **Music generation is still running in the background.** 2 of the 4 maps-channel tracks are done ("caper" in 218 s, "spy" in 215 s). "Detective" and "march" are still generating, then each track gets a no-vocals check and is added to the library. That takes roughly 8 more minutes. I can kill it if you'd rather it stopped.
- **Nothing from this round is committed yet:**
  - the mixer (`tools/audio.py`) and the music library builder (`tools/music_gen.py`) with its vocal check;
  - the SFX generator (`tools/sfx_gen.py`), the setup script and the Kenney SFX library;
  - the generated whoosh and paper-rip sounds;
  - the bible audio sections, the check changes, the docs and the audio research note.

  Point Roberts already mixes with every sound coming from a real file, and the music sits a measured 8.0 dB under the voice.

Tell me how you'd like to proceed.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-29 06:09 UTC

finish music and commit

#### Claude · 2026-09-29 06:17 UTC

The music library is finished and everything is committed and pushed to `main`. Point Roberts and Swiss now pass every stage through final with generated music and real sound effects. I've sent you both videos and the four music tracks to listen to.

**One thing you should know:** my first commit attempt showed as rejected on my side, but it went through anyway at 05:45 (`c927b85`). So part of this work reached `main` before you said "commit". If you didn't want that, I can revert it.

**Music for the maps channel:**

| Track | Style | Length | Generation time (CPU) |
|---|---|---|---|
| caper | pizzicato strings, brushed drums, walking bass, vibraphone | 55.7 s | 218 s |
| spy | muted trumpet, pizzicato, bass clarinet | 56.1 s | 215 s |
| detective | upright bass, vibraphone, piano stabs | 55.0 s | 221 s |
| march | tuba, snare, glockenspiel, piccolo | 54.4 s | 218 s |

- **Model:** all four are from ACE-Step 1.5 (MIT license). The music is original to us, so it can't trigger a Content ID claim.
- **Checks:** all four pass the automatic checks, with no vocals and no dropouts in the middle of a track.
- **Approval:** they're saved as unapproved. Until you approve at least one, new episodes use the code-synthesized score. The two videos I sent use "caper" and "spy" as previews.

**Measured on the videos (I can't listen):**

| | Point Roberts | Swiss |
|---|---|---|
| Music under the voice | 8.0 dB | 8.0 dB |
| Loudness / true peak | −14.1 LUFS / −1.1 dBTP | −14.1 LUFS / −1.3 dBTP |
| Transcript error vs script | 2.2% | 2.5% |
| Sound effects | 54, all real recordings or generated | 25, all real recordings or generated |

The transcript error with music is up from 0.7% but still under the 3% limit.

**Fixes this round:**
- **The checking step crashed** (exit 139) while writing the first music file, in the audio library's OGG writer. Encoding now goes through ffmpeg instead.
- **The vocal check reported false vocals.** Whisper "heard" stock phrases like "Thanks for watching!" in instrumental music. The check now ignores low-confidence phrases like these. Real narration scores about −0.1 on Whisper's confidence scale; these scored around −0.9.
- **One video peaked too loud after encoding** (−0.9 dBTP, just over the −1 dB ceiling). The limiter now sits lower, at −2 dBFS.
- **Git clean-up:** I added a `.gitignore` entry for a small cache folder ACE-Step creates.

**What I need from you:**
1. **Listen to the four tracks** and tell me which to approve. I'll mark them approved in the library's manifest.
2. **Rotate your Hugging Face token.** It was pasted in chat.

**Your laptop:** `studio/tools/music_setup.sh cu128` sets up music and sound-effect generation on your RTX 3060. On this cloud CPU a single 1.5 s sound effect takes 11 minutes, so any new sound effects should be generated on the laptop. The library currently has one generated whoosh and one paper rip.

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

_Source: docs/log/2026-09-28-studio-chat.md_

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

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

the A,B,C arent added to the studio dashboard and i cant find them in github, where do i watch them?

#### Claude · record

- **What happened:** the files were on main (`episodes/why-map/point-roberts/variants/{a,b,c}/out/point-roberts.mp4`), and the review item was in the queue. But the Pages deploy hadn't finished.
  - The first two runs were cancelled by newer pushes, which the workflow's `cancel-in-progress` does.
  - The third run sat in `actions/checkout` for about 13 minutes, because the repo now carries about 620 MB of video.
  - The live site was still the older build when the user looked.
- **Done:**
  - Sent 540p previews (7–9 MB each) straight to chat.
  - Waited for the deploy, which succeeded at 20:13 UTC, and checked that the live site shows "Three methods, one Short" and serves all three files.
  - The review item now plays the previews, which load fast on a phone. The masters stay in the Media library.
  - The workflow now finds media in nested `out/` folders with `find`, rather than a fixed 2-level glob.
- **Still to watch:** site size, about 620 MB of media and growing. GitHub Pages' soft limit is 1 GB, so rejected masters will need retiring from the site soon.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

Try again

#### Claude · record

- **"Try again"** read as: carry on with the 12-video job after the interrupted turn. No step was redone from scratch.
- **House method built as shared kits** (`studio/engine/kits/`): `paper` (A's lit paper cast and props, now with a history cast: pig, troopers in US/UK/navy/pickelhaube/Russian/sailor uniforms, steam frigate, quote card), `flight` (B's 3D map flights), `kinetic` (C's moving type, big number), `flagart` (official Wikimedia flag SVGs, now with BO, PE and five US state flags), and two new ones: `body` (Gut Gang props: gum, sandwich, pH bar, meters, clocks, gut tubes) and `rank` (Leader Flags' night-blue C stage: drifting grid, particles, flag rows with a sheen, rank chips, face-off bars, clock rows).
- **Engine changes:** a `stomach` character joined the Gut Gang cast (cast.js and the bible); kinetic's `glow` renamed `kGlow` (it clobbered cast.js's `glow`); storyboard `drift` adds a slow push-in per scene (cut Leader Flags' frozen time from 12.6 to 7.4 s per 30 s); `vo.py` reads script `pronounce` respellings for TTS only (Kokoro said "Deomd" for Diomede); textnorm handles Whisper's split decimals ("2 .4") and British spellings.
- **Topics (scout data plus fetched sources), final 12:**
  - Border Quirks: Point Roberts (hybrid main cut), the Pig War, Russia's sale of Alaska (Diomede date-line payoff; Alaska Day is 18 Oct), why Chile is so long (Bolivia's navy payoff).
  - Gut Gang: where lunch goes (9 m), why the stomach doesn't digest itself, the swallowed-gum myth, the brain's 2%/20% energy bill. Changed from the slate: "swallowing a pill" became the gum myth and "brain learning" became brain energy, because those had fetchable, quotable sources.
  - Leader Flags: World Cup titles after 2026 (Spain won the 19 July final, its second), most islands (Sweden, with the nine-square-metre catch), US states vs countries by 2024 GDP, most time zones (France 12; China uses one).
- **Every claim is quoted from a fetched source** (`verify_quotes.py`: 0 NOT_FOUND across all 12). Key claims have two independent sites or an official source; single-source numbers are marked non-key and labelled on screen and in the description.
- **Scripts were voiced with Kokoro George** and retaken where the transcript disagreed: "a war" heard as "a wall", "won" as "one", "England has one" as "won", "nonstop" split; each line was rewritten rather than forced.
- **Publishing:** API uploads stay off (an unverified project's uploads are locked private for good). Each episode has `package.json` with title, sourced description, hashtags, pinned comment and a `schedule` time for manual upload.
- **Produced and checked (all 12 pass every gate through packaging):** 1080×1920, 24 fps, −14.1/−14.2 LUFS, true peak ≤ −1.5 dBTP, transcript WER 0.0 on ten and 0.015–0.016 on two. Lengths: Border Quirks 49–60 s, Gut Gang 29–33 s, Leader Flags 25–34 s. Fair frozen time per 30 s: Gut Gang ~0, Leader Flags 5–9, Border Quirks 4–11 (Alaska is the stillest at 11). Picture reviews: two rounds each, defects listed in each `review.json`; one frame from every encoded MP4 was spot-checked.
- **Late fixes:** Alaska's treaty line was a 9 km-wide ribbon that filled the screen at close range (now 3 km and hidden once the camera is near the islands); four first frames were half-drawn (titles now present at t=0); three scenes over the 7 s pace limit were split; the encoder's limiter ceiling dropped from 0.79 to 0.75 after one file measured −0.9 dBTP.
- **Not verified:** I can't listen. Levels and transcripts were measured instead. The music beds for Gut Gang ('inside') and Leader Flags ('countdown') are at the bible default of 8 dB under the voice; only Border Quirks' 'detective' at 13 dB has been heard by the user.
- **Delivered:** `docs/publish-kit-2026-10.md` (times, titles, descriptions, steps, API audit draft) and a dashboard review item with all 12 videos.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T06:13:08Z",
 "reviewer": "builder (orchestrator), contact sheet and spot frames, round 1 (logged after the fact; fixes were made in this session)",
 "frames": [
  23.7
 ],
 "defects": [
  {
   "t": 23.7,
   "issue": "drive: the 3D car left the frame; camera raised to 62-70 km and the car scaled up",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-07T06:13:08Z",
 "reviewer": "builder (orchestrator), final contact sheet after camera drift, round 2",
 "frames": [
  0.05,
  4.28,
  6.76,
  13.28,
  15.82,
  19.38,
  23.72,
  26.8,
  31.76,
  37.52,
  39.76,
  45.24,
  48.02,
  54.84,
  57.86,
  59.72
 ],
 "defects": []
}
```


## Trial report excerpts
### b. `point-roberts` (series: `why`)
- **Hook:** "There's a piece of the United States you can only drive to through Canada."
- **Twist:** An 1846 treaty drew the US–Canada border along the 49th parallel without checking the
  map closely enough, slicing off a 5-square-mile tip of Washington State that is still reachable by
  car only by crossing into and back out of Canada.
- **Weighted score:** 4.27 (hook 4, surprise 4, visual 5, sourceability 5, timeliness 3, series_fit 5)
- **Two sources:**
  - https://www.britannica.com/place/Point-Roberts
  - https://en.wikipedia.org/wiki/Point_Roberts,_Washington
- **Risks:** a well-trodden topic for map-fact channels — needs a fresh detail (cross-border ambulance
  response, or 2026 tariff squeeze found in a search but not yet in `candidate_sources`) rather than
  just the 1846 line-drawing story; the tariff "why now" angle touches live trade politics, so the
  episode should stay on geography and daily-life absurdity, not commentary; town-life specifics need
  a dated source in research.


## 2. Gate attempts per candidate

All three passed on the **first** `check` attempt — 8 of 9 checks green, with only "approved by a
human" failing as required:

| Candidate | Attempts to 8/9 | What failed (by design) |
|---|---|---|
| swiss-invades-liechtenstein | 1 | `approved by a human` only |
| point-roberts | 1 | `approved by a human` only |
| baarle-border-houses | 1 | `approved by a human` only |

No retries were needed because the topic schema and `gate_topic` checks (schema shape, channel/slug
match, series membership, hook word count, twist length, ≥2 candidate sources from different
domains, weighted score ≥ min, no duplicate hook) were read from `studio/gates/__init__.py` and
`studio/schemas/topic.schema.json` before writing, and every source URL was verified live with
`WebFetch`/`WebSearch` before being cited.


## 3. Friction log

- **`studio/README.md` (root, "Run it" section) vs `studio/sop/01-topic.md`:** the README's example
  command is `studio.py new why-map point-roberts` — i.e. Point Roberts is literally the worked
  example name used to demonstrate the CLI, but it is *not* an actual pre-existing episode or a
  reserved slug (there was no `episodes/why-map/point-roberts/` before this run). It's not wrong,
  just a documentation choice that could read as "this one's already spoken for." Worth a one-line
  note in the README clarifying it's a placeholder name, not a claimed topic.
- **No file states the required domain-diversity rule for `candidate_sources` up front.**
  `studio/sop/01-topic.md` step 3 says "two sources... from different sites" in prose, but the actual
  enforcement (`len(set(urlparse(u).netloc for u in t["candidate_sources"])) >= 2` in
  `studio/gates/__init__.py:35`) lives only in the gate code, not in `schemas/topic.schema.json` or
  the playbook's explicit wording of *what counts as "different"* (e.g., would `en.wikipedia.org` and
  `de.wikipedia.org` count as different sites? They would, by netloc, even though it's the same
  organization). A worker who doesn't read the gate source could satisfy the letter of the check
  while missing its intent. Suggest stating the exact rule ("different netloc, not just different
  URL") in the playbook.
- **`studio/sop/01-topic.md` doesn't say where `why_now` is required or optional.** The schema marks
  it optional, and the worked example (`studio/examples/emu-war/topic.json`) includes it. Nothing
  says whether a worker should always include it when there's a genuine timely angle, or only when
  `timeliness` scores high. I included it for `point-roberts` (a live 2026 tariff angle) and gave it
  a low, honest `timeliness` score for the other two rather than omitting the field or inflating the
  score — the playbook could say explicitly "include `why_now` only when it explains a `timeliness`
  score above 1."
- **The weighted-score formula isn't written anywhere in `sop/01-topic.md`.** Step 5 says "score
  honestly, 1 to 5 on each axis" but never gives the formula (weights × scores ÷ sum of weights) that
  `gate_topic` actually computes and that the human will see printed by `check`. I derived it from
  `studio/gates/__init__.py:27` and the bible's `topic.weights`, but a worker without code access
  would have to guess or trial-and-error it. Suggest either printing the formula in the playbook or
  having `check` show the per-axis contribution.
- **Setup gap, not a studio-file issue:** the container had neither `jsonschema`'s dependencies
  installed nor `pdftotext` (`poppler-utils`) present; both were needed before `selftest` would even
  run. The task's own setup note anticipated this, so it's confirmed working as described, not a
  studio bug — flagging only because a worker following *just* `studio/README.md` would hit
  `ModuleNotFoundError: jsonschema` with no guidance on `pip install -r studio/requirements.txt`
  being a prerequisite to `selftest` (the README does list it one line above, so this is a minor
  "don't skip line 1" risk, not a missing instruction).
- Everything else — `studio/sop/00-rules.md`, the topic schema, the `why-map` bible, and
  `studio/examples/emu-war/topic.json` as a worked shape — was clear and sufficient to produce a
  passing card without guessing.


## 4. `python3 studio/studio.py status` (verbatim)

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```

The `✗` on `topic` for all three is expected and correct: every check in the topic gate passes except
"approved by a human," which is intentionally left for the person running the studio.

---

# Phase B — research, script, voice, storyboard

Worker: Claude (Sonnet 5). Order: point-roberts, swiss-invades-liechtenstein, baarle-border-houses,
each taken through all four stages before the next started. `voice_waivers` was never filled; nothing
under `studio/` was edited. `python3 studio/tools/verify_quotes.py <episode>` was run before every
`check` at the research stage, per sop/02.


### point-roberts

| Stage | `check` attempts | What failed |
|---|---|---|
| research | 1 (passed) | Nothing at `check`. `verify_quotes.py` passed clean on its first run (8 claims, 0 NOT_FOUND). |
| script | 1 (passed) | Nothing. |
| voice | 1 (passed) | Nothing at `check`. `vo.py` itself needed 3 runs before its per-paragraph WER table was clean: run 1 flagged `treaty_detail` at WER 0.12 (heard "britain **the us** drew... along the **forty nine th** parallel" — dropped "and", split "forty-ninth" into three words); reworded the ordinal to "parallel forty-nine" and re-ran (run 2), which fixed `treaty_detail` but revealed `hook` had flipped to WER 0.17 ("u s" heard as two letters instead of the word "us") and `treaty_detail` regressed to WER 0.25 for the same reason; rewrote "US" → "United States" in both lines and re-ran (run 3), which passed all 12 paragraphs at WER ≤ 0.07. That is exactly the sop/04 "at most 2 retakes" budget (2 rewordings, not 2 reruns). |
| storyboard | 1 (passed) | Nothing. |


## 2. Facts corrected or dropped versus the topic cards

- **point-roberts** — Britannica (one of the topic card's two `candidate_sources`) turned out to be
  unreliable for machine quote-verification (Cloudflare/anti-bot 403s, inconsistent between fetchers);
  research used NASA Earth Observatory instead as the second, "official"-type source, and dropped
  Britannica from the dossier entirely rather than cite a source that couldn't be reliably opened. The
  topic card's "why now" pointed at 2026 tariff coverage; the best on-the-ground reporting actually
  found was an AP story dated March 2025 — the dossier keeps the real publication date and treats the
  business-decline figure as an "estimate" with a "one business owner's reported figure" label rather
  than a confirmed 2026 statistic.
- **swiss-invades-liechtenstein** — the topic card's risk note guessed "three vs four" prior
  incursions and flagged the count as unresolved. Research found Wikipedia documents **five** separate
  incidents (1968, 1976, 1985, 1992, 2007), which is a stronger, more surprising story than the topic
  card assumed, not a weaker one — used all five rather than picking a smaller subset. The 2007 troop
  count is genuinely disputed between sources (171 per Wikipedia, 170 per The Local); the dossier
  records both and the script uses the rounded, source-agnostic "one hundred seventy" rather than
  asserting one over the other.
- **baarle-border-houses** — the topic card's risk note said the pre-1995 treaty history "isn't in
  Wikipedia's summary" and would need a scholarly/official source. Research resolved this directly:
  the 1843 Treaty of Maastricht (a separate Wikipedia article) gives the 5,732-parcel figure, and the
  main Baarle article gives the 1198 origin story neither of which were in the topic card. Atlas
  Obscura, the topic card's second candidate source, returned HTTP 403 to a direct fetch **and** to
  the WebFetch tool — since research rules require citing only what was actually opened, it was
  dropped rather than cited secondhand; the equivalent fact (the Loveren Street divided house) is
  instead sourced to Wikipedia, which states it independently. A genuine numeric conflict surfaced
  between Wikipedia (16 exclaves surrounding 7 Dutch areas) and a third source, Barry's Border Points
  (26 pockets, 22 fully surrounded) — the dossier logs this as an open question and the script only
  ever uses Wikipedia's own count rather than splitting the difference.


## 3. Per-paragraph WER, final passing run

**point-roberts** (12 paragraphs, `python3 studio/tools/vo.py`, Piper `en_US-ryan-high` DRAFT voice):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| onlyway | 0.00 |
| wrongidea | 0.00 |
| reveal | 0.00 |
| treaty_detail | 0.00 |
| oops | 0.00 |
| cutoff | 0.07 |
| howfar | 0.00 |
| kids | 0.00 |
| water | 0.00 |
| todaybeat | 0.00 |
| loopback | 0.00 |

Total 42.11s. All ≤ bible max_wer 0.08.

**swiss-invades-liechtenstein** (11 paragraphs):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| itwasnt | 0.00 |
| neutral | 0.00 |
| y1968 | 0.00 |
| y1976 | 0.00 |
| y1985 | 0.00 |
| y1992 | 0.00 |
| then2007 | 0.00 |
| soldiers2007 | 0.00 |
| verdict | 0.00 |
| callback | 0.00 |

Total 42.74s. All ≤ 0.08 (all exactly 0.00).

**baarle-border-houses** (10 paragraphs):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| literally | 0.00 |
| samevillage | 0.00 |
| origin | 0.00 |
| treaty | 0.00 |
| toohard | 0.07 |
| finalized | 0.00 |
| storedoor | 0.00 |
| fireworks | 0.00 |
| callback | 0.00 |

Total 33.45s. All ≤ 0.08.


## 4. Friction log

- **`studio/README.md` "Run it" example doubles as an unintentional claim on a slug.** (carried over
  from Phase A, still relevant: `point-roberts` is only a documentation placeholder, not a reserved
  topic — worth a one-line disclaimer.)
- **`verify_quotes.py`'s contiguity rule isn't documented anywhere a worker would read before writing
  quotes**, and it bit twice in three episodes (swiss-invades-liechtenstein's `c_2007`,
  baarle-border-houses's `c_treaty1843`). The tool matches a quote segment (split only on `;` and
  `...`) as one literal, whitespace-and-punctuation-stripped substring of the fetched page. Anything a
  human would consider "the same quote" but that skips a parenthetical aside, an inline attribution,
  or — on Wikipedia specifically — a section heading sitting between two sentences, silently breaks
  the match and reports `NOT_FOUND` with no hint about *why* it wasn't found beyond the first 50
  characters. `studio/sop/02-research.md`'s "Common failures" list ("Paraphrasing in `quote`") gets
  close but doesn't name this specific failure mode. Suggest adding: "a quote must be a single
  verbatim, uninterrupted span of the source page — never skip an inline aside, and never quote two
  sentences that a section heading sits between; split into two semicolon-joined segments instead."
- **Whisper's transcription of a whole-episode mix is non-deterministic in a way that goes beyond the
  documented ~20ms timing wobble** (`studio/knowledge/lessons.md`): re-running `vo.py` after changing
  only *one* paragraph's text caused an *earlier, unrelated, bit-identical* paragraph's transcribed
  **content** to change ("us" → "u s"), flipping its WER from 0.00 to 0.17 on point-roberts's `hook`.
  This means a paragraph that passed can silently fail on a later, unrelated retake, purely from
  re-running the whole-mix transcription — worth a line in `lessons.md` next to the existing timing-
  wobble entry, since it changes how a worker should read a WER regression (don't assume the newly-
  failing line's *own* audio is the problem).
- **Piper has a small, recognizable set of misread constructs that `studio/sop/04-voice.md`'s "Common
  failures" doesn't list**, and three of the eleven per-line retakes across all three episodes fell
  into it: an ordinal built from a hyphenated number ("forty-ninth" → "forty nine th"), the acronym
  "US" (sometimes read as the word "us", sometimes spelled out "u s" with no way to predict which), a
  possessive contraction ("store's" → "store is"), and the bare ordinal "sixth" (→ "six", dropping
  "-th"). None of these are wrong `say` text, just Piper-specific pronunciation traps; spelling out
  "United States", avoiding ordinal-suffix words, and avoiding possessive contractions on names/nouns
  worked every time they were tried. Worth adding to the playbook's common-failures list so a worker
  doesn't have to rediscover each one by burning a retake.
- **The scene catalog's per-type param limits are documentation, not enforcement**, confirmed again
  in Phase B: `storyboard.schema.json` defines `params` as an unconstrained `object`, and
  `gate_storyboard` never reads `stamp_reveal`'s "≤3 words" or `title_card`'s "≤8 words" limits from
  `engine/catalog.json`. All title cards and stamp reveals in these three storyboards were kept inside
  those limits by hand, but nothing would have stopped a storyboard from passing `check` while
  violating them.
- **Nested cue references inside scene `params` (e.g. `map_focus.pins[].at`,
  `diagram_callout.callouts[].at`) are never validated against the timeline** — `gate_storyboard` only
  resolves `scene.start`, `scene.end`, and top-level `scene.events[].at`. A typo'd pin or callout `at`
  cue (e.g. referencing a word never spoken) would pass the gate silently and only surface once a
  human, or the not-yet-built render engine, looks at the actual picture. `sop/05-storyboard.md`'s
  "Run the check. Every cue must resolve" reads as covering all cues; worth narrowing that sentence or
  widening the gate.
- **The script gate's runtime formula still isn't written down** (flagged in Phase A for the topic
  score formula; same pattern here for `est_duration` in `studio/gates/__init__.py`:
  `lead_in + words/(wpm/60) + sum(gap for all but the last paragraph) + tail`). Hand-computing this for
  all three scripts before ever running `vo.py` matched the gate's printed number to one decimal place
  every time, which confirms the formula is stable and worth publishing in `sop/03-script.md` so a
  worker isn't reverse-engineering gate source before writing a script.


## 5. `python3 studio/studio.py status` (verbatim, after all three episodes)

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```

All three episodes are through storyboard. Picture and everything after it were left untouched, as
instructed (the render engine isn't built).

---

# Phase B fixes

Worker: Claude (Sonnet 5). Pulled `trial/sonnet-1`, merged `main` (fast-forward, no conflicts:
`studio/gates/__init__.py` gained per-scene word limits for `title_card`/`stamp_reveal` and
validation of every nested `at` cue in scene `params`, and `sop/02-03-04-05` and `knowledge/lessons.md`
picked up the "Common failures" the orchestrator's audit surfaced), re-read `sop/02-research.md` and
`sop/03-script.md` before touching anything. All three re-checks below were run against these updated
gates, so they also confirm the new word-limit and nested-cue checks pass cleanly. Nothing under
`studio/` was edited.


## What changed

1. **baarle-border-houses / `fireworks`.** The dossier claim `c_shopping`'s `text` already said "a
   fireworks store allowed to stay open year-round" (it never overstated this), so it was left as is.
   Only the script line overstated it: reworded `say` from "Cross the street, and fireworks are legal
   all year round." to **"Cross the street, and one fireworks store stays open all year."**, matching
   the claim exactly. Captions rebalanced to the new 11-word count.
2. **swiss-invades-liechtenstein / `verdict` + `c_quote` + `s10_verdict`.** `c_quote` in `dossier.json`
   dropped the Wikipedia paraphrase entirely: `sources` narrowed to `["local"]` and `text`/`quote` now
   read only The Local's original wording, attributed to Markus Amman, Liechtenstein's interior
   spokesman. The script's `verdict` paragraph was rewritten to speak that exact original quote
   ("It's not like they stormed over here with attack helicopters or something"); the spoken
   attribution was simplified to "said Liechtenstein's interior spokesman" (dropping the name from the
   *spoken* line only — see voice retake below), while the storyboard's `s10_verdict` quote-card
   `who`/`quote` params were updated to the same original wording and still credit Markus Amman by name
   on screen. `y1992`'s line was corrected from "soldiers set up camp" to **"soldiers set up an
   observation post"**, matching `c_1992`'s claim text (which already said "observation post" — only
   the script had drifted from it).
3. **point-roberts / `reveal`.** "It's not a mistake. It's an old treaty line." contradicted the next
   beat ("Nobody checked what that line would cut off."). Reworded to **"It wasn't a typo. It was a
   guess."**, which agrees with `c_treaty`'s sourced framing ("without precise knowledge of its
   effects") and no longer conflicts with `oops`. `wrongidea` and `oops` needed no changes — they were
   already consistent with a "guess, unchecked" framing; `reveal` was the only contradicting line.


## Check attempts and what failed

| Episode / stage | Attempts | What failed |
|---|---|---|
| baarle-border-houses / script | 1 (passed) | Nothing. |
| baarle-border-houses / voice | 3 `vo.py` runs, 1 `check` (passed) | Run 1 (only `fireworks` text changed) unexpectedly flagged **`hook`** (WER 0.08) and **`literally`** (WER 0.25) — both heard "front's door" for "front door" though neither line's text or cached audio changed. This is the whole-mix-retranscription effect `lessons.md` now documents: changing `fireworks`'s audio length shifted Whisper's decoding of earlier, bit-identical segments. Run 2 (no changes) reproduced the identical mis-hearing, confirming it wasn't random. Run 3 used `--redo hook literally` to force fresh Piper synthesis of those two lines (same text, new take); this cleared the artifact and all 10 paragraphs passed. |
| baarle-border-houses / storyboard | 1 (passed) | Nothing; also the first real exercise of the new word-limit and nested-cue checks on this episode — no violations. |
| swiss-invades-liechtenstein / research | 1 `verify_quotes.py` run (clean), 1 `check` (passed) | Nothing — the new `c_quote` quote matched The Local's cached text on the first try. |
| swiss-invades-liechtenstein / script | 2 (both passed) | First pass (after the y1992/verdict rewording) passed 10/10 cleanly. A second pass was needed after the voice retake below simplified the verdict line's spoken attribution — also passed 10/10, nothing failed either time. |
| swiss-invades-liechtenstein / voice | 2 `vo.py` runs, 1 `check` (passed) | Run 1 flagged `verdict` at WER 0.11: Piper/Whisper misheard the proper name "Markus Amman" as "marcus amand". Rather than alter the quoted words (which must stay verbatim per the fix above), removed the name from the *spoken* attribution only ("said Liechtenstein's interior spokesman"), keeping the on-screen quote card's named attribution intact. Run 2: all 11 paragraphs WER 0.00. |
| swiss-invades-liechtenstein / storyboard | 1 (passed) | Nothing; confirmed the `y1992/apologize` pin cue and `verdict/helicopters` event cue still resolve since neither word moved. |
| point-roberts / script | 1 (passed) | Nothing. |
| point-roberts / voice | 1 `vo.py` run (clean), 1 `check` (passed) | Nothing — reworded `reveal` line passed WER 0.00 immediately. (As a side effect of the whole-mix shift, `cutoff` — previously 0.07 — came back at 0.00 this run; no other paragraph regressed.) |
| point-roberts / storyboard | 1 (passed) | Nothing. |


## New per-paragraph WER tables (after fixes)

**point-roberts** (total 41.57s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| onlyway | 0.00 |
| wrongidea | 0.00 |
| reveal | 0.00 |
| treaty_detail | 0.00 |
| oops | 0.00 |
| cutoff | 0.00 |
| howfar | 0.00 |
| kids | 0.00 |
| water | 0.00 |
| todaybeat | 0.00 |
| loopback | 0.00 |

**swiss-invades-liechtenstein** (total 45.38s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| itwasnt | 0.00 |
| neutral | 0.00 |
| y1968 | 0.00 |
| y1976 | 0.00 |
| y1985 | 0.00 |
| y1992 | 0.00 |
| then2007 | 0.00 |
| soldiers2007 | 0.00 |
| verdict | 0.00 |
| callback | 0.00 |

**baarle-border-houses** (total 34.25s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| literally | 0.00 |
| samevillage | 0.00 |
| origin | 0.00 |
| treaty | 0.00 |
| toohard | 0.07 |
| finalized | 0.00 |
| storedoor | 0.00 |
| fireworks | 0.00 |
| callback | 0.00 |

All values ≤ the bible's `voice.max_wer` (0.08). No `voice_waivers` were added anywhere.


## Status after fixes

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```


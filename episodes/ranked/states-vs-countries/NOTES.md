# US states vs countries: California beats Japan: discussion and decisions

Folder: `episodes/ranked/states-vs-countries`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

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
  0.05,
  4.76
 ],
 "defects": [
  {
   "t": 0.05,
   "issue": "hook: face-off still springing in on frame 1",
   "fixed": true
  },
  {
   "t": 4.76,
   "issue": "fourth: source line ran off both edges",
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
  2.56,
  4.76,
  10.32,
  16.88,
  18.72,
  20.7,
  23.62,
  27.94,
  31.02,
  32.31
 ],
 "defects": []
}
```

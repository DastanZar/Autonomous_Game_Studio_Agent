# Why doesn't your stomach digest itself?: discussion and decisions

Folder: `episodes/body-cast/stomach-acid`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-29 UTC

go ahead

#### Claude · record

- **References:** fetched thumbnails for 6 Kurzgesagt body Shorts and 2 SolarBalls Shorts (views from yt-dlp lists) and tiled them into a board. It's private in the scratchpad and not committed, because they're other creators' images. PIL isn't installed, so I tiled with ffmpeg; that means no labels on the board, and the captions are in the chat.
- **Body-cast sets:** built 5 original animated sets in `studio/stylelab/sets.js` (bloodstream, neuron night, stomach acid, gut city, spotlight stage). Each was rendered as a still and a 5 s clip; the board is `docs/design/bc_sets_board.png`. The "pH 1.5" label on the stomach set is a sample and not yet sourced.
- **Knowledgia check:** pulled its last 60 Shorts. The top 20 are all historical geopolitics on maps, "Why/How did <country or empire> …", ranging from 2.7M to 10M views (top: "Why wasn't Portugal Conquered by Spain?", 10M).
- **Geopolitics recommendation** (in the chat reply): add a historical-geopolitics series to why-map. It needs a historical-borders dataset, and that dataset's licence hasn't been vetted yet.

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

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

i dont want you to extend it artifically just for the sake of increasing the duration, rethink and rewrite the whole thing to produce the best product possible

#### Claude · record

- **Rewrote all four Gut Gang episodes from new research,** keeping the same topics and slots, so each has a story with a turn instead of a list of facts:
  - Stomach: the snot raincoat, then H. pylori corkscrews through it; doctors blamed stress and spicy food until Barry Marshall drank a beaker of it in July 1984 (named, never drawn: a beaker and a GULP stamp); 2005 Nobel. Sources include the Nobel press release (official), Wikipedia, The Scientist, James Clear.
  - Gum: the myth, what really happens, then the 1998 Pediatrics case report (kids given gum as a reward who swallowed it; a taffy-like lump removed; a toddler's four coins glued into one blob), via Scientific American.
  - Lunch: a relay through the cast (stomach, liver's bile, small intestine's folds, microbes) ending on the corrected size: about 30 m², half a badminton court, not a tennis court (Helander & Fändriks 2014 via Popular Science; Wikipedia).
  - Brain: 2% of weight, 20% of energy, about 12 W (a fifth of a 60 W bulb, Scientific American's estimate); hard thinking barely adds to the bill; so the 10% myth is backwards.
- **New props in the body kit:** beaker with swimming microbes, coins, light bulb, sports courts drawn to scale, chili pepper, fat globule that splits into droplets, flat card.
- **Retakes:** "Hi" was heard as "high", so the line became "Hello".
- **Results:** 47.7, 47.8, 49.3 and 36.5 s; transcript WER 0.0 on all four; −14.1/−14.2 LUFS; frozen time 0–3 s per 30 s; two review rounds each; every gate passes through packaging. Titles and descriptions updated (food and brain retitled); schedule unchanged.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

whats this 540 downgrade? when till now we had a working pipeline of videos and evry update being published there

(then) I also want you to once you finish the renders, set up the channels and other aspects of them, all we have done is name them, we need to put a proper channel picture, description, write proper titles hashtags for all th euploads and whatever else is needed that helps boost a channel and its videos, im not the expert so i want you to go learn, read find what the experts are doing, use your own brain and set up the channels too, for the pciture give me a prompt, i will make them with nano banana and put it myself, everyhtig else you do

(then) I hit my usage limit while you were working, but it has reset now. Please continue from where you left off.

#### Claude · record

- **540p reverted.** My mistake: I counted `docs/site-media.txt` (310 MB) as extra, but it lists the same 12 files that are already copied. The real site is 716 MB at full quality, under the 1 GB Pages limit, once the three full-size Point Roberts method variants are left off (their review previews stay). The dashboard again serves the exact rendered files; the masters release stays as a download page.
- **Verified:** the live dashboard file for the stomach video is 29,809,781 bytes, identical to the render.
- **Channel research:** niche-clear name and description, 3-5 relevant hashtags in the description (never 15+), keyword-first titles, series playlists, a related video and a pinned question on every Short, steady cadence. Risk noted: YouTube's 'inauthentic content' rules target mass-produced TTS channels; our safeguards are original animation and sourced scripts.
- **Applied through the API on all three channels:** description, keywords, default language English, public series playlists (4 + 3 + 2), home shelves (popular uploads plus one per playlist). Read back to confirm. `channel_setup.py sort` will file Shorts into playlists once they're uploaded.
- **Per upload:** search tags, category (Education) and a related video added to every package.json (schema updated; publish.py now sends the tags); the publish kit shows them.
- **Manual for the user:** profile pictures and banners (prompts written for Nano Banana, with sizes and safe areas), sister-channel links, contact email, country, and each Short's related video in Studio.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T07:14:48Z",
 "reviewer": "builder (orchestrator), rewrite contact sheets, round 1",
 "frames": [
  0.05,
  22.0,
  33.0,
  40.4
 ],
 "defects": [
  {
   "t": 0.05,
   "issue": "rewrite: hook title now present on frame 1",
   "fixed": true
  },
  {
   "t": 22.0,
   "issue": "hi: dialog rig cropped the spiral microbe; rebuilt as a custom scene with its own bubble",
   "fixed": true
  },
  {
   "t": 33.0,
   "issue": "drank: the cartoon hand read as a stick; replaced by a GULP stamp and motion lines",
   "fixed": true
  },
  {
   "t": 40.4,
   "issue": "nobel: the year rolled up from 0 (showed 1962); now counts 1984 to 2005 without digit roll",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-07T07:14:48Z",
 "reviewer": "builder (orchestrator), final rewrite sheets and encoded-frame spot check, round 2",
 "frames": [
  0.05,
  3.4,
  5.39,
  11.46,
  15.82,
  19.28,
  23.62,
  28.38,
  33.0,
  36.32,
  40.43,
  47.62,
  47.67
 ],
 "defects": []
}
```

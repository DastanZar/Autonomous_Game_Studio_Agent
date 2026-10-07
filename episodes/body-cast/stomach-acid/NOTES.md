# Why your stomach doesn't digest itself: discussion and decisions

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


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T06:13:08Z",
 "reviewer": "builder (orchestrator), contact sheet and spot frames, round 1 (logged after the fact; fixes were made in this session)",
 "frames": [
  0.05,
  22.5,
  26.0
 ],
 "defects": [
  {
   "t": 0.05,
   "issue": "hook: first frame had no title",
   "fixed": true
  },
  {
   "t": 22.5,
   "issue": "lining: cells sat in the caption zone; labels too small",
   "fixed": true
  },
  {
   "t": 26.0,
   "issue": "raincoat covered the stomach's face",
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
  4.06,
  5.78,
  9.22,
  12.49,
  18.12,
  23.08,
  26.06,
  28.54,
  30.27,
  33.22
 ],
 "defects": []
}
```

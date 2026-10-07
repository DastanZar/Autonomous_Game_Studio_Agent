# Does swallowed gum really stay in you for 7 years?: discussion and decisions

Folder: `episodes/body-cast/swallowed-gum`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

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


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T07:14:48Z",
 "reviewer": "builder (orchestrator), rewrite contact sheets, round 1",
 "frames": [
  5.56,
  34.2
 ],
 "defects": [
  {
   "t": 5.56,
   "issue": "unit: speech bubble collided with the stomach's head; shortened",
   "fixed": true
  },
  {
   "t": 34.2,
   "issue": "reward: swallowed gum piled on the stomach's face; moved to its belly",
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
  3.98,
  5.56,
  13.54,
  18.34,
  20.35,
  27.22,
  28.56,
  34.18,
  38.58,
  41.0,
  47.74,
  47.79
 ],
 "defects": []
}
```

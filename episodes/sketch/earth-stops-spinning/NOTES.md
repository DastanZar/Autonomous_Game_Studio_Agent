# What would actually happen if the Earth stopped spinning?: discussion and decisions

Folder: `episodes/sketch/earth-stops-spinning`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

approved, go ahead, also while youre at it, spin up multiple workers making the next 4 videos backed on research for the first 3 channels as well, and also come up with the ntire content plan for the month, completely backed by research, you know how we work by now

#### Claude · record (later the same day)

- **Rate limit:** all four workers stopped at the session usage limit (reset 20:00 UTC). Each was resumed from its own saved progress; nothing was lost.
- **Month plan delivered** (`docs/content-plan-2026-10-21_to_11-20.md`):
  - 48 slots for the three live channels plus 8 for the drawn channel, each with hook, evidence and two candidate sources;
  - cadence 4 per week (Metricool's study of 799,718 videos: 2–4 per week is optimal per Short);
  - the drawn channel launches 29 Oct with "the Earth stopped spinning" (6.06M median views on that topic);
  - name options for the user, with Scratch Paper recommended;
  - measurement reviews on 27 Oct and 10 Nov.
- **Overlaps:** the strategist removed overlaps with the workers' topics.
- **Not available to it:** TikTok, Instagram and Google Trends could not be queried directly.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

Make sure to include the pencil ones also part of the montly plan and it having 4 videos ready to go as well
Also research about another 5th niche for a 5th channel, something totally different to what we have till now, but that pushes the boundaries of what were doing, something absolutely mesmerizing and a views magnet

#### Claude · record

- **Month plan:** it already includes the drawn channel (8 slots from the 29 Oct launch). Uncommitted worker files were committed as a WIP backup (9004d73).
- **New worker, drawn channel's first 4 videos** (photoreal hand, pace 1.2, longer gaps, no scratch sound):
  - Earth stops spinning, 29 Oct (launch);
  - quicksand, 31 Oct;
  - hole through the Earth, 3 Nov;
  - Mars without a suit, 5 Nov.
- **New strategist, fifth-channel niche:** web plus API data (the API is probably out of quota until about 07:00 UTC). Deliverable: `docs/research/fifth-channel-2026-10.md` with the top 3 options ranked.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-08 UTC

Try again

#### Claude · record

- **Pencil pilot, arm fix:** re-rendered and live on the dashboard. The live file matches the render (50,485,010 bytes). Review rounds 8 and 9 logged; all gates pass.
- **Usage limit:** all four workers had stopped at the weekly usage limit (reset 05:00 UTC). Their progress was backed up (38a3040) and each was resumed.
- **Progress when resumed:**
  - Border Quirks: 1 of 4 through storyboard, 3 through script.
  - Gut Gang: contagious-yawn through picture; cold-feet through storyboard; 2 through voice.
  - Leader Flags: 2 through storyboard, 1 through script, most-pumpkins through topic only.
  - Pencil channel: earth-stops-spinning in progress, plus 3 started.
- Told the workers to be economical with usage.

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-08 UTC

I hit my usage limit while you were working, but it has reset now. Please continue from where you left off.

#### Claude · record

- **Gut Gang next 4 finished** and checked by me: all gates through packaging; encoded frames spot-checked; added to the dashboard review queue (`next-gut-gang`).
  - "Why is yawning contagious?" (21 Oct), "Do cold feet give you a cold?" (22 Oct), "Why does sunlight make you sneeze?" (27 Oct), "He lived in a cave with no clocks…" (28 Oct).
  - 45–53 s, −14.1/−14.2 LUFS, WER 0.
- **Session limit again:** the other three workers had stopped at the session limit (reset 10:00 UTC). Backed up (fff2319) and resumed.
- **Progress at resume:**
  - Border Quirks: Pheasant Island done; the Statue of Liberty's final gate failing; 2 through storyboard.
  - Leader Flags: 3 through package; pumpkins through storyboard.
  - Pencil channel: Earth-stops-spinning done; quicksand's final gate failing; hole through picture; Mars through script.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-08T05:13:14Z",
 "reviewer": "sketch worker (model with vision), contact sheet + 2 full-res frames, round 1",
 "frames": [
  0.05,
  6.34,
  11.1,
  15.66,
  21.82,
  26.16,
  30.6,
  37.97,
  45.75,
  49.42,
  55.5,
  59.88,
  63.14,
  69.08,
  75.67,
  80.55,
  80.9
 ],
 "defects": [
  {
   "t": 21.82,
   "issue": "seven cells (stop/east, wind, sea, slow, bulge, real, hour) were still being drawn when the camera left: items chained late behind their words",
   "fixed": true
  },
  {
   "t": 45.75,
   "issue": "polar-ocean hatching covered the whole globe (cap polygon took the long way round the limb)",
   "fixed": true
  },
  {
   "t": 49.42,
   "issue": "\"north of Spain: UNDERWATER\" written over the blue hatching, hard to read; moved above the globe, clear of the right-side UI",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:13:15Z",
 "reviewer": "sketch worker (model with vision), contact sheet after fixes, round 2: every cell finishes and holds before the camera moves (engine: no warnings); hand over text only while it is still drawing",
 "frames": [
  0.05,
  6.34,
  11.1,
  15.66,
  21.82,
  26.16,
  30.6,
  37.97,
  45.75,
  49.42,
  55.5,
  59.88,
  63.14,
  69.08,
  75.67,
  80.55,
  80.9
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:31:29Z",
 "reviewer": "sketch worker (model with vision), final round after produce: sheet re-rendered, 10 frames pulled from the encoded MP4 (ffmpeg -ss 3,13,24,35,44,48.5,58,67,74,80.5) and the thumbnail checked; thumbnail moved to 6.6 s so the hand no longer covers the hook number",
 "frames": [
  0.05,
  6.34,
  11.1,
  15.66,
  21.82,
  26.16,
  30.6,
  37.97,
  45.75,
  49.42,
  55.5,
  59.88,
  63.14,
  69.08,
  75.67,
  80.55,
  80.9
 ],
 "defects": []
}
```

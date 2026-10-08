# What would actually happen if you fell into quicksand?: discussion and decisions

Folder: `episodes/sketch/quicksand`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

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
 "at": "2026-10-08T05:23:39Z",
 "reviewer": "sketch worker (model with vision), contact sheet round 1",
 "frames": [
  0.05,
  5.91,
  12.33,
  18.01,
  22.0,
  27.16,
  31.77,
  38.38,
  43.98,
  48.42,
  52.44,
  59.62,
  64.58,
  68.28,
  74.57,
  77.63,
  78.88
 ],
 "defects": [
  {
   "t": 5.91,
   "issue": "the stuck stick figures (hook, float, tide, callback) read as standing on the sand: body ended exactly at the surface; sunk them deeper and heaped sand round the body",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:23:39Z",
 "reviewer": "sketch worker (model with vision), contact sheet + 3 full-res frames after fixes, round 2: every cell finishes and holds before the camera moves (engine: no warnings)",
 "frames": [
  0.05,
  5.91,
  12.33,
  18.01,
  22.0,
  27.16,
  31.77,
  38.38,
  43.98,
  48.42,
  52.44,
  59.62,
  64.58,
  68.28,
  74.57,
  77.63,
  78.88
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T10:07:03Z",
 "reviewer": "sketch worker (model with vision), final round after produce: sheet re-rendered, 10 frames pulled from the encoded MP4 (ffmpeg -ss 4,11,20,30,37,50,58,66,73,78.5) and the thumbnail (moved to 6.2 s, hand clear) checked",
 "frames": [
  0.05,
  5.91,
  12.33,
  18.01,
  22.0,
  27.16,
  31.77,
  38.38,
  43.98,
  48.42,
  52.44,
  59.62,
  64.58,
  68.28,
  74.57,
  77.63,
  78.88
 ],
 "defects": []
}
```

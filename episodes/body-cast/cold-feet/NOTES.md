# Do cold feet give you a cold?: discussion and decisions

Folder: `episodes/body-cast/cold-feet`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

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
 "at": "2026-10-08T05:12:17Z",
 "reviewer": "Gut Gang worker (Claude), contact sheet round 1",
 "frames": [
  0.05,
  4.58,
  8.44,
  15.08,
  22.66,
  24.18,
  27.64,
  30.47,
  34.16,
  37.92,
  43.54,
  47.47,
  49.94,
  50.97
 ],
 "defects": [
  {
   "t": 15.08,
   "issue": "test: '180 VOLUNTEERS' kinetic type duplicated and collided with the burned caption; replaced by two small group tags, dots split 90/90",
   "fixed": true
  },
  {
   "t": 22.66,
   "issue": "bucket: the 20-minute clock sat on top of the ICY WATER bucket; buckets moved down, clock up",
   "fixed": true
  },
  {
   "t": 30.47,
   "issue": "result: bar labels and the ONE STUDY tag fell into the caption block; bars raised and shortened",
   "fixed": true
  },
  {
   "t": 34.16,
   "issue": "turn: NO VIRUS HERE stamp covered the Heart, then snowflakes covered the stamp; Heart moved left, stamp up, snowflakes down",
   "fixed": true
  },
  {
   "t": 43.54,
   "issue": "vessels: the white cells were tiny and drifted off-screen; now larger and they stop when the vessels narrow",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:12:17Z",
 "reviewer": "Gut Gang worker (Claude), contact sheet round 2 plus still at 34.16 s",
 "frames": [
  0.05,
  4.58,
  8.44,
  15.08,
  22.66,
  24.18,
  27.64,
  30.47,
  34.16,
  37.92,
  43.54,
  47.47,
  49.94,
  50.97
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:17:18Z",
 "reviewer": "Gut Gang worker (Claude), round 3: sheet re-rendered by produce.sh, frames from the encoded MP4 at 12.0, 19.5, 31.5, 41.0, 49.5 s and the thumbnail",
 "frames": [
  0.05,
  4.58,
  8.44,
  12.0,
  15.08,
  19.5,
  22.66,
  24.18,
  27.64,
  30.47,
  31.5,
  34.16,
  37.92,
  41.0,
  43.54,
  47.47,
  49.5,
  49.94,
  50.97
 ],
 "defects": []
}
```

### Round 4
```json
{
 "at": "2026-10-08T05:36:54Z",
 "reviewer": "Gut Gang worker (Claude), final round: sheet re-rendered after produce.sh, every scene looked at",
 "frames": [
  0.05,
  4.58,
  8.44,
  12.0,
  15.08,
  19.5,
  22.66,
  24.18,
  27.64,
  30.47,
  31.5,
  34.16,
  37.92,
  41.0,
  43.54,
  47.47,
  49.5,
  49.94,
  50.97
 ],
 "defects": []
}
```

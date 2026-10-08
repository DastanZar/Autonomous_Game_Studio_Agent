# The Statue of Liberty is in New York, surrounded by New Jersey: discussion and decisions

Folder: `episodes/why-map/statue-of-liberty`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

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
 "at": "2026-10-08T05:27:46Z",
 "reviewer": "worker (Border Quirks batch 2), contact sheet round 1",
 "frames": [
  9.54,
  12.24,
  20.76,
  27.02,
  30.87,
  40.08,
  49.14
 ],
 "defects": [
  {
   "t": 9.54,
   "issue": "line/side/ellis/fill/two: land slabs 250 m thick at harbour scale, Jersey City shore reads as a giant block; Ellis landfill a tall box",
   "fixed": true
  },
  {
   "t": 12.24,
   "issue": "side: Bedloe's Island pin under the captions; Ellis pin under the title",
   "fixed": true
  },
  {
   "t": 20.76,
   "issue": "statue: '140 years ago this month' stamp across the statue's face",
   "fixed": true
  },
  {
   "t": 49.14,
   "issue": "power: utilities card over the NEW YORK tag; power line under the captions",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:27:46Z",
 "reviewer": "worker (Border Quirks batch 2), round 2 after fixes (slab 12 m, camera moved, tags moved)",
 "frames": [
  6.0,
  9.5,
  12.2,
  27.0,
  30.9,
  37.5,
  40.1
 ],
 "defects": [
  {
   "t": 12.24,
   "issue": "side: 'NEW JERSEY'S SIDE' title covered Ellis Island and repeated the caption: removed",
   "fixed": true
  },
  {
   "t": 49.14,
   "issue": "power: lines raised clear of the captions",
   "fixed": true
  }
 ]
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:27:46Z",
 "reviewer": "worker (Border Quirks batch 2), round 3: full contact sheet after the last fixes",
 "frames": [
  0.05,
  3.42,
  9.54,
  12.24,
  15.6,
  20.76,
  22.86,
  27.02,
  30.87,
  36.78,
  40.08,
  45.68,
  49.14,
  52.14,
  53.98
 ],
 "defects": []
}
```

### Round 4
```json
{
 "at": "2026-10-08T10:07:07Z",
 "reviewer": "worker (Border Quirks batch 2), round 4 after the first encode measured 10.2 s frozen per 30 s: moving water, swaying cards; drift 0.1 tried and rejected (pushed the brand tag off the left edge), back to 0.06",
 "frames": [
  0.05,
  3.42,
  9.54,
  12.24,
  15.6,
  20.76,
  22.86,
  27.02,
  30.87,
  36.78,
  40.08,
  45.68,
  49.14,
  52.14,
  53.98
 ],
 "defects": [
  {
   "t": 15.6,
   "issue": "drift 0.1 cropped the BORDER QUIRKS tag at the left edge",
   "fixed": true
  }
 ]
}
```

### Round 5
```json
{
 "at": "2026-10-08T10:07:07Z",
 "reviewer": "worker (Border Quirks batch 2), round 5: sheet at drift 0.06 with the new motion",
 "frames": [
  0.05,
  3.42,
  9.54,
  12.24,
  15.6,
  20.76,
  22.86,
  27.02,
  30.87,
  36.78,
  40.08,
  45.68,
  49.14,
  52.14,
  53.98
 ],
 "defects": []
}
```

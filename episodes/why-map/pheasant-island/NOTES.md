# This island changes country every six months: discussion and decisions

Folder: `episodes/why-map/pheasant-island`. Built by `studio/tools/notes.py`.

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
 "at": "2026-10-08T05:10:48Z",
 "reviewer": "worker (Border Quirks batch 2), contact sheet round 1 plus stills",
 "frames": [
  3.04,
  7.28,
  10.08,
  14.8,
  20.28,
  27.62,
  32.22
 ],
 "defects": [
  {
   "t": 3.04,
   "issue": "hook: FRANCE \u00b7 HENDAYE tag hidden behind the flag; SPAIN \u00b7 IRUN tag under the captions",
   "fixed": true
  },
  {
   "t": 7.28,
   "issue": "river: near map box edges visible mid-dive, no pins on screen; SPAIN/FRANCE pins off the frame edge; Bidasoa and Hendaye tags overlapped",
   "fixed": true
  },
  {
   "t": 10.08,
   "issue": "size: POPULATION 0 stamp on top of the PHEASANT ISLAND tag",
   "fixed": true
  },
  {
   "t": 14.8,
   "issue": "treaty: 1659 stamp over the treaty title",
   "fixed": true
  },
  {
   "t": 20.28,
   "issue": "brides: red carpet ran diagonally across the whole frame",
   "fixed": true
  },
  {
   "t": 27.62,
   "issue": "swap: FRANCE label close to the captions",
   "fixed": true
  },
  {
   "t": 32.22,
   "issue": "viceroy: official's head under the VICEROY stamp",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:10:48Z",
 "reviewer": "worker (Border Quirks batch 2), contact sheet round 2 after fixes",
 "frames": [
  0.05,
  3.04,
  7.28,
  10.08,
  14.8,
  16.48,
  20.28,
  24.04,
  27.62,
  32.22,
  36.42,
  39.72,
  42.72,
  43.77
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:23:40Z",
 "reviewer": "worker (Border Quirks batch 2), round 3: sheet re-rendered after produce, plus 5 frames from the encoded MP4 (2.5, 9.0, 16.8, 27.0, 35.5 s) and the thumbnail",
 "frames": [
  0.05,
  3.04,
  7.28,
  10.08,
  14.8,
  16.48,
  20.28,
  24.04,
  27.62,
  32.22,
  36.42,
  39.72,
  42.72,
  43.77
 ],
 "defects": []
}
```

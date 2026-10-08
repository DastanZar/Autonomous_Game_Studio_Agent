# Why yawns are contagious (and it isn't oxygen): discussion and decisions

Folder: `episodes/body-cast/contagious-yawn`. Built by `studio/tools/notes.py`.

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
 "at": "2026-10-07T20:22:39Z",
 "reviewer": "Gut Gang worker (Claude), contact sheet round 1",
 "frames": [
  0.05,
  3.58,
  5.57,
  10.48,
  17.02,
  21.66,
  23.34,
  29.02,
  32.98,
  39.95,
  44.94,
  46.59,
  48.1
 ],
 "defects": [
  {
   "t": 5.57,
   "issue": "nope/huh/toll: cast lines have no burned captions, and the dialog bubble came up empty; added storyboard bubbles text",
   "fixed": true
  },
  {
   "t": 29.02,
   "issue": "video/smiles: '55% YAWNED' collided with the burned caption and the dot chart was lost on the pink blob; moved type up to y 1150, dark ground, new 100-dot chart that keeps all dots",
   "fixed": true
  },
  {
   "t": 10.48,
   "issue": "myth: TESTED 1987 stamp sat on the Brain's crown and the Provine tag covered its legs; Brain moved left and raised, stamp smaller",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-07T20:22:39Z",
 "reviewer": "Gut Gang worker (Claude), contact sheet round 2 plus stills at 13.2, 30.9, 33.8 s",
 "frames": [
  0.05,
  3.58,
  5.57,
  10.48,
  13.2,
  17.02,
  21.66,
  23.34,
  29.02,
  30.9,
  32.98,
  33.8,
  39.95,
  44.94,
  46.59,
  48.1
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:10:13Z",
 "reviewer": "Gut Gang worker (Claude), round 3: sheet re-rendered by produce.sh, plus frames from the encoded MP4 at 1.0, 15.5, 27.5, 38.0, 46.5 s and the thumbnail",
 "frames": [
  0.05,
  1.0,
  3.58,
  5.57,
  10.48,
  15.5,
  17.02,
  21.66,
  23.34,
  27.5,
  29.02,
  32.98,
  38.0,
  39.95,
  44.94,
  46.5,
  46.59,
  48.1
 ],
 "defects": [
  {
   "t": 4.42,
   "issue": "thumbnail at 4.42 s showed 'A SCIENTIST MEASURED IT' without the dare; re-made at 2.0 s ('READ THIS. DON'T YAWN.')",
   "fixed": true
  }
 ]
}
```

### Round 4
```json
{
 "at": "2026-10-08T05:36:54Z",
 "reviewer": "Gut Gang worker (Claude), final round: sheet re-rendered after produce.sh, every scene looked at",
 "frames": [
  0.05,
  1.0,
  3.58,
  5.57,
  10.48,
  15.5,
  17.02,
  21.66,
  23.34,
  27.5,
  29.02,
  32.98,
  38.0,
  39.95,
  44.94,
  46.5,
  46.59,
  48.1
 ],
 "defects": []
}
```

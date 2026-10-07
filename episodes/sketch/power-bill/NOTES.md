# Why your power bill went up (it's a building you've never seen): discussion and decisions

Folder: `episodes/sketch/power-bill`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-07 UTC

Apart from the work already assigned to you, i want you to do one more thing once everything is wrapped up and that is to try a different form of video : it will be a hand using a pencil and drawing on a paper or a canvas or something and telling the story by drawing it out, way back when there used to be a trend like this to tell a day in my life, i want to use that methodoology to tell stories happening around us, look at the channel - @SportsBall_Visual and the way he does it, he uses his real drawings probably, not sure, but ive definitely seen animated versions of these too, sketching chracaters, scenes - a complete story out

#### Claude · record

- **Format pilot started (in progress):** "Why your power bill went up (a building you've never seen)". It's about data centers and the PJM capacity auction ($28.92 → $269.92 → $329.17 → $333.44 per MW-day; PJM's no-cap simulation gives $529.80; the market monitor's estimate puts 63% of the first jump, $9.3 B, on data centers; D.C. bills +$21 a month).
  - Every number is quoted from a fetched source, with PJM's own reports as the primary source; 0 NOT_FOUND.
- **Reference studied:** @SportsBall_Visual (51.4k subscribers). Its videos are 2–3 min vertical stories drawn on one white page.
- **New sketch kit** (`studio/engine/kits/sketch.js`):
  - pencil lines with a hand wobble, revealed stroke by stroke;
  - red and blue pencil hatching;
  - hand lettering in Patrick Hand and Gochi Hand (OFL; downloaded from npm @fontsource because GitHub raw was blocked);
  - a drawn hand and pencil that follow the stroke tip;
  - a desk and paper, and a camera that pans from cell to cell and pulls back at the end;
  - pencil-scratch sound cues.
- **Supporting changes:**
  - a provisional `sketch` channel bible (working name "Drawn Out"; the name is the user's call);
  - core.js gains a hand-lettered caption option;
  - the music is the user-approved 'detective' track, copied into the new channel.
- **Gates and status:** voice gate passes (Kokoro George; WER 0 after rewriting two lines Whisper misheard). Storyboard and picture gates pass after two contact-sheet rounds. Eight defects were fixed, including two items drawing at once, paper tile seams, an oversized hand, a gavel that read as a sign, and late labels.
- **Not yet done:** the full render was slow (about 25 frames a minute) and still running when this was committed.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T14:28:13Z",
 "reviewer": "builder (orchestrator), contact sheet + 4 full-res frames, round 1",
 "frames": [
  0.05,
  3.81,
  9.53,
  12.4,
  17.52,
  23.83,
  26.3,
  30.7,
  35.91,
  39.13,
  45.93,
  52.15,
  57.86,
  62.05,
  68.14,
  72.61,
  72.81
 ],
 "defects": [
  {
   "t": 26.3,
   "issue": "two items drawing at once: 'THE AUCTION' kept writing itself while the hand drew the gavel's strike marks (kit now runs one item at a time)",
   "fixed": true
  },
  {
   "t": 12.4,
   "issue": "paper texture tiles showed 512 px seams",
   "fixed": true
  },
  {
   "t": 12.4,
   "issue": "hand and sleeve too big, covering a third of the frame; pencil too short to read as a pencil",
   "fixed": true
  },
  {
   "t": 30.7,
   "issue": "gavel read as a sign on a stick",
   "fixed": true
  },
  {
   "t": 52.15,
   "issue": "'$529.80' note ran off the left of the frame",
   "fixed": true
  },
  {
   "t": 17.52,
   "issue": "labels still being written as the camera left (share, grid, bill, cap); several items late against the words",
   "fixed": true
  },
  {
   "t": 57.86,
   "issue": "last row: captions over the desk, page ended right under the cells",
   "fixed": true
  },
  {
   "t": 9.53,
   "issue": "the data center's power line was a stray zigzag",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-07T14:28:13Z",
 "reviewer": "builder (orchestrator), contact sheet after fixes, round 2",
 "frames": [
  0.05,
  3.66,
  9.38,
  17.37,
  23.68,
  30.55,
  35.76,
  38.98,
  45.78,
  52.0,
  57.71,
  61.9,
  67.99,
  72.46,
  72.81
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-07T15:03:56Z",
 "reviewer": "builder (orchestrator), round 3 after user feedback: glove replaces the hand, pace 1.08, no pencil scratch",
 "frames": [
  0.05,
  3.66,
  9.38,
  17.37,
  23.68,
  30.55,
  35.76,
  38.98,
  45.78,
  52.0,
  57.71,
  61.9,
  67.99,
  72.46,
  72.81
 ],
 "defects": []
}
```

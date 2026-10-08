# Where MLB players come from, outside the US (and per person): discussion and decisions

Folder: `episodes/ranked/mlb-players-by-country`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-10-06 UTC

im unabel to preview the audios inside claude or in github, whenever you want me preview/checking anything just add it neatly and properly to the dashbaord its much easier

#### Claude · record

- Added `studio/review_queue.json` and a "Watch & listen" section at the top of the dashboard, with players for: the voice pick (5 samples), bake-off A vs C (2 videos), and the music approvals (4 + 4 tracks).
- The music .ogg files are converted to 128k mp3 previews in docs/review/music/ so they play on iPhone and Safari.
- dashboard.py writes `docs/site-media.txt`, and the Pages workflow copies those files into the site.
- AGENTS.md rule: anything for the user to review goes in the review queue, never chat or GitHub.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-08T05:28:41Z",
 "reviewer": "worker (Leader Flags batch), round 1: 15 stills, one or more per scene after each number lands",
 "frames": [
  0.05,
  4.5,
  8.5,
  13.9,
  16.9,
  20.6,
  25.9,
  31.3,
  34.0,
  36.5
 ],
 "defects": [
  {
   "t": 13.9,
   "issue": "source line wider than the frame in the ranked-list scenes",
   "fixed": true
  },
  {
   "t": 28.5,
   "issue": "s_ratio: the crown overlaps the PLAYERS PER MILLION title",
   "fixed": true
  },
  {
   "t": 31.3,
   "issue": "s_ratio: the 1 IN 39,000 tag sits on the bar baseline and against the captions; removed (the captions carry it)",
   "fixed": true
  },
  {
   "t": 20.6,
   "issue": "s_pivot: small text repeated the caption word for word right above it; removed",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-08T05:28:42Z",
 "reviewer": "worker, round 2: stills after the fixes; globe checked against each spoken place (DO, DO, VE then CU then CA, JP then PR, DO, CW, CW then DO, DO then CW); numbers checked against data/mlb_opening_day_2026_by_birthplace.csv (93, 60, 20, 19, 14, 14, 4, 155,967, 25.6 and 8.1 per million)",
 "frames": [
  0.05,
  4.5,
  8.5,
  13.9,
  16.9,
  20.6,
  25.9,
  31.3,
  34.0,
  36.5
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-08T05:33:54Z",
 "reviewer": "worker, round 3 (after production): fresh stills plus 9 frames pulled from the encoded MP4 and the thumbnail; no layout defects",
 "frames": [
  0.05,
  4.5,
  8.5,
  13.9,
  16.9,
  20.6,
  25.9,
  31.3,
  34.0,
  36.5
 ],
 "defects": []
}
```

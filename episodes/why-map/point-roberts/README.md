# Point Roberts — "This American town has one road out"

**Channel:** Border Quirks (why-map) · **Series:** why · **Format:** 9:16, 1080×1920, 24 fps, about 60 s.

This is the **v2 flagship rebuild** (2026-10-06). The user watched v1 (our engine) and the HyperFrames
bake-off and rejected both as "not rich enough": abstract cards on empty paper. v2 is built to beat the
Great Emu War, which is the floor, not the ceiling:

- **One world, not a slideshow.** Every beat is a drawn place: the town and its one road, an 1846 desk,
  the real coastline from above, a cutaway of the pipe under the border, a main street, a crowded shop.
- **Characters and props carry the facts.** A car waits at the barrier, surveyors walk the line and a
  piece of the peninsula comes loose under their scissors, a school bus crosses four times, a glass fills
  from a Canadian reservoir, parcels pile up unclaimed, five pumps serve one customer.
- **The whole canvas is used,** foreground to horizon, so nothing floats in empty paper.
- **Real geography.** Point Roberts is three points wide in Natural Earth 1:10m, so `geo.py` gained a
  `coast: "osm"` option: OpenStreetMap coastline + the national border relation, polygonized into land
  (ODbL, credited). Every map in the video is that real shape.

## Fact table

| Line in the script | What the source says | Source |
|---|---|---|
| This American town has one road out. And it goes through Canada. | With a population of about 1,191 (2020 census), Point Roberts can only be reached from the rest of the United States by land via a roughly 25-mile drive through Canada, crossing the border twice; the only way in without touching Canada is by boat or private plane. | [Wikipedia](https://en.wikipedia.org/wiki/Point_Roberts,_Washington), [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/point-roberts-148367/) |
| About twelve hundred people. Five square miles. | Point Roberts is a US exclave: a small piece of US territory, about 5 square miles (13 square kilometers), completely cut off by land from the rest of Washington State by British Columbia, Canada. | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/point-roberts-148367/) |
| In eighteen forty-six, Britain and America drew their border with a ruler: the forty-ninth parallel. | An 1846 treaty (the Treaty of Oregon) set the US-Canada border at the 49th parallel without the negotiators realizing the effect; only later, when the Boundary Commission surveyed the line, did anyone notice it would cut off the tip of a peninsula as an isolated piece of the United States. | [Wikipedia](https://en.wikipedia.org/wiki/Point_Roberts,_Washington), [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/point-roberts-148367/) |
| Kids ride a school bus through Canada. Four crossings a day. | From fourth grade on, Point Roberts children commute to school in Blaine, Washington by crossing the international border four times a day. | [Wikipedia](https://en.wikipedia.org/wiki/Point_Roberts,_Washington) |
| The tap water? Canadian, under a deal from nineteen eighty-seven. | Point Roberts buys its drinking water from Canada under a 1987 agreement with the Greater Vancouver Water District. | [Wikipedia](https://en.wikipedia.org/wiki/Point_Roberts,_Washington) |
| In twenty twenty, the pandemic shut the border, and the Canadian shoppers vanished. | During the 2020 COVID-19 border closure, Point Roberts lost more than 80 percent of its business, all of it from Canadians, according to the Border Policy Research Institute at Western Washington University. **Border Policy Research Institute estimate** | [CBC News](https://www.cbc.ca/news/canada/british-columbia/point-roberts-covid-1.5740806), [Wikipedia](https://en.wikipedia.org/wiki/Point_Roberts,_Washington) |
| In twenty twenty, the pandemic shut the border, and the Canadian shoppers vanished. | In a normal year the town's customers are largely British Columbians: tourists, and bargain hunters filling up on gas and picking up packages at parcel shops. | [CBC News](https://www.cbc.ca/news/canada/british-columbia/point-roberts-covid-1.5740806) |
| The grocery that served five thousand people a day? About fifty. | The town's one grocery store served up to 5,000 customers a day at its peak; during the 2020 closure about 50 people a day shopped there. | [CBC News](https://www.cbc.ca/news/canada/british-columbia/point-roberts-covid-1.5740806) |
| Five gas stations. Fewer than a thousand people. | During the 2020 closure the town had five gas stations serving fewer than 1,000 people. | [CBC News](https://www.cbc.ca/news/canada/british-columbia/point-roberts-covid-1.5740806) |
| In twenty twenty-five, a trade war. One restaurant owner said February fell fifty-five percent. | US-Canada trade tension in early 2025 hit Point Roberts business hard; one longtime restaurant owner reported business down 55 percent in February compared with the year before. **one business owner's reported figure** | [Associated Press (via Yahoo News)](https://www.yahoo.com/news/caught-middle-quaint-us-exclave-012748560.html) |

Myth handled: the oddity was not deliberate. The negotiators drew a straight line; the Boundary
Commission only found the cut-off peninsula when it surveyed the line afterwards.

## Pipeline

| Stage | Command | Result |
|---|---|---|
| Research | `studio/tools/verify_quotes.py` | 12 claims, 4 sources, 0 not-found |
| Script | `studio/studio.py check` | 147 words, 10/10 checks |
| Voice | `studio/tools/vo.py --engine kokoro` | Kokoro-82M `bm_george`, speed 1.1; **WER 0.00 on every paragraph** |
| Maps | `studio/tools/geo.py` | Natural Earth + OSM coastline (`coast: "osm"`) |
| Picture | `studio/engine/render.mjs` + `scenes.js` | 14 bespoke scenes, 1,434 frames |
| Audio | `studio/tools/audio.py` | music 8.0 dB under the voice |
| Encode | `studio/tools/encode.py` | two-pass x264 |
| Check | `studio/tools/final_check.py` | 1080×1920, 24 fps, −14.1 LUFS, WER 0.00 |

## Quality bar (motion-kit measurement, `studio/tools/frozen.py`)

| Video | Near-still screen | Per 30 s | Longest hold |
|---|---|---|---|
| **Point Roberts v2** | **0.8 s / 59.7 s** | **0.40 s** | **0.3 s** |
| The Great Emu War | 2.2 s / 45.9 s | 1.44 s | 0.4 s |
| Point Roberts v1 | 2.9 s / 41.4 s | 2.10 s | 0.6 s |
| Bake-off C (HyperFrames) | 4.6 s / 41.4 s | 3.33 s | 0.8 s |

The bar is ≤ 1 s per 30 s and no hold over 0.6 s. v2 is the first video in the repo to clear it.

## What was verified, and what wasn't

- **Verified:** every quote re-fetched from its source; every word cue resolves; the final mix
  transcribes at WER 0.00 against the script; loudness, resolution, fps and duration measured from
  the encoded MP4; frames spot-checked from the MP4, not just the renderer.
- **Not verified:** nobody has listened to it. Claude cannot hear audio — the voice is checked by
  transcription and by level measurement only.
- **Draft voice.** With no OpenRouter key in the vault (rotation pending), narration is Kokoro, not
  the channel's Fish voice. Every cue is keyed to a spoken word, so re-voicing re-times the picture
  automatically.

## Files

`script.json` · `dossier.json` · `storyboard.json` · `scenes.js` (the diorama) · `review.json` ·
`out/point-roberts.mp4`. v1 is kept for comparison in `v1/` and `out/point-roberts-v1.mp4`; the
HyperFrames bake-off is in `bakeoff-hyperframes/`.

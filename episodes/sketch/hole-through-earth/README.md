# What would actually happen if you jumped into a hole through Earth?

One page with a big Earth cross-section (core radius to scale, NASA) that the camera travels down: the fall, 8 km/s at the centre, gravity flipping, the far side; then the textbook 42 minutes vs the real 38 (Klotz, Am. J. Phys. 2015). Simplified on the page: no air, no lava, no spin.

- Channel: `studio/channels/sketch/bible.json` (series `whatif`); kit: `studio/engine/kits/sketch.js` (unchanged)
- Page content: `scenes.js` (items keyed to spoken words, laid out per camera view so each drawing finishes before the camera moves)
- Voice: Kokoro-82M `bm_george` (local); music: the bible's current track (`detective`); no pencil-scratch sound

## Facts (every number on the page)

| Claim | Source |
|---|---|
| Using Earth's real internal structure (from seismic data), a fall straight through the centre takes about 38 minutes (38 min 11 s). | [Alexander R. Klotz, McGill University (arXiv)](https://arxiv.org/abs/1308.1342) (scholarly); [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| The textbook answer, taught since 1966, is about 42 minutes; it assumes Earth has the same density all the way through. | [Alexander R. Klotz, McGill University (arXiv)](https://arxiv.org/abs/1308.1342) (scholarly); [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| A hole straight through Earth's centre would be about 12,742 km long. Calculation/note: 2 x 6,371 km = 12,742 km. | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism); [NASA Goddard Space Flight Center (NSSDCA)](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) (official) |
| The calculation assumes no air resistance in the tunnel. | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| The deepest hole ever dug (a Soviet project, 1970 to 1989) reached only 12 km, about 0.1 percent of the way through the Earth (Klotz's figures). | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| You would reach speeds over 8 km per second (at the centre). | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism); [Alexander R. Klotz, McGill University (arXiv)](https://arxiv.org/pdf/1308.1342) (scholarly) |
| Halfway, at the centre, gravity switches direction: you start slowing down. Calculation/note: Past the centre the pull points back toward the centre, against your motion, so you decelerate (basic mechanics of the gravity tunnel). | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| At the far end you'd have to grab the edge, or you'd fall back down, back and forth like a pendulum. | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| Earth's crust has a density under about 3 g per cubic cm; the centre is about 13; there is a sharp 50 percent jump at the core, about 2,900 km down. Calculation/note: NASA: core radius 3,485 km, so the core boundary is 6,371 - 3,485 = 2,886 km down (about 2,900 km). | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism); [NASA Goddard Space Flight Center (NSSDCA)](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) (official) |
| Pretending gravity keeps its surface strength all the way down gives almost exactly the same answer, about 38 minutes. | [Alexander R. Klotz, McGill University (arXiv)](https://arxiv.org/pdf/1308.1342) (scholarly); [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |
| Why: gravity only changes by about 10 percent for the first 3,000 km down, and by the time it changes much you are going so fast you spend little time there. | [Live Science (Charles Q. Choi)](https://www.livescience.com/50312-how-long-to-fall-through-earth.html) (journalism) |

Every quote is machine-checked against the fetched source (`studio/tools/verify_quotes.py`: 0 NOT_FOUND).

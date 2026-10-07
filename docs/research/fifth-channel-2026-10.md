# A fifth channel: which "mesmerizing" niche? (research, 7 Oct 2026)

The user's brief, verbatim: "research about another 5th niche for a 5th channel, something totally different to what
we have till now, but that pushes the boundaries of what were doing, something absolutely mesmerizing and a views
magnet". Earlier: "be strategic analytical and smart… look at the data of the last quarter or the last few months… Is it
too crowded? Is it not crowded enough? What is the sweet spot? What would make sense in synergy with the type of video it
is… Check what's trending in Reels, TikTok… not just YouTube Shorts."

What we already run, so the fifth has to be different: Border Quirks (maps, paper cut-out, 3D map flights), Gut Gang
(organs as characters), Leader Flags (country rankings on a globe), and the drawn channel ("What would actually happen
if…", hand-drawn science).

## Recommendation in one paragraph

**Make the fifth channel about the hidden mechanisms inside everyday things, shown as precise 3D cutaways.** Working
name: *Inside Job*. Every episode opens up one ordinary object (a lock, a zipper, a toilet, a click pen, a seatbelt), slices it
open with a moving cutting plane, explodes it into parts and runs it in slow motion until the "oh, *that's* how"
moment lands. Facts come from patents and manufacturers' documents.

It is the only lane where all four signals line up:
- **Demand is surging.** The leading channel grew five times quarter on quarter.
- **The breakouts are small and new.** Four channels created in 2026 already have Shorts with 10–26M views.
- **The giants are absent.** The big 3D-cutaway channels post almost no Shorts.
- **The format pushes us forward.** It moves our engine from 2.5D paper into real 3D (Three.js clipping planes, Blender
  on the laptop) without a paid model.

**Runner-up:** physics simulations that answer a real question. It is the most mesmerizing and the cheapest to make,
but the satisfying-sim market is flat and full of templates.

**Third:** "the true scale of things" in 3D. Big long-form demand, but almost nobody supplies it as Shorts.

---

## 1. How this was measured

**YouTube Data API, search: blocked.**
- The first `search.list` call (via `access_token("why-map")`, the way `topic_scout.py` does it) returned 429:
  "Quota exceeded for quota metric 'Search Queries' … per day". I stopped using search after that one call.

**YouTube Data API, non-search endpoints: worked, and are the main data here.**
- `channels.list`, `playlistItems.list` and `videos.list` have a separate quota (about 1 unit per call), so they
  still worked.
- **Channels:** I hand-picked 94 benchmark channels across 11 candidate niches, found through 44 relevance searches
  with `yt-dlp`.
- **Videos:** for each channel, every upload from 1 Apr 2026 onward, with views and duration. About 600 quota units.
- **What counts as a Short:** any video of 180 seconds or less.
- **Per channel, measured as in the sketch-niche research:**
  - the Q3 (Jul–Sep) Shorts median and top Short;
  - the Q2 (Apr–Jun) median;
  - the Q3/Q2 ratio. Q3 videos have had less time to collect views, so **0.5 is flat**; above means growing.
  - "Small breakout": a channel under 100k subscribers with a Q3 Short over 500k views.
  - "Big": 1M+ subscribers.
- **Limit:** for channels that post several times a day (Zack D. Films, Techie Sapien), the 400-upload cap didn't reach
  back to Q2, so they have no ratio.

**Existing API scans (Q3 2026, top 50 Shorts per search):** `docs/research/sketch-niche/yt-scan-2026-10-07.json` and
`yt-trend-q2-q3-2026.json`, for the "how it works", "space" and "science explained" searches.

**Wider internet:**
- TikTok and Reels trend roundups for September and October 2026;
- TikTok discover pages;
- faceless-niche RPM reports (AIR Media-Tech's measured data; vendor blogs, which I treat as estimates);
- reporting on YouTube's inauthentic-content policy.

Reddit wasn't directly searchable. The only creator discussion I could find was a Tom's Guide forum thread. **No usable
TikTok view data exists for the 3D-mechanism lane** (searched; nothing found), so the TikTok read there is inference.

**What I could not do:**
- run date-bounded YouTube *search* medians for the new niches (quota);
- see real TikTok or Reels view counts per niche (no API; roundups only);
- know any niche's RPM for sure (no official table exists).

Estimates are labelled.

## 2. Last quarter, by candidate niche (channel data, Q3 2026)

"Median of channels" is the median of each active channel's Q3 Shorts median (a channel counts as active with 3 or more
Q3 Shorts), so a single prolific channel can't skew it.

| Niche | Channels measured (active in Q3) | Median of channels' Q3 Shorts medians | Best channel median | Biggest Q3 Short | Small breakouts | 1M+ channels | Q3/Q2 (0.5 = flat) | Read |
|---|---|---|---|---|---|---|---|---|
| **3D "how it works" / cutaway** (core six, below) | 6 (6) | **~86k** | **2.40M** (Infinite Desk) | **26.5M** (Under Six Minutes, 15.5k subs) | **4** | 0 of the six | **×2.4 and ×5.0** (the two with Q2 data) | **Surging, open at the top** |
| Satisfying 3D/2D physics sims (no facts) | 16 (11) | 47k | 1.54M (Kawaken 3DCG) | 37.1M (Kawaken) | 2 | 0 | **0.62** (n = 8) | Big but flat; templated |
| Space / cosmic 3D | 5 (4) | ~1.4M | 24.3M (FactoHolic, general facts) | 69.5M (FactoHolic); 45.5M (Beyond the Observable Universe) | 0 | 4 | 0.93 (n = 3) | Strong, but owned by big channels and overlaps the drawn channel |
| 3D scale / size comparison | 14 (1) | n/a: **almost no Shorts** | 8.6M (King Animations, countryballs) | 24.7M | 0 | 4 | n/a | **Shorts supply gap**: MetaBallStudios, RED SIDE, Data Ball, Real Data, yeti dynamics posted **0** Shorts in Q2–Q3 |
| Marble run / domino / Rube Goldberg | 7 (5) | 99k | 175k | 41.5M (Joseph's Machines) | 0 | 6 | 0.93 | Owned by big physical-footage channels |
| Math visuals | 2 (2) | 310k | 599k (3Blue1Brown) | 1.45M | 0 | 1 | 1.13 | Small, narrow |
| Simulation that explains science | 9 (1) | 66k | 66k | 1.0M | 0 | 4 | n/a | **Empty on Shorts**: Primer, Sebastian Lague, Pezzza's Work, ScienceClic post ~0 Shorts |
| Music / rhythm visualisation | 4 (1) | 22k | 22k | 27k | 0 | 2 | 0.76 | DoodleChaos and Math Floyd posted no Shorts; weak |
| Timelapse of a place | 5 (1) | 20k | 20k | 1.55M | 1 | 1 | n/a | Thin, and overlaps Border Quirks |
| X-ray / inside the body | 3 (1) | 18k | 18k | 2.7M | 0 | 0 | 2.06 | Gut Gang's lane; excluded |
| Ocean depth / thalassophobia | 2 (0) | n/a | n/a | 18k | 0 | 0 | n/a | Mostly horror; little Shorts supply |

Supporting search data (YouTube API, Q3 2026, top 50 Shorts per search, from the sketch-niche scan):

| Search | Q3 median | Top-10 mean | Distinct channels | Big (1M+) | Small breakouts |
|---|---|---|---|---|---|
| "how it works" | 65k | 9.5M | 48 | **5** | 5 |
| "space" | 1.08M | 21.0M | 41 | 15 | 20 |
| "science explained" | 6.36M | 27.7M | 38 | 20 | 16 |

"How it works" has a low median and a very high top 10, with almost no big channels. That is the signature of a niche
where **the hook carries the video, not the channel**. It's the same pattern that made Border Quirks' lane attractive.

### The six "how it works in 3D" channels in detail (Q3 2026 Shorts)

| Channel | Created | Subs | Q3 Shorts | Q3 median | Q2 median | Q3/Q2 | Top Q3 Short |
|---|---|---|---|---|---|---|---|
| Infinite Desk | **Feb 2026** | 413k | 26 | **2,395,415** | 478,804 | **×5.00** | [The Amazing Evolution of the Faucet](https://www.youtube.com/shorts/UjD94SGqIdM) (17.5M); [The Bolt and Nut That Never Loosen](https://www.youtube.com/shorts/DZ5Ri-xpyWw) (16.8M) |
| Under Six Minutes Studio | **May 2026** | 15.5k | 47 | **945,466** | n/a | n/a | [How Underwater Welding Works](https://www.youtube.com/shorts/EQ5x6XOV6BI) (26.5M) |
| curv lab | n/a | 129k | 10 | 117,413 | n/a | n/a | [The Genius Mechanism Inside Every Car](https://www.youtube.com/shorts/Nat2Pn7u27w) (3.5M) |
| Proto Craft | Oct 2023 | 80.7k | 145 | 54,107 | 22,155 | **×2.44** | [How Does a 4-Stroke Engine Work?](https://www.youtube.com/shorts/q8zIX46E__I) (3.1M) |
| AiEngineer | **Jul 2026** | 39.8k | 90 | 8,543 | n/a | n/a | [How Does a Chick Develop Inside an Egg?](https://www.youtube.com/shorts/BffIITO6VRM) (10.0M) |
| Mr Decode | **Jul 2026** | 59.9k | 84 | 5,236 | n/a | n/a | [Kolkata Underwater Metro Tunnel, 3D](https://www.youtube.com/shorts/aKcxGLEYyaI) (17.2M) |
| *Reference:* Zack D. Films | 2017 | 28.8M | 364 | 8,317,990 | (capped) | n/a | [Hair Harvest Drain System](https://www.youtube.com/shorts/nDOScT_mRnM) (35.6M), a mechanism patent |

- **Four of the six were created in 2026**, and between them they already have 22M–173M total views (channel totals
  from the API: Infinite Desk 173M, Under Six Minutes 104M, Mr Decode 32M, AiEngineer 23M).
- The medians are uneven: Mr Decode's 5k median with a 17M hit means the topic, not the channel, carried that video.
- **The giants of 3D cutaways barely do Shorts.** In Q2–Q3 2026:
  - Jared Owen (4.4M subs) posted 1 Short;
  - Animagraffs (1.9M) posted 0;
  - Matt Rittman ("How a Glock Works", 94M on a long video) posted 0.

### The satisfying-sim channels in detail

| Channel | Created | Subs | Q3 Shorts | Q3 median | Q3/Q2 | Note |
|---|---|---|---|---|---|---|
| Kawaken 3DCG | May 2025 | 522k | 27 | **1,538,381** | 0.94 | Blender. Biggest: [Which Bed do you want to sleep?](https://www.youtube.com/shorts/vC644jVVrbI) (37.1M) |
| visualizing magic | Aug 2024 | 545k | 44 | **740,480** | 0.77 | Python **creative coding**, 2D, i.e. exactly what our canvas does. ["Measuring π"](https://www.youtube.com/shorts/fUzZ5dzmA7A) 4.0M; ["will the ball evolve?"](https://www.youtube.com/shorts/Xo2RXpBi6dg) 6.6M |
| Blendy Craft | n/a | 350k | 19 | 154,050 | 0.49 | Minecraft-themed Blender sims |
| PS Zooms | n/a | 28k | 9 | 102,964 | 0.27 | Pokémon IP (licensing risk) |
| Satisfying 2D Sims | **Jul 2026** | 20.3k | **240 in one quarter** | 34,584 | n/a | Mass production; 23.9M total views in 3 months; top [2.1M](https://www.youtube.com/shorts/5M-W_btiK34) |
| Lord GodSon / Blender N Chill / Blendrix | n/a | 85–105k | 8–27 | 22–47k | 0.56–1.09 | The long tail |

## 3. The wider internet (TikTok, Reels, money, policy)

- **TikTok.**
  - Bouncing-ball simulations are a mass format: TikTok's ["Bounce Ball" discover page](https://www.tiktok.com/discover/bounce-ball?lang=en)
    counts 65.8M posts.
  - Template tools sell the format outright ([ViralBalls](https://viralballs.com/en),
    [ballsimulator.com](https://ballsimulator.com/en/blog/how-to-create-viral-bouncing-ball-videos/)). That's demand,
    and also proof that it's being commoditised.
  - The September 2026 roundups ([SocialBee](https://socialbee.com/blog/tiktok-trends-you-cant-miss/),
    [NewEngen](https://newengen.com/insights/september-tiktok-trends/),
    [Epidemic Sound](https://www.epidemicsound.com/blog/latest-tiktok-trends/)) are audio and dance trends. None names
    a science or mechanism trend.
  - TikTok's [satisfying-video page](https://www.tiktok.com/discover/trending-satisfying-videos) is evergreen (ASMR,
    slime, soap cutting). I found **no TikTok data at all on 3D mechanism explainers**. That is either a gap or a blind
    spot; it can't be read as demand.
- **TikTok pays only for videos over one minute.** Creator Rewards needs videos longer than 60 seconds, at about
  $0.40–1.00 per 1,000 qualified views ([Postfa.st](https://postfa.st/blog/tiktok-monetization-requirements),
  [Timetopost](https://timetopost.co/blog/tiktok-creator-rewards-requirements-2026/), vendor figures). A 60–75 s
  mechanism story qualifies naturally. A 25 s satisfying loop doesn't.
- **Reels.**
  - Vendor stats say "learn-with-me" educational Reels grew about 58% year on year, while about 50% of users prefer
    entertainment and 27% educational ([Zebracat](https://www.zebracat.ai/post/instagram-reels-statistics), unverified).
  - The advice is 30–60 s for educational Reels ([SocialPilot](https://www.socialpilot.co/blog/instagram-reels-trends)).
  - Animated explanations are named as a breakout pattern in Lightreel's
    [October 2026 report](https://lightreel.ai/blogs/whats-trending-on-instagram).
- **Money (RPM).**
  - AIR Media-Tech's measured data (300 channels, May 2025 to May 2026) puts **Education & Science at a $10.22 median
    long-form RPM**, against a $2.30 median for all niches, Kids & Teens at $0.33 and Gaming at $2.05.
  - Shorts RPM is **3–14% of long-form** in almost every niche
    ([AIR, Shorts vs long-form](https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026);
    [AIR, RPM by niche](https://air.io/en/air-data-findings/what-is-youtube-shorts-rpm-in-your-niche-in-2026)).
  - Our earlier note has Shorts at $0.01–0.08 per 1,000 views, and finance or tech at $0.15–0.45
    ([miraflow](https://miraflow.ai/blog/youtube-shorts-rpm-2026-real-ranges-by-niche)).
- **Policy.**
  - YouTube's "inauthentic content" rule (renamed from "repetitious" on 15 July 2025) targets templated, low-variation,
    mass-produced uploads.
  - Third-party reports describe a July 2026 clarification, and the termination of 16 channels with 4.7B combined views
    in early 2026 ([Flocker](https://flocker.tv/posts/youtube-inauthentic-content-ai-enforcement/),
    [noobclaw](https://noobclaw.com/blog/youtube-inauthentic-content-policy-2026/),
    [lenspov](https://lenspov.com/articles/youtube-ai-content-demonetization-2026); I couldn't confirm the July 2026
    categories on YouTube's own pages).
  - Satisfying sims made from one template are the textbook case of this risk.
- **Views don't equal subscribers.** A creator reports 1 subscriber per ~2,000 Shorts views
  ([Tom's Guide forum, Apr 2026](https://forums.tomsguide.com/threads/getting-decent-reach-on-shorts-but-0-sub-conversion-anyone-figured-this-out.589078/latest)).
  Pure-satisfying channels are the most exposed to this: the viewer watches the loop, not the channel.

## 4. The top three, ranked

Scoring (my judgement on the data above, out of 5):

| | Demand (Q3) | Trend | Room (crowding) | Synergy with our tools | Cost per episode (5 = cheap) | Money | Different from our 4 | **Total /35** |
|---|---|---|---|---|---|---|---|---|
| **1. Hidden mechanisms in 3D** | 5 | 5 | 4 | 4 | 2 | 4 | 5 | **29** |
| 2. Simulations that answer a question | 4 | 2 | 2 | 5 | 5 | 2 | 5 | 25 |
| 3. The true scale of things, 3D | 4 | 3 | 4 | 4 | 3 | 3 | 3 | 24 |

### 1. Hidden mechanisms, opened up in 3D (recommended)

**The idea.** One everyday object per Short. A cutting plane slides through it, the parts float apart, it runs in
slow motion, and the one clever part glows. The voice-over tells the story of the problem it solved, which is the
Infinite Desk formula ("why did faucets always leak? the 100-year journey to solve it"). It's a story with a turn, not
a parts list.

**Why it's mesmerizing (retention mechanics).**
- **Open loop in frame 1:** a familiar object and "you use this every day and have no idea what's inside".
- **The reveal is spatial:** a section slice, an exploded view and an X-ray pass give one new visual state every 2–3 s
  with no cuts, so there's nothing to swipe on.
- **Slow-motion mechanical sync** (pins lining up, teeth meshing) is the same pleasure as a satisfying sim, but it pays
  off with understanding.
- **The ending loops naturally:** re-assemble and close, back to the object as it looked in frame 1.

**Evidence of demand.**
- Infinite Desk: 2.40M Q3 median, ×5.0 on Q2, 17.5M and 16.8M hits, created Feb 2026.
- Under Six Minutes Studio: 945k Q3 median on 15.5k subscribers; 26.5M for "underwater welding"; created May 2026.
- Zack D. Films: 8.3M Q3 median. His mechanism and patent Shorts ("Hair Harvest Drain System" 35.6M) are among his
  biggest.
- Q3 API search "how it works": top-10 mean 9.5M, 5 small breakouts.

**Crowding: the sweet spot, but it's filling up.**
- *Not crowded at the top:* only 5 of the top 50 "how it works" Shorts are from 1M+ channels (science explained: 20).
  The famous 3D-cutaway creators (Jared Owen, Animagraffs, Matt Rittman) posted 0–1 Shorts in two quarters.
- *Filling fast at the bottom:* four new channels this year, several of them likely AI-assisted (inferred from
  their output rate: Mr Decode posted 84 Shorts in about 10 weeks). Their medians are small (5–9k).
- **Our edge is precision:** an accurate, physically correct mechanism (pins at the shear line, a real escapement)
  against approximate AI-made motion. Our hard rules already demand this: sourced facts and typeset labels.

**Synergy with our pipeline.**
- **Three.js is already in the engine** (method B, `flight.js`).
- **Section cuts are built in:** Three.js has native clipping planes, which give a live section cut for free.
- **Exploded views are pure functions of `t`:** each part's offset along an axis.
- **X-ray is a material swap** (edges plus transparency).
- **Mechanical parts are procedural geometry** (cylinders, helices, gear teeth, springs) built in code, so they're
  deterministic. A growing parts kit (gear, spring, pin, cam, screw thread, ratchet) is what makes episode 10 cheaper
  than episode 1.
- **Hero shots go to the laptop:** Blender EEVEE on the RTX 3060 renders the beauty frames (metal, glass), which are
  composited back into our engine, which typesets every label.
- **Free audio fits:** code-synth mechanical SFX (clicks, ratchets) carry the ASMR layer, with the Kokoro or Fish voice
  on top.
- **Free images** (Nano Banana) are only needed for a period-photo-style intro still, with no text in it.

**Production cost (estimate).**
- Episode 1: 2–3 agent days (the model, the parts kit, the camera language).
- From about episode 5: 1 day.
- Render: CPU Three.js through SwiftShader is slow for 3D (see DECISIONS, 2026-10-06), so long 3D shots are better on the
  laptop GPU or in Blender. Budget 1–3 h of laptop render per Short.
- This is the most expensive of the three. It's also the one a template farm can't copy cheaply.

**Money (estimate, labelled).**
- Shorts: education/tech-adjacent, so at the high end of the Shorts range. My estimate is $0.10–0.40 per 1,000 views
  (miraflow's tech range; AIR's 3–14% of a $10.22 education long-form RPM gives $0.31–1.43, an upper bound).
- 60–75 s cuts qualify for TikTok Creator Rewards.
- **The real upside is long-form:** Animagraffs' "How a Jet Airliner Works" (19M) and Jared Owen's "What's inside the
  Titanic?" (22M) prove 10-minute cutaways earn education RPMs. That is the long-form path the vision board already
  wants (Blender on the laptop).

**Risks.**
- **Accuracy:** a wrong mechanism is worse than none. Every motion must match a patent drawing or a manufacturer's
  cutaway, cited in the README.
- **Weapons:** firearm mechanisms are the biggest single draw (Glock 94M), but they're advertiser-unfriendly and a
  policy minefield. Exclude them from the bible.
- **Brands:** describe generic mechanisms, never a trademarked product's look.
- **Repetitive-content policy:** low risk if every episode is a different object with a story.
- **Overlap:** some with Zack D. Films' patent Shorts, but they're 3D-character-led and don't cut objects open.

**Three first-episode ideas** (facts to be verified in the research stage):
1. **"Why your key is the only key that opens your door."** A pin-tumbler cutaway: driver and key pins, springs, and
   the shear line lining up as the key slides in. Story: Linus Yale Jr.'s 1860s cylinder-lock patents. Candidate
   source: the Yale patents on Google Patents.
2. **"The zipper took 20 years to work."** Teeth (hook and cup) meshing through the slider's Y-channel in slow motion.
   Story: Whitcomb Judson's 1893 "clasp locker" failed; Gideon Sundback's 1917 "Separable Fastener" patent worked.
   Candidate source: US patent 1,219,881 and Smithsonian Lemelson Center.
3. **"The bend under your sink is the most important invention in your house."** An S/U-trap section cut: the water
   seal holding sewer gas back, then the flush siphon. Story: Alexander Cumming's 1775 S-bend patent. Candidate source:
   UK patent no. 1105 (1775) and the Science Museum.

### 2. Simulations that answer a real question (runner-up)

**The idea.** A 2D/3D physics simulation, made by our engine, that settles a real question on screen:
- 10,000 balls through a Galton board build a bell curve;
- 22 cars on a ring make a traffic jam out of nothing;
- dropped needles estimate π.

Every collision plays a note, through our own code-synth.

**Why it's mesmerizing.**
- **A countdown question:** "will it fill?", "who wins?". Viewers stay to see how it ends.
- **Escalation:** each bounce adds a ball.
- **One note per collision** gives sound that's also a reward.
- **A hard visual payoff** in the last 3 seconds, and a natural loop.

**Evidence.**
- Kawaken 3DCG: 1.54M Q3 median (37.1M top).
- visualizing magic: 740k median. Its *questions*, "Measuring π" (4.0M) and "will the ball evolve?" (6.6M), are among
  its best, and it's made with Python creative coding.
- Satisfying 2D Sims went from nothing (July 2026) to 23.9M views in one quarter.
- On TikTok, "Bounce Ball" has 65.8M posts.
- The science-sim long-form creators (Primer, 24M on one video; Sebastian Lague; Pezzza's Work) post **no Shorts**:
  "sims that explain" is empty on Shorts.

**Crowding.**
- The pure satisfying-sim market is **crowded and flat**: the median channel ratio is 0.62, against the 0.5 neutral line.
- Templates sell the format on TikTok.
- The question-answering version is the gap.

**Synergy: the best of any option.**
- It's 2D canvas, deterministic by construction (a fixed-step Verlet integrator with a seeded `rnd()`).
- Note-per-collision audio comes from `audio.py`.
- No images are needed at all.
- Under an hour of agent time per episode once the physics kit exists.

**Money (estimate).** Lowest of the three:
- the audience skews young (AIR: Kids & Teens at $0.33 long-form);
- the loops are under 60 s, so they don't qualify for TikTok Creator Rewards;
- weak subscriber conversion.

**Risks.**
- **Inauthentic-content policy** if it drifts into variations of one template.
- **Made-for-kids** classification.
- **Photosensitivity warnings** (fast flashing).
- **IP:** Pokémon or Minecraft skins are what competitors use. We wouldn't.

**Three first-episode ideas.**
1. **"10,000 balls, one shape: why everything is a bell curve."** A Galton board (Francis Galton,
   *Natural Inheritance*, 1889).
2. **"The traffic jam with no cause."** 22 cars on a circular track (Sugiyama et al., *New Journal of Physics*, 2008).
3. **"Throw needles on the floor, get π."** Buffon's needle (Buffon, 1777).

**A cheap test.** This lane needs no new 3D work. A pilot would take about a day, and it could run as a recurring
"satisfying beat" inside channel 1 before getting its own channel.

### 3. The true scale of things, in 3D

**The idea.** Real-data camera journeys:
- a descent to the bottom of the Challenger Deep;
- every planet lined up between the Earth and the Moon;
- the Chicxulub asteroid next to Everest.

**Why it's mesmerizing.** A continuous dolly with a depth or size counter: "keep going, it gets bigger". The thing
being measured is the hook, and the scroll is the pacing.

**Evidence.**
- Big long-form demand: Jared Owen's "How big is the Solar System?" (28.7M), RED SIDE's "Tsunami Height Comparison"
  (13.3M), MetaBallStudios' "Microorganisms" (7.0M).
- Q3 "space" search: 1.08M median with 20 small breakouts.
- But **the major comparison channels posted no Shorts in Q2–Q3 2026**. The only active comparison Short-maker with
  scale is King Animations (8.6M median, countryball maps), which is our Border Quirks and Leader Flags territory.

**Crowding.** An open Shorts gap, but space Shorts are dominated by big channels (15 of 50 are 1M+), and the drawn
channel already does "you vs Jupiter".

**Synergy.**
- Three.js with real data (NASA and NOAA figures, NASA public-domain planet textures, GEBCO bathymetry).
- Our map stack is reusable for Earth shots.

**Cost.** Moderate: 1 day per episode.

**Money.** Education/space, mid-range (estimate).

**Risks.** Overlap with the drawn channel and Leader Flags (comparison formats). Scale numbers have to be exact and
labelled ("average Earth–Moon distance").

**Three first-episode ideas.**
1. **"Falling to the bottom of the ocean takes this long."** A descent to Challenger Deep, about 10,900 m (NOAA and
   2021 survey figures, to be confirmed).
2. **"Every planet fits between the Earth and the Moon."** At the average distance only, and the label says so (NASA
   planetary fact sheets).
3. **"The rock that ended the dinosaurs, next to Everest."** Chicxulub impactor, ~10 km (Alvarez et al. 1980 and later
   estimates).

## 5. Considered and not recommended

| Option | Why not |
|---|---|
| Pure satisfying sims (no facts) | Flat (0.62), templated, lowest RPM, highest inauthentic-content risk; no facts, so no fit with a fact-checked studio |
| Music / rhythm visualisation | DoodleChaos and Math Floyd posted no Shorts in two quarters; the active one's median is 22k |
| Marble run / domino / Rube Goldberg | 6 of 7 benchmark channels are 1M+ and still sit at a ~99k median; real physical footage wins there |
| Timelapse of a place | 20k median; overlaps Border Quirks |
| Math visual proofs | Narrow (20k median for the specialist channel) |
| X-ray inside the body | Gut Gang's lane |
| Ocean / thalassophobia horror | Mostly fiction; little data; folded into option 3 as a real-data descent |
| Parked ideas (AI time-travel POV, a paid-video-model channel, AI news, word origins) | No new evidence; still parked as in `channel-selection.md` and the vision board |

## 6. What to decide

1. **Approve the lane:** hidden mechanisms in 3D, working name *Inside Job*, or name it yourself.
2. **First pilot:** the pin-tumbler lock, 60–75 s, with Three.js section cuts and one Blender hero shot on the laptop.
   It gets judged on the dashboard like the other pilots.
3. **Optional, one day:** a Galton-board simulation Short as a cheap A/B against the 3D pilot, to see which grammar
   the feed rewards for us.

## Sources

**YouTube data**
- Data API pulls (channels, playlistItems and videos), 7 Oct 2026. Raw pull kept out of the repo by the brief; the
  method above re-runs it.
- `docs/research/sketch-niche/yt-scan-2026-10-07.json`
- `docs/research/sketch-niche/yt-trend-q2-q3-2026.json`
- Channel and video links in the tables above.

**TikTok**
- [Bounce Ball discover page](https://www.tiktok.com/discover/bounce-ball?lang=en)
- [Trending Satisfying Videos](https://www.tiktok.com/discover/trending-satisfying-videos)
- [SocialBee, Sept 2026](https://socialbee.com/blog/tiktok-trends-you-cant-miss/)
- [NewEngen, Sept 2026](https://newengen.com/insights/september-tiktok-trends/)
- [Epidemic Sound](https://www.epidemicsound.com/blog/latest-tiktok-trends/)
- [ViralBalls](https://viralballs.com/en)
- [ballsimulator.com](https://ballsimulator.com/en/blog/how-to-create-viral-bouncing-ball-videos/)
- [Postfa.st](https://postfa.st/blog/tiktok-monetization-requirements)
- [Timetopost](https://timetopost.co/blog/tiktok-creator-rewards-requirements-2026/)

**Reels**
- [Zebracat](https://www.zebracat.ai/post/instagram-reels-statistics)
- [SocialPilot](https://www.socialpilot.co/blog/instagram-reels-trends)
- [Lightreel, Oct 2026](https://lightreel.ai/blogs/whats-trending-on-instagram)

**Money**
- [AIR: Shorts vs long-form RPM](https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026)
- [AIR: Shorts RPM by niche](https://air.io/en/air-data-findings/what-is-youtube-shorts-rpm-in-your-niche-in-2026)
- [miraflow](https://miraflow.ai/blog/youtube-shorts-rpm-2026-real-ranges-by-niche)

**Policy**
- [Social Media Today (2025)](https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/)
- [Flocker](https://flocker.tv/posts/youtube-inauthentic-content-ai-enforcement/)
- [noobclaw](https://noobclaw.com/blog/youtube-inauthentic-content-policy-2026/)
- [lenspov](https://lenspov.com/articles/youtube-ai-content-demonetization-2026)

**Creators**
- [Tom's Guide forum](https://forums.tomsguide.com/threads/getting-decent-reach-on-shorts-but-0-sub-conversion-anyone-figured-this-out.589078/latest)

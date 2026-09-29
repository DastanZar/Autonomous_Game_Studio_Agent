# How the three channels were chosen (2026-09-28)

This is the decision trail, from your first ideas to the three channels, with the evidence at each step.
- **Raw data** (every channel, its median, and the scripts to re-run it): `docs/research/shorts-niches-2026-09.md`
- **The plan page:** `docs/plan/launch-plan.html` ([artifact](https://claude.ai/artifact/CmYPyPy4XHE9L76Hut1veD))
- **The word-for-word conversation:** `docs/log/2026-09-28-studio-chat.md`, 06:26–07:26 UTC

## Method

- `yt-dlp` pulled each channel's **last 30 Shorts** (and last 30 long videos) on 2026-09-28.
- For each channel I recorded subscribers, the **median Shorts views** and the top Short.
- The median is the yardstick, not the top video, because it's what a typical upload gets.
- About 60 channels were measured in two passes:
  1. **Pass 1:** your 5 ideas.
  2. **Pass 2:** an independent scan of about 40 more channels across niches you hadn't named.
- **Limits:**
  - YouTube rounds the counts.
  - A few channels have very few Shorts (Mustard 6, Half as Interesting 3).
  - One TikTok figure (a Chernobyl POV with 21.8M views) comes from a blog and was **not verified**.

## Step 1: your five ideas, ranked by the data

| Rank | Your idea | Verdict | Evidence (Shorts median) |
|---|---|---|---|
| 1 | Continue our style: quirky true stories, maps, history | **Strongest fit**: proven, and our pipeline already makes it | Knowledgia **1.55M** (closest to us); Mustard 2.15M (6 Shorts); Johnny Harris 0.49M; Armchair Historian 0.18M |
| 2 | Science explainers | **Highest ceiling**, but the giants are host-led or heavy 3D | Zack D. Films **3.5M** (faceless 3D); Veritasium 2.6M and Cleo Abram 1.5M (both host-led); Kurzgesagt 1.2M |
| 3 | Human-like characters retelling history (Cuban Missile Crisis, Chernobyl) | **Real, but blocked**: needs paid video models, and the key has $0 credit | Chloe VS History 0.18M. Cuban Missile Crisis Shorts are nearly empty (best found: 7.7k), which is an opening for later. |
| 4 | Mascot character explaining topics | **Weak on its own**: the topic sells, not the mascot | Life Noggin: 3.1M subs but a Shorts median of about 10k |
| 5 | Character-based daily AI news (top 10) | **Weakest** | Most AI-news medians are 5k–40k. Fireship (1.45M) is the exception because it's joke-first, not a list. |

**Blender (your question #1):**
- Blender 5.0 works in the container: 4.7 s per frame with Cycles, 0.8 s with Workbench, no GPU.
- A full-HD 45-second Short would take about **2–6 hours** of CPU.
- Decision: use Blender for occasional 3D shots or later long-form, not as the main Shorts engine.
  Jared Owen's long-form gets 22M views, but his Shorts median is only 70k.

## Step 2: independent scan ("what else is out there?")

The main finding: **the format decides views, not the topic.** Psych2Go has 13.2M subs but a 50k Shorts median.
SolarBalls has 2.25M subs and a **750k** median.

**New niches that pull views:**

| Niche | Benchmark | Shorts median | Top Short |
|---|---|---|---|
| Science told by objects as characters | **SolarBalls** | **750k** | [A Commercial Plane vs the Solar System](https://www.youtube.com/shorts/ELVK6PfDAbM) (10M) |
| Country data rankings | **Opera_cb** (190k subs) | **690k** | [World GDP Ranking](https://www.youtube.com/shorts/cpuyhrcFIus) (5.4M) |
| Word origins | RobWords | 310k | ["Ye Olde…"](https://www.youtube.com/shorts/aSg9oXeknIw) (1.4M) |
| Aviation oddities | Mentour Now! | 200k | [FLAT Airplane Engines?!](https://www.youtube.com/shorts/6h6-Zs0aztI) |

**Niches that look big but don't work on Shorts:**

| Channel | Niche | Shorts median |
|---|---|---|
| Psych2Go | Psychology | 50k |
| How Money Works | Finance | 90k |
| Economics Explained | Finance | 40k |
| MagnatesMedia | Finance | 70k |
| Fascinating Horror | Disasters over stills | 50k |
| Plainly Difficult | Disasters over stills | 40k |
| storybooth | Animated true stories | 20k |

AI fruit drama, riddles, animal facts and mystery Shorts mostly turned up channels getting 0–300 views.

**Two facts that shaped the plan:**
- **Shorts pay about $0.01–0.08 per 1,000 views.** Shorts grow a channel; the money comes later from
  long-form, sponsors and licensing.
- **YouTube's "inauthentic content" policy (since 15 July 2025)** demonetizes mass-produced template videos.
  - So production is automated, but the hook is not.
  - Every episode needs a real, sourced surprise, and you approve topics.

## Step 3: the three picks (you asked for 3 channels, 3 niches, 3 styles, highest view pullers)

The rule: take the closest benchmark's median, then keep only what our pipeline can make **without paid video models**.

| | Channel (working name) | Niche / style | Benchmark median | Why this and not the neighbour |
|---|---|---|---|---|
| A | **Why the Map Looks Like That** (why-map) | Strange geography and history as a "why", in paper cutout on real maps | Knowledgia **1.55M**; Mustard 2.15M | It's our proven style. The Emu War can be episode 1. |
| B | **The Body Cast** (body-cast) | Organs, cells and microbes as a recurring cartoon cast | SolarBalls **0.75M**; Kurzgesagt 1.2M | **Body over planets**, because SolarBalls owns planets. The body is Zack D. Films' top theme and has no cast yet. |
| C | **Ranked** (ranked) | Animated country rankings from real datasets (World Bank, FAO, UN) | Opera_cb **0.69M** | The most automatable niche. Opera_cb re-edits other creators' work; ours is original and sourced. |

**Parked:**
- Zack D.-style 3D "what happens if" (the biggest niche, 3.5M median): needs rigged 3D humans or paid video models.
  It becomes **channel 4 once there's credit**.
- AI time-travel history POV: needs paid video models.
- Daily AI news: weak numbers, and daily fact-checking is too costly.
- Word origins and aviation: good backups.

## Step 4: how views are earned (organic only)

- **How distribution works:** YouTube tests each Short on a small audience, then widens it based on
  **viewed vs swiped away** and **percent watched**. Since March 2025, replays count as views.
- **What we control:**
  - motion and an on-screen question in the first second;
  - 25–40 s runtime;
  - a looping ending;
  - one niche per channel;
  - a recurring series or cast;
  - a daily upload per channel, with anniversary and news hooks;
  - cross-posting to TikTok and Reels.
- **What we won't do:** paid promotion, or template spam.
- **Monetisation bar:** the YouTube Partner Program needs 1,000 subs and 10M Shorts views in 90 days.

## Still open from this step

- Your yes or no on the body cast vs another cast. You haven't explicitly confirmed it; we have been proceeding with organs.
- Channel names and handles, and creating the three YouTube channels.
- A YouTube Data API OAuth client, for hands-off publishing.
- Optional TikTok and Instagram accounts, for cross-posting.

# Which country has the most nuclear weapons? Not America.: discussion and decisions

Folder: `episodes/ranked/most-nuclear-weapons`. Built by `studio/tools/notes.py`.

## Notes

_(add notes about this video here)_

<!-- everything below this line is rebuilt by studio/tools/notes.py; write by hand above it -->

## From the chat logs

_Source: docs/log/2026-09-28-studio-chat.md_

### 🧑 User · 2026-09-28 06:26 UTC

I want to try a few different things, can you use blender? thats question #1
i want you to research the top niches on yt shorts that are working today that we can make videos on, realistically
my ideas : science explainers, human like characters to re-tell historic events like cuban missile crisis story or chernobyl, continuing the style of videos we have done 2 on already emu and people who can lock the internet, a charcter based explainer - like generating an animated character that goes and explains some topic,similarly character based ai news updater - sort of like whats the top 10 today in the world on ai

these are all quite rough ideas, i dont want any generation as of now, just planning between me and you, come back with research with exact channel names and videos and i will give them a watch and see their metrics, also look into my ideas and see which ones can pull most views if all, and see whos doing it today or even close ot us and lets see thier channels and videos

#### Claude · 2026-09-28 06:35 UTC

## 1. Can I use Blender?

Yes. I installed it here and ran test renders (Blender 5.0, as a Python module).

- **Speed:** the machine has no graphics card, only 4 processor cores. A test frame at half-HD size took 4.7 s with the slower, higher-quality renderer (Cycles) and 0.8 s with the fast preview renderer. My untested estimate for a full-HD 45-second short is **about 2–6 hours of rendering**.
- **Best use:** 3D shots (a reactor cutaway, a missile's flight path) dropped into our existing engine, which still does all the text. For example, one Blender [Chernobyl simulation](https://www.youtube.com/watch?v=WMr3-ShzB08) has 9.5M views on a 100k-subscriber channel.
- **Caveat:** it has to be reinstalled in each new session, which takes about a minute.

## 2. Your ideas, ranked by the data

I pulled real numbers with a download tool, `yt-dlp`: each channel's **median** views over its last 30 Shorts, which is what a typical upload gets. The full tables are in `docs/research/shorts-niches-2026-09.md` (pushed to `main`).

**1. Our current style (quirky true stories, maps, history): strongest fit.** It's proven and our pipeline already makes it.
- **Knowledgia** (2.2M subs, **1.55M median**): [Why wasn't Portugal conquered by Spain?](https://www.youtube.com/shorts/O0WT8kqz31g) (10M). This is the closest channel to us.
- **Mustard** (2.15M median, only 6 Shorts in the sample): [Flying aircraft carriers actually existed](https://www.youtube.com/shorts/i2ySKZo2eQ0) (4.8M).
- **Johnny Harris** (0.49M median): [How a nuclear bomb really works](https://www.youtube.com/shorts/_FsJJGlT4uo) (8.5M).
- **Half as Interesting:** [How Blink 182 violated the Geneva Conventions](https://www.youtube.com/shorts/_f0GXNp38ko) (3.2M).
- **The Armchair Historian** (0.18M median): [Why did soldiers fight in lines?](https://www.youtube.com/shorts/uVq2WFK9rjY) (2.8M).

**2. Science explainers: highest ceiling.** The biggest numbers here, but most of the giants depend on a host or heavy production. The model for us is Zack D. Films: faceless 3D, which is where Blender fits.
- **Zack D. Films** (28.6M subs, **3.5M median**): [What to do if your car sinks](https://www.youtube.com/shorts/p832whe8hrI) (9.9M).
- **Kurzgesagt** (1.2M median): [The deadliest thing in your kitchen](https://www.youtube.com/shorts/2cK8l5Yg5w8).
- **Cleo Abram** (1.5M median) and **Veritasium** (2.6M median) are both host-led.

**3. Human-like characters retelling history: real, but blocked for now.** It needs paid video models, and our OpenRouter key has $0 credit.
- **Chloe VS History** is AI time-travel vlogs (407k subs, 0.18M median): [I tried to warn the people of Pompeii](https://www.youtube.com/shorts/a4MmclH1JP0) and a [Titanic vlog](https://www.youtube.com/watch?v=HZRdKlOHogk) (2.8M).
- The format is bigger on TikTok. A Chernobyl-worker POV reportedly has 21.8M views, but that figure is from a blog and I didn't check it.
- **Opening:** Cuban Missile Crisis Shorts on YouTube are almost empty. The best one I found has [7.7k views](https://youtube.com/shorts/YYIx1NFYtv0). Chernobyl has proven demand: the long-form videos get 6M+.

**4. A mascot character explaining topics: weak on its own.**
- **Life Noggin** has a mascot and 3.1M subscribers, but its Shorts median is **about 10k**. The topic sells the video, not the character.
- **Neural Viz** (original AI characters) built a cult following (240k subs), but it's comedy fiction, not explainers.

**5. Character-based daily AI news: weakest by the numbers.**
- Most AI-news Shorts medians sit between under 5k and 40k: Matt Wolfe, Matthew Berman, Wes Roth, AI Daily Brief, AI Search.
- The one breakout is **Fireship** (1.45M median): [Why do computers suck at math?](https://www.youtube.com/shorts/s9F8pu5KfyM) (8.7M). It works because it's jokes and developer culture, not a top-10 list.
- A daily format also means fact-checking every day on a voice limited to 50 free requests a day.

**Also worth knowing:** cheap copycat channels get almost nothing. There's even a stick-figure Emu War Short with 7 views. Automating a template won't work in this market; quality and a real hook are what win.

## My recommendation

Merge ideas 1 and 2 into one channel of weird true stories and weird science in our paper-cutout style, with Blender 3D shots for moments like a reactor cutaway. Knowledgia and Zack D. Films are the benchmarks to watch. Keep idea 3 for when there's credit for paid video models. Drop the daily AI news format unless we do it Fireship-style: weekly and joke-first.

Sources: [autoclips on the history POV trend](https://www.autoclips.app/ai-history-pov-videos), [Wired profile of Neural Viz, via Mediagazer](https://mediagazer.com/251008/p1). Everything else comes from YouTube's own numbers, pulled 2026-09-28.


## Review rounds (review.json)

### Round 1
```json
{
 "at": "2026-10-07T20:06:13Z",
 "reviewer": "worker (Leader Flags batch 2026-10-07), round 1: contact sheet at landed moments plus a later still per scene (numbers were still rolling at several landed moments)",
 "frames": [
  0.05,
  3.72,
  6.56,
  7.9,
  11.3,
  13.1,
  16.58,
  17.6,
  20.84,
  22.2,
  23.44,
  25.9,
  27.32,
  30.2,
  31.63,
  33.5,
  35.25,
  37.3,
  39.66,
  41.0,
  42.18
 ],
 "defects": [
  {
   "t": 11.3,
   "issue": "s_small: two rows sit at the top with an empty lower half; move the short lists down toward the centre",
   "fixed": true
  },
  {
   "t": 16.58,
   "issue": "s_south: four rows hug the top; centre them",
   "fixed": true
  }
 ]
}
```

### Round 2
```json
{
 "at": "2026-10-07T20:06:31Z",
 "reviewer": "worker, round 2: stills after the fix, one or more per scene; globe checked against each spoken place (US, all nine, KP then IL, PK then IN, GB then FR, CN, US, RU, RU+US, US then RU); every number checked against data/sipri_world_nuclear_forces_2026.csv",
 "frames": [
  0.05,
  3.72,
  7.9,
  13.1,
  17.6,
  22.2,
  25.9,
  30.2,
  33.5,
  37.3,
  41.0,
  42.18
 ],
 "defects": []
}
```

### Round 3
```json
{
 "at": "2026-10-07T20:24:25Z",
 "reviewer": "worker, round 3 (after production): fresh contact sheet plus 9 frames pulled from out/most-nuclear-weapons.mp4 with ffmpeg and the thumbnail; no layout defects; North Korea is small on the globe and is marked by the pulsing ring",
 "frames": [
  0.05,
  3.72,
  6.56,
  11.3,
  16.58,
  20.84,
  23.44,
  27.32,
  31.63,
  35.25,
  39.66,
  42.18
 ],
 "defects": []
}
```

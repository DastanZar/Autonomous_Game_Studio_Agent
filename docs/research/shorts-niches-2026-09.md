# YouTube Shorts niche research (2026-09-28)

These are planning notes only. Nothing has been generated yet.

**Method:** `yt-dlp` pulled each channel's last 30 Shorts and last 30 long videos. For each I recorded the
subscriber count, the **median** Shorts views and the top Short. The median matters more than the top
video, because it's what a typical upload gets. Numbers are a snapshot from 2026-09-28 and YouTube rounds
them. The scripts are at the bottom so this can be re-run.

## 1. Blender in this container

| Engine | Works? | Test render (540×960 default scene) |
|---|---|---|
| Cycles (CPU) | Yes | 4.7 s/frame at 16 samples |
| Workbench | Yes | 0.8 s/frame |
| EEVEE | Yes, but only via Mesa software GL (`apt install libegl1 libegl-mesa0 libgl1-mesa-dri`) | 45 s for the first frame, including shader compile |

- **Setup:** `pip install bpy` (Blender 5.0.1, a 370 MB wheel, Python 3.11). The container has no GPU, 4 CPUs and 15 GB RAM.
- **Render time:** a 45 s Short is about 1,350 frames. At an estimated 5–15 s/frame at 1080p that's roughly
  2–6 hours of CPU. Use Blender for 3D *shots* (a reactor cutaway, a missile's flight path) and
  composite them in the existing JS engine, which still typesets all text.
- **Precedent:** Higgsino physics' Blender simulation
  [Chernobyl Accident – Simulation only](https://www.youtube.com/watch?v=WMr3-ShzB08) has 9.5M views on a
  100k-subscriber channel.

## 2. Channel data by idea

### A. Our current style (quirky true stories, maps, "why does X exist")
| Channel | Subs | Shorts median | Top Short |
|---|---|---|---|
| Knowledgia | 2.2M | **1.55M** | [Why wasn't Portugal Conquered by Spain?](https://www.youtube.com/shorts/O0WT8kqz31g) (10M) |
| Mustard | 2.39M | 2.15M (6 Shorts) | [Flying Aircraft Carriers Actually Existed](https://www.youtube.com/shorts/i2ySKZo2eQ0) (4.8M) |
| Johnny Harris | 7.97M | 0.49M | [How a nuclear bomb really works](https://www.youtube.com/shorts/_FsJJGlT4uo) (8.5M) |
| RealLifeLore | 7.94M | 0.23M | [Why Canada is WAY Further South Than You Think](https://www.youtube.com/shorts/3wFAMwKi3O0) (3.7M) |
| The Armchair Historian | 2.53M | 0.18M | [Why did Soldiers Fight in Lines?](https://www.youtube.com/shorts/uVq2WFK9rjY) (2.8M) |
| Half as Interesting | 2.94M | ~1M (3 Shorts) | [How Blink 182 violated the Geneva Conventions](https://www.youtube.com/shorts/_f0GXNp38ko) (3.2M) |
| The Infographics Show | 15.5M | 0.34M | [What Happens When You Are Shot](https://www.youtube.com/shorts/V15wrmD5VFs) (2.9M) |
| Vox | 12.7M | 0.01M | Shorts don't work for them |

### B. Science explainers
| Channel | Subs | Shorts median | Top Short |
|---|---|---|---|
| Zack D. Films (3D animated, faceless) | 28.6M | **3.5M** | [What To Do If Your Car Sinks?](https://www.youtube.com/shorts/p832whe8hrI) (9.9M) |
| NileRed | 10.9M | 7.55M | [Making a block of perfectly clear ice](https://www.youtube.com/shorts/t4klesoNObo) (115M) |
| Veritasium | 21.3M | 2.6M | [The Google Interview Question Everyone Gets Wrong](https://www.youtube.com/shorts/kP7l1agsTzQ) (11M) |
| Cleo Abram | 8.78M | 1.5M | [The Sun Isn't The Center of the Solar System](https://www.youtube.com/shorts/x585QtnQ8GM) (7.5M) |
| Kurzgesagt | 25.6M | 1.2M | [The Deadliest Thing in Your Kitchen](https://www.youtube.com/shorts/2cK8l5Yg5w8) (4.6M) |
| The Action Lab | 5.16M | 0.58M | [The Fastest Heat Conductor](https://www.youtube.com/shorts/ZEGazGMEhtw) (12M) |
| MinutePhysics | 5.98M | 0.20M | [When 2 + 2 = 3.999999999…](https://www.youtube.com/shorts/0fV8kYoGDNM) |
| SciShow | 8.42M | 0.19M | |
| MinuteEarth | 3.33M | 0.13M | [The Coyote Paradox](https://www.youtube.com/shorts/RYCVihgO3g8) (1.5M) |

### C. Human-like characters retelling history (AI "time-travel POV")
| Channel | Subs | Shorts median | Top |
|---|---|---|---|
| Chloe VS History | 407k | 0.18M | [I time travelled to the Aztecs in 1520](https://www.youtube.com/shorts/bD_j-v_ogN8) (1M); [I tried to warn the people of Pompeii](https://www.youtube.com/shorts/a4MmclH1JP0); long: [Titanic 1912 vlog](https://www.youtube.com/watch?v=HZRdKlOHogk) (2.8M) |
| Amit Raveli E. Tamer | 50k | low | [AI interviews the people onboard the Titanic](https://www.youtube.com/shorts/SA6fUs3dsRU) (854k) |

- On TikTok the format is bigger: per [autoclips](https://www.autoclips.app/ai-history-pov-videos), @timetravellerpov's
  Chernobyl-worker POV passed 21.8M views. I didn't verify this myself.
- **Cuban Missile Crisis Shorts on YouTube are nearly empty.** The best result was
  [Sam Atkins – History in a Minute](https://youtube.com/shorts/YYIx1NFYtv0) with 7.7k views.
- **Chernobyl long-form has proven demand:** The Infographics Show
  [hour by hour](https://www.youtube.com/watch?v=2uJhjqBz5Tk) has 6.1M views and RFE/RL
  [How It Happened](https://www.youtube.com/watch?v=f5ptI6Pi3GA) has 6.7M.

### D. Character/mascot explainer
| Channel | Subs | Shorts median | Note |
|---|---|---|---|
| Life Noggin (Blocko mascot) | 3.13M | **~10k** | The mascot alone doesn't carry Shorts |
| Neural Viz (original AI alien characters) | 240k | 0.12M | Cult following; comedy fiction, not explainers ([Wired profile via Mediagazer](https://mediagazer.com/251008/p1)) |
| Kurzgesagt (birds) | 25.6M | 1.2M | The mascot is a style element; the topic sells the video |

### E. AI news Shorts
| Channel | Subs | Shorts median |
|---|---|---|
| Fireship | 4.28M | **1.45M**. Jokes and dev culture, not a news list. [Why do computers suck at math?](https://www.youtube.com/shorts/s9F8pu5KfyM) (8.7M) |
| Matthew Berman | 640k | 0.03M |
| Theo (t3.gg) | 570k | 0.04M |
| Matt Wolfe | 1.01M | 0.01M |
| Wes Roth | 330k | 0.01M (one 5.3M outlier: [HeyGen](https://www.youtube.com/shorts/rAWB8-qiVQo)) |
| bycloud | 230k | 0.01M |
| The AI Daily Brief | 590k | <5k |
| AI Search | 750k | <5k |

**Low-effort clones** ([Stickstory](https://youtube.com/shorts/9tn-6v_6-xM), MiniGeoTales, History Lost the Plot,
and a stick-figure Emu War Short) get **single- or double-digit views**. The faceless template market is
saturated; quality and a real hook are what separate a channel from them.

## 3. Scripts
```bash
pip install yt-dlp
# channel: last 30 shorts, flat
yt-dlp --flat-playlist --playlist-end 30 -J "https://www.youtube.com/@HANDLE/shorts"   # entries[].view_count, channel_follower_count
# search, shorts only: filter entries with duration <= 75
yt-dlp --flat-playlist -J "ytsearch60:QUERY"
```

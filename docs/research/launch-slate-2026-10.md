# Launch slate: 12 Shorts, 4 per channel (2026-10-06)

## How the topics were picked (data, not guesses)

1. **Broad scout.** `studio/tools/topic_scout.py <channel>` ran 10 niche searches per channel through the YouTube Data API:
   Shorts only, English, published in the last 16 months, ordered by views. That gave about 440 videos per channel
   with views, likes, comments and the channel's subscriber count. Raw data and top-40 tables are in
   `docs/research/topics/<channel>-2026-10-06.{json,md}`.
2. **Outlier score** = views / subscribers. A Short with 10M views on a 5k-subscriber channel means the topic carried
   it. That is the signal for a brand-new channel with no audience.
3. **Shortlist check.** For each candidate, the top-25 Shorts on that exact topic since mid-2024: the top result
   shows the ceiling, the median shows how reliably the topic performs. Data is in
   `docs/research/topics/shortlist-check-2026-10-06.json`.
4. **Filters:** every claim must be sourceable, the topic must suit the channel's picture method (maps for Border
   Quirks, organ characters for Gut Gang, ranked data for Leader Flags), and it must suit a US/UK audience (highest
   ad rates).

| Channel | # | Topic | Evidence (top Short / median of top 25 since mid-2024) | Series |
|---|---|---|---|---|
| Border Quirks | 1 | Point Roberts: the US town whose only road goes through Canada | 4.0M / 0.20M ("U.S City Built in Wrong Country"); built, A cut | why |
| Border Quirks | 2 | The Pig War: the US and Britain nearly went to war over a pig (1859) | 14.5M / 0.85M | the_time |
| Border Quirks | 3 | Why Chile is so long and thin | 31.9M / 0.34M; a 9k-sub channel got 5.9M on it | why |
| Border Quirks | 4 | Russia sold Alaska for about 2 cents an acre | 30.7M / 1.28M | the_time |
| Gut Gang | 1 | What happens inside you after you eat (made as 'your lunch travels 9 metres') | 103M / 7.0M, the strongest topic in the whole scout | what_if |
| Gut Gang | 2 | ~~What happens after you swallow a pill~~ → **Does swallowed gum stay in you for 7 years?** (same 'swallow' demand; the pill story had no quotable source) | 35.2M / 2.7M | what_if |
| Gut Gang | 3 | Why your stomach doesn't digest itself | 40.6M top ("How strong is stomach acid") | why |
| Gut Gang | 4 | ~~What happens in your brain when you learn something~~ → **Your brain: 2% of your weight, 20% of your energy** (brain-facts demand, sourced) | 80.9M / 6.4M (noisy query) | day_in_life |
| Leader Flags | 1 | Countries with the most World Cup titles (after 2026) | 44.9M / 3.76M | ranking |
| Leader Flags | 2 | Countries with the most islands | 50.1M / 3.44M | ranking |
| Leader Flags | 3 | US states bigger than countries by GDP | 7.8M / 0.66M; US-centric, so high ad rates | versus |
| Leader Flags | 4 | Countries with the most time zones | 31.8M / 0.38M | ranking |

**Rejected:**

| Topic | Why not |
|---|---|
| Øresund bridge-tunnel | median 0.08M |
| Baarle-Nassau | median 0.05M |
| Liechtenstein's army | median 0.04M |
| Northwest Angle | median 0.03M (one viral hit, then nothing) |

## When to publish (best ad rates and engagement)

- **Days:** Tuesday to Thursday carry the highest CPMs; Wednesday is best. Weekends run 10–25% lower.
- **Time:** US peak is 12–3 pm and 7–10 pm ET. Shorts published 2–3 hours before the peak do best in their first
  24 hours, so we publish at about 11:00 ET (15:00 UTC while the US is on daylight time, 16:00 UTC after 1 Nov).
- **Season:** October to December Shorts RPMs run 50–100% above January to March, so launching now catches Q4.
- **Caveat:** no channel earns until it joins the YouTube Partner Program (1,000 subscribers plus 10M Shorts views
  in 90 days). Early on, timing matters for engagement and reach, not money.
- **Cadence:** the bible says 3–4 a week per channel while calibrating. The channels stagger by an hour so they
  never publish at the same minute: Border Quirks 11:00, Gut Gang 12:00, Leader Flags 13:00 ET.

| Week | Tue | Wed | Thu |
|---|---|---|---|
| 13–15 Oct | BQ1, GG1, LF1 | BQ2, GG2, LF2 | BQ3, GG3, LF3 |
| 20 Oct | BQ4, GG4, LF4 | | |

## Publishing path (the blocker)

Our Google Cloud project hasn't passed YouTube's API audit (backlog `yt-audit`). Uploads through the API from an
unaudited project are locked private, can't be appealed, and never go public, even with `publishAt`. Until the
audit passes:
- the 12 are uploaded by hand in YouTube Studio with the schedule above (each video's title, description, file and
  time are in the dashboard's publish kit);
- or we wait for the audit and let `publish.py` schedule them.

The API's upload cost dropped to about 100 units in December 2025, so once audited all 12 fit in one day's quota.

## Sources
- [YouTube Data API: videos.insert (unverified projects are restricted to private)](https://developers.google.com/youtube/v3/docs/videos/insert)
- [Clipember: upload locked to private after using an API tool](https://clipember.com/guides/youtube-upload-comes-out-private)
- [Phyllo: YouTube API quota 2026](https://www.getphyllo.com/post/is-the-youtube-api-free-in-2026-quota-limits-costs-when-to-pay)
- [iQfluence: best time to post, 325 campaigns](https://iqfluence.io/public/blog/best-time-to-post-on-youtube)
- [Hopper HQ: best time to post Shorts 2026](https://www.hopperhq.com/blog/best-time-to-post-youtube-shorts/)
- [Buffer: 1.8M videos](https://buffer.com/resources/best-time-to-post-on-youtube/)
- [Fluxnote: when YouTube CPM is highest](https://fluxnote.io/guides/when-is-youtube-cpm-highest)
- [air.io: Shorts RPM 2026](https://air.io/en/monetization/what-rpm-can-you-expect-from-shorts-in-2026)


## As made (2026-10-07)

Final order and times are in `docs/publish-kit-2026-10.md`. Alaska moved to Thu 15 Oct (before Alaska Day, 18 Oct) and Chile to Tue 20 Oct. Leader Flags' first slot went to the World Cup titles (timely: Spain won on 19 July 2026) and the second to states vs countries (US audience, highest ad rates).

# YouTube video A/B testing (announced 23 September 2026)

**What I got wrong first:** my first answer said YouTube can only test thumbnails and titles. That was based on
2024–2025 pages: I searched for "Test & Compare" (the old name) and didn't search for the 2026 event. The user
caught it. Rule from now on: for any platform question, search the latest event and news first ("Made on YouTube
<year>", the YouTube Blog), then the help pages.

## What YouTube announced (primary source)

YouTube Blog, 23 Sep 2026, "Made On YouTube 2026":
> "Creators can now use Studio to get personalized guidance on early drafts, generate video thumbnails that match
> their channel's style, and use video A/B testing to try out up to three different cuts for which holds audience
> attention best."

YouTube Blog, 23 Sep 2026, creator tools post:
> "Coming soon, you'll also be able to test up to three video cuts to see which hook performs best with the new video
> A/B testing feature."

## What secondary reports add (not confirmed by YouTube's own text)

- **Winner metric:** the winner is picked on watch-time share, the same as the title and thumbnail tests (several
  outlets).
- **Rollout:** select creators first, wider availability from 2027 (KDCC recap, talkesport, Gigazine).
- **Shorts:** the reports disagree.
  - 80.lv and Gigazine say it covers Shorts and videos.
  - The KDCC recap says long-form only.
  - YouTube's text doesn't say. Treat it as unknown until it shows up in our Studio.
- **Open questions** (raised by MKBHD, who called it "possibly their worst idea yet"):
  - Do viewers know they're in a test?
  - Do comment timestamps break across cuts?
  - How long can a test run?
  - How different can the cuts be?

## What it means for us

1. **We're built for it.** Our renders are code, so extra cuts are cheap: same voice, same facts, different
   picture or hook. Version A vs B of Point Roberts is exactly a "three cuts" test.
2. **We probably can't use it yet.** It goes to select creators first. Our three channels are new, with no uploads.
   Check YouTube Studio → upload → the A/B testing panel on every upload. When it appears, use it.
3. **Upload by hand.** No YouTube Data API support for test variants has been announced. `publish.py` uploads the
   main cut; the extra cuts are added in Studio.
4. **The metric fits our gates.** Watch-time share rewards retention. That is what our frozen-time and hook rules
   push.
5. **Until then:** test the method across episodes (backlog `method-test`). Alternate A and B, then compare
   swipe-away rate and average percentage viewed.
6. **Make cuts a pipeline output.** Every episode should be able to render up to 3 cuts:
   - **cut 1:** the chosen method;
   - **cut 2:** the other method, or the same picture with a different opening hook (the first 2–3 seconds),
     which is what YouTube's own wording emphasises;
   - **cut 3:** optional, a shorter edit.

   Backlog `ab-cuts`.

## Sources

- [YouTube Blog: Made On YouTube 2026, all announcements](https://blog.youtube/news-and-events/innovation-youtube-era-made-on-viewers-creators/)
- [YouTube Blog: creator tools, Made On YouTube 2026](https://blog.youtube/news-and-events/made-on-youtube-new-tools-power-creation-journey/)
- [80.lv: YouTube adds A/B testing for video cuts](https://80.lv/articles/youtube-adds-a-b-testing-for-video-cuts-expanding-studio-s-toolkit)
- [KDCC: Made On YouTube 2026 recap](https://blog.kdcc.social/made-on-youtube-2026-recap/)
- [Gigazine: YouTube announces A/B testing for videos](https://gigazine.net/gsc_news/en/20260924-made-on-youtube-2026-new-function/)
- [Dexerto: MKBHD raises concerns over video A/B testing](https://www.dexerto.com/youtube/mkbhd-raises-concerns-over-youtubes-new-video-a-b-testing-feature-3411919/)
- [MKBHD on X](https://x.com/MKBHD/status/2102821308178289041)
- [YouTube Help: A/B test titles and thumbnails](https://support.google.com/youtube/answer/16391400?hl=en-GB)

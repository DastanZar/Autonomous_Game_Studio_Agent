# 10 · Analytics (the learning loop)

**Goal:** turn each episode's result into a rule the next topic and script can use.
**Input:** `publish.json`, at least 48 hours after publishing. **Output:** `analytics.json`, plus
one row in `studio/knowledge/performance.jsonl`.

## Why these numbers
YouTube tests each Short on a small audience, then widens it if people keep watching. The signals
are **viewed vs. swiped away** and **average percentage viewed**. Since 31 March 2025, every play and
replay counts as a view; monetization uses **engaged views**. So record both.

## Steps
1. From YouTube Studio (or the Analytics API in phase 3), after 48 h or more, record:
   - `views` and `engaged_views`;
   - `viewed_vs_swiped` (% who chose to view);
   - `avg_pct_viewed`;
   - `subs_gained`.
2. **Write one `lesson`**, in one sentence, that a future worker can act on. For example: "Question
   hooks under 10 words beat statement hooks on this channel (viewed 71% vs 58%)." Compare with the
   channel's previous 10 rows in `performance.jsonl`. With fewer than 10 rows, write
   "baseline: not enough data".
3. Append one JSON line to `studio/knowledge/performance.jsonl`:
   `{"episode", "channel", "series", "hook", "published_at", "views", "engaged_views", "viewed_vs_swiped", "avg_pct_viewed", "subs_gained", "lesson"}`.
4. If a lesson holds across 5 or more episodes, promote it to `studio/knowledge/hooks.md` or
   `style.md`, and say so in your report.
5. Run the check.

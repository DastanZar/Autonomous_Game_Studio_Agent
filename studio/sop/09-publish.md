# 09 · Publish

**Goal:** the episode is live, and its URL is recorded.
**Input:** `package.json`. **Output:** `publish.json` (schema: `schemas/publish.schema.json`).

> **Status:** manual until the YouTube Data API is connected. That needs an OAuth client from the
> channel owner, stored as an environment secret, never in the repo. Until then, a human uploads the
> files named in `package.json` and pastes the URL.

## Steps (manual)
1. Upload `package.video` to the channel **as a Short** (vertical, ≤ 3 min). Set:
   - title, description and hashtags from `package.json`;
   - the audience flag from `made_for_kids`;
   - the altered-content disclosure only if `synthetic_media.realistic` is true.
2. Upload the SRT as captions, and pin the comment.
3. Schedule at the channel's usual slot. Keep one slot per channel per day, so the channel's
   audience learns when to expect it.
4. Cross-post the same master, without a watermark, to each platform in `publishing.cross_post`.
5. Write `publish.json`: `{"youtube": {"url": ..., "published_at": ...}, "others": [{"platform", "url"}]}`.
6. Run the check.

## Steps (API, phase 3)
`studio/tools/publish.py` will perform the steps above with the YouTube Data API
(`videos.insert`, `captions.insert`) and write `publish.json`. It's not built yet.

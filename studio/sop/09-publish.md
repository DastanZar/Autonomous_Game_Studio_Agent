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

## Steps (API)
Setup: `docs/setup/youtube.md` (OAuth client and refresh tokens as environment secrets).
1. `python3 studio/tools/publish.py upload <episode> --dry-run` validates package.json and the files.
2. `python3 studio/tools/publish.py upload <episode>` uploads the video (private, or scheduled with
   `package.schedule`), uploads the SRT captions and writes `publish.json`.
3. Pin the comment by hand; the API can't pin comments.
4. Until the Google Cloud project passes YouTube's API audit, uploads are locked to private. Publish
   them in YouTube Studio, then fix `publish.json`'s `published_at`.

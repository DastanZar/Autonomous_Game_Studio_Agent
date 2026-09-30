# YouTube setup: 3 channels, 1 Google account

## How it works
- **One Google account can own several channels.** Every channel after the first is a *Brand Account*,
  with its own name, handle, subscribers, analytics and monetisation. You switch between them from the
  profile menu. There's no need for three Gmail addresses.
  ([YouTube Help](https://support.google.com/youtube/answer/4642409?hl=en)).
- **Use a new Gmail just for the studio**, not your personal one. That keeps the studio separate if
  you ever sell it, share it or hand it over. You can add your personal account as a **manager** of each
  Brand Account later.
- **Monetisation is per channel.** Each one has to reach the YouTube Partner Program bar on its own.

## Step 1: channels (you, about 15 minutes)
1. Create the studio Gmail. Turn on 2-step verification.
2. youtube.com → profile → *Settings* → *Add or manage your channel(s)* → *Create a channel*, three times.
   Use the final channel names (still an open decision; the working names are in the bibles).
3. For each channel: *YouTube Studio → Settings → Channel → Feature eligibility → verify with a phone
   number*. This unlocks uploads over 15 minutes, custom thumbnails and live streaming. Shorts don't need it,
   but do it once anyway.
4. Upload a banner and an avatar. We can generate these in each channel's style.

## Step 2: API access for automatic uploads (you, about 20 minutes)
1. [console.cloud.google.com](https://console.cloud.google.com) (signed in as the studio Gmail) → new project
   "studio-publisher".
2. *APIs & Services → Library* → enable **YouTube Data API v3**.
3. *OAuth consent screen*: External, app name "studio-publisher", your email; add yourself as a test user.
4. *Credentials → Create credentials → OAuth client ID → Desktop app.* Keep the client ID and secret.
5. Add the ID and secret as **environment secrets** `YT_CLIENT_ID` and `YT_CLIENT_SECRET`, in the Claude Code
   environment settings. **Never paste them into chat or commit them.**
6. On your laptop (it needs a browser), run this once per channel, choosing that channel's Brand Account
   when Google asks:
   `YT_CLIENT_ID=… YT_CLIENT_SECRET=… python3 studio/tools/publish.py auth why-map`
   Store each printed token as an environment secret: `YT_REFRESH_TOKEN_WHY_MAP`,
   `YT_REFRESH_TOKEN_BODY_CAST` and `YT_REFRESH_TOKEN_RANKED`.

## Step 3: the audit (you apply once; Google takes days to weeks)
Google locks every video uploaded through an **unverified** API project to **private**
([videos.insert docs](https://developers.google.com/youtube/v3/docs/videos/insert)). To lift that, submit the
YouTube API Services audit / quota extension form for the project.
- **Until it passes:** the tool uploads privately and you press *Publish* in YouTube Studio, which is one tap
  per video. Or upload manually; `studio/sop/09-publish.md` has both routes.
- **Quota** (since June 2026): 100 uploads a day per project, which is plenty for 3 channels.

## Recommendation
Run weeks 1–2 manually: 3–4 Shorts a week per channel while we calibrate. Watching each one go out is worth it.
Apply for the audit on day 1, so automation is ready when the cadence reaches daily.

## Later
TikTok, Instagram Reels and Facebook Reels cross-posts are in each bible (`publishing.cross_post`). They need
their own accounts, one per channel brand. Automating them is a separate step.

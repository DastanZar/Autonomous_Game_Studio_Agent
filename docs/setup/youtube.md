# YouTube setup: the complete checklist

**What it gets us:** one studio Google account owning the 3 channels, and `studio/tools/publish.py` able to upload
to each one.

**Time:** about 45 minutes of clicks, plus Google's audit, which runs in the background for days to weeks.

**Rule:** passwords, keys and tokens never go into chat or into git. They go into the environment settings (Part E).

Menu names below are as of October 2026; Google renames things now and then. If a label differs, look for
the nearest match. Tick the boxes as you go.

---

## Part A: the studio Google account (5 min)
- [ ] A1. Open **accounts.google.com/signup**. Create an account → *For my personal use*. Pick an address like
      `yourstudio.shorts@gmail.com`.
- [ ] A2. **myaccount.google.com → Security** (left menu) → *How you sign in to Google* →
      **2-Step Verification** → turn it on.
- [ ] A3. Sign out of your personal account in this browser, or use a separate Chrome profile
      (**profile icon at the top right of Chrome → Add**). That way everything below happens as the studio account.

## Part B: three channels (10 min)
Do this once per channel. Names were decided on 2026-10-05 (docs/DECISIONS.md).
- [ ] B1. Open **youtube.com**, signed in as the studio account.
- [ ] B2. Click your **profile picture (top right) → Settings** → under *Your YouTube channel*, click
      **Add or manage your channel(s)** → **Create a channel**.
- [ ] B3. Type the channel name → tick the box → **Create**. The three channels are:
      1. **Border Quirks**, handle `@BorderQuirks`
      2. **The Gut Gang**, handle `@GutGang`
      3. **LeaderFlags**, handle `@LeaderFlags`
      Set the handle at creation if offered, or later in **YouTube Studio → Customisation → Basic info → Handle**.
- [ ] B4. Repeat B2–B3 for the other two. **After the first channel exists the button moves.** Open
      **youtube.com/channel_switcher** directly, in a desktop browser (the phone app can't create extra channels),
      and click **+ Create a channel**. You don't need another Gmail.
- [ ] B5. For each channel, switch to it (**profile picture → Switch account → pick the channel**), open
      **studio.youtube.com**, then **Settings (bottom left) → Channel → Feature eligibility** → under
      *Intermediate features* click **Verify phone number**.
- [ ] B6. While you're in **Settings → Channel → Basic info**, set *Country of residence*. In
      **Settings → Upload defaults**, set the category to **Education** and the language to **English**.

## Part C: the Google Cloud project (10 min)
- [ ] C1. Open **console.cloud.google.com**, signed in as the studio account. Accept the terms if asked.
- [ ] C2. Click the **project picker at the top left** (next to the Google Cloud logo) → **New project** → name it
      `studio-publisher` → **Create**. Then select that project in the picker.
- [ ] C3. In the **search bar at the top**, type `YouTube Data API v3`, open it and click **Enable**.

## Part D: the sign-in client (10 min)
- [ ] D1. Search bar → **Google Auth Platform** (older consoles call it *OAuth consent screen*) → **Get started**.
      - App name `studio-publisher`; support email = the studio address → **Next**
      - Audience: **External** → **Next**
      - Contact email = the studio address → **Next** → agree → **Create**
- [ ] D2. Left menu **Audience** → under *Publishing status* click **Publish app** → **Confirm**. It should say
      **In production**.
      This step matters: in *Testing* mode, Google expires the connection every 7 days.
- [ ] D3. Left menu **Data access** → **Add or remove scopes**. Tick
      `.../auth/youtube.upload` and `.../auth/youtube.force-ssl` (search "youtube") → **Update** → **Save**.
- [ ] D4. Left menu **Clients** → **Create client** → *Application type*: **Desktop app**, name `studio-laptop` →
      **Create**.
- [ ] D5. A box shows the **Client ID** and the **Client secret**. Click **Download JSON** and keep the file
      somewhere private on your laptop. Don't paste either value in chat.

## Part E: give the studio the client (3 min)
- [ ] E1. In this Claude Code session, open the **cloud environment menu in the title bar → Edit**.
- [ ] E2. Add two environment variables, using the values from D5:
      - `YT_CLIENT_ID` = the Client ID
      - `YT_CLIENT_SECRET` = the Client secret
- [ ] E3. Save. New sessions pick them up.

## Part F: link each channel, on your laptop (10 min)
This needs a browser on the same computer that runs the command. Python 3 must be installed: on Windows,
get it from **python.org/downloads** and tick *Add python.exe to PATH* during install.

- [ ] F1. Get the script. In PowerShell:
      ```powershell
      mkdir $HOME\studio; cd $HOME\studio
      curl.exe -L -o publish.py https://raw.githubusercontent.com/DastanZar/Autonomous_Game_Studio_Agent/main/studio/tools/publish.py
      ```
- [ ] F2. In the same window, set the client for this window only (it's forgotten when you close it):
      ```powershell
      $env:YT_CLIENT_ID = "paste the Client ID here"
      $env:YT_CLIENT_SECRET = "paste the Client secret here"
      ```
- [ ] F3. Run `python publish.py auth why-map`.
      1. A browser opens. Pick the **studio account**, then the channel **Why the Map Looks Like That**.
      2. Google says *"Google hasn't verified this app"*. Click **Advanced → Go to studio-publisher (unsafe)**. It's
         your own app, so this is expected.
      3. Allow both permissions. The tab says *Done*.
      4. The terminal prints a long token.
- [ ] F4. Add that token in the environment settings (as in E1) as **`YT_REFRESH_TOKEN_WHY_MAP`**.
- [ ] F5. Repeat F3–F4 for the other two channels:
      - `python publish.py auth body-cast` → pick *The Gut Gang* → save as **`YT_REFRESH_TOKEN_BODY_CAST`**
      - `python publish.py auth ranked` → pick *LeaderFlags* → save as **`YT_REFRESH_TOKEN_RANKED`**
- [ ] F6. Close PowerShell. You can delete the downloaded JSON once all three are saved, or keep it somewhere private.

## Part G: test (Claude does this; you just say "go")
In a new session, which has the variables, Claude runs:
1. `publish.py upload <episode> --dry-run`
2. one real upload of a finished why-map episode as **private**.

You check it in YouTube Studio → Content. If it lands on the right channel, the link works.

## Part H: the API audit (5 min to submit; Google takes days to weeks)
Until this passes, YouTube locks every API upload to **private**. You can still publish each video with
one tap in YouTube Studio.
- [ ] H1. Open the **YouTube API Services – Audit and Quota Extension Form**
      (support.google.com/youtube/contact/yt_api_form, or search for that name).
- [ ] H2. Give the Cloud project ID from C2 (shown in the project picker), and say the app is an internal tool that
      uploads the owner's own original videos to the owner's own 3 channels. No other users, no data stored.
      Claude can draft the answers to each field when you open the form.

## Part I: optional, later
- **Channel art:** banner 2560×1440 (keep text inside the central 1546×423), avatar 800×800. Claude makes these
  once the names are final.
- **TikTok, Instagram Reels and Facebook Reels** (cross-posting): one account per channel brand, set up separately.

---

### What each piece is for
| Piece | Where it lives | Used for |
|---|---|---|
| Studio Gmail | Google | Owns everything; one login |
| 3 channels (Brand Accounts) | YouTube | Separate names, subscribers and analytics |
| Cloud project + YouTube Data API | console.cloud.google.com | Lets software upload for you |
| Client ID and secret | Environment settings | Identifies our uploader app |
| 3 refresh tokens | Environment settings | Each one says "this app may upload to this channel" |
| Audit | Google | Lifts the private-only lock on API uploads |

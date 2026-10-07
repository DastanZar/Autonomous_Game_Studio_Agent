# Channel setup: Border Quirks, Gut Gang, Leader Flags (October 2026)

## Already done for you (through the YouTube API, 7 Oct)

| | Border Quirks (@borderquirks) | Gut Gang (@gutgang) | Leader Flags (@leaderflags) |
|---|---|---|---|
| Description | written and live | written and live | written and live |
| Channel keywords | set | set | set |
| Default language | English | English | English |
| Series playlists (public) | The time a country… · Why does…? · How did…? · Border oddities | What happens if…? · A day in the life of your organs · Organ vs organ | Which country has the most…? · State vs country |
| Home page | Popular uploads, then one shelf per series playlist | same | same |

The exact text is in `studio/channel_setup.json`; rerun `python3 studio/tools/channel_setup.py apply` after any edit.
After you upload, `python3 studio/tools/channel_setup.py sort` files every Short into its series playlist (or ask me).

Every upload's title, description (hook line first, sources, labels, 4 hashtags at the end), search tags, category,
pinned comment, related video and schedule are in `docs/publish-kit-2026-10.md`.

## What only you can do (about 10 minutes per channel, in YouTube Studio → Customisation)

1. **Profile picture and banner:** make them from the prompts below and upload under *Branding*.
2. **Links** (*Basic info → Links*): add the two sister channels, so each channel recommends the others.
3. **Contact email** (*Basic info*): one inbox for brand deals, for example a free address per channel.
4. **Country** (*Settings → Channel → Basic info*): your country of residence. It's needed for monetisation later, and I
   can't choose it for you.
5. **Per Short, after upload:** set the *Related video* listed in the publish kit (the API can't). It puts a tappable
   link under the Short that sends viewers to your other video.

## How we set things up, and why (what the experts and YouTube say)

- **Name and description say the niche.** New channels should signal what a viewer gets in the name and the first line
  of the description; the description is indexed for search even though the Shorts player hides it
  ([miraflow](https://miraflow.ai/blog/youtube-shorts-beginners-complete-guide-starting-zero-2026)).
- **Hashtags: 3-5 relevant ones, in the description, not the title.** They help topic classification a little;
  #viral-style tags do nothing, and more than 15 makes YouTube ignore them all
  ([miraflow](https://miraflow.ai/blog/youtube-shorts-hashtags-2026-do-they-still-matter),
  [hashtagtools](https://hashtagtools.io/blog/youtube-shorts-hashtags-title-vs-description-2026)). Ours: 4, one broad and
  the rest specific, plus #shorts.
- **Titles state the surprise, front-loaded, no hashtags,** and are under 70 characters.
- **Playlists by series** keep viewers on the channel and organise the home page.
- **Related video on every Short** and a **pinned comment** that asks a question: YouTube's own feature for routing
  Shorts viewers to more of your videos ([YouTube Help](https://support.google.com/youtube/answer/14075157)).
- **Consistency:** 3 a week per channel, same days and times, one look per channel.
- **Monetisation risk to know about:** since YouTube's "inauthentic content" update, channels of mass-produced,
  repetitive, TTS-narrated videos are the highest-risk pattern
  ([TechCrunch](https://techcrunch.com/2025/07/09/youtube-prepares-crackdown-on-mass-produced-and-repetitive-videos-as-concern-over-ai-slop-grows)).
  What keeps us on the right side: original animation and characters, a researched and sourced script for every video,
  one at a time, not dozens a day. The one thing that would lower the risk further is a voice with more personality
  (the Fish voice once the key is back, or your own).

## Picture prompts (for Nano Banana)

Sizes: **profile 800 × 800** (shown as a circle, so keep the subject in the middle 70%); **banner 2560 × 1440**, with
everything important inside the **centre 1546 × 423** strip (that's all a phone shows). Ask for the exact size, or
crop after. Make the profile pictures without text: they're shown tiny.

### Border Quirks

**Profile (800 × 800):**
> Flat paper-cutout illustration, layered cardstock with soft drop shadows and visible paper grain. A vintage brass
> magnifying glass hovering over a torn piece of an old map, with a red dashed border line zig-zagging oddly through the
> lens. Warm palette: parchment cream, sea green, mustard yellow, brick red, dark brown ink outlines. Centered, bold
> simple shapes that read at small size, plain warm parchment background, no text, no letters, no logos.

**Banner (2560 × 1440):**
> Wide flat paper-cutout diorama, layered cardstock with soft shadows and paper grain. An old parchment world map
> stretched across the whole image, sea in muted green, land in cream and mustard, with a few red dashed borders
> zig-zagging strangely. Small cut-paper props sitting on the map: a pink pig, a tiny steam frigate, a border booth with
> a striped barrier, a little survey theodolite. In the centre strip, large bold condensed sans-serif text "BORDER
> QUIRKS" in cream with a dark brown outline, and beneath it a smaller typewriter-style line "The weirdest stories on
> the map". Keep all props and text inside the centre third vertically; the outer areas are just map texture. No other
> text.

### Gut Gang

**Profile (800 × 800):**
> Flat vector cartoon, thick rounded dark-navy outlines (8px style), bright saturated colours. A cute J-shaped pink
> cartoon stomach character with big round white eyes and a worried smile, wearing a tiny yellow raincoat hood, facing
> the viewer. Plain deep purple background with soft radial light rays behind it. Centered, big shapes, readable at
> small size, no text, no letters.

**Banner (2560 × 1440):**
> Flat vector cartoon, thick rounded dark-navy outlines, bright saturated colours, deep purple background with soft light
> rays and small confetti. A line-up of cute cartoon organ characters with big round eyes and stick legs, standing side
> by side in the centre: a worried pink stomach, a tired red-brown liver with a little green gallbladder sidekick, a
> smug pink brain wearing a small gold crown, a red heart wearing a white sweatband, and three tiny colourful microbes (a
> yellow pill-shaped one, a purple round one, a blue squiggly one). Above them, bold white condensed sans-serif text
> "GUT GANG" with a dark navy outline, and a smaller line "Your organs, explained". Keep the characters and the text
> inside the centre third vertically. No other text.

### Leader Flags

**Profile (800 × 800):**
> Clean modern 3D-style globe, night-blue oceans and slate-blue continents, glowing soft blue atmosphere, one country
> highlighted in glowing gold, with a small gold number-one ribbon badge. Deep navy background with tiny stars. Centered,
> crisp, readable at small size, no text, no letters, no real flags.

**Banner (2560 × 1440):**
> Wide dark night-blue scene with a faint grid and tiny stars. The top of a large glowing Earth rises from the bottom
> edge, continents slate blue with one or two countries glowing gold. In the centre strip, a row of five simple
> waving flag shapes on poles in plain colours (no real national flags), rising in height like a podium, the tallest
> in the middle with a gold crown above it. Beside them, bold white condensed sans-serif text "LEADER FLAGS" and a
> smaller gold line "Countries, ranked". Keep the flags and the text inside the centre third vertically. No other text.

(The banner flags are generic on purpose: an image model can get real flags subtly wrong. The videos use the official
flag art.)

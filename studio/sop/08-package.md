# 08 · Package

**Goal:** everything the upload needs, in one file.
**Inputs:** the final report, `dossier.json`, `script.json`. **Output:** `package.json`, plus
`out/<slug>.srt` and `out/thumbnail.jpg`.

## Steps

1. **Title:** at most `publishing.title_max` characters, in the series' `title_pattern`. It states
   the surprise; it doesn't bait. Good: "Australia went to war with emus. The emus won." Bad: "You
   WON'T believe this war 😱".
2. **Description:**
   - line 1 restates the hook in plain words;
   - then `Sources:` with one line per source the script's claims rely on (title, publisher, URL).
     The gate checks every URL is present;
   - then any label the viewer should know ("The kill count is Major Meredith's own claim.").
3. **Hashtags:** at most `publishing.hashtags_max`, starting from the bible's `default_hashtags`.
4. **Pinned comment:** one question that invites an opinion about the story, not "like and subscribe".
5. **Captions file and thumbnail:** `python3 studio/tools/package_assets.py episodes/<ch>/<slug>` writes
   `out/<slug>.srt` (one cue per caption chunk, timed from the timeline) and `out/thumbnail.jpg` (the
   storyboard frame at the end of the first paragraph, when the title has landed; `--thumb-at S` to
   choose another moment). Look at the thumbnail before you sign off.
6. **Thumbnail:** check it works with no motion: readable title, nothing cropped.
7. **Flags:**
   - `made_for_kids` exactly as the bible says;
   - `synthetic_media.voice` names the TTS voice;
   - `synthetic_media.realistic` is true only if a viewer could mistake it for real footage of real
     people or events. It's false for our animation; true would require YouTube's altered-content
     disclosure.
8. Run the check.

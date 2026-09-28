# Trial report — why-map, three topic candidates

Worker: Claude (Sonnet 5), studio machine trial. Phase A only (topic stage). No files under `studio/`
were edited. `approved_by` / `approved_at` were left `null` on all three, as required.

## 1. The three candidates

### a. `swiss-invades-liechtenstein` (series: `the_time`)
- **Hook:** "In two thousand seven, Switzerland invaded Liechtenstein by accident. It wasn't the first
  time."
- **Twist:** Switzerland — one of the most neutral countries on earth — has accidentally sent its own
  troops across the unmarked border into Liechtenstein at least three times since the 1960s, most
  recently in 2007, and each time Liechtenstein just shrugged.
- **Weighted score:** 4.55 (hook 5, surprise 5, visual 5, sourceability 4, timeliness 2, series_fit 5;
  channel minimum 3.5)
- **Two sources:**
  - https://en.wikipedia.org/wiki/Liechtenstein%E2%80%93Switzerland_relations
  - https://www.thelocal.ch/20200228/swiss-history-army-attacked-liechtenstein-three-times-by-mistake
- **Risks:** already a social-media "fun fact" (our edge must be the repeat-offense structure, not the
  2007 incident alone); sources disagree on exact incursion count (3 vs 4) and on early dates — must
  be pinned to a primary/official account in research; keep the joke aimed at Switzerland's blunder,
  not at Liechtenstein having no army.

### b. `point-roberts` (series: `why`)
- **Hook:** "There's a piece of the United States you can only drive to through Canada."
- **Twist:** An 1846 treaty drew the US–Canada border along the 49th parallel without checking the
  map closely enough, slicing off a 5-square-mile tip of Washington State that is still reachable by
  car only by crossing into and back out of Canada.
- **Weighted score:** 4.27 (hook 4, surprise 4, visual 5, sourceability 5, timeliness 3, series_fit 5)
- **Two sources:**
  - https://www.britannica.com/place/Point-Roberts
  - https://en.wikipedia.org/wiki/Point_Roberts,_Washington
- **Risks:** a well-trodden topic for map-fact channels — needs a fresh detail (cross-border ambulance
  response, or 2026 tariff squeeze found in a search but not yet in `candidate_sources`) rather than
  just the 1846 line-drawing story; the tariff "why now" angle touches live trade politics, so the
  episode should stay on geography and daily-life absurdity, not commentary; town-life specifics need
  a dated source in research.

### c. `baarle-border-houses` (series: `border`)
- **Hook:** "In this village, your front door decides which country you live in."
- **Twist:** The border between Baarle-Hertog (Belgium) and Baarle-Nassau (Netherlands) was carved
  parcel by parcel and wasn't finalized until 1995, so it zigzags through streets and through
  individual buildings; a house's nationality is set by the *voordeurregel* — literally, the
  front-door rule.
- **Weighted score:** 4.09 (hook 4, surprise 4, visual 5, sourceability 5, timeliness 1, series_fit 5)
- **Two sources:**
  - https://en.wikipedia.org/wiki/Baarle
  - https://www.atlasobscura.com/places/house-with-two-numbers
- **Risks:** one of the most-covered border oddities on YouTube already — differentiate with the
  tax-motivated door-moving detail and the 1995 finalization date, not the "zigzag border" framing
  alone; the pre-1995 treaty history isn't in Wikipedia's summary and needs a scholarly/official
  source in research; travel blogs disagree on parcel counts, so only a sourced count goes in the
  dossier.

## 2. Gate attempts per candidate

All three passed on the **first** `check` attempt — 8 of 9 checks green, with only "approved by a
human" failing as required:

| Candidate | Attempts to 8/9 | What failed (by design) |
|---|---|---|
| swiss-invades-liechtenstein | 1 | `approved by a human` only |
| point-roberts | 1 | `approved by a human` only |
| baarle-border-houses | 1 | `approved by a human` only |

No retries were needed because the topic schema and `gate_topic` checks (schema shape, channel/slug
match, series membership, hook word count, twist length, ≥2 candidate sources from different
domains, weighted score ≥ min, no duplicate hook) were read from `studio/gates/__init__.py` and
`studio/schemas/topic.schema.json` before writing, and every source URL was verified live with
`WebFetch`/`WebSearch` before being cited.

## 3. Friction log

- **`studio/README.md` (root, "Run it" section) vs `studio/sop/01-topic.md`:** the README's example
  command is `studio.py new why-map point-roberts` — i.e. Point Roberts is literally the worked
  example name used to demonstrate the CLI, but it is *not* an actual pre-existing episode or a
  reserved slug (there was no `episodes/why-map/point-roberts/` before this run). It's not wrong,
  just a documentation choice that could read as "this one's already spoken for." Worth a one-line
  note in the README clarifying it's a placeholder name, not a claimed topic.
- **No file states the required domain-diversity rule for `candidate_sources` up front.**
  `studio/sop/01-topic.md` step 3 says "two sources... from different sites" in prose, but the actual
  enforcement (`len(set(urlparse(u).netloc for u in t["candidate_sources"])) >= 2` in
  `studio/gates/__init__.py:35`) lives only in the gate code, not in `schemas/topic.schema.json` or
  the playbook's explicit wording of *what counts as "different"* (e.g., would `en.wikipedia.org` and
  `de.wikipedia.org` count as different sites? They would, by netloc, even though it's the same
  organization). A worker who doesn't read the gate source could satisfy the letter of the check
  while missing its intent. Suggest stating the exact rule ("different netloc, not just different
  URL") in the playbook.
- **`studio/sop/01-topic.md` doesn't say where `why_now` is required or optional.** The schema marks
  it optional, and the worked example (`studio/examples/emu-war/topic.json`) includes it. Nothing
  says whether a worker should always include it when there's a genuine timely angle, or only when
  `timeliness` scores high. I included it for `point-roberts` (a live 2026 tariff angle) and gave it
  a low, honest `timeliness` score for the other two rather than omitting the field or inflating the
  score — the playbook could say explicitly "include `why_now` only when it explains a `timeliness`
  score above 1."
- **The weighted-score formula isn't written anywhere in `sop/01-topic.md`.** Step 5 says "score
  honestly, 1 to 5 on each axis" but never gives the formula (weights × scores ÷ sum of weights) that
  `gate_topic` actually computes and that the human will see printed by `check`. I derived it from
  `studio/gates/__init__.py:27` and the bible's `topic.weights`, but a worker without code access
  would have to guess or trial-and-error it. Suggest either printing the formula in the playbook or
  having `check` show the per-axis contribution.
- **Setup gap, not a studio-file issue:** the container had neither `jsonschema`'s dependencies
  installed nor `pdftotext` (`poppler-utils`) present; both were needed before `selftest` would even
  run. The task's own setup note anticipated this, so it's confirmed working as described, not a
  studio bug — flagging only because a worker following *just* `studio/README.md` would hit
  `ModuleNotFoundError: jsonschema` with no guidance on `pip install -r studio/requirements.txt`
  being a prerequisite to `selftest` (the README does list it one line above, so this is a minor
  "don't skip line 1" risk, not a missing instruction).
- Everything else — `studio/sop/00-rules.md`, the topic schema, the `why-map` bible, and
  `studio/examples/emu-war/topic.json` as a worked shape — was clear and sufficient to produce a
  passing card without guessing.

## 4. `python3 studio/studio.py status` (verbatim)

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✗     ·     ·     ·     ·     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```

The `✗` on `topic` for all three is expected and correct: every check in the topic gate passes except
"approved by a human," which is intentionally left for the person running the studio.

---

# Phase B — research, script, voice, storyboard

Worker: Claude (Sonnet 5). Order: point-roberts, swiss-invades-liechtenstein, baarle-border-houses,
each taken through all four stages before the next started. `voice_waivers` was never filled; nothing
under `studio/` was edited. `python3 studio/tools/verify_quotes.py <episode>` was run before every
`check` at the research stage, per sop/02.

## 1. Check attempts per episode/stage

"Attempts" counts calls to `python3 studio/studio.py check <episode>` at that stage. Separately,
research needed `verify_quotes.py` re-runs before a `check` was worth calling, and voice needed
`vo.py` re-runs (rewording a misread line) before a `check` was worth calling; both are called out
under "what failed" since they are the SOP-mandated pre-check tools, not the gate itself.

### point-roberts

| Stage | `check` attempts | What failed |
|---|---|---|
| research | 1 (passed) | Nothing at `check`. `verify_quotes.py` passed clean on its first run (8 claims, 0 NOT_FOUND). |
| script | 1 (passed) | Nothing. |
| voice | 1 (passed) | Nothing at `check`. `vo.py` itself needed 3 runs before its per-paragraph WER table was clean: run 1 flagged `treaty_detail` at WER 0.12 (heard "britain **the us** drew... along the **forty nine th** parallel" — dropped "and", split "forty-ninth" into three words); reworded the ordinal to "parallel forty-nine" and re-ran (run 2), which fixed `treaty_detail` but revealed `hook` had flipped to WER 0.17 ("u s" heard as two letters instead of the word "us") and `treaty_detail` regressed to WER 0.25 for the same reason; rewrote "US" → "United States" in both lines and re-ran (run 3), which passed all 12 paragraphs at WER ≤ 0.07. That is exactly the sop/04 "at most 2 retakes" budget (2 rewordings, not 2 reruns). |
| storyboard | 1 (passed) | Nothing. |

### swiss-invades-liechtenstein

| Stage | `check` attempts | What failed |
|---|---|---|
| research | 1 (passed) | Nothing at `check`. `verify_quotes.py` run 1 flagged `c_2007` NOT_FOUND: my quote skipped an inline parenthetical ("armed with rifles **(but apparently not with a GPS)** stumbled") and the word "Hey," before a direct quote, breaking the source-text contiguity `verify_quotes.py` requires. Restored the skipped words verbatim and re-ran (run 2), 9/9 verified. |
| script | 2 (1 failed, 1 passed) | First `check` after the voice retake (below) failed: `callback: kind 'callback' with numbers must cite claim ids from dossier.json` — rewording the callback from "a sixth" to "six" introduced a bare number word ("six" is in the gate's `NUMBER_WORDS` list; the ordinal "sixth" that preceded it was not). Added `claims: ["c_pattern"]` to the paragraph and re-ran; passed 10/10. |
| voice | 1 (passed) | Nothing at `check`. `vo.py` run 1 flagged `callback` at WER 0.20 ("sixth" heard as "six", dropping "-th"); reworded to "Number six could still happen." and re-ran (run 2), all 11 paragraphs WER 0.00. (One retake, well under budget — the script-gate failure above was a side effect of this same fix, not a second voice retake.) |
| storyboard | 1 (passed) | Nothing. |

### baarle-border-houses

| Stage | `check` attempts | What failed |
|---|---|---|
| research | 1 (passed) | Nothing at `check`. `verify_quotes.py` run 1 flagged `c_treaty1843` NOT_FOUND: the two Wikipedia sentences I quoted back-to-back are actually separated on the page by the "Border enclaves [edit]" section heading, breaking contiguity the same way as the swiss-invades-liechtenstein case. Split the quote into two semicolon-delimited, independently-verifiable segments and re-ran (run 2), 9/9 verified. |
| script | 1 (passed) | Nothing. |
| voice | 1 (passed) | Nothing at `check`. `vo.py` run 1 flagged `storedoor` at WER 0.13 ("store's" heard as "store is" — the possessive contraction was misread); reworded to "One store has its front door..." and re-ran (run 2), all 10 paragraphs WER ≤ 0.07. |
| storyboard | 1 (passed) | Nothing. |

## 2. Facts corrected or dropped versus the topic cards

- **point-roberts** — Britannica (one of the topic card's two `candidate_sources`) turned out to be
  unreliable for machine quote-verification (Cloudflare/anti-bot 403s, inconsistent between fetchers);
  research used NASA Earth Observatory instead as the second, "official"-type source, and dropped
  Britannica from the dossier entirely rather than cite a source that couldn't be reliably opened. The
  topic card's "why now" pointed at 2026 tariff coverage; the best on-the-ground reporting actually
  found was an AP story dated March 2025 — the dossier keeps the real publication date and treats the
  business-decline figure as an "estimate" with a "one business owner's reported figure" label rather
  than a confirmed 2026 statistic.
- **swiss-invades-liechtenstein** — the topic card's risk note guessed "three vs four" prior
  incursions and flagged the count as unresolved. Research found Wikipedia documents **five** separate
  incidents (1968, 1976, 1985, 1992, 2007), which is a stronger, more surprising story than the topic
  card assumed, not a weaker one — used all five rather than picking a smaller subset. The 2007 troop
  count is genuinely disputed between sources (171 per Wikipedia, 170 per The Local); the dossier
  records both and the script uses the rounded, source-agnostic "one hundred seventy" rather than
  asserting one over the other.
- **baarle-border-houses** — the topic card's risk note said the pre-1995 treaty history "isn't in
  Wikipedia's summary" and would need a scholarly/official source. Research resolved this directly:
  the 1843 Treaty of Maastricht (a separate Wikipedia article) gives the 5,732-parcel figure, and the
  main Baarle article gives the 1198 origin story neither of which were in the topic card. Atlas
  Obscura, the topic card's second candidate source, returned HTTP 403 to a direct fetch **and** to
  the WebFetch tool — since research rules require citing only what was actually opened, it was
  dropped rather than cited secondhand; the equivalent fact (the Loveren Street divided house) is
  instead sourced to Wikipedia, which states it independently. A genuine numeric conflict surfaced
  between Wikipedia (16 exclaves surrounding 7 Dutch areas) and a third source, Barry's Border Points
  (26 pockets, 22 fully surrounded) — the dossier logs this as an open question and the script only
  ever uses Wikipedia's own count rather than splitting the difference.

## 3. Per-paragraph WER, final passing run

**point-roberts** (12 paragraphs, `python3 studio/tools/vo.py`, Piper `en_US-ryan-high` DRAFT voice):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| onlyway | 0.00 |
| wrongidea | 0.00 |
| reveal | 0.00 |
| treaty_detail | 0.00 |
| oops | 0.00 |
| cutoff | 0.07 |
| howfar | 0.00 |
| kids | 0.00 |
| water | 0.00 |
| todaybeat | 0.00 |
| loopback | 0.00 |

Total 42.11s. All ≤ bible max_wer 0.08.

**swiss-invades-liechtenstein** (11 paragraphs):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| itwasnt | 0.00 |
| neutral | 0.00 |
| y1968 | 0.00 |
| y1976 | 0.00 |
| y1985 | 0.00 |
| y1992 | 0.00 |
| then2007 | 0.00 |
| soldiers2007 | 0.00 |
| verdict | 0.00 |
| callback | 0.00 |

Total 42.74s. All ≤ 0.08 (all exactly 0.00).

**baarle-border-houses** (10 paragraphs):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| literally | 0.00 |
| samevillage | 0.00 |
| origin | 0.00 |
| treaty | 0.00 |
| toohard | 0.07 |
| finalized | 0.00 |
| storedoor | 0.00 |
| fireworks | 0.00 |
| callback | 0.00 |

Total 33.45s. All ≤ 0.08.

## 4. Friction log

- **`studio/README.md` "Run it" example doubles as an unintentional claim on a slug.** (carried over
  from Phase A, still relevant: `point-roberts` is only a documentation placeholder, not a reserved
  topic — worth a one-line disclaimer.)
- **`verify_quotes.py`'s contiguity rule isn't documented anywhere a worker would read before writing
  quotes**, and it bit twice in three episodes (swiss-invades-liechtenstein's `c_2007`,
  baarle-border-houses's `c_treaty1843`). The tool matches a quote segment (split only on `;` and
  `...`) as one literal, whitespace-and-punctuation-stripped substring of the fetched page. Anything a
  human would consider "the same quote" but that skips a parenthetical aside, an inline attribution,
  or — on Wikipedia specifically — a section heading sitting between two sentences, silently breaks
  the match and reports `NOT_FOUND` with no hint about *why* it wasn't found beyond the first 50
  characters. `studio/sop/02-research.md`'s "Common failures" list ("Paraphrasing in `quote`") gets
  close but doesn't name this specific failure mode. Suggest adding: "a quote must be a single
  verbatim, uninterrupted span of the source page — never skip an inline aside, and never quote two
  sentences that a section heading sits between; split into two semicolon-joined segments instead."
- **Whisper's transcription of a whole-episode mix is non-deterministic in a way that goes beyond the
  documented ~20ms timing wobble** (`studio/knowledge/lessons.md`): re-running `vo.py` after changing
  only *one* paragraph's text caused an *earlier, unrelated, bit-identical* paragraph's transcribed
  **content** to change ("us" → "u s"), flipping its WER from 0.00 to 0.17 on point-roberts's `hook`.
  This means a paragraph that passed can silently fail on a later, unrelated retake, purely from
  re-running the whole-mix transcription — worth a line in `lessons.md` next to the existing timing-
  wobble entry, since it changes how a worker should read a WER regression (don't assume the newly-
  failing line's *own* audio is the problem).
- **Piper has a small, recognizable set of misread constructs that `studio/sop/04-voice.md`'s "Common
  failures" doesn't list**, and three of the eleven per-line retakes across all three episodes fell
  into it: an ordinal built from a hyphenated number ("forty-ninth" → "forty nine th"), the acronym
  "US" (sometimes read as the word "us", sometimes spelled out "u s" with no way to predict which), a
  possessive contraction ("store's" → "store is"), and the bare ordinal "sixth" (→ "six", dropping
  "-th"). None of these are wrong `say` text, just Piper-specific pronunciation traps; spelling out
  "United States", avoiding ordinal-suffix words, and avoiding possessive contractions on names/nouns
  worked every time they were tried. Worth adding to the playbook's common-failures list so a worker
  doesn't have to rediscover each one by burning a retake.
- **The scene catalog's per-type param limits are documentation, not enforcement**, confirmed again
  in Phase B: `storyboard.schema.json` defines `params` as an unconstrained `object`, and
  `gate_storyboard` never reads `stamp_reveal`'s "≤3 words" or `title_card`'s "≤8 words" limits from
  `engine/catalog.json`. All title cards and stamp reveals in these three storyboards were kept inside
  those limits by hand, but nothing would have stopped a storyboard from passing `check` while
  violating them.
- **Nested cue references inside scene `params` (e.g. `map_focus.pins[].at`,
  `diagram_callout.callouts[].at`) are never validated against the timeline** — `gate_storyboard` only
  resolves `scene.start`, `scene.end`, and top-level `scene.events[].at`. A typo'd pin or callout `at`
  cue (e.g. referencing a word never spoken) would pass the gate silently and only surface once a
  human, or the not-yet-built render engine, looks at the actual picture. `sop/05-storyboard.md`'s
  "Run the check. Every cue must resolve" reads as covering all cues; worth narrowing that sentence or
  widening the gate.
- **The script gate's runtime formula still isn't written down** (flagged in Phase A for the topic
  score formula; same pattern here for `est_duration` in `studio/gates/__init__.py`:
  `lead_in + words/(wpm/60) + sum(gap for all but the last paragraph) + tail`). Hand-computing this for
  all three scripts before ever running `vo.py` matched the gate's printed number to one decimal place
  every time, which confirms the formula is stable and worth publishing in `sop/03-script.md` so a
  worker isn't reverse-engineering gate source before writing a script.

## 5. `python3 studio/studio.py status` (verbatim, after all three episodes)

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```

All three episodes are through storyboard. Picture and everything after it were left untouched, as
instructed (the render engine isn't built).

---

# Phase B fixes

Worker: Claude (Sonnet 5). Pulled `trial/sonnet-1`, merged `main` (fast-forward, no conflicts:
`studio/gates/__init__.py` gained per-scene word limits for `title_card`/`stamp_reveal` and
validation of every nested `at` cue in scene `params`, and `sop/02-03-04-05` and `knowledge/lessons.md`
picked up the "Common failures" the orchestrator's audit surfaced), re-read `sop/02-research.md` and
`sop/03-script.md` before touching anything. All three re-checks below were run against these updated
gates, so they also confirm the new word-limit and nested-cue checks pass cleanly. Nothing under
`studio/` was edited.

## What changed

1. **baarle-border-houses / `fireworks`.** The dossier claim `c_shopping`'s `text` already said "a
   fireworks store allowed to stay open year-round" (it never overstated this), so it was left as is.
   Only the script line overstated it: reworded `say` from "Cross the street, and fireworks are legal
   all year round." to **"Cross the street, and one fireworks store stays open all year."**, matching
   the claim exactly. Captions rebalanced to the new 11-word count.
2. **swiss-invades-liechtenstein / `verdict` + `c_quote` + `s10_verdict`.** `c_quote` in `dossier.json`
   dropped the Wikipedia paraphrase entirely: `sources` narrowed to `["local"]` and `text`/`quote` now
   read only The Local's original wording, attributed to Markus Amman, Liechtenstein's interior
   spokesman. The script's `verdict` paragraph was rewritten to speak that exact original quote
   ("It's not like they stormed over here with attack helicopters or something"); the spoken
   attribution was simplified to "said Liechtenstein's interior spokesman" (dropping the name from the
   *spoken* line only — see voice retake below), while the storyboard's `s10_verdict` quote-card
   `who`/`quote` params were updated to the same original wording and still credit Markus Amman by name
   on screen. `y1992`'s line was corrected from "soldiers set up camp" to **"soldiers set up an
   observation post"**, matching `c_1992`'s claim text (which already said "observation post" — only
   the script had drifted from it).
3. **point-roberts / `reveal`.** "It's not a mistake. It's an old treaty line." contradicted the next
   beat ("Nobody checked what that line would cut off."). Reworded to **"It wasn't a typo. It was a
   guess."**, which agrees with `c_treaty`'s sourced framing ("without precise knowledge of its
   effects") and no longer conflicts with `oops`. `wrongidea` and `oops` needed no changes — they were
   already consistent with a "guess, unchecked" framing; `reveal` was the only contradicting line.

## Check attempts and what failed

| Episode / stage | Attempts | What failed |
|---|---|---|
| baarle-border-houses / script | 1 (passed) | Nothing. |
| baarle-border-houses / voice | 3 `vo.py` runs, 1 `check` (passed) | Run 1 (only `fireworks` text changed) unexpectedly flagged **`hook`** (WER 0.08) and **`literally`** (WER 0.25) — both heard "front's door" for "front door" though neither line's text or cached audio changed. This is the whole-mix-retranscription effect `lessons.md` now documents: changing `fireworks`'s audio length shifted Whisper's decoding of earlier, bit-identical segments. Run 2 (no changes) reproduced the identical mis-hearing, confirming it wasn't random. Run 3 used `--redo hook literally` to force fresh Piper synthesis of those two lines (same text, new take); this cleared the artifact and all 10 paragraphs passed. |
| baarle-border-houses / storyboard | 1 (passed) | Nothing; also the first real exercise of the new word-limit and nested-cue checks on this episode — no violations. |
| swiss-invades-liechtenstein / research | 1 `verify_quotes.py` run (clean), 1 `check` (passed) | Nothing — the new `c_quote` quote matched The Local's cached text on the first try. |
| swiss-invades-liechtenstein / script | 2 (both passed) | First pass (after the y1992/verdict rewording) passed 10/10 cleanly. A second pass was needed after the voice retake below simplified the verdict line's spoken attribution — also passed 10/10, nothing failed either time. |
| swiss-invades-liechtenstein / voice | 2 `vo.py` runs, 1 `check` (passed) | Run 1 flagged `verdict` at WER 0.11: Piper/Whisper misheard the proper name "Markus Amman" as "marcus amand". Rather than alter the quoted words (which must stay verbatim per the fix above), removed the name from the *spoken* attribution only ("said Liechtenstein's interior spokesman"), keeping the on-screen quote card's named attribution intact. Run 2: all 11 paragraphs WER 0.00. |
| swiss-invades-liechtenstein / storyboard | 1 (passed) | Nothing; confirmed the `y1992/apologize` pin cue and `verdict/helicopters` event cue still resolve since neither word moved. |
| point-roberts / script | 1 (passed) | Nothing. |
| point-roberts / voice | 1 `vo.py` run (clean), 1 `check` (passed) | Nothing — reworded `reveal` line passed WER 0.00 immediately. (As a side effect of the whole-mix shift, `cutoff` — previously 0.07 — came back at 0.00 this run; no other paragraph regressed.) |
| point-roberts / storyboard | 1 (passed) | Nothing. |

## New per-paragraph WER tables (after fixes)

**point-roberts** (total 41.57s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| onlyway | 0.00 |
| wrongidea | 0.00 |
| reveal | 0.00 |
| treaty_detail | 0.00 |
| oops | 0.00 |
| cutoff | 0.00 |
| howfar | 0.00 |
| kids | 0.00 |
| water | 0.00 |
| todaybeat | 0.00 |
| loopback | 0.00 |

**swiss-invades-liechtenstein** (total 45.38s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| itwasnt | 0.00 |
| neutral | 0.00 |
| y1968 | 0.00 |
| y1976 | 0.00 |
| y1985 | 0.00 |
| y1992 | 0.00 |
| then2007 | 0.00 |
| soldiers2007 | 0.00 |
| verdict | 0.00 |
| callback | 0.00 |

**baarle-border-houses** (total 34.25s):

| Paragraph | WER |
|---|---|
| hook | 0.00 |
| literally | 0.00 |
| samevillage | 0.00 |
| origin | 0.00 |
| treaty | 0.00 |
| toohard | 0.07 |
| finalized | 0.00 |
| storedoor | 0.00 |
| fireworks | 0.00 |
| callback | 0.00 |

All values ≤ the bible's `voice.max_wer` (0.08). No `voice_waivers` were added anywhere.

## Status after fixes

```
episode                                  topic resea scrip voice story pictu final packa publi analy
episodes/why-map/baarle-border-houses        ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/point-roberts               ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·
episodes/why-map/swiss-invades-liechtens     ✓     ✓     ✓     ✓     ✓     ·     ·     ·     ·     ·

✓ passed   · pending   ✗ failed   ! stale (an input changed after it passed)
```

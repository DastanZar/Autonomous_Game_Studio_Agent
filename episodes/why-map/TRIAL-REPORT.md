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

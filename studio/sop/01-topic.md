# 01 · Topic

**Goal:** one topic card that a human can approve in a minute: a hook worth watching, and proof that
it can be sourced.
**Output:** `topic.json` (schema: `schemas/topic.schema.json`). **Gate:** `studio.py check <episode>`.

## Steps

1. **Read the bible's `topic.radar` and `topic.avoid`.** Pull 10 raw ideas from the radar sources,
   for example Wikipedia "On this day" for the next 14 days, or a new dataset release.
2. **Kill fast.** Drop any idea where you can't write the twist in one sentence ("A real army unit
   with machine guns lost to emus"). Drop anything the channel covered in the last 90 days: list
   `episodes/<channel>/*/topic.json`.
3. **Find two sources for the core claim in 5 minutes.** They must come from different sites, and
   social media doesn't count. Can't find them? Drop the idea. That's the sourceability score.
4. **Write the hook as it will be spoken**, with numbers spelled out, at most
   `script.hook_max_words` + 6 words. Use a pattern from `knowledge/hooks.md`.
5. **Score honestly, 1 to 5 on each axis:**

   | Axis | 5 means |
   |---|---|
   | hook | You'd stop scrolling for this sentence alone |
   | surprise | Most viewers believe the opposite |
   | visual | Each beat has an obvious picture in the channel's scene types |
   | sourceability | Two strong sources in hand, with excerpts |
   | timeliness | Anniversary or news within 14 days |
   | series_fit | It matches one series' beats in the bible exactly |

6. **Pick the series** whose `beats` the story fits, and write `angle`: the question the episode
   answers.
7. **Write `risks`**: sensitivity, disputed facts, competitors who covered it.
8. Leave `approved_by: null`. Run the check. Every other test should pass; the approval test fails
   until a human approves.
9. **Hand over for approval:** present 3–5 passing cards per channel to the human with hook, twist,
   score and risks. The human writes `approved_by` and `approved_at` in the chosen card.

## Worked example
`studio/examples/emu-war/topic.json`. Hook: "In nineteen thirty-two, Australia went to war against
birds. And lost." Twist: a real unit with machine guns was withdrawn. Weighted score 4.55.

## Common failures
- The hook is a question with no answer in it ("Why is Canada weird?"). Put the surprise in the sentence.
- "Sources" that are listicles quoting each other. Look for the original: an archive, a paper, an
  official page.
- A topic that needs footage we can't draw: real people's faces, or disasters that need realism.

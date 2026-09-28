# 03 · Script

**Goal:** 25–55 seconds of narration that hooks in the first line, escalates, stays 100% sourced
and loops back to its start.
**Inputs:** `topic.json`, `dossier.json`, the bible. **Output:** `script.json` (schema:
`schemas/script.schema.json`).
Read `studio/knowledge/style.md` first, then the example script.

## Steps

1. **Lay out the beats.** Copy the chosen series' `beats` from the bible. Under each beat, list the
   claim ids that belong there. Leave out any claim that doesn't serve a beat.
2. **Write the hook paragraph** (kind `hook`). It's the most surprising true sentence, stated flat,
   no preamble, within `hook_max_words`. Stop the paragraph where the surprise lands; the next
   paragraph can be the one-word punch ("And lost.").
3. **Write one idea per paragraph.** Short sentences. Each paragraph gets:
   - `id`: a short snake_case word; the storyboard will cue on it.
   - `kind`: hook, fact, quote, joke, transition, callback or cta.
   - `claims`: the dossier ids it relies on. Required for hook, fact and quote lines, and for any
     line with a number word.
   - `gap`: seconds of silence after the line. Use 0.2–0.3 normally and 0.4–0.6 before a punchline.
4. **Escalate.** Each beat should be worse, funnier or more surprising than the last. If two beats
   feel equal, cut one.
5. **Spell every number as spoken:** "nineteen thirty-two", "nine hundred eighty-six". Digits are
   for captions only. The gate fails any digit in `say`.
6. **Qualify what the dossier qualifies.** If a line uses an `estimate`, `framed` or `disputed`
   claim, its label must reach the viewer: in the line, the captions, or a storyboard param.
7. **End on a callback** (kind `callback`) that answers the hook in five words or fewer. Fill `loop`
   to say which paragraph it connects to and how.
8. **Captions** (when the bible has burned captions): for each paragraph, chunk the text into 2–5
   word pieces, uppercase, with digits allowed. Each chunk is `[text, number_of_spoken_words]`. The
   numbers must add up to the paragraph's word count. Example: "In nineteen thirty-two," is 3 words,
   giving `["IN 1932,", 3]`.
9. **Check the runtime** with the gate. It estimates runtime at the bible's wpm plus gaps. Over
   budget? Cut a beat, don't speed up.
10. **Read it aloud in your head once, as the narrator from the bible's `tone`.** Rewrite anything a
    tired Australian narrator wouldn't say.
11. Run the check.

## Worked example
`studio/examples/emu-war/script.json`: 17 paragraphs, 132 words, and 46 s once voiced.
- Hook: "In nineteen thirty-two, Australia went to war against birds."
- Punch: "And lost." with a 0.55 s gap.
- Escalation: ambush, then the jam, then the truck, then "faster than the truck".
- Number: ten bullets per bird.
- Verdict: the major's quote.
- Callback: "The army went home. / The emus did not."

## Common failures
- An explainer voice ("Let's dive in"). The bible's `banned_phrases` list catches the worst.
- Jokes that add unsourced facts. A joke may only reframe a sourced fact.
- A last line that summarises instead of landing. End on the callback, not a moral.
- Long compound sentences. TTS rushes them and the gap timing dies.

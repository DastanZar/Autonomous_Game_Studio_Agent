# 02 · Research

**Goal:** a dossier where every claim the episode might use is backed by an excerpt you copied from
a source you opened.
**Input:** `topic.json`. **Output:** `dossier.json` (schema: `schemas/dossier.schema.json`).

## Steps

1. **Map the story first.** Write the 8–15 claims the story needs as short sentences, one fact each:
   who, what, when, where, how many, the outcome, a quote. Give them ids like `c_force`, `c_tally`.
2. **Source each claim**, best first:
   1. primary: archive document, dataset, official record;
   2. scholarly: journal article, university press, academic book chapter;
   3. reference: Britannica or Wikipedia (follow Wikipedia's footnote and open it if you can);
   4. reputable journalism.

   The bible's `sources.preferred` and `sources.banned` override this. Social media, Reddit and Quora
   are leads, never sources.
3. **Open it and copy the supporting sentence** into `quote`, verbatim. If two sources support it,
   quote both and mark each ("... (Robin); ... (Britannica)"). If you can't find a sentence that
   says it, the claim isn't confirmed.
4. **Set the status:**

   | Status | When | Needs `label` |
   |---|---|---|
   | confirmed | Sources state it plainly | no |
   | estimate | A number that is approximate or self-reported | yes, e.g. "about 20,000", "the major's own count" |
   | framed | Popular framing, not literal ("went to war", "lost") | yes, e.g. "the army withdrew" |
   | disputed | Sources disagree | yes, and say who says what in `note` |
   | rejected | Wrong, unsourceable, or not used | no; keep it so nobody re-adds it |

5. **Mark `key: true`** on the claims the episode collapses without. A key claim needs two
   independent sites, or one primary, scholarly, official or dataset source.
6. **Hunt the myths.** What do people wrongly believe about this? Put each in `myths`, with the
   truth and sources. Myths make great hooks ("You've seen the headline. It's wrong.").
7. **Log open questions** you couldn't resolve. The scriptwriter must avoid them.
8. Run the check.

## Worked example
`studio/examples/emu-war/dossier.json`:
- 4 sources: Britannica, an ANU scholarly chapter, Australian Geographic and Wikipedia.
- The kill count is an `estimate` labelled "the major's own count".
- "Lost" is `framed`, labelled "the army withdrew".
- The emu speed claim is `rejected` because the script doesn't use it.

## Common failures
- Paraphrasing in `quote`. Copy the words; the gate needs at least 4 words, and the check is you
  reading it.
- Citing the journal article Wikipedia cites without opening it. Cite Wikipedia and put the article
  in `cites`.
- Precise numbers that are really estimates ("20,000 emus"). Label them.
- One blog repeating another. They count as one source.

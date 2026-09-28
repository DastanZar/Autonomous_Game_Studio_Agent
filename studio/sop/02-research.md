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
   **How `verify_quotes.py` matches:** each quote segment (split on `;` and `...`) must be one
   uninterrupted span of the page's text. Case, punctuation and spacing are ignored, but words are
   not. So:
   - never skip an inline aside, parenthetical or attribution in the middle of a quote;
   - never join two sentences that a heading, caption or footnote sits between;
   - to quote two separate places, write two segments joined by `; `.
4. **Make the claim text say exactly what the script may say**, no more. The script can only use
   what is in a claim's `text`. If a source says "a fireworks store open all year", the claim says
   that, not "fireworks are legal all year".
5. **Set the status:**

   | Status | When | Needs `label` |
   |---|---|---|
   | confirmed | Sources state it plainly | no |
   | estimate | A number that is approximate or self-reported | yes, e.g. "about 20,000", "the major's own count" |
   | framed | Popular framing, not literal ("went to war", "lost") | yes, e.g. "the army withdrew" |
   | disputed | Sources disagree | yes, and say who says what in `note` |
   | rejected | Wrong, unsourceable, or not used | no; keep it so nobody re-adds it |

6. **Mark `key: true`** on the claims the episode collapses without. A key claim needs two
   independent sites, or one primary, scholarly, official or dataset source.
7. **Hunt the myths.** What do people wrongly believe about this? Put each in `myths`, with the
   truth and sources. Myths make great hooks ("You've seen the headline. It's wrong.").
8. **Log open questions** you couldn't resolve. The scriptwriter must avoid them.
9. Run `python3 studio/tools/verify_quotes.py <episode>`, fix any NOT_FOUND, then run the check.

## Worked example
`studio/examples/emu-war/dossier.json`:
- 4 sources: Britannica, an ANU scholarly chapter, Australian Geographic and Wikipedia.
- The kill count is an `estimate` labelled "the major's own count".
- "Lost" is `framed`, labelled "the army withdrew".
- The emu speed claim is `rejected` because the script doesn't use it.

## Common failures
- **Quotations of people:** quote the earliest reporting you can open, in its exact words. Wikipedia often
  paraphrases a quote ("It's not like they invaded with attack helicopters") that the original report
  words differently ("It's not like they stormed over here with attack helicopters or something").
  The script and quote card use the original wording.
- Paraphrasing in `quote`. Copy the words; the gate needs at least 4 words, and the check is you
  reading it.
- Citing the journal article Wikipedia cites without opening it. Cite Wikipedia and put the article
  in `cites`.
- Precise numbers that are really estimates ("20,000 emus"). Label them.
- One blog repeating another. They count as one source.

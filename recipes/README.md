# Recipes

**Recipes** are step-by-step answer keys that let another agent (for example a cheaper model)
rebuild a finished video exactly.

| Recipe | Start at | Validated |
|---|---|---|
| The Great Emu War (46 s vertical short) | `emu-war/00-START-HERE.md` | Yes. Followed mechanically in a clean folder: every source file extracted byte-identical to the original, same voice track, same sound mix, 1,099/1,105 frames byte-identical and the other 6 invisibly different. Grader: **SCORE 29/29**. |

- `emu-war/src/` holds the templates.
- `emu-war/build_recipe.py` regenerates the docs, pasting in the current source files verbatim.
- `emu-war/golden/` holds the frozen random outputs (voice takes and timeline) plus reference frames
  and checksums for grading.

# 04 · Voice

**Goal:** narration audio, and a word-level timeline that every picture and sound cue is keyed to.
**Input:** `script.json`. **Outputs:** `build/vo.wav`, `build/timeline.json`.

**Tool:** `python3 studio/tools/vo.py episodes/<ch>/<slug> [--redo <para_id> ...]` (Fish with an OpenRouter key,
otherwise the bible's Piper fallback as a DRAFT voice).

## What the tool must do (contract)

1. **Synthesise one request per paragraph**, cached by `sha1(model + voice + text)` in
   `build/tts/`. Re-running never re-spends quota for unchanged lines. Fish's free tier is 50
   requests a day across all channels.
2. Trim silence, then join paragraphs with `lead_in`, each paragraph's `gap` (or the script
   default), and `tail`.
3. **Transcribe the whole narration once** with faster-whisper (`small.en`, int8), resampled to
   **16 kHz**. Timestamps come out about 1.38× too long otherwise.
4. **Align** the transcript to the script words (difflib), and give every script word a time. This
   produces `timeline.json` with `{duration, paras: [{id, start, end, wer, heard, words: [{w, t}]}]}`.
5. **Score each paragraph** with `studio/tools/textnorm.py: per_para_wer()` on the aligned span of
   the one whole transcript. Never transcribe single lines in isolation: short lines have no context
   and give false failures ("The emus did not" → "Daines did not").

## Steps for the worker

1. Run the tool. Read its per-paragraph WER table.
2. For any paragraph over `voice.max_wer` (0.08):
   1. read `heard`;
   2. if it's a real misread, change the voice's input by rewording or respelling, while keeping
      `say` accurate;
   3. delete that paragraph's cache file and re-run.

   At most 2 retakes per line. Then report it for a **human listen**. Only the human may add a
   `voice_waivers` entry, and must fill `listened_by`.
3. Once the picture is being timed, **freeze** `timeline.json`. Whisper times wobble about 20 ms
   between runs.
4. Run the check.

## Common failures
- **Piper traps** (each cost a retake in the Sonnet trial): acronyms ("US" is read as "us" or "u s";
  write "United States"), hyphenated ordinals ("forty-ninth"; write "parallel forty-nine"), bare
  ordinals ("sixth" comes out as "six"), and possessives on nouns ("store's" heard as "store is").
  Write around them in `say` before the first run.
- **A retake can move another line's WER.** The whole narration is transcribed at once, so changing one
  paragraph can change how Whisper hears a neighbouring, unchanged one. When a line that passed starts
  failing after an unrelated retake, read its `heard` before re-recording it.
- Editing `script.json` after voicing. The gate compares words and fails; re-run the tool.
- A voice that differs from the bible. Use the channel's voice, or the cast member's voice for
  lines with a `speaker`.
- Spending quota on retakes of lines that were fine in context. Check `heard` before retaking.

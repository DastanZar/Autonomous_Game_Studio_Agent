# 00 · Rules of the studio (read once per session)

You are one worker in a production line. You do **one stage of one episode at a time**. You don't
need to understand the whole studio. You need this page, the playbook for your stage, and the
channel bible.

## The loop

```
python3 studio/studio.py next  <episode>     # 1. what stage, which playbook, which files
   read studio/sop/<stage>.md                # 2. how to do it
   read studio/channels/<channel>/bible.json # 3. this channel's voice, look, rules
   do the work; write the output files       # 4. only the files listed under OUTPUTS
python3 studio/studio.py check <episode>     # 5. the gate. FAIL: fix exactly what it names, check again
```

Stop after the gate passes, or after **3 failed attempts on the same gate**. Then report (see below).
Never edit a gate, a schema, a bible or another stage's output to make your check pass. If a gate
seems wrong, say so in your report and stop.

## Hard rules (the same for every channel)

1. **Facts beat jokes.** Every fact, number, name and date in narration traces to a claim in
   `dossier.json`, and every claim traces to a source you actually opened. No source, no line.
2. **Label what isn't certain.** Estimates, self-reported numbers and popular framings carry their
   label on screen ("the major's own count", "about 20,000").
3. **Only what you read.** Cite a source only if you opened it and copied the supporting excerpt
   into `quote`. If you only know a fact through Wikipedia, cite Wikipedia and put its reference in
   `cites`. Don't cite the paper you didn't open.
4. **Humans approve topics and voice waivers.** Never fill in `approved_by`, `approved_at` or
   `voice_waivers`. Those belong to the person running the studio.
5. **You can't hear or watch.** Judge audio with transcripts and loudness numbers, and judge
   pictures with rendered stills. Never write "sounds great" or "looks perfect". Write what you
   measured.
6. **All on-screen text is typeset in code.** No image or video model ever draws text.
7. **Real data for maps and charts.** Natural Earth for geography, published datasets for rankings.
   Never hand-draw a border or invent a number.
8. **No impersonation.** No real person's face or voice, and no lookalikes of other creators'
   characters. Original casts only.
9. **Deterministic frames.** Frames are pure functions of `t`: no `Math.random`, no clock. Use the
   seeded `rnd()` / `hash()`.
10. **Secrets never go in files, logs or chat.** The OpenRouter key comes from `OPENROUTER_API_KEY`
    or `~/.config/openrouter/key`.

## Which worker does which stage

| Stage | Can be done by | Needs |
|---|---|---|
| topic (draft) | any model | web search, `knowledge/hooks.md` |
| topic (approve) | **human** | 1 minute |
| research | any capable model | web fetch; patience |
| script | capable model; strongest model for a new series' first 3 episodes | `knowledge/style.md`, the example |
| voice | tool | TTS quota |
| storyboard | capable model | `engine/catalog.json` |
| picture | tool renders; a model **with vision** reviews | image input |
| final, package | tool, then any model | |
| publish, analytics | tool or **human** until the YouTube API is connected | |

## How to report when you stop

```
EPISODE  <channel>/<slug>
STAGE    <stage>  PASSED | FAILED after N attempts | BLOCKED
DID      <one or two lines>
MEASURED <numbers the gate printed that matter: WER, runtime, LUFS…>
OPEN     <anything a human must decide or check, e.g. "listen to line 'lost'">
```

## Where things live

| Path | What |
|---|---|
| `studio/channels/<id>/bible.json` | Everything that makes a channel consistent |
| `studio/sop/` | One playbook per stage (this folder) |
| `studio/schemas/` | The exact shape of every file a stage produces |
| `studio/engine/catalog.json` | The scene types a storyboard may use |
| `studio/knowledge/` | Lessons, hook patterns, style guide, performance log. Read it, and append to it when a stage teaches you something |
| `studio/examples/emu-war/` | A complete, passing episode. When unsure what "good" looks like, copy its shape |
| `episodes/<channel>/<slug>/` | Work in progress. `build/` is scratch and never committed |

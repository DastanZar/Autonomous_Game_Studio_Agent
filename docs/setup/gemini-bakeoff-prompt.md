# Prompt for a Gemini (or any non-Claude) agent: bake-off C2

> You're joining a video studio repo: **DastanZar/Autonomous_Game_Studio_Agent**. Read `AGENTS.md` first and follow it.
> Your task: build the Point Roberts Short again in **HyperFrames**, from scratch, without looking at
> `episodes/why-map/point-roberts/bakeoff-hyperframes/` (that is another agent's attempt, and you must not copy it).
>
> - **Inputs:** `episodes/why-map/point-roberts/`:
>   - `script.json`;
>   - `dossier.json` (the only facts allowed on screen);
>   - `timeline.snapshot.json` (word timings);
>   - `out/point-roberts-v1.mp4` (extract its audio track and reuse it).
> - **Channel look:** `studio/channels/why-map/bible.json` (fonts in `studio/engine/fonts/`). Keep text out of the safe zones: top 220 px, bottom 420 px, right 140 px.
> - **Maps:** real data only. Use `python3 studio/tools/geo.py episodes/why-map/point-roberts` for geometry.
> - **Tool:** HyperFrames (`npx hyperframes init`, set `HYPERFRAMES_NO_TELEMETRY=1`). Follow its skills.
> - **Output:**
>   - `episodes/why-map/point-roberts/out/bakeoff-gemini.mp4`, 1080x1920, 24 fps;
>   - source in `episodes/why-map/point-roberts/bakeoff-gemini/`;
>   - a `REPORT.md` there covering: time taken, problems, lint/check results, and frozen time measured with
>     `ffmpeg -vf "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG"`
>     (samples < 0.35 = frozen).
> - **Before you stop:** log this chat in `docs/log/`, then run `python3 studio/tools/closeout.py "Bake-off C2 (Gemini)"`.

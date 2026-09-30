# data-flags engine fixture

Test episode for the ranked channel's scene types `ranking_bars`, `ranking_race` and the country `versus` card.
**Every number in it is sample data** (the dataset `source` fields say so); it is not a real episode and must not be published.

    node studio/engine/render.mjs studio/engine/fixtures/data-flags sheet   # expect: "engine: no warnings"
    -> build/contact.png (review sheet), build/sheet/*.png (one full-size still per scene, plus two mid-race stills)

`build/timeline.json` is a **synthetic** voice timeline (no speech) made by `make_timeline.py` from `script.json`. It is committed
(only that file under `build/`, see `.gitignore`), so the render command above works on a fresh checkout. If you edit `script.json`,
re-run `python3 studio/engine/fixtures/data-flags/make_timeline.py`. For a real episode the voice stage writes `build/timeline.json`
(studio/sop/04-voice.md). `gen_race.py` regenerates `data/race.json`.

Dataset shapes are documented at the top of `studio/engine/scenes/ranking.js`.

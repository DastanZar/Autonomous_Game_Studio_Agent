# Point Roberts: three picture methods, one Short

Each folder is a full episode directory: the same `script.json`, voice and timing (copied from the parent), its own
`storyboard.json` and `scenes.js`, and a finished `out/point-roberts.mp4`.

| Folder | Method | Notes |
|---|---|---|
| `a/` | Art-directed paper: the Emu War's craft as rules | lit paper pieces, one palette, a recurring local character, designed paper props |
| `b/` | 3D paper miniature (Three.js in our engine) | real coastline in relief, soft shadows, one continuous camera; `vendor/00-three.min.js` (MIT) |
| `c/` | Kinetic infographic | night map, glowing lines, moving type, unit charts; storyboard `theme: data-flags` (flat) |

The comparison and the measurements are in `docs/research/methodology-3-versions-2026-10.md`.

**Rebuild a version** (from the repo root, after the parent episode's voice stage):

```bash
cp episodes/why-map/point-roberts/build/{timeline.json,vo.wav} episodes/why-map/point-roberts/variants/<v>/build/
python3 studio/tools/geo.py episodes/why-map/point-roberts/variants/<v>
(cd episodes/why-map/point-roberts/variants/<v> && node ../../../../../studio/engine/render.mjs . full 4)
python3 studio/tools/audio.py episodes/why-map/point-roberts/variants/<v>
python3 studio/tools/encode.py episodes/why-map/point-roberts/variants/<v>
```

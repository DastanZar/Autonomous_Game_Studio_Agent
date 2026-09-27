# Step 2: Assets (fonts, map, voice model)

## 2.1 Create `shorts/emu-war/tools/extract_australia.js`

This script pulls the Australia coastline out of the Natural Earth 1:50m world map.

```js
{{FILE:shorts/emu-war/tools/extract_australia.js}}
```

## 2.2 Create `shorts/emu-war/tools/fetch_assets.sh`

```bash
{{FILE:shorts/emu-war/tools/fetch_assets.sh}}
```

## 2.3 Run it

```bash
chmod +x shorts/emu-war/tools/fetch_assets.sh
bash shorts/emu-war/tools/fetch_assets.sh
```
**Checkpoint:** it prints `[ 1154, 33, 162 ]` (point counts for mainland Australia, a small island
and Tasmania), then six lines ending in `: OK`.

## What these are
- **Anton**: bold condensed caps for captions, counters and stamps.
- **Special Elite**: a typewriter face for paper labels and the telegram.
- **DM Serif Display**: the major's quote card.
- **`australia.json`**: an array of polygons, each an array of `[lon, lat]` pairs rounded to 3 decimals.
- **`en_US-ryan-high`**: the Piper neural voice (American male). It's only needed for a fresh take
  (step 7); the exact build uses the saved takes.

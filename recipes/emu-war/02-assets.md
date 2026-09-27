# Step 2: Assets (fonts, map, voice model)

## 2.1 Create `shorts/emu-war/tools/extract_australia.js`

This script pulls the Australia coastline out of the Natural Earth 1:50m world map.

```js
// Run from assets/: reads countries-50m.json + topojson-client.min.js, writes australia.json
const fs=require('fs');const vm=require('vm');
const src=fs.readFileSync('topojson-client.min.js','utf8');const ctx={};vm.createContext(ctx);vm.runInContext(src,ctx);
const topo=JSON.parse(fs.readFileSync('countries-50m.json'));
const fc=ctx.topojson.feature(topo,topo.objects.countries);
const au=fc.features.find(f=>f.properties.name==='Australia');
// keep polygons with >= 30 points (mainland + Tasmania)
let polys=au.geometry.coordinates.map(p=>p[0]).filter(r=>r.length>=30);
polys=polys.map(r=>r.map(([x,y])=>[+x.toFixed(3),+y.toFixed(3)]));
console.log(polys.map(p=>p.length));
fs.writeFileSync('australia.json',JSON.stringify(polys));
```

## 2.2 Create `shorts/emu-war/tools/fetch_assets.sh`

```bash
#!/usr/bin/env bash
# Downloads fonts + map data into assets/ and the Piper voice into ~/voices, then verifies checksums.
set -euo pipefail
cd "$(dirname "$0")/../assets"
curl -sSL -o anton.ttf            https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm0K0.ttf
curl -sSL -o special-elite.ttf    https://fonts.gstatic.com/s/specialelite/v20/XLYgIZbkc4JPUL5CVArUVL0nhnc.ttf
curl -sSL -o dm-serif-display.ttf https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2K_c.ttf
curl -sSL -o countries-50m.json   https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json
curl -sSL -o topojson-client.min.js https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js
node ../tools/extract_australia.js
rm countries-50m.json topojson-client.min.js
mkdir -p ~/voices
V=https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high
[ -f ~/voices/en_US-ryan-high.onnx ] || curl -sSL -o ~/voices/en_US-ryan-high.onnx $V/en_US-ryan-high.onnx
[ -f ~/voices/en_US-ryan-high.onnx.json ] || curl -sSL -o ~/voices/en_US-ryan-high.onnx.json $V/en_US-ryan-high.onnx.json
md5sum -c <<'SUMS'
bdbc086d4e486ab275cf5a4fc78ed591  anton.ttf
dd3116ab886cc8e643629424ab079fd1  australia.json
17382e6dac406d4a83e36d3c039d8612  dm-serif-display.ttf
02ba273e07d711ec5d74846d31a64dd2  special-elite.ttf
SUMS
(cd ~/voices && md5sum -c <<'SUMS'
5d879a17bddf5007f76655b445ba78b4  en_US-ryan-high.onnx
444ff9d6c17218a0eb1d12a20559d869  en_US-ryan-high.onnx.json
SUMS
)
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

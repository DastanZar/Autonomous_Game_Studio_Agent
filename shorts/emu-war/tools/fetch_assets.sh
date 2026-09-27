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

# Step 1: Environment

## 1.1 Versions used for the reference build

| Tool | Version |
|---|---|
| OS | Linux x86_64 |
| Python | 3.11.15 |
| Node.js | 22.22.2 |
| Playwright (global npm package) | 1.56.1, with its Chromium build `chromium-1194` |
| piper-tts | 1.8.0 (onnxruntime 1.30.0) |
| faster-whisper | 1.2.1 (ctranslate2 4.8.2) |
| numpy / scipy | 2.4.6 / 1.17.1 |
| imageio-ffmpeg | 0.6.0 (bundles ffmpeg 7.0.2 with libx264) |

Different versions (especially Chromium or numpy) can change pixels or samples slightly. The grader
then reports "not identical" per item and falls back to a visual-similarity score.

## 1.2 Install

```bash
pip install piper-tts==1.8.0 faster-whisper==1.2.1 numpy==2.4.6 scipy==1.17.1 imageio-ffmpeg==0.6.0
npm install -g playwright@1.56.1
npx playwright install chromium
```
Skip the last line if Playwright's Chromium is already installed (`echo $PLAYWRIGHT_BROWSERS_PATH`
set and non-empty means it is).

**Checkpoint:**
```bash
python3 -c "import piper, faster_whisper, numpy, scipy, imageio_ffmpeg; print('python ok')"
npm root -g
```
prints `python ok` and a folder path.

**The one allowed edit:** `render/render.mjs` (step 4) loads Playwright from
`/opt/node22/lib/node_modules/`. If `npm root -g` printed a different folder, use that path plus a
trailing `/` in the `createRequire("...")` line of `render.mjs`. Change nothing else.

## 1.3 Folders

```bash
mkdir -p shorts/emu-war/assets shorts/emu-war/render shorts/emu-war/tools shorts/emu-war/build shorts/emu-war/out
ls recipes/emu-war/golden
```
**Checkpoint:** the listing shows `frames  lines  reference.json  timeline.json`.

When you're done, the tree looks like this:
```
shorts/emu-war/
├── script.json
├── assets/   anton.ttf  special-elite.ttf  dm-serif-display.ttf  australia.json
├── render/   index.html  emu.js  render.mjs
├── tools/    extract_australia.js  fetch_assets.sh  vo.py  audio.py  encode.sh  verify.py
├── build/    (generated)
└── out/      (deliverables)
```

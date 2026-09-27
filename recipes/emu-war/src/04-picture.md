# Step 4: The picture

## 4.1 Create `shorts/emu-war/render/index.html`

This is the page Chromium loads: three fonts and one 1080×1920 canvas.

```html
{{FILE:shorts/emu-war/render/index.html}}
```

## 4.2 Create `shorts/emu-war/render/emu.js`

This is the renderer. `render(t)` draws the frame at time `t` (seconds). It holds the palette, the
paper-cutout helpers, the characters (emu, soldier, Lewis gun, truck), 13 scenes, torn-paper wipes,
captions, the paper texture and grain. `sfxCues()` exports the sound-effect timeline.

```js
{{FILE:shorts/emu-war/render/emu.js}}
```

## 4.3 Create `shorts/emu-war/render/render.mjs`

This drives headless Chromium: it loads the page, injects the timeline and map, calls `render(t)`
for each frame and saves JPEGs. Rendering is resumable: existing frames are skipped.

```js
{{FILE:shorts/emu-war/render/render.mjs}}
```

## 4.4 Optional: review contact sheet

```bash
cd shorts/emu-war/render && node render.mjs sheet 1.0,21.2,25.9,36.0,44.5 && ls ../build/sheet && cd ../../..
```
**Checkpoint:** five PNGs, `t001.00.png` … `t044.50.png`. If you can view images, check them:
- at 1.0 s, a soldier and a giant emu with a red "1932" stamp;
- at 21.2 s, emus scattering outside a red dashed circle;
- at 25.9 s, a red "JAMMED" stamp;
- at 36.0 s, a clipboard with five stars;
- at 44.5 s, an emu staring into the camera.

## 4.5 Render every frame

```bash
cd shorts/emu-war/render && node render.mjs full 4 && cd ../../..
```
**Checkpoint:** it ends with `rendered 1105 frames in …s`, and `ls shorts/emu-war/build/frames | wc -l`
prints `1105`. The run also writes `build/cues.json` and `build/scenes.json`.

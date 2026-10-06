# Research: VEED OpenEdit and the Turkish animation style catalogue, vs our pipeline

Read-only analysis. Paths: A = /home/user/veedstudio/open-edit, B = /home/user/yasinozmeen/animasyon-stil-katalogu (stiller/<style>/anim.html unless stated).

## Bottom line
- A: useful as an engineering reference (virtual clock, segment-cached re-render, ducking filtergraph, Whisper-JSON mapper). There is NO closed "VEED Engine" and NO PolyForm Shield anywhere in this checkout. Do not adopt it as a dependency; steal 3 ideas.
- B: architecturally the same as ours, and a rich source of techniques we lack. No licence file, so it is ideas only: re-implement, do not paste.

---

# REPO A: VEED OpenEdit

## Architecture (what it actually is)
- One npm package, `@veedstudio/openedit-cli` (package.json), Apache-2.0 (LICENSE, NOTICE, package.json "license"). Dependencies are only `playwright-core` 1.63 and `undici`. Single git commit "Mirror from veed-llm-editor (#27)".
- The product is an agent skill, `.claude/skills/open-edit/SKILL.md` (+ TRANSCRIPTION.md, CUT.md, FABRIC.md, VEED.md), plus ~35 CLI subcommands in `cli/src/commands/`. The agent (Claude/Codex/Gemini) authors an HTML page; the CLI renders it. SKILL.md: "You author the piece yourself, as an HTML page, and render it with `render`." There is no template library, no scene catalog, no caption designs shipped. Design is left entirely to the model ("The skill gives your agent tools and leaves the design to it", .github/README.md).
- Hooks: `.claude/settings.json` registers a SessionStart hook running `npx --yes @veedstudio/openedit-cli session-start claude` (runs init, may self-update patch/minor of the CLI). Sandbox allowlist: `*.veed.io`, fonts.googleapis.com, fonts.gstatic.com, storage.googleapis.com.

## How rendering works, and the "VEED Engine" question
- The renderer is open TypeScript in this repo: `cli/src/commands/render.ts` (729 lines), `cli/src/render/{session,page-runtime,browser,encode,timing,range,server}.ts`.
- Browser: Chrome Headless Shell 153.0.8010.12, downloaded on first use from `https://storage.googleapis.com/chrome-for-testing-public/...` with size+MD5 pinned (`cli/src/render/browser.ts:15-39`). Google's binary, not VEED's. `--chrome <path>` can point at a local Chromium. `install-browser` pre-fetches (~120 MB linux64).
- Frame capture: CDP `Page.captureScreenshot` PNG per frame (`render/session.ts:392`), N parallel Chrome workers each on a contiguous frame run, piped to ffmpeg `libx264 -preset veryfast -crf 15 -pix_fmt yuv420p -threads 4` (`render/encode.ts:25-26`). Output is silent; ProRes 4444 with `--transparent`.
- Determinism: `render/page-runtime.ts` injects a virtual clock before page code: seeded `Math.random` (mulberry32, lines 26-31), virtual `performance.now`/`Date`/timers/rAF, seeks every CSS/Web Animation each frame (`document.getAnimations()`, lines ~110-150), seeks GSAP's global timeline, calls optional `window.__seek(t)`, and frame-accurately seeks `<video>`. Same "frames are pure functions of t" rule as ours, but enforced by the runtime rather than by discipline, and it makes ordinary HTML/CSS/GSAP deterministic.
- Incremental render: segments + manifest cached in `<out>.render/`; `--from/--to` re-renders only overlapping segments and stream-copies the rest (`render/range.ts`, README "render" section). Output identical whatever `--workers`.
- Network/account/telemetry: `render`, `mix-audio`, `mux-audio`, `frames`, `fonts`, `apply-edl`, `speech-probe`, `transcribe --provider whisperx` need no login and no VEED server. Only first-use Chrome download (storage.googleapis.com), Google Fonts (`fonts` command, optional) and npm registry (self-update check). No telemetry code found (grep for telemetry/analytics/sentry/posthog: nothing). VEED login (OAuth 2.1 + PKCE, `cli/src/veed/oauth.ts`) is only for hosted transcription, Fabric talking heads, free background-removal route, `veed-project`/`veed-pull` editor hand-off.
- Licence: the whole repo is Apache-2.0. The task brief's claim ("renderer binaries closed, PolyForm Shield") is not supported by this checkout: `grep -ri polyform` returns nothing; the only "shield" hit is a shields.io badge. NOTICE says only the VEED-hosted services are "governed by VEED's terms, separately". So: nothing here forbids anything for a monetised channel. If a closed "VEED Engine" binary exists, it lives outside this repo (perhaps the VEED editor itself); I found no code path that downloads it. Caveat: single mirrored commit, so history is not checkable; re-verify if a later version adds a binary download.

## Captions / subtitle styling and word timing
- Word timing seam: `runs/<key>/transcript.json` = `{text, chunks:[{text, timestamp:[s,e], words:[{text, timestamp:[s,e]}]}]}` (`cli/src/transcript/transcript-types.ts`). Per-word times are mandatory; untimed words are interpolated across segment boundaries and counted (`transcript/whisper-mapper.ts`, header lines 1-30); if no segmentation it groups by prosody. `openedit whisper <json> <media>` maps WhisperX, openai-whisper, whisper-timestamped, mlx-whisper, whisper.cpp `-oj -ml 1`, and OpenAI verbose_json. Media may be an audio file, so generated narration works ("the route for generated narration", AGENTS.md).
- Caption STYLING: none shipped. The README examples (docs/examples/*.webp, "viral subtitles") are agent-authored HTML. There is no caption design catalogue, no preset, no CSS to lift. Only guidance: "without them the caption reveals drift", reference-image prompting ("subtitles that look like this [IMG-REF]").
- Local transcription: WhisperX via `install-whisperx` (uv/pipx isolated env), CPU `int8` default (`OPEN_EDIT_WHISPERX_DEVICE/COMPUTE`), `small.en` default, `medium` optional. We already use faster-whisper; no gain.

## Motion graphics approach
HTML/CSS/GSAP/canvas pages in headless Chrome, `#stage` or `[data-stage]` element is the canvas. No built-in motion library. Agent looks at `render --stills 0.5,2,4 --sheet` contact sheets and `frames --sheet` and iterates (same as our review step).

## Audio / music / SFX
- `mix-audio runs/<key>` from a JSON spec: tracks `{path, atSec, gainDb, fadeInSec, fadeOutSec, role: voice|music|sfx|ambience, duck}` -> one m4a (`cli/src/commands/mix-audio.ts:20-111`). Voices form a bus; `duck:true` beds go through `sidechaincompress=threshold=0.03:ratio=8:attack=20:release=600` keyed by the (padded) voice bus; `amix normalize=0`; `adelay` per track. Comments document pitfalls (quiet narration never crosses threshold; key must be padded or output truncates).
- `mux-audio` lays a track onto a silent render at -14 LUFS / -1 dBTP.
- Generation: none built in. Music/voice/SFX are "any fal model" via `openedit fal run <model>` on the user's own FAL_KEY (PAID, billed to fal). Fabric (talking head, ~4 credits/s of video, VEED AI Playground credits, PAID, login). Free: nothing generated; only Wikimedia Commons stills (`stills`), free background removal route, WhisperX. For our free-only rule: no audio generation value here.

## Can it run CPU-only in a Linux container?
Yes for render/mix/mux/frames/WhisperX-CPU. Needs Node >= 20.18.1, ffmpeg on PATH (init only prints `apt install ffmpeg` on Linux, "least exercised, CI covers macOS and Windows"), Chrome Headless Shell download (needs outbound storage.googleapis.com; sandbox auto-detection `sandboxRefused` in session.ts handles containers without user namespaces). Same constraints as our Playwright setup.

## Useful vs locked
Useful (all Apache-2.0, copy/port freely with NOTICE retained):
1. Virtual-clock injector (`render/page-runtime.ts`): lets us write CSS/GSAP/WebAnimations scenes or third-party libs without breaking determinism; also guards `Date.now`, timers, rAF.
2. Segment cache + `--from/--to` patch re-render (`render/range.ts`, `commands/render.ts`): cuts iteration cost after a single-scene fix. We currently re-render everything.
3. `mix-audio` filtergraph (ducking, fades, delays, padding fix): a ready-made, tested alternative to our ducking code; spec shape (role/duck/gainDb) is clean.
4. `speech-probe` + `apply-edl` + `retime-transcript` (CUT.md): not needed for faceless TTS shorts.
5. Prompt/skill knowledge (SKILL.md "Talking to the user", Money section): low value, generic.
Locked/paid: Fabric, VEED hosted transcription, fal models, VEED editor hand-off. None needed.
Not present: caption designs, motion templates, music, SFX, any "editing grammar" library.

---

# REPO B: animasyon-stil-katalogu

## Licence
No LICENSE/COPYING file anywhere (`ls LICENSE*` fails; README and BRIEF.md state none). => no licence = all rights reserved, ideas only. Fonts are Google Fonts under SIL OFL (README). Clips are 20 x 1280x720 30 fps h264 (0.29-7.5 MB, 9-10 s each; catalog reel katalog.mp4 3:46, 22.7 MB). The big ones are film-grain styles: belgesel-16mm 5.9 Mbps/7.5 MB, cizgi-roman 4.6 Mbps/5.9 MB; flat styles 0.2-0.6 Mbps. Confirms our "grain = huge files; fixed bitrate" pitfall. Note all clips are 16:9 (1920x1080 source), so every coordinate must be re-laid-out for our 1080x1920.

## Pipeline parity with ours
- Each `anim.html`: 1920x1080 canvas, `window.draw({t})` returns base64 JPEG (q 0.92), `window.ready` awaits fonts/pre-renders; `render_ornek.mjs` runs N Playwright pages round-robin over frame indices; ffmpeg crf 18. Same architecture as ours but no frame-purity enforcement: `Math.random` used in prep() of kinetik-tipografi (line 135), terminal (line ~214), veri (line 177) for grain; with parallel pages this differs per worker (static noise only, so harmless, but our rule bans it).
- Audio: each style exports `window.SFX = [{t, k, v}]` (or `window.events()`), a tiny `sfx.mjs` dumps it via Playwright to sfx.json, `sfx.py` synthesises numpy WAV (wood ticks, blips). SFX times are computed from the same timeline constants/easings (e.g. `passT()` and `invIO()` invert an easing so a tick lands exactly when the radar sweep or counter crosses a value: hud 44-54; veri 34-38; memphis 183-186 finds wheel/pointer border crossings by sampling at 1/240 s). Worth copying: visual events and SFX come from one source.
- Instruction in BRIEF.md: "Expensive effects (texture, grain, blur glow, paper) generate once on an offscreen canvas, never per frame". We do the same.

## 20 styles: technique | why it looks good | fit
1. kurzgesagt: flat vector planet/atmosphere sprites, crescent shading by even-odd clip, glow sprite, spring easing | unified light direction + rim + soft glow; word-stagger pop titles | Gut Gang (organs as shaded circles/blobs on glowing sets). 
2. izometrik: custom iso projection `P(x,y,z)`, box/cyl/sphere with 3 face tones, drop-in with squash, `onFace` maps 2D canvas drawing onto a 3D plane | crisp, toy-like, camera pull-back reveals tile grid | LeaderFlags (rank tiles as iso blocks) and Gut Gang sets; Border Quirks no.
3. bauhaus: 12-col grid drawn in, 3 primitives, expo easings, masked letter rises, odometer counter, circle wipe, print grain | restraint, hard easing, mechanical stepping | LeaderFlags (ranking numbers, grid layout).
4. memphis: pattern fills, hard offset shadows + ink outlines, elastic/back easing, wheel with anticipation+settle, confetti, trampoline letters | energy, every element wiggles/hops | Gut Gang (playful), LeaderFlags hooks.
5. beyaz-tahta: Path class draws hand-jittered polylines by arc length, text revealed by clip, pen sprite follows head, camera pans to follow connector arrow | "being drawn" feel | Border Quirks (explaining borders, route arrows), Gut Gang explainers.
6. kara-tahta: same engine + chalk grain mask (`destination-in`), dust halo stroke, eraser stamp wipes via mask + streak texture, falling dust particles | tactile erase | Gut Gang (lesson beat) secondary.
7. blueprint: dashed centerlines, dimension lines with arrowheads, leader callouts, cross-hatch, spec-driven in `acts[]` | technical authority | Border Quirks (distances/areas callouts), LeaderFlags "stats" cards.
8. tek-cizgi: one resampled polyline morphs between 3 shapes (bubble > mic > word) with staggered per-point easing, pressure-varying width | elegant transitions | Border Quirks (outline morphs: border A -> border B using real data resampled to N points).
9. kagit-kesik: layered paper pieces with per-layer rim light, inner shadow, blurred silhouette cast shadow, parallax, light direction animates, multiply color grade | real depth, the best paper look here | Border Quirks (primary).
10. karakalem: stroke objects (guide lines, 2-pass contour, hatching) drawn along arc length with 12 fps boil, graphite multiplied by paper "tooth" mask, page turn via reflection matrix | hand-made | Gut Gang (organ sketches) / Border Quirks intros.
11. linocut: 2-colour print (black+red), ink = layer x noisy mask x multiply with 4px misregistration, V-gouge "lens" cuts, stamp-in at 12 fps with overshoot, roller wipe, print peel | authentic block-print | Border Quirks (stamp reveals, "classified" facts); strongest "stamp" language.
12. kil: clay renderer from a mask: inner shadows via shadowOffset trick, rim light, spec blob, fingerprint pattern, shape morph by resampled outlines, 12 fps lumpiness | squash/stretch + step-motion charm | Gut Gang (soft organ characters).
13. retro-70ler: dashed-stroke ribbon draws (`setLineDash([L*u, 2L])`), RGB channel split, scanline multiply, TV on/off squash, 4-colour wipe | nostalgic | none (maybe a series intro).
14. piksel: render at 320x180, nearest-neighbour upscale x6, 18-colour palette, hand bitmap font, SNES mosaic, 8-step fade, iris | authentic constraint | none.
15. belgesel-16mm: layered film emulation: gate weave, exposure flicker, overlay grain (8 tiles), scratches, dust/hair, splice flash, frame slip, iris out, vignette | convincing archive footage | Border Quirks (history/"1952" beats, as a grade).
16. cizgi-roman: Ben-Day dots by rotated tiled pattern, halftone gradient, ink misregistration, panels drawn in clockwise, keyframe camera over whole page with 3-sample motion blur, SFX lettering | comic energy | Gut Gang (short comedic beats), Border Quirks "myth vs fact" panels.
17. terminal: phosphor persistence by re-rendering lagged frames, 2-level downsampled bloom, scanlines, dither, CRT on/off line-dot | none for our channels.
18. hud: ring/arc draw-in, conic-gradient radar sweep, scramble-decode text, callouts with leader lines, radial-to-linear unroll preserving arc length, SFX tied to sweep | clean tech | LeaderFlags (scoring/analysis) possible; low priority.
19. veri: editorial chart: line reveal along polyline with value-head counter, direct labels, tabular-width digits, bracket delta + counting number, scroll transition | credible newsroom feel | LeaderFlags (primary template for rankings/charts).
20. kinetik-tipografi: size/weight (variable font wght axis 200-800) tied to sound vs silence, camera scroll between line groups, word wall filling by distance, per-letter squash exit | speech-driven typography | all three (hook line, key stat), best for punchy Shorts openers.

## Reusable techniques we lack (file, lines, excerpt)
Compared with our studio/engine/core.js (has hash/rnd, eio/eout/back, boil(), paper texture + 6 grain patterns, torn-edge transition, stampImage) and studio/stylelab/base.js (grain, text).

1. Paper pieces with rim light + inner shadow + cast shadow (Border Quirks) - kagit-kesik/anim.html:49-72, 296, 312-316.
```js
c.save(); path(c); c.fillStyle = shade(color, rimK); c.fill(); c.clip();
c.save(); c.translate(1.8, 2.4); path(c); c.fillStyle = color; c.fill(); c.restore(); // light rim only on outer edge
c.fillStyle = TEXPAT; c.fillRect(-4000,-4000,8000,8000); c.restore();
// shadow canvas: blur(blur) copy of layer, then globalCompositeOperation='source-in' fill '#0d0a14'
```
Layer shadow drawn at `light*gap` offset each frame, light vector animated (line 258-259), whole frame graded with `multiply` fill (night cool / dawn warm).
2. Paper fibre texture, cheap (kagit-kesik:28-47): 300 soft radial blotches, 2200 short quadratic-curve fibres (light/dark), 5000 specks, on a 768 tile as a repeat pattern; fills only each piece via clip.
3. Ink-mask print compositing (linocut:46-58, 187-192, 207-216). Layer = shape drawn in black; `destination-in` with a precomputed noisy mask (low-freq density + patchy "ink didn't take" + paper-tooth pinholes); `source-in` ink colour; blend with `multiply`; red plate offset `(4,-3)` for misregistration; 4 mask variants cycled `mi=Math.floor(t*8)%4` so texture "boils". `stamp(tq,t0)` returns scale 1.07 / 0.985 / 1 and jitter on the first 2 steps at 12 fps (lines 77-83) = print-down thunk. Directly upgrades our stamp_reveal.
4. V-gouge "lens" cuts and rough polygon edges (linocut:61-73): `lens()` = two quadratic curves between endpoints (pointy lozenge) used with `destination-out` to carve highlights into solid fills; `roughPoly()` subdivides edges and jitters normal-wise. Gives carved look to flags/text without any image.
5. Clay shader from a mask (kil:60-85): `inner(col,dx,dy,blur)` draws an inverted-mask copy using `shadowOffsetX = 10000+dx` and `drawImage(INV,-10000,0)` so only the shadow lands inside the shape (inner shadow, inner light, rim lip), plus a radial spec blob and a fingerprint-texture pattern shifted per 12 fps step. Reusable for Gut Gang organs (3D-ish with no 3D). 
6. Graphite/ink tooth (karakalem:28-54, 233-239): strokes drawn on a transparent layer, then `destination-in` with a TOOTH alpha mask (0.42-1 random*fibre), then tinted `source-in` and `multiply` onto paper.
7. Crescent shading by even-odd clip (kurzgesagt:126-131): fill rect minus offset circle `fill('evenodd')` inside a circle clip gives the Kurzgesagt dark crescent; second one for rim light. Two lines make any ball/blob look lit. Combine with additive glow sprite `globalCompositeOperation='lighter'` (132-136).
8. Spring + extra easings (kurzgesagt:72, bauhaus:31-35, memphis:80). We have only eio/eout/back.
```js
const spring = (x,f=3.2,d=5.5)=> x<=0?0:1-Math.exp(-d*x)*Math.cos(f*Math.PI*x);
const eExpoOut = x => x>=1?1:1-Math.pow(2,-10*x);
const eElastic = x => x<=0?0:x>=1?1:Math.pow(2,-9*x)*Math.sin((x*10-.75)*(2*Math.PI)/3)+1;
```
9. Squash on landing / drop-in (izometrik:105-110; memphis:211, 251): `sq = exp(-land*9)*sin(land*26)*0.16`, applied as scale(1+sq, 1-sq). Cheap, charming; use for flag badges, organ characters.
10. Line-draw reveal along arc length with hand jitter (beyaz-tahta/common.js:23-54; usage 56-60, 167-191). `Path` accumulates points + cumulative length; `trace(ctx,s0,s1)` strokes only the visible span; `jitter(amp,seed)` adds 2-octave sine wobble by arc length; Catmull-Rom `S()`.
```js
const u = ease(seg(t,a.t0,a.t1)); ctx.beginPath(); path.trace(ctx, 0, u*path.len); ctx.stroke();
```
For borders on real map data: build Path from projected coordinates, reveal frontier like a pen (Border Quirks).
11. Dash-offset reveal (cheaper, no class) (retro-70ler ~168-175): `ctx.setLineDash([L*u, L*2]); ctx.stroke()` reveals any path by length; need `L` (our polyline length).
12. Handwriting reveal for text (beyaz-tahta:132-137,167-176): per-glyph prefix widths `xs[i]`, clip rect to `rx`, pen head y bobbing `sin(fr*PI*3+i)`. Caption/label draw-on in code-typeset text. Combine with word timing: t0/t1 from Whisper words.
13. Equal-point-count shape morph with staggered easing (tek-cizgi:69-93; kil:104-136). Resample every outline to N points by arc length, then per-point `u = eio(clamp(tau*(1+stag) - stag*(i/N)))`; lerp. For Border Quirks: morph a country outline into another (or into its "claimed" version).
14. Variable stroke width pressure (tek-cizgi:75-88): chunks of 6 points stroked with width array `5.6+1.2*sin(u*37)*sin(u*11.3+1)+.6*sin(u*91)`.
15. Keyframed camera over a big virtual page + motion-blur sub-frames (cizgi-roman:325-351): `KEYS=[[t,[cx,cy,zoom]]...]`, alternate hold-drift and eased moves, zoom interpolated in log space; if speed `v>8` render page 3x at `t-j/90` with alpha `1/(j+1)`. Directly gives Border Quirks map "fly" shots and avoids static framing.
16. Odometer slide-through-mask counter (bauhaus:146-156) and tabular numbers (veri:48-52): old number slides up out of a clip rect, new one slides in; `numText` draws each digit in the width of "0" so counting numbers do not jitter. LeaderFlags rank/score counters.
17. Masked letter rise (bauhaus:65-72; veri:42-46): clip to a text band and translate glyph from `y+(1-p)*px*1.1` with expo ease; staggered per glyph. Clean Shorts title entrance.
18. Chart line reveal with value head (veri:104-122): walk polyline segments by remaining length, place dot + live-updating number at the head; direct labels instead of legend; fill difference area at 0.075 alpha; bracket + counting delta (veri:93-100). LeaderFlags ranking-chart motion.
19. Variable-font weight as meaning (kinetik-tipografi:105-107, fonts.css `font-weight: 200 800`): `w = lerp(220,800,eIO(...))` with `ctx.font = ${w} ${size}px Bricolage Grotesque`. Needs a variable woff2; we use Anton (single weight), so would need a variable font (Bricolage Grotesque, Inter Tight, Archivo all OFL).
20. Text scramble-decode (hud:66-72): `hash(i*13+floor(t*24)*7)` picks glyph from a set until the character "locks" at `p>0.3+0.7*i/n`. Deterministic, good for number reveals.
21. Camera-follow of pen / world offset panning with eased connector (beyaz-tahta:147-165): world drawn once at large scale, `setTransform(s,0,0,s,W/2-cx*s,H/2-cy*s)`.
22. Dimension/leader callouts (blueprint:36-60; hud:165-186): extension lines, centered dimension line with arrowheads, label; leader = dot + 2-segment polyline + text, each segment reveals in sequence. Good for "distance/area" annotation on maps.
23. Halftone/Ben-Day fills (cizgi-roman:31-58): pattern tile rotated with `p.setTransform(new DOMMatrix().rotateSelf(ang))`; radius-varying dot gradient by iterating a rotated lattice. Edge/gradient shading for flat-vector looks without banding.
24. Page turn / peel via reflection matrix (karakalem:259-285; linocut:233-247): reflect canvas across a slanted fold line `a=1-2nx², b=-2nxny, d=1-2ny²`, back face lighter/translucent, shadow gradient. Better than our torn-edge slide for "next fact".
25. Stop-motion quantisation (kil:166, linocut:77, karakalem:244): `step=floor(t*12)`; positions snap, textures shift per step with `hash(seed,step)` jitter. "Boil" at 12 fps (we have boil()).
26. Film/CRT post chain (belgesel-16mm:239-288; retro-70ler ~297-335; terminal 267-285): gate weave via smooth noise, exposure flicker (screen/multiply), overlay grain from 8 pre-built tiles offset randomly per frame, vertical scratches, per-frame dust and hair, splice flash, vignette + lifted blacks via `lighter`. Reusable as a "1952 archive" grade for Border Quirks history scenes; costs file size (7.5 MB/10 s at 5.9 Mbps).
27. Page-level layered deterministic noise (linocut:29-34 `valueNoise`): tiny random grid upscaled with smoothing = cheap low-frequency noise, sampled via getImageData. We already have value noise `vn` in core.js; this version is faster (canvas upscaling).
28. Wheel/dial with anticipation and settle (memphis:148-153, 178-181): wind-up backwards, fast spin with out-quart ease, post-settle damped oscillation, flapper kick per border crossing. For ranking "reveals"/spinners.

## Recommendations (one list, ordered by value for effort)
1. Port into engine: spring/expo/elastic easings; squash-on-land; `lens`+`roughPoly`+ink-mask `stamp` (linocut) into stamp_reveal; odometer + tabular numbers into count_up/ranking; `Path` with `trace`/`jitter` for map-border draw-on.
2. Border Quirks: add kagit-kesik layering (rim/inner/cast shadow + animated light) and cizgi-roman keyframe camera with sub-frame blur for map flights; tek-cizgi resample-morph for outlines.
3. Gut Gang: kil inner-shadow shader and kurzgesagt crescent+glow shading for organs; drop-in squash; popText word stagger.
4. LeaderFlags: veri-style line/bar reveal with value head and direct labels; bauhaus masked-letter rise; hud decode text for numbers.
5. A tooling item from A: virtual-clock injection and segment-cached partial re-render for faster iteration; keep ours otherwise.
6. Audio: copy B's idea that visual timeline constants export SFX events (`window.SFX`) from the same `T`/easings (inverse-easing `invIO`) so ticks match the picture exactly; use A's ducking filtergraph numbers as a baseline (sidechain threshold 0.03, ratio 8, attack 20 ms, release 600 ms).

## Caveats
- B has no licence and A is Apache-2.0: code excerpts above are for reading; re-implement B's ideas in our own code. A's code may be ported with Apache notice.
- Neither repo gives caption designs, music, or free generative audio. Nothing here removes our "free TTS/CPU only/code-typeset text" constraints.
- B's clips are 16:9; none were verified in portrait. B styles are 9-10 s showcases, so none carry word-cue logic; cue wiring stays our job.
- I could not watch the videos; judgements come from reading code and sizes only.

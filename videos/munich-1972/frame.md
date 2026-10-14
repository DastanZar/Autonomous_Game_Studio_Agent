# frame.md — Munich 1972 (design truth for every scene)

**Concept:** the film opens inside Otl Aicher's 1972 "Cheerful Games" design: a bright, light canvas and rainbow
accents. Colour then drains scene by scene as the day fails, until it is monochrome near-black, and it ends on eleven
names. Aicher's real system used light blue, green, orange, yellow and silver, and deliberately avoided black and red.
**We never use red.** The only "warm" colour after scene 2 is a single muted Munich-blue accent.

## Canvas and palette (by scene act)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F1EA` | Background in S1–S2 (warm off-white, never pure white) |
| `--ink` | `#16181C` | Text on paper; the background from S6 on |
| `--night` | `#0F1114` | Background in S3–S5 (deep blue-black) |
| `--bone` | `#ECE8DF` | Text on dark |
| `--munich` | `#5BB3E6` | THE accent: Aicher light blue (the guards' colour); the only accent that survives to the end |
| `--green` | `#4FB477` | Aicher rainbow (S1 only) |
| `--yellow` | `#F2C230` | Aicher rainbow (S1 only) |
| `--orange` | `#EE8A37` | Aicher rainbow (S1 only) |
| `--silver` | `#B9BEC4` | Rules, labels, secondary text on dark |

**Photos:**
- S1: full colour.
- S2: about 60% saturation.
- S3 onward: grayscale (`filter: grayscale(1) contrast(1.05)`), slightly lifted blacks.
- Every photo gets a soft inner vignette (radial-gradient overlay) and a 2px `--silver` hairline frame when it isn't full-bleed.

## Type

Load the fonts with `@font-face` **inside each sub-composition's `<template>`**, with the URL relative to the project root:

```css
@font-face { font-family: "Archivo"; src: url("assets/fonts/archivo-var.woff2") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Plex Mono"; src: url("assets/fonts/plexmono-400.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "Plex Mono"; src: url("assets/fonts/plexmono-500.woff2") format("woff2"); font-weight: 500; }
@font-face { font-family: "DM Serif"; src: url("assets/fonts/dmserif.woff2") format("woff2"); font-weight: 400; }
```

| Role | Family | Size (1920×1080) | Notes |
|---|---|---|---|
| Display / headline | Archivo 800 | 110–200px | Tracking −0.03em, line-height 0.95, sentence case |
| Body / supporting | Archivo 500 | 40–56px | |
| Timestamps, data, labels | Plex Mono 500 | 28–40px (labels 22–26px) | Uppercase, tracking +0.08em; the "police log" voice |
| Quotes, names | DM Serif 400 | 72–130px | Quotes in curly quotes; names in the final scene |

Text is set in code. Never use text baked into an image. Spell out nothing on screen that the narration hasn't said or
the source doesn't support.

## Layout

- 120px side margins, 90px top. Keep the **bottom 15% clear of key text** (YouTube's progress bar and UI).
- Anchor content to edges and thirds; avoid floating centred stacks, except on the solemn closing beats.
- Persistent foreground detail in every scene: a top-left Plex Mono **slug** (e.g. `05·09·1972  04:30`) and a hairline
  rule. It gives the "produced" look.

## Motion (from /hyperframes-animation and the product-launch motion doctrine)

- Smooth long-tail eases (`power3.out` default, `expo.out` for fast arrivals). **No bounce, no back/elastic.**
- **Reveal on the spoken cue:** nothing appears before the narrator says it. Cue times are given per scene.
- Photos: one slow push or pan per photo **in its first half only**, then hold still. Subtle jitter is the only allowed
  life during a hold. No breathing loops, no `repeat: -1`.
- Seams inside a scene are velocity-matched (cut at peak motion, same direction).
- Entrances use `fromTo`. No CSS transitions or keyframes. Everything runs in one paused GSAP timeline.
- Deterministic: no `Math.random` or `Date`.

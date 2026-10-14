---
message: "West Germany built the 1972 Olympics to bury the memory of Berlin 1936; one day of failures turned them into the Games the world remembers for a massacre."
mode: collaborative
canvas: 1920x1080
duration: 247
---

# Munich 1972: storyboard (dispatch artifact)

**This video tells** a general YouTube audience that the "Cheerful Games" built to bury Berlin 1936 became the Games
remembered for a massacre, through one day of failures.

**Shared truth:** `frame.md` (palette, type, motion). Narration: `assets/vo.wav`, with word timings in `timeline.json`.
**Cues are named by the spoken WORD.** Look the word up in this scene's word-timing table at the bottom of its block (LOCAL seconds; the scene starts at 0) and land the reveal on it (±0.1 s), never earlier.

## Video direction

- **Palette arc:** S1 paper + Aicher rainbow in full colour; S2 paper→night, photos at 60% saturation; S3–S5 night,
  grayscale photos; S6–S9 ink, grayscale, with `--munich` blue as the only accent.
- **Motion grammar:** power3 long-tail; VO-paced reveals; one push or pan per photo in its first half, then hold;
  subtle jitter at most during holds.
- **Held beats (deliberate stillness):** the balcony photo (S4 end); "They're all gone." (S6 end); the names (S9).
- **Negative list:** no red; no bounce; no breathing loops; no text in the bottom 15%; no invented images (only
  the assets listed); never show violence beyond what the listed photos show; never glorify the attackers (no names
  or close-ups of them beyond the anonymous balcony figure).
- **Respect:** victims are named exactly as written here. The attackers' group is named only as "Black September".


## YouTube documentary grammar (USER REQUIREMENT, overrides anything simpler)

The user (14 Oct): "I don't want a collage running with narration, nothing that basic, an actual YouTube-style video."
Think Johnny Harris, Vox and the viral Opus motion pieces. **A photo on screen with narration over it is a failure.**
Every scene must use at least three of these, and never hold a plain static photo for more than about 2 s:
1. **Real archival motion:** cut-in clips from the 1972 Games film (`assets/internal/footage/games72.webm`; use the frame
   index sheets in `assets/internal/footage/index/`). Place them with `<video muted>` inside your scene, trimmed with
   `data-media-start`, and graded to the scene's palette.
2. **2.5D parallax on photos:** split a photo into 2–3 depth planes by duplicating it with `clip-path`/mask cut-outs (the
   subject plane slightly scaled, the background blurred more) and move the planes at different speeds; or a 3D tilt with
   `transformPerspective`. A camera move with depth, not a flat Ken Burns.
3. **Annotation on the image:** draw-on circles, arrows, brackets, callout leader lines and highlight boxes pointing at
   the thing the narrator names (svg-path-draw), with a Plex Mono label.
4. **Paper/print treatments:** newspaper-clipping cards with torn edges or drop shadows; a typed police-log strip; a
   ticker; date stamps.
5. **Maps that move:** a camera flight and zoom on the real map, with drawn routes and pins.
6. **Kinetic type cut to the voice:** words slam or flip in on the spoken syllable; numbers count up; lines type and
   retype.
7. **Match cuts and transitions:** a whip pan, a zoom-through or a light-leak flash between beats, velocity-matched.
8. **Texture:** film grain (host), gate weave on archival (a tiny per-frame offset driven by a seeded sine), and
   occasional film-burn or flash frames at seams.
Pace: a new visual event every 1.5–3 s. Something is always moving except on the three deliberately held beats.

## Frame 0 — Cold open: the door
- status: outline
- src: compositions/frames/s0.html
- id: s0
- global: 0.0–27.4
- duration: 27.4
- blueprint: compose
- rules: discrete-text-sequence, multi-phase-camera
- assets: `assets/internal/negotiators_door.jpg` (the doorway: crop tight, grayscale, crushed blacks), `assets/internal/balcony_wide.jpg` (silhouette only, very dark); optional dark Games-film night shots
- beats (cue = the quoted spoken word):
  - Near-black from frame 0. A Plex Mono slug types "05·09·1972 · 04:30 · CONNOLLYSTRASSE 31" on "Four".
  - On "scratching": a slow, very dark 2.5D push toward a door (negotiators_door.jpg cropped tight on a doorway) with a thin sliver of warm light under it.
  - On "rifles": a hard flash-frame cut; the light sliver widens (the door opening).
  - On "three" (hundred pounds): "135 KG" slams in; on "screams" the frame shakes once (seeded, tiny); on "smashes": a white shard-flash transition.
  - On "dead": cut to black and "11" in DM Serif, alone. On "watch it happen": the title card "MUNICH · 1972" builds (Archivo 800, letter-spaced) and holds about 1.2 s. It is the film's title, and it must feel like a prestige documentary.
- word timings (LOCAL s):
  - n01: 4@0.00 .30@0.56 in@0.96 the@1.16 morning,@1.28 wrestling@2.42 referee@2.72 Josef@3.18 Goodfond@3.74 hears@4.26 a@4.76 faint@4.96 scratching@5.28 at@5.90 his@6.14 door.@6.28
  - n02: The@7.18 door@7.36 begins@7.58 to@7.88 open@8.16 and@8.50 he@9.70 sees@9.80 rifles.@10.08
  - n03: He@11.46 throws@11.76 all@12.08 300@12.40 pounds@12.98 of@13.26 himself@13.50 against@13.74 it@14.16 and@14.62 screams@15.12 a@15.44 warning.@15.66 Behind@16.66 him,@16.94 a@17.48 coach@17.68 smashes@17.88 a@18.34 window@18.52 and@18.76 runs.@19.16
  - n05: By@20.48 the@20.76 next@20.88 morning,@21.08 Godfroind@22.04 and@22.54 10@22.70 of@22.92 his@23.06 teammates@23.22 would@23.62 be@23.96 dead@24.14 and@24.40 the@25.00 whole@25.10 world@25.30 would@25.58 watch@25.72 it@25.94 happen.@26.12

## Frame 1 — The Cheerful Games
- status: outline
- src: compositions/frames/s1.html
- id: s1
- global: 27.4–54.1
- duration: 26.7
- blueprint: kinetic-type-beats (Adapt)
- rules: dynamic-content-sequencing, discrete-text-sequence
- assets: 1972 Games colour footage cut from `assets/internal/footage/games72.webm` (choose shots from `assets/internal/footage/index/sheet_*.jpg`; the timestamp is printed on each thumb), `assets/internal/hostesses_blue.jpg`, `assets/internal/israel_team_opening.jpg`, a genuine 1936 Berlin Olympics photo (the worker sources it from a news site; internal use)
- beats (cue = the quoted spoken word):
  - A flash cut from the black title into full-colour, sunlit 1972 footage (crowds, the stadium roof, the opening ceremony). "1972" in giant Aicher-rainbow digits on "1972,".
  - "party for the whole world": a per-word reveal lower-left over a quick montage of 3–4 footage clips, 1–1.5 s each.
  - "memory.": the footage slows and desaturates; the line holds.
  - "Berlin.": a hard cut to a monochrome 1936 photo with a 2.5D push; "1936" giant in ink; "Hitler's Games." label.
  - "opposite.": a diagonal rainbow wipe in Aicher colours erases 1936; "cheerful" brings the title "The Cheerful Games" + "DIE HEITEREN SPIELE"; "colours,": swatches; "dachshund": "WALDI" label (footage of Waldi if the index has it); "light": hostesses_blue.jpg as a tilted card labelled "OLYMPIC STAFF IN AICHER BLUE"; "unarmed.": slug "SECURITY: MOSTLY UNARMED".
  - Last beat: israel_team_opening.jpg (the Israeli team marching with its flag, 26 Aug 1972) with a drawn annotation circle round the "Israel" placard. This is the team we will lose, so give it a beat of stillness.
- word timings (LOCAL s):
  - p01: In@0.72 1972,@1.32 West@2.60 Germany@3.06 threw@3.46 a@3.82 party@4.00 for@4.36 the@4.64 whole@4.74 world.@4.96
  - p02: It@5.74 was@5.98 meant@6.18 to@6.46 bury@6.72 a@7.02 memory.@7.22
  - p03: The@8.70 last@8.88 time@9.24 Germany@9.60 had@9.96 hosted@10.20 the@10.62 Summer@11.10 Olympics@11.40 was@11.76 Berlin.@12.34 1936,@13.99 Hitler's@15.44 games.@15.86
  - p04: So@17.06 Munich@17.32 would@17.66 be@17.86 the@18.04 opposite.@18.14 The@18.96 cheerful@19.08 games,@19.40 soft@20.52 colors,@20.68 a@21.66 dachshund@21.84 mascot,@22.26 and@23.18 guards@23.44 in@23.78 light@24.06 blue,@24.32 most@25.04 of@25.24 them@25.42 unarmed.@25.60

## Frame 2 — 04:30
- status: outline
- src: compositions/frames/s2.html
- id: s2
- global: 54.1–74.1
- duration: 20.0
- blueprint: compose
- rules: discrete-text-sequence, coordinate-target-zoom
- assets: `assets/internal/village_view.jpg`, `assets/open/map-munich-ffb.svg` + `data/mapmeta.json` (pins in 1920×1080 map space), `assets/internal/negotiators_door.jpg`
- beats (cue = the quoted spoken word):
  - "Then,": colour drains (the host background goes paper → night); the slug types "05·09·1972 04:30".
  - "eight": a giant "8"; "climbed the fence": the fence draws in as thin vertical rules and eight small ticks cross it.
  - "village.": village_view.jpg with 2.5D parallax, 60% saturation.
  - "helped them over": an annotation; "Olympians.": a line in Archivo 500.
  - "Connelly" (Connollystraße 31): the real map (Munich outline, --silver) with a camera flight down to the pin at Connollystraße 31 (coordinate-target-zoom), a ring that pulses three times, and the label "CONNOLLYSTRASSE 31".
  - "building": negotiators_door.jpg (this building, 5 Sept 1972) with the callout "ISRAELI TEAM QUARTERS".
- word timings (LOCAL s):
  - p05: Then,@0.20 at@1.10 about@1.44 4@1.68 .30@2.08 in@2.42 the@2.66 morning,@2.78 on@3.84 the@3.94 5th@4.10 of@4.44 September,@4.54 eight@5.42 men@5.54 climbed@5.84 the@6.30 fence@6.54 into@6.80 the@7.10 Olympic@7.28 village.@7.56
  - p06: Athletes@8.92 coming@9.34 home@9.58 from@9.82 a@10.00 night@10.14 out@10.34 helped@10.66 them@10.96 over.@11.26 They@12.28 thought@12.50 they@12.70 were@12.88 fellow@13.00 Olympians.@13.28
  - p07: They@14.70 went@14.84 to@15.02 Connelly@15.30 -Strauss@15.70 31,@16.22 the@17.34 building@17.58 where@17.80 Israel's@18.18 team@18.84 was@19.04 staying.@19.28

## Frame 3 — The door, the choice, the hostages
- status: outline
- src: compositions/frames/s3.html
- id: s3
- global: 74.1–108.4
- duration: 34.3
- blueprint: compose
- rules: dynamic-content-sequencing, svg-path-draw
- assets: `assets/internal/negotiators_door.jpg`, `assets/internal/apartment_after.jpg` (the apartment afterwards; grayscale)
- beats (cue = the quoted spoken word):
  - "Moshe": name card "Moshe Weinberg" (DM Serif) + "WRESTLING COACH".
  - "forced": a floor-plan diagram drawn in code, three apartment boxes "1 · 2 · 3" in a row (svg-path-draw).
  - "past one apartment": a path draws past box 2 with Plex Mono "APT 2: NO ISRAELIS HERE, HE SAID"; "strongest": the path enters box 3, labelled "WRESTLERS · WEIGHTLIFTERS".
  - "Maybe hoping": the box 3 outline glows --munich; small italic "(his motive is not known)".
  - "asleep.": cut to apartment_after.jpg (grayscale, slow parallax).
  - "Weinberg fought again": his name card returns, then "KILLED"; "Romano": name card "Yossef Romano" + "WEIGHTLIFTER"; on "shot" (too): "KILLED".
  - "Nine men were tied up": nine outlined figure slots appear in a row, then thin lines bind them together (svg-path-draw). Hold.
- word timings (LOCAL s):
  - n08a: Wrestling@0.68 coach@0.68 Moshe@1.10 Weinberg@1.60 was@2.04 shot@2.62 through@2.92 the@3.18 face@3.34 and@3.68 forced@4.44 to@4.76 lead@5.02 the@5.24 gunman@5.44 to@5.70 more@6.08 Israelis.@6.32
  - n08b: walked@7.46 him@8.04 past@8.26 one@8.46 apartment@8.74 and@9.18 took@10.04 them@10.22 to@10.42 the@10.60 strongest@10.76 men@11.04 on@11.32 the@11.48 team.@11.60 Wrestlers,@12.64 weightlifters,@13.60 maybe@14.86 hoping@15.18 they@15.48 could@15.72 fight@15.88 back.@16.08
  - n08c: They@17.30 were@17.42 asleep.@17.60 Weinberg@18.94 fought@19.20 again@19.64 and@20.12 was@20.72 killed.@20.94 Weightlifter@22.22 Josef@22.78 Romano@23.34 wounded@23.86 one@24.32 of@24.60 the@24.76 gunman@24.92 before@25.18 he@25.86 was@26.08 shot@26.28 too.@26.64 They@27.68 left@27.96 his@28.16 body@28.38 at@28.66 his@28.94 teammates@29.18 feet.@29.48 Nine@30.60 men@30.74 were@31.00 tied@31.28 up,@31.52 wrist@32.20 to@32.34 ankle@32.58 to@32.80 each@33.24 other.@33.44

## Frame 4 — The world was watching
- status: outline
- src: compositions/frames/s4.html
- id: s4
- global: 108.4–146.2
- duration: 37.8
- blueprint: video-text-pivot (Adapt)
- rules: multi-phase-camera, counting-dynamic-scale
- assets: `assets/internal/press_pack.jpg`, `assets/internal/roof_police_a.jpg`, `assets/internal/roof_police_b.jpg`, `assets/internal/balcony_wide.jpg`, `assets/internal/balcony_close.jpg`
- beats (cue = the quoted spoken word):
  - "Black": label "BLACK SEPTEMBER · PALESTINIAN MILITANT GROUP" over a dark field; "200": counter 0 → 234 with the footnote "reported as 234 · historians later counted 328 names".
  - "world": press_pack.jpg in 2.5D; "900": counter "900,000,000" + "ESTIMATED TV AUDIENCE".
  - "Spitzer": name card "ANDRE SPITZER · FENCING COACH"; "window": balcony_wide.jpg with an annotation rectangle on a window; "hit…television": a TV-frame treatment (bezel, a "LIVE" bug in --munich) round the image; restraint, no gore.
  - "Police crept across the rooftops": roof_police_a.jpg, then roof_police_b.jpg, with annotation arrows on the officers; "television.": the TV frame again.
  - "broadcast.": cut to balcony_close.jpg, the masked figure, HELD STILL with no motion at all.
  - "off.": slug "RAID CALLED OFF"; pull back to balcony_wide.jpg; hold.
- word timings (LOCAL s):
  - p09: The@0.08 gunman,@0.60 from@1.62 a@1.98 Palestinian@2.18 group@2.64 called@3.28 Black@3.88 September,@4.28 demanded@5.60 the@5.94 release@6.20 of@6.50 more@6.72 than@6.90 200@7.12 prisoners@7.48 held@8.22 in@8.54 Israel,@8.78
  - p10: and@9.70 the@10.10 world@10.20 was@10.44 watching.@10.68 By@11.84 some@12.14 estimates,@12.58 900@13.82 million@14.04 people.@14.50
  - n10b: At@15.80 one@15.94 point,@16.16 fencing@16.82 coach@17.02 Andre@17.42 Spitzer@17.88 was@18.44 brought@18.76 to@19.06 the@19.30 window@19.44 to@19.74 speak@20.22 to@20.52 negotiators.@20.76 When@22.06 he@22.34 tried@22.50 to@22.74 answer,@22.90 a@23.68 gunman@23.80 hit@24.08 him@24.36 with@24.52 his@24.66 rifle@24.82 on@25.24 live@25.68 television.@25.96
  - p11: Police@27.22 crept@27.74 across@28.34 the@28.76 rooftops@29.02 to@29.54 storm@29.78 the@30.12 building,@30.38 live@31.16 on@31.76 television.@32.08 The@33.28 gunman@33.44 were@33.68 watching@34.02 the@34.36 same@34.60 broadcast.@34.88 The@36.06 raid@36.16 was@36.46 called@36.68 off.@36.96

## Frame 5 — Fürstenfeldbruck
- status: outline
- src: compositions/frames/s5.html
- id: s5
- global: 146.2–170.9
- duration: 24.7
- blueprint: spatial-pan-stations (Adapt)
- rules: svg-path-draw, coordinate-target-zoom
- assets: `assets/open/map-munich-ffb.svg` + `data/mapmeta.json`, `assets/internal/helicopters_ffb.jpg`, `assets/open/ffb_aerial.jpg` (CC BY-SA 3.0)
- beats (cue = the quoted spoken word):
  - "night,": slug "05·09·1972 22:00".
  - "helicopter": the map flight from the Connollystraße pin to the air-base pin; the route draws itself with a travelling dot; "Forrest" (Fürstenfeldbruck): label "FÜRSTENFELDBRUCK AIR BASE"; "west": "20.7 KM".
  - "rescue": helicopters_ffb.jpg grayscale backdrop at 35% + ffb_aerial.jpg as an inset.
  - "Five police snipers" then checklist rows on their words: "No telescopic sights", "No night vision", "No radios".
  - "five gunmen.": a big 5; "eight.": the 5 is struck out and an 8 lands in --munich (the host plays a thud).
  - "officers": log line "POLICE TEAM ON THE BOEING 727"; "left.": "→ ABANDONED POST".
- word timings (LOCAL s):
  - p12: That@0.32 night,@0.60 hostages@1.46 and@1.64 captors@2.06 were@2.50 flown@2.68 by@2.92 helicopter@3.18 to@3.58 Forrest@4.08 and@4.32 Feldbrooke@4.56 Air@5.06 Base,@5.30 west@6.06 of@6.18 Munich.@6.44
  - p13: The@7.38 rescue@7.58 plan@7.90 was@8.20 waiting.@8.40 Five@9.38 police@9.58 snipers,@9.96 no@11.00 telescopic@11.20 sights,@11.80 no@12.64 night@12.90 vision,@13.14 no@13.86 radios,@14.12 and@15.12 they@15.24 had@15.38 been@15.52 told@15.68 there@16.00 were@16.28 five@16.42 gunmen.@16.76 There@17.64 were@17.74 eight.@17.92
  - p14: The@18.66 officers,@19.14 hidden@19.88 on@19.98 the@20.22 waiting@20.34 plane,@20.58 decided@21.24 the@21.64 plan@22.06 was@22.32 suicide,@22.54 and@23.40 left.@23.80

## Frame 6 — They're all gone
- status: outline
- src: compositions/frames/s6.html
- id: s6
- global: 170.9–190.9
- duration: 20.0
- blueprint: typewriter-reveal (Adapt)
- rules: discrete-text-sequence
- assets: `assets/internal/helicopter_burned.jpg`
- beats (cue = the quoted spoken word):
  - "shooting": slug "22:38 → 00:00"; a dark field with a faint, seeded light flicker (NOT gunfire imagery).
  - "dead.": helicopter_burned.jpg (grayscale) fades up slowly, still.
  - "Anton": name card "Anton Fliegerbauer" + "WEST GERMAN POLICE OFFICER".
  - "Early reports": the typed headline "HOSTAGES SAFE" + small "EARLY REPORTS"; "three": slug "06·09·1972 03:24"; "McKay": "JIM McKAY · ABC".
  - "gone.": the headline backspaces and retypes as “They're all gone.” in DM Serif. HOLD STILL to the end.
- word timings (LOCAL s):
  - p15: The@0.52 shooting@0.60 lasted@0.94 more@1.34 than@1.80 an@2.00 hour.@2.18 By@3.28 midnight,@3.42 all@4.32 nine@4.54 hostages@4.84 were@5.20 dead.@5.64 So@6.48 was@6.70 a@6.88 German@7.06 police@7.30 officer,@7.70 Anton@8.80 Fliegerbauer.@9.00
  - p16: Early@11.38 reports@11.38 said@11.78 the@12.12 hostages@12.28 had@12.62 been@12.96 saved.@13.10 Then,@14.22 after@14.82 three@15.14 in@15.46 the@15.56 morning,@15.68 ABC's@16.46 Jim@17.02 McKay@17.18 told@17.44 America,@17.80 they're@18.66 all@18.86 gone.@18.98

## Frame 7 — The Games must go on
- status: outline
- src: compositions/frames/s7.html
- id: s7
- global: 190.9–205.7
- duration: 14.8
- blueprint: dataviz-countup (Adapt)
- rules: counting-dynamic-scale, multi-phase-camera
- assets: `assets/internal/memorial_stadium.jpg`; Games-film memorial footage if the index shows it (the stadium, flags at half-mast)
- beats (cue = the quoted spoken word):
  - "34": counter "34 HOURS".
  - "80": memorial_stadium.jpg (grayscale, flag at half-mast) with 2.5D parallax; "80,000".
  - "Avery": label "AVERY BRUNDAGE · IOC PRESIDENT"; "go on.": quote in DM Serif. Hold.
- word timings (LOCAL s):
  - p17: games@0.82 stopped@1.14 for@2.04 34@2.42 hours.@3.00 80@3.80 ,000@3.94 people@4.44 filled@4.74 the@5.10 stadium@5.32 for@5.76 a@6.10 memorial.@6.28
  - p18: Then,@7.70 the@8.04 head@8.04 of@8.28 the@8.52 Olympic@8.68 committee,@9.02 Avery@10.42 Brundage,@10.70 told@11.58 them,@11.82 the@12.84 games@12.86 must@13.20 go@13.56 on.@13.86

## Frame 8 — Fifty years
- status: outline
- src: compositions/frames/s8.html
- id: s8
- global: 205.7–217.2
- duration: 11.5
- blueprint: spatial-pan-stations (Adapt)
- rules: stat-bars-and-fills, counting-dynamic-scale
- assets: `assets/internal/israeli_team_leaving.jpg` (the team going home; grayscale, low opacity)
- beats (cue = the quoted spoken word):
  - "50": a timeline bar 1972 → 2022 fills; "50 YEARS".
  - "president": "FRANK-WALTER STEINMEIER · 2022"; "triple failure.": the quote.
  - "28": counter €0 → €28,000,000.
- word timings (LOCAL s):
  - p19: It@0.36 took@0.64 50@0.82 years@1.32 for@1.64 Germany@1.94 to@2.24 apologize.@2.60 In@3.78 2022,@3.92 its@5.30 president@5.50 called@5.90 it@6.32 a@6.60 triple@6.74 failure.@7.12 The@8.18 families@8.32 received@8.74 28@9.22 million@9.86 euros.@10.22

## Frame 9 — Eleven names
- status: outline
- src: compositions/frames/s9.html
- id: s9
- global: 217.2–247.0
- duration: 29.8
- blueprint: titlecard-reveal (Adapt)
- rules: dynamic-content-sequencing
- assets: `assets/internal/victims_portraits.jpg` (the 11 portraits as one image; do NOT label individual faces)
- beats (cue = the quoted spoken word):
  - "Berlin.": a line on ink.
  - "names": victims_portraits.jpg in grayscale fades in centred at ~70% width; about 2 s after "remember." it dims to 12%.
  - From local 11.3 s, one name every 0.95 s (k = 0…10), in DM Serif with a Plex Mono role, in two columns: Moshe Weinberg — wrestling coach · Yossef Romano — weightlifter · Ze'ev Friedman — weightlifter · David Berger — weightlifter · Yakov Springer — weightlifting judge · Eliezer Halfin — wrestler · Yossef Gutfreund — wrestling referee · Kehat Shorr — shooting coach · Mark Slavin — wrestler · Andre Spitzer — fencing coach · Amitzur Shapira — athletics coach.
  - Local 21.8: "and Anton Fliegerbauer — West German police officer".
  - Local 25.0–29.8: fade to the end card "Sources and image credits in the description" + small "Internal test · not for publication".
- word timings (LOCAL s):
  - p20: Munich@0.08 was@0.76 meant@1.14 to@1.40 make@1.64 the@1.82 world@2.02 forget@2.24 Berlin.@2.62 Instead,@4.06 it@5.02 gave@5.36 the@5.54 world@5.72 11@5.94 names@6.32 to@6.66 remember.@6.96


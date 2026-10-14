"""Rebuild STORYBOARD.md's frame blocks from build/scene_bounds.json + build/cue_tables.md (narration v2, 10 scenes)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
s = open('STORYBOARD.md').read()
head = s[:s.index('## Frame 1')].replace('duration: 181', 'duration: 247')
head = head.replace(
    "**All cue times below are LOCAL to the scene** (scene time 0 = the scene's start). They come from the narrator's measured\nword times; reveal each element on its cue (±0.1 s), never earlier.",
    "**Cues are named by the spoken WORD.** Look the word up in this scene's word-timing table at the bottom of its block "
    "(LOCAL seconds; the scene starts at 0) and land the reveal on it (±0.1 s), never earlier.")
B = {sid: (a, b) for sid, a, b in json.load(open('build/scene_bounds.json'))}
CT = {c.split()[0]: c for c in open('build/cue_tables.md').read().split('### ')[1:]}
F = [
 ('0', 'Cold open: the door', 's0', 'compose', 'discrete-text-sequence, multi-phase-camera',
  '`assets/internal/negotiators_door.jpg` (the doorway: crop tight, grayscale, crushed blacks), `assets/internal/balcony_wide.jpg` (silhouette only, very dark); optional dark Games-film night shots',
  ['Near-black from frame 0. A Plex Mono slug types "05·09·1972 · 04:30 · CONNOLLYSTRASSE 31" on "Four".',
   'On "scratching": a slow, very dark 2.5D push toward a door (negotiators_door.jpg cropped tight on a doorway) with a thin sliver of warm light under it.',
   'On "rifles": a hard flash-frame cut; the light sliver widens (the door opening).',
   'On "three" (hundred pounds): "135 KG" slams in; on "screams" the frame shakes once (seeded, tiny); on "smashes": a white shard-flash transition.',
   'On "dead": cut to black and "11" in DM Serif, alone. On "watch it happen": the title card "MUNICH · 1972" builds (Archivo 800, letter-spaced) and holds about 1.2 s. It is the film\'s title, and it must feel like a prestige documentary.']),
 ('1', 'The Cheerful Games', 's1', 'kinetic-type-beats (Adapt)', 'dynamic-content-sequencing, discrete-text-sequence',
  '1972 Games colour footage cut from `assets/internal/footage/games72.webm` (choose shots from `assets/internal/footage/index/sheet_*.jpg`; the timestamp is printed on each thumb), `assets/internal/hostesses_blue.jpg`, `assets/internal/israel_team_opening.jpg`, a genuine 1936 Berlin Olympics photo (the worker sources it from a news site; internal use)',
  ['A flash cut from the black title into full-colour, sunlit 1972 footage (crowds, the stadium roof, the opening ceremony). "1972" in giant Aicher-rainbow digits on "1972,".',
   '"party for the whole world": a per-word reveal lower-left over a quick montage of 3–4 footage clips, 1–1.5 s each.',
   '"memory.": the footage slows and desaturates; the line holds.',
   '"Berlin.": a hard cut to a monochrome 1936 photo with a 2.5D push; "1936" giant in ink; "Hitler\'s Games." label.',
   '"opposite.": a diagonal rainbow wipe in Aicher colours erases 1936; "cheerful" brings the title "The Cheerful Games" + "DIE HEITEREN SPIELE"; "colours,": swatches; "dachshund": "WALDI" label (footage of Waldi if the index has it); "light": hostesses_blue.jpg as a tilted card labelled "OLYMPIC STAFF IN AICHER BLUE"; "unarmed.": slug "SECURITY: MOSTLY UNARMED".',
   'Last beat: israel_team_opening.jpg (the Israeli team marching with its flag, 26 Aug 1972) with a drawn annotation circle round the "Israel" placard. This is the team we will lose, so give it a beat of stillness.']),
 ('2', '04:30', 's2', 'compose', 'discrete-text-sequence, coordinate-target-zoom',
  '`assets/internal/village_view.jpg`, `assets/open/map-munich-ffb.svg` + `data/mapmeta.json` (pins in 1920×1080 map space), `assets/internal/negotiators_door.jpg`',
  ['"Then,": colour drains (the host background goes paper → night); the slug types "05·09·1972 04:30".',
   '"eight": a giant "8"; "climbed the fence": the fence draws in as thin vertical rules and eight small ticks cross it.',
   '"village.": village_view.jpg with 2.5D parallax, 60% saturation.',
   '"helped them over": an annotation; "Olympians.": a line in Archivo 500.',
   '"Connelly" (Connollystraße 31): the real map (Munich outline, --silver) with a camera flight down to the pin at Connollystraße 31 (coordinate-target-zoom), a ring that pulses three times, and the label "CONNOLLYSTRASSE 31".',
   '"building": negotiators_door.jpg (this building, 5 Sept 1972) with the callout "ISRAELI TEAM QUARTERS".']),
 ('3', 'The door, the choice, the hostages', 's3', 'compose', 'dynamic-content-sequencing, svg-path-draw',
  '`assets/internal/negotiators_door.jpg`, `assets/internal/apartment_after.jpg` (the apartment afterwards; grayscale)',
  ['"Moshe": name card "Moshe Weinberg" (DM Serif) + "WRESTLING COACH".',
   '"forced": a floor-plan diagram drawn in code, three apartment boxes "1 · 2 · 3" in a row (svg-path-draw).',
   '"past one apartment": a path draws past box 2 with Plex Mono "APT 2: NO ISRAELIS HERE, HE SAID"; "strongest": the path enters box 3, labelled "WRESTLERS · WEIGHTLIFTERS".',
   '"Maybe hoping": the box 3 outline glows --munich; small italic "(his motive is not known)".',
   '"asleep.": cut to apartment_after.jpg (grayscale, slow parallax).',
   '"Weinberg fought again": his name card returns, then "KILLED"; "Romano": name card "Yossef Romano" + "WEIGHTLIFTER"; on "shot" (too): "KILLED".',
   '"Nine men were tied up": nine outlined figure slots appear in a row, then thin lines bind them together (svg-path-draw). Hold.']),
 ('4', 'The world was watching', 's4', 'video-text-pivot (Adapt)', 'multi-phase-camera, counting-dynamic-scale',
  '`assets/internal/press_pack.jpg`, `assets/internal/roof_police_a.jpg`, `assets/internal/roof_police_b.jpg`, `assets/internal/balcony_wide.jpg`, `assets/internal/balcony_close.jpg`',
  ['"Black": label "BLACK SEPTEMBER · PALESTINIAN MILITANT GROUP" over a dark field; "200": counter 0 → 234 with the footnote "reported as 234 · historians later counted 328 names".',
   '"world": press_pack.jpg in 2.5D; "900": counter "900,000,000" + "ESTIMATED TV AUDIENCE".',
   '"Spitzer": name card "ANDRE SPITZER · FENCING COACH"; "window": balcony_wide.jpg with an annotation rectangle on a window; "hit…television": a TV-frame treatment (bezel, a "LIVE" bug in --munich) round the image; restraint, no gore.',
   '"Police crept across the rooftops": roof_police_a.jpg, then roof_police_b.jpg, with annotation arrows on the officers; "television.": the TV frame again.',
   '"broadcast.": cut to balcony_close.jpg, the masked figure, HELD STILL with no motion at all.',
   '"off.": slug "RAID CALLED OFF"; pull back to balcony_wide.jpg; hold.']),
 ('5', 'Fürstenfeldbruck', 's5', 'spatial-pan-stations (Adapt)', 'svg-path-draw, coordinate-target-zoom',
  '`assets/open/map-munich-ffb.svg` + `data/mapmeta.json`, `assets/internal/helicopters_ffb.jpg`, `assets/open/ffb_aerial.jpg` (CC BY-SA 3.0)',
  ['"night,": slug "05·09·1972 22:00".',
   '"helicopter": the map flight from the Connollystraße pin to the air-base pin; the route draws itself with a travelling dot; "Forrest" (Fürstenfeldbruck): label "FÜRSTENFELDBRUCK AIR BASE"; "west": "20.7 KM".',
   '"rescue": helicopters_ffb.jpg grayscale backdrop at 35% + ffb_aerial.jpg as an inset.',
   '"Five police snipers" then checklist rows on their words: "No telescopic sights", "No night vision", "No radios".',
   '"five gunmen.": a big 5; "eight.": the 5 is struck out and an 8 lands in --munich (the host plays a thud).',
   '"officers": log line "POLICE TEAM ON THE BOEING 727"; "left.": "→ ABANDONED POST".']),
 ('6', "They're all gone", 's6', 'typewriter-reveal (Adapt)', 'discrete-text-sequence',
  '`assets/internal/helicopter_burned.jpg`',
  ['"shooting": slug "22:38 → 00:00"; a dark field with a faint, seeded light flicker (NOT gunfire imagery).',
   '"dead.": helicopter_burned.jpg (grayscale) fades up slowly, still.',
   '"Anton": name card "Anton Fliegerbauer" + "WEST GERMAN POLICE OFFICER".',
   '"Early reports": the typed headline "HOSTAGES SAFE" + small "EARLY REPORTS"; "three": slug "06·09·1972 03:24"; "McKay": "JIM McKAY · ABC".',
   '"gone.": the headline backspaces and retypes as “They\'re all gone.” in DM Serif. HOLD STILL to the end.']),
 ('7', 'The Games must go on', 's7', 'dataviz-countup (Adapt)', 'counting-dynamic-scale, multi-phase-camera',
  '`assets/internal/memorial_stadium.jpg`; Games-film memorial footage if the index shows it (the stadium, flags at half-mast)',
  ['"34": counter "34 HOURS".',
   '"80": memorial_stadium.jpg (grayscale, flag at half-mast) with 2.5D parallax; "80,000".',
   '"Avery": label "AVERY BRUNDAGE · IOC PRESIDENT"; "go on.": quote in DM Serif. Hold.']),
 ('8', 'Fifty years', 's8', 'spatial-pan-stations (Adapt)', 'stat-bars-and-fills, counting-dynamic-scale',
  '`assets/internal/israeli_team_leaving.jpg` (the team going home; grayscale, low opacity)',
  ['"50": a timeline bar 1972 → 2022 fills; "50 YEARS".',
   '"president": "FRANK-WALTER STEINMEIER · 2022"; "triple failure.": the quote.',
   '"28": counter €0 → €28,000,000.']),
 ('9', 'Eleven names', 's9', 'titlecard-reveal (Adapt)', 'dynamic-content-sequencing',
  '`assets/internal/victims_portraits.jpg` (the 11 portraits as one image; do NOT label individual faces)',
  ['"Berlin.": a line on ink.',
   '"names": victims_portraits.jpg in grayscale fades in centred at ~70% width; about 2 s after "remember." it dims to 12%.',
   'From local 11.3 s, one name every 0.95 s (k = 0…10), in DM Serif with a Plex Mono role, in two columns: Moshe Weinberg — wrestling coach · Yossef Romano — weightlifter · Ze\'ev Friedman — weightlifter · David Berger — weightlifter · Yakov Springer — weightlifting judge · Eliezer Halfin — wrestler · Yossef Gutfreund — wrestling referee · Kehat Shorr — shooting coach · Mark Slavin — wrestler · Andre Spitzer — fencing coach · Amitzur Shapira — athletics coach.',
   'Local 21.8: "and Anton Fliegerbauer — West German police officer".',
   'Local 25.0–29.8: fade to the end card "Sources and image credits in the description" + small "Internal test · not for publication".']),
]
body = ''
for n, title, sid, bp, rules, assets, beats in F:
    a, b = B[sid]
    body += (f"## Frame {n} — {title}\n- status: outline\n- src: compositions/frames/{sid}.html\n- id: {sid}\n- global: {a}–{b}\n"
             f"- duration: {round(b - a, 1)}\n- blueprint: {bp}\n- rules: {rules}\n- assets: {assets}\n- beats (cue = the quoted spoken word):\n")
    body += ''.join(f"  - {x}\n" for x in beats)
    body += "- word timings (LOCAL s):\n" + '\n'.join(CT[sid].split('\n')[1:]).rstrip() + "\n\n"
open('STORYBOARD.md', 'w').write(head + body)
print('frames', len(F))

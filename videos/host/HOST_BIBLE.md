# Host bible: "Tess Marlow"

This is an original, fictional host for our presenter-led explainers. She works in Cleo Abram's
*format* (straight to camera, one big optimistic "what if?" per episode, cutaways to graphics) but
isn't modelled on Cleo or anyone else. Her look is deliberately distinctive, which also helps the
image models keep her consistent.

## Who she is
- **Name:** Tess Marlow. **Role:** science and tech explainer host.
- **Age and energy:** about 30; warm, fast and curious, with a slightly dry sense of humour. She
  leans toward the camera when something's surprising.
- **Signature look (never changes):**
  - short copper-auburn curly bob, chin length, with a small clip on the left side;
  - light freckles, hazel eyes;
  - round tortoiseshell glasses;
  - mustard-yellow corduroy overshirt, open, over a plain navy crew-neck tee;
  - a thin silver chain;
  - no other jewellery and no logos.
- **Colours** match our paper-cutout palette: mustard `#f2c14e`, navy `#2f4858`, cream `#f3ead7`.
- **Set:** a warm cream studio wall with soft paper texture, a softbox key light from camera-left,
  shallow depth of field.
- **Voice:** a Fish Audio library voice (we pick it after the look is locked). Never a clone of a
  real person.

## Rules for every image
1. After step 1, **always attach the chosen hero image as a reference** and keep the phrase "the
   same woman as the reference image".
2. Keep the outfit, hair and glasses exactly as described. If a generation drifts, discard it.
3. **No text, logos or watermarks in the image.** All text is added later in code.
4. Photoreal, natural skin texture, no beauty-filter look.
5. Save files with the names below and send them to me in the chat.

---

## Step 1: Hero portrait (the identity lock)

Generate 4 to 8 variations, pick **one** you love, and send it to me as `tess_hero.png`.

> Photorealistic portrait of an original fictional woman, about 30 years old, science journalist
> and video host. Short copper-auburn curly bob, chin length, a small hair clip on the left side,
> light freckles, hazel eyes, round tortoiseshell glasses, warm friendly half-smile. Wearing an
> open mustard-yellow corduroy overshirt over a plain navy crew-neck t-shirt and a thin silver
> chain. Chest-up, facing the camera, eyes to lens. Warm cream studio wall background with subtle
> paper texture, soft key light from camera-left, gentle fill, shallow depth of field, 85mm lens
> look, natural skin texture. No text, no logos, no watermark. Aspect ratio 4:5.

## Step 2: Turnaround sheet (attach `tess_hero.png`)

Send as `tess_turnaround.png`.

> Character reference sheet of the same woman as the reference image, identical face, hair,
> glasses and outfit. Four full-body views side by side on a plain light-grey background: front,
> three-quarter left, profile left, back. Neutral standing pose, arms relaxed. Even studio
> lighting, photorealistic, consistent proportions across all views. No text, no labels, no
> watermark. Aspect ratio 16:9.

## Step 3: Expression sheet (attach `tess_hero.png`)

Send as `tess_expressions.png`.

> Expression sheet of the same woman as the reference image, identical face, hair, glasses and
> outfit. A 3×2 grid of chest-up headshots on a warm cream background: (1) neutral listening,
> (2) big genuine smile, (3) surprised with eyebrows raised, (4) skeptical with one eyebrow raised,
> (5) thoughtful, looking up and to the side, (6) laughing. Same lighting in every cell,
> photorealistic. No text, no labels, no watermark. Aspect ratio 3:2.

## Step 4: A-roll master frames (attach `tess_hero.png`)

These are the stills the talking-head tool will animate. They need a neutral mouth, eyes to lens,
and nothing covering the face.

**4a: set version.** Send as `tess_aroll_set.png`.

> The same woman as the reference image, identical face, hair, glasses and outfit. Medium shot
> from mid-chest up, framed slightly left of centre, facing the camera, eyes to lens, relaxed
> neutral expression with mouth closed, shoulders square. Warm cream studio wall with subtle paper
> texture, a small out-of-focus plant and a stack of books far behind her on the right, softbox
> key from camera-left. Photorealistic, natural skin, shallow depth of field. No text, no logos,
> no watermark. Aspect ratio 16:9.

**4b: green-screen version**, for putting her beside our graphics. Send as `tess_aroll_green.png`.

> Same as before, but the background is a flat, evenly lit chroma-key green (#00B140) with no
> shadows or gradient on it. Keep her edges and hair clean and sharp. Aspect ratio 16:9.

## Step 5: Gesture stills (attach `tess_hero.png`)

We use these as starting frames for short gesture clips. Send each as `tess_gesture_<name>.png`,
16:9, on the green background from 4b.

| Name | Prompt ending (append to: "The same woman as the reference image, identical face, hair, glasses and outfit, medium shot, flat chroma-key green background #00B140, photorealistic, no text,") |
|---|---|
| `point` | "pointing with her right hand toward the empty right side of the frame, looking at the camera, amused expression." |
| `explain` | "both hands in front of her chest as if shaping an invisible box, mid-explanation, engaged expression." |
| `lean` | "leaning slightly toward the camera, eyebrows raised, conspiratorial half-smile, as if about to share a secret." |
| `shrug` | "a small shrug with palms up, playful deadpan expression." |
| `key` | "holding up an old brass key between two fingers beside her face, looking at it with curiosity." |

---

## What happens next (my side)
1. I check each image for consistency with the hero: face, hair clip, glasses, outfit. I tell you
   which to regenerate, with an adjusted prompt.
2. I cut out the green-screen stills and design the layouts: Tess full-frame, Tess at the side
   with a graphic beside her, and a small picture-in-picture Tess over a diagram.
3. I pick her voice from the Fish library and render a test line.
4. **Lip-sync and motion** need a talking-head tool (HeyGen, Hedra, or a video model's
   image-to-video). If your subscription includes one, we use it. If not, I can make a free
   stopgap: subtle head and shoulder motion plus a mouth synced to the audio, done in code. That
   can pass in a small picture-in-picture but not full-frame.
5. We build a 30-second pilot, then a full episode.

**Disclosure:** YouTube requires labelling realistic AI-generated people. Tick "altered or
synthetic content" when uploading.

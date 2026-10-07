"""Cut out a photoreal hand (green-screen image) for the sketch kit: studio/assets/hands/<name>.jpg -> <name>.png + hands.json.

    python3 studio/tools/hand_cutout.py hand_down hand_lifted

Chroma key on green dominance, green spill removed at the edges, the image generator's corner watermark painted out,
the sleeve extended past the right and bottom edges (so the arm never ends on screen), downscaled by half.
hands.json records each image's pencil-tip pixel, which the kit pins to the line being drawn.
"""
import json, os, sys
import cv2, numpy as np

D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "hands")
out = {}
for name in sys.argv[1:]:
    im = cv2.imread(os.path.join(D, name + ".jpg")).astype(np.float32)     # BGR
    h, w = im.shape[:2]
    b, g, r = im[..., 0], im[..., 1], im[..., 2]
    # the watermark: a small light-grey sparkle in the bottom-right corner
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    star = (lum > 85) & (g - np.maximum(r, b) < 10)          # brighter than the navy sleeve, not green
    star[: int(h * 0.9)] = False; star[:, : int(w * 0.85)] = False
    m = np.zeros((h, w), np.uint8)
    if star.any():
        ys, xs = np.where(star)
        m[max(0, ys.min() - 14): ys.max() + 14, max(0, xs.min() - 14): xs.max() + 14] = 255
        print(name, "watermark painted out at", xs.min(), ys.min(), xs.max(), ys.max())
    im = cv2.inpaint(np.clip(im, 0, 255).astype(np.uint8), m, 9, cv2.INPAINT_TELEA).astype(np.float32)
    b, g, r = im[..., 0], im[..., 1], im[..., 2]
    a = np.clip(1 - ((g - np.maximum(r, b)) - 18) / 40, 0, 1)
    a[m > 0] = np.maximum(a[m > 0], 0)
    im[..., 1] = np.minimum(g, np.maximum(r, b) * 1.03)                      # despill
    a = cv2.GaussianBlur(a, (3, 3), 0)
    soft = a < 0.6                                            # the green screen's soft shadow: keep it as a real shadow, not a pale halo
    im[soft] = im[soft] * 0.15 + 12; a = np.where(soft, a * 0.55, a)
    ys, xs = np.where(a > 0.6); i = np.argmin(xs); tip = (int(xs[i]), int(ys[i]))
    rgba = np.dstack([im, a * 255]).clip(0, 255).astype(np.uint8)
    # the sleeve continues off the right and bottom edges (smoothed, so it reads as out-of-frame arm, not a cut)
    right = cv2.GaussianBlur(np.repeat(rgba[:, -1:], 700, axis=1), (1, 61), 0)
    rgba = np.hstack([rgba, right])
    # below the photo the arm keeps its own direction: each new row is the last row shifted right along the arm's slope
    last = rgba[-1].astype(np.float32); edge = np.where(last[:, 3] > 128)[0]
    prev = rgba[-60].astype(np.float32); edge0 = np.where(prev[:, 3] > 128)[0]
    slope = ((edge.min() - edge0.min()) / 60.0) if len(edge) and len(edge0) else 0.5
    rows = [np.roll(last, int(round(i * max(slope, 0.2))), axis=0) for i in range(1, 1601)]
    down = np.stack(rows).astype(np.uint8)
    for i, row in enumerate(down):
        sh = int(round((i + 1) * max(slope, 0.2))); row[:sh] = 0 if sh else row[:sh]
    down = cv2.GaussianBlur(down, (31, 1), 0)
    rgba = np.vstack([rgba, down])
    s = 0.5
    rgba = cv2.resize(rgba, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(D, name + ".png"), rgba, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    out[name] = {"file": name + ".png", "tip": [round(tip[0] * s), round(tip[1] * s)], "size": [rgba.shape[1], rgba.shape[0]]}
    print(name, out[name])
json.dump({"_doc": "Photoreal hand cut-outs for the sketch kit (studio/tools/hand_cutout.py). Source images: Nano Banana, made by the user 2026-10-08 (prompt in the chat log). tip = pencil-tip pixel.", "hands": out},
          open(os.path.join(D, "hands.json"), "w"), indent=1)

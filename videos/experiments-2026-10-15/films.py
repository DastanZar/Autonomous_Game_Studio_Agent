"""Five quick experimental films, all rendered in code (deterministic, no AI models).
    python3 films.py <pendulum|murmuration|ink|harmonograph|earth>
Writes out/<name>.mp4 (720x1280, 24 fps) with synthesized sound."""
import sys, os, json, subprocess, wave, urllib.request, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
ROOT = os.path.dirname(os.path.dirname(HERE))
W, H, FPS, SR = 720, 1280, 24, 44100
F_SERIF = os.path.join(ROOT, "videos/root-keys/assets/dm-serif-display.ttf")
F_ANTON = os.path.join(ROOT, "videos/root-keys/assets/anton.ttf")
font = lambda p, s: ImageFont.truetype(p, s)

def encoder(name, dur):
    return subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                             "-r", str(FPS), "-i", "-", "-i", os.path.join(OUT, name + ".wav"), "-t", str(dur),
                             "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                             "-c:a", "aac", "-b:a", "160k", "-shortest", os.path.join(OUT, name + ".mp4")], stdin=subprocess.PIPE)

def write_wav(name, a):
    a = a / (np.abs(a).max() + 1e-9) * 0.8
    with wave.open(os.path.join(OUT, name + ".wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())

def title(img, top, sub, t, t0=0.4, t1=4.0, y=150, dark=False):
    a = max(0.0, min(1.0, (t - t0) / 0.6, (t1 - t) / 0.6))
    if a <= 0: return img
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    f1, f2 = font(F_SERIF, 64), font(F_SERIF, 30)
    d.text((W / 2, y), top, font=f1, anchor="mm", fill=((22, 26, 40) if dark else (240, 236, 228)) + (int(255 * a),))
    d.text((W / 2, y + 62), sub, font=f2, anchor="mm", fill=((70, 74, 90) if dark else (200, 196, 190)) + (int(220 * a),))
    return Image.alpha_composite(img.convert("RGBA"), lay).convert("RGB")

# 1. PENDULUM WAVE: 15 pendulums; pendulum k swings 20+k times in 30 s, so they drift apart into waves and re-align.
def pendulum():
    dur, N, G = 30.0, 15, 30.0
    rng = np.random.default_rng(15)
    # sound: each bob plucks a note of a pentatonic scale when it passes the centre line
    t = np.arange(int(dur * SR)) / SR; a = np.zeros_like(t)
    scale = [220 * 2 ** (s / 12) for s in (0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33)]
    for k in range(N):
        n = 20 + k; T = G / n
        for c in np.arange(T / 4, dur, T / 2):          # zero crossings of cos
            i = int(c * SR); L = int(0.9 * SR); seg = np.arange(min(L, len(t) - i)) / SR
            a[i:i + len(seg)] += np.sin(2 * np.pi * scale[k] * seg) * np.exp(-seg * 5) * 0.12
    write_wav("pendulum", a)
    p = encoder("pendulum", dur)
    for f in range(int(dur * FPS)):
        tt = f / FPS
        img = Image.new("RGB", (W, H), (14, 16, 22)); d = ImageDraw.Draw(img)
        d.line([(60, 240), (W - 60, 240)], fill=(80, 84, 92), width=3)
        for k in range(N):
            n = 20 + k; th = 0.42 * np.cos(2 * np.pi * n * tt / G)
            L = 900 - k * 38; x0 = W / 2 + (k - (N - 1) / 2) * 1.2
            bx, by = W / 2 + L * np.sin(th) * 0.9, 240 + L * np.cos(th) * 0.95
            hue = k / N; col = tuple(int(150 + 100 * np.sin(2 * np.pi * (hue + o))) for o in (0, .33, .66))
            d.line([(x0, 240), (bx, by)], fill=(70, 74, 82), width=1)
            d.ellipse([bx - 14, by - 14, bx + 14, by + 14], fill=col)
        img = title(img, "Fifteen pendulums", "different lengths, one rhythm", tt, y=120)
        if tt > 26: img = title(img, "They line up again", "every thirty seconds", tt, t0=26, t1=30, y=120)
        p.stdin.write(img.tobytes())
    p.stdin.close(); p.wait()

# 2. MURMURATION: 1400 starlings with boids rules (separation, alignment, cohesion) over a dusk sky.
def murmuration():
    dur, N = 26.0, 1400
    rng = np.random.default_rng(7)
    pos = rng.normal([W / 2, H * 0.45], [90, 120], (N, 2)); vel = rng.normal(0, 1, (N, 2)) * 2
    t = np.arange(int(dur * SR)) / SR
    noise = np.random.default_rng(3).normal(0, 1, len(t))
    wind = np.convolve(noise, np.ones(400) / 400, mode="same") * (0.6 + 0.4 * np.sin(2 * np.pi * t / 9))
    hum = sum(np.sin(2 * np.pi * f * t) * w for f, w in ((110, .3), (164.8, .2), (220, .12))) * (0.5 + 0.5 * np.sin(np.pi * t / dur))
    write_wav("murmuration", wind * 3 + hum * 0.4)
    sky = np.zeros((H, W, 3), np.float32)
    for c, (top, bot) in enumerate(zip((40, 52, 92), (232, 140, 96))):
        sky[..., c] = np.linspace(top, bot, H)[:, None]
    p = encoder("murmuration", dur)
    for f in range(int(dur * FPS)):
        tt = f / FPS
        diff = pos[None] - pos[:, None]; dist = np.sqrt((diff ** 2).sum(-1)) + 1e-6
        near = dist < 40; close = dist < 10
        cnt = near.sum(1, keepdims=True)
        coh = (np.where(near[..., None], pos[None], 0).sum(1) / cnt - pos) * 0.004
        ali = (np.where(near[..., None], vel[None], 0).sum(1) / cnt - vel) * 0.06
        sep = -(np.where(close[..., None], diff / dist[..., None] ** 2, 0)).sum(1) * 1.5
        target = np.array([W / 2 + 200 * np.sin(tt * 0.5), H * 0.45 + 260 * np.sin(tt * 0.31 + 1)])
        att = (target - pos) * 0.0009
        vel = vel + coh + ali + sep + att
        sp = np.linalg.norm(vel, axis=1, keepdims=True); vel = vel / sp * np.clip(sp, 2.5, 5.5)
        pos = pos + vel
        img = Image.fromarray(sky.astype(np.uint8)); d = ImageDraw.Draw(img)
        d.polygon([(0, H), (0, H - 120), (180, H - 150), (360, H - 110), (520, H - 160), (W, H - 120), (W, H)], fill=(18, 16, 22))
        for x, y in pos.astype(int):
            d.ellipse([x - 1, y - 1, x + 2, y + 1], fill=(20, 18, 24))
        img = title(img, "Murmuration", "no leader, three rules", tt, y=130)
        p.stdin.write(img.tobytes())
    p.stdin.close(); p.wait()

# 3. INK: 3000 particles follow a smooth flow field and leave fading ink trails on paper.
def ink():
    dur, N = 24.0, 3000
    rng = np.random.default_rng(11)
    pts = rng.uniform([0, 0], [W, H], (N, 2))
    t = np.arange(int(dur * SR)) / SR
    a = sum(np.sin(2 * np.pi * f * t + ph) * np.exp(-((t - c) % 6) * 0.7) for f, ph, c in ((196, 0, 0), (293.7, 1, 2), (392, 2, 4))) * 0.3
    a += np.random.default_rng(5).normal(0, 0.02, len(t))
    write_wav("ink", a)
    canvas = np.full((H, W), 1.0, np.float32)
    paper = np.array([241, 236, 224], np.float32)
    p = encoder("ink", dur)
    for f in range(int(dur * FPS)):
        tt = f / FPS
        for _ in range(3):
            x, y = pts[:, 0] / W, pts[:, 1] / H
            ang = 2.2 * np.sin(3.1 * x + 1.7 * np.cos(2.3 * y + tt * 0.2)) + 1.6 * np.cos(4.2 * y - 0.6 * tt * 0.3) + tt * 0.05
            pts += np.stack([np.cos(ang), np.sin(ang)], 1) * 1.6
            ok = (pts[:, 0] >= 0) & (pts[:, 0] < W) & (pts[:, 1] >= 0) & (pts[:, 1] < H)
            pts[~ok] = rng.uniform([0, 0], [W, H], ((~ok).sum(), 2))
            xi, yi = pts[:, 0].astype(int), pts[:, 1].astype(int)
            np.minimum.at(canvas, (yi, xi), 0.15)
        canvas = np.minimum(1.0, canvas + 0.004)
        rgb = (paper[None, None] * canvas[..., None] + np.array([20, 24, 48]) * (1 - canvas[..., None])).astype(np.uint8)
        img = Image.fromarray(rgb)
        img = title(img, "Ink in a current", "3,000 drops, one invisible river", tt, t1=5, y=130, dark=True)
        p.stdin.write(img.tobytes())
    p.stdin.close(); p.wait()

# 4. HARMONOGRAPH: two damped pendulums at a 3:2 ratio draw a figure; you hear the same two frequencies.
def harmonograph():
    dur = 24.0
    t = np.arange(int(dur * SR)) / SR; dec = np.exp(-t / 14)
    write_wav("harmonograph", (np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 330.6 * t)) * dec * 0.5)
    ts = np.linspace(0, 120, 60000)
    x = np.sin(3 * ts + 0.0) * np.exp(-ts / 60) + 0.4 * np.sin(2 * ts + 1.2) * np.exp(-ts / 80)
    y = np.sin(2.006 * ts + 0.5) * np.exp(-ts / 60) + 0.4 * np.sin(3 * ts + 0.3) * np.exp(-ts / 70)
    X, Y = W / 2 + x * 250, H / 2 + y * 250
    p = encoder("harmonograph", dur)
    for f in range(int(dur * FPS)):
        tt = f / FPS; n = int(len(ts) * min(1, tt / (dur - 3)))
        img = Image.new("RGB", (W, H), (246, 242, 233)); d = ImageDraw.Draw(img)
        if n > 2:
            pts = list(zip(X[:n:2], Y[:n:2])); d.line(pts, fill=(30, 60, 120), width=1)
            d.ellipse([X[n - 1] - 6, Y[n - 1] - 6, X[n - 1] + 6, Y[n - 1] + 6], fill=(200, 60, 40))
        img = title(img, "Harmonograph", "two pendulums a fifth apart", tt, t1=6, y=120, dark=True)
        img = title(img, "Listen", "you are hearing the drawing (220 and 330 Hz)", tt, t0=6.5, t1=11, y=1120, dark=True)
        p.stdin.write(img.tobytes())
    p.stdin.close(); p.wait()

# 5. EARTH (non-animated): one real day of NASA EPIC photographs of the whole Earth, from 1.5 million km away.
def earth():
    meta = json.load(urllib.request.urlopen("https://epic.gsfc.nasa.gov/api/natural", timeout=60))
    frames = []
    for m in meta:
        dt = m["date"]; ymd = dt[:10].replace("-", "/")
        url = f"https://epic.gsfc.nasa.gov/archive/natural/{ymd}/jpg/{m['image']}.jpg"
        im = Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=120).read())).convert("RGB").resize((680, 680), Image.LANCZOS)
        frames.append((dt, im))
    per = 1.6; dur = per * len(frames) + 2
    t = np.arange(int(dur * SR)) / SR
    pad = sum(np.sin(2 * np.pi * f * t) * w for f, w in ((55, .5), (82.4, .3), (110, .25), (164.8, .1))) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 7))
    write_wav("earth", pad * np.minimum(1, t / 2) * np.minimum(1, (dur - t) / 2))
    json.dump([{"date": d, "image": m["image"]} for (d, _), m in zip(frames, meta)], open(os.path.join(OUT, "earth_sources.json"), "w"), indent=1)
    p = encoder("earth", dur)
    f1, f2 = font(F_ANTON, 44), font(F_SERIF, 28)
    for f in range(int(dur * FPS)):
        tt = f / FPS; i = min(len(frames) - 1, int(tt / per)); j = min(len(frames) - 1, i + 1)
        a = min(1, max(0, (tt - i * per) / per))
        im = Image.blend(frames[i][1], frames[j][1], a * a * (3 - 2 * a))
        img = Image.new("RGB", (W, H), (2, 3, 6)); img.paste(im, (20, 300))
        d = ImageDraw.Draw(img)
        d.text((W / 2, 1060), frames[i][0][11:16] + " UTC", font=f1, anchor="mm", fill=(236, 232, 223))
        d.text((W / 2, 1115), "One day of real photographs, " + frames[0][0][:10], font=f2, anchor="mm", fill=(170, 175, 182))
        d.text((W / 2, 1160), "NASA EPIC camera on DSCOVR, about 1.5 million km away", font=font(F_SERIF, 22), anchor="mm", fill=(130, 135, 142))
        img = title(img, "The whole Earth", "turning, as it did that day", tt, t1=5, y=150)
        p.stdin.write(img.tobytes())
    p.stdin.close(); p.wait()

if __name__ == "__main__":
    globals()[sys.argv[1]]()

# Step 5: Music, sound effects and the mix

## 5.1 Create `shorts/emu-war/tools/audio.py`

All of this audio is synthesized with numpy and scipy; there are no sample files:
- a comic military march at 116 BPM (tuba oom-pah, snare, piccolo);
- a sad trombone after "And lost.";
- gunfire, a clunk when the gun jams, a truck engine, typewriter clicks, stamps, pops and dings.

The music drops out for comic beats and ducks under the voice. The random generator is seeded
(`1932`), so the mix is identical on every run.

```python
"""Score + SFX synthesized in code, mixed under the voiceover.

Reads build/timeline.json (VO timing) and build/cues.json (SFX cues exported by the
renderer, so picture and sound share one timeline). Writes build/mix.wav (48 kHz stereo).
"""
import json, os, wave
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
SR = 48000
tl = json.load(open(os.path.join(BUILD, "timeline.json")))
cues = json.load(open(os.path.join(BUILD, "cues.json")))
DUR = tl["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(1932)  # seeded: the mix is reproducible
LS = {l["id"]: l for l in tl["lines"]}


def env(n, a=0.005, d=None, curve=6.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    return e * (np.exp(-curve * t / d) if d else 1)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "highpass", fs=SR, output="sos"), x)


def place(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    a, b = max(0, i), min(len(buf), i + len(x))
    buf[a:b] += gain * x[a - i:b - i]


def tone(f, dur, kind="sine", vib=0.0):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * np.cumsum(np.full_like(t, f) * (1 + vib * np.sin(2 * np.pi * 5.5 * t))) / SR
    if kind == "sine":
        return np.sin(ph)
    if kind == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == "square":
        return np.sign(np.sin(ph)) * 0.6
    raise ValueError(kind)


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


# ---------------- music: a small comic military march ----------------
BPM = 116
BEAT = 60 / BPM
CHORDS = [48, 55, 48, 53, 48, 55, 48, 55]  # C G C F C G C G (roots, C3)
TRIAD = {48: [60, 64, 67], 55: [59, 62, 67], 53: [60, 65, 69]}
MEL = [0, 2, 1, 2, 0, 2, 3, 2]  # chord-tone steps per 8th note


def march():
    m = np.zeros(N)
    nbeats = int(DUR / BEAT) + 1
    for b in range(nbeats):
        t = b * BEAT
        bar, beat = divmod(b, 4)
        root = CHORDS[bar % len(CHORDS)]
        if beat in (0, 2):  # tuba oom
            f = midi(root - 12 + (7 if beat == 2 else 0))
            x = tone(f, BEAT * 0.9, "saw") * 0.5 + tone(f, BEAT * 0.9) * 0.8
            place(m, lp(x, 700) * env(len(x), 0.01, BEAT * 1.4, 3), t, 0.55)
            k = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.18 * SR))) / SR) * env(int(0.18 * SR), 0.002, 0.18)
            place(m, k, t, 0.5)  # bass drum
        else:  # pah stabs + snare
            for n in TRIAD[root]:
                x = lp(tone(midi(n), 0.16, "square"), 2200) * env(int(0.16 * SR), 0.004, 0.12)
                place(m, x, t, 0.10)
            s = bp(rng.standard_normal(int(0.14 * SR)), 1500, 6000) * env(int(0.14 * SR), 0.001, 0.1, 5)
            place(m, s, t, 0.28)
        if bar % 2 == 1 and beat == 3:  # snare roll into the next phrase
            for r in range(4):
                s = bp(rng.standard_normal(int(0.06 * SR)), 1500, 6000) * env(int(0.06 * SR), 0.001, 0.05)
                place(m, s, t + r * BEAT / 4, 0.16 + r * 0.03)
        for e in range(2):  # piccolo melody in 8ths
            step = MEL[(b * 2 + e) % len(MEL)]
            tri = TRIAD[root] + [TRIAD[root][0] + 12]
            f = midi(tri[step] + 12)
            x = (tone(f, BEAT * 0.45, vib=0.006) + 0.25 * tone(2 * f, BEAT * 0.45)) * env(int(BEAT * 0.45 * SR), 0.01, BEAT * 0.6, 3)
            place(m, x, t + e * BEAT / 2, 0.075)
    return m


music = march()

# music gates: comic dropouts at "And lost", the jam, and the quote
gate = np.ones(N)


def cut_gate(a, b, fade=0.03):
    t = np.arange(N) / SR
    gate[:] = np.minimum(gate, np.clip(np.maximum((a - t) / fade, (t - b) / fade), 0, 1))


cut_gate(LS["lost"]["start"] - 0.05, LS["vets"]["start"] - 0.25)
jam_t = next(c["t"] for c in cues if c["type"] == "clunk")
cut_gate(jam_t, LS["truck"]["start"] - 0.25)
cut_gate(LS["quote"]["start"] - 0.25, LS["home"]["start"] - 0.3)
cut_gate(DUR - 0.9, DUR + 1, fade=0.4)

# quote bed: a low, held minor chord
bed = np.zeros(N)
qa, qb = LS["quote"]["start"] - 0.25, LS["home"]["start"] - 0.3
for n in (45, 52, 57, 60):
    x = lp(tone(midi(n), qb - qa, "saw"), 900) * env(int((qb - qa) * SR), 0.6)
    x *= np.minimum(1, (len(x) - np.arange(len(x))) / (0.3 * SR))
    place(bed, x, qa, 0.05)

# ---------------- sfx ----------------
fx = np.zeros(N)
for c in cues:
    t, ty = c["t"], c["type"]
    p = c.get("pitch", 1.0)
    if ty == "whoosh":
        n = int(0.32 * SR); x = rng.standard_normal(n)
        x = bp(x, 400, 4000) * np.sin(np.linspace(0, np.pi, n)) ** 2
        place(fx, x, t - 0.08, 0.10)
    elif ty == "stamp":
        n = int(0.25 * SR)
        x = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 60, n)) / SR) * env(n, 0.001, 0.2)
        x += lp(rng.standard_normal(n), 1800) * env(n, 0.001, 0.05) * 0.8
        place(fx, x, t, 0.55)
    elif ty == "trombone":
        start = LS["lost"]["end"] + 0.02
        for i, (n, d) in enumerate([(58, 0.17), (57, 0.17), (56, 0.17), (55, 0.55)]):
            x = lp(tone(midi(n - 12), d + 0.05, "saw", vib=0.02 if i == 3 else 0.004), 1400)
            x *= env(len(x), 0.02) * np.minimum(1, (len(x) - np.arange(len(x))) / (0.05 * SR))
            place(fx, x, start + [0, 0.19, 0.38, 0.57][i], 0.22)
    elif ty == "pop":
        n = int(0.09 * SR)
        x = np.sin(2 * np.pi * np.cumsum(np.linspace(700 * p, 300 * p, n)) / SR) * env(n, 0.002, 0.08)
        place(fx, x, t, 0.22)
    elif ty == "boom":  # emus really do make a low drumming boom
        n = int(0.35 * SR)
        x = np.sin(2 * np.pi * np.cumsum(np.linspace(85, 60, n)) / SR) * env(n, 0.03, 0.3, 4)
        place(fx, x, t, 0.22)
    elif ty in ("tick", "type"):
        n = int(0.03 * SR)
        x = hp(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.02)
        if ty == "type":
            x += np.sin(2 * np.pi * (2400 + 300 * rng.random()) * np.arange(n) / SR) * env(n, 0.0005, 0.03) * 0.3
        place(fx, x, t, 0.22 if ty == "type" else 0.15)
    elif ty == "ding":
        n = int(1.0 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 1760 * tt) + 0.5 * np.sin(2 * np.pi * 2640 * tt)) * np.exp(-4 * tt)
        place(fx, x, t, 0.12)
    elif ty == "scatter":
        for i in range(40):
            n = int(0.03 * SR)
            x = lp(rng.standard_normal(n), 900) * env(n, 0.001, 0.025)
            place(fx, x, t + i * 0.035 + rng.random() * 0.02, 0.25 * (1 - i / 50))
    elif ty == "shot":
        n = int(0.09 * SR)
        x = lp(rng.standard_normal(n), 3500) * env(n, 0.0005, 0.06, 5)
        x += np.sin(2 * np.pi * np.cumsum(np.linspace(160, 50, n)) / SR) * env(n, 0.001, 0.08) * 0.8
        place(fx, x, t, 0.35)
    elif ty == "clunk":
        n = int(0.4 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 190 * tt) + 0.6 * np.sin(2 * np.pi * 437 * tt) + 0.3 * np.sin(2 * np.pi * 1130 * tt)) * np.exp(-12 * tt)
        x += lp(rng.standard_normal(n), 2000) * np.exp(-40 * tt)
        place(fx, x, t, 0.4)
    elif ty == "engine":
        d = c["dur"]; n = int(d * SR); tt = np.arange(n) / SR
        x = lp(tone(44, d, "saw"), 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * tt))
        x *= np.minimum(1, np.minimum(tt / 0.3, (d - tt) / 0.4))
        place(fx, x, t, 0.22)
    elif ty == "sputter":
        for i in range(4):
            n = int(0.07 * SR)
            x = lp(rng.standard_normal(n), 800) * env(n, 0.001, 0.05)
            place(fx, x, t + 0.3 + i * 0.16 + rng.random() * 0.05, 0.4)
    elif ty == "roll":
        k = 0.0
        while k < c["dur"]:
            n = int(0.02 * SR)
            place(fx, hp(rng.standard_normal(n), 3000) * env(n, 0.0005, 0.012), t + k, 0.12)
            k += 0.035 + 0.05 * (k / c["dur"]) ** 2
    elif ty == "star":
        n = int(0.35 * SR); tt = np.arange(n) / SR
        x = np.sin(2 * np.pi * 1320 * p * tt) * np.exp(-9 * tt) + 0.4 * np.sin(2 * np.pi * 2640 * p * tt) * np.exp(-14 * tt)
        place(fx, x, t, 0.1)
    elif ty == "clank":
        for i in range(3):
            n = int(0.18 * SR); tt = np.arange(n) / SR
            x = (np.sin(2 * np.pi * 260 * tt) + 0.7 * np.sin(2 * np.pi * 710 * tt)) * np.exp(-25 * tt)
            place(fx, x, t + i * 0.14, 0.25)
    elif ty == "boing":
        n = int(0.5 * SR); tt = np.arange(n) / SR
        f = 220 + 160 * tt / 0.5
        x = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.12 * np.sin(2 * np.pi * 18 * tt))) / SR) * np.exp(-5 * tt)
        place(fx, x, t + 0.3, 0.2)
    else:
        raise ValueError(ty)

# ---------------- voice ----------------
with wave.open(os.path.join(BUILD, "vo.wav")) as w:
    vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
vo = resample_poly(vo, 320, 147)[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = hp(vo, 70)
vo /= np.max(np.abs(vo)) + 1e-9

# duck music under the voice
venv = lp(np.abs(vo), 6, 1)
venv = np.clip(venv / (np.percentile(venv, 95) + 1e-9), 0, 1)
duck = 1 - 0.55 * venv

mus = (music * gate + bed) * duck
mix = 0.9 * vo + 0.30 * mus + 0.75 * fx
stereo = np.stack([mix + 0.04 * mus, mix - 0.04 * mus], 1)
stereo /= np.max(np.abs(stereo)) / 0.95
with wave.open(os.path.join(BUILD, "mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print("mix", DUR, "s", "cues", len(cues))
```

## 5.2 Run it

```bash
cd shorts/emu-war && python3 tools/audio.py && cd ../..
md5sum shorts/emu-war/build/cues.json shorts/emu-war/build/mix.wav
```
**Checkpoint:** it prints `mix 46.039 s cues 135`, then:
```
cc5c5fdf2b31891eece8a6addbe9522a  shorts/emu-war/build/cues.json
96147ff963c79ce4bac636ca7f814ee1  shorts/emu-war/build/mix.wav
```

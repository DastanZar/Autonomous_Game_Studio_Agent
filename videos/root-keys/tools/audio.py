"""Score + SFX synthesized in code, mixed under the voiceover (48 kHz stereo -> build/mix.wav).

The score is a spy-caper groove in D minor: pizzicato walking bass, brushed kit, vibraphone
pads and a celesta motif. Sound cues come from build/cues.json (exported by the renderer).
"""
import json, os, re, wave
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
SR = 48000
tl = json.load(open(os.path.join(BUILD, "timeline.json")))
cues = json.load(open(os.path.join(BUILD, "cues.json")))
DUR = tl["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(2010)
PARA = {p["id"]: p for p in tl["paras"]}
nrm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())


def WT(pid, word, nth=0):
    hits = [w["t"] for w in PARA[pid]["words"] if nrm(w["w"]) == word]
    return hits[nth]


def WA(pid, word, after):
    return next(w["t"] for w in PARA[pid]["words"] if nrm(w["w"]) == word and w["t"] > after)


def env(n, a=0.005, d=None, curve=6.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    return e * (np.exp(-curve * t / d) if d else 1)


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def place(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    a, b = max(0, i), min(len(buf), i + len(x))
    buf[a:b] += gain * x[a - i:b - i]


def tone(f, dur, harm=(1.0,), vib=0.0):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * np.cumsum(np.full_like(t, f) * (1 + vib * np.sin(2 * np.pi * 5.2 * t))) / SR
    return sum(a * np.sin((k + 1) * ph) for k, a in enumerate(harm))


midi = lambda n: 440 * 2 ** ((n - 69) / 12)

# ---------------- score ----------------
BPM = 100
BEAT = 60 / BPM
SW = 0.62  # swing ratio for off-beat 8ths
PROG = [(38, [50, 53, 57, 60]), (43, [50, 55, 58, 62]), (46, [50, 53, 57, 58]), (45, [49, 52, 55, 57])]  # Dm7 Gm7 Bbmaj7 A7


def pizz(f, dur=0.5):
    n = int(dur * SR)
    x = tone(f, dur, (1.0, 0.5, 0.25, 0.12)) * env(n, 0.003, 0.35, 5)
    x[: int(0.006 * SR)] += rng.standard_normal(int(0.006 * SR)) * 0.3
    return filt(x, "lowpass", 1800)


def vibes(f, dur=2.4):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-8 * t)) * np.exp(-1.6 * t) * (1 + 0.25 * np.sin(2 * np.pi * 5.5 * t))


def celesta(f, dur=0.8):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-5 * t) * env(n, 0.002)


def score():
    bass, kit, pad, mel = (np.zeros(N) for _ in range(4))
    nb = int(DUR / BEAT) + 2
    MOTIF = [(0, 74), (1.5, 72), (2, 69), (3, 67), (4, 69), (6, 65), (6.5, 67), (7, 69)]  # 2-bar celesta hook
    for b in range(nb):
        t = b * BEAT
        bar, beat = divmod(b, 4)
        root, chord = PROG[(bar // 2) % 4]
        walk = [root, root + 7, root + 12, root + (11 if bar % 2 else 5)][beat]
        place(bass, pizz(midi(walk)), t, 0.6)
        # kit: hat on swing 8ths, brush on 2 & 4, soft kick on 1
        for off, g in ((0, 0.12), (SW * BEAT, 0.08)):
            hx = filt(rng.standard_normal(int(0.04 * SR)), "highpass", 7000) * env(int(0.04 * SR), 0.001, 0.03)
            place(kit, hx, t + off, g)
        if beat in (1, 3):
            n = int(0.22 * SR)
            place(kit, filt(rng.standard_normal(n), "bandpass", [900, 5000]) * env(n, 0.02, 0.18, 4), t, 0.16)
        if beat == 0:
            n = int(0.2 * SR)
            place(kit, np.sin(2 * np.pi * np.cumsum(np.linspace(95, 45, n)) / SR) * env(n, 0.002, 0.18), t, 0.35)
            if bar % 2 == 0:
                for nn in chord:
                    place(pad, vibes(midi(nn + 12), BEAT * 8), t, 0.07)
        if bar % 8 in (4, 5) and beat == 0 and bar % 2 == 0:
            for off, nn in MOTIF:
                place(mel, celesta(midi(nn + 12)), t + off * BEAT + (SW - 0.5) * BEAT * (off % 1 > 0), 0.09)
    return bass, kit, pad, mel


bass, kit, pad, mel = score()
tt = np.arange(N) / SR


def gate(a, b, fade=0.05):
    return np.clip(np.maximum((a - tt) / fade, (tt - b) / fade), 0, 1)


# arrangement: soft intro (pad + bass only), full groove from the myth, comic dropouts
groove = np.clip((tt - (PARA["myth"]["start"] - 1.0)) / 1.5, 0, 1)
full = np.ones(N)
full *= gate(WT("sortof", "sort") - 0.05, WT("sortof", "and") - 0.15)          # "Sort of." beat of silence
full *= gate(WT("root", "nobody") - 0.05, WT("root", "which") - 0.3)             # "Nobody." — groove drops
full *= gate(WT("locksmith", "not") - 0.05, WA("locksmith", "the", WT("locksmith", "broken")) - 0.2)        # "Not hacked. Just broken."
full *= gate(WT("cant", "no") - 0.05, WA("cant", "the", WT("cant", "no")) - 0.3)                  # "No."
ending = np.clip((PARA["close"]["end"] + 2.0 - tt) / 2.0, 0, 1)
music = (bass * 1.0 + kit * groove * full + mel * groove + pad * (0.6 + 0.4 * full)) * full ** 0.5 * ending
music += (bass * 0 + pad) * (1 - full) * 0.5 * ending  # keep a whisper of pad inside the dropouts

# final button chord on the end card
for nn in (50, 53, 57, 62, 69):
    place(music, vibes(midi(nn), 3.0), PARA["close"]["end"] + 0.25, 0.12)

# ---------------- sfx ----------------
fx = np.zeros(N)


def noise(n):
    return rng.standard_normal(n)


for c in cues:
    t, ty, p = c["t"], c["type"], c.get("pitch", 1.0)
    soft = 0.5 if c.get("soft") else 1.0
    if ty == "whoosh":
        n = int(0.34 * SR); place(fx, filt(noise(n), "bandpass", [400, 4000]) * np.sin(np.linspace(0, np.pi, n)) ** 2, t - 0.1, 0.09)
    elif ty == "tick":
        n = int(0.03 * SR); place(fx, filt(noise(n), "highpass", 2500) * env(n, 0.0005, 0.02), t, 0.12)
    elif ty == "pop":
        n = int(0.09 * SR); place(fx, np.sin(2 * np.pi * np.cumsum(np.linspace(700 * p, 300 * p, n)) / SR) * env(n, 0.002, 0.08), t, 0.2)
    elif ty == "beep":
        n = int(0.12 * SR); place(fx, np.sign(np.sin(2 * np.pi * 1400 * p * np.arange(n) / SR)) * 0.3 * env(n, 0.002, 0.1, 2), t, 0.12)
    elif ty == "scan":
        n = int(0.7 * SR); f = np.linspace(600, 1600, n)
        place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)) * 0.5, t, 0.1)
    elif ty == "clunk":
        n = int(0.4 * SR); tt2 = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 110 * tt2) + 0.6 * np.sin(2 * np.pi * 263 * tt2) + 0.3 * np.sin(2 * np.pi * 710 * tt2)) * np.exp(-14 * tt2)
        place(fx, x + filt(noise(n), "lowpass", 1500) * np.exp(-40 * tt2), t, 0.35 * soft)
    elif ty == "creak":
        n = int(0.9 * SR); tt2 = np.arange(n) / SR
        f = 180 + 60 * np.sin(2 * np.pi * 1.3 * tt2)
        x = filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * tt2)), "bandpass", [300, 2500])
        place(fx, x * np.sin(np.linspace(0, np.pi, n)), t, 0.06)
    elif ty == "shimmer":
        for i, nn in enumerate((81, 86, 88, 93, 98)):
            place(fx, celesta(midi(nn), 1.2), t + i * 0.05, 0.05)
    elif ty == "stamp":
        n = int(0.25 * SR)
        x = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 60, n)) / SR) * env(n, 0.001, 0.2) + filt(noise(n), "lowpass", 1800) * env(n, 0.001, 0.05) * 0.8
        place(fx, x, t, 0.5 * soft)
    elif ty == "click":
        n = int(0.05 * SR); place(fx, filt(noise(n), "bandpass", [1500, 6000]) * env(n, 0.0005, 0.02) + np.sin(2 * np.pi * 900 * np.arange(n) / SR) * env(n, 0.0005, 0.03), t, 0.2)
    elif ty == "paper":
        n = int(0.4 * SR); place(fx, filt(noise(n), "bandpass", [1500, 8000]) * np.abs(np.sin(np.linspace(0, 9, n))) * np.sin(np.linspace(0, np.pi, n)), t, 0.08)
    elif ty == "type":
        n = int(0.03 * SR); place(fx, filt(noise(n), "highpass", 2500) * env(n, 0.0005, 0.02) + np.sin(2 * np.pi * (2300 + 300 * rng.random()) * np.arange(n) / SR) * env(n, 0.0005, 0.03) * 0.3, t, 0.18)
    elif ty == "ding":
        n = int(1.0 * SR); tt2 = np.arange(n) / SR
        place(fx, (np.sin(2 * np.pi * 1760 * p * tt2) + 0.5 * np.sin(2 * np.pi * 2640 * p * tt2)) * np.exp(-4 * tt2), t, 0.09)
    elif ty == "zip":
        n = int(0.25 * SR); place(fx, filt(noise(n), "bandpass", [2000, 7000]) * np.linspace(0.2, 1, n) * env(n, 0.001, 0.25, 2), t, 0.12)
    elif ty == "buzz":
        n = int(0.3 * SR); tt2 = np.arange(n) / SR
        place(fx, filt(np.sign(np.sin(2 * np.pi * 120 * tt2)), "lowpass", 1200) * env(n, 0.005, 0.28, 2), t, 0.1)
    elif ty == "slide":
        n = int(0.5 * SR); place(fx, np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.sin(np.linspace(0, np.pi, n)), t, 0.07)
    elif ty == "alarm":
        for i in range(4):
            n = int(0.18 * SR); place(fx, np.sign(np.sin(2 * np.pi * (880 if i % 2 else 660) * np.arange(n) / SR)) * 0.4 * env(n, 0.002, 0.18, 1), t + 0.3 + i * 0.2, 0.1)
    elif ty == "boot":
        for i, nn in enumerate((72, 76, 79, 84)):
            place(fx, np.sin(2 * np.pi * midi(nn) * np.arange(int(0.25 * SR)) / SR) * env(int(0.25 * SR), 0.005, 0.25, 3), t + i * 0.09, 0.08)
    elif ty == "boing":
        n = int(0.6 * SR); tt2 = np.arange(n) / SR
        f = 200 + 180 * tt2 / 0.6
        place(fx, np.sin(2 * np.pi * np.cumsum(f * (1 + 0.15 * np.sin(2 * np.pi * 20 * tt2))) / SR) * np.exp(-4 * tt2), t, 0.18)
    elif ty == "drill":
        d = c["dur"]; n = int(d * SR); tt2 = np.arange(n) / SR
        x = filt(np.sign(np.sin(2 * np.pi * np.cumsum(420 + 60 * np.sin(2 * np.pi * 3 * tt2)) / SR)), "bandpass", [400, 3000])
        x += filt(noise(n), "bandpass", [2000, 6000]) * 0.4
        place(fx, x * np.minimum(1, np.minimum(tt2 / 0.1, (d - tt2) / 0.3)), t, 0.07)
    elif ty == "flap":
        for i in range(6):
            n = int(0.02 * SR); place(fx, filt(noise(n), "highpass", 1500) * env(n, 0.0005, 0.015), t + i * 0.035, 0.15)
    elif ty == "poof":
        n = int(0.45 * SR); place(fx, filt(noise(n), "lowpass", 1200) * env(n, 0.01, 0.4, 5), t, 0.3)
    else:
        raise ValueError(ty)

# ---------------- voice ----------------
with wave.open(os.path.join(BUILD, "vo.wav")) as w:
    vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    vsr = w.getframerate()
vo = resample_poly(vo, SR // 100, vsr // 100)[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = filt(vo, "highpass", 70)
vo /= np.max(np.abs(vo)) + 1e-9
venv = filt(np.abs(vo), "lowpass", 5, 1)
venv = np.clip(venv / (np.percentile(venv, 95) + 1e-9), 0, 1)
duck = 1 - 0.55 * venv
music /= np.max(np.abs(music)) + 1e-9
mix = 0.9 * vo + 0.23 * music * duck + 0.8 * fx
st = np.stack([mix + 0.05 * music * duck, mix - 0.05 * music * duck], 1)
st /= np.max(np.abs(st)) / 0.95
with wave.open(os.path.join(BUILD, "mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("mix", round(DUR, 2), "s,", len(cues), "cues")

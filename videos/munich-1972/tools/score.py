"""Code-synthesised score and sound effects for the Munich 1972 test (deterministic: same output every run).

    python3 tools/score.py 181

assets/score.wav  — act 1 (0-26 s): light major piano figure; from 26 s: low minor string drone + sparse piano;
                    from ~153 s: single piano notes under the names, fading to silence.
assets/sfx/*.wav  — tick (typewriter), whoosh (soft air), thud (low impact).
"""
import os, sys
import numpy as np, soundfile as sf

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 181.0
rng = np.random.default_rng(1972)
N = int(DUR * SR); out = np.zeros((N, 2))
t_all = np.arange(N) / SR
midi = lambda m: 440 * 2 ** ((m - 69) / 12)


def piano(m, dur=3.5, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    y = sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.6 + 0.9 * k)) for k, a in enumerate([1, .45, .22, .12, .06], 1))
    y *= np.minimum(1, t / 0.005)
    return vel * y


def place(y, at, pan=0.0):
    i = int(at * SR); j = min(N, i + len(y))
    if i >= N: return
    out[i:j, 0] += y[:j - i] * (1 - pan) * 0.8; out[i:j, 1] += y[:j - i] * (1 + pan) * 0.8


# act 1: cheerful major figure, C major / F / G / Am, quarter notes at 96 bpm
beat = 60 / 96
prog = [[60, 64, 67, 72], [57, 60, 65, 69], [55, 59, 62, 67], [57, 60, 64, 69]]
t = 0.4
while t < 25.5:
    ch = prog[int(t / (beat * 4)) % 4]
    for k, m in enumerate(ch):
        place(piano(m + 12, 2.2, 0.16 if k else 0.22), t + k * beat, pan=(k - 1.5) * 0.25)
    place(piano(ch[0] - 12, 3.5, 0.18), t)
    t += beat * 4
# act 2 onward: low minor drone (A minor), slow-moving strings, swells
def strings(freqs, a, b, gain):
    i, j = int(a * SR), int(min(b, DUR) * SR); tt = np.arange(j - i) / SR
    y = np.zeros(j - i)
    for f in freqs:
        for d in (-0.15, 0.0, 0.17):  # three detuned voices
            ph = 2 * np.pi * (f + d) * tt
            y += sum(np.sin(ph * k) / k for k in range(1, 7))
    env = np.minimum(1, tt / 4.0) * np.minimum(1, (tt[-1] - tt) / 4.0)
    env *= 0.75 + 0.25 * np.sin(2 * np.pi * tt / 11.0)
    y = y / np.abs(y).max() * gain * env
    out[i:j, 0] += y; out[i:j, 1] += np.roll(y, 300)
strings([midi(45), midi(52)], 26.0, 72.0, 0.10)          # Am (A2, E3)
strings([midi(41), midi(48)], 70.0, 108.0, 0.12)         # F
strings([midi(43), midi(50), midi(55)], 106.0, 128.0, 0.13)  # G, rising dread
strings([midi(45), midi(52), midi(57)], 127.0, 154.0, 0.09)  # Am, grief
for at, m in [(27.0, 69), (41.0, 72), (47.0, 71), (57.0, 69), (66.5, 76), (82.8, 72), (90.0, 71), (107.6, 69), (118.4, 76), (127.9, 69), (134.7, 72), (142.6, 69)]:
    place(piano(m, 4.5, 0.20), at, pan=0.1)
# names: single high notes, one per name, then silence
for k in range(11):
    place(piano([81, 79, 76, 81, 84, 79, 76, 74, 76, 79, 81][k], 3.0, 0.11), 162.2 + k * 0.95, pan=((k % 3) - 1) * 0.3)
# simple reverb: decaying noise impulse response
ir_n = int(2.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.4); ir /= np.abs(ir).sum() / 6
wet = np.stack([np.convolve(out[:, c], ir)[:N] for c in range(2)], 1)
mix = out * 0.7 + wet * 0.5
fade = np.ones(N); fl = int(3 * SR); fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]; mix = mix / np.abs(mix).max() * 0.7
os.makedirs(os.path.join(ROOT, "assets", "sfx"), exist_ok=True)
sf.write(os.path.join(ROOT, "assets", "score.wav"), mix.astype(np.float32), SR)

# sfx
def save(name, y): sf.write(os.path.join(ROOT, "assets", "sfx", name), (y / np.abs(y).max() * 0.8).astype(np.float32), SR)
n = int(0.09 * SR); tt = np.arange(n) / SR
save("tick.wav", rng.standard_normal(n) * np.exp(-tt * 90) + 0.6 * np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 120))
n = int(0.9 * SR); tt = np.arange(n) / SR; nz = rng.standard_normal(n)
from numpy.fft import rfft, irfft
spec = rfft(nz); fr = np.fft.rfftfreq(n, 1 / SR); spec *= np.exp(-((fr - 900) / 700) ** 2)
save("whoosh.wav", irfft(spec, n) * np.sin(np.pi * tt / tt[-1]) ** 2)
n = int(1.6 * SR); tt = np.arange(n) / SR
save("thud.wav", np.sin(2 * np.pi * (48 - 14 * tt) * tt) * np.exp(-tt * 3.2) + 0.2 * rng.standard_normal(n) * np.exp(-tt * 40))
print("wrote assets/score.wav", DUR, "s and assets/sfx/{tick,whoosh,thud}.wav")

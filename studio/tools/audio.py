"""Sound stage: voice + music + SFX -> build/mix.wav (48 kHz stereo) and build/audio_report.json.

    python3 studio/tools/audio.py <episode-dir> [--music synth|<track-id>]

Music, in order of preference:
  1. the channel's music library, studio/assets/music/<channel>/manifest.json, built by
     studio/tools/music_gen.py (ACE-Step 1.5, MIT). The bible's audio.music.current track is used (one
     track per channel, rotated on analytics, see audio.music.rotation); else one is chosen from the episode
     slug; --music overrides both. Tracks are looped with a crossfade if the episode is longer.
  2. a code-synthesised underscore: always available, deterministic, no licence questions.
SFX come from build/cues.json (the render engine). Cue types listed in studio/assets/sfx/manifest.json use
recorded or generated files (Kenney CC0, Stable Audio Open); a few more are synthesised here; anything else
is reported as unknown.
Mix: the voice keys a sidechain duck on the music, then the music is scaled so it sits
bible.audio.music_under_voice_db (default 8) below the voice while the voice is speaking. That gap is
measured on the finished stems and written to the report; the final gate checks it.
"""
import argparse, hashlib, json, os, subprocess, wave

import imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("episode")
ap.add_argument("--music", help="'synth', or a track id from the channel library")
args = ap.parse_args()
ep = os.path.abspath(args.episode)
meta = json.load(open(os.path.join(ep, "episode.json")))
bible = json.load(open(os.path.join(STUDIO, "channels", meta["channel"], "bible.json")))
acfg = bible.get("audio", {})
tl = json.load(open(os.path.join(ep, "build", "timeline.json")))
cues = json.load(open(os.path.join(ep, "build", "cues.json")))
DUR = tl["duration"]
N = int(DUR * SR)
SEED = int(hashlib.sha1(meta["slug"].encode()).hexdigest()[:8], 16)
rng = np.random.default_rng(SEED)
db = lambda g: 10 ** (g / 20)
midi = lambda n: 440 * 2 ** ((n - 69) / 12)
report = {"music": None, "sfx_files": {}, "sfx_synth": {}, "sfx_unknown": [], "credits": [], "licenses": set()}


def decode(path, ch=2):
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).astype(np.float64)


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x, axis=0)


def env(n, a=0.005, d=None, curve=6.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    return e * (np.exp(-curve * t / d) if d else 1)


def place(buf, x, t, gain=1.0):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    i = int(round(t * SR))
    if i >= len(buf) or i + len(x) <= 0:
        return
    a, b = max(0, i), min(len(buf), i + len(x))
    buf[a:b] += gain * x[a - i:b - i]


def trim_silence(x, thresh_db=-50):
    m = np.abs(x).max(1)
    idx = np.where(m > db(thresh_db))[0]
    return x[: idx[-1] + int(0.05 * SR)] if len(idx) else x


# ------------------------------------------------------------------ voice
vo = decode(os.path.join(ep, "build", "vo.wav"), 1)[:, 0]
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo = filt(vo, "highpass", 70)
vo = vo / (np.max(np.abs(vo)) + 1e-9) * 0.7
VO = np.stack([vo, vo], 1)


# ------------------------------------------------------------------ music
def synth_score():
    """Comic-documentary underscore: pizzicato walking bass, brushed kit, vibraphone pads (D minor)."""
    bpm = acfg.get("music", {}).get("bpm", 100)
    beat, sw = 60 / bpm, 0.62
    prog = [(38, [50, 53, 57, 60]), (43, [50, 55, 58, 62]), (46, [50, 53, 57, 58]), (45, [49, 52, 55, 57])]
    out = np.zeros((N, 2))

    def tone(f, dur, harm):
        t = np.arange(int(dur * SR)) / SR
        return sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    for b in range(int(DUR / beat) + 2):
        t = b * beat
        bar, bt = divmod(b, 4)
        root, chord = prog[(bar // 2) % 4]
        walk = [root, root + 7, root + 12, root + (11 if bar % 2 else 5)][bt]
        n = int(0.5 * SR)
        place(out, filt(tone(midi(walk), 0.5, (1, .5, .25, .12)) * env(n, 0.003, 0.35, 5), "lowpass", 1800), t, 0.6)
        for off, g in ((0, 0.12), (sw * beat, 0.08)):
            m = int(0.04 * SR)
            place(out, filt(rng.standard_normal(m), "highpass", 7000) * env(m, 0.001, 0.03), t + off, g)
        if bt in (1, 3):
            m = int(0.22 * SR)
            place(out, filt(rng.standard_normal(m), "bandpass", [900, 5000]) * env(m, 0.02, 0.18, 4), t, 0.16)
        if bt == 0:
            m = int(0.2 * SR)
            place(out, np.sin(2 * np.pi * np.cumsum(np.linspace(95, 45, m)) / SR) * env(m, 0.002, 0.18), t, 0.35)
            if bar % 2 == 0:
                for nn in chord:
                    m = int(beat * 8 * SR); tt = np.arange(m) / SR
                    place(out, np.sin(2 * np.pi * midi(nn + 12) * tt) * np.exp(-1.6 * tt) * (1 + 0.25 * np.sin(2 * np.pi * 5.5 * tt)), t, 0.07)
    return out, {"source": "synth", "id": "synth-caper", "style": "pizzicato caper underscore, code-synthesised", "license": "original (generated in code)"}


def library_track():
    man_p = os.path.join(STUDIO, "assets", "music", meta["channel"], "manifest.json")
    if args.music == "synth" or not os.path.exists(man_p):
        return None
    man = json.load(open(man_p))
    tracks = [t for t in man["tracks"] if t.get("approved")]
    cur = (acfg.get("music") or {}).get("current")      # one track in use per channel; analytics decides rotation
    if cur and any(t["id"] == cur for t in man["tracks"]):
        tracks = [t for t in man["tracks"] if t["id"] == cur]
    if args.music:
        tracks = [t for t in man["tracks"] if t["id"] == args.music]
    if not tracks:
        return None
    tr = tracks[SEED % len(tracks)]
    x = trim_silence(decode(os.path.join(os.path.dirname(man_p), tr["file"])))
    xf = int(1.5 * SR)
    while len(x) < N + SR:                      # loop with an equal-power crossfade
        f = np.linspace(0, np.pi / 2, xf)[:, None]
        x = np.concatenate([x[:-xf], x[-xf:] * np.cos(f) + x[:xf] * np.sin(f), x[xf:]])
    info = {k: tr.get(k) for k in ("id", "model", "prompt", "seed", "license", "file")}
    info["source"] = "library"
    return x[:N], info


music, report["music"] = library_track() or synth_score()
report["licenses"].add(report["music"]["license"])
music = music / (np.max(np.abs(music)) + 1e-9)
tt = np.arange(N) / SR
music *= (np.clip(tt / 0.8, 0, 1) * np.clip((DUR - tt) / 1.5, 0, 1))[:, None]
for c in cues:   # comic beat: the music dips for a moment under every stamp
    if c["type"] == "stamp":
        music *= (np.clip(np.abs(tt - c["t"] - 0.25) / 0.35, 0, 1) * 0.8 + 0.2)[:, None]

# ------------------------------------------------------------------ sfx
lib = json.load(open(os.path.join(STUDIO, "assets", "sfx", "manifest.json")))
_cache = {}


def lib_sample(ty, k):
    L = lib["types"][ty]
    f = L["files"][k % len(L["files"])]
    if f not in _cache:
        _cache[f] = trim_silence(decode(os.path.join(STUDIO, "assets", "sfx", f)))
    report["licenses"].add(lib["sources"][L["source"]]["license"])
    x = _cache[f]
    if len(L["files"]) < 3:   # few variants: vary speed/pitch a little (deterministic) so repeats don't sound identical
        r = 1 + (((k * 37) % 7) - 3) * 0.03
        idx = np.arange(0, len(x) - 1, r)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
        return x, db(L["gain_db"]), L.get("lead", 0.0) / r
    return x, db(L["gain_db"]), L.get("lead", 0.0)


def synth_fx(ty):
    n = lambda s: int(s * SR)
    noise = lambda k: rng.standard_normal(k)
    if ty == "whoosh":
        k = n(0.42); return filt(noise(k), "bandpass", [300, 3500]) * np.sin(np.linspace(0, np.pi, k)) ** 3, 0.10, 0.12
    if ty == "boing":
        k = n(0.6); t = np.arange(k) / SR
        return np.sin(2 * np.pi * np.cumsum((200 + 300 * t) * (1 + .15 * np.sin(2 * np.pi * 20 * t))) / SR) * np.exp(-4 * t), 0.18, 0
    if ty in ("flap", "flock"):
        out = np.zeros(n(0.3))
        for i in range(6):
            k = n(0.02); s = n(i * 0.035); out[s:s + k] += filt(noise(k), "highpass", 1500) * env(k, .0005, .015)
        return out, 0.15, 0
    if ty == "poof":
        k = n(0.45); return filt(noise(k), "lowpass", 1200) * env(k, .01, .4, 5), 0.3, 0
    if ty == "beep":
        k = n(0.12); return np.sign(np.sin(2 * np.pi * 1400 * np.arange(k) / SR)) * .3 * env(k, .002, .1, 2), 0.12, 0
    return None


fx = np.zeros((N, 2))
for i, c in enumerate(cues):
    ty, t = c["type"], c["t"]
    if ty in lib["types"]:
        if ty == "marching":            # a short march: alternating steps
            for s in range(8):
                x, g, _ = lib_sample(ty, i + s)
                place(fx, x, t + s * 0.27, g * (0.7 if s % 2 else 1))
        else:
            x, g, lead = lib_sample(ty, i)
            place(fx, x, t - lead, g)
        report["sfx_files"][ty] = report["sfx_files"].get(ty, 0) + 1
    elif (s := synth_fx(ty)) is not None:
        x, g, lead = s
        place(fx, x, t - lead, g)
        report["sfx_synth"][ty] = report["sfx_synth"].get(ty, 0) + 1
    else:
        report["sfx_unknown"].append(ty)
if acfg.get("button", True) and "button" in lib["types"]:      # a short musical button on the last line
    x, g, _ = lib_sample("button", SEED)
    place(fx, x, tl["paras"][-1]["end"] + 0.08, g)
    report["sfx_files"]["button"] = report["sfx_files"].get("button", 0) + 1

# ------------------------------------------------------------------ duck + level
w = int(0.05 * SR)
frames = N // w


def frame_rms(x):
    m = x if x.ndim == 1 else x.mean(1)
    return np.sqrt((m[: frames * w].reshape(frames, w) ** 2).mean(1) + 1e-12)


v_rms = frame_rms(vo)
speech = v_rms > np.max(v_rms) * db(-30)
# sidechain: attack ~30 ms, release ~300 ms, on 50 ms frames
target = speech.astype(float)
duck_env = np.zeros(frames)
for k in range(frames):
    prev = duck_env[k - 1] if k else 0
    duck_env[k] = prev + (target[k] - prev) * (0.8 if target[k] > prev else 0.16)
depth = db(-acfg.get("duck_db", 6))
gain = np.repeat(1 - (1 - depth) * duck_env, w)
gain = np.pad(gain, (0, N - len(gain)), mode="edge")[:N]
music *= gain[:, None]
under = acfg.get("music_under_voice_db", 8)
m_rms = frame_rms(music)
cur = 20 * np.log10(np.median(v_rms[speech]) / np.median(m_rms[speech]))
music *= db(cur - under)
m_rms = frame_rms(music)
measured = 20 * np.log10(np.median(v_rms[speech]) / np.median(m_rms[speech]))
width = 0.06
mix = VO + music * np.array([1 + width, 1 - width]) + fx
peak = np.max(np.abs(mix))
mix = mix / peak * db(-1.0)
with wave.open(os.path.join(ep, "build", "mix.wav"), "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

report["music_under_voice_db"] = round(float(measured), 2)
report["licenses"] = sorted(report["licenses"])
report["credits"] = sorted({lib["sources"][lib["types"][t]["source"]].get("credit") for t in report["sfx_files"]
                            if lib["sources"][lib["types"][t]["source"]].get("credit")})
json.dump(report, open(os.path.join(ep, "build", "audio_report.json"), "w"), indent=1)
print(f"mix {DUR:.2f}s | music: {report['music']['source']} {report['music']['id']} | music {measured:.1f} dB under voice"
      f" | sfx files {sum(report['sfx_files'].values())}, synth {sum(report['sfx_synth'].values())}, unknown {report['sfx_unknown'] or 0}")

"""Build a channel's music library with ACE-Step 1.5 (MIT licence): studio/assets/music/<channel>/.

    <audio-venv>/bin/python studio/tools/music_gen.py <channel> [--only <track-id>] [--device cpu|cuda]

Each entry in bible.audio.music.tracks ({id, caption, bpm, duration, seed}) becomes <id>.ogg plus a manifest
row with the prompt, seed, model, licence and automatic checks:
  - no vocals: Whisper must hear no words (the prompt asks for an instrumental; this confirms it),
  - no clipping, no dropout longer than 1.5 s mid-track; trailing silence is trimmed.
Tracks are written with approved: false. A human listens and sets approved: true. Only approved tracks are
used by studio/tools/audio.py (preview one on an episode with --music <id>).

Two phases, because of memory: (1) generate every track to _tmp/ with the model loaded; (2) re-exec as a fresh,
small process (--finish) that checks and encodes. Loading Whisper next to the 13 GB model got the process
OOM-killed, and CTranslate2 plus PyTorch in one process can segfault.
Measured here (4 CPU cores, 15 GB): 60 s of music in about 3.5 min (ACESTEP_VAE_DECODE_CHUNK_SIZE=64 is required
to fit the VAE decode in memory). On a 6 GB RTX 3060, ACE-Step's tier table says: turbo DiT, no LM, INT8/offload.
Setup: studio/tools/music_setup.sh.
"""
import argparse, glob, hashlib, json, os, subprocess, sys, time

import numpy as np
import soundfile as sf

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACE = os.environ.get("ACESTEP_DIR", os.path.expanduser("~/ACE-Step-1.5"))
os.environ.setdefault("ACESTEP_VAE_DECODE_CHUNK_SIZE", "64")
ap = argparse.ArgumentParser()
ap.add_argument("channel")
ap.add_argument("--only")
ap.add_argument("--device", default="auto")
ap.add_argument("--finish", action="store_true", help="internal: phase 2")
args = ap.parse_args()
bible = json.load(open(os.path.join(STUDIO, "channels", args.channel, "bible.json")))
out_dir = os.path.join(STUDIO, "assets", "music", args.channel)
tmp = os.path.join(out_dir, "_tmp")
os.makedirs(tmp, exist_ok=True)
man_p = os.path.join(out_dir, "manifest.json")

if not args.finish:
    # ---------------- phase 1: generate
    sys.path.insert(0, ACE)
    import torch
    from acestep.handler import AceStepHandler
    from acestep.llm_inference import LLMHandler
    from acestep.inference import GenerationConfig, GenerationParams, generate_music
    tracks = [t for t in bible["audio"]["music"]["tracks"] if not args.only or t["id"] == args.only]
    device = args.device if args.device != "auto" else ("cuda" if torch.cuda.is_available() else "cpu")
    dit = AceStepHandler()
    msg, ok = dit.initialize_service(project_root=ACE, config_path="acestep-v15-turbo", device=device,
                                     offload_to_cpu=device == "cuda")
    if not ok:
        sys.exit(f"ACE-Step init failed: {msg}")
    commit = subprocess.run(["git", "-C", ACE, "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    for tr in tracks:
        t0 = time.time()
        params = GenerationParams(caption=tr["caption"], lyrics="[Instrumental]", instrumental=True, bpm=tr.get("bpm"),
                                  duration=tr.get("duration", 60), inference_steps=8, thinking=False, seed=tr.get("seed", 1))
        gen_dir = os.path.join(tmp, tr["id"])
        os.makedirs(gen_dir, exist_ok=True)
        generate_music(dit, LLMHandler(), params, GenerationConfig(batch_size=1, audio_format="wav"), save_dir=gen_dir)
        wavs = glob.glob(os.path.join(gen_dir, "*.wav"))
        if not wavs:
            print(f"{tr['id']}: generation failed", flush=True); continue
        os.replace(wavs[0], os.path.join(tmp, tr["id"] + ".wav"))
        json.dump(dict(tr, model=f"ACE-Step 1.5 turbo ({commit}, {device}, 8 steps)", gen_seconds=round(time.time() - t0)),
                  open(os.path.join(tmp, tr["id"] + ".json"), "w"))
        print(f"{tr['id']}: generated in {time.time() - t0:.0f}s", flush=True)
    os.execv(sys.executable, [sys.executable, os.path.abspath(__file__), args.channel, "--finish"])

# ---------------- phase 2: check, trim, encode, register
man = json.load(open(man_p)) if os.path.exists(man_p) else {"_doc": "Channel music library. approved=true only after a human listen.", "tracks": []}
check = [os.environ.get("STUDIO_PY", "python3"), os.path.join(STUDIO, "tools", "vocal_check.py")]
for meta_p in sorted(glob.glob(os.path.join(tmp, "*.json"))):
    tr = json.load(open(meta_p))
    wav = meta_p[:-5] + ".wav"
    x, sr = sf.read(wav)
    m = np.abs(x).max(1)
    idx = np.where(m > 10 ** (-50 / 20))[0]
    x = x[: idx[-1] + int(0.05 * sr)]
    peak = float(np.abs(x).max())
    frame = int(0.5 * sr)
    rms = np.array([np.sqrt((x[i:i + frame] ** 2).mean()) for i in range(0, len(x) - frame, frame)])
    run = worst = 0
    for q in (rms < 10 ** (-40 / 20))[2:-2]:
        run = run + 1 if q else 0
        worst = max(worst, run)
    vc = json.loads(subprocess.run(check + [wav], capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])
    words = vc["words"]
    x = x / peak * 10 ** (-1 / 20)
    path = os.path.join(out_dir, tr["id"] + ".ogg")
    norm_wav = wav[:-4] + ".norm.wav"
    sf.write(norm_wav, x, sr)
    # encode with ffmpeg/libvorbis: libsndfile's Vorbis writer segfaulted on a 60 s stereo track (exit 139)
    import imageio_ffmpeg
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", norm_wav, "-c:a", "libvorbis", "-q:a", "6", path], check=True)
    os.remove(norm_wav)
    row = {"id": tr["id"], "file": tr["id"] + ".ogg", "prompt": tr["caption"], "bpm": tr.get("bpm"), "seed": tr.get("seed", 1),
           "model": tr["model"], "license": "ACE-Step 1.5 (MIT); output is ours", "duration_s": round(len(x) / sr, 2),
           "gen_seconds": tr["gen_seconds"],
           "checks": {"words_heard": words, "whisper_ignored": vc["ignored"], "clipped_before_normalise": peak >= 0.999, "longest_dropout_s": worst * 0.5,
                      "ok": not words and worst * 0.5 <= 1.5},
           "sha1": hashlib.sha1(open(path, "rb").read()).hexdigest()[:12], "approved": False}
    man["tracks"] = [r for r in man["tracks"] if r["id"] != tr["id"]] + [row]
    json.dump(man, open(man_p, "w"), indent=1)
    os.remove(wav); os.remove(meta_p)
    print(f"{tr['id']}: {row['duration_s']}s  checks {row['checks']}", flush=True)
for d in glob.glob(os.path.join(tmp, "*")):
    if os.path.isdir(d) and not os.listdir(d):
        os.rmdir(d)
if not os.listdir(tmp):
    os.rmdir(tmp)

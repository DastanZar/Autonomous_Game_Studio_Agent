"""Generate SFX with Stable Audio Open 1.0 into studio/assets/sfx/sao/ and register them in the SFX manifest.

    <venv>/bin/python studio/tools/sfx_gen.py [--only <type>] [--device cpu|cuda]

Prompts live in studio/assets/sfx/sao_prompts.json: {type: {prompt, seconds, variants, gain_db, lead}}.
'lead' is how many seconds before the cue the sound starts (a whoosh peaks on the cut, so it starts early);
use "peak" to set it to the measured loudness peak of each file.
Checks per file: not silent, trimmed, normalised to -1 dBFS. The model is gated: accept the licence on
huggingface.co/stabilityai/stable-audio-open-1.0 and provide a token (HF_TOKEN or ~/.cache/huggingface/token).
Licence: Stability AI Community License (free for commercial use under US$1M annual revenue); outputs are ours.
Needs: torch, diffusers, torchsde, soundfile.
"""
import argparse, json, os, time

import numpy as np
import soundfile as sf
import torch
from diffusers import StableAudioPipeline

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(STUDIO, "assets", "sfx")
ap = argparse.ArgumentParser()
ap.add_argument("--only")
ap.add_argument("--device", default="auto")
args = ap.parse_args()
spec = json.load(open(os.path.join(SFX, "sao_prompts.json")))
if args.only:
    spec = {k: v for k, v in spec.items() if k == args.only}
device = args.device if args.device != "auto" else ("cuda" if torch.cuda.is_available() else "cpu")
tok_p = os.path.expanduser("~/.cache/huggingface/token")
token = os.environ.get("HF_TOKEN") or (open(tok_p).read().strip() if os.path.exists(tok_p) else None)
pipe = StableAudioPipeline.from_pretrained("stabilityai/stable-audio-open-1.0", token=token,
                                           torch_dtype=torch.float16 if device == "cuda" else torch.float32).to(device)
man_p = os.path.join(SFX, "manifest.json")
man = json.load(open(man_p))
man["sources"]["sao"] = {"license": "Stability AI Community License (outputs owned by us; free under US$1M revenue)",
                         "url": "https://huggingface.co/stabilityai/stable-audio-open-1.0", "credit_required": False,
                         "credit": "Some sound effects generated with Stable Audio Open (Stability AI)"}
os.makedirs(os.path.join(SFX, "sao"), exist_ok=True)
for ty, s in spec.items():
    files, leads = [], []
    for v in range(s.get("variants", 3)):
        t0 = time.time()
        g = torch.Generator("cpu").manual_seed(1000 + v)
        a = pipe(s["prompt"], negative_prompt=s.get("negative", "music, speech, low quality, distortion"),
                 num_inference_steps=s.get("steps", 50), audio_end_in_s=s["seconds"], generator=g).audios[0]
        x = a.T.float().cpu().numpy()
        sr = pipe.vae.sampling_rate
        mono = np.abs(x).max(1)
        on = np.where(mono > mono.max() * 10 ** (-45 / 20))[0]
        if not len(on) or mono.max() < 1e-3:
            print(f"{ty}#{v}: silent, skipped"); continue
        x = x[max(0, on[0] - int(0.01 * sr)): on[-1] + int(0.03 * sr)]
        x = x / np.abs(x).max() * 10 ** (-1 / 20)
        f = f"sao/{ty}_{v}.ogg"
        sf.write(os.path.join(SFX, f), x, sr, format="OGG", subtype="VORBIS")
        w = int(0.02 * sr)
        rms = [np.sqrt((x[i:i + w] ** 2).mean()) for i in range(0, len(x) - w, w)]
        leads.append(round(int(np.argmax(rms)) * 0.02, 3))
        files.append(f)
        print(f"{ty}#{v}: {len(x) / sr:.2f}s, loudest at {leads[-1]}s, {time.time() - t0:.0f}s")
    if files:
        lead = float(np.median(leads)) if s.get("lead") == "peak" else float(s.get("lead", 0))
        man["types"][ty] = {"files": files, "gain_db": s.get("gain_db", -8), "source": "sao", "lead": lead,
                            "note": s["prompt"]}
json.dump(man, open(man_p, "w"), indent=1)

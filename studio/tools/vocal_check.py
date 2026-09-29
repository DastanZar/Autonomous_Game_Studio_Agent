"""Does an audio file contain real vocals? Prints JSON: {"words": "<confident speech>", "ignored": [...]}.

Whisper hallucinates stock phrases on music ("Thanks for watching!", "Thank you.", "Mm-hmm") with low confidence.
Measured on our tracks: hallucinations score avg_logprob -0.88 to -0.97; real narration scores about -0.1 with
no_speech_prob 0.04. So a segment counts as vocals only if avg_logprob > -0.5 and no_speech_prob < 0.5, and it
is not one of the known stock phrases.
Run as its own process: CTranslate2 (Whisper) and PyTorch in one process can crash (clashing OpenMP runtimes)."""
import json, re, sys
from faster_whisper import WhisperModel

STOCK = {"thanks for watching", "thank you for watching", "thank you", "mmhmm", "mm", "hmm", "you", "bye", "music", "applause"}
segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(sys.argv[1], vad_filter=True)
real, ignored = [], []
for s in segs:
    key = re.sub(r"[^a-z ]", "", s.text.lower()).strip()
    if s.avg_logprob > -0.5 and s.no_speech_prob < 0.5 and key not in STOCK:
        real.append(s.text.strip())
    else:
        ignored.append({"text": s.text.strip(), "avg_logprob": round(s.avg_logprob, 2), "no_speech_prob": round(s.no_speech_prob, 2)})
print(json.dumps({"words": " ".join(real), "ignored": ignored}))

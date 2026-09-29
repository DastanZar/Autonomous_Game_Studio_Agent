"""Print the words Whisper hears in an audio file (JSON: {"words": "..."}). Empty means instrumental.
Run as its own process: CTranslate2 (Whisper) and PyTorch in one process can crash (clashing OpenMP runtimes)."""
import json, sys
from faster_whisper import WhisperModel
segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(sys.argv[1], vad_filter=True)
print(json.dumps({"words": " ".join(s.text.strip() for s in segs).strip()}))

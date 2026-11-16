# python3 -I tools/transcrever_narracao.py <audio> <out_words.json> [modelo]
# faster-whisper com tempo por palavra (o áudio entra decodificado pelo ffmpeg).
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "medium"
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
m = WhisperModel(model, device="cpu", compute_type="int8")
segs, info = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5, vad_filter=False)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
json.dump({"duration": len(a) / 16000, "words": words}, open(out, "w"), ensure_ascii=False, indent=1)
print(" ".join(x["w"] for x in words))

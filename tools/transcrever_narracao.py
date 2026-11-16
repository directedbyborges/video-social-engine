# python3 -I tools/transcrever_narracao.py <audio> <out transcript.json> [modelo]
# faster-whisper com tempo por palavra; saída no formato do motor (blocos por fala + palavras).
import sys, json, subprocess, tempfile, os
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "small"
wav = tempfile.mktemp(suffix=".wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)
m = WhisperModel(model, device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=False, beam_size=5,
                       initial_prompt="Romplas, Uruguai Original, linha HP, revestimento náutico.")
words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words if w.word.strip()]
os.remove(wav)
# blocos: quebra em pausas >= 0,35 s ou blocos > 6 s
res, cur = [], []
for w in words:
    if cur and (w["s"] - cur[-1]["e"] >= .35 or w["e"] - cur[0]["s"] > 6):
        res.append(cur); cur = []
    cur.append(w)
if cur: res.append(cur)
blocks = [{"s": b[0]["s"], "e": b[-1]["e"], "text": " ".join(x["w"] for x in b), "words": b} for b in res]
json.dump(blocks, open(out, "w"), ensure_ascii=False, indent=1)
for b in blocks: print(f"[{b['s']:6.2f}-{b['e']:6.2f}] {b['text']}")

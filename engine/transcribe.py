# python3 -I engine/transcribe.py <video_or_audio> <out.json> [lang]
# Whisper Turbo local (sherpa-onnx). Gera blocos por fala + tempo estimado por palavra (alinhamento por sub-blocos).
import sys, os, re, json, difflib, subprocess, tempfile, numpy as np
MODEL_DIR = os.environ.get("VSE_MODELS", os.path.expanduser("~/.cache/vse")) + "/sherpa-onnx-whisper-turbo"

def ensure_model():
    if os.path.exists(MODEL_DIR + "/turbo-encoder.int8.onnx"): return
    os.makedirs(os.path.dirname(MODEL_DIR), exist_ok=True)
    url = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2"
    tb = os.path.dirname(MODEL_DIR) + "/turbo.tar.bz2"
    subprocess.run(["curl", "-sSL", "-m", "580", "-o", tb, url], check=True)
    subprocess.run(["tar", "xjf", tb, "-C", os.path.dirname(MODEL_DIR)], check=True); os.remove(tb)

def main(src, out, lang="pt"):
    ensure_model()
    import sherpa_onnx, soundfile as sf
    d = MODEL_DIR
    r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=d + "/turbo-encoder.int8.onnx", decoder=d + "/turbo-decoder.int8.onnx",
        tokens=d + "/turbo-tokens.txt", language=lang, task="transcribe", num_threads=2)
    wav = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)
    a, sr = sf.read(wav, dtype="float32"); os.remove(wav)
    norm = lambda w: re.sub(r"[^\wÀ-ú]", "", w.lower())
    def tr(t0, t1):
        st = r.create_stream(); st.accept_waveform(sr, a[int(max(0, t0) * sr):int(t1 * sr)]); r.decode_stream(st)
        return st.result.text.strip()
    # energia em 10 ms
    hop = int(.01 * sr); n = len(a) // hop
    db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2)) + 1e-9 for i in range(n)]))
    sm = np.convolve(db, np.ones(5) / 5, mode="same")
    thr = max(np.percentile(db, 20) + 8, db.max() - 38)
    v = sm > thr
    runs, s = [], None
    for i, x in enumerate(v):
        if x and s is None: s = i
        if not x and s is not None: runs.append([s, i]); s = None
    if s is not None: runs.append([s, n])
    merged = []
    for s, e in runs:
        if merged and s - merged[-1][1] < 14: merged[-1][1] = e
        else: merged.append([s, e])
    merged = [m for m in merged if m[1] - m[0] >= 8]
    chunks, cur = [], None
    for s, e in merged:
        if cur is None: cur = [s, e]; continue
        if (e - cur[0]) > 600 or s - cur[1] >= 30: chunks.append(cur); cur = [s, e]
        else: cur[1] = e
    if cur: chunks.append(cur)
    res = []
    for s, e in chunks:
        s, e = s / 100, e / 100
        txt = tr(s - .08, e + .08)
        words = [w for w in txt.split() if norm(w)]
        # sub-blocos em vales de energia (~1.2–2.4 s) para ancorar o tempo das palavras
        cuts, t = [s], s
        while e - t > 2.6:
            lo, hi = int((t + 1.2) * 100), int(min(e - .8, t + 2.4) * 100)
            if hi <= lo: break
            i = lo + int(np.argmin(sm[lo:hi])); cuts.append(i / 100); t = i / 100
        cuts.append(e)
        full = [norm(w) for w in words]; anchors = {}; pos = 0
        smax = sm[int(s * 100):int(e * 100)].max()
        for c0, c1 in zip(cuts[:-1], cuts[1:]):
            pw = [w for w in (tr(c0 - .05, c1 + .05) if len(cuts) > 2 else txt).split() if norm(w)]
            if not pw: continue
            pn = [norm(w) for w in pw]
            vf = [i for i in range(int(c0 * 100), int(c1 * 100)) if sm[i] > smax - 30] or list(range(int(c0 * 100), int(c1 * 100)))
            wts = [len(x) + 1.5 for x in pn]; tot = sum(wts); acc = 0; times = []
            for wt in wts:
                i0 = vf[min(len(vf) - 1, int(acc / tot * len(vf)))]; acc += wt
                i1 = vf[min(len(vf) - 1, max(0, int(acc / tot * len(vf)) - 1))] + 1
                times.append((i0 / 100, i1 / 100))
            m = difflib.SequenceMatcher(None, full[pos:], pn, autojunk=False)
            for b in m.get_matching_blocks():
                for k in range(b.size): anchors[pos + b.a + k] = times[b.b + k]
            last = [pos + b.a + b.size for b in m.get_matching_blocks() if b.size]
            if last: pos = max(last)
        idx = sorted(anchors); wl = []
        for i, w in enumerate(words):
            if i in anchors: ws, we = anchors[i]
            else:
                p = max([j for j in idx if j < i], default=None); q = min([j for j in idx if j > i], default=None)
                t0 = anchors[p][1] if p is not None else s; t1 = anchors[q][0] if q is not None else e
                kp = p if p is not None else -1; kq = q if q is not None else len(words)
                ws = t0 + (t1 - t0) * (i - kp - 1) / max(1, kq - kp - 1); we = t0 + (t1 - t0) * (i - kp) / max(1, kq - kp - 1)
            wl.append({"w": w, "s": round(ws, 2), "e": round(we, 2)})
        for i in range(1, len(wl)):
            if wl[i]["s"] < wl[i - 1]["s"]: wl[i]["s"] = wl[i - 1]["s"] + .05
        res.append({"s": round(s, 2), "e": round(e, 2), "text": txt, "words": wl})
        print(f"[{s:6.2f}-{e:6.2f}] {txt}", flush=True)
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "pt")

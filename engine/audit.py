# python3 engine/audit.py <proj> <video.mp4>  -> <proj>/audit/: folhas de contato (2 qps), quadros dos cortes, curva de energia, loudness
import sys, os, json, subprocess, numpy as np
P, V = os.path.abspath(sys.argv[1]), sys.argv[2]
A = P + "/audit"; os.makedirs(A, exist_ok=True)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", V], capture_output=True, text=True).stdout)
# folhas: 30 s por folha, 2 quadros/s, 10x6
for i, s in enumerate(range(0, int(dur) + 1, 30)):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-t", "30", "-i", V, "-vf",
                    "fps=2,scale=200:-1,drawtext=text='%{pts\\:hms}':x=3:y=3:fontsize=13:fontcolor=white:box=1:boxcolor=black@0.7,tile=10x6",
                    "-frames:v", "1", f"{A}/folha_{i:02d}.png"])
# quadros antes/depois de cada transição de painel e corte de cena
TL = json.load(open(P + "/timeline.json"))
ts = sorted({round(x, 2) for s in TL["panels"] for x in [s["start"], s["end"]] + [sc["t"] for sc in s["scenes"]]})
sel = "+".join(f"eq(n\\,{max(0, int(t * 30) + d)})" for t in ts for d in (-1, 1))
if sel:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", V, "-vf", f"select='{sel}',scale=180:-1,tile=8x{(len(ts) * 2 + 7) // 8}", "-frames:v", "1", "-vsync", "0", f"{A}/cortes.png"])
# curva de energia de movimento
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", V, "-vf", "scale=160:90,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(float)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
lines = [f"{i / 30:5.1f}s {d[i:i + 6].mean():6.2f} " + "#" * int(min(d[i:i + 6].mean() * 3, 60)) for i in range(0, len(d), 6)]
open(f"{A}/energia.txt", "w").write("\n".join(lines))
holes = [l.split()[0] for l in lines if float(l.split()[1]) < .25]
lo = subprocess.run(["ffmpeg", "-i", V, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = [l for l in lo.splitlines() if l.strip().startswith("I:")][-1].strip()
print(f"auditoria em {A} · duração {dur:.1f}s · loudness {I} · janelas paradas (<0.25): {', '.join(holes[:20]) or 'nenhuma'}")

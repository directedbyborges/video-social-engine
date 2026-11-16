# python3 -I tools/clip_frames.py <proj>
# Extrai os quadros (30 fps, JPEG) dos clipes do b-roll de cada cena do modo seq para <proj>/clips/sNN,
# já reenquadrados no foco (fx, fy) com sangria de 15% para os zooms/pans do motor.
# No spec, cada fundo de clipe leva:  "clip": "clips/sNN", "src": ["magnific videos/*7962081*", ...], "ss": 1.2 (opcional),
#   "fx"/"fy" (0–100, foco), "scale" (zoom extra), "key": "green" (troca a tela verde pela imagem "key_img").
# Sem "ss": pula o primeiro meio segundo e procura um trecho sem corte interno (detecção de cena do ffmpeg).
import sys, os, glob, json, subprocess, importlib.util, re, shutil
import numpy as np
from PIL import Image, ImageFilter
W, H = 1242, 2208   # 1080x1920 + 15% de sangria

def load_spec(P):
    sp = importlib.util.spec_from_file_location("spec", P + "/spec.py"); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m.SPEC

def dur_of(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 0)

def cuts_of(f):
    out = subprocess.run(["ffmpeg", "-i", f, "-vf", "scale=320:-2,select='gt(scene,0.28)',showinfo", "-f", "null", "-"], capture_output=True, text=True).stderr
    return [float(x) for x in re.findall(r"pts_time:([\d.]+)", out)]

def pick_ss(f, need):
    d = dur_of(f); cs = [0.0] + cuts_of(f) + [d]
    best = None
    for a, b in zip(cs[:-1], cs[1:]):
        a2 = a + (.5 if a == 0 else .15)
        if b - a2 >= need: return round(a2, 2)
        if best is None or b - a2 > best[1] - best[0]: best = (a2, b)
    return round(max(0, best[0]), 2) if best else 0.0

def key_green(d, key_img):
    ui = Image.open(key_img).convert("RGB")
    for fp in sorted(glob.glob(d + "/*.jpg")):
        im = Image.open(fp).convert("RGB"); a = np.asarray(im).astype(int)
        m = (a[..., 1] > 110) & (a[..., 1] > a[..., 0] * 1.35) & (a[..., 1] > a[..., 2] * 1.35)
        if m.sum() < 500: continue
        ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        scr = Image.new("RGB", im.size); scr.paste(ui.resize((x1 - x0 + 1, y1 - y0 + 1), Image.LANCZOS), (x0, y0))
        mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
        Image.composite(scr, im, mask).save(fp, quality=92)

def main(P):
    S = load_spec(P); seq = S["seq"]; report = []
    for i, sc in enumerate(seq):
        for k in ("bg", "bg2"):
            b = sc.get(k)
            if not isinstance(b, dict) or not b.get("clip") or not b.get("src"): continue
            src = None
            for pat in b["src"]:
                hits = sorted(glob.glob(os.path.join(P, pat)))
                if hits: src = hits[0]; break
            if not src: report.append(f"cena {i + 1:02d}: clipe não encontrado ({b['src'][0]})"); continue
            nxt = seq[i + 1]["t"] if i + 1 < len(seq) and "t" in seq[i + 1] else sc.get("t", 0) + 2.5
            need = (nxt - sc["t"]) + .3
            ss = b.get("ss") if b.get("ss") is not None else pick_ss(src, need)
            out = os.path.join(P, b["clip"]); shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
            s = b.get("scale", 1.0); fx, fy = b.get("fx", 50) / 100, b.get("fy", 50) / 100
            sw, sh = int(W * s), int(H * s)
            vf = (f"fps=30,scale={sw}:{sh}:force_original_aspect_ratio=increase:flags=lanczos,"
                  f"crop={W}:{H}:(in_w-{W})*{fx}:(in_h-{H})*{fy}")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-i", src, "-t", f"{need:.2f}", "-vf", vf, "-q:v", "3", out + "/%04d.jpg"], check=True)
            if b.get("key") == "green": key_green(out, os.path.join(P, b["key_img"]))
            n = len(glob.glob(out + "/*.jpg"))
            report.append(f"cena {i + 1:02d}: {os.path.basename(src)} · início {ss}s · {n} quadros" + (" (CURTO)" if n < need * 30 - 2 else ""))
    print("\n".join(report))

if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1]))

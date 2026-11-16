# Modo "shots": vídeo narrado montado plano a plano.
# Para cada quadro: fundo (b-roll reenquadrado pelo foco, ou cor da marca) + gráfico do plano (PNG transparente)
# e, por cima de tudo, a câmera de entrada/saída do plano (zoom/pan com o pico de velocidade no corte),
# com desfoque de movimento por supersampling quando a câmera anda rápido.
import os, subprocess, hashlib, numpy as np, cv2
import grade

ZIN, ZOUT, PAN = 1.2, .82, 330          # zoom in/out da transição e deslocamento do pan (~30% W)
CX, CY = 540, 960

def e_out(x): return 1 - (1 - x) ** 4   # SNAP-IN
def e_in(x): return x ** 4              # ACCEL-OUT

def cam(sh, t):
    L = sh["end"] - sh["start"]; u = t - sh["start"]
    IN, OUT = min(.8, L * .5), min(.7, L * .45)
    s, x, y = 1.0, 0.0, 0.0
    ci, co = sh.get("cin"), sh.get("cout")
    if ci and u < IN:
        k = 1 - e_out(max(0, u) / IN)
        if ci == "zin": s = 1 + (ZIN - 1) * k
        elif ci == "zout": s = 1 + (ZOUT - 1) * k
        elif ci == "panR": x = -PAN * k
        elif ci == "panL": x = PAN * k
        elif ci == "panU": y = PAN * k
        elif ci == "panD": y = -PAN * k
    if co and u > L - OUT:
        k = e_in(min(1, (u - (L - OUT)) / OUT))
        if co == "zin": s *= 1 + (ZIN - 1) * k
        elif co == "zout": s *= 1 + (ZOUT - 1) * k
        elif co == "panR": x += PAN * k
        elif co == "panL": x -= PAN * k
        elif co == "panU": y -= PAN * k
        elif co == "panD": y += PAN * k
    return s, x, y

def mat(s, x, y): return np.float32([[s, 0, CX - CX * s + x], [0, s, CY - CY * s + y], [0, 0, 1]])

def compose(src, F, gfx, C, W, H, bgf):
    """Câmera C aplicada ao b-roll direto da fonte (sangra com a própria imagem) e ao gráfico (borda repetida, nunca espelhada)."""
    base = cv2.warpAffine(src, (C @ F)[:2], (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) if src is not None else bgf.copy()
    if gfx is not None:
        g = gfx if np.allclose(C, np.eye(3)) else cv2.warpAffine(gfx, C[:2], (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        base = blend(base, g)
    return base

def blend(bg, rgba):
    if rgba is None: return bg
    if rgba.ndim == 3 and rgba.shape[2] == 3: return rgba
    a = rgba[:, :, 3:4].astype(np.uint16)
    if a.max() == 0: return bg
    return ((rgba[:, :, :3].astype(np.uint16) * a + bg.astype(np.uint16) * (255 - a) + 127) // 255).astype(np.uint8)

class Broll:
    """Lê vídeo (sequencial) ou foto; aplica a cor da marca uma vez (cache) e reenquadra pelo foco."""
    def __init__(self, P, b, W, H):
        self.b, self.W, self.H = b, W, H
        f = b["file"]; os.makedirs(P + "/_cache", exist_ok=True)
        g = b.get("grade", "natural")
        key = hashlib.md5(f"{f}{os.path.getmtime(f)}{g}".encode()).hexdigest()[:10]
        self.is_img = f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        vf = None
        if g and g != "none":
            pr = dict(grade.PRESETS[g]) if isinstance(g, str) else dict(g)
            if self.is_img: pr["wb"] = 0          # foto: sem balanço de branco automático (mede só vídeo)
            vf = grade.vf(f, pr)
        if self.is_img:
            out = f"{P}/_cache/{key}.png"
            if not os.path.exists(out):
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f] + (["-vf", vf] if vf else []) + ["-frames:v", "1", out], check=True)
            self.img = cv2.imread(out); self.cap = None
        else:
            out = f"{P}/_cache/{key}.mp4"
            if not os.path.exists(out):
                sc = "scale='if(gt(ih,2560),-2,iw)':'if(gt(ih,2560),2560,ih)'"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(b.get("ss", 0)), "-i", f, "-t", "6", "-an", "-vf", ",".join(x for x in [sc, vf] if x),
                                "-c:v", "libx264", "-crf", "14", "-preset", "fast", out], check=True)
            self.cap = cv2.VideoCapture(out); self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30; self.idx, self.fr = -1, None
    def frame(self, sh, t):
        b, W, H = self.b, self.W, self.H
        if self.cap is None: fr = self.img
        else:
            want = int((t - sh["start"]) * self.fps)
            while self.idx < want:
                ok, f = self.cap.read()
                if not ok: break
                self.fr, self.idx = f, self.idx + 1
            fr = self.fr
        h, w = fr.shape[:2]
        u = (t - sh["start"]) / max(.1, sh["end"] - sh["start"])
        s = max(W / w, H / h) * b.get("scale", 1.0) * (1 + b.get("zoom", .04) * u)   # push linear (deriva)
        fx, fy = b.get("focus", [.5, .5])
        tx = min(0, max(W - w * s, CX - fx * w * s)); ty = min(0, max(H - h * s, 920 - fy * h * s))
        if b.get("dim"): fr = (fr.astype(np.float32) * (1 - b["dim"])).astype(np.uint8)
        return fr, np.float32([[s, 0, tx], [0, s, ty], [0, 0, 1]])

def render(TL, P, t0, t1, out_v, FPS, W, H, BG):
    shots = TL["shots"]; gfx_last = int(TL["gfxEnd"] * FPS) - 1
    rolls = {}
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", out_v], stdin=subprocess.PIPE)
    bgf = np.full((H, W, 3), BG, np.uint8)
    for k in range(int(round(t0 * FPS)), int(round(t1 * FPS))):
        t = k / FPS
        si = max([i for i, sh in enumerate(shots) if sh["start"] <= t + 1e-6] or [0]); sh = shots[si]
        b = sh.get("broll"); src, F = None, None
        if b and b.get("file"):
            if si not in rolls: rolls = {si: Broll(P, b, W, H)}   # um b-roll aberto por vez
            src, F = rolls[si].frame(sh, t)
        gp = f"{P}/g/{min(k, gfx_last):05d}.png"
        gfx = cv2.imread(gp, cv2.IMREAD_UNCHANGED) if os.path.exists(gp) else None
        # câmera do plano + desfoque de movimento (obturador de 180°)
        s1, x1, y1 = cam(sh, t); s0, x0, y0 = cam(sh, max(sh["start"], t - .5 / FPS))
        disp = abs(x1 - x0) + abs(y1 - y0) + abs(s1 - s0) * 1100
        if disp < 2.5: out = compose(src, F, gfx, mat(s1, x1, y1), W, H, bgf)
        else:
            n = int(min(12, disp / 3 + 2)); acc = np.zeros((H, W, 3), np.float32)
            for j in range(n):
                a = j / (n - 1)
                acc += compose(src, F, gfx, mat(s0 + (s1 - s0) * a, x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), W, H, bgf)
            out = (acc / n).astype(np.uint8)
        enc.stdin.write(np.ascontiguousarray(out).tobytes())
    enc.stdin.close(); enc.wait()

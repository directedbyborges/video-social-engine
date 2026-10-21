import os, json, subprocess, glob, hashlib, numpy as np, cv2
CACHE = os.environ.get("VSE_MODELS", os.path.expanduser("~/.cache/vse"))

def frames_dir(mov):
    """Extrai os quadros RGBA de um .mov com alfa (transição da marca) para o cache."""
    h = hashlib.md5((mov + str(os.path.getmtime(mov))).encode()).hexdigest()[:10]
    d = f"{CACHE}/mov_{h}"
    if not os.path.exists(d + "/001.png"):
        os.makedirs(d, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mov, "-pix_fmt", "rgba", d + "/%03d.png"], check=True)
    return d

def mov_cover(mov):
    """Quando a transição cobre a tela inteira e quando começa a sair."""
    d = frames_dir(mov); fs = sorted(glob.glob(d + "/*.png"))
    fps = eval(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", mov], capture_output=True, text=True).stdout.strip())
    cov = [float((cv2.imread(f, cv2.IMREAD_UNCHANGED)[::8, ::8, 3] > 250).mean()) for f in fs]
    full = [i for i, c in enumerate(cov) if c > .995]
    fs_, fe = (full[0], full[-1]) if full else (int(np.argmax(cov)), int(np.argmax(cov)))
    return {"fps": fps, "n": len(fs), "full_start": fs_ / fps, "exit_start": (fe + 1) / fps, "dir": d}

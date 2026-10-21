# Tratamento de cor aplicado na decodificação do vídeo (ffmpeg -vf).
#   preset: natural | punchy | warm | cool | cine | none   ou dict com chaves abaixo
# Chaves: contrast, saturation, gamma, shadows (levanta sombras 0..0.1), highlights (segura altas 0..0.06),
#         wb (0..1, força do balanço de branco automático), temp (+ quente / - frio, -1..1), extra (filtro ffmpeg cru)
import subprocess, numpy as np
PRESETS = {
    "natural": dict(contrast=1.06, saturation=1.10, gamma=1.0, shadows=.035, highlights=.02, wb=.6, temp=0),
    "punchy":  dict(contrast=1.12, saturation=1.18, gamma=.98, shadows=.02, highlights=.03, wb=.6, temp=0),
    "warm":    dict(contrast=1.07, saturation=1.12, gamma=1.0, shadows=.035, highlights=.02, wb=.5, temp=.35),
    "cool":    dict(contrast=1.07, saturation=1.06, gamma=1.0, shadows=.03, highlights=.02, wb=.5, temp=-.3),
    "cine":    dict(contrast=1.10, saturation=1.04, gamma=1.0, shadows=.04, highlights=.04, wb=.5, temp=0,
                    extra="colorbalance=rs=-.04:gs=-.01:bs=.05:rh=.05:gh=.01:bh=-.04"),
    "none":    None,
}

def measure_wb(src, n=6):
    """Média de cinza (gray world) em alguns quadros, só nos tons médios pouco saturados."""
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
    acc = []
    for i in range(n):
        t = dur * (i + .5) / n
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", src, "-frames:v", "1", "-vf", "scale=270:-2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        if not raw: continue
        a = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(float)
        mx, mn = a.max(1), a.min(1); lum = a.mean(1)
        sel = (lum > 60) & (lum < 200) & ((mx - mn) < 40)
        if sel.sum() > 200: acc.append(a[sel].mean(0))
    if not acc: return (1, 1, 1)
    r, g, b = np.mean(acc, 0)
    return (g / r, 1.0, g / b)

def vf(src, preset="natural"):
    p = PRESETS.get(preset, preset) if isinstance(preset, str) else preset
    if not p: return None
    f = []
    if p.get("wb", 0) > 0:
        gr, _, gb = measure_wb(src); k = p["wb"]
        gr, gb = 1 + (gr - 1) * k, 1 + (gb - 1) * k
        t = p.get("temp", 0)
        gr *= 1 + .06 * t; gb *= 1 - .06 * t
        f.append(f"colorchannelmixer=rr={gr:.4f}:gg=1:bb={gb:.4f}")
    elif p.get("temp"):
        t = p["temp"]; f.append(f"colorchannelmixer=rr={1 + .06 * t:.4f}:gg=1:bb={1 - .06 * t:.4f}")
    s, h = p.get("shadows", 0), p.get("highlights", 0)
    if s or h: f.append(f"curves=all='0/{s:.3f} 0.25/{.25 + s * .6:.3f} 0.5/0.5 0.8/{.8 - h * .4:.3f} 1/{1 - h:.3f}'")
    f.append(f"eq=contrast={p.get('contrast', 1):.3f}:saturation={p.get('saturation', 1):.3f}:gamma={p.get('gamma', 1):.3f}")
    if p.get("extra"): f.append(p["extra"])
    return ",".join(f)

if __name__ == "__main__":
    import sys; print(vf(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "natural"))

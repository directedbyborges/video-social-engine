# Análise da identidade visual a partir do logo (e de outras peças da marca).
#   python3 engine/brand.py <logo.png|svg> [peça2.png ...] --out <pasta>
# Gera: palette.json, icon.png (só o símbolo, se o logo tiver símbolo + texto), board.png (logo, paleta,
# métricas de traço e ícones de várias famílias na cor da marca para comparar estilo com o símbolo).
import sys, os, json, subprocess, base64, re, numpy as np, cv2
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT + "/engine")
import icons

def load(path, out):
    if path.lower().endswith(".svg"):
        png = out + "/_logo_raster.png"
        svg = open(path).read()
        hp = out + "/_svg.html"
        open(hp, "w").write(f'<html><body style="margin:0;background:transparent"><div style="width:1400px">{svg.replace("<svg", "<svg width=1400", 1)}</div></body></html>')
        subprocess.run(["node", ROOT + "/web/shot.js", hp, png], check=True)
        path = png
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im.shape[2] == 3: im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
    return im

def palette(imgs, k=6):
    px = []
    for im in imgs:
        a = im[:, :, 3] > 200
        p = im[:, :, :3][a].reshape(-1, 3)
        if len(p) > 60000: p = p[np.random.default_rng(0).choice(len(p), 60000, replace=False)]
        px.append(p)
    px = np.concatenate(px).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, .5)
    _, lab, cen = cv2.kmeans(px, min(k, len(px)), None, crit, 3, cv2.KMEANS_PP_CENTERS)
    share = np.bincount(lab.ravel(), minlength=len(cen)) / len(lab)
    cols = sorted([("#%02x%02x%02x" % tuple(int(c) for c in cen[i][::-1]), float(share[i])) for i in range(len(cen))], key=lambda x: -x[1])
    return [{"hex": h, "share": round(s, 3)} for h, s in cols if s > .02]

def ink_mask(im):
    a = im[:, :, 3]
    if (a < 250).mean() > .05: return (a > 128).astype(np.uint8)
    g = cv2.cvtColor(im[:, :, :3], cv2.COLOR_BGR2GRAY)
    bgv = np.median(np.concatenate([g[0], g[-1], g[:, 0], g[:, -1]]))
    return (np.abs(g.astype(int) - bgv) > 40).astype(np.uint8)

def split_symbol(m):
    # separa símbolo e texto pelo maior vão vertical (logo horizontal) ou horizontal (logo empilhado)
    ys, xs = np.where(m)
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    best = None
    for axis in (0, 1):
        prof = m.sum(axis=axis) > 0
        gaps, s = [], None
        for i, v in enumerate(prof):
            if not v and s is None: s = i
            if v and s is not None: gaps.append((i - s, s, i)); s = None
        if gaps:
            g = max(gaps)
            if g[0] > .03 * len(prof) and (best is None or g[0] / len(prof) > best[0]): best = (g[0] / len(prof), axis, g[1], g[2])
    return best, (ys.min(), ys.max(), xs.min(), xs.max())

def stroke_metrics(m):
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 3)
    loc = (dt == cv2.dilate(dt, np.ones((3, 3)))) & (dt > 1)
    th = float(np.median(dt[loc]) * 2) if loc.any() else 0
    ys, xs = np.where(m); h = ys.max() - ys.min() + 1; w = xs.max() - xs.min() + 1
    fill = float(m.sum() / (h * w))
    return {"stroke_px": round(th, 1), "stroke_rel_height": round(th / h, 4), "fill_ratio": round(fill, 3),
            "style_guess": "linha (outline)" if fill < .35 and th / h < .12 else "preenchido/sólido"}

def main(paths, out):
    os.makedirs(out, exist_ok=True)
    ims = [load(p, out) for p in paths]
    logo = ims[0]; m = ink_mask(logo)
    sp, (y0, y1, x0, x1) = split_symbol(m)
    sym = logo[y0:y1 + 1, x0:x1 + 1]; symm = m[y0:y1 + 1, x0:x1 + 1]
    if sp:
        _, axis, g0, g1 = sp
        # símbolo = parte com maior proporção de altura/área compacta (normalmente à esquerda/em cima)
        parts = [(sym[:, :g0], symm[:, :g0]), (sym[:, g1:], symm[:, g1:])] if axis == 0 else [(sym[:g0], symm[:g0]), (sym[g1:], symm[g1:])]
        def score(pm):
            ys, xs = np.where(pm[1])
            if not len(ys): return 0
            h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
            return min(h, w) / max(h, w)
        sym, symm = max(parts, key=score)
        ys, xs = np.where(symm); sym = sym[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; symm = symm[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    cv2.imwrite(out + "/icon.png", sym)
    met = stroke_metrics(symm)
    pal = palette(ims)
    tabler_w = round(min(3, max(1, met["stroke_rel_height"] * 24 * 1.15)), 2)
    info = {"palette": pal, "symbol": met, "suggested_tabler_stroke": tabler_w, "has_separate_symbol": bool(sp)}
    json.dump(info, open(out + "/palette.json", "w"), indent=1)
    # board
    c1 = next((p["hex"] for p in pal if not re.match(r"#(f[0-9a-f]){3}|#(0[0-9a-f]){3}", p["hex"])), pal[0]["hex"])
    b64 = lambda im: base64.b64encode(cv2.imencode(".png", im)[1]).decode()
    lum = lambda h: (0.2126 * int(h[1:3], 16) + 0.7152 * int(h[3:5], 16) + 0.0722 * int(h[5:7], 16)) / 255
    icon_bg = "#f2f2f2" if lum(c1) < .45 else "#0d0d0d"
    sw = "".join(f'<div style="display:inline-block;margin:6px;text-align:center"><div style="width:90px;height:90px;border-radius:12px;background:{p["hex"]};border:1px solid #888"></div>{p["hex"]}<br>{int(p["share"]*100)}%</div>' for p in pal)
    sample = ["check", "lock", "user", "chart-bar", "bolt", "shield-check", "clock", "trending-up"]
    fams = [("tabler", lambda n: f"tabler:{n}"), ("phosphor-thin", None), ("phosphor-light", None), ("phosphor-regular", None),
            ("phosphor-bold", None), ("phosphor-fill", None), ("phosphor-duotone", None), ("lucide", lambda n: f"lucide:{n}")]
    ph = {"check": "check", "lock": "lock", "user": "user", "chart-bar": "chart-bar", "bolt": "lightning", "shield-check": "shield-check", "clock": "clock", "trending-up": "trend-up"}
    luc = {"chart-bar": "chart-column", "bolt": "zap", "trending-up": "trending-up"}
    rows = ""
    for fam, _ in fams:
        cells = ""
        for n in sample:
            ref = f"{fam}:{ph[n]}" if fam.startswith("phosphor") else (f"lucide:{luc.get(n, n)}" if fam == "lucide" else f"tabler:{n}")
            try:
                s = open(icons.path_of(ref)).read()
                if fam == "tabler": s = re.sub(r'stroke-width="[^"]*"', f'stroke-width="{tabler_w}"', s)
                s = re.sub(r'(width|height)="[^"]*"', '', s, count=2).replace("<svg", '<svg width="64" height="64"', 1)
            except Exception: s = ""
            cells += f'<div style="width:84px;display:inline-block;text-align:center;color:{c1}">{s}</div>'
        rows += f'<div style="margin:6px 0"><span style="display:inline-block;width:170px">{fam}{" (traço " + str(tabler_w) + ")" if fam == "tabler" else ""}</span>{cells}</div>'
    page = f"""<html><body style="margin:0;background:#141414;color:#ddd;font:14px sans-serif;padding:20px;width:1560px">
    <div style="display:flex;gap:30px;align-items:center">
      <div style="background:#fff;padding:20px;border-radius:12px"><img src="data:image/png;base64,{b64(logo)}" style="max-width:520px;max-height:200px"></div>
      <div style="background:#2a2a2a;padding:20px;border-radius:12px"><img src="data:image/png;base64,{b64(sym)}" style="max-width:200px;max-height:200px"></div>
      <div>{sw}</div></div>
    <p>Símbolo: traço ≈ {met['stroke_px']}px ({met['stroke_rel_height']*100:.1f}% da altura) · preenchimento {met['fill_ratio']} · palpite: {met['style_guess']}</p>
    <div style="background:{icon_bg};padding:14px;border-radius:12px;color:#888">{rows}</div></body></html>"""
    hp = out + "/board.html"; open(hp, "w").write(page)
    subprocess.run(["node", ROOT + "/web/shot.js", hp, out + "/board.png"], check=True)
    print(json.dumps(info, indent=1)); print("board:", out + "/board.png")

if __name__ == "__main__":
    a = sys.argv[1:]; out = a[a.index("--out") + 1] if "--out" in a else "brand_out"
    paths = [x for i, x in enumerate(a) if x != "--out" and (i == 0 or a[i - 1] != "--out")]
    main(paths, out)

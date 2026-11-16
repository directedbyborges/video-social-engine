# python3 tools/peek_sheet.py <proj> [frac] -> <proj>/peek/folha.jpg: quadro de cada tomada (b-roll + gráfico do peek.js), com a faixa útil marcada
import sys, os, json, numpy as np, cv2
P = os.path.abspath(sys.argv[1]); frac = float(sys.argv[2]) if len(sys.argv) > 2 else .62
TL = json.load(open(P + "/timeline.json")); W, H = 1080, 1920
def broll(s, t):
    b = s["broll"]; f = b["file"]
    if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")): fr = cv2.imread(f)
    else:
        cap = cv2.VideoCapture(f); cap.set(cv2.CAP_PROP_POS_MSEC, (b.get("ss", 0) + (t - s["start"]) * b.get("speed", 1)) * 1000); ok, fr = cap.read()
    h, w = fr.shape[:2]; u = (t - s["start"]) / max(.1, s["end"] - s["start"])
    sc = max(W / w, H / h) * b.get("scale", 1.2) * (1 + b.get("push", .05) * u); fx, fy = b.get("focus", [.5, .5])
    tx = min(0, max(W - w * sc, W / 2 - fx * w * sc)); ty = min(0, max(H - h * sc, H / 2 - fy * h * sc))
    out = cv2.warpAffine(fr, np.float32([[sc, 0, tx], [0, sc, ty]]), (W, H), borderMode=cv2.BORDER_REFLECT_101)
    if b.get("dim"): out = (out * (1 - b["dim"])).astype(np.uint8)
    return out
tiles = []
for i, s in enumerate(TL["shots"]):
    t = s["start"] + (s["end"] - s["start"]) * frac
    c = TL["cam"][min(len(TL["cam"]) - 1, round(t * 30))]
    fr = broll(s, t) if s.get("broll") else np.full((H, W, 3), 128, np.uint8)
    if s.get("broll"):
        s0 = max(1.0, c[0]); M = np.float32([[s0, 0, W / 2 - W / 2 * s0 + c[1]], [0, s0, H / 2 - H / 2 * s0 + c[2]]]); fr = cv2.warpAffine(fr, M, (W, H), borderMode=cv2.BORDER_REFLECT_101)
    g = cv2.imread(f"{P}/peek/{i + 1:02d}.png", cv2.IMREAD_UNCHANGED)
    if g is not None and (g.ndim == 2 or g.shape[2] == 3): fr = g if g.ndim == 3 else cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
    elif g is not None:
        a = g[:, :, 3:4].astype(np.float32) / 255; fr = (g[:, :, :3] * a + fr * (1 - a)).astype(np.uint8)
    for y in (540, 1300): cv2.line(fr, (0, y), (W, y), (0, 0, 255), 3)
    for x in (108, 972): cv2.line(fr, (x, 0), (x, H), (0, 200, 0), 3)
    cv2.putText(fr, str(i + 1), (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 255, 255), 6)
    tiles.append(cv2.resize(fr, (270, 480), interpolation=cv2.INTER_AREA))
cols = 8; rows = (len(tiles) + cols - 1) // cols
sheet = np.full((rows * 486, cols * 276, 3), 30, np.uint8)
for i, tt in enumerate(tiles): r, cc = divmod(i, cols); sheet[r * 486:r * 486 + 480, cc * 276:cc * 276 + 270] = tt
cv2.imwrite(P + "/peek/folha.jpg", sheet, [cv2.IMWRITE_JPEG_QUALITY, 85]); print(P + "/peek/folha.jpg")

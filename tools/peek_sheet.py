# python3 tools/peek_sheet.py <proj> [cols]  -> <proj>/peek/sheet.jpg: gráfico de cada plano sobre o b-roll (quadro do meio), com o nº do plano
import sys, os, json, numpy as np, cv2
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../engine"))
import shots as SH
P = os.path.abspath(sys.argv[1]); cols = int(sys.argv[2]) if len(sys.argv) > 2 else 7
TL = json.load(open(P + "/timeline.json")); B = json.load(open(TL["brandFile"]))
bg = B["colors"]["bg"].lstrip("#"); BG = [int(bg[4:6], 16), int(bg[2:4], 16), int(bg[0:2], 16)]
ims = []
for n, t in json.load(open(P + "/peek/times.json")):
    sh = TL["shots"][n - 1]; b = sh.get("broll")
    src, F = SH.Broll(P, b, 1080, 1920).frame(sh, t) if b and b.get("file") else (None, None)
    fr = SH.compose(src, F, cv2.imread(f"{P}/peek/g{n:02d}.png", cv2.IMREAD_UNCHANGED), np.eye(3, dtype=np.float32), 1080, 1920, np.full((1920, 1080, 3), BG, np.uint8))
    for y in (540, 1300): cv2.line(fr, (0, y), (1080, y), (0, 200, 255), 2)
    for x in (108, 972): cv2.line(fr, (x, 0), (x, 1920), (0, 200, 255), 1)
    fr = cv2.resize(fr, (270, 480)); cv2.rectangle(fr, (0, 0), (46, 28), (0, 0, 0), -1)
    cv2.putText(fr, f"{n:02d}", (4, 21), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 2); ims.append(fr)
while len(ims) % cols: ims.append(np.zeros_like(ims[0]))
rows = [np.hstack(ims[i:i + cols]) for i in range(0, len(ims), cols)]
cv2.imwrite(P + "/peek/sheet.jpg", np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82]); print(P + "/peek/sheet.jpg")

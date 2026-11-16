# python3 engine/composite.py <proj> [inicio fim nome]
# Junta: vídeo tratado (cor) + cortes/zoom/ênfase + tela dividida + b-roll + texto atrás da pessoa + gráficos +
#        flashes + transição da marca + card final; áudio: fala (até o fim do take) + efeitos + trilha.
import sys, os, json, subprocess, glob, numpy as np, cv2
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT + "/engine")
import grade
from util import frames_dir

P = os.path.abspath(sys.argv[1]); TL = json.load(open(P + "/timeline.json"))
FPS, W, H = 30, 1080, 1920
ENTER, EXIT = .6, .45
E = TL["end"]; total = TL["total"]; END = E["end"]
t0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
t1 = float(sys.argv[3]) if len(sys.argv) > 3 else END
name = sys.argv[4] if len(sys.argv) > 4 else ("final" if len(sys.argv) <= 2 else "preview")
B = json.load(open(TL["brandFile"]))
bgc = B["colors"].get("bg", B["colors"].get("c2", "#000000")).lstrip("#")
BG = [int(bgc[4:6], 16), int(bgc[2:4], 16), int(bgc[0:2], 16)]
Z = TL["zoom"]

def ease_out(x): return 1 - (1 - x) ** 3
def ease_in(x): return x ** 3
def split_p(t):
    for s in TL["panels"]:
        if s["mode"] != "split": continue
        if s["start"] - 1e-6 <= t < s["end"]:
            if s["start"] > .01 and t < s["start"] + ENTER: return ease_out((t - s["start"]) / ENTER)
            if t > s["end"] - EXIT: return 1 - ease_in((t - (s["end"] - EXIT)) / EXIT)
            return 1.0
    return 0.0
def cut_at(t):
    for i, c in enumerate(TL["cuts"]):
        if t < c["o"] + (c["b"] - c["a"]) - 1e-6: return i, c
    return len(TL["cuts"]) - 1, TL["cuts"][-1]
def emph(t):
    z = 1.0
    for e in TL["emphasis"]:
        d = e["dur"]; u = (t - e["at"]) / d
        if 0 <= u <= 1:
            a = min(1, u / .32); r = min(1, (1 - u) / .36)   # entra suave, segura, volta
            k = (1 - np.cos(np.pi * min(a, r))) / 2
            z *= 1 + e["amount"] * k
    return z
def transform(t):
    ci, c = cut_at(min(t, total - 1e-3))
    seg = c["b"] - c["a"]; u = min(1, max(0, (t - c["o"]) / max(seg, .01)))
    z = (Z["jump"][ci % len(Z["jump"])] + .03 * u) * emph(t)
    ay = Z["anchor_y"]
    fs, ftx, fty = z, 540 - 540 * z, ay - ay * z
    p = split_p(t)
    return fs + (1.0 - fs) * p, ftx * (1 - p), fty + (Z["split_ty"] - fty) * p, c

# ---------- leitores ----------
HAS_VIDEO = bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=index", "-of", "csv=p=0", TL["src"]], capture_output=True, text=True).stdout.strip())
# vídeo narrado (src = só áudio da narração): o fundo é a cor da marca; o visual vem de painéis em tela cheia e b-roll
VF = grade.vf(TL["src"], TL["grade"]) if HAS_VIDEO else None
print("cor:", VF)
dec = None if not HAS_VIDEO else subprocess.Popen(["ffmpeg", "-v", "error", "-i", TL["src"]] + (["-vf", VF] if VF else []) + ["-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE, bufsize=W * H * 3 * 4)
cur_idx, cur = -1, None
def src_frame(idx):
    global cur_idx, cur
    if dec is None: return np.full((H, W, 3), BG, np.uint8)
    while cur_idx < idx:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        cur = np.frombuffer(buf, np.uint8).reshape(H, W, 3); cur_idx += 1
    return cur
broll_caps = {}
def broll_frame(b, t):
    key = b["file"]
    if key not in broll_caps:
        cap = cv2.VideoCapture(b["file"]); cap.set(cv2.CAP_PROP_POS_MSEC, b.get("ss", 0) * 1000); broll_caps[key] = [cap, None, -1]
    st = broll_caps[key]; fps = st[0].get(cv2.CAP_PROP_FPS) or 30
    want = int((t - b["start"]) * fps)
    while st[2] < want:
        ok, fr = st[0].read()
        if not ok: break
        st[1] = fr; st[2] += 1
    fr = st[1]; h, w = fr.shape[:2]
    u = (t - b["start"]) / max(.1, b["end"] - b["start"]); z = 1 + b.get("zoom", .06) * u
    s = max(W / w, H / h) * z
    M = np.float32([[s, 0, W / 2 - w * s / 2], [0, s, H / 2 - h * s / 2]])
    out = cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR)
    if VF: pass
    return out
tf_cap, tf_idx, tf_frame = (cv2.VideoCapture(E["card"]), -1, None) if E.get("card") else (None, -1, None)
TR = sorted(glob.glob(frames_dir(E["trans"]) + "/*.png")) if E.get("trans") else []
tr_cache = {}
matter = None
if TL["behind"]:
    from matte import Matter
    matter = Matter()
def blend(bg, rgba):
    if rgba is None: return bg
    if rgba.ndim == 2 or rgba.shape[2] == 3: return rgba if rgba.ndim == 3 else cv2.cvtColor(rgba, cv2.COLOR_GRAY2BGR)  # quadro opaco
    a = rgba[:, :, 3:4].astype(np.uint16)
    if a.max() == 0: return bg
    return ((rgba[:, :, :3].astype(np.uint16) * a + bg.astype(np.uint16) * (255 - a) + 127) // 255).astype(np.uint8)
def in_ranges(t, rr): return any(a <= t < b for a, b in rr)
gfx_last = int(TL["gfxEnd"] * FPS) - 1
def flash(frame, t):
    for f in TL["flashes"]:
        u = (t - f["at"]) / f["dur"]
        if -.5 <= u <= 1:
            k = max(0, 1 - abs(u) * (2 if u < 0 else 1))
            if f["type"] == "flash": frame = cv2.addWeighted(frame, 1 - .85 * k, np.full_like(frame, 255), .85 * k, 0)
            elif f["type"] == "invert" and k > .35:
                inv = 255 - frame; g = cv2.cvtColor(cv2.cvtColor(inv, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
                frame = cv2.addWeighted(inv, .5, g, .5, 0)
            elif f["type"] == "leak":
                c1 = B["colors"]["c1"].lstrip("#"); col = np.array([int(c1[4:6], 16), int(c1[2:4], 16), int(c1[0:2], 16)], np.float32)
                yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
                grad = (1 - yy) * k
                frame = np.clip(frame.astype(np.float32) * (1 - .5 * grad) + col * grad * 1.1 + 60 * grad, 0, 255).astype(np.uint8)
    return frame

# ---------- modo narrado por tomadas: b-roll por tomada (vídeo ou foto) + mesma câmera do layer gráfico ----------
SHOTS = TL.get("shots")
shot_src = {}
def shot_at(t):
    for s in SHOTS:
        if s["start"] <= t < s["end"]: return s
    return SHOTS[-1]
def shot_broll(s, t):
    b = s["broll"]; key = (b["file"], s["start"])
    if key not in shot_src:
        if b["file"].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            im = cv2.imread(b["file"], cv2.IMREAD_COLOR); shot_src[key] = {"img": im}
        else:
            cap = cv2.VideoCapture(b["file"]); cap.set(cv2.CAP_PROP_POS_MSEC, b.get("ss", 0) * 1000)
            shot_src[key] = {"cap": cap, "fr": None, "n": -1, "fps": cap.get(cv2.CAP_PROP_FPS) or 30}
    st = shot_src[key]
    if "img" in st: fr = st["img"]
    else:
        want = int((t - s["start"]) * st["fps"] * b.get("speed", 1))
        while st["n"] < want:
            ok, f = st["cap"].read()
            if not ok: break
            st["fr"], st["n"] = f, st["n"] + 1
        fr = st["fr"]
    h, w = fr.shape[:2]
    u = (t - s["start"]) / max(.1, s["end"] - s["start"])
    sc = max(W / w, H / h) * b.get("scale", 1.2) * (1 + b.get("push", .05) * u)
    fx, fy = b.get("focus", [.5, .5])
    tx = min(0, max(W - w * sc, W / 2 - fx * w * sc)); ty = min(0, max(H - h * sc, H / 2 - fy * h * sc))
    out = cv2.warpAffine(fr, np.float32([[sc, 0, tx], [0, sc, ty]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
    if b.get("dim"): out = (out.astype(np.float32) * (1 - b["dim"])).astype(np.uint8)
    return out
def light_grade(fr):
    """Tratamento único para clipes de origens diferentes: contraste +6%, saturação +10%."""
    f = fr.astype(np.float32); f = (f - 128) * 1.06 + 128
    g = f.mean(axis=2, keepdims=True); f = g + (f - g) * 1.10
    return np.clip(f, 0, 255).astype(np.uint8)
def cam_warp(fr, c):
    s, x, y = c
    M = np.float32([[s, 0, W / 2 - W / 2 * s + x], [0, s, H / 2 - H / 2 * s + y]])
    return cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
def motion_blur(fr, c0, c1):
    """Desfoque de movimento perto do corte, a partir da velocidade da câmera (pan = linear, zoom = radial)."""
    dx, dy = c1[1] - c0[1], c1[2] - c0[2]; ds = c1[0] / max(1e-6, c0[0])
    v = max(abs(dx), abs(dy))
    if v > 3:
        n = int(min(90, v * .9)) | 1; k = np.zeros((n, n), np.float32)
        if abs(dx) >= abs(dy): k[n // 2, :] = 1
        else: k[:, n // 2] = 1
        fr = cv2.filter2D(fr, -1, k / n)
    if abs(np.log(ds)) > .004:
        acc = fr.astype(np.float32); m = 5
        for i in range(1, m):
            z = ds ** (-.9 * i / m)
            M = np.float32([[z, 0, W / 2 - W / 2 * z], [0, z, H / 2 - H / 2 * z]])
            acc += cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
        fr = (acc / m).astype(np.uint8)
    return fr

out_v = f"{P}/{name}_video.mp4"
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", out_v], stdin=subprocess.PIPE)
in_behind_prev = False
for k in range(int(round(t0 * FPS)), int(round(t1 * FPS))):
    t = k / FPS
    if SHOTS:
        cams = TL["cam"]; c1 = cams[min(k, len(cams) - 1)]; c0 = cams[max(0, min(k - 1, len(cams) - 1))]
        sh = shot_at(t)
        # o b-roll acompanha pan e zoom para dentro, mas nunca encolhe abaixo da tela (zoom para fora só no layer gráfico)
        frame = cam_warp(light_grade(shot_broll(sh, t)), [max(1.0, c1[0])] + c1[1:]) if sh.get("broll") else np.full((H, W, 3), BG, np.uint8)
        gp = f"{P}/g/{min(k, gfx_last):05d}.png"
        if os.path.exists(gp): frame = blend(frame, cv2.imread(gp, cv2.IMREAD_UNCHANGED))
        frame = motion_blur(frame, c0, c1)
        enc.stdin.write(np.ascontiguousarray(frame).tobytes())
        continue
    if tf_cap is not None and t >= E["card_start"]:
        want = int((t - E["card_start"]) * 30)
        while tf_idx < want:
            ok, fr = tf_cap.read()
            if not ok: break
            tf_frame, tf_idx = fr, tf_idx + 1
        frame = tf_frame.copy()
    else:
        s, tx, ty, c = transform(min(t, total - 1 / FPS))
        st = c["a"] + (t - c["o"])   # depois do fim a fala continua rolando por baixo da transição
        src = src_frame(int(round(st * 30)))
        frame = cv2.warpAffine(src, np.float32([[s, 0, tx], [0, s, ty]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=BG)
        br = [b for b in TL["broll"] if b["start"] <= t < b["end"]]
        if br: frame = broll_frame(br[0], t)
        if matter is not None:
            ib = in_ranges(t, TL["behind"])
            if ib:
                if not in_behind_prev: matter.reset(); [matter(frame) for _ in range(3)]
                gbp = f"{P}/gb/{k:05d}.png"
                if os.path.exists(gbp):
                    a = matter(frame)[:, :, None]
                    behind = blend(frame, cv2.imread(gbp, cv2.IMREAD_UNCHANGED))
                    frame = (frame.astype(np.float32) * a + behind.astype(np.float32) * (1 - a)).astype(np.uint8)
            in_behind_prev = ib
    gp = f"{P}/g/{min(k, gfx_last):05d}.png"
    if os.path.exists(gp) and (t < TL["gfxEnd"] or E.get("card") is None or t < E["card_start"]):
        frame = blend(frame, cv2.imread(gp, cv2.IMREAD_UNCHANGED))
    if TR and t >= E["trans_start"]:
        ti = int((t - E["trans_start"]) * E["trans_fps"])
        if ti < len(TR):
            if ti not in tr_cache: tr_cache = {ti: cv2.imread(TR[ti], cv2.IMREAD_UNCHANGED)}
            frame = blend(frame, tr_cache[ti])
    frame = flash(frame, t)
    enc.stdin.write(np.ascontiguousarray(frame).tobytes())
enc.stdin.close(); enc.wait()
if dec: dec.kill()

# ---------- áudio ----------
cat = json.load(open(ROOT + "/sfx/sfx.json"))
SFXD = ROOT + "/sfx"
ev = json.load(open(P + "/sfx_events.json")) if os.path.exists(P + "/sfx_events.json") else []
for f in TL["flashes"]: ev.append(["flash", f["at"]])
for b in TL["broll"]: ev.append(["scene_cut", b["start"]])
ev = [e for e in ev if not (SHOTS and e[0] == "scene_cut" and e[1] < .05)]
if E.get("trans"): ev.append(["end_transition", E["trans_start"] + .1])
if TL.get("music") and TL["music"].get("pivot") is not None: ev.append(["music_turn", TL["music"]["pivot"]])
SP = TL.get("sfx") or {}
for x in SP.get("extra", []): ev.append([x[0], x[1]] + x[2:])
mute = set(SP.get("mute", []))
ev = sorted([e for e in ev if e[0] not in mute], key=lambda e: e[1])
rot, chosen, last_t = {}, [], -9
for e in ev:
    nm, t = e[0], e[1]
    if SP.get("auto", True) is False and len(e) < 3 and nm in cat["events"]: continue
    opts = [nm] if nm in cat["files"] else cat["events"].get(nm, [])
    if not opts or t < 0 or t > END: continue
    if t - last_t < .18: continue
    f = opts[rot.get(nm, 0) % len(opts)]; rot[nm] = rot.get(nm, 0) + 1
    meta = cat["files"][f]; start = max(0, t - meta["hit"])
    ln = None
    if meta.get("trim_to_event") and len(e) > 2: ln = max(.3, e[2] - t)
    if meta.get("max_len"): ln = min(ln or 99, meta["max_len"])
    chosen.append((f, start, meta["gain"] + SP.get("gain", -3), ln, max(0, meta["hit"] - t)))
    last_t = t
print("efeitos:", len(chosen))
parts, inputs = [], ["-i", TL["src"]]
for i, c in enumerate(TL["cuts"]):
    if c.get("sil"):   # silêncio inserido (cut.hold)
        parts.append(f"[0:a]atrim=0:{c['sil']:.3f},asetpts=PTS-STARTPTS,volume=0[v{i}]"); continue
    d = c["b"] - c["a"]
    parts.append(f"[0:a]atrim={c['a']:.3f}:{c['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d - .015:.3f}:d=0.015[v{i}]")
n = len(TL["cuts"])
if TL.get("tailAudio", True) and TL["srcDur"] - TL["cuts"][-1]["b"] > .05:
    ta = TL["cuts"][-1]["b"]
    parts.append(f"[0:a]atrim={ta:.3f}:{TL['srcDur']:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0, TL['srcDur'] - ta - .12):.3f}:d=0.12[v{n}]"); n += 1
parts.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1,aresample=48000,apad,atrim=0:{END:.3f},acompressor=threshold=0.25:ratio=3:attack=10:release=150,loudnorm=I=-16:TP=-3:LRA=9,aresample=48000[voice]")
mixl = ["[voice]"]
for j, (f, start, gain, ln, skip) in enumerate(chosen):
    inputs += ["-i", f"{SFXD}/{f}.mp3"]; idx = inputs.count("-i") - 1
    tr = f"atrim={skip:.3f}" + (f":{skip + ln:.3f}" if ln else "") + ",asetpts=PTS-STARTPTS,"
    fade = f"afade=t=out:st={max(0, ln - .15):.3f}:d=0.15," if ln else ""
    parts.append(f"[{idx}:a]aresample=48000,{tr}{fade}volume={gain}dB,adelay={int(start * 1000)}:all=1[s{j}]"); mixl.append(f"[s{j}]")
M = TL.get("music")
if M:
    # trilha em dois atos: "intro" (dor/desejo) até a virada, "main" (empresa/solução) depois, com crossfade suave.
    # Uma faixa só: antes da virada ela vem abafada (passa-baixa) e abre na virada.
    pv = M["pivot"] if M.get("pivot") is not None else END * .4
    xf = M.get("xfade", 1.6); gi, gm = M.get("gains", [-20, -20])
    def track(path, lab, extra=""):
        inputs.extend(["-stream_loop", "-1"] + (["-ss", f"{M['ss']:.3f}"] if M.get("ss") else []) + ["-i", path]); ix = inputs.count("-i") - 1
        parts.append(f"[{ix}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{END + 2:.3f},asetpts=PTS-STARTPTS{extra}[{lab}]")
    if M.get("single"):
        track(M["single"], "m0", f",volume={gi}dB"); parts.append("[m0]asplit=2[ma][mb]")
        parts.append(f"[ma]lowpass=f=1300,volume=-3dB,afade=t=out:st={pv - xf / 2:.3f}:d={xf:.3f}[mi]")
        parts.append(f"[mb]afade=t=in:st={pv - xf / 2:.3f}:d={xf:.3f}[mm]")
    else:
        track(M["intro"], "mi", f",volume={gi}dB,afade=t=in:d=0.4,afade=t=out:st={pv - xf / 2:.3f}:d={xf:.3f}")
        track(M["main"], "m1", f",volume={gm}dB")
        parts.append(f"[m1]afade=t=in:d={xf:.3f},adelay={int(max(0, pv - xf / 2) * 1000)}:all=1[mm]")
    parts.append(f"[mi][mm]amix=inputs=2:normalize=0,atrim=0:{END:.3f},afade=t=out:st={END - 1.5:.3f}:d=1.5[mus]")
    parts.append("[voice]asplit=2[vmain][vsc]")
    parts.append("[mus][vsc]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=350:makeup=1[musd]")
    mixl[0] = "[vmain]"; mixl.append("[musd]")
parts.append("".join(mixl) + f"amix=inputs={len(mixl)}:normalize=0:dropout_transition=0,atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,loudnorm=I=-14:TP=-2.5:LRA=9,aresample=48000,alimiter=limit=0.75:level=false[aout]")
fc = ";".join(parts)
open(P + "/_filter.txt", "w").write(fc)
final = f"{P}/{name}.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-i", out_v, "-filter_complex_script", P + "/_filter.txt",
                "-map", f"{inputs.count('-i')}:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final], check=True)
print("ok:", final, f"{t1 - t0:.2f}s")

# python3 engine/build.py <pasta_do_projeto>
# Lê <proj>/spec.py (SPEC) + transcrição e gera <proj>/timeline.json (tudo em tempo de SAÍDA).
import sys, os, json, re, difflib, glob, importlib.util, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT + "/engine")
from util import mov_cover
import music

def norm(w): return re.sub(r"[^\wÀ-ú]", "", w.lower())

def load_spec(P):
    spec = importlib.util.spec_from_file_location("spec", P + "/spec.py"); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    S = m.SPEC
    for k in ("src", "brand", "transcript"):
        if k in S and S[k] and not os.path.isabs(S[k]): S[k] = os.path.normpath(os.path.join(P, S[k]))
    return S

def fix_runs(words):
    i = 0
    while i < len(words):
        j = i
        while j + 1 < len(words) and words[j + 1]["s"] - words[i]["s"] < .06 * (j + 1 - i): j += 1
        if j - i >= 2:
            t0 = words[i]["s"]; t1 = words[j + 1]["s"] if j + 1 < len(words) else words[j]["e"] + .3 * (j - i); n = j - i + 1
            for k in range(n): words[i + k]["s"] = round(t0 + (t1 - t0) * k / n, 2); words[i + k]["e"] = round(t0 + (t1 - t0) * (k + 1) / n, 2)
        i = j + 1

def parse_caption(g):
    flags, y = [], None
    while g.startswith("@"):
        f, g = g.split(" ", 1); f = f[1:]
        if f.startswith("y="): y = int(f[2:])
        elif f == "top": y = 560
        elif f == "bottom": y = 1450
        else: flags.append(f)
    lines = []
    for ln in g.split(" / "):
        big = ln.startswith("^")
        if big: ln = ln[1:]
        toks, cy, kw = [], False, False
        for w in ln.split():
            if w.startswith("["): kw = True; w = w[1:]
            if w.startswith("*"): cy = True; w = w[1:]
            ec = bool(re.search(r"\*[?!.,:]*$", w)); ek = bool(re.search(r"\][?!.,:]*$", w))
            toks.append({"w": w.replace("*", "").replace("]", ""), "cyan": cy, "kw": kw})
            if ec: cy = False
            if ek: kw = False
        lines.append({"big": big, "toks": toks})
    if "behind" in flags and y is None: y = 560
    return {"flags": flags, "y": y, "lines": lines}

PAN = 320
def build_shots(S, P, s2o, total):
    """Tomadas do spec (tempo bruto) -> tempo de saída, encostadas umas nas outras; cenas finais depois da narração.
    Transição de entrada = a de saída da tomada anterior (mesmo sentido); depois da máscara da marca, entra parada."""
    out, mask = [], None
    for i, sh in enumerate(S["shots"]):
        d = dict(sh); d["start"] = out[-1]["end"] if out else 0.0
        d["end"] = round(s2o(sh["end"]), 3) if i < len(S["shots"]) - 1 else round(total, 3)
        if d.get("broll"):
            b = dict(d["broll"]); b["file"] = os.path.normpath(os.path.join(P, b["file"]))
            if d.get("zoom") == "out": b["scale"] = max(b.get("scale", 1.2), 1.18)   # zoom do meio para fora não pode mostrar borda
            d["broll"] = b
        if d.get("scene", {}).get("imgFile"): d["scene"] = dict(d["scene"], imgFile=os.path.normpath(os.path.join(P, d["scene"]["imgFile"])))
        out.append(d)
    for sc in S.get("end", {}).get("scenes", []):
        st = out[-1]["end"]; sc = dict(sc)
        out.append({"start": st, "end": round(st + sc.pop("dur", 2.5), 3), "panel": sc.pop("panel", "azul"), "scene": sc,
                    "out": sc.pop("out", None), "zoom": sc.pop("zoom", None)})
    for i, d in enumerate(out):
        d["cout"] = d.pop("out", None) if i < len(out) - 1 else None
        prev = out[i - 1]["cout"] if i else None
        d["cin"] = d.get("in", prev if prev != "mask" else None)
        if prev == "mask": d["afterMask"] = True; mask = d["start"]
    return out, mask

PANS = ("panR", "panL", "panU", "panD")
def camera(shots, END, fps=30, HW=.3, W=1080, H=1920):
    """Plano por quadro: lista de [tomada, escala, x, y] das tomadas visíveis.
    Transição = empurrão unilateral (pan horizontal ou vertical): a tomada que entra empurra a que sai, as duas
    encostadas, em HW s antes e depois do corte, easeInOut cúbico (pico de velocidade no corte).
    Zoom do meio (13%, power2.inOut, centrado na tomada) só na escala; a 1ª tomada e a que vem depois da máscara assentam."""
    eo = lambda x: 1 - 2 ** (-10 * x) if x < 1 else 1.0
    io2 = lambda x: 2 * x * x if x < .5 else 1 - (-2 * x + 2) ** 2 / 2
    io3 = lambda x: 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
    cl = lambda x: max(0.0, min(1.0, x))
    n, res = len(shots), []
    for k in range(int(round(END * fps)) + 1):
        t = k / fps; ents = []
        for i, sh in enumerate(shots):
            a, b = sh["start"], sh["end"]
            ha = HW if (i > 0 and sh.get("cin") in PANS) else 0
            hb = HW if (i < n - 1 and sh.get("cout") in PANS) else 0
            if not (a - ha <= t < b + hb) and not (i == n - 1 and t >= b): continue
            L, u = b - a, t - a; s, x, y = 1.0, 0.0, 0.0
            if i == 0 or sh.get("afterMask"): s *= 1.06 - .06 * eo(cl(u / .9))
            zm = sh.get("zoom")
            if zm in ("in", "out"):
                v = io2(cl((u - (L / 2 - .4)) / .8)); s *= (.87 + .13 * v) if zm == "in" else (1 - .12 * v)
            if ha and t < a + ha:
                r = 1 - io3(cl((t - (a - ha)) / (2 * ha))); c = sh["cin"]
                x, y = {"panR": (W * r, 0), "panL": (-W * r, 0), "panU": (0, H * r), "panD": (0, -H * r)}[c]
            if hb and t >= b - hb:
                p = io3(cl((t - (b - hb)) / (2 * hb))); c = sh["cout"]
                x, y = {"panR": (-W * p, 0), "panL": (W * p, 0), "panU": (0, -H * p), "panD": (0, H * p)}[c]
            ents.append([i, round(s, 4), round(x, 1), round(y, 1)])
        res.append(ents)
    return res

def main(P):
    S = load_spec(P)
    B = json.load(open(S["brand"]))
    tr_path = S.get("transcript") or P + "/transcript.json"
    if not os.path.exists(tr_path):
        subprocess.run([sys.executable, "-I", ROOT + "/engine/transcribe.py", S["src"], tr_path, S.get("lang", "pt")], check=True)
    chunks = json.load(open(tr_path))
    words = [w for c in chunks for w in c["words"]]; fix_runs(words)
    C = S.get("cut", {}); PRE, POST = C.get("pre", .12), C.get("post", .15)
    src_dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", S["src"]], capture_output=True, text=True).stdout)
    endt = src_dur
    if C.get("end_word"):
        ew, et = C["end_word"]
        cand = [w for w in words if norm(w["w"]) == norm(ew) and abs(w["s"] - et) < 1.5]
        if cand: endt = cand[0]["e"] + .06
    if C.get("end_at"): endt = C["end_at"]
    remove = C.get("remove", [])
    iv = []
    for c in chunks:
        extra = [v for k, v in C.get("pad", {}).items() if abs(float(k) - c["e"]) < .2]
        a, b = max(0, c["s"] - PRE), c["e"] + (extra[0] if extra else POST)
        if a >= endt: break
        b = min(b, endt)
        if iv and a - iv[-1][1] < .1: iv[-1][1] = max(iv[-1][1], b)
        else: iv.append([a, b])
    for ra, rb in remove:  # trechos a remover (takes errados) — corta dentro dos intervalos
        nv = []
        for a, b in iv:
            if rb <= a or ra >= b: nv.append([a, b]); continue
            if ra > a: nv.append([a, ra])
            if rb < b: nv.append([rb, b])
        iv = nv
    # cut.hold {tempo_bruto: s}: insere silêncio naquele ponto (numa pausa) para alongar uma cena curta
    holds = sorted((float(k), v) for k, v in C.get("hold", {}).items())
    for ht, hd in holds:
        for i, (a, b) in enumerate(iv):
            if a < ht < b: iv[i:i + 1] = [[a, ht], [ht, b]]; break
    cuts, o = [], 0
    for a, b in iv:
        for ht, hd in holds:
            if abs(ht - a) < 1e-6 or (cuts and cuts[-1].get("b", -1) <= ht <= a and not any(c.get("hold") == ht for c in cuts)):
                cuts.append({"a": round(ht, 3), "b": round(ht, 3), "o": round(o, 3), "sil": hd, "hold": ht}); o += hd
        cuts.append({"a": round(a, 3), "b": round(b, 3), "o": round(o, 3)}); o += b - a
    total = o
    def s2o(t):
        for c in cuts:
            if c.get("sil"):
                if t < c["a"] or (t == c["a"] and False): return c["o"]
                continue
            if t < c["a"]: return c["o"]
            if t <= c["b"]: return c["o"] + t - c["a"]
        return total
    # ---------- legendas ----------
    groups = [parse_caption(g) for g in S.get("captions", [])]
    disp = [(gi, li, ti, t["w"]) for gi, g in enumerate(groups) for li, l in enumerate(g["lines"]) for ti, t in enumerate(l["toks"])]
    tw = [w for w in words if w["s"] <= endt]
    m = difflib.SequenceMatcher(None, [norm(w["w"]) for w in tw], [norm(d[3]) for d in disp], autojunk=False)
    tmap = {}
    for blk in m.get_matching_blocks():
        for k in range(blk.size): tmap[blk.b + k] = tw[blk.a + k]["s"]
    known = sorted(tmap)
    for i in range(len(disp)):
        if i not in tmap:
            p = max([j for j in known if j < i], default=None); n = min([j for j in known if j > i], default=None)
            tp = tmap[p] if p is not None else 0; tn = tmap[n] if n is not None else endt
            kp = p if p is not None else -1; kn = n if n is not None else len(disp)
            tmap[i] = tp + (tn - tp) * (i - kp) / (kn - kp)
    unmatched = len(disp) - sum(b.size for b in m.get_matching_blocks())
    for i, (gi, li, ti, _) in enumerate(disp): groups[gi]["lines"][li]["toks"][ti]["t"] = round(s2o(tmap[i]), 3)
    for g in groups: g["t"] = min(t["t"] for l in g["lines"] for t in l["toks"]) - .05
    for i, g in enumerate(groups): g["end"] = groups[i + 1]["t"] if i + 1 < len(groups) else total + .4
    # ---------- painéis ----------
    TK = ("t", "start", "end", "typeEnd", "at")
    def conv(x, key=None):
        if isinstance(x, dict): return {k: (round(s2o(v), 3) if (k in TK or k.endswith("At")) and isinstance(v, (int, float)) else conv(v, k)) for k, v in x.items()}
        if isinstance(x, list):
            if key == "lines": return [[l[0], round(s2o(l[1]), 3)] + l[2:] for l in x]
            if len(x) and isinstance(x[-1], (int, float)) and isinstance(x[0], str): return x[:-1] + [round(s2o(x[-1]), 3)]
            if all(isinstance(y, (int, float)) for y in x): return [round(s2o(y), 3) for y in x]
            return [conv(y, key) for y in x]
        return x
    panels = conv(S.get("panels", []))
    bounds = [c["o"] for c in cuts] + [total]
    for s in panels:
        for k in ("start", "end"):
            nb = min(bounds, key=lambda b: abs(b - s[k]))
            if abs(nb - s[k]) < .35: s[k] = round(nb, 3)
        for i, sc in enumerate(s["scenes"]): sc["end"] = s["scenes"][i + 1]["t"] if i + 1 < len(s["scenes"]) else s["end"]
    # ---------- final (transição da marca + card) ----------
    E = S.get("end", {}); end = {"trans": None}; gfx_end = total
    tail = src_dur - (cuts[-1]["b"] if cuts else 0) if C.get("tail_audio", True) else 0
    if E.get("transition"):
        tf = os.path.normpath(os.path.join(os.path.dirname(S["brand"]), E["transition"]))
        cov = mov_cover(tf)  # {fps, n, full_start, exit_start}
        ts = total + E.get("trans_offset", 0.0)
        end.update(trans=tf, trans_start=ts, cover=ts + cov["full_start"], card_start=ts + cov["exit_start"], trans_fps=cov["fps"], trans_n=cov["n"])
    else:
        end.update(card_start=total + .15)
    if E.get("card"):
        end["card"] = os.path.normpath(os.path.join(os.path.dirname(S["brand"]), E["card"]))
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", end["card"]], capture_output=True, text=True).stdout)
        end["end"] = end["card_start"] + d
    elif E.get("card_scene"):
        cs = dict(E["card_scene"]); dur = E.get("card_dur", 3.5)
        st = end["card_start"] - (0 if E.get("transition") else 0)
        cs.update(t=st, end=st + dur)
        panels.append({"mode": "full", "start": st, "end": st + dur, "hold": True, "scenes": [cs]})
        end["end"] = st + dur; gfx_end = st + dur
    else:
        end["end"] = total + max(.6, tail)
    # ---------- zoom de ênfase (vai e volta) ----------
    def in_panel(t): return any(s["start"] - .2 <= t <= s["end"] + .2 for s in panels)
    emph = []
    if S.get("emphasis", "auto") == "auto":
        for g in groups:
            if "behind" in g["flags"]: continue
            bl = [l for l in g["lines"] if l["big"]]
            if not bl: continue
            t = bl[0]["toks"][0]["t"] - .1
            if in_panel(t) or t > total - 1: continue
            if emph and t - emph[-1]["at"] < 3.5: continue
            emph.append({"at": round(t, 3), "amount": .1, "dur": 1.4})
    else:
        emph = [{"at": round(s2o(e["at"]), 3), "amount": e.get("amount", .1), "dur": e.get("dur", 1.4)} for e in S.get("emphasis", [])]
    behind = [[g["t"], g["end"]] for g in groups if "behind" in g["flags"]]
    # ---------- modo narrado por tomadas ----------
    shots, cam, mask = [], None, None
    if S.get("shots"):
        shots, mask = build_shots(S, P, s2o, total)
        gfx_end = shots[-1]["end"]; end = {"trans": None, "end": gfx_end, "card_start": gfx_end + 99}
        cam = camera(shots, gfx_end)
    cap = B.get("captions", {})
    tl = {
        "src": S["src"], "brandFile": S["brand"], "total": round(total, 3), "srcDur": src_dur, "gfxEnd": round(gfx_end, 3),
        "cuts": cuts, "groups": groups, "panels": panels, "behind": behind, "emphasis": emph,
        "flashes": [{"at": round(s2o(f["at"]), 3), "type": f.get("type", B.get("flash", "flash")), "dur": f.get("dur", .22)} for f in S.get("flash", [])],
        "broll": [dict(b, start=round(s2o(b["start"]), 3), end=round(s2o(b["end"]), 3), file=os.path.normpath(os.path.join(P, b["file"]))) for b in S.get("broll", [])],
        "end": end, "tailAudio": C.get("tail_audio", True), "grade": S.get("grade", B.get("grade", "natural")),
        "zoom": dict({"jump": [1.0, 1.13, 1.04, 1.17], "anchor_y": 760, "split_ty": 480}, **S.get("zoom", {})),
        "captionY": dict({"full": cap.get("y_full", 1180), "split": cap.get("y_split", 960), "panel": cap.get("y_panel", 1640)}, **S.get("captionY", {})),
        "keyword": cap.get("keyword", "pill"), "panelDots": B.get("panel", {}).get("dots", True), "panelGlow": B.get("panel", {}).get("glow", .55),
        "music": music.resolve(S.get("music"), P, total, s2o), "sfx": S.get("sfx", {"auto": True}),
        "palette": {k: B["colors"].get(k) for k in ("c1", "c2", "c3", "ink", "paper") if B["colors"].get(k)},
    }
    if shots: tl.update(shots=shots, frames=cam, mask=mask, broll=[])
    json.dump(tl, open(P + "/timeline.json", "w"), ensure_ascii=False, indent=1)
    print(f"total {total:.2f}s (fim {end['end']:.2f}s) · cortes {len(cuts)} · palavras sem par {unmatched} · ênfases {len(emph)} · atrás {len(behind)}")
    for g in groups: print(f"  {g['t']:6.2f}-{g['end']:6.2f} {'@' + ','.join(g['flags']) if g['flags'] else ''}", " / ".join(" ".join(t["w"] for t in l["toks"]) for l in g["lines"]))
    for s in panels: print("  PAINEL", s["mode"], s["start"], s["end"], [(sc["type"], sc["t"]) for sc in s["scenes"]])
    for i, s in enumerate(shots):
        L = s["end"] - s["start"]
        flag = "  <-- acima de 2,5 s" if L > 2.52 else ("  <-- abaixo de 1,3 s" if L < 1.3 else "")
        src = os.path.basename(s["broll"]["file"]) if s.get("broll") else ("painel " + s.get("panel", "?"))
        print(f"  TOMADA {i + 1:2d} {s['start']:6.2f}-{s['end']:6.2f} ({L:.2f}s) {s.get('cin') or '-':>5}->{s.get('cout') or '-':<5} {(s.get('scene') or {}).get('type', '-'):9s} {src}{flag}")

if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1]))

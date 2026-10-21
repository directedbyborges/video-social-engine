# python3 engine/build.py <pasta_do_projeto>
# Lê <proj>/spec.py (SPEC) + transcrição e gera <proj>/timeline.json (tudo em tempo de SAÍDA).
import sys, os, json, re, difflib, glob, importlib.util, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT + "/engine")
from util import mov_cover

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
    cuts, o = [], 0
    for a, b in iv: cuts.append({"a": round(a, 3), "b": round(b, 3), "o": round(o, 3)}); o += b - a
    total = o
    def s2o(t):
        for c in cuts:
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
        "music": S.get("music"), "sfx": S.get("sfx", {"auto": True}),
    }
    json.dump(tl, open(P + "/timeline.json", "w"), ensure_ascii=False, indent=1)
    print(f"total {total:.2f}s (fim {end['end']:.2f}s) · cortes {len(cuts)} · palavras sem par {unmatched} · ênfases {len(emph)} · atrás {len(behind)}")
    for g in groups: print(f"  {g['t']:6.2f}-{g['end']:6.2f} {'@' + ','.join(g['flags']) if g['flags'] else ''}", " / ".join(" ".join(t["w"] for t in l["toks"]) for l in g["lines"]))
    for s in panels: print("  PAINEL", s["mode"], s["start"], s["end"], [(sc["type"], sc["t"]) for sc in s["scenes"]])

if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1]))

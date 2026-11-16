# python3 engine/storyboard_spec.py <proj>
# Gera <proj>/spec.py a partir do storyboard aprovado (<proj>/roteiro.py) + transcrição da narração (<proj>/transcript.json).
# Cada cena do roteiro diz QUAIS palavras da narração ela cobre; o início da cena sai da transcrição (tempo da 1ª palavra),
# então a mesma descrição serve para qualquer narração (a do cliente, uma regravação, outra voz).
#
# roteiro.py define:
#   NARR = "narracao/arquivo.mp3"            (relativo ao projeto)
#   BRAND = "../brand/brand.json"
#   SCENES = [ dict(w="palavras da cena", exit="zin|zout|panL|panR|panU|panD|mask|fade", ...visual...) ]
#     visual: clip="<id ou caminho>" | img="<caminho>"  (+ focus=[x,y], scale, dim, mz="in|out", ss)
#             cap="linha 1 / *destaque*"               (legenda da narração em caixa)
#             panel=dict(type=..., bg="arcos|azul|arcosBranco|...", zoom="in|out", ...)   (cena de motion opaca)
#   OVERLAYS = [ dict(scenes=(i, j), scene=dict(type=..., ...)) ]  (motion transparente sobre o b-roll das cenas i..j, base 1)
#   END = [ dict(type=..., dur=2.4, ...) ]   (assinatura e CTA depois da narração; tempos relativos à cena)
#   MUSIC = {...}   (pivot pode ser "@cena:11")
# Valores "@w:palavra" (ou "@w:palavra+0.3") em parâmetros de cena viram o tempo em que a palavra é dita dentro da cena.
import sys, os, re, json, glob, difflib, importlib.util, pprint

def norm(w): return re.sub(r"[^\wÀ-ú]", "", w.lower())

def main(P):
    spec = importlib.util.spec_from_file_location("roteiro", P + "/roteiro.py"); R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)
    chunks = json.load(open(P + "/transcript.json"))
    words = [w for c in chunks for w in c["words"]]
    SC = R.SCENES
    sw = [(i, norm(x)) for i, s in enumerate(SC) for x in s["w"].split() if norm(x)]
    m = difflib.SequenceMatcher(None, [norm(w["w"]) for w in words], [x[1] for x in sw], autojunk=False)
    hit = {}
    for b in m.get_matching_blocks():
        for k in range(b.size): hit[b.b + k] = b.a + k
    # tempo de início de cada cena = 1ª palavra encontrada (interpola se faltar)
    starts, wmap = [], {}
    for i in range(len(SC)):
        idx = [k for k, x in enumerate(sw) if x[0] == i]
        found = [hit[k] for k in idx if k in hit]
        wmap[i] = [(sw[k][1], words[hit[k]]) for k in idx if k in hit]
        starts.append(words[min(found)]["s"] if found else None)
    for i in range(len(SC)):
        if starts[i] is None:
            p = next((starts[j] for j in range(i - 1, -1, -1) if starts[j] is not None), 0)
            n = next((starts[j] for j in range(i + 1, len(SC)) if starts[j] is not None), words[-1]["e"])
            starts[i] = (p + n) / 2
    pre = .10
    st = [max(0, round(s - pre, 3)) if i else 0.0 for i, s in enumerate(starts)]
    en = st[1:] + [round(words[-1]["e"] + .15, 3)]
    unmatched = len(sw) - len(hit)

    def resolve(v, i):
        if isinstance(v, str) and v.startswith("@w:"):
            mm = re.match(r"@w:([^+\-]+)([+\-][\d.]+)?$", v); key = norm(mm.group(1)); off = float(mm.group(2) or 0)
            for k, w in wmap[i]:
                if k == key: return round(w["s"] + off, 3)
            return st[i] + .2
        if isinstance(v, str) and v.startswith("@cena:"): return st[int(v[6:]) - 1]
        if isinstance(v, dict): return {k: resolve(x, i) for k, x in v.items()}
        if isinstance(v, list): return [resolve(x, i) for x in v]
        if isinstance(v, tuple): return [resolve(x, i) for x in v]
        return v

    def clip_file(c):
        if os.path.exists(os.path.join(P, c)): return c
        for d in ("../magnific videos", "../cliente", "_provisorio"):
            hits = sorted(glob.glob(os.path.join(P, d, f"*{c}*")))
            if hits: return os.path.relpath(hits[0], P)
        return None
    TR = {"zin", "zout", "panL", "panR", "panU", "panD"}
    ex = [s.get("exit") for s in SC]
    tin = [None] + [e if e in TR else None for e in ex[:-1]]
    tout = [e if e in TR else None for e in ex]
    broll, captions, panels, masks, missing = [], [], [], [], []
    for i, s in enumerate(SC):
        if s.get("clip") or s.get("img"):
            src = s.get("clip") or s.get("img")
            f = clip_file(src) or (clip_file(s["fallback"]) if s.get("fallback") else None)
            if f is None: missing.append((i + 1, src)); f = src
            b = {"start": st[i], "end": en[i], "file": f, "tin": tin[i], "tout": tout[i]}
            for k in ("focus", "scale", "dim", "mz", "ss", "zoom"):
                if k in s: b[k] = s[k]
            broll.append(b)
        if s.get("cap"):
            out = tout[i] or ("fade" if ex[i] in ("mask", "fade") else None)
            captions.append(f"@until={en[i]}" + (f" @out={out}" if out else "") + " " + s["cap"])
        if s.get("panel"):
            pn = dict(resolve(s["panel"], i)); bg = pn.pop("bg", "azul")
            sc = dict(pn, t=st[i], cin=tin[i], cout=tout[i])
            panels.append({"mode": "full", "start": st[i], "end": en[i], "bg": bg, "enter": "cut", "scenes": [sc]})
        if ex[i] == "mask": masks.append(en[i])
    for o in getattr(R, "OVERLAYS", []):
        a, b = o["scenes"][0] - 1, o["scenes"][1] - 1
        sc = dict(resolve(o["scene"], a), t=st[a], cin=o.get("cin", tin[a]), cout=tout[b])
        panels.append({"mode": "full", "start": st[a], "end": en[b], "bg": "none", "enter": "cut", "scenes": [sc]})
    panels.sort(key=lambda p: p["start"])
    end = {"scenes": [dict(x) for x in getattr(R, "END", [])], "bg": getattr(R, "END_BG", "arcos")}
    if end["scenes"] and "cin" not in end["scenes"][0]: end["scenes"][0]["cin"] = tout[-1]
    music = getattr(R, "MUSIC", None)
    if music: music = {k: (resolve(v, 0) if isinstance(v, str) and v.startswith("@") else v) for k, v in music.items()}
    SPEC = {
        "src": R.NARR, "brand": R.BRAND, "transcript": "transcript.json",
        "cut": dict({"pre": .12, "post": .15, "tail_audio": False}, **getattr(R, "CUT", {})),
        "grade": getattr(R, "GRADE", "natural"), "emphasis": [],
        "captions": captions, "panels": panels, "broll": broll, "masks": masks, "end": end,
        "sfx": getattr(R, "SFX", {"auto": True, "gain": -4}),
    }
    if music: SPEC["music"] = music
    open(P + "/spec.py", "w").write("# gerado por engine/storyboard_spec.py a partir de roteiro.py + transcript.json — edite o roteiro, não este arquivo\nSPEC = " + pprint.pformat(SPEC, width=150, sort_dicts=False) + "\n")
    print(f"{len(SC)} cenas · palavras sem par {unmatched} · b-roll {len(broll)} · painéis {len(panels)} · legendas {len(captions)}")
    for i in range(len(SC)):
        d = en[i] - st[i]
        print(f"  {i + 1:2d} {st[i]:6.2f}-{en[i]:6.2f} ({d:4.2f}){' <-- >2.5' if d > 2.55 else ''}{' <-- <1.3' if d < 1.3 else ''}  {SC[i]['w']}")
    for n, src in missing: print(f"  FALTA arquivo da cena {n}: {src}")

if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1]))

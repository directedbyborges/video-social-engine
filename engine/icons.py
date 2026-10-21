# Banco de ícones livres (MIT/ISC) para o motor.
#   python3 engine/icons.py index                      -> monta o índice (uma vez por máquina)
#   python3 engine/icons.py search "money,coin" [--libs tabler,phosphor-bold,fluent3d] [--n 40] [--color #00FFEA] [--bg #042241]
#        -> imprime as refs e salva uma folha visual (PNG) para escolher olhando
#   python3 engine/icons.py get fluent3d:money-bag     -> baixa o asset do Fluent (3D/flat/color) para o cache
# Refs aceitas no spec: tabler:<n> | tabler-filled:<n> | phosphor-<thin|light|regular|bold|fill|duotone>:<n> |
#                       lucide:<n> | iconoir:<n> | fluent3d:<n> | fluentflat:<n> | fluentcolor:<n> | file:<caminho>
import sys, os, json, re, subprocess, glob, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NM = ROOT + "/web/node_modules"
CACHE = os.environ.get("VSE_MODELS", os.path.expanduser("~/.cache/vse")) + "/icons"
FLUENT = CACHE + "/fluentui-emoji"
LIBS = ["tabler", "tabler-filled", "phosphor-thin", "phosphor-light", "phosphor-regular", "phosphor-bold", "phosphor-fill",
        "phosphor-duotone", "lucide", "iconoir", "fluent3d", "fluentflat", "fluentcolor"]

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def ensure_fluent_repo():
    if os.path.exists(FLUENT + "/.git"): return
    os.makedirs(CACHE, exist_ok=True)
    subprocess.run(["git", "clone", "-q", "--depth", "1", "--filter=blob:none", "--sparse", "https://github.com/microsoft/fluentui-emoji", FLUENT], check=True)
    subprocess.run(["git", "-C", FLUENT, "sparse-checkout", "set", "--no-cone", "assets/*/metadata.json"], check=True)

def index():
    idx = []
    tj = json.load(open(NM + "/@tabler/icons/icons.json"))
    for n, d in tj.items():
        tags = d.get("tags", []) + [d.get("category", "")]
        if "outline" in d.get("styles", {}): idx.append(["tabler", n, tags])
        if "filled" in d.get("styles", {}): idx.append(["tabler-filled", n, tags])
    # phosphor: nomes + tags do pacote core
    src = open(NM + "/@phosphor-icons/core/dist/index.mjs").read()
    for m in re.finditer(r'name:\s*"([^"]+)".*?tags:\s*\[([^\]]*)\]', src, re.S):
        n, tags = m.group(1), re.findall(r'"([^"]+)"', m.group(2))
        for w in ["thin", "light", "regular", "bold", "fill", "duotone"]: idx.append(["phosphor-" + w, n, tags])
    lt = json.load(open(NM + "/lucide-static/tags.json"))
    for n, tags in lt.items(): idx.append(["lucide", n, tags])
    for f in glob.glob(NM + "/iconoir/icons/regular/*.svg"): idx.append(["iconoir", os.path.basename(f)[:-4], []])
    try:
        ensure_fluent_repo()
        for mf in glob.glob(FLUENT + "/assets/*/metadata.json"):
            d = json.load(open(mf)); folder = os.path.basename(os.path.dirname(mf))
            tags = d.get("keywords", []) + [d.get("group", ""), d.get("cldr", "")]
            for k in ["fluent3d", "fluentflat", "fluentcolor"]: idx.append([k, slug(folder), tags])
    except Exception as e: print("fluent indisponível:", e)
    os.makedirs(CACHE, exist_ok=True)
    json.dump(idx, open(CACHE + "/index.json", "w"))
    print("índice:", len(idx), "entradas")

def fluent_path(kind, name):
    ensure_fluent_repo()
    folders = {slug(os.path.basename(p)): os.path.basename(p) for p in glob.glob(FLUENT + "/assets/*")}
    folder = folders.get(name)
    if not folder: raise SystemExit("fluent não encontrado: " + name)
    sub = {"fluent3d": "3D", "fluentflat": "Flat", "fluentcolor": "Color"}[kind]
    pat = f"{FLUENT}/assets/{folder}/{sub}/*"
    if not glob.glob(pat):
        cur = subprocess.run(["git", "-C", FLUENT, "sparse-checkout", "list"], capture_output=True, text=True).stdout.split()
        subprocess.run(["git", "-C", FLUENT, "sparse-checkout", "set", "--no-cone"] + cur + [f"assets/{folder}/{sub}/*"], check=True)
    f = sorted(glob.glob(pat))
    # emojis com tom de pele têm subpastas: pegar o Default
    if not f or os.path.isdir(f[0]): f = sorted(glob.glob(f"{FLUENT}/assets/{folder}/Default/{sub}/*"))
    return f[0]

def path_of(ref):
    lib, name = ref.split(":", 1)
    if lib == "file": return name
    if lib == "tabler": return f"{NM}/@tabler/icons/icons/outline/{name}.svg"
    if lib == "tabler-filled": return f"{NM}/@tabler/icons/icons/filled/{name}.svg"
    if lib.startswith("phosphor-"):
        w = lib.split("-")[1]; suf = "" if w == "regular" else "-" + w
        return f"{NM}/@phosphor-icons/core/assets/{w}/{name}{suf}.svg"
    if lib == "lucide": return f"{NM}/lucide-static/icons/{name}.svg"
    if lib == "iconoir": return f"{NM}/iconoir/icons/regular/{name}.svg"
    if lib.startswith("fluent"): return fluent_path(lib, name)
    raise SystemExit("lib desconhecida: " + lib)

def search(q, libs=None, n=40, color="#ffffff", bg="#1b1b1b", out=None):
    idx = json.load(open(CACHE + "/index.json"))
    terms = [t.strip().lower() for t in q.split(",") if t.strip()]
    libs = libs or ["tabler", "phosphor-bold", "lucide", "fluent3d"]
    scored = []
    for lib, name, tags in idx:
        if lib not in libs: continue
        tags = [x for x in tags if isinstance(x, str)]
        s = 0; nm = name.replace("-", " ")
        for t in terms:
            if nm == t: s += 10
            elif re.search(r"\b" + re.escape(t), nm): s += 5
            if any(t == x.lower() for x in tags): s += 3
            elif any(t in x.lower() for x in tags): s += 1
        if s: scored.append((s, lib, name))
    scored.sort(key=lambda x: (-x[0], LIBS.index(x[1]), x[2]))
    seen = set(); res = []
    for s, lib, name in scored:
        if (lib, name) in seen: continue
        seen.add((lib, name)); res.append(f"{lib}:{name}")
        if len(res) >= n: break
    for r_ in res: print(r_)
    if res: sheet(res, color, bg, out or f"/tmp/icons_{slug(q)[:30]}.png")
    return res

def sheet(refs, color, bg, out):
    cells = []
    for r_ in refs:
        try: p = path_of(r_)
        except SystemExit: continue
        if p.endswith(".png"):
            import base64
            inner = f'<img src="data:image/png;base64,{base64.b64encode(open(p, "rb").read()).decode()}" style="width:110px;height:110px;object-fit:contain">'
        else:
            inner = re.sub(r'(width|height)="[^"]*"', '', open(p).read(), count=2).replace("<svg", '<svg width="110" height="110"', 1)
        cells.append(f'<div class="c"><div class="i">{inner}</div><div class="l">{html.escape(r_)}</div></div>')
    page = f"""<html><body style="margin:0;background:{bg};color:{color};font:13px sans-serif">
    <div style="display:flex;flex-wrap:wrap;width:1600px;padding:10px">{''.join(cells)}</div>
    <style>.c{{width:190px;height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center}}.i{{color:{color}}}
    .l{{margin-top:8px;opacity:.8;text-align:center;word-break:break-all;width:180px}}</style></body></html>"""
    hp = out[:-4] + ".html"; open(hp, "w").write(page)
    subprocess.run(["node", ROOT + "/web/shot.js", hp, out], check=True)
    print("folha:", out)

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "index": index()
    elif a[0] == "get": print(path_of(a[1]))
    elif a[0] == "search":
        kw = dict(zip(a[2::2], a[3::2]))
        search(a[1], kw.get("--libs", "").split(",") if "--libs" in kw else None, int(kw.get("--n", 40)),
               kw.get("--color", "#ffffff"), kw.get("--bg", "#1b1b1b"), kw.get("--out"))

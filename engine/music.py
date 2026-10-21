# Trilhas: biblioteca organizada por pastas de clima em music/<clima>/arquivo.mp3
#   climas sugeridos: dor (tensão, reflexivo), desejo (inspirador, aspiracional), solucao (corporativo positivo, confiança),
#                     energia (upbeat, acelerado), neutro
#   python3 engine/music.py scan            -> (re)gera music/music.json com duração e loudness de cada faixa
#   python3 engine/music.py list            -> mostra a biblioteca
# No spec: "music": {"intro": "dor", "main": "solucao", "pivot": 14.6, "level": -30}
#   ou arquivos fixos: {"intro_file": "music/dor/x.mp3", "main_file": "music/solucao/y.mp3", "pivot": 14.6}
#   ou uma faixa só com virada por filtro: {"file": "...", "pivot": 14.6}
import sys, os, json, glob, subprocess, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = ROOT + "/music"

def probe(f):
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 0)
    lo = subprocess.run(["ffmpeg", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = [l for l in lo.splitlines() if l.strip().startswith("I:")]
    return round(d, 1), float(I[-1].split()[1]) if I else -20.0

def scan():
    cat = {}
    for f in sorted(glob.glob(LIB + "/*/*")):
        if not f.lower().endswith((".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac")): continue
        rel = os.path.relpath(f, ROOT); d, lufs = probe(f)
        cat[rel] = {"mood": os.path.basename(os.path.dirname(f)), "dur": d, "lufs": lufs}
    json.dump({"tracks": cat}, open(LIB + "/music.json", "w"), ensure_ascii=False, indent=1)
    print(len(cat), "faixas")

def pick(mood, used, seed):
    cat = json.load(open(LIB + "/music.json"))["tracks"]
    opts = [k for k, v in cat.items() if v["mood"] == mood] or list(cat)
    fresh = [k for k in opts if k not in used] or opts       # evita repetir dentro do lote
    random.Random(seed).shuffle(fresh)
    return fresh[0]

def resolve(M, proj, total_out, s2o):
    """Converte o bloco "music" do spec em arquivos + tempos de saída; registra o uso no lote."""
    if not M: return None
    reg = os.path.join(os.path.dirname(proj), "_lote_musicas.json")
    used = json.load(open(reg)) if os.path.exists(reg) else {}
    mine = used.get(os.path.basename(proj), [])
    taken = {t for k, v in used.items() if k != os.path.basename(proj) for t in v}
    lvl = M.get("level", -30)   # LUFS alvo da trilha sob a voz (antes do ducking); -27 mais presente, -33 mais discreta
    out = {"level": lvl, "pivot": round(s2o(M["pivot"]), 3) if M.get("pivot") is not None else None, "xfade": M.get("xfade", 1.6)}
    lib = lambda x: x if os.path.isabs(x) else os.path.join(ROOT, x) if x.startswith("music/") else os.path.join(proj, x)
    g = lambda f: round(lvl - probe(f)[1], 1)
    if M.get("file"): out["single"] = lib(M["file"]); out["gains"] = [g(out["single"])] * 2
    else:
        seed = os.path.basename(proj)
        intro = M.get("intro_file") or (mine[0] if len(mine) == 2 else pick(M.get("intro", "dor"), taken, seed))
        main = M.get("main_file") or (mine[1] if len(mine) == 2 else pick(M.get("main", "solucao"), taken | {intro}, seed + "b"))
        out["intro"], out["main"] = lib(intro), lib(main)
        out["gains"] = [g(out["intro"]), g(out["main"])]
        used[os.path.basename(proj)] = [intro, main]
        json.dump(used, open(reg, "w"), ensure_ascii=False, indent=1)
    return out

if __name__ == "__main__":
    if sys.argv[1] == "scan": scan()
    elif sys.argv[1] == "list":
        for k, v in json.load(open(LIB + "/music.json"))["tracks"].items(): print(f"{v['mood']:10s} {v['dur']:6.1f}s {v['lufs']:6.1f} LUFS  {k}")

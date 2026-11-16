# python3 engine/seq_audio.py <proj>
# Mixagem do modo sequência: narração + efeitos (eventos da página) + trilha opcional com ducking.
# Lê <proj>/seq.json (narração, trilha) e <proj>/events.json (gerado por web/seq/events.js).
# Alvos (skill B5): narração já entra com pico em -3 dBFS; master ≈ -14 LUFS e true peak entre -3 e -2 dBTP.
import sys, os, json, subprocess, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.abspath(sys.argv[1])
S = json.load(open(P + "/seq.json")); EV = json.load(open(P + "/events.json"))
CAT = json.load(open(ROOT + "/sfx/sfx.json"))
END = EV["end"]
MAP = {"cut": "scene_cut", "click": None, "check": "check", "chip": "chip", "icon": "icon_pop", "hook": "hook_word",
       "brand": "brand_reveal", "build": "build", "counter": "counter", "big": "big_word", "card": "ui_card"}
FIXED = {"click": ["shutter"]}
SG = S.get("sfx_gain", -3)

def opts(t):
    if t in FIXED: return FIXED[t]
    return CAT["events"].get(MAP.get(t, t), [])

ev = sorted(EV["sfx"], key=lambda e: e["t"])
picked, last, rot = [], -9, {}
prio = {"cut": 1, "build": 2, "brand": 2, "hook": 2, "click": 2}
for e in ev:
    o = opts(e["type"])
    if not o: continue
    near = [p for p in picked if abs(p["t"] - e["t"]) < .18]
    if near and prio.get(e["type"], 0) <= max(prio.get(p["type"], 0) for p in near): continue
    for p in near: picked.remove(p)
    i = rot.get(e["type"], 0); rot[e["type"]] = i + 1
    f = o[i % len(o)]; meta = CAT["files"][f]
    picked.append({"type": e["type"], "t": e["t"], "file": f, "hit": meta["hit"], "gain": meta["gain"]})

ins, parts = ["-i", S["narration"]], []
parts.append(f"[0:a]aresample=48000,apad,atrim=0:{END:.3f}[voice]")
mix = ["[voice]"]
for k, p in enumerate(picked, 1):
    ins += ["-i", f"{ROOT}/sfx/{p['file']}.mp3"]
    start = p["t"] - p["hit"]; trim = max(0, -start); delay = max(0, start)
    parts.append(f"[{k}:a]aresample=48000,atrim={trim:.3f},asetpts=PTS-STARTPTS,volume={p['gain'] + SG}dB,adelay={int(delay * 1000)}:all=1[s{k}]")
    mix.append(f"[s{k}]")
n = len(picked) + 1
M = S.get("music")
if M:
    ins += ["-ss", str(M.get("ss", 0)), "-i", M["file"]]
    mi = n
    lvl = M.get("gain_db", -18)
    parts.append(f"[{mi}:a]aresample=48000,volume={lvl}dB,atrim=0:{END:.3f},afade=t=in:d=.4,afade=t=out:st={END - 1.6:.3f}:d=1.6[mraw]")
    parts.append("[voice]asplit=2[voice1][vsc]") ; mix[0] = "[voice1]"
    parts.append("[mraw][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400:makeup=1[mus]")
    mix.append("[mus]")
parts.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,atrim=0:{END:.3f}[pre]")
pre = P + "/_premix.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(parts), "-map", "[pre]", "-ar", "48000", "-ac", "2", pre], check=True)

# master: compressão leve + loudnorm em 2 passadas + limitador em -2 dBTP
chain = "acompressor=threshold=-22dB:ratio=3.5:attack=6:release=90:makeup=1"
m1 = subprocess.run(["ffmpeg", "-i", pre, "-af", chain + ",loudnorm=I=-14:TP=-2.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m1[m1.rindex("{"):m1.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-2.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
out = P + "/audio_master.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"{chain},{ln},aresample=192000,alimiter=limit=-2.3dB:attack=2:release=60:level=disabled,aresample=48000",
                "-ar", "48000", out], check=True)
r = subprocess.run(["ffmpeg", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]; TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1]
print(f"efeitos {len(picked)} · master {I} LUFS · true peak {TP} dBTP")
json.dump(picked, open(P + "/_sfx_usados.json", "w"), indent=1)

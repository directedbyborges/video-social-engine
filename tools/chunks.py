# python3 tools/chunks.py <words.json> <transcript.json>  -> formato do motor (blocos por fala com palavras)
import sys, json
d = json.load(open(sys.argv[1])); ws = d["words"]; out, cur = [], None
for w in ws:
    if cur and w["s"] - cur["e"] > .45: out.append(cur); cur = None
    if cur is None: cur = {"s": w["s"], "e": w["e"], "text": "", "words": []}
    cur["words"].append({"w": w["w"], "s": w["s"], "e": w["e"]}); cur["e"] = w["e"]; cur["text"] += (" " if cur["text"] else "") + w["w"]
if cur: out.append(cur)
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=1); print(len(out), "blocos")

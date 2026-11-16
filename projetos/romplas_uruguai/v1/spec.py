# Romplas · Uruguai Original® · "Sua loja pode estar perdendo vendas" — vídeo narrado por tomadas (storyboard aprovado, 23 cenas)
# Tempos das tomadas = tempo BRUTO da narração (o motor converte depois de aparar as pausas).
# Linhas de texto: [texto com **negrito**, estilo (sobre | r | b), px]. Cenas: web/src/shots.js.
MV = "../magnific videos/"
AZ, BR_ = "azul", "branco"

SPEC = {
 "src": "../narracao/narracao_v4_carlos.mp3",
 "brand": "../brand/brand.json",
 "transcript": "transcript.json",
 "cut": {"pre": .12, "post": .15, "pad": {33.22: .3}, "hold": {33.45: .3, 22.85: .15}, "tail_audio": False},
 "captions": [],
 "emphasis": [],
 "shots": [
  # 1 — gancho: letterbox parte 1 em box 3D
  {"end": 2.50, "broll": {"file": MV + "31a574a6-0_Fabric_Swatches_1080x1920.mp4", "ss": 1.0, "focus": [.45, .45], "scale": 1.2},
   "scene": {"type": "block", "y": 1000, "d3": True, "hook": True, "words": True,
             "lines": [["SUA LOJA PODE ESTAR", "sobre", 52], ["perdendo vendas", "b", 114]]}, "out": "zin", "zoom": "in"},
  # 2 — letterbox parte 2
  {"end": 4.98, "broll": {"file": MV + "1983ef45-0_Vertical_Video_Vertical_1080x1920.mp4", "ss": 0.0, "focus": [.5, .45], "scale": 1.25},
   "scene": {"type": "block", "y": 920, "d3": True, "words": True,
             "lines": [["por não ter", "r", 72], ["Uruguai", "b", 132], ["Original®!", "b", 132]]}, "out": "panR", "zoom": "out"},
  # 3 — pergunta
  {"end": 7.28, "panel": BR_, "scene": {"type": "type", "y": 690, "lines": [["Você tem", "r", 150], ["para **vender?**", "r", 150]]},
   "out": "zout", "zoom": "in"},
  # 4 — não leva outro
  {"end": 8.65, "broll": {"file": MV + "11c77b42-0_Man_Textile_720x1280.mp4", "ss": 0.8, "focus": [.6, .33], "scale": 1.2},
   "scene": {"type": "block", "y": 1050, "white": True, "lines": [["Ele **não leva**", "r", 112], ["outro.", "r", 112]]},
   "out": "panL", "zoom": "out"},
  # 5 — vai na loja que tem
  {"end": 10.30, "broll": {"file": MV + "dba7b74c-0_Vertical_Video_Door_1080x1920.mp4", "ss": 0.4, "focus": [.68, .5], "scale": 1.25},
   "scene": {"type": "block", "y": 1040, "lines": [["Vai na loja", "r", 104], ["que tem.", "b", 124]]}, "out": "zin", "zoom": "in"},
  # 6 — pode não voltar
  {"end": 11.86, "broll": {"file": MV + "0a315322-0_Man_Headache_1080x1920.mp4", "ss": 1.0, "focus": [.5, .3], "scale": 1.15},
   "scene": {"type": "block", "y": 1020, "letters": True, "lines": [["E pode", "r", 96], ["não voltar.", "b", 128]]},
   "out": "panU", "zoom": "out"},
  # 7 — restante do pedido (fecha a dor; sai na máscara da marca)
  {"end": 14.10, "broll": {"file": MV + "7777d46a-0_Vertical_Video_Parcel_1080x1920.mp4", "ss": 2.0, "focus": [.45, .45], "scale": 1.15},
   "scene": {"type": "block", "y": 1050, "white": True, "lines": [["nem o restante", "r", 92], ["do pedido.", "b", 124]]},
   "out": "mask", "zoom": "in"},
  # 8 — VIRADA: produto na prateleira (imagem C)
  {"end": 16.05, "broll": {"file": "../imagens/C_prateleira.jpg", "focus": [.55, .5], "scale": 1.12, "push": .06},
   "scene": {"type": "block", "y": 1050, "letters": True, "lines": [["Uruguai Original®", "b", 112], ["na prateleira.", "r", 78]]},
   "out": "zin", "zoom": "out"},
  # 9 — você vende o produto (imagem D)
  {"end": 17.85, "broll": {"file": "../imagens/D_entrega.jpg", "focus": [.5, .5], "scale": 1.06, "push": .04},
   "scene": {"type": "block", "y": 630, "lines": [["Você vende", "r", 88], ["o produto", "b", 106]]}, "out": "panR", "zoom": "in"},
  # 10 — pedido pelo nome (amostra Uruguai com etiqueta — PROVISÓRIO até chegar a foto em alta)
  {"end": 19.30, "broll": {"file": "../provisorio/amostra_etiqueta.jpg", "focus": [.5, .5], "scale": 1.1, "push": .08, "dim": .25},
   "scene": {"type": "label", "y": 1080, "forma": "colchete", "px": 104, "text": "pedido pelo nome."}, "out": "zout", "zoom": "in"},
  # 11 — 55 variações (cartela real — PROVISÓRIO em baixa)
  {"end": 21.50, "broll": {"file": "../provisorio/cartela_uruguai.jpg", "focus": [.5, .45], "scale": 1.1, "push": .06},
   "scene": {"type": "block", "y": 760, "count": {"line": 0, "to": 55, "at": .3, "dur": 1.0},
             "lines": [["55", "b", 264], ["variações de cores.", "r", 70]]}, "out": "panL", "zoom": "out"},
  # 12 — direto da fábrica
  {"end": 22.86, "broll": {"file": MV + "60d8078a-0_Vertical_Video_Tarp_1080x1920.mp4", "ss": 1.0, "focus": [.5, .4], "scale": 1.15},
   "scene": {"type": "block", "y": 1120, "white": True, "lines": [["direto da **fábrica.**", "r", 92]]}, "out": "zin", "zoom": "in"},
  # 13 — segura o cliente (antigas 13+14)
  {"end": 25.40, "broll": {"file": MV + "97a5e5db-0_Vertical_Video_Customer_1080x1920.mp4", "ss": 0.0, "focus": [.45, .45], "scale": 1.15},
   "scene": {"type": "block", "y": 1080, "lines": [["e ainda", "r", 84], ["segura o cliente", "b", 104]]}, "out": "panR", "zoom": "out"},
  # 14 — a Romplas fabrica (logo peça por peça)
  {"end": 27.70, "panel": AZ, "scene": {"type": "logo", "y": 720, "w": 760, "lines": [["fabrica o", "r", 72], ["**Uruguai Original®.**", "r", 92]]},
   "out": "panU", "zoom": "out"},
  # 15 — 4.500 clientes
  {"end": 30.15, "panel": BR_, "scene": {"type": "type", "y": 640, "from": 1.2, "count": {"line": 1, "to": 4500, "at": .3, "dur": 1.2},
   "lines": [["MAIS DE", "sobre", 56], ["4.500", "b", 300], ["clientes.", "r", 92]]}, "out": "zin", "zoom": "out"},
  # 16 — 23 mil tapeceiros (box 3D, 2ª vez)
  {"end": 32.30, "broll": {"file": MV + "4d600ad7-0_Woman_Experience_1080x1920.mp4", "ss": 7.0, "focus": [.5, .45], "scale": 1.15},
   "scene": {"type": "block", "y": 880, "d3": True, "count": {"line": 1, "to": 23, "at": .3, "dur": .9},
             "lines": [["cerca de", "r", 66], ["23 mil", "b", 250], ["tapeceiros", "r", 84]]}, "out": "panL", "zoom": "in"},
  # 17 — rede da marca
  {"end": 33.46, "panel": AZ, "scene": {"type": "rings", "y": 560, "lines": [["na **rede da marca.**", "r", 92]]}, "out": "zout", "zoom": "in"},
  # 18 — clique em Saiba mais
  {"end": 34.85, "panel": BR_, "scene": {"type": "label", "y": 650, "pre": "Clique em", "text": "Saiba mais", "forma": "sublinhado",
   "px": 140, "weight": 700, "color": "#2E507B", "arrow": True}, "out": "panR", "zoom": "in"},
  # 19 — cadastro da loja
  {"end": 36.45, "panel": AZ, "scene": {"type": "signup", "y": 560, "lines": [["Cadastre **sua loja.**", "r", 96]],
   "fields": [["Nome da loja", "Tapeçaria Silva"], ["Cidade", "Curitiba · PR"], ["WhatsApp", "(41) 99999-0000"]]}, "out": "zin", "zoom": "in"},
  # 20 — especialista entra em contato (clipe alternativo; a foto da equipe chegou só em baixa)
  {"end": 38.75, "broll": {"file": MV + "8cd8eb00-0_Man_Business_1080x1920.mp4", "ss": 1.2, "focus": [.45, .3], "scale": 1.15},
   "scene": {"type": "block", "y": 1060, "lines": [["Um especialista", "r", 88], ["entra em contato.", "b", 104]]}, "out": "zout", "zoom": "out"},
  # 21 — apresenta as condições
  {"end": 40.48, "broll": {"file": MV + "fb45a6c9-0_Man_Craftsman_1080x1920.mp4", "ss": 9.0, "focus": [.5, .3], "scale": 1.15},
   "scene": {"type": "block", "y": 1000, "lines": [["e apresenta", "r", 92], ["as condições.", "b", 116]]}, "out": "zin", "zoom": "in"},
 ],
 "end": {"scenes": [
  {"type": "logoSign", "dur": 2.3, "panel": AZ, "y": 820, "out": "zin"},
  {"type": "cta", "dur": 2.5, "panel": BR_, "y": 740, "cta": "Saiba mais", "sub": ["e cadastre sua loja."], "clickAt": 1.4},
 ]},
 "sfx": {"auto": True, "gain": -3},
}

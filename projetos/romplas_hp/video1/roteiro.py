# Romplas · Linha náutica HP · Vídeo 1 — "Seu cliente de barco volta reclamando do revestimento?"
# Storyboard aprovado: https://claude.ai/artifact/HthfyTLrVAzCPrKmKZyqhq
# Gere o spec com:  python3 engine/storyboard_spec.py projetos/romplas_hp/video1
# Clipes do Magnific: baixe em "../magnific videos/" mantendo o número do item no nome (ex.: 9665202.mp4).
# Fotos do cliente: "../cliente/hp.jpg", "hp_close.jpg", "hp_barco.jpg", "uruguai.jpg" (sem elas usa a amostra Nautiplas).

NARR = "../narracao/narracao.mp3"
BRAND = "../brand/brand.json"
GRADE = "natural"
AMOSTRA = "../brand/nautiplas-azul-amostra.jpg"

SCENES = [
 # ---------- DOR ----------
 dict(w="Lojista que vende material", clip="9665202", focus=[.45, .5], exit="zin"),
 dict(w="para estofado de barco", clip="9976175", focus=[.5, .6], exit="panR"),
 dict(w="você sabe o que acontece quando", clip="8156219", cap="Você sabe o que / *acontece*…", exit="zout", mz="in"),
 dict(w="o revestimento não aguenta o mar", clip="5459155", focus=[.5, .55], cap="o revestimento / não aguenta o *mar.*", exit="panL", mz="out"),
 dict(w="Um verão de sol e maresia", clip="8443488", focus=[.5, .62], cap="Um verão de *sol* / e maresia", exit="zin", mz="in"),
 dict(w="e o estofado resseca", clip="9813181", cap="e o estofado / *resseca,*", exit="zout", mz="out"),
 dict(w="desbota e racha", clip="10610973", dim=.38, exit="panU", mz="in"),
 dict(w="O cliente volta na sua loja", clip="8378885", focus=[.45, .45], cap="O cliente volta / na sua *loja*", exit="zin"),
 dict(w="reclamando e quem leva a culpa", clip="6852186", focus=[.5, .42], cap="*reclamando,* / e quem leva a culpa", exit="panR", mz="out"),
 dict(w="é você não o fabricante", clip="9677998", focus=[.5, .4], exit="zout"),
 # ---------- VIRADA: HP ----------
 dict(w="O HP foi feito para isso", img="../cliente/hp.jpg", fallback=AMOSTRA, focus=[.35, .45], dim=.35, exit="panL"),
 dict(w="alta resistência à água", clip="10606752", cap="Alta resistência / à *água,*", exit="zin", mz="in"),
 dict(w="aos raios UV e à abrasão", exit="zout",
      panel=dict(type="selos", bg="arcos", zoom="in", heading="Alta resistência",
                 items=[["gota", "Água", 0], ["sol", "Raios UV", "@w:raios"], ["camadas", "Abrasão", "@w:abrasão"]])),
 dict(w="com manutenção mínima", clip="10134042", cap="Manutenção / *mínima*", exit="panR"),
 dict(w="e aparência de novo", clip="9976443", focus=[.5, .62], cap="e aparência / de *novo*", exit="zin", mz="in"),
 dict(w="por mais tempo", img="../cliente/hp_barco.jpg", fallback="9976443", ss=3, focus=[.5, .62], exit="zout"),
 dict(w="Você vende uma vez", clip="8310335", focus=[.38, .4], cap="Você vende / *uma vez*", exit="panL"),
 dict(w="e o cliente volta", clip="7402311", focus=[.45, .4], cap="e o cliente / *volta*", exit="zin"),
 dict(w="para comprar de novo", exit="zout",
      panel=dict(type="bigWords", bg="arcosBranco", zoom="in", color="var(--c2)", trace="onda",
                 lines=[["para comprar", 0, 120], ["*de novo.*", "@w:novo", 150]])),
 dict(w="não para reclamar", exit="panR",
      panel=dict(type="bigWords", bg="azul", zoom="out", lines=[["Não para", 0, 130], ["*reclamar.*", "@w:reclamar", 170]],
                 strike={"line": 1, "at": "@w:reclamar+0.55"})),
 # ---------- MARCA ----------
 dict(w="É a nova linha náutica", clip="7283092", exit="mask"),
 dict(w="da Romplas a fabricante", clip="9658542", cap="da *Romplas,* / a fabricante", exit="zin"),
 dict(w="do Uruguai Original", img="../cliente/uruguai.jpg", fallback=AMOSTRA, focus=[.2, .7], cap="do *Uruguai* / *Original®*", exit="zout"),
 dict(w="trinta e dois anos", exit="panL", panel=dict(type="statBig", bg="arcos", zoom="out", to=32, label="anos")),
 dict(w="fazendo revestimento sintético", exit="zin",
      panel=dict(type="seloBig", bg="arcosBranco", zoom="in", icon="camadas", t1="Revestimentos", t2="Sintéticos")),
 # ---------- CTA ----------
 dict(w="Clique em Saiba Mais", exit="zin", panel=dict(type="ctaButton", bg="arcos", cta="Saiba mais", clickAt="@w:mais+0.35")),
 dict(w="faça o cadastro da sua loja", exit="panR",
      panel=dict(type="form", bg="arcosBranco", zoom="in", title="Cadastro da loja", button="Enviar cadastro",
                 fields=[["Nome da loja", "Náutica Estofados", "@w:cadastro"], ["Cidade", "Itajaí · SC", "@w:sua"], ["WhatsApp", "(47) 9 9999-0000", "@w:loja"]])),
 dict(w="e um especialista da Romplas", clip="9698555", focus=[.5, .38], cap="um especialista / da *Romplas*", exit="zout", mz="in"),
 dict(w="entrará em contato", clip="7182299", focus=[.5, .4], cap="entrará em / *contato*", exit="panL"),
 dict(w="para apresentar o HP", img="../cliente/hp_close.jpg", fallback=AMOSTRA, focus=[.75, .3], cap="para apresentar / o *HP.*", exit="zin"),
]

# motion transparente sobre o b-roll (cenas base 1)
OVERLAYS = [
 dict(scenes=(1, 2), cin="none", scene=dict(type="box3d", theme="azul", y=440,
      lines=[["Seu cliente de barco", 0, 60], ["volta *reclamando*", 0, 96], ["do revestimento?", 0, 70]])),
 dict(scenes=(7, 7), scene=dict(type="bigWords", letters=True, y=430, lines=[["desbota", "@w:desbota", 150], ["e *racha.*", "@w:racha", 170]])),
 dict(scenes=(10, 10), scene=dict(type="box3d", theme="branco", y=600, lines=[["É *você.*", "@w:você", 104], ["Não o fabricante.", "@w:não", 64]])),
 dict(scenes=(11, 11), scene=dict(type="lettering", y=400, sobre="Nova linha náutica", big="HP.", trace="gancho", sub="feito para o mar.")),
 dict(scenes=(16, 16), scene=dict(type="rotulo", forma="sublinhado", y=600, text="Por mais tempo.")),
 dict(scenes=(21, 21), scene=dict(type="rotulo", forma="colchete", y=700, text="Nova linha náutica.")),
]

# depois da narração: assinatura e CTA final (tempos relativos à cena)
END_BG = "arcos"
END = [
 dict(type="logoSign", dur=2.4, rows=[["Revestindo", 86], ["*possibilidades.*", 86]], trace="gancho", cout="zout"),
 dict(type="ctaButton", dur=2.5, cin="zout", cout="none", cta="Saiba mais", clickAt=1.35, sub=["Cadastre sua loja", "e conheça o *HP.*"]),
]

# trilha: duas faixas com virada na cena 11 (HP). Troque pelos arquivos que o cliente mandar.
MUSIC = {"intro_file": "../trilha/dor.mp3", "main_file": "../trilha/solucao.mp3", "pivot": "@cena:11", "level": -29}

# enquanto os arquivos do cliente não chegam: narração/trilha provisórias só para testar o motor (nunca vão para a entrega)
import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
if not _os.path.exists(_os.path.join(_HERE, NARR)): NARR = "_provisorio/narracao_provisoria.wav"
for _k, _alt in (("intro_file", "_provisorio/dor.mp3"), ("main_file", "_provisorio/solucao.mp3")):
    if not _os.path.exists(_os.path.join(_HERE, MUSIC[_k])): MUSIC[_k] = _alt

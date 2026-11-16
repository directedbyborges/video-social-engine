# Romplas · Uruguai Original® · "Sua loja pode estar perdendo vendas"

Vídeo vertical 9:16 de captação de lojistas de material para tapeçaria.

## Estado
- Storyboard aprovado ("ok" do usuário): https://claude.ai/artifact/5PUm6wMsiqkV9qEpxdQ1D4
- Narração gerada: `narracao/narracao_v4_carlos.mp3` (Magnific `audio_tts`, ElevenLabs V4, voz Carlos Alves id 69, 40,8 s, −24,7 LUFS antes da normalização).
- Imagens C (prateleira com rolos) e D (lojista entrega rolo caramelo) geradas pelo usuário no ChatGPT, 941×1672: ampliar antes do render.
- v1 entregue: `entrega/Romplas_UruguaiOriginal_PerdendoVendas_v1.mp4` (44,3 s, 1080×1920, 30 fps; −14,4 LUFS, pico −2,3 dBTP).
- Motor: implementado aqui o modo narrado por tomadas (o usuário não tinha a cópia local atualizada). Ver `v1/spec.py`.
- Trilha: gerada no Magnific (Google Lyria 3 Pro, 160 créditos), groove disco-funk sem vocal, `trilha/groove_lyria.mp3`; ss 8,2 s para o fim natural cair no fim do vídeo; virada por filtro na frase do produto.
- Cena 10: foto em alta do Uruguai preto (sem etiqueta) enviada pelo usuário. Cena 11: recorte fechado nos rolos da imagem C (o usuário não tem as fotos das cores neste PC).
- Cena 4: clipe 9711700 veio em 720p. Cena 20: clipe alternativo do Magnific (a foto da equipe só existia em baixa).

## Narração conferida (transcrição em `v1/transcript.json`)
- Nenhuma tag lida em voz alta; números e "Romplas" lidos certo (o Whisper do texto corrido escreveu "HomePlus" aos 37,4 s, mas o trecho isolado dá "Romplas").
- A voz disse "pedindo **o** Uruguai Original" e "**pra** vender" (roteiro: "pedindo Uruguai Original", "para vender"). Perguntado ao usuário se regenera só essa frase.
- Corte padrão (pre .12 / post .15) + `cut.pad` {6.21: .4, 22.68: .2, 33.25: .4} → narração aparada ≈ 40,2 s; com assinatura (2,3 s) e CTA (2,6 s) ≈ 45,1 s.
- Limites das cenas no tempo bruto: 0 · 2.45 · 4.98 · 6.50 · 8.65 · 10.30 · 11.86 · 14.10 · 16.05 · 17.85 · 19.30 · 21.50 · 22.85 · 25.40 · 27.70 · 30.15 · 32.30 · 33.40 · 34.85 · 36.45 · 38.75 · 40.48
- As antigas cenas 13 e 14 viraram uma só (cada uma teria 1,2 s): sai o clipe 9708810. Agora são 23 cenas; virada em 13,6 s.

## Decisões
- Design system Romplas (artifact "Romplas"): só Source Sans 3 (Regular × Bold, ponto final), blocos e botão com canto vivo, sem sombra nem gradiente (sem luz radial de fundo), arcos azul/branco como fundo dos painéis (deslizam, não giram), logo mono branco sobre azul, lettering "Revestindo possibilidades." com traço gancho, text labels colchete/sublinhado.
- Motion geométrico, sem bounce.
- Letterbox mantido como veio, com "!" (o guia da marca pede sem exclamação: perguntado ao usuário).
- Números do roteiro mantidos: 55 variações, mais de 4.500 clientes, cerca de 23 mil tapeceiros (pedir confirmação ao cliente; catálogo do Drive mostrava ~50 cores).
- Virada (máscara dos arcos, troca de trilha): "Com o Uruguai Original na prateleira".
- Fecho: logoSign (logo + lettering) → ctaButton "Saiba mais" + "e cadastre sua loja.".

## Inserts do Magnific (todos premium, filmagem real)
1 9665202 mostruário · 2 9002615 entrando na loja (alt 7918132) · 4 9711700 avental desconfiado · 5 9605471 porta de outra loja ·
6 9677998 mão na cabeça · 7 8543900 pacote no balcão · 12 9658542 rolos da fábrica · 13 7947589 aperto de mão ·
16 5954873 tapeceiro cortando · 20 alt 10031592 telefone · 21 7182299 dono de oficina ao telefone

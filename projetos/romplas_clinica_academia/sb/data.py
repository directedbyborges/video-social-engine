import json, os
H = os.path.dirname(os.path.abspath(__file__))
ins = json.load(open(os.path.join(H, 'inserts.json')))

D = {}
D['roteiro'] = ("Dono de loja de material para tapeçaria: o tapeceiro que compra com você também pega serviço de clínica, hospital e academia. "
  "Se a sua loja tiver o revestimento certo, essa venda é sua. Hoje, quando ele precisa de material para maca, cadeira de espera ou banco de aparelho, "
  "ele procura em outra loja. E aproveita para comprar o resto do pedido lá. A Romplas tem linha hospitalar, fácil de limpar e desinfetar, "
  "resistente a mancha e antiderrapante, e linha para academia. Você vende mais para o mesmo tapeceiro, sem precisar buscar cliente novo. "
  "Quem fabrica é a Romplas, a mesma indústria do Uruguai Original, que atende onze mercados diferentes e tem trinta e dois anos de mercado. "
  "Clique em Saiba Mais, faça o cadastro da sua loja e um especialista da Romplas entrará em contato para apresentar as linhas hospitalar e de academia.")
D['lede'] = ("O roteiro aprovado virou 29 cenas de até 2,5 s, com o design system da Romplas em cada tela. Aprove os quadros, baixe os inserts do Magnific "
  "e me diga a trilha: aí eu gero a narração, monto e renderizo o vídeo inteiro.")
D['facts'] = [
  ('Duração', '≈ 57 s · 29 cenas · 9:16 · 30 fps'),
  ('Hook', 'b-roll do tapeceiro + letterbox em box 3D'),
  ('Narração', 'ElevenLabs V4 · Carlos, gerada depois do OK'),
  ('Trilha', 'a definir: você manda a faixa'),
  ('Motion', 'geométrico, sem bounce (indústria)'),
  ('Tipografia', 'Source Sans 3 · Regular × Bold'),
  ('Cores', 'azul institucional, azul logo, azul apoio, cinza-claro, branco'),
  ('Fecho', 'logo + “Revestindo possibilidades.” → botão “Saiba mais” com cursor'),
]
D['marca'] = [
  'Uma família só, <b>Source Sans 3</b>, com o contraste da marca na mesma frase: trecho comum em Regular e a palavra que vende em <b>Bold</b>. Títulos com ponto final.',
  '<b>Canto vivo</b> em caixas, chips e botão (raio 0). O círculo fica só para o símbolo: os chips nascem como o “O” do logo e abrem em retângulo.',
  'Texto sobre foto sempre numa <b>faixa azul institucional</b>, como o design system pede (texto só em área calma ou em faixa azul). Sem gradiente e sem sombra; a profundidade vem da perspectiva da box 3D.',
  'Os <b>arcos</b> da marca são o fundo das telas de motion e viram a transição do clímax (cena 21 → 22): os discos deslizam para a direita e revelam a cena seguinte.',
  'Ícones de linha <b>do próprio toolkit</b> (hospitalar, halter e os 11 de mercado) entram desenhados em traço. Nenhuma biblioteca de ícones de fora.',
  'Os traços curvos do <b>lettering</b> e do <b>text label</b> são desenhados na tela (cenas 6, 10, 13, 18, 28). Assinatura com “Revestindo possibilidades.”',
  'Logo oficial em SVG, entrando peça por peça: mono branco sobre azul e fotos, principal sobre fundo claro.',
  'Letterbox adaptado à voz da marca: caixa-alta só no sobretítulo “LOJISTA,” e ponto final no lugar da exclamação (o design system pede sem “!”).',
  'Composição centralizada, que é o padrão do vídeo vertical; nos letterings o texto continua alinhado à esquerda dentro do bloco, como no toolkit.',
]
D['inserts'] = ins['rows']
D['inserts_by_scene'] = ins['by_scene']
D['inserts_note'] = ('Baixe pelo site, logado, em 1080p, numa pasta <code>magnific videos/</code> do projeto: pelo site entra na assinatura; pela API cada download cobra créditos à parte. '
  + ins.get('note', ''))
D['img_note'] = ('O Drive não tem foto da linha hospitalar nem da linha academia aplicadas. Estes prompts cobrem isso; cada um é um bloco só, para colar com a amostra anexada. '
  'Peça em 9:16. Se o cliente tiver foto real dessas linhas, ela entra no lugar.')
D['img_prompts'] = [
  {'titulo': 'A · Tapeceiro estofando uma maca', 'uso': 'Cena 1 (hook, atrás do letterbox). Substitui o insert do Magnific se ficar melhor: é a imagem mais fiel ao roteiro.',
   'anexo': 'amostra da <b>linha hospitalar</b> Romplas (pedir ao cliente). Na falta, uma amostra clara da pasta <i>Tecidos e Revestimentos</i> do Drive. Saída 9:16.',
   'texto': ("Vertical 9:16 photograph inside a small, tidy Brazilian upholstery workshop. In the center of the frame, an upholsterer in his forties wearing a dark navy apron "
             "stretches a sheet of light grey hospital-grade synthetic leather, with exactly the color and fine grain of the attached swatch, over the foam cushion of a "
             "medical examination table and fixes it with a pneumatic staple gun. His hands and the smooth cushion are sharply focused near the center, the table's steel "
             "frame clearly visible. Behind him, rolls of synthetic leather on a wall rack and a workbench with tools in soft focus. Soft daylight from a side window mixed "
             "with warm workshop light, natural and authentic, 35mm lens at chest height, photorealistic, keep the material identical to the reference swatch.")},
  {'titulo': 'B · Revestimento hospitalar: mancha e limpeza', 'uso': 'Cena 15 (“resistente a mancha e antiderrapante”). Hoje o quadro usa a amostra Nautiplas como provisório.',
   'anexo': 'amostra da <b>linha hospitalar</b> Romplas. Saída 9:16.',
   'texto': ("Vertical 9:16 macro photograph of a light grey hospital-grade synthetic leather cushion on a clinic examination table, with exactly the color and grain of the "
             "attached swatch. In the center, a few drops of water and a small coffee splash bead up on the smooth surface without soaking in, and a gloved hand wipes part "
             "of it clean with a white cloth, leaving the surface spotless. Fine grain texture visible under soft raking light, bright clinical room in soft focus behind, "
             "calm and clean, 85mm macro lens, photorealistic, keep the material identical to the reference swatch and centered in the frame.")},
  {'titulo': 'C · Bancos de academia com a linha Romplas', 'uso': 'Cena 16 (“e linha para academia”), se o insert do Magnific não mostrar bem o estofado.',
   'anexo': 'amostra da <b>linha academia</b> Romplas (pedir ao cliente) e, como referência de ambiente, <i>img-academia-romplas.webp</i> (Drive, Setores/academia). Saída 9:16.',
   'texto': ("Vertical 9:16 photograph of a modern gym with a padded flat bench in the center of the frame and two weight machines behind it, all upholstered in black "
             "synthetic leather with exactly the grain and soft sheen of the attached swatch, clean straight stitching and firm, smooth cushions, matching the look of the "
             "attached gym photo. Dark gym with cool overhead lights and a polished rubber floor, the bench sharply focused and centered, nobody in the scene, 35mm lens at "
             "knee height, photorealistic, keep the material identical to the reference swatch.")},
]
D['vid_prompts'] = [
  {'titulo': 'Sala de procedimento', 'uso': 'Cena 3 (“clínica”).', 'anexo': '<i>img-area-saude-romplas.webp</i> (Drive, Setores/hospitalar).',
   'texto': "Gentle slow push-in toward the upholstered treatment chair in the center of the bright clinic room, soft natural light from the window, calm and smooth camera movement, clean realistic atmosphere, keeping the chair and the room exactly as in the image and centered."},
  {'titulo': 'Academia', 'uso': 'Cena 4 (“academia”, metade de baixo).', 'anexo': '<i>img-academia-romplas.webp</i> (Drive, Setores/academia).',
   'texto': "Slow, subtle camera drift toward the padded gym bench in the center of the modern gym, cool natural light, almost static camera with a very slight forward movement, realistic and calm, keeping the equipment and upholstery identical to the image and centered."},
  {'titulo': 'Fachada da fábrica', 'uso': 'Cena 19 (“Quem fabrica é a Romplas”).', 'anexo': '<i>frente-ROMPLAS-NOVA2-scaled.webp</i> (Drive, Institucional e Fundos), em alta.',
   'texto': "Slow lateral dolly along the modern blue and white factory facade in the center of the frame, clear blue sky, bright natural daylight, smooth and steady movement, realistic atmosphere, keeping the building, the logo on the wall and the colors identical to the image and centered."},
]
D['decidir'] = [
  '<b>Trilha:</b> qual faixa? O roteiro tem virada em “A Romplas tem linha hospitalar” (cena 13): dá para usar duas faixas (dor → solução) com a troca ali, ou uma só. Na leva anterior este ângulo usava Icarus.',
  '<b>Narração:</b> gero com ElevenLabs V4 · Carlos, a mesma voz dos outros vídeos da Romplas, assim que você aprovar. Se preferir mandar o áudio, eu uso o seu.',
  '<b>Letterbox:</b> adaptei ao design system (caixa normal, ponto final, sem “!”). Se o cliente quer o texto exato em caixa-alta com exclamação, eu troco.',
  '<b>Produto real:</b> preciso de foto da linha hospitalar e da linha academia (amostra ou aplicada). As cenas 5 e 15 usam a cartela Uruguai Original® e a amostra Nautiplas só como provisório; a regra é mostrar o produto quando a narração fala dele.',
  '<b>Cena 12:</b> os chips “espuma, cola, grampo” representam o resto do pedido que vai para a outra loja. São esses os itens certos?',
  '<b>11 mercados (cena 21):</b> usei os 11 ícones de mercado do toolkit (fitness, estofados, automotivo, brindes, comunicação visual, móveis e cadeiras, hospitalar, embalagens, bolsas, náutico e proteção). Confirmar se são os 11 que a Romplas conta.',
  '<b>CTA:</b> botão “Saiba mais”, igual ao do anúncio, com “e cadastre sua loja.” abaixo. Ok?',
  '<b>Fotos em alta</b> da fachada (cena 19) e da equipe no showroom (cena 25): só tenho as versões pequenas. A foto da equipe não deve ser animada por IA (rostos reais); o motor faz só um push lento.',
  '<b>Duração:</b> o roteiro tem 143 palavras, cerca de 57 s com a assinatura e o CTA. Se o anúncio precisar ficar abaixo de 45 s, o texto tem que encolher.',
]
json.dump(D, open(os.path.join(H, 'page_data.json'), 'w'), ensure_ascii=False, indent=1)
print('ok')

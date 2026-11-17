# Romplas · Lojista, seu tapeceiro também reforma clínica e academia

## Receita
- **Design system:** artifact "Romplas" (tokens, README, componentes). Assets baixados em `brand/` (logo SVG oficial, símbolo, 11 ícones de mercado, arcos azul/branco, selos, Source Sans 3).
- **Storyboard aprovado:** https://claude.ai/artifact/QyW9JvEhEcssEDHmJczVXp (29 cenas no storyboard; 28 no vídeo, ver abaixo).
- **Narração:** ElevenLabs V4 · Carlos Alves (Magnific `audio_tts`, id 69), tags `[Brazilian Portuguese accent] [confident, warm voice]`, virada com `[confident, upbeat voice]`, CTA com `[warm, inviting voice]`. 47,9 s. Transcrição faster-whisper conferida: nenhuma tag lida, nenhuma palavra trocada.
- **Pausas inseridas** (`narracao/pads.json`): +0,25 s em 16,12 s, +0,20 s em 27,00 s, +0,25 s em 40,81 s, para as cenas 9, 15 e 22 não ficarem abaixo de 1,5 s. Narração final com pico em −3 dBFS (`narracao/narracao_final.wav`).
- **Motor:** modo sequência (`./vse.sh seq <video/> 4`). Página `video/seq.html` gerada por `video/build.py`; runtime `web/seq/seq.js` (câmera em 2 camadas, animações por `data-a`), render `web/seq/render.js`, mixagem `engine/seq_audio.py`.

## Decisões de marca (design system → vídeo)
- Source Sans 3 só; Regular × Bold na mesma frase; ponto final nos títulos.
- Canto vivo (raio 0) em caixas, chips e botão. Chips nascem como círculo (o "O" do símbolo) e abrem em retângulo.
- Texto sobre foto sempre em faixa azul institucional; sem gradiente, sem sombra.
- Arcos da marca como fundo das telas de motion (discos deslizando para a direita) e como máscara do clímax (cena 20 → 21).
- Ícones de linha do toolkit entrando em traço; logo peça por peça; assinatura "Revestindo possibilidades." com o traço gancho.
- Motion geométrico, sem bounce.
- Letterbox adaptado: "LOJISTA," em caixa-alta (sobretítulo), resto em caixa normal, ponto final no lugar do "!".

## Mudanças em relação ao storyboard
- A narração saiu mais rápida (47,9 s contra ~52 s estimados). "E aproveita para comprar" ficava com 1,1 s; juntei com "o resto do pedido lá" numa cena só (tela de chips espuma/cola/grampo saindo para a direita). O insert do balcão (sacola) saiu.
- Cena 10 (outra loja) com faixa azul em vez do text label, para não ficar sobre o corpo do homem.
- Cena 26 ("as linhas hospitalar e de academia") passou para o fundo azul com arcos: no branco a curva de energia ficou parada por 1,2 s. A assinatura (cena 27) foi para o fundo claro com o logo principal (ROM azul + PLAS preto).
- Cena 4 (hospital | academia): metades mais justas e foto da academia enquadrada nos bancos estofados.

## Entrega v1
- `entrega/Romplas_Lojista_ClinicaAcademia_v1.mp4` · 1080×1920 · 30 fps · 53,5 s · master −14,0 LUFS · true peak −2,5 dBTP.
- Transcrição do vídeo final conferida: todas as frases presentes, nenhuma tag lida.

## Provisório (trocar quando chegar)
- **Inserts do Magnific:** resolvido na v5 (clipes enviados pelo usuário, 720p).
- **Produto hospitalar/academia:** resolvido na v3 com as fotos de produto do site (ver v3).
- **Trilha:** resolvida na v2 (Radiant Momentum). Para trocar: `video/seq.json` → `music` (`file`, `ss`, `lufs`) e `./vse.sh seqaudio <video/>` (não re-renderiza imagem).

## Erros corrigidos
- `window.seek` devolvendo a timeline do GSAP: o Playwright travava serializando o objeto. Agora devolve `undefined`.

## v2 (ajustes pedidos no v1)
- Pedido: "algumas animações estão muito demoradas em relação à fala, entram depois e ficam pouco tempo na tela".
- Cortes 0,12 s antes da 1ª palavra de cada frase; cada elemento ancorado na palavra que mostra (entra 0,15 s antes dela), tempos do alinhamento do TTS.
- Entradas de ~0,45 s (antes 0,6–0,85 s), desfoque inicial 8 px; o texto fica parado até a troca seguinte (sem saída acelerada antes do corte).
- Ajustes do vídeo do Uruguai aplicados para o lote ficar igual: empurrão em todas as trocas (2 horizontais : 1 vertical), sem zoom de transição; máscara dos arcos atravessando da direita para a esquerda; logo com o "O" primeiro (cenas 18 e 27); textos centrados.
- Fundo vivo com o texto parado: deriva das fotos 1,00 → 1,08; metades da tela dividida deslizando em sentidos opostos.
- Trilha: "Radiant Momentum" (Magnific, Google Lyria 3 Pro, a mesma do vídeo do Uruguai Original), 53,5 s, ss 0, −27 LUFS sob a voz com ducking, final natural da faixa (sem fade longo).
- Entrega: `entrega/Romplas_Lojista_ClinicaAcademia_v2.mp4` · 53,5 s · −14,0 LUFS · true peak −2,5 dBTP.

## v3 (ajustes pedidos na v2)
- Cena 18 (fachada): foto grande (faixa de 1150 px, sem ampliar a original de 2560 px), enquadrada na placa ROMPLAS; "Quem fabrica é a" + logo numa faixa azul sobre a foto. Logo com o "O" primeiro começa na entrada da cena e fecha em ~1,0 s (antes saía incompleto).
- Traços (lettering, text label, ícones em trace) pulavam do nada: o GSAP arredonda `stroke-dashoffset` em px e o traço estava normalizado em 0–1. Agora `pathLength` 1000 no motor (vale para todo traço).
- Vistoria de fotos (ampliação sobre o tamanho na tela): fachada e equipe OK; sala de saúde e academia aceitáveis (1,2–1,35x); ruins: os 12 quadros de prévia do Magnific (720p, 1,7x), a cartela Uruguai (2,9x) e a amostra Nautiplas (5x).
- Trocadas por fotos reais de produto do site romplas.com.br (1600–1920 px): cena 5 = mosaico das linhas hospitalar e academia (LXR, Omega New, Dollaro, Bagun, Napa, Casco) em `fotos/p_mosaico.jpg`; cena 14 = LXR azul-claro (hospitalar) `fotos/p_lxr.jpg`; cena 19 = Uruguai Original marinho `fotos/p_uruguai.jpg`.
- Pendente: os 12 clipes do Magnific em 1080p (baixar pelo site, entra na assinatura; pela API ~600 créditos cada).
- Entrega: entrega/Romplas_Lojista_ClinicaAcademia_v3.mp4 · 53,5 s · −14,0 LUFS · true peak −2,5 dBTP.

## v4 (pedido: trocar as imagens 8 e 11 da lista de clipes)
- Cena 10 "ele procura em outra loja": era o 7918132 (senhor entrando numa lojinha). Agora 6781867, vendedor mostrando mostruário de tecidos a um cliente (real, premium): https://www.magnific.com/premium-video/customers-looking-fabric-samples_6781867 (usar só ~0–5 s; depois entra uma mulher no quadro).
- Cena 16 "você vende mais para o mesmo tapeceiro": era o 7947589 (aperto de mão numa floricultura). Agora 10087784, pagamento no caixa de uma loja de tecidos com mostruários (real, premium): https://www.magnific.com/premium-video/customer-making-contactless-payment-with-smartphone-fabric-store_10087784 ; box 3D subiu para a parte de cima da tela.
- Alternativas vistas: 7642524 (mercado de tecidos), 6969597 (senhora em loja de tecidos), 8966381 (alfaiate cortando tecido), 9570027 (vendedor desenrolando rolo na banca).
- Entrega: entrega/Romplas_Lojista_ClinicaAcademia_v4.mp4 · 53,5 s · −14,0 LUFS · true peak −2,5 dBTP.

## v5 (clipes do Magnific enviados pelo usuário em 3 levas)
- 12 clipes em 720×1280 (o usuário baixou em 720p) em `magnific_videos/`; trecho usado de cada um cortado em `clips/<chave>.mp4` (3,4 s, H.264 só com quadros-chave, para busca exata).
- Trechos: abertura 1,6 s (fita no assento) · artesão 3,2 s (depois que a moça sai) · hospital 2,0 · corte 6,0 · maca 1,0 · cadeiras 1,0 · banco de aparelho 0,0 (antes da toalha) · outra loja 0,5 (antes da moça entrar) · desinfetar 5,0 (spray no banco) · academia 9,0 (bancos vermelhos no centro) · pagamento 5,6 (celular na maquininha) · consultor 1,0.
- Motor: `<video class="clip">` no fundo das cenas; `window.seek` assíncrono posiciona cada clipe visível no quadro certo e só resolve com o quadro decodificado. `media()` no build usa o clipe se existir, senão a foto.
- Conferido: os 12 trechos em movimento (nenhum quadro parado), sem quadro preto.
- Entrega: entrega/Romplas_Lojista_ClinicaAcademia_v5.mp4 · 53,5 s · −14,0 LUFS · true peak −2,5 dBTP.

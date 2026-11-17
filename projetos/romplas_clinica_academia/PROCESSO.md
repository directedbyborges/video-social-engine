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
- **Inserts do Magnific:** entraram como foto parada (miniatura 720×1280 da página do item) com deriva lenta. Quando os clipes forem baixados em 1080p, trocar `photo('m_*')` por vídeo e re-renderizar.
- **Produto hospitalar/academia:** cenas 5 e 19 usam a cartela Uruguai Original®; cena 14 a amostra Nautiplas.
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

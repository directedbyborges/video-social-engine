# Romplas · Linha náutica HP — processo do lote

Storyboard aprovado: https://claude.ai/artifact/HthfyTLrVAzCPrKmKZyqhq (32 cenas, ~58 s, 9:16).
Design system: artifact "Romplas" (Source Sans 3, azul-institucional #2E507B, arcos, selos, letterings, CTA de canto vivo).

## Pastas
- `brand/` — logos (mono branco para fundo azul), arcos azul/branco, ícone de camadas do selo, fonte variável, `brand.json`.
- `magnific videos/` — clipes do Magnific baixados pelo site em 1080p, **com o número do item no nome** (ex.: `9665202.mp4`).
- `cliente/` — fotos do cliente: `hp.jpg` (cena 11), `hp_barco.jpg` (16), `uruguai.jpg` (23), `hp_close.jpg` (30). Sem elas o motor usa a amostra Nautiplas.
- `narracao/narracao.mp3` — narração do roteiro. `trilha/dor.mp3` (cenas 1–10) e `trilha/solucao.mp3` (a partir da 11).
- `video1/roteiro.py` — o storyboard no formato do motor (fonte da verdade). `spec.py` é gerado.
- `entrega/` — finais com nome descritivo.

## Receita (quando os arquivos chegarem)
```bash
python3 -I engine/transcribe.py projetos/romplas_hp/narracao/narracao.mp3 projetos/romplas_hp/video1/transcript.json
python3 engine/storyboard_spec.py projetos/romplas_hp/video1      # confere duração por cena (<= 2,5 s)
./vse.sh build projetos/romplas_hp/video1                           # confere timeline (cenas reais, sem pausas)
./vse.sh all projetos/romplas_hp/video1                             # render + auditoria
```
Conferir: `audit/folha_*.png`, `audit/cortes.png`, `audit/energia.txt`, loudness (alvo −14 LUFS, true peak ≤ −2 dBTP, voz com pico −3 dBFS).
Trilha: escolher `ss` de cada faixa fugindo de pausas; virada na cena 11 (`MUSIC.pivot = "@cena:11"`).

## Decisões
- Personalidade de motion **geométrica**: sem bounce; SNAP-IN (expo.out), ACCEL-OUT (expo.in), S-CURVE (power4.inOut).
- Legendas em **caixa azul-institucional**, canto vivo, destaque em Bold (contraste Regular × Bold da marca).
- Hook: letterbox em box 3D sobre b-roll (cenas 1–2), sem legenda de narração.
- Máscara dos arcos uma vez, na “nova linha náutica” (cena 21).
- CTA “Saiba mais” duas vezes: quando a narração manda clicar (cena 26) e no fechamento (32), com “Cadastre sua loja e conheça o HP.”
- Card de cadastro com dados de exemplo (Náutica Estofados, Itajaí · SC).

## Pendências do cliente
- Fotos/vídeos do HP (amostra, rolo, cartela, aplicado em barco) e do Uruguai Original; vídeo da fábrica, se houver.
- Narração e trilha.

## Teste do motor
Rodado com narração/trilha sintéticas e prévias com marca d'água em `video1/_provisorio/` (fora do git). Só para validar o motor; nada disso vai para a entrega.

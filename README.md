# video-social-engine

Motor de edição de vídeo vertical (9:16) com motion para redes sociais e anúncios, operado pelo Claude através da skill `edicao-video-social`.

- `engine/transcribe.py` — Whisper local (sherpa-onnx), tempo por palavra
- `engine/brand.py` — análise do logo: paleta, símbolo, traço, comparação de famílias de ícones
- `engine/icons.py` — banco de ícones livres (Tabler, Phosphor, Lucide, Iconoir, Fluent Emoji 3D) com busca e folha visual
- `engine/build.py` — spec → timeline (cortes, legendas, painéis, ênfases, final)
- `web/` — legendas e cenas em HTML/GSAP com o tema da marca, render em PNG transparente (Playwright)
- `engine/composite.py` — cor, jump cut/zoom, tela dividida, b-roll, texto atrás da pessoa (RobustVideoMatting), flashes, transição, card final, áudio com efeitos e trilha
- `engine/audit.py` — folhas de contato, quadros de corte, curva de energia, loudness
- `sfx/` — efeitos sonoros e catálogo (`sfx.json`)

Uso: `./setup.sh` e depois `./vse.sh all <pasta_do_projeto>`. Ver `SKILL.md`.

Licenças dos bancos de ícones: Tabler (MIT), Phosphor (MIT), Lucide (ISC), Iconoir (MIT), Fluent Emoji (MIT). RobustVideoMatting (GPL-3.0, usado como modelo baixado em tempo de execução).

## Novidades (lote Romplas)

- `engine/storyboard_spec.py` — gera o `spec.py` a partir do storyboard aprovado (`<proj>/roteiro.py`) + transcrição: cada cena diz quais palavras cobre, o tempo sai da narração real. Parâmetros `"@w:palavra"` viram o tempo em que a palavra é dita; `"@cena:11"` o início da cena 11.
- **B-roll** (`composite.py`): vídeo ou foto, `focus` [x,y] + `scale` para reenquadrar no centro, `tin`/`tout` (zin, zout, panL, panR, panU, panD) com entrada expo.out e saída expo.in (pico no corte), `mz` (zoom do meio), `dim`, desfoque de movimento perto do corte, cor tratada por clipe, cache em `<proj>/_broll`.
- **Painéis**: `bg` none (motion transparente sobre o b-roll) | azul | arcos | arcosBranco | branco | cinza; `enter: "cut"`; por cena `cin`/`cout`/`zoom` (duas camadas: transição ~0,8 s no início/fim e zoom do meio ~13% centrado).
- **Cenas de marca** (`scenes.js`): `box3d`, `lettering`, `rotulo` (sublinhado/colchete), `selos`, `bigWords` (letra por letra, traço sob a linha, traço riscando), `statBig`, `seloBig`, `form`, `logoSign`, `ctaButton` (cursor clicando).
- **Legendas em caixa** (`captions.box` no brand.json): caixa abre do centro, linhas sobem uma a uma; `@until=<tempo>` e `@out=<transição>` fazem a legenda sair junto com a cena.
- **Máscara da marca** (`masks: [tempo]`): discos dos arcos varrem a tela uma vez.
- **Final em sequência** (`end.scenes`): assinatura e CTA depois da narração, tempos relativos à cena.
- **Áudio**: voz comprimida e normalizada com pico em −3 dBFS; master medido e levado a −14 LUFS com limitador em −2,5 dBFS (true peak ≤ −2 dBTP); trilha com início por faixa (`ss`, `intro_ss`, `main_ss`).

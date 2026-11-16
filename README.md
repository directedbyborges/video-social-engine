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

## Modo sequência (vídeo narrado, sem pessoa falando)

Para vídeos feitos de b-roll + telas de motion sobre uma narração, o projeto gera uma página `seq.html` com uma `<section class="scene">` por cena (`.cam > .bg + .sw`) e `window.SEQ = {fps, end, scenes:[{id,t0,t1,tin,tout,zoom}], mask}`.

- `web/seq/seq.js` — runtime (GSAP): câmera em duas camadas (transição de entrada/saída em `.cam` com pico no corte e motion blur direcional; zoom do meio em `.sw`), animações declaradas por `data-a` (`box3d`, `box`, `words`, `lines`, `lett`, `rotulo`, `trace`, `pieces`, `chipL/chipR`, `count`, `grid`, `grow`, `cta`, `form`, `halfTop/halfBot`), máscara dos arcos no clímax e registro de eventos sonoros (`data-sfx`, cortes, clique do CTA).
- `web/seq/render.js` — quadro a quadro via `window.seek(t)` → ffmpeg (H.264).
- `web/seq/events.js` — exporta eventos sonoros e duração.
- `engine/seq_audio.py` — narração + efeitos do catálogo + trilha opcional com ducking; master em −14 LUFS e true peak ≤ −2 dBTP.

`./vse.sh seq <proj> [n]` renderiza em n processos, mixa, faz o mux e roda a auditoria. `./vse.sh seqaudio <proj>` refaz só o áudio (ex.: trilha nova). O `<proj>/seq.json` informa `narration`, `music` (`{file, ss, gain_db}` ou `null`) e `sfx_gain`.

Licenças dos bancos de ícones: Tabler (MIT), Phosphor (MIT), Lucide (ISC), Iconoir (MIT), Fluent Emoji (MIT). RobustVideoMatting (GPL-3.0, usado como modelo baixado em tempo de execução).

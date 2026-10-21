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

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

## Modo seq (vídeo narrado em sequência de cenas)

Para vídeo narrado (TTS) em que cada cena é fundo + texto na mesma câmera: `SPEC["seq"]` com uma cena por trecho (≤ 2,5 s) e `"cut": {"keep_all": True}`.

- Fundo: `{"clip": "clips/sNN", "still": "img/x.jpg", "src": ["magnific videos/*ID*"], "fx", "fy", "scale", "dim"}`, foto `{"img": ...}`, cor da marca `{"solid": "azul", "arcos": "azul"}` ou mosaico `{"imgs": [...]}`.
- Tipos (`web/src/seq.js`): `txt` (faixa, solto, box 3D, ícone, número animado com `#`, traço de lettering, text label), `layers`, `selo`, `logo`, `photo`, `form`, `split`, `logoSign`, `cta`.
- Câmera em duas camadas: transição de entrada/saída (`cout`: zin, zout, panR, panL, panU, panD, mask) e zoom do meio (`zoom`: in/out).
- `python3 -I tools/clip_frames.py <proj>` extrai os quadros dos clipes (reenquadrados, sem cortes internos, chroma key opcional); `node tools/peek_seq.js <proj>` e `node tools/peek_times.js <proj> saida.jpg t1 t2 ...` conferem quadros sem renderizar; `tools/transcrever_narracao.py` transcreve com faster-whisper.

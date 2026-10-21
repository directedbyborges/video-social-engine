---
name: edicao-video-social
description: Edita vídeos verticais para redes sociais e anúncios com motion da marca: hook, jump cuts com zoom, legendas, tela dividida, tela cheia, texto atrás da pessoa, cor, trilha em dois atos e efeitos sonoros.
---

# Edição de vídeo vertical com motion (redes sociais e anúncios)

O motor fica no repositório privado **`directedbyborges/video-social-engine`** (clonar, nunca reescrever o código do zero).
A skill `motion-design` complementa esta: carregue-a quando for criar uma cena de motion nova (curvas, cortes de câmera, tempo de leitura).

## 0. Antes de editar: materiais (perguntar o que faltar)

Peça numa mensagem só, antes de qualquer render:
1. **Identidade visual**: logo (SVG de preferência, senão PNG com fundo transparente, versão clara e escura), cores, fontes (nome ou arquivo), manual se houver. **Sem identidade visual, não anime: peça.**
2. **Elementos do cliente**: imagens de produto com fundo transparente, imagens ambientadas, fotos da pessoa, ícones/ilustrações próprios, animações de elementos da marca (ex.: retângulo do logo animado), transição da marca (.mov com alfa) e tela final.
3. **Referências** de edição que o cliente gosta.
4. Quantos vídeos e se é para **anúncio** (variar hooks) ou conteúdo.
5. **Trilhas**: se a biblioteca `music/` estiver vazia, peça o pacote de músicas do usuário organizado por clima.

Se o usuário disser para seguir sem algum item, siga e diga no fim o que ficou genérico por falta dele.

## 1. Setup (uma vez por sessão)

O repositório é privado: anexe-o à sessão com a ferramenta de adicionar repositório (owner `directedbyborges`, repo `video-social-engine`) e clone com o comando que ela devolver; depois `./setup.sh`. Se não houver acesso, peça ao usuário para conectar o GitHub. Nunca recrie o motor do zero.
Python com `-I` ao processar arquivos baixados. Cada vídeo é uma pasta de projeto: `spec.py` + `transcript.json` + saídas. Vídeos do mesmo lote ficam em pastas irmãs (mesma pasta-mãe).

## 2. Identidade visual primeiro (o mais importante)

O que faz a edição parecer "feita por IA" é visual genérico: ícones de uma família qualquer, cards brancos padrão, ciano/roxo que não é da marca, nenhuma forma do cliente. Corrija isso antes de tudo.

1. Rode `python3 engine/brand.py logo.svg [outras_peças.png] --out <brand>/` e **olhe o `board.png`**: paleta, símbolo recortado, espessura do traço e as famílias de ícones na cor da marca lado a lado.
2. Monte `<brand>/brand.json` (modelo em `examples/brand.json`). Decisões que você precisa tomar olhando o board e as peças:
   - **Família de ícones** que conversa com o símbolo: traço fino e elegante → `phosphor-thin/light`; traço médio arredondado → `tabler` (ajuste `icons.stroke` ao `suggested_tabler_stroke`) ou `phosphor-regular`; traço grosso/arredondado → `phosphor-bold`; sólido/geométrico → `phosphor-fill`/`tabler-filled`; marca ilustrada/3D, varejo, B2B didático → `fluent3d` (ícones 3D). Uma família por vídeo.
   - **Device de destaque** (`captions.keyword`): a forma que a marca usa para chamar atenção. `pill` (pílula), `frame` (moldura com o raio/traço do logo, ex.: Bolivar), `lines` (linhas acima/abaixo, ex.: o text label da Aurus), `marker` (marca-texto inclinado), `scribble` (círculo à mão), `color`. Tire isso do manual/peças; se não houver, derive do logo (moldura do logo → `frame`; logo com linhas → `lines`).
   - **Fontes**: as da marca (`fontsource` ou arquivo). Título condensado se a marca é condensada; não troque por Poppins por hábito.
   - **Raio** (`shape.radius`) e fundo do painel (`panel.fill`, CSS) coerentes com as peças.
   - Escreva em `devices` (texto) quais formas da marca você vai reaproveitar: símbolo como elemento (moldura, brilho, padrão, máscara de transição), grafismos, texturas.
3. **Buscar ícones/formas**: `python3 engine/icons.py search "money,coin,wallet" --libs phosphor-bold,fluent3d --color "#HEX" --bg "#HEX"` → abre a folha PNG e escolhe por olho. Termos em inglês. Bancos: Tabler (~4.900), Phosphor (1.500 × 6 pesos), Lucide, Iconoir, Fluent Emoji (3D/flat/color, ~1.600). Ref no spec: `phosphor-bold:shield-check`, `fluent3d:money-bag`, `brand:symbol`, `brand:logo`, `file:caminho.svg|png`.
4. Checklist anti-genérico (toda cena passa por ele):
   - Tem pelo menos um elemento que só esta marca teria (símbolo, forma, foto/produto do cliente, device)?
   - Ícones todos da mesma família e peso do símbolo?
   - Cores só da paleta (fundo, tinta, destaque)? Nada de cor "bonita" fora dela.
   - Material do cliente usado antes de ícone genérico?

## 3. Transcrição e roteiro de edição

1. `python3 -I engine/transcribe.py bruto.mov <proj>/transcript.json` (Whisper local; tempo por palavra estimado).
2. Leia a transcrição: marque takes errados/repetidos (`cut.remove`), a última palavra útil (`cut.end_word`), o hook e a **virada** (momento em que sai da dor/desejo e passa a falar da empresa/método/solução → `music.pivot`).
3. Escreva o `spec.py` (modelo comentado em `examples/spec_exemplo.py`). Para vídeos com mais de 30 s ou lote, mostre a tabela (hook escolhido, momentos de tela dividida/cheia, destaques, virada da trilha) ao usuário antes do render completo.

### Curva de ritmo (obrigatória)
| Trecho | Tempo | O que acontece |
|---|---|---|
| **Hook** | 0–3 s (até ~6 s) | Algo se move no 1º meio segundo. Letra grande (`@hook` + linha `^`), impacto sonoro, 1–2 eventos por segundo |
| **Desenvolvimento** | até ~45% | Mais leve para explicar: legendas, jump cuts, 1 zoom de ênfase a cada 4–6 s, destaque de palavra |
| **Aceleração** | ~45–70% | Tela cheia ou dividida com motion, cenas de 2–3 s, pílulas, flash, b-roll. Contraste com o trecho anterior |
| **Prova/oferta** | até o CTA | Número, garantia, logo (`@logo`) |
| **CTA + final** | últimos 3–7 s | CTA grande, transição da marca, card final. **A fala do apresentador vai até o fim do take** (`tail_audio`), por baixo da transição |

### Hooks (variar entre vídeos do mesmo lote)
- **A. Letra grande na cara**: `@hook` com linha `^` e destaque; zoom de ênfase.
- **B. Texto atrás da pessoa**: `@behind @y=NNN ^PALAVRA`. Só funciona com espaço acima/ao lado da cabeça (plano médio). Confira um quadro antes.
- **C. Tela dividida**: painel `split` desde 0 s, motion em cima e pessoa embaixo; legenda centralizada na divisória.
- **D. Só motion**: painel `full` nos primeiros 2–4 s (a fala continua), depois revela a pessoa.
- **E. B-roll**: imagem do cliente cobrindo a tela no hook, com a fala por cima.
Em lote de anúncios, nunca repita o mesmo tipo de hook em dois vídeos seguidos.

## 4. Spec: referência rápida

```python
SPEC = {
 "src": "bruto.mov", "brand": "../brand/brand.json", "transcript": "transcript.json",
 "cut": {"pre": .12, "post": .15, "pad": {3.42: .5}, "remove": [[12.3, 14.1]], "end_word": ("cadastro", 50.9), "tail_audio": True},
 "grade": "natural",            # natural | punchy | warm | cool | cine | none | dict
 "captions": ["@hook Você entende / ^*INGLÊS*", "o problema é o / [medo de errar]", "@pills ^PODE GERAR: / reposição / atraso"],
 "panels": [{"mode": "split"|"full", "start": 3.9, "end": 11.3, "scenes": [{"type": "checklist", "t": 3.9, ...}]}],
 "emphasis": "auto",            # ou [{"at": 12.1, "amount": .1, "dur": 1.4}]
 "flash": [{"at": 18.8, "type": "flash"|"invert"|"leak"}],
 "broll": [{"start": 20, "end": 23, "file": "fabrica.mp4", "ss": 0, "zoom": .06}],
 "end": {"transition": "transicao.mov", "card": "tela_final.mp4"},   # ou "card_scene": {"type": "endCard", "cta": "..."}
 "music": {"intro": "dor", "main": "solucao", "pivot": 14.6, "level": -30},  # trilha em 2 atos (ver §5)
 "sfx": {"auto": True, "gain": -3, "extra": [["whoosh_low", 12.0]], "mute": ["big_word"]},
}
```
Tempos do spec = tempos do vídeo **bruto** (o motor converte após os cortes).

**Legendas** (uma ideia por grupo, 2–3 linhas): `/` quebra linha · `^` linha grande · `*palavra*` cor de destaque · `[palavras]` device da marca · flags no início: `@hook` (maior), `@logo` (logo acima), `@pills` (linhas viram pílulas empilhadas), `@behind` (atrás da pessoa), `@top`, `@bottom`, `@y=NNN`.

**Cenas** (área 1080×960; em `full` ganham `title`): `checklist`, `orbitChips` (símbolo no centro + chips), `pillars` (2–3 cards com ícone), `weeks` (etapas enchendo), `shield` (garantia/carimbo + moedas), `careerCeiling` (gráfico batendo no teto), `meeting` (videochamada), `coursesCross` (cards riscados), `bookQuestion`, `listenSpeak` (ok × travado), `chatLock` (balão digitando que trava), `unlock` (cadeado abrindo), `logoReveal`, `bigType` (tipografia cinética), `iconHero` (ícone 3D/linha + título), `stat` (número contando), `compare` (perde × ganha), `endCard`. Parâmetros: ver o topo de cada cena em `web/src/scenes.js`. Cena nova: escreva em `scenes.js` seguindo o padrão (html, sfx, build) e a skill `motion-design`.

## 5. Regras de edição (números)

- **Cortes de fala**: silêncio cortado com 0,12 s antes e 0,15 s depois. Cada corte alterna o zoom (1,00 / 1,13 / 1,04 / 1,17) com leve deriva de +3% no trecho.
- **Zoom de ênfase**: +10–12% suave, entra (~0,45 s), segura e volta (total ~1,4 s), nas frases de impacto; mínimo de 3,5 s entre um e outro. `auto` usa as linhas `^`.
- **Legenda**: 52–60 px peso 700; linha grande 100–130 px (hook ~135 px); palavra por palavra (0,4 s, blur + subida); máximo 3 linhas e 2 fontes. Posição: peito (y≈1180) em tela cheia, **centralizada na divisória** (y=960) na tela dividida, y≈1640 sobre painel cheio. Nada abaixo de y≈1700 (interface do Reels/TikTok) e margem lateral ≥ 60 px.
- **Tela dividida**: motion em cima (1080×960), pessoa embaixo enquadrada pelo rosto, linha da marca na divisória; entra com o painel descendo (0,6 s) e sai subindo (0,45 s).
- **Tela cheia**: painel sobe da base; use na aceleração do meio e para informação que precisa da tela toda.
- **Tratamento de cor**: `natural` (contraste +6%, saturação +10%, sombras levantadas, balanço de branco automático a 60%) por padrão; `punchy` para anúncio agressivo; `warm`/`cool`/`cine` conforme a marca.
- **Trilha (sempre que houver biblioteca)**: em dois atos que seguem o roteiro. `intro` acompanha a dor/desejo do começo; na **virada** (`pivot` = tempo no bruto em que a fala passa a falar da empresa, do método ou da solução; ache na transcrição) entra `main` com crossfade de ~1,6 s e um riser bem baixo. Climas = pastas de `music/` (`dor`, `desejo`, `solucao`, `energia`, `neutro`); roteiro que abre com desejo usa `intro: "desejo"`. Com uma faixa só: `{"file": ..., "pivot": ...}` (antes da virada ela vem abafada e abre na virada). Volume em LUFS (`level` −30 padrão; −27 mais presente, −33 discreta) e ducking automático sob a voz. **Lote**: as faixas são sorteadas sem repetir entre os vídeos da mesma pasta-mãe (registro em `_lote_musicas.json`); rebuild do mesmo vídeo mantém a escolha. Música nova na biblioteca: copie para a pasta do clima e rode `python3 engine/music.py scan`. Só use música com licença do usuário (pacote dele); não baixe de sites aleatórios.
- **Efeitos sonoros** (automáticos pelos eventos): whoosh em entradas/saídas de painel e troca de cena, impacto no hook, clique em linha grande, pop em chips/ícones, check em itens, carimbo em selos, flash em flash, riser antes de revelação, subdrop na marca. Mínimo de 0,18 s entre efeitos. Nada de efeito em toda palavra. Ajuste o volume geral com `sfx.gain`; silencie um tipo com `sfx.mute`. Catálogo: `sfx/sfx.json`.

## 6. Render e auditoria

```bash
./vse.sh preview <proj> 0 6     # hook: confira antes de tudo (envie ao usuário e siga)
./vse.sh all <proj>             # completo + auditoria
./vse.sh final <proj>           # só recompõe (mudou cor, áudio, trilha, sfx, final) — não re-renderiza gráficos
```
Olhe `audit/folha_*.png` e `audit/cortes.png`; leia `audit/energia.txt` (janela < 0,25 = parado) e o loudness (alvo ≈ −14 LUFS). Confira: legenda não cobre boca na tela dividida, texto atrás da pessoa legível, nenhum quadro vazio após corte, fala do apresentador até o fim, ritmo com contraste hook/meio, virada da trilha no lugar certo.

**Economia de token**: olhe folhas de contato pequenas (200 px) e só amplie o quadro que levantar dúvida; use `preview` no trecho alterado; `final` quando o ajuste não mexe em gráfico.

## 7. Entrega

Envie os MP4 (1080×1920, 30 fps). Diga em poucas linhas: hook e trilhas usados em cada vídeo, o que ficou genérico por falta de material e o que pode ser ajustado. Ajustes pedidos: mude o spec e rode só o necessário.

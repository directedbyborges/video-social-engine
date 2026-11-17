import json, os, html
H = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(H, 'scenes.json')))
D = json.load(open(os.path.join(H, 'page_data.json')))
e = html.escape

def md(t):
    import re
    return re.sub(r'\*([^*]+)\*', r'<b>\1</b>', e(t))

SRC = {'MAG': 'mag', 'CLIENTE': 'cli', 'MOTION': 'mo', 'IA': 'ia'}
def tag(src):
    out = []
    for part in src.replace(' ', '').split('+'):
        for p in part.split('/'):
            k = SRC.get(p, 'mo'); out.append(f'<span class="src {k}">{e(p)}</span>')
    return ''.join(out)

OUT = {'zin': 'zoom in', 'zout': 'zoom out', 'panR': 'pan → direita', 'panL': 'pan ← esquerda', 'panU': 'pan ↑ cima',
       'panD': 'pan ↓ baixo', 'máscara': 'máscara dos arcos (clímax)', 'fim': 'assenta e encerra'}

cards = []
for s in S:
    n = s['n']
    ins = D['inserts_by_scene'].get(str(n))
    insl = f'<a href="{e(ins["url"])}" target="_blank" rel="noopener">Insert no Magnific ↗</a>' if ins else ''
    cards.append(f'''<article class="card" id="c{n:02d}">
  <div class="shot"><img src="kf/f{n:02d}.jpg" alt="Cena {n}" loading="lazy" width="432" height="768">
    <span class="badge">{n:02d} · {s["t0"]:.1f}–{s["t1"]:.1f} s</span><span class="tags">{tag(s["src"])}</span></div>
  <div class="ficha">
    <p class="nar">“{e(s["nar"])}”</p>
    <dl><dt>Tela</dt><dd>{md(s["txt"])}</dd><dt>Visual</dt><dd>{e(s["vis"])}</dd>
    <dt>Motion</dt><dd>{e(s["forma"])}</dd><dt>Saída</dt><dd>{e(OUT.get(s["out"], s["out"]))} · {s["dur"]:.1f} s</dd></dl>
    {insl}
  </div></article>''')

ins_rows = ''.join(f'''<tr><td class="num">{e(r["cena"])}</td><td><i>“{e(r["trecho"])}”</i></td><td>{e(r["mostra"])}{' <span class="pill">alternativa</span>' if r.get("alt") else ''}</td>
<td>{e(r["tipo"])}</td><td><a href="{e(r["url"])}" target="_blank" rel="noopener">abrir ↗</a></td></tr>''' for r in D['inserts'])

def prompt_card(p, i, kind):
    return f'''<div class="prompt"><div class="ph"><h3>{e(p["titulo"])}</h3><button class="copy" type="button" data-t="{kind}{i}">Copiar</button></div>
<p class="use">{e(p["uso"])}</p><pre id="{kind}{i}">{e(p["texto"])}</pre>
<p class="att"><b>Anexar:</b> {p["anexo"]}</p></div>'''

img_prompts = ''.join(prompt_card(p, i, 'ip') for i, p in enumerate(D['img_prompts']))
vid_prompts = ''.join(prompt_card(p, i, 'vp') for i, p in enumerate(D['vid_prompts']))
decide = ''.join(f'<li>{x}</li>' for x in D['decidir'])
marca = ''.join(f'<li>{x}</li>' for x in D['marca'])
facts = ''.join(f'<div><b>{e(k)}</b><span>{v}</span></div>' for k, v in D['facts'])
total = S[-1]['t1']

page = f'''<title>Romplas Clínica e Academia</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap">
<style>
/* Folha de produção na marca Romplas: faixa azul institucional no topo, ficha por cena em grade, depois inserts, prompts e decisões. Canto vivo como no design system. */
:root{{
  --bg:#F1F1F1; --surface:#FFFFFF; --fg:#201D1D; --muted:#4F5A6B; --line:#D7D8D9;
  --brand:#2E507B; --brand-2:#476D9E; --stroke:#617DAE; --on-brand:#FFFFFF; --soft:#E4EAF2;
  --warn:#8A5300; --warn-soft:#FFF1D9;
  --mag:#2E507B; --cli:#1F6E52; --ia:#7A4AA8; --mo:#4A5566;
  --sans:"Source Sans 3","Source Sans Pro",Arial,sans-serif;
}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{
  --bg:#10161F; --surface:#18212E; --fg:#E7ECF3; --muted:#9BA7B8; --line:#2A3647;
  --brand:#24446B; --brand-2:#8FADDB; --stroke:#8FADDB; --on-brand:#FFFFFF; --soft:#1E2B3D;
  --warn:#F2B566; --warn-soft:#2D2416; color-scheme:dark}}}}
:root[data-theme="dark"]{{
  --bg:#10161F; --surface:#18212E; --fg:#E7ECF3; --muted:#9BA7B8; --line:#2A3647;
  --brand:#24446B; --brand-2:#8FADDB; --stroke:#8FADDB; --on-brand:#FFFFFF; --soft:#1E2B3D;
  --warn:#F2B566; --warn-soft:#2D2416; color-scheme:dark}}
*{{box-sizing:border-box}}
body{{background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:17px;line-height:1.55}}
.wrap{{max-width:1200px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
h1,h2,h3{{margin:0;text-wrap:balance;letter-spacing:-.015em}}
p{{margin:0}} a{{color:var(--brand-2)}} a:focus-visible,button:focus-visible{{outline:2px solid var(--brand-2);outline-offset:2px}}
header.hero{{background:var(--brand);color:var(--on-brand);padding-block:40px 36px}}
header.hero .wrap{{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px;align-items:start}}
@media (max-width:860px){{header.hero .wrap{{grid-template-columns:1fr}}}}
.eyebrow{{font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;opacity:.85}}
h1{{font-size:clamp(30px,4.6vw,52px);font-weight:400;line-height:1.02;margin-top:10px}}
h1 b{{font-weight:700}}
.lede{{margin-top:16px;max-width:60ch;opacity:.92}}
.facts{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.22)}}
.facts div{{background:var(--brand);padding:12px 14px;min-width:0}}
.facts b{{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;font-weight:600}}
.facts span{{font-weight:600;font-size:15.5px}}
main .wrap{{display:flex;flex-direction:column;gap:48px;padding-block:36px 72px}}
section{{display:flex;flex-direction:column;gap:16px;scroll-margin-top:64px}}
h2{{font-size:clamp(24px,3vw,32px);font-weight:400}} h2 b{{font-weight:700}}
.sub{{color:var(--muted);max-width:75ch}}
nav.jump{{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding-block:10px}}
body::before{{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}}
nav.jump .wrap{{display:flex;flex-wrap:wrap;gap:8px}}
nav.jump a{{font-weight:600;font-size:14px;text-decoration:none;color:var(--fg);padding:6px 12px;border:1px solid var(--line);background:var(--surface)}}
nav.jump a:hover{{border-color:var(--brand-2);color:var(--brand-2)}}
.script{{background:var(--surface);border:1px solid var(--line);padding:16px 18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}}
.script pre{{margin:0;white-space:pre-wrap;font-family:var(--sans);font-size:17px}}
button.copy{{font-family:var(--sans);font-weight:700;font-size:14px;border:2px solid var(--brand-2);color:var(--brand-2);background:transparent;padding:6px 12px;cursor:pointer}}
button.copy:hover{{background:var(--brand-2);color:var(--surface)}}
.marca{{margin:0;padding-left:20px;display:grid;gap:6px;max-width:90ch}}
.legend{{display:flex;flex-wrap:wrap;gap:10px 18px;font-size:14px;color:var(--muted);align-items:center}}
.src{{font-size:10.5px;font-weight:800;letter-spacing:.06em;color:#fff;padding:2px 6px}}
.src.mag{{background:var(--mag)}} .src.cli{{background:var(--cli)}} .src.ia{{background:var(--ia)}} .src.mo{{background:var(--mo)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:18px}}
.card{{background:var(--surface);border:1px solid var(--line);display:flex;flex-direction:column;min-width:0}}
.shot{{position:relative;aspect-ratio:9/16;max-width:100%;background:#1b2330}}
.shot img{{width:100%;height:100%;object-fit:cover;display:block}}
.badge{{position:absolute;top:8px;left:8px;background:rgba(14,20,30,.78);color:#fff;font-size:12.5px;font-weight:700;padding:3px 7px;font-variant-numeric:tabular-nums}}
.tags{{position:absolute;top:8px;right:8px;display:flex;gap:4px}}
.ficha{{padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.4}}
.nar{{font-style:italic}}
.ficha dl{{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px}}
.ficha dt{{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:3px}}
.ficha dd{{margin:0}}
.ficha a{{font-weight:700;font-size:14px}}
.table-wrap{{overflow-x:auto;border:1px solid var(--line);background:var(--surface)}}
table{{border-collapse:collapse;width:100%;min-width:720px;font-size:15px}}
th,td{{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}}
th{{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}}
td.num{{font-variant-numeric:tabular-nums;font-weight:700}}
tr:last-child td{{border-bottom:0}}
.pill{{font-size:11px;font-weight:700;padding:1px 6px;background:var(--soft);color:var(--brand-2)}}
.prompts{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,520px),1fr));gap:16px}}
.prompt{{background:var(--surface);border:1px solid var(--line);padding:16px;display:flex;flex-direction:column;gap:10px;min-width:0}}
.prompt .ph{{display:flex;justify-content:space-between;gap:12px;align-items:center}}
.prompt h3{{font-size:18px;font-weight:700}}
.prompt .use{{color:var(--muted);font-size:14.5px}}
.prompt pre{{margin:0;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;background:var(--bg);padding:12px}}
.prompt .att{{font-size:14.5px}}
.alert{{background:var(--warn-soft);border-left:3px solid var(--warn);padding:14px 16px;display:flex;flex-direction:column;gap:6px}}
.alert h3{{color:var(--warn);font-size:17px}}
.alert ol,.alert ul{{margin:0;padding-left:20px;display:grid;gap:6px}}
@media (prefers-reduced-motion:reduce){{*{{transition:none!important}}}}
</style>

<header class="hero"><div class="wrap">
  <div>
    <span class="eyebrow">Romplas · storyboard para aprovação · nada renderizado ainda</span>
    <h1>Lojista, seu tapeceiro também reforma <b>clínica e academia.</b></h1>
    <p class="lede">{D["lede"]}</p>
  </div>
  <div class="facts">{facts}</div>
</div></header>

<nav class="jump" aria-label="Seções"><div class="wrap">
  <a href="#roteiro">Roteiro</a><a href="#cenas">Cenas</a><a href="#inserts">Inserts Magnific</a><a href="#imagens">Imagens para gerar</a><a href="#animar">Animar fotos</a><a href="#decidir">Pra você decidir</a>
</div></nav>

<main><div class="wrap">
<section id="roteiro">
  <h2>Roteiro <b>para a narração</b></h2>
  <p class="sub">O texto aprovado, só com números por extenso e sem o ® para a voz ler certo. {len(" ".join(x["nar"] for x in S if x["nar"] != "(trilha)").split())} palavras, cerca de {S[-3]["t1"]:.0f} s de fala.</p>
  <div class="script"><pre id="roteiroTxt">{e(D["roteiro"])}</pre><button class="copy" type="button" data-t="roteiroTxt">Copiar</button></div>
</section>

<section id="marca">
  <h2>Como o design system <b>entrou no vídeo</b></h2>
  <ul class="marca">{marca}</ul>
</section>

<section id="cenas">
  <h2>{len(S)} cenas · <b>{total:.0f} s</b></h2>
  <p class="sub">Tempos estimados pela leitura; com a narração gerada eles encolhem alguns décimos e eu ajusto os cortes. Nenhuma cena passa de 2,5 s. Quadros montados com os arquivos do design system (logo, ícones, arcos, Source Sans 3) e as fotos do Drive; os cinzas com nome são inserts do Magnific que ainda não foram baixados.</p>
  <div class="legend"><span><span class="src mag">MAG</span> insert do Magnific (você baixa)</span><span><span class="src cli">CLIENTE</span> foto do Drive/site</span><span><span class="src ia">IA</span> imagem a gerar (prompt abaixo)</span><span><span class="src mo">MOTION</span> tela feita no motor</span></div>
  <div class="grid">{"".join(cards)}</div>
</section>

<section id="inserts">
  <h2>Inserts <b>do Magnific</b></h2>
  <p class="sub">{D["inserts_note"]}</p>
  <div class="table-wrap"><table><thead><tr><th>Cena</th><th>Trecho</th><th>O que mostra</th><th>Tipo</th><th>Link</th></tr></thead><tbody>{ins_rows}</tbody></table></div>
</section>

<section id="imagens">
  <h2>Imagens <b>para gerar</b></h2>
  <p class="sub">{D["img_note"]}</p>
  <div class="prompts">{img_prompts}</div>
</section>

<section id="animar">
  <h2>Animar as fotos <b>do cliente</b></h2>
  <p class="sub">Imagem → vídeo (Kling, Omni Flash ou similar). Movimento lento e simples; a foto é o showcase.</p>
  <div class="prompts">{vid_prompts}</div>
</section>

<section id="decidir">
  <div class="alert"><h3>Pra você decidir</h3><ol>{decide}</ol></div>
</section>
</div></main>
<script>
document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',()=>{{
  const el=document.getElementById(b.dataset.t); const t=el.innerText;
  const ok=()=>{{b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',1500)}};
  const sel=()=>{{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selecionado'}};
  try{{navigator.clipboard.writeText(t).then(ok,sel)}}catch(_){{sel()}}
}}));
</script>
'''
open(os.path.join(H, 'index.html'), 'w').write(page)
print('ok', len(page))

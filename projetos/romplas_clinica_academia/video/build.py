# Romplas · Lojista, seu tapeceiro também reforma clínica e academia — página do modo sequência (v2)
# python3 build.py  ->  seq.html + seq.json (o motor renderiza com ./vse.sh seq <esta pasta>)
# v2: cortes 0,12 s antes da 1ª palavra de cada frase; cada elemento ancorado na palavra que mostra
#     (entra 0,15 s antes dela); empurrão em todas as trocas (2 horizontais : 1 vertical); textos centrados;
#     logo com o "O" primeiro; máscara dos arcos atravessando da direita para a esquerda; trilha Radiant Momentum.
import os, sys, json, re
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(H)
sys.path.insert(0, os.path.join(ROOT, 'sb'))
import frames as F
ENGINE = '/home/user/video-social-engine'
B, FOTOS = os.path.join(ROOT, 'brand'), os.path.join(ROOT, 'fotos')
AZ, AZL, AZA, CCL = F.AZ, F.AZL, F.AZA, F.CCL
W = '#fff'

# ---------- tempo: narração com pausas inseridas (narracao/pads.json); tempos de palavra = alinhamento do TTS ----------
PADS = json.load(open(os.path.join(ROOT, 'narracao', 'pads.json')))['pads']
def o(t): return round(t + sum(d for p, d in PADS if p < t), 3)
LEAD, WLEAD = .12, .15
FRASES = [0, 2.56, 4.28, 6.00, 7.68, 10.08, 11.68, 13.20, 14.88, 16.16, 17.72, 20.24, 21.92, 23.707, 25.92, 27.28,
          29.68, 31.60, 33.28, 35.333, 37.36, 39.594, 40.88, 42.44, 43.92, 45.60]   # 1ª palavra de cada cena (tempo bruto)
NARR_END = o(47.77)
CUTS = [0] + [round(o(t) - LEAD, 3) for t in FRASES[1:]] + [round(NARR_END + .15, 3)]
CUTS += [round(CUTS[-1] + 2.3, 3), round(CUTS[-1] + 2.3 + 2.6, 3)]
CUR = {'t0': 0}
def wt(src):
    """data-t de um elemento ancorado na palavra que começa em `src` (tempo bruto)."""
    return round(o(src) - CUR['t0'] - WLEAD, 3)
EARLY = -.12   # texto principal: entra durante o empurrão

def A(html, a, t=None, **kw):
    attrs = f' data-a="{a}"' + (f' data-t="{t}"' if t is not None else '') + ''.join(f' data-{k}="{v}"' for k, v in kw.items())
    return re.sub(r'^(\s*<\w+)', r'\1' + attrs, html, count=1)

def md(t): return re.sub(r'\*([^*]+)\*', r'<b>\1</b>', t)

CLIPS = os.path.join(ROOT, 'clips')
def media(name, pos, cls=''):
    """Clipe do Magnific (clips/<nome>.mp4, trecho já cortado) se existir; senão a foto (fotos/<nome>.jpg)."""
    v = os.path.join(CLIPS, name + '.mp4')
    if os.path.exists(v):
        return f'<video class="clip {cls}" src="file://{v}" muted preload="auto" playsinline style="object-position:{pos}"></video>'
    return f'<img class="{cls}" src="file://{FOTOS}/{name}.jpg" style="object-position:{pos}">'

def photo(name, pos='50% 50%', dim=0.0):
    d = f'<div class="dim" style="opacity:{dim}"></div>' if dim else ''
    return f'<div class="ph">{media(name, pos, "drift")}</div>{d}'

def fill(c): return f'<div class="fill" style="background:{c}"></div>'

def arcos(light=False):
    s = open(os.path.join(B, 'fundo-arcos-branco.svg' if light else 'fundo-arcos-azul.svg')).read()
    s = re.sub(r'width="\d+" height="\d+"', 'class="arcs" width="100%" height="100%"', s, count=1)
    return fill('#fff' if light else AZ) + f'<div class="arcbox">{s}</div>'

def halves(a, b, pa='50% 50%', pb='50% 50%'):
    return (f'<div class="half top" data-a="halfTop" data-t="{EARLY}">{media(a, pa)}</div>'
            f'<div class="half bot" data-a="halfBot" data-t="{EARLY}">{media(b, pb)}</div><div class="divline"></div>')

BGI = 38.4   # sangria vertical do .bg (2% de 1920)
def band(name, pos='50% 50%', top=560, h=640):
    return f'<div class="band" style="top:{BGI + top}px;height:{h}px"><img class="drift" src="file://{FOTOS}/{name}.jpg" style="object-position:{pos}"></div>'

def box(lines, mode='box', t=EARLY, theme='azul', pad='40px 56px'):
    bg, fg = (AZ, '#fff') if theme == 'azul' else ('#fff', AZ)
    rows = ''.join(f'<div style="font-size:{px}px;font-weight:{w};{ex}">{md(tx)}</div>' for tx, px, w, ex in lines)
    return f'<div class="persp"><div class="box" data-a="{mode}" data-t="{t}" style="background:{bg};color:{fg};padding:{pad}">{rows}</div></div>'

def chip(tx, a, t, theme='azul', px=56, sfx='chip'):
    st = {'azul': f'background:{AZ};color:#fff', 'branco': f'background:#fff;color:{AZ}'}.get(theme, f'border:4px solid {theme};color:{theme};background:transparent')
    return f'<div class="chip" data-a="{a}" data-t="{t}" data-sfx="{sfx}" style="{st};font-size:{px}px"><span class="ct">{md(tx)}</span></div>'

def lett(l1, l2, t=EARLY, color='#fff', size=(92, 120), traco='gancho', sfx=None):
    s = f' data-sfx="{sfx}"' if sfx else ''
    return (f'<div class="lett" data-a="lett" data-t="{t}"{s} data-traco="{traco}" style="color:{color}">'
            f'<span class="l1" style="font-size:{size[0]}px">{md(l1)}</span><span class="l2" style="font-size:{size[1]}px">{md(l2)}</span></div>')

def icon(name, color, size, t, sw=1.1, sfx='icon'):
    return A(F.icon(name, color, size), 'trace', t, sw=sw, sfx=sfx)

def logo_svg(principal=False, w=640):
    if principal:
        s = open(os.path.join(B, 'logo-principal.svg')).read()
        return re.sub(r'width="\d+" height="\d+"', f'class="logo" style="width:{w}px"', s, count=1)
    return F.logo(W, w)

def cta(txt, click, sub=''):
    s = f'<div class="ctasub" style="color:{AZ}">{sub}</div>' if sub else ''
    return (f'<div class="ctawrap" data-a="cta" data-t="{EARLY}" data-click="{click}"><div class="ctabtn" style="background:{AZ};color:#fff">{txt}{F.SETA}'
            f'<div class="shine"></div><div class="ring"></div><div class="cursor">{F.CURSOR}</div></div>{s}</div>')

center = F.center

# ---------- cenas: cada função recebe o t0 da cena (para ancorar os elementos na fala) ----------
SC = []
def sc(bg, fg, zoom): SC.append(dict(bg=bg, fg=fg, zoom=zoom))
def at_scene(i): CUR['t0'] = CUTS[i]

at_scene(0)   # 1 hook — letterbox em box 3D
sc(photo('m_hook', '45% 50%', .15), center(box([
    ('LOJISTA,', 54, 600, 'letter-spacing:.06em;margin-bottom:16px'),
    ('seu tapeceiro também reforma', 54, 400, 'margin-bottom:14px;white-space:nowrap'),
    ('*clínica e*', 132, 400, 'line-height:.92'), ('*academia.*', 132, 400, 'line-height:.92')], 'box3d', 0, pad='56px 64px')
    .replace('data-a="box3d"', 'data-a="box3d" data-sfx="hook"')), 'in')
at_scene(1)
sc(photo('m_store', '58% 50%', .12), center(box([('o *tapeceiro*', 124, 400, ''), ('que compra com você', 58, 400, 'margin-top:8px')]), top=1000, h=320), 'out')
at_scene(2)
sc(photo('d_saude', '50% 62%'), center(box([('também reforma', 58, 400, ''), ('*clínica.*', 150, 400, 'margin-top:4px')]), top=1040, h=300), 'in')
at_scene(3)
sc(halves('m_hospital', 'd_academia', '50% 50%', '72% 68%'),
   center(f'<div class="row" style="gap:28px">{chip("*hospital*", "chipL", wt(6.00))}{chip("*academia*", "chipR", wt(6.853))}</div>', top=900, h=120), None)
at_scene(4)
sc(photo('p_mosaico'), center(box([('o revestimento', 66, 400, ''), ('*certo.*', 160, 400, 'line-height:.95')]), top=760, h=420), 'out')
at_scene(5)
sc(arcos(), center(lett('essa venda', '*é sua.*', EARLY, size=(96, 170), sfx='big')), 'in')
at_scene(6)
sc(photo('m_cut', '50% 50%', .1), center(box([('hoje, quando ele', 60, 400, ''), ('*precisa*', 140, 400, 'line-height:.95'), ('de material', 60, 400, '')]), top=1000, h=340), 'out')
at_scene(7)
sc(halves('m_maca', 'm_espera'),
   center(f'<div class="chips" style="gap:18px">{chip("*maca*", "chipL", wt(13.44))}{chip("*cadeira de espera*", "chipR", wt(13.92), "branco")}</div>', top=820, h=280), None)
at_scene(8)
sc(photo('m_aparelho', '50% 45%', .08), center(chip('*banco de aparelho*', 'chipL', wt(15.12), px=64), top=1080, h=160), 'in')
at_scene(9)
sc(photo('m_outraloja2', '50% 50%', .1), center(box([('ele procura em', 62, 400, ''), ('*outra loja.*', 130, 400, '')]), top=1000, h=320), 'out')   # Magnific 6781867: vendedor mostra o mostruário a um cliente
at_scene(10)   # o resto do pedido vai junto (chips saem para a direita no "lá")
chips11 = (f'<div class="row" style="gap:20px" data-a="up" data-t="{wt(18.88)}" data-out="{wt(19.88) + .1}">'
           + ''.join(f'<div class="chip" style="border:4px solid {AZ};color:{AZ};font-size:56px"><span class="ct">{x}</span></div>' for x in ['espuma', 'cola', 'grampo'])
           + '</div>')
sc(arcos(light=True), center(lett('e aproveita para comprar', 'o resto do *pedido.*', EARLY, color=AZ, size=(66, 120)) + chips11, gap=60), 'in')
at_scene(11)   # virada
sc(arcos(), center(icon('cruz-hospitalar', W, 230, EARLY, sfx='brand') + lett('A Romplas tem linha', '*hospitalar.*', EARLY + .05, size=(64, 150)), gap=30), 'in')
at_scene(12)
sc(photo('m_limpar', '50% 55%', .08), center(box([('fácil de limpar', 72, 400, ''), ('e *desinfetar.*', 116, 400, '')]), top=1000, h=320), 'out')
at_scene(13)
sc(photo('p_lxr'), center(f'<div class="chips">{chip("resistente a *mancha*", "chipL", EARLY)}{chip("*antiderrapante*", "chipR", wt(24.88))}</div>', top=1040, h=280), 'in')
at_scene(14)
sc(photo('m_academia', '50% 50%', .15), center(icon('halter', W, 200, EARLY) + box([('e linha para', 60, 400, ''), ('*academia.*', 136, 400, '')], t=EARLY + .05), top=820, h=560, gap=24), 'out')
at_scene(15)
sc(photo('m_venda', '50% 50%', .1), center(box([('você vende', 62, 400, ''), ('*mais*', 150, 400, 'line-height:.9'), ('para o mesmo tapeceiro', 52, 400, 'margin-top:10px')], 'box3d', EARLY), top=540, h=420), 'in')   # Magnific 10087784: pagamento no caixa da loja de tecidos
at_scene(16)
sc(arcos(light=True), center(f'<div class="rotulo" data-a="rotulo" data-t="{EARLY}" style="color:{AZ};font-size:84px;text-align:center">sem precisar buscar<br><b>cliente novo.</b><svg class="rt"></svg></div>'), 'out')
at_scene(17)
sc(fill(AZ) + band('d_fachada', '86% 50%', 300, 1150),   # foto grande (1150 px de altura, sem ampliar a original)
   center(f'<div style="background:{AZ};padding:34px 64px 42px;display:flex;flex-direction:column;align-items:center;gap:22px">'
          f'<div class="over" data-a="up" data-t="{EARLY}" style="color:#fff">Quem fabrica é a</div>' + A(logo_svg(False, 600), 'logoO', round(EARLY + .1, 3), sfx='brand') + '</div>',
          top=1020, h=340), 'in')
at_scene(18)
sc(photo('p_uruguai'), center(box([('a mesma indústria do', 58, 400, ''), ('*Uruguai*', 132, 400, 'line-height:.95'), ('*Original®*', 132, 400, 'line-height:.95')]), top=760, h=440), 'out')
at_scene(19)   # onze mercados
grid = ''.join(F.icon(n, AZ, 150) for n in ['cruz-hospitalar', 'halter', 'sofa', 'poltrona', 'carro', 'barco', 'presente', 'monitor', 'caixa', 'bolsa', 'escudo'])
sc(arcos(light=True), center(f'<div style="display:flex;align-items:baseline;gap:24px;color:{AZ}"><span class="big" data-a="count" data-n="11" data-d=".45" data-t="{wt(35.92)}" data-sfx="big" style="font-size:220px">11</span>'
                             f'<span data-a="up" data-t="{wt(36.28)}" style="font-size:84px;font-weight:400;letter-spacing:-.03em">mercados.</span></div>'
                             f'<div class="grid11" data-a="grid" data-t="{EARLY}">{grid}</div>', top=520, h=800, gap=50), 'out')
at_scene(20)   # clímax: 32 anos (entra pela máscara)
sc(arcos(), center(f'<div class="big" data-a="count" data-n="32" data-d=".55" data-t="{wt(37.76)}" style="color:#fff">32</div><div data-a="words" data-t="{wt(38.48)}" style="color:#fff;font-size:84px;letter-spacing:-.03em">anos de <b>mercado.</b></div>', gap=10), 'out')
at_scene(21)   # CTA 1 — clique no "Mais"
sc(fill(CCL), center(cta('Saiba mais', round(o(40.32) - CUTS[21], 3))), None)
at_scene(22)
sc(arcos(), center('<div class="form" data-a="form" data-t="-0.12" data-first=".3" data-step=".22"><h4>Cadastro da sua loja</h4><div class="field">Nome da loja<span class="ok">✓</span></div><div class="field">Cidade<span class="ok">✓</span></div><div class="field">WhatsApp<span class="ok">✓</span></div></div>'), 'in')
at_scene(23)
sc(fill(AZ) + band('d_pessoas', '50% 35%', 560, 660), center(f'<div data-a="words" data-t="{EARLY}" style="color:#fff;font-size:74px;letter-spacing:-.02em">um <b>especialista</b> Romplas</div>', top=1250, h=120), 'out')
at_scene(24)
sc(photo('m_especialista', '50% 40%', .1), center(box([('entra em', 64, 400, ''), ('*contato.*', 150, 400, '')]), top=1000, h=320), 'in')
at_scene(25)   # as linhas
sc(arcos(), center(f'<div class="over" data-a="up" data-t="{EARLY}" style="color:#fff">as linhas</div>'
   f'<div class="row" style="gap:120px"><div class="col">{icon("cruz-hospitalar", W, 300, round(wt(46.24) - .1, 3))}<div class="lbl" data-a="up" data-t="{wt(46.24)}" style="color:#fff">hospitalar</div></div>'
   f'<div class="col">{icon("halter", W, 300, round(wt(47.0) - .1, 3))}<div class="lbl" data-a="up" data-t="{wt(47.0)}" style="color:#fff">academia</div></div></div>', gap=44), 'in')
at_scene(26)   # assinatura: logo com o "O" primeiro + lettering
sc(arcos(light=True), center(A(logo_svg(True, 700), 'logoO', -0.1, sfx='brand') + lett('Revestindo', '*possibilidades.*', .85, color=AZ, size=(70, 92)), gap=70), None)
at_scene(27)   # CTA final
sc(fill(CCL), center(cta('Saiba mais', 1.0, 'e cadastre <b>sua loja.</b>')), None)

assert len(SC) == len(CUTS) - 1, (len(SC), len(CUTS))
PUSHES = ['pushL', 'pushL', 'pushU']
MASK_AFTER = 19   # cena 20 (índice 19) sai pela máscara

CSS = F.CSS + f"""
body{{margin:0;background:#000}}
#stage{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#0B1422}}
.scene{{position:absolute;inset:0;visibility:hidden}}
.cam{{position:absolute;inset:0;overflow:hidden;transform-origin:50% 50%}}
.sw{{position:absolute;inset:0;transform-origin:50% 50%}}
.bg{{position:absolute;inset:-2%;overflow:hidden}}
.bg .ph{{position:absolute;inset:0}} .bg .ph img,.bg .ph video{{width:100%;height:100%;object-fit:cover;display:block}}
.bg .fill,.bg .dim{{position:absolute;inset:0}} .bg .dim{{background:#0B1422}}
.bg .arcbox{{position:absolute;inset:0}} .bg .arcbox svg{{position:absolute;inset:0}}
.bg .half{{position:absolute;left:0;right:0;height:50%;overflow:hidden}} .bg .half.top{{top:0}} .bg .half.bot{{top:50%}}
.bg .half img,.bg .half video{{width:100%;height:100%;object-fit:cover;display:block}}
.bg .divline{{position:absolute;left:0;right:0;top:calc(50% - 4px);height:8px;background:{AZ}}}
.bg .band{{position:absolute;left:0;right:0;overflow:hidden}} .bg .band img{{width:100%;height:100%;object-fit:cover}}
.w{{display:inline-block}}
.box{{transform-style:preserve-3d}}
.chip{{display:inline-block}}
.lett{{align-items:center !important;text-align:center !important}}
.ctabtn{{overflow:visible}}
.shine{{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}}
.ring{{position:absolute;right:8px;bottom:-40px;width:120px;height:120px;border-radius:50%;border:6px solid {AZA};opacity:0}}
#mask{{position:absolute;inset:0;overflow:hidden;visibility:hidden;z-index:50}}
#mask .disc{{position:absolute;width:3000px;height:3000px;left:{540 - 1500}px;top:{960 - 1500}px;border-radius:50%}}
"""

# traços do lettering e do text label medidos com o texto centrado (offsetLeft)
JS = r"""
document.fonts.ready.then(()=>{
 document.querySelectorAll('.lett').forEach(el=>{
  const tipo=el.dataset.traco, last=el.querySelector('.l2');
  const w=last.offsetWidth, x0=last.offsetLeft, base=last.offsetTop+last.offsetHeight, k=parseFloat(getComputedStyle(last).fontSize)/48;
  let d,x=x0,y,vw,vh;
  if(tipo==='gancho'){vw=w+56*k;vh=64*k;y=base-50*k;d=`M0 ${58*k} L${w+4*k} ${58*k} C${w+40*k} ${58*k} ${w+54*k} ${40*k} ${w+54*k} ${8*k}`}
  else {vw=w+70*k;vh=24*k;y=base-2*k;x=x0-35*k;d=`M0 ${14*k} C${vw*.3} ${4*k} ${vw*.55} ${22*k} ${vw} ${8*k}`}
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','tr');
  s.setAttribute('viewBox',`0 0 ${vw} ${vh}`);s.setAttribute('width',vw);s.setAttribute('height',vh);s.style.left=x+'px';s.style.top=y+'px';
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);s.appendChild(p);el.appendChild(s);
 });
 document.querySelectorAll('.rotulo').forEach(el=>{
  const w=el.offsetWidth,h=el.offsetHeight,r=36,s=el.querySelector('svg.rt');
  s.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const d=`M0 ${h} L0 ${r} Q0 0 ${r} 0 L${w*.42} 0 M${w*.6} ${h} L${w-r} ${h} Q${w} ${h} ${w} ${h-r} L${w} ${h*.5}`;
  s.innerHTML=`<path d="${d}"/>`;
 });
});
"""

scenes, meta, k = [], [], 0
for i, s in enumerate(SC):
    sid = f's{i + 1:02d}'
    t0, t1 = CUTS[i], CUTS[i + 1]
    if i == len(SC) - 1: tout = None
    elif i == MASK_AFTER: tout = 'mask'
    else: tout = PUSHES[k % 3]; k += 1
    tin = meta[-1]['tout'] if meta else None
    if tin == 'mask': tin = None
    meta.append(dict(id=sid, t0=t0, t1=t1, tin=tin, tout=tout, zoom=s['zoom']))
    scenes.append(f'<section class="scene" id="{sid}"><div class="cam"><div class="bg">{s["bg"]}</div><div class="sw">{s["fg"]}</div></div></section>')

discs = ''.join(f'<div class="disc" style="background:{c}"></div>' for c in [AZA, AZL, AZ])
SEQ = dict(fps=30, end=CUTS[-1], push=.42, scenes=meta, mask=dict(at=CUTS[MASK_AFTER + 1]), sfx=[])
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div id="stage">{''.join(scenes)}<div id="mask">{discs}</div></div>
<script>window.SEQ={json.dumps(SEQ)};</script>
<script src="file://{ENGINE}/web/seq/vendor/gsap.min.js"></script>
<script src="file://{ENGINE}/web/seq/vendor/CustomEase.min.js"></script>
<script>{JS}</script>
<script>
Promise.all([document.fonts.ready, ...[...document.images].map(im => im.decode().catch(()=>0)), ...[...document.querySelectorAll('video')].map(v => v.readyState >= 2 ? 0 : new Promise(r => {{ v.addEventListener('loadeddata', r, {{once:true}}); v.addEventListener('error', r, {{once:true}}); }}))]).then(() => setTimeout(() => {{
  const s = document.createElement('script'); s.src = 'file://{ENGINE}/web/seq/seq.js'; document.body.appendChild(s);
}}, 150));
</script></body></html>"""
open(os.path.join(H, 'seq.html'), 'w').write(html)
MUSIC = os.path.join(ROOT, 'trilha', 'radiant_momentum.mp3')
json.dump(dict(narration=os.path.join(ROOT, 'narracao', 'narracao_final.wav'),
               music=dict(file=MUSIC, ss=round(max(0, 53.47 - CUTS[-1]), 2), lufs=-27, fade_out=False) if os.path.exists(MUSIC) else None,
               sfx_gain=-4), open(os.path.join(H, 'seq.json'), 'w'), indent=1)
for m in meta: print(f"{m['id']} {m['t0']:6.2f}-{m['t1']:6.2f} {m['t1'] - m['t0']:4.2f}s in={m['tin']} out={m['tout']} zoom={m['zoom']}")

# Quadros-chave do storyboard Romplas · clínica e academia
# Gera frames.html (uma div 1080x1920 por cena) com os assets reais do design system.
import os, re, json, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'brand')
R = os.path.join(ROOT, 'ref')

AZ, AZL, AZA, GRA, CIN, CCL = '#2E507B', '#476D9E', '#617DAE', '#201D1D', '#D7D8D9', '#F1F1F1'

def svg_inner(path):
    s = open(path).read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    inner = re.sub(r'^<svg[^>]*>|</svg>\s*$', '', s.strip())
    return vb, inner

def logo(color='#fff', w=620, two_tone=False):
    vb, inner = svg_inner(os.path.join(B, 'logo-principal.svg'))
    if two_tone:
        inner = inner.replace('#000000', '#FFFFFF')  # só sobre grafite
    else:
        inner = re.sub(r'fill="#[0-9A-Fa-f]{6}"', f'fill="{color}"', inner)
    return f'<svg class="logo" viewBox="{vb}" style="width:{w}px">{inner}</svg>'

def icon(name, color='#fff', size=180):
    vb, inner = svg_inner(os.path.join(B, 'icones', name + '.svg'))
    inner = inner.replace('#2E507B', color)
    return f'<svg class="ico" viewBox="{vb}" style="width:{size}px;height:{size}px">{inner}</svg>'

def simbolo(color='#fff', size=200):
    vb, inner = svg_inner(os.path.join(B, 'simbolo-branco.svg'))
    inner = inner.replace('#FFFFFF', color)
    return f'<svg viewBox="{vb}" style="width:{size}px;height:{size}px">{inner}</svg>'

def img(name):
    p = os.path.join(R, name + '.jpg')
    return 'file://' + p if os.path.exists(p) else ''

def photo(name, pos='50% 50%', scale=1.0, dim=0.0):
    src = img(name)
    if not src:
        return f'<div class="ph missing"><span>{name}</span></div>'
    d = f'<div class="dim" style="opacity:{dim}"></div>' if dim else ''
    return f'<div class="ph"><img src="{src}" style="object-position:{pos};transform:scale({scale})"></div>{d}'

def band(name, pos='50% 50%', h=640, top=640):
    src = img(name)
    return f'<div class="band" style="top:{top}px;height:{h}px"><img src="{src}" style="object-position:{pos}"></div>'

def arcos(light=False):
    f = 'fundo-arcos-branco.svg' if light else 'fundo-arcos-azul.svg'
    bg = '#fff' if light else AZ
    return f'<div class="arcos" style="background:{bg}"><img src="file://{os.path.join(B, f)}"></div>'

def split(a, b, pa='50% 50%', pb='50% 50%'):
    return (f'<div class="half top"><img src="{img(a)}" style="object-position:{pa}"></div>'
            f'<div class="half bot"><img src="{img(b)}" style="object-position:{pb}"></div><div class="divline"></div>')

def md(t):
    """*negrito* -> <b>"""
    return re.sub(r'\*([^*]+)\*', r'<b>\1</b>', t)

def box(lines, tilt=True, theme='azul', pad='40px 56px', align='center'):
    bg = AZ if theme == 'azul' else '#fff'
    fg = '#fff' if theme == 'azul' else AZ
    rows = ''.join(f'<div style="font-size:{px}px;font-weight:{w};{extra}">{md(t)}</div>' for t, px, w, extra in lines)
    cls = 'box tilt' if tilt else 'box'
    return f'<div class="persp"><div class="{cls}" style="background:{bg};color:{fg};padding:{pad};text-align:{align}">{rows}</div></div>'

def lettering(l1, l2, color='#fff', size=(92, 120), traco='gancho', sobre=False):
    st1 = f'font-size:{size[0]}px;font-weight:{600 if sobre else 400};' + ('text-transform:uppercase;letter-spacing:.02em;' if sobre else '')
    return (f'<div class="lett" data-traco="{traco}" style="color:{color}">'
            f'<span class="l1" style="{st1}">{md(l1)}</span>'
            f'<span class="l2" style="font-size:{size[1]}px">{md(l2)}</span></div>')

def chip(t, theme='azul', px=54):
    if theme == 'azul':
        return f'<div class="chip" style="background:{AZ};color:#fff;font-size:{px}px">{md(t)}</div>'
    if theme == 'branco':
        return f'<div class="chip" style="background:#fff;color:{AZ};font-size:{px}px">{md(t)}</div>'
    return f'<div class="chip outline" style="color:{theme};border-color:{theme};font-size:{px}px">{md(t)}</div>'

def rotulo(t, color='#fff', px=64):
    return f'<div class="rotulo" style="color:{color};font-size:{px}px">{md(t)}<svg class="rt"></svg></div>'

SETA = '<svg class="seta" viewBox="0 0 22 20"><path d="M2 10h17M12 3l7 7-7 7"/></svg>'
def cta(t, theme='claro', sub=''):
    bg, fg = (AZ, '#fff') if theme == 'claro' else ('#fff', AZ)
    sc = AZ if theme == 'claro' else '#fff'
    s = f'<div class="ctasub" style="color:{sc}">{md(sub)}</div>' if sub else ''
    return (f'<div class="ctawrap"><div class="ctabtn" style="background:{bg};color:{fg}">{t}{SETA}'
            f'<div class="cursor">{CURSOR}</div></div>{s}</div>')

CURSOR = ('<svg viewBox="0 0 64 80" width="112" height="140"><path d="M8 6 L8 62 Q8 66 12 63 L24 52 L34 74 Q36 78 40 76 L46 73 Q50 71 48 67 L38 46 L54 45 Q59 44 55 40 L13 3 Q8 0 8 6Z" '
          f'fill="#fff" stroke="{AZ}" stroke-width="4.5" stroke-linejoin="round"/></svg>')

def center(inner, top=540, h=760, gap=36):
    return f'<div class="center" style="top:{top}px;height:{h}px;gap:{gap}px">{inner}</div>'

CSS = f"""
@font-face{{font-family:'SS3';src:url('file://{B}/SourceSans3-VariableFont_wght.ttf');font-weight:200 900}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#222;font-family:'SS3';}}
.frame{{position:relative;width:1080px;height:1920px;overflow:hidden;background:{CCL};margin:0 0 40px}}
.ph,.ph img,.arcos,.arcos img{{position:absolute;inset:0;width:100%;height:100%}}
.ph img{{object-fit:cover}}
.ph.missing{{background:#596273;display:grid;place-items:center;color:#fff;font-size:48px}}
.arcos img{{object-fit:cover;object-position:right bottom}}
.dim{{position:absolute;inset:0;background:#0B1422}}
.band{{position:absolute;left:0;right:0;overflow:hidden}}
.band img{{width:100%;height:100%;object-fit:cover}}
.half{{position:absolute;left:0;right:0;height:960px;overflow:hidden}}
.half.top{{top:0}} .half.bot{{top:960px}}
.half img{{width:100%;height:100%;object-fit:cover}}
.divline{{position:absolute;left:0;right:0;top:956px;height:8px;background:{AZ}}}
.center{{position:absolute;left:108px;right:108px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}}
.persp{{perspective:1400px}}
.box{{line-height:1.0;letter-spacing:-.025em;max-width:864px}}
.box.tilt{{transform:rotateY(-4deg) rotateX(2deg)}}
.box b{{font-weight:800}}
.lett{{position:relative;display:inline-flex;flex-direction:column;align-items:flex-start;text-align:left;line-height:.98;letter-spacing:-.03em;padding-bottom:34px}}
.lett .l1,.lett .l2{{display:block;white-space:nowrap}}
.lett .l2{{font-weight:400}}
.lett b{{font-weight:700}}
.lett svg.tr{{position:absolute;overflow:visible}}
.lett svg.tr path{{fill:none;stroke:{AZA};stroke-width:7px;stroke-linecap:round}}
.chip{{padding:22px 40px;font-weight:600;letter-spacing:-.02em;line-height:1}}
.chip.outline{{border:4px solid;background:transparent}}
.chips{{display:flex;flex-direction:column;align-items:center;gap:22px}}
.rotulo{{position:relative;display:inline-block;font-weight:600;line-height:1.08;padding:30px 44px;letter-spacing:-.02em;text-align:left}}
.rotulo b{{font-weight:800}}
.rotulo svg.rt{{position:absolute;inset:0;width:100%;height:100%;overflow:visible}}
.rotulo svg.rt path{{fill:none;stroke:currentColor;stroke-width:4px;stroke-linecap:round}}
.ctawrap{{display:flex;flex-direction:column;align-items:center;gap:38px}}
.ctabtn{{position:relative;display:flex;align-items:center;gap:30px;font-size:80px;font-weight:700;padding:52px 96px;letter-spacing:-.02em}}
.seta{{width:58px;height:52px}} .seta path{{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}}
.cursor{{position:absolute;right:-30px;bottom:-110px}}
.ctasub{{font-size:56px;font-weight:400;letter-spacing:-.02em}}
.ctasub b{{font-weight:700}}
.logo{{display:block}}
.ico{{display:block}}
.row{{display:flex;gap:64px;align-items:flex-start;justify-content:center}}
.col{{display:flex;flex-direction:column;align-items:center;gap:20px}}
.lbl{{font-size:64px;font-weight:600;letter-spacing:-.02em}}
.over{{font-size:48px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}}
.big{{font-size:300px;font-weight:700;letter-spacing:-.05em;line-height:.85}}
.grid11{{display:grid;grid-template-columns:repeat(4,150px);gap:34px 40px;justify-content:center}}
.form{{background:#fff;width:864px;padding:56px 64px;display:flex;flex-direction:column;gap:26px;text-align:left}}
.form h4{{font-size:68px;font-weight:700;color:{AZ};letter-spacing:-.02em}}
.field{{border-bottom:4px solid {CIN};padding:12px 0 16px;font-size:50px;color:{AZL};display:flex;justify-content:space-between}}
.field .ok{{color:{AZ};font-weight:700}}
"""

JS = r"""
document.fonts.ready.then(()=>{
 document.querySelectorAll('.lett').forEach(el=>{
  const tipo=el.dataset.traco, last=el.lastElementChild;
  const w=last.offsetWidth, base=last.offsetTop+last.offsetHeight, k=parseFloat(getComputedStyle(last).fontSize)/48;
  let d,x=0,y,vw,vh;
  if(tipo==='gancho'){vw=w+56*k;vh=64*k;y=base-50*k;d=`M0 ${58*k} L${w+4*k} ${58*k} C${w+40*k} ${58*k} ${w+54*k} ${40*k} ${w+54*k} ${8*k}`}
  else if(tipo==='parentese'){vw=110*k;vh=120*k;x=w+24*k;y=base-104*k;d=`M${2*k} ${102*k} C${46*k} ${104*k} ${82*k} ${92*k} ${86*k} ${62*k} C${90*k} ${34*k} ${74*k} ${14*k} ${62*k} ${4*k}`}
  else {vw=w+70*k;vh=24*k;y=base-2*k;d=`M0 ${14*k} C${vw*.3} ${4*k} ${vw*.55} ${22*k} ${vw} ${8*k}`}
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
 window.READY=true;
});
"""

def build(frames, out):
    body = ''.join(f'<div class="frame" id="f{n:02d}">{h}</div>' for n, h in frames)
    open(out, 'w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}<script>{JS}</script></body></html>')

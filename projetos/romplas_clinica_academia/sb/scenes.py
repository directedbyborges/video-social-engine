import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from frames import *

W = '#fff'
# (dur, narração, texto na tela, visual, fonte, forma, saída, html)
S = []
def sc(dur, nar, txt, vis, src, forma, out, h):
    S.append(dict(dur=dur, nar=nar, txt=txt, vis=vis, src=src, forma=forma, out=out, html=h))

# 1 — HOOK: letterbox em box 3D sobre o tapeceiro trabalhando
sc(2.5, 'Dono de loja de material para tapeçaria:', 'LOJISTA, / seu tapeceiro também reforma / clínica e academia.',
   'Tapeceiro estofando assento (Magnific)', 'MAG', 'Box 3D sutil (letterbox) · hook E', 'zin',
   photo('m_hook', dim=.15) + center(box([
       ('LOJISTA,', 54, 600, 'letter-spacing:.06em;margin-bottom:16px'),
       ('seu tapeceiro também reforma', 54, 400, 'margin-bottom:14px;white-space:nowrap'),
       ('*clínica e*', 132, 400, 'line-height:.92'),
       ('*academia.*', 132, 400, 'line-height:.92')], pad='56px 64px')))

# 2
sc(1.8, 'o tapeceiro que compra com você', 'seu *tapeceiro*',
   'Tapeceiro comprando na loja (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'panR',
   photo('m_store', dim=.12) + center(box([('o *tapeceiro*', 124, 400, ''), ('que compra com você', 58, 400, 'margin-top:8px')], tilt=False), top=980, h=320))

# 3
sc(2.0, 'também pega serviço de clínica,', '*clínica.*',
   'Sala de procedimento estofada (site Romplas, área saúde)', 'CLIENTE', 'Foto tela cheia + palavra', 'zout',
   photo('d_saude', pos='50% 60%') + center(box([('também reforma', 58, 400, ''), ('*clínica.*', 150, 400, 'margin-top:4px')], tilt=False), top=1040, h=300))

# 4
sc(1.6, 'hospital e academia.', '*hospital* · *academia*',
   'Pan entre duas imagens: hospital (Magnific) → academia (site Romplas)', 'MAG + CLIENTE', 'Pan entre duas imagens', 'zin',
   split('m_hospital', 'd_academia', pb='50% 45%') + center(f'<div class="row" style="gap:28px">{chip("*hospital*")}{chip("*academia*")}</div>', top=900, h=120))

# 5
sc(2.5, 'Se a sua loja tiver o revestimento certo,', 'o revestimento *certo*',
   'Revestimento Romplas em close (amostras Uruguai Original®; trocar pela linha hospitalar)', 'CLIENTE', 'Mockup / close de produto', 'panL',
   photo('s_uruguai', pos='50% 40%', scale=1.15) + center(box([('o revestimento', 66, 400, ''), ('*certo.*', 160, 400, 'line-height:.95')]), top=760, h=420))

# 6
sc(1.5, 'essa venda é sua.', 'essa venda / *é sua.*',
   'Arcos azul da marca', 'MOTION', 'Lettering com traço (pouso de perto)', 'zin',
   arcos() + center(lettering('essa venda', '*é sua.*', size=(96, 170)), top=560, h=720))

# 7
sc(2.1, 'Hoje, quando ele precisa de material', 'quando ele *precisa*',
   'Tapeceiro cortando sintético preto (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'panR',
   photo('m_cut', pos='50% 50%', dim=.1) + center(box([('hoje, quando ele', 60, 400, ''), ('*precisa*', 140, 400, 'line-height:.95'), ('de material', 60, 400, '')], tilt=False), top=1000, h=300))

# 8
sc(2.0, 'para maca, cadeira de espera', '*maca* · *cadeira de espera*',
   'Tela dividida: maca (Magnific) / cadeiras de espera (Magnific)', 'MAG', 'Tela dividida + chips (morph círculo → retângulo)', 'panU',
   split('m_maca', 'm_espera') + center(f'<div class="chips" style="gap:18px">{chip("*maca*")}{chip("*cadeira de espera*", "branco")}</div>', top=820, h=280))

# 9
sc(1.5, 'ou banco de aparelho,', '*banco de aparelho*',
   'Banco de aparelho de academia em close (Magnific)', 'MAG', 'Foto tela cheia + chip', 'zout',
   photo('m_aparelho', dim=.08) + center(chip('*banco de aparelho*', px=64), top=1080, h=160))

# 10
sc(1.9, 'ele procura em outra loja.', 'em *outra loja.*',
   'Tapeceiro entrando em outra loja (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'panL',
   photo('m_outraloja', dim=.12) + center(box([('ele procura em', 62, 400, ''), ('*outra loja.*', 130, 400, '')], tilt=False), top=1000, h=320))

# 11
sc(1.5, 'E aproveita para comprar', 'e compra *lá*',
   'Compra no balcão da outra loja (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'zin',
   photo('m_pedido', dim=.1) + center(box([('e aproveita', 60, 400, ''), ('para *comprar*', 110, 400, '')], tilt=False), top=1000, h=300))

# 12
sc(1.6, 'o resto do pedido lá.', 'o resto do *pedido.*',
   'Fundo claro; chips do pedido (espuma, cola, grampo) saindo para a direita', 'MOTION', 'Chips em grupo + saída lateral', 'panR',
   arcos(light=True) + center(f'<div class="lett" style="color:{AZ};align-items:center;text-align:center;padding:0"><span class="l1" style="font-size:92px">o resto do</span><span class="l2" style="font-size:150px"><b>pedido.</b></span></div>'
       f'<div class="row" style="gap:20px">{chip("espuma", AZ, 56)}{chip("cola", AZ, 56)}{chip("grampo", AZ, 56)}</div>', gap=56))

# 13 — VIRADA
sc(1.9, 'A Romplas tem linha hospitalar,', 'linha / *hospitalar.*',
   'Arcos azul + ícone hospitalar da marca (trace)', 'MOTION', 'Ícone da marca em trace + lettering (virada da trilha)', 'zout',
   arcos() + center(icon('cruz-hospitalar', W, 230) + lettering('A Romplas tem linha', '*hospitalar.*', size=(64, 150)), gap=30))

# 14
sc(1.9, 'fácil de limpar e desinfetar,', 'fácil de limpar / e *desinfetar.*',
   'Mão com luva higienizando assento de vinil (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'panL',
   photo('m_limpar', dim=.08) + center(box([('fácil de limpar', 72, 400, ''), ('e *desinfetar.*', 116, 400, '')], tilt=False), top=1000, h=320))

# 15
sc(2.5, 'resistente a mancha e antiderrapante,', '*resistente a mancha* · *antiderrapante*',
   'Close do revestimento hospitalar Romplas (foto do cliente a pedir/gerar)', 'CLIENTE / IA', 'Mockup aplicado + chips', 'zin',
   photo('s_nautiplas', pos='45% 50%', scale=1.2) + center(f'<div class="chips">{chip("resistente a *mancha*")}{chip("*antiderrapante*")}</div>', top=1040, h=280))

# 16
sc(1.7, 'e linha para academia.', 'linha / *academia.*',
   'Bancos de academia estofados (Magnific) + ícone halter', 'MAG', 'Foto + ícone da marca + faixa', 'panD',
   photo('m_academia', dim=.15) + center(icon('halter', W, 200) + box([('e linha para', 60, 400, ''), ('*academia.*', 136, 400, '')], tilt=False), top=820, h=560, gap=24))

# 17
sc(2.5, 'Você vende mais para o mesmo tapeceiro,', 'vende *mais* / para o mesmo tapeceiro',
   'Lojista e tapeceiro no balcão (Magnific)', 'MAG', 'Box 3D sutil (2ª vez)', 'zout',
   photo('m_parceria', dim=.12) + center(box([('você vende', 62, 400, ''), ('*mais*', 150, 400, 'line-height:.9'), ('para o mesmo tapeceiro', 52, 400, 'margin-top:10px')])))

# 18
sc(1.9, 'sem precisar buscar cliente novo.', 'sem buscar / *cliente novo.*',
   'Fundo claro com arcos brancos', 'MOTION', 'Text label (colchete) — traço desenhando', 'panR',
   arcos(light=True) + center(rotulo('sem precisar buscar<br><b>cliente novo.</b>', color=AZ, px=84)))

# 19
sc(1.6, 'Quem fabrica é a Romplas,', 'quem fabrica: *Romplas*',
   'Fachada da fábrica Romplas (site) em faixa + logo peça por peça', 'CLIENTE', 'Foto + faixa + logo peça por peça', 'zin',
   f'<div style="position:absolute;inset:0;background:{AZ}"></div>' + band('d_fachada', pos='60% 50%', h=620, top=560) +
   center(f'<div class="over" style="color:#fff">Quem fabrica é a</div>' + logo(W, 640), top=1220, h=300, gap=26))

# 20
sc(2.4, 'a mesma indústria do Uruguai Original,', 'a mesma do *Uruguai Original®*',
   'Cartela Uruguai Original® (amostras reais)', 'CLIENTE', 'Foto em tela cheia + box', 'panL',
   photo('s_uruguai', pos='50% 50%', scale=1.0) + center(box([('a mesma indústria do', 58, 400, ''), ('*Uruguai*', 132, 400, 'line-height:.95'), ('*Original®*', 132, 400, 'line-height:.95')]), top=760, h=420))

# 21
grid = ''.join(icon(n, AZ, 150) for n in ['cruz-hospitalar', 'halter', 'sofa', 'poltrona', 'carro', 'barco', 'presente', 'monitor', 'caixa', 'bolsa', 'escudo'])
sc(2.1, 'que atende onze mercados diferentes', '*11* mercados',
   'Os 11 ícones de mercado da marca entrando em ondas', 'MOTION', 'Grade de ícones da marca (peça por peça, 3 ondas)', 'máscara',
   arcos(light=True) + center(f'<div style="display:flex;align-items:baseline;gap:24px;color:{AZ}"><span class="big" style="font-size:220px">11</span><span style="font-size:84px;font-weight:400;letter-spacing:-.03em">mercados.</span></div>'
       f'<div class="grid11">{grid}</div>', top=520, h=800, gap=50))

# 22 — CLÍMAX (entra pela máscara dos arcos)
sc(2.2, 'e tem trinta e dois anos de mercado.', '*32* anos de mercado.',
   'Arcos azul; número contando 0 → 32', 'MOTION', 'Pouso de perto + número contando (clímax: máscara dos arcos)', 'zin',
   arcos() + center(f'<div class="big" style="color:#fff">32</div><div style="color:#fff;font-size:84px;letter-spacing:-.03em">anos de <b>mercado.</b></div>', gap=10))

# 23
sc(1.5, 'Clique em Saiba Mais,', 'Saiba mais',
   'Fundo claro; botão + cursor clicando', 'MOTION', 'Botão de CTA com cursor (1º)', 'panR',
   f'<div style="position:absolute;inset:0;background:{CCL}"></div>' + center(cta('Saiba mais', 'claro')))

# 24
sc(1.7, 'faça o cadastro da sua loja', 'cadastro da *sua loja*',
   'Ficha de cadastro preenchendo (motion)', 'MOTION', 'Card com campos preenchendo', 'zout',
   arcos() + center('<div class="form"><h4>Cadastro da sua loja</h4><div class="field">Nome da loja<span class="ok">✓</span></div><div class="field">Cidade<span class="ok">✓</span></div><div class="field">WhatsApp<span class="ok">✓</span></div></div>'))

# 25
sc(1.6, 'e um especialista da Romplas', 'um *especialista* Romplas',
   'Equipe Romplas no showroom (foto do cliente) em faixa', 'CLIENTE', 'Foto em faixa + texto', 'panL',
   f'<div style="position:absolute;inset:0;background:{AZ}"></div>' + band('d_pessoas', pos='50% 40%', h=660, top=560) +
   center(f'<div style="color:#fff;font-size:74px;letter-spacing:-.02em">um <b>especialista</b> Romplas</div>', top=1250, h=120))

# 26
sc(2.1, 'entrará em contato para apresentar', 'entra em *contato*',
   'Consultor ao telefone (Magnific)', 'MAG', 'Foto tela cheia + faixa', 'zin',
   photo('m_especialista', dim=.1) + center(box([('entra em', 64, 400, ''), ('*contato.*', 150, 400, '')], tilt=False), top=980, h=320))

# 27
sc(2.0, 'as linhas hospitalar e de academia.', 'linhas *hospitalar* e *academia*',
   'Dois ícones da marca + rótulos', 'MOTION', 'Ícones da marca (trace) lado a lado', 'panU',
   f'<div style="position:absolute;inset:0;background:#fff"></div>' + center(f'<div class="over" style="color:{AZL}">as linhas</div>'
       f'<div class="row" style="gap:120px"><div class="col">{icon("cruz-hospitalar", AZ, 300)}<div class="lbl" style="color:{AZ}">hospitalar</div></div>'
       f'<div class="col">{icon("halter", AZ, 300)}<div class="lbl" style="color:{AZ}">academia</div></div></div>', gap=44))

# 28
sc(2.3, '(trilha)', 'Revestindo / *possibilidades.*',
   'Logo cresce do zero + assinatura da marca', 'MOTION', 'Crescer do zero (assinatura)', 'zout',
   arcos() + center(logo(W, 700) + lettering('Revestindo', '*possibilidades.*', size=(70, 92)), gap=70))

# 29
sc(2.6, '(trilha)', 'Saiba mais · cadastre sua loja.',
   'Botão + cursor clicando + texto abaixo', 'MOTION', 'Botão de CTA com cursor (fecho)', 'fim',
   f'<div style="position:absolute;inset:0;background:{CCL}"></div>' + center(cta('Saiba mais', 'claro', 'e cadastre <b>sua loja.</b>')))

t = 0
for i, s in enumerate(S, 1):
    s['n'] = i; s['t0'] = round(t, 1); t += s['dur']; s['t1'] = round(t, 1)

if __name__ == '__main__':
    build([(s['n'], s['html']) for s in S], os.path.join(ROOT, 'sb', 'frames.html'))
    meta = [{k: v for k, v in s.items() if k != 'html'} for s in S]
    json.dump(meta, open(os.path.join(ROOT, 'sb', 'scenes.json'), 'w'), ensure_ascii=False, indent=1)
    print('cenas', len(S), 'duração', round(t, 1))

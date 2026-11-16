# Dados do storyboard aprovado (https://claude.ai/artifact/HthfyTLrVAzCPrKmKZyqhq). A versão para o motor está em ../video1/roteiro.py
# Storyboard Romplas HP — dados das cenas (tempos estimados a 2,75 palavras/s)
import json, re

CLIPS = {
 '9665202': ('Mão escolhendo amostras de tecido no mostruário', 'https://www.magnific.com/premium-video/slow-motion-video-with-selective-focus-hand-selecting-colorful-fabric-swatches-from-catalog-interior-design-upholstery-projects_9665202'),
 '9976175': ('Lancha vazia com toldo, assentos expostos ao sol', 'https://www.magnific.com/premium-video/point-view-shot-from-inside-empty-exploration-speedboat-with-sun-canopy-waiting-near-remote-pristine-sandy-beach-wild-coastal-vegetation-tropical-expedition-video-vertical-4k-dlog_9976175'),
 '8156219': ('Espuma e água revolta atrás do barco', 'https://www.magnific.com/premium-video/dynamic-vertical-shot-focusing-turbulent-white-foam-waves-boat_8156219'),
 '5459155': ('Onda batendo e spray de maresia em câmera lenta', 'https://www.magnific.com/premium-video/sea-waves-are-colliding-with-underwater-reefs-sea-spray-close-up-water-drops-slow-motion-vertical-video_5459155'),
 '8443488': ('Sol forte brilhando no mar', 'https://www.magnific.com/premium-video/bright-sun-reflecting-sparkling-calm-blue-ocean-water_8443488'),
 '9813181': ('Close de revestimento ressecado e rachado ao sol', 'https://www.magnific.com/premium-video/vertical-video-catching-warm-light-cracked-leather-by-car-windshield-holding-amber-drop-seam_9813181'),
 '10610973': ('Estofado desbotado e craquelado', 'https://www.magnific.com/premium-video/slow-camera-slide-across-aged-green-tufted-leather-sofa-with-textured-cracks-light-flare_10610973'),
 '8762131': ('Mão sobre estofado rasgado (alternativa)', 'https://www.magnific.com/premium-video/vertical-video-placing-adult-hand-testing-worn-black-leather-surface-close-up-showing-yellow-tear_8762131'),
 '8378885': ('Cliente no balcão da loja pedindo explicação', 'https://www.magnific.com/premium-video/vertical-video-walking-woman-tugging-bag-strap-counter-asking-help-staff-olive-apron-aiding_8378885'),
 '6852186': ('Lojista se explicando para o cliente no balcão', 'https://www.magnific.com/premium-video/man-store-helping-customer_6852186'),
 '9677998': ('Lojista com dor de cabeça na oficina', 'https://www.magnific.com/premium-video/bearded-craftsman-experiencing-headache-his-workshop_9677998'),
 '10606752': ('Gotas de água sobre tecido impermeável', 'https://www.magnific.com/premium-video/raindrops-falling-waterproof-fabric-surface_10606752'),
 '7119846': ('Gotas escorrendo em estofado que repele água (alternativa)', 'https://www.magnific.com/premium-video/vertical-video-cam-panning-drops-beading-merging-seam-lint-sticking-as-fabric-repelling-water_7119846'),
 '10134042': ('Mão limpando com pano no barco, marina', 'https://www.magnific.com/premium-video/vertical-video-picking-up-rag-boat-owner-hands-cleaning-boom-marina-removing-salt_10134042'),
 '9976443': ('Lancha branca com assentos azuis impecáveis', 'https://www.magnific.com/premium-video/vertical-smartphone-video-panning-right-from-inside-white-motorboat-bimini-top-canopy-canopy-shade-showcasing-calm-multi-toned-turquoise-waters-remote-caribbean-beach_9976443'),
 '8310335': ('Lojista sorrindo no caixa, cliente chegando para pagar', 'https://www.magnific.com/premium-video/vertical-video-greeting-male-staff-green-shirt-gray-apron-pos-while-woman-approaches-pay_8310335'),
 '7402311': ('Mesmo lojista atendendo cliente que voltou', 'https://www.magnific.com/premium-video/vertical-video-smiling-worker-apron-serving-customer-entering-right-cafe-counter-with_7402311'),
 '7283092': ('Aérea: lancha branca cortando o mar azul', 'https://www.magnific.com/premium-video/aerial-view-white-motorboat-speeding-across-open-sea-creating-white-foam-waves-perfect-travel-vacation-maritime-lifestyle-content_7283092'),
 '9177033': ('Aérea: iate branco em água azul (alternativa)', 'https://www.magnific.com/premium-video/aerial-view-white-motor-yacht-sailboats-blue-water-near-south-stradbroke_9177033'),
 '9658542': ('Laminado sintético passando no rolo da fábrica', 'https://www.magnific.com/premium-video/vertical-video-motor-driving-coated-tarp-plant-roller-tension-showing-stitched-hem_9658542'),
 '7182299': ('Dono da loja no telefone e notebook', 'https://www.magnific.com/premium-video/craftsman-talking-phone-working-laptop-workshop_7182299'),
 '9698555': ('Especialista sorrindo ao telefone', 'https://www.magnific.com/premium-video/smiling-businessman-talking-smartphone-office_9698555'),
}

# exit: zin zout panL panR panU mask none
S = [
 dict(t='Lojista que vende material', kind='broll', clip='9665202', focus='50% 55%', layout='letterbox', exit='zin',
      screen='LETTERBOX: Seu cliente de barco / volta reclamando / do revestimento?', forma='Box 3D sutil (letterbox)',
      motion='Box azul-institucional entra em perspectiva (rotateY 12°→4°), linhas sobem uma a uma; sem legenda de narração'),
 dict(t='para estofado de barco:', kind='broll', clip='9976175', focus='50% 60%', layout='letterbox2', exit='panR',
      screen='(mesmo box, completo)', forma='Foto em tela cheia + box', motion='B-roll troca por baixo com zoom; o box fica e deriva 1°; sai junto no pan'),
 dict(t='você sabe o que acontece quando', kind='broll', clip='8156219', focus='50% 50%', layout='cap', cap=['Você sabe o que', '*acontece*…'], exit='zout',
      forma='Foto em tela cheia', motion='Entra pela direita (pan); zoom do meio in 13%'),
 dict(t='o revestimento não aguenta o mar.', kind='broll', clip='5459155', focus='50% 55%', layout='cap', cap=['o revestimento', 'não aguenta o *mar.*'], exit='panL',
      forma='Foto em tela cheia', motion='Nasce em 0,82 e volta a 1; spray em câmera lenta'),
 dict(t='Um verão de sol e maresia', kind='broll', clip='8443488', focus='50% 62%', layout='cap', cap=['Um verão de *sol*', 'e maresia'], exit='zin',
      forma='Foto em tela cheia', motion='Entra pela direita; legenda colada abaixo do reflexo do sol'),
 dict(t='e o estofado resseca,', kind='broll', clip='9813181', focus='50% 50%', layout='cap', cap=['e o estofado', '*resseca,*'], exit='zout',
      forma='Foto em tela cheia (close)', motion='Nasce em 1,2 e volta a 1 (zoom out), aceleração começa'),
 dict(t='desbota e racha.', kind='broll', clip='10610973', focus='50% 50%', layout='big', big=['desbota', 'e *racha.*'], exit='panU',
      forma='Palavra grande letra por letra', motion='Palavras montam letra por letra (stagger 1 f), fundo escurecido 30%'),
 dict(t='O cliente volta na sua loja', kind='broll', clip='8378885', focus='45% 45%', layout='cap', cap=['O cliente volta', 'na sua *loja*'], exit='zin',
      forma='Foto em tela cheia', motion='Entra de baixo (pan vertical); legenda colada abaixo das duas pessoas'),
 dict(t='reclamando, e quem leva a culpa', kind='broll', clip='6852186', focus='50% 42%', layout='cap', cap=['*reclamando,*', 'e quem leva a culpa'], exit='panR',
      forma='Foto em tela cheia', motion='Nasce em 1,2 e volta a 1'),
 dict(t='é você, não o fabricante.', kind='broll', clip='9677998', focus='50% 40%', layout='box3dLight', lines=[['É *você.*', 104], ['Não o fabricante.', 64]], exit='zout',
      forma='Box 3D sutil (branco)', motion='Box branco entra em perspectiva sobre o lojista; linhas sobem'),
 dict(t='O HP foi feito para isso:', kind='product', img='hp', layout='hpReveal', exit='panL', pivot=True,
      forma='Pouso de perto (lettering)', motion='VIRADA da trilha. Foto do HP; “HP.” pousa de perto (125%→100%, blur 14→0); traço curvo da marca desenha em 0,7 s'),
 dict(t='alta resistência à água,', kind='broll', clip='10606752', focus='50% 50%', layout='cap', cap=['Alta resistência', 'à *água,*'], exit='zin',
      forma='Foto em tela cheia', motion='Entra pela direita; gotas em close'),
 dict(t='aos raios UV e à abrasão,', kind='motion', layout='selos', exit='zout',
      forma='Contorno da marca (trace) — selos', motion='Fundo arcos azul. Três selos da marca desenham o círculo por trace (0,75 s, stagger 0,15); “Raios UV” e “Abrasão” acendem na fala'),
 dict(t='com manutenção mínima', kind='broll', clip='10134042', focus='50% 50%', layout='cap', cap=['Manutenção', '*mínima*'], exit='panR',
      forma='Foto em tela cheia', motion='Nasce em 0,82 e sobe a 1'),
 dict(t='e aparência de novo', kind='broll', clip='9976443', focus='50% 62%', layout='cap', cap=['e aparência', 'de *novo*'], exit='zin',
      forma='Pan entre duas imagens', motion='Entra pela esquerda; deriva lenta mostrando os assentos'),
 dict(t='por mais tempo.', kind='product', img='hpBoat', layout='rotulo', rot='Por mais tempo.', exit='zout',
      forma='Mockup aplicado + text label', motion='HP aplicado no assento do barco; text label “sublinhado” desenha o traço em 0,7 s'),
 dict(t='Você vende uma vez', kind='broll', clip='8310335', focus='38% 40%', layout='cap', cap=['Você vende', '*uma vez*'], exit='panL',
      forma='Foto em tela cheia', motion='Nasce em 0,82 e sobe a 1'),
 dict(t='e o cliente volta', kind='broll', clip='7402311', focus='45% 40%', layout='cap', cap=['e o cliente', '*volta*'], exit='zin',
      forma='Foto em tela cheia', motion='Entra pela direita, mesmo lojista (continuidade)'),
 dict(t='para comprar de novo,', kind='motion', layout='letteringLight', lt=['para comprar', 'de novo.'], exit='zout',
      forma='Lettering da marca (traço onda)', motion='Fundo cinza-claro com arcos brancos; lettering linha por linha, traço “onda” desenha embaixo'),
 dict(t='não para reclamar.', kind='motion', layout='bigAzul', big=['Não para', 'reclamar.'], exit='panR',
      forma='Palavra grande palavra por palavra', motion='Fundo azul-institucional; “reclamar.” ganha um traço que risca a palavra (trace 0,6 s)'),
 dict(t='É a nova linha náutica', kind='broll', clip='7283092', focus='50% 50%', layout='rotuloColchete', rot='Nova linha náutica.', exit='mask',
      forma='Text label colchete + máscara dos arcos (clímax)', motion='Entra pela esquerda; text label desenha os colchetes. Saída: os discos dos arcos varrem a tela (1 vez no vídeo)'),
 dict(t='da Romplas, a fabricante', kind='broll', clip='9658542', focus='50% 50%', layout='cap', cap=['da *Romplas,*', 'a fabricante'], exit='zin',
      forma='Foto em tela cheia (fábrica)', motion='Nasce de dentro dos arcos; laminado correndo no rolo (ideal: vídeo da fábrica da Romplas)'),
 dict(t='do Uruguai Original,', kind='product', img='uruguai', layout='cap', cap=['do *Uruguai*', '*Original®*'], exit='zout',
      forma='Foto do produto', motion='Foto/rolo do Uruguai Original, push lento'),
 dict(t='trinta e dois anos', kind='motion', layout='stat', exit='panL',
      forma='Número contando', motion='Fundo arcos azul; “32” conta de 0 a 32 em 0,8 s, “anos” entra em seguida'),
 dict(t='fazendo revestimento sintético.', kind='motion', layout='selo1', exit='zin',
      forma='Selo da marca (trace)', motion='Fundo cinza-claro; selo Revestimentos Sintéticos desenha o círculo por trace, ícone de camadas entra peça por peça'),
 dict(t='Clique em Saiba Mais,', kind='motion', layout='cta1', exit='zin',
      forma='Botão de CTA com cursor', motion='Botão branco canto vivo entra (0,85→1); cursor vem de baixo/direita e clica no “Saiba mais”'),
 dict(t='faça o cadastro da sua loja', kind='motion', layout='form', exit='panR',
      forma='Card de cadastro (UI)', motion='Card branco canto vivo sobe; campos preenchem um a um (Loja, Cidade, WhatsApp) com check'),
 dict(t='e um especialista da Romplas', kind='broll', clip='9698555', focus='50% 38%', layout='cap', cap=['um especialista', 'da *Romplas*'], exit='zout',
      forma='Foto em tela cheia', motion='Entra pela esquerda; especialista liga'),
 dict(t='entrará em contato', kind='broll', clip='7182299', focus='50% 40%', layout='cap', cap=['entrará em', '*contato*'], exit='panL',
      forma='Foto em tela cheia', motion='Nasce em 0,82; lojista atende o telefone (resposta da cena anterior)'),
 dict(t='para apresentar o HP.', kind='product', img='hp2', layout='cap', cap=['para apresentar', 'o *HP.*'], exit='zin',
      forma='Foto do produto (close)', motion='Close do HP com luz rasante, push lento'),
 dict(t='', kind='motion', layout='logoSign', exit='zout', dur=2.0,
      forma='Logo crescendo do zero', motion='Logo mono branco cresce (1,05 s, curva LOGO), sobe e encolhe −25%; “Revestindo possibilidades.” entra com o traço gancho'),
 dict(t='', kind='motion', layout='cta2', exit='fade', dur=2.5,
      forma='Botão de CTA com cursor (final)', motion='Botão “Saiba mais” entra, cursor clica em 1,4 s (onda + clique), textinho revela linha por linha; tela assenta'),
]

def est(text):
    if not text: return 0
    w = len(text.split())
    d = w * 0.364
    d += text.count(',') * 0.12 + text.count(':') * 0.15 + text.count('.') * 0.25
    return round(max(d, 1.5), 2)

t = 0.0
for i, s in enumerate(S, 1):
    s['n'] = i
    s['dur'] = s.get('dur') or est(s['t'])
    s['start'] = round(t, 2); t += s['dur']; s['end'] = round(t, 2)
if __name__ == '__main__':
    for s in S:
        flag = ' <-- >2.5' if s['dur'] > 2.5 else ''
        print(f"{s['n']:2d} {s['start']:5.2f}-{s['end']:5.2f} ({s['dur']:.2f}) {s['t']}{flag}")
    print('total', round(t, 2), 'palavras', sum(len(s['t'].split()) for s in S))
    json.dump({'scenes': S, 'clips': CLIPS}, open('scenes.json', 'w'), ensure_ascii=False, indent=1)

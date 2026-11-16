// Cenas de plano (modo "shots", vídeo narrado montado plano a plano). Área 1080x1920; conteúdo na faixa útil (y 540–1300).
// A câmera de entrada/saída (zoom/pan) é aplicada depois, no composite, ao quadro inteiro (b-roll + gráfico).
// Aqui ficam só as entradas dos elementos e o zoom do meio (no .sw, em main.js).
// Cores e fontes vêm da marca: --c1 (cor principal), --paper, --ink, --stroke (traço decorativo), --bg2.
const SB = {};
const EIN = 'expo.out', EOUT = 'expo.in', ESC = 'power4.inOut';
const C1 = 'var(--c1)', PAP = 'var(--paper)', INK = 'var(--ink)', STK = 'var(--stroke)';
const rich = s => String(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const zoneTop = (y, h) => `top:${Math.round(y - h / 2)}px;height:${h}px`;
// linhas: [[texto, px, {extra}]] -> divs .ln
function linesHTML(lines, color) {
  return lines.map(l => `<div class="ln2" style="font-size:${l[1] || 76}px;${color ? 'color:' + color + ';' : ''}${(l[2] && l[2].css) || ''}">${rich(l[0])}</div>`).join('');
}
function inLines(tl, els, t0, st = .12, d = .62) {
  els.forEach((e, i) => tl.fromTo(e, { y: 34, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: d, ease: EIN }, t0 + i * st));
}
function inWords(tl, ln, t0, st = .08) {
  const ws = ln.innerHTML.split(/(<b>.*?<\/b>|\s+)/).filter(x => x && !/^\s+$/.test(x));
  ln.innerHTML = ws.map(w => `<span class="wd">${w}</span>`).join(' ');
  ln.querySelectorAll('.wd').forEach((w, i) => tl.fromTo(w, { y: 46, opacity: 0, filter: 'blur(18px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .66, ease: EIN }, t0 + i * st));
  return ln.querySelectorAll('.wd').length;
}
function inLetters(tl, el, t0, st = .045) {
  const txt = el.textContent; el.innerHTML = [...txt].map(c => `<span class="lt">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  el.querySelectorAll('.lt').forEach((c, i) => tl.fromTo(c, { y: '40%', opacity: 0, filter: 'blur(10px)' }, { y: '0%', opacity: 1, filter: 'blur(0px)', duration: .55, ease: EIN }, t0 + i * st));
}
// pouso de perto: 1,3 -> 1 com desfoque saindo
function land(tl, el, t, from = 1.3, d = .8) { tl.fromTo(el, { scale: from, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: d, ease: EIN }, t); }
// traço da marca sob um elemento: reta que sobe em curva no fim (gancho)
function tracoHTML(color) { return `<svg class="trc" style="position:absolute;left:0;top:0;overflow:visible"><path fill="none" stroke="${color || STK}" stroke-width="5" stroke-linecap="round"/></svg>`; }
function layoutTraco(host, kind = 'gancho') {
  const svg = host.querySelector('svg.trc'), p = svg.querySelector('path');
  const w = host.offsetWidth, h = host.offsetHeight;
  svg.setAttribute('width', w + 40); svg.setAttribute('height', h + 40);
  const y = h + 8;
  if (kind === 'gancho') p.setAttribute('d', `M2 ${y} L${w - 30} ${y} C${w + 10} ${y} ${w + 30} ${y - 22} ${w + 32} ${y - 62}`);
  else p.setAttribute('d', `M2 ${y} C${w * .3} ${y + 10} ${w * .7} ${y - 8} ${w + 30} ${y - 2}`);
  return p;
}
function drawPath(tl, path, t, d = .7, ease = ESC) {
  const len = path.getTotalLength();
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease }, t);
}
function counter(tl, el, to, t, d = .9, fmt = n => n) {
  const o = { n: 0 }; el.textContent = fmt(0);
  tl.to(o, { n: to, duration: d, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(Math.round(o.n)); } }, t);
}
const ptBR = n => n.toLocaleString('pt-BR');
const svgInline = (key, css = '') => (SVGT[key] || '').replace('<svg', `<svg style="${css}"`);

// ---------- caixa de texto (texto sobre foto sempre na caixa da marca) ----------
// p: lines [[txt, px]], y (centro), hook (palavra por palavra), maskOut (máscara dos arcos no fim do plano)
SB.boxText = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 920, 600)}"><div class="bx">${linesHTML(p.lines)}</div></div>
    ${p.maskOut ? `<div class="mask">${MASK.map(c => `<i style="left:${c[0] - c[2]}px;top:${c[1] - c[2]}px;width:${c[2] * 2}px;height:${c[2] * 2}px;background:${c[3]}"></i>`).join('')}</div>` : ''}`,
  sfx: (p, L) => (p.hook ? [['hook_word', .35]] : []).concat(p.maskOut ? [['brand_reveal', L - .55]] : []),
  build(tl, el, p, L) {
    const bx = el.querySelector('.bx'), lns = [...el.querySelectorAll('.ln2')];
    tl.fromTo(bx, { y: 40, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, ease: EIN }, 0);
    if (p.hook) { let t = .08; lns.forEach(ln => { const n = inWords(tl, ln, t); t += n * .08 + .04; }); }
    else inLines(tl, lns, .1);
    const m = el.parentNode.querySelector('.mask');
    if (m) m.querySelectorAll('i').forEach((c, i) => tl.fromTo(c, { scale: 0 }, { scale: 1, duration: .55, ease: 'power3.inOut' }, L - .62 + i * .05));
  }
};
// arcos da marca (círculos do fundo-arcos-azul em 1080x1920, ancorados no canto inferior direito) + disco que cobre a tela
const MASK = [[703, 1545, 2300, 'var(--c1)'], [703, 1545, 1403, 'var(--stroke)'], [827, 1522, 1214, 'var(--c1)'], [919, 1475, 992, 'var(--bg2)'], [1024, 1440, 785, 'var(--c1)'], [1165, 1425, 611, 'var(--stroke)']];

// ---------- ícones da marca em selos de traço + texto ----------
SB.iconSeals = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 700)}">
    <div style="display:flex;gap:56px;margin-bottom:60px">${p.icons.map(k => `<div class="seal"><svg class="ring" viewBox="0 0 300 300"><circle cx="150" cy="150" r="146" fill="none" stroke="${C1}" stroke-width="4"/></svg><div class="ic2">${svgInline(k, 'width:100%;height:100%')}</div></div>`).join('')}</div>
    ${linesHTML(p.lines, C1)}</div>`,
  sfx: p => [['icon_pop', .3], ['icon_pop', .45]],
  build(tl, el, p, L) {
    el.querySelectorAll('.seal').forEach((s, i) => {
      drawPath(tl, s.querySelector('circle'), i * .1, .7);
      land(tl, s.querySelector('.ic2'), .04 + i * .1, 1.35, .75);
    });
    inLines(tl, [...el.querySelectorAll('.ln2')], .2);
  }
};

// ---------- símbolo da marca (parado ou girando) ----------
SB.symbol = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}">
    <div class="sym" style="width:${p.size || 420}px;height:${p.size || 420}px;margin-bottom:46px;color:${p.color}">${svgInline(p.svg || 'symbol', 'width:100%;height:100%;overflow:visible')}</div>
    ${linesHTML(p.lines, p.textColor)}</div>`,
  sfx: p => p.spin ? [['big_word', .9]] : [],
  build(tl, el, p, L) {
    const sym = el.querySelector('.sym'), path = sym.querySelector('path');
    path.setAttribute('stroke', p.color); path.setAttribute('stroke-width', '2.4'); path.setAttribute('fill', p.color);
    tl.set(path, { fillOpacity: 0 }, 0);
    land(tl, sym, 0, 1.25, .8);                 // já aparece no 1º quadro, pousando
    drawPath(tl, path, 0, .6);
    tl.to(path, { fillOpacity: 1, duration: .35, ease: 'power2.out' }, .4);
    if (p.spin) {
      tl.fromTo(sym, { rotation: 0 }, { rotation: -360, duration: 1.0, ease: ESC }, .45);
      tl.to(sym, { keyframes: { filter: ['blur(0px)', 'blur(5px)', 'blur(0px)'] }, duration: 1.0, ease: 'none' }, .45);
    } else {
      tl.to(sym, { rotation: -12, duration: .45, ease: 'power2.out' }, .7);
      tl.to(sym, { rotation: 0, duration: .6, ease: 'power2.inOut' }, 1.15);
    }
    inLines(tl, [...el.querySelectorAll('.ln2')], .15);
  }
};

// ---------- produto: duas fotos com nome, pan entre elas ----------
// p: items [{img, name, contain}], swapAt, labelColor
SB.productPan = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="pp">${p.items.map((it, i) => `
    <div class="pit" style="${i ? 'opacity:0' : ''}">
      ${it.contain ? `<img src="${ASSET[it.img]}" style="width:${it.w || 720}px;height:auto;display:block">` : `<img class="card2" src="${ASSET[it.img]}">`}
      <div class="lbl2" style="color:${p.labelColor || C1}">${it.name}${tracoHTML(STK)}</div></div>`).join('')}</div></div>`,
  sfx: p => [['scene_cut', p.swapAt - .1]],
  build(tl, el, p, L) {
    const its = [...el.querySelectorAll('.pit')], a = its[0], b = its[1];
    land(tl, a, 0, 1.1, .75);
    const pa = layoutTraco(a.querySelector('.lbl2')); drawPath(tl, pa, .3, .55);
    if (!b) return;
    const pb = layoutTraco(b.querySelector('.lbl2'));
    tl.to(a, { x: -1100, duration: .5, ease: 'power3.in' }, p.swapAt - .3);
    tl.fromTo(b, { x: 1100, opacity: 1 }, { x: 0, duration: .65, ease: EIN }, p.swapAt);
    tl.set(pb, { strokeDasharray: 9999, strokeDashoffset: 9999 }, 0);
    drawPath(tl, pb, p.swapAt + .25, .5);
  }
};

// ---------- número dentro de círculo desenhado ----------
SB.ringNumber = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}">
    <div class="rn"><svg viewBox="0 0 440 440" style="position:absolute;inset:0;overflow:visible"><circle cx="220" cy="220" r="218" fill="none" stroke="${p.color || PAP}" stroke-width="4"/></svg>
    <div class="num big2" style="font-size:150px;color:${p.color || PAP}">0</div></div>
    ${linesHTML(p.lines, p.color || PAP)}</div>`,
  sfx: p => [['counter', .3]],
  build(tl, el, p, L) {
    drawPath(tl, el.querySelector('circle'), 0, .75);
    land(tl, el.querySelector('.num'), .05, 1.3, .7);
    counter(tl, el.querySelector('.num'), p.to, .1, .85, n => n + (p.suffix || ''));
    inLines(tl, [...el.querySelectorAll('.ln2')], .35);
  }
};

// ---------- texturas reais em faixas + selo da marca ----------
SB.stripes = {
  html: p => `<div class="strips">${p.imgs.map(k => `<div class="stp" style="background-image:url(${ASSET[k]})"></div>`).join('')}</div><div class="dim2"></div>
    <div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="seal2" style="width:${p.size || 560}px">${svgInline(p.seal, 'width:100%;height:auto;overflow:visible')}</div></div>`,
  sfx: p => [['brand_reveal', .55]],
  build(tl, el, p, L) {
    el.parentNode.querySelectorAll('.stp').forEach((s, i) => tl.fromTo(s, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: EIN }, i * .07));
    tl.fromTo(el.parentNode.querySelector('.dim2'), { opacity: 0 }, { opacity: 1, duration: .5 }, .2);
    const s = el.querySelector('.seal2'), c = s.querySelector('circle');
    if (c) drawPath(tl, c, .4, .7);
    land(tl, s, .4, 1.25, .8);
  }
};

// ---------- logo da marca peça por peça ----------
SB.logoBuild = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}">${p.pre ? linesHTML([[p.pre, 60]], PAP) : ''}
    <div class="lg" style="width:${p.w || 760}px;margin:34px 0 ${p.label ? 70 : 0}px">${svgInline(p.svg || 'logo', 'width:100%;height:auto;overflow:visible')}</div>
    ${p.label ? `<div class="lbl2" style="font-size:54px;color:${PAP}">${rich(p.label)}${tracoHTML(PAP)}</div>` : ''}</div>`,
  sfx: p => [['brand_reveal', .25]],
  build(tl, el, p, L) {
    inLines(tl, [...el.querySelectorAll('.ln2')], 0);
    el.querySelectorAll('.lg path').forEach((pp, i) => tl.fromTo(pp, { y: 40, rotation: -8, opacity: 0, filter: 'blur(12px)', transformOrigin: '50% 50%' }, { y: 0, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: .7, ease: EIN }, .12 + i * .06));
    const lb = el.querySelector('.lbl2');
    if (lb) { inLines(tl, [lb], .6); drawPath(tl, layoutTraco(lb), .8, .6); }
  }
};

// ---------- lettering: linhas + traço curvo (assinatura tipográfica) ----------
SB.lettering = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="lt2" style="text-align:${p.align || 'center'}">${linesHTML(p.lines.slice(0, -1), p.color || PAP)}
    <div class="lbl2 ln2" style="font-size:${p.lines.at(-1)[1]}px;color:${p.color || PAP}">${rich(p.lines.at(-1)[0])}${tracoHTML(p.stroke || STK)}</div></div></div>`,
  build(tl, el, p, L) {
    inLines(tl, [...el.querySelectorAll('.ln2')], .05, .14);
    drawPath(tl, layoutTraco(el.querySelector('.lbl2')), .45, .65);
  }
};

// ---------- número grande contando ----------
SB.bigNumber = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="num big2" style="font-size:${p.size || 340}px;line-height:.85;color:${p.color || C1}">0</div>${linesHTML(p.lines, p.color || C1)}</div>`,
  sfx: p => [['counter', .1]],
  build(tl, el, p, L) {
    land(tl, el.querySelector('.num'), 0, 1.3, .8);
    counter(tl, el.querySelector('.num'), p.to, .05, .85, n => (p.prefix || '') + ptBR(n));
    inLines(tl, [...el.querySelectorAll('.ln2')], .3);
  }
};

// ---------- box 3D sutil ----------
SB.box3d = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)};perspective:1400px"><div class="b3 bx" style="padding:56px 90px 64px">
    <div class="num big2" style="font-size:${p.size || 200}px">0</div>${linesHTML(p.lines)}</div></div>`,
  sfx: p => [['counter', .2]],
  build(tl, el, p, L) {
    const b = el.querySelector('.b3');
    tl.fromTo(b, { rotationY: 12, rotationX: -6, z: -120, opacity: 0, filter: 'blur(10px)' }, { rotationY: 4, rotationX: -2, z: 0, opacity: 1, filter: 'blur(0px)', duration: .85, ease: EIN }, 0);
    tl.to(b, { rotationY: 1, rotationX: 0, z: 20, duration: Math.max(.2, L - .85), ease: 'none' }, .85);
    counter(tl, el.querySelector('.num'), p.to, .15, .9, n => (p.prefix || '') + ptBR(n));
    inLines(tl, [...el.querySelectorAll('.ln2')], .3);
  }
};

// ---------- rótulo com traço + seta (aponta para o botão do anúncio) ----------
SB.labelArrow = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}">${linesHTML([[p.pre, 84]], PAP)}
    <div class="lbl2" style="font-size:124px;font-weight:700;color:${PAP};margin-top:8px">${rich(p.label)}${tracoHTML(STK)}</div>
    <svg class="arw" viewBox="0 0 120 220" style="width:96px;height:176px;margin-top:46px;overflow:visible"><path d="M60 6 C60 70 62 120 60 196" fill="none" stroke="${STK}" stroke-width="5" stroke-linecap="round"/><path d="M28 166 L60 204 L92 166" fill="none" stroke="${PAP}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`,
  sfx: p => [['big_word', .25]],
  build(tl, el, p, L) {
    inLines(tl, [...el.querySelectorAll('.ln2')], 0);
    const lb = el.querySelector('.lbl2'); land(tl, lb, .12, 1.25, .75);
    drawPath(tl, layoutTraco(lb), .45, .55);
    const ps = el.querySelectorAll('.arw path'); drawPath(tl, ps[0], .55, .5); drawPath(tl, ps[1], .85, .3, EIN);
    tl.to(el.querySelector('.arw'), { y: 16, duration: .35, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 1.1);
  }
};

// ---------- formulário de cadastro ----------
SB.formCard = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 820)}">${linesHTML([[p.title, 84]], PAP)}
    <div class="frm">${p.fields.map(f => `<div class="fld"><div class="fl">${f[0]}</div><div class="fv"><span class="tx" data-v="${f[1]}"></span><i class="caret"></i></div></div>`).join('')}
    <div style="display:flex;justify-content:flex-end"><div class="ok"><svg viewBox="0 0 24 24" width="50" height="50"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div></div>`,
  sfx: p => [['typing', .45, 1.3], ['check', 1.45]],
  build(tl, el, p, L) {
    inLines(tl, [...el.querySelectorAll('.ln2')], 0);
    tl.fromTo(el.querySelector('.frm'), { y: 60, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .75, ease: EIN }, .1);
    el.querySelectorAll('.fld').forEach((f, i) => {
      const tx = f.querySelector('.tx'), v = tx.dataset.v, o = { n: 0 }, t = .45 + i * .3;
      tl.to(o, { n: v.length, duration: .28, ease: 'none', onUpdate: () => { tx.textContent = v.slice(0, Math.round(o.n)); } }, t);
      tl.set(f.querySelector('.caret'), { opacity: 1 }, t); tl.set(f.querySelector('.caret'), { opacity: 0 }, t + .3);
    });
    const ok = el.querySelector('.ok'); land(tl, ok, 1.4, 1.4, .5); drawPath(tl, ok.querySelector('path'), 1.5, .35, EIN);
  }
};

// ---------- grade de imagens (linha de produtos) ----------
SB.imageGrid = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 820)}">${linesHTML([[p.title, 84]], C1)}
    <div class="grd">${p.items.map(it => `<div class="gt" style="${it.contain ? 'background:#F1F1F1;display:grid;place-items:center' : ''}"><img src="${ASSET[it.img]}" style="${it.contain ? 'width:94%;height:auto' : 'width:100%;height:100%;object-fit:cover'}"></div>`).join('')}</div></div>`,
  sfx: p => [['pill', .25], ['pill', .4], ['pill', .55]],
  build(tl, el, p, L) {
    inLines(tl, [...el.querySelectorAll('.ln2')], 0);
    el.querySelectorAll('.gt').forEach((g, i) => tl.fromTo(g, { scale: .86, opacity: 0, filter: 'blur(10px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .6, ease: EIN }, .2 + Math.floor(i / 2) * .15 + (i % 2) * .04));
  }
};

// ---------- assinatura: logo cresce do zero, sobe e abre espaço ao lettering ----------
SB.logoSign = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="lgs" style="width:${p.w || 760}px">${svgInline(p.svg || 'logo', 'width:100%;height:auto;overflow:visible')}</div>
    <div class="lt2" style="text-align:left;position:absolute;top:${p.textTop || 470}px">${linesHTML(p.lines.slice(0, -1), PAP)}
    <div class="lbl2 ln2" style="font-size:${p.lines.at(-1)[1]}px;color:${PAP}">${rich(p.lines.at(-1)[0])}${tracoHTML(STK)}</div></div></div>`,
  sfx: p => [['brand_reveal', .1]],
  build(tl, el, p, L) {
    const lg = el.querySelector('.lgs');
    tl.fromTo(lg, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.05, ease: 'power3.out' }, 0);
    tl.to(lg, { y: -150, scale: .78, duration: .9, ease: ESC }, .95);
    inLines(tl, [...el.querySelectorAll('.lt2 .ln2')], 1.15, .14);
    drawPath(tl, layoutTraco(el.querySelector('.lt2 .lbl2')), 1.45, .6);
  }
};

// ---------- CTA: botão de canto da marca + cursor clicando ----------
SB.ctaButton = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}">
    <div class="btn2"><span>${p.cta}</span><i class="shine"></i><i class="wave"></i></div>
    <div class="sub2">${(p.sub || []).map(s => `<div class="ln2" style="font-size:58px;color:${C1}">${rich(s)}</div>`).join('')}</div>
    <svg class="cur" viewBox="0 0 64 80"><path d="M8 6 L8 60 L22 48 L32 72 L42 68 L32 44 L52 44 Z" fill="#fff" stroke="${C1}" stroke-width="4" stroke-linejoin="round"/></svg></div>`,
  sfx: p => [['cta_click', p.clickAt || 1.4]],
  build(tl, el, p, L) {
    const b = el.querySelector('.btn2'), c = el.querySelector('.cur'), ck = p.clickAt || 1.4;
    tl.fromTo(b, { scale: .85, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: EIN }, 0);
    // cursor: chega de baixo/direita em curva, inclinado, e endireita
    tl.fromTo(c, { x: 420, y: 520, rotation: -12, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .85, ease: ESC }, ck - .9);
    tl.to(c, { scale: .85, duration: .1, ease: 'power2.in' }, ck); tl.to(c, { scale: 1, duration: .1, ease: 'power2.out' }, ck + .1);
    tl.to(b, { scale: .95, duration: .12, ease: 'power2.in' }, ck); tl.to(b, { scale: 1, duration: .13, ease: 'power2.out' }, ck + .12);
    tl.fromTo(b.querySelector('.wave'), { scale: 0, opacity: .5 }, { scale: 1.6, opacity: 0, duration: .5, ease: 'power2.out' }, ck);
    tl.fromTo(b.querySelector('.shine'), { x: '-120%' }, { x: '220%', duration: .45, ease: 'power2.inOut' }, ck + .05);
    inLines(tl, [...el.querySelectorAll('.sub2 .ln2')], ck + .15, .12);
  }
};

// ---------- logo pequeno + título (virada: "Linha ArtPlas.") ----------
SB.logoTitle = {
  html: p => `<div class="zone" style="${zoneTop(p.y || 900, 760)}"><div class="lg" style="width:${p.w || 360}px;margin-bottom:64px">${svgInline(p.svg || 'logo', 'width:100%;height:auto;overflow:visible')}</div>
    ${linesHTML([[p.pre, 72]], PAP)}<div class="ttl2 big2" style="font-size:${p.size || 190}px;color:${PAP}">${p.title}</div></div>`,
  sfx: p => [['big_word', .5]],
  build(tl, el, p, L) {
    el.querySelectorAll('.lg path').forEach((pp, i) => tl.fromTo(pp, { y: 30, rotation: -8, opacity: 0, filter: 'blur(10px)', transformOrigin: '50% 50%' }, { y: 0, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: .65, ease: EIN }, i * .05));
    inLines(tl, [...el.querySelectorAll('.ln2')], .2);
    inLetters(tl, el.querySelector('.ttl2'), .35, .045);
  }
};

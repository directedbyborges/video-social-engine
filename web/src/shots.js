// Modo narrado por tomadas (TL.shots): cada tomada é um b-roll (desenhado no composite) ou um painel da marca,
// com uma cena por cima. Tudo em 1080x1920. A câmera (TL.cam, um valor por quadro, calculado no build.py) move o
// #world inteiro; o composite aplica a mesma câmera ao b-roll, então texto e imagem andam juntos.
// Tempos dos parâmetros das cenas: segundos a partir do início da tomada.
gsap.registerPlugin(CustomEase);
const SH = {};
CustomEase.create('snap', 'M0,0 C0,0 0,1 1,1');
CustomEase.create('accel', 'M0,0 C1,0 1,1 1,1');
CustomEase.create('scurve', 'M0,0 C0.8,0 0.2,1 1,1');
CustomEase.create('logo', 'M0,0 C0.33,0 0,1 1,1');
const BR = Object.assign({ c1: '#2E507B', c2: '#476D9E', c3: '#617DAE', ink: '#201D1D', paper: '#FFFFFF' }, (TL.palette || {}));

// "texto com **negrito**" -> palavras em spans (para entrar palavra por palavra)
function words(s) {
  const out = []; let bold = false;
  s.split(/(\*\*)/).forEach(part => {
    if (part === '**') { bold = !bold; return; }
    part.split(/(\s+)/).forEach(w => { if (!w) return; out.push(/^\s+$/.test(w) ? ' ' : `<span class="wd${bold ? ' wb' : ''}">${w}</span>`); });
  });
  return out.join('');
}
function lineHTML(l, i, cls = 'bl') {
  const [txt, st, px, col] = l;
  return `<div class="${cls} ${st}" data-i="${i}" style="font-size:${px}px${col ? ';color:' + col : ''}">${words(txt)}</div>`;
}
function fitWidth(el, max = 864) {
  let i = 0;
  while (el.scrollWidth > max && i < 60) { el.querySelectorAll('.bl,.tl').forEach(d => { d.style.fontSize = (parseFloat(getComputedStyle(d).fontSize) * .97) + 'px'; }); i++; }
}
function enterLines(tl, root, t0, opt = {}) {
  root.querySelectorAll('.bl,.tl').forEach((ln, i) => {
    const t = t0 + i * (opt.stagger || .11);
    if (opt.words && ln.classList.contains('b')) {
      ln.querySelectorAll('.wd').forEach((w, j) => tl.fromTo(w, { y: 46, opacity: 0, filter: 'blur(18px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .65, ease: 'snap', immediateRender: true }, t + j * .08));
    } else if (opt.letters && ln.classList.contains('b')) {
      letters(tl, ln, t);
    } else {
      tl.fromTo(ln, { y: 30, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'snap', immediateRender: true }, t);
    }
  });
}
function letters(tl, ln, t) {
  ln.querySelectorAll('.wd').forEach(w => { w.innerHTML = [...w.textContent].map(c => `<span class="ch">${c}</span>`).join(''); });
  ln.querySelectorAll('.ch').forEach((c, j) => tl.fromTo(c, { y: '0.4em', opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .5, ease: 'snap', immediateRender: true }, t + j * .045));
}
function counter(tl, root, p, SFXo) {
  if (!p.count) return;
  const el = root.querySelectorAll('.bl,.tl')[p.count.line]; if (!el) return;
  const fmt = n => Math.round(n).toLocaleString('pt-BR');
  const target = el.querySelector('.wd') || el; const suf = p.count.suffix || '';
  const o = { n: p.count.from || 0 }, t = p.count.at != null ? p.count.at : .25;
  tl.set(target, { textContent: fmt(o.n) + suf }, 0);
  tl.to(o, { n: p.count.to, duration: p.count.dur || .9, ease: 'power2.out', onUpdate: () => { target.textContent = fmt(o.n) + suf; } }, t);
  SFXo.push(['counter', t, t + (p.count.dur || .9)]);
}
const TOP = p => (typeof p.y === 'number' ? p.y : 0);
function centerY(el, p) { if (typeof p.y !== 'number') el.style.top = Math.round(960 - el.offsetHeight / 2) + 'px'; }
// logo: o ícone ("O") se revela primeiro, no centro do logo; depois volta ao lugar e as letras entram uma a uma, sem bounce
function logoReveal(tl, svg, t0 = 0) {
  const paths = [...svg.querySelectorAll('path')], bbs = paths.map(p => p.getBBox());
  let oi = 0, best = 9; bbs.forEach((b, i) => { const r = Math.abs(b.width / b.height - 1); if (r < best) { best = r; oi = i; } });
  const O = paths[oi], ob = bbs[oi], vb = svg.viewBox.baseVal, ocx = ob.x + ob.width / 2, ocy = ob.y + ob.height / 2;
  svg.appendChild(O);
  const dx = vb.x + vb.width / 2 - ocx;
  tl.fromTo(O, { x: dx, scale: 0, rotation: -90, opacity: 0, svgOrigin: `${ocx} ${ocy}` }, { x: dx, scale: 1.7, rotation: 0, opacity: 1, duration: .6, ease: 'snap', immediateRender: true }, t0);
  tl.to(O, { x: 0, scale: 1, duration: .5, ease: 'scurve' }, t0 + .6);
  paths.filter(p => p !== O).sort((a, b) => a.getBBox().x - b.getBBox().x).forEach((p, j) => {
    const left = p.getBBox().x < ocx;
    tl.fromTo(p, { opacity: 0, x: left ? 28 : -28, filter: 'blur(6px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .45, ease: 'power3.out', immediateRender: true }, t0 + .78 + j * .05);
  });
}
function drawPath(tl, path, t, d = .7, ease = 'scurve') {
  const len = path.getTotalLength();
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease, immediateRender: true }, t);
}

// ---------- bloco de texto (canto vivo, azul ou branco; opcional 3D sutil) ----------
SH.block = {
  html: p => `<div class="blk${p.white ? ' w' : ''}" style="top:${p.y}px">${p.lines.map((l, i) => lineHTML(l, i)).join('')}</div>`,
  sfx: p => (p.hook ? [['hook_word', .15]] : []),
  build(tl, el, p, L, S) {
    const b = el.querySelector('.blk'); fitWidth(b);
    gsap.set(b, { xPercent: -50, transformPerspective: 1400 });
    if (p.d3) {
      tl.fromTo(b, { rotationY: 12, rotationX: -6, z: -120, opacity: 0, filter: 'blur(10px)' }, { rotationY: 4, rotationX: -2, z: 0, opacity: 1, filter: 'blur(0px)', duration: .85, ease: 'snap', immediateRender: true }, .04);
      tl.to(b, { rotationY: 1, rotationX: 0, z: 20, duration: Math.max(.2, L - .9), ease: 'none' }, .89);
    } else {
      tl.fromTo(b, { y: 70, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'snap', immediateRender: true }, .04);
    }
    enterLines(tl, b, .16, { words: p.words, letters: p.letters });
    counter(tl, b, p, S);
  }
};

// ---------- tipografia solta sobre o painel (pouso de perto) ----------
SH.type = {
  html: p => `<div class="tg" style="top:${TOP(p)}px">${p.lines.map((l, i) => lineHTML(l, i, 'tl')).join('')}</div>`,
  build(tl, el, p, L, S) {
    const g = el.querySelector('.tg'); fitWidth(g, 900); centerY(g, p);
    tl.fromTo(g, { scale: p.from || 1.3, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'snap', immediateRender: true }, .04);
    enterLines(tl, g, .12, { letters: p.letters });
    counter(tl, g, p, S);
  }
};

// ---------- text label do toolkit (colchete ou sublinhado) desenhado por traço ----------
SH.label = {
  html: p => `<div class="tg" style="top:${TOP(p)}px">${p.pre ? `<div class="tl r" style="font-size:${p.prePx || 104}px;margin-bottom:24px">${p.pre}</div>` : ''}
    <div class="rot" style="font-size:${p.px || 100}px;color:${p.color || '#fff'};font-weight:${p.weight || 600}"><span class="rtx">${p.text}</span><svg class="rs"><path/></svg></div>
    ${p.arrow ? `<svg class="arr" viewBox="0 0 40 60" style="width:70px;margin-top:70px;overflow:visible"><path d="M20 4v48M6 38l14 14 14-14" fill="none" stroke="${BR.c3}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}</div>`,
  sfx: p => [['pill', .5]],
  build(tl, el, p, L) {
    centerY(el.querySelector('.tg'), p);
    if (p.pre) enterLines(tl, el.querySelector('.tg'), .04);
    const r = el.querySelector('.rot'), w = r.offsetWidth, h = r.offsetHeight, R = 48, path = r.querySelector('path');
    const d = p.forma === 'sublinhado'
      ? `M0 ${h + 12} L${w + 16 - R} ${h + 12} Q${w + 16} ${h + 12} ${w + 16} ${h + 12 - R} L${w + 16} ${h * .1}`
      : `M${w * .45} -8 L${R - 8} -8 Q-8 -8 -8 ${R - 8} L-8 ${h + 4} M${w * .62} ${h + 12} L${w + 16 - R} ${h + 12} Q${w + 16} ${h + 12} ${w + 16} ${h + 12 - R} L${w + 16} ${h * .45}`;
    path.setAttribute('d', d); path.setAttribute('stroke', p.stroke || p.color || '#fff');
    drawPath(tl, path, p.pre ? .25 : .1, .75);
    tl.fromTo(r.querySelector('.rtx'), { opacity: 0, x: -30, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .6, ease: 'snap', immediateRender: true }, p.pre ? .4 : .35);
    const ar = el.querySelector('.arr');
    if (ar) { const ap = ar.querySelector('path'); drawPath(tl, ap, .7, .5); tl.fromTo(ar, { y: -20 }, { y: 0, duration: .5, ease: 'snap', immediateRender: true }, .7); }
  }
};

// ---------- logo oficial peça por peça + texto ----------
SH.logo = {
  html: p => `<div class="tg" style="top:${TOP(p)}px"><div class="lgw" style="width:${p.w || 760}px">${SVGT[p.logo || 'logo_white']}</div>
    <div class="tlines" style="margin-top:${p.gap || 70}px">${(p.lines || []).map((l, i) => lineHTML(l, i, 'tl')).join('')}</div></div>`,
  sfx: p => [['brand_reveal', .05]],
  build(tl, el, p, L) {
    const svg = el.querySelector('.lgw svg'); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.overflow = 'visible';
    centerY(el.querySelector('.tg'), p);
    logoReveal(tl, svg, .02);
    enterLines(tl, el.querySelector('.tlines'), 1.15);
  }
};

// ---------- símbolo "O" desenhado + anéis (a rede) ----------
SH.rings = {
  html: p => `<div class="tg" style="top:${TOP(p)}px"><div style="position:relative;width:600px;height:600px">
    <svg viewBox="0 0 600 600" class="rg" style="position:absolute;inset:0">${[170, 220, 270].map(r => `<circle cx="300" cy="300" r="${r}" fill="none" stroke="${BR.c3}" stroke-width="3"/>`).join('')}</svg>
    <div class="sym" style="position:absolute;left:180px;top:180px;width:240px;height:240px">${SVGT[p.symbol || 'symbol_white']}</div></div>
    <div class="tlines" style="margin-top:10px">${(p.lines || []).map((l, i) => lineHTML(l, i, 'tl')).join('')}</div></div>`,
  sfx: p => [['icon_pop', .45]],
  build(tl, el, p, L) {
    const svg = el.querySelector('.sym svg'); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = '100%';
    centerY(el.querySelector('.tg'), p);
    const pa = svg.querySelector('path'); pa.setAttribute('stroke', getComputedStyle(pa).fill || '#fff'); pa.setAttribute('stroke-width', '1.5');
    tl.fromTo(pa, { fillOpacity: 0 }, { fillOpacity: 1, duration: .3, ease: 'none', immediateRender: true }, .55);
    drawPath(tl, pa, .02, .6);
    el.querySelectorAll('.rg circle').forEach((c, i) => {
      gsap.set(c, { transformOrigin: '300px 300px' });
      tl.fromTo(c, { scale: .55, opacity: 0 }, { scale: 1, opacity: [.9, .6, .35][i], duration: .8, ease: 'snap', immediateRender: true }, .4 + i * .12);
    });
    enterLines(tl, el.querySelector('.tlines'), .45);
  }
};

// ---------- cartão de cadastro (canto vivo), campos preenchendo ----------
SH.signup = {
  html: p => `<div class="tg" style="top:${TOP(p)}px">${(p.lines || []).map((l, i) => lineHTML(l, i, 'tl')).join('')}
    <div class="sucard" style="margin-top:44px">${p.fields.map(f => `<div class="fld"><div class="fl">${f[0]}</div><div class="fv"><span class="tx" data-v="${f[1]}"></span><i class="cur"></i></div></div>`).join('')}</div></div>`,
  sfx: p => [['ui_card', .25], ['typing', .5, .5 + p.fields.length * .3]],
  build(tl, el, p, L) {
    centerY(el.querySelector('.tg'), p);
    enterLines(tl, el.querySelector('.tg'), .04);
    const card = el.querySelector('.sucard');
    tl.fromTo(card, { clipPath: 'inset(100% 0% 0% 0%)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: .8, ease: 'snap', immediateRender: true }, .2);
    el.querySelectorAll('.fld').forEach((f, i) => {
      const tx = f.querySelector('.tx'), cur = f.querySelector('.cur'), v = tx.dataset.v, o = { n: 0 }, t = .5 + i * .3;
      tl.set(cur, { opacity: 0 }, 0); tl.set(cur, { opacity: 1 }, t); tl.set(cur, { opacity: 0 }, t + .3);
      tl.to(o, { n: v.length, duration: .27, ease: 'none', onUpdate: () => { tx.textContent = v.slice(0, Math.round(o.n)); } }, t);
    });
  }
};

// ---------- foto em recorte reto (sem moldura nem sombra) + texto ----------
SH.photo = {
  html: p => `<div class="ph" style="top:${p.y}px;height:${p.h}px"><img src="${IMG[p.img]}" style="object-position:${p.pos || '50% 50%'}"></div>
    <div class="tg" style="top:${p.y + p.h + (p.gap || 50)}px">${(p.lines || []).map((l, i) => lineHTML(l, i, 'tl')).join('')}</div>`,
  build(tl, el, p, L) {
    const ph = el.querySelector('.ph');
    tl.fromTo(ph, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'snap', immediateRender: true }, .04);
    tl.fromTo(ph.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: L, ease: 'none', immediateRender: true }, 0);
    enterLines(tl, el.querySelectorAll('.tg')[0], .35);
  }
};

// ---------- assinatura: logo cresce do zero, sobe e encolhe; lettering oficial com o traço gancho ----------
SH.logoSign = {
  html: p => `<div class="lgs" style="position:absolute;left:150px;width:780px;top:${p.y || 820}px">${SVGT[p.logo || 'logo_white']}</div>
    <div class="ltr" style="top:${(p.y || 820) + 120}px"><div class="tl r" style="font-size:${p.px || 100}px">${p.l1 || 'Revestindo'}</div><div class="tl b" style="font-size:${p.px || 100}px">${p.l2 || 'possibilidades.'}</div><svg class="gh"><path/></svg></div>`,
  sfx: p => [['brand_reveal', .05]],
  build(tl, el, p, L) {
    const lg = el.querySelector('.lgs'), svg = lg.querySelector('svg'); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.overflow = 'visible';
    logoReveal(tl, svg, 0);
    tl.to(lg, { y: -140, scale: .78, duration: .7, ease: 'scurve' }, 1.3);
    const ltr = el.querySelector('.ltr'); gsap.set(ltr, { xPercent: -50 });
    const last = ltr.querySelectorAll('.tl')[1], k = parseFloat(getComputedStyle(last).fontSize) / 48, w = last.offsetWidth;
    const base = last.offsetTop + last.offsetHeight, gh = ltr.querySelector('.gh');
    gh.setAttribute('style', `position:absolute;overflow:visible;left:${last.offsetLeft}px;top:${base - 50 * k}px;width:${w + 56 * k}px;height:${64 * k}px`);
    const pa = gh.querySelector('path');
    pa.setAttribute('d', `M0 ${58 * k} L${w + 4 * k} ${58 * k} C${w + 40 * k} ${58 * k} ${w + 54 * k} ${40 * k} ${w + 54 * k} ${8 * k}`);
    pa.setAttribute('stroke', BR.c3); pa.setAttribute('stroke-width', Math.max(3, 3 * k * .75)); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke-linecap', 'round');
    enterLines(tl, ltr, 1.45, { stagger: .12 });
    drawPath(tl, pa, 1.7, .55);
  }
};

// ---------- CTA: botão de canto vivo + cursor clicando ----------
SH.cta = {
  html: p => `<div class="tg" style="top:${TOP(p)}px">
    <div class="btnw"><div class="btn">${p.cta}<svg viewBox="0 0 22 20" class="seta"><path d="M2 10h17M12 3l7 7-7 7"/></svg></div><svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80"/></svg></div>
    <div class="subs">${(p.sub || []).map(s => `<div class="tl r" style="font-size:${p.subPx || 58}px;color:${BR.ink}">${s}</div>`).join('')}</div></div>
    <svg class="cursor" viewBox="0 0 50 74"><path d="M3 3 L3 58 L17 46 L27 68 L38 63 L28 42 L46 42 Z"/></svg>`,
  sfx: p => [['icon_pop', p.clickAt || 1.4]],
  build(tl, el, p, L) {
    const btn = el.querySelector('.btn'), cur = el.querySelector('.cursor'), ring = el.querySelector('.ring');
    centerY(el.querySelector('.tg'), p);
    const ck = p.clickAt || 1.4, br = btn.getBoundingClientRect(), wr = btn.parentNode.getBoundingClientRect();
    const tx = br.left + br.width * .62, ty = br.top + br.height * .55;
    gsap.set(ring, { left: br.width * .62 - 110, top: br.height * .55 - 110 });
    tl.fromTo(btn, { scale: .85, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'snap', immediateRender: true }, 0);
    tl.fromTo(cur, { x: tx + 300, y: ty + 520, rotation: -12, opacity: 0 }, { x: tx, y: ty, rotation: 0, opacity: 1, duration: .8, ease: 'scurve', immediateRender: true }, .5);
    tl.to(cur, { scale: .85, duration: .1, ease: 'power2.in' }, ck); tl.to(cur, { scale: 1, duration: .12, ease: 'power2.out' }, ck + .1);
    tl.to(btn, { scale: .95, backgroundColor: BR.c2, duration: .12, ease: 'power2.in' }, ck); tl.to(btn, { scale: 1, backgroundColor: BR.c1, duration: .2, ease: 'power2.out' }, ck + .12);
    tl.fromTo(ring, { scale: 0, opacity: .6 }, { scale: 1.6, opacity: 0, duration: .5, ease: 'power2.out', immediateRender: true }, ck);
    enterLines(tl, el.querySelector('.subs'), ck + .15);
  }
};

// ---------- máscara da marca (arcos varrendo a tela) — uma vez, no corte T ----------
function buildMask(master, T) {
  const m = document.getElementById('mask');
  const D = [[BR.c3, 1520, -.12], [BR.c2, 1400, -.06], [BR.c1, 1290, 0]];   // [cor, raio, atraso]: o último cobre a tela no corte
  m.innerHTML = D.map(([c, R]) => `<i style="background:${c};left:${540 - R}px;top:${960 - R}px;width:${2 * R}px;height:${2 * R}px"></i>`).join('');
  const discs = [...m.children], dur = 1.3;
  master.set(m, { visibility: 'visible' }, T - dur / 2 - .15);
  discs.forEach((d, i) => { const R = D[i][1], off = 540 + R + 60;
    master.fromTo(d, { x: off }, { x: -off, duration: dur, ease: 'none', immediateRender: true }, T - dur / 2 + D[i][2]); });
  master.set(m, { visibility: 'hidden' }, T + dur / 2 + .05);
  SFX.push(['climax', T - .05]);
}

function arcsSVG(kind) {
  const k = 1650 / 345, ox = 1080 - 1650, oy = 1920 - 200 * k;
  const C = [[305.7, 160.9, 146.2, BR.c3, .07], [318.6, 158.5, 126.5, BR.c1, .108], [328.2, 153.6, 103.3, BR.c2, .146], [339.2, 150.0, 81.8, BR.c1, .177], [353.9, 148.4, 63.6, BR.c3, .215]];
  return `<svg class="arcs" viewBox="-432 -768 1944 3456">${C.map(c => kind === 'a'
    ? `<circle cx="${ox + c[0] * k}" cy="${oy + c[1] * k}" r="${c[2] * k}" fill="${c[3]}"/>`
    : `<circle cx="${ox + c[0] * k}" cy="${oy + c[1] * k}" r="${c[2] * k}" fill="none" stroke="${BR.c3}" stroke-opacity="${c[4] * 1.6}" stroke-width="${.8 * k}"/>`).join('')}</svg>`;
}
const SECS = [];
function buildShots(master) {
  const world = document.getElementById('world');
  TL.shots.forEach((s, si) => {
    const sec = document.createElement('section'); sec.className = 'shot';
    const bg = s.panel === 'azul' ? `<div class="pbg azul">${arcsSVG('a')}</div>` : s.panel === 'branco' ? `<div class="pbg branco">${arcsSVG('b')}</div>` : '';
    const theme = s.panel === 'azul' ? 'on-azul' : s.panel === 'branco' ? 'on-branco' : 'on-foto';
    sec.innerHTML = `<div class="scam">${bg}<div class="sw ${theme}">${s.scene ? SH[s.scene.type].html(s.scene) : ''}</div></div>`;
    world.appendChild(sec);
    const L = s.end - s.start, tl = gsap.timeline();
    if (s.scene) {
      const S = [];
      if (SH[s.scene.type].sfx) SH[s.scene.type].sfx(s.scene).forEach(e => S.push(e));
      SH[s.scene.type].build(tl, sec.querySelector('.sw'), s.scene, L, S);
      S.forEach(e => SFX.push([e[0], s.start + e[1]].concat(e[2] != null ? [s.start + e[2]] : [])));
    }
    const arcs = sec.querySelector('.arcs');
    if (arcs) tl.fromTo(arcs, { x: 30 }, { x: -60, duration: L, ease: 'none', immediateRender: true }, 0);
    if (si > 0 && !s.afterMask) SFX.push(['scene_cut', s.start]);
    tl.set({}, {}, L);
    master.add(tl, s.start);
    SECS.push(sec);
  });
  if (TL.mask != null) buildMask(master, TL.mask);
}
function applyFrame(t) {
  const F = TL.frames, k = Math.min(F.length - 1, Math.max(0, Math.round(t * 30)));
  SECS.forEach(sec => { sec.style.visibility = 'hidden'; });
  F[k].forEach(([i, sc, x, y]) => { const sec = SECS[i]; sec.style.visibility = 'visible'; sec.style.transform = `translate(${x}px,${y}px)`; sec.firstElementChild.style.transform = `scale(${sc})`; });
}

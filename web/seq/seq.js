// Sequência de cenas (vídeo narrado: b-roll + telas de motion), sem pessoa falando.
// A página do projeto define window.SEQ = {fps, end, scenes:[{id,t0,t1,tin,tout,zoom}], mask:{at}, sfx:[], push:.42}
// e cada cena é <section class="scene" id> com .cam > (.bg + .sw). Elementos animados levam data-a (tipo),
// data-t (s desde o início da cena; pode ser negativo = entra durante o empurrão), data-sfx, data-click (CTA).
//
// Transições:
//  - pushL/pushR/pushU/pushD (padrão): empurrão — a cena que entra empurra a que sai, as duas se movendo
//    juntas por SEQ.push s centrados no corte, com desfoque direcional (sem zoom, sem desfoque radial).
//  - zin/zout/panL/panR/panU/panD: corte com movimento (saída acelerando até o corte, entrada desacelerando).
//  - mask: arcos da marca atravessam da direita para a esquerda; o corte acontece com a tela coberta.
// .sw faz o zoom do meio (2 keyframes, 13%, power2.inOut). Entradas curtas (~0,45 s) para o texto chegar
// junto com a fala; o texto fica parado até o empurrão seguinte. window.seek(t) posiciona tudo.
(function () {
  gsap.registerPlugin(CustomEase);
  const SNAP = CustomEase.create('snap', 'M0,0 C0,0 0,1 1,1');
  const ACCEL = CustomEase.create('accel', 'M0,0 C1,0 1,1 1,1');
  const SCURVE = CustomEase.create('scurve', 'M0,0 C0.8,0 0.2,1 1,1');
  const Q = window.SEQ;
  const W = 1080, H = 1920, PAN = Q.pan || 220, PD = Q.push || .42;
  const ENT = .45, BL = 8, ST = .05;   // duração de entrada, desfoque inicial, intervalo entre palavras
  const TR = { zin: { s: 1.2 }, zout: { s: 0.82 }, panR: { x: -PAN }, panL: { x: PAN }, panU: { y: -PAN }, panD: { y: PAN } };
  const PUSH = { pushL: { x: -W }, pushR: { x: W }, pushU: { y: -H }, pushD: { y: H } };
  const tl = gsap.timeline({ paused: true });
  const SFX = Q.sfx = Q.sfx || [];
  const sfx = (type, t) => SFX.push({ type, t: +t.toFixed(3) });

  // ---------- desfoque direcional na troca (filtro SVG) ----------
  const NS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(NS, 'svg'); defs.setAttribute('width', 0); defs.setAttribute('height', 0);
  defs.style.position = 'absolute'; document.body.appendChild(defs);
  function blurFor(cam, id) {
    const f = document.createElementNS(NS, 'filter'); f.id = 'mb_' + id;
    ['x', 'y'].forEach(k => f.setAttribute(k, '-10%')); f.setAttribute('width', '120%'); f.setAttribute('height', '120%');
    const g = document.createElementNS(NS, 'feGaussianBlur'); g.setAttribute('stdDeviation', '0 0'); f.appendChild(g); defs.appendChild(f);
    return (bx, by) => {
      if (bx < .3 && by < .3) { cam.style.filter = 'none'; return; }
      g.setAttribute('stdDeviation', bx.toFixed(2) + ' ' + by.toFixed(2)); cam.style.filter = `url(#mb_${id})`;
    };
  }

  // ---------- helpers de elemento ----------
  const at = (el, sc, def = 0) => sc.t0 + (el.dataset.t != null ? +el.dataset.t : def);
  function splitWords(el) {
    const walk = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const parts = c.textContent.split(/(\s+)/); const frag = document.createDocumentFragment();
          parts.forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); } });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'svg' && c.tagName !== 'BR') walk(c);
      });
    };
    walk(el); return [...el.querySelectorAll('.w')];
  }
  const blur = b => `blur(${b}px)`;
  const IN = (y = 26, b = BL) => ({ y, opacity: 0, filter: blur(b) });
  const OUT = (d = ENT) => ({ y: 0, opacity: 1, filter: blur(0), duration: d, ease: SNAP });
  function A_up(el, t) { tl.fromTo(el, IN(28), OUT(), t); }
  function A_lines(el, t) { tl.fromTo([...el.children], IN(22), Object.assign(OUT(), { stagger: .07 }), t); }
  function A_words(el, t) { tl.fromTo(splitWords(el), IN(30), Object.assign(OUT(), { stagger: ST }), t); }
  function A_scale(el, t) { tl.fromTo(el, { scale: 1.25, opacity: 0, filter: blur(10) }, { scale: 1, opacity: 1, filter: blur(0), duration: .55, ease: SNAP }, t); }
  function A_pop(el, t) { tl.fromTo(el, { scale: .75, rotation: -8, opacity: 0, filter: blur(8) }, { scale: 1, rotation: 0, opacity: 1, filter: blur(0), duration: .5, ease: SNAP }, t); }
  function A_box(el, t) {
    tl.fromTo(el, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .4, ease: SNAP }, t);
    tl.fromTo([...el.children], IN(20), Object.assign(OUT(.4), { stagger: .06 }), t + .05);
  }
  function A_box3d(el, t, end) {
    tl.fromTo(el, { rotationY: 12, rotationX: -6, z: -120, opacity: 0, filter: blur(8) },
      { rotationY: 4, rotationX: -2, z: 0, opacity: 1, filter: blur(0), duration: .6, ease: SNAP }, t);
    tl.to(el, { rotationY: 1, rotationX: 0, z: 20, duration: Math.max(.2, end - t - .6), ease: 'none' }, t + .6);
    tl.fromTo([...el.children], IN(20), Object.assign(OUT(.4), { stagger: .06 }), t + .06);
  }
  function A_trace(el, t) {
    const paths = [...el.querySelectorAll('path')];
    paths.forEach(p => { const col = p.getAttribute('fill'); p.setAttribute('pathLength', 1); p.style.stroke = col; p.style.strokeWidth = el.dataset.sw || 1.1; p.style.strokeDasharray = 1; });
    tl.fromTo(paths, { strokeDashoffset: 1, fillOpacity: 0, strokeOpacity: 1 }, { strokeDashoffset: 0, duration: .5, ease: SCURVE }, t);
    tl.to(paths, { fillOpacity: 1, duration: .2, ease: 'none' }, t + .35);
    tl.to(paths, { strokeOpacity: 0, duration: .2, ease: 'none' }, t + .45);
    tl.fromTo(el, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .35, ease: SNAP }, t);
  }
  function A_pieces(el, t) {
    const paths = [...el.querySelectorAll('path')];
    tl.fromTo(paths, { y: 30, rotation: -6, opacity: 0, transformOrigin: '50% 50%' }, { y: 0, rotation: 0, opacity: 1, duration: .45, ease: SNAP, stagger: .035 }, t);
  }
  // logo: o "O" (1º path, o símbolo) aparece primeiro no centro do logo, volta ao lugar e as letras entram
  function A_logoO(el, t) {
    const svg = el.tagName === 'svg' ? el : el.querySelector('svg'), paths = [...svg.querySelectorAll('path')];
    const o = paths[0], rest = paths.slice(1), vb = svg.viewBox.baseVal, bb = o.getBBox();
    const dx = (vb.x + vb.width / 2) - (bb.x + bb.width / 2);
    tl.fromTo(o, { x: dx, scale: .2, rotation: -120, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1.5, rotation: 0, opacity: 1, duration: .45, ease: SNAP }, t);
    tl.to(o, { x: 0, scale: 1, duration: .4, ease: SCURVE }, t + .45);
    tl.fromTo(rest, { y: 24, opacity: 0, transformOrigin: '50% 50%' }, { y: 0, opacity: 1, duration: .4, ease: SNAP, stagger: .035 }, t + .62);
  }
  function A_draw(path, t, d = .5) {
    path.setAttribute('pathLength', 1); path.style.strokeDasharray = 1;
    tl.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: SCURVE }, t);
  }
  function A_lett(el, t) {
    const w = splitWords(el);
    tl.fromTo(w, IN(30), Object.assign(OUT(), { stagger: ST }), t);
    const p = el.querySelector('svg path'); if (p) A_draw(p, t + .2 + ST * w.length * .5);
  }
  function A_rotulo(el, t) {
    tl.fromTo(splitWords(el), IN(22), Object.assign(OUT(.4), { stagger: .045 }), t);
    el.querySelectorAll('svg path').forEach(p => A_draw(p, t + .05, .55));
  }
  function A_chip(el, t, dir) {
    const w = el.offsetWidth, h = el.offsetHeight, side = Math.max(0, (w - h) / 2);
    const kids = el.querySelector('.ct');
    tl.fromTo(el, { x: dir * 200, opacity: 0, clipPath: `inset(0px ${side}px 0px ${side}px round ${h / 2}px)` },
      { x: 0, opacity: 1, duration: .32, ease: 'power2.out' }, t);
    tl.fromTo(el, { clipPath: `inset(0px ${side}px 0px ${side}px round ${h / 2}px)` },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: .3, ease: 'power2.inOut', immediateRender: false }, t + .24);
    if (kids) tl.fromTo(kids, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .25, ease: SNAP }, t + .38);
  }
  function A_count(el, t) {
    const n = +el.dataset.n, o = { v: 0 };
    tl.fromTo(o, { v: 0 }, { v: n, duration: +(el.dataset.d || .6), ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }, t);
    tl.fromTo(el, { scale: 1.25, opacity: 0, filter: blur(10) }, { scale: 1, opacity: 1, filter: blur(0), duration: .5, ease: SNAP }, t);
  }
  function A_grid(el, t) {
    tl.fromTo([...el.children], { scale: .65, opacity: 0, filter: blur(8), y: 18 }, { scale: 1, opacity: 1, filter: blur(0), y: 0, duration: .4, ease: SNAP, stagger: { each: .03 } }, t);
  }
  function A_half(el, t, dir) { tl.fromTo(el, { y: dir * 420, filter: blur(8) }, { y: 0, filter: blur(0), duration: .5, ease: SNAP }, t); }
  function A_slideout(el, t) { tl.to([...el.children], { x: 700, opacity: 0, duration: .45, ease: ACCEL, stagger: .05 }, t); }
  function A_cta(el, t, sc) {
    const btn = el.querySelector('.ctabtn'), cur = el.querySelector('.cursor'), sub = el.querySelector('.ctasub');
    const ck = sc.t0 + +(el.dataset.click || 1.0);
    tl.fromTo(btn, { scale: .88, opacity: 0, filter: blur(8) }, { scale: 1, opacity: 1, filter: blur(0), duration: .5, ease: SNAP }, t);
    tl.fromTo(cur, { x: 260, y: 380, rotation: -12, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .55, ease: SCURVE }, ck - .62);
    tl.to(cur, { scale: .85, duration: .09, ease: 'power2.out', transformOrigin: '10% 5%' }, ck);
    tl.to(cur, { scale: 1, duration: .09, ease: 'power2.in' }, ck + .09);
    tl.to(btn, { scale: .95, duration: .1, ease: 'power2.out' }, ck);
    tl.to(btn, { scale: 1, duration: .12, ease: 'power2.in' }, ck + .1);
    const ring = el.querySelector('.ring'), shine = el.querySelector('.shine');
    if (ring) tl.fromTo(ring, { scale: 0, opacity: .55 }, { scale: 1.6, opacity: 0, duration: .45, ease: 'power2.out' }, ck);
    if (shine) tl.fromTo(shine, { opacity: 0 }, { opacity: .28, duration: .07, yoyo: true, repeat: 1, ease: 'none' }, ck);
    if (sub) tl.fromTo(splitWords(sub), IN(20), Object.assign(OUT(.4), { stagger: .05 }), ck + .1);
    sfx('click', ck);
  }
  function A_form(el, t) {
    tl.fromTo(el, { y: 50, opacity: 0, filter: blur(8) }, { y: 0, opacity: 1, filter: blur(0), duration: .45, ease: SNAP }, t);
    const step = +(el.dataset.step || .22), first = +(el.dataset.first || .3);
    el.querySelectorAll('.ok').forEach((o, i) => { const tt = t + first + i * step; tl.fromTo(o, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .25, ease: SNAP }, tt); sfx('check', tt); });
  }
  function A_arcs(el, a, b) {
    el.querySelectorAll('circle').forEach((c, i) => tl.fromTo(c, { x: 0 }, { x: (4 + 3 * i) * (b - a), duration: b - a, ease: 'none' }, a));
  }

  // ---------- cenas ----------
  const N = Q.scenes.length;
  Q.scenes.forEach((sc, i) => {
    const el = document.getElementById(sc.id), cam = el.querySelector('.cam'), sw = el.querySelector('.sw');
    const pin = PUSH[sc.tin], pout = PUSH[sc.tout];
    const v0 = pin ? sc.t0 - PD / 2 : sc.t0, v1 = pout ? sc.t1 + PD / 2 : sc.t1;   // janela visível
    const dur = sc.t1 - sc.t0, c = (sc.t0 + sc.t1) / 2;
    tl.set(el, { autoAlpha: 0 }, 0); tl.set(el, { autoAlpha: 1 }, v0); tl.set(el, { autoAlpha: 0 }, v1);
    const setBlur = blurFor(cam, sc.id);
    if (pin) {   // entra empurrando: vem do lado oposto ao movimento
      tl.fromTo(cam, { x: -(pin.x || 0), y: -(pin.y || 0) }, { x: 0, y: 0, duration: PD, ease: 'power3.inOut' }, sc.t0 - PD / 2);
      const o = { p: 0 }, [mx, my] = pin.x ? [30, 0] : [0, 30];
      tl.fromTo(o, { p: 0 }, { p: 1, duration: PD, ease: 'none', onUpdate: () => { const s = Math.sin(Math.PI * o.p); setBlur(s * mx, s * my); } }, sc.t0 - PD / 2);
    } else if (sc.tin && TR[sc.tin]) {
      const k = TR[sc.tin], dIn = Math.min(.55, dur * .3);
      tl.fromTo(cam, k.s ? { scale: k.s } : { x: -(k.x || 0), y: -(k.y || 0) }, { x: 0, y: 0, scale: 1, duration: dIn, ease: SNAP }, sc.t0);
    }
    if (pout) {
      tl.fromTo(cam, { x: 0, y: 0 }, { x: pout.x || 0, y: pout.y || 0, duration: PD, ease: 'power3.inOut', immediateRender: false }, sc.t1 - PD / 2);
      const o = { p: 0 }, [mx, my] = pout.x ? [30, 0] : [0, 30];
      tl.fromTo(o, { p: 0 }, { p: 1, duration: PD, ease: 'none', immediateRender: false, onUpdate: () => { const s = Math.sin(Math.PI * o.p); setBlur(s * mx, s * my); } }, sc.t1 - PD / 2);
      if (i < N - 1) sfx('cut', sc.t1);
    } else if (sc.tout && TR[sc.tout]) {
      const k = TR[sc.tout], dOut = Math.min(.5, dur * .28);
      tl.fromTo(cam, { x: 0, y: 0, scale: 1 }, Object.assign(k.s ? { scale: k.s } : { x: k.x || 0, y: k.y || 0 }, { duration: dOut, ease: ACCEL, immediateRender: false }), sc.t1 - dOut);
      if (i < N - 1) sfx('cut', sc.t1);
    }
    if (sc.zoom === 'in') { tl.set(sw, { scale: .87 }, 0); tl.to(sw, { scale: 1, duration: .6, ease: 'power2.inOut' }, c - .3); }
    else if (sc.zoom === 'out') { tl.set(sw, { scale: 1 }, 0); tl.to(sw, { scale: .88, duration: .6, ease: 'power2.inOut' }, c - .3); }
    // fundo vivo enquanto o texto fica parado: deriva lenta (escala) nas fotos; metades da tela dividida em sentidos opostos
    el.querySelectorAll('.bg img.drift').forEach(im => tl.fromTo(im, { scale: 1 }, { scale: +(im.dataset.drift || 1.08), duration: v1 - v0, ease: 'none' }, v0));
    el.querySelectorAll('.bg .half img').forEach((im, k) => tl.fromTo(im, { scale: 1.08, x: k ? -40 : 40 }, { scale: 1.12, x: k ? 40 : -40, duration: v1 - v0, ease: 'none' }, v0));
    el.querySelectorAll('.arcs').forEach(a => A_arcs(a, v0, v1));
    el.querySelectorAll('[data-a]').forEach(e => {
      const t = at(e, sc), a = e.dataset.a;
      ({ up: () => A_up(e, t), lines: () => A_lines(e, t), words: () => A_words(e, t), scale: () => A_scale(e, t), pop: () => A_pop(e, t),
        box: () => A_box(e, t), box3d: () => A_box3d(e, t, v1), trace: () => A_trace(e, t), pieces: () => A_pieces(e, t), logoO: () => A_logoO(e, t),
        lett: () => A_lett(e, t), rotulo: () => A_rotulo(e, t), chipL: () => A_chip(e, t, -1), chipR: () => A_chip(e, t, 1),
        count: () => A_count(e, t), grid: () => A_grid(e, t), halfTop: () => A_half(e, t, -1), halfBot: () => A_half(e, t, 1),
        cta: () => A_cta(e, t, sc), form: () => A_form(e, t) }[a] || (() => console.warn('anim?', a)))();
      if (e.dataset.sfx) sfx(e.dataset.sfx, t + (+e.dataset.sfxoff || 0));
      if (e.dataset.out) A_slideout(e, sc.t0 + +e.dataset.out);
    });
  });

  // ---------- máscara dos arcos (1x, no clímax): atravessa da direita para a esquerda ----------
  if (Q.mask) {
    const m = document.getElementById('mask'), T = Q.mask.at, discs = [...m.querySelectorAll('.disc')];
    const R = 1500, from = W + R + 40, to = -R - 520;   // centro do disco: entra pela direita, sai pela esquerda
    tl.set(m, { autoAlpha: 0 }, 0); tl.set(m, { autoAlpha: 1 }, T - .7); tl.set(m, { autoAlpha: 0 }, T + .62);
    discs.forEach((d, k) => {
      const st = T - .5 - .07 * (discs.length - 1 - k);   // o último disco (cor da cena seguinte) cruza o centro no corte
      tl.fromTo(d, { x: from - W / 2 }, { x: to - W / 2, duration: 1.0, ease: SCURVE }, st);
    });
    sfx('build', T);
  }
  tl.set({}, {}, Q.end);
  window.seek = t => { tl.seek(Math.min(t, Q.end), false); };
  window.SEQ_TL = tl;
  window.seek(0);
  window.SEQ_READY = true;
})();

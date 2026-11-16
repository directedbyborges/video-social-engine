// Sequência de cenas (vídeo narrado: b-roll + telas de motion), sem pessoa falando.
// A página do projeto define window.SEQ = {fps, end, scenes:[{id,t0,t1,tin,tout,zoom}], mask:{at}, sfx:[]}
// e cada cena é <section class="scene" id> com .cam > (.bg + .sw). Elementos animados levam data-a (tipo),
// data-t (s desde o início da cena), data-d (duração), data-sfx (evento sonoro), data-click (CTA).
// Câmera em duas camadas (skill B2.5.1): .cam faz a transição de entrada/saída (~1 s, pico no corte),
// .sw faz o zoom do meio (2 keyframes, 13–15%, power2.inOut). window.seek(t) posiciona tudo.
(function () {
  gsap.registerPlugin(CustomEase);
  const SNAP = CustomEase.create('snap', 'M0,0 C0,0 0,1 1,1');
  const ACCEL = CustomEase.create('accel', 'M0,0 C1,0 1,1 1,1');
  const SCURVE = CustomEase.create('scurve', 'M0,0 C0.8,0 0.2,1 1,1');
  const LOGO = CustomEase.create('logo', 'M0,0 C0.33,0 0,1 1,1');
  const Q = window.SEQ;
  const PAN = Q.pan || 220;
  const TR = { zin: { s: 1.2 }, zout: { s: 0.82 }, panR: { x: -PAN }, panL: { x: PAN }, panU: { y: -PAN }, panD: { y: PAN } };
  const exitTo = k => TR[k].s ? { scale: TR[k].s } : { x: TR[k].x || 0, y: TR[k].y || 0 };
  const enterFrom = k => TR[k].s ? { scale: TR[k].s } : { x: -(TR[k].x || 0), y: -(TR[k].y || 0) };
  const tl = gsap.timeline({ paused: true });
  const SFX = Q.sfx = Q.sfx || [];
  const sfx = (type, t) => SFX.push({ type, t: +t.toFixed(3) });

  // ---------- motion blur na troca (filtro SVG direcional) ----------
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
  const BMAX = k => TR[k].s ? [5, 5] : (TR[k].x ? [26, 0] : [0, 26]);

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
  const inBlur = (b = 12) => `blur(${b}px)`;
  function A_up(el, t, d = .75) { tl.fromTo(el, { y: 40, opacity: 0, filter: inBlur(12) }, { y: 0, opacity: 1, filter: inBlur(0), duration: d, ease: SNAP }, t); }
  function A_lines(el, t) {
    tl.fromTo([...el.children], { y: 30, opacity: 0, filter: inBlur(12) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .6, ease: SNAP, stagger: .12 }, t);
  }
  function A_words(el, t) {
    const w = splitWords(el);
    tl.fromTo(w, { y: 46, opacity: 0, filter: inBlur(18) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .65, ease: SNAP, stagger: .08 }, t);
  }
  function A_scale(el, t) { tl.fromTo(el, { scale: 1.32, opacity: 0, filter: inBlur(14) }, { scale: 1, opacity: 1, filter: inBlur(0), duration: .8, ease: SNAP }, t); }
  function A_pop(el, t) { tl.fromTo(el, { scale: .7, rotation: -10, opacity: 0, filter: inBlur(10) }, { scale: 1, rotation: 0, opacity: 1, filter: inBlur(0), duration: .7, ease: SNAP }, t); }
  function A_box(el, t) {
    tl.fromTo(el, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: SNAP }, t);
    tl.fromTo([...el.children], { y: 30, opacity: 0, filter: inBlur(10) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .6, ease: SNAP, stagger: .1 }, t + .12);
  }
  function A_box3d(el, t, end) {
    tl.fromTo(el, { rotationY: 12, rotationX: -6, z: -120, opacity: 0, filter: inBlur(10) },
      { rotationY: 4, rotationX: -2, z: 0, opacity: 1, filter: inBlur(0), duration: .85, ease: SNAP }, t);
    tl.to(el, { rotationY: 1, rotationX: 0, z: 20, duration: Math.max(.2, end - t - .85), ease: 'none' }, t + .85);
    tl.fromTo([...el.children], { y: 30, opacity: 0, filter: inBlur(10) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .6, ease: SNAP, stagger: .1 }, t + .12);
  }
  function A_trace(el, t) {
    const paths = [...el.querySelectorAll('path')];
    paths.forEach(p => { const col = p.getAttribute('fill'); p.setAttribute('pathLength', 1); p.style.stroke = col; p.style.strokeWidth = el.dataset.sw || 1.1; p.style.strokeDasharray = 1; });
    tl.fromTo(paths, { strokeDashoffset: 1, fillOpacity: 0, strokeOpacity: 1 }, { strokeDashoffset: 0, duration: .75, ease: SCURVE }, t);
    tl.to(paths, { fillOpacity: 1, duration: .3, ease: 'none' }, t + .6);
    tl.to(paths, { strokeOpacity: 0, duration: .3, ease: 'none' }, t + .75);
    tl.fromTo(el, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .5, ease: SNAP }, t);
  }
  function A_pieces(el, t) {
    const paths = [...el.querySelectorAll('path')];
    tl.fromTo(paths, { y: 40, rotation: -8, opacity: 0, transformOrigin: '50% 50%' }, { y: 0, rotation: 0, opacity: 1, duration: .7, ease: SNAP, stagger: .06 }, t);
  }
  function A_draw(path, t, d = .7) {
    path.setAttribute('pathLength', 1); path.style.strokeDasharray = 1;
    tl.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: SCURVE }, t);
  }
  function A_lett(el, t) {
    const w = splitWords(el);
    tl.fromTo(w, { y: 46, opacity: 0, filter: inBlur(18) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .65, ease: SNAP, stagger: .08 }, t);
    const p = el.querySelector('svg path'); if (p) A_draw(p, t + .3 + .08 * w.length * .5);
  }
  function A_rotulo(el, t) {
    const w = splitWords(el);
    tl.fromTo(w, { y: 30, opacity: 0, filter: inBlur(12) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .6, ease: SNAP, stagger: .07 }, t);
    el.querySelectorAll('svg path').forEach(p => A_draw(p, t + .1, .8));
  }
  function A_chip(el, t, dir) {
    const w = el.offsetWidth, h = el.offsetHeight, side = Math.max(0, (w - h) / 2);
    const kids = el.querySelector('.ct');
    tl.fromTo(el, { x: dir * 240, opacity: 0, clipPath: `inset(0px ${side}px 0px ${side}px round ${h / 2}px)` },
      { x: 0, opacity: 1, duration: .5, ease: 'power2.out' }, t);
    tl.fromTo(el, { clipPath: `inset(0px ${side}px 0px ${side}px round ${h / 2}px)` },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: .45, ease: 'power2.inOut', immediateRender: false }, t + .38);
    if (kids) tl.fromTo(kids, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: SNAP }, t + .58);
  }
  function A_count(el, t) {
    const n = +el.dataset.n, o = { v: 0 };
    tl.fromTo(o, { v: 0 }, { v: n, duration: +(el.dataset.d || .9), ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }, t);
    tl.fromTo(el, { scale: 1.32, opacity: 0, filter: inBlur(14) }, { scale: 1, opacity: 1, filter: inBlur(0), duration: .8, ease: SNAP }, t);
  }
  function A_grid(el, t) {
    const k = [...el.children];
    tl.fromTo(k, { scale: .6, opacity: 0, filter: inBlur(10), y: 24 }, { scale: 1, opacity: 1, filter: inBlur(0), y: 0, duration: .6, ease: SNAP, stagger: { each: .045 } }, t);
  }
  function A_half(el, t, dir) { tl.fromTo(el, { y: dir * 420, filter: inBlur(10) }, { y: 0, filter: inBlur(0), duration: .8, ease: SNAP }, t); }
  function A_slideout(el, t) { tl.to([...el.children], { x: 700, opacity: 0, duration: .6, ease: ACCEL, stagger: .06 }, t); }
  function A_grow(el, t) {
    tl.fromTo(el, { scale: 0, y: 150 }, { scale: 1.25, y: 150, duration: 1.05, ease: LOGO }, t);
    tl.to(el, { scale: 1, y: 0, duration: .9, ease: SCURVE }, t + 1.05);
  }
  function A_cta(el, t, sc) {
    const btn = el.querySelector('.ctabtn'), cur = el.querySelector('.cursor'), sub = el.querySelector('.ctasub');
    const ck = sc.t0 + +(el.dataset.click || 1.35);
    tl.fromTo(btn, { scale: .85, opacity: 0, filter: inBlur(10) }, { scale: 1, opacity: 1, filter: inBlur(0), duration: .8, ease: SNAP }, t);
    tl.fromTo(cur, { x: 280, y: 420, rotation: -12, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .8, ease: SCURVE }, ck - .95);
    tl.to(cur, { scale: .85, duration: .1, ease: 'power2.out', transformOrigin: '10% 5%' }, ck);
    tl.to(cur, { scale: 1, duration: .1, ease: 'power2.in' }, ck + .1);
    tl.to(btn, { scale: .95, duration: .12, ease: 'power2.out' }, ck);
    tl.to(btn, { scale: 1, duration: .13, ease: 'power2.in' }, ck + .12);
    const ring = el.querySelector('.ring'), shine = el.querySelector('.shine');
    if (ring) tl.fromTo(ring, { scale: 0, opacity: .55 }, { scale: 1.6, opacity: 0, duration: .5, ease: 'power2.out' }, ck);
    if (shine) tl.fromTo(shine, { opacity: 0 }, { opacity: .28, duration: .08, yoyo: true, repeat: 1, ease: 'none' }, ck);
    if (sub) { const w = splitWords(sub); tl.fromTo(w, { y: 26, opacity: 0, filter: inBlur(10) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .55, ease: SNAP, stagger: .07 }, ck + .15); }
    sfx('click', ck);
  }
  function A_form(el, t) {
    tl.fromTo(el, { y: 60, opacity: 0, filter: inBlur(10) }, { y: 0, opacity: 1, filter: inBlur(0), duration: .7, ease: SNAP }, t);
    el.querySelectorAll('.ok').forEach((o, i) => { const tt = t + .45 + i * .28; tl.fromTo(o, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: SNAP }, tt); sfx('check', tt); });
  }
  function A_arcs(el, sc) {
    el.querySelectorAll('circle').forEach((c, i) => tl.fromTo(c, { x: 0 }, { x: (4 + 3 * i) * (sc.t1 - sc.t0 + 1), duration: sc.t1 - sc.t0 + 1, ease: 'none' }, sc.t0 - .5));
  }

  // ---------- cenas ----------
  Q.scenes.forEach((sc, i) => {
    const el = document.getElementById(sc.id), cam = el.querySelector('.cam'), sw = el.querySelector('.sw');
    const dur = sc.t1 - sc.t0, c = (sc.t0 + sc.t1) / 2;
    tl.set(el, { autoAlpha: 0 }, 0); tl.set(el, { autoAlpha: 1 }, sc.t0); tl.set(el, { autoAlpha: 0 }, sc.t1);
    const setBlur = blurFor(cam, sc.id);
    const dIn = Math.min(.9, dur * .42), dOut = Math.min(.9, dur * .42);
    if (sc.tin && TR[sc.tin]) {
      tl.fromTo(cam, enterFrom(sc.tin), { x: 0, y: 0, scale: 1, duration: dIn, ease: SNAP }, sc.t0);
      const [mx, my] = BMAX(sc.tin), o = { b: 1 };
      tl.fromTo(o, { b: 1 }, { b: 0, duration: dIn * .5, ease: SNAP, onUpdate: () => setBlur(o.b * mx, o.b * my) }, sc.t0);
    }
    if (sc.tout && TR[sc.tout]) {
      tl.fromTo(cam, { x: 0, y: 0, scale: 1 }, Object.assign(exitTo(sc.tout), { duration: dOut, ease: ACCEL, immediateRender: false }), sc.t1 - dOut);
      const [mx, my] = BMAX(sc.tout), o = { b: 0 };
      tl.fromTo(o, { b: 0 }, { b: 1, duration: dOut * .5, ease: ACCEL, immediateRender: false, onUpdate: () => setBlur(o.b * mx, o.b * my) }, sc.t1 - dOut * .5);
      if (i < Q.scenes.length - 1) sfx('cut', sc.t1);
    }
    if (sc.zoom === 'in') { tl.set(sw, { scale: .87 }, 0); tl.to(sw, { scale: 1, duration: .8, ease: 'power2.inOut' }, c - .4); }
    else if (sc.zoom === 'out') { tl.set(sw, { scale: 1 }, 0); tl.to(sw, { scale: .88, duration: .8, ease: 'power2.inOut' }, c - .4); }
    el.querySelectorAll('.bg img.drift').forEach(im => tl.fromTo(im, { scale: 1 }, { scale: 1.04, duration: dur + .2, ease: 'none' }, sc.t0));
    el.querySelectorAll('.arcs').forEach(a => A_arcs(a, sc));
    el.querySelectorAll('[data-a]').forEach(e => {
      const t = at(e, sc), a = e.dataset.a;
      ({ up: () => A_up(e, t), lines: () => A_lines(e, t), words: () => A_words(e, t), scale: () => A_scale(e, t), pop: () => A_pop(e, t),
        box: () => A_box(e, t), box3d: () => A_box3d(e, t, sc.t1), trace: () => A_trace(e, t), pieces: () => A_pieces(e, t),
        lett: () => A_lett(e, t), rotulo: () => A_rotulo(e, t), chipL: () => A_chip(e, t, -1), chipR: () => A_chip(e, t, 1),
        count: () => A_count(e, t), grid: () => A_grid(e, t), halfTop: () => A_half(e, t, -1), halfBot: () => A_half(e, t, 1),
        grow: () => A_grow(e, t), cta: () => A_cta(e, t, sc), form: () => A_form(e, t) }[a] || (() => console.warn('anim?', a)))();
      if (e.dataset.sfx) sfx(e.dataset.sfx, t + (+e.dataset.sfxoff || 0));
      if (e.dataset.out) A_slideout(e, sc.t0 + +e.dataset.out);
    });
  });

  // ---------- máscara dos arcos (1x, no clímax) ----------
  if (Q.mask) {
    const m = document.getElementById('mask'), T = Q.mask.at;
    const discs = [...m.querySelectorAll('.disc')];
    tl.set(m, { autoAlpha: 0 }, 0); tl.set(m, { autoAlpha: 1 }, T - 1.0); tl.set(m, { autoAlpha: 0 }, T + .04);
    tl.fromTo(discs, { scale: 0 }, { scale: 1, duration: .75, ease: SCURVE, stagger: .1 }, T - .95);
    sfx('build', T);
  }
  tl.set({}, {}, Q.end);
  window.seek = t => { tl.seek(Math.min(t, Q.end), false); };
  window.SEQ_TL = tl;
  window.seek(0);
  window.SEQ_READY = true;
})();

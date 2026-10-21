// Linha do tempo mestra: painéis (tela dividida / tela cheia), cenas e legendas. ?layer=behind renderiza só os textos "atrás da pessoa".
const LAYER = new URLSearchParams(location.search).get('layer') || 'front';
const ENTER = .6, EXIT = .45;
const CAP = TL.captionY; // {full, split, panel}
const CUTSEQ = ['zin', 'panR', 'zout', 'panL'];
const SFX = [];  // [evento, tempo] exportado para a mixagem
function relP(p, t0) {
  const o = {};
  for (const [k, v] of Object.entries(p)) {
    if (typeof v === 'number' && (k.endsWith('At') || k === 'at' || k === 'typeEnd')) o[k] = v - t0;
    else if (Array.isArray(v) && v.every(x => typeof x === 'number')) o[k] = v.map(x => x - t0);
    else if (Array.isArray(v)) o[k] = v.map(it => Array.isArray(it) ? it.map((x, j) => (j === 1 && k === 'lines') || (j === it.length - 1 && k !== 'lines') ? (typeof x === 'number' ? x - t0 : x) : x) : it);
    else o[k] = v;
  }
  return o;
}
// ---------- legendas ----------
function kwOpen(dev) { return `<span class="kw ${dev}"><span class="kbg"></span>`; }
function buildCaptions(master) {
  const C = document.getElementById('capsC'), F = document.getElementById('capsF');
  TL.groups.forEach((g, gi) => {
    const behind = g.flags.includes('behind');
    if ((LAYER === 'behind') !== behind) return;
    const d = document.createElement('div');
    d.className = 'grp' + (g.flags.includes('hook') ? ' hook' : '') + (behind ? ' behind' : '') + (g.flags.includes('pills') ? ' pills' : '');
    let h = g.flags.includes('logo') ? `<img class="glogo" src="${IMG.logo}">` : '';
    g.lines.forEach((l, li) => {
      const isPill = g.flags.includes('pills') && !l.big && li > 0;
      h += `<div class="ln${l.big ? ' big' : ''}${isPill ? ' pl' : ''}">${isPill ? '<span class="kbg"></span>' : ''}`;
      let inKw = false;
      l.toks.forEach((t, i) => {
        const kw = t.kw && !isPill;
        if (kw && !inKw) { h += kwOpen(TL.keyword); inKw = true; }
        if (!kw && inKw) { h += `</span><span class="kgap"></span>`; inKw = false; }
        const nxt = l.toks[i + 1];
        const gap = nxt && !(kw && !(nxt.kw)) ? ' gap' : '';
        h += `<span class="tk${t.cyan ? ' cy' : ''}${gap}" data-t="${t.t}">${t.w}</span>`;
      });
      if (inKw) h += `</span>`;
      h += `</div>`;
    });
    d.innerHTML = h;
    const fixed = g.y != null || behind;
    (fixed ? F : C).appendChild(d);
    d.querySelectorAll('.ln').forEach(ln => {
      const w = ln.scrollWidth, fs = parseFloat(getComputedStyle(ln).fontSize);
      if (behind && ln.classList.contains('big')) ln.style.fontSize = Math.min(fs * 3, fs * 1000 / w) + 'px';   // atrás da pessoa: ocupa a largura
      else if (w > 960) ln.style.fontSize = (fs * 950 / w) + 'px';
    });
    d.style.top = ((fixed ? (g.y != null ? g.y : 560) : 0) - d.offsetHeight / 2) + 'px';
    // devices desenhados depois do layout
    if (TL.keyword === 'scribble') d.querySelectorAll('.kw.scribble').forEach(k => {
      const w = k.offsetWidth + 28, hh = k.offsetHeight + 24, rc = rough.svg(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      const node = rc.ellipse(w / 2, hh / 2, w, hh, { stroke: getComputedStyle(document.documentElement).getPropertyValue('--c1').trim(), strokeWidth: 5, roughness: 1.6, seed: 7 + gi });
      k.querySelector('.kbg').innerHTML = `<svg width="${w}" height="${hh}"></svg>`; k.querySelector('.kbg svg').appendChild(node);
    });
    const t0 = Math.max(0, g.t);
    if (LAYER === 'front' || behind) {
      const fb = d.querySelector('.ln.big .tk');
      if (g.flags.includes('hook') && fb) SFX.push(['hook_word', +fb.dataset.t]);
      else if (fb && !SFX.some(e => e[0] === 'big_word' && Math.abs(e[1] - fb.dataset.t) < 2.5)) SFX.push(['big_word', +fb.dataset.t]);
      d.querySelectorAll('.ln.pl').forEach(pl => SFX.push(['pill', +pl.querySelector('.tk').dataset.t]));
    }
    master.set(d, { visibility: 'visible', opacity: 1 }, t0);
    master.to(d, { opacity: 0, duration: .08 }, g.end - .08);
    master.set(d, { visibility: 'hidden' }, g.end);
    const lg = d.querySelector('.glogo');
    if (lg) master.fromTo(lg, { y: 30, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'power3.out' }, t0);
    d.querySelectorAll('.tk').forEach(tk => {
      const t = Math.max(t0, +tk.dataset.t), big = tk.closest('.ln').classList.contains('big');
      master.fromTo(tk, { y: big ? 20 : 36, scale: big ? 1.35 : 1, opacity: 0, filter: 'blur(14px)' }, { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: .4, ease: 'power3.out' }, t);
    });
    d.querySelectorAll('.kw').forEach(k => {
      const t = Math.max(t0, +k.querySelector('.tk').dataset.t - .06), bg = k.querySelector('.kbg');
      if (TL.keyword === 'pill' || TL.keyword === 'marker') master.fromTo(bg, { scaleX: 0 }, { scaleX: 1, duration: .35, ease: 'expo.out' }, t);
      else if (TL.keyword === 'frame') { master.fromTo(bg, { clipPath: 'inset(0 100% 0 0)', scale: 1.15 }, { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: .45, ease: 'power3.out' }, t); }
      else if (TL.keyword === 'lines') master.fromTo(bg, { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: .45, ease: 'expo.out' }, t);
      else if (TL.keyword === 'scribble') { const pth = bg.querySelectorAll('path'); pth.forEach(pp => draw(master, pp, t, .45, 'power2.out')); }
    });
    d.querySelectorAll('.ln.pl').forEach(pl => {
      const t = Math.max(t0, +pl.querySelector('.tk').dataset.t - .08);
      master.fromTo(pl.querySelector('.kbg'), { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(2)' }, t);
    });
  });
}
// ---------- painéis ----------
function buildPanels(master) {
  const stage = document.getElementById('stage'), caps = document.getElementById('capsC');
  master.set(caps, { y: CAP.full }, 0);
  TL.panels.forEach((s, si) => {
    const P = document.createElement('div'); P.className = 'panel ' + s.mode;
    P.innerHTML = `<div class="box"></div>${s.mode === 'split' ? '<div class="divider"></div>' : ''}`;
    stage.insertBefore(P, document.getElementById('caps'));
    if (LAYER === 'behind') return;
    const H = s.mode === 'split' ? 960 : 1920, capY = s.mode === 'split' ? CAP.split : CAP.panel;
    const from = s.mode === 'split' ? -H : H, away = s.mode === 'split' ? -H : -H;
    master.set(P, { visibility: 'visible' }, s.start);
    SFX.push([s.mode === 'split' ? 'split_in' : 'fullscreen_in', s.start]);
    if (!s.hold) SFX.push([s.mode === 'split' ? 'split_out' : 'fullscreen_out', s.end]);
    if (s.start <= .01) { master.set(P, { y: 0 }, 0); master.set(caps, { y: capY }, 0); }
    else {
      master.fromTo(P, { y: from }, { y: 0, duration: ENTER, ease: 'power3.out', immediateRender: false }, s.start);
      master.fromTo(caps, { y: CAP.full }, { y: capY, duration: ENTER, ease: 'power3.out', immediateRender: false }, s.start);
    }
    if (!s.hold) {
      master.to(P, { y: away, duration: EXIT, ease: 'power3.in' }, s.end - EXIT);
      master.to(caps, { y: CAP.full, duration: EXIT, ease: 'power3.in' }, s.end - EXIT);
      master.set(P, { visibility: 'hidden' }, s.end);
    }
    const box = P.querySelector('.box');
    s.scenes.forEach((sc, i) => {
      const sec = document.createElement('section'); sec.className = 'scene';
      sec.innerHTML = `<div class="cam"><div class="fill"></div>${TL.panelDots ? '<div class="dots"></div>' : ''}<div class="glow amb" style="opacity:${TL.panelGlow}"></div><div class="foc">${s.mode === 'full' && sc.title ? `<div class="ptitle">${sc.title}</div>` : ''}${SC[sc.type].html(sc)}</div></div>`;
      box.appendChild(sec);
      const L = sc.end - sc.t, tl = gsap.timeline();
      const cin = i === 0 ? null : CUTSEQ[(si + i - 1) % 4], cout = CUTSEQ[(si + i) % 4], last = i === s.scenes.length - 1;
      camCut(tl, sec.querySelector('.cam'), L, cin, cout, last);
      tl.fromTo(sec.querySelector('.amb'), { x: -180 }, { x: 180, duration: L, ease: 'sine.inOut' }, 0);
      const rp = relP(sc, sc.t);
      if (i > 0) SFX.push(['scene_cut', sc.t]);
      if (SC[sc.type].sfx) SC[sc.type].sfx(rp).forEach(e => { if (e[1] != null && !isNaN(e[1])) SFX.push([e[0], sc.t + e[1]].concat(e[2] != null ? [sc.t + e[2]] : [])); });
      SC[sc.type].build(tl, sec.querySelector('.foc'), rp, L);
      const pt = sec.querySelector('.ptitle'); if (pt) enterBlur(tl, pt, .1, { y: -60, opacity: 0 }, .55);
      tl.set({}, {}, L);
      master.set(sec, { visibility: 'visible' }, sc.t);
      master.add(tl, sc.t);
      master.set(sec, { visibility: 'hidden' }, sc.end);
    });
  });
}
document.fonts.ready.then(() => {
  const master = gsap.timeline({ paused: true });
  buildPanels(master);
  buildCaptions(master);
  master.set({}, {}, TL.gfxEnd + .5);
  window.DURATION = TL.gfxEnd;
  window.seek = t => { master.time(t + 0.0005, false); };
  window.SFX = SFX;
  window.READY = true;
});

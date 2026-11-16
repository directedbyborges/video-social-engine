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
    if (TL.capBox) h += '<div class="cbox">';
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
    if (TL.capBox) h += '</div>';
    d.innerHTML = h;
    const fixed = g.y != null || behind;
    (fixed ? F : C).appendChild(d);
    d.querySelectorAll('.ln').forEach(ln => {
      const w = ln.scrollWidth, fs = parseFloat(getComputedStyle(ln).fontSize);
      if (behind && ln.classList.contains('big')) ln.style.fontSize = Math.min(fs * 3, fs * 1000 / w) + 'px';   // atrás da pessoa: ocupa a largura
      else if (w > (TL.capBox ? 776 : 960)) ln.style.fontSize = (fs * (TL.capBox ? 770 : 950) / w) + 'px';
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
    const out = camState(g.out, false);
    if (out) {   // a legenda sai junto com a cena (mesma transição do corte)
      const OUT = Math.min(.6, (g.end - t0) * .35);
      master.to(d, Object.assign({ duration: OUT, ease: 'expo.in' }, out, { scale: out.scale === 1 ? 1 : (out.scale > 1 ? 1.25 : .8), opacity: out.scale === 1 ? 1 : 0 }), g.end - OUT);
      master.fromTo(d, { filter: 'blur(0px)' }, { filter: 'blur(10px)', duration: OUT * .45, ease: 'power2.in', immediateRender: false }, g.end - OUT * .45);
    } else master.to(d, { opacity: 0, duration: g.out === 'fade' ? .3 : .08 }, g.end - (g.out === 'fade' ? .3 : .08));
    master.set(d, { visibility: 'hidden' }, g.end);
    const lg = d.querySelector('.glogo');
    if (lg) master.fromTo(lg, { y: 30, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'power3.out' }, t0);
    const cb = d.querySelector('.cbox');
    if (cb) {   // legenda em caixa (marca): caixa abre do centro, linhas sobem uma a uma
      master.fromTo(cb, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .5, ease: 'expo.out', immediateRender: false }, t0);
      d.querySelectorAll('.ln').forEach((ln, i) => master.fromTo(ln, { y: 30, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'expo.out', immediateRender: false }, t0 + .08 + i * .12));
      master.set(cb, { clipPath: 'inset(0% 50% 0% 50%)' }, 0);
    }
    if (!cb) d.querySelectorAll('.tk').forEach(tk => {
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
// s.bg: (padrão) gradiente da marca | 'none' (transparente, sobre o b-roll) | 'azul' | 'arcos' | 'arcosBranco' | 'branco' | 'cinza'
// s.enter / s.exit: 'slide' (padrão: painel sobe da base) | 'cut' (aparece no corte; a câmera da cena faz o movimento)
// sc.cin / sc.cout: transição de entrada/saída da cena (zin, zout, panL, panR, panU, panD, none); sc.zoom: 'in' | 'out' (zoom do meio)
function panelBg(bg) {
  if (bg === 'none') return '';
  if (bg === 'azul') return '<div class="fill" style="background:var(--c2)"></div>';
  if (bg === 'branco') return '<div class="fill" style="background:#fff"></div>';
  if (bg === 'cinza') return '<div class="fill" style="background:var(--cinza-claro,#f1f1f1)"></div>';
  if (bg === 'arcos') return `<div class="fill" style="background:var(--c2)"></div><img class="arc" src="${IMG.arcos}">`;
  if (bg === 'arcosBranco') return `<div class="fill" style="background:#fff"></div><img class="arc" src="${IMG.arcosBranco}">`;
  return `<div class="fill"></div>${TL.panelDots ? '<div class="dots"></div>' : ''}<div class="glow amb" style="opacity:${TL.panelGlow}"></div>`;
}
function buildPanels(master) {
  const stage = document.getElementById('stage'), caps = document.getElementById('capsC');
  master.set(caps, { y: CAP.full }, 0);
  TL.panels.forEach((s, si) => {
    const P = document.createElement('div'); P.className = 'panel ' + s.mode + (s.bg === 'none' ? ' clear' : '');
    P.innerHTML = `<div class="box"></div>${s.mode === 'split' ? '<div class="divider"></div>' : ''}`;
    stage.insertBefore(P, document.getElementById('caps'));
    if (LAYER === 'behind') return;
    const H = s.mode === 'split' ? 960 : 1920, capY = s.mode === 'split' ? CAP.split : CAP.panel;
    const from = s.mode === 'split' ? -H : H, away = s.mode === 'split' ? -H : -H;
    const cutIn = s.enter === 'cut', cutOut = s.exit === 'cut' || s.enter === 'cut';
    master.set(P, { visibility: 'visible' }, s.start);
    if (!cutIn) SFX.push([s.mode === 'split' ? 'split_in' : 'fullscreen_in', s.start]);
    else if (s.start > .05) SFX.push(['scene_cut', s.start]);
    if (!s.hold && !cutOut) SFX.push([s.mode === 'split' ? 'split_out' : 'fullscreen_out', s.end]);
    if (s.start <= .01 || cutIn) { master.set(P, { y: 0 }, s.start); master.set(caps, { y: capY }, s.start); }
    else {
      master.fromTo(P, { y: from }, { y: 0, duration: ENTER, ease: 'power3.out', immediateRender: false }, s.start);
      master.fromTo(caps, { y: CAP.full }, { y: capY, duration: ENTER, ease: 'power3.out', immediateRender: false }, s.start);
    }
    if (!s.hold) {
      if (!cutOut) {
        master.to(P, { y: away, duration: EXIT, ease: 'power3.in' }, s.end - EXIT);
        master.to(caps, { y: CAP.full, duration: EXIT, ease: 'power3.in' }, s.end - EXIT);
      } else master.set(caps, { y: CAP.full }, s.end);
      master.set(P, { visibility: 'hidden' }, s.end);
    }
    const box = P.querySelector('.box');
    s.scenes.forEach((sc, i) => {
      const sec = document.createElement('section'); sec.className = 'scene';
      const bg = sc.bg != null ? sc.bg : s.bg;
      sec.innerHTML = `<div class="cam">${panelBg(bg)}<div class="sw"><div class="foc">${s.mode === 'full' && sc.heading ? `<div class="ptitle">${sc.heading}</div>` : ''}${SC[sc.type].html(sc)}</div></div></div>`;
      box.appendChild(sec);
      const L = sc.end - sc.t, tl = gsap.timeline();
      const last = i === s.scenes.length - 1;
      const cin = sc.cin !== undefined ? sc.cin : (i === 0 ? (cutIn && s.start > .05 ? 'zin' : null) : CUTSEQ[(si + i - 1) % 4]);
      const cout = sc.cout !== undefined ? sc.cout : (last && (s.hold || !cutOut) ? null : CUTSEQ[(si + i) % 4]);
      camCut(tl, sec.querySelector('.cam'), L, cin, cout);
      if (sc.zoom) midZoom(tl, sec.querySelector('.sw'), L, sc.zoom);
      const amb = sec.querySelector('.amb'); if (amb) tl.fromTo(amb, { x: -180 }, { x: 180, duration: L, ease: 'sine.inOut' }, 0);
      const arc = sec.querySelector('.arc'); if (arc) tl.fromTo(arc, { x: -30 }, { x: 30, duration: L, ease: 'none' }, 0);
      const rp = relP(sc, sc.t);
      if (i > 0) SFX.push(['scene_cut', sc.t]);
      if (SC[sc.type].sfx) SC[sc.type].sfx(rp).forEach(e => { if (e[1] != null && !isNaN(e[1])) SFX.push([e[0], sc.t + e[1]].concat(e[2] != null ? [sc.t + e[2]] : [])); });
      SC[sc.type].build(tl, sec.querySelector('.foc'), rp, L);
      const pt = sec.querySelector('.ptitle'); if (pt) enterBlur(tl, pt, .1, { y: -60, opacity: 0 }, .55);
      tl.set({}, {}, L);
      master.set(sec, { visibility: 'visible' }, sc.t);
      master.add(tl, sc.t);
      if (!(last && s.hold)) master.set(sec, { visibility: 'hidden' }, sc.end);
    });
  });
}
// ---------- máscara da marca (arcos varrendo a tela, 1 vez no clímax) ----------
function buildMasks(master) {
  if (LAYER === 'behind' || !(TL.masks || []).length) return;
  const stage = document.getElementById('stage');
  const cols = ['var(--apoio,#617DAE)', 'var(--c2)', 'var(--logo,#476D9E)', 'var(--c2)', 'var(--apoio,#617DAE)'];
  TL.masks.forEach(T => {
    const M = document.createElement('div'); M.className = 'maskx';
    // discos dos arcos: centros no canto inferior direito, deslocando para a direita conforme diminuem (geometria do fundo da marca)
    const D = [[4400, 1150], [3800, 1220], [3200, 1290], [2600, 1360], [2000, 1440]], CY = 1750;
    M.innerHTML = cols.map((c, i) => `<i style="background:${c};width:${D[i][0]}px;height:${D[i][0]}px;left:${D[i][1] - D[i][0] / 2}px;top:${CY - D[i][0] / 2}px"></i>`).join('');
    stage.appendChild(M);
    const ds = M.querySelectorAll('i');
    master.set(M, { visibility: 'visible' }, T - .55);
    ds.forEach((d, i) => {
      master.fromTo(d, { scale: 0 }, { scale: 1, duration: .55 - i * .04, ease: 'power3.in', immediateRender: false }, T - .55 + i * .04);
      master.to(d, { x: -3600, duration: .7 + i * .04, ease: 'expo.in' }, T - .05 + (4 - i) * .03);
    });
    master.set(M, { visibility: 'hidden' }, T + .95);
    SFX.push(['end_transition', T - .1]);
  });
}
document.fonts.ready.then(() => {
  const master = gsap.timeline({ paused: true });
  buildPanels(master);
  buildCaptions(master);
  buildMasks(master);
  master.set({}, {}, TL.gfxEnd + .5);
  window.DURATION = TL.gfxEnd;
  window.seek = t => { master.time(t + 0.0005, false); };
  window.SFX = SFX;
  window.READY = true;
});

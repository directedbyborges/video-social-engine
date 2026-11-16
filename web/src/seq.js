// Modo seq — vídeo narrado montado como sequência de cenas: fundo (clipe em quadros, foto, cor da marca) +
// sobreposição (texto, logo, selo, número, formulário, CTA) dentro da MESMA câmera. Movimento em duas camadas:
// .cam = transição de entrada/saída (zoom ou pan, pico de velocidade no corte); .sw/.ov = zoom do meio (13–15%).
// Curvas: SNAP-IN expo.out (entradas), ACCEL-OUT expo.in (saídas), S-CURVE power4.inOut (movimentos grandes).
const SQ = { PAN: 240, PANV: 340, ZI: 1.2, ZO: .86, IN: .8, OUT: .6, BLUR: 9 };
const SNAP = 'expo.out', ACC = 'expo.in', SCURVE = 'power4.inOut', LOGOE = CustomEaseLite(.33, 0, 0, 1);
const V = n => `var(--${n})`;
const seqClips = [];   // imagens de clipe por cena, trocadas quadro a quadro no seek
function CustomEaseLite(x1, y1, x2, y2) {   // cubic-bezier como função de easing do GSAP
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
  return p => { let t = p; for (let i = 0; i < 8; i++) { const e = X(t) - p, d = dX(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; } return Y(Math.min(1, Math.max(0, t))); };
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// "**negrito**" + palavras em spans (.w) para animar palavra por palavra; "#" = número animado
function words(txt) {
  let out = '', bold = false;
  esc(txt).split(/(\*\*)/).forEach(p => {
    if (p === '**') { bold = !bold; return; }
    p.split(/(\s+)/).forEach(w => {
      if (!w) return;
      if (/^\s+$/.test(w)) { out += ' '; return; }
      const inner = w.replace('#', '<span class="num">0</span>');
      out += `<span class="w">${bold ? '<b>' + inner + '</b>' : inner}</span>`;
    });
  });
  return out;
}
function rowHTML(r) {
  const cls = r.sob ? 'r sob' : 'r';
  const st = `font-size:${r.px || 96}px;${r.w ? 'font-weight:' + r.w + ';' : ''}${r.color ? 'color:' + r.color + ';' : ''}${r.mt ? 'margin-top:' + r.mt + 'px;' : ''}${r.ls != null ? 'letter-spacing:' + r.ls + 'em;' : ''}`;
  const inner = `<span class="${cls}" style="${st}">${words(r.txt)}</span>`;
  if (r.traco) return `<span class="lt" data-traco="${r.traco}" style="display:block">${inner}</span>`;
  if (r.rotulo) return `<span class="rot" data-forma="${r.rotulo}" style="${r.color ? 'color:' + r.color : ''}">${inner}</span>`;
  return inner;
}
function svgClean(s) { return (s || '').replace(/\s(width|height)="[^"]*"/g, ''); }
function fillSvg(s, c) { return svgClean(s).replace(/fill="#[0-9A-Fa-f]{3,6}"/g, `fill="${c}"`); }
// ---------- traços da marca (lettering e text label) ----------
function tracar(el, color) {
  const tipo = el.getAttribute('data-traco'), last = el.querySelector('.r');
  const w = last.offsetWidth, base = last.offsetTop + last.offsetHeight, x0 = last.offsetLeft;
  const k = parseFloat(getComputedStyle(last).fontSize) / (tipo === 'parentese' ? 72 : 48);
  let d, x = x0, y, vw, vh;
  if (tipo === 'gancho') { vw = w + 56 * k; vh = 64 * k; y = base - 50 * k; d = `M0 ${58 * k} L${w + 4 * k} ${58 * k} C${w + 40 * k} ${58 * k} ${w + 54 * k} ${40 * k} ${w + 54 * k} ${8 * k}`; }
  else if (tipo === 'parentese') { vw = 110 * k; vh = 120 * k; x = x0 + w + 24 * k; y = base - 104 * k; d = `M${2 * k} ${102 * k} C${46 * k} ${104 * k} ${82 * k} ${92 * k} ${86 * k} ${62 * k} C${90 * k} ${34 * k} ${74 * k} ${14 * k} ${62 * k} ${4 * k}`; }
  else { vw = w + 70 * k; vh = 24 * k; x = x0 - 35 * k; y = base - 2 * k; d = `M0 ${14 * k} C${vw * .3} ${4 * k} ${vw * .55} ${22 * k} ${vw} ${8 * k}`; }
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'tr'); s.setAttribute('viewBox', `0 0 ${vw} ${vh}`); s.setAttribute('width', vw); s.setAttribute('height', vh);
  s.style.left = x + 'px'; s.style.top = y + 'px';
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.style.stroke = color; s.appendChild(p); el.appendChild(s);
  return p;
}
function rotular(el) {
  const w = el.offsetWidth, h = el.offsetHeight, r = 24;
  const d = el.getAttribute('data-forma') === 'sublinhado'
    ? `M0 ${h + 6} L${w + 8 - r} ${h + 6} Q${w + 8} ${h + 6} ${w + 8} ${h + 6 - r} L${w + 8} ${h * .1}`
    : `M-4 ${h + 2} L-4 ${r - 4} Q-4 -4 ${r - 4} -4 L${w * .45} -4 M${w * .62} ${h + 6} L${w + 8 - r} ${h + 6} Q${w + 8} ${h + 6} ${w + 8} ${h + 6 - r} L${w + 8} ${h * .45}`;
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.appendChild(p); el.appendChild(s);
  return p;
}
function traceIn(tl, path, t, d = .7) {
  const len = path.getTotalLength ? path.getTotalLength() : 600;
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: SCURVE, immediateRender: true }, t);
}
// ---------- câmera ----------
function camSeq(tl, cam, L, cin, cout) {
  const blur = v => `blur(${v}px)`;
  const moving = c => c && c !== 'mask' && c !== 'end' && c !== 'none';
  if (cin === 'zin') tl.fromTo(cam, { scale: SQ.ZI }, { scale: 1, duration: SQ.IN, ease: SNAP }, 0);
  else if (cin === 'zout') tl.fromTo(cam, { scale: SQ.ZO }, { scale: 1, duration: SQ.IN, ease: SNAP }, 0);
  else if (cin === 'panR' || cin === 'panL') tl.fromTo(cam, { x: cin === 'panR' ? -SQ.PAN : SQ.PAN }, { x: 0, duration: SQ.IN, ease: SNAP }, 0);
  else if (cin === 'panU' || cin === 'panD') tl.fromTo(cam, { y: cin === 'panU' ? SQ.PANV : -SQ.PANV }, { y: 0, duration: SQ.IN, ease: SNAP }, 0);
  else if (!cin) tl.fromTo(cam, { scale: 1.08 }, { scale: 1, duration: 1.0, ease: SNAP }, 0);
  if (moving(cin)) tl.fromTo(cam, { filter: blur(SQ.BLUR) }, { filter: blur(0), duration: .22, ease: 'power2.out' }, 0);
  const o = L - SQ.OUT;
  if (cout === 'zin') tl.to(cam, { scale: SQ.ZI, duration: SQ.OUT, ease: ACC }, o);
  else if (cout === 'zout') tl.to(cam, { scale: SQ.ZO, duration: SQ.OUT, ease: ACC }, o);
  else if (cout === 'panR' || cout === 'panL') tl.to(cam, { x: cout === 'panR' ? SQ.PAN : -SQ.PAN, duration: SQ.OUT, ease: ACC }, o);
  else if (cout === 'panU' || cout === 'panD') tl.to(cam, { y: cout === 'panU' ? -SQ.PANV : SQ.PANV, duration: SQ.OUT, ease: ACC }, o);
  if (moving(cout)) tl.fromTo(cam, { filter: blur(0) }, { filter: blur(SQ.BLUR), duration: .18, ease: 'power2.in', immediateRender: false }, L - .18);
}
// zoom do meio: dois keyframes, ~0,8 s, power2.inOut, centrado na cena; no fundo com 40% da força
function midZoom(tl, ov, bgw, L, dir) {
  if (!dir) return;
  const d = Math.min(.8, L * .42), t0 = Math.max(SQ.IN * .55, L / 2 - d / 2);
  const [a, b] = dir === 'in' ? [.87, 1] : [1, .88];
  tl.fromTo(ov, { scale: a }, { scale: b, duration: d, ease: 'power2.inOut', immediateRender: true }, t0);
  if (bgw) tl.fromTo(bgw, { scale: 1 - (1 - a) * .4 }, { scale: 1 - (1 - b) * .4, duration: d, ease: 'power2.inOut', immediateRender: true }, t0);
}
// ---------- fundos ----------
function arcosHTML(kind) {
  const s = kind === 'azul' ? SVGT.arcos_azul : SVGT.arcos_branco;
  return s ? `<div class="arcos">${svgClean(s)}</div>` : '';
}
function bgHTML(b) {
  if (!b) return '';
  if (b.solid) {
    const c = { azul: V('s-azul'), branco: '#ffffff', claro: V('s-claro') }[b.solid] || b.solid;
    return `<div class="solid" style="background:${c}"></div>${b.arcos ? arcosHTML(b.arcos) : ''}`;
  }
  if (b.imgs) return `<div class="mosaic">${b.imgs.map(f => `<div style="background-image:url('file://${f}')"></div>`).join('')}</div>`;
  const src = b.clip ? `file://${b.clip}/0001.jpg` : `file://${b.img || b.still}`;
  const pos = `${b.fx != null ? b.fx : 50}% ${b.fy != null ? b.fy : 50}%`;
  return `<div class="bgw"><img ${b.clip ? `data-clip="${b.clip}" data-n="${b.n || 1}" data-off="${b.off || 0}"` : ''} src="${src}" style="object-position:${pos}"></div>` +
    (b.dim ? `<div class="dim" style="opacity:${b.dim}"></div>` : '');
}
function bgMotion(tl, sec, b, L) {
  if (!b) return;
  const arc = sec.querySelector('.arcos');
  if (arc) tl.fromTo(arc, { x: 70, scale: 1.04 }, { x: 0, scale: 1, duration: L, ease: 'none', transformOrigin: '100% 100%' }, 0);
  const img = sec.querySelector('.bgw img');
  if (img && !b.clip) {   // foto parada: assenta (escala -8% em 0,8 s) e segue num push linear leve
    const s0 = b.scale || 1.0;
    tl.fromTo(img, { scale: s0 * 1.08 }, { scale: s0, duration: .8, ease: SNAP }, 0);
    tl.to(img, { scale: s0 * (1 + (b.push != null ? b.push : .04)), duration: Math.max(.1, L - .8), ease: 'none' }, .8);
  } else if (img && b.scale) tl.set(img, { scale: b.scale }, 0);
  const mos = sec.querySelector('.mosaic');
  if (mos) tl.fromTo(mos, { x: -60, y: 40 }, { x: 60, y: -40, duration: L, ease: 'none' }, 0);
}
// ---------- sobreposições ----------
const BLK = { faixa: `background:${V('s-blk')};color:${V('s-blk-t')}`, solto: `color:#fff`, escuro: `color:${V('s-dark')}`, nada: '' };
function groupHTML(sc, inner) {
  const st = BLK[sc.style || 'solto'] || '';
  return `<div class="g ${sc.style === 'faixa' ? 'faixa' : ''}" style="top:${sc.y || 900}px;${st};${sc.gstyle || ''}">${inner}</div>`;
}
function enterRows(tl, g, rows, sc, rel) {
  g.querySelectorAll('.r').forEach((r, i) => {
    const R = rows[i] || {}, at = R.at != null ? rel(R.at) : .15 + i * .12;
    const ws = r.querySelectorAll('.w');
    if ((R.anim || sc.anim || 'words') === 'words' && ws.length) {
      ws.forEach((w, j) => tl.fromTo(w, { y: 46, opacity: 0, filter: 'blur(18px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .65, ease: SNAP, immediateRender: true }, Math.max(0, at) + j * .08));
    } else tl.fromTo(r, { y: 30, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: SNAP, immediateRender: true }, Math.max(0, at));
    if (R.num) {
      const n = r.querySelector('.num'), o = { v: R.num.from || 0 }, fmt = v => Math.round(v).toLocaleString('pt-BR');
      n.textContent = (R.num.prefix || '') + fmt(o.v);
      tl.to(o, { v: R.num.to, duration: R.num.dur || .9, ease: 'power2.out', onUpdate: () => { n.textContent = (R.num.prefix || '') + fmt(o.v); } }, Math.max(0, at));
      tl.call(() => { n.textContent = (R.num.prefix || '') + fmt(R.num.to); }, null, Math.max(0, at) + (R.num.dur || .9) + .01);
      SEQ_SFX.push(['counter', sc.t + Math.max(0, at), sc.t + Math.max(0, at) + (R.num.dur || .9)]);
    }
    const lt = r.closest('.lt');
    if (lt) { const p = tracar(lt, R.tracoColor || V('s-traco')); traceIn(tl, p, Math.max(0, at) + .35, .7); }
    const ro = r.closest('.rot');
    if (ro) { const p = rotular(ro); traceIn(tl, p, Math.max(0, at) + .3, .75); }
  });
}
function enterBlock(tl, g, sc, t) {
  if (sc.box3d) {
    gsap.set(g.parentNode, { perspective: 1400 });
    tl.fromTo(g, { rotationY: -12, rotationX: 6, z: -120, opacity: 0, filter: 'blur(10px)' }, { rotationY: -4, rotationX: 2, z: 0, opacity: 1, filter: 'blur(0px)', duration: .85, ease: SNAP, immediateRender: true }, t);
    tl.to(g, { rotationY: -1, rotationX: 0, z: 20, duration: Math.max(.2, sc._L - t - .85), ease: 'none' }, t + .85);
  } else if (sc.style === 'faixa') {
    tl.fromTo(g, { opacity: 0, scale: .92, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .75, ease: SNAP, immediateRender: true }, t);
  }
}
const OV = {
  txt: {
    html: sc => groupHTML(sc, (sc.icon ? `<div class="ic svgw" style="width:${sc.iw || 150}px;margin:0 auto 18px">${fillSvg(SVGT[sc.icon], '#fff')}</div>` : '') + sc.rows.map(rowHTML).join('')),
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'), t0 = sc.blockAt != null ? rel(sc.blockAt) : sc.rows[0] && sc.rows[0].at != null ? rel(sc.rows[0].at) - .12 : .1;
      enterBlock(tl, g, sc, Math.max(0, t0)); enterRows(tl, g, sc.rows, sc, rel);
      const ic = g.querySelector('.ic');
      if (ic) iconIn(tl, ic, Math.max(0, t0) + .1);
    },
  },
  layers: {   // lâminas empilhando (camadas de proteção) + texto
    html: sc => `<div style="position:absolute;inset:0">${Array.from({ length: sc.n || 6 }, (_, i) => `<div class="lam" style="top:${sc.ly - i * 58}px;background:${[V('s-azul'), V('s-azul2'), V('s-traco')][i % 3]};transform:perspective(900px) rotateX(62deg) rotateZ(-45deg)"></div>`).join('')}</div>` + groupHTML(sc, sc.rows.map(rowHTML).join('')),
    build: (tl, ov, sc, rel) => {
      const lam = ov.querySelectorAll('.lam'), a = rel(sc.layersAt != null ? sc.layersAt : sc.t + .1), span = sc.layersSpan || .9;
      lam.forEach((l, i) => tl.fromTo(l, { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: SNAP, immediateRender: true }, a + i * span / lam.length));
      enterRows(tl, ov.querySelector('.g'), sc.rows, sc, rel);
    },
  },
  selo: {   // selo da marca (círculo em traço + ícone) dentro do bloco azul, com 2 linhas em caixa-alta
    html: sc => groupHTML(Object.assign({ style: 'faixa', gstyle: 'padding:56px 72px' }, sc),
      `<div class="selo"><svg class="ring" viewBox="0 0 300 300"><circle cx="150" cy="150" r="146" fill="none" stroke="#fff" stroke-width="4"/></svg><div class="ic svgw">${fillSvg(SVGT[sc.icon], '#fff')}</div></div>` + sc.rows.map(rowHTML).join('')),
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'), t = rel(sc.at != null ? sc.at : sc.t + .1);
      tl.fromTo(g, { opacity: 0, scale: .92, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .75, ease: SNAP, immediateRender: true }, t);
      const c = g.querySelector('circle'); c.style.transform = 'rotate(-90deg)'; c.style.transformOrigin = '150px 150px';
      traceIn(tl, c, t + .15, .75); iconIn(tl, g.querySelector('.ic'), t + .3);
      enterRows(tl, g, sc.rows, sc, rel);
      SEQ_SFX.push(['icon_pop', sc.t + t + .3]);
    },
  },
  logo: {   // logo peça por peça: o "O" (símbolo) gira e assenta, as letras sobem
    html: sc => groupHTML(Object.assign({ style: 'nada' }, sc), sc.logoFirst ? `<div class="lg svgw" style="width:${sc.lw || 860}px;margin:0 auto ${sc.lgap || 46}px">${svgClean(SVGT[sc.logo || 'logo_w'])}</div>` + (sc.rows || []).map(rowHTML).join('') : (sc.rows || []).map(rowHTML).join('') + `<div class="lg svgw" style="width:${sc.lw || 860}px;margin:${sc.lgap || 46}px auto 0">${svgClean(SVGT[sc.logo || 'logo_w'])}</div>`),
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'); enterRows(tl, g, sc.rows || [], sc, rel);
      logoIn(tl, g.querySelector('.lg svg'), rel(sc.logoAt != null ? sc.logoAt : sc.t + .2));
      SEQ_SFX.push(['brand_reveal', sc.t + rel(sc.logoAt != null ? sc.logoAt : sc.t + .2)]);
    },
  },
  photo: {   // foto em recorte reto (canto vivo) + texto abaixo
    html: sc => groupHTML(Object.assign({ style: 'escuro' }, sc), `<div class="ph" style="width:${sc.pw || 880}px;height:${sc.ph || 640}px;margin:0 auto ${sc.pgap || 56}px;overflow:hidden"><img src="file://${sc.photo}" style="width:100%;height:100%;object-fit:cover;object-position:${sc.pfx || 50}% ${sc.pfy || 40}%"></div>` + sc.rows.map(rowHTML).join('')),
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'), ph = g.querySelector('.ph'), im = ph.querySelector('img'), t = rel(sc.photoAt != null ? sc.photoAt : sc.t + .05);
      tl.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: SNAP, immediateRender: true }, t);
      tl.fromTo(im, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power2.out', immediateRender: true }, t);
      enterRows(tl, g, sc.rows, sc, rel);
    },
  },
  form: {   // card de cadastro (canto vivo) em box 3D sutil, valor digitando
    html: sc => groupHTML(Object.assign({ style: 'nada' }, sc), sc.rows.map(rowHTML).join('')) +
      `<div class="g fg" style="top:${sc.fy || 1000}px"><div class="form" style="border:3px solid ${V('s-cinza')};color:${V('s-dark')}">
        <div style="font-size:56px;font-weight:600;color:${V('s-azul')};margin-bottom:30px">${esc(sc.title)}</div>
        ${sc.fields.map(f => `<div class="fl" style="color:${V('s-azul2')}">${esc(f[0])}</div><div class="fv"><span class="tv" data-v="${esc(f[1] || '')}"></span><span class="ul" style="background:${V('s-cinza')}"></span></div>`).join('')}
        <div class="fb" style="background:${V('s-azul')}">${esc(sc.button)}</div></div></div>`,
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'); enterRows(tl, g, sc.rows, sc, rel);
      const fg = ov.querySelector('.fg'), t = rel(sc.formAt != null ? sc.formAt : sc.t + .2);
      sc.box3d = true; enterBlock(tl, fg, sc, t);
      fg.querySelectorAll('.ul').forEach((u, i) => tl.fromTo(u, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: .5, ease: SNAP, immediateRender: true }, t + .3 + i * .1));
      fg.querySelectorAll('.tv').forEach(tv => {
        const v = tv.dataset.v; if (!v) return; const o = { n: 0 }, ta = rel(sc.typeAt != null ? sc.typeAt : sc.t + .8);
        tl.to(o, { n: v.length, duration: Math.min(.8, v.length * .07), ease: 'none', onUpdate: () => { tv.textContent = v.slice(0, Math.round(o.n)); } }, ta);
        tl.call(() => { tv.textContent = v; }, null, ta + Math.min(.8, v.length * .07) + .01);
        tl.call(() => { tv.textContent = ''; }, null, 0);
        SEQ_SFX.push(['typing', sc.t + ta, sc.t + ta + Math.min(.8, v.length * .07)]);
      });
    },
  },
  split: {   // tela dividida: fundo de cima (bg) e de baixo (bg2), linha da marca na divisória, texto na divisória
    html: sc => groupHTML(Object.assign({ style: 'faixa', y: 960 }, sc), sc.rows.map(rowHTML).join('')),
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'), t0 = sc.rows[0].at != null ? rel(sc.rows[0].at) - .12 : .2;
      enterBlock(tl, g, Object.assign({}, sc, { style: 'faixa' }), Math.max(0, t0)); enterRows(tl, g, sc.rows, sc, rel);
    },
  },
  logoSign: {   // assinatura: logo cresce do zero (LOGO 1,05 s), sobe e encolhe −25% (S-CURVE), lettering com traço em gancho
    html: sc => `<div class="g lgw" style="top:960px"><div class="lg svgw" style="width:${sc.lw || 820}px">${svgClean(SVGT[sc.logo || 'logo_w'])}</div></div>` +
      groupHTML(Object.assign({ style: 'nada', y: sc.ly || 1060 }, sc), `<div style="text-align:left;display:inline-block">${sc.rows.map(rowHTML).join('')}</div>`),
    build: (tl, ov, sc, rel) => {
      const w = ov.querySelector('.lgw'), svg = w.querySelector('svg');
      tl.fromTo(w, { scale: 0, rotation: -6 }, { scale: 1, rotation: 0, duration: 1.05, ease: LOGOE, immediateRender: true }, .05);
      logoIn(tl, svg, .1, true);
      tl.to(w, { top: sc.logoTo || 760, scale: .75, duration: .9, ease: SCURVE }, .95);
      const g = ov.querySelectorAll('.g')[1];
      sc.rows.forEach((r, i) => { if (r.at == null) r.at = sc.t + 1.2 + i * .15; });
      enterRows(tl, g, sc.rows, sc, rel);
      SEQ_SFX.push(['brand_reveal', sc.t + .05]);
    },
  },
  cta: {   // botão (canto vivo) + cursor da marca clicando + texto de apoio linha por linha
    html: sc => `<div class="g" style="top:${sc.y || 880}px"><div class="btn" style="background:${V('s-azul')};color:#fff">${esc(sc.cta)}<svg viewBox="0 0 22 20" width="58" height="52"><path d="M2 10h17M12 3l7 7-7 7"/></svg><span class="shine"></span></div>` +
      `<div style="margin-top:${sc.subGap || 90}px">${sc.rows.map(rowHTML).join('')}</div></div>` +
      `<div class="wave" style="border-color:${V('s-azul')};left:${sc.cx || 790}px;top:${sc.cy || 870}px;opacity:0"></div>` +
      `<svg class="cur" viewBox="-6 -6 64 84" style="left:${sc.cx || 790}px;top:${sc.cy || 870}px"><path d="M0 0 L0 60 L15 46 L26 70 L37 65 L26 42 L46 41 Z" fill="#fff" stroke="${V('s-azul')}"/></svg>`,
    build: (tl, ov, sc, rel) => {
      const g = ov.querySelector('.g'), btn = g.querySelector('.btn'), cur = ov.querySelector('.cur'), wave = ov.querySelector('.wave');
      tl.fromTo(btn, { scale: .85, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: SNAP, immediateRender: true }, .05);
      tl.fromTo(cur, { x: 260, y: 420, rotation: -12, opacity: 0 }, { keyframes: [{ x: 200, y: 160, opacity: 1, duration: .35, ease: 'power2.out' }, { x: 0, y: 0, rotation: 0, duration: .5, ease: SCURVE }], immediateRender: true }, .5);
      const c = sc.clickAt != null ? sc.clickAt : 1.4;
      tl.to(cur, { keyframes: [{ scale: .85, duration: .08 }, { scale: 1, duration: .12 }] }, c);
      tl.to(btn, { keyframes: [{ scale: .95, duration: .1 }, { scale: 1, duration: .15 }] }, c);
      tl.fromTo(wave, { scale: 0, opacity: .55 }, { scale: 1.6, opacity: 0, duration: .5, ease: 'power2.out', immediateRender: true }, c);
      tl.fromTo(btn.querySelector('.shine'), { x: '-120%' }, { x: '120%', duration: .45, ease: 'power2.inOut', immediateRender: true }, c + .02);
      sc.rows.forEach((r, i) => { if (r.at == null) r.at = sc.t + c + .1 + i * .12; r.anim = 'lines'; });
      enterRows(tl, g, sc.rows, sc, rel);
      SEQ_SFX.push(['icon_pop', sc.t + c]);
    },
  },
};
function iconIn(tl, ic, t) {   // ícone de linha da marca: contorno desenhado (trace) e o preenchimento entra depois
  const ps = ic.querySelectorAll('path');
  ps.forEach(p => { p.style.stroke = '#fff'; p.style.strokeWidth = '1.2'; p.style.fillOpacity = 0; traceIn(tl, p, t, .7); tl.to(p, { fillOpacity: 1, duration: .3, ease: 'power1.out' }, t + .55); });
  tl.fromTo(ic, { scale: .7, rotation: -10, filter: 'blur(10px)' }, { scale: 1, rotation: 0, filter: 'blur(0px)', duration: .8, ease: SNAP, immediateRender: true }, t);
}
function logoIn(tl, svg, t, quick) {
  const ps = [...svg.querySelectorAll('path')];
  const sym = ps[0], rest = ps.slice(1).map(p => [p, p.getBBox().x]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
  gsap.set(sym, { transformOrigin: '50% 50%' });
  tl.fromTo(sym, { scale: 0, rotation: -120, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .8, ease: SNAP, immediateRender: true }, t);
  rest.forEach((p, i) => tl.fromTo(p, { y: 40, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .55, ease: SNAP, immediateRender: true }, t + (quick ? .15 : .25) + i * .05));
}
// ---------- máscara da marca (arcos) — uma vez, no clímax ----------
function maskAt(master, tc) {
  const m = document.createElement('div'); m.className = 'mask';
  const cols = [V('s-traco'), V('s-azul'), V('s-azul2'), V('s-azul'), V('s-traco')];
  m.innerHTML = cols.map((c, i) => `<div class="d" style="background:${c};width:3200px;height:3200px;left:${1080 - 1600 + i * 60}px;top:${1920 - 1600 - i * 40}px"></div>`).join('');
  document.getElementById('stage').appendChild(m);
  const ds = m.querySelectorAll('.d');
  master.set(ds, { scale: 0 }, 0);
  master.set(m, { visibility: 'visible' }, tc - .6);
  ds.forEach((d, i) => master.fromTo(d, { scale: 0 }, { scale: 1, duration: .6 - i * .05, ease: 'power3.in', immediateRender: false }, tc - .6 + i * .05));
  master.to(m, { x: -1400, duration: .6, ease: SNAP }, tc + .05);
  master.set(m, { visibility: 'hidden' }, tc + .7);
  SFX.push(['climax', tc]);
}
const SEQ_SFX = [];
function buildSeq(master) {
  const stage = document.getElementById('stage');
  TL.seq.forEach((sc, i) => {
    const L = sc.end - sc.t; sc._L = L;
    const rel = x => x - sc.t;
    const sec = document.createElement('section'); sec.className = 'sq';
    const split = sc.type === 'split';
    const bg = split
      ? `<div class="half" style="top:0">${bgHTML(Object.assign({}, sc.bg)).replace('class="bgw"', 'class="bgw" style="left:0;top:0;width:1080px;height:960px"')}</div><div class="half" style="top:960px">${bgHTML(Object.assign({}, sc.bg2)).replace('class="bgw"', 'class="bgw" style="left:0;top:0;width:1080px;height:960px"')}</div><div class="divl" style="background:${V('s-traco')}"></div>`
      : bgHTML(sc.bg);
    sec.innerHTML = `<div class="cam"><div class="sw">${bg}<div class="ov">${OV[sc.type].html(sc)}</div></div></div>`;
    stage.insertBefore(sec, document.getElementById('caps'));
    sec.querySelectorAll('img[data-clip]').forEach(img => seqClips.push({ img, t: sc.t, end: sc.end, dir: img.dataset.clip, n: +img.dataset.n, off: +img.dataset.off, cur: 1 }));
    const tl = gsap.timeline();
    const prev = TL.seq[i - 1], cin = i === 0 ? null : (prev.cout || 'zin'), cout = sc.cout || (i === TL.seq.length - 1 ? 'end' : 'zin');
    camSeq(tl, sec.querySelector('.cam'), L, cin, cout);
    bgMotion(tl, sec, sc.bg, L);
    if (split) { const dl = sec.querySelector('.divl'); tl.fromTo(dl, { scaleX: 0 }, { scaleX: 1, duration: .7, ease: SNAP, immediateRender: true }, .1); }
    midZoom(tl, sec.querySelector('.ov'), sec.querySelector('.bgw'), L, sc.zoom);
    OV[sc.type].build(tl, sec.querySelector('.ov'), sc, rel);
    if (i > 0 && cin !== 'mask') SFX.push(['scene_cut', sc.t]);
    if (sc.sfx) sc.sfx.forEach(e => SFX.push([e[0], e[1]]));
    tl.set({}, {}, L);
    master.set(sec, { visibility: 'visible' }, sc.t);
    master.add(tl, sc.t);
    master.set(sec, { visibility: 'hidden' }, sc.end);
    if (cout === 'mask') maskAt(master, sc.end);
  });
  SEQ_SFX.forEach(e => SFX.push(e));
}
// troca os quadros dos clipes conforme o tempo; devolve uma promessa que resolve quando os quadros visíveis carregaram
function seqFrames(t) {
  const ps = [];
  for (const c of seqClips) {
    if (t < c.t - .001 || t >= c.end) continue;
    const k = Math.min(c.n, Math.max(1, Math.floor((t - c.t + c.off) * 30 + 1e-4) + 1));
    if (k !== c.cur) { c.cur = k; c.img.src = `file://${c.dir}/${String(k).padStart(4, '0')}.jpg`; ps.push(c.img.decode().catch(() => {})); }
  }
  return ps.length ? Promise.all(ps) : null;
}

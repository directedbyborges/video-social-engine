// Biblioteca de cenas (área de 1080x960). Cores/fontes/raios vêm da marca. Ícones: refs do banco (I()).
// Tempos nos parâmetros já chegam relativos ao início da cena.
const SC = {};

SC.chatLock = {
  html: p => `
  <div class="abs who" style="left:110px;top:190px;display:flex;align-items:center;gap:22px">
    <div style="width:96px;height:96px;border-radius:50%;background:${CY};padding:16px">${I(p.avatar || 'person', NV)}</div>
    <div style="color:${TXT};font-weight:700;font-size:42px;letter-spacing:-.03em">${p.who || 'Você'}</div></div>
  <div class="card bub" style="left:110px;top:330px;width:860px;height:330px;border-bottom-left-radius:10px;padding:0 64px;display:flex;align-items:center">
    <div style="font-family:var(--font-head);font-size:66px;font-weight:700;letter-spacing:-.035em;white-space:nowrap"><span class="tx"></span><span class="cur" style="display:inline-block;width:7px;height:70px;background:${CY};vertical-align:-10px;margin-left:6px"></span></div>
  </div>
  <div class="abs dts" style="left:110px;top:700px;display:flex;gap:16px">${[0,1,2].map(()=>`<i style="display:block;width:26px;height:26px;border-radius:50%;background:${CY}"></i>`).join('')}</div>
  <div class="abs ring" style="left:740px;top:150px;width:240px;height:240px;border-radius:50%;border:6px solid ${CY};opacity:0"></div>
  <div class="abs lk" style="left:740px;top:150px;width:240px;height:240px;border-radius:50%;background:${CY};padding:46px;box-shadow:0 20px 60px ${mix(CY,45)};opacity:0">${I(p.lockIcon || 'lock', NV)}</div>`,
  sfx: p => [['typing', .2, p.typeEnd], ['lock', p.lockAt]],
  build(tl, el, p, L) {
    const tx = el.querySelector('.tx'), cur = el.querySelector('.cur'), bub = el.querySelector('.bub');
    const s = p.text, o = { n: 0 };
    tl.fromTo(bub, { scale: .86, y: 60, filter: 'blur(10px)' }, { scale: 1, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power4.out' }, 0);
    enterBlur(tl, el.querySelector('.who'), .05, { x: -120, y: 0 }, .55);
    tl.to(o, { n: s.length, duration: Math.max(.5, p.typeEnd - .2), ease: 'none', onUpdate: () => { tx.textContent = s.slice(0, Math.round(o.n)); } }, .2);
    for (let t = .2; t < p.lockAt; t += .5) tl.set(cur, { opacity: (Math.round(t * 2) % 2) ? .15 : 1 }, t);
    el.querySelectorAll('.dts i').forEach((d, i) => {
      for (let t = .3 + i * .15; t < p.lockAt; t += .9) tl.fromTo(d, { y: 0 }, { y: -22, duration: .3, ease: 'sine.out', yoyo: true, repeat: 1, immediateRender: false }, t);
    });
    float(tl, bub, .6, p.lockAt, 14, 1.5, 1.2);
    const lk = el.querySelector('.lk');
    tl.fromTo(lk, { scale: 2.4, rotation: -25, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .45, ease: 'expo.out' }, p.lockAt);
    tl.fromTo(el.querySelector('.ring'), { scale: 1, opacity: 1 }, { scale: 1.9, opacity: 0, duration: .7, ease: 'power2.out', immediateRender: false }, p.lockAt + .1);
    shake(tl, bub, p.lockAt + .05, 28);
    tl.to(tx, { opacity: .3, duration: .2 }, p.lockAt);
    tl.set(cur, { opacity: 0 }, p.lockAt);
    tl.to(el.querySelector('.dts'), { opacity: .25, duration: .2 }, p.lockAt);
    tl.to(lk, { rotation: 8, duration: .25, ease: 'sine.inOut', yoyo: true, repeat: 3 }, p.lockAt + .5);
  }
};

SC.checklist = {
  html: p => `
  <div class="card ckc" style="left:130px;top:${480 - (130 + p.items.length * 150) / 2}px;width:820px;padding:44px 60px">
    <div class="ttl" style="font-size:48px;margin-bottom:22px">${p.title || ''}<div class="ul" style="height:8px;width:180px;background:${CY};border-radius:4px;margin-top:10px;transform-origin:0 50%"></div></div>
    ${p.items.map(it => `<div class="row" style="display:flex;align-items:center;gap:34px;height:150px">
      <div style="width:100px;height:100px;border-radius:50%;border:5px solid ${mix(NV,18)};padding:10px;position:relative">
        <div class="cbf" style="position:absolute;inset:-5px;border-radius:50%;background:${CY};transform:scale(0)"></div>
        <div style="position:relative">${ICON.check(NV)}</div></div>
      <div class="ttl lb" style="font-size:62px">${it[0]}</div></div>`).join('')}
  </div>`,
  sfx: p => p.items.map(it => ['check', it[1] + .1]),
  build(tl, el, p, L) {
    const card = el.querySelector('.ckc');
    tl.fromTo(card, { y: 140, rotation: -4, filter: 'blur(14px)' }, { y: 0, rotation: 0, filter: 'blur(0px)', duration: .65, ease: 'power4.out' }, 0);
    tl.fromTo(el.querySelector('.ul'), { scaleX: 0 }, { scaleX: 1, duration: .5, ease: 'expo.out' }, .25);
    el.querySelectorAll('.row').forEach((r, i) => {
      const t = p.items[i][1], lb = r.querySelector('.lb'), ck = r.querySelector('path.ck');
      tl.set(lb, { opacity: .22 }, 0); tl.set(ck, { opacity: 0 }, 0);
      tl.fromTo(lb, { x: -60, opacity: .22, filter: 'blur(8px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'power3.out', immediateRender: false }, t);
      tl.to(r.querySelector('.cbf'), { scale: 1, duration: .4, ease: 'back.out(2)' }, t + .05);
      tl.set(ck, { opacity: 1 }, t + .12); draw(tl, ck, t + .12, .35);
    });
    float(tl, card, .7, L, 14, 1.6, 1.3);
    const last = p.items[p.items.length - 1][1];
    if (L - last > 1.6) focus(tl, el, 540, 480 + 140, 1.15, last + .45, 1.1);
  }
};

SC.orbitChips = {
  html: p => {
    const pos = [[70, 120], [570, 400], [110, 720], [600, 130]];
    return `
  ${p.question ? `<div class="abs q" style="left:0;width:1080px;top:70px;text-align:center;color:${TXT};font-weight:700;font-size:50px;letter-spacing:-.03em">${p.question}</div>` : ''}
  <svg class="abs lines" width="1080" height="960" style="left:0;top:0"></svg>
  <div class="abs r1" style="left:390px;top:330px;width:300px;height:300px;border-radius:50%;border:5px solid ${CY}"></div>
  <div class="abs r2" style="left:390px;top:330px;width:300px;height:300px;border-radius:50%;border:5px solid ${CY}"></div>
  <div class="abs br" style="left:365px;top:305px;width:350px;height:350px">${I(p.center || 'brand:symbol', CY)}</div>
  ${p.chips.map((c, i) => `<div class="chip c${i}" style="left:${pos[i][0]}px;top:${pos[i][1]}px;opacity:0">${c[0]}</div>`).join('')}`;
  },
  sfx: p => p.chips.map(c => ['chip', c[1]]),
  build(tl, el, p, L) {
    const br = el.querySelector('.br');
    tl.fromTo(br, { scale: .6, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out' }, 0);
    const q = el.querySelector('.q'); if (q) enterBlur(tl, q, .1, { y: -50 }, .5);
    rings(tl, [el.querySelector('.r1'), el.querySelector('.r2')], .3, L, 1.2);
    tl.to(br, { rotation: 4, duration: .6, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor(L / .6) - 1) }, .5);
    const svg = el.querySelector('.lines');
    p.chips.forEach((c, i) => {
      const ch = el.querySelector('.c' + i);
      const r = { x: parseFloat(ch.style.left) + ch.offsetWidth / 2, y: parseFloat(ch.style.top) + ch.offsetHeight / 2 };
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      ln.setAttribute('d', `M540 480 L${r.x} ${r.y}`); ln.setAttribute('style', `stroke:${CY}`); ln.setAttribute('stroke-width', '4');
      ln.setAttribute('stroke-dasharray', '10 12'); ln.setAttribute('opacity', '0'); svg.appendChild(ln);
      tl.to(ln, { opacity: .6, duration: .25 }, c[1]);
      pop(tl, ch, c[1], .2);
      tl.fromTo(br, { scale: 1.12 }, { scale: 1, duration: .45, ease: 'power2.out', immediateRender: false }, c[1]);
      float(tl, ch, c[1] + .55, L, 22 + i * 4, i % 2 ? -5 : 5, 1.1 + i * .15);
    });
    if (q) tl.to(q, { opacity: 0, y: -40, duration: .3 }, p.chips[0][1] - .1);
  }
};

// lista de cards (2 ou 3 itens): [icone, texto, t]
SC.pillars = {
  html: p => {
    const n = p.items.length, h = n === 2 ? 300 : 236, gap = n === 2 ? 50 : 34, top = 480 - (n * h + (n - 1) * gap) / 2;
    return p.items.map((it, i) => `
    <div class="abs gh g${i}" style="left:100px;top:${top + i * (h + gap)}px;width:880px;height:${h}px;border-radius:var(--radius);border:4px dashed ${mix(CY,45)}"></div>
    <div class="card pc p${i}" style="left:100px;top:${top + i * (h + gap)}px;width:880px;height:${h}px;display:flex;align-items:center;gap:44px;padding:0 50px;opacity:0">
      <div class="ic" style="flex:none;width:${h * .66}px;height:${h * .66}px;border-radius:50%;background:var(--c2);padding:${h * .13}px;display:flex;align-items:center;justify-content:center">${I(it[0], CY)}</div>
      <div class="ttl" style="font-size:${n === 2 ? 64 : 58}px">${it[1]}</div></div>`).join('');
  },
  sfx: p => p.items.map(it => ['ui_card', it[2]]),
  build(tl, el, p, L) {
    p.items.forEach((it, i) => {
      const g = el.querySelector('.g' + i), c = el.querySelector('.p' + i), t = Math.max(.05, it[2]);
      tl.fromTo(g, { scale: .94, opacity: .6 }, { scale: 1, opacity: 1, duration: .4, ease: 'power3.out' }, .04 * i);
      tl.set(c, { opacity: 1 }, t);
      tl.fromTo(c, { x: i % 2 ? 320 : -320, rotation: i % 2 ? 5 : -5, filter: 'blur(16px)' }, { x: 0, rotation: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out', immediateRender: false }, t);
      tl.to(g, { opacity: 0, duration: .2 }, t + .2);
      tl.fromTo(c.querySelector('.ic'), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: .55, ease: 'back.out(2)', immediateRender: false }, t + .12);
      tl.to(c.querySelector('.ic'), { rotation: 8, duration: .5, ease: 'sine.inOut', yoyo: true, repeat: 3 }, t + .8);
      float(tl, c, t + .7, L, 10, i % 2 ? -1.2 : 1.2, 1.3);
    });
  }
};

// etapas que enchem (semanas, passos): label, times[], unit, diffAt (seta de evolução)
SC.weeks = {
  html: p => `
  <div class="abs hd" style="left:0;top:90px;width:1080px;display:flex;justify-content:center;align-items:center;gap:26px">
    <div style="width:96px;height:96px">${I(p.icon || 'cal', CY)}</div>
    <div class="ttl" style="color:${TXT};font-size:76px">${p.label}</div></div>
  ${p.times.map((t, i) => `<div class="abs wk w${i}" style="left:${540 - p.times.length * 150 + 20 + i * 300}px;top:300px;width:260px;height:300px;border-radius:calc(var(--radius) * .9);border:5px solid ${mix(TXT,35)};overflow:hidden">
     <div class="wf" style="position:absolute;inset:0;background:${CY};transform-origin:50% 100%;transform:scaleY(0)"></div>
     <div class="ttl n" style="position:absolute;left:0;right:0;top:46px;text-align:center;font-size:150px;color:${TXT}">${i + 1}</div>
     <div class="u" style="position:absolute;left:0;right:0;bottom:30px;text-align:center;font-size:36px;font-weight:700;color:${TXT}">${p.unit || 'semana'}</div></div>`).join('')}
  ${p.diffAt != null ? `<svg class="abs" width="1080" height="960" style="left:0;top:0"><path class="ar" d="M150 860 C 400 840, 600 780, 930 660" style="stroke:${CY}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0"/>
    <path class="ah" d="M880 640 L935 658 L905 708" style="stroke:${CY}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></svg>
  <div class="chip ev" style="left:120px;top:690px;font-size:44px;opacity:0">${p.diffLabel || '+ evolução'}</div>` : ''}`,
  sfx: p => p.times.map(t => ['check', t]).concat(p.diffAt != null ? [['chart_up', p.diffAt]] : []),
  build(tl, el, p, L) {
    enterBlur(tl, el.querySelector('.hd'), 0, { y: -80 }, .6);
    p.times.forEach((t, i) => {
      const w = el.querySelector('.w' + i);
      tl.fromTo(w, { y: 140, filter: 'blur(12px)' }, { y: 0, filter: 'blur(0px)', duration: .55, ease: 'power4.out' }, .05 * i);
      tl.to(w.querySelector('.wf'), { scaleY: 1, duration: .45, ease: 'power3.out' }, t);
      tl.to(w.querySelectorAll('.n,.u'), { color: NV, duration: .2 }, t + .1);
      tl.to(w, { borderColor: CY, duration: .2 }, t);
      tl.fromTo(w, { scale: 1.12 }, { scale: 1, duration: .45, ease: 'back.out(2)', immediateRender: false }, t);
      float(tl, w, t + .5, L, 12, 0, 1.1 + i * .1);
    });
    if (p.diffAt != null) {
      const ar = el.querySelector('.ar');
      tl.set([ar, el.querySelector('.ah')], { opacity: 1 }, p.diffAt);
      draw(tl, ar, p.diffAt, .7, 'power2.inOut');
      tl.fromTo(el.querySelector('.ah'), { scale: 0, transformOrigin: '935px 658px' }, { scale: 1, duration: .35, ease: 'back.out(2)' }, p.diffAt + .6);
      pop(tl, el.querySelector('.ev'), p.diffAt + .3, .3);
    }
  }
};

// selo/garantia: ícone + carimbo com texto e moedas
SC.shield = {
  html: p => `
  <div class="abs gl glow" style="opacity:0"></div>
  ${p.pre ? `<div class="abs pre ttl" style="left:0;width:1080px;top:80px;text-align:center;color:${TXT};font-size:64px;opacity:0">${p.pre}</div>` : ''}
  <div class="abs sh" style="left:360px;top:${p.pre ? 190 : 130}px;width:360px;height:360px">${p.icon ? I(p.icon, CY) : ICON.shield(CY)}</div>
  ${(p.coins === false ? [] : [[150, 260], [860, 220], [120, 560], [880, 520], [250, 120]]).map((c, i) => `<div class="abs coin k${i}" style="left:${c[0]}px;top:${c[1]}px;width:${90 - i * 6}px;height:${90 - i * 6}px;border-radius:50%;background:${CY};color:${NV};font-weight:800;font-size:${50 - i * 4}px;display:flex;align-items:center;justify-content:center;opacity:0;box-shadow:0 10px 30px ${mix(CY,40)}">${p.coin || '$'}</div>`).join('')}
  <div class="card st" style="left:120px;top:${p.pre ? 620 : 590}px;width:840px;height:170px;display:flex;align-items:center;justify-content:center;opacity:0">
    <div class="ttl" style="font-size:${p.text.length > 18 ? 62 : 70}px">${p.text}</div></div>`,
  sfx: p => [['stamp', p.at]].concat(p.coins === false ? [] : [['icon_pop', p.at + .15]]),
  build(tl, el, p, L) {
    const sh = el.querySelector('.sh');
    tl.fromTo(sh, { scale: .6, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out' }, 0);
    const sp = sh.querySelector('path.sh'), ck = sh.querySelector('path.ck');
    if (sp) draw(tl, sp, 0, .8, 'power2.inOut');
    if (ck) { tl.set(ck, { opacity: 0 }, 0); tl.set(ck, { opacity: 1 }, .55); draw(tl, ck, .55, .4); }
    float(tl, sh, .8, L, 14, 2, 1.2);
    const pre = el.querySelector('.pre');
    if (pre) { tl.set(pre, { opacity: 0 }, 0); tl.fromTo(pre, { y: 50, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .5, ease: 'power3.out', immediateRender: false }, p.preAt); }
    const st = el.querySelector('.st');
    tl.set(st, { opacity: 1 }, p.at);
    tl.fromTo(st, { scale: 1.7, rotation: -9, filter: 'blur(10px)' }, { scale: 1, rotation: -3, filter: 'blur(0px)', duration: .45, ease: 'expo.out', immediateRender: false }, p.at);
    shake(tl, sh, p.at + .1, 14);
    const gl = el.querySelector('.gl');
    tl.fromTo(gl, { opacity: 0, scale: .5, y: 260 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'expo.out', immediateRender: false }, p.at);
    el.querySelectorAll('.coin').forEach((c, i) => { pop(tl, c, p.at + .1 + i * .06, 0, 'back.out(2.2)', .5); float(tl, c, p.at + .6, L, 26, i % 2 ? 14 : -14, 1 + i * .12); });
  }
};

// gráfico que sobe e bate num teto
SC.careerCeiling = {
  html: p => `
  <svg class="abs" width="1080" height="960" style="left:0;top:0">
    <path d="M130 120 V820 H970" style="stroke:${mix(TXT,35)}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path class="ln" d="M150 800 C 260 760, 330 640, 420 560 S 560 420, 600 372 L 960 372" style="stroke:${CY}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <div class="abs lbl" style="left:150px;top:96px;color:${TXT};font-size:40px;font-weight:700;letter-spacing:-.02em">${p.label || 'Carreira'}</div>
  <div class="abs dot" style="left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:${TXT};box-shadow:0 0 0 12px ${mix(CY,35)}"></div>
  <div class="abs hit" style="left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:6px solid ${TXT};opacity:0"></div>
  <div class="abs ceil" style="left:180px;top:250px;width:800px;height:96px;border-radius:calc(var(--radius) * .6);background:${CY};color:${NV};display:flex;align-items:center;justify-content:center;gap:24px;font-family:var(--font-head);font-weight:800;font-size:56px;letter-spacing:.02em;box-shadow:0 20px 50px ${mix(CY,35)};opacity:0">
    <div style="width:64px;height:64px">${I(p.ceilIcon || 'lock', NV)}</div>${p.ceiling || 'INGLÊS'}</div>`,
  sfx: p => [['hook_word', p.ceilingAt], ['lock', p.flatAt]],
  build(tl, el, p, L) {
    const ln = el.querySelector('.ln'), dot = el.querySelector('.dot'), len = ln.getTotalLength();
    const prog = { v: 0 };
    const up = () => { const pt = ln.getPointAtLength(prog.v * len); dot.style.left = pt.x + 'px'; dot.style.top = pt.y + 'px'; ln.style.strokeDashoffset = len * (1 - prog.v); };
    ln.style.strokeDasharray = len;
    let f = 0; for (let s = 0; s <= 1; s += .005) { if (ln.getPointAtLength(s * len).y <= 373) { f = s; break; } }
    tl.fromTo(prog, { v: .02 }, { v: f, duration: p.flatAt, ease: 'power1.in', onUpdate: up, immediateRender: true, onStart: up }, 0);
    tl.to(prog, { v: 1, duration: Math.max(.3, L - p.flatAt), ease: 'power1.out', onUpdate: up }, p.flatAt);
    enterBlur(tl, el.querySelector('.lbl'), 0, { y: -40 }, .5);
    const c = el.querySelector('.ceil');
    tl.set(c, { opacity: 1 }, p.ceilingAt);
    tl.fromTo(c, { y: -380, rotation: -3 }, { y: 0, rotation: 0, duration: .5, ease: 'bounce.out', immediateRender: false }, p.ceilingAt);
    const hit = el.querySelector('.hit'), hp = ln.getPointAtLength(f * len);
    hit.style.left = hp.x + 'px'; hit.style.top = hp.y + 'px';
    tl.fromTo(hit, { scale: .3, opacity: 1 }, { scale: 1.6, opacity: 0, duration: .6, ease: 'power2.out' }, p.flatAt);
    shake(tl, c, p.flatAt, 16);
    tl.to(c, { y: 10, duration: .7, ease: 'sine.inOut', yoyo: true, repeat: 3 }, p.flatAt + .5);
  }
};

SC.meeting = {
  html: p => {
    const P = p.people || [['JS', 'John'], ['SA', 'Sarah'], ['MK', 'Mike']];
    const all = P.concat([['', p.me || 'Você']]);
    return all.map((q, i) => `<div class="abs tile t${i}" style="left:${85 + (i % 2) * 470}px;top:${95 + Math.floor(i / 2) * 400}px;width:440px;height:370px;border-radius:30px;background:${BG2};${i === 3 ? `border:6px solid ${CY};` : 'border:6px solid transparent;'}overflow:hidden">
      <div class="av" style="position:absolute;left:135px;top:70px;width:170px;height:170px;border-radius:50%;background:${i === 3 ? CY : mix(TXT, 14)};color:${i === 3 ? NV : TXT};font-size:64px;font-weight:800;display:flex;align-items:center;justify-content:center;${i === 3 ? 'padding:30px' : ''}">${i === 3 ? I('person', NV) : q[0]}</div>
      <div style="position:absolute;left:24px;bottom:20px;color:${TXT};font-size:34px;font-weight:700">${q[1]}</div>
      <div class="wv" style="position:absolute;right:26px;bottom:26px;display:flex;gap:7px;align-items:center;height:56px">${[0,1,2,3,4].map(() => `<i style="display:block;width:10px;height:10px;border-radius:5px;background:${i === 3 ? CY : TXT}"></i>`).join('')}</div>
      ${i === 3 ? `<div class="mo" style="position:absolute;left:24px;top:22px;width:80px;height:80px;border-radius:50%;background:${PAPER};padding:14px;opacity:0">${ICON.micoff(NV)}</div>
      <div class="dd" style="position:absolute;left:300px;top:40px;background:${PAPER};border-radius:30px;padding:6px 22px;font-size:52px;font-weight:800;color:${NV};line-height:1;opacity:0">...</div>` : ''}
    </div>`).join('');
  },
  sfx: p => [['lock', p.travaAt]],
  build(tl, el, p, L) {
    const tiles = [...el.querySelectorAll('.tile')];
    tiles.forEach((t, i) => tl.fromTo(t, { scale: .7, filter: 'blur(12px)', y: 60 }, { scale: 1, filter: 'blur(0px)', y: 0, duration: .55, ease: 'power4.out' }, i * .06));
    const bars = tiles.map(t => [...t.querySelectorAll('.wv i')]);
    const clk = { t: 0 }, spk = t => Math.floor(t / 1.1) % 3;
    tl.to(clk, { t: L, duration: L, ease: 'none', onUpdate: () => {
      const t = clk.t;
      bars.forEach((bs, i) => bs.forEach((b, k) => {
        const a = i < 3 ? (spk(t) === i ? 1 : .12) : (t < p.travaAt ? (t > .6 ? .55 : 0) : 0);
        b.style.height = (10 + a * 44 * Math.abs(Math.sin(t * (7 + k * 1.7) + k * 1.3 + i))) + 'px';
      }));
      tiles.forEach((tt, i) => { if (i < 3) tt.style.borderColor = spk(t) === i ? mix(TXT, 85) : 'transparent'; });
    } }, 0);
    const me = tiles[3];
    tl.fromTo(me.querySelector('.mo'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)' }, p.travaAt);
    tl.fromTo(me.querySelector('.dd'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)' }, p.travaAt + .15);
    tl.to(me.querySelector('.av'), { opacity: .45, duration: .3 }, p.travaAt);
    shake(tl, me, p.travaAt + .05, 18);
    focus(tl, el, 555 + 220, 495 + 185, 1.45, p.travaAt + .35, 1.1);
    tl.to(me, { rotation: 1.5, duration: .6, ease: 'sine.inOut', yoyo: true, repeat: 3 }, p.travaAt + .6);
  }
};

// cards em leque riscados (ex.: "mais um curso")
SC.coursesCross = {
  html: p => {
    const lv = p.levels || ['Básico', 'Intermediário', 'Avançado'];
    const card = (i, x, r) => `<div class="card cc c${i}" style="left:${x}px;top:200px;width:380px;height:520px;padding:44px 36px;transform:rotate(${r}deg)">
      <div style="width:110px;height:110px">${I(p.icon || 'book', NV)}</div>
      <div class="ttl" style="font-size:56px;margin-top:26px">${p.title || 'Curso de inglês'}</div>
      <div style="display:inline-block;margin-top:26px;background:${CY};border-radius:var(--pill-radius);padding:8px 26px;font-size:32px;font-weight:700">${lv[i] || ''}</div></div>`;
    return card(0, 150, -12) + card(1, 350, 0) + card(2, 550, 12) +
      `<div class="card cc plus" style="left:350px;top:230px;width:380px;height:520px;background:${CY};display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0">
        <div class="ttl" style="font-size:150px">${p.plus || '+1'}</div><div class="ttl" style="font-size:56px">${p.plusLabel || 'curso'}</div></div>
       <svg class="abs xx" width="1080" height="960" style="left:0;top:0"><path class="x1" d="M260 190 L820 770" style="stroke:${CY}" stroke-width="44" stroke-linecap="round" fill="none" opacity="0"/><path class="x2" d="M820 190 L260 770" style="stroke:${CY}" stroke-width="44" stroke-linecap="round" fill="none" opacity="0"/></svg>`;
  },
  sfx: p => [['pill', p.plusAt], ['stamp', p.crossAt]],
  build(tl, el, p, L) {
    [0, 1, 2].forEach(i => {
      const c = el.querySelector('.c' + i);
      tl.fromTo(c, { y: 380, filter: 'blur(14px)' }, { y: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, i * .12);
      float(tl, c, .8, p.crossAt, 12, i - 1, 1.2 + i * .1);
    });
    const pl = el.querySelector('.plus');
    tl.set(pl, { opacity: 1 }, p.plusAt);
    tl.fromTo(pl, { x: 700, rotation: 30 }, { x: 0, rotation: -4, duration: .55, ease: 'power4.out', immediateRender: false }, p.plusAt);
    const x1 = el.querySelector('.x1'), x2 = el.querySelector('.x2');
    tl.set([x1, x2], { opacity: 1 }, p.crossAt);
    draw(tl, x1, p.crossAt, .28, 'power3.in'); draw(tl, x2, p.crossAt + .22, .28, 'power3.in');
    tl.to(el.querySelectorAll('.cc'), { filter: 'brightness(.5)', y: '+=40', duration: .5, ease: 'power2.out' }, p.crossAt + .2);
    shake(tl, el.querySelector('.xx'), p.crossAt + .5, 14);
  }
};

SC.bookQuestion = {
  html: p => `
  <div class="card bk" style="left:200px;top:170px;width:420px;height:560px;overflow:hidden;transform:rotate(-6deg)">
    <div style="height:150px;background:var(--c2);border-bottom:10px solid ${CY};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:800;font-size:54px;letter-spacing:.08em">${p.title || 'ENGLISH'}</div>
    <div class="ttl" style="text-align:center;font-size:220px;margin-top:40px">${p.glyph || 'Aa'}</div></div>
  <div class="abs qm ttl" style="left:600px;top:110px;width:330px;height:600px;color:${CY};font-size:560px;font-weight:900;line-height:600px;text-align:center;opacity:0;text-shadow:0 20px 60px ${mix(CY,35)}">?</div>`,
  sfx: p => [['icon_pop', p.qAt]],
  build(tl, el, p, L) {
    const bk = el.querySelector('.bk');
    tl.fromTo(bk, { y: -260, rotation: -16, filter: 'blur(14px)' }, { y: 0, rotation: -6, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, 0);
    tl.to(bk, { x: -60, rotation: -10, duration: .5, ease: 'power3.out' }, p.qAt);
    const q = el.querySelector('.qm');
    tl.fromTo(q, { scale: 0, rotation: 40, opacity: 0 }, { scale: 1, rotation: 8, opacity: 1, duration: .6, ease: 'back.out(1.8)' }, p.qAt);
    tl.to(q, { rotation: -6, duration: .5, ease: 'sine.inOut', yoyo: true, repeat: 3 }, p.qAt + .6);
    float(tl, bk, .7, L, 14, 2, 1.2);
  }
};

// dois cards: um ok, outro travado
SC.listenSpeak = {
  html: p => [[p.leftIcon || 'ear', p.left || 'Ouvir'], [p.rightIcon || 'talk', p.right || 'Falar']].map((c, i) => `
  <div class="card ls l${i}" style="left:${90 + i * 470}px;top:170px;width:430px;height:600px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
    <div class="ic" style="width:250px;height:250px;border-radius:50%;background:var(--c2);padding:50px">${I(c[0], CY)}</div>
    <div class="ttl" style="font-size:76px">${c[1]}</div>
    <div class="bd" style="position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:${CY};padding:${i ? 30 : 22}px;opacity:0;box-shadow:0 14px 40px ${mix(CY,45)}">${i ? ICON.lock(NV) : ICON.check(NV)}</div>
  </div>`).join(''),
  sfx: p => [['check', p.okAt], ['lock', p.lockAt]],
  build(tl, el, p, L) {
    const a = el.querySelector('.l0'), b = el.querySelector('.l1');
    tl.fromTo(a, { x: -260, rotation: -6, filter: 'blur(14px)' }, { x: 0, rotation: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, 0);
    tl.fromTo(b, { x: 260, rotation: 6, filter: 'blur(14px)' }, { x: 0, rotation: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, .08);
    float(tl, a, .7, L, 12, 1.2, 1.2); float(tl, b, .7, p.lockAt, 12, -1.2, 1.3);
    pop(tl, a.querySelector('.bd'), p.okAt, 0, 'back.out(2.2)');
    tl.fromTo(a.querySelector('.ic'), { scale: 1.15 }, { scale: 1, duration: .4, ease: 'power2.out', immediateRender: false }, p.okAt);
    pop(tl, b.querySelector('.bd'), p.lockAt, 2.2, 'expo.out', .45);
    shake(tl, b, p.lockAt + .05, 22);
    tl.to(b.querySelector('.ic'), { opacity: .35, duration: .25 }, p.lockAt);
    if (L - p.lockAt > 1.4) focus(tl, el, 775, 470, 1.3, p.lockAt + .4, 1.1);
  }
};

SC.logoReveal = {
  html: p => `
  <div class="abs gl glow"></div>
  <div class="abs lg" style="left:150px;top:230px;width:780px;height:300px">${I('brand:logo')}</div>
  ${p.tag ? `<div class="chip tg" style="left:540px;top:640px;font-size:46px;transform:translateX(-50%);opacity:0">${p.tag}</div>` : ''}`,
  sfx: p => [['brand_reveal', 0]].concat(p.tag ? [['pill', p.tagAt]] : []),
  build(tl, el, p, L) {
    const gl = el.querySelector('.gl'), lg = el.querySelector('.lg');
    tl.fromTo(gl, { opacity: 0, scale: .5, y: 260 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0);
    tl.fromTo(gl, { x: -200 }, { x: 200, duration: L, ease: 'sine.inOut' }, 0);
    tl.fromTo(lg, { scale: .82, y: 60, filter: 'blur(18px)' }, { scale: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, 0);
    tl.to(lg, { scale: 1.05, duration: L, ease: 'none' }, .8);
    const tg = el.querySelector('.tg');
    if (tg) { tl.set(tg, { opacity: 1 }, p.tagAt); tl.fromTo(tg, { scaleX: 0, xPercent: -50, filter: 'blur(10px)' }, { scaleX: 1, xPercent: -50, filter: 'blur(0px)', duration: .5, ease: 'expo.out', immediateRender: false }, p.tagAt); }
  }
};

SC.unlock = {
  html: p => `
  ${p.top ? `<div class="chipO tp" style="left:540px;top:70px;transform:translateX(-50%);opacity:0">${p.top}</div>` : ''}
  <div class="abs r1" style="left:340px;top:250px;width:400px;height:400px;border-radius:50%;border:6px solid ${CY};opacity:0"></div>
  <div class="abs lkw" style="left:360px;top:${p.top ? 250 : 220}px;width:360px;height:360px">
    <svg viewBox="0 0 100 100" class="ico" style="stroke:${CY}" stroke-width="6" width="360" height="360">
      <g class="shk"><path d="M32 46V31a18 18 0 0 1 36 0v15"/></g>
      <rect x="18" y="46" width="64" height="46" rx="11" style="fill:var(--bg2)"/><circle cx="50" cy="64" r="5" style="fill:${CY}" stroke="none"/><path d="M50 66v12"/></svg></div>
  ${(p.chips || []).map((c, i) => `<div class="chip c${i}" style="left:${i ? 600 : 80}px;top:${i ? 700 : 660}px;opacity:0">${c[0]}</div>`).join('')}`,
  sfx: p => [['lock', p.openAt]].concat((p.chips || []).map(c => ['chip', c[1]])).concat(p.top ? [['pill', p.topAt]] : []),
  build(tl, el, p, L) {
    const w = el.querySelector('.lkw'), shk = el.querySelector('.shk');
    tl.fromTo(w, { scale: .6, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out' }, 0);
    for (let t = .9; t < p.openAt - .4; t += 1.1) tl.to(w, { keyframes: { rotation: [-6, 6, -4, 3, 0] }, duration: .45, ease: 'none' }, t);
    const tp = el.querySelector('.tp');
    if (tp) { tl.set(tp, { opacity: 1 }, p.topAt); tl.fromTo(tp, { y: -60, xPercent: -50, filter: 'blur(10px)' }, { y: 0, xPercent: -50, filter: 'blur(0px)', duration: .5, ease: 'power3.out', immediateRender: false }, p.topAt); }
    tl.to(shk, { y: -14, rotation: -28, svgOrigin: '68 46', duration: .5, ease: 'back.out(2.5)' }, p.openAt);
    tl.fromTo(w, { scale: 1.15 }, { scale: 1, duration: .5, ease: 'power2.out', immediateRender: false }, p.openAt);
    tl.fromTo(el.querySelector('.r1'), { scale: .8, opacity: 1 }, { scale: 1.8, opacity: 0, duration: .8, ease: 'power2.out' }, p.openAt + .05);
    float(tl, w, p.openAt + .6, L, 16, 3, 1.2);
    (p.chips || []).forEach((c, i) => { pop(tl, el.querySelector('.c' + i), c[1], .2); float(tl, el.querySelector('.c' + i), c[1] + .55, L, 20, i ? -5 : 5, 1.1 + i * .2); });
  }
};

// ---------- novas cenas genéricas ----------
// texto grande cinético: lines = [["texto com *destaque*", t], ...]
SC.bigType = {
  html: p => `<div class="abs bt" style="left:70px;right:70px;top:0;height:960px;display:flex;flex-direction:column;justify-content:center;align-items:${p.align || 'center'};gap:6px">
    ${p.lines.map((l, i) => `<div class="btl l${i}" style="font-family:var(--font-head);font-weight:var(--big-weight);letter-spacing:var(--big-track);text-transform:var(--big-case);line-height:1.0;color:${TXT};font-size:${l[2] || (i === 0 ? 120 : 96)}px;text-align:${p.align || 'center'}">
      ${l[0].split(' ').map(w => { const k = /^\*.*\*$/.test(w); return `<span class="w" style="display:inline-block;margin-right:.22em;${k ? `color:${CY}` : ''}">${w.replace(/\*/g, '')}</span>`; }).join('')}</div>`).join('')}</div>`,
  sfx: p => p.lines.map(l => ['big_word', l[1]]),
  build(tl, el, p, L) {
    p.lines.forEach((l, i) => {
      const ws = el.querySelectorAll(`.l${i} .w`);
      tl.set(ws, { opacity: 0 }, 0);
      tl.fromTo(ws, { y: 60, scale: 1.3, opacity: 0, filter: 'blur(16px)' }, { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'power3.out', stagger: .07, immediateRender: false }, Math.max(.02, l[1]));
    });
    tl.to(el.querySelector('.bt'), { scale: 1.05, duration: L, ease: 'none' }, 0);
  }
};

// ícone herói (3D ou linha) + título + sub
SC.iconHero = {
  html: p => `
  <div class="abs gl glow" style="opacity:.0"></div>
  <div class="abs ih" style="left:330px;top:${p.sub ? 90 : 130}px;width:420px;height:420px">${I(p.icon, CY)}</div>
  <div class="abs t ttl" style="left:60px;right:60px;top:${p.sub ? 560 : 610}px;text-align:center;color:${TXT};font-size:${p.title.length > 22 ? 70 : 88}px">${p.title}</div>
  ${p.sub ? `<div class="abs s" style="left:80px;right:80px;top:690px;text-align:center;color:${mix(TXT,80)};font-size:48px;font-weight:600;letter-spacing:-.02em">${p.sub}</div>` : ''}`,
  sfx: p => [['icon_pop', p.at || 0]],
  build(tl, el, p, L) {
    const ih = el.querySelector('.ih'), at = p.at || 0;
    tl.fromTo(ih, { scale: .4, rotation: -14, y: 80, filter: 'blur(14px)' }, { scale: 1, rotation: 0, y: 0, filter: 'blur(0px)', duration: .7, ease: 'back.out(1.6)' }, at);
    float(tl, ih, at + .7, L, 22, 4, 1.3);
    tl.fromTo(el.querySelector('.gl'), { opacity: 0, y: 200 }, { opacity: .8, y: 0, duration: 1, ease: 'expo.out' }, at);
    enterBlur(tl, el.querySelector('.t'), (p.titleAt != null ? p.titleAt : at + .2), { y: 70, opacity: 0 }, .55);
    const s = el.querySelector('.s'); if (s) enterBlur(tl, s, (p.subAt != null ? p.subAt : at + .5), { y: 50, opacity: 0 }, .5);
  }
};

// número contando + rótulo
SC.stat = {
  html: p => `
  <div class="abs nm ttl" style="left:0;right:0;top:250px;text-align:center;color:${CY};font-size:${p.size || 200}px;letter-spacing:-.05em">${p.prefix || ''}0${p.suffix || ''}</div>
  <div class="abs lb ttl" style="left:80px;right:80px;top:540px;text-align:center;color:${TXT};font-size:64px">${p.label || ''}</div>`,
  sfx: p => [['counter', p.at || 0]],
  build(tl, el, p, L) {
    const nm = el.querySelector('.nm'), o = { v: p.from || 0 }, at = p.at || 0;
    const fmt = v => (p.prefix || '') + Math.round(v).toLocaleString('pt-BR') + (p.suffix || '');
    nm.textContent = fmt(o.v);
    tl.fromTo(nm, { scale: .6, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: .5, ease: 'expo.out' }, at);
    tl.to(o, { v: p.to, duration: p.dur || 1.2, ease: 'power2.out', onUpdate: () => { nm.textContent = fmt(o.v); } }, at);
    tl.fromTo(nm, { scale: 1.08 }, { scale: 1, duration: .4, ease: 'back.out(2)', immediateRender: false }, at + (p.dur || 1.2));
    enterBlur(tl, el.querySelector('.lb'), (p.labelAt != null ? p.labelAt : at + .3), { y: 50, opacity: 0 }, .5);
  }
};

// comparação: esquerda perde, direita ganha
SC.compare = {
  html: p => [p.left, p.right].map((c, i) => `
  <div class="card cp c${i}" style="left:${90 + i * 470}px;top:180px;width:430px;height:580px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;${i ? '' : ''}">
    <div class="ic" style="width:230px;height:230px">${I(c[0], i ? CY : NV)}</div>
    <div class="ttl" style="font-size:58px;text-align:center;padding:0 20px">${c[1]}</div></div>`).join('') +
  `<svg class="abs" width="1080" height="960" style="left:0;top:0"><path class="x" d="M150 260 L470 700 M470 260 L150 700" style="stroke:var(--c1)" stroke-width="30" stroke-linecap="round" fill="none" opacity="0"/></svg>`,
  sfx: p => [['stamp', p.loseAt], ['check', p.winAt]],
  build(tl, el, p, L) {
    const a = el.querySelector('.c0'), b = el.querySelector('.c1');
    tl.fromTo(a, { x: -300, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, 0);
    tl.fromTo(b, { x: 300, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, .1);
    const x = el.querySelector('.x'); tl.set(x, { opacity: 1 }, p.loseAt); draw(tl, x, p.loseAt, .35, 'power3.in');
    tl.to(a, { filter: 'brightness(.55)', y: 30, duration: .4 }, p.loseAt + .2);
    tl.to(b, { scale: 1.08, duration: .45, ease: 'back.out(2)' }, p.winAt);
    tl.to(b, { boxShadow: `0 0 0 10px ${CY}, 0 30px 80px rgba(0,0,0,.4)`, duration: .3 }, p.winAt);
    float(tl, b, p.winAt + .5, L, 14, 1.5, 1.2);
  }
};

// card final: logo + CTA
SC.endCard = {
  html: p => `
  <div class="abs gl glow"></div>
  <div class="abs lg" style="left:190px;top:200px;width:700px;height:260px">${I('brand:logo')}</div>
  <div class="chip cta" style="left:540px;top:560px;transform:translateX(-50%);font-size:52px;opacity:0">${p.cta || 'Clique no botão abaixo'}</div>
  ${p.sub ? `<div class="abs sub" style="left:0;right:0;top:700px;text-align:center;color:${TXT};font-size:40px;font-weight:600;opacity:0">${p.sub}</div>` : ''}`,
  sfx: p => [['brand_reveal', 0], ['pill', .6]],
  build(tl, el, p, L) {
    tl.fromTo(el.querySelector('.gl'), { opacity: 0, y: 260 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0);
    tl.fromTo(el.querySelector('.lg'), { scale: .8, filter: 'blur(18px)' }, { scale: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, 0);
    const c = el.querySelector('.cta'); tl.set(c, { opacity: 1 }, .6);
    tl.fromTo(c, { scale: 0, xPercent: -50 }, { scale: 1, xPercent: -50, duration: .5, ease: 'back.out(2)', immediateRender: false }, .6);
    tl.to(c, { scale: 1.06, duration: .5, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor((L - 1.2) / .5)) }, 1.2);
    const s = el.querySelector('.sub'); if (s) enterBlur(tl, s, .9, { y: 40, opacity: 0 }, .5);
  }
};

// ================= Cenas de marca (área 1080x960, centro 540,480 = centro da tela com panel.scale 1) =================
// Texto com *destaque* vira Bold (contraste Regular x Bold). Cores: var(--c2) azul da marca, var(--apoio) traço.
const KB = s => String(s).replace(/\*(.+?)\*/g, '<b>$1</b>');
const APOIO = 'var(--apoio,#617DAE)';
const SCURVE = 'power4.inOut';
// ícones de linha no estilo da marca (traço ~3 em 100)
const BRAND_ICON = {
  gota: c => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 12C50 12 22 46 22 64a28 28 0 0 0 56 0C78 46 50 12 50 12Z" fill="none" stroke="${c}" stroke-width="3.4" stroke-linejoin="round"/><path d="M36 66a14 14 0 0 0 12 13" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></svg>`,
  sol: c => `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="17" fill="none" stroke="${c}" stroke-width="3.4"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(a => { const r = a * Math.PI / 4, co = Math.cos(r), si = Math.sin(r); return `<line x1="${50 + 27 * co}" y1="${50 + 27 * si}" x2="${50 + 38 * co}" y2="${50 + 38 * si}" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`; }).join('')}</svg>`,
  camadas: c => (SVGT.camadas || '').replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${c}"`).replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"'),
};
const BI = (k, c) => BRAND_ICON[k] ? BRAND_ICON[k](c) : I(k, c);
function tracePath(kind, w, h, r = 24) {
  if (kind === 'gancho') return `M0 62 L${w + 4} 62 C${w + 42} 62 ${w + 56} 44 ${w + 56} 10`;
  if (kind === 'onda') return `M0 24 C${w * .3} 6 ${w * .55} 38 ${w} 12`;
  if (kind === 'sublinhado') return `M0 ${h + 8} L${w + 10 - r} ${h + 8} Q${w + 10} ${h + 8} ${w + 10} ${h + 8 - r} L${w + 10} ${h * .1}`;
  if (kind === 'colchete') return `M-6 ${h + 4} L-6 ${r - 6} Q-6 -6 ${r - 6} -6 L${w * .45} -6 M${w * .62} ${h + 8} L${w + 10 - r} ${h + 8} Q${w + 10} ${h + 8} ${w + 10} ${h + 8 - r} L${w + 10} ${h * .45}`;
  return '';
}
function rise(tl, el, t, d = .6, y = 40) { tl.fromTo(el, { y, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: d, ease: 'expo.out', immediateRender: false }, t); tl.set(el, { opacity: 0 }, 0); }

// Box 3D sutil: lines [["texto *destaque*", t, px]], theme 'azul' | 'branco', y = centro
SC.box3d = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 440}px;display:flex;justify-content:center;perspective:1400px;transform:translateY(-50%)">
    <div class="bx3" style="padding:${p.pad || '56px 64px 64px'};text-align:center;letter-spacing:-.03em;background:${p.theme === 'branco' ? '#fff' : 'var(--c2)'};color:${p.theme === 'branco' ? 'var(--c2)' : '#fff'};max-width:900px">
    ${p.lines.map(l => `<div class="r" style="font-size:${l[2] || 72}px;line-height:1.02;font-weight:400;white-space:nowrap">${KB(l[0])}</div>`).join('')}</div></div>`,
  sfx: p => [['ui_card', 0]],
  build(tl, el, p, L) {
    const bx = el.querySelector('.bx3');
    tl.fromTo(bx, { rotationY: 12, rotationX: -6, z: -120, opacity: 0, filter: 'blur(10px)' }, { rotationY: 4, rotationX: -2, z: 0, opacity: 1, filter: 'blur(0px)', duration: .85, ease: 'expo.out' }, 0);
    tl.to(bx, { rotationY: 1, rotationX: 0, z: 20, duration: Math.max(.1, L - .85), ease: 'none' }, .85);
    el.querySelectorAll('.r').forEach((r, i) => rise(tl, r, Math.max(p.lines[i][1] || 0, .12 + i * .12), .6, 40));
    el.querySelectorAll('.r b').forEach(b => b.style.fontWeight = 800);
  }
};

// Lettering de produto: sobretítulo + palavra gigante + traço da marca + apoio
SC.lettering = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 430}px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;color:${p.color || '#fff'}">
    ${p.sobre ? `<div class="so" style="font-size:40px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">${p.sobre}</div>` : ''}
    <div class="bgw" style="position:relative"><div class="bg" style="font-size:${p.size || 320}px;font-weight:800;letter-spacing:-.04em;line-height:.92">${p.big}</div><svg class="trs" style="position:absolute;overflow:visible"></svg></div>
    ${p.sub ? `<div class="sb" style="font-size:50px;font-weight:400;margin-top:${p.trace ? 64 : 24}px;letter-spacing:-.01em">${KB(p.sub)}</div>` : ''}</div>`,
  sfx: p => [['big_word', .05]],
  build(tl, el, p, L) {
    const bg = el.querySelector('.bg'), so = el.querySelector('.so'), sb = el.querySelector('.sb'), sv = el.querySelector('.trs');
    tl.fromTo(bg, { scale: 1.3, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, .05);
    if (so) rise(tl, so, .15, .6, -30);
    if (p.trace) {
      const w = bg.offsetWidth * .9, k = (p.size || 320) / 320;
      sv.setAttribute('width', w + 60); sv.setAttribute('height', 70); sv.style.left = (bg.offsetWidth * .05 - 4) + 'px'; sv.style.top = (bg.offsetHeight - 26 * k) + 'px';
      sv.innerHTML = `<path d="${tracePath(p.trace, w)}" fill="none" stroke="${APOIO}" stroke-width="${9 * Math.max(.7, k)}" stroke-linecap="round"/>`;
      draw(tl, sv.querySelector('path'), .5, .7, SCURVE);
    }
    if (sb) rise(tl, sb, .75, .6, 30);
  }
};

// Text label da marca: frase curta com traço fino (sublinhado | colchete)
SC.rotulo = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 560}px;display:flex;justify-content:center;transform:translateY(-50%)">
    <div class="rt" style="position:relative;font-size:${p.size || 76}px;font-weight:600;letter-spacing:-.02em;padding:22px 34px;color:${p.color || '#fff'};white-space:nowrap">${KB(p.text)}<svg class="rs" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible"></svg></div></div>`,
  sfx: p => [['pill', .25]],
  build(tl, el, p, L) {
    const rt = el.querySelector('.rt'), sv = el.querySelector('.rs');
    sv.innerHTML = `<path d="${tracePath(p.forma || 'sublinhado', rt.offsetWidth, rt.offsetHeight, 28)}" fill="none" stroke="${p.color || '#fff'}" stroke-width="4.5" stroke-linecap="round"/>`;
    rise(tl, rt, .05, .6, 30);
    sv.querySelectorAll('path').forEach(pp => draw(tl, pp, .3, .7, SCURVE));
  }
};

// Selos de atributo: heading + itens [[ícone, rótulo, t]] (círculo desenha por trace; no tempo falado ganha check)
SC.selos = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 440}px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;color:#fff">
    ${p.heading ? `<div class="hd" style="font-size:40px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:60px">${p.heading}</div>` : ''}
    <div style="display:flex;gap:44px">${p.items.map((it, i) => `<div class="se s${i}" style="display:flex;flex-direction:column;align-items:center;width:250px">
      <div style="position:relative;width:236px;height:236px">
        <svg width="236" height="236" style="position:absolute;inset:0"><circle class="cc" cx="118" cy="118" r="114" fill="none" stroke="#fff" stroke-width="4" transform="rotate(-90 118 118)"/></svg>
        <div class="ri" style="position:absolute;inset:0;border:4px solid #fff;border-radius:50%;opacity:0"></div>
        <div class="ic" style="position:absolute;left:58px;top:58px;width:120px;height:120px">${BI(it[0], '#fff')}</div>
        <div class="ck" style="position:absolute;right:0;top:4px;width:58px;height:58px;border-radius:50%;background:#fff;display:grid;place-items:center;opacity:0"><svg width="30" height="30" viewBox="0 0 30 30"><path d="M7 15.5l5.5 5.5L23.5 9" fill="none" stroke="#2E507B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      </div><div class="lb" style="margin-top:22px;font-size:38px;font-weight:800;text-transform:uppercase">${it[1]}</div></div>`).join('')}</div></div>`,
  sfx: p => p.items.map((it, i) => ['check', Math.max(.9 + i * .1, it[2] || 0)]),
  build(tl, el, p, L) {
    const hd = el.querySelector('.hd'); if (hd) rise(tl, hd, .05, .6, -30);
    p.items.forEach((it, i) => {
      const s = el.querySelector('.s' + i), d = .12 + i * .15;
      draw(tl, s.querySelector('.cc'), d, .75, SCURVE);
      tl.fromTo(s.querySelector('.ic'), { scale: .7, rotation: -10, opacity: 0, filter: 'blur(10px)' }, { scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'expo.out', immediateRender: false }, d + .25);
      tl.set(s.querySelector('.ic'), { opacity: 0 }, 0);
      rise(tl, s.querySelector('.lb'), d + .35, .55, 24);
      const at = Math.max(.9 + i * .1, it[2] || 0);
      tl.fromTo(s.querySelector('.ck'), { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'expo.out', immediateRender: false }, at);
      tl.fromTo(s.querySelector('.ri'), { scale: 1, opacity: .7 }, { scale: 1.4, opacity: 0, duration: .55, ease: 'power2.out', immediateRender: false }, at);
    });
  }
};

// Palavras grandes: lines [["texto *destaque*", t, px]]; letters: monta letra por letra; strike: {line, at} traço riscando
SC.bigWords = {
  html: p => `<div class="abs" style="left:60px;right:60px;top:${p.y ?? 440}px;transform:translateY(-50%);text-align:center;color:${p.color || '#fff'};letter-spacing:-.04em">
    ${p.lines.map((l, i) => `<div class="bl l${i}" style="position:relative;display:block;font-size:${l[2] || 150}px;font-weight:400;line-height:.98;white-space:nowrap">${
      String(l[0]).split(' ').map(w => { const k = /^\*.*\*[.,!?]*$/.test(w) || /^\*/.test(w); const tx = w.replace(/\*/g, ''); return `<span class="w" style="display:inline-block;margin:0 .1em;${k ? 'font-weight:800' : ''}">${p.letters ? tx.split('').map(c => `<span class="ch" style="display:inline-block">${c}</span>`).join('') : tx}</span>`; }).join('')}</div>`).join('')}
    <svg class="stk" style="position:absolute;left:0;top:0;overflow:visible" width="10" height="10"></svg></div>`,
  sfx: p => p.lines.map((l, i) => ['big_word', Math.max(l[1] || 0, .05 + i * .25)]).concat(p.strike ? [['stamp', p.strike.at]] : []),
  build(tl, el, p, L) {
    p.lines.forEach((l, i) => {
      const t = Math.max(l[1] || 0, .05 + i * .25), items = el.querySelectorAll(`.l${i} ${p.letters ? '.ch' : '.w'}`);
      tl.set(items, { opacity: 0 }, 0);
      tl.fromTo(items, { y: 46, opacity: 0, filter: 'blur(16px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .65, ease: 'expo.out', stagger: p.letters ? .04 : .08, immediateRender: false }, t);
    });
    if (p.trace) {   // traço da marca sob a última linha (onda / gancho)
      const li = p.lines.length - 1, ln = el.querySelector('.l' + li), sv = el.querySelector('.stk');
      const w = ln.offsetWidth * .8, x0 = ln.offsetLeft + ln.offsetWidth * .1, y0 = ln.offsetTop + ln.offsetHeight + 4;
      sv.innerHTML = `<path transform="translate(${x0} ${y0 - (p.trace === 'gancho' ? 56 : 14)})" d="${tracePath(p.trace, w)}" fill="none" stroke="${APOIO}" stroke-width="9" stroke-linecap="round"/>`;
      draw(tl, sv.querySelector('path'), Math.max(p.lines[li][1] || 0, .05 + li * .25) + .45, .7, SCURVE);
    }
    if (p.strike) {
      const ln = el.querySelector('.l' + (p.strike.line ?? p.lines.length - 1)), sv = el.querySelector('.stk'), w = ln.offsetWidth * .78, x0 = ln.offsetLeft + ln.offsetWidth * .11, y0 = ln.offsetTop + ln.offsetHeight * .56;
      sv.innerHTML = `<path d="M${x0} ${y0 + 14} C${x0 + w * .3} ${y0 - 4} ${x0 + w * .62} ${y0 + 10} ${x0 + w} ${y0 - 12}" fill="none" stroke="${APOIO}" stroke-width="14" stroke-linecap="round"/>`;
      draw(tl, sv.querySelector('path'), p.strike.at, .6, SCURVE);
    }
  }
};

// Número grande contando + rótulo
SC.statBig = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 440}px;transform:translateY(-50%);text-align:center;color:#fff">
    <div class="nm" style="font-size:${p.size || 420}px;font-weight:800;letter-spacing:-.05em;line-height:.88;font-variant-numeric:tabular-nums">0</div>
    <div class="lb" style="font-size:110px;font-weight:400;letter-spacing:-.03em;line-height:1">${KB(p.label || '')}</div></div>`,
  sfx: p => [['counter', .05]],
  build(tl, el, p, L) {
    const nm = el.querySelector('.nm'), o = { v: 0 };
    tl.fromTo(nm, { scale: 1.25, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, .05);
    tl.to(o, { v: p.to, duration: p.dur || .8, ease: 'expo.out', onUpdate: () => { nm.textContent = Math.round(o.v); } }, .05);
    rise(tl, el.querySelector('.lb'), .45, .6, 40);
  }
};

// Selo grande da marca (círculo de traço fino + ícone + duas linhas em caixa-alta)
SC.seloBig = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 470}px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;color:${p.color || 'var(--c2)'}">
    <div style="position:relative;width:440px;height:440px"><svg width="440" height="440" style="position:absolute;inset:0"><circle class="cc" cx="220" cy="220" r="216" fill="none" stroke="currentColor" stroke-width="5" transform="rotate(-90 220 220)"/></svg>
    <div class="ic" style="position:absolute;left:100px;top:84px;width:240px;height:240px">${BI(p.icon || 'camadas', p.iconColor || '#2E507B')}</div></div>
    <div class="t1" style="margin-top:40px;font-size:66px;font-weight:800;text-transform:uppercase;letter-spacing:.01em">${p.t1 || ''}</div>
    <div class="t2" style="font-size:44px;font-weight:400;text-transform:uppercase;letter-spacing:.05em">${p.t2 || ''}</div></div>`,
  sfx: p => [['icon_pop', .35]],
  build(tl, el, p, L) {
    draw(tl, el.querySelector('.cc'), .05, .75, SCURVE);
    tl.fromTo(el.querySelector('.ic'), { scale: .7, rotation: -10, opacity: 0, filter: 'blur(10px)' }, { scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'expo.out', immediateRender: false }, .3);
    tl.set(el.querySelector('.ic'), { opacity: 0 }, 0);
    rise(tl, el.querySelector('.t1'), .5, .6, 30); rise(tl, el.querySelector('.t2'), .62, .6, 30);
  }
};

// Card de cadastro: fields [[rótulo, valor, t]]
SC.form = {
  html: p => `<div class="abs" style="left:0;right:0;top:${p.y ?? 470}px;transform:translateY(-50%);display:flex;justify-content:center">
    <div class="fc" style="background:#fff;color:var(--grafite,#201D1D);width:780px;padding:56px 60px 60px;text-align:left">
    <div class="ft" style="font-size:56px;font-weight:700;color:var(--c2);letter-spacing:-.02em;margin-bottom:30px">${p.title || 'Cadastro'}</div>
    ${p.fields.map((f, i) => `<div class="fd f${i}" style="border-bottom:3px solid var(--cinza,#D7D8D9);padding:14px 0 12px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:flex-end">
      <div><div style="font-size:24px;font-weight:600;letter-spacing:.06em;color:var(--logo,#476D9E);text-transform:uppercase">${f[0]}</div><div class="v" style="font-size:44px;font-weight:500">${f[1]}</div></div>
      <div class="ok" style="width:46px;height:46px;border-radius:50%;background:var(--c2);display:grid;place-items:center;opacity:0"><svg width="28" height="28" viewBox="0 0 30 30"><path d="M7 15.5l5.5 5.5L23.5 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`).join('')}
    <div class="fb" style="margin-top:34px;background:var(--c2);color:#fff;font-size:42px;font-weight:700;height:108px;display:flex;align-items:center;justify-content:center">${p.button || 'Enviar'}</div></div></div>`,
  sfx: p => [['ui_card', 0]].concat(p.fields.map((f, i) => ['check', Math.max(f[2] || 0, .35 + i * .32) + .4])),
  build(tl, el, p, L) {
    tl.fromTo(el.querySelector('.fc'), { y: 120, opacity: 0, filter: 'blur(14px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, 0);
    p.fields.forEach((f, i) => {
      const t = Math.max(f[2] || 0, .35 + i * .32), fd = el.querySelector('.f' + i);
      tl.fromTo(fd.querySelector('.v'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .4, ease: 'power2.out', immediateRender: false }, t);
      tl.set(fd.querySelector('.v'), { clipPath: 'inset(0% 100% 0% 0%)' }, 0);
      tl.fromTo(fd.querySelector('.ok'), { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: 'expo.out', immediateRender: false }, t + .4);
    });
    const tb = .35 + p.fields.length * .32 + .3;
    tl.fromTo(el.querySelector('.fb'), { scale: .94, filter: 'brightness(1)' }, { scale: 1, filter: 'brightness(1.25)', duration: .25, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, tb);
  }
};

// Assinatura: logo cresce do zero, sobe e encolhe -25%; lettering com traço da marca
SC.logoSign = {
  html: p => `<img class="abs lg" src="${IMG[p.logo || 'logo']}" style="left:${540 - (p.w || 640) / 2}px;top:${480 - (p.w || 640) * .147 / 2}px;width:${p.w || 640}px">
    <div class="abs rows" style="left:0;right:0;top:${p.rowsY ?? 520}px;display:flex;justify-content:center;color:#fff">
      <div style="position:relative;text-align:left;letter-spacing:-.02em">${(p.rows || []).map((r, i) => `<div class="rw r${i}" style="font-size:${r[1] || 86}px;font-weight:400;line-height:1">${KB(r[0])}</div>`).join('')}
      <svg class="trs" style="position:absolute;left:0;overflow:visible"></svg></div></div>`,
  sfx: p => [['brand_reveal', 0]],
  build(tl, el, p, L) {
    const lg = el.querySelector('.lg'), up = p.up ?? 170;
    tl.fromTo(lg, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .95, ease: 'power4.out' }, 0);
    tl.to(lg, { scale: .75, y: -up, duration: .8, ease: SCURVE }, .8);
    el.querySelectorAll('.rw b').forEach(b => b.style.fontWeight = 800);
    el.querySelectorAll('.rw').forEach((r, i) => rise(tl, r, 1.05 + i * .12, .6, 40));
    if (p.trace) {
      const last = el.querySelector('.r' + ((p.rows || []).length - 1)), sv = el.querySelector('.trs');
      if (last) {
        const w = last.querySelector('b') ? last.querySelector('b').offsetWidth : last.offsetWidth;
        sv.setAttribute('width', w + 60); sv.setAttribute('height', 70); sv.style.top = (last.offsetTop + last.offsetHeight - 30) + 'px';
        sv.innerHTML = `<path d="${tracePath(p.trace, w)}" fill="none" stroke="${APOIO}" stroke-width="7" stroke-linecap="round"/>`;
        draw(tl, sv.querySelector('path'), 1.35, .7, SCURVE);
      }
    }
  }
};

// Botão de CTA (canto vivo) + cursor clicando + textinho abaixo
SC.ctaButton = {
  html: p => { const y = p.y ?? 440, bw = p.bw || 640, bh = 150; return `
    <div class="abs bt" style="left:${540 - bw / 2}px;top:${y - bh / 2}px;width:${bw}px;height:${bh}px;background:#fff;color:var(--c2);font-size:62px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:28px">${p.cta || 'Saiba mais'}
      <svg viewBox="0 0 22 20" width="64" height="56"><path d="M2 10h17M12 3l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div class="abs ri" style="left:${540 + bw / 2 - 150 - 70}px;top:${y + 20 - 70}px;width:140px;height:140px;border:5px solid #fff;border-radius:50%;opacity:0"></div>
    <div class="abs cu" style="left:${540 + bw / 2 - 150 - 8}px;top:${y + 20 - 6}px;width:110px;height:138px;transform-origin:8px 6px"><svg viewBox="0 0 40 50" width="110" height="138" style="overflow:visible"><path d="M4 3 L4 38 L13 30 L19 45 L26 42 L20 28 L32 28 Z" fill="#fff" stroke="#2E507B" stroke-width="2.6" stroke-linejoin="round"/></svg></div>
    ${(p.sub || []).map((s, i) => `<div class="abs sb s${i}" style="left:0;right:0;top:${y + bh / 2 + 50 + i * 56}px;text-align:center;color:#fff;font-size:48px;font-weight:400;letter-spacing:-.01em;line-height:1.1">${KB(s)}</div>`).join('')}`; },
  sfx: p => [['click', p.clickAt ?? 1.35]],
  build(tl, el, p, L) {
    const bt = el.querySelector('.bt'), cu = el.querySelector('.cu'), ri = el.querySelector('.ri'), c = p.clickAt ?? 1.35;
    el.querySelectorAll('.sb b').forEach(b => b.style.fontWeight = 800);
    tl.fromTo(bt, { scale: .85, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }, .05);
    tl.fromTo(cu, { x: 260, y: 420, rotation: -12, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .85, ease: SCURVE, immediateRender: false }, c - .9);
    tl.set(cu, { opacity: 0 }, 0);
    tl.to(cu, { keyframes: { scale: [1, .85, 1] }, duration: .2, ease: 'none' }, c);
    tl.to(bt, { keyframes: { scale: [1, .95, 1] }, duration: .25, ease: 'none' }, c);
    tl.fromTo(bt, { filter: 'brightness(1.3)' }, { filter: 'brightness(1)', duration: .35, ease: 'power2.out', immediateRender: false }, c + .02);
    tl.fromTo(ri, { scale: 0, opacity: .5 }, { scale: 1.6, opacity: 0, duration: .5, ease: 'power2.out', immediateRender: false }, c + .02);
    el.querySelectorAll('.sb').forEach((s, i) => rise(tl, s, c + .15 + i * .12, .6, 30));
    if (L - c > 1.2) tl.to(cu, { x: 80, y: 160, opacity: 0, duration: .6, ease: 'power2.inOut' }, L - .7);
  }
};

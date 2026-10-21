// Cores sempre via variáveis da marca
const CY = 'var(--c1)', NV = 'var(--ink)', PAPER = 'var(--paper)', BG2 = 'var(--bg2)', TXT = 'var(--text)';
const mix = (c, p) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const PAN = 520, CX = 540, CY0 = 480;
function camCut(tl, C, L, cin, cout, last) {
  const IN = .7, OUT = .6;
  if (cin === 'zin') tl.fromTo(C, { scale: 1.22, x: 0 }, { scale: 1, duration: IN, ease: 'power3.out' }, 0);
  else if (cin === 'zout') tl.fromTo(C, { scale: .8, x: 0 }, { scale: 1, duration: IN, ease: 'power3.out' }, 0);
  else if (cin === 'panR' || cin === 'panL') tl.fromTo(C, { scale: 1, x: cin === 'panR' ? -PAN : PAN }, { x: 0, duration: IN, ease: 'power3.out' }, 0);
  else tl.fromTo(C, { scale: 1.12, x: 0 }, { scale: 1, duration: .9, ease: 'power3.out' }, 0);
  if (last) { tl.to(C, { scale: 1.05, duration: Math.max(.1, L - IN), ease: 'none' }, IN); return; }
  if (cout === 'zin' || cout === 'zout') {
    tl.to(C, { scale: cout === 'zin' ? 1.075 : .93, duration: Math.max(.1, L - OUT - IN), ease: 'none' }, IN);
    tl.to(C, { scale: cout === 'zin' ? 1.22 : .8, duration: OUT, ease: 'power3.in' }, L - OUT);
  } else {
    const d = cout === 'panR' ? 1 : -1;
    tl.to(C, { scale: 1.04, duration: Math.max(.1, L - OUT - IN), ease: 'none' }, IN);
    tl.to(C, { x: PAN * d, duration: OUT, ease: 'power3.in' }, L - OUT);
  }
}
function focus(tl, foc, px, py, s, t, d = 1.1, ease = 'power2.inOut') {
  tl.to(foc, { scale: s, x: (CX - px) * s, y: (CY0 - py) * s, duration: d, ease }, t);
}
function float(tl, el, t0, L, amp = 24, rot = 6, per = 1.2) {
  if (L - t0 < .3) return;
  const n = Math.max(1, Math.floor((L - t0) / per));
  tl.to(el, { y: '+=' + amp, rotation: '+=' + rot, duration: per / 2, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, t0);
}
function rings(tl, els, t0, L, per = 1.1) {
  els.forEach((r, i) => {
    for (let t = t0 + i * per / els.length; t < L; t += per)
      tl.fromTo(r, { scale: .7, opacity: .7 }, { scale: 1.7, opacity: 0, duration: per * 1.2, ease: 'power2.out', immediateRender: false }, t);
  });
}
function pop(tl, el, t, from = 0, ease = 'back.out(1.7)', d = .55) {
  tl.fromTo(el, { scale: from, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: d, ease, immediateRender: false }, t);
  tl.set(el, { opacity: 0 }, 0);
}
function enterBlur(tl, el, t, vars = {}, d = .6) {
  tl.fromTo(el, Object.assign({ y: 120, filter: 'blur(16px)' }, vars), { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: d, ease: 'power4.out' }, t);
}
function draw(tl, path, t, d = .5, ease = 'power2.out') {
  const len = path.getTotalLength ? path.getTotalLength() : 300;
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease }, t);
}
function shake(tl, el, t, a = 24) {
  tl.to(el, { keyframes: { x: [-a, a * .85, -a * .6, a * .4, -a * .2, 0] }, duration: .5, ease: 'none' }, t);
}
// ícones desenhados (fallback) — traço via style para aceitar var()
const ICON = {
  person: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><circle cx="50" cy="34" r="15"/><path d="M22 84c0-18 12-28 28-28s28 10 28 28"/></svg>`,
  cycle: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><path d="M80 52a30 30 0 1 1-12-24"/><path d="M70 12l-1 17-17 1"/><circle cx="50" cy="52" r="8"/></svg>`,
  bolt: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><path d="M57 8L24 56h25l-6 36 33-50H51z"/></svg>`,
  check: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="11"><path class="ck" d="M26 52l16 16 32-34"/></svg>`,
  lock: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="8"><path class="shk" d="M34 46V33a16 16 0 0 1 32 0v13"/><rect x="22" y="46" width="56" height="42" rx="10"/><path d="M50 62v10"/></svg>`,
  ear: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><path d="M32 40a20 20 0 1 1 38 9c-3 6-10 9-11 17s-5 16-14 16c-7 0-11-4-12-9"/><path d="M44 44a8 8 0 1 1 13 6"/></svg>`,
  talk: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><path d="M18 22h64a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H48L30 86V70H18a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z"/><path d="M32 46h.01M50 46h.01M68 46h.01" stroke-width="10"/></svg>`,
  shield: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="5"><path class="sh" d="M50 8l36 13v27c0 24-17 38-36 45C31 86 14 72 14 48V21z"/><path class="ck" d="M33 50l12 12 22-24" stroke-width="7"/></svg>`,
  book: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><path d="M16 22c12-4 24-4 34 4v58c-10-8-22-8-34-4z"/><path d="M84 22c-12-4-24-4-34 4v58c10-8 22-8 34-4z"/></svg>`,
  micoff: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><rect x="38" y="12" width="24" height="44" rx="12"/><path d="M26 48a24 24 0 0 0 48 0M50 72v14"/><path d="M18 14l64 72"/></svg>`,
  cal: c => `<svg viewBox="0 0 100 100" class="ico" style="stroke:${c}" stroke-width="7"><rect x="14" y="20" width="72" height="66" rx="10"/><path d="M14 40h72M34 10v18M66 10v18"/></svg>`,
};
// I(ref, cor): ícone do banco (tabler:, phosphor-bold:, fluent3d:, brand:symbol, file:) ou fallback desenhado
function I(ref, c) {
  if (!ref) return '';
  if (ref === 'brain' || ref === 'brand:symbol') return `<img src="${IMG.symbol}" style="width:100%;height:100%;object-fit:contain">`;
  if (ref === 'brand:logo') return `<img src="${IMG.logo}" style="width:100%;height:100%;object-fit:contain">`;
  const k = ICONS[ref];
  if (k && k.png) return `<img src="${k.png}" style="width:100%;height:100%;object-fit:contain">`;
  if (k && k.svg) return `<span class="icx" style="color:${c};width:100%;height:100%">${k.svg}</span>`;
  if (ICON[ref]) return ICON[ref](c);
  return '';
}

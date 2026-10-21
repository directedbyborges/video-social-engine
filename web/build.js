// node build.js <pasta_do_projeto>  -> <proj>/index.html (fontes, imagens, ícones e tema da marca embutidos)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const P = path.resolve(process.argv[2]);
const R = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const b64 = p => fs.readFileSync(p).toString('base64');
const TL = JSON.parse(fs.readFileSync(P + '/timeline.json', 'utf8'));
const B = JSON.parse(fs.readFileSync(TL.brandFile, 'utf8'));
const BD = path.dirname(TL.brandFile);
const mime = f => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[path.extname(f).toLowerCase()];
const dataURI = f => `data:${mime(f)};base64,${b64(f)}`;
// ---------- fontes ----------
function fontFaces() {
  let css = '';
  for (const [role, f] of Object.entries(B.fonts || {})) {
    if (f.file) {
      const fp = path.resolve(BD, f.file), ext = path.extname(fp).slice(1).toLowerCase();
      const fmt = { ttf: 'truetype', otf: 'opentype', woff2: 'woff2', woff: 'woff' }[ext];
      css += `@font-face{font-family:'${f.family}';font-weight:${f.weight || 400};src:url(data:font/${ext};base64,${b64(fp)}) format('${fmt}')}\n`;
      continue;
    }
    const pkg = f.fontsource || f.family.toLowerCase().replace(/\s+/g, '-');
    const dir = path.join(__dirname, 'node_modules/@fontsource', pkg, 'files');
    if (!fs.existsSync(dir)) cp.execSync(`npm i -s @fontsource/${pkg}`, { cwd: __dirname, stdio: 'inherit' });
    for (const w of f.weights || [400]) for (const sub of ['latin', 'latin-ext']) {
      const fp = `${dir}/${pkg}-${sub}-${w}-normal.woff2`;
      if (fs.existsSync(fp)) css += `@font-face{font-family:'${f.family}';font-weight:${w};${sub === 'latin-ext' ? 'unicode-range:U+0100-024F;' : ''}src:url(data:font/woff2;base64,${b64(fp)}) format('woff2')}\n`;
    }
  }
  return css;
}
// ---------- tema ----------
function theme() {
  const c = B.colors, cap = B.captions || {}, F = B.fonts || {};
  const fam = r => F[r] ? `'${F[r].family}'` : "'Poppins'";
  const v = {
    '--c1': c.c1, '--c2': c.c2 || c.ink, '--ink': c.ink || c.c2, '--paper': c.paper || '#fff', '--bg': c.bg || c.c2, '--bg2': c.bg2 || c.c2,
    '--text': c.text || '#fff', '--font-head': fam('head'), '--font-body': fam('body'), '--font-hand': fam('hand'),
    '--radius': (B.shape?.radius ?? 40) + 'px', '--pill-radius': (B.shape?.pill_radius ?? 999) + 'px',
    '--cap-size': (cap.size || 58) + 'px', '--cap-weight': cap.weight || 700, '--cap-track': (cap.tracking ?? -.025) + 'em',
    '--cap-case': cap.case || 'none', '--cap-font': cap.font ? `var(--font-${cap.font})` : 'var(--font-body)',
    '--big-size': (cap.big_size || 104) + 'px', '--big-weight': cap.big_weight || 800, '--big-track': (cap.big_tracking ?? -.045) + 'em',
    '--big-case': cap.big_case || 'uppercase', '--big-font': cap.big_font ? `var(--font-${cap.big_font})` : 'var(--font-head)',
    '--kw-stroke': (cap.kw_stroke || 6) + 'px', '--kw-radius': (cap.kw_radius ?? 22) + 'px',
    '--shadow': cap.shadow || '0 3px 16px rgba(0,0,0,.6),0 1px 3px rgba(0,0,0,.5)',
    '--pill-bg': cap.pill_bg || 'var(--c1)', '--pill-text': cap.pill_text || 'var(--ink)',
    '--bgfill': (B.panel && B.panel.fill) || `linear-gradient(180deg, color-mix(in srgb, ${c.bg || c.c2} 85%, #000) 0%, ${c.bg || c.c2} 55%, ${c.bg2 || c.bg || c.c2} 100%)`,
  };
  return ':root{' + Object.entries(v).map(([k, x]) => `${k}:${x}`).join(';') + '}\n' + (B.css || '');
}
// ---------- ícones usados ----------
function icons() {
  const refs = new Set(), re = /^(tabler|tabler-filled|phosphor-(?:thin|light|regular|bold|fill|duotone)|lucide|iconoir|fluent3d|fluentflat|fluentcolor|file):.+/;
  const walk = x => { if (typeof x === 'string' && re.test(x)) refs.add(x); else if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') Object.values(x).forEach(walk); };
  walk(TL.panels);
  const out = {};
  for (const r of refs) {
    const fp = cp.execSync(`python3 ${path.join(__dirname, '../engine/icons.py')} get "${r}"`).toString().trim().split('\n').pop();
    if (fp.endsWith('.png')) { out[r] = { png: dataURI(fp) }; continue; }
    let s = fs.readFileSync(fp, 'utf8').replace(/<\?xml.*?\?>/, '').replace(/(width|height)="[^"]*"/g, '');
    if (r.startsWith('tabler') || r.startsWith('lucide')) s = s.replace(/stroke-width="[^"]*"/g, `stroke-width="${B.icons?.stroke || 2}"`);
    if (r.startsWith('iconoir')) s = s.replace(/stroke-width="[^"]*"/g, `stroke-width="${B.icons?.stroke || 1.5}"`).replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
    out[r] = { svg: s };
  }
  return out;
}
const IMG = {
  logo: dataURI(path.resolve(BD, B.files.logo)),
  symbol: dataURI(path.resolve(BD, B.files.symbol || B.files.logo)),
};
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces()}\n${R('src/style.css')}\n${theme()}</style></head><body>
<div id="stage"><div id="caps" class="caps"><div id="capsC" class="capsC"></div><div id="capsF" class="capsC"></div></div></div>
<script>${R('node_modules/gsap/dist/gsap.min.js')}</script>
<script>${R('node_modules/roughjs/bundled/rough.js')}</script>
<script>const TL=${JSON.stringify(TL)};const IMG=${JSON.stringify(IMG)};const ICONS=${JSON.stringify(icons())};</script>
<script>${R('src/lib.js')}\n${R('src/scenes.js')}\n${R('src/main.js')}</script></body></html>`;
fs.writeFileSync(P + '/index.html', html);
console.log('built', P + '/index.html', (html.length / 1e6).toFixed(2) + 'MB');

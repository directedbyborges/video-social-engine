// node peek.js <proj> [frac=0.6] -> <proj>/peek/gNN.png: um print do gráfico por plano (sem render), em t = início + frac × duração
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const P = path.resolve(process.argv[2]), fr = +(process.argv[3] || .6), only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
  const TL = JSON.parse(fs.readFileSync(P + '/timeline.json', 'utf8'));
  fs.mkdirSync(P + '/peek', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.VSE_CHROME || undefined });
  const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto('file://' + P + '/index.html');
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const out = [];
  for (const [i, sh] of TL.shots.entries()) {
    if (only && !only.includes(i + 1)) continue;
    const t = sh.start + fr * (sh.end - sh.start);
    await page.evaluate(t => window.seek(t), t);
    const f = `${P}/peek/g${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: f, omitBackground: true }); out.push([i + 1, t]);
  }
  fs.writeFileSync(P + '/peek/times.json', JSON.stringify(out));
  await b.close();
})();

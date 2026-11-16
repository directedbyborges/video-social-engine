// node peek.js <proj> [frac] -> <proj>/peek/NN.png: um quadro por tomada (no ponto frac da tomada), sobre cinza; erros da página no console
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const P = path.resolve(process.argv[2]), frac = +(process.argv[3] || .62);
  const TL = JSON.parse(fs.readFileSync(P + '/timeline.json', 'utf8'));
  const shells = fs.readdirSync('/opt/pw-browsers').filter(n => n.startsWith('chromium_headless_shell-')).sort().reverse()
    .flatMap(n => ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/headless_shell'].map(x => `/opt/pw-browsers/${n}/${x}`)).filter(f => fs.existsSync(f));
  const browser = await chromium.launch({ executablePath: process.env.VSE_CHROME || shells[0] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto('file://' + P + '/index.html');
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  fs.mkdirSync(P + '/peek', { recursive: true });
  const shots = TL.shots || [];
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i], t = s.start + (s.end - s.start) * frac;
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: `${P}/peek/${String(i + 1).padStart(2, '0')}.png`, omitBackground: true });
  }
  await browser.close(); console.log('peek', shots.length);
})();

// node render.js <proj> [layer=front|behind] [inicio] [fim]  -> <proj>/g (front) ou <proj>/gb (behind), PNG transparentes
// No layer front também grava <proj>/sfx_events.json (eventos das cenas/legendas para a mixagem).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const FPS = 30, P = path.resolve(process.argv[2]), layer = process.argv[3] || 'front';
  const a = +(process.argv[4] || 0), b = +(process.argv[5] || 1e9);
  const out = P + (layer === 'behind' ? '/gb' : '/g'); fs.mkdirSync(out, { recursive: true });
  const TL = JSON.parse(fs.readFileSync(P + '/timeline.json', 'utf8'));
  const browser = await chromium.launch({ executablePath: process.env.VSE_CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto('file://' + P + '/index.html?layer=' + layer);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  if (layer === 'front') fs.writeFileSync(P + '/sfx_events.json', JSON.stringify(await page.evaluate(() => window.SFX)));
  const end = Math.min(b, await page.evaluate(() => window.DURATION));
  // no layer behind só renderiza os intervalos com texto atrás da pessoa
  const ranges = layer === 'behind' ? TL.behind : [[a, end]];
  const t0 = Date.now(); let n = 0;
  for (const [ra, rb] of ranges) for (let i = Math.round(Math.max(a, ra) * FPS); i < Math.round(Math.min(end, rb) * FPS); i++) {
    await page.evaluate(t => { window.seek(t) }, i / FPS);
    await page.screenshot({ path: `${out}/${String(i).padStart(5, '0')}.png`, omitBackground: true }); n++;
  }
  console.log('done', layer, n, 'frames', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  await browser.close();
})();

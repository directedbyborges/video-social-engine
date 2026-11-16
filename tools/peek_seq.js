// node tools/peek_seq.js <proj> [frac=0.62] [ids...] -> <proj>/peek/sNN.jpg (um quadro por cena do modo seq, sem renderizar o vídeo)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const P = path.resolve(process.argv[2]), frac = +(process.argv[3] || .62), only = process.argv.slice(4).map(Number);
  const TL = JSON.parse(fs.readFileSync(P + '/timeline.json', 'utf8')); fs.mkdirSync(P + '/peek', { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + P + '/index.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  for (const [i, sc] of TL.seq.entries()) {
    if (only.length && !only.includes(i + 1)) continue;
    const t = sc.t + (sc.end - sc.t) * frac;
    await p.evaluate(t => window.seek(t), t);
    await p.screenshot({ path: `${P}/peek/s${String(i + 1).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await b.close();
})();

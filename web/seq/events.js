// node web/seq/events.js <page.html> <saida.json> -> eventos sonoros e duração registrados pela página
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [page, out] = process.argv.slice(2);
  const br = await chromium.launch(process.env.VSE_CHROME ? { executablePath: process.env.VSE_CHROME } : {});
  const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.error('[page]', m.text()); });
  await p.goto('file://' + page);
  await p.waitForFunction(() => window.SEQ_READY === true, null, { timeout: 60000 });
  const d = await p.evaluate(() => ({ fps: window.SEQ.fps, end: window.SEQ.end, sfx: window.SEQ.sfx, scenes: window.SEQ.scenes }));
  fs.writeFileSync(out, JSON.stringify(d, null, 1));
  console.log(`${d.sfx.length} eventos sonoros · ${d.end}s`);
  await br.close();
})();

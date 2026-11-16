// node web/seq/render.js <page.html> <saida.mp4> <quadro_ini> <quadro_fim>
// Renderiza a página de sequência quadro a quadro (window.seek) e envia JPEG para o ffmpeg (H.264).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const [page, out, a, b] = process.argv.slice(2);
  const launch = process.env.VSE_CHROME ? { executablePath: process.env.VSE_CHROME } : {};
  const br = await chromium.launch(launch);
  const p = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.error('[page]', m.text()); });
  await p.goto('file://' + page);
  await p.waitForFunction(() => window.SEQ_READY === true, null, { timeout: 60000 });
  const fps = await p.evaluate(() => window.SEQ.fps || 30);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = +a; f < +b; f++) {
    await p.evaluate(t => window.seek(t), f / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 150 === 0) console.log(`${out}: quadro ${f} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await br.close();
})();

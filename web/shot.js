// node shot.js page.html out.png  — screenshot de página inteira (folhas de ícones, brand board)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.VSE_CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const p = await b.newPage({ viewport: { width: 1620, height: 400 } });
  await p.goto('file://' + path.resolve(process.argv[2]));
  await p.waitForTimeout(150);
  await p.screenshot({ path: process.argv[3], fullPage: true });
  await b.close();
})();

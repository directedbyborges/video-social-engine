// node tools/peek_times.js <proj> <saida.jpg> t1 t2 ... -> folha com os quadros nesses tempos (conferência de movimento sem render)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const P = path.resolve(process.argv[2]), out = process.argv[3], ts = process.argv.slice(4).map(Number);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + P + '/index.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  fs.mkdirSync(P + '/_pt', { recursive: true });
  for (const [i, t] of ts.entries()) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `${P}/_pt/${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 70 }); }
  await b.close();
  require('child_process').execSync(`python3 -c "
from PIL import Image, ImageDraw
import glob
fs=sorted(glob.glob('${P}/_pt/*.jpg')); ts=${JSON.stringify(ts)}
W,H=180,320; cols=min(10,len(fs)); rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(cols*W,rows*(H+14)),'white'); d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
    x=(i%cols)*W; y=(i//cols)*(H+14); sh.paste(Image.open(f).resize((W,H)),(x,y)); d.text((x+3,y+H+1),str(ts[i]),fill='black')
sh.save('${out}',quality=80)
"`);
  fs.rmSync(P + '/_pt', { recursive: true });
})();

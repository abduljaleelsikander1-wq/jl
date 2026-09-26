// Offline renderer: drives the scene in headless Chromium and saves frames.
//
//   node scripts/render.mjs still  [--w 3840 --h 2160 --t 6 --out renders/nmt-still-4k.png]
//   node scripts/render.mjs frames [--w 1920 --h 1080 --fps 30 --dur 24 --out renders/frames]
//
// Frames can be encoded with: ffmpeg -framerate 30 -i renders/frames/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16 nmt.mp4
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const mode = args[0] || 'still';
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i > 0 ? args[i + 1] : d; };

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = await readFile(p.endsWith('/') ? join(p, 'index.html') : p);
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const w = +opt('w', mode === 'still' ? 3840 : 1920);
const h = +opt('h', mode === 'still' ? 2160 : 1080);
const q = opt('q', 'high');

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const page = await browser.newPage({ viewport: { width: Math.min(w, 1920), height: Math.min(h, 1080) } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/index.html?capture&w=${w}&h=${h}&q=${q}&shot=${opt('shot', 'wide')}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });

async function grab(t) {
  const data = await page.evaluate((tt) => { window.__renderAt(tt); return document.getElementById('scene').toDataURL('image/png'); }, t);
  return Buffer.from(data.split(',')[1], 'base64');
}

if (mode === 'still') {
  const times = String(opt('t', '6')).split(',').map(Number);
  const out = opt('out', 'renders/nmt-still-4k.png');
  await mkdir(dirname(join(root, out)), { recursive: true });
  for (const t of times) {
    const file = times.length > 1 ? out.replace(/\.png$/, `-t${t}.png`) : out;
    const t0 = Date.now();
    await writeFile(join(root, file), await grab(t));
    console.log(`wrote ${file} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
} else {
  const fps = +opt('fps', 30), dur = +opt('dur', 24);
  const out = opt('out', 'renders/frames');
  const start = +opt('start', 0);
  await mkdir(join(root, out), { recursive: true });
  const n = +opt('end', Math.round(fps * dur)); // --start/--end split work across processes
  for (let i = start; i < n; i++) {
    await writeFile(join(root, out, `${String(i).padStart(4, '0')}.png`), await grab(i / fps));
    if (i % 10 === 0) console.log(`frame ${i}/${n}`);
  }
}
await browser.close();
server.close();

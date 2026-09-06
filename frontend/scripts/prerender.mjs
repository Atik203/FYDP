import { createServer } from 'http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const routes = ['/', '/idea/1', '/roadmap', '/papers', '/proposal', '/slide'];

async function findChrome() {
  if (process.platform === 'linux') {
    try {
      const mod = await import('@sparticuz/chromium');
      const p = await mod.default.executablePath();
      if (p) return { executablePath: p, args: [...mod.default.args, '--no-sandbox', '--disable-setuid-sandbox'] };
    } catch {}
  }
  try {
    const pptr = await import('puppeteer');
    const exePath = await pptr.executablePath();
    return { executablePath: exePath, args: ['--no-sandbox'] };
  } catch {}
  try {
    const { executablePath } = await import('puppeteer-core');
    const exePath = await executablePath();
    return { executablePath: exePath, args: ['--no-sandbox'] };
  } catch {}
  return null;
}

function serve() {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
  return createServer((req, res) => {
    let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);
    if (!existsSync(filePath) || extname(filePath) === '') filePath = join(distDir, 'index.html');
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] ?? 'application/octet-stream' });
    res.end(content);
  });
}

const chromeInfo = await findChrome();
if (!chromeInfo) {
  console.warn('⚠️  Chrome not found — skipping prerendering. AI crawlers will see only the SPA shell.');
  process.exit(0);
}

const { default: puppeteer } = await import('puppeteer-core');

const server = serve();
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://localhost:${port}`;

const browser = await puppeteer.launch({ ...chromeInfo, headless: true });
try {
  for (const route of routes) {
    const page = await browser.newPage();
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    let html = await page.content();
    html = html.replace(/https?:\/\/localhost:\d+\//g, '/');
    const outDir = route === '/' ? distDir : join(distDir, route.slice(1));
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html);
    console.log(`Prerendered: ${route}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log('Prerendering complete!');

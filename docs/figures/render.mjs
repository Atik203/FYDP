import { createRequire } from 'module';
import path from 'path';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const puppeteer = require('puppeteer');

const [, , htmlPath, outPath] = process.argv;
if (!htmlPath || !outPath) {
  console.error('usage: node render.mjs <figure.html> <out.png>');
  process.exit(1);
}
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 2752, height: 1536, deviceScaleFactor: 1 });
await page.goto('file:///' + path.resolve(htmlPath).replace(/\\/g, '/'), { waitUntil: 'load' });
await page.screenshot({ path: outPath });
await browser.close();
console.log('rendered ' + outPath);

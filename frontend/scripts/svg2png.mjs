import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Render an SVG file to a PNG at an exact pixel size.
 * Usage: node scripts/svg2png.mjs <input.svg> <output.png> [width] [height]
 * Example: node scripts/svg2png.mjs ../FYDP_Summer/data-flow.svg ../FYDP_Summer/fig-dataflow.png 2752 1536
 */

const [, , inputArg, outputArg, widthArg, heightArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/svg2png.mjs <input.svg> <output.png> [width] [height]');
  process.exit(1);
}

const width = Number.parseInt(widthArg ?? '2752', 10);
const height = Number.parseInt(heightArg ?? '1536', 10);
const input = resolve(process.cwd(), inputArg);
const output = resolve(process.cwd(), outputArg);

const svg = readFileSync(input, 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${svg}</body></html>`;

const pptr = await import('puppeteer');
const executablePath = await pptr.executablePath();
const { default: puppeteer } = await import('puppeteer-core');

const browser = await puppeteer.launch({ executablePath, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: output, type: 'png' });
  console.log(`Saved ${output} (${width}x${height})`);
} finally {
  await browser.close();
}

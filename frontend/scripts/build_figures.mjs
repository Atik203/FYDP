#!/usr/bin/env node
/**
 * Build the manuscript figures: canonical SVG -> 600 DPI PNG.
 *
 * Source of truth: docs/figures-src/<name>.svg
 *   width="6000" height="3375" viewBox="0 0 1600 900"
 *   6000 px / 10 in = 600 DPI at 10 in wide; 6.5 in gives 923 DPI.
 *
 * Journal set: docs/figures/, frontend/public/figures/, Papev_Summer26_6/.
 * Report set: FYDP_Summer/ uses report-context and report-dataflow for
 * fig-context.png and fig-dataflow.png; the other four report figures come
 * from the journal set. The report-only PNGs are not written anywhere else.
 * The PNG IHDR is verified before any file is written.
 *
 * Run from frontend/:  node scripts/build_figures.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(__dirname, '..');
const repoRoot = join(frontendDir, '..');
const srcDir = join(repoRoot, 'docs', 'figures-src');
const outDir = join(repoRoot, 'docs', 'figures');
const journalCopies = [
  join(frontendDir, 'public', 'figures'),
  join(repoRoot, 'Papev_Summer26_6'),
];
const reportDir = join(repoRoot, 'FYDP_Summer');

const JOURNAL_NAMES = [
  'fig-pipeline',
  'fig-context',
  'fig-claim-example',
  'fig-trust-detail',
  'fig-round-loop',
  'fig-dataflow',
];
const REPORT_ONLY = [
  { source: 'report-context', target: 'fig-context' },
  { source: 'report-dataflow', target: 'fig-dataflow' },
];
const NAMES = [...JOURNAL_NAMES, ...REPORT_ONLY.map((r) => r.source)];

// Journal geometry: cas-sc text width = 192 mm - 2 x 13.7 mm = 164.6 mm.
// Report geometry: A4 with 3 cm margins = 150 mm text width.
const IN_PER_MM = 1 / 25.4;
const JOURNAL_TEXT_IN = 164.6 * IN_PER_MM;
const REPORT_TEXT_IN = 150 * IN_PER_MM;
const JOURNAL_SCALE = {
  'fig-pipeline': 0.88,
  'fig-context': 0.80,
  'fig-claim-example': 0.80,
  'fig-trust-detail': 0.58,
  'fig-round-loop': 0.88,
  'fig-dataflow': 0.88,
};
const REPORT_SCALE = Object.fromEntries(NAMES.map((n) => [n, 1.0]));

const WIDTH = 6000;
const HEIGHT = 3375;

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

function svgSize(svg, name) {
  const tag = svg.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const width = Number(tag.match(/\bwidth="([0-9.]+)"/)?.[1]);
  const height = Number(tag.match(/\bheight="([0-9.]+)"/)?.[1]);
  const viewBox = tag.match(/\bviewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number);
  const problems = [];
  if (width !== WIDTH) problems.push(`width ${width} (expected ${WIDTH})`);
  if (height !== HEIGHT) problems.push(`height ${height} (expected ${HEIGHT})`);
  if (!viewBox || viewBox.length !== 4 || viewBox.join(' ') !== '0 0 1600 900') {
    problems.push(`viewBox ${viewBox?.join(' ') ?? 'missing'} (expected 0 0 1600 900)`);
  }
  if (problems.length) throw new Error(`${name}.svg: ${problems.join('; ')}`);
  return { width, height };
}

function pngSize(buffer, name) {
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error(`${name}.png: not a PNG (signature ${signature})`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== WIDTH || height !== HEIGHT) {
    throw new Error(`${name}.png: ${width}x${height}, expected ${WIDTH}x${HEIGHT}`);
  }
  return { width, height };
}

const round = (n) => Math.round(n);
const dpi = (inches) => Math.round(WIDTH / inches);

const chromeInfo = await findChrome();
if (!chromeInfo) {
  console.error('Chrome not found. Install puppeteer or set an executable path.');
  process.exit(1);
}

const { default: puppeteer } = await import('puppeteer-core');

const launchOptions = {
  ...chromeInfo,
  headless: true,
  protocolTimeout: 300000,
  args: [
    ...chromeInfo.args,
    '--force-color-profile=srgb',
    '--disable-lcd-text',
    '--font-render-hinting=none',
    '--disable-dev-shm-usage',
  ],
};

async function renderSvg(name) {
  const svgPath = join(srcDir, `${name}.svg`);
  if (!existsSync(svgPath)) throw new Error(`missing source: ${svgPath}`);
  const svg = readFileSync(svgPath, 'utf8');
  const { width, height } = svgSize(svg, name);
  const payload = Buffer.from(svg, 'utf8').toString('base64');

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const browser = await puppeteer.launch(launchOptions);
    try {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.setContent(
        `<!doctype html><html><head><meta charset="utf-8"><style>
          html,body{margin:0;padding:0;background:#fff;width:${width}px;height:${height}px;overflow:hidden}
          img{display:block;width:${width}px;height:${height}px}
        </style></head><body><img alt="" src="data:image/svg+xml;base64,${payload}"></body></html>`,
        { waitUntil: 'load' },
      );
      await page.evaluate(() => document.fonts.ready);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const png = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width, height },
        captureBeyondViewport: false,
        omitBackground: false,
        optimizeForSpeed: true,
      });
      return png;
    } catch (error) {
      lastError = error;
      if (attempt < 3) console.warn(`  ${name}: screenshot attempt ${attempt} failed, retrying`);
    } finally {
      await browser.close().catch(() => {});
    }
  }
  throw lastError;
}

const results = [];
for (const name of NAMES) {
  process.stdout.write(`[${results.length + 1}/${NAMES.length}] ${name} ... `);
  const png = await renderSvg(name);
  const actual = pngSize(png, name);
  results.push({ name, actual, png });
  console.log(`${actual.width}x${actual.height} ok`);
}

const byName = new Map(results.map((r) => [r.name, r]));

mkdirSync(outDir, { recursive: true });
for (const name of JOURNAL_NAMES) {
  const png = byName.get(name).png;
  const target = join(outDir, `${name}.png`);
  writeFileSync(target, png);
  for (const dir of journalCopies) {
    mkdirSync(dir, { recursive: true });
    copyFileSync(target, join(dir, `${name}.png`));
  }
}

// The report keeps the journal pipeline/claim/trust/round figures, but uses
// the report-specific context and DFD drawings under the same file names.
mkdirSync(reportDir, { recursive: true });
for (const name of JOURNAL_NAMES) {
  if (name === 'fig-context' || name === 'fig-dataflow') continue;
  copyFileSync(join(outDir, `${name}.png`), join(reportDir, `${name}.png`));
}
for (const { source, target } of REPORT_ONLY) {
  writeFileSync(join(reportDir, `${target}.png`), byName.get(source).png);
}

function printTable(header, rows) {
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const fmt = (r) => r.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join('  ');
  console.log(fmt(header));
  console.log(fmt(widths.map((w) => '-'.repeat(w))));
  for (const r of rows) console.log(fmt(r));
}

console.log('Figure build — canonical SVG -> PNG');
console.log('journal set: docs/figures + public/figures + Papev_Summer26_6 + FYDP_Summer (4 files)');
console.log('report overrides: report-context/report-dataflow -> FYDP_Summer only');
console.log('');

console.log('Journal set');
printTable(
  ['figure', 'pixels', 'journal width', 'journal DPI', 'report width', 'report DPI'],
  JOURNAL_NAMES.map((name) => {
    const actual = byName.get(name).actual;
    const jw = JOURNAL_TEXT_IN * JOURNAL_SCALE[name];
    const rw = REPORT_TEXT_IN * REPORT_SCALE[name];
    return [
      name + '.png',
      `${actual.width}x${actual.height}`,
      `${jw.toFixed(2)} in`,
      String(dpi(jw)),
      `${rw.toFixed(2)} in`,
      String(dpi(rw)),
    ];
  }),
);

console.log('');
console.log('Report-only overrides (not written to docs/figures, public/figures, or Papev_Summer26_6)');
printTable(
  ['source', 'pixels', 'report width', 'report DPI', 'output'],
  REPORT_ONLY.map(({ source, target }) => {
    const actual = byName.get(source).actual;
    const rw = REPORT_TEXT_IN * REPORT_SCALE[source];
    return [
      source + '.svg',
      `${actual.width}x${actual.height}`,
      `${rw.toFixed(2)} in`,
      String(dpi(rw)),
      `FYDP_Summer/${target}.png`,
    ];
  }),
);

console.log('');
console.log(`verified: ${results.length}/${NAMES.length} PNGs are exactly ${WIDTH}x${HEIGHT} px`);
console.log(`effective DPI at 10 in wide: ${round(WIDTH / 10)}; at 6.5 in: ${round(WIDTH / 6.5)}`);

// Rebuilds the downloadable CV (assets/joey-kheireddine-cv.pdf) from the site's print stylesheet.
// Usage (from the repo root, with the site served locally):
//   npm i --no-save playwright-core
//   node scripts/build-cv.mjs [url] [output]
// Uses the installed Microsoft Edge by default; set BROWSER_CHANNEL=chrome to use Chrome instead.
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://127.0.0.1:8787/';
const out = process.argv[3] || 'assets/joey-kheireddine-cv.pdf';

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => dispatchEvent(new Event('beforeprint'))); // final counter values
await page.emulateMedia({ media: 'print', colorScheme: 'light' });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`CV written to ${out}`);

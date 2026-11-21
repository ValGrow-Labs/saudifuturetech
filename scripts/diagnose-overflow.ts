import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function diagnose() {
  console.log('🔍 Diagnosing Horizontal Overflow & White Space on the Right...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const viewports = [1440, 1280, 1200, 1024, 768, 390];

  for (const width of viewports) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    const metrics = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const innerWidth = window.innerWidth;

      // Find overflowing elements
      const overflowingElements: any[] = [];
      const all = document.querySelectorAll('*');
      all.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 1) {
          overflowingElements.push({
            tag: el.tagName,
            id: el.id,
            className: el.className ? (typeof el.className === 'string' ? el.className.slice(0, 100) : '') : '',
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            diff: Math.round(rect.right - innerWidth),
          });
        }
      });

      return {
        innerWidth,
        clientWidth,
        scrollWidth,
        hasOverflow: scrollWidth > clientWidth,
        overflowDelta: scrollWidth - clientWidth,
        topOverflowing: overflowingElements.slice(0, 10),
      };
    });

    console.log(`\nViewport Width: ${width}px`);
    console.log(`ScrollWidth: ${metrics.scrollWidth}px | ClientWidth: ${metrics.clientWidth}px | Overflow: ${metrics.hasOverflow} (+${metrics.overflowDelta}px)`);
    if (metrics.topOverflowing.length > 0) {
      console.log('Top overflowing elements:');
      console.dir(metrics.topOverflowing, { depth: null });
    } else {
      console.log('No elements extending past window.innerWidth');
    }

    if (width === 1200 || width === 1440) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `qa-overflow-check-${width}.png`),
        fullPage: false,
      });
    }
  }

  await browser.close();
  console.log('\n✅ Diagnosis complete!');
}

diagnose().catch((err) => {
  console.error(err);
  process.exit(1);
});

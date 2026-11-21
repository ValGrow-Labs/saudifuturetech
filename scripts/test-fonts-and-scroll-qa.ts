import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('🧪 Starting Visual & Technical QA for Fonts and Smooth Scrolling...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err: any) => consoleErrors.push('PAGE_ERR: ' + String(err)));

  const fontRequests: string[] = [];
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('.woff') || url.includes('/fonts/')) {
      fontRequests.push(`${res.status()} ${url}`);
    }
  });

  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Inspect Computed Typography and Lenis instance
  const evaluation = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const h3 = document.querySelector('h3');
    const p = document.querySelector('p');
    const body = document.body;

    const lenis = (window as any).lenis;

    return {
      hasLenis: !!lenis,
      lenisVelocity: lenis ? lenis.velocity : null,
      lenisDuration: lenis ? lenis.options?.duration : null,
      h1Font: h1 ? window.getComputedStyle(h1).fontFamily : null,
      h2Font: h2 ? window.getComputedStyle(h2).fontFamily : null,
      h3Font: h3 ? window.getComputedStyle(h3).fontFamily : null,
      pFont: p ? window.getComputedStyle(p).fontFamily : null,
      bodyFont: window.getComputedStyle(body).fontFamily,
      htmlClasses: document.documentElement.className,
    };
  });

  console.log('\n=== COMPUTED TYPOGRAPHY & SMOOTH SCROLL ===');
  console.log('Lenis Active:', evaluation.hasLenis);
  console.log('H1 Font:', evaluation.h1Font);
  console.log('H2 Font:', evaluation.h2Font);
  console.log('H3 Font:', evaluation.h3Font);
  console.log('P Font:', evaluation.pFont);
  console.log('Body Font:', evaluation.bodyFont);
  console.log('HTML Classes:', evaluation.htmlClasses);

  console.log('\n=== FONT NETWORK RESPONSES ===');
  for (const f of fontRequests) {
    console.log('  ', f);
  }

  // 2. Capture Homepage Top Screenshot
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-typography-homepage.png'),
    fullPage: false,
  });
  console.log('   ✓ Saved qa-typography-homepage.png');

  // 3. Test Smooth Scrolling with Lenis
  console.log('\n🔄 Testing Lenis Smooth Scroll to Pillars section...');
  await page.evaluate(() => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo('#pillars-coverflow', { offset: -40, duration: 1.2 });
    }
  });

  await new Promise((r) => setTimeout(r, 1600));

  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('   ✓ Scrolled to Y position:', scrollY);

  const pillarsSection = await page.$('section[aria-label="Six Pillars of Coverage"]');
  if (pillarsSection) {
    await pillarsSection.screenshot({
      path: path.join(ARTIFACT_DIR, 'qa-typography-coverflow.png'),
    });
    console.log('   ✓ Saved qa-typography-coverflow.png');
  }

  // 4. Test Article Page Typography
  console.log('\n📖 Inspecting Article Page Typography...');
  await page.goto(
    'http://localhost:3000/article/arabic-ai-frontier-sdaia-allam-architecture-tokenization-benchmarks',
    { waitUntil: 'networkidle2' }
  );
  await new Promise((r) => setTimeout(r, 1000));

  const articleEval = await page.evaluate(() => {
    const title = document.querySelector('h1');
    const paragraph = document.querySelector('article p');
    return {
      titleFont: title ? window.getComputedStyle(title).fontFamily : null,
      paragraphFont: paragraph ? window.getComputedStyle(paragraph).fontFamily : null,
    };
  });
  console.log('Article Title Font:', articleEval.titleFont);
  console.log('Article Paragraph Font:', articleEval.paragraphFont);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-typography-article.png'),
    fullPage: false,
  });
  console.log('   ✓ Saved qa-typography-article.png');

  console.log('\nConsole Errors:', consoleErrors);
  await browser.close();
  console.log('🎉 QA Test Complete!');
}

main().catch(console.error);


import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function capture() {
  console.log('📸 Launching Puppeteer to capture Longreads-Inspired Redesign screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Homepage Screenshot
  console.log('1. Capturing Homepage (http://localhost:3000)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'longreads-redesign-homepage.png'),
    fullPage: false,
  });
  console.log('   ✓ longreads-redesign-homepage.png saved');

  // 2. Article Detail Screenshot
  console.log('2. Capturing Article Detail Page (/article/saudi-arabia-sovereign-compute-blueprint-allam)...');
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto('http://localhost:3000/article/saudi-arabia-sovereign-compute-blueprint-allam', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'longreads-redesign-article.png'),
    fullPage: false,
  });
  console.log('   ✓ longreads-redesign-article.png saved');

  // 3. Latest Stories Stream Screenshot
  console.log('3. Capturing Latest Stories Stream (/latest)...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/latest', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'longreads-redesign-latest.png'),
    fullPage: false,
  });
  console.log('   ✓ longreads-redesign-latest.png saved');

  // 4. Newsletter Executive Briefing Screenshot
  console.log('4. Capturing Newsletter Page (/newsletter)...');
  await page.goto('http://localhost:3000/newsletter', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'longreads-redesign-newsletter.png'),
    fullPage: false,
  });
  console.log('   ✓ longreads-redesign-newsletter.png saved');

  // 5. Search & Archive Screenshot
  console.log('5. Capturing Search & Archive Page (/search)...');
  await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'longreads-redesign-search.png'),
    fullPage: false,
  });
  console.log('   ✓ longreads-redesign-search.png saved');

  await browser.close();
  console.log('🎉 All Longreads-redesign screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});


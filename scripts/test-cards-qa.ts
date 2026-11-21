import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

  // 1. Opportunities cards
  await page.goto('http://localhost:3000/opportunities', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-opportunities-cards.png'),
    fullPage: false,
  });

  // Open the eligibility modal on the first card
  await page.evaluate(() => {
    const detailsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Details');
    (detailsBtn as HTMLElement)?.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-opportunities-modal.png'),
    fullPage: false,
  });

  // 2. Startups cards
  await page.goto('http://localhost:3000/startups', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-startups-cards.png'),
    fullPage: false,
  });

  // 3. Funding cards
  await page.goto('http://localhost:3000/funding', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollBy(0, 380));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-funding-cards.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('✅ Detailed card QA screenshots captured!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

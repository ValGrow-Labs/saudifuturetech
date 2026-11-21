import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('🚀 Running Hero Slideshow & Alignment QA capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050'],
  });

  const page = await browser.newPage();

  // 1. Desktop Hero View - Slide 1 (1440x1050)
  console.log('📸 Capturing Desktop Hero Slide 1 (1440x1050)...');
  await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500)); // allow count-up and typewriter to run

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-hero-slideshow-desktop-slide1.png'),
    fullPage: false,
  });

  // 2. Click Slide 2 (PEOPLE · THE KINGDOM) and capture transition
  console.log('📸 Clicking Slide 2 button to test interactive navigation...');
  const slideButtons = await page.$$('button[aria-label^="Slide 2"]');
  if (slideButtons.length > 0) {
    await slideButtons[0].click();
    await new Promise((r) => setTimeout(r, 1500)); // wait for cross-fade transition
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'qa-hero-slideshow-desktop-slide2.png'),
      fullPage: false,
    });
  }

  // 3. Mobile View (390x844)
  console.log('📸 Capturing Mobile Hero View (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-hero-slideshow-mobile.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('✅ Visual QA screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('🚀 Running Phase A Visual QA capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  const page = await browser.newPage();

  // 1. Desktop Homepage View (1440x1000)
  console.log('📸 Capturing Desktop Homepage Hero & Masthead (1440x1000)...');
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-phase-a-homepage-desktop.png'),
    fullPage: false,
  });

  // 2. Desktop Sovereign Pillar Navigator Grid (Scrolled to #sovereign-pillars)
  console.log('📸 Capturing Desktop Sovereign Pillar Navigator Grid...');
  await page.evaluate(() => {
    const el = document.getElementById('sovereign-pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, -80);
    }
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-phase-a-sovereign-pillars-desktop.png'),
    fullPage: false,
  });

  // 3. Mobile Homepage View (390x844)
  console.log('📸 Capturing Mobile Homepage Hero (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-phase-a-homepage-mobile.png'),
    fullPage: false,
  });

  // 4. Mobile Sovereign Pillar Navigator Grid
  console.log('📸 Capturing Mobile Sovereign Pillar Navigator Grid...');
  await page.evaluate(() => {
    const el = document.getElementById('sovereign-pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, -60);
    }
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-phase-a-sovereign-pillars-mobile.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('✅ Phase A Visual QA screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

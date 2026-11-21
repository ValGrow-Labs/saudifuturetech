import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function capture() {
  console.log('📸 Capturing Full-Bleed Transparent Hero Screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950'],
  });

  const page = await browser.newPage();

  // 1. Desktop Transparent Header at top (Slide 1)
  console.log('Capturing Desktop View - Slide 1 with Transparent Header...');
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-vision2030-hero-desktop-slide1.png'),
    clip: { x: 0, y: 0, width: 1440, height: 850 },
  });

  // 2. Click Slide 2 (PEOPLE · THE KINGDOM)
  console.log('Clicking Slide 2 (People · The Kingdom)...');
  const slide2Btn = await page.$('button[aria-label^="Slide 2"]');
  if (slide2Btn) {
    await slide2Btn.click();
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'qa-vision2030-hero-desktop-slide2.png'),
      clip: { x: 0, y: 0, width: 1440, height: 850 },
    });
  }

  // 3. Click Slide 4 (SEA · THE RED SEA COAST)
  console.log('Clicking Slide 4 (Sea · The Red Sea Coast)...');
  const slide4Btn = await page.$('button[aria-label^="Slide 4"]');
  if (slide4Btn) {
    await slide4Btn.click();
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'qa-vision2030-hero-desktop-slide4.png'),
      clip: { x: 0, y: 0, width: 1440, height: 850 },
    });
  }

  // 4. Test Scroll (Sticky Frosted Navbar)
  console.log('Testing Scroll for Sticky Frosted Glass Header...');
  await page.evaluate(() => window.scrollTo(0, 450));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-vision2030-hero-sticky-header.png'),
    clip: { x: 0, y: 0, width: 1440, height: 350 },
  });

  // 5. Mobile View (390x844)
  console.log('Capturing Mobile View (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-vision2030-hero-mobile.png'),
    clip: { x: 0, y: 0, width: 390, height: 750 },
  });

  await browser.close();
  console.log('✅ All screenshots captured successfully!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});

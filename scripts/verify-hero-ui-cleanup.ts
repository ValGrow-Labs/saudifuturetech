import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function verifyHeroCleanup() {
  console.log('🚀 Verifying Hero UI Cleanups...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Check if "ACTIVE" badge is in navigation
    const hasActiveBadge = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav ? nav.textContent?.includes('ACTIVE') || false : false;
    });
    console.log(`   "ACTIVE" badge near Opportunities: ${hasActiveBadge ? '❌ FOUND' : '✅ REMOVED'}`);

    // 2. Check if scene label ("PEOPLE · THE KINGDOM") is present
    const hasSceneLabel = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('PEOPLE · THE KINGDOM') || text.includes('BUSINESS · THE OFFICE') || text.includes('DESERT · THE FRONTIER');
    });
    console.log(`   Scene label tag (e.g. PEOPLE · THE KINGDOM): ${hasSceneLabel ? '❌ FOUND' : '✅ REMOVED'}`);

    // 3. Check if loading dashes / progress bar is present
    const hasProgressBar = await page.evaluate(() => {
      return Boolean(document.querySelector('[role="tablist"][aria-label="Hero Slides"]'));
    });
    console.log(`   Loading seconds / progress dots: ${hasProgressBar ? '❌ FOUND' : '✅ REMOVED'}`);

    // Capture screenshot
    const screenshotPath = path.join(ARTIFACT_DIR, 'qa-homepage-hero-cleaned.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`   📸 Captured screenshot: qa-homepage-hero-cleaned.png`);

    console.log('🎉 Verification completed successfully!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyHeroCleanup();

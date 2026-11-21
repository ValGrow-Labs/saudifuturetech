import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function runPhaseCQA() {
  console.log('🚀 Starting Comprehensive Phase C Visual & Functional QA...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // TEST 1: Startups Directory (Desktop 1440x1000)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 1] Testing /startups Directory (Desktop)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/startups`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify Title & Tagline
    const titleText = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Page Header: "${titleText}"`);

    // Count Startup Cards
    const initialCardCount = await page.$$eval('[data-testid="startup-card"]', (cards) => cards.length);
    console.log(`   Initial verified venture cards rendered: ${initialCardCount}`);

    // Take Desktop Directory Screenshot
    const dirScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-c-startups-directory-desktop.png');
    await page.screenshot({ path: dirScreenshotPath, fullPage: false });
    console.log(`   📸 Captured desktop directory screenshot: qa-phase-c-startups-directory-desktop.png`);

    // Test search filter
    console.log('   Testing search filter for "Tamara"...');
    const searchInput = await page.$('input[placeholder*="Search Saudi startups"]');
    if (searchInput) {
      await searchInput.type('Tamara');
      await new Promise((r) => setTimeout(r, 500));
      const filteredCount = await page.$$eval('[data-testid="startup-card"]', (cards) => cards.length);
      console.log(`   Cards visible after search for "Tamara": ${filteredCount}`);
      await searchInput.click({ count: 3 });
      await searchInput.press('Backspace');
      await new Promise((r) => setTimeout(r, 500));
    }

    // -------------------------------------------------------------
    // TEST 2: Startup Detail Dossier (Desktop 1440x1100)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 2] Testing /startup/tamara-fintech Detail Dossier (Desktop)...');
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/startup/tamara-fintech`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify Dossier elements
    const dossierTitle = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Dossier Loaded: "${dossierTitle}"`);

    const hasCRBadge = await page.evaluate(() => {
      return document.body.textContent?.includes('Commercial Registration (CR) Verified') || false;
    });
    console.log(`   CR Verification Badge Present: ${hasCRBadge ? '✅ YES' : '❌ NO'}`);

    const detailScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-c-startup-detail-desktop.png');
    await page.screenshot({ path: detailScreenshotPath, fullPage: false });
    console.log(`   📸 Captured startup dossier screenshot: qa-phase-c-startup-detail-desktop.png`);

    // -------------------------------------------------------------
    // TEST 3: Startups Directory Mobile View (390x844)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 3] Testing /startups Mobile Responsiveness (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/startups`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Check for horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   Mobile horizontal overflow detected: ${hasHorizontalOverflow ? '❌ YES' : '✅ NO (Perfect)'}`);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-c-startups-mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`   📸 Captured mobile directory screenshot: qa-phase-c-startups-mobile.png`);

    // -------------------------------------------------------------
    // TEST 4: Admin Startup Workflow (/admin/startups)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 4] Testing Admin Startup Management (/admin/startups)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    
    // Login as Super Admin
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Click Super Admin quick fill button
    const buttons = await page.$$('button');
    let quickFillClicked = false;
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Super Admin')) {
        await b.click();
        quickFillClicked = true;
        break;
      }
    }

    if (!quickFillClicked) {
      console.log('   Filling login form manually...');
      await page.type('input[type="email"]', 'admin@saudifuturetech.com');
      await page.type('input[type="password"]', 'AdminPassword2026!');
    }

    await new Promise((r) => setTimeout(r, 500));
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    await new Promise((r) => setTimeout(r, 1500));

    // Navigate to /admin/startups
    console.log('   Navigating to /admin/startups...');
    await page.goto(`${BASE_URL}/admin/startups`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    const adminHeader = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Admin Header: "${adminHeader}"`);

    const adminTableRows = await page.$$eval('tbody tr', (rows) => rows.length);
    console.log(`   Admin venture records in table: ${adminTableRows}`);

    const adminScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-c-admin-startups.png');
    await page.screenshot({ path: adminScreenshotPath, fullPage: false });
    console.log(`   📸 Captured admin startups management screenshot: qa-phase-c-admin-startups.png`);

    console.log('\n✅ All Phase C QA Tests Completed Successfully!');
  } catch (error) {
    console.error('❌ Phase C QA failed with error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runPhaseCQA().catch((err) => {
  console.error(err);
  process.exit(1);
});

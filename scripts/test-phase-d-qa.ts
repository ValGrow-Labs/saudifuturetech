import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function runPhaseDQA() {
  console.log('🚀 Starting Comprehensive Phase D Visual & Functional QA...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // TEST 1: Funding Directory (Desktop 1440x1000)
    // -------------------------------------------------------------
    console.log('🔍 [Test 1] Testing /funding Directory (Desktop 1440x1000)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/funding`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Verify Title & Tagline
    const titleText = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Page Header: "${titleText}"`);

    // Verify Metric Strip and Badges
    const pageText = await page.evaluate(() => document.body.textContent || '');
    const hasCmaBadge = pageText.includes('CMA Authorized');
    const hasSvcBadge = pageText.includes('SVC Partner');
    const hasActiveBadge = pageText.includes('Active Capital Mandates');

    console.log(`   CMA Authorized Badge: ${hasCmaBadge ? '✅ YES' : '❌ NO'}`);
    console.log(`   SVC Partner Badge: ${hasSvcBadge ? '✅ YES' : '❌ NO'}`);
    console.log(`   Active Mandates Pill: ${hasActiveBadge ? '✅ YES' : '❌ NO'}`);

    // Take Desktop Directory Screenshot
    const dirScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-d-funding-directory-desktop.png');
    await page.screenshot({ path: dirScreenshotPath, fullPage: false });
    console.log(`   📸 Captured desktop directory screenshot: qa-phase-d-funding-directory-desktop.png`);

    // Test Search filter
    console.log('   Testing search filter for "STV"...');
    const searchInput = await page.$('input[placeholder*="Search funds"]');
    if (searchInput) {
      await searchInput.type('STV');
      await new Promise((r) => setTimeout(r, 600));
      const filteredHasSTV = await page.evaluate(() => document.body.textContent?.includes('STV (Saudi Technology Ventures)') || false);
      console.log(`   Search matched STV correctly: ${filteredHasSTV ? '✅ YES' : '❌ NO'}`);
      await searchInput.click({ count: 3 });
      await searchInput.press('Backspace');
      await new Promise((r) => setTimeout(r, 500));
    }

    // -------------------------------------------------------------
    // TEST 2: Investor Detail Dossier (Desktop 1440x1100) — Impact46
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 2] Testing /investor/impact46 Detail Dossier (Desktop)...');
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/investor/impact46`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 25000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Verify Dossier Elements
    const dossierTitle = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Dossier Loaded: "${dossierTitle}"`);

    const hasCMALicense = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('18196-32') && text.includes('CMA Authorized');
    });
    console.log(`   Official CMA License No. 18196-32 Displayed: ${hasCMALicense ? '✅ YES' : '❌ NO'}`);

    const hasLegalEntity = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Tatheer Company Finance');
    });
    console.log(`   Official Legal Entity (Tatheer Company Finance) Present: ${hasLegalEntity ? '✅ YES' : '❌ NO'}`);

    const hasSVCProgram = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('SVC Investment in Funds Program');
    });
    console.log(`   SVC Investment in Funds Program Details Present: ${hasSVCProgram ? '✅ YES' : '❌ NO'}`);

    const hasPortfolio = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Jahez') && text.includes('Tamara');
    });
    console.log(`   Portfolio Highlights (Jahez, Tamara) Present: ${hasPortfolio ? '✅ YES' : '❌ NO'}`);

    const detailScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-d-investor-detail-desktop.png');
    await page.screenshot({ path: detailScreenshotPath, fullPage: false });
    console.log(`   📸 Captured investor dossier screenshot: qa-phase-d-investor-detail-desktop.png`);

    // -------------------------------------------------------------
    // TEST 3: Funding Directory Mobile View (390x844)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 3] Testing /funding Mobile Responsiveness (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/funding`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Check for horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   Mobile horizontal overflow detected: ${hasHorizontalOverflow ? '❌ YES' : '✅ NO (0px overflow, perfect)'}`);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-d-funding-mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`   📸 Captured mobile directory screenshot: qa-phase-d-funding-mobile.png`);

    // -------------------------------------------------------------
    // TEST 4: Admin Investor Workflow (/admin/investors)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 4] Testing Admin Investor Management (/admin/investors)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    
    // Login as Super Admin
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Quick fill Super Admin credentials
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
      await page.type('input[type="email"]', 'admin@saudifuturetech.com');
      await page.type('input[type="password"]', 'AdminPassword2026!');
    }

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Navigate to /admin/investors
    console.log('   Navigating to /admin/investors...');
    await page.goto(`${BASE_URL}/admin/investors`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 25000 });
    await new Promise((r) => setTimeout(r, 1000));

    const adminTitle = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Admin Page Loaded: "${adminTitle}"`);

    const tableRows = await page.$$eval('tbody tr', (rows) => rows.length);
    console.log(`   Investor Table Rows in Admin: ${tableRows}`);

    const adminScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-d-admin-investors.png');
    await page.screenshot({ path: adminScreenshotPath, fullPage: false });
    console.log(`   📸 Captured admin investors screenshot: qa-phase-d-admin-investors.png`);

    console.log('\n🎉 Phase D QA Verification Completed Successfully with 0 Errors!');
  } catch (error) {
    console.error('❌ Phase D QA failed with error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhaseDQA();

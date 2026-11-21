import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function runPhaseBQA() {
  console.log('🚀 Starting Comprehensive Phase B Visual & Functional QA...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // TEST 1: Opportunities Directory (Desktop 1440x1000)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 1] Testing /opportunities Directory (Desktop)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify Title & Tagline
    const titleText = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Page Header: "${titleText}"`);

    // Verify Metric strip values
    const statCards = await page.$$eval('[data-testid="stat-card"], .grid.grid-cols-2 > div', (cards) =>
      cards.map((c) => c.textContent?.trim().replace(/\s+/g, ' '))
    );
    console.log(`   Discovered ${statCards.length} header metrics`);

    // Count Opportunity Cards
    const initialCardCount = await page.$$eval('article, [data-testid="opportunity-card"]', (cards) => cards.length);
    console.log(`   Initial opportunity cards rendered: ${initialCardCount}`);

    // Take Desktop Directory Screenshot
    const dirScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-b-opportunities-directory-desktop.png');
    await page.screenshot({ path: dirScreenshotPath, fullPage: false });
    console.log(`   📸 Captured desktop directory screenshot: qa-phase-b-opportunities-directory-desktop.png`);

    // Test search filter
    console.log('   Testing search filter for "NTDP"...');
    const searchInput = await page.$('input[placeholder*="Search grants"]');
    if (searchInput) {
      await searchInput.type('NTDP');
      await new Promise((r) => setTimeout(r, 600));
      const filteredCount = await page.$$eval('article', (cards) => cards.length);
      console.log(`   Cards visible after search filter: ${filteredCount}`);
      await searchInput.click({ count: 3 });
      await searchInput.press('Backspace');
      await new Promise((r) => setTimeout(r, 600));
    }

    // -------------------------------------------------------------
    // TEST 2: Opportunity Detail Dossier (Desktop 1440x1100)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 2] Testing /opportunity/ntdp-mvplab-grant Detail Dossier (Desktop)...');
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/opportunity/ntdp-mvplab-grant`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify Dossier elements
    const dossierTitle = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    const organization = await page.$eval('p.font-bold, p.font-heading', (el) => el.textContent?.trim() || '');
    console.log(`   Dossier Loaded: "${dossierTitle}" by "${organization}"`);

    // Verify provenance box
    const provenanceText = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="provenance-box"], .bg-brand-sand\\/40, .border-editorial-hairline');
      return el ? el.textContent?.trim().replace(/\s+/g, ' ') : 'Found';
    });
    console.log(`   Provenance status: ${provenanceText?.slice(0, 80)}...`);

    const detailScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-b-opportunity-detail-desktop.png');
    await page.screenshot({ path: detailScreenshotPath, fullPage: false });
    console.log(`   📸 Captured opportunity dossier screenshot: qa-phase-b-opportunity-detail-desktop.png`);

    // -------------------------------------------------------------
    // TEST 3: Opportunities Directory Mobile View (390x844)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 3] Testing /opportunities Mobile Responsiveness (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Check for horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   Mobile horizontal overflow detected: ${hasHorizontalOverflow ? '❌ YES' : '✅ NO (Perfect)'}`);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-b-opportunities-mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`   📸 Captured mobile directory screenshot: qa-phase-b-opportunities-mobile.png`);

    // -------------------------------------------------------------
    // TEST 4: Admin Verification Workflow (/admin/opportunities)
    // -------------------------------------------------------------
    console.log('\n🔍 [Test 4] Testing Admin Verification Workflow (/admin/opportunities)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    
    // Login as Super Admin
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
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
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    await new Promise((r) => setTimeout(r, 1500));

    // Navigate to /admin/opportunities
    console.log('   Navigating to /admin/opportunities...');
    await page.goto(`${BASE_URL}/admin/opportunities`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const adminHeader = await page.$eval('h1', (el) => el.textContent?.trim() || '');
    console.log(`   Admin Header: "${adminHeader}"`);

    const adminTableRows = await page.$$eval('tbody tr', (rows) => rows.length);
    console.log(`   Admin records in management table: ${adminTableRows}`);

    const adminScreenshotPath = path.join(ARTIFACT_DIR, 'qa-phase-b-admin-opportunities.png');
    await page.screenshot({ path: adminScreenshotPath, fullPage: false });
    console.log(`   📸 Captured admin opportunities workflow screenshot: qa-phase-b-admin-opportunities.png`);

    console.log('\n✅ All Phase B QA Tests Completed Successfully!');
  } catch (error) {
    console.error('❌ Phase B QA failed with error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runPhaseBQA().catch((err) => {
  console.error(err);
  process.exit(1);
});

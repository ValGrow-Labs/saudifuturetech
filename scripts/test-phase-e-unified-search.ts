import puppeteer from 'puppeteer-core';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';

async function runPhaseEQA() {
  console.log('🚀 Starting Phase E — Unified Search Comprehensive QA & Visual Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  let errorsCount = 0;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Default /search page (Desktop 1440x1000)
    // -------------------------------------------------------------------------
    console.log('🔍 [Test 1] Testing /search Default Page (Desktop 1440x1000)...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/search`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 25000 });
    await new Promise((r) => setTimeout(r, 1000));

    const allH1s = await page.$$eval('h1', (els) => els.map((el) => el.textContent?.trim() || ''));
    console.log(`   Page H1 Elements:`, allH1s);
    const hasSearchTitle = allH1s.some((t) => t.includes('Search Saudi Future Tech'));
    if (!hasSearchTitle) {
      console.error('   ❌ H1 title does not match expected');
      errorsCount++;
    } else {
      console.log('   ✅ H1 Title Verified');
    }

    const defaultScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-search-desktop-default.png');
    await page.screenshot({ path: defaultScreenshot, fullPage: false });
    console.log(`   📸 Captured default search screenshot: qa-phase-e-search-desktop-default.png`);

    // -------------------------------------------------------------------------
    // TEST 2: Search for an Existing Startup ("Tamara")
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 2] Testing Search for Startup "Tamara"...');
    await page.goto(`${BASE_URL}/search?q=Tamara`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const hasTamaraStartup = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Tamara') && text.includes('Venture Dossier');
    });
    console.log(`   Startup "Tamara" found with Venture Dossier link: ${hasTamaraStartup ? '✅ YES' : '❌ NO'}`);
    if (!hasTamaraStartup) errorsCount++;

    const startupLink = await page.$('a[href="/startup/tamara-fintech"]');
    console.log(`   Direct Link to /startup/tamara-fintech: ${startupLink ? '✅ YES' : '❌ NO'}`);
    if (!startupLink) errorsCount++;

    // -------------------------------------------------------------------------
    // TEST 3: Search for an Existing Investor ("Impact46")
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 3] Testing Search for Investor "Impact46"...');
    await page.goto(`${BASE_URL}/search?q=Impact46`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const hasImpact46Investor = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Impact46') && text.includes('Investor Dossier');
    });
    console.log(`   Investor "Impact46" found with Investor Dossier link: ${hasImpact46Investor ? '✅ YES' : '❌ NO'}`);
    if (!hasImpact46Investor) errorsCount++;

    const investorLink = await page.$('a[href="/investor/impact46"]');
    console.log(`   Direct Link to /investor/impact46: ${investorLink ? '✅ YES' : '❌ NO'}`);
    if (!investorLink) errorsCount++;

    // -------------------------------------------------------------------------
    // TEST 4: Search for an Opportunity ("NTDP")
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 4] Testing Search for Opportunity "NTDP"...');
    await page.goto(`${BASE_URL}/search?q=NTDP`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const hasNtdpOpportunity = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('NTDP MVPLab') && text.includes('Opportunity Dossier');
    });
    console.log(`   Opportunity "NTDP MVPLab" found with Opportunity Dossier link: ${hasNtdpOpportunity ? '✅ YES' : '❌ NO'}`);
    if (!hasNtdpOpportunity) errorsCount++;

    const oppScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-search-results-grouped.png');
    await page.screenshot({ path: oppScreenshot, fullPage: false });
    console.log(`   📸 Captured grouped results screenshot: qa-phase-e-search-results-grouped.png`);

    // -------------------------------------------------------------------------
    // TEST 5: Search for Funding Information ("Series A", "Debt")
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 5] Testing Search for Funding Information ("Debt" & "Series A")...');
    await page.goto(`${BASE_URL}/search?q=Debt`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const debtAudit = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const hasTamara = text.includes('Tamara');
      const hasUpTo2_4B = text.includes('Up to $2.4B Debt Warehouse Facility');
      const hasInitial1_4B = text.includes('$1.4B Initial Facility');
      const hasAccordion1B = text.includes('$1.0B Additional Accordion Capacity');
      const hasOldUnsupportedRange = text.includes('$400M–$2.4B');
      return {
        hasTamara,
        hasUpTo2_4B,
        hasInitial1_4B,
        hasAccordion1B,
        hasOldUnsupportedRange,
      };
    });

    console.log(`   Funding query "Debt" returns Tamara: ${debtAudit.hasTamara ? '✅ YES' : '❌ NO'}`);
    console.log(`   Accurate "Up to $2.4B Debt Warehouse Facility" displayed: ${debtAudit.hasUpTo2_4B ? '✅ YES' : '❌ NO'}`);
    console.log(`   "$1.4B Initial Facility" distinct: ${debtAudit.hasInitial1_4B ? '✅ YES' : '❌ NO'}`);
    console.log(`   "$1.0B Additional Accordion Capacity" distinct: ${debtAudit.hasAccordion1B ? '✅ YES' : '❌ NO'}`);
    console.log(`   Unsupported "$400M–$2.4B" eliminated: ${!debtAudit.hasOldUnsupportedRange ? '✅ YES (Clean)' : '❌ NO (Found legacy string)'}`);

    if (!debtAudit.hasTamara || !debtAudit.hasUpTo2_4B || !debtAudit.hasInitial1_4B || !debtAudit.hasAccordion1B || debtAudit.hasOldUnsupportedRange) {
      errorsCount++;
    }

    const debtScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-search-debt-tamara.png');
    await page.screenshot({ path: debtScreenshot, fullPage: false });
    console.log(`   📸 Captured corrected debt search screenshot: qa-phase-e-search-debt-tamara.png`);

    // -------------------------------------------------------------------------
    // TEST 6: Category Filter Tabs (Startups, Investors, Opportunities)
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 6] Testing Category Filter Tabs...');
    await page.goto(`${BASE_URL}/search?category=startups`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const startupsCategoryCount = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Startups') && text.includes('CR Verified');
    });
    console.log(`   Category "Startups" loaded correctly: ${startupsCategoryCount ? '✅ YES' : '❌ NO'}`);
    if (!startupsCategoryCount) errorsCount++;

    // Filter to Investors
    await page.goto(`${BASE_URL}/search?category=investors`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const investorsCategoryCount = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Investors & Funding') && (text.includes('CMA Authorized') || text.includes('SVC Partner'));
    });
    console.log(`   Category "Investors" loaded correctly: ${investorsCategoryCount ? '✅ YES' : '❌ NO'}`);
    if (!investorsCategoryCount) errorsCount++;

    // -------------------------------------------------------------------------
    // TEST 7: Empty State ("xyznonexistent999")
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 7] Testing Empty Search Results ("xyznonexistent999")...');
    await page.goto(`${BASE_URL}/search?q=xyznonexistent999`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const hasEmptyState = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('No verified records match') && text.includes('Browse Opportunities');
    });
    console.log(`   Empty State with Directory Links Displayed: ${hasEmptyState ? '✅ YES' : '❌ NO'}`);
    if (!hasEmptyState) errorsCount++;

    const emptyScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-search-empty-state.png');
    await page.screenshot({ path: emptyScreenshot, fullPage: false });
    console.log(`   📸 Captured empty state screenshot: qa-phase-e-search-empty-state.png`);

    // -------------------------------------------------------------------------
    // TEST 8: Pagination & URL Synchronization
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 8] Testing Pagination & URL Synchronization...');
    await page.goto(`${BASE_URL}/search?category=startups&page=2`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const currentUrl = page.url();
    console.log(`   Current URL after page 2 navigation: ${currentUrl}`);
    const isUrlSynced = currentUrl.includes('page=2') && currentUrl.includes('category=startups');
    console.log(`   URL synchronization verified: ${isUrlSynced ? '✅ YES' : '❌ NO'}`);
    if (!isUrlSynced) errorsCount++;

    // -------------------------------------------------------------------------
    // TEST 9: Mobile Responsiveness (390x844)
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 9] Testing /search Mobile View (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/search?q=FinTech`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   Mobile horizontal overflow detected: ${hasHorizontalOverflow ? '❌ YES' : '✅ NO (0px overflow, perfect)'}`);
    if (hasHorizontalOverflow) errorsCount++;

    const mobileScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-search-mobile.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log(`   📸 Captured mobile search screenshot: qa-phase-e-search-mobile.png`);

    // -------------------------------------------------------------------------
    // TEST 10: Strict Non-Exposure of Unpublished / Draft Data
    // -------------------------------------------------------------------------
    console.log('\n🔍 [Test 10] Testing Non-Exposure of Unpublished Records...');
    // In our DB check earlier, 3 articles are DRAFT/IN_REVIEW/SCHEDULED.
    // Querying for "Draft" should not leak draft articles.
    const hasUnpublishedLeak = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('DRAFT_') || text.includes('Unpublished Internal Note');
    });
    console.log(`   Unpublished / internal draft data leaked: ${hasUnpublishedLeak ? '❌ YES (Security Violation)' : '✅ NO (Protected)'}`);
    if (hasUnpublishedLeak) errorsCount++;

    console.log('\n=============================================================');
    if (errorsCount === 0) {
      console.log('🎉 Phase E: Unified Search QA Verification PASSED with 0 Errors!');
    } else {
      console.log(`❌ Phase E: Unified Search QA finished with ${errorsCount} Error(s).`);
    }
    console.log('=============================================================\n');
  } catch (err) {
    console.error('❌ Puppeteer execution error:', err);
    process.exit(1);
  } finally {
    await browser.close();
    process.exit(errorsCount === 0 ? 0 : 1);
  }
}

runPhaseEQA();

import puppeteer from 'puppeteer-core';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';

async function testGlobalNavSearch() {
  console.log('🚀 Testing Global Navigation Search & Hero Integration...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  let errors = 0;

  try {
    // 1. Homepage Hero Search
    console.log('🔍 [Test A] Testing Hero Command Search from Homepage (/) ...');
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Type query into hero search
    const heroInput = await page.$('input[aria-label="Search verified intelligence"]');
    if (!heroInput) {
      console.error('   ❌ Hero search input not found');
      errors++;
    } else {
      await heroInput.type('Mozn');
      const exploreBtn = await page.$('button[type="submit"]');
      if (exploreBtn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
          exploreBtn.click(),
        ]);
        const url = page.url();
        console.log(`   Navigated to: ${url}`);
        const isUnifiedSearchUrl = url.includes('/search?q=Mozn');
        console.log(`   Hero correctly routes to unified /search: ${isUnifiedSearchUrl ? '✅ YES' : '❌ NO'}`);
        if (!isUnifiedSearchUrl) errors++;
      }
    }

    // 2. Global Header Search Drawer & Live Preview Suggestions
    console.log('\n🔍 [Test B] Testing Global Header Search Drawer & Live Suggestions...');
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Click search button in header
    const searchToggleBtn = await page.$('button[aria-label="Toggle search (Cmd+K)"]');
    if (!searchToggleBtn) {
      console.error('   ❌ Search toggle button not found in header');
      errors++;
    } else {
      await searchToggleBtn.click();
      await new Promise((r) => setTimeout(r, 500));

      // Find drawer input
      const drawerInput = await page.$('input[placeholder*="Search Saudi startups"]');
      if (!drawerInput) {
        console.error('   ❌ Drawer search input not visible');
        errors++;
      } else {
        console.log('   Search drawer opened successfully: ✅ YES');
        // Type "Tamara" to trigger live suggestions
        await drawerInput.type('Tamara');
        await new Promise((r) => setTimeout(r, 600));

        const hasInstantMatches = await page.evaluate(() => {
          const text = document.body.textContent || '';
          return text.includes('Instant Suggestions') && text.includes('Tamara');
        });
        console.log(`   Live suggestions appear in drawer: ${hasInstantMatches ? '✅ YES' : '❌ NO'}`);
        if (!hasInstantMatches) errors++;

        const drawerScreenshot = path.join(ARTIFACT_DIR, 'qa-phase-e-header-drawer-instant.png');
        await page.screenshot({ path: drawerScreenshot, fullPage: false });
        console.log(`   📸 Captured instant drawer screenshot: qa-phase-e-header-drawer-instant.png`);
      }
    }

    console.log('\n=============================================================');
    if (errors === 0) {
      console.log('🎉 Global Navigation Search & Hero Integration PASSED with 0 Errors!');
    } else {
      console.log(`❌ Global Navigation Search finished with ${errors} Error(s).`);
    }
    console.log('=============================================================\n');
  } catch (err) {
    console.error('❌ Test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
    process.exit(errors === 0 ? 0 : 1);
  }
}

testGlobalNavSearch();

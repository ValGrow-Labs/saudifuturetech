import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('📸 Launching Puppeteer to capture Phase 5 screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Login Page
  console.log('1. Navigating to Login Page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase5-admin-login.png'),
    fullPage: false,
  });
  console.log('   ✓ phase5-admin-login.png saved');

  // 2. Perform Login as Super Admin
  console.log('2. Logging in as Super Admin...');
  await page.type('#email', 'admin@saudifuturetech.com');
  await page.type('#password', 'AdminPassword2026!');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log('   ✓ Logged in! Current URL:', page.url());

  // 3. Capture Admin Dashboard
  console.log('3. Capturing Admin Dashboard...');
  await page.waitForSelector('main', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase5-admin-dashboard.png'),
    fullPage: false,
  });
  console.log('   ✓ phase5-admin-dashboard.png saved');

  // 4. Capture Articles Management Table
  console.log('4. Navigating to Articles List...');
  await page.goto('http://localhost:3000/admin/articles', { waitUntil: 'networkidle2' });
  console.log('   Current URL after navigating to /admin/articles:', page.url());
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase5-admin-articles.png'),
    fullPage: false,
  });
  console.log('   ✓ phase5-admin-articles.png saved');

  // 5. Capture Article Editor
  console.log('5. Navigating to Article Editor...');
  await page.goto('http://localhost:3000/admin/articles/new', { waitUntil: 'networkidle2' });
  console.log('   Current URL after navigating to /admin/articles/new:', page.url());
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase5-admin-editor.png'),
    fullPage: false,
  });
  console.log('   ✓ phase5-admin-editor.png saved');

  // 6. Capture Mobile View of Article Editor
  console.log('6. Capturing Mobile View...');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase5-admin-mobile.png'),
    fullPage: false,
  });
  console.log('   ✓ phase5-admin-mobile.png saved');

  await browser.close();
  console.log('🎉 All Phase 5 screenshots captured successfully!');
}

main().catch((err) => {
  console.error('❌ Screenshot capture error:', err);
  process.exit(1);
});

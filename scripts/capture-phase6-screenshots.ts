import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('📸 Launching Puppeteer to capture Phase 6 screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Capture Public Newsletter Landing Page
  console.log('1. Capturing Public Newsletter Page (/newsletter)...');
  await page.goto('http://localhost:3000/newsletter', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-newsletter-public.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-newsletter-public.png saved');

  // 2. Perform Login as Super Admin
  console.log('2. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.type('#email', 'admin@saudifuturetech.com');
  await page.type('#password', 'AdminPassword2026!');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log('   ✓ Logged in! Current URL:', page.url());

  // 3. Capture Phase 6 Enhanced Admin Dashboard
  console.log('3. Capturing Enhanced Admin Dashboard (/admin)...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-admin-dashboard.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-admin-dashboard.png saved');

  // 4. Capture Articles Management - Scheduled Tab
  console.log('4. Capturing Scheduled Articles Tab (/admin/articles?status=SCHEDULED)...');
  await page.goto('http://localhost:3000/admin/articles?status=SCHEDULED', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-admin-articles-scheduled.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-admin-articles-scheduled.png saved');

  // 5. Capture Article Editor with Review History Timeline
  console.log('5. Capturing Article Editor with Audit History (/admin/articles/art-draft-test/edit)...');
  await page.goto('http://localhost:3000/admin/articles/art-draft-test/edit', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-admin-editor-history.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-admin-editor-history.png saved');

  // 6. Capture Newsletter Subscribers Management
  console.log('6. Capturing Subscriber Management (/admin/subscribers)...');
  await page.goto('http://localhost:3000/admin/subscribers', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-admin-subscribers.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-admin-subscribers.png saved');

  // 7. Capture Newsletter Campaign Preview Canvas
  console.log('7. Capturing Campaign Email Preview (/admin/campaigns/camp-draft-01/preview)...');
  await page.goto('http://localhost:3000/admin/campaigns/camp-draft-01/preview', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phase6-admin-campaign-preview.png'),
    fullPage: false,
  });
  console.log('   ✓ phase6-admin-campaign-preview.png saved');

  await browser.close();
  console.log('🎉 All Phase 6 screenshots captured successfully!');
}

main().catch((err) => {
  console.error('❌ Phase 6 screenshot capture error:', err);
  process.exit(1);
});


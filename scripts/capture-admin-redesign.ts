import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('📸 Launching Puppeteer to capture Admin Dashboard Redesign screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Capture Redesigned Login Page
  console.log('1. Capturing Admin Login Page (/admin/login)...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin-redesign-login.png'),
    fullPage: false,
  });
  console.log('   ✓ admin-redesign-login.png saved');

  // 2. Perform Login
  console.log('2. Performing Super Admin Login...');
  await page.type('#email', 'admin@saudifuturetech.com');
  await page.type('#password', 'AdminPassword2026!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log('   ✓ Logged in! Current URL:', page.url());

  // 3. Capture Redesigned Admin Dashboard (Matching the user image!)
  console.log('3. Capturing Redesigned Admin Dashboard (/admin)...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin-redesign-dashboard.png'),
    fullPage: false,
  });
  console.log('   ✓ admin-redesign-dashboard.png saved');

  // 4. Capture Redesigned Articles Management Page
  console.log('4. Capturing Redesigned Articles Page (/admin/articles)...');
  await page.goto('http://localhost:3000/admin/articles', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin-redesign-articles.png'),
    fullPage: false,
  });
  console.log('   ✓ admin-redesign-articles.png saved');

  await browser.close();
  console.log('🎉 Admin Redesign screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Failed to capture admin screenshots:', err);
  process.exit(1);
});


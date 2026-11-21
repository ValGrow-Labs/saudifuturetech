const puppeteer = require('puppeteer-core');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });

  // Click Super Admin quick fill button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Super Admin')) {
      await b.click();
      break;
    }
  }

  // Wait a small moment for form fields to populate
  await new Promise((r) => setTimeout(r, 400));

  // Submit form
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);

  console.log('Logged in successfully, current URL:', page.url());

  // Wait for dashboard data to render
  await page.waitForSelector('h1');

  // Capture screenshot of redesigned Admin Dashboard
  const screenshotPath =
    '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/redesigned-admin-dashboard.png';
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  await browser.close();
  console.log('Redesigned admin screenshot saved successfully to:', screenshotPath);
}

capture().catch(console.error);

import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('📸 Launching Puppeteer to capture Minimal Pillars section...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Find the Editorial Pillars section element
  const section = await page.$('section[aria-label="Editorial Pillars"]');
  if (section) {
    await section.screenshot({
      path: path.join(ARTIFACT_DIR, 'minimal-pillars-section.png'),
    });
    console.log('   ✓ minimal-pillars-section.png saved');
  } else {
    console.error('Section not found');
  }

  await browser.close();
}

main().catch(console.error);


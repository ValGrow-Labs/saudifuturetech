import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('🚀 Running Stage 3 visual QA capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

  // 1. Opportunity Detail Page (NTDP MVPLab)
  console.log('📸 Capturing /opportunity/ntdp-mvplab-grant...');
  await page.goto('http://localhost:3000/opportunity/ntdp-mvplab-grant', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-stage3-opportunity-detail.png'),
    fullPage: false,
  });

  // 2. Startup Detail Page (Mozn)
  console.log('📸 Capturing /startup/mozn-ai...');
  await page.goto('http://localhost:3000/startup/mozn-ai', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-stage3-startup-detail.png'),
    fullPage: false,
  });

  // 3. Unified Global Search (/search?q=SAMA)
  console.log('📸 Capturing /search?q=SAMA...');
  await page.goto('http://localhost:3000/search?q=SAMA', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-stage3-unified-search.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('✅ Stage 3 QA screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

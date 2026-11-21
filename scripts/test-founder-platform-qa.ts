import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('🚀 Starting Puppeteer QA capture for Founder Intelligence Platform...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Homepage
  console.log('📸 Capturing Homepage (Founder Command Terminal & Opportunity Radar)...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-homepage-founder-terminal.png'),
    fullPage: false,
  });

  // Scroll down to Cover Flow
  await page.evaluate(() => window.scrollBy(0, 1400));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-homepage-coverflow-pillars.png'),
    fullPage: false,
  });

  // 2. Opportunities Hub
  console.log('📸 Capturing Opportunities Hub (/opportunities)...');
  await page.goto('http://localhost:3000/opportunities', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-opportunities-hub.png'),
    fullPage: false,
  });

  // 3. Startups Directory
  console.log('📸 Capturing Startups Directory (/startups)...');
  await page.goto('http://localhost:3000/startups', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-startups-directory.png'),
    fullPage: false,
  });

  // 4. Funding Directory
  console.log('📸 Capturing Funding Directory (/funding)...');
  await page.goto('http://localhost:3000/funding', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'qa-funding-directory.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('✅ All QA screenshots captured successfully!');
}

run().catch((e) => {
  console.error('QA capture error:', e);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';

async function testCoverflow() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err: any) => consoleErrors.push('PAGE_ERR: ' + String(err)));

  // 1. Desktop Test (1440x950)
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const section = await page.$('section[aria-label="Six Pillars of Coverage"]');
  if (!section) {
    throw new Error('Six Pillars of Coverage section not found!');
  }

  // Scroll section into view
  await section.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await new Promise(r => setTimeout(r, 800));

  await section.screenshot({
    path: '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/coverflow-white-desk01.png'
  });
  console.log('Saved coverflow-white-desk01.png');

  // Click Next arrow
  const nextBtn = await page.$('button[aria-label="Next Desk"]');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 700));
    await section.screenshot({
      path: '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/coverflow-white-desk02.png'
    });
    console.log('Saved coverflow-white-desk02.png');
  }

  // 2. Mobile Test (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 800));
  await section.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await new Promise(r => setTimeout(r, 600));
  await section.screenshot({
    path: '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/coverflow-white-mobile.png'
  });
  console.log('Saved coverflow-white-mobile.png');

  console.log('Console errors:', consoleErrors);
  await browser.close();
}

testCoverflow().catch(console.error);

import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VIEWPORT_WIDTHS = [
  320, 360, 375, 390, 414, 480, 
  640, 768, 820, 912, 1024, 1100, 
  1200, 1280, 1366, 1440, 1536, 1600, 1920
];

async function runTest() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('🧪 Testing all 19 viewports for horizontal overflow...\n');

  let failedCount = 0;

  for (const width of VIEWPORT_WIDTHS) {
    await page.setViewport({ width, height: 850, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const result = await page.evaluate((w) => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientW = docEl.clientWidth;
      const hasOverflow = scrollW > clientW;

      const culprits: any[] = [];
      if (hasOverflow) {
        document.querySelectorAll('*').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > w + 0.5) {
            culprits.push({
              tag: el.tagName,
              class: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
              right: Math.round(rect.right),
              diff: Math.round(rect.right - w),
            });
          }
        });
      }

      return {
        w,
        scrollW,
        clientW,
        hasOverflow,
        diff: scrollW - clientW,
        topCulprits: culprits.slice(0, 5),
      };
    }, width);

    if (result.hasOverflow) {
      failedCount++;
      console.log(`❌ FAIL [${width}px]: scrollWidth=${result.scrollW}px (Overflow +${result.diff}px)`);
      if (result.topCulprits.length > 0) {
        console.log('   Culprits:', JSON.stringify(result.topCulprits));
      }
    } else {
      console.log(`✅ PASS [${width}px]: scrollWidth=${result.scrollW}px (Exact match)`);
    }
  }

  await browser.close();
  console.log(`\n========================================`);
  console.log(`Results: ${VIEWPORT_WIDTHS.length - failedCount}/${VIEWPORT_WIDTHS.length} Passed`);
  if (failedCount > 0) {
    console.log(`⚠️  ${failedCount} viewports failed with horizontal overflow!`);
  } else {
    console.log(`🎉 ALL viewports passed with 0px horizontal overflow!`);
  }
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

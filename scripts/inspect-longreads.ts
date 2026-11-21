import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('🔍 Launching headless Chrome to analyze https://longreads.com/ ...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log('1. Navigating to https://longreads.com/ ...');
  await page.goto('https://longreads.com/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Screenshot homepage
  const homepageScreenshotPath = path.join(ARTIFACT_DIR, 'longreads-homepage.png');
  await page.screenshot({ path: homepageScreenshotPath, fullPage: false });
  console.log('   ✓ Saved homepage screenshot:', homepageScreenshotPath);

  // Extract detailed styles from homepage
  const designData = await page.evaluate(() => {
    function getStyles(el: Element | null, props: string[]) {
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      const res: Record<string, string> = {};
      for (const p of props) {
        res[p] = computed.getPropertyValue(p);
      }
      return res;
    }

    const bodyStyles = getStyles(document.body, [
      'background-color',
      'color',
      'font-family',
      'font-size',
      'line-height',
    ]);

    const header = document.querySelector('header') || document.querySelector('.site-header') || document.querySelector('nav');
    const headerStyles = getStyles(header, [
      'background-color',
      'border-bottom',
      'border-bottom-color',
      'border-bottom-width',
      'padding',
      'margin',
      'position',
    ]);

    // Headings
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const h3 = document.querySelector('h3');
    const links = document.querySelector('a');

    const h1Styles = getStyles(h1, [
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing',
      'color',
    ]);

    const h2Styles = getStyles(h2, [
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing',
      'color',
    ]);

    const h3Styles = getStyles(h3, [
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'color',
    ]);

    const linkStyles = getStyles(links, ['color', 'text-decoration', 'font-family']);

    // Find main article elements
    const articles = Array.from(document.querySelectorAll('article')).slice(0, 5).map((art) => {
      const headingEl = art.querySelector('h1, h2, h3, h4');
      const excerptEl = art.querySelector('p, .entry-summary, .post-excerpt, .excerpt');
      const bylineEl = art.querySelector('.byline, .author, time, .entry-meta, .post-meta');
      const categoryEl = art.querySelector('.category, .tag, .entry-category, [rel="category tag"]');
      const img = art.querySelector('img');

      return {
        title: headingEl?.textContent?.trim() || '',
        titleStyles: getStyles(headingEl, ['font-family', 'font-size', 'font-weight', 'line-height', 'color']),
        excerptText: excerptEl?.textContent?.trim()?.slice(0, 100) || '',
        excerptStyles: getStyles(excerptEl, ['font-family', 'font-size', 'line-height', 'color']),
        bylineText: bylineEl?.textContent?.trim() || '',
        bylineStyles: getStyles(bylineEl, ['font-family', 'font-size', 'color', 'text-transform']),
        categoryText: categoryEl?.textContent?.trim() || '',
        categoryStyles: getStyles(categoryEl, ['font-family', 'font-size', 'color', 'text-transform', 'letter-spacing']),
        imageSrc: img?.src || '',
        imageStyles: getStyles(img, ['width', 'height', 'aspect-ratio', 'object-fit', 'border-radius']),
      };
    });

    // Check containers and layout width
    const mainContainer = document.querySelector('main') || document.querySelector('#content') || document.querySelector('.site-content');
    const containerStyles = getStyles(mainContainer, ['max-width', 'width', 'padding', 'margin']);

    // Check navigation items
    const navItems = Array.from(document.querySelectorAll('header nav a, .nav-menu a, .menu a')).map((a) => ({
      text: a.textContent?.trim(),
      href: (a as HTMLAnchorElement).href,
      styles: getStyles(a, ['font-family', 'font-size', 'font-weight', 'text-transform', 'letter-spacing', 'color']),
    }));

    // Find article link to inspect single article page
    const firstArticleLink = (document.querySelector('article a[href*="/202"], article h2 a, .entry-title a') as HTMLAnchorElement)?.href;

    return {
      bodyStyles,
      headerStyles,
      h1Styles,
      h2Styles,
      h3Styles,
      linkStyles,
      containerStyles,
      articles,
      navItems: navItems.slice(0, 10),
      firstArticleLink,
    };
  });

  console.log('2. Design data from homepage:');
  console.log(JSON.stringify(designData, null, 2));

  // If we found an article link, navigate and inspect article page
  if (designData.firstArticleLink) {
    console.log(`3. Navigating to article: ${designData.firstArticleLink} ...`);
    await page.goto(designData.firstArticleLink, { waitUntil: 'networkidle2', timeout: 30000 });

    const articleScreenshotPath = path.join(ARTIFACT_DIR, 'longreads-article.png');
    await page.screenshot({ path: articleScreenshotPath, fullPage: false });
    console.log('   ✓ Saved article screenshot:', articleScreenshotPath);

    const articleData = await page.evaluate(() => {
      function getStyles(el: Element | null, props: string[]) {
        if (!el) return null;
        const computed = window.getComputedStyle(el);
        const res: Record<string, string> = {};
        for (const p of props) {
          res[p] = computed.getPropertyValue(p);
        }
        return res;
      }

      const h1 = document.querySelector('h1, .entry-title');
      const bodyPara = document.querySelector('article p, .entry-content p');
      const contentContainer = document.querySelector('.entry-content, article .content, .post-content');
      const blockquote = document.querySelector('blockquote');

      return {
        articleTitle: h1?.textContent?.trim(),
        titleStyles: getStyles(h1, ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color']),
        contentContainerStyles: getStyles(contentContainer, ['max-width', 'width', 'margin', 'padding']),
        paragraphStyles: getStyles(bodyPara, ['font-family', 'font-size', 'line-height', 'color', 'margin-bottom']),
        blockquoteStyles: getStyles(blockquote, ['font-family', 'font-size', 'font-style', 'border-left', 'padding', 'margin']),
      };
    });

    console.log('4. Article page design data:');
    console.log(JSON.stringify(articleData, null, 2));
  }

  await browser.close();
  console.log('🎉 Longreads design inspection complete!');
}

main().catch((err) => {
  console.error('❌ Error inspecting Longreads:', err);
  process.exit(1);
});


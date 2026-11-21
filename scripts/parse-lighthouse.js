const fs = require('fs');

const pages = ['home', 'article', 'category', 'latest'];

console.log('\n===============================================================');
console.log('📊 LIGHTHOUSE AUDIT RESULTS (Local Development Server)');
console.log('===============================================================\n');

for (const name of pages) {
  const filePath = `/tmp/lh-reports/${name}.json`;
  if (!fs.existsSync(filePath)) {
    console.log(`[!] Report missing for ${name}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const cats = data.categories;
  const audits = data.audits;

  console.log(`--- Page: ${name.toUpperCase()} (${data.requestedUrl}) ---`);
  console.log(`  Performance:    ${Math.round(cats.performance.score * 100)} / 100`);
  console.log(`  Accessibility:  ${Math.round(cats.accessibility.score * 100)} / 100`);
  console.log(`  Best Practices: ${Math.round(cats['best-practices'].score * 100)} / 100`);
  console.log(`  SEO:            ${Math.round(cats.seo.score * 100)} / 100`);
  console.log(`  Metrics:`);
  console.log(`    FCP: ${audits['first-contentful-paint']?.displayValue || 'N/A'}`);
  console.log(`    LCP: ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`);
  console.log(`    TBT: ${audits['total-blocking-time']?.displayValue || 'N/A'}`);
  console.log(`    CLS: ${audits['cumulative-layout-shift']?.displayValue || 'N/A'}`);
  console.log(`    Speed Index: ${audits['speed-index']?.displayValue || 'N/A'}\n`);
}


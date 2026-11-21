import prisma from '../src/lib/prisma';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { getBaseUrl, getCanonicalUrl, DEFAULT_SEO } from '../src/lib/seo/config';
import { serializeJsonLd } from '../src/lib/seo/json-ld';
import nextConfig from '../next.config';
import {
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
  canManageUsers,
  canManageAuthors,
  canManageTaxonomy,
  AuthenticatedUser,
} from '../src/lib/auth/guard';
import { UserRole, ArticleStatus, SubscriberStatus } from '@prisma/client';
import { checkNewsletterRateLimit, recordNewsletterAttempt } from '../src/lib/newsletter/rate-limit';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

async function runPhase7TestSuite() {
  console.log('===============================================================');
  console.log('🧪 SAUDI FUTURE TECH — PHASE 7: SEO, PERFORMANCE & SECURITY TEST');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // SECTION 1: TECHNICAL SEO — CANONICAL URLS & BASE CONFIGURATION
  // -------------------------------------------------------------------------
  console.log('--- SECTION 1: Technical SEO & Canonical URLs ---');
  const baseUrl = getBaseUrl();
  assert(baseUrl.startsWith('http'), 'Base URL must start with http/https', baseUrl);
  assert(!baseUrl.endsWith('/'), 'Base URL must not have a trailing slash', baseUrl);

  const homeCanonical = getCanonicalUrl('/');
  assert(homeCanonical === baseUrl, 'Root canonical URL must match baseUrl without trailing slash');

  const articleCanonical = getCanonicalUrl('/article/saudi-sovereign-compute');
  assert(
    articleCanonical === `${baseUrl}/article/saudi-sovereign-compute`,
    'Article canonical URL must match normalized path'
  );

  const dirtyPathCanonical = getCanonicalUrl('///category//ai-deep-tech///');
  assert(
    dirtyPathCanonical === `${baseUrl}/category/ai-deep-tech`,
    'Canonical URL generator must normalize consecutive and trailing slashes'
  );

  assert(DEFAULT_SEO.siteName === 'Saudi Future Tech', 'DEFAULT_SEO siteName must be "Saudi Future Tech"');
  assert(Boolean(DEFAULT_SEO.description), 'DEFAULT_SEO must have an editorial description');
  assert(DEFAULT_SEO.social.twitter === '@SaudiFutureTech', 'DEFAULT_SEO Twitter handle must be set');

  // -------------------------------------------------------------------------
  // SECTION 2: DYNAMIC XML SITEMAP & DRAFT EXCLUSION
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Dynamic XML Sitemap Generation ---');
  const sitemapEntries = await sitemap();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 0, 'Sitemap must return an array of URL entries');

  const sitemapUrls = sitemapEntries.map((e) => e.url);

  // 1. Verify static public routes
  assert(sitemapUrls.includes(baseUrl), 'Sitemap must include homepage');
  assert(sitemapUrls.includes(`${baseUrl}/latest`), 'Sitemap must include /latest archive');
  assert(sitemapUrls.includes(`${baseUrl}/about`), 'Sitemap must include /about page');
  assert(sitemapUrls.includes(`${baseUrl}/newsletter`), 'Sitemap must include /newsletter page');

  // 2. Verify excluded private / sensitive routes
  assert(!sitemapUrls.some((u) => u.includes('/admin')), 'Sitemap must strictly exclude /admin routes');
  assert(!sitemapUrls.some((u) => u.includes('/login')), 'Sitemap must strictly exclude /login routes');
  assert(!sitemapUrls.some((u) => u.includes('/preview')), 'Sitemap must strictly exclude /preview routes');
  assert(!sitemapUrls.some((u) => u.includes('/search')), 'Sitemap must strictly exclude /search result routes');
  assert(!sitemapUrls.some((u) => u.includes('/api/')), 'Sitemap must strictly exclude API routes');
  assert(!sitemapUrls.some((u) => u.includes('/unsubscribe')), 'Sitemap must strictly exclude /unsubscribe');

  // 3. Verify database-backed published articles vs draft exclusion
  const publishedArticles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: { slug: true },
  });
  const unpublishedArticles = await prisma.article.findMany({
    where: { status: { not: ArticleStatus.PUBLISHED } },
    select: { slug: true, status: true },
  });

  let allPublishedIncluded = true;
  for (const pub of publishedArticles) {
    const expectedUrl = `${baseUrl}/article/${pub.slug}`;
    if (!sitemapUrls.includes(expectedUrl)) {
      allPublishedIncluded = false;
      break;
    }
  }
  assert(allPublishedIncluded, `All ${publishedArticles.length} published articles must be in sitemap`);

  let allUnpublishedExcluded = true;
  for (const unpub of unpublishedArticles) {
    const forbiddenUrl = `${baseUrl}/article/${unpub.slug}`;
    if (sitemapUrls.includes(forbiddenUrl)) {
      allUnpublishedExcluded = false;
      console.error(`Leaked unpublished story in sitemap: ${forbiddenUrl} (status: ${unpub.status})`);
      break;
    }
  }
  assert(
    allUnpublishedExcluded,
    `All ${unpublishedArticles.length} unpublished articles (DRAFT, IN_REVIEW, SCHEDULED, ARCHIVED) excluded from sitemap`
  );

  // 4. Verify valid lastModified timestamps
  const invalidDateEntries = sitemapEntries.filter((e) => !e.lastModified || isNaN(new Date(e.lastModified).getTime()));
  assert(invalidDateEntries.length === 0, 'All sitemap entries must have valid lastModified Date objects');

  // -------------------------------------------------------------------------
  // SECTION 3: ROBOTS.TXT BEHAVIOR
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Robots.txt Rules ---');
  const robotsConfig = robots();
  assert(Boolean(robotsConfig), 'Robots configuration must exist');
  assert(robotsConfig.sitemap === `${baseUrl}/sitemap.xml`, 'Robots.txt must link to dynamic sitemap.xml');

  const userAgentRules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  assert(userAgentRules.allow === '/', 'Robots.txt must allow "/" for legitimate search engine crawlers');

  const disallowed = Array.isArray(userAgentRules.disallow)
    ? userAgentRules.disallow
    : [userAgentRules.disallow];

  assert(disallowed.includes('/admin/'), 'Robots.txt must disallow /admin/');
  assert(disallowed.includes('/api/admin/'), 'Robots.txt must disallow /api/admin/');
  assert(disallowed.includes('/api/cron/'), 'Robots.txt must disallow /api/cron/');
  assert(disallowed.includes('/search'), 'Robots.txt must disallow internal /search result indexing');
  assert(disallowed.includes('/unsubscribe'), 'Robots.txt must disallow /unsubscribe endpoint');

  // -------------------------------------------------------------------------
  // SECTION 4: SCHEMA.ORG JSON-LD STRUCTURED DATA & XSS SANITIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Schema.org Structured Data & XSS Sanitization ---');
  const maliciousInput = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: 'Breaking Story <script>alert("XSS")</script>',
    description: 'An injection attempt </script><script>stealCookies()</script>',
  };

  const serialized = serializeJsonLd(maliciousInput);
  assert(!serialized.includes('<script>'), 'serializeJsonLd must escape "<" characters to prevent HTML/XSS injection');
  assert(!serialized.includes('</script>'), 'serializeJsonLd must escape closing script tags');
  assert(serialized.includes('\\u003cscript\\u003e'), 'Script tags must be safely unicode-escaped as \\u003c');

  // Test JSON-LD parse roundtrip
  const parsed = JSON.parse(serialized);
  assert(parsed.headline === maliciousInput.headline, 'JSON.parse must correctly decode the sanitized payload');

  // -------------------------------------------------------------------------
  // SECTION 5: HTTP SECURITY HEADERS & PERFORMANCE CONFIGURATION
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Next.js Security Headers & Image Optimizations ---');
  assert(nextConfig.poweredByHeader === false, 'X-Powered-By header must be disabled to prevent framework leakage');

  // Verify Image optimizations
  assert(
    Array.isArray(nextConfig.images?.formats) &&
      nextConfig.images.formats.includes('image/avif') &&
      nextConfig.images.formats.includes('image/webp'),
    'Next.js image formats must include AVIF and WebP for next-gen compression'
  );
  assert(
    typeof nextConfig.images?.minimumCacheTTL === 'number' && nextConfig.images.minimumCacheTTL >= 86400,
    'Image minimumCacheTTL must be at least 86400 seconds (24 hours)'
  );

  // Verify Security Headers
  if (typeof nextConfig.headers === 'function') {
    const routeHeaders = await nextConfig.headers();
    const globalRule = routeHeaders.find((r) => r.source === '/:path*');
    assert(Boolean(globalRule), 'Security headers must apply globally to /:path*');

    if (globalRule) {
      const headerMap = new Map(globalRule.headers.map((h) => [h.key, h.value]));

      assert(
        headerMap.get('X-Content-Type-Options') === 'nosniff',
        'X-Content-Type-Options must be set to "nosniff"'
      );
      assert(
        headerMap.get('X-Frame-Options') === 'SAMEORIGIN',
        'X-Frame-Options must be set to "SAMEORIGIN"'
      );
      assert(
        headerMap.get('Referrer-Policy') === 'strict-origin-when-cross-origin',
        'Referrer-Policy must be set to "strict-origin-when-cross-origin"'
      );
      assert(
        Boolean(headerMap.get('Strict-Transport-Security')),
        'Strict-Transport-Security (HSTS) header must be present'
      );
      assert(
        Boolean(headerMap.get('Permissions-Policy')),
        'Permissions-Policy header must be present'
      );

      const csp = headerMap.get('Content-Security-Policy');
      assert(Boolean(csp), 'Content-Security-Policy (CSP) must be configured');
      if (csp) {
        assert(csp.includes("default-src 'self'"), 'CSP must define default-src \'self\'');
        assert(csp.includes('images.unsplash.com'), 'CSP must allow images from images.unsplash.com');
        assert(csp.includes('res.cloudinary.com'), 'CSP must allow images from res.cloudinary.com');
        assert(csp.includes("frame-ancestors 'self'"), 'CSP must protect against clickjacking with frame-ancestors');
      }
    }
  } else {
    assert(false, 'nextConfig.headers function must be defined');
  }

  // -------------------------------------------------------------------------
  // SECTION 6: ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Role-Based Access Control (RBAC) & Permission Boundaries ---');

  // Load existing test users and authors
  const superAdminUser = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
    include: { author: true },
  });
  const editorUser = await prisma.user.findFirst({
    where: { role: UserRole.EDITOR },
    include: { author: true },
  });
  const authors = await prisma.author.findMany({ take: 2 });

  if (!superAdminUser || !editorUser || authors.length < 2) {
    throw new Error('Test requires database with superadmin, editor and at least two authors.');
  }

  const authorAUser: AuthenticatedUser = {
    id: 'test-author-a',
    name: authors[0].name,
    email: 'authorA@test.com',
    role: UserRole.AUTHOR,
    authorId: authors[0].id,
    isActive: true,
  };

  const authorBUser: AuthenticatedUser = {
    id: 'test-author-b',
    name: authors[1].name,
    email: 'authorB@test.com',
    role: UserRole.AUTHOR,
    authorId: authors[1].id,
    isActive: true,
  };

  const superAdminAuth: AuthenticatedUser = {
    id: superAdminUser.id,
    name: superAdminUser.name,
    email: superAdminUser.email,
    role: UserRole.SUPER_ADMIN,
    authorId: superAdminUser.authorId,
    isActive: true,
  };

  const editorAuth: AuthenticatedUser = {
    id: editorUser.id,
    name: editorUser.name,
    email: editorUser.email,
    role: UserRole.EDITOR,
    authorId: editorUser.authorId,
    isActive: true,
  };

  // Mock articles belonging to Author A and Author B
  const articleOfAuthorA = { authorId: authors[0].id, status: 'DRAFT' };
  const articleOfAuthorB = { authorId: authors[1].id, status: 'DRAFT' };
  const publishedArticleOfA = { authorId: authors[0].id, status: 'PUBLISHED' };

  // 1. Authors cannot edit other authors' articles
  assert(
    canEditArticle(authorAUser, articleOfAuthorA) === true,
    'Author A CAN edit their own article'
  );
  assert(
    canEditArticle(authorAUser, articleOfAuthorB) === false,
    'Author A CANNOT edit Author B\'s article (Strict Boundary)'
  );
  assert(
    canEditArticle(editorAuth, articleOfAuthorA) === true,
    'Editor CAN edit Author A\'s article'
  );
  assert(
    canEditArticle(superAdminAuth, articleOfAuthorB) === true,
    'Super Admin CAN edit Author B\'s article'
  );

  // 2. Authors cannot publish or schedule articles directly
  assert(
    canPublishArticle(authorAUser) === false,
    'Author CANNOT publish or schedule articles directly'
  );
  assert(
    canPublishArticle(editorAuth) === true,
    'Editor CAN publish and schedule articles'
  );
  assert(
    canPublishArticle(superAdminAuth) === true,
    'Super Admin CAN publish and schedule articles'
  );

  // 3. Authors cannot delete published articles or other authors\' drafts
  assert(
    canDeleteArticle(authorAUser, articleOfAuthorA) === true,
    'Author CAN delete their own DRAFT article'
  );
  assert(
    canDeleteArticle(authorAUser, publishedArticleOfA) === false,
    'Author CANNOT delete their own PUBLISHED article'
  );
  assert(
    canDeleteArticle(authorAUser, articleOfAuthorB) === false,
    'Author CANNOT delete another author\'s draft'
  );
  assert(
    canDeleteArticle(editorAuth, publishedArticleOfA) === true,
    'Editor CAN delete published article'
  );

  // 4. Role administrative checks
  assert(canManageUsers(superAdminAuth) === true, 'Super Admin CAN manage users');
  assert(canManageUsers(editorAuth) === false, 'Editor CANNOT manage users');
  assert(canManageUsers(authorAUser) === false, 'Author CANNOT manage users');

  assert(canManageAuthors(editorAuth) === true, 'Editor CAN manage authors');
  assert(canManageAuthors(authorAUser) === false, 'Author CANNOT manage authors');

  assert(canManageTaxonomy(editorAuth) === true, 'Editor CAN manage categories & tags');
  assert(canManageTaxonomy(authorAUser) === false, 'Author CANNOT manage categories & tags');

  // -------------------------------------------------------------------------
  // SECTION 7: INPUT VALIDATION & RATE LIMITING
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 7: Input Validation & Rate Limiting ---');
  const testEmail = `sec-audit-${Date.now()}@example.com`;

  // First 5 attempts should pass
  let allowedCount = 0;
  for (let i = 0; i < 5; i++) {
    const check = await checkNewsletterRateLimit(testEmail);
    if (check.allowed) {
      allowedCount++;
      await recordNewsletterAttempt(testEmail);
    }
  }
  assert(allowedCount === 5, 'Newsletter allows up to 5 subscription attempts in 15 minute window');

  // 6th attempt should be blocked
  const blockedCheck = await checkNewsletterRateLimit(testEmail);
  assert(!blockedCheck.allowed, 'Newsletter blocks 6th subscription attempt within the rate limit window');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`Phase 7 Test Suite Complete: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7TestSuite()
  .catch((err) => {
    console.error('Test suite failed with unexpected error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

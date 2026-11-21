import prisma from '../src/lib/prisma';
import { hashPassword, verifyPassword } from '../src/lib/auth/password';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
} from '../src/lib/auth/rate-limit';
import {
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
  canManageUsers,
  canManageTaxonomy,
  canManageAuthors,
  AuthenticatedUser,
} from '../src/lib/auth/guard';
import { ArticleStatus, UserRole } from '@prisma/client';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting Phase 5 Comprehensive E2E & Unit Test Suite...\n');

  // ==============================================================================
  // 1. Password Hashing & Verification
  // ==============================================================================
  console.log('1. Password Security & Bcrypt Validation');
  const samplePass = 'SecureEditorialPass2026!';
  const hashedPassword = await hashPassword(samplePass);
  assert(hashedPassword.startsWith('$2'), 'Hash begins with valid bcrypt salt identifier');
  assert(await verifyPassword(samplePass, hashedPassword), 'Correct password verifies successfully');
  assert(!(await verifyPassword('WrongPassword123!', hashedPassword)), 'Wrong password correctly rejected');
  assert(!(await verifyPassword('', hashedPassword)), 'Empty password rejected');

  // ==============================================================================
  // 2. Brute Force Protection & Rate Limiting
  // ==============================================================================
  console.log('\n2. Brute-Force Rate Limiting & Lockout Logic');
  const testEmail = 'test-security-attempt@saudifuturetech.com';
  await resetFailedAttempts(testEmail);

  let initialCheck = await checkRateLimit(testEmail);
  assert(initialCheck.allowed === true, 'Initial state: login allowed');
  assert(initialCheck.remainingAttempts === 5, 'Initial attempts count is 5');

  // Record 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const res = await recordFailedAttempt(testEmail);
    assert(res.locked === false, `Attempt ${i}: not yet locked`);
  }

  // 5th attempt must trigger lockout
  const fifthAttempt = await recordFailedAttempt(testEmail);
  assert(fifthAttempt.locked === true, 'Attempt 5: lockout successfully triggered');
  assert(fifthAttempt.attempts >= 5, 'Failed attempts count recorded >= 5');

  const lockedCheck = await checkRateLimit(testEmail);
  assert(lockedCheck.allowed === false, 'Rate limit check: locked out user is barred');
  assert(typeof lockedCheck.remainingMinutes === 'number' && lockedCheck.remainingMinutes > 0, 'Lockout duration reported');

  // Reset attempts
  await resetFailedAttempts(testEmail);
  const afterResetCheck = await checkRateLimit(testEmail);
  assert(afterResetCheck.allowed === true, 'Resetting attempts immediately unlocks the account');

  // Cleanup test login attempt record
  await prisma.loginAttempt.deleteMany({ where: { identifier: testEmail } });

  // ==============================================================================
  // 3. Seeded Accounts & Password Integrity
  // ==============================================================================
  console.log('\n3. Database Seed Accounts Verification');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@saudifuturetech.com' } });
  assert(adminUser !== null, 'Super Admin user exists in PostgreSQL');
  assert(adminUser?.role === UserRole.SUPER_ADMIN, 'Super Admin has SUPER_ADMIN role');
  assert(adminUser?.isActive === true, 'Super Admin is active');
  assert(await verifyPassword('AdminPassword2026!', adminUser?.passwordHash || ''), 'Super Admin password hash valid');

  const editorUser = await prisma.user.findUnique({ where: { email: 'editor@saudifuturetech.com' } });
  assert(editorUser !== null, 'Editor user exists in PostgreSQL');
  assert(editorUser?.role === UserRole.EDITOR, 'Editor has EDITOR role');
  assert(editorUser?.isActive === true, 'Editor is active');
  assert(await verifyPassword('EditorPassword2026!', editorUser?.passwordHash || ''), 'Editor password hash valid');

  const authorUser = await prisma.user.findUnique({
    where: { email: 'author@saudifuturetech.com' },
    include: { author: true },
  });
  assert(authorUser !== null, 'Author user exists in PostgreSQL');
  assert(authorUser?.role === UserRole.AUTHOR, 'Author has AUTHOR role');
  assert(authorUser?.isActive === true, 'Author is active');
  assert(authorUser?.author?.slug === 'tariq-al-mansoor', 'Author user linked to Tariq Al-Mansoor byline profile');
  assert(await verifyPassword('AuthorPassword2026!', authorUser?.passwordHash || ''), 'Author password hash valid');

  const inactiveUser = await prisma.user.findUnique({ where: { email: 'inactive@saudifuturetech.com' } });
  assert(inactiveUser !== null, 'Inactive user exists');
  assert(inactiveUser?.isActive === false, 'Inactive user has isActive: false');

  // ==============================================================================
  // 4. Role-Based Access Control (RBAC) Perm Matrix
  // ==============================================================================
  console.log('\n4. Role-Based Access Control (RBAC) Matrix');

  const mockAdmin: AuthenticatedUser = {
    id: 'u1',
    name: 'Admin',
    email: 'admin@test.com',
    role: UserRole.SUPER_ADMIN,
    authorId: null,
    isActive: true,
  };

  const mockEditor: AuthenticatedUser = {
    id: 'u2',
    name: 'Editor',
    email: 'editor@test.com',
    role: UserRole.EDITOR,
    authorId: null,
    isActive: true,
  };

  const mockAuthor1: AuthenticatedUser = {
    id: 'u3',
    name: 'Author 1',
    email: 'author1@test.com',
    role: UserRole.AUTHOR,
    authorId: 'auth_tariq',
    isActive: true,
  };

  const mockArticleTariq = { authorId: 'auth_tariq', status: 'DRAFT' };
  const mockArticleOther = { authorId: 'auth_zainab', status: 'DRAFT' };

  // Article Edit Checks
  assert(canEditArticle(mockAdmin, mockArticleTariq), 'Super Admin can edit any article');
  assert(canEditArticle(mockEditor, mockArticleOther), 'Editor can edit any article');
  assert(canEditArticle(mockAuthor1, mockArticleTariq), 'Author CAN edit their own article');
  assert(!canEditArticle(mockAuthor1, mockArticleOther), 'Author CANNOT edit another author article');

  // Publishing Checks
  assert(canPublishArticle(mockAdmin), 'Super Admin can publish articles');
  assert(canPublishArticle(mockEditor), 'Editor can publish articles');
  assert(!canPublishArticle(mockAuthor1), 'Author CANNOT publish articles directly');

  // Deletion Checks
  assert(canDeleteArticle(mockAdmin, mockArticleTariq), 'Super Admin can delete articles');
  assert(canDeleteArticle(mockEditor, mockArticleOther), 'Editor can delete articles');
  assert(canDeleteArticle(mockAuthor1, mockArticleTariq), 'Author CAN delete their own DRAFT');
  assert(!canDeleteArticle(mockAuthor1, { ...mockArticleTariq, status: 'PUBLISHED' }), 'Author CANNOT delete their published article');
  assert(!canDeleteArticle(mockAuthor1, mockArticleOther), 'Author CANNOT delete other author article');

  // System Management Checks
  assert(canManageUsers(mockAdmin), 'Super Admin can manage users');
  assert(!canManageUsers(mockEditor), 'Editor CANNOT manage users');
  assert(!canManageUsers(mockAuthor1), 'Author CANNOT manage users');

  // Taxonomy & Authors Checks
  assert(canManageTaxonomy(mockAdmin), 'Super Admin can manage taxonomy');
  assert(canManageTaxonomy(mockEditor), 'Editor can manage taxonomy');
  assert(!canManageTaxonomy(mockAuthor1), 'Author CANNOT manage taxonomy');

  assert(canManageAuthors(mockAdmin), 'Super Admin can manage authors');
  assert(canManageAuthors(mockEditor), 'Editor can manage authors');
  assert(!canManageAuthors(mockAuthor1), 'Author CANNOT manage authors');

  // ==============================================================================
  // 5. Article Workflow State Lifecycle
  // ==============================================================================
  console.log('\n5. Editorial Workflow Lifecycle & Public Isolation');
  const cat = await prisma.category.findFirst();
  const author = await prisma.author.findFirst();

  if (!cat || !author) throw new Error('Missing seed data');

  const testSlug = 'automated-test-workflow-article-' + Date.now();
  const testArticle = await prisma.article.create({
    data: {
      title: 'Automated Test Workflow Article',
      slug: testSlug,
      excerpt: 'Testing draft, in_review, and published transitions',
      content: 'Paragraph 1\n\nParagraph 2',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.DRAFT,
      authorId: author.id,
      categoryId: cat.id,
    },
  });
  assert(testArticle.status === ArticleStatus.DRAFT, 'Article created with status DRAFT');

  // Verify that public queries hide DRAFT articles
  const publicPublishedArticles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, slug: testSlug },
  });
  assert(publicPublishedArticles.length === 0, 'DRAFT article does NOT appear in public published queries');

  // Transition to IN_REVIEW
  const inReviewArticle = await prisma.article.update({
    where: { id: testArticle.id },
    data: { status: ArticleStatus.IN_REVIEW },
  });
  assert(inReviewArticle.status === ArticleStatus.IN_REVIEW, 'Status transitioned to IN_REVIEW');

  // Transition to PUBLISHED
  const now = new Date();
  const publishedArticle = await prisma.article.update({
    where: { id: testArticle.id },
    data: { status: ArticleStatus.PUBLISHED, publishedAt: now },
  });
  assert(publishedArticle.status === ArticleStatus.PUBLISHED, 'Status transitioned to PUBLISHED');
  assert(publishedArticle.publishedAt !== null, 'publishedAt timestamp recorded');

  // Verify that it appears in public query now
  const publicCheck2 = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, slug: testSlug },
  });
  assert(publicCheck2.length === 1, 'PUBLISHED article now visible to public readers');

  // Revert / Unpublish to DRAFT
  const unpublished = await prisma.article.update({
    where: { id: testArticle.id },
    data: { status: ArticleStatus.DRAFT },
  });
  assert(unpublished.status === ArticleStatus.DRAFT, 'Article reverted to DRAFT');

  const publicCheck3 = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, slug: testSlug },
  });
  assert(publicCheck3.length === 0, 'Unpublished article is immediately removed from public queries');

  // Cleanup test article
  await prisma.article.delete({ where: { id: testArticle.id } });

  // ==============================================================================
  // 6. Live HTTP Route & Middleware Infiltration Tests
  // ==============================================================================
  console.log('\n6. Live HTTP Endpoints & Middleware Interception');
  const baseUrl = 'http://localhost:3000';

  const testRoute = async (path: string, expectedStatus: number | number[]) => {
    try {
      const res = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
      const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
      const matches = expected.includes(res.status);
      assert(matches, `GET ${path} returned HTTP ${res.status} (expected ${expected.join(' or ')})`);
    } catch (err: any) {
      assert(false, `GET ${path} failed to connect: ${err.message}`);
    }
  };

  // Public Routes
  await testRoute('/', 200);
  await testRoute('/latest', 200);
  await testRoute('/category/ai-deep-tech', 200);
  await testRoute('/article/arabic-ai-frontier-sdaia-allam-architecture-tokenization-benchmarks', 200);
  await testRoute('/search?q=compute', 200);
  await testRoute('/some-nonexistent-page-404-test', 404);

  // Admin Login route must be accessible without login
  await testRoute('/admin/login', 200);

  // Unauthenticated request to /admin must be redirected (307 or 302) to /admin/login by NextAuth Middleware
  await testRoute('/admin', [307, 302, 308]);
  await testRoute('/admin/articles', [307, 302, 308]);
  await testRoute('/admin/users', [307, 302, 308]);

  // ==============================================================================
  // Results Summary
  // ==============================================================================
  console.log(`\n==================================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Fatal test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


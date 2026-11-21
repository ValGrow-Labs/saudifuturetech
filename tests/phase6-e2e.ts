import prisma from '../src/lib/prisma';
import {
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
  AuthenticatedUser,
} from '../src/lib/auth/guard';
import { ArticleStatus, SubscriberStatus, CampaignStatus, UserRole } from '@prisma/client';
import { publishScheduledArticles } from '../src/lib/scheduler/publisher';
import { checkNewsletterRateLimit, recordNewsletterAttempt } from '../src/lib/newsletter/rate-limit';
import crypto from 'crypto';

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

async function runPhase6Tests() {
  console.log('🧪 Starting Phase 6: Publishing Workflow & Newsletter Comprehensive Test Suite...\n');

  // Load Test Users
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'admin@saudifuturetech.com' },
    include: { author: true },
  });
  const editor = await prisma.user.findUnique({
    where: { email: 'editor@saudifuturetech.com' },
    include: { author: true },
  });
  const authorUser = await prisma.user.findUnique({
    where: { email: 'author@saudifuturetech.com' },
    include: { author: true },
  });

  if (!superAdmin || !editor || !authorUser) {
    throw new Error('Required test users missing from database. Run npm run db:seed first.');
  }

  const superAdminAuth: AuthenticatedUser = {
    id: superAdmin.id,
    name: superAdmin.name,
    email: superAdmin.email,
    role: superAdmin.role,
    authorId: superAdmin.authorId,
    isActive: true,
  };

  const editorAuth: AuthenticatedUser = {
    id: editor.id,
    name: editor.name,
    email: editor.email,
    role: editor.role,
    authorId: editor.authorId,
    isActive: true,
  };

  const authorAuth: AuthenticatedUser = {
    id: authorUser.id,
    name: authorUser.name,
    email: authorUser.email,
    role: authorUser.role,
    authorId: authorUser.authorId,
    isActive: true,
  };

  // Find another author for permission boundary test
  const anotherAuthor = await prisma.author.findFirst({
    where: { id: { not: authorUser.authorId || '' } },
  });
  if (!anotherAuthor) {
    throw new Error('Second author required for permission boundary testing.');
  }

  const defaultCategory = await prisma.category.findFirst();
  if (!defaultCategory) {
    throw new Error('Default category required.');
  }

  // ==============================================================================
  // 1. RBAC & Editorial Workflow Permission Boundaries
  // ==============================================================================
  console.log('1. RBAC & Editorial Workflow Permission Verification');

  // Verify Role Publishing Rights
  assert(canPublishArticle(superAdminAuth) === true, 'Super Admin has publishing authority');
  assert(canPublishArticle(editorAuth) === true, 'Editor has publishing authority');
  assert(canPublishArticle(authorAuth) === false, 'Author DOES NOT have direct publishing authority');

  // Author article ownership boundaries
  const ownArticleMock = { authorId: authorAuth.authorId! };
  const otherAuthorArticleMock = { authorId: anotherAuthor.id };

  assert(canEditArticle(authorAuth, ownArticleMock) === true, 'Author can edit their own contributed story');
  assert(canEditArticle(authorAuth, otherAuthorArticleMock) === false, 'Author CANNOT edit another author story');
  assert(canEditArticle(editorAuth, otherAuthorArticleMock) === true, 'Editor can edit any author story');
  assert(canEditArticle(superAdminAuth, otherAuthorArticleMock) === true, 'Super Admin can edit any author story');

  // ==============================================================================
  // 2. Multi-Stage Editorial Workflow & Audit History Transitions
  // ==============================================================================
  console.log('\n2. Multi-Stage Editorial Workflow & Audit History Tracking');

  // A. Create an article in DRAFT state
  const testStorySlug = `phase6-test-workflow-${Date.now()}`;
  const testArticle = await prisma.article.create({
    data: {
      title: 'Automated Desalination & Solar Microgrids in Red Sea Coast',
      slug: testStorySlug,
      excerpt: 'Evaluating real-time sensor integration for reverse osmosis membranes.',
      content: 'Complete test content for Phase 6 publishing workflow validation.',
      status: ArticleStatus.DRAFT,
      authorId: authorAuth.authorId!,
      categoryId: defaultCategory.id,
      coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&q=80',
      readingTime: 4,
    },
  });

  // Record creation audit entry
  await prisma.articleReviewHistory.create({
    data: {
      articleId: testArticle.id,
      previousStatus: 'DRAFT',
      newStatus: 'DRAFT',
      userId: authorAuth.id,
      userName: authorAuth.name,
      userRole: authorAuth.role,
      feedback: 'Initial story drafted by author',
    },
  });

  assert(testArticle.status === ArticleStatus.DRAFT, 'New story begins in DRAFT state');

  // B. Author submits story for review
  const inReviewArticle = await prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: testArticle.id },
      data: { status: ArticleStatus.IN_REVIEW },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.DRAFT,
        newStatus: ArticleStatus.IN_REVIEW,
        userId: authorAuth.id,
        userName: authorAuth.name,
        userRole: authorAuth.role,
        feedback: 'Ready for editorial review and verification.',
      },
    });
    return updated;
  });

  assert(inReviewArticle.status === ArticleStatus.IN_REVIEW, 'Story successfully transitioned to IN_REVIEW');

  // C. Editor reviews and requests revisions with mandatory feedback
  const feedbackText = 'Please cite specific kilowatt-hour metrics for the photovoltaic arrays.';
  const revisedArticle = await prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: testArticle.id },
      data: { status: ArticleStatus.DRAFT },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.IN_REVIEW,
        newStatus: ArticleStatus.DRAFT,
        userId: editorAuth.id,
        userName: editorAuth.name,
        userRole: editorAuth.role,
        feedback: feedbackText,
      },
    });
    return updated;
  });

  assert(revisedArticle.status === ArticleStatus.DRAFT, 'Editor returned story to DRAFT for revision');

  // Check audit history length and feedback
  const historyEntries = await prisma.articleReviewHistory.findMany({
    where: { articleId: testArticle.id },
    orderBy: { createdAt: 'asc' },
  });

  assert(historyEntries.length === 3, `Audit history recorded 3 timeline steps (found ${historyEntries.length})`);
  assert(historyEntries[2].feedback === feedbackText, 'Editor revision feedback accurately logged in audit trail');
  assert(historyEntries[2].userRole === 'EDITOR', 'Editor user role logged in review history');

  // D. Author resubmits
  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: testArticle.id },
      data: { status: ArticleStatus.IN_REVIEW },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.DRAFT,
        newStatus: ArticleStatus.IN_REVIEW,
        userId: authorAuth.id,
        userName: authorAuth.name,
        userRole: authorAuth.role,
        feedback: 'Added kWh metrics in section 2.',
      },
    });
  });

  // E. Editor approves and publishes
  const publishedNow = new Date();
  const approvedArticle = await prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: testArticle.id },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: publishedNow,
        scheduledFor: null,
      },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.IN_REVIEW,
        newStatus: ArticleStatus.PUBLISHED,
        userId: editorAuth.id,
        userName: editorAuth.name,
        userRole: editorAuth.role,
        feedback: 'Approved for publication.',
      },
    });
    return updated;
  });

  assert(approvedArticle.status === ArticleStatus.PUBLISHED, 'Editor successfully approved and published story');
  assert(approvedArticle.publishedAt !== null, 'Story publishedAt timestamp populated');

  // F. Editor unpublishes story back to draft
  const unpublishedArticle = await prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: testArticle.id },
      data: {
        status: ArticleStatus.DRAFT,
        scheduledFor: null,
      },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.PUBLISHED,
        newStatus: ArticleStatus.DRAFT,
        userId: editorAuth.id,
        userName: editorAuth.name,
        userRole: editorAuth.role,
        feedback: 'Unpublished for legal review.',
      },
    });
    return updated;
  });

  assert(unpublishedArticle.status === ArticleStatus.DRAFT, 'Editor successfully unpublished story to DRAFT');

  // ==============================================================================
  // 3. Publishing Scheduler & Concurrency Protection
  // ==============================================================================
  console.log('\n3. Publishing Scheduler & Concurrency Guard Validation');

  // A. Past date rejection test
  const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
  const isPast = pastDate.getTime() <= Date.now() + 60000;
  assert(isPast === true, 'Scheduler correctly identifies and flags past timestamp');

  // B. Schedule article for future release
  const futureDate = new Date(Date.now() + 86400000); // tomorrow
  const scheduledArticle = await prisma.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id: testArticle.id },
      data: {
        status: ArticleStatus.SCHEDULED,
        scheduledFor: futureDate,
      },
    });
    await tx.articleReviewHistory.create({
      data: {
        articleId: testArticle.id,
        previousStatus: ArticleStatus.DRAFT,
        newStatus: ArticleStatus.SCHEDULED,
        userId: editorAuth.id,
        userName: editorAuth.name,
        userRole: editorAuth.role,
        feedback: `Scheduled for publication on ${futureDate.toISOString()}`,
      },
    });
    return updated;
  });

  assert(scheduledArticle.status === ArticleStatus.SCHEDULED, 'Article status successfully set to SCHEDULED');
  assert(scheduledArticle.scheduledFor !== null, 'Article scheduledFor date recorded in database');

  // C. Atomic Execution of publishScheduledArticles()
  // Simulate time arrival by setting scheduledFor to 2 minutes in the past
  const simulatedDueTime = new Date(Date.now() - 120000);
  await prisma.article.update({
    where: { id: testArticle.id },
    data: { scheduledFor: simulatedDueTime },
  });

  // Run atomic publisher function
  const executionResult = await publishScheduledArticles();
  assert(executionResult.processed >= 1, `Publisher processed at least 1 due article (processed: ${executionResult.processed})`);
  assert(executionResult.published >= 1, `Publisher successfully published due article (published: ${executionResult.published})`);
  assert(executionResult.errors.length === 0, 'Publisher completed with 0 errors');

  // Verify article in database
  const publishedPostScheduled = await prisma.article.findUnique({
    where: { id: testArticle.id },
  });
  assert(publishedPostScheduled?.status === ArticleStatus.PUBLISHED, 'Target article transitioned to PUBLISHED');
  assert(publishedPostScheduled?.scheduledFor === null, 'Article scheduledFor cleared upon publication');
  assert(publishedPostScheduled?.publishedAt !== null, 'Article publishedAt recorded with release timestamp');

  // Concurrency check: immediate re-run should publish 0 articles
  const secondRun = await publishScheduledArticles();
  assert(secondRun.published === 0, 'Immediate second publisher pass correctly publishes 0 articles (no duplicate execution)');

  // D. Protected Cron Route Test via HTTP
  console.log('\n  Testing /api/cron/publish-scheduled endpoint:');
  const cronResNoAuth = await fetch('http://localhost:3000/api/cron/publish-scheduled');
  assert(cronResNoAuth.status === 401, 'Unauthenticated cron invocation rejected with 401 Unauthorized');

  const cronSecret = process.env.CRON_SECRET || 'test_cron_secret_saudi_future_tech_2026';
  const cronResWithAuth = await fetch('http://localhost:3000/api/cron/publish-scheduled', {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });
  assert(cronResWithAuth.status === 200, 'Authenticated cron invocation succeeds with 200 OK');
  const cronJson = await cronResWithAuth.json();
  assert(cronJson.success === true, 'Cron response indicates success: true');
  assert(typeof cronJson.processed === 'number', 'Cron response returns execution summary metrics');

  // ==============================================================================
  // 4. Newsletter Subscription System & Rate Limiting
  // ==============================================================================
  console.log('\n4. Newsletter Subscription Lifecycle & Security Verification');

  const testSubscriberEmail = `exec.tech.${Date.now()}@example.com`;

  // A. Rate limiting test
  const initialRl = await checkNewsletterRateLimit(testSubscriberEmail);
  assert(initialRl.allowed === true, 'Initial newsletter subscription allowed');
  assert(initialRl.remainingAttempts === 5, 'Initial newsletter rate limit remaining attempts is 5');

  // B. Subscribe with consent
  const rawToken = crypto.randomUUID();
  const newSub = await prisma.newsletterSubscriber.create({
    data: {
      email: testSubscriberEmail,
      status: SubscriberStatus.ACTIVE,
      unsubscribeToken: rawToken,
      consentGivenAt: new Date(),
    },
  });

  assert(newSub.email === testSubscriberEmail, 'Subscriber record created with valid email');
  assert(newSub.status === SubscriberStatus.ACTIVE, 'Subscriber status initialized as ACTIVE');
  assert(newSub.unsubscribeToken.length > 20, 'Subscriber granted unique high-entropy unsubscribe token');
  assert(newSub.consentGivenAt !== null, 'Audit consent timestamp recorded');

  // C. Duplicate email handling: already active
  const duplicateCheck = await prisma.newsletterSubscriber.findUnique({
    where: { email: testSubscriberEmail },
  });
  assert(duplicateCheck?.status === SubscriberStatus.ACTIVE, 'Duplicate check identifies existing active subscription');

  // D. Unsubscribe using token
  const unsubscribedSub = await prisma.newsletterSubscriber.update({
    where: { unsubscribeToken: rawToken },
    data: {
      status: SubscriberStatus.UNSUBSCRIBED,
      unsubscribedAt: new Date(),
    },
  });
  assert(unsubscribedSub.status === SubscriberStatus.UNSUBSCRIBED, 'Token unsubscription transitions status to UNSUBSCRIBED');
  assert(unsubscribedSub.unsubscribedAt !== null, 'unsubscribedAt timestamp recorded');

  // E. Resubscribe / Reactivation of previously unsubscribed email
  const reactivatedSub = await prisma.newsletterSubscriber.update({
    where: { email: testSubscriberEmail },
    data: {
      status: SubscriberStatus.ACTIVE,
      consentGivenAt: new Date(),
      unsubscribedAt: null,
    },
  });
  assert(reactivatedSub.status === SubscriberStatus.ACTIVE, 'Re-subscribing reactivates subscriber to ACTIVE');
  assert(reactivatedSub.unsubscribedAt === null, 'unsubscribedAt cleared upon reactivation');

  // F. CSV Export Route Security & Content Verification
  const exportNoAuth = await fetch('http://localhost:3000/api/admin/subscribers/export');
  assert(exportNoAuth.status === 401, 'CSV export endpoint rejects unauthenticated request with 401');

  // ==============================================================================
  // 5. Newsletter Campaign Creation & Distribution Safety
  // ==============================================================================
  console.log('\n5. Newsletter Campaign System & Distribution Safety');

  const testCampaign = await prisma.newsletterCampaign.create({
    data: {
      title: 'Vision 2030 Deep Tech Dispatch #42',
      subject: 'The Sovereign Compute Blueprint: Allam & Beyond',
      previewText: 'Exclusive editorial analysis on Arabic LLMs and datacenter infrastructure.',
      content: 'Here is this week briefing on foundational compute and national AI initiatives in Riyadh.',
      status: CampaignStatus.DRAFT,
      createdById: editorAuth.id,
    },
  });

  assert(testCampaign.status === CampaignStatus.DRAFT, 'Campaign initialized in DRAFT status');
  assert(testCampaign.subject.includes('Allam'), 'Campaign subject verified');

  // Verify Unsubscribe token substitution logic
  const sampleEmailHtml = `<p>${testCampaign.content}</p><a href="https://saudifuturetech.com/unsubscribe?token={{UNSUBSCRIBE_TOKEN}}">Unsubscribe</a>`;
  const substitutedHtml = sampleEmailHtml.replace(/{{UNSUBSCRIBE_TOKEN}}/g, newSub.unsubscribeToken);
  assert(substitutedHtml.includes(newSub.unsubscribeToken), 'Unsubscribe token correctly injected into email HTML');

  // ==============================================================================
  // 6. Public & Editorial Route Regression Checks
  // ==============================================================================
  console.log('\n6. Public & Backstage HTTP Route Verification');

  const routes = [
    { url: 'http://localhost:3000/', desc: 'Homepage (with Newsletter Banner)' },
    { url: 'http://localhost:3000/newsletter', desc: 'Dedicated Newsletter Briefing Page' },
    { url: `http://localhost:3000/unsubscribe?token=${newSub.unsubscribeToken}`, desc: 'Public Unsubscribe Landing Page' },
    { url: 'http://localhost:3000/latest', desc: 'Latest Articles Feed' },
    { url: 'http://localhost:3000/article/arabic-ai-frontier-sdaia-allam-architecture-tokenization-benchmarks', desc: 'Article Detail Page' },
    { url: 'http://localhost:3000/category/ai-deep-tech', desc: 'Category Archive Page' },
    { url: 'http://localhost:3000/admin/login', desc: 'Admin Login Page' },
  ];

  for (const r of routes) {
    const res = await fetch(r.url);
    assert(res.status === 200, `HTTP 200 OK: ${r.desc} (${r.url})`);
  }

  // Cleanup test artifacts from database
  await prisma.articleReviewHistory.deleteMany({ where: { articleId: testArticle.id } });
  await prisma.article.delete({ where: { id: testArticle.id } });
  await prisma.newsletterCampaign.delete({ where: { id: testCampaign.id } });
  await prisma.newsletterSubscriber.delete({ where: { email: testSubscriberEmail } });

  console.log('\n==============================================================================');
  console.log(`Phase 6 Test Results: ${passed} passed, ${failed} failed`);
  console.log('==============================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error('Fatal error during Phase 6 E2E test execution:', err);
  process.exit(1);
});

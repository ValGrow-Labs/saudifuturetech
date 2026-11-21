import { PrismaClient, ArticleStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EDITORIAL_CATEGORIES } from '../src/lib/categories';
import { AUTHORS, ARTICLES } from '../src/lib/articles';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Starting Saudi Future Tech database seeding...');

  // 1. Password hashing helper
  // Generate cryptographically random secure passwords if not provided via environment variables
  // Never reuse or recreate known or previously exposed test credentials.
  const hash = async (pwd: string) => bcrypt.hash(pwd, 12);
  const adminInitialPassword =
    process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const editorInitialPassword =
    process.env.SEED_EDITOR_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const authorInitialPassword =
    process.env.SEED_AUTHOR_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const inactiveInitialPassword = crypto.randomBytes(18).toString('base64url');

  const adminHash = await hash(adminInitialPassword);
  const editorHash = await hash(editorInitialPassword);
  const authorHash = await hash(authorInitialPassword);
  const inactiveHash = await hash(inactiveInitialPassword);

  // Seed Administrative & Editorial Roles (preserves existing passwordHash on update)
  console.log('👤 Seeding default administrative & editorial users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saudifuturetech.com' },
    update: {
      name: 'Editorial Operations Lead',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      // Omit passwordHash on update to prevent overwriting rotated production passwords
    },
    create: {
      id: 'usr_admin_01',
      name: 'Editorial Operations Lead',
      email: 'admin@saudifuturetech.com',
      role: UserRole.SUPER_ADMIN,
      passwordHash: adminHash,
      isActive: true,
    },
  });
  console.log(`   ✓ Admin user seeded: ${adminUser.email}`);

  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@saudifuturetech.com' },
    update: {
      name: 'Editorial Review Director',
      role: UserRole.EDITOR,
      isActive: true,
      // Omit passwordHash on update to prevent overwriting rotated production passwords
    },
    create: {
      id: 'usr_editor_01',
      name: 'Editorial Review Director',
      email: 'editor@saudifuturetech.com',
      role: UserRole.EDITOR,
      passwordHash: editorHash,
      isActive: true,
    },
  });
  console.log(`   ✓ Editor user seeded: ${editorUser.email}`);

  const inactiveUser = await prisma.user.upsert({
    where: { email: 'inactive@saudifuturetech.com' },
    update: {
      name: 'Former Staff Member',
      role: UserRole.AUTHOR,
      isActive: false,
    },
    create: {
      id: 'usr_inactive_01',
      name: 'Former Staff Member',
      email: 'inactive@saudifuturetech.com',
      role: UserRole.AUTHOR,
      passwordHash: inactiveHash,
      isActive: false,
    },
  });
  console.log(`   ✓ Inactive user seeded: ${inactiveUser.email} (isActive: false)`);

  // 2. Seed Editorial Categories
  console.log('📂 Seeding 6 core editorial categories...');
  const categoryMap = new Map<string, string>(); // slug -> id

  for (const cat of EDITORIAL_CATEGORIES) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        accentColor: cat.color,
        displayOrder: cat.displayOrder,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        accentColor: cat.color,
        displayOrder: cat.displayOrder,
      },
    });
    categoryMap.set(createdCat.slug, createdCat.id);
    console.log(`   ✓ Category: ${createdCat.name} (${createdCat.slug})`);
  }

  // 3. Seed Authors / Journalists
  console.log('✍️  Seeding 4 editorial contributors...');
  const authorMap = new Map<string, string>(); // slug -> id

  for (const author of AUTHORS) {
    const createdAuthor = await prisma.author.upsert({
      where: { slug: author.slug },
      update: {
        name: author.displayName,
        title: author.title,
        bio: author.bio,
        avatar: author.avatarUrl,
        location: author.location,
        socialLinks: {
          twitter: author.twitterHandle,
          linkedin: author.linkedinUrl,
        },
      },
      create: {
        id: author.id,
        name: author.displayName,
        slug: author.slug,
        title: author.title,
        bio: author.bio,
        avatar: author.avatarUrl,
        location: author.location,
        socialLinks: {
          twitter: author.twitterHandle,
          linkedin: author.linkedinUrl,
        },
      },
    });
    authorMap.set(createdAuthor.slug, createdAuthor.id);
    console.log(`   ✓ Author: ${createdAuthor.name} (${createdAuthor.slug})`);
  }

  // Link Author user to Tariq Al-Mansoor
  const tariqAuthorId = authorMap.get('tariq-al-mansoor');
  const authorUser = await prisma.user.upsert({
    where: { email: 'author@saudifuturetech.com' },
    update: {
      name: 'Tariq Al-Mansoor',
      role: UserRole.AUTHOR,
      isActive: true,
      authorId: tariqAuthorId,
      // Omit passwordHash on update to prevent overwriting rotated production passwords
    },
    create: {
      id: 'usr_author_01',
      name: 'Tariq Al-Mansoor',
      email: 'author@saudifuturetech.com',
      role: UserRole.AUTHOR,
      passwordHash: authorHash,
      isActive: true,
      authorId: tariqAuthorId,
    },
  });
  console.log(`   ✓ Author user seeded: ${authorUser.email} (linked to author: Tariq Al-Mansoor)`);

  // 4. Seed Tags and Articles
  console.log('📰 Seeding demonstration articles and taxonomy tags...');
  let articleCount = 0;
  let tagCount = 0;

  for (const art of ARTICLES) {
    const categoryId = categoryMap.get(art.category.slug);
    const authorId = authorMap.get(art.author.slug);

    if (!categoryId || !authorId) {
      console.warn(`   ⚠️ Missing category or author for article: ${art.slug}`);
      continue;
    }

    // Compile plain text content from sections for full-text search
    const plainTextContent = art.sections
      .map((s) => {
        const parts: string[] = [];
        if (s.heading) parts.push(`## ${s.heading}`);
        if (s.subheading) parts.push(`### ${s.subheading}`);
        parts.push(...s.paragraphs);
        if (s.pullQuote) parts.push(`> "${s.pullQuote.quote}" - ${s.pullQuote.attribution || ''}`);
        if (s.takeaway) parts.push(`Takeaway: ${s.takeaway}`);
        return parts.join('\n\n');
      })
      .join('\n\n');

    // Upsert Article
    const createdArticle = await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: plainTextContent,
        structuredContent: art.sections as any,
        coverImage: art.coverImageUrl,
        coverImageAlt: art.coverImageAlt,
        coverImageCaption: art.coverImageCaption,
        imageCredit: art.imageCredit,
        status: art.status as ArticleStatus,
        featured: !!art.isFeatured,
        isEditorsPick: !!art.isEditorsPick,
        isTrending: !!art.isTrending,
        publishedAt: art.publishedAt ? new Date(art.publishedAt) : null,
        updatedAt: art.updatedAt ? new Date(art.updatedAt) : new Date(art.publishedAt),
        readingTime: art.readingTimeMinutes,
        seoTitle: art.seoTitle,
        seoDescription: art.seoDescription,
        sampleContent: true,
        authorId,
        categoryId,
      },
      create: {
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: plainTextContent,
        structuredContent: art.sections as any,
        coverImage: art.coverImageUrl,
        coverImageAlt: art.coverImageAlt,
        coverImageCaption: art.coverImageCaption,
        imageCredit: art.imageCredit,
        status: art.status as ArticleStatus,
        featured: !!art.isFeatured,
        isEditorsPick: !!art.isEditorsPick,
        isTrending: !!art.isTrending,
        publishedAt: art.publishedAt ? new Date(art.publishedAt) : null,
        updatedAt: art.updatedAt ? new Date(art.updatedAt) : new Date(art.publishedAt),
        readingTime: art.readingTimeMinutes,
        seoTitle: art.seoTitle,
        seoDescription: art.seoDescription,
        sampleContent: true,
        authorId,
        categoryId,
      },
    });

    articleCount++;

    // Process Tags and ArticleTag links
    for (const tagName of art.tags) {
      const tagSlug = slugify(tagName);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: { name: tagName },
        create: {
          name: tagName,
          slug: tagSlug,
        },
      });
      tagCount++;

      // Create relation
      await prisma.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId: createdArticle.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          articleId: createdArticle.id,
          tagId: tag.id,
        },
      });
    }

    console.log(`   ✓ Article [${createdArticle.status}]: "${createdArticle.title.slice(0, 45)}..."`);
  }

  // 5. Seed one Draft article with editorial review feedback
  const cleanEnergyCatId = categoryMap.get('clean-energy')!;
  const aiCatId = categoryMap.get('ai-deep-tech')!;
  const smartCitiesCatId = categoryMap.get('smart-cities-infra')!;
  const draftAuthorId = authorMap.get('tariq-al-mansoor')!;
  const zainabAuthorId = authorMap.get('zainab-al-husseini')!;

  const draftArticle = await prisma.article.upsert({
    where: { slug: 'internal-draft-quantum-desalination-pilot' },
    update: {
      status: ArticleStatus.DRAFT,
    },
    create: {
      id: 'art-draft-test',
      title: 'Quantum Sensors in Solar Desalination Trials: Preliminary Pilot Metrics',
      slug: 'internal-draft-quantum-desalination-pilot',
      excerpt: 'Internal editorial preview testing that unpublished status filters operate correctly and revisions can be requested.',
      content: 'Preliminary findings from King Abdullah University of Science and Technology (KAUST) trials evaluating quantum magnetometers for brine salinity detection.\n\n## Pilot Observations\nEarly field telemetry shows a 14% improvement in membrane scaling detection before irreversible calcification occurs.',
      coverImage: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt: 'Desalination plant draft photo',
      status: ArticleStatus.DRAFT,
      featured: false,
      publishedAt: null,
      readingTime: 3,
      sampleContent: true,
      authorId: draftAuthorId,
      categoryId: cleanEnergyCatId,
    },
  });
  console.log('   ✓ Seeded 1 test DRAFT article');

  // Review history on draft article: Editor requested revisions
  await prisma.articleReviewHistory.upsert({
    where: { id: 'hist-rev-01' },
    update: {},
    create: {
      id: 'hist-rev-01',
      articleId: draftArticle.id,
      previousStatus: ArticleStatus.IN_REVIEW,
      newStatus: ArticleStatus.DRAFT,
      userId: editorUser.id,
      userName: editorUser.name,
      userRole: editorUser.role,
      feedback: 'Please expand on membrane fouling detection benchmarks and cite the specific KAUST research lab.',
    },
  });

  // 6. Seed one In-Review article
  const inReviewArticle = await prisma.article.upsert({
    where: { slug: 'oxagon-autonomous-logistics-port-grid' },
    update: {
      status: ArticleStatus.IN_REVIEW,
    },
    create: {
      id: 'art-review-test',
      title: 'OXAGON Autonomous Port Logistics: Automated Guided Vehicles and 5G Cranes',
      slug: 'oxagon-autonomous-logistics-port-grid',
      excerpt: 'How NEOM’s industrial port hub deploys private 5G mmWave networks to coordinate automated container handling.',
      content: 'OXAGON’s container terminal is designed for high-density autonomous throughput.\n\n## Automated Port Infrastructure\nContainer cranes operate with sub-millimeter positioning using combined RTK-GPS and optical computer vision.',
      coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt: 'Automated container port',
      status: ArticleStatus.IN_REVIEW,
      featured: false,
      publishedAt: null,
      readingTime: 4,
      sampleContent: true,
      authorId: zainabAuthorId,
      categoryId: smartCitiesCatId,
    },
  });
  console.log('   ✓ Seeded 1 test IN_REVIEW article');

  await prisma.articleReviewHistory.upsert({
    where: { id: 'hist-sub-01' },
    update: {},
    create: {
      id: 'hist-sub-01',
      articleId: inReviewArticle.id,
      previousStatus: ArticleStatus.DRAFT,
      newStatus: ArticleStatus.IN_REVIEW,
      userId: authorUser.id,
      userName: authorUser.name,
      userRole: authorUser.role,
      feedback: 'Initial draft ready for editorial review. Photography rights confirmed with NEOM media office.',
    },
  });

  // 7. Seed one Scheduled article
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const scheduledArticle = await prisma.article.upsert({
    where: { slug: 'falcon-heavy-payload-satellite-constellation' },
    update: {
      status: ArticleStatus.SCHEDULED,
      scheduledFor: tomorrow,
    },
    create: {
      id: 'art-scheduled-test',
      title: 'Saudi Space Agency Low-Earth Orbit Constellation: Launch Schedule & Architecture',
      slug: 'falcon-heavy-payload-satellite-constellation',
      excerpt: 'Detailed telemetry payload analysis for the upcoming optical remote sensing cluster.',
      content: 'The Saudi Space Agency is launching its next-generation high-resolution earth observation satellites.\n\n## Constellation Topology\nThe multi-spectral imaging instruments provide 0.5-meter ground resolution for environmental and agricultural monitoring.',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt: 'Satellite in orbit',
      status: ArticleStatus.SCHEDULED,
      scheduledFor: tomorrow,
      featured: false,
      publishedAt: null,
      readingTime: 4,
      sampleContent: true,
      authorId: draftAuthorId,
      categoryId: aiCatId,
    },
  });
  console.log('   ✓ Seeded 1 test SCHEDULED article');

  await prisma.articleReviewHistory.upsert({
    where: { id: 'hist-sched-01' },
    update: {},
    create: {
      id: 'hist-sched-01',
      articleId: scheduledArticle.id,
      previousStatus: ArticleStatus.IN_REVIEW,
      newStatus: ArticleStatus.SCHEDULED,
      userId: editorUser.id,
      userName: editorUser.name,
      userRole: editorUser.role,
      feedback: `Approved and scheduled for publication on ${tomorrow.toLocaleDateString()}.`,
    },
  });

  // 8. Seed Newsletter Subscribers
  console.log('📬 Seeding demonstration newsletter subscribers...');
  const sampleSubscribers = [
    { email: 'investor.relations@sanabil.gov.sa', status: 'ACTIVE' as const },
    { email: 'systems.architect@sdaia.gov.sa', status: 'ACTIVE' as const },
    { email: 'founding.engineer@allam-ai.com', status: 'ACTIVE' as const },
    { email: 'director.infra@aramco.com', status: 'ACTIVE' as const },
    { email: 'tech.lead@stc.com.sa', status: 'ACTIVE' as const },
    { email: 'former.reader@example.com', status: 'UNSUBSCRIBED' as const },
  ];

  for (const sub of sampleSubscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: sub.email },
      update: { status: sub.status },
      create: {
        email: sub.email,
        status: sub.status,
        consentGivenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        unsubscribeToken: `unsub-${sub.email.split('@')[0]}`,
        unsubscribedAt: sub.status === 'UNSUBSCRIBED' ? new Date() : null,
      },
    });
  }
  console.log(`   ✓ Seeded ${sampleSubscribers.length} newsletter subscribers (5 active, 1 unsubscribed)`);

  // 9. Seed Newsletter Campaigns
  console.log('📰 Seeding demonstration newsletter campaigns...');
  await prisma.newsletterCampaign.upsert({
    where: { id: 'camp-sent-01' },
    update: {},
    create: {
      id: 'camp-sent-01',
      title: 'Saudi Future Tech Executive Dispatch #01',
      subject: 'Inside Sovereign Compute & Red Sea Off-Grid Microgrids',
      previewText: 'This week: ALLaM foundation model benchmarks and industrial 5G at OXAGON.',
      content: `Welcome to the inaugural Saudi Future Tech Executive Briefing.\n\nIn this dispatch:\n- SDAIA's Sovereign Compute Blueprint\n- Red Sea Global's 100% Off-Grid Solar & Battery Microgrid\n- SAMA Open Banking Sandbox Accelerators\n\nThank you for reading Saudi Future Tech.`,
      status: 'SENT',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      recipientCount: 5,
      createdById: adminUser.id,
    },
  });

  await prisma.newsletterCampaign.upsert({
    where: { id: 'camp-draft-01' },
    update: {},
    create: {
      id: 'camp-draft-01',
      title: 'Saudi Future Tech Executive Dispatch #02',
      subject: 'Quantum Sensors in Desalination & Autonomous Port Infrastructure',
      previewText: 'Previewing KAUST pilot trials and OXAGON automated port logistics.',
      content: `Welcome to the Saudi Future Tech Executive Briefing.\n\nKey Reports this week:\n- KAUST Quantum Salinity Sensor Trials\n- OXAGON Automated 5G Port Terminal Infrastructure\n\nStay ahead of the Kingdom's frontier technology transformation.`,
      status: 'DRAFT',
      createdById: editorUser.id,
    },
  });
  console.log('   ✓ Seeded 2 newsletter campaigns (1 sent, 1 draft)');

  console.log(`\n🎉 Seeding finished successfully!`);
  console.log(`   Categories: ${categoryMap.size}`);
  console.log(`   Authors: ${authorMap.size}`);
  console.log(`   Articles: ${articleCount} published + 1 draft + 1 in-review + 1 scheduled`);
  console.log(`   Subscribers: ${sampleSubscribers.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


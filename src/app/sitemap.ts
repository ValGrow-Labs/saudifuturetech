import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { getCanonicalUrl } from '@/lib/seo/config';
import { EDITORIAL_CATEGORIES } from '@/lib/constants';

// Revalidate sitemap every hour via Next.js ISR
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Core Public Pages & Directory Index Hubs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: getCanonicalUrl('/latest'),
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/insights'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: getCanonicalUrl('/opportunities'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/startups'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/funding'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/about'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/newsletter'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/privacy'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: getCanonicalUrl('/terms'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // 2. Published Articles (Strictly exclude drafts, scheduled, and archived stories)
    let articleRoutes: MetadataRoute.Sitemap = [];
    try {
      const publishedArticles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
        },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      });

      articleRoutes = publishedArticles.map((article) => ({
        url: getCanonicalUrl(`/article/${article.slug}`),
        lastModified: article.updatedAt || article.publishedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query published articles from DB:', error);
    }

    // 3. Published Startups Directory
    let startupRoutes: MetadataRoute.Sitemap = [];
    try {
      const publishedStartups = await prisma.startup.findMany({
        where: {
          isPublished: true,
        },
        select: {
          slug: true,
          updatedAt: true,
          verifiedAt: true,
        },
        orderBy: {
          verifiedAt: 'desc',
        },
      });

      startupRoutes = publishedStartups.map((startup) => ({
        url: getCanonicalUrl(`/startup/${startup.slug}`),
        lastModified: startup.updatedAt || startup.verifiedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query published startups from DB:', error);
    }

    // 4. Published Opportunities / Grants / Programs
    let opportunityRoutes: MetadataRoute.Sitemap = [];
    try {
      const publishedOpportunities = await prisma.opportunity.findMany({
        where: {
          isPublished: true,
        },
        select: {
          slug: true,
          updatedAt: true,
          verifiedAt: true,
          deadline: true,
        },
        orderBy: {
          verifiedAt: 'desc',
        },
      });

      opportunityRoutes = publishedOpportunities.map((opp) => ({
        url: getCanonicalUrl(`/opportunity/${opp.slug}`),
        lastModified: opp.updatedAt || opp.verifiedAt || new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query published opportunities from DB:', error);
    }

    // 5. Published Investors / VC Funds
    let investorRoutes: MetadataRoute.Sitemap = [];
    try {
      const publishedInvestors = await prisma.investor.findMany({
        where: {
          isPublished: true,
        },
        select: {
          slug: true,
          updatedAt: true,
          verifiedAt: true,
        },
        orderBy: {
          verifiedAt: 'desc',
        },
      });

      investorRoutes = publishedInvestors.map((inv) => ({
        url: getCanonicalUrl(`/investor/${inv.slug}`),
        lastModified: inv.updatedAt || inv.verifiedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query published investors from DB:', error);
    }

    // 6. Editorial Categories
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
      const categories = await prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      const activeCategories =
        categories.length > 0
          ? categories
          : EDITORIAL_CATEGORIES.map((c) => ({ slug: c.slug, updatedAt: new Date() }));

      categoryRoutes = activeCategories.map((category) => ({
        url: getCanonicalUrl(`/category/${category.slug}`),
        lastModified: category.updatedAt || new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query categories from DB:', error);
      categoryRoutes = EDITORIAL_CATEGORIES.map((c) => ({
        url: getCanonicalUrl(`/category/${c.slug}`),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    }

    // 7. Public Author Profiles (with published articles)
    let authorRoutes: MetadataRoute.Sitemap = [];
    try {
      const authors = await prisma.author.findMany({
        where: {
          articles: {
            some: {
              status: 'PUBLISHED',
            },
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      authorRoutes = authors.map((author) => ({
        url: getCanonicalUrl(`/author/${author.slug}`),
        lastModified: author.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.65,
      }));
    } catch (error) {
      console.warn('[Sitemap] Failed to query authors from DB:', error);
    }

    return [
      ...staticRoutes,
      ...articleRoutes,
      ...startupRoutes,
      ...opportunityRoutes,
      ...investorRoutes,
      ...categoryRoutes,
      ...authorRoutes,
    ];
  } catch (globalError) {
    console.warn('[Sitemap] Unexpected error during sitemap generation, returning static core routes:', globalError);
    return staticRoutes;
  }
}


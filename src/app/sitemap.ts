import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/config';
import { EDITORIAL_CATEGORIES } from '@/lib/constants';

// Revalidate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 1. Static Core Public Pages
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
  ];

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
    console.error('[Sitemap] Failed to query published articles from DB:', error);
  }

  // 3. Editorial Categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const activeCategories = categories.length > 0 ? categories : EDITORIAL_CATEGORIES.map((c) => ({ slug: c.slug, updatedAt: new Date() }));

    categoryRoutes = activeCategories.map((category) => ({
      url: getCanonicalUrl(`/category/${category.slug}`),
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to query categories from DB:', error);
    categoryRoutes = EDITORIAL_CATEGORIES.map((c) => ({
      url: getCanonicalUrl(`/category/${c.slug}`),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  }

  // 4. Public Author Profiles
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
    console.error('[Sitemap] Failed to query authors from DB:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...authorRoutes];
}


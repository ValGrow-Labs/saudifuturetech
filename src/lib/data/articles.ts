import prisma from '@/lib/prisma';
import { ArticleDetail } from '@/types';
import { mapPrismaArticleToArticleDetail } from './mappers';
import {
  getAllArticles as getStaticAllArticles,
  getArticleBySlug as getStaticArticleBySlug,
  getArticlesByCategory as getStaticArticlesByCategory,
  getArticlesByAuthor as getStaticArticlesByAuthor,
  getRelatedArticles as getStaticRelatedArticles,
  searchArticles as getStaticSearchArticles,
} from '@/lib/articles';

const defaultArticleInclude = {
  author: true,
  category: true,
  articleTags: {
    include: {
      tag: true,
    },
  },
} as const;

/**
 * Fetch a single published article by its unique slug.
 * Excludes drafts, scheduled, and archived articles.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: defaultArticleInclude,
    });

    if (!article) return null;
    return mapPrismaArticleToArticleDetail(article);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getArticleBySlug("${slug}"), using fallback:`, error);
    const fallback = getStaticArticleBySlug(slug);
    return fallback || null;
  }
}

/**
 * Fetch all published articles sorted chronologically by publication date descending.
 */
export async function getAllPublishedArticles(): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllPublishedArticles, using fallback:', error);
    return getStaticAllArticles();
  }
}

/**
 * Fetch the primary featured lead article for the homepage hero canvas.
 */
export async function getFeaturedArticle(): Promise<ArticleDetail | null> {
  try {
    const article = await prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        featured: true,
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    if (article) return mapPrismaArticleToArticleDetail(article);

    // Fallback to most recent published article if none flagged featured
    const latest = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      include: defaultArticleInclude,
      orderBy: { publishedAt: 'desc' },
    });

    return latest ? mapPrismaArticleToArticleDetail(latest) : null;
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getFeaturedArticle, using fallback:', error);
    const fallbackList = getStaticAllArticles();
    return fallbackList.find((a) => a.isFeatured) || fallbackList[0] || null;
  }
}

/**
 * Fetch secondary articles for the homepage asymmetrical sub-hero grid.
 */
export async function getSecondaryArticles(limit = 4): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        featured: false,
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getSecondaryArticles, using fallback:', error);
    return getStaticAllArticles().filter((a) => !a.isFeatured).slice(0, limit);
  }
}

/**
 * Fetch Editor's Picks articles for the 3-column curated section.
 */
export async function getEditorsPickArticles(limit = 4): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isEditorsPick: true,
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getEditorsPickArticles, using fallback:', error);
    return getStaticAllArticles().filter((a) => a.isEditorsPick).slice(0, limit);
  }
}

/**
 * Fetch trending articles based on the isTrending flag or velocity.
 */
export async function getTrendingArticles(limit = 5): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: defaultArticleInclude,
      orderBy: [
        { isTrending: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getTrendingArticles, using fallback:', error);
    return getStaticAllArticles().slice(0, limit);
  }
}

/**
 * Fetch articles belonging to a specific category slug.
 */
export async function getArticlesByCategory(categorySlug: string): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        category: {
          slug: categorySlug,
        },
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getArticlesByCategory("${categorySlug}"), using fallback:`, error);
    return getStaticArticlesByCategory(categorySlug);
  }
}

/**
 * Fetch articles published by a specific author slug.
 */
export async function getArticlesByAuthor(authorSlug: string): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        author: {
          slug: authorSlug,
        },
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getArticlesByAuthor("${authorSlug}"), using fallback:`, error);
    return getStaticArticlesByAuthor(authorSlug);
  }
}

/**
 * Fetch companion related stories within the same category, excluding the current article.
 */
export async function getRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  limit = 3
): Promise<ArticleDetail[]> {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        slug: { not: currentSlug },
        category: { slug: categorySlug },
      },
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getRelatedArticles("${currentSlug}"), using fallback:`, error);
    return getStaticRelatedArticles(currentSlug, categorySlug, limit);
  }
}

/**
 * Search articles across Title, Excerpt, Content, Author, Category, and Tags in PostgreSQL.
 */
export async function searchArticles(
  query: string,
  categorySlug?: string
): Promise<ArticleDetail[]> {
  const normalizedQuery = query.trim();

  try {
    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = {
        slug: categorySlug,
      };
    }

    if (normalizedQuery) {
      whereClause.OR = [
        { title: { contains: normalizedQuery, mode: 'insensitive' } },
        { excerpt: { contains: normalizedQuery, mode: 'insensitive' } },
        { content: { contains: normalizedQuery, mode: 'insensitive' } },
        { author: { name: { contains: normalizedQuery, mode: 'insensitive' } } },
        { category: { name: { contains: normalizedQuery, mode: 'insensitive' } } },
        {
          articleTags: {
            some: {
              tag: {
                name: { contains: normalizedQuery, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: defaultArticleInclude,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return articles.map(mapPrismaArticleToArticleDetail);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for searchArticles("${query}"), using fallback:`, error);
    return getStaticSearchArticles(query, categorySlug);
  }
}

/**
 * Get all published article slugs for SSG generateStaticParams.
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });
    return articles.map((a) => a.slug);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllArticleSlugs, using fallback:', error);
    return getStaticAllArticles().map((a) => a.slug);
  }
}


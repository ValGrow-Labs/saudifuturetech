import prisma from '@/lib/prisma';
import { CategoryWithTags, EDITORIAL_CATEGORIES } from '@/lib/categories';
import { mapPrismaCategoryToCategoryWithTags } from './mappers';

/**
 * Fetch all categories ordered by displayOrder with tags and article counts.
 */
export async function getAllCategories(): Promise<CategoryWithTags[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          include: {
            articleTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (categories.length === 0) return EDITORIAL_CATEGORIES;

    return categories.map((cat) => {
      const mapped = mapPrismaCategoryToCategoryWithTags(cat);
      // Merge with predefined static tags if DB has fewer tags
      const staticMeta = EDITORIAL_CATEGORIES.find((c) => c.slug === cat.slug);
      if (staticMeta && mapped.tags.length === 0) {
        mapped.tags = staticMeta.tags;
      }
      return mapped;
    });
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllCategories, using fallback:', error);
    return EDITORIAL_CATEGORIES;
  }
}

/**
 * Fetch a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithTags | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          include: {
            articleTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!category) return null;

    const mapped = mapPrismaCategoryToCategoryWithTags(category);
    const staticMeta = EDITORIAL_CATEGORIES.find((c) => c.slug === category.slug);
    if (staticMeta && mapped.tags.length === 0) {
      mapped.tags = staticMeta.tags;
    }
    return mapped;
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getCategoryBySlug("${slug}"), using fallback:`, error);
    const fallback = EDITORIAL_CATEGORIES.find((c) => c.slug === slug);
    return fallback || null;
  }
}

/**
 * Get all category slugs for static paths.
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    return categories.map((c) => c.slug);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllCategorySlugs, using fallback:', error);
    return EDITORIAL_CATEGORIES.map((c) => c.slug);
  }
}


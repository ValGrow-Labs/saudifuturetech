import prisma from '@/lib/prisma';
import { AuthorItem } from '@/types';
import { AUTHORS } from '@/lib/articles';
import { mapPrismaAuthorToAuthorItem } from './mappers';

/**
 * Fetch all editorial authors.
 */
export async function getAllAuthors(): Promise<AuthorItem[]> {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    if (authors.length === 0) return AUTHORS;

    return authors.map(mapPrismaAuthorToAuthorItem);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllAuthors, using fallback:', error);
    return AUTHORS;
  }
}

/**
 * Fetch an author by slug.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorItem | null> {
  try {
    const author = await prisma.author.findUnique({
      where: { slug },
    });

    if (!author) return null;
    return mapPrismaAuthorToAuthorItem(author);
  } catch (error) {
    console.warn(`[DataAccess] DB query failed for getAuthorBySlug("${slug}"), using fallback:`, error);
    const fallback = AUTHORS.find((a) => a.slug === slug);
    return fallback || null;
  }
}

/**
 * Get all author slugs for static paths.
 */
export async function getAllAuthorSlugs(): Promise<string[]> {
  try {
    const authors = await prisma.author.findMany({
      select: { slug: true },
    });
    return authors.map((a) => a.slug);
  } catch (error) {
    console.warn('[DataAccess] DB query failed for getAllAuthorSlugs, using fallback:', error);
    return AUTHORS.map((a) => a.slug);
  }
}


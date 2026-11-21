import { Prisma } from '@prisma/client';
import { ArticleDetail, AuthorItem, CategoryItem, ArticleSection } from '@/types';
import { CategoryWithTags } from '@/lib/categories';

export type PrismaArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    author: true;
    category: true;
    articleTags: {
      include: {
        tag: true;
      };
    };
  };
}>;

export type PrismaCategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    articles: {
      include: {
        articleTags: {
          include: {
            tag: true;
          };
        };
      };
    };
  };
}>;

export function mapPrismaAuthorToAuthorItem(author: Prisma.AuthorGetPayload<{}>): AuthorItem {
  const social = (author.socialLinks as { twitter?: string; linkedin?: string }) || {};

  return {
    id: author.id,
    displayName: author.name,
    slug: author.slug,
    title: author.title,
    avatarUrl: author.avatar || '',
    bio: author.bio || undefined,
    location: author.location || undefined,
    twitterHandle: social.twitter || undefined,
    linkedinUrl: social.linkedin || undefined,
  };
}

export function mapPrismaCategoryToCategoryItem(
  category: Prisma.CategoryGetPayload<{}>
): CategoryItem {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    color: category.accentColor || '#F4C542',
    displayOrder: category.displayOrder,
  };
}

export function mapPrismaCategoryToCategoryWithTags(
  category: PrismaCategoryWithRelations
): CategoryWithTags {
  // Extract distinct tag names from all articles in this category if loaded
  const tagsSet = new Set<string>();
  if (category.articles) {
    for (const art of category.articles) {
      for (const at of art.articleTags) {
        tagsSet.add(at.tag.name);
      }
    }
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    color: category.accentColor || '#F4C542',
    displayOrder: category.displayOrder,
    tags: Array.from(tagsSet).slice(0, 5),
    articleCountPreview: category.articles ? category.articles.length : 0,
  };
}

export function mapPrismaArticleToArticleDetail(
  article: PrismaArticleWithRelations
): ArticleDetail {
  const tags = article.articleTags.map((at) => at.tag.name);
  const sections = (article.structuredContent as unknown as ArticleSection[]) || [
    {
      paragraphs: article.content ? article.content.split('\n\n') : [],
    },
  ];

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImage,
    coverImageAlt: article.coverImageAlt || article.title,
    coverImageCaption: article.coverImageCaption || undefined,
    imageCredit: article.imageCredit || undefined,
    readingTimeMinutes: article.readingTime,
    publishedAt: article.publishedAt
      ? article.publishedAt.toISOString()
      : article.createdAt.toISOString(),
    updatedAt: article.updatedAt ? article.updatedAt.toISOString() : undefined,
    category: mapPrismaCategoryToCategoryItem(article.category),
    author: mapPrismaAuthorToAuthorItem(article.author),
    status: article.status as any,
    isFeatured: article.featured,
    isTrending: article.isTrending,
    isEditorsPick: article.isEditorsPick,
    tags,
    sampleContent: article.sampleContent,
    seoTitle: article.seoTitle || undefined,
    seoDescription: article.seoDescription || undefined,
    sections,
  };
}

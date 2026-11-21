'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import {
  getCurrentSessionUser,
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
} from '@/lib/auth/guard';
import { ArticleStatus } from '@prisma/client';

export interface ArticleActionState {
  success?: boolean;
  error?: string;
  articleId?: string;
  slug?: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(baseSlug: string, currentArticleId?: string): Promise<string> {
  let slug = baseSlug || 'untitled-story';
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (currentArticleId && existing.id === currentArticleId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function calculateReadingTime(text: string): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function revalidateAllArticleCaches(slug?: string, categorySlug?: string) {
  try {
    revalidatePath('/admin/articles');
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/latest');
    revalidatePath('/search');
    if (slug) {
      revalidatePath(`/article/${slug}`);
      revalidatePath(`/admin/articles/${slug}/preview`);
    }
    if (categorySlug) {
      revalidatePath(`/category/${categorySlug}`);
    }
  } catch (err) {
    console.error('[ArticleActions] Error revalidating paths:', err);
  }
}

/**
 * Create a new article.
 */
export async function createArticleAction(
  prevState: ArticleActionState | undefined,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) {
    return { error: 'Authentication required. Please log in.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const excerpt = (formData.get('excerpt') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  const categoryId = formData.get('categoryId') as string;
  let authorId = formData.get('authorId') as string;
  const coverImage =
    (formData.get('coverImage') as string)?.trim() ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  const coverImageAlt = (formData.get('coverImageAlt') as string)?.trim() || title;
  const coverImageCaption = (formData.get('coverImageCaption') as string)?.trim() || null;
  const imageCredit = (formData.get('imageCredit') as string)?.trim() || null;
  const seoTitle = (formData.get('seoTitle') as string)?.trim() || null;
  const seoDescription = (formData.get('seoDescription') as string)?.trim() || null;
  const featured = formData.get('featured') === 'true';
  const isTrending = formData.get('isTrending') === 'true';
  const isEditorsPick = formData.get('isEditorsPick') === 'true';
  const rawTags = (formData.get('tags') as string)?.trim() || '';
  const actionType = (formData.get('actionType') as string) || 'draft'; // draft, submit, publish, schedule
  const scheduledForStr = (formData.get('scheduledFor') as string)?.trim();
  const editorialFeedback = (formData.get('editorialFeedback') as string)?.trim() || null;

  if (!title) return { error: 'Article title is required.' };
  if (!excerpt) return { error: 'Article excerpt / standfirst is required.' };
  if (!content) return { error: 'Article body content is required.' };
  if (!categoryId) return { error: 'Editorial category is required.' };

  // If user is Author, enforce authorId to be their linked author profile
  if (user.role === 'AUTHOR') {
    if (!user.authorId) {
      return {
        error:
          'Your user account is not linked to an Author byline profile. Please contact an editor.',
      };
    }
    authorId = user.authorId;
  } else if (!authorId) {
    if (user.authorId) {
      authorId = user.authorId;
    } else {
      const firstAuthor = await prisma.author.findFirst();
      if (!firstAuthor)
        return { error: 'No authors found. Please create an author profile first.' };
      authorId = firstAuthor.id;
    }
  }

  // Determine initial status based on actionType and role
  let status: ArticleStatus = ArticleStatus.DRAFT;
  let publishedAt: Date | null = null;
  let scheduledFor: Date | null = null;

  if (actionType === 'submit') {
    status = ArticleStatus.IN_REVIEW;
  } else if (actionType === 'publish') {
    if (!canPublishArticle(user)) {
      return {
        error:
          'Permission denied: Only Editors and Super Admins can publish articles directly.',
      };
    }
    status = ArticleStatus.PUBLISHED;
    publishedAt = new Date();
  } else if (actionType === 'schedule') {
    if (!canPublishArticle(user)) {
      return {
        error: 'Permission denied: Only Editors and Super Admins can schedule articles.',
      };
    }
    if (!scheduledForStr) {
      return { error: 'A future publication date and time is required to schedule an article.' };
    }
    scheduledFor = new Date(scheduledForStr);
    if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      return { error: 'Scheduled publication date must be in the future.' };
    }
    status = ArticleStatus.SCHEDULED;
  }

  const baseSlug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
  const slug = await ensureUniqueSlug(baseSlug);
  const readingTime = calculateReadingTime(content);

  // Parse structured sections from content for editorial reading compatibility
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const sections = [
    {
      paragraphs: paragraphs.slice(0, 2),
    },
    ...(paragraphs.length > 2
      ? [
          {
            heading: 'Key Architectural Insights',
            paragraphs: paragraphs.slice(2),
          },
        ]
      : []),
  ];

  try {
    const article = await prisma.$transaction(async (tx) => {
      const created = await tx.article.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          structuredContent: sections,
          coverImage,
          coverImageAlt,
          coverImageCaption,
          imageCredit,
          status,
          featured,
          isTrending,
          isEditorsPick,
          readingTime,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          publishedAt,
          scheduledFor,
          sampleContent: false,
          authorId,
          categoryId,
        },
        include: {
          category: { select: { slug: true } },
        },
      });

      // Record initial creation in Review History
      await tx.articleReviewHistory.create({
        data: {
          articleId: created.id,
          previousStatus: ArticleStatus.DRAFT,
          newStatus: status,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          feedback:
            status === ArticleStatus.IN_REVIEW
              ? editorialFeedback || 'Initial draft submitted for review.'
              : status === ArticleStatus.PUBLISHED
              ? 'Article drafted and published directly.'
              : status === ArticleStatus.SCHEDULED
              ? `Scheduled for publication at ${scheduledFor?.toISOString()}`
              : 'Initial draft created.',
        },
      });

      // Handle Tags
      if (rawTags) {
        const tagNames = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
        for (const tagName of tagNames) {
          const tagSlug = generateSlug(tagName);
          const tag = await tx.tag.upsert({
            where: { slug: tagSlug },
            update: { name: tagName },
            create: { name: tagName, slug: tagSlug },
          });

          await tx.articleTag.create({
            data: {
              articleId: created.id,
              tagId: tag.id,
            },
          });
        }
      }

      return created;
    });

    revalidateAllArticleCaches(article.slug, article.category.slug);

    return {
      success: true,
      articleId: article.id,
      slug: article.slug,
    };
  } catch (error: any) {
    console.error('[ArticleActions] Create article failed:', error);
    return { error: error.message || 'Failed to create article in database.' };
  }
}

/**
 * Update an existing article.
 */
export async function updateArticleAction(
  prevState: ArticleActionState | undefined,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) {
    return { error: 'Authentication required. Please log in.' };
  }

  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing article ID.' };

  const existingArticle = await prisma.article.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!existingArticle) {
    return { error: 'Article not found.' };
  }

  // Permission check
  if (!canEditArticle(user, existingArticle)) {
    return { error: 'Permission denied: You do not have permission to edit this article.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const excerpt = (formData.get('excerpt') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  const categoryId = formData.get('categoryId') as string;
  let authorId = formData.get('authorId') as string;
  const coverImage =
    (formData.get('coverImage') as string)?.trim() || existingArticle.coverImage;
  const coverImageAlt = (formData.get('coverImageAlt') as string)?.trim() || title;
  const coverImageCaption = (formData.get('coverImageCaption') as string)?.trim() || null;
  const imageCredit = (formData.get('imageCredit') as string)?.trim() || null;
  const seoTitle = (formData.get('seoTitle') as string)?.trim() || null;
  const seoDescription = (formData.get('seoDescription') as string)?.trim() || null;
  const featured = formData.get('featured') === 'true';
  const isTrending = formData.get('isTrending') === 'true';
  const isEditorsPick = formData.get('isEditorsPick') === 'true';
  const rawTags = (formData.get('tags') as string)?.trim() || '';
  const actionType = (formData.get('actionType') as string) || 'save'; // save, submit, publish, unpublish, schedule
  const scheduledForStr = (formData.get('scheduledFor') as string)?.trim();
  const editorialFeedback = (formData.get('editorialFeedback') as string)?.trim() || null;

  if (!title) return { error: 'Article title is required.' };
  if (!excerpt) return { error: 'Article excerpt is required.' };
  if (!content) return { error: 'Article body content is required.' };
  if (!categoryId) return { error: 'Editorial category is required.' };

  // Role checks for author ID assignment
  if (user.role === 'AUTHOR') {
    authorId = existingArticle.authorId;
  } else if (!authorId) {
    authorId = existingArticle.authorId;
  }

  const previousStatus = existingArticle.status;
  let status = existingArticle.status;
  let publishedAt = existingArticle.publishedAt;
  let scheduledFor = existingArticle.scheduledFor;

  if (actionType === 'submit') {
    status = ArticleStatus.IN_REVIEW;
  } else if (actionType === 'publish') {
    if (!canPublishArticle(user)) {
      return {
        error: 'Permission denied: Only Editors and Super Admins can publish articles.',
      };
    }
    status = ArticleStatus.PUBLISHED;
    scheduledFor = null;
    if (!publishedAt) {
      publishedAt = new Date();
    }
  } else if (actionType === 'unpublish') {
    if (!canPublishArticle(user)) {
      return {
        error: 'Permission denied: Only Editors and Super Admins can unpublish articles.',
      };
    }
    status = ArticleStatus.DRAFT;
    scheduledFor = null;
  } else if (actionType === 'schedule') {
    if (!canPublishArticle(user)) {
      return {
        error: 'Permission denied: Only Editors and Super Admins can schedule articles.',
      };
    }
    if (!scheduledForStr) {
      return { error: 'A future publication date and time is required to schedule an article.' };
    }
    scheduledFor = new Date(scheduledForStr);
    if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      return { error: 'Scheduled publication date must be in the future.' };
    }
    status = ArticleStatus.SCHEDULED;
  }

  const baseSlug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, existingArticle.id);
  const readingTime = calculateReadingTime(content);

  // Parse structured content
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const sections = [
    {
      paragraphs: paragraphs.slice(0, 2),
    },
    ...(paragraphs.length > 2
      ? [
          {
            heading: 'Key Architectural Insights',
            paragraphs: paragraphs.slice(2),
          },
        ]
      : []),
  ];

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const articleRecord = await tx.article.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content,
          structuredContent: sections,
          coverImage,
          coverImageAlt,
          coverImageCaption,
          imageCredit,
          status,
          featured,
          isTrending,
          isEditorsPick,
          readingTime,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          publishedAt,
          scheduledFor,
          authorId,
          categoryId,
        },
        include: {
          category: { select: { slug: true } },
        },
      });

      // If status changed or editorial feedback provided, record in review history
      if (previousStatus !== status || editorialFeedback) {
        await tx.articleReviewHistory.create({
          data: {
            articleId: id,
            previousStatus,
            newStatus: status,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            feedback:
              editorialFeedback ||
              (status === ArticleStatus.IN_REVIEW
                ? 'Article submitted for review.'
                : status === ArticleStatus.PUBLISHED
                ? 'Article published to live site.'
                : status === ArticleStatus.SCHEDULED
                ? `Article scheduled for ${scheduledFor?.toISOString()}`
                : status === ArticleStatus.DRAFT && previousStatus === ArticleStatus.PUBLISHED
                ? 'Article unpublished to draft.'
                : 'Article revision saved.'),
          },
        });
      }

      // Update tags
      await tx.articleTag.deleteMany({
        where: { articleId: id },
      });

      if (rawTags) {
        const tagNames = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
        for (const tagName of tagNames) {
          const tagSlug = generateSlug(tagName);
          const tag = await tx.tag.upsert({
            where: { slug: tagSlug },
            update: { name: tagName },
            create: { name: tagName, slug: tagSlug },
          });

          await tx.articleTag.create({
            data: {
              articleId: id,
              tagId: tag.id,
            },
          });
        }
      }

      return articleRecord;
    });

    revalidateAllArticleCaches(updated.slug, updated.category.slug);
    if (existingArticle.slug !== updated.slug) {
      revalidateAllArticleCaches(existingArticle.slug, existingArticle.category.slug);
    }

    return {
      success: true,
      articleId: updated.id,
      slug: updated.slug,
    };
  } catch (error: any) {
    console.error('[ArticleActions] Update article failed:', error);
    return { error: error.message || 'Failed to update article in database.' };
  }
}

/**
 * Transition status: Submit for Review (Authors & Editors)
 */
export async function submitForReviewAction(
  articleId: string,
  notes?: string
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };
  if (!canEditArticle(user, article)) {
    return { error: 'Permission denied: You cannot submit this article for review.' };
  }

  const previousStatus = article.status;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.IN_REVIEW },
    });

    await tx.articleReviewHistory.create({
      data: {
        articleId,
        previousStatus,
        newStatus: ArticleStatus.IN_REVIEW,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        feedback: notes || 'Article submitted for editorial review.',
      },
    });
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true, articleId };
}

/**
 * Transition status: Request Revisions (Return to Draft with Feedback - Editors/Admins only)
 */
export async function requestRevisionsAction(
  articleId: string,
  feedback: string
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };
  if (!canPublishArticle(user)) {
    return { error: 'Only Editors and Super Admins can request revisions on submissions.' };
  }

  if (!feedback || feedback.trim().length === 0) {
    return { error: 'Editorial feedback is required when requesting revisions.' };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };

  const previousStatus = article.status;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.DRAFT },
    });

    await tx.articleReviewHistory.create({
      data: {
        articleId,
        previousStatus,
        newStatus: ArticleStatus.DRAFT,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        feedback: feedback.trim(),
      },
    });
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true, articleId };
}

/**
 * Transition status: Publish Article (Editors & Super Admins)
 */
export async function publishArticleAction(
  articleId: string,
  notes?: string
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };
  if (!canPublishArticle(user)) {
    return { error: 'Only Editors and Super Admins can publish articles.' };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };

  const previousStatus = article.status;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.publishedAt || new Date(),
        scheduledFor: null,
      },
    });

    await tx.articleReviewHistory.create({
      data: {
        articleId,
        previousStatus,
        newStatus: ArticleStatus.PUBLISHED,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        feedback: notes || 'Article approved and published to live publication.',
      },
    });
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true, articleId };
}

/**
 * Transition status: Schedule Article (Editors & Super Admins)
 */
export async function scheduleArticleAction(
  articleId: string,
  scheduledForDate: string | Date,
  notes?: string
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };
  if (!canPublishArticle(user)) {
    return { error: 'Only Editors and Super Admins can schedule articles.' };
  }

  const scheduledFor =
    typeof scheduledForDate === 'string' ? new Date(scheduledForDate) : scheduledForDate;

  if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
    return { error: 'Scheduled publication date must be a valid future timestamp.' };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };

  const previousStatus = article.status;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.SCHEDULED,
        scheduledFor,
      },
    });

    await tx.articleReviewHistory.create({
      data: {
        articleId,
        previousStatus,
        newStatus: ArticleStatus.SCHEDULED,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        feedback:
          notes ||
          `Article scheduled for publication on ${scheduledFor.toLocaleString('en-US', {
            timeZone: 'UTC',
          })} UTC.`,
      },
    });
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true, articleId };
}

/**
 * Transition status: Unpublish to Draft (Editors & Super Admins)
 */
export async function unpublishArticleAction(
  articleId: string,
  reason?: string
): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };
  if (!canPublishArticle(user)) {
    return { error: 'Only Editors and Super Admins can unpublish articles.' };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };

  const previousStatus = article.status;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.DRAFT,
        scheduledFor: null,
      },
    });

    await tx.articleReviewHistory.create({
      data: {
        articleId,
        previousStatus,
        newStatus: ArticleStatus.DRAFT,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        feedback: reason || 'Article reverted to draft state.',
      },
    });
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true, articleId };
}

/**
 * Delete Article
 */
export async function deleteArticleAction(articleId: string): Promise<ArticleActionState> {
  const user = await getCurrentSessionUser();
  if (!user) return { error: 'Authentication required.' };

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { category: true },
  });

  if (!article) return { error: 'Article not found.' };
  if (!canDeleteArticle(user, article)) {
    return {
      error:
        user.role === 'AUTHOR'
          ? 'Authors can only delete their own DRAFT articles.'
          : 'Permission denied to delete this article.',
    };
  }

  await prisma.article.delete({
    where: { id: articleId },
  });

  revalidateAllArticleCaches(article.slug, article.category.slug);
  return { success: true };
}

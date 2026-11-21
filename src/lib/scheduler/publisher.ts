import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';

export interface SchedulerExecutionResult {
  timestamp: string;
  processed: number;
  published: number;
  failed: number;
  publishedArticles: Array<{ id: string; title: string; slug: string }>;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Execute the automated publication of all articles with status SCHEDULED
 * whose scheduledFor timestamp is in the past (<= now).
 * 
 * Implements atomic concurrency protection to prevent duplicate execution
 * when triggered concurrently.
 */
export async function publishScheduledArticles(): Promise<SchedulerExecutionResult> {
  const now = new Date();
  const errors: Array<{ id: string; error: string }> = [];
  const publishedArticles: Array<{ id: string; title: string; slug: string }> = [];

  // 1. Query all eligible articles
  const eligibleArticles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.SCHEDULED,
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      category: { select: { slug: true } },
    },
  });

  if (eligibleArticles.length === 0) {
    return {
      timestamp: now.toISOString(),
      processed: 0,
      published: 0,
      failed: 0,
      publishedArticles: [],
      errors: [],
    };
  }

  // 2. Process each eligible article in an isolated transaction
  for (const article of eligibleArticles) {
    try {
      const wasPublished = await prisma.$transaction(async (tx) => {
        // Concurrency guard: Only update if the article is still in SCHEDULED status
        const updateResult = await tx.article.updateMany({
          where: {
            id: article.id,
            status: ArticleStatus.SCHEDULED,
          },
          data: {
            status: ArticleStatus.PUBLISHED,
            publishedAt: now,
            scheduledFor: null,
          },
        });

        if (updateResult.count === 0) {
          // Already published by a concurrent job
          return false;
        }

        // Record successful automated publication in review history
        await tx.articleReviewHistory.create({
          data: {
            articleId: article.id,
            previousStatus: ArticleStatus.SCHEDULED,
            newStatus: ArticleStatus.PUBLISHED,
            feedback: `Published automatically by Publishing Scheduler. (Scheduled publication timestamp: ${article.scheduledFor?.toISOString()})`,
          },
        });

        return true;
      });

      if (wasPublished) {
        publishedArticles.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
        });

        // Revalidate caches for this article
        try {
          revalidatePath('/admin/articles');
          revalidatePath('/admin');
          revalidatePath('/');
          revalidatePath('/latest');
          revalidatePath(`/article/${article.slug}`);
          if (article.category?.slug) {
            revalidatePath(`/category/${article.category.slug}`);
          }
        } catch (cacheErr) {
          console.warn('[Scheduler] Cache revalidation warning:', cacheErr);
        }
      }
    } catch (err: any) {
      console.error(`[Scheduler] Failed to publish scheduled article ${article.id}:`, err);
      errors.push({
        id: article.id,
        error: err.message || 'Unknown database error during scheduled publication',
      });
    }
  }

  return {
    timestamp: now.toISOString(),
    processed: eligibleArticles.length,
    published: publishedArticles.length,
    failed: errors.length,
    publishedArticles,
    errors,
  };
}


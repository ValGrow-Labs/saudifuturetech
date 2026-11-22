import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireAuth, canEditArticle } from '@/lib/auth/guard';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';

export const dynamic = 'force-dynamic';

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const currentUser = await requireAuth();
  const { id } = await params;

  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        articleTags: {
          include: { tag: true },
        },
        reviewHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!article) {
    notFound();
  }

  // Permission check
  if (!canEditArticle(currentUser, article)) {
    return (
      <div className="border-y border-rule py-12 max-w-xl">
        <p className="font-serif text-display-sm text-ink">You can&rsquo;t edit this article</p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
          Authors can only edit articles under their own byline. Ask an editor if this one needs changes.
        </p>
        <Link href="/admin/articles" className="mt-6 inline-block text-sm text-ink link-rule">
          Back to articles →
        </Link>
      </div>
    );
  }

  const initialData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    coverImageAlt: article.coverImageAlt,
    coverImageCaption: article.coverImageCaption,
    imageCredit: article.imageCredit,
    status: article.status,
    featured: article.featured,
    isEditorsPick: article.isEditorsPick,
    isTrending: article.isTrending,
    readingTime: article.readingTime,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    authorId: article.authorId,
    categoryId: article.categoryId,
    tags: article.articleTags.map((at) => at.tag.name),
    scheduledFor: article.scheduledFor,
    reviewHistory: article.reviewHistory,
  };

  return (
    <div className="space-y-6">
      <ArticleEditorForm
        isNew={false}
        initialData={initialData}
        categories={categories}
        authors={authors}
        currentUser={currentUser}
      />
    </div>
  );
}


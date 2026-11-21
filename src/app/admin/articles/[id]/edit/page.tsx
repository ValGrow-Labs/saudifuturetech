import React from 'react';
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
      <div className="p-8 bg-brand-surface rounded-sm border border-sft text-center space-y-3 font-sans">
        <h2 className="text-lg font-bold text-red-400 font-heading">Access Denied</h2>
        <p className="text-xs text-sft-text-muted max-w-md mx-auto">
          You do not have permission to edit this article. As an Author, you can only modify stories linked to your own contributor byline.
        </p>
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
    <div className="space-y-6 font-sans">
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


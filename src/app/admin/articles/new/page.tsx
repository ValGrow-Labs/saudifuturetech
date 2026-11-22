import React from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/guard';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const currentUser = await requireAuth();

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <ArticleEditorForm
        isNew={true}
        categories={categories}
        authors={authors}
        currentUser={currentUser}
      />
    </div>
  );
}


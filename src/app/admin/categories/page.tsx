import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
          Editorial Taxonomy
        </div>
        <PageHeading
          title="Editorial Pillar Categories"
          description="Configure coverage pillars, accent colors, slug routing, and homepage priority ordering."
          size="lg"
        />
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}


import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { TagManager } from '@/components/admin/TagManager';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { articleTags: true },
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
          title="Topic Tags & Taxonomy"
          description="Manage keywords, topics, and cross-cutting themes linking Saudi Future Tech articles."
          size="lg"
        />
      </div>

      <TagManager tags={tags} />
    </div>
  );
}


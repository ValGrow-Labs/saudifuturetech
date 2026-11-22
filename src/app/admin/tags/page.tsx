import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
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

  return <TagManager tags={tags} />;
}

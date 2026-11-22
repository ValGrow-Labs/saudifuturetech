import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { AuthorManager } from '@/components/admin/AuthorManager';

export const dynamic = 'force-dynamic';

export default async function AdminAuthorsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const authors = await prisma.author.findMany({
    orderBy: { name: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      _count: {
        select: { articles: true },
      },
    },
  });

  return <AuthorManager authors={authors} />;
}

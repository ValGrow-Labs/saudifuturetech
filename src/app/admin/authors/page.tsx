import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
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

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
          Editorial Team
        </div>
        <PageHeading
          title="Editorial Contributors & Bylines"
          description="Manage journalist profiles, biographical information, avatars, and linked login accounts."
          size="lg"
        />
      </div>

      <AuthorManager authors={authors} />
    </div>
  );
}


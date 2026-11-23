import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { StartupManager } from '@/components/admin/StartupManager';

export const dynamic = 'force-dynamic';

export default async function AdminStartupsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const [startups, categories] = await Promise.all([
    prisma.startup.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { verifiedAt: 'desc' },
        { name: 'asc' },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            accentColor: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return <StartupManager startups={startups} categories={categories} />;
}

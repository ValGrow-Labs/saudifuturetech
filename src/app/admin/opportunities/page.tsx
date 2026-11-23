import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { OpportunityManager } from '@/components/admin/OpportunityManager';

export const dynamic = 'force-dynamic';

export default async function AdminOpportunitiesPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const [opportunities, categories] = await Promise.all([
    prisma.opportunity.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        categoryRel: {
          select: {
            id: true,
            name: true,
            slug: true,
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

  return <OpportunityManager opportunities={opportunities} categories={categories} />;
}

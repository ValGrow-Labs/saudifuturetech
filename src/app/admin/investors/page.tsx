import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { InvestorManager } from '@/components/admin/InvestorManager';

export const dynamic = 'force-dynamic';

export default async function AdminInvestorsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const investors = await prisma.investor.findMany({
    orderBy: [
      { isFeatured: 'desc' },
      { verifiedAt: 'desc' },
      { name: 'asc' },
    ],
  });

  return <InvestorManager initialInvestors={investors} />;
}

import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { InvestorManager } from '@/components/admin/InvestorManager';
import { Coins, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-brand-desertGold" />
            <span>Institutional Capital Desk &amp; Regulatory Audit</span>
          </div>
          <PageHeading
            title="Saudi Investor &amp; Funding Intelligence"
            description="Manage active institutional venture funds, verify CMA licenses and SVC partnership evidence, enforce check size accuracy, and control publication state."
            size="lg"
          />
        </div>
      </div>

      <InvestorManager initialInvestors={investors} />
    </div>
  );
}

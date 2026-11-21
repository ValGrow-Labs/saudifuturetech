import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { OpportunityManager } from '@/components/admin/OpportunityManager';
import { Coins } from 'lucide-react';

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

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-brand-oasis" />
            <span>Founder Capital Radar &amp; Opportunity Hub</span>
          </div>
          <PageHeading
            title="Opportunity Hub Management"
            description="Verify non-dilutive grants, accelerators, subsidies, and regulatory sandboxes. Review official ministry sources, validate provenance, and manage publication status."
            size="lg"
          />
        </div>
      </div>

      <OpportunityManager opportunities={opportunities} categories={categories} />
    </div>
  );
}

import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { StartupManager } from '@/components/admin/StartupManager';
import { Building2 } from 'lucide-react';

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

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-teal" />
            <span>Sovereign Ventures Registry &amp; CR Audit</span>
          </div>
          <PageHeading
            title="Saudi Startups Directory Management"
            description="Audit Commercial Registrations (CR), review technological disclosures, manage source provenance, and oversee publication state."
            size="lg"
          />
        </div>
      </div>

      <StartupManager startups={startups} categories={categories} />
    </div>
  );
}

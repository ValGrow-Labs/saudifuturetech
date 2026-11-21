import React from 'react';
import { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { getOpportunities } from '@/lib/founder-intelligence';
import { OpportunityDirectory, OpportunityItem } from '@/components/public/OpportunityDirectory';
import { Coins, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { OpportunityCategory, OpportunityStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Opportunity Hub & Grant Radar | Saudi Future Tech',
  description:
    'Verified non-dilutive government grants, venture accelerators, innovation subsidies, and regulatory sandboxes for founders building in Saudi Arabia. Verified with official ministry sources.',
};

export const revalidate = 60; // 1-minute ISR

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    pillar?: string;
    status?: string;
    eligibility?: string;
    sort?: string;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  // Fetch verified categories for the pillar selector
  const [rawCategories, rawOpportunities] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        accentColor: true,
      },
    }),
    getOpportunities({
      search: resolvedParams.q,
      category: resolvedParams.category as OpportunityCategory,
      categorySlug: resolvedParams.pillar,
      status: resolvedParams.status as OpportunityStatus,
      eligibility: resolvedParams.eligibility as any,
      sort: resolvedParams.sort as any,
      includeUnpublished: false, // Strict: show only published
    }),
  ]);

  // Serialize opportunities for client component
  const opportunities: OpportunityItem[] = rawOpportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
    slug: opp.slug,
    organization: opp.organization,
    category: opp.category,
    fundingAmount: opp.fundingAmount,
    equityTaken: opp.equityTaken,
    location: opp.location,
    description: opp.description,
    eligibilitySummary: opp.eligibilitySummary,
    eligibilityCriteria: opp.eligibilityCriteria,
    benefits: opp.benefits,
    requirements: opp.requirements,
    status: opp.effectiveStatus,
    isExpired: Boolean(opp.isExpired),
    deadline: opp.deadline ? opp.deadline.toISOString() : null,
    applicationUrl: opp.applicationUrl,
    sourceName: opp.sourceName,
    sourceUrl: opp.sourceUrl,
    verifiedAt: opp.verifiedAt.toISOString(),
    verifiedBy: opp.verifiedBy,
    isFeatured: opp.isFeatured,
    isPublished: opp.isPublished,
    categoryRel: opp.categoryRel,
  }));

  const activeProgramsCount = opportunities.filter((o) => !o.isExpired && o.status !== OpportunityStatus.CLOSED).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827] font-sans">
      <SiteHeader />

      <main className="flex-1 pb-20">
        {/* 1. Page Hero Banner & Institutional Verification Strip */}
        <div className="bg-[#FAF9F6] border-b border-[#E2E8E4] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F5F2] border border-[#E2E8E4] text-xs font-semibold text-[#0A1F2C]">
                <Compass className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>KSA Founder Capital &amp; Opportunity Hub</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                Saudi Opportunity Hub &amp; Grant Radar
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                Discover verified non-dilutive government grants, venture accelerators, innovation vouchers, and regulatory sandboxes across Saudi Arabia. Every opportunity is strictly vetted against official ministry portals with verified application URLs.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B6E4F]" />
                  <span className="font-semibold text-[#111827]">
                    {activeProgramsCount} Active Programs Available Now
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                  <span>Official Ministerial Provenance • Zero Speculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#C9A227]" />
                  <span>SAR 150M+ In Tracked Founder Capital</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Directory, Filter, & Opportunity Dossier Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <OpportunityDirectory
            initialOpportunities={opportunities}
            availablePillars={rawCategories.map((c) => ({
              slug: c.slug,
              name: c.name,
              color: c.accentColor || '#39765B',
            }))}
            initialQuery={resolvedParams.q || ''}
            initialCategory={resolvedParams.category || 'ALL'}
            initialPillar={resolvedParams.pillar || 'ALL'}
            initialStatus={resolvedParams.status || 'ALL'}
            initialEligibility={resolvedParams.eligibility || 'ALL'}
            initialSort={resolvedParams.sort || 'deadline-asc'}
          />
        </div>

        {/* 3. Program Submission Callout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-brand-navy text-white rounded-lg p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                For Program Managers &amp; Ecosystem Operators
              </span>
              <h2 className="text-2xl font-heading font-bold text-white">
                Operating a grant, accelerator cohort, or sandbox in KSA?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Submit your program to our editorial desk for verification. Verification is 100% free for authorized public entities and private accelerators operating in Saudi Arabia.
              </p>
            </div>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand-yellow text-ink-high font-bold text-xs uppercase tracking-wider hover:bg-brand-yellow-hover transition-all shrink-0"
            >
              <span>Submit Verification Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

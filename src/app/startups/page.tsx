import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { getStartups } from '@/lib/founder-intelligence';
import prisma from '@/lib/prisma';
import { StartupDirectory, StartupItem } from '@/components/public/StartupDirectory';
import { Building2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Saudi Startup Directory | Saudi Future Tech',
  description:
    'Verified registry of technology startups and scaleups building in the Kingdom of Saudi Arabia across AI, FinTech, GovTech, Clean Energy, and Smart Cities.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    pillar?: string;
    city?: string;
    model?: string;
    stage?: string;
    crVerified?: string;
    sort?: string;
  }>;
}

export default async function StartupsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const [rawStartups, categories] = await Promise.all([
    getStartups({
      search: resolvedParams.q,
      categorySlug: resolvedParams.pillar,
      hqCity: resolvedParams.city,
      businessModel: resolvedParams.model as any,
      stage: resolvedParams.stage as any,
      crVerifiedOnly: resolvedParams.crVerified === 'true',
      sort: resolvedParams.sort as any,
      includeUnpublished: false,
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, accentColor: true },
    }),
  ]);

  const startups: StartupItem[] = rawStartups.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline,
    description: s.description,
    logoUrl: s.logoUrl,
    websiteUrl: s.websiteUrl,
    hqCity: s.hqCity,
    foundingYear: s.foundingYear,
    stage: s.stage,
    businessModel: s.businessModel,
    verified: s.verified,
    crVerified: s.crVerified,
    crNumber: s.crNumber,
    sourceName: s.sourceName,
    sourceUrl: s.sourceUrl,
    verifiedAt: s.verifiedAt.toISOString(),
    verifiedBy: s.verifiedBy,
    isFeatured: s.isFeatured,
    isPublished: s.isPublished,
    products: s.products,
    fundingDisclosed: s.fundingDisclosed,
    investorsDisclosed: s.investorsDisclosed,
    techStack: s.techStack,
    keyMetrics: s.keyMetrics,
    category: s.category,
  }));

  const crVerifiedCount = startups.filter((s) => s.crVerified).length;
  const uniqueCities = Array.from(new Set(startups.map((s) => s.hqCity))).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827] font-sans">
      <SiteHeader />

      <main className="flex-1 pb-20">
        {/* 1. Page Hero Banner */}
        <div className="bg-[#FAF9F6] border-b border-[#E2E8E4] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F5F2] border border-[#E2E8E4] text-xs font-semibold text-[#0A1F2C]">
                <Building2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>Verified Saudi Tech Registry</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                Saudi Startup Directory
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                Explore verified technology companies founded or headquartered in Saudi Arabia. Track their stages, core tech stacks, business models, and verified traction across the Kingdom’s six economic pillars.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B6E4F]" />
                  <span className="font-bold text-[#111827]">{startups.length} Verified Ventures</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                  <span>{crVerifiedCount} Commercial Registrations (CR) Audited</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#19B5A3]" />
                  <span>{uniqueCities} Sovereign Tech Hubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A227]" />
                  <span>Zero Speculation Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Directory Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <StartupDirectory
            initialStartups={startups}
            categories={categories}
            initialFilters={{
              q: resolvedParams.q || '',
              pillar: resolvedParams.pillar || 'ALL',
              city: resolvedParams.city || 'ALL',
              model: resolvedParams.model || 'ALL',
              stage: resolvedParams.stage || 'ALL',
              crVerified: resolvedParams.crVerified === 'true',
              sort: resolvedParams.sort || 'RECENT',
            }}
          />
        </div>

        {/* 3. Founder Submission Callout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-[#0A1F2C] text-white rounded-lg p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border border-[#1E3A4C]">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19B5A3]">
                Are you a founder building in Saudi Arabia?
              </span>
              <h2 className="text-2xl font-heading font-bold text-white">
                Get your venture listed in the SFT Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Submit your company profile for editorial verification. Reach Saudi institutional investors, sovereign funds, and fellow technical builders.
              </p>
            </div>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-xs"
            >
              <span>Submit Your Startup</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

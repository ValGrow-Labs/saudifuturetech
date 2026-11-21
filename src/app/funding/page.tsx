import React from 'react';
import { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { getInvestors, InvestorFilters } from '@/lib/founder-intelligence';
import { FundingDirectory, InvestorItem } from '@/components/public/FundingDirectory';
import { Coins, ShieldCheck, TrendingUp, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Saudi Venture Capital & Institutional Investor Directory | Saudi Future Tech',
  description:
    'Verified database of active venture capital firms, sovereign funds (SVC, PIF/Sanabil), CMA-authorized fund managers, and angel syndicates deploying capital in Saudi Arabia.',
};

export const revalidate = 60; // 1-minute ISR

interface FundingPageProps {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    stage?: string;
    sector?: string;
    cma?: string;
    svc?: string;
    active?: string;
    sort?: string;
  }>;
}

export default async function FundingPage({ searchParams }: FundingPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.q || '';
  const typeFilter = resolvedParams.type as any;
  const stageFilter = resolvedParams.stage || 'ALL';
  const sectorFilter = resolvedParams.sector || 'ALL';
  const cmaOnly = resolvedParams.cma === 'true';
  const svcOnly = resolvedParams.svc === 'true';
  const activeOnly = resolvedParams.active === 'true';
  const sort = resolvedParams.sort as any;

  const filters: InvestorFilters = {
    search: query || undefined,
    type: typeFilter && typeFilter !== 'ALL' ? typeFilter : undefined,
    stage: stageFilter !== 'ALL' ? stageFilter : undefined,
    sector: sectorFilter !== 'ALL' ? sectorFilter : undefined,
    cmaAuthorizedOnly: cmaOnly || undefined,
    svcPartnerOnly: svcOnly || undefined,
    activeInvestingOnly: activeOnly || undefined,
    sort: sort || undefined,
  };

  const rawInvestors = await getInvestors(filters);

  // Also get full list to compute aggregate directory stats
  const allInvestors = await getInvestors({});
  const totalFunds = allInvestors.length;
  const cmaAuthorizedCount = allInvestors.filter((inv) => inv.isCmaAuthorized).length;
  const svcPartnerCount = allInvestors.filter((inv) => inv.isSvcPartner).length;
  const activeInvestingCount = allInvestors.filter((inv) => inv.isActiveInvesting).length;

  const investors: InvestorItem[] = rawInvestors.map((inv) => ({
    id: inv.id,
    name: inv.name,
    slug: inv.slug,
    type: inv.type,
    hqLocation: inv.hqLocation,
    logoUrl: inv.logoUrl,
    websiteUrl: inv.websiteUrl,
    pitchUrl: inv.pitchUrl,
    isCmaAuthorized: inv.isCmaAuthorized,
    cmaLicenseNumber: inv.cmaLicenseNumber,
    isSvcPartner: inv.isSvcPartner,
    svcProgramDetails: inv.svcProgramDetails,
    regulatoryCategory: inv.regulatoryCategory,
    saudiRegulated: inv.saudiRegulated,
    licenseDetails: inv.licenseDetails,
    isActiveInvesting: inv.isActiveInvesting,
    targetStages: inv.targetStages,
    targetSectors: inv.targetSectors,
    checkSizeRange: inv.checkSizeRange,
    portfolioHighlights: inv.portfolioHighlights,
    description: inv.description,
    thesisSummary: inv.thesisSummary,
    sourceName: inv.sourceName,
    sourceUrl: inv.sourceUrl,
    verifiedAt: inv.verifiedAt.toISOString(),
    isFeatured: inv.isFeatured,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827]">
      <SiteHeader />
      <main className="flex-1 pb-20">
        {/* 1. Page Hero Banner */}
        <div className="bg-[#F1F5F2] border-b border-[#E2E8E4] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8E4] text-xs font-semibold text-[#111827]">
                <Coins className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Saudi Institutional Funding Intelligence Desk</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                Saudi Investor Directory &amp; Funding Intelligence
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                Verified institutional directory tracking active venture capital firms, CMA-authorized fund managers, sovereign investment organizations (PIF/Sanabil, SVC), corporate VC arms, and angel syndicates deploying capital in the Kingdom of Saudi Arabia.
              </p>

              {/* Verified Intelligence Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
                <div className="p-3.5 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                  <div className="text-2xl font-black font-heading text-[#111827]">{totalFunds}</div>
                  <div className="text-xs font-medium text-[#4B5563]">Institutional Funds Tracked</div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#E8F5EF] border border-[#0B6E4F]/30 shadow-xs">
                  <div className="text-2xl font-black font-heading text-[#0B6E4F]">{cmaAuthorizedCount}</div>
                  <div className="text-xs font-medium text-[#0B6E4F] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#0B6E4F]" />
                    <span>CMA Authorized Managers</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FDF8EC] border border-[#C9A227]/40 shadow-xs">
                  <div className="text-2xl font-black font-heading text-[#9A7B1C]">{svcPartnerCount}</div>
                  <div className="text-xs font-medium text-[#9A7B1C] flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-[#C9A227]" />
                    <span>SVC Partner Funds</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#E6FAF7] border border-[#19B5A3]/40 shadow-xs">
                  <div className="text-2xl font-black font-heading text-[#0E7A6E]">{activeInvestingCount}</div>
                  <div className="text-xs font-medium text-[#0E7A6E] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#19B5A3]" />
                    <span>Active Capital Mandates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Directory Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <FundingDirectory
            initialInvestors={investors}
            initialQuery={query}
            initialType={typeFilter || 'ALL'}
            initialStage={stageFilter}
            initialSector={sectorFilter}
            initialCmaOnly={cmaOnly}
            initialSvcOnly={svcOnly}
            initialActiveOnly={activeOnly}
          />
        </div>

        {/* 3. Investor Onboarding Callout (Deep Midnight Luxury Base) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-[#0A1F2C] text-white rounded-lg border border-[#1E3A4C] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19B5A3]">
                For Fund Managers &amp; General Partners
              </span>
              <h2 className="text-2xl font-heading font-bold text-white">
                Deploying venture capital in the Kingdom?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Update your fund mandate, typical ticket sizes, and sovereign pillar focus. Connect with verified Saudi tech founders building scalable software, sovereign AI, and deep tech.
              </p>
            </div>
            <Link
              href="/newsletter"
              className="px-6 py-3 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white font-semibold text-xs tracking-wider uppercase transition-all whitespace-nowrap shadow-sm shrink-0"
            >
              Request Mandate Verification →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
